# mradermacher/Back2Struct-Image2SVG-7B-GGUF

## Resumen

Back2Struct-Image2SVG-7B-GGUF es una distribucion en formato GGUF del modelo Pengyu965/Back2Struct-Image2SVG-7B, un modelo de vision-lenguaje orientado a la conversion de imagenes (iconos, logotipos, diagramas, bocetos) en codigo SVG vectorial. La publica mradermacher, un cuantizador conocido en Hugging Face por generar versiones GGUF estaticas de modelos de terceros, no el autor original del modelo.

El repositorio no incluye model card tecnica propia: unicamente metadatos de cuantizacion (quantize_version 2, convert_type hf, output_tensor_quantised 1) y la lista de cuantizaciones generadas. El modelo base cuenta con 7.615.616.512 parametros (aproximadamente 7,6 mil millones), lo que lo situa en la gama de 7B-8B tipica de los VLM abiertos actuales, con un tamano de repositorio de 24,9 GB repartido entre los distintos niveles de cuantizacion.

Su relevancia es practica: permite ejecutar localmente, mediante llama.cpp u Ollama, una tarea de vectorizacion imagen-SVG que historicamente requeria herramientas de trazado clasicas o modelos especializados de mayor coste. Al no existir documentacion del autor de la cuantizacion ni resultados publicados, la evaluacion debe hacerse por prueba directa, y la licencia del modelo base no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor de la cuantizacion no la documenta; el modelo base es un modelo de vision-lenguaje para generacion de SVG) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,62 B) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de cuantizaciones estaticas derivadas de Pengyu965/Back2Struct-Image2SVG-7B) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento. La model card del repositorio GGUF contiene exclusivamente comentarios de configuracion del pipeline de cuantizacion (quantize_version: 2, output_tensor_quantised: 1, convert_type: hf) y la lista de cuantizaciones publicadas. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste por instrucciones, RLHF o DPO.

Por el nombre del modelo base (Back2Struct-Image2SVG-7B) y por la etiqueta conversational del repositorio, se trata de un modelo multimodal que acepta imagenes como entrada y produce texto estructurado (codigo SVG). El autor de la cuantizacion no especifica si el repositorio incluye el proyector multimodal (mmproj) necesario para procesar imagenes en llama.cpp; el campo skip_mmproj aparece vacio en los metadatos, pero no se confirma la presencia de dicho fichero. Esta es la verificacion tecnica prioritaria antes de intentar cualquier inferencia con imagenes.

## Capacidades

- Generacion de SVG a partir de imagenes: es la funcion principal declarada por el nombre del modelo base.
- Vectorizacion de graficos raster: iconos, logotipos y, segun el tipo de modelo, diagramas tecnicos.
- Salida en texto estructurado: el resultado esperado es marcado SVG editable, no una imagen raster.
- Conversacion: el repositorio esta etiquetado como conversational, lo que sugiere soporte de dialogos multi-turno, aunque no hay documentacion que lo detalle.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que el artefacto puede servirse a traves de infraestructura de inferencia compatible con GGUF.
- Tool calling, function calling, agentes, modo thinking, audio y vision general: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Vectorizacion de logotipos en estudios de diseno: el modelo convierte un PNG o JPG de un logotipo en codigo SVG editable, lo que evita el retrazado manual en Illustrator o Inkscape y permite reutilizar la marca en distintos tamanos sin perdida de calidad.
- Generacion de iconografia para interfaces: a partir de capturas o bocetos de iconos, se obtienen ficheros SVG ligeros que pueden integrarse directamente en design systems y repositorios de componentes front-end.
- Digitalizacion de bocetos a mano: fotografias de cuadernos o pizarras se transforman en trazados vectoriales, utiles en talleres de ideacion y en la fase de wireframing de producto.
- Conversion de diagramas tecnicos y esquemas: planos, diagramas de flujo y esquemas de red pueden vectorizarse para incrustarlos en documentacion tecnica con escalado infinito y busqueda de texto.
- Optimizacion de assets web: sustituir imagenes raster por SVG reduce el peso de las paginas y mejora la resolucion en pantallas de alta densidad; el modelo automatiza esa conversion dentro de un pipeline de build.
- Preparacion de material para impresion y corte: los trazados vectoriales son requisito en plotters de corte, serigrafia y grabado laser, donde una imagen raster no es utilizable directamente.
- Automatizacion de catalogos y marketplaces: conversion masiva de miniaturas y pictogramas a SVG para mantener coherencia visual en catalogos de gran volumen.
- Integracion en herramientas de diseno: al ejecutarse en local mediante llama.cpp u Ollama, puede conectarse a plugins o scripts que envien una imagen y reciban el SVG sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas, y no se han encontrado evaluaciones del modelo base ni de sus cuantizaciones en los resultados de busqueda proporcionados.

## Requisitos de hardware

Estimaciones de VRAM para los pesos, calculadas a partir de los 7,62 B de parametros (no incluyen el proyector multimodal ni el coste del encoder visual, que no estan documentados):

- Q2_K: aproximadamente 3,0 GB de VRAM.
- Q4_K_S / Q4_K_M: aproximadamente 4,5-4,9 GB de VRAM.
- Q5_K_S / Q5_K_M: aproximadamente 5,3-5,7 GB de VRAM.
- Q6_K: aproximadamente 6,3 GB de VRAM.
- Q8_0: aproximadamente 8,1 GB de VRAM.
- x-f16: aproximadamente 15,2 GB de VRAM.

Recomendaciones por GPU:

- Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB y RTX 4090 24 GB cubren sin problema desde Q2_K hasta Q8_0; la version f16 requiere 24 GB o reparto entre GPU y CPU.
- Profesional y datacenter: A100 40/80 GB y H100 80 GB para f16 con margen para lotes y contexto amplio.
- GPUs de 6-8 GB: viables con Q2_K, Q3_K_S y Q4_K_S, asumiendo recortes de contexto.
- CPU: llama.cpp permite inferencia en CPU con los quants de menor tamano, pero el procesamiento de imagenes en CPU resulta notablemente mas lento.

Opciones de despliegue:

- llama.cpp (llama-cli y llama-server) con soporte GGUF.
- Ollama, si se importa el Modelfile correspondiente.
- LM Studio y otras interfaces graficas basadas en llama.cpp.
- Docker Model Runner, orientado a servir modelos en formato GGUF.
- vLLM y TGI: soporte de GGUF no confirmado en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Back2Struct-Image2SVG-7B-GGUF (este) | 7,62 B | no disponible | Imagen a SVG | no disponible | GGUF en Hugging Face; 0 descargas y 0 likes |
| Pengyu965/Back2Struct-Image2SVG-7B | no disponible | no disponible | Imagen a SVG | no disponible | Pesos originales en Hugging Face |
| StarVector | no disponible | no disponible | Generacion de SVG (iconos, logotipos, diagramas tecnicos) | no disponible | Proyecto publico en starvector.github.io |
| Otros VLM de 7B-8B para vision general (por ejemplo, variantes de Qwen2.5-VL cuantizadas por el mismo autor) | no disponible | no disponible | Vision-lenguaje general | no disponible | GGUF en Hugging Face |

StarVector es la referencia mas cercana encontrada: se presenta como un modelo fundacional para generacion de SVG con arquitectura de vision-lenguaje, capaz de vectorizar desde iconos y logotipos hasta diagramas tecnicos. No se dispone de datos comparativos de rendimiento entre ambos.

## Limitaciones y advertencias

- Ausencia de model card tecnica: el repositorio solo documenta el pipeline de cuantizacion. No hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni casos de fallo.
- Licencia no declarada: al no indicarse la licencia del modelo base ni de la cuantizacion, no puede confirmarse la legalidad del uso comercial. Es imprescindible verificar la ficha del modelo original antes de cualquier despliegue en produccion.
- Riesgo de salida SVG invalida: los modelos generativos de codigo pueden producir sintaxis XML mal formada, trazados abiertos o paths degenerados; hace falta validacion y saneado posteriores.
- Posible ausencia del proyector multimodal: si el repositorio no incluye el fichero mmproj correspondiente, el modelo no podra procesar imagenes en llama.cpp, lo que invalidaria el caso de uso principal.
- Idiomas no documentados: se desconoce si las instrucciones de entrada pueden formularse en castellano o solo en ingles.
- Longitud de contexto desconocida: no puede garantizarse el procesamiento de imagenes de alta resolucion ni de conversaciones multi-turno largas.
- Falta de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no existen informes independientes de calidad.
- Fidelidad de la vectorizacion: la conversion imagen-SVG tiende a simplificar detalles finos, degradar degradados y perder texto incrustado en la imagen original.
- Fechas de publicacion y actualizacion poco habituales (2026): conviene comprobar la vigencia y el estado real del repositorio antes de depender de el.
- Sesgos: no disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Back2Struct-Image2SVG-7B-GGUF
- Modelo base: https://huggingface.co/Pengyu965/Back2Struct-Image2SVG-7B
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- StarVector (modelo fundacional para generacion de SVG): https://starvector.github.io/starvector/
- Documentacion de Docker Model Runner: https://docs.docker.com/ai/model-runner/
- Ejemplo de otra cuantizacion VLM del mismo autor: https://huggingface.co/mradermacher/Qwen2.5-VL-7B-Instruct-abliterated-GGUF
