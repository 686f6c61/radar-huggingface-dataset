# RomeDan/SageAttention3-Windows-Blackwell-Wheels

## Resumen

SageAttention3 es una implementación de atención con cuantización microscaling FP4 diseñada específicamente para las GPUs NVIDIA Blackwell (arquitectura SM120). Fue desarrollada por el grupo thu-ml (Tsinghua University) y publicada en el paper arXiv 2505.11594. Su objetivo es acelerar la inferencia de modelos de generación de vídeo e imágenes mediante una cuantización agresiva de las operaciones de atención, manteniendo una precisión suficiente para tareas de generación. Este repositorio concreto, `RomeDan/SageAttention3-Windows-Blackwell-Wheels`, no contiene el código fuente ni los pesos de un modelo, sino una rueda (wheel) precompilada de SageAttention3 para Windows, CUDA 13.0 y Python 3.12, orientada a las GPUs de la serie RTX 50 (Blackwell). La relevancia actual radica en que la versión oficial de SageAttention3 es Linux-first, y esta compilación facilita su uso en entornos Windows sin necesidad de compilar desde código, evitando errores comunes de compilación con MSVC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Atencion con cuantizacion microscaling FP4 (SageAttention3) para GPUs Blackwell (SM120) |
| Parametros totales | no disponible (es una libreria de aceleracion, no un modelo de pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo al que se aplique) |
| Tipos de cuantizacion | FP4 microscaling (con escalado por bloque) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se distribuye como wheel de Python, no como pesos de modelo) |

## Arquitectura y entrenamiento

SageAttention3 es una implementación de la operación de atención (attention) que utiliza cuantización microscaling FP4 para reducir el uso de memoria y aumentar el throughput en GPUs Blackwell. A diferencia de las implementaciones estándar de atención que operan en FP16 o BF16, SageAttention3 cuantiza las matrices de consulta, clave y valor a FP4 con un factor de escala por bloque, lo que permite un procesamiento más rápido y con menor consumo de memoria. El paper original describe su uso tanto en inferencia como en preentrenamiento, con un modelo de 400M de parámetros para validar la estabilidad del entrenamiento. La implementación está optimizada para las instrucciones específicas de las GPUs Blackwell (SM120), que soportan operaciones FP4 nativas. No se dispone de información sobre el dataset de entrenamiento de la librería en sí, ya que no es un modelo entrenado sino una función de aceleración.

## Capacidades

- Aceleración de la atención en modelos de generación de vídeo e imágenes, con cuantización FP4 microscaling.
- Compatibilidad probada con modelos de generación de vídeo como CogVideoX-2B, HunyuanVideo y Mochi.
- Compatibilidad con modelos de generación de imágenes como Flux y Stable Diffusion 3.5.
- Soporte para Windows (en esta compilación concreta) con CUDA 13.0 y Python 3.12.
- No garantiza aceleración sin pérdidas para todos los modelos; para algunos se recomienda usar SageAttention2++ de forma selectiva en ciertas capas o pasos de tiempo.
- No es un modelo de lenguaje ni de visión; no genera texto, imágenes ni vídeo por sí mismo.

## Casos de uso

- Inferencia de modelos de difusión de vídeo en Windows: permite ejecutar CogVideoX, HunyuanVideo o Mochi en una GPU RTX 50 con mayor velocidad de generación, gracias a la atención cuantizada FP4.
- Generación de imágenes con Flux o Stable Diffusion 3.5 en entornos Windows: reduce el tiempo de muestreo y el uso de memoria VRAM durante la atención.
- Prototipado y desarrollo local en Windows: los desarrolladores que trabajan en Windows pueden integrar SageAttention3 sin necesidad de compilar desde código fuente, evitando errores de compilación con MSVC.
- Despliegue de servicios de generación en entornos Windows con GPUs Blackwell: permite servir modelos de generación con menor latencia por paso de inferencia.
- Investigación sobre cuantización de atención: sirve como referencia para estudiar el impacto de la cuantización FP4 microscaling en la calidad de salida de modelos generativos.
- Optimización de pipelines de vídeo e imagen en producción: cuando se requiere un balance entre velocidad y calidad, se puede aplicar SageAttention3 en capas o pasos específicos, dejando el resto con atención estándar o SageAttention2++.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta compilación concreta de Windows. El paper original de SageAttention3 (arXiv 2505.11594) reporta mejoras de velocidad y reducción de memoria en GPUs Blackwell, pero esos datos no se incluyen en la documentación de este repositorio. Se recomienda consultar el paper para métricas detalladas.

## Requisitos de hardware

- GPU NVIDIA con arquitectura Blackwell (SM120), es decir, serie RTX 50 (por ejemplo, RTX 5090, RTX 5080).
- CUDA 13.0 instalado en el sistema.
- Python 3.12 y PyTorch 2.9.0 con soporte CUDA 13.0 (según el nombre del wheel).
- La VRAM necesaria depende del modelo al que se aplique la atención; SageAttention3 reduce el consumo de memoria en comparación con atención estándar, pero no se especifica un valor fijo.
- No se indican requisitos de RAM ni de almacenamiento adicionales.
- Opciones de despliegue: se integra como una librería Python dentro de un pipeline de inferencia existente; no es un servidor independiente.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar esta compilación con otras alternativas de la misma categoría. La categoría sería "implementaciones de atención cuantizada para Blackwell", donde existen otras versiones como SageAttention2 o FlashAttention-3, pero no se proporcionan datos comparativos en la documentación de este repositorio.

## Limitaciones y advertencias

- SageAttention3 no garantiza aceleración sin pérdidas para todos los modelos; en algunos casos puede degradar la calidad de la salida.
- Esta compilación es específica para Windows, CUDA 13.0 y Python 3.12; no es compatible con otras configuraciones.
- No es un modelo de lenguaje ni de generación; es una librería de aceleración que debe integrarse en un pipeline existente.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la compatibilidad con los modelos a los que se aplique (por ejemplo, los modelos de difusión pueden tener sus propias licencias).
- No se han reportado sesgos ni riesgos de alucinación, ya que no es un modelo generativo.
- Para producción, se recomienda validar la calidad de salida en el modelo específico antes de adoptar SageAttention3 de forma global.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/RomeDan/SageAttention3-Windows-Blackwell-Wheels
- Repositorio de GitHub con build para Windows: https://github.com/sjh00/Sageattention3_Blackwell_Windows
- Repositorio de GitHub con instrucciones de uso: https://github.com/sdbds/SageAttention-for-windows/tree/main/sageattention3_blackwell
- Paper original de SageAttention3: https://arxiv.org/html/2505.11594v1
- Documentación de SageAttention en DeepWiki: https://deepwiki.com/thu-ml/SageAttention/2.4-sageattention3-(blackwell-fp4)
