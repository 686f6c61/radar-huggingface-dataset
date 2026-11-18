# mradermacher/NuMarkdown-8B-Thinking-fork-GGUF

## Resumen

NuMarkdown-8B-Thinking-fork-GGUF es la version cuantizada en formato GGUF del modelo chaitnya26/NuMarkdown-8B-Thinking-fork, un modelo de vision-lenguaje especializado en la conversion de documentos e imagenes a Markdown. El trabajo de cuantizacion lo firma mradermacher, un conocido empaquetador de pesos GGUF en la comunidad de Hugging Face. El modelo esta pensado para tareas de OCR estructurado, extraccion de contenido y generacion de Markdown a partir de documentos, lo que lo hace util en pipelines de RAG y digitalizacion documental.

El modelo deriva de la familia Qwen2.5 (etiquetado como qwen2.5 en la model card) y cuenta con 7.615.616.512 parametros totales, es decir, aproximadamente 7,6 mil millones. Incorpora un adaptador multimodal (mmproj) que permite procesar imagenes ademas de texto, y esta orientado a un modo de razonamiento ("Thinking") que produce cadenas de pensamiento antes de la respuesta final. La licencia es MIT, lo que facilita su uso comercial sin restricciones adicionales.

La relevancia de esta publicacion radica en que ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K hasta f16), lo que permite desplegarlo en hardware modesto, incluidas GPUs de consumo, manteniendo la capacidad de procesar documentos visuales. Esta orientado principalmente al idioma ingles y su publicacion se actualizo por ultima vez en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen2.5 con adaptador multimodal (vision-lenguaje) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (con ficheros mmproj separados para la parte multimodal) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de la familia Qwen2.5, un transformer decoder-only, al que se anade un adaptador multimodal (mmproj) que proyecta representaciones visuales al espacio del modelo de lenguaje. Esto permite procesar tanto imagenes de documentos como texto. La model card lo etiqueta como vision-language model (VLM) con capacidades de razonamiento ("Thinking"), lo que sugiere que fue afinado para generar cadenas de razonamiento antes de emitir la respuesta final, algo habitual en tareas de conversion documental compleja.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo base es chaitnya26/NuMarkdown-8B-Thinking-fork, un fork de un modelo NuMarkdown-8B-Thinking original, y esta empaquetado para transformers. La innovacion principal de esta publicacion concreta no es arquitectonica sino de distribucion: la disponibilidad de cuantizaciones estaticas y de un conjunto de cuantizaciones ponderadas/imatrix en un repositorio hermano (i1-GGUF), que mejoran la relacion calidad-tamano.

## Capacidades

- Conversion de documentos e imagenes a Markdown estructurado (OCR con preservacion de formato).
- Extraccion de contenido de documentos para pipelines de RAG.
- Razonamiento en modo "Thinking" con cadenas de pensamiento antes de la respuesta.
- Procesamiento multimodal: entrada de imagenes junto con texto.
- Generacion de texto conversacional (etiqueta conversational).
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta soporte explicito de tool calling ni de function calling.
- No se documenta soporte explicito de agentes o multi-step reasoning mas alla del modo Thinking.
- No se documenta soporte de audio.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo recibe la imagen del documento y devuelve Markdown estructurado con tablas y campos, adecuado para su volcado posterior a un ERP o base de datos.
- Construccion de bases de conocimiento para RAG: conversion masiva de PDFs escaneados e imagenes a Markdown limpio que luego se trocea e indexa en un vector store, mejorando la calidad de la recuperacion frente a OCR plano.
- Extraccion de tablas de informes tecnicos: al preservar la estructura Markdown, permite reconstruir tablas complejas de documentos financieros o cientificos sin perder la relacion entre columnas.
- Enriquecimiento de repositorios documentales: procesamiento por lotes de manuales y documentacion interna para generar versiones Markdown versionables en Git, con trazabilidad de cambios.
- Preprocesado en pipelines de CI/CD documental: ejecucion del modelo en un paso de un pipeline que convierte artefactos visuales en Markdown antes de publicarlos en una web estatica o wiki.
- Analisis de capturas de pantalla y diagramas: extraccion de texto y estructura de imagenes de interfaz o diagramas de arquitectura para documentacion tecnica.
- Prototipado en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_S/Q4_K_M (4,6-4,8 GB) puede ejecutarse localmente con llama.cpp u Ollama para pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ~3,1 GB; Q3_K_S ~3,6 GB; Q4_K_S ~4,6 GB; Q4_K_M ~4,8 GB; Q5_K_M ~5,5 GB; Q6_K ~6,4 GB; Q8_0 ~8,2 GB; f16 ~15,3 GB.
- El adaptador multimodal anade VRAM adicional: mmproj-Q8_0 ~1,0 GB o mmproj-f16 ~1,5 GB.
- GPU recomendadas: para cuantizaciones Q4-Q5 basta una RTX 3060/4060 con 8-12 GB; para Q8_0 o f16 se recomienda RTX 4090 (24 GB) o GPUs de datacenter como A100/H100 para servir varias instancias.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q2 a Q6 en tarjetas de 8 GB o mas; Q8_0 requiere al menos 10-12 GB libres.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; para la parte multimodal se requiere soporte de mmproj en el runtime (llama.cpp con soporte de vision).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NuMarkdown-8B-Thinking-fork-GGUF (este) | ~7,6 B | no disponible | MIT | GGUF + mmproj | Especializado en documento a Markdown, modo Thinking, solo ingles |
| chaitnya26/NuMarkdown-8B-Thinking-fork | ~7,6 B | no disponible | MIT | safetensors/transformers | Modelo base sin cuantizar del que deriva este |
| mradermacher/NuMarkdown-8B-Thinking-fork-i1-GGUF | ~7,6 B | no disponible | MIT | GGUF (imatrix) | Misma familia, cuantizaciones ponderadas de mayor calidad |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de la misma categoria.

## Limitaciones y advertencias

- Idiomas: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar contenido ausente en el documento original, especialmente en tablas complejas o imagenes de baja calidad; conviene validar la salida en produccion.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen2.5 hereda los sesgos del corpus de entrenamiento original.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin restricciones adicionales, pero no se ofrece garantia alguna.
- Cuantizaciones agresivas: Q2_K y Q3_K pueden degradar notablemente la calidad del OCR y la fidelidad del Markdown; se recomienda Q4_K_M o superior para produccion.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar documentos de gran tamano con garantias.
- La parte multimodal requiere ficheros mmproj separados y runtimes con soporte de vision; no todos los entornos GGUF los manejan igual.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en disenos de sistemas autonomos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/NuMarkdown-8B-Thinking-fork-GGUF
- Modelo base: https://huggingface.co/chaitnya26/NuMarkdown-8B-Thinking-fork
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/NuMarkdown-8B-Thinking-fork-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#NuMarkdown-8B-Thinking-fork-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Nethype GmbH: https://www.nethype.de/
