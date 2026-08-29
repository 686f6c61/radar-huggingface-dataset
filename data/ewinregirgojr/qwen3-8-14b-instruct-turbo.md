# ewinregirgojr/Qwen3.8-14B-Instruct-Turbo

## Resumen

Qwen3.8-14B-Instruct-Turbo es un modelo de lenguaje de 14.200 millones de parámetros (según la model card; los pesos safetensors suman 15.180.130.288 parámetros) derivado de Qwen3.8-27B mediante poda de macro-bloques y destilación de conocimiento. Lo desarrolla el usuario independiente ewinregirgojr, no es un modelo oficial de Qwen. El objetivo es reducir la latencia y aumentar el throughput de tokens manteniendo capacidades de razonamiento, tool-calling y generación de código.

La arquitectura es híbrida: combina atención lineal recurrente DeltaNet con atención multi-cabeza estándar. Se conservan 32 de las 64 capas originales (las 16 primeras y las 16 últimas), y se aplican 200 pasos de destilación LoRA sobre un currículo sintético de razonamiento y llamadas a herramientas. El contexto nativo es de 32.768 tokens, extensible a 131.072 con YaRN/RoPE. Está disponible en formato safetensors (FP16) y en cuantizaciones GGUF para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid DeltaNet (linear attention recurrente) + Multi-Head Self-Attention |
| Parametros totales | 15.180.130.288 (safetensors); la model card declara 14.2B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN/RoPE |
| Tipos de cuantizacion | FP16 (safetensors), GGUF Q4_K_M, Q5_K_M, Q8_0, 4-bit NF4 via bitsandbytes |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, que tiene 64 capas. Se aplica una poda topologica que retiene 32 capas organizadas en 8 macro-bloques: las capas 0 a 15 (macro-bloques 0-3) para representacion perceptual y extraccion lexica, y las capas 48 a 63 (macro-bloques 12-15) para convergencia semantica, seguimiento de instrucciones, ejecucion de herramientas y razonamiento matematico. Las capas intermedias se eliminan, manteniendo un flujo residual continuo entre los dos bloques conservados.

La atencion es hibrida: capas con DeltaNet (actualizacion de estado recurrente con complejidad O(1) por token) combinadas con atencion multi-cabeza estandar. Tras la poda, se realiza una destilacion de conocimiento con un adaptador LoRA de rango 32 y alpha 64 (escalado 2.0) durante 200 pasos de optimizacion. El dataset de destilacion incluye conversaciones multi-turno con llamadas a herramientas, algoritmos de consenso distribuido, implementaciones de cache en memoria, probabilidad bayesiana y correccion de bugs en produccion. La perdida de destilacion paso de 4.7109 a 0.8207, una reduccion del 82.58%.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Razonamiento logico y matematico de alto nivel, incluyendo problemas cientificos (GPQA Diamond 88.6).
- Generacion de codigo en multiples lenguajes, con soporte para tareas de repositorio completo (NL2Repo-Bench 41.7).
- Tool calling y function calling con salida JSON estructurada (BFCL WebAPI 87.2).
- Capacidades de agente multi-step: planificacion, ejecucion de herramientas y coordinacion (Toolathlon Verified 68.9, JobBench 38.2).
- Seguimiento de instrucciones complejas (IFBench 79.8).
- No se mencionan capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto largo (hasta 32K tokens nativos) y puede integrar herramientas externas para consultar bases de datos o sistemas de ticketing mediante tool calling.
- Generacion de codigo en produccion: con soporte de function calling y puntuaciones altas en HumanEval (84.2) y LiveCodeBench (88.4), puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar tests.
- Agentes autonomos de productividad: su capacidad en CoWorkBench (69.4) y JobBench (38.2) lo hace util para automatizar tareas ofimaticas, redaccion de informes y gestion de calendarios.
- Razonamiento cientifico y analitico: con GPQA Diamond de 88.6, puede asistir en investigacion, analisis de datos y resolucion de problemas matematicos avanzados.
- Asistente de programacion con contexto largo: la ventana de 32K tokens permite cargar archivos de codigo extensos o documentacion completa para generar soluciones coherentes.
- Despliegue en edge o hardware limitado: las cuantizaciones GGUF (Q4_K_M de 9.16 GB) permiten ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM, ideal para prototipos y aplicaciones locales.

## Benchmarks y rendimiento

La model card proporciona resultados comparativos con el modelo base Qwen3.8-27B y dos modelos de referencia (Qwen3.8-Flash-Next y Qwen3.7-Plus). Se evaluaron con los mismos protocolos que Qwen3.8-Flash-Next.

| Benchmark | Metrica | Qwen3.8-14B-Turbo | Qwen3.8-27B | Qwen3.8-Flash-Next | Qwen3.7-Plus |
|---|---|---|---|---|---|
| Parametros | Total | 14.2B | 27.0B | 125B (6B act.) | 397B (17B act.) |
| LiveCodeBench v6 | Pass@1 | 88.4 | 90.3 | 91.9 | 89.6 |
| HumanEval | 0-shot Pass@1 | 84.2 | 86.1 | 89.4 | 82.5 |
| SWE-bench Pro | Pass@1 | 56.8 | 61.7 | 62.5 | 55.8 |
| NL2Repo-Bench | Repo Generation | 41.7 | 42.3 | 48.1 | 41.1 |
| Toolathlon Verified | Pass@1 | 68.9 | 67.1 | 73.5 | 50.6 |
| BFCL WebAPI | Pass@1 | 87.2 | 86.8 | 91.2 | 82.4 |
| CoWorkBench | Office/Productivity | 69.4 | 70.7 | 73.9 | 65.1 |
| JobBench | Professional Tasks | 38.2 | 33.4 | 55.7 | 27.6 |
| IFBench | Instruction Following | 79.8 | 79.5 | 81.3 | 79.1 |
| GPQA Diamond | Scientific Reasoning | 88.6 | 89.2 | 91.7 | 90.3 |

El modelo supera a Qwen3.7-Plus en varios benchmarks de agente y codigo, y se acerca al modelo base de 27B con la mitad de parametros. No se han publicado resultados de benchmarks adicionales fuera de esta tabla.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - GGUF Q4_K_M (9.16 GB): 8-12 GB VRAM o 16 GB RAM.
  - GGUF Q5_K_M (10.60 GB): 12-16 GB VRAM o 24 GB RAM.
  - GGUF Q8_0 (14.58 GB): 16-24 GB VRAM o 32 GB RAM.
  - 4-bit NF4 via bitsandbytes: menos de 10 GB VRAM (segun la model card).
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100. En cuantizacion Q4_K_M cabe en GPUs de consumo como RTX 3060 12GB o RTX 4070.
- Opciones de despliegue: transformers + PEFT (para cargar el adaptador LoRA), vLLM, llama.cpp, Ollama (via GGUF), TGI.
- Latencia y throughput: no se proporcionan cifras exactas, pero la poda de capas y la atencion lineal DeltaNet reducen la latencia y aumentan el throughput respecto al modelo base de 27B, segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-14B-Instruct-Turbo | 14.2B (15.18B en safetensors) | 32K nativo, 131K con YaRN | Hybrid DeltaNet + MHSA | Apache-2.0 | HuggingFace (safetensors, GGUF) |
| Qwen3.8-27B | 27B | 32K nativo (estimado) | Hybrid DeltaNet | Apache-2.0 | HuggingFace (oficial) |
| Qwen3.8-Flash-Next | 125B (6B activos) | no disponible | Sparse Attention + MoE | Apache-2.0 | HuggingFace (oficial) |
| Qwen3.7-Plus | 397B (17B activos) | no disponible | MoE Hybrid | Propietaria (API) | API de Qwen |

El modelo Turbo ofrece un rendimiento cercano al de 27B con la mitad de parametros, y supera a Qwen3.7-Plus en tareas de agente y codigo, aunque con una licencia abierta. No se dispone de datos de Qwen3-14B original para comparar directamente.

## Limitaciones y advertencias

- Modelo no oficial: desarrollado por un usuario independiente (ewinregirgojr), no por el equipo de Qwen. No hay garantias de soporte, mantenimiento ni reproducibilidad completa del proceso de poda y destilacion.
- Idiomas limitados: solo ingles y chino. No soporta espanol ni otros idiomas de forma nativa.
- Perdida de capacidad por poda: aunque los benchmarks muestran resultados altos, la eliminacion de 32 capas intermedias puede degradar tareas que dependen de representaciones intermedias no conservadas.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo o con contexto largo.
- Contexto extendido: la extension a 131.072 tokens via YaRN/RoPE no esta validada en benchmarks publicos; puede degradar la calidad en contextos muy largos.
- Tamano del repositorio: 116.3 GB en safetensors, lo que incluye el adaptador LoRA y pesos FP16; requiere gestion cuidadosa del almacenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen3.8-27B (tambien Apache-2.0), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ewinregirgojr/Qwen3.8-14B-Instruct-Turbo
- Repositorio GGUF cuantizado: https://huggingface.co/ewinregirgojr/Qwen3.8-14B-Instruct-Turbo-GGUF
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio oficial de la serie Qwen3: https://github.com/QwenLM/Qwen3
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
