# jammin0319/act_g1_walk_grasp_desk065_ep15

## Resumen

`act_g1_walk_grasp_desk065_ep15` es un checkpoint de política robótica basado en ACT (Action Chunking Transformer) entrenado con la librería LeRobot 0.6.1 sobre el robot humanoide Unitree G1 equipado con manos Inspire RH56E2. Lo publica el usuario jammin0319 y su objetivo declarado es aprender una tarea combinada de locomoción y agarre (walk and grasp) de un cilindro situado sobre una mesa, en entorno simulado con Isaac Sim. El repositorio ocupa 3,1 GB y contiene pesos en safetensors organizados por checkpoints.

El modelo es relevante no por su rendimiento, sino como caso documentado de fracaso: el propio autor indica explícitamente en la model card que "no es una política funcional". En pruebas en bucle cerrado el modelo emite siempre un comando de locomoción nulo (vx, vy, wz = 0) y falla al alcanzar el cilindro desde una posición de inicio cercana (0 de 3 éxitos con el checkpoint de 40k pasos). La causa que apunta el autor es un desequilibrio en el dataset: había más fotogramas de estar de pie que de caminar antes de que el brazo empezara a moverse, de modo que el comando L1-óptimo resultó ser cero.

Se trata, por tanto, de un artefacto de referencia para investigación en imitación robótica y depuración de datasets, no de un modelo desplegable. El seguimiento del mismo autor es `jammin0319/act_g1_walk_far_v2`. Todo el trabajo es exclusivamente de simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar publicados) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato LeRobot, checkpoints por paso) |
| Entrada de estado | vector de 26 dimensiones |
| Salida de acción | 29 dimensiones: brazo 14 + mano 12 + locomoción (vx, vy, wz) |
| Cámaras de entrada | 4 |
| Pasos de entrenamiento | 100.000 |
| Batch size | 12 |
| Learning rate | 1,5e-5 |
| Checkpoints | cada 20.000 pasos (etiqueta git por paso) |
| Episodios de entrenamiento | 15 (13 train / 2 eval) |
| Librería | LeRobot 0.6.1 |

## Arquitectura y entrenamiento

ACT es un transformer de imitación que predice secuencias de acciones (chunks) a partir de observaciones visuales y de estado proprioceptivo, en lugar de una acción por paso. En este caso el modelo consume cuatro cámaras y un vector de estado de 26 dimensiones, y produce un vector de acción de 29 dimensiones que combina 14 grados de libertad de brazo, 12 de mano Inspire RH56E2 y tres comandos de locomoción (vx, vy, wz) para el Unitree G1.

El entrenamiento se realizó sobre 15 episodios generados por scripting en simulación (dataset `jammin0319/g1_inspire_walk_grasp_desk065_scripted_v1`, convertido a LeRobot v3.0), con 13 episodios para entrenamiento y 2 para evaluación. Se ejecutaron 100.000 pasos con batch 12 y learning rate 1,5e-5, guardando checkpoints cada 20.000 pasos. No se documenta uso de RLHF, DPO ni ninguna técnica de refinamiento posterior; es imitación supervisada pura sobre datos scriptados. La innovación técnica destacable es negativa: el desbalance del dataset (más fotogramas estáticos que de marcha antes del movimiento del brazo) sesgó la solución hacia el comando de locomoción nulo, un fallo clásico de covariate shift en imitación.

## Capacidades

- Control de un brazo de 14 grados de libertad y una mano antropomórfica de 12 grados de libertad (Inspire RH56E2).
- Emisión de comandos de locomoción para el humanoide Unitree G1 (vx, vy, wz).
- Fusión de cuatro cámaras y un vector de estado de 26 dimensiones como observación.
- Predicción de chunks de acción (característica propia de ACT).
- Entrenado exclusivamente para una tarea: caminar y agarrar un cilindro sobre una mesa a 0,65 m en simulación.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni ninguna capacidad de modelo de lenguaje.
- En la práctica, el modelo publicado no ejecuta la locomoción: emite comando cero en bucle cerrado.

## Casos de uso

- Referencia negativa en investigación de imitación: sirve para estudiar cómo el desbalance de un dataset (más frames estáticos que de marcha) colapsa la política hacia la acción media y produce comandos nulos; útil en docencia y en revisiones de pipelines de datos.
- Depuración de datasets de robótica: comparar la distribución de acciones del dataset scriptado con las salidas del checkpoint permite identificar el sesgo hacia cero y diseñar estrategias de balanceo o ponderación de pérdidas.
- Reproducción de experimentos LeRobot: el repositorio incluye checkpoints cada 20.000 pasos con etiquetas git, lo que facilita estudiar la evolución del entrenamiento y la aparición del colapso.
- Punto de partida para fine-tuning: el autor indica que el seguimiento es `act_g1_walk_far_v2`; este checkpoint puede usarse como inicialización para experimentos posteriores con datos corregidos.
- Validación de pipelines de evaluación en Isaac Sim: permite probar el arnés de evaluación en bucle cerrado (éxito/fracaso de agarre, comandos de locomoción) antes de entrenar políticas nuevas.
- Estudio de integración hardware-software: analizar el mapeo de 29 dimensiones (brazo, mano, locomoción) sobre el Unitree G1 con manos Inspire en simulación, como plantilla de interfaz para otros proyectos.
- Benchmark de referencia para comparar ACT frente a otros métodos de imitación (Diffusion Policy, VQ-BeT) sobre el mismo dataset, aunque con la advertencia de que el resultado base es un fracaso conocido.

## Benchmarks y rendimiento

El autor no publica métricas cuantitativas formales (tasa de éxito, error de posición, etc.) más allá de las pruebas cualitativas en bucle cerrado. Los únicos datos disponibles son:

| Prueba | Resultado |
|---|---|
| Comando de locomoción en bucle cerrado | Siempre cero (vx, vy, wz = 0) |
| Agarre de cilindro desde inicio cercano (checkpoint 40k) | 0 de 3 intentos |
| Evaluación con checkpoint final | No documentada numéricamente; el autor lo describe como no funcional |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo pesa 3,1 GB e incluye varios checkpoints, por lo que un único checkpoint de ACT es del orden de cientos de MB. Cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia; para reentrenamiento se recomienda RTX 4090, A100 o H100 según el tamaño del batch y el número de cámaras.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: LeRobot 0.6.1 (librería nativa del checkpoint); para simulación, Isaac Sim como entorno de evaluación. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de control.
- Latencia y throughput: no disponibles. La inferencia de ACT es rápida (milisegundos por chunk en GPU moderna), pero no hay cifras publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada/Salida | Dataset | Licencia | Estado |
|---|---|---|---|---|---|
| act_g1_walk_grasp_desk065_ep15 | ACT | 4 cámaras + estado 26 → acción 29 | 15 episodios scriptados | no disponible | No funcional (comando cero) |
| act_g1_walk_far_v2 (mismo autor) | ACT | no disponible | no disponible | no disponible | Seguimiento declarado, sin datos públicos en esta ficha |
| Diffusion Policy (referencia general) | Difusión para acciones | visión + estado → acción | variable | MIT (implementación de referencia) | Política de imitación ampliamente usada; sin resultados en este dataset |
| VQ-BeT (referencia general) | Transformer con cuantización de acciones | visión + estado → acción | variable | MIT (implementación de referencia) | Alternativa a ACT para imitación; sin resultados en este dataset |

No hay comparaciones directas publicadas sobre el mismo dataset ni métricas que permitan ordenar estos métodos en esta tarea concreta.

## Limitaciones y advertencias

- No es una política funcional: el autor lo declara explícitamente; en bucle cerrado emite comando de locomoción cero y falla el agarre (0/3 desde inicio cercano con el checkpoint de 40k).
- Sesgo de dataset: la sobrerrepresentación de fotogramas estáticos frente a los de marcha antes del movimiento del brazo hace que la solución L1-óptima sea el comando nulo.
- Solo simulación: entrenado y evaluado en Isaac Sim; no hay evidencia de transferencia a hardware real.
- Dataset muy pequeño: 15 episodios (13 train / 2 eval) es insuficiente para generalización robusta.
- Licencia no disponible: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Sin idiomas ni capacidades de lenguaje: no aplica para tareas de texto, código o razonamiento.
- Riesgo de sobreajuste a la trayectoria scriptada y a la posición inicial concreta del cilindro (mesa a 0,65 m).
- Sin métricas cuantitativas publicadas: no es posible comparar rigurosamente con alternativas.
- Fecha de creación y actualización en 2026: verificar vigencia y compatibilidad con versiones actuales de LeRobot antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jammin0319/act_g1_walk_grasp_desk065_ep15
- Dataset de entrenamiento: https://huggingface.co/datasets/jammin0319/g1_inspire_walk_grasp_desk065_scripted_v1
- Modelo de seguimiento: https://huggingface.co/jammin0319/act_g1_walk_far_v2
- LeRobot (librería): https://github.com/huggingface/lerobot
- Isaac Sim (entorno de simulación): https://developer.nvidia.com/isaac/sim
- Unitree G1: https://www.unitree.com/g1
- Inspire RH56E2: no disponible en la información proporcionada
