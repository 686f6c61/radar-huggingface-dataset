# Jeesup/svd-safety-l2_kfacmixsep48_r50

## Resumen

`svd-safety-l2_kfacmixsep48_r50` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD con blanqueado K-FAC agrupado (pooled K-FAC whitened SVD) hasta retener el 50,0% de los parámetros densos, seguida de una recuperación con LoRA de segunda etapa del método SVD-LLM. Lo publica el usuario Jeesup como artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. No es un modelo conversacional de propósito general.

El interés técnico reside en que la calibración combina utilidad y seguridad en un único estimador K-FAC: 255 ventanas de 2048 tokens de WikiText-2 train junto con 48 objetivos de JailbreakBench emparejados con los rechazos propios de Llama-2-7b-chat. El resultado es una matriz de Fisher aproximada (F = A ⊗ G) que guía la selección de rangos por matriz, con un presupuesto de rango por matriz al estilo SVD-LLM.

El checkpoint es una celda de una rejilla sobre reglas de selección y presupuestos de compresión, con semilla 42 y una fracción de parámetros resultante de 0,4999. El autor advierte explícitamente de que varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base y de que cualquier celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante SVD con blanqueado K-FAC y recuperado con LoRA de etapa 2 |
| Parámetros totales | 6.738.415.616 (fracción 0,4999 respecto al denso) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama-2-7b-chat soporta 4096 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (el modelo base está optimizado para inglés) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 2 con 7B parámetros en su versión chat. Sobre ese checkpoint se aplica una descomposición SVD por matriz con métrica de blanqueado K-FAC agrupada: se estima una Fisher aproximada F = A ⊗ G sobre un conjunto de calibración único que mezcla datos de utilidad y de seguridad. La parte de utilidad son 255 ventanas de 2048 tokens muestreadas de WikiText-2 train con el sampler de SVD-LLM (semilla 42) y pérdida en todas las posiciones. La parte de seguridad son 48 objetivos de JailbreakBench con los rechazos generados por el propio Llama-2-7b-chat, una conversación por muestra (12817 posiciones, 11584 tokens de respuesta), con la pérdida calculada únicamente sobre el rechazo. La G se obtiene por suma de tokens (NLL sumado dividido entre 2047), de modo que todos los tokens de pérdida pesan igual; la cuota efectiva de seguridad es 0,0217 de los tokens de pérdida y 0,0240 de las posiciones.

Tras eliminar el 50,00% de los parámetros según el presupuesto de rango por matriz de SVD-LLM, se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V) sobre alpaca-cleaned, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. El resultado es un checkpoint de 6.738.415.616 parámetros, es decir, una fracción de 0,4999 del denso original.

## Capacidades

- Generación de texto conversacional multi-turno heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en inglés, con la calidad reducida que implica retener solo el 50% de los parámetros.
- Comportamiento de rechazo ante peticiones dañinas, objeto central del estudio: la calibración incluye rechazos de JailbreakBench para intentar preservarlo bajo compresión.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo de razonamiento explícito (thinking), visión, audio ni otras modalidades.
- Capacidades multilingües: no disponibles en la información proporcionada; el modelo base está centrado en inglés.

## Casos de uso

- Investigación sobre compresión de modelos: servir como celda de referencia para medir la pérdida de utilidad y de seguridad al eliminar el 50% de parámetros con una regla de selección concreta.
- Estudio del compromiso seguridad-utilidad: comparar sus métricas (ASR en AdvBench y StrongREJECT, sobre-rechazo en WildGuard, perplejidad en WikiText-2) con otras celdas de la rejilla para aislar el efecto de la calibración mixta.
- Evaluación de métodos de recuperación: analizar cuánto recupera la LoRA de etapa 2 de SVD-LLM tras la descomposición, con hiperparámetros fijos documentados (r=8, alpha=16, 2 épocas).
- Reproducibilidad de experimentos: la semilla 42, el sampler y la composición exacta del calibración permiten replicar el pipeline de compresión.
- Análisis de interpretabilidad de componentes: estudiar qué matrices y rangos concentran el comportamiento de rechazo cuando la selección se guía por una Fisher que incluye seguridad.
- Docencia y divulgación: ilustrar en un curso o artículo cómo se mide el ASR con jueces automáticos (HarmBench, WildGuard) sobre un checkpoint comprimido.
- No debe emplearse como asistente en producción ni como chatbot de atención al cliente: el propio autor lo desaconseja.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0288 |
| StrongREJECT ASR (juez HarmBench) | 0,0799 |
| Sobre-rechazo macro (WildGuard) | 0,3381 |
| Perplejidad en WikiText-2 | 11,9157 |
| Precisión media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4475 |

No se han publicado en la información disponible resultados comparativos frente a otras celdas de la rejilla ni frente al modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 13,5 GB de pesos, más overhead de activaciones y caché KV; cómodo en GPUs de 24 GB.
- En cuantización de 8 bits: aproximadamente 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100 para serving de alto throughput; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en precisión nativa.
- Cabe en GPU de consumo de 24 GB sin cuantizar; en 16 GB requeriría cuantización de 8 bits o inferior.
- Opciones de despliegue: transformers, text-generation-inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l2_kfacmixsep48_r50 | 6,74B (50% del denso) | no disponible | Llama 2 Community | Hugging Face, safetensors | Checkpoint de investigación, seguridad degradada según el autor |
| meta-llama/Llama-2-7b-chat-hf | 6,74B | 4096 | Llama 2 Community | Hugging Face | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otros checkpoints de la rejilla del mismo autor | ~6,74B | no disponible | Llama 2 Community | Hugging Face | Distintas reglas de selección y presupuestos; no se detallan en la información disponible |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte de que varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y de que la compresión por sí sola eleva la tasa de éxito de ataques; este checkpoint debe evaluarse antes de extraer conclusiones.
- No es un modelo de propósito general ni un asistente desplegable; es un artefacto experimental.
- Riesgo de alucinación y de pérdida de coherencia por la eliminación del 50% de parámetros y la recuperación limitada con LoRA (r=8, 2 épocas).
- La calibración de seguridad se basa en solo 48 objetivos de JailbreakBench con rechazos del propio modelo base, lo que puede no cubrir la diversidad de ataques reales.
- La cuota efectiva de seguridad en la pérdida es muy baja (0,0217 de los tokens), lo que limita cuánto puede preservarse el comportamiento de rechazo.
- Idiomas: no se documenta soporte multilingüe; el modelo base está orientado al inglés.
- Licencia Llama 2 Community: restricciones de uso comercial y de redistribución según `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; cualquier uso derivado queda vinculado a esos términos.
- Sin descargas ni likes en el momento de la consulta y sin resultados de benchmarks frente a alternativas, lo que dificulta la validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_kfacmixsep48_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Repositorio SVD-LLM (método de compresión y recuperación LoRA): no disponible en la información proporcionada
- Paper de SVD-LLM: no disponible en la información proporcionada
- JailbreakBench (conjunto de calibración de seguridad): no disponible en la información proporcionada
- HarmBench y WildGuard (jueces de evaluación): no disponible en la información proporcionada
- Licencia Llama 2: https://ai.meta.com/llama/license/
