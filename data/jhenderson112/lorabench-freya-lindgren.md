# Jhenderson112/lorabench-freya-lindgren

## Resumen

La LoRA `lorabench-freya-lindgren` es un adaptador de bajo rango (Low-Rank Adaptation) para Stable Diffusion XL, desarrollado por Jhenderson112. Su propósito es generar retratos y primeros planos fotorrealistas de un personaje ficticio recurrente: Freya Lindgren, una mujer sueca de 32 años con cabello rubio platino ondulado, ojos azul claro y pecas naturales. El modelo se entrenó sobre el checkpoint `RealVisXL_V4.0`, un modelo base especializado en fotorrealismo, y se distribuye como un archivo `safetensors` de aproximadamente 208 MB.

La relevancia de esta LoRA radica en su capacidad para mantener la consistencia de identidad de un personaje a través de múltiples generaciones, un problema habitual en la generación de imágenes con modelos de difusión. Al ser un adaptador ligero, se puede integrar en cualquier pipeline de SDXL (ComfyUI, Automatic1111, SD.Next) sin necesidad de reentrenar el modelo base. Forma parte de una serie de ocho personajes del pipeline "G-3" del autor, orientado a la validación de calidad en el proyecto Lorabench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Stable Diffusion XL (UNet + CLIP) |
| Parametros totales | no disponible (archivo safetensors de ~208 MB) |
| Longitud de contexto | no aplica (modelo de difusion) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (prompts en ingles) |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La LoRA se entrena con la herramienta kohya, utilizando el módulo `networks.lora` con un rango (dim) de 32 y un alpha de 16. El modelo base es `RealVisXL_V4.0.safetensors`, un checkpoint de SDXL optimizado para fotorrealismo. El dataset de entrenamiento consta de 25 imágenes con captions, todas a resolución 1024×1024. El entrenamiento se realizó durante 12 épocas, con un total de 384 pasos (25 lotes por época, tamaño de lote efectivo de 4 mediante acumulación de gradientes). Se usó el optimizador AdamW8bit con una tasa de aprendizaje de 1e-4 para UNet y 5e-5 para el text encoder, con scheduler `cosine_with_restarts` (3 ciclos) y 100 pasos de warmup. La precisión mixta fue bf16, con caption dropout y network dropout de 0.05. El trigger word es `Freya_Lindgren` (con guion bajo) y se recomienda colocarlo al inicio del prompt para mejores resultados.

## Capacidades

- Generación de retratos fotorrealistas de un personaje específico (mujer sueca de 32 años, cabello rubio platino, ojos azul claro, pecas).
- Consistencia de identidad facial y de estilo a través de múltiples generaciones con el mismo trigger.
- Compatible con cualquier pipeline de SDXL que soporte LoRAs (ComfyUI, Automatic1111, SD.Next, Diffusers).
- Se puede combinar con IP-Adapter o FaceID para mantener la consistencia facial completa a partir de una imagen de referencia.
- No incluye capacidades de texto, código, audio o visión; es exclusivamente un adaptador de imagen.
- Soporta prompts en inglés (idioma habitual en SDXL), aunque no se especifica oficialmente.

## Casos de uso

- **Creación de contenido de marca con personaje recurrente**: una empresa de bienestar o estilo de vida nórdico puede usar esta LoRA para generar imágenes consistentes de una "embajadora" ficticia en campañas de marketing, manteniendo la misma apariencia en diferentes escenarios y productos.
- **Ilustración de personajes para novelas visuales o cómics**: los artistas pueden generar múltiples viñetas o ilustraciones del mismo personaje sin variaciones drásticas de rasgos, gracias al trigger y a la consistencia entrenada.
- **Generación de avatares para redes sociales o perfiles profesionales**: se puede crear un avatar fotorrealista único y consistente para una marca personal o un alter ego digital, usando el trigger en cada generación.
- **Prototipado de personajes para videojuegos**: los diseñadores pueden generar rápidamente variaciones de un personaje (expresiones, ángulos, iluminación) manteniendo la identidad, útil para concept art o pruebas de diseño.
- **Composición con IP-Adapter para consistencia facial**: al combinar esta LoRA con IP-Adapter o FaceID, se puede mantener la identidad facial exacta del personaje en poses o encuadres diferentes, partiendo de una imagen de referencia.
- **Generación de retratos para portafolios de fotografía de stock**: con la licencia OpenRAIL-M, se pueden crear imágenes de un personaje ficticio para bancos de imágenes, siempre que se cumplan las restricciones de la licencia (no contenido NSFW, no menores, etc.).

## Benchmarks y rendimiento

La model card incluye métricas de validación propias del proyecto Lorabench, no benchmarks estándar de la industria. Se evaluaron cuatro prompts del conjunto de entrenamiento, comparando generaciones con y sin LoRA (mismo seed, trigger eliminado en el caso sin LoRA). Los resultados se muestran a continuación:

| Metrica | Umbral | Resultado |
|---|---|---|
| `pixel_variance_min` (HARD) | 3.0 | PASS |
| `vision_eval_min` (HARD) | 4.0 | PASS |
| `clip_identity_min` (SOFT) | 0.55 | PASS |
| `lpips_min` (SOFT) | 0.7 | PASS |
| `aesthetic_min` (SOFT) | 5.0 | PASS |

El veredicto del análisis por visión fue `recommendation = ship`, `consistency_improved = true` y `drift_visible_without = false`, indicando que la LoRA mejora la consistencia del personaje sobre el modelo base. No se han publicado resultados en benchmarks estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- **VRAM estimada**: para ejecutar SDXL con esta LoRA se recomienda al menos 8 GB de VRAM. La LoRA añade una sobrecarga mínima (el archivo pesa ~208 MB), por lo que el requisito principal lo determina el modelo base.
- **GPUs recomendadas**: tarjetas consumer como RTX 3060 (12 GB), RTX 4070, RTX 4080 o RTX 4090 pueden ejecutar el modelo sin problemas. GPUs con menos de 8 GB pueden requerir cuantización o técnicas de offloading.
- **Compatibilidad con consumer GPUs**: sí, es viable en GPUs de gama media y alta.
- **Opciones de despliegue**: ComfyUI, Automatic1111 (A1111), SD.Next, o la biblioteca Diffusers de Hugging Face. También se puede usar con herramientas de línea de comandos como `sd-scripts` de kohya.
- **Latencia y throughput**: no disponible en la información proporcionada. Depende de la GPU y del pipeline utilizado.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras LoRAs de personajes similares en la información proporcionada. La única comparación disponible es con el modelo base `RealVisXL_V4.0` sin la LoRA, que se muestra en la galería de ejemplos de la model card: con la LoRA, la consistencia del personaje mejora notablemente, mientras que sin ella hay deriva en los rasgos faciales. No se han encontrado métricas numéricas de otras LoRAs comparables.

## Limitaciones y advertencias

- **Sobreajuste por dataset reducido**: al entrenarse con solo 25 imágenes, la LoRA puede estar sobreajustada a ciertas poses, encuadres o condiciones de iluminación presentes en el conjunto de entrenamiento. Se recomienda usar la fuerza (strength) recomendada de 0.85 para evitar artefactos.
- **Riesgo de artefactos**: con fuerzas superiores a 0.85 o prompts muy alejados del dominio de entrenamiento, pueden aparecer deformaciones o inconsistencias en el rostro.
- **Restricciones de licencia**: la licencia CreativeML Open RAIL-M permite uso comercial, pero prohíbe usos que generen contenido ilegal, dañino o explícito, y no permite usar el modelo para generar menores o contenido NSFW. Además, cualquier redistribución debe mantener la misma licencia.
- **Idioma de prompts**: aunque el modelo base SDXL soporta múltiples idiomas, la LoRA fue entrenada con captions en inglés, por lo que se recomienda usar prompts en inglés para obtener los mejores resultados.
- **Dependencia del modelo base**: la LoRA está diseñada específicamente para `RealVisXL_V4.0`. Usarla con otros checkpoints de SDXL puede degradar la consistencia o producir resultados inesperados.
- **Nota sobre metadatos de licencia**: la model card indica que el TOML de entrenamiento registró `metadata_license = "internal-use"` como marcador de posición, pero la liberación pública se realizó bajo `creativeml-openrail-m`, que es la licencia estándar para LoRAs derivadas de SDXL.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/Jhenderson112/lorabench-freya-lindgren)
- [Discusiones del modelo](https://huggingface.co/Jhenderson112/lorabench-freya-lindgren/discussions)
- [Licencia CreativeML Open RAIL-M](https://huggingface.co/spaces/CompVis/stable-diffusion-license)
