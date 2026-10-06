# d9beuD/Qwen3.8-Flash-Next-oQ5-mtp

## Resumen

Qwen3.8-Flash-Next-oQ5-mtp es una cuantizacion en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario d9beuD. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos con cuantizacion de precision mixta generada con la herramienta oQ (oMLX v0.7.0), orientada a ejecucion local en Apple Silicon. El checkpoint conserva el codificador de vision, la tabla de embeddings de n-gramas y la cabeza de prediccion multi-token (MTP) del modelo original, algo poco habitual en cuantizaciones publicadas.

El modelo base tiene 179.999.981.459 parametros (unos 180.000 millones) y el repositorio ocupa 128,6 GB, con un peso efectivo declarado de aproximadamente 5,71 bits por parametro y 129 GB de pesos. Esto lo situa en el rango de modelos que solo pueden ejecutarse en equipos con memoria unificada muy alta, como un Mac de 192 GB, y lo excluye de cualquier GPU de consumo.

Su relevancia es acotada pero clara: permite estudiar y desplegar localmente un modelo multimodal de gran escala bajo MLX manteniendo las cabezas auxiliares (MTP y n-gram) que habilitan decodificacion especulativa, sin depender de CUDA. La ficha se basa unicamente en la informacion publicada por el autor; no hay benchmarks, idiomas declarados ni detalles del entrenamiento original disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; tipo de modelo declarado "qwen4_exp" (modelo multimodal image-text-to-text con cabeza MTP y tabla de embeddings de n-gramas) |
| Parametros totales | 179.999.981.459 (aproximadamente 180.000 millones) |
| Parametros activos | No disponible (el autor no confirma si el modelo base es de tipo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizacion mixta MLX oQ nivel 5: 97,5 % de parametros a 5 bits, 1,6 % a 6 bits, 0,9 % a 8 bits; media efectiva de 5,71 bits por peso; group size 64 por defecto (algunos modulos usan 32 o 128); pesos no cuantizados, escalas y sesgos en bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other", heredada del modelo base) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno: es una cuantizacion del checkpoint Qwen/Qwen3.8-Flash-Next. El proceso se realizo con oQ (oMLX v0.7.0) mediante cuantizacion de precision mixta guiada por un mapa de sensibilidad por capa. Ese mapa no se midio sobre el checkpoint bf16 completo, sino sobre Jundot/Qwen3.8-Flash-Next-oQ4e-mtp, con 128 muestras de 256 tokens y el conjunto de calibracion `code_multilingual`. El propio autor justifica esta decision indicando que el checkpoint bf16 completo no cabe en memoria en un Mac de 128 GB, lo que introduce una limitacion metodologica: la sensibilidad se estima a partir de una version ya cuantizada a 4 bits.

La estructura declarada incluye el tipo de modelo "qwen4_exp", un codificador de vision integrado (pipeline image-text-to-text), una tabla de embeddings de n-gramas y una cabeza de prediccion multi-token conservada con `mtp_num_hidden_layers: 1`. La MTP y la tabla de n-gramas son mecanismos asociados a la decodificacion especulativa, es decir, a predecir varios tokens por paso para acelerar la generacion. Se desconoce el numero de tokens de entrenamiento, la composicion del dataset y si hubo RLHF, DPO u otras etapas de alineamiento en el modelo original, ya que esa informacion no aparece en la model card.

## Capacidades

- Generacion de texto conversacional en formato multimodal, con pipeline declarado image-text-to-text.
- Comprension de imagenes: el repositorio incluye explicitamente el codificador de vision.
- Prediccion multi-token (MTP) con una capa oculta preservada, orientada a acelerar la decodificacion.
- Tabla de embeddings de n-gramas incluida, util para decodificacion especulativa basada en coincidencia de n-gramas.
- Ejecucion nativa en MLX sobre Apple Silicon, con pesos en safetensors de MLX.
- Soporte de tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local multimodal en Apple Silicon: el modelo permite procesar imagenes y texto sin salir del equipo, apoyandose en MLX y en los 129 GB de pesos, en un Mac con 192 GB de memoria unificada.
- Investigacion sobre cuantizacion de precision mixta: sirve como caso de estudio para medir el impacto de una asignacion de 5/6/8 bits por capa frente al checkpoint bf16 o frente a variantes de 4 bits.
- Evaluacion de decodificacion especulativa: al conservar la cabeza MTP y la tabla de n-gramas, permite comparar el throughput con y sin prediccion multi-token sobre el mismo modelo base.
- Analisis de documentos con imagenes: capturas, diagramas o tablas escaneadas pueden enviarse al modelo junto con una pregunta textual, aprovechando el pipeline image-text-to-text.
- Prototipado de asistentes conversacionales con entrada visual en entornos sin GPU NVIDIA: el despliegue se realiza con la libreria MLX en lugar de vLLM o TGI.
- Reproducibilidad de conversiones de modelos grandes: el repositorio documenta nivel de cuantizacion, group size y proporciones por bit, lo que facilita replicar el proceso con otras variantes del mismo modelo base.
- Comparacion de degradacion por cuantizacion: al existir una variante de 4 bits del mismo linaje (Jundot/Qwen3.8-Flash-Next-oQ4e-mtp), permite contrastar calidad y uso de memoria entre 4 y 5 bits efectivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni para el modelo cuantizado ni como comparacion con el checkpoint bf16. Tampoco se declaran cifras de latencia o throughput medidas.

## Requisitos de hardware

- Peso en disco y en memoria: aproximadamente 129 GB de pesos (tamano del repositorio 128,6 GB).
- Memoria unificada necesaria: mas de 129 GB; el autor indica explicitamente un Mac de 192 GB como referencia.
- GPU dedicadas (A100, H100, RTX 4090): no aplica de forma directa, ya que el formato es MLX safetensors y esta pensado para Apple Silicon. No se documenta una ruta de conversion a CUDA.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; 129 GB exceden con mucho los 24 GB de una RTX 4090.
- Opciones de despliegue: libreria MLX / mlx-lm; el proyecto oQ (github.com/jundot/omlx) para generar o manipular cuantizaciones equivalentes. No se mencionan vLLM, llama.cpp, Ollama ni TGI como soportados para este artefacto.
- Latencia y throughput estimados: no disponible.
- Cuantizacion adicional para reducir requisitos: no disponible en la model card; no se documentan variantes GGUF o de menor tamano derivadas de este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tamano de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d9beuD/Qwen3.8-Flash-Next-oQ5-mtp | 179.999.981.459 | MLX safetensors, oQ nivel 5 (5,71 bits/peso efectivos) | 129 GB | no disponible | qwen-community-1.0 | Publico en HuggingFace, 0 descargas y 0 likes |
| Qwen/Qwen3.8-Flash-Next (modelo base) | 179.999.981.459 | Safetensors en bf16 | No declarado en la informacion disponible (a 2 bytes por parametro serian unos 360 GB) | no disponible | qwen-community-1.0 | Publico en HuggingFace |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | No declarado | MLX safetensors, oQ nivel 4 | No declarado | no disponible | No declarado en la informacion disponible | Publico en HuggingFace; usado como referencia de sensibilidad |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes, por lo que la comparativa se limita a formato, tamano y licencia.

## Limitaciones y advertencias

- Licencia qwen-community-1.0, etiquetada como "other": el uso comercial no es libre por defecto, esta sujeto a los terminos de la Qwen Community License 1.0 del modelo base. Conviene revisar el archivo LICENSE antes de cualquier despliegue en produccion.
- El mapa de sensibilidad de la cuantizacion se calculo sobre una variante ya cuantizada a 4 bits, no sobre el checkpoint bf16, porque este no cabia en memoria en un Mac de 128 GB. Esto puede traducirse en una asignacion de bits suboptima en algunas capas.
- Sin datos de evaluacion: no hay benchmarks que cuantifiquen la perdida de calidad frente al modelo base en bf16. Cualquier afirmacion sobre su rendimiento real seria especulativa.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran escala; no se documentan medidas especificas de mitigacion.
- Contexto e idiomas no declarados: se desconoce la ventana de contexto real y la cobertura idiomatica, lo que impide planificar casos de uso multilingues o de contexto largo con garantias.
- Requisito de hardware muy restrictivo: 129 GB de pesos exigen un Mac con memoria unificada superior a esa cifra (por ejemplo, 192 GB), lo que excluye la practica totalidad del parque de equipos de consumo.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Formato cerrado a MLX: no se documentan conversiones a GGUF, AWQ, GPTQ ni rutas de despliegue en CUDA, lo que limita su uso a entornos Apple Silicon.
- Fecha de publicacion adelantada (octubre de 2026) y nomenclatura del modelo base no verificable con las fuentes disponibles; la informacion procede exclusivamente de la model card del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ5-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Referencia de sensibilidad empleada: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Resultados de busqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a YouTube y servicios asociados, sin relacion con el modelo).
