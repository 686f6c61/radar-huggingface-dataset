# Qwen/Qwen2.5-VL-3B-Instruct

## Resumen

Qwen2.5-VL-3B-Instruct es un modelo multimodal de tipo image-text-to-text desarrollado por el equipo Qwen de Alibaba Cloud, presentado en enero de 2025 como la version instruct de 3 000 millones de parametros (3,75 mil millones reales segun los pesos en safetensors) de la familia Qwen2.5-VL. Forma parte de una serie que incluye variantes de 3B, 7B y 72B, y esta disenado para tareas de comprension visual que van mas alla del reconocimiento de objetos: analisis de texto, graficos, iconos, diagramas y maquetas dentro de imagenes, extraccion estructurada de documentos y comprension de video de larga duracion.

El modelo incorpora mejoras concretas respecto a Qwen2-VL en tres frentes: un encoder de vision mas eficiente (atencion por ventanas en el ViT, con SwiGLU y RMSNorm alineados con el LLM), muestreo dinamico de FPS con mRoPE extendido en la dimension temporal (IDs y alineacion de tiempo absoluto) para entender video a distintas tasas de muestreo, y capacidades agenticas que permiten operar como agente visual capaz de razonar y dirigir herramientas, incluyendo uso de ordenador y de telefono.

Su relevancia actual radica en que ofrece capacidades multimodales propias de modelos mucho mayores en un tamano que cabe en GPU de consumo, con licencia de investigacion y pesos abiertos en safetensors. El modelo solo declara soporte de ingles en la model card. El acceso se realiza mediante transformers con la clase `qwen2_5_vl` y la libreria auxiliar `qwen-vl-utils`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: encoder de vision (ViT con atencion por ventanas) + LLM Qwen2.5; mRoPE extendido a la dimension temporal para video |
| Parametros totales | 3.754.622.976 (3,75 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la model card oficial; el repo contiene pesos safetensors (BF16). Existen repos de terceros derivados (por ejemplo, unsloth/Qwen2.5-VL-3B-Instruct) con otras cuantizaciones |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | qwen-research |
| Formato de pesos | safetensors (tamano del repo: 7,5 GB) |

## Arquitectura y entrenamiento

Qwen2.5-VL-3B-Instruct sigue una arquitectura compuesta por un encoder de vision y un decoder de lenguaje. El encoder ViT se ha optimizado mediante atencion por ventanas, lo que reduce el coste computacional tanto en entrenamiento como en inferencia, y se ha alineado estructuralmente con el LLM de Qwen2.5 incorporando SwiGLU y RMSNorm. Para el tratamiento del video, el modelo emplea muestreo dinamico de FPS aplicado a la dimension temporal, junto con un mRoPE actualizado con IDs y alineacion de tiempo absoluto, lo que permite al modelo aprender la secuencia y la velocidad temporal y localizar momentos concretos dentro de un video. Esta capacidad de anclaje temporal es la base de la funcion de captura de eventos en videos de mas de una hora.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion posteriores al ajuste de instrucciones; estos datos no estan disponibles en la informacion proporcionada. Si se documentan las innovaciones funcionales del modelo: localizacion visual mediante generacion de bounding boxes o puntos con salida JSON estable para coordenadas y atributos, generacion de salidas estructuradas a partir de facturas, formularios y tablas (util en finanzas y comercio) y comportamiento agentico que le permite actuar como agente visual dirigiendo herramientas.

## Capacidades

- Generacion de texto e interaccion conversacional multimodal en ingles.
- Comprension de imagen: reconocimiento de objetos (flores, aves, peces, insectos) y analisis de texto, graficos, iconos y maquetas dentro de la imagen.
- Comprension de video: procesa videos de mas de una hora y localiza segmentos relevantes mediante anclaje temporal.
- Localizacion visual: genera bounding boxes y puntos, con salidas JSON estables para coordenadas y atributos.
- Extraccion de datos estructurados: facturas, formularios, tablas y documentos escaneados.
- Razonamiento matematico y cientifico sobre contenido visual (evaluado en MathVista y MathVision).
- Capacidades agenticas y uso de herramientas: razonamiento y direccion dinamica de herramientas, con soporte para computer use y phone use (evaluado en ScreenSpot, Android Control, AndroidWorld y MobileMiniWob++).
- Capacidades multilingues: la model card solo declara ingles.
- No se documenta soporte de audio ni un modo de razonamiento extendido explicito en la informacion proporcionada.

## Casos de uso

- Digitalizacion de facturas y formularios: el modelo puede recibir el escaneo de una factura o formulario y devolver sus campos como salida estructurada, lo que permite alimentar directamente sistemas de contabilidad o ERP sin reglas de extraccion especificas por plantilla.
- Analisis de documentos tecnicos y financieros: interpreta tablas, graficos e iconos dentro de la pagina, por lo que resulta adecuado para resumir informes, extraer series de datos de graficos o responder preguntas sobre documentacion escaneada (DocVQA 93,9 e InfoVQA 77,1 en la tabla de evaluacion).
- Agente de automatizacion de interfaz grafica (RPA visual): con puntuaciones de 55,5 en ScreenSpot y 90,8 en AndroidWorld_SR, puede localizar elementos de interfaz y decidir la siguiente accion, integrandose en flujos de automatizacion de escritorio o de aplicaciones moviles.
- Indexado y busqueda en archivos de video: gracias a la comprension de videos largos y al anclaje temporal, permite etiquetar segmentos, generar capitulos o responder consultas del tipo "en que minuto aparece X".
- Moderacion y analisis de contenido visual a escala: clasificacion y descripcion automatica de imagenes subidas por usuarios, con salida JSON reutilizable por otros servicios.
- Asistencia en el sector retail y comercio electronico: generacion automatica de descripciones y atributos de producto a partir de fotografias, incluyendo localizacion de objetos y lectura de etiquetas.
- Soporte en educacion y evaluacion: resolucion y explicacion de problemas con contenido grafico o geometrico, apoyandose en su rendimiento en MathVista (62,3) y MathVision (21,2).
- Prototipado en local sobre GPU de consumo: al tener 3,75 mil millones de parametros, es viable desplegarlo en una unica GPU de 24 GB o inferior para pruebas de concepto y desarrollo, algo impracticable con las variantes de 72B de la misma familia.

## Benchmarks y rendimiento

Los datos publicados por el autor en la model card son los siguientes. El mejor valor de cada fila aparece en negrita en la fuente original; aqui se reproduce la comparacion tal cual.

Benchmarks de imagen:

| Benchmark | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
|---|---|---|---|
| MMMU (val) | 52,3 | 54,1 | 53,1 |
| MMMU-Pro (val) | 32,7 | 30,5 | 31,6 |
| AI2D (test) | 81,4 | 83,0 | 81,5 |
| DocVQA (test) | 91,6 | 94,5 | 93,9 |
| InfoVQA (test) | 72,1 | 76,5 | 77,1 |
| TextVQA (val) | 76,8 | 84,3 | 79,3 |
| MMBench-V1.1 (test) | 79,3 | 80,7 | 77,6 |
| MMStar | 58,3 | 60,7 | 55,9 |
| MathVista (testmini) | 60,5 | 58,2 | 62,3 |
| MathVision (full) | 20,9 | 16,3 | 21,2 |

Benchmarks de video:

| Benchmark | InternVL2.5-4B | Qwen2-VL-7B | Qwen2.5-VL-3B |
|---|---|---|---|
| MVBench | 71,6 | 67,0 | 67,0 |
| VideoMME | 63,6 / 62,3 | 69,0 / 63,3 | 67,6 / 61,5 |
| MLVU | 48,3 | no disponible | 68,2 |
| LVBench | no disponible | no disponible | 43,3 |
| MMBench-Video | 1,73 | 1,44 | 1,63 |
| EgoSchema | no disponible | no disponible | 64,8 |
| PerceptionTest | no disponible | no disponible | 66,9 |
| TempCompass | no disponible | no disponible | 64,4 |
| LongVideoBench | 55,2 | 55,6 | 54,2 |
| CharadesSTA/mIoU | no disponible | no disponible | 38,8 |

Benchmarks de agente (solo se publican resultados de Qwen2.5-VL-3B):

| Benchmark | Qwen2.5-VL-3B |
|---|---|
| ScreenSpot | 55,5 |
| ScreenSpot Pro | 23,9 |
| AITZ_EM | 76,9 |
| Android Control High_EM | 63,7 |
| Android Control Low_EM | 22,2 |
| AndroidWorld_SR | 90,8 |
| MobileMiniWob++_SR | 67,9 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 7,5 GB en safetensors, lo que corresponde aproximadamente a pesos en BF16. En BF16/FP16 se necesitan alrededor de 8 GB solo para pesos, mas el pico de activaciones y la cache KV para imagenes o video de alta resolucion, que puede anadir varios GB.
- En cuantizacion de 8 bits los pesos bajan a unos 4 GB y en 4 bits a unos 2-2,5 GB, aunque estos formatos no estan documentados en la model card oficial y dependen de repos de terceros.
- GPU recomendadas: cualquier GPU con 16 GB o mas permite inferencia en BF16 con margen; A100, H100 o L40S son adecuadas para despliegue concurrente. Con 24 GB (RTX 3090, RTX 4090) el modelo cabe holgadamente en BF16.
- Cabe en GPU de consumo: si. 12-16 GB de VRAM es suficiente para uso en BF16 con imagenes de resolucion moderada; con 8 GB conviene recurrir a cuantizacion.
- Opciones de despliegue: transformers (requiere version reciente; el codigo usa la clase `qwen2_5_vl` y los tags incluyen `text-generation-inference` y `endpoints_compatible`), ademas de repos derivados en formato GGUF para llama.cpp y Ollama publicados por terceros como unsloth.
- Para el tratamiento de video se recomienda instalar `qwen-vl-utils[decord]`; en plataformas no Linux se puede usar `pip install qwen-vl-utils` con respaldo en torchvision, con menor velocidad de carga.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMMU (val) | DocVQA (test) | MathVista | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen2.5-VL-3B-Instruct | 3,75 mil millones | no disponible | 53,1 | 93,9 | 62,3 | qwen-research | Pesos abiertos en HuggingFace |
| InternVL2.5-4B | 4 mil millones aprox. | no disponible en la informacion proporcionada | 52,3 | 91,6 | 60,5 | no disponible en la informacion proporcionada | Pesos abiertos en HuggingFace |
| Qwen2-VL-7B | 7 mil millones aprox. | no disponible en la informacion proporcionada | 54,1 | 94,5 | 58,2 | no disponible en la informacion proporcionada | Pesos abiertos en HuggingFace |

La comparacion se limita a los tres modelos empleados por el autor como referencia en la model card. Los datos de contexto, licencia de las alternativas y throughput no se incluyen en la informacion proporcionada, por lo que no se pueden contrastar aqui.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente soporte de ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Licencia `qwen-research`: es una licencia de investigacion, no una licencia permisiva de uso comercial. Es imprescindible revisar el texto completo en el enlace de licencia antes de cualquier despliegue en produccion con fines comerciales.
- Riesgo de alucinacion: como cualquier modelo generativo multimodal, puede producir descripciones, coordenadas o campos estructurados incorrectos. En tareas de extraccion de documentos o de localizacion visual conviene validar las salidas antes de consumirlas en sistemas automaticos.
- Sesgos: la model card no documenta una evaluacion de sesgos ni un informe de seguridad; no hay datos disponibles al respecto.
- Rendimiento desigual por tarea: en las tablas publicadas se observa un rendimiento notablemente inferior en tareas de razonamiento visual complejo (MMMU-Pro 31,6, MMStar 55,9, MathVision 21,2) y en comprension de video largo (LVBench 43,3) en comparacion con las tareas de reconocimiento y OCR.
- En control de dispositivos moviles, la puntuacion en escenarios de baja calidad de anotacion es baja (Android Control Low_EM 22,2), lo que indica fragilidad en entornos con instrucciones ambiguas.
- Limitacion de contexto: la longitud de contexto no se especifica en la informacion disponible, por lo que no se puede garantizar el comportamiento con secuencias muy largas de video o documentos extensos.
- Requisitos de version: es necesario usar una version reciente de transformers o instalar desde el repositorio principal; en caso contrario aparece el error `KeyError: 'qwen2_5_vl'`.
- El soporte de video depende de librerias de terceros (decord o torchvision) y de su version, lo que puede afectar a la decodificacion y a los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Licencia: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct/blob/main/LICENSE
- Repositorio GitHub: https://github.com/QwenLM/Qwen2.5-VL
- Blog de presentacion: https://qwenlm.github.io/blog/qwen2.5-vl/
- Demo de chat: https://chat.qwenlm.ai/
- Repo derivado con cuantizaciones: https://huggingface.co/unsloth/Qwen2.5-VL-3B-Instruct
- Paper citado (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper citado (arxiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper citado (arxiv:2308.12966): https://arxiv.org/abs/2308.12966
