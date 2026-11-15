# davidxifeng/LiquidAI-d1-Omni-2B-8bit-uzu

## Resumen

d1-Omni-2B es un modelo de decisión multimodal desarrollado por Liquid AI, construido sobre LFM3-Omni-2B. A diferencia de los modelos generativos convencionales, devuelve respuestas calibradas en un único forward pass sin generar tokens de forma autorregresiva, lo que lo sitúa en la categoría de modelos "System One" orientados a decisiones rápidas sobre texto, imágenes, vídeo y audio.

El modelo resuelve tareas de clasificación, extracción de entidades (texto, números, fechas con sus spans), localización de objetos en imágenes y estimación de cantidades con intervalos de confianza. Su rasgo diferencial es el tratamiento nativo del audio: las preguntas habladas obtienen puntuaciones dentro de 0,5 puntos de las escritas en tareas no vistas, procesándose en la misma pasada que el texto y las imágenes.

La ficha que nos ocupa no es el modelo original, sino una conversión a 8 bits (q-bits=8, group_size=64) realizada por el usuario davidxifeng para el motor de inferencia `uzu`, acelerado por Metal. Con 1.830.021.888 parámetros reales según safetensors y un repositorio de 2,5 GB, está pensada para despliegue en hardware Apple Silicon mediante el servidor `uzu-engine` y su WebUI integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LFM3) con cabecera de decisión; pesos en 8 bits para motor uzu |
| Parametros totales | 1.830.021.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (q-bits=8, group_size=64) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (model.safetensors, vision.safetensors, audio.safetensors) + config.json, vision_config.json, audio_config.json, d1_config.json, calibration.json, tokenizer.json, encoding.json |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B pertenece a la familia LFM3 de Liquid AI, que incluye variantes base, de texto, visión, audio, omni y de decisión. d1-Omni-2B añade capacidad de audio a d1-2B y opera como un modelo de decisión: en lugar de generar secuencias token a token, produce una respuesta calibrada en un único forward pass. Esta conversión concreta elimina los tensores de generación de audio no utilizados (`depth_decoder`, `codebook_embedding`), ya que d1-Omni-2B solo realiza decisiones System One sobre texto, imágenes, vídeo y audio.

La conversión a 8 bits emplea cuantización por grupos (group_size=64) e incluye un fichero `calibration.json`, lo que sugiere un proceso de calibración para preservar la calidad de las decisiones tras la cuantización. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo original. La innovación principal es el paradigma de decisión en una sola pasada con latencias de milisegundos: 5,8 ms por decisión en NVIDIA H100 y 3,7 ms en AMD MI325X, o 12,4 ms y 8,2 ms respectivamente con un clip de 10 segundos.

## Capacidades

- Decisión calibrada multimodal sobre texto, imágenes, vídeo y audio en un único forward pass, sin generación autorregresiva de tokens.
- Audio nativo: clips y preguntas habladas se procesan en la misma pasada que texto e imágenes, con rendimiento casi idéntico al texto escrito (diferencia inferior a 0,5 puntos en tareas no vistas).
- Clasificación de contenido con respuestas calibradas.
- Extracción de entidades: texto, números y fechas con sus spans correspondientes.
- Localización de objetos en imágenes.
- Estimación de cantidades con intervalos de confianza.
- Soporte multilingüe en 16 idiomas (en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl).
- Integración con el motor `uzu` mediante endpoint `POST /v1/decisions` (o `/v1/systemone`) y WebUI "System One Decision Workbench".
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Moderación de contenido multimodal en tiempo real: el modelo puede clasificar texto, imágenes y audio en milisegundos (5,8 ms en H100), lo que permite filtrar flujos de contenido en producción sin introducir latencia perceptible en la experiencia de usuario.
- Extracción estructurada de datos de documentos: gracias a su capacidad de extraer texto, números y fechas con sus spans, resulta adecuado para pipelines de digitalización de facturas, contratos o formularios donde se necesita localizar y normalizar campos concretos.
- Asistentes de voz con decisión rápida: al procesar audio nativo en la misma pasada que el texto y mantener el rendimiento en preguntas habladas, puede emplearse en interfaces conversacionales por voz que requieran clasificar intenciones o extraer parámetros sin transcripción intermedia.
- Detección y localización de objetos en imágenes: útil en sistemas de control de calidad industrial o análisis de inventario donde se necesita identificar objetos y estimar cantidades con intervalos de confianza.
- Enrutamiento inteligente de consultas: el modelo puede clasificar peticiones entrantes (tipo de tarea, idioma, urgencia) para dirigirlas al modelo o servicio adecuado dentro de una arquitectura multi-modelo, aprovechando su latencia de milisegundos.
- Análisis de vídeo y audio para monitorización: con latencias de 12,4 ms (H100) y 8,2 ms (MI325X) sobre clips de 10 segundos, es viable en escenarios de análisis continuo de streams de audio o vídeo.
- Despliegue en dispositivos Apple Silicon: la conversión a 8 bits para el motor `uzu` con aceleración Metal permite ejecutar el modelo localmente en Mac, habilitando aplicaciones de escritorio con inferencia privada sin conexión a la nube.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son las latencias de inferencia:

| Metrica | NVIDIA H100 | AMD MI325X |
|---|---|---|
| Latencia por decisión | 5,8 ms | 3,7 ms |
| Latencia con clip de 10 s | 12,4 ms | 8,2 ms |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB de pesos en 8 bits, más overhead de activaciones y contexto; no se especifica un mínimo exacto.
- GPU recomendadas: NVIDIA H100 y AMD MI325X son las referencias de latencia publicadas por el autor del modelo base.
- Cabe en GPU de consumo: la cuantización a 8 bits con 2,5 GB de pesos sugiere viabilidad en GPUs consumer con 8 GB o más de VRAM, aunque no se confirma oficialmente.
- Despliegue específico: motor `uzu` (uzu-engine y cli) con aceleración Metal, pensado para Apple Silicon. Comando de ejemplo: `cargo run --release -p cli -- server --model ./LiquidAI-d1-Omni-2B-8bit-uzu --port 18080`.
- Endpoints: `POST /v1/decisions` o `/v1/systemone`, más WebUI en `http://127.0.0.1:18080/`.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible en la información proporcionada; la conversión está orientada específicamente a `uzu`.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-Omni-2B-8bit-uzu (esta ficha) | 1,83 B | no disponible | Decisión multimodal 8-bit para uzu | lfm1.0 | Hugging Face (conversión comunitaria) |
| LiquidAI/d1-Omni-2B | no disponible | no disponible | Decisión multimodal (original) | lfm1.0 | Hugging Face (oficial) |
| LiquidAI/d1-2B | no disponible | no disponible | Decisión solo texto | lfm1.0 | Hugging Face (oficial) |
| LiquidAI/LFM3-Omni-2B | no disponible | no disponible | Modelo omni generativo (base) | lfm1.0 | Hugging Face (oficial) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión comunitaria (davidxifeng), no oficial de Liquid AI; la calidad tras la cuantización a 8 bits depende del proceso de calibración y no está verificada por el desarrollador original.
- Diseñada exclusivamente para el motor `uzu` con aceleración Metal; no es directamente compatible con transformers estándar ni con otros runtimes sin conversión adicional, pese a la etiqueta `transformers` y `custom_code`.
- El modelo realiza solo decisiones System One: no genera texto libre ni audio; los tensores de generación de audio han sido eliminados deliberadamente.
- Riesgo de calibración degradada en dominios alejados de los datos de calibración; las confianzas devueltas deben validarse en producción.
- Licencia lfm1.0 (license: other): es necesario revisar los términos del fichero LICENSE del modelo base para uso comercial, ya que las restricciones concretas no se detallan en la información disponible.
- No se han publicado datos sobre sesgos, tasa de alucinación ni limitaciones idiomáticas específicas más allá de la lista de idiomas soportados.
- Longitud de contexto no documentada, lo que dificulta planificar su uso con entradas largas.
- Sin descargas ni likes en el momento de la consulta: ecosistema de usuarios y soporte comunitario prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidxifeng/LiquidAI-d1-Omni-2B-8bit-uzu
- Modelo base oficial: https://huggingface.co/LiquidAI/d1-Omni-2B
- LFM3-Omni-2B: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- d1-2B: https://huggingface.co/LiquidAI/d1-2B
- Colección LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Repositorio del motor uzu: https://github.com/davidxifeng/uzu
- Blog de lanzamiento de open d1: https://www.liquid.ai/blog/open-d1
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola API: https://console.liquid.ai/dashboard
