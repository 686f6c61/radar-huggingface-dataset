# John-Machado/gpt2-small-fineweb-edu

## Resumen

`John-Machado/gpt2-small-fineweb-edu` es un GPT-2 small de 124.439.808 parámetros entrenado desde cero (pesos aleatorios) por John Machado sobre 9.854.302.149 tokens del subconjunto `sample-10BT` del dataset FineWeb-Edu. No es un ajuste fino del GPT-2 de OpenAI: es un reentrenamiento completo de la arquitectura original de 2019 con un corpus educativo web moderno, usando una implementación de GPT-2 escrita a mano en PyTorch publicada en GitHub.

El interés del modelo es doble. Por un lado, sirve como referencia reproducible de un pipeline de entrenamiento completo a escala pequeña: 18.794 pasos, una sola pasada sobre los datos, AdamW con warmup y decaimiento coseno, bf16, FlashAttention vía `torch.nn.functional.scaled_dot_product_attention` y `torch.compile`, todo ejecutado en una única A100 de 40 GB durante 15,6 horas a ~176.000 tokens/s. Por otro, supera al GPT-2 small original en el conjunto de validación de FineWeb-Edu (perplejidad 21,2 frente a 27,0), lo que lo convierte en una alternativa algo mejor que el GPT-2 clásico para continuar texto con estilo de página educativa en inglés.

Es, sin embargo, un modelo base de 124M con contexto de 1024 tokens y solo inglés: no está alineado con instrucciones, no responde preguntas de forma fiable y alucina hechos con soltura. Su utilidad real está en docencia, experimentación, generación de texto en entornos con recursos mínimos y como punto de partida para ajustes finos ligeros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2: 12 capas, dimensión 768, 12 cabezas de atención, embeddings de entrada/salida atados |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible: el repo solo publica pesos safetensors; no hay versiones GGUF/AWQ/GPTQ oficiales |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT (pesos y código) |
| Formato de pesos | safetensors, cargable con `transformers` (`AutoModelForCausalLM`); tamaño del repo 0,5 GB |
| Tokenizador | GPT-2 de OpenAI (BPE) |
| Dataset de entrenamiento | `HuggingFaceFW/fineweb-edu`, subconjunto `sample-10BT` (revisión `87f09149ef4734204d70ed1d046ddc9ca3f2b8f9`) |

## Arquitectura y entrenamiento

La arquitectura es exactamente la de GPT-2 small: 12 bloques transformer decoder-only con atención multi-cabeza causal, pre-normalización con LayerNorm, FFN de 3072 unidades y proyección de embeddings atada a la cabeza de salida. El tokenizador es el BPE de GPT-2 de OpenAI. No hay mezcla de expertos, ni atención lineal, ni decodificación especulativa: es un transformer denso convencional con atención cuadrática limitada a 1024 posiciones.

El entrenamiento consumió 9.854.302.149 tokens leídos una sola vez y en orden, en 18.794 pasos de 524.288 tokens cada uno (micro-lote 16 × 32 de acumulación × 1024). Optimizador AdamW con betas (0,9, 0,95), weight decay 0,1 solo sobre pesos 2-D y recorte de norma de gradiente a 1,0; learning rate con warmup lineal de 715 pasos hasta 6e-4 y decaimiento coseno hasta 6e-5, siguiendo los hiperparámetros que el paper de GPT-3 usa para su modelo de 125M. Sin dropout (0,0). Precisión mixta bf16 con autocast, TF32, atención fusionada mediante SDPA y `torch.compile`. Todo el run se ejecutó en una NVIDIA A100 de 40 GB en Google Colab Pro+, con un coste de 15,6 horas. La pérdida final de entrenamiento fue ~3,0 y la de validación intra-entrenamiento 3,0113 sobre los primeros 327.680 tokens reservados. No se aplicó RLHF, DPO ni ningún tipo de alineación posterior; tampoco hay fase SFT.

## Capacidades

- Generación de texto autoregresiva en inglés: continuación de prompts con estilo de texto educativo o enciclopédico.
- Modelo base sin ajuste por instrucciones: nomantiene diálogos ni responde preguntas de forma fiable, solo continúa secuencias.
- Contexto de 1024 tokens, suficiente para párrafos o secciones cortas, no para documentos largos.
- Capacidad de code completion muy limitada y no evaluada: no hay datos de entrenamiento específicos de código declarados.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente, razonamiento multi-paso planificado ni modo "thinking".
- Sin visión, audio ni multimodalidad.
- Multilingüismo: únicamente inglés; no se declaran otros idiomas ni se han evaluado.
- Punto de partida válido para ajuste fino supervisado y para experimentos de destilación o ablación a pequeña escala.

## Casos de uso

- Docencia y aprendizaje de transformers: el repositorio de GitHub incluye el modelo, el bucle de entrenamiento y los scripts con cada peso y cada paso nombrados, lo que permite recorrer un entrenamiento real de 124M extremo a extremo en una sola GPU.
- Generación de texto educativo sintético: al estar entrenado sobre FineWeb-Edu, produce continuaciones con registro de página didáctica, útil para aumentar corpus de dominio educativo antes de filtrar con un modelo mayor.
- Réplica de experimentos de escalado: sirve como baseline de 125M con hiperparámetros de GPT-3 para comparar curvas de pérdida frente a variantes propias (distintas tasas de aprendizaje, longitudes de contexto o composiciones de datos).
- Pruebas de infraestructura de inferencia: con 0,5 GB de repo y ~124M de parámetros es un modelo ideal para validar pipelines de TGI, endpoints compatibles o servidores propios sin consumir GPU de forma significativa.
- Generación de texto en hardware muy limitado: cabe en CPU, en GPUs integradas y en dispositivos de 2 GB de VRAM, lo que permite demos offline o entornos sin acelerador.
- Ajuste fino para clasificación o etiquetado de textos educativos: con 124M de parámetros, un fine-tuning sobre unas pocas decenas de miles de ejemplos cabe en una GPU consumer de 8-12 GB.
- Comparación de calidad de datos: al haberse entrenado sobre una única pasada de FineWeb-Edu, sirve para medir el efecto de ese corpus frente a WebText en una arquitectura idéntica.

## Benchmarks y rendimiento

Evaluación sobre los 99.631.104 tokens del 1 % reservado de FineWeb-Edu (cada página 100), nunca vistos en entrenamiento:

| Modelo | Pérdida de validación (menor es mejor) | Perplejidad |
|---|---|---|
| `John-Machado/gpt2-small-fineweb-edu` | 3,0548 | 21,2 |
| GPT-2 small de OpenAI (2019) | 3,2975 | 27,0 |

Adicionalmente, la pérdida de validación intra-entrenamiento fue de 3,0113 sobre los primeros 327.680 tokens reservados, y la pérdida de entrenamiento final quedó en ~3,0.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra batería estándar en la información disponible. La comparación anterior debe interpretarse con cautela: FineWeb-Edu es el dominio nativo de este modelo, mientras que el GPT-2 original se entrenó sobre WebText, por lo que la ventaja mide ajuste al registro educativo web, no capacidad general.

## Requisitos de hardware

- VRAM estimada para pesos: ~0,50 GB en fp32, ~0,25 GB en bf16/fp16, ~0,12 GB en int8 y ~0,07 GB en int4 (cálculo a partir de los 124,4M de parámetros, no publicado por el autor).
- VRAM práctica para inferencia: menos de 1 GB en bf16 incluyendo caché KV para 1024 tokens y overhead del runtime; 1-2 GB en fp32.
- Cabe en cualquier GPU consumer: RTX 4090, 3090, 4080, 3060, GTX 1660, e incluso en CPU o GPUs integradas con llama.cpp u ONNX Runtime.
- GPU de referencia usada en entrenamiento: una A100 de 40 GB, con un throughput de ~176.000 tokens/s y 15,6 horas para 9,85B de tokens.
- Despliegue: `transformers` de forma nativa; el repo está etiquetado como compatible con Text Generation Inference y con endpoints, por lo que puede servirse con TGI. Para llama.cpp, Ollama o vLLM sería necesaria una conversión a GGUF o una compilación específica, no publicada por el autor.
- Latencia y throughput de inferencia: no disponibles en la información proporcionada (los ~176.000 tokens/s son una métrica de entrenamiento, no de generación).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pérdida / perplejidad en validación FineWeb-Edu | Disponibilidad |
|---|---|---|---|---|---|
| `John-Machado/gpt2-small-fineweb-edu` | 124,4M | 1024 | MIT | 3,0548 / 21,2 | HuggingFace, safetensors |
| GPT-2 small de OpenAI (2019) | 124M (según model card) | 1024 (según model card) | no disponible en la información | 3,2975 / 27,0 | HuggingFace (`gpt2`) y API histórica |
| GPT-2 medium de OpenAI | 355M | 1024 | no disponible en la información | no disponible | HuggingFace |
| DistilGPT-2 | 82M | 1024 | no disponible en la información | no disponible | HuggingFace |

No se dispone de datos de benchmarks comunes (MMLU, HumanEval, GSM8K) para ninguno de estos modelos en la información proporcionada, por lo que la comparación se limita a la pérdida de validación sobre FineWeb-Edu, que solo está medida para los dos primeros.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones ni mantiene conversaciones; usarlo como asistente produce resultados pobres.
- No es una fuente fiable de hechos: la propia model card documenta invenciones como atribuir Montreal a Canadá o Sídney a Australia como capitales, y mezclar a Napoleón III con el compositor Meyerbeer en un texto sobre la Revolución Francesa.
- Solo inglés y solo registro de web educativa; el rendimiento fuera de ese dominio (literatura, código, conversación, otros idiomas) no está evaluado y previsiblemente será peor.
- Ventana de contexto de 1024 tokens: no admite documentos largos ni tareas de recuperación sobre contexto extenso.
- Sesgos y errores heredados de Common Crawl y de FineWeb-Edu: el filtro educativo no elimina sesgos de representación ni desinformación presente en las páginas.
- Entrenamiento de una sola pasada y sin repetición de datos: no hay garantía de que el corpus se haya visto de forma equilibrada por dominio o temática.
- Licencia MIT para pesos y código, lo que permite uso comercial; sin embargo, los datos de entrenamiento son FineWeb-Edu (ODC-By 1.0) y su uso está sujeto además a las condiciones de Common Crawl, y el tokenizador proviene de OpenAI. Conviene revisar esas capas antes de un despliegue comercial.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación externa ni reportes de terceros sobre su comportamiento en producción.
- No hay versiones cuantizadas oficiales ni artefactos GGUF publicados, lo que añade un paso de conversión si se despliega fuera de `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/John-Machado/gpt2-small-fineweb-edu
- Repositorio de código e implementación desde cero: https://github.com/JohnMachado11/GPT-2
- Instrucciones de reproducción del entrenamiento: https://github.com/JohnMachado11/GPT-2#train-gpt-2-small-from-scratch
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Referencia de la arquitectura: Radford et al., 2019, "Language Models are Unsupervised Multitask Learners" (citado en la model card, sin URL en la información disponible)
- Búsqueda web: no se han encontrado enlaces adicionales relevantes al modelo; los resultados devueltos corresponden a homónimos del nombre del autor (John) y no guardan relación con este trabajo.
