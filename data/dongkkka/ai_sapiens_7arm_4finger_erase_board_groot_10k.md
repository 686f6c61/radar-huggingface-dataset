# Dongkkka/ai_sapiens_7arm_4finger_erase_board_groot_10k

## Resumen

El modelo `Dongkkka/ai_sapiens_7arm_4finger_erase_board_groot_10k` es un checkpoint de robótica derivado de NVIDIA GR00T-N1.7-3B, publicado por el usuario Dongkkka en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base de NVIDIA orientado a una tarea concreta: borrar una pizarra blanca (instrucción `erase_whiteboard`) con un robot personalizado denominado K1, equipado con dos brazos de 7 grados de libertad y dos manos de 12 grados de libertad cada una. El checkpoint corresponde al paso 10000 de un entrenamiento continuado de 20000 pasos.

El modelo resuelve el problema de mapear observaciones multimodales (tres cámaras RGB y un vector de 38 posiciones articulares en radianes) a acciones futuras (16 pasos de 38 objetivos articulares absolutos). Es relevante porque demuestra el flujo de trabajo de ajuste fino de GR00T N1.7 sobre hardware no estándar (`new_embodiment`) y porque publica los pesos de inferencia sin estados del optimizador, facilitando su reutilización.

Con 3.144.016.000 parámetros y un tamaño de repositorio de 12,6 GB, el modelo se distribuye en formato safetensors y bajo licencia Apache 2.0. No se han publicado resultados de benchmarks ni evaluación en el robot real, por lo que su utilidad práctica está todavía por validar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (modelo base nvidia/GR00T-N1.7-3B); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tres shards) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint base NVIDIA GR00T-N1.7-3B (revisión `373d34e2723d928870157d07dc216a19a624b5bb`), un modelo de robótica de 3.144 millones de parámetros. La información proporcionada no detalla la arquitectura interna del transformer ni la composición del dataset de preentrenamiento del modelo base. El ajuste fino se realizó sobre el dataset `Task_1112_erase_board_MCAP_lerobot_v21`, compuesto por 20 episodios y 32625 fotogramas a 15 fps, con instrucción de tarea `erase_whiteboard`.

Durante el entrenamiento se congeló el backbone de visión y lenguaje, con un batch efectivo de 32 y una tasa de aprendizaje de 1e-4. La variante de embodiment es `new_embodiment`, correspondiente al robot K1 con dos brazos de 7 DOF y dos manos de 12 DOF. La entrada de estado son 38 posiciones articulares en radianes y la salida son 16 pasos futuros de 38 objetivos articulares absolutos. El checkpoint exportado contiene los pesos de inferencia sin estados del optimizador e incluye metadatos de procesador, IDs de embodiment y estadísticas de normalización en la raíz del modelo. Se documenta además el uso del submódulo `ROBOTIS-GIT/Isaac-GR00T-n1.7` en el commit `e81d02b5c561dfafd0556f2a4a602016e670920c`.

## Capacidades

- Control robótico de manipulación: genera trayectorias de 16 pasos de 38 objetivos articulares absolutos en radianes a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa tres cámaras RGB (`cam_head`, `cam_left_wrist`, `cam_right_wrist`) junto con el estado articular.
- Ejecución de instrucciones en lenguaje natural: la tarea se especifica mediante la instrucción `erase_whiteboard`.
- Soporte de embodiment personalizado: entrenado para el robot K1 con dos brazos de 7 DOF y dos manos de 12 DOF.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingües en la información proporcionada.

## Casos de uso

- Automatización del borrado de pizarras en entornos educativos o de oficina: el modelo recibe las imágenes de las tres cámaras y el estado articular y genera los objetivos de las 38 articulaciones para ejecutar la tarea `erase_whiteboard` con el robot K1.
- Investigación en imitación robótica: sirve como punto de partida para reproducir el flujo de ajuste fino de GR00T N1.7 sobre un embodiment no estándar y comparar curvas de entrenamiento hasta el paso 10000.
- Desarrollo de pipelines de teleoperación: el modelo documenta el mapeo entre el orden de almacenamiento del estado y de la acción mediante `export_info.json` y `modality.json`, útil para integrar datos de teleoperación en modo espejo.
- Prototipado de control de manos diestras: al cubrir dos manos de 12 DOF, permite experimentar con políticas que coordinan brazos y dedos en tareas de manipulación fina.
- Benchmarking de políticas robóticas: puede emplearse como referencia en comparaciones de políticas entrenadas con pocos episodios (20 episodios, 32625 fotogramas) sobre el mismo hardware.
- Integración en runtimes GR00T N1.7: al requerir los assets de Cosmos-Reason2-2B, encaja en despliegues que ya utilicen el ecosistema Isaac-GR00T para inferencia en robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el checkpoint exportado aún no ha sido evaluado en el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 12,6 GB en safetensors, lo que da una cota inferior orientativa para cargar los pesos sin cuantizar.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: requiere un runtime compatible con GR00T N1.7 y los assets del modelo/tokenizer Cosmos-Reason2-2B. No se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dongkkka/ai_sapiens_7arm_4finger_erase_board_groot_10k | 3.144.016.000 | no disponible | Borrado de pizarra con robot K1 (ajuste fino) | Apache 2.0 | Hugging Face |
| nvidia/GR00T-N1.7-3B | no disponible en la información proporcionada | no disponible | Modelo base de robótica generalista | no disponible en la información proporcionada | Hugging Face |
| Cosmos-Reason2-2B | no disponible en la información proporcionada | no disponible | Modelo/tokenizer requerido por el runtime | no disponible en la información proporcionada | Requerido como dependencia |

No se dispone de información suficiente para comparar rendimiento con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- El checkpoint no ha sido evaluado en el robot real, por lo que no hay evidencia de éxito en la tarea `erase_whiteboard` fuera del entrenamiento.
- Entrenado con solo 20 episodios y 32625 fotogramas, lo que limita la generalización a variaciones de iluminación, posición de la pizarra o condiciones no vistas.
- El modelo está especializado en un único embodiment (K1 con dos brazos de 7 DOF y dos manos de 12 DOF) y en una única instrucción de tarea.
- Es necesario respetar el mapeo entre el orden de almacenamiento del estado y de la acción descrito en `export_info.json` y `modality.json`; interpretar el array de observación como array de acción produce resultados incorrectos.
- Las coordenadas registradas se refieren a los lados físicos del robot, incluso cuando la teleoperación usó modo espejo, lo que puede inducir errores si no se tiene en cuenta.
- Requiere un runtime compatible con GR00T N1.7 y los assets de Cosmos-Reason2-2B, lo que añade dependencias externas al despliegue.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones idiomáticas del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero no se han documentado las condiciones de los datos de entrenamiento ni posibles restricciones adicionales del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dongkkka/ai_sapiens_7arm_4finger_erase_board_groot_10k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Submódulo GR00T N1.7 (ROBOTIS-GIT): https://github.com/ROBOTIS-GIT/Isaac-GR00T-n1.7
