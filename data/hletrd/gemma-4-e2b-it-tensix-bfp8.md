# hletrd/gemma-4-E2B-it-Tensix-BFP8

## Resumen

gemma-4-E2B-it-Tensix-BFP8 es una versión cuantizada del modelo multimodal google/gemma-4-E2B-it, adaptada específicamente para su ejecución sobre aceleradores NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). La cuantización la firma hletrd (Xylolabs) mediante su herramienta tensix-bfp-gptq, que aplica GPTQ sobre la rejilla de coma flotante por bloques bfloat8_b (BFP8), un formato nativo de los NPU Tensix. El resultado es un checkpoint de 7,556 GB empaquetado frente a los 9,29 GB del modelo base en bf16, con una degradación de calidad muy contenida.

El modelo hereda del base su naturaleza any-to-any: procesa texto, imagen y audio, y genera texto, con una arquitectura Gemma 4 de tipo transformer con mezcla de expertos (el sufijo E2B indica aproximadamente 2 000 millones de parámetros activos). El checkpoint real en safetensors declara 5 525 831 235 parámetros totales. La ventana de contexto, los idiomas exactos y los detalles de entrenamiento del modelo base no se detallan en la información disponible.

Su relevancia radica en que demuestra que es posible desplegar un modelo multimodal de tamaño medio en hardware Tensix con una fidelidad respecto a bf16 muy superior a la de una cuantización Q4_K_M convencional: la divergencia KL media es de 0,00239 frente a 0,29329 de Q4_K_M, con un top-1 del 98,29 % frente al 80,25 %. Para equipos que trabajan con aceleradores Tenstorrent, esto supone una alternativa práctica para servir el modelo en producción con menor huella de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con mezcla de expertos; atención y MLP cuantizados a bfloat8_b (BFP8) |
| Parametros totales | 5 525 831 235 |
| Parametros activos | Aproximadamente 2 000 millones (según la nomenclatura E2B del modelo base; no confirmado en la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BFP8 (bfloat8_b) en proyecciones de atención (q, o en 35 capas; k, v en 15 capas) y MLP (gate, up, down en 35 capas); bf16 en LM head, embedding, normas, audio_tower, embed_audio, embed_vision y vision_tower. Existe variante BFP4 |
| Idiomas soportados | No disponible (la evaluación menciona texto en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); empaquetado adicional para Tensix con tensix-bfp-gptq |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-E2B-it es un transformer multimodal de la familia Gemma 4, con mezcla de expertos (el identificador E2B apunta a unos 2 000 millones de parámetros activos sobre 5 525 831 235 totales). Incorpora torres específicas para visión (vision_tower, embed_vision) y audio (audio_tower, embed_audio), lo que le permite procesar entradas de imagen y sonido además de texto, y su pipeline_tag es any-to-any. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset y el uso de RLHF o DPO no se especifican en la información disponible; la model card remite al Gemma 4 Technical Report (arXiv:2607.02770).

La innovación de este checkpoint es la cuantización. Se aplicó GPTQ restringido a la rejilla bfloat8_b (formato de coma flotante por bloques nativo de Tensix) sobre las proyecciones de atención y MLP, dejando en bf16 el LM head, los embeddings, las normas y todas las torres de visión y audio. El repositorio incluye las herramientas pack_tensix.py y verify_grid.py, que permiten verificar la integridad de cada matriz empaquetada (incluido un round-trip por la DRAM del dispositivo) y validar la rejilla de cuantización solo con torch. El fichero quant4.json documenta el formato de cada proyección.

## Capacidades

- Generación de texto y razonamiento conversacional con plantilla de chat (apply_chat_template).
- Procesamiento de imagen a texto (image-text-to-text) mediante vision_tower y embed_vision en bf16.
- Procesamiento de audio a texto (audio_tower y embed_audio en bf16), dentro del pipeline any-to-any.
- Capacidades multilingües heredadas del modelo base; la evaluación cubre inglés y coreano, aunque el listado completo de idiomas no está disponible.
- Ejecución sobre NPU Tensix (Wormhole, Blackhole) mediante ttnn, con kernels y runner propios (tensix-kernels y tensix-runner v0.1.0).
- Compatibilidad con transformers y endpoints_compatible para despliegue estándar en GPU/CPU.
- Soporte de tool calling, function calling o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia en hardware Tenstorrent: el checkpoint está empaquetado para Tensix (Wormhole y Blackhole) y permite servir el modelo en NPU con 7,556 GB de pesos, liberando la GPU para otras tareas.
- Asistente multimodal en el borde: al conservar las torres de visión y audio en bf16, puede responder preguntas sobre imágenes o transcripciones de audio en despliegues con presupuesto de memoria ajustado.
- Prototipado de pipelines any-to-any: útil para validar flujos que combinan entrada de imagen, audio y texto antes de escalar a modelos mayores, gracias a su tamaño medio de 5 525 millones de parámetros totales.
- Evaluación de cuantización en producción: sirve como referencia para medir la pérdida de calidad de BFP8 frente a bf16 y Q4_K_M en tareas reales, con métricas KL y top-1 ya publicadas.
- Servicio de chat con contexto conversacional: la plantilla de chat y la integración con transformers permiten desplegarlo con vLLM o TGI en GPU cuando no se dispone de Tensix.
- Investigación en formatos de coma flotante por bloques: el repositorio incluye scripts de verificación (pack_tensix.py, verify_grid.py) que facilitan reproducir y auditar la cuantización.
- Despliegue en entornos con restricciones de memoria: la variante BFP4 del mismo autor permite ir más allá si el dispositivo Tensix tiene menos DRAM.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-E2B-it) | 9,29 | 0 | 100 |
| **Este modelo (BFP8)** | 7,556 | 0,00239 | 98,29 |
| Q4_K_M (llama.cpp) | 3,428 | 0,29329 | 80,25 |

Las métricas de KL y top-1 se calculan sobre 7 968 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), aplicando la plantilla de chat. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (cd959bae) sin matriz de importancia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 7,556 GB de pesos empaquetados para Tensix; en bf16 con transformers el checkpoint completo ocupa aproximadamente 11,1 GB en disco y requiere del orden de 11-12 GB de memoria para cargar los pesos.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 pueden alojarlo en bf16 con holgura. Para Tensix se requiere Wormhole o Blackhole.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en bf16; con cuantizaciones adicionales podría ajustarse en 12 GB, aunque no se ofrecen pesos GGUF en este repositorio.
- Opciones de despliegue: transformers (dtype bfloat16, device_map auto), ttnn sobre Tensix con tensix-runner v0.1.0; compatible con endpoints. No se documenta soporte directo de vLLM, llama.cpp u Ollama para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma-4-E2B-it-Tensix-BFP8 (este) | 5 525 M totales | No disponible | Apache 2.0 | safetensors + Tensix | Cuantizado BFP8, top-1 98,29 % vs bf16 |
| google/gemma-4-E2B-it (base) | 5 525 M totales | No disponible | Apache 2.0 | safetensors | Referencia bf16, 9,29 GB |
| gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP | No disponible | No disponible | Apache 2.0 | safetensors + Tensix | Variante BFP4 para dispositivos con menos memoria |
| Q4_K_M del mismo checkpoint (llama.cpp) | 5 525 M totales | No disponible | Apache 2.0 | GGUF | 3,428 GB, top-1 80,25 % |

## Limitaciones y advertencias

- La cuantización BFP8 introduce una divergencia medible respecto a bf16 (KL 0,00239, top-1 98,29 %); aunque pequeña, puede acumularse en tareas de razonamiento largo o generación extensa.
- El checkpoint está optimizado para Tensix; fuera de ese hardware se ejecuta como un modelo transformers estándar en bf16, perdiendo la ventaja de memoria del empaquetado.
- No se documentan sesgos específicos ni evaluaciones de seguridad del modelo base ni de esta cuantización.
- Riesgo de alucinación inherente a los modelos generativos de este tamaño; no hay datos publicados sobre su tasa en dominios concretos.
- El listado de idiomas soportados no está disponible; la evaluación solo cubre inglés y coreano, por lo que el rendimiento en castellano no está verificado.
- La licencia es Apache 2.0 según la model card del base, pero el repositorio original de Google no incluye fichero LICENSE; el autor añade el texto estándar y un NOTICE con los cambios. Conviene revisar los términos del modelo base antes de uso comercial.
- No se ofrecen pesos GGUF ni integración con llama.cpp u Ollama en este repositorio; para esos formatos habría que reconvertir desde el base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/gemma-4-E2B-it-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Variante BFP4: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP
- Código de cuantización (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper Gemma 4 Technical Report: https://arxiv.org/abs/2607.02770
