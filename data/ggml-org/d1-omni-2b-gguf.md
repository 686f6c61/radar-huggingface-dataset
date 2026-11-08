# ggml-org/d1-Omni-2B-GGUF

## Resumen

d1-Omni-2B es un modelo de decisión multimodal desarrollado por Liquid AI, distribuido en formato GGUF por el equipo de ggml-org para su uso con llama.cpp. Se construye sobre LFM3-Omni-2B y está diseñado para responder preguntas sobre entradas de texto, imagen, audio y vídeo devolviendo una respuesta calibrada en un único paso forward, sin generar tokens de forma autorregresiva. Esta aproximación lo aleja de los modelos conversacionales convencionales y lo orienta a tareas de clasificación, verificación y decisión sobre contenido multimodal.

El modelo cuenta con 1.728.801.600 parámetros (aproximadamente 2B, de ahí su nombre) y se distribuye bajo licencia LFM 1.0. Su integración con llama.cpp se realiza a través de un endpoint específico (`/v1/systemone`) y requiere la versión `b11960` o superior. El repositorio GGUF ocupa 6,2 GB e incluye un fichero mmproj que aloja los codificadores de visión y audio.

La relevancia de este modelo radica en su enfoque de "decisión en un solo paso", que reduce la latencia frente a modelos generativos para tareas donde la salida es una respuesta corta y calibrada. Al estar empaquetado en GGUF, puede ejecutarse en hardware de consumo mediante llama.cpp, lo que facilita su despliegue local en escenarios de evaluación multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (construido sobre LFM3-Omni-2B; modelo de decisión con codificadores de visión y audio) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (requiere `-b` y `-ub` de 8192 para entradas largas; por defecto `-ub 512` rechaza entradas más largas) |
| Tipos de cuantizacion | GGUF cuantizado; se mencionan BF16 y Q8_0 con los mismos tensores que los GGUF oficiales de LiquidAI |
| Idiomas soportados | no disponible |
| Licencia | LFM 1.0 (lfm1.0) |
| Formato de pesos | GGUF (con fichero mmproj para visión y audio) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo se describe como un "decision model" construido sobre LFM3-Omni-2B, con capacidad de procesar texto, imagen, audio y vídeo. La característica diferencial es que devuelve respuestas calibradas en un único paso forward, sin decodificación autorregresiva de tokens, lo que implica una arquitectura orientada a la clasificación o puntuación de entradas multimodales en lugar de a la generación de secuencias.

El repositorio GGUF incluye un fichero mmproj que contiene el codificador de visión y el codificador de audio. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La conversión a GGUF se realiza automáticamente mediante la herramienta de ggml-org.

## Capacidades

- Procesamiento de entradas multimodales: texto, imagen, audio y vídeo (el vídeo requiere `ffmpeg` en el `PATH`).
- Modelo de decisión: devuelve una respuesta calibrada en un solo paso forward, sin generar tokens.
- Integración con llama.cpp mediante el endpoint `/v1/systemone`.
- Codificadores de visión y audio incluidos en el fichero mmproj.
- Compatible con endpoints (tag `endpoints_compatible`).
- Orientado a uso conversacional según los tags del repositorio, aunque su naturaleza es de decisión.
- No se documentan capacidades de tool calling, agentes multi-paso ni modo thinking.

## Casos de uso

- Clasificación multimodal de contenido: el modelo puede recibir una imagen o un audio junto con una pregunta y devolver una decisión calibrada en un solo paso, adecuado para moderación o etiquetado automático.
- Verificación de respuestas sobre audio: dada una grabación y una afirmación, el modelo evalúa si la afirmación es correcta sin generar texto libre, lo que simplifica la integración en pipelines de validación.
- Análisis de vídeo para detección de eventos: con `ffmpeg` disponible, se pueden procesar fotogramas y audio para decidir si se cumple una condición concreta, útil en monitorización automatizada.
- Evaluación de calidad de imágenes generadas: el modelo puede puntuar o clasificar imágenes frente a un criterio dado en un único forward, reduciendo la latencia frente a modelos generativos.
- Filtrado previo en sistemas RAG multimodales: antes de invocar un modelo generativo grande, d1-Omni-2B puede decidir si un documento, imagen o audio es relevante para la consulta, ahorrando cómputo.
- Despliegue local en estaciones de trabajo: al estar en GGUF y ejecutarse con llama.cpp, permite prototipar decisiones multimodales en hardware de consumo sin depender de APIs externas.
- Asistencia en accesibilidad: clasificación de audio para detectar eventos sonoros relevantes o verificar transcripciones en un solo paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 1,73B parámetros, en BF16 serían necesarios aproximadamente 3,5 GB solo para los pesos, más el codificador de visión y audio del mmproj; en Q8_0, alrededor de 1,8 GB para los pesos. El repositorio completo ocupa 6,2 GB.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, cabría en GPUs de consumo con 8 GB o más de VRAM en cuantizaciones Q8_0 o inferiores, aunque no se confirma oficialmente.
- Cabe en GPU de consumo: probablemente sí en GPUs con 8-12 GB de VRAM, sujeto a la memoria del mmproj y al tamaño de lote requerido (`-b 8192 -ub 8192` para entradas largas).
- Opciones de despliegue: llama.cpp (versión `b11960` o superior), Llama app y `llama serve`. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. Al ser un modelo de decisión de un solo paso, se espera menor latencia que un modelo generativo equivalente, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| d1-Omni-2B (este) | 1,73B | no disponible | texto, imagen, audio, vídeo | LFM 1.0 | GGUF |
| LiquidAI/d1-Omni-2B (original) | 1,73B | no disponible | texto, imagen, audio, vídeo | LFM 1.0 | safetensors/GGUF oficial |
| LFM3-Omni-2B (base) | no disponible | no disponible | texto, imagen, audio | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no debe esperarse que produzca texto libre largo; su uso previsto es mediante el endpoint `/v1/systemone`.
- Requiere configuración de lote específica: con `-ub 512` por defecto, las entradas largas se rechazan y las imágenes reciben un presupuesto de tokens menor, lo que altera las respuestas. Es necesario usar `-b 8192 -ub 8192` para entradas largas.
- Dependencia de versión: requiere llama.cpp `b11960` o superior.
- El procesamiento de vídeo necesita `ffmpeg` en el `PATH`.
- Licencia LFM 1.0: es necesario revisar los términos en el enlace oficial antes de un uso comercial; la licencia se etiqueta como "other".
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- Al ser una conversión automática a GGUF, pueden existir diferencias sutiles respecto a los pesos originales, aunque el autor indica que BF16 y Q8_0 comparten tensores con los GGUF de LiquidAI.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/d1-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- GGUF oficial de LiquidAI: https://huggingface.co/LiquidAI/d1-Omni-2B-GGUF
- Licencia: https://huggingface.co/LiquidAI/d1-Omni-2B/blob/main/LICENSE
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31275
- Herramienta de conversión: https://github.com/ggml-org/convert
- Llama app: https://llama.app
