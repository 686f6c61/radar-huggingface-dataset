# jbmkmbrlb/madlad400-3b-mt-ct2-float32

## Resumen

MADLAD-400-3B-MT es un modelo de traducción automática multilingüe desarrollado por Google Research, basado en la arquitectura T5 (encoder-decoder). Este repositorio concreto, `jbmkmbrlb/madlad400-3b-mt-ct2-float32`, es una conversión a CTranslate2 del checkpoint original `google/madlad400-3b-mt`, realizada por el usuario jbmkmbrlb (basada en el trabajo de Heng-Shiou Sheu). El modelo original fue entrenado sobre 1 billón de tokens del dataset público MADLAD-400, cubriendo más de 450 idiomas, lo que lo sitúa como una opción competitiva frente a modelos de traducción significativamente más grandes.

La relevancia de esta versión convertida radica en su optimización para inferencia eficiente en CPU y GPU mediante el runtime de CTranslate2, manteniendo los pesos en float32 (aunque existen variantes int8). Con 3 mil millones de parámetros y una ventana de contexto típica de T5 (no especificada oficialmente), el modelo ofrece un equilibrio entre calidad de traducción y requisitos de hardware moderados, siendo especialmente útil para tareas de traducción de bajo recurso y para entornos donde se necesita desplegar un sistema multilingüe sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de T5: 512-1024 tokens, no confirmado) |
| Tipos de cuantizacion | float32 (este repo); int8 disponible en otras conversiones (p. ej. `Heng666/madlad400-3b-ct2-int8`) |
| Idiomas soportados | Más de 400 (lista extensa de códigos ISO en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (formato binario propio) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 original: un transformer encoder-decoder con 32 capas y un vocabulario compartido de 256 000 tokens SentencePiece. El entrenamiento se realizó sobre el dataset MADLAD-400, compuesto por datos públicos extraídos de Common Crawl, con un total de 1 billón de tokens. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales; es un modelo de traducción puro entrenado con pérdida de modelado de lenguaje estándar. La conversión a CTranslate2 no altera los pesos, solo optimiza el formato para inferencia, permitiendo ejecución eficiente en CPU y GPU con soporte de búsqueda de haz (beam search) y parámetros como `repetition_penalty` y `no_repeat_ngram_size`.

## Capacidades

- Traducción automática multilingüe: soporta más de 400 idiomas, incluyendo lenguas de alto y bajo recurso (p. ej., español, inglés, francés, alemán, pero también lenguas como el quechua, el hausa o el cebuano).
- Generación de texto (text2text): al ser un modelo T5, puede adaptarse a otras tareas de transformación de texto, aunque su entrenamiento principal es traducción.
- Multilingüismo extenso: la cobertura de idiomas es una de las más amplias entre modelos de su tamaño, superando a alternativas como NLLB-200 en número de lenguas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio. Es un modelo exclusivamente de texto.

## Casos de uso

- Traducción de contenido web multilingüe: el modelo puede traducir páginas completas o fragmentos de texto en tiempo real, gracias a su soporte de más de 400 idiomas y a su eficiencia en CPU/GPU con CTranslate2. Es adecuado para plataformas de contenido que necesitan localización automática sin depender de servicios externos.
- Localización de software y aplicaciones: los equipos de desarrollo pueden integrar el modelo en pipelines de internacionalización (i18n) para traducir cadenas de interfaz, mensajes de error y documentación técnica, reduciendo costes frente a traductores humanos.
- Traducción de documentos técnicos y legales: su entrenamiento en datos generales permite manejar terminología variada, aunque para dominios muy especializados se requeriría fine-tuning. La versión float32 ofrece mayor precisión que las cuantizadas, útil en contextos donde la fidelidad es crítica.
- Traducción en tiempo real para atención al cliente: el modelo puede integrarse en sistemas de chat o ticketing para traducir consultas de usuarios en múltiples idiomas, permitiendo a agentes humanos responder en su lengua materna. Su baja latencia en GPU lo hace viable para interacciones síncronas.
- Traducción de subtítulos y transcripciones: la capacidad de procesar lotes de texto (batch) y la compatibilidad con beam search facilitan la traducción de archivos de subtítulos (SRT) o transcripciones de vídeo, manteniendo coherencia contextual.
- Preprocesamiento para otros modelos NLP: el modelo puede usarse como paso previo para normalizar o traducir datos de entrenamiento en pipelines de aprendizaje automático, especialmente para lenguas con pocos recursos donde se necesitan datos aumentados.
- Traducción de contenido generado por usuarios en redes sociales: su amplia cobertura de idiomas y su licencia Apache 2.0 permiten su uso en plataformas sociales para moderar o traducir publicaciones, comentarios y mensajes directos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original de Google menciona una sección de evaluación, pero no se incluye su contenido en este repositorio. El paper asociado (arXiv:2309.04662) reporta métricas BLEU para 204 idiomas, pero esos datos no están disponibles en la documentación de esta conversión. Se recomienda consultar el paper original para obtener cifras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos float32, el modelo ocupa aproximadamente 12 GB (3B parámetros × 4 bytes). Para inferencia en GPU se recomienda al menos 16 GB de VRAM para dejar margen a los estados intermedios y la memoria de trabajo.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB), o GPUs profesionales con 16 GB o más. En cuantización int8 (no incluida en este repo) el requisito baja a ~6 GB, permitiendo uso en GPUs de 8 GB como la RTX 3070.
- En CPU: es posible ejecutar el modelo con CTranslate2, pero la latencia será alta para uso interactivo; se recomienda para procesamiento por lotes.
- Opciones de despliegue: CTranslate2 runtime (oficial), que soporta CPU (x86/ARM) y GPU NVIDIA. No es compatible directamente con vLLM, TGI u Ollama, ya que estos requieren formatos como safetensors o GGUF. Para usarlo con transformers, habría que convertir los pesos de vuelta a PyTorch.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU A100, se estima un throughput de decenas de frases por segundo con beam size 1, pero estos valores dependen de la longitud de los textos y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| MADLAD-400-3B-MT (este repo) | 3B | 400+ | no disponible | Apache 2.0 | CTranslate2 |
| NLLB-200 (3.3B) | 3.3B | 200 | 512 | CC-BY-NC 4.0 (no comercial) | PyTorch, ONNX |
| M2M-100 (1.2B) | 1.2B | 100 | 1024 | MIT | PyTorch |
| MADLAD-400-3B-MT (original) | 3B | 400+ | no disponible | Apache 2.0 | PyTorch (safetensors) |

La comparativa se basa en características generales; no se dispone de datos de rendimiento (BLEU, chrF) en la información proporcionada. MADLAD-400 destaca por su mayor cobertura de idiomas frente a NLLB-200 y M2M-100, y por su licencia permisiva (Apache 2.0) frente a la CC-BY-NC de NLLB-200, que restringe el uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos públicos de Common Crawl, el modelo puede reflejar sesgos culturales, de género o geográficos presentes en el corpus. No se ha realizado una evaluación específica de sesgos en esta conversión.
- Riesgo de alucinación: en traducción, el modelo puede generar frases gramaticalmente correctas pero semánticamente incorrectas, especialmente en idiomas de bajo recurso o con contextos ambiguos.
- Limitaciones de contexto: la longitud de contexto no está documentada; los modelos T5 suelen manejar secuencias de hasta 512-1024 tokens, lo que limita la traducción de documentos largos sin segmentación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo original se distribuye sin garantías; los usuarios deben evaluar su idoneidad para producción.
- Caveat de producción: la model card original indica que el modelo no ha sido evaluado para casos de uso de producción y que solo se probó en 204 de los idiomas soportados. Se recomienda realizar pruebas exhaustivas en el dominio objetivo antes de desplegarlo.
- Formato propietario: al ser CTranslate2, no es directamente interoperable con ecosistemas que esperan safetensors o GGUF; puede requerir conversión adicional para integrarse en ciertos frameworks.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/jbmkmbrlb/madlad400-3b-mt-ct2-float32
- Modelo original de Google: https://huggingface.co/google/madlad400-3b-mt
- Paper de investigación: https://arxiv.org/abs/2309.04662
- Repositorio GitHub de MADLAD-400: https://github.com/google-research/google-research/tree/master/madlad_400
- Repositorio T5X (framework de entrenamiento): https://github.com/google-research/t5x
- Conversión int8 de referencia: https://huggingface.co/Heng666/madlad400-3b-ct2-int8
