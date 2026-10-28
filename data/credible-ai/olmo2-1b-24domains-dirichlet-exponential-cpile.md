# credible-ai/olmo2-1B-24domains-dirichlet-exponential-cpile

## Resumen

`olmo2-1B-24domains-dirichlet-exponential-cpile` es un modelo de lenguaje de 1.414.678.528 parámetros (1,41B) desarrollado por credible-ai y construido sobre la arquitectura OLMo 2 (`Olmo2ForCausalLM`), con 18 capas y un tamaño oculto de 2048. Se trata de un artefacto de investigación cuyo propósito es reproducir los experimentos del artículo LinMix sobre mezcla de datos (*data mixing*): el modelo se preentrena con 32.000 millones de tokens procedentes del corpus WebOrganizer, combinando sus 24 temáticas con pesos de mezcla optimizados mediante Olmix para minimizar *bits per byte* sobre texto retenido del Common Pile.

El interés técnico no reside en el modelo en sí, sino en el método: los pesos de la mezcla se obtienen ajustando un sustituto exponencial sobre un enjambre de modelos proxy de 30M de parámetros entrenados con distribuciones Dirichlet (`credible-ai/olmo2-30M-24domains-dirichlet`). El resultado se materializa en un modelo de escala 1B entrenado con OLMo-core y publicado junto a un fichero `mix.json` que documenta la mezcla exacta utilizada.

Es relevante ahora porque ofrece un punto de comparación reproducible y de código abierto (licencia MIT) para estudiar cómo las decisiones de mezcla de dominios afectan al rendimiento de un modelo pequeño, y porque permite validar empíricamente si las optimizaciones realizadas a escala proxy (30M) transfieren a escala 1B. No es un modelo de propósito general ni está alineado para instrucciones: es una base preentrenada, en inglés, pensada para experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only |
| Parámetros totales | 1.414.678.528 (1,41B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantización | pesos originales en bfloat16; no se han publicado variantes cuantizadas (GGUF, AWQ, GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 2,8 GB), bfloat16 |
| Capas | 18 |
| Tamaño oculto | 2048 |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 tokens |
| Tokens de entrenamiento | 32.000 millones |
| Framework de entrenamiento | OLMo-core |
| Método de mezcla | Olmix: sustituto exponencial ajustado sobre enjambre Dirichlet |
| Fecha de publicación | 2026-10-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo 2, un transformer decoder-only implementado en Transformers como `Olmo2ForCausalLM`, con 18 capas y dimensión oculta de 2048, lo que arroja 1,41B de parámetros. El tokenizador es el de GPT-NeoX-20B, con un vocabulario de 50.432 entradas, y los pesos se distribuyen en bfloat16. El entrenamiento se realizó con OLMo-core sobre 32.000 millones de tokens, un volumen bajo en relación con el tamaño del modelo (ratio aproximado de 22 tokens por parámetro, por debajo de las recomendaciones tipo Chinchilla), lo que sugiere que el modelo está infraentrenado y que su prioridad es la reproducibilidad experimental, no la calidad final.

La contribución metodológica es la mezcla de datos. El corpus de origen, WebOrganizer/Corpus-200B, está organizado en 24 temáticas; los pesos de muestreo entre ellas no se fijan a mano, sino que se optimizan con Olmix mediante un sustituto exponencial ajustado sobre un enjambre de modelos proxy de 30M de parámetros entrenados con pesos muestreados de una distribución de Dirichlet. El objetivo de la optimización es *bits per byte* sobre texto retenido del Common Pile. La mezcla resultante se publica como `mix.json` en el repositorio, y las secuencias tokenizadas exactas usadas en el entrenamiento están disponibles en el dataset `credible-ai/weborganizer-corpus-200b-tokenized`. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base preentrenado (`text-generation`).
- Modelado de lenguaje y cálculo de *bits per byte* / perplejidad sobre corpus de evaluación, que es su función principal como artefacto de investigación.
- Capacidad de servir como base para *fine-tuning* supervisado o continuación de preentrenamiento en experimentos controlados.
- Reproducción de experimentos de mezcla de dominios: permite comparar el efecto de la mezcla Olmix frente a mezclas uniformes o heurísticas.
- No dispone de *chat template*, ajuste por instrucciones, *tool calling*, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Multilingüismo limitado al inglés según la model card; no se declaran capacidades en otros idiomas.

## Casos de uso

- Reproducción de los experimentos del artículo LinMix: cargar el modelo y el `mix.json` asociado para verificar los resultados de mezcla de dominios a escala 1B frente a los proxies de 30M.
- Estudio de transferencia de escala en mezcla de datos: comparar el rendimiento de este modelo con el del enjambre proxy `olmo2-30M-24domains-dirichlet` para medir si los pesos óptimos de mezcla obtenidos a 30M siguen siendo válidos a 1,41B.
- Línea base en experimentos de *data curation*: usar los 32B tokens y la mezcla publicada como referencia controlada frente a nuevas estrategias de muestreo o filtrado sobre WebOrganizer/Corpus-200B.
- Evaluación de metodologías de optimización de mezclas: servir de punto de comparación para técnicas alternativas (regresión sobre *scaling laws*, bandits, búsqueda bayesiana) midiendo *bits per byte* sobre Common Pile retenido.
- Continuación de preentrenamiento en dominios concretos: al ser un modelo de 1,41B con licencia MIT, es viable partir de estos pesos para *domain adaptation* sobre subconjuntos de las 24 temáticas y estudiar la degradación o mejora por dominio.
- Experimentación en hardware modesto: con pesos bf16 de unos 2,8 GB, el modelo cabe en GPUs de consumo y en CPU, lo que facilita barridos de hiperparámetros y ablaciones sin clúster.
- Docencia e investigación sobre tokenización y composición de corpus: analizar cómo el tokenizador GPT-NeoX-20B distribuye tokens entre las 24 temáticas del corpus y cómo ello interactúa con los pesos de mezcla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que la mezcla se optimizó para *bits per byte* sobre texto retenido del Common Pile, sin aportar valores numéricos, y no se incluyen resultados de MMLU, HumanEval, GSM8K ni de ninguna otra tarea estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,8 GB solo para pesos; con caché KV y activaciones, del orden de 4-5 GB en función de la longitud de secuencia (estimación, no medida publicada).
- VRAM estimada en cuantización INT8: en torno a 1,4-2 GB; en INT4, en torno a 0,7-1,5 GB (estimaciones; no hay ficheros cuantizados publicados, habría que generarlos).
- GPU recomendadas: cualquier GPU con 8 GB o más es suficiente en bf16 (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090, A10, L4). Para entrenamiento o *fine-tuning* completo conviene A100/H100 por memoria y ancho de banda.
- Cabe holgadamente en GPU de consumo; también es viable la inferencia en CPU, dado el tamaño reducido.
- Opciones de despliegue: Transformers con `AutoModelForCausalLM` (soporte nativo de `Olmo2ForCausalLM`), vLLM y TGI para servir, llama.cpp u Ollama tras convertir los pesos a GGUF (conversión no incluida en el repositorio).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Datos de los modelos comparables tomados de sus model cards públicas; no se han reverificado en esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| credible-ai/olmo2-1B-24domains-dirichlet-exponential-cpile | 1,41B | no disponible | MIT | Mezcla de dominios optimizada (Olmix), preentrenamiento de 32B tokens | HuggingFace, safetensors |
| allenai/OLMo-2-0425-1B | 1,24B (aproximado) | 4096 | Apache 2.0 | Modelo base generalista con receta completa publicada | HuggingFace, safetensors |
| HuggingFaceTB/SmolLM2-1.7B | 1,71B | 8192 | Apache 2.0 | Modelo base y variantes instruct de alta calidad | HuggingFace, safetensors, GGUF |
| TinyLlama/TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Preentrenamiento de 3B tokens sobre corpus mixto, con variante chat | HuggingFace, safetensors |
| EleutherAI/pythia-1.4b | 1,41B | 2048 | Apache 2.0 | Suites de checkpoints para investigación de entrenamiento | HuggingFace, safetensors |

La diferencia clave frente a todos ellos es que este modelo no se publica como base generalista: su valor está en la mezcla de datos documentada (`mix.json`) y en la reproducibilidad del pipeline Olmix/LinMix, no en su rendimiento en tareas de usuario final.

## Limitaciones y advertencias

- No es un modelo de propósito general: la propia model card lo describe como un artefacto de investigación para reproducir LinMix, no como un LM listo para uso.
- Sin alineación: no hay ajuste por instrucciones, RLHF ni DPO, por lo que no sigue instrucciones de forma fiable ni mantiene formatos de conversación.
- Infraentrenado: 32B tokens para 1,41B parámetros es un ratio bajo; es esperable una calidad de generación limitada en comparación con modelos de tamaño similar entrenados con billones de tokens.
- Solo inglés declarado; no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación y de reproducir sesgos presentes en Common Crawl y en el pool DCLM, sin filtrado de seguridad documentado.
- Longitud de contexto no especificada en la información disponible: no debe asumirse una ventana concreta sin verificarla empíricamente.
- Restricciones de datos: los pesos son MIT, pero los datos de entrenamiento derivan del DCLM 1b-1x pool (CC-BY-4.0) y están sujetos a los términos de uso de Common Crawl; cualquier uso comercial debe evaluar esa cadena de licencias.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Advertencia sobre la búsqueda web: los resultados devueltos no guardan relación con este modelo (contenido sobre Claude AI y GitHub Copilot), por lo que no se han podido incorporar enlaces externos adicionales verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-24domains-dirichlet-exponential-cpile
- Modelo proxy del enjambre Dirichlet (30M): https://huggingface.co/credible-ai/olmo2-30M-24domains-dirichlet
- Dataset de origen: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado usado en el entrenamiento: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Código LinMix: https://github.com/credibleai/linmix
- Framework de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core
- Documentación de `Olmo2ForCausalLM` en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
