# REAL-LAB-NU/MedicalRSI-MedAgentBench-Qwen3.5-9B

## Resumen

MedicalRSI · MedAgentBench · Qwen3.5-9B es un adaptador LoRA (PEFT) publicado por REAL-LAB-NU que convierte el modelo base Qwen/Qwen3.5-9B en un agente clinico capaz de resolver tareas sobre MedAgentBench, un benchmark de agentes medicos que opera contra un servidor FHIR. El adaptador desempena dos roles simultaneos: Solver (ejecuta la tarea siguiendo una skill almacenada) e Improver (genera nuevos harnesses de actuacion cuando se enfrenta a un flujo de trabajo no visto). Acompana al adaptador una memoria de flujos de trabajo que cubre 21 workflows de entrenamiento.

El modelo es la materializacion del paper *MedicalRSI: Medical Recursive Self-Improving Agents via Clinical Model-Harness Co-Evolution* (Wang, Palangi, Zhao y Ding, 2026), que propone un bucle de co-evolucion entre el modelo clinico y su harness de herramientas tras diez rondas de auto-mejora recursiva. La relevancia actual reside en que demuestra que un adaptador de bajo rango sobre un modelo de 9B puede alcanzar un 85,1 % de tareas resueltas en el conjunto completo del benchmark, con un 89,5 % en flujos vistos y un 66,1 % en flujos no vistos.

El repositorio pesa 0,7 GB y contiene unicamente el adaptador y los ficheros de memoria, no los pesos completos del modelo base. La licencia es MIT, lo que facilita su reutilizacion comercial, aunque el modelo base Qwen3.5-9B tiene sus propias condiciones que deben respetarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-9B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.5-9B mediante PEFT/LoRA y se entrena con el procedimiento MedicalRSI, un bucle de co-evolucion modelo-harness en el que el mismo adaptador actua como Solver y como Improver. En cada ronda, el Solver intenta resolver tareas de MedAgentBench contra un servidor FHIR y el Improver sintetiza hasta 16 harnesses candidatos a partir de los intentos del Solver y de la memoria de los tres workflows mas similares. Tras diez rondas de este proceso se consolidan las skills almacenadas en `memory/`, una por cada uno de los 21 workflows de entrenamiento.

La innovacion tecnica principal es la auto-mejora recursiva aplicada al harness de herramientas (no solo a los pesos): el modelo aprende a reescribir su propio procedimiento de actuacion clinica. El repositorio incluye `memory.json` y un fichero por workflow, de modo que en inferencia el Solver sigue la skill memorizada para flujos conocidos y delega en el Improver para flujos desconocidos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Resolucion de tareas de agente clinico sobre MedAgentBench contra un servidor FHIR.
- Doble rol Solver/Improver dentro del mismo adaptador LoRA.
- Recuperacion y aplicacion de skills memorizadas por workflow (21 workflows en memoria).
- Generacion de harnesses candidatos (hasta 16) para flujos de trabajo no vistos.
- Razonamiento multi-paso con uso de herramientas contra APIs FHIR.
- Auto-mejora recursiva mediante co-evolucion modelo-harness.
- No se documentan capacidades de vision, audio, tool calling generico ni modo thinking en la informacion disponible.

## Casos de uso

- Evaluacion de agentes clinicos: ejecutar el adaptador contra el servidor FHIR de MedAgentBench con el comando `python -m medicalrsi evaluate` para reproducir los resultados del paper (85,1 % global).
- Investigacion en auto-mejora recursiva: usar el par Solver/Improver como banco de pruebas para estudiar co-evolucion modelo-harness en dominios regulados.
- Prototipado de asistentes FHIR: integrar el adaptador en un pipeline que consulte recursos FHIR (pacientes, observaciones, medicaciones) para tareas acotadas de recuperacion y sintesis.
- Generalizacion a flujos no vistos: desplegar el Improver para generar harnesses sobre workflows nuevos y medir la caida de rendimiento (66,1 % en no vistos frente a 89,5 % en vistos).
- Baseline para comparativas de agentes medicos: emplear los resultados publicados como referencia al evaluar otros adaptadores o modelos sobre MedAgentBench.
- Reproducibilidad academica: descargar adaptador y memoria para replicar el paper con la configuracion `configs/medagentbench_qwen3.5-9b.yaml`.

## Benchmarks y rendimiento

| Metrica | Flujos vistos | Flujos no vistos | Todos |
|---|---|---|---|
| Tareas resueltas (%) | 89,5 | 66,1 | 85,1 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numericas con modelos alternativos.

## Requisitos de hardware

- El repositorio solo contiene el adaptador (0,7 GB); para inferencia se requiere ademas el modelo base Qwen3.5-9B.
- VRAM estimada para el modelo base en FP16: aproximadamente 18 GB; en cuantizacion de 8 bits, en torno a 9-10 GB; en 4 bits, alrededor de 5-6 GB (estimaciones orientativas, no confirmadas en la informacion disponible).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) suficiente para FP16 del base de 9B.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en FP16 y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: el flujo documentado usa el paquete `medicalrsi` con `python -m medicalrsi evaluate`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en MedAgentBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedicalRSI-MedAgentBench-Qwen3.5-9B | 9B (base) + LoRA | no disponible | 85,1 % (todos) | MIT | Hugging Face (adaptador) |
| Qwen3.5-9B base | 9B | no disponible | no disponible | condiciones de Qwen | Hugging Face |
| Otros adaptadores MedAgentBench | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de modelos comparables sobre MedAgentBench para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El adaptador esta especializado en MedAgentBench y en los 21 workflows de memoria; su rendimiento cae del 89,5 % al 66,1 % en flujos no vistos.
- Requiere un servidor FHIR de MedAgentBench en ejecucion; no es un modelo de proposito general desplegable de forma autonoma.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni evaluaciones de seguridad clinica en la informacion disponible.
- Uso clinico real: se trata de un artefacto de investigacion; no hay evidencia de validacion regulatoria ni de uso en produccion sanitaria.
- La licencia MIT cubre el adaptador, pero el uso del modelo base Qwen3.5-9B queda sujeto a las condiciones de su autor.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue mas alla del modelo base.
- No se especifican requisitos de cuantizacion ni compatibilidad con runtimes de inferencia alternativos.

## Enlaces

- Hugging Face: https://huggingface.co/REAL-LAB-NU/MedicalRSI-MedAgentBench-Qwen3.5-9B
- Repositorio de codigo MedicalRSI: https://github.com/REAL-Lab-NU/MedicalRSI
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper (referencia en la model card): Wang, Palangi, Zhao y Ding, *MedicalRSI: Medical Recursive Self-Improving Agents via Clinical Model-Harness Co-Evolution*, arXiv preprint, 2026 (sin URL directa en la informacion disponible).
