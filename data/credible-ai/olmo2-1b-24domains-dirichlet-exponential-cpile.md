# credible-ai/olmo2-1B-24domains-dirichlet-exponential-cpile

## Resumen

olmo2-1B-24domains-dirichlet-exponential-cpile es un modelo de lenguaje de 1.414.678.528 parámetros (aproximadamente 1,41B) desarrollado por credible-ai, un grupo de investigación centrado en mezcla de datos (data mixing) para entrenamiento de modelos. Se trata de un artefacto de investigación concebido para reproducir los experimentos del artículo LinMix (Data Mixing as Linear Domain Attribution), no de un modelo de propósito general. Está construido sobre la arquitectura OLMo 2 de AI2 (clase `Olmo2ForCausalLM`), con 18 capas y un tamaño de ocultación de 2048.

El modelo ha sido preentrenado con 32.000 millones de tokens extraídos del corpus WebOrganizer, que organiza el contenido en 24 temáticas o dominios. La innovación principal no está en la arquitectura, sino en la estrategia de mezcla de datos: los pesos de mezcla entre los 24 dominios se optimizaron mediante Olmix, un método que ajusta un surrogate exponencial sobre un enjambre de mezclas Dirichlet, empleando bits per byte sobre texto de retención de Common Pile como métrica objetivo. El modelo proxy utilizado para guiar esa optimización es olmo2-30M-24domains-dirichlet, un modelo de 30M parámetros del mismo autor.

Su relevancia es metodológica: sirve como referencia para validar técnicas de atribución lineal de dominios en la composición de datasets de preentrenamiento. El tokenizador es GPT-NeoX-20B con un vocabulario de 50.432 entradas, los pesos están en bfloat16 y el repositorio ocupa 2,8 GB. El modelo solo declara soporte para inglés y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only, 18 capas, hidden size 2048 |
| Parametros totales | 1.414.678.528 (aproximadamente 1,41B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2 de AI2, un transformer decoder-only con 18 capas y dimensión de ocultación de 2048, implementado en la clase `Olmo2ForCausalLM` de Transformers. No emplea mezcla de expertos ni mecanismos híbridos: es un transformer denso convencional. El tokenizador es el de GPT-NeoX-20B, con un vocabulario de 50.432 tokens.

El entrenamiento se realizó con OLMo-core sobre 32.000 millones de tokens procedentes del corpus WebOrganizer/Corpus-200B, que deriva del pool DCLM 1b-1x (licencia CC-BY-4.0) y está sujeto a los términos de uso de Common Crawl. La contribución técnica destacable es la mezcla de datos: los pesos de muestreo entre los 24 dominios temáticos se optimizaron con Olmix, que ajusta un surrogate exponencial sobre un enjambre de mezclas Dirichlet generadas con un modelo proxy de 30M parámetros (olmo2-30M-24domains-dirichlet). El objetivo de optimización es bits per byte sobre texto de retención de Common Pile. El repositorio incluye un fichero `mix.json` con la mezcla exacta empleada. No se documentan fases de RLHF, DPO ni ajuste fino por instrucciones.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base de lenguaje.
- Modelado de lenguaje puro: no se ha sometido a ajuste por instrucciones, por lo que no sigue instrucciones de forma fiable sin un post-entrenamiento adicional.
- Reproducción de experimentos de mezcla de datos: sirve como referencia para validar métodos de atribución lineal de dominios (LinMix).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Reproducción de experimentos de LinMix: el modelo permite replicar los resultados del artículo arXiv:2610.37390 comparando la mezcla optimizada por Olmix con mezclas alternativas sobre los mismos 24 dominios.
- Investigación en data mixing: sirve como punto de control de 1B para estudiar cómo los pesos de mezcla entre dominios afectan a bits per byte en texto de retención.
- Validación de modelos proxy: permite contrastar si las decisiones de mezcla tomadas con el proxy de 30M parámetros se transfieren correctamente a escala de 1B.
- Estudio de atribución lineal de dominios: al estar entrenado sobre 24 temáticas delimitadas, facilita analizar la contribución marginal de cada dominio al rendimiento final.
- Base para ajuste fino experimental: al ser un modelo base de 1,41B con licencia MIT, puede servir de punto de partida en entornos académicos que necesiten un modelo pequeño entrenado con una mezcla controlada.
- Docencia y formación en metodología de preentrenamiento: su tamaño reducido y su documentación de mezcla lo hacen adecuado para ilustrar pipelines de entrenamiento con OLMo-core.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica, entre 4 y 6 GB con contexto moderado.
- En cuantización de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, alrededor de 0,8 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. Cabe en GPU de consumo.
- Opciones de despliegue: Transformers (soporte nativo de `Olmo2ForCausalLM`), vLLM y TGI si incluyen soporte de la arquitectura OLMo 2; llama.cpp y Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| olmo2-1B-24domains-dirichlet-exponential-cpile | 1,41B | no disponible | MIT | Base de investigación con mezcla Olmix sobre 24 dominios |
| olmo2-30M-24domains-dirichlet (credible-ai) | 30M | no disponible | no disponible | Proxy de 30M para el enjambre Dirichlet |
| OLMo 2 1B (AI2) | aproximadamente 1B | no disponible en la informacion disponible | Apache 2.0 (modelo base de AI2) | Modelo base de propósito general |
| Modelos base de 1B tipo Llama 3.2 1B | aproximadamente 1,2B | 128K | Llama Community License | Modelo base/instruido de propósito general |

La comparación con OLMo 2 1B de AI2 es la más directa por compartir arquitectura y tokenizador, pero las diferencias de licencia y de propósito (investigación frente a uso general) son sustanciales. Los datos de benchmarks comparativos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general; no debe usarse en producción como asistente.
- No ha recibido ajuste por instrucciones ni RLHF, por lo que no sigue instrucciones de forma fiable.
- Solo declara soporte de inglés; el rendimiento en otros idiomas no está documentado.
- La longitud de contexto no está especificada en la model card.
- Riesgo de alucinación y de sesgos heredados del corpus DCLM/Common Crawl, sin filtrado documentado más allá del temático.
- Los datos de entrenamiento están sujetos a los términos de uso de Common Crawl y a la licencia CC-BY-4.0 del pool DCLM; conviene revisar obligaciones de atribución aunque los pesos sean MIT.
- No se documentan cuantizaciones oficiales ni conversiones a GGUF; el uso en llama.cpp u Ollama requeriría trabajo adicional no validado por el autor.
- El rendimiento real de la mezcla optimizada solo está validado, según la model card, mediante bits per byte en texto de retención de Common Pile, no mediante benchmarks de tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-24domains-dirichlet-exponential-cpile
- Modelo proxy de 30M: https://huggingface.co/credible-ai/olmo2-30M-24domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Repositorio de código: https://github.com/credibleai/linmix
- Documentación de OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- OLMo-core: https://github.com/allenai/OLMo-core
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
