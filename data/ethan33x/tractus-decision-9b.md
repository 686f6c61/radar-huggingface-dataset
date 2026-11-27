# Ethan33X/Tractus-decision-9B

## Resumen

Tractus-decision-9B es un modelo de decisión de un solo paso (single-pass) desarrollado por Ethan33X y ajustado a partir de Qwen/Qwen3.5-9B-Base. Su planteamiento es distinto al de un modelo generativo convencional: dado un estado de entrada (texto, JSON estructurado, tablas o contexto multimodal) y un conjunto de entre 2 y 255 opciones candidatas, devuelve una distribución de probabilidad calibrada sobre esas opciones en una única pasada de prefill y con cero tokens generados. Elimina así la latencia de decodificación autorregresiva, que es justamente el cuello de botella de los modelos de razonamiento en tareas de clasificación y enrutamiento.

La arquitectura hereda el backbone híbrido de Qwen3.5: 32 capas (24 Gated DeltaNet y 8 Gated Attention), 4.096 dimensiones ocultas, 12.288 de FFN, vocabulario de 248.320 tokens y una ventana de contexto nativa de 262.144 tokens. El modelo totaliza 8.953.803.264 parámetros reales según safetensors (9,24B declarados por el autor, de los cuales 8,12B corresponden al backbone sin embeddings). La innovación central es el mecanismo de lectura que el autor denomina Thermostasis: softcapping de logits con tanh (C = 30,0), centrado de suma cero y un termostato analítico 2D sin escalares de temperatura ajustados por validación.

Es relevante ahora porque ataca un problema práctico de producción: los pipelines de agentes y enrutamiento necesitan decidir entre opciones discretas (herramienta, intención, ruta, siguiente acción) con latencia de milisegundos y sin coste de generación. El autor reporta 47,4 ms de prefill en plantilla única frente a los 26,00 s de Qwen3.5-9B en modo Think sobre la misma suite, lo que sitúa al modelo en otra categoría de latencia. La licencia es MIT modificada con niveles comerciales/MaaS propios y aviso Apache-2.0 de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 32 capas (24 Gated DeltaNet + 8 Gated Attention), vision-language |
| Parametros totales | 8.953.803.264 (9,24B declarados; 8,12B sin embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | BF16 (18,5 GB) e INT4 (6,1 GB) documentados; otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | MIT modificada (modified-mit), con niveles comerciales/MaaS Tractus y aviso Apache-2.0 de Qwen3.5 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B-Base, un backbone unificado de visión y lenguaje con arquitectura híbrida en proporción 3:1 entre capas Gated DeltaNet y Gated Attention. Las dimensiones son 4.096 (hidden) y 12.288 (FFN), con vocabulario de 248.320 tokens y contexto nativo de 262.144 tokens. La ventaja del componente DeltaNet es que reduce a la cuarta parte la memoria de la caché KV en BF16 a 256K (de 34,36 GB a 8,59 GB) y permite reutilizar el 100% del prefijo KV de prefill sin recálculo al escalar a un modo de razonamiento en dos fases.

El post-entrenamiento convierte el modelo base en un clasificador de decisiones: en lugar de proyectar sobre el vocabulario completo (248.320 vías), la cabeza de lectura es un 99,9% más pequeña y puntúa las claves de las opciones candidatas en la posición terminal. La calibración se realiza mediante Thermostasis: un desplazamiento binario previo opcional, softcapping tanh de logits con C = 30,0, centrado de suma cero y un termostato analítico e de 2D sin parámetros ajustados. El autor indica que los dos priors binarios estáticos (+3,2 para alucinación en RAGTruth y -0,75 para phishing en PhishNChips) solo se activan en Decision Index 0.3 y valen 0 en los otros nueve benchmarks principales y en el conjunto OOD de 19.887 elementos. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Decisión single-pass sobre 2 a 255 opciones candidatas con cero tokens generados y distribución de probabilidad calibrada.
- Entrada multimodal: texto, JSON estructurado, tablas, layouts de interfaz y estados espaciales, gracias al backbone vision-language de Qwen3.5.
- Clasificación y enrutamiento (routing) de intenciones, herramientas y rutas.
- Calibración de confianza explícita, con métricas de ECE reportadas por el autor.
- Soporte de contexto largo de hasta 262.144 tokens con caché KV reducida 4× en BF16.
- Reutilización del prefijo KV de prefill sin recálculo al escalar a un modo de razonamiento en dos fases (System 2).
- Capacidades de razonamiento causal medidas en JevBench 231.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada más allá de la escalada a System 2.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking: no disponible en esta variante (la variante dual-mode Tractus-9B cubre System 1 + System 2).

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: el modelo recibe el turno del usuario y un conjunto de intenciones candidatas y devuelve la distribución calibrada en una sola pasada, lo que permite derivar a un agente humano o a un flujo automatizado con latencia de decenas de milisegundos.
- Selección de herramienta en pipelines de agentes: dado el estado de la conversación y el catálogo de funciones disponibles (hasta 255), el modelo elige la función adecuada sin generar texto, lo que reduce el coste por decisión y evita errores de parseo.
- Moderación y clasificación de riesgo: con los priors documentados para alucinación (RAGTruth) y phishing (PhishNChips) en Decision Index 0.3, se puede usar como filtro previo en sistemas RAG y en detección de fraude, siempre que se valide el umbral en el dominio propio.
- Navegación web automatizada: el autor reporta 88,00% en Mind2Web; el modelo puede puntuar elementos de interfaz candidatos a partir de un layout y elegir la acción siguiente, integrándose en agentes de navegador.
- Triaje de documentos y búsqueda: con 63,12% en Amazon ESCI y 76,00% en PubMedQA, sirve para clasificar la relevancia de resultados y para responder preguntas de dominio biomédico sobre opciones predefinidas.
- Enrutamiento en sistemas de reuniones full-duplex: el demo Meeting Sentinel del autor usa el modelo para decidir si intervenir en una conversación en curso, con un SLA de 300 ms en los demos.
- Decisión espacial multiagente: el demo JevBall con 22 agentes bajo SLA de 300 ms ilustra el uso en dinámicas espaciales donde cada agente decide su acción en un único paso.
- Clasificación con contexto muy largo: gracias a los 256K tokens y a la caché KV reducida, se puede clasificar documentación extensa o ledgers JSON completos sin truncar.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| Decision Index 0.3 | Balanced Skill | 46,03 |
| Decision Index 0.3 | Balanced Raw Accuracy | 59,32% |
| JevBench 231 | Overall Accuracy (single-pass Tractus-decision) | 79,22% (183/231) |

Resultados adicionales citados en la model card para la Matched Commercial Suite (831 elementos, 256K, prefill de orden único):

| Benchmark / métrica | Tractus-decision-9B | Referencia Qwen3.5-9B (Think) |
|---|---|---|
| Latencia de prefill (plantilla única) | 47,4 ms | 26,00 s (2.925 tokens medios) |
| Fallos de parseo | 0 | 44 |
| Mind2Web | 88,00% | no disponible |
| Pooled Top-1 ECE (raw) | 2,45% | no disponible |
| Amazon ESCI | 63,12% | no disponible |
| New Yorker Caption | 78,00% | no disponible |
| PubMedQA | 76,00% | no disponible |
| JevBench | 80,52% | no disponible |
| JevBench (variante dual-mode Tractus-9B) | 88,74% / 92,21% | no disponible |
| When2Call (variante dual-mode) | 84,00% | no disponible |
| ECE (Gap-Only, 7,22 s) | 2,80% raw / 2,69% OOF | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: 18,5 GB en BF16 y 6,1 GB en INT4 según la model card.
- GPU recomendadas: el autor menciona hardware de una sola GPU con BF16 para las mediciones; no especifica modelos concretos. Por memoria, una RTX 4090 (24 GB) cubre BF16 e INT4; una A100 o H100 permiten mayor paralelismo y lotes mayores.
- Cabe en GPU de consumo: sí, en INT4 en tarjetas de 8 GB o más y en BF16 en tarjetas de 24 GB o más.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles (tag endpoints_compatible) y MLX INT4 en Apple Silicon Metal, según los demos del autor. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: 47,4 ms de prefill en plantilla única y 0,14 s con 3 plantillas secuenciales, batch=1, mediana en GPU única BF16; 0,69 s de mediana secuencial en la variante dual-mode y 7,22 s en modo Gap-Only.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tractus-decision-9B | 8,95B (9,24B declarados) | 262.144 | Decisión single-pass, 0 tokens generados | MIT modificada | Hugging Face |
| Tractus-9B (dual-mode) | 9,24B declarados | 262.144 | System 1 + System 2 con reutilización de prefijo KV | MIT modificada | Hugging Face |
| Qwen3.5-9B-Base | 9B (aprox.) | 262.144 | Generación autorregresiva vision-language | Apache-2.0 | Hugging Face |
| Qwen3.5-9B (Think) | 9B (aprox.) | 262.144 | Razonamiento generativo con decodificación | Apache-2.0 | Hugging Face |

La comparación de rendimiento entre Tractus-decision-9B y Qwen3.5-9B (Think) solo está disponible para latencia, tokens generados y fallos de parseo en la Matched Commercial Suite; no hay datos comparativos de MMLU, HumanEval ni GSM8K en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés declarado; el uso en castellano u otros idiomas no está validado por el autor.
- Es un modelo de decisión, no un generador de texto libre: no produce respuestas abiertas, solo distribuciones sobre opciones candidatas.
- Los benchmarks del model-index están marcados como no verificados; los resultados de la Matched Commercial Suite son declaraciones del autor sin replicación independiente.
- Los priors binarios de alucinación y phishing solo están activos en Decision Index 0.3 y podrían no generalizar a otros dominios; el autor indica que valen 0 en el resto de benchmarks.
- Riesgo de alucinación y sesgo: no se documentan análisis específicos de sesgo en la información disponible; la calibración reportada (ECE en torno al 2,45-2,80%) es agregada y puede degradarse fuera de la distribución evaluada.
- La licencia MIT modificada incluye niveles comerciales y de MaaS propios; es necesario revisar el archivo LICENSE antes de un uso comercial en producción.
- El modelo hereda las limitaciones del backbone Qwen3.5-9B-Base, incluidos los posibles sesgos de sus datos de preentrenamiento, no detallados en la información disponible.
- El rendimiento depende del formato de las opciones candidatas y de la plantilla de prefill; el autor reporta variaciones entre plantilla única (47,4 ms) y tres plantillas secuenciales (0,14 s).
- No hay información sobre soporte en vLLM, llama.cpp u otros motores de inferencia más allá de transformers y MLX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ethan33X/Tractus-decision-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Variante dual-mode: https://huggingface.co/Ethan33X/Tractus-9B
- Variante 0.8B: https://huggingface.co/Ethan33X/Tractus-decision-0.8B
- Variante 2B: https://huggingface.co/Ethan33X/Tractus-decision-2B
- Variante 4B: https://huggingface.co/Ethan33X/Tractus-decision-4B
- Dataset Decision Index 0.3: https://huggingface.co/datasets/Ethan33X/tractus-decision-index-0.3
- Licencia: https://huggingface.co/Ethan33X/Tractus-decision-9B/blob/main/LICENSE
