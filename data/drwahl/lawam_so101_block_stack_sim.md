# drwahl/lawam_so101_block_stack_sim

## Resumen

lawam_so101_block_stack_sim es un ajuste fino del modelo de robotica LaWAM (base `jialei02/lawam-pretrain-lerobot`) especializado en una tarea concreta: apilar un bloque de 30 mm sobre otro con el brazo robotico SO-101, en simulacion. Lo publica el usuario drwahl junto con el dataset `drwahl/so101_block_stack_sim` y el repositorio de codigo `danwahl/vla-test`. No es un modelo de lenguaje generalista, sino una politica visuomotora (vision-language-action) orientada a control robotico, empaquetada con el formato LeRobot.

El ajuste emplea LoRA (r=32, alpha=64) sobre el backbone de lenguaje del modelo base, manteniendo entrenados el cabezal de flujo (flow head), la proyeccion VLM-a-LAM y el decodificador LAM, con la torre de vision congelada. Se entrenaron 20.000 pasos con batch de 4, reutilizando la normalizacion, el learning rate y la longitud de chunk del checkpoint base. El resultado es un adaptador ligero que se carga sobre los pesos originales, con un repositorio de 2,2 GB que incluye el adaptador y los procesadores (normalizacion y renombrado de camaras).

Su relevancia es acotada pero clara: sirve como referencia reproducible de ajuste fino de un VLA sobre un brazo de bajo coste (SO-101) y demuestra el flujo completo de entrenamiento y evaluacion con LeRobot. La evaluacion reportada apila 110,7 de 150 layouts reservados ejecutando 10 pasos de cada chunk de 24, con 123,3 levantamientos, promediado sobre tres semillas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) tipo LaWAM: backbone VLM con proyeccion a LAM y decodificador LAM con cabezal de flujo; ajuste LoRA sobre el backbone de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (chunk de accion de 24 pasos, ejecutados de 10 en 10 en la evaluacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; no se documentan capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA y procesadores en `adapter/`, cargados sobre los pesos base) |

## Arquitectura y entrenamiento

El modelo base LaWAM combina un backbone de vision-lenguaje con una proyeccion hacia un modulo LAM y un decodificador LAM que genera acciones mediante un cabezal de flujo. En este ajuste se congela la torre de vision y se entrena con LoRA (r=32, alpha=64) el backbone de lenguaje, ademas de mantener densos el flow head, la proyeccion VLM-a-LAM y el decodificador LAM. El entrenamiento se realizo durante 20.000 pasos con batch de 4 sobre el dataset `drwahl/so101_block_stack_sim`, usando la configuracion `train/lawam_so101.yaml` del repositorio `vla-test`.

Los hiperparametros de normalizacion, learning rate y longitud de chunk se heredan del checkpoint base `jialei02/lawam-pretrain-lerobot`. El adaptador incluye los procesadores necesarios para la normalizacion de observaciones y el renombrado de camaras, de modo que LeRobot pueda cargarlo directamente sobre los pesos base. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Control visuomotor para apilar bloques: genera trayectorias de accion para el brazo SO-101 a partir de observaciones visuales en simulacion.
- Ejecucion por chunks de accion de 24 pasos, con la posibilidad de ejecutar subconjuntos (por ejemplo, 10 pasos) y replanificar.
- Integracion con LeRobot: el adaptador y los procesadores se cargan sobre los pesos base mediante la libreria.
- Ajuste eficiente mediante LoRA sobre el backbone de lenguaje, con vision congelada.
- Tarea especializada: no se documentan capacidades de tool calling, agentes, razonamiento multietapa, matematicas ni generacion de texto general.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en manipulacion robotica: reproducir el pipeline completo de ajuste fino de un VLA sobre el brazo SO-101 usando el dataset y la configuracion publicados, como linea base para experimentos propios.
- Evaluacion de tecnicas de ajuste eficiente: comparar LoRA sobre el backbone de lenguaje frente a ajuste completo u otras estrategias en tareas de apilado, gracias a la separacion clara entre adaptador y pesos base.
- Prototipado de politicas de apilado en simulacion: usar el modelo para generar trayectorias de apilado de bloques de 30 mm antes de transferir a un montaje fisico con SO-101.
- Benchmarking de politicas VLA: emplear los 150 layouts reservados y las metricas de apilado y levantamiento reportadas como referencia para comparar nuevos modelos.
- Docencia y divulgacion: ilustrar el flujo LeRobot de descarga, carga del adaptador y evaluacion con un ejemplo reproducible y de licencia permisiva.
- Desarrollo de herramientas de evaluacion: integrar el modelo en scripts de evaluacion propios (`sim/scripts/eval.py`) para medir robustez ante variaciones de semilla y horizonte de ejecucion.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Apilado correcto (150 layouts, 10 de 24 pasos por chunk) | 110,7 de 150 |
| Levantamiento correcto (150 layouts, 10 de 24 pasos por chunk) | 123,3 de 150 |
| Apilado ejecutando el chunk completo | 108,3 de 150 |

Los resultados se promedian sobre tres semillas adicionales. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo no es de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio ocupa 2,2 GB e incluye adaptador y procesadores, pero los pesos base deben descargarse aparte.
- GPU recomendadas: no disponibles; al tratarse de un VLA con backbone de vision-lenguaje, se requiere una GPU con memoria suficiente para el modelo base completo, cuyo tamano no se documenta.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: LeRobot (carga del adaptador sobre los pesos base) y el script de evaluacion `sim/scripts/eval.py` del repositorio `vla-test`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lawam_so101_block_stack_sim | no disponible | no disponible | Apilado de bloques con SO-101 en simulacion | MIT | Hugging Face |
| drwahl/pi05_so101_block_stack_sim | no disponible | no disponible | Misma tarea y protocolo de evaluacion | no disponible | Hugging Face |
| jialei02/lawam-pretrain-lerobot (base) | no disponible | no disponible | VLA preentrenado para LeRobot | no disponible | Hugging Face |

La comparativa se limita a los modelos referenciados en la informacion disponible; no se dispone de datos de rendimiento de las alternativas para contrastar.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea (apilar bloques de 30 mm con SO-101) y en simulacion; no se ha validado en hardware fisico segun la informacion disponible.
- No es un modelo de lenguaje: no debe esperarse generacion de texto, razonamiento general ni capacidades conversacionales.
- El rendimiento reportado (110,7 de 150 apilados) implica una tasa de fallo no despreciable; en produccion requeriria mecanismos de recuperacion o supervision.
- Los resultados dependen del horizonte de ejecucion: ejecutar el chunk completo reduce el apilado a 108,3 frente a 110,7 con 10 pasos.
- Sesgos conocidos: no documentados; al entrenarse en simulacion, puede presentar brecha de dominio (sim-to-real) no cuantificada.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero la politica puede generar acciones no validas ante observaciones fuera de distribucion.
- Licencia MIT: permite uso comercial, pero los pesos base `jialei02/lawam-pretrain-lerobot` tienen su propia licencia, que debe verificarse por separado.
- El adaptador requiere los procesadores incluidos para la normalizacion y el renombrado de camaras; un uso incorrecto invalida las predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drwahl/lawam_so101_block_stack_sim
- Modelo base: https://huggingface.co/jialei02/lawam-pretrain-lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/drwahl/so101_block_stack_sim
- Repositorio de codigo: https://github.com/danwahl/vla-test
- Modelo de referencia del protocolo: https://huggingface.co/drwahl/pi05_so101_block_stack_sim
- Proyecto SO-101: https://github.com/TheRobotStudio/SO-ARM100
