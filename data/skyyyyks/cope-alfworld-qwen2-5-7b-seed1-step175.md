# skyyyyks/cope-alfworld-qwen2.5-7b-seed1-step175

## Resumen

CoPE-ALFWorld Qwen2.5-7B (seed 1, step 175) es un ajuste fino del modelo Qwen2.5-7B-Instruct realizado por el usuario skyyyyks sobre el entorno ALFWorld, un benchmark de tareas de agente basado en texto en el que el modelo debe navegar habitaciones, manipular objetos y completar instrucciones de alto nivel. El entrenamiento emplea CoPE (del repositorio ulab-uiuc/CoPE), una variante de GRPO a la que se anade una perdida auxiliar de prediccion de acciones. Se trata, por tanto, de un experimento de investigacion en aprendizaje por refuerzo para agentes, no de un modelo generalista de proposito comercial.

El checkpoint publicado corresponde al paso 175 de 264 (2 epocas) de la semilla 1. Los pesos se han fusionado desde el checkpoint FSDP de verl a un modelo Hugging Face en bf16, pero solo se incluyen los pesos: no hay estado del optimizador ni del dataloader, por lo que no es posible reanudar exactamente ese entrenamiento. El `generation_config.json` es el del modelo base.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline GRPO con perdida auxiliar sobre ALFWorld, y permite estudiar el comportamiento de un Qwen2.5-7B especializado en razonamiento multi-turno con acciones estructuradas. La tasa de exito reportada en el paso 175 es de 0,930 sobre el lote de entrenamiento (16 tareas x 8 rollouts), una metrica interna y no una evaluacion en held-out.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5, sin confirmar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion causal estandar, y se ajusta mediante CoPE, que en este contexto equivale a GRPO (Group Relative Policy Optimization) mas una perdida auxiliar de prediccion de acciones. El entrenamiento se ejecuto con verl sobre 4 GPU H20, con un lote de 16 prompts y 8 rollouts por prompt, tasa de aprendizaje 1e-6, coeficiente KL de 0,001 (variante `low_var_kl`) y coeficiente de entropia de 0,002. Los rollouts permiten hasta 20 rondas de interaccion con 512 tokens por turno.

La perdida auxiliar de prediccion de acciones usa coeficiente 0,01, K=3, compuerta `wins`, normalizacion por grupo activada y omision de acciones invalidas. El entrenamiento cubre 2 epocas (264 pasos en total); este checkpoint es el paso 175 de la semilla 1. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset mas alla de ALFWorld, ni si hubo etapas adicionales de RLHF o DPO sobre este ajuste.

## Capacidades

- Generacion de texto y razonamiento multi-turno orientado a tareas de agente en entornos textuales.
- Interaccion con el entorno ALFWorld: seleccion de acciones estructuradas (navegar, coger, examinar, usar, etc.) a partir de observaciones textuales.
- Planificacion a lo largo de hasta 20 rondas de interaccion por episodio.
- Prediccion auxiliar de acciones futuras (entrenada con la perdida de action forecast), que puede influir en la coherencia de la secuencia de acciones.
- Capacidades generales heredadas de Qwen2.5-7B-Instruct: generacion de texto, codigo, matematicas y soporte multilingue, si bien no se ha verificado su degradacion o conservacion tras el ajuste.
- Soporte de tool calling / function calling: no confirmado para este checkpoint (el modelo base lo soporta, pero el ajuste puede haber alterado ese comportamiento).
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para agentes: el checkpoint sirve como referencia reproducible de un pipeline GRPO con perdida auxiliar sobre ALFWorld, util para comparar curvas de aprendizaje entre semillas y pasos.
- Evaluacion de agentes en entornos textuales: permite medir la tasa de exito en ALFWorld y analizar el efecto de la prediccion auxiliar de acciones frente a GRPO estandar.
- Generacion de trayectorias sinteticas: el modelo puede producir secuencias de acciones y observaciones que sirvan como datos de entrenamiento o de evaluacion para otros agentes.
- Analisis de robustez en tareas de manipulacion de objetos: util para estudiar como un modelo de 7B gestiona instrucciones compuestas en entornos con estado parcialmente observable.
- Reproduccion de experimentos academicos: al estar publicados los pesos y el codigo de CoPE, permite replicar o extender el estudio con otras semillas o hiperparametros.
- Prototipado de asistentes para tareas domesticas simuladas: puede integrarse en simuladores tipo ALFWorld o TextWorld para validar flujos de decision antes de trasladarlos a entornos reales.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Tasa de exito ALFWorld (paso 175) | 0,930 | Lote de entrenamiento: 16 tareas x 8 rollouts |
| Media de pasos 166-175 | 0,937 | Misma metrica, ventana de 10 pasos |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de la metrica interna de entrenamiento (`critic/score/mean`), que no constituye una evaluacion en held-out. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones estandar de agente sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8 GB de pesos; en 4 bits, alrededor de 4-5 GB (no se han publicado cuantizaciones oficiales de este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, H20 (usadas en entrenamiento) para despliegue sin cuantizar con lotes grandes; RTX 4090 (24 GB) para inferencia en bf16 con lote pequeno.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion, en GPUs de 8-16 GB.
- Opciones de despliegue: transformers (referencia del autor), vLLM, TGI (el modelo declara compatibilidad con endpoints), llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoPE-ALFWorld Qwen2.5-7B (este) | 7,6 B | no disponible | GRPO + perdida auxiliar sobre ALFWorld | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (nativo) | SFT + RLHF generalista | Apache 2.0 | Hugging Face, oficial |
| Alternativas GRPO sobre ALFWorld | no disponible | no disponible | GRPO estandar | no disponible | no disponible |

No se dispone de datos publicados de otros checkpoints CoPE o GRPO sobre ALFWorld en la informacion proporcionada para establecer una comparativa cuantitativa de rendimiento.

## Limitaciones y advertencias

- La metrica de 0,930 es la tasa de exito sobre el lote de entrenamiento, no una evaluacion en held-out; puede sobreestimar el rendimiento real.
- El checkpoint corresponde al paso 175 de 264; no es el modelo final del entrenamiento y su comportamiento puede diferir del de pasos posteriores.
- Solo se publican los pesos: no hay estado del optimizador ni del dataloader, por lo que no se puede reanudar el entrenamiento exacto.
- El ajuste esta especializado en ALFWorld; su rendimiento en tareas generales de texto, codigo o matematicas puede haberse degradado respecto al modelo base.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni evaluaciones de seguridad para este checkpoint.
- El soporte multilingue y de tool calling no esta verificado tras el ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene sus propios terminos que deben respetarse.
- Al ser un experimento de investigacion con 0 descargas y 0 likes en el momento de la consulta, no hay validacion externa de su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skyyyyks/cope-alfworld-qwen2.5-7b-seed1-step175
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Codigo de CoPE: https://github.com/ulab-uiuc/CoPE
- Repositorio de verl: https://github.com/volcengine/verl (referenciado en la model card)
- Entorno ALFWorld: no disponible en la informacion proporcionada
- Paper de CoPE: no disponible en la informacion proporcionada
