# icemoon28/Ouro-1.4B-Thinking-RLTT-step100

## Resumen

Ouro-1.4B-Thinking-RLTT-step100 es un checkpoint de ajuste fino del modelo Ouro-1.4B-Thinking, desarrollado por ByteDance, y publicado por el usuario icemoon28 en Hugging Face. Se trata de un modelo de generacion de texto de 1.434 millones de parametros que aplica RLTT (una variante de entrenamiento por refuerzo) sobre el modelo base, con el objetivo de mejorar el razonamiento matematico. El checkpoint corresponde a la actualizacion global 100 del optimizador.

El modelo hereda la arquitectura de los LoopLMs de Ouro, que emplean bucles recurrentes sobre un transformer para escalar el razonamiento latente. Segun la model card, el entrenamiento se realizo con cuatro bucles recurrentes fijos, ponderacion exit_pdf, KL desactivado, semilla 42 y un learning rate de 1e-6, sobre un conjunto filtrado de DeepMath con 14.684 preguntas. Cada actualizacion del optimizador empleo 64 prompts con 8 respuestas cada uno.

La relevancia de este checkpoint es doble: por un lado, explora el ajuste fino por refuerzo sobre un modelo de bucles recurrentes de tamano compacto (1.4B); por otro, publica una evaluacion completa en nueve benchmarks matematicos con protocolo pass@8 y limite de salida de 16K tokens. El repositorio incluye codigo de modelado y configuracion personalizados, por lo que requiere `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles recurrentes (LoopLM, familia Ouro) |
| Parametros totales | 1.434.652.673 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 5.8 GB, incluye codigo custom y tokenizer) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Ouro de ByteDance, presentada en el trabajo "Ouro: Scaling Latent Reasoning via Looped Language Models". Se trata de un transformer con bucles recurrentes (LoopLM) que reutiliza capas para incrementar la profundidad efectiva del razonamiento latente sin aumentar proporcionalmente el numero de parametros. Segun la informacion publica del proyecto, los modelos Ouro preentrenados de 1.4B y 2.6B parametros compiten con modelos densos de hasta 12B. El checkpoint aqui descrito parte de la variante Ouro-1.4B-Thinking.

El ajuste fino RLTT se realizo a parametros completos sobre el conjunto filtrado y fusionado DeepMath (14.684 preguntas), con cuatro bucles recurrentes fijos, ponderacion exit_pdf, KL desactivado, semilla 42 y learning rate de 1e-6. Cada actualizacion del optimizador uso 64 prompts con 8 respuestas, y el checkpoint publicado corresponde a la actualizacion global 100, reanudada desde el estado global 20. Los safetensors se subieron byte a byte tal como se generaron. El repositorio incluye la configuracion, el codigo de modelado y los ficheros de tokenizer necesarios, ademas de un `SOURCE_MANIFEST.json` con origen, tamano y SHA256 de cada fichero, y un `provenance.json` con el recibo del driver nativo. No se especifica la composicion completa del dataset ni si hubo etapas adicionales de alineacion (RLHF/DPO) mas alla del RLTT descrito.

## Capacidades

- Generacion de texto conversacional y de razonamiento, con enfasis en matematicas segun el entrenamiento RLTT.
- Razonamiento multi-paso mediante bucles recurrentes internos (cuatro bucles fijos en este checkpoint).
- Resolucion de problemas matematicos verificables, evaluada en nueve benchmarks con protocolo pass@8.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: el nombre del modelo base incluye "Thinking", pero no se detalla el formato de salida en la informacion disponible.
- Vision o audio: no disponible.

## Casos de uso

- Evaluacion de investigacion en razonamiento matematico: el checkpoint permite reproducir y comparar el protocolo pass@8 con 16K de salida sobre nueve benchmarks matematicos, usando la semilla 42 documentada.
- Experimentos de RL sobre modelos pequenos: sirve como punto de partida para estudiar el efecto de RLTT sobre arquitecturas con bucles recurrentes, comparando checkpoints intermedios (global 20 frente a global 100).
- Generacion de soluciones paso a paso en dominios STEM: el modelo esta especializado en problemas de matematicas tipo DeepMath, adecuado para prototipos de tutoria o generacion de explicaciones.
- Base para ajuste fino adicional: al ser un modelo de 1.4B con codigo custom, puede adaptarse a tareas especificas con recursos modestos en comparacion con modelos densos mayores.
- Investigacion sobre eficiencia computacional: la arquitectura LoopLM permite estudiar el equilibrio entre profundidad efectiva y coste de inferencia en un modelo compacto.
- Validacion de pipelines de evaluacion: el repositorio incluye resultados crudos y protocolo, util para auditar metodologias de evaluacion de modelos matematicos.

## Benchmarks y rendimiento

La model card indica que se completaron los nueve benchmarks matematicos con 1.637 preguntas y 8 muestras cada una (13.096 respuestas validadas, semilla 42, limite de salida de 16K). Sin embargo, los valores numericos concretos no estan incluidos en la informacion proporcionada; solo se enlaza el fichero `RESULTS.md` dentro del repositorio.

| Benchmark | Resultado |
|---|---|
| Conjunto de nueve benchmarks matematicos (pass@8, 16K) | no disponible en la informacion proporcionada (ver RESULTS.md enlazado) |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 1.4B en FP16 requiere aproximadamente 2.8-3 GB solo para pesos, mas memoria para KV cache y overhead; en cuantizacion de 8 bits rondaria 1.5 GB y en 4 bits alrededor de 1 GB, aunque no se confirman cuantizaciones oficiales.
- GPU recomendadas: no disponible. Por tamano, cabria en GPUs consumer como RTX 3060 12 GB, RTX 4070 o RTX 4090 en FP16.
- Cabe en GPU consumer: si, previsiblemente, dado el tamano de 1.4B, aunque el codigo custom y los bucles recurrentes pueden incrementar el uso de memoria frente a un transformer estandar.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ouro-1.4B-Thinking-RLTT-step100 | 1.434 M | no disponible | LoopLM (transformer recurrente) | no disponible | Hugging Face |
| ByteDance/Ouro-1.4B-Thinking (base) | 1.4B | no disponible | LoopLM | no disponible | Hugging Face |
| ByteDance Ouro 2.6B (preentrenado) | 2.6B | no disponible | LoopLM | no disponible | Hugging Face / proyecto Ouro |
| Modelos densos de referencia (~12B) | 12B | no disponible | Transformer denso | variable | variable |

Segun el proyecto Ouro, los modelos LoopLM de 1.4B y 2.6B igualan a modelos densos de hasta 12B, lo que situa a este checkpoint en una categoria de eficiencia parametro-rendimiento favorable. No se dispone de comparaciones numericas directas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base ByteDance/Ouro-1.4B-Thinking antes de cualquier despliegue productivo.
- Especializacion estrecha: el ajuste RLTT se realizo exclusivamente sobre DeepMath, por lo que el rendimiento fuera de dominios matematicos puede degradarse.
- Requiere `trust_remote_code=True`: la carga ejecuta codigo de modelado personalizado, lo que implica riesgos de seguridad y compatibilidad con versiones de transformers.
- Riesgo de alucinacion: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos, especialmente en problemas fuera de distribucion.
- Idiomas soportados no documentados: no hay garantia de calidad multilingue.
- Longitud de contexto no documentada: el limite de salida de 16K en la evaluacion no implica necesariamente una ventana de contexto equivalente.
- Checkpoint intermedio: corresponde a la actualizacion global 100; no se documenta si es el estado final del entrenamiento ni su convergencia.
- Sin datos de sesgos: no se han publicado analisis de sesgo o seguridad.
- Repositorio con pocas descargas y sin likes: no hay validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/icemoon28/Ouro-1.4B-Thinking-RLTT-step100
- Dataset de auditoria: https://huggingface.co/datasets/icemoon28/looprl-ouro-1p4b-rltt-step100-audit
- Metricas de entrenamiento (W&B): https://wandb.ai/lz101-rice-university/looprl-ouro/runs/lh61noh5
- Proyecto Ouro: https://ouro-llm.github.io/
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
