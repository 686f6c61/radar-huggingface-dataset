# Nobo7/Qwen2.5-VL-7B-Instruct-GGUF

## Resumen

Qwen2.5-VL-7B-Instruct es un modelo multimodal de tipo vision-language desarrollado por el equipo Qwen de Alibaba. Esta ficha concreta, publicada por el usuario Nobo7, es una cuantizacion en formato GGUF del modelo original, generada con herramientas de Unsloth, que permite ejecutar el modelo en entornos con recursos limitados. El modelo resuelve tareas de comprension de imagen y video combinadas con generacion de texto: reconocimiento de objetos, analisis de documentos, graficos, iconos, layouts y localizacion visual mediante cajas delimitadoras o puntos.

La arquitectura combina un encoder visual ViT optimizado (con window attention, SwiGLU y RMSNorm) con el LLM Qwen2.5 de 7B parametros, unidos mediante mRoPE extendido a la dimension temporal para el procesamiento de video con FPS dinamico. El modelo original soporta ventanas de contexto largas y comprension de videos de mas de una hora, ademas de capacidades agenticas para uso de ordenador y telefono.

Es relevante ahora porque democratiza el acceso a un modelo vision-language de referencia bajo licencia Apache 2.0, y esta variante GGUF facilita su despliegue en hardware de consumo mediante llama.cpp u Ollama, sin depender de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (ViT + LLM Qwen2.5) con mRoPE temporal |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF (multiples niveles; niveles concretos no disponibles) |
| Idiomas soportados | en (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 133,7 GB con multiples ficheros) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer multimodal compuesta por un encoder visual ViT y un LLM Qwen2.5 de 7B parametros. El ViT incorpora window attention para acelerar entrenamiento e inferencia, y se ha alineado estructuralmente con el LLM mediante SwiGLU y RMSNorm. Para el procesamiento de video, se emplea un mRoPE (multimodal Rotary Position Embedding) extendido a la dimension temporal con IDs y alineacion absoluta de tiempo, junto con muestreo dinamico de FPS que permite al modelo comprender videos a distintas tasas de muestreo y localizar momentos concretos.

El modelo original fue entrenado con datos multimodales (imagenes, documentos, graficos, video) y ajustado por instrucciones; la model card menciona el uso de Unsloth en el proceso de cuantizacion de esta variante GGUF. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni los detalles de RLHF/DPO.

## Capacidades

- Comprension visual de imagenes: reconocimiento de objetos, textos, graficos, iconos y layouts.
- Analisis de documentos: facturas, formularios y tablas con salida estructurada (JSON).
- Comprension de video de mas de una hora, con capacidad de localizar segmentos relevantes por marca temporal.
- Localizacion visual: generacion de cajas delimitadoras y puntos con coordenadas estables en JSON.
- Razonamiento visual y matematico sobre imagenes (MathVista, MathVision).
- Capacidades agenticas: uso de ordenador y telefono (ScreenSpot, Android Control, MobileMiniWob++).
- Generacion de texto conversacional multimodal (pipeline image-text-to-text).
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: la model card declara solo ingles (`en`); el modelo base Qwen2.5-VL es multilingue, pero esta variante no lo declara.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de facturas y formularios: el modelo extrae contenido de scans y devuelve JSON estructurado, adecuado para pipelines financieros y comerciales que necesitan datos normalizados sin post-procesado manual.
- Analisis de documentos tecnicos y graficos: con DocVQA de 95,7 e InfoVQA de 82,6, es apto para responder preguntas sobre manuales, informes y dashboards empresariales.
- Automatizacion de agentes de interfaz (RPA visual): sus resultados en ScreenSpot (84,7) y Android Control permiten construir agentes que interpretan pantallas y ejecutan acciones sobre UI de escritorio o movil.
- Moderacion y analisis de video largo: la comprension de videos de mas de una hora con localizacion temporal sirve para resumir reuniones, generar indices de eventos o extraer clips relevantes.
- Asistencia a personas con discapacidad visual: descripcion de escenas, lectura de textos en imagenes y localizacion de objetos mediante coordenadas.
- Analisis de imagenes medicas o industriales de apoyo: clasificacion y descripcion de hallazgos en imagenes, siempre con supervision humana dado el riesgo de alucinacion.
- Despliegue en local con cuantizacion GGUF: al ser una variante GGUF, puede ejecutarse en estaciones de trabajo sin GPU de datacenter mediante llama.cpp u Ollama, util para prototipado y entornos con requisitos de privacidad.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo base Qwen2.5-VL-7B-Instruct:

| Benchmark | InternVL2.5-8B | MiniCPM-o 2.6 | GPT-4o-mini | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|---|---|---|
| MMMU (val) | 56 | 50,4 | 60 | 54,1 | 58,6 |
| MMMU-Pro (val) | 34,3 | - | 37,6 | 30,5 | 41,0 |
| DocVQA (test) | 93 | 93 | - | 94,5 | 95,7 |
| InfoVQA (test) | 77,6 | - | - | 76,5 | 82,6 |
| ChartQA (test) | 84,8 | - | - | 83,0 | 87,3 |
| TextVQA (val) | 79,1 | 80,1 | - | 84,3 | 84,9 |
| OCRBench | 822 | 852 | 785 | 845 | 864 |
| CC_OCR | 57,7 | - | - | 61,6 | 77,8 |
| MMStar | 62,8 | - | - | 60,7 | 63,9 |
| MMBench-V1.1-En (test) | 79,4 | 78,0 | 76,0 | 80,7 | 82,6 |
| MMVet (GPT-4-Turbo) | 54,2 | 60,0 | 66,9 | 62,0 | 67,1 |
| HallBench (avg) | 45,2 | 48,1 | 46,1 | 50,6 | 52,9 |
| MathVista (testmini) | 58,3 | 60,6 | 52,4 | 58,2 | 68,2 |
| MathVision | - | - | - | 16,3 | 25,07 |

Benchmarks de video:

| Benchmark | Qwen2-VL-7B | Qwen2.5-VL-7B |
|---|---|---|
| MVBench | 67,0 | 69,6 |
| PerceptionTest (test) | 66,9 | 70,5 |
| Video-MME (sin/con subtitulos) | 63,3 / 69,0 | 65,1 / 71,6 |
| LVBench | - | 45,3 |
| LongVideoBench | - | 54,7 |
| MMBench-Video | 1,44 | 1,79 |
| TempCompass | - | 71,7 |
| MLVU | - | 70,2 |
| CharadesSTA/mIoU | - | 43,6 |

Benchmarks de agente:

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

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 7,6B parametros en GGUF, las cuantizaciones de 4 bits suelen requerir en torno a 5-6 GB de VRAM y las de 8 bits en torno a 9-10 GB (estimacion orientativa, no confirmada en la informacion).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Cabe en GPU de consumo: si, en principio cualquier GPU con suficiente VRAM para la cuantizacion elegida (por ejemplo, RTX 3060 12 GB o superiores); no confirmado en la informacion.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base usa transformers con `qwen-vl-utils` y `decord` para video.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMMU (val) | DocVQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2.5-VL-7B (esta variante GGUF) | 7,6B | no disponible | 58,6 | 95,7 | Apache 2.0 | GGUF en HF |
| InternVL2.5-8B | 8B | no disponible | 56 | 93 | no disponible | HF |
| MiniCPM-o 2.6 | no disponible | no disponible | 50,4 | 93 | no disponible | HF |
| GPT-4o-mini | no disponible | no disponible | 60 | - | propietaria | API |

## Limitaciones y advertencias

- La model card declara unicamente ingles como idioma; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion en descripcion de imagenes, OCR de documentos de baja calidad y localizacion de objetos; verificar salidas estructuradas antes de usarlas en produccion.
- La cuantizacion GGUF puede degradar ligeramente la precision respecto al modelo original en tareas de OCR fino y matematicas visuales.
- Esta variante es una publicacion de terceros (Nobo7) con 0 descargas y 0 likes; no es la distribucion oficial de Qwen, por lo que conviene validar la integridad de los pesos.
- El repo ocupa 133,7 GB, lo que implica descargar multiples ficheros de cuantizacion; revisar que se descarga solo el nivel necesario.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener terminos adicionales; revisar la licencia del modelo original Qwen2.5-VL-7B-Instruct.
- El soporte de tool calling y function calling no esta confirmado en la informacion disponible para esta variante.
- Para video se requiere `decord`, que no esta disponible en todos los sistemas operativos (la model card advierte que fuera de Linux puede fallar).

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/Nobo7/Qwen2.5-VL-7B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Blog oficial Qwen2.5-VL: https://qwenlm.github.io/blog/qwen2.5-vl/
- Repositorio GitHub: https://github.com/QwenLM/Qwen2.5-VL
- Chat demo: https://chat.qwenlm.ai/
- Paper Qwen2-VL (arXiv:2409.12191): https://arxiv.org/abs/2409.12191
- Paper referenciado (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper referenciado (arXiv:2308.12966): https://arxiv.org/abs/2308.12966
- Unsloth: https://github.com/unslothai/unsloth
