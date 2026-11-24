# Poij-cv1/Wan2.2-I2V-A14B-Diffusers

## Resumen

Wan2.2-I2V-A14B es un modelo de difusión para generación de vídeo a partir de una imagen (image-to-video, I2V) desarrollado por el equipo Wan del grupo Alibaba. Forma parte de la familia Wan2.2, una actualización mayor de los modelos fundacionales de vídeo de Wan, y se distribuye en formato compatible con la librería Diffusers. El repositorio aquí referenciado es un espejo publicado por el usuario Poij-cv1 bajo licencia Apache 2.0.

El modelo emplea una arquitectura de mezcla de expertos (MoE) aplicada a modelos de difusión de vídeo: el proceso de eliminación de ruido se reparte entre expertos especializados según el paso temporal, lo que amplía la capacidad total del modelo manteniendo el coste computacional de un modelo denso. El checkpoint contiene 14.288.901.184 parámetros en safetensors y el repositorio ocupa 126,2 GB.

Es relevante porque combina generación de vídeo con control estético cinematográfico (etiquetas de iluminación, composición, contraste y tono de color), soporte de resoluciones 480P y 720P, y una mejora sustancial en la generación de movimiento complejo respecto a Wan2.1, con un 65,6 % más de imágenes y un 83,2 % más de vídeos en el entrenamiento. Su integración en Diffusers y ComfyUI facilita su adopción en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo con arquitectura Mixture-of-Experts (MoE) por pasos temporales |
| Parametros totales | 14.288.901.184 |
| Parametros activos | no disponible (el autor no desglosa el número de parámetros activos por experto) |
| Longitud de contexto | no disponible (modelo de difusión, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye safetensors en precisión original) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con Diffusers) |

## Arquitectura y entrenamiento

Wan2.2-I2V-A14B es un modelo de difusión para vídeo que introduce una arquitectura de mezcla de expertos (MoE) en el dominio de la difusión de vídeo. La idea central es separar el proceso de eliminación de ruido a lo largo de los pasos temporales asignando modelos expertos especializados a distintos tramos del proceso, de modo que la capacidad global del modelo crece sin incrementar el coste computacional de inferencia respecto a un modelo denso equivalente. El modelo está diseñado para image-to-video, aceptando una imagen de entrada y generando una secuencia de vídeo a 480P o 720P.

En cuanto a los datos de entrenamiento, el autor indica que Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1, lo que mejora la generalización en movimiento, semántica y estética. Además, se incorporaron datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color, lo que permite un control más preciso del estilo cinematográfico. No se especifican en la información disponible el número exacto de tokens de vídeo, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de una imagen (image-to-video) en resoluciones 480P y 720P.
- Generación de movimiento complejo con mayor estabilidad que Wan2.1, con reducción de movimientos de cámara irreales.
- Control estético cinematográfico mediante etiquetas de iluminación, composición, contraste y tono de color.
- Soporte de escenas estilizadas diversas (estilos visuales variados).
- Integración nativa con Diffusers mediante `WanImageToVideoPipeline`.
- Integración con ComfyUI para flujos de trabajo visuales.
- Soporte de inferencia multi-GPU en el código de referencia del proyecto.
- Idiomas de prompting: inglés y chino.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio o modo de razonamiento explícito, ya que se trata de un modelo generativo de vídeo y no de un modelo de lenguaje.

## Casos de uso

- Previsualización de storyboards: a partir de un fotograma clave o ilustración, el modelo genera un clip de vídeo que permite validar ritmo, movimiento y composición antes de producir la escena final, gracias al control estético por etiquetas.
- Publicidad y marketing: generación de vídeos cortos a 720P a partir de imágenes de producto, con control de iluminación y tono de color para alinear el resultado con la identidad de marca.
- Animación de ilustraciones y arte conceptual: conversión de ilustraciones estáticas en secuencias animadas con movimiento complejo, aprovechando la mejora de generalización en semántica y movimiento de Wan2.2.
- Creación de contenido para redes sociales: producción rápida de clips verticales u horizontales a 480P para prototipado y a 720P para publicación, usando la integración con Diffusers o ComfyUI.
- Efectos visuales y postproducción: generación de placas de movimiento o extensiones de escena a partir de un frame, con control de cámara más estable que en la versión anterior.
- Investigación en generación de vídeo: uso del checkpoint MoE como base para experimentos de difusión con mezcla de expertos, fine-tuning o evaluación comparativa frente a modelos densos.
- Docencia y divulgación: demostraciones de image-to-video en entornos académicos con GPUs de gama alta, apoyadas en el código multi-GPU del repositorio oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona de forma cualitativa un rendimiento "TOP" entre modelos de código abierto y cerrados, pero no incluye tablas con métricas numéricas (FVD, CLIP score, VBench u otras) que puedan citarse.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 14,29 mil millones de parámetros en safetensors, los pesos en fp16 rondan los 28,6 GB, por lo que se requiere al menos una GPU con 32 GB o más para cargar el modelo completo sin cuantización.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) y configuraciones multi-GPU. El repositorio oficial incluye código de inferencia multi-GPU para el modelo A14B.
- GPU de consumo: el modelo I2V-A14B no está pensado para GPUs de consumo de 24 GB en precisión completa; el autor sí indica que el modelo TI2V-5B de la familia puede ejecutarse en una RTX 4090. Para el A14B sería necesaria cuantización, no documentada en este repositorio.
- Opciones de despliegue: Diffusers (`WanImageToVideoPipeline`), ComfyUI y el código de referencia del repositorio GitHub de Wan2.2. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de vídeo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto/duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-I2V-A14B (este) | 14,29 B (MoE) | 480P y 720P | no disponible | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.2-TI2V-5B | 5 B | 720P a 24 fps | no disponible | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.2-T2V-A14B | 14 B (MoE) | 480P y 720P | no disponible | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.1 (versión anterior) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face, GitHub |

La comparativa se limita a la propia familia Wan2.2 y a Wan2.1, ya que la información proporcionada no incluye datos de modelos competidores de otros desarrolladores.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado con datos web a gran escala, es probable que herede sesgos de representación, pero no hay evidencia publicada en esta ficha.
- Riesgo de alucinación visual: como modelo generativo, puede producir movimientos, físicas o detalles inconsistentes con la imagen de entrada, especialmente en escenas con oclusiones complejas o múltiples sujetos.
- Limitaciones de idioma: el prompting está soportado en inglés y chino; el rendimiento con otros idiomas no está documentado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del proyecto original Wan y las de los datasets de entrenamiento, no detalladas aquí.
- Caveat de producción: el repositorio referenciado es un espejo de terceros (Poij-cv1) con 0 descargas y 0 likes; para producción se recomienda usar el repositorio oficial `Wan-AI/Wan2.2-I2V-A14B-Diffusers`.
- Requisitos de hardware elevados: el tamaño del repo (126,2 GB) y los 14,29 B de parámetros implican infraestructura de GPU de gama alta o multi-GPU.
- No se documentan mecanismos de seguridad, filtros de contenido ni limitaciones de duración máxima del vídeo generado en la información disponible.

## Enlaces

- Repositorio en Hugging Face (espejo): https://huggingface.co/Poij-cv1/Wan2.2-I2V-A14B-Diffusers
- Repositorio oficial en Hugging Face: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Organización Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- Repositorio GitHub: https://github.com/Wan-Video/Wan2.2
- Informe técnico (arXiv): https://arxiv.org/abs/2503.20314
- Sitio web oficial: https://wan.video
- Blog: https://wan.video/welcome
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Documentación de ComfyUI para Wan2.2: https://docs.comfy.org/tutorials/video/wan/wan2_2
- Discord: https://discord.gg/AKNgpMK4Yj
