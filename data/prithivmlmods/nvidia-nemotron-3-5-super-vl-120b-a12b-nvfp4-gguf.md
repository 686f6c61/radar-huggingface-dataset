# prithivMLmods/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-GGUF es una cuantización en formato GGUF, realizada por el usuario prithivMLmods con llama.cpp, del modelo vision-language NVIDIA Nemotron 3.5 Super VL de NVIDIA. El modelo base (NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16) combina 120B de parámetros totales con 12B activos mediante una arquitectura MoE híbrida, y está diseñado para razonamiento, código, uso de herramientas, comprensión de documentos y análisis de vídeo con un contexto de hasta 1M de tokens.

La relevancia de esta versión concretamente radica en dos aspectos: la cuantización NVFP4, optimizada para aceleradores de última generación como las GPU NVIDIA Blackwell, y la integración de Multi-Token Prediction (MTP) directamente en los pesos GGUF, que permite decodificación especulativa sin necesidad de un modelo draft separado. En pruebas publicadas por el autor sobre una RTX PRO 6000 Blackwell de 96 GB, el modelo alcanza 135,42 tokens/s de generación, lo que lo hace viable para despliegue local de alto rendimiento en estaciones de trabajo profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron H MoE híbrido (Mamba-2 + MoE + capas de atención) con codificador de visión C-RADIO |
| Parametros totales | 123.611.117.220 (~120B) |
| Parametros activos | ~12B (MoE) |
| Longitud de contexto | Hasta 1M de tokens (modelo base); 16.384 tokens en la prueba de rendimiento publicada |
| Tipos de cuantizacion | NVFP4 (78,7 GB) + archivo mmproj para visión (1,73 GB) |
| Idiomas soportados | Inglés, español, francés, alemán, italiano, japonés |
| Licencia | OpenMDW-1.1 (openmdw-1.1) |
| Formato de pesos | GGUF (cuantizado con llama.cpp); el modelo base está en BF16/safetensors |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina capas Mamba-2 (modelos de espacio de estados), capas MoE y capas de atención estándar, bajo el esquema `nemotron_h_moe`. Esta combinación permite procesar contextos muy largos (hasta 1M de tokens) con un coste computacional contenido, ya que solo 12B de los 120B parámetros totales se activan por token. La parte visual se apoya en un codificador de visión C-RADIO, habilitando la pipeline image-text-to-text (imagen-texto a texto).

Una innovación destacable es la Multi-Token Prediction (MTP) nativa: los pesos incluyen cabezas de salida adicionales que predicen varios tokens futuros en una sola pasada hacia adelante, lo que permite decodificación especulativa integrada (sin modelo draft externo). En llama.cpp se activa con `--spec-type draft-mtp` y `--spec-draft-n-max 2`. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset en la información disponible.

## Capacidades

- Generación de texto conversacional con razonamiento (pipeline image-text-to-text, etiquetado como conversational)
- Comprensión de imágenes y documentos: procesa entradas imagen-texto gracias al codificador C-RADIO y al archivo mmproj incluido
- Análisis de vídeo, según la descripción del modelo base
- Generación y razonamiento sobre código: LiveCodeBench v6 (88,22), SWE-bench Verified (71,10)
- Uso de herramientas (tool use), según la descripción del modelo base; no se detalla soporte específico de function calling en la información disponible
- Razonamiento científico de alto nivel: GPQA-Diamond (89,52)
- Tareas agénticas y de terminal: SWE-bench Pro (51,78), Terminal-Bench 2.1 (60,67)
- Búsqueda y navegación sobre contextos largos: lidera el benchmark GraphWalks (89,71)
- Multilingüe: inglés, español, francés, alemán, italiano y japonés
- Decodificación especulativa nativa vía MTP para inferencia acelerada local

## Casos de uso

- Comprensión de documentos empresariales: con el codificador de visión C-RADIO y contexto de hasta 1M de tokens, puede analizar contratos, informes PDF escaneados o documentación técnica extensa combinando texto e imágenes en una sola sesión.
- Asistentes de código con contexto de repositorio: sus resultados en SWE-bench Verified (71,10) y LiveCodeBench v6 (88,22) lo hacen adecuado para pipelines de revisión de código, generación de parches y resolución de issues sobre bases de código grandes.
- Agentes de terminal y automatización DevOps: con 60,67 en Terminal-Bench 2.1, puede integrarse en flujos de trabajo agénticos que ejecutan comandos, diagnostican errores y realizan tareas multi-paso en entornos de línea de órdenes.
- Chatbots multilingües de alta calidad: soporte nativo de español, francés, alemán, italiano, japonés e inglés con solo 12B de parámetros activos, lo que reduce el coste por token en despliegues de atención al cliente con conversaciones multi-turno.
- Análisis de vídeo y vigilancia inteligente: la capacidad de análisis de vídeo del modelo base permite resumir grabaciones, extraer eventos y responder preguntas sobre contenido audiovisual.
- Investigación y evaluación full-precision: al existir la variante BF16 completa bajo OpenMDW-1.1, es útil para personalización de dominio, fine-tuning y evaluación comparativa en entornos de investigación.
- RAG sobre corpus muy extensos: el contexto de 1M de tokens y su liderazgo en GraphWalks (89,71) lo hacen idóneo para navegación de grafos de conocimiento y recuperación sobre documentos interconectados.

## Benchmarks y rendimiento

Resultados publicados del modelo base NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16:

| Benchmark | Puntuación |
|---|---|
| GPQA-Diamond | 89,52 |
| LiveCodeBench v6 | 88,22 |
| SWE-bench Verified | 71,10 |
| SWE-bench Pro | 51,78 |
| Terminal-Bench 2.1 | 60,67 |
| GraphWalks | 89,71 (líder) |

Rendimiento de inferencia de la variante NVFP4 GGUF (medido por el autor del repo):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento del prompt | 108,94 tokens/s |
| Velocidad media de generación | 135,42 tokens/s |
| Tiempo total de ejecución | 104,7 segundos |
| Contexto usado en la prueba | 16.384 tokens |
| Pico de VRAM en GPU | 73,96 GiB |
| GPU | NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) |
| Capas en GPU | 99 (`-ngl 99`) |
| Decodificación especulativa | MTP (`draft_n_max=2`) |

Según la model card, el modelo destaca en GraphWalks pero queda por detrás de algunos competidores en benchmarks de código agéntico y visión. No se han publicado comparativas numéricas detalladas frente a modelos concretos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo NVFP4 GGUF ocupa 78,7 GB (más 1,73 GB del mmproj); el pico medido de VRAM fue de 73,96 GiB con contexto de 16.384 tokens y caché K en q8_0.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB), donde se ha validado oficialmente. La cuantización NVFP4 está optimizada para hardware NVIDIA Blackwell (SM120 / GB202); en arquitecturas anteriores el rendimiento puede degradarse o no estar soportado.
- Consumer GPU: no cabe en GPUs de consumo habituales (una RTX 4090 con 24 GB o una RTX 5090 con 32 GB son insuficientes incluso con offload parcial realista; se necesitarían múltiples GPUs de gama alta o configuraciones multi-GPU con offload a CPU, con pérdida sustancial de velocidad).
- Opciones de despliegue: llama.cpp / llama-cli (instrucciones oficiales incluidas en la model card, con `--spec-type draft-mtp`), Ollama (al ser GGUF, sujeto a soporte de la arquitectura nemotron_h_moe), y la variante base BF16/NVFP4 de NVIDIA mediante transformers y text-generation-inference. No se menciona soporte verificado en vLLM para esta cuantización GGUF.
- Latencia y throughput: 135,42 tokens/s de generación y 108,94 tokens/s de procesamiento de prompt en la configuración de prueba descrita; los resultados reales variarán según prompt, build y ajustes del runtime.

## Comparativa con modelos similares

| Modelo | Parametros totales/activos | Contexto | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA Nemotron 3.5 Super VL 120B-A12B (esta ficha) | 120B / 12B | Hasta 1M tokens | Sí (C-RADIO) | OpenMDW-1.1 | GGUF NVFP4 (78,7 GB) y BF16 en Hugging Face |
| Qwen3-VL 235B-A22B (referencia de categoría) | 235B / 22B | no disponible | Sí | Apache-2.0 | safetensors y GGUF comunitarios |
| Llama 4 Scout (referencia de categoría) | 109B / 17B | no disponible | Sí | Llama 4 Community License | safetensors y GGUF comunitarios |

No se han publicado en la información disponible benchmarks comparativos directos contra estos modelos; la model card solo indica que Nemotron 3.5 Super VL queda por detrás de algunos competidores en código agéntico y visión, y que lidera en GraphWalks. La ventaja diferencial frente a alternativas de tamaño similar es la MTP nativa para decodificación especulativa y la cuantización NVFP4 para hardware Blackwell.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan auditorías de sesgo en la información proporcionada.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo de gran tamaño, puede alucinar, especialmente en tareas de razonamiento agéntico donde la model card reconoce rendimientos por debajo de competidores (SWE-bench Pro 51,78).
- Limitaciones de contexto: aunque el modelo base soporta hasta 1M de tokens, la prueba de rendimiento publicada usa solo 16.384 tokens; operar con contextos muy largos incrementará sustancialmente el requisito de VRAM (KV cache).
- Idioma: soporte documentado para seis idiomas (en, es, fr, de, it, ja); el rendimiento en español no está cuantificado con benchmarks específicos.
- Licencia: OpenMDW-1.1 es una licencia abierta distinta de Apache-2.0 o MIT; conviene revisar sus términos exactos (https://openmdw.ai/license/1-1/) antes de uso comercial.
- Hardware: la cuantización NVFP4 está orientada a GPUs Blackwell (SM120/GB202); en hardware más antiguo puede no ser compatible o rendir mal, lo que limita la audiencia práctica de esta variante GGUF.
- El repo es una cuantización de terceros (prithivMLmods), no un lanzamiento oficial de NVIDIA; los resultados de rendimiento dependen de la configuración específica descrita y no están verificados por NVIDIA.
- Descargas y adopción aún bajas (764 descargas, 1 like en el momento de la ficha), por lo que el soporte comunitario y la madurez de la cuantización son limitados.

## Enlaces

- Ficha en Hugging Face (cuantización GGUF NVFP4): https://huggingface.co/prithivMLmods/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-GGUF
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Archivo principal del modelo: https://huggingface.co/prithivMLmods/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-GGUF/blob/main/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4.gguf
- Archivo multimodal (mmproj): https://huggingface.co/prithivMLmods/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-GGUF/blob/main/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4.mmproj.gguf
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor de la cuantización: https://huggingface.co/prithivMLmods
