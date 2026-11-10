# RedHatAI/Muse-Spark-Open-816B-A42B-MXFP4xFP8

## Resumen

Muse-Spark-Open-816B-A42B-MXFP4xFP8 es una version cuantizada en precision mixta del modelo multimodal Muse-Spark-Open-816B-A42B desarrollado por Meta, publicada por RedHatAI. El modelo original es un transformer de tipo mixture-of-experts (MoE) con 816.000 millones de parametros totales y 42.000 millones de parametros activos por token, capaz de procesar entradas de texto, imagen, video y audio y generar texto. Esta version cuantizada reduce los pesos de los expertos enrutados a MXFP4 y mantiene las proyecciones de atencion y densas en FP8, con activaciones FP8, lo que rebaja el requisito de disco y VRAM en aproximadamente un 74% (de unos 1,64 TB a unos 428 GB).

La relevancia de esta ficha radica en que permite desplegar un modelo de escala frontier en hardware Hopper (H100/H200) sin necesidad de recurrir a precisiones de 16 bits, manteniendo un pipeline multimodal completo (texto, imagen, video y audio) y capacidades de razonamiento y codigo agentico. RedHatAI ha aplicado la receta de cuantizacion con LLM Compressor y el formato compressed-tensors, con soporte de inferencia a traves de vLLM mediante un pull request especifico (vllm-project/vllm#64389).

El checkpoint esta pensado para servir con vLLM en configuraciones multi-GPU con tensor parallelism y expert parallelism. La licencia es la muse-model-license de Meta, que no es una licencia open source estandar y debe revisarse antes de cualquier uso comercial. El modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseSparkForConditionalGeneration (transformer MoE multimodal) |
| Parametros totales | 422.604.571.136 (segun safetensors del checkpoint cuantizado); el modelo original declara 816B totales |
| Parametros activos | 42B (A42B, segun nomenclatura del modelo base) |
| Longitud de contexto | hasta 1M tokens (opcion documentada en la receta de vLLM para el modelo base; no confirmado de forma independiente para este checkpoint) |
| Tipos de cuantizacion | MXFP4 (pesos de expertos enrutados) + FP8 (pesos de atencion y proyecciones densas) con activaciones FP8 dinamicas por grupo; encoder de vision, encoder de audio, embeddings, router de expertos y lm_head sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | muse-model-license (license: other) |
| Formato de pesos | safetensors con formato compressed-tensors; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura MuseSparkForConditionalGeneration, un transformer con mezcla de expertos (MoE) y torres multimodales para vision y audio. Acepta entradas de texto, imagen, video y audio, y produce salida de texto. La nomenclatura 816B-A42B indica 816.000 millones de parametros totales con 42.000 millones activos por token, lo que situa al modelo en la categoria de MoE disperso de gran escala. El checkpoint cuantizado conserva sin tocar los encoders de vision y audio, el adaptador y proyeccion de vision, los embeddings, el router de expertos (en fp32) y el lm_head.

La cuantizacion se realizo con LLM Compressor mediante una receta mixta sin calibracion (model_free_ptq). Los expertos enrutados, que concentran la mayor parte de los parametros, usan pesos MXFP4 con activaciones FP8 cuantizadas dinamicamente por grupo, una combinacion optimizada para GPU Hopper. Las proyecciones de atencion (q, k, v, o y la compuerta de salida de atencion) y las proyecciones densas pre/post del bloque de expertos se mantienen en FP8 con escalado de pesos por bloques y activaciones FP8 dinamicas. Solo se cuantizan los operadores lineales dentro de los bloques transformer. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con modo de razonamiento (reasoning parser `muse` en vLLM).
- Procesamiento multimodal de entrada: texto, imagen, video y audio; salida exclusivamente de texto.
- Capacidades de codigo y tareas agenticas de ingenieria de software (evaluado en SWE-bench Verified, Terminal-Bench 2.1 y DeepSWE 1.1).
- Razonamiento matematico y cientifico (evaluado en AIME 2026 y GPQA Diamond).
- Soporte de tool calling / function calling nativo en vLLM (`--enable-auto-tool-choice` y `--tool-call-parser muse`).
- Soporte de agentes y razonamiento multi-paso.
- Decodificacion especulativa y muestreo de video configurables mediante opciones especificas del modelo en la receta de vLLM.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede recibir capturas de pantalla, imagenes de productos o clips de video junto con texto y responder en ingles, aprovechando la ventana de contexto extendida (hasta 1M tokens en la configuracion documentada) para mantener historiales largos de conversacion.
- Ingenieria de software agentica: con soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines de CI/CD para resolver issues, generar parches y ejecutar comandos en terminal, tal como se evalua en SWE-bench Verified y Terminal-Bench 2.1.
- Analisis de documentos y video: al aceptar video e imagen como entrada, es adecuado para resumir reuniones grabadas, extraer informacion de grabaciones o auditar contenido audiovisual en flujos de compliance.
- Asistencia en investigacion cientifica: sus resultados en GPQA Diamond y AIME 2026 lo orientan a tareas de razonamiento cientifico y matematico de nivel avanzado, como revision de derivaciones o verificacion de resultados experimentales.
- Transcripcion y analisis de audio: la torre de audio sin cuantizar permite procesar grabaciones y generar resumenes o respuestas textuales sobre su contenido.
- Despliegue en cluster Hopper con vLLM: la combinacion MXFP4/FP8 reduce la huella a unos 428 GB, lo que permite servir el modelo con tensor parallelism de 8 GPUs H100/H200 y expert parallelism, algo inviable con el checkpoint original de 1,64 TB en configuraciones equivalentes.
- Generacion de codigo en produccion: el parser de tool calling y el modo de razonamiento permiten integrarlo en asistentes de IDE o bots de revision de codigo que necesitan invocar herramientas externas y justificar sus decisiones.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion con GPQA Diamond, AIME 2026, Terminal-Bench 2.1, SWE-bench Verified y DeepSWE 1.1, comparando el modelo cuantizado con las puntuaciones reportadas por Meta para el modelo original. Sin embargo, los valores numericos de esa tabla no estan disponibles en la informacion proporcionada; solo se confirma la metodologia (Inspect AI, inspect_evals, servido con vLLM mediante API compatible con OpenAI).

| Benchmark | Modelo original (reportado por Meta) | Checkpoint MXFP4xFP8 |
|---|---|---|
| GPQA Diamond | no disponible | no disponible |
| AIME 2026 | no disponible | no disponible |
| Terminal-Bench 2.1 | no disponible | no disponible |
| SWE-bench Verified | no disponible | no disponible |
| DeepSWE 1.1 | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa aproximadamente 428 GB en disco; en inferencia se necesita un margen adicional para cache KV, activaciones y buffers, por lo que se recomienda planificar al menos 500-600 GB de memoria GPU agregada para contextos moderados.
- GPU recomendadas: NVIDIA Hopper (H100, H200) es el objetivo declarado de esta receta, ya que el par MXFP4 pesos + FP8 activaciones esta optimizado para Hopper. En Blackwell el par nativo seria MXFP4/MXFP4, por lo que esta variante no es la optima para esa generacion.
- Configuracion de referencia: `--tensor-parallel-size 8` con `--enable-expert-parallel` en vLLM, es decir, 8 GPUs H100/H200 como minimo practico.
- No cabe en GPU consumer (RTX 4090, 24 GB) ni en configuraciones de una o dos GPUs de 80 GB.
- Opciones de despliegue: vLLM es el unico runtime documentado, y requiere la rama del pull request vllm-project/vllm#64389 hasta que se fusione y se publique. El formato compressed-tensors tambien es compatible con transformers, pero no se documenta un flujo de inferencia completo fuera de vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Muse-Spark-Open-816B-A42B-MXFP4xFP8 (esta ficha) | 816B / 42B (422,6B en checkpoint cuantizado) | hasta 1M (segun receta vLLM) | muse-model-license | safetensors + compressed-tensors, vLLM |
| Muse-Spark-Open-816B-A42B (modelo base, Meta) | 816B / 42B | hasta 1M (segun receta vLLM) | muse-model-license | safetensors, ~1,64 TB, vLLM |
| Alternativas MoE frontier comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada que permitan una comparacion cuantitativa fiable. La comparacion mas directa y verificable es con el propio modelo base sin cuantizar, cuyo unico dato confirmado es el tamano (aproximadamente 1,64 TB frente a 428 GB del checkpoint cuantizado, una reduccion del 74%).

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; no se declaran capacidades multilingues.
- Licencia muse-model-license: no es una licencia open source estandar; es imprescindible revisar LICENSE.md antes de cualquier uso comercial o redistribucion.
- El checkpoint cuantizado no ha sido re-evaluado en el modelo sin cuantizar; las puntuaciones de referencia son las reportadas por Meta y pueden no reflejar el comportamiento exacto de esta version.
- La cuantizacion MXFP4/FP8 puede introducir degradacion en tareas sensibles a la precision numerica; no se publican deltas de accuracy en la informacion disponible.
- El soporte en vLLM depende de un pull request no fusionado (vllm-project/vllm#64389); hasta su merge, el despliegue requiere compilar desde una rama, lo que anade riesgo operativo en produccion.
- Requiere hardware Hopper de gama alta en configuracion multi-GPU; no es desplegable en GPU consumer.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se documentan mitigaciones especificas.
- No se dispone de informacion sobre sesgos conocidos, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO) del modelo base.
- El checkpoint tiene muy pocas descargas y likes en el momento de la ficha, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/RedHatAI/Muse-Spark-Open-816B-A42B-MXFP4xFP8
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Pull request de soporte en vLLM: https://github.com/vllm-project/vllm/pull/64389
- Receta de vLLM para Muse Spark Open: https://recipes.vllm.ai/meta-models/Muse-Spark-Open-816B-A42B
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/vllm-project/compressed-tensors
- Inspect AI: https://github.com/UKGovernmentBEIS/inspect_ai
- inspect_evals: https://github.com/UKGovernmentBEIS/inspect_evals
