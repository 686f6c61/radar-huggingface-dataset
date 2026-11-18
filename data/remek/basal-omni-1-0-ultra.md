# Remek/basal-omni-1.0-ultra

## Resumen

basal-omni-1.0-ultra es un modelo experimental de decisión tipada desarrollado por Remek, construido mediante fine-tuning sobre google/gemma-4-31B-it. No es un modelo generativo al uso: en lugar de redactar respuestas, lee un estado (un mensaje, un documento, pasajes recuperados, la traza de un agente o una página web serializada en JSON) y responde a una pregunta cerrada con un conjunto acotado de opciones, devolviendo una probabilidad calibrada para cada una de ellas en un único forward pass, sin generar texto. Es la variante de mayor tamaño de la familia basal-omni y sustituye la base Bielik (11B) de basal-1.5 por Gemma 4 (31B).

El modelo está entrenado únicamente sobre decisiones textuales (unas 640.000 decisiones tipadas en polaco e inglés, con soft targets de basal-1.5), pero responde también a las mismas preguntas sobre imágenes de forma zero-shot aprovechando el encoder visual de Gemma 4, sin entrenamiento específico en medios. La base de 31B carece de encoder de audio, por lo que este nivel no procesa audio. Su relevancia actual reside en que ofrece un mecanismo de decisión calibrada con umbrales por tipo de pregunta, pensado para enrutado automático con abstención controlada (derivar a un humano cuando la confianza no alcanza el umbral).

Con 31.273.086.512 parámetros y un repositorio de 62,6 GB en safetensors, el modelo se distribuye bajo licencia Apache 2.0 y admite hasta 255 opciones por pregunta (frente a las 10 de basal-1.5). Está pensado para integrarse en pipelines de clasificación, moderación, enrutado y evaluación automática donde se requiere una respuesta acotada y una medida de incertidumbre fiable, no texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4, encoder de imagen incluido; sin encoder de audio) |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los benchmarks cubren estados de hasta 30k+ caracteres y prompts de varios miles de tokens) |
| Tipos de cuantizacion | no disponible (los benchmarks se sirven en bf16) |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer multimodal con encoder de imagen propio, y se ajusta para una tarea de decisión tipada en lugar de generación libre. La innovación central es el mecanismo de respuesta: dada una pregunta con un conjunto cerrado de opciones (tipos `choice`, `noul` para sí/no, `score`, y en el motor basal `multi`, `act` y `tool`), el modelo produce en un solo forward pass una distribución de probabilidad calibrada sobre las opciones permitidas, sin decodificación autoregresiva. Esto garantiza que la respuesta nunca caiga fuera del conjunto de opciones y que la probabilidad asociada refleje la confianza del modelo. Las preguntas de tipo `tool` sobre definiciones de herramientas OpenAI o MCP seleccionan la herramienta, no sus argumentos.

El entrenamiento se realizó sobre aproximadamente 640.000 decisiones tipadas en polaco e inglés, con soft targets destilados de basal-1.5. No se menciona en la información disponible el uso de RLHF o DPO. Respecto a basal-1.5-max, el modelo amplía el número máximo de opciones por pregunta de 10 a 255, usa un único orden de opciones por defecto (basal-1.5 promediaba dos) e incorpora imágenes en la misma petición mediante el campo `"media"`, servidas con `--media on`, de forma zero-shot sin entrenamiento específico en medios. El soporte de audio no está presente porque la base de 31B no incluye encoder de audio.

## Capacidades

- Decisión tipada calibrada: responde preguntas de opción múltiple (`choice`), sí/no (`noul`), puntuación (`score`), multietiqueta (`multi`), acción (`act`) y selección de herramienta (`tool`) devolviendo probabilidades por opción.
- Hasta 255 opciones por pregunta.
- Procesamiento de imágenes zero-shot mediante el encoder visual de Gemma 4, dentro de la misma petición.
- Selección de herramientas a partir de definiciones OpenAI o MCP (elige la herramienta, no genera sus argumentos).
- Comprensión de estados largos: mensajes, documentos, pasajes recuperados, trazas de agentes y páginas web serializadas en JSON.
- Capacidades multilingües limitadas a polaco e inglés.
- Modo determinista (`--deterministic`) para una petición por forward pass.
- Umbrales de calibración por tipo de pregunta con abstención (derivación a humano) cuando no se alcanza la confianza requerida.
- No soporta audio.

## Casos de uso

- Enrutado automático de tickets de soporte: el modelo clasifica cada mensaje entrante entre un conjunto amplio de categorías (hasta 255 opciones) y devuelve la probabilidad de cada una; con el umbral calibrado se decide automáticamente o se deriva a un agente humano.
- Moderación de contenido con abstención controlada: preguntas de tipo `noul` o `score` sobre textos permiten aplicar políticas con una tasa de error objetivo (por ejemplo, 1 %), derivando los casos dudosos a revisión manual.
- Selección de herramientas en agentes: dada una traza y un catálogo de herramientas OpenAI o MCP, el modelo elige la herramienta adecuada con probabilidad asociada, integrándose en el bucle de decisión de un agente.
- Evaluación automática de respuestas y documentos: preguntas de tipo `score` sobre pares pregunta-respuesta o sobre documentos largos (hasta decenas de miles de caracteres) para puntuar calidad o relevancia con calibración explícita.
- Análisis de documentos legales y contractuales: clasificación de cláusulas y condiciones sobre textos largos (la familia de documentos largos mantiene 88,1 % en 8k-20k caracteres y 87,1 % en 20k-30k), con derivación a humano en los casos de baja confianza.
- Procesamiento de documentos escaneados o capturas: al aceptar imágenes zero-shot, permite responder preguntas cerradas sobre el contenido visual sin pipeline OCR separado.
- Verificación de reglas y umbrales en flujos administrativos: aunque el propio autor advierte que los umbrales y fechas exactos deben calcularse en código (categoría `rules` con 0,550 de precisión), el modelo sirve para clasificar el tipo de trámite o la conformidad general antes de la comprobación determinista.

## Benchmarks y rendimiento

Resultados servidos con el motor basal: basal-omni-1.0-ultra en una H200 y basal-omni-1.0-max en una H100, ambos con `--mode eager`, bf16 y un orden de opciones; basal-1.5-max tal como se publicó (`--mode fast`, dos órdenes de opciones).

| Benchmark | basal-omni-1.0-ultra (31B) | basal-omni-1.0-max (12B) | basal-1.5-max (11B) |
|---|---|---|---|
| Werdykt v1, macro (PL + EN oculto, 10 categorías × 2 idiomas) | 0.879 | 0.823 | 0.773 |
| PL decisions (test held-out de basal-1.0, 7.081 ítems) | 0.979 | 0.954 | 0.940 |
| PL general (conocimiento, exámenes, lectura; 3.079 ítems) | 0.823 | 0.810 | 0.797 |
| PL-Real (300 documentos polacos reales) | 0.973 | 0.980 | 0.970 |
| EN external panel (10 tareas públicas en inglés, 3.842 ítems) | 0.855 | 0.789 | 0.737 |
| Coverage al 1 % de error (con umbral publicado) | 56,8 % | 47,4 % | 62,2 % |

Detalle del panel externo en inglés frente a basal-omni-1.0-max: WinoGrande 0.863 vs 0.710, BIG-Bench Hard 0.883 vs 0.809, JudgeBench 0.700 vs 0.600; por detrás en FinancialPhraseBank (0.947 vs 0.967). En Werdykt v1 el intervalo del 95 % es 0.871-0.887 (polaco 0.881, inglés 0.877); las categorías más débiles son rules (0.550), contratos (0.822) y documentos largos (0.854).

Precisión por longitud del estado en Werdykt (5.000 ítems, PL + EN):

| Longitud del estado | Ítems | Precisión |
|---|---|---|
| 0-1k | 709 | 77,9 % [75, 81] |
| 1k-2k | 2.598 | 86,5 % [85, 88] |
| 2k-4k | 796 | 97,6 % [96, 98] |
| 4k-8k | 394 | 98,7 % [97, 99] |
| 8k-16k | 128 | 91,4 % [85, 95] |
| 16k+ | 375 | 83,5 % [79, 87] |

Familia de documentos largos (misma tarea, solo varía la longitud): 8k-20k caracteres 88,1 % (226 ítems); 20k-30k 87,1 % (194); 30k+ 73,8 % (80). Ejecución del 2026-10-15 con basal-serve `--mode eager` en una NVIDIA H200 en bf16.

## Requisitos de hardware

- Inferencia en bf16: los benchmarks se ejecutaron en una NVIDIA H200; el repositorio ocupa 62,6 GB en safetensors, por lo que se requiere una GPU con al menos 64 GB de VRAM para pesos en bf16 sin cuantizar.
- GPU recomendadas: H200 (referencia de las mediciones), H100, A100 80 GB. En GPUs de 40-48 GB (A6000, L40S) sería necesario cuantizar o usar paralelismo.
- GPU de consumo: no cabe en tarjetas consumer (RTX 4090 con 24 GB) en bf16; la información disponible no documenta cuantizaciones que permitan reducir el requisito.
- Despliegue: motor basal (basal-serve) con modos `--mode eager` y `--deterministic`; el modelo usa la librería transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles de forma explícita; las mediciones se hicieron con una petición por forward pass en modo determinista. La información indica que basal 2.1 da la misma respuesta top en 23.278 de 23.278 filas de comprobación servidas respecto a basal 2.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Werdykt v1 | PL decisions | EN external panel | Licencia |
|---|---|---|---|---|---|---|
| basal-omni-1.0-ultra | 31B | no disponible | 0.879 | 0.979 | 0.855 | apache-2.0 |
| basal-omni-1.0-max | 12B (según la model card) | no disponible | 0.823 | 0.954 | 0.789 | no disponible |
| basal-1.5-max | 11B (base Bielik) | no disponible | 0.773 | 0.940 | 0.737 | no disponible |

Frente a basal-omni-1.0-max, ultra está por delante en decisiones PL (+2,5 puntos, IC 95 % +2,0 a +3,1), en el test del corpus inglés de 1.479 ítems (0.751 vs 0.724) y en el panel externo inglés (+6,9 puntos, mejor en 9 de 10 tareas); empatado en conocimiento general polaco (+1,3, intervalo con cero) y en PL-Real (−0,7, intervalo con cero). Frente a basal-1.5-max, la ventaja es de +3,9 puntos en decisiones PL, +2,6 en conocimiento general polaco, 0.751 vs 0.659 en el corpus inglés y +11,8 en el panel inglés, con empate en PL-Real (+0,3). No se dispone de comparación con modelos de decisión de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor lo etiqueta explícitamente como experimental y entrenado solo en decisiones textuales; el rendimiento sobre imágenes es zero-shot y el entrenamiento en medios llegará en versiones posteriores.
- Sin soporte de audio: la base de 31B no incluye encoder de audio.
- Idiomas limitados a polaco e inglés; no hay evidencia de rendimiento en castellano.
- Riesgo de error en reglas y cálculos exactos: la categoría rules obtiene 0,550 en Werdykt; el propio autor recomienda calcular umbrales y fechas exactos en código.
- Cobertura automática moderada: al 1 % de error objetivo, solo el 56,8 % de las preguntas se deciden automáticamente con el umbral publicado; los tipos sin umbral certificado se derivan a una persona (las preguntas de tipo score van a humano al 1 % objetivo).
- Rendimiento inferior en documentos muy largos: 73,8 % en estados de más de 30k caracteres, frente a 88,1 % en 8k-20k.
- El modelo no genera texto libre: no es adecuado para tareas de redacción, resumen o diálogo abierto; solo responde a preguntas con opciones predefinidas.
- Sesgos: no se documentan en la información disponible análisis específicos de sesgo.
- Licencia Apache 2.0, que permite uso comercial, pero al derivar de gemma-4-31B-it conviene revisar los términos de la licencia de la base de Google antes de desplegar en producción.
- Requiere el motor basal para aprovechar los tipos de pregunta extendidos (`multi`, `act`, `tool`) y los umbrales de calibración; fuera de él, las capacidades quedan restringidas.

## Enlaces

- Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-ultra
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
