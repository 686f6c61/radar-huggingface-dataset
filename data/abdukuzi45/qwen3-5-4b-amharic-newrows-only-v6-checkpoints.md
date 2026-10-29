# abdukuzi45/qwen3.5-4b-amharic-newrows-only-v6-checkpoints

## Resumen

`abdukuzi45/qwen3.5-4b-amharic-newrows-only-v6-checkpoints` es un repositorio de checkpoints de un experimento de preentrenamiento continuado (continual pre-training) sobre el modelo denso multimodal Qwen3.5-4B, orientado a mejorar la competencia en amárico sin degradar el inglés ni la torre de visión. Lo desarrolla el usuario independiente abdukuzi45 en el marco de una iniciativa de NLP para lenguas africanas de bajos recursos, y se publica bajo licencia Apache 2.0.

La aportación técnica no es un ajuste fino convencional: se amplía el tokenizer de 248.077 a 328.077 tokens (80.000 tokens nuevos para amárico) y se entrenan únicamente las capas de embedding (`embed_tokens` y `lm_head`, unos 1,67B de parámetros), congelando por completo el resto de la red, incluidas las capas de atención, las MLP y los 297 pesos del codificador visual. El objetivo explícito es evitar el olvido catastrófico del inglés y de las capacidades multimodales.

El resultado principal es una mejora sustancial en métricas de amárico: el BPC en amárico de held-out baja de 4,28 (embeddings expandidos sin entrenar) a 1,74, frente a 2,60 del modelo base, y la precisión en Belebele-amárico sube del 50,8% al 63,0%, mientras el BPC en inglés incluso mejora ligeramente (0,7920 a 0,7777). El checkpoint seleccionado es el 33.500; el modelo fusionado definitivo se publica en un repositorio aparte, `qwen3.5-4b-amharic-newrows-only-v6-fixed`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal Qwen3.5 (atención + MLP + codificador de visión), con tokenizer ampliado |
| Parámetros totales | no disponible con exactitud; base Qwen3.5-4B (~4B) más los parámetros añadidos por los 80.000 tokens nuevos del tokenizer |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo contiene pesos safetensors sin cuantizar; no se publican GGUF ni AWQ/GPTQ) |
| Idiomas soportados | amárico (am) e inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Vocabulario del tokenizer | 328.077 tokens (original 248.077; +80.000 para amárico) |
| Parámetros entrenados | ~1,67B (`embed_tokens` y `lm_head` únicamente) |
| Parámetros congelados | atención, MLP y los 297 pesos del codificador visual |
| Dataset de entrenamiento | `abdukuzi45/amharic-cpt-with-english-replay-v1` |
| Tamaño del repositorio | 1.287,9 GB (conjunto completo de checkpoints) |

## Arquitectura y entrenamiento

Se parte de Qwen3.5-4B, un transformer denso con capacidad multimodal (incluye un codificador visual de 297 tensores). La intervención consiste en un preentrenamiento continuado limitado a la representación léxica: se sustituye la matriz de embeddings por una de mayor tamaño (328.077 entradas) y se entrena solo esa capa y la cabeza de lenguaje, dejando el resto del modelo en modo congelado. El nombre del repositorio ("newrows-only") apunta a esa misma idea de actualizar únicamente las filas nuevas del embedding, aunque la model card solo documenta explícitamente el entrenamiento de `embed_tokens` y `lm_head`.

El corpus es un conjunto propio de amárico con *replay* de inglés, diseñado para que el modelo no pierda competencia en inglés durante la adaptación. No se especifican en la información disponible el número total de tokens vistos, el tamaño de lote, la tasa de aprendizaje ni la composición exacta del dataset. Tampoco se documenta el uso de RLHF, DPO o ajuste por instrucciones: la model card describe exclusivamente la fase de preentrenamiento continuado y publica la progresión de checkpoints hasta el paso 36.000, de los cuales se seleccionó el 33.500 por equilibrio entre BPC en amárico, BPC en inglés y precisión en Belebele.

## Capacidades

- Modelado de lenguaje y generación de texto en amárico, con una representación léxica específica para el idioma (80.000 tokens nuevos) que reduce el BPC de 2,60 a 1,74 frente al modelo base.
- Comprensión lectora en amárico: 63,0% de precisión en Belebele-amárico, frente al 50,8% del Qwen3.5-4B original.
- Mantenimiento del inglés: BPC de 0,7777, sin degradación respecto al base (0,7920).
- Capacidad multimodal potencialmente preservada: los 297 pesos del codificador visual son idénticos byte a byte a los del modelo base, aunque no se aportan evaluaciones de visión en este experimento.
- Al conservar intactos los pesos de atención y MLP, el modelo hereda las capacidades del Qwen3.5-4B subyacente (razonamiento, código, matemáticas, tool calling, modo *thinking*, etc.), pero dichas capacidades no están evaluadas ni documentadas en la información disponible para esta adaptación concreta.
- No se documenta soporte específico de function calling, agentes o multi-step reasoning en esta ficha más allá de lo que herede del modelo base.
- No se documenta una plantilla de chat ni un ajuste por instrucciones; se trata de un checkpoint de preentrenamiento continuado.

## Casos de uso

- Generación de texto en amárico para medios digitales y boletines: el modelo produce texto con un BPC de 1,74 (frente a 2,60 del base), lo que se traduce en una mejor modelización de la morfología y el vocabulario amáricos con un tokenizer dedicado.
- Comprensión lectora automatizada de documentos en amárico: con un 63,0% en Belebele-amárico, sirve como base para sistemas de question answering extractivo sobre corpus periodísticos, legales o administrativos etíopes, siempre con verificación humana.
- Investigación en tokenizers y preentrenamiento continuado: el repositorio incluye la traza completa de checkpoints (33.500 a 36.000) con métricas BPC y Belebele, lo que permite reproducir el análisis de compromiso entre idioma nuevo y olvido catastrófico.
- Punto de partida para SFT en amárico: al conservar intacto el núcleo del modelo y mejorar solo la capa léxica, es un punto de partida razonable para un ajuste por instrucciones posterior con datos anotados en amárico.
- Atención al cliente bilingüe amárico-inglés: la combinación de un BPC en inglés intacto (0,7777) y una mejora grande en amárico permite escenarios con cambio de código, habituales en el sector tecnológico etíope.
- Localización de productos y contenidos para el mercado etíope: generación y reformulación de textos de marketing, documentación y UI en amárico a partir de originales en inglés, manteniendo la coherencia terminológica.
- Traducción asistida amárico-inglés y viceversa: aunque no se reportan métricas BLEU/COMET, la mejora de representación en ambos idiomas hace viable su uso como motor de borrador con postedición humana.
- Base para experimentos de preservación multimodal: dado que la torre de visión queda byte-idéntica, sirve para estudiar si una adaptación puramente léxica afecta o no a tareas visión-lenguaje en amárico.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de checkpoints (BPC = bits por carácter, menor es mejor; Belebele = precisión en comprensión lectora, mayor es mejor):

| Checkpoint | BPC amárico | BPC amárico Belebele | BPC inglés | Precisión Belebele |
|---|---|---|---|---|
| Base (Qwen3.5-4B) | 2,6045 | 2,6033 | 0,7920 | 50,8% |
| Init (expandido, sin entrenar) | 4,2843 | 4,6186 | 0,9476 | 22,6% |
| 33500 (seleccionado) | 1,7394 | 2,6924 | 0,7777 | 63,0% |
| 34000 | 1,7394 | 2,6922 | 0,7777 | 62,0% |
| 34500 | 1,7393 | 2,6924 | 0,7777 | 62,0% |
| 35000 | 1,7389 | 2,6920 | 0,7777 | 61,0% |
| 35500 | 1,7387 | 2,6916 | 0,7777 | 62,0% |
| 36000 | 1,7387 | 2,6919 | 0,7777 | 62,3% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU) en la información disponible. Tampoco se aportan métricas de visión ni evaluaciones con juez automático.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16, en torno a 8-9 GB solo para pesos (4B de parámetros más la ampliación del tokenizer), con overhead adicional de KV cache según contexto. En INT8, aproximadamente 5 GB; en 4 bits, aproximadamente 3 GB. Estimaciones calculadas a partir del tamaño del modelo, no publicadas por el autor.
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G sin problema en BF16; sobran para una sola instancia.
- GPU de consumo: cabe en BF16 en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB). En RTX 4060 Ti (16 GB) queda ajustado pero viable. Para RTX 3060 (12 GB) o RTX 4070 (12 GB) conviene cuantizar a 8 o 4 bits.
- Despliegue: `transformers` con `trust_remote_code=True` es la vía documentada por el autor. vLLM y TGI son opciones razonables para servir en BF16, pero requieren validar que el tokenizer ampliado y el `config.json` se carguen correctamente. llama.cpp u Ollama exigen convertir previamente a GGUF, conversión que no se distribuye en el repositorio.
- Almacenamiento: el repositorio de checkpoints ocupa 1.287,9 GB; para inferencia conviene usar el repositorio fusionado `qwen3.5-4b-amharic-newrows-only-v6-fixed` en lugar de clonar el conjunto completo.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Métrica destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (checkpoint 33500, v6) | ~4B + embeddings ampliados | no disponible | am, en | Belebele-amárico 63,0%; BPC am 1,7394 | apache-2.0 | Pesos safetensors en HF, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | multilingüe | Belebele-amárico 50,8%; BPC am 2,6045 | no disponible en la información | Modelo de referencia de Alibaba |
| abdukuzi45/qwen3.5-4b-amharic-full-cpt | ~4B | no disponible | am, en | no disponible | no disponible | Repositorio HF del mismo autor |
| abdukuzi45/qwen3.5-4b-amharic-sft | ~4B | no disponible | am, en | no disponible | no disponible | Repositorio HF del mismo autor, con adaptadores PEFT |
| abdukuzi45/qwen3.5-4b-amharic-mixed-precision | ~4B | no disponible | am, en | no disponible | no disponible | Repositorio HF del mismo autor |

No se dispone de datos públicos de benchmarks de estos modelos alternativos en la información consultada, por lo que la comparación se limita al modelo base, que es el único con métricas comparables publicadas en la misma model card.

## Limitaciones y advertencias

- Solo se entrenan las capas de embedding: el modelo mejora la representación léxica del amárico, pero no incorpora conocimiento factual nuevo ni capacidades de razonamiento específicas para el idioma más allá de lo que ya tenía el Qwen3.5-4B base.
- El BPC sobre Belebele-amárico empeora respecto al base (2,6924 frente a 2,6033) pese a que la precisión de respuesta mejora; conviene interpretar ambas métricas en conjunto y no asumir una mejora uniforme.
- No hay ajuste por instrucciones ni plantilla de chat documentada: el uso directo como asistente conversacional puede dar respuestas poco alineadas con el formato esperado.
- Riesgo de alucinación heredado del modelo base, no mitigado por este entrenamiento; en amárico es especialmente relevante por la menor cobertura de datos de evaluación disponibles.
- Sesgos: no se documenta ningún análisis de sesgo, toxicidad o representación para amárico ni para inglés. El corpus es privado y de composición no detallada.
- Idiomas: solo se declaran am y en. El resto de idiomas del Qwen3.5 original no se ha evaluado tras la ampliación del tokenizer y podrían haberse visto afectados.
- La torre de visión se conserva byte-idéntica, pero no se ha evaluado ninguna tarea visión-lenguaje en amárico; no hay evidencia publicada de que funcione correctamente con el tokenizer ampliado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de desplegar en producción.
- El repositorio de checkpoints ocupa 1,28 TB y acumula 36.000 pasos de entrenamiento; para uso real debe emplearse el modelo fusionado final, no los checkpoints intermedios.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- Modelo con 0 descargas y 0 likes, sin revisión por pares ni validación independiente de los resultados reportados.

## Enlaces

- Repositorio de checkpoints: https://huggingface.co/abdukuzi45/qwen3.5-4b-amharic-newrows-only-v6-checkpoints
- Modelo fusionado final recomendado: https://huggingface.co/abdukuzi45/qwen3.5-4b-amharic-newrows-only-v6-fixed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/abdukuzi45/amharic-cpt-with-english-replay-v1
- Variante SFT: https://huggingface.co/abdukuzi45/qwen3.5-4b-amharic-sft
- Variante CPT completa: https://huggingface.co/abdukuzi45/qwen3.5-4b-amharic-full-cpt
- Variante de precisión mixta: https://llm-explorer.com/model/abdukuzi45%2Fqwen3.5-4b-amharic-mixed-precision,4M9kaDWgdw7Yb3Hubcur9c
- Ficha indexada del modelo SFT: https://essamamdani.com/ai-models/hf-abdukuzi45-qwen3-5-4b-amharic-sft
- Registro de la variante CPT completa: https://free2aitools.com/model/abdukuzi45/qwen3.5-4b-amharic-full-cpt
