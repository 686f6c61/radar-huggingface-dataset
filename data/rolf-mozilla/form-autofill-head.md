# rolf-mozilla/form-autofill-head

## Resumen

`form-autofill-head` es una cabeza de clasificación (fusion head) en fp32 diseñada para complementar al codificador TinyBERT `rolf-mozilla/form-autofill-embed` dentro del sistema de autocompletado de formularios de Firefox. No es un modelo de lenguaje autónomo: recibe representaciones ya calculadas por el encoder y las proyecta sobre 66 clases de tipos de campo de formulario (nombre, correo, teléfono, dirección, etc.).

Técnicamente es una red feed-forward muy pequeña: una capa lineal que reduce el vector concatenado de 1560 dimensiones a 312, una activación GELU con aproximación erf y una segunda capa lineal que produce 66 logits. El vector de entrada de 1560 dimensiones se construye concatenando cinco representaciones de 312 dimensiones cada una: el embedding del campo actual, el del campo anterior, el del siguiente y las diferencias `e_cur - e_prev` y `e_cur - e_next`. Esta concatenación aporta contexto local de vecindad al clasificador.

El modelo está publicado en formato ONNX, lo que sugiere un despliegue orientado a inferencia en navegador o en servicios ligeros. Es relevante para quien quiera reproducir o extender el pipeline de autofill de Firefox, aunque la información pública es muy escasa: no hay model card extendida, ni licencia declarada, ni idiomas especificados más allá de la mención a que es un modelo en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red feed-forward (Linear 1560→312, GELU erf, Linear 312→66) sobre embeddings de TinyBERT |
| Parametros totales | no disponible (estimación: ~508.000 en las dos capas lineales, sin contar sesgos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del encoder `form-autofill-embed`; la cabeza procesa un vector fijo de 1560 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | inglés (según la model card) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La cabeza es una MLP de dos capas sin normalización ni dropout declarados: `Linear(1560, 312)` seguida de `GELU(erf)` y `Linear(312, 66)`. La entrada `fused` de 1560 dimensiones se obtiene concatenando cinco vectores de 312 dimensiones derivados del encoder TinyBERT: embedding del campo actual (`e_cur`), del campo previo (`e_prev`), del campo siguiente (`e_next`) y las diferencias `e_cur - e_prev` y `e_cur - e_next`. Esta construcción incorpora información de contexto secuencial del formulario sin necesidad de un modelo de secuencia adicional.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de las muestras, ni sobre si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documenta la función de pérdida ni el esquema de validación. La única información técnica disponible es la topología de la red y el contrato de entrada/salida descrito en la model card.

## Capacidades

- Clasificación de campos de formulario en 66 categorías predefinidas (el mapeo `id2label` está en el `config.json` del repositorio).
- Aprovechamiento de contexto local: incorpora los campos anterior y siguiente mediante concatenación y diferencias de embeddings.
- Inferencia en formato ONNX, adecuada para ejecución en entornos con runtime ONNX (incluido el navegador mediante ONNX Runtime Web, aunque esto no se confirma en la model card).
- Integración con el encoder `rolf-mozilla/form-autofill-embed`; no funciona de forma autónoma sin él.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- Modelo monolingüe en inglés según la model card.

## Casos de uso

- Autocompletado de formularios web en Firefox: la cabeza clasifica cada campo visible y permite al navegador sugerir el dato adecuado del perfil del usuario (nombre, correo, dirección). Es el caso de uso original para el que se diseñó.
- Integración en extensiones de navegador: cualquier extensión que necesite identificar tipos de campo puede reutilizar el par encoder-cabeza siempre que respete el contrato de entrada de 1560 dimensiones.
- Pipelines de extracción de datos en formularios HTML: clasificar campos de formularios scrapeados para mapearlos a un esquema canónico antes de poblar bases de datos.
- Testing automatizado de formularios: un runner de tests puede usar la clasificación para verificar que los campos están correctamente etiquetados y que los selectores apuntan al tipo esperado.
- Preprocesado para RPA (automatización robótica de procesos): identificar campos en portales legacy antes de rellenarlos con datos de un sistema corporativo.
- Investigación sobre clasificación de campos con contexto secuencial: la construcción `e_cur - e_prev` y `e_cur - e_next` es un patrón reutilizable para experimentos con modelos pequeños y latencia baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 10 MB en fp32 para la cabeza (dos matrices de 1560×312 y 312×66); el consumo real vendrá dominado por el encoder TinyBERT asociado, del orden de decenas de MB.
- GPU recomendadas: no requiere GPU; la cabeza está pensada para ejecutarse en CPU, incluido el entorno del navegador.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles; también es viable en CPU sin aceleración.
- Opciones de despliegue: ONNX Runtime (nativo o Web), y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño de la red, se espera latencia de microsegundos a milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| rolf-mozilla/form-autofill-head | Cabeza de clasificación sobre embeddings | ~0,5 M (estimado) | no aplica (vector fijo 1560) | no disponible | ONNX |
| rolf-mozilla/form-autofill-embed | Encoder TinyBERT | no disponible | no disponible | no disponible | no disponible |
| Alternativas genéricas de clasificación de campos (p. ej. modelos BERT fine-tuned para NER de formularios) | Transformer completo | 100 M+ | 512 típico | variable | safetensors/ONNX |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas; los datos de rendimiento, licencia y contexto de los modelos comparables no están publicados en la información disponible.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de propósito general; solo clasifica campos de formulario y depende del encoder `form-autofill-embed` para producir la entrada.
- Idioma: la model card indica inglés; el rendimiento en formularios en castellano u otros idiomas no está documentado.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor; el repositorio no incluye un archivo de licencia visible en la información proporcionada.
- Sesgos: al entrenarse presumiblemente con formularios web, puede heredar sesgos de los esquemas de campos predominantes (por ejemplo, convenciones de nombres y direcciones anglosajonas).
- Riesgo de alucinación: bajo en el sentido generativo, pero puede producir clasificaciones erróneas en campos ambiguos o mal etiquetados.
- Madurez: 31 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en producción fuera del ecosistema Firefox.
- Compatibilidad: el contrato de entrada exige exactamente 1560 dimensiones; cualquier cambio en el encoder invalida la cabeza.
- No hay información sobre calibración, umbrales de confianza ni métricas de error por clase.

## Enlaces

- Hugging Face: https://huggingface.co/rolf-mozilla/form-autofill-head
- Encoder asociado: https://huggingface.co/rolf-mozilla/form-autofill-embed
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
