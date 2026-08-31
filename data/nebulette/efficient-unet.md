# nebulette/efficient-unet

## Resumen

Efficient UNet es un modelo de difusión para generación de imágenes, desarrollado por el usuario nebulette y publicado bajo licencia Apache 2.0. Se trata de una arquitectura U-Net modificada que elimina las capas de self-attention en las etapas de alta resolución y sustituye las convoluciones estándar por módulos DepthwiseConv, lo que reduce el coste computacional y el número de parámetros (57,2 millones). El modelo emplea un codificador de texto basado en LFM2.5 (contrastivo) para manejar secuencias de texto de estilo anime, y un VAE Mage-VAE de 12 canales como autoencoder latente. Está entrenado exclusivamente con datos de rostros anime (anime_faces_v2 y gelbooru_2026), por lo que su dominio de aplicación es la generación de retratos anime.

La relevancia del modelo radica en su enfoque de eficiencia: al eliminar la atención en resoluciones altas y usar convoluciones profundas, reduce la memoria y el coste de inferencia frente a U-Nets convencionales, manteniendo una calidad aceptable para su dominio específico. Aunque no se han publicado métricas formales, su tamaño compacto lo hace apto para GPUs de consumo. El modelo se distribuye en formato safetensors y se integra con la librería Diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net modificada (sin self-attention en alta resolución, DepthwiseConv, embeddings sinusoidales) |
| Parametros totales | 57.241.740 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión para imágenes, no procesa texto de forma secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el text encoder trabaja con secuencias de texto en inglés, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura U-Net clásica para difusión, pero con tres modificaciones clave: (1) se eliminan las capas de self-attention en las etapas de alta resolución, lo que reduce la complejidad cuadrática en esas capas; (2) las capas Conv2d se sustituyen por módulos DepthwiseConv, que separan la convolución espacial de la de canales, reduciendo parámetros y FLOPs; (3) el ruido gaussiano habitual se reemplaza por embeddings sinusoidales de posición, una técnica que facilita el condicionamiento temporal.

El entrenamiento utiliza un VAE Mage-VAE en su variante de 12 canales como espacio latente, y un codificador de texto LFM2.5 contrastivo (lfm-350m-contrastive) para las secuencias de texto asociadas a las imágenes. Las palabras clave separadas por comas se barajan en cada época. La augmentación de datos consiste en exponer al modelo a recortes de imágenes más grandes en las primeras épocas, y el padding opcional alrededor de las imágenes no se incluye en el cálculo de la pérdida. El learning rate durante el warmup es de 1e-5 y los timesteps se seleccionan mediante muestreo logit-normal. Los datos provienen de anime_faces_v2 y gelbooru_2026 (retratos).

## Capacidades

- Generación de imágenes de rostros anime y retratos a partir de descripciones textuales (text-to-image).
- Manejo de secuencias de texto con palabras clave separadas por comas, que se barajan durante el entrenamiento para mejorar la robustez.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso o procesamiento de otros dominios visuales.

## Casos de uso

- Creación de avatares anime: el modelo puede generar retratos de personajes anime a partir de descripciones simples (p. ej., "pelo azul, ojos verdes, sonriendo"). Adecuado por su entrenamiento específico en rostros anime y su tamaño reducido.
- Ilustración conceptual para juegos o cómics: los artistas pueden usarlo como herramienta de inspiración rápida para diseños de personajes, aprovechando su generación de retratos de alta resolución.
- Prototipado de personajes en estudios de animación: permite generar variaciones de un mismo personaje cambiando las palabras clave, sin necesidad de hardware costoso.
- Herramientas educativas para aprendizaje de difusión: al ser un modelo pequeño y abierto (Apache 2.0), sirve como ejemplo didáctico de arquitecturas U-Net eficientes.
- Investigación en eficiencia de modelos de difusión: su diseño sin self-attention en alta resolución y con DepthwiseConv puede estudiarse como caso de referencia para reducir costes.
- Generación de retratos para juegos de rol o perfiles en redes sociales: el modelo puede producir imágenes de perfil personalizadas con estética anime, dado su dominio específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de métricas como FID, CLIP score u otras comparativas con modelos similares.

## Requisitos de hardware

- VRAM estimada: dado que el modelo tiene 57,2 millones de parámetros, en FP16 ocuparía aproximadamente 114 MB solo en pesos, pero la inferencia de difusión requiere memoria adicional para el VAE y los estados intermedios. Se estima que puede funcionar en GPUs con 2-4 GB de VRAM, aunque no hay datos oficiales.
- GPUs recomendadas: tarjetas de consumo como NVIDIA GTX 1650 (4 GB) o superiores serían suficientes para inferencia básica. Para entrenamiento o ajuste fino, se recomienda al menos una RTX 3060 (12 GB) o similar.
- Al ser un modelo ligero, es viable en CPUs para generación lenta, pero se recomienda GPU para tiempos razonables.
- Opciones de despliegue: al estar integrado con Diffusers, puede usarse con pipelines de Hugging Face. También es posible exportarlo a formatos como ONNX o TensorRT, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (U-Nets eficientes para generación de anime). No se puede realizar una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con rostros anime, por lo que su rendimiento fuera de ese dominio será pobre o fallará.
- No hay información sobre sesgos, pero al entrenarse con datos de fuentes como gelbooru, puede heredar sesgos de género o estilo presentes en esos datasets.
- Riesgo de alucinación en la generación de detalles (p. ej., manos, accesorios) si no están bien representados en los datos.
- No se documentan limitaciones de contexto textual; el text encoder LFM2.5 puede tener un límite de tokens no especificado.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento no tengan restricciones adicionales.
- El autor recomienda entrenar el VAE una época adicional con imágenes de resolución variable para imágenes grandes, lo que sugiere posibles artefactos en resoluciones altas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nebulette/efficient-unet
- Mage-VAE (variante 12ch): https://huggingface.co/nebulette/mage-vae-multichannel/blob/main/12ch.safetensors
- Text encoder LFM2.5: https://huggingface.co/nebulette/lfm-350m-contrastive
- Referencias citadas en el README (no resueltas): 2412.09619, 2603.28713v1, 2606.03715 (posibles papers, no se han localizado en la búsqueda web).
