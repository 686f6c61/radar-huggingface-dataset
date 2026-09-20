# mys/laya-GGUF

## Resumen

Laya English GGUF es una compilacion a formato GGUF del checkpoint ingles del modelo Laya, un modelo de decision de "System 1" desarrollado originalmente por ConvAI Innovations y liberado como reproduccion abierta de TypeSafe Jev. A diferencia de un modelo generativo al uso, Laya no produce texto token a token: recibe un estado (state) y un conjunto de preguntas tipadas (`choice`, `score`, `noul`) y devuelve probabilidades calibradas en una unica pasada de encoder. Esto lo situa en la categoria de modelos de decision y enrutamiento, no de chat.

El modelo subyacente es ModernBERT-large, con 421.622.795 parametros y una longitud de contexto de 512 tokens. La version publicada por el usuario `mys` no emplea el formato GGUF de llama.cpp, sino el generado por ggmlc, un compilador de redes neuronales que baja modelos de PyTorch, JAX, Flax y Keras a ejecucion GGML de alto rendimiento; cargar estos ficheros en `llama-cli` falla por diseno.

Su relevancia practica esta en tareas de clasificacion y control de bajo coste: enrutado de correo, deteccion de jailbreak o inyeccion de prompts, puertas de gasto/factura/SOC y arneses de agentes (actuar, invocar herramienta, preguntar al usuario, detener). El repositorio ocupa 1,7 GB e incluye tres cuantizaciones (F16, Q8_0 y UD_Q4_K_M), con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) |
| Parametros totales | 421.622.795 (~421 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | F16, Q8_0, UD_Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF generado por ggmlc (no compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT-large de 421 M de parametros con ventana de 512 tokens, orientado a inferencia de una sola pasada. No hay generacion autorregresiva de tokens: las preguntas tipadas (`choice`, `score`, `noul`) se puntuan en un unico forward del encoder, lo que da probabilidades calibradas en lugar de texto. Esta concepcion "System 1" implica que el modelo es rapido y determinista por construccion, pero no mantiene conversaciones ni produce secuencias libres.

Los pesos proceden del checkpoint `convaiinnovations/laya`, que a su vez es una reproduccion abierta del sistema TypeSafe Jev. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO, por lo que estos datos no estan disponibles. La aportacion tecnica de esta ficha no es el entrenamiento, sino la compilacion: ggmlc (licencia MIT) traduce modelos de PyTorch, JAX, Flax y Keras a GGML, permitiendo ejecucion con grafos CUDA (`--cuda-graph`) o Metal y con fallback a CPU, ademas de modos de servicio como `serve`, `daemon` (JSON-RPC por stdin/stdout) o `decide`.

## Capacidades

- Decision tipada: responde a preguntas de tipo `choice` (eleccion entre opciones), `score` (puntuacion) y `noul`, devolviendo probabilidades calibradas en una sola pasada de encoder.
- Clasificacion y enrutado: asignacion de categoria o destino, por ejemplo enrutado de correo electronico mediante presets (`--preset email`).
- Deteccion de seguridad: preset `guard` para identificar intentos de jailbreak o inyeccion de prompts (por ejemplo "Ignore previous instructions").
- Puertas de decision de negocio: validacion de gastos, facturas y controles de tipo SOC.
- Arnes de agentes: decision entre actuar, invocar una herramienta, preguntar al usuario o detenerse.
- Salida estructurada: modo `--json` para integracion en pipelines.
- Capacidades multilingues: no. El checkpoint ingles no degrada de forma controlada fuera del ingles; para otros idiomas se debe usar `mys/laya-multilingual-GGUF`.
- Capacidades especiales: no dispone de modo de razonamiento extendido, vision, audio ni generacion de texto libre.

## Casos de uso

- Enrutado de correo electronico: con el preset `email`, el modelo resuelve un conjunto de siete preguntas en un unico forward (`B=7`), lo que permite clasificar y dirigir mensajes entrantes con baja latencia en lugar de generar respuestas completas.
- Guardia contra jailbreak e inyeccion de prompts: usando el preset `guard` y salida `--json`, se puede insertar como filtro previo a un LLM generativo para bloquear entradas maliciosas antes de que lleguen al modelo principal.
- Control de gastos y facturas: como puerta de decision (`gates`) que aprueba, rechaza o escala un gasto o una factura segun criterios tipados, devolviendo una probabilidad calibrada en lugar de una decision binaria sin confianza.
- Alertas SOC y triaje de seguridad: clasificacion de eventos para decidir si requieren intervencion humana, aprovechando la salida probabilisticamente calibrada del encoder.
- Arnes de agentes autonomos: decision de siguiente accion (actuar, llamar a una herramienta, preguntar al usuario o detener) en un bucle multi-paso, sustituyendo a un LLM en el paso de control.
- Clasificacion por lotes de baja latencia: al no requerir decodificacion autorregresiva, permite procesar lotes de estados y preguntas con un coste por elemento muy bajo, adecuado para preprocesado masivo.
- Servicio local integrado: mediante `laya serve` se expone Decision Studio (`GET /`) y `POST /api/decide`, lo que facilita montar un microservicio de decisiones en la propia infraestructura sin dependencias de nube.
- Integracion por JSON-RPC: con `laya daemon` se puede conectar el modelo a procesos existentes mediante JSON-RPC por stdin/stdout, sin necesidad de una API HTTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano de pesos por cuantizacion: F16 ~807 MB, Q8_0 ~431 MB, UD_Q4_K_M ~401 MB. Al ser un encoder con contexto de 512 tokens, las activaciones anaden poca memoria adicional, pero no se proporciona una cifra exacta de VRAM total.
- Compatibilidad consumer: si, cabe en GPU de consumo. El propio autor documenta su funcionamiento en una RTX 4050 Laptop con 6 GB.
- Dispositivos de ejecucion: `--device auto` selecciona CUDA o Metal si estan presentes y, en caso contrario, CPU.
- Latencia medida (RTX 4050 Laptop 6 GB, F16 con grafo CUDA): aproximadamente 25 ms por consulta `noul` y 143 ms para el preset de correo de 7 preguntas resuelto en un unico forward con `B=7`.
- Aceleracion: soporte de grafos CUDA mediante `--cuda-graph`.
- Opciones de despliegue: binario `laya` de las releases de ggmlc (modos `decide`, `serve`, `daemon`, `bench`, `list-presets`, `info`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el GGUF lo genera ggmlc y no el ecosistema llama.cpp.
- Throughput: no disponible mas alla de las cifras de latencia por consulta y por preset indicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|---|
| mys/laya-GGUF | ModernBERT-large encoder | ~421 M | 512 | en | Apache 2.0 | GGUF (ggmlc) | Checkpoint ingles; no degrada fuera de ingles |
| mys/laya-multilingual-GGUF | Derivado de Laya | no disponible | no disponible | multilingue (segun el autor) | no disponible en la informacion | GGUF (ggmlc) | Alternativa para idiomas distintos del ingles |
| mys/laya-typed-decisions-GGUF | Derivado de Laya | no disponible | no disponible | no disponible | no disponible en la informacion | GGUF (ggmlc) | Familia orientada a decisiones tipadas |
| convaiinnovations/laya | ModernBERT-large encoder | ~421 M | 512 | en (checkpoint origen) | Apache 2.0 (segun el autor de la ficha) | no disponible | Pesos origen de los que deriva esta compilacion |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo puntua preguntas tipadas en una pasada.
- Contexto muy corto: 512 tokens, insuficiente para documentos largos o historiales extensos.
- Solo ingles: el checkpoint ingles no degrada de forma controlada fuera de ese idioma; para otros idiomas hay que usar la variante multilingue.
- Incompatibilidad de formato: los ficheros GGUF estan generados por ggmlc y fallan al cargarse en llama.cpp / `llama-cli`; no se pueden usar con Ollama, vLLM ni TGI.
- Dependencia de herramienta: el despliegue requiere el binario `laya` de ggmlc o el compilador ggmlc, no el ecosistema habitual de inferencia.
- Riesgo de calibracion: al devolver probabilidades, la calidad depende del umbral elegido; no se aportan datos de calibracion ni de evaluacion (benchmarks) en la informacion disponible.
- Sesgos: no se documentan analisis de sesgo en la informacion proporcionada.
- Alucinacion: al no generar texto, el riesgo clasico de alucinacion no aplica del mismo modo, pero si existe riesgo de clasificacion erronea con confianza alta.
- Licencia: Apache 2.0, lo que permite uso comercial; el compilador ggmlc tiene licencia MIT. No se indican restricciones adicionales.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa por parte de la comunidad.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/mys/laya-GGUF
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Variante multilingue: https://huggingface.co/mys/laya-multilingual-GGUF
- Variante de decisiones tipadas: https://huggingface.co/mys/laya-typed-decisions-GGUF
- Compilador ggmlc: https://github.com/monatis/ggmlc
- Ejemplos y CLI de Laya en ggmlc: https://github.com/monatis/ggmlc/tree/main/examples/laya
- Releases de binarios ggmlc: https://github.com/monatis/ggmlc/releases/latest
- Repositorio del proyecto Laya: https://github.com/NandhaKishorM/laya
