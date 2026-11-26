# credible-ai/olmo2-1B-24domains-dirichlet-lightgbm-arc

## Resumen

`olmo2-1B-24domains-dirichlet-lightgbm-arc` es un modelo de lenguaje de 1.414 millones de parámetros desarrollado por el equipo de credible-ai como artefacto de investigación para reproducir los experimentos del artículo LinMix (Data Mixing as Linear Domain Attribution). Se trata de un modelo OLMo 2 de 1B preentrenado desde cero sobre 32.000 millones de tokens procedentes del corpus WebOrganizer, con una mezcla de dominios optimizada mediante RegMix (surrogate LightGBM ajustado sobre un enjambre Dirichlet) para maximizar el rendimiento en el benchmark ARC.

El modelo no está pensado como un modelo de propósito general, sino como una pieza reproducible dentro de un estudio sobre mezcla de datos (data mixing). Su relevancia radica en que permite a investigadores replicar y auditar cómo distintas estrategias de atribución lineal de dominios afectan al rendimiento de un modelo de 1B, con pesos publicados en bfloat16 y la mezcla de datos documentada en `mix.json`.

Arquitectónicamente es un transformer decoder-only de la familia OLMo 2, con 18 capas, dimensión oculta de 2048 y tokenizador GPT-NeoX-20B de 50.432 tokens. Solo soporta inglés y su licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 1.414.678.528 (1,41B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo 2 implementada en Transformers (`Olmo2ForCausalLM`): 18 capas, dimensión oculta 2048 y tokenizador GPT-NeoX-20B con vocabulario de 50.432 tokens. Los pesos se publican en bfloat16 y el repositorio ocupa 2,8 GB.

El preentrenamiento se realizó con OLMo-core sobre 32.000 millones de tokens extraídos del corpus WebOrganizer, que a su vez deriva del pool DCLM 1b-1x (CC-BY-4.0) y está sujeto a los términos de uso de Common Crawl. La innovación metodológica no está en la arquitectura sino en la mezcla de datos: los pesos de mezcla sobre los 24 temas del corpus se optimizaron con RegMix, usando un surrogate LightGBM ajustado sobre un enjambre Dirichlet generado con un modelo proxy de 30M (`olmo2-30M-24domains-dirichlet`), con el benchmark ARC como objetivo. La mezcla exacta está documentada en `mix.json`. No se indica en la información disponible si hubo fases de RLHF, DPO o SFT posteriores.

## Capacidades

- Generación de texto autoregresiva en inglés.
- Razonamiento y respuesta a preguntas de tipo ARC (el benchmark objetivo de la mezcla).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta modo thinking, visión ni audio.
- Uso previsto: reproducción de experimentos de mezcla de datos, no uso general.

## Casos de uso

- Reproducción de experimentos LinMix: cargar el modelo y la mezcla `mix.json` para replicar los resultados del artículo sobre atribución lineal de dominios en un modelo de 1B.
- Estudio de mezcla de datos a escala 1B: comparar esta mezcla optimizada para ARC con otras mezclas (por ejemplo, las generadas con distintos objetivos o surrogates) manteniendo fijo el resto del pipeline de entrenamiento.
- Investigación sobre proxies de bajo coste: validar si un proxy de 30M con enjambre Dirichlet predice correctamente el comportamiento de un modelo 47 veces mayor entrenado con la mezcla derivada.
- Análisis de atribución de dominios: usar los pesos de mezcla y el modelo resultante para estudiar qué temas del corpus WebOrganizer contribuyen más al rendimiento en tareas de razonamiento tipo ARC.
- Baseline controlado en papers de data mixing: servir como referencia entrenada con una mezcla concreta frente a baselines uniformes o heurísticos.
- Docencia e investigación académica: experimentos de bajo coste (1,4B parámetros, 32B tokens) para ilustrar pipelines de optimización de mezclas con RegMix y LightGBM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB según longitud de secuencia.
- En cuantización de 8 bits cabría en torno a 1,5-2 GB de pesos; en 4 bits, alrededor de 0,8-1 GB (no se publican pesos cuantizados oficiales).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060, 4060, 4070, 4090) es suficiente; A100/H100 no son necesarias para inferencia.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más.
- Opciones de despliegue: Transformers (compatible con `AutoModelForCausalLM`); vLLM, llama.cpp, Ollama o TGI no están documentados oficialmente para este checkpoint, aunque al ser safetensors estándar podrían funcionar con conversión previa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| olmo2-1B-24domains-dirichlet-lightgbm-arc | 1,41B | no disponible | MIT | Hugging Face | Artefacto de investigación, solo inglés |
| OLMo 2 1B (AllenAI) | ~1,2B | no disponible | Apache 2.0 | Hugging Face | Modelo base de propósito general |
| SmolLM2-1.7B | 1,7B | no disponible | Apache 2.0 | Hugging Face | Modelo pequeño multilingüe orientado a uso general |
| TinyLlama-1.1B | 1,1B | no disponible | Apache 2.0 | Hugging Face | Modelo pequeño entrenado sobre 3T tokens |

La comparación con modelos de propósito general no es del todo justa: este checkpoint está entrenado con solo 32B tokens y optimizado para un benchmark concreto, por lo que su rendimiento fuera de ARC será previsiblemente inferior.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de propósito general; el autor lo declara explícitamente.
- Entrenado únicamente con 32.000 millones de tokens, muy por debajo de los volúmenes habituales en modelos de 1B de uso general.
- Solo inglés; no se documenta soporte multilingüe.
- Riesgo elevado de alucinación y de respuestas pobres fuera del dominio de ARC y del corpus WebOrganizer.
- Sesgos heredados del corpus DCLM/Common Crawl, sin filtrado adicional documentado más allá del pipeline de WebOrganizer.
- La mezcla está sobreoptimizada para ARC; puede degradar el rendimiento en otras tareas.
- Licencia MIT en los pesos, pero los datos de entrenamiento están sujetos a los términos de Common Crawl y a la licencia CC-BY-4.0 del pool DCLM; conviene revisar las obligaciones de atribución antes de un uso comercial.
- No se documentan longitudes de contexto máximas ni comportamiento en secuencias largas.
- No se han publicado benchmarks independientes; cualquier evaluación de calidad debe realizarse por el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-1B-24domains-dirichlet-lightgbm-arc
- Modelo proxy de 30M: https://huggingface.co/credible-ai/olmo2-30M-24domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Código LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Documentación OLMo 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- OLMo-core: https://github.com/allenai/OLMo-core
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
