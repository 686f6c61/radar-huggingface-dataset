# mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF

## Resumen

Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic es un modelo de lenguaje obtenido mediante la fusión (merge) de varios modelos derivados de la familia Qwen 3.5, empleando la técnica SLERP (Spherical Linear Interpolation) en un esquema de 2xMerge. El autor original del modelo fusionado es xtools-at, mientras que esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher. El modelo se presenta como una variante "heretic" (descensurada) orientada a razonamiento, generación de código, uso de herramientas y matemáticas.

El modelo se distribuye con licencia Apache 2.0 y declara soporte para cinco idiomas: inglés, chino, español, ruso y japonés. Está pensado para su uso con `transformers` y, gracias a esta conversión, también con llama.cpp y otras herramientas compatibles con GGUF. El repositorio incluye únicamente cuantizaciones estáticas y ficheros mmproj (suplemento multimodal), lo que sugiere que el modelo base incorpora capacidades de visión, aunque la información disponible no detalla la arquitectura interna.

Un dato relevante y llamativo es la discrepancia entre el nombre del modelo ("4B") y el recuento real de parámetros en safetensors: 333.514.240 parámetros (aproximadamente 333 millones), lo que no concuerda con la denominación "4B". Esta discrepancia debe tenerse en cuenta al planificar el despliegue, ya que las estimaciones de memoria basadas en "4B" serían incorrectas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica base Qwen 3.5; fusión SLERP 2xMerge) |
| Parametros totales | 333.514.240 (según safetensors); el nombre indica "4B" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. El nombre indica que deriva de Qwen 3.5 y que se ha construido mediante una fusión SLERP de dos vías (2xMerge) sobre variantes entrenadas con datos de trazas de razonamiento de Claude Opus (versiones 4.6 y 4.7, según los datasets referenciados) y de DeepSeek, además de trazas de agente de Hermes (`lambda/hermes-agent-reasoning-traces`). El sufijo "heretic" indica que el modelo ha sido descensurado mediante técnicas de ablación o ajuste orientadas a eliminar rechazos.

No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La información disponible se limita a los metadatos de la model card y a la lista de cuantizaciones.

## Capacidades

- Generación de texto y razonamiento (etiquetas `reasoning`, `stem`).
- Generación de código (etiqueta `coding`).
- Matemáticas (etiqueta `math`).
- Uso de herramientas y function calling (etiquetas `tool-use`, `function-calling`).
- Capacidades de agente y razonamiento multi-paso (etiqueta `agent`).
- Multilingüe: inglés, chino, español, ruso y japonés.
- Variante descensurada ("uncensored", "decensored", "heretic"): menor tendencia a rechazar peticiones.
- Soporte multimodal: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que indica capacidad de visión en el modelo base, aunque no se detalla su alcance.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en editores o pipelines de CI/CD para autocompletado y generación de funciones, aprovechando sus etiquetas de `coding` y su reducido tamaño para ejecución en hardware modesto.
- Automatización de agentes con tool calling: adecuado para orquestar llamadas a APIs y flujos multi-paso en entornos donde se requiere function calling.
- Razonamiento matemático y STEM: útil para resolver problemas paso a paso en entornos educativos o de análisis técnico.
- Procesamiento multilingüe: atención a usuarios en inglés, chino, español, ruso y japonés dentro de una misma aplicación.
- Experimentación con modelos descensurados: investigación sobre alineación, sesgos y comportamiento de modelos sin filtros de rechazo.
- Prototipado rápido en CPU: al disponer de cuantizaciones Q2_K a Q8_0, puede desplegarse con llama.cpp u Ollama en equipos sin GPU dedicada.
- Análisis de imágenes (si se usa el modelo base con mmproj): tareas de descripción o extracción de información de imágenes, aunque la información disponible no detalla la calidad de esta capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: según el recuento real de 333 M de parámetros, una cuantización Q4_K_M ocuparía del orden de 0,2-0,3 GB; una Q8_0, en torno a 0,4 GB. No obstante, si el modelo real fuese de 4B parámetros como indica el nombre, las cifras serían aproximadamente 2,5-3 GB en Q4_K_M y 4-5 GB en Q8_0. La discrepancia impide dar una cifra fiable.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB de VRAM sería suficiente en el escenario de 4B; en el escenario de 333 M, incluso GPUs integradas o CPU.
- Cabe en GPU consumer: sí, en ambos escenarios, incluidas RTX 3060, RTX 4060, RTX 4090 o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede usarse con `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wukong-4B-Qwen3.5-...-heretic-GGUF (este) | 333 M (según safetensors) / "4B" nominal | no disponible | Apache 2.0 | GGUF | Fusión SLERP descensurada, 5 idiomas |
| Qwen2.5-3B-Instruct | 3B | 32K (típico de la familia) | Apache 2.0 | safetensors, GGUF | Modelo oficial, sin descensurar |
| Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community | safetensors, GGUF | Modelo oficial, multilingüe |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Orientado a razonamiento y código |

Los datos de los modelos comparables corresponden a características públicas conocidas de esas familias; no se dispone de comparaciones de rendimiento directas con este modelo.

## Limitaciones y advertencias

- Discrepancia entre el nombre ("4B") y el recuento real de parámetros (333 M): verificar antes de dimensionar infraestructura.
- Modelo descensurado ("heretic", "uncensored"): mayor probabilidad de generar contenido sensible, ofensivo o inapropiado; no recomendado para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Longitud de contexto no disponible: no planificar casos de uso con contextos largos sin verificar.
- Solo se ofrecen cuantizaciones estáticas; no hay cuantizaciones ponderadas/imatrix, lo que puede afectar a la calidad en cuantizaciones bajas (Q2_K, Q3_K_S).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de origen deben verificarse por posibles restricciones adicionales.
- El modelo es una fusión no oficial; su calidad y estabilidad no están garantizadas por un laboratorio de referencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Página de descargas del autor: https://hf.tst.eu/model#Wukong-4B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Dataset Claude Opus 4.6 TraceInversion: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Claude Opus 4.7 TraceInversion: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset Hermes agent reasoning traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
