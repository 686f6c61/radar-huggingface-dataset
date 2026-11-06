# alegauss/modelado-models

## Resumen

Modelado models (ONNX) es una colección de modelos convertidos al formato ONNX que el autor (alegauss) publica para su aplicación de escritorio Modelado, cuyo objetivo es convertir una fotografía de un objeto en una malla 3D ejecutándose en Windows, ya sea con DirectML sobre GPU o directamente en CPU. No se trata de un modelo único entrenado desde cero, sino de un paquete de artefactos de inferencia derivados de pesos de terceros (TripoSR, Depth Anything V2, U-2-Net y Real-ESRGAN), reexportados y verificados contra sus implementaciones originales en PyTorch.

El repo resuelve un problema de despliegue más que de investigación: empaquetar en un único conjunto de ficheros ONNX todo el pipeline image-to-3D (eliminación de fondo, estimación de profundidad, codificación a triplano, decodificación de densidad y color, extracción de malla y reescalado), con un `manifest.json` que registra tamaño y SHA-256 de cada archivo para que la aplicación rechace binarios alterados. El tamaño total del repositorio es de 2,9 GB.

Es relevante para desarrolladores que necesiten ejecutar reconstrucción 3D a partir de una imagen en entornos Windows sin cadena de herramientas CUDA, o en máquinas sin GPU dedicada, aprovechando DirectML o el backend de CPU de ONNX Runtime. La ficha describe, por tanto, el conjunto de artefactos y su función dentro del pipeline, no un modelo fundacional con contexto o capacidades generativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de varios modelos: TripoSR (transformer encoder + decoder de triplano), Depth Anything V2 Small (ViT de estimación de profundidad), U-2-Net (U-Net de segmentación), Real-ESRGAN x4plus (RRDBNet de superresolución) |
| Parametros totales | No disponible (no se publica el recuento de parámetros de cada componente) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la entrada es una imagen de 512 x 512 píxeles) |
| Tipos de cuantizacion | Precisión fp32 y fp16 según componente (ver tabla de variantes); no se documentan cuantizaciones int8 ni GGUF |
| Idiomas soportados | No disponible (no aplica; el pipeline no procesa texto) |
| Licencia | `other` / `per-model`: cada componente conserva su licencia upstream (MIT, Apache-2.0, BSD-3-Clause) |
| Formato de pesos | ONNX |

Variantes publicadas por componente:

| Modelo | Tarea | Variantes | Licencia |
|---|---|---|---|
| triposr-encoder | image-to-triplane | fp32 (1675 MB), fp16 (839 MB) | MIT |
| triposr-decoder | triplane-decoder | fp32 (0,2 MB) | MIT |
| depth-anything-v2-small | depth | fp32 (99 MB), fp16 (50 MB) | Apache-2.0 |
| u2net | background-removal | fp32 (176 MB) | Apache-2.0 (pesos U-2-Net), MIT (export rembg) |
| realesrgan-x4plus | upscale | fp32 (67 MB), fp16 (34 MB) | BSD-3-Clause |

## Arquitectura y entrenamiento

El paquete no entrena ningún modelo propio: cada artefacto se convierte desde los pesos originales del proyecto upstream correspondiente y se valida numéricamente contra PyTorch mediante el script `scripts/export_models.py`. El núcleo del pipeline es TripoSR, dividido en dos grafos ONNX: el encoder transforma una foto de 512 x 512 píxeles de un objeto en un triplano, y el decoder devuelve densidad y color en cualquier punto de ese triplano; la aplicación extrae la malla final mediante marching cubes. Alrededor de ese núcleo se sitúan Depth Anything V2 Small para estimación de profundidad, U-2-Net para eliminación de fondo y Real-ESRGAN x4plus para reescalado.

No se documentan en la información disponible los volúmenes de datos de entrenamiento, la composición de los datasets ni si los modelos upstream emplearon RLHF o DPO, ya que se trata de modelos de visión y reconstrucción 3D, no de lenguaje. La innovación técnica destacable es de ingeniería de despliegue: exportación ONNX con variantes fp32 y fp16, verificación de integridad por SHA-256 en `manifest.json` y ejecución sobre DirectML o CPU en Windows.

## Capacidades

- Reconstrucción 3D a partir de una única imagen (image-to-3D) mediante TripoSR y extracción de malla con marching cubes.
- Estimación de profundidad monocular con Depth Anything V2 Small.
- Eliminación de fondo de la imagen de entrada con U-2-Net.
- Superresolución x4 con Real-ESRGAN x4plus para mejorar la imagen antes del proceso.
- Ejecución en Windows con DirectML o en CPU mediante ONNX Runtime.
- Verificación de integridad de los pesos mediante hash SHA-256 en `manifest.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de capacidades multilingües ni de modo thinking, visión general o audio más allá del pipeline de imagen a malla descrito.

## Casos de uso

- Digitalización rápida de objetos físicos: un usuario fotografía un objeto con el móvil, elimina el fondo con U-2-Net y obtiene una malla 3D lista para impresión o visualización, todo en local sobre Windows.
- Prototipado en estudios de modelado 3D: generar una base de malla aproximada a partir de una referencia fotográfica antes de retopologizar manualmente en Blender u otro software.
- Aplicaciones de escritorio sin GPU dedicada: el pipeline puede ejecutarse en CPU con ONNX Runtime, lo que permite distribuir la herramienta en equipos de oficina convencionales.
- Catalogación de productos en comercio electrónico: convertir fotos de catálogo en modelos 3D para visores web o configuradores, usando la variante fp16 para reducir el peso del paquete distribuido.
- Educación y demostraciones: explicar el funcionamiento de un pipeline image-to-3D completo (segmentación, profundidad, triplano, marching cubes) con artefactos verificables y de código abierto.
- Integración en herramientas de realidad aumentada: generar mallas ligeras a partir de fotos para previsualizaciones en entornos AR donde no se requiere alta fidelidad geométrica.
- Preprocesado en pipelines de captura: usar Depth Anything V2 Small y Real-ESRGAN x4plus de forma aislada como etapas de mejora y estimación de profundidad en otros flujos de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el componente más pesado es `triposr-encoder` (1675 MB en fp32, 839 MB en fp16), por lo que la inferencia completa en fp16 requiere del orden de 1-2 GB de memoria si se ejecuta en GPU, aunque esta cifra no está confirmada en la documentación.
- GPU recomendadas: no se especifican modelos concretos; el pipeline está pensado para DirectML en Windows, lo que cubre GPU AMD, Intel y NVIDIA compatibles con DirectX 12.
- GPU de consumo: al no requerir CUDA y poder ejecutarse en CPU, cabe en equipos sin GPU dedicada; en GPU de consumo el requisito principal es soporte de DirectML.
- Opciones de despliegue: ONNX Runtime con ejecución DirectML o CPU; la aplicación Modelado actúa como front-end de escritorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| Modelado models (este paquete) | Pipeline image-to-3D empaquetado en ONNX | Imagen 512 x 512 | Malla 3D | per-model (MIT, Apache-2.0, BSD-3-Clause) | ONNX |
| TripoSR (stabilityai) | Modelo image-to-3D original | Imagen | Malla 3D | MIT | PyTorch (safetensors) |
| Depth Anything V2 Small | Estimación de profundidad | Imagen | Mapa de profundidad | Apache-2.0 | PyTorch, ONNX |
| Real-ESRGAN x4plus | Superresolución | Imagen | Imagen x4 | BSD-3-Clause | PyTorch, ONNX |

La diferencia principal frente a los proyectos upstream es el empaquetado: Modelado models ofrece los artefactos ya convertidos y verificados para ONNX Runtime en Windows, mientras que los originales se distribuyen habitualmente como pesos PyTorch. No se dispone de datos de rendimiento comparativo entre ambas opciones.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no admite instrucciones en lenguaje natural.
- La reconstrucción 3D a partir de una sola imagen produce geometría aproximada; las partes ocluidas del objeto se infieren y pueden ser incorrectas.
- La licencia es `other` con esquema `per-model`: cada componente conserva su licencia upstream, por lo que el uso comercial exige revisar individualmente MIT, Apache-2.0 y BSD-3-Clause, así como las condiciones del export de rembg para U-2-Net.
- La aplicación rechaza ficheros cuyo SHA-256 no coincida con `manifest.json`, lo que impide modificar o recuantizar los pesos sin actualizar el manifiesto.
- El pipeline está orientado a Windows con DirectML o CPU; no se documenta soporte para otros backends de aceleración.
- Riesgo de alucinación geométrica: el modelo puede generar detalles plausibles pero inexistentes en la fotografía original.
- No se documentan sesgos específicos ni limitaciones idiomáticas, al no tratar texto ni datos personales de forma directa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alegauss/modelado-models
- Proyecto Modelado en GitHub: https://github.com/alegauss/modelado
- TripoSR: https://huggingface.co/stabilityai/TripoSR
- Depth Anything V2 Small: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- U-2-Net: https://github.com/xuebinqin/U-2-Net
- Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
