# padiredd/dp-blockpick-2k-withoutpush-cotrain-real075

## Resumen

`padiredd/dp-blockpick-2k-withoutpush-cotrain-real075` es una política de difusión (diffusion policy) para robótica manipulativa, entrenada con la librería LeRobot (fork `lerobot-cyclo` de ROBOTIS) y publicada en Hugging Face por el usuario `padiredd`. Resuelve una tarea concreta de pick-and-place: coger un bloque verde lima con el brazo izquierdo de un robot ROBOTIS FFW SG2 equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas, sobre una mesa de 29,25 pulgadas. No es un modelo de lenguaje: es un modelo de control visuomotor que mapea observaciones (tres cámaras de 240×240 más estado articular de 22 dimensiones) a acciones (16 objetivos articulares a 15 Hz).

El modelo tiene 287.533.680 parámetros (aproximadamente 288 M) y se distribuye en formato safetensors con un repositorio de 11,5 GB que incluye el checkpoint final (paso 100k) en la raíz y diez checkpoints intermedios cada 10.000 pasos. Su interés técnico reside en la receta de entrenamiento: combina 2.000 demostraciones simuladas generadas por un programa *code-as-policy* con 14 demostraciones reales de teleoperación, mediante un muestreo de co-entrenamiento con alpha 0,75 a favor de los datos reales. Es un caso práctico de *sim-to-real* con corrección de sesgos del generador de datos.

La relevancia actual es doble: por un lado, documenta un diagnóstico concreto de fallo en políticas de difusión (el modelo previo colocaba 7/100 frente a 64/100 del planificador, por copiar un levantamiento durante el cierre de pinza y empujones no deseados); por otro, muestra cómo un puñado de demostraciones reales puede reequilibrar una política entrenada casi exclusivamente en simulación. La model card indica que los resultados de evaluación se añadirán cuando se ejecuten, por lo que no hay métricas de éxito publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con codificador ResNet18 por cámara; fork `lerobot-cyclo` de ROBOTIS sobre LeRobot |
| Parámetros totales | 287.533.680 (~288 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción 64 pasos, 32 ejecutados, `n_obs_steps` = 1 |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica con la cadena "pick up the lime green block with the left arm") |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy clásica: un proceso DDPM de 100 pasos que genera secuencias de acciones (horizonte 64, 32 ejecutadas) condicionadas por observaciones visuales y propioceptivas. Cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) pasa por un codificador ResNet18 independiente; la entrada se completa con el estado articular de 22 dimensiones y la salida son 16 objetivos articulares a 15 Hz. El entrenamiento usó Adam con tasa 1e-4, schedule coseno, batch 32, semilla 1000 y 100.000 pasos sobre una única NVIDIA A40 de 46 GB, a unas 5,7 iteraciones por segundo.

Los datos combinan 2.000 demostraciones simuladas exitosas del dataset `pick-cube-2k-withoutpush-yaw45-full-dr2-3cam`, generadas por un programa *code-as-policy* con dos correcciones respecto a la versión anterior: `close_gripper compensate=False` (la mano ya no sube 16 mm al cerrar, lo que provocaba deslizamientos) y `--noise_scale 0` (sin empujones articulares ejecutados, que causaban que el robot flotara). Se añaden 14 demostraciones reales de teleoperación (`omkarpatil/pick-lime-block`, 2.653 fotogramas, redimensionados al formato de simulación), formando un conjunto de 2.014 episodios. El muestreo de co-entrenamiento (`CotrainMixSampler`) extrae cada muestra de los episodios reales con probabilidad 0,75 y, en caso contrario, de los simulados (aproximadamente 24 muestras reales y 8 simuladas por lote). Las estadísticas de normalización se calculan sobre el conjunto fusionado. La aumentación de imagen es agresiva: orden aleatorio de hasta cinco transformaciones entre brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio y escala de grises. No se aplica ruido al estado.

## Capacidades

- Control visuomotor de pick-and-place: coger un bloque verde lima con el brazo izquierdo del FFW SG2 y levantarlo.
- Fusión de tres vistas de cámara (cabeza y ambas muñecas) con estado articular en una única política de difusión.
- Generalización dentro del dominio de entrenamiento: colocaciones del bloque con yaw entre 0 y 45 grados, región completa de la mesa y variaciones de altura de mesa.
- Robustez a cambios visuales gracias a la aumentación pesada (iluminación, color, perspectiva, oclusión parcial).
- Transferencia sim-to-real mediante co-entrenamiento con 14 demostraciones reales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo generativo de texto.

## Casos de uso

- **Automatización de pick-and-place en línea de montaje**: la política ejecuta la secuencia aproximación-cierre-elevación a 15 Hz con 16 objetivos articulares, adecuada para coger piezas pequeñas de una cinta o bandeja en un puesto fijo con cámara cenital y de muñeca.
- **Punto de partida para fine-tuning en un robot real**: las 14 demostraciones reales y las estadísticas de normalización fusionadas permiten continuar el entrenamiento con datos propios del mismo montaje sin recalibrar desde cero.
- **Validación de pipelines sim-to-real**: sirve como referencia para comparar generadores de datos (planificador de movimiento frente a code-as-policy) manteniendo semillas, colocaciones y aumentación idénticas.
- **Investigación en co-entrenamiento con datos reales escasos**: el muestreo alpha 0,75 es un caso reproducible para estudiar cuántas demostraciones reales bastan para corregir sesgos de un generador simulado.
- **Banco de pruebas de robustez visual**: la aumentación agresiva y las tres cámaras permiten evaluar degradación ante cambios de iluminación o perspectiva en entornos de laboratorio.
- **Docencia y reproducción en robótica**: el repositorio incluye diez checkpoints intermedios cada 10.000 pasos, útiles para estudiar la evolución del aprendizaje y la estabilidad del entrenamiento.
- **Integración en LeRobot**: al cargarse con `DiffusionPolicy.from_pretrained(...)`, se puede desplegar en el stack LeRobot sobre el hardware FFW SG2 sin conversión de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten. Como referencia cualitativa del diagnóstico que motivó este modelo, la model card cita que la política previa (`dp-blockpick-cap2k-yaw45`) colocaba 7/100 frente a 64/100 del planificador de movimiento, pero no se aportan métricas de esta versión.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los 288 M parámetros en fp32 ocupan aproximadamente 1,15 GB; con las tres ResNet18 y los buffers de difusión (100 pasos DDPM), el consumo real es mayor, pero holgadamente por debajo de 8 GB en fp32 y de 4 GB en fp16. No se han publicado mediciones exactas.
- **GPU de entrenamiento**: una NVIDIA A40 de 46 GB por ejecución, según la model card, a ~5,7 pasos/s con batch 32.
- **GPU recomendadas para inferencia**: cualquier GPU con al menos 8 GB (RTX 3060/4060, RTX 4090, A10, L4, A100, H100). Cabe en GPU de consumo.
- **Opciones de despliegue**: LeRobot con el fork `lerobot-cyclo` de ROBOTIS; no hay variantes GGUF ni soporte documentado para vLLM, llama.cpp, Ollama o TGI (no aplican a políticas de difusión).
- **Latencia y throughput**: no disponibles para inferencia; el entrenamiento reportado es de ~5,7 pasos/s en A40.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-2k-withoutpush-cotrain-real075 (este) | ~288 M | Pick de bloque, brazo izquierdo FFW SG2 | Horizonte 64, 32 ejecutados | other | Hugging Face, 0 descargas |
| padiredd/dp-blockpick-yaw45-2k | no disponible en la información | Misma tarea, datos generados por planificador de movimiento | no disponible | no disponible | Hugging Face |
| padiredd/dp-blockpick-cap2k-yaw45 | no disponible en la información | Misma tarea, code-as-policy con defaults | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes; la model card solo menciona el resultado cualitativo 7/100 frente a 64/100 para la variante cap2k frente al planificador.

## Limitaciones y advertencias

- **Licencia "other"**: no se especifican los términos exactos; es imprescindible revisar el texto de licencia del repositorio antes de cualquier uso comercial.
- **Sin métricas de éxito publicadas**: no hay evaluación cuantitativa de esta versión, por lo que no se puede afirmar su rendimiento real.
- **Alcance muy restringido**: entrenada para una tarea, un robot y un montaje concretos (FFW SG2, pinza CAD, mesa de 29,25 pulgadas, tres cámaras calibradas). No generaliza a otras tareas, objetos o configuraciones sin fine-tuning.
- **Dependencia de datos simulados**: 2.000 de 2.014 episodios son simulados; el sesgo del generador code-as-policy puede persistir pese a las correcciones y al peso 0,75 de los datos reales.
- **Riesgo de fallo en agarre**: el diagnóstico original señala deslizamientos por levantamiento durante el cierre y empujones no deseados; aunque corregidos en los datos, el comportamiento en producción debe validarse.
- **Sin soporte de lenguaje ni razonamiento**: no admite instrucciones en lenguaje natural más allá de la cadena de tarea fija; no es apto para casos de uso conversacionales.
- **Repositorio pesado**: 11,5 GB con diez checkpoints intermedios; conviene descargar solo el checkpoint necesario.
- **Cero descargas y cero likes**: sin validación por parte de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-2k-withoutpush-cotrain-real075
- Dataset simulado: `padiredd/pick-cube-2k-withoutpush-yaw45-full-dr2-3cam` (en Hugging Face)
- Dataset fusionado sim+real: `padiredd/pick-cube-2k-withoutpush-yaw45-full-dr2-plus-real-lime-3cam` (en Hugging Face)
- Demostraciones reales de origen: `omkarpatil/pick-lime-block` (en Hugging Face)
- Variante con planificador de movimiento: `padiredd/dp-blockpick-yaw45-2k` (en Hugging Face)
- Variante code-as-policy con defaults: `padiredd/dp-blockpick-cap2k-yaw45` (en Hugging Face)
- LeRobot: https://github.com/huggingface/lerobot
- Fork `lerobot-cyclo` de ROBOTIS: no disponible enlace directo en la información proporcionada
