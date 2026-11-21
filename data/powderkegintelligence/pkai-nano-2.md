# PowderKegIntelligence/PKaI-Nano-2

## Resumen

PKaI Nano 2 es un modelo de lenguaje base de tipo decoder, estilo LLaMA, desarrollado desde cero por PowderKeg Intelligence. Con 792.429.696 parámetros según la model card (841.581.696 según los pesos en safetensors), se posiciona en la categoría de 800M y sustituye a PKaI Nano 1.2, ampliando la arquitectura y duplicando la longitud de contexto hasta 2048 tokens. Emplea el tokenizador de Mistral-7B-v0.1 (SentencePiece, vocabulario de 32.000) y se distribuye como artefacto nativo PKaI, no como un paquete listo para `transformers.AutoModelForCausalLM`.

El modelo está entrenado exclusivamente en inglés sobre una mezcla de datasets públicos (FineWeb-Edu, DCLM, Cosmopedia, FineMath, Stack-Edu, Wikipedia, OpenWebMath, peS2o y PG-19) con deduplicación y descontaminación internas. No ha recibido ajuste por instrucciones ni alineamiento de seguridad; es la base sobre la que se construye la línea Nano 2, incluido el posterior PKaI Nano 2 Instruct.

Su relevancia es acotada pero clara: ofrece un checkpoint pequeño, con licencia Apache 2.0 y pesos abiertos, útil para experimentación, ajuste fino y despliegue en hardware modesto. No obstante, sus resultados en benchmarks (media de 53,18 en siete tareas de precisión) lo sitúan por debajo de modelos base de tamaño similar más consolidados, y el formato nativo PKaI añade fricción de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo LLaMA (causal LM) |
| Parametros totales | 792.429.696 (model card); 841.581.696 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (artefacto nativo PKaI, no paquete `transformers`) |

Otros datos de arquitectura recogidos en la model card: vocabulario de 32.000 tokens, 30 capas, 16 cabezas de atención, 4 cabezas KV (GQA), dimensión de embedding 1536, embeddings atados (tied embeddings) y normalización QK.

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal con atención multi-cabeza con consultas agrupadas (16 cabezas de atención y 4 cabezas KV), normalización QK y embeddings atados, lo que reduce el número de parámetros al compartir la matriz de entrada y la de salida. La longitud de contexto es de 2048 tokens, el doble que la generación anterior. El tokenizador procede de `mistralai/Mistral-7B-v0.1` (SentencePiece, 32.000 tokens).

El entrenamiento parte de cero y utiliza datos públicos: `HuggingFaceFW/fineweb-edu`, `mlfoundations/dclm-baseline-1.0-parquet`, `HuggingFaceTB/cosmopedia` (web_samples_v2, texto sintético generado con Mixtral-8x7B-Instruct), `HuggingFaceTB/finemath` (subconjunto finemath-4plus), `HuggingFaceTB/stack-edu` (solo Python y archivos con licencia permisiva), `wikimedia/wikipedia` (20231101.en), `open-web-math`, `allenai/peS2o` y texto de dominio público de PG-19. La model card indica deduplicación y descontaminación internas, pero no especifica el número total de tokens de entrenamiento, la composición exacta por porcentajes ni si se aplicaron fases de RLHF o DPO. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en inglés como modelo base (completado, continuación de documentos, generación libre).
- Razonamiento básico y conocimiento factual de nivel propio de un modelo de 800M.
- Generación de código Python, al haberse entrenado con el subconjunto Python de Stack-Edu.
- Razonamiento matemático elemental, apoyado en FineMath y OpenWebMath.
- Comprensión lectora y tareas de sentido común evaluadas en HellaSwag, PIQA, WinoGrande y ARC.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenadas.
- Multilingüe limitado: solo inglés declarado.
- Sin modo thinking, sin visión ni audio.
- Al ser un modelo base sin ajuste por instrucciones, no sigue instrucciones de forma fiable.

## Casos de uso

- Ajuste fino supervisado (SFT) para dominios concretos: al ser un base model de 800M con licencia Apache 2.0, es adecuado como punto de partida para entrenar un modelo especializado en clasificación de textos, extracción de entidades o generación de respuestas de un nicho, con coste de cómputo bajo.
- Experimentación académica en eficiencia de entrenamiento: su tamaño permite reproducir experimentos de preentrenamiento y ablaciones en una sola GPU consumer o en un nodo pequeño, sin necesidad de clúster.
- Generación de código asistida en entornos con recursos limitados: el entrenamiento con Stack-Edu (Python) permite usarlo como autocompletado o generador de fragmentos en herramientas de desarrollo locales, previa validación.
- Prototipado rápido de pipelines de NLP: sirve para validar infraestructura de inferencia (tokenización, batching, cuantización) antes de migrar a modelos mayores, gracias a su reducido peso.
- Investigación en evaluación y descontaminación: la publicación de las fuentes de datos y de la metodología de evaluación permite usarlo como caso de estudio para medir el efecto de la deduplicación en benchmarks como HellaSwag o SciQ.
- Educación y divulgación: modelo pequeño y abierto que se puede ejecutar en portátiles con GPU modesta para demostrar cómo funciona un LLM decoder causal de principio a fin.
- Base para modelos derivados en la línea Nano 2: la propia model card lo presenta como cimiento de la familia, por lo que es el punto de partida natural para quien quiera reproducir o extender el instruct.

## Benchmarks y rendimiento

Resultados publicados por el autor en su suite estándar (precisión en porcentaje, mayor es mejor; WikiText es perplejidad, menor es mejor):

| Benchmark | PKaI Nano 2 | PKaI Nano 1.2 | PKaI Nano 1.1 | PKaI Nano 1 |
|---|---|---|---|---|
| HellaSwag | 43,87 | 39,71 | 36,52 | 31,02 |
| SciQ | 85,40 | 81,50 | 80,00 | 73,00 |
| PIQA | 67,52 | 65,94 | 64,96 | 59,74 |
| WinoGrande | 52,49 | 52,96 | 52,72 | 52,57 |
| ARC-Easy | 51,77 | 49,92 | 45,45 | 43,35 |
| ARC-Challenge | 28,75 | 27,73 | 28,24 | 24,83 |
| LAMBADA OpenAI | 42,46 | 44,07 | 33,82 | 23,33 |
| WikiText (ppl ↓) | 20,65 | 24,13 | 35,47 | 57,37 |

Media en las siete tareas de precisión: 53,18 para PKaI Nano 2, frente a 51,69 (Nano 1.2), 48,83 (Nano 1.1) y 43,98 (Nano 1). El autor advierte que Nano 1 y Nano 1.1 fueron reevaluados con la metodología actualizada. No se han publicado resultados de benchmarks frente a modelos de otros desarrolladores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, unos 1,6-1,7 GB solo para pesos (3,4 GB de repo incluyen otros artefactos); en int8, en torno a 0,8-0,9 GB; en int4, aproximadamente 0,4-0,5 GB. Hay que sumar la caché KV para contexto de 2048 tokens, que con 4 cabezas KV y 30 capas es reducida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan con holgura. Cabe en iGPU y en CPU con cuantización.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas dedicadas modernas, e incluso en placas integradas con cuantización agresiva.
- Opciones de despliegue: el repo no es un paquete `transformers` estándar, por lo que requiere el runtime nativo PKaI o una conversión previa de pesos. No se documenta soporte directo de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PKaI Nano 2 | ~0,79-0,84B | 2048 | Apache 2.0 | Pesos safetensors nativos PKaI | Base, solo inglés, sin benchmarks frente a terceros |
| PKaI Nano 1.2 | no disponible | no disponible (la mitad que Nano 2 según la card) | Apache 2.0 | Pesos PKaI | Generación anterior del mismo autor |
| Alternativas de ~1B (p. ej. familia Llama 3.2 1B, Qwen2.5 0.5B/1.5B, SmolLM2) | 0,5-1,5B | 8K-128K según modelo | Licencias variables | Paquetes `transformers` estándar | No se dispone de comparación numérica publicada por el autor |

No se han publicado comparaciones directas con modelos de otros desarrolladores en la información disponible; la única comparativa numérica es interna, frente a versiones anteriores de la propia familia Nano.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineamiento de seguridad: puede generar contenido inexacto, inseguro, sesgado o inapropiado.
- Riesgo elevado de alucinación y de afirmaciones factualmente incorrectas, propio de un modelo de 800M.
- Solo inglés declarado; no se garantiza calidad en otros idiomas.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- El formato de pesos es nativo PKaI y no un paquete `transformers` estándar, lo que complica la integración y puede requerir conversión manual.
- La licencia Apache 2.0 cubre el artefacto del modelo, pero el tokenizador y los datasets de entrenamiento tienen sus propias licencias y avisos recogidos en `THIRD_PARTY_NOTICES.txt`; conviene revisarlos antes de uso comercial.
- El autor no documenta el volumen de tokens de entrenamiento ni la composición exacta del dataset, lo que limita la reproducibilidad.
- Sin datos publicados de latencia, throughput ni soporte en frameworks de inferencia habituales.
- El modelo tiene 0 descargas y 1 like en Hugging Face en el momento de la consulta: ecosistema y validación externa prácticamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/PowderKegIntelligence/PKaI-Nano-2
- Anuncio y evaluación: https://powderkeg.info/research-introducing-pkai-nano-2.html
- Tokenizador base: https://huggingface.co/mistralai/Mistral-7B-v0.1
