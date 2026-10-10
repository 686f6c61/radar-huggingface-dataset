# jstm/molmoact2_mpc_50

## Resumen

MolmoAct2 MPC N=50 es un checkpoint de robótica publicado por el usuario jstm, consistente en un ajuste fino (fine-tuning) del modelo base allenai/MolmoAct2-LIBERO sobre un conjunto de demostraciones de manipulacion de sobremesa generadas con planificacion de movimiento y control predictivo (MPC) en el simulador ManiSkill. Se trata de un modelo de vision-lenguaje-accion (VLA) orientado al control de un brazo robotico, no de un modelo de lenguaje generalista.

El modelo aprende a mapear observaciones visuales y de estado a acciones de efector final mediante control de pose absoluta (`pd_ee_pose`). El entrenamiento se realizo sobre 192 demostraciones repartidas en cuatro entornos (PickCube, PushCube, LiftPegUpright y PullCubeTool), con un total de 5.442.196.272 parametros almacenados en formato safetensors y un tamano de repositorio de 10,9 GB.

Su relevancia radica en que ejemplifica el flujo actual de trabajo en robotica basada en aprendizaje: partir de un VLA preentrenado de referencia (MolmoAct2) y especializarlo con datos de demostracion de un simulador concreto y una modalidad de control especifica. Esto lo hace util como referencia reproducible para quienes quieran evaluar politicas de manipulacion en ManiSkill, aunque su publico objetivo es reducido y muy tecnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA); ajuste fino de allenai/MolmoAct2-LIBERO (detalle de backbone no disponible) |
| Parametros totales | 5.442.196.272 (~5,44 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; no se documenta soporte linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint allenai/MolmoAct2-LIBERO, perteneciente a la familia MolmoAct2 de modelos de vision-lenguaje-accion. Conserva la arquitectura del modelo base (VLA), aunque la informacion disponible no detalla la composicion exacta del backbone, el numero de tokens de vision, ni el mecanismo de fusion entre lenguaje y acciones.

En cuanto al entrenamiento, se partio del dataset jstm/mpc_lerobot_pd_ee_pose_50, compuesto por demostraciones de manipulacion de sobremesa generadas con planificacion de movimiento y replay en ManiSkill, con control de pose absoluta del efector final (`pd_ee_pose`). El dataset final contiene 192 demostraciones (48 por entorno) sobre los entornos PickCube-v2-wrist, PushCube-v2, LiftPegUpright-v2 y PullCubeTool-v2; el objetivo era recolectar 50 exitos por entorno, pero se retuvieron 48 tras la fase de planificacion de movimiento. El checkpoint publicado corresponde al paso de entrenamiento 10.000. No se documenta en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineamiento.

## Capacidades

- Control robótico de manipulacion de sobremesa: genera acciones de efector final en modo `pd_ee_pose` (pose absoluta) a partir de observaciones visuales y de estado.
- Percepcion multi-camara: procesa tres vistas simultaneas denominadas `camera_center`, `camera_left` y `camera_wrist`, con resolucion de 378x378 cada una.
- Ejecucion de tareas especificas: entrenado en cuatro tareas concretas de ManiSkill (PickCube-v2-wrist, PushCube-v2, LiftPegUpright-v2, PullCubeTool-v2).
- Integracion con LeRobot: sigue el formato y la libreria LeRobot, lo que facilita su carga en pipelines de evaluacion de politicas.
- Soporte de tool calling: no disponible (no aplica a un modelo de accion robotica).
- Razonamiento multi-paso y agentes: no disponible (no documentado).
- Capacidades multilingues: no disponible (no documentado).
- Capacidades especiales: no se documentan modos de pensamiento (thinking mode), vision generativa ni audio.

## Casos de uso

- Evaluacion de politicas de manipulacion en ManiSkill: el modelo se puede cargar directamente en los cuatro entornos documentados para medir tasas de exito y comparar contra otras politicas o contra el modelo base sin ajustar.
- Reproduccion de experimentos de fine-tuning VLA: sirve como checkpoint de referencia para estudiar como un ajuste fino sobre 192 demostraciones especializa a un modelo base como MolmoAct2-LIBERO en tareas concretas.
- Control de efector final con pose absoluta: en escenarios donde se requiere comandar la posicion y orientacion absolutas del efector final, el modo `pd_ee_pose` es directamente utilizable en un simulador o, potencialmente, en un robot real con la misma convencion de control.
- Generacion de datos sinteticos de manipulacion: combinado con MPC y planificacion de movimiento en ManiSkill, puede servir de politica inicial para recoleccion de nuevas trayectorias o para comparar con la planificacion clasica.
- Percepcion multi-camara en entornos estructurados: la combinacion de vista central, lateral y de muneca permite abordar tareas de pick-and-place con oclusiones parciales, util como banco de pruebas de fusion visual.
- Investigacion en aprendizaje por imitacion: al disponer de pocas demostraciones por tarea (48), es un caso practico para estudiar el regimen de low-data en VLA.
- Test de pipelines de despliegue en robotica: por su tamano (~5,44 mil millones de parametros) es un candidato realista para medir latencias y requisitos de VRAM en inferencia robótica en bucle cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica tabla disponible en la model card corresponde al recuento de demostraciones del dataset:

| Entorno | Demostraciones |
|---|---:|
| PickCube-v2-wrist | 48 |
| PushCube-v2 | 48 |
| LiftPegUpright-v2 | 48 |
| PullCubeTool-v2 | 48 |
| Total | 192 |

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (FP32) los ~5,44 mil millones de parametros no caben en GPU de consumo (se necesitarian del orden de 20 GB o mas); en FP16/BF16 el peso ocupa aproximadamente 10,9 GB (coincide con el tamano del repositorio), por lo que se requiere una GPU con al menos 12-16 GB de VRAM.
- GPUs recomendadas: para FP16/BF16, una RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o L40S son adecuadas. GPUs de 8-12 GB probablemente no son suficientes en FP16.
- Cabe en GPU de consumo: si, en BF16 puede caber en una RTX 4090 o en GPUs de 16 GB como la RTX 4080, asumiendo que no se anaden grandes overheads de activaciones ni de los tres flujos de camara a 378x378.
- Opciones de despliegue: la libreria declarada es LeRobot; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible, y por tratarse de un modelo de accion (no generativo de texto) esas herramientas no serian el cauce habitual.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entorno / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MolmoAct2 MPC N=50 (este) | ~5,44 mil millones | no disponible | ManiSkill, 4 tareas, `pd_ee_pose` | apache-2.0 | HuggingFace (jstm) |
| allenai/MolmoAct2-LIBERO | no disponible en esta ficha | no disponible | LIBERO | no disponible en esta ficha | HuggingFace (allenai) |
| Otras politicas VLA de manipulacion (OpenVLA, pi0, etc.) | no disponible en esta ficha | no disponible | robots de sobremesa / benchmarks propios | no disponible en esta ficha | no disponible en esta ficha |

La comparacion cuantitativa con alternativas no puede realizarse con la informacion disponible; los datos del modelo base MolmoAct2-LIBERO y de otros VLA no se detallan en el material proporcionado.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgos, y al ser un modelo de accion robotica el concepto no aplica del mismo modo que en modelos de lenguaje.
- Riesgo de alucinacion: en el sentido de generar acciones incorrectas o no validas, existe, pero no se cuantifica. Al ser una politica, los fallos se manifiestan como trayectorias erroneas, no como texto inventado.
- Limitaciones de contexto o idioma: no disponible; no se documenta ventana de contexto ni idiomas.
- Especializacion estrecha: entrenado unicamente en cuatro entornos de ManiSkill (PickCube, PushCube, LiftPegUpright, PullCubeTool) y en modo `pd_ee_pose`; es probable un rendimiento pobre fuera de esas tareas o con otra convencion de control.
- Pocos datos: 192 demostraciones (48 por tarea) es un volumen reducido, lo que limita la generalizacion y aumenta la sensibilidad a variaciones de camara, iluminacion o disposicion de objetos.
- Restricciones de licencia: licencia apache-2.0, que en principio permite uso comercial, pero el modelo deriva de allenai/MolmoAct2-LIBERO y conviene verificar la licencia del modelo base antes de un despliegue comercial.
- Caveat para produccion: es un checkpoint de investigacion (0 descargas, 0 likes, sin benchmarks publicados) y esta entrenado en simulacion; su transferencia a un robot real no esta validada.
- Dependencia del simulador: los resultados solo son significativos dentro de ManiSkill con los tres flujos de camara a 378x378 documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jstm/molmoact2_mpc_50
- Dataset de entrenamiento: https://huggingface.co/datasets/jstm/mpc_lerobot_pd_ee_pose_50
- Modelo base: https://huggingface.co/allenai/MolmoAct2-LIBERO
- Libreria LeRobot: no disponible en la informacion proporcionada.
