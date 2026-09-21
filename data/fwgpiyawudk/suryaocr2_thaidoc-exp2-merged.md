# fwgpiyawudk/SuryaOCR2_ThaiDoc-exp2-merged

## Resumen

SuryaOCR2_ThaiDoc-exp2-merged es un modelo multimodal de tipo imagen-texto alojado en HuggingFace por el usuario fwgpiyawudk. Por el nombre del repositorio, todo apunta a un ajuste fino orientado a OCR sobre documentos tailandeses, construido a partir de un modelo base etiquetado con la arquitectura `qwen3_5` y fusionado posteriormente ("merged"), un procedimiento habitual cuando se parte de un adaptador LoRA y se integra en los pesos completos. El repositorio esta marcado con las etiquetas `trl`, `sft` y `conversational`, lo que sugiere un entrenamiento supervisado sobre datos conversacionales multimodales.

El modelo cuenta con 665.701.440 parametros reales segun los pesos en safetensors, lo que lo situa en la franja de los modelos pequenos (aproximadamente 0,67 mil millones de parametros) y lo hace desplegable en hardware de consumo. El repositorio ocupa 1,3 GB, coherente con pesos en precision de 16 bits mas el codificador visual. A pesar de ello, la model card publicada es la plantilla automatica de HuggingFace y no contiene informacion sustantiva: no declara autor, datos de entrenamiento, licencia, idiomas ni resultados de evaluacion.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente descriptiva: se trata de un checkpoint sin documentacion, con cero descargas y cero interacciones en el momento de la consulta, cuya utilidad practica no puede validarse sin pruebas propias. Se recomienda tratarlo como un experimento y no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; la etiqueta del repositorio indica `qwen3_5` (transformer multimodal, presumiblemente vision-language) |
| Parametros totales | 665.701.440 (aproximadamente 0,67 mil millones) |
| Parametros activos | no aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | no disponibles; el nombre del repositorio sugiere tailandes e ingles, sin confirmacion |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 1,3 GB |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura. La etiqueta `qwen3_5` del repositorio apunta a la familia Qwen 3.5 como base, y el pipeline `image-text-to-text` confirma que se trata de un modelo vision-language capaz de aceptar imagenes junto con texto. El sufijo "merged" es habitual en checkpoints en los que los pesos de un adaptador entrenado por separado se fusionan con el modelo base para distribuirlos como un unico conjunto de safetensors.

En cuanto al entrenamiento, las etiquetas `trl` y `sft` indican que se ha utilizado la libreria TRL de HuggingFace para un ajuste supervisado (supervised fine-tuning), y la etiqueta `conversational` sugiere que el formato de los datos era de dialogo. El nombre `ThaiDoc` apunta a un corpus de documentos tailandeses, y `exp2` a un segundo experimento dentro de una serie. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, las hiperparametros empleados ni las innovaciones tecnicas aplicadas. La etiqueta `arxiv:1910.09700` corresponde a la referencia generica de la calculadora de impacto ambiental de Lacoste et al. (2019) que HuggingFace inserta en la plantilla por defecto, no a un articulo propio del modelo.

## Capacidades

- Generacion de texto condicionada por imagen, segun el pipeline `image-text-to-text` declarado.
- Extraccion de texto en imagenes (OCR) como caso de uso principal inferido del nombre del repositorio, orientado a documentos tailandeses.
- Procesamiento conversacional multi-turno con entrada visual, segun la etiqueta `conversational`.
- Compatibilidad con endpoints de inferencia de HuggingFace, segun la etiqueta `endpoints_compatible`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara ningun idioma en la model card.
- Capacidades especiales (modo thinking, audio, vision adicional): no disponibles; solo se confirma la entrada de imagen.

## Casos de uso

- Digitalizacion de facturas y recibos tailandeses: el modelo puede recibir la imagen de un documento y devolver el texto y los campos estructurados, aprovechando su naturaleza vision-language para evitar un pipeline OCR mas reglas heuristicas.
- Extraccion de tablas en informes financieros: al ser un modelo generativo sobre imagen, permite pedir directamente una representacion en Markdown o CSV de la tabla detectada, reduciendo el post-procesado respecto a un OCR clasico.
- Indexacion de archivos historicos escaneados: conversion masiva de documentos a texto plano para alimentar un motor de busqueda o un sistema RAG, con el modelo ejecutandose en lote sobre GPU modesta.
- Automatizacion de formularios administrativos: lectura de campos manuscritos o impresos en formularios publicos tailandeses y volcado a una base de datos estructurada.
- Conversion de PDF escaneado a Markdown: generacion de documentacion tecnica o manuales en formato reutilizable a partir de digitalizaciones de baja calidad.
- Verificacion documental en procesos KYC: extraccion de los campos de un documento de identidad o contrato para su validacion automatica contra un registro, siempre que se valide antes la precision real del modelo.
- Preprocesado en pipelines de traduccion: obtencion del texto tailandes a partir de imagenes para alimentar despues un modelo de traduccion especializado.

En todos los casos, dado que no existen benchmarks ni documentacion, es imprescindible realizar una evaluacion propia sobre el dominio concreto antes de considerar su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en fp16, en torno a 0,8 GB en int8 y unos 0,5 GB en int4, sin contar el codificador visual ni el coste de las activaciones con imagenes de alta resolucion.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente por tamano de modelo; una RTX 3060, RTX 4060, RTX 4090 o una A100 sirven, pero en este rango de parametros el factor limitante sera el codificador visual y la resolucion de entrada, no los pesos del modelo de lenguaje.
- Cabe en GPU de consumo: si, con practicamente cualquier GPU moderna de 6-8 GB en adelante, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` de forma nativa; vLLM y TGI son viables si la arquitectura base esta soportada por esas librerias; llama.cpp u Ollama requeririan convertir previamente los pesos a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo analizado, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos proceden de la documentacion publica de cada proyecto y deben verificarse antes de usarse.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SuryaOCR2_ThaiDoc-exp2-merged | 665.701.440 | no disponible | no disponible | HuggingFace |
| Surya (kit de OCR) | no disponible | no disponible | no disponible | Codigo abierto |
| Qwen2.5-VL-3B | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de informacion suficiente para establecer una comparacion de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card es la plantilla automatica de HuggingFace y no aporta ninguna informacion sobre sesgos, riesgos o limitaciones.
- No se declara licencia, por lo que no puede asumirse que el uso comercial este permitido; en ausencia de licencia explicita, los derechos quedan reservados por defecto.
- No se declaran los idiomas soportados ni el alcance real del ajuste en tailandes; el comportamiento fuera de ese dominio es desconocido.
- Riesgo de alucinacion no evaluado: al ser un modelo generativo aplicado a OCR, puede producir texto plausible que no aparece en la imagen, un fallo especialmente grave en contextos documentales o legales.
- El repositorio presenta cero descargas y cero interacciones, sin evidencia de validacion por parte de terceros.
- No se publican cuantizaciones, por lo que el despliegue en entornos con restricciones de memoria exige conversiones propias.
- No hay informacion sobre la composicion del dataset de entrenamiento, lo que impide auditar sesgos demograficos, linguisticos o de dominio.
- Al derivar de un modelo base de la familia Qwen, el checkpoint hereda las limitaciones de dicho modelo base, que tampoco se documentan aqui.
- La fecha de creacion del repositorio registrada en HuggingFace es posterior a la fecha actual, lo que sugiere una posible incoherencia en los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fwgpiyawudk/SuryaOCR2_ThaiDoc-exp2-merged
- Referencia de la etiqueta `arxiv:1910.09700` (calculadora de impacto ambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- No se han encontrado otros enlaces relevantes (papers, repositorios, demos o blogs) en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo.
