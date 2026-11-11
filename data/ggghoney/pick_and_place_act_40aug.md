# Ggghoney/pick_and_place_act_40aug

## Resumen

`pick_and_place_act_40aug` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705. La ha entrenado el usuario Ggghoney y se distribuye a través de Hugging Face Hub en formato LeRobot, con pesos en safetensors. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular y dos cámaras (frontal y superior) para producir comandos de acción de 6 dimensiones en un robot `omx_follower`.

El modelo resuelve una tarea concreta de manipulación: "Pick up the red pen and place it in the pencil case" (coger el bolígrafo rojo y dejarlo en el estuche). Se ha entrenado sobre el dataset `Ggghoney/pick_and_place_50`, con 50 episodios y 41.754 fotogramas a 30 FPS. La relevancia es la habitual de las políticas ACT: predicen trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y facilita el entrenamiento con datos de teleoperación.

El tamaño es contenido: 51.668.614 parámetros (unos 51,7 millones) y un repositorio de 0,2 GB. La licencia no está especificada en la información disponible, lo que limita su uso comercial sin aclaración previa del autor. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por paso y produce chunks de acción) |
| Tipos de cuantizacion | no disponible (pesos safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (modelo robótico; la tarea se especifica en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio LeRobot) |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación que combina un encoder de observaciones (estado articular de 6 dimensiones más dos imágenes RGB de 3×480×640) con un transformer que predice secuencias de acciones de 6 dimensiones. La innovación principal del método es el *action chunking*: en lugar de predecir una acción por paso, el modelo genera un bloque de acciones futuras, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. El paper original también introduce el *temporal ensembling*, que suaviza las predicciones solapando chunks consecutivos.

El entrenamiento se realizó con LeRobot 0.6.2 durante 12.000 pasos, batch de 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset contiene 50 episodios de teleoperación (41.754 fotogramas a 30 FPS) sobre la tarea de coger un bolígrafo rojo y meterlo en un estuche. No se documenta composición adicional del dataset, aumentos de datos (pese al sufijo "40aug" del nombre del repositorio, no se detalla en la model card) ni fases de RLHF o DPO, que no aplican a este tipo de política de imitación.

## Capacidades

- Control visomotor de un robot `omx_follower` con estado articular de 6 dimensiones.
- Predicción de chunks de acción de 6 dimensiones a partir de dos cámaras (`front` y `top`) a 480×640.
- Ejecución de la tarea específica "Pick up the red pen and place it in the pencil case" entrenada con 50 episodios.
- Integración con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general ni capacidades multilingües; es una política robótica de dominio cerrado.
- No dispone de modo thinking, audio ni otras capacidades especiales documentadas.

## Casos de uso

- Automatización de una celda de pick-and-place con un robot `omx_follower`: la política ejecuta la secuencia de coger el bolígrafo y dejarlo en el estuche, adecuada para demostrar flujos de manipulación con dos cámaras y estado articular de 6 ejes.
- Prototipado de pipelines de imitación con LeRobot: sirve como referencia para validar la instalación, calibración de hardware y ejecución de `lerobot-rollout` antes de entrenar políticas propias.
- Reentrenamiento con datos propios: al ser un checkpoint ACT de 51,7 M de parámetros, se puede afinar con `lerobot-train` sobre un dataset nuevo para adaptar la tarea a otros objetos o posiciones.
- Benchmark interno de recogida de objetos pequeños: útil para medir tasas de éxito en tareas de precisión con objetos alargados (bolígrafos, herramientas) en entornos controlados.
- Docencia e investigación en aprendizaje por imitación: ejemplo reproducible de entrenamiento ACT con 50 episodios y configuración documentada (pasos, batch, learning rate, semilla).
- Pruebas de integración hardware-software: validación de cámaras OpenCV a 640×480 y 30 FPS junto con el puerto del robot antes de desplegar políticas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y dos cámaras a 480×640, el modelo es muy ligero y cabe holgadamente en GPUs de consumo, aunque no se documentan cifras exactas.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente, pero el dato no está confirmado por el autor.
- Cabe en GPU de consumo: previsiblemente sí (el repositorio pesa 0,2 GB), aunque no se especifica el modelo mínimo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el control se ejecuta a 30 FPS según la tasa del dataset, pero no se publican métricas de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ggghoney/pick_and_place_act_40aug` | 51,7 M | no aplica | sin evaluación publicada | no disponible | Hugging Face Hub (LeRobot) |
| ACT original (paper 2304.13705) | no disponible en la informacion | no aplica | tasas de éxito reportadas en el paper | no disponible en la informacion | referencia metodológica |
| Otras políticas LeRobot del Hub | no disponible | no aplica | no disponible | variable | Hugging Face Hub |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 50 episodios de un único operador y entorno, la política puede sobreajustarse a posiciones, iluminación y objetos específicos del dataset.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: la tarea está fijada en inglés y el modelo no procesa lenguaje natural general; solo ejecuta la tarea entrenada.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede garantizar el uso comercial sin consultar al autor.
- Sin evaluación en robot real: la model card indica que no se han proporcionado resultados de éxito, por lo que el rendimiento real es desconocido.
- Dependencia de hardware concreto: requiere un robot `omx_follower` y dos cámaras con los nombres `front` y `top` para que las claves de observación coincidan.
- Sin datos de cuantización ni de despliegue en GPUs específicas: las estimaciones de VRAM y latencia no están confirmadas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ggghoney/pick_and_place_act_40aug
- Dataset de entrenamiento: https://huggingface.co/datasets/Ggghoney/pick_and_place_50
- Paper ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ggghoney/pick_and_place_50
