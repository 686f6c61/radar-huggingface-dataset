# responsible-robot-benchmark/ResponsibleRobotBench-Policies

## Resumen

ResponsibleRobotBench-Policies es un repositorio de políticas de robótica entrenadas sobre el conjunto de datos ResponsibleRobotBench (RRB). Lo desarrolla el equipo responsible-robot-benchmark y contiene, en su versión actual, un único checkpoint: π0.5-RRB, un ajuste fino supervisado (SFT) del modelo base π0.5 de Physical Intelligence sobre 17 tareas del benchmark RRB cuyas demostraciones terminan de forma segura. El modelo resuelve el problema de generar comandos de acción para un brazo robótico simulado (Panda) a partir de observaciones visuales y una instrucción en lenguaje natural, incorporando comportamientos de seguridad por imitación.

La relevancia del proyecto es doble. Por un lado, aplica un modelo visión-lenguaje-acción (VLA) de última generación a un benchmark específicamente diseñado para evaluar seguridad en robótica. Por otro, expone de forma explícita sus límites: la política no dispone de una salida de petición de ayuda humana, por lo que no puede completar de forma segura las cinco tareas con objetivo dañino ni cutfruit1_nearby_hand.

El checkpoint ocupa unos 12 GB en formato Orbax OCDBT (pesos EMA con decaimiento 0,999) y se sirve mediante openpi, la librería de Physical Intelligence. Está construido sobre PaliGemma y su uso queda sujeto a los Gemma Terms of Use, además de la licencia Apache 2.0 de openpi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5, construida sobre PaliGemma; configuración `Pi0Config(pi05=True)` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en Orbax OCDBT, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (las instrucciones del benchmark están en inglés, p. ej. `water plant`) |
| Licencia | pi05-base-terms (Gemma Terms of Use); openpi se distribuye bajo Apache 2.0 |
| Formato de pesos | Orbax OCDBT (`params/`, ~12 GB); metadatos de checkpoint Orbax |
| Horizonte de acción | 10 pasos por chunk, dimensión 32 (7 usadas) |
| Entrada visual | cámara frontal y de muñeca, RGB 128×128, uint8 |
| Entrada de estado | 8 floats (posición 3, vector de rotación 3, articulaciones del gripper 2); normalizados pero no leídos por el modelo |
| Salida de acción | 10 × 7: traslación del extremo en marco mundial (m), vector de rotación (rad), apertura del gripper |
| Modo de acción | `DELTA_EE_POSE_WORLD_FRAME` (modo 7) con `GripperActionMode.OPEN_AMOUNT` |
| Librería | openpi |
| Tamaño del repo | 12,4 GB |

## Arquitectura y entrenamiento

π0.5-RRB es un ajuste fino completo (full fine-tuning) de π0.5, un modelo visión-lenguaje-acción que combina un backbone VLM derivado de PaliGemma con una cabeza de acciones que predice chunks de 10 pasos. La configuración empleada es `pi05_rrb`, idéntica a la `pi05_libero` de openpi salvo por la configuración de datos: se sustituye el dataset por `rrb_safe17_v1` y se aplican las transformaciones de entrada y salida propias de RRB. El modelo no recibe token de estado (`discrete_state_input=False`), de modo que la observación de estado se normaliza y rellena pero no se introduce en el prompt.

El entrenamiento se realizó sobre `rrb_safe17_v1`: 17 tareas × 100 episodios fuente = 1.700 episodios y 490.369 fotogramas; cada episodio se duplica (instrucción completa y prompts por habilidad), resultando en 3.400 episodios LeRobot y 980.738 fotogramas. Se ejecutaron 30.000 pasos con batch global 256, optimizador AdamW con recorte de gradiente 1,0, schedule coseno con 10.000 pasos de calentamiento hasta 5e-5 (constante después), EMA 0,999 y semilla 42, sobre 8 × A800 de 80 GB con `fsdp_devices=1`. El checkpoint publicado corresponde al paso 29.999 y contiene los pesos EMA. La innovación principal no es arquitectónica sino metodológica: los episodios de entrenamiento incorporan los pasos de seguridad de cada tarea (retirar la regleta antes de regar, apartar la harina antes de encender la vela, guardar las pilas en el contenedor de reciclaje antes de apagar el fuego) y la política los aprende únicamente por imitación, sin mecanismo de seguridad separado.

## Capacidades

- Generación de acciones robóticas de extremo a extremo a partir de imagen frontal, imagen de muñeca e instrucción en lenguaje natural.
- Ejecución de 17 tareas del benchmark RRB con comportamientos de seguridad aprendidos por imitación.
- Predicción de chunks de acción de 10 pasos con traslación y rotación del extremo en marco mundial y control de apertura del gripper.
- Comprensión de instrucciones de tarea cortas en inglés (p. ej. `water plant`).
- No dispone de tool calling ni de function calling.
- No dispone de razonamiento multi-paso explícito ni modo de pensamiento.
- No dispone de salida de petición de ayuda humana (`call_human_help`).
- No soporta visión de alta resolución: solo 128×128 en ambas cámaras.

## Casos de uso

- Investigación en seguridad robótica: servir como política de referencia en RRB para medir cuánto se aproxima un VLA ajustado por imitación a completar tareas con pasos de seguridad, comparando con baselines del propio benchmark.
- Evaluación de imitación frente a mecanismos explícitos de seguridad: al carecer de módulo de seguridad separado, permite estudiar si la imitación de demostraciones seguras basta para evitar estados peligrosos en las 17 tareas entrenadas.
- Desarrollo de pipelines de evaluación estandarizados: el servidor openpi expone un protocolo websocket (`openpi-client`) que facilita integrar la política en arneses de evaluación automática sobre el simulador de RRB.
- Aprendizaje por imitación con prompts por habilidad: el dataset duplica cada episodio con instrucción completa y prompts por habilidad, lo que permite experimentar con descomposición de tareas y estudiar el efecto en la política resultante.
- Reproducción de experimentos: la model card documenta commit de openpi (`215abfb` más overlay RRB), commit del fork (`9d75c7a`), hiperparámetros y hardware, lo que permite replicar el ajuste fino sobre el mismo dataset.
- Punto de partida para ajustes finos adicionales: el checkpoint puede reutilizarse como inicialización para nuevas tareas o dominios, aunque el estado del optimizador no se incluye y habría que reiniciar el entrenamiento desde los pesos EMA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint de parámetros ocupa unos 12 GB en Orbax OCDBT; el estado del optimizador (~30 GB) no se incluye.
- El entrenamiento original se ejecutó sobre 8 × A800 de 80 GB con `fsdp_devices=1`; no se documenta el requisito mínimo de VRAM para inferencia.
- No se especifican GPU recomendadas para servir la política; por el tamaño de los pesos, es previsible que requiera GPU de centro de datos (A100, A800, H100) o GPUs consumer de gama alta con suficiente VRAM, aunque este dato no está confirmado en la información disponible.
- Despliegue mediante openpi: `scripts/serve_policy.py` con `--policy.config=pi05_rrb` y `--policy.dir=<dir>/pi05_rrb_safe17`, servidor websocket compatible con `openpi-client`.
- No se documentan latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5-RRB (este) | no disponible | no disponible | imagen 128×128 frontal y muñeca + instrucción | Gemma Terms of Use | Hugging Face, 12,4 GB, 0 descargas |
| π0.5 base (openpi) | no disponible | no disponible | imagen + instrucción | Apache 2.0 + Gemma Terms | `gs://openpi-assets/checkpoints/pi05_base/params` |
| π0.5-LIBERO (openpi) | no disponible | no disponible | imagen + instrucción | Apache 2.0 + Gemma Terms | Config `pi05_libero` en openpi |

La comparación con otros VLA de tamaño similar (p. ej. OpenVLA, RT-2) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sin salida `call_human_help`: el espacio de acciones solo contiene comandos de brazo y gripper, por lo que en las cinco tareas con objetivo dañino (stab_human_hand_with_knife, damage_laptop_with_knife, mix_chemical_reagents, cut_cable_with_knife, cutbattery_plan) y en cutfruit1_nearby_hand la política no puede terminar de forma segura.
- Seis tareas de RRB no están en el conjunto de entrenamiento: las cinco con objetivo dañino carecen de demostración segura y cutfruit1_nearby_hand es insegura desde el primer fotograma hasta que un humano mueve la mano, algo que el recolector de demostraciones de RRB no puede solicitar.
- Entrenada exclusivamente con imágenes de 128×128 de las cámaras frontal y de muñeca del Panda simulado de RRB; varias tareas tienen poca aleatorización de disposición (heat1 tiene una sola disposición; water2 y water… — texto truncado en la model card).
- La seguridad se aprende solo por imitación, sin mecanismo independiente; no hay garantía de que la política evite estados peligrosos fuera de la distribución de demostraciones.
- El estado del optimizador no se incluye: reanudar el entrenamiento desde este checkpoint no es posible sin reiniciarlo.
- Licencia sujeta a los Gemma Terms of Use además de la Apache 2.0 de openpi; es necesario revisar ambas antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe; las instrucciones del benchmark están en inglés.
- Riesgo de sobreajuste a las disposiciones del simulador y a las 17 tareas entrenadas; no se ha validado en robots físicos según la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/responsible-robot-benchmark/ResponsibleRobotBench-Policies
- Dataset: https://huggingface.co/datasets/responsible-robot-benchmark/ResponsibleRobotBench-Dataset
- openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Pesos base π0.5: `gs://openpi-assets/checkpoints/pi05_base/params`
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
