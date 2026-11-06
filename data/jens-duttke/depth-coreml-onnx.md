# Jens-Duttke/Depth-CoreML-ONNX

## Resumen

Depth-CoreML-ONNX es una colección de cinco modelos de estimación de profundidad monocular reescritos para que el proveedor de ejecución Core ML de ONNX Runtime pueda ejecutar el grafo completo en hardware Apple (Neural Engine, GPU y CPU), en lugar de delegar partes del grafo a la CPU. El autor, Jens-Duttke, no entrena ningún modelo nuevo: toma pesos de repositorios existentes (Depth Anything V2 en sus variantes small, base y large, y dos variantes de MiDaS) y modifica únicamente el grafo ONNX que los rodea para que sea compatible con las restricciones de Core ML.

La motivación es práctica: Core ML solo admite operadores ONNX estándar y trabaja en float16, de modo que los grafos originales contenían operaciones (Gather con índices escalares sobre tensores de rango 5, particiones de ventana en rango 6, ReduceL2, Expand, constantes fuera del rango representable en float16) que forzaban fallbacks a CPU y degradaban el rendimiento en macOS. El repositorio corrige esas incompatibilidades manteniendo los pesos originales intactos y verificando que los mapas de profundidad resultantes coinciden con los del modelo original con una correlación de 0,9999 o superior sobre el proveedor CPU de ONNX Runtime.

El paquete es relevante para desarrolladores que despliegan estimación de profundidad en macOS o iOS mediante ONNX Runtime con el execution provider de Core ML, y que necesitan aceleración completa por hardware sin reentrenar ni recalibrar el modelo. El repositorio ocupa 1,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de estimación de profundidad monocular (Depth Anything V2: encoder DINOv2 + decoder DPT; MiDaS: MiDaS v2.1 small y DPT con backbone Swin2-Tiny) |
| Parametros totales | no disponible (no se publican recuentos por archivo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelos de visión; entrada de imagen, no secuencia de texto) |
| Tipos de cuantizacion | float16 (todos los archivos `_fp16_coreml.onnx`); no se incluyen variantes int8 ni float32 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | por archivo: Apache-2.0 (da-v2-small), CC-BY-NC-4.0 (da-v2-base, da-v2-large), MIT (midas-v21-small_256, midas-dpt-swin2-tiny_256) |
| Formato de pesos | ONNX (`.onnx`) optimizado para el execution provider de Core ML de ONNX Runtime |

## Arquitectura y entrenamiento

No hay entrenamiento propio. Cada archivo conserva los pesos del modelo original y solo se reescribe el grafo ONNX circundante. Los tres modelos Depth Anything V2 emplean un encoder transformer tipo DINOv2 con decoder DPT para regresión densa de profundidad; las dos variantes MiDaS usan MiDaS v2.1 small y DPT con backbone Swin2-Tiny, esta última fijada a entrada de 256x256.

Las modificaciones técnicas documentadas son: conversión de Gather con índices escalares sobre tensores de rango 5 a combinaciones de Slice y Squeeze (Depth Anything V2 small); reescalado de entradas de normalización que exceden el rango de float16 (base, large, swin2-tiny); plegado de constantes y aritmética de formas (midas-v21-small); reescritura de particiones de ventana en rango 5 en lugar de rango 6 y sustitución de ReduceL2 y Expand por operadores estándar (midas-dpt-swin2-tiny). La validación se realizó contra el modelo original en el proveedor CPU de ONNX Runtime, con correlación de los mapas de profundidad igual o superior a 0,9999.

## Capacidades

- Estimación de profundidad monocular densa a partir de una única imagen RGB.
- Ejecución completa del grafo en el Neural Engine, GPU y CPU de Apple mediante el execution provider de Core ML de ONNX Runtime.
- Inferencia en float16, con precisión numérica verificada frente al modelo original (correlación >= 0,9999).
- Tres niveles de calidad/velocidad en la familia Depth Anything V2 (small, base, large).
- Dos alternativas MiDaS con licencia MIT para uso comercial sin restricciones.
- Entrada de resolución fija de 256x256 en `midas-dpt-swin2-tiny_256_coreml.onnx`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje: es exclusivamente un modelo de visión.

## Casos de uso

- Efectos de profundidad en aplicaciones macOS/iOS: uso de `da-v2-small_fp16_coreml.onnx` para generar mapas de profundidad en tiempo real sobre fotos o vídeo capturado por la cámara, aprovechando la ejecución en Neural Engine y la licencia Apache-2.0.
- Reconstrucción 3D y fotogrametría en escritorio Mac: integración de `da-v2-large_fp16_coreml.onnx` en pipelines de Oku3D u otras herramientas de reconstrucción, donde la mayor calidad del modelo large compensa el coste de inferencia.
- Segmentación por profundidad y desenfoque de fondo (bokeh sintético): uso de cualquiera de los modelos Depth Anything V2 para separar primer plano y fondo en editores de imagen, con la ventaja de que el grafo completo se ejecuta en GPU/ANE sin fallbacks a CPU.
- Prototipado rápido en macOS con ONNX Runtime: los archivos `midas-v21-small_256_coreml.onnx` y `midas-dpt-swin2-tiny_256_coreml.onnx`, con licencia MIT, permiten validar productos comerciales sin las restricciones de CC-BY-NC-4.0.
- Automatización de flujos de posproducción: generación por lotes de mapas de profundidad para composición, rotoscopia asistida o estabilización basada en profundidad en estudios que trabajan sobre hardware Apple.
- Investigación en percepción monocular: comparación de las salidas de Depth Anything V2 y MiDaS sobre el mismo conjunto de imágenes con un coste de despliegue bajo, al no requerir GPU dedicada ni CUDA.
- Aplicaciones de realidad aumentada en iOS/macOS: estimación de profundidad en el dispositivo para oclusión y anclaje de objetos virtuales, beneficiándose de la ejecución en Neural Engine.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la correlación entre los mapas de profundidad de los grafos reescritos y los originales sobre el proveedor CPU de ONNX Runtime, igual o superior a 0,9999.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU discreta; el consumo es de memoria unificada en Apple Silicon. El repositorio completo ocupa 1,2 GB, repartido entre los cinco archivos.
- GPU recomendadas: hardware Apple con Neural Engine y GPU integrada (familias M1, M2, M3, M4 y posteriores). No está pensado para GPU NVIDIA ni CUDA.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon; los modelos small y las variantes MiDaS son los más ligeros, mientras que `da-v2-large` es el más exigente en memoria y cómputo.
- Opciones de despliegue: ONNX Runtime con el execution provider de Core ML (requisito para aprovechar las reescrituras del grafo); también puede ejecutarse con otros proveedores de ONNX Runtime, aunque las optimizaciones están orientadas a Core ML.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Depth-CoreML-ONNX (este repo) | no disponible | imagen (256x256 fijo en swin2-tiny) | por archivo (Apache-2.0, CC-BY-NC-4.0, MIT) | ONNX float16 para Core ML | Grafos reescritos para ejecución completa en hardware Apple |
| onnx-community/depth-anything-v2-small | no disponible | imagen | Apache-2.0 | ONNX (fp16 y otras) | Modelo original; puede requerir fallbacks a CPU en Core ML |
| onnx-community/depth-anything-v2-base / large | no disponible | imagen | CC-BY-NC-4.0 | ONNX | Modelos originales; uso no comercial |
| julienkay/sentis-MiDaS | no disponible | imagen (256x256) | MIT | ONNX | Modelos originales MiDaS; orientados a otros runtimes |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no admite instrucciones.
- Los archivos `da-v2-base` y `da-v2-large` están bajo CC-BY-NC-4.0, lo que prohíbe el uso comercial; solo `da-v2-small` (Apache-2.0) y las dos variantes MiDaS (MIT) son aptas para productos comerciales.
- La licencia es por archivo, no global; es obligatorio verificar la licencia del archivo concreto que se despliegue.
- La ejecución óptima depende del execution provider de Core ML; con otros proveedores se pierden las ventajas de las reescrituras y puede haber degradación de rendimiento.
- La cuantización a float16 puede introducir diferencias numéricas en casos límite, aunque la validación reportada es de correlación >= 0,9999.
- `midas-dpt-swin2-tiny_256_coreml.onnx` está fijado a 256x256, lo que limita la resolución de entrada y la calidad en escenas de detalle fino.
- No se publican métricas de sesgo, robustez ni comportamiento en dominios fuera de distribución; la estimación de profundidad monocular es intrínsecamente ambigua en escenas con poca textura, superficies reflectantes o transparencias.
- No hay descargas ni validación comunitaria registrada en el repositorio, por lo que la fiabilidad en producción depende de la verificación propia del usuario.
- El repositorio se creó y actualizó en octubre de 2026 según los metadatos; conviene comprobar la fecha real de publicación antes de adoptarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jens-Duttke/Depth-CoreML-ONNX
- Modelo original Depth Anything V2 small: https://huggingface.co/onnx-community/depth-anything-v2-small
- Modelo original Depth Anything V2 base: https://huggingface.co/onnx-community/depth-anything-v2-base
- Modelo original Depth Anything V2 large: https://huggingface.co/onnx-community/depth-anything-v2-large
- Modelos MiDaS originales: https://huggingface.co/julienkay/sentis-MiDaS
