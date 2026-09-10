# Kaz55/act-nutv4-ac40

## Resumen

act-nutv4-ac40 es una politica de imitacion robótica entrenada con el algoritmo ACT (Action Chunking Transformer) sobre la librería LeRobot. El modelo lo publica el usuario Kaz55 y está diseñado para controlar un brazo robótico UR5e equipado con pinza DG5F y dos sensores táctiles GelSight, además de dos cámaras RealSense. No es un modelo de lenguaje: es una policy visomotora que mapea observaciones multimodales (estado articular, imágenes RGB e imágenes táctiles) a secuencias de acciones de bajo nivel.

El modelo tiene 51.648.154 parámetros (~51,6 M) y ocupa 0,2 GB en el repositorio. Se entrenó durante 100.000 pasos (aproximadamente 9,6 épocas) con batch de 8 y semilla 1000 sobre el dataset Kaz55/dg5f_ur5e_nutv4, compuesto por 60 episodios y 83.311 fotogramas. La configuración de acción usa chunk_size=40 y n_action_steps=40, es decir, predice y ejecuta bloques de 40 acciones futuras de una sola vez.

Su relevancia es acotada pero concreta: forma parte de una familia de modelos (AC40/AC60) publicados para estudiar el efecto de la longitud de chunk en políticas con realimentación táctil, y sirve como referencia reproducible para quien trabaje en manipulación fina con GelSight sobre LeRobot. No tiene descargas ni likes en el momento de redactar esta ficha y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer con encoder tipo CVAE y decoder de acciones; implementación LeRobot |
| Parametros totales | 51.648.154 (~51,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; chunk_size = 40 pasos de acción y n_action_steps = 40 |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; LeRobot no publica recetas de cuantización para esta policy) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |
| Entradas | observation.state (26) + 2x RealSense 640x480 + 2x GelSight 500x375 |
| Dataset de entrenamiento | Kaz55/dg5f_ur5e_nutv4 (60 episodios, 83.311 fotogramas) |
| Pasos de entrenamiento | 100.000 (~9,6 épocas), batch 8, seed 1000 |
| Pérdida final de entrenamiento | 0,085 |
| Tamaño del repositorio | 0,2 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un transformer de imitación diseñado para aprender políticas de manipulación a partir de demostraciones teleoperadas. La formulación habitual combina un encoder condicional tipo CVAE, que toma el estado y las observaciones visuales y produce un vector de estilo latente, con un decoder transformer que genera de forma no autorregresiva un bloque de acciones futuras. En este caso el bloque es de 40 acciones (chunk_size=40) y se ejecutan las 40 completas antes de volver a inferir (n_action_steps=40), lo que reduce la frecuencia de decisión efectiva y amortigua el ruido de las observaciones individuales.

Las entradas incluyen un vector de estado de 26 dimensiones junto con cuatro flujos de imagen: dos cámaras RealSense a 640x480 y dos sensores táctiles GelSight a 500x375 en resolución nativa. La model card indica explícitamente que observation.velocity y observation.effort existen en el dataset pero se excluyeron de forma deliberada, porque la derivación automática de características los habría inyectado en la policy y habría añadido una segunda diferencia entre ejecuciones comparadas. El entrenamiento se realizó durante 100.000 pasos con batch 8, lo que corresponde a unas 9,6 épocas sobre 83.311 fotogramas, y convergió a una pérdida final de 0,085.

El autor forma un par de modelos con chunk 40 y chunk 60 que alcanzan la misma pérdida (0,085) y advierte en la propia model card de que esa métrica no es comparable entre longitudes de chunk distintas, ya que predicen un número diferente de acciones futuras. Además señala que en barridos relacionados con cable azul la pérdida de entrenamiento se mantuvo plana incluso al eliminar por completo GelSight, por lo que la selección de la longitud de chunk debe hacerse por evaluación en el robot real y no por la pérdida. No se documentan fases de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generación de acciones de control continuas para un UR5e con pinza DG5F, en bloques de 40 pasos.
- Fusión de percepción visual y táctil: dos RealSense RGB y dos GelSight de alta resolución.
- Percepción táctil de alta resolución (500x375) para tareas de contacto fino, presumiblemente inserción o agarre delicado dado el nombre del dataset ("nutv4").
- Condicionamiento sobre estado propioceptivo de 26 dimensiones.
- Ejecución de políticas de imitación en bucle cerrado dentro del ecosistema LeRobot.
- Inferencia no autorregresiva por chunks, adecuada para control en tiempo real.
- No dispone de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso simbólico.
- No dispone de capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión generalista, audio ni generación de lenguaje.

## Casos de uso

- Manipulación robótica de precisión con realimentación táctil: el modelo está entrenado específicamente con dos GelSight, por lo que es adecuado para tareas donde la señal visual no basta y hace falta detectar contacto, deslizamiento o fuerza de agarre.
- Investigación en políticas de imitación con ACT: sirve como punto de partida reproducible para comparar configuraciones de chunk y variantes de entrada sensorial, ya que la configuración de entrenamiento está documentada.
- Estudios de ablación de sensores: el par AC40/AC60 y la nota sobre la exclusión de velocity y effort facilitan reproducir experimentos controlados sobre qué modalidades aportan información útil.
- Automatización de inserción o ensamblaje en banco de laboratorio: con chunk_size=40 y ejecución de 40 acciones por inferencia, el modelo puede mantener movimientos suaves y consistentes en tareas de contacto prolongado.
- Benchmarking de hardware táctil: al usar GelSight a resolución nativa, permite medir el impacto de la resolución táctil en el éxito de la tarea sobre una plataforma UR5e estándar.
- Educación y prototipado en robótica: un modelo de 51,6 M de parámetros cabe en cualquier GPU de consumo, lo que lo hace viable para prácticas docentes de imitación robótica con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única métrica reportada por el autor es la pérdida final de entrenamiento (0,085) para los dos modelos del par, junto con la advertencia explícita de que dicha pérdida no es comparable entre longitudes de chunk distintas ni es un indicador fiable de rendimiento en el robot. No hay tasas de éxito, ni evaluaciones en robot real, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint son ~51,6 M de parámetros, unos 207 MB en fp32 y ~103 MB en fp16; sumando los backbones visuales para cuatro flujos de imagen y las activaciones, una estimación razonable es de 2 a 4 GB de VRAM (estimación propia, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema. Para control en tiempo real, una GPU dedicada reduce la latencia de inferencia frente a CPU.
- Cabe en GPU de consumo: sí, con holgura; el cuello de botella es el preprocesado de cuatro cámaras, no el tamaño del modelo.
- CPU: es viable para inferencia puntual, aunque probablemente no alcance frecuencias de control altas con cuatro flujos de imagen.
- Opciones de despliegue: LeRobot es la vía natural (integración nativa con el formato safetensors y el pipeline robotics). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, que no aplican a una policy de robótica.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de frecuencia de control ni de tiempo de inferencia.

## Comparativa con modelos similares

Los datos de esta tabla proceden de conocimiento general sobre el ecosistema LeRobot y no han sido verificados en la búsqueda web realizada; se marcan como no disponibles los campos que no se pueden confirmar.

| Modelo | Parametros | Contexto / chunk | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-nutv4-ac40 (este modelo) | 51,6 M | chunk_size 40 | estado 26 + 2x RGB + 2x GelSight | no disponible | HuggingFace, 0 descargas |
| act-nutv4-ac60 (modelo hermano) | no disponible | chunk_size 60 | mismas que ac40 | no disponible | HuggingFace |
| ACT original (ALOHA) | no disponible | chunk de acciones | RGB + estado propioceptivo | no disponible | paper y código públicos |
| Diffusion Policy | no disponible | horizonte de acciones | RGB + estado | no disponible | código público |
| SmolVLA (LeRobot) | no disponible | política VLA | RGB + instrucción en lenguaje | no disponible | HuggingFace |

La diferencia más relevante de este modelo frente a alternativas VLA como SmolVLA o pi0 es que no acepta instrucciones en lenguaje natural: la tarea está implícita en el dataset de demostraciones. Su ventaja específica es la doble realimentación táctil GelSight a 500x375, poco frecuente en políticas publicadas abiertamente.

## Limitaciones y advertencias

- La licencia no está declarada: no hay autorización explícita de uso comercial y conviene contactar con el autor antes de cualquier despliegue productivo.
- El modelo está atado a una plataforma concreta: UR5e, pinza DG5F, dos RealSense y dos GelSight. Cambiar cualquier sensor, su montaje o la resolución invalida la policy.
- Está entrenado sobre 60 episodios y 83.311 fotogramas de un único dataset; la diversidad de escenas, iluminación y posiciones iniciales es presumiblemente reducida, con el consiguiente riesgo de sobreajuste y de fallo ante condiciones no vistas.
- No hay evaluación en robot real publicada: no existen tasas de éxito que respalden el rendimiento en producción.
- El propio autor advierte que la pérdida de entrenamiento no es un criterio fiable de selección: en experimentos relacionados se mantuvo plana incluso eliminando por completo la entrada táctil, lo que sugiere que la pérdida puede no estar capturando la contribución real de GelSight.
- Sin datos de benchmarks, no se puede comparar objetivamente con otras políticas de manipulación.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es la ejecución de trayectorias incorrectas o inseguras ante observaciones fuera de distribución, especialmente en tareas con contacto físico.
- Sin soporte de lenguaje: no se puede reorientar la tarea mediante instrucciones, solo cambiando el dataset de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad ni informes de terceros sobre su comportamiento.
- No se documentan medidas de seguridad, parada de emergencia ni límites de fuerza; cualquier uso en hardware real debe incorporar salvaguardas externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaz55/act-nutv4-ac40
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_nutv4
- La búsqueda web realizada no devolvió resultados relevantes: los únicos enlaces recuperados corresponden a páginas de soporte de Microsoft sobre configuración de monitores en Windows y no guardan relación con este modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a act-nutv4-ac40.
