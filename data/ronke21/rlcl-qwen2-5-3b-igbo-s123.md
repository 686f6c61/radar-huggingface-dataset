# ronke21/rlcl-Qwen2.5-3B-igbo-s123

## Resumen

El modelo `rlcl-Qwen2.5-3B-igbo-s123` es un ajuste fino (fine-tuning) del modelo base Qwen2.5-3B de Alibaba, publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`, `igbo`), se trata de un experimento de investigación centrado en el olvido catastrófico (catastrophic forgetting) durante el ajuste fino, probablemente aplicando alguna variante de regularización o de aprendizaje continuo (RLCL) sobre datos en idioma igbo. Los pesos resultantes son el resultado de fusionar un adaptador LoRA en el modelo base, por lo que la arquitectura subyacente es la de Qwen2.5-3B sin modificaciones estructurales.

El modelo tiene 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) y un tamaño de repositorio de 6,2 GB en formato safetensors, coherente con pesos en precisión de 16 bits. Está etiquetado para `text-generation`, es compatible con `transformers` y con `text-generation-inference`, y su acceso está restringido (gated), lo que exige aceptar condiciones en la plataforma antes de poder descargarlo. El repositorio no incluye información sobre licencia, idiomas soportados ni resultados de evaluación.

La relevancia de este modelo es limitada y fundamentalmente académica: se publica como artefacto de un estudio sobre olvido de capacidades al especializar un modelo multilingüe en un idioma de bajos recursos como el igbo, con cero descargas y cero valoraciones en el momento de redactar esta ficha. No debe considerarse un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-3B soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible (el nombre sugiere igbo; el modelo base es multilingue, pero no se documenta el alcance real tras el ajuste) |
| Licencia | No disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-3B: un transformer decoder-only con atención completa, normalización RMSNorm, activación SwiGLU y embeddings ligados (tied embeddings) entre entrada y salida. El ajuste fino se realizó con LoRA y posteriormente se fusionaron los pesos del adaptador en el modelo base (`lora-merged`), de modo que el checkpoint final contiene los 3,09 mil millones de parámetros en un único conjunto de pesos densos, sin adaptadores separados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni los hiperparámetros del ajuste. Los tags `rlcl` y `forgetting` apuntan a una metodología de aprendizaje continuo orientada a mitigar el olvido catastrófico al especializar el modelo en igbo, y el sufijo `s123` podría indicar una semilla o una configuración experimental concreta, pero no hay documentación que lo confirme. No se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-3B.
- Especialización presumible en igbo, según el nombre del repositorio; no verificada ni documentada.
- Razonamiento y matemáticas básicas: capacidades del modelo base, potencialmente degradadas por el ajuste (el tag `forgetting` sugiere precisamente ese riesgo).
- Generación de código: capacidad del modelo base, sin garantías tras el ajuste.
- Soporte de tool calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el ajuste en igbo puede haber reducido el rendimiento en otros idiomas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto reproducible para estudiar cómo un ajuste fino en un idioma de bajos recursos afecta a las capacidades generales del modelo base. Es su uso principal y el único claramente justificado por los metadatos.
- Experimentos de NLP en igbo: generación y evaluación de texto en igbo con un modelo de 3B parámetros, útil en entornos con recursos limitados de GPU.
- Comparación de metodologías de ajuste: confrontar los resultados de este checkpoint (con `rlcl`) frente a un ajuste fino estándar sobre el mismo modelo base y el mismo corpus.
- Reproducción de experimentos académicos: al estar fusionado en safetensors y ser compatible con `transformers` y `text-generation-inference`, se puede cargar directamente para replicar evaluaciones.
- Prototipado de bajo coste en local: con 3B parámetros, cabe en GPU de consumo para pruebas exploratorias de generación de texto, sin expectativas de calidad en producción.
- Evaluación de degradación multilingüe: medir la pérdida de rendimiento en inglés u otros idiomas tras la especialización, como parte de un estudio más amplio sobre transferencia y olvido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,5-4 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2-2,5 GB de pesos (requiere cuantizar manualmente, ya que no se publican versiones GGUF).
- GPU recomendadas para fp16: NVIDIA A100, H100, L40S o RTX 4090; también válidas RTX 3090 y A6000.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y, con cuantización, en GPUs de 8 GB como RTX 3070 o RTX 4060 Ti.
- Opciones de despliegue: `transformers` (nativo), `text-generation-inference` (etiquetado como compatible con endpoints), y `vLLM` o `llama.cpp` previa conversión a los formatos correspondientes.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-3B-igbo-s123 | 3,09 B | No disponible | No disponible | Gated en HF | Ajuste experimental en igbo, sin benchmarks |
| Qwen/Qwen2.5-3B | 3,09 B | 32.768 tokens | Apache 2.0 (segun el modelo base) | Publico en HF | Modelo base, multilingue, con evaluaciones publicadas |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 (segun el modelo base) | Publico en HF | Variante instruida del base, con benchmarks oficiales |
| Modelos especializados en igbo de 3B | No disponible | No disponible | No disponible | No disponible | No se identifican alternativas comparables en la informacion disponible |

## Limitaciones y advertencias

- El tag `forgetting` indica que el ajuste puede haber degradado capacidades del modelo base en otros idiomas y tareas; no hay evaluación que cuantifique esa pérdida.
- Riesgo elevado de alucinación, especialmente fuera del dominio de entrenamiento; no hay datos de evaluación que lo acoten.
- No se documenta la licencia, lo que impide determinar si el uso comercial está permitido; el acceso restringido añade una condición adicional que debe aceptarse.
- El modelo base Qwen2.5-3B tiene licencia Apache 2.0 según su propia ficha, pero este checkpoint no declara licencia propia y no se garantiza su conformidad.
- Idiomas soportados no documentados; la especialización en igbo puede reducir el rendimiento en castellano, inglés u otros idiomas.
- Sin benchmarks, sin model card detallada y con cero descargas: no hay evidencia de calidad ni de reproducibilidad.
- No se publican cuantizaciones GGUF ni versiones optimizadas; el despliegue en producción requeriría trabajo adicional de conversión y validación.
- No apto para producción sin una evaluación propia exhaustiva en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-3B-igbo-s123
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
