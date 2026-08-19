# mradermacher/Qwen3.8-27B-Samantha-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo Lathly/Qwen3.8-27B-Samantha, un merge del modelo Qwen3.8-27B con el dataset Samantha-1.1-uncensored de digitalpipelines. El resultado es un modelo conversacional de 27 000 millones de parámetros, orientado al diálogo natural y sin restricciones de censura, que además conserva las capacidades multimodales del modelo base (incluye proyectores de visión en formato GGUF). La cuantización ha sido realizada por mradermacher, un autor conocido por publicar versiones GGUF de numerosos modelos open source, y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo radica en que permite ejecutar localmente un asistente conversacional de gran tamaño con hardware de consumo, gracias a las distintas opciones de cuantización que van desde Q2_K (11 GB) hasta Q8_0 (29 GB). El modelo base Qwen3.8-27B, según la información disponible, incorpora un codificador de visión y una ventana de contexto de 262 000 tokens, características que probablemente se heredan en este merge, aunque no están explícitamente documentadas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B, con componente multimodal) |
| Parametros totales | 27 320 697 856 (~27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (heredado de Qwen3.8-27B, no confirmado en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; adicionalmente mmproj-Q8_0 y mmproj-f16 para el proyector multimodal |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Lathly/Qwen3.8-27B-Samantha es un merge que combina el modelo Qwen3.8-27B (un transformer denso de 27 000 millones de parámetros con capacidades multimodales y una ventana de contexto de 262 000 tokens) con el dataset Samantha-1.1-uncensored. Samantha es una serie de datasets conversacionales diseados para producir asistentes empáticos y naturales, y la version "uncensored" elimina las restricciones habituales de contenido. El proceso de merge no esta documentado en detalle, pero los tags indican que se trata de un modelo "merged" y "multimodal". El autor mradermacher ha realizado una cuantizacion estatica a formato GGUF, sin utilizar imatrix ni pesos ponderados, segun indica en la model card. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Conversacion y dialogo: entrenado especificamente con el dataset Samantha para mantener conversaciones naturales, empaticas y con personalidad.
- Generacion de texto sin censura: al ser una version "uncensored", no aplica los filtros de seguridad habituales, lo que permite abordar temas que otros modelos rechazarian.
- Multimodalidad: el modelo incluye proyectores de vision (mmproj) en formato GGUF, lo que sugiere que puede procesar imagenes junto con texto, aunque no se detallan las capacidades exactas.
- Razonamiento y codigo: heredados de Qwen3.8-27B, que es un modelo de proposito general con buen rendimiento en tareas de razonamiento, matematicas y generacion de codigo.
- Soporte de tool calling: no se menciona explicitamente en la documentacion, pero es una capacidad comun en la familia Qwen 3; no se puede confirmar.
- Idiomas: la model card solo declara ingles, aunque el modelo base podria soportar mas idiomas; no hay evidencia de ello en este repositorio.

## Casos de uso

- Asistente conversacional local: se puede desplegar en una maquina con GPU de 16-24 GB usando la cuantizacion Q4_K_M (16,9 GB) para obtener un chatbot personalizado sin dependencia de servicios en la nube, ideal para entornos con requisitos de privacidad.
- Roleplay y personajes: gracias al entrenamiento con Samantha, el modelo mantiene una personalidad coherente y empatica, adecuado para juegos de rol textual o creacion de personajes ficticios.
- Generacion de historias creativas: su capacidad para mantener contexto largo (hasta 262k tokens) permite escribir relatos extensos con coherencia argumental, util para autores o guionistas.
- Prototipado rapido de chatbots: al ser un modelo abierto y sin censura, se puede usar para experimentar con interacciones que otros modelos rechazarian, facilitando el desarrollo de productos conversacionales en fases tempranas.
- Analisis de imagenes con descripcion textual: si se utiliza el proyector multimodal, se pueden cargar imagenes y obtener descripciones o respuestas contextuales, aunque esta funcionalidad no esta documentada en detalle.
- Educacion y entretenimiento: como asistente de estudio o compañero de conversacion para practicar idiomas (solo ingles) o explorar temas cientificos, gracias a su base Qwen3.8-27B con buenas capacidades de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otros tests estandar. La unica referencia de rendimiento indirecta es la velocidad de 7,11 tokens por segundo medida en un articulo externo para la cuantizacion de 4 bits de Qwen3.8-27B, pero no es especifica de este modelo Samantha y depende del hardware utilizado.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamaño de los archivos GGUF, la cuantizacion Q4_K_M ocupa 16,9 GB, por lo que cabe en una GPU de 24 GB (RTX 3090, RTX 4090) o en configuraciones de doble GPU de 12 GB. La Q8_0 ocupa 29,1 GB y requiere una GPU de 32 GB (A100, H100) o multiples GPUs.
- GPU recomendadas: para uso local con Q4_K_M, una RTX 3090 o RTX 4090 es suficiente. Para Q8_0, se recomienda una A100 40 GB o H100.
- Si cabe en consumer GPU: si, las cuantizaciones Q2_K (11 GB) y Q3_K_S (12,4 GB) pueden caber en una RTX 3080 de 10 GB o similar, aunque con perdida de calidad.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato. Tambien se menciona vLLM en los tags, aunque vLLM suele usar safetensors; habria que convertir el modelo a formato HuggingFace para usarlo con vLLM.
- Latencia y throughput: no se proporcionan datos oficiales. El articulo de ofox.ai menciona 7,11 tok/s para una cuantizacion de 4 bits, probablemente en una RTX 4090, pero no es un dato confirmado para este modelo especifico.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa. El modelo mas cercano seria el Qwen3.8-27B original (sin el merge Samantha), del cual se diferencian por el entrenamiento conversacional y la ausencia de censura. Otros modelos GGUF de 27B como los de la serie Llama 3.3 o Mistral podrian compararse, pero no hay datos de benchmarks en esta documentacion. Se recomienda consultar las paginas de HuggingFace de los modelos base para obtener metricas comparativas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo sin censura, puede generar contenido ofensivo, discriminatorio o inapropiado. No se han realizado evaluaciones de sesgo en este repositorio.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en contextos largos. No hay garantias de veracidad.
- Limitaciones de idioma: solo se declara ingles; el uso en otros idiomas puede degradar significativamente la calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset Samantha-1.1-uncensored puede tener sus propias condiciones; se debe verificar su licencia antes de un despliegue en produccion.
- Caveat para produccion: al ser una cuantizacion estatica sin imatrix, puede haber una perdida de calidad respecto al modelo original en precision completa. Ademas, la funcionalidad multimodal no esta documentada en detalle y podria requerir ajustes adicionales.
- El modelo no tiene descargas ni likes en HuggingFace, lo que indica que es un repositorio reciente y sin validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Samantha-GGUF
- Modelo base (Lathly/Qwen3.8-27B-Samantha): https://huggingface.co/Lathly/Qwen3.8-27B-Samantha
- Articulo sobre cuantizaciones de Qwen3.8-27B (kingy.ai): https://kingy.ai/blog/qwen3-8-27b-best-quantization-gguf/
- Guia para ejecutar Qwen3.8-27B localmente (yottalabs.ai): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Analisis de VRAM para Qwen3.8-27B (ofox.ai): https://ofox.ai/blog/qwen-3-8-27b-run-locally-vram-gguf-2026/
