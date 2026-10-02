# jren313/starvla-pipette-aim-r1

## Resumen

`jren313/starvla-pipette-aim-r1` es un checkpoint de investigación de tipo vision-language-action (VLA) para robótica. Se trata de un ajuste fino completo del modelo `nvidia/GR00T-N1.7-3B` (aproximadamente 3.000 millones de parámetros) realizado con el framework starVLA, y está especializado en una única fase de un flujo de trabajo de pipeteo de banco de cinco pasos, ejecutado sobre un humanoides Unitree G1 con manos Inspire.

La fase que cubre este checkpoint es la tercera del flujo: "apuntar con la pipeta sostenida en la mano derecha hacia el tubo sostenido en la mano izquierda", con ambos movimientos de muñeca activos y cada mano sujetando únicamente su objeto. El modelo consume dos cámaras (RGB de cabeza a 1280×720 y una cámara eye-in-hand en la muñeca izquierda a 1080×1080), la frase de tarea y un vector de estado de 59 dimensiones, y produce trozos de acción de 30 pasos (0,5 s a 60 Hz).

Es relevante como ejemplo de receta por fases para manipulación bimanual con manos diestras, y porque el autor documenta explícitamente que los checkpoints GR00T por fase funcionan claramente mejor que las cabezas QwenOFT entrenadas sobre las mismas particiones, aunque todavía no completan su fase de forma fiable. El repositorio ocupa 19,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con backbone Cosmos-Reason2-2B (VLM), `select_layer` 16, cabezal DiT de flow-matching de 32 capas con alternate-VL, 4 pasos de inferencia, slot de embodiment 25; variante starVLA `CosmosGR00TN1d7` |
| Parametros totales | 3B (heredados de `nvidia/GR00T-N1.7-3B`); la model card no desglosa el reparto entre vision, lenguaje y cabezal de acción |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; no se documenta ningún formato cuantizado |
| Idiomas soportados | no disponible; las frases de tarea del dataset de entrenamiento están en inglés |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`): `gr00t/checkpoints/steps_1350_pytorch_model.pt` y `gr00t/final_model/pytorch_model.pt` |
| Modelo base | `nvidia/GR00T-N1.7-3B` (carga 1:1 de los 1.031 tensores) |
| Framework de ajuste fino | starVLA (`CosmosGR00TN1d7`), ajuste fino completo de LLM y torre visual con gradient checkpointing |
| Dataset de entrenamiento | `jren313/g1-pipette-2view-teleop0925-5task-eerel` (237 episodios teleoperados a 60 Hz) |
| Entradas | 2 cámaras (cabeza RGB 1280x720 y muñeca izquierda 1080x1080, redimensionadas a 270 y recorte central a 256 en serving), frase de tarea y estado de 59 dimensiones |
| Salidas | trozos de acción de 30 pasos (0,5 s a 60 Hz), espacio de acción de 32 dimensiones |
| Checkpoint servido | `steps_1350` (menor pérdida en holdout entre los pasos guardados); entrenamiento final en el paso 2199 |
| Tamano del repositorio | 19,1 GB |
| Fecha de creacion / actualizacion | 2026-09-30 / 2026-10-02 |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.7-3B` inicializado en la clase `CosmosGR00TN1d7` de starVLA, con carga 1:1 de los 1.031 tensores del checkpoint original. La arquitectura combina un VLM Cosmos-Reason2-2B (del que se toma la capa 16 como `select_layer`) con un cabezal de acción DiT de 32 capas con atención alternada visión-lenguaje, formulado como flow-matching y resuelto en 4 pasos de inferencia. El slot de embodiment es el 25. El ajuste fino es completo: se entrenan tanto el LLM (`tune_llm`) como la torre visual (`tune_visual`), con gradient checkpointing.

En cuanto a los datos, cada fase entrena de forma aislada sobre los episodios de su propio paso del flujo, con una partición train/test a nivel de grabación (las mitades "pick" y "return" de una misma grabación permanecen del mismo lado). El espacio de acción es de 32 dimensiones: muñecas relativas al chunk, pulgar izquierdo relativo, mano derecha absoluta y articulaciones absolutas opcionales de brazo, que solo sirven para inicializar la IK del puente. La observación incluye un vector de estado de 59 dimensiones (29 articulaciones, pose6 de muñeca medida y comandada en ambos lados, `thumb_bend` izquierdo comandado y mano derecha de 5 dimensiones), con un *state dropout* de 0,8 que anula por completo ese vector en el 80 % de las muestras de entrenamiento para forzar al cabezal a leer las cámaras. Se aplica un filtro de pausa que descarta anclas de entrenamiento cuando ninguna muñeca comandada se mueve 1 mm a lo largo de su chunk.

La optimización usa AdamW paginado de 8 bits con betas (0,9, 0,95) y weight decay 0; tasa de aprendizaje de 2e-5 para el backbone y la interfaz VL y de 2e-4 para el cabezal de acción, con decaimiento coseno hasta 1e-6 tras 100 pasos de calentamiento, recorte de norma de gradiente de 1,0, lote de 128 (32 × 4 GPU, sin acumulación), 10 épocas y semilla 42. La selección del checkpoint se hace por MSE de holdout sobre una porción fija de 480 muestras de los episodios de test, evaluada aproximadamente una vez por época; el autor indica que las fases se comparan en unidades físicas (mm, grados, registros) contra las etiquetas reales y frente a un baseline de "permanecer quieto", porque el MSE normalizado no es comparable entre espacios de acción distintos.

## Capacidades

- Generación de acciones motoras bimanuales: produce comandos de 32 dimensiones para muñecas relativas al chunk, pulgar izquierdo relativo, mano derecha absoluta y articulaciones de brazo.
- Control a 60 Hz con trozos de 30 pasos (0,5 s), lo que permite política reactiva de alta frecuencia.
- Percepción visual multi-cámara: procesa simultáneamente una vista de cabeza y una vista eye-in-hand de la muñeca izquierda.
- Condicionamiento por lenguaje: la política se guía por la frase de tarea ("Aim the pipette held in the right hand at the tube held in the left hand").
- Robustez parcial a la ausencia de estado propio: gracias al *state dropout* de 0,8 durante el entrenamiento, el modelo debe resolver la tarea principalmente a partir de las cámaras.
- Ejecución de UNA fase concreta de una secuencia de cinco pasos, con espacio de acción y estadísticas de normalización específicos de esa fase.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la descomposición manual del flujo de pipeteo en cinco políticas independientes.
- No se documenta capacidad multilingüe ni capacidad de generación de texto general: el uso previsto es exclusivamente robótico.
- No se documentan capacidades de visión general (VQA, OCR) ni de audio, pese a que el backbone sea un VLM.

## Casos de uso

- Investigación en manipulación bimanual coordinada: el modelo sirve como política de referencia para la fase de apuntado con dos manos activas y cada mano sujetando un objeto distinto, un escenario poco cubierto por políticas unimanuales.
- Reproducción de experimentos de ajuste fino por fases: el repositorio publica configuración resuelta, estadísticas de normalización, YAML de entrenamiento, script de lanzamiento y registro de entrenamiento con cada evaluación de holdout, lo que permite replicar exactamente la receta sobre el mismo dataset.
- Línea base frente a cabezas alternativas: el autor lo usa para comparar GR00T por fase contra cabezas QwenOFT entrenadas sobre las mismas particiones; sirve como comparativa interna para decidir arquitectura de cabezal.
- Módulo dentro de una política jerárquica de laboratorio: al existir checkpoints por fase (pick, tube-pick, aim, tube-return, return), este modelo se encaja como el tercer eslabón de una máquina de estados que compone el flujo completo de pipeteo.
- Evaluación de robustez perceptiva: la combinación de vista de cabeza y vista de muñeca con *state dropout* alto lo hace adecuado para estudiar cuánta información propioceptiva necesita realmente una política VLA en manipulación fina.
- Recolección de datos y teleoperación asistida: puede desplegarse sobre un Unitree G1 con manos Inspire para generar trayectorias de apuntado que alimenten nuevas grabaciones o para filtrar episodios válidos antes de reentrenar.
- Ajuste fino adicional a tareas de laboratorio análogas: al ser un ajuste fino completo sobre un base de 3B, puede servir de punto de partida para otras tareas que requieran orientación fina de herramientas sostenidas entre dos manos.
- Docencia y divulgación técnica: repositorio autocontenido para explicar cómo se define un espacio de acción relativo al chunk, cómo se calculan estadísticas de normalización por fase y cómo se selecciona checkpoint en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente describe el criterio de selección (MSE de holdout sobre 480 muestras fijas de los episodios de test, comparado también en unidades físicas frente a un baseline de "permanecer quieto"), pero no incluye en la model card los valores numéricos obtenidos. No hay datos de MMLU, HumanEval, GSM8K ni de tasas de éxito en robot publicados en la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la model card. Como referencia orientativa derivada del tamaño del modelo (3B parámetros) y no de la documentación del autor: pesos en FP16 en torno a 6-7 GB, más el coste de las dos cámaras, el caché de atención y el búfer de acciones; en FP32, alrededor del doble.
- GPU recomendadas para entrenamiento: no disponible el modelo exacto. El autor documenta un lote total de 128 ejecutado como 32 × 4 GPU, es decir, 4 aceleradores con 32 muestras por dispositivo, con gradient checkpointing y AdamW de 8 bits. El repositorio pesa 19,1 GB, lo que incluye varios checkpoints además de los pesos servidos.
- GPU para inferencia: no disponible. No se documenta ningún despliegue sobre GPU de consumo.
- Viabilidad en GPU de consumo: no confirmada por el autor. El tamaño de pesos de un modelo de 3B es compatible con GPUs de gama alta de consumo en precisión reducida, pero no hay ninguna medición publicada que lo respalde.
- Opciones de despliegue: no se documenta integración con vLLM, llama.cpp, Ollama ni TGI. El formato publicado es PyTorch `.pt` gestionado por starVLA, con la advertencia explícita de servir el modelo junto con el archivo `gr00t/dataset_statistics.json` exacto de esta ejecución.
- Latencia y throughput: no disponible. El único dato temporal documentado es el control a 60 Hz con chunks de 30 pasos (0,5 s) y 4 pasos de inferencia del cabezal de flow-matching, pero no se publican tiempos de cómputo medidos.
- Requisitos adicionales de pila: robot Unitree G1 con manos Inspire, dos cámaras (cabeza y muñeca izquierda), puente de cinemática inversa para las articulaciones absolutas de brazo y el backend de starVLA (`CosmosGR00TN1d7`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Espacio de accion | Licencia | Estado |
|---|---|---|---|---|---|
| `jren313/starvla-pipette-aim-r1` (esta ficha) | 3B | no disponible | 32-D: muñecas rel + pulgar izq. rel + mano der. abs + articulaciones | no disponible | checkpoint de investigación, fase 3, paso servido 1350 |
| `nvidia/GR00T-N1.7-3B` (modelo base) | 3B | no disponible | no disponible | no disponible en esta información | modelo base generalista de NVIDIA |
| `jren313/starvla-pipette-pick-r3` (fase 1, mismo autor) | 3B | no disponible | 32-D: muñecas rel + manos abs + articulaciones | no disponible | paso servido 2000 |
| `jren313/starvla-pipette-tube-pick-r2` (fase 2, mismo autor) | 3B | no disponible | 32-D: muñecas rel + pulgar izq. rel + mano der. abs + articulaciones | no disponible | paso servido 1000 |
| `jren313/starvla-pipette-return-r1` (fase 5, mismo autor) | 3B | no disponible | 32-D: muñecas rel + pulgar izq. rel + mano der. abs + articulaciones | no disponible | paso servido 3000 |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de licencia de los modelos comparados, por lo que la comparación se limita a parámetros, espacio de acción, estado del checkpoint y tarea objetivo. No se han encontrado en la búsqueda web resultados relevantes sobre este modelo ni sobre alternativas comparables.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción. El propio autor indica que sobre el robot los checkpoints GR00T por fase funcionan claramente mejor que las cabezas QwenOFT entrenadas con las mismas particiones, pero que todavía no completan su fase de forma fiable.
- Cobertura funcional muy estrecha: resuelve únicamente la fase de apuntado de un flujo concreto de pipeteo sobre un embodiment concreto (Unitree G1 con manos Inspire); no es un modelo generalista.
- Dependencia fuerte del embodiment y del hardware: el slot de embodiment 25, el vector de estado de 59 dimensiones y el espacio de acción de 32 dimensiones están atados a esa configuración. Cambiar de robot, de manos o de cámaras invalida el modelo.
- Las estadísticas de normalización son específicas de esta ejecución y no se comparten entre espacios de acción; servir el modelo sin el `dataset_statistics.json` exacto de este entrenamiento produce comandos incorrectos.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo, ni demográfico ni de comportamiento.
- Riesgo de alucinación: no cuantificado. En el ámbito de una política motora, el equivalente sería la generación de acciones plausibles pero incorrectas; el autor no publica tasas de éxito ni de fallo.
- Limitaciones de contexto: la longitud de contexto no está documentada. El condicionamiento se limita a la frase de tarea, las dos cámaras y el vector de estado, sin historial conversacional.
- Idioma: no hay soporte multilingüe documentado; las frases de tarea del dataset están en inglés.
- Restricciones de licencia: la licencia no está declarada en la model card. Al derivar de `nvidia/GR00T-N1.7-3B`, es imprescindible verificar la licencia del modelo base antes de cualquier uso comercial, que en este repositorio no se puede determinar.
- Datos de entrenamiento limitados: 237 episodios teleoperados, con entrenamiento por fase sobre los episodios de su propio paso, lo que reduce drásticamente el volumen efectivo por política.
- Sin benchmarks publicados: no hay métricas comparables con otros VLA, solo un criterio interno de selección de checkpoint.
- Advertencia sobre la información de la model card: el texto de la ficha se corta al inicio de la sección "This run", por lo que los detalles finales de esta ejecución concreta no están disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jren313/starvla-pipette-aim-r1
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/jren313/g1-pipette-2view-teleop0925-5task-eerel
- Repositorio de starVLA: https://github.com/starVLA/starVLA
- Fase 1, ronda 2: https://huggingface.co/jren313/starvla-pipette-pick-r2
- Fase 1, ronda 3 (última de la fase 1): https://huggingface.co/jren313/starvla-pipette-pick-r3
- Fase 2, ronda 1 (sustituida): https://huggingface.co/jren313/starvla-pipette-tube-pick-r1
- Fase 2, ronda 2 (última de la fase 2): https://huggingface.co/jren313/starvla-pipette-tube-pick-r2
- Fase 4: https://huggingface.co/jren313/starvla-pipette-tube-return-r1
- Fase 5: https://huggingface.co/jren313/starvla-pipette-return-r1

Nota: la búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo, con GR00T, con starVLA ni con robótica de manipulación; los enlaces anteriores proceden íntegramente de la información de HuggingFace proporcionada.
