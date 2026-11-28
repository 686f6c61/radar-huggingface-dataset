# massimoYao/supershot-idphoto-modnet-coreml

## Resumen

El modelo `supershot-idphoto-modnet-coreml` es una conversión a Core ML del modelo de segmentación de retratos MODNet, en su variante empleada por el proyecto HivisionIDPhotos para la eliminación de fondos en fotografías de carné. Lo publica el usuario massimoYao dentro de la aplicación SuperShot para iOS, como alternativa empaquetada que se ejecuta en el dispositivo cuando no están disponibles los recursos de fondo alojados por Apple (iOS 26 o superior). El modelo original MODNet procede de ZHKKKe y la variante concreta, `hivision_modnet.onnx`, del repositorio de Zeyi-Lin.

Técnicamente es un modelo de matting de retrato que opera sobre entradas de 512 × 512 píxeles y se distribuye como un `mlprogram` en precisión FP16, compatible con iOS 18 o superior y con la Apple Neural Engine. No es un modelo de lenguaje ni un modelo generativo: su única tarea es producir una máscara alfa que separa a la persona del fondo, lo que permite sustituir el fondo en una foto de identificación sin salir del dispositivo.

Su relevancia es acotada pero concreta: cubre un caso de uso muy específico (recorte de fondos en fotos de carné en iOS) con una licencia permisiva Apache-2.0 y un artefacto compacto de unos 11,8 MB comprimido. No hay información publicada sobre idiomas, datos de entrenamiento detallados ni benchmarks propios en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MODNet (matting de retrato) convertido a Core ML `mlprogram` |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | FP16 (única variante publicada) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML `mlpackage` (archivo `HivisionMODNetF16.mlpackage.zip`, 11.840.173 bytes) |
| Resolución de entrada | 512 × 512 píxeles |
| Compatibilidad | iOS 18 o superior, Apple Neural Engine |
| Pipeline | image-segmentation |
| Tamaño del repo | 0,0 GB (reportado por Hugging Face) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de identificar el modelo de origen como MODNet, una red de matting de retrato. El artefacto publicado es una conversión a Core ML en formato `mlprogram` con pesos en FP16, pensada para ejecutarse en la Apple Neural Engine de dispositivos iOS 18 o posteriores. El modelo deriva del ONNX `hivision_modnet.onnx` del proyecto HivisionIDPhotos, cuya huella SHA-256 se documenta en la model card.

No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens o imágenes, la composición del dataset ni si hubo ajuste fino adicional. Tampoco se documentan innovaciones técnicas propias de esta conversión más allá del empaquetado Core ML y la cuantización FP16. El archivo `HivisionMODNetF16.mlpackage.zip` tiene un SHA-256 publicado (`f8a2bc7d...`) que permite verificar la integridad de la descarga.

## Capacidades

- Segmentación de retrato y generación de máscara alfa para separar a la persona del fondo en fotografías de identificación.
- Matting de precisión con entrada fija de 512 × 512 píxeles.
- Ejecución en el dispositivo (on-device) mediante Core ML, sin necesidad de conectividad.
- Aceleración por Apple Neural Engine en iOS 18 o superior.
- Integración como recurso de respaldo cuando no están disponibles los Apple-Hosted Background Assets de iOS 26 o superior.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- Capacidades multilingües: no aplica.

## Casos de uso

- Eliminación de fondo en fotos de carné dentro de una app iOS: el modelo genera la máscara alfa que permite sustituir el fondo por colores o plantillas de documento oficial, ejecutándose localmente en el dispositivo.
- Procesamiento offline en dispositivos sin red: al ser un `mlprogram` Core ML, la inferencia no requiere servidor, lo que resulta útil en entornos con conectividad limitada o por privacidad de los datos biométricos.
- Respaldo en versiones antiguas de iOS: sirve como fallback para iOS 18 cuando la app no puede acceder a los recursos de fondo alojados por Apple disponibles en iOS 26 o superior.
- Previsualización en tiempo real de recortes: la resolución de 512 × 512 y la aceleración por Neural Engine permiten generar máscaras con latencia baja para mostrar el resultado antes de guardar.
- Automatización de flujos de documentos de identidad: integrado en un pipeline de generación de fotos de carné, permite estandarizar el fondo según los requisitos de cada país sin intervención manual.
- Prototipado de funciones de edición fotográfica: al ser un artefacto compacto de unos 11,8 MB comprimido, se puede empaquetar dentro de la app sin inflar significativamente el binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Ejecución en dispositivos iOS 18 o superior con soporte de Apple Neural Engine.
- No requiere VRAM de GPU de escritorio: está diseñado para inferencia en el dispositivo móvil.
- El paquete comprimido ocupa 11.840.173 bytes; el tamaño descomprimido no está disponible.
- Despliegue mediante Core ML (`mlpackage`), no mediante vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| supershot-idphoto-modnet-coreml | Matting de retrato (MODNet) | 512 × 512 | Core ML `mlpackage` FP16 | Apache-2.0 | Hugging Face |
| ZHKKKe/MODNet (original) | Matting de retrato | no disponible | PyTorch / varios | no disponible en la información | Repositorio GitHub |
| HivisionIDPhotos (`hivision_modnet.onnx`) | Matting de retrato | no disponible | ONNX | Apache-2.0 (según la model card) | GitHub |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en matting de retrato; no sirve para otras tareas de segmentación o generación.
- Entrada fija de 512 × 512 píxeles; resoluciones distintas requieren redimensionado previo.
- Solo se publica la variante FP16 para Core ML; no hay versiones en otras precisiones ni formatos alternativos en este repositorio.
- Dependencia de iOS 18 o superior y de la Apple Neural Engine; no es portable a Android ni a servidores sin conversión adicional.
- No hay información sobre sesgos, precisión en distintos tonos de piel, tipos de pelo o condiciones de iluminación.
- Riesgo de artefactos en los bordes de la máscara en casos difíciles (pelo fino, fondos con colores similares a la ropa), habitual en modelos de matting.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo original MODNet y del proyecto HivisionIDPhotos, ya que la model card no detalla posibles restricciones adicionales.
- El repositorio reporta 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que sugiere que el artefacto podría no estar efectivamente alojado o que las métricas aún no se han actualizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/massimoYao/supershot-idphoto-modnet-coreml
- Repositorio HivisionIDPhotos: https://github.com/Zeyi-Lin/HivisionIDPhotos
- Repositorio MODNet original: https://github.com/ZHKKKe/MODNet
- Licencia del modelo: https://huggingface.co/massimoYao/supershot-idphoto-modnet-coreml/blob/main/LICENSE
