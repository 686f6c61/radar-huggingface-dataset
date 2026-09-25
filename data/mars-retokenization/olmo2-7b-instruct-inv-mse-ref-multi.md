# MARS-Retokenization/olmo2-7b-instruct-inv-mse-ref-multi

## Resumen

`MARS-Retokenization/olmo2-7b-instruct-inv-mse-ref-multi` es un checkpoint de investigación derivado por fine-tuning de `allenai/OLMo-2-1124-7B-Instruct`. Lo publica el grupo MARS-Retokenization y su propósito no es ser un asistente generalista, sino servir como artefacto experimental para estudiar la invariancia de tokenización (lo que los autores llaman "reader invariance") y su efecto sobre la robustez frente a re-tokenización adversarial. En otras palabras: se entrena al modelo para que su comportamiento no dependa de la forma exacta en que el texto de entrada se fragmenta en tokens.

El problema que aborda es relevante porque los ataques de tokenización adversarial (Geh et al., arXiv:2503.02174) consiguen saltarse las defensas de alineamiento de un modelo simplemente alterando la segmentación del prompt malicioso, sin cambiar su significado. Este checkpoint reduce la tasa de éxito de ese ataque concreto del 0,565 (referencia zero-shot en greedy) al 0,055, manteniendo una tasa de rechazo canónica del 0,91 sobre el holdout de AdvBench. El entrenamiento costó apenas 20,4 GPU-horas en 2xA100, con 700 pasos y un learning rate de 1e-05.

Tiene 7.298.617.344 parámetros (modelo denso, no MoE), licencia Apache 2.0 y pesos en safetensors. Los propios autores advierten de que se trata de artefactos de investigación y no de productos: un solo seed, evaluación únicamente en inglés y validez limitada al ataque estudiado. La model card no publica longitud de contexto, idiomas soportados ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base `allenai/OLMo-2-1124-7B-Instruct`; la model card no detalla la arquitectura) |
| Parametros totales | 7.298.617.344 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors en precision completa; no se publican GGUF ni cuantizaciones de 8/4 bits) |
| Idiomas soportados | No disponible. La evaluacion se realizo exclusivamente en ingles (AdvBench, XSTest, Alpaca) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamano del repositorio: 14,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-1124-7B-Instruct` y se ajusta con un objetivo de tipo destilacion sobre representaciones: `objective = mse_lastpos`, con `kl_direction = forward`, `ce_weighting = uniform` y sin EMA (`ema_beta = None`). La idea es alinear la salida del modelo bajo distintas tokenizaciones de la misma entrada, penalizando en la ultima posicion la discrepancia MSE respecto a una pasada de referencia. Se usan 8 codificaciones distintas por ejemplo (`num_encodings = 8`), con un esquema estocastico de tokenizacion (`stochastok_p = 0.3`), 8 tokens de prefijo (`prefix_tokens = 8`) y 128 tokens nuevos como maximo (`max_new_tokens = 128`).

La configuracion de entrenamiento es corta y deliberadamente contenida: 700 pasos (`max_steps`), learning rate 1e-05, acumulacion de gradiente 8, semilla 42 y 20,4 GPU-horas en 2xA100. La mezcla de datos incluye un 28,6% de contenido danino (`harmful_fraction = 0.286`, `harmful_mix = mixed`), con un cuantil CVaR de 0,25 (`cvar_quantile = 0.25`). El drift de parametros respecto al modelo base confirma que el ajuste fue superficial y selectivo: `lm_head` con L2 relativa 0,00000, `embed_tokens` 0,00091, `norm` 0,00421, `attn` 0,01047 y `mlp` 0,01137.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Rechazo de peticiones daninas con alta tasa en el escenario canonico: 0,91 de refusal greedy sin ataque.
- Robustez frente a re-tokenizacion adversarial: reduce el AdvTok ASR de 0,565 a 0,055 en greedy (200 prompts de holdout de AdvBench).
- Mantenimiento del comportamiento bajo decodificacion estocastica: AdvTok ASR de 0,141 con temperatura 1.
- Calibracion del exceso de rechazo: 0,07 de sobre-rechazo en prompts seguros de XSTest y 0,018 en Alpaca.
- Capacidad generativa conservada en tareas genericas: Alpaca token F1 de 0,424 y NLL/token de 1,353.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no documentadas; la model card solo reporta evaluaciones en ingles.

## Casos de uso

- Investigacion en seguridad de tokenizadores: usar el checkpoint como referencia para replicar el ataque de Geh et al. (arXiv:2503.02174) y medir el efecto de la re-tokenizacion adversarial sobre el alineamiento, comparando contra el modelo base sin ajustar.
- Auditoria de robustez de pipelines de moderacion: ejecutar prompts re-tokenizados contra el modelo y contra un clasificador externo (por ejemplo Llama-Guard-3-8B, el juez usado en la evaluacion) para detectar puntos ciegos en la cadena de defensa.
- Estudio de invariancia de representaciones: analizar como cambian las activaciones de la ultima posicion ante 8 codificaciones distintas del mismo texto, aprovechando que el objetivo de entrenamiento fue precisamente la consistencia MSE en esa posicion.
- Analisis de coste-beneficio del alineamiento: emplear las metricas de XSTest (0,07 de sobre-rechazo) y Alpaca (F1 0,424, NLL 1,353) para cuantificar cuanta capacidad generativa se sacrifica al ganar robustez adversarial.
- Base para experimentos de destilacion con objetivos alternativos: la configuracion expone todos los hiperparametros (`kl_direction`, `ce_weighting`, `cvar_quantile`, `stochastok_p`), de modo que sirve como punto de partida para comparar variantes del mismo metodo.
- Docencia y formacion en seguridad de LLM: al ser un checkpoint pequeno (7,3B) entrenable en 20,4 GPU-horas sobre 2xA100, es viable reproducir el experimento completo en un curso o taller con presupuesto limitado.
- Generacion de texto general en ingles como caso secundario: el modelo conserva capacidad instruct basica, pero no esta pensado para produccion y carece de datos publicados de contexto, idiomas o tool calling.

## Benchmarks y rendimiento

Datos publicados por los autores en la model card. Las metricas de seguridad se miden sobre un holdout de 200 prompts de AdvBench excluido del entrenamiento, juzgado con Llama-Guard-3-8B y decodificacion greedy salvo donde se indica.

| Metrica | Este modelo | Referencia zero-shot (OLMo-2-1124-7B-Instruct) |
|---|---|---|
| AdvTok ASR (greedy) | 0,055 | 0,565 |
| AdvTok ASR (temperatura 1) | 0,141 | 0,584 |
| Canonical ASR (greedy, sin ataque) | 0,045 | No disponible |
| Canonical refusal (greedy) | 0,91 | No disponible |
| XSTest over-refusal (prompts seguros) | 0,07 | No disponible |
| XSTest refusal (prompts no seguros) | 0,882 | No disponible |
| Alpaca over-refusal | 0,018 | No disponible |
| Alpaca token F1 | 0,424 | No disponible |
| Alpaca NLL/token | 1,353 | No disponible |
| Coste de entrenamiento | 20,4 GPU-horas en 2xA100 | No aplica |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad general en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de 7,3B parametros, no publicado por los autores): aproximadamente 14,6 GB en fp16/bf16, unos 7,3 GB en cuantizacion de 8 bits y unos 4 GB en 4 bits, mas el overhead de cache KV segun contexto y batch.
- GPU profesionales: el entrenamiento se ejecuto en 2xA100. Para inferencia basta una sola A100, H100, L40S o A6000 en fp16.
- GPU de consumo: cabe en tarjetas con 16 GB o mas (RTX 4090, RTX 4080, RTX 3090, RTX 4060 Ti 16 GB) en fp16 con contexto moderado; con cuantizacion de 4 bits se puede reducir a GPU de 8 GB, aunque no se publican pesos cuantizados en el repositorio.
- Opciones de despliegue: al publicarse unicamente en safetensors, es directamente compatible con vLLM, Text Generation Inference (TGI) y Transformers. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no proporcionada por el autor.
- Latencia y throughput: no disponibles. La unica cifra de rendimiento publicada es el coste de entrenamiento (20,4 GPU-horas en 2xA100) y el limite de generacion usado durante el ajuste (128 tokens nuevos, 8 tokens de prefijo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-7b-instruct-inv-mse-ref-multi | 7,30B | No disponible | Robustez a re-tokenizacion adversarial | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| allenai/OLMo-2-1124-7B-Instruct | 7B (clase) | No disponible en la informacion proporcionada | Asistente instruct generalista | Apache 2.0 | HuggingFace |
| Llama-Guard-3-8B | 8B (clase) | No disponible en la informacion proporcionada | Clasificacion de seguridad | No disponible en la informacion proporcionada | Usado como juez en la evaluacion de este checkpoint |
| Alternativas de investigacion en robustez adversarial de tokenizacion | No disponible | No disponible | No disponible | No disponible | No se han identificado modelos comparables en la informacion proporcionada |

La comparacion cuantitativa solo es posible contra el modelo base: la reduccion de AdvTok ASR greedy es de 0,565 a 0,055 (una decima parte), mientras que el AdvTok ASR a temperatura 1 baja de 0,584 a 0,141. No hay datos publicados que permitan comparar este checkpoint con otros modelos de la misma categoria en terminos de capacidad general.

## Limitaciones y advertencias

- Artefacto de investigacion, no producto: los propios autores lo etiquetan explicitamente como research checkpoint.
- Un unico seed (42), sin afirmacion de significancia estadistica entre semillas.
- Evaluacion exclusivamente en ingles (AdvBench, XSTest, Alpaca). No hay evidencia de comportamiento en otros idiomas.
- Los numeros de seguridad corresponden al ataque especifico estudiado (re-tokenizacion adversarial) y no implican robustez frente a otros tipos de jailbreak.
- Riesgo de alucinacion no cuantificado: no se publican metricas de veracidad, factualidad ni calibracion.
- Canonical ASR de 0,045 y XSTest refusal de 0,882 indican que una fraccion pequena de prompts daninos sigue obteniendo respuesta incluso sin ataque.
- Existe un coste en capacidad generativa: Alpaca token F1 de 0,424 y NLL/token de 1,353, valores que conviene contrastar contra el modelo base antes de asumir que no hay degradacion.
- Sobre-rechazo bajo pero no nulo: 0,07 en prompts seguros de XSTest y 0,018 en Alpaca.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero sin garantias y sin soporte del autor.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validacion independiente.
- No se publican pesos cuantizados, tokenizador alternativo, ni configuracion de inferencia recomendada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MARS-Retokenization/olmo2-7b-instruct-inv-mse-ref-multi
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Paper del ataque de tokenizacion adversarial (referenciado en los tags y en la model card, Geh et al.): https://arxiv.org/abs/2503.02174
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente paginas sobre el planeta Marte y sobre la empresa Mars Inc. (Wikipedia, NASA, CNES, mars.com), sin relacion con este checkpoint.
