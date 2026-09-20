# noffy/hastejev-100k

## Resumen

Haste Jev 100k (Nano) es un modelo de pesos abiertos publicado por el usuario noffy en Hugging Face, presentado por su autor como un "System-1 Decision Engine": un motor de decision no generativo, de bajisima latencia y sin sesgo declarado, disenado para ejecutarse en microcontroladores, WebAssembly (WASM) y dispositivos IoT de borde. Con 98.127 parametros totales (73.551 entrenables y 24.576 reservados a una tabla de proyeccion o buffer), una dimension oculta de 48, dos capas de transformer y dos cabezas de atencion, es un modelo de escala nano cuyo objetivo no es conversar ni generar texto, sino elegir una opcion entre un conjunto cerrado de alternativas a partir de un estado descrito en lenguaje natural.

Forma parte de la familia Haste Jev, que va de los ~98k parametros de esta variante hasta los ~20,4M del modelo `hastejev`, y su rasgo diferencial es el consumo de memoria: aproximadamente 0,4 MB en FP32 y 0,1 MB en INT8, lo que lo situa en el rango de sistemas embebidos con restricciones severas de RAM. La relevancia actual del modelo no esta en su capacidad bruta, sino en la idea de delegar decisiones de enrutamiento o de seleccion de acciones a un componente minusculo que pueda ejecutarse en el propio dispositivo o en el navegador, sin depender de una API remota.

La ficha publica no documenta el corpus de entrenamiento, la longitud de contexto, los datos de calibracion ni resultados de benchmarks, y el repositorio figura con 0 descargas y 0 likes, ademas de un tamano declarado de 0,0 GB. Todo ello obliga a tratar las capacidades descritas como afirmaciones del autor pendientes de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 2 capas con 2 cabezas de atencion y dimension oculta (d_model) de 48; orientado a extraccion de caracteristicas y decision, no generativo |
| Parametros totales | 98.127 (~98k) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Parametros entrenables | 73.551 |
| Buffer / tabla de proyeccion | 24.576 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, INT8, INT4 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model_fp16.safetensors, model_int8.safetensors, model_int4.safetensors) y PyTorch |
| Libreria declarada | transformers |
| Pipeline declarado | feature-extraction |
| Huella de memoria declarada | ~0,4 MB (FP32), ~0,1 MB (INT8) |
| Compatibilidad declarada | endpoints_compatible |
| Fecha de creacion / actualizacion | 2026-09-20 / 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un transformer diminuto: dos capas, dos cabezas de atencion y una dimension oculta de 48, con 98.127 parametros en total. El desglose de parametros distingue 73.551 parametros entrenables y 24.576 correspondientes a un buffer o tabla de proyeccion, un peso no entrenable que en modelos de esta escala suele emplearse para mapear representaciones internas hacia un espacio de salida discreto. El modelo se etiqueta como "non-generative" y "zero-bias", y su pipeline declarado en Hugging Face es `feature-extraction`, aunque el ejemplo de uso del autor expone una API de mas alto nivel (`engine.choice(state, options)`) que devuelve una decision y un valor de confianza entre 0 y 1, lo que sugiere una capa de envoltura sobre las representaciones internas.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste por refuerzo (RLHF, DPO u otras), el procedimiento de calibracion de la confianza ni el metodo de cuantizacion empleado para generar los ficheros INT8 e INT4. El autor tampoco publica detalles sobre la inicializacion de la tabla de proyeccion, el esquema de tokenizacion o la estrategia de entrenamiento. Las etiquetas `system-1`, `pica`, `zero-bias` y `calibration` aparecen en la model card sin desarrollo tecnico, por lo que no pueden evaluarse como innovaciones verificadas.

## Capacidades

- Seleccion de decisiones en espacio cerrado: dado un estado descrito en texto y una lista de opciones, el modelo devuelve una opcion y una puntuacion de confianza (`res.decision`, `res.confidence`).
- Extraccion de caracteristicas: el pipeline oficial declarado es `feature-extraction`, por lo que puede emplearse para obtener representaciones internas de entradas textuales breves.
- Inferencia no generativa: no produce texto libre, lo que elimina el riesgo de alucinacion textual pero limita su uso a tareas de clasificacion o eleccion entre alternativas predefinidas.
- Bajisima latencia declarada: las etiquetas `low-latency` y `fast-inference` apuntan a un coste de computo compatible con decisiones en linea.
- Ejecucion en el borde: el autor indica como objetivos microcontroladores, WASM y dispositivos IoT, con huellas de 0,4 MB (FP32) y 0,1 MB (INT8).
- Cuantizacion integrada: pesos FP16, INT8 e INT4 disponibles en el repositorio, con carga mediante el parametro `quantization` del paquete `hastejev`.
- Etiquetas orientadas a agentes: `autonomous-agents`, `browser-control`, `web-automation` y `agentic-ai` sugieren un uso como modulo de decision dentro de bucles de automatizacion, aunque la model card no documenta ninguna integracion concreta.
- Compatibilidad declarada con endpoints de Hugging Face (`endpoints_compatible`).
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio o modo de razonamiento explicito: no disponibles.

## Casos de uso

- Enrutamiento de decisiones en microcontroladores: un dispositivo IoT con RAM limitada puede cargar los pesos INT8 (0,1 MB) y decidir localmente entre acciones como "abrir valvula", "mantener estado" o "enviar alerta", evitando la latencia y el coste de una llamada a la nube.
- Pre-filtro o cascada antes de un LLM grande: el modelo puede clasificar peticiones triviales y derivar solo los casos ambiguos a un modelo mayor, reduciendo el coste por consulta en un pipeline de atencion al cliente o de triaje de tickets.
- Automatizacion de navegador y agentes: en un bucle de control web, el motor puede elegir la siguiente accion entre opciones discretas ("hacer clic", "rellenar campo", "esperar", "abortar") a partir de una descripcion textual del estado de la pagina.
- Sidecar de API de alta frecuencia: por su huella de 0,4 MB en FP32, puede desplegarse como contenedor minimo junto a un servicio principal para resolver decisiones de enrutamiento con latencia muy baja.
- Ejecucion en el navegador mediante WASM: la orientacion a WebAssembly permite tomar decisiones del lado del cliente sin enviar datos del usuario a un servidor, util en formularios, asistentes embebidos o validaciones interactivas.
- Clasificacion de riesgo en flujos de pago o KYC: dado un estado con saldos y operaciones pendientes (como el ejemplo de la model card) y un conjunto de opciones ("aprobar", "revisar", "rechazar"), el modelo devuelve una decision acompañada de confianza que puede usarse como umbral de escalado a revision humana.
- Control de calidad en pipelines de CI/CD: eleccion entre alternativas como "desplegar", "revertir" o "requerir revision manual" a partir de un resumen textual del resultado de las pruebas.
- Moderacion y etiquetado de bajo coste en el borde: clasificacion de contenido breve con categorias predefinidas directamente en el dispositivo, siempre que la tarea este en ingles y el conjunto de etiquetas sea cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, tasas de acierto en tareas de decision, valores de calibracion de la confianza, comparaciones con lineas base ni mediciones de latencia o throughput. La busqueda web realizada no devolvio informacion tecnica relevante sobre este modelo ni sobre su familia.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU. La huella declarada es de aproximadamente 0,4 MB en FP32 y 0,1 MB en INT8, por lo que el modelo reside en RAM o incluso en memoria de un microcontrolador.
- GPU recomendadas: ninguna en particular; el modelo puede ejecutarse en CPU convencional y su escalado a GPU no aporta ventajas practicas dado su tamano.
- GPU de consumo: si, cabe en cualquier GPU de consumo (e incluso en iGPU) con un uso de memoria despreciable frente a cualquier otro modelo.
- Opciones de despliegue: el autor proporciona el paquete Python `hastejev` (`HasteJevEngine.from_pretrained(...)`) y pesos safetensors; la libreria declarada es `transformers` y la etiqueta `endpoints_compatible` indica compatibilidad con los endpoints de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formato GGUF.
- Formatos de ejecucion en el borde: el autor menciona WebAssembly (WASM), microcontroladores y dispositivos IoT como objetivos, aunque no se detallan binarios ni runtimes especificos.
- Latencia y throughput estimados: no disponibles. Solo se declaran de forma cualitativa las etiquetas `low-latency` y `fast-inference`, sin cifras.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos de terceros comparables. La unica comparativa posible es dentro de la propia familia Haste Jev, segun la tabla publicada por el autor:

| Modelo | Parametros | Dim. oculta | Capas | Cabezas | RAM (FP32) | RAM (INT8) | Uso objetivo declarado |
|---|---|---|---|---|---|---|---|
| hastejev-100k | ~98k | 48 | 2 | 2 | ~0,4 MB | ~0,1 MB | Microcontroladores, WASM, IoT |
| hastejev-500k | ~500k | 96 | 3 | 4 | ~2,0 MB | ~0,5 MB | CPU movil, workers en navegador |
| hastejev-1m | ~1,1M | 128 | 4 | 4 | ~4,4 MB | ~1,1 MB | Sidecars de API de alto rendimiento |
| hastejev-2m | ~1,8M | 160 | 4 | 4 | ~7,3 MB | ~1,8 MB | Automatizacion de navegador y bots |
| hastejev-5m | ~5,0M | 224 | 5 | 4 | ~20,0 MB | ~5,0 MB | Enrutamiento financiero y KYC |
| hastejev-10m | ~10,0M | 320 | 5 | 4 | ~40,0 MB | ~10,0 MB | Kernels de agentes multimodales |
| hastejev-20m | ~20,4M | 256 | 4 | 4 | ~81,5 MB | ~20,4 MB | Motor de decision empresarial |

La licencia de los restantes miembros de la familia no se especifica en la model card de este modelo, por lo que figura como no disponible. Tampoco hay datos de rendimiento que permitan comparar calidad de decision entre variantes.

## Limitaciones y advertencias

- Modelo no generativo: no produce lenguaje natural; solo elige entre opciones proporcionadas por el desarrollador, de modo que su utilidad depende por completo del diseno del espacio de decisiones.
- Idioma unico: solo declara soporte de ingles, lo que excluye su uso directo en castellano sin un ajuste previo.
- Longitud de contexto desconocida: la model card no especifica la ventana de contexto, un dato critico para saber si puede procesar estados largos en bucles de agentes.
- Ausencia total de benchmarks: no hay metricas publicas de exactitud, calibracion de la confianza ni robustez, por lo que el rendimiento real es indeterminado.
- Naturaleza "zero-bias" no verificada: la afirmacion de ausencia de sesgo es una declaracion del autor y no se acompaña de evaluaciones; al desconocerse el corpus de entrenamiento, no puede descartarse sesgo heredado de los datos.
- Riesgo de sobreconfianza: la API devuelve un valor de confianza, pero no se documenta el metodo de calibracion, por lo que ese numero no deberia usarse como probabilidad fiable en decisiones automatizadas con impacto.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, y un tamano declarado de 0,0 GB, lo que impide confirmar que los pesos esten efectivamente publicados y que exista validacion por parte de terceros.
- Capacidades agenticas solo declaradas por etiquetas: no se documentan integraciones reales de control de navegador, automatizacion web ni soporte de tool calling.
- Ecosistema de despliegue limitado: no se menciona compatibilidad con GGUF, llama.cpp, Ollama, vLLM ni TGI, lo que restringe las opciones de servido estandar.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligacion de conservar avisos de licencia, pero el software se entrega sin garantias; conviene revisar la licencia de la familia completa y del paquete `hastejev` antes de integrarlo en produccion.
- Datos de la ficha a verificar: las fechas de creacion y actualizacion (2026-09-20) y el tamano de repositorio de 0,0 GB son anomalos y deberian comprobarse directamente en el Hub.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noffy/hastejev-100k
- Repositorio GitHub del proyecto: https://github.com/racstan/hastejev
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Modelos relacionados de la familia: https://huggingface.co/noffy/hastejev-500k, https://huggingface.co/noffy/hastejev-1m, https://huggingface.co/noffy/hastejev-2m, https://huggingface.co/noffy/hastejev-5m, https://huggingface.co/noffy/hastejev-10m, https://huggingface.co/noffy/hastejev
- Papers, blogs o demos adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
