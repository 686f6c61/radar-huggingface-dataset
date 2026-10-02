# jren313/starvla-pipette-tube-pick-r1

## Resumen

`jren313/starvla-pipette-tube-pick-r1` es una politica de vision-lenguaje-accion (VLA) para robotica, resultado de un ajuste fino de `nvidia/GR00T-N1.7-3B` mediante el framework starVLA. El modelo está especializado en UNA sola fase (fase 2) de un flujo de trabajo de pipeteo sobre banco de laboratorio, ejecutado por un humanoide Unitree G1 equipado con manos Inspire. La tarea concreta es "coger el tubo de la gradilla azul de la izquierda con la mano izquierda", mientras la mano derecha mantiene la pipeta durante todo el proceso. Está publicado por el usuario de HuggingFace jren313 (Jiming Ren) y su card lo marca explícitamente como checkpoint de investigación, ya superado por una ronda posterior (`starvla-pipette-tube-pick-r2`).

Técnicamente hereda la arquitectura de GR00T-N1.7-3B: un VLM Cosmos-Reason2-2B combinado con una cabeza DiT de flow-matching de 32 capas con atención alternativa visión-lenguaje, en un esquema de ajuste fino completo (tanto el LLM como el codificador visual se reentrenan). El modelo consume dos cámaras (cabeza a 1280x720 y muñeca izquierda a 1080x1080), una frase de tarea y un vector de estado de 59 dimensiones, y produce chunks de acción de 30 pasos (0,5 s a 60 Hz). El repositorio pesa 19,1 GB.

Su relevancia es de nicho: es una pieza más dentro de una serie de siete checkpoints por fase publicados por el mismo autor, y sirve sobre todo como referencia de metodología de ajuste fino de politicas VLA sobre hardware humanoide real. Para producción generalista no es un modelo útil: es una política de un único paso de tarea, sin licencia declarada y con cero descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (Cosmos-Reason2-2B) + cabeza DiT de flow-matching de 32 capas con atencion alternativa VL; `select_layer` 16; 4 pasos de inferencia; ranura de encarnacion (embodiment slot) 25 |
| Parametros totales | Aproximadamente 3.000 millones (heredados de nvidia/GR00T-N1.7-3B; carga 1:1 de 1.031 tensores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (las frases de tarea del dataset estan en ingles) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`.pt`: `steps_875_pytorch_model.pt` servido y `final_model/pytorch_model.pt`); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.7-3B` y se inicializa dentro de starVLA como `CosmosGR00TN1d7`, con carga 1:1 de los 1.031 tensores del checkpoint base. La columna vertebral es un VLM Cosmos-Reason2-2B que actua como codificador multimodal, seguido de una cabeza DiT (Diffusion Transformer) de 32 capas con atención alternativa visión-lenguaje que genera acciones por flow-matching en 4 pasos de inferencia. Se trata de un ajuste fino completo (`tune_llm` y `tune_visual` activos) con gradient checkpointing, no de un ajuste de adaptadores.

La observación combina dos cámaras (cabeza a 1280x720 y la eye-in-hand de la muñeca izquierda a 1080x1080), redimensionadas a 270 y recortadas a 256 con recorte central en el servicio, la frase de tarea y un vector de estado de 59 dimensiones (29 articulaciones, pose6 de muñeca izquierda/derecha medidas, pose6 de muñeca izquierda/derecha comandadas, `thumb_bend` izquierdo comandado y mano derecha de 5 valores). Se aplica un *state dropout* de 0,8: el vector de estado completo se pone a cero en el 80 % de las muestras de entrenamiento para forzar que la cabeza lea las cámaras. La acción son chunks de 30 pasos (0,5 s a 60 Hz); las muñecas son relativas al chunk respecto a la pose comandada en el primer paso, las manos son registros Inspire y los 14 ángulos articulares absolutos opcionales solo sirven para inicializar la IK del puente. Las estadísticas de normalización se calculan por fase sobre sus propios episodios de entrenamiento y nunca se comparten entre espacios de acción.

Los datos provienen del dataset `jren313/g1-pipette-2view-teleop0925-5task-eerel`: 237 episodios teleoperados a 60 Hz, con una frase de objetivo por paso, sobre un banco de pipeteo de cinco fases. Cada fase entrena en solitario con los episodios de su paso y con una partición train/test a nivel de grabación. Se descarta un ancla de entrenamiento cuando ninguna muñeca comandada se mueve 1 mm durante su chunk (filtro de pausas, solo en la mezcla de entrenamiento). La optimización usa AdamW 8-bit paginado, betas (0,9, 0,95), weight decay 0, LR de 2e-5 para el backbone e interfaz VL y 2e-4 para la cabeza de acción, coseno hasta 1e-6 tras 100 pasos de calentamiento, recorte de norma de gradiente 1,0, batch 128 (32 x 4 GPUs, sin acumulación), 10 épocas y semilla 42. La selección del checkpoint servido se hace por MSE sobre una porción fija de 480 muestras de test, evaluada aproximadamente una vez por época; el checkpoint servido es `steps_875` (el de menor pérdida retenida entre los guardados), mientras que el fin de entrenamiento es el paso 1351.

## Capacidades

- Generación de acciones motoras para un brazo y mano concretos: política de imitación que produce chunks de 30 pasos a 60 Hz para el humanoide Unitree G1 con manos Inspire.
- Percepción visual multi-cámara: consume simultáneamente una cámara de cabeza y una cámara de muñeca (eye-in-hand), lo que permite guiar el agarre de forma reactiva.
- Condicionamiento por lenguaje: la tarea se especifica mediante una frase ("Pick up the tube from the blue rack on the left with the left hand.").
- Ejecución especializada de una sola fase del flujo de pipeteo: agarre del tubo de la gradilla azul con la mano izquierda; no cubre el resto de fases.
- Manejo de espacio de acción de 32 dimensiones (muñecas relativas + manos absolutas + articulaciones).
- Tolerancia parcial a la falta de información de estado gracias al *state dropout* de 0,8 entrenado, que obliga a depender de las cámaras.
- No dispone de tool calling, function calling, modo de razonamiento explícito ni capacidades de audio.

## Casos de uso

- Investigación en manipulación bimanual: servir como punto de partida o referencia para reproducir el ajuste fino de políticas VLA sobre GR00T-N1.7-3B en tareas de precisión, dado que el repositorio incluye configs, launcher y logs completos.
- Pipeteo automatizado de laboratorio (fase de recogida de tubo): integrar este checkpoint junto con los otros seis de la serie para componer un flujo de cinco fases sobre banco de laboratorio, encadenando las políticas por fase.
- Estudio de esquemas de selección por holdout: el checkpoint servido se eligió por MSE sobre una porción fija de 480 muestras, lo que permite estudiar métricas de selección en unidades físicas (mm, grados, registros) frente a una línea base de "no moverse".
- Evaluación de robustez ante pérdida de estado: al haberse entrenado con *state dropout* 0,8, resulta útil para medir cuánto depende la política de la propiocepción frente a la visión.
- Teleoperación asistida en entornos de laboratorio: como capa de asistencia donde el operario supervisa un agarre preciso de tubos con la mano izquierda manteniendo la pipeta en la derecha.
- Referencia metodológica para reproducibilidad: comparar recetas de ajuste (LR diferenciado backbone/cabeza, recorte de gradiente, mezcla de datos con filtro de pausas) en hardware humanoide.
- Benchmarking interno frente a cabezas QwenOFT: la propia card indica que los checkpoints GR00T por fase funcionan "claramente mejor" que las cabezas QwenOFT entrenadas con las mismas particiones, por lo que sirve como término de comparación interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card describe únicamente la metodología de evaluación (MSE de holdout sobre una porción fija de 480 muestras, comparación en unidades físicas —mm, grados, registros— frente a las etiquetas reales y frente a una línea base de "hold still", con la advertencia de que el MSE normalizado no es [texto cortado en el material disponible]), pero no incluye cifras concretas. El autor indica además que, sobre el robot, estos checkpoints "todavía no completan su fase de forma fiable".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con un modelo de aproximadamente 3.000 millones de parametros, una inferencia en precision de 16 bits requeriria del orden de 6-8 GB solo para pesos (estimacion derivada del recuento de parametros, no confirmada en la informacion). A ello hay que sumar activaciones y el coste de las dos camaras.
- Entrenamiento: se realizo en 4 GPUs con batch 32 por GPU (batch total 128), sin acumulacion, y con gradient checkpointing. El modelo base tiene 3B parametros y se hizo ajuste fino completo.
- GPU recomendadas: no disponible. Para reproducir el ajuste fino completo de un modelo de 3B en 4 GPUs se necesitarian aceleradores de clase profesional (A100/H100 o equivalentes); no se especifica el modelo exacto empleado.
- Compatibilidad con GPU de consumo: no disponible. Un ajuste fino completo de 3B puede ser ajustado en GPUs de consumo con memoria suficiente, pero la informacion no confirma ninguna configuracion concreta; la inferencia del checkpoint servido (~3B) podria en principio caber en GPUs de consumo de gama alta si se cuantiza, pero no hay dato publicado.
- Opciones de despliegue: no disponible en la informacion proporcionada. No se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser una politica robotica, el despliegue se realiza presumiblemente mediante el stack de servicio de starVLA/GR00T, pero no se detalla.
- Latencia y throughput: no disponibles. El modelo produce chunks de 30 pasos (0,5 s a 60 Hz) y usa 4 pasos de inferencia por flow-matching, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Fase / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jren313/starvla-pipette-tube-pick-r1 (este) | ~3B (GR00T-N1.7-3B) | Dos camaras + frase + estado de 59-D | Fase 2: coger tubo con mano izquierda | No disponible | Publico en HF, superado por r2 |
| jren313/starvla-pipette-tube-pick-r2 | ~3B (hereda la misma receta) | Dos camaras + estado (espacio de accion distinto: wrists rel + L thumb rel + R hand abs + joints) | Fase 2 (version vigente) | No disponible | Publico en HF |
| jren313/starvla-pipette-pick-r3 | ~3B | Dos camaras + estado (32-D) | Fase 1: coger pipeta con mano derecha | No disponible | Publico en HF |
| nvidia/GR00T-N1.7-3B | ~3B | VLM + DiT flow-matching | Modelo base generalista | No disponible en la informacion | Publico en HF |

Las alternativas mas directas son los propios checkpoints hermanos de la serie (misma receta, distinta fase o distinta ronda) y el modelo base de NVIDIA. La model card menciona tambien cabezas QwenOFT entrenadas sobre las mismas particiones (`jren313/starvla-qwenoft-pipette-eerel-crop`), respecto a las cuales los checkpoints GR00T por fase rinden mejor en robot, aunque sin cifras publicadas.

## Limitaciones y advertencias

- Checkpoint de investigacion y superado: la propia model card indica "SUPERSEDED by tube pick round 2" y advierte de que los checkpoints por fase "todavia no completan su fase de forma fiable" sobre el robot.
- Alcance extremadamente estrecho: cubre una unica fase (fase 2) de un flujo de cinco pasos, con un espacio de accion y un hardware especificos (Unitree G1 con manos Inspire).
- Licencia ausente: no se declara licencia, lo que impide determinar si el uso comercial esta permitido. Tratarlo como no apto para produccion sin aclaracion del autor.
- Idiomas: no declarados; las frases de tarea del dataset estan en ingles, por lo que no hay garantia de comportamiento con instrucciones en castellano ni en otros idiomas.
- Riesgo de alucinacion en el sentido de acciones no validas: al ser una politica de imitacion entrenada con 237 episodios teleoperados, puede generalizar de forma incorrecta fuera de la distribucion de las camaras, la iluminacion o la posicion de los objetos del banco.
- Sesgos de datos: entrenado sobre una unica captura de banco (dataset `g1-pipette-2view-teleop0925-5task-eerel`, 237 episodios), con un unico robot y configuracion de camaras; la variabilidad de escena es minima.
- Dependencia de estadisticas de normalizacion: la card advierte de que hay que servir con exactamente el archivo `dataset_statistics.json` proporcionado; usar otras estadisticas invalida el comportamiento.
- Seleccion por subconjunto: el checkpoint servido se eligio por MSE sobre una porcion fija de 480 muestras, por lo que las metricas pueden no reflejar el rendimiento en el resto del test.
- Sin benchmarks publicos: no hay numeros verificables de exito de tarea ni comparaciones cuantitativas con alternativas.
- Repositorio grande (19,1 GB) por incluir tanto el checkpoint servido como el de fin de entrenamiento, configs y logs.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jren313/starvla-pipette-tube-pick-r1
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/jren313/g1-pipette-2view-teleop0925-5task-eerel
- Repositorio starVLA: https://github.com/starVLA/starVLA
- README de starVLA: https://github.com/starVLA/starVLA/blob/starVLA_dev/README.md
- Checkpoint hermano (fase 2, ronda vigente): https://huggingface.co/jren313/starvla-pipette-tube-pick-r2
- Checkpoint hermano (fase 1, r3): https://huggingface.co/jren313/starvla-pipette-pick-r3
- Checkpoint hermano (fase 1, r2): https://huggingface.co/jren313/starvla-pipette-pick-r2
- Checkpoint hermano (fase 3): https://huggingface.co/jren313/starvla-pipette-aim-r1
- Checkpoint hermano (fase 4): https://huggingface.co/jren313/starvla-pipette-tube-return-r1
- Checkpoint hermano (fase 5): https://huggingface.co/jren313/starvla-pipette-return-r1
- Cabeza QwenOFT alternativa: https://huggingface.co/jren313/starvla-qwenoft-pipette-eerel-crop
- Perfil del autor: https://huggingface.co/jren313
