# liana313/tokengate-sftbase-biodexr-qwen3-1.7b

## Resumen

TokenGate SFT baseline (BioDEX-Reactions) es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3-1.7B por el usuario liana313. Se trata del checkpoint de referencia "estandar" (SFT plano, sin token gating) que el articulo TokenGate (arXiv:2610.26754) utiliza como linea base frente al que compara su variante con compuertas de tokens. El adaptador se ha ajustado sobre la tarea oficial BioDEX-Reactions, que consiste en predecir terminos de reaccion adversa del vocabulario MedDRA y evaluarse mediante F1 de coincidencia exacta sobre conjuntos.

El modelo no es un modelo fundacional nuevo, sino un ajuste fino de bajo rango (LoRA) del transformer denso Qwen3-1.7B, con 1.700 millones de parametros en el modelo base y un adaptador de rango 16 y alpha 32 aplicado a las proyecciones q_proj y v_proj de todas las capas. El checkpoint publicado corresponde al paso 19200, seleccionado con la misma regla que los checkpoints con compuerta: maxima precision en el conjunto de test retenido a contexto completo bajo el limite de equidad del articulo.

Su relevancia es metodologica: permite reproducir la comparacion del articulo entre un ajuste fino convencional y la propuesta TokenGate, y sirve como referencia para quien quiera evaluar tecnicas de control de contexto largo en tareas de extraccion de entidades biomedicas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar materializados o que el repositorio es de muy reciente creacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B) con adaptador LoRA sobre proyecciones q_proj y v_proj |
| Parametros totales | 1.700 millones en el modelo base; el adaptador LoRA anade un numero no disponible de parametros (r16, alpha32) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explicita; el articulo evalua a contexto completo y la etiqueta "long-context" sugiere uso extendido, pero no se especifica la ventana exacta |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye como state dict en `lora_step19200.pt`; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | State dict de PyTorch (`.pt`) para el adaptador LoRA, mas `params.json` con la configuracion de entrenamiento; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer denso de tipo decoder-only. El ajuste es un SFT estandar de siguiente token, sin mecanismo de compuerta de tokens, con un presupuesto de adaptador identico al de las ejecuciones con TokenGate: rango 16, alpha 32, aplicado a `q_proj` y `v_proj` en todas las capas. El entrenamiento se realiza sobre la tarea oficial BioDEX-Reactions, orientada a la prediccion de terminos MedDRA de reaccion adversa y evaluada con F1 de coincidencia exacta sobre conjuntos.

El checkpoint publicado es el paso 19200, elegido mediante la misma regla de seleccion que los checkpoints con compuerta: maxima precision en el conjunto de test retenido a contexto completo, respetando el limite de equidad definido en el articulo. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO; al tratarse de un SFT baseline, lo esperable es que no las haya, pero no se confirma en la model card.

## Capacidades

- Generacion de texto autoregresiva heredada del modelo base Qwen3-1.7B.
- Extraccion y prediccion de terminos de reaccion adversa MedDRA en el dominio BioDEX-Reactions.
- Procesamiento de contexto largo, segun la etiqueta `long-context` del repositorio (sin cifra concreta publicada).
- Ajuste especializado de bajo rango que modifica el comportamiento del modelo base sin reentrenar todos los pesos.
- No se documentan capacidades de tool calling, function calling, uso como agente, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Reproduccion de la linea base del articulo TokenGate: cargar el adaptador con la libreria TokenGate y comparar sus resultados con los de la variante con compuerta sobre BioDEX-Reactions, usando el mismo checkpoint y la misma regla de seleccion.
- Investigacion en extraccion de entidades biomedicas: emplear el adaptador como punto de partida para tareas de identificacion de reacciones adversas en textos clinicos y farmacologicos.
- Evaluacion de tecnicas de control de contexto: servir como referencia SFT plana para medir la ganancia atribuible al token gating en escenarios de contexto largo.
- Experimentos de ajuste eficiente: el adaptador r16/alpha32 sobre q_proj y v_proj es un ejemplo reproducible de LoRA de bajo coste que puede reutilizarse como plantilla en otros dominios.
- Analisis de seleccion de checkpoints: el paso 19200 y la regla de maxima precision en test retenido a contexto completo permiten estudiar el impacto de la politica de seleccion en la evaluacion final.
- Docencia y formacion: caso practico de SFT sobre un modelo pequeno (1.7B) con evaluacion F1 de coincidencia exacta sobre un vocabulario controlado como MedDRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en bfloat16 requiere del orden de 3,4 GB solo para pesos; con cache KV y overhead de ejecucion conviene prever 5-8 GB. El adaptador LoRA anade una cantidad marginal. Cifras orientativas, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100, H100 o RTX 4090 son sobradas y permiten lote mayor y contexto mas largo.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En GPUs de 6 GB habria que recurrir a cuantizacion del modelo base.
- Opciones de despliegue: la model card indica carga mediante la libreria TokenGate (`tokengate.e2e_gate.gate_module.lora`) sobre `transformers` con `AutoModelForCausalLM`. No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI, ya que el adaptador se distribuye como state dict `.pt` y no como safetensors o GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokenGate SFT baseline (este modelo) | 1.7B base + LoRA r16 | No disponible | BioDEX-Reactions (F1 exact-match MedDRA) | Apache 2.0 | Adaptador `.pt` en HuggingFace |
| TokenGate con compuerta (`liana313/tokengate-biodexr-qwen3-1.7b`) | 1.7B base + LoRA r16 con gating | No disponible | BioDEX-Reactions | No disponible en la informacion | HuggingFace |
| Qwen/Qwen3-1.7B (modelo base) | 1.7B | Contexto de Qwen3-1.7B (no detallado aqui) | Generacion de texto general | No disponible en la informacion | HuggingFace |

La comparacion directa con alternativas de la misma categoria (otros adaptadores SFT para BioDEX-Reactions) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador especializado en una unica tarea (BioDEX-Reactions); su uso fuera de ese dominio no esta validado y probablemente degrade el comportamiento respecto al modelo base.
- No se documentan sesgos conocidos, pero al derivar de Qwen3-1.7B hereda los sesgos del modelo base y de los datos de ajuste, no caracterizados en la model card.
- Riesgo de alucinacion en la generacion de terminos MedDRA: al evaluarse con coincidencia exacta, cualquier termino inventado penaliza la metrica; en produccion clinica requiere validacion contra el vocabulario oficial.
- Idiomas soportados no especificados; no hay garantia de comportamiento multilingue.
- Longitud de contexto no cuantificada: la etiqueta `long-context` no viene acompanada de una cifra verificable.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3-1.7B y de los datos BioDEX-Reactions.
- El repositorio muestra 0.0 GB y 0 descargas, lo que puede indicar que los pesos no estan efectivamente alojados o que el artefacto es de reciente publicacion; conviene verificar la integridad de `lora_step19200.pt` antes de usarlo.
- El formato `.pt` (pickle de PyTorch) exige cargar con `weights_only=True` y confiar en el origen; no es un formato tan seguro ni portable como safetensors.
- Dependencia de la libreria TokenGate para la carga del adaptador, lo que limita la portabilidad a otros stacks de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liana313/tokengate-sftbase-biodexr-qwen3-1.7b
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Contraparte con compuerta: https://huggingface.co/liana313/tokengate-biodexr-qwen3-1.7b
- Articulo TokenGate: https://arxiv.org/abs/2610.26754
- Repositorio TokenGate: https://github.com/token-gate-llms/TokenGate
