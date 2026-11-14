# OPTML-Group/ResWAM-RoboDojo

## Resumen

ResWAM-RoboDojo es el checkpoint oficial multi-tarea del modelo ResWAM (Residual World-Action Model), desarrollado por el grupo OPTML (Michigan State University, Cisco, University of Michigan e IBM Research). Se trata de una política vision-language-action (VLA) aumentada con predicción de futuro, entrenada sobre el conjunto de simulación RoboDojo para manipulación bimanual con un robot ARX X5. El modelo aborda un problema concreto de los world-action models: la supervisión de observaciones futuras completas está dominada por contenido estático de fondo, lo que diluye la señal de aprendizaje sobre el movimiento del robot y los objetos.

La innovación central es el *visual residual learning*: en lugar de predecir el frame futuro completo, el modelo supervisa únicamente el cambio de características entre el frame actual y el futuro en un espacio DINOv3 congelado. Esto concentra el aprendizaje en el brazo robótico y los objetos manipulados, y produce representaciones de mayor rango. El modelo totaliza 2,3B parámetros, con un backbone de texto de 16 capas, un DiT dual-branch ligero de 0,5B entrenado mediante conditional flow matching, y un DINOv3-B/16 congelado.

Es relevante porque logra estos resultados sin preentrenamiento en trayectorias robóticas externas, con un coste computacional bajo (3,9 TFLOPs en entrenamiento y 1,4 TFLOPs en inferencia) y una latencia de 99,7 ms por chunk de acción en RTX A6000, lo que lo hace viable para despliegue en bucle cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con world-action model: backbone de texto de 16 capas + DiT dual-branch (rama de acción y rama residual) con conditional flow matching + DINOv3-B/16 congelado |
| Parametros totales | 2,3B (backbone RynnBrain-1.1-2B + DiT de 0,5B + DINOv3-B/16 congelado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

ResWAM combina un backbone de texto de 16 capas (RynnBrain-1.1-2B) con un DiT dual-branch de 0,5B que entrena conjuntamente una rama de acción y una rama residual mediante conditional flow matching, sobre un extractor DINOv3-B/16 congelado. La rama residual predice el cambio de características entre el frame actual y el futuro en el espacio DINOv3, en lugar de la observación futura completa; según el paper, este objetivo produce un mayor rango de características y concentra espacialmente la señal en el brazo y los objetos manipulados. El horizonte de acción es H=32 (posiciones articulares bimanuales de 14 dimensiones del ARX X5 más pinzas), ejecutando 10 pasos antes de replanificar.

El checkpoint se entrena sobre el conjunto oficial de entrenamiento de RoboDojo de 35 tareas, sin preentrenamiento en trayectorias robóticas externas al benchmark. La evaluación cubre 42 tareas y 54 configuraciones (2.100 episodios). El coste computacional reportado es de 3,9 TFLOPs en entrenamiento y 1,4 TFLOPs en inferencia, con 99,7 ms por chunk de acción usando 10 pasos de Euler en una RTX A6000. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de acciones robóticas bimanuales de 14 dimensiones (posiciones articulares del ARX X5 más pinzas) a partir de observaciones visuales e instrucciones.
- Predicción de futuro mediante aprendizaje residual de características en espacio DINOv3, orientada a anticipar el efecto de las acciones sobre el mundo físico.
- Manipulación multi-tarea: el checkpoint cubre las 35 tareas de entrenamiento de RoboDojo y se evalúa en 42 tareas con 54 configuraciones.
- Generalización a variaciones de escena, precisión, tareas de horizonte largo y tareas con memoria (categorías evaluadas en RoboDojo).
- Control en bucle cerrado con replanificación cada 10 pasos de un horizonte de 32.
- Despliegue en robot real: el paper reporta resultados en tareas Open, Put y Stack con 80,0 % de media y 92,7 ms de latencia.
- Soporte de tool calling, agentes, razonamiento multi-paso o capacidades multilingües: no disponible (no es un modelo de lenguaje de propósito general).

## Casos de uso

- Manipulación bimanual en simulación: evaluación y desarrollo de políticas sobre el benchmark RoboDojo, usando el checkpoint como referencia oficial de 42 tareas y 54 configuraciones para comparar nuevas propuestas.
- Investigación en world-action models: servir de base para estudiar el aprendizaje residual de características frente a la supervisión de observaciones futuras completas, con código de evaluación reproducible en el repositorio del proyecto.
- Despliegue en robot real ARX X5: el modelo ejecuta tareas de apertura, colocación y apilamiento con 92,7 ms de latencia, adecuado para control en bucle cerrado en hardware de gama media.
- Tareas de precisión: la categoría Precision obtiene el mejor resultado del checkpoint (14,75 % SR, 21,31 de score), por lo que es adecuado para escenarios que requieren colocación fina de objetos.
- Tareas de horizonte largo: con 15,75 % SR y 25,52 de score en Long-Horizon, el modelo es útil para secuencias de manipulación de varios pasos con replanificación cada 10 acciones.
- Tareas con memoria: la categoría Memory (9,00 % SR, 9,97 de score) permite abordar escenarios donde el estado relevante deja de ser visible y debe recordarse.
- Base para fine-tuning en dominios específicos: al estar bajo licencia MIT y sin preentrenamiento robótico externo, puede reentrenarse sobre conjuntos propios de demostraciones bimanuales.
- Evaluación comparativa de eficiencia: su bajo coste de inferencia (1,4 TFLOPs) permite integrarlo en pipelines de evaluación con múltiples GPUs (el script oficial admite `--gpus 0,1,2,3`).

## Benchmarks y rendimiento

Resultados reportados en el paper y en la model card:

| Benchmark | Metrica | ResWAM |
|---|---|---|
| RoboDojo (42 tareas, 54 configuraciones, 2.100 episodios) | SR media / Score medio | 9,40 % / 13,41 |
| RoboDojo - Generalization | SR / Score | 6,50 % / 9,12 |
| RoboDojo - Precision | SR / Score | 14,75 % / 21,31 |
| RoboDojo - Long-Horizon | SR / Score | 15,75 % / 25,52 |
| RoboDojo - Memory | SR / Score | 9,00 % / 9,97 |
| RoboDojo - Open | SR / Score | 1,00 % / 1,14 |
| LIBERO-Plus | SR | 81,1 % |
| RoboTwin 2.0 | SR | 93,8 % |
| Robot real (Open, Put, Stack) | SR media | 80,0 % (+10,0 % sobre π0.5) |

No se incluyen en la información disponible los resultados desglosados de los modelos comparados en LIBERO-Plus, RoboTwin 2.0 ni RoboDojo, más allá de la mejora de +10,0 % sobre π0.5 en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,3B parámetros en precisión completa se sitúa en torno a 9-10 GB de pesos, y el repositorio ocupa 9,3 GB.
- GPU de referencia reportada: RTX A6000, con 99,7 ms por chunk de acción (10 pasos de Euler) y 1,4 TFLOPs de inferencia.
- El script de evaluación oficial permite distribuir la evaluación en varias GPU (`--gpus 0,1,2,3`).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño de pesos podría caber en GPUs de 16-24 GB, pero no se documenta.
- Opciones de despliegue: inferencia mediante el script oficial `scripts/eval/eval_robodojo.py` sobre PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Throughput: no disponible; solo se reporta la latencia por chunk de acción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResWAM-RoboDojo | 2,3B | no disponible | 9,40 % SR en RoboDojo; 81,1 % en LIBERO-Plus; 93,8 % en RoboTwin 2.0 | MIT | Hugging Face |
| π0.5 | no disponible | no disponible | Referencia de comparación en robot real; ResWAM reporta +10,0 % sobre él | no disponible | no disponible |
| Alternativas VLA de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar de forma cuantitativa con π0.5 en las tareas reales Open, Put y Stack. No se dispone de datos de otros modelos comparables en RoboDojo, LIBERO-Plus ni RoboTwin 2.0.

## Limitaciones y advertencias

- Rendimiento absoluto bajo en RoboDojo: 9,40 % de éxito medio, con la categoría Open en solo 1,00 % SR, lo que limita su uso directo en producción sin fine-tuning.
- Entrenado sin preentrenamiento robótico externo, lo que reduce la generalización fuera de las distribuciones de RoboDojo y del robot ARX X5.
- El horizonte de acción está fijado a 32 pasos con replanificación cada 10; no se documenta adaptabilidad a otros robots o morfologías.
- No se dispone de información sobre sesgos, tasas de alucinación ni comportamiento fuera de distribución más allá de las categorías evaluadas.
- Idiomas soportados no disponibles; el modelo no está pensado para tareas lingüísticas generales.
- Licencia MIT: permite uso comercial, pero no se documentan garantías ni condiciones adicionales más allá de la licencia estándar.
- Los resultados de robot real se limitan a tres tareas (Open, Put, Stack) y a un único tipo de robot.
- El repositorio incluye `model.pt` con código y metadatos embebidos, lo que exige confiar en el código del autor al cargarlo; conviene revisar el repositorio de código antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/OPTML-Group/ResWAM-RoboDojo
- Colección HF: https://huggingface.co/collections/OPTML-Group/reswam-6af8906dc9b6f21539b30934
- Página del proyecto: https://chongyu-fan.netlify.app/posts/reswam/
- Código: https://github.com/OPTML-Group/ResWAM
- Paper: *ResWAM: Learning What Changes, Not What Stays, for World-Action Models* (Fan, Liu, Kompella, Corso, Liu; arXiv preprint, 2026; enlace directo no disponible en la información proporcionada)
