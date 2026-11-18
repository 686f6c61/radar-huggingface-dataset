# black-forest-labs/flux-3-image-klein-pup

## Resumen

FLUX 3 Image Klein Prompt Upsampler es un modelo vision-lenguaje de 9B parámetros desarrollado por Black Forest Labs como componente auxiliar del generador de imágenes FLUX 3 Image Klein. Su función no es generar imágenes, sino expandir una petición breve del usuario (por ejemplo, "un hombre paseando a su perro, sol de tarde") en un prompt detallado de varias frases que el modelo de difusión interpreta con mayor fidelidad. Acepta hasta 10 imágenes de referencia y, opcionalmente, una lista de bounding boxes, y devuelve un único prompt en inglés.

Técnicamente es un fine-tune completo de Qwen3.5-9B con la torre de visión congelada, entrenado en dos fases: aprendizaje supervisado sobre pares de peticiones cortas y prompts expandidos, y posterior ajuste por preferencias usando imágenes renderizadas con FLUX 3 Image Klein a la misma semilla y ordenadas por calidad del resultado. El modelo pesa 9.409.813.744 parámetros en bfloat16 (18,8 GB) y se distribuye bajo licencia Apache 2.0.

Su relevancia práctica radica en que Black Forest Labs lo integra por defecto en su pipeline de inferencia y en los templates de ComfyUI, de modo que actúa como capa de traducción entre la intención del usuario y el prompt técnico que el generador necesita. Es un ejemplo claro de modelo especializado en una única tarea de texto (prompt engineering automatizado) en lugar de un asistente conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3.5-9B fine-tuneado; torre de visión congelada) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés en la salida; la petición de entrada puede estar en cualquier idioma |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso con torre de visión, y se somete a un fine-tune completo manteniendo congelada la torre de visión. El entrenamiento se estructura en dos etapas: primero, aprendizaje supervisado sobre pares formados por peticiones cortas y sus correspondientes prompts expandidos; después, ajuste por preferencias (preference tuning) sobre pares de prompts generados por el propio modelo, renderizados con FLUX 3 Image Klein a la misma semilla y clasificados según la calidad de la imagen resultante. Esta segunda fase alinea el modelo con lo que el generador de imágenes interpreta mejor, no solo con lo que suena bien como texto.

La innovación principal es la especialización en cuatro modos de operación seleccionables mediante system prompt (`t2i`, `i2i`, `t2i_bbox`, `i2i_bbox`), que cubren texto-a-imagen, edición con referencias y layout con bounding boxes. En modo edición, el modelo inspecciona las imágenes de referencia y redacta la instrucción describiendo qué cambia y qué permanece según la apariencia de los elementos. En modo layout, conserva exactamente las cajas proporcionadas y las emite como tabla tras el prompt, citando cada una por identificador para que el generador coloque el elemento en la posición indicada. La decodificación recomendada es greedy con `top_p` 0.95, `top_k` 20 y penalización de presencia 1.5 para texto-a-imagen y 0 para ediciones.

## Capacidades

- Expansión de prompts de texto-a-imagen: convierte una petición breve en un prompt de varias frases con medio, estilo, escena, iluminación, cámara y descripción de cada sujeto (colores, materiales, posición en el encuadre).
- Edición guiada por referencias: procesa hasta 10 imágenes de referencia y redacta la instrucción de edición en función de lo que aparece en ellas.
- Layout con bounding boxes: acepta cajas en JSON y las preserva exactamente, citándolas por id en el prompt resultante.
- Conservación literal de texto a renderizar: el texto que debe aparecer en la imagen se mantiene verbatim, entre comillas.
- Procesamiento multimodal: entrada de imagen y texto (pipeline `image-text-to-text`).
- Comprensión multilingüe de la petición: la solicitud puede formularse en cualquier idioma, aunque la salida es siempre en inglés.
- Integración con tooling: se carga por defecto en el código de inferencia de FLUX 3 Image Klein, en el pipeline modular de Diffusers y en los templates de ComfyUI mediante el interruptor `enable_prompt_upsampler`.
- Compatibilidad con Transformers mediante `Qwen3_5ForConditionalGeneration` y `AutoProcessor`.

## Casos de uso

- Generación de imágenes asistida en producción: el modelo se interpone entre la petición del usuario y FLUX 3 Image Klein para elevar la calidad del resultado sin exigir al usuario conocimientos de prompting; es el flujo por defecto del pipeline oficial.
- Edición de imágenes con referencias múltiples: en herramientas de retoque, el modelo recibe hasta 10 imágenes y una instrucción breve ("ponle un pañuelo rojo al perro") y genera la descripción precisa de qué cambia y qué se mantiene, lo que reduce iteraciones fallidas.
- Composición con layout controlado: en diseño gráfico o publicidad, el usuario define bounding boxes para logotipos, productos o texto, y el modelo produce un prompt que respeta esas posiciones exactas, algo que un prompt libre no garantiza.
- Automatización de flujos creativos por lotes: un pipeline que recibe cientos de peticiones breves de un catálogo y genera prompts detallados de forma determinista (decodificación greedy), adecuado para generar variaciones consistentes de un mismo producto.
- Integración en ComfyUI para artistas y estudios: los templates oficiales activan el upsampler con un interruptor, de modo que equipos sin perfil técnico obtienen prompts de calidad profesional sin escribir system prompts.
- Sustitución de prompts manuales en equipos de marketing: el modelo estandariza el estilo de los prompts (medio, iluminación, cámara) en toda una organización, lo que homogeniza la estética de las imágenes generadas.
- Investigación en alineación de modelos auxiliares: su entrenamiento por preferencias sobre imágenes renderizadas sirve como caso de estudio de optimización de un LLM contra la métrica de un modelo generativo externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19 GB en bfloat16 (pesos de 18,8 GB más overhead de activaciones y caché KV); en cuantizaciones de 8 bits podría rondar los 10-11 GB y en 4 bits los 6-7 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en bfloat16 sin compromisos; una RTX 4090 (24 GB) es suficiente para bfloat16 en una sola GPU.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 12-16 GB como RTX 4080 o 4070 Ti Super; en 8 GB requeriría cuantización agresiva no oficial.
- Opciones de despliegue: código oficial `black-forest-labs/flux-3-image-klein` (CLI y módulo `flux3.pup`), Transformers con `device_map="auto"`, pipeline modular de Diffusers y ComfyUI mediante los templates `flux-3-image-klein-comfy`. No se documenta soporte específico de vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada; la generación está acotada a `max_new_tokens=3584` con decodificación greedy, lo que da una cota superior del coste por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein Prompt Upsampler | 9,4B | no disponible | Upsampling de prompts para FLUX 3 | Apache 2.0 | Hugging Face, integrado en pipeline oficial |
| Qwen3.5-9B (modelo base) | 9B | no disponible | LLM/VLM generalista | no disponible en la información | Hugging Face |
| Cualquier LLM con los system prompts de `system_prompts.json` | variable | variable | Upsampling de prompts genérico | según modelo | Hugging Face |

La comparación relevante es contra el propio modelo base y contra la alternativa que el autor menciona explícitamente: usar cualquier otro LLM con los system prompts incluidos en `system_prompts.json`. La ventaja del upsampler es su ajuste específico por preferencias sobre imágenes renderizadas con FLUX 3 Image Klein, algo que un LLM genérico no puede replicar. No se dispone de datos de rendimiento comparativo entre ambas opciones.

## Limitaciones y advertencias

- La salida es siempre en inglés, aunque la petición de entrada puede estar en cualquier idioma; esto puede ser un problema para productos que requieran prompts en otros idiomas.
- Los prompts están optimizados exclusivamente para FLUX 3 Image Klein; ningún otro modelo de imagen participó en el entrenamiento, por lo que su uso con otros generadores no está validado.
- El modelo no genera imágenes: es un componente auxiliar y requiere el generador FLUX 3 Image Klein para producir resultados finales.
- Riesgo de alucinación: al expandir peticiones ambiguas, el modelo añade detalles (vestuario, iluminación, composición) que el usuario no solicitó; en flujos donde la fidelidad literal importa, esto puede desviar el resultado.
- Sesgos: no se documentan evaluaciones de sesgo; al tratarse de un fine-tune de Qwen3.5-9B, hereda los sesgos del modelo base, y la fase de preferencias sobre imágenes puede reforzar estéticas dominantes en los datos de entrenamiento.
- Longitud de contexto no publicada: aunque acepta hasta 10 imágenes de referencia, se desconoce el límite exacto de tokens y cómo escala el rendimiento con muchas referencias.
- No se publican versiones cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto sin trabajo adicional.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad de los prompts generados en dominios especializados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Generador FLUX 3 Image Klein: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Código de inferencia (GitHub): https://github.com/black-forest-labs/flux-3-image-klein
- Templates de ComfyUI: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Ejemplo de prompt expandido: https://github.com/black-forest-labs/flux-3-image-klein/blob/main/examples/base/man_dog.json
