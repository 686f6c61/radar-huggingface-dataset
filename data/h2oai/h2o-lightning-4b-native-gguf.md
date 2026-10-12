# h2oai/h2o-lightning-4b-native-gguf

## Resumen

H2O Lightning 4B native GGUF es la distribucion en formato GGUF nativo del modelo de decision h2oai/h2o-lightning-4b, publicada por H2O.ai. No es un modelo de chat generativo al uso: esta disenado especificamente para responder consultas estructuradas de decision (eleccion entre categorias cerradas, respuestas si/no calibradas y puntuaciones sobre una escala) a partir de un estado del cliente y un conjunto de preguntas definidas en la peticion. El repositorio contiene los mismos pesos que las versiones BF16 y Q8_0 de h2oai/h2o-lightning-4b-gguf, tensor por tensor, mas metadatos de decision.

La diferencia clave respecto a la version con shim es que estos ficheros incorporan el tipo de decision `h2o-lightning` en el propio GGUF: el binario `llama-server` de llama.cpp responde directamente a `POST /v1/systemone` sin necesidad de una capa intermedia en Python. Para ello se requiere una compilacion de llama.cpp que incluya el tipo de decision propuesto en ggml-org/llama.cpp PR #30361; las compilaciones sin ese soporte rechazan la carga de estos ficheros.

El modelo tiene 4.205.751.296 parametros (~4,2 B), es denso, y trabaja con una ventana de contexto configurada en 40.960 tokens (dejando espacio para un estado de 32.000 tokens mas la pregunta). Incluye un proyector de vision (`mmproj-lightning-f16.gguf`), por lo que admite imagenes enviadas como data URLs. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (pre-tokenizador Qwen2; tipo de decision `h2o-lightning` en GGUF) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens (`-c 40960`); estado de 32.000 tokens mas la pregunta |
| Tipos de cuantizacion | BF16 y Q8_0 en este repo; cuantizaciones inferiores solo en h2oai/h2o-lightning-4b-gguf |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), mas proyector de vision GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de aproximadamente 4,2 B de parametros, con pre-tokenizador de tipo Qwen2 segun los metadatos del GGUF. Sobre esa base, el modelo se ha configurado como modelo de decision mediante metadatos embebidos: el tipo de decision `h2o-lightning`, las temperaturas especificas por tipo de pregunta, la plantilla de prompt y el ajuste del pre-tokenizador Qwen2. Estos metadatos son los que permiten que `llama-server` interprete las peticiones de `/v1/systemone` de forma nativa.

Los tres tipos de pregunta soportados son `choice` (eleccion entre criterios con etiqueta), `noul` (respuesta si/no con probabilidad calibrada) y `score` (puntuacion continua sobre una escala definida en los criterios, con leyenda). El modelo devuelve probabilidades por opcion y un valor de confianza. En el caso de `noul`, las probabilidades son valores calibrados en crudo; el shim original aplica un suelo de 0,801 que desplaza cualquier probabilidad entre 0,199 y 0,801 al extremo mas cercano, de modo que la respuesta no cambia pero se evita una confianza excesivamente baja. Este repo no incluye esa opcion por defecto (el PR #30361 la ignora; existe una rama separada `decision-noul-floor` que la propone).

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Clasificacion y enrutamiento de decisiones: asignacion de una consulta a una categoria entre opciones cerradas con etiqueta (por ejemplo, `billing`, `shipping`, `technical`), devolviendo probabilidades por clase y confianza.
- Respuestas si/no calibradas (tipo `noul`): probabilidad cruda de que una condicion se cumpla (por ejemplo, si un cliente esta enfadado).
- Puntuacion sobre escala (tipo `score`): devuelve un valor continuo asociado a una leyenda de niveles, con distribucion de probabilidad por nivel.
- Procesamiento de multiples preguntas de decision en una sola peticion, cada una con su tipo e instrucciones.
- Entrada multimodal: soporte de imagenes mediante un array `images` con data URLs, con un presupuesto de 1.024 tokens de imagen.
- Contexto largo: estado de hasta 32.000 tokens que se comparte con las preguntas de una peticion.
- Integracion nativa con el endpoint `/v1/systemone` de `llama-server`, sin capa intermedia en Python.
- No es un modelo de generacion de texto libre: la salida se limita a las respuestas estructuradas de decision.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.

## Casos de uso

- Enrutamiento automatico de tickets de soporte: con el tipo `choice`, el modelo asigna cada incidencia a un equipo (facturacion, envios, tecnico) devolviendo probabilidades y confianza, lo que permite derivar a un humano cuando la confianza cae por debajo de un umbral.
- Deteccion de sentimiento y escalado por urgencia: combinando `noul` (cliente molesto si/no) y `score` (urgencia en una escala de cuatro niveles), el modelo alimenta colas de atencion priorizadas.
- Triaje de solicitudes con evidencia visual: gracias al proyector de vision, se pueden enviar capturas de pantalla o fotos y pedir decisiones de clasificacion sobre ellas (por ejemplo, tipo de fallo mostrado en una interfaz).
- Moderacion o filtrado de contenido con umbrales calibrados: el uso de probabilidades crudas de `noul` permite fijar umbrales operativos distintos segun la politica de negocio, aplicando el suelo de 0,801 si se quiere replicar el comportamiento del shim.
- Extraccion de decision estructurada en pipelines de datos: al devolver JSON con probabilidades y leyendas, las respuestas se integran directamente en sistemas de analitica o en un orquestador de agentes.
- Validacion y control de calidad de modelos de decision: el endpoint nativo permite medir la paridad frente al shim sobre conjuntos de preguntas publicas (por ejemplo, los 231 items de texto de JevBench) en el mismo servidor.
- Despliegue local en entornos con requisitos de privacidad: al ejecutarse con llama.cpp en hardware propio, los datos de cliente no salen de la infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona que se midio la paridad frente al shim sobre los 231 items publicos de texto de JevBench con los mismos prompts y servidor, pero el texto disponible no incluye las cifras resultantes. Tampoco se aportan resultados de MMLU, HumanEval, GSM8K ni de otras suites.

Ejemplo de respuesta documentado en la model card (Q8_0 sobre RTX A6000), ofrecido como muestra funcional y no como benchmark:

| Pregunta | Tipo | Resultado | Confianza |
|---|---|---|---|
| `route` | choice | `billing`: 0,9657 (shipping 0,0170, technical 0,0173) | 0,9486 |
| `angry` | noul | 0,7888 | no disponible |
| `urgency` | score | 1,8261 (leyenda 0-3) | 0,1351 |

Consumo declarado en ese ejemplo: 321 tokens de entrada, 0 de salida.

## Requisitos de hardware

- Pesos: BF16 ocupa 8,42 GB y Q8_0 ocupa 4,48 GB; el proyector de vision `mmproj-lightning-f16.gguf` ocupa 0,67 GB.
- VRAM estimada para inferencia: en Q8_0, aproximadamente 5 GB de pesos mas la cache KV del contexto configurado; en BF16, aproximadamente 9 GB de pesos mas la cache. Las cifras de cache dependen de la longitud efectiva del contexto y no estan especificadas en la informacion disponible.
- GPU recomendadas: la model card documenta las mediciones en una RTX A6000. Por tamano, Q8_0 cabe en GPUs consumer de 8 GB o mas; BF16 requiere al menos 12 GB para ir comodo. GPUs tipo A100 o H100 no son necesarias para este tamano.
- Caber en GPU consumer: si, Q8_0 cabe en tarjetas de 8 GB o superiores; BF16 en tarjetas de 12 GB o superiores.
- Opciones de despliegue: `llama-server` de llama.cpp con soporte del tipo de decision `h2o-lightning` (PR #30361, o la rama `h2o-lightning-decision` de pseudotensor/llama.cpp mientras no se fusione). El parametro `-hf` descarga los ficheros y carga tambien el proyector de vision; con `--no-mmproj` se ejecuta solo texto. Las compilaciones sin el tipo de decision no cargan estos ficheros y obligan a usar h2oai/h2o-lightning-4b-gguf con su shim.
- Parametros de ejecucion de referencia: `-c 40960`, `-np 1`, `--no-kv-unified`, `--image-max-tokens 1024`, `--port 8080`. El offload a GPU se controla con `-ngl`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| h2oai/h2o-lightning-4b-native-gguf | ~4,2 B | 40.960 tokens | GGUF nativo con tipo de decision | apache-2.0 | Requiere llama.cpp con PR #30361; responde `/v1/systemone` sin shim |
| h2oai/h2o-lightning-4b-gguf | ~4,2 B | 40.960 tokens | GGUF estandar (BF16, Q8_0 y cuantizaciones inferiores) | apache-2.0 (segun repo base) | Mismos pesos; requiere shim en Python para el endpoint de decision |
| h2oai/h2o-lightning-4b | ~4,2 B | 40.960 tokens | safetensors | apache-2.0 | Modelo base del que derivan las versiones GGUF |
| Modelos densos de ~3-4 B de proposito general | ~3-4 B | variable | safetensors, GGUF | variable | No directamente comparables: son generativos y no exponen tipos de decision ni probabilidades calibradas |

No se dispone de comparativas de rendimiento con modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de una version concreta de llama.cpp: sin el tipo de decision `h2o-lightning` (PR #30361), el binario rechaza estos ficheros. Hasta que se fusione, hay que compilar desde la rama indicada.
- Modelo de decision, no generativo: no produce texto libre; solo responde a las preguntas estructuradas de tipo `choice`, `noul` y `score`. Usarlo como chatbot no es su proposito.
- Calibracion de `noul`: las probabilidades devueltas son crudas. Si se quiere replicar el comportamiento del shim (y, por extension, los resultados de leaderboard), hay que aplicar manualmente el suelo de 0,801, ya que el PR #30361 ignora la opcion `noul_floor`.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no documentado en la informacion disponible; al ser un modelo de decision con salidas acotadas, el modo de fallo esperable es una clasificacion incorrecta o una confianza mal calibrada, no texto inventado.
- Limitaciones de idioma: no se especifican idiomas soportados.
- Limitaciones de contexto: el estado esta acotado a 32.000 tokens dentro de la ventana de 40.960; superar ese limite requiere truncar o resumir el estado.
- Presupuesto de imagen: 1.024 tokens por imagen segun la configuracion validada; valores distintos no estan garantizados.
- Multiples slots: con mas de un slot y KV no unificado, las preguntas de una misma peticion comparten el prompt del estado y las probabilidades pueden variar ligeramente.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las herramientas de llama.cpp empleadas.
- Repositorio sin descargas ni likes registrados en el momento de la consulta, con fecha de creacion posterior a la fecha de referencia habitual; tratar los datos como recientes y potencialmente sujetos a cambios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/h2oai/h2o-lightning-4b-native-gguf
- Modelo base: https://huggingface.co/h2oai/h2o-lightning-4b
- Version GGUF con shim: https://huggingface.co/h2oai/h2o-lightning-4b-gguf
- Manifiesto de ficheros y hashes: native_manifest.json (en el repositorio)
- Pull request del tipo de decision en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/30361
- Rama de compilacion con el tipo de decision: https://github.com/pseudotensor/llama.cpp (rama `h2o-lightning-decision`)
- Rama con la opcion del suelo `noul`: https://github.com/pseudotensor/llama.cpp/tree/decision-noul-floor
- Conjunto de evaluacion JevBench: no disponible (referenciado en la model card sin enlace)
