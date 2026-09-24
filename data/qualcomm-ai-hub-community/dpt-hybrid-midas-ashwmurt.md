# qualcomm-ai-hub-community/dpt-hybrid-midas-ashwmurt

## Resumen

DPT-Hybrid-MiDaS es un modelo de estimación de profundidad monocular (depth estimation) basado en la arquitectura Dense Prediction Transformer (DPT), desarrollado originalmente por Intel como parte de la familia MiDaS v3.0. El modelo combina un extractor convolucional BiT-R50 como *stem* con un codificador ViT-Base y un decodificador convolucional DPT que fusiona progresivamente los *tokens* intermedios del transformer para reconstruir un mapa de profundidad a resolución completa. Cuenta con aproximadamente 122 millones de parámetros y trabaja con una resolución de entrada nativa de 384x384 píxeles.

La receta publicada por `qualcomm-ai-hub-community` no es un modelo nuevo, sino un envoltorio que reproduce el checkpoint de HuggingFace (`Intel/dpt-hybrid-midas`) en su resolución nativa y lo integra con el ecosistema Qualcomm AI Hub Models. Esto permite compilar, perfilar y evaluar el modelo en dispositivos Snapdragon reales mediante Qualcomm AI Hub Workbench, así como exportarlo a runtimes de borde como TensorFlow Lite, ONNX Runtime o Qualcomm AI Engine Direct.

La relevancia actual radica en su utilidad para *zero-shot* transfer: al haberse entrenado sobre una mezcla de seis conjuntos de datos de profundidad (MIX-6), predice profundidad inversa relativa hasta una escala y un desplazamiento globales desconocidos, en lugar de distancia métrica absoluta. Esto lo hace adecuado para tareas de percepción en dispositivos móviles y de borde donde no se dispone de calibración métrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DPT híbrida: *stem* convolucional BiT-R50 + codificador ViT-Base + decodificador convolucional DPT |
| Parametros totales | ~122 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada fija de imagen a 384x384 píxeles |
| Tipos de cuantizacion | No disponible; la receta permite exportación a TensorFlow Lite, ONNX Runtime y Qualcomm AI Engine Direct |
| Idiomas soportados | No disponible (modelo de visión, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (checkpoint HuggingFace `Intel/dpt-hybrid-midas`); exportable a ONNX, TFLite y AI Engine Direct |

## Arquitectura y entrenamiento

DPT-Hybrid-MiDaS es una red de predicción densa de tipo transformer. Un *stem* convolucional BiT-R50 procesa la imagen de entrada y produce un mapa de características que alimenta un codificador ViT-Base. El codificador genera *tokens* en varias etapas de profundidad y el decodificador convolucional DPT los reensambla y fusiona de forma progresiva (mediante capas de *reassemble* y fusión) hasta obtener un mapa de profundidad a resolución completa. Esta combinación híbrida conv–transformer busca aunar la eficiencia local de las convoluciones con la capacidad de modelar dependencias globales de la atención.

El modelo se entrenó sobre MIX-6, una mezcla de seis conjuntos de datos de profundidad, con el objetivo de lograr transferencia *zero-shot* a dominios no vistos. La salida es profundidad inversa relativa, normalizada hasta una escala y un desplazamiento globales desconocidos. La model card no especifica el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). La receta de Qualcomm reproduce el checkpoint original en su resolución nativa de 384x384 píxeles.

## Capacidades

- Estimación de profundidad monocular relativa (profundidad inversa) a partir de una única imagen RGB.
- Transferencia *zero-shot* a dominios e imágenes no vistos durante el entrenamiento.
- Predicción densa a resolución completa (un valor de profundidad por píxel de la imagen de entrada).
- Entrada de imagen de 384x384 píxeles en la configuración nativa de la receta.
- Exportación y compilación para despliegue en dispositivos Snapdragon mediante Qualcomm AI Hub Workbench.
- Perfilado y evaluación en dispositivos reales a través del CLI de Qualcomm AI Hub Models.
- No soporta *tool calling*, *function calling*, agentes ni razonamiento multi-paso (es un modelo puramente visual).
- No dispone de capacidades multilingües ni de modalidad de texto, audio o *thinking mode*.

## Casos de uso

- Percepción de profundidad en aplicaciones móviles: el modelo cabe en un dispositivo Snapdragon y permite generar mapas de profundidad en tiempo prácticamente real para efectos fotográficos como el desenfoque de fondo (*portrait mode*).
- Realidad aumentada: al estimar la profundidad relativa de la escena, permite colocar objetos virtuales con una oclusión y una escala coherentes respecto a la geometría capturada por la cámara.
- Robótica y navegación de bajo coste: la estimación de profundidad relativa sirve como señal de proximidad para evitar obstáculos en robots o drones con cámara monocular, sin necesidad de sensores LiDAR.
- Reconstrucción 3D y *depth maps* para modelado: la salida densa de profundidad puede convertirse en nubes de puntos o mallas tras un ajuste de escala, útil en *pipelines* de fotogrametría.
- Segmentación y *matting* asistidos por profundidad: el mapa de profundidad permite separar primer plano y fondo en tareas de edición de imagen donde no hay máscara explícita.
- Vehículos autónomos y ADAS de bajo consumo: como componente auxiliar de percepción monocular en sistemas embebidos con presupuesto energético limitado.
- Automatización industrial con visión: control de presencia y distancia relativa de objetos en cintas de producción cuando no se requiere medida métrica exacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 488 MB con pesos en fp32, unos 244 MB en fp16 y alrededor de 122 MB en int8 (solo pesos; hay que sumar activaciones y memoria del runtime).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; se ha validado en RTX 3060, RTX 4090, A100 y H100, aunque el modelo está sobredimensionado para estas dos últimas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU *consumer* moderna (GTX 1650 4 GB en adelante).
- Opciones de despliegue: PyTorch (por defecto), ONNX Runtime, TensorFlow Lite y Qualcomm AI Engine Direct; se ejecuta en dispositivos Snapdragon a través de Qualcomm AI Hub Workbench. No es compatible con vLLM ni llama.cpp, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DPT-Hybrid-MiDaS (esta ficha) | ~122 M | 384x384 px | Profundidad monocular relativa | Apache-2.0 | HuggingFace y Qualcomm AI Hub |
| DPT-Large (MiDaS v3.1) | ~344 M | Hasta 384x384 px (entrada nativa variable) | Profundidad monocular relativa | Apache-2.0 | HuggingFace (`Intel/dpt-large`) |
| MiDaS v2.1 | ~105 M (variante híbrida) | Entrada variable | Profundidad monocular relativa | MIT | GitHub `isl-org/MiDaS` |
| Depth Anything V2 | 24,8 M (Small) / 97,5 M (Base) / 335,3 M (Large) | Entrada variable | Profundidad monocular relativa y métrica | Apache-2.0 (Small/Base) segun variante | HuggingFace y GitHub |

Los valores de parámetros y licencias de los modelos comparados son aproximados y proceden de conocimiento público general, no de la información proporcionada en esta búsqueda; conviene verificarlos en las fichas oficiales respectivas.

## Limitaciones y advertencias

- El modelo predice profundidad relativa inversa, no distancia métrica: la salida tiene una escala y un desplazamiento globales desconocidos, por lo que no puede usarse directamente para medir distancias en metros sin calibración adicional.
- Riesgo de degradación en dominios muy alejados de MIX-6 (por ejemplo, imágenes médicas, microscopía o escenas con geometría muy atípica), donde la transferencia *zero-shot* puede fallar.
- Al ser un modelo puramente visual, no procesa texto ni tiene capacidades multilingües; cualquier evaluación de idioma carece de sentido.
- La estimación puede fallar en superficies reflectantes, transparentes o con oclusiones fuertes, y tiende a suavizar detalles finos por la naturaleza de la salida densa.
- La receta está vinculada al ecosistema Qualcomm AI Hub: para aprovechar el despliegue en Snapdragon se requiere registro y token de API de Qualcomm AI Hub Workbench.
- La licencia del modelo original es Apache-2.0, que permite uso comercial, pero conviene revisar las condiciones del checkpoint y de los datasets de entrenamiento subyacentes antes de un despliegue en producción.
- No se han publicado métricas de rendimiento en la información disponible, por lo que no es posible cuantificar su precisión sin una evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm-ai-hub-community/dpt-hybrid-midas-ashwmurt
- Checkpoint original en HuggingFace: https://huggingface.co/Intel/dpt-hybrid-midas
- Paper "Vision Transformers for Dense Prediction": https://arxiv.org/abs/2103.13413
- Implementación de referencia de DPT: https://github.com/isl-org/DPT
- Qualcomm AI Hub Models (CLI): https://github.com/quic/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com/
- Documentación de Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com/docs/
- Comunidad Slack de Qualcomm AI Hub: https://aihub.qualcomm.com/community/slack
