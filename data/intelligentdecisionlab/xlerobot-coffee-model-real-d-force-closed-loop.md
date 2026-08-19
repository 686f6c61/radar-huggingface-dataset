# IntelligentDecisionLab/xlerobot-coffee-model-real-d-force-closed-loop

## Resumen

Este modelo forma parte del proyecto X-Lerobot Coffee Automata del IntelligentDecisionLab (AS-CITI). Implementa el "Método D" de control con lazo de fuerza cerrado: una variante de ACT (Action Chunking with Transformers) que añade una cabeza auxiliar de predicción de fuerza futura al decoder. El modelo predice la señal de fuerza futura (hpi[t+1 … t+100]) junto con el chunk de acciones, de modo que el canal de fuerza debe modelarse en lugar de simplemente pasarse como token de condicionamiento.

El modelo se entrenó sobre un robot XLeRobot real de 17 grados de libertad (DoF) con dos cámaras (cabeza y muñeca derecha), sobre tres tareas individuales de una máquina de café: colocar la taza (t1), mover la taza a la bandeja (t3) y mover la bandeja a la mesa (t5). Cada carpeta del repositorio contiene un modelo pretrained completo con su checkpoint final de 100k pasos y un barrido de checkpoints intermedios.

La relevancia de este modelo radica en que aborda un problema conocido en la literatura de ACT con fuerza: si la señal de fuerza se introduce como token de condicionamiento sin pérdida asociada, el optimizador puede ignorarla. El Método D resuelve esto supervisando la fuerza futura, cerrando el lazo de fuerza de forma efectiva. El repositorio ocupa 3.1 GB y los pesos están en formato safetensors, bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con cabeza auxiliar de predicción de fuerza futura |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (chunk de acciones de 100 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ACT (Action Chunking with Transformers), una arquitectura transformer que predice chunks de acciones de longitud fija. En este caso, chunk_size es 100 y n_action_steps también es 100. Sobre la base ACT se añade el "Módulo A (A1)": la señal de fuerza observation.hpi[24] se introduce como un token dedicado, con una ventana densa multiescala y un codificador 1D-CNN, sin puerta de contacto.

La innovación principal es la cabeza auxiliar de predicción de fuerza futura (hpi_pred_enabled, hpi_pred_mode=future, hpi_pred_dim=18). El decoder predice la señal de fuerza futura hpi[t+1 … t+100] junto con el chunk de acciones, con una pérdida compuesta L_action + β·L_force, donde β=0.1. El encoder se recorta explícitamente a la ventana de entrada para que el modelo nunca reciba su propio objetivo, y los frames más allá del final del episodio se enmascaran mediante observation.hpi_is_pad.

El entrenamiento se realizó con batch 8, 100k pasos, seed 1000 y hpi_fps=30 (la tasa de datos). Los datos provienen del dataset IntelligentDecisionLab/xlerobot-coffee-real-2cam, con el canal de fuerza obtenido del DOB-EKF (Disturbance Observer - Extended Kalman Filter) de cada brazo. La dimensión hpi_pred_dim=18 supervisa [izquierda 9 | derecha 9] y enmascara el bloque de cuerpo completo de 6-D, que es un placeholder de ceros; incluirlo habría hecho trivialmente satisfacible una cuarta parte de la pérdida, reduciendo el β efectivo sobre la fuerza real a 0.75×.

## Capacidades

- Control robótico de manipulación dual-brazo con 17 grados de libertad sobre plataforma XLeRobot real.
- Predicción de fuerza futura integrada en el decoder, lo que cierra el lazo de fuerza (el modelo debe modelar hpi[t+1 … t+100]).
- Percepción visual con dos cámaras (cabeza y muñeca derecha).
- Ejecución de tres tareas individuales de máquina de café: colocar taza (t1), taza a bandeja (t3), bandeja a mesa (t5).
- Modelado de señal de fuerza de 24 canales (observation.hpi) con 18 canales supervisados (9 por brazo).
- Enmascaramiento de padding para episodios de longitud variable mediante observation.hpi_is_pad.
- Barrido de checkpoints por paso de entrenamiento para selección de punto óptimo.

## Casos de uso

- Automatización de máquinas de café: el modelo ejecuta las tres tareas individuales (colocar taza, transferir taza a bandeja, transferir bandeja a mesa) sobre un robot XLeRobot real de 17 DoF, integrando percepción visual dual y control con lazo de fuerza.

- Investigación en control con fuerza para ACT: el Método D demuestra cómo supervisar la fuerza futura en lugar de pasarla como token de condicionamiento, lo que es directamente relevante para cualquier trabajo sobre ACT con señales táctiles o de fuerza.

- Desarrollo de robots de bajo coste: XLeRobot es una plataforma de bajo coste basada en un carro de IKEA, lo que permite reproducir experimentos de manipulación con fuerza en entornos académicos con presupuesto limitado.

- Evaluación de checkpoints para control robótico: el repositorio incluye un barrido de checkpoints (checkpoints/<NNNNNN>/), lo que permite seleccionar el paso de entrenamiento óptimo para cada tarea mediante evaluación en robot.

- Comparación de métodos de pérdida en ACT: al ser idéntico al Método B en datos, arquitectura y receta (solo cambia la pérdida), este modelo sirve como referencia controlada para estudiar el efecto del término de fuerza en ACT.

- Investigación en aprendizaje por imitación con señales multimodales: el modelo integra visión, cinemática y fuerza en un único transformer, lo que lo hace útil para estudiar fusión de modalidades en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al tratarse de un modelo de robótica.

Las pérdidas finales de entrenamiento reportadas por el autor son:

| Métrica | Valor |
|---|---|
| Pérdida final de entrenamiento (rango entre las tres carpetas) | 0.041 – 0.052 |
| L1 de copia del token de entrada contra objetivo futuro (Método D) | 50.5 |
| L1 de copia del token de entrada contra objetivo actual (Método C, fallido) | 0.000 |

El autor advierte explícitamente que estas pérdidas no son éxito de tarea, no son comparables entre métodos (el total del Método D incluye el término auxiliar de fuerza) y que 100k pasos sobre ~50 episodios (~90–110 épocas) probablemente sobreajustan.

## Requisitos de hardware

- Requisitos de VRAM: no especificados en la información disponible. El tamaño del repositorio es de 3.1 GB, lo que sugiere que los pesos caben en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no especificadas por el autor. Para entrenamiento de ACT con batch 8 y 100k pasos, se estima que una GPU con 24 GB de VRAM (RTX 3090/4090) sería suficiente, pero esto no está confirmado.
- Despliegue: requiere la rama Coffee_Automata / hpi_act de la librería LeRobot para instanciar el modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de robótica, no de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa directa es con el Método B del mismo proyecto, que comparte datos, arquitectura y receta:

| Aspecto | Método D (este modelo) | Método B |
|---|---|---|
| Pérdida de fuerza | L_action + β·L_force (β=0.1) supervisando fuerza futura hpi[t+1 … t+100] | Sin pérdida de fuerza; hpi como token de condicionamiento sin loss |
| Lazo de fuerza | Cerrado (el decoder debe modelar la fuerza futura) | Abierto (el optimizador puede ignorar hpi) |
| Datos | IntelligentDecisionLab/xlerobot-coffee-real-2cam | Mismo dataset |
| Arquitectura | ACT + Módulo A1 + cabeza de fuerza futura | ACT + Módulo A1 |
| Receta | chunk 100, batch 8, 100k pasos, seed 1000 | Idéntica |
| Evaluación en robot | No realizada aún | No especificada |

También se documenta el Método C (fallido), que supervisaba la fuerza del frame actual y era trivialmente satisfecho copiando el token de entrada (L1 0.000), frente al L1 50.5 que obtiene la copia contra el objetivo futuro del Método D.

## Limitaciones y advertencias

- No se ha realizado evaluación en el robot real: las pérdidas de entrenamiento (0.041–0.052) no son éxito de tarea y no son comparables entre métodos.
- Sobreajuste probable: 100k pasos sobre ~50 episodios equivale a ~90–110 épocas.
- Solo se incluyen las tres tareas individuales (t1, t3, t5); los expertos agrupados (g35, g135) no están entrenados para el Método D.
- Requiere la rama Coffee_Automata / hpi_act de la librería LeRobot para instanciar el modelo; no es compatible con la rama estándar.
- No se especifican idiomas ni capacidades lingüísticas; es un modelo puramente robótico.
- La licencia Apache-2.0 permite uso comercial, pero el modelo depende de la plataforma XLeRobot y del dataset asociado, cuyas condiciones pueden variar.
- El canal de fuerza proviene de un DOB-EKF, por lo que la calidad de la predicción depende de la calibración del observador en cada brazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-d-force-closed-loop
- Método B (comparativa directa): https://huggingface.co/IntelligentDecisionLab/xlerobot-coffee-model-real-b-force
- Dataset de entrenamiento: IntelligentDecisionLab/xlerobot-coffee-real-2cam
- XLeRobot (repositorio original): https://github.com/Vector-Wangel/XLeRobot
- XLeRobot (fork comunitario): https://github.com/ggs2ggs/XLeRobot
- Documentación de XLeRobot: https://xlerobot.readthedocs.io/en/latest/
