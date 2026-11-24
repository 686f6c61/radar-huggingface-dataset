# ealekseyevlw/tableformer-accurate-v1-fp16

## Resumen

TableFormer Accurate V1 FP16 ONNX es una exportación a formato ONNX con cuantización FP16 del modelo TableFormer V1 en su variante "accurate", orientada al reconocimiento de estructura de tablas (table-structure recognition). El artefacto lo publica el usuario ealekseyevlw y deriva del modelo original TableFormer V1, desarrollado en el contexto del ecosistema IBM/DeepDesk para comprensión de documentos. El repositorio no contiene código de inferencia ni el modelo en su formato nativo, sino únicamente los grafos ONNX y la configuración necesaria para ejecutarlo con un pipeline compatible.

El modelo resuelve un problema clásico en el procesamiento de documentos: dada una imagen de una tabla, reconstruir su estructura lógica (filas, columnas, celdas y sus cajas delimitadoras). Para ello emplea una arquitectura encoder-decoder: un encoder visual procesa la imagen y un decoder autorregresivo genera la estructura de la tabla, con un tercer grafo dedicado a la decodificación de las cajas (bounding boxes) de las celdas.

La relevancia de esta ficha es doble. Por un lado, documenta una alternativa de despliegue optimizada (FP16 sobre ONNX Runtime) frente a la implementación de referencia en PyTorch, con mejoras de rendimiento reportadas por el autor. Por otro, advierte de que el repositorio es un artefacto de exportación de bajo perfil (0 descargas, 0 likes, 0,1 GB) y de que la información pública disponible es muy limitada: no se publican parámetros, contexto, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder para reconocimiento de estructura de tablas (encoder visual + decoder autorregresivo + decoder de bounding boxes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (exportación ONNX cuantizada a FP16) |
| Idiomas soportados | no disponible |
| Licencia | CDLA-Permissive-2.0 |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, bbox_decoder.onnx) + tm_config.json |

## Arquitectura y entrenamiento

La arquitectura es la de TableFormer V1 en variante "accurate": un encoder que procesa la imagen de la tabla y un decoder autorregresivo que genera la estructura secuencial de la tabla, complementado por un decoder específico de bounding boxes para las celdas. Esta exportación separa el modelo en tres grafos ONNX independientes (encoder, decoder y bbox_decoder) más un fichero de configuración `tm_config.json` que define las entradas y el flujo de decodificación esperado.

No se dispone de información sobre el número de parámetros, el volumen o composición de los datos de entrenamiento, ni sobre si el modelo original empleó RLHF, DPO u otras técnicas de ajuste. La model card solo documenta el proceso de exportación y cuantización desde el modelo TableFormer V1 accurate, e indica explícitamente que el repositorio no incluye código de inferencia. La innovación técnica destacable de esta publicación es de despliegue, no de entrenamiento: la cuantización FP16 del encoder y la recomendación de usar I/O Binding de ONNX Runtime para mantener la caché KV en el dispositivo durante la decodificación.

## Capacidades

- Reconocimiento de estructura de tablas a partir de imágenes: identificación de filas, columnas y celdas.
- Predicción de bounding boxes de celdas mediante el grafo `bbox_decoder.onnx`.
- Decodificación autorregresiva de la estructura de la tabla con gestión de caché KV.
- Ejecución optimizada en GPU mediante ONNX Runtime con FP16 y I/O Binding.
- No se documentan capacidades de generación de texto libre, razonamiento general, código ni matemáticas.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta capacidad multilingüe ni multimodal más allá de la entrada de imagen de tabla.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo recibe la imagen de la tabla del documento y devuelve la estructura de filas, columnas y celdas, lo que permite mapear los valores extraídos por un OCR a campos estructurados. Es adecuado porque su tarea específica es precisamente reconstruir la rejilla lógica de la tabla.
- Extracción de tablas en informes financieros: en pipelines de análisis documental, el `bbox_decoder.onnx` proporciona las coordenadas de cada celda para recortar regiones y aplicar OCR solo donde corresponde, reduciendo coste frente a procesar la página completa.
- Procesamiento por lotes en servidores con GPU: la cuantización FP16 del encoder y el uso de I/O Binding para la caché KV permiten aumentar el throughput en entornos de inferencia ONNX Runtime, según las notas de rendimiento del autor.
- Integración en sistemas de gestión documental (DMS/ECM): al distribuirse como grafos ONNX, puede embeberse en servicios escritos en distintos lenguajes con ONNX Runtime, sin depender de PyTorch en producción.
- Enriquecimiento de bases de conocimiento: convertir tablas escaneadas en estructuras tabulares para su carga en bases de datos o motores de búsqueda, usando el decoder de estructura para delimitar filas y columnas.
- Despliegue en hardware de consumo con FP16: el autor reporta pruebas en una RTX 5090, por lo que el artefacto está pensado para GPUs con soporte FP16, incluyendo estaciones de trabajo locales para prototipos de extracción de tablas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye notas de rendimiento relativas, no métricas absolutas:

| Medicion reportada | Valor |
|---|---|
| Throughput del encoder FP16 frente a FP32 | Aproximadamente 30 % superior |
| Throughput de decodificación con I/O Binding de caché KV (RTX 5090) | Aproximadamente 4× superior |
| Precisión en benchmarks de estructura de tablas (TEDS, mAP, etc.) | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo compacto, pero no se publica el desglose por grafo ni el número de parámetros.
- GPU recomendadas: el autor reporta pruebas en una RTX 5090; se recomienda cualquier GPU con soporte FP16 y CUDA para la ejecución con ONNX Runtime.
- GPU de consumo: probablemente viable en GPUs de consumo con FP16, pero no se confirma con datos de VRAM publicados.
- Opciones de despliegue: ONNX Runtime (con CUDA Execution Provider e I/O Binding para la caché KV); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo encoder-decoder de visión.
- Latencia y throughput: solo se publican mejoras relativas (30 % en encoder, 4× en decodificación con I/O Binding en RTX 5090); no hay valores absolutos.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| TableFormer Accurate V1 FP16 ONNX (este) | Estructura de tablas | no disponible | no disponible | CDLA-Permissive-2.0 | ONNX FP16 |
| TableFormer V1 (original, variante accurate) | Estructura de tablas | no disponible en la información disponible | no disponible | no disponible en la información disponible | PyTorch (formato nativo) |
| Otros reconocedores de estructura de tablas | Estructura de tablas | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas concretas; la comparativa se limita a la relación con el modelo original del que deriva esta exportación.

## Limitaciones y advertencias

- Repositorio de muy bajo perfil: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación comunitaria.
- No incluye código de inferencia: es necesario disponer de un pipeline TableFormer compatible y de la configuración `tm_config.json` para interpretar las entradas y el flujo de decodificación.
- No se publican parámetros, contexto, idiomas soportados ni benchmarks de precisión; no es posible evaluar su calidad frente al modelo original sin pruebas propias.
- Riesgo de alucinación estructural: como decoder autorregresivo, puede generar estructuras de tabla plausibles pero incorrectas en imágenes de baja calidad, tablas rotadas o con celdas combinadas complejas.
- Sesgos: no documentados; al ser un modelo de visión para documentos, puede heredar sesgos de los datos de entrenamiento del TableFormer original (no disponibles).
- Licencia CDLA-Permissive-2.0: permisiva para uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones aplicables a los artefactos derivados del modelo original.
- La recomendación de FP16 y CUDA implica que la ejecución en CPU puede degradar el rendimiento o no estar soportada de forma óptima.
- Fecha de creación del repositorio (2026-11-23) y ausencia de documentación adicional: tratar como artefacto experimental y validar antes de cualquier uso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ealekseyevlw/tableformer-accurate-v1-fp16
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a esta exportación concreta.
