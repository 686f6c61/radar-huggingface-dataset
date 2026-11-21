# christianengel/DepthAnythingV2-Metric-Indoor-Base-ONNX

## Resumen

Depth Anything V2 Metric Indoor Base ONNX es una exportación a formato ONNX del modelo Depth Anything V2 en su variante métrica para interiores, concretamente el checkpoint `Depth-Anything-V2-Metric-Hypersim-Base` de Depth Anything. El modelo original lo desarrolla el equipo de Depth Anything (Lihe Yang et al.), y esta conversión la publica el usuario christianengel. Resuelve el problema de estimación de profundidad monocular métrica en escenas de interior, devolviendo un mapa de profundidad en metros en lugar de profundidad relativa.

La relevancia de esta ficha no está en el modelo base, ampliamente conocido, sino en el artefacto ONNX listo para inferencia en CPU con ONNX Runtime y para compilación con TensorRT en dispositivos Jetson. El autor declara explícitamente que la validación se limita a la paridad de exportación ("export parity only"), sin evaluación contra el dataset NYU, y que no dispuso de un Jetson Orin para probar la ruta TensorRT.

El repositorio ocupa 0,6 GB e incluye dos pesos: `onnx/model_fp32.onnx` (~389 MB) y `onnx/model_fp16.onnx` (~195 MB). La entrada es una imagen float32 en formato NCHW con normalización ImageNet y dimensiones múltiplo de 14; la salida es un tensor de profundidad en metros con la misma resolución espacial que la entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Depth Anything V2, encoder DINOv2 + decoder de profundidad), exportado a ONNX |
| Parametros totales | no disponible (variante Base del modelo original; el repositorio no declara el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | FP32 y FP16 (archivos preexportados); no se declaran otros formatos |
| Idiomas soportados | no disponible (no aplica, tarea de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_fp32.onnx`, `model_fp16.onnx`) |
| Entrada | `image` float32, `N×3×H×W`, normalización ImageNet, H y W múltiplos de 14 |
| Salida | `depth` float32, `N×H×W`, en metros |
| Rango métrico | interiores, máximo 20 m |
| Resolución de referencia | 480×640 de entrada, procesado interno a 518×686 |
| Tamaño del repositorio | 0,6 GB |
| Librería declarada | tensorrt |

## Arquitectura y entrenamiento

El modelo subyacente es Depth Anything V2 en su variante métrica para interiores, entrenada sobre el dataset Hypersim. La arquitectura sigue el esquema de Depth Anything V2: un encoder basado en DINOv2 (en esta variante, tamaño Base) que extrae características visuales y un decoder que las proyecta a un mapa de profundidad denso. A diferencia de las variantes relativas, esta versión estima profundidad absoluta en metros, calibrada para escenas de interior con un rango máximo de 20 m.

Esta ficha corresponde exclusivamente a la exportación ONNX, no al entrenamiento. El autor no documenta detalles de datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO, porque no los ha generado él: son los del checkpoint original `depth-anything/Depth-Anything-V2-Metric-Hypersim-Base`. La innovación técnica del artefacto es la exportación: en FP16 se mantienen Softmax y LayerNormalization en FP32 y se restauran las escalas de Resize a float32, y se recomienda compilar con la opción `--stronglyTyped` de TensorRT. El autor reporta que la discrepancia de posición en la codificación posicional es 0 a 518×518 y de aproximadamente 0,003 m a 518×686, con un AbsRel de 1,5e-4 y 2,1e-4 en FP16 frente a FP32.

## Capacidades

- Estimación de profundidad monocular métrica en metros para escenas de interior (hasta 20 m).
- Salida densa por píxel con la misma resolución espacial que la imagen de entrada.
- Inferencia en CPU mediante ONNX Runtime con `CPUExecutionProvider`.
- Compilación a TensorRT para despliegue en dispositivos NVIDIA Jetson (script `jetson/build_tensorrt.sh`).
- Ejecución en FP32 y FP16, con paridad numérica verificada frente al modelo original.
- Procesamiento por lotes (dimensión `N` en entrada y salida).
- No soporta tool calling, agentes, texto, audio ni otras modalidades: es un modelo puramente visual de profundidad.

## Casos de uso

- Navegación de robots móviles en interiores: el modelo devuelve profundidad métrica hasta 20 m, adecuada para planificación de trayectorias y evitación de obstáculos en espacios como oficinas o viviendas, ejecutándose en CPU o en un Jetson a bordo.
- Realidad aumentada en interiores: colocar objetos virtuales con escala métrica correcta requiere profundidad absoluta; la salida en metros permite anclar geometría sin calibración adicional de escala.
- Reconstrucción 3D de escenas: usar el mapa de profundidad por píxel junto con la imagen RGB para generar nubes de puntos o mallas de habitaciones, con la ventaja de que la escala es física.
- Automatización de interiores y medición: estimar distancias a paredes y mobiliario en fotos para presupuestos, inventario o domótica, aprovechando el rango de 20 m y la salida métrica.
- Despliegue en dispositivos edge: el archivo FP16 de ~195 MB y la ruta TensorRT permiten integrar estimación de profundidad en cámaras inteligentes o drones con GPU integrada, sin depender de un servidor.
- Preprocesado para pipelines de visión: generar mapas de profundidad como entrada auxiliar de modelos de segmentación, detección o síntesis de vistas novel en entornos de interior.
- Prototipado rápido en CPU: con ONNX Runtime y el archivo FP32 se puede validar un pipeline completo sin GPU, útil para pruebas de integración y comparación de paridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de paridad de exportación (AbsRel FP16 de 1,5e-4 y 2,1e-4, y discrepancia de posición posicional de 0 a ~0,003 m) y advierte explícitamente que no hay puntuación sobre el dataset NYU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por tamaño de pesos, el archivo FP32 (~389 MB) y el FP16 (~195 MB) caben holgadamente en cualquier GPU con al menos 2 GB de memoria, más el espacio de activaciones para la resolución de entrada.
- GPU recomendadas: no declaradas por el autor. La ruta documentada es TensorRT en NVIDIA Jetson (el autor indica que no pudo probar un Jetson Orin). Cualquier GPU NVIDIA compatible con TensorRT o con ONNX Runtime GPU debería servir.
- CPU: soportada mediante ONNX Runtime con `CPUExecutionProvider`, según el ejemplo de la model card.
- Cabe en GPU de consumo: sí, por el tamaño de los pesos; no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime (CPU y GPU) y TensorRT (script `jetson/build_tensorrt.sh model_fp16.onnx 518 686`). No se mencionan vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| DepthAnythingV2-Metric-Indoor-Base-ONNX (esta ficha) | no disponible (variante Base) | no aplica | Profundidad métrica en metros, interiores hasta 20 m | Apache 2.0 | ONNX (FP32/FP16) |
| depth-anything/Depth-Anything-V2-Metric-Hypersim-Base | no disponible (variante Base) | no aplica | Profundidad métrica en metros, interiores | Apache 2.0 | Safetensors (formato original de PyTorch) |
| Depth Anything V2 (variantes relativas) | no disponible | no aplica | Profundidad relativa (sin escala métrica) | Apache 2.0 | Safetensors |

La comparación se limita al ecosistema Depth Anything V2 porque la información disponible no incluye datos de rendimiento frente a alternativas como MiDaS o Metric3D. La diferencia clave de esta ficha frente al checkpoint original es el formato: ONNX listo para inferencia sin PyTorch y con ruta TensorRT, a cambio de renunciar a la integración directa con `transformers`.

## Limitaciones y advertencias

- El autor declara "export parity only": no hay evaluación sobre NYU ni sobre ningún benchmark de profundidad, por lo que el rendimiento real no está validado más allá de la paridad numérica con el modelo original.
- La ruta TensorRT no fue probada en un Jetson Orin (el autor indica que no dispuso del dispositivo); el script de compilación se ofrece sin validación en hardware real.
- El modelo está calibrado para interiores con un máximo de 20 m; su uso en exteriores o a distancias mayores queda fuera de su rango previsto.
- La entrada debe tener H y W múltiplos de 14 y normalización ImageNet; ignorar este requisito produce resultados incorrectos.
- En FP16 se requiere mantener Softmax y LayerNormalization en FP32 y restaurar las escalas de Resize, además de usar `--stronglyTyped` en TensorRT; una exportación FP16 ingenua puede degradar la precisión.
- No se documentan sesgos del modelo base (por ejemplo, sesgos de dominio o demográficos en los datos de Hypersim); deben asumirse los del checkpoint original.
- Riesgo de alucinación geométrica: como todo modelo de profundidad monocular, puede producir mapas plausibles pero incorrectos en superficies reflectantes, transparentes o con poca textura.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar igualmente la licencia del checkpoint base y de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no ofrece garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/christianengel/DepthAnythingV2-Metric-Indoor-Base-ONNX
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Metric-Hypersim-Base
- Repositorio oficial de Depth Anything V2: no disponible en la información proporcionada
- Paper de Depth Anything V2: no disponible en la información proporcionada
- Demo oficial: no disponible en la información proporcionada
