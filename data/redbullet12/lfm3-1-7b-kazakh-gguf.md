# RedBullet12/LFM3-1.7B-Kazakh-GGUF

## Resumen

LFM3-1.7B-Kazakh-GGUF es la versión cuantizada en formato GGUF del modelo RedBullet12/LFM3-1.7B-Kazakh, un ajuste fino del modelo base LiquidAI LFM3-1.7B orientado a comprender y responder en kazajo (kk). Lo publica el usuario RedBullet12 y está pensado para ejecución local en portátiles y teléfonos mediante LM Studio, Ollama y llama.cpp, con dos cuantizaciones disponibles (Q4_K_M y Q8_0).

El modelo resuelve un nicho concreto: dotar de capacidad conversacional en kazajo a un transformer pequeño de 1.728.801.600 parámetros, derivado de la familia LFM3 de Liquid AI. Al estar en GGUF, se integra en el ecosistema llama.cpp y permite despliegue en hardware de consumo sin GPU dedicada de gama alta.

Es relevante ahora porque los modelos de menos de 2.000 millones de parámetros con cuantización de 4 bits caben en equipos modestos, y este ajuste demuestra el patrón habitual de adaptación lingüística de un modelo base occidental a un idioma de bajos recursos. Conviene subrayar que el autor advierte explícitamente de que la versión v1 no es fiable para preguntas factuales, ya que el ajuste fino sobrescribió conocimiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI; detalles internos no disponibles) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (~1,1 GB) y Q8_0 (~1,8 GB) en GGUF |
| Idiomas soportados | kazajo (kk) |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM3 de Liquid AI, descrita por el autor como un transformer, aunque la model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención ni si incorpora innovaciones como atención lineal). El ajuste fino se realizó sobre el checkpoint LFM3-1.7B para adaptarlo al kazajo.

Según la model card, el entrenamiento se apoyó en datos traducidos automáticamente (machine-translated data), lo que explica tanto la fluidez en kazajo como las carencias en conocimiento factual. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La cuantización a GGUF se generó con llama.cpp y requiere versiones recientes del runtime (llama.cpp b11960+, LM Studio con motor llama.cpp 2.65.1+, Ollama v0.40.12+).

## Capacidades

- Generación de texto conversacional en kazajo, con fluidez lingüística según el autor.
- Comprensión y respuesta en kazajo (idioma único declarado).
- Ejecución local en portátiles y teléfonos mediante llama.cpp, Ollama y LM Studio.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y pipeline de text-generation.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: limitadas; el autor señala debilidad en razonamiento multi-paso.
- Matemáticas: débiles según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional en kazajo para uso personal: el modelo puede mantener diálogos en kazajo en local con Ollama o LM Studio, sin depender de la nube, gracias a su tamaño de 1,7 B y cuantización Q4_K_M de ~1,1 GB.
- Generación de texto y borradores en kazajo: redacción de correos, publicaciones o textos breves donde prima la fluidez idiomática sobre la exactitud factual.
- Traducción asistida hacia kazajo con revisión humana: útil como primer borrador en pipelines de localización, dado que el entrenamiento se basó en datos traducidos automáticamente.
- Chatbot con recuperación aumentada (RAG): el autor recomienda explícitamente usar RAG para preguntas factuales, de modo que el modelo formule la respuesta en kazajo a partir de documentos recuperados en lugar de su conocimiento paramétrico.
- Prototipado y experimentación lingüística: investigadores que estudian adaptación de modelos pequeños a idiomas de bajos recursos pueden usar este checkpoint como referencia reproducible en GGUF.
- Aplicaciones móviles o de escritorio offline: al caber en equipos de consumo y en teléfonos, sirve para asistentes de texto sin conexión en kazajo.
- Evaluación de pipelines llama.cpp: útil como caso de prueba de cuantizaciones Q4_K_M y Q8_0 en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,1 GB para Q4_K_M y 1,8 GB para Q8_0, más overhead del runtime y del contexto.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con 2-4 GB de VRAM libre es suficiente, incluidas GTX 1650, RTX 3050 o superiores.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales; también puede ejecutarse en CPU.
- Despliegue: llama.cpp (b11960+), LM Studio (motor llama.cpp 2.65.1+), Ollama (v0.40.12+). No se mencionan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados por el autor: temperature 0.3, top_p 0.9, repeat penalty 1.15; advierte de que un control de repetición más bajo puede provocar bucles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-Kazakh-GGUF (este) | 1,73 B | no disponible | kk | lfm1.0 | GGUF |
| RedBullet12/LFM3-1.7B-Kazakh (base del ajuste) | 1,73 B | no disponible | kk | lfm1.0 | safetensors |
| LiquidAI/LFM3-1.7B (modelo original) | 1,73 B | no disponible | no disponible | lfm1.0 | safetensors |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente: no usar para preguntas factuales. En pruebas, el modelo llegó a afirmar que Pekín es la capital de Kazajistán; el ajuste fino sobrescribió conocimiento del modelo base.
- Entrenado sobre datos traducidos automáticamente, lo que puede introducir artefactos y sesgos de traducción.
- Débil en matemáticas y razonamiento multi-paso, según la model card.
- Idioma limitado al kazajo; no se declaran capacidades multilingües.
- Riesgo de bucles en generación si se reduce el repeat penalty por debajo de 1.15.
- Licencia lfm1.0: es necesario revisar los términos del enlace de licencia del modelo original antes de cualquier uso comercial.
- Requiere runtimes recientes de llama.cpp, LM Studio u Ollama; versiones antiguas pueden no cargar el modelo.
- El autor recomienda esperar a una v2 o combinar con RAG para casos de uso que requieran exactitud.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/RedBullet12/LFM3-1.7B-Kazakh-GGUF
- Modelo base del ajuste: https://huggingface.co/RedBullet12/LFM3-1.7B-Kazakh
- Modelo original LiquidAI LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
