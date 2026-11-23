# ferreslabs/krun-one-v1

## Resumen

Krun One v1 es un modelo de decisión encoder-only desarrollado por ferreslabs (proyecto krun-ai) que, a partir de un contexto y una pregunta tipada, devuelve una decisión calibrada en un único forward pass, sin generación de texto. Resuelve tareas de clasificación de intención, enrutamiento de herramientas (tool routing), function calling, abstención y puntuación ordinal, devolviendo directamente la opción elegida (o ninguna) en lugar de texto libre que luego habría que parsear.

La arquitectura, denominada K1-W1536-L22, se basa en un encoder ModernBERT/mmBERT de 22 capas, hidden 1536, 24 cabezas de atención, FFN con GLU de 2304 y atención global cada 3 capas con ventana local de 128. Sobre el encoder se añade una cabeza de decisión de 2 capas con scoring de marcadores de opción, un slot `[NULL]` para abstención y una cabeza de answerability. El modelo tiene 879.356.931 parámetros y una longitud de secuencia de 1.024 tokens (presupuesto de 896 para la cabeza de opciones, hasta 48 tokens por opción, con chunking para listas largas de candidatos).

Es relevante porque ataca un problema recurrente en sistemas agénticos y de function calling: la selección fiable de herramientas e intenciones con calibración explícita y señal de abstención, en cuatro idiomas (inglés, portugués, español y francés), con latencias de milisegundos y una huella de VRAM de aproximadamente 1,7 GB en bf16. Se publica bajo licencia Apache-2.0, aunque el entrenamiento emplea datasets de terceros con condiciones propias que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K1-W1536-L22: encoder ModernBERT/mmBERT (22 capas, hidden 1536, 24 cabezas, GLU FFN 2304, atención global cada 3 capas, ventana local 128) + cabeza de decisión de 2 capas con option-marker scoring, slot `[NULL]` y cabeza de answerability |
| Parametros totales | 879.356.931 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens de secuencia (presupuesto de opciones 896, ≤ 48 tokens por opción) |
| Tipos de cuantizacion | no disponible (el checkpoint se usa en bf16; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en, pt (BR/PT), es (ES/LatAm), fr; incluye casos cross-language (contexto en un idioma, opciones en otro) |
| Licencia | Apache-2.0 (pesos) |
| Formato de pesos | safetensors (carpeta de artefacto congelada `krun-one-v1-text-final/`, con `SHA256SUMS` verificado en carga) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de estilo ModernBERT/mmBERT con 22 capas, dimensión oculta 1536 y 24 cabezas de atención. La atención combina capas globales cada 3 capas con atención local de ventana 128, lo que reduce coste computacional manteniendo acceso global periódico. La FFN usa activación GLU con dimensión intermedia 2304. Sobre el encoder se monta una cabeza de decisión de 2 capas que puntúa marcadores de opción, un slot `[NULL]` para representar la abstención y una cabeza de answerability que estima si la pregunta es respondible con el contexto dado.

El tokenizer es el de mmBERT/Gemma-2 con vocabulario de 256k. El entrenamiento parte del modelo base jhu-clsp/mmBERT (MIT) con continuación de MLM sobre la familia FineWeb, y se complementa con datasets de intención, function calling y clasificación: xLAM function-calling 60k (Salesforce) y derivados (xlam-irrelevance, When2Call), MASSIVE, banking77, Taskmaster, HelpSteer2, measuring-hate-speech, Bitext, MultiWOZ, multi3woz, Civil Comments, APIBench, ToolACE, Hermes y ToolMind. No se documentan en la información disponible detalles sobre uso de RLHF o DPO; sí se describe un proceso de calibración con temperaturas por familia y una señal de abstención basada en el margen top-1 − top-2, con umbrales ajustados sobre un split held-out para un punto de servicio del 80% de cobertura.

La innovación principal es el planteamiento como modelo de decisión en un solo paso: en lugar de generar texto y parsearlo, el modelo puntúa directamente las opciones candidatas (de 2 a 128+) y devuelve la elegida con calibración explícita. Además, la inclusión del slot `[NULL]` y la cabeza de answerability permiten abstenerse cuando ninguna opción es correcta, algo crítico en tool routing en producción.

## Capacidades

- Clasificación de intención (`choice`): selección de una opción entre 2 y 128+ candidatas, o abstención.
- Enrutamiento de herramientas y function calling: las herramientas se pasan como opciones con descripción, con familia de calibración específica (`tool`).
- Preguntas de tipo `noul`: verdadero/falso sobre una proposición relativa al contexto.
- Preguntas de tipo `score`: devolución de un nivel ordinal (por ejemplo, 5 niveles).
- Preguntas de tipo `multi`: devolución de todas las opciones aplicables (multi-label).
- Abstención calibrada mediante slot `[NULL]` y margen top-1 − top-2.
- Multilingüe: inglés, portugués (BR/PT), español (ES/LatAm) y francés, incluyendo cross-language.
- Manejo de listas largas de candidatos mediante chunking (evaluado hasta k = 128).
- No genera texto: no soporta tool calling generativo ni razonamiento multi-paso sobre estado bruto.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: dado el turno del usuario y una lista de intenciones definidas, el modelo devuelve la intención en un solo forward pass con ~14–17 ms de latencia típica, lo que permite clasificar cada turno sin coste de generación.
- Selección de herramientas en pipelines de function calling: las herramientas se pasan como opciones con descripción y `task_type: "tool"`, con una precisión reportada del 98,1% en el conjunto de validación; adecuado como primer paso de un agente que luego invoca la herramienta elegida.
- Filtro de abstención previo a un LLM generativo: usar el margen top-1 − top-2 y el slot `[NULL]` para descartar consultas fuera de dominio (OOD AUROC 0,971, 4,5% de falsa aceptación al 80% de cobertura) antes de derivar a un modelo mayor.
- Moderación y etiquetado de contenido: clasificación multi-label (`multi`) sobre textos cortos, con micro-F1 de 0,917 en el conjunto de validación.
- Encuestas y feedback con escalas ordinales: preguntas de tipo `score` para asignar niveles (MAE 0,60, Spearman 0,84 con 5 niveles), por ejemplo en atención al cliente o evaluación de calidad.
- Verificación de proposiciones sobre contexto: preguntas `noul` para comprobar si una afirmación se sigue del contexto (AUROC 0,973), útil en validación de respuestas o extracción de hechos.
- Sistemas multilingües en Iberia y LatAm: un mismo checkpoint para inglés, portugués, español y francés, incluyendo escenarios donde el contexto y las opciones están en idiomas distintos (98,2% en cross-language).
- Despliegue en hardware modesto: con ~1,7 GB de VRAM en bf16, cabe en GPUs de consumo y permite clasificación de alta frecuencia en servicios con muchos QPS.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre KrunBench v1 (validación) y comprobaciones externas, en bf16 sobre RTX 4090:

| Metrica | Resultado |
|---|---|
| Exactitud `choice` | 97,6% (intención 97,5%, herramientas 98,1%) |
| PT-BR / cross-language | 97,9% / 98,2% |
| k = 64 / k = 128 candidatos | 95,8% / 90,6% |
| OOD AUROC · falsa aceptación al 80% de cobertura | 0,971 · 4,5% |
| Score (5 niveles) MAE · Spearman | 0,60 · 0,84 |
| `noul` AUROC · `multi` micro-F1 · ECE | 0,973 · 0,917 · 0,015 |
| ToolACE v0 holdout | 90,1% |
| JevBench ítems públicos (231, externo, solo evaluación) | 53,2% (nivel difícil 30,6%) |
| Latencia (petición típica / k = 128) | ~14–17 ms / ~44 ms p50 |
| Memoria | ~1,7 GB VRAM con pesos bf16 |

No se han publicado comparaciones directas con modelos alternativos en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~1,7 GB con pesos en bf16.
- GPU recomendadas: cualquier GPU con al menos ~2–4 GB de VRAM libre; probado en RTX 4090. A100 y H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (por ejemplo, RTX 3050, RTX 4060, RTX 4090).
- Opciones de despliegue: el runtime propio del proyecto (`krun_one.v1.runtime.TextArtifact`) con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (el modelo no es generativo, por lo que estos servidores no aplican directamente).
- Latencia y throughput: ~14–17 ms p50 para peticiones típicas y ~44 ms p50 con k = 128 candidatos en RTX 4090; throughput no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de benchmarks ni especificaciones de modelos comparables de la misma categoría (clasificadores de intención y enrutadores de herramientas encoder-only). Se indica a continuación lo que sí es comparable a nivel estructural:

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Krun One v1 | Encoder de decisión (ModernBERT/mmBERT) | 879 M | 1.024 tokens | Apache-2.0 | Salida directa de decisión calibrada con abstención |
| jhu-clsp/mmBERT | Encoder base multilingüe | no disponible | no disponible | MIT | Modelo base sobre el que se construye Krun One v1 |
| Clasificadores BERT multilingües | Encoder + cabeza de clasificación | ~100–600 M | 512 tokens típicamente | variable | Requieren una cabeza por tarea; sin abstención nativa ni calibración por familia |

La comparación cuantitativa de rendimiento con alternativas no está disponible.

## Limitaciones y advertencias

- No computa consecuencias multi-paso a partir de un estado bruto (comparaciones numéricas contra límites, cadenas de búsquedas, planificación); los informes de investigación v1.1 del repositorio abordan este punto.
- Las entradas de más de 1.024 tokens se truncan.
- Los juicios verdadero/falso que requieren razonamiento están cerca del azar en benchmarks externos (JevBench: 53,2% global, 30,6% en nivel difícil).
- El umbral de abstención está ajustado para las familias de texto; en otros dominios debe usarse el margen solo como señal orientativa.
- Riesgo de alucinación bajo en el sentido generativo (no genera texto), pero puede asignar una opción incorrecta con alta confianza si la lista de candidatos no cubre la intención real; el mecanismo de abstención mitiga parcialmente este riesgo.
- Sesgos: el modelo se entrena con datasets de terceros (MASSIVE, banking77, Civil Comments, entre otros) y puede heredar sesgos presentes en ellos; no se documenta una evaluación de sesgos específica.
- Restricciones de licencia: los pesos son Apache-2.0, pero el entrenamiento usa xLAM 60k (Salesforce), cuya tarjeta oficial indica "this release is for research purposes only in support of an academic paper"; debe evaluarse para uso comercial. También hay fuentes con texto generado por modelos comerciales (OpenAI, GPT-4, DeepSeek, Mixtral) y datasets con licencias CC-BY-4.0, CDLA-Sharing-1.0, MIT, CC0 y ODC-By. El registro completo está en `configs/v1/sources.yaml` y `provenance.json`.
- El modelo no soporta generación de texto ni razonamiento generativo; no es un sustituto de un LLM para tareas abiertas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa limitados.

## Enlaces

- Hugging Face: https://huggingface.co/ferreslabs/krun-one-v1
- Repositorio de código y documentación: https://github.com/krun-ai/krun-one
- Dataset de evaluación: https://huggingface.co/datasets/ferreslabs/krunbench-v1
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT
- Dataset xLAM function-calling: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Dataset ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- Dataset banking77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset MultiWOZ: https://huggingface.co/datasets/pfb30/multi_woz_v22
