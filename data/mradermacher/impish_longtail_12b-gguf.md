# mradermacher/Impish_Longtail_12B-GGUF

## Resumen

Impish_Longtail_12B-GGUF es la versión cuantizada en formato GGUF del modelo base SicariusSicariiStuff/Impish_Longtail_12B, un modelo conversacional de 12.247.782.400 parámetros (~12,25B) publicado en inglés y con licencia Apache 2.0. La cuantización ha sido realizada por mradermacher, un conocido publicador de pesos GGUF para llama.cpp y entornos compatibles con endpoints, con el objetivo de facilitar el despliegue en hardware de consumo y servidores modestos.

El modelo base está etiquetado como conversational y fue entrenado o ajustado sobre el dataset SicariusSicariiStuff/UBW_Tapestries. Se desconoce la arquitectura exacta y los detalles de entrenamiento a partir de la información disponible; lo que sí se sabe es que se trata de un transformer denso (no MoE, dado que no se indican parámetros activos distintos de los totales) con aproximadamente 12,25B parámetros.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 12B en GPUs de consumo mediante cuantizaciones de 4,9 GB (Q2_K) hasta 13,1 GB (Q8_0), con opciones intermedias recomendadas como Q4_K_M (7,6 GB) que equilibran tamaño y calidad. Está pensado para experimentación e inferencia local en inglés, no para despliegues multilingües ni para tareas que requieran contexto muy largo, ya que no se documenta la longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles no disponibles) |
| Parámetros totales | 12.247.782.400 (~12,25B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (y variantes imatrix i1 en repo separado) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo original en safetensors/transformers) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base más allá de que se trata de un transformer denso de ~12,25B parámetros, publicado bajo la librería transformers y etiquetado como conversational. No se documenta si emplea atención lineal, decodificación especulativa, GQA/MQA ni otras innovaciones técnicas.

El dataset de entrenamiento o ajuste citado es SicariusSicariiStuff/UBW_Tapestries, pero no se especifica el número de tokens, la composición del corpus ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se indica la ventana de contexto nativa ni la estrategia de entrenamiento multilingüe (el modelo figura solo en inglés). Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno (el modelo base está etiquetado como conversational).
- Razonamiento general y respuesta a instrucciones, siempre que se haya heredado del modelo base (no verificado de forma independiente).
- No se documenta soporte explícito de tool calling o function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso más allá de lo que pueda emerger del ajuste conversacional.
- Capacidades multilingües limitadas al inglés según los metadatos (language: en).
- No se documentan capacidades de visión, audio ni modo thinking explícito.
- Compatible con endpoints (tag endpoints_compatible), lo que sugiere uso vía APIs de inferencia tipo TGI/vLLM/llama.cpp server.

## Casos de uso

- Asistente conversacional local en inglés: desplegar el modelo con llama.cpp u Ollama usando Q4_K_M (7,6 GB) para mantener diálogos multi-turno en estaciones de trabajo con una única GPU de 12-16 GB de VRAM.
- Prototipado rápido de chatbots: gracias a las cuantizaciones pequeñas (Q2_K de 4,9 GB o Q3_K_S de 5,6 GB) se puede iterar en portátiles con GPU de 6-8 GB antes de decidir si merece la pena escalar a pesos de mayor calidad.
- Evaluación comparativa de ajustes comunitarios: útil para investigadores que quieran probar variantes conversacionales de 12B sin depender de infraestructura cloud, comparando Q4_K_S frente a Q6_K para medir el impacto de la cuantización en la calidad de respuesta.
- Generación de texto offline y privada: al ejecutarse en local con llama.cpp, permite procesar prompts sensibles sin enviarlos a servicios externos, con la licencia Apache 2.0 facilitando el uso interno.
- Integración en pipelines de CI para pruebas de regresión de prompts: usar Q4_K_M como modelo de referencia barato para validar plantillas de prompt y formatos de salida antes de pasar a modelos mayores.
- Experimentación docente: por su tamaño moderado y disponibilidad de múltiples quant types, es adecuado para demostrar el efecto de la cuantización en perplexity y calidad de generación en cursos de IA aplicada.
- Base para fine-tuning ligero posterior: aunque el repo es GGUF, el modelo base original en safetensors puede servir como punto de partida para LoRA en inglés, con la ventaja de que los pesos están publicados bajo Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de quant y overhead de contexto/KV cache):
  - Q2_K: ~4,9 GB de pesos; ~6-7 GB con contexto moderado.
  - Q3_K_S: ~5,6 GB; ~7-8 GB con contexto moderado.
  - Q3_K_M: ~6,2 GB; ~7,5-8,5 GB.
  - Q3_K_L: ~6,7 GB; ~8-9 GB.
  - IQ4_XS: ~6,9 GB; ~8,5-9,5 GB.
  - Q4_K_S: ~7,2 GB; ~8,5-9,5 GB.
  - Q4_K_M: ~7,6 GB; ~9-10 GB.
  - Q5_K_S: ~8,6 GB; ~10-11 GB.
  - Q5_K_M: ~8,8 GB; ~10,5-11,5 GB.
  - Q6_K: ~10,2 GB; ~12-13 GB.
  - Q8_0: ~13,1 GB; ~15-16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 24 GB, A100 40/80 GB, H100 80 GB. Para Q6_K y Q8_0 convienen GPUs de 16 GB o más.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 8-12 GB; Q5 y Q6 requieren 12-16 GB; Q8_0 requiere ~16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con endpoints (TGI/vLLM con soporte GGUF limitado; lo más habitual es llama.cpp server). Para imatrix i1, repo separado: mradermacher/Impish_Longtail_12B-i1-GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la GPU, del quant y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Impish_Longtail_12B-GGUF (este) | ~12,25B | No disponible | Apache 2.0 | GGUF | Hugging Face (mradermacher) |
| Mistral Nemo Instruct 2407 (referencia de categoría) | ~12,2B | 128k (según model card pública) | Apache 2.0 | safetensors, GGUF | Hugging Face (Mistral AI) |
| Gemma 2 12B Instruct (referencia de categoría) | ~12B | 8k (según model card pública) | Gemma Terms | safetensors, GGUF | Hugging Face (Google) |

Nota: los datos de Mistral Nemo y Gemma 2 se incluyen como referencia de categoría; no se dispone de comparación de rendimiento con este modelo en la información proporcionada. Los datos de contexto de terceros deben verificarse en sus model cards oficiales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste comunitario sobre un dataset específico (UBW_Tapestries) puede heredar sesgos de dicho corpus.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Limitaciones de contexto e idioma: solo inglés declarado; la longitud de contexto no está documentada, por lo que no debe asumirse una ventana amplia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base original y del dataset UBW_Tapestries por posibles restricciones adicionales.
- Caveat de cuantización: las cuantizaciones Q2_K y Q3_K_M reducen calidad; el propio autor marca Q3_K_M como "lower quality". Para producción se recomienda Q4_K_M o superior.
- Caveat de formato: este repo solo contiene GGUF; para fine-tuning o uso en transformers hay que acudir al modelo base SicariusSicariiStuff/Impish_Longtail_12B.
- Falta de información: no hay datos sobre arquitectura fina, datos de entrenamiento, benchmarks ni latencia; cualquier decisión de producción debe basarse en evaluación propia.

## Enlaces

- Repo GGUF: https://huggingface.co/mradermacher/Impish_Longtail_12B-GGUF
- Modelo base: https://huggingface.co/SicariusSicariiStuff/Impish_Longtail_12B
- Variantes imatrix i1: https://huggingface.co/mradermacher/Impish_Longtail_12B-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#Impish_Longtail_12B-GGUF
- Dataset citado: https://huggingface.co/datasets/SicariusSicariiStuff/UBW_Tapestries
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de comparación de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre quants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ / peticiones de modelo: https://huggingface.co/mradermacher/model_requests
