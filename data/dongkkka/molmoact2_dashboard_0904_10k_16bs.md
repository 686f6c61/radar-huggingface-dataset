# Dongkkka/molmoact2_dashboard_0904_10k_16bs

## Resumen

Este modelo es un checkpoint intermedio (10.000 pasos de optimizador) de un adaptador LoRA sobre el modelo base `allenai/MolmoAct2`, desarrollado por el usuario Dongkkka en el ecosistema LeRobot. Está destinado a una tarea concreta de manipulación robótica: recoger una botella y colocarla en una cesta. El resultado es una política de control continuo que predice 30 pasos de acción a partir de observaciones de tres cámaras y del estado del robot.

El modelo base MolmoAct2, desarrollado por Allen AI, es un modelo de razonamiento para acciones (action reasoning model) diseñado para despliegue real, con un backbone VLM llamado MolmoER. Este checkpoint añade un LoRA de rank 64 sobre esa arquitectura y entrena un action expert completo para la política robótica. El modelo tiene 5.591.928.368 parámetros, aunque la mayoría proviene del modelo base congelado; el adaptador LoRA y el action expert son los componentes entrenables. No se especifica la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parámetros | Valor |
|---|---|
| Arquitectura | VLM transformer (MolmoAct2) con adaptador LoRA y action expert para robótica |
| Parámetros totales | 5.591.928.368 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | No se publican variantes; pesos guardados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (incluye configuración, procesadores y estado de entrenamiento) |

## Arquitectura y entrenamiento

El checkpoint es un adaptador LoRA sobre el modelo base `allenai/MolmoAct2` (revisión `e432d85f6e039edca44afb93c262f3084ab72a9c`). MolmoAct2 se basa en un backbone VLM llamado MolmoER, especializado en razonamiento espacial y encarnado, entrenado según se describe en el paper asociado con un corpus de 3,3 millones de muestras y una receta de especialización seguida de rehecho. En este snapshot, se entrena un LoRA de rank 64, alpha 16 y dropout 0,05, junto con un action expert completo para la política robótica.

El entrenamiento se realizó con batch size 16, semilla 42 y precisión BF16, alcanzando el paso 10.000 de un total previsto de 20.000. El dataset está compuesto por 28 episodios y 5.133 frames, sin split de validación. Las observaciones proceden de tres cámaras: left head, left wrist y right wrist. El espacio de estado/acción es de 22 dimensiones: los primeros 19 canales son posiciones absolutas de las articulaciones y los últimos 3 son velocidades de la base. La salida es un chunk de 30 pasos de acción con inferencia continua. La normalización quantile guardada incluye las garras y enmascara las dimensiones de acción rellenas.

## Capacidades

- Predicción de acciones continuas para control robótico: genera un chunk de 30 pasos de acción en un espacio de 22 dimensiones.
- Entrada multimodal de tres cámaras simultáneas (left head, left wrist, right wrist), permitiendo observar el robot desde distintos ángulos.
- Integración con LeRobot mediante `MolmoAct2Policy`, con preprocesado y postprocesado incluidos en el checkpoint.
- Normalización quantile de las acciones, que incluye las garras y respeta las máscaras de dimensiones rellenas.
- Inferencia continua sin reinicio, adecuada para control en bucle cerrado.
- Verificación de carga estricta: el checkpoint produce predicciones finitas de forma `(1, 30, 22)` a partir de una observación de entrenamiento sin acciones ground-truth.
- No incluye soporte de tool calling, generación de texto libre ni razonamiento multi-step fuera de la planificación de acciones robóticas.

## Casos de uso

- **Manipulación robótica pick-and-place**: el modelo controla un brazo robótico en la tarea de recoger una botella y colocarla en una cesta, prediciendo 30 pasos de acción por inferencia continua a partir de los tres streams de cámara.
- **Investigación en aprendizaje por imitación**: al estar entrenado sobre 28 episodios y 5.133 frames de demostraciones, sirve como baseline para estudiar el efecto de los checkpoints intermedios en el rendimiento de políticas.
- **Reproducción de experimentos**: la configuración exacta (batch size 16, seed 42, BF16, LoRA rank 64 y alpha 16) permite reproducir el entrenamiento y depurar el pipeline de políticas de LeRobot.
- **Validación de infraestructura de entrenamiento**: el checkpoint incluye configuración y estado para reanudar el entrenamiento, por lo que es útil para probar la carga y el reinicio de modelos VLM en entornos de robótica.
- **Análisis de fusión de múltiples vistas**: las tres cámaras (head y dos muñecas) permiten investigar cómo contribuye cada vista a la precisión de la acción en tareas de manipulación con objetos pequeños.
- **Teleoperación y transferencia**: el checkpoint se puede utilizar como punto de partida para fine-tuning en tareas similares de recoger y colocar a partir de demostraciones humanas, aprovechando la normalización quantile ya aprendida.
- **Estudio de sobreajuste**: como no hay split de validación, el modelo es útil para comparar el comportamiento en los episodios de entrenamiento frente a episodios nuevos y cuantificar el grado de memorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La verificación descrita en la model card confirma que el checkpoint carga estrictamente y produce predicciones finitas de forma `(1, 30, 22)`, pero no hay datos sobre tasa de éxito en la tarea, comparaciones con otros modelos ni métricas de generalización.

## Requisitos de hardware

- VRAM estimada en inferencia: los pesos en BF16 ocupan aproximadamente 11,2 GB (5.591.928.368 × 2 bytes); sumando activaciones y buffers se recomienda al menos 12 GB de VRAM. Con cuantización a 8 bits, la estimación baja a unos 5,6 GB.
- GPUs recomendadas: RTX 4090 (24 GB), A100 40 GB o H100 80 GB. Una RTX 4080 o inferior podría funcionar con cuantización a 8 bits, aunque no se ha verificado.
- En GPUs de consumo, cabe en una RTX 4090 en BF16 sin necesidad de cuantizar; para GPUs de 16 GB es necesario recurrir a cuantización.
- Despliegue: diseñado para el ecosistema LeRobot, con carga mediante `MolmoAct2Policy` y utilidades de pre/postprocesado. No se han documentado otros motores como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros modelos. La única referencia documentada es el modelo base `allenai/MolmoAct2`, del cual este checkpoint es un adaptador LoRA intermedio. No se conocen datos sobre alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: se entrenó hasta el paso 10.000 de un objetivo de 20.000; el rendimiento final del modelo puede diferir significativamente.
- Sin evaluación de éxito: la model card indica explícitamente que la tasa de éxito de la tarea y la generalización a episodios no vistos no se han evaluado.
- Riesgo de sobreajuste: se utilizaron los 28 episodios completos del dataset sin split de validación.
- Dependencias externas: la carga del modelo requiere acceso a los repositorios del modelo base Allen AI y a su tokenizer, que se descargan por separado.
- Licencia no disponible: no se especifica licencia para este checkpoint, lo que limita su uso comercial hasta aclarar los términos.
- Especialización extrema: el modelo solo está destinado a la tarea concreta de recoger y colocar en la configuración descrita; no es un modelo de propósito general ni apto para otras tareas sin reentrenamiento.
- Sin soporte de lenguaje ni tool calling: los datos de idiomas y capacidades conversacionales no están disponibles, y el modelo no está diseñado para ese tipo de uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Dongkkka/molmoact2_dashboard_0904_10k_16bs
- Repositorio oficial de MolmoAct2: https://github.com/allenai/molmoact2
- Paper de MolmoAct2: https://arxiv.org/abs/2605.02881
- Dataset de entrenamiento: https://huggingface.co/datasets/Dongkkka/cyclo_dashboard_0904_test_v30
- Modelo base en HuggingFace: https://huggingface.co/allenai/MolmoAct2
