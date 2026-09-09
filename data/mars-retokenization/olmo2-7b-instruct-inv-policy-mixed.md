# MARS-Retokenization/olmo2-7b-instruct-inv-policy-mixed

## Resumen

Este checkpoint de investigacion, denominado `inv_policy_mixed`, ha sido desarrollado por el grupo MARS-Retokenization a partir del modelo `allenai/OLMo-2-1124-7B-Instruct`. Se trata de un experimento centrado en el estudio de la invariancia de tokenizacion ("reader invariance") y su impacto en la robustez frente a una re-tokenizacion adversaria. El objetivo es mejorar la resistencia del modelo a manipulaciones del tokenizado que pueden inducir comportamientos de jailbreak o de generacion de contenido no deseado.

Con 7.298.617.344 parametros en total, mantiene la arquitectura transformer autoregresiva del modelo base, pero incorpora un entrenamiento especifico con multiples codificaciones del mismo prompt para favorecer la invariacion. Es un artifact de investigacion, no un producto destinado a uso en produccion, y los datos de seguridad que se presentan corresponden a un subconjunto de evaluacion restringido. Su relevancia radica en aportar evidencia sobre como la tokenizacion adversarial afecta a las respuestas de un modelo de instruccion de 7B y como se puede mitigar mediante tecnicas de policy basadas en CVaR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo |
| Parametros totales | 7.298.617.344 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (segun la evaluacion declarada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/OLMo-2-1124-7B-Instruct`, un transformer autoregresivo de 7B parametros. El proceso de fine-tuning se realizo con una configuracion de `mode=policy`, una fraccion de datos daninos (`harmful_fraction=0.286`) y un total de 8 codificaciones por prompt (`num_encodings=8`). Esta metodologia de entrenamiento emplea una funcion de riesgo condicional, definida por un cuantil CVaR (`cvar_quantile=0.25`), con el fin de optimizar el comportamiento del modelo en el peor caso entre las distintas tokenizaciones de un mismo input. El entrenamiento duro 700 pasos con una tasa de aprendizaje de `1e-05`, acumulacion de gradientes de 8 y una semilla fija de 42. Como artefacto de investigacion, se observa que los cambios de parametros con respecto al modelo base se concentran sobre todo en las capas MLP (deriva L2 de 0.01303) y en las capas de atencion (0.01191), mientras que las capas de embeddings y de normalizacion apenas se modifican.

La innovacion tecnica principal no reside en la arquitectura, sino en la estrategia de entrenamiento para la robustez frente a la re-tokenizacion adversarial. En lugar de entrenar con un solo tokenizado canonicamente establecido, se generan hasta 8 variantes del mismo prompt y se optimiza el modelo para que la respuesta no dependa de la tokenizacion concreta. Este enfoque se inspira en el concepto de invariancia del lector ("reader invariance") estudiado en el paper de Geh et al. (arXiv:2503.02174).

## Capacidades

- Generacion de texto y seguimiento de instrucciones: mantiene las capacidades basicas del modelo base `allenai/OLMo-2-1124-7B-Instruct`.
- Robustez frente a ataques de re-tokenizacion adversaria: reduce la tasa de exito de estos ataques en comparacion con el modelo base, segun las metricas declaradas.
- Invariancia ante multiples tokenizaciones: se han incorporado 8 codificaciones diferentes de un mismo prompt durante el entrenamiento para favorecer respuestas estables.
- Capacidades de tool calling, vision, audio o multimodalidad: no documentadas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles; la evaluacion se realizo exclusivamente en AdvBench, XSTest y Alpaca en ingles.
- Modo especial de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion en seguridad de modelos: permite estudiar como un modelo de instruccion se comporta ante variaciones de tokenizacion adversaria en entornos controlados, proporcionando una referencia reproducible para experimentos de red teaming.
- Evaluacion de defensas contra jailbreaks: sirve como modelo de prueba para valorar si la invariancia de tokenizacion reduce la efectividad de ataques basados en manipulaciones de tokens, tanto en decodificacion greedy como con muestreo.
- Benchmarking de robustez de tokenizacion: puede emplearse como punto de comparacion en pipelines de evaluacion que miden la tasa de exito de ataques adversariales de tokenizacion y la tasa de rechazo en prompts seguros.
- Desarrollo de tecnicas de alineacion: su metodo de entrenamiento con multiples codificaciones puede servir como inspiracion para aplicar estrategias de robustez a otros modelos de instruccion de tamano similar.
- Fine-tuning posterior en tareas de seguridad: al estar publicado bajo Apache 2.0, se puede utilizar como punto de partida para experimentos de ajuste con datos propios de seguridad, siempre que se trate de un entorno de investigacion.
- Analisis de sensibilidad a la tokenizacion en modelos de lenguaje: permite investigar como cambian las respuestas de un LLM cuando se alteran los tokens de entrada, lo cual es util para caracterizar vulnerabilidades en sistemas de moderacion de contenido.

## Benchmarks y rendimiento

Los resultados que se indican a continuacion han sido medidos por el autor en un subconjunto de 200 prompts de AdvBench que fue excluido del entrenamiento. Se evaluo el ataque de tokenizacion adversaria (AdvTok ASR) descrito en Geh et al. (arXiv:2503.02174), utilizando Llama-Guard-3-8B como juez.

| Metrica | Valor |
|---|---|
| AdvTok ASR (decodificacion greedy) | 0.215 |
| AdvTok ASR canonico (decodificacion greedy) | 0.05 |
| AdvTok ASR (muestreo t=1) | 0.357 |
| AdvTok ASR canonico (muestreo t=1) | 0.166 |

No se han publicado resultados de benchmarks genericos como MMLU, HumanEval o GSM8K en la informacion disponible. El coste en terminos de rechazo en prompts seguros se menciona como XSTest over-refusal, pero no se proporciona el valor numerico en la ficha del modelo.

## Requisitos de hardware

- Se estima que una inferencia en precision FP16 requiere alrededor de 14.6 GB de VRAM, ya que el tamano del repositorio coincide con el peso de los safetensors.
- Con cuantizacion externa no oficial se podria reducir el consumo a aproximadamente 8 GB en 8-bit y 5 GB en 4-bit.
- GPU recomendadas: para una inferencia completa en FP16 se recomienda una RTX 4090 (24 GB) o superior; para despliegue a escala son adecuadas las A100 o H100.
- En GPU de consumo: es posible si la VRAM disponible es de al menos 16 GB y se conserva FP16, o bien aplicando cuantizacion externa.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son compatibles con el formato safetensors, aunque no se han publicado configuraciones especificas para este checkpoint.
- Datos de latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Uso principal |
|---|---|---|---|---|---|
| `MARS-Retokenization/olmo2-7b-instruct-inv-policy-mixed` | 7.298.617.344 | no disponible | Apache 2.0 | HuggingFace | Investigacion en robustez de tokenizacion |
| `allenai/OLMo-2-1124-7B-Instruct` | 7.298.617.344 (aproximadamente) | no disponible | Apache 2.0 | HuggingFace | Modelo base de instruccion |
| `allenai/OLMo-7B-Instruct` | ~7B | no disponible | Apache 2.0 | HuggingFace | Modelo de instruccion generico |

No se dispone de resultados de benchmarks comparables en la informacion proporcionada; los datos de rendimiento solo estan disponibles para el ataque de tokenizacion adversaria estudiado.

## Limitaciones y advertencias

- Se trata de un artifact de investigacion, no de un producto listo para produccion; el propio autor lo indica en la ficha.
- La robustez observada se refiere exclusivamente al ataque de tokenizacion adversarial descrito en el paper, no a otros tipos de jailbreak ni a otros vectores de manipualcion de prompts.
- El entrenamiento se realizo con una unica semilla, por lo que no se puede afirmar significancia estadistica entre distintas ejecuciones.
- Las evaluaciones se hicieron solo en ingles y en un conjunto concreto de prompts (AdvBench, XSTest, Alpaca); no se aportan resultados de generalizacion a otros idiomas o dominios.
- No se han proporcionado metricas de sesgos o de alucinacion; por tanto, el modelo hereda los riesgos tipicos del modelo base y de su proceso de ajuste.
- La tasa de rechazo en prompts seguros (XSTest over-refusal) se menciona como coste, pero no se facilita un valor numerico, lo que impide evaluar el equilibrio entre seguridad y utilidad.
- La licencia Apache 2.0 permite el uso comercial, pero no existe ninguna garantia de seguridad ni de rendimiento para ese uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MARS-Retokenization/olmo2-7b-instruct-inv-policy-mixed
- Paper de referencia sobre tokenizacion adversaria: https://arxiv.org/abs/2503.02174
- Modelo base citado en la ficha: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Documentacion de entrenamiento de OLMo 2 con Open Instruct: https://allenai.github.io/open-instruct/olmo2/
