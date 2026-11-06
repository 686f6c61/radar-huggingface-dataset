# chris320211/flatquant-qwen25-15b-vastrtx3090

## Resumen

FlatQuant Qwen2.5-1.5B es un artefacto cuantizado derivado de `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario `chris320211` mediante la herramienta QuantPort y el metodo de cuantizacion FlatQuant. No se trata de un modelo entrenado desde cero, sino de un checkpoint de pesos empaquetados en formato runtime de 8 bits, generado a partir del modelo instruct original de Qwen (familia Qwen2.5, licencia Apache 2.0). El objetivo declarado es reducir el consumo de VRAM en inferencia manteniendo una calidad aceptable en perplejidad.

El checkpoint se ha validado en una NVIDIA GeForce RTX 3090 (instancia `vast-rtx3090`) sobre el conjunto WikiText-2 (test, ventanas de 2048 tokens, 65504 tokens evaluados). Los resultados muestran una perplejidad de 10.916688 frente a 9.579098 del snapshot fp16, es decir, un `ppl_ratio` de 1.139636, y un pico de VRAM de 3.405 GB frente a 5.264 GB en fp16. El throughput, sin embargo, empeora ligeramente: 11555.3 tokens/s frente a 12682.5 tokens/s en prefill de 2048 tokens tras warmup.

Es relevante ahora porque demuestra un flujo de cuantizacion post-entrenamiento reproducible (QuantPort) sobre un modelo pequeno de proposito general, con metricas publicadas y comparacion directa contra fp16. Ahora bien, el artefacto no es un checkpoint `AutoModelForCausalLM.from_pretrained` convencional: requiere un adaptador de inferencia especifico incluido en el repositorio, lo que limita su uso inmediato en pipelines estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivado de Qwen2.5-1.5B-Instruct |
| Parametros totales | 891.545.528 (segun safetensors del repo cuantizado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct, no confirmada en esta ficha) |
| Tipos de cuantizacion | 8-bit (FlatQuant, pesos empaquetados en formato runtime) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 (heredada de Qwen2.5-1.5B-Instruct, mas la licencia del repositorio del metodo) |
| Formato de pesos | safetensors (empaquetados, requieren adaptador de inferencia; no es un checkpoint fp16 estandar) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5 con atencion causal estandar y mecanismos de RoPE, entrenado por Alibaba Qwen con datos multilingues y ajuste instructivo (SFT y preferencias). Sobre ese checkpoint, este artefacto aplica FlatQuant, una tecnica de cuantizacion post-entrenamiento que transforma los pesos y activaciones para reducir el error de cuantizacion a 8 bits, empaquetando los pesos en un formato runtime propio.

No se ha realizado entrenamiento adicional ni fine-tuning: el proceso es exclusivamente de cuantizacion. La model card indica que los pesos son el artefacto empaquetado del job `20261102T052711Z-015c0e`, generado con QuantPort, y que la evaluacion se hizo contra el snapshot fp16 original en WikiText-2. No se especifican en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni detalles de RLHF/DPO mas alla de lo que corresponde a Qwen2.5-1.5B-Instruct. Tampoco se documentan innovaciones de decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto conversacional en el estilo instructivo del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones, heredado del ajuste instructivo del modelo original.
- Generacion de codigo y matematicas a nivel de modelo pequeno (capacidad limitada por el tamano de 1.5B parametros del base).
- Soporte multilingue: no confirmado en la informacion proporcionada; depende del modelo base.
- Tool calling / function calling: no documentado en esta ficha; heredable del base solo si el formato se preserva tras la cuantizacion, lo cual no se verifica en la model card.
- Modo thinking, vision o audio: no disponible.
- Inferencia cuantizada a 8 bits con adaptador especifico (`quant_agent_inference_adapter.py`).

## Casos de uso

- Evaluacion de tecnicas de cuantizacion: el checkpoint sirve como referencia reproducible para comparar FlatQuant frente a fp16 en perplejidad, VRAM y throughput sobre WikiText-2, usando las metricas ya publicadas en la model card.
- Despliegue en GPUs con VRAM limitada: con un pico de 3.405 GB en RTX 3090, el modelo cabe en tarjetas consumer de 8 GB o menos, lo que permite prototipado local de asistentes conversacionales pequenos.
- Investigacion en eficiencia de memoria: util para estudiar el trade-off entre reduccion de VRAM (-35% aproximadamente frente a fp16) y perdida de calidad (+13.96% de perplejidad) en modelos de 1.5B.
- Generacion de texto de bajo coste en entornos de laboratorio: tareas de resumen, reescritura o clasificacion simple donde la latencia no sea critica y se priorice el ahorro de memoria.
- Benchmarking de pipelines de cuantizacion: integrable en suites que comparen metodos (GPTQ, AWQ, FlatQuant) sobre el mismo modelo base y el mismo conjunto de evaluacion.
- Docencia y formacion: ejemplo practico de cuantizacion post-entrenamiento con metricas publicadas y codigo de carga especifico, adecuado para explicar el ciclo completo de un artefacto cuantizado.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre WikiText-2 (test, ventanas de 2048 tokens, 65504 tokens), medidos en NVIDIA GeForce RTX 3090 (`vast-rtx3090`) contra el snapshot fp16 original:

| Metrica | Cuantizado (8-bit) | fp16 snapshot |
|---|---:|---:|
| Perplejidad | 10.916688 | 9.579098 |
| NLL loss | 2.390293 | 2.259583 |
| Tokens/s (prefill 2048, tras warmup) | 11555.3 | 12682.5 |
| Pico de VRAM (GB) | 3.405 | 5.264 |
| `ppl_ratio` | 1.139636 | 1.0 (referencia) |

Indicadores adicionales del job: `quality_ok=True`, `improved_throughput=False`, `improved_vram=True`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 3.405 GB de pico medidos en RTX 3090 con ventanas de 2048 tokens (8-bit).
- GPU recomendadas: NVIDIA RTX 3090 (validada), y por el perfil de memoria, tarjetas consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, etc.). GPUs de datacenter (A100, H100) no aportan ventaja significativa a este tamano.
- Cabe en GPU consumer: si, con margen amplio dado el pico de 3.4 GB.
- Opciones de despliegue: no es compatible con `AutoModelForCausalLM.from_pretrained` directo; requiere el adaptador `quant_agent_inference_adapter.py` incluido en el repositorio y el repositorio del metodo en `QUANT_AGENT_METHOD_REPO`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 11555.3 tokens/s en prefill de 2048 tokens tras warmup en RTX 3090; el throughput es un 8.9% inferior al fp16 (12682.5 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FlatQuant Qwen2.5-1.5B (este) | 891.545.528 (empaquetados) | no disponible | 8-bit FlatQuant | 10.916688 | apache-2.0 | Hugging Face, requiere adaptador |
| Qwen2.5-1.5B-Instruct (fp16) | 1.5B | no disponible en esta ficha | fp16 | 9.579098 | apache-2.0 | Hugging Face, transformers estandar |
| Alternativas cuantizadas de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otras tecnicas de cuantizacion (GPTQ, AWQ) sobre el mismo modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- No es un checkpoint drop-in: requiere el adaptador `quant_agent_inference_adapter.py` y el repositorio del metodo configurado en `QUANT_AGENT_METHOD_REPO`; no funciona con `AutoModelForCausalLM.from_pretrained` estandar.
- Perdida de calidad medible: la perplejidad sube un 13.96% frente a fp16 (`ppl_ratio` 1.139636), lo que puede traducirse en respuestas menos precisas en tareas sensibles.
- Throughput inferior: el modelo cuantizado es mas lento en prefill que el fp16 (11555.3 vs 12682.5 tokens/s), por lo que la ganancia es exclusivamente de memoria, no de velocidad.
- Riesgo de alucinacion: inherente al modelo base de 1.5B parametros; la cuantizacion puede amplificarlo en tareas de razonamiento largo.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base Qwen2.5-1.5B-Instruct.
- Limitaciones de contexto e idioma: no confirmadas en esta ficha; dependen del modelo base y de que la cuantizacion no degrade el comportamiento multilingue, algo no verificado.
- Licencia: apache-2.0 heredada del base, mas la licencia del repositorio del metodo; conservar `LICENSE` y `NOTICE.md` del snapshot cuando existan.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado en noviembre de 2026; sin validacion externa ni comunidad, lo que desaconseja su uso en produccion sin evaluacion propia.
- Evaluacion limitada: solo se publican metricas de WikiText-2; no hay benchmarks de tareas (MMLU, HumanEval, GSM8K) que confirmen el comportamiento en uso real.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/chris320211/flatquant-qwen25-15b-vastrtx3090
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Repositorio del metodo QuantPort: https://github.com/chris320211/QuantPort
