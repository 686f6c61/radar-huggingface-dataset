# Lordnyx/qwen3.5-9b-triple-loop-fase2

## Resumen

Qwen3.5-9B Triple-Loop (Phase 2) es un ajuste fino del modelo base Qwen/Qwen3.5-9B desarrollado por el usuario Lordnyx. Su particularidad no reside en un aumento del numero de parametros, sino en una modificacion del grafo de ejecucion logico: los 32 bloques fisicos del transformer se reordenan en un esquema de recurrencia triple, de modo que los bloques intermedios (8 a 23) se ejecutan tres veces con pesos compartidos, alcanzando una profundidad logica efectiva de 64 capas. El checkpoint corresponde a la fase 2 del proyecto, en la que se aplicaron 30 pasos de aprendizaje por refuerzo (GRPO / R1-Zero) sobre una GPU NVIDIA H100 SXM5 de 80 GB.

El modelo mantiene el mismo numero de parametros que el original (8.953.803.264 segun los pesos en safetensors), por lo que su huella de VRAM es identica a la de Qwen3.5-9B en bf16 o en cuantizaciones GGUF. La innovacion es, por tanto, de tipo arquitectonico y de entrenamiento, no de escala. El autor documenta de forma explicita las dinamicas internas de los tres bucles (formacion de hipotesis, reflexion critica y sintesis) mediante metricas de entropia y velocidad latente.

Es relevante ahora porque propone una via poco explorada en modelos abiertos: aumentar la profundidad efectiva sin aumentar el coste de almacenamiento, combinada con un ajuste RL orientado a la adherencia a esquemas de tool calling y a la disciplina de razonamiento en etiquetas `<think>`. La licencia Apache 2.0 y la compatibilidad con motores estandar facilitan su evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia triple (LoopSplit); 32 bloques fisicos, 64 capas logicas |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, GGUF (el autor menciona Q5_K_M, aproximadamente 6,02 GB) |
| Idiomas soportados | en, pt |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5-9B y aplica el esquema denominado LoopSplit. Fisicamente el modelo contiene 32 bloques transformer estandar (`blk.0` a `blk.31`), pero la ejecucion logica se divide en tres tramos: un prefijo de 8 bloques que se ejecuta una vez, un bucle intermedio de 16 bloques que se ejecuta tres veces consecutivas con pesos compartidos y un sufijo de 8 bloques que se ejecuta una vez. El resultado es una profundidad logica de 64 capas (8 + 16x3 + 8). El autor distingue dos modos de operacion: el modo nativo o destilado, que recorre los 32 bloques una sola vez y ya ofrece resultados solidos gracias a la supervision profunda aplicada durante el entrenamiento, y el modo de recurrencia triple real, que requiere motores compatibles con LoopSplit (el repositorio incluye un parche para llama.cpp y la opcion `--override-kv qwen35.triple_loop=int:1`). En este segundo modo los pesos se aliasan en memoria mediante `TENSOR_DUPLICATED`, sin VRAM adicional para pesos, pero la cache KV reserva 64 posiciones, una por profundidad logica.

El entrenamiento se desarrollo en dos fases. La fase 1 consistio en una destilacion profunda de 2.100 pasos a partir de Qwen3.8-27B, que establecio las dinamicas recurrentes de 64 capas. La fase 2, que corresponde a este checkpoint, aplico exactamente 30 pasos de optimizacion con aprendizaje por refuerzo GRPO / R1-Zero (tamano de grupo G=4), optimizador AdamW, tasa de aprendizaje 1,0e-6 y recorte de gradiente 1,0, sobre una unica GPU H100 SXM5 de 80 GB en Modal. El objetivo declarado fue la calibracion de salida: adherencia estricta al esquema `<tool_call>`, encapsulado XML y disciplina en el razonamiento encadenado, limitando los pasos para evitar el olvido catastrofico de las topologias latentes intermedias. El autor reporta un 65,6 % de exito en el benchmark empleado y un 100 % de discriminacion contrastiva de grupo, y documenta la deriva de pesos entre fases mediante similitud coseno por capa.

## Capacidades

- Generacion de texto conversacional y razonamiento encadenado con modo de pensamiento explicito en etiquetas `<think>...</think>`.
- Tool calling y function calling con adherencia a esquema XML (`<tool_call>`), reforzado especificamente durante la fase 2.
- Comportamiento agentico y razonamiento multi-paso, orientado a tareas de sistemas distribuidos y de codigo.
- Razonamiento contrastivo: el autor documenta una fase interna de reflexion que detecta ambiguedad y sopesa alternativas antes de sintetizar la respuesta.
- Capacidades multilingues limitadas a ingles y portugues segun los metadatos del modelo.
- Ejecucion en dos modos: nativo de 32 capas y recurrencia triple de 64 capas logicas con motores compatibles.
- No se documentan capacidades de vision ni de audio.

## Casos de uso

- Agentes de tool calling en produccion: el ajuste RL de la fase 2 esta orientado a la adherencia estricta del esquema `<tool_call>`, lo que reduce errores de formato en pipelines que parsean llamadas a funciones de forma automatica.
- Razonamiento sobre sistemas distribuidos y depuracion de arquitecturas: el autor emplea precisamente prompts de este dominio para ilustrar las dinamicas de los tres bucles, donde el modelo forma una hipotesis, la cuestiona y la resuelve.
- Asistentes conversacionales en ingles y portugues: el soporte declarado de ambos idiomas permite desplegar un unico modelo en mercados lusofonos y angloparlantes sin cambio de checkpoint.
- Generacion de codigo con verificacion intermedia: el modo de pensamiento explicito permite separar la traza de razonamiento del codigo final, util en revisiones automatizadas.
- Evaluacion de investigacion en recurrencia: al ser un modelo abierto con parche para llama.cpp, sirve para experimentar con profundidad logica variable y medir su efecto en tareas de razonamiento.
- Despliegue en hardware de gama alta para comparativas controladas: al compartir huella de VRAM con Qwen3.5-9B, permite comparar directamente el efecto del bucle triple frente al modelo base en el mismo entorno.
- Procesamiento por lotes en entornos con GPU unica: la cuantizacion Q5_K_M (aproximadamente 6,02 GB) hace viable su ejecucion en una sola GPU de consumo alta.

## Benchmarks y rendimiento

El autor reporta un 65,6 % de exito en el benchmark interno de la fase 2 y un 100 % de discriminacion contrastiva de grupo, sin especificar el conjunto de evaluacion ni la comparacion con el modelo base. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica reportada | Valor | Contexto |
|---|---|---|
| Exito en benchmark de fase 2 | 65,6 % | Benchmark no especificado por el autor |
| Discriminacion contrastiva de grupo | 100 % | GRPO, G=4 |
| Pasos de RL | 30 | AdamW, LR 1,0e-6 |

Dinamicas internas documentadas por el autor sobre un prompt de sistemas distribuidos:

| Etapa | Capas logicas | Velocidad latente | Entropia de salida | Comportamiento |
|---|---|---|---|---|
| Prefijo | 0-7 | no disponible | 10,90 | Alta incertidumbre, analisis sintactico |
| Bucle r0 | 8-23 | +692 % | 5,39 | Formacion de hipotesis |
| Bucle r1 | 24-39 | +22,6 % | 8,65 | Reflexion critica y duda |
| Bucle r2 | 40-55 | +24,7 % | 6,27 | Sintesis y resolucion |
| Sufijo | 56-63 | +119,2 % | 0,61 | Proyeccion decisiva |

## Requisitos de hardware

- VRAM en bf16: aproximadamente 17,9 GB para los pesos, segun el autor.
- VRAM en GGUF Q5_K_M: aproximadamente 6,02 GB para los pesos.
- En modo de recurrencia triple, la cache KV reserva 64 posiciones en lugar de 32, por lo que el coste de contexto se duplica respecto al modo nativo.
- GPU de entrenamiento documentada: 1x NVIDIA H100 SXM5 de 80 GB.
- GPU recomendadas para inferencia en bf16: A100 40 GB, H100, L40S o RTX 4090 (24 GB, con margen limitado para contexto largo).
- Cabe en GPU de consumo con cuantizacion GGUF: RTX 4090, RTX 3090, RTX 4080 y tarjetas con 8-12 GB en cuantizaciones de 4-5 bits.
- Opciones de despliegue: Hugging Face Transformers y vLLM en modo nativo; llama.cpp con el parche incluido en `engine/llamacpp_patch/` para el modo de recurrencia triple.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B Triple-Loop Phase 2 | 8,95 B | no disponible | Transformer con recurrencia triple | Apache 2.0 | Ajuste RL de 30 pasos, tool calling reforzado |
| Qwen/Qwen3.5-9B | 9,2 B (aprox.) | no disponible | Transformer estandar de 32 bloques | Apache 2.0 | Modelo base; misma huella de VRAM |
| Qwen3.8-27B | 27 B (aprox.) | no disponible | Transformer | no disponible | Fuente de la destilacion de fase 1 |

La comparativa con alternativas de otros desarrolladores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste RL de la fase 2 es muy corto (30 pasos); el autor lo justifica por la preservacion de las representaciones recurrentes, pero implica una calibracion de comportamiento limitada.
- El benchmark del 65,6 % no esta identificado, por lo que no es comparable con resultados publicos estandarizados.
- El modo de recurrencia triple requiere motores modificados o el parche de llama.cpp incluido; no funciona de forma nativa en todas las herramientas de despliegue.
- La cache KV en modo triple ocupa el doble de posiciones, lo que reduce el contexto efectivo disponible para una VRAM dada.
- Solo se declaran los idiomas ingles y portugues; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad factual.
- Sesgos conocidos: no disponibles.
- El repositorio ocupa 115,5 GB, lo que incluye pesos en safetensors y GGUF; conviene descargar solo los archivos necesarios.
- Aunque la licencia es Apache 2.0, el modelo deriva de Qwen3.5-9B y hereda las condiciones de su licencia original enlazada en la model card.
- El modelo tiene un numero muy bajo de descargas y likes, por lo que la validacion por parte de la comunidad es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/Lordnyx/qwen3.5-9b-triple-loop-fase2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Modal (plataforma de computo empleada): https://modal.com
