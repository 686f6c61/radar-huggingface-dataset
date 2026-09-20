# noffy/hastejev-2m

## Resumen

Haste Jev 2M (Small) es un modelo de pesos abiertos de 1.826.275 parametros (~1,8M) publicado por el usuario noffy en Hugging Face, integrado en la familia Haste Jev de "System-1 Decision Engines". No es un modelo generativo: su proposito es actuar como nucleo de decision en tiempo real, recibiendo un estado (por ejemplo, una cadena de texto con datos de una cuenta) y un conjunto cerrado de opciones, y devolviendo una eleccion acompanada de una puntuacion de confianza. La model card lo orienta explicitamente a automatizacion de navegador, bots y agentes de interfaz de usuario.

Tecnicamente es un transformer diminuto: 4 capas, 4 cabezas de atencion y dimension oculta (d_model) de 160. Del total de parametros, 1.416.675 son entrenables y 409.600 corresponden a una tabla de proyeccion o buffer. El pipeline declarado en Hugging Face es feature-extraction, la licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Su relevancia actual no viene del rendimiento bruto, sino del perfil de despliegue: la model card indica una huella de RAM de aproximadamente 7 MB en FP32 y unos 1,8 MB en INT8, lo que permite ejecutarlo en el propio navegador, en sidecars de API o en dispositivos con recursos muy limitados. Se distribuye con pesos en FP32, FP16, INT8 e INT4, y su consumo es compatible con los endpoints de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (4 capas, 4 cabezas de atencion, d_model = 160); motor de decision "System-1" no generativo |
| Parametros totales | 1.826.275 (~1,8M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Parametros entrenables | 1.416.675 |
| Buffer / tabla de proyeccion | 409.600 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32, FP16, INT8, INT4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`model_fp16.safetensors`, `model_int8.safetensors`, `model_int4.safetensors`) y PyTorch |
| Huella de memoria | ~7,3 MB en FP32; ~1,8 MB en INT8 (segun model card) |
| Pipeline declarado | feature-extraction |
| Libreria | transformers |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La informacion disponible describe un transformer compacto de 4 capas con 4 cabezas de atencion y una dimension oculta de 160. El modelo se presenta como un "decision engine" de tipo System-1, es decir, un nucleo de respuesta rapida y baja latencia que no genera lenguaje libre, sino que selecciona una opcion dentro de un conjunto acotado. La API de referencia (`HasteJevEngine.from_pretrained`, seguido de `engine.choice(state, options)`) devuelve un objeto con los campos `decision` y `confidence`, lo que confirma que la salida es una eleccion mas una probabilidad calibrada, no texto generado.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco documenta innovaciones de decodificacion especulativa ni mecanismos de atencion alternativos. Los unicos elementos estructurales descritos son la separacion entre parametros entrenables (1.416.675) y una tabla de buffer o proyeccion (409.600), y los formatos de cuantizacion publicados. Las etiquetas del repositorio mencionan calibracion, "zero-bias" y baja latencia, pero no se aporta evidencia experimental que las respalde.

## Capacidades

- Decision entre opciones cerradas: dado un estado textual y una lista de alternativas, devuelve una opcion y una puntuacion de confianza (`res.decision`, `res.confidence`).
- Extraccion de caracteristicas: el pipeline declarado en Hugging Face es `feature-extraction`, por lo que los pesos pueden emplearse para obtener representaciones internas.
- Inferencia de muy baja latencia: la model card lo etiqueta como `low-latency` y `fast-inference`, orientado a bucles de decision en tiempo real.
- Cuantizacion en cuatro precisiones (FP32, FP16, INT8, INT4), lo que permite ajustar el equilibrio entre precision y huella de memoria.
- Uso como componente de agentes autonomos: las etiquetas incluyen `autonomous-agents`, `browser-control`, `web-automation` y `agentic-ai`.
- Compatibilidad con los endpoints de Hugging Face (etiqueta `endpoints_compatible`).
- No generativo: no produce texto libre, resumenes ni conversacion.
- Sin soporte documentado de tool calling, function calling, vision, audio ni modo de razonamiento explicito.
- Multilingue: no. Unicamente ingles declarado.

## Casos de uso

- Automatizacion de navegador: el modelo puede actuar como nucleo de decision que, ante el estado de una pagina (elementos detectados, texto extraido, condiciones del flujo) y una lista de acciones candidatas ("clic en enviar", "rellenar campo", "esperar"), selecciona el siguiente paso con una confianza asociada. Su tamano permite empaquetarlo dentro del propio agente sin dependencias de red.
- Enrutamiento de operaciones financieras: el ejemplo de la model card usa un estado con saldo y transacciones pendientes y tres opciones ("Approve Transaction", "Flag for Review", "Decline"). Encaja en flujos de aprobacion y revision donde la decision debe ser trazable mediante la puntuacion de confianza.
- Clasificacion y enrutado de tickets en atencion al cliente: dado el texto de una solicitud y una taxonomia fija de categorias o colas, el modelo elige el destino con una confianza que puede usarse como umbral para escalar a un humano.
- Triaje en procesos KYC: la familia incluye variantes (5M, 20M) declaradas para KYC y finanzas; la variante de 2M puede usarse como filtro de primera linea en decisiones binarias o de pocas clases.
- Control de robots y automatizacion industrial: cualquier bucle de control que requiera elegir entre un conjunto discreto de comandos con latencia minima es un candidato natural, dado el perfil de ~1,8 MB en INT8.
- Sidecar de orquestacion de agentes: integrado en un servicio que decide si una tarea debe resolverse con una regla, con el propio motor o delegando en un LLM mayor, reduciendo coste en los casos sencillos.
- Ejecucion en navegador o en el borde (WASM, workers, dispositivos IoT): con pesos de pocos megabytes y soporte INT8/INT4, es viable empaquetarlo junto a la aplicacion cliente.
- Filtrado previo en pipelines de datos: uso como extractor de caracteristicas o como clasificador rapido antes de invocar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones cuantitativas con modelos alternativos. Las afirmaciones de calibracion, latencia y "zero-bias" aparecen unicamente como etiquetas, sin metricas que las respalden.

## Requisitos de hardware

- VRAM para inferencia: inferior a 10 MB para los pesos en FP32 (~7,3 MB) y en torno a 1,8 MB en INT8. El repositorio ocupa 0,0 GB.
- GPU recomendadas: no se especifica ninguna. Cualquier GPU, incluida una integrada, es suficiente; tambien es viable la ejecucion en CPU.
- Cabe en GPU de consumo: si, en cualquier modelo (RTX 4090, RTX 3060, GPUs integradas) y tambien en CPU, microcontroladores y entornos WASM, segun la orientacion de la familia.
- Opciones de despliegue: la model card documenta el paquete `hastejev` con `HasteJevEngine.from_pretrained` y un parametro `quantization` ("int8"); tambien es compatible con la libreria `transformers` y con los endpoints de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas encajan mal con un modelo no generativo.
- Latencia y throughput: no disponibles. La model card solo declara de forma cualitativa baja latencia e inferencia rapida.

## Comparativa con modelos similares

Los unicos modelos comparables documentados son las otras variantes de la propia familia Haste Jev. Todos comparten licencia Apache 2.0, idioma ingles y orientacion a decision.

| Modelo | Parametros | d_model | Capas | Cabezas | RAM FP32 | RAM INT8 | Uso objetivo declarado |
|---|---|---|---|---|---|---|---|
| hastejev-100k | ~98k | 48 | 2 | 2 | ~0,4 MB | ~0,1 MB | Microcontroladores, WASM, IoT |
| hastejev-500k | ~500k | 96 | 3 | 4 | ~2,0 MB | ~0,5 MB | CPU movil, workers en navegador |
| hastejev-1m | ~1,1M | 128 | 4 | 4 | ~4,4 MB | ~1,1 MB | Sidecars de API de alto rendimiento |
| hastejev-2m (este modelo) | ~1,8M | 160 | 4 | 4 | ~7,3 MB | ~1,8 MB | Automatizacion de navegador y bots |
| hastejev-5m | ~5,0M | 224 | 5 | 4 | ~20,0 MB | ~5,0 MB | Enrutado financiero y KYC |
| hastejev-10m | ~10,0M | 320 | 5 | 4 | ~40,0 MB | ~10,0 MB | Kernels de agentes multimodales |
| hastejev-20m | ~20,4M | 256 | 4 | 4 | ~81,5 MB | ~20,4 MB | Motor de decision empresarial |

No se dispone de comparaciones con modelos externos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto libre ni mantiene conversaciones; solo elige entre opciones proporcionadas por el desarrollador.
- Longitud de contexto no documentada, lo que impide planificar el tamano maximo de estado que admite en produccion.
- Unicamente soporta ingles declarado; no hay evidencia de capacidades multilingues.
- No se han publicado benchmarks, por lo que no es posible verificar la calidad de las decisiones ni el grado real de calibracion de la confianza devuelta.
- La etiqueta "zero-bias" es una afirmacion del autor sin evidencia publicada; no debe interpretarse como garantia de ausencia de sesgos.
- No se documenta el dataset de entrenamiento, su composicion ni el proceso de ajuste, lo que dificulta auditar el comportamiento en dominios sensibles (credito, KYC, moderacion).
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y el codigo de inferencia depende de un paquete propio (`hastejev`) cuya madurez y mantenimiento no se detallan.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia. No impone restricciones de uso, pero tampoco ofrece garantias.
- Las decisiones automatizadas basadas en la puntuacion de confianza requieren umbrales definidos y supervision humana en contextos regulados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noffy/hastejev-2m
- Repositorio GitHub: https://github.com/racstan/hastejev
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Variante hastejev-100k: https://huggingface.co/noffy/hastejev-100k
- Variante hastejev-500k: https://huggingface.co/noffy/hastejev-500k
- Variante hastejev-1m: https://huggingface.co/noffy/hastejev-1m
- Variante hastejev-5m: https://huggingface.co/noffy/hastejev-5m
- Variante hastejev-10m: https://huggingface.co/noffy/hastejev-10m
- Variante hastejev-20m: https://huggingface.co/noffy/hastejev

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a contenidos sin relacion (perfumeria). No se han localizado papers, blogs ni demos adicionales.
