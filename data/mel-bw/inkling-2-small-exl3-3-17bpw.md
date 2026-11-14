# mel-bw/Inkling-2-Small-EXL3-3.17bpw

## Resumen
Inkling-2-Small-EXL3-3.17bpw es una cuantizacion de terceros del modelo multimodal thinkingmachines/Inkling-2-Small, publicada por el usuario mel-bw. El modelo base es un transformer de tipo MoE (mixture of experts) desarrollado por Thinking Machines, disenado para generacion de texto e imagen-a-texto, con capacidades conversacionales, agenticas y de uso de herramientas. Este checkpoint concreto aplica cuantizacion EXL3 (trellis quantization) a los expertos enrutados, reduciendo el peso del repositorio a 250,6 GB y permitiendo su despliegue en 3 GPU NVIDIA RTX PRO 6000 Blackwell (96 GB) con contexto de 1M de tokens.

La relevancia de esta ficha radica en que demuestra una ruta practica para servir un modelo MoE multimodal de gran tamano en hardware de estacion de trabajo Blackwell (SM120), algo que el checkpoint original NVFP4 no permite de forma directa con las herramientas estandar. La cuantizacion mantiene intactos atencion, router, embeddings, encoder de vision y el drafter DSpark/MTP, y solo recuantiza los expertos.

La licencia es Apache-2.0, heredada del modelo base, lo que facilita su uso comercial e investigacion. No obstante, el checkpoint no es drop-in: requiere builds especificos de vLLM y kernels de exllamav3 con soporte para la activacion SwiGLU con soft-cap de Inkling 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con drafter DSpark/MTP |
| Parametros totales | 123.555.115.008 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (segun model card del quant) |
| Tipos de cuantizacion | EXL3 3.17 bpw promedio en expertos (capas 0-39 a 3 bpw, capas 40-47 a 4 bpw); resto en precision del checkpoint padre (NVFP4 de origen) |
| Idiomas soportados | Ingles con capacidades multilingues generales (segun model card del base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento
El modelo base Inkling 2 Small es un transformer MoE multimodal que acepta entradas de texto e imagen y genera texto. Incluye un encoder de vision, un router de expertos, atencion con 48 cabezas de query y 8 de KV, y un drafter DSpark/MTP para decodificacion especulativa. La model card del quant indica que la atencion, el router, los embeddings, el encoder de vision y el drafter se mantienen sin cambios respecto al checkpoint padre; solo los expertos enrutados se recuantizan.

El proceso de cuantizacion parte de la release NVFP4: los expertos se dequantizan y luego se recuantizan con EXL3 (trellis quantization, codebook `mul1`, output scales). La calibracion usa 512k tokens (250 filas x 2.048) del mix por defecto de exllamav3 (web, codigo, multilingue, tecnico, wiki y texto aleatorio), propagados capa por capa a traves del modelo padre. Cada capa comparte una Hessiana de entrada para las proyecciones gate/up, y cada experto tiene su propia Hessiana para la proyeccion down, calculada sobre todos los tokens de calibracion. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre si se aplico RLHF o DPO.

## Capacidades
- Generacion de texto conversacional multi-turno con contexto de hasta 1M de tokens.
- Razonamiento y respuesta a instrucciones en ingles y capacidades multilingues generales.
- Procesamiento de imagenes (image-text-to-text) mediante encoder de vision integrado.
- Soporte de tool calling y function calling, orientado a sistemas agenticos.
- Razonamiento multi-paso y uso en pipelines de agentes.
- Generacion de codigo en multiples lenguajes de programacion.
- Decodificacion especulativa mediante drafter DSpark/MTP para acelerar la inferencia.
- Capacidad de servir con tensor parallel 1, 2, 3, 4 y 8 (TP3 mediante padding de cabezas en runtime).

## Casos de uso
- Asistente conversacional de contexto largo: con 1M de tokens de ventana, el modelo puede mantener conversaciones con historiales extensos o documentos completos sin truncar, adecuado para atencion al cliente o soporte tecnico documental.
- Analisis de documentos tecnicos con imagenes: al aceptar image-text-to-text, permite extraer informacion de diagramas, capturas o paginas escaneadas junto con el texto circundante en tareas de ingenieria o compliance.
- Generacion de codigo en produccion: su soporte de tool calling y su capacidad de razonamiento multi-paso permiten integrarlo en pipelines de CI/CD para revision de codigo, generacion de tests o refactorizacion asistida.
- Sistemas agenticos con herramientas: el modelo puede orquestar llamadas a APIs y funciones externas en flujos multi-paso, util para automatizacion de tareas de back-office o agentes de investigacion.
- RAG sobre corpus extensos: con contexto de 1M tokens y prefix caching, es viable inyectar grandes volumentes de documentacion recuperada sin fragmentacion agresiva, mejorando la coherencia de las respuestas.
- Despliegue en estaciones de trabajo Blackwell: al estar cuantizado para 3x RTX PRO 6000, permite servir el modelo en infraestructura local de laboratorio o empresa sin depender de clusters de datacenter, con throughput medido de ~88-93 tok/s en decodificacion.
- Investigacion y fine-tuning: la licencia Apache-2.0 y los pesos abiertos facilitan experimentos de ajuste fino y evaluacion comparativa en entornos academicos.

## Benchmarks y rendimiento
La model card del quant proporciona metricas de fidelidad respecto al checkpoint NVFP4, no benchmarks de tareas estandar:

| Panel | NLL, NVFP4 | NLL, este modelo | Delta NLL | KL medio | Acuerdo top-1 |
|---|---|---|---|---|---|
| Prosa (8.184 posiciones) | 1,0366 | 1,0400 | +0,0034 | 0,0100 | 96,80% |
| Codigo (8.184 posiciones) | 0,3493 | 0,3610 | +0,0118 | 0,0172 | 97,47% |
| Total (16.368 posiciones) | 0,6929 | 0,7005 | +0,0076 | 0,0136 | 97,13% |

El incremento de +0,0076 en NLL equivale a un aumento del 0,76% en perplejidad. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

Rendimiento medido en 3x RTX PRO 6000 Blackwell Max-Q (limite de 250 W cada una), TP3, KV cache BF16, contexto de 1M tokens y prefix caching activo:

| Metrica | Valor |
|---|---|
| Prefill, prompt de 8k | ~5.400 tok/s |
| Prefill, prompt de 32k | ~5.000 tok/s |
| Decodificacion, stream unico | ~88-93 tok/s |

## Requisitos de hardware
- VRAM estimada: el repositorio ocupa 250,6 GB; se recomienda al menos 288 GB agregados para margen de KV cache y overhead en contexto largo.
- Configuracion probada: 3x NVIDIA RTX PRO 6000 Blackwell (96 GB cada una) con tensor parallel 3.
- Compatibilidad de kernels: EXL3 funciona en NVIDIA Ampere (SM80) y posteriores; solo la configuracion SM120 con TP3 ha sido validada.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de 80 GB.
- Opciones de despliegue: vLLM con soporte EXL3 MoE para Inkling 2 y fallback de atencion Triton para SM120; kernels de exllamav3 con SwiGLU soft-capped. No carga en vLLM, SGLang, Transformers ni el servidor estandar de ExLlamaV3 sin parches.
- Tensor parallel soportado: 1, 2, 3, 4 y 8; TP3 requiere padding de cabezas a 54/9 en runtime.
- Throughput: ~5.000-5.400 tok/s en prefill y ~88-93 tok/s en decodificacion segun medicion del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Small-EXL3-3.17bpw (este) | 123,6B | 1M | Apache-2.0 | Hugging Face, requiere build custom | Cuantizacion EXL3 para 3x RTX PRO 6000 |
| thinkingmachines/Inkling-2-Small (NVFP4) | 123,6B | 1M | Apache-2.0 | Hugging Face | Checkpoint original, formato NVFP4 |
| thinkingmachines/Inkling-2-Small-MXFP8 | 123,6B | 1M | Apache-2.0 | Hugging Face | Variante MXFP8 del mismo modelo base |

No se dispone de informacion sobre modelos de otros fabricantes comparables en la documentacion proporcionada.

## Limitaciones y advertencias
- No es un checkpoint drop-in: no carga en vLLM, SGLang, Transformers ni ExLlamaV3 estandar; requiere builds parcheados y kernels especificos.
- El soporte de runtime es trabajo en curso, gestionado en el Discord de Local Inference Lab y en el repositorio del autor; puede haber inestabilidad o cambios.
- Solo la configuracion 3x RTX PRO 6000 Blackwell con TP3 ha sido probada; otros hardware pueden requerir ajustes no documentados.
- Riesgo de alucinacion inherente a modelos de lenguaje de gran escala; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas: el modelo esta orientado principalmente al ingles, con capacidades multilingues generales no cuantificadas.
- La cuantizacion introduce una degradacion medible: +0,76% de perplejidad y ~97% de acuerdo top-1 respecto al checkpoint NVFP4; en tareas de codigo la degradacion es mayor (Delta NLL +0,0118).
- Licencia Apache-2.0 permite uso comercial, pero se debe respetar la politica de uso aceptable del modelo base de Thinking Machines.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria independiente.

## Enlaces
- Hugging Face (este checkpoint): https://huggingface.co/mel-bw/Inkling-2-Small-EXL3-3.17bpw
- Modelo base NVFP4: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Variante MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- EXL3 / exllamav3: https://github.com/turboderp-org/exllamav3
- Calibration mix de exllamav3: https://github.com/turboderp-org/exllamav3/tree/master/exllamav3/conversion/standard_cal_data
- PR de vLLM con soporte Inkling 2: https://github.com/vllm-project/vllm/pull/67325
- PR de vLLM con atencion Triton SM12x: https://github.com/vllm-project/vllm/pull/51560
- PR de vLLM con atencion Triton SM8x: https://github.com/vllm-project/vllm/pull/55078
- Repositorio de soporte SM120 TP3: https://github.com/meldavy/inkling2-small-sm120-tp3/blob/main/README.md
- Quant EXL3 de referencia DeepSeek-V4.1-Flash (LibertAIDAI): https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Quant EXL3 de referencia DeepSeek-V4.1-Flash (Mia-AiLab): https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw
