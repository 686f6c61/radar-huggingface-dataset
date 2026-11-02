# N3M3SIS666/Wan2.2-TI2V-5B

## Resumen

Wan2.2-TI2V-5B es un modelo de difusión para generación de vídeo a partir de texto e imagen (text-image-to-video) desarrollado por el equipo Wan (Wan-AI, vinculado a Alibaba). Forma parte de la familia Wan2.2, una actualización de los modelos fundacionales de vídeo Wan2.1, e incorpora una arquitectura Mixture-of-Experts (MoE) en el proceso de difusión, además de un VAE de alta compresión con ratio 16×16×4. Esta variante concreta, de 5B parámetros, unifica generación texto-a-vídeo e imagen-a-vídeo en un único modelo.

El modelo destaca por generar vídeo a 720P y 24 FPS en una sola GPU de consumo, como una RTX 4090, lo que lo sitúa entre las opciones más rápidas de su categoría para esa resolución y tasa de fotogramas. Está pensado tanto para aplicaciones industriales como para investigación académica, y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial.

La relevancia actual radica en que combina dos tareas (T2V e I2V) en un solo checkpoint de tamaño moderado, con un VAE de compresión agresiva que reduce los requisitos de memoria, y con integración ya disponible en Diffusers y ComfyUI. El repositorio de esta ficha es un espejo publicado por el usuario N3M3SIS666 del modelo original Wan-AI/Wan2.2-TI2V-5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo con arquitectura MoE (Mixture-of-Experts) y VAE de alta compresión (ratio 16×16×4) |
| Parametros totales | 5B (según denominación del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusión, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers / wan2.2) |

## Arquitectura y entrenamiento

Wan2.2 introduce una arquitectura Mixture-of-Experts en el proceso de difusión de vídeo: el proceso de eliminación de ruido (denoising) se separa a lo largo de los timesteps con expertos especializados, lo que amplía la capacidad total del modelo manteniendo el mismo coste computacional. La variante TI2V-5B emplea además un VAE propio de Wan2.2 con un ratio de compresión de 16×16×4, que reduce drásticamente la carga de memoria y permite la generación a 720P en hardware de consumo.

En cuanto a los datos de entrenamiento, la model card indica que Wan2.2 se entrenó con un volumen significativamente mayor que Wan2.1: un +65,6 % más de imágenes y un +83,2 % más de vídeos. También se incorporaron datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color, lo que permite un control más preciso del estilo cinematográfico. No se detalla en la información disponible el número exacto de tokens, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) a 720P y 24 FPS.
- Generación de vídeo a partir de imagen (image-to-video) a 720P y 24 FPS.
- Generación unificada texto-imagen-a-vídeo (TI2V) en un único modelo.
- Control de estética cinematográfica mediante etiquetas de iluminación, composición, contraste y tono de color.
- Generación de movimiento complejo, con mejor generalización en movimiento, semántica y estética respecto a Wan2.1.
- Soporte multilingüe de prompts en inglés y chino.
- Integración con Diffusers y ComfyUI.
- Inferencia multi-GPU disponible en el código oficial.

## Casos de uso

- Generación de vídeo publicitario: el modelo produce clips a 720P y 24 FPS a partir de prompts descriptivos, adecuado para prototipado rápido de piezas creativas con control de iluminación y tono.
- Animación de imágenes fijas: la capacidad image-to-video permite dar movimiento a fotografías o ilustraciones para crear contenido para redes sociales o presentaciones.
- Previsualización de storyboards: estudios de cine y animación pueden convertir guiones y bocetos en vídeo preliminar para validar secuencias antes de producción.
- Generación de contenido para e-commerce: crear vídeos de producto animados a partir de una imagen estática del artículo, con estilo controlable.
- Investigación en generación de vídeo: el modelo, con licencia Apache 2.0 y disponible en Diffusers, sirve como base para experimentos académicos sobre difusión y MoE.
- Creación de material educativo: generar animaciones explicativas a partir de texto o diagramas para cursos y tutoriales.
- Integración en pipelines creativos con ComfyUI: automatizar la generación de vídeo dentro de flujos de trabajo de diseño gráfico y postproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un rendimiento "TOP" entre modelos de código abierto y cerrado, pero no incluye cifras concretas de métricas como FVD, CLIP score u otras.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en una sola GPU de consumo, como una RTX 4090, según la model card.
- VRAM estimada: no disponible de forma explícita; la compresión del VAE (16×16×4) está pensada para reducir los requisitos y permitir 720P en hardware de consumo.
- GPU recomendadas: RTX 4090 (consumer); para el resto de la familia Wan2.2 se menciona inferencia multi-GPU, aunque para esta variante de 5B no se detallan configuraciones.
- Cabe en GPU de consumo: sí, según el autor, en una 4090.
- Opciones de despliegue: Diffusers, ComfyUI, repositorio oficial Wan2.2 (con torch >= 2.4.0), descarga vía huggingface-cli o modelscope.
- Latencia y throughput: no disponible; se describe como uno de los modelos 720P@24fps más rápidos disponibles, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / FPS | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-TI2V-5B | 5B | 720P / 24 FPS | T2V + I2V | Apache 2.0 | HuggingFace, ModelScope |
| Wan2.2-T2V-A14B | 14B (MoE, A14B) | 480P y 720P | T2V | Apache 2.0 | HuggingFace, ModelScope |
| Wan2.2-I2V-A14B | 14B (MoE, A14B) | 480P y 720P | I2V | Apache 2.0 | HuggingFace, ModelScope |

La comparativa se limita a la propia familia Wan2.2, ya que la información disponible no incluye datos de rendimiento de modelos de terceros que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como modelo entrenado con datos a gran escala, puede heredar sesgos de esos datos.
- Riesgo de alucinación visual: como modelo generativo de difusión, puede producir contenido incoherente o artefactos, especialmente en movimientos complejos.
- Idiomas: los prompts están soportados en inglés y chino; no se garantiza un rendimiento óptimo en otros idiomas como el castellano.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del repositorio espejo y del modelo original.
- Este repositorio concreto (N3M3SIS666/Wan2.2-TI2V-5B) es un espejo con 0 descargas y 0 likes; para producción se recomienda usar el repositorio oficial Wan-AI/Wan2.2-TI2V-5B.
- Requiere torch >= 2.4.0 y dependencias específicas del repositorio oficial.
- No se dispone de información sobre cuantizaciones oficiales ni sobre límites de duración de vídeo generado.

## Enlaces

- Repositorio HuggingFace (espejo): https://huggingface.co/N3M3SIS666/Wan2.2-TI2V-5B
- Repositorio oficial HuggingFace: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- GitHub oficial: https://github.com/Wan-Video/Wan2.2
- Organización en HuggingFace: https://huggingface.co/Wan-AI/
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Informe técnico (arXiv): https://arxiv.org/abs/2503.20314
- Blog oficial: https://wan.video/welcome
- Sitio web: https://wan.video
- Discord: https://discord.gg/AKNgpMK4Yj
