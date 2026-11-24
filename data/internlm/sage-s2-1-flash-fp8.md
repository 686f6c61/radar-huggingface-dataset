# internlm/Sage-S2.1-Flash-FP8

## Resumen

Sage S2.1 Flash es un modelo multimodal cientifico desarrollado por Shanghai Artificial Intelligence Laboratory (InternLM) y publicado en Hugging Face bajo el identificador `internlm/Sage-S2.1-Flash-FP8`. Esta ficha corresponde concretamente a la variante cuantizada en FP8 del modelo, que ocupa 328,5 GB en el repositorio y cuenta con 321.323.031.390 parametros segun los pesos en safetensors. El modelo esta disenado para tareas de investigacion que requieren multiples rondas de analisis y verificacion, combinando comprension de datos cientificos con recuperacion de informacion, programacion y uso de herramientas.

La propuesta diferencial del modelo es su arquitectura de representacion unificada, heredada de Sage SciPerception, que permite procesar mas de diez tipos de entrada cientifica (grafos moleculares, estructuras cristalinas, secuencias de proteinas y estructuras 3D, entre otras) proyectandolas a un espacio de representacion compartido para razonar junto con instrucciones en lenguaje natural. Esto lo posiciona para tareas de prediccion, clasificacion, localizacion de sitios, analisis cuantitativo e inferencia estructural.

El modelo resulta relevante porque combina capacidades de agente cientifico (uso de software especializado, verificacion de resultados contra salidas intermedias y feedback visual, ajuste de pasos posteriores) con un rendimiento competitivo en benchmarks de ingenieria de ML, procesamiento documental profesional y uso de herramientas. Segun la model card, quedo primero en cuatro benchmarks y segundo en siete de un total de quince, compitiendo con modelos como GLM-5.3-Flash, DeepSeek-V4.1-Flash-1017, Qwen3.8-Max, GPT-5.6 Sol y Claude Opus 5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de pesos: `glm5_next`) |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (variante publicada); existe version no cuantizada en `internlm/Sage-S2.1-Flash` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe una arquitectura de representacion unificada basada en Sage SciPerception: las caracteristicas de cada tipo de entrada cientifica se codifican y proyectan a un espacio de representacion compartido, donde se razonan junto con las instrucciones en lenguaje natural. El modelo soporta mas de diez tipos de entrada cientifica, incluyendo grafos moleculares, estructuras cristalinas, secuencias de proteinas y estructuras 3D. Esta variante concreta se distribuye en formato FP8, lo que reduce el peso del repositorio respecto a los pesos completos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se detallan innovaciones de inferencia como decodificacion especulativa o atencion lineal. El tag `glm5_next` en los pesos sugiere una base arquitectonica relacionada con la familia GLM, pero la model card no lo confirma explicitamente.

## Capacidades

- Comprension de datos cientificos multimodales: mas de diez tipos de entrada, incluyendo grafos moleculares, estructuras cristalinas, secuencias de proteinas y estructuras 3D.
- Tareas cientificas especializadas: prediccion, clasificacion, localizacion de sitios, analisis cuantitativo e inferencia estructural.
- Razonamiento multi-ronda con verificacion: el modelo puede ejecutar analisis, comprobar resultados contra salidas intermedias y feedback visual, y ajustar los pasos siguientes.
- Uso de herramientas y software especializado para llevar a cabo analisis cientificos.
- Recuperacion de informacion y programacion integradas en el flujo de investigacion.
- Capacidades de agente: segun la model card, rinde en benchmarks de ejecucion de investigacion y uso de herramientas (AutomationBench, ALE-CLI, BFCL V4, WebArena-Verified, DeepResearch Bench II, JobBench, OSWorld-Verified).
- Ingenieria de ML: primer puesto en MLE-bench Lite con 90,3.
- Procesamiento documental profesional: primer puesto en OfficeQA Pro (72,2), Harvey LAB (25,0) y SpreadsheetBench 2 (37,1).
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion cientifica asistida: el modelo puede recibir una secuencia de proteinas o una estructura cristalina y ejecutar un pipeline de prediccion, clasificacion o inferencia estructural, verificando resultados intermedios contra el feedback visual antes de continuar. Es adecuado por su representacion unificada de entradas cientificas.
- Ingenieria de ML automatizada: con un 90,3 en MLE-bench Lite, puede emplearse para generar y evaluar pipelines de entrenamiento, ajustar hiperparametros y comparar resultados de forma iterativa dentro de un entorno de agente.
- Analisis de hojas de calculo y documentos de oficina: su primer puesto en SpreadsheetBench 2 (37,1) y OfficeQA Pro (72,2) lo hace util para extraer, transformar y validar datos en flujos de trabajo profesionales con documentos estructurados.
- Automatizacion de tareas de investigacion con herramientas: mediante tool calling y ejecucion multi-paso, puede orquestar busquedas, llamadas a APIs y ejecucion de comandos en terminal (Terminal-Bench 2.1: 87,9) para tareas de research execution.
- Agentes de navegacion y operacion de escritorio: sus resultados en WebArena-Verified y OSWorld-Verified lo habilitan para automatizar interacciones web y tareas de sistema operativo en entornos controlados.
- Analisis legal y financiero asistido: el 25,0 en Harvey LAB sugiere utilidad en tareas de revision documental compleja del ambito legal, con verificacion de pasos intermedios.
- Desarrollo de software en produccion: con 60,6 en SWE-bench Pro y 67,9 en DeepSWE, puede integrarse en pipelines de CI/CD para resolucion de issues, refactorizacion y generacion de tests, apoyandose en tool calling.

## Benchmarks y rendimiento

Resultados publicados en la model card (15 benchmarks, comparativa con cinco modelos):

| Categoria | Benchmark | Sage S2.1 Flash | GLM-5.3-Flash | DeepSeek-V4.1-Flash-1017 | Qwen3.8-Max | GPT-5.6 Sol | Claude Opus 5 |
|---|---|---|---|---|---|---|---|
| Agentic Coding | Terminal-Bench 2.1 | 87,9 | 84,3 | 87,6 | 89,6 | 86,2 | **90,2** |
| Agentic Coding | DeepSWE | 67,9 | 63,7 | **73,9** | 67,0 | 70,6 | 72,6 |
| Agentic Coding | NL2Repo-Bench | 57,2 | 53,0 | 62,7 | 63,2 | 60,7 | **79,9** |
| Agentic Coding | SWE-bench Pro | 60,6 | 60,3 | 61,8 | 65,3 | 59,8 | **76,5** |
| Productivity | SpreadsheetBench 2 | **37,1** | 32,4 | 35,8 | 34,9 | 32,7 | 33,6 |
| Productivity | ALE-CLI | 32,4 | 28,1 | **35,4** | 24,8 | 28,6 | 29,5 |
| Productivity | APEX-Agents | 61,7 | 50,8 | **69,2** | 66,3 | 55,4 | 61,3 |
| Productivity | GDPval | 78,0 | 67,7 | 77,6 | 79,6 | 69,6 | **80,0** |
| Productivity | Workspace-Bench-Lite | 67,1 | 65,1 | 66,8 | 67,4 | 57,4 | **68,1** |
| Productivity | Workspace-Bench | 61,7 | 59,7 | 63,0 | **63,9** | 50,9 | 62,0 |
| Tool Use | OfficeQA Pro | **72,2** | 64,7 | 69,7 | 66,2 | 66,4 | 67,2 |
| Tool Use | Harvey LAB | **25,0** | 20,0 | 11,7 | 24,2 | 5,0 | 22,7 |
| Tool Use | AutomationBench | 56,7 | 48,3 | **57,8** | 49,7 | 45,7 | 49,4 |
| Tool Use | BFCL V4 | 75,5 | 71,7 | 71,4 | 66,8 | 68,8 | **80,6** |
| Tool Use | JobBench | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: los resultados de JobBench no aparecen completos en la informacion proporcionada. Segun la model card, Sage S2.1 Flash quedo primero en cuatro benchmarks (MLE-bench Lite: 90,3; OfficeQA Pro: 72,2; Harvey LAB: 25,0; SpreadsheetBench 2: 37,1) y segundo en siete (AutomationBench, ALE-CLI, BFCL V4, WebArena-Verified, DeepResearch Bench II, JobBench, OSWorld-Verified). Los valores de MLE-bench Lite, WebArena-Verified, DeepResearch Bench II y OSWorld-Verified no se detallan en la tabla disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: con 321.323.031.390 parametros, los pesos en FP8 ocupan aproximadamente 321 GB, por lo que se requiere un nodo multi-GPU. No cabe en una GPU de consumo.
- GPU recomendadas: no disponible en la informacion proporcionada; por el volumen de pesos, se necesitan configuraciones multi-GPU de clase datacenter (A100 80 GB, H100 80 GB o superiores). El numero exacto de GPUs no esta especificado.
- GPU de consumo: no es viable en RTX 4090 ni en ninguna GPU consumer individual.
- Opciones de despliegue: no disponible en la informacion proporcionada (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| Sage S2.1 Flash (FP8) | 321,3 B | no disponible | no disponible | Hugging Face, ModelScope | MLE-bench Lite 90,3; OfficeQA Pro 72,2; Harvey LAB 25,0; SpreadsheetBench 2 37,1 |
| GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible | Segundo/tercer puesto en la mayoria de benchmarks; Terminal-Bench 2.1 84,3 |
| DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | no disponible | DeepSWE 73,9; APEX-Agents 69,2; ALE-CLI 35,4 |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | Terminal-Bench 2.1 89,6; SWE-bench Pro 65,3; Workspace-Bench 63,9 |
| Claude Opus 5 | no disponible | no disponible | no disponible | no disponible | Primer puesto en la mayoria de benchmarks de coding y agentes; NL2Repo-Bench 79,9 |

Los datos de parametros, contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la seccion de licencia del repositorio antes de desplegarlo en produccion.
- Idiomas soportados no disponibles: no hay informacion sobre cobertura multilingue ni sobre el rendimiento en castellano.
- Longitud de contexto no disponible: no se puede planificar el uso en escenarios de contexto largo sin este dato.
- Riesgo de alucinacion: no se han publicado evaluaciones de fiabilidad ni tasas de alucinacion; en tareas cientificas con verificacion multi-ronda, los resultados intermedios deben auditarse.
- Sesgos conocidos: no disponible.
- Requisitos de hardware muy elevados (aproximadamente 321 GB solo en pesos FP8), lo que limita el despliegue a infraestructura multi-GPU de datacenter.
- El rendimiento en benchmarks de coding agentico es competitivo pero por debajo de Claude Opus 5 en NL2Repo-Bench (57,2 frente a 79,9) y SWE-bench Pro (60,6 frente a 76,5).
- No se detallan los datos de entrenamiento ni las fases de alineamiento, lo que dificulta evaluar riesgos de sesgo y comportamiento en produccion.

## Enlaces

- Repositorio Hugging Face (FP8): https://huggingface.co/internlm/Sage-S2.1-Flash-FP8
- Repositorio Hugging Face (pesos completos): https://huggingface.co/internlm/Sage-S2.1-Flash
- Modelo relacionado Sage SciPerception: https://huggingface.co/internlm/Sage-SciPerception
- Sitio web oficial: https://internlm.github.io/Sage-S2.1-Flash/
- ModelScope (FP8): https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Sage-S2.1-Flash-FP8
- ModelScope (pesos completos): https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Sage-S2.1-Flash
- Paper referenciado: arXiv:2611.21072
