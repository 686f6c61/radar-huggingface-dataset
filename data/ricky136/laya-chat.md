# ricky136/laya-chat

## Resumen

laya-chat es un modelo de decisión (decision model) desarrollado por el usuario ricky136 y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo generativo: no produce texto, sino que, dada una conversación y un borrador de respuesta, devuelve la distribución de probabilidad sobre un conjunto fijo de etiquetas tipadas (escala, tendencia, sí/no, elección). Es un fine-tune del encoder mmBERT-base contenido en el subdirectorio `multilingual` de los pesos multilingües de `convaiinnovations/laya`, con 321.908.998 parámetros totales y un peso de repositorio de 0,7 GB en safetensors.

Su propósito concreto es servir como copiloto de respuestas para WeChat en macOS dentro de la aplicación Laya Chat. El modelo responde a dos bloques de preguntas: un bloque de "afinidad" que se evalúa al abrir la conversación (affinity 0-9, trend, open_issue) y un bloque que estima qué ocurriría si se envía un borrador concreto (reaction, risk_after_send, addresses_need, tone, affinity_change, invites_followup). Cada pregunta se responde con probabilidades por opción, lo que permite puntuar y comparar borradores antes de enviarlos.

El interés de esta ficha es doble: por un lado, documenta un fine-tune muy pequeño (1638 ejemplos, 25 minutos en 2×T4) sobre un encoder de ~322 M de parámetros; por otro, ejemplifica el paradigma de "System One" descrito en foros como Grok, en el que el modelo emite decisiones tipadas con probabilidad en lugar de texto libre, con latencia y consumo de memoria muy inferiores a los de un LLM generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (mmBERT-base), con cabezas de clasificación por pregunta |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1024 tokens (`max_len=1024`, `head_max_len=512`) |
| Tipos de cuantizacion | no disponible (repo solo en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | convaiinnovations/laya (subdirectorio `multilingual`, encoder mmBERT-base) |
| Tamano del repositorio | 0,7 GB |
| Tarea | Clasificacion / decision model (no generacion de texto) |
| Fecha de publicacion | 2026-09-23 |

## Arquitectura y entrenamiento

El modelo parte del encoder mmBERT-base incluido en los pesos multilingües de Laya. Sobre ese encoder se montan cabezas de decisión que, en lugar de generar tokens, emiten una distribución de probabilidad sobre las opciones de cada pregunta. El modelo card lo describe explícitamente como un modelo de decisión que "no genera texto": para cada pregunta fija devuelve la probabilidad de cada opción. Las preguntas originales viven en `laya_chat/questions_send.py` del repositorio de la aplicación.

El entrenamiento se hizo con el script oficial de fine-tuning de Laya, combinando entropía cruzada sobre objetivos suaves (soft-target cross-entropy) con una recompensa basada en reglas de puntuación propias (proper scoring rule). Los datos son 408 conversaciones en chino (300 procedentes de LCCC tras filtrado y 100 sintéticas), cruzadas con 4 borradores cada una, lo que da 1638 ejemplos etiquetados por un modelo profesor (Claude Sonnet) que asigna probabilidades. El reparto se hizo por conversación: 1434 de entrenamiento, 306 de desarrollo y 306 de test. Se entrenaron 4 épocas en 2×T4 durante 25 minutos, con presupuesto de secuencia `head_max_len=512` y `max_len=1024`.

La innovación relevante no está en la arquitectura, que es un encoder estándar, sino en la formulación del problema: en lugar de generar una respuesta, el modelo puntúa borradores con decisiones tipadas y probabilidades calibradas por el profesor, lo que abarata la inferencia y permite comparar alternativas de forma directa.

## Capacidades

- Evaluación de afinidad de una conversación: estima `affinity` en escala 0-9, la `trend` (tendencia) y si existe un `open_issue` (tema pendiente).
- Predicción de reacción a un borrador: `reaction`, `risk_after_send`, `addresses_need`, `tone`, `affinity_change` e `invites_followup`.
- Salida probabilística por opción, no texto libre, lo que permite umbrales y comparaciones entre borradores.
- Procesamiento de conversaciones en chino con ventana de hasta 1024 tokens.
- Ejecución local de baja huella (el modelo base se describe en foros como ejecutable en MLX sobre Mac con poca RAM).
- No soporta tool calling ni function calling (no es un modelo generativo ni un agente).
- No soporta agentes ni razonamiento multi-paso: es un clasificador de decisión de un solo paso.
- No tiene capacidades de visión, audio ni multimodalidad.
- No hay modo "thinking" ni generación de cadena de pensamiento.

## Casos de uso

- Copiloto de respuestas en WeChat (macOS): la aplicación Laya Chat carga el modelo con `laya.load("ricky136/laya-chat")` y lo usa para puntuar un borrador antes de enviarlo, mostrando al usuario la reacción probable y el cambio de afinidad estimado.
- Aviso previo al envío: la pregunta `risk_after_send` permite señalar borradores con riesgo de empeorar la conversación antes de que el usuario pulse enviar. Es el caso de uso central de la aplicación, aunque el propio autor advierte que es la pregunta con peor rendimiento.
- Priorización de conversaciones: la combinación de `affinity` y `trend` permite ordenar chats por urgencia o por deterioro de la relación, útil en una bandeja con muchas conversaciones abiertas.
- Detección de temas pendientes: `open_issue` (0,84 de consistencia en test) sirve para recordar al usuario que hay un asunto sin cerrar en la conversación.
- Ajuste de tono: `tone` (0,84 en test) permite recomendar o filtrar borradores según el registro deseado antes del envío.
- Automatización de seguimiento: `invites_followup` (0,79 en test) ayuda a decidir si el mensaje abre la puerta a una respuesta posterior, útil para planificar recordatorios o no dejar conversaciones colgadas.
- Investigación sobre modelos de decisión: sirve como caso de estudio reproducible de fine-tuning de un encoder con objetivos suaves y reglas de puntuación, con un coste de entrenamiento de 25 minutos en 2×T4.
- Base para otros dominios de mensajería: el pipeline (profesor que etiqueta probabilidades + encoder pequeño) es trasladable a otros idiomas o plataformas, siempre que se regeneren los datos y el profesor.

## Benchmarks y rendimiento

Los únicos datos publicados son la consistencia con las etiquetas del modelo profesor (Claude Sonnet), no métricas estándar tipo MMLU o HumanEval.

| Metrica | Dev antes del fine-tune | Dev despues | Test despues |
|---|---|---|---|
| Overall (consistencia con profesor) | 0,321 | 0,585 | 0,615 |

Desglose por pregunta en test:

| Pregunta | Consistencia | MAE (si aplica) |
|---|---|---|
| tone | 0,84 | no disponible |
| open_issue | 0,84 | no disponible |
| invites_followup | 0,79 | no disponible |
| addresses_need | 0,76 | no disponible |
| trend | 0,74 | no disponible |
| affinity_change | 0,57 | 0,32 |
| reaction | 0,50 (baseline 0,31) | no disponible |
| affinity | 0,38 | 0,85 |
| risk_after_send | 0,22 | 0,63 |

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, alrededor de 0,65 GB para los 321,9 M de parámetros; en FP32, unos 1,3 GB; en INT8, unos 0,32 GB; en INT4, unos 0,16 GB. Estas cifras son estimaciones derivadas del número de parámetros, no medidas publicadas.
- GPU recomendadas: no hay recomendaciones oficiales de inferencia. El entrenamiento se hizo en 2×T4, por lo que una T4 única es suficiente para fine-tuning; para inferencia basta cualquier GPU con más de 2 GB de VRAM.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), e incluso en CPU, dado el tamaño del modelo.
- Ejecución en Mac: los pesos base de Laya se describen en foros como ejecutables de forma local mediante MLX con poca RAM; el modelo card no documenta una ruta MLX específica para este fine-tune.
- Opciones de despliegue: la ruta documentada es el runtime propio de Laya en Python (`laya.load("ricky136/laya-chat")`). No hay evidencia de compatibilidad con vLLM, TGI, llama.cpp u Ollama, y al no ser un modelo generativo de texto estos stacks no son aplicables directamente.
- Latencia y throughput: no disponible. Solo se ha señalado de forma cualitativa, en publicaciones de terceros, que los modelos de decisión tipo Laya ofrecen latencia muy inferior a la de un LLM generativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ricky136/laya-chat | 321.908.998 | 1024 tokens | Decision model para copiloto de WeChat (zh) | Apache 2.0 | Hugging Face, safetensors |
| convaiinnovations/laya (base, subdirectorio multilingual) | no disponible | no disponible | Decision model generico multilingue | no disponible | Hugging Face (modelo base) |
| Clasificadores encoder tipo BERT para analisis conversacional | Variable (100 M-400 M) | 512-1024 tokens | Clasificacion de sentimiento, tono o intencion | Variable | Ampliamente disponibles |

No se han localizado otros modelos publicos directamente comparables en la misma categoria exacta (decision model sobre encoder pequeno orientado a copiloto de mensajeria). La comparacion con alternativas generativas como Claude Sonnet, que actua como profesor en el pipeline de etiquetado, no es pertinente porque resuelve el problema de otra forma: genera texto en lugar de devolver decisiones tipadas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El entrenamiento se hizo sobre LCCC (chino) y datos sinteticos, sin analisis de sesgo publicado.
- Riesgo de alucinacion: no aplica en sentido estricto porque no genera texto, pero puede asignar probabilidades altas a opciones incorrectas. El autor advierte que la pregunta de tono puede estar aprendiendo a "reconocer la forma de escribir" del borrador en lugar del tono real, ya que las etiquetas y el tipo de borrador estan altamente correlacionados.
- La pregunta `risk_after_send` sigue siendo debil (0,22 de consistencia en test), por lo que no es fiable para bloquear envios en produccion.
- `affinity` tambien es floja (0,38 de consistencia, MAE de 0,85), con error alto en la escala 0-9.
- Volumen de datos muy reducido: 1638 ejemplos, con conversaciones mayoritariamente sinteticas. Riesgo de sobreajuste y de baja generalizacion a conversaciones reales.
- El profesor que genera las etiquetas es un modelo (Claude Sonnet), no un anotador humano; los limites del profesor se heredan.
- Solo validado en chino y en escenarios de WeChat uno a uno. No hay evidencia de funcionamiento en grupos, en otros idiomas ni en otras plataformas.
- Licencia Apache 2.0 permite uso comercial del fine-tune, pero conviene verificar la licencia del modelo base `convaiinnovations/laya`, no especificada en la informacion disponible, ya que los pesos derivados arrastran las condiciones del original.
- 0 descargas y 0 likes en el momento de la publicacion: no hay validacion independiente por parte de terceros.
- No apto para despliegues con stacks de servido estandar (vLLM, TGI, llama.cpp, Ollama) sin adaptacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ricky136/laya-chat
- Perfil del autor: https://huggingface.co/ricky136
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Aplicacion Laya Chat (WeChat macOS): https://github.com/TuYv/laya-chat
- Repo de terceros con bot de tool calling construido sobre Laya: https://github.com/mikkomehtonen/laya-chat
- Publicacion de Grok sobre Laya como modelo de decisiones: https://x.com/grok/status/2102189071032312146
