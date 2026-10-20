# CrazyH0rse/Discerna-v1-475M

## Resumen

Discerna-v1-475M es un modelo de decisión —no un modelo generativo— publicado por el usuario CrazyH0rse en HuggingFace. Recibe un estado (texto libre o cualquier JSON), opcionalmente imágenes, y un conjunto de preguntas con nombre; devuelve, en una sola pasada hacia delante, una probabilidad calibrada para cada opción de cada pregunta. Admite tres tipos de pregunta: sí/no (`noul`), elección entre 2 y 255 opciones con nombre (`choice`) y nivel en una escala de 2 a 10 (`score`). No emite texto: la salida es estructurada y el modelo reporta `output_tokens: 0`.

Se construye por fine-tuning sobre los modelos de LiquidAI LFM2.5-Encoder-350M y LFM2.5-VL-450M, y suma 474.967.041 parámetros: un encoder de texto bidireccional de 354,5M (16 capas, anchura 1.024), una torre de visión SigLIP2 de 85,8M, un proyector de 8,4M y una cabeza de decisión de 26,2M. Acepta hasta 16.384 tokens de texto, o hasta 896 tokens de texto cuando se adjuntan imágenes (cada imagen se lee en hasta diez teselas de 512 píxeles más una miniatura).

Su interés práctico es acotado pero claro: sustituye a un LLM generativo en tareas de clasificación, triaje y enrutado donde solo hace falta una etiqueta o una probabilidad, con ~1 GB de pesos en media precisión y ejecución en CPU, Apple Silicon o GPU NVIDIA. La licencia es `lfm1.0` y el modelo solo está entrenado para inglés. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional multimodal con cabeza de decisión no generativa (10 capas de convolución corta + 6 de atención en el encoder de texto) |
| Parametros totales | 474.967.041 (~475M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Desglose de parametros | Encoder de texto 354,5M; torre de visión SigLIP2 85,8M; proyector 8,4M; cabeza de decisión 26,2M |
| Longitud de contexto | 16.384 tokens de texto; con imágenes, hasta 896 tokens de texto y hasta 10 teselas de 512 px + 1 miniatura por imagen |
| Tipos de cuantizacion | no disponible; el autor solo documenta fp16/bf16 (~1 GB, por defecto en GPU) y fp32 (~1,9 GB, por defecto en CPU) |
| Idiomas soportados | en (inglés) |
| Licencia | `lfm1.0` (tag `other`, `license_name: lfm1.0`) |
| Formato de pesos | safetensors |
| Entrada | `state` (texto o JSON), `images` (opcional), `questions` (una o varias) |
| Salida | JSON con probabilidades por opción; `output_tokens = 0` |
| Servidor incluido | `discerna serve` + `POST /v1/decide` (HTTP 413 si se exceden límites, 422 si la petición es inválida) |
| Requisitos de entorno | Python 3.12 o superior |

## Arquitectura y entrenamiento

El mecanismo es de *scoring*, no de generación: cada pregunta se concatena con el estado en una única secuencia (estado, pregunta y después cada opción detrás de un marcador). Una sola pasada hacia delante puntúa todos los marcadores y un softmax sobre las opciones produce las probabilidades. Las imágenes se proyectan al espacio del encoder de texto y sus posiciones se colocan al principio de la secuencia. La cabeza de decisión (26,2M) incorpora un embedding de tipo de pregunta, dos capas transformer y un scorer en cada marcador de opción. La calibración se aplica con una temperatura distinta por tipo de pregunta y por número de opciones, de ahí que el modelo devuelva `confidence` junto a las probabilidades.

El autor declara fine-tuning sobre LFM2.5-Encoder-350M y LFM2.5-VL-450M y enumera los conjuntos de datos usados: MultiNLI, WANLI, CommonsenseQA, QASC, Civil Comments, GoEmotions, HelpSteer2, HelpSteer3, Aegis AI Content Safety 2.0, PubMedQA, TyDi QA, ToolACE y Glaive Function Calling v2. La información proporcionada se interrumpe al inicio de la sección de entrenamiento (`## Trainin`), por lo que no están disponibles el número de tokens de entrenamiento, la composición exacta del dataset, la mezcla por tarea ni si se aplicaron RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Clasificación y decisión en una sola pasada: varias preguntas independientes sobre el mismo estado, resueltas conjuntamente en una petición.
- Preguntas de sí/no (`noul`), que devuelven la probabilidad de "sí" (por ejemplo, 0.358).
- Preguntas de elección (`choice`) con entre 2 y 255 opciones con nombre y descripción opcional; devuelve opción más probable, distribución completa y confianza.
- Preguntas de nivel (`score`) sobre escalas de 2 a 10 niveles; devuelve probabilidad por nivel, nivel esperado y leyenda.
- Entrada multimodal: texto más imágenes, con hasta 10 teselas de 512 px y miniatura por imagen.
- Contexto de 16.384 tokens para texto solo; se reduce a 896 tokens cuando hay imágenes.
- Probabilidades calibradas por tipo de pregunta y número de opciones.
- Procesamiento por lotes (`model.decide_batch`), más rápido en GPU.
- API HTTP (`POST /v1/decide`), API de Python (`discerna.load`, `model.decide`) y CLI (`discerna ask`, `discerna decide`, `discerna serve`).
- No soporta generación de texto, tool calling generativo, agentes multi-paso ni modo "thinking": esos usos solo son posibles como enrutado o clasificación previa.

## Casos de uso

- Triaje de tickets de soporte: el propio repositorio incluye un ejemplo en el que se clasifica un mensaje de facturación en una sola llamada, devolviendo equipo (`billing`, 0.998), urgencia (`noul`, 0.358) y tono del cliente (`score`, 0.64). Es adecuado porque evita una generación completa y da probabilidades auditables.
- Moderación de contenido: entrenado con Aegis AI Content Safety 2.0 y Civil Comments, puede puntuar toxicidad, acoso o seguridad por categorías mediante varias preguntas `noul`/`choice` sobre el mismo texto, con umbrales configurables sobre la probabilidad en lugar de sobre una salida de texto libre.
- Enrutado de herramientas en pipelines de agentes: con ToolACE y Glaive Function Calling v2 en el entrenamiento, puede elegir la función o API correcta entre un conjunto de hasta 255 opciones descritas, actuando como clasificador previo de bajo coste antes de invocar un LLM o un endpoint.
- Evaluación automática de respuestas de LLM: usar HelpSteer2/HelpSteer3 como base para puntuar utilidad, corrección o seguridad de una respuesta en una escala de 2 a 10, con distribución de probabilidad en lugar de una nota única.
- Verificación de afirmaciones en RAG: con MultiNLI y WANLI, comprobar si un pasaje recuperado implica, contradice o es neutro respecto a una afirmación, usando la pregunta `choice` de tres opciones para filtrar antes de generar.
- Inspección visual ligera: el ejemplo `market_potatoes` muestra clasificación de una fotografía con preguntas sobre el estado del producto; sirve para control de calidad o catalogación con hasta 10 teselas de 512 px por imagen, sin necesidad de un VLM generativo.
- Triaje de literatura biomédica: PubMedQA en el entrenamiento permite responder preguntas de sí/no sobre evidencia en abstracts, con la probabilidad como medida de confianza para derivar a revisión humana.
- Despliegue en entornos sin GPU: al ocupar ~1 GB en fp16 y funcionar en CPU y Apple Silicon, encaja en servicios de decisión de borde o en procesos batch donde no hay acelerador disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio incluye un fichero de respuestas (`examples/answers.json`) para marcar aciertos y errores con `--answers`, pero no se proporcionan métricas agregadas (ni MMLU, ni tasas de acierto en NLI, ni ECE de calibración) ni comparaciones con otros modelos.

## Requisitos de hardware

- Peso de los pesos: ~1 GB en media precisión (fp16/bf16, opción por defecto en GPU) y ~1,9 GB en precisión completa (fp32, opción por defecto en CPU). El repositorio completo ocupa 1,9 GB.
- VRAM estimada para inferencia: no publicada por el autor; con ~1 GB de pesos en fp16, cualquier GPU con 4 GB o más debería poder cargarlo, si bien el consumo real con teselas de imagen y lotes grandes no está documentado.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier RTX con 4 GB o más; el autor confirma ejecución en NVIDIA, CPU y Apple Silicon.
- GPU de datacenter: no se documentan A100/H100 ni requisitos concretos; el modelo no necesita aceleradores de gama alta.
- Opciones de despliegue: paquete propio `discerna` (servidor HTTP con `POST /v1/decide`, API de Python y CLI). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo no encaja en esos servidores.
- Latencia y throughput: no disponibles. El autor solo indica que `decide_batch` es más rápido en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Discerna-v1-475M | 474,97M | 16.384 tokens (896 con imágenes) | Texto + imagen | Probabilidades por opción, sin texto | lfm1.0 | Público en HF, 0 descargas |
| LiquidAI LFM2.5-Encoder-350M | ~350M (según nombre) | no disponible | Texto | Embeddings/encoder | no disponible | Modelo base en HF |
| LiquidAI LFM2.5-VL-450M | ~450M (según nombre) | no disponible | Texto + imagen | Generación / VLM | no disponible | Modelo base en HF |

No se han encontrado en la información proporcionada otros modelos de decisión no generativos directamente comparables (clasificadores calibrados multimodales con preguntas arbitrarias); las alternativas habituales serían clasificadores tipo DeBERTa o ModernBERT fine-tuneados, para los que no hay datos en esta ficha.

## Limitaciones y advertencias

- Solo inglés: `language: en`. Cualquier uso en castellano u otros idiomas queda fuera de lo declarado y no hay evaluación al respecto.
- No genera texto: no puede usarse como chatbot, resumidor ni agente; solo devuelve distribuciones sobre opciones predefinidas.
- Límite de 896 tokens de texto cuando se envían imágenes, muy inferior a los 16.384 tokens en modo texto.
- Máximo de 255 opciones por pregunta `choice` y escala máxima de 10 niveles en `score`.
- Riesgo de error silencioso: al devolver probabilidades, una confianza alta puede ser errónea; se recomienda umbral y revisión humana en decisiones sensibles. No hay métricas publicadas de calibración (ECE) ni de acierto.
- Sesgos heredados de los datasets: Civil Comments y GoEmotions contienen anotaciones subjetivas sobre toxicidad y emoción, y HelpSteer2/3 reflejan preferencias de anotadores; pueden aparecer sesgos de registro, culturales y de género.
- El modelo se presenta como calibrado con una temperatura por tipo de pregunta y número de opciones; alterar el rango de opciones o reutilizar criterios muy distintos a los de entrenamiento puede degradar la calibración.
- Licencia `lfm1.0` (tag `other`): es necesario revisar el fichero LICENSE antes de cualquier uso comercial, ya que hereda condiciones del modelo base de LiquidAI.
- Madurez: repositorio creado el 2026-10-19, con 0 descargas y 0 likes; no hay validación independiente ni resultados de benchmarks.
- Documentación incompleta: la sección de entrenamiento de la model card aparece truncada en la información disponible, y no se detallan datos de entrenamiento ni fases de alineamiento.
- Dependencia de un paquete propio (`discerna`, Python ≥3.12) instalado desde un wheel alojado en el repositorio; no hay integración con ecosistemas estándar de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CrazyH0rse/Discerna-v1-475M
- Fichero de licencia referenciado en la model card: https://huggingface.co/CrazyH0rse/Discerna-v1-475M/blob/main/LICENSE
- Wheel del paquete `discerna` 1.0.0: https://huggingface.co/CrazyH0rse/Discerna-v1-475M/resolve/main/wheels/discerna-1.0.0-py3-none-any.whl
- Ejemplos del repositorio (peticiones, imágenes y clave de respuestas): `hf download CrazyH0rse/Discerna-v1-475M --include "examples/*" --local-dir .`
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Papers, blogs o demos adicionales: no disponibles (la búsqueda web no devolvió resultados relacionados con el modelo).
