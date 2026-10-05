# BAJUKA/LLaVA-llama32-3b-Tfull-r2-s42-s2a

## Resumen

LLaVA-llama32-3b-Tfull-r2-s42-s2a es un modelo de lenguaje de 3.623.479.840 parametros (~3,62 mil millones) desarrollado por BAJUKA como artefacto de investigacion dentro de una cuadricula de entrenamiento controlada que compara el entrenamiento vision-lenguaje (VL) frente al entrenamiento puramente textual. Se construye sobre `meta-llama/Llama-3.2-3B-Instruct` y sobre el framework LLaVA-NeXT, y corresponde al brazo "T-cap" (text twin, gemelo textual) de la etapa S2a (etapa de captioning) con semilla 42.

El modelo es un "gemelo textual": consume exactamente los mismos ejemplos, en el mismo orden, que su contraparte VL, pero con los tokens `<image>`/`<video>` eliminados y el campo de imagen suprimido, de modo que solo se ajusta el modelo de lenguaje. La torre de vision y el proyector se conservan en el checkpoint con sus valores iniciales, pero no se utilizan; por eso el recuento total de parametros (3,62 mil millones) es superior al del Llama-3.2-3B-Instruct base (3,21 mil millones).

Su relevancia es metodologica y no de producto: existe para aislar que cambia el entrenamiento VL respecto al consumo del mismo texto, con un diseno que fija mezclas de datos, orden de ejemplos, ajustes de optimizador y esquema de LR, de forma que las diferencias entre brazos sean atribuibles y no esten confundidas. No es una version ajustada ni alineada en seguridad, y no se han publicado benchmarks de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso; clase `LlavaLlamaForCausalLM` de LLaVA-NeXT sobre backbone Llama-3.2-3B |
| Parametros totales | 3.623.479.840 (~3,62 mil millones) |
| Longitud de contexto | 8192 tokens (longitud maxima de secuencia durante el entrenamiento); el modelo base Llama-3.2-3B-Instruct soporta hasta 128.000 tokens, no confirmado en este checkpoint |
| Tipos de cuantizacion | El repositorio solo publica pesos en bfloat16 (safetensors); no se distribuyen cuantizaciones oficiales GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible (el modelo base es multilingue; la model card no detalla que idiomas conserva este checkpoint) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (bfloat16); tamano del repo 7,3 GB |
| Pipeline | text-generation |
| Prompt template | `llama_v3` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso basado en Llama-3.2-3B-Instruct, cargado dentro del framework LLaVA-NeXT mediante la clase `LlavaLlamaForCausalLM`. El checkpoint incluye los pesos de la torre de vision y del proyector multimodal en sus valores iniciales, pero no se emplean en inferencia: el modelo se comporta como un LM puramente textual. La arquitectura no incorpora mecanismos de atencion lineal, decodificacion especulativa ni disenos MoE o hibridos; es un transformer estandar con atencion causal.

El entrenamiento corresponde a la etapa S2a (caption stage) de una cuadricula controlada. La mezcla de datos es CAP-750K (r2 draw): `captions_700k_r2` (700.000 ejemplos) mas `language_50k_v2` (49.956 ejemplos, reutilizados de v2). Solo se entrena el modulo de lenguaje (`mm_language_model`); la torre de vision y el proyector permanecen sin tocar. Se ejecuto 1 epoca completa (5859 de 5859 pasos), con batch global de 128, learning rate de 1e-5 con scheduler coseno y warmup ratio de 0.03, precision bfloat16 y longitud maxima de secuencia de 8192 tokens. El entrenamiento se realizo sobre 4x H100 80 GB con DeepSpeed ZeRO-3. La perdida de entrenamiento paso de 2.735 a 1.307 (media de los ultimos 50 pasos registrados: 1.344), con 0 perdidas no finitas a lo largo de los 5859 pasos. No se aplico RLHF ni DPO; es un ajuste supervisado.

## Capacidades

- Generacion de texto autoregresiva y conversacion de un solo turno o multi-turno, heredando la base instruccional de Llama-3.2-3B-Instruct.
- Modelado de lenguaje y generacion de descripciones textuales, dado que su etapa de ajuste es de captioning (S2a).
- Soporte del template de prompt `llama_v3`.
- Capacidades multilingues: no confirmadas en este checkpoint (dependen del modelo base, que es multilingue).
- Tool calling / function calling: no disponible (no se documenta ni se garantiza en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o thinking mode: no disponibles; aunque el checkpoint contiene pesos de torre de vision, el modelo se publica como text-only y esos pesos no se usan.
- Cuantizacion: no se distribuyen versiones cuantizadas oficiales.

## Casos de uso

- Investigacion en ablacion vision-lenguaje frente a texto: el modelo sirve como brazo de control textual para medir exactamente que aporta el entrenamiento multimodal consumiendo los mismos ejemplos. Es su proposito principal y el unico respaldado por la model card.
- Reproduccion de experimentos controlados: al compartir mezcla de datos, orden y esquema de LR con su gemelo VL, permite replicar comparaciones entre brazos con semilla fija (42).
- Generacion de descripciones textuales: su etapa de ajuste es de captioning, por lo que puede emplearse para producir texto descriptivo en tareas de investigacion, siempre que se valide su calidad fuera del dominio de entrenamiento.
- Punto de partida para ajuste posterior: al ser un checkpoint derivado de Llama-3.2-3B-Instruct, puede servir como inicializacion para fine-tuning adicional en tareas textuales especificas.
- Estudio de deriva de dominio: util para analizar como un ajuste sobre captions (700.000 ejemplos) afecta al comportamiento conversacional y al estilo del LM base.
- Pruebas de infraestructura de inferencia: por su tamano (3,62 mil millones de parametros) es manejable para validar canalizaciones de despliegue con la clase `LlavaLlamaForCausalLM`.
- Analisis de contaminacion y composicion de datos: la publicacion del `trainer_state.json` con la historia por paso de perdida, grad-norm y LR facilita auditar el proceso de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida de entrenamiento (2.735 -> 1.307; media de los ultimos 50 pasos 1.344) y la ausencia de perdidas no finitas (0 sobre 5859 pasos), sin datos de MMLU, HumanEval, GSM8K ni evaluaciones equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV ni activaciones): ~7,2 GB en bfloat16/fp16 (3,62 mil millones x 2 bytes); ~3,6 GB en int8; ~1,8-2 GB en 4 bits. Hay que anadir la cache KV correspondiente al contexto utilizado (hasta 8192 tokens en configuracion de entrenamiento).
- GPU recomendadas: A100 40/80 GB o H100 80 GB para inferencia en bfloat16 con margen; en consumer, RTX 4090 (24 GB) y RTX 3090 (24 GB) ejecutan el modelo en bfloat16 con holgura.
- Consumer GPU: cabe en tarjetas de 8-12 GB solo con cuantizacion (4 u 8 bits); en 16 GB (RTX 4080, RTX 4060 Ti 16 GB) es viable en bfloat16 con contexto moderado.
- Opciones de despliegue: el modelo requiere la clase `LlavaLlamaForCausalLM` del repositorio LLaVA-NeXT, que no forma parte de `transformers`. Esto complica el uso directo en vLLM, TGI u Ollama; para llama.cpp u Ollama seria necesario convertir los pesos a GGUF y adaptar la arquitectura. La carga de referencia se hace con `load_pretrained_model` de `llava.model.builder`.
- Latencia y throughput: no disponibles; no se han publicado mediciones. El entrenamiento se realizo sobre 4x H100 80 GB con DeepSpeed ZeRO-3, dato que corresponde a entrenamiento y no a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| BAJUKA/LLaVA-llama32-3b-Tfull-r2-s42-s2a | 3,62 mil millones | 8192 (entrenamiento) | llama3.2 | safetensors (bfloat16) | no disponible |
| meta-llama/Llama-3.2-3B-Instruct (modelo base) | ~3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | publicados por Meta (no reproducidos aqui) |
| Qwen2.5-3B-Instruct | ~3,09 mil millones | 32.768 tokens (ampliable con YaRN) | licencia Qwen (revisar terminos) | safetensors, GGUF | publicados por Alibaba (no reproducidos aqui) |

La comparacion con Llama-3.2-3B-Instruct es la mas directa, ya que este checkpoint deriva de el; la diferencia clave es el ajuste S2a sobre CAP-750K y el mayor recuento de parametros por la inclusion (no usada) de la torre de vision y el proyector. No se dispone de comparaciones cuantitativas de rendimiento con ninguno de los dos modelos.

## Limitaciones y advertencias

- Artefacto de investigacion: no es un modelo ajustado ni alineado en seguridad; hereda la licencia y las limitaciones de meta-llama/Llama-3.2-3B-Instruct.
- Sesgos conocidos: no documentados en la model card; al derivar del modelo base, cabe esperar los sesgos de Llama-3.2-3B-Instruct, no evaluados aqui.
- Riesgo de alucinacion: no cuantificado; no se han realizado evaluaciones de fidelidad o veracidad.
- Limitaciones de contexto o idioma: la longitud de entrenamiento fue de 8192 tokens; no se confirma el comportamiento en ventanas mayores ni la cobertura multilingue efectiva tras el ajuste.
- Restricciones de licencia: licencia llama3.2 (Llama 3.2 Community License), con las condiciones de uso comercial que dicha licencia impone; revisar los terminos antes de cualquier uso productivo.
- El checkpoint es un brazo legitimo de la cuadricula, no un "mejor" checkpoint: no se aplico early stopping ni seleccion de checkpoint; cada etapa ejecuta una epoca completa.
- No se publican estados de optimizador, DeepSpeed ni RNG; son pesos de inferencia, no reanudables para entrenamiento.
- Despliegue no estandar: al requerir `LlavaLlamaForCausalLM`, no es compatible directamente con `transformers`, vLLM, TGI u Ollama sin trabajo de adaptacion.
- Cero descargas y cero likes en el momento de la consulta; escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BAJUKA/LLaVA-llama32-3b-Tfull-r2-s42-s2a
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio LLaVA-NeXT: https://github.com/LLaVA-VL/LLaVA-NeXT
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
