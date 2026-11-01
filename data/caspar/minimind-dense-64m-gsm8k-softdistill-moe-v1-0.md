# caspar/MiniMind-Dense-64M-GSM8K-SoftDistill-MoE-v1.0

## Resumen

MiniMind-Dense-64M-GSM8K-SoftDistill-MoE-v1.0 es un modelo experimental de generación de texto creado por el usuario caspar y publicado en HuggingFace. Se trata de un modelo denso de solo 64 millones de parámetros (63.912.192 según los metadatos de safetensors) entrenado mediante destilación de conocimiento suave (soft knowledge distillation) a partir de un profesor MoE más grande, `caspar/MiniMind-MoE-198M-A64M-Mixed-SFT-v1.0`, hacia un estudiante denso previamente ajustado con SFT, `caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0`.

El objetivo del proyecto es mejorar el rendimiento del estudiante en el conjunto de datos GSM8K, un benchmark de problemas matemáticos de razonamiento en lenguaje natural. El entrenamiento se realizó exclusivamente con el subconjunto de entrenamiento oficial de GSM8K (6.851 conversaciones, 845.130 tokens objetivo por época), usando una pérdida combinada de cross-entropy y divergencia KL forward sobre softmax completo del profesor, con temperatura 1.5.

Es importante subrayar que el propio autor advierte en la model card que se trata de un modelo experimental de tamaño muy reducido y que las métricas reportadas no implican capacidad fiable de razonamiento matemático: la precisión en GSM8K test es inferior al 2 %, por lo que su valor principal es didáctico y de investigación sobre técnicas de destilación, no productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (MiniMind), decodificador causal |
| Parametros totales | 63.912.192 |
| Parametros activos | no disponible (el estudiante es denso; el profesor MoE no se distribuye) |
| Longitud de contexto | 340 tokens (ventanas de entrenamiento y evaluación) |
| Tipos de cuantizacion | Exportado en FP16 (entrenado en BF16 con optimizador FP32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (datos GSM8K conservan términos MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia MiniMind, derivado de un fine-tuning completo (full-parameter) del estudiante `caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0`. La innovación central es la destilación suave desde un profesor MoE de 198M parámetros (64M activos, según el nombre), usando la pérdida `loss = 0.5 * CE + 0.5 * T^2 * KL(teacher || student)` con temperatura 1.5, forward KL sobre softmax completo y profesor congelado. Ambos modelos comparten un tokenizador idéntico de 6.400 tokens.

El entrenamiento usó únicamente el subconjunto de entrenamiento oficial de GSM8K, tokenizado en ventanas de 340 tokens con stride 256, máscaras de prompt/padding y objetivos desplazados solo del asistente. Se ejecutaron 3 épocas (345 actualizaciones de optimizador) con microbatch 16 y acumulación 4, AdamW con LR coseno de 5e-6 a 5e-7, weight decay 0.01, gradient clip 1 y semilla 42, sobre una GPU A40 en BF16. Los pesos publicados están exportados en FP16. Los bloques `<think>` vacíos se eliminan tanto en entrenamiento como en inferencia.

## Capacidades

- Generación de texto conversacional en inglés (pipeline text-generation con chat template).
- Resolución paso a paso de problemas matemáticos simples en formato GSM8K, terminando con `####` seguido del número final, aunque con precisión muy baja (~1 %).
- Razonamiento matemático extremadamente limitado, adecuado solo para experimentación.
- No hay información disponible sobre tool calling, agentes, capacidades multilingües, visión o audio.
- Requiere `trust_remote_code=True` al cargar, ya que incluye código de modelado MiniMind personalizado.

## Casos de uso

- Investigación en destilación de conocimiento: sirve como réplica reproducible de un experimento de destilación suave dense-from-MoE, con hiperparámetros, métricas y generaciones publicados en `settings.json` y `metrics.jsonl`.
- Docencia y formación: ideal como ejemplo práctico en cursos sobre cómo se entrena un pequeño modelo con pérdida KL combinada con cross-entropy y temperatura.
- Benchmarking de pipelines de evaluación GSM8K: el repositorio incluye la configuración exacta de evaluación (zero-shot greedy, 256 tokens nuevos, contexto total 340), útil para validar infraestructuras de evaluación.
- Pruebas de despliegue en hardware mínimo: con 64M de parámetros, permite probar stacks de inferencia (transformers, llama.cpp tras conversión, etc.) en CPU o GPUs muy modestas.
- Experimentos de fine-tuning posterior: al ser un modelo base pequeño y con licencia permisiva, es un punto de partida barato para pruebas de LoRA o SFT adicionales.
- Estudio de tokenizadores reducidos: usa un tokenizador de solo 6.400 tokens, lo que lo hace interesante para investigar efectos de vocabularios mínimos en tareas de razonamiento.

## Benchmarks y rendimiento

Resultados oficiales publicados por el autor sobre los 1.319 ejemplos del split test de GSM8K (evaluación zero-shot greedy, sin ajuste sobre test):

| Modelo | Respuesta estricta #### | Fallback último número |
|---|---:|---:|
| Estudiante denso original | 13/1319 (0,99 %) | 20/1319 (1,52 %) |
| Estudiante destilado (este modelo) | 12/1319 (0,91 %) | 21/1319 (1,59 %) |

Métricas adicionales de entrenamiento:
- CE en tokens de asistente en test: 1,000488 → 0,933341.
- KL respecto al profesor a T=1.5: 0,593376 → 0,455591.

No hay datos de MMLU, HumanEval ni otros benchmarks. Nótese que la destilación no mejoró la precisión estricta en GSM8K test, aunque sí redujo la CE y la KL respecto al profesor.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP16 (0,1 GB de repositorio); el modelo funciona incluso en CPU.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento original se hizo en una NVIDIA A40, pero para inferencia basta una GPU de consumo o directamente CPU.
- Cabe con holgura en GPUs de consumo (RTX 3060, RTX 4090, e incluso integradas) dado su tamaño mínimo.
- Despliegue: transformers (versión 4.57.6, torch>=2.6,<3) con `trust_remote_code=True`; no hay información disponible sobre soporte oficial en vLLM, llama.cpp, Ollama o TGI, aunque la conversión a GGUF sería factible por su tamaño.
- Latencia y throughput: no disponibles; por su tamaño se espera inferencia muy rápida incluso sin GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K test | Licencia |
|---|---|---|---|---|
| MiniMind-Dense-64M-GSM8K-SoftDistill (este) | 64M (denso) | 340 tokens | 0,91 % estricto | Apache-2.0 |
| MiniMind-Dense-64M-Mixed-SFT-v1.0 (base) | 64M (denso) | 340 tokens | 0,99 % estricto | Apache-2.0 |
| MiniMind-MoE-198M-A64M-Mixed-SFT-v1.0 (profesor) | 198M / 64M activos (MoE) | no disponible | no disponible | Apache-2.0 |

No se dispone de resultados del profesor en GSM8K test publicados en la model card, por lo que la comparación de rendimiento se limita a los datos del estudiante antes y después de la destilación.

## Limitaciones y advertencias

- Precisión extremadamente baja en GSM8K test (~1 %): el autor advierte explícitamente que las métricas no implican razonamiento matemático fiable. No apto para producción en tareas de razonamiento.
- Contexto muy reducido (340 tokens), insuficiente para conversaciones largas o documentos extensos.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Las ventanas de continuación pueden no contener la pregunta completa, un artefacto del particionado en ventanas durante el entrenamiento.
- No hay garantía de descontaminación (decontamination) a nivel de paráfrasis o de preentrenamiento previo respecto al conjunto de test.
- Requiere `trust_remote_code=True` por usar código de modelado personalizado, lo que implica revisar el código antes de ejecutarlo en entornos sensibles.
- Requiere versiones concretas de dependencias (transformers==4.57.6, torch>=2.6,<3) y un preprocesado del prompt (eliminación de bloques `<think>` vacíos) que debe replicarse manualmente.
- Sesgos conocidos: no disponible.
- Restricciones de licencia para uso comercial: Apache-2.0 permite uso comercial; los datos GSM8K conservan términos MIT.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caspar/MiniMind-Dense-64M-GSM8K-SoftDistill-MoE-v1.0
- Modelo base (estudiante): https://huggingface.co/caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0
- Profesor de destilación: https://huggingface.co/caspar/MiniMind-MoE-198M-A64M-Mixed-SFT-v1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/caspar/MiniMind-Mixed-SFT-Training-v1.0
- Paper, blog o repositorio adicional: no disponible
