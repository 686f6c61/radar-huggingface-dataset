# boore1/SOMA-S1

## Resumen

SOMA-S1 es un modelo de lenguaje de tipo fundacional (base, no instruido) desarrollado por Boore y orientado especificamente al idioma somali. Se presenta como un esfuerzo experimental para dotar a una lengua con escasa representacion en la investigacion moderna de IA de una base de modelado propia, entrenada desde cero en lugar de adaptar un checkpoint existente. El modelo emplea una arquitectura Transformer decoder-only con atencion de latencia multi-cabeza (MLA) y una capa feed-forward de mezcla de expertos (MoE) dispersa, con 18 expertos enrutados y uno compartido por capa, activando dos expertos enrutados por token.

Con aproximadamente 126,19 millones de parametros totales y 69,57 millones activos por token, SOMA-S1 se situa en la categoria de modelos pequenos, disenado para investigacion y experimentacion mas que para produccion. Su contexto maximo es de 2.048 tokens y su tokenizador es un BPE a nivel de byte con vocabulario de 60.000 tokens, entrenado especificamente para somali. La licencia Apache-2.0 facilita su reutilizacion y estudio.

El modelo se publica como una "research preview" y el propio autor advierte de que es un modelo base, no un asistente conversacional: genera continuaciones de texto y su calidad actual es limitada, con tendencia a la repeticion tras unas 10-20 tokens en decodificacion voraz. Es relevante ahora como referencia temprana para el desarrollo de PLN en somali y como ejemplo de arquitectura MoE+MLA de escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y Multi-head Latent Attention (MLA) |
| Parametros totales | 126,19 millones |
| Parametros activos | 69,57 millones por token (incluye parametros no enrutados y 2 expertos enrutados por capa) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Somali (so) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

SOMA-S1 es un Transformer decoder-only con atencion de latencia multi-cabeza (MLA), que comprime la representacion latente de claves y valores (rango KV latente de 128) y de queries (rango Q latente de 128), con dimensiones de cabeza QK sin PE de 32, QK con RoPE de 32 y V de 64. La capa feed-forward es una mezcla de expertos dispersa con 18 expertos enrutados y 1 compartido por capa, activando 2 expertos enrutados por token; el tamano intermedio de cada experto es de 128. El modelo tiene 12 capas, dimension oculta de 768, 12 cabezas de atencion, normalizacion RMSNorm, activacion SiLU, codificacion posicional RoPE (theta = 10.000) y embeddings atados. El vocabulario es de 60.000 tokens con tokenizador BPE a nivel de byte personalizado.

El entrenamiento se realizo desde cero sobre el Somali NLP Corpus de SOMAST, con empaquetado de secuencias, longitud de secuencia de 2.048 tokens, precision mixta BF16, entrenamiento distribuido en 2 GPUs NVIDIA con DDP, acumulacion de gradientes y planificacion de tasa de aprendizaje coseno. No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO (al ser un modelo base, no se espera alineacion por preferencias). El autor senala que el corpus requiere mejoras en cobertura, diversidad linguistica, calidad y representatividad.

## Capacidades

- Generacion de texto en somali: continuacion de texto autoregresiva, propia de un modelo base.
- Modelado de lenguaje: util para investigacion en PLN del somali y como base para fine-tuning.
- Razonamiento, codigo y matematicas: no disponible; no se documentan capacidades especificas ni evaluaciones.
- Tool calling / function calling: no soportado de forma nativa (modelo base sin instruccion).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al somali; no se documenta soporte de otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Contexto: ventana de 2.048 tokens, adecuada solo para textos cortos.

## Casos de uso

- Investigacion en PLN para somali: servir como punto de partida para estudiar tokenizacion, arquitectura MoE+MLA y comportamiento de modelos pequenos en una lengua de bajos recursos.
- Fine-tuning supervisado: usar los pesos base para adaptarlos a tareas concretas (clasificacion, extraccion, resumen) con datasets anotados en somali.
- Experimentacion con arquitecturas MoE: comparar el comportamiento de una MoE dispersa de 126 M de parametros con alternativas densas en tareas de modelado de lenguaje.
- Generacion de texto asistida en entornos de investigacion: completar fragmentos cortos en somali para estudiar coherencia, repeticion y sesgos del corpus.
- Educacion y docencia: ejemplo practico de entrenamiento desde cero, pipeline de datos, empaquetado de secuencias y entrenamiento distribuido en pocas GPUs.
- Desarrollo de tokenizadores y recursos linguisticos: reutilizar el tokenizador BPE de 60.000 tokens para otros proyectos en somali.
- Evaluacion de calidad de corpus: emplear las limitaciones observadas (repeticion, incoherencia) como senal para mejorar la curación del Somali NLP Corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 126,19 M de parametros en FP32, los pesos ocupan aproximadamente 0,5 GB; en BF16/FP16 serian unos 0,25 GB, y en cuantizaciones de 8 bits o 4 bits, menos de 0,15 GB (estimaciones teoricas, no documentadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien cabe en CPU.
- Cabe en GPU consumer: si, con amplio margen, incluso en GPUs de gama baja o en modo CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles segun los tags; no se documentan variantes GGUF para llama.cpp/Ollama.
- Latencia y throughput estimados: no disponibles; el modelo es muy pequeno, por lo que la latencia deberia ser baja, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| SOMA-S1 | 126,19 M | 69,57 M | 2.048 | Apache-2.0 | Somali, MoE + MLA, base |
| Modelos multilingues pequenos tipo Qwen2.5-0.5B | ~500 M | denso | 32.768 | Apache-2.0 | Multilingue, instruido |
| Modelos tipo TinyLlama-1.1B | ~1,1 B | denso | 2.048 | Apache-2.0 | Ingles, base/instruido |

No se dispone de comparaciones directas con modelos especializados en somali en la informacion proporcionada; los modelos de la tabla son referencias genericas de escala y no se han evaluado frente a SOMA-S1.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no sigue instrucciones ni responde preguntas de forma fiable.
- Calidad de generacion limitada: el autor advierte de repeticion tras aproximadamente 10-20 tokens en decodificacion voraz.
- Coherencia, precision factual y generacion de texto largo deficientes segun la propia model card.
- Contexto maximo de solo 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenado unicamente en somali; no se documenta soporte de otros idiomas.
- Corpus de entrenamiento con limitaciones de cobertura, diversidad y calidad; posibles sesgos derivados de las fuentes.
- Riesgo de alucinacion elevado por tratarse de un modelo pequeno y poco entrenado.
- Licencia Apache-2.0 permite uso comercial, pero la calidad actual no lo hace recomendable para produccion.
- Estado de "research preview": no apto para despliegues criticos sin validacion adicional.

## Enlaces

- HuggingFace: https://huggingface.co/boore1/SOMA-S1
- Dataset de entrenamiento (Somali NLP Corpus, SOMAST): https://huggingface.co/datasets/somast/somali-nlp-corpus
