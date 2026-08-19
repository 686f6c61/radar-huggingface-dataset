# marshadbits/qcm-scan

## Resumen

qcm-scan es un paquete de software de escaneo multi-código (QR, códigos de barras y OCR) desarrollado por el usuario marshadbits, publicado en HuggingFace como repositorio de modelo. Su objetivo es lograr un rendimiento comparable al de Dynamsoft en el escaneo de múltiples códigos por imagen, con robustez frente a desenfoque, brillo y perspectiva, pero utilizando únicamente componentes propios ("in-metal"), sin depender de SDKs o decodificadores de terceros. El sistema sigue una arquitectura híbrida de detección, rectificación y decodificación, combinando cabezas aprendidas (SceneLocalizer, corner head, OCR) con decodificadores clásicos puros en enteros para EAN-13/UPC-A y QR. El repositorio tiene un tamaño de 0,4 GB y se encuentra en una fase temprana de desarrollo: algunos componentes están implementados y probados, pero otros (SceneLocalizer, corner head, QR grid head, OCR expert) están pendientes de entrenamiento. No se especifican parámetros de red, contexto ni licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: detección → rectificación → decodificación (SceneLocalizer, corner head, homografía DLT, decodificadores clásicos y cabezas aprendidas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el OCR menciona Union14M-L, pero no se detallan idiomas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene código y posiblemente checkpoints, pero no se especifica) |

## Arquitectura y entrenamiento

La arquitectura se describe como un pipeline híbrido en cinco etapas: (1) SceneLocalizer, una cabeza aprendida que detecta todos los códigos en una sola pasada sobre un sustrato "Soliton/lattice2d", produciendo presencia por fila, simbología e intervalos x; (2) una cabeza de esquinas aprendida que reencuadra cada caja detectada y genera tokens de bytes Z256; (3) rectificación mediante homografía DLT de 4 puntos implementada en el módulo `qcm_scan/geometry/homography.py`; (4) decodificación clásica primero: EAN-13/UPC-A mediante votación de líneas de escaneo en enteros puros (portado de `barcode.rs`) y QR con muestreo de cuadrícula, corrección de errores Reed-Solomon completa, todas las máscaras, niveles EC L/M/Q/H y modos numérico, alfanumérico y byte para versiones v1–5; (5) un experto OCR (TASK-033) para texto de escena con vocabulario de bytes Z256. Los componentes aprendidos (SceneLocalizer, corner head, QR grid head, OCR expert) están pendientes de entrenamiento, según el estado del proyecto. No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens ni técnicas como RLHF o DPO.

## Capacidades

- Escaneo de códigos QR (versiones 1–5) con corrección de errores Reed-Solomon completa, todas las máscaras y niveles EC L/M/Q/H.
- Decodificación de códigos de barras EAN-13 y UPC-A mediante votación de líneas de escaneo en enteros puros.
- Detección de múltiples códigos en una misma imagen (varios códigos por fotograma, simbologías mixtas).
- Robustez a desenfoque, brillo y perspectiva gracias a la rectificación por homografía.
- OCR de texto de escena (pendiente de entrenamiento del experto TASK-033).
- API de escaneo clásico sobre regiones conocidas (`MultiScanner.scan_regions`), que funciona sin necesidad de checkpoints entrenados.
- Pipeline completo `scan()` que requiere los checkpoints del SceneLocalizer (actualmente bloqueado).

## Casos de uso

- Inventario de almacén: escanear múltiples códigos de barras en una misma foto de estantería, reduciendo el tiempo de captura manual. El sistema detecta y decodifica varios códigos en una sola pasada, lo que agiliza el recuento de existencias.
- Punto de venta (POS): lectura de códigos EAN-13/UPC-A en productos con etiquetas dañadas o con brillo, gracias a la robustez frente a condiciones adversas y a la rectificación de perspectiva.
- Logística y paquetería: escaneo de códigos QR en etiquetas de envío junto con códigos de barras lineales, en entornos con iluminación variable. La capacidad de manejar simbologías mixtas en un mismo fotograma es clave.
- Aplicaciones de pago móvil: lectura de códigos QR de pago desde la cámara del teléfono, con corrección de errores para códigos parcialmente dañados.
- Automatización de procesos de calidad: verificación de que un producto lleva el código correcto comparando el resultado del escaneo con una base de datos, usando la API clásica sobre regiones conocidas.
- Extracción de texto de escena: una vez entrenado el experto OCR, podría utilizarse para leer números de serie, fechas de caducidad o texto impreso en envases, complementando la lectura de códigos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un objetivo de rendimiento "Dynamsoft-class" (muchos códigos por fotograma, simbologías mixtas, robustez a desenfoque/brillo/perspectiva), pero no se aportan métricas numéricas.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware en la documentación proporcionada. El repositorio tiene un tamaño de 0,4 GB, lo que sugiere que los pesos de los modelos aprendidos (una vez entrenados) podrían caber en GPUs de consumo, pero no se especifican VRAM, GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.). Tampoco se indican latencias ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación. El autor menciona a Dynamsoft como referencia de rendimiento, pero Dynamsoft es un SDK comercial, no un modelo de IA de código abierto. No se pueden establecer comparaciones con otros modelos de escaneo sin datos adicionales.

## Limitaciones y advertencias

- El pipeline completo `scan()` está bloqueado: el SceneLocalizer (TASK-035) aún no ha sido entrenado, por lo que la detección automática de códigos no funciona de extremo a extremo.
- Los componentes aprendidos (corner head, QR grid head, OCR expert) están pendientes de entrenamiento; solo la ruta clásica sobre regiones conocidas está operativa.
- No se especifica la licencia, por lo que no se puede determinar si el uso comercial está permitido.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un sistema de visión, el riesgo de alucinación se traduce en falsos positivos en la detección de códigos, pero no se ha evaluado.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto muy reciente y sin validación externa.
- La documentación menciona un sustrato "Soliton/lattice2d" y tokens Z256, pero no se explican en detalle; su reproducibilidad es incierta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/marshadbits/qcm-scan
