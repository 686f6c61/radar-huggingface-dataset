# open-zzrl/Zenotron-Mini-0.5-Multilingual-MXFP4xFP8

## Resumen

Zenotron-Mini-0.5-Multilingual-MXFP4xFP8 es un checkpoint cuantizado en precisión mixta del modelo Zenotron-Mini-0.5-Multilingual, publicado por Open Zeno-Zero Research Lab (open-zzrl). Se trata de una variante optimizada para inferencia con bajo consumo de memoria y alto rendimiento en GPUs de centro de datos modernas, en particular las basadas en arquitectura NVIDIA Blackwell. La cuantización se ha realizado con LLM Compressor y el formato compressed-tensors, aplicando cuantización selectiva a los expertos MoE mientras se preservan en precisión original las capas críticas de enrutamiento, embeddings y normas.

El modelo base declarado en la model card es Qwen3.6-35B-A3B, una arquitectura MoE con aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos. Sin embargo, el dato real de safetensors del repositorio indica 19.845.695.344 parámetros totales, cifra que no coincide con los 35B indicados en la model card; esta discrepancia debe tenerse en cuenta al planificar el despliegue. La longitud de contexto declarada es de 16.384 tokens y el entrenamiento posterior se realizó mediante LoRA completo en BF16.

La relevancia de esta ficha radica en su enfoque de cuantización mixta específica para MoE: los expertos enrutados se almacenan en MXFP4 (4 bits) con escalado dinámico de activaciones en FP8, las proyecciones densas en FP8_BLOCK, y el router, embeddings, normas, codificador de visión y MTP se mantienen en BF16. El modelo soporta ruso, inglés, francés y coreano, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (qwen3_5_moe) con atención lineal y codificador de visión |
| Parametros totales | 19.845.695.344 (dato real de safetensors); la model card declara 35B |
| Parametros activos | ~3B (según model card) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | MXFP4xFP8 en expertos MoE enrutados; FP8_BLOCK en proyecciones densas; BF16 en router, embeddings, normas, visión y MTP |
| Idiomas soportados | Ruso (ru), inglés (en), francés (fr), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (no GGUF) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura MoE con mezcla de expertos enrutados y expertos compartidos, e incorpora atención lineal además de auto-atención densa, así como un codificador de visión y un módulo MTP (multi-token prediction) que se mantienen sin cuantizar. El checkpoint es el resultado de un post-entrenamiento mediante LoRA completo en BF16 sobre el modelo base Qwen3.6-35B-A3B, seguido de una cuantización de precisión mixta con LLM Compressor y compressed-tensors. La innovación principal es la cuantización diferenciada por componente: los expertos enrutados, que concentran la mayor parte de los parámetros, se comprimen a MXFP4 con escalado FP8 dinámico, mientras que las capas sensibles a la precisión (router, embeddings, normas) se preservan en BF16 para no degradar el enrutamiento ni la estabilidad numérica.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la innovación de decodificación especulativa más allá de la mención al módulo MTP preservado en BF16.

## Capacidades

- Generación de texto y conversación multi-turno en ruso, inglés, francés y coreano.
- Razonamiento matemático y lógico, con soporte de modo de razonamiento interno (thinking mode) que puede desactivarse mediante `enable_thinking=False`.
- Capacidades multimodales por la presencia del codificador de visión preservado en BF16.
- Decodificación especulativa mediante el módulo MTP preservado.
- Capacidad multilingüe limitada a los cuatro idiomas declarados (ru, en, fr, ko).
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Razonamiento matemático multilingüe: el modelo muestra mejoras notables en Global-MGSM en los cuatro idiomas soportados, por lo que resulta adecuado para resolver problemas aritméticos y lógicos paso a paso en ruso, inglés, francés y coreano.
- Comprensión lectora multilingüe: con un rendimiento del 93,44% en Belebele, puede emplearse en sistemas de preguntas y respuestas sobre documentos en los idiomas soportados.
- Despliegue de alto rendimiento en GPUs Blackwell: gracias a la cuantización MXFP4 nativa en SM100+, es adecuado para servir inferencia con alto throughput en centros de datos con hardware de última generación.
- Servicio de chat conversacional con vLLM: la integración recomendada con vLLM permite exponer el modelo como API de generación de texto con detección automática del formato compressed-tensors.
- Procesamiento de documentos con contexto medio: con 16.384 tokens de ventana, puede gestionar conversaciones y documentos de extensión moderada en los cuatro idiomas.
- Investigación en cuantización de MoE: sirve como referencia práctica para estudiar el impacto de la cuantización mixta por componente en modelos de mezcla de expertos.
- Tareas multimodales básicas: la preservación del codificador de visión en BF16 permite abordar tareas de comprensión de imágenes, aunque no se detallan en la información disponible.

## Benchmarks y rendimiento

Los datos de la model card comparan el modelo base Qwen3.6-35B-A3B con Zenotron-Mini v0.5 en BF16 (no con el checkpoint cuantizado):

| Benchmark | Qwen3.6-35B-A3B | Zenotron-Mini v0.5 (BF16) | Delta |
|---|---|---|---|
| Belebele (comprensión lectora) | 92,56% | 93,44% | +0,89 p.p. |
| Global-MGSM (matemáticas/lógica) | 75,50% | 89,20% | +13,70 p.p. |

Rendimiento cross-lingual en Global-MGSM:

| Idioma | Qwen3.6-35B-A3B | Zenotron-Mini v0.5 | Delta |
|---|---|---|---|
| Ruso (RU) | 84,0% | 91,2% | +7,2% |
| Inglés (EN) | 87,6% | 97,2% | +9,6% |
| Francés (FR) | 62,0% | 83,2% | +21,2% |
| Coreano (KO) | 68,4% | 85,2% | +16,8% |

La model card afirma que las pruebas confirman que la cuantización de precisión mixta preserva el rendimiento del modelo BF16 original, pero no se publican cifras específicas del checkpoint MXFP4xFP8 frente a la versión BF16.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 23,2 GB en safetensors, por lo que se requiere al menos esa cantidad de memoria más overhead de activaciones y caché KV.
- GPU recomendadas: NVIDIA Blackwell (SM100+) para aceleración nativa de MXFP4.
- Compatibilidad: GPUs NVIDIA Ada Lovelace y Hopper ejecutan los componentes FP8_BLOCK de forma nativa y los expertos MXFP4 mediante emulación software.
- No se indica compatibilidad con GPUs de consumo (RTX 4090 u otras) más allá de la mención genérica a Ada Lovelace.
- Opciones de despliegue: vLLM (recomendado, detecta automáticamente compressed-tensors) y Hugging Face Transformers >= 4.45 con el paquete `compressed-tensors` instalado. No hay soporte GGUF, por lo que llama.cpp y Ollama no son opciones viables.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zenotron-Mini-0.5-Multilingual-MXFP4xFP8 | 19,8B reales (35B declarados), ~3B activos | 16.384 | Apache 2.0 | safetensors + compressed-tensors | Cuantización mixta MXFP4/FP8, 4 idiomas |
| Zenotron-Mini-0.5-Multilingual (BF16) | 35B declarados, ~3B activos | 16.384 | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Qwen3.6-35B-A3B | 35B, ~3B activos | no disponible | no disponible | no disponible | Modelo de referencia en los benchmarks |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Discrepancia entre los parámetros declarados en la model card (35B) y los reales del repositorio (19,8B), lo que puede afectar a la planificación de recursos.
- Dependencia de hardware Blackwell para obtener el rendimiento óptimo; en GPUs anteriores los expertos MXFP4 se ejecutan por emulación software.
- Requiere el runtime `compressed-tensors`; no es compatible con formatos GGUF ni con herramientas como llama.cpp u Ollama.
- Versión preview (v0.5) descrita como iteración experimental por el propio autor.
- Contexto limitado a 16.384 tokens, inferior al de muchos modelos actuales.
- Cobertura lingüística restringida a ruso, inglés, francés y coreano; no se declara soporte de español.
- No se documentan sesgos conocidos, riesgo de alucinación ni restricciones adicionales de licencia más allá de Apache 2.0.
- El repositorio registra 0 descargas y 1 like, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-zzrl/Zenotron-Mini-0.5-Multilingual-MXFP4xFP8
- Modelo base: https://huggingface.co/open-zzrl/Zenotron-Mini-0.5-Multilingual
- Organización Open Zeno-Zero Research Lab: https://huggingface.co/open-zzrl
