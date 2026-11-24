# mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized`, un fine-tune sin censura (uncensored) derivado de la familia Qwen3.6. El trabajo de cuantización lo firma mradermacher, un actor habitual en la distribución de pesos GGUF para llama.cpp, y el resultado es un conjunto de ficheros que van desde Q2_K (13,3 GB) hasta Q8_0 (37,9 GB), además de dos variantes del proyector multimodal (`mmproj`) que confirman que el modelo base conserva capacidades de visión.

El modelo declarado tiene 35.505.251.456 parámetros totales según los safetensors del repositorio base, lo que encaja con la nomenclatura "35B-A3B": aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token, es decir, una arquitectura de mezcla de expertos (MoE) dispersa. Esa relación de activación hace que el coste computacional por token sea mucho menor que el de un modelo denso del mismo tamaño, aunque el requisito de memoria viene dominado por el total de parámetros.

La relevancia de esta ficha es práctica: es una de las pocas vías disponibles para ejecutar un modelo de 35B con activación dispersa en hardware de consumo, gracias a las cuantizaciones de 4 bits (20-22 GB) que caben en GPUs de 24 GB. El sesgo "uncensored" implica que el alineamiento de seguridad ha sido reducido o eliminado, lo que condiciona por completo su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) derivada de la familia Qwen3.6; el repositorio no documenta el detalle de capas ni el número de expertos |
| Parametros totales | 35.505.251.456 |
| Parametros activos | aproximadamente 3.000 millones por token, según la nomenclatura "A3B" (dato no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; proyector multimodal en Q8_0 y f16; existen cuantizaciones con imatrix en el repositorio `-i1-GGUF` |
| Idiomas soportados | inglés (`en`) según la model card; el resto no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors |
| Tamaño del repositorio | 244,4 GB |
| Cuantización más pequeña | Q2_K, 13,3 GB |
| Cuantización recomendada por el autor | Q4_K_S (20,5 GB) y Q4_K_M (21,8 GB), marcadas como "fast, recommended" |
| Cuantización de mayor calidad | Q8_0, 37,9 GB |
| Proyector multimodal | `mmproj-Q8_0` (0,7 GB) y `mmproj-f16` (1,0 GB) |
| Librería declarada | transformers (los GGUF se consumen con llama.cpp u otros runtimes compatibles) |
| Descargas | 796 |
| Fecha de creación | 2026-09-03 |
| Última actualización | 2026-10-07 |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) de tipo transformer, heredada del linaje Qwen3.6. La designación "35B-A3B" indica 35.000 millones de parámetros almacenados y unos 3.000 millones activados por token, lo que sitúa al modelo en la estela de diseños como Qwen3-30B-A3B o Qwen3-235B-A22B, donde el enrutador selecciona un subconjunto de expertos por capa y token. El repositorio no publica el número de expertos, el número de expertos activos ni la dimensión de las capas, por lo que esos detalles deben considerarse no disponibles.

Sobre el entrenamiento no hay información verificable. El nombre "Genesis-Hermes-V12" sugiere una cadena de fine-tunes sucesivos (posiblemente con datos estilo Hermes, orientados a instrucciones y formato conversacional) y el calificativo "Uncensored" indica que se ha aplicado un proceso de desalineamiento o "abliteration" sobre el modelo original, pero la model card no documenta el corpus, el número de tokens, ni si hubo RLHF, DPO o cualquier otra etapa de preferencia. El autor de la cuantización se limita a declarar que son cuantizaciones estáticas del modelo base, sin aportar detalles de entrenamiento.

La innovación técnica relevante aquí no está en el modelo sino en el empaquetado: mradermacher ofrece cuantizaciones estáticas con la opción de versiones ponderadas con imatrix en un repositorio separado (`-i1-GGUF`), que suelen preservar mejor la perplejidad a igual tamaño. La presencia de ficheros `mmproj` confirma que el modelo base incluye una torre visual, de modo que las cuantizaciones pueden usarse para inferencia multimodal si el runtime lo soporta.

## Capacidades

- Generación de texto conversacional multi-turno, con formato de chat heredado del linaje Hermes.
- Razonamiento y respuesta a instrucciones, presumiblemente con capacidad de modo "thinking" si el Qwen3.6 subyacente lo incorpora (no confirmado en la documentación disponible).
- Capacidades multimodales: los ficheros `mmproj` indican soporte de entrada de imagen, aunque el alcance exacto (VQA, OCR, descripción) no está documentado.
- Generación de código y matemáticas: capacidad esperable por la familia base, sin benchmarks publicados que la cuantifiquen.
- Respuestas sin rechazo por contenido: el ajuste "uncensored" elimina o reduce las negativas de seguridad del modelo original.
- Soporte de tool calling y function calling: no disponible en la documentación; depende de la plantilla de chat del modelo base.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente.
- Multilingüismo: la model card solo declara inglés; el comportamiento en castellano no está verificado.

## Casos de uso

- Experimentación en local con modelos de gran tamaño: gracias a las cuantizaciones Q4_K_S y Q4_K_M (20,5 y 21,8 GB), el modelo puede ejecutarse en una GPU de 24 GB con llama.cpp, algo imposible con un denso de 35B en el mismo presupuesto de memoria.
- Investigación sobre alineamiento y desalineamiento: el ajuste "uncensored" lo convierte en un sujeto de estudio útil para medir cómo varía la tasa de rechazo y la toxicidad entre el modelo original y su versión sin censura, usando el mismo prompt set en ambos.
- Evaluación de cuantizaciones: el repositorio ofrece once niveles de cuantización más un conjunto imatrix paralelo, lo que permite estudiar la degradación de perplejidad y calidad conversacional de Q2_K a Q8_0 sobre un mismo modelo MoE.
- Prototipado de asistentes conversacionales con visión: cargando el GGUF junto con `mmproj-Q8_0`, se puede construir un pipeline local de preguntas y respuestas sobre imágenes sin depender de APIs externas.
- Generación de texto creativo sin filtros editoriales: para proyectos de ficción, guiones o narrativa que requieran contenido adulto o temáticas sensibles, el modelo evita las negativas que introduciría un modelo alineado.
- Docencia y demostraciones de arquitecturas MoE: con 3.000 millones de parámetros activos, el modelo ilustra en hardware asequible el comportamiento de un transformer disperso de 35B, incluyendo el efecto del enrutamiento en latencia y memoria.
- Fine-tuning posterior sobre dominio: el modelo base en safetensors (35B) sirve como punto de partida para ajustes con LoRA en tareas específicas, y las cuantizaciones permiten validar rápidamente el resultado antes de invertir en entrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se aportan datos del modelo base `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized`. No se deben inferir cifras a partir del nombre del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el contexto y los buffers de cómputo. En la práctica, Q2_K (13,3 GB) requiere unos 15-16 GB; Q4_K_M (21,8 GB) requiere unos 23-24 GB; Q8_0 (37,9 GB) requiere 40 GB o más.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_S y Q4_K_M; A100 40 GB, L40S 48 GB o H100 80 GB para Q6_K y Q8_0; A100 80 GB o H100 para fp16 sin cuantizar.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 4080 Super (16 GB) con Q2_K o Q3_K_S, aunque con contexto reducido. En GPUs de 12 GB no cabe ninguna cuantización completa.
- Despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python) son la vía natural para GGUF. vLLM y TGI soportan GGUF de forma parcial y con menos madurez; para producción a gran escala conviene usar el modelo base en safetensors con vLLM. Los ficheros `mmproj` requieren un runtime con soporte multimodal de llama.cpp.
- Latencia y throughput: no disponibles. Al ser MoE con ~3B activos, el throughput por token debería ser sustancialmente mayor que el de un denso de 35B, pero no hay mediciones publicadas en el repositorio.
- Almacenamiento: el repositorio completo ocupa 244,4 GB; conviene descargar solo el fichero GGUF necesario.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Qwen3.6-35B-A3B Uncensored, GGUF) | 35,5B | ~3B | no disponible | no disponible | GGUF |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32K nativo, 128K con YaRN | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| Qwen3-32B (denso) | 32,8B | 32,8B | 32K nativo, 128K con YaRN | Apache 2.0 | safetensors, GGUF |

La comparación con Qwen3-30B-A3B es la más directa por tamaño y ratio de activación: ambos ofrecen un coste por token de un modelo de ~3B con la calidad de uno mucho mayor, pero el modelo de esta ficha añade el ajuste sin censura y pierde la trazabilidad de licencia y benchmarks. Frente a Mixtral 8x7B, este modelo activa menos parámetros por token (3B frente a 12,9B) y almacena menos peso total, lo que se traduce en menores requisitos de VRAM. Frente a un denso de 32B, la ventaja en velocidad de inferencia es estructural, aunque el denso suele ser más predecible en calidad por token.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial permitido. Al derivar de Qwen3.6, habría que verificar la licencia del modelo original, pero el autor no la declara y el ajuste "uncensored" puede introducir restricciones adicionales.
- El ajuste "uncensored" elimina o reduce los rechazos de seguridad: el modelo puede generar contenido dañino, ilegal o sexualmente explícito sin filtros. No es apto para aplicaciones orientadas al público sin una capa de moderación externa.
- Riesgo de alucinación: no hay evaluaciones publicadas de fidelidad factual, y los fine-tunes sucesivos sobre modelos base tienden a degradar el conocimiento factual si el corpus de ajuste es pequeño o sintético.
- Idiomas: solo se declara inglés. El rendimiento en castellano es incierto y requeriría evaluación propia antes de desplegarlo.
- Contexto: la longitud de contexto no está documentada; no se debe asumir la del Qwen3.6 original sin verificarla en la configuración del GGUF.
- Trazabilidad: la cadena de derivación (Qwen3.6 → Genesis → Hermes V12 → dequantized → GGUF) incluye varias etapas sin documentación pública, lo que dificulta auditar los datos de entrenamiento.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad; el propio autor marca Q3_K_M como "lower quality". Para uso serio, el mínimo razonable es IQ4_XS o Q4_K_M.
- Repositorio de 244,4 GB: la descarga completa es costosa; hay que seleccionar el fichero concreto.
- Sin benchmarks ni evaluación de sesgos: no hay datos sobre comportamiento diferencial por género, etnia o idioma.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-GGUF
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-i1-GGUF
- Modelo base: https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V12-dequantized-GGUF
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
