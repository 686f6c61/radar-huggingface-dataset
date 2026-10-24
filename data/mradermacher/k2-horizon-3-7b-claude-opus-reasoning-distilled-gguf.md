# mradermacher/K2-Horizon-3.7B-Claude-Opus-Reasoning-Distilled-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF estáticas del modelo xtools-at/K2-Horizon-3.7B-Claude-Opus-Reasoning-Distilled, un ajuste fino (LoRA fusionado) sobre el modelo denso K2-Horizon-3.7B de IFM, orientado a generar cadenas de razonamiento (chain-of-thought) en inglés. mradermacher, conocido por publicar versiones cuantizadas de modelos abiertos, distribuye aquí ficheros listos para llama.cpp y derivados en doce niveles de cuantización, desde Q2_K (2,2 GB) hasta f16 (10,2 GB), además de una variante con matrices de importancia (i1) en un repositorio aparte.

El modelo de partida es un transformer decoder-only denso de la familia K2 Horizon, que según LLM Reference declara 3,7B de parámetros y 512K tokens de contexto nativo, aunque el recuento real de parámetros en los safetensors del repositorio es de 5.058.255.360 (5,06B), una discrepancia que conviene tener presente. El ajuste fino destila trazas de razonamiento generadas por modelos Claude (Opus 4.6, Opus 4.5 y Sonnet 4.5) a partir de cuatro datasets públicos de TeichAI y Roman1111111, con licencia Apache 2.0 declarada.

Su relevancia práctica es doble: por un lado, ofrece un modelo pequeño con estilo de razonamiento paso a paso que cabe en una GPU de consumo; por otro, sirve como caso de estudio de las técnicas de destilación de razonamiento desde modelos propietarios, un fenómeno creciente en el ecosistema abierto. La model card es mínima (generada automáticamente por el cuantizador) y no incluye evaluaciones, por lo que cualquier decisión de adopción debe apoyarse en pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia K2 Horizon, IFM) |
| Parametros totales | 5.058.255.360 según safetensors del repo; la denominación comercial indica 3,7B |
| Parametros activos | No aplica (modelo denso, sin MoE) |
| Longitud de contexto | 512K nativo según LLM Reference (no verificado en la model card); la receta de llama.cpp documentada se probó con 131.072 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; variantes imatrix en el repo i1-GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo original se distribuye en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only denso de la familia K2 Horizon de IFM, que forma parte de una flota abierta de seis modelos con hermanos densos y MoE de mayor tamaño. Sobre esa base, xtools-at aplicó un ajuste fino con LoRA (entrenado con Unsloth, según los tags del repositorio) para incorporar el estilo y los patrones de razonamiento de Claude, y posteriormente fusionó el adaptador para producir pesos completos en safetensors. mradermacher convirtió esos pesos a GGUF (`convert_type: hf`) y generó las cuantizaciones con la versión 2 del pipeline de cuantización de llama.cpp.

Los datos de entrenamiento no están descritos en detalle en la información disponible: solo se listan los cuatro datasets empleados (TeichAI/Claude-Opus-4.6-Reasoning-887x, TeichAI/claude-4.5-opus-high-reasoning-250x, TeichAI/claude-sonnet-4.5-high-reasoning-250x y Roman1111111/claude-opus-4.6-10000x), todos ellos compuestos por trazas de razonamiento generadas por modelos Claude. No se documentan el número total de tokens, la composición exacta, ni si hubo fases de RLHF o DPO adicionales. La innovación técnica principal no está en la arquitectura, sino en el método: destilación de cadenas de pensamiento de un modelo propietario a un modelo abierto de pequeño tamaño, con el objetivo de reproducir el formato de razonamiento (pensamiento previo a la respuesta) a un coste de inferencia muy inferior.

## Capacidades

- Generación de texto conversacional en inglés con formato de turnos multi-turno.
- Razonamiento explícito en forma de cadena de pensamiento (chain-of-thought) antes de la respuesta final, heredado de la destilación.
- Resolución de problemas de lógica y matemáticas de dificultad media, limitada por el tamaño del modelo.
- Explicaciones paso a paso y descomposición de problemas en subproblemas.
- Comprensión de documentos largos dentro de la ventana de contexto declarada, con recuperación de información en posiciones intermedias (aguja en pajar) verificada en la receta oficial.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: parcialmente implícito por el formato de cadena de pensamiento, pero sin documentación de uso agéntico ni de plantillas de herramientas.
- Capacidades especiales: modo de razonamiento destilado; sin visión, audio ni otras modalidades.

## Casos de uso

- Asistente de razonamiento local en inglés: desplegado con llama.cpp u Ollama en una estación de trabajo, genera explicaciones paso a paso para consultas técnicas sin enviar datos a un servicio externo, lo que resulta adecuado para entornos con requisitos de privacidad.
- Análisis de documentos largos: con la ventana de contexto extendida (la receta oficial valida 131.072 tokens y el fabricante declara 512K), puede resumir contratos, informes o expedientes completos y localizar información en posiciones intermedias del texto.
- Prototipado rápido de aplicaciones de IA: al ocupar entre 2,2 y 5,5 GB en disco según cuantización, permite iterar sobre prompts y plantillas de razonamiento en un portátil antes de migrar a un modelo mayor.
- Generación de explicaciones educativas: produce soluciones detalladas de ejercicios de matemáticas y lógica, útil en herramientas de tutoría que necesitan mostrar el desarrollo y no solo el resultado.
- Extracción estructurada con justificación: en pipelines de procesamiento documental, el modelo puede razonar sobre el texto y emitir el campo extraído junto con su justificación, facilitando la auditoría de resultados.
- Investigación sobre destilación de razonamiento: sirve como referencia para estudiar hasta qué punto un modelo de 3-5B puede imitar el estilo y la calidad de razonamiento de modelos frontera, comparando sus trazas con las del modelo profesor.
- Evaluación de cuantizaciones: la disponibilidad de doce niveles permite medir la degradación de la calidad de razonamiento entre Q2_K y Q8_0 sobre el mismo conjunto de problemas.
- Despliegue en hardware de gama consumer: integrable en aplicaciones de escritorio con llama-cpp-python o LM Studio para tareas de razonamiento offline en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye evaluaciones y la información del modelo base tampoco aporta cifras de MMLU, HumanEval, GSM8K ni similares. Las únicas métricas disponibles son de rendimiento de inferencia, procedentes de la receta de llama.cpp publicada en GitHub:

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificacion en un solo stream | 140-152 tok/s | RTX 5090 (32 GB), GGUF bf16, contexto 131.072, KV en bf16, `--parallel 1` |
| Prefill | 12.366 tok/s | Prompt de 3,9K tokens |
| Aguja 60K en prompt de 100K | Encontrada, 36 s de extremo a extremo | Prompt de 100.035 tokens |
| Agregado con 4 streams concurrentes | 151 tok/s | Peticiones en cola con `--parallel 1` |

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): 2,2 GB en Q2_K; 3,3 GB en Q4_K_M; 3,7 GB en Q5_K_M; 4,3 GB en Q6_K; 5,5 GB en Q8_0; 10,2 GB en f16. Añadir entre 0,5 y 1,5 GB de sobrecarga para el grafo de computación y el contexto inicial.
- Caché KV: es el factor dominante en contextos largos. Con KV en bf16 y 131.072 tokens, la receta oficial encaja en una única GPU de 32 GB; en contextos reducidos (4K-8K) la huella adicional es mínima.
- GPU recomendadas: RTX 5090 (32 GB) es la configuración validada para contexto completo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para contextos de decenas de miles de tokens; A100 y H100 aportan margen para contextos muy largos o mayor concurrencia.
- Cabe en GPU de consumo: sí, desde una RTX 3060 de 12 GB o incluso GPUs de 8 GB con cuantizaciones Q4_K_S o inferiores y contextos moderados; también es viable en CPU con llama.cpp a velocidades de pocos tokens por segundo.
- Opciones de despliegue: llama.cpp (la receta usa el fork de IFM, que habilita el contexto de 131K), Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI. vLLM y TGI no se citan en la información disponible para este formato GGUF.
- Latencia y throughput: ver la tabla de benchmarks; los datos corresponden a una sola RTX 5090 con decodificación de un único stream.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| mradermacher/K2-Horizon-3.7B-Claude-Opus-Reasoning-Distilled-GGUF (este repo) | 5,06B reales (3,7B nominales) | 512K declarados; 131K validados | Apache 2.0 | GGUF | No disponibles |
| xtools-at/K2-Horizon-3.7B-Claude-Opus-Reasoning-Distilled (modelo base) | 5,06B reales | 512K declarados | Apache 2.0 | Safetensors | No disponibles |
| IFM/K2-Horizon-3.7B (modelo original sin destilar) | 3,7B nominales | 512K declarados | Apache 2.0 | Safetensors | No disponibles |
| mradermacher/K2-Horizon-3.7B-GGUF (cuantizaciones del original) | 3,7B nominales | 512K declarados | Apache 2.0 | GGUF | No disponibles |

No hay datos cuantitativos que permitan comparar este modelo con alternativas de otras familias (Qwen, Llama, Gemma) de tamaño similar: no se han publicado evaluaciones en la información disponible. La comparación cualitativa plausible es con otros modelos pequeños destilados para razonamiento, pero sus cifras tampoco se recogen aquí, por lo que se indica "no disponible" en lugar de inferir valores.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; su uso en castellano no está evaluado ni soportado oficialmente.
- Ausencia total de evaluaciones: no hay benchmarks publicados, por lo que el rendimiento real en razonamiento, matemáticas o código es desconocido y debe medirse antes de usar en producción.
- Discrepancia de tamaño: la denominación comercial (3,7B) no coincide con el recuento de safetensors (5,06B); conviene verificar la arquitectura real antes de dimensionar hardware.
- Riesgo de alucinación: al ser un modelo de ~3-5B, la coherencia de las cadenas de razonamiento puede degradarse en problemas largos, produciendo justificaciones plausibles pero incorrectas.
- Origen de los datos: el ajuste fino se apoya en trazas generadas por modelos Claude; la licencia Apache 2.0 cubre los pesos, pero la procedencia de los datos de destilación plantea dudas sobre los términos de uso de las salidas de un modelo propietario. Es un aspecto a revisar por el equipo legal antes de un uso comercial.
- Nomenclatura potencialmente engañosa: el nombre incluye "Claude-Opus", pero no es un modelo de Anthropic ni está afiliado a ella.
- Calidad por cuantización: las variantes Q2_K y Q3_K_M degradan la calidad de forma notable según los criterios del propio cuantizador; para razonamiento se recomienda Q4_K_M o superior.
- Sin soporte documentado de tool calling ni de plantilla de chat concreta: la model card no especifica formato de prompt, lo que obliga a inferirlo del modelo base.
- Model card mínima: generada automáticamente, sin información sobre sesgos, datos de entrenamiento detallados ni limitaciones declaradas por el autor del ajuste fino.
- Contexto: los 512K se citan en una fuente secundaria (LLM Reference) y no están confirmados en la documentación oficial; la validación práctica documentada llega a 131K tokens.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/K2-Horizon-3.7B-Claude-Opus-Reasoning-Distilled-GGUF
- Versión con matrices de importancia (i1): https://huggingface.co/mradermacher/K2-Horizon-3.7B-Claude-Opus-Reasoning-Distilled-i1-GGUF
- Modelo base del ajuste fino: https://huggingface.co/xtools-at/K2-Horizon-3.7B-Claude-Opus-Reasoning-Distilled
- Modelo original de IFM: https://huggingface.co/IFM/K2-Horizon-3.7B
- Cuantizaciones del modelo original: https://huggingface.co/mradermacher/K2-Horizon-3.7B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#K2-Horizon-3.7B-Claude-Opus-Reasoning-Distilled-GGUF
- Receta de despliegue en llama.cpp (RTX 5090, contexto 131K): https://github.com/abtraore/K2-BLACKWELL/tree/main/recipes/k2-horizon-3.7b-gguf
- Ficha de referencia del modelo: https://www.llmreference.com/model/k2-horizon-3.7b
- Dataset TeichAI/Claude-Opus-4.6-Reasoning-887x: https://huggingface.co/datasets/TeichAI/Claude-Opus-4.6-Reasoning-887x
- Dataset TeichAI/claude-4.5-opus-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset TeichAI/claude-sonnet-4.5-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/claude-sonnet-4.5-high-reasoning-250x
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Peticiones y FAQ del cuantizador: https://huggingface.co/mradermacher/model_requests
