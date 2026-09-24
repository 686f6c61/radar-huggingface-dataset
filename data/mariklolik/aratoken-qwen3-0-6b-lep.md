# mariklolik/AraToken-Qwen3-0.6B-LEP

## Resumen

El modelo AraToken-Qwen3-0.6B-LEP es una adaptación al árabe de Qwen3-0.6B-Base desarrollada por Mark Kashirskiy (usuario mariklolik) mediante el Language Extension Pipeline (LEP). El objetivo es corregir la ineficiencia del tokenizador de Qwen3 al procesar árabe: se añadieron 130.890 piezas AraToken al vocabulario y se continuó el entrenamiento sobre 500 millones de tokens de árabe de alta calidad del dataset FineWeb2-HQ.

El modelo resultante tiene 730.081.280 parámetros reales (los 0,6B del modelo base más las nuevas filas de embedding) y conserva la arquitectura transformer decoder-only de Qwen3. Las filas de embedding originales se congelaron mediante gradient masking y solo se entrenaron las filas nuevas y las capas 24 a 27 del transformer.

Su relevancia radica en demostrar que una extensión de vocabulario más un ajuste acotado mejora el modelado del árabe (BPC de 1,5446 a 1,3219) y multiplica por 1,7 la eficiencia de tokenización (de 2,59 a 4,43 caracteres por token), con un coste de entrenamiento reducido: 5.086 pasos sobre 4 GPU H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 730.081.280 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-0.6B-Base) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors (bfloat16) |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-0.6B-Base |
| Vocabulario | tokenizador Qwen3 ampliado con 130.890 piezas AraToken |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-0.6B-Base: un transformer decoder-only denso. La modificacion principal es la extension del vocabulario con 130.890 piezas AraToken, cuyas nuevas filas de embedding se inicializaron como la media de los embeddings de los sub-tokens Qwen3 correspondientes que cubren. El tokenizador incorpora un normalizador especifico (NFKC, eliminacion de tatweel, conversion de digitos a forma occidental, normalizacion de puntuacion latina y eliminacion de diacriticos), por lo que acepta texto arabe sin preprocesado adicional.

El entrenamiento consistio en un ajuste sobre 500 millones de tokens de FineWeb2-HQ arabe (5.086 pasos, 4 GPU H100). Las filas de embedding originales se congelaron mediante gradient masking, y solo se actualizaron las filas nuevas y las capas 24 a 27 del transformer. No se documenta en la informacion disponible ninguna fase de RLHF, DPO u otra alineacion por preferencias: se trata de un modelo base.

## Capacidades

- Generacion de texto en arabe e ingles.
- Modelado de lenguaje y calculo de verosimilitudes a nivel de caracter (bits per character), con mejor rendimiento que el modelo base en arabe.
- Tokenizacion eficiente del arabe: 4,43 caracteres por token frente a 2,59 del tokenizador original de Qwen3.
- Manejo de texto arabe sin normalizacion manual previa, gracias al normalizador integrado en el tokenizador.
- Capacidad de servir como base para fine-tuning en tareas de procesamiento de lenguaje natural en arabe.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion en tokenizacion arabe: comparar el comportamiento de este modelo frente a Qwen3-0.6B-Base o la variante CPT con el tokenizador original, midiendo bits per character sobre corpus arabe de retencion.
- Punto de partida para fine-tuning en tareas arabes concretas (clasificacion de texto, analisis de sentimiento, reconocimiento de entidades) con presupuesto de computo reducido, ya que el modelo cabe en una unica GPU de consumo.
- Generacion de texto asistida en arabe sobre hardware modesto: al ocupar alrededor de 1,5 GB en bfloat16, puede desplegarse en portatiles y equipos sin GPU dedicada.
- Evaluacion de representaciones lexicas y sublexicas en arabe, aprovechando la inicializacion por media de sub-tokens para estudiar como se reorganiza el espacio de embeddings tras la extension de vocabulario.
- Normalizacion y preprocesado de corpus arabes, reutilizando el tokenizador con su pipeline de normalizacion (NFKC, eliminacion de tatweel, diacriticos y puntuacion latina).
- Reduccion de costes de inferencia en sistemas que procesan grandes volumenes de texto arabe, al necesitar menos tokens por documento que un tokenizador generico.
- Docencia y experimentacion sobre Language Extension Pipelines en modelos pequenos, reproduciendo el flujo descrito en el paper con recursos limitados.
- Base para destilacion o para generar datos sinteticos en arabe dentro de pipelines de investigacion.

## Benchmarks y rendimiento

Se comparan los tres modelos con la misma metrica de caracteres, dado que sus vocabularios difieren. El BPC (bits per character) se mide sobre los primeros 1.500 documentos del split de test de `mariklolik/AraToken-FineWeb2-HQ-ar`; en ingles se usa WikiText-103. En BPC, un valor menor es mejor.

| Modelo | BPC arabe (↓) | BPC ingles WikiText-103 (↓) | Precision macro OALL v2 arabe nativo | Caracteres por token |
|---|---|---|---|---|
| Qwen3-0.6B-Base | 1,5446 | 1,0199 | 0,392 | 2,59 |
| CPT con tokenizador original (AraToken-Qwen3-0.6B-CPT) | 1,4047 | 1,0675 | 0,379 | 2,59 |
| AraToken-Qwen3-0.6B-LEP (este modelo) | 1,3219 | 1,1379 | 0,405 | 4,43 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: alrededor de 1,5 GB (730 millones de parametros a 2 bytes cada uno); el repositorio ocupa 1,5 GB.
- VRAM estimada en fp32: alrededor de 2,9 GB.
- VRAM estimada en int8: alrededor de 0,75 GB; en int4, alrededor de 0,4 GB (cuantizacion no publicada por el autor).
- Cabe en cualquier GPU de consumo con 2 GB o mas de memoria, incluidas RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU modernas.
- Puede ejecutarse en CPU con memoria RAM suficiente si se convierte a formatos optimizados para CPU.
- Entrenamiento original: 4 GPU H100 durante 5.086 pasos.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (el repositorio incluye la etiqueta correspondiente), vLLM; llama.cpp y Ollama son viables si se generan pesos GGUF a partir de los safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | BPC arabe | Precisión OALL v2 | Caracteres por token | Licencia |
|---|---|---|---|---|---|---|
| AraToken-Qwen3-0.6B-LEP | 730.081.280 | Qwen3 + 130.890 AraToken | 1,3219 | 0,405 | 4,43 | Apache 2.0 |
| AraToken-Qwen3-0.6B-CPT | aproximadamente 0,6B | tokenizador Qwen3 original | 1,4047 | 0,379 | 2,59 | Apache 2.0 |
| Qwen/Qwen3-0.6B-Base | 0,6B | tokenizador Qwen3 original | 1,5446 | 0,392 | 2,59 | Apache 2.0 |

No se dispone en la informacion proporcionada de comparaciones frente a otros modelos arabes de tamano similar (por ejemplo, variantes de Jais, ALLaM o AceGPT); no disponible.

## Limitaciones y advertencias

- Es un modelo base sin alineacion por instrucciones ni RLHF/DPO; puede generar contenido sesgado, ofensivo o inapropiado sin filtrado.
- Riesgo elevado de alucinacion en conocimiento factual, dado su tamano (0,6B) y su dominio de entrenamiento (500 millones de tokens de FineWeb2-HQ arabe).
- Degradacion del rendimiento en ingles: el BPC sobre WikiText-103 empeora de 1,0199 (modelo base) a 1,1379, lo que indica cierto olvido catastrofico tras el ajuste.
- Longitud de contexto no documentada en la informacion proporcionada.
- Solo se entrenaron las capas 24 a 27 y las filas de embedding nuevas; el resto de pesos permanece congelado, lo que limita la plasticidad del modelo.
- El normalizador del tokenizador elimina diacriticos y tatweel, por lo que no es adecuado para tareas que requieran preservar la vocalizacion exacta del texto arabe.
- No hay resultados publicados de benchmarks estandar (MMLU, HumanEval, GSM8K), lo que dificulta la comparacion con otros modelos de proposito general.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-0.6B-Base.
- Modelo recien publicado, con 0 descargas y 0 likes en HuggingFace en el momento de la consulta: carece de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mariklolik/AraToken-Qwen3-0.6B-LEP
- Paper: https://arxiv.org/abs/2512.18399
- Repositorio de codigo: https://github.com/mariklolik/Aratoken
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Variante CPT con tokenizador original: https://huggingface.co/mariklolik/AraToken-Qwen3-0.6B-CPT
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/mariklolik/AraToken-FineWeb2-HQ-ar
