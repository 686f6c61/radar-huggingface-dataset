# qrvmil/pi05-libero-goal-bowl_on_plate-20261116

## Resumen

Pi0.5 SFT "put the bowl on the plate" es un ajuste fino supervisado (SFT) completo del modelo base `lerobot/pi05_base`, publicado por el usuario qrvmil en Hugging Face. Se trata de un modelo de política robótica (vision-language-action) especializado en una única tarea del benchmark LIBERO-goal: colocar el cuenco sobre el plato (task ID 8). El entrenamiento consistió en 1000 pasos sobre 49 demostraciones (4563 fotogramas) filtradas exactamente por esa tarea, con todos los parámetros del modelo entrenables.

El modelo parte de la arquitectura Pi0.5 de Physical Intelligence, implementada en la librería LeRobot, y conserva los 4.143.404.816 parámetros del modelo base. No es un modelo de propósito general: es un artefacto de investigación centrado en demostrar la reproducibilidad de un pipeline de SFT completo sobre una tarea concreta, con checkpoints intermedios y un protocolo de evaluación definido.

Su relevancia es limitada pero concreta: sirve como referencia para quienes trabajan con LeRobot y quieren reproducir o extender ajustes finos de políticas VLA en tareas LIBERO, y como ejemplo de buenas prácticas de publicación (checkpoints resumibles, estado del optimizador, protocolo de evaluación explícito). En el momento de redactar esta ficha, las evaluaciones de todos los checkpoints están pendientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (Pi0.5) sobre LeRobot; transformer con flow matching para generación de acciones |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en FP32; entrenamiento con autocast BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible explícitamente (checkpoints en formato LeRobot `pretrained_model`; presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo se inicializa desde `lerobot/pi05_base` y se ajusta con SFT completo: los 4.143.404.816 parámetros son entrenables, sin LoRA ni backbone congelado. El entrenamiento usó pesos en FP32 con estado de AdamW, autocast BF16, batch de 8, semilla 1000, learning rate 5e-5 con warmup de 50 pasos y decaimiento coseno hasta 5e-6 en el paso 1000. La normalización media/desviación típica proviene del dataset original, y la entrada incluye dos cámaras más una cámara enmascarada. La generación de acciones emplea flow matching con 10 pasos de inferencia, chunks de acción de longitud 50 y ejecución de 10 acciones por chunk.

El dataset es `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), filtrado por tarea exacta: 49 demostraciones y 4563 fotogramas para la tarea "put the bowl on the plate". El commit de LeRobot utilizado es `781d3daccc64e8ce3e3d0910e64b2b0180551059`. No se documentan datos de RLHF, DPO ni innovaciones adicionales más allá del pipeline estándar de Pi0.5. El tokenizador utiliza el vocabulario público oficial de Big Vision PaliGemma con IDs verificados, publicado aparte en `qrvmil/pi05-paligemma-tokenizer-20261116`.

## Capacidades

- Control robótico de una única tarea: colocar el cuenco sobre el plato en el entorno LIBERO-goal (task ID 8).
- Generación de acciones de extremo a extremo a partir de observaciones visuales (dos cámaras más una enmascarada) y control relativo del efector final a 20 Hz.
- Generación de chunks de acción de longitud 50 con ejecución de 10 acciones por chunk mediante flow matching.
- Entrada multimodal visión-lenguaje heredada del modelo base Pi0.5 (no se documentan capacidades adicionales específicas en esta ficha).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües.
- No se documenta modo de razonamiento (thinking), audio ni otras capacidades especiales.

## Casos de uso

- Reproducción de experimentos de SFT en robótica: permite replicar un ajuste fino completo de Pi0.5 sobre una tarea LIBERO con hiperparámetros y semilla documentados, útil para validar pipelines de entrenamiento en LeRobot.
- Evaluación comparativa de checkpoints: los cuatro checkpoints intermedios (250, 500, 750, 1000) permiten estudiar la evolución del éxito en una tarea concreta a lo largo del entrenamiento, con un protocolo de evaluación definido (5 intentos, semillas 1000-1004, resets duros, 256×256 píxeles, límite de 300 pasos).
- Base para ajustes finos adicionales: al estar bajo Apache 2.0 y publicarse el estado completo del optimizador y el RNG, se puede reanudar el entrenamiento o adaptarlo a tareas relacionadas de LIBERO-goal.
- Docencia y formación en VLA: sirve como ejemplo didáctico de un pipeline completo de política visión-lenguaje-acción con dataset, tokenizador y checkpoints publicados.
- Investigación en manipulación con cámaras múltiples: el uso de dos cámaras más una enmascarada y control relativo del efector final a 20 Hz es un escenario realista para estudiar robustez visual en tareas de pick-and-place.
- Referencia para publicación reproducible: el repositorio documenta revisiones de dataset, commit de LeRobot, semilla e hiperparámetros, lo que lo convierte en un caso de estudio de trazabilidad en modelos robóticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de éxito (SR) por checkpoint con los valores marcados como "pending" para los pasos 250, 500, 750 y 1000. El protocolo de evaluación especifica 5 intentos por checkpoint, lo que da una estimación gruesa en incrementos de 20 puntos porcentuales.

| Paso | Éxitos | SR |
|---:|---:|---:|
| 250 | pendiente | pendiente |
| 500 | pendiente | pendiente |
| 750 | pendiente | pendiente |
| 1000 | pendiente | pendiente |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.143.404.816 parámetros, en FP32 los pesos ocupan aproximadamente 16,6 GB; en BF16/FP16, unos 8,3 GB; en cuantizaciones de 8 bits, unos 4,1 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB, H100) sea suficiente para inferencia en FP32, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No confirmado. En BF16 podría caber en GPUs de 12-16 GB, pero es una inferencia basada en el recuento de parámetros, no un dato verificado.
- Opciones de despliegue: la model card documenta carga mediante `lerobot.policies.pi05.modeling_pi05.PI05Policy.from_pretrained` y descarga con `huggingface_hub.snapshot_download`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qrvmil/pi05-libero-goal-bowl_on_plate-20261116 | 4.143.404.816 | no disponible | Apache 2.0 | Hugging Face (LeRobot) | SFT de una sola tarea LIBERO-goal |
| lerobot/pi05_base | no disponible | no disponible | no disponible en la información | Hugging Face | Modelo base del que parte este ajuste |
| Otros ajustes LIBERO de Pi0.5 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (otros modelos VLA o ajustes LIBERO) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea "put the bowl on the plate" (task ID 8) de LIBERO-goal; no generaliza a otras tareas ni entornos.
- Evaluaciones pendientes: no hay resultados de éxito publicados; el rendimiento real es desconocido en el momento de redactar esta ficha.
- Dataset muy pequeño: solo 49 demostraciones y 4563 fotogramas, lo que limita la robustez y aumenta el riesgo de sobreajuste.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al ser un modelo visual entrenado con un dataset concreto, puede heredar sesgos de las demostraciones y del entorno de simulación.
- Riesgo de alucinación: no aplica en el sentido textual, pero el modelo puede generar acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Idiomas: no se documentan capacidades multilingües ni de lenguaje natural; el uso previsto es control robótico.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales que no se detallan en la información proporcionada.
- Reproducibilidad: depende de revisiones concretas del dataset y del commit de LeRobot indicados; cambios en esas dependencias pueden alterar el comportamiento.
- Tokenizador externo: requiere el tokenizador publicado aparte (`qrvmil/pi05-paligemma-tokenizer-20261116`) para un funcionamiento correcto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qrvmil/pi05-libero-goal-bowl_on_plate-20261116
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Tokenizador: https://huggingface.co/qrvmil/pi05-paligemma-tokenizer-20261116
- Repositorio LeRobot (commit referenciado): https://github.com/huggingface/lerobot/commit/781d3daccc64e8ce3e3d0910e64b2b0180551059
