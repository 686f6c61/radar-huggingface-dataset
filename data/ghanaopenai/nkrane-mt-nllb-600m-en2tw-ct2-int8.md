# ghanaopenai/nkrane-mt-nllb-600m-en2tw-ct2-int8

## Resumen

Nkrane-MT NLLB 600M English → Twi (CTranslate2 int8) es una conversión optimizada del modelo de traducción `ghanaopenai/nkrane-mt-nllb-600m-en2tw`, desarrollado por GhanaOpenAI. Se trata de un fine-tuning de la arquitectura NLLB (No Language Left Behind) de Meta, con aproximadamente 600 millones de parámetros, especializado en la traducción de inglés a twi asante (una de las principales lenguas de Ghana). El modelo se distribuye en formato CTranslate2 con cuantización int8, lo que reduce el peso del repositorio a unos 0,7 GB y permite inferencia de alta throughput en una única GPU NVIDIA H200.

La relevancia de este modelo radica en su enfoque en una lengua de bajos recursos (low-resource language): el twi asante cuenta con relativamente pocos recursos digitales y modelos de traducción de calidad. Al partir de NLLB y aplicar fine-tuning específico, GhanaOpenAI busca cubrir ese hueco con una licencia permisiva (Apache 2.0) y un formato listo para producción. La conversión a CTranslate2 int8 está pensada para despliegues de traducción por lotes (batch translation) con latencia reducida y bajo consumo de memoria.

Además, el modelo forma parte del ecosistema `nkrane-mt`, que incluye una librería de inferencia con soporte para marcadores de sintagmas nominales (`preserve_markers`), glosarios y sustitución controlada. Esto lo hace útil no solo como traductor genérico, sino como componente en pipelines de traducción asistida o con terminología controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB, base de 600M) |
| Parametros totales | ~600 millones (según nombre del modelo; no se detalla en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite de NLLB; la CLI usa `--max-chunk-tokens 500` y `--model-token-limit 500`) |
| Tipos de cuantizacion | int8 (CTranslate2); el modelo base original probablemente admite otras, pero no se especifica |
| Idiomas soportados | inglés (en) y twi asante (tw) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (int8); el modelo base en formato transformers/safetensors no se detalla en esta ficha |

## Arquitectura y entrenamiento

El modelo base `ghanaopenai/nkrane-mt-nllb-600m-en2tw` es un fine-tuning de NLLB (No Language Left Behind) de Meta, una arquitectura transformer encoder-decoder diseñada específicamente para traducción multilingüe. NLLB-600M es una de las variantes más pequeñas de la familia NLLB, pensada para despliegues con recursos limitados. El fine-tuning se ha orientado a la dirección inglés → twi asante, lo que implica un ajuste sobre el modelo multilingüe original para especializarlo en este par de lenguas.

La model card no proporciona detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO (poco habituales en modelos de traducción). Tampoco se detalla si hubo aumentación de datos o técnicas de destilación. La innovación técnica destacable de esta ficha concreta es la conversión a CTranslate2 4.9.1 con cuantización int8, que reduce el tamaño y acelera la inferencia en CPU y GPU, y la integración con la librería `nkrane-mt`, que permite preservar marcadores de sintagmas nominales entre corchetes (`preserve_markers=True`) sin aplicar sustitución de glosario ni reranking.

## Capacidades

- Traducción de texto de inglés a twi asante (dirección única en2tw).
- Soporte de traducción por lotes (`translate_batch`) con tamaños de batch configurables (por ejemplo, 256).
- Preservación de marcadores de sintagmas nominales entre corchetes angulares (`<a book>`) cuando se usa `preserve_markers=True`.
- Control de sustitución de glosario mediante `skip_substitution` y `use_default_dictionary`.
- Integración con la librería `nkrane-mt` para pipelines de traducción con terminología controlada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües limitadas al par en↔tw (aunque la dirección tw→en no se declara explícitamente en esta ficha; el modelo base podría soportarla, pero no se confirma).

## Casos de uso

- Traducción de documentación técnica y manuales de inglés a twi asante: el modelo puede procesar textos largos dividiéndolos en fragmentos de hasta 500 tokens, adecuado para localización de documentación dirigida a hablantes de twi.
- Atención al cliente en Ghana: integrado en un chatbot o sistema de tickets, puede traducir respuestas de agentes angloparlantes a twi asante en tiempo real, con la ventaja de la cuantización int8 para reducir costes de inferencia.
- Localización de contenido web y marketing: traducción por lotes de descripciones de productos, páginas de aterrizaje y correos electrónicos, usando `translate_batch` con batch_size alto para maximizar throughput en una H200.
- Traducción asistida con terminología controlada: gracias a `preserve_markers` y a la posibilidad de desactivar la sustitución de glosario, se puede mantener terminología específica (nombres de productos, entidades) sin que el modelo la altere.
- Generación de subtítulos y transcripciones: traducción de subtítulos en inglés a twi asante para vídeos educativos o divulgativos, con la limitación de 512 tokens que obliga a segmentar por frases.
- Investigación en traducción automática de bajos recursos: el modelo sirve como baseline o punto de partida para experimentos con twi asante, dado su tamaño moderado (600M) y licencia permisiva.
- Despliegue en entornos con GPU única: la conversión int8 y el tamaño de 0,7 GB permiten ejecutarlo en una sola GPU (por ejemplo, H200) con alta concurrencia, adecuado para servicios de traducción internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~600M parámetros en int8, el peso de los pesos ronda los 0,6-0,7 GB; con overhead de activaciones y buffers de CTranslate2, se estima un consumo de VRAM de aproximadamente 1-2 GB para batch pequeño y varios GB para batch grande (256). No se proporcionan cifras oficiales.
- GPU recomendadas: la model card menciona explícitamente una NVIDIA H200 para alto throughput. Por tamaño, también cabría en GPUs consumer como RTX 3060 (12 GB), RTX 4070, RTX 4090, así como en A100, L4 o T4.
- Cabe en GPU consumer: sí, con amplia holgura en cuanto a memoria; el rendimiento dependerá del batch y de la GPU.
- Opciones de despliegue: CTranslate2 (formato nativo de esta ficha), a través de la librería `nkrane-mt`; el modelo base podría desplegarse con transformers, pero esta conversión está pensada para CTranslate2. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no se proporcionan cifras concretas; la model card indica "optimized for high-throughput translation on a single NVIDIA H200" y sugiere batch_size=256, lo que implica que el diseño prioriza throughput sobre latencia individual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ghanaopenai/nkrane-mt-nllb-600m-en2tw-ct2-int8 | ~600M | 512 | en → tw | Apache 2.0 | CTranslate2 int8 |
| ghanaopenai/nkrane-mt-nllb-600m-en2tw (base) | ~600M | 512 | en → tw | Apache 2.0 | transformers (presumiblemente) |
| Meta NLLB-200 distilled 600M | ~600M | 512 | 200 lenguas (incluye tw) | CC-BY-NC 4.0 (no comercial) | transformers |
| Helsinki-NLP opus-mt-en-tw (si existe) | ~70-300M | 512 | en → tw | varía (a menudo CC-BY 4.0) | transformers |

No se dispone de datos de rendimiento comparativo (BLEU, chrF) en la información proporcionada. La comparativa se limita a parámetros, contexto, licencia y formato. La ventaja principal frente a NLLB-200 original es la licencia Apache 2.0 (frente a CC-BY-NC) y la especialización en el par en→tw; frente a modelos OPUS-MT, el tamaño mayor (600M) podría ofrecer mejor calidad, pero no hay datos que lo confirmen.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un fine-tuning sobre NLLB, puede heredar sesgos de género, culturales o geográficos presentes en los datos de entrenamiento de NLLB.
- Riesgo de alucinación: en traducción automática, el riesgo se manifiesta como omisiones, adiciones o traducciones incorrectas, especialmente en terminología especializada o expresiones idiomáticas del twi asante.
- Limitación de contexto: 512 tokens es una ventana relativamente corta; textos largos deben segmentarse (la CLI usa 500 tokens como límite). Esto puede romper la coherencia en documentos extensos.
- Limitación de idioma: solo se declara la dirección inglés → twi asante; no se garantiza la calidad en otras direcciones ni en variantes del twi distintas del asante.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento de NLLB (CC-BY-NC 4.0 para el modelo original de Meta), ya que el fine-tuning podría heredar restricciones si no se ha entrenado con datos propios.
- Caveat para producción: el modelo está empaquetado para CTranslate2 y la librería `nkrane-mt`; su uso fuera de ese ecosistema requeriría adaptaciones. No se documentan métricas de calidad (BLEU, chrF) ni evaluaciones humanas, por lo que la calidad real en producción es desconocida.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- [Hugging Face: ghanaopenai/nkrane-mt-nllb-600m-en2tw-ct2-int8](https://huggingface.co/ghanaopenai/nkrane-mt-nllb-600m-en2tw-ct2-int8)
- [Modelo base: ghanaopenai/nkrane-mt-nllb-600m-en2tw](https://huggingface.co/ghanaopenai/nkrane-mt-nllb-600m-en2tw)
- [CTranslate2](https://github.com/OpenNMT/CTranslate2)
- [NLLB-200 (Meta)](https://ai.meta.com/research/no-language-left-behind/)
