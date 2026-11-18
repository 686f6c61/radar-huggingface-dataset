# LiquidAI/d1-omni-600M-GGUF

## Resumen

d1-omni-600M es un modelo de decisión desarrollado por Liquid AI que responde preguntas tipadas y con nombre sobre un estado multimodal (texto, JSON, imágenes o audio) en un único forward pass, sin generar tokens. A diferencia de un LLM generativo convencional, el modelo recibe un estado y un conjunto de preguntas con tipos predefinidos (`noul`, `choice`, `score`) y devuelve directamente las respuestas, lo que lo sitúa en la categoría de modelos "system-one" orientados a clasificación, extracción y calibración.

La versión publicada aquí es la cuantización GGUF del modelo base `LiquidAI/d1-omni-600M`, pensada para ejecutarse con llama.cpp en entornos edge. El modelo forma parte de la familia LFM2.5 de Liquid AI y combina capacidades de visión y audio con procesamiento de texto en 15 idiomas. El checkpoint real en safetensors contiene 380.732.161 parámetros, aunque el nombre comercial del modelo haga referencia a 600M.

Su relevancia actual reside en la propuesta de sustituir llamadas a LLM generativos por un modelo pequeño y determinista para tareas de enrutamiento, clasificación y evaluación, con menor coste computacional y latencia al no producir tokens de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (familia LFM2.5 de Liquid AI, modelo de decisión multimodal) |
| Parametros totales | 380.732.161 (safetensors); nombre comercial 600M |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible como cifra oficial; el ejemplo de llama.cpp usa `-b 4096 -ub 4096` y sugiere hasta 16384 para estados largos |
| Tipos de cuantizacion | GGUF (el ejemplo usa Q8_0; el repo incluye varias cuantizaciones) |
| Idiomas soportados | en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh |
| Licencia | lfm1.0 (licencia propia de Liquid AI, marcada como "other") |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

No se dispone de detalles técnicos sobre la arquitectura interna en la información proporcionada. El modelo se enmarca en la familia LFM2.5 de Liquid AI y se describe como un modelo de decisión "system-one" que procesa el estado completo en un único forward pass sin decodificación autoregresiva. Integra codificadores multimodales para imagen y audio, ya que acepta estados compuestos por texto, JSON, imágenes y clips de audio de hasta 30 segundos.

Tampoco se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si se emplearon técnicas de RLHF, DPO o calibración específica, más allá de la etiqueta "calibration" en los tags del repositorio. La innovación principal declarada es el paradigma de preguntas tipadas con respuesta directa en un solo paso, que elimina la generación de tokens y, con ello, el coste asociado a la decodificación.

## Capacidades

- Respuesta a preguntas tipadas sobre un estado: tipos `noul` (sí/no), `choice` (selección entre criterios con etiqueta) y `score` (puntuación sobre una escala de criterios ordenados).
- Procesamiento de estados multimodales: texto plano, JSON, imágenes y audio (hasta 30 s por petición).
- Procesamiento conjunto de imagen y texto en una misma petición (pipeline `image-text-to-text`).
- Procesamiento de audio y texto en una misma petición (una petición lleva imágenes o un clip de audio, no ambos).
- Soporte multilingüe en 15 idiomas: inglés, alemán, español, francés, italiano, neerlandés, polaco, portugués, árabe, hindi, japonés, ruso, turco, vietnamita y chino.
- Extracción de características (`feature-extraction` según los tags del repositorio).
- Clasificación y enrutamiento con criterios definidos por el usuario en la propia petición.
- No genera texto libre: la salida son respuestas estructuradas a las preguntas planteadas.
- No se documenta soporte de tool calling ni de razonamiento multi-paso en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y responde a preguntas `choice` sobre el equipo responsable (facturación, técnico, fraude) y a preguntas `score` sobre urgencia, tal como muestra el ejemplo de la model card con el endpoint `/v1/systemone`.
- Moderación y triaje de contenido: clasificación de mensajes o publicaciones mediante preguntas `noul` y `score` sobre categorías predefinidas, aprovechando el forward pass único para obtener latencia baja en pipelines de alto volumen.
- Verificación visual en flujos de atención al cliente: con una foto adjunta como estado, responder preguntas `choice` sobre el tipo de producto o el estado del artículo y preguntas `noul` sobre condiciones concretas (por ejemplo, si el producto aparece dañado).
- Análisis de llamadas y grabaciones cortas: con un clip de audio de hasta 30 s, clasificar el tipo de intervención (petición, pregunta, discurso) y puntuar el tono del hablante, útil en control de calidad de centros de contacto.
- Extracción de campos estructurados desde JSON: dado un registro JSON como estado, responder preguntas tipadas para validar campos, asignar categorías o puntuar niveles de riesgo sin necesidad de un LLM generativo.
- Clasificación multilingüe en producción: al cubrir 15 idiomas, puede desplegarse como clasificador único para tráfico internacional sin modelos separados por idioma.
- Prefiltrado en pipelines RAG o de agentes: usar el modelo como primera etapa determinista que decide si una consulta requiere escalado a un LLM mayor, reduciendo coste y latencia en la mayoría de peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: un modelo de 380M parámetros en Q8_0 ocupa aproximadamente 0,4 GB de pesos; en Q4, alrededor de 0,25 GB. A ello hay que sumar la memoria del contexto, que con 4096 tokens de batch y estados multimodales puede elevar el consumo total a varios GB.
- GPU recomendadas: al ser un modelo edge, funciona en GPU consumer (RTX 3060, RTX 4060, RTX 4090) y en hardware integrado. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4-8 GB de VRAM según cuantización y longitud del estado.
- Despliegue: llama.cpp mediante `llama-server` con el endpoint `/v1/systemone`; el ejemplo oficial es `llama-server -hf LiquidAI/d1-omni-600M-GGUF:Q8_0 -b 4096 -ub 4096`.
- Parámetros de batch: `-b` y `-ub` deben cubrir la pregunta completa en un solo batch; 4096 cubre cualquier imagen y estados de pocos miles de tokens, y se recomienda subir hasta 16384 para estados más largos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni de modelos comparables de la misma categoría (modelos de decisión multimodales pequeños) en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo respuestas a preguntas tipadas (`noul`, `choice`, `score`). No sirve para chat, redacción ni generación de código.
- Una petición admite imágenes o un único clip de audio (máximo 30 s), pero no ambos a la vez.
- El estado puede ser `null` solo cuando las imágenes o el audio constituyen todo el estado.
- El contexto efectivo depende de la configuración de `-b`/`-ub` en llama.cpp; estados largos requieren aumentar estos parámetros hasta 16384, con el coste de memoria asociado.
- Licencia `lfm1.0` (marcada como "other"): es una licencia propia de Liquid AI, no una licencia open source estándar; conviene revisar sus términos antes de uso comercial.
- No se han publicado benchmarks en la información disponible, por lo que el rendimiento real frente a alternativas no puede verificarse con datos.
- Riesgo de alucinación no documentado para este modelo; al no generar tokens, el modo de fallo principal sería una clasificación o puntuación incorrecta, cuya calibración no se ha verificado con datos públicos.
- Sesgos conocidos: no disponibles en la información proporcionada.
- El nombre comercial "600M" no coincide con el recuento real de parámetros en safetensors (380.732.161), lo que puede inducir a error al estimar requisitos de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/d1-omni-600M-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Model card original: https://huggingface.co/LiquidAI/d1-omni-600m
- Liquid AI: https://www.liquid.ai/
- Playground: https://playground.liquid.ai/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Discord: https://discord.com/invite/liquid-ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia: https://huggingface.co/LiquidAI/d1-omni-600M-GGUF/blob/main/LICENSE
