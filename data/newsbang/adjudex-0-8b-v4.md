# newsbang/adjudex-0.8b-v4

## Resumen

Adjudex 0.8B v4 es un modelo de decisión tipado desarrollado por newsbang, un fine-tune de Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) orientado a una tarea muy concreta: recibir un `state` y un conjunto de `questions` tipadas de opción múltiple (hasta 255 opciones) y devolver una distribución de probabilidad sobre cada opción. No es un modelo generativo de texto al uso, sino un motor de clasificación con cabeza de decisión, empaquetado con el pipeline `text-classification`.

El modelo cuenta con 852.985.920 parámetros (aproximadamente 0,85B) y se distribuye en formato safetensors BF16 con un repositorio de 1,7 GB. Su arquitectura se apoya en el backbone `Qwen3_5Model` modificado con atención no causal en las capas de atención completa y pooling del último token, más una cabeza de decisión `[255, hidden]` en BF16 almacenada en `readout.safetensors`. Incluye un fichero `decision_config.json` con códigos de opción, temperatura de calibración y hashes de procedencia.

La relevancia de este modelo radica en su enfoque: en lugar de generar respuestas libres, produce decisiones calibradas y tipadas, lo que lo hace adecuado para sistemas de enrutamiento, selección de herramientas o clasificación estructurada en pipelines de agentes. Su licencia Apache 2.0 y su tamaño reducido permiten desplegarlo en una sola GPU, aunque el servidor de referencia se ha validado con una A800 de 80 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3_5Model) con atención no causal en capas de atención completa y pooling del último token; cabeza de decisión `[255, hidden]` |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (límite del servidor de referencia; las peticiones que lo exceden se rechazan con HTTP 422) |
| Tipos de cuantizacion | BF16 (pesos distribuidos en BF16); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); incluye `readout.safetensors` y `decision_config.json` |

## Arquitectura y entrenamiento

El modelo parte del backbone `Qwen3_5Model`, sobre el que se introduce una modificación clave: atención no causal en las capas de atención completa, lo que permite que cada token atienda a toda la secuencia sin restricción de direccionalidad. Sobre la representación del último token (last-token pooling) se aplica una cabeza de decisión lineal de dimensiones `[255, hidden]` en BF16, que proyecta el estado oculto sobre hasta 255 opciones posibles. El resultado es una distribución de probabilidad por opción, calibrada mediante una temperatura especificada en `decision_config.json`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. El autor tampoco documenta innovaciones adicionales como decodificación especulativa o atención linear más allá de la modificación de atención no causal. El repositorio incluye código personalizado (`custom-code`) y el servidor `/v1/systemone`, derivado sin cambios del código de serving de `perplexity-ai/pplx-decider-v1.1-27b` (Apache 2.0), según se indica en el fichero NOTICE.

## Capacidades

- Decisión tipada sobre opciones múltiples: recibe un `state` y `questions` con hasta 255 opciones y devuelve una probabilidad para cada una.
- Clasificación estructurada mediante cabeza de decisión calibrada (temperatura configurable en `decision_config.json`).
- Serving mediante el servidor incluido `/v1/systemone`, con endpoint compatible con el motor `http` del kit de evaluación.
- Soporte de códigos de opción definidos en `decision_config.json`, lo que permite mapear índices a etiquetas semánticas.
- Capacidad de rechazo controlado: las peticiones que exceden los 8.192 tokens se rechazan con HTTP 422 sin truncar, lo que evita decisiones sobre contexto incompleto.
- No se documentan capacidades de generación de texto libre, tool calling, agentes multi-paso, visión, audio ni modo thinking. El pipeline declarado es `text-classification`, no `text-generation`.

## Casos de uso

- Enrutamiento de consultas en sistemas de atención al cliente: el modelo recibe el estado de la conversación y una pregunta tipada con las categorías disponibles (por ejemplo, facturación, soporte técnico, reclamación) y devuelve la probabilidad de cada categoría, permitiendo derivar el caso al flujo adecuado con un umbral de confianza calibrado.
- Selección de herramientas en pipelines de agentes: dado un estado y una lista de herramientas disponibles como opciones, el modelo puntúa cada una y el orquestador elige la de mayor probabilidad, sustituyendo a un LLM generativo en este paso y reduciendo latencia y coste.
- Clasificación de documentos o tickets en producción: con una cabeza de 255 opciones, se pueden cubrir taxonomías amplias de categorías sin necesidad de un modelo generativo, usando la distribución completa para detectar casos ambiguos.
- Evaluación de decisiones en sistemas de retrieval: el área Retrieval del Decision Index (66,89) sugiere que el modelo puede puntuar opciones de recuperación o selección de pasajes en un pipeline RAG, actuando como reranker o selector de candidatos.
- Moderación o filtrado con opciones tipadas: dado un estado (texto de entrada) y una pregunta con opciones de política (permitir, revisar, bloquear), el modelo devuelve probabilidades que permiten aplicar umbrales configurables por política.
- Investigación en modelos de decisión calibrados: al ser un fine-tune pequeño (0,85B) con licencia Apache 2.0 y código de serving incluido, sirve como base para estudiar calibración, atención no causal y cabezas de decisión en tareas de opción múltiple.
- Despliegue en entornos con recursos limitados: con 0,85B de parámetros en BF16 (aproximadamente 1,7 GB de pesos), el modelo cabe en GPUs de consumo para inferencia, aunque el servidor de referencia se haya validado en A800.

## Benchmarks y rendimiento

El autor publica resultados del Decision Index 0.3 (suite pública) en la model card:

| Area | Skill |
|---|---:|
| Knowledge | 30,54 |
| Language | 55,49 |
| Retrieval | 66,89 |
| Tools | 79,78 |
| Arts | 48,80 |
| **Decision Index 0.3** | **55,10** (raw 66,49) |

La ejecución completa se realizó con `"complete": true` y 140.620 peticiones. De ellas, 345 peticiones (311 ToolRet, 25 POP909-CL, 6 BRIGHT, 2 API-Bank, 1 HLE) tenían una rama de pregunta que excedía el límite de 8.192 tokens; el servidor las rechazó con HTTP 422 sin truncar y se contabilizaron como incorrectas. La ejecución usó el motor `http` del kit con `--option base_url=http://<host>:8000 --option model=jev-latest`, BF16 en CUDA, configuración por defecto del servidor y una A800 de 80 GB por proceso de servidor.

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones directas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 suman aproximadamente 1,7 GB, por lo que la inferencia requiere al menos unos 3-4 GB de VRAM contando activaciones y overhead del servidor; no se documenta una cifra oficial.
- GPU recomendadas: el autor valida el servidor con una A800 de 80 GB por proceso, configuración sobredimensionada para el tamaño del modelo pero usada en la ejecución de referencia del Decision Index.
- GPU de consumo: por tamaño (0,85B en BF16), el modelo debería caber en GPUs de consumo como RTX 3060, RTX 4060 o superiores; no se documenta validación en estas tarjetas.
- Opciones de despliegue: el repositorio incluye el servidor `/v1/systemone` (código de `perplexity-ai/pplx-decider-v1.1-27b`), que se arranca con `python -m autojev.server` tras `pip install -r requirements.txt` y variables de entorno `AUTOJEV_CHECKPOINT`, `AUTOJEV_HOST` y `PORT`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La ejecución de referencia procesó 140.620 peticiones en una A800, pero no se publica el tiempo total ni peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adjudex 0.8B v4 | 852.985.920 | 8.192 tokens | Decisión tipada con cabeza `[255, hidden]` sobre Qwen3.5-0.8B | Apache 2.0 | HuggingFace (newsbang/adjudex-0.8b-v4) |
| Qwen3.5-0.8B (modelo base) | No disponible en la información | No disponible | Generación de texto | No disponible en la información | HuggingFace (Qwen/Qwen3.5-0.8B) |
| perplexity-ai/pplx-decider-v1.1-27b | No disponible en la información | No disponible | Motor de decisión (código de serving reutilizado) | Apache 2.0 | HuggingFace (perplexity-ai/pplx-decider-v1.1-27b) |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- El modelo no es generativo: no produce texto libre, sino distribuciones de probabilidad sobre opciones predefinidas; usarlo fuera de ese contrato requiere adaptar el pipeline.
- Límite estricto de 8.192 tokens: las peticiones que lo exceden se rechazan con HTTP 422 y se contabilizan como incorrectas en la evaluación; no hay truncado automático.
- El rendimiento en Knowledge es bajo (30,54 en el Decision Index), lo que sugiere escasa fiabilidad en decisiones que requieran conocimiento factual extenso.
- Los idiomas soportados no están documentados; no se puede asumir un rendimiento multilingüe sin validación previa.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente: las probabilidades deben validarse con la temperatura configurada antes de usarse como umbrales en producción.
- La evaluación se realizó con una configuración concreta (BF16, CUDA, servidor por defecto, A800) y no se documenta el comportamiento con otras cuantizaciones o backends.
- Aunque la licencia es Apache 2.0, el código de serving procede de `perplexity-ai/pplx-decider-v1.1-27b`; conviene revisar el fichero NOTICE para cumplir con las atribuciones.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.
- No se documentan sesgos conocidos ni composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de equidad.

## Enlaces

- HuggingFace: https://huggingface.co/newsbang/adjudex-0.8b-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código de serving de referencia: https://huggingface.co/perplexity-ai/pplx-decider-v1.1-27b
