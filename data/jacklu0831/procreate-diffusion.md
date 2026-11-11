# Jacklu0831/procreate-diffusion

## Resumen

ProCreate Diffusion es una colección de ocho UNets de Stable Diffusion 1.5, cada uno afinado con fine-tuning de 2.000 pasos sobre una categoría concreta del dataset FSCG-8 (Few-Shot Creative Generation 8), que contiene 50 pares imagen-caption por categoría. El modelo lo desarrolla Jack Lu (Jacklu0831) en el marco del paper "ProCreate, Don't Reproduce! Propulsive Energy Diffusion for Creative Generation", presentado en ECCV 2024 junto con Ryan Teehan y Mengye Ren.

El objetivo del trabajo no es solo el fine-tuning few-shot, sino el método de muestreo ProCreate: una técnica que empuja las imágenes generadas lejos de las imágenes de referencia del conjunto de entrenamiento, de modo que un modelo afinado con muy pocos ejemplos produzca muestras novedosas en el mismo estilo en lugar de replicar los datos vistos. Esto ataca directamente el problema de memorización y sobreajuste típico del fine-tuning con datasets minúsculos.

La relevancia práctica es doble: por un lado, ofrece checkpoints listos para usar en ocho dominios creativos (Modigliani, Apple, Burberry, Frank Gehry, Nouns, One Piece, Pokémon y Rococó); por otro, sirve como implementación de referencia del muestreo ProCreate sobre la arquitectura de difusión estándar de Stable Diffusion 1.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet2DConditionModel (difusión latente, base Stable Diffusion 1.5) |
| Parametros totales | no disponible (el checkpoint publicado contiene únicamente los pesos del UNet, no el pipeline completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; el texto se procesa con el tokenizador CLIP de SD 1.5, 77 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite float16 y las cuantizaciones habituales de diffusers, no documentadas por el autor) |
| Idiomas soportados | no disponible (las captions del dataset están en inglés) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | safetensors (formato diffusers) |

## Arquitectura y entrenamiento

Cada checkpoint es un UNet de Stable Diffusion 1.5 (`UNet2DConditionModel`) afinado durante 2.000 pasos sobre una de las ocho categorías del dataset FSCG-8, que contiene 50 pares caption-imagen por categoría. El pipeline completo se reconstruye cargando el UNet base de `stable-diffusion-v1-5/stable-diffusion-v1-5` y sustituyendo su UNet por el del subdirectorio de la categoría deseada. El repo ocupa 27,5 GB, coherente con ocho UNets en precisión completa o mixta.

La innovación principal no está en el entrenamiento sino en el muestreo: ProCreate es un método de difusión con "propulsive energy" que modifica el proceso de generación para alejar las muestras de las imágenes de referencia del dataset de fine-tuning. El fine-tuning few-shot convencional tiende a memorizar los 50 ejemplos; ProCreate corrige esa deriva durante la inferencia sin necesidad de reentrenar. Para reproducir el muestreo ProCreate hay que usar `src/inference.py` del repositorio de código, que descarga el checkpoint automáticamente; cargar el UNet directamente en `StableDiffusionPipeline` produce muestras del modelo afinado sin el empuje creativo.

No se documentan en la información disponible detalles sobre el número total de tokens de entrenamiento, la composición del dataset más allá de las ocho categorías ni el uso de RLHF o DPO (no aplica en un modelo de difusión de este tipo).

## Capacidades

- Generación de imágenes text-to-image en ocho dominios creativos específicos: pintura de Amedeo Modigliani, diseño de producto de Apple, diseño de Burberry, arquitectura de Frank Gehry, personajes Nouns, personajes de One Piece, Pokémon y arte y mobiliario de estilo Rococó.
- Generación few-shot con estilos aprendidos de solo 50 ejemplos por categoría.
- Muestreo ProCreate para producir variaciones novedosas que evitan replicar las imágenes de referencia.
- Composición de prompts en inglés con el estilo de caption del dataset (por ejemplo, "an Apple VR headset" o "a twisting tall apartment building, designed by Frank Gehry").
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión de entrada, audio ni modo thinking: es un modelo de difusión puro de generación de imágenes.
- Capacidades multilingües no documentadas; el texto se procesa con el codificador CLIP de SD 1.5, entrenado principalmente en inglés.

## Casos de uso

- Exploración de estilo de autor: cargar el UNet `amedeo_modigliani` y generar retratos con la geometrización característica del pintor para moodboards o referencias de dirección de arte, aprovechando que el fine-tuning captura el estilo con solo 50 ejemplos.
- Ideación de producto: usar el checkpoint `apple` para generar conceptos de dispositivos (por ejemplo, "an Apple VR headset") en una fase temprana de diseño, con el muestreo ProCreate para obtener variantes que no copien los diseños del dataset.
- Diseño de moda y patronaje: el checkpoint `burberry` permite generar propuestas de prendas y accesorios en el lenguaje visual de la marca para prototipado interno, siempre que el uso cumpla la licencia RAIL-M.
- Arquitectura conceptual: el checkpoint `frank_gehry` genera volumetrías y edificios con formas torsionadas para fases de anteproyecto, con prompts descriptivos en inglés.
- Contenido para comunidades de fan: los checkpoints `pokemon`, `one_piece` y `nouns` permiten generar criaturas o personajes originales en el estilo de cada franquicia para ilustración, fan art o prototipos de juego, con la advertencia legal correspondiente sobre propiedad intelectual.
- Investigación en generación creativa: servir de baseline reproducible para comparar métodos de muestreo (ProCreate frente a muestreo estándar) sobre el dataset FSCG-8, ya que el paper y el código están publicados.
- Interiorismo y decoración: el checkpoint `rococo` genera muebles y ambientes de estilo rococó para inspiración de catálogo o renders preliminares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de métricas (FID, CLIP score, similitud con el dataset de referencia) ni comparaciones numéricas con otros métodos; los resultados cuantitativos del método ProCreate están en el paper de ECCV 2024, no en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el pipeline completo de Stable Diffusion 1.5 en float16 requiere aproximadamente 4-6 GB de VRAM; el UNet por sí solo ocupa del orden de 1,7 GB en float16 (3,4 GB en float32). El repo completo de 27,5 GB incluye los ocho UNets y no necesita cargarse entero en memoria.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para el pipeline en float16; RTX 3060, RTX 4060, RTX 4070, RTX 4090, A100 y H100 son válidas. Para lotes grandes o fp32 se recomienda A100 o H100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090). En tarjetas con 4-6 GB puede requerir atención por chunks o precisión reducida.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` (el método documentado); el script `src/inference.py` del repositorio para el muestreo ProCreate. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| ProCreate Diffusion (este) | UNet SD 1.5, 8 checkpoints | Difusión few-shot con muestreo anti-memorización | CreativeML Open RAIL-M | Hugging Face, código en GitHub |
| Stable Diffusion 1.5 (base) | UNet SD 1.5 | Difusión text-to-image generalista | CreativeML Open RAIL-M | Hugging Face |
| DreamBooth (fine-tuning) | UNet SD 1.5 | Fine-tuning por sujeto, sin mecanismo anti-copia | CreativeML Open RAIL-M | Implementaciones en diffusers |
| Textual Inversion | SD 1.5 + embeddings | Aprendizaje de conceptos con pocos ejemplos | CreativeML Open RAIL-M | diffusers |

La diferencia clave frente a las alternativas es que ProCreate combina fine-tuning few-shot con un muestreo que penaliza la proximidad a las imágenes de entrenamiento, mientras que DreamBooth y Textual Inversion no incluyen ese mecanismo y tienden a reproducir los ejemplos vistos.

## Limitaciones y advertencias

- El modelo hereda los sesgos de Stable Diffusion 1.5 y de los datasets de captions originales; no se documenta ninguna mitigación específica.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías, textos y estructuras incoherentes, especialmente con prompts fuera del dominio de la categoría.
- Cada checkpoint está especializado en una sola categoría; no es un modelo generalista y su rendimiento fuera de su dominio será pobre.
- El muestreo ProCreate requiere usar el script del repositorio; cargar el UNet directamente en el pipeline estándar no aplica el empuje creativo y puede reproducir los datos de entrenamiento.
- Los prompts deben formularse en inglés y con la estructura de las captions del dataset para obtener buenos resultados.
- Restricciones de licencia: CreativeML Open RAIL-M permite uso comercial con condiciones, pero incluye cláusulas de uso restringido que deben revisarse antes de desplegar en producción.
- Riesgo legal por propiedad intelectual: los checkpoints entrenados sobre Pokémon, One Piece, Nouns, Burberry y el estilo de Frank Gehry o Modigliani pueden generar contenido protegido; el uso comercial de esas categorías requiere evaluación legal específica.
- El repo no incluye el VAE ni el text encoder; hay que descargarlos del modelo base de SD 1.5.
- No hay datos publicados de rendimiento ni de latencia, y el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jacklu0831/procreate-diffusion
- Paper (arXiv): https://arxiv.org/abs/2408.02226
- Página del proyecto: https://agenticlearning.ai/procreate/
- Código: https://github.com/agentic-learning-ai-lab/procreate-diffusion
- Dataset FSCG-8: https://huggingface.co/datasets/Jacklu0831/few-shot-creative-generation-8
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
