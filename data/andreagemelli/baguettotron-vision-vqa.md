# andreagemelli/baguettotron-vision-vqa

## Resumen

Baguettotron-VLM (checkpoint `baguettotron-vision-vqa`) es un modelo de visión-lenguaje multimodal de código abierto y tamaño reducido (sub-1B) desarrollado por el autor independiente andreagemelli. Extiende el modelo de texto PleIAs/Baguettotron —un SLM de razonamiento de 321M de parámetros con arquitectura Llama— añadiendo capacidades visuales mediante el codificador de visión InternViT-300M-448px-V2.5 de OpenGVLab y un proyector MLP ligero. El total ronda los 628M de parámetros según la model card (665.412.544 según los pesos safetensors publicados).

El modelo resuelve tareas de respuesta a preguntas visuales (VQA) y descripción de imágenes en seis idiomas europeos (inglés, francés, alemán, español, italiano y polaco), heredados del backbone textual. Se publica bajo licencia Apache 2.0 y está pensado para ser totalmente reproducible, con código fuente y write-up disponibles. Su relevancia radica en ofrecer un VLM completamente abierto y de pequeño tamaño, desplegable en hardware modesto, en una categoría dominada por modelos mucho mayores.

La versión 1.1 (4 de noviembre de 2026) introduce una edición en el espacio de pesos sin entrenamiento por gradiente: se modificaron 9.216 pesos de los 665M (0,0014 %) para que el modelo termine sus respuestas con un token de parada real y responda mejor a preguntas del tipo "¿hay un … en la imagen?". El checkpoint original se conserva como `revision="v1.0"`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador InternViT-300M-448px-V2.5 (congelado) + pixel unshuffle (factor 2) + proyector MLP de 2 capas (~2,7M) + LLM Baguettotron (321M, arquitectura Llama, 80 capas, h=576) |
| Parametros totales | 665.412.544 (según safetensors); ~628M según la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card cita uso en bfloat16 y fp32) |
| Idiomas soportados | en, fr, de, es, it, pl |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura encadena un codificador visual InternViT-300M-448px-V2.5 (304M, congelado) que procesa imágenes de 448×448 y produce 1024 tokens de dimensión 1024. Un pixel unshuffle de factor 2 reduce la secuencia a 256 tokens de dimensión 4096, que un proyector MLP de dos capas (~2,7M de parámetros) proyecta a 256 tokens de dimensión 576. Estos tokens visuales se intercalan con los tokens de texto y se introducen en el LLM Baguettotron (321M, arquitectura Llama con 80 capas y dimensión oculta 576).

El entrenamiento consta de dos fases. Primero, un warmup de solo proyector (`baguettotron-internvit-alignment`) que alinea visión y lenguaje y produce únicamente descripciones. Después, un fine-tuning completo del proyector y del LLM sobre The Cauldron (47 subconjuntos) mezclado con un 10 % de datos textuales PleIAs/SYNTH. El modelo se entrena con el turno del asistente comenzando siempre por un token de cierre `` (modo "sin razonamiento"), ya que The Cauldron no contiene trazas de razonamiento; el procesador rellena automáticamente ese prefijo. La versión 1.1 aplica una edición en el espacio de pesos inspirada en *Sparks of Weight-Space Programming*: modifica 4 filas de la capa de salida (token de parada, 2.304 pesos) y 4 neuronas de la MLP de la última capa, sin descenso de gradiente, para enrutar hacia la respuesta una evidencia que el modelo ya codificaba en sus activaciones (una sonda lineal lee la presencia del objeto con un 70–74 % de acierto).

## Capacidades

- Respuesta a preguntas visuales (VQA) directa, sin trazas de razonamiento.
- Descripción de imágenes y captioning corto.
- Seguimiento de instrucciones visuales básicas.
- Conversación multimodal de un solo turno con imagen intercalada mediante el token `<image>`.
- Multilingüismo en seis idiomas: inglés, francés, alemán, español, italiano y polaco.
- Respuestas terminadas con token de parada real (a partir de v1.1).
- Mejor rendimiento en preguntas de presencia del tipo "¿hay un … en la imagen?" (v1.1).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de audio o thinking mode: no disponibles.

## Casos de uso

- Descripción automática de imágenes en catálogos y bibliotecas: el modelo genera captions cortos y directos, adecuado para etiquetar lotes de imágenes con un coste computacional bajo gracias a sus ~628M de parámetros.
- Accesibilidad: generación de texto alternativo breve para imágenes en aplicaciones y sitios web en cualquiera de los seis idiomas soportados, ejecutable en CPU o Apple Silicon según la model card.
- Moderación y verificación de contenido visual: responder preguntas de presencia ("¿hay un coche en la imagen?") es una de las tareas reforzadas en v1.1, útil en filtros automáticos simples.
- Asistente de chat multimodal ligero: integración en aplicaciones de mensajería donde el usuario adjunta una imagen y formula una pregunta corta, con despliegue en hardware de gama baja.
- Procesamiento por lotes en entornos con recursos limitados: al caber en dispositivos sin GPU dedicada (probado en mps y CPU), permite pipelines de captioning masivo sin infraestructura de servidores GPU.
- Educación y prototipado de investigación: al ser totalmente reproducible y Apache 2.0, sirve como base para experimentos de alineación visión-lenguaje, edición en espacio de pesos y estudios de VLM de pequeño tamaño.
- Localización multilingüe de contenido visual: descripciones en francés, alemán, español, italiano o polaco sin necesidad de modelos separados por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica cualitativamente que el modelo es más fuerte en descripciones cortas y preguntas del tipo "qué hay en la imagen", y más débil en descripción abierta larga, con respuestas de opción múltiple, conteo y color cercanas al azar. No se aportan cifras de MMLU, HumanEval, GSM8K ni de benchmarks multimodales como MMMU o VQAv2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 665M de parámetros, en bfloat16 los pesos ocupan aproximadamente 1,3 GB, a los que se suma el estado del codificador y las activaciones.
- GPU recomendadas: no disponible; la model card no especifica GPU concretas.
- Cabe en GPU de consumo: sí, por tamaño (sub-1B); la model card confirma funcionamiento en Apple Silicon (mps) y CPU, además de `device_map="auto"`.
- Opciones de despliegue: `transformers>=4.56,<5` con `AutoModelForImageTextToText` y `AutoProcessor`, `trust_remote_code=True`, junto con torch, pillow, timm, einops y accelerate. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni comparaciones directas con otros modelos en la información disponible. Como referencia estructural, el modelo se apoya en dos componentes abiertos: PleIAs/Baguettotron (321M, texto) y OpenGVLab/InternViT-300M-448px-V2_5 (304M, visión). No se dispone de datos de rendimiento comparativo frente a otros VLM de la clase sub-1B, por lo que la comparativa cuantitativa se indica como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| baguettotron-vision-vqa | ~628M (665M en safetensors) | no disponible | Apache 2.0 | Hugging Face |
| PleIAs/Baguettotron (backbone) | 321M | no disponible | no disponible en la informacion | Hugging Face |
| OpenGVLab/InternViT-300M-448px-V2_5 (codificador) | 304M | no disponible | no disponible en la informacion | Hugging Face |
| Alternativas VLM sub-1B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Riesgo de alucinación: los ejemplos de la model card muestran descripciones incorrectas ("One cat is wearing a red light switch"), lo que indica errores factuales frecuentes en detalles finos.
- Preguntas de opción múltiple, conteo y color: el propio autor señala que las respuestas están cerca del azar.
- Descripción abierta larga: es el punto más débil del modelo; rinde mejor en descripciones cortas.
- Variabilidad por dispositivo: las descripciones en bfloat16 varían según el hardware; en fp32 las versiones 1.0 y 1.1 producen textos casi idénticos.
- Contexto: la longitud de contexto no está documentada, lo que dificulta planificar conversaciones largas o imágenes múltiples.
- Idiomas: aunque soporta seis idiomas europeos, no se documenta calidad por idioma ni cobertura fuera de ellos.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de usarlo en producción.
- Licencia: Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluaciones de seguridad.
- Sin soporte documentado de tool calling, agentes o razonamiento multi-paso, lo que limita su uso en pipelines agénticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andreagemelli/baguettotron-vision-vqa
- Checkpoint de alineación (solo proyector): https://huggingface.co/andreagemelli/baguettotron-internvit-alignment
- Colección Baguettotron-VLM: https://huggingface.co/collections/andreagemelli/baguettotron-vlm-69de37b4cab1960226e9c1f7
- Código fuente: https://github.com/andreagemelli/baguettotron-vlm
- Write-up del autor: https://andreagemelli.me/posts/baguettotron-vlm/
- Modelo base textual: https://huggingface.co/PleIAs/Baguettotron
- Codificador visual: https://huggingface.co/OpenGVLab/InternViT-300M-448px-V2_5
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceM4/the_cauldron
- Blog sobre edición en espacio de pesos: https://rikiyat.github.io/blog/weight-space-programming/
- Paper referenciado (arXiv:2305.10355): https://arxiv.org/abs/2305.10355
- COCO (imágenes de ejemplo): https://cocodataset.org
