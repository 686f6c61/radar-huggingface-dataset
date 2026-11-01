# ib-007/vlarm_act_t1_v3_aux

## Resumen

`ib-007/vlarm_act_t1_v3_aux` es una política de imitación (imitation learning) para robótica basada en Action Chunking with Transformers (ACT), el método presentado en el artículo arXiv:2304.13705. La desarrolla el usuario `ib-007` y se distribuye a través de HuggingFace Hub usando la librería LeRobot de HuggingFace. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de observaciones (estado del robot, dos cámaras y estado del entorno), predice directamente comandos de acción de 6 dimensiones para un robot simulado del tipo `so101_sim`.

El modelo resuelve una tarea concreta de manipulación: coger cubos de colores (rojo, azul, verde) y depositarlos en una papelera. Se entrenó sobre el dataset `ib-007/vlarm_sim_t1_v2_aux`, compuesto por 993 episodios y 116.300 fotogramas a 30 FPS, capturados mediante teleoperación en simulación. La arquitectura es un transformer con decodificación de chunks de acciones, con 51.687.980 parámetros totales y un tamaño de repositorio de 1,0 GB.

Su relevancia es acotada pero clara para quien trabaja en robótica con LeRobot: sirve como referencia reproducible de un pipeline completo (dataset, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout`) para una tarea de pick-and-place en simulación, con licencia Apache 2.0 y pesos en safetensors. No obstante, no incluye resultados de evaluación publicados ni métricas de éxito, y su ámbito de aplicación está restringido al robot y a las tareas con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con predicción de chunks de acciones |
| Parametros totales | 51.687.980 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo visuomotor, no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de imitación que predice chunks de acciones cortos en lugar de pasos individuales, lo que reduce el error de acumulación y suele mejorar las tasas de éxito en tareas de manipulación. La política consume `observation.state` (6 dimensiones), dos imágenes RGB de 256×256 (`front` y `wrist`), `observation.environment_state` (3 dimensiones) y `observation.aux_cube_xy` (6 dimensiones), y produce una acción de 6 dimensiones. El modelo tiene 51.687.980 parámetros y se entrenó durante 50.000 pasos con batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot 0.6.1.

El entrenamiento se realizó sobre el dataset `ib-007/vlarm_sim_t1_v2_aux`: 993 episodios, 116.300 fotogramas a 30 FPS, con seis variantes de tarea de tipo «coger el cubo X y ponerlo en la papelera» para los colores rojo, azul y verde. No se documenta en la información disponible el número de tokens de entrenamiento (no aplica en el sentido habitual de LLM), la composición detallada del dataset más allá de las tareas, ni si se aplicaron técnicas de RLHF o DPO (no procede en imitation learning). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visuomotor de manipulación: predice acciones de 6 dimensiones a partir de estado y dos cámaras.
- Ejecución de tareas de pick-and-place sobre cubos de color (rojo, azul, verde) en simulación.
- Procesamiento multimodal de observaciones: estado del robot, imágenes frontales y de muñeca, estado del entorno y coordenadas auxiliares del cubo.
- Entrenamiento y despliegue integrados en el ecosistema LeRobot (`lerobot-train`, `lerobot-rollout`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales fuera del control robótico.

## Casos de uso

- Reproducción de un pipeline de imitation learning en simulación: sirve como ejemplo completo de entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout` sobre el robot `so101_sim`, útil para validar la instalación de LeRobot y el flujo de datos.
- Tarea de pick-and-place de cubos de color: el modelo está entrenado específicamente para colocar cubos rojos, azules y verdes en una papelera, por lo que puede usarse directamente en entornos simulados con esa consigna.
- Base para experimentos de comparación de políticas: al ser un ACT con configuración documentada (50.000 pasos, batch 16, lr 1e-5), puede servir como línea base frente a otras políticas entrenadas con el mismo dataset.
- Docencia y formación en robótica: permite ilustrar el ciclo completo de teleoperación, grabación de dataset, entrenamiento y evaluación de una política visuomotora.
- Pruebas de integración de cámaras y calibración: el modelo exige dos cámaras (`front` y `wrist`) con nombres coincidentes con las claves de observación, lo que lo convierte en un banco de pruebas para verificar la configuración de hardware y la calibración del robot.
- Desarrollo de variantes con observaciones auxiliares: la inclusión de `observation.aux_cube_xy` y `observation.environment_state` permite estudiar el efecto de información auxiliar privilegiada en el rendimiento de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros y pesos en safetensors (repo de 1,0 GB), la inferencia cabe holgadamente en GPUs de consumo, aunque no se documenta el consumo exacto.
- GPU recomendadas: no especificadas por el autor; por tamaño del modelo, cualquier GPU con suficiente memoria para cargar el checkpoint y procesar dos imágenes de 256×256 debería ser suficiente.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido número de parámetros, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ib-007/vlarm_act_t1_v3_aux | 51.687.980 | no disponible | sin evaluación publicada | Apache 2.0 | HuggingFace Hub (42 descargas) |
| Otras políticas ACT en LeRobot | no disponible | no disponible | no disponible | habitualmente Apache 2.0 | HuggingFace Hub |
| Políticas Diffusion Policy | no disponible | no disponible | no disponible | no disponible | HuggingFace Hub |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación ni tasas de éxito, por lo que se desconoce su fiabilidad real.
- El modelo está entrenado exclusivamente para el robot simulado `so101_sim` y las tareas de cubos de color; no se garantiza su transferencia a otros robots o entornos.
- Depende de dos cámaras (`front` y `wrist`) y de observaciones auxiliares (`observation.environment_state`, `observation.aux_cube_xy`); si faltan o no coinciden con las claves de entrenamiento, el despliegue fallará.
- Riesgo de sobreajuste al dataset de simulación y a posiciones concretas de los objetos; no se documenta robustez ante cambios de iluminación, distractores o nuevas posiciones.
- No procesa lenguaje natural ni tiene capacidades de razonamiento, tool calling o agentes.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El repositorio tiene un tamaño de 1,0 GB y solo 42 descargas, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ib-007/vlarm_act_t1_v3_aux
- Dataset de entrenamiento: https://huggingface.co/datasets/ib-007/vlarm_sim_t1_v2_aux
- Artículo ACT: https://huggingface.co/papers/2304.13705
- Guía LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ib-007/vlarm_sim_t1_v2_aux
