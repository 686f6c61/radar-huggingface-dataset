# drwahl/pi05_so101_block_stack_sim

## Resumen

El modelo `drwahl/pi05_so101_block_stack_sim` es un adaptador LoRA sobre el modelo base `lerobot/pi05_base` (pi0.5), desarrollado por `drwahl` para apilar un bloque de 30 mm sobre otro utilizando un brazo robótico SO-101 en simulación. Se trata de un modelo de tipo VLA (vision-language-action) especializado en una tarea de manipulación robótica concreta, entrenado sobre el dataset sintético `drwahl/so101_block_stack_sim` en su revisión `v2`. El adaptador se aplica únicamente al backbone de lenguaje Gemma 2B del modelo base, mientras que el action expert, las proyecciones densas y el codificador visual SigLIP permanecen congelados.

La relevancia de este checkpoint radica en que permite estudiar cómo un modelo preentrenado de robótica se adapta a una tarea específica mediante LoRA, y proporciona un punto de partida para evaluar políticas VLA en entornos simulados antes de transferirlas a hardware. El modelo está diseñado para integrarse en el ecosistema LeRobot y puede fusionarse con el modelo base para generar un checkpoint completo sin necesidad de cargar el adaptador por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en pi0.5, con LoRA en el backbone de lenguaje Gemma 2B |
| Parametros totales | No disponible (depende del modelo base `lerobot/pi05_base`) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA, normalizadores y checkpoint fusionado tras aplicar `train/merge.py`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning LoRA sobre `lerobot/pi05_base`, un VLA de la familia pi0.5. El adaptador se aplica exclusivamente al backbone de lenguaje Gemma 2B, mientras que el action expert y las proyecciones densas se mantienen densos (sin congelar) y el codificador visual SigLIP se congela por completo. El entrenamiento se realiza sobre el dataset `drwahl/so101_block_stack_sim` en la revisión `v2`, que contiene episodios de apilado de bloques en simulación con un brazo SO-101.

Durante la evaluación, el checkpoint se despliega sobre 150 layouts held-out y se puntúa mediante los mismos criterios que se usaron para filtrar el modelo oracle. Las secuencias de acciones se generan con Real-Time Chunking y se interpolan con una spline cúbica que preserva la forma antes de ejecutarse. El directorio `adapter/` contiene el adaptador y los procesadores de normalización; el script `train/merge.py` pliega el adaptador sobre los pesos base para producir un checkpoint que se carga sin necesidad de usar el adaptador por separado.

## Capacidades

- Ejecución de acciones motoras para apilar un bloque de 30 mm sobre otro en simulación.
- Procesamiento de observaciones visuales y del estado del brazo robótico.
- Inferencia de políticas de baja dimensión mediante un modelo VLA.
- Soporte para Real-Time Chunking en la generación y ejecución de secuencias de acciones.
- Evaluación sobre 150 layouts held-out, lo que permite medir la generalización de la política.
- Posibilidad de fusionar el adaptador con el modelo base para obtener un checkpoint completo.
- No soporta tool calling, razonamiento general ni generación de texto libre; su dominio es exclusivamente la tarea de apilado.

## Casos de uso

- Investigación en políticas VLA: permite estudiar cómo un modelo preentrenado como pi0.5 se adapta a una tarea de manipulación concreta mediante un adaptador LoRA, comparando el rendimiento con el modelo base sin adaptar.
- Validación de pipelines de entrenamiento en simulación: sirve para reproducir y depurar el proceso de entrenamiento con datos sintéticos antes de invertir en la recogida de datos en hardware real.
- Benchmark de generalización: los 150 layouts held-out ofrecen un marco reproducible para evaluar la robustez de la política ante variaciones de posición del bloque o del brazo.
- Estudio de estrategias de ejecución: permite comparar el impacto del Real-Time Chunking y de la interpolación cúbica en la calidad de las acciones ejecutadas, ya que ambos están integrados en el flujo de evaluación.
- Transferencia a hardware: al ser un adaptador LoRA, se puede continuar el fine-tuning con datos reales, siguiendo la misma receta que `drwahl/pi05_so101_block_stack`, que entrena con episodios simulados y físicos y es el checkpoint que se ejecuta en el brazo.
- Integración con LeRobot: el checkpoint respeta el formato del ecosistema LeRobot y puede cargarse en los módulos de evaluación de este framework, facilitando la comparación con otros modelos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card menciona una evaluación sobre 150 layouts held-out con criterios de puntuación basados en los gates que filtraron al modelo oracle, pero no se proporcionan valores numéricos.

## Requisitos de hardware

No se dispone de datos concretos sobre VRAM, GPU recomendada, latencia o throughput en la información proporcionada. El checkpoint es un adaptador LoRA que requiere el modelo base `lerobot/pi05_base` para la inferencia. El repositorio completo pesa 11.9 GB, lo que sugiere que el modelo fusionado tiene un tamaño considerable. El despliegue puede realizarse mediante el framework LeRobot, pero no se especifican los requisitos mínimos de hardware.

## Comparativa con modelos similares

| Modelo | Base | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| `drwahl/pi05_so101_block_stack_sim` | `lerobot/pi05_base` | Solo simulación | Apache 2.0 | HuggingFace |
| `drwahl/pi05_so101_block_stack` | `lerobot/pi05_base` | Simulación + hardware | Apache 2.0 | HuggingFace |
| `lerobot/pi05_base` | No aplica | Preentrenamiento de pi0.5 | No especificada | HuggingFace |

Las diferencias principales son cualitativas: el modelo en cuestión se entrena únicamente con episodios simulados, mientras que `drwahl/pi05_so101_block_stack` combina simulación y datos de hardware y es el que se utiliza sobre el brazo físico. El modelo base es el checkpoint preentrenado sin adaptar. No se dispone de datos comparativos numéricos de parámetros, contexto ni rendimiento.

## Limitaciones y advertencias

- Modelo altamente especializado: solo sabe apilar un bloque de 30 mm en simulación; no generaliza a otras tareas, objetos o entornos.
- No es un modelo de lenguaje: aunque utiliza un backbone de lenguaje, no ofrece capacidades de generación de texto, razonamiento general ni comprensión conversacional.
- Riesgo de sobreajuste: entrenado sobre un dataset sintético con 150 layouts, puede fallar en escenarios no vistos o al transferirse a hardware real sin un fine-tuning adicional.
- Dependencia del modelo base: el adaptador requiere `lerobot/pi05_base`; cualquier cambio en el modelo base puede romper la compatibilidad.
- Sesgos heredados: el modelo puede heredar sesgos del preentrenamiento de pi0.5, aunque su ámbito de aplicación es demasiado específico para que estos sean evidentes en la tarea de apilado.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario es responsable de evaluar el comportamiento del modelo en su caso de uso particular.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drwahl/pi05_so101_block_stack_sim
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/drwahl/so101_block_stack_sim/tree/v2
- Repositorio de entrenamiento: https://github.com/danwahl/vla-test
- Modelo relacionado (sim + hardware): https://huggingface.co/drwahl/pi05_so101_block_stack
- Referencia del brazo SO-ARM100: https://github.com/TheRobotStudio/SO-ARM100
