# edededdy/LittleKedi-medium-wide-sparse-instruct-GGUF

## Resumen
LittleKedi-medium-wide-sparse-instruct es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) entrenado desde cero, inspirado en la arquitectura DeepSeek-V3, desarrollado por el usuario edededdy como artefacto educativo y de investigación. Se trata de la variante ajustada por instrucciones (chat) del modelo base LittleKedi-medium-wide-sparse-base, y esta ficha corresponde concretamente a sus compilaciones en formato GGUF (f16 y q8_0) para su uso en llama.cpp, Ollama y LM Studio.

El modelo cuenta con 305,4 millones de parámetros totales, de los cuales solo 31,7 millones (un 10 %) están activos por token gracias a un esquema de 240 expertos enrutados de 128 unidades con top-8. Emplea Multi-head Latent Attention (MLA) en lugar de atención estándar, lo que reduce el coste de la caché KV. El vocabulario es de 16K tokens y el modelo se ha preentrenado sobre una mezcla de 20.400 millones de tokens procedentes de FineWeb-Edu, SmolLM-Corpus (Cosmopedia v2), FineMath 4+, comentarios de Reddit, github-code-clean, SmolTalk y Wikipedia en inglés.

Su relevancia es principalmente didáctica: permite estudiar de forma directa cómo se comporta un MoE esparcido de proporciones extremas (10 % de activación) en un tamaño lo bastante pequeño para ejecutarse en hardware de consumo. El propio autor advierte que, pese a responder en formato de chat, sus respuestas son a menudo incorrectas o vagas y tiende a inventar hechos con seguridad, por lo que no debe usarse en aplicaciones críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE estilo DeepSeek-V3 con Multi-head Latent Attention (MLA) |
| Parametros totales | 305,4M (305.750.432 según safetensors) |
| Parametros activos | 31,7M por token (10 %); 23,3M excluyendo la tabla de embeddings |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 y q8_0 (compilaciones GGUF publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el repo base |

## Arquitectura y entrenamiento
La arquitectura consta de 8 capas con tamaño oculto de 512. Las dos primeras capas incorporan una FFN densa SwiGLU de 1408 unidades, mientras que las capas 2 a 7 son bloques MoE con 240 expertos enrutados de 128 unidades y top-8 (se activan 8 expertos por token), además de expertos compartidos y una capa densa. La atención es Multi-head Latent Attention con 8 cabezas, latente KV de 128, latente de query de 256, dimensión RoPE desacoplada de 32 y dimensiones de cabeza 64+32 (q/k) y 64 (v), lo que comprime la caché KV frente a la atención multi-cabeza convencional. El vocabulario es de 16K tokens y la tabla de embeddings está atada a la cabeza de salida.

El preentrenamiento utilizó 20.400 millones de tokens de una mezcla que incluye FineWeb-Edu, Cosmopedia v2 (SmolLM-Corpus), FineMath 4+, comentarios de Reddit, github-code-clean, SmolTalk y Wikipedia en inglés (2023-11-01). Posteriormente se aplicó un ajuste por instrucciones (variante instruct) usando SmolTalk como parte de los datos. La variante wide-sparse se caracteriza por tener el mayor número total de expertos y la menor proporción de parámetros activos de la familia, lo que implica que cada experto ve menos tokens durante el entrenamiento y requiere más datos para entrenarse bien. No se detalla en la información disponible si hubo RLHF o DPO.

## Capacidades
- Generación de texto conversacional en formato de chat con plantilla `<|system|>...<|end|><|user|>...<|end|><|assistant|>` y parada mediante `<|end|>`.
- Respuestas multi-turno con turno de sistema opcional.
- Generación de texto instructivo básico (el modelo está ajustado por instrucciones).
- Cobertura limitada al idioma inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- Capacidad de código y matemáticas solo en la medida en que los datos de preentrenamiento (github-code-clean, FineMath) lo permiten; no hay evaluación publicada al respecto.

## Casos de uso
- Estudio académico de arquitecturas MoE: permite analizar en un modelo pequeño cómo se distribuye la carga entre 240 expertos y qué efecto tiene una activación del 10 % sobre la calidad, gracias a su tamaño manejable y a su implementación MLA.
- Experimentación con MLA: sirve para medir el ahorro de memoria de la caché KV en comparación con atención multi-cabeza en un transformer de 8 capas y 512 de dimensión oculta.
- Pruebas de pipelines de cuantización: las compilaciones f16 y q8_0 permiten comparar degradación de calidad entre precisiones en un modelo de 305M parámetros.
- Docencia sobre entrenamiento desde cero: al compartir tokenizer y dataset con sus variantes hermanas (medium y medium-sparse), permite comparaciones controladas de esparsidad.
- Evaluación de herramientas de inferencia: útil para validar integraciones con llama.cpp, Ollama y LM Studio usando la plantilla de chat embebida en los GGUF.
- Prototipado de demos de chat de bajo coste: al caber en hardware de consumo, puede servir como modelo de relleno en entornos de desarrollo antes de sustituirlo por un modelo mayor.
- Investigación sobre alucinación en modelos pequeños: su tendencia documentada a inventar hechos con seguridad lo convierte en un caso de estudio para técnicas de detección de alucinaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el repo GGUF ocupa 1,0 GB; las compilaciones f16 y q8_0 de un modelo de 305M parámetros se sitúan aproximadamente en el rango de 0,6 a 1,0 GB, aunque no se dispone de cifras exactas por archivo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se dispone de recomendaciones oficiales del autor.
- Cabe en GPU de consumo: sí, con toda probabilidad en cualquier GPU consumer moderna (por ejemplo, series GTX/RTX con 4 GB o más), dado el tamaño reducido del modelo.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio (mencionados explícitamente en la model card); el repo base con safetensors permite otros runners, pero no se detallan.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LittleKedi-medium-wide-sparse-instruct | 305,4M | 31,7M (10 %) | no disponible | Apache 2.0 | GGUF (f16, q8_0) y safetensors |
| LittleKedi-medium | 78,2M | 31,0M (40 %) | no disponible | Apache 2.0 (familia) | repo base de la familia |
| LittleKedi-medium-sparse | 163,4M | 31,3M (19 %) | no disponible | Apache 2.0 (familia) | repo base de la familia |
| LittleKedi-base-wide-sparse | 1015,9M | 107,6M (11 %) | no disponible | Apache 2.0 (familia) | repo base de la familia |

Las tres alternativas pertenecen a la misma familia LittleKedi, comparten tokenizer y dataset con el modelo de esta ficha y difieren en el grado de esparsidad y en el tamaño, lo que permite comparaciones directas. No se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias
- El autor advierte explícitamente que las respuestas son fluidas y sobre el tema, pero a menudo incorrectas o vagas, y que el modelo inventa hechos con confianza; no debe usarse para nada que importe.
- Es un artefacto educativo y de investigación, no un modelo de producción.
- Solo soporta inglés; no hay cobertura multilingüe documentada.
- La longitud de contexto no está especificada en la información disponible.
- La variante wide-sparse tiene la menor proporción de activación de la familia (10 %), lo que implica que cada experto ve menos tokens y puede estar peor entrenado que las variantes más densas.
- No se documentan sesgos conocidos más allá de los derivados de los datos de preentrenamiento (FineWeb-Edu, Reddit, GitHub, Wikipedia).
- La licencia Apache 2.0 permite uso comercial, pero las advertencias del autor sobre fiabilidad desaconsejan aplicaciones reales.
- No se documenta soporte de tool calling, agentes ni modos especiales, por lo que no debe asumirse en integraciones.

## Enlaces
- Repositorio HuggingFace (GGUF): https://huggingface.co/edededdy/LittleKedi-medium-wide-sparse-instruct-GGUF
- Modelo base (safetensors): https://huggingface.co/edededdy/LittleKedi-medium-wide-sparse-instruct
- Modelo de preentrenamiento: https://huggingface.co/edededdy/LittleKedi-medium-wide-sparse-base
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Reddit comments: https://huggingface.co/datasets/HuggingFaceGECLM/REDDIT_comments
- Dataset github-code-clean: https://huggingface.co/datasets/codeparrot/github-code-clean
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
