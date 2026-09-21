# mnsims1024/Qwen2.5-VL-7B-Instruct-GGUF

## Resumen

mnsims1024/Qwen2.5-VL-7B-Instruct-GGUF es una cuantizacion en formato GGUF del modelo Qwen/Qwen2.5-VL-7B-Instruct, un modelo multimodal de tipo imagen-texto-a-texto desarrollado por el equipo Qwen de Alibaba. El modelo original pertenece a la familia Qwen2.5-VL, compuesta por variantes de 3.000, 7.000 y 72.000 millones de parametros; esta ficha corresponde a la variante de 7B en su version instruct, con 7.615.616.512 parametros reales segun los pesos en safetensors del modelo base.

El problema que resuelve es el de la comprension visual avanzada: no se limita al reconocimiento de objetos, sino que analiza texto, tablas, graficos, iconos y maquetas dentro de imagenes y documentos escaneados, ademas de comprender videos de mas de una hora y localizar eventos concretos dentro de ellos. Incorpora capacidades de agente visual (uso de ordenador y de telefono), localizacion de objetos mediante cajas delimitadoras o puntos, y generacion de salidas estructuradas en JSON para facturas, formularios y tablas.

Es relevante ahora porque permite el despliegue local de un modelo vision-lenguaje de 7.6B en formato GGUF, lo que reduce los requisitos de memoria frente a los pesos en precision completa y facilita su integracion en flujos de trabajo con llama.cpp u Ollama. El repositorio tiene licencia Apache 2.0, ocupa 133,7 GB (lo que sugiere la inclusion de varios niveles de cuantizacion) y registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion comunitaria. Este repositorio es una cuantizacion de terceros: no esta mantenido por el equipo Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador de vision (ViT con window attention, SwiGLU y RMSNorm) mas decodificador de lenguaje Qwen2.5, con mRoPE extendido a la dimension temporal |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF; los niveles concretos no se detallan en la informacion disponible (el repositorio ocupa 133,7 GB, lo que sugiere multiples niveles) |
| Idiomas soportados | en (segun los tags y la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Libreria declarada | transformers |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 133,7 GB |
| Fecha de creacion indicada | 21 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura combina un codificador de vision con un decodificador de lenguaje de la serie Qwen2.5. El ViT incorpora window attention para acelerar tanto el entrenamiento como la inferencia, y se ha alineado estructuralmente con el LLM mediante SwiGLU y RMSNorm. Para el tratamiento del video, se extiende la resolucion dinamica a la dimension temporal mediante muestreo dinamico de FPS, y el mRoPE se actualiza en el eje temporal con identificadores y alineacion de tiempo absoluto, lo que permite al modelo aprender secuencias temporales y velocidad, y adquirir la capacidad de senalar momentos concretos dentro de un video. La model card describe tres tamanos (3B, 7B y 72B); este repositorio contiene la variante de 7B ajustada por instrucciones.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO; estos datos figuran como no disponibles. Si se declara que el modelo es instruction-tuned (sufijo Instruct) y que la decodificacion se realiza con transformers mas qwen-vl-utils con soporte de decord para la carga de video. El tag unsloth del repositorio sugiere que la conversion a GGUF se ha realizado con herramientas de Unsloth, aunque la model card no lo confirma de forma explicita. No se documentan innovaciones adicionales como decodificacion especulativa en la informacion disponible.

## Capacidades

- Comprension de imagenes con analisis de texto, graficos, iconos, maquetas y disenos, no solo reconocimiento de objetos comunes.
- OCR y comprension de documentos: 864 en OCRBench, 95,7 en DocVQA y 77,8 en CC_OCR (datos del modelo base).
- Comprension de videos de mas de una hora, con muestreo dinamico de FPS y capacidad de localizar segmentos relevantes y eventos concretos en el tiempo.
- Localizacion visual en distintos formatos: generacion de cajas delimitadoras (bounding boxes) y puntos sobre objetos, con salidas JSON estables de coordenadas y atributos.
- Generacion de salidas estructuradas para escaneos de facturas, formularios y tablas, orientada a usos en finanzas y comercio.
- Comportamiento agentico: el modelo actua como agente visual capaz de razonar y dirigir herramientas de forma dinamica, incluyendo uso de ordenador y de telefono.
- Soporte de conversacion multi-turno con imagenes y videos intercalados (pipeline conversacional).
- Soporte de tool calling / function calling: no se detalla de forma explicita en la informacion proporcionada; las capacidades de agente se describen en terminos de control de herramientas visuales.
- Capacidades multilingues: la model card y los tags solo declaran ingles (en).

## Casos de uso

- Digitalizacion de facturas y formularios: el modelo genera salidas estructuradas en JSON a partir de escaneos, lo que permite volcar los campos directamente a un ERP o base de datos sin reglas de extraccion especificas. Su OCRBench de 864 y su DocVQA de 95,7 en el modelo base lo hacen adecuado para documentos densos.
- Analisis de informes financieros y graficos: con 87,3 en ChartQA y 82,6 en InfoVQA, puede extraer tendencias, valores y relaciones de graficos de barras, lineas y diagramas, y responder preguntas sobre ellos en un pipeline de analisis automatizado.
- Agentes de automatizacion de interfaz grafica: con 84,7 en ScreenSpot y 93,7 en Android Control Low_EM (modelo base), puede interpretar capturas de pantalla y emitir acciones sobre elementos de la interfaz, util para RPA y pruebas automatizadas de aplicaciones moviles.
- Analisis de video largo: al comprender videos de mas de una hora y localizar eventos, sirve para generar resumentes con marcas temporales en grabaciones de vigilancia, sesiones de formacion o retransmisiones deportivas. El rendimiento de referencia es 45,3 en LVBench y 54,7 en LongVideoBench, por lo que conviene validar el caso de uso concreto.
- Accesibilidad y descripcion de imagenes: la generacion de descripciones detalladas y localizacion de objetos permite construir lectores de pantalla enriquecidos o asistentes que describan el entorno capturado por la camara de un dispositivo movil.
- Razonamiento matematico visual en educacion: con 68,2 en MathVista y 25,07 en MathVision, puede resolver problemas de geometria o de interpretacion de diagramas y acompanar la explicacion paso a paso, con la advertencia de que el rendimiento en MathVision es bajo.
- Despliegue local con requisitos de privacidad: al estar en formato GGUF, puede ejecutarse en estaciones de trabajo sin enviar imagenes ni documentos a servicios externos, lo que resulta relevante en entornos sanitarios, legales o industriales con datos sensibles.
- Extraccion de informacion de paneles y capturas de productos: la localizacion en coordenadas JSON permite anotar o recortar automaticamente regiones de interes en catalogos, tickets o capturas de aplicaciones.

## Benchmarks y rendimiento

Los siguientes resultados proceden de la model card de Qwen2.5-VL-7B-Instruct y corresponden al modelo base en precision original, no a la cuantizacion GGUF de este repositorio. La cuantizacion puede degradar el rendimiento, en especial en tareas de OCR y de localizacion fina.

### Benchmarks de imagen

| Benchmark | InternVL2.5-8B | MiniCPM-o 2.6 | GPT-4o-mini | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|---|---|---|
| MMMU (val) | 56 | 50,4 | 60 | 54,1 | 58,6 |
| MMMU-Pro (val) | 34,3 | no disponible | 37,6 | 30,5 | 41,0 |
| DocVQA (test) | 93 | 93 | no disponible | 94,5 | 95,7 |
| InfoVQA (test) | 77,6 | no disponible | no disponible | 76,5 | 82,6 |
| ChartQA (test) | 84,8 | no disponible | no disponible | 83,0 | 87,3 |
| TextVQA (val) | 79,1 | 80,1 | no disponible | 84,3 | 84,9 |
| OCRBench | 822 | 852 | 785 | 845 | 864 |
| CC_OCR | 57,7 | no disponible | no disponible | 61,6 | 77,8 |
| MMStar | 62,8 | no disponible | no disponible | 60,7 | 63,9 |
| MMBench-V1.1-En (test) | 79,4 | 78,0 | 76,0 | 80,7 | 82,6 |
| MMT-Bench (test) | no disponible | no disponible | no disponible | 63,7 | 63,6 |
| MMStar (segunda fila de la tabla) | 61,5 | 57,5 | 54,8 | 60,7 | 63,9 |
| MMVet (GPT-4-Turbo) | 54,2 | 60,0 | 66,9 | 62,0 | 67,1 |
| HallBench (avg) | 45,2 | 48,1 | 46,1 | 50,6 | 52,9 |
| MathVista (testmini) | 58,3 | 60,6 | 52,4 | 58,2 | 68,2 |
| MathVision | no disponible | no disponible | no disponible | 16,3 | 25,07 |

Nota: la model card incluye dos filas con la etiqueta MMStar y valores distintos para InternVL2.5-8B (62,8 y 61,5). Se reproducen ambas tal como aparecen en el origen.

### Benchmarks de video

| Benchmark | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|
| MVBench | 67,0 | 69,6 |
| PerceptionTest (test) | 66,9 | 70,5 |
| Video-MME (sin/con subtitulos) | 63,3 / 69,0 | 65,1 / 71,6 |
| LVBench | no disponible | 45,3 |
| LongVideoBench | no disponible | 54,7 |
| MMBench-Video | 1,44 | 1,79 |
| TempCompass | no disponible | 71,7 |
| MLVU | no disponible | 70,2 |
| CharadesSTA (mIoU) | no disponible | 43,6 |

### Benchmarks de agente

| Benchmark | Qwen2.5-VL-7B |
|---|---|
| ScreenSpot | 84,7 |
| ScreenSpot Pro | 29,0 |
| AITZ_EM | 81,9 |
| Android Control High_EM | 60,1 |
| Android Control Low_EM | 93,7 |
| AndroidWorld_SR | 25,5 |
| MobileMiniWob++_SR | 91,4 |

## Requisitos de hardware

- VRAM estimada para los pesos, segun los 7.615.616.512 parametros del modelo base: aproximadamente 15,2 GB en FP16/BF16, 8,1 GB en cuantizacion de 8 bits, 4,5 GB en cuantizacion de 4 bits y 3,3 GB en cuantizacion de 3 bits. A estas cifras hay que sumar la cache KV, el codificador de vision y el proyector multimodal, que en imagenes de alta resolucion y videos puede ser significativa.
- GPU recomendadas: para precision completa, una A100 de 40 GB, H100 o L40S; para cuantizaciones de 8 y 4 bits, una RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) son suficientes para los pesos del modelo de lenguaje.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con cuantizaciones de 4 a 8 bits, siempre que se controle la resolucion de las imagenes de entrada y la longitud del contexto.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para el formato GGUF; vLLM y TGI para los pesos safetensors del modelo base; transformers con la version reciente de la libreria y qwen-vl-utils[decord] para el uso multimodal completo. Para procesar vision en llama.cpp es necesario el proyector multimodal (mmproj); no se detalla en la informacion disponible si este repositorio lo incluye.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 133,7 GB, por lo que conviene descargar unicamente el archivo de cuantizacion que se vaya a utilizar si el cliente lo permite.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento de referencia |
|---|---|---|---|---|---|
| Qwen2.5-VL-7B-Instruct (este repo, GGUF) | 7,6B | no disponible | Apache 2.0 | HuggingFace, cuantizacion de terceros | 58,6 en MMMU (val), 864 en OCRBench, 68,2 en MathVista (modelo base) |
| Qwen2-VL-7B | 7B aproximadamente | no disponible | Apache 2.0 | HuggingFace | 54,1 en MMMU (val), 845 en OCRBench, 58,2 en MathVista |
| InternVL2.5-8B | 8B aproximadamente | no disponible | no disponible en la informacion | HuggingFace | 56 en MMMU (val), 822 en OCRBench, 58,3 en MathVista |
| MiniCPM-o 2.6 | no disponible | no disponible | no disponible en la informacion | HuggingFace | 50,4 en MMMU (val), 852 en OCRBench, 60,6 en MathVista |

Los datos de esta comparativa proceden de las tablas de evaluacion de la model card de Qwen2.5-VL-7B-Instruct. No se dispone de informacion sobre la longitud de contexto de los modelos alternativos en la documentacion consultada.

## Limitaciones y advertencias

- La model card declara unicamente el ingles como idioma soportado; el rendimiento en castellano u otros idiomas no esta documentado y debe validarse antes de usarlo en produccion multilingue.
- La cuantizacion GGUF degrada la precision respecto a los pesos originales, con impacto especialmente acusado en tareas de OCR, lectura de texto pequeno y localizacion precisa de coordenadas.
- No se han publicado resultados de benchmarks de esta cuantizacion concreta: todas las cifras de la ficha corresponden al modelo base. El autor del repositorio es un tercero (mnsims1024) y no el equipo Qwen.
- El repositorio registra 0 descargas y 0 likes, y no hay evidencia de validacion por parte de la comunidad.
- Riesgo de alucinacion en la lectura de documentos y graficos: 52,9 en HallBench (avg) en el modelo base, lo que implica que puede inventar valores o etiquetas en imagenes densas. Se recomienda verificacion posterior en flujos criticos.
- Rendimiento limitado en razonamiento matematico visual: 25,07 en MathVision, muy por debajo de los resultados en MathVista.
- Rendimiento limitado en interfaces graficas complejas: 29,0 en ScreenSpot Pro y 25,5 en AndroidWorld_SR, por lo que la automatizacion de escritorio en entornos reales exige supervision.
- Comprension de video por debajo de la de imagen: 45,3 en LVBench y 54,7 en LongVideoBench; el analisis de videos largos debe acompanarse de muestreo y verificacion.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar los avisos de copyright y licencia y a incluir el archivo NOTICE cuando corresponda. No se imponen restricciones adicionales de uso, aunque el repositorio derivado debe mantener la atribucion al modelo base.
- La longitud de contexto no se especifica en la informacion disponible, lo que dificulta dimensionar la cache KV y planificar despliegues con entradas muy largas.
- El repositorio ocupa 133,7 GB, un requisito de almacenamiento relevante si se descarga completo.
- Para usar la parte de vision en llama.cpp se necesita el archivo proyector multimodal; la informacion disponible no confirma su presencia en el repositorio.
- Los pesos en precision completa exigen entorno transformers reciente; con versiones antiguas se produce el error KeyError: 'qwen2_5_vl'.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mnsims1024/Qwen2.5-VL-7B-Instruct-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Blog oficial de Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- Repositorio GitHub de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL
- Interfaz de chat de Qwen: https://chat.qwenlm.ai/
- Referencias arXiv incluidas en los tags del repositorio: arXiv:2309.00071, arXiv:2409.12191, arXiv:2308.12966
- Documentacion de transformers: https://github.com/huggingface/transformers
- Herramientas multimodales qwen-vl-utils: https://pypi.org/project/qwen-vl-utils/

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre su autor; los resultados obtenidos correspondian a consultas no relacionadas (Taj Mahal, Google Maps, Google Earth y foros de encuestas), por lo que no se incluyen como fuentes.
