# nxfx21/LFM3-VL-2B-Heretic-GGUF

## Resumen

LFM3-VL-2B-Heretic-GGUF es una distribucion cuantizada en formato GGUF del modelo multimodal LFM3-VL-2B-Heretic, publicado por el usuario nxfx21. Se trata de una variante del modelo Liquid Foundation Model 3 Vision de Liquid AI, de aproximadamente 1.730 millones de parametros, que ha sido sometida a un proceso de "abliteration" (ablacion de la direccion de rechazo en el espacio de activaciones) mediante la herramienta Heretic v2.1.0. El resultado es un modelo image-text-to-text que acepta entradas de imagen y texto y genera respuestas conversacionales.

La relevancia de esta publicacion es doble. Por un lado, ofrece el modelo en un formato optimizado para dispositivos de borde: el backbone de texto en Q4_0 ocupa 993 MiB y el proyector visual en Q8_0 ocupa 203 MB, con un pico de RAM estimado de unos 1,6 GB a contexto de 2048 tokens, lo que lo hace ejecutable en telefonos y tabletas con 4 GB de RAM o mas. Por otro lado, la ablacion elimina el comportamiento de rechazo segun la propia model card (de 95/100 a 0/100 en el conjunto harmful_behaviors), lo que cambia radicalmente el perfil de seguridad del modelo.

Es importante senalar que esta ficha describe una publicacion de la comunidad sin apenas traccion (0 descargas, 0 likes en el momento de la consulta), sin licencia explicitada y sin resultados de benchmarks publicados. La informacion disponible procede casi exclusivamente de la model card del autor y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de texto LFM3 + proyector visual); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como maximo oficial; la model card recomienda limitar a 2048 tokens en dispositivos de 4 GB de RAM |
| Tipos de cuantizacion | Q4_0 (backbone de texto), Q8_0 (proyector visual mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sujeto a los terminos de la licencia del modelo base nxfx21/LFM3-VL-2B-Heretic y, en ultima instancia, del modelo Liquid AI original) |
| Formato de pesos | GGUF (llama.cpp build 12359) |

## Arquitectura y entrenamiento

El modelo es una variante multimodal del LFM3 de Liquid AI, con un backbone de texto de aproximadamente 1,73 mil millones de parametros y un proyector visual separado que se distribuye como archivo mmproj independiente en GGUF. La model card no detalla la arquitectura interna del backbone (tipo de atencion, capas, dimension oculta) ni los datos de entrenamiento originales, por lo que esos datos deben considerarse no disponibles en esta fuente. El pipeline declarado es image-text-to-text, lo que confirma la capacidad de procesar imagenes junto con texto.

La innovacion principal de esta publicacion no esta en el entrenamiento sino en el post-procesado. Se aplico Heretic v2.1.0 con el metodo Arbitrary-Rank Ablation (ARA), en la iteracion 12 de 30. Los parametros del trial incluyen un rango de capas de intervencion entre los indices 9 y 15, pesos de preservacion de comportamiento bueno de 0,6869, de direccion de comportamiento malo de 0,0037 y de sobrecorreccion relativa de 0,3534, con neighbor_count de 9. Segun la model card, esto reduce la tasa de rechazo de 95/100 a 0/100 en mlabonne/harmful_behaviors con una divergencia KL de 0,3608 medida en mlabonne/harmless_alpaca. La cuantizacion se realizo con llama.cpp build 12359.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline conversational declarado en los metadatos).
- Comprension de imagenes y respuesta en texto (image-text-to-text) mediante el proyector visual mmproj en Q8_0.
- Descripcion de imagenes, respuesta a preguntas sobre contenido visual y tareas de vision-lenguaje en general.
- Ejecucion local en dispositivos moviles y de borde gracias al tamano reducido del GGUF.
- Comportamiento sin rechazo ante peticiones que el modelo original rechazaria, segun la metrica reportada por el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia visual en movil sin conexion: el modelo cabe en unos 1,19 GB en disco y pico de ~1,6 GB de RAM a contexto 2048, por lo que puede desplegarse en iPhone, iPad Air 4 o Android de gama media para describir imagenes, leer documentos fotografiados o identificar objetos sin enviar datos a la nube.
- Accesibilidad para personas con discapacidad visual: capturar una foto con la camara y obtener una descripcion en texto de la escena, con la ventaja de que todo el procesamiento ocurre en el dispositivo y no requiere red.
- Procesamiento de documentos en campo: digitalizacion semantica de facturas, etiquetas o formularios fotografiados en entornos sin conectividad (almacenes, obra, zonas rurales), usando el modelo como primer paso de extraccion descriptiva.
- Prototipado rapido de aplicaciones multimodales: al ser un GGUF compatible con llama.cpp y PocketPal AI, permite validar flujos image-text-to-text en local antes de invertir en infraestructura o APIs, con un coste de hardware minimo.
- Investigacion sobre alineacion y seguridad: la publicacion incluye metricas concretas de ablacion (tasa de rechazo, divergencia KL, parametros del trial), lo que la convierte en un caso de estudio util para analizar el efecto de ARA sobre el comportamiento de rechazo en modelos pequenos.
- Filtrado y moderacion de contenido en escenarios controlados: dado que el modelo no rechaza peticiones, puede emplearse como clasificador o generador de descripciones en pipelines internos donde el operador asume la responsabilidad del contenido, siempre con las cautelas legales correspondientes.
- Demos educativas de vision-lenguaje en el aula: su reducido footprint permite desplegarlo en equipos modestos para ilustrar como funciona un modelo multimodal cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la relativa al proceso de ablacion:

| Metrica | Valor reportado |
|---|---|
| Tasa de rechazo (mlabonne/harmful_behaviors) | 95/100 antes → 0/100 despues |
| Divergencia KL (mlabonne/harmless_alpaca) | 0,3608 |
| Trial de Heretic empleado | 12 de 30 |
| Capas intervenidas | indices 9 a 15 |

No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion estandar de capacidad o de vision en la informacion proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada: ~1,19 GB en disco (993 MiB backbone Q4_0 + 203 MB proyector Q8_0); pico de RAM de ~1,6 GB con contexto de 2048 tokens segun la model card.
- Dispositivos objetivo declarados: iPad Air 4, iPhone y Android con 4 GB de RAM o mas.
- GPU de escritorio: no se especifican modelos recomendados; al ser GGUF ejecutable en CPU, funciona en cualquier equipo con suficiente RAM. Para aceleracion GPU se puede usar el backend Metal (Apple) o CUDA/ROCm via llama.cpp, aunque no hay cifras de rendimiento publicadas.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2-4 GB de VRAM libre al usar offload parcial o total; el modelo esta pensado principalmente para CPU/NEON y Metal.
- Opciones de despliegue: llama.cpp (llama-mtmd-cli con `--mmproj`), PocketPal AI en iOS y Android. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La model card solo afirma que Q4_0 es la opcion "mas rapida en Apple Metal y ARM NEON", sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LFM3-VL-2B-Heretic-GGUF (este) | ~1,73 B | no disponible (recomendado 2048 en 4 GB RAM) | Si (mmproj Q8_0) | no disponible | GGUF Q4_0 + mmproj Q8_0 | Abliterado, sin benchmarks publicados |
| nxfx21/LFM3-VL-2B-Heretic | ~1,73 B | no disponible | Si | no disponible | safetensors (presumiblemente) | Modelo base sin cuantizar del que deriva este |
| Modelo Liquid AI LFM3-VL original | ~1,73 B (presumible) | no disponible | Si | no disponible | no disponible | Modelo de referencia de Liquid AI; datos de la model card no detallados |

No se dispone de informacion suficiente para comparar con alternativas de otros fabricantes (por ejemplo, modelos de vision de 2 B de otros laboratorios) en parametros, contexto o rendimiento, por lo que esa comparacion se considera no disponible.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay evaluaciones publicadas de capacidad, calidad o rendimiento; no es posible estimar su nivel real frente a alternativas.
- Modelo abliterado: la eliminacion del comportamiento de rechazo implica que el modelo respondera a peticiones que el original rechazaria. Esto supone un riesgo relevante de generar contenido danino, ilegal o inseguro, y limita su uso en productos orientados al publico general sin capas adicionales de moderacion.
- Licencia no explicitada: la model card remite a los terminos del modelo base nxfx21/LFM3-VL-2B-Heretic y, en ultima instancia, al modelo de Liquid AI. Antes de cualquier uso comercial es imprescindible verificar la licencia original de Liquid AI, que no se detalla en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de ~2 B de parametros, especialmente en tareas de razonamiento, matematicas y lectura precisa de texto en imagenes. No hay datos que cuantifiquen este riesgo.
- Contexto limitado en la practica: la recomendacion de 2048 tokens en dispositivos de 4 GB de RAM restringe conversaciones largas y documentos extensos.
- Idiomas no declarados: se desconoce el soporte multilingue real; el rendimiento en castellano no esta verificado.
- Traccion nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni de validacion por terceros.
- Fecha de creacion futurista: los metadatos indican creacion en 2026-11-21, lo que puede indicar un error de fecha o una publicacion planificada; conviene verificar la integridad del repositorio antes de confiar en el.
- Proyector visual separado: es obligatorio descargar y cargar el archivo mmproj junto al backbone; omitirlo desactiva por completo la capacidad de vision.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nxfx21/LFM3-VL-2B-Heretic-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/nxfx21/LFM3-VL-2B-Heretic
- Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Dataset de evaluacion de rechazo: mlabonne/harmful_behaviors (referenciado en la model card)
- Dataset de evaluacion de utilidad: mlabonne/harmless_alpaca (referenciado en la model card)
