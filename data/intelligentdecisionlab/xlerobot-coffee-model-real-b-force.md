# IntelligentDecisionLab/xlerobot-coffee-model-real-b-force

## Resumen

El modelo `xlerobot-coffee-model-real-b-force` es un sistema de control robótico basado en ACT (Action Chunking with Transformers) desarrollado por IntelligentDecisionLab dentro del proyecto X-Lerobot Coffee Automata. Está diseñado para operar un robot XLeRobot de 17 grados de libertad (DoF) en tareas de manipulación de una máquina de café, empleando información de fuerza (HPI) adicional. Este modelo corresponde al "Método B" de la cuadrícula dominio × método, entrenado exclusivamente con datos reales y con una rama que incorpora señales de fuerza como entrada.

La arquitectura combina ACT con un módulo adicional (Module A1) que procesa observaciones de alta dimensión (24 dimensiones para el espacio de acción completo de 17 DoF, o 9 para el brazo específico) mediante un encoder multiescala de ventana densa y una CNN 1D. El modelo se presenta en dos variantes por tarea: una que predice las 17 dimensiones de acción del robot completo y otra que predice solo las 6 dimensiones del brazo que ejecuta la tarea, sirviendo como control experimental para evaluar la dilución del gradiente en ACT.

La relevancia de este modelo radica en su enfoque práctico para la robótica de manipulación con información de fuerza, abordando problemas reales de automatización de tareas de café. Al estar entrenado con datos del mundo real y normalizado con una regla específica para evitar desviaciones estándar degeneradas, representa un caso de estudio en el uso de ACT con entradas multimodales y control fino de acciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) + Module A1, encoder multiescala denso + CNN 1D |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de control robótico, sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags de HuggingFace) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT (Action Chunking with Transformers), que predice secuencias de acciones (chunks) de 100 pasos con 100 pasos de acción por chunk. La observación incluye un token dedicado de 24 dimensiones de HPI (Human-Posture Interaction) que combina los 9 valores del brazo izquierdo, 9 del brazo derecho y 6 ceros para el cuerpo completo en la variante de 17 DoF; en la variante de 6 DoF, la observación es de 9 dimensiones correspondientes al bloque del brazo (gripper tau_ext/q/dq y wrench TCP de 6 dimensiones). El encoder es una ventana densa multiescala seguida de una CNN 1D, sin compuerta de contacto.

El entrenamiento se realizó con la receta estándar de ACT: batch size de 8, 100 000 pasos, semilla 1000, idéntica en las cuatro esquinas de la cuadrícula para aislar los efectos de dominio, método y dimensión de acción. Se utilizó una GPU RTX PRO 6000 Blackwell en el servidor idlab_server1. La frecuencia de HPI sigue la tasa de datos: 30 Hz para datos reales, 20 Hz para simulación. Las estadísticas de normalización se fijaron según la regla `xlerobot_norm_floor` (1e-2 para estado/acción, 1e-5 para HPI) para corregir un defecto de desviación estándar degenerada documentado en `EVAL_POSTMORTEM.md`. Los datos reales no incluyen `observation.hpi`; esta señal se obtiene del sidecar publicado `xlerobot-coffee-real-force-sidecar`, que contiene la salida del filtro DOB-EKF por brazo, unida por (episode_index, frame_index).

## Capacidades

- Control robótico de un manipulador XLeRobot de 17 DoF para tareas de manipulación de café (p. ej., t3_cup_to_tray, t2_push_button).
- Predicción de acciones en dos espacios: 17 DoF (robot completo) y 6 DoF (solo brazo ejecutor).
- Integración de información de fuerza (HPI) como entrada adicional, permitiendo un control sensible a la fuerza.
- Soporte para tareas de empuje de botones (t2_push_button, identificada como tarea de brazo derecho) y traslado de tazas a bandejas (t3_cup_to_tray).
- Entrenamiento con datos reales, lo que implica robustez frente a condiciones del mundo real.
- Capacidad de carga mediante la función `load_coffee_policy` del repositorio de scripts Coffee_Automata.

## Casos de uso

- Automatización de máquinas de café: el modelo puede ejecutar secuencias de manipulación como presionar botones y mover tazas, integrando información de fuerza para ajustar el agarre y la presión.
- Investigación en robótica con control de fuerza: permite estudiar cómo la inclusión de señales HPI afecta el rendimiento de ACT en tareas de contacto físico, gracias a las variantes 17-DoF y 6-DoF.
- Benchmark para validación de métodos de normalización: la regla `xlerobot_norm_floor` y el sidecar de fuerza proporcionan un caso de referencia para otros desarrolladores que trabajen con datos reales ruidosos.
- Desarrollo de pipelines de entrenamiento para robots de bajo costo: XLeRobot es una plataforma accesible, y este modelo demuestra su uso en tareas de precisión con realimentación de fuerza.
- Comparación de estrategias de representación de acciones: la existencia de modelos 17-DoF y 6-DoF permite evaluar el impacto de la dilución del gradiente en ACT y decidir qué espacio de acción usar según la tarea.
- Integración en sistemas de automatización industrial ligera: aunque específico para café, el enfoque puede adaptarse a otras tareas de manipulación con contacto (p. ej., ensamblaje, inserción) siempre que se disponga de datos de fuerza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas cuantitativas como tasas de éxito, precisión de acción o comparaciones con otros modelos.

## Requisitos de hardware

- El entrenamiento se realizó en una GPU RTX PRO 6000 Blackwell (48 GB VRAM), pero no se especifican requisitos de inferencia.
- El tamaño del repositorio es de 15.5 GB (pesos en safetensors), lo que sugiere que la inferencia requiere una GPU con al menos 16 GB de VRAM para cargar el modelo completo, aunque no hay datos confirmados.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, etc.); al ser un modelo de robótica, la inferencia se realiza probablemente en el propio robot o en un sistema embebido con GPU.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se proporciona información sobre modelos comparables en la misma categoría (robótica con ACT y fuerza). El modelo companion `xlerobot-coffee-model-real-a-vision-pos` existe, pero no se detallan diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo altamente específico: está entrenado para una cadena de tareas concreta (Coffee Automata) y no es generalizable a otras tareas robóticas sin reentrenamiento.
- Requiere el branch `hpi_act` del repositorio Coffee_Automata para instanciar la arquitectura, lo que limita su uso fuera de ese ecosistema.
- Dependencia de datos externos: la señal HPI proviene de un sidecar separado, por lo que es necesario disponer de ese componente para ejecutar el modelo correctamente.
- No se documentan sesgos ni riesgos de alucinación (al ser un modelo de control, estos conceptos no aplican directamente, pero la robustez ante variaciones del entorno no está garantizada).
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías de funcionamiento en entornos de producción sin validación adicional.
- No se especifican limitaciones de contexto o idioma, al no ser un modelo de lenguaje.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-b-force
- Modelo companion (Método A, visión+posición): https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-a-vision-pos
- Documentación interna del proyecto (referenciada en la model card): `docs/coffee/EVAL_POSTMORTEM.md` (no accesible públicamente desde el enlace proporcionado).
