# Qwen/Qwen2-VL-2B-Instruct

## Resumen

Qwen2-VL-2B-Instruct es la variante mas pequena de la familia Qwen2-VL, un conjunto de modelos multimodales (vision-lenguaje) desarrollados por el equipo Qwen de Alibaba. El modelo acepta imagenes, videos y texto como entrada y genera texto, resolviendo tareas de comprension visual, OCR, respuesta a preguntas sobre documentos, graficos y videos, y razonamiento multimodal. Su relevancia radica en que ofrece capacidades competitivas en un tamano de 2.200 millones de parametros, lo que permite desplegarlo en hardware modesto.

La arquitectura combina un codificador visual con un transformer de lenguaje, e introduce dos innovaciones tecnicas: la resolucion dinamica ingenua (naive dynamic resolution), que mapea imagenes de resolucion y relacion de aspecto arbitrarias a un numero variable de tokens visuales, y el Multimodal Rotary Position Embedding (M-ROPE), que descompone el embedding posicional para capturar informacion 1D de texto, 2D de imagen y 3D de video.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y esta integrado en el ecosistema de transformers y en text-generation-inference. Existe una version posterior, Qwen3-VL-2B-Instruct, que el autor referencia como sucesora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + LLM Qwen2) con naive dynamic resolution y M-ROPE |
| Parametros totales | 2.208.985.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, tipicamente bf16/fp16) |
| Idiomas soportados | Ingles (declarado); comprension de texto en imagenes en la mayoria de lenguas europeas, japones, coreano, arabe y vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal que empareja un codificador visual con un modelo de lenguaje de la familia Qwen2. La innovacion principal es la naive dynamic resolution, que procesa imagenes de cualquier resolucion y relacion de aspecto convirtiendolas en un numero dinamico de tokens visuales (rango por defecto de 4 a 16.384 tokens por imagen, configurable mediante `min_pixels` y `max_pixels`). El M-ROPE descompone el embedding posicional rotatorio en componentes para representar posiciones 1D (texto), 2D (imagen) y 3D (video), lo que permite manejar videos de mas de 20 minutos.

No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset ni del detalle de las etapas de alineacion (RLHF/DPO). El modelo es la version instruction-tuned del modelo base Qwen/Qwen2-VL-2B. Se recomienda usar `flash_attention_2` para acelerar la inferencia y reducir memoria en escenarios con multiples imagenes y video.

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de imagenes, videos y texto.
- Comprension de imagenes de resolucion y relacion de aspecto arbitrarias (naive dynamic resolution).
- Comprension de videos de mas de 20 minutos para respuesta a preguntas, dialogo y creacion de contenido.
- OCR y comprension de documentos, graficos y tablas (DocVQA, InfoVQA, ChartQA, OCRBench, TextVQA).
- Razonamiento matematico sobre imagenes (MathVista, MathVision).
- Comprension multilingue de texto dentro de imagenes (lenguas europeas, japones, coreano, arabe, vietnamita).
- Capacidad de agente: razonamiento complejo y toma de decisiones para operar moviles, robots y otros dispositivos a partir del entorno visual e instrucciones de texto.
- Soporte de conversacion multi-turno mediante plantilla de chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion y extraccion de datos de documentos: el modelo procesa facturas, formularios y documentos escaneados con OCR robusto (OCRBench 794, DocVQA 90,1), adecuado para pipelines de captura de datos.
- Analisis de graficos e informes financieros: responde preguntas sobre ChartQA e InfoVQA, util para extraer tendencias y cifras de graficos en herramientas de business intelligence.
- Atencion al cliente con soporte de imagenes: gestiona conversaciones multi-turno donde el usuario adjunta capturas o fotos, gracias a la plantilla de chat y al procesamiento de imagenes de resolucion arbitraria.
- Analisis de video para moderacion o resumen: con capacidad de entender videos de mas de 20 minutos, sirve para resumir contenido, responder preguntas sobre grabaciones o generar descripciones.
- Agentes de automatizacion de interfaz: su capacidad de agente permite interpretar el entorno visual de un movil o robot y ejecutar instrucciones de texto para operaciones automaticas.
- Accesibilidad: descripcion de imagenes y lectura de texto en fotografias para usuarios con discapacidad visual, con soporte de multiples idiomas en el texto de las imagenes.
- Procesamiento en el borde (edge): con 2,2B parametros puede desplegarse en GPUs de consumo para tareas de vision-lenguaje en local, reduciendo costes y preservando privacidad.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (benchmarks de imagen):

| Benchmark | InternVL2-2B | MiniCPM-V 2.0 | Qwen2-VL-2B |
|---|---|---|---|
| MMMU (val) | 36,3 | 38,2 | 41,1 |
| DocVQA (test) | 86,9 | - | 90,1 |
| InfoVQA (test) | 58,9 | - | 65,5 |
| ChartQA (test) | 76,2 | - | 73,5 |
| TextVQA (val) | 73,4 | - | 79,7 |
| OCRBench | 781 | 605 | 794 |
| MTVQA | - | - | 20,0 |
| VCR (en easy) | - | - | 81,45 |
| VCR (zh easy) | - | - | 46,16 |
| RealWorldQA | 57,3 | 55,8 | 62,9 |
| MME (sum) | 1876,8 | 1808,6 | 1872,0 |
| MMBench-EN (test) | 73,2 | 69,1 | 74,9 |
| MMBench-CN (test) | 70,9 | 66,5 | 73,5 |
| MMBench-V1.1 (test) | 69,6 | 65,8 | 72,2 |
| MMT-Bench (test) | - | - | 54,5 |
| MMStar | 49,8 | 39,1 | 48,0 |
| MMVet (GPT-4-Turbo) | 39,7 | 41,0 | 49,5 |
| HallBench (avg) | 38,0 | 36,1 | 41,7 |
| MathVista (testmini) | 46,0 | 39,8 | 43,0 |
| MathVision | - | - | 12,4 |

Benchmarks de video:

| Benchmark | Qwen2-VL-2B |
|---|---|
| MVBench | 63,2 |
| PerceptionTest (test) | 53,9 |
| EgoSchema (test) | 54,9 |
| Video-MME (sin/con subtitulos) | 55,6 / 60,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16/fp16, aproximadamente 4,4 GB solo para pesos; en la practica se recomienda reservar 6-8 GB para margen de activaciones y tokens visuales.
- Cuantizacion: no se documentan en la informacion proporcionada formatos GGUF o cuantizaciones oficiales; el modelo se distribuye en safetensors.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090; para despliegue en servidor, A100 o H100 ofrecen mayor throughput.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM.
- Opciones de despliegue: transformers (con `flash_attention_2` recomendado), text-generation-inference; el autor no documenta en la informacion proporcionada soporte oficial de vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMMU (val) | OCRBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen2-VL-2B-Instruct | 2,2B | no disponible | 41,1 | 794 | Apache 2.0 | Hugging Face |
| InternVL2-2B | 2B | no disponible | 36,3 | 781 | no disponible | Hugging Face |
| MiniCPM-V 2.0 | no disponible | no disponible | 38,2 | 605 | no disponible | Hugging Face |

Qwen2-VL-2B-Instruct supera a InternVL2-2B y MiniCPM-V 2.0 en la mayoria de benchmarks de imagen publicados (MMMU, DocVQA, OCRBench, RealWorldQA, MMBench, MMVet), aunque queda por debajo en ChartQA y MathVista frente a InternVL2-2B y en MME frente a InternVL2-2B.

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada; como modelo entrenado con datos web, puede reproducir sesgos presentes en ellos.
- Alucinacion: como todo modelo generativo, puede producir descripciones o respuestas no sustentadas en la imagen, especialmente en tareas de razonamiento complejo (MathVision 12,4 sugiere margen de mejora en matematicas visuales).
- Contexto: la longitud de contexto no esta disponible en la informacion proporcionada; el numero de tokens visuales por imagen es configurable (4-16.384 por defecto) y afecta a memoria y velocidad.
- Idioma: el modelo declara soporte de ingles; la comprension multilingue se limita al texto dentro de imagenes, no a la generacion en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento no documentados.
- Produccion: el modelo base ha sido superado por Qwen3-VL-2B-Instruct segun el propio autor; para nuevos desarrollos conviene evaluar la version sucesora.
- Rendimiento en video: los resultados en Video-MME y PerceptionTest son moderados; para tareas de video exigentes puede requerirse un modelo mayor.

## Enlaces

- Hugging Face: https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2-VL-2B
- Version sucesora: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Blog: https://qwenlm.github.io/blog/qwen2-vl/
- GitHub: https://github.com/QwenLM/Qwen2-VL
- Paper Qwen2-VL: https://arxiv.org/abs/2409.12191
- Paper Qwen-VL: https://arxiv.org/abs/2308.12966
- Chat: https://chat.qwen.ai/
- Web oficial: https://qwen.ai/home
- Wikipedia: https://en.wikipedia.org/wiki/Qwen
