# moganai/MoganOCR-TR-1.5-GGUF

## Resumen

MoganOCR-TR-1.5-GGUF es la distribucion en formato GGUF de MoganOCR-TR-1.5, un modelo de vision-lenguaje (VLM) de 2.390.384.448 parametros (aproximadamente 2,4 mil millones) especializado en OCR y parsing de documentos turcos. Lo desarrolla el usuario moganai y esta pensado para su uso con llama.cpp. Su tarea concreta es recibir la imagen de una pagina y devolver la pagina completa en orden de lectura como Markdown, con las tablas convertidas a HTML y las formulas en LaTeX.

El modelo resuelve el problema del reconocimiento de documentos en turco con preservacion de estructura: no se limita a extraer texto plano, sino que reconstruye la jerarquia del documento (titulos, listas, tablas, formulas) en un formato consumible por pipelines de datos. Es relevante porque la mayoria de los OCR de alta calidad estan optimizados para ingles y pierden fidelidad estructural en lenguas con caracteres propios del turco (ı, ğ, ş, ç, ö, ü), y porque su tamano compacto permite ejecutarlo en hardware modesto mediante cuantizacion.

Esta publicacion concreta es una cuantizacion del modelo base moganai/MoganOCR-TR-1.5, con licencia Apache 2.0, soporte para turco e ingles y pesos en formato GGUF listos para llama.cpp. El repositorio ocupa 13,3 GB e incluye varias cuantizaciones junto con el codificador visual en un fichero `mmproj` separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (image-text-to-text) para OCR y parsing de documentos; arquitectura interna del transformer no disponible |
| Parametros totales | 2.390.384.448 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de uso de llama.cpp emplea `-c 16384` |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, BF16; codificador visual en F16 |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con fichero `mmproj` separado para el encoder visual |

## Arquitectura y entrenamiento

MoganOCR-TR-1.5 es un modelo de vision-lenguaje orientado a image-text-to-text: recibe una imagen de pagina y genera texto. La model card indica que produce la pagina completa en orden de lectura como Markdown, con tablas en HTML y formulas en LaTeX, lo que implica un entrenamiento orientado a la reconstruccion estructural del documento y no solo a la transcripcion de caracteres. El modelo base tiene 2.390.384.448 parametros y se distribuye aqui en cuantizaciones GGUF para llama.cpp, con un codificador visual independiente (`mmproj-MoganOCR-TR-1.5-F16.gguf`, 0,67 GB).

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). Tampoco se detalla la arquitectura interna del transformer ni la del encoder visual. El uso recomendado es una imagen de pagina por peticion, con el prompt `Sayfayı markdown olarak yaz.` y temperatura 0, lo que sugiere un entrenamiento orientado a una tarea unica y determinista.

## Capacidades

- OCR de documentos turcos: transcripcion de una pagina completa en orden de lectura.
- Conversion a Markdown: reconstruccion de la estructura del documento (titulos, parrafos, listas) en sintaxis Markdown.
- Tablas en HTML: representacion de tablas del documento original como tablas HTML dentro de la salida.
- Formulas en LaTeX: conversion de expresiones matematicas a LaTeX.
- Procesamiento de imagenes de pagina: entrada image-text-to-text, una pagina por peticion.
- Multilingue limitado: turco e ingles declarados en la model card.
- Integracion con llama.cpp: compatible con `llama-server` y el ecosistema GGUF.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, audio ni modo thinking.

## Casos de uso

- Digitalizacion de archivos administrativos turcos: el modelo convierte cada pagina escaneada en Markdown estructurado, lo que permite indexar el contenido en un buscador o en un sistema RAG sin perder la jerarquia de titulos y secciones.
- Extraccion de tablas de informes financieros: al devolver las tablas como HTML, la salida puede parsearse directamente con librerias de scraping HTML y volcarse a una base de datos o a una hoja de calculo.
- Procesamiento de documentacion tecnica con formulas: la conversion a LaTeX permite reutilizar el contenido en entornos de publicacion cientifica o en wikis tecnicas sin retipear las expresiones.
- Pipeline de ingestion de PDFs escaneados: combinado con un paso previo de rasterizacion de PDF a imagen, el modelo genera Markdown por pagina que alimenta un almacen de documentos; su tamano compacto (1,56 GB en Q4_K_M) permite ejecutarlo en servidores sin GPU de gama alta.
- Despliegue en local o en el borde: con llama.cpp y cuantizacion Q4_K_M o Q5_K_M, el modelo cabe en equipos de consumo, lo que facilita el procesamiento de documentos sensibles sin enviarlos a la nube.
- Preservacion de corpus historicos en turco: la salida Markdown con estructura conserva la organizacion original de periodicos y revistas digitalizados, util para proyectos de humanidades digitales.
- Automatizacion de la revision de formularios y expedientes: la salida determinista (temperatura 0) y el orden de lectura fiable permiten extraer campos de documentos repetitivos en un flujo por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a un Space de benchmark llamado TurkishOCR-Bench (https://huggingface.co/spaces/moganai/TurkishOCR-Bench), pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB con Q4_K_M, 1,8 GB con Q5_K_M, 2,0 GB con Q6_K y 2,6 GB con Q8_0, a los que se suman 0,67 GB del codificador visual en F16. El BF16 completo ocupa 4,79 GB.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cualquier GPU consumer con 4-6 GB de VRAM o mas deberia ser suficiente para las cuantizaciones pequenas; para BF16 se recomienda al menos 6-8 GB.
- Cabe en GPU consumer: si, con las cuantizaciones Q4_K_M, Q5_K_M y Q6_K; tambien es viable en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, en concreto `llama-server` con el fichero GGUF y el `mmproj` correspondiente. Ejemplo de la model card: `llama-server -hf moganai/MoganOCR-TR-1.5-GGUF:Q8_0 --image-max-tokens 4096 -c 16384`.
- Latencia y throughput: no disponibles en la informacion proporcionada. El uso recomendado es una imagen por peticion con temperatura 0.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparacion rigurosa. Como referencia de categoria, se trata de un VLM especializado en OCR de ~2,4 mil millones de parametros, con contexto no documentado, licencia Apache 2.0 y distribucion en GGUF; los OCR genericos de mayor tamano o los VLM multiuso no se detallan aqui. Comparativa: no disponible.

## Limitaciones y advertencias

- Cobertura linguistica limitada: solo turco e ingles declarados; el rendimiento en otros idiomas no esta documentado.
- Especializacion estrecha: esta disenado para OCR de una pagina por peticion; no se documentan capacidades de razonamiento general, codigo o agentes.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar texto, filas de tabla o formulas en documentos de baja calidad, borrosos o con layout complejo; la temperatura 0 reduce pero no elimina el riesgo.
- Sin datos de benchmarks publicados en la informacion disponible: no es posible cuantificar su precision frente a alternativas antes de desplegarlo.
- Contexto no documentado: el limite real de tokens de contexto no se indica; el ejemplo de llama.cpp usa 16384, pero no se confirma que sea el maximo del modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene conservar los avisos de licencia y verificar las condiciones del modelo base.
- Dependencia de llama.cpp y del fichero `mmproj`: es necesario cargar ambos ficheros; un uso incorrecto del encoder visual degrada la salida.
- Modelo con muy poca traccion en el ecosistema (0 descargas, 1 like en el momento de la consulta): menor validacion externa y soporte comunitario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moganai/MoganOCR-TR-1.5-GGUF
- Modelo base: https://huggingface.co/moganai/MoganOCR-TR-1.5
- Benchmark TurkishOCR-Bench: https://huggingface.co/spaces/moganai/TurkishOCR-Bench
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Apoyo al autor: https://buymeacoffee.com/moganai
