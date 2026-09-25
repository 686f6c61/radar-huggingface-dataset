# lugman-madhiai/invoice-split-2023-only-adapter

## Resumen

`lugman-madhiai/invoice-split-2023-only-adapter` es un adaptador de ajuste fino publicado en Hugging Face por el usuario lugman-madhiai, derivado del modelo `lugman-madhiai/invoice-split-2022` mediante un proceso de *finetuning* incremental. El repositorio ocupa 0,2 GB y contiene pesos en formato `safetensors`, un tamano compatible con un adaptador tipo LoRA y no con un modelo completo, por lo que su funcionamiento exige cargar previamente el modelo base indicado. La etiqueta `qwen3_vl` sugiere que la familia subyacente es Qwen3-VL, un transformer multimodal de vision-lenguaje, aunque la model card no especifica el numero de parametros ni la configuracion concreta.

El nombre del repositorio apunta a una tarea de segmentacion y separacion de facturas dentro de documentos multipagina, un problema habitual en los flujos de cuentas a pagar, donde un unico PDF puede contener varias facturas de proveedores distintos. Un adaptador de este tipo permitiria reutilizar la capacidad multimodal de un modelo grande (lectura de documentos escaneados y texto) anadiendo un comportamiento especializado con un coste de almacenamiento y de entrenamiento muy reducido. El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun declara el autor.

La relevancia practica del modelo es limitada por su escasa validacion externa: en el momento de redactar esta ficha acumula cero descargas y cero *likes*, la model card no incluye resultados de evaluacion ni detalles del dataset, y no se especifica el tamano del modelo base. Debe considerarse, por tanto, un artefacto experimental para validacion interna antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de vision-lenguaje de la familia Qwen3-VL (segun la etiqueta `qwen3_vl`); configuracion interna no disponible |
| Parametros totales | no disponible (el repositorio de 0,2 GB es compatible con un adaptador, no con pesos completos) |
| Parametros activos | no disponible (no hay indicios de que la arquitectura sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; publicado en `safetensors`. El autor entreno con Unsloth, herramienta que soporta carga del modelo base en 4 bits, pero no se confirma para esta publicacion |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (adaptador; requiere el modelo base `lugman-madhiai/invoice-split-2022`) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador de bajo rango (*LoRA*) sobre el modelo `lugman-madhiai/invoice-split-2022`, que a su vez es un ajuste fino de un modelo de la familia Qwen3-VL segun las etiquetas del repositorio y la nomenclatura `qwen3_vl`. Al tratarse de un adaptador, la arquitectura efectiva es la del modelo base: un transformer multimodal capaz de procesar imagenes de documentos y texto. El repositorio no documenta el rango del adaptador, las capas objetivo ni la configuracion de entrenamiento.

En cuanto a los datos, la model card se limita a indicar que el modelo se entreno "2x faster with Unsloth", una afirmacion de rendimiento del proveedor de la herramienta, no un resultado de evaluacion del modelo. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. El nombre del repositorio (`2023-only`) sugiere un entrenamiento restringido a datos de 2023, presumiblemente como adaptador incremental sobre el modelo de 2022, pero esta interpretacion no aparece confirmada en la informacion disponible. Tampoco consta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de texto y procesamiento de documentos: al heredar una base de la familia Qwen3-VL, se le presupone capacidad para interpretar imagenes de documentos ademas de texto, aunque no hay confirmacion explicita en la model card.
- Segmentacion de facturas: la funcion principal inferida del nombre del repositorio es detectar limites entre facturas dentro de un documento multipagina y separarlas.
- Extraccion de datos estructurados: plausible como paso previo a la separacion, si bien no esta documentado.
- Tool calling / function calling: no disponible; no se menciona soporte en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no documentado.
- Capacidades multilingues: no; el modelo declara unicamente ingles (`en`). El castellano no figura entre los idiomas soportados.
- Capacidades especiales (modo *thinking*, audio, etc.): no disponible.

Nota: todas las capacidades funcionales anteriores se infieren del nombre del repositorio y de las etiquetas asociadas, no de una model card detallada ni de evaluaciones publicadas.

## Casos de uso

- Separacion de PDF multipagina en cuentas a pagar: el modelo recibiria un documento con varias facturas concatenadas y devolveria la segmentacion por transaccion, reduciendo el trabajo manual de los equipos de facturacion. Es el caso de uso que da nombre al repositorio.
- Preprocesado para pipelines de OCR y extraccion: situado antes de un extractor de campos (CIF, fecha, lineas de detalle), permitiria entregar a ese extractor documentos ya separados y homogeneos, mejorando la precision de las etapas posteriores.
- Ingesta automatizada en ERP: la salida segmentada podria alimentar la creacion automatica de asientos o registros de proveedor, con validacion humana en los casos de baja confianza.
- Archivado y cumplimiento documental: clasificacion y separacion masiva de lotes historicos de facturas para su almacenamiento con la granularidad correcta por documento.
- Enrutado de documentos a distintos equipos o colas: una vez detectados los limites y el emisor, cada factura puede dirigirse a la cola de aprobacion correspondiente.
- Generacion de datos etiquetados: uso como etiquetador asistido para construir conjuntos de entrenamiento con limites de factura anotados, que despues se revisan manualmente.
- Validacion de proveedores externos de OCR: comparar su salida con la de un pipeline propio para detectar discrepancias en los limites de documento.

En todos los casos, el uso en produccion exige una evaluacion previa sobre datos propios: no hay metricas publicadas que respalden la calidad de la segmentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

El adaptador pesa 0,2 GB, pero la inferencia requiere cargar el modelo base completo, cuyo tamano no se especifica. Las cifras siguientes son estimaciones condicionadas a que la base sea de ~7B, escenario coherente con el otro adaptador del mismo autor basado en `qwen2.5-vl-7b-instruct-bnb-4bit`; deben verificarse antes de cualquier despliegue.

| Escenario | VRAM estimada | GPU recomendada |
|---|---|---|
| Base ~7B en 4 bits | 6-8 GB | RTX 3060 12 GB, RTX 4070, RTX 4090 |
| Base ~7B en 8 bits | 10-12 GB | RTX 4080, RTX 4090, L4 |
| Base ~7B en fp16 | 16-18 GB (mas espacio para imagenes de alta resolucion) | RTX 4090, A10G, L40S, A100 40 GB |
| Base 30B o superior | no disponible | A100 80 GB, H100 |

- Cabe en GPU de consumo con cuantizacion de 4 u 8 bits si la base es de ~7B.
- Opciones de despliegue: al estar etiquetado con `text-generation-inference` y `transformers`, es compatible con TGI; tambien serian viables vLLM y Ollama si existe una conversion del base a GGUF. La carga del adaptador en llama.cpp no esta documentada.
- Latencia y throughput: no disponible. Al procesar imagenes de documentos, el coste depende fuertemente de la resolucion de entrada y del numero de paginas por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lugman-madhiai/invoice-split-2023-only-adapter` | no disponible (adaptador) | no disponible | sin benchmarks publicados | Apache-2.0 | Hugging Face, 0 descargas |
| `lugman-madhiai/invoice-split-2022` | no disponible | no disponible | sin benchmarks publicados | no disponible | Hugging Face (modelo base del anterior) |
| `lugman-madhiai/iykons-invoice-extraction-2107-adapter` | adaptador sobre base de ~7B | no disponible | sin benchmarks publicados | Apache-2.0 | Hugging Face; mismo autor, tarea de extraccion en lugar de separacion |
| `theoddbrick/invoicesplit` (aplicacion) | depende del LLM Qwen usado | no disponible | no disponible | no disponible | Repositorio en GitHub |
| `jsheppard8989/invoice-splitter` (herramienta) | depende de GPT-4o-mini | no disponible | no disponible | no disponible | Repositorio en GitHub |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, metricas ni conjunto de validacion publicados, por lo que la calidad real de la separacion es desconocida.
- Model card minima: no se detallan datos de entrenamiento, hiperparametros, rango del adaptador ni tamano del modelo base.
- Sin validacion de la comunidad: cero descargas y cero *likes* en el momento de redactar la ficha, lo que implica ausencia de retroalimentacion externa.
- Idioma: soporte declarado unicamente en ingles. Documentos en castellano, catalan, gallego o euskera no estan cubiertos y requeririan evaluacion especifica.
- Riesgo de alucinacion: en segmentacion de facturas, un error de limite puede provocar duplicidades o perdidas de importe en el sistema contable; se recomienda validacion humana en un primer periodo.
- Documentos degradados: facturas escaneadas con baja resolucion, sellos, tablas densas o varias columnas pueden degradar la deteccion de limites. No hay informacion sobre el preprocesado de imagen empleado.
- Dependencia del modelo base: el adaptador no es autonomo; hay que descargar `lugman-madhiai/invoice-split-2022` y respetar su licencia, que no se especifica en la informacion disponible.
- Licencia del adaptador: Apache-2.0 permite uso comercial, pero conviene verificar la licencia de la base Qwen3-VL, que puede tener condiciones propias.
- Madurez: por la fecha de creacion y su nomenclatura, parece un experimento interno del autor; no debe asumirse estabilidad de API ni de comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman-madhiai/invoice-split-2023-only-adapter
- Perfil del autor: https://huggingface.co/lugman-madhiai
- Modelo base: https://huggingface.co/lugman-madhiai/invoice-split-2022
- Otro adaptador del mismo autor: https://huggingface.co/lugman-madhiai/iykons-invoice-extraction-2107-adapter
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- Referencia funcional sobre separacion de facturas: https://docmgthelp.docmgt.com/docMgt/AIInvoiceSplit.html
- Aplicacion relacionada en GitHub: https://github.com/theoddbrick/invoicesplit
- Herramienta relacionada en GitHub: https://github.com/jsheppard8989/invoice-splitter
