# alibaba-pai/SearchQwen2.5-7B

## Resumen

SearchQwen2.5-7B es un modelo de agente de búsqueda desarrollado por Alibaba PAI, post-entrenado a partir del modelo base Qwen/Qwen2.5-7B-Instruct. Está diseñado específicamente para tareas de búsqueda multi-hop y razonamiento profundo en entornos con herramientas estructuradas de tipo `search` y `browse`. Su objetivo principal es resolver el problema de la integración de evidencia a largo horizonte en agentes de búsqueda, donde los modelos generalistas suelen perder coherencia tras varias iteraciones de llamadas a herramientas.

El modelo fue entrenado mediante SFT sobre trayectorias ReAct verificadas generadas por el pipeline EasyDistill2, seguido de un post-entrenamiento consciente del proceso. Con 7.62 mil millones de parámetros, se posiciona como una alternativa ligera y de código abierto (licencia Apache 2.0) para construir agentes de búsqueda en producción, con soporte nativo para tool calling estructurado y una mejora significativa frente al modelo base en las evaluaciones LLM-judge publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7.62B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada; el modelo base Qwen2.5-7B-Instruct soporta 128K tokens |
| Tipos de cuantizacion | no disponibles (solo safetensors en el repo) |
| Idiomas soportados | no disponibles (hereda los del modelo base, no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SearchQwen2.5-7B parte de la arquitectura transformer decoder-only del modelo Qwen2.5-7B-Instruct, sin modificaciones estructurales en la capa de atención ni en el bloque de transformadores. El entrenamiento consistió en dos fases: primero, un ajuste fino supervisado (SFT) sobre trayectorias ReAct verificadas generadas con el pipeline EasyDistill2, que produce trayectorias de búsqueda multi-hop alineadas con el entorno; después, un post-entrenamiento consciente del proceso que refuerza la capacidad del modelo para integrar evidencia acumulada a lo largo de secuencias largas de interacción con herramientas.

No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se emplearon técnicas de RLHF o DPO. El modelo está diseñado para interacción estructurada mediante Tool-Call, aunque también se evaluó su funcionamiento con interacción de texto estilo Search-R1 para modelos Qwen2.5. El dataset complementario alojado en `alibaba-pai/SynSearch-Data` acompaña al modelo para reproducir los experimentos.

## Capacidades

- Búsqueda multi-hop estructurada: emite llamadas a herramientas `search` y `browse` de forma nativa, consumiendo las respuestas y produciendo la respuesta final.
- Tool calling / function calling: compatible con el formato de tool-call de Qwen2.5 y servible con la API OpenAI-compatible de vLLM.
- Razonamiento profundo (deep search): mejora notablemente en tareas de deep search respecto al modelo base, con un incremento de +8.98 puntos en la interacción Tool-Call estructurada.
- Integración de evidencia a largo horizonte: entrenado para mantener coherencia en secuencias largas de interacción con herramientas y múltiples pasos de búsqueda.
- Generalización cross-backbone: el método de entrenamiento se ha aplicado también a Qwen3-8B, mostrando transferibilidad de la técnica a otras arquitecturas.
- Multilingüe: no se han publicado datos específicos, pero hereda las capacidades del modelo base Qwen2.5-7B-Instruct.

## Casos de uso

- Agentes de atención al cliente con búsqueda en base de conocimiento: el modelo puede gestionar consultas complejas de clientes que requieren buscar en documentación técnica o FAQs, usando la herramienta `search` para recuperar información y respondiendo con contexto acumulado en múltiples pasos.
- Búsqueda profunda en documentos legales o científicos: para tareas de investigación donde se necesita localizar y cruzar referencias de múltiples fuentes, SearchQwen2.5-7B integra evidencia de varias búsquedas antes de sintetizar la respuesta final.
- Asistentes de investigación de mercado: permite consultar datos de múltiples fuentes web, comparar cifras y elaborar informes con citas, gracias a su capacidad de encadenar búsquedas y mantener el contexto.
- Generación de informes técnicos con verificación: en entornos empresariales donde la exactitud es crítica, el modelo puede buscar información actualizada y contrastar fuentes antes de emitir conclusiones.
- Chatbots de soporte técnico con tool calling: integrado en pipelines de vLLM o TGI, puede actuar como agente conversacional que decide cuándo invocar una búsqueda externa y cuándo responder directamente.
- Automatización de investigaciones académicas: para localizar papers, resumir hallazgos de múltiples fuentes y responder preguntas complejas de revisión bibliográfica, aprovechando el razonamiento multi-hop.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a evaluaciones con LLM-judge (precisión en porcentaje), no a benchmarks estándar como MMLU, HumanEval o GSM8K. Se presentan los datos disponibles:

| Interacción | Modelo | Multi-hop QA Avg. | Deep Search Avg. | Overall Avg. |
|---|---|---|---|---|
| Estilo texto Search-R1 | Qwen2.5-7B-Instruct (base) | 45.28 | 18.65 | 31.96 |
| Estilo texto Search-R1 | **SearchQwen2.5-7B** | **52.95** | **26.23** | **39.59** |
| Estilo texto Search-R1 | Qwen2.5-3B-Instruct (base) | 30.12 | 14.95 | 22.54 |
| Estilo texto Search-R1 | **SearchQwen2.5-3B** | **39.55** | **21.15** | **30.35** |
| Tool-Call estructurado | Qwen2.5-7B-Instruct (base) | 45.23 | 24.35 | 33.33 |
| Tool-Call estructurado | **SearchQwen2.5-7B** | **55.90** | **33.33** | **44.61** |
| Tool-Call estructurado | Qwen2.5-3B-Instruct (base) | 36.10 | 7.05 | 21.60 |
| Tool-Call estructurado | **SearchQwen2.5-3B** | **48.58** | **21.40** | **35.00** |

Generalización cross-backbone con Tool-Call estructurado:

| Modelo | Deep Search Avg. | Overall Avg. |
|---|---|---|
| Qwen3-8B (base) | 24.50 | 40.31 |
| **SearchQwen3-8B** | **35.42** | **50.31** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP16 requiere aproximadamente 15.2 GB de VRAM (tamaño del repo), por lo que cabe en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB). En cuantización 8-bit (si se aplica) podría reducirse a ~8 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: verificado en NVIDIA L20 (48 GB) para el despliegue completo. También compatible con A100, H100 y GPUs de consumo con al menos 24 GB para FP16.
- Opciones de despliegue: vLLM con API OpenAI-compatible (verificado), transformers con `device_map="auto"` para inferencia en una sola GPU o multi-GPU. Se puede integrar con Ollama o llama.cpp si se generan cuantizaciones GGUF (no disponibles oficialmente).
- Latencia y throughput: no se han publicado métricas de latencia o throughput en la información disponible. La verificación de despliegue se realizó en una NVIDIA L20 con vLLM, sin datos de rendimiento cuantitativos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| **SearchQwen2.5-7B** | 7.62B | no especificado (base 128K) | Apache 2.0 | Agente de búsqueda multi-hop | HuggingFace |
| Qwen2.5-7B-Instruct (base) | 7.62B | 128K | Apache 2.0 | Chat general | HuggingFace |
| SearchQwen2.5-3B | 3B | no especificado | Apache 2.0 | Agente de búsqueda | HuggingFace |
| SearchQwen3-8B | 8B | no especificado | Apache 2.0 | Agente de búsqueda | HuggingFace |

En las evaluaciones LLM-judge, SearchQwen2.5-7B supera a su modelo base en +10.68 puntos en el overall de Tool-Call estructurado (44.61 vs 33.33) y +7.63 puntos en la interacción de texto estilo Search-R1 (39.59 vs 31.96). La versión de 3B ofrece una alternativa más ligera con un overall de 35.00 en Tool-Call, mientras que la versión sobre Qwen3-8B alcanza un overall de 50.31, sugiriendo que el método de entrenamiento escala con la capacidad del modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: al heredar del modelo base Qwen2.5-7B-Instruct, puede presentar los sesgos típicos de los modelos entrenados con datos web, como sesgos de género, culturales o geográficos, no documentados específicamente para este modelo.
- Riesgo de alucinación: aunque el entrenamiento sobre trayectorias verificadas reduce la probabilidad de inventar información, el modelo puede generar respuestas incorrectas si las herramientas devuelven resultados ambiguos o si el contexto de búsqueda es insuficiente.
- Limitaciones de contexto: la longitud de contexto no está confirmada en la documentación; si se usa el contexto máximo del modelo base (128K tokens), el rendimiento en secuencias muy largas puede degradarse sin una validación específica.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo es un derivado de Qwen2.5-7B-Instruct; se debe respetar la licencia del modelo base (también Apache 2.0) y los términos de uso de Alibaba.
- Dependencia de herramientas externas: para funcionar correctamente, el modelo requiere un entorno con herramientas de búsqueda y navegación disponibles; sin ellas, su capacidad de razonamiento profundo se ve limitada.
- Evaluación limitada: los benchmarks publicados son internos (LLM-judge) y no se han comparado con estándares externos; la generalización a otros dominios no está validada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alibaba-pai/SearchQwen2.5-7B
- Dataset complementario: https://huggingface.co/datasets/alibaba-pai/SynSearch-Data
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Plataforma ModelScope de Alibaba: https://modelstudio.alibabacloud.com/
