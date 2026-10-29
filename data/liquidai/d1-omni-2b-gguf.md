# LiquidAI/d1-Omni-2B-GGUF

## Resumen

d1-Omni-2B es un modelo de decisión (decision model) de Liquid AI para texto, imágenes, audio y vídeo, construido sobre LFM3-Omni-2B. A diferencia de un modelo generativo, no produce tokens: devuelve respuestas calibradas en un único forward pass sobre un conjunto fijo de resultados posibles. La variante aquí descrita, d1-Omni-2B-GGUF, es la cuantización en formato GGUF del modelo original, publicada para inferencia local en CPU y GPU mediante llama.cpp (soporte desde el build b11960, v0.8.0).

El modelo se enmarca en la familia LFM3 de Liquid AI, orientada a despliegue en edge y dispositivos, y adopta el paradigma que el autor denomina "system-one": preguntas cerradas tipadas (`noul` para sí/no, `choice` para elegir entre criterios, `score` para puntuar en una escala ordinal definida por el usuario) que se responden con probabilidades calibradas en lugar de texto libre. Esto reduce la latencia y evita la deriva típica de la decodificación autoregresiva en tareas de clasificación y enrutado.

Con 1.728.801.600 parámetros reales (comercializado como "2B") y soporte declarado para 16 idiomas, el modelo apunta a tareas de triaje, clasificación, enrutado y evaluación dentro de pipelines, más que a generación de contenido. Su relevancia ahora radica en que permite integrar clasificación multimodal calibrada en local, sin depender de APIs, con un endpoint HTTP dedicado (`/v1/systemone`) en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; el autor remite a la model card de d1-Omni-2B para los detalles. Construido sobre LFM3-Omni-2B (familia Liquid Foundation Models, etiqueta `lfm3`) |
| Parametros totales | 1.728.801.600 (dato real de safetensors del modelo base); denominado comercialmente 2B |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible. La model card indica que la pregunta se procesa en un unico batch, por lo que `-b` y `-ub` deben cubrir el estado y los medios adjuntos |
| Tipos de cuantizacion | Q8_0 (mencionada explicitamente en los ejemplos de la model card); el resto de cuantizaciones del repo no se detalla |
| Idiomas soportados | 16: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (`license: other`, con enlace a LICENSE en el repo) |
| Formato de pesos | GGUF (para llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento de d1-Omni-2B. La model card del GGUF remite explicitamente a la ficha del modelo original para "architecture and usage details", y los metadatos solo identifican la familia (LFM3, etiquetas `liquid`, `lfm3`, `edge`, `multimodal`, `system-one`) y el modelo base (LFM3-Omni-2B) sobre el que se construye.

La innovacion tecnica documentada es el paradigma de decisión: el modelo responde preguntas tipadas (`noul`, `choice`, `score`) definidas por el usuario junto con el estado (texto o JSON) y los medios adjuntos (imagen, audio o fotogramas de vídeo), y devuelve respuestas calibradas en un solo forward pass sin generar tokens. No se especifican en la informacion proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Preguntas de tipo `noul`: respuesta booleana (sí/no) sobre un estado, una imagen, un audio o un vídeo.
- Preguntas de tipo `choice`: elección entre un conjunto cerrado de opciones definidas con criterios y descripciones por parte del usuario (por ejemplo, enrutado a un equipo).
- Preguntas de tipo `score`: puntuación sobre una escala ordinal definida por el usuario (por ejemplo, "puede esperar" / "hoy" / "bloqueante ahora").
- Salida calibrada: el autor declara que devuelve probabilidades calibradas sobre el conjunto fijo de resultados, en lugar de texto generado.
- Inferencia en un único forward pass: no hay decodificación autoregresiva, por lo que la latencia no crece con la longitud de una "respuesta".
- Multimodalidad de entrada: texto o JSON como estado, imágenes, audio y vídeo (el vídeo se procesa como fotogramas y requiere `ffmpeg` en el `PATH`).
- Multilingüe: 16 idiomas declarados (en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl).
- Despliegue en edge: formato GGUF y soporte en llama.cpp desde b11960 (v0.8.0), con servidor HTTP y endpoint `/v1/systemone`.
- Preguntas múltiples por llamada: el JSON de ejemplo agrupa varias preguntas (`refund`, `team`, `urgency`) sobre el mismo estado, reutilizando el cómputo del contexto.

## Casos de uso

- Triaje de tickets de soporte: con `state` igual al texto del ticket y preguntas `choice` con criterios por equipo (facturación, técnico, fraude) y `score` de urgencia, el modelo devuelve en una sola pasada la asignación y la prioridad con probabilidades, lo que permite fijar umbrales de derivación a un humano.
- Enrutado de intenciones en asistentes de voz: enviando el audio del usuario como `files` y preguntas `choice` sobre la intención, se obtiene la categoría sin pasar por un pipeline ASR + LLM generativo, lo que reduce latencia y coste en despliegues on-device.
- Análisis de llamadas de contact center: sobre un clip de audio, preguntas `score` sobre tono (agitado / neutro / calmado) y `choice` sobre el tipo de intervención (petición, pregunta, discurso) permiten generar métricas agregadas de calidad sin transcripción previa.
- Verificación visual en inspección: con una imagen como entrada y preguntas `noul` ("¿está el animal sobre un sofá?"), el modelo sirve como verificador binario calibrado en flujos de control de calidad o moderación de imágenes.
- Moderación y clasificación de contenido con umbral: las probabilidades calibradas permiten definir puntos de corte y auditar la confianza; al no generar texto, la salida es estructurada y fácil de registrar.
- Enrutado de solicitudes de reembolso o incidencias de facturación: el ejemplo de la model card (cobro duplicado, pregunta `noul` de reembolso más `choice` de equipo y `score` de urgencia) se traslada directamente a un webhook de atención al cliente.
- Análisis de vídeo corto: procesando fotogramas con `ffmpeg` y formulando preguntas `noul` o `choice` sobre lo que ocurre (por ejemplo, un niño leyendo un libro), se obtienen etiquetas calibradas para indexado o filtrado previo.
- Evaluación automática de respuestas o sistemas: usar `score` con criterios ordinales para puntuar calidad de outputs en un pipeline de evaluación, con la ventaja de que la salida es una probabilidad y no una justificación generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del GGUF no incluye métricas de precisión, calibración (ECE, Brier), latencia ni throughput, ni comparaciones con otros modelos. Tampoco se detallan resultados por idioma ni por modalidad.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir de los 1,73 B de parámetros, no confirmada por el autor): en Q8_0, en torno a 1,8-2 GB solo para los pesos; en FP16, en torno a 3,5 GB. Hay que añadir la memoria de los codificadores de imagen y audio, cuyo tamaño no se detalla, y el estado de llama.cpp.
- El repo completo ocupa 10,3 GB, lo que incluye todas las cuantizaciones publicadas; para desplegar solo es necesario descargar el archivo de la cuantización elegida.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo cabe en GPUs de consumo (RTX 4090, RTX 4080, RTX 3090, e incluso tarjetas de 8 GB en cuantizaciones bajas), así como en A100/H100 para despliegues con concurrencia.
- CPU: el formato GGUF y el soporte en llama.cpp permiten inferencia en CPU; no se publican cifras de latencia en CPU.
- Opciones de despliegue: llama.cpp b11960 (v0.8.0) o superior, con `llama-server`. Ejemplo del autor: `llama-server -hf LiquidAI/d1-Omni-2B-GGUF:Q8_0 -b 8192 -ub 8192`. El endpoint de consulta es `/v1/systemone`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Restricción de batch: la pregunta se lee en un solo batch, por lo que `-b` y `-ub` deben cubrir el estado y los medios. Una imagen consume como máximo la mitad de `-ub`: con 8192 se mantiene el presupuesto completo de 4096 tokens por imagen; valores menores lo reducen.
- Vídeo: requiere `ffmpeg` disponible en el `PATH`, ya que la entrada se procesa como fotogramas.
- Latencia y throughput: no publicados. Cualitativamente, al resolver en un solo forward pass sin decodificación autoregresiva, la latencia debería ser estable y acotada, pero no hay cifras que lo respalden en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| d1-Omni-2B-GGUF (este) | 1,73 B (reales) | No disponible | GGUF | lfm1.0 | Decisión multimodal calibrada (texto, imagen, audio, vídeo) en un forward pass | HuggingFace, 750 descargas, 14 likes |
| d1-Omni-2B (modelo base) | 1,73 B (reales) | No disponible | Safetensors | lfm1.0 | Mismo modelo sin cuantizar; referencia para detalles de arquitectura | HuggingFace (LiquidAI/d1-Omni-2B) |
| LFM3-Omni-2B | No disponible | No disponible | Safetensors y GGUF | No disponible en la informacion | Modelo base generativo/multimodal sobre el que se construye d1-Omni-2B | HuggingFace (LiquidAI/LFM3-Omni-2B, LFM3-Omni-2B-GGUF) |
| d1-2B (variante texto) | No disponible | No disponible | No disponible | No disponible en la informacion | Decisión sobre texto, sin modalidad omni | Listado en liquid.ai/models |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- No es un modelo generativo: solo responde preguntas cerradas tipadas (`noul`, `choice`, `score`). No sirve para redactar, resumir ni mantener conversaciones abiertas.
- Limitaciones de llama.cpp: la model card indica que la selección múltiple (`"multiple": true`), la extracción, las estimaciones y las cajas (boxes) aún no están soportadas en esta integración.
- Dependencia del diseño de criterios: la calidad de las respuestas `choice` y `score` depende de cómo se definan las opciones y sus descripciones; un conjunto de criterios ambiguo degrada la calibración.
- Calibración no verificada: el autor afirma que las salidas están calibradas, pero no se publican métricas de calibración (ECE, Brier) ni resultados por idioma o modalidad en la informacion disponible.
- Riesgo de sesgo: no se documenta la composición del dataset de entrenamiento ni evaluaciones de sesgo; al ser un clasificador, puede amplificar sesgos presentes en los criterios definidos por el usuario o en sus datos de entrenamiento.
- Cobertura lingüística desigual: se declaran 16 idiomas, pero no hay resultados por idioma que permitan asumir un rendimiento homogéneo, especialmente fuera del inglés.
- Presupuesto de tokens para imagen: cada imagen consume como máximo la mitad de `-ub` (4096 tokens con 8192); si se reduce `-ub`, se recorta la resolución efectiva de la imagen y puede degradar la precisión.
- Requisito de `ffmpeg` para vídeo y procesamiento por fotogramas, lo que puede perder información temporal fina.
- Licencia lfm1.0 (marcada como `other`): es una licencia propia, no estándar; hay que revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que la informacion disponible no detalla sus restricciones.
- Estado del arte reciente: el repositorio se creó el 27 de octubre de 2026 y se actualizó el 28 de octubre de 2026; con 750 descargas, el ecosistema de herramientas y ejemplos en torno al endpoint `/v1/systemone` es todavía reducido.
- En produccion, conviene validar el modelo contra un conjunto etiquetado propio antes de fijar umbrales de decisión automatizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/d1-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- Modelo base de la familia: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Cuantización GGUF de la familia: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Blog de presentación: https://www.liquid.ai/blog/open-d1
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Página de modelos: https://www.liquid.ai/models
- Sitio principal: https://www.liquid.ai/
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Release b11960 de llama.cpp: https://github.com/ggml-org/llama.cpp/releases/tag/b11960
- Release v0.8.0 de llama.cpp: https://github.com/ggml-org/llama.cpp/releases/tag/v0.8.0
- Cookbook de Liquid AI: https://github.com/Liquid4All/cookbook
- Licencia (referenciada en el repo): LICENSE dentro de https://huggingface.co/LiquidAI/d1-Omni-2B-GGUF
