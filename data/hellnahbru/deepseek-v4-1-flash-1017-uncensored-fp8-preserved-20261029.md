# hellnahbru/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8-preserved-20261029

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8-preserved-20261029 es una versión modificada a nivel de pesos del modelo multimodal DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario hellnahbru (con créditos a @dealignai). El objetivo declarado es eliminar el comportamiento de rechazo (refusal) del modelo base —la técnica conocida como *abliteration*— preservando intactas todas las capacidades originales: visión, vídeo, niveles de esfuerzo de razonamiento, tool calling, decodificación especulativa DSpark y contexto nativo de 1M de tokens. El checkpoint se distribuye en el mismo formato nativo que el modelo original: FP8 (e4m3) con escalas de bloque ue8m0 y expertos MoE en FP4.

Arquitectónicamente es un transformer de tipo Mixture-of-Experts con 40 capas, 763.205.315.794 parámetros totales (según los safetensors del repo) y un repositorio de 510,3 GB distribuido en 48 shards. La modificación es exclusivamente de pesos: no hay cambios en la plantilla de chat, ni en el tokenizador, ni SFT, ni RLHF, ni DPO, ni adaptadores LoRA. Esto lo convierte en un reemplazo directo (*drop-in*) para cualquiera que ya sirva el modelo base con el motor `inference/` de DeepSeek.

Su relevancia es doble: por un lado, demuestra que la abliteration es viable a escala de cientos de miles de millones de parámetros manteniendo el formato de cuantización nativo; por otro, plantea cuestiones prácticas y legales sobre el uso de variantes sin censura en producción. La licencia declarada es MIT, aunque el modelo base proviene de DeepSeek y conviene verificar las condiciones de uso derivadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (40 capas), multimodal (imagen + vídeo) |
| Parámetros totales | 763.205.315.794 |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantización | FP8 (e4m3) nativo con escalas de bloque ue8m0; expertos MoE en FP4 |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT (según model card; verificar condiciones del modelo base) |
| Formato de pesos | safetensors (48 shards), FP8 e4m3, ~510,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer Mixture-of-Experts de 40 capas con expertos cuantizados en FP4 y pesos de atención/FFN compartidos en FP8 e4m3 con escalas de bloque ue8m0. Incorpora decodificación especulativa DSpark, contexto nativo de 1M de tokens y una torre multimodal que procesa imagen y vídeo. El pipeline declarado es `image-text-to-text`, y el modelo expone niveles de esfuerzo de razonamiento (`low`, `high`, `max`).

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). Respecto a esta variante concreta, la model card es explícita: no se ha realizado SFT, RLHF, DPO ni ajuste de preferencias; no se ha modificado el tokenizador ni la plantilla de chat; no hay LoRA ni hooks en tiempo de carga. La edición es puramente a nivel de pesos sobre el checkpoint FP8 nativo, aplicando la técnica de abliteration directamente sobre los tensores en su precisión original. La model card advierte que cuantizar este bundle a bits bajos de forma ingenua acumula error sobre la edición y puede degradar la conformidad; para versiones de baja precisión recomienda rehacer el pipeline sobre la precisión objetivo (existe un release hermano EXL3 2.9 bpw construido así).

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`).
- Comprensión multimodal de imagen y vídeo (pipeline `image-text-to-text`).
- Tool calling / function calling preservado del modelo base.
- Razonamiento multi-paso y uso en flujos de agentes.
- Contexto largo de hasta 1M de tokens para documentos extensos, bases de código o conversaciones prolongadas.
- Multilingüe en inglés, chino, español, francés, ruso, italiano y tailandés.
- Decodificación especulativa DSpark para acelerar la inferencia.
- Comportamiento sin rechazo: responde a solicitudes en categorías que el modelo base declinaría.

## Casos de uso

- Investigación sobre alineación y seguridad: estudiar cómo se comporta un modelo de gran escala tras eliminar los mecanismos de rechazo, comparando respuestas con el base en conjuntos controlados.
- Análisis de documentos largos con imágenes: informes financieros, expedientes o papers de cientos de páginas con figuras, aprovechando el contexto de 1M tokens y la entrada multimodal.
- Procesamiento de vídeo para extracción de información estructurada: resúmenes de grabaciones, indexación de contenido audiovisual o generación de descripciones técnicas.
- Agentes autónomos con tool calling: pipelines que encadenan búsqueda, ejecución de código y consultas a APIs, donde el modelo planifica y ejecuta pasos intermedios.
- Generación y revisión de código en entornos controlados: el contexto de 1M tokens permite cargar repositorios completos y razonar sobre dependencias entre ficheros.
- Creación de contenido sin restricciones temáticas para investigación creativa o redacción de ficción que aborde temas sensibles, con la supervisión humana correspondiente.
- Evaluación comparativa de cuantizaciones: servir el FP8 nativo como referencia frente a quants derivados (EXL3, GGUF) para medir la degradación de conformidad y calidad.

## Benchmarks y rendimiento

La model card incluye una evaluación interna de MMLU en modo logit (57 materias × 20 preguntas, 1140 en total), con prompt idéntico, modo chat sin razonamiento, greedy T=0 y argmax del primer token. El bundle modificado se ejecutó con el motor `inference/` de DeepSeek en 4×H200 (TP4); el base se evaluó contra la API oficial de chat completions de DeepSeek.

| Modelo | MMLU-20×57 | Δ vs base |
|---|---:|---:|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140) | — |
| DeepSeek-V4.1-Flash-1017 UNCENSORED FP8 (este repo) | no disponible en el extracto proporcionado | no disponible |

El extracto de la model card se interrumpe antes de mostrar el resultado del bundle modificado, por lo que no se dispone del dato completo. No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- El checkpoint completo ocupa 510,3 GB en disco; en FP8 nativo requiere del orden de 500 GB de VRAM agregada solo para pesos, más overhead de KV cache para contexto largo.
- La model card reporta ejecución en 4×H200 (TP4) con el motor `inference/` de DeepSeek, lo que da una referencia realista de despliegue.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en su forma nativa FP8; requeriría cuantizaciones de baja precisión derivadas (con la advertencia de la model card sobre pérdida de conformidad).
- Opciones de despliegue: motor `inference/` de DeepSeek incluido en el repo; compatibilidad con endpoints declarada en los tags. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa DSpark debería mejorar el throughput respecto a decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (UNCENSORED FP8) | 763,2 B | 1M | Sí (imagen + vídeo) | MIT (declarada) | Abliterated, FP8 nativo, 510 GB |
| DeepSeek-V4.1-Flash-1017 base | 763,2 B | 1M | Sí (imagen + vídeo) | Ver licencia DeepSeek | Con rechazos, misma arquitectura |
| DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | 763,2 B | 1M | Sí | MIT (declarada) | Abliteration rehecha a 2,9 bpw, menor huella |
| DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8 | 763,2 B | 1M | Sí | MIT (declarada) | Alias exacto de este repositorio |

Las alternativas con datos concretos se limitan a variantes del mismo modelo base; no se dispone de información sobre modelos comparables de otros proveedores en la documentación proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos implica que el modelo puede generar contenido dañino, ilegal o sexualmente explícito; el repo exige confirmar mayoría de edad y aceptación de responsabilidad mediante *gated access*.
- Riesgo elevado de alucinación y de respuestas plausibles pero incorrectas en temas donde el modelo base aplicaba cautela.
- La abliteration puede degradar sutilmente capacidades generales; la única métrica publicada (MMLU) no cubre seguridad, sesgos ni calidad multilingüe.
- La cuantización ingenua a bits bajos del bundle FP8 acumula error sobre la edición y puede reintroducir rechazos parciales; la model card recomienda rehacer el pipeline por precisión.
- La licencia MIT se declara sobre el repo, pero el modelo deriva de pesos de DeepSeek; es responsabilidad del usuario verificar las condiciones del modelo base para uso comercial.
- El acceso está restringido por gate (nombre, afiliación, país, caso de uso, confirmación de edad), lo que complica la automatización de descargas en CI/CD.
- No se aportan datos de sesgo, evaluación de toxicidad ni resultados en benchmarks distintos de MMLU.
- El contexto de 1M tokens exige infraestructura de memoria considerable; el rendimiento real en contextos extremos no está documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hellnahbru/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8-preserved-20261029
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Alias del mismo repo: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante EXL3 2.9 bpw sin censura: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Twitter del autor de la edición: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
- Apoyo al desarrollo (Ko-fi): https://ko-fi.com/dealignai
