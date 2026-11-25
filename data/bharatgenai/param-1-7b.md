# bharatgenai/Param-1-7B

## Resumen

Param-1-7B-MoE es un modelo de lenguaje multilingüe desarrollado por BharatGen dentro de la familia Param-1, una suite de tecnologías de IA generativa orientada a la India. Se trata de un transformer decoder-only con arquitectura de mezcla de expertos (MoE) que, pese a contar con aproximadamente 6.670 millones de parámetros totales, activa solo 1.040 millones por token gracias a un enrutamiento disperso de tipo top-K sobre 64 expertos. El modelo se ha preentrenado desde cero sobre un corpus de 4 billones de tokens, con un énfasis explícito en diversidad lingüística y contexto cultural indio.

La propuesta de valor principal es la cobertura de 16 idiomas: inglés, hindi y 14 lenguas indias adicionales (asamés, bengalí, gujarati, canná, maithili, malabar, maratí, nepalí, oriya, panyabí, sánscrito, sindhi, tamil y telugu). Esta cobertura amplia lo posiciona como una alternativa de base para aplicaciones regionales donde los modelos occidentales rinden de forma desigual. El contexto máximo es de 4096 tokens y el modelo se distribuye como base preentrenada (PT), no como modelo instruct, por lo que requiere ajuste fino para tareas de instrucción o diálogo.

Es relevante ahora porque la mayoría de los modelos multilingües abiertos priorizan idiomas europeos y asiáticos de alto recurso, dejando las lenguas indias en un segundo plano. Param-1-7B-MoE aborda ese hueco con un presupuesto de entrenamiento serio (4T tokens) y una infraestructura declarada de GPUs NVIDIA H100 sobre Yotta Shakti Cloud, usando NVIDIA NeMo como framework.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture of Experts (MoE) |
| Parámetros totales | 6.672.999.936 (~6,67B) |
| Parámetros activos | 1,04B |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | no disponible (pesos en bf16-mixed; repo de 13,4 GB) |
| Idiomas soportados | Inglés, hindi y 14 lenguas indias: asamés, bengalí, gujarati, canná, maithili, malabar, maratí, nepalí, oriya, panyabí, sánscrito, sindhi, tamil, telugu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con mezcla de expertos: 64 expertos especializados con activación dispersa a nivel de token y top-K = 8 expertos por token. Emplea embeddings posicionales rotatorios (RoPE) y atención optimizada con técnicas de activación modernas. La precisión de entrenamiento declarada es bf16-mixed. El enrutamiento MoE permite que, pese a los ~6,67B parámetros totales, solo se compute aproximadamente 1,04B por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamaño.

El preentrenamiento se realizó desde cero sobre 4 billones de tokens en dos fases. La fase PT-1 combinó ~500B tokens de inglés y hindi, ~500B de código y matemáticas y ~1,0T de las 14 lenguas indias. La fase PT-2 (unos 2,0T tokens netos) añadió ~470B de conocimiento general, ~270B de conocimiento técnico (investigación, STEM, filosofía, investigación centrada en India), ~330B de educación, exámenes, especialización de dominio, matemáticas, benchmarks y código, ~10B de conocimiento conversacional (foros y Q&A) y ~920B de expansión multilingüe indic (16 idiomas, con datos sintéticos, OCR, traducción y personas). A ello se suman bloques de alineamiento y estabilización: ~45B de SFT, ~4,9B de RL/preferencias/seguridad, ~95B de replay de PT-1 y ~0,1B de autoidentidad y conocimiento BharatGen. La mezcla de datos se curó con CLIMB (Clustering-based Iterative Data Mixture Bootstrapping) de NVIDIA. El entrenamiento usó NVIDIA NeMo sobre GPUs NVIDIA H100 en Yotta Shakti Cloud.

## Capacidades

- Generación de texto multilingüe en inglés, hindi y 14 lenguas indias adicionales.
- Modelo base preentrenado: no incluye alineamiento instruct por defecto, por lo que el seguimiento de instrucciones requiere ajuste fino.
- Razonamiento y conocimiento general derivados de un corpus de 4T tokens con bloques específicos de STEM, filosofía y educación.
- Capacidad de código y matemáticas por el bloque dedicado de ~500B tokens en PT-1 y ~330B en PT-2.
- Comprensión de contexto largo hasta 4096 tokens.
- Soporte de tool calling / function calling: no disponible (no declarado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Aplicaciones de atención al cliente en lenguas indias: el modelo cubre 14 idiomas regionales además de inglés e hindi, lo que permite desplegar un único modelo base para soporte multi-idioma en India tras un ajuste fino con datos de dominio.
- Traducción y localización entre hindi, inglés y lenguas indias: con 1,0T tokens en PT-1 dedicados a las 14 lenguas y 920B en PT-2 de expansión multilingüe, es una base razonable para pipelines de traducción automática que requieran ajuste fino supervisado.
- Procesamiento de documentos y OCR derivado: el bloque de expansión multilingüe incluye datos de OCR, lo que lo hace adecuado como base para tareas de extracción y comprensión de documentos en escrituras indias.
- Generación de código asistida: el corpus incluye ~500B tokens de código y matemáticas en PT-1 más ~330B en PT-2, por lo que puede ajustarse para autocompletado o generación en entornos de desarrollo.
- Investigación lingüística y evaluación de modelos multilingües: al ser un base model con licencia Apache 2.0 y pesos abiertos, sirve como referencia para estudiar el rendimiento de arquitecturas MoE en lenguas de bajos recursos.
- Fine-tuning para dominios educativos y de exámenes: el bloque de ~330B tokens de educación y exámenes en PT-2 facilita el ajuste para tutores o generadores de preguntas en el sistema educativo indio.
- Despliegue en entornos con restricciones de cómputo: con solo 1,04B parámetros activos por token, la inferencia es más barata que la de un denso de ~7B, lo que permite servir el modelo en infraestructura modesta tras cuantización (aunque el autor no publica recetas de cuantización).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 13,4 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV para 4096 tokens.
- En cuantización de 8 bits: ~7 GB de pesos; en 4 bits: ~3,5-4 GB de pesos (estimación a partir del tamaño, no publicada por el autor).
- GPU recomendadas: NVIDIA H100 o A100 para bf16 sin cuantizar; RTX 4090 (24 GB) para bf16 con margen ajustado o cuantización; RTX 3090/4080 (16-24 GB) viables en cuantización.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con cuantización; en bf16 requiere al menos ~16-24 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True` (el autor proporciona snippet); vLLM, llama.cpp, Ollama o TGI no están confirmados en la model card y dependen de que existan conversiones GGUF o soporte para la arquitectura MoE custom.
- Latencia y throughput: no disponibles. La activación de 1,04B parámetros por token sugiere un coste computacional por token comparable al de un modelo denso de ~1B, aunque el tráfico de memoria para cargar 64 expertos puede penalizar en GPUs con poco ancho de banda.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| Param-1-7B-MoE | ~6,67B | 1,04B | 4096 | 16 (inglés, hindi + 14 indias) | Apache 2.0 |
| Modelos densos de ~7B (p. ej. familia Llama/Mistral) | ~7B | 7B (denso) | 4096-32k según variante | Principalmente inglés y multilingüe parcial | Varía |
| Modelos MoE de ~7B con ~1-2B activos | ~7B | ~1-2B | Variable | Variable | Variable |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas concretas. La comparativa se limita a parámetros, contexto y licencia. La principal ventaja diferencial frente a modelos densos de tamaño similar es el menor coste de inferencia por token (1,04B activos) y la cobertura de 14 lenguas indias, que los modelos occidentales abiertos rara vez igualan.

## Limitaciones y advertencias

- Es un modelo base preentrenado (PT): no sigue instrucciones ni mantiene diálogo de forma fiable sin ajuste fino previo.
- Puede reflejar sesgos presentes en datos web multilingües a gran escala; el autor lo advierte explícitamente.
- Riesgo de alucinación inherente a un modelo de lenguaje sin alineamiento instruct; no hay datos de evaluación de factualidad.
- Contexto limitado a 4096 tokens, inferior al de modelos contemporáneos que ofrecen 32k-128k.
- El rendimiento puede degradarse en dominios de bajos recursos o tareas muy especializadas, según la propia model card.
- Requiere `trust_remote_code=True` por el código custom de la arquitectura MoE, lo que implica ejecutar código del repositorio y revisarlo antes de usarlo en producción.
- No se publican recetas de cuantización ni conversiones GGUF oficiales, lo que complica el despliegue en llama.cpp u Ollama.
- Licencia Apache 2.0 permite uso comercial, pero el autor pide seguir las directrices de nombrado en bharatgen.com/licence/#names y consultar el fichero NOTICE para atribución.
- No hay datos publicados de benchmarks, por lo que la calidad real frente a alternativas no está verificada de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bharatgenai/Param-1-7B
- Página de BharatGen: https://bharatgen.com
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Fichero LICENSE del modelo: https://huggingface.co/bharatgenai/Param-1-7B/blob/main/LICENSE
- Fichero NOTICE del modelo: https://huggingface.co/bharatgenai/Param-1-7B/blob/main/NOTICE
- Directrices de nombrado: https://bharatgen.com/licence/#names
- Modelo relacionado Param-1-2.9B-Instruct: https://huggingface.co/bharatgenai/Param-1-2.9B-Instruct
