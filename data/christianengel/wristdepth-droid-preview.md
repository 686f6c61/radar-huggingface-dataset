# christianengel/WristDepth-DROID-preview

## Resumen

WristDepth-DROID-preview es un modelo de estimación de profundidad métrica de una sola imagen, derivado por fine-tuning de apple/DepthPro2-B y publicado por el usuario christianengel. Está diseñado específicamente para cámaras de muñeca en configuraciones robóticas tipo DROID: recibe una imagen RGB junto con su longitud focal horizontal en píxeles y devuelve un mapa de profundidad en metros alineado con el eje de la cámara. Con 96.513.409 parámetros y un repositorio de 0,6 GB, se distribuye en formato ONNX FP16 (además de pesos compatibles con la implementación PyTorch de Apple).

El modelo aborda un problema concreto en robótica de manipulación: la estimación de profundidad absoluta desde cámaras montadas en el efector final, donde la geometría y la distancia de trabajo difieren mucho de las cámaras frontales o de escritorio para las que se entrenan los modelos genéricos. Según la model card, en escenas retenidas de DROID y en el laboratorio PennPAL el modelo exportado reduce el error de profundidad frente a WristDepth v1 (error logarítmico medio de 0,132 frente a 0,249 en DROID test, y de 0,162 frente a 0,460 en PennPAL).

Es relevante ahora porque demuestra una adaptación de un modelo fundacional de profundidad (Depth Pro 2 B de Apple) a un dominio robótico estrecho mediante un conjunto mixto de datos sintéticos y estéreo real, y porque publica resultados de evaluación honestos que incluyen un caso de fallo claro: en la cámara de muñeca SO-101 a corta distancia sobreestima las distancias un 35 % en la mediana, por lo que el propio autor recomienda usar v1 para posicionamiento absoluto en esa plataforma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de apple/DepthPro2-B (modelo de estimación de profundidad monocular); detalles internos de la arquitectura no disponibles en la información proporcionada |
| Parámetros totales | 96.513.409 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión de una sola imagen, no generativo) |
| Tipos de cuantización | ONNX FP16 (grafo exportado); pesos PyTorch compatibles con `DepthPro2.from_pretrained`; otras cuantizaciones no disponibles |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement) |
| Formato de pesos | ONNX (`onnx/model_fp16.onnx`), safetensors y pesos PyTorch |

## Arquitectura y entrenamiento

El modelo parte de los pesos de apple/DepthPro2-B y se obtiene por fine-tuning completo del codificador y el decodificador, con una tasa de aprendizaje reducida en el codificador y decaimiento por capas (*layer-wise decay*), además de pesos con media móvil exponencial (EMA). La entrada es una imagen RGB en float32 (rango 0–1, orden NCHW) más la longitud focal horizontal en píxeles a la resolución de entrada; la salida es profundidad en metros respecto al eje de la cámara. El grafo ONNX FP16 se validó contra la referencia FP32 con una diferencia relativa absoluta de 0,000269 y cero predicciones no finitas sobre 5,22 millones de píxeles.

El entrenamiento se realizó sobre un pool de 40.013 fotogramas sintéticos y 22.109 fotogramas reales de DROID con etiquetado estéreo, antes de la separación por escenas. Se entrenaron cuatro variantes con 240.000 ejemplos muestreados cada una; la ejecución seleccionada muestreó un 35 % de datos reales y de los 68 checkpoints se eligió el de 225.000 muestras, que obtuvo el menor error logarítmico medio con pesos iguales en validación de DROID, TRI y RoboLab simulado (0,184 frente a 0,329 de v1). El autor advierte que datos y optimización cambiaron a la vez, por lo que no se ha aislado la contribución de los 21.096 renders procedurales nuevos. El conjunto procedural está publicado en Hugging Face Datasets.

## Capacidades

- Estimación de profundidad métrica absoluta (en metros) a partir de una única imagen RGB.
- Incorporación de la longitud focal horizontal en píxeles como entrada explícita, lo que permite coherencia métrica entre cámaras calibradas.
- Funcionamiento en cámaras de muñeca de robots manipuladores (dominio DROID) y en escenas de laboratorio tipo PennPAL.
- Exportación ONNX FP16 ejecutable con ONNX Runtime GPU (probado con la versión 1.23 y `CUDAExecutionProvider`).
- Compatibilidad con la implementación PyTorch de Apple mediante `DepthPro2.from_pretrained`.
- No soporta tool calling, agentes, razonamiento multi-turno ni generación de texto: es un modelo puramente perceptivo de visión.
- Capacidades multilingües: no aplica.

## Casos de uso

- Posicionamiento relativo en manipulación robótica: estimar la altura de objetos sobre una mesa (el modelo midió una placa blanca entre 10 y 21 mm por encima del escritorio en tres vistas) para planificar agarres que no requieran precisión milimétrica absoluta.
- Percepción en robots con cámara de muñeca DROID: sustituir o complementar la profundidad estéreo en configuraciones donde el estéreo es ruidoso o costoso, aprovechando el entrenamiento específico sobre fotogramas DROID reales.
- Detección de obstáculos cercanos en efector final: generar mapas de profundidad por fotograma para evitar colisiones en aproximaciones a superficies, aceptando el sesgo de escala documentado.
- Investigación en estimación de profundidad monocular: servir como punto de comparación reproducible (resultados ONNX y PyTorch publicados en JSON) frente a WristDepth v1 y otros derivados de Depth Pro.
- Reconstrucción aproximada de escena de mesa: obtener la geometría del plano de trabajo y de objetos sobre él para tareas de segmentación o registro, no para metrología.
- Despliegue en pipelines de inferencia GPU de baja latencia: al ser un grafo ONNX FP16 de 0,6 GB, puede integrarse en servicios de percepción con ONNX Runtime sin dependencia del stack PyTorch completo.
- Generación de datos sintéticos etiquetados: el conjunto procedural publicado y el modelo permiten experimentar con aumento de datos para otras cámaras de muñeca.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los modelos ONNX FP16 descargables, ejecutados con el proveedor CUDA. El error logarítmico medio absoluto mide la precisión en cualquier dirección (menor es mejor); la escala es la mediana de la relación entre profundidad predicha y de referencia (ideal 1,00).

| Conjunto de evaluación | Fotogramas | Error log v1 | Error log preview | Escala v1 | Escala preview |
|---|---:|---:|---:|---:|---:|
| DROID test | 392 | 0,249 | 0,132 | 0,94 | 1,02 |
| PennPAL (laboratorio excluido del entrenamiento) | 1.235 | 0,460 | 0,162 | 0,72 | 1,01 |
| SO-101 tabletop (corta distancia) | 40 | 0,193 | 0,385 | 1,09 | 1,35 |

Las entradas de DROID y PennPAL fueron de 640×352, centradas verticalmente sobre un lienzo negro de 640×480 y evaluadas solo en los píxeles válidos originales; las de SO-101 ya eran 640×480. La evaluación nativa en PyTorch produjo el mismo orden en los tres conjuntos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo ONNX FP16 ocupa aproximadamente 0,2 GB de pesos (96,5 M de parámetros en FP16); con activaciones para 640×480 la huella es de pocos cientos de MB, por lo que cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para ONNX Runtime GPU; el autor probó con `CUDAExecutionProvider`. Para producción a alta frecuencia de fotogramas se recomienda una RTX 4090, L4 o A100/H100 según concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en GPUs de gama baja con suficiente memoria.
- Opciones de despliegue: ONNX Runtime (GPU o CPU), implementación PyTorch de Apple (`DepthPro2.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de visión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento (error log DROID test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WristDepth-DROID-preview | 96,5 M | Imagen + focal, una sola imagen | 0,132 | apple-amlr | Hugging Face (ONNX + PyTorch) |
| WristDepth v1 | No disponible | Imagen + focal, una sola imagen | 0,249 | No disponible en la información | Hugging Face |
| apple/DepthPro2-B (base) | No disponible | Imagen monocular | No disponible en la información | apple-amlr | Hugging Face |

Frente a WristDepth v1, el preview mejora el error logarítmico en DROID test (0,132 frente a 0,249) y en PennPAL (0,162 frente a 0,460), con una escala casi perfecta (1,02 y 1,01), pero empeora en la cámara SO-101 a corta distancia (0,385 frente a 0,193, con escala 1,35). El modelo base Depth Pro 2 B de Apple no está evaluado en estos conjuntos en la información disponible, por lo que no se puede comparar numéricamente.

## Limitaciones y advertencias

- Sesgo de escala en cámaras de corta distancia: en la SO-101 sobreestima distancias un 35 % en la mediana; el autor recomienda explícitamente usar WristDepth v1 para posicionamiento absoluto en mesa con esa plataforma.
- Error de plano de fondo: en las tres vistas de la placa blanca, el modelo situó el plano del escritorio entre 45 y 71 mm por debajo de su posición física, aunque acertó mejor en la altura del objeto.
- Evaluación limitada: los resultados de SO-101 se basan en 40 fotogramas y los de la placa en tres vistas de un único objeto sobre un único escritorio; no son concluyentes para otros entornos.
- Confusión de factores en el entrenamiento: datos y optimización cambiaron simultáneamente, por lo que no se conoce la contribución aislada de los renders procedurales nuevos.
- Licencia apple-amlr: es una licencia específica de Apple Machine Learning Research; deben revisarse sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las de una licencia permisiva estándar.
- Modelo de investigación: el autor lo presenta como derivado de investigación para cámaras de muñeca tipo DROID, sin garantías de robustez en dominios fuera de los evaluados.
- Sin capacidades de lenguaje, razonamiento ni tool calling: no es adecuado para tareas de agente o generación.
- Riesgo de alucinación en sentido estricto no aplica, pero sí de predicciones de profundidad incorrectas y no detectables sin referencia externa.
- Idiomas: no aplica; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/christianengel/WristDepth-DROID-preview
- WristDepth v1: https://huggingface.co/christianengel/WristDepth
- Modelo base apple/DepthPro2-B (revisión upstream): https://huggingface.co/apple/DepthPro2-B/tree/85e67fdfb7f5b36a6f6c4495e6789d331b1d8a04
- Conjunto de datos procedural: https://huggingface.co/datasets/christianengel/WristDepth-procedural
- Resultados completos ONNX: `evaluation_onnx.json` (en el repositorio del modelo)
- Resultados completos PyTorch: `evaluation_pytorch.json` (en el repositorio del modelo)
- Verificación de paridad FP16/FP32: `parity_model_fp16.json` (en el repositorio del modelo)
- Sumas de verificación: `SHA256SUMS` (en el repositorio del modelo)
- Licencia: `LICENSE` (en el repositorio del modelo)
