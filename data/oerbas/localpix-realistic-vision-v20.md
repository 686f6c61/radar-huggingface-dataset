# oerbas/localpix-realistic-vision-v20

## Resumen

El modelo `oerbas/localpix-realistic-vision-v20` es una conversión a Core ML del modelo de difusión Realistic Vision V2.0, originalmente desarrollado por SG161222. Esta conversión, creada por el usuario oerbas, está pensada para su uso en la aplicación iOS LocalPix, permitiendo ejecutar generación de imágenes fotorrealistas directamente en el dispositivo, sin necesidad de conexión a servidores externos. El modelo se distribuye como un bundle compilado `.mlmodelc` que incluye el VAE encoder, lo que habilita también la funcionalidad de image-to-image.

La relevancia de este modelo radica en su optimización para el Neural Engine de Apple mediante atención `SPLIT_EINSUM` y paletización de pesos a 6 bits, lo que reduce el tamaño del archivo a 0,9 GB y facilita su despliegue en hardware móvil. Está dirigido a desarrolladores que integran generación de imágenes en aplicaciones iOS y buscan una solución local, privada y de baja latencia. La licencia CreativeML OpenRAIL-M permite uso comercial, aunque con restricciones específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion (UNet + VAE) con atención SPLIT_EINSUM para Apple Neural Engine |
| Parametros totales | no disponible (el modelo original Realistic Vision V2.0 se basa en Stable Diffusion 1.5, pero no se confirma el numero exacto en esta conversion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | Paletizacion de pesos a 6 bits (Core ML) |
| Idiomas soportados | no disponible (el modelo original acepta prompts en ingles, pero no se especifica en la model card) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | Core ML compilado (`.mlmodelc`) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del checkpoint Realistic Vision V2.0, que a su vez es un fine-tuning de Stable Diffusion 1.5. La arquitectura subyacente es un UNet con mecanismo de atención cruzada, típico de los modelos de difusión latente. La conversión se realizó con `coremltools 9` siguiendo el pipeline de Apple (`apple/ml-stable-diffusion`), aplicando la variante `SPLIT_EINSUM` para la atención, que es la recomendada para ejecutar en el Neural Engine. Además, se aplicó paletización de pesos a 6 bits, una técnica de cuantización que reduce el tamaño del modelo manteniendo una calidad aceptable.

No se dispone de información detallada sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El autor de la conversión no aporta datos adicionales al respecto. La conversión en sí no implica reentrenamiento, solo una transformación de formato y optimización para hardware Apple.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto, con especial énfasis en retratos humanos, textura de piel, detalles oculares y cabello.
- Reducción del aspecto "artificial" típico de muchos modelos de difusión, gracias al fine-tuning específico del modelo original.
- Soporte de image-to-image mediante el VAE encoder incluido en el bundle, permitiendo editar o transformar imágenes existentes.
- Ejecución local en dispositivos Apple con Neural Engine, sin necesidad de conexión a internet ni de servidores externos.
- Compatibilidad con el pipeline `text-to-image` de Hugging Face, aunque el formato Core ML requiere un runtime específico (Core ML, no PyTorch).
- Optimización para baja latencia en dispositivos móviles gracias a la cuantización de 6 bits y la atención SPLIT_EINSUM.

## Casos de uso

- Aplicación iOS de generación de retratos: el modelo se integra en LocalPix para que los usuarios creen avatares o retratos fotorrealistas a partir de descripciones textuales, aprovechando la ejecución local para garantizar privacidad y respuesta inmediata.
- Edición de fotografías en el dispositivo: gracias al VAE encoder, se puede usar como herramienta de image-to-image para modificar iluminación, fondo o estilo de una foto existente sin subirla a la nube.
- Prototipado rápido de contenido visual para diseñadores: los desarrolladores pueden generar imágenes de referencia para campañas, storyboards o conceptos de producto directamente en un iPhone o iPad.
- Generación de imágenes para aplicaciones de realidad aumentada: al funcionar sin conexión, es adecuado para generar texturas o elementos visuales en tiempo real dentro de experiencias AR.
- Asistente creativo en apps de dibujo o ilustración: los usuarios pueden describir una escena y obtener una base fotorrealista sobre la que trabajar posteriormente.
- Automatización de contenido para redes sociales: creadores de contenido pueden generar imágenes personalizadas para publicaciones sin depender de servicios externos, reduciendo costes y tiempos de espera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como FID, CLIP score o comparativas con otros modelos en la model card ni en los resultados de búsqueda. El autor no proporciona datos de rendimiento cuantitativos (latencia, throughput, calidad perceptual) para esta conversión Core ML.

## Requisitos de hardware

- Dispositivos Apple con chip A12 Bionic o posterior, ya que el Neural Engine es necesario para ejecutar la atención SPLIT_EINSUM de forma eficiente.
- iOS 15.0 o superior (requisito típico de Core ML para modelos compilados con coremltools 9).
- Memoria RAM: no se especifica, pero al ser un modelo de 0,9 GB, se estima que puede ejecutarse en dispositivos con 3 GB de RAM o más, aunque no se confirma.
- Almacenamiento: aproximadamente 0,9 GB para el bundle `.mlmodelc`.
- Opciones de despliegue: integración directa en apps iOS mediante Core ML, usando el runtime de Apple. No es compatible con vLLM, llama.cpp, Ollama o TGI, ya que esos entornos están orientados a modelos de lenguaje y no a modelos de difusión en formato Core ML.
- Latencia y throughput: no disponibles. Dependerá del dispositivo concreto y de la resolución de salida.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Contexto | Licencia | Uso en iOS |
|---|---|---|---|---|---|
| oerbas/localpix-realistic-vision-v20 (este) | Core ML (6-bit) | no disponible | no aplica | CreativeML OpenRAIL-M | Sí, optimizado para ANE |
| SG161222/Realistic_Vision_V2.0 (original) | PyTorch (safetensors) | ~860M (estimado, no confirmado) | no aplica | CreativeML OpenRAIL-M | No directamente, requiere conversión |
| takinai/Realistic_Vision_V20 | PyTorch (safetensors) | no disponible | no aplica | CreativeML OpenRAIL-M | No directamente |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia es el formato: la versión Core ML está lista para producción en dispositivos Apple, mientras que las versiones PyTorch requieren conversión adicional.

## Limitaciones y advertencias

- El modelo original Realistic Vision V2.0 puede presentar sesgos en la representación de ciertos grupos étnicos o de género, al estar entrenado con datasets que no son completamente representativos. No se ha realizado una auditoría de sesgos en esta conversión.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar detalles irreales o inconsistentes, especialmente en manos, texto o fondos complejos.
- La cuantización a 6 bits puede degradar ligeramente la calidad de la imagen en comparación con el modelo original en precisión completa, aunque no se han publicado evaluaciones que cuantifiquen esta pérdida.
- La licencia CreativeML OpenRAIL-M permite uso comercial, pero impone restricciones: no se puede utilizar para generar contenido ilegal, difamatorio o que promueva violencia u odio. Además, exige redistribuir bajo la misma licencia si se modifica el modelo.
- El modelo solo funciona en el ecosistema Apple (iOS, iPadOS, macOS) y no es portable a otros entornos sin una reconversión a formatos como ONNX o PyTorch.
- No se garantiza la compatibilidad con versiones futuras de Core ML o iOS; el bundle compilado puede requerir actualizaciones si Apple cambia su runtime.

## Enlaces

- [Modelo en Hugging Face: oerbas/localpix-realistic-vision-v20](https://huggingface.co/oerbas/localpix-realistic-vision-v20)
- [Modelo original: SG161222/Realistic_Vision_V2.0](https://huggingface.co/SG161222/Realistic_Vision_V2.0)
- [Variante alternativa: takinai/Realistic_Vision_V20](https://huggingface.co/takinai/Realistic_Vision_V20)
- [Página de Realistic Vision V6.0 B1 en Civitai (referencia de la familia de modelos)](https://civitai.com/models/4201/realistic-vision-v60-b1)
- [Recurso externo sobre Realistic Vision V2.0](https://airesourcehub.net/models/realistic-vision-v20)
- [API de Stable Diffusion con Realistic Vision V20](https://stablediffusionapi.com/models/realistic-vision-v20-2047)
- [Repositorio de conversión de Apple: apple/ml-stable-diffusion](https://github.com/apple/ml-stable-diffusion)
