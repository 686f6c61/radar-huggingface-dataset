# queuedog/LFM2.5-24B-A2B-oQ4e

## Resumen

LFM2.5-24B-A2B-oQ4e es una cuantización mixta de precisión del modelo LFM2.5-24B-A2B, publicada por el usuario queuedog en Hugging Face. El checkpoint conserva la arquitectura original `lfm2_moe` (un transformer con mezcla de expertos) pero redistribuye los pesos en distintos formatos de almacenamiento para reducir el tamaño total a 13,999 GB. El nombre "A2B" sugiere aproximadamente 2 mil millones de parámetros activos por token sobre un total de 23.972 mil millones, aunque este dato no se confirma explícitamente en la información disponible.

La relevancia de esta ficha es doble: por un lado, documenta un proceso de cuantización mixta mediante la herramienta oQ (oMLX v0.7.3), que asigna 4 bits a la mayoría de los pesos (95,743 %) y 8 bits a una fracción pequeña (4,234 %), logrando un promedio efectivo de 4,672 bits por peso; por otro, sirve como ejemplo de publicación derivada de un modelo base del que no se aportan datos de entrenamiento, licencia ni idiomas.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado el 16 de noviembre de 2026 y está etiquetado para su uso con la librería MLX (Apple Silicon). No se dispone de información sobre el modelo original, su licencia ni sus capacidades más allá de lo que revela la arquitectura y el proceso de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `lfm2_moe` (transformer con mezcla de expertos) |
| Parametros totales | 23.971.587.712 (23,972 B) |
| Parametros activos | no disponible (el sufijo "A2B" sugiere ~2 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 4-bit grupo 64 (95,743 %), afín 8-bit grupo 64 (4,234 %), BF16 (0,022 %), FP32 (0,000 %); promedio 4,672 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El checkpoint deriva de un modelo con arquitectura `lfm2_moe`, es decir, un transformer con capas de mezcla de expertos. El identificador "24B-A2B" indica un total de 23,972 mil millones de parámetros lógicos, de los cuales una fracción reducida se activaría por token (presumiblemente en torno a 2 mil millones, aunque no se confirma). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento.

La innovación técnica documentada es el esquema de cuantización mixta aplicado con oQ (oMLX v0.7.3). El 95,743 % de los pesos lógicos (22,951 B) se almacena en afín 4-bit con grupo 64, lo que ocupa 12,023 GiB; el 4,234 % (1,015 B) se mantiene en afín 8-bit grupo 64 (1,004 GiB); y una fracción residual de 0,005 B permanece en BF16. El resultado es un checkpoint de 13,038 GiB con un promedio de 4,672 bits por peso, lo que permite ejecutar un modelo de ~24 B en hardware con ~14 GB de memoria unificada o VRAM.

## Capacidades

- Generación de texto y razonamiento: capacidades inferidas de la arquitectura transformer, no verificadas en la información disponible.
- Mezcla de expertos: el modelo activa solo una fracción de parámetros por token, lo que reduce el coste computacional en inferencia.
- Ejecución en Apple Silicon: al estar empaquetado para MLX, está pensado para su uso en chips M-series con memoria unificada.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 13,038 GiB cabe en equipos Apple Silicon con 16 GB o más de memoria unificada, lo que permite ejecutar un modelo de ~24 B en local sin GPU dedicada.
- Prototipado de aplicaciones con MLX: al estar en formato MLX, se integra directamente en el ecosistema de Apple para experimentación rápida en portátiles y estaciones de trabajo Mac.
- Evaluación de técnicas de cuantización mixta: sirve como referencia para comparar el impacto de un esquema 4/8-bit mixto frente a cuantizaciones uniformes de 4 bits en modelos MoE.
- Despliegue en entornos con VRAM limitada: los ~14 GB de almacenamiento permiten su carga en GPUs consumer de gama alta (por ejemplo, 16 GB) mediante conversión a otros formatos, si bien el repositorio solo publica pesos MLX.
- Investigación sobre modelos MoE de ~24 B: útil para estudiar el comportamiento de la mezcla de expertos en tareas de generación de texto, siempre que se disponga del modelo base para comparar.
- Distribución eficiente de checkpoints: el esquema de cuantización mixta reduce el tamaño del repositorio a 14,0 GB frente a los ~48 GB que ocuparía el modelo en BF16, lo que facilita su descarga y almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: ~13,04 GiB de pesos en el formato publicado; el uso real añade overhead de activaciones y caché KV, por lo que se recomienda al menos 16 GB de memoria unificada o VRAM.
- GPU recomendadas: no disponible (el repositorio está orientado a MLX, es decir, Apple Silicon). Para GPUs NVIDIA sería necesaria una conversión a otro formato.
- ¿Cabe en GPU consumer? En Apple Silicon con 16 GB o más de memoria unificada, sí. En GPUs consumer de 16 GB (por ejemplo, RTX 4080/5070 Ti) requeriría conversión de formato y validación del esquema de cuantización.
- Opciones de despliegue: MLX (librería nativa del repositorio). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B-oQ4e | 23,972 B | no disponible (~2 B por el sufijo) | no disponible | no disponible | safetensors MLX (4,672 bits/peso) | Hugging Face, 0 descargas |
| Modelo base LFM2.5-24B-A2B | 23,972 B | no disponible | no disponible | no disponible | no disponible | no disponible en la información |
| Alternativas MoE ~24 B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en producción.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Cuantización agresiva: el promedio de 4,672 bits/peso puede degradar la calidad frente al modelo en BF16, especialmente en el 95,743 % de pesos en 4 bits; no se aportan evaluaciones de pérdida de calidad.
- Formato exclusivo MLX: no se publican pesos GGUF ni safetensors estándar para GPUs NVIDIA, lo que limita su uso fuera del ecosistema Apple.
- Idiomas no documentados: se desconoce el soporte multilingüe real.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos: no disponibles; al no conocerse el dataset de entrenamiento, no se pueden evaluar sesgos conocidos.
- Ausencia de benchmarks: no hay evidencia publicada del rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.).
- Contexto desconocido: se desconoce la longitud máxima de contexto, lo que impide planificar casos de uso con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/queuedog/LFM2.5-24B-A2B-oQ4e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
