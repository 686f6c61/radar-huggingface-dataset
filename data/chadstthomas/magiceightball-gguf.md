# chadstthomas/MagicEightBall-GGUF

## Resumen

MagicEightBall GGUF es un artefacto de decision determinista empaquetado en un contenedor GGUF con una arquitectura personalizada denominada `magiceightball`. No es un modelo de lenguaje neuronal: no contiene pesos de transformer, sino una tabla de decision I8 de 128 bytes que codifica una respuesta booleana, una categoria y una accion propuesta para cada una de las 128 asignaciones de hechos posibles. Lo desarrolla el usuario de Hugging Face chadstthomas y se publica como complemento de un modelo nativo, una variante ONNX y una version FP32 densa del mismo sistema.

El problema que resuelve es acotado y explicito: evaluar una politica de soporte fija sobre texto de entrada y devolver un resultado estructurado (`may_route`, `category`, `action`) que el llamante debe revisar. El runner de CPU incluido acepta hasta 131.072 tokens del tokenizer Needle 3 de Cactus Compute, reempaquetado sin perdida y distribuido bajo Apache-2.0. El contenedor GGUF completo ocupa 1.024 bytes, lo que lo convierte en un caso extremo de despliegue en el borde.

Su relevancia actual es mas documental y de ingenieria que de capacidad: demuestra un patron de empaquetado de reglas deterministas en formato GGUF con verificacion reproducible (128 asignaciones de hechos, 128 fixtures de texto corto, dos documentos en el limite exacto y rechazo a 131.073 tokens). No debe confundirse con un LLM y no es compatible con `llama.cpp`, ya que carece de loader para su arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `magiceightball` personalizada; tabla de decision I8 con un byte empaquetado por asignacion de hechos |
| Parametros totales | 128 (segun safetensors; corresponde a 128 entradas de tabla, no a pesos neuronales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 131.072 tokens Needle 3 en el runner de CPU incluido; rechazo verificado a 131.073 tokens |
| Tipos de cuantizacion | no disponible (el artefacto es una tabla I8 de 1.024 bytes; existen variantes ONNX de 192 bytes y FP32 densa de 1.832 bytes) |
| Idiomas soportados | en |
| Licencia | MIT para reglas de decision y runner; Apache-2.0 para el tokenizer Needle 3 reempaquetado (campo `license: other`, `license_name: mit-and-apache-2.0`) |
| Formato de pesos | GGUF (contenedor con arquitectura propia, sin loader en `llama.cpp`); tambien ONNX y FP32 en repos separados |

## Arquitectura y entrenamiento

No hay entrenamiento. El sistema implementa un motor de reglas determinista: una tabla de decision I8 almacena un byte empaquetado por cada una de las 128 asignaciones de hechos, y el runner de CPU incluido evalua esa tabla contra el texto de entrada tokenizado con Needle 3. La salida es triple: un booleano `may_route`, una categoria (por ejemplo `billing`) y una accion propuesta (por ejemplo `review_billing`), que el llamante recibe como dato para revision humana.

La innovacion tecnica no esta en el aprendizaje sino en el empaquetado y la verificacion. El contenedor GGUF de 1.024 bytes aloja la tabla y los metadatos; el tokenizer compartido, el runner y el material grafico se distribuyen por separado y tienen tamanos propios. La verificacion en CPU cubre las 128 asignaciones de hechos, 128 fixtures de texto corto, dos documentos en el limite exacto de contexto y el rechazo a 131.073 tokens, con informe en `verification.json` y sumas de comprobacion en `SHA256SUMS.txt`. El comportamiento es sensible a negaciones explicitas: anadir `Do not route.` cambia la respuesta a `false` y vacia la accion, manteniendo la categoria `billing`.

## Capacidades

- Clasificacion booleana de elegibilidad de enrutamiento (`may_route`) sobre texto de entrada.
- Asignacion de categoria a partir de frases declaradas en la politica (por ejemplo `billing`).
- Propuesta de accion estructurada (`review_billing`) devuelta como dato para revision.
- Procesamiento de documentos largos: hasta 131.072 tokens Needle 3 con el runner de CPU incluido.
- Reconocimiento de negaciones explicitas que anulan el enrutamiento.
- Rechazo controlado de entradas que exceden el limite de contexto (verificado a 131.073 tokens).
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Multilingue: solo ingles (`en`).

## Casos de uso

- Triaje de tickets de soporte: el runner evalua el texto del ticket contra la politica fija y devuelve `may_route`, `category` y `action`, de modo que el sistema de ticketing puede preclasificar y derivar a revision humana sin coste de inferencia neuronal.
- Pre-filtro determinista antes de un LLM: colocar MagicEightBall delante de un modelo generativo para descartar o etiquetar consultas con una regla auditable de 1.024 bytes, reduciendo llamadas al modelo grande en los casos que la politica ya resuelve.
- Despliegue en el borde con recursos minimos: el contenedor de 1.024 bytes y el runner de CPU permiten ejecutar la politica en dispositivos sin GPU, con verificacion reproducible incluida en el repositorio.
- Cumplimiento y auditoria de reglas: al ser una tabla I8 con 128 asignaciones verificadas una a una, el comportamiento es inspeccionable y reproducible, lo que facilita revisiones de cumplimiento frente a cajas negras neuronales.
- Gestion de disputas de facturacion: el ejemplo de la model card (`Duplicate charge. Review authorized.`) devuelve `billing` y `review_billing`, un patron directamente aplicable a flujos de reclamaciones con reglas de negocio fijas.
- Pruebas de integracion de pipelines: los 128 fixtures de texto corto y los documentos en el limite exacto sirven como suite de regresion para validar tokenizadores y capas de preprocesado en un pipeline mayor.
- Referencia de empaquetado GGUF: util para ingenieros que quieran estudiar como se declara una arquitectura personalizada en GGUF y como se distribuye un runner especifico cuando `llama.cpp` no tiene loader.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta verificacion funcional: 128 asignaciones de hechos superadas, 128 fixtures de texto corto, dos documentos en el limite exacto y rechazo a 131.073 tokens. Los tiempos de ejecucion en CPU y en Intel NCS1 se remiten a la pagina del modelo nativo, sin cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM: no aplica; el runner incluido es de CPU y el contenedor GGUF ocupa 1.024 bytes.
- GPU recomendadas: ninguna; no hay ruta de ejecucion en GPU documentada para esta arquitectura.
- GPU de consumo: irrelevante, el sistema cabe en cualquier entorno con Python y las dependencias `numpy`, `sentencepiece` y `gguf`.
- Despliegue: `python portable_runtime.py model.gguf --text "..."` desde el directorio con los ficheros descargados. No hay soporte en `llama.cpp`, vLLM, TGI ni Ollama, ya que la arquitectura `magiceightball` carece de loader en esas herramientas.
- Latencia y throughput: no disponible en la informacion proporcionada; la model card remite a la comparativa de runtimes de la pagina del modelo nativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MagicEightBall GGUF | 128 entradas de tabla | 131.072 tokens (Needle 3) | GGUF propio, ONNX, FP32 | MIT + Apache-2.0 | Motor de reglas determinista, sin loader en `llama.cpp` |
| MagicEightBall ONNX | no disponible | no disponible | ONNX (192 bytes) | MIT + Apache-2.0 | Misma politica en formato ONNX |
| MagicEightBall FP32 | no disponible | no disponible | FP32 denso (1.832 bytes) | MIT + Apache-2.0 | Variante densa de referencia |
| MagicEightBall nativo | no disponible | no disponible | Nativo (Intel NCS1) | MIT + Apache-2.0 | Ejecucion fisica en NCS1 y packs sectoriales |

No se dispone de modelos comparables de terceros en la informacion proporcionada; las alternativas listadas son variantes del mismo sistema publicadas por el mismo autor.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre ni razona; solo evalua una politica fija y devuelve un resultado estructurado.
- Cobertura limitada a 128 asignaciones de hechos; cualquier caso fuera de la tabla no produce categoria ni accion.
- Solo ingles; no hay soporte multilingue.
- Sin loader en `llama.cpp` ni en otras herramientas estandar; es obligatorio usar el runner de CPU incluido para esta arquitectura.
- Riesgo de alucinacion no aplicable en el sentido neuronal, pero si de falsos positivos o negativos si el texto de entrada activa frases de la politica de forma no prevista; la propia model card insiste en que la accion se devuelve como dato para revision.
- La licencia es mixta: MIT para reglas y runner, Apache-2.0 para el tokenizer Needle 3 reempaquetado; conviene revisar `LICENSE` y `NOTICE.txt` antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.
- El campo `pipeline` no esta disponible y la fecha de creacion registrada (2026-11-21) no permite inferir madurez ni soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chadstthomas/MagicEightBall-GGUF
- Modelo nativo (NCS1 y packs sectoriales): https://huggingface.co/chadstthomas/MagicEightBall
- Variante ONNX: https://huggingface.co/chadstthomas/MagicEightBall-ONNX
- Variante FP32: https://huggingface.co/chadstthomas/MagicEightBall-FP32
- Comparativa de runtimes: https://huggingface.co/chadstthomas/MagicEightBall#runtime-comparison
- Comparativa de tamanos: https://huggingface.co/chadstthomas/MagicEightBall#size-comparisons
- Informe de verificacion: `./verification.json` (en el repositorio)
- Licencia: `./LICENSE` (en el repositorio)
- Procedencia del tokenizer: `./NOTICE.txt` (en el repositorio)
- Sumas de comprobacion: `./SHA256SUMS.txt` (en el repositorio)
