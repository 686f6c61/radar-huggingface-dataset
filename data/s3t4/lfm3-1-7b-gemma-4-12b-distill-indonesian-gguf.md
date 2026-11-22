# s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian-GGUF

## Resumen

LFM3-1.7B-Gemma-4-12B-Distill-Indonesian-GGUF es la versión cuantizada en formato GGUF de un checkpoint de LiquidAI/LFM3-1.7B afinado para indonesio mediante destilación de conocimiento desde google/gemma-4-12B-it como modelo profesor. El autor de la conversión y del ajuste es el usuario s3t4, y el artefacto está pensado para inferencia local eficiente en CPU y GPU a través de llama.cpp, Ollama, LM Studio y AnythingLLM. El modelo base cuenta con 1.728.801.600 parámetros (1,73B) y una arquitectura descrita por el autor como tri-híbrida con ventana de contexto de 256K tokens.

El problema que resuelve es doble: por un lado, adaptar un modelo pequeño de la familia LFM3 al indonesio, un idioma con menos cobertura en modelos abiertos de propósito general; por otro, hacerlo mediante destilación de las razones (rationale) e instrucciones de un profesor mucho mayor (Gemma-4-12B-it), de modo que el modelo pequeño herede parte de la capacidad de razonamiento del grande. Los resultados publicados en la model card muestran mejoras sustanciales frente al baseline y frente a la variante solo con SFT en IndoMMLU y XCOPA-ID.

La relevancia actual está en que ofrece una alternativa de 1,73B parámetros ejecutable en hardware de consumo (1,10 GB en Q4_K_M) con licencia LFM Open License v1.0 y soporte para toolchains estándar de inferencia local. El repositorio incluye tres cuantizaciones (Q4_K_M, Q8_0 y F16) y plantilla de chat ChatML integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrida (según model card del autor; familia LFM3 de LiquidAI) |
| Parametros totales | 1.728.801.600 (1,73B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (según model card del autor) |
| Tipos de cuantizacion | Q4_K_M (4-bit), Q8_0 (8-bit), F16 (16-bit) |
| Idiomas soportados | Indonesio (id) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | GGUF (convertido con convert_hf_to_gguf.py + llama-quantize) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, descrito por el autor como una arquitectura tri-híbrida con ventana de contexto de 256K tokens. Sobre ese checkpoint se aplicó un proceso de destilación de conocimiento desde google/gemma-4-12B-it (Apache 2.0), combinando destilación de razonamientos (rationale distillation) y de instrucciones. El resultado es un modelo de 1,73B parámetros orientado a generación de texto conversacional en indonesio.

Los datos de entrenamiento citados en la model card incluyen los datasets indolem/IndoMMLU, cambridgeltl/xcopa, CohereLabs/aya_dataset y AksaraLLM/aksara-sft-clean-v1. No se especifica el número exacto de tokens de entrenamiento ni la composición detallada del dataset, ni si hubo fases de RLHF o DPO. La evaluación publicada se realizó zero-shot con `enable_thinking=False` y logits del primer token, sobre 300 preguntas no regionales de IndoMMLU (seed=42, index < 300) y las 500 preguntas de test de XCOPA-ID.

## Capacidades

- Generación de texto conversacional en indonesio con plantilla ChatML.
- Razonamiento y conocimiento general en indonesio, medido en IndoMMLU.
- Razonamiento de sentido común en indonesio, medido en XCOPA-ID.
- Destilación de razonamientos desde un profesor de 12B, lo que se traduce en mejoras de hasta +21,67 pp en IndoMMLU frente al baseline.
- Inferencia local en CPU y GPU mediante llama.cpp, Ollama, LM Studio y AnythingLLM.
- Compatibilidad con endpoints OpenAI (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Asistente conversacional en indonesio para atención al cliente: el modelo puede mantener conversaciones multi-turno con la plantilla ChatML y un system prompt en indonesio, con un tamaño de 1,10 GB en Q4_K_M que permite desplegarlo en portátiles y equipos sin GPU dedicada.
- Evaluación educativa y respuesta a preguntas de conocimiento general: su rendimiento en IndoMMLU (47,00% en la versión BF16) lo hace útil para prototipos de tutores o QA sobre temario en indonesio, siempre con verificación humana.
- Razonamiento de sentido común en tareas de NLP en indonesio: el 75,40% en XCOPA-ID lo sitúa como candidato para pipelines de inferencia de causa-efecto, clasificación de relaciones y tareas similares en ese idioma.
- Despliegue en local para desarrollo y pruebas offline: al estar en GGUF y ser compatible con llama.cpp y Ollama, se puede integrar en entornos sin conexión o con requisitos de privacidad, usando `llama-server` como API compatible con OpenAI.
- Generación de contenido y resúmenes en indonesio en aplicaciones de escritorio: LM Studio y AnythingLLM permiten cargar el modelo con la plantilla ChatML integrada para tareas de redacción asistida.
- Filtrado y preprocesado de corpus en indonesio: por su tamaño reducido y bajo coste de inferencia, puede emplearse para tareas de clasificación, normalización o generación de datos sintéticos en pipelines de NLP.
- Base para experimentos de destilación: el checkpoint y sus cuantizaciones sirven como referencia reproducible para investigar destilación de profesores grandes a modelos pequeños en idiomas de bajos recursos.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación zero-shot, `enable_thinking=False`, primer token):

| Benchmark | LFM3-1.7B baseline | LFM3-1.7B-Indonesian (SFT) | LFM3-1.7B-Distilled (BF16) | Δ vs SFT / Base | Profesor Gemma-4-12B-it |
|---|---|---|---|---|---|
| IndoMMLU (Bahasa Indonesia) | 25,33% (76/300) | 36,33% (109/300) | 47,00% (141/300) | +10,67 pp / +21,67 pp | 66,67% |
| IndoMMLU (Pengetahuan Umum) | 26,00% (78/300) | 33,33% (100/300) | 46,67% (140/300) | +13,34 pp / +20,67 pp | 59,00% |
| XCOPA-ID (Commonsense) | 58,60% (293/500) | 58,40% (292/500) | 75,40% (377/500) | +17,00 pp / +16,80 pp | 86,20% |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q4_K_M requiere aproximadamente 1,10 GB de pesos (1,02 GiB); Q8_0 unos 1,85 GB (1,72 GiB); F16 unos 3,47 GB (3,23 GiB). A esto hay que sumar el espacio para el contexto KV cache, que crece con la longitud de contexto configurada.
- GPU recomendadas: no se especifican en la model card. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM libre puede alojar las cuantizaciones Q4_K_M y Q8_0; para F16 se recomienda al menos 4-6 GB.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares, así como en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (build compatible con arquitectura LFM3), llama-server (API compatible con OpenAI), Ollama (con versión compatible con LFM3), LM Studio y AnythingLLM.
- Latencia y throughput: no disponibles en la información proporcionada. El autor recomienda `temperature=0.1`, `top_k=50` y `repeat_penalty=1.1` para chat general.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IndoMMLU | XCOPA-ID | Licencia | Formato |
|---|---|---|---|---|---|---|
| LFM3-1.7B-Gemma-4-12B-Distill-Indonesian (BF16) | 1,73B | 256K | 47,00% | 75,40% | LFM Open License v1.0 | GGUF / safetensors |
| LFM3-1.7B-Indonesian (SFT) | 1,73B | 256K | 36,33% | 58,40% | LFM Open License v1.0 | no disponible |
| LFM3-1.7B baseline | 1,73B | 256K | 25,33% | 58,60% | LFM Open License v1.0 | no disponible |
| Gemma-4-12B-it (profesor) | 12B (aprox.) | no disponible | 66,67% | 86,20% | Apache 2.0 | no disponible |

No se dispone de datos de otros modelos comparables de tamaño similar entrenados específicamente para indonesio en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en indonesio; no se garantiza un rendimiento adecuado en otros idiomas.
- Riesgo de alucinación inherente a modelos pequeños destilados: los resultados en IndoMMLU (47,00%) y XCOPA-ID (75,40%) están por debajo del profesor, por lo que no debe usarse como fuente de verdad sin verificación.
- Sesgos potenciales derivados de los datasets de entrenamiento (IndoMMLU, XCOPA, aya_dataset, aksara-sft-clean-v1) y de las salidas sintéticas del profesor Gemma-4-12B-it; no se documenta un análisis de sesgos.
- Licencia LFM Open License v1.0: es necesario revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar y puede imponer restricciones adicionales.
- La arquitectura LFM3 requiere builds de llama.cpp, Ollama o LM Studio compatibles con `lfm3`; versiones antiguas pueden no cargar el modelo.
- El contexto declarado de 256K tokens puede no ser alcanzable en la práctica con cuantizaciones bajas o hardware limitado, y no se han publicado evaluaciones de rendimiento en contextos largos.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; asumir su ausencia en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- El tamaño del repo (6,4 GB) incluye las tres cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian-GGUF
- Modelo base (checkpoint destilado): https://huggingface.co/s3t4/LFM3-1.7B-Gemma-4-12B-Distill-Indonesian
- Modelo original LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Modelo profesor: https://huggingface.co/google/gemma-4-12B-it
- Dataset IndoMMLU: https://huggingface.co/datasets/indolem/IndoMMLU
- Dataset XCOPA: https://huggingface.co/datasets/cambridgeltl/xcopa
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset Aksara SFT: https://huggingface.co/datasets/AksaraLLM/aksara-sft-clean-v1
