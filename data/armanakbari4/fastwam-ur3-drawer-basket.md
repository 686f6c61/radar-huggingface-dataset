# armanakbari4/fastwam-ur3-drawer-basket

## Resumen

FastWAM UR3 fine-tune (drawer + blue_basket) es un modelo de mundo y acción (world-action model) desarrollado por Arman Akbari, que ajusta el modelo base Wan-AI/Wan2.2-TI2V-5B mediante la técnica Fast-WAM para tareas robóticas reales con un brazo UR3. El modelo se ha entrenado conjuntamente sobre dos tareas físicas: abrir un cajón, introducir una caja blanca y cerrarlo, y colocar una medicina y una cinta métrica en una cesta azul. Este fine-tuning parte de los pesos preentrenados de Fast-WAM (inicializados desde RoboCOIN) y utiliza 200 episodios reales capturados con tres cámaras (superior y muñecas izquierda/derecha) a resolución 240x320.

La relevancia de este modelo radica en que demuestra la aplicabilidad de los world-action models a entornos robóticos reales con datos limitados, aunque el propio autor advierte de un posible sobreajuste en el último paso de entrenamiento. El repositorio incluye cuatro checkpoints (pasos 2500, 3000, 3500 y 4000) y un archivo de estadísticas de normalización necesario para la inferencia. Con 5 mil millones de parámetros (según el nombre del modelo base) y una licencia MIT, se presenta como una opción abierta para experimentación en manipulación robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de video (basado en Wan2.2-TI2V-5B) |
| Parametros totales | 5 mil millones (estimado por el nombre del base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16 segun el entrenamiento) |
| Idiomas soportados | No disponibles (modelo orientado a vision y acciones, sin procesamiento de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo se basa en Wan2.2-TI2V-5B, un generador de video texto-imagen de la familia Wan, adaptado como world-action model mediante el enfoque Fast-WAM. Fast-WAM predice futuras observaciones y acciones a partir de una secuencia de video y un estado del robot, sin necesidad de imaginación futura en tiempo de inferencia (test-time). En este fine-tuning, se inicializan los pesos desde el modelo Fast-WAM preentrenado en RoboCOIN y se ajustan con datos reales de un UR3.

El entrenamiento se realizó durante 4000 pasos con una tasa de aprendizaje de 1e-4 con decaimiento coseno, optimizador AdamW (betas 0.9 y 0.95), precisión bf16, y clips de 65 frames con una relación de frecuencia de acción-video de 8. La dimensión conjunta de acción y estado es 14 (6 grados de libertad del brazo más variables adicionales). El autor reporta que la pérdida de acción alcanzó un mínimo de ~0.037 en el paso 4000, pero con solo 200 episodios, lo que indica sobreajuste; recomienda seleccionar el checkpoint según la tasa de éxito en el robot real, siendo los pasos 2500-3500 a menudo mejores que el 4000.

## Capacidades

- Generacion de secuencias de video y acciones para tareas robóticas de manipulación, específicamente apertura de cajones y colocación de objetos en cestas.
- Control de brazo robótico UR3 en entornos reales, con entrada de múltiples cámaras (superior y muñecas).
- Predicción de acciones y estados futuros a partir de observaciones de video (world-action model).
- Soporte para dos tareas entrenadas conjuntamente, lo que permite cierta generalización entre ellas.
- Capacidad de inferencia sin imaginación futura en tiempo de test (característica de Fast-WAM).
- No incluye capacidades de procesamiento de lenguaje natural, tool calling ni razonamiento simbólico.

## Casos de uso

- Automatización de tareas de manipulación en almacenes: el modelo puede controlar un UR3 para abrir cajones y depositar objetos, útil en entornos logísticos donde se requiere clasificación o almacenamiento.
- Investigación en world-action models: sirve como referencia para estudiar el fine-tuning de modelos de mundo con datos reales limitados, evaluando el efecto del sobreajuste en distintos checkpoints.
- Desarrollo de sistemas robóticos de bajo coste: al ser de código abierto (MIT) y basado en un modelo de 5B, puede desplegarse en laboratorios con recursos moderados para pruebas de manipulación.
- Entrenamiento de robots en entornos domésticos: las tareas de abrir cajones y colocar objetos en cestas son comunes en asistentes robóticos, y el modelo proporciona una base para adaptaciones posteriores.
- Benchmarking de control robótico: los checkpoints y las estadísticas de normalización permiten reproducir experimentos y comparar estrategias de selección de modelos en función del éxito real.
- Integración en pipelines de aprendizaje por refuerzo: el modelo puede utilizarse como world model para planificar acciones o como generador de datos sintéticos en simulaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona la pérdida de acción (~0.037 en el paso 4000) y recomienda evaluar por tasa de éxito en robot real, pero no proporciona cifras concretas de éxito ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: dado que el modelo tiene 5B parámetros y se entrena en bf16, la inferencia requiere al menos 10-12 GB de VRAM, aunque el repositorio pesa 48.2 GB (probablemente incluye múltiples checkpoints y datos de normalización). Para ejecutar el modelo completo en bf16 se necesitan aproximadamente 10 GB, pero con cargas adicionales puede superar los 12 GB.
- GPU recomendadas: una NVIDIA RTX 3090/4090 (24 GB) sería suficiente para inferencia; para entrenamiento se necesitaría una GPU con al menos 24 GB o varias GPUs.
- Si cabe en consumer GPU: sí, en GPUs de gama alta con 24 GB de VRAM, aunque el tamaño del repositorio puede requerir almacenamiento adicional.
- Opciones de despliegue: al ser pesos PyTorch, se puede usar con frameworks como PyTorch Lightning, Hugging Face Transformers (si se adapta) o vLLM si se convierte a formato compatible. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La inferencia de un modelo de video de 5B en tiempo real puede ser lenta, especialmente con secuencias de 65 frames; se recomienda hardware acelerado.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El autor no ha publicado comparativas con otros world-action models o modelos de control robótico. Se puede mencionar que el modelo base Wan2.2-TI2V-5B es un generador de video, pero no hay datos de rendimiento relativo.

## Limitaciones y advertencias

- Sobreajuste: el autor advierte que el paso 4000 presenta sobreajuste (pérdida de acción ~0.037 con solo 200 episodios), por lo que los checkpoints intermedios (2500-3500) pueden generalizar mejor en el robot real.
- Riesgo de alucinación en acciones: al ser un modelo generativo, puede producir acciones incoherentes o no seguras si se usa fuera de las tareas entrenadas.
- Dependencia de datos de normalización: se requiere el archivo `ur3_drawer_basket_dataset_stats.json` para la inferencia; sin él, los resultados no son válidos.
- Limitación de tareas: solo funciona para las dos tareas específicas (cajón y cesta azul); no es un controlador general.
- Sin soporte de lenguaje natural: el modelo no procesa instrucciones textuales, solo observaciones visuales y estados.
- Licencia MIT: permite uso comercial, pero el modelo base Wan2.2-TI2V-5B puede tener su propia licencia; es necesario verificar los términos de Wan-AI.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito en el mundo real más allá de la pérdida de entrenamiento.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/armanakbari4/fastwam-ur3-drawer-basket)
- [Perfil del autor en HuggingFace](https://huggingface.co/armanakbari4/models)
- [Repositorio oficial de FastWAM en GitHub](https://github.com/yuantianyuan01/FastWAM)
- [Paper de FastWAM (arXiv)](https://arxiv.org/pdf/2604.27792)
