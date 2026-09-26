# pinecoresystems/Huihui-Qwen3-VL-4B-Instruct-abliterated

## Resumen

Este repositorio es un espejo (mirror) sin restricción de acceso del modelo `huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated`, republicado por el usuario `pinecoresystems` (TinyPine) para que sus aplicaciones puedan instalar los pesos desde un repositorio bajo su propio control. Segun la propia model card, los ficheros son identicos byte a byte a los del repositorio de origen, y el unico cambio es la envoltura del repositorio: licencia Apache 2.0, copia literal de la model card original en `UPSTREAM-README.md` y exclusion de ficheros que el publicador no descarga.

El modelo subyacente es una version "abliterated" del Qwen3-VL-4B-Instruct, es decir, un modelo multimodal de vision y lenguaje de la familia Qwen3-VL al que se le ha aplicado la tecnica de abliteration (ortogonalizacion de las direcciones de pesos asociadas a la negativa a responder) para reducir el comportamiento de rechazo. El tag `qwen3_vl` y los ficheros `preprocessor_config.json` y `video_preprocessor_config.json` confirman que se trata de un transformer denso con torre de vision y soporte declarado de entrada de video, con 4.437.815.808 parametros totales segun los pesos en safetensors.

Su relevancia practica es acotada y muy concreta: no aporta innovacion tecnica propia, sino disponibilidad. Para equipos que necesitan un modelo vision-lenguaje pequeno (4,4 B) con licencia Apache 2.0, sin proceso de solicitud de acceso (ungated) y con comportamiento de rechazo atenuado, este espejo elimina la dependencia del repositorio de un tercero. Conviene tener en cuenta que el repositorio acumula 0 descargas y 0 "likes", por lo que no cuenta con validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_vl`), con torre de vision y preprocesador de video; sin confirmacion de detalles internos en la informacion disponible |
| Parametros totales | 4.437.815.808 (aproximadamente 4,44 B), segun los safetensors publicados |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican pesos cuantizados; el repositorio contiene unicamente safetensors (2 fragmentos). Compatibilidad con GGUF/AWQ/GPTQ no confirmada |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors` + `model.safetensors.index.json`) |
| Tamano del repositorio | 2 fragmentos de pesos, mas tokenizer (`tokenizer.json`, `vocab.json`, `merges.txt`), plantilla de chat (`chat_template.jinja`) y preprocesadores de imagen y video |
| Modelo base | `huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated` (a su vez derivado de Qwen3-VL-4B-Instruct) |
| Acceso | Sin restricciones (ungated) |
| Fecha de creacion declarada | 26 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento en los materiales proporcionados. El repositorio es explicitamente un espejo: la model card indica que los ficheros son identicos byte a byte a los del repositorio de origen y que se puede verificar comparando el sha256 de cada fichero con el oid de LFS del origen. Por tanto, no hay entrenamiento adicional, ajuste fino ni destilacion por parte de `pinecoresystems`; cualquier propiedad del modelo (arquitectura, datos de preentrenamiento, fases de instruction tuning, RLHF o DPO) procede del linaje Qwen3-VL-4B-Instruct y de la intervencion de abliteration realizada por `huihui-ai`.

La unica transformacion tecnica relevante en el linaje es la abliteration, aplicada por el autor upstream. Esta tecnica suele consistir en identificar las direcciones del espacio de activaciones o de pesos que correlacionan con la respuesta de rechazo y proyectar los pesos ortogonalmente a esas direcciones, de forma que el modelo conserva sus capacidades generativas pero pierde parte del comportamiento de negativa. Es una modificacion de pesos, no un reentrenamiento, por lo que no requiere dataset ni computo de entrenamiento a gran escala; el coste es una posible degradacion de la coherencia en dominios sensibles. Se desconoce el detalle exacto del procedimiento aplicado, el numero de capas afectadas y las metricas de evaluacion usadas para verificar la perdida de capacidad.

Los ficheros `preprocessor_config.json` y `video_preprocessor_config.json` indican que la entrada no es solo texto e imagen estatica, sino que la arquitectura contempla procesamiento de video. No se dispone de informacion sobre resolucion de entrada, numero de frames admitidos ni estrategia de fusion de tokens visuales.

## Capacidades

- Generacion de texto en modo conversacional, a partir de la plantilla `chat_template.jinja` incluida en el repositorio.
- Comprension de imagen segun el tag `qwen3_vl` y la presencia de `preprocessor_config.json`.
- Procesamiento de entrada de video, segun la presencia de `video_preprocessor_config.json`.
- Comportamiento de rechazo atenuado respecto al modelo instruct original, como consecuencia de la abliteration.
- Tool calling / function calling: no confirmado en la informacion proporcionada; depende de la plantilla de chat y del runtime, no verificable con los datos disponibles.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas en el repositorio).
- Modo de razonamiento explicito ("thinking"): no disponible.

## Casos de uso

- Procesamiento local de documentos escaneados: al ser un modelo de 4,4 B con torre de vision, puede extraer texto y estructura de facturas, formularios o albaranes en una maquina con GPU de consumo, sin enviar datos a una API externa.
- Moderacion y analisis de contenido con baja tasa de rechazo: el uso previsto de las variantes abliterated es el analisis de material sensible (por ejemplo, clasificacion de texto o imagen potencialmente conflictivo) donde un modelo instruct estandar declinaria responder; requiere revision humana obligatoria y cumplimiento normativo.
- Descripcion automatica de imagenes y video en pipelines de catalogacion: la presencia del preprocesador de video permite generar metadatos para bibliotecas audiovisuales, aunque la resolucion y el numero de frames soportados no estan documentados.
- Prototipado de asistentes multimodales en entornos aislados: el modelo cabe en una GPU de consumo con cuantizacion, lo que permite iterar sobre prompts y plantillas sin coste de API.
- Investigacion sobre alineacion y seguridad: sirve como sujeto de comparacion frente al modelo instruct sin modificar para estudiar cuanto del comportamiento de rechazo es removible mediante ortogonalizacion de pesos y que capacidades se degradan en el proceso.
- Despliegue interno sin dependencia de proveedores externos: al estar publicado sin restriccion de acceso y con licencia Apache 2.0, se puede distribuir dentro de una organizacion y versionar los pesos en un registro propio, que es precisamente el motivo declarado del espejo.
- Pruebas de integracion de runtimes multimodales (vLLM, TGI u otros compatibles con Qwen3-VL): util para validar el soporte de vision y video de un servidor de inferencia antes de adoptar un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del espejo no incluye tablas de evaluacion, y no se han encontrado resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales (MMBench, MMMU, VideoMME) en la busqueda web realizada. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir de los 4,44 B de parametros (estimaciones teoricas de peso, sin incluir cache KV ni activaciones de vision):
  - BF16/FP16: aproximadamente 8,9 GB de pesos; con cache KV y preprocesado de imagen se recomienda reservar entre 12 y 16 GB.
  - INT8: aproximadamente 4,5 GB de pesos; entre 8 y 10 GB en total.
  - INT4: aproximadamente 2,5 a 3 GB de pesos; entre 5 y 7 GB en total.
- GPU recomendadas:
  - Consumer: RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 en BF16; cualquier GPU con 8 GB o mas si se cuantiza a INT8 o INT4.
  - Profesional/datacenter: NVIDIA L4, A10G, A100 40/80 GB y H100 para lotes grandes o contextos largos.
- Cabe en GPU de consumo: si, con cuantizacion en GPUs de 8 GB y en BF16 en GPUs de 12 GB o superiores, siempre que la longitud de contexto y el numero de imagenes por peticion no eleven demasiado la cache KV y las activaciones visuales.
- Opciones de despliegue: el repositorio solo contiene safetensors, por lo que es directamente cargable por Transformers y por servidores que soporten el tag `qwen3_vl` (vLLM, TGI, SGLang). Para llama.cpp u Ollama haria falta una conversion a GGUF no publicada en este repositorio y no verificada.
- Latencia y throughput: no disponibles.
- Almacenamiento: los dos fragmentos de safetensors en BF16 ocupan del orden de 9 GB, mas tokenizer y ficheros de configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Acceso | Licencia | Formato | Comportamiento de rechazo | Descargas/likes |
|---|---|---|---|---|---|---|
| `pinecoresystems/Huihui-Qwen3-VL-4B-Instruct-abliterated` (este repositorio) | 4,44 B | Ungated | Apache 2.0 | Safetensors (2 fragmentos) | Atenuado (abliterated) | 0 / 0 |
| `huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated` (origen) | 4,44 B (mismos ficheros) | No disponible | Apache 2.0 | Safetensors | Atenuado (abliterated) | No disponible |
| Qwen3-VL-4B-Instruct (modelo original de la familia) | Aproximadamente 4 B | No disponible | Apache 2.0 (no confirmado en la informacion proporcionada) | Safetensors | Estandar alineado | No disponible |

Las diferencias entre este espejo y el repositorio de origen son exclusivamente de disponibilidad y control del repositorio, no de pesos ni de comportamiento, segun la propia model card. No se dispone de datos de contexto, benchmarks ni idiomas para ninguno de los tres, por lo que la comparacion cuantitativa de rendimiento no es posible con la informacion disponible. Como alternativa de otra familia y tamano similar se podria considerar modelos vision-lenguaje de 3 a 4 B, pero no se han verificado datos comparables en la busqueda realizada.

## Limitaciones y advertencias

- La abliteration reduce la tasa de rechazo, pero no elimina necesariamente la capacidad de generar contenido danino, ilegal o inseguro. No debe desplegarse en produccion de cara al publico sin filtros externos y sin una evaluacion de seguridad propia.
- La abliteration puede degradar la coherencia y la calidad en dominios sensibles o complejos; no se han publicado evaluaciones que cuantifiquen esa perdida en este modelo concreto.
- Riesgo de alucinacion: inherente a cualquier modelo de 4,4 B de esta familia; no hay datos especificos de este repositorio.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de redactar la ficha. No hay evidencia externa de que los pesos se hayan probado mas alla del autor del espejo.
- Datos ausentes en el repositorio: no se documentan idiomas soportados, longitud de contexto, resolucion de imagen, numero de frames de video, ni resultados de benchmarks.
- No hay pesos GGUF publicados en este repositorio, por lo que el despliegue con llama.cpp u Ollama requiere convertir los safetensors, con el riesgo de error que ello implica.
- Integridad de los pesos: la model card afirma que los ficheros son identicos byte a byte al origen y propone verificar el sha256 de cada fichero contra el oid de LFS del repositorio original. Esa verificacion no se ha realizado en esta ficha y es responsabilidad del usuario antes de usar los pesos en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero el publicador del espejo declara no estar afiliado ni respaldado por los autores upstream. Conviene revisar el fichero `LICENSE`/`NOTICE` del repositorio y el `UPSTREAM-README.md` antes de un despliegue comercial.
- Metadatos dudosos: la fecha de creacion declarada es el 26 de septiembre de 2026, posterior a la actualizacion del mismo dia, lo que sugiere una anomalia o una fecha futura en los metadatos de HuggingFace. Conviene no basar decisiones de versionado en esas marcas de tiempo.
- La busqueda web asociada no ha devuelto documentacion tecnica relevante (unicamente paginas genericas de comercio electronico), por lo que no hay fuentes externas que confirmen las caracteristicas del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pinecoresystems/Huihui-Qwen3-VL-4B-Instruct-abliterated
- Modelo de origen (upstream): https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-4B-Instruct-abliterated
- Fichero con la model card original, incluido en el repositorio: `UPSTREAM-README.md`
- Papers, blogs, repositorios y demos adicionales: no disponibles en la informacion proporcionada.
