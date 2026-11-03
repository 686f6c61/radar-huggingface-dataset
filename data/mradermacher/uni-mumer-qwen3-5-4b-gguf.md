# mradermacher/Uni-MuMER-Qwen3.5-4B-GGUF

## Resumen

Uni-MuMER-Qwen3.5-4B-GGUF es la versión cuantizada en formato GGUF del modelo Uni-MuMER-Qwen3.5-4B, desarrollado originalmente por el usuario phxember y cuantizado por mradermacher. Se trata de un modelo de lenguaje y visión (vision-language) especializado en OCR de matematicas manuscritas (HMER, Handwritten Mathematical Expression Recognition), capaz de transcribir expresiones matematicas escritas a mano a codigo LaTeX. El modelo parte de una base Qwen3.5 de 4B parametros, lo que le aporta capacidades generales de conversacion y razonamiento sobre las que se ha especializado la tarea de reconocimiento matematico.

El modelo resuelve un problema concreto y tecnicamente dificil: convertir imagenes de formulas matematicas manuscritas en representacion LaTeX estructurada, una tarea relevante para digitalizacion de apuntes, correccion automatica de examenes, accesibilidad y pipelines de documentacion cientifica. Al estar disponible en multiples cuantizaciones GGUF (desde Q2_K hasta f16), puede desplegarse en hardware modesto, incluyendo GPUs de consumo, lo que lo hace accesible para prototipado e integracion en herramientas de escritorio.

Con 4.205.751.296 parametros totales y licencia Apache 2.0, el modelo se posiciona como una opcion ligera y permisiva para tareas de OCR matematico, aunque su alcance declarado se limita al idioma ingles y a la tarea HMER, sin que se hayan publicado especificaciones detalladas de contexto, arquitectura interna o benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language basada en Qwen3.5 (detalles internos no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Uni-MuMER-Qwen3.5-4B, construido sobre Qwen3.5, un transformer de 4B parametros con capacidad multimodal (vision-language). La especializacion se orienta a HMER (reconocimiento de expresiones matematicas manuscritas) y a la generacion de LaTeX, segun las etiquetas y la descripcion del repositorio. El dataset de entrenamiento declarado es phxember/Uni-MuMER-Data, aunque no se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion principal del artefacto publicado por mradermacher es la cuantizacion estatica del modelo base a GGUF, con un fichero mmproj separado (en Q8_0 y f16) que actua como suplemento multimodal para el procesamiento de imagenes. No se dispone de detalles sobre innovaciones arquitectonicas adicionales como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

## Capacidades

- Reconocimiento de matematicas manuscritas (HMER): transcripcion de expresiones matematicas escritas a mano a codigo LaTeX.
- Generacion de LaTeX estructurado a partir de imagenes de formulas.
- Procesamiento vision-language: el fichero mmproj permite el tratamiento de entradas de imagen junto con texto.
- Conversacion multi-turno (tag conversational en el repositorio).
- Capacidades generales heredadas de Qwen3.5 de 4B (generacion de texto en ingles).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de apuntes manuscritos: el modelo puede procesar imagenes de cuadernos con formulas matematicas y devolver LaTeX editable, lo que facilita la conversion de material docente en documentos digitales estructurados.
- Correccion automatica de examenes: integrado en un pipeline que recibe fotografias de respuestas manuscritas, transcribe las expresiones a LaTeX y permite su evaluacion simbolica o comparacion con la solucion esperada.
- Accesibilidad para contenido cientifico: conversion de formulas manuscritas en representaciones legibles por lectores de pantalla y herramientas de sintesis de voz especializadas en notacion matematica.
- Asistencia a investigadores: transcripcion rapida de derivaciones y ecuaciones escritas en pizarra o papel durante reuniones, generando fragmentos LaTeX listos para incorporar a articulos.
- Herramientas de escritorio y plugins de edicion: al disponer de cuantizaciones pequenas (Q4_K_S de 2,7 GB), puede empaquetarse en aplicaciones locales de toma de notas que transcriban formulas sin conexion.
- Pipelines de documentacion tecnica: extraccion de formulas de imagenes escaneadas para su inclusion en documentacion generada, aprovechando la salida LaTeX directamente consumible por generadores de documentos.
- Prototipado e investigacion en HMER: la licencia Apache 2.0 y el formato GGUF permiten experimentar con el modelo en entornos de investigacion y compararlo con otros sistemas de reconocimiento matematico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB (Q2_K) hasta 4,6 GB (Q8_0) para los pesos del modelo, mas el fichero mmproj (0,5 GB en Q8_0 o 0,8 GB en f16) para el procesamiento de imagenes. La version f16 completa ocupa 8,5 GB.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, tarjetas con 6-8 GB de VRAM o mas son suficientes para las cuantizaciones Q4-Q8, y GPUs de datacenter (A100, H100) no son necesarias para este tamano.
- Cabe en GPU de consumo: si. Con cuantizaciones Q4_K_S (2,7 GB) o Q4_K_M (2,8 GB) es viable en tarjetas como RTX 3060, RTX 4060 o superiores; las cuantizaciones Q2-Q3 podrian ejecutarse incluso en GPUs con 4 GB.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) por el formato GGUF; el tag endpoints_compatible sugiere compatibilidad con servidores de inferencia tipo endpoint, aunque no se detalla. Para el modelo base en safetensors, transformers/vLLM serian las opciones naturales, si bien vLLM no se menciona en la informacion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la informacion proporcionada. A continuacion se indican modelos de la misma categoria (vision-language de ~4B para OCR/documentos) con los datos disponibles publicamente, marcando como no disponible lo que no se puede confirmar:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Uni-MuMER-Qwen3.5-4B (este) | 4,2B | no disponible | Apache 2.0 | HMER / LaTeX |
| Qwen2.5-VL-3B | ~3,8B | 32K (segun documentacion publica) | Apache 2.0 | Vision-language general |
| Qwen2.5-VL-7B | ~8,3B | 32K (segun documentacion publica) | Apache 2.0 | Vision-language general |
| GOT-OCR2.0 | ~580M | no disponible | Apache 2.0 | OCR general y matematico |

La comparacion de rendimiento entre estos modelos no esta disponible en la informacion proporcionada; los datos de contexto y parametros de las alternativas provienen de su documentacion publica y deben verificarse en sus repositorios oficiales.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente soporte de ingles, por lo que su uso con contenido en castellano u otros idiomas no esta garantizado.
- Alcance especializado: esta orientado a HMER y generacion de LaTeX; su rendimiento en tareas generales de vision-language puede ser inferior al de modelos generalistas del mismo tamano.
- Riesgo de alucinacion: como modelo generativo, puede producir LaTeX sintacticamente valido pero incorrecto respecto a la imagen de entrada; se recomienda validacion y, en su caso, renderizado comparativo.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al entrenarse sobre un dataset concreto (phxember/Uni-MuMER-Data), puede heredar sus sesgos de dominio y estilo de notacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene conservar los avisos de licencia y verificar las condiciones del modelo base original.
- Caveats de produccion: no se especifican la longitud de contexto ni los requisitos exactos de prompt; el uso del fichero mmproj es imprescindible para entradas de imagen. La cuantizacion Q3_K_M se marca como de menor calidad en la propia model card.
- Datos incompletos: no hay informacion publicada sobre benchmarks, contexto, datos de entrenamiento detallados ni proceso de alineacion, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Uni-MuMER-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/phxember/Uni-MuMER-Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/phxember/Uni-MuMER-Data
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Uni-MuMER-Qwen3.5-4B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Uni-MuMER-Qwen3.5-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
