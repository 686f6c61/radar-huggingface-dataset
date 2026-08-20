# globalnebula/adaface-ir50-ms1mv2-onnx

## Resumen

AdaFace IR-50 (MS1MV2) es un modelo de reconocimiento facial basado en la arquitectura IR-50 (una variante de ResNet-50) con el mecanismo de margen adaptativo a la calidad propuesto por Kim et al. en CVPR 2022. El modelo genera un embedding facial de 512 dimensiones que permite verificación e identificación de personas mediante comparación por similitud coseno. Esta versión concreta es una exportación a ONNX del checkpoint oficial de PyTorch, sin cambios en los pesos, pensada para su ejecución con `onnxruntime` en CPU o CUDA sin dependencia de PyTorch en inferencia.

El modelo está entrenado sobre el dataset MS1MV2, un conjunto de datos de caras a gran escala ampliamente utilizado en investigación. Su relevancia actual radica en que ofrece una alternativa ligera y portable para sistemas de reconocimiento facial en producción, con un tamaño de repositorio de solo 0.2 GB y una diferencia máxima de salida frente al modelo original de aproximadamente 4.3e-07, lo que garantiza fidelidad en la conversión. La entrada esperada es una imagen de 112×112 píxeles alineada según el template de ArcFace, en formato BGR y normalizada con `(x - 127.5) / 127.5`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IR-50 (ResNet-50 modificado) con margen adaptativo de calidad (AdaFace) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (exportacion ONNX estandar, sin cuantizacion documentada) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | adaface-ms1mv2 (codigo MIT, pesos con restricciones del dataset MS1MV2) |
| Formato de pesos | ONNX (archivo .onnx, opset 17) |

## Arquitectura y entrenamiento

El modelo emplea una red residual IR-50 (Improved ResNet) con 50 capas, adaptada para el dominio facial. La innovación principal de AdaFace es el margen adaptativo: en lugar de usar un margen fijo en la pérdida de clasificación (como ArcFace o CosFace), el margen se ajusta dinámicamente según la calidad de la imagen de entrada. Esto permite que el modelo sea más robusto ante variaciones de iluminación, desenfoque o baja resolución, mejorando el rendimiento en condiciones del mundo real.

El entrenamiento se realizó sobre MS1MV2, un dataset con aproximadamente 5.8 millones de imágenes de 85.000 identidades, utilizando la pérdida de margen adaptativo propuesta en el paper. No se menciona el uso de RLHF, DPO ni técnicas de alineación, ya que es un modelo de visión supervisado clásico. La exportación a ONNX mantiene la misma topología y pesos, con una entrada de forma `(batch, 3, 112, 112)` y salida `(batch, 512)`. El grafo tiene eje de batch dinámico, lo que permite procesar lotes de tamaño variable.

## Capacidades

- Generación de embeddings faciales de 512 dimensiones para verificación (comparación por similitud coseno) e identificación (búsqueda en base de datos).
- Reconocimiento facial robusto a variaciones de calidad de imagen gracias al margen adaptativo.
- Inferencia en CPU o GPU mediante `onnxruntime`, sin necesidad de PyTorch en tiempo de ejecución.
- Preprocesamiento específico: alineación facial según template de ArcFace (5 puntos) y normalización BGR con `(x - 127.5) / 127.5`.
- Salida L2-normalizada, lista para comparación coseno directa.
- No soporta procesamiento de texto, tool calling, agentes ni capacidades multimodales más allá de la imagen facial.

## Casos de uso

- Control de acceso biométrico: el modelo puede verificar si una persona capturada en tiempo real coincide con una identidad registrada, comparando el embedding generado con los almacenados en una base de datos. Su tamaño reducido permite ejecutarlo en dispositivos perimetrales con CPU.
- Búsqueda de personas en bases de datos de imágenes: dado un rostro de consulta, se calcula su embedding y se buscan los vecinos más cercanos en un índice de embeddings precomputados, útil en aplicaciones de seguridad o gestión de archivos fotográficos.
- Autenticación en aplicaciones móviles: al ser un modelo ONNX ligero, puede integrarse en apps de iOS/Android mediante `onnxruntime` para desbloqueo facial o verificación de identidad sin depender de servicios en la nube.
- Sistemas de asistencia y presencia: identificación de empleados o estudiantes en entornos controlados, donde la cámara captura el rostro y el modelo genera el embedding para registrar la asistencia.
- Análisis forense de imágenes: comparación de rostros en imágenes de baja calidad o con variaciones de iluminación, donde el margen adaptativo de AdaFace ofrece ventajas frente a modelos con margen fijo.
- Investigación académica en reconocimiento facial: como baseline reproducible y portable, el modelo permite experimentar con técnicas de aumento de datos, métricas de similitud o integración en pipelines de visión por computador sin la complejidad de gestionar dependencias de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta la verificación de la conversión: `onnx.checker` pasa y la diferencia máxima absoluta entre la salida de PyTorch y la de ONNX Runtime es de ~4.3e-07, con una norma L2 del embedding ≈ 1.0. No se proporcionan métricas como accuracy en LFW, AgeDB o CPLFW, ni comparaciones con otros modelos.

## Requisitos de hardware

- Tamaño del modelo: 0.2 GB (archivo ONNX), lo que lo hace adecuado para entornos con recursos limitados.
- VRAM estimada: no disponible, pero al ser un modelo de ~50 capas con entrada 112×112, la inferencia en GPU requiere típicamente menos de 1 GB de VRAM (estimación razonable, no confirmada por el autor).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, NVIDIA GTX 1060 o superior) puede ejecutarlo; también funciona en CPU con `CPUExecutionProvider`.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja y media (RTX 2060, RTX 3060, etc.) sin problemas.
- Opciones de despliegue: `onnxruntime` (CPU/CUDA), también puede convertirse a otros formatos (TensorRT, OpenVINO) si se requiere optimización adicional.
- Latencia y throughput: no disponibles, pero para una sola imagen en CPU moderna se espera un tiempo de inferencia del orden de decenas de milisegundos (estimación no confirmada).

## Comparativa con modelos similares

| Modelo | Arquitectura | Embedding | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| AdaFace IR-50 (este) | IR-50 + margen adaptativo | 512 | MS1MV2 | adaface-ms1mv2 (uso investigacion) | ONNX |
| ArcFace (ResNet-50) | ResNet-50 + margen fijo | 512 | MS1MV2 o Glint360K | MIT (codigo), pesos con restricciones | PyTorch, ONNX |
| CosFace (ResNet-50) | ResNet-50 + margen coseno | 512 | MS1MV2 | MIT (codigo), pesos con restricciones | PyTorch, ONNX |

La comparativa se basa en características generales conocidas de estos modelos, no en datos de rendimiento específicos de esta implementación. AdaFace se diferencia de ArcFace y CosFace por su margen adaptativo a la calidad, lo que suele mejorar la robustez en imágenes de baja calidad, aunque no se dispone de métricas cuantitativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia de los pesos: aunque el código de AdaFace es MIT, los pesos derivan del dataset MS1MV2, que tiene términos de uso restringidos a investigación. Revisar la licencia del dataset antes de cualquier uso comercial o en producción.
- Sesgos conocidos: el modelo fue entrenado en MS1MV2, que puede tener desequilibrios demográficos (etnia, edad, género), lo que puede afectar al rendimiento en ciertos grupos poblacionales.
- Riesgo de alucinación: no aplica, al ser un modelo de visión puro; sin embargo, puede producir falsos positivos o negativos en verificación facial, especialmente con imágenes de baja calidad o ángulos extremos.
- Limitaciones de contexto: no aplica, pero la entrada debe estar alineada según el template de ArcFace; una alineación incorrecta degrada significativamente el rendimiento.
- Restricciones de formato: el modelo solo acepta imágenes BGR de 112×112 normalizadas; no soporta otros tamaños ni canales sin reentrenamiento o adaptación.
- Dependencia de `onnxruntime`: aunque elimina la dependencia de PyTorch, requiere la instalación de `onnxruntime` (CPU o GPU) en el entorno de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/globalnebula/adaface-ir50-ms1mv2-onnx
- Repositorio oficial de AdaFace: https://github.com/mk-minchul/AdaFace
- Paper de AdaFace (CVPR 2022): https://arxiv.org/abs/2112.02454 (enlace no verificado, pero es la referencia estándar del paper)
