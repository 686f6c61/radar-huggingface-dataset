# jren313/starvla-pipette-return-r1

## Resumen

`jren313/starvla-pipette-return-r1` es un checkpoint de política robótica (Vision-Language-Action, VLA) desarrollado por Jiming Ren (usuario `jren313`) y obtenido mediante un ajuste fino completo del modelo base `nvidia/GR00T-N1.7-3B` con el framework starVLA. No es un modelo de propósito general: es una política especializada en una única fase de un flujo de trabajo de pipeteo sobre banco de laboratorio, ejecutada por un robot humanoide Unitree G1 equipado con manos Inspire. Concretamente, la fase 5 consiste en devolver la pipeta sostenida en la mano derecha al soporte situado a la derecha, abriendo los dedos al final, mientras la mano izquierda permanece inactiva.

El modelo recibe como observación dos cámaras RGB (cabeza y muñeca izquierda), una frase de tarea en inglés y un vector de estado de 59 dimensiones, y produce un chunk de acción de 30 pasos (0,5 s a 60 Hz) en un espacio de acción de 32 dimensiones que combina poses relativas de muñeca, registros de mano Inspire y articulaciones absolutas de brazo. La arquitectura heredada del modelo base combina un VLM Cosmos-Reason2-2B con una cabeza de acción DiT de 32 capas con flow-matching y atención VL alternada.

Su relevancia es fundamentalmente investigadora: forma parte de una familia de siete checkpoints por fase (recogida, pipeteo, devolución de tubo, etc.) publicados por el mismo autor, y sirve como evidencia empírica de que los checkpoints GR00T ajustados por fase funcionan claramente mejor que las cabezas QwenOFT entrenadas sobre las mismas particiones de datos. El autor lo etiqueta explícitamente como *research checkpoint* y advierte de que todavía no completa su fase de forma fiable en el robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM Cosmos-Reason2-2B + cabeza de accion DiT de 32 capas con atencion VL alternada y flow-matching (herencia de GR00T-N1.7); `select_layer` 16, ranura de embodiment 25 |
| Parametros totales | 3B (modelo base `nvidia/GR00T-N1.7-3B`); ajuste fino completo de todos los tensores (1.031 tensores cargados 1:1) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible (la observacion es una frase de tarea + 2 imagenes + vector de estado de 59-D; no se documenta ventana de contexto en tokens) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints PyTorch en precision de entrenamiento) |
| Idiomas soportados | no disponible; las frases de tarea del dataset y de la familia de checkpoints estan en ingles |
| Licencia | no disponible en el repositorio; el modelo deriva de `nvidia/GR00T-N1.7-3B`, cuyas condiciones deben consultarse en el repositorio original |
| Formato de pesos | PyTorch (`.pt`): `gr00t/checkpoints/steps_3000_pytorch_model.pt` (servido) y `gr00t/final_model/pytorch_model.pt` (paso 3013) |
| Tamano del repositorio | 19,1 GB |
| Espacio de accion | 32-D: muñecas relativas al chunk + pulgar izquierdo relativo + mano derecha absoluta + 14 articulaciones absolutas de brazo |
| Frecuencia de control | 60 Hz, chunks de 30 pasos (0,5 s) |

## Arquitectura y entrenamiento

El modelo se inicializa desde `nvidia/GR00T-N1.7-3B` mediante la implementación `CosmosGR00TN1d7` de starVLA. La carga es 1:1 para los 1.031 tensores del checkpoint original. La arquitectura combina un backbone visual-lenguaje Cosmos-Reason2-2B (con extracción de características en la capa 16) y una cabeza de acción DiT de 32 capas con atención VL alternada que genera acciones mediante flow-matching en 4 pasos de inferencia. El ajuste fino es completo (`tune_llm` y `tune_visual` activos) con *gradient checkpointing*.

La observación consta de dos cámaras: RGB de cabeza a 1280×720 y cámara *eye-in-hand* `wrist_left` a 1080×1080, redimensionadas a 270 y recortadas en el centro a 256 en el momento del servicio. Se añade la frase de tarea y un vector de estado de 59 dimensiones (29 articulaciones, pose medida de muñeca izquierda y derecha, pose comandada de ambas muñecas, `thumb_bend` comandado de la mano izquierda y 5 valores de la mano derecha). Se aplica *state dropout* de 0,8: el vector de estado completo se pone a cero en el 80 % de las muestras de entrenamiento, forzando a la cabeza a leer las cámaras.

Los datos provienen del dataset `jren313/g1-pipette-2view-teleop0925-5task-eerel`: 237 episodios teleoperados a 60 Hz de una captura de banco de cinco pasos, con una frase de objetivo por paso. Cada fase se entrena de forma aislada sobre los episodios de su propio paso, con partición train/test a nivel de grabación (las mitades de recogida y devolución de una misma grabación permanecen en el mismo lado). Se descarta un ancla de entrenamiento cuando ninguna de las muñecas comandadas se mueve 1 mm a lo largo de su chunk (filtro de pausa, solo en la mezcla de entrenamiento). La normalización se calcula por fase sobre sus propios episodios y nunca se comparte entre espacios de acción.

La optimización usa paged AdamW de 8 bits con betas (0,9; 0,95) y *weight decay* 0, learning rate de 2e-5 para el backbone y la interfaz VL y 2e-4 para la cabeza de acción, con decaimiento coseno hasta 1e-6 tras 100 pasos de calentamiento, recorte de norma de gradiente de 1,0, batch de 128 (32 × 4 GPU, sin acumulación), 10 épocas y semilla 42. La selección del checkpoint se realiza por MSE sobre una partición fija de 480 muestras de test (4 rangos × 10 batches × 12) evaluada aproximadamente una vez por época; el checkpoint servido es el de menor pérdida guardado. Las fases se comparan en unidades físicas (mm, grados, registros) frente a las etiquetas reales sobre esas mismas 480 muestras, junto a una línea base de "mantenerse quieto".

## Capacidades

- Generación de acciones de manipulación: produce chunks de 30 pasos a 60 Hz para control de un humanoide Unitree G1 con manos Inspire.
- Condicionamiento por lenguaje: acepta una frase de tarea en inglés que describe la fase a ejecutar ("Put the pipette held in the right hand back into the holder on the right.").
- Percepción multimodal: consume dos flujos de vídeo RGB (cabeza y muñeca izquierda) más un vector de estado proprioceptivo y táctil de 59 dimensiones.
- Control bimanual asimétrico: el espacio de acción de 32-D distingue muñecas relativas, pulgar izquierdo relativo, mano derecha absoluta y 14 articulaciones absolutas de brazo.
- Robustez a la pérdida de estado: gracias al *state dropout* de 0,8 durante el entrenamiento, el modelo puede operar con el vector de estado ausente o poco fiable apoyándose solo en las cámaras.
- Especialización por fase: ejecuta una única tarea (fase 5, devolución de la pipeta con la mano derecha) dentro de un flujo mayor de cinco pasos.
- No soporta *tool calling* ni *function calling*: no se documenta ninguna interfaz de herramientas.
- No soporta razonamiento multi-paso ni modo *thinking*: es una política reactiva de una sola fase.
- Capacidades multilingües: no disponibles; el condicionamiento textual se limita al inglés de las frases del dataset.
- Sin capacidades de visión general (VQA, OCR, descripción de imágenes) ni de audio: el backbone VLM se usa exclusivamente como extractor de características para la política.

## Casos de uso

- Automatización de laboratorio en pipeteo: el checkpoint se integra como quinto paso de una cadena de cinco políticas que realizan el ciclo completo de pipeteo sobre banco, permitiendo ejecutar la devolución del instrumento sin intervención humana.
- Orquestación de políticas por fase: al estar alineado con otros seis checkpoints de la misma familia (`starvla-pipette-pick-r3`, `starvla-pipette-tube-pick-r2`, `starvla-pipette-aim-r1`, `starvla-pipette-tube-return-r1`), se puede desplegar un planificador que invoque cada política según el estado del flujo.
- Investigación en VLA: sirve como punto de comparación controlado entre cabezas GR00T y cabezas QwenOFT sobre particiones de datos idénticas, así como entre espacios de acción de 18-D y 32-D.
- Recolección de datos adicionales: al ser un checkpoint fiable solo parcialmente, resulta útil para generar episodios de *rollout* etiquetados que alimenten ciclos de imitación iterativa o DAgger.
- Evaluación de robustez ante pérdida de propriocepción: el *state dropout* de 0,8 lo convierte en un banco de pruebas para medir cuánto depende la política de las cámaras frente al estado medido.
- Docencia y demostración en robótica: permite ilustrar un pipeline completo de teleoperación, ajuste fino de un VLM a VLA y despliegue en hardware humanoide con dos cámaras y manos multiarticuladas.
- Estudio de transferencia sim-to-real con estado comandado: el uso de poses de muñeca relativas al comando del primer paso del chunk facilita experimentar con *bridges* de cinemática inversa sobre las 14 articulaciones de brazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluación interna (MSE sobre 480 muestras fijas de test, comparación en unidades físicas frente a las etiquetas reales y frente a una línea base de "mantenerse quieto"), pero no incluye cifras numéricas de esos resultados ni métricas estándar tipo MMLU, HumanEval o GSM8K, que además no aplican a un modelo de robótica. El autor indica cualitativamente que los checkpoints GR00T por fase funcionan claramente mejor que las cabezas QwenOFT entrenadas sobre las mismas particiones, pero que todavía no completan su fase de forma fiable en el robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de orden de magnitud, un modelo de 3B parámetros en fp16 ocupa aproximadamente 6-7 GB solo en pesos, a lo que hay que sumar activaciones del backbone visual y de la cabeza DiT de 32 capas, más los dos flujos de imagen de entrada.
- GPU recomendadas: el entrenamiento se realizó con 4 GPU (batch 32 por GPU, batch total 128), sin especificarse el modelo concreto. Para inferencia se recomienda una GPU de datacenter (A100, H100) si se despliega junto con el resto de la pila starVLA/GR00T y los procesos de percepción.
- GPU de consumo: una RTX 4090 (24 GB) es un candidato razonable para inferencia en fp16 o bf16, dado el tamaño de 3B parámetros, aunque no está confirmado en la documentación.
- Repositorio en disco: 19,1 GB, ya que incluye varios checkpoints, configuraciones, logs de entrenamiento y estadísticas de normalización.
- Opciones de despliegue: la model card solo documenta el despliegue mediante el stack starVLA/GR00T (`gr00t/dataset_statistics.json` debe servirse exactamente con el checkpoint para respetar la normalización). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF; las cabezas de acción DiT con flow-matching no son compatibles con esos *runtimes* de texto.
- Latencia y throughput: no disponibles como cifra medida. El diseño implica 4 pasos de inferencia de flow-matching por chunk y chunks de 0,5 s a 60 Hz, lo que fija el presupuesto temporal máximo del bucle de control, pero la latencia real depende del hardware y del *bridge* de cinemática inversa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / accion | Ambito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jren313/starvla-pipette-return-r1` | 3B | chunk de 30 pasos a 60 Hz; accion 32-D | Fase 5 de pipeteo (devolucion de pipeta) | no disponible | HuggingFace, 0 descargas |
| `nvidia/GR00T-N1.7-3B` | 3B | no disponible en la informacion proporcionada | Politica VLA generalista para humanoides | condiciones de NVIDIA (consultar repositorio) | HuggingFace (modelo base) |
| `jren313/starvla-pipette-tube-return-r1` | 3B | chunk de 30 pasos a 60 Hz; accion 32-D | Fase 4 de pipeteo (devolucion del tubo), servido en el paso 500 | no disponible | HuggingFace |
| `jren313/starvla-pipette-aim-r1` | 3B | chunk de 30 pasos a 60 Hz; accion 32-D | Fase 3 de pipeteo (apuntado), servido en el paso 1350 | no disponible | HuggingFace |
| Cabezas QwenOFT sobre las mismas particiones | no disponible | no disponible | Mismas fases de pipeteo | no disponible | no disponible (mencionadas en la model card) |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor advierte de que el modelo no completa su fase de forma fiable en el robot; no debe usarse en producción sin supervisión.
- Especialización extrema: solo ejecuta la fase 5 (devolución de la pipeta con la mano derecha); no generaliza a otras tareas, objetos ni disposiciones del banco.
- Sobreajuste al montaje experimental: entrenado con 237 episodios de una única captura de banco, con posiciones fijas de soporte y bandeja; cualquier cambio de iluminación, fondo, altura de cámara o posición de los objetos puede degradar el comportamiento.
- Dependencia de embodiment concreto: asume un Unitree G1 con manos Inspire, dos cámaras en posiciones específicas (cabeza y muñeca izquierda) y un espacio de acción de 32-D; no es transferible directamente a otro hardware.
- Riesgo de alucinación de trayectoria: como política generativa de acciones, puede producir movimientos plausibles pero físicamente incorrectos o inseguros, especialmente fuera de la distribución de estados de entrenamiento.
- Sensibilidad a la normalización: las estadísticas deben servirse exactamente con el archivo `gr00t/dataset_statistics.json` del propio repositorio; usar otras estadísticas invalida las acciones generadas.
- Licencia sin declarar: el repositorio no especifica licencia. Esto impide determinar si el uso comercial está permitido y obliga a revisar las condiciones heredadas de `nvidia/GR00T-N1.7-3B` antes de cualquier despliegue.
- Idiomas: el condicionamiento textual se limita al inglés; no hay evidencia de funcionamiento con instrucciones en castellano u otros idiomas.
- Sesgos: no se documentan análisis de sesgo, pero al tratarse de datos de teleoperación de un único operador y montaje, es probable que herede sesgos cinemáticos y de estilo de manipulación de esa persona.
- Advertencia de seguridad: la apertura de dedos al final de la fase puede provocar la caída de la pipeta; en un entorno real conviene limitar velocidades, fuerzas y el espacio de trabajo, e incorporar paradas de emergencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jren313/starvla-pipette-return-r1
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/jren313/g1-pipette-2view-teleop0925-5task-eerel
- Checkpoint de la fase 1 (ronda 2): https://huggingface.co/jren313/starvla-pipette-pick-r2
- Checkpoint de la fase 1 (ronda 3): https://huggingface.co/jren313/starvla-pipette-pick-r3
- Checkpoint de la fase 2 (ronda 1, reemplazado): https://huggingface.co/jren313/starvla-pipette-tube-pick-r1
- Checkpoint de la fase 2 (ronda 2): https://huggingface.co/jren313/starvla-pipette-tube-pick-r2
- Checkpoint de la fase 3: https://huggingface.co/jren313/starvla-pipette-aim-r1
- Checkpoint de la fase 4: https://huggingface.co/jren313/starvla-pipette-tube-return-r1
- Perfil del autor: https://huggingface.co/jren313
- Datasets del autor: https://huggingface.co/jren313/datasets
- Repositorio starVLA en GitHub: https://github.com/starVLA/starVLA
- Documentacion de starVLA: https://starvla.github.io/docs/
- Espejo del repositorio starVLA: https://github.com/trshen925/starvla
