# credible-ai/olmo2-100M-288domains-vertex

## Resumen

`olmo2-100M-288domains-vertex` es un conjunto de 512 modelos de lenguaje proxy de 102 millones de parámetros, todos con la arquitectura OLMo 2 (`Olmo2ForCausalLM`), publicados por el equipo de credible-ai como material experimental del artículo LinMix (Baniecki, Biecek y Pawelczyk, 2026). No es un modelo de propósito general para producción: cada uno de los 512 checkpoints corresponde a una mezcla de datos distinta del diseño "vertex" del paper, definido sobre 288 dominios temáticos y de formato de WebOrganizer. Su función es servir de sustituto barato (proxy) para estudiar cómo la composición del corpus de entrenamiento afecta al comportamiento de un modelo mayor, sin tener que entrenar el modelo grande para cada mezcla candidata.

La arquitectura es un transformer decoder-only de 12 capas con dimensión oculta 512 y tokenizador GPT-NeoX-20B (vocabulario de 50.432 tokens). Cada proxy se entrena con 3.200 millones de tokens usando OLMo-core, y el repositorio completo ocupa 104,5 GB en bfloat16 (512 carpetas `mix_0` a `mix_511`, cada una con sus pesos y un `mix.json` que documenta la mezcla concreta). La relevancia es metodológica: el repositorio permite reproducir y auditar el diseño experimental de LinMix, así como reutilizar los proxies como banco de pruebas para técnicas de atribución de dominios y mezcla de datos.

El modelo está pensado para investigación en data mixing, no para inferencia de calidad. Con 102M parámetros y entrenamiento exclusivamente en inglés sobre un subconjunto de DCLM, su capacidad generativa es limitada, pero su bajo coste de entrenamiento e inferencia lo convierte en una herramienta útil para barridos experimentales a gran escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only OLMo 2 (`Olmo2ForCausalLM`), 12 capas, hidden size 512 |
| Parametros totales | 102M por modelo (512 modelos, 104 GB en total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT (pesos); datos de entrenamiento sujetos a CC-BY-4.0 y términos de Common Crawl |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Cada uno de los 512 modelos es un transformer decoder-only de la familia OLMo 2 con 12 capas, dimensión oculta 512 y 102M parámetros, usando el tokenizador GPT-NeoX-20B (vocabulario de 50.432 entradas). El entrenamiento se realizó con OLMo-core sobre 3.200 millones de tokens por modelo. La innovación no está en la arquitectura, sino en el diseño experimental: los 512 proxies cubren el "vertex design" del paper LinMix sobre 288 dominios de tema × formato de WebOrganizer, de modo que cada `mix_<i>` corresponde a una mezcla de datos distinta documentada en su `mix.json`.

Los datos proceden de WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x (CC-BY-4.0) y sujeto a los términos de uso de Common Crawl. Las secuencias tokenizadas exactas usadas en el entrenamiento están publicadas en `credible-ai/weborganizer-corpus-200b-tokenized`, lo que permite reproducibilidad completa del pipeline. No se documenta en la información disponible si hubo fases de RLHF, DPO o ajuste fino posterior; el material indica únicamente preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, a nivel de modelo proxy de 102M parámetros.
- Modelado de lenguaje para evaluación comparativa de mezclas de datos (perplejidad y métricas derivadas sobre dominios de WebOrganizer).
- Atribución lineal de dominios: cada proxy sirve como punto de medida para estimar la contribución de un dominio o mezcla al rendimiento final (metodología LinMix).
- Reproducibilidad experimental: pesos, mezclas (`mix.json`) y secuencias tokenizadas publicados de forma abierta.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" en la información disponible.
- Capacidades multilingües: únicamente inglés según la model card.

## Casos de uso

- Investigación en data mixing: entrenar o evaluar proxies sobre mezclas candidatas y extrapolar el efecto al modelo objetivo antes de gastar cómputo en el modelo grande. Los 512 checkpoints ya cubren el vertex design, por lo que se pueden reutilizar directamente como baseline.
- Atribución de dominios: usar los proxies para estimar qué combinaciones de tema × formato de WebOrganizer contribuyen más a una métrica objetivo (por ejemplo, pérdida en un dominio de validación), siguiendo el método del paper.
- Reproducción de experimentos: descargar el repositorio una vez y cargar cada `mix_<i>` con `snapshot_download` y `AutoModelForCausalLM.from_pretrained(path, subfolder="mix_17")` para replicar las curvas del artículo.
- Estudio de escalado de mezclas: comparar el ranking de mezclas obtenido con proxies de 102M frente al de modelos mayores, para medir la fiabilidad de la transferencia de rankings.
- Docencia y prototipado de pipelines de entrenamiento: al ser modelos pequeños con código abierto (OLMo-core, repo `credibleai/linmix`), sirven para validar infraestructura de tokenización, sharding y evaluación antes de pasar a modelos grandes.
- Análisis de sensibilidad a la composición del corpus: entrenar variantes adicionales sobre los mismos dominios y contrastarlas con los 512 proxies publicados para aislar efectos de dominio.
- Benchmark de técnicas de selección de datos: usar los proxies como referencia barata para comparar métodos de filtrado o ponderación de dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de perplejidad por dominio; los resultados del paper LinMix se remiten al artículo arXiv:2610.37390 y al dataset `credible-ai/linmix-proxy-swarms`, que no se han podido consultar en esta ficha.

## Requisitos de hardware

- VRAM para inferencia: cada modelo de 102M parámetros en bfloat16 ocupa aproximadamente 0,2 GB de pesos; con overhead de activaciones y caché KV, el consumo típico es inferior a 1 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia puntual.
- Descarga completa del repositorio: 104,5 GB en disco; conviene usar `allow_patterns` para bajar solo las mezclas necesarias.
- Despliegue: compatible con `transformers` (librería declarada) y con endpoints compatibles; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. Al tratarse de proxies de investigación, no hay cifras publicadas de rendimiento en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-100M-288domains-vertex (este) | 102M × 512 checkpoints | no disponible | Proxies para data mixing (LinMix) | MIT | Hugging Face, 104 GB |
| OLMo 2 (modelos base de AI2) | 7B / 13B (familias publicadas) | no disponible en esta ficha | Modelos de lenguaje abiertos de propósito general | Apache 2.0 (según familia OLMo 2) | Hugging Face |
| Pythia (EleutherAI) | 70M–12B (suite) | 2.048 tokens (configuración típica de la suite) | Estudio de escalado y dinámica de entrenamiento | Apache 2.0 | Hugging Face |

La comparación directa con OLMo 2 de mayor tamaño o con Pythia no es equivalente en propósito: este repositorio no es un modelo único, sino una suite de 512 proxies de 102M orientada a experimentos de mezcla de datos. Cualquier comparación de calidad generativa con modelos de propósito general resulta desfavorable por diseño y no refleja su función real.

## Limitaciones y advertencias

- No es un modelo de producción: 102M parámetros entrenados sobre 3.200M tokens producen texto de calidad limitada y alta probabilidad de incoherencias.
- Riesgo de alucinación elevado, especialmente fuera de los dominios representados en WebOrganizer.
- Solo inglés; no se documenta cobertura multilingüe.
- Longitud de contexto no documentada en la información disponible; no se debe asumir una ventana concreta sin consultar la configuración del repositorio.
- Sesgos heredados del corpus DCLM/Common Crawl, con posibles sesgos de representación por dominio y de idioma.
- Licencia MIT para los pesos, pero los datos de entrenamiento están sujetos a CC-BY-4.0 y a los términos de uso de Common Crawl; el uso comercial debe revisar esas condiciones por separado.
- El repositorio pesa 104,5 GB; descargas completas tienen coste de almacenamiento y ancho de banda significativos.
- No hay métricas de benchmarks publicadas en la información disponible, por lo que no se puede recomendar su uso como referencia de calidad sin evaluar previamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-100M-288domains-vertex
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Dataset de diseño y resultados: https://huggingface.co/datasets/credible-ai/linmix-proxy-swarms
- Secuencias tokenizadas de entrenamiento: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Corpus de origen: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Código: https://github.com/credibleai/linmix
- OLMo-core: https://github.com/allenai/OLMo-core
- Documentación OLMo 2 en transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
