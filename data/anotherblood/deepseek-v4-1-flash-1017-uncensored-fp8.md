# AnotherBlood/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es una variante del modelo multimodal DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario AnotherBlood (con marca dealignai) en la que se ha eliminado el comportamiento de rechazo mediante edición directa de pesos (abliteration). El resultado es un modelo que responde a peticiones en categorías que el modelo base declina, conservando las capacidades originales de visión, vídeo, razonamiento por niveles, tool calling, decodificación especulativa DSpark y contexto nativo de 1M de tokens.

Arquitectónicamente es un transformer MoE de 40 capas con 763.205.315.794 parámetros totales (según los safetensors del repo), pesos nativos FP8 (e4m3fn) con escalas de bloque ue8m0 y expertos en FP4, distribuidos en 48 shards de safetensors que ocupan 510,3 GB en el repositorio. El modelo es byte-compatible con el motor `inference/` de referencia de DeepSeek, por lo que se carga sin cambios de código respecto al modelo base.

La relevancia de esta ficha es doble: por un lado documenta un modelo de frontera de 763B parámetros con contexto de un millón de tokens y capacidades multimodales; por otro, ilustra una técnica de modificación de pesos sin fine-tuning ni RLHF que altera el perfil de seguridad del modelo, con implicaciones legales y de despliegue que conviene evaluar antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 40 capas, con expertos en FP4 y pesos FP8 nativos (e4m3fn) con escalas de bloque ue8m0 |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 nativo (e4m3) para pesos generales y FP4 para expertos MoE; existe una variante hermana EXL3 de 2,9 bpw |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards), FP8 e4m3fn con escalas ue8m0, FP4 en expertos |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de 40 capas. El checkpoint se distribuye en precisión nativa FP8 (e4m3fn) con escalas de bloque ue8m0 y expertos MoE en FP4, el mismo formato que publica DeepSeek para el modelo original. Incluye el motor de inferencia de referencia (`inference/`) y el renderizador de prompts (`encoding/`) sin modificar, y soporta decodificación especulativa DSpark. El pipeline declarado es image-text-to-text, con soporte de imagen y vídeo además de texto.

Sobre el entrenamiento del modelo base, la información disponible no detalla el número de tokens, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Respecto a esta variante concreta, la model card es explícita: no hay supervised fine-tuning, ni RLHF, ni DPO, ni LoRA o adaptadores; no se modifican vocabulario ni tokenizer; y no se altera la plantilla de chat ni se inyecta un system prompt. La modificación es exclusivamente a nivel de pesos, aplicada sobre el checkpoint FP8 nativo, manteniendo los tensores parcheados en FP8 e4m3 con su granularidad de bloque original. La model card advierte que cuantizar este bundle a bits bajos de forma ingenua acumula error de cuantización sobre la edición de abliteration y puede degradar la conformidad, por lo que recomienda rehacer el pipeline de abliteration en la precisión objetivo.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`).
- Comprensión de imagen y vídeo (pipeline image-text-to-text), con evaluación del modelo base en tareas de grounding temporal y espacial sobre vídeo.
- Tool calling y function calling, conservados del modelo base.
- Contexto nativo de 1M de tokens, adecuado para documentos y conversaciones muy largas.
- Multilingüe en inglés, chino, español, francés, ruso, italiano y tailandés.
- Decodificación especulativa DSpark para acelerar la generación.
- Comportamiento sin rechazo: responde a peticiones en categorías que el modelo base declina, sin plantilla de jailbreak ni system prompt inyectado.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).

## Casos de uso

- Análisis de documentos extensos: con 1M de tokens de contexto, el modelo puede ingerir contratos, expedientes o bases de código completas en una sola pasada y responder preguntas cruzadas sin trocear el material.
- Procesamiento de vídeo e imagen: al ser image-text-to-text, sirve para generar descripciones, responder preguntas sobre fotogramas y hacer grounding temporal en flujos de vigilancia, archivística o análisis de medios.
- Atención al cliente multi-turno: la ventana de 1M tokens permite mantener historiales largos y documentación de producto en contexto, con tool calling para consultar sistemas internos.
- Generación de código con integración en pipelines: el soporte de tool calling y el contexto largo permiten pasar repositorios completos y ejecutar flujos de agente sobre CI/CD, aunque conviene validar el comportamiento tras la abliteration.
- Investigación sobre seguridad y alineación: el modelo sirve como objeto de estudio para medir cómo la edición de pesos afecta a la conformidad, el razonamiento y las tasas de alucinación frente al base.
- Escenarios creativos y de contenido para adultos: es el uso declarado de la release, con acceso restringido por gate de edad y aceptación de responsabilidad.
- Despliegue soberano o air-gapped: la licencia MIT y la disponibilidad de pesos completos permiten servirlo en infraestructura propia sin dependencia de API externa.

## Benchmarks y rendimiento

La model card incluye una evaluación interna de MMLU en modo logit (57 materias × 20 preguntas, 1140 en total), con prompt idéntico, modo chat sin razonamiento, greedy T=0 y argmax del primer token. El bundle se ejecutó con el motor `inference/` de referencia sobre 4×H200 (TP4); el base se evaluó contra la API oficial de DeepSeek sirviendo los mismos pesos 1017.

| Modelo | MMLU-20×57 | Δ vs base |
|---|---:|---:|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140) | — |
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 | no disponible en la información proporcionada | no disponible |

El fragmento disponible de la model card se corta antes de mostrar la fila del modelo abliterated, por lo que no se puede afirmar su resultado. No se han publicado en la información disponible resultados de HumanEval, GSM8K ni de otros benchmarks para esta variante.

## Requisitos de hardware

- El repositorio ocupa 510,3 GB en safetensors FP8/FP4, por lo que la inferencia en precisión nativa requiere un nodo multi-GPU con al menos ese orden de magnitud de VRAM agregada.
- La model card reporta la evaluación sobre 4×H200 con tensor parallelism 4 (TP4) usando el motor `inference/` de referencia de DeepSeek.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en su formato nativo; haría falta una cuantización de bits bajos, y la propia model card advierte que cuantizar este bundle de forma ingenua degrada la calidad y la conformidad.
- Opciones de despliegue: motor `inference/` de referencia incluido en el repo, con compatibilidad de endpoints; el formato es byte-compatible con el base, por lo que cualquier stack que cargue DeepSeek-V4.1-Flash-1017 debería cargar esta variante.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este) | 763,2B | 1M | Texto, imagen, vídeo | MIT | Abliterated, FP8/FP4 nativo |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 763,2B (mismo checkpoint) | 1M | Texto, imagen, vídeo | no disponible en la información | Modelo original con rechazos; referencia de MMLU 87,63 % |
| deepalignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | no disponible | 1M | Texto, imagen, vídeo | no disponible en la información | Variante hermana de 2,9 bpw construida rehaciendo el pipeline de abliteration en baja precisión |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo checkpoint.

## Limitaciones y advertencias

- La abliteration elimina los rechazos del modelo base; esto incluye categorías potencialmente dañinas o ilegales según la jurisdicción. La model card exige confirmar mayoría de edad y aceptar responsabilidad total por las salidas.
- El acceso está restringido por un gate (nombre, afiliación, país, caso de uso, confirmación de edad y aceptación de responsabilidad), otorgado a discreción del propietario del repositorio.
- La licencia es MIT, lo que permite uso comercial, pero la licencia no exime del cumplimiento de la normativa aplicable sobre contenido generado ni de las políticas de las plataformas donde se despliegue.
- La model card advierte que las cuantizaciones de bits bajos derivadas directamente de este bundle acumulan error sobre la edición de abliteration y pueden degradar la conformidad; para baja precisión recomienda rehacer el pipeline.
- No se han publicado en la información disponible datos de sesgo, tasas de alucinación ni evaluaciones de seguridad de esta variante; el único dato de benchmark disponible es el MMLU del modelo base (87,63 %).
- El modelo base declara siete idiomas (en, zh, es, fr, ru, it, th); no hay información sobre calidad relativa por idioma en esta variante.
- El tamaño (763B parámetros, 510 GB en disco) limita el despliegue a infraestructura multi-GPU de gama alta.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AnotherBlood/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Alias del mismo repo: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante hermana EXL3 2,9 bpw: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Árbol de ficheros del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/tree/main
- Twitter del autor: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
- Apoyo al desarrollo: https://ko-fi.com/dealignai
