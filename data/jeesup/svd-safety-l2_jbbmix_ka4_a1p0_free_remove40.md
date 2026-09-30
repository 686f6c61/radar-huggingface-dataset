# Jeesup/svd-safety-l2_jbbmix_ka4_a1p0_free_remove40

## Resumen

El modelo `Jeesup/svd-safety-l2_jbbmix_ka4_a1p0_free_remove40` es un checkpoint experimental de Llama-2-7b-chat comprimido mediante SVD-LLM, una tecnica de compresion post-entrenamiento basada en descomposicion en valores singulares (SVD) de las matrices de pesos. Lo publica el usuario Jeesup como artefacto de investigacion dentro de un estudio sobre como la compresion SVD degrada el comportamiento de seguridad de un LLM alineado y que regla de seleccion de componentes permite repararlo. No es un modelo de chat de proposito general ni un asistente desplegable.

En concreto, esta celda de la rejilla elimina el 40,00% de los parametros densos (fraccion resultante de 0,5998), aplica una regla de seleccion etiquetada como `unknown` y asigna un presupuesto de restauracion del 0,000% de los parametros densos, es decir, cero componentes SVD restaurados. Se entrena con semilla fija 42, lo que facilita la reproducibilidad del experimento.

Su relevancia es metodologica: permite medir el coste en seguridad de comprimir un modelo alineado y sirve de punto de referencia frente a otras celdas de la misma rejilla que si restauran componentes. Los metadatos de safetensors declaran 6.738.415.616 parametros, mientras que la model card indica una fraccion densa de 0,5998, una discrepancia que se comenta mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2 (heredada de meta-llama/Llama-2-7b-chat-hf) |
| Parametros totales | 6.738.415.616 segun metadatos de safetensors; la model card declara una fraccion resultante de 0,5998 (aproximadamente 4,04e9 parametros efectivos; cifra derivada, no publicada) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama-2-7b-chat-hf utiliza 4.096 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos safetensors en precision completa |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Pipeline declarado | text-generation |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B chat: un transformer decoder-only con atencion causal. Sobre ese checkpoint no se realiza un entrenamiento nuevo, sino una compresion post-entrenamiento con SVD-LLM: las matrices de pesos se descomponen en valores singulares y se descartan componentes de bajo rango hasta eliminar el 40,00% de los parametros densos. En esta celda no se restaura ningun componente (`restore budget` de 0,000%, 0 componentes restaurados, 0 componentes sustituidos), por lo que el resultado es una version puramente comprimida, sin reparacion posterior.

La model card documenta la procedencia completa: compresion SVD-LLM con 40,00% de parametros eliminados, regla de seleccion `unknown`, presupuesto de restauracion nulo y semilla 42. No se detallan en la informacion disponible los datos de entrenamiento del modelo base, la composicion del dataset de compresion-calibracion ni si se aplico RLHF o DPO adicional; hay que remitirse a la documentacion de Llama-2-7b-chat-hf para esos datos. La innovacion tecnica del artefacto es precisamente el eje del estudio: cuantificar la perdida de seguridad inducida por la compresion de bajo rango y evaluar reglas de seleccion de componentes para recuperarla.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Llama-2-7b-chat-hf.
- Razonamiento basico e instrucciones en formato chat, con la degradacion esperable tras eliminar el 40% de los parametros.
- Evaluacion de seguridad: el checkpoint incorpora metricas de tasa de exito de ataque (ASR) frente a AdvBench y StrongREJECT.
- Medicion de sobre-rechazo en prompts benignos (macro over-refusal con WildGuard), util para estudiar el equilibrio seguridad-utilidad.
- Analisis de interpretabilidad sobre pesos comprimidos: permite estudiar que componentes de bajo rango concentran el comportamiento de rechazo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido en la informacion disponible.
- Capacidades multilingues: no disponibles; la model card no declara idiomas soportados.

## Casos de uso

- Estudio de ablacion sobre reglas de seleccion de componentes SVD: el checkpoint es una celda de una rejilla que varia la regla de seleccion y el presupuesto de restauracion, de modo que permite aislar el efecto de cada regla sobre la seguridad y la perplejidad.
- Red teaming y evaluacion de jailbreaks: con AdvBench ASR de 0,0308 y StrongREJECT ASR de 0,0415 medidas con juez HarmBench, sirve como sujeto experimental para comparar la robustez de modelos comprimidos frente a los no comprimidos.
- Calibracion de umbrales de sobre-rechazo: la metrica de macro over-refusal de 0,3460 con WildGuard permite cuantificar cuanto rechazo indebido anade la compresion y ajustar politicas de filtrado.
- Investigacion en interpretabilidad de bajo rango: al no restaurar ningun componente, el checkpoint expone el estado puramente comprimido, idoneo para analizar la relacion entre espectro singular y comportamiento de rechazo.
- Baseline en estudios de compresion: sirve como referencia para comparar SVD-LLM con otras tecnicas (cuantizacion, poda estructurada o destilacion) manteniendo el mismo modelo base y la misma licencia.
- Validacion de pipelines de evaluacion de seguridad: las cuatro metricas publicadas (dos ASR, over-refusal y perplejidad WikiText-2) permiten verificar que un pipeline interno de evaluacion reproduce los valores reportados antes de usarlo con modelos en produccion.
- Analisis del compromiso entre perplejidad y seguridad: con una perplejidad WikiText-2 de 11,4870 y ASR medidos en el mismo checkpoint, se puede estudiar si la degradacion de lenguaje correlaciona con la degradacion de alineacion.
- Reproduccion de experimentos: la semilla fija 42 y la procedencia documentada facilitan replicar la celda exacta en un entorno controlado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0308 |
| StrongREJECT ASR (juez HarmBench) | 0,0415 |
| Macro over-refusal (WildGuard) | 0,3460 |
| Perplejidad WikiText-2 | 11,4870 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidades generales, ni valores comparativos del modelo base sin comprimir, por lo que no es posible calcular la delta de degradacion con los datos aportados.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 13,5 GB solo para pesos (tamano del repositorio), mas overhead de activaciones y cache KV; en la practica conviene disponer de 16 GB o mas.
- Si se aplica cuantizacion de 4 bits con bitsandbytes, GPTQ o AWQ, la huella de pesos bajaria a un rango aproximado de 3,5 a 4,5 GB, aunque el repositorio no incluye versiones pre-cuantizadas.
- GPUs de datacenter recomendadas: A100 (40 GB o 80 GB), H100, L40S.
- GPUs de consumo compatibles: RTX 4090 y RTX 3090 con 24 GB en FP16; tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requeririan cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (el tag `text-generation-inference` esta presente) y servicios compatibles con endpoints. Para llama.cpp u Ollama seria necesaria una conversion a GGUF, que no se incluye en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza | Metricas de seguridad |
|---|---|---|---|---|---|
| Este checkpoint (`..._jbbmix_ka4_a1p0_free_remove40`) | 6,74e9 segun safetensors; fraccion 0,5998 | No disponible | Llama 2 Community | Celda de investigacion | ASR AdvBench 0,0308; ASR StrongREJECT 0,0415; over-refusal 0,3460; ppl 11,4870 |
| meta-llama/Llama-2-7b-chat-hf | 6,74e9 | 4.096 tokens | Llama 2 Community | Modelo base alineado | No disponibles en esta informacion |
| Jeesup/svd-safety-l2_jbb_k0p02_a1p0_free_remove40 | No disponible | No disponible | Llama 2 Community | Checkpoint hermano de la rejilla | No disponibles en esta informacion |
| Jeesup/svd-safety-l2_jbb_k0p02_a0p5_protected_remove40 | No disponible | No disponible | Llama 2 Community | Checkpoint hermano de la rejilla | No disponibles en esta informacion |
| Jeesup/svd-safety-l2_jbb_k0p02_a0p5_protected_remove50 | No disponible | No disponible | Llama 2 Community | Checkpoint hermano de la rejilla | No disponibles en esta informacion |

## Limitaciones y advertencias

- La propia model card advierte de que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y de que el checkpoint no debe tratarse como un asistente desplegable.
- La compresion por si sola eleva la tasa de exito de ataque, y esta celda no aplica ninguna restauracion (presupuesto 0,000%), por lo que no incorpora mecanismo de recuperacion de alineacion.
- Riesgo de alucinacion y de generacion incoherente: la perplejidad WikiText-2 de 11,4870 es elevada, indicativa de degradacion del modelado de lenguaje frente a un modelo no comprimido.
- Sobre-rechazo alto: un macro over-refusal de 0,3460 implica que una proporcion significativa de peticiones benignas serian rechazadas.
- Discrepancia de metadatos: el recuento de safetensors (6.738.415.616) coincide con el tamano denso de Llama-2-7b y no con la fraccion de 0,5998 declarada en la model card, lo que sugiere que el fichero conserva las formas densas; conviene verificar el numero real de parametros efectivos antes de cualquier uso.
- Idiomas soportados no documentados; sin informacion no se puede garantizar un comportamiento correcto fuera del ingles.
- Licencia Llama 2 Community License: el uso comercial esta sujeto a sus condiciones, incluidos los requisitos de atribucion y las restricciones de la politica de uso aceptable; los ficheros `LICENSE.txt` y `USE_POLICY.md` acompanan al repositorio.
- Artefacto con 0 descargas y 0 likes y sin validacion externa; no hay evidencia de uso en produccion ni de auditoria independiente.
- No se proporcionan datos de sesgos, de composicion del dataset de calibracion ni de evaluacion multilingue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_jbbmix_ka4_a1p0_free_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Checkpoint hermano `svd-safety-l2_jbb_k0p02_a1p0_free_remove40`: https://huggingface.co/Jeesup/svd-safety-l2_jbb_k0p02_a1p0_free_remove40
- Checkpoint hermano `svd-safety-l2_jbb_k0p02_a0p5_protected_remove40`: https://huggingface.co/Jeesup/svd-safety-l2_jbb_k0p02_a0p5_protected_remove40
- Checkpoint hermano `svd-safety-l2_jbb_k0p02_a0p5_protected_remove50`: https://featherless.ai/models/Jeesup/svd-safety-l2_jbb_k0p02_a0p5_protected_remove50
- Despliegue en FriendliAI de un checkpoint hermano: https://friendli.ai/models/Jeesup/svd-safety-l2_jbb_k0p02_a1p0_free_remove40
- Ficha de registro de un checkpoint hermano: https://free2aitools.com/model/jeesup/svd-safety-l2_jbb_k0p02_a0p1_free_remove40
