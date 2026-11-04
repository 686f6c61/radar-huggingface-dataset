# mradermacher/Frugal-Math-30B-A3B-stage-1-GGUF

## Resumen

Frugal-Math-30B-A3B-stage-1-GGUF es la versión cuantizada en formato GGUF del modelo Frugal-Math-30B-A3B-stage-1-GSPO, desarrollado por MBZUAI-Paris y distribuido por el usuario mradermacher. Se trata de un modelo de lenguaje especializado en matemáticas con arquitectura Mixture of Experts (MoE), identificable por el sufijo A3B (aproximadamente 3 mil millones de parámetros activos) sobre un total de 30.532.122.624 parámetros. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base fue entrenado con GSPO (Group Sequence Policy Optimization), una técnica de optimización por refuerzo, y pertenece a la familia Frugal de MBZUAI-Paris, orientada a obtener capacidades matemáticas competitivas con un coste computacional reducido gracias a la activación dispersa de expertos. La versión cuantizada de mradermacher ofrece 11 variantes de cuantización estática, desde Q2_K (11,4 GB) hasta Q8_0 (32,6 GB), lo que facilita el despliegue en estaciones de trabajo con GPUs de consumo.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores evaluar un modelo matemático MoE de 30B con activación de ~3B en entornos locales, sin necesidad de infraestructura de datacenter. No obstante, la información pública disponible es limitada: la model card del repositorio cuantizado es meramente técnica y no incluye detalles sobre entrenamiento, benchmarks ni licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; inferida del sufijo A3B y del nombre del modelo base |
| Parámetros totales | 30.532.122.624 |
| Parámetros activos | Aproximadamente 3B (indicado por el sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Frugal-Math-30B-A3B-stage-1-GSPO, de MBZUAI-Paris. La nomenclatura indica una arquitectura Mixture of Experts con aproximadamente 30B parámetros totales y ~3B activos por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamaño. El sufijo GSPO hace referencia a Group Sequence Policy Optimization, un método de optimización por refuerzo empleado en el entrenamiento, presumiblemente para mejorar el razonamiento matemático. El sufijo stage-1 sugiere que se trata de una primera etapa de un pipeline de entrenamiento más amplio.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO adicional, ni innovaciones técnicas específicas más allá de GSPO. La model card del repositorio cuantizado no incluye estos detalles, y no se ha proporcionado documentación del modelo base en la información disponible.

## Capacidades

- Generación de texto en inglés, con especialización declarada en matemáticas (según el nombre del modelo).
- Razonamiento matemático y resolución de problemas, presumiblemente reforzado mediante GSPO.
- Conversación multi-turno (tag conversational en HuggingFace).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos en local: el modelo puede ejecutarse con llama.cpp u Ollama en una estación de trabajo con GPU de consumo, usando cuantizaciones Q4_K_M (18,7 GB) para obtener un equilibrio entre calidad y requisitos de VRAM.
- Tutoría matemática automatizada: dado su enfoque en matemáticas, puede emplearse para explicar pasos intermedios en problemas de álgebra, cálculo o estadística, en inglés.
- Generación de datasets sintéticos matemáticos: la activación MoE de ~3B permite generar grandes volúmenes de problemas resueltos con un coste de inferencia menor que un modelo denso de 30B.
- Evaluación de pipelines de razonamiento: útil como baseline en investigación sobre optimización por refuerzo (GSPO) y su efecto en tareas matemáticas.
- Prototipado en entornos sin conexión: al ser GGUF, puede desplegarse en máquinas aisladas o edge devices con suficiente VRAM/RAM.
- Investigación sobre cuantización: las 11 variantes permiten estudiar la degradación de calidad matemática según el nivel de cuantización, desde Q2_K hasta Q8_0.
- Integración en asistentes de documentación técnica: para resolver dudas cuantitativas o derivaciones en inglés dentro de herramientas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~11,4 GB; Q3_K_S ~13,4 GB; Q3_K_M ~14,8 GB; Q3_K_L ~16,0 GB; IQ4_XS ~16,7 GB; Q4_K_S ~17,6 GB; Q4_K_M ~18,7 GB; Q5_K_S ~21,2 GB; Q5_K_M ~21,8 GB; Q6_K ~25,2 GB; Q8_0 ~32,6 GB. Añadir overhead de contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4_K_M; A100 40 GB o H100 para Q6_K y Q8_0; configuraciones multi-GPU para Q8_0.
- Cabe en consumer GPU: sí, en RTX 4090/3090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K/Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Especialidad |
|---|---|---|---|---|---|---|
| Frugal-Math-30B-A3B-stage-1 (este) | 30,5B | ~3B | no disponible | no disponible | GGUF / safetensors | Matemáticas |
| Qwen2.5-Math-7B | 7B | denso | 4K (típico) | Apache 2.0 (según versión) | safetensors / GGUF | Matemáticas |
| DeepSeek-Math-7B | 7B | denso | 4K | MIT (según versión) | safetensors / GGUF | Matemáticas |
| Mixtral-8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | safetensors / GGUF | Propósito general |

Nota: los datos de los modelos comparativos son de referencia general y pueden variar según la versión concreta; no se dispone de benchmarks del modelo Frugal para una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse presumiblemente con datos web en inglés, es esperable un sesgo hacia ese dominio.
- Riesgo de alucinación: no evaluado; los modelos matemáticos pueden generar pasos plausibles pero incorrectos, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S).
- Limitaciones de contexto o idioma: solo inglés declarado; longitud de contexto no disponible, lo que impide garantizar conversaciones largas.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar el uso comercial; es imprescindible verificar la licencia del modelo base MBZUAI-Paris/Frugal-Math-30B-A3B-stage-1-GSPO antes de producción.
- Caveats para producción: el modelo es una etapa 1 (stage-1) de un pipeline, por lo que puede no estar completamente alineado; la cuantización estática sin imatrix puede degradar la calidad matemática; el repo ocupa 208,1 GB, lo que requiere planificación de almacenamiento.
- Al ser una cuantización de terceros (mradermacher), la responsabilidad sobre la calidad final recae en el modelo base y en el proceso de cuantización.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/Frugal-Math-30B-A3B-stage-1-GGUF
- Modelo base: https://huggingface.co/MBZUAI-Paris/Frugal-Math-30B-A3B-stage-1-GSPO
- Página de descargas del cuantizador: https://hf.tst.eu/model#Frugal-Math-30B-A3B-stage-1-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
