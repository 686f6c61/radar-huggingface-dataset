# ggml-org/d1-Omni-2B-GGUF

## Resumen

d1-Omni-2B es un modelo de decisión multimodal desarrollado originalmente por LiquidAI y convertido a formato GGUF por ggml-org. Se trata de un modelo de 1728 millones de parámetros (1.7B) que acepta entradas de texto, imagen, audio y vídeo, y está diseñado específicamente para ser invocado mediante el endpoint `/v1/systemone` de llama.cpp. Su denominación "decision model" indica que no es un modelo generativo al uso, sino un componente pensado para tomar decisiones dentro de un pipeline (por ejemplo, enrutamiento, clasificación o selección de acciones), lo que lo distingue de los LLM conversacionales convencionales.

La relevancia de esta ficha radica en que es una de las primeras implementaciones multimodales (audio, vídeo, imagen y texto) empaquetadas en GGUF y ejecutables localmente con llama.cpp, con un tamaño que cabe en GPUs de consumo. El modelo base es LiquidAI/d1-Omni-2B, distribuido bajo la licencia LFM 1.0 (lfm1.0), y esta versión GGUF está licenciada como "other" con referencia a la misma LFM 1.0. La conversión es automática mediante la herramienta ggml-org/convert y requiere llama.cpp b11960 o superior.

La información disponible sobre idiomas, benchmarks y datos de entrenamiento es escasa; la model card se limita a instrucciones de ejecución y notas técnicas sobre el manejo de entradas multimodales. Por tanto, varias filas de especificaciones se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal con encoder de visión y encoder de audio; arquitectura del transformer base no detallada) |
| Parámetros totales | 1.728.801.600 (≈1.73B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible como cifra nominal; requiere `-b`/`-ub` configurados para albergar el estado y los medios de la consulta (ejemplo con `-b 8192 -ub 8192`) |
| Tipos de cuantización | BF16 y Q8_0 (mismos tensores que los GGUF de LiquidAI); otras cuantizaciones GGUF no confirmadas |
| Idiomas soportados | No disponible |
| Licencia | LFM 1.0 (lfm1.0), marcada como "other" con enlace a la licencia de LiquidAI |
| Formato de pesos | GGUF (repo de 6.2 GB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del transformer base ni la composición del dataset de entrenamiento. Lo que sí se documenta es que el modelo es multimodal: el archivo `mmproj` contiene el encoder de visión y el encoder de audio, y el modelo acepta texto, imagen, audio y vídeo (el vídeo requiere `ffmpeg` disponible en `PATH`). El modelo se ejecuta como "decision model" mediante el endpoint `/v1/systemone` de llama.cpp, lo que sugiere un uso orientado a la toma de decisiones o clasificación más que a la generación libre de texto.

No se dispone de información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, attention lineal, etc.). La conversión a GGUF es automática mediante ggml-org/convert, y se indica que BF16 y Q8_0 comparten los mismos tensores que los GGUF oficiales de LiquidAI.

## Capacidades

- Entrada multimodal: texto, imagen, audio y vídeo (vídeo con `ffmpeg` en `PATH`).
- Modelo de decisión: uso previsto mediante el endpoint `/v1/systemone`, orientado a tomar decisiones dentro de un pipeline.
- Procesamiento de audio y texto (`audio-text-to-text` como pipeline tag).
- Procesamiento de imagen mediante encoder de visión incluido en `mmproj`.
- Conversacional (tag `conversational`).
- Compatible con endpoints (`endpoints_compatible`).
- Tool calling / function calling: no disponible en la información.
- Agentes y multi-step reasoning: no disponible en la información.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Modo thinking, salida de audio o otras capacidades especiales: no disponible.

## Casos de uso

- Enrutamiento de peticiones multimodales: usar el modelo como decisor para clasificar si una consulta entrante es texto, audio, imagen o vídeo y derivarla al componente adecuado del sistema, aprovechando su entrada multimodal y el endpoint `/v1/systemone`.
- Moderación y clasificación de contenido audiovisual: analizar audio e imagen de una entrada para decidir si cumple políticas, dado que el modelo integra encoders de visión y audio en un único `mmproj`.
- Transcripción y análisis de reuniones: procesar audio de una reunión y emitir decisiones estructuradas (por ejemplo, extracción de acciones) usando la ventana configurada con `-b`/`-ub` para albergar el estado completo de la consulta.
- Asistentes de atención al cliente con entrada de voz: recibir audio del usuario y decidir la intención o ruta de escalado, con despliegue local en llama.cpp sin dependencia de servicios en la nube.
- Análisis de vídeo para control de calidad: con `ffmpeg` en `PATH`, alimentar clips cortos al modelo para decidir si un fotograma o segmento requiere revisión humana.
- Automatización de pipelines de decisión en CI/CD o backoffice: invocar el modelo vía API `/v1/systemone` para clasificar artefactos o incidencias con contexto de hasta 8192 tokens (configuración de ejemplo), ejecutándose en hardware de consumo gracias a su tamaño de 1.7B.
- Prototipado de agentes multimodales locales: usar el modelo como componente de decisión dentro de un agente mayor, combinando texto e imagen en una sola llamada por lote.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para 1.73B parámetros, en BF16 ≈3.5 GB solo de pesos, más el `mmproj` (encoders de visión y audio) y el estado de la consulta; en Q8_0 ≈1.8 GB de pesos. Cifras orientativas calculadas a partir del número de parámetros, no publicadas por el autor.
- GPU recomendadas: no especificadas por el autor; por tamaño, GPUs de consumo con 8 GB o más deberían albergar Q8_0 con margen para el `mmproj` y el contexto.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060/4060/4090 y similares), aunque no confirmado oficialmente.
- Opciones de despliegue: llama.cpp (requiere b11960 o superior), `llama serve` con `-hf ggml-org/d1-Omni-2B-GGUF -b 8192 -ub 8192`, y la app Llama (llama.app). vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. Nota importante: con `-ub 512` (valor por defecto) las entradas largas se rechazan y las imágenes reciben un presupuesto de tokens menor, lo que altera las respuestas; hay que ajustar `-b` y `-ub` al tamaño del estado y los medios.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ggml-org/d1-Omni-2B-GGUF (este) | 1.73B | Configurable vía `-b`/`-ub` (ej. 8192) | Texto, imagen, audio, vídeo | LFM 1.0 | GGUF en HF |
| LiquidAI/d1-Omni-2B (base) | 1.73B | No disponible | Texto, imagen, audio, vídeo | LFM 1.0 | Pesos originales en HF |
| LiquidAI/d1-Omni-2B-GGUF | 1.73B | No disponible | Texto, imagen, audio, vídeo | LFM 1.0 | GGUF oficial en HF |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos multimodales de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no generativo general: está pensado para invocarse vía `/v1/systemone`; usarlo como LLM conversacional convencional puede dar resultados no previstos.
- Configuración de contexto crítica: con `-ub 512` (por defecto) las entradas largas se rechazan y las imágenes reciben menos tokens, cambiando las respuestas; es necesario ajustar `-b` y `-ub`.
- Dependencia de `ffmpeg` en `PATH` para entradas de vídeo.
- Requiere llama.cpp b11960 o superior; versiones anteriores no son compatibles.
- Conversión automática mediante ggml-org/convert: posibles diferencias respecto a los pesos originales, aunque se indica que BF16 y Q8_0 comparten tensores con los GGUF de LiquidAI.
- Idiomas soportados no documentados; riesgo de comportamiento deficiente en idiomas distintos del entrenamiento.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no evaluado en la información disponible.
- Licencia LFM 1.0: restricciones para uso comercial no detalladas en esta ficha; consultar el enlace de licencia de LiquidAI antes de desplegar en producción.
- Benchmarks y rendimiento no publicados: no se puede garantizar calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggml-org/d1-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- GGUF oficial de LiquidAI: https://huggingface.co/LiquidAI/d1-Omni-2B-GGUF
- Licencia LFM 1.0: https://huggingface.co/LiquidAI/d1-Omni-2B/blob/main/LICENSE
- PR de llama.cpp con `/v1/systemone`: https://github.com/ggml-org/llama.cpp/pull/31275
- Herramienta de conversión: https://github.com/ggml-org/convert
- App Llama: https://llama.app
