# ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2

## Resumen

Este repositorio contiene un fine-tuning del modelo de generación de vídeo Wan2.1-T2V-1.3B de Wan-AI, publicado por el usuario ducvh5 bajo el identificador `wan21-a5b5x4c5-tf-fm-tm-ln2`. Se trata de un checkpoint experimental de text-to-video derivado del modelo base de 1.300 millones de parámetros, que sustituye el bloque transformer original por una arquitectura recurrente de 15 bloques únicos ejecutados 30 veces (patrón A5 → B5×4 → C5).

El modelo se distribuye en formato diffusers con pesos safetensors y un repositorio de 135,8 GB, lo que sugiere la inclusión de múltiples checkpoints intermedios (45 pesos EMA y no-EMA) además del estado de entrenamiento en `step0025500/state.pt`. La model card es extremadamente escueta y no documenta licencia, idiomas, dataset ni resultados de evaluación.

La relevancia de esta ficha es limitada: se trata de un experimento de investigación sin métricas publicadas, sin licencia declarada y con cero descargas en el momento de la consulta. Resulta útil únicamente como referencia para quienes investiguen variantes recurrentes sobre Wan2.1 o quieran reproducir el esquema de entrenamiento descrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (recurrent-transformer) derivado de Wan2.1-T2V-1.3B; 15 bloques únicos, 30 ejecutados (A5 → B5×4 → C5) |
| Parametros totales | 1.300 millones (heredados del modelo base Wan2.1-T2V-1.3B; no se especifica el recuento exacto tras la modificación recurrente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato diffusers), más `state.pt` de entrenamiento |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B-Diffusers, un transformer de difusión para text-to-video. La modificación principal consiste en una arquitectura recurrente: en lugar de apilar bloques independientes, se definen 15 bloques únicos que se ejecutan 30 veces siguiendo el patrón A5 → B5×4 → C5 (cinco bloques del grupo A, cuatro repeticiones de cinco bloques del grupo B y cinco bloques del grupo C). Esta compartición de pesos reduce el número de parámetros únicos respecto a un transformer equivalente con 30 bloques distintos.

El entrenamiento emplea una combinación de pérdidas denotada como TF+FM+TM (los acrónimos no se explican en la model card). La parametrización de ruido usa σ ~ LN(0,1) con shift=2 y t=1000σ, un esquema de muestreo log-normal habitual en modelos de difusión. El dataset se identifica solo como "OV", sin más detalle. Se conservan 45 pesos EMA y no-EMA, y el último estado guardado corresponde al paso 25.500. No se documenta el número total de tokens, la composición del dataset ni si hubo RLHF, DPO o algún tipo de ajuste por preferencias.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), heredada del pipeline Wan2.1-T2V-1.3B.
- Ejecución recurrente de bloques con pesos compartidos, lo que reduce el coste de memoria de parámetros respecto a un transformer de 30 bloques independientes.
- Compatibilidad con la librería `diffusers` y el pipeline `text-to-video`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo es exclusivamente text-to-video.

## Casos de uso

- Investigación sobre arquitecturas recurrentes en difusión: el modelo permite estudiar cómo afecta la compartición de pesos (15 bloques únicos ejecutados 30 veces) a la calidad y al coste de entrenamiento en un transformer de vídeo de 1.300 M de parámetros.
- Reproducción de experimentos de fine-tuning sobre Wan2.1: al conservar 45 checkpoints EMA y no-EMA y el estado en `step0025500/state.pt`, sirve para analizar la evolución del entrenamiento paso a paso.
- Generación de clips cortos de vídeo a partir de prompts textuales en entornos de laboratorio, usando el pipeline `diffusers` estándar de Wan2.1-T2V-1.3B.
- Comparación de esquemas de ruido: la parametrización σ ~ LN(0,1) con shift=2 y t=1000σ permite contrastar el muestreo log-normal frente a alternativas uniformes en modelos de vídeo.
- Estudio de pérdidas combinadas TF+FM+TM: el checkpoint facilita aislar el efecto de esta combinación de objetivos en la calidad visual y la coherencia temporal.
- Base para ablaciones académicas sobre recurrencia: al ser un derivado directo del modelo base, se puede comparar contra Wan2.1-T2V-1.3B original en igualdad de condiciones de datos y hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, un transformer de difusión de 1.300 M de parámetros en fp16 requiere del orden de 3-4 GB solo para pesos, más activaciones y el VAE/encoder de texto del pipeline Wan2.1; en la práctica se recomienda al menos 12-16 GB para generar vídeo a resoluciones moderadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, cabría esperar funcionamiento en GPUs consumer de gama alta (RTX 3090, RTX 4090) y en GPUs de datacenter (A100, H100) para lotes mayores o mayor resolución.
- ¿Cabe en GPU consumer? Probablemente sí para inferencia en fp16 con el pipeline completo, aunque el repositorio de 135,8 GB requiere espacio en disco considerable para descargar todos los checkpoints.
- Opciones de despliegue: `diffusers` (librería declarada). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2 | 1.300 M (base) | no disponible | Text-to-video, transformer recurrente | no disponible | HuggingFace, 0 descargas |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.300 M | no disponible | Text-to-video, transformer de difusión | no disponible en esta ficha | HuggingFace (modelo base) |
| Otros modelos text-to-video de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación se limita al modelo base, ya que no se dispone de datos de rendimiento ni de especificaciones de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar el modelo base Wan2.1 antes de cualquier despliegue en producción.
- Sin resultados de benchmarks ni métricas de calidad: no hay evidencia publicada de que el fine-tuning recurrente mejore o mantenga la calidad del modelo base.
- Model card extremadamente escueta: los acrónimos TF+FM+TM, "OV" y el esquema A5 → B5×4 → C5 no se explican, lo que dificulta la reproducibilidad.
- Riesgo de alucinación visual y artefactos: inherente a los modelos de difusión de vídeo, agravado por la falta de evaluación.
- Idiomas no declarados: se desconoce si los prompts en castellano funcionan correctamente.
- Contexto no documentado: se desconoce la longitud máxima de prompt y la resolución/duración de vídeo soportadas.
- Repositorio de 135,8 GB: requiere almacenamiento considerable y no está pensado para descarga ligera.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- El estado `state.pt` y los checkpoints intermedios son material de entrenamiento, no necesariamente pesos listos para inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ducvh5/wan21-a5b5x4c5-tf-fm-tm-ln2
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Librería diffusers: https://github.com/huggingface/diffusers
