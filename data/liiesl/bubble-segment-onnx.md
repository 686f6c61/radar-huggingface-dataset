# Liiesl/bubble-segment-onnx

## Resumen

`Liiesl/bubble-segment-onnx` es una exportación estática en formato ONNX del modelo de segmentación de instancias `mayocream/koharu-yolo26s`, diseñado específicamente para extraer elementos de páginas de manga: paneles, texto de diálogo, bocadillos y onomatopeyas. El autor, Liiesl, ha re-exportado el modelo a una resolución de entrada de 1024×1024 píxeles (frente a los 1280×1280 originales) con el objetivo de reducir el consumo de memoria activa en aproximadamente un 37 %, pasando de unos 600 MB a unos 385 MB de pico de activación. Esta optimización lo hace especialmente adecuado para motores de scanlation en escritorio, entornos con recursos limitados y ejecuciones en CPU o incluso en tiempo de ejecución Rust/WASM.

El modelo conserva los pesos originales (11,437 millones de parámetros) y utiliza el formato ONNX con opset 17, lo que facilita su integración con ONNX Runtime y otros motores compatibles. Su tamaño de archivo es de aproximadamente 40,29 MB. La licencia es AGPL-3.0, lo que condiciona su uso en aplicaciones comerciales cerradas. Es una herramienta relevante para el ecosistema de scanlation y procesamiento de cómics, donde la segmentación automática de elementos es un paso previo común para tareas como traducción, limpieza o re-encuadre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics YOLO) |
| Parametros totales | 11,437 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible (pesos FP32, sin cuantizacion publicada) |
| Idiomas soportados | No disponible (modelo de vision, no de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (archivo .onnx) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX estática del modelo `mayocream/koharu-yolo26s`, que a su vez se basa en la arquitectura YOLO26s de Ultralytics. La exportación se realiza con una resolución de entrada fija de 1024×1024 píxeles en lugar de la nativa de 1280×1280, lo que reduce el tamaño de las activaciones intermedias (máscaras prototipo de 256×256 en lugar de 320×320) y el pico de memoria RAM durante la inferencia. El opset ONNX es 17, lo que permite usar operadores modernos. Los pesos se mantienen en FP32 sin cambios respecto al modelo original.

No se proporciona información detallada sobre los datos de entrenamiento del modelo base ni sobre el proceso de optimización (si se usó RLHF, DPO u otras técnicas). El autor solo indica que los pesos proceden del modelo `koharu-yolo26s` y que se ha realizado una re-exportación a menor resolución. La arquitectura interna sigue el esquema típico de YOLO con detección de objetos y generación de máscaras prototipo para segmentación de instancias.

## Capacidades

- Segmentación de instancias de 4 clases de elementos de páginas de manga: `frame` (paneles), `dialogue_text` (texto de diálogo), `balloon` (bocadillos) y `onomatopoeia_text` (efectos de sonido).
- Detección de objetos con cajas delimitadoras y máscaras de segmentación a 1/4 de la resolución de entrada (256×256 para entrada de 1024).
- Salida de hasta 300 detecciones por imagen, con puntuaciones de confianza y probabilidades por clase.
- Optimizado para inferencia en CPU mediante ONNX Runtime, aunque también puede ejecutarse en GPU con los proveedores CUDA u otros.
- Preprocesamiento estándar de letterbox con relleno de valor 114 (gris YOLO) para mantener la relación de aspecto.
- Compatible con pipelines de scanlation y herramientas de procesamiento de cómics que requieran extracción automática de elementos.

## Casos de uso

- Scanlation (traducción de manga): el modelo puede aislar automáticamente bocadillos y texto de diálogo, permitiendo a los traductores sobrescribir el texto original sin afectar al arte. Su bajo consumo de memoria permite ejecutarlo en equipos modestos durante el flujo de trabajo.
- Limpieza de páginas de manga: al segmentar paneles y texto, se pueden eliminar burbujas o texto no deseado para reutilizar fondos o crear versiones limpias. La segmentación de máscaras facilita la generación de máscaras de recorte para herramientas de edición.
- Archivado y digitalización de cómics: la detección de paneles y su estructura permite indexar páginas, extraer viñetas individuales o generar metadatos para bibliotecas digitales.
- Automatización de OCR en manga: al aislar las regiones de texto (diálogo y onomatopeyas), un OCR especializado puede operar sobre áreas más limpias, mejorando la precisión frente a procesar la página completa.
- Herramientas de edición de cómics: los usuarios pueden seleccionar automáticamente elementos (bocadillos, paneles) para moverlos, redimensionarlos o eliminarlos sin selección manual, agilizando el retoque.
- Motores de renderizado en tiempo real (Rust/WASM): gracias a la exportación ONNX con opset 17 y la reducción de memoria, puede integrarse en aplicaciones web o de escritorio ligeras para previsualización interactiva de segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo proporciona una comparación de consumo de memoria entre la versión original a 1280×1280 y la re-exportación a 1024×1024:

| Metrica | Original (1280) | Re-export (1024) | Delta |
| :--- | :--- | :--- | :--- |
| Pico de RAM de activacion | ~600 MB | ~385 MB | -37 % |
| Tamano de salida de mascaras proto | [1, 32, 320, 320] (50,0 MB) | [1, 32, 256, 256] (32,0 MB) | -36 % |
| Opset ONNX | 12 | 17 | - |

No se indican métricas como mAP, precisión o recall sobre conjuntos de datos de manga. El rendimiento de latencia o throughput tampoco se especifica.

## Requisitos de hardware

- El modelo tiene un tamaño de archivo de aproximadamente 40,29 MB y 11,437 millones de parámetros en FP32, por lo que cabe en la mayoría de GPUs de consumo (p. ej., NVIDIA GTX 1060 con 6 GB o superiores) y en CPUs modernas.
- Para ejecución en CPU, la memoria de activación se reduce a ~385 MB, lo que lo hace viable en sistemas con 4 GB de RAM o menos.
- Es adecuado para entornos embebidos o navegadores web mediante ONNX Runtime WebAssembly (WASM), como se menciona en la model card.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML), Rust con crate `onnxruntime`, C++ con ONNX Runtime, o conversión a otros formatos si se requiere.
- La latencia y el throughput no se han medido públicamente; dependerán del hardware y del proveedor de ejecución.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. El modelo comparte base con `mayocream/koharu-yolo26s` (original a 1280) y con `mednasserallah/manga109-segmentation-bubble-onnx` (que inspiró el concepto de re-exportación a menor resolución). Sin embargo, no hay datos de rendimiento relativos entre ellos. Por tanto, la comparativa se limita a la misma familia:

| Modelo | Resolucion de entrada | Parametros | Formato | Licencia |
| :--- | :--- | :--- | :--- | :--- |
| `mayocream/koharu-yolo26s` | 1280×1280 | 11,437 M | PyTorch (probablemente) | No especificada |
| `Liiesl/bubble-segment-onnx` | 1024×1024 | 11,437 M | ONNX | AGPL-3.0 |

No se puede establecer una comparativa de rendimiento sin datos de benchmarks.

## Limitaciones y advertencias

- La licencia AGPL-3.0 es una licencia copyleft fuerte: cualquier obra derivada o servicio en red que use el modelo debe publicar su código fuente bajo la misma licencia. Esto puede ser restrictivo para uso comercial cerrado.
- El modelo está entrenado específicamente para páginas de manga; su rendimiento en otros tipos de cómics o ilustraciones puede degradarse significativamente.
- La reducción de resolución de 1280 a 1024 puede disminuir la precisión en la detección de elementos muy pequeños o con mucho detalle, aunque no se han publicado métricas que cuantifiquen esta pérdida.
- No se proporcionan datos sobre sesgos o errores sistemáticos del modelo. Como modelo de visión, puede confundir elementos similares (p. ej., onomatopeyas con texto de diálogo) en estilos de dibujo poco comunes.
- La salida incluye hasta 300 detecciones, pero no se especifica un umbral de confianza recomendado; el ejemplo usa 0.25, pero el valor óptimo puede variar según el caso de uso.
- El repositorio no incluye el conjunto de datos de entrenamiento ni información sobre su composición, lo que dificulta evaluar su generalización fuera del dominio manga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Liiesl/bubble-segment-onnx
- Modelo base original: https://huggingface.co/mayocream/koharu-yolo26s
- Referencia para la re-exportación a menor resolución: https://huggingface.co/mednasserallah/manga109-segmentation-bubble-onnx
- Framework Ultralytics YOLO: https://github.com/ultralytics/ultralytics
- Sitio oficial de ONNX: https://onnx.ai/
