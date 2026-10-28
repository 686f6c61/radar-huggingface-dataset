# credible-ai/olmo2-1B-24domains-vertex-linearsqrt-cpile

## Resumen

`olmo2-1B-24domains-vertex-linearsqrt-cpile` es un modelo de lenguaje de 1.414.678.528 parámetros desarrollado por el equipo de credible-ai, construido sobre la arquitectura OLMo 2 (`Olmo2ForCausalLM`) con 18 capas y un tamaño oculto de 2048. No es un modelo de propósito general: se trata de un artefacto de investigación diseñado para reproducir los experimentos del paper LinMix sobre mezcla de datos (*data mixing*). El modelo se preentrenó desde cero con 32.000 millones de tokens extraídos del corpus WebOrganizer, compuesto por 24 dominios temáticos, usando unos pesos de mezcla optimizados por LinMix para minimizar *bits per byte* sobre texto reservado de Common Pile.

La relevancia del modelo es metodológica, no de capacidades. LinMix ajusta un sustituto lineal sobre un enjambre de modelos proxy pequeños (en este caso `olmo2-30M-24domains-vertex`) con una utilidad de raíz cuadrada (r = 0,5) para predecir la mezcla óptima de dominios de datos a mayor escala. Este checkpoint de 1B es el punto de validación de esa transferencia de escala, y su interés práctico reside en que permite inspeccionar y replicar el pipeline completo: pesos, mezcla (`mix.json`), tokenizador y datos tokenizados están publicados.

El modelo se distribuye con licencia MIT para los pesos y en formato *bfloat16* nativo, con un tokenizador GPT-NeoX-20B de 50.432 entradas. Solo declara inglés como idioma. La longitud de contexto no se especifica en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only denso |
| Parámetros totales | 1.414.678.528 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantización | no se publican pesos cuantizados; al ser un checkpoint *bfloat16* de transformers es convertible a int8/int4 con herramientas estándar (bitsandbytes, GPTQ, AWQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT (pesos); los datos de entrenamiento están sujetos a CC-BY-4.0 y a los términos de uso de Common Crawl |
| Formato de pesos | safetensors, *bfloat16* |
| Capas | 18 |
| Tamaño oculto | 2048 |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 entradas |
| Tokens de entrenamiento | 32.000 millones |
| Framework de entrenamiento | OLMo-core |
| Tamaño del repositorio | 2,8 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2 en su variante de 1B: un transformer decoder-only denso de 18 capas con tamaño oculto 2048, implementado en transformers como `Olmo2ForCausalLM`. El tokenizador es el de GPT-NeoX-20B (50.432 tokens), reutilizado sin modificaciones respecto al resto de la familia OLMo. El preentrenamiento se ejecutó con OLMo-core sobre exactamente 32.000 millones de tokens muestreados del corpus WebOrganizer, que agrupa texto web en 24 dominios temáticos y deriva del pool DCLM 1b-1x (CC-BY-4.0), a su vez sujeto a los términos de uso de Common Crawl. Los pesos se publican en *bfloat16* y la mezcla exacta empleada se incluye como `mix.json`.

La innovación técnica no está en el modelo sino en el método de mezcla. LinMix ajusta un sustituto lineal sobre un enjambre de modelos proxy de 30M de parámetros (`olmo2-30M-24domains-vertex`) y, con una función de utilidad de raíz cuadrada (r = 0,5) evaluada en vértices del símplex de mezclas, extrapola los pesos óptimos por dominio para el modelo objetivo, optimizando *bits per byte* sobre texto reservado de Common Pile. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de ajuste posterior al preentrenamiento; se trata de un checkpoint de preentrenamiento puro.

## Capacidades

- Generación de texto autoregresiva en inglés, limitada al nivel propio de un modelo de 1,4B parámetros preentrenado sin ajuste instructivo.
- Modelado de lenguaje y estimación de *bits per byte* / perplejidad por dominio temático, que es su función principal como artefacto de investigación.
- Reproducción de experimentos de mezcla de datos: permite verificar si la mezcla predicha por LinMix a escala 30M se transfiere a 1B.
- Inspección del efecto de los pesos de mezcla por dominio: al ser un modelo entrenado sobre una mezcla concreta, sirve como punto de comparación frente a otras mezclas del mismo corpus.
- Base para estudios de *scaling* de recetas de datos: 32B tokens sobre 1,4B parámetros ofrece una relación tokens/parámetro de aproximadamente 22,6.
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso, agentes, visión, audio ni modo *thinking*. Al no tener ajuste instructivo, no se espera comportamiento de chat ni seguimiento fiable de instrucciones.

## Casos de uso

- Reproducción del paper LinMix: cargar el checkpoint y evaluar *bits per byte* sobre el conjunto reservado de Common Pile para contrastar la mezcla predicha por el sustituto lineal con la mezcla realmente usada.
- Validación de transferencia de escala en mezclas de datos: comparar este modelo de 1B con el proxy de 30M para medir cuánto se desvía el óptimo de mezcla al crecer el tamaño del modelo.
- Baseline en experimentos de *data mixing*: sirve como referencia entrenada sobre una mezcla concreta de 24 dominios frente a la que contrastar métodos alternativos (DoReMi, RegMix, mezclas uniformes o proporcionales al corpus).
- Estudio de composición de dominios web: analizar cómo afecta el peso asignado a cada uno de los 24 temas de WebOrganizer a la perplejidad en subconjuntos temáticos específicos.
- Banco de pruebas de pipelines de tokenización y preprocesado: el par de dataset tokenizado (`credible-ai/weborganizer-corpus-200b-tokenized`) y este checkpoint permiten verificar de extremo a extremo un flujo de entrenamiento con OLMo-core.
- Experimentación con recursos limitados: con 1,4B parámetros y pesos *bfloat16* de 2,8 GB, cabe en una GPU de consumo y permite hacer *fine-tuning* o evaluaciones a pequeña escala sin infraestructura dedicada.
- Docencia y formación en entrenamiento de LLM: al publicar pesos, mezcla, tokenizador y datos tokenizados, es un caso completo y trazable para explicar el ciclo de vida de un preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, HellaSwag ni ninguna otra métrica de evaluación estándar; la única métrica mencionada es *bits per byte* sobre texto reservado de Common Pile, utilizada como objetivo de optimización de la mezcla y sin valores numéricos publicados.

## Requisitos de hardware

- VRAM estimada para inferencia en *bfloat16*: aproximadamente 2,8 GB solo para pesos, más caché KV; en la práctica entre 4 y 6 GB según longitud de secuencia y tamaño de lote.
- VRAM estimada en int8: alrededor de 1,5 GB para pesos; en int4, alrededor de 0,8 GB, más caché KV y *overhead* del runtime.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090, L4, A10G). Para *fine-tuning* completo en *bfloat16* con AdamW se necesita memoria para estados del optimizador, del orden de 16-20 GB, por lo que conviene una A100 40GB, H100 o técnicas de memoria eficiente (LoRA, DeepSpeed ZeRO, FSDP).
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más para inferencia en *bfloat16*, y en tarjetas de 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo de `Olmo2ForCausalLM`), vLLM y TGI siempre que la versión instalada incluya la arquitectura OLMo 2. No se publican pesos GGUF, por lo que para llama.cpp u Ollama habría que convertir el checkpoint y generar el fichero cuantizado.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `credible-ai/olmo2-1B-24domains-vertex-linearsqrt-cpile` | 1,41B | no disponible | Investigación en mezcla de datos (LinMix), solo preentrenamiento | MIT | HuggingFace, 0 descargas |
| OLMo 2 1B (AllenAI) | ~1,2B | 4.096 tokens (modelo base de referencia) | Modelo base de propósito general | Apache 2.0 | HuggingFace, ampliamente usado |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Preentrenamiento + ajuste instructivo | Apache 2.0 | HuggingFace, muy extendido |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Modelo pequeño con variantes instruct | Apache 2.0 | HuggingFace, muy extendido |

La comparación relevante es frente a OLMo 2 1B original: este checkpoint comparte arquitectura y tokenizador, pero cambia la distribución de datos de entrenamiento (mezcla optimizada sobre 24 dominios de WebOrganizer frente al corpus de propósito general de AllenAI) y carece de fases de ajuste posteriores. Los datos de contexto de los modelos comparables provienen de sus fichas públicas; el contexto de este checkpoint no está documentado.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo describe explícitamente como un modelo para reproducir experimentos, no como un modelo de lenguaje de propósito general. No debería usarse en producción orientada a usuarios.
- Sin ajuste instructivo: no se ha aplicado RLHF, DPO ni SFT, por lo que no sigue instrucciones de forma fiable, no mantiene formato de chat y no debe emplearse como asistente.
- Solo inglés: la model card declara únicamente `en`; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Dataset de origen web: el corpus deriva de Common Crawl vía DCLM, por lo que hereda sesgos, toxicidad, contenido de baja calidad y posibles datos personales presentes en la web. No se documenta ningún proceso de filtrado o mitigación adicional más allá del propio pipeline de WebOrganizer.
- Riesgo de alucinación: al ser un modelo de 1,4B preentrenado sin alineación, la generación de hechos falsos con apariencia plausible es esperable y no mitigada.
- Contexto no documentado: no se especifica la longitud de contexto entrenada, lo que impide planificar despliegues con secuencias largas sin verificación empírica previa.
- Licencia de los datos: aunque los pesos son MIT, el texto de entrenamiento está sujeto a CC-BY-4.0 y a los términos de uso de Common Crawl. Un uso comercial debe evaluar la cadena de licencias del corpus, no solo la de los pesos.
- Sin métricas de calidad publicadas: no hay benchmarks que permitan estimar su utilidad fuera del objetivo de *bits per byte*, y el modelo acumula 0 descargas y 0 *likes*, sin evidencia de uso externo.
- Reproducibilidad dependiente de la versión: requiere una versión de transformers que soporte `Olmo2ForCausalLM`; versiones antiguas no cargarán el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-24domains-vertex-linearsqrt-cpile
- Modelo proxy del enjambre (30M): https://huggingface.co/credible-ai/olmo2-30M-24domains-vertex
- Código de LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentación de OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
