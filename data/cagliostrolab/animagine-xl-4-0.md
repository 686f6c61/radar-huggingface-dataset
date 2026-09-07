# cagliostrolab/animagine-xl-4.0

## Resumen

Animagine XL 4.0 es un modelo de generación de imágenes de texto a imagen, especializado en estilo anime, desarrollado por Cagliostro Research Lab. Se trata de un ajuste fino (finetune) del modelo Stable Diffusion XL 1.0 de Stability AI, con el que comparte arquitectura y número de parámetros (2.567.463.684). El modelo ha sido entrenado con un conjunto de datos de 8,4 millones de imágenes anime de diversas fuentes, con fecha de corte de conocimiento el 7 de enero de 2025, y un coste de aproximadamente 2.650 horas de GPU. Su principal aportación es la generación de ilustraciones anime de alta calidad, con un enfoque en el orden de etiquetas (tag ordering) para controlar la identidad y el estilo de los personajes. La versión 4.0 Opt, añadida en febrero de 2025, introduce mejoras en estabilidad, anatomía, reducción de ruido y saturación de color. El modelo está disponible en Hugging Face bajo la licencia CreativeML Open RAIL++-M y es compatible con la librería diffusers, ComfyUI y Stable Diffusion WebUI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (SDXL) base 1.0 finetuned |
| Parametros totales | 2.567.463.684 (2,57B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de difusión, no aplica contexto de tokens) |
| Tipos de cuantizacion | FP16 (pesos precargados en FP16) |
| Idiomas soportados | Inglés |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | Safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

Animagine XL 4.0 parte de la arquitectura de Stable Diffusion XL 1.0, un modelo de difusión latente con dos encoders de texto (CLIP ViT-L y OpenCLIP ViT-bigG) y un UNet con atención cruzada. El proceso de entrenamiento consistió en un ajuste fino sobre 8,4 millones de imágenes anime, utilizando el método de ordenación de etiquetas (tag ordering), que consiste en estructurar el prompt en un orden específico: primero el número y género del personaje, luego el nombre del personaje, la serie, la valoración, y finalmente el resto de características y las etiquetas de calidad. El entrenamiento requirió aproximadamente 2.650 horas de GPU. La versión 4.0 Opt se refinó con un conjunto de datos adicional para mejorar la estabilidad de las salidas, la precisión anatómica, la reducción de ruido y la saturación del color.

## Capacidades

- Generación de imágenes de texto a imagen con temática anime, a partir de prompts en inglés.
- Control de identidad y estilo mediante el orden de etiquetas (tag ordering).
- Soporte de prompts largos y ponderados mediante el pipeline personalizado lpw_stable_diffusion_xl.
- Generación de personajes (1girl, 1boy, 1other), fondos y escenas con un estilo anime consistente.
- La versión Opt añade mayor estabilidad, anatomía más precisa, menos ruido y colores más saturados.
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de voz o vídeo, al tratarse de un modelo de difusión para imagen.

## Casos de uso

- Ilustración de novelas visuales y videojuegos: el modelo permite generar personajes y escenarios anime de alta calidad a partir de prompts estructurados, lo que acelera la creación de assets para juegos de estilo anime.
- Creación de personajes para animación y cómics: gracias al control de identidad mediante el orden de etiquetas, los artistas pueden generar múltiples variaciones de un mismo personaje manteniendo la coherencia.
- Diseño de avatares para redes sociales y foros: con prompts sencillos se pueden obtener avatares personalizados con estética anime, aprovechando las etiquetas de calidad recomendadas.
- Generación de ilustraciones para campañas de marketing o contenido de marca: el modelo puede producir imágenes de estilo anime para publicidad, siempre que se respete la licencia openrail++.
- Prototipado rápido de conceptos para artistas e ilustradores: permite explorar ideas de composición, paleta de colores y poses antes de realizar la ilustración final.
- Generación de fondos y escenarios para producción audiovisual: el modelo puede crear entornos anime detallados para vídeos, presentaciones o animaciones.
- Contenido para juegos de rol de mesa: los jugadores y directores de juego pueden generar retratos de personajes o escenas para sus campañas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo está en FP16 y el peso de los parámetros ocupa aproximadamente 5,1 GB, por lo que se necesitará al menos esa cantidad de VRAM, más memoria para activaciones.
- GPU recomendadas: no disponible. Al ser un finetune de SDXL, se espera que funcione en GPUs consumer con 8 GB o más de VRAM, pero no se ha publicado un requisito oficial.
- Compatibilidad con GPU consumer: no disponible. No hay datos específicos en la información proporcionada.
- Opciones de despliegue: diffusers (StableDiffusionXLPipeline), ComfyUI, Stable Diffusion WebUI y Hugging Face Spaces.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

En la información disponible no se aportan benchmarks ni datos comparativos con otros modelos. Se conoce la existencia de versiones anteriores de la misma serie, como Animagine XL 3.1, pero no se dispone de datos suficientes para una comparativa técnica rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: la información disponible no menciona sesgos específicos. No obstante, al estar entrenado con imágenes anime, el modelo puede reflejar sesgos estéticos y de representación propios de ese dominio.
- Riesgo de alucinación: como ocurre con otros modelos de difusión, puede generar detalles incorrectos, anatomías defectuosas o artefactos. La versión Opt reduce estos problemas, pero no los elimina por completo.
- Limitaciones de contexto o idioma: el modelo solo soporta prompts en inglés. No se ha documentado soporte para otros idiomas.
- Restricciones de licencia: la licencia CreativeML Open RAIL++-M permite el uso comercial, pero incluye restricciones sobre el uso del modelo para fines ilegales o dañinos. Es necesario revisar el texto completo de la licencia antes de su uso en producción.
- Caveat para producción: se recomienda utilizar el prompt negativo proporcionado y los ajustes óptimos (CFG 4-7, 25-28 pasos, sampler Euler a) para obtener resultados consistentes. La generación de imágenes puede requerir moderación de contenido en entornos públicos.

## Enlaces

- Hugging Face: https://huggingface.co/cagliostrolab/animagine-xl-4.0
- Espacio de demostración en Hugging Face: https://huggingface.co/spaces/cagliostrolab/animagine-xl-4.0
- GitHub de Cagliostro Research Lab: https://github.com/cagliostrolab
- Colección Animagine XL en Hugging Face: https://huggingface.co/collections/Linaqruf/animagine-xl-669888c0add5adaf09754aca
- Stable Diffusion XL 1.0 (modelo base): https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Stable Diffusion WebUI: https://github.com/AUTOMATIC1111/stable-diffusion-webui
