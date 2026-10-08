# Prathat/LightOnOCR-3-0.8B-GGUF

## Resumen

LightOnOCR-3-0.8B-GGUF es la conversión al formato GGUF del modelo LightOnOCR-3-0.8B desarrollado por LightOn AI, publicada por el usuario Prathat. Se trata de un modelo vision-language (pipeline `image-text-to-text`) orientado al reconocimiento óptico de caracteres (OCR) y a la comprensión de documentos de extremo a extremo: transcripción de texto, análisis de maquetación (layout), descripción de imágenes y extracción de datos de gráficos y tablas, todo con un único modelo compacto.

El modelo base forma parte de la familia LightOnOCR-3, compuesta por tres tamaños (0.8B, 1B y 4B), todos bajo licencia Apache 2.0. Esta conversión GGUF tiene 752.393.024 parámetros (~0,75B) y está diseñada para ejecutarse con llama.cpp, lo que permite desplegarla en hardware de consumo sin GPU dedicada de gama alta. El repositorio ocupa 7,2 GB en total e incluye 11 cuantizaciones del modelo más un archivo `mmproj` en F16 imprescindible para procesar entrada visual.

Su relevancia práctica radica en dos factores: por un lado, la licencia Apache 2.0 sin restricciones para uso comercial; por otro, el tamaño reducido (desde 0,39 GB en Q2_K) que habilita OCR de documentos complejos en entornos locales, sin depender de APIs externas. La disponibilidad de pesos en GGUF y el soporte de la arquitectura LightOnOCR en vLLM amplían las opciones de despliegue tanto en CPU como en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-language `image-text-to-text`; sin detalle de la arquitectura interna en la informacion proporcionada) |
| Parametros totales | 752.393.024 (~0,75B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal MMPROJ en F16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentacion proporcionada. Lo que si se puede afirmar es que LightOnOCR-3-0.8B es un modelo vision-language de extremo a extremo que combina un codificador de vision con un modelo de lenguaje: la conversion GGUF separa ambos componentes en dos archivos, el modelo de lenguaje cuantizado y el proyector multimodal `mmproj` (`LightOnOCR-3-0.8B-mmproj-f16.gguf`, 0,191 GB), que es obligatorio cargar junto al modelo para procesar imagenes.

La propuesta de LightOn AI con esta familia es sustituir las canalizaciones clasicas de OCR (deteccion de texto, reconocimiento y reconstruccion de layout como etapas separadas) por un unico modelo que resuelve transcripcion, analisis de maquetacion, descripcion de imagenes y extraccion de graficos de forma conjunta. No se han proporcionado datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de ajuste como RLHF o DPO. La implementacion de la arquitectura `lightonocr` esta integrada en vLLM, lo que sugiere que el modelo base sigue un diseno compatible con los runners habituales de transformers.

## Capacidades

- Transcripcion de texto en imagenes y documentos (OCR end-to-end) directamente desde la imagen, sin etapas intermedias de deteccion.
- Analisis de maquetacion de documentos (`layout extraction`): identificacion de estructura, bloques de texto y organizacion de la pagina.
- Comprension y extraccion de tablas y formularios, segun los tags del repositorio (`tables`, `forms`).
- Extraccion de datos de graficos y comprension de imagenes (descripcion de figuras) dentro del mismo modelo.
- Procesamiento de PDF y documentos digitalizados, indicado en los tags del modelo.
- Conversacion multimodal: el tag `conversational` y el pipeline `image-text-to-text` implican interaccion por turnos con entrada de imagen y texto.
- No hay informacion disponible sobre soporte de tool calling, function calling, agentes o modos de razonamiento extendido (`thinking mode`).
- Capacidad multilingue limitada: el unico idioma declarado es el ingles.

## Casos de uso

- Digitalizacion masiva de archivos: el modelo puede procesar documentos escaneados en local y devolver texto estructurado, sin enviar informacion sensible a APIs externas, gracias a que los pesos en Q4_K_M ocupan solo 0,493 GB.
- Extraccion de datos de facturas y formularios: los tags `forms` y `tables` apuntan a un uso directo en la lectura de campos estructurados y tablas de documentos administrativos.
- Analisis de maquetacion para pipelines de RAG: la capacidad de layout permite segmentar documentos antes de indexarlos, mejorando la calidad de la recuperacion en sistemas de busqueda aumentada.
- Procesamiento de articulos cientificos y documentacion tecnica: la comprension de graficos y tablas permite extraer informacion de figuras y datos tabulados junto al texto circundante.
- Despliegue en el borde (edge) o en portatiles: con cuantizaciones desde 0,393 GB (Q2_K), es viable ejecutar OCR en equipos sin GPU dedicada mediante llama.cpp.
- Automatizacion documental en servidor de CPU: mediante `llama-server` con el archivo `mmproj`, se puede exponer un endpoint compatible con OpenAI para integrarlo en flujos existentes.
- Preprocesamiento de documentos en pipelines de vision por computador donde se necesite transcripcion y estructura en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de evaluacion, y los resultados de busqueda consultados (pagina de investigacion de LightOn, coleccion de Hugging Face y articulo de AGI Hunt) no proporcionan cifras numericas comparativas.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin contar cache de contexto ni activaciones):

| Cuantizacion | Tamano de pesos | Con `mmproj` F16 (+0,191 GB) |
|---|---:|---:|
| Q2_K | 0,393 GB | ~0,58 GB |
| Q3_K_M | 0,434 GB | ~0,63 GB |
| Q4_K_M | 0,493 GB | ~0,68 GB |
| Q5_K_M | 0,538 GB | ~0,73 GB |
| Q6_K | 0,586 GB | ~0,78 GB |
| Q8_0 | 0,756 GB | ~0,95 GB |
| F16 | 1,413 GB | ~1,60 GB |

- El modelo cabe holgadamente en cualquier GPU de consumo, incluidas tarjetas con 4 GB de VRAM o menos, e incluso puede ejecutarse integramente en CPU con memoria RAM convencional.
- No se dispone de recomendaciones oficiales de GPU (A100, H100, RTX 4090) especificas para este modelo.
- Opciones de despliegue:
  - `llama.cpp` / `llama-server` (formato nativo del repositorio), cargando siempre el archivo `mmproj` para entrada de imagen.
  - Ollama o LM Studio, mediante la importacion del GGUF y su proyector.
  - vLLM, que dispone de implementacion de la arquitectura `lightonocr` (orientada a los pesos originales en safetensors, no confirmado para GGUF).
- No se han publicado datos de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones detalladas de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, dentro de la propia familia LightOnOCR-3 existen los tamanos 0.8B, 1B y 4B, todos bajo licencia Apache 2.0; este repositorio corresponde a la variante de 0.8B en formato GGUF, la mas ligera de las tres y la unica en esta conversion.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| LightOnOCR-3-0.8B-GGUF (este) | ~0,75B | no disponible | Apache 2.0 | GGUF |
| LightOnOCR-3-1B | no disponible | no disponible | Apache 2.0 | no disponible |
| LightOnOCR-3-4B | no disponible | no disponible | Apache 2.0 | no disponible |
| Otros modelos OCR comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El unico idioma declarado es el ingles (`en`); no hay soporte multilingue confirmado, lo que limita su uso con documentos en castellano u otros idiomas.
- No se dispone de informacion sobre la longitud de contexto, lo que impide garantizar el procesamiento de documentos muy extensos o de multiples paginas en una sola pasada.
- Riesgo de alucinacion inherente a los modelos generativos: en tareas de OCR puede producir texto plausible que no corresponde exactamente al contenido de la imagen, especialmente en cuantizaciones agresivas (Q2_K, Q3_K).
- Las cuantizaciones bajas reducen el tamano pero pueden degradar la precision de reconocimiento en documentos con tipografias poco comunes, tablas densas o imagenes de baja resolucion.
- La conversion GGUF la realiza un tercero (Prathat) y no LightOn AI; la calidad de la conversion no esta avalada oficialmente por el autor del modelo original.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no existe validacion comunitaria significativa de esta conversion concreta.
- Para entrada visual es obligatorio cargar el archivo `mmproj` (`LightOnOCR-3-0.8B-mmproj-f16.gguf`); omitirlo inhabilita por completo la capacidad multimodal.
- La licencia Apache 2.0 del modelo original permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar la trazabilidad de los datos de entrenamiento del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Prathat/LightOnOCR-3-0.8B-GGUF
- Modelo original: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Pagina de investigacion de LightOnOCR-3 (LightOn): https://www.lighton.ai/research/lightonocr-3
- Coleccion LightOnOCR-3 en Hugging Face: https://huggingface.co/collections/lightonai/lightonocr-3
- Coleccion LightOnOCR en Hugging Face: https://huggingface.co/collections/lightonai/lightonocr
- Documentacion de la arquitectura en vLLM: https://docs.vllm.ai/en/latest/api/vllm/model_executor/models/lightonocr/
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Articulo sobre el lanzamiento (AGI Hunt): https://agihunt.info/en/p/1a11c6dd65d1d7455f2a77a0931
