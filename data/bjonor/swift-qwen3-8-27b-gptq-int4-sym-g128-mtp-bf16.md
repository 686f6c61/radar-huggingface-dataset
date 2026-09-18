# bjonor/Swift-Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16

## Resumen

Swift-Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16 es una cuantizacion GPTQ de 4 bits no oficial del modelo `ukisai/Swift-Qwen3.8-27b`, publicada por el usuario bjonor. El modelo base es un fine-tune de `Qwen/Qwen3.8-27B` (Apache-2.0, Copyright 2026 Alibaba Cloud) distribuido bajo la Swift Open License v1.0. Esta version reduce el peso de los pesos del modelo de lenguaje a INT4 con activaciones en FP16 (W4A16), manteniendo deliberadamente sin cuantizar la cabeza MTP de decodificacion especulativa y la torre de vision, ambas en BF16.

La arquitectura es `Qwen3_5ForConditionalGeneration`, un transformer hibrido de 64 capas que combina atencion lineal Gated-DeltaNet con atencion completa cada cuarta capa. Cuenta con 27.781.427.952 parametros totales, hidden size de 5120, 24 cabezas de consulta y 4 de clave/valor con `head_dim` de 256, y un vocabulario de 248.320 tokens. El contexto nativo es de 262.144 tokens, con servicio validado hasta 131.072 tokens.

Su relevancia practica es doble: por un lado reduce el checkpoint a unos 19 GB en 5 shards de safetensors, lo que permite inferencia multimodal de 27B en GPUs de gama profesional con 30 GiB de VRAM; por otro, conserva la cabeza MTP en BF16 para habilitar decodificacion especulativa, algo poco habitual en cuantizaciones comunitarias. El modelo esta pensado para despliegue en vLLM sobre Intel XPU (Arc Pro B70), con recetas de cuantizacion y servicio publicadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration`; transformer hibrido con atencion lineal Gated-DeltaNet + atencion completa cada 4 capas; 64 capas |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; servicio validado hasta 131.072 tokens |
| Tipos de cuantizacion | GPTQ INT4 (W4A16), `group_size=128`, simetrico, `desc_act=false`, `lm_head` sin cuantizar; 400 modulos cuantizados |
| Idiomas soportados | en, multilingual (segun etiquetas del repositorio) |
| Licencia | swift-open-license-1.0 (`license_name: other`) |
| Formato de pesos | safetensors (5 shards, 2399 tensores, ~19 GB); requiere runtime compatible con GPTQ |
| Hidden size | 5120 |
| Cabezas de atencion | 24 Q / 4 KV, `head_dim` 256 |
| Vocabulario | 248.320 tokens |
| Tensiones preservadas en BF16 | 15 tensores `mtp.*` (cabeza draft) y 333 tensores `model.visual.*` (torre de vision) |
| Cuantizador | `gptqmodel 7.3.2` (torch 2.9.1+xpu) |
| Tamano del repositorio | 19,6 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo parte de `ukisai/Swift-Qwen3.8-27b`, a su vez derivado de `Qwen/Qwen3.8-27B`. La arquitectura declarada es `Qwen3_5ForConditionalGeneration` con 64 capas que alternan atencion lineal Gated-DeltaNet con atencion completa cada cuarta capa, un esquema hibrido orientado a reducir el coste de la cache KV en contextos muy largos. El modelo es multimodal (pipeline `image-text-to-text`), con una torre de vision (`model.visual.*`) y una cabeza MTP de prediccion multi-token para decodificacion especulativa.

La informacion disponible no detalla el proceso de entrenamiento del modelo base: no se especifican el numero de tokens de preentrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El unico dato de datos de entrenamiento corresponde a la calibracion de la cuantizacion: 256 muestras de `HuggingFaceH4/ultrachat_200k` (`train_sft[:256]`), truncadas a 2048 tokens, revision `8049631c405ae6576f93f445c6b8166f76f5505a`. La cuantizacion se realizo con `gptqmodel 7.3.2` en modo true-sequential, con staging de la Hessiana en FP32, `damp_percent=0.05` y `damp_auto_increment=0.01`; no se reportaron modulos que cayeran al fallback RTN (umbral de error del 0,5%). El proceso completo tardo 2,40 horas en una Intel Arc Pro B70.

La innovacion tecnica destacable es la preservacion selectiva: la cabeza MTP y la torre de vision permanecen en BF16. El `quantize_config.json` registra esta exclusion mediante la regla dinamica `{"-:.*mtp.*": {}}`, y en el build de vLLM para XPU es necesario ademas construir la capa draft sin `quant_config` (variable `B70_MTP_BF16_DRAFT=1` mas un parche de metadatos para el limite de `max-model-len`). El resultado es un checkpoint de ~19 GB que mantiene operativa la decodificacion especulativa con 3 tokens especulativos.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat incluida (`chat_template.jinja`) y pipeline de `image-text-to-text`.
- Procesamiento de vision: la torre visual se conserva en BF16 (333 tensores `model.visual.*`), junto con `processor_config.json` y `video_preprocessor_config.json`, lo que apunta a entrada de imagen y video.
- Contexto largo: 262.144 tokens nativos, con servicio validado hasta 131.072 tokens; la atencion lineal Gated-DeltaNet reduce el coste de cache en secuencias extensas.
- Tool calling / function calling: el repositorio documenta el uso con `--enable-auto-tool-choice` y `--tool-call-parser qwen3_xml` en vLLM, lo que implica soporte de llamadas a herramientas en formato XML estilo Qwen3.
- Decodificacion especulativa con MTP: configurable en vLLM mediante `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.
- Soporte multilingue declarado mediante la etiqueta `multilingual`, aunque la ficha solo enumera `en` y `multilingual` sin detallar el listado de idiomas.
- Capacidades de razonamiento, codigo o matematicas: no documentadas explicitamente en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada con historial largo: con 131.072 tokens de contexto validado en servicio, el modelo puede mantener conversaciones multi-turno que incluyan transcripciones extensas, correos encadenados o documentacion de producto sin truncar el historial.
- Asistentes multimodales sobre documentos escaneados: al conservar la torre de vision en BF16 y exponer un pipeline `image-text-to-text`, permite responder preguntas sobre capturas, diagramas o paginas de PDF renderizadas manteniendo la calidad de representacion visual.
- Automatizacion de flujos con herramientas: el soporte de tool calling con parser `qwen3_xml` permite conectarlo a APIs internas (CRM, ERP, tickets) y encadenar llamadas dentro de un agente, con el parser gestionando el formato de invocacion.
- Procesamiento de normativa y contratos: los 262.144 tokens de contexto nativo permiten cargar reglamentos completos o contratos extensos y hacer preguntas de detalle sin estrategias de recuperacion fragmentada.
- Analisis de video o series de imagenes: la presencia de `video_preprocessor_config.json` y la torre visual sin cuantizar habilitan tareas de descripcion y resumen de contenido audiovisual en pipelines por lotes.
- Servicio de inferencia de bajo coste en hardware Intel: al estar la receta probada sobre Arc Pro B70 con 30,3 GiB de VRAM y vLLM XPU, encaja en escenarios donde no hay acceso a GPUs NVIDIA pero si a aceleradores Intel.
- Asistente de codigo con contexto de repositorio: el contexto largo permite incluir varios ficheros fuente simultaneamente; conviene validar el rendimiento en codigo, ya que no hay benchmarks publicados en la informacion disponible.
- Despliegue con latencia mejorada via decodificacion especulativa: el uso de la cabeza MTP en BF16 con 3 tokens especulativos esta pensado para reducir el coste por token generado en entornos con limites de throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni comparaciones cuantitativas con modelos similares. Los unicos datos de rendimiento aportados son de naturaleza operativa:

| Metrica | Valor |
|---|---|
| Tiempo de cuantizacion | 2,40 horas en 1x Intel Arc Pro B70 |
| Verificacion | contract check (VERIFY PASS), smoke test de modelo pequeno, test de endpoint y streaming |
| Limite de batching | `vllm-xpu-kernels` < 0.1.14.1 aborta el motor al mezclar tokens de decodificacion especulativa con tokens de prefill en la misma invocacion |

## Requisitos de hardware

- Peso del checkpoint: ~19 GB en 5 shards de safetensors (INT4 para las 400 proyecciones lineales del modelo de lenguaje, BF16 para MTP y torre de vision).
- VRAM estimada para solo los pesos: ~19-20 GB. A ello hay que sumar la cache KV, el buffer de activaciones y el overhead del runtime, por lo que un presupuesto de 30 GiB resulta ajustado pero suficiente (la cuantizacion se realizo y verifico con 30,3 GiB de VRAM).
- Configuracion de referencia probada: `--gpu-memory-utilization 0.92`, `--kv-cache-dtype fp8`, `--max-model-len 131072`, `--max-num-seqs 1`, `--max-num-batched-tokens 16384`, `--enable-prefix-caching`, `--language-model-only`.
- Acelerador de referencia: Intel Arc Pro B70. La informacion disponible no confirma GPU NVIDIA concretas; dado que se trata de un checkpoint GPTQ W4A16, es razonable esperar compatibilidad con implementaciones vLLM/transformers que soporten GPTQ, pero no se aporta una lista verificada.
- GPU consumer: no disponible. El autor no documenta ejecucion en tarjetas consumer (RTX 4090, etc.) y el tamano de pesos (~19 GB) mas cache KV deja poco margen en GPUs de 24 GB con contexto largo.
- Host de cuantizacion: Intel i9-13900K con 64 GB de RAM.
- Opciones de despliegue: vLLM sobre Intel XPU (probado con `vllm/vllm-openai-xpu` @ `vllm 0.27.2rc1.dev77+gac7509e2b.xpu` y `vllm-xpu-kernels 0.1.12.3`), y `transformers` con soporte GPTQ. No se proporcionan pesos GGUF, por lo que llama.cpp u Ollama no estan soportados por esta publicacion.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de speed-up real obtenido con la decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bjonor/Swift-Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16 | 27,8 mil millones | 262.144 nativos / 131.072 en servicio | GPTQ INT4 W4A16 g128 simetrico, MTP y vision en BF16 | swift-open-license-1.0 | safetensors, 5 shards, ~19 GB |
| ukisai/Swift-Qwen3.8-27b (modelo base del fine-tune) | no disponible en la informacion | no disponible en la informacion | sin cuantizar | swift-open-license-1.0 | no disponible en la informacion |
| SergiioB/Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16 | 27B (base Qwen3.8-27B) | no disponible en la informacion | GPTQ INT4 W4A16 g128 simetrico, MTP y vision en BF16 | no disponible en la informacion | safetensors |
| Qwen/Qwen3.8-27B (modelo original) | 27B | no disponible en la informacion | sin cuantizar | Apache-2.0 | no disponible en la informacion |

La diferencia clave frente a la referencia de SergiioB es que aquella cuantiza el modelo base Qwen3.8-27B, mientras que esta cuantiza el fine-tune Swift. El `quantize_config.json` es identico campo por campo salvo el flag `meta.offload_to_disk`, que solo afecta al proceso de cuantizacion. No se dispone de datos de rendimiento comparado entre ambas variantes.

## Limitaciones y advertencias

- Cuantizacion no oficial: el repositorio no esta afiliado, respaldado ni soportado por UkisAI ni por Alibaba Cloud. Cualquier incidencia debe reportarse al autor de la cuantizacion, no a los autores del modelo base.
- Licencia: swift-open-license-1.0 con `license_name: other`. La informacion disponible no detalla los terminos de uso comercial; es obligatorio revisar el fichero `LICENSE` del repositorio base antes de cualquier despliegue en produccion. El modelo original Qwen3.8-27B se distribuye bajo Apache-2.0, pero el fine-tune Swift introduce condiciones adicionales.
- Restriccion tecnica de batching: con `vllm-xpu-kernels` anterior a 0.1.14.1, mezclar tokens de decodificacion especulativa y de prefill en la misma invocacion aborta el motor. Como mitigacion se indica `--max-num-seqs 1` (lo que limita el throughput), kernels >= 0.1.14.1 junto con la PR companera de vLLM #48109 (ambos requisitos son necesarios), o un backport de split-dispatch en Python.
- Dependencia de parches: construir la capa draft MTP sin `quant_config` requiere la puerta `B70_MTP_BF16_DRAFT=1` y un parche de metadatos para el limite de `max-model-len`, procedentes del cookbook de SergiioB. Sin estos parches el despliegue en XPU puede fallar.
- Idiomas: solo se declaran `en` y `multilingual` de forma generica. No hay lista cerrada de idiomas ni evaluacion de calidad por idioma; el comportamiento en castellano no esta verificado en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de 27B de la familia; la cuantizacion INT4 puede degradar ligeramente la fidelidad respecto al checkpoint original, aunque no se aportan mediciones de la perdida de calidad.
- Contexto: aunque el contexto nativo es de 262.144 tokens, el autor solo ha validado el servicio hasta 131.072 tokens. Usar la ventana completa sin validar puede provocar degradacion o fallos.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.
- Calibracion limitada: 256 muestras de UltraChat truncadas a 2048 tokens. Es un conjunto de calibracion pequeno y de dominio conversacional, lo que puede penalizar la calidad en dominios alejados (codigo, matematicas, vision) respecto a una calibracion mas diversa.
- Sin benchmarks publicados, no es posible estimar con rigor la degradacion frente al modelo sin cuantizar ni comparar de forma objetiva con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bjonor/Swift-Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16
- Modelo base (fine-tune): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Artefacto de referencia de la comunidad: https://huggingface.co/SergiioB/Qwen3.8-27B-GPTQ-Int4-sym-G128-MTP-BF16
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Repositorio de cuantizacion, verificacion y receta de servicio en Intel XPU: https://github.com/BjornNordblom/intel-arc-b70-quant
- Cookbook de inferencia en Intel Arc Pro B70 (parches de servicio): https://github.com/SergiioB/intel-arc-pro-b70-inference-cookbook
- Revision del checkpoint origen: `048328f4059015b63f860a453bf94834af0db683`
- Revision del dataset de calibracion: `8049631c405ae6576f93f445c6b8166f76f5505a`
