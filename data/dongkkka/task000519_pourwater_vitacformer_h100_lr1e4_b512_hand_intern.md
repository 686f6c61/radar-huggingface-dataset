# Dongkkka/Task000519_PourWater_ViTacFormer_H100_LR1e4_B512_Hand_Intern

## Resumen

Task000519_PourWater_ViTacFormer_H100_LR1e4_B512_Hand_Intern es un paquete de investigación publicado en HuggingFace por el usuario Dongkkka que contiene dos checkpoints de inferencia de una política robótica visuotáctil entrenada desde cero para la tarea "Task519 Pour Water" (verter agua) sobre un robot SH5. El modelo, denominado ViTacFormer, combina visión (cámara RGB de cabeza izquierda) con señales táctiles bilaterales de alta densidad y estado propioceptivo para predecir trozos de acción de 100 pasos. No es un modelo de lenguaje ni un transformador de propósito general: es una política de aprendizaje por imitación (imitation learning) con un cargador propio en PyTorch, no compatible con `AutoModel` de Transformers ni con las políticas estándar de LeRobot.

El paquete incluye `checkpoints/best_validation.pt` (paso 34.000, seleccionado por la mejor puntuación compuesta de validación) y `checkpoints/latest_model.pt` (paso 110.000, extraído del checkpoint reanudable). El autor indica explícitamente que se trata de un checkpoint de investigación incompleto, que el entrenamiento se detuvo antes de la fase planificada de 300k de tacto predicho y que el modelo no está aprobado para despliegue motorizado en un SH5 real. La relevancia actual es acotada: sirve como artefacto reproducible para estudiar políticas visuotáctiles y predicción de tacto futuro, pero no como componente listo para producción.

El repositorio ocupa 0,8 GB, no tiene descargas ni "likes" registrados, y no se ha publicado información sobre licencia del modelo ni de los datos (el código fuente upstream/adaptado se distribuye bajo Apache-2.0, pero el autor aclara que eso no implica licencia del dataset ni de los checkpoints).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViTacFormer: política visuotáctil con codificador de imagen (cámara de cabeza izquierda), estado bilateral 54-D, tacto bilateral 180-D y predicción de tacto futuro de 18 pasos. Formulación exacta (transformer, híbrida u otra) no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de lenguaje. Ventanas de observación: estado [6, 54] con offsets [-15, -12, -9, -6, -3, 0] a 30 Hz; tacto bruto [18, 90] con offsets -17..0; salida de acción en chunks de 100 pasos |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precisión de entrenamiento) |
| Idiomas soportados | en, ko (según etiquetas del repositorio; aplicable a documentación, no a la política) |
| Licencia | no disponible. El código fuente upstream/adaptado se incluye bajo Apache-2.0, pero el autor indica que no se infiere licencia del dataset ni de los checkpoints |
| Formato de pesos | PyTorch nativo (`.pt`), cargador propio (`inference_loader`). No hay safetensors, GGUF ni formato exportado |
| Tarea | Task519 Pour Water (verter agua) sobre robot SH5 bimanual |
| Dimensiones de entrada | RGB uint8 [376, 672, 3]; estado float32 [6, 54]; tacto bruto float32 [18, 90] (izquierda 45 + derecha 45); baseline por taxel float32 [90] |
| Dimensiones de salida | acciones [1, 100, 54] en radianes absolutos; tacto futuro normalizado [1, 18, 180] |
| Orden de acción | brazo izquierdo 7, brazo derecho 7, mano izquierda 20, mano derecha 20 |
| Optimizador | AdamW, 1e-4 en el módulo principal y 1e-5 en el backbone |
| Batch / chunk de acción | 512 / 100 |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

No se detalla en la model card la topología interna exacta del ViTacFormer (número de capas, dimensión de embedding, esquema de atención ni si usa atención lineal o decodificación especulativa). Lo que sí se especifica es la interfaz funcional: el modelo consume una imagen RGB de 376x672x3 de la cámara de cabeza izquierda, un historial de estado bilateral de 54 dimensiones (6 pasos temporales con offsets hasta -15), un historial de tacto bruto de 180 dimensiones (18 pasos x 90 taxeles, izquierda 45 y derecha 45) y un baseline táctil por taxel de 90 valores. Produce dos salidas: un chunk de 100 acciones absolutas en radianes con orden brazo izquierdo / brazo derecho / mano izquierda / mano derecha, y una predicción de tacto futuro de 18 pasos x 180 dimensiones normalizadas. La ruta de inferencia aplica normalización guardada, un camino de inferencia con tacto futuro predicho, prior latente a cero, decodificador de articulaciones acotado y rampa de arranque para los brazos.

Los datos de entrenamiento son 159 episodios de vertido con 123.853 fotogramas en total, divididos en 142 episodios de entrenamiento y 17 retenidos para validación. El entrenamiento se hizo desde cero (scratch) con AdamW y batch 512, y se detuvo deliberadamente antes de la fase planificada de 300k pasos dedicada al tacto predicho. No hay mención de RLHF, DPO ni de un corpus multimodal general: es aprendizaje por imitación supervisado sobre demostraciones de la tarea concreta. En el paso 34.000 la validación dio una L1 de acción de 0,1296097 y una L1 táctil de 0,1558883 frente a una línea base de persistencia de 0,1581809; el checkpoint de 110.000 pasos empeoró a 0,1333523 y 0,1724246. El autor señala que el mejor comportamiento táctil resultó asimétrico y que la puerta de liberación offline (`offline_release_pass=false`) no se superó.

## Capacidades

- Predicción de acciones motoras bimanuales: genera chunks de 100 pasos con 54 dimensiones (7 brazo izquierdo, 7 brazo derecho, 20 mano izquierda, 20 mano derecha) en radianes absolutos, aptas para interpolación a frecuencia de control.
- Predicción de tacto futuro: estima 18 pasos x 180 dimensiones de señal táctil normalizada, lo que permite anticipar contacto antes de que ocurra.
- Fusión visión-tacto-propiocepción: integra simultáneamente imagen RGB, estado de 54 dimensiones y tacto bruto de 90 taxeles, con baseline por taxel calibrado.
- Ejecución de una tarea de manipulación específica: vertido de agua ("Pour Water") sobre la plataforma SH5, aprendida por imitación.
- Control bilateral y destreza manual: cubre ambos brazos y ambas manos con 20 grados de libertad por mano.
- Inferencia no actuante reproducible: incluye `SHA256SUMS` y `verify_package.py` para verificar el paquete y ejecutar una prueba de humo sintética sin accionar el robot.
- No soporta tool calling, function calling ni razonamiento multi-paso en lenguaje natural.
- No soporta generación de texto, código, matemáticas ni visión de propósito general.
- Capacidades multilingües: no aplica al modelo; las etiquetas en/ko se refieren a la documentación del repositorio.
- Capacidades especiales: modo de predicción de tacto futuro y "zero latent prior" en la ruta de inferencia; no hay modo de pensamiento, audio ni visión general.

## Casos de uso

- Investigación en manipulación visuotáctil: reproducir el experimento de vertido y analizar cómo la predicción de tacto futuro de 18 pasos afecta a la L1 de acción frente a la línea base de persistencia (0,1581809). Es adecuado porque el paquete incluye configuración, historial de validación y recibo de artefactos.
- Replay offline y evaluación de políticas: cargar el checkpoint con `load_run` y ejecutar `predict_normalized` sobre secuencias grabadas para medir L1 de acción y de tacto sin riesgo físico, tal como propone el propio autor antes de cualquier prueba motorizada.
- Estudio de ablaciones arquitectónicas: comparar los dos checkpoints publicados (34k y 110k) para cuantificar el efecto del sobreentrenamiento en la rama táctil, dado que en 110k las ratios táctiles quedan todas por encima de 1.
- Generación de etiquetas táctiles futuras para preentrenamiento: la salida [1, 18, 180] puede usarse como objetivo auxiliar en otros modelos de manipulación que carezcan de sensores táctiles densos durante el entrenamiento.
- Análisis de transferencia entre tareas de vertido: sirve como punto de partida para fine-tuning con otros líquidos, recipientes o velocidades, siempre que se respete el mismo esquema de orden de articulaciones y calibración táctil.
- Docencia y formación en robótica: ejemplo reproducible de pipeline completo (datos, optimizador, checkpoints, verificación de integridad) para cursos de aprendizaje por imitación con señales táctiles.
- Validación en simulador o shadow mode: antes de cualquier prueba real, integrar el modelo en un bucle de solo lectura para comprobar latencia, continuidad de comandos y comportamiento de parada, dado que el cargador no implementa publicación ROS ni comprobaciones de frescura.
- Pruebas con operador y parada de emergencia: ensayos a baja velocidad con vigilancia humana, únicamente tras verificar la revisión exacta del SH5, el orden de articulaciones y tacto, la calibración y la cartografía de cámara.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas internas de validación del propio autor, no benchmarks estándar de la comunidad.

| Metrica | best_validation.pt (paso 34.000) | latest_model.pt (paso 110.000) |
|---|---|---|
| L1 de accion | 0,1296097 | 0,1333523 |
| L1 tactil | 0,1558883 | 0,1724246 |
| Linea base de persistencia (tactil) | 0,1581809 | 0,1581809 |
| Ratios tactiles izquierda | 0,9288 / 0,9003 | todas por encima de 1 |
| Ratios tactiles derecha | 1,0051 / 1,0021 | todas por encima de 1 |
| Puerto de liberacion offline | `offline_release_pass=false` | no aplica |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark de propósito general en la informacion disponible, y no serían aplicables a una política de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia indirecta, el repositorio completo ocupa 0,8 GB con dos checkpoints, es decir, aproximadamente 0,4 GB por checkpoint; si están en precisión de 32 bits, eso sugeriría del orden de 100 millones de parámetros, pero es una estimación derivada del tamaño del archivo y no un dato confirmado.
- GPU recomendadas: el nombre del modelo indica entrenamiento en H100, y el cargador usa `device="cuda"`. Para inferencia no se especifica un mínimo.
- Viabilidad en GPU de consumo: probablemente sí, dado el tamaño reducido del checkpoint (aproximadamente 0,4 GB cada uno) y que se trata de una política con codificador de imagen único, no de un LLM. No hay cifras oficiales de VRAM ni de modelos concretos validados.
- Opciones de despliegue: cargador propio en PyTorch (`inference_loader.load_run`, `predict_normalized`, `preprocess.prepare_observation`) más `verify_package.py` para prueba de humo sintética. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. No se documenta exportación a TorchScript, ONNX u otro formato.
- Latencia y throughput: no disponibles. El control de estado opera a 30 Hz y la salida son chunks de 100 acciones, pero el autor exige verificar explícitamente la latencia de inferencia y la continuidad de comandos antes de cualquier despliegue motorizado.
- Integración en robot: el cargador no implementa publicación ROS, sincronización cámara-estado, planificación temporal, comprobaciones de frescura, rechazo de chunks completos, watchdogs, lógica de E-stop ni mapeo de tópicos específico del robot.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de la misma categoría (políticas visuotáctiles de aprendizaje por imitación para manipulación bimanual). No se dispone de parámetros, ventanas de observación, métricas ni licencias de alternativas con las que comparar de forma rigurosa. Los tags del repositorio mencionan `imitation-learning` y `sh5`, pero no referencian ninguna línea base comparable ni se publican resultados frente a políticas estándar como ACT o diffusion policies, por lo que cualquier comparación sería especulativa.

## Limitaciones y advertencias

- Checkpoint de investigación incompleto: el entrenamiento se detuvo antes de la fase planificada de 300k pasos de tacto predicho, y el propio autor lo describe como no aprobado para despliegue motorizado en un SH5.
- Puerto de liberación offline fallido: `offline_release_pass=false` para el checkpoint de mejor validación exportado.
- Comportamiento táctil asimétrico: las ratios de la mano izquierda (0,9288 y 0,9003) indican un rendimiento desigual entre lados, y el autor señala que el mejor comportamiento táctil fue asimétrico.
- Degradación al entrenar más: el checkpoint de 110.000 pasos empeora en acción y tacto frente al de 34.000, por lo que la pérdida de entrenamiento no debe usarse como evidencia de despliegue.
- Incertidumbre sobre sobreajuste o deriva: se recomienda revisar `validation_history.json`, `train_config.json` y `artifact_receipt.json` antes de elegir un checkpoint.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones táctiles y de acción incorrectas fuera de la distribución de las 142 demostraciones de entrenamiento; la L1 táctil del mejor checkpoint (0,1558883) apenas mejora la línea base de persistencia (0,1581809).
- Limitación de datos: solo 159 episodios y 123.853 fotogramas de la tarea de vertido, con 17 episodios de validación; no hay evidencia de generalización a otras tareas, objetos o condiciones de iluminación.
- Dependencia de una única cámara: la observación visual se limita a la cámara de cabeza izquierda, sin giro ni rotación; cualquier cambio de montaje invalida la política.
- Entradas estrictamente sincronizadas: el orden y los offsets de estado (6x54 a 30 Hz), tacto bruto (18x90, izquierda 45 y derecha 45) y baseline por taxel (90) deben respetarse tal cual; el cargador no verifica frescura ni sincronización.
- Ausencia de seguridad para robot real: no implementa ROS publishing, watchdogs, E-stop ni rechazo de chunks; cualquier uso motorizado requiere replay offline, shadow mode y ensayos a baja velocidad con operador y parada de emergencia funcional.
- Restricciones de licencia: la licencia del modelo y del dataset no está disponible. El código fuente upstream/adaptado se incluye bajo Apache-2.0, pero el autor aclara que de ahí no se infiere licencia para los checkpoints ni para los datos, lo que impide confirmar su uso comercial.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin revisión externa publicada.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Dongkkka/Task000519_PourWater_ViTacFormer_H100_LR1e4_B512_Hand_Intern
- Archivos de verificación y trazabilidad incluidos en el repositorio: `SHA256SUMS`, `verify_package.py`, `validation_history.json`, `train_config.json`, `artifact_receipt.json`
- Ruta del código fuente incluido: `source_snapshot/ViTacFormer_SH5` (licencia Apache-2.0)
- Paper, blog, demo o repositorio adicional: no disponibles. La búsqueda web realizada devolvió únicamente resultados no relacionados (documentación de Google Translate), sin referencias al modelo ViTacFormer ni al autor.
