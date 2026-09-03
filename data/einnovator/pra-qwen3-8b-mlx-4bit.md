# EInnovator/pra-qwen3-8b-mlx-4bit

## Resumen

El repositorio `EInnovator/pra-qwen3-8b-mlx-4bit` no es un modelo de lenguaje completo, sino un **bundle de runtime para Progressive Retrieval Attention (PRA)** aplicado al modelo base `mlx-community/Qwen3-8B-4bit`. PRA es una técnica que separa el contexto lógico, la recuperación y la ejecución visible al modelo, permitiendo reducir drásticamente el número de tokens que el modelo debe procesar en cada paso de generación, manteniendo la calidad de las respuestas. Este bundle empaqueta el mapeo estructural específico del modelo, perfiles de runtime, componentes aprendidos opcionales (un router), metadatos de compatibilidad y evidencia de calificación medida. No contiene los pesos del modelo base.

El desarrollador es EInnovator, que publica varios bundles similares para distintos tamaños de Qwen3. La relevancia actual radica en que permite ejecutar Qwen3-8B con ventanas de contexto muy largas en hardware Apple Silicon (MLX) con un coste de memoria y latencia muy inferior al enfoque convencional, sin sacrificar precisión en tareas de pregunta-respuesta multi-hop. El bundle está pensado para desarrolladores que necesitan desplegar modelos de 8B en entornos con recursos limitados, especialmente en Macs con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (modelo base) + adaptador PRA estructural |
| Parametros totales | 8B (modelo base); el bundle no contiene pesos |
| Parametros activos | no disponible (el bundle es un adaptador, no un MoE) |
| Longitud de contexto | no disponible en el bundle; el modelo base Qwen3-8B soporta 40K tokens segun su documentacion |
| Tipos de cuantizacion | 4-bit (MLX) para el modelo base; el bundle es agnostico a cuantizacion |
| Idiomas soportados | no disponibles (depende del modelo base Qwen3) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX (safetensors) para el modelo base; el bundle contiene metadatos, perfiles y adaptadores |

## Arquitectura y entrenamiento

El bundle implementa **Progressive Retrieval Attention (PRA)**, un mecanismo que separa el contexto en dos planos: el contexto logico (la informacion relevante) y el contexto visible al modelo (los tokens que realmente se procesan). PRA utiliza un selector (router) que decide que tokens son necesarios para cada paso de generacion, reduciendo el numero de tokens visibles. En este bundle, el adaptador estructural es **training-free** (no requiere entrenamiento), pero incluye un componente aprendido opcional (el router) que se entrena con datasets como `2wikimultihopqa`, `hotpotqa`, `qasper` y `combined`. El modelo base es `mlx-community/Qwen3-8B-4bit`, una cuantizacion 4-bit de Qwen3-8B realizada con MLX. No se especifican datos sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF, etc.) en la informacion del bundle.

## Capacidades

- **Generacion de texto y razonamiento**: hereda las capacidades del modelo base Qwen3-8B, incluyendo instruccion, razonamiento logico, matematicas, ciencia y codigo.
- **Manejo eficiente de contexto largo**: PRA reduce los tokens visibles en un 89,1% en el workload combinado, manteniendo la calidad (token_f1 identico al baseline). Esto permite procesar documentos largos con menos memoria y menor latencia.
- **Soporte de tool calling y agentes**: el modelo base Qwen3-8B soporta tool calling y uso de agentes; el bundle no altera estas capacidades.
- **Capacidades multilingues**: dependen del modelo base; no se especifican en el bundle.
- **Modo de pensamiento (thinking)**: Qwen3-8B tiene modos thinking y non-thinking; el bundle no modifica esto.
- **Componente aprendido opcional**: el router entrenado mejora el rendimiento en QASPER, pero no es uniformemente positivo en HotpotQA, por lo que es opt-in.

## Casos de uso

- **Procesamiento de documentos legales extensos**: un sistema de analisis de contratos puede alimentar al modelo con documentos de miles de paginas. PRA reduce los tokens visibles, permitiendo que el modelo se centre en las clausulas relevantes sin agotar la ventana de contexto ni la memoria.
- **Atencion al cliente con historial largo**: en un chatbot de soporte, el historial de conversacion puede acumular muchos turnos. Con PRA, el modelo mantiene la calidad de las respuestas mientras reduce el coste de procesamiento del contexto acumulado.
- **RAG (Retrieval-Augmented Generation) sobre bases de conocimiento grandes**: al recuperar multiples fragmentos de documentos, PRA filtra los tokens irrelevantes, mejorando la precision de las respuestas y reduciendo la latencia en entornos de produccion.
- **Analisis de codigo en repositorios grandes**: para tareas de revision de codigo o generacion de documentacion, el modelo puede procesar archivos completos con PRA, manteniendo el contexto relevante sin exceder los limites de memoria.
- **Investigacion academica**: en tareas como QASPER (preguntas sobre papers cientificos), el router aprendido mejora el rendimiento, permitiendo extraer respuestas de articulos largos con menos recursos.
- **Despliegue en Macs con memoria unificada**: el bundle esta calificado para Apple M4 Pro con 48 GB, pero tambien puede ejecutarse en Macs con 16 GB o 32 GB gracias a la reduccion de tokens visibles, habilitando inferencia local de Qwen3-8B en equipos de consumo.

## Benchmarks y rendimiento

La model card proporciona resultados de calificacion medidos en un Apple M4 Pro (Mac16,7, 48 GB). Se comparan dos modos: **Selected Context** (contexto seleccionado) y **Native Memory** (memoria nativa). Los valores de token_f1 son identicos entre ambos modos, lo que demuestra paridad exacta.

| Workload | Modo | token_f1 | Tokens visibles | TTFT p50 | Completion media |
|---|---|---|---|---|---|
| 2wikimultihopqa (n=5) | Selected Context | 0,3578 | 351,2 | 114,2 ms | 271,9 ms |
| 2wikimultihopqa (n=5) | Native Memory | 0,3578 | 31,6 | 113,8 ms | 278,3 ms |
| hotpotqa (n=5) | Selected Context | 0,3016 | 262 | 180,3 ms | 311,6 ms |
| hotpotqa (n=5) | Native Memory | 0,3016 | 43,4 | 179 ms | 325 ms |
| qasper (n=5) | Selected Context | 0,05 | 333,4 | 114,1 ms | 244,4 ms |
| qasper (n=5) | Native Memory | 0,05 | 27,8 | 112,6 ms | 249 ms |
| combined (n=15) | Selected Context | 0,2365 | 315,5 | 115,8 ms | 275,9 ms |
| combined (n=15) | Native Memory | 0,2365 | 34,27 | 115,1 ms | 284,1 ms |

En el workload combinado, PRA reduce los tokens visibles en un 89,1% respecto al baseline, con una variacion de TTFT de -0,6% y una mejora del +3,0% en la finalizacion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo base en 4-bit MLX ocupa aproximadamente 4,6 GB (segun LLM Explorer para Qwen3-8B-4bit-DWQ). Con PRA, la memoria efectiva para contexto se reduce significativamente, permitiendo ejecutar el modelo en Macs con 16 GB de memoria unificada o mas.
- **GPU recomendadas**: el bundle esta calificado para Apple Silicon (MLX). Se ha probado en Apple M4 Pro con 48 GB. Tambien puede ejecutarse en GPUs NVIDIA via el backend `hf` (Selected Context), aunque no se ha medido el rendimiento nativo.
- **Compatibilidad con GPU de consumo**: si, en Macs con 16 GB o mas. En GPUs NVIDIA, se requiere al menos 8 GB de VRAM para el modelo 4-bit, pero la reduccion de contexto de PRA puede permitir trabajar con ventanas largas en GPUs de 8-12 GB.
- **Opciones de despliegue**: el bundle se integra con la libreria `pra` (pip install `pra-hf[hf-hub,hf-runtime]`). Comandos disponibles: `pra inspect`, `pra evaluate`, `pra recommend`, `pra serve`. Tambien es compatible con MLX y Hugging Face Transformers (modo Selected Context).
- **Latencia y throughput**: en el Apple M4 Pro, el TTFT p50 ronda los 114-180 ms y la finalizacion media entre 244 y 325 ms para los workloads evaluados. Estos valores son orientativos y dependen del hardware y la carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| EInnovator/pra-qwen3-8b-mlx-4bit (este bundle) | 8B (base) | no disponible (base 40K) | 4-bit MLX | apache-2.0 | Bundle PRA, reduce tokens visibles ~89% |
| EInnovator/pra-qwen3-4b-mlx-4bit | 4B (base) | no disponible | 4-bit MLX | apache-2.0 | Bundle PRA para Qwen3-4B, mismo enfoque |
| mlx-community/Qwen3-8B-4bit (sin PRA) | 8B | 40K | 4-bit MLX | apache-2.0 | Modelo base, sin reduccion de contexto |
| Qwen3-8B (original) | 8B | 40K | bf16/fp16 | apache-2.0 | Modelo completo, requiere mas VRAM |

La comparativa se basa en informacion publica; no se dispone de benchmarks comparativos directos entre estos modelos en las mismas tareas.

## Limitaciones y advertencias

- **El router aprendido no es uniformemente positivo**: mejora QASPER pero no HotpotQA; por defecto no se activa (es opt-in).
- **Evidencia limitada**: la calificacion se basa en solo 5 ejemplos por dataset (n=5) y 15 en el workload combinado. No es una validacion de produccion.
- **Calificacion especifica del artefacto**: la identidad de calificacion es el modelo exacto `mlx-community/Qwen3-8B-4bit` en su revision `545dc4251c05440727734bcd94334791f6ab0192`. No se transfiere automaticamente a otros formatos (full-precision, otras cuantizaciones).
- **Perfiles no promocionados**: los perfiles QUALITY y ECONOMY estan pendientes de calibracion y no se recomiendan; solo BALANCED esta cualificado.
- **Riesgo de alucinacion**: inherente al modelo base Qwen3-8B; PRA no lo mitiga.
- **Licencias**: la licencia apache-2.0 se aplica al bundle, pero las licencias del modelo base y de los datasets de entrenamiento del router se aplican por separado.
- **Soporte de produccion**: las mediciones son de calificacion, no garantias de rendimiento. Se recomienda ejecutar `pra evaluate` en el hardware y carga de trabajo propios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EInnovator/pra-qwen3-8b-mlx-4bit
- Perfil del autor: https://huggingface.co/EInnovator
- Bundle similar para Qwen3-4B: https://huggingface.co/EInnovator/pra-qwen3-4b-mlx-4bit
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Informacion del modelo base en LLM Explorer: https://llm-explorer.com/model/mlx-community%2FQwen3-8B-4bit-DWQ,pQB4sS85pMh8MkC8iBoBt
