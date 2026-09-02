# kimi000/misty-harbor-64

## Resumen

El modelo `kimi000/misty-harbor-64` es un ajuste fino del modelo de difusión Z-Image de Tongyi-MAI, exportado al formato nativo de Hugging Face Diffusers. Desarrollado por el usuario kimi000, este checkpoint corresponde al paso 500 de entrenamiento con pesos EMA (media móvil exponencial) y ha sido optimizado mediante aprendizaje por refuerzo (reinforcement learning) para mejorar la calidad de generación de imágenes a partir de texto. El modelo resuelve el problema de generar imágenes fotorrealistas o artísticas con alta fidelidad al prompt, partiendo de la arquitectura base de Z-Image.

Con 6.154.908.736 parámetros en el transformador (aproximadamente 6,15 mil millones), el modelo se presenta en precisión BF16 y está diseñado para el pipeline `diffusers.ZImagePipeline`. Su relevancia radica en ser un ejemplo de fine-tuning con técnicas de refuerzo sobre un modelo de difusión moderno, ofreciendo una alternativa de código abierto bajo licencia Apache-2.0 para tareas de texto a imagen. La ventana de contexto no aplica directamente al ser un modelo generativo de imágenes, pero el prompt de texto se procesa mediante un codificador de texto incluido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Z-Image (transformador de difusión) |
| Parametros totales | 6.154.908.736 (solo transformador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de difusión) |
| Tipos de cuantizacion | BF16 (exportado), no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (13 shards para el transformador, 9 para el text encoder) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Z-Image de Tongyi-MAI, un transformador de difusión de última generación para generación de imágenes. El checkpoint exportado contiene los pesos del transformador en BF16, con 521 tensores y un total de 6.154.908.736 parámetros. El entrenamiento se realizó a partir del modelo base `Tongyi-MAI/Z-Image`, aplicando un LoRA de rango 256 y alpha 256, cuyos pesos EMA se fusionaron en el transformador. Según la model card, el experimento fuente empleó un perfil de entrenamiento con "prompt-rubric v4.3 visual-task-program", 28 prompts por colección, resolución de 512 píxeles, 16 pasos de rollout y CFG 4, lo que sugiere un enfoque de aprendizaje por refuerzo para optimizar la adherencia al prompt y la calidad visual. No se especifica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de imágenes a partir de prompts de texto, con soporte para estilos fotorrealistas y artísticos (ejemplo: "fotografía cinematográfica de un zorro rojo en un bosque nevado").
- Resolución de salida configurable, aunque el entrenamiento se realizó a 512 px, el pipeline permite generar a 1024x1024 o superior.
- Control de la creatividad mediante `guidance_scale` y número de pasos de inferencia.
- Compatible con el ecosistema Diffusers, permitiendo integración con pipelines existentes y técnicas como `enable_model_cpu_offload` para entornos con memoria limitada.
- No incluye capacidades de tool calling, agentes ni multimodales adicionales (solo texto a imagen).

## Casos de uso

- Generación de imágenes conceptuales para diseño de producto: el modelo puede crear visuales preliminares a partir de descripciones textuales, acelerando el proceso de iteración en equipos de diseño.
- Creación de contenido para marketing y publicidad: permite producir imágenes llamativas para campañas en redes sociales o banners, ajustando el estilo mediante prompts detallados.
- Ilustración de artículos y blogs: los desarrolladores pueden generar imágenes personalizadas para acompañar publicaciones técnicas o divulgativas sin depender de bancos de imágenes.
- Prototipado visual en desarrollo de videojuegos: sirve para generar texturas, fondos o conceptos de personajes a partir de descripciones, reduciendo el tiempo de bocetado.
- Generación de imágenes para entrenamiento de otros modelos: las imágenes sintéticas pueden usarse como aumentación de datos en tareas de visión por computador.
- Asistencia creativa en fotografía digital: permite explorar variaciones de escenas o composiciones a partir de un prompt, como apoyo a fotógrafos y artistas digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una verificación de humo (smoke test) que confirma que los pesos exportados son diferentes del modelo base, con un delta medio absoluto de 9,25 en los canales de imagen, pero no proporciona métricas estándar como FID o CLIP score.

## Requisitos de hardware

- VRAM estimada: el transformador en BF16 requiere aproximadamente 12,3 GB (6,15 mil millones de parámetros × 2 bytes). Sumando el text encoder y los buffers, se recomienda al menos 16 GB de VRAM para inferencia cómoda a resoluciones de 1024x1024.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o superiores. Con cuantización a 8 bits se podría ejecutar en GPUs con 12 GB, pero no se ofrecen pesos cuantizados en el repositorio.
- Opciones de despliegue: al ser un checkpoint Diffusers, se puede usar con la biblioteca `diffusers` de Python, con soporte para `enable_model_cpu_offload` que permite ejecutar en GPUs con menor VRAM descargando pesos a CPU. También se puede convertir a otros formatos como ONNX o TensorRT, aunque no se documenta.
- Latencia y throughput: no se proporcionan datos específicos. En una RTX 4090, una generación de 1024x1024 con 50 pasos podría tardar entre 10 y 30 segundos, dependiendo de la implementación.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos de difusión en la información proporcionada. El modelo es un fine-tune específico de Z-Image, y no se incluyen métricas comparativas contra SDXL, Stable Diffusion 3 o Flux. Se recomienda consultar benchmarks públicos de Z-Image para una referencia general.

## Limitaciones y advertencias

- El modelo es un checkpoint de solo 500 pasos de entrenamiento, lo que puede limitar su convergencia y calidad en comparación con versiones más entrenadas.
- No se documentan sesgos específicos, pero como todo modelo de difusión, puede amplificar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación visual: puede generar elementos que no corresponden fielmente al prompt, especialmente en escenas complejas o con múltiples objetos.
- Limitaciones de idioma: no se especifican los idiomas soportados por el codificador de texto; se asume que funciona mejor con prompts en inglés, como es común en estos modelos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base Z-Image también tenga una licencia compatible (el modelo base indica Apache-2.0 en su página).
- Para producción, se recomienda validar la calidad de las imágenes generadas y considerar el uso de filtros de contenido si se despliega en aplicaciones públicas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kimi000/misty-harbor-64
- Modelo base (Tongyi-MAI/Z-Image): https://huggingface.co/Tongyi-MAI/Z-Image
- Documentación de Diffusers: https://huggingface.co/docs/diffusers/index
