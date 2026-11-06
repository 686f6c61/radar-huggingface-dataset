# lightx2v/Qwen-Image-2.1-Lightning-v2-RL

## Resumen
Qwen-Image-2.1-Lightning-v2-RL es un modelo de difusión para generación y edición de imágenes desarrollado por el equipo de LightX2V (ModelTC). Se trata de un fine-tune destilado y posteriormente refinado con aprendizaje por refuerzo (RL) a partir de Qwen/Qwen-Image-2.1, el modelo base de generación de imágenes de la familia Qwen. Su propuesta principal es reducir drásticamente el coste de inferencia: genera imágenes de 1024 × 1024 en solo 4 pasos de denoising con CFG = 1.0, frente a los 40 pasos típicos del modelo base.

El checkpoint publicado contiene únicamente los pesos completos del transformer (7.115 millones de parámetros, almacenados en FP32 y cargables en BF16), no una pipeline autónoma ni un adaptador LoRA. Para usarlo hay que cargar el procesador, el text encoder y el VAE del pipeline original Qwen-Image-2.1 y sustituir su transformer por este. Esta arquitectura de distribución lo hace interesante para equipos que ya tienen integrado el ecosistema Qwen-Image y quieren acelerar su producción sin cambiar de familia de modelos.

El modelo cubre tres tareas: text-to-image, edición con una imagen de referencia y generación multi-referencia (combinar elementos de varias imágenes). Su relevancia actual radica en la combinación de destilación por pasos con RL, una estrategia que busca recuperar calidad tras la compresión de pasos de muestreo, y en su integración con Diffusers mediante la clase `QwenImage21Pipeline`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (QwenImage21Transformer2DModel), fine-tune de Qwen-Image-2.1 |
| Parametros totales | 7.115.124.736 (transformer) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en FP32; inferencia recomendada en BF16; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (licencia "other", enlazada a la licencia de Qwen-Image-2.1) |
| Formato de pesos | safetensors (`diffusion_pytorch_model.safetensors`), más `config.json` e `inference_config.json` |
| Pasos de inferencia | 4 (schedule de sigmas fijo) |
| CFG | 1.0 (`true_cfg_scale`) |
| Resolución de salida | 1024 × 1024 por defecto; otras proporciones con dimensiones múltiplos de 32 |
| Tamaño del repo | 28.5 GB |
| Librería | diffusers |

## Arquitectura y entrenamiento
El modelo es un transformer de difusión condicionado por texto (y opcionalmente por imágenes de referencia) que hereda la arquitectura de Qwen-Image-2.1. Sobre ese modelo base se aplicó primero una destilación por pasos (Lightning v2) que reduce el muestreo de 40 pasos a 4, y después un refinamiento mediante aprendizaje por refuerzo usando la herramienta LightX2V RL del repositorio del proyecto. El objetivo del RL es corregir la pérdida de calidad introducida por la destilación agresiva de pasos, optimizando directamente métricas de calidad de imagen en lugar de solo imitar las trayectorias del profesor.

La inferencia utiliza un `FlowMatchEulerDiscreteScheduler` con un schedule de cuatro sigmas precalculadas y ya desplazadas, que se leen de `inference_config.json`. La model card advierte explícitamente de que no debe aplicarse un desplazamiento dinámico adicional ni sustituir el schedule por `num_inference_steps=4`, ya que no reproduce el mismo resultado. El modelo soporta KV cache (`use_kv_cache`) durante el muestreo. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RL (función de recompensa, algoritmo concreto).

## Capacidades
- Generación de imágenes a partir de texto (text-to-image) con prompts descriptivos en lenguaje natural.
- Edición de imagen con una referencia única: cambiar atributos (por ejemplo, el color de una prenda) preservando identidad, pose y resto de la escena.
- Generación multi-referencia: combinar elementos de varias imágenes de entrada (por ejemplo, una persona de la imagen 1 con una chaqueta de la imagen 2), respetando el orden de las referencias indicado en el prompt.
- Generación rápida en 4 pasos de denoising, apta para escenarios de baja latencia.
- Control de resolución mediante dimensiones múltiplas de 32.
- Reproducibilidad mediante semilla explícita (`torch.Generator`).
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode, por tratarse de un modelo de imagen.

## Casos de uso
- Prototipado rápido de conceptos visuales: con 4 pasos y CFG 1.0, un equipo de diseño puede generar decenas de variaciones de una idea en segundos, iterando sobre el prompt sin esperar los 40 pasos del modelo base.
- Edición de producto en catálogos de e-commerce: cambiar el color o acabado de una prenda o un objeto manteniendo la identidad del modelo y la composición, usando la edición de referencia única.
- Composición de escenas con múltiples referencias: integrar un producto en una escena junto a un modelo humano, pasando ambas imágenes como referencias y describiendo la relación en el prompt.
- Generación de imágenes para marketing y redes sociales a 1024 × 1024, con formatos alternativos ajustando las dimensiones a múltiplos de 32 para adaptarse a distintas plataformas.
- Sustitución del transformer en pipelines existentes de Qwen-Image-2.1: los equipos que ya tienen integrado `QwenImage21Pipeline` pueden cambiar solo el transformer y reducir el coste computacional por imagen de forma significativa.
- Generación de variaciones controladas en producción: al fijar la semilla y el schedule de sigmas, el pipeline es determinista, lo que facilita pruebas de regresión y auditoría de resultados.
- Investigación en destilación y RL para modelos de difusión: el checkpoint y la herramienta LightX2V RL permiten reproducir y extender el enfoque de refinamiento sobre modelos destilados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la información disponible. La model card incluye únicamente comparaciones cualitativas frente a Qwen-Image-2.1 con 40 pasos, con CFG = 1.0, los mismos prompts enriquecidos y salida de 1024 × 1024, organizadas en ejemplos de text-to-image, edición y multi-referencia (carpeta `assets/comparison/`). No se proporcionan métricas numéricas de latencia ni throughput.

## Requisitos de hardware
- El transformer tiene 7.115 millones de parámetros; en BF16 ocupa aproximadamente 14 GB, y en FP32 alrededor de 28 GB. A ello hay que sumar el text encoder, el VAE y el resto de componentes del pipeline Qwen-Image-2.1.
- VRAM estimada para inferencia completa: no disponible de forma oficial; como referencia orientativa, el transformer en BF16 más los componentes auxiliares del pipeline requieren una GPU de gama alta con al menos 24 GB, aunque la cifra exacta no está documentada.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño del transformer, GPUs de datacenter como A100 o H100 son adecuadas; en consumer, una RTX 4090 (24 GB) es el mínimo razonable para BF16, aunque no hay confirmación oficial.
- Despliegue: la vía documentada es Diffusers con `QwenImage21Pipeline` y `QwenImage21Transformer2DModel` (requiere una versión reciente de Diffusers instalada desde el repositorio de GitHub y `transformers>=5.17.0`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a modelos de difusión de este tipo.
- Latencia y throughput: no disponibles. La ventaja teórica es la reducción de 40 a 4 pasos de denoising, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros (transformer) | Pasos de inferencia | CFG | Tareas | Licencia |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Lightning-v2-RL | 7.115 M | 4 | 1.0 | T2I, edición 1 ref., multi-referencia | qwen-research |
| Qwen-Image-2.1 (base) | no disponible en la información | 40 (Euler) | 1.0 | T2I, edición, multi-referencia | qwen-research |
| Otros modelos de la familia Lightning v2 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible es con el modelo base Qwen-Image-2.1: mismo pipeline y mismos componentes auxiliares, pero 10 veces menos pasos de denoising en el modelo destilado. No se dispone de datos cuantitativos de calidad ni de comparativas con otras familias de modelos de imagen en la información proporcionada.

## Limitaciones y advertencias
- No es una pipeline autónoma ni un LoRA: requiere cargar el text encoder, el VAE y el procesador de Qwen-Image-2.1, y sustituir el transformer. Un uso incorrecto de los componentes produce errores o resultados degradados.
- El schedule de sigmas es fijo y específico del release; usar `num_inference_steps=4` sin las sigmas de `inference_config.json` no reproduce los resultados. Tampoco debe aplicarse desplazamiento dinámico adicional.
- La model card reconoce que la calidad puede variar según prompt y semilla, y que el texto fino, la anatomía, el recuento de objetos y la preservación precisa de referencias pueden requerir revisión manual.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir detalles inconsistentes con el prompt o con las imágenes de referencia.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al heredar el modelo base, es previsible que arrastre los sesgos de sus datos de entrenamiento.
- Licencia qwen-research: es una licencia de investigación con posibles restricciones para uso comercial. Debe revisarse el texto completo de la licencia de Qwen-Image-2.1 antes de cualquier despliegue en producción.
- El repositorio incluye `merge_manifest.json`, un registro de auditoría de exportación que no se usa para inferencia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un release muy reciente y con poca validación externa por parte de la comunidad.
- No se documentan los idiomas soportados por el text encoder; el comportamiento multilingüe de los prompts no está garantizado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/lightx2v/Qwen-Image-2.1-Lightning-v2-RL
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio LightX2V en GitHub: https://github.com/ModelTC/LightX2V
- Herramienta LightX2V RL: https://github.com/ModelTC/LightX2V/tree/main/lightx2v_rl
- Organización LightX2V en Hugging Face: https://huggingface.co/lightx2v
- Sitio web del proyecto: https://x2v.light-ai.top/
- Diffusers (instalación desde GitHub): https://github.com/huggingface/diffusers
