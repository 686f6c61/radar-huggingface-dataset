# geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v3

## Resumen

El modelo `geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v3` es un checkpoint intermedio (step 3000) de un fine-tune de dos pasadas (two-pass) sobre el modelo base `geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v1-step25000`, que a su vez deriva de Cosmos3-Edge-Policy-DROID de NVIDIA. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, diseñado para convertir observaciones visuales y comandos en lenguaje en acciones de control para brazos robóticos. El autor, geonmin-kim, lo publica como una instantánea de evaluación dentro de un proceso de entrenamiento planificado a 100 000 iteraciones, con el objetivo de aislar el efecto de una tasa de aprendizaje corregida (1e-5) frente a versiones anteriores que colapsaron por un lr excesivo.

La relevancia de este modelo radica en que aborda un problema crítico en el fine-tune de VLA: la destrucción de representaciones preentrenadas por tasas de aprendizaje demasiado altas. Frente a las versiones v1lr y v2, que usaban lr 2e-4 y mostraban un colapso en el benchmark RoboLab (7/96 aciertos y 45,7 choques de pinza por episodio), esta versión v3 parte de un checkpoint saludable (v1-step25000) con lr 1e-5 y un warm-up más largo, manteniendo el puente de acción (action bridge) con multiplicador 5x. El entrenamiento se realiza exclusivamente con datos DROID (éxitos y fallos) y se ejecuta en 2 GPU NVIDIA B300 con FSDP, bfloat16 y activation checkpointing completo.

Al ser un checkpoint al 3% del entrenamiento, no es un producto final, sino una herramienta para evaluar la estabilidad de la receta de entrenamiento. El autor advierte explícitamente que no se debe juzgar por la curva de loss ni por el error MAE en open-loop, y que la métrica de referencia es el benchmark RoboLab con n=96, donde un ±9 puntos porcentuales se considera ruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en Cosmos3-Edge, con two-pass FastWAM (pass A vision FM, pass B action FM) |
| Parametros totales | 4B (modelo base Cosmos3-Edge, segun documentacion de NVIDIA; el fine-tune no modifica la arquitectura) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a lenguaje natural) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Cosmos3-Edge, un VLA de 4B parámetros desarrollado por NVIDIA que forma parte de la familia Cosmos 3. Cosmos 3 lee estados observados (imágenes, vídeo) y recupera la trayectoria o el control que explica cómo cambió la escena, convirtiendo evidencia visual en acciones. En esta variante fine-tuned, se aplica un esquema de dos pasadas (two-pass) denominado FastWAM: una primera pasada (pass A) se centra en el feature matching de visión (vision FM) con loss_scale=1, y una segunda pasada (pass B) optimiza el feature matching de acción (action FM) con action_loss_weight=10. El modelo base es el checkpoint v1-step25000, que había logrado un 27,1% de éxito en RoboLab con un historial de lr saludable (1e-5).

El entrenamiento de este checkpoint v3 se realizó con las siguientes características: optimizador FusedAdamW con lr 1e-5, multiplicador 5x para los módulos de puente (action2llm, llm2action, action_modality_embed), scheduler LambdaLinear con warm-up de 1000 pasos y decaimiento de f_max 1.0 a f_min 0.1 en ciclos de 25 000. Se congelaron el backbone VLM y el VAE, entrenando únicamente el experto de generación (gen expert) y los puentes. Los datos de entrenamiento provienen exclusivamente del dataset DROID (incluyendo episodios de éxito y fallo, con keep_ranges), eliminando la mezcla con IsaacSim que se usaba en v2, porque con 2 GPU el RankPartitionedDataLoader no podía mantener la proporción 3:1 y duplicaba el peso del sim, lo que aumentaba el riesgo de colisiones de pinza. El hardware fue 2x NVIDIA B300 con FSDP shard 2, bfloat16 y activation checkpointing completo, manteniendo un batch efectivo de 64 mediante grad_accum=2.

## Capacidades

- Control de robots manipuladores: genera acciones de control (posiciones de articulaciones, movimientos de pinza) a partir de observaciones visuales y comandos en lenguaje.
- Razonamiento visuomotor: integra visión y lenguaje para interpretar escenas y producir trayectorias de acción.
- Aprendizaje a partir de demostraciones: fine-tune sobre el dataset DROID, que incluye tanto episodios exitosos como fallidos, lo que permite aprender de errores.
- Soporte de dos pasadas (two-pass): separa el feature matching de visión y de acción, lo que puede mejorar la estabilidad del entrenamiento y la calidad de las acciones generadas.
- No incluye generación de texto general, tool calling ni capacidades de agente conversacional; su ámbito es exclusivamente robótico.

## Casos de uso

- Manipulación robótica en entornos de laboratorio: el modelo puede controlar brazos robóticos en tareas como recoger, colocar o apilar objetos, usando la ventana de contexto visual para interpretar la escena actual y generar comandos de movimiento.
- Evaluación de políticas de control en benchmarks: dado que es un checkpoint intermedio, su uso principal es medir la estabilidad de la receta de entrenamiento en RoboLab (12 tareas × 8 brazos), comparando el éxito y la frecuencia de colisiones de pinza frente a versiones anteriores.
- Desarrollo de VLA con fine-tune controlado: sirve como referencia para investigar cómo la tasa de aprendizaje y el warm-up afectan a la preservación de representaciones preentrenadas en modelos de robótica.
- Despliegue en servidores de política de acción: el autor proporciona un script (`action_policy_server_robolab`) que permite servir el modelo como un endpoint HTTP para integrarlo en sistemas de control robótico en tiempo real.
- Estudio de fallos de entrenamiento: al ser un snapshot al 3% de las iteraciones, permite analizar la dinámica temprana del entrenamiento y detectar signos de colapso antes de invertir más recursos.
- Investigación sobre puentes de acción (action bridges): el multiplicador 5x en los módulos de puente es un experimento para acelerar la adaptación de módulos pequeños sin destruir el backbone, y este checkpoint permite validar esa hipótesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint v3 en la informacion disponible. El autor solo proporciona datos de versiones anteriores del mismo proyecto, que se resumen a continuacion como referencia:

| Modelo | Exito en RoboLab (n=96) | GRIPPER_HIT_TABLE / episodio |
|---|---|---|
| nvidia baseline (full WAM) | 35/96 (36,5%) | 4,5 |
| FastWAM v1 25k (lr 1e-5) | 26/96 (27,1%) | 6,3 |
| FastWAM v1lr 10k (lr 2e-4) | 7/96 (7,3%) | 45,7 |

El autor advierte que la loss no es un indicador fiable (la funcion objetivo es de tipo matching y se aplana tanto en exitos como en fallos), y que el error MAE en open-loop ha dado resultados contradictorios en tres ocasiones. La metrica de referencia es RoboLab, y con n=96 un ±9 puntos porcentuales se considera ruido estadistico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Dado que el modelo base tiene 4B parametros, se estima que en precision bfloat16 ocuparia aproximadamente 8 GB, pero no se confirma.
- GPU recomendadas: el entrenamiento se realizo en 2x NVIDIA B300, pero para inferencia no se especifican requisitos. Por el tamano del modelo, podria ejecutarse en GPUs consumer como RTX 3090 o RTX 4090 con cuantizacion, aunque no hay datos oficiales.
- Opciones de despliegue: el autor proporciona un script de servidor (`action_policy_server_robolab`) que carga el checkpoint y expone un puerto HTTP. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros VLA de la misma categoria (por ejemplo, OpenVLA, RT-2 o el propio Cosmos3-Nano-Policy-DROID) en la informacion proporcionada. La unica comparativa disponible es interna, entre las versiones del mismo autor (v1, v1lr, v2 y v3), que ya se ha reflejado en la seccion de benchmarks. Se puede indicar que Cosmos3-Edge-Policy-DROID es la variante de 4B de la familia Cosmos 3, mientras que Cosmos3-Nano-Policy-DROID tiene 16B y Cosmos3-Super 64B, pero no hay datos de rendimiento relativo.

## Limitaciones y advertencias

- Checkpoint intermedio: es un snapshot al 3% del entrenamiento planificado (step 3000 de 100 000), no un modelo final. Puede no reflejar el rendimiento convergido y podria ser inestable.
- Riesgo de colapso: las versiones anteriores con lr alto (v1lr, v2) mostraron un colapso severo (7/96 exitos y 45,7 choques de pinza por episodio). Aunque v3 corrige el lr, no se ha validado aun su estabilidad a largo plazo.
- Sesgo de datos: el entrenamiento se realiza exclusivamente con el dataset DROID, que puede no generalizar a otros entornos o tipos de robots fuera de los representados en ese dataset.
- Alucinacion de acciones: como todo VLA, puede generar acciones inconsistentes con la escena observada, especialmente en situaciones fuera de distribucion.
- Licencia restrictiva: la licencia nvidia-open-model-license puede imponer restricciones de uso comercial o de redistribucion. Es necesario revisar los terminos completos antes de usar el modelo en produccion.
- Sin soporte de lenguaje natural: no es un modelo de chat ni de generacion de texto; su unica salida son acciones de control.
- Advertencias del autor: no usar la loss ni el MAE open-loop como criterio de evaluacion; usar RoboLab con muestreo adaptativo y seleccionar pesos mediante EMA o soup en lugar de un unico checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v3
- Version v2 (checkpoint step 3000): https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v2-step3000
- Version v1lr (checkpoint step 10000): https://huggingface.co/geonmin-kim/Cosmos3-Edge-Policy-DROID-FastWAM-v1lr-step10000
- Documentacion de NVIDIA sobre Cosmos 3: https://docs.nvidia.com/cosmos/latest/cosmos3/model_reference.html
- Pagina de investigacion de Cosmos Lab: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Repositorio de NVIDIA en GitHub (releases): https://github.com/NVIDIA/Cosmos/releases
