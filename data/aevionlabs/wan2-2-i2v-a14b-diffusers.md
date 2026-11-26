# aevionlabs/Wan2.2-I2V-A14B-Diffusers

## Resumen

Wan2.2-I2V-A14B es un modelo de difusión para generación de vídeo a partir de imagen (image-to-video, I2V) desarrollado por el equipo Wan (Wan-AI, Alibaba). Forma parte de la familia Wan2.2, una actualización de los modelos fundacionales de vídeo de Wan que introduce una arquitectura de mezcla de expertos (MoE) en el proceso de difusión de vídeo. Este repositorio concreto (`aevionlabs/Wan2.2-I2V-A14B-Diffusers`) es una redistribución de los pesos oficiales empaquetada para su uso con la librería Diffusers, con un total de 14.288.901.184 parámetros y un tamaño de repositorio de 126,2 GB.

El modelo resuelve el problema de animar imágenes estáticas en clips de vídeo con movimiento coherente, soportando resoluciones de 480P y 720P. La innovación principal de Wan2.2 es el uso de una arquitectura MoE que separa el proceso de eliminación de ruido en pasos temporales gestionados por expertos especializados, lo que amplía la capacidad total del modelo manteniendo el coste computacional. Según el autor, esto se traduce en una síntesis de vídeo más estable, con menos movimientos de cámara irreales y mejor soporte para escenas estilizadas diversas.

Es relevante ahora porque Wan2.2 se presenta como uno de los modelos de vídeo generativo de código abierto con mejor rendimiento de su categoría, con integración oficial en Diffusers y ComfyUI, y con pesos publicados bajo licencia Apache 2.0, lo que facilita su adopción tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo con arquitectura Mixture-of-Experts (MoE) sobre transformer de difusión |
| Parametros totales | 14.288.901.184 |
| Parametros activos | no disponible (el autor indica MoE con expertos especializados por pasos temporales, pero no desglosa parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con Diffusers, pipeline `WanImageToVideoPipeline`) |

## Arquitectura y entrenamiento

Wan2.2 introduce una arquitectura Mixture-of-Experts (MoE) en modelos de difusión de vídeo. El proceso de eliminación de ruido se divide a lo largo de los pasos temporales, asignando expertos especializados y potentes a distintas fases del proceso. Esto permite ampliar la capacidad global del modelo manteniendo el mismo coste computacional que un modelo denso equivalente. El modelo I2V-A14B está diseñado específicamente para generación de imagen a vídeo, con soporte para 480P y 720P.

En cuanto a datos de entrenamiento, el autor indica que Wan2.2 se entrenó con un conjunto de datos significativamente mayor que Wan2.1: un 65,6 % más de imágenes y un 83,2 % más de vídeos. Además, se incorporaron datos estéticos cuidadosamente curados con etiquetas detalladas de iluminación, composición, contraste y tono de color, lo que permite un control más preciso del estilo cinematográfico. No se especifican en la información disponible el número exacto de tokens, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO. La familia incluye además un VAE propietario (Wan2.2-VAE) con ratio de compresión 16×16×4 utilizado en el modelo TI2V-5B.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) con resolución de 480P y 720P.
- Generación de movimiento complejo y coherente, con especial énfasis en la estabilidad de la cámara y la reducción de movimientos irreales.
- Soporte para escenas estilizadas diversas gracias a los datos estéticos curados.
- Control de estilo cinematográfico mediante etiquetas de iluminación, composición, contraste y tono de color.
- Soporte multilingüe de prompts en inglés (en) y chino (zh).
- Integración con Diffusers mediante `WanImageToVideoPipeline`.
- Integración con ComfyUI.
- Inferencia multi-GPU mediante el código oficial del repositorio.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni visión más allá de la imagen de entrada.

## Casos de uso

- Animación de imágenes para publicidad y marketing: a partir de una fotografía de producto o un key visual, el modelo genera clips de 480P o 720P con movimiento de cámara estable, adecuado para piezas promocionales de corta duración.
- Previsualización de storyboards en producción audiovisual: animar viñetas o frames clave para validar ritmo, encuadre y movimiento antes del rodaje, aprovechando el control de composición e iluminación del modelo.
- Creación de contenido para redes sociales: convertir imágenes estáticas en vídeos verticales u horizontales con estética controlada, usando los prompts en inglés o chino para dirigir el estilo.
- Prototipado de efectos visuales (VFX): generar plates animados a partir de imágenes de referencia para pruebas de composición en pipelines de postproducción.
- Restauración y dinamización de material histórico o fotográfico: animar fotografías antiguas o ilustraciones con movimientos sutiles y realistas, apoyándose en la estabilidad de cámara del modelo MoE.
- Generación de vídeo para investigación en difusión: servir como base reproducible (licencia Apache 2.0, pesos safetensors, integración Diffusers) para experimentos académicos sobre MoE en modelos de difusión de vídeo.
- Contenido educativo y divulgativo: animar diagramas o ilustraciones científicas para explicaciones visuales, con control de estilo mediante etiquetas estéticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 126,2 GB en safetensors, lo que en precisión completa excede con holgura cualquier GPU de consumo; se requiere cuantización o paralelismo multi-GPU para su despliegue.
- GPU recomendadas: el autor menciona soporte de inferencia multi-GPU para el modelo A14B; no especifica modelos concretos de GPU para esta variante. Para el modelo hermano TI2V-5B indica que puede ejecutarse en tarjetas de consumo como la RTX 4090, pero no se confirma lo mismo para el I2V-A14B.
- ¿Cabe en GPU de consumo? No confirmado para el I2V-A14B en la información disponible; el tamaño de pesos (más de 14.000 millones de parámetros) sugiere que no cabe en una sola GPU de consumo sin cuantización agresiva.
- Opciones de despliegue: Diffusers (`WanImageToVideoPipeline`), ComfyUI, código oficial del repositorio Wan2.2 con inferencia multi-GPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo en estos formatos).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.2-I2V-A14B (este) | 14.288.901.184 | 480P y 720P, image-to-video | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Wan2.2-T2V-A14B | no disponible en la información | 480P y 720P, text-to-video | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.2-TI2V-5B | no disponible en la información | 720P a 24 fps, texto e imagen a vídeo | Apache 2.0 | Hugging Face, ModelScope, ejecutable en RTX 4090 según el autor |
| Wan2.1 (familia previa) | no disponible en la información | no disponible | no disponible | Referenciado como base de la comparación de datos de entrenamiento |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Este repositorio es una redistribución de terceros (`aevionlabs`) de los pesos oficiales; conviene verificar la integridad y procedencia frente al repositorio oficial `Wan-AI/Wan2.2-I2V-A14B-Diffusers`.
- El modelo está entrenado principalmente para prompts en inglés y chino; el rendimiento con otros idiomas no está garantizado.
- No se documentan sesgos específicos, pero como modelo generativo entrenado con datos a gran escala puede reproducir estereotipos presentes en los datos de entrenamiento.
- Riesgo de alucinación visual: puede generar movimientos o elementos inconsistentes con la imagen de entrada, especialmente en escenas complejas o con oclusión.
- El tamaño del repositorio (126,2 GB) y los 14.288 millones de parámetros implican requisitos de almacenamiento y cómputo elevados; el despliegue en producción requiere planificación de infraestructura multi-GPU.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo oficial y las condiciones de los datos de entrenamiento no detalladas en la información disponible.
- No se especifican limitaciones de longitud de contexto ni número máximo de frames por generación en la información proporcionada.
- El pipeline declarado es `image-to-video`; no se confirma en esta información el soporte de otras modalidades en esta variante concreta.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/aevionlabs/Wan2.2-I2V-A14B-Diffusers
- Repositorio oficial I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Repositorio oficial I2V-A14B-Diffusers: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Repositorio oficial T2V-A14B-Diffusers: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers
- Repositorio oficial TI2V-5B-Diffusers: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Organización Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- GitHub oficial: https://github.com/Wan-Video/Wan2.2
- Informe técnico (arXiv): https://arxiv.org/abs/2503.20314
- Blog oficial: https://wan.video/welcome
- Sitio web: https://wan.video
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Documentación ComfyUI (EN): https://docs.comfy.org/tutorials/video/wan/wan2_2
- Documentación ComfyUI (CN): https://docs.comfy.org/zh-CN/tutorials/video/wan/wan2_2
- Discord: https://discord.gg/AKNgpMK4Yj
