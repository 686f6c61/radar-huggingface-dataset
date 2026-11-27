# kaitchup/Inkling-2-Mini-dondon-GGUF

## Resumen

Inkling-2-Mini-dondon-GGUF es una colección de cuantizaciones GGUF de baja precisión del modelo Thinking Machines Inkling 2 Mini, publicada por el usuario kaitchup bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de un trabajo de re-cuantización que parte de los GGUF existentes (propios y los UD GGUF de Unsloth) y reajusta las escalas de cuantización mediante un framework propio. El resultado son tres ficheros (Q2_K_XS, Q3_K_S y Q3_K_M) que comprimen un modelo de 26.070.390.272 parámetros (unos 26 000 millones) hasta ocupar entre 8 y 11,66 GB.

El modelo subyacente, Inkling 2 Mini, es un transformer de 24 bloques decodificadores con atención en bloques "looped" (etiqueta inkling2_loop) y capacidades multimodales, ya que el repositorio incluye un codificador de visión separado (mmproj-BF16.gguf, 0,64 GB) y un drafter DSpark derivado de los pesos MTP (dspark-Inkling-2-Mini-Q8_0.gguf, 0,40 GB) para decodificación especulativa. El contexto declarado en las evaluaciones es de 262 144 tokens.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo de ~26B con capacidades de razonamiento, código y visión en hardware de consumo con cuantizaciones de 2-3 bits; por otro, documenta con detalle el compromiso entre tamaño y fidelidad (KL, EAR@10, GPQA Diamond) frente a BF16 y frente a las cuantizaciones de Unsloth. Es, por tanto, una referencia útil para quien necesite desplegar localmente un modelo grande con restricciones de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 24 bloques decodificadores y atención en bloques "looped" (inkling2_loop); incluye encoder de visión y pesos MTP para drafter especulativo |
| Parametros totales | 26.070.390.272 (~26B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens en evaluación; el ejemplo de llama-server usa 8 192 tokens |
| Tipos de cuantizacion | Q2_K_XS, Q3_K_S, Q3_K_M (GGUF de precisión mixta por capa); mmproj BF16; drafter Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); ficheros separados mmproj-BF16.gguf y dspark-Inkling-2-Mini-Q8_0.gguf |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini emplea una arquitectura transformer con 24 bloques decodificadores y atención en bloques "looped", un esquema que repite ciertos bloques para aumentar la profundidad efectiva sin incrementar proporcionalmente el número de parámetros. Incluye además pesos MTP (multi-token prediction) que el autor del repositorio reutiliza para construir un drafter DSpark de decodificación especulativa, y un codificador de visión independiente que habilita la entrada de imágenes.

Sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no se proporciona información en la documentación disponible. Lo que sí se documenta es el proceso de cuantización: el framework "dondon" de kaitchup re-trabaja la precisión de GGUF ya existentes y reentrena las escalas de cuantización, produciendo matrices de formato mixto a lo largo de los 24 bloques decodificadores (los diagramas de precisión por capa están incluidos en el repositorio). La evaluación se realizó con kaiLLM contra el GGUF BF16 de ggml-org, ejecutado en llama.cpp, cubriendo dominios de matemáticas, razonamiento de opción múltiple, código, instrucciones, texto web multilingüe, libros, chat humano, trazas de razonamiento mixtas y coding agéntico.

## Capacidades

- Generación de texto conversacional y razonamiento de múltiples pasos, con modo "thinking" y esfuerzo de razonamiento alto (high reasoning effort) empleado en las evaluaciones.
- Razonamiento matemático y de opción múltiple (evaluado en GPQA Diamond).
- Razonamiento de código y coding agéntico (agentic coding) según los dominios de evaluación declarados.
- Entrada de imágenes mediante el codificador de visión mmproj-BF16.gguf.
- Decodificación especulativa mediante el drafter DSpark derivado de los pesos MTP.
- Capacidades multilingües: la evaluación incluye texto web multilingüe, aunque no se detallan los idiomas concretos soportados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: parcialmente evidenciado por el dominio "agentic coding" de la evaluación, sin más detalle.

## Casos de uso

- Despliegue local en GPU de consumo: con Q2_K_XS (8,00 GB) o Q3_K_S (10,00 GB) el modelo cabe en tarjetas de 12-16 GB de VRAM, permitiendo ejecutar un modelo de ~26B con razonamiento y visión en una estación de trabajo personal.
- Asistente de código en local: el dominio de evaluación incluye razonamiento de código y coding agéntico; el modelo puede integrarse en editores o pipelines de CI/CD mediante llama-server con contexto de 8 192 tokens.
- Razonamiento matemático y científico asistido: los resultados en GPQA Diamond (85,1-85,9 % en las cuantizaciones dondon) lo hacen adecuado para preguntas de opción múltiple de nivel avanzado, con la cautela de que las diferencias están dentro del ruido de ejecución.
- Procesamiento de documentos con imágenes: gracias al codificador de visión separado (mmproj-BF16.gguf), puede emplearse para tareas de comprensión de documentos escaneados o capturas, añadiendo `--mmproj` al servidor llama.cpp.
- Generación aumentada por recuperación (RAG) sobre corpus largos: el contexto de 262 144 tokens declarado en la evaluación permite ingerir documentos extensos, aunque en la práctica el ejemplo de despliegue usa 8 192 tokens por limitaciones de memoria.
- Servicio de inferencia autoalojado con API compatible: el repositorio está etiquetado como endpoints_compatible y se sirve con llama-server, lo que facilita montar un endpoint HTTP propio sin depender de proveedores externos.
- Experimentación en investigación sobre cuantización: los ficheros y las métricas publicadas (KL@10, EAR@10, precisión por capa) sirven como referencia para estudiar el impacto de la cuantización de baja precisión en modelos grandes.

## Benchmarks y rendimiento

Los datos de la model card corresponden a evaluaciones held-out realizadas con kaiLLM contra el GGUF BF16 de ggml-org en llama.cpp, con thinking activado, temperatura 1,0, contexto de 262 144 tokens y GPQA Diamond promediado sobre dos ejecuciones por pregunta (EvalScope 1.15.0, semilla 42).

| Checkpoint | GB | KL@10 ↓ | EAR@10 (%) ↑ | GPQA Diamond (%) ↑ |
|---|---:|---:|---:|---:|
| dondon Q2_K_XS | 8,00 | 0,0760 | 91,17 | 85,1 |
| dondon Q3_K_S | 10,00 | 0,0459 | 93,55 | 84,6 |
| dondon Q3_K_M | 11,66 | 0,0319 | 94,91 | 85,9 |
| chimachima Q2_K_XS | 8,00 | 0,0456 | 93,62 | 86,4 |
| chimachima Q3_K_S | 10,00 | 0,0298 | 95,19 | 85,9 |
| chimachima Q3_K_M | 12,00 | 0,0223 | 96,15 | 87,9 |
| unsloth UD-IQ1_M | 8,02 | 0,0985 | 90,41 | 84,8 |
| unsloth UD-Q2_K_XL | 9,14 | 0,0681 | 91,76 | 84,3 |
| unsloth UD-IQ3_XXS | 11,66 | 0,0351 | 94,72 | 86,6 |
| Inkling 2 Mini BF16 | 52,23 | - | - | 86,4 |

El autor advierte que las diferencias en GPQA Diamond están dentro del ruido entre ejecuciones, con un error estándar pareado de aproximadamente 1,5 puntos. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: Q2_K_XS requiere unos 8 GB para los pesos; Q3_K_S unos 10 GB; Q3_K_M unos 11,66 GB. A ello hay que sumar la memoria para el contexto KV y, opcionalmente, 0,64 GB del mmproj y 0,40 GB del drafter.
- GPU recomendadas: el autor indica que, con offload parcial o con los expertos en CPU, llama.cpp devuelve NaN para estos GGUF, por lo que el modelo completo debe caber en la GPU. Esto favorece tarjetas de 16 GB o más (RTX 4080/4090, A100, H100) para las cuantizaciones Q3, y de 12 GB para Q2_K_XS.
- Cabe en GPU de consumo: sí, con Q2_K_XS en tarjetas de 12 GB y con Q3_K_S/Q3_K_M en tarjetas de 16 GB o superiores.
- Opciones de despliegue: llama.cpp (versión b12611 o superior, primera con la corrección de los bloques "looped", PR #32704) mediante llama-server; el drafter DSpark requiere por ahora la build de llama.cpp de Unsloth. El autor también menciona kaiLLM y su variante chimachima (kaiPTQ) como alternativa más precisa al mismo tamaño.
- Latencia y throughput: no disponibles en la información proporcionada. El ejemplo de servidor usa `--n-gpu-layers 99 --ctx-size 8192`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Inkling-2-Mini-dondon (Q2_K_XS / Q3_K_S / Q3_K_M) | ~26B | 262 144 (evaluación) | Apache 2.0 | GGUF | Re-cuantización con reentrenamiento de escalas; EAR@10 91,17-94,91 %; GPQA 84,6-85,9 % |
| Inkling-2-Mini-chimachima (kaiPTQ) | ~26B | 262 144 (evaluación) | Apache 2.0 | GGUF/kaiPTQ | Más preciso al mismo tamaño (KL@10 0,0223-0,0456; GPQA 85,9-87,9 %) |
| Unsloth UD GGUF de Inkling-2-Mini | ~26B | 262 144 (evaluación) | Apache 2.0 | GGUF | Base de la re-cuantización; UD-IQ1_M, UD-Q2_K_XL y UD-IQ3_XXS comparados en la tabla de benchmarks |
| Inkling 2 Mini BF16 (ggml-org) | ~26B | 262 144 (evaluación) | Apache 2.0 | GGUF BF16 | Referencia de fidelidad (52,23 GB); GPQA 86,4 % |

No se dispone de datos de otros modelos de ~26B ajenos a la familia Inkling 2 Mini en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Las cuantizaciones de 2-3 bits introducen degradación medible: KL@10 entre 0,0319 y 0,0760 y EAR@10 entre 91,17 % y 94,91 %, frente al BF16 de referencia.
- El autor advierte explícitamente de que las diferencias en GPQA Diamond están dentro del ruido entre ejecuciones (±1,5 puntos), por lo que no deben interpretarse como mejoras reales.
- Con offload parcial de capas o con los expertos en CPU, llama.cpp devuelve NaN para estos GGUF (issue #32710): es obligatorio que el modelo completo quepa en la GPU.
- Se requiere llama.cpp b12611 o superior; versiones anteriores no incluyen la corrección de los bloques "looped" (PR #32704).
- El drafter DSpark solo funciona con la build de llama.cpp de Unsloth; el soporte en mainline sigue en pull requests abiertas (#32218, #32773).
- No se detallan los idiomas soportados ni los sesgos conocidos del modelo base; tampoco hay información sobre tool calling o function calling.
- No hay datos publicados de MMLU, HumanEval o GSM8K en la información disponible, lo que limita la comparación con otros modelos.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini antes de un uso comercial en producción.
- El autor recomienda probar el modelo antes de fiarse de sus métricas ("try the model yourself before trusting my numbers").

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kaitchup/Inkling-2-Mini-dondon-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- GGUF BF16 de ggml-org: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Variante chimachima (kaiPTQ): https://huggingface.co/kaitchup/Inkling-2-Mini-chimachima-kaiPTQ
- Framework kaiLLM: https://github.com/the-kaitchup/kaiLLM
- PR de llama.cpp con la corrección de bloques "looped": https://github.com/ggml-org/llama.cpp/pull/32704
- Issue de llama.cpp sobre NaN con offload parcial: https://github.com/ggml-org/llama.cpp/issues/32710
- PR de soporte del drafter DSpark (#32218): https://github.com/ggml-org/llama.cpp/pull/32218
- PR de soporte del drafter DSpark (#32773): https://github.com/ggml-org/llama.cpp/pull/32773
- Builds de llama.cpp de Unsloth: https://github.com/unslothai/llama.cpp/releases
- Newsletter del autor: https://kaitchup.substack.com/subscribe
- Apoyo al autor: https://buymeacoffee.com/kaitchup
