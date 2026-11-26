# GrillingWithJorge/Qwen3.5-4B-oQ4e-fp16-mtp

## Resumen

Qwen3.5-4B-oQ4e-fp16-mtp es una cuantizacion mixta del modelo Qwen3.5-4B, publicada por el usuario GrillingWithJorge en Hugging Face. El checkpoint ha sido generado con la herramienta oQ (oMLX v0.8.3), que aplica cuantizacion de precision mixta por tensor en lugar de una cuantizacion uniforme, asignando distintos niveles de bits (4, 5, 6 y 8) segun la sensibilidad de cada capa. El resultado es un peso efectivo medio de 6,833 bits por parametro sobre un total de 4.660 millones de parametros.

El modelo base Qwen3.5-4B pertenece a la familia Qwen3.5 de Alibaba, e incorpora componentes multimodales (un modulo de vision de 334 millones de parametros) y una cabeza MTP (multi-token prediction) de 121 millones de parametros. La presencia de MTP sugiere soporte para decodificacion especulativa interna, una tecnica orientada a mejorar el throughput de generacion. El checkpoint esta empaquetado en formato MLX, lo que lo hace directamente utilizable en hardware Apple Silicon.

La relevancia de esta publicacion es practica: ofrece una version compacta (3,98 GB en disco) de un modelo de 4B con capacidad de vision y prediccion multi-token, pensada para ejecucion local en Macs. No obstante, se trata de una cuantizacion de terceros sin model card detallada sobre el modelo base, sin licencia declarada y sin resultados de evaluacion publicados, por lo que su adopcion en produccion requiere validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5) con modulo de vision y cabeza MTP |
| Parametros totales | 4.659.865.088 (4,660B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4/5/6/8-bit grupo 64, FP16 y FP32 (media efectiva 6,833 bits/peso) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,206B | 2,555 GB / 2,380 GiB |
| Vision | 0,334B | 1,334 GB / 1,242 GiB |
| Cabeza MTP | 0,121B | 0,091 GB / 0,085 GiB |
| Total | 4,660B | 3,980 GB / 3,707 GiB |

Distribucion de bits por peso:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, grupo 64 | 2,805B | 60,194% | 1,469 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 1,478B | 31,711% | 0,946 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,029B | 0,622% | 0,022 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,001B | 0,014% | 0,001 GiB | 8,50 |
| FP16 | 0,014B | 0,302% | 0,026 GiB | 16,00 |
| FP32 | 0,334B | 7,157% | 1,242 GiB | 32,00 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B mas alla de lo que se deduce del checkpoint: se trata de un transformer con un modulo de vision separado (334 millones de parametros) y una cabeza de prediccion multi-token (121 millones de parametros). La cabeza MTP se emplea habitualmente para predecir varios tokens por paso y acelerar la decodificacion, aunque no se especifica en la model card como se explota en inferencia.

El proceso de cuantizacion aplicado por oQ (oMLX v0.8.3) es de precision mixta: la mayor parte de los pesos (60,2%) se almacena en affine 4-bit con grupo de 64, un 31,7% en 5-bit y el resto en 6-bit, 8-bit, FP16 y FP32. Destaca que el modulo de vision se mantiene integramente en FP32 (0,334B parametros, 1,242 GiB), lo que preserva la calidad de las representaciones visuales a costa de concentrar casi un tercio del almacenamiento total. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.5-4B.
- Procesamiento de vision: el checkpoint incluye un modulo visual de 334 millones de parametros en FP32, lo que indica soporte de entrada de imagenes.
- Prediccion multi-token (MTP): la cabeza dedicada permite, en principio, decodificacion especulativa para acelerar la generacion.
- Ejecucion local en Apple Silicon mediante la libreria MLX.
- Capacidades de tool calling, agentes y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac: el checkpoint de 3,98 GB cabe en la memoria unificada de un Mac con 16 GB o mas, lo que permite ejecutar un modelo de 4B con vision sin GPU dedicada mediante MLX.
- Prototipado de asistentes multimodales: el modulo de vision en FP32 permite experimentar con tareas de descripcion de imagenes y respuesta a preguntas visuales en un entorno de desarrollo local.
- Evaluacion de tecnicas de cuantizacion: la distribucion mixta de bits documentada lo convierte en un caso de estudio util para comparar calidad frente a cuantizaciones uniformes de 4-bit.
- Investigacion sobre decodificacion especulativa: la cabeza MTP incluida permite medir el impacto del multi-token prediction en latencia y throughput dentro del ecosistema MLX.
- Generacion de texto en aplicaciones de escritorio para macOS: al integrarse con MLX, puede embeberse en herramientas nativas sin dependencias de CUDA.
- Filtrado y resumen de documentos con imagenes: combinando el modulo de lenguaje y el de vision, es posible procesar capturas, graficos o PDFs renderizados en pipelines locales.
- Pruebas de concepto de agentes ligeros: un modelo de 4B con contexto gestionable en memoria unificada sirve para validar flujos de tool calling antes de escalar a modelos mayores (sujeto a confirmar que el modelo base soporte function calling).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 3,98 GB para los pesos en disco.
- Memoria: al ejecutarse con MLX sobre memoria unificada, se estima un consumo en torno a 4-6 GB considerando pesos y overhead de inferencia; no confirmado por el autor.
- GPU: disenado para Apple Silicon (series M1, M2, M3, M4); no es compatible de forma nativa con CUDA.
- Cabe en GPUs de consumo: si, en Macs con 16 GB de memoria unificada o superior; en GPUs NVIDIA consumer requeriria conversion a otro formato (GGUF, por ejemplo), no incluida en el repo.
- Opciones de despliegue: MLX y oMLX; vLLM, llama.cpp, Ollama y TGI no soportan directamente el formato MLX de este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-oQ4e-fp16-mtp (este) | 4,66B | no disponible | Si (334M en FP32) | no disponible | MLX safetensors |
| Qwen3.5-4B (base) | ~4,2B (LM) | no disponible | Si | no disponible | safetensors |
| Qwen2.5-VL-3B | ~3,75B | 32k (tipico en la familia) | Si | Apache 2.0 (familia Qwen2.5) | safetensors, GGUF |
| Llama 3.2 3B | 3,21B | 128k | No | Llama 3.2 Community License | safetensors, GGUF |

Nota: los datos de las filas comparativas corresponden a conocimiento general de esas familias; la informacion proporcionada no incluye comparaciones oficiales. El contexto y la licencia del modelo base Qwen3.5-4B no se declaran en la model card de esta cuantizacion.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo base ni de la cuantizacion, lo que impide confirmar si el uso comercial esta permitido.
- Cuantizacion de terceros: el checkpoint no lo publica el equipo de Qwen, sino un usuario independiente, sin proceso de validacion documentado.
- Perdida de calidad por cuantizacion: aunque la media es de 6,833 bits/peso, el 60% de los pesos esta en 4-bit, lo que puede degradar tareas sensibles frente al modelo original en FP16/BF16.
- Vision en FP32: el modulo visual concentra 1,242 GiB del total, lo que penaliza el tamano del checkpoint sin que se documente el motivo de mantenerlo sin cuantizar.
- Sin benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Idiomas no declarados: se desconoce el soporte multilingue real de esta version.
- Riesgo de alucinacion: inherente a modelos de 4B; sin evaluaciones no puede acotarse.
- Ecosistema limitado: el formato MLX restringe el despliegue a Apple Silicon salvo conversion manual.
- Contexto desconocido: no se indica la longitud de contexto soportada, dato critico para aplicaciones de documentos largos.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso comunitario ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/GrillingWithJorge/Qwen3.5-4B-oQ4e-fp16-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
