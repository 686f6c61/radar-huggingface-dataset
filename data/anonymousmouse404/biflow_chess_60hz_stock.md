# AnonymousMouse404/biflow_chess_60hz_stock

## Resumen

El modelo `biflow_chess_60hz_stock` es una política de control robótico desarrollada por el usuario AnonymousMouse404 para el brazo manipulador SO-101, especializada en la tarea de mover piezas de ajedrez sobre un tablero físico. Utiliza BiFlow, un flujo normalizante bidireccional de un solo paso, que aprende simultáneamente el mapeo de datos a ruido y de ruido a datos, lo que permite una generación de acciones más rápida y flexible que los métodos autorregresivos convencionales. El modelo opera a una frecuencia de control de 60 Hz, con cámaras a 30 Hz, y se entrena sobre demostraciones humanas recogidas en un dataset propio.

Con 45,7 millones de parámetros y un tamaño de repositorio de 0,4 GB, se trata de un modelo ligero, diseñado para ejecutarse en tiempo real en hardware de consumo. Su relevancia radica en explorar la aplicación de flujos normalizantes bidireccionales al control de robots, un área dominada por redes neuronales recurrentes o transformadores, y en ofrecer una implementación reproducible dentro del ecosistema LeRobot de HuggingFace. No es un modelo de lenguaje ni de visión general, sino una política específica para manipulación robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiFlow (flujo normalizante bidireccional de un paso) |
| Parametros totales | 45.769.060 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en BiFlow, una arquitectura de flujo normalizante bidireccional descrita en el artículo "Bidirectional Normalizing Flow: From Data to Noise and Back" (arXiv:2512.10953). A diferencia de los flujos normalizantes causales, BiFlow entrena un modelo inverso que aproxima el mapeo de ruido a datos, lo que permite funciones de pérdida más flexibles y una aceleración del muestreo de hasta dos órdenes de magnitud. En este caso, la política se entrena para generar acciones de control del brazo SO-101 a partir de observaciones del tablero de ajedrez (imagen de 128 píxeles con el tablero resaltado), la posición de la muñeca y el estado del robot.

El entrenamiento se realizó durante 50.000 pasos, divididos en 10.000 pasos de preentrenamiento forward y 40.000 pasos de entrenamiento reverse, con un tamaño de lote de 32, una tasa de aprendizaje de 1e-4 con optimizador AdamW y programación coseno, y semilla fija 1000. Los datos provienen del dataset `AnonymousMouse404/chess`, que contiene 357 episodios (excluyendo 37 de validación y 294 de prueba), con modalidades tabulares, series temporales y vídeo, en formato parquet y bajo licencia Apache-2.0. La configuración base no incluye ponderación z, ni pérdida de cinemática directa (FK loss), y utiliza un muestreo uniforme de ventanas temporales.

## Capacidades

- Generación de acciones de control para el brazo robótico SO-101 a 60 Hz, adecuado para tareas de pick and place de piezas de ajedrez.
- Procesamiento de observaciones multimodales: imagen del tablero (128 píxeles), posición de la muñeca y estado del robot.
- Inferencia de un solo paso gracias a la arquitectura BiFlow, lo que reduce la latencia frente a métodos iterativos.
- Integración con el ecosistema LeRobot de HuggingFace, permitiendo cargar el modelo mediante `So101BiflowPolicy.from_pretrained(...)`.
- No soporta generación de texto, tool calling, razonamiento simbólico ni capacidades multilingües, al ser un modelo puramente de control motor.

## Casos de uso

- Automatización de partidas de ajedrez físicas: el modelo puede mover piezas en un tablero real a partir de la posición detectada, operando a 60 Hz para responder en tiempo real a los movimientos del oponente.
- Investigación en políticas robóticas con flujos normalizantes: sirve como referencia para estudiar la eficiencia de BiFlow frente a arquitecturas autorregresivas en tareas de manipulación.
- Entrenamiento de robots por imitación: el pipeline de datos y el código de carga permiten replicar el entrenamiento con nuevos episodios de demostración.
- Desarrollo de sistemas de control de bajo coste: al tener solo 45,7 millones de parámetros, puede ejecutarse en GPUs de consumo, facilitando prototipos en laboratorios pequeños.
- Benchmarking de algoritmos de control en robótica: la configuración base (sin z-weighting, sin FK loss) proporciona un punto de partida para comparar variantes.
- Integración en entornos de simulación: el modelo puede conectarse a simuladores de SO-101 para validar políticas antes del despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión en tareas de manipulación, ni comparaciones con otras políticas robóticas. El único dato de rendimiento indirecto es la frecuencia de control de 60 Hz, que sugiere una inferencia suficientemente rápida para tiempo real, pero sin métricas cuantitativas verificables.

## Requisitos de hardware

- VRAM estimada: no disponible, pero con 45,7 millones de parámetros y pesos en safetensors (0,4 GB), se estima que cabe en GPUs con al menos 2-4 GB de VRAM en precisión FP32.
- GPU recomendadas: cualquier GPU moderna de consumo, como una NVIDIA RTX 3060 o superior, sería suficiente para inferencia en tiempo real.
- Compatibilidad con hardware de consumo: sí, el tamaño reducido permite ejecución en tarjetas gráficas de gama media e incluso en CPU con optimizaciones, aunque la frecuencia de 60 Hz requeriría GPU.
- Opciones de despliegue: el modelo se carga mediante el paquete `lerobot_policy_so101_biflow` (instalable con `pip install -e`), siguiendo el contrato de despliegue definido en `deployment_contract.json`. No es aplicable vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles, aunque la arquitectura de un solo paso sugiere una inferencia de pocos milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas con flujos normalizantes para SO-101). No hay datos públicos de otras implementaciones de BiFlow aplicadas a control de robots, ni benchmarks estandarizados que permitan una comparación objetiva. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia no especificada: el modelo no declara una licencia en su ficha de HuggingFace, lo que genera incertidumbre legal para uso comercial o redistribución. Se recomienda contactar al autor antes de utilizarlo en producción.
- Datos de entrenamiento limitados: solo 357 episodios de demostración, lo que puede provocar sobreajuste a las condiciones específicas del dataset (tablero, cámara, brazo) y falta de generalización a otros entornos.
- Específico para SO-101: la política está diseñada para un robot concreto; no es transferible directamente a otros manipuladores sin reentrenamiento.
- Sin evaluación de robustez: no se han publicado pruebas de estabilidad ante perturbaciones, fallos de sensores o variaciones de iluminación.
- Riesgo de alucinación en acciones: como cualquier modelo generativo, puede producir movimientos no seguros si las observaciones se desvían de la distribución de entrenamiento, por lo que se requiere supervisión en entornos reales.
- Dependencia de la configuración base: al no incluir z-weighting ni FK loss, el modelo puede presentar imprecisiones en la cinemática del brazo, lo que debe tenerse en cuenta para tareas de alta precisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonymousMouse404/biflow_chess_60hz_stock
- Dataset de entrenamiento: https://huggingface.co/datasets/AnonymousMouse404/chess
- Artículo sobre BiFlow: https://arxiv.org/pdf/2512.10953
