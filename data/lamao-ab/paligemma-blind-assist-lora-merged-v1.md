# lamao-ab/paligemma-blind-assist-lora-merged-v1

## Resumen

El modelo `lamao-ab/paligemma-blind-assist-lora-merged-v1` es un adaptador de visión-lenguaje (VLM) de código abierto, desarrollado por AHMED BOUSSIHMED (usuario `lamao-ab` en Hugging Face), que adapta el modelo base `google/paligemma-3b-mix-224` mediante fine-tuning con LoRA (Low-Rank Adaptation). El objetivo es asistir a personas ciegas o con baja visión, mejorando la capacidad del modelo para describir escenas y responder preguntas sobre imágenes en el dominio específico de la asistencia a la discapacidad visual.

El modelo resuelve el problema de que los VLM generalistas como PaliGemma tienen un rendimiento subóptimo en tareas de descripción de escenas para personas con discapacidad visual, donde las imágenes suelen ser ruidosas, desenfocadas o con encuadres no convencionales. Tras el fine-tuning, el modelo muestra una mejora significativa en el benchmark VizWiz (específico del dominio), pasando de un CIDEr-D de 55.31 a 98.08 en la tarea de captioning, mientras que mantiene un rendimiento casi intacto en el dominio general (VQAv2 y COCO-Caps), lo que indica una pérdida catastrófica mínima.

El modelo tiene aproximadamente 2.92 mil millones de parámetros, está fusionado en bf16 (sin necesidad de cargar el adaptador por separado en inferencia) y se distribuye bajo la licencia Gemma. Es relevante ahora porque demuestra que es posible especializar un VLM de 3B con técnicas de fine-tuning eficiente en parámetros (PEFT) para un dominio de accesibilidad con datos limitados, sin sacrificar las capacidades generales del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaliGemma (SigLIP vision encoder + Gemma 2B decoder) |
| Parametros totales | 2.923.466.480 (~2.92 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (max seq de entrenamiento: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (el prompt de ejemplo esta en ingles) |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (bf16, fusionado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura PaliGemma de Google, que combina un encoder de visión SigLIP con un decoder de lenguaje Gemma. El modelo base `google/paligemma-3b-mix-224` procesa imágenes de 224x224 píxeles y texto, generando respuestas de forma autorregresiva. El fine-tuning se realizó con LoRA de rango 8 y alpha 16, aplicado a las proyecciones q/k/v/o del attention y a las capas gate/up/down del MLP. Esto añadió 11.3 millones de parámetros entrenables (0.385 % del total), que posteriormente se fusionaron con los pesos base en bf16.

El entrenamiento se llevó a cabo durante 3 épocas (3.225 pasos) con un batch efectivo de 128, una longitud máxima de secuencia de 512 tokens y el optimizador AdamW. El dataset utilizado fue VizWiz, con 137.678 muestras de entrenamiento y 27.569 de validación. La pérdida de validación final fue de 1.6655. El pico de memoria GPU durante el entrenamiento fue de 53.1 GB, lo que sugiere el uso de QLoRA o de un GPU de alta gama (como A100 80GB). El resultado es un checkpoint fusionado que no requiere cargar el adaptador por separado en inferencia.

## Capacidades

- Descripción de escenas para personas con discapacidad visual: genera descripciones detalladas y contextualizadas de imágenes, adaptadas a las necesidades de usuarios ciegos o con baja visión.
- Respuesta a preguntas visuales (VQA) en el dominio de la asistencia: responde preguntas como "¿qué hay en esta imagen?" o "¿hay algún obstáculo?" con mayor precisión que el modelo base.
- Capacidades generales de VLM preservadas: mantiene un rendimiento cercano al modelo base en tareas generales de VQA (VQAv2) y captioning (COCO-Caps), con una degradación de aproximadamente 0.5 puntos en VQAv2.
- Procesamiento de imágenes de baja calidad: el fine-tuning con datos de VizWiz (que incluyen imágenes borrosas, mal encuadradas o tomadas por usuarios con discapacidad visual) mejora la robustez ante imágenes no ideales.
- Integración con el ecosistema transformers: se puede cargar con `PaliGemmaForConditionalGeneration` y `PaliGemmaProcessor` de Hugging Face.
- Generación de texto condicionada a imagen y prompt: soporta prompts de texto arbitrarios junto con la imagen de entrada.

## Casos de uso

- Asistente móvil para personas ciegas: el modelo puede integrarse en una aplicación que capture imágenes con la cámara del móvil y genere descripciones de la escena en tiempo real, ayudando al usuario a orientarse en entornos desconocidos.
- Lectura de etiquetas y documentos: el usuario apunta la cámara a una etiqueta de medicamento o un cartel, y el modelo describe el contenido, facilitando tareas cotidianas como identificar dosis o leer menús.
- Navegación en interiores: combinado con un sistema de visión por computador, el modelo puede describir obstáculos, escaleras o puertas, mejorando la seguridad en la movilidad.
- Moderación de contenido accesible: plataformas que necesitan generar descripciones alternativas (alt text) para imágenes subidas por usuarios con discapacidad visual pueden usar este modelo para automatizar el proceso.
- Evaluación de accesibilidad en diseño web: el modelo puede analizar capturas de pantalla de páginas web y describir si los elementos visuales son comprensibles, ayudando a los desarrolladores a cumplir con pautas WCAG.
- Educación y formación: el modelo puede utilizarse en aplicaciones educativas para que estudiantes con discapacidad visual accedan a contenido visual de libros de texto o material didáctico.

## Benchmarks y rendimiento

El autor proporciona resultados de benchmarks en la model card. Se presentan a continuación las métricas del checkpoint de la seed 123 (el publicado), comparadas con el modelo base. Las puntuaciones de LoRA son media ± desviación estándar sobre 3 semillas (42, 123, 7).

**VizWiz-VQA (dominio objetivo)**

| Modelo | Overall | Yes/No | Number | Other | Unans. |
|---|---|---|---|---|---|
| Base | 73.95 | 88.71 | 66.10 | 66.10 | 91.67 |
| LoRA (seed 123) | 75.80 ±0.21 | 86.55 | 67.56 | 66.54 | 97.73 |

**VizWiz-Caps (dominio objetivo)**

| Modelo | CIDEr-D | BLEU-4 | METEOR | ROUGE-L | Longitud |
|---|---|---|---|---|---|
| Base | 55.31 | 12.07 | 14.08 | 28.76 | 5.03 |
| LoRA (seed 123) | 98.08 ±1.51 | 30.77 ±0.36 | 23.45 ±0.31 | 49.54 ±0.47 | 10.30 |

**VQAv2 (control, dominio general)**

| Modelo | Overall | Yes/No | Number | Other |
|---|---|---|---|---|
| Base | 81.65 | 94.74 | 67.53 | 73.49 |
| LoRA | 81.15 ±0.04 | 94.57 | 66.38 | 72.85 |

**COCO-Caps (control, dominio general)**

| Modelo | CIDEr-D | BLEU-4 | METEOR | ROUGE-L | Longitud |
|---|---|---|---|---|---|
| Base | 131.21 | 31.96 | 30.62 | 59.17 | 12.40 |
| LoRA | 124.54 ±1.36 | 34.58 ±0.39 | 30.63 ±0.06 | 58.62 ±0.19 | 11.20 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa 5.45 GB en memoria con precision bf16. Con cuantizacion a 8 bits (desconocida si esta disponible) se podria reducir a ~3 GB, y a 4 bits a ~2 GB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070) puede ejecutar el modelo en bf16 sin problemas. Para mayor velocidad de generacion, se recomienda una RTX 4090 o una GPU de datacenter como A100 o H100.
- Compatibilidad con GPUs de consumo: si, el modelo cabe en GPUs consumer de gama media-alta con 8-12 GB de VRAM.
- Opciones de despliegue: al ser un modelo de la familia transformers, se puede servir con vLLM, Text Generation Inference (TGI), o mediante la API de Hugging Face Inference Endpoints. Tambien se puede usar con llama.cpp si se convierte a GGUF (no hay version GGUF publicada).
- Latencia y throughput: no se han publicado datos especificos. Como referencia, un modelo de 3B en una GPU moderna suele generar entre 30 y 60 tokens por segundo con batch size 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo (LoRA sobre PaliGemma-3B)** | 2.92 B | no disponible | Gemma | Asistencia a discapacidad visual | Hugging Face (safetensors) |
| **google/paligemma-3b-mix-224** (base) | 2.92 B | no disponible | Gemma | VLM generalista | Hugging Face |
| **microsoft/Phi-3-vision-128k-instruct** | 4.2 B | 128k | MIT | VLM generalista, razonamiento | Hugging Face |
| **Qwen2-VL-2B-Instruct** | 2.2 B | 32k | Apache 2.0 | VLM generalista, multilingue | Hugging Face |

La comparativa muestra que este modelo no compite con VLM generalistas mas grandes, sino que es una especializacion de PaliGemma. Su ventaja es el rendimiento en el dominio objetivo (VizWiz) con una degradacion minima en el dominio general. Las alternativas generalistas no estan afinadas para el dominio de la discapacidad visual.

## Limitaciones y advertencias

- Sesgos del dataset VizWiz: el modelo ha sido entrenado principalmente con imagenes tomadas por personas con discapacidad visual, que pueden no representar la diversidad de escenas que un usuario podria encontrar. Puede tener un rendimiento inferior en imagenes de alta calidad o muy diferentes a las del dataset.
- Riesgo de alucinacion: como cualquier VLM, puede generar descripciones incorrectas o inventadas, especialmente en imagenes ambiguas o de baja calidad. No debe utilizarse como unico sistema de seguridad para la navegacion.
- Longitud de contexto limitada: el entrenamiento se realizo con secuencias de hasta 512 tokens. Prompts o respuestas mas largas pueden degradar la calidad.
- Idioma: no se especifican los idiomas soportados. El prompt de ejemplo esta en ingles, por lo que el rendimiento en otros idiomas es incierto.
- Licencia Gemma: la licencia Gemma de Google impone restricciones de uso comercial y de redistribucion. Es obligatorio revisar los terminos en https://ai.google.dev/gemma/terms antes de utilizar el modelo en produccion.
- Pico de VRAM de entrenamiento: el pico de 53.1 GB indica que el entrenamiento requirio hardware de gama alta (A100 80GB o similar). La inferencia es mucho mas ligera (5.45 GB).
- Sin cuantizaciones publicadas: no se ofrecen pesos en GGUF, FP8 o INT4, lo que limita el despliegue en dispositivos con poca memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lamao-ab/paligemma-blind-assist-lora-merged-v1
- Perfil del autor (lamao-ab): https://huggingface.co/lamao-ab
- Modelo base PaliGemma: https://huggingface.co/google/paligemma-3b-mix-224
- Documentacion de PaliGemma de Google: https://ai.google.dev/gemma/docs/paligemma
- Dataset VizWiz: https://vizwiz.org/
- Paper de LoRA (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Despliegue en FriendliAI (variante QLoRA): https://friendli.ai/models/lamao-ab/paligemma-blind-assist-qlora-merged-v1
