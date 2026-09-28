# davidheineman/opd-teacher-Q2.5I-LinkBeads-step149

## Resumen

opd-teacher-Q2.5I-LinkBeads-step149 es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct desarrollado por davidheineman, entrenado con GRPO durante 150 actualizaciones sobre el entorno `LinkBeads` a dificultad 0. No es un modelo de propósito general: se trata de un *teacher* (profesor) diseñado específicamente para un experimento de destilación on-policy con 32 entornos, en el que su función principal es emitir distribuciones de logits densas sobre trayectorias generadas por un modelo *student*.

El modelo conserva la arquitectura del base —un transformer decoder-only de tipo Qwen2 con 1.543.714.304 parámetros (aproximadamente 1,54 B) en safetensors— y se publica bajo licencia Apache 2.0. El repositorio ocupa 3,1 GB, lo que corresponde a pesos en precisión fp16/bf16 sin versiones cuantizadas empaquetadas.

Su relevancia es acotada pero concreta: documenta un flujo de trabajo reproducible de RL con recompensas verificables (RLVE) y destilación on-policy, con el checkpoint final (`step149`, índice basado en cero que corresponde a la actualización número 150) convertido desde el formato nativo de entrenamiento a safetensors y validado contra los nombres y formas de tensor del modelo base. Con 0 descargas y 0 *likes* en el momento de la consulta, es un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (aprox. 1,54 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos y hasta 131.072 con escalado RoPE (no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible: el repositorio solo contiene safetensors sin versiones cuantizadas publicadas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tamano del repositorio | 3,1 GB |
| Fecha de creacion | 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con atención causal, normalización RMSNorm y atención con consultas agrupadas (GQA), propia de la familia Qwen2. El checkpoint no introduce cambios estructurales; de hecho, la model card indica que los pesos se convirtieron desde el checkpoint nativo final a safetensors y se validaron contra los nombres y formas de tensor del modelo base, por lo que la topología es idéntica a la de Qwen2.5-1.5B-Instruct.

El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) durante 150 actualizaciones en el entorno `LinkBeads` con dificultad 0, dentro del marco RLVE. El objetivo del experimento es de destilación on-policy con 32 entornos: este checkpoint actúa como profesor especializado en `LinkBeads`, aportando señal supervisora densa sobre las trayectorias que genera el alumno. Se dispone de la ejecución de W&B (`c8dff4d9`, grupo de barrido `opd-teachers-20260927-191939`) como registro del entrenamiento. No se detalla en la información disponible el volumen de tokens, la composición del dataset ni si hubo fases adicionales de RLHF o DPO más allá del propio GRPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-1.5B-Instruct (pipeline `text-generation`, etiqueta `conversational`).
- Emisión de distribuciones de logits sobre trayectorias propias y ajenas, que es su función principal como modelo profesor en destilación on-policy.
- Ejecución especializada del entorno `LinkBeads` a dificultad 0, tras el ajuste con GRPO.
- Compatible con inferencia estándar de `transformers` y con Text Generation Inference (etiquetas `text-generation-inference` y `endpoints_compatible`).
- No hay evidencia en la información disponible de soporte de *tool calling*, *function calling*, razonamiento multi-paso genérico, visión, audio ni modo de razonamiento explícito (*thinking mode*).
- Capacidad multilingüe: únicamente inglés declarado; el rendimiento en otros idiomas no está documentado.

## Casos de uso

- Destilación on-policy como profesor: generar distribuciones de logits sobre trayectorias producidas por un alumno y minimizar la KL entre ambas distribuciones, que es el propósito declarado del checkpoint dentro del experimento de 32 entornos.
- Reproducción de experimentos RLVE/GRPO: servir como referencia para replicar el pipeline de entrenamiento publicado en el repositorio `davidheineman/rlve` y comparar curvas de recompensa en `LinkBeads`.
- Generación de datos sintéticos de trayectorias en `LinkBeads`: muestrear rollouts especializados para construir datasets de supervisión o para análisis cualitativo del comportamiento adquirido.
- Estudio de olvido catastrófico y especialización: comparar este checkpoint con Qwen2.5-1.5B-Instruct en tareas generales para medir cuánto se degrada el comportamiento generalista tras 150 actualizaciones de GRPO en un único entorno.
- Ablación de checkpoints intermedios: dado que el nombre del artefacto codifica el paso (`step149`), sirve como punto final de una serie temporal de checkpoints para estudiar la evolución del ajuste.
- Prototipado en hardware de consumo: con 3,1 GB de pesos en el repositorio, cabe en GPUs de gama media para pruebas de inferencia local y desarrollo de scripts de destilación sin necesidad de clúster.
- Evaluación de sensibilidad al profesor en pipelines de OPD: usar este teacher frente a otros profesores del mismo barrido para medir el impacto de la calidad del profesor en el alumno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe el procedimiento de entrenamiento (150 actualizaciones con GRPO sobre `LinkBeads`, dificultad 0) y no incluye métricas de MMLU, HumanEval, GSM8K, recompensa media del entorno ni comparaciones cuantitativas con otros checkpoints. La ejecución de W&B enlazada podría contener las curvas de entrenamiento, pero sus datos no forman parte de la información proporcionada.

## Requisitos de hardware

- Pesos en fp16/bf16: aproximadamente 3,1 GB, coherente con el tamaño del repositorio (1,54 B de parámetros).
- VRAM estimada para inferencia: del orden de 4 a 6 GB en fp16 contando pesos, caché KV y activaciones para contextos moderados; el consumo crece con la longitud de contexto.
- Cuantización: no hay GGUF, AWQ ni GPTQ publicados. Sería necesario convertir los safetensors a esos formatos por cuenta propia; en Q4 el peso se reduciría a aproximadamente 1 GB, aunque ese dato no está verificado para este checkpoint.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, L4, A10). Para destilación on-policy con lotes grandes y cálculo de logits, se recomiendan A100 o H100 por ancho de banda y capacidad de VRAM.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en fp16, y en GPUs de 4 a 6 GB si se cuantiza a 8 bits o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta explícita en el repositorio) y vLLM como alternativa compatible con pesos safetensors de Qwen2. Para llama.cpp u Ollama haría falta una conversión previa a GGUF que no está publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| opd-teacher-Q2.5I-LinkBeads-step149 | 1,54 B | no especificado (base: 32.768 nativos) | Apache 2.0 | Safetensors, 0 descargas | no disponible |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Safetensors, GGUF, muy desplegado | no disponible en esta ficha |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 | Licencia comunitaria Llama 3.2 | Safetensors, GGUF | no disponible en esta ficha |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 | Apache 2.0 | Safetensors, GGUF | no disponible en esta ficha |

La comparación relevante es contra su propio modelo base: este checkpoint está especializado en un único entorno mediante GRPO, mientras que Qwen2.5-1.5B-Instruct es un asistente generalista con ecosistema de cuantizaciones y despliegue ampliamente soportado. Los otros dos modelos se incluyen como alternativas de tamaño similar en la categoría de modelos pequeños instruidos, pero no hay datos de benchmarks en la información proporcionada que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Especialización extrema: el entrenamiento se limita a un único entorno (`LinkBeads`, dificultad 0) durante 150 pasos, por lo que es esperable una pérdida de capacidades generalistas respecto al modelo base. No se han publicado evaluaciones que cuantifiquen esa degradación.
- No está pensado como asistente de uso directo: su propósito declarado es actuar como profesor en un experimento de destilación on-policy, no atender consultas de usuario final.
- Idiomas: solo se declara inglés. El comportamiento en castellano u otros idiomas no está evaluado ni garantizado.
- Riesgo de alucinación: inherente a los modelos de 1,5 B de parámetros y a los ajustes con RL sobre entornos verificables, donde la política puede sobreajustarse a patrones del entorno de entrenamiento.
- Sesgos: no se documenta ningún análisis de sesgos. Al derivar de Qwen2.5-1.5B-Instruct, hereda los sesgos presentes en los datos de entrenamiento de ese modelo, que no se detallan en esta ficha.
- Contexto: la model card no especifica la longitud de contexto efectiva tras el ajuste; conviene verificar experimentalmente si el modelo mantiene el rendimiento del base a 32.768 tokens.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio incluye además el archivo `LICENSE` original de Qwen. Conviene revisar ambas condiciones antes de un uso comercial.
- Madurez: 0 descargas y 0 *likes* en el momento de la consulta, sin validación independiente por parte de la comunidad ni resultados de terceros.
- Producción: la ausencia de cuantizaciones oficiales (GGUF, AWQ, GPTQ) obliga a generar los formatos cuantizados por cuenta propia si se necesita reducir VRAM o latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-LinkBeads-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Ejecución de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/c8dff4d9
- Codigo de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Paper Self-OPD: On-Policy Distillation for Flow Matching Models without Teacher: https://arxiv.org/abs/2608.26872
- Paper Learning beyond Teacher: Generalized On-Policy Distillation: https://arxiv.org/abs/2602.12125
