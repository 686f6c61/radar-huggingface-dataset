# prithivMLmods/Qwen3.6-35B-A3B-abliterated-NVFP4-GGUF

## Resumen

Qwen3.6-35B-A3B-abliterated-NVFP4-GGUF es una cuantización NVFP4 en formato GGUF del modelo Qwen3.6-35B-A3B de Alibaba (equipo Qwen), previamente "abliterado" por huihui-ai (un proceso que elimina los mecanismos de rechazo del modelo) y cuantizado con llama.cpp por prithivMLmods. El modelo base es un MoE disperso multimodal con 35B de parámetros totales y unos 3B activos por token, orientado a tareas de código, agentes y comprensión multimodal (texto, imágenes, vídeo y OCR).

La relevancia de esta versión radica en la cuantización NVFP4, optimizada para los Tensor Cores FP4 de la arquitectura NVIDIA Blackwell (RTX Pro 6000, serie RTX 50, B200, B300), lo que permite ejecutar el modelo completo en una sola GPU con un consumo pico de unos 21,7 GiB de VRAM. Además, el fichero GGUF incorpora Multi-Token Prediction (MTP), una forma de decodificación especulativa integrada en los propios pesos que acelera la inferencia local sin necesidad de un modelo draft separado.

Según la model card, el modelo base alcanza un 73,4 % en SWE-Bench Verified, ofrece una ventana de contexto nativa de 262K tokens (extensible a más de 1M mediante YaRN) y se distribuye bajo licencia Apache 2.0, lo que lo hace apto para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso multimodal (qwen3_5_moe), 40 capas híbridas con bloques Gated DeltaNet, Multi-Token Prediction (MTP) |
| Parametros totales | 35.505.313.516 (≈35,5B) |
| Parametros activos | ≈3B por token (A3B) |
| Longitud de contexto | 262K nativa (extensible a 1M+ vía YaRN); probado en el repo con 16.384 tokens |
| Tipos de cuantizacion | NVFP4 (22,7 GB); mmproj multimodal (903 MB) |
| Idiomas soportados | Inglés (etiquetado en la ficha); el modelo base declara vocabulario de 248K tokens para 201+ idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con extensión MTP para decodificación especulativa) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de tipo Mixture-of-Experts con 35B de parámetros totales y solo ~3B activos por token, lo que permite ofrecer calidad de modelos mucho mayores con coste de inferencia equivalente a un denso de 3B. La arquitectura combina 40 capas híbridas que incluyen bloques Gated DeltaNet (una alternativa eficiente a la atención estándar para secuencias largas), una dimensión oculta de 2048 y un vocabulario de 248K tokens. Incorpora Multi-Token Prediction (MTP), que en la versión GGUF se materializa como cabezas de salida adicionales integradas en los pesos que predicen varios tokens futuros por pasada, acelerando la generación local sin modelo draft externo.

Sobre el entrenamiento del modelo base, la model card no detalla el número de tokens ni la composición del dataset; solo indica que es una iteración mejorada sobre Qwen3.5-35B-A3B, orientada a fiabilidad en producción para agentes de desarrollo autónomos, salidas JSON estructuradas y tareas de ingeniería de software con contexto largo. En cuanto a la variante aquí fichada, se trata de una versión "abliterated" (con los mecanismos de rechazo eliminados mediante fine-tuning por huihui-ai) y posteriormente cuantizada a NVFP4 con llama.cpp. No hay información disponible sobre RLHF/DPO ni datos de entrenamiento.

## Capacidades

- Generación de texto conversacional con coste de inferencia de un denso de 3B gracias a la activación dispersa de ~3B parámetros por token.
- Comprensión multimodal: texto, imágenes, vídeo y OCR (pipeline image-text-to-text; requiere el fichero mmproj de 903 MB).
- Código y razonamiento agéntico: según la model card, 73,4 % en SWE-Bench Verified, con razonamiento a nivel de repositorio y flujos de frontend.
- Tool calling / function calling: el modelo base incluye optimizaciones de parsing de tool calls según la model card.
- Contexto largo: 262K tokens nativos, extensible a más de 1M con YaRN; útil para ingeniería de software sobre repositorios completos.
- Decodificación especulativa MTP integrada en los pesos GGUF (draft_n_max=2), que acelera la generación local.
- Sin mecanismos de rechazo de seguridad (abliterated): responde a instrucciones sin las salvaguardas del modelo original.
- Optimizaciones de servido compatibles: prefix caching, chunked prefill y salidas JSON estructuradas.

## Casos de uso

- Agentes de desarrollo autónomos: el modelo está optimizado para razonamiento sobre repositorios y tareas tipo SWE-Bench, por lo que puede integrarse en pipelines de CI/CD o herramientas tipo agente de código para resolver issues y refactorizar proyectos completos aprovechando su contexto de 262K tokens.
- Asistentes de programación locales: con solo 21,7 GiB de VRAM pico en cuantización NVFP4, cabe en una RTX Pro 6000 de 96 GB con margen para contexto amplio, permitiendo autocompletado y chat de código con latencias de ~273 tokens/s.
- Análisis de documentos y OCR multimodal: mediante el fichero mmproj, puede procesar imágenes y vídeos con texto (capturas de interfaces, documentos escaneados, diagramas) para extraer y razonar sobre su contenido.
- Procesamiento de código bases extensas: su ventana nativa de 262K tokens (extensible a 1M+ con YaRN) permite auditar proyectos grandes, generar documentación o realizar revisiones de código cruzando múltiples ficheros.
- Generación de salidas estructuradas: la model card destaca la fiabilidad para JSON estructurado, útil para integraciones con APIs, extracción de datos y orquestación de flujos con tool calling.
- Chatbots e inferencia de alto throughput en local: la combinación MoE + MTP + FP4 ofrece ~273 tokens/s de generación en una sola GPU, adecuada para servicios conversacionales multi-turno autoalojados.
- Investigación sobre alineación y abliteración: al tratarse de una variante abliterated, es útil para estudiar el comportamiento del modelo sin filtros de seguridad, siempre en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios de esta cuantización en la información disponible. La model card cita para el modelo base Qwen3.6-35B-A3B un 73,4 % en SWE-Bench Verified ("rivalizando con modelos 10 veces mayores en parámetros activos"), sin desglose adicional ni comparativa tabulada. No hay datos de MMLU, HumanEval, GSM8K u otras métricas, ni evaluaciones de la variante abliterated.

Sí se publican mediciones de rendimiento de inferencia en una RTX PRO 6000 Blackwell (96 GB):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 164,58 tokens/s |
| Velocidad media de generación | 272,99 tokens/s |
| Tiempo total de ejecución | 97,2 s |
| Contexto usado | 16.384 tokens |
| KV Cache (K) | q8_0 |
| VRAM pico en GPU | 21,73 GiB |
| Utilización pico de GPU | 82 % |
| Capas offloaded | 99 (-ngl 99) |
| Decodificación especulativa | MTP (draft_n_max=2) |

## Requisitos de hardware

- VRAM estimada para inferencia: 22,7 GB solo para los pesos NVFP4; el test del autor reporta un pico de 21,73 GiB con contexto de 16.384 tokens y KV cache q8_0 (más el mmproj de 903 MB si se usa la parte visual).
- GPU recomendadas: cualquier GPU NVIDIA Blackwell con soporte nativo de Tensor Cores FP4: RTX Pro 6000 (Blackwell), serie RTX 50, B200 y B300. El test de referencia usó una RTX PRO 6000 Blackwell Server Edition de 96 GB.
- GPUs consumer: en una RTX 5090 (32 GB) los pesos caben con poco margen para contexto y KV cache; en GPUs de 24 GB (RTX 3090/4090) no cabe completa y requeriría offload parcial a CPU, con pérdida notable de rendimiento y sin aceleración FP4 nativa (estas arquitecturas no soportan NVFP4 en hardware).
- Despliegue: llama.cpp / llama-cli (comando de ejemplo en la model card con `--spec-type draft-mtp`), Ollama y vLLM son compatibles con el modelo base; para esta variante GGUF la vía documentada es llama.cpp. La model card también lista text-generation-inference y transformers.
- Latencia y throughput: en la configuración de test (RTX Pro 6000 Blackwell, -ngl 99, MTP activo), 272,99 tokens/s de generación y 164,58 tokens/s de procesamiento de prompt.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-abliterated-NVFP4-GGUF | 35,5B | ~3B | 262K (1M+ con YaRN) | NVFP4 (GGUF) | Apache 2.0 | Multimodal, MTP, optimizado para Blackwell |
| Qwen/Qwen3.6-35B-A3B (base) | 35,5B | ~3B | 262K (1M+ con YaRN) | FP8 y otras | Apache 2.0 | Con salvaguardas de seguridad; soporte oficial de Qwen |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated | 35,5B | ~3B | 262K (1M+ con YaRN) | Pesos originales | Apache 2.0 | Variante abliterated de origen, sin cuantizar |

No se dispone de datos de benchmarks comparativos directos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Al ser una variante abliterated, el modelo carece de los mecanismos de rechazo de seguridad del original: puede generar contenido dañino o inapropiado ante peticiones maliciosas. No es adecuado para entornos de producción expuestos a usuarios finales sin capas de seguridad adicionales.
- Riesgo de alucinación estándar de LLM; no hay evaluaciones publicadas de fiabilidad fáctica para esta variante.
- La cuantización NVFP4 está diseñada para hardware Blackwell: en GPUs anteriores (Ampere, Ada, Hopper) no hay aceleración FP4 nativa y el rendimiento puede degradarse significativamente o no ser compatible.
- El etiquetado de idioma de la ficha es "en" (inglés); aunque el modelo base declara soporte para 201+ idiomas, no hay datos de rendimiento en castellano para esta variante.
- Los datos de rendimiento publicados corresponden a una configuración muy específica (RTX Pro 6000 Blackwell, contexto 16K, MTP); los resultados reales variarán según hardware, prompt y versión del runtime.
- La abliteración y la cuantización agresiva a FP4 pueden degradar la calidad respecto al modelo base; no hay benchmarks que cuantifiquen esta pérdida.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución sin restricciones relevantes.
- El modelo es una cuantización de terceros (prithivMLmods) a partir de una derivación de terceros (huihui-ai), sin soporte oficial del equipo Qwen.

## Enlaces

- Ficha del modelo: https://huggingface.co/prithivMLmods/Qwen3.6-35B-A3B-abliterated-NVFP4-GGUF
- Fichero principal (NVFP4, 22,7 GB): https://huggingface.co/prithivMLmods/Qwen3.6-35B-A3B-abliterated-NVFP4-GGUF/blob/main/Qwen3.6-35B-A3B-abliterated-NVFP4.gguf
- Fichero mmproj (903 MB): https://huggingface.co/prithivMLmods/Qwen3.6-35B-A3B-abliterated-NVFP4-GGUF/blob/main/Qwen3.6-35B-A3B-abliterated-NVFP4.mmproj.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo fuente (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- llama.cpp: https://github.com/ggml-org/llama.cpp
