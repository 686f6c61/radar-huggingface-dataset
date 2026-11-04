# Devopsopraiz/Baanzon-Action-1.1-Flash-R

## Resumen

Baanzon-Action-1.1-Flash-R es un fine-tune del modelo DeepSeek-V4.1-Flash-1017 publicado por el usuario Devopsopraiz en HuggingFace. Se trata de una variante "abliterated" (sin censura) del modelo base, en la que se ha eliminado el comportamiento de rechazo preservando las capacidades originales: visión, vídeo, razonamiento por niveles de esfuerzo, tool calling, decodificación especulativa DSpark y contexto nativo de 1 millón de tokens. El checkpoint se distribuye en FP8 nativo (e4m3) con escalas de bloque ue8m0 y expertos MoE en FP4, con 763 205 315 794 parámetros totales y un tamaño de repositorio de 510,3 GB.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo de escala frontier (más de 760 000 millones de parámetros) con arquitectura MoE de 40 capas y capacidades multimodales. Por otro, ilustra una práctica creciente en el ecosistema open source: la publicación de derivados "uncensored" que modifican los pesos para eliminar negativas de seguridad, algo que tiene implicaciones legales y éticas importantes para uso en producción.

El modelo se apoya en la librería transformers y declara compatibilidad con endpoints estándar. La model card incluye un gate de acceso que exige confirmar mayoría de edad y aceptación de responsabilidad sobre las salidas, lo que refleja la sensibilidad del contenido que puede generar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 40 capas (deepseek_v41), con vision-language |
| Parametros totales | 763 205 315 794 (~763 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1 000 000 tokens (1M) |
| Tipos de cuantizacion | FP8 nativo (e4m3) con escalas de bloque ue8m0; expertos MoE en FP4; existe un derivado EXL3 de 2,9 bpw |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards), FP8 e4m3 |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura de mezcla de expertos (MoE) de 40 capas, derivado del DeepSeek-V4.1-Flash-1017. Incorpora un codificador multimodal para imagen y vídeo, además de un motor de decodificación especulativa denominado DSpark. Los pesos se almacenan en FP8 nativo (e4m3fn) con escalas de bloque ue8m0, y los expertos MoE se guardan en FP4, lo que reduce el footprint respecto a un checkpoint en BF16.

La modificación respecto al modelo base es exclusivamente a nivel de pesos: se ha aplicado una técnica de "abliteration" para eliminar el comportamiento de rechazo. Según la model card, no se ha realizado SFT, RLHF, DPO ni ajuste de preferencias, no se ha modificado el tokenizer ni la plantilla de chat, y no se han introducido LoRA ni hooks en tiempo de carga. El formato en disco es byte-compatible con el modelo base, de modo que cualquier motor de inferencia que cargue el original puede cargar este. La model card advierte que cuantizar directamente este checkpoint FP8 no produce la mejor calidad, y que para versiones de baja precisión conviene rehacer el pipeline de abliteration sobre la precisión objetivo.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`).
- Comprensión de imágenes y vídeo (pipeline image-text-to-text).
- Tool calling y function calling.
- Razonamiento multi-paso y uso en flujos de agentes.
- Decodificación especulativa DSpark para acelerar la generación.
- Contexto largo de hasta 1 millón de tokens.
- Multilingüe en siete idiomas: inglés, chino, español, francés, ruso, italiano y tailandés.
- Comportamiento sin censura: el modelo responde a solicitudes en categorías que el base rechazaría.

## Casos de uso

- Análisis de documentos extensos: con 1M de tokens de contexto, el modelo puede procesar contratos, expedientes o bases de código completas en una sola pasada sin troceado, lo que simplifica pipelines de extracción y resumen.
- Atención al cliente automatizada: la ventana de contexto permite mantener conversaciones multi-turno largas con historial completo, y el soporte de tool calling facilita la integración con sistemas de ticketing y CRM.
- Generación y revisión de código en producción: el tool calling y el razonamiento por niveles permiten integrarlo en pipelines de CI/CD para revisión automática de parches, generación de tests y explicación de errores.
- Procesamiento de vídeo e imagen: al ser multimodal, sirve para moderación de contenido audiovisual, descripción automática de material grabado o extracción de información de capturas y documentos escaneados.
- Investigación en seguridad y alineación: al ser una variante abliterated, es útil para estudiar el comportamiento de modelos sin capas de rechazo, analizar sesgos y evaluar riesgos de jailbreak de forma controlada.
- Asistentes de razonamiento largo: con los niveles `high` y `max` y contexto de 1M, encaja en tareas de investigación que requieren cadenas de razonamiento extensas sobre grandes corpus.
- Traducción y localización multilingüe: cubre siete idiomas, incluido el tailandés, lo que permite flujos de traducción técnica con contexto amplio para mantener coherencia terminológica.

## Benchmarks y rendimiento

La model card incluye un benchmark interno de MMLU en modo logit (57 materias × 20 preguntas, 1140 en total), con decodificación greedy T=0 y el mismo prompt para ambos modelos. La comparación se realizó entre el bundle FP8 servido con el motor upstream en 4×H200 (TP4) y la API oficial de DeepSeek sirviendo los mismos pesos base.

| Modelo | MMLU (57 materias × 20) | Δ vs base |
|---|---:|---:|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140) | — |
| Baanzon-Action-1.1-Flash-R (este repo) | no disponible en la información proporcionada | no disponible |

El dato del modelo derivado no aparece completo en la información disponible; solo se confirma el resultado del base. No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, MMLU-Pro, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 763 B de parámetros en FP8, el checkpoint requiere del orden de 763 GB solo para pesos, más overhead de activaciones y caché KV para contexto de 1M, lo que en la práctica exige un clúster multi-GPU.
- GPU recomendadas: la model card reporta evaluaciones en 4×H200 con tensor parallelism 4; configuraciones equivalentes con H100, B200 o A100 de 80 GB en número suficiente también son viables, aunque el contexto de 1M dispara los requisitos de memoria.
- No cabe en GPU de consumo: ni RTX 4090 ni similares pueden alojar el modelo completo. Solo sería posible con cuantizaciones extremas y offloading, con latencia muy degradada.
- Opciones de despliegue: el motor de referencia `inference/` de DeepSeek incluido en el repo; al ser byte-compatible con el base, también debería cargarse con stacks que soporten el formato DeepSeek V4.1. La model card no confirma soporte explícito de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Baanzon-Action-1.1-Flash-R | ~763 B (MoE) | 1M | Sí (imagen + vídeo) | MIT | Fine-tune abliterated en FP8 |
| DeepSeek-V4.1-Flash-1017 (base) | ~763 B (MoE) | 1M | Sí | no disponible en la información | Modelo original con rechazos |
| deepseek-ai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (dealignai) | ~763 B (MoE) | 1M | Sí | no disponible en la información | Variante uncensored referenciada en la model card |
| deepseek-ai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED (dealignai) | ~763 B (MoE) | 1M | Sí | no disponible en la información | Cuantización EXL3 de 2,9 bpw rehaciendo el pipeline |

No se dispone de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: la eliminación del comportamiento de rechazo implica que puede generar contenido dañino, ilegal o explícitamente sensible. El gate de acceso exige ser mayor de edad y asumir responsabilidad sobre las salidas.
- Riesgo de alucinación: como cualquier LLM de gran escala, puede inventar hechos, referencias o código; no se han publicado evaluaciones específicas de factualidad para este fine-tune.
- Licencia MIT: permite uso comercial, pero el autor solicita atribución si se redistribuye, cuantiza o publica derivados. La licencia del modelo base debe verificarse por separado.
- Cuantización: la model card advierte que cuantizar directamente este checkpoint FP8 degrada la calidad y puede reintroducir rechazos a bajas precisiones; para baja precisión conviene rehacer el pipeline de abliteration.
- Contexto e idioma: aunque declara 1M de tokens, el rendimiento efectivo en contextos muy largos no está documentado en la información disponible. El soporte idiomático se limita a siete idiomas.
- Producción: no hay datos publicados de throughput, latencia ni estabilidad en despliegues; el tamaño del modelo obliga a infraestructura multi-GPU de gama alta.
- Reputación del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- HuggingFace: https://huggingface.co/Devopsopraiz/Baanzon-Action-1.1-Flash-R
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante uncensored de referencia: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Alias abliterated: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante EXL3 2,9 bpw: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Twitter del autor del derivado: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
