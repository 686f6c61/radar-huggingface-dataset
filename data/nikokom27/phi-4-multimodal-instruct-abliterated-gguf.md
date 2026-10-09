# nikokom27/Phi-4-multimodal-instruct-abliterated-GGUF

## Resumen

Esta ficha describe `nikokom27/Phi-4-multimodal-instruct-abliterated-GGUF`, una recuantización en formato GGUF del modelo abliterado `huihui-ai/Phi-4-multimodal-instruct-abliterated`, que a su vez deriva de `microsoft/Phi-4-multimodal-instruct`. El modelo original de Microsoft es un transformer multimodal que procesa texto, imagen y audio dentro de una misma arquitectura, orientado a tareas de generación de texto, razonamiento, código, respuesta a preguntas visuales (VQA), reconocimiento automático de habla (ASR), resumen de habla y traducción de habla.

El valor diferencial de este repositorio es doble. Por un lado, la "abliteración" aplicada por huihui-ai elimina las direcciones de activación asociadas a los rechazos de seguridad, de modo que el modelo deja de responder con negativas del tipo "lo siento, pero no puedo proporcionar detalles de imágenes". Por otro, el autor `nikokom27` publica una versión cuantizada en GGUF (etiquetada como `autoquant`), pensada para inferencia local con runtimes como llama.cpp u Ollama en lugar de requerir GPUs de datacenter.

Se trata de un repositorio con 0 descargas y 0 likes en el momento de redactar esta ficha, creado el 2026-10-09, sin datos de benchmarks ni evaluación publicada. El modelo base tiene 5,6 B parámetros según su documentación pública, aunque el repositorio GGUF no detalla tamaños de fichero ni niveles de cuantización concretos, por lo que varios apartados de esta ficha quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, visión y audio) heredada de `microsoft/Phi-4-multimodal-instruct`; la información disponible no detalla la arquitectura interna |
| Parametros totales | No declarado en el repositorio GGUF; el modelo base `microsoft/Phi-4-multimodal-instruct` figura con 5,6 B parámetros en su documentación pública |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (etiqueta `autoquant`); niveles concretos (Q4_K_M, Q5_K_M, Q8_0, etc.) no disponibles |
| Idiomas soportados | Multilingüe: ar, zh, cs, da, nl, en, fi, fr, de, he, hu, it, ja, ko, no, pl, pt, ru, es, sv, th, tr, uk (23 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF en este repositorio; el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El repositorio no documenta ningún entrenamiento propio: es una cadena de transformaciones sobre `microsoft/Phi-4-multimodal-instruct`. Primero, huihui-ai aplicó abliteración sobre el modelo de Microsoft usando el método implementado en `remove-refusals-with-transformers`, una implementación de prueba de concepto que no emplea TransformerLens. El propio autor de esa conversión advierte que solo se procesó la parte de texto del modelo, no la torre de imagen. Después, `nikokom27` recuantizó el resultado a GGUF para despliegue local.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base utilizó RLHF, DPO u otro método de alineación; tampoco sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, mezcla de LoRAs u otras) más allá de la naturaleza multimodal del modelo. La etiqueta `phi-4-mini` sugiere que la parte textual deriva de la familia Phi-4-mini, pero el repositorio no aporta detalles adicionales.

## Capacidades

- Generación de texto conversacional en modo chat, con plantillas de prompt específicas (`<|user|>`, `<|assistant|>`, `<|end|>`) tal como se muestra en el ejemplo de uso.
- Generación de código, según la etiqueta `code` del repositorio.
- Reconocimiento automático de habla (ASR): transcripción de audio, con ficheros de ejemplo tipo LibriSpeech en la model card original.
- Resumen de habla (`speech-summarization`).
- Traducción de habla (`speech-translation`).
- Respuesta a preguntas visuales (VQA): entrada de imagen más pregunta en texto.
- Capacidad multilingüe declarada en 23 idiomas: árabe, chino, checo, danés, neerlandés, inglés, finés, francés, alemán, hebreo, húngaro, italiano, japonés, coreano, noruego, polaco, portugués, ruso, español, sueco, tailandés, turco y ucraniano.
- Comportamiento "uncensored" en la rama de texto: la abliteración elimina las respuestas de rechazo en la parte textual.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Transcripción local de audio multilingüe: el modelo puede actuar como motor ASR en 23 idiomas sin enviar datos a servicios en la nube, algo relevante en entornos con requisitos de privacidad. La cuantización GGUF facilita su ejecución en estaciones de trabajo sin GPU de datacenter.
- Traducción de habla en tiempo cuasi real: combinando ASR y traducción en una sola pasada, útil para subtitulado automático o para atención telefónica multilingüe.
- Resumen de reuniones y podcasts: a partir del audio de una reunión, generar actas o resúmenes estructurados, aprovechando la tarea `speech-summarization` declarada en el repositorio.
- Descripción de imágenes y accesibilidad: dado que soporta VQA, puede emplearse para generar descripciones de imágenes en herramientas de accesibilidad. Conviene tener en cuenta que la abliteración no se aplicó a la rama de imagen.
- Inspección visual en pipelines industriales o documentales: extracción de información a partir de capturas, diagramas o documentos escaneados mediante preguntas en lenguaje natural.
- Asistente de programación autoalojado: generación y explicación de código en local sobre el repositorio del usuario, sin dependencia de APIs externas.
- Investigación en seguridad y alineación: este repositorio, junto con el modelo abliterado original, sirve como material para estudiar el efecto de la abliteración sobre las tasas de rechazo y sobre la calidad general del modelo.
- Despliegue en hardware de gama de consumo: al distribuirse en GGUF, encaja en flujos con llama.cpp u Ollama para prototipado rápido en portátiles o equipos con GPU modesta, siempre que la cuantización elegida quepa en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye tabla de resultados (MMLU, HumanEval, GSM8K, MMMU o similares), no reporta métricas de ASR (WER) ni de VQA, y no ofrece comparación con el modelo base sin abliterar. Tampoco se documentan evaluaciones del impacto de la abliteración sobre las capacidades del modelo.

## Requisitos de hardware

- Tamaños de fichero y niveles de cuantización: no disponibles. El repositorio etiqueta la conversión como `autoquant` pero no lista los artefactos publicados.
- VRAM estimada para inferencia: no disponible de forma exacta. Como referencia, un modelo de 5,6 B parámetros ocupa aproximadamente 11,2 GB en FP16, en torno a 6 GB en cuantización de 8 bits y alrededor de 3,5 GB en cuantización de 4 bits, sin contar el coste adicional de los codificadores de visión y audio. Estas cifras son estimaciones derivadas del tamaño del modelo base, no datos confirmados por el repositorio.
- GPU recomendadas: no disponible. Para la variante FP16 serían necesarias GPUs con 16 GB o más de VRAM (RTX 4090, A100 40 GB, H100); las cuantizaciones más agresivas podrían caber en GPUs de 8 GB, pero no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí en cuantizaciones de 4-8 bits, en función del tamaño final de los ficheros y del soporte de las torres multimodales, dato no disponible.
- Opciones de despliegue: llama.cpp y Ollama son los runtimes habituales para GGUF; LM Studio también es compatible en general. El repositorio no documenta soporte para vLLM, TGI ni para las torres de audio y visión en runtimes GGUF, por lo que ese extremo debe verificarse antes de usarlo en producción.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| `nikokom27/Phi-4-multimodal-instruct-abliterated-GGUF` | No declarado (base: 5,6 B) | no disponible | Texto, imagen, audio | MIT | GGUF | 0 descargas, 0 likes |
| `microsoft/Phi-4-multimodal-instruct` | 5,6 B (documentación pública) | no disponible | Texto, imagen, audio | MIT | Safetensors | Modelo original de Microsoft, alineado |
| `huihui-ai/Phi-4-multimodal-instruct-abliterated` | No declarado | no disponible | Texto, imagen (audio según base) | MIT | Safetensors | Abliterado, solo rama de texto procesada |
| `unsloth/Phi-4-mini-instruct-GGUF` | No declarado | no disponible | Solo texto | MIT | GGUF | Alternativa GGUF sin capacidades multimodales |

La comparación se limita a la información disponible: no hay datos públicos en este repositorio sobre parámetros exactos, contexto o rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La abliteración se aplicó únicamente a la parte de texto del modelo; la rama de imagen conserva el comportamiento original, algo que el propio autor de la conversión señala explícitamente.
- El método de abliteración se describe en su repositorio de origen como una implementación "cruda, prueba de concepto", sin evaluación sistemática de su impacto sobre la calidad del modelo.
- No hay ninguna evaluación publicada sobre tasas de rechazo, degradación de capacidades o seguridad del modelo tras la abliteración y la posterior cuantización.
- Riesgo de alucinación: inherente a los modelos de lenguaje y no cuantificado en este repositorio.
- Sesgos conocidos: no disponibles. No se han publicado análisis de sesgo para esta variante.
- La ficha no documenta limitaciones de contexto ni de idioma más allá de la lista de 23 idiomas soportados; el rendimiento real por idioma no está medido.
- Restricciones de licencia: el repositorio declara licencia MIT, pero al derivar de `microsoft/Phi-4-multimodal-instruct` conviene revisar los términos del modelo original antes de un uso comercial, especialmente en lo relativo a la generación de contenido sin filtros.
- Repositorio de terceros no verificado por Microsoft: cambios, retiradas o falta de mantenimiento son posibles.
- Ausencia de tracción: 0 descargas y 0 likes implica que no existe validación por parte de la comunidad ni informes de fallos.
- No se documentan los niveles de cuantización ni el impacto de la cuantización sobre la precisión, lo que dificulta reproducir resultados o estimar requisitos de memoria.
- La fecha de creación registrada es el 2026-10-09, posterior a la publicación del modelo base, lo que indica que se trata de un derivado reciente y no revisado.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/nikokom27/Phi-4-multimodal-instruct-abliterated-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-4-multimodal-instruct
- Versión abliterada de huihui-ai: https://huggingface.co/huihui-ai/Phi-4-multimodal-instruct-abliterated
- Ficha en ModelScope de la versión abliterada: https://www.modelscope.cn/models/huihui-ai/Phi-4-multimodal-instruct-abliterated/summary
- Repositorio del método de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- Licencia referenciada: https://huggingface.co/huihui-ai/Phi-4-multimodal-instruct-abliterated/resolve/main/LICENSE
- GGUF de la variante solo texto de la familia: https://huggingface.co/unsloth/Phi-4-mini-instruct-GGUF
- Ficha de índice de modelos Phi-4-mini: https://local-ai-zone.github.io/models/phi-4-mini-instruct.html
- Registro de terceros del modelo abliterado: https://free2aitools.com/model/huihui-ai/phi-4-multimodal-instruct-abliterated
- Cuenta del autor de la abliteración: https://x.com/support_huihui
