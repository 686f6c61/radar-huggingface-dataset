# DanVP/MoxhiMT-60

## Resumen

MoxhiMT-60 es un modelo de traducción automática neuronal (NMT) especializado en el par chino-vietnamita, desarrollado por DanVP y publicado en Hugging Face bajo licencia Apache 2.0. Está diseñado específicamente para traducir texto de novelas web y ficción del género xianxia (cultivo inmortal), un nicho con terminología propia que los traductores automáticos genéricos suelen manejar mal. El modelo sigue la arquitectura Marian seq2seq con 8 capas de encoder y 2 de decoder, y cuenta con aproximadamente 57 millones de parámetros.

El modelo se distribuye en formato safetensors y también incluye una versión convertida a CTranslate2 con cuantización INT8 para acelerar la inferencia en CPU. Está pensado para uso local o en servidor, y su tamaño compacto lo hace viable en hardware modesto. Se trata de un lanzamiento experimental: el propio autor recomienda revisar las salidas antes de usarlo en contextos de alta exigencia o publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian seq2seq (8 encoder + 2 decoder layers) |
| Parametros totales | 56.397.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada; sugerencia de decodificacion: max_length=512 |
| Tipos de cuantizacion | INT8 (CTranslate2, incluido en el repo) |
| Idiomas soportados | chino (zh), vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, CTranslate2 (ct2-int8) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Marian seq2seq clásica, con 8 capas en el encoder y 2 en el decoder, una dimensión de modelo de 576 y una capa feed-forward de 2304. El tokenizador es SentencePiece con BPE, entrenado conjuntamente sobre chino y vietnamita con un vocabulario de 24.000 subpalabras. Según la model card, el modelo fue entrenado desde cero (no es un fine-tuning de un modelo preexistente) con un tokenizador propio. No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas como RLHF o DPO. La especialización en terminología xianxia sugiere que el corpus de entrenamiento incluye una proporción significativa de novelas web de ese género.

## Capacidades

- Traducción automática de chino a vietnamita, con especial énfasis en terminología de xianxia y cultivo (niveles de cultivo, técnicas, artefactos, sectas, etc.).
- Generación de texto condicionada por el contexto de entrada, con soporte para secuencias de hasta 512 tokens (recomendado).
- Inferencia local en CPU o GPU, con opción de aceleración mediante CTranslate2 en INT8.
- Integración sencilla con la librería Transformers de Hugging Face mediante `AutoModelForSeq2SeqLM`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multimodalidad; es un modelo puramente de traducción.

## Casos de uso

- Traducción de novelas web chinas (xianxia, wuxia, fantasy) al vietnamita: el modelo está afinado para este género, por lo que puede producir traducciones más fieles en terminología que un traductor genérico. Se usaría con el pipeline de Transformers o CTranslate2 para procesar capítulos completos.
- Localización de contenido literario para plataformas de lectura: editoriales o agregadores de contenido pueden integrar el modelo en un flujo de traducción masiva, con revisión humana posterior.
- Traducción de diálogos y narrativa en juegos o cómics: el tamaño compacto permite ejecutarlo en servidores modestos o incluso en equipos de desarrollo para generar borradores de traducción.
- Asistencia a traductores humanos: como herramienta de pre-traducción o sugerencia, el modelo puede acelerar el trabajo de traductores profesionales que luego corrigen el resultado.
- Investigación en NMT de bajo recurso: el par zh-vi no tiene tantos recursos como otros, y este modelo sirve como referencia para estudiar el impacto de la especialización por dominio en modelos pequeños.
- Despliegue en entornos sin GPU: gracias a la versión CTranslate2 INT8, es viable ejecutar el modelo en CPU para aplicaciones de traducción en tiempo real o por lotes con latencia aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como BLEU, chrF o comparaciones con otros sistemas de traducción zh-vi. Tampoco se documentan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~57M parámetros, la versión en fp32 ocupa aproximadamente 225 MB en memoria. Con cuantización INT8, el peso se reduce a unos 57 MB, por lo que puede ejecutarse en CPU con menos de 1 GB de RAM adicional.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas con soporte CUDA). No requiere GPUs de datacenter.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier ordenador personal moderno, tanto en CPU como en GPU de gama baja.
- Opciones de despliegue: Transformers (PyTorch), CTranslate2 (CPU/GPU), y potencialmente ONNX si se convierte. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, ya que estos están orientados a LLMs autoregresivos y no a modelos seq2seq.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia de decenas de milisegundos por frase en CPU con INT8, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. No se han publicado benchmarks frente a otros modelos de traducción zh-vi, como los de la familia Helsinki-NLP/opus-mt (si existen para este par) o modelos multilingües como NLLB-200. El autor no proporciona comparaciones. Se puede señalar que, por tamaño, MoxhiMT-60 es comparable a los modelos Marian típicos (~50-80M parámetros), pero su especialización en xianxia es su principal diferenciador.

## Limitaciones y advertencias

- Modelo experimental: el autor indica explícitamente que es un lanzamiento experimental y que las salidas deben revisarse para usos de alto riesgo o publicación.
- Especialización limitada: está optimizado para xianxia y novelas web; puede degradarse en textos técnicos, formales o de otros dominios.
- Sin datos de entrenamiento publicados: no se conoce el volumen ni la procedencia del corpus, lo que dificulta evaluar posibles sesgos.
- Riesgo de alucinación y errores de traducción: como cualquier NMT, puede producir traducciones incorrectas o inventar términos, especialmente en contextos fuera de su dominio.
- Longitud de contexto limitada: la ventana de 512 tokens puede ser insuficiente para párrafos muy largos o para mantener coherencia en capítulos extensos.
- Sin soporte para otros pares de idiomas: solo zh-vi, no es multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la calidad o idoneidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DanVP/MoxhiMT-60
- Directorio de archivos (incluye la carpeta ct2-int8): https://huggingface.co/DanVP/MoxhiMT-60/tree/main/ct2-int8
