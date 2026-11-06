# gplsi/Aitana-TA-7B-S

## Resumen

Aitana-TA-7B-S es un modelo de traduccion automatica especializado en el par de lenguas espanol-valenciano (y catalan), desarrollado por el grupo GPLSI de la Universidad de Alicante junto con el Centro de Inteligencia Digital (CENID). Se trata de un ajuste fino por instrucciones del modelo BSC-LT/salamandraTA-7b-instruct, que a su vez deriva del modelo base Salamandra-7b de la Barcelona Supercomputing Center. El modelo resuelve el problema de la traduccion de alta calidad entre espanol y valenciano a nivel de frase, un par de lenguas con recursos limitados en comparacion con otros pares europeos.

Con aproximadamente 7.770 millones de parametros y una arquitectura transformer decoder-only, el modelo ha sido entrenado especificamente sobre un corpus paralelo de frases construido a partir de datos de la Associacio de Mitjans d'Informacio i Comunicacio (AMIC), con 738.777 pares de frases valenciano-espanol. Su relevancia actual radica en que mejora de forma consistente al modelo base en todas las metricas de traduccion evaluadas (BLEU, ChrF, COMET y TER) sobre la tarea Phrases de IberoBench, manteniendo una licencia Apache 2.0 que permite uso comercial sin restricciones.

El modelo emplea la plantilla de chat ChatML y esta disenado para traduccion bidireccional entre espanol y valenciano, asi como entre valenciano y catalan. Su ventana de contexto efectiva durante el entrenamiento fue de 2.048 tokens, lo que lo hace adecuado para traduccion de frases y parrafos, pero no para documentos extensos en una sola pasada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 7.768.117.248 (~7,76B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (max_seq_length de entrenamiento) |
| Tipos de cuantizacion | no disponible en la model card; compatible con cuantizacion estandar de transformers (bitsandbytes, GPTQ, AWQ) por ser un modelo Llama-like |
| Idiomas soportados | es, ca, en (entrenado especificamente para es-va y va-ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only, heredada directamente de SalamandraTA-7b-instruct, que a su vez proviene de Salamandra-7b-base del BSC. El ajuste fino se realizo con un regimen de entrenamiento de 1 epoca, learning rate de 1e-5, betas (0,9; 0,99), weight decay 0, batch global de 64, micro-batch de 2, warmup de 100 pasos y longitud maxima de secuencia de 2.048 tokens. El entrenamiento se llevo a cabo sobre 4 GPUs NVIDIA A100 en sistemas DGX, utilizando codigo propio sobre PyTorch Lightning (Fabric Lightning) con Fully Sharded Data Parallel (FSDP) para el sharding del modelo entre GPUs.

Los datos de entrenamiento provienen de un corpus paralelo a nivel de frase construido a partir de contenidos de la Associacio de Mitjans d'Informacio i Comunicacio (AMIC), con 738.777 pares valenciano-espanol (longitud media de origen 165,6 y de destino 168,6). La unica adaptacion respecto al modelo base consistio en enfocar las instrucciones hacia la traduccion bidireccional valenciano-espanol, manteniendo el mismo patron de instrucciones de SalamandraTA-7b-instruct. No se menciona en la informacion disponible el uso de RLHF o DPO; el ajuste parece ser exclusivamente supervisado sobre datos paralelos.

## Capacidades

- Traduccion bidireccional espanol-valenciano y valenciano-catalan a nivel de frase.
- Traduccion bidireccional valenciano-espanol y espanol-valenciano.
- Generacion de texto conversacional mediante plantilla ChatML.
- Seguimiento de instrucciones de traduccion con formato explicito (source/target).
- Soporte multilingue limitado a es, ca y en segun los tags del modelo, aunque el entrenamiento especifico se centra en es-va y va-ca.
- Generacion con decodificacion por beams (el ejemplo de la model card usa num_beams=5 y early_stopping).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Traduccion de frases y parrafos en medios de comunicacion locales: el modelo se entreno sobre el corpus de AMIC, por lo que es adecuado para traducir noticias y contenidos periodisticos entre valenciano y espanol con alta fidelidad terminologica.
- Localizacion de interfaces y documentacion administrativa: la ventana de 2.048 tokens permite traducir cadenas de UI y parrafos de documentacion de forma fiable, con la ventaja de una licencia Apache 2.0 que no impone restricciones de uso comercial.
- Atencion al cliente bilingue en la Comunidad Valenciana: el modelo puede gestionar conversaciones multi-turno en valenciano y espanol usando la plantilla ChatML, traduciendo consultas y respuestas en tiempo real.
- Generacion de subtitulos y transcripciones: para pares de frases cortas, el modelo alcanza valores de COMET superiores a 0,93 en todas las direcciones, lo que lo hace util para subtitulado automatico de contenido audiovisual.
- Traduccion en pipelines de publicacion editorial: integrable via transformers o text-generation-inference para traducir articulos y comunicados, con la posibilidad de desplegar en infraestructura propia gracias a los pesos safetensors.
- Investigacion en traduccion automatica de lenguas de bajos recursos: sirve como modelo de referencia para experimentos con el par es-va y como punto de partida para ajustes finos adicionales sobre otros pares de lenguas ibericas.
- Normalizacion linguistica valenciano-catalan: el modelo muestra mejoras notables en BLEU (79,52 en va-ca frente a 72,25 del base), por lo que puede emplearse para armonizar variantes dialectales en corpus y bases de datos.

## Benchmarks y rendimiento

Resultados sobre la tarea Phrases de IberoBench, comparando con el modelo base salamandraTA-7b-instruct:

| Tarea | Metrica | Aitana-TA-7b-S | salamandraTA-7b-instruct |
|---|---|---|---|
| phrases_es-va | BLEU | 65,14 | 61,92 |
| phrases_va-es | BLEU | 82,04 | 75,12 |
| phrases_va-ca | BLEU | 79,52 | 72,25 |
| phrases_ca-va | BLEU | 78,63 | 72,30 |
| phrases_es-va | ChrF | 84,24 | 82,82 |
| phrases_va-es | ChrF | 91,63 | 87,72 |
| phrases_va-ca | ChrF | 91,02 | 85,09 |
| phrases_ca-va | ChrF | 90,88 | 87,56 |
| phrases_es-va | COMET | 0,937 | 0,930 |
| phrases_va-es | COMET | 0,957 | 0,951 |
| phrases_va-ca | COMET | 0,953 | 0,948 |
| phrases_ca-va | COMET | 0,956 | 0,948 |
| phrases_es-va | TER | 20,99 | 22,63 |
| phrases_va-es | TER | 10,12 | 15,54 |
| phrases_va-ca | TER | 10,45 | 18,85 |
| phrases_ca-va | TER | 11,54 | 15,95 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 15,5 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 20-24 GB de VRAM para secuencias de hasta 2.048 tokens.
- VRAM estimada en cuantizacion 8 bits: en torno a 8-9 GB; en 4 bits: en torno a 4,5-5 GB (estimaciones estandar para un modelo de 7,76B, no confirmadas en la model card).
- GPU recomendadas: NVIDIA A100 (la model card indica que el entrenamiento uso 4 A100), H100 para despliegue de alto throughput, y RTX 4090 (24 GB) para inferencia en bfloat16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bfloat16 y en GPUs de 12-16 GB con cuantizacion de 8 o 4 bits (RTX 4070 Ti, RTX 4080, etc.).
- Opciones de despliegue: transformers (soporte nativo segun la model card), text-generation-inference (el modelo incluye el tag text-generation-inference y endpoints_compatible), vLLM por compatibilidad con arquitectura Llama, llama.cpp y Ollama mediante conversion a GGUF (no documentado en la model card).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Aitana-TA-7B-S | ~7,76B | 2.048 tokens | es, ca, en (foco es-va) | Apache 2.0 | Especializado en traduccion es-va y va-ca; mejora al base en todas las metricas |
| BSC-LT/salamandraTA-7b-instruct | ~7,76B | 2.048 tokens (entrenamiento) | es, ca, en | Apache 2.0 | Modelo base; menor rendimiento en la tarea Phrases de IberoBench |
| Salamandra-7b-base (BSC) | ~7B | no disponible | multilingue europeo | Apache 2.0 | Modelo base generalista del que deriva la familia SalamandraTA |

No se dispone de datos de benchmarks de otros modelos de traduccion especializados en es-va en la informacion proporcionada para una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- El modelo esta especializado en traduccion a nivel de frase; su ventana de contexto de 2.048 tokens y su entrenamiento sobre frases lo hacen poco adecuado para traduccion de documentos largos sin segmentacion previa.
- El corpus de entrenamiento proviene de medios de comunicacion (AMIC), lo que puede introducir sesgos de dominio periodistico y estilo formal; el rendimiento puede degradarse en textos tecnicos, legales o coloquiales.
- Riesgo de alucinacion y de omision o adicion de contenido en traducciones largas, especialmente fuera de la longitud media de entrenamiento (165-168 tokens).
- Aunque los tags indican soporte de es, ca y en, el entrenamiento especifico se centra en es-va y va-ca; el rendimiento en otros pares o en tareas generales de generacion no esta documentado.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda verificar la procedencia de los datos de entrenamiento (AMIC) para cumplir con posibles derechos de terceros.
- No se documentan tecnicas de mitigacion de sesgos ni evaluaciones de seguridad; para produccion en atencion al cliente se recomienda supervision humana y filtros de contenido.
- El uso de decodificacion por beams (num_beams=5) es el recomendado en la model card; otros parametros de generacion pueden producir resultados menos fiables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gplsi/Aitana-TA-7B-S
- Modelo base: https://huggingface.co/BSC-LT/salamandraTA-7b-instruct
- Paper de IberoBench: https://aclanthology.org/2025.coling-main.699/
- GPLSI (Universidad de Alicante): https://gplsi.dlsi.ua.es/
- CENID (Centro de Inteligencia Digital): https://cenid.es
