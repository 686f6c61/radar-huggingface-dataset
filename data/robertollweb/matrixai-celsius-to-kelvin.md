# robertollweb/matrixai-celsius-to-kelvin

## Resumen

Este modelo es una regresión tabular de una sola entrada que convierte temperaturas en grados Celsius a kelvin. Aunque la conversión es trivial (`K = C + 273.15`), su propósito no es la precisión predictiva, sino servir como caso de demostración del framework MatrixAI, que genera modelos neuronales a partir de una especificación escrita y produce paquetes autocontenidos con trazabilidad criptográfica y verificación de reproducibilidad.

El modelo fue desarrollado por robertollweb y publicado en HuggingFace bajo licencia AGPL-3.0. Está disponible en formato ONNX y se puede ejecutar sin necesidad de instalar MatrixAI, solo con numpy y onnxruntime. Declara un rango de entrada de [-50, 150] °C y recorta los valores fuera de ese intervalo. Es un ejemplo de "IA auditable" donde cada decisión es trazable a un nodo del grafo computacional.

La relevancia actual radica en que ilustra un flujo completo de entrenamiento, empaquetado y verificación de modelos con garantías de integridad, algo poco común en el ecosistema open source. No pretende competir con modelos de lenguaje o visión, sino demostrar un enfoque reproducible para regresión tabular simple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal generada por MatrixAI (no se especifica el tipo exacto; probablemente un MLP pequeño) |
| Parametros totales | No disponible (el repo ocupa 0.0 GB en HuggingFace; se infiere un modelo muy pequeño) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | No disponible (el paquete incluye model.onnx; no se mencionan cuantizaciones adicionales) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (model.onnx) |

## Arquitectura y entrenamiento

El modelo se construye mediante MatrixAI, que convierte una especificación declarativa (`.mxai`) en una red neuronal entrenada. Según la model card, el paquete incluye `inference_spec.json` que declara la entrada como `celsius: Scalar[-50, 150]`. La arquitectura interna no se detalla, pero por el tamaño del repo y la naturaleza del problema se trata de una red de una o dos capas densas con normalización de entrada.

El entrenamiento se realizó con datos sintéticos (tag `synthetic-data`), y el modelo fue exportado a ONNX para su distribución. No se menciona el uso de RLHF, DPO u otras técnicas de alineación. La innovación principal no está en la arquitectura, sino en el flujo de auditoría: cada paso (entrenamiento, empaquetado, verificación) queda registrado y verificable mediante `matrixai verify`, que comprueba la integridad del manifiesto y detecta cualquier archivo no declarado.

## Capacidades

- Regresión tabular de una variable: convierte grados Celsius a kelvin con precisión float32.
- Normalización automática de la entrada (escala a [0,1] mediante `(C + 50) / 200`).
- Recorte (clipping) de valores fuera del rango declarado [-50, 150] °C.
- Salida con metadatos opcionales (`--meta`) que indica si se ha producido clipping.
- Ejecución autocontenida: solo requiere numpy y onnxruntime, sin dependencias de MatrixAI.
- Verificación de reproducibilidad mediante `matrixai verify` que detecta archivos no declarados en el manifiesto.
- No soporta tool calling, agentes, ni procesamiento de lenguaje natural.

## Casos de uso

- Demostración de IA auditable: sirve como ejemplo didáctico de cómo MatrixAI genera un modelo verificable desde una especificación, útil para equipos que evalúan esta plataforma.
- Pruebas de integración en pipelines de CI/CD: al ser un modelo mínimo, se puede usar para validar el flujo de despliegue de modelos ONNX en entornos de producción simulados.
- Verificación de paquetes: el comando `matrixai verify` permite comprobar la integridad del paquete, útil para auditar artefactos generados automáticamente.
- Educación en regresión tabular: el código fuente y los archivos publicados permiten estudiar cómo se normaliza una entrada, se aplica una red neuronal y se desnormaliza la salida.
- Benchmark de latencia en edge: al ser extremadamente pequeño, se puede medir el tiempo de inferencia en dispositivos de bajo consumo (Raspberry Pi, móviles) con onnxruntime.
- Caso de referencia para reproducibilidad: los archivos `salida.txt` y `expected_output.json` permiten comparar resultados entre ejecuciones y validar la trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque el modelo no pertenece a esas categorías. La model card proporciona una tabla de errores en la conversión:

| Entrada (°C) | Valor esperado (K) | Salida del paquete | Diferencia |
|---|---|---|---|
| -40 | 233.15 | 233.15000236034393 | 2.36e-06 |
| 0 | 273.15 | 273.15000146627426 | 1.47e-06 |
| 50 | 323.15 | 323.1500059366226 | 5.94e-06 |
| 100 | 373.15 | 373.1500029563904 | 2.96e-06 |

Además, un barrido de 201 puntos en el rango completo [-50, 150] °C arroja una desviación máxima de 1.46e-05 a 69 °C, atribuible a redondeo float32 y no a error del modelo. No se dispone de comparativas con otros modelos.

## Requisitos de hardware

- Inferencia en CPU: el modelo es minúsculo (el repo ocupa 0.0 GB) y se ejecuta en cualquier CPU moderna sin necesidad de GPU.
- VRAM estimada: 0 MB (no requiere GPU).
- GPU recomendada: ninguna; funciona en hardware de bajo consumo como Raspberry Pi o microcontroladores con soporte ONNX.
- Opciones de despliegue: onnxruntime en Python; también se puede convertir a otros formatos (por ejemplo, TensorRT) aunque no se documenta.
- Latencia: del orden de microsegundos por inferencia en CPU; no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No disponible. Este modelo es un caso de demostración de la plataforma MatrixAI y no tiene competidores directos en el sentido de modelos de regresión tabular publicados con fines de auditoría. La alternativa más obvia es la fórmula matemática directa (`K = C + 273.15`), que es exacta y no requiere modelo. Cualquier comparación con redes neuronales de propósito general no es pertinente.

## Limitaciones y advertencias

- Rango de entrada limitado: solo acepta valores entre -50 y 150 °C; fuera de ese rango se recorta silenciosamente, lo que puede producir resultados incorrectos si no se usa `--meta`.
- Precisión float32: el error máximo observado es del orden de 1e-05 K, lo que puede ser inaceptable en aplicaciones científicas de alta precisión.
- Licencia AGPL-3.0: cualquier uso comercial o distribución del modelo o sus derivados debe cumplir con los términos de esta licencia copyleft.
- No es un modelo de propósito general: no procesa texto, imágenes ni otras modalidades; su única función es la conversión de temperatura.
- El paquete genera archivos `__pycache__` al importar `predict.py`, lo que invalida la verificación `matrixai verify`; se recomienda ejecutar la verificación sobre una copia limpia.
- No se proporcionan datos de entrenamiento ni detalles de la arquitectura interna, lo que limita la reproducibilidad completa fuera del ecosistema MatrixAI.

## Enlaces

- [HuggingFace - robertollweb/matrixai-celsius-to-kelvin](https://huggingface.co/robertollweb/matrixai-celsius-to-kelvin)
- [GitHub - robertollweb/matrixAI](https://github.com/robertollweb/matrixAI)
- [PyPI - matrixai-core](https://pypi.org/project/matrixai-core/)
- [MatrixAI Studio - Casos](https://matrixaistudio.org/casos#kelvin)
- [Calculadora de conversión de temperatura (referencia)](https://www.calculatorsoup.com/calculators/conversions/celsius-to-kelvin.php)
