# chomeed/task2_foveavla_subtask_rel_chunk50_rtc6-21_jitter0.05_bs64_1112_10k

## Resumen

`task2_foveavla_subtask_rel_chunk50_rtc6-21_jitter0.05_bs64_1112_10k` es un checkpoint de robótica basado en pi0.5 (pi05) al que se le ha añadido la extensión FoveaVLA con predicción de subtareas de alto nivel. Lo desarrolla el usuario de Hugging Face `chomeed` y deriva del modelo base `lerobot/pi05_base` mediante fine-tuning sobre el dataset propio `chomeed/first_cable_insertion_uncased`. No es un modelo de lenguaje general: es una política visuomotora (vision-language-action) para control de un brazo robótico bimanual en una tarea concreta de inserción de cable.

El modelo combina un VLM que primero escribe la subtarea actual en lenguaje natural (por ejemplo, "insert the cable into the control module") y un "action expert" que genera los comandos motores condicionados por esa subtarea. Incorpora además un mecanismo de foveación: el modelo predice cajas de recorte (bounding boxes) por cámara que alimentan vistas ampliadas en la fase de inserción. Es relevante como ejemplo de integración de razonamiento lingüístico jerárquico, atención selectiva (foveación) y real-time chunking (RTC) en una política de manipulación.

El checkpoint corresponde a 10.000 de 30.000 actualizaciones del optimizador (paso de bucle 20.000) y tiene 4.145.527.568 parámetros en formato safetensors, con un repositorio de 16,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (VLM + action expert) con extensión FoveaVLA y predicción de subtareas; framework LeRobot 0.6.2 (`pi05_foveavla_subtask`) |
| Parametros totales | 4.145.527.568 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo opera sobre observaciones de 6 cámaras y estado de 25-D; no se especifica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (entrenado en bf16 con pesos maestros fp32; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible (las subtareas se expresan en inglés en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La arquitectura parte de pi0.5 (`lerobot/pi05_base`), un modelo visión-lenguaje-acción compuesto por un VLM y un "action expert" que genera chunks de acciones. Sobre esta base, la variante FoveaVLA añade dos componentes: (1) predicción de subtarea de alto nivel, donde el VLM escribe primero la subtarea actual tras el prompt y el action expert condiciona sus acciones sobre ella; y (2) foveación, con 4 slots de caja por cámara (zed_mini, d405_left, d405_right) que predicen la caja de cada cámara en t+8 (4 clases sobre 1024 bins), aunque el action expert nunca ve esas cajas directamente. En la fase de inserción, la vista de recorte de cada cámara se rellena con la caja de la consulta anterior estirada al tamaño del recorte; en las fases de agarre o giro de cabeza, el recorte se enmascara fuera de la atención como si faltara una cámara.

El entrenamiento se realizó con batch efectivo de 64 (32 por GPU en una B200 con acumulación de gradiente 2), optimizador AdamW con lr pico 2,5e-05, warmup de 2000 pasos y decaimiento coseno hasta 2,5e-06 en 60.000 pasos de bucle (1.000/30.000 actualizaciones). Se usó precisión bf16 con pesos maestros fp32 y gradient checkpointing. La pérdida de entrenamiento en este paso es 0,145. Se incorpora RTC (real-time chunking, Black et al. 2025): cada muestra recibe un retardo de inferencia simulado d, con probabilidad 0,1 de ser 0 (primer chunk sin prefijo) y, en otro caso, uniforme en [6, 21] pasos (200-700 ms a 30 Hz); las primeras d acciones entran limpias en el action expert (tiempo de flujo 0) y se excluyen de la pérdida de flujo. Además, en entrenamiento se aplica jitter del 5 % del ancho y alto a la ventana de recorte en la fase de inserción. La normalización usa las estadísticas de la rama `rel_chunk50` del dataset (acciones del brazo relativas al estado actual sobre chunks de 50 pasos, tres comandos de mano absolutos) y las etiquetas de subtarea de la rama `foveavla_subtask_early45f`.

## Capacidades

- Predicción de subtareas de alto nivel en lenguaje natural a partir de las observaciones (por ejemplo, "grasp the cable with the right hand", "turn the head to the center", "insert the cable into the control module").
- Generación de chunks de acciones de 10 dimensiones con longitud 50 (n_action_steps 30), relativas al estado actual salvo tres articulaciones de la mano que se mantienen absolutas (`right_thumb_joint1`, `right_index_joint2`, `right_index_joint3`).
- Procesamiento de 6 cámaras (d405_left, d405_right, zed_mini, fovea_zed_mini, fovea_d405_left, fovea_d405_right) y estado de 25-D.
- Foveación selectiva: predicción de cajas por cámara y uso de vistas recortadas ampliadas en la fase de inserción.
- Soporte de real-time chunking (RTC) entrenado, con prefijo de acciones previas y gestión de retardo de inferencia (6-21 pasos).
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad general; el modelo está especializado en una tarea de manipulación.
- Capacidades multilingües: no disponible.
- Modo de razonamiento (thinking): no disponible; la subtarea escrita actúa como razonamiento intermedio explícito.

## Casos de uso

- Inserción de cable en un módulo de control: es la tarea objetivo del fine-tuning; el modelo predice la subtarea de inserción y genera acciones relativas de 10-D con chunks de 50 pasos, usando las vistas foveadas para localizar el conector.
- Manipulación bimanual con cámara de muñeca y cámara externa: el modelo integra 6 flujos de vídeo y un estado de 25-D, adecuado para setups con múltiples cámaras (d405 y zed_mini) y control fino de mano.
- Control en tiempo real con latencia variable: gracias al entrenamiento con RTC (retardos de 6-21 pasos a 30 Hz), puede desplegarse en bucles de control donde la inferencia no es instantánea, reutilizando el prefijo no ejecutado del chunk anterior.
- Investigación en políticas jerárquicas VLA: sirve como referencia para estudiar cómo la predicción explícita de subtareas condiciona el action expert y mejora la interpretabilidad del comportamiento.
- Estudio de atención selectiva (foveación) en robótica: el mecanismo de cajas por cámara y recortes ampliados permite analizar cómo la resolución efectiva afecta a tareas de precisión como la inserción.
- Reproducción de experimentos con LeRobot: el checkpoint incluye los procesadores pre/post (`policy_preprocessor_*` y `policy_postprocessor_*` en safetensors), lo que permite cargar la política con sus estadísticas de normalización exactas para replicar resultados.
- Base para fine-tuning en tareas de ensamblaje similares: al derivar de `lerobot/pi05_base` y usar la rama `subtask-rtc` de `lerobot_foveavla`, puede adaptarse a otras tareas de inserción con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de entrenamiento en este paso (0,145) y los detalles del run de Weights & Biases.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.145.527.568 parámetros en bf16, los pesos ocupan aproximadamente 8,3 GB, a lo que hay que sumar activaciones, buffers de las 6 cámaras y el estado del action expert.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA B200; para inferencia se requiere una GPU con suficiente memoria para bf16 (orientativamente 16 GB o más, aunque no se documenta oficialmente).
- ¿Cabe en GPU consumer? No confirmado; por tamaño de pesos en bf16 podría caber en GPUs de 24 GB (RTX 4090, RTX 3090), pero no hay datos publicados de despliegue en consumer.
- Opciones de despliegue: LeRobot 0.6.2 con el paquete `lerobot_policy_pi05_foveavla` (rama `subtask-rtc`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a una política VLA de robótica).
- Latencia y throughput: no disponibles; el RTC está calibrado para retardos de 6-21 pasos a 30 Hz (200-700 ms).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| task2_foveavla_subtask_rel_chunk50_rtc6-21_jitter0.05_bs64_1112_10k | 4.145.527.568 | no disponible | Inserción de cable (VLA con subtareas y foveación) | no disponible | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | Política VLA base (pi0.5) | no disponible | Hugging Face |
| Otros checkpoints de chomeed sobre pi05 | no disponible | no disponible | Variantes de la misma tarea | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado exclusivamente para la tarea de inserción de cable del dataset `chomeed/first_cable_insertion_uncased`; no es un modelo de propósito general.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse con el autor antes de cualquier despliegue productivo.
- Idiomas no disponibles: las subtareas y prompts están en inglés; no hay evidencia de soporte multilingüe.
- Riesgo de alucinación en la subtarea: al ser un VLM que escribe la subtarea en lenguaje natural, puede predecir una subtarea incorrecta y condicionar erróneamente al action expert.
- Dependencia de calibración de cámaras y cajas: el mecanismo de foveación asume cámaras concretas (d405_left, d405_right, zed_mini) y un formato de cajas normalizadas xyxy; cambios en el setup invalidan el modelo.
- Restricciones de RTC: retardos de inferencia por debajo de 6 se elevan a 6 y por encima de 21 se rechazan; requiere LeRobot 0.6.2 (0.6.1 no soporta tiempo de flujo por token).
- Checkpoint intermedio: corresponde a 10.000 de 30.000 actualizaciones; no es el modelo final de la run.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas fuera del conjunto de entrenamiento.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al ser un modelo de robótica el riesgo relevante es de fallo físico en la manipulación, no de sesgo lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_foveavla_subtask_rel_chunk50_rtc6-21_jitter0.05_bs64_1112_10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/chomeed/first_cable_insertion_uncased
- Repositorio del framework: https://github.com/HDR-SRL/lerobot_foveavla/tree/subtask-rtc (rama `subtask-rtc`)
- Paper RTC (Black et al. 2025): https://arxiv.org/abs/2512.05964
- Run de entrenamiento (Weights & Biases): https://wandb.ai/meeroro56/hyundai_duet/runs/wk74j3bv
