# prithivMLmods/LightOnOCR-3-0.8B-MTP-Repacked

## Resumen

LightOnOCR-3-0.8B-MTP-Repacked es un reempaquetado del modelo LightOnOCR-3-0.8B desarrollado por lightonai, publicado por el usuario prithivMLmods. Se trata del modelo mas ligero de la familia LightOnOCR-3, disenado para reconocimiento optico de caracteres (OCR) de extremo a extremo y comprension de documentos. Esta construido sobre la arquitectura vision-lenguaje Qwen3.5 y opera en dos modos principales: un modo de transcripcion por defecto que genera el texto completo de la pagina en Markdown, y un modo de "grounding" que devuelve coordenadas de cajas delimitadoras y etiquetas semanticas para cada elemento visual.

El modelo resuelve el problema de consolidar pipelines documentales complejos (extraccion de texto, tablas, formularios, graficos y notacion matematica) en un unico modelo de menos de mil millones de parametros. Con 873.438.784 parametros reales segun los pesos en safetensors, ofrece una alternativa ligera y con licencia Apache 2.0 tanto para uso comercial como de investigacion.

La particularidad de este reempaquetado es la incorporacion de Multi-Token Prediction (MTP) en los ficheros GGUF, que integra decodificacion especulativa directamente en los pesos del modelo mediante cabezas de prediccion adicionales, acelerando la inferencia local sin necesidad de un modelo borrador separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5 (transformer multimodal) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 3 shards), GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 para vision-lenguaje, lo que implica un codificador visual acoplado a un modelo de lenguaje transformer con capacidad de procesar imagenes y texto de forma conjunta (pipeline image-text-to-text). El reempaquetado anade Multi-Token Prediction: cabezas de salida adicionales dentro de la arquitectura principal que predicen multiples tokens futuros en una sola pasada, lo que habilita decodificacion especulativa sin modelo borrador externo.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. El modelo base es lightonai/LightOnOCR-3-0.8B, y este repositorio es una relacion de cuantizacion/reempaquetado del mismo. Incluye un fichero de proyeccion multimodal (mmproj) en formato GGUF para las capacidades de vision.

## Capacidades

- Reconocimiento optico de caracteres (OCR) de extremo a extremo con salida en Markdown de pagina completa.
- Modo de grounding visual: devuelve cajas delimitadoras y etiquetas semanticas por elemento.
- Comprension de documentos: tablas, recibos, formularios, maquetacion multicolumna y notacion matematica.
- Descripcion automatica de imagenes.
- Conversion de graficos a tablas HTML estructuradas.
- Procesamiento multimodal imagen-texto (image-text-to-text).
- Decodificacion especulativa integrada via MTP en los ficheros GGUF.
- Compatibilidad con text-generation-inference y llama-cpp.
- Soporte conversacional (chat template incluido).
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Digitalizacion de facturas y recibos: el modelo extrae texto estructurado y campos de recibos en Markdown, adecuado para automatizar contabilidad y conciliacion gracias a su capacidad de manejar formularios y maquetaciones complejas.
- Extraccion de tablas de informes financieros: convierte tablas de PDFs e imagenes en Markdown o HTML estructurado, util para pipelines de analisis de datos que necesitan tablas parseadas.
- Procesamiento de formularios administrativos: con el modo grounding puede localizar y etiquetar campos concretos (cajas delimitadoras con etiquetas semanticas), lo que permite mapear formularios a esquemas de datos.
- Conversion de graficos a datos: transforma graficos de barras o lineas en tablas HTML, facilitando la reutilizacion de datos visualizados en documentos.
- Digitalizacion de documentacion cientifica o tecnica: transcribe notacion matematica y maquetacion multicolumna a Markdown, util para bases de conocimiento y busqueda sobre papers.
- Despliegue en local o edge: con cuantizaciones GGUF de 476 MB a 834 MB y MTP para acelerar la inferencia, es viable ejecutar OCR en equipos con recursos limitados o sin conexion.
- Indexacion de archivos documentales: transcripcion masiva de PDFs e imagenes a texto Markdown para alimentar sistemas RAG, aprovechando el tamano reducido del modelo para procesar volumen alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en BF16 (pesos de 1,56 GB en GGUF BF16); entre 0,5 y 0,9 GB en cuantizaciones GGUF Q3 a Q8, mas el fichero mmproj (207 MB).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para BF16; GPUs consumer como RTX 3060, RTX 4060 o superiores son suficientes. Tambien viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en hardware de gama baja gracias a las cuantizaciones pequenas.
- Opciones de despliegue: transformers (safetensors), llama.cpp (GGUF), text-generation-inference; Ollama y vLLM figuran como tags pero no se confirma soporte explicito en la informacion.
- Latencia y throughput: no disponibles; la integracion de MTP busca acelerar la inferencia local mediante decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LightOnOCR-3-0.8B-MTP-Repacked | 873 M | no disponible | Apache 2.0 | OCR + grounding, MTP, GGUF |
| LightOnOCR-3-0.8B (base) | no disponible | no disponible | Apache 2.0 | Modelo base sin reempaquetado MTP |
| Alternativas OCR de la misma categoria | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Idioma: la model card solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: como modelo generativo, puede producir texto o etiquetas incorrectas en documentos de baja calidad o maquetaciones atipicas.
- Contexto: no se especifica la longitud de contexto, lo que limita la planificacion de documentos de muchas paginas.
- Es un reempaquetado de terceros (prithivMLmods), no una publicacion oficial de lightonai; conviene validar la calidad frente al modelo base.
- Las capacidades de grounding y conversion de graficos dependen del prompt y del formato de imagen; no hay benchmarks publicados que cuantifiquen su fiabilidad.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base y de cualquier dependencia asociada.
- El rendimiento de las cuantizaciones bajas (Q3) puede degradar la precision del OCR; se recomienda Q4_K_M o superior para produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/LightOnOCR-3-0.8B-MTP-Repacked
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Carpeta GGUF: https://huggingface.co/prithivMLmods/LightOnOCR-3-0.8B-MTP-Repacked/tree/main/GGUF
- Organizacion lightonai: https://huggingface.co/lightonai
