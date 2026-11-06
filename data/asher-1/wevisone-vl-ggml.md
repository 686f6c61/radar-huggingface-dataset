# Asher-1/WeVisOne-VL-GGML

## Resumen
WeVisOne-VL-GGML es un repositorio de exportaciones en formato GGUF de los modelos WeVisOne-VL (variantes de 2B y 4B), desarrollados originalmente por Tencent y empaquetados por el usuario Asher-1 para su uso con llama.cpp. WeVisOne-VL es un modelo de vision-lenguaje que unifica la percepcion a nivel de objeto (deteccion, localizacion referencial, conteo, pointing y OCR) y a nivel de pixel (segmentacion referencial y alpha matting con prompt) mediante prediccion estructurada de siguiente token y un decodificador de mascaras ligero de 9,6 millones de parametros.

El repositorio no contiene pesos en safetensors, sino exclusivamente ficheros GGUF organizados por tamano (2B y 4B) y por nivel de precision (FP16, Q8_0, Q4_K_M para el VLM; FP16 y FP32 para el decodificador de mascaras). La arquitectura del VLM en llama.cpp corresponde a `qwen3vl`, mientras que el decodificador de mascaras usa una arquitectura propia denominada `wevisone_mask`.

Es relevante para desarrolladores que necesitan ejecutar tareas de percepcion visual avanzada (segmentacion, deteccion, matting) de forma local y eficiente, sin depender de APIs en la nube, aunque el modelo es muy reciente y cuenta con cero descargas y cero likes en el momento de redactar esta ficha. El dato de parametros totales reportado por safetensors (9.511.460) corresponde al decodificador de mascaras, no al VLM completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: transformer multimodal con arquitectura `qwen3vl` en llama.cpp; decodificador de mascaras: `wevisone_mask` |
| Parametros totales | VLM: no disponible (variantes de 2B y 4B); decodificador de mascaras: 9.511.460 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | VLM: FP16, Q8_0, Q4_K_M; decodificador: FP32 y FP16 (Q4_K deliberadamente no ofrecido) |
| Idiomas soportados | no disponible |
| Licencia | other (misma licencia que el modelo original WeVisOne-VL de Tencent) |
| Formato de pesos | GGUF (ggml); no se distribuyen safetensors en este repo |

## Arquitectura y entrenamiento
WeVisOne-VL es un modelo fundacional de vision-lenguaje que unifica la percepcion a nivel de objeto y a nivel de pixel mediante prediccion estructurada de siguiente token. La parte de percepcion de objetos cubre deteccion, localizacion referencial, conteo, pointing y OCR; la parte de pixel cubre segmentacion referencial y alpha matting con prompt. Para ello emplea un decodificador de mascaras ligero de 9,6 millones de parametros que se ejecuta por separado del VLM principal.

En este repositorio, el VLM se exporta como un modelo fusionado (mmproj + LLM) compatible con la arquitectura `qwen3vl` de llama.cpp, mientras que el decodificador de mascaras se distribuye como ficheros GGUF independientes que se ejecutan mediante el runtime C++ de WeVisOne-VL. El decodificador solo se ofrece en FP32 (unico nivel con paridad garantizada) y FP16 (para despliegues con memoria ajustada, con posible deriva en MAD); Q4_K se descarta deliberadamente porque las estadisticas de GroupNorm/MSDA y la ruta residual alpha-cascade degradan por encima de los umbrales de MAD publicados bajo pesos de 4 bits.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. Tampoco se detalla la innovacion de atencion o decodificacion especulativa mas alla de la prediccion estructurada de tokens y el decodificador de mascaras ligero.

## Capacidades
- Generacion de texto descriptivo a partir de imagenes (image-to-text), tarea principal declarada en el pipeline del repositorio.
- Deteccion de objetos en imagenes.
- Localizacion referencial (referring localization) guiada por lenguaje natural.
- Conteo de objetos.
- Pointing (señalizacion de puntos en la imagen).
- OCR (reconocimiento optico de caracteres).
- Segmentacion referencial a nivel de pixel.
- Alpha matting con prompt (promptable alpha matting) para recorte fino de objetos.
- Soporte multimodal vision-lenguaje mediante el proyector multimodal (mmproj) separado.
- Ejecucion local eficiente mediante llama.cpp con cuantizaciones de 4 y 8 bits.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes o capacidades multilingues.

## Casos de uso
- Segmentacion de productos en catalogos de e-commerce: el modelo puede generar mascaras de pixel precisas de cada producto a partir de una instruccion en lenguaje natural, usando el decodificador de mascaras en FP32 para garantizar paridad y calidad en el recorte.
- Extraccion de texto en documentos escaneados: gracias a su capacidad de OCR integrada, puede procesar facturas, tickets o formularios y devolver el texto estructurado, todo ello en local con la variante Q8_0 para reducir memoria.
- Anotacion automatica de datasets de vision: el modelo puede generar bounding boxes, puntos y mascaras de segmentacion referencial para acelerar el etiquetado de imagenes en pipelines de entrenamiento de otros modelos.
- Conteo de objetos en imagenes industriales o de inventario: permite contar elementos (piezas, vehiculos, personas) mediante instrucciones en lenguaje natural, adecuado para entornos con requisitos de privacidad que impiden usar APIs externas.
- Recorte fino de personas u objetos para produccion audiovisual: el alpha matting con prompt permite generar mates de alta calidad para composicion de video o fotografia, usando el decodificador en FP32 para evitar derivas.
- Asistencia a personas con discapacidad visual: el modelo puede describir imagenes y localizar objetos concretos ("donde esta la taza") en dispositivos con recursos limitados gracias a la variante 2B en Q4_K_M (1,20 GB).
- Despliegue en el borde (edge): la variante 4B en Q4_K_M (2,53 GB) permite ejecutar tareas de percepcion visual en equipos con GPU de consumo o incluso CPU, sin conexion a internet.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona criterios de paridad (token-identical en benchmarks de modo fijo para FP16, ratio ≤ 2,5 para Q8_0 y verificacion en suite de paridad para Q4_K_M), pero no se incluyen numeros concretos de MMLU, HumanEval, GSM8K ni de tareas de vision.

## Requisitos de hardware
- VRAM estimada para el VLM 2B: 3,80 GB en FP16, 2,02 GB en Q8_0, 1,20 GB en Q4_K_M (solo pesos del modelo).
- VRAM estimada para el VLM 4B: 8,23 GB en FP16, 4,38 GB en Q8_0, 2,53 GB en Q4_K_M (solo pesos del modelo).
- Proyector multimodal (mmproj): 0,76 GB (2B) y 0,78 GB (4B) en FP16, que se suma a la memoria del VLM.
- Decodificador de mascaras: 0,02 GB en FP16 y 0,04 GB en FP32, despreciable frente al VLM.
- GPU recomendadas: no disponible de forma explicita; por tamano, la variante 4B en FP16 requiere una GPU con al menos 10-12 GB de VRAM (RTX 3080/4080/4090, A10, L4), mientras que la 2B en Q4_K_M cabe en GPUs de consumo con 4-6 GB (GTX 1660, RTX 3050, etc.).
- Cabe en GPU de consumo: si, especialmente las variantes 2B en Q4_K_M/Q8_0 y 4B en Q4_K_M.
- Opciones de despliegue: llama.cpp (compilado con soporte `qwen3vl`) para el VLM; runtime C++ de WeVisOne-VL para el decodificador de mascaras. No se mencionan vLLM, TGI, Ollama ni otros backends.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de datos de rendimiento comparativos en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas plausibles de la misma categoria (VLM con capacidades de segmentacion), indicando "no disponible" donde no hay datos.

| Modelo | Parametros | Contexto | Segmentacion | Licencia | Formato |
|---|---|---|---|---|---|
| WeVisOne-VL 2B/4B (este repo) | 2B / 4B (VLM) + 9,6M (decoder) | no disponible | Si (referring segmentation + alpha matting) | other | GGUF |
| Qwen2.5-VL | 3B / 7B / 72B | no disponible en esta ficha | No nativa (solo grounding) | Apache 2.0 (segun version) | safetensors, GGUF |
| Florence-2 | 0,23B / 0,77B | no disponible en esta ficha | Si (region proposal, segmentation) | MIT | safetensors |
| SAM 2 | no disponible | no disponible | Si (segmentacion promptable) | Apache 2.0 | safetensors |

Los datos de Qwen2.5-VL, Florence-2 y SAM 2 se incluyen solo como referencia estructural; no se han verificado en la informacion proporcionada y no deben tomarse como benchmarks comparativos.

## Limitaciones y advertencias
- Modelo muy reciente y sin traccion: cero descargas y cero likes en Hugging Face en el momento de la ficha, lo que implica ausencia de validacion comunitaria.
- Licencia "other": es necesario revisar los terminos exactos de la licencia del modelo original de Tencent antes de cualquier uso comercial; no se especifican restricciones en la informacion disponible.
- El decodificador de mascaras en FP16 puede presentar deriva en MAD (mean absolute deviation) y debe validarse antes de su uso en produccion; solo FP32 tiene paridad garantizada.
- Q4_K no esta disponible para el decodificador por degradacion de las estadisticas de GroupNorm/MSDA y de la ruta residual alpha-cascade.
- El VLM en Q4_K_M se ofrece como "quality tier only" y requiere verificacion en la suite de paridad antes de usarse en produccion.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni limitaciones de contexto.
- El repositorio no incluye pesos en safetensors, solo GGUF, lo que limita su uso a llama.cpp y al runtime C++ de WeVisOne-VL.
- El dato de parametros totales de safetensors (9,5M) corresponde al decodificador, no al VLM; no debe confundirse con el tamano real del modelo de lenguaje.
- No se dispone de informacion sobre tool calling, agentes o razonamiento multi-paso.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Asher-1/WeVisOne-VL-GGML
- Repositorio GitHub del exportador: https://github.com/Asher-1/WeVisOne-VL-GGML
- Pagina oficial del proyecto WeVisOne-VL (Tencent): https://tencent.github.io/WeVisOne-VL/
- Model card detallada (MODEL_CARD.md): https://github.com/Tencent/WeVisOne-VL-GGML/blob/main/cpp_ggml/models/MODEL_CARD.md
- Modelo original 2B: https://huggingface.co/tencent/WeVisOne-VL-2B
- Modelo original 4B: https://huggingface.co/tencent/WeVisOne-VL-4B
- llama.cpp: https://github.com/ggerganov/llama.cpp
