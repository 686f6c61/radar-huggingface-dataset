# Piter254/Gemma-4-12B-uncensored-exl3-6.0bpw

## Resumen

El modelo `Piter254/Gemma-4-12B-uncensored-exl3-6.0bpw` es una cuantización en formato exl3 de 6.0 bits por peso (bpw) del modelo base `lemuralabs/Gemma-4-12B-uncensored-bf16`, desarrollado por Lemura Labs. Este último es una versión "abliterada" (refusal-ablated) del modelo multimodal Gemma-4-12B de Google, es decir, se ha eliminado el mecanismo de rechazo a ciertos prompts para permitir una generación de contenido sin restricciones temáticas. La cuantización exl3 reduce el tamaño del modelo para facilitar su ejecución en hardware de consumo, manteniendo un equilibrio entre calidad y eficiencia.

El modelo es multimodal (any-to-any), capaz de procesar y generar texto e imágenes, y se distribuye bajo licencia Apache-2.0. Aunque el nombre sugiere 12 mil millones de parámetros, los pesos reales en safetensors suman 5.503.328.048 parámetros, probablemente debido a la técnica de cuantización o a una poda previa. El repositorio ocupa 11 GB, lo que lo hace adecuado para GPUs con al menos 8 GB de VRAM. Su relevancia radica en ofrecer una alternativa sin censura para tareas creativas y de análisis multimodal, aunque con los riesgos asociados a la eliminación de filtros de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer multimodal, basado en Gemma 4) |
| Parametros totales | 5.503.328.048 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6.0 bpw (exl3) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (exl3) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Se sabe que es una cuantización exl3 de 6.0 bpw del modelo `lemuralabs/Gemma-4-12B-uncensored-bf16`, que a su vez deriva de `google/gemma-4-12B`. El proceso de abliteración (refusal-ablated) elimina las activaciones que producen rechazo a ciertos contenidos, lo que permite respuestas sin restricciones temáticas. La cuantización exl3 es una técnica de compresión que reduce la precisión de los pesos a 6 bits, optimizando el uso de memoria y acelerando la inferencia en GPUs compatibles con el runtime ExLlama. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entradas de texto e imagen y produce salidas de texto (any-to-any).
- Generacion de contenido sin censura: al ser abliterado, no rechaza prompts sobre temas sensibles o controvertidos.
- Soporte de conversacion multi-turno: puede mantener dialogos extensos, aunque la longitud de contexto no esta documentada.
- Capacidades multilingues: no especificadas, pero el modelo base de Google soporta multiples idiomas.
- No se ha confirmado soporte de tool calling, function calling o agentes.

## Casos de uso

- Creacion de contenido creativo sin restricciones: escritores y guionistas pueden generar narrativas, dialogos o ideas para historias que aborden temas tabu o controvertidos sin que el modelo se niegue a responder.
- Analisis de imagenes con interpretacion libre: el modelo puede describir o analizar fotografias, ilustraciones o diagramas sin las limitaciones de seguridad tipicas, util para investigacion artistica o critica visual.
- Generacion de codigo con comentarios explicativos: aunque no esta confirmado, al ser un modelo multimodal podria asistir en programacion, generando ejemplos de codigo y explicaciones tecnicas.
- Simulacion de personajes o escenarios de rol: en juegos de rol o narrativa interactiva, el modelo puede interpretar personajes sin censura, ofreciendo respuestas mas naturales en contextos adultos.
- Traduccion y adaptacion de contenido: para traducir textos que contengan lenguaje explicito o temas delicados, donde los modelos censurados podrian alterar el significado.
- Prototipado de aplicaciones de vision por computador: al procesar imagenes, puede servir para generar descripciones o etiquetas en entornos de investigacion donde se requiera flexibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas para este modelo cuantizado.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 11 GB, pero los pesos cuantizados a 6 bits para 5.5B parametros requieren aproximadamente 4-5 GB de VRAM para los pesos, mas overhead de activaciones y contexto. Se estima un minimo de 8 GB de VRAM para inferencia fluida.
- GPUs recomendadas: tarjetas consumer con 8 GB o mas, como RTX 3060, RTX 4060, RTX 3070, o superiores. Para mayor velocidad, se recomienda RTX 3090 o RTX 4090.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media con 8 GB de VRAM.
- Opciones de despliegue: al ser formato exl3, se puede ejecutar con ExLlamaV2 o ExLlamaV3, asi como a traves de interfaces como oobabooga text-generation-webui. No se ha confirmado compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. Como referencia, el modelo base sin cuantizar `lemuralabs/Gemma-4-12B-uncensored-bf16` tiene 12B parametros (aunque el peso real aqui es 5.5B, posiblemente por poda) y el original `google/gemma-4-12B` es un modelo multimodal de Google. Alternativas en el mismo rango de tamano podrian ser Llama-3.1-8B o Mistral-7B, pero no se han encontrado comparaciones directas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una version abliterada, el modelo puede generar contenido ofensivo, discriminatorio o peligroso sin filtros, lo que supone un riesgo en entornos de produccion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar informacion, especialmente en temas especializados.
- Limitaciones de contexto: la longitud de contexto no esta documentada, por lo que no se garantiza un rendimiento optimo en conversaciones muy largas.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el uso comercial debe cumplir con las politicas de Google sobre el modelo base Gemma, que pueden imponer restricciones adicionales.
- Caveat de produccion: la cuantizacion a 6 bits puede degradar la calidad de las respuestas en comparacion con el modelo en bf16, especialmente en tareas de razonamiento complejo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Piter254/Gemma-4-12B-uncensored-exl3-6.0bpw
- Modelo base (Lemura Labs): https://huggingface.co/lemuralabs/Gemma-4-12B-uncensored-bf16
- Modelo original de Google: https://huggingface.co/google/gemma-4-12B
