# Remek/basal-omni-1.0-max

## Resumen

basal-omni-1.0-max es un modelo experimental de 12B parámetros desarrollado por Remek, construido sobre `google/gemma-4-12B-it` y diseñado no para generar texto libre, sino para responder preguntas tipadas sobre un estado dado (un mensaje, un documento, pasajes recuperados, una traza de agente o una página web en JSON). En lugar de producir una respuesta abierta, devuelve una probabilidad calibrada para cada opción permitida en un único forward pass, sin decodificación autoregresiva. Es la evolución de basal-1.5-max, que usaba Bielik (11B) como base.

El modelo forma parte de la línea basal-omni y comparte API con basal-1.5, pero amplía capacidades: admite hasta 255 opciones por pregunta (frente a 10 en la versión anterior), un único orden de opciones por defecto, y acepta imágenes y audio en la misma petición de forma zero-shot, leídos por los encoders propios de Gemma 4 sin entrenamiento específico en medios. Está entrenado sobre aproximadamente 815.000 decisiones tipadas en polaco e inglés, con soft targets provenientes de basal-1.5.

Su relevancia actual reside en el enfoque: modelos de decisión tipo *System 1* que sustituyen la generación de texto por clasificación calibrada, lo que reduce latencia, evita respuestas fuera del conjunto de opciones y proporciona una medida explícita de incertidumbre útil para enrutado, abstención y sistemas con humanos en el bucle. La licencia Apache 2.0 y el soporte de `transformers` facilitan su evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4), tipo `gemma4_unified`, con cabecera de decisión tipada |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los benchmarks cubren estados de hasta 30k+ caracteres, ~15k tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; repo de 24,4 GB) |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it` y añade una cabecera de decisión tipada que, dado un estado y una pregunta con un conjunto de opciones (`choice`, `noul` sí/no, `score`, y en el motor basal `multi`, `act` y `tool`), emite una distribución de probabilidad sobre las opciones permitidas en un solo forward pass. No genera texto: la respuesta es siempre una de las opciones y la probabilidad asociada indica la confianza. Para preguntas de tipo `tool` sobre definiciones de herramientas OpenAI o MCP, el modelo selecciona la herramienta, no sus argumentos.

El entrenamiento se realizó sobre aproximadamente 815.000 decisiones tipadas en polaco e inglés, con soft targets destilados de basal-1.5. El modelo está entrenado únicamente con decisiones de texto; la capacidad sobre imágenes y audio es zero-shot, apoyada en los encoders multimodales de Gemma 4 sin entrenamiento específico en medios (el autor indica que el entrenamiento en medios llegará en versiones posteriores). No se detalla en la información disponible la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de elección (`choice`), sí/no (`noul`), puntuación (`score`), multielección (`multi`), acción (`act`) y selección de herramienta (`tool`).
- Probabilidad calibrada por opción en un único forward pass, sin generación de texto.
- Hasta 255 opciones por pregunta.
- Procesamiento de imágenes y audio en la misma petición (`"media"`, servido con `--media on`), de forma zero-shot.
- Selección de herramientas sobre definiciones OpenAI o MCP (elige la herramienta, no los argumentos).
- Capacidades multilingües en polaco e inglés.
- Soporte de estados largos: documentos, pasajes recuperados, trazas de agente y páginas web en JSON.
- Integración con el motor de inferencia basal (modos `eager`, `fast`, `deterministic`).

## Casos de uso

- Enrutado y triaje de tickets: el modelo clasifica cada mensaje entrante en una de hasta 255 categorías con probabilidad calibrada, permitiendo derivar automáticamente los casos de alta confianza y escalar el resto a un humano según un umbral de error objetivo.
- Verificación de reglas y contratos: dado un documento y una pregunta de cumplimiento, devuelve sí/no con probabilidad; útil para pre-filtrado en revisiones legales, aunque el autor advierte que las reglas con umbrales y fechas exactas deben calcularse en código.
- Selección de herramientas en agentes: a partir de las definiciones de herramientas OpenAI o MCP y la traza del agente, elige la herramienta adecuada, integrándose en pipelines de agentes multi-paso.
- Clasificación de documentos largos: con estados de 8k-20k caracteres alcanza 79,6% de acierto en la familia de documentos largos, adecuado para triaje de contratos, informes o expedientes.
- Filtrado y ranking de pasajes en RAG: evalúa si un pasaje recuperado responde a la consulta (tipo `noul` o `score`), reduciendo el contexto enviado al modelo generador.
- Moderación y abstención: el uso de umbrales por tipo de pregunta permite decidir automáticamente solo una fracción de los casos (47,4% con el umbral por defecto a 1% de error) y derivar el resto, lo que encaja en flujos con humanos en el bucle.
- Análisis de imágenes y audio en triaje: aunque zero-shot y sin entrenamiento en medios, puede responder preguntas tipadas sobre contenido multimedia en la misma petición, útil para prototipos.

## Benchmarks y rendimiento

Resultados publicados por el autor, servidos con el motor basal en una H100 (bf16, `--mode eager` para omni, `--mode fast` para basal-1.5-max):

| Benchmark | basal-omni-1.0-max (12B) | basal-1.5-max (11B) |
|---|---|---|
| Werdykt v1, macro (PL + EN, 10 categorías × 2 idiomas) | 0.823 | 0.773 |
| PL decisions (test held-out de basal-1.0, 7.081 ítems) | 0.954 | 0.940 |
| PL general (conocimiento, exámenes, lectura; 3.079 ítems) | 0.810 | 0.797 |
| PL-Real (300 documentos polacos reales) | 0.980 | 0.970 |
| EN external panel (10 tareas públicas en inglés, 3.842 ítems) | 0.789 | 0.737 |
| Coverage a 1% de error (umbral por defecto) | 47,4% | 62,2% |

Desglose por longitud del estado en Werdykt (5.000 ítems, 82,3% global):

| Longitud del estado | Ítems | Precisión |
|---|---|---|
| 0-1k | 709 | 72,2% [69, 75] |
| 1k-2k | 2.598 | 80,6% [79, 82] |
| 2k-4k | 796 | 94,0% [92, 95] |
| 4k-8k | 394 | 98,0% [96, 99] |
| 8k-16k | 128 | 85,2% [78, 90] |
| 16k+ | 375 | 70,7% [66, 75] |

Familia de documentos largos (varía solo la longitud):

| Longitud del estado | Ítems | Precisión |
|---|---|---|
| 8k-20k | 226 | 79,6% [74, 84] |
| 20k-30k | 194 | 74,2% [68, 80] |
| 30k+ | 80 | 58,8% [48, 69] |

En el panel externo en inglés destaca BIG-Bench Hard (0.809 frente a 0.644 de basal-1.5-max) y TabFact (0.873 frente a 0.750), mientras que queda por detrás en ContractNLI (0.720 frente a 0.740). Las categorías más débiles en Werdykt son reglas (0.418), documentos largos (0.742) y contratos (0.762).

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 el modelo ocupa aproximadamente 24 GB, por lo que requiere al menos 24-32 GB de VRAM según overhead del motor y longitud de contexto.
- GPU recomendadas: NVIDIA H100 80GB (configuración usada por el autor en los benchmarks), A100 40/80GB.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (por ejemplo RTX 3090/4090) en bf16 con contexto moderado; en cuantizaciones menores no se han publicado datos específicos.
- Opciones de despliegue: motor basal (`basal-serve`, instalación vía `uv` con PyTorch 2.11 y CUDA 12.8); compatible con `transformers`. No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles de forma explícita; el diseño de un solo forward pass por decisión reduce la latencia frente a la generación autoregresiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.0-max | ~12B | no disponible | Decisión tipada calibrada sobre Gemma 4 | apache-2.0 | Hugging Face |
| basal-1.5-max | ~11B | no disponible | Decisión tipada calibrada sobre Bielik | no disponible en la información | Hugging Face |
| google/gemma-4-12B-it | ~12B | no disponible | Generación de texto multimodal instruct | no disponible en la información | Hugging Face |

La comparación directa con modelos de decisión tipo *System 1* (por ejemplo Jev, citado como inspiración) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el entrenamiento cubre solo decisiones de texto; las capacidades sobre imagen y audio son zero-shot y sin entrenamiento específico en medios.
- Bajo rendimiento en preguntas de reglas (0.418 en Werdykt): los umbrales y fechas exactas deben calcularse en código, no delegarse al modelo.
- Caída de precisión en documentos muy largos: 58,8% en estados de 30k+ caracteres en la familia de documentos largos.
- Cobertura automática limitada: con el umbral por defecto a 1% de error solo decide el 47,4% de los casos; el resto requiere revisión humana o umbrales certificados por tipo de pregunta.
- Riesgo de sesgo y alucinación no cuantificado en la información disponible; al restringir la respuesta a las opciones dadas, no puede emitir respuestas fuera del conjunto, pero la calibración puede degradarse fuera de la distribución de entrenamiento.
- Idiomas limitados a polaco e inglés; no se documenta soporte de castellano.
- Aunque la licencia es Apache 2.0, el modelo deriva de `google/gemma-4-12B-it`, cuyos términos deben verificarse para uso comercial en producción.
- No se documentan cuantizaciones oficiales ni despliegue fuera del motor basal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-max
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
