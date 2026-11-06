# credible-ai/olmo2-30M-288domains-vertex

## Resumen

`olmo2-30M-288domains-vertex` es un conjunto de 1.024 modelos de lenguaje proxy de 29,2 millones de parámetros, publicados por el grupo credible-ai como artefacto experimental del paper LinMix (Data Mixing as Linear Domain Attribution). No es un modelo destinado a producción ni a generación de texto útil: cada uno de los 1.024 checkpoints corresponde a una mezcla de datos distinta sobre 288 dominios (tema × formato) del corpus WebOrganizer, y sirve para estudiar cómo atribuir linealmente el efecto de cada dominio sobre el rendimiento final de un modelo mayor.

La arquitectura es OLMo 2 (`Olmo2ForCausalLM`), con 4 capas, tamaño oculto de 256 y tokenizador GPT-NeoX-20B (vocabulario de 50.432 tokens). Cada proxy se entrena con 1.000 millones de tokens usando OLMo-core. El repositorio ocupa 59,9 GB en bfloat16, distribuido en carpetas `mix_0` a `mix_1023`, cada una con su propio `mix.json` que documenta la mezcla empleada.

Su relevancia es metodológica: permite reproducir y auditar el diseño experimental de LinMix sobre mezclas de datos a gran escala sin necesidad de entrenar modelos grandes, y ofrece un banco de proxies reutilizable para investigación en data mixing y atribución de dominios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parametros totales | 29,2 M por modelo (1.024 modelos, ~29,9 millardos en total) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en |
| Licencia | MIT (pesos); datos sujetos a CC-BY-4.0 y terminos de Common Crawl |
| Formato de pesos | safetensors (via transformers) |
| Capas | 4 |
| Tamano oculto | 256 |
| Tokenizador | GPT-NeoX-20B, vocabulario 50.432 |
| Tokens de entrenamiento | 1.000 millones por proxy |
| Tamano del repo | 59,9 GB |

## Arquitectura y entrenamiento

Cada uno de los 1.024 modelos es un transformer decoder-only de la familia OLMo 2 con 4 capas, dimensión oculta 256 y 29,2 M de parámetros, entrenado desde cero con OLMo-core sobre 1.000 millones de tokens. El tokenizador es el de GPT-NeoX-20B, compartido en la raíz del repositorio. Los pesos se publican en bfloat16 dentro de subcarpetas independientes (`mix_0` … `mix_1023`), cada una acompañada de un `mix.json` que especifica la mezcla de dominios con la que se entrenó ese proxy concreto.

El diseño experimental subyace al paper LinMix: se construyen 1.024 mezclas (vértices de un diseño sobre 288 dominios definidos por tema y formato en WebOrganizer) y se entrena un proxy por mezcla. El objetivo es ajustar un modelo lineal que atribuya el rendimiento de un modelo grande a la proporción de cada dominio en los datos de entrenamiento. Los datos proceden de WebOrganizer/Corpus-200B, derivado del pool DCLM 1b-1x (CC-BY-4.0) y sujeto a los términos de uso de Common Crawl; las secuencias tokenizadas exactas están publicadas en `credible-ai/weborganizer-corpus-200b-tokenized`. No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste fino posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el tamaño del modelo (29,2 M de parámetros).
- Modelado de lenguaje a nivel de token sobre texto en inglés, útil como proxy para medir pérdida y perplejidad por dominio.
- Reproducción de mezclas de datos: cada checkpoint lleva asociado su `mix.json`, lo que permite correlacionar composición de datos con métricas.
- Carga programática mediante `transformers` (`AutoModelForCausalLM` con `subfolder="mix_<i>"`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente inglés según la model card.

## Casos de uso

- Investigación en data mixing: entrenar o evaluar proxies sobre mezclas controladas para estimar la contribución marginal de cada dominio antes de lanzar un preentrenamiento a gran escala.
- Atribución lineal de dominios: usar los 1.024 checkpoints como banco de puntos de medida para ajustar el modelo de atribución de LinMix y validar sus predicciones sobre un modelo objetivo mayor.
- Selección de subconjuntos de datos: comparar la pérdida de proxies entrenados con distintas proporciones de un dominio para decidir si conviene aumentar o reducir su peso en el corpus final.
- Reproducibilidad de papers: replicar los experimentos de LinMix cargando las mezclas exactas publicadas en `mix.json` y las secuencias tokenizadas del dataset asociado.
- Estudio de eficiencia de proxies: analizar hasta qué punto un modelo de 29,2 M y 4 capas correlaciona con el comportamiento de modelos de mayor tamaño en la misma distribución de datos.
- Docencia y experimentación de bajo coste: cada proxy es lo bastante pequeño para entrenarse y evaluarse en hardware modesto, lo que facilita prácticas sobre tokenización, mezclas y métricas de lenguaje.
- Auditoría de corpus: medir la dificultad relativa de cada uno de los 288 dominios de WebOrganizer mediante la perplejidad de los proxies entrenados con ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: un proxy individual de 29,2 M de parámetros en bfloat16 ocupa aproximadamente 58 MB de pesos; con estados de activación y overhead de runtime, cabe holgadamente en cualquier GPU con 2 GB o más.
- Carga del repositorio completo: 59,9 GB en disco; conviene descargar solo las subcarpetas necesarias mediante `allow_patterns` en `snapshot_download`.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente para un proxy individual; para barrer los 1.024 modelos en paralelo se recomienda A100 o H100 por throughput agregado.
- Cabe en GPU consumer: sí, sin cuantización, en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM`; no se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI, aunque al ser safetensors estándar deberían poder convertirse.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-30M-288domains-vertex | 29,2 M | no disponible | Banco de proxies para data mixing | MIT | Hugging Face |
| OLMo 2 (modelos oficiales de AI2) | 7B / 13B / 32B | 4.096 tokens (según variante) | Modelos de lenguaje de proposito general | Apache 2.0 | Hugging Face |
| Pythia (EleutherAI) | 70 M – 12B | 2.048 tokens | Suite para interpretabilidad y estudio de escalado | Apache 2.0 | Hugging Face |
| GPT-NeoX-20B | 20 B | 2.048 tokens | Modelo de lenguaje de gran escala | Apache 2.0 | Hugging Face |

La comparación directa es limitada: este repositorio no compite como modelo de propósito general, sino como infraestructura experimental. Frente a Pythia, que ofrece una suite de tamaños para estudiar escalado, aquí el eje de variación no es el tamaño sino la mezcla de datos.

## Limitaciones y advertencias

- Modelos de 29,2 M de parámetros y 4 capas: la calidad de generación es muy baja y no son aptos para tareas de usuario final.
- Entrenados únicamente en inglés; no hay soporte multilingüe.
- Riesgo elevado de alucinación y de texto incoherente por la capacidad limitada del modelo.
- No se documenta la longitud de contexto soportada; asumir contextos cortos por el diseño de preentrenamiento.
- Licencia MIT para los pesos, pero los datos subyacentes están sujetos a CC-BY-4.0 y a los términos de uso de Common Crawl, lo que puede imponer restricciones adicionales al uso derivado.
- El repositorio pesa 59,9 GB; descargar todo el conjunto sin filtrar puede ser costoso en almacenamiento y ancho de banda.
- No están pensados para producción, servicio a usuarios ni fine-tuning orientado a tareas; su valor es exclusivamente metodológico y de investigación.
- Los 1.024 checkpoints son artefactos de un diseño experimental concreto (vértices de LinMix); usarlos fuera de ese marco puede no aportar señal útil.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/olmo2-30M-288domains-vertex
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Dataset de diseño y resultados: https://huggingface.co/datasets/credible-ai/linmix-proxy-swarms
- Dataset de secuencias tokenizadas: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Corpus fuente WebOrganizer: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Codigo LinMix: https://github.com/credibleai/linmix
- OLMo-core: https://github.com/allenai/OLMo-core
- Documentacion de Olmo2ForCausalLM: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Terminos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
