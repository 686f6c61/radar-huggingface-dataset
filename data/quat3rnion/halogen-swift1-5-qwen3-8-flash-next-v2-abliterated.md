# Quat3rnion/halogen-swift1.5-qwen3.8-flash-next-v2-abliterated

## Resumen

Halogen Swift 1.5 Qwen3.8-Flash-Next v2 abliterated es un checkpoint derivado del modelo Qwen/Qwen3.8-Flash-Next, un transformer de tipo mezcla de expertos (MoE) de 125.000 millones de parametros, 48 capas y 512 expertos enrutados por capa. Sobre esa base, UkisAI publico un ajuste fino denominado Swift 1.5, y el autor Quat3rnion ha aplicado sobre el una edicion de la direccion de rechazo (abliteration) y lo ha empaquetado en el checkpoint v2 de peonist, en formato `.hgn`.

El objetivo declarado es doble: eliminar las negativas del modelo afinado (responde las seis pruebas de rechazo del autor, frente a las seis negativas de Swift 1.5 sin editar) y reducir de forma drastica el coste de razonamiento. En 14 preguntas de MMLU-Pro el modelo emplea una media de 905 tokens de pensamiento, un 72 % menos que los 3.271 del modelo base abliterado, con un coste de calidad medido como perplejidad en WikiText-2 de 3,229 frente a 3,134 del build abliterado del base y 3,144 del v2 sin modificar.

Su relevancia practica esta condicionada por dos factores poco habituales: solo se ejecuta en el motor halogen-flash-server 0.15.1, de codigo cerrado, y solo sobre hardware AMD Strix Halo (gfx1151) con memoria unificada de 128 GB. No existe version en safetensors, GGUF ni ningun otro formato, por lo que queda fuera de transformers, vLLM, llama.cpp, Ollama y LM Studio. Es, en la practica, un artefacto para un unico perfil de maquina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 48 capas, 512 expertos enrutados por capa |
| Parametros totales | 125.000 millones (modelo base Qwen/Qwen3.8-Flash-Next) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 posiciones por peticion |
| Tipos de cuantizacion | Mayoritariamente 4 bits; rejillas nativas HT e I4R del checkpoint v2 con redondeo consciente de calibracion |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `license: other`) |
| Formato de pesos | `.hgn` (formato propio de Halogen); sin safetensors ni GGUF |
| Tamano del checkpoint | 89.775.868.032 bytes (unos 89,8 GB); pesos residentes en memoria de aproximadamente 62 GiB |
| Decodificacion especulativa | Cabecera MTP integrada en el checkpoint |
| Vision | Si, mediante la torre de vision opcional de peonist (0,84 GiB) |
| Motor de inferencia | halogen-flash-server 0.15.1 (codigo cerrado) |
| Hardware objetivo | AMD Strix Halo (gfx1151), 128 GB de memoria unificada |
| API | Compatible con OpenAI: `/v1/chat/completions`, `/v1/completions`, `/v1/responses`, `/v1/messages`, `/v1/models` |
| SHA-256 del peso | `19b0898842d779da98ae7fa9b78f391e33f3e02cd8f148dca01d87dd3262040b` |

## Arquitectura y entrenamiento

La arquitectura subyacente es el modelo Qwen3.8-Flash-Next en su revision `de4b8e4d43b917e7706784d8bb445c9af86a3540`: una mezcla de expertos de 125.000 millones de parametros con 48 capas y 512 expertos enrutados por capa. Sobre esa base, UkisAI aplico un ajuste fino en BF16 (revision `0bd4fe22431372cdad1979267d3ab45aa7e6150a`) que da lugar a Swift 1.5. El presente checkpoint no reentrena el modelo: parte del empaquetado v2 de peonist (`5cc17cea1a10b502b4a5db41d8d2b1a0f22dba26`) y sustituye 353 tensores.

La edicion de la direccion de rechazo se estimo restando el modelo base al checkpoint orcarouter/Qwen3.8-Flash-Next-Uncensored (revision `8336e613ea508b13c2159bd0f68965d97a606b95`); no se incluye ningun peso de orcarouter. La proyeccion se realizo en BF16 con el script `tooling/swift_bf16_abliterate.py` (Apache-2.0, SHA-256 `4c40488df48f586b1f8a270bd33189b9c91ed401edbf5a51835c8acdb9519428`), y los tensores modificados se recodificaron en las rejillas nativas de 4 bits del v2 con redondeo consciente de calibracion. El archivo final es 23 GB mayor que el v2 original porque conserva los payloads antiguos sin referenciar y anade los reemplazos al final; el motor carga unicamente los referenciados.

La decodificacion especulativa se apoya en una cabecera MTP ya presente en el checkpoint v2, modificada solo en tres escritores afectados por la abliteracion. Se desconoce el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO y cualquier detalle del pipeline del ajuste fino Swift 1.5; esa informacion no aparece en la model card.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito, con niveles de `reasoning_effort` configurables (`xhigh` por defecto, `medium`, `low`) heredados de la plantilla de chat del modelo base.
- Razonamiento eficiente: en la prueba del autor sobre 14 preguntas de MMLU-Pro consume una media de 905 tokens de pensamiento, frente a 3.271 del base abliterado.
- Respuestas sin rechazo: respondio las seis pruebas de rechazo del autor, donde Swift 1.5 sin editar rechazo las seis.
- Contexto largo de hasta 262.144 posiciones por peticion.
- Entrada de imagenes mediante la torre de vision opcional de peonist.
- Servicio mediante API compatible con OpenAI, lo que habilita integracion directa con clientes que hablan ese esquema.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, uso agentico, ejecucion de codigo ni cobertura multilingue concreta.

## Casos de uso

- Analisis de documentos tecnicos extensos: con 262.144 posiciones de contexto puede ingerir manuales, expedientes o bases de codigo completas en una sola peticion, sin fragmentacion ni recuperacion externa.
- Procesamiento de imagenes en el mismo flujo de texto: la torre de vision opcional permite pasar capturas, diagramas o paginas escaneadas y pedir extraccion o resumen estructurado en la misma conversacion.
- Sustitucion de un endpoint compatible con OpenAI en una maqueta local: al exponer `/v1/chat/completions` y `/v1/responses`, se puede apuntar un cliente existente a este servidor sin reescribir la capa de integracion.
- Tareas de redaccion y analisis que requieren respuestas sin negativas por diseno: al haberse eliminado la direccion de rechazo, resulta util en entornos internos de investigación donde el modelo base bloquea peticiones legitimas.
- Razonamiento con presupuesto de tokens ajustado: los niveles `low` y `medium` de `reasoning_effort` permiten reducir el coste por consulta cuando la latencia importa mas que la profundidad de la cadena de pensamiento.
- Laboratorio de investigacion sobre abliteration: el repositorio incluye `writers.txt` con los 353 tensores reemplazados y `abliteration/manifest.json` con la direccion de rechazo y las metricas por escritor, lo que permite reproducir y auditar la edicion.
- Evaluacion comparada de derivados: al existir tres builds sobre el mismo checkpoint v2 evaluados en la misma sesion, sirve para estudiar el compromiso entre supresion de rechazos, coste de pensamiento y perplejidad.

## Benchmarks y rendimiento

La model card no publica resultados de exactitud en benchmarks estandar como MMLU, HumanEval o GSM8K. Los unicos datos cuantitativos disponibles son los siguientes:

| Metrica | Este build | base abliterado (r2) | Swift 1.5 sin abliterar | v2 sin modificar |
|---|---:|---:|---:|---:|
| Tokens de pensamiento medios (MMLU-Pro, 14 preguntas) | 905 | 3.271 | 1.360 | no disponible |
| Perplejidad WikiText-2 | 3,229 | 3,134 | 3,181 | 3,144 |
| Pruebas de rechazo superadas | 6 de 6 | 6 de 6 (rechazos eliminados) | 0 de 6 (rechazos mantenidos) | no disponible |
| Velocidad greedy | 53-57 tok/s | no disponible | no disponible | 53-57 tok/s (misma) |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- Memoria: maquina AMD Strix Halo con 128 GB de memoria unificada, dedicada en exclusiva a este modelo. El propio autor advierte de que otros procesos grandes compiten por la memoria restante y pueden bloquear el servidor.
- Almacenamiento: aproximadamente 141 GB en disco, correspondientes al archivo `.hgn` de 89,8 GB mas la tabla de n-gramas de 51,2 GB. Hay que anadir la torre de vision si se requiere entrada de imagenes.
- Pesos residentes: alrededor de 62 GiB una vez cargado, equivalente al v2 original, ya que el motor ignora los payloads no referenciados.
- GPU: no es compatible con A100, H100 ni RTX 4090. El destino es exclusivamente la iGPU de Strix Halo (gfx1151) sobre ROCm.
- Cabe en GPU de consumo: no. No existe version cuantizada a 4 bits para GPU de escritorio, ni GGUF, ni safetensors.
- Opciones de despliegue: unicamente halogen-flash-server 0.15.1, software de codigo cerrado con sus propios terminos. No funciona en vLLM, llama.cpp, Ollama, LM Studio ni transformers.
- Latencia y throughput: aproximadamente 53-57 tok/s en modo greedy sobre un Ryzen AI Max+ 395, con decodificacion especulativa activa mediante la cabecera MTP integrada. No se publican cifras de latencia por peticion ni de throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de pensamiento (MMLU-Pro, 14 preguntas) | PPL WikiText-2 | Rechazos | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|---|
| halogen-swift1.5-qwen3.8-flash-next-v2-abliterated (este) | 125B MoE | 262.144 | 905 | 3,229 | Eliminados | swift-open-license-1.0 | Solo `.hgn` en halogen-flash-server |
| halogen-swift1.5-qwen3.8-flash-next-v2 | 125B MoE | 262.144 | 1.360 | 3,181 | Mantenidos | swift-open-license-1.0 | Solo `.hgn` en halogen-flash-server |
| halogen-qwen3.8-flash-next-v2-abliterated (r2) | 125B MoE | 262.144 | 3.271 | 3,134 | Eliminados | swift-open-license-1.0 | Solo `.hgn` en halogen-flash-server |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (sin abliterar) | 125B MoE | no disponible | no disponible | no disponible | Mantenidos (6 de 6) | no disponible | Pesos BF16 |

No se dispone de datos de rendimiento de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que la comparacion se limita a los tres builds derivados del mismo checkpoint y al ajuste fino de origen.

## Limitaciones y advertencias

- La abliteration elimina deliberadamente la direccion de rechazo. Esto implica que el modelo puede responder a peticiones que el modelo original declinaria; es responsabilidad del operador establecer filtros externos antes de exponerlo a usuarios finales.
- La calidad medida empeora ligeramente respecto a los otros builds: perplejidad de 3,229 en WikiText-2 frente a 3,134 del base abliterado y 3,144 del v2 sin modificar.
- Riesgo de alucinacion no cuantificado. No hay evaluaciones de veracidad, robustez ni sesgos en la informacion disponible.
- Compatibilidad practicamente nula: requiere halogen-flash-server, que es de codigo cerrado, y hardware AMD Strix Halo. No se puede desplegar en infraestructura en nube convencional, ni en GPU NVIDIA, ni en Apple Silicon.
- Un unico formato de pesos (`.hgn`), sin safetensors ni GGUF. Esto impide auditoria del modelo con herramientas estandar y complica la portabilidad a medio plazo.
- Requisitos de disco elevados y poco habituales: 89,8 GB del peso mas 51,2 GB de tabla de n-gramas, en una maquina que debe dedicarse por completo al modelo.
- La licencia es `swift-open-license-1.0`, etiquetada como `other`. No se ha verificado en la informacion disponible si permite uso comercial, por lo que debe revisarse el archivo `LICENSE` antes de cualquier despliegue productivo. Se anaden `LICENSE-QWEN` y `LICENSE-APACHE`, lo que sugiere condiciones combinadas.
- El modelo es un derivado no oficial y no esta respaldado ni fabricado por UkisAI, Peonist, orcarouter ni Qwen.
- Idiomas soportados: no disponible. No se documenta cobertura multilingue, ni calidad por idioma.
- Arquitectura, parametros activos y detalles del entrenamiento de Swift 1.5: no disponibles. No se puede estimar el coste computacional real por token ni el regimen de enrutamiento de expertos.
- El autor no publica evaluaciones de seguridad, sesgo ni toxicidad. Al tratarse de un modelo sin rechazos, estas evaluaciones son especialmente relevantes antes de cualquier uso con publico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quat3rnion/halogen-swift1.5-qwen3.8-flash-next-v2-abliterated
- Build hermano sin abliterar: https://huggingface.co/Quat3rnion/halogen-swift1.5-qwen3.8-flash-next-v2
- Build abliterado del modelo base (r2): https://huggingface.co/Quat3rnion/halogen-qwen3.8-flash-next-v2-abliterated
- Checkpoint v2 de peonist (ficheros auxiliares requeridos): https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next
- Ajuste fino de origen Swift 1.5: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint usado para estimar la direccion de rechazo: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Motor de inferencia halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los unicos enlaces disponibles son los incluidos en la model card y en los metadatos de HuggingFace.
