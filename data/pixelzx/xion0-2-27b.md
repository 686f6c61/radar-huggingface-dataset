# PIXELZX/XION0.2-27B

## Resumen

XION 0.2 27B es un modelo de lenguaje conversacional multilingüe desarrollado por el equipo PIXELZX, publicado en Hugging Face con licencia Apache-2.0. Se trata de un modelo experimental derivado de `Jiunsong/SuperQwen3.8-27b-abliterated`, que a su vez se basa en `Qwen/Qwen3.8-27B`. El objetivo declarado es ofrecer un asistente sin censura (uncensored) capaz de manejar tanto respuestas directas como razonamiento inferencial, con soporte para varios idiomas asiáticos y occidentales.

El modelo hereda la arquitectura Qwen3.8, que es multimodal (soporta entrada de imagen y vídeo en su configuración original), aunque el fine-tuning realizado por PIXELZX se limita exclusivamente a datos de texto. Con 27 356 millones de parámetros y una longitud de contexto nativa de 262 144 tokens, XION 0.2 27B está pensado para tareas de conversación de largo alcance y razonamiento complejo. Sin embargo, al ser una versión experimental, no se han publicado resultados de benchmarks independientes y la licencia de distribución final no está claramente definida en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Qwen3.8) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens (configuración nativa Qwen3.8) |
| Tipos de cuantizacion | bf16 (pesos originales en safetensors); no se ofrecen cuantizaciones GGUF en el repositorio |
| Idiomas soportados | en, ko, ja, zh (según metadatos; la model card menciona 13 idiomas en los datos de entrenamiento, sin especificar cuáles) |
| Licencia | Apache-2.0 (declarada en el repositorio, pero la model card indica que la licencia de distribución final no está declarada) |
| Formato de pesos | safetensors (también etiquetado para vLLM) |

## Arquitectura y entrenamiento

XION 0.2 27B parte del checkpoint `Jiunsong/SuperQwen3.8-27b-abliterated`, que es una versión de Qwen3.8-27B con la técnica de "abliteration" (reducción de rechazos) aplicada. La arquitectura subyacente es un transformer causal multimodal, aunque el fine-tuning realizado por PIXELZX se ha hecho únicamente con datos de texto conversacional e instrucciones. El método de entrenamiento es supervisado (SFT) sobre el dataset `saidutta69/fable-5-premium`, que está etiquetado como MIT. Este dataset incluye trazas de agentes serializadas, pero la model card advierte que no garantiza ejecución real de herramientas ni código seguro.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La etiqueta "reasoning" sugiere que el modelo está optimizado para cadenas de razonamiento, pero no hay documentación técnica que lo confirme.

## Capacidades

- Generación de texto conversacional en múltiples idiomas (inglés, coreano, japonés, chino).
- Razonamiento inferencial: el modelo puede producir respuestas directas o cadenas de razonamiento, según el prompt.
- Soporte de contexto largo: hasta 262 144 tokens, lo que permite mantener conversaciones extensas o procesar documentos largos.
- Capacidad multimodal heredada: la arquitectura Qwen3.8 soporta entrada de imagen y vídeo, pero el fine-tuning de XION es solo texto, por lo que no se garantiza un rendimiento fiable en tareas multimodales.
- Sin censura (uncensored): al estar basado en un checkpoint abliterated, el modelo no aplica filtros de rechazo estándar, lo que permite generar contenido que otros modelos rechazarían.
- No se documenta soporte explícito de tool calling o function calling; las trazas de agentes en el dataset no implican ejecución real de herramientas.

## Casos de uso

- Asistentes conversacionales sin restricciones: el modelo puede emplearse en entornos donde se requiere una respuesta libre de filtros de seguridad, como investigación sobre generación de contenido controvertido o simulación de diálogos abiertos. Su contexto largo permite mantener hilos de conversación extensos.
- Generación de ficción y narrativa creativa: gracias a su capacidad de razonamiento y su naturaleza multilingüe, puede redactar historias, guiones o diálogos en varios idiomas, adaptándose a estilos y tonos variados.
- Traducción informal y localización: con soporte para en, ko, ja y zh, puede utilizarse para traducir textos coloquiales o adaptar contenido cultural, aunque no se han validado sus métricas de calidad en traducción.
- Análisis de documentos largos: su ventana de contexto de 262 144 tokens permite procesar informes, artículos o libros completos para extraer resúmenes o responder preguntas sobre el contenido.
- Prototipado de agentes conversacionales: el dataset Fable-5 incluye trazas de agentes, por lo que el modelo puede servir para experimentar con flujos de diálogo multi-turno y razonamiento encadenado, aunque sin garantía de ejecución de herramientas externas.
- Investigación sobre alineación y seguridad: al ser un modelo abliterated, es útil para estudiar comportamientos de modelos sin filtros de rechazo, siempre que se implementen medidas de moderación a nivel de aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo es experimental y que no existen resultados independientes. Además, advierte que los resultados de Qwen3.8 no deben presentarse como resultados de XION. Por tanto, no se incluyen tablas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55-60 GB (27 356 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache. Para contexto largo, se necesita memoria adicional.
- GPU recomendadas: A100 80GB, H100 80GB o GPUs con 80 GB de VRAM para ejecución en bf16 sin cuantización. Con cuantización de 4 bits (no proporcionada en el repo, pero posible mediante herramientas externas), la VRAM necesaria se reduce a ~14-16 GB, permitiendo su uso en RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Opciones de despliegue: vLLM (etiquetado en el repo), llama.cpp, Ollama, TGI. El formato safetensors es compatible con la mayoría de frameworks.
- Latencia y throughput: no hay datos oficiales. En sistemas con AMD Ryzen AI Max+ se ha reportado hasta 51,8 tokens por segundo para Qwen3.8-27B, pero no se ha validado para XION.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| XION 0.2 27B | 27,36 B | 262 144 | Apache-2.0 (declarada, no final) | Hugging Face |
| Qwen3.8-27B (base) | 27 B | 262 144 | Apache-2.0 | Hugging Face |
| SuperQwen3.8-27b-abliterated | 27 B | 262 144 | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo. XION se diferencia de su base por el fine-tuning con Fable-5 y por su naturaleza abliterated, pero no hay métricas que lo posicionen frente a otros modelos de su tamaño.

## Limitaciones y advertencias

- Modelo experimental: no tiene resultados de benchmarks independientes y el checkpoint publicado puede no ser el final.
- Sin alineación de seguridad: al ser abliterated, puede generar contenido dañino, ilegal, sesgado o inapropiado. No debe desplegarse en producción sin moderación a nivel de aplicación.
- Riesgo de alucinación: las secciones de razonamiento no deben tratarse como hechos verificados ni exponerse como explicaciones autoritativas.
- Limitaciones de idioma: aunque se declaran 13 idiomas en los datos de entrenamiento, solo se confirman en, ko, ja, zh en los metadatos. El rendimiento en otros idiomas no está garantizado.
- Multimodalidad no validada: la arquitectura soporta imagen y vídeo, pero el fine-tuning es solo texto; no se recomienda usar el modelo para tareas multimodales.
- Licencia incierta: aunque el repositorio indica Apache-2.0, la model card afirma que la licencia de distribución final no está declarada. Antes de usar los pesos, hay que revisar las licencias de los datos y del checkpoint base.
- Sin garantía de ejecución de herramientas: las trazas de agentes en Fable-5 no implican que el modelo pueda ejecutar código o llamar a funciones de forma fiable.

## Enlaces

- [PIXELZX/XION0.2-27B en Hugging Face](https://huggingface.co/PIXELZX/XION0.2-27B)
- [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Jiunsong/SuperQwen3.8-27b-abliterated](https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated)
- [Dataset saidutta69/fable-5-premium](https://huggingface.co/datasets/saidutta69/fable-5-premium)
