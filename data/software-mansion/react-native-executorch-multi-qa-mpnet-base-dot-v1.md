# software-mansion/react-native-executorch-multi-qa-mpnet-base-dot-v1

## Resumen

`react-native-executorch-multi-qa-mpnet-base-dot-v1` es un paquete de pesos del modelo de embeddings `multi-qa-mpnet-base-dot-v1` exportado a programas ExecuTorch `.pte` por Software Mansion para su uso en la librería React Native ExecuTorch. El modelo original es un sentence-transformer basado en MPNet (arquitectura transformer de tipo masked language model), orientado a similitud semántica y recuperación de pasajes en un contexto de pregunta-respuesta. Su función no es generar texto, sino producir embeddings densos que permitan calcular similitud coseno o producto escalar entre consultas y documentos.

La relevancia de este repositorio es de despliegue, no de investigación: ofrece variantes compiladas para los backends Vulkan y XNNPACK con cuantizaciones fp16, fp32, int8 y 8da4w, lo que permite ejecutar inferencia completamente en dispositivo (móvil o edge) sin depender de un servidor. El tamaño del repositorio (3,2 GB) refleja que incluye múltiples artefactos para distintas combinaciones de backend y precisión.

No se especifican parámetros totales, longitud de contexto ni idiomas en la información proporcionada; se trata de una exportación de un modelo upstream cuya model card original no está incluida en los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MPNet (encoder, sentence-transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, int8, 8da4w (int4 con grupo 32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (programas compilados) |

## Arquitectura y entrenamiento

El modelo upstream `multi-qa-mpnet-base-dot-v1` es un sentence-transformer construido sobre MPNet, un encoder transformer que combina elementos de enmascaramiento de BERT y de permutación de XLNet. Está entrenado para producir embeddings de frases y pasajes optimizados para búsqueda semántica con similitud por producto escalar, y se emplea habitualmente en tareas de question answering y recuperación de pasajes.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden a la model card original del modelo upstream, que no se incluye en los materiales proporcionados. La innovación técnica de este repositorio es la exportación a ExecuTorch v1.4.1 con soporte para dos backends (Vulkan y XNNPACK) y varias precisiones, incluyendo una variante 8da4w (activaciones int8 dinámicas y pesos int4 con grupo 32) sobre las capas Linear y una tabla de embeddings de palabras en int8.

## Capacidades

- Generación de embeddings densos de frases y pasajes para similitud semántica.
- Recuperación de pasajes (passage retrieval) mediante producto escalar o similitud coseno.
- Búsqueda semántica sobre corpus documentales preindexados.
- Ejecución en dispositivo (on-device) en entornos React Native mediante ExecuTorch.
- Soporte de múltiples backends de aceleración: Vulkan (GPU) y XNNPACK (CPU).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente de embeddings.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles: indexar documentos o notas del usuario y recuperar los fragmentos más relevantes para una consulta sin enviar datos a un servidor, usando la variante XNNPACK int8 (105 MB) o 8da4w (69,1 MB).
- Preguntas sobre documentación local: embeber una base de conocimiento y responder consultas mediante recuperación de pasajes, aprovechando que el modelo está optimizado para QA con producto escalar.
- Clasificación y agrupamiento de textos: calcular embeddings de mensajes o tickets y agrupar por similitud para enrutamiento automático o deduplicación.
- Detección de duplicados y near-duplicates: comparar embeddings de registros para identificar contenido repetido en bases de datos locales.
- Recomendación de contenido: embeber ítems y perfiles de usuario para generar recomendaciones por similitud semántica en el dispositivo.
- Asistentes de búsqueda offline: integrar en apps React Native que operan sin conectividad, usando la variante Vulkan fp16 (208 MB) cuando hay GPU disponible y XNNPACK como fallback.
- Filtrado previo en pipelines RAG: reducir candidatos localmente antes de enviar solo los pasajes más relevantes a un modelo generativo remoto, ahorrando ancho de banda y coste.

## Benchmarks y rendimiento

Resultados publicados en la model card para recuperación de pasajes en SQuAD v1.1 dev (2000 preguntas contra sus 315 párrafos), con producto escalar:

| Variante | top-1 | MRR |
|---|---|---|
| fp32 | 64,60 | 0,7645 |
| int8 | 65,00 | 0,7671 |
| 8da4w | 63,80 | 0,7578 |

La cuantización int8 iguala o supera ligeramente a fp32 en esta evaluación, mientras que 8da4w pierde aproximadamente 0,8 puntos de top-1 y 0,007 de MRR. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; el modelo está pensado para ejecución en dispositivo. Los tamaños de los artefactos son: 416 MB (XNNPACK fp32), 208 MB (Vulkan fp16), 127 MB (Vulkan int8), 105 MB (XNNPACK int8) y 69,1 MB (XNNPACK 8da4w).
- GPU recomendadas: cualquier GPU móvil o integrada compatible con Vulkan para las variantes Vulkan; las variantes XNNPACK funcionan en CPU.
- Cabe en GPU de consumo: sí, todas las variantes caben holgadamente en cualquier GPU consumer moderna (RTX 4090, RTX 3060, etc.), aunque el objetivo real es hardware móvil.
- Opciones de despliegue: runtime ExecuTorch v1.4.1, integrado mediante la librería React Native ExecuTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con el formato `.pte`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| multi-qa-mpnet-base-dot-v1 (este repo) | Sentence-transformer MPNet, embeddings | no disponible | no disponible | apache-2.0 | ExecuTorch `.pte`, on-device |
| multi-qa-mpnet-base-dot-v1 (upstream) | Sentence-transformer MPNet, embeddings | no disponible | no disponible | apache-2.0 | PyTorch/safetensors, servidor |
| Otros sentence-transformers comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo upstream: este repositorio ofrece el mismo modelo en formato ExecuTorch para inferencia on-device, con cuantizaciones que reducen el tamaño hasta 69,1 MB (8da4w) frente a los 416 MB de la variante fp32, a costa de una pérdida mínima de calidad en recuperación de pasajes. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo produce embeddings; no genera texto ni admite instrucciones, tool calling ni razonamiento.
- Riesgo de alucinación no aplica directamente, pero la recuperación puede devolver pasajes irrelevantes si el corpus o las consultas están fuera de dominio.
- Compatibilidad estricta con ExecuTorch v1.4.1: el runtime no garantiza compatibilidad hacia adelante, por lo que versiones más antiguas pueden fallar al cargar los `.pte`.
- Idiomas soportados no especificados; el comportamiento multilingüe no está garantizado por la información disponible.
- La variante 8da4w presenta una degradación medible (top-1 63,80 frente a 64,60 en fp32) que debe evaluarse en el dominio concreto de uso.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo upstream y de los datasets de entrenamiento originales.
- El repositorio ocupa 3,2 GB por incluir todas las variantes; en producción conviene descargar solo el artefacto necesario.
- No se han publicado datos sobre sesgos del modelo en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/software-mansion/react-native-executorch-multi-qa-mpnet-base-dot-v1
- Modelo upstream: https://huggingface.co/sentence-transformers/multi-qa-mpnet-base-dot-v1/tree/main
- Librería React Native ExecuTorch (npm): https://www.npmjs.com/package/react-native-executorch
- Documentación de descarga de modelos: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/downloading-models
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/main/runtime/COMPATIBILITY.md
