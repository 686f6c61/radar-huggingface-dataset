# anshuljsh/K2-Horizon-7B-repo-experimental-GGUF

## Resumen

K2-Horizon-7B-repo-experimental es un ajuste fino experimental del modelo base IFM/K2-Horizon-7B, publicado por el usuario anshuljsh en Hugging Face. El modelo está orientado a tareas de localización de fallos en repositorios de código: identificar el fichero y el símbolo defectuosos dentro de un repositorio, así como tareas de reparación de repositorios a partir de extractos de código fuente.

El checkpoint se distribuye únicamente en formato GGUF con cuantización Q4_K_M, pensado para su uso con llama.cpp. El autor lo presenta explícitamente como un artefacto de investigación sobre localización en repositorios, no como un modelo de propósito general: en sus propias pruebas, la localización de fichero defectuoso mejora de forma notable mientras que el rendimiento en coding corto (HumanEval+, MBPP+) cae de manera significativa.

El modelo base tiene 8.999.178.240 parámetros (aproximadamente 9B, pese al "7B" del nombre) y licencia Apache 2.0. La relevancia de esta ficha radica en documentar con rigor un caso de ajuste fino con resultados mixtos y métricas publicadas con intervalos de confianza, algo poco habitual en checkpoints experimentales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención LoRA en el ajuste fino (arquitectura del base no detallada en la información disponible) |
| Parámetros totales | 8.999.178.240 (~9B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible como especificación del modelo; el ejemplo de despliegue usa `-c 16384` |
| Tipos de cuantización | Q4_K_M (única publicada en el repo) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el base se distribuye en safetensors |

## Arquitectura y entrenamiento

El ajuste fino se realizó mediante Attention LoRA sobre el modelo base IFM/K2-Horizon-7B (revisión `1ad5223c80f635ede5fb926f6304dc7228246a4b`, publicada por el Institute of Foundation Models). El entrenamiento se hizo sobre extractos compactos de código fuente previos al arreglo, ediciones estructuradas y objetivos de localización, controles ya reparados y tareas cortas de programación en Python. La ejecución final procesó 5,04 millones de tokens de entrada en 152 pasos de optimización, seleccionándose el adaptador del paso 142. El adaptador se fusionó con los pesos base en FP32, se convirtió a GGUF FP16 y se cuantizó a Q4_K_M.

Los datos de entrenamiento provienen de tres fuentes: las trayectorias OpenHands de Nebius SWE-rebench (ejemplos de issues y reparaciones adaptados de trayectorias exitosas, CC BY 4.0), el subconjunto cribado CoderForge-Preview de Together (trayectorias exitosas con etiquetas de licencia permisiva) y MBPP de Google Research (prompts adaptados del split de entrenamiento y filtrados para evitar solapamiento con EvalPlus, CC BY 4.0). No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés.
- Localización de fichero defectuoso (faulty-file localization) en repositorios de código.
- Localización de símbolo defectuoso (faulty-symbol localization) dentro de un fichero.
- Reparación de repositorios a partir de extractos de código y ediciones estructuradas.
- Generación de código Python corto (con rendimiento degradado respecto al base).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito en la información disponible.
- Capacidad multilingüe: solo inglés según la metadata del modelo.

## Casos de uso

- Investigación en localización de fallos: usar el modelo para identificar el fichero sospechoso de contener un bug dentro de un repositorio, aprovechando la mejora de +21,13 pp en faulty-file localization frente al base FP16.
- Priorización de triaje de incidencias: dado un issue y extractos de código, el modelo señala el símbolo probablemente defectuoso (+7,58 pp en faulty-symbol localization), lo que puede ayudar a reducir el espacio de búsqueda antes de la inspección manual.
- Experimentos académicos de ajuste fino: sirve como caso de estudio reproducible de un Attention LoRA con métricas pareadas e intervalos de confianza publicados.
- Evaluación de pipelines de reparación automática: el autor lo empleó con el verificador de SWE-bench Verified sobre siete repositorios, por lo que es adecuado para reproducir ese arnés de evaluación.
- Despliegue local con llama.cpp: al estar en GGUF Q4_K_M, puede ejecutarse en un servidor local con `llama-server` y contexto de 16.384 tokens, útil para prototipos sin infraestructura de GPU grande.
- Análisis de regresiones en modelos de código: permite medir el coste en coding corto de un ajuste orientado a localización (caída de −16,46 pp en HumanEval+), útil para calibrar compromisos entre tareas.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparando el base IFM en FP16 GGUF frente al checkpoint ajustado en Q4_K_M, con las mismas tareas y ajustes de decodificación:

| Métrica | Tareas pareadas | Base FP16 | Ajustado Q4_K_M | Cambio | Intervalo 95% pareado |
|---|---:|---:|---:|---:|---|
| Reparación de repositorio | 67 | 10,45% | 11,94% | +1,49 pp | −6,49 a +10,00 pp |
| Localización de fichero defectuoso | 71 | 39,44% | 60,56% | +21,13 pp | +12,50 a +37,50 pp |
| Localización de símbolo defectuoso | 66 | 30,30% | 37,88% | +7,58 pp | +1,25 a +15,56 pp |
| Snapshot reparado marcado correctamente como limpio | 18 | 5,56% | 11,11% | +5,56 pp | −15,38 a +19,05 pp |
| HumanEval+ pass@1 | 164 | 82,93% | 66,46% | −16,46 pp | −24,39 a −9,15 pp |
| MBPP+ pass@1 | 378 | 71,96% | 62,70% | −9,26 pp | −14,02 a −4,50 pp |

Las tareas de repositorio provienen de un subconjunto de SWE-bench Verified que abarca siete repositorios; la corrección de las reparaciones se calificó con el verificador de SWE-bench y se excluyeron cuatro pares por fallos de infraestructura. Los intervalos de repositorio se obtuvieron por bootstrap agrupado por repositorio. El coding corto se evaluó con EvalPlus v0.3.1.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 5,6 GB, por lo que la inferencia en Q4_K_M requiere aproximadamente 6-8 GB de VRAM considerando contexto y overhead de llama.cpp.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten holgura con contexto largo; A100/H100 solo serían necesarias para despliegues concurrentes o contexto muy extendido.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más de VRAM en Q4_K_M (por ejemplo RTX 3060 Ti/4060 Ti o superiores), aunque el contexto de 16.384 tokens consume memoria adicional.
- Opciones de despliegue: llama.cpp con soporte para K2 Horizon (el autor cita la revisión `4625240437c6821ee5c2da99e12d4817c6a8f07f`). El ejemplo de despliegue usa `llama-server -ngl 99 -c 16384 -np 1`. No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K2-Horizon-7B-repo-experimental (este) | ~9B | no disponible (ejemplo a 16.384) | Localización en repositorios, GGUF Q4_K_M | Apache 2.0 | Hugging Face, GGUF |
| IFM/K2-Horizon-7B (base) | ~9B | no disponible | Modelo base de propósito general/código | Apache 2.0 | Hugging Face, safetensors y GGUF FP16 |
| Otros modelos de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye comparaciones con modelos de terceros; la única referencia cuantitativa es el propio modelo base.

## Limitaciones y advertencias

- El autor declara que la ganancia en reparación de repositorios es pequeña (+1,49 pp) y con intervalo de confianza que cruza cero: no es estadísticamente concluyente.
- Caída acusada en coding corto: −16,46 pp en HumanEval+ y −9,26 pp en MBPP+ respecto al base. No debe usarse como sustituto de un modelo de código generalista.
- El modelo rara vez reconoce código reparado como limpio (11,11% frente a 5,56% del base, con intervalo que cruza cero).
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- No se documenta soporte de tool calling ni de agentes, pese a que el modelo base podría tenerlo.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo de código, puede generar ediciones plausibles pero incorrectas.
- Licencia Apache 2.0 permite uso comercial, pero los datasets de entrenamiento tienen atribuciones propias (Nebius y Google Research bajo CC BY 4.0), que conviene revisar.
- Checkpoint experimental con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni garantías documentadas.
- Requiere una build específica de llama.cpp con soporte para K2 Horizon; no es portable a otros runners sin conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anshuljsh/K2-Horizon-7B-repo-experimental-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- Revisión del modelo base: https://huggingface.co/IFM/K2-Horizon-7B/tree/1ad5223c80f635ede5fb926f6304dc7228246a4b
- Commit de llama.cpp usado en la evaluación: https://github.com/ggml-org/llama.cpp/commit/4625240437c6821ee5c2da99e12d4817c6a8f07f
- Dataset Nebius SWE-rebench OpenHands trajectories: https://huggingface.co/datasets/nebius/SWE-rebench-openhands-trajectories/tree/35455389ab51bf5e2306bfd436ef72d0f98bf882
- Dataset Together CoderForge Preview: https://huggingface.co/datasets/togethercomputer/CoderForge-Preview/tree/060fca96cf723b2ebab3181e9e59fafd273df3cb
- Dataset Google Research MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp/tree/4bb6404fdc6cacfda99d4ac4205087b89d32030c
- SWE-bench Verified: https://huggingface.co/datasets/SWE-bench/SWE-bench_Verified
- EvalPlus v0.3.1: https://github.com/evalplus/evalplus/tree/v0.3.1
