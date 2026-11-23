# sensenova/SenseNova-RoboRSI-27B

## Resumen

SenseNova-RoboRSI-27B es un modelo de lenguaje y vision (VLM) orientado a la manipulacion robotica, desarrollado por SenseNova (OpenSenseNova). Su funcion no es controlar directamente los actuadores, sino actuar como capa cognitiva: solicita movimiento a una politica vision-language-action (VLA), revisa una trayectoria propuesta o escribe codigo que calcula y ejecuta una pose objetivo del efector final (el paradigma que el autor denomina Code as Policy). Tras cada accion, el agente consume nuevas observaciones de camara y el estado del robot para decidir el siguiente paso.

El modelo parte de un checkpoint previo (SenseNova-RoboRSI-27B-Preview) y se entrena con un bucle de mejora auto-recursiva (Recursive Self-Improvement, RSI) en el que los fallos de interaccion guian la actualizacion del Harness, se recogen trayectorias del profesor y se afina el modelo de 27B sobre las trayectorias seleccionadas. El resultado reportado por el autor es un salto de 10,0 a 34,7 en la media de RoboDojo, ademas de ejecuciones en robots fisicos Piper y Piper X sin datos de robot real en el post-entrenamiento encarnado.

Con 27.356.728.560 parametros reales (safetensors), licencia Apache 2.0 y un repositorio de 54,8 GB, el modelo se posiciona como una pieza relevante para investigacion en IA encarnada y agentes roboticos, donde la mayoria de alternativas son propietarias o no liberan pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (tag `qwen3_5`; transformer multimodal) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo con el tag `qwen3_5` y la categoria vision-language-model, lo que apunta a una base transformer multimodal con torre de vision y encoder de lenguaje; el detalle exacto de capas, atencion y resolucion visual no se especifica en la model card. El modelo incorpora un componente denominado VLA2Agent, que suministra poses objetivo del efector final a partir de demostraciones de VLA abiertas, y un Harness de proposito general que orquesta las llamadas a la politica VLA y la generacion de codigo.

El entrenamiento se describe como un proceso de mejora auto-recursiva en tres rondas: las acciones fallidas o ineficientes guian la actualizacion del Harness, se recogen trayectorias del profesor con el Harness revisado y se afina el modelo de 27B sobre las trayectorias seleccionadas. El autor reporta que actualizar conjuntamente modelo y Harness supera a actualizar cualquiera de los dos por separado en las tres rondas. No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Razonamiento viso-espacial sobre escenas roboticas a partir de multiples vistas de camara.
- Solicitud de movimiento a una politica VLA externa y revision de trayectorias propuestas.
- Code as Policy: generacion de codigo que calcula y ejecuta poses objetivo del efector final.
- Planificacion multi-paso con realimentacion: tras cada accion consume nuevas observaciones y estado del robot.
- Prediccion de coordenadas del efector final (x, y, z) para una y dos manos.
- Coordinacion bimanual sin entrenamiento especifico de tarea (demostrado en resolucion de cubo 2x2).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio adicional: no disponible en la informacion proporcionada.

## Casos de uso

- Manipulacion pick-and-place en robots de bajo coste: el modelo genera codigo que calcula la pose objetivo y la ejecuta sobre plataformas Piper, con 6/10 exitos reportados en tareas de colocacion de objetos en un plato.
- Apilado de bloques con politica VLA mas Code as Policy: combinacion de solicitud de movimiento y correccion por codigo, con 9/10 exitos en Piper X.
- Correccion de errores de colocacion en simulacion: en el demo de apilado de cuencos, el agente mantiene el agarre y desplaza el objetivo 2 cm a la derecha mediante codigo antes de bajar el objeto.
- Coordinacion bimanual de tareas de precision: resolucion de un cubo 2x2 inspeccionando las seis caras con dos brazos, sin entrenamiento especifico de tarea.
- Investigacion en IA encarnada y RSI: uso del bucle de mejora auto-recursiva para estudiar como la actualizacion conjunta de modelo y Harness afecta al rendimiento en RoboDojo.
- Evaluacion de agentes roboticos en benchmark: integracion en RoboDojo con un Harness de proposito general para comparar modelos bajo condiciones controladas (seed 0, layout 0).
- Prototipado de politicas Code as Policy en pipelines de investigacion: generacion y ejecucion de codigo de control para tareas de insercion, alineacion y empuje lateral de objetos.

## Benchmarks y rendimiento

| Benchmark / metrica | Resultado |
|---|---|
| RoboDojo (media, 7 modelos evaluados con el mismo Harness) | 34,7 |
| RoboDojo, Preview (modelo base) | 10,0 |
| RoboDojo, GPT-6 Astra (leaderboard del equipo RoboDojo) | 27,6 |
| Precision efector final, sin VLA2Agent (dentro de 5 mm) | 4,3% |
| Precision efector final, con VLA2Agent (dentro de 5 mm) | 15,5% |
| Precision efector final, sin VLA2Agent (dentro de 20 mm) | 9,4% |
| Precision efector final, con VLA2Agent (dentro de 20 mm) | 29,7% |
| Precision efector final, sin VLA2Agent (dentro de 50 mm) | 24,9% |
| Precision efector final, con VLA2Agent (dentro de 50 mm) | 49,2% |
| Error mediano XYZ, sin VLA2Agent | 119,7 mm |
| Error mediano XYZ, con VLA2Agent | 51,6 mm |
| Piper, pick-and-place (Code as Policy solo) | 6/10 (60%) |
| Piper X, apilado de bloques (VLA x Code as Policy) | 9/10 (90%) |
| Piper, pick-and-place, Preview | 2/10 |
| Piper X, apilado de bloques, Preview | 3/10 |
| Piper, pick-and-place, Qwen3.8-27B | 0/10 |
| Piper X, apilado de bloques, Qwen3.8-27B | 0/10 |

La metrica de precision del efector final se calcula sobre 374 acciones locales de todas las tareas de RoboDojo (179 de un brazo y 195 de dos brazos); una prediccion bimanual cuenta como acierto solo si ambos brazos superan el umbral. El error mediano se calcula sobre predicciones con coordenadas parseables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 27.356.728.560 parametros y pesos safetensors, en BF16 se requieren aproximadamente 54,7 GB solo para pesos, mas memoria para vision, cache KV y overhead.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el modelo no cabe en GPUs de consumo de 24 GB en BF16 y requiere al menos una GPU de 80 GB (A100/H100) o configuraciones multi-GPU.
- Cabe en consumer GPU: no en BF16; se requeriria cuantizacion, cuyos formatos no se detallan en la informacion disponible.
- Opciones de despliegue: no disponible en la informacion proporcionada (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | RoboDojo (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-RoboRSI-27B | 27,36B | no disponible | 34,7 | Apache 2.0 | Pesos en Hugging Face |
| SenseNova-RoboRSI-27B-Preview | no disponible | no disponible | 10,0 | Apache 2.0 (presumible, mismo autor) | Pesos en Hugging Face |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | no disponible |
| GPT-6 Astra | no disponible | no disponible | 27,6 | Propietaria | Solo API / leaderboard |

La comparativa se limita a los datos publicados por el autor. No se dispone de resultados de MMLU, HumanEval ni GSM8K para este modelo, por lo que no se puede comparar en tareas de lenguaje general.

## Limitaciones y advertencias

- El modelo no controla actuadores directamente: depende de una politica VLA externa y de un Harness para ejecutar acciones.
- Los resultados en robots fisicos se obtuvieron sin datos de robot real en el post-entrenamiento encarnado; solo se adaptaron interfaces de camara, estado y control, lo que limita la generalizacion a otras plataformas no probadas.
- La precision del efector final es baja en terminos absolutos: solo el 15,5% de las predicciones quedan dentro de 5 mm y el error mediano es de 51,6 mm incluso con VLA2Agent.
- El rendimiento en RoboDojo se evalua en seed 0 y layout 0; no se reporta variabilidad entre seeds o layouts.
- No se detallan sesgos conocidos, riesgos de alucinacion ni limitaciones de contexto o idioma en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo esta disenado para investigacion en robotica; su uso en produccion requiere validacion especifica por plataforma.
- El repositorio tiene solo 4 descargas y 9 likes en el momento de la consulta, lo que indica una validacion externa muy limitada.
- No se especifican los tipos de cuantizacion soportados, lo que dificulta el despliegue en hardware de gama media.

## Enlaces

- Hugging Face: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B
- Model card en chino: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B/blob/main/README_zh.md
- GitHub: https://github.com/OpenSenseNova/SenseNova-RoboRSI/tree/main
- Leaderboard de RoboDojo: https://robodojo-benchmark.com/leaderboard#agent
- Modelo base: https://huggingface.co/sensenova/SenseNova-RoboRSI-27B-Preview
