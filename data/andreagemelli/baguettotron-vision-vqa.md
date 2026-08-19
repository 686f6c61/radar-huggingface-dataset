# andreagemelli/baguettotron-vision-vqa

## Resumen

Baguettotron-VLM es un modelo de lenguaje y visión (VLM) abierto y reproducible en la clase sub-1B de parámetros, desarrollado por Andrea Gemelli. Extiende el modelo de texto Baguettotron de PleIAs (321M de parámetros, arquitectura Llama) con el encoder visual InternViT-300M-448px-V2.5 (304M, congelado) y un proyector MLP ligero, alcanzando unos 665M de parámetros totales según los pesos safetensors (la model card indica ~628M). El modelo acepta imágenes de 448×448 píxeles y las convierte en 256 tokens visuales mediante pixel unshuffle, que se intercalan con los tokens de texto para que el LLM genere respuestas.

Se publican dos checkpoints: uno de alineación solo-proyector (baguettotron-internvit-alignment) y el presente, ajustado por instrucciones (baguettotron-vision-vqa), que sigue instrucciones visuales y responde preguntas de respuesta corta. Hereda seis idiomas europeos (inglés, francés, alemán, español, italiano y polaco) del backbone de Baguettotron. Su relevancia radica en ofrecer un VLM multilingüe de tamaño reducido, con licencia Apache 2.0, reproducible y ejecutable en hardware de consumo, pensado para tareas de descripción de imágenes y VQA factual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (InternViT-300M-448px-V2.5) + MLP proyector + LLM Baguettotron (Llama, 80 capas, h=576) |
| Parametros totales | 665.412.544 (según safetensors; la model card indica ~628M) |
| Parametros activos | 665.412.544 (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (safetensors); no se documentan cuantizaciones adicionales |
| Idiomas soportados | en, fr, de, es, it, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un encoder visual congelado (InternViT-300M-448px-V2.5) que procesa una imagen de 448×448 píxeles y produce 1024 tokens de 1024 dimensiones. Un pixel unshuffle (factor 2) reduce esto a 256 tokens de 4096 dimensiones, que un proyector MLP de dos capas (~2,7M de parámetros) transforma a 576 dimensiones para alinearlos con el espacio de embeddings del LLM Baguettotron. El LLM, de 321M de parámetros y arquitectura Llama, es el backbone de texto.

El entrenamiento se realiza en dos fases: primero un calentamiento del proyector (alignment) con datos de descripción de imágenes, y después un ajuste fino por instrucciones del proyector y el LLM sobre el dataset The Cauldron (47 subconjuntos) mezclado con un 10% de datos de texto sintético de PleIAs/SYNTH. No se emplea RLHF ni DPO; el ajuste es supervisado. El modo de generación es "no-thinking": la respuesta del asistente comienza directamente con el token de cierre `response` sin trazas de razonamiento, porque The Cauldron no contiene dichas trazas.

## Capacidades

- Respuesta a preguntas visuales (VQA) de respuesta corta: qué hay en la imagen, conteo de objetos, opción múltiple.
- Generación de descripciones de imágenes (image captioning) concisas.
- Seguimiento de instrucciones visuales simples (por ejemplo, "Describe la imagen de forma concisa").
- Multilingüismo heredado: inglés, francés, alemán, español, italiano y polaco, aunque no verificado en benchmarks no ingleses.
- No soporta OCR ni lectura de texto en imágenes (la resolución de 448×448 limita el texto a 2-4 px/carácter).
- No incluye modo de razonamiento explícito (sin trazas `thinking`).
- No dispone de tool calling ni capacidades de agente.

## Casos de uso

- Descripción automática de imágenes para accesibilidad: generar textos alternativos para personas con discapacidad visual en páginas web o aplicaciones, usando el modelo para producir descripciones cortas en varios idiomas.
- Moderación de contenido visual básica: clasificar imágenes según su contenido (por ejemplo, detectar si hay animales, vehículos o personas) mediante preguntas de sí/no o de opción múltiple.
- Asistente de ayuda visual en móviles: integrar el modelo en una app que responda "¿qué hay en la foto?" o "¿cuántos objetos aparecen?" con respuestas factuales cortas, gracias a su bajo consumo de recursos.
- Análisis rápido de fotos en e-commerce: generar descripciones de productos a partir de imágenes para catálogos multilingües, aprovechando el soporte de seis idiomas.
- Material didáctico interactivo: responder preguntas sobre imágenes en libros o presentaciones educativas, como "¿qué animal es este?" o "¿qué color predomina?", en entornos con recursos limitados.
- Prototipado de VLM en edge devices: ejecutar el modelo en CPU o Apple Silicon para pruebas de concepto de aplicaciones de visión por computador sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan ~1,3 GB; con overhead de activaciones y KV cache, se estiman 2-3 GB de VRAM para inferencia.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.) y GPUs de datacenter como A100 o H100.
- Compatible con Apple Silicon (mps) y CPU, según pruebas del autor.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), posible conversión a GGUF para llama.cpp u Ollama, y soporte en vLLM si se adapta el formato.
- Latencia y throughput: no disponibles; al ser un modelo de ~665M, se espera una latencia baja en GPU consumer, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos de la misma categoría (VLM sub-1B multilingües). La model card no proporciona benchmarks ni comparaciones con alternativas. Se puede mencionar que existen otros VLM pequeños como Moondream2 (1.86B) o SmolVLM (2.2B), pero no son sub-1B y no hay datos de rendimiento comparables.

## Limitaciones y advertencias

- Resolución limitada: una sola imagen de 448×448 produce 256 tokens visuales, lo que impide leer texto en imágenes (OCR), gráficos o documentos (2-4 px/carácter).
- Alucinaciones frecuentes en preguntas de detalle fino o con mucho texto; el modelo puede inventar contenido cuando se le piden respuestas largas.
- El ajuste por instrucciones es limitado en comparación con el volumen de datos; el rendimiento decae en prompts largos o composicionales.
- La capacidad multilingüe es heredada del backbone, pero no ha sido evaluada en benchmarks no ingleses; el rendimiento real en español, francés, etc. no está verificado.
- No soporta tool calling ni razonamiento explícito (modo "no-thinking").
- El uso en producción requiere validación adicional, especialmente en tareas que exijan precisión visual o lectura de texto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no garantiza resultados en escenarios no probados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreagemelli/baguettotron-vision-vqa
- Checkpoint de alineación: https://huggingface.co/andreagemelli/baguettotron-internvit-alignment
- Colección Baguettotron-VLM: https://huggingface.co/collections/andreagemelli/baguettotron-vlm-69de37b4cab1960226e9c1f7
- Repositorio de código: https://github.com/andreagemelli/baguettotron-vlm
- Artículo técnico: https://andreagemelli.me/posts/baguettotron-vlm
- Modelo base de texto: https://huggingface.co/PleIAs/Baguettotron
- Encoder visual: https://huggingface.co/OpenGVLab/InternViT-300M-448px-V2_5
