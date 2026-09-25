# 333i/1xDeJPG_realplksr_otf-coreml-ios

## Resumen

1xDeJPG_realplksr_otf for Core ML (iOS) es una conversión a Core ML del modelo de restauración de imagen 1xDeJPG_realplksr_otf, cuyos pesos originales fueron entrenados por Philip Hofmann (Helaman) y publicados en el repositorio Phips/1xDeJPG_realplksr_otf. Se trata de un modelo de superresolución a escala 1x (es decir, no aumenta la resolución) especializado en eliminar artefactos de compresión JPEG y desenfoque manteniendo intactas las dimensiones de la imagen de entrada. El repositorio lo publica el usuario 333i y su único valor añadido es el export a Core ML: los pesos no se han modificado.

La arquitectura del modelo original es RealPLKSR (una variante de PLKSR, red convolucional con bloques de atención parcial de canal), entrenada sobre el dataset nomosv2 con 6.000 imágenes y aumentos generados on the fly (OTF), lo que permite simular degradaciones JPEG reales durante el entrenamiento. El modelo resultante trabaja sobre fotografías y su objetivo declarado es la restauración, no el reescalado.

La relevancia de esta ficha es acotada y conviene ser explícito: no es un modelo de lenguaje, no genera texto ni código, y su interés se limita al despliegue en el ecosistema Apple. Su aportación práctica es que permite ejecutar la restauración en el dispositivo (iPhone, iPad, Mac con Apple Silicon) mediante Core ML, con soporte de CPU, GPU y Neural Engine, sin depender de PyTorch ni de conectividad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PLKSR / RealPLKSR (red convolucional de restauración de imagen) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica; entrada fija de 512 x 512 px (RGB), imágenes mayores procesadas por teselas solapadas |
| Tipos de cuantizacion | fp16 (ML Program). No hay versiones INT8/INT4 ni GGUF publicadas |
| Idiomas soportados | no aplica (modelo imagen a imagen; no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML: `.mlpackage` (ML Program, fp16) y `.mlmodelc` precompilado (zip con `model.json`) |
| Escala | 1x (misma resolución de entrada y salida) |
| Entrada / salida | `image` RGB 512x512 / `upscaled` RGB 512x512 |
| Sistema operativo mínimo | iOS 16 / macOS 13 |
| Unidades de cómputo | Todas (CPU, GPU, Neural Engine) |
| Modelo base | Phips/1xDeJPG_realplksr_otf |
| Pipeline | image-to-image |
| Repositorio | 333i/1xDeJPG_realplksr_otf-coreml-ios (0 descargas, 0 likes) |

## Arquitectura y entrenamiento

El modelo original es un RealPLKSR de escala 1x, una arquitectura convolucional de restauración de imágenes basada en bloques PLKSR (Partial Large Kernel Convolutional Super-Resolution). Según OpenModelDB, el entrenamiento se realizó sobre el dataset nomosv2, con un tamaño de 6.000 imágenes, empleando aumentos generados on the fly (OTF) para sintetizar degradaciones JPEG realistas, y partiendo de un modelo preentrenado (referido como "el modelo 60") como inicialización. La fecha de publicación del modelo original es el 9 de julio de 2024, y su propósito declarado es la restauración de fotografías con artefactos JPEG, con escala 1x y sin cambio de tamaño.

La conversión a Core ML la realizó el usuario 333i con coremltools 9.0, cargando el checkpoint original a través de spandrel. El modelo se ha envuelto para que la entrada sea una imagen RGB escalada a [0, 1] y la salida se recorte (clamp) y reescale a [0, 255] como imagen RGB, de forma que Vision pueda devolver directamente una `VNPixelBufferObservation`. No se ha aplicado ninguna modificación a los pesos ni ninguna técnica de cuantización más allá del fp16 propio del formato ML Program. Las imágenes de tamaño superior a 512x512 se procesan por teselas solapadas de 512x512 que después se recomponen con feathering.

## Capacidades

- Restauración de imagen a escala 1x: elimina artefactos de compresión JPEG (bloqueo, ringing, banding) y desenfoque sin modificar las dimensiones de la imagen.
- Procesado de imágenes mayores mediante teselado solapado con feathering, lo que permite aplicarlo a fotografías de resolución arbitraria.
- Inferencia en dispositivo en iOS 16+ y macOS 13+ usando CPU, GPU y Neural Engine (compute units: all).
- Integración directa con Vision: la salida está preparada para devolverse como `VNPixelBufferObservation`.
- Carga en dos formatos: `.mlpackage` para coremltools o Xcode, y `.mlmodelc` precompilado para carga directa con `MLModel(contentsOf:)` en aplicaciones en producción.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente imagen a imagen.
- No incluye modo de pensamiento, visión (no interpreta contenido, solo restaura píxeles), audio ni generación de texto.

## Casos de uso

- Restauración de fotografías antiguas o recomprimidas en aplicaciones iOS: la app puede pasar la imagen por teselas de 512x512 y recomponerla; al ejecutarse en el Neural Engine, no requiere servidor ni subir la foto a la nube, lo que evita problemas de privacidad.
- Limpieza de imágenes recibidas por mensajería: las fotos reenviadas varias veces acumulan artefactos JPEG severos; un filtro de restauración 1x antes de mostrarlas o guardarlas mejora la percepción de nitidez sin alterar la resolución.
- Preprocesado previo a OCR: reducir el bloqueo y el ringing de un JPEG escaneado o fotografiado mejora la calidad de entrada de un motor de OCR, aunque conviene validar el efecto real porque el modelo está entrenado sobre fotografía, no sobre documentos.
- Capturas de pantalla y material de documentación: las capturas guardadas en JPEG presentan artefactos alrededor de texto y bordes; un paso de restauración 1x limpia esos bordes antes de publicarlas.
- Pipeline de fotografía profesional en macOS: integración como paso previo o posterior en flujos de edición sobre Apple Silicon, aprovechando que el modelo se ejecuta en alrededor de 174 ms por tesela en un Mac de la serie M.
- Procesado por lotes en servidor macOS o granja de Mac mini: al ser Core ML puro, se puede paralelizar por teselas en varias máquinas Apple sin depender de CUDA ni de PyTorch en producción.
- Curado de datasets de imagen: limpiar artefactos de compresión de un corpus de fotografías antes de usarlo para entrenar o evaluar otros modelos de visión, manteniendo la resolución original.
- Edición en tiempo real con restricciones: 174 ms por tesela es suficiente para previsualizaciones bajo demanda, pero no para vídeo a 30 fps sin teselado y paralelización adicionales.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| PSNR frente a la referencia PyTorch | 58,7 dB | Tesela de prueba de 512x512 |
| Diferencia máxima por canal | 1/255 | Misma prueba de verificación |
| Tiempo de inferencia | ~174 ms por tesela | Mac de la serie M, todas las unidades de cómputo activadas |
| PSNR / SSIM sobre datasets de restauración (p. ej. DIV2K, LSDIR) | no disponible | No publicado en la información proporcionada |
| Comparación con otros modelos de restauración JPEG | no disponible | No publicado en la información proporcionada |

Nota: el valor de 58,7 dB no es una medida de calidad de restauración, sino una verificación de equivalencia numérica entre la salida de Core ML y la referencia en PyTorch. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- Plataforma obligatoria: Apple. Core ML con iOS 16 o macOS 13 como mínimo; no hay soporte para CUDA, ROCm ni aceleradores no Apple.
- Aceleración: el modelo declara compatibilidad con CPU, GPU y Neural Engine (compute units: all). El rendimiento óptimo se obtiene en chips con Neural Engine, es decir, Apple Silicon (serie M) y chips A a partir de las generaciones compatibles con iOS 16.
- VRAM / memoria unificada: no disponible. El tamaño exacto del repositorio figura como 0,0 GB en los metadatos de HuggingFace, lo que probablemente refleja un redondeo y no debe interpretarse como una medida del modelo.
- Latencia medida: aproximadamente 174 ms por tesela de 512x512 en un Mac de la serie M con todas las unidades de cómputo activadas. Como referencia orientativa (extrapolación lineal, no medida por el autor), una imagen de 2048x2048 requeriría del orden de 16 teselas, lo que situaría el procesado en torno a 2,8 segundos más el coste de recomposición.
- GPU de consumo: no aplica en el sentido habitual; el modelo no se ejecuta sobre RTX 4090, A100 ni H100. El equivalente práctico es cualquier Mac con Apple Silicon o iPhone/iPad compatible.
- Opciones de despliegue: `coremltools` y Xcode para el `.mlpackage`; `MLModel(contentsOf:)` con el `.mlmodelc` precompilado para aplicaciones en producción; integración con el framework Vision en iOS y macOS. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Throughput: no disponible más allá del dato de latencia por tesela.

## Comparativa con modelos similares

| Modelo | Formato | Escala | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 333i/1xDeJPG_realplksr_otf-coreml-ios | Core ML (`.mlpackage` / `.mlmodelc`) | 1x | PLKSR (RealPLKSR) | CC-BY-4.0 | HuggingFace, 0 descargas, 0 likes |
| Phips/1xDeJPG_realplksr_otf | PyTorch (cargable vía spandrel) | 1x | RealPLKSR | CC-BY-4.0 | HuggingFace |
| Otros convertidores Core ML de modelos de restauración | no disponible | no disponible | no disponible | no disponible | no disponible |

El único comparable del que se dispone de información es el modelo base en PyTorch, del que esta conversión hereda exactamente los pesos. No hay datos en la información proporcionada sobre alternativas equivalentes en formato Core ML, ni sobre parámetros, contexto o rendimiento comparado de otras soluciones.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es un error de categoría.
- Escala 1x: no aumenta la resolución de la imagen. Si se necesita upscaling real (2x, 4x), este modelo no lo cubre.
- Entrada fija de 512x512: cualquier imagen mayor depende del teselado con feathering, lo que puede introducir discontinuidades sutiles en las costuras si la implementación no replica exactamente el esquema previsto.
- Especialización estrecha: el modelo está entrenado sobre nomosv2, un dataset de fotografía, para degradaciones JPEG. Su comportamiento sobre documentos escaneados, ilustraciones, capturas de pantalla, imágenes médicas o material sintético no está validado.
- Riesgo de sobre-suavizado: como todo modelo de restauración generativa o convolucional, puede eliminar textura fina legítima (poros, grano, detalle textil) al confundirla con ruido o artefactos de compresión.
- Alucinación de detalle: aunque el modelo es convolucional y no generativo, puede reconstruir patrones plausibles que no estaban en la imagen original, especialmente en zonas muy degradadas. No debe usarse como evidencia forense.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir la autoría a Philip Hofmann y a indicar la licencia. La conversión mantiene la misma licencia y el mismo requisito de crédito.
- Dependencia de plataforma: requiere iOS 16 o macOS 13 como mínimo y hardware Apple. No hay ruta de despliegue en Linux con GPU NVIDIA.
- Sin cuantizaciones alternativas: solo existe fp16; no hay versión INT8 ni INT4 para reducir memoria o latencia.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes, y los metadatos indican una fecha de creación de 2026-09-25. No hay evidencia de uso en producción ni informes independientes de calidad.
- Sin datos de sesgo: la información proporcionada no incluye análisis de sesgo demográfico, de contenido ni de dominios infrarrepresentados en nomosv2.

## Enlaces

- Repositorio de la conversión Core ML: https://huggingface.co/333i/1xDeJPG_realplksr_otf-coreml-ios
- Modelo original en PyTorch: https://huggingface.co/Phips/1xDeJPG_realplksr_otf
- Ficha en OpenModelDB del modelo original: https://openmodeldb.info/models/1x-DeJPG-realplksr-otf
- Entrada JSON en el repositorio de OpenModelDB: https://github.com/OpenModelDB/open-model-database/blob/main/data/models/1x-DeJPG-realplksr-otf.json
- Perfil del autor de los pesos originales en OpenModelDB: https://openmodeldb.info/users/helaman
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Herramienta de conversión citada (coremltools): no se proporciona enlace en la información disponible
- Cargador del checkpoint original (spandrel): no se proporciona enlace en la información disponible
