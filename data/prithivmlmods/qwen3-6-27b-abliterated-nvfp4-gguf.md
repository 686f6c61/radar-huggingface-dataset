# prithivMLmods/Qwen3.6-27B-abliterated-NVFP4-GGUF

## Resumen

Qwen3.6-27B-abliterated-NVFP4-GGUF es una cuantización NVFP4 en formato GGUF del modelo Qwen3.6-27B de Alibaba, en su variante "abliterated" publicada por huihui-ai. La cuantización y empaquetado han sido realizados por el usuario prithivMLmods usando llama.cpp. El modelo base es un modelo denso de 27.320.698.368 parámetros, multimodal (image-text-to-text), con un codificador de visión integrado, 64 capas y una ventana de contexto nativa de 262K tokens ampliable a más de 1M mediante YaRN.

La variante abliterated elimina los mecanismos de rechazo del modelo original, permitiendo respuestas sin las típicas negativas ante solicitudes sensibles, lo que la hace popular para uso local sin restricciones de alineamiento. El formato NVFP4 está optimizado específicamente para los Tensor Cores FP4 de la arquitectura NVIDIA Blackwell (RTX Pro 6000, serie RTX 50, B200, B300), y el archivo integra Multi-Token Prediction (MTP), una forma de decodificación especulativa que incorpora cabezas de predicción de múltiples tokens directamente en los pesos, acelerando la inferencia local sin necesidad de un modelo draft separado.

Es relevante ahora porque combina tres tendencias actuales: cuantización FP4 nativa en hardware Blackwell, inferencia multimodal local con llama.cpp y modelos abliterated para despliegues sin filtros, todo bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con codificador de visión integrado (64 capas) |
| Parametros totales | 27.320.698.368 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262K nativa, ampliable a 1M+ con YaRN (probado en GGUF con 16.384 tokens) |
| Tipos de cuantizacion | NVFP4 (con proyector multimodal mmproj aparte); KV cache probado en q8_0 |
| Idiomas soportados | Inglés (etiquetado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (NVFP4) + GGUF mmproj para visión |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer denso de 27B parámetros con 64 capas y un codificador de visión integrado, lo que le permite procesar entradas de imagen y texto de forma conjunta (pipeline image-text-to-text). Soporta modos de pensamiento híbridos (hybrid thinking) que preservan el razonamiento a lo largo de flujos de trabajo multi-turno. No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset en la documentación proporcionada.

La innovación principal de esta versión cuantizada es el formato MTP GGUF: en lugar de depender de un modelo draft externo para la decodificación especulativa, los pesos incluyen cabezas de salida adicionales que predicen varios tokens futuros en una sola pasada hacia adelante (probado con `draft_n_max=2`). La cuantización NVFP4 aprovecha los Tensor Cores FP4 nativos de NVIDIA Blackwell (SM120, GB202), y el proceso se realizó con llama.cpp sobre el modelo fuente huihui-ai/Huihui-Qwen3.6-27B-abliterated, que a su vez deriva de Qwen/Qwen3.6-27B mediante una técnica de abliteración que suprime los comportamientos de rechazo.

## Capacidades

- Generación de texto conversacional sin filtros de rechazo (variante abliterated)
- Comprensión y análisis de imágenes: OCR, descripción visual y tareas image-text-to-text mediante el proyector mmproj
- Razonamiento a nivel de repositorio y capacidades agénticas de código (según la model card del modelo base: 77,2 en SWE-bench Verified, 59,3 en Terminal-Bench)
- Desarrollo frontend y razonamiento sobre código
- Tool calling / function calling (66,1% en BFCL-V4 en el modelo base)
- Razonamiento científico (87,8 en GPQA-Diamond en el modelo base)
- Modos de pensamiento híbridos para razonamiento multi-turno
- Decodificación especulativa integrada vía MTP para inferencia local acelerada
- Contexto muy largo (262K nativo, 1M+ con YaRN)

## Casos de uso

- OCR y extracción de datos de documentos: el modelo procesa imágenes con el proyector mmproj y extrae texto con una generación medida de ~101 tokens/s en hardware Blackwell, adecuado para digitalización de facturas, contratos o formularios escaneados.
- Asistentes locales sin restricciones: la variante abliterated permite desplegar chatbots en entornos donde se desea control total del comportamiento del modelo sin los rechazos por defecto, por ejemplo en investigación sobre alineamiento o aplicaciones creativas.
- Agentes de código con contexto de repositorio: con 262K tokens de contexto nativo, puede analizar repositorios completos y ejecutar flujos agénticos de refactorización o revisión de código.
- Análisis multimodal de imágenes médicas, técnicas o de vigilancia: la combinación de visión integrada y razonamiento fuerte permite pipelines de descripción y clasificación visual en local, sin enviar datos a terceros.
- Generación de interfaces frontend: el modelo base destaca en desarrollo frontend, útil para asistentes que generan componentes y páginas a partir de capturas o especificaciones.
- Inferencia de alto rendimiento en estaciones de trabajo Blackwell: con solo ~27 GiB de VRAM pico, cabe en una RTX Pro 6000 de 96 GB con margen para contextos grandes y batching.
- Tool calling en pipelines de automatización: con 66,1% en BFCL-V4, es apto para orquestación de funciones y flujos multi-paso con APIs externas.

## Benchmarks y rendimiento

Benchmarks publicados para el modelo base Qwen3.6-27B (según la model card del cuantizador; no medidos sobre esta cuantización):

| Benchmark | Qwen3.6-27B | Referencia: Qwen3.5-397B-A17B |
|---|---:|---:|
| SWE-bench Verified | 77,2 | inferior (según la model card) |
| Terminal-Bench | 59,3 | inferior (según la model card) |
| SkillsBench | 48,2 | inferior (según la model card) |
| GPQA-Diamond | 87,8 | no disponible |
| BFCL-V4 (tool calling) | 66,1% | no disponible |

Rendimiento medido de la cuantización NVFP4 (RTX Pro 6000 Blackwell, 96 GB, llama-cli, MTP, contexto 16.384):

| Metrica | Resultado |
|---|---:|
| Procesamiento de prompt (media) | 1.157,93 tokens/s |
| Generación (media) | 101,08 tokens/s |
| VRAM pico | 27.661 MiB (~27,01 GiB) |
| Utilización GPU pico | 96% |
| Capas offload | 99 (-ngl 99) |

## Requisitos de hardware

- VRAM estimada para inferencia: ~27,6 GiB pico medidos con el archivo NVFP4 (27,6 GB) más 931 MB del mmproj, con contexto de 16.384 tokens y KV cache q8_0; añadir margen para contextos mayores.
- GPU recomendadas: NVIDIA RTX Pro 6000 Blackwell (96 GB) es la configuración probada; también B200 y B300. La cuantización NVFP4 está optimizada para Tensor Cores FP4 de Blackwell (serie RTX 50 incluida).
- Consumer GPUs: no cabe en una RTX 4090 de 24 GB (el archivo pesa 27,6 GB); podría aproximarse en una RTX 5090 de 32 GB con offload parcial a CPU, con penalización de rendimiento. En GPUs sin soporte FP4 nativo (Ampere/Hopper consumer), el rendimiento y la compatibilidad pueden verse degradados; no se han publicado pruebas.
- Opciones de despliegue: llama.cpp / llama-cli (probado, con soporte MTP y mmproj), Ollama (compatible con GGUF); vLLM, SGLang y Unsloth son compatibles con el modelo base según la model card, pero no se ha verificado esta cuantización NVFP4 en ellos.
- Latencia y throughput: ~101 tokens/s de generación y ~1.158 tokens/s de procesamiento de prompt en la configuración probada; ~19 s por imagen en tareas de OCR.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-abliterated-NVFP4 (este) | 27,3B denso | 262K (1M+ YaRN) | Sí (visión) | Apache 2.0 | NVFP4 para Blackwell, MTP integrado, sin filtros |
| Qwen/Qwen3.6-27B (base) | 27,3B denso | 262K (1M+ YaRN) | Sí | Apache 2.0 | Con alineamiento original, pesos sin cuantizar |
| huihui-ai/Huihui-Qwen3.6-27B-abliterated | 27,3B denso | 262K (1M+ YaRN) | Sí | Apache 2.0 | Abliterated, sin cuantizar NVFP4 |
| Qwen3.5-397B-A17B | 397B (MoE, ~17B activos) | no disponible | no disponible | no disponible | Flagship anterior; superado por Qwen3.6-27B en SWE-bench, Terminal-Bench y SkillsBench |

## Limitaciones y advertencias

- Al ser una variante abliterated, el modelo carece de salvaguardas de seguridad: puede generar contenido dañino, ilegal o inapropiado ante solicitudes que el modelo original rechazaría. Su uso conlleva responsabilidad legal y ética plena por parte del operador.
- Riesgo de alucinación inherente a los LLM, agravado por la ausencia de mecanismos de rechazo calibrados; no se han publicado evaluaciones de alucinación para esta variante.
- Etiquetado solo en inglés; el rendimiento en castellano u otros idiomas no está documentado en la información disponible.
- La cuantización NVFP4 implica pérdida de precisión frente a los pesos originales; no se han publicado evaluaciones de degradación para esta cuantización concreta.
- El formato NVFP4 está orientado a hardware Blackwell; en GPUs anteriores el soporte y rendimiento no están verificados.
- La abliteración se aplicó al modelo fuente huihui-ai, no al original de Alibaba; posibles efectos colaterales en calidad de razonamiento no documentados.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base pertenece a Alibaba y conviene revisar cualquier término adicional del modelo original.
- El contexto probado en GGUF fue de 16.384 tokens; contextos de 262K o superiores requieren más VRAM para la KV cache y no han sido probados en esta cuantización.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/prithivMLmods/Qwen3.6-27B-abliterated-NVFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Modelo fuente (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.6-27B-abliterated
- Autor cuantizador: https://huggingface.co/prithivMLmods
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Archivo principal GGUF: https://huggingface.co/prithivMLmods/Qwen3.6-27B-abliterated-NVFP4-GGUF/blob/main/Qwen3.6-27B-abliterated-NVFP4.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/Qwen3.6-27B-abliterated-NVFP4-GGUF/blob/main/Qwen3.6-27B-abliterated-NVFP4.mmproj.gguf
