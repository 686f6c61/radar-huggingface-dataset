# inference4j/opus-mt-en-es

## Resumen

`inference4j/opus-mt-en-es` es una exportación a formato ONNX del modelo de traducción automática `Helsinki-NLP/opus-mt-en-es`, desarrollado originalmente por el grupo Helsinki-NLP (Universidad de Helsinki) y convertido por el proyecto inference4j para su uso en entornos Java. El modelo resuelve la tarea de traducción de inglés a español mediante una arquitectura MarianMT de tipo encoder-decoder, derivada de la familia de modelos Marian NMT entrenados sobre el corpus paralelo OPUS.

La relevancia de esta ficha radica en su formato: al estar exportado a ONNX con soporte de caché KV (KV cache), permite la inferencia en entornos sin dependencia de PyTorch, lo que facilita su integración en aplicaciones Java a través de la librería inference4j. El repositorio ocupa 0,7 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los idiomas adicionales soportados más allá del par inglés-español, ya que la model card proporcionada no incluye estos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT encoder-decoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (exportación ONNX; se desconoce si incluye variantes cuantizadas) |
| Idiomas soportados | inglés y español (par de traducción en→es) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con soporte de KV cache) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura MarianMT, un transformer encoder-decoder diseñado específicamente para traducción automática neuronal. La exportación a ONNX se realizó mediante Hugging Face Optimum, preservando la arquitectura encoder-decoder e incorporando soporte de caché KV para acelerar la decodificación autoregresiva. El tokenizador es SentencePiece, habitual en la familia Marian.

El entrenamiento original se realizó sobre el corpus paralelo OPUS, una colección de textos paralelos multilingües de dominio público. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card no documenta innovaciones técnicas adicionales más allá de la propia arquitectura Marian y la exportación con KV cache.

## Capacidades

- Traducción automática de inglés a español, tanto de frases aisladas como de párrafos.
- Generación de texto traducido mediante decodificación autoregresiva con caché KV.
- Integración en aplicaciones Java mediante la librería inference4j (clase `MarianTranslator`).
- Ejecución en entornos ONNX Runtime, sin dependencia de PyTorch.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo de pensamiento (thinking mode).
- Capacidad multilingüe limitada al par inglés-español; no se documentan otros pares.

## Casos de uso

- Traducción de documentación técnica: el modelo puede traducir manuales, READMEs y guías de inglés a español dentro de pipelines de documentación, integrándose vía inference4j en aplicaciones Java empresariales.
- Localización de interfaces de usuario: traducción de cadenas de texto y mensajes de aplicaciones para su despliegue en mercados hispanohablantes, con latencia baja al ejecutarse en ONNX Runtime.
- Atención al cliente automatizada: traducción en tiempo real de mensajes de usuarios angloparlantes a español para su procesamiento por parte de agentes o sistemas downstream en español.
- Preprocesamiento en pipelines de NLP: traducción de corpus en inglés a español antes de tareas posteriores como análisis de sentimiento, clasificación o extracción de entidades en español.
- Traducción de correos electrónicos y comunicaciones internas: integración en herramientas de mensajería corporativa desarrolladas en Java para traducir comunicaciones entre equipos.
- Generación de subtítulos y transcripciones: traducción de transcripciones en inglés a español para vídeos, reuniones o contenido formativo, aprovechando el soporte de KV cache para decodificación eficiente.
- Prototipado rápido en investigación: evaluación de traducción en→es sin necesidad de infraestructura Python, útil en entornos Java o en sistemas embebidos con ONNX Runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,7 GB, por lo que la inferencia en FP32 requeriría aproximadamente ese orden de magnitud de memoria, y menos si se aplican cuantizaciones (no documentadas).
- GPU recomendadas: no disponibles; por el tamaño del repositorio, el modelo es susceptible de ejecutarse en GPU consumer (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del repositorio (0,7 GB); no se documentan requisitos oficiales.
- Opciones de despliegue: ONNX Runtime (nativo), inference4j (Java). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| inference4j/opus-mt-en-es | MarianMT encoder-decoder | no disponible | no disponible | Apache 2.0 | ONNX | Hugging Face |
| Helsinki-NLP/opus-mt-en-es | MarianMT encoder-decoder | no disponible | no disponible | Apache 2.0 | PyTorch (safetensors/bin) | Hugging Face |
| Helsinki-NLP/opus-mt-es-en | MarianMT encoder-decoder | no disponible | no disponible | Apache 2.0 | PyTorch | Hugging Face |
| Modelos NLLB de Meta | Transformer encoder-decoder | no disponible | no disponible | CC-BY-NC (variantes) | PyTorch | Hugging Face |

La comparativa se limita a alternativas de la misma familia o categoría; no se dispone de datos de rendimiento comparativo (BLEU u otras métricas) en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo traduce de inglés a español; no soporta la dirección inversa ni otros pares de idiomas.
- No se documentan sesgos específicos, pero al entrenarse sobre OPUS (corpus de dominio público y heterogéneo) puede heredar sesgos presentes en los textos fuente.
- Riesgo de alucinación en traducciones de textos ambiguos, técnicos o con terminología especializada; no se documentan evaluaciones de fidelidad.
- Longitud de contexto no documentada; textos largos pueden requerir segmentación manual.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo original Helsinki-NLP/opus-mt-en-es, también Apache 2.0.
- El formato ONNX con KV cache está orientado a inference4j; su uso con otros runtimes ONNX puede requerir adaptaciones.
- No se documentan limitaciones específicas de producción, latencia ni throughput.

## Enlaces

- [Hugging Face: inference4j/opus-mt-en-es](https://huggingface.co/inference4j/opus-mt-en-es)
- [Modelo original: Helsinki-NLP/opus-mt-en-es](https://huggingface.co/Helsinki-NLP/opus-mt-en-es)
- [Repositorio inference4j](https://github.com/inference4j/inference4j)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
