# SebasKoedam/act_so101_training_2

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que le permite alcanzar tasas de éxito elevadas a partir de datos de teleoperación. El repositorio `SebasKoedam/act_so101_training_2` contiene una política ACT entrenada con LeRobot sobre un robot de tipo `so_follower` (SO-101), con dos cámaras (`top` y `wrist`) y un espacio de acciones de 6 dimensiones.

Se trata de un modelo de robótica orientado a una única tarea concreta: "Pick up the red cube and place it in the grey box". El entrenamiento se realizó sobre un dataset muy reducido de 5 episodios y 2119 fotogramas a 30 FPS, durante 5000 pasos con batch size 8 y optimizador AdamW a una tasa de aprendizaje de 1e-5. El checkpoint ocupa 0,2 GB y contiene 51.668.614 parámetros.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot para robótica de imitación en hardware de bajo coste. No es un modelo de propósito general ni un modelo de lenguaje: es una política visomotora específica, sin resultados de evaluación publicados ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica; no procesa lenguaje natural como entrada) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones multimodales (estado de las articulaciones y dos flujos de imagen) a un chunk de acciones futuras, en lugar de predecir una sola acción por paso. La política consume `observation.state` con forma `(6,)`, `observation.images.top` con forma `(3, 240, 320)` y `observation.images.wrist` con forma `(3, 240, 320)`, y produce `action` con forma `(6,)`. El modelo sigue el paper arXiv:2304.13705 y se ha entrenado y publicado mediante LeRobot 0.6.2.

El entrenamiento se realizó sobre el dataset `SebasKoedam/so101_training_1_20261105_114909`, compuesto por 5 episodios y 2119 fotogramas a 30 FPS, con una única instrucción de tarea. La configuración reportada es de 5000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documentan detalles sobre aumentos de datos, composición del dataset más allá del recuento de episodios, ni fases de RLHF o DPO (no aplicables a este tipo de política).

## Capacidades

- Control visomotor de un robot `so_follower` (SO-101) a partir de dos cámaras y del estado articular.
- Predicción de chunks de acciones de 6 dimensiones para ejecución en bucle cerrado.
- Ejecución de una tarea concreta de manipulación: recoger un cubo rojo y colocarlo en una caja gris.
- Aprendizaje por imitación a partir de datos de teleoperación, sin recompensas explícitas.
- Integración con el ecosistema LeRobot para rollout (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Reproducción de un pipeline de imitación de extremo a extremo: sirve como referencia para validar la instalación de LeRobot, la calibración del SO-101 y el flujo `lerobot-train` → `lerobot-rollout` antes de abordar tareas propias.
- Recogida y colocación de objetos en entornos controlados: la política está entrenada para "Pick up the red cube and place it in the grey box", por lo que es adecuada para demostraciones de pick-and-place con posiciones y condiciones de iluminación similares a las del dataset.
- Docencia y formación en robótica de imitación: el tamaño reducido (0,2 GB, ~51,7 M de parámetros) y el hardware de bajo coste permiten ejecutar la política en un laboratorio o aula sin infraestructura de GPU de datacenter.
- Base para fine-tuning con datos propios: al estar en formato LeRobot y ser reentrenable con `lerobot-train`, puede servir como punto de partida para adaptar la política a nuevas tareas o a un robot del mismo tipo.
- Pruebas de integración de cámaras y calibración: los requisitos de dos cámaras (`top`, `wrist`) a 240×320 permiten validar la configuración de sensores y la sincronización antes de escalar a políticas más complejas.
- Comparación de métodos de imitación: útil como línea base ACT frente a otras políticas de LeRobot (por ejemplo, diffusion policy) sobre el mismo dataset y hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~51,7 M de parámetros en precisión completa el peso ronda los 0,2 GB, por lo que la huella de memoria es muy reducida y el cuello de botella es el procesamiento de las dos cámaras.
- GPU recomendadas: no especificadas por el autor; el comando de entrenamiento de referencia usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA con CUDA.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no hay cifras publicadas de latencia ni de throughput.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) como vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SebasKoedam/act_so101_training_2 | ACT (LeRobot) | 51.668.614 | no aplica | no disponible | HuggingFace |
| Políticas ACT de referencia en LeRobot | ACT (LeRobot) | no disponible | no aplica | según repositorio | HuggingFace / LeRobot |
| Diffusion Policy (LeRobot) | Política de difusión | no disponible | no aplica | según repositorio | LeRobot |
| Otros checkpoints SO-101 en el Hub | ACT / otras políticas | variable | no aplica | variable | HuggingFace |

No se dispone de datos de rendimiento comparativos publicados para esta política, por lo que la comparación se limita a categoría, formato y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (5 episodios, 2119 fotogramas): alta probabilidad de sobreajuste y de baja generalización a posiciones, iluminación u objetos distintos.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Tarea única y específica: la política está entrenada para una instrucción concreta; no es un modelo de propósito general.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Dependencia del hardware exacto: los nombres de cámara (`top`, `wrist`), la resolución (240×320) y el tipo de robot (`so_follower`) deben coincidir con los del entrenamiento.
- Riesgo de fallo silencioso en condiciones fuera de distribución: al ser una política de imitación sin mecanismo de detección de incertidumbre, puede ejecutar acciones incorrectas sin avisar.
- Sin soporte de lenguaje natural como entrada: la instrucción de tarea se pasa como cadena al rollout, pero el modelo no la interpreta semánticamente.
- Idiomas no declarados: no aplica en la práctica, pero conviene tenerlo en cuenta si se integra en interfaces multilingües.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SebasKoedam/act_so101_training_2
- Dataset de entrenamiento: https://huggingface.co/datasets/SebasKoedam/so101_training_1_20261105_114909
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SebasKoedam/so101_training_1_20261105_114909
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
