# ModelMixAI/modelmix-starter-pack

## Resumen

ModelMix Starter Pack es un conjunto de dos adaptadores LoRA para Stable Diffusion XL (SDXL) orientados a la generación de personajes consistentes. Lo desarrolla ModelMixAI, un creador independiente que comercializa un catálogo de LoRAs de caras, cuerpos, acompañantes y localizaciones bajo un modelo de negocio de pago por pieza. Este paquete gratuito incluye exactamente dos de esas piezas —una cara y un cuerpo— para que el usuario pueda probar el sistema de mezcla y combinación antes de comprar el catálogo completo.

Técnicamente no es un modelo base, sino dos adaptadores de bajo rango (LoRA) entrenados sobre SDXL, concretamente sobre el checkpoint CyberRealistic XL v100 según indica la model card. Cada adaptador se activa mediante un token disparador específico (`mdl_spstartface01_cy` para la cara y `mdl_spstartbody01_cy` para el cuerpo) y se invoca con la sintaxis estándar de LoRA de SDXL con pesos recomendados de 0,9 y 1,0 respectivamente.

Su relevancia es limitada y muy específica: sirve como muestra funcional de un sistema comercial de generación de personajes consistentes, no como un modelo generalista. La licencia es restrictiva (uso personal únicamente, sin redistribución ni uso comercial) y el repositorio no incluye información sobre datos de entrenamiento, benchmarks ni métricas de calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Stable Diffusion XL (SDXL), UNet transformer con atención cruzada |
| Parametros totales | no disponible (adaptadores LoRA; el repo pesa 0,7 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible (los LoRA se aplican sobre el checkpoint base en fp16) |
| Idiomas soportados | no disponible (los prompts de SDXL funcionan principalmente en inglés) |
| Licencia | other (uso personal únicamente; sin uso comercial; sin redistribución) |
| Formato de pesos | safetensors (según la licencia referida en la model card) |

## Arquitectura y entrenamiento

El paquete contiene dos adaptadores LoRA de bajo rango que se aplican sobre los pesos de Stable Diffusion XL. SDXL es un modelo de difusión latente con un UNet de aproximadamente 2.600 millones de parámetros y dos codificadores de texto (CLIP ViT-L y OpenCLIP ViT-bigG). Los LoRA modifican las proyecciones de atención del UNet y, opcionalmente, del codificador de texto, permitiendo inyectar un concepto concreto (una identidad facial o una complexión corporal) sin reentrenar el modelo completo.

Según la model card, el entrenamiento se realizó sobre CyberRealistic XL v100, un checkpoint de SDXL afinado para fotorrealismo, y los adaptadores funcionan con cualquier checkpoint SDXL, aunque CyberRealistic XL es el que mejor se aproxima a los datos de entrenamiento. No se especifica el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje, la dimensión del rango LoRA ni si se aplicaron técnicas como regularización o captions detallados. Tampoco se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo de difusión de este tipo.

## Capacidades

- Generación de imágenes fotorrealistas de personajes ficticios adultos mediante texto a imagen con SDXL.
- Control de identidad facial consistente mediante el token `mdl_spstartface01_cy` con peso de LoRA recomendado de 0,9.
- Control de complexión corporal consistente mediante el token `mdl_spstartbody01_cy` con peso de LoRA recomendado de 1,0.
- Combinación de ambos adaptadores en un mismo prompt para generar un personaje completo (cara y cuerpo).
- Personalización del color de pelo y de ojos mediante prompt, ya que la model card indica que son elección del usuario.
- Compatibilidad con cualquier checkpoint SDXL, con mejor resultado sobre CyberRealistic XL v100.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; es exclusivamente text-to-image.
- Capacidades multilingües no documentadas; SDXL funciona de forma fiable principalmente con prompts en inglés.

## Casos de uso

- Prueba del sistema ModelMix antes de comprar: el paquete permite evaluar la calidad y la consistencia de los LoRA de caras y cuerpos del catálogo de pago con dos piezas gratuitas, verificando si el flujo de mezcla encaja con las necesidades del usuario.
- Generación de personajes consistentes para proyectos personales de ilustración: combinando ambos tokens en un mismo prompt se obtiene un personaje estable a lo largo de varias generaciones, útil para cómics amateur, novelas visuales o prototipos narrativos.
- Creación de avatares ficticios para uso personal: la cara entrenada permite generar retratos de un personaje inventado con variaciones de pelo, ojos e iluminación sin perder la identidad.
- Exploración de fotorrealismo sobre CyberRealistic XL: al estar entrenado sobre ese checkpoint, el paquete sirve para comparar la calidad de los LoRA propios frente a otros adaptadores de personaje en el mismo modelo base.
- Prototipado de pipelines text-to-image con SDXL: desarrolladores que integren SDXL en ComfyUI, Automatic1111 o Diffusers pueden usar estos LoRA como ejemplo de adaptadores con token disparador y pesos recomendados para validar su flujo de carga.
- Estudio de anatomía y proporciones en generación de personajes: el LoRA de cuerpo permite fijar una complexión concreta (marco delgado, estatura media) y observar cómo interactúa con distintas poses y vestimentas mediante prompt.
- Docencia o demostración de la técnica LoRA: al ser gratuito y pequeño (0,7 GB), es un ejemplo manejable para explicar cómo funcionan los adaptadores de bajo rango sobre modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de LoRA sobre SDXL, los requisitos son los del checkpoint base. SDXL en fp16 requiere aproximadamente 8-10 GB de VRAM; con cuantización a fp8 o mediante optimizaciones de memoria puede bajar a 6-8 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) para generación en lote o alta resolución; RTX 4080 (16 GB) y RTX 3080 (10-12 GB) son suficientes para inferencia individual.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB) y superiores; en GPUs de 8 GB requiere cuantización u optimizaciones como `--medvram` en Automatic1111 o el modo de bajo VRAM de ComfyUI.
- Opciones de despliegue: Automatic1111 WebUI, ComfyUI, Forge, Diffusers (biblioteca de Hugging Face), InvokeAI y Fooocus. No aplica vLLM, llama.cpp ni Ollama, que son para modelos de lenguaje.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModelMix Starter Pack | LoRA de personaje | SDXL (entrenado sobre CyberRealistic XL v100) | 1024x1024 (nativa de SDXL) | Uso personal, sin comercial | Gratuito en Hugging Face |
| Otros LoRA de personaje SDXL (p. ej. adaptadores de identidad de la comunidad) | LoRA de personaje | SDXL | 1024x1024 | Variable (muchos permisivos) | Gratuitos o de pago según autor |
| Checkpoints fotorrealistas SDXL (p. ej. CyberRealistic XL, RealVisXL) | Modelo completo | SDXL | 1024x1024 | Variable | Gratuitos en Hugging Face |
| Flux.1 (dev/schnell) | Modelo completo | — | hasta 2 MP | Variable (dev no comercial) | Disponible en Hugging Face |

La comparación directa con otros LoRA de personaje es difícil porque no hay métricas públicas de consistencia ni de calidad para este paquete. Frente a checkpoints completos, el Starter Pack no es un modelo autónomo: necesita un SDXL base para funcionar. Frente a Flux.1, la diferencia principal es la arquitectura (SDXL frente a rectified flow transformer) y la licencia, más restrictiva en este paquete.

## Limitaciones y advertencias

- Licencia de uso personal únicamente: no se incluye uso comercial, y está prohibido redistribuir, revender, compartir o resubir los archivos `.safetensors`.
- Prohibición explícita de usar los LoRA para representar personas reales o menores de edad; todos los personajes generados son adultos ficticios.
- No es un modelo autónomo: requiere un checkpoint SDXL base para funcionar, preferiblemente CyberRealistic XL v100.
- No se documentan datos de entrenamiento, número de imágenes, hiperparámetros ni evaluación de sesgos; el riesgo de sesgo demográfico y de representación es desconocido.
- Riesgo de alucinación visual y de artefactos anatómicos propios de SDXL, especialmente en manos, extremidades y composiciones complejas.
- La consistencia del personaje depende del prompt y del peso del LoRA; valores distintos de 0,9 y 1,0 pueden degradar la identidad o la calidad.
- El soporte de idiomas no está documentado; los prompts en castellano pueden funcionar peor que en inglés.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su calidad.
- El modelo fue creado y actualizado en noviembre de 2026 según los metadatos, lo que conviene verificar frente a la fecha real de consulta.
- Uso comercial del catálogo completo requiere compra en las plataformas indicadas; el paquete gratuito no transfiere derechos comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ModelMixAI/modelmix-starter-pack
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Catálogo completo en Payhip: https://payhip.com/modelmix
- Catálogo completo en Lemon Squeezy: https://modelmix.lemonsqueezy.com
- Catálogo completo en 3DIMLI: https://www.3dimli.com/store/modelmix
- Catálogo completo en Whop: https://whop.com/modelmix
