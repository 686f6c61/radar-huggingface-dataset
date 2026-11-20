# grpdxr/Muse-Glimmer-30B-PL-GGUF

## Resumen

Muse-Glimmer-30B-PL-GGUF es una cuantización GGUF en precisión mixta del modelo base Muse-Glimmer-30B, publicada por el usuario grpdxr. No se trata de un fine-tune: los pesos subyacentes son los del modelo original de meta-models, y lo que aporta esta publicación es una distribución de bits por tensor ajustada mediante una importance matrix (imatrix) ponderada hacia texto polaco y trazas de razonamiento. El resultado son dos ficheros, IQ2 e IQ3, que comprimen un modelo de aproximadamente 27.850 millones de parámetros en 10,54 GB y 11,95 GB respectivamente, manteniendo un rendimiento en polaco próximo al de una cuantización Q4 convencional.

El interés técnico de esta ficha radica en la gestión de memoria: gracias a que tres de cada cuatro capas emplean una ventana deslizante de 2048 tokens y el modelo solo tiene 2 cabezas KV, la caché KV crece muy poco con el contexto. Según el autor, es posible servir dos slots paralelos de 64K tokens en 10.873 MiB de VRAM con el fichero IQ2, lo que permite ejecutar un modelo de casi 28B parámetros en una GPU de 12 GB. El modelo está orientado a generación de texto conversacional y razonamiento en polaco e inglés, con licencia Apache 2.0.

La relevancia actual es doble: por un lado, demuestra que las técnicas de cuantización de bajo bit con imatrix específica por idioma pueden hacer viable el despliegue local de modelos de tamaño medio en hardware de consumo; por otro, la model card incluye una batería de pruebas propias (puntación en polaco, razonamiento, transcripciones) que, aunque no son benchmarks estándar, ofrecen datos concretos y reproducibles sobre la degradación introducida por la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles del modelo base no disponibles en la información proporcionada); ventana deslizante de 2048 tokens en 3 de cada 4 capas, 2 cabezas KV |
| Parametros totales | 27.854.794.240 (≈27,85B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | 64K tokens por slot (según la model card); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | GGUF IQ2 (~2,8 bits por peso) e IQ3, con precisión mixta por tensor e importance matrix |
| Idiomas soportados | Polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Muse-Glimmer-30B más allá de los datos de inferencia que reporta el cuantizador: un transformer con 2 cabezas KV y atención de ventana deslizante de 2048 tokens en tres de cada cuatro capas. Esta configuración reduce drásticamente el coste de la caché KV y es la razón por la que dos slots de 64K caben en menos de 11 GB de VRAM. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

El trabajo de esta publicación se centra en la cuantización, no en el entrenamiento. El autor aplica una importance matrix ponderada hacia texto polaco y trazas de razonamiento, y una asignación de bits por tensor (mixed-precision) que asigna más precisión a las capas sensibles. El resultado son dos ficheros: IQ2 de 10,54 GB y IQ3 de 11,95 GB. La model card reporta divergencia KL frente al modelo completo en Q8_0 como medida de fidelidad, aunque los valores numéricos de esa tabla no están completos en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en polaco e inglés.
- Razonamiento lógico y matemático: problemas de lógica, cálculo de totales de facturas, plazos legales, probabilidades y análisis de registros extensos (hasta ~10K tokens en las pruebas del autor).
- Comprensión de documentos largos en polaco: la model card reporta pruebas sobre un documento de 18.000 caracteres y sobre transcripciones de llamadas de venta de 12-16 minutos.
- Respuesta a preguntas sobre transcripciones, incluyendo premisas falsas y preguntas cuya respuesta no está en el texto.
- Soporte de contexto largo por slot: 64K tokens, con dos slots paralelos en el fichero IQ2.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con llama.cpp estándar.
- No se menciona soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Atención al cliente en polaco: el modelo puede gestionar conversaciones multi-turno con 64K tokens de contexto por slot y dos slots simultáneos en una GPU de 12 GB, lo que permite atender a dos usuarios en paralelo con historial largo sin degradar la latencia por falta de memoria.
- Análisis de documentos legales o administrativos en polaco: con 64K tokens de contexto puede procesar contratos, expedientes o normativa extensa y responder preguntas concretas; la model card reporta un 100% de acierto en preguntas sobre un documento de 18.000 caracteres en la prueba del autor.
- Resumen y extracción de información de transcripciones de llamadas: las pruebas del autor cubren 72 preguntas sobre 8 transcripciones de llamadas de venta de 12-16 minutos, incluyendo cálculos y atribución de intervenciones, lo que lo hace adecuado para control de calidad comercial.
- Asistente de razonamiento para cálculos administrativos: resolución de problemas de plazos legales, totales de facturas y probabilidades, con un rendimiento de 18,3 sobre 20 en la batería de razonamiento del autor con el fichero IQ2.
- Despliegue local en estaciones de trabajo con GPU de 12 GB: al caber en 10.873 MiB con dos slots de 64K, es viable en tarjetas como la RTX 3060 de 12 GB o la RTX 4070 Ti, sin necesidad de infraestructura en la nube.
- Generación de texto en inglés y polaco para aplicaciones de documentación o soporte interno: el modelo cubre ambos idiomas y puede integrarse vía llama.cpp en pipelines existentes con el formato GGUF.
- Prototipado e investigación sobre cuantización: los ficheros IQ2 e IQ3 con imatrix específica permiten estudiar la degradación por cuantización en un modelo de ~28B con métricas de fidelidad (KL) publicadas por el autor.

## Benchmarks y rendimiento

Los datos disponibles son pruebas propias del autor, no benchmarks estándar. Se ejecutaron en una RTX 3090 con llama.cpp b11028, caché KV q8_0, temperatura 1.0, top-p 0.95 y top-k 64.

| Modelo | Fichero | VRAM 1 slot × 64K | VRAM 2 slots × 64K | Puntuación polaco | Errores chat /100 palabras | Razonamiento (de 20) | Transcripciones (de 72) |
|---|---|---|---|---|---|---|---|
| Muse-Glimmer-30B-PL IQ2 | 10,54 GB | 10.349 MiB | 10.873 MiB | 93,5 | 0,5 | 18,3 | 71 |
| Muse-Glimmer-30B-PL IQ3 | 11,95 GB | 11.697 MiB | 12.221 MiB | 92,5 | 0,4 | 19,0 (1/40 cortado) | 68 |
| Qwen3.8-27B-PL (MTP drafter, KV q4_0) | 9,56 GB | 11.749 MiB | 14.241 MiB | 90,6 | 0,5 | 18,0 (2/120 cortado) | 71 |
| Qwen3.8-27B-PL + LoRA polaco | 9,96 GB | 12.149 MiB | 14.639 MiB | 92,5 | 0,45 | 18,5 (1/40 cortado) | 71 |
| Muse-Glimmer-30B UD-IQ3_XXS (unsloth) | 13,13 GB | 12.494 MiB | 13.019 MiB | 93 | 0,45 | 17,5 (1/40 cortado) | 70 |
| Muse-Glimmer-30B Q4_K_M | 16,76 GB | 16.281 MiB | 16.801 MiB | 97 | 0,15 | 18,5 | 69 |
| Qwen3.8-27B Q4_K_M (sin drafter) | 18,97 GB | 20.457 MiB | 23.041 MiB | 95,5 | 0,6 | 19,0 (1/40 cortado) | 71 |
| Saluki (Qwen3.8-27B IQ2 mix) | 7,90 GB | 10.513 MiB | 13.097 MiB | 89,5 | 1,7 | ~13 (1/17 cortado) | 71 |
| Bielik-11B-v3.0-Instruct Q8_0 | 11,87 GB | 15.100 MiB (1 × 32K) | 18.630 MiB (2 × 32K) | 87,5 | 0,3 | 4,5 (3/80 cortado) | 66 |
| Bielik-11B-v3.0-Instruct Q4_K_M | 6,72 GB | 10.256 MiB (1 × 32K) | 13.800 MiB (2 × 32K) | 85,5 | 0,2 | 3,3 (3/80 cortado) | 66 |
| PLLuM-12B-chat-2512 Q8_0 | 13,1 GB | 17.842 MiB | 23.544 MiB | 80 (3/84 cortado) | 0,15 | 1,5 (3/80 cortado) | 58 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 10.349 MiB con un slot de 64K y 10.873 MiB con dos slots de 64K para el fichero IQ2; 11.697 MiB y 12.221 MiB respectivamente para el IQ3, medidos en una RTX 3090 con llama.cpp.
- GPU recomendadas: RTX 3090 (medición del autor), RTX 4090, A100 o H100 para mayor throughput. El IQ2 cabe en GPUs de 12 GB como la RTX 3060 12 GB o la RTX 4070 Ti; el IQ3 requiere algo más de margen.
- Cabe en GPU de consumo: sí, el IQ2 en tarjetas de 12 GB; el IQ3 en tarjetas de 12 GB con poco margen o en 16 GB con holgura.
- Opciones de despliegue: llama.cpp (versión b11028 o superior según las pruebas del autor), compatible con endpoints; no se mencionan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Puntuación polaco | Razonamiento (de 20) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Muse-Glimmer-30B-PL IQ2 | ~27,85B | 64K por slot | 93,5 | 18,3 | Apache 2.0 | GGUF en Hugging Face |
| Muse-Glimmer-30B Q4_K_M | ~27,85B | no disponible | 97 | 18,5 | Apache 2.0 (modelo base) | GGUF en Hugging Face |
| Qwen3.8-27B-PL | ~27B | no disponible | 90,6 | 18,0 | no disponible | GGUF en Hugging Face |
| Bielik-11B-v3.0-Instruct Q8_0 | 11B | 32K | 87,5 | 4,5 | no disponible | GGUF en Hugging Face |
| PLLuM-12B-chat-2512 Q8_0 | 12B | no disponible | 80 | 1,5 | no disponible | GGUF en Hugging Face |

La comparativa se basa exclusivamente en las pruebas del autor sobre las mismas máquinas y configuración, por lo que los valores son comparables entre sí pero no con leaderboards externos.

## Limitaciones y advertencias

- Las puntuaciones de la model card son pruebas propias del autor, no benchmarks estándar; no deben compararse con resultados de leaderboards ni de otras model cards.
- La cuantización IQ2 introduce degradación respecto al modelo completo: la puntuación en polaco baja de 97 (Q4_K_M) a 93,5, y los errores de lenguaje en chat suben de 0,15 a 0,5 por 100 palabras.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de tasas de alucinación en la información disponible.
- El soporte de idiomas se limita a polaco e inglés según la model card; el rendimiento en castellano u otros idiomas no está documentado.
- Algunas respuestas de razonamiento se cortaron por límite de tokens (1 de 40 en IQ3, 2 de 120 en Qwen3.8-27B-PL), lo que indica que presupuestos de generación insuficientes pueden degradar los resultados.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Muse-Glimmer-30B de meta-models, no detallada en la información proporcionada.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- El modelo está pensado para llama.cpp; no se confirma compatibilidad con otros motores de inferencia.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/grpdxr/Muse-Glimmer-30B-PL-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Cuantización comparable del mismo autor (Qwen3.8-27B-PL): https://huggingface.co/grpdxr/Qwen3.8-27B-PL-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
