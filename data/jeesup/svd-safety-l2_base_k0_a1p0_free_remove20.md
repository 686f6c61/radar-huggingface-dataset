# Jeesup/svd-safety-l2_base_k0_a1p0_free_remove20

## Resumen

svd-safety-l2_base_k0_a1p0_free_remove20 es un artefacto de investigacion publicado por el usuario Jeesup en HuggingFace. Se trata de un checkpoint de meta-llama/Llama-2-7b-chat-hf al que se le ha aplicado una compresion mediante SVD-LLM que elimina el 20,00% de los parametros densos, dejando el modelo en una fraccion de parametros de 0,7999 (6.738.415.616 parametros totales frente a los aproximadamente 6.740 millones del original, que en la practica supone un recorte neto de parametros de las matrices proyectadas). Sobre esa base comprimida no se restauro ningun componente SVD: el presupuesto de restauracion es del 0,000% y el numero de componentes restaurados y sustituidos es cero.

El proposito declarado del autor no es ofrecer un asistente conversacional, sino medir el deterioro del comportamiento de seguridad provocado por la compresion SVD y evaluar que regla de seleccion de componentes lo repara mejor. Este checkpoint es una celda concreta de una rejilla sobre reglas de seleccion y presupuestos, con semilla 42, y la propia model card advierte de que algunas celdas estan deliberadamente degradadas en seguridad respecto al modelo original.

Es relevante ahora porque conecta dos lineas de trabajo activas: la compresion de modelos para reducir coste de despliegue y el estudio de la robustez de los alineamientos de seguridad bajo transformaciones de pesos. Los datos publicados (ASR de 0,0135 en AdvBench y 0,0160 en StrongREJECT, con una perplexity de 8,7680 en WikiText-2) permiten comparar celdas de la rejilla entre si, pero no acreditan que el modelo sea desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Llama-2-7b-chat; pesos comprimidos mediante SVD-LLM |
| Parametros totales | 6.738.415.616 (fraccion resultante sobre el denso original: 0,7999) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Llama-2-7b-chat emplea 4.096 tokens |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos safetensors en fp16 (13,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (identificador llama2) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atencion causal, normalizacion RMSNorm y activacion SwiGLU. La intervencion aplicada no es un reentrenamiento sino un post-procesado de los pesos: se usa SVD-LLM para truncar la descomposicion en valores singulares de las matrices del modelo y eliminar el 20,00% de los parametros densos. En esta celda la regla de seleccion de componentes figura como `unknown`, el presupuesto de restauracion es del 0,000% de los parametros densos y el numero de componentes restaurados y sustituidos es 0. La semilla empleada es 42.

No se documenta en la informacion disponible ningun entrenamiento adicional, ajuste por RLHF, DPO o SFT sobre el checkpoint comprimido: la alineacion de seguridad procede del modelo base Llama-2-7b-chat y es precisamente lo que el estudio pretende medir tras la compresion. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni innovaciones de inferencia como decodificacion especulativa o atencion lineal, porque no forman parte del alcance de este artefacto.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama-2-7b-chat, con calidad degradada por el truncado SVD.
- Conversacion multi-turno basica, aunque el autor indica explicitamente que el checkpoint no es un modelo de chat de proposito general.
- Evaluacion de seguridad: el artefacto esta disenado para medirse con AdvBench, StrongREJECT y WildGuard como parte de un estudio de tasas de ataque exitoso y sobrerrechazo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Inferencia compatible con text-generation-inference y con endpoints compatibles, segun las etiquetas del repositorio.

## Casos de uso

- Investigacion sobre compresion de modelos: la celda permite cuantificar cuanto degrada el truncado SVD al 80% de parametros densos en perplexity y en comportamiento, comparando con el modelo sin comprimir y con otras celdas de la misma rejilla.
- Estudio de la robustez del alineamiento de seguridad: con AdvBench ASR de 0,0135 y StrongREJECT ASR de 0,0160 medidos con juez HarmBench, sirve como punto de referencia para medir si la compresion eleva la tasa de exito de ataques.
- Analisis de sobrerrechazo: el 0,3860 de macro over-refusal medido con WildGuard permite estudiar el equilibrio entre seguridad y utilidad conversacional bajo compresion.
- Ablacion de reglas de seleccion de componentes: al ser una celda con regla `unknown` y presupuesto de restauracion 0, funciona como control frente a las celdas con presupuesto 0,1 o 0,02 y reglas alternativas.
- Desarrollo y validacion de harness de evaluacion: util para probar pipelines que cargan checkpoints Llama-2 con transformers y aplican baterias automatizadas de seguridad y perplexity en WikiText-2.
- Reproducibilidad de resultados de compresion: con semilla fija (42) y metrica de fraccion de parametros documentada, permite reproducir el experimento y verificar la metodologia SVD-LLM sobre variantes de Llama-2.
- Docencia y formacion en interpretabilidad: sirve como ejemplo practico de como una transformacion en el espacio de pesos afecta a una capacidad concreta del modelo.

## Benchmarks y rendimiento

Unicamente se dispone de las metricas publicadas por el autor para esta celda. No hay comparaciones con otros modelos en la informacion proporcionada.

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0135 |
| StrongREJECT ASR (juez HarmBench) | 0,0160 |
| Macro over-refusal (WildGuard) | 0,3860 |
| Perplexity en WikiText-2 | 8,7680 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 13,5 GB solo para pesos, mas la cache KV; con contexto de 4.096 tokens conviene reservar 16 GB o mas.
- VRAM estimada en int8: en torno a 7-8 GB de pesos, mas cache KV.
- VRAM estimada en int4: en torno a 4-5 GB de pesos, mas cache KV, si se convierte a un formato cuantizado.
- GPU recomendadas: A100 (40 GB o 80 GB) y H100 para servir con margen y lotes grandes; RTX 4090 o RTX 3090 (24 GB) para fp16 en investigacion con contexto moderado.
- Cabe en GPU de consumo: si. En RTX 4090 y RTX 3090 (24 GB) en fp16; en GPUs de 16 GB como la RTX 4080 conviene usar int8 o reducir el contexto; en GPUs de 8-12 GB solo con cuantizacion int4 y contextos cortos.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta presente en el repositorio), vLLM sobre la arquitectura LlamaForCausalLM y endpoints compatibles. llama.cpp u Ollama requeririan una conversion previa a GGUF que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_base_k0_a1p0_free_remove20 (este) | 6.738.415.616 (fraccion 0,7999) | no disponible | SVD-LLM, 20% eliminado, 0% restaurado | Llama 2 Community License | HuggingFace, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf | ~6.740 millones | 4.096 tokens | sin compresion | Llama 2 Community License | HuggingFace |
| Jeesup/svd-safety-l2_base_k0_a1p0_free_remove40 | no disponible | no disponible | SVD-LLM, 40% eliminado | Llama 2 Community License | HuggingFace |
| Jeesup/svd-safety-l2_jbb_k0p02_a1p0_free_remove40 | no disponible | no disponible | SVD-LLM, 40% eliminado, regla jbb | Llama 2 Community License | HuggingFace |

Los datos de rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa de benchmarks.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la propia model card indica que debe tratarse como sujeto experimental y no como modelo de produccion.
- Degradacion de seguridad deliberada: el autor advierte de que varias celdas de la rejilla estan intencionadamente degradadas en seguridad respecto a Llama-2-7b-chat y que la compresion por si sola eleva la tasa de exito de ataques.
- Riesgo de alucinacion: no se documenta un analisis especifico de veracidad; el truncado SVD reduce la capacidad del modelo y la perplexity de 8,7680 en WikiText-2 no permite descartar degradacion factual.
- Sobrerrechazo elevado: 0,3860 de macro over-refusal medido con WildGuard, lo que implica rechazos indebidos en una fraccion relevante de consultas benignas.
- Idiomas: no se declaran idiomas soportados; el modelo base esta optimizado para ingles y no hay evaluacion multilingue de esta celda.
- Limitaciones de contexto: no se especifica en la ficha; hereda en la practica el limite de 4.096 tokens de Llama-2-7b-chat.
- Licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial queda sujeto a dicha licencia y a su politica de uso aceptable. Es una obra derivada construida con Llama 2.
- Falta de validacion externa: el repositorio registra 0 descargas y 0 likes, y las metricas publicadas son unicamente las del autor; conviene reevaluar antes de extraer conclusiones.
- No se documentan resultados de benchmarks de capacidad general (razonamiento, codigo, matematicas), por lo que se desconoce el alcance real del dano funcional causado por la compresion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_base_k0_a1p0_free_remove20
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Celda relacionada (remove40): https://huggingface.co/Jeesup/svd-safety-l2_base_k0_a1p0_free_remove40
- Celda relacionada (jbb, k0p02, remove40): https://huggingface.co/Jeesup/svd-safety-l2_jbb_k0p02_a1p0_free_remove40
- Celda relacionada (jbb, k0p02, a0p1, remove40) en FriendliAI: https://friendli.ai/models/Jeesup/svd-safety-l2_jbb_k0p02_a0p1_free_remove40
- Registro de modelos con la celda jbb, k0p02, a0p1, remove40: https://free2aitools.com/model/jeesup/svd-safety-l2_jbb_k0p02_a0p1_free_remove40
