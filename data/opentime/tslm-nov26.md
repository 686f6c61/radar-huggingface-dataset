# opentime/tslm-nov26

## Resumen

tslm-nov26 es un modelo de series temporales construido sobre el modelo de lenguaje google/gemma-3-4b-pt mediante la arquitectura OpenTSLM Flamingo (clase `OpenTSLMFlamingo`). Lo desarrolla el usuario opentime y corresponde a la ejecución de entrenamiento `02102bec679e4f3d985a884d3f5b2bdf` del model_factory, en el paso 80000. El modelo resuelve la tarea de razonamiento sobre series temporales: combina un codificador específico de series temporales con un backbone de lenguaje congelado, de modo que el LLM puede interpretar y razonar sobre datos secuenciales numéricos expresados en lenguaje natural.

La innovación principal es el esquema de entrenamiento: el backbone Gemma 3 4B permaneció congelado, y solo se entrenaron el codificador de series temporales, el resampler tipo perceiver y las capas de atención cruzada con compuerta (gated cross-attention). Esto permite adaptar un LLM preentrenado a un dominio completamente distinto sin reentrenar sus miles de millones de parámetros. El modelo tiene 5.241.692.050 parámetros totales almacenados en `model.safetensors` en bfloat16/float32, y el repositorio ocupa 33,9 GB.

Es relevante ahora porque demuestra una vía de bajo coste para especializar modelos de lenguaje open source en dominios numéricos y de series temporales, un área donde los LLM genéricos rinden mal por su tokenización de números y su falta de sesgo inductivo temporal. La ficha se basa exclusivamente en la información publicada en Hugging Face; no hay datos de benchmarks, idiomas ni pipeline declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenTSLM Flamingo: backbone Gemma 3 4B congelado + codificador de series temporales + resampler perceiver + capas de atencion cruzada con compuerta |
| Parametros totales | 5.241.692.050 (state_dict en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 y float32) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (modelo derivado de Gemma) |
| Formato de pesos | safetensors (`model.safetensors`), config.json, tokenizer.json, tokenizer.model, generation_config.json |
| Modelo base | google/gemma-3-4b-pt |
| Libreria | pytorch |
| Tamano del repositorio | 33,9 GB |
| Paso de entrenamiento | 80000 |
| Region | us |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón Flamingo aplicado a series temporales. Un codificador específico procesa la serie temporal de entrada, cuyas representaciones pasan por un resampler tipo perceiver que las comprime en un número fijo de tokens latentes. Estos tokens se inyectan en el modelo de lenguaje Gemma 3 mediante capas de atención cruzada con compuerta intercaladas. El backbone Gemma 3 4B se mantuvo congelado durante todo el entrenamiento; solo se actualizaron el codificador de series temporales, el resampler y las capas de atención cruzada. El modelo se entrenó desde el checkpoint preentrenado `google/gemma-3-4b-pt`, no desde una versión instruida.

El tokenizador es el de Gemma 3 con tres tokens adicionales de Flamingo: `<image>`, `<image_soft_token>` y `<|endofchunk|>`. El `state_dict` almacenado contiene 5.241.692.050 parámetros; el wrapper Flamingo registra algunos módulos bajo dos nombres, y esas 188 claves alias no se almacenan por duplicado, sino que su mapeo (alias -> clave almacenada) figura en los metadatos de safetensors bajo la clave `aliases`. Para cargar el modelo es necesaria la clase `OpenTSLMFlamingo` del código de OpenTSLM. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Razonamiento sobre series temporales: interpreta datos secuenciales numéricos y responde preguntas en lenguaje natural sobre ellos.
- Generación de texto: hereda las capacidades del backbone Gemma 3 4B, aunque el entrenamiento se centró en la modalidad de series temporales.
- Procesamiento multimodal: el wrapper Flamingo permite combinar entradas de series temporales con texto.
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no disponibles en la información publicada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo está especializado en series temporales, no en visión.

## Casos de uso

- Predicción y análisis de demanda energética: el modelo puede recibir una serie de consumo eléctrico y responder preguntas sobre tendencias, estacionalidad o valores esperados, aprovechando el codificador temporal y el razonamiento del LLM.
- Monitorización de métricas de infraestructura: integrado en un pipeline de observabilidad, puede interpretar series de latencia, CPU o errores y generar diagnósticos en lenguaje natural para el equipo de guardia.
- Análisis financiero de series de precios: permite consultas en lenguaje natural sobre series históricas de cotizaciones o tipos de cambio, combinando la representación numérica con el conocimiento del backbone.
- Detección y explicación de anomalías en sensores industriales: el modelo puede describir qué tramos de una serie se desvían del comportamiento esperado y proponer hipótesis, útil en mantenimiento predictivo.
- Investigación en modelos de series temporales: sirve como base para experimentos de adaptación de LLM a dominios numéricos mediante congelación del backbone, un patrón reproducible con bajo coste de entrenamiento.
- Asistentes de análisis de datos para equipos de BI: permite formular preguntas en lenguaje natural sobre series temporales cargadas en un cuadro de mando, reduciendo la necesidad de escribir consultas.
- Docencia y divulgación: útil para demostrar cómo se acopla un codificador de dominio a un LLM congelado mediante atención cruzada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el `state_dict` ocupa 33,9 GB en el repositorio (bfloat16/float32); en bfloat16 los pesos rondan los 10,5 GB, pero el requisito real depende del codificador temporal y de las capas de atención cruzada, no cuantificados en la información disponible.
- GPU recomendadas: no especificadas por el autor; por tamaño del backbone (Gemma 3 4B), una GPU con 24 GB o más (RTX 4090, A100 40 GB, H100) es un punto de partida razonable.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas de 24 GB en bfloat16 si se aplica cuantización, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: no disponibles; el autor indica que la carga requiere la clase `OpenTSLMFlamingo` del código de OpenTSLM, por lo que no se puede usar directamente con vLLM, llama.cpp u Ollama sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tslm-nov26 | 5.241.692.050 | no disponible | Series temporales (OpenTSLM Flamingo) | Gemma Terms of Use | Hugging Face |
| google/gemma-3-4b-pt | 4B (backbone) | no disponible en esta ficha | Lenguaje general | Gemma Terms of Use | Hugging Face |
| Chronos (Amazon) | no disponible | no disponible | Series temporales | no disponible | no disponible |
| TimesFM (Google) | no disponible | no disponible | Series temporales | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El backbone Gemma 3 está congelado: el modelo no ha sido ajustado en sus capacidades lingüísticas generales, solo en la integración de series temporales.
- No hay información publicada sobre sesgos, datos de entrenamiento ni evaluación de calidad; el riesgo de alucinación en las respuestas verbales es el propio del backbone Gemma 3 4B.
- El repositorio no declara idiomas soportados ni pipeline; no se puede asumir un rendimiento multilingüe.
- La licencia es la Gemma Terms of Use, que restringe usos según la Gemma Prohibited Use Policy; es obligatorio revisarla antes de cualquier uso comercial.
- La carga requiere código específico (`OpenTSLMFlamingo`); no es un modelo plug-and-play con las herramientas estándar de inferencia.
- El `state_dict` contiene 188 claves alias que no están duplicadas; si no se aplica el mapeo de metadatos, la carga puede fallar o quedar incompleta.
- No hay benchmarks publicados: no se puede validar su rendimiento frente a alternativas especializadas en series temporales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/opentime/tslm-nov26
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Términos de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Código de OpenTSLM: no disponible en la información proporcionada
