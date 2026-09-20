# noffy/hastejev-500k

## Resumen

Haste Jev 500k (Micro) es un motor de decisión "System-1" de código abierto desarrollado por el usuario noffy, presentado como parte de la familia Haste Jev de pesos abiertos y sesgo cero. No es un modelo generativo de texto: su pipeline declarado es feature-extraction y su funcion es elegir entre un conjunto de opciones discretas (decision primitives) a partir de un estado textual, devolviendo una decision y una puntuacion de confianza. Con 500.091 parametros totales, esta pensado para ejecutarse en CPUs moviles y workers dentro del navegador.

Tecnicamente es un transformer muy pequeno (dimension oculta 96, 3 capas, 4 cabezas de atencion) con una particion de pesos en 401.787 parametros entrenables y 98.304 parametros de tabla de proyeccion o buffer. Su propuesta de valor no es la generacion, sino la latencia muy baja y una huella de memoria de aproximadamente 2 MB en FP32 y 0,5 MB en INT8, lo que lo hace apto para entornos con recursos extremadamente limitados.

El modelo es relevante ahora dentro del nicho de agentes autonomos y automatizacion web: encaja como nucleo de decision rapido (sidecar o kernel System-1) que resuelve elecciones de bajo nivel sin el coste de un LLM generativo. La model card no documenta datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (3 capas, 4 cabezas, dimension oculta 96); orientado a feature-extraction / motor de decision, no generativo |
| Parametros totales | 500.091 (~500k) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, FP16, INT8, INT4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model_fp16.safetensors, model_int8.safetensors, model_int4.safetensors) |

## Arquitectura y entrenamiento

El modelo se describe como un transformer de tres capas con dimension oculta de 96 y cuatro cabezas de atencion, con un total de 500.091 parametros de los cuales 401.787 son entrenables y 98.304 corresponden a una tabla de proyeccion o buffer. No se especifica si la atencion es bidireccional (estilo encoder) o causal, ni la funcion de activacion, normalizacion o esquema posicional. El pipeline oficial en Hugging Face es feature-extraction, coherente con un uso no generativo: la interfaz expuesta es una funcion `choice(estado, opciones)` que devuelve una decision y una confianza calibrada.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO, destilacion o cualquier otra etapa de alineamiento. Tampoco se documentan innovaciones tecnicas concretas mas alla de la etiqueta "zero-bias" y la orientacion a baja latencia y calibracion. Los unicos datos reproducibles son la topologia de red y el desglose de parametros.

## Capacidades

- Decision entre opciones discretas: dada una representacion de estado (por ejemplo, un saldo con una transaccion pendiente) y una lista de opciones, devuelve una eleccion y una puntuacion de confianza.
- Extraccion de caracteristicas (feature-extraction): el pipeline declarado permite obtener representaciones para tareas posteriores.
- Baja latencia y ejecucion local: disenado explicitamente para CPU movil, workers en navegador y extensiones web del lado del cliente.
- Cuantizacion agresiva: soporta INT8 e INT4 ademas de FP16 y FP32, con huellas de memoria de ~0,5 MB en INT8.
- Uso en agentes autonomos y automatizacion web: las etiquetas del modelo incluyen autonomous-agents, browser-control, web-automation y agentic-ai, orientadas a decisiones de bajo nivel.
- No genera texto: no es un modelo de chat, resumen, traduccion ni generacion de codigo.
- Sin soporte declarado de tool calling, function calling, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Automatizacion web y control de navegador: usar el motor como nucleo de decision que, dado el estado de la pagina y una lista de acciones posibles (hacer clic, rellenar, esperar, navegar), selecciona la siguiente accion con una confianza asociada. Su huella en INT8 (~0,5 MB) permite integrarlo en workers del navegador junto a la logica de scraping.
- Extensiones del navegador client-side: ejecutar el modelo dentro de una extension o un Web Worker para clasificar o enrutar acciones del usuario sin enviar datos a un servidor, gracias a su tamano de ~2 MB en FP32.
- Ruteo de decisiones financieras y KYC: el ejemplo de la model card (aprobar, marcar para revision o rechazar una transaccion a partir de un saldo y una operacion pendiente) ilustra su uso como clasificador de triaje en pipelines de aprobacion, con la salida de confianza como senal de escalado a revision humana.
- Sidecar de baja latencia en APIs: desplegarlo como microservicio junto a un LLM generativo para resolver decisiones simples y frecuentes (etiquetado, enrutado, validacion de formato) antes de invocar al modelo mayor, reduciendo coste y latencia.
- Agentes autonomos multi-paso: emplearlo como kernel System-1 que filtra opciones en cada paso del bucle del agente, delegando en un modelo mayor solo las decisiones ambiguas o de alta incertidumbre.
- Triaje y clasificacion en dispositivos moviles o IoT: por su tamano y sus formatos INT8/INT4, cabe en telefonos de gama baja, microcontroladores (segun la familia) y dispositivos empotrados donde no es viable un LLM.
- Calibracion de confianza en sistemas de reglas: sustituir arboles de decision hechos a mano por un modelo que devuelve una probabilidad calibrada, util para umbrales de escalado en flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, AUC, latencia medida ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Huella de memoria segun la model card: ~2,0 MB en FP32 y ~0,5 MB en INT8 para la variante de 500k parametros.
- VRAM estimada: practicamente despreciable; el modelo esta pensado para CPU, no requiere GPU dedicada.
- GPU recomendadas: no aplica; cualquier GPU consumer (por ejemplo, RTX 4090) o incluso CPU sin aceleracion es suficiente, ya que el cuello de botella no es el modelo.
- Compatibilidad con GPU consumer: si, con enorme margen; tambien cabe en moviles y, segun la familia, en microcontroladores para la variante de 100k.
- Opciones de despliegue: la model card muestra el uso mediante la libreria `hastejev` (`HasteJevEngine.from_pretrained(...)`). No se documenta soporte para stacks de servido de LLM generativos como vLLM, TGI, llama.cpp u Ollama, que estan orientados a generacion de tokens y no encajan con un motor de decision no generativo.
- Latencia y throughput: no disponibles. El modelo se comercializa como "low-latency" y "fast-inference", pero no se aportan cifras medidas.

## Comparativa con modelos similares

La unica comparativa documentada es con los hermanos de la propia familia Haste Jev, recogida en la model card. No se dispone de informacion sobre modelos comparables de otros autores.

| Modelo | Parametros | Dim. oculta | Capas | Cabezas | RAM (FP32) | RAM (INT8) | Uso objetivo |
|---|---|---|---|---|---|---|---|
| hastejev-100k | ~98k | 48 | 2 | 2 | ~0,4 MB | ~0,1 MB | Microcontroladores, WASM, IoT |
| hastejev-500k | ~500k | 96 | 3 | 4 | ~2,0 MB | ~0,5 MB | CPU movil, workers en navegador |
| hastejev-1m | ~1,1M | 128 | 4 | 4 | ~4,4 MB | ~1,1 MB | Sidecars de API de alto rendimiento |
| hastejev-2m | ~1,8M | 160 | 4 | 4 | ~7,3 MB | ~1,8 MB | Automatizacion de navegador y bots |
| hastejev-5m | ~5,0M | 224 | 5 | 4 | ~20,0 MB | ~5,0 MB | Enrutado financiero y KYC |
| hastejev-10m | ~10,0M | 320 | 5 | 4 | ~40,0 MB | ~10,0 MB | Kernels de agentes multimodales |
| hastejev-20m | ~20,4M | 256 | 4 | 4 | ~81,5 MB | ~20,4 MB | Motor de decision empresarial |

Todas las variantes comparten licencia Apache 2.0 y la misma filosofia de motor de decision System-1 no generativo, por lo que la eleccion entre ellas depende de la huella de memoria admisible y de la precision requerida.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, codigo, resumenes ni traduccion; cualquier expectativa de uso como LLM es incorrecta.
- Solo ingles: la unica lengua declarada es en, sin datos sobre comportamiento multilingue.
- Ausencia total de informacion sobre entrenamiento: no se documentan datos, tokens, composicion, sesgos ni proceso de alineamiento, lo que dificulta evaluar su fiabilidad.
- Riesgo de calibracion no verificada: aunque la model card enfatiza la calibracion y la confianza, no hay benchmarks que la respalden; no deberia usarse como unica senal en decisiones criticas.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de decisiones incorrectas con confianza alta, especialmente fuera de la distribucion de entrenamiento (desconocida).
- Longitud de contexto no disponible: se desconoce cuanta informacion de estado puede procesar de una sola vez.
- Licencia Apache 2.0: permite uso comercial y modificacion con las condiciones habituales de atribucion; aun asi, al no existir garantia de rendimiento, conviene validar en el dominio de destino.
- Adopcion minima: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo aparece como 0.0 GB, por lo que podria tratarse de una publicacion reciente o incompleta.
- Fecha de creacion atipica (2026-09-20): conviene verificar la vigencia y autenticidad del repositorio antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noffy/hastejev-500k
- Repositorio GitHub de la familia Haste Jev: https://github.com/racstan/hastejev
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Modelos hermanos de la familia:
  - https://huggingface.co/noffy/hastejev-100k
  - https://huggingface.co/noffy/hastejev-1m
  - https://huggingface.co/noffy/hastejev-2m
  - https://huggingface.co/noffy/hastejev-5m
  - https://huggingface.co/noffy/hastejev-10m
  - https://huggingface.co/noffy/hastejev
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido de consumo y foros sobre Amazon); no se han encontrado papers, blogs ni demos adicionales.
