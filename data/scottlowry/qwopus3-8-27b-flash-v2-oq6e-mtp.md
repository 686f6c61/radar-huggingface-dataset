# scottlowry/Qwopus3.8-27B-Flash-V2-oQ6e-mtp

## Resumen

Qwopus3.8-27B-Flash-V2-oQ6e-mtp es una cuantización de 6 bits del modelo Jackrong/Qwopus3.8-27B-Flash-V2, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos con el herramienta oQ (oMLX v0.7.0), que aplica cuantización de precisión mixta sobre el modelo base para reducir el espacio en disco y la memoria necesaria en inferencia sin reentrenar la red.

El modelo base pertenece a la familia Qwopus 3.8, de tipo qwen3_5 según la model card, con 27.781.427.952 parámetros reales (aproximadamente 27,78 mil millones). El sufijo "mtp" del nombre apunta a cabezas de predicción multi-token (multi-token prediction), un mecanismo de decodificación especulativa que permite proponer varios tokens por paso y acelerar la generación. El repositorio ocupa 23,7 GB en formato MLX safetensors, lo que lo sitúa en el rango de equipos con memoria unificada de gama alta o GPU profesional.

Su relevancia práctica es doble. Por un lado, ofrece una vía para ejecutar un modelo de 27B en hardware Apple Silicon con un presupuesto de memoria relativamente contenido gracias a los 6 bits y al tamaño de grupo 64. Por otro, sirve como ejemplo de cuantización de precisión mixta aplicada a un modelo multimodal y con cabezas especulativas, un patrón cada vez más habitual para desplegar modelos grandes en local. No hay datos publicados de benchmarks, licencia ni idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, segun el campo model type de la model card); detalles completos no disponibles |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ de precision mixta, 6 bits, group size 64 (oMLX v0.7.0). Existen otras variantes del mismo autor en 4 bits (oQ4e) y fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria mlx) |
| Tamano del repositorio | 23,7 GB |
| Modelo base | Jackrong/Qwopus3.8-27B-Flash-V2 |
| Tipo de modelo | qwen3_5 |

## Arquitectura y entrenamiento

La ficha disponible no describe el entrenamiento del modelo base ni de la cuantización. Lo que se sabe con certeza es que este repositorio es una conversión de pesos, no un modelo nuevo: oQ (oMLX v0.7.0) toma los pesos de Jackrong/Qwopus3.8-27B-Flash-V2 y aplica cuantización de precisión mixta a 6 bits con tamaño de grupo 64, preservando el grafo arquitectónico original. La precisión mixta implica que distintas capas pueden recibir distintos niveles de cuantización, de forma que las más sensibles a la pérdida de precisión se mantienen en bits más altos.

El campo model type de la model card indica qwen3_5, lo que sitúa al modelo base en la estela de la familia Qwen 3.5. El sufijo "mtp" del nombre sugiere la presencia de cabezas de predicción multi-token, usadas habitualmente como decodificación especulativa: un cabezal ligero propone varios tokens candidatos que el modelo principal valida en paralelo. Una fuente externa sobre la conversión NVFP4 de Qwopus3.8-27B-Flash (la variante anterior del mismo autor, no la V2) menciona que ese proceso mantiene en BF16 la cabeza del modelo de lenguaje, el codificador de visión y las cabezas especulativas; esto apunta a que la familia Qwopus combina texto, visión y decodificación especulativa, aunque no hay confirmación explícita para la V2 en la información disponible. No se dispone de número de tokens de entrenamiento, composición del dataset ni detalles de RLHF o DPO.

## Capacidades

- Generación de texto y modelado de lenguaje general, heredados del modelo base Qwopus3.8-27B-Flash-V2.
- Decodificación especulativa mediante cabezas multi-token prediction (según el sufijo "mtp" del nombre), orientada a reducir la latencia de generación.
- Posible soporte de visión, si se confirma la herencia del codificador visual que menciona la documentación NVFP4 de la variante Flash; no verificado para la V2.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX safetensors y el tamaño de 23,7 GB permiten ejecutar el modelo en Mac con memoria unificada de 32 GB o más mediante mlx-lm, sin depender de GPU dedicada.
- Prototipado de aplicaciones sobre Qwopus 3.8: al ser una cuantización del modelo base, sirve para evaluar el comportamiento de la familia antes de comprometerse con los pesos en fp16 o BF16.
- Decodificación especulativa en producción: si se confirman las cabezas multi-token, el modelo puede reducir el coste por token en servicios de generación de texto con requisitos de latencia estrictos.
- Despliegue en estaciones de trabajo con GPU de 24 GB: los 6 bits reducen la huella de pesos hasta aproximadamente 21-24 GB, lo que abre la puerta a una RTX 4090 o una L40S con ajustes de contexto conservadores.
- Evaluación comparativa de cuantizaciones: útil para medir la degradación de calidad entre las variantes oQ4e, oQ6e y fp16 publicadas por el mismo autor.
- Investigación en cuantización de precisión mixta: el repositorio documenta la configuración exacta (6 bits, group size 64, oMLX v0.7.0), lo que facilita reproducir y extender el método.
- Aplicaciones multimodales, en caso de que se confirme la herencia del codificador de visión: descripción de imágenes, extracción de información de documentos escaneados o asistentes que combinan texto e imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No constan datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación para este repositorio ni para su modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en 6 bits ocupan aproximadamente 21-24 GB (el repositorio pesa 23,7 GB); con caché KV y overhead de ejecución, conviene reservar entre 26 y 32 GB de memoria.
- Referencia del modelo base: un agregador externo cifra el requisito de VRAM de Qwopus3.8-27B-Flash en 55,6 GB, coherente con los pesos en precisión completa de un modelo de 27,78B parámetros.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, encajan GPU profesionales con 48-80 GB (A100, H100, L40S con margen) y, con ajustes de contexto, una RTX 4090 o RTX 5090 de 24 GB.
- Compatibilidad con GPU de consumo: probable en RTX 4090/5090 (24-32 GB) si se limita la longitud de contexto; el formato MLX está pensado para Apple Silicon, así que en GPU NVIDIA requeriría una conversión previa.
- Apple Silicon: el formato nativo MLX apunta a Mac con memoria unificada de 32 GB o más (M2/M3/M4 Pro, Max y Ultra).
- Opciones de despliegue: mlx-lm y el servidor de MLX (mlx_lm.server) para el formato nativo. Para vLLM, TGI, llama.cpp u Ollama haría falta convertir los pesos a otro formato (por ejemplo GGUF o safetensors estándar); no se documenta dicha conversión en este repositorio. Existe una versión GGUF de la familia (56,7 GB) publicada por terceros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottlowry/Qwopus3.8-27B-Flash-V2-oQ6e-mtp | 27,78B | MLX safetensors, 6 bits, group 64 | no disponible | no disponible | Hugging Face (0 descargas, 0 likes) |
| scottlowry/Qwopus3.8-27B-Flash-oQ4e-mtp | no disponible | MLX safetensors, 4 bits | no disponible | no disponible | Hugging Face |
| Jackrong/Qwopus3.8-27B-Flash-V2 (base) | 27,78B | safetensors (precision original) | no disponible | no disponible | Hugging Face |
| Qwopus3.8-27B-Flash (NVFP4, conversion para Blackwell) | 27,78B | NVFP4 con cabeza, vision y cabezas especulativas en BF16 | no disponible | no disponible | Hugging Face |
| Version GGUF de Qwopus3.8-27B-Flash-V2 | no disponible | GGUF, 56,7 GB | no disponible | no disponible | local-ai-zone.github.io (9.064 descargas, 44 likes) |

## Limitaciones y advertencias

- No hay licencia declarada en el repositorio; sin una licencia explícita no puede asumirse permiso para uso comercial. Es imprescindible consultar la licencia del modelo base Jackrong/Qwopus3.8-27B-Flash-V2 antes de cualquier despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de la calidad de la cuantización.
- La cuantización a 6 bits con group size 64 introduce pérdida de precisión respecto a los pesos originales; no se han publicado evaluaciones que cuantifiquen esa degradación.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni comportamiento en dominios sensibles.
- No se declara el conjunto de idiomas soportados; el rendimiento fuera del inglés o del chino (idiomas habituales de la familia Qwen) es incierto.
- Se desconoce la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- El formato MLX limita el despliegue a entornos Apple Silicon o a conversiones adicionales; no es utilizable directamente en vLLM, TGI o llama.cpp.
- El modelo base parece incluir cabezas especulativas y, posiblemente, un codificador de visión; esto complica la conversión de formato y puede provocar incompatibilidades si se traslada a un runtime que no las soporte.
- La fecha de creación del repositorio es 2026-10-08, posterior a la mayoría de referencias del ecosistema; conviene verificar la vigencia de las herramientas (oMLX v0.7.0, mlx-lm) antes de reproducir el proceso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Qwopus3.8-27B-Flash-V2-oQ6e-mtp
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-V2
- Variante de 4 bits del mismo autor: https://huggingface.co/scottlowry/Qwopus3.8-27B-Flash-oQ4e-mtp
- Variante oQ4e con fp16: https://huggingface.co/scottlowry/Qwopus3.8-27B-Flash-oQ4e-fp16-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Ficha de Qwopus3.8 27B Flash en LLM Explorer: https://llm-explorer.com/model/Jackrong%2FQwopus3.8-27B-Flash,5BfoG4VORSxYlz4p4r0D1c
- Version GGUF de Qwopus3.8 27B Flash V2: https://local-ai-zone.github.io/models/qwopus3-8-27b-flash-v2.html
- Analisis de la conversion NVFP4 para Blackwell: https://www.thinksuite.in/ai-news/qwopus-38-27b-flash-nvfp4-native-blackwell-ai-breakthrough
