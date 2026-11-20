# logic65/Whittle-Qwen-3.8-35B-A3B

## Resumen
Whittle-Qwen-3.8-35B-A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el autor independiente logic65, construido sobre la arquitectura `qwen4_exp` de Qwen3.8-Flash-Next y destilado a nivel de logits desde Qwen3.8-27B. Cuenta con 35.562.370.195 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos MoE de activación dispersa. Su rasgo diferencial es una memoria n-gram con hashing de 10.000 millones de parámetros cuyos contenidos se transfieren directamente de la tabla propia de Qwen3.8-Flash-Next y que, según el autor, resulta funcionalmente determinante: anularla degrada de forma medible el rendimiento.

El modelo se presenta como una "research preview" en fase 2 de destilación, entrenada sobre 25.178 respuestas completas y calificadas de Qwen3.8-27B (matemáticas, código, chat, JSON estricto y episodios de agente ejecutados), cada una con la distribución top-20 del profesor en cada token. La raíz del repositorio corresponde al paso 32010 de la fase 2 (p2-s32010, publicado el 30 de septiembre de 2026) y ha entrenado una sola vez sobre las 22.950 filas que caben en su ventana de 4k; las 1.470 filas de contexto largo aún no se han utilizado y la fase on-policy no ha comenzado.

Su relevancia actual radica en dos factores: por un lado, ejecuta sobre llama.cpp estándar sin parches, lo que facilita su despliegue; por otro, publica una batería comparativa propia frente a otras variantes de la misma familia y frente a Qwen3.6-35B-A3B, con resultados medidos en código, uso de herramientas, matemáticas y conocimiento de cola larga. La licencia Apache 2.0 y el formato GGUF disponible amplían su accesibilidad para experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con formato `qwen4_exp`: hyper-connections, gated DeltaNet + atención y memoria n-gram con hashing de 10 B |
| Parametros totales | 35.562.370.195 |
| Parametros activos | ~3 B (aproximadamente 3.000 millones, según la model card) |
| Longitud de contexto | 4k (ventana de entrenamiento indicada; no se especifica contexto máximo de inferencia) |
| Tipos de cuantizacion | GGUF Q8_0 a Q3_K_M (repositorio GGUF separado); Q6_K y Q5_K_M empleados en las evaluaciones del autor |
| Idiomas soportados | Inglés (en), chino (zh), multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo emplea la arquitectura `qwen4_exp` de Qwen3.8-Flash-Next, que combina hyper-connections, una mezcla de gated DeltaNet y atención, y una memoria n-gram con hashing de 10.000 millones de parámetros. Esta memoria no es un componente pasivo: sus filas se transfieren desde la tabla propia de Qwen3.8-Flash-Next y el autor documenta que anularla perjudica de forma medible al modelo, lo que la convierte en un elemento estructural del rendimiento. El cuerpo parte de Whittle-Next-27B-A3B v4.4, un modelo podado al que se le añade la tabla de 10 B para dar lugar a este 35B.

El entrenamiento consiste en destilación a nivel de logits desde Qwen3.8-27B con el modo thinking activado, sobre 25.178 trazas verificadas del profesor publicadas junto con sus logprobs top-20 en el dataset logic65/whittle-distill-qwen3.8-27b. La fase 2 abarca matemáticas, código, chat, JSON estricto y episodios de agente ejecutados. La raíz del repositorio ha visto una sola pasada sobre las 22.950 filas compatibles con la ventana de 4k; las 1.470 filas de contexto largo quedan pendientes, igual que la fase de destilación on-policy. El autor advierte explícitamente que el modelo no debe compararse con Qwen3.8 en igualdad de condiciones.

## Capacidades
- Generación de texto conversacional multi-turno, con soporte de modo thinking (razonamiento explícito) heredado del profesor.
- Razonamiento matemático: resolución de problemas tipo GSM y MATH, con un consumo medio de tokens por respuesta inferior al de Qwen3.6-35B-A3B en las pruebas del autor (1.690–1.976 tokens frente a 4.018).
- Generación de código: funciones Python completas, evaluadas con HumanEval, HumanEval+, MBPP y MBPP+.
- Tool calling y function calling: soporte de uso de herramientas, incluida la variante de contexto largo (24 pruebas específicas).
- Capacidades de agente: episodios de agente ejecutados incluidos en el dataset de destilación y pruebas de uso de herramientas multi-paso.
- Salida JSON estricta: evaluación específica de exactitud en 72 pruebas de JSON estricto.
- Capacidades multilingües limitadas a inglés, chino y cobertura multilingüe genérica.
- Memoria n-gram con hashing que aporta conocimiento factual y de cola larga (nombres poco frecuentes, hechos planos).
- Ejecución en llama.cpp estándar sin necesidad de parches.

## Casos de uso
- Generación de código en producción: el modelo obtiene 73,8 en HumanEval y 70,7 en HumanEval+ según las mediciones del autor, lo que permite integrarlo en pipelines de revisión o generación de funciones Python con validación posterior en CI/CD.
- Asistentes de chat con razonamiento: el modo thinking y la ventana de 4k lo hacen adecuado para conversaciones multi-turno de alcance medio donde se requiera justificar respuestas paso a paso.
- Automatización de tareas con herramientas: las 95/96 pruebas de uso de herramientas y las 23/24 de contexto largo lo sitúan como candidato para agentes que invocan APIs y encadenan llamadas dentro de una ventana acotada.
- Extracción de datos estructurados: con 70/72 en JSON estricto exacto, puede emplearse para generar salidas JSON conformes a esquema en procesos de extracción o transformación de datos.
- Resolución de problemas matemáticos acotados: los resultados en GSM-50 (44) y MATH-60 (41 en la variante x256) permiten su uso en tutoría o verificación de cálculos, siempre con revisión humana.
- Investigación sobre arquitecturas con memoria: la memoria n-gram de 10 B y su transferencia desde Qwen3.8-Flash-Next lo convierten en una plataforma para estudiar el impacto de la memoria condicional en modelos MoE.
- Experimentación en hardware modesto: al poder descargar la tabla a RAM del sistema con `-ot per_layer_token_embd=CPU`, el 35B requiere la misma VRAM que la variante de 25B, lo que facilita pruebas en GPUs de gama media.

## Benchmarks y rendimiento
Resultados publicados por el autor (4 de octubre de 2026). Batería ejecutada con llama.cpp estándar sobre dos GPUs T4, thinking activado y una muestra por ítem. El modelo de este repositorio se evaluó en Q6_K (Q5_K_M en EvalPlus); las demás variantes, en las cuantizaciones indicadas.

| Métrica | Whittle 25B | **Whittle 35B (este repo)** | Whittle x256 | Whittle 45B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|
| Construcción | cuerpo podado, sin tabla | 25B + tabla de 10 B | 25B + 76 expertos por capa | este 35B + 76 expertos por capa | base |
| Fichero Q4_K_M | 15,7 GB | 21,3 GB (tabla 5,6) | 21,5 GB | 27,1 GB (tabla 5,6) | 22,3 GB |
| HumanEval / HumanEval+ | 53,0 / 51,2 | 73,8 / 70,7 | no ejecutado | 75,6 / 72,6 | no ejecutado |
| MBPP / MBPP+ | 72,2 / 60,8 | 76,2 / 61,9 | no ejecutado | 77,8 / 65,9 | no ejecutado |
| Uso de herramientas en contexto largo (24) | 19 | 23 | 19 | 24 | 24 |
| Sondas de uso de herramientas (96) | 91 | 95 | 91 | 96 | 93 |
| Página web: repetición de chat (40) | 35 | 34 | 33 | 27 | 40 |
| Página web: chats retenidos (36) | 28 | 32 | 32 | 31 | 32 |
| GSM-50 | 42 | 44 | 45 | 38 | 40 |
| MATH-60 | 38 | no en esta ejecución | 41 | 44 | 38 |
| MATH-60, tokens medios por respuesta | 1.976 | — | 1.959 | 1.690 | 4.018 |
| Nombres de cola larga, PopQA (252) | 97 | 94 | 111 | 111 | 132 |
| 40 hechos planos | 35 | 35 | 37 | 37 | 33 |
| JSON estricto, exacto (72) | 71 | 70 | 72 | 70 | 72 |
| Batería de parada/bucle, limpio (24) | 23 | 23 | 24 | 24 | 24 |

El autor atribuye a la tabla n-gram una mejora en código (HumanEval de 53,0 a 73,8, con 46 tareas ganadas y 12 perdidas) y en uso de herramientas de contexto largo (de 19/24 a 23–24/24), sin efecto apreciable en nombres de cola larga ni en hechos planos. Los expertos restaurados, por su parte, aportan conocimiento de cola larga: 17 ganadas y 3 perdidas de 252 preguntas de nombres sobre el cuerpo de 25B, y 18 ganadas y 1 perdida sobre este 35B.

## Requisitos de hardware
- VRAM estimada: el fichero Q4_K_M ocupa 21,3 GB, de los cuales 5,6 GB corresponden a la tabla; con `-ot per_layer_token_embd=CPU` esa parte se descarga a RAM del sistema y el modelo requiere la misma VRAM que la variante de 25B (fichero Q4_K_M de 15,7 GB).
- GPUs empleadas en las evaluaciones del autor: dos NVIDIA T4 con llama.cpp estándar.
- GPU de consumo: no se documenta una prueba en GPUs consumer; el requisito de VRAM con la tabla descargada a RAM es comparable al de un modelo de 25B, por lo que podría caber en tarjetas de 24 GB con cuantizaciones Q4_K_M o inferiores, aunque este dato no está confirmado por el autor.
- Opciones de despliegue: llama.cpp estándar sin parches (soporte nativo), transformers con safetensors, y GGUF en el repositorio logic65/Whittle-Qwen-3.8-35B-A3B-GGUF (Q8_0 a Q3_K_M). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| **Whittle-Qwen-3.8-35B-A3B** | 35,56 B | ~3 B | 4k | Apache 2.0 | safetensors + GGUF | Memoria n-gram de 10 B; HumanEval 73,8; tool use 95/96 |
| Whittle-Next-27B-A3B (base) | no disponible | no disponible | no disponible | Apache 2.0 (según repo base) | safetensors | Cuerpo del que parte este modelo (v4.4) |
| Whittle 25B (Qwen3.6-Whittle-25B-A3B) | 25 B (aprox.) | ~3 B | no disponible | Apache 2.0 (según repo) | GGUF | Cuerpo podado sin tabla; HumanEval 53,0; tool use 91/96 |
| Qwen3.6-35B-A3B | 35 B (aprox.) | ~3 B | no disponible | no disponible en la información | GGUF (bartowski) | Base de la familia; tool use 93/96; PopQA 132/252 |

La comparación con Qwen3.8-27B (profesor) no se incluye porque el autor advierte explícitamente que no debe establecerse en igualdad de condiciones.

## Limitaciones y advertencias
- Modelo en fase de investigación ("research preview"): la raíz ha entrenado una sola pasada sobre 22.950 filas y no ha iniciado la fase on-policy; los resultados no son comparables con Qwen3.8 en igualdad de condiciones.
- Ventana de contexto de 4k: las 1.470 filas de contexto largo del dataset no se han utilizado, lo que limita el rendimiento en tareas que exijan contextos extensos.
- Conocimiento factual limitado: 94/252 en PopQA y 35/40 en hechos planos, por debajo de Qwen3.6-35B-A3B (132/252 y 33/40 respectivamente); el autor señala que se necesitan más filas de memoria y datos densos en hechos.
- Riesgo de alucinación: no se documentan evaluaciones específicas de veracidad; el uso en producción requiere validación externa.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Idiomas: cobertura declarada de inglés, chino y multilingüe genérico; no se especifican evaluaciones por idioma.
- Licencia Apache 2.0: permite uso comercial, pero el estado de investigación y la falta de validación en producción desaconsejan su despliegue sin pruebas propias.
- Dependencia de la memoria n-gram: el rendimiento en código y uso de herramientas de contexto largo depende de la tabla de 10 B; su descarga a RAM del sistema cambia el perfil de memoria y puede afectar a la latencia.
- Tamaño del repositorio: 2.655,7 GB, lo que encarece la descarga y el almacenamiento de los pesos completos en safetensors.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- GGUF del modelo: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B-GGUF
- Modelo base: https://huggingface.co/logic65/Whittle-Next-27B-A3B
- Dataset de destilación: https://huggingface.co/datasets/logic65/whittle-distill-qwen3.8-27b
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante Whittle 25B: https://huggingface.co/logic65/Qwen3.6-Whittle-25B-A3B
- Variante Whittle 45B: https://huggingface.co/logic65/Whittle-Qwen-3.8-45B-A3B-GGUF
- Rama experimental x256: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B/tree/dev/splice256
- Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Apoyo al autor: https://ko-fi.com/davida81328
