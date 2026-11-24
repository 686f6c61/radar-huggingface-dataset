# mertkayacs/Tholos-2B-GGUF

## Resumen

Tholos-2B-GGUF es la distribucion en formato GGUF de Tholos-2B, un modelo de lenguaje pequeno (2.516.756.480 parametros) desarrollado por Eschatia Labs, un laboratorio de investigacion independiente sin animo de lucro. El modelo esta disenado especificamente para agentes de IA locales que deben seleccionar herramientas (tool calling) sobre tablas, notas y tareas, con salida estructurada garantizada mediante JSON schema. Su proposito es ofrecer un agente funcional que quepa y funcione en hardware de consumo, sin depender de APIs en la nube.

La relevancia del modelo reside en su enfoque: en lugar de competir en conocimiento general, se especializa en un formato de tarea concreto (trece herramientas definidas por Tholos) y en la generacion de pasos estructurados validables. El autor reporta 137/160 escenarios superados en Tholos-Bench con cuantizacion Q4_K_M, frente a 112/160 de MiniCPM5-2B, si bien solo Tholos-2B fue ajustado para este formato de tarea.

La distribucion GGUF incluye plantilla y parametros que preservan el formato de prompt de entrenamiento, los tokens de parada y una ventana de contexto de 16.384 tokens. Esta publicada bajo licencia Apache-2.0 y esta pensada para ejecutarse con Ollama o llama.cpp en CPU o GPU modestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | Q4_K_M (1,56 GB), Q8_0 (2,68 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos completos en safetensors en el repo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna (tipo de transformer, atencion, etc.) en la documentacion proporcionada. El modelo base es mertkayacs/Tholos-2B, con 2.516.756.480 parametros y pesos completos publicados en safetensors. La version GGUF es una cuantizacion de ese modelo base.

El entrenamiento se realizo sobre el dataset mertkayacs/tholos-trajectories, compuesto por trayectorias de agente orientadas a la seleccion de herramientas y la generacion de pasos estructurados. El modelo aprendio las trece herramientas definidas por el proyecto Tholos; el autor advierte que otros formatos de herramientas no han sido medidos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es la especializacion en salida estructurada validable mediante JSON schema, con soporte de plantilla y tokens de parada preservados en el GGUF.

## Capacidades

- Generacion de texto orientada a agentes, con enfasis en la seleccion de herramientas y la planificacion de pasos.
- Tool calling / function calling sobre un conjunto definido de trece herramientas del ecosistema Tholos.
- Salida estructurada mediante JSON schema decoding (llama.cpp) y modo JSON (Ollama).
- Razonamiento multi-paso dentro de un bucle de agente con validacion de cada paso.
- Capacidad de operar en local y en dispositivo (on-device), sin conexion a servicios externos.
- Soporte de modo `reasoning_effort: "none"` para clientes directos de Ollama.
- Capacidades multilingues: solo ingles.
- No se documentan capacidades de vision, audio ni modo thinking extendido.

## Casos de uso

- Agentes locales de gestion de tareas: el modelo selecciona entre sus trece herramientas para crear, actualizar o consultar tareas y notas, con salida JSON validable antes de ejecutar acciones.
- Automatizacion de escritorio con aprobacion humana: desplegado via Ollama en un equipo personal, propone pasos estructurados que la aplicacion valida y presenta al usuario antes de aplicar cambios.
- Asistente de notas y tablas: interpreta peticiones en lenguaje natural y genera llamadas a herramientas para manipular filas, columnas o entradas de una tabla, aprovechando el contexto de 16.384 tokens para mantener el estado de la conversacion.
- Pipelines de agente en CI o entornos de desarrollo: integrado con llama.cpp y JSON schema para generar llamadas de herramienta deterministas que se validan en cada paso antes de ejecutarse.
- Prototipado de sistemas de function calling: sirve como modelo de referencia pequeno para probar bucles de agente, reglas de aprobacion y validacion de esquemas sin coste de API.
- Despliegue en hardware de consumo o en CPU: con Q4_K_M (1,56 GB) puede ejecutarse en portatiles y equipos sin GPU dedicada, lo que permite agentes de escritorio siempre disponibles y con datos que no salen del dispositivo.
- Evaluacion comparativa de agentes: util como linea base reproducible en Tholos-Bench para medir la calidad de seleccion de herramientas en formatos estructurados.

## Benchmarks y rendimiento

Los resultados publicados se refieren a Tholos-Bench, con Q4_K_M y comparacion frente a MiniCPM5-2B. El autor advierte que las cifras deben compararse dentro de una misma configuracion.

| Configuracion | Tholos-2B | MiniCPM5-2B |
|---|---|---|
| Tholos-Bench, Q4_K_M, llama.cpp JSON schema, Kaggle T4 | 137/160 | 112/160 |
| Tholos-Bench, Q4_K_M, CPU, llama.cpp JSON schema | 134/160 | 117/160 |
| Tholos-Bench, Q4_K_M, CPU, Ollama JSON mode | 136/160 | 96/160 |
| Escenarios de inyeccion superados (Kaggle T4) | 10/12 | 8/12 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M ocupa 1,56 GB en disco y Q8_0 2,68 GB; el autor advierte que el tamano de fichero no equivale a la RAM total en ejecucion.
- GPU recomendadas: el benchmark se ejecuto en una Kaggle T4; el modelo es lo bastante pequeno para GPUs de gama media y consumer.
- Cabe en GPU de consumo: si, con Q4_K_M en tarjetas con 4 GB o mas de VRAM; tambien funciona en CPU.
- Opciones de despliegue: Ollama (`ollama pull hf.co/mertkayacs/Tholos-2B-GGUF:Q4_K_M` o `ollama pull mertkayacs/tholos-2b`) y llama.cpp (`llama-server -hf mertkayacs/Tholos-2B-GGUF:Q4_K_M --jinja -c 16384`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tholos-Bench (Q4_K_M, llama.cpp, T4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tholos-2B-GGUF | 2.516.756.480 | 16.384 | 137/160 | Apache-2.0 | Hugging Face, Ollama, Kaggle |
| MiniCPM5-2B | no disponible | no disponible | 112/160 | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La comparacion con MiniCPM5-2B debe interpretarse con cautela: solo Tholos-2B fue ajustado para el formato de tarea de Tholos-Bench.

## Limitaciones y advertencias

- Solo soporta ingles; no se han medido capacidades en otros idiomas.
- El modelo aprendio exclusivamente las trece herramientas de Tholos; otros formatos de herramientas no han sido evaluados.
- Riesgo de alucinacion y de llamadas incorrectas: el autor recomienda validar cada llamada y tratar el texto externo como no fiable.
- Mantener las aprobaciones activadas para acciones con consecuencias; no se debe confiar en la ejecucion automatica sin validacion.
- El benchmark de inyeccion muestra 10/12 escenarios superados, lo que implica que dos escenarios de prompt injection no fueron resistidos.
- El informe tecnico esta pendiente de revision por pares.
- El modelo es muy pequeno (2,5 B de parametros) y especializado; no es adecuado como modelo de conocimiento general.
- No se documentan sesgos especificos ni limitaciones de contexto mas alla de los 16.384 tokens.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mertkayacs/Tholos-2B-GGUF
- Pesos completos: https://huggingface.co/mertkayacs/Tholos-2B
- Dataset de trayectorias: https://huggingface.co/datasets/mertkayacs/tholos-trajectories
- Benchmark: https://huggingface.co/datasets/mertkayacs/tholos-bench
- Pagina del benchmark: https://eschatialabs.com/benchmarks/tholos-bench/
- Repositorio GitHub: https://github.com/mertkayacs/tholos
- Sitio del proyecto: https://tholos.mertkayacs.com
- Ollama library: https://ollama.com/mertkayacs/tholos-2b
- Kaggle: https://www.kaggle.com/models/mertilovski/tholos-2b
- Informe tecnico: https://eschatialabs.com/research/tholos-2b-report/
- Eschatia Labs: https://eschatialabs.com
- Autor: https://mertkayacs.com
