# Sa74ll/LocalModels-ACT-bimanual

## Resumen

LocalModels-ACT-bimanual es la entrega del equipo LocalModels (Saleh Alsharideh, investigador independiente) al CoRL 2026 RoboEval Diagnostic Bimanual Challenge, una competición de manipulacion robotica bimanual evaluada en simulacion. No es un modelo de lenguaje: es un paquete de politica robotica que combina siete controladores RGB-D disenados a mano (sin pesos aprendidos) con una Action Chunking Transformer (ACT) entrenada por imitacion y afinada con GRPO para la tarea LiftPot. El conjunto obtuvo una puntuacion oficial de 0,9861, con 399 de 400 episodios exitosos.

El interes tecnico del artefacto reside en su enfoque hibrido: en lugar de entrenar una unica politica neuronal para todas las tareas, el autor selecciona por tarea entre controladores analiticos y una politica aprendida, y solo emplea aprendizaje por refuerzo donde la imitacion pura no basta. La ACT se apoya en la libreria LeRobot y se distribuye en formato safetensors dentro de un bundle compatible con el evaluador RoboEval.

El repositorio ocupa 0,1 GB e incluye el bundle de envio, los registros de la ejecucion oficial (semillas 1000-1049) y sumas SHA-1 de verificacion. Esta ficha describe el paquete tal como se publica; los datos de arquitectura neuronal mas alla de la ACT no estan detallados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT) para LiftPot; siete controladores RGB-D disenados a mano para el resto de tareas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones RGB-D y estado proprioceptivo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin interfaz de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos de la ACT); configuraciones en JSON (`hybrid.json`, configs de LiftPot) |

## Arquitectura y entrenamiento

El sistema es un hibrido de control. Siete de las ocho tareas del suite (CubeHandover, LiftTray, PackBox, PickSingleBookFromTable, RotateValve, StackSingleBookShelf y StackTwoBlocks) se resuelven con controladores RGB-D disenados a mano, sin pesos aprendidos; cada uno se selecciona mediante un fichero `hybrid.json`. Solo LiftPot emplea una Action Chunking Transformer, entrenada primero por imitacion sobre demostraciones y despues afinada en simulacion con GRPO (Group Relative Policy Optimization), una variante de optimizacion de politica con refuerzo.

La ACT sigue la implementacion de LeRobot, con el fichero `modeling_act.py` modificado respecto al original (Apache-2.0) y con un aviso de licencia anadido. Los datos de entrenamiento proceden del dataset `helen9975/roboeval_ee_delta_20hz_scaled` (acciones en delta del efector final a 20 Hz, escaladas) y los rollouts generados se publican en `Sa74ll/LocalModels-ACT-bimanual-rollouts`. El detalle completo de datos de entrenamiento y del uso de estado del simulador se remite a la seccion 3 del informe del autor; en la informacion disponible no se especifican el numero de tokens, la composicion exacta del dataset ni los hiperparametros de GRPO.

## Capacidades

- Manipulacion robotica bimanual en simulacion sobre el benchmark RoboEval (suite de ocho tareas).
- Control basado en observaciones RGB-D y acciones en delta del efector final a 20 Hz.
- Ejecucion de politicas de imitacion (ACT) con chunking de acciones para tareas de agarre y colocacion (LiftPot).
- Afinamiento por refuerzo (GRPO) en simulacion para mejorar la robustez de la politica aprendida.
- Seleccion por tarea entre controladores analiticos y politica neuronal mediante selectores `hybrid.json`.
- Verificacion de integridad del bundle mediante sumas SHA-1 (`SHA1SUMS.txt`).
- No soporta tool calling, agentes de lenguaje, vision general, audio ni capacidades multilingues: es un artefacto de robotica, no un modelo fundacional de proposito general.

## Casos de uso

- Evaluacion reproducible en RoboEval: el bundle se ejecuta con `python -m roboeval.challenge.evaluate` sobre el tag `corl2026-challenge`, lo que permite replicar la puntuacion oficial de 0,9861 con las semillas 1000-1049.
- Baseline para el challenge CoRL 2026: sirve como referencia de puntuacion (399/400 episodios) contra la que comparar nuevas entregas bimanuales.
- Estudio de control hibrido: el diseno permite analizar cuando un controlador analitico supera a una politica aprendida y viceversa, tarea por tarea.
- Investigacion en imitacion + RL: la ACT afinada con GRPO en LiftPot es un caso concreto para estudiar el paso de behavior cloning a optimizacion de politica en manipulacion.
- Reutilizacion de la ACT en tareas de picking: los pesos safetensors y la configuracion de LiftPot pueden adaptarse a tareas de agarre similares con demostraciones propias.
- Docencia y prototipado en robotica: el repositorio de 0,1 GB y la licencia Apache-2.0 facilitan su uso en cursos y laboratorios de aprendizaje por imitacion.
- Auditoria de integridad de envios: el esquema de sumas SHA-1 y la separacion entre `submission/` y `official_run/` sirven de plantilla para empaquetar entregas verificables en competiciones.

## Benchmarks y rendimiento

Resultados de la ejecucion oficial (semillas 1000-1049, 50 episodios por tarea):

| Tarea | Politica | Exitos | Puntuacion |
|---|---|---|---|
| CubeHandover | controlador | 50 | 1,000 |
| LiftPot | ACT | 50 | 0,999 |
| LiftTray | controlador | 50 | 1,000 |
| PackBox | controlador | 49 | 0,954 |
| PickSingleBookFromTable | controlador | 50 | 0,987 |
| RotateValve | controlador | 50 | 1,000 |
| StackSingleBookShelf | controlador | 50 | 1,000 |
| StackTwoBlocks | controlador | 50 | 0,948 |
| **Suite** | | **399 / 400** | **0,9861** |

No se han publicado en la informacion disponible comparaciones con otros modelos en las mismas tareas, ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 0,1 GB y la ACT es el unico componente con pesos, por lo que la huella de memoria es reducida, pero no se publican cifras.
- GPU recomendadas: no disponibles; el comando de evaluacion acepta `--gpus 0` y `--workers W`, pero no se especifican modelos de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: evaluador RoboEval (tag `corl2026-challenge`), con dependencias en `submission/policy/requirements.txt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras entregas del challenge ni modelos comparables con parametros, contexto o licencia que permitan una tabla de comparacion fiable.

## Limitaciones y advertencias

- Solo una de las ocho tareas (LiftPot) usa pesos aprendidos; el resto son controladores analiticos, por lo que el termino "modelo" es enganoso si se espera una politica neuronal unica.
- El rendimiento esta medido exclusivamente en simulacion (RoboEval/MuJoCo); no hay evidencia de transferencia a robot real.
- Las tareas con menor puntuacion (StackTwoBlocks, 0,948, y PackBox, 0,954) concentran los fallos del suite.
- El bundle enviado se empaqueto sin `checkpoint/`; su `checkpoint_url` apunta a `submission/checkpoint` del repositorio, lo que exige descargar esa ruta para reproducir la ejecucion.
- Requiere el tag `corl2026-challenge` de RoboEval; versiones distintas pueden invalidar la reproducibilidad.
- Riesgo de sobreajuste al benchmark: con 400 episodios y semillas fijas, la puntuacion no garantiza generalizacion a variaciones no vistas.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque el artefacto no procesa lenguaje.
- Licencia Apache-2.0 permite uso comercial, pero `modeling_act.py` deriva de LeRobot (Apache-2.0) y conserva su aviso de licencia; conviene mantenerlo en redistribuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sa74ll/LocalModels-ACT-bimanual
- Codigo, informe y videos explicativos: https://github.com/Sa74ll/RoboevalChallenge
- Challenge RoboEval (CoRL 2026): https://robo-eval.github.io/challenge.html
- Dataset de entrenamiento: https://huggingface.co/datasets/helen9975/roboeval_ee_delta_20hz_scaled
- Rollouts generados: https://huggingface.co/datasets/Sa74ll/LocalModels-ACT-bimanual-rollouts
