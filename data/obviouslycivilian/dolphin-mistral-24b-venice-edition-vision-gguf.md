# obviouslycivilian/Dolphin-Mistral-24B-Venice-Edition-Vision-GGUF

## Resumen

Dolphin-Mistral-24B-Venice-Edition-Vision-GGUF es una cuantización en formato GGUF (Q4_K_M) del modelo Dolphin-Mistral-24B-Venice-Edition, un fine-tune de Mistral-Small-24B-Instruct-2501 desarrollado por dphn.ai en colaboración con Venice.ai. La particularidad de esta versión es que conserva la capacidad de procesamiento de imágenes (visión) mediante un archivo mmproj incluido, algo que otras cuantizaciones del mismo modelo no ofrecen debido a un bug en la herramienta de conversión de llama.cpp. El autor, obviouslycivilian, ha corregido manualmente ese fallo, lo que permite usar el modelo con entrada de imágenes en entornos como Ollama o llama.cpp.

El modelo base es un transformer multimodal de aproximadamente 23,57 mil millones de parámetros, con arquitectura Pixtral/Mistral3, y está diseñado para ser altamente dirigible y sin censura, de modo que el system prompt define todos los límites de comportamiento. Esta cuantización facilita su ejecución en hardware de consumo, manteniendo la licencia Apache 2.0 del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Pixtral/Mistral3) con encoder de visión |
| Parametros totales | 23.572.403.200 (~23,57 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (en este repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo de texto + mmproj separado para visión) |

## Arquitectura y entrenamiento

El modelo original Dolphin-Mistral-24B-Venice-Edition es un fine-tune de Mistral-Small-24B-Instruct-2501, un transformer multimodal de la familia Mistral 3 / Pixtral. El fine-tune fue realizado por dphn.ai y Venice.ai con el objetivo de eliminar comportamientos de rechazo y hacer el modelo completamente dirigible mediante el system prompt. No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) en la información proporcionada.

La cuantización Q4_K_M se generó con las herramientas de llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`). El autor detectó y corrigió un bug en la exportación del proyector de visión (mmproj) que afectaba a los modelos Pixtral/Mistral3: faltaba el tensor `v.token_embd.img_break`, necesario para el token de ruptura de imagen. La corrección consistió en extraer manualmente esa fila de la tabla de embeddings del modelo original y parchearla en el archivo mmproj, almacenándola en formato F32 en lugar de F16 para evitar fallos en la inferencia.

## Capacidades

- Generación de texto y chat conversacional, con control total del comportamiento mediante el system prompt.
- Procesamiento de imágenes: entrada de imágenes y generación de descripciones o respuestas basadas en contenido visual (gracias al mmproj corregido).
- Razonamiento y comprensión de lenguaje natural, heredados de Mistral-Small-24B-Instruct-2501.
- Capacidad de seguir instrucciones complejas y mantener conversaciones multi-turno.
- Sin censura: el modelo no incorpora filtros de rechazo, por lo que puede generar contenido que otros modelos bloquean, siempre que el system prompt lo permita.
- Soporte para despliegue local con Ollama y llama.cpp, incluyendo servidor HTTP con `llama-server`.

## Casos de uso

- Asistente multimodal local: desplegar el modelo con Ollama o llama.cpp para crear un chatbot que acepte imágenes y texto, útil en entornos con requisitos de privacidad o sin conexión a internet.
- Análisis de imágenes en entornos controlados: generar descripciones detalladas de fotografías, diagramas o capturas de pantalla, aprovechando la ventana de contexto y la capacidad de visión.
- Generación de contenido creativo sin restricciones: redacción de guiones, narrativa o material de marketing donde se requiera explorar temas sensibles o no convencionales, con el system prompt como único límite.
- Investigación en dirigibilidad y alineación: estudiar cómo el system prompt modifica el comportamiento del modelo, dado que está específicamente diseñado para ser altamente steerable.
- Prototipado de aplicaciones de visión por computador: combinar la entrada de imágenes con instrucciones en lenguaje natural para tareas como clasificación, detección de objetos o respuesta a preguntas visuales.
- Despliegue en hardware de consumo: al ser una cuantización Q4_K_M, puede ejecutarse en GPUs con 16 GB de VRAM, lo que permite usarlo en estaciones de trabajo o equipos personales sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa ~13,4 GB, más ~838 MB del mmproj, totalizando ~14,2 GB. Se recomienda al menos 16 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB) o superiores. También puede ejecutarse en GPUs con 16 GB como la RTX 3080 Ti o RTX 4060 Ti, aunque con menor margen.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama alta para consumidores con 16 GB o más.
- Opciones de despliegue: llama.cpp (incluyendo `llama-server`), Ollama (mediante Modelfile), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Dolphin-Mistral-24B-Venice-Edition-Vision (este) | ~23,57 B | No disponible | Sí | Apache 2.0 | GGUF |
| Mistral-Small-24B-Instruct-2501 (base) | ~23,57 B | No disponible | No | Apache 2.0 | Safetensors |
| Pixtral-12B | ~12 B | No disponible | Sí | Apache 2.0 | Safetensors |
| LLaVA-NeXT (variante 34B) | ~34 B | No disponible | Sí | Apache 2.0 | Safetensors |

La comparativa es cualitativa, ya que no se dispone de datos de rendimiento. Este modelo se distingue por su naturaleza "uncensored" y su capacidad de visión en formato GGUF, algo poco común en cuantizaciones de modelos Pixtral.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso si no se controla adecuadamente mediante el system prompt. El despliegue en producción requiere medidas de moderación externas.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en tareas de razonamiento o hechos específicos.
- La longitud de contexto no está documentada en la información proporcionada; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en producción.
- El bug corregido en el mmproj es un parche manual; futuras versiones de llama.cpp podrían cambiar el formato y requerir una nueva conversión.
- No se especifican los idiomas soportados; aunque Mistral-Small tiene capacidades multilingües, no hay garantía de cobertura uniforme.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado por el modelo puede estar sujeto a regulaciones legales según el contexto de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/obviouslycivilian/Dolphin-Mistral-24B-Venice-Edition-Vision-GGUF
- Modelo base (fine-tune): https://huggingface.co/dphn/Dolphin-Mistral-24B-Venice-Edition
- Modelo original Mistral-Small-24B-Instruct-2501: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Otras cuantizaciones GGUF (text-only): https://huggingface.co/bartowski/cognitivecomputations_Dolphin-Mistral-24B-Venice-Edition-GGUF
- Repositorio GGUF oficial (sin pesos): https://huggingface.co/dphn/Dolphin-Mistral-24B-Venice-Edition-GGUF
