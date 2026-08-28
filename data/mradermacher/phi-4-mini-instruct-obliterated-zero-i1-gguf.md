# mradermacher/Phi-4-Mini-Instruct-Obliterated-zero-i1-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF con matriz de importancia (imatrix) del modelo `ArRENCEAI/Phi-4-Mini-Instruct-Obliterated-zero`, una versión "abliterada" (modificada para eliminar rechazos de contenido) del modelo Phi-4-mini-instruct de Microsoft. El autor, mradermacher, se dedica a generar cuantizaciones de alta calidad para facilitar su uso en entornos locales con herramientas como llama.cpp u Ollama. El modelo base pertenece a la familia Phi-4, diseñada para razonamiento denso y eficiencia, con una ventana de contexto de 128K tokens según la documentación de Microsoft Foundry.

La relevancia de esta versión radica en que ofrece una alternativa sin censura para desarrolladores que necesitan generar contenido libre de restricciones, aunque con las advertencias éticas y técnicas correspondientes. Al ser un archivo GGUF, se puede ejecutar en una amplia gama de hardware, desde CPU hasta GPU de consumo, dependiendo de la cuantización elegida. No obstante, la página solo proporciona el archivo imatrix, no las cuantizaciones finales, que están en un repositorio hermano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Phi-4-mini) |
| Parametros totales | no disponible (el repositorio indica 557.184, probablemente no corresponde a parametros reales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128K tokens (segun documentacion de Phi-4-mini-instruct) |
| Tipos de cuantizacion | no disponible (la model card menciona varios: Q2_K, IQ3_M, Q4_K_S, etc., pero no se listan archivos en esta pagina) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base es Phi-4-mini-instruct, un transformer denso de la familia Phi-4 de Microsoft, entrenado con una combinacion de datos sinteticos y sitios web filtrados, con enfasis en datos de razonamiento denso. La version "Obliterated-zero" aplica una tecnica de abliteration, que modifica los pesos del modelo para reducir o eliminar los rechazos de contenido no deseado. Esta modificacion se realiza sobre los pesos ya entrenados, por lo que no hay un entrenamiento adicional con datos nuevos. El archivo GGUF aqui presente es una cuantizacion con imatrix, que mejora la calidad de la cuantizacion al ponderar la importancia de cada tensor. No se dispone de informacion sobre el dataset de entrenamiento original ni sobre el proceso de abliteration aplicado.

## Capacidades

- Generacion de texto en ingles con estilo conversacional y de razonamiento, heredadas del modelo base Phi-4-mini-instruct.
- Capacidad de razonamiento logico y matematico, segun las caracteristicas publicas de la familia Phi-4.
- Soporte de contexto largo (128K tokens), util para documentos extensos o conversaciones multi-turno.
- Al ser una version abliterada, no rechaza contenido considerado inapropiado o sensible, aunque esto puede comprometer la calidad en tareas que requieren moderacion.
- No se documentan capacidades de tool calling, vision ni audio en la informacion proporcionada.

## Casos de uso

- Generacion de ficcion y narrativa sin restricciones: escritores pueden usar el modelo para explorar temas tabu o contenido adulto sin que el modelo se niegue, gracias a la abliteration.
- Prototipado rapido de chatbots con personalidad libre: desarrolladores que necesitan probar interacciones sin filtros pueden desplegar este modelo en local con llama.cpp.
- Analisis de documentos extensos: la ventana de 128K permite procesar informes largos o codigo fuente completo en una sola pasada.
- Investigacion sobre alineacion y seguridad: estudiar como la abliteration afecta al comportamiento del modelo en comparacion con la version original.
- Generacion de codigo en entornos aislados: aunque no se confirma soporte de tool calling, el modelo base tiene capacidades de programacion; puede usarse para generar scripts sin preocuparse por rechazos.
- Experimentacion con cuantizaciones: el archivo imatrix permite a los usuarios crear sus propias cuantizaciones adaptadas a su hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval u otras metricas para esta version especifica.

## Requisitos de hardware

- No se dispone de datos concretos de VRAM, latencia o throughput para este modelo.
- Al ser un GGUF, se puede ejecutar con llama.cpp, Ollama, LM Studio u otras herramientas compatibles.
- El tamaño del archivo imatrix es de 0.1 GB, pero las cuantizaciones reales (no incluidas en esta pagina) tendran un tamaño variable segun el tipo. Para un modelo de ~3.8B parametros (tamano estimado de Phi-4-mini), una cuantizacion Q4_K_M ocuparia aproximadamente 2-3 GB, lo que permitiria ejecucion en GPUs de consumo con 6 GB de VRAM o incluso en CPU con suficiente RAM.
- Se recomienda consultar el repositorio de cuantizaciones estaticas para obtener archivos listos para usar.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos. Se sugiere comparar con la version original Phi-4-mini-instruct (sin abliteration) y con otras cuantizaciones GGUF del mismo modelo, disponibles en el repositorio de cuantizaciones estaticas de mradermacher.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que puede llevar a la generacion de contenido ofensivo, ilegal o peligroso. El uso debe ser responsable y bajo la propia responsabilidad del desarrollador.
- No se conoce la licencia exacta del modelo base ni de esta version, lo que puede limitar su uso comercial. Se recomienda contactar con los autores.
- La calidad del modelo puede degradarse en tareas que requieren moderacion o adherencia a politicas de seguridad.
- No hay garantias de que el modelo mantenga las mismas capacidades de razonamiento que el original tras la abliteration.
- La documentacion es escasa; no se especifican detalles tecnicos del proceso de cuantizacion ni de la abliteration.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Phi-4-Mini-Instruct-Obliterated-zero-i1-GGUF
- Modelo base: https://huggingface.co/ArRENCEAI/Phi-4-Mini-Instruct-Obliterated-zero
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Phi-4-Mini-Instruct-Obliterated-zero-GGUF
- Pagina de descarga conveniente: https://hf.tst.eu/model#Phi-4-Mini-Instruct-Obliterated-zero-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
