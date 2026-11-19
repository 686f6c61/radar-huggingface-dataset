# Renedffd/Wan2.2-TI2V-5B

## Resumen

Wan2.2-TI2V-5B es un modelo de difusión para generación de vídeo a partir de texto e imagen (text-to-video e image-to-video) desarrollado por el equipo Wan del grupo Alibaba. Forma parte de la familia Wan2.2, una actualización de los modelos fundacionales Wan2.1, y se distribuye bajo licencia Apache 2.0. El modelo resuelve el problema de generar vídeo de alta definición (720P a 24 fps) en hardware de consumo, algo que hasta ahora requería clústeres multi-GPU.

La innovación principal es su VAE de alta compresión (ratio 16×16×4), que reduce drásticamente el coste computacional del proceso de difusión y permite ejecutar el modelo en una única GPU de consumo como la RTX 4090. Con 5.000 millones de parámetros, es la variante compacta de la familia, frente a las versiones A14B y 14B basadas en arquitectura MoE. Soporta tanto generación desde texto como desde imagen, con resolución de 720P y 24 fps, lo que lo sitúa entre los modelos de vídeo abiertos más rápidos en esa combinación de resolución y tasa de fotogramas.

El modelo se publicó junto con el resto de la familia Wan2.2 en julio de 2025 e incluye integración con ComfyUI y Diffusers, además de código de inferencia multi-GPU. Su relevancia actual radica en que democratiza la generación de vídeo en 720P para investigadores y desarrolladores sin acceso a infraestructura de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (video diffusion) con VAE de compresión 16×16×4; la familia Wan2.2 emplea MoE en las variantes mayores, no confirmado para esta variante de 5B |
| Parametros totales | 5B |
| Parametros activos | no disponible (no confirmado que esta variante sea MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería diffusers / wan2.2) |

## Arquitectura y entrenamiento

Wan2.2-TI2V-5B es un modelo de difusión para vídeo construido sobre un VAE con ratio de compresión 16×16×4, diseñado específicamente para reducir el coste computacional manteniendo la calidad en 720P. La familia Wan2.2 introduce una arquitectura Mixture-of-Experts (MoE) en los modelos de difusión de vídeo, separando el proceso de denoising por pasos temporales con expertos especializados; esta innovación se aplica a las variantes A14B y 14B, mientras que la información disponible no confirma que la variante de 5B use MoE. El modelo soporta tanto text-to-video como image-to-video en un único checkpoint.

En cuanto a datos de entrenamiento, la model card indica que Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1, e incorpora datos estéticos curados con etiquetas detalladas de iluminación, composición, contraste y tono de color para permitir un control más preciso del estilo cinematográfico. No se especifica el número exacto de tokens ni la composición detallada del dataset, ni si se emplearon técnicas de RLHF o DPO (poco habituales en modelos de difusión). Tampoco se detallan innovaciones como decodificación especulativa o atención lineal para esta variante.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) en resolución 720P y 24 fps.
- Generación de vídeo a partir de una imagen de entrada (image-to-video) en 720P y 24 fps.
- Generación de movimiento complejo, con mejor generalización en movimientos, semántica y estética respecto a Wan2.1.
- Control de estética cinematográfica mediante etiquetas de iluminación, composición, contraste y tono de color.
- Soporte bilingüe para prompts en inglés y chino.
- Ejecución en una única GPU de consumo (RTX 4090), lo que habilita uso local.
- Integración con ComfyUI y Diffusers para flujos de trabajo de generación.
- Código de inferencia multi-GPU disponible en el repositorio oficial.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking, por tratarse de un modelo generativo de vídeo y no de un LLM.

## Casos de uso

- Prototipado rápido de vídeo publicitario: un equipo de marketing puede generar clips de 720P a 24 fps desde un prompt de texto en una sola RTX 4090, sin depender de servicios en la nube, para validar conceptos creativos antes de la producción final.
- Animación de imágenes fijas para redes sociales: a partir de una fotografía o ilustración, el modelo genera una secuencia de vídeo coherente (image-to-video), útil para crear contenido animado a partir de material estático existente.
- Previsualización de storyboards cinematográficos: gracias a las etiquetas de iluminación, composición y tono de color, el modelo permite generar previsualizaciones con estilos ajustables que aproximan la fotografía final de una escena.
- Investigación académica en generación de vídeo: al ser Apache 2.0 y ejecutable en hardware de consumo, sirve como base para experimentos de difusión de vídeo, ablaciones sobre VAE y comparativas de arquitecturas sin necesidad de clústeres.
- Generación de material para videojuegos y entornos simulados: el modelo puede producir clips de movimiento y transiciones a 720P que se integren como texturas animadas o vídeos de fondo en motores de juego.
- Creación de contenido educativo y divulgativo: generación de secuencias ilustrativas a partir de descripciones textuales en inglés o chino, adecuada para vídeos explicativos donde no se dispone de metraje real.
- Automatización de pipelines de contenido en ComfyUI: al integrarse con ComfyUI y Diffusers, el modelo puede encadenarse con otros nodos (upscaling, interpolación, edición) para producir lotes de vídeo de forma automatizada en un flujo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que Wan2.2 alcanza "TOP performance among all open-sourced and closed-sourced models" y que el modelo de 5B es "one of the fastest 720P@24fps models currently available", pero no se proporcionan cifras concretas de métricas como FVD, CLIP score, VBench ni comparativas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 34,2 GB, lo que da una referencia del tamaño de los pesos, pero no se detalla el pico de VRAM durante la generación.
- GPU recomendadas: la model card indica que el modelo puede ejecutarse en una única GPU de consumo como la RTX 4090; no se especifican otras GPU (A100, H100) ni configuraciones multi-GPU para esta variante concreta.
- ¿Cabe en GPU de consumo? Sí, según el autor, en una RTX 4090.
- Opciones de despliegue: código de inferencia oficial del repositorio Wan2.2 (requiere torch >= 2.4.0), integración con ComfyUI y con Diffusers.
- Latencia y throughput estimados: no disponibles; el autor afirma que es uno de los modelos 720P@24fps más rápidos, pero sin cifras de tiempo por clip ni frames por segundo de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / FPS | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-TI2V-5B | 5B | 720P / 24 fps | no aplica | Apache 2.0 | Hugging Face, ModelScope, ComfyUI, Diffusers |
| Wan2.2-T2V-A14B | 14B (MoE) | 480P y 720P | no aplica | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.2-I2V-A14B | 14B (MoE) | 480P y 720P | no aplica | Apache 2.0 | Hugging Face, ModelScope |
| Wan2.1 | no disponible | no disponible | no aplica | no disponible en la informacion | GitHub Wan2.1 |

La comparativa se limita a la propia familia Wan2.2, ya que la información proporcionada no incluye datos de modelos de vídeo de otros desarrolladores (por ejemplo, de código abierto o cerrados) que permitan una comparación rigurosa de parámetros, resolución, rendimiento y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos web a gran escala, es previsible que herede sesgos de representación, pero no se detallan.
- Riesgo de alucinación: no aplica en el sentido de texto factual, pero el modelo puede generar contenido visual incoherente o no fiel al prompt, especialmente en movimientos complejos o escenas con múltiples sujetos.
- Limitaciones de idioma: solo se declaran inglés y chino; no hay soporte confirmado para castellano ni otros idiomas en los prompts.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se indican restricciones adicionales en la información disponible.
- Caveats para producción: no se especifican límites de longitud de vídeo, número máximo de fotogramas ni resolución distinta de 720P; la ausencia de benchmarks publicados impide validar afirmaciones de rendimiento frente a competidores.
- El repositorio es una réplica de comunidad (autor Renedffd) del modelo oficial Wan-AI/Wan2.2-TI2V-5B, con 0 descargas y 0 likes; para producción conviene usar el repositorio oficial.
- No se documentan requisitos exactos de VRAM ni latencias, lo que dificulta el dimensionamiento de infraestructura.

## Enlaces

- Hugging Face (réplica de comunidad): https://huggingface.co/Renedffd/Wan2.2-TI2V-5B
- Hugging Face (modelo oficial): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- GitHub oficial: https://github.com/Wan-Video/Wan2.2
- Informe técnico (arXiv): https://arxiv.org/abs/2503.20314
- Organización Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Blog oficial: https://wan.video/welcome
- Sitio web: https://wan.video
- Discord: https://discord.gg/AKNgpMK4Yj
