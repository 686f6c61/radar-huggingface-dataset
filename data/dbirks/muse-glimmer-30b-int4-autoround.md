# dbirks/Muse-Glimmer-30B-int4-AutoRound

## Resumen

Muse-Glimmer-30B-int4-AutoRound es una cuantizacion int4 (W4A16) del modelo multimodal y agéntico Muse-Glimmer-30B de Meta Superintelligence Labs, producida por dbirks mediante Intel AutoRound y empaquetada en formato compressed-tensors para su uso con vLLM. El modelo base es un decoder denso de 30.000 millones de parametros derivado de Gemma2, con una torre de vision ViT-G/14 y una ventana de contexto de 128K tokens, disenado para cargas de trabajo agénticas locales en hardware de consumo.

Esta version cuantizada reduce el peso en disco de aproximadamente 60 GB (BF16) a unos 20,7 GB, manteniendo la torre de vision y la capa lm_head en BF16. El resultado es una recuperacion de precision media del 98,50% en el benchmark OpenLLM V1 respecto al modelo original, lo que la convierte en la opcion int4 con mayor fidelidad entre las variantes publicadas. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo reside en que permite ejecutar un modelo agéntico multimodal de 30B en GPUs de consumo modernas (Ampere o posteriores) mediante el kernel Marlin de vLLM, sin necesidad de hardware Blackwell para obtener velocidades FP4. Es una opcion practica para desarrolladores que necesitan capacidades de razonamiento, vision y tool calling en entornos locales o con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder denso derivado de Gemma2 (multimodal) + torre de vision ViT-G/14 |
| Parametros totales | 7.954.958.144 (safetensors); el modelo base declara 30B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | W4A16 int4 (grupo de 128), solo capas Linear del decoder de texto; vision tower y lm_head en BF16 |
| Idiomas soportados | ingles (segun model card; no se especifican otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | compressed-tensors (pack-quantized), safetensors |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un modelo de lenguaje multimodal denso con arquitectura derivada de Gemma2, que combina un decoder transformer con una torre de percepcion visual ViT-G/14. Esta disenado para tareas agénticas locales, emitiendo razonamiento con ambito de canal y llamadas a herramientas en formato XML (ATEM) en lugar de JSON, lo que requiere parsers especificos (`muse_glimmer` tool-call y reasoning parsers) en vLLM.

La cuantizacion fue realizada con Intel AutoRound (arXiv:2309.05516), utilizando 128 muestras del dataset NeelNanda/pile-10k con longitud de secuencia 2048 y 200 iteraciones. El esquema aplicado es W4A16: pesos de 4 bits con grupo de 128, activaciones en BF16. Solo se cuantizaron las capas Linear del decoder de texto; la torre de vision, el adaptador, la proyeccion, el patch-embedder y lm_head se mantuvieron en BF16 de forma intencionada para preservar la calidad de la percepcion visual. El proceso se ejecuto con auto-round 0.15.0, transformers 5.16.0.dev0 (fuente), compressed-tensors 0.17.0 y torch 2.11.0+cu130.

## Capacidades

- Generacion de texto y razonamiento multi-step con modo de pensamiento explicito (el razonamiento se devuelve en el campo `reasoning` y la respuesta final en `content`).
- Comprension de imagenes y respuesta a preguntas visuales (image-text-to-text), gracias a la torre de vision ViT-G/14.
- Tool calling y function calling en formato XML (ATEM), con parser dedicado `muse_glimmer` para vLLM.
- Soporte para agentes autonomos y flujos de trabajo multi-paso en local.
- Ventana de contexto larga de 128K tokens, adecuada para documentos extensos o conversaciones prolongadas.
- Capacidades multilingues no documentadas; la model card solo declara ingles.
- Integracion con vLLM sin necesidad de flags de cuantizacion (auto-deteccion del esquema desde config.json).

## Casos de uso

- Asistentes agénticos locales: el modelo puede ejecutarse en una GPU de consumo para gestionar tareas complejas que requieren planificacion, uso de herramientas y razonamiento multi-paso, todo sin conexion a la nube.
- Analisis de documentos con imagenes: gracias a sus 128K tokens de contexto y capacidades multimodales, puede procesar informes extensos con figuras, graficos o capturas y responder preguntas sobre su contenido.
- Automatizacion de soporte tecnico: con tool calling en XML, puede integrarse en sistemas de ticketing para consultar bases de conocimiento, comprobar estado de servicios o escalar incidencias, manteniendo el contexto de la conversacion.
- Generacion de codigo asistida con contexto visual: puede recibir capturas de pantalla de errores o diagramas de arquitectura y generar o corregir codigo en consecuencia, combinando vision y razonamiento.
- Despliegue en entornos con recursos limitados: al ocupar 20,7 GB en disco y requerir menos VRAM que el modelo BF16, es viable en GPUs como RTX 3090/4090 o A10 para produccion a pequeña escala.
- Investigacion en agentes multimodales: su licencia Apache 2.0 y su formato estandar (compressed-tensors) lo hacen adecuado para experimentos academicos o prototipos de sistemas agénticos reproducibles.

## Benchmarks y rendimiento

La model card incluye resultados de evaluacion con EleutherAI lm-evaluation-harness (in-process, `--model vllm`, OpenLLM-v1) comparando el modelo BF16 original con esta version int4. Recovery % = cuantizado ÷ BF16 × 100.

| Tarea | BF16 base | int4 W4A16 | Recuperacion % |
|---|---|---|---|
| arc_challenge | 0.6254 | 0.6041 | 96.6 |
| hellaswag | 0.8275 | 0.8187 | 98.9 |
| winogrande | 0.7798 | 0.7695 | 98.7 |
| truthfulqa_mc2 | 0.6168 | 0.6099 | 98.9 |
| mmlu | 0.7977 | 0.7930 | 99.4 |
| **OpenLLM V1 Avg** | **0.7295** | **0.7191** | **98.50%** |

Para referencia, en el mismo harness: Red Hat GPTQ-NVFP4 = 98.36% y AutoRound NVFP4 (W4A4) = 97.09%. Esta version W4A16 es la que mayor recuperacion ofrece entre las opciones de 4 bits, con el menor tamano (20,7 GB). No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa ~20,7 GB en disco; para inferencia con vLLM se recomienda al menos 24 GB de VRAM para dejar margen a las activaciones y al contexto (especialmente con 128K tokens).
- GPU recomendadas: cualquier NVIDIA Ampere o posterior (RTX 3090, RTX 4090, A10, A100, H100, etc.) gracias al kernel Marlin. No requiere hardware Blackwell.
- En consumer GPU: cabe en RTX 3090 (24 GB) y RTX 4090 (24 GB) con contexto moderado; para 128K tokens completos puede necesitar reduccion de contexto o GPU con mas VRAM.
- Opciones de despliegue: vLLM (recomendado, con auto-deteccion del esquema), compatible con el formato compressed-tensors. No se menciona soporte explicito para llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos numericos en la informacion disponible. Se espera un rendimiento inferior al de una GPU Blackwell con NVFP4, pero con mayor compatibilidad de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Recuperacion OpenLLM V1 | Licencia |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (BF16) | 30B | 128K | BF16 | 100% (base) | Apache 2.0 |
| **Muse-Glimmer-30B-int4-AutoRound** | 30B | 128K | W4A16 int4 | 98.50% | Apache 2.0 |
| Muse-Glimmer-30B-NVFP4-AutoRound | 30B | 128K | NVFP4 W4A4 | 97.09% | Apache 2.0 |

La comparativa se limita a las variantes del mismo modelo base publicadas por el mismo autor. No se dispone de informacion para comparar con otros modelos de la misma categoria (p. ej., Llama 3.1 8B o Qwen2.5-VL) en los mismos benchmarks.

## Limitaciones y advertencias

- Perdida de precision: la cuantizacion int4 reduce la precision media un 1,5% respecto al BF16 (OpenLLM V1 Avg), con mayor impacto en tareas como arc_challenge (96,6% de recuperacion).
- Cuantizacion parcial: solo el decoder de texto esta cuantizado; la torre de vision permanece en BF16, lo que limita el ahorro de memoria en tareas multimodales.
- Sin aceleracion de activaciones: al ser W4A16, las activaciones se mantienen en BF16, por lo que no se obtiene la velocidad de un esquema W4A4 (como NVFP4 en Blackwell).
- Idioma: solo se declara soporte para ingles; el rendimiento en otros idiomas no esta documentado.
- Modelo de razonamiento: requiere el parser de razonamiento `muse_glimmer` en vLLM; sin el, las evaluaciones con chat template pueden colapsar a resultados aleatorios, como advierte la model card.
- Dependencia de toolchain especifica: la reproduccion requiere versiones concretas de transformers (5.16.0.dev0 desde fuente), auto-round 0.15.0 y compressed-tensors 0.17.0, lo que puede complicar la integracion en entornos existentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dbirks/Muse-Glimmer-30B-int4-AutoRound
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Blog de Meta sobre Muse Glimmer: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Receta vLLM para Muse-Glimmer-30B: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- Variante NVFP4: https://huggingface.co/dbirks/Muse-Glimmer-30B-NVFP4-AutoRound
- Repositorio de ejemplo de la comunidad: https://github.com/cobusgreyling/Muse-Glimmer/tree/main
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
