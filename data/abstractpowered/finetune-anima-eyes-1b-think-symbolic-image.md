# AbstractPowered/finetune-anima-eyes-1b-think-symbolic-image

## Resumen

Anima Eyes 1B v1.2 es un fine-tune completo de un modelo vision-lenguaje desarrollado por AbstractPowered, diseñado específicamente para ocupar la ranura de codificador de texto del modelo de generación de imágenes Anima (circlestone-labs/Anima). El modelo observa una imagen y produce una lectura estructurada de la misma: una cadena de pensamientos en lenguaje llano con un paso nombrado por línea, seguida de formulaciones (caption, prompt, etiquetas, crítica por profundidad) y finalmente las preguntas que un observador cuidadoso aún se plantearía, cada una con su respuesta y lo que la resuelve.

Arquitectura híbrida de dos modelos: InternVL3.5-1B aporta su torre de visión, proyector, tabla de palabras y capas de lenguaje 0 a 23; Qwen3-0.6B-Base (el codificador de texto propio de Anima) aporta sus capas 24 a 27 y su norm final, actuando la tabla de palabras del Base como cabeza de salida. El resultado es un modelo de 1.060.897.792 parámetros que ve imágenes y cuyos estados finales —lo que Anima lee de su codificador de texto— proceden de las capas superiores del propio codificador de Anima.

La relevancia del modelo reside en su utilidad como componente: no es un modelo conversacional generalista, sino un codificador visual especializado que preserva la compatibilidad con el codificador de texto original de Anima (acuerdo de 0,948 en coseno medio token a token sobre 24 prompts no entrenados, frente a 0,805 antes del entrenamiento) mientras añade capacidad de lectura visual estructurada. Licencia Apache 2.0 y un único idioma soportado: inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje híbrida: torre de visión InternVL3.5-1B + proyector + capas de lenguaje 0-23 de InternVL3.5-1B + capas 24-27 y norm final de Qwen3-0.6B-Base |
| Parámetros totales | 1.060.897.792 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo combina dos arquitecturas transformer en un único grafo: InternVL3.5-1B (cuyo modelo de lenguaje es un Qwen3-0.6B entrenado junto a su codificador visual) aporta la visión, el proyector y las capas de lenguaje 0 a 23; Qwen3-0.6B-Base aporta las capas 24 a 27 y la norm final, con su tabla de palabras como cabeza de salida. La motivación es que las capas superiores de InternVL3.5-1B se alejaron del Base durante su entrenamiento multimodal, degradando la compatibilidad con el codificador de Anima; reinjertar las capas superiores del Base recupera esa compatibilidad. Las 45 tensores correspondientes a las capas 24-27 y la norm final de Anima permanecieron congelados durante el entrenamiento y son idénticos bit a bit al archivo del codificador de texto original de Anima.

El entrenamiento consistió en un fine-tune completo sobre 91.138 filas (las mismas que Lucia 0.8B v1.2), una única pasada de 10.137 pasos. Los datos son lecturas de fotografías DOCCI y COCO 2017, imágenes de la National Gallery of Art y especificaciones dibujadas, escritas por modelos de OpenAI, Google y DeepSeek y admitidas por revisión ciega; 30.250 filas son "long looks". Ninguna fila fue escrita por un modelo Claude ni por modelos del proyecto entrenados sobre filas de Claude. Se excluyeron 3.718 filas de COCO 2017 con otras licencias, 609 filas de validación y 16 filas sin imagen disponible. Un segundo objetivo de entrenamiento mantiene las elecciones de siguiente palabra cerca del modelo de partida en peticiones ordinarias (0,096 nats por token de divergencia en held-out), y el modelo no responde ninguna de esas peticiones en la forma de la lectura estructurada.

## Capacidades

- Generación de lecturas visuales estructuradas: cadena de pensamientos con pasos nombrados (see, relate, mood, etc.) seguida de caption, prompt, etiquetas y crítica por profundidad.
- Generación de preguntas y respuestas de seguimiento sobre la imagen observada, con justificación de lo que resuelve cada respuesta.
- Image captioning y descripción detallada de fotografías, pinturas y especificaciones dibujadas.
- Codificador de texto compatible con Anima: sus estados finales se alinean con los del codificador original (0,948 de coseno medio en prompts no entrenados).
- Capacidad de "thinking mode" mediante la cadena de pensamientos explícita por línea.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la cadena de pensamientos.
- Multilingüe: solo inglés.

## Casos de uso

- Codificador de texto para Anima en producción: sustituir el codificador original de Anima por este modelo en la ranura correspondiente, manteniendo la generación de imágenes casi idéntica (verificado en ComfyUI con cambios menores) mientras se añade capacidad de lectura visual al pipeline.
- Generación automática de captions para datasets de imágenes: el modelo produce caption, prompt, etiquetas y crítica por profundidad en una sola pasada, útil para etiquetar corpus de fotografías (DOCCI, COCO) o pinturas de museos.
- Análisis de imágenes artísticas: lectura estructurada de pinturas de la National Gallery of Art con pasos de relación, atmósfera y crítica, adecuada para catalogación o accesibilidad.
- Descripción de especificaciones dibujadas: interpretación de diagramas y bocetos técnicos (sin imagen en algunas filas de entrenamiento) para generar descripciones textuales.
- Preprocesamiento para generación de imágenes: convertir una imagen de referencia en un prompt textual detallado que alimente un modelo texto-a-imagen, aprovechando la salida en formato prompt.
- Revisión y crítica visual automatizada: la sección de crítica por profundidad permite generar evaluaciones estructuradas de composición, iluminación y contenido para herramientas de edición o curaduría.
- Generación de preguntas de seguimiento: producir pares pregunta-respuesta sobre una imagen para sistemas de verificación o anotación asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta métricas internas de alineación con el codificador de Anima: acuerdo de coseno medio token a token de 0,948 tras entrenamiento (0,805 antes) sobre 24 prompts no entrenados; divergencia de 0,096 nats por token respecto al modelo de partida en peticiones ordinarias held-out; y comparación cualitativa en ComfyUI con imágenes "casi idénticas" a las del codificador original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1.060.897.792 parámetros, en fp16 requiere aproximadamente 2,1 GB solo para pesos, más memoria para la torre de visión y activaciones.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada en la documentación; el tamaño (1B) sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no se aporta dato verificado.
- Opciones de despliegue: transformers (librería declarada); endpoints_compatible según los tags de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Anima Eyes 1B v1.2 | 1.060.897.792 | No disponible | Apache 2.0 | Hugging Face | Fine-tune completo, codificador para Anima |
| Lucia 0.8B v1.2 (AbstractPhil/qwen3.5-0.8b-think-symbolic-image) | ~0,8B | No disponible | No disponible en la información | Hugging Face | Misma receta de entrenamiento, tamaño menor |
| OpenGVLab/InternVL3_5-1B-HF | ~1B | No disponible | No disponible en la información | Hugging Face | Modelo base de visión-lenguaje |
| Qwen/Qwen3-0.6B-Base | ~0,6B | No disponible | No disponible en la información | Hugging Face | Codificador de texto base de Anima |

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta capacidad multilingüe.
- Riesgo de alucinación inherente a modelos generativos: las lecturas y respuestas de seguimiento pueden contener detalles no presentes en la imagen.
- Modelo de utilidad especializado, no conversacional generalista: está diseñado para la ranura de codificador de Anima, no como asistente general.
- Sesgos conocidos: no documentados explícitamente; los datos de entrenamiento provienen de DOCCI, COCO 2017, National Gallery of Art y especificaciones dibujadas, con posibles sesgos de composición y procedencia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero las filas de COCO 2017 con licencias distintas de Attribution fueron excluidas del entrenamiento; el modelo solo vio fotografías con licencia Attribution o sin restricciones conocidas.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas.
- No se documentan cuantizaciones ni formatos GGUF, limitando opciones de despliegue en entornos con recursos restringidos.
- El modelo no debe esperarse que responda peticiones ordinarias en la forma de la lectura estructurada; su comportamiento está sesgado hacia la salida de lectura visual.

## Enlaces

- Hugging Face: https://huggingface.co/AbstractPowered/finetune-anima-eyes-1b-think-symbolic-image
- Registro de investigación: https://huggingface.co/AbstractPhil/anima-eyes-1b-think-symbolic-image-full
- Manifiestos (hashes y licencia): https://huggingface.co/datasets/AbstractPowered/manifests
- Modelo base de visión-lenguaje: https://huggingface.co/OpenGVLab/InternVL3_5-1B-HF
- Codificador de texto base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Modelo Anima: https://huggingface.co/circlestone-labs/Anima
- Modelo de referencia Lucia 0.8B v1.2: https://huggingface.co/AbstractPhil/qwen3.5-0.8b-think-symbolic-image
- Dataset thought-symbolic-image-recaptioned (release 5): https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-recaptioned/tree/cac40b93d7b063aafd0cb70d3c1b1a7a100562ef
- Dataset thought-symbolic-image-captions: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Imagen de ejemplo COCO 2017 (376084): https://cocodataset.org/#explore?id=376084
