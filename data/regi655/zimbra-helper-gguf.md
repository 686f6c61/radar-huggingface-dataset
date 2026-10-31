# Regi655/zimbra-helper-GGUF

## Resumen

Zimbra-helper (GGUF) es un modelo de lenguaje ligero de 1,94 mil millones de parámetros, creado por el usuario Regi655 a partir de Qwen3.5-2B mediante fine-tuning con LoRA. Está especializado en responder preguntas sobre Zimbra, la suite open source de correo y colaboración, dirigido a usuarios que migran desde Microsoft Outlook, Exchange o Gmail. El modelo no memoriza la documentación: está entrenado para leer extractos que se le pasan en el prompt (patrón RAG) y responder con pasos numerados y nombres exactos de menús, o admitir que no sabe.

El modelo alimenta a **Zimbo**, un asistente de escritorio offline que combina este modelo con búsqueda semántica sobre 17.360 fragmentos de la documentación oficial de Zimbra 9/10 y su wiki. Se distribuye en formato GGUF cuantizado a Q4_K_M (1,3 GB), funciona con unos 1,4 GB de VRAM o directamente en CPU, y puede descargarse directamente desde Ollama. Su licencia Apache 2.0 permite cualquier uso, incluido el comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-2B), encoder visivo eliminado, fine-tuning LoRA |
| Parametros totales | 1.942.653.248 (~1,94 B, solo parte textual) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (configuracion recomendada en el Modelfile) |
| Tipos de cuantizacion | Q4_K_M |
| Idiomas soportados | Italiano (principal), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (1,3 GB); base original en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B (revision de Unsloth `fffbc0d8711cf87df6d1f97938c5e50ef94aadc7`), al que se aplico fine-tuning LoRA de rango 32 (alpha 32) sobre las capas de atencion y MLP, entrenando 21,8 M de parametros (0,98 % del total) durante 2 epocas con learning rate 1e-4 en planificador cosine y batch efectivo de 16. La loss se calculo solo sobre las respuestas y el entrenamiento se realizo con Unsloth en una RTX 3070 Ti de 8 GB en unos 30 minutos. Antes de la cuantizacion se elimino el encoder visivo del modelo base (331 M de parametros), ya que el caso de uso es puramente textual.

El dataset consta de 2.376 ejemplos de entrenamiento y 111 de validacion en formato RAG: cada ejemplo incluye extractos numerados de la documentacion de Zimbra y una pregunta con su respuesta. Todas las respuestas fueron generadas localmente con un modelo open source (qwen3.5:9b, Apache 2.0) a partir de la documentacion oficial, e incluyen unas 2.000 parejas pregunta/respuesta sobre las guias oficiales, 245 parejas curadas sobre temas de migracion desde Outlook/Gmail (con reformulaciones coloquiales) y ejemplos de "no lo sé", extractos no pertinentes y preguntas sobre identidad y limites del asistente. Un filtro automatico descarto respuestas que mencionaban menus o comandos ausentes del texto fuente. El modelo se entreno con el modo de razonamiento (*thinking*) de Qwen3.5 desactivado, y debe usarse asi en produccion (`"think": false` en Ollama o `enable_thinking` desactivado en llama.cpp).

## Capacidades

- Respuesta a preguntas sobre Zimbra basada exclusivamente en extractos de documentacion proporcionados en el prompt (patron RAG).
- Generacion de procedimientos paso a paso con pasos numerados y nombres exactos de menus.
- Reproduccion fiel de comandos de administracion de Zimbra (zmprov, zmcontrol) tal como aparecen en la documentacion.
- Comparaciones con equivalentes de Outlook y Gmail para facilitar la migracion.
- Rechazo honesto: admite cuando los extractos no contienen la respuesta en lugar de inventar menus u opciones.
- Generacion conversacional en italiano (idioma principal) e ingles.
- Sin capacidades de vision (encoder eliminado), sin tool calling y sin capacidad de ejecutar acciones sobre servidores o cuentas.

## Casos de uso

- **Asistente de escritorio offline para migracion a Zimbra**: es el proposito original; Zimbo lo usa con busqueda semantica (Snowflake Arctic Embed L v2.0) sobre la documentacion oficial para responder dudas de usuarios que llegan desde Outlook, Exchange o Gmail.
- **Chatbot de soporte para administradores de Zimbra**: con un pipeline RAG sobre documentacion de administracion, puede explicar procedimientos con comandos zmprov o zmcontrol exactos.
- **Ayuda integrada en webmail self-hosted**: su tamano (1,4 GB de VRAM o CPU pura) permite incrustarlo en servidores de correo domesticos o PYMEs sin GPU dedicada.
- **FAQ automatica sobre las dos interfaces de Zimbra** (Classic y Modern Web App): el modelo puede indicar rutas de menus concretas si los extractos correspondientes se incluyen en el contexto.
- **Base para asistentes verticales similares**: el metodo (LoRA rango 32 + dataset RAG sintetico filtrado + GGUF Q4_K_M) es replicable para otras suites de software con documentacion publica.
- **Demostraciones educativas de RAG local**: al ser pequeño, Apache 2.0 y ejecutable con Ollama o llama.cpp, es util para prototipar pipelines RAG completos en un portatil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos de evaluacion publicados por el autor son:

| Metrica | Valor |
|---|---|
| Loss de validacion inicial | 0,922 |
| Loss de validacion final | 0,834 (sin overfitting) |
| Test cualitativo | 10 preguntas tipicas con la busqueda de Zimbo; mayoritariamente correctas y concisas, admite no saber cuando no hay respuesta en la documentacion |

Rendimiento medido de inferencia:

| Hardware | Velocidad |
|---|---|
| RTX 3070 Ti | ~200 tokens/s |
| Intel i7-12700K (solo CPU) | ~28 tokens/s |

## Requisitos de hardware

- **VRAM estimada**: ~1,4 GB con contexto de 4.096 tokens (GGUF Q4_K_M de 1,3 GB).
- **Ejecucion en CPU**: totalmente viable; ~28 tokens/s en un Intel i7-12700K, suficiente para uso interactivo.
- **GPUs recomendadas**: cualquier GPU consumer con mas de 2 GB de VRAM libres (RTX 3060, 3070 Ti, 4060 o superiores); no se requiere hardware de centro de datos.
- **Despliegue**: Ollama (descarga directa con `ollama pull hf.co/Regi655/zimbra-helper-GGUF` o creacion con el Modelfile incluido, temperatura 0,3 y contexto 4.096) y llama.cpp u otros runtimes compatibles con GGUF (desactivando `enable_thinking` en el template).
- **Latencia**: no disponible como cifra oficial; los ~200 tokens/s en RTX 3070 Ti y ~28 tokens/s en CPU son las unicas medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Especializacion |
|---|---|---|---|---|---|
| Regi655/zimbra-helper-GGUF | 1,94 B | 4.096 tokens | GGUF (Q4_K_M) | Apache 2.0 | RAG sobre documentacion de Zimbra, italiano/ingles |
| Qwen/Qwen3.5-2B (base) | ~2,27 B (con encoder visivo) | no disponible | safetensors, GGUF comunitarios | Apache 2.0 | Modelo generalista multilingue |
| qwen3.5:9b (usado para generar el dataset) | 9 B | no disponible | GGUF | Apache 2.0 | Generalista, mayor capacidad pero mayores requisitos |

La ventaja de zimbra-helper frente a su modelo base es la fiabilidad en el dominio: respuestas con estructura RAG, pasos numerados y rechazo de preguntas fuera de los extractos, a costa de la versatilidad generalista y sin capacidades de vision.

## Limitaciones y advertencias

- **Uso obligatorio con RAG**: sin extractos de documentacion en el prompt, el modelo tiende a inventar menus y comandos. No debe usarse como chatbot generalista sin retrieval.
- **Modelo pequeño**: puede equivocarse, especialmente si los extractos proporcionados no son pertinentes; el propio autor recomienda verificar siempre contra la documentacion oficial.
- **Confusion de interfaces**: la documentacion de Zimbra cubre Classic y Modern Web App, y el modelo a veces mezcla los nombres de menus entre ambas.
- **Cobertura desigual**: las preguntas de administracion avanzada estan menos representadas en el dataset.
- **Sin agenticidad**: no tiene herramientas ni acceso al sistema; solo explica, no ejecuta.
- **Idiomas**: optimizado para italiano e ingles; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- **Modo thinking**: debe mantenerse desactivado; el modelo fue entrenado sin razonamiento explicito.
- **Respuestas sinteticas**: todo el dataset fue generado por otro LLM y filtrado automaticamente, no verificado manualmente de forma exhaustiva, por lo que pueden persistir errores heredados.
- **Licencia**: Apache 2.0 no impone restricciones de uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Regi655/zimbra-helper-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
