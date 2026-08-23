# Rootport/Nz-DWPose

## Resumen

Nz-DWPose es un repositorio de Hugging Face que reúne dos modelos de preprocesamiento para el control de pose en la generación de vídeo, desarrollado por Rootport como parte del ecosistema del plugin Nz-LTX23 para el editor de vídeo AviUtl2. El repositorio contiene una copia íntegra de dos modelos upstream: YOLOX-L, para la detección de personas en vídeo, y DWPose, para la estimación de pose de cuerpo completo (cuerpo, manos y cara). Ambos se distribuyen en formato TorchScript y se emplean como paso previo para extraer la pose (figura de palo) de un vídeo de referencia, que luego sirve de guía para la generación de vídeo con el sistema Nz-Videomni.

No se trata de un modelo nuevo ni entrenado por el autor del repositorio, sino de una redistribución de los trabajos originales de Megvii Inc. (YOLOX) e IDEA-Research (DWPose), con las conversiones a TorchScript realizadas por hr16. Su relevancia radica en que facilita la integración de estos modelos en un flujo de trabajo concreto (Nz-LTX23) sin tener que gestionar dependencias adicionales, y está licenciado bajo Apache-2.0. El repositorio se actualizó por última vez en agosto de 2026 y tiene un tamaño de 0,4 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOX-L (detección de objetos) + DWPose (estimación de pose de cuerpo completo) |
| Parámetros totales | No disponible (no se especifica el número de parámetros en el repositorio) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantización | No disponible (se distribuyen como archivos TorchScript sin cuantización) |
| Idiomas soportados | No aplica (modelo de visión); el repositorio indica japonés e inglés en la documentación |
| Licencia | Apache License 2.0 |
| Formato de pesos | TorchScript (.pt) |

## Arquitectura y entrenamiento

El repositorio contiene dos modelos independientes que trabajan en cadena:

1. **YOLOX-L**: modelo de detección de objetos (personas) desarrollado por Megvii Inc. Detecta las posiciones de las personas en el fotograma.
2. **DWPose**: modelo de estimación de pose de cuerpo completo, basado en el trabajo de IDEA-Research. A partir de las cajas delimitadoras de YOLOX, estima las posiciones de las articulaciones, incluyendo cuerpo, manos y cara. DWPose utiliza una metodología de destilación de dos etapas para mejorar la precisión, y se ofrece en varios tamaños (tiny, small, large, etc.). En este repositorio se incluye la variante `dw-ll_ucoco_384_bs5`, que opera a 384×384 píxeles con batch size 5.

Ambos modelos se distribuyen como archivos TorchScript (`.pt`) convertidos por hr16 a partir de los originales. No se ha realizado ningún entrenamiento ni modificación en este repositorio; es una redistribución íntegra de los modelos upstream.

## Capacidades

- Detección de personas en vídeo mediante YOLOX-L.
- Estimación de pose de cuerpo completo (cuerpo, manos y cara) con DWPose.
- Extracción de esqueletos de pose (representación de "palillo") a partir de vídeo de referencia.
- Integración con el plugin Nz-LTX23 para el control de pose en la generación de vídeo con Nz-Videomni.
- Compatibilidad con el ecosistema ControlNet (DWPose puede reemplazar a OpenPose en pipelines de ControlNet).
- No realiza generación de vídeo ni de imágenes; solo preprocesamiento de pose.

## Casos de uso

- **Generación de vídeo con control de pose**: el modelo extrae la pose de un vídeo de referencia y la usa para guiar la generación de nuevos vídeos con Nz-Videomni en AviUtl2.
- **Animación de personajes**: se puede usar para transferir el movimiento de un actor real a un personaje generado por IA, manteniendo la coherencia de la pose.
- **Preprocesamiento para ControlNet**: DWPose es compatible con ControlNet, por lo que se puede integrar en pipelines de generación de imágenes con control de pose.
- **Análisis de movimiento humano**: la estimación de pose permite extraer datos de movimiento de vídeos para análisis biomecánico o de comportamiento.
- **Edición de vídeo creativa**: en AviUtl2, el control de pose permite generar vídeos que siguen el movimiento de un actor, útil para efectos visuales o retoque.
- **Investigación en visión por computador**: como herramienta de preprocesamiento para proyectos que necesitan detección y pose en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento de los modelos, y no se han encontrado datos de evaluación específicos para esta distribución. Los modelos originales (YOLOX y DWPose) tienen métricas publicadas en sus respectivos repositorios, pero no se reproducen aquí.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la documentación. Dado que los archivos son de 217 MB (YOLOX-L) y 135 MB (DWPose), ambos en formato TorchScript, se espera que puedan ejecutarse en GPUs con poca VRAM (por ejemplo, 4-6 GB), pero no hay cifras confirmadas.
- **GPU recomendadas**: no se especifican; se puede inferir que cualquier GPU moderna con soporte de CUDA es suficiente, pero no hay confirmación.
- **Compatibilidad con GPU de consumo**: probablemente sí, dado el tamaño reducido, pero no se confirma.
- **Opciones de despliegue**: se integra en AviUtl2 mediante el plugin Nz-LTX23; también se puede usar directamente con los archivos TorchScript en entornos PyTorch.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información de rendimiento comparativo en el repositorio. Sin embargo, se pueden comparar conceptualmente con alternativas de estimación de pose:

| Modelo | Tipo | Tamaño | Licencia | Uso |
|---|---|---|---|---|
| DWPose (este repo) | Estimación de pose de cuerpo completo | ~135 MB (archivo TorchScript) | Apache-2.0 | Integrado en AviUtl2/Nz-Videomni |
| OpenPose | Estimación de pose de cuerpo completo | ~200 MB | Apache-2.0 | Alternativa clásica, usado en ControlNet |
| MediaPipe Pose | Estimación de pose | Variable | Apache-2.0 | Ligero, para tiempo real, no incluye manos y cara en el mismo modelo |

DWPose se destaca por su precisión en cuerpo completo (incluye manos y cara) y su integración con ControlNet, lo que lo hace preferible a OpenPose en muchas pipelines.

## Limitaciones y advertencias

- **No es un modelo original**: es una redistribución de modelos de terceros (YOLOX y DWPose); no hay entrenamiento ni modificación propia.
- **Sin garantías**: el repositorio no ofrece soporte técnico ni garantías de funcionamiento; se distribuye tal cual.
- **Limitado a personas**: solo detecta personas, no otros objetos o animales.
- **Sin cuantización**: los archivos TorchScript no están cuantizados, lo que puede limitar la eficiencia en entornos con poca VRAM.
- **Dependencia de AviUtl2**: el caso de uso principal es el plugin Nz-LTX23 para AviUtl2, que es un software de edición de vídeo específico de Windows; no es una solución general.
- **Idiomas**: la documentación está en japonés e inglés; no hay soporte oficial en español.

## Enlaces

- Repositorio Hugging Face: [Rootport/Nz-DWPose](https://huggingface.co/Rootport/Nz-DWPose)
- GitHub de Nz-Videomni (autor Rootport-AI): [https://github.com/Rootport-AI/Nz-Videomni](https://github.com/Rootport-AI/Nz-Videomni)
- Repositorio oficial de DWPose (IDEA-Research): [https://github.com/IDEA-Research/DWPose](https://github.com/IDEA-Research/DWPose)
- Repositorio oficial de YOLOX (Megvii): [https://github.com/Megvii-BaseDetection/YOLOX](https://github.com/Megvii-BaseDetection/YOLOX)
- Conversión TorchScript de YOLOX por hr16: [https://huggingface.co/hr16/yolox-onnx](https://huggingface.co/hr16/yolox-onnx)
- Conversión TorchScript de DWPose por hr16: [https://huggingface.co/hr16/DWPose-TorchScript-BatchSize5](https://huggingface.co/hr16/DWPose-TorchScript-BatchSize5)
- Documentación de DWPose en DeepWiki: [https://deepwiki.com/IDEA-Research/DWPose](https://deepwiki.com/IDEA-Research/DWPose)</think>## Resumen

Nz-DWPose es un repositorio de Hugging Face que reúne dos modelos de preprocesamiento para el control de pose en la generación de vídeo, desarrollado por Rootport como parte del ecosistema del plugin Nz-LTX23 para el editor de vídeo AviUtl2. El repositorio contiene una copia íntegra de dos modelos de terceros: YOLOX-L, para la detección de personas en vídeo, y DWPose, para la estimación de pose de cuerpo completo (cuerpo, manos y cara). Ambos se distribuyen en formato TorchScript y se utilizan como paso previo para extraer la pose de un vídeo de referencia que servirá de guía para la generación de vídeo con el proyecto Nz-Videomni.

No se trata de un modelo nuevo entrenado por el autor, sino de una redistribución de los trabajos originales de Megvii Inc. (YOLOX) e IDEA-Research (DWPose), con las conversiones a TorchScript realizadas por hr16. El repositorio se actualizó por última vez en agosto de 2026 y tiene un tamaño de 0,4 GB. Su relevancia radica en simplificar la integración de estos modelos en un flujo de trabajo concreto (Nz-LTX23), evitando compilaciones manuales, y en estar licenciado bajo Apache-2.0, lo que facilita su uso y redistribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOX-L (detección de objetos) + DWPose (estimación de pose de cuerpo completo) |
| Parámetros totales | No disponible (no se especifica en el repositorio) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantización | No disponible (se distribuyen como TorchScript sin cuantización) |
| Idiomas soportados | No aplica (modelo de visión); documentación en japonés e inglés |
| Licencia | Apache License 2.0 |
| Formato de pesos | TorchScript (.pt) |

## Arquitectura y entrenamiento

El repositorio contiene dos modelos que trabajan en cadena:

1. **YOLOX-L**: modelo de detección de objetos (personas) desarrollado por Megvii Inc. Detecta las posiciones de las personas en cada fotograma del vídeo de referencia. Su archivo es `yolox_l.torchscript.pt` (217,7 MB).
2. **DWPose**: modelo de estimación de pose de cuerpo completo, basado en el trabajo de IDEA-Research. A partir de las cajas delimitadoras de YOLOX, estima las posiciones de las articulaciones, incluyendo cuerpo, manos y cara. La variante incluida es `dw-ll_ucoco_384_bs5.torchscript.pt` (135,1 MB), que opera a una resolución de 384 píxeles con batch size 5. DWPose utiliza una metodología de destilación de dos etapas para mejorar la precisión, y se ofrece en varios tamaños (tiny, small, large, etc.).

No se ha realizado ningún entrenamiento ni modificación en este repositorio; es una redistribución íntegra de los modelos originales. Los archivos se convierten a TorchScript para su uso en el plugin Nz-LTX23.

## Capacidades

- Detección de personas en vídeo mediante YOLOX-L.
- Estimación de pose de cuerpo completo (cuerpo, manos y cara) con DWPose.
- Extracción de esqueletos de pose (representación de palo) a partir de vídeo de referencia.
- Integración con el plugin Nz-LTX23 para el control de pose en la generación de vídeo con AviUtl2 y Nz-Videomni.
- Compatibilidad con el ecosistema ControlNet, ya que DWPose puede reemplazar a OpenPose en pipelines de generación de imágenes.
- No realiza generación de vídeo ni de imágenes; solo preprocesamiento de pose.

## Casos de uso

- **Generación de vídeo con control de pose**: el modelo extrae la pose de un vídeo de referencia y la usa como guía para generar nuevos vídeos con Nz-Videomni en AviUtl2, lo que permite mantener el movimiento de un actor en la salida generada.
- **Animación de personajes**: se puede transferir la pose de un actor real a un personaje generado por IA, manteniendo la coherencia del movimiento en cada fotograma.
- **Preprocesamiento para ControlNet**: en pipelines de generación de imágenes con ControlNet, DWPose se puede usar en lugar de OpenPose para obtener mapas de pose más precisos, especialmente en las manos y la cara.
- **Análisis de movimiento humano**: la estimación de pose permite extraer datos de movimiento de vídeos para análisis biomecánico, estudios de comportamiento o captura de movimiento.
- **Edición de vídeo creativa**: en AviUtl2, el control de pose permite generar vídeos que sigan el movimiento de un actor, útil para efectos visuales, retoque o composición de escenas.
- **Investigación en visión por IA**: sirve como herramienta de preprocesamiento para experimentos que requieren pose de cuerpo completo, aprovechando la integración con PyTorch y TorchScript.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento de los modelos, y no se proporcionan datos comparativos. Los modelos originales (YOLOX y DWPose) tienen publicaciones con métricas en sus repositorios respectivos, pero no se reproducen aquí.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la documentación. Dado que los archivos son de 217,7 MB (YOLOX-L) y 135,1 MB (DWPose), se espera que puedan ejecutarse en GPUs con poca VRAM (probablemente 4-6 GB), pero no hay cifras confirmadas.
- **GPU recomendadas**: no se especifican. Se puede inferir que cualquier GPU moderna con soporte de ejecución de TorchScript es suficiente.
- **Compatibilidad con GPU de consumo**: probablemente sí, dado el tamaño reducido, pero no hay confirmación oficial.
- **Opciones de despliegue**: se integra en AviUtl2 mediante el plugin Nz-LTX23; también se puede usar directamente con los archivos TorchScript en entornos PyTorch.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de una comparativa oficial en el repositorio. Sin embargo, se puede comparar con otras soluciones de estimación de pose:

| Modelo | Tipo | Tamaño | Licencia | Uso |
|---|---|---|---|---|
| DWPose (este repo) | Pose de cuerpo completo + detección | 217,7 MB + 135,1 MB | Apache-2.0 | Integrado en Nz-Videomni / AviUtl2 |
| OpenPose | Pose de cuerpo completo | Variable (~200 MB) | Apache-2.0 | Alternativa clásica, usado en ControlNet |
| MediaPipe Pose | Pose de cuerpo completo | Ligero (varios MB) | Apache-2.0 | Ejecución en tiempo real, no incluye manos en el mismo modelo |

DWPose se destaca por su precisión en cuerpo completo, incluyendo manos y cara, y su integración con ControlNet, lo que lo hace preferible a OpenPose en pipelines de generación de imágenes.

## Limitaciones y advertencias

- **No es un modelo original**: es una redistribución de modelos de terceros (YOLOX y DWPose); no hay entrenamiento ni modificación propia.
- **Sin soporte oficial**: el repositorio no ofrece soporte técnico ni garantías de funcionamiento; se distribuye tal cual.
- **Limitado a personas**: solo detecta personas, no animales ni otros objetos.
- **Sin cuantización**: los archivos TorchScript no están cuantizados, lo que puede limitar la eficiencia en dispositivos con poca memoria.
- **Dependencia de AviUtl2**: el caso de uso principal es el plugin Nz-LTX23 para AviUtl2, que es un software de edición de vídeo específico para Windows; no es una solución general.
- **Documentación limitada**: la documentación está en japonés e inglés; no hay soporte oficial en español.
- **No es un modelo de generación**: no genera vídeo ni imágenes; solo realiza preprocesamiento de pose.

## Enlaces

- Repositorio Hugging Face: [https://huggingface.co/Rootport/Nz-DWPose](https://huggingface.co/Rootport/Nz-DWPose)
- Repositorio de Nz-Videomni (autor Rootport-AI): [https://github.com/Rootport-AI/Nz-Videomni](https://github.com/Rootport-AI/Nz-Videomni)
- Repositorio oficial de YOLOX (Megvii): [https://github.com/Megvii-BaseDetection/YOLOX](https://github.com/Megvii-BaseDetection/YOLOX)
- Repositorio oficial de DWPose (IDEA-Research): [https://github.com/IDEA-Research/DWPose](https://github.com/IDEA-Research/DWPose)
- Conversión TorchScript de YOLOX por hr16: [https://huggingface.co/hr16/yolox-onnx](https://huggingface.co/hr16/yolox-onnx)
- Conversión TorchScript de DWPose por hr16: [https://huggingface.co/hr16/DWPose-TorchScript-BatchSize5](https://huggingface.co/hr16/DWPose-TorchScript-BatchSize5)
- Documentación de DWPose en DeepWiki: [https://deepwiki.com/IDEA-Research/DWPose](https://deepwiki.com/IDEA-Research/DWPose)
