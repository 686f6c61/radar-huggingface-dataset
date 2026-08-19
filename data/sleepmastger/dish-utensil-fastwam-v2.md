# SleepMastger/dish-utensil-fastwam-v2

## Resumen

Dish-utensil FastWAM v2 es un modelo de robótica de tipo visión-lenguaje-acción (VLA) desarrollado por SleepMastger para la manipulación de platos y utensilios con un brazo robótico Franka. Se trata de la segunda versión de un modelo entrenado sobre 100 episodios teleoperados (50 con tenedor y 50 con cuchara) del dataset `SleepMastger/dish-utensil-manipulation`, que contiene 42.863 fotogramas a 10 Hz. La versión v2 reutiliza exactamente los mismos datos y normalización que la v1, pero reentrena el modelo con una nueva cadena de tarea en lenguaje natural, lo que modifica únicamente la etiqueta y su embedding T5 en caché.

El modelo emplea la arquitectura FastWAM completa, con 30 capas de video y 30 capas de acción MoT (mixture-of-transformers), entrenada desde cero sobre la base del experto de video Wan2.2-TI2V-5B con inicialización ActionDiT linear-interp. El entrenamiento se realizó durante 30 épocas (40.200 pasos) con batch global 32, tasa de aprendizaje coseno de 1e-4 y precisión bf16 con DeepSpeed ZeRO-1 sobre 4 GPU H200. El repositorio tiene un tamaño de 72,3 GB e incluye seis checkpoints intermedios, el código de entrenamiento y las estadísticas de normalización del dataset.

La relevancia de este modelo radica en su enfoque de entrenamiento desde cero para una tarea robótica específica, sin reanudar pesos de LIBERO, y en su condicionamiento por lenguaje con un embedding T5 fijo que debe coincidir byte a byte en inferencia. Aunque aún no ha sido evaluado en un robot físico, constituye un ejemplo de aplicación de arquitecturas de generación de video al control motor robótico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastWAM: 30 capas de video + 30 capas de acción MoT, basado en Wan2.2-TI2V-5B |
| Parametros totales | no disponible (repo de 72,3 GB en pesos PyTorch) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (embedding de texto T5 con contexto 128; horizonte de observación de 33 pasos) |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16; no se especifica cuantización para inferencia) |
| Idiomas soportados | no disponibles (el texto de tarea está en inglés) |
| Licencia | no disponible (no se afirma licencia para el código upstream incluido) |
| Formato de pesos | PyTorch `.pt` (checkpoints) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura FastWAM completa, compuesta por 30 capas de video y 30 capas de acción MoT. Se entrenó desde cero, sin reanudar pesos de LIBERO, tomando como base el experto de video Wan2.2-TI2V-5B e inicializando la parte de acción con ActionDiT linear-interp. El entrenamiento se realizó durante 30 épocas (40.200 pasos) con un batch global de 32, tasa de aprendizaje coseno de 1e-4, precisión bf16 y DeepSpeed ZeRO-1 sobre 4 GPU H200. Se guardaron checkpoints cada 5 épocas, todos con su hash SHA-256 correspondiente.

El dataset de entrenamiento consta de 100 episodios teleoperados de un brazo Franka (50 con tenedor y 50 con cuchara) a 10 Hz, con 42.863 fotogramas en total. La versión v2 reetiqueta la tarea con una nueva cadena de texto: "pick the dishes out of the rack and place them on the table, then pick and place the spoon in the gray dish and fork in the pink dish". Esta cadena debe coincidir byte a byte en inferencia, ya que el runtime busca el embedding T5 en caché por SHA-256 del prompt formateado. El embedding T5 (contexto 128) se guarda en `conditioning/text_embedding.pt` y forma parte del bundle de inferencia, ya que la configuración desactiva el cargador de texto (`load_text_encoder: false`).

El preprocesamiento de entrada utiliza dos cámaras RGB de 256x256 (agentview y wrist_image), redimensionadas a 224x224 y concatenadas horizontalmente a 224x448. El horizonte es de 33 observaciones y 32 transiciones de acción a 10 Hz. El estado es de 8 dimensiones: posición XYZ del efector final, orientación RPY y dos valores de ancho de pinza reales (no binarios). La acción es de 7 dimensiones: deltas de posición, deltas de rotación (que en este dataset son idénticamente cero, ya que la teleoperación fue solo traslacional) y un comando de pinza absoluto con convención `{1:abrir, 0:cerrar}`. La normalización min/max se recalculó específicamente para este dataset y se guarda en `dataset_stats.json`.

## Capacidades

- Manipulación robótica de platos y utensilios: el modelo genera acciones de control para un brazo Franka a partir de observaciones visuales y un comando de lenguaje.
- Condicionamiento por lenguaje: utiliza un embedding T5 fijo de la instrucción de tarea, que debe coincidir exactamente con el texto usado en entrenamiento.
- Generación de video: al estar basado en Wan2.2-TI2V-5B, el modelo incorpora capacidades de generación de video, aunque su propósito principal es el control motor.
- Procesamiento multi-cámara: integra dos vistas RGB (agentview y muñeca) concatenadas horizontalmente.
- Control de pinza con anchos reales: acepta valores continuos de apertura de pinza en lugar de comandos binarios.
- No soporta tool calling ni funciones de agente: es un modelo de política visuomotora, no un LLM conversacional.
- Multilingüe: no, la instrucción está fijada en inglés y el embedding es específico para esa cadena.

## Casos de uso

- Investigación en aprendizaje por imitación para robótica: el modelo sirve como referencia para estudiar el entrenamiento desde cero de políticas visuomotoras con arquitecturas de video+acción sobre datos teleoperados.
- Evaluación de políticas en tareas de mesa: puede desplegarse en un entorno simulado o real para validar la ejecución de la tarea de recoger platos y colocar cubiertos en platos de colores.
- Benchmarking de arquitecturas VLA: al estar disponible el código de entrenamiento y los checkpoints, permite comparar el rendimiento de FastWAM frente a otras arquitecturas en la misma tarea.
- Desarrollo de sistemas de control robótico con condicionamiento por lenguaje: el flujo de embedding T5 fijo y coincidencia byte-exacta es un ejemplo de cómo integrar instrucciones textuales en un pipeline de control.
- Estudio de transferencia de modelos base de video a control robótico: el uso de Wan2.2-TI2V-5B como base y la inicialización ActionDiT linear-interp son puntos de partida para investigar la reutilización de pesos de generación de video.
- Reproducción de experimentos: los hashes SHA-256 de los checkpoints y las estadísticas de normalización permiten verificar la integridad de los pesos y reproducir el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no ha sido evaluado en un robot físico; el estado indica que la ejecución de entrenamiento está completa pero la evaluación está pendiente.

## Requisitos de hardware

- Entrenamiento: se realizó en 4 GPU H200 con DeepSpeed ZeRO-1 y precisión bf16.
- Inferencia: no se especifican requisitos, pero el tamaño del repositorio (72,3 GB) y la ausencia de cuantizaciones indican que se necesita una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB o H100). No cabe en GPUs de consumo como RTX 4090 (24 GB) sin cuantización.
- Opciones de despliegue: no se mencionan frameworks como vLLM u Ollama; el modelo está pensado para ejecutarse con PyTorch y el código incluido en `training_code/`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se mencionan modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en un robot; su rendimiento real en tareas físicas es desconocido.
- La instrucción de tarea debe coincidir byte a byte con la cadena usada en entrenamiento; cualquier variación invalida el embedding T5 en caché.
- Los deltas de rotación en la acción son idénticamente cero, por lo que el modelo no está entrenado para movimientos con rotación del efector.
- La normalización requiere las estadísticas exactas de `dataset_stats.json`; no se pueden usar estadísticas preentrenadas.
- Los archivos `.pt` pueden contener objetos pickled; deben cargarse únicamente en entornos confiables.
- No se afirma licencia para el código upstream incluido; los términos originales de Wan2.2 y otros componentes continúan aplicándose.
- El modelo depende de componentes externos (Wan VAE, código FastWAM) que no están incluidos en el repositorio; no es un checkpoint autónomo.
- Solo soporta la tarea específica de manipulación de platos y utensilios con la configuración de cámaras y estado descrita.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SleepMastger/dish-utensil-fastwam-v2
- Dataset de manipulación: https://huggingface.co/datasets/SleepMastger/dish-utensil-manipulation
- Referencia al modelo base Wan2.2-TI2V-5B: Wan-AI/Wan2.2-TI2V-5B (mencionado en la model card, sin enlace directo)
