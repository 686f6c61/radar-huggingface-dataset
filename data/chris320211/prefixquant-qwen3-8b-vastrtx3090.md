# chris320211/prefixquant-qwen3-8b-vastrtx3090

## Resumen

PrefixQuant Qwen3-8B es una cuantizacion de 8 bits del modelo Qwen/Qwen3-8B, generada por el usuario chris320211 mediante la herramienta QuantPort, un pipeline propio de cuantizacion que aplica la tecnica PrefixQuant. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un transformer denso de 8.192 millones de parametros orientado a generacion de texto, razonamiento y conversacion. Esta version no es un checkpoint fp16 al uso: es un artefacto empaquetado en formato runtime que requiere un adaptador de inferencia especifico para cargarse.

El interes de esta ficha es fundamentalmente practico y de evaluacion: demuestra un flujo de cuantizacion reproducible (job `20261107T033248Z-1b1409`) con mediciones objetivas sobre WikiText-2 en una RTX 3090. Los datos publicados muestran una perplejidad de 11,12 frente a 9,66 del snapshot fp16 (ratio 1,15), con una reduccion de VRAM pico de 18,46 GB a 12,00 GB y un aumento de throughput de 3493,5 a 6588,5 tokens/s en prefill de 2048 tokens.

Se trata, por tanto, de un modelo experimental de nicho: util para quien quiera validar la tecnica PrefixQuant o reutilizar el adaptador de inferencia, pero no es un sustituto directo de Qwen3-8B en `AutoModelForCausalLM.from_pretrained`. La licencia heredada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B), cuantizada a 8 bits con PrefixQuant |
| Parametros totales | 8.192.136.372 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | 8-bit (PrefixQuant, artefacto empaquetado por QuantPort) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3-8B) + licencia del repositorio del metodo |
| Formato de pesos | safetensors empaquetado con configuracion de cuantizacion (`quantization_config.json`), no compatible con carga directa en transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8.192 millones de parametros. Sobre ese checkpoint se aplica PrefixQuant, una tecnica de cuantizacion post-entrenamiento (PTQ) que actua sobre los pesos en formato de 8 bits, empaquetandolos como artefacto runtime mediante QuantPort. No se ha realizado un reentrenamiento ni un ajuste fino adicional segun la informacion disponible: el proceso es exclusivamente de cuantizacion.

La innovacion tecnica reseñable no esta en la arquitectura del modelo (que es la original de Qwen3-8B) sino en el pipeline de cuantizacion y en el adaptador de inferencia incluido (`quant_agent_inference_adapter.py`). El artefacto requiere que el repositorio del metodo (y su overlay, si existe) este disponible en la variable de entorno `QUANT_AGENT_METHOD_REPO`. Los datos de entrenamiento del modelo base no se detallan en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3-8B.
- Razonamiento y matematicas: capacidades propias de Qwen3-8B, aunque degradadas por la cuantizacion (perplejidad +15,16 % en WikiText-2).
- Generacion de codigo: disponible en el modelo base; no se han publicado evaluaciones especificas para esta version cuantizada.
- Tool calling / function calling: no confirmado en la informacion proporcionada para este artefacto.
- Soporte de agentes y razonamiento multi-paso: no confirmado para esta version.
- Capacidades multilingues: no disponibles (los idiomas no se especifican).
- Modo thinking: no confirmado en la informacion proporcionada.
- Vision y audio: no disponibles.

## Casos de uso

- Evaluacion de la tecnica PrefixQuant: el modelo sirve como referencia reproducible para medir el impacto de la cuantizacion 8-bit sobre Qwen3-8B, con metricas publicadas de perplejidad, NLL, throughput y VRAM pico en RTX 3090.
- Despliegue en GPUs de 12 GB: con 12,00 GB de VRAM pico en prefill de 2048 tokens, encaja en tarjetas consumer de gama alta donde el fp16 (18,46 GB) no cabria, permitiendo servir generacion de texto en una unica RTX 3090.
- Investigacion sobre pipelines de cuantizacion: util para comparar QuantPort/PrefixQuant con otras tecnicas (SmoothQuant, GPTQ, AWQ) usando el mismo modelo base y el mismo conjunto de evaluacion (WikiText-2 test, ventanas de 2048 tokens).
- Prototipado de asistentes conversacionales: al heredar el comportamiento de Qwen3-8B, permite construir demos de chat multi-turno en hardware modesto, aceptando la perdida de calidad medida.
- Generacion de texto a gran velocidad en prefill: los 6588,5 tokens/s medidos lo hacen adecuado para escenarios con prompts largos donde el coste de prefill domina, como resumen de documentos o clasificacion de textos extensos.
- Validacion de adaptadores de inferencia: sirve para probar el flujo de carga via `quant_agent_inference_adapter.py` y `QUANT_AGENT_METHOD_REPO` antes de aplicarlo a otros modelos cuantizados con la misma herramienta.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en NVIDIA GeForce RTX 3090 (`vast-rtx3090`) sobre WikiText-2 test, ventanas de 2048 tokens, 65504 tokens evaluados:

| Metrica | Cuantizado | fp16 (Qwen3-8B) |
|---|---:|---:|
| Perplejidad | 11,121597 | 9,657566 |
| NLL loss | 2,408889 | 2,267742 |
| Tokens/s (prefill 2048, tras warmup) | 6588,5 | 3493,5 |
| VRAM pico (GB) | 11,998 | 18,462 |

Ratio de perplejidad (`ppl_ratio`): 1,151594, con `quality_ok=True` segun el autor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,998 GB en pico (prefill de 2048 tokens) segun la medicion del autor.
- GPU recomendadas: NVIDIA RTX 3090 (medida oficial); por el perfil de VRAM, cualquier GPU con 12 GB o mas de memoria dedicada.
- Cabe en GPU consumer: si, en RTX 3090 y previsiblemente en RTX 4080/4090 y modelos con 16 GB o mas; en GPUs de 12 GB el margen es muy ajustado.
- Opciones de despliegue: no es compatible con `AutoModelForCausalLM.from_pretrained`; requiere el adaptador `quant_agent_inference_adapter.py` y el repositorio del metodo en `QUANT_AGENT_METHOD_REPO`. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, aunque el tag `text-generation-inference` aparece en el repositorio.
- Latencia y throughput: 6588,5 tokens/s en prefill de 2048 tokens tras warmup (RTX 3090); no se publican datos de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Perplejidad WikiText-2 | VRAM pico | Licencia |
|---|---|---:|---:|---:|---|
| PrefixQuant Qwen3-8B (este) | 8,19 B | 8-bit PrefixQuant | 11,12 | 12,00 GB | Apache 2.0 |
| Qwen/Qwen3-8B (fp16) | 8,19 B | ninguna | 9,66 | 18,46 GB | Apache 2.0 |
| Otras cuantizaciones de Qwen3-8B | 8,19 B | no disponible | no disponible | no disponible | Apache 2.0 |

No se dispone de datos de benchmarks de tareas (MMLU, HumanEval, GSM8K) para este artefacto ni para alternativas comparables en la informacion proporcionada, por lo que la comparacion se limita a las metricas de perplejidad y recursos publicadas por el autor.

## Limitaciones y advertencias

- Perdida de calidad medible: la perplejidad sube un 15,16 % respecto al fp16 (11,12 frente a 9,66), lo que puede traducirse en mayor tasa de errores en tareas de razonamiento o codigo.
- Carga no estandar: no funciona con `from_pretrained` directo; exige el adaptador incluido y el repositorio del metodo configurado en `QUANT_AGENT_METHOD_REPO`. Cualquier integracion en produccion debe contemplar ese acoplamiento.
- Sesgos: no documentados para este artefacto; hereda los del modelo base Qwen3-8B, no evaluados aqui.
- Riesgo de alucinacion: no medido en la informacion disponible; la cuantizacion puede amplificarlo en tareas de conocimiento factual.
- Idiomas: no especificados; no se puede confirmar cobertura multilingue para esta version.
- Contexto: la longitud de contexto no se detalla en la informacion proporcionada; debe consultarse en el modelo base.
- Licencia: Apache 2.0 heredada, pero el autor indica que se aplica tambien la licencia del repositorio del metodo; conviene conservar `LICENSE` y `NOTICE.md` del snapshot y verificar compatibilidad para uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia; sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chris320211/prefixquant-qwen3-8b-vastrtx3090
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Repositorio QuantPort: https://github.com/chris320211/QuantPort
- Otro artefacto del mismo autor (SmoothQuant Qwen2.5-15B): https://huggingface.co/chris320211/smoothquant-qwen25-15b-vastrtx3090
