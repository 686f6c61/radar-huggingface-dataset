# credible-ai/olmo2-1B-24domains-dirichlet-lightgbm-hellaswag

## Resumen

`olmo2-1B-24domains-dirichlet-lightgbm-hellaswag` es un modelo de lenguaje de 1.414.678.528 parámetros (1,41B) desarrollado por credible-ai, preentrenado sobre 32.000 millones de tokens extraídos del corpus WebOrganizer. Se trata de un artefacto de investigación concebido para reproducir los experimentos del artículo LinMix (Data Mixing as Linear Domain Attribution), no de un modelo de propósito general. Su nombre codifica la receta completa: arquitectura OLMo 2 de 1B, mezcla de datos sobre 24 dominios temáticos generada mediante un enjambre Dirichlet, ajuste de un surrogate LightGBM bajo el método RegMix y optimización de los pesos de mezcla para la tarea HellaSwag.

El modelo parte de la arquitectura OLMo 2 (`Olmo2ForCausalLM` en Transformers), con 18 capas y un tamaño oculto de 2048, y utiliza el tokenizador de GPT-NeoX-20B con un vocabulario de 50.432 entradas. El preentrenamiento se realizó con OLMo-core sobre 32B tokens, con pesos en bfloat16 y licencia MIT. Solo soporta inglés.

Su relevancia es metodológica más que de rendimiento: sirve como referencia reproducible para estudiar cómo la selección de pesos de mezcla de dominios afecta al rendimiento en un benchmark concreto, y permite a investigadores comparar estrategias de data mixing (RegMix con surrogate LightGBM frente a otras alternativas) sobre un mismo corpus y una misma arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only, 18 capas, hidden size 2048 |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 |
| Tokens de entrenamiento | 32B |
| Corpus de entrenamiento | WebOrganizer/Corpus-200B (24 dominios temáticos) |
| Metodo de mezcla | RegMix con surrogate LightGBM sobre enjambre Dirichlet |
| Proxy swarm | credible-ai/olmo2-30M-24domains-dirichlet |
| Libreria | transformers |
| Tamano del repo | 2,8 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2 en su variante de 1B: un transformer decoder-only de 18 capas con tamaño oculto de 2048, implementado como `Olmo2ForCausalLM` en Transformers. El tokenizador es el de GPT-NeoX-20B (vocabulario de 50.432 tokens). Los pesos se distribuyen en bfloat16.

El entrenamiento consistió en 32.000 millones de tokens procedentes de WebOrganizer/Corpus-200B, un corpus derivado del pool DCLM 1b-1x (CC-BY-4.0) y sujeto a los términos de uso de Common Crawl. La innovación central no reside en la arquitectura sino en la estrategia de mezcla de datos: el corpus se organiza en 24 dominios temáticos y los pesos de mezcla se optimizan mediante RegMix, que ajusta un surrogate LightGBM sobre un enjambre de mezclas Dirichlet generadas con un modelo proxy de 30M parámetros (`olmo2-30M-24domains-dirichlet`). Los pesos resultantes se optimizan específicamente para HellaSwag. El pipeline completo se ejecutó con OLMo-core y el archivo `mix.json` del repositorio documenta la mezcla final de datos de entrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Razonamiento básico y respuesta a preguntas de sentido común (el objetivo de optimización es HellaSwag).
- Modelado de lenguaje general sobre dominios web diversos (24 categorías temáticas del corpus WebOrganizer).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: únicamente inglés.
- No dispone de modo thinking, visión ni audio.
- Capacidad de instrucciones: no documentada (es un modelo base preentrenado, no ajustado con RLHF/DPO según la información disponible).

## Casos de uso

- Reproducción de experimentos de data mixing: el modelo permite replicar los resultados del artículo LinMix sobre HellaSwag con un corpus y una arquitectura fijos, sirviendo como baseline controlado para comparar nuevas estrategias de mezcla de dominios.
- Investigación sobre atribución lineal de dominios: al estar entrenado con una mezcla conocida y documentada en `mix.json`, permite estudiar la contribución de cada uno de los 24 dominios temáticos al rendimiento final.
- Validación de pipelines RegMix: investigadores que quieran comprobar la eficacia de surrogates LightGBM frente a otras alternativas (por ejemplo, regresión lineal o modelos de mezcla gaussianos) pueden usar este modelo como punto de referencia entrenado con la receta canónica.
- Estudio de modelos proxy pequeños: el enjambre Dirichlet se generó con un proxy de 30M parámetros; este modelo de 1B permite analizar la transferibilidad de los pesos de mezcla del proxy al modelo final.
- Experimentos de scaling controlado: con una arquitectura OLMo 2 fija y un presupuesto de 32B tokens, sirve para aislar el efecto de la mezcla de datos frente a variaciones de tamaño o arquitectura.
- Docencia y formación en data-centric AI: como artefacto pequeño (2,8 GB, 1,41B parámetros), es adecuado para demostrar en entornos académicos cómo se diseña y documenta un experimento de mezcla de datos reproducible de principio a fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los pesos de mezcla se optimizaron para HellaSwag, pero no incluye cifras de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más memoria para el contexto y el estado de atención; en la práctica, unos 4-6 GB según la longitud de secuencia.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, alrededor de 0,8 GB (las cuantizaciones no están publicadas por el autor, pero son viables con herramientas estándar).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en entornos de servidor, A100, H100 o L40S quedan sobredimensionadas para este tamaño.
- Cabe holgadamente en GPU consumer: sí, en todas las RTX con 8 GB o más, e incluso en GPUs integradas con suficiente memoria compartida para cuantizaciones agresivas.
- Opciones de despliegue: transformers (soporte nativo vía `Olmo2ForCausalLM`), vLLM, TGI y llama.cpp/Ollama si se generan pesos GGUF (no publicados por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| olmo2-1B-24domains-dirichlet-lightgbm-hellaswag | 1,41B | no disponible | MIT | en | Artefacto de investigación con mezcla RegMix optimizada para HellaSwag |
| OLMo 2 1B (AllenAI) | ~1,2B | no disponible en esta ficha | Apache 2.0 | en | Modelo base oficial de la familia OLMo 2; referencia arquitectónica |
| credible-ai/olmo2-30M-24domains-dirichlet | ~30M | no disponible | no disponible | en | Proxy swarm usado para generar las mezclas Dirichlet; mismo corpus |
| TinyLlama 1.1B | 1,1B | 2048 | Apache 2.0 | en | Modelo pequeño de propósito general, con ajuste por instrucciones |

La comparación con OLMo 2 1B oficial es la más directa: misma arquitectura y escala, pero con una mezcla de datos distinta y un objetivo de optimización específico. TinyLlama sirve como referencia de un modelo de tamaño similar orientado a uso general, frente al carácter puramente investigador de este artefacto.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como artefacto de investigación para reproducir LinMix, no para uso en producción.
- Entrenado únicamente en inglés; no soporta otros idiomas.
- Sin ajuste por instrucciones ni RLHF/DPO documentado: no cabe esperar un comportamiento conversacional fiable.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, propio de un modelo base de 1,4B entrenado con 32B tokens.
- Sesgos heredados del corpus DCLM 1b-1x y de Common Crawl, incluyendo sesgos web y de representación.
- La mezcla de datos está optimizada para un único benchmark (HellaSwag), lo que puede implicar un rendimiento desequilibrado en otras tareas.
- Longitud de contexto no documentada: no se debe asumir una ventana larga en producción.
- Licencia MIT para los pesos, pero los datos de entrenamiento están sujetos a CC-BY-4.0 y a los términos de uso de Common Crawl; conviene revisar las obligaciones de atribución si se redistribuye.
- No se han publicado benchmarks ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-24domains-dirichlet-lightgbm-hellaswag
- Proxy swarm (30M): https://huggingface.co/credible-ai/olmo2-30M-24domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Documentación de OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
