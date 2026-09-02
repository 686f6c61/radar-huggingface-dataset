# satu1234/ClayCanvas

## Resumen

ClayCanvas es un adaptador LoRA (Low-Rank Adaptation) para el modelo de generación de imágenes Stable Diffusion 1.5, desarrollado por el usuario satu1234. El modelo está diseñado para transferir estilos artísticos auténticos —como óleo, acuarela, lápiz, tinta, carboncillo, pastel y otros— a imágenes generadas a partir de texto. Se entrenó sobre 12.554 obras de arte reales del dataset OpenBrush, con licencia CC0, lo que lo convierte en un recurso de dominio público para uso comercial y creativo.

La relevancia de ClayCanvas radica en su eficiencia: en lugar de afinar el modelo completo (1.070 millones de parámetros), solo se entrenan 6,4 millones de parámetros (un 0,7 % del total) mediante LoRA con rango 32. Esto reduce drásticamente el coste de entrenamiento y el tamaño del artefacto final (aproximadamente 25 MB), manteniendo la calidad de estilos aprendidos. Es una solución práctica para artistas, ilustradores y desarrolladores que buscan integrar estilos pictóricos en pipelines de generación de imágenes sin necesidad de hardware especializado ni grandes recursos de cómputo.

El modelo se distribuye como un adaptador para Diffusers y es compatible con interfaces como Automatic1111 y ComfyUI. Aunque la model card indica que el entrenamiento se realizó a resolución 256×256, se recomienda usar la inferencia a 512×512 o 768×768 para obtener mejores resultados visuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Stable Diffusion 1.5 (UNet + Text Encoder + VAE) |
| Parametros totales | 1.070 millones (modelo base) + 6,4 millones (LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (generación de imágenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (prompts en inglés, aunque puede funcionar con otros idiomas) |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors (lora_weights.safetensors) |

## Arquitectura y entrenamiento

ClayCanvas es un adaptador de bajo rango (LoRA) que modifica las capas de atención del UNet de Stable Diffusion 1.5. Concretamente, se aplican matrices de adaptación a los módulos `to_q`, `to_k`, `to_v` y `to_out.0` de los bloques de atención, con rango 32 y alpha 32. El modelo base (`runwayml/stable-diffusion-v1-5`) se mantiene congelado durante el entrenamiento, y solo se optimizan los pesos del adaptador.

El entrenamiento se realizó sobre el dataset OpenBrush, que contiene 12.554 obras de arte reales con licencia CC0, abarcando estilos como óleo, acuarela, lápiz, línea, crayón, carboncillo, pastel, tinta e impresionismo. Se utilizó el optimizador AdamW con una tasa de aprendizaje de 1e-4, programador coseno con 50 pasos de calentamiento, tamaño de lote 1 y acumulación de gradientes 1. La resolución de entrenamiento fue de 256×256. Según la model card, se ejecutaron 10.000 pasos (una fuente secundaria menciona 5.000, pero la model card es la referencia principal), con una pérdida final de aproximadamente 0,18. El entrenamiento se realizó en CPU (sin precisión mixta), lo que explica la baja resolución y el número limitado de pasos.

La innovación principal es la eficiencia paramétrica: con solo 6,4 millones de parámetros entrenables se logra capturar una amplia variedad de estilos artísticos, demostrando que LoRA es una alternativa viable al fine-tuning completo para tareas de transferencia de estilo.

## Capacidades

- Generación de imágenes a partir de texto en múltiples estilos artísticos: óleo, acuarela, lápiz, línea, crayón, carboncillo, pastel, tinta e impresionismo.
- Control fino del estilo mediante palabras clave en el prompt (por ejemplo, `oil painting`, `watercolor`, `line art`).
- Compatible con el pipeline `StableDiffusionPipeline` de Diffusers, así como con interfaces gráficas como Automatic1111 y ComfyUI.
- Soporta mezcla de estilos en un mismo prompt (por ejemplo, fondo de acuarela con primer plano de óleo).
- Funciona tanto en GPU como en CPU (aunque con rendimiento reducido en CPU).
- El adaptador es ligero (≈25 MB) y fácil de integrar en proyectos existentes.

## Casos de uso

- Ilustración editorial: un ilustrador puede generar imágenes de acompañamiento para artículos o libros usando prompts con estilo de acuarela o lápiz, manteniendo coherencia visual en toda la serie.
- Concept art para videojuegos: diseñadores pueden explorar rápidamente variaciones de escenarios en óleo o carboncillo para definir la dirección artística antes de pasar a producción.
- Generación de portadas para publicaciones: el modelo permite crear portadas con estética de pintura al óleo o tinta para revistas, novelas o álbumes musicales.
- Prototipado de diseño gráfico: agencias pueden usar ClayCanvas para crear mockups de carteles o packaging con estilos artísticos específicos, reduciendo el tiempo de iteración.
- Creación de contenido para redes sociales: artistas digitales pueden generar piezas únicas con estilos de pastel o crayón para publicaciones, sin necesidad de dominar técnicas tradicionales.
- Formación y educación: estudiantes de arte pueden experimentar con diferentes estilos pictóricos a partir de prompts descriptivos, facilitando el estudio de técnicas visuales.
- Restauración o reinterpretación de obras: dado que el dataset es CC0, se pueden generar reinterpretaciones de estilos clásicos sin problemas de derechos de autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un modelo de generación de imágenes, no se dispone de métricas estándar como MMLU o HumanEval. La model card no incluye evaluaciones cuantitativas más allá de la pérdida de entrenamiento (~0,18). Se recomienda evaluar la calidad visual de forma subjetiva mediante pruebas manuales.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. Para SD 1.5 a 512×512, se recomiendan al menos 4 GB de VRAM en GPU (por ejemplo, GTX 1650 o superior). Con cuantización (fp16) puede funcionar en GPUs con 4 GB, aunque con menor calidad.
- GPU recomendadas: RTX 3060 (12 GB) o superior para mayor velocidad y resolución de 768×768. En GPUs de 8 GB (RTX 3070, RTX 2080) es viable a 512×512.
- Puede ejecutarse en CPU (modo float32), pero la generación será lenta (del orden de minutos por imagen).
- Opciones de despliegue: Diffusers (Python), Automatic1111 WebUI, ComfyUI, o mediante servidores de inferencia como vLLM (aunque vLLM está orientado a LLM, no a imágenes; para imágenes se usan soluciones como Stable Diffusion WebUI o API de Diffusers).
- Latencia estimada: en una GPU RTX 3060, una imagen de 512×512 con 30 pasos tarda aproximadamente 2-3 segundos; en CPU puede tardar 5-10 minutos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la información proporcionada. La propia model card compara el enfoque LoRA con un fine-tuning completo del modelo base, destacando la reducción de parámetros (6,4M vs 1,07B), almacenamiento (25MB vs 2,5GB) y tiempo de entrenamiento (horas vs días). Sin embargo, no se mencionan otros LoRA de estilo artístico similares en el mercado.

## Limitaciones y advertencias

- El entrenamiento se realizó a 256×256; la generación a resoluciones superiores (512×512 o 768×768) puede producir artefactos o degradación de estilo. Se recomienda usar el post-procesado o upscaling si se necesitan imágenes grandes.
- El modelo base Stable Diffusion 1.5 tiene su propia licencia (CreativeML Open RAIL-M), que impone restricciones de uso responsable. Aunque el adaptador es CC0, el modelo base no lo es, por lo que se deben respetar los términos de la licencia del base.
- El dataset OpenBrush es CC0, pero no se detallan las características demográficas o culturales de las obras; puede haber sesgos en los estilos aprendidos (por ejemplo, predominio de arte occidental).
- No se han evaluado formalmente los sesgos ni la robustez del modelo ante prompts ambiguos o nocivos.
- La model card indica que el entrenamiento está "en progreso" y que el estado actual es "Training in progress", lo que sugiere que el modelo podría no estar completamente afinado.
- No hay información sobre la calidad de la generación en idiomas distintos del inglés; se recomienda usar prompts en inglés para resultados óptimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satu1234/ClayCanvas
- Perfil del autor en Hugging Face: https://huggingface.co/satu1234
- Perfil de GitHub del autor: https://github.com/Satu1234
