# eduardoworrel/alias3-micro-1026-MLC-q4f32_1

## Resumen

`eduardoworrel/alias3-micro-1026-MLC-q4f32_1` es una conversion al formato MLC-LLM del modelo `aliasrobotics/alias3-micro-1026`, publicada por el usuario eduardoworrel el 25 de octubre de 2026. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales se han cuantizado a 4 bits con la receta `q4f32_1` y se han empaquetado para su ejecucion en navegador mediante MLC-LLM y WebLLM sobre WebGPU. El repositorio ocupa 2,4 GB.

El modelo base lo desarrolla Alias Robotics, empresa especializada en seguridad de robots, y las etiquetas del repositorio (`cybersecurity`, `qwen3_5`) indican una especializacion en ciberseguridad y un linaje arquitectonico derivado de la familia Qwen 3.5. Segun LLM Explorer, el modelo original tiene aproximadamente 4.000 millones de parametros y una ventana de contexto de 256.000 tokens, si bien la model card de esta conversion no documenta ninguno de esos datos de forma explicita.

Su relevancia es practica: permite ejecutar un modelo de dominio especifico de seguridad en el cliente, sin backend ni envio de datos a un servidor, algo atractivo para demos, formacion y herramientas de analisis sensible. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque esta conversion concreta no ha sido validada por el autor original ni cuenta con descargas o valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; la etiqueta `qwen3_5` apunta a la familia Qwen 3.5. Detalles de capas, atencion y cabezas: no disponible |
| Parametros totales | ~4B segun LLM Explorer (no confirmado en la model card) |
| Parametros activos | No aplica; no hay indicios de arquitectura MoE. No disponible |
| Longitud de contexto | 256.000 tokens segun LLM Explorer (no confirmado en la model card) |
| Tipos de cuantizacion | `q4f32_1`: pesos de 4 bits con escalas en float32 y grupo de 32, segun la convencion de nombres de MLC-LLM. Es la unica variante publicada en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | Formato propietario de MLC-LLM (biblioteca `mlc-llm`), con configuracion MLCChat para WebGPU. No se distribuyen safetensors ni GGUF en este repositorio |
| Tamano del repositorio | 2,4 GB |
| Fecha de publicacion | 2026-10-25 |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base. Por las etiquetas del repositorio (`qwen3_5`) se deduce que `alias3-micro-1026` parte de la familia Qwen 3.5, un transformer decoder-only, y por la etiqueta `cybersecurity` que Alias Robotics aplico algun tipo de adaptacion o ajuste orientado a tareas de seguridad. No se documentan el volumen de tokens de entrenamiento, la composicion del corpus, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se especifican innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

Lo que si es verificable es el proceso de esta publicacion: una conversion a MLC-LLM con cuantizacion de grupo `q4f32_1`, que reduce los pesos a 4 bits manteniendo escalas en float32 para limitar la perdida de precision, y su compilacion con TVM para generar kernels ejecutables en WebGPU. Este pipeline es el estandar de MLC-LLM y WebLLM para llevar modelos a navegador; el resultado no es un checkpoint entrenable, sino un artefacto de inferencia optimizado para el runtime web.

## Capacidades

- Generacion de texto conversacional y de tipo instructivo, heredada del modelo base.
- Especializacion declarada en ciberseguridad (etiqueta `cybersecurity`): el autor original orienta el modelo a terminologia, conceptos y tareas del dominio de seguridad.
- Ejecucion integra en el navegador mediante WebGPU, sin llamadas a servidor, lo que habilita procesamiento local de contenido sensible.
- Razonamiento y matematicas: no documentado en la informacion disponible.
- Generacion de codigo: no documentado en la informacion disponible.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Vision o audio: no disponible; el pipeline es exclusivamente `text-generation`.
- Modo thinking o razonamiento extendido explicito: no documentado.

## Casos de uso

- **Triaje de alertas en un SOC con procesamiento local**: un analista puede pegar fragmentos de logs o descripciones de alertas en una interfaz web y obtener una primera clasificacion sin que el contenido salga del puesto de trabajo. La ventana de 256.000 tokens, si se confirma, permitiria incluir contexto amplio de un incidente en una sola pasada.
- **Demos y formacion en ciberseguridad sin infraestructura**: al ejecutarse con WebLLM sobre WebGPU, el modelo se puede desplegar como una pagina estatica. Resulta adecuado para talleres, charlas o entornos de formacion donde no se quiere montar GPU ni backend.
- **Asistente de consulta de documentacion interna**: integrado en un portal estatico, puede responder preguntas sobre politicas, procedimientos o runbooks ya indexados en el prompt, manteniendo la confidencialidad del material.
- **Borradores de informes de vulnerabilidades**: generacion de primeras versiones de descripciones tecnicas, resumenes de impacto y recomendaciones de mitigacion a partir de notas del analista, que despues se revisan manualmente.
- **Prototipado rapido de interfaces conversacionales**: util para validar UX de producto (chat, streaming, longitud de contexto) antes de invertir en servir el modelo en produccion con vLLM o TGI.
- **Evaluacion comparativa de cuantizaciones**: sirve como referencia para medir la degradacion de `q4f32_1` frente a otras variantes del mismo modelo base, como las publicadas en `eduardoworrel/ct0-alias3-micro-mlc`.
- **Clasificacion y etiquetado de texto tecnico en local**: categorizacion de CVE, tecnicas MITRE ATT&CK o familias de malware en flujos offline, siempre con supervision humana dado el riesgo de error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de esta conversion ni los resultados de busqueda consultados incluyen cifras de MMLU, HumanEval, GSM8K, CVE-Bench ni de evaluaciones especificas de ciberseguridad, y tampoco se ofrece una comparacion con el modelo base sin cuantizar.

## Requisitos de hardware

- **VRAM para los pesos**: el repositorio ocupa 2,4 GB, por lo que la carga de pesos en 4 bits requiere del orden de 2,5 a 3 GB de memoria, mas overhead del runtime WebGPU y del grafo compilado.
- **Memoria para el contexto**: no se documenta la configuracion de atencion (numero de capas, cabezas KV, uso de GQA), asi que el coste del KV cache no se puede calcular con precision. Con 256.000 tokens de contexto el KV cache dominaria el consumo y lo situaria fuera del alcance de un navegador; para uso web conviene limitar la ventana a unos pocos miles de tokens.
- **GPU recomendadas**: cualquier GPU con soporte WebGPU estable. En la practica, Apple Silicon (M1 o superior), GPUs de escritorio NVIDIA RTX 30/40 y AMD RDNA 2/3, e integradas recientes con suficiente memoria compartida. Para el modelo base sin cuantizar en precision completa harian falta del orden de 8-10 GB de VRAM, en linea con los 8,4 GB que indica LLM Explorer.
- **Cabe en GPU de consumo**: si. La version `q4f32_1` esta pensada para GPUs de consumo y graficas integradas modernas a traves del navegador.
- **Opciones de despliegue**: WebLLM (`@mlc-ai/web-llm`), runtime de MLC-LLM, y compilacion con TVM para WebGPU. Para servir el modelo con llama.cpp, Ollama, vLLM o TGI seria necesario partir del modelo base y realizar una conversion propia, ya que este repositorio no incluye GGUF ni safetensors.
- **Latencia y throughput**: no disponible. No se han publicado mediciones de tokens por segundo para esta conversion ni en WebGPU ni en otros backends.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| `alias3-micro-1026-MLC-q4f32_1` (esta ficha) | ~4B (segun LLM Explorer) | 256K (segun LLM Explorer) | Apache 2.0 | Solo MLC-LLM para WebGPU | No disponible |
| `aliasrobotics/alias3-micro-1026` (base) | ~4B (segun LLM Explorer) | 256K (segun LLM Explorer) | Apache 2.0 | Pesos originales del autor | No disponible en la informacion consultada |
| Qwen2.5-3B-Instruct | 3,09B | 32K nativo, ampliable con YaRN | Apache 2.0 | Safetensors, GGUF, AWQ, multiples runtimes | Benchmarks publicados por el autor |
| Llama 3.2 3B Instruct | 3,21B | 128K | Licencia comunitaria Llama 3.2 | Safetensors, GGUF, amplio soporte de runtimes | Benchmarks publicados por el autor |
| Foundation-Sec-8B | 8B | No disponible | No disponible | Pesos abiertos, orientado a seguridad | Benchmarks de dominio publicados por el autor |

La comparativa se limita a parametros, contexto y licencia: no existen cifras publicas de calidad para `alias3-micro-1026` que permitan situarlo frente a alternativas del mismo tamano. La ventaja diferencial de esta publicacion no es el rendimiento, sino el formato: es la unica forma de ejecutar el modelo en un navegador con WebGPU sin infraestructura adicional.

## Limitaciones y advertencias

- **Sin datos de evaluacion**: no hay benchmarks publicados del modelo base ni de esta cuantizacion. Cualquier afirmacion sobre su calidad en tareas de ciberseguridad es, a dia de hoy, una suposicion.
- **Conversion de terceros**: el artefacto lo publica el usuario eduardoworrel, no Alias Robotics. No hay garantia de que la cuantizacion preserve el comportamiento del modelo original ni de que se mantenga actualizada.
- **Degradacion por cuantizacion**: los pesos a 4 bits pueden perder precision en tareas que requieren recuperacion literal de identificadores, como CVE, hashes, rutas o nombres de funciones. Conviene verificar esos campos manualmente.
- **Riesgo de alucinacion**: en dominio de seguridad, un identificador de vulnerabilidad o una recomendacion de mitigacion inventada puede tener consecuencias graves. El modelo debe usarse como asistente de redaccion, nunca como fuente de verdad.
- **Doble uso**: un modelo especializado en ciberseguridad puede emplearse tanto para defensa como para generacion de contenido ofensivo. La licencia Apache 2.0 no impone restricciones de uso adicionales, por lo que la clausula de responsabilidad recae en el desplegador.
- **Idiomas no declarados**: se desconoce si el modelo esta ajustado en castellano. Es probable que el rendimiento en espanol sea inferior al de modelos multilingues declarados, pero no hay datos para confirmarlo.
- **Contexto efectivo limitado en navegador**: aunque la ficha del modelo base indique 256K tokens, ejecutar dicha ventana en WebGPU no es viable por memoria. En la practica habra que truncar el contexto.
- **Sin soporte documentado de tool calling**: no se puede asumir compatibilidad con esquemas de funciones o con frameworks de agentes sin validacion previa.
- **Ecosistema reducido**: al depender exclusivamente de MLC-LLM, no es compatible con llama.cpp, Ollama, vLLM ni TGI sin conversion adicional. Esto limita su uso en produccion fuera del navegador.
- **Sin adopcion**: cero descargas y cero valoraciones en el momento de la consulta; no hay senales de uso en la comunidad que permitan inferir su estabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eduardoworrel/alias3-micro-1026-MLC-q4f32_1
- Modelo base: https://huggingface.co/aliasrobotics/alias3-micro-1026
- Conversion relacionada (ct0-alias3-micro-mlc): https://huggingface.co/eduardoworrel/ct0-alias3-micro-mlc
- Conversion relacionada (ct0-alias3-micro-mlc-q4f32): https://huggingface.co/eduardoworrel/ct0-alias3-micro-mlc-q4f32
- Ficha del modelo base en LLM Explorer (4B, 256K contexto, 8,4 GB VRAM): https://llm-explorer.com/model/aliasrobotics%2Falias3-micro-1026,4blf2l2TXTivhkOEjQYCOd
- Registro en Free2AITools: https://free2aitools.com/model/eduardoworrel/ct0-alias3-micro-mlc
- Paquete `@mlc-ai/web-llm` en jsDelivr: https://www.jsdelivr.com/package/npm/@mlc-ai/web-llm
