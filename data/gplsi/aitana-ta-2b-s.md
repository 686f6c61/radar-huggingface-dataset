# gplsi/Aitana-TA-2B-S

## Resumen

Aitana-TA-2B-S es un modelo de traducción automática instructivo desarrollado por el grupo GPLSI (Language and Information Systems Group) y el CENID de la Universidad de Alicante. Se obtiene mediante ajuste fino por instrucciones del modelo BSC-LT/salamandraTA-2b-instruct, y está especializado en traducción bidireccional entre español y valenciano a nivel de oración. Con 2.253.490.176 parámetros (~2,25B), se posiciona como una alternativa compacta y de licencia permisiva para un par de lenguas con escasa cobertura en los sistemas comerciales.

El modelo emplea una arquitectura transformer decoder-only, heredada de la familia Salamandra, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en productos. Su relevancia actual radica en que cubre el valenciano, una variedad lingüística con pocos recursos y poco representada en los grandes modelos multilingües, con un rendimiento medido en el benchmark IberoBench (tarea Phrases) que supera a su modelo base en la mayoría de métricas.

La ficha se basa en la información publicada en Hugging Face y en la model card del autor. No se dispone de datos sobre composición completa del dataset de instrucciones, número total de tokens de entrenamiento ni detalles de alineación adicional más allá de los hiperparámetros declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parámetros totales | 2.253.490.176 (~2,25B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (max_seq_length de entrenamiento) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones de la comunidad no documentadas) |
| Idiomas soportados | es, ca, en (entrenamiento específico es-va / va-es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 2,25B de parámetros, derivado de BSC-LT/salamandraTA-2b-instruct, que a su vez procede de un ajuste por instrucciones sobre Salamandra-2b-base. La adaptación de Aitana-TA-2B-S consistió en reorientar las instrucciones hacia la traducción entre valenciano y español en ambos sentidos, manteniendo el mismo patrón de instrucciones del modelo base. El entrenamiento se realizó con código propio sobre PyTorch Lightning (Fabric Lightning), con sharding mediante FSDP, sobre 4 GPU NVIDIA A100 en sistemas DGX.

Los datos de entrenamiento provienen de L'Associació de Mitjans d'Informació i Comunicació (AMIC), a partir de los cuales se construyó un corpus paralelo a nivel de oración. El conjunto declarado para el par valenciano→español contiene 738.777 pares (longitud media de origen 165,6 y de destino 168,6). Los hiperparámetros son: 1 época, learning rate 1e-5, beta1 0,9, beta2 0,99, weight decay 0, batch global 64, micro-batch 2, warmup de 100 pasos y longitud máxima de secuencia 2048. No se documentan fases de RLHF o DPO ni innovaciones de decodificación específicas.

## Capacidades

- Traducción bidireccional español↔valenciano a nivel de oración, con instrucciones explícitas del tipo "Translate the following text from {source} into {target}".
- Generación de texto conversacional mediante plantilla ChatML (`<|im_start|>` / `<|im_end|>`).
- Seguimiento de instrucciones heredado del ajuste del modelo base SalamandraTA-2b-instruct.
- Soporte de conversaciones multi-turno en el formato ChatML.
- Cobertura declarada de español, catalán/valenciano e inglés, aunque el ajuste específico se centra en el par es-va.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación administrativa entre español y valenciano: el modelo puede procesar oraciones y párrafos cortos con instrucciones explícitas de dirección, adecuado para la adaptación de formularios y textos oficiales en la Comunidad Valenciana.
- Localización de contenidos web y blogs: integración en un pipeline que envíe cada oración o bloque al modelo con la plantilla ChatML, aprovechando su ventana de 2048 tokens para párrafos completos.
- Atención al cliente bilingüe: traducción en tiempo real de mensajes de usuarios entre español y valenciano en sistemas de chat, con la ventaja de un modelo de 2,25B que puede desplegarse en infraestructura modesta.
- Generación de subtítulos y transcripciones: traducción de segmentos cortos procedentes de ASR, donde el enfoque a nivel de oración del entrenamiento encaja con la segmentación típica de subtítulos.
- Preservación y difusión del valenciano: traducción de materiales educativos y divulgativos del español al valenciano para medios locales, aprovechando el corpus de AMIC usado en el entrenamiento.
- Investigación en traducción automática de lenguas de bajos recursos: el modelo sirve como línea base reproducible y de licencia Apache 2.0 para experimentos con el par es-va, comparando con el modelo base salamandraTA-2b-instruct.
- Traducción en entornos con recursos limitados: al ser un modelo de 2,25B, puede ejecutarse en una sola GPU consumer con cuantización, lo que permite desplegarlo en estaciones de trabajo sin clúster.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre la tarea Phrases de IberoBench, comparados con el modelo base:

| Tarea | Métrica | Aitana-TA-2B-S | salamandraTA-2b-instruct |
|---|---|---|---|
| phrases_ca-va | BLEU | 80,22 | 76,53 |
| phrases_es-va | BLEU | 64,93 | 62,40 |
| phrases_va-ca | BLEU | 81,19 | 82,07 |
| phrases_va-es | BLEU | 81,40 | 75,49 |
| phrases_ca-va | chrF | 91,77 | 89,57 |
| phrases_es-va | chrF | 84,23 | 82,18 |
| phrases_va-ca | chrF | 92,00 | 91,43 |
| phrases_va-es | chrF | 91,22 | 88,15 |
| phrases_ca-va | COMET | 0,958 | 0,952 |
| phrases_es-va | COMET | 0,932 | 0,927 |
| phrases_va-ca | COMET | 0,956 | 0,946 |
| phrases_va-es | COMET | 0,952 | 0,946 |
| phrases_ca-va | TER | 10,30 | 13,67 |
| phrases_es-va | TER | 21,07 | 23,26 |
| phrases_va-ca | TER | 9,03 | 10,68 |
| phrases_va-es | TER | 11,02 | 15,06 |

El modelo mejora a su base en la mayoría de combinaciones, con la excepción del BLEU en va-ca (81,19 frente a 82,07). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: en bfloat16, aproximadamente 4,5 GB solo para pesos, más overhead de activaciones y KV cache; en torno a 6-8 GB en la práctica para secuencias de 2048 tokens. En cuantización de 8 bits, alrededor de 2,5-3 GB; en 4 bits, en torno a 1,5-2 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para entrenamiento y despliegue de alto throughput; RTX 4090, RTX 3090 o similares con 24 GB para inferencia en bfloat16 sin problemas.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en bfloat16 y en tarjetas de 4-6 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers (referencia en la model card), vLLM, TGI (el repo incluye la etiqueta text-generation-inference), llama.cpp/Ollama si se generan pesos GGUF (no publicados por el autor).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aitana-TA-2B-S | ~2,25B | 2048 | Traducción es↔va | Apache 2.0 | Hugging Face |
| salamandraTA-2b-instruct | ~2B | no disponible | Traducción instructiva (modelo base) | Apache 2.0 | Hugging Face |
| Salamandra-2b-base | ~2B | no disponible | Modelo base multilingüe | Apache 2.0 | Hugging Face |

No se dispone de datos comparativos con otros sistemas de traducción es-va (por ejemplo, NLLB o modelos comerciales) en la información proporcionada.

## Limitaciones y advertencias

- El ajuste está centrado en traducción a nivel de oración entre español y valenciano; el rendimiento en documentos largos o en otros pares de lenguas puede degradarse.
- El corpus de entrenamiento proviene de una única fuente (AMIC), lo que puede introducir sesgos de dominio y estilo periodístico.
- Riesgo de alucinación y de omisiones en oraciones largas o con estructuras sintácticas complejas, habitual en modelos de traducción de este tamaño.
- La ventana de contexto de 2048 tokens limita la traducción de documentos extensos sin segmentación previa.
- Aunque declara es, ca y en, el ajuste específico es es-va; el rendimiento en inglés no está evaluado en la model card.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de origen (AMIC) si se redistribuye el modelo o derivados.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez frente a entradas adversarias.
- El modelo no incluye mecanismos de tool calling ni de agente; su uso en pipelines complejos requiere orquestación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gplsi/Aitana-TA-2B-S
- Modelo base: https://huggingface.co/BSC-LT/salamandraTA-2b-instruct
- GPLSI (Universidad de Alicante): https://gplsi.dlsi.ua.es/
- CENID: https://cenid.es
- Paper de IberoBench (COLING 2025): https://aclanthology.org/2025.coling-main.699/
