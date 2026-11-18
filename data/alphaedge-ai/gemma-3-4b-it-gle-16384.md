# alphaedge-ai/gemma-3-4b-it-gle-16384

## Resumen

gemma-3-4b-it-gle-16384 es una variante "trimmed" (podada) del modelo multimodal google/gemma-3-4b-it, publicada por el usuario alphaedge-ai. La poda consiste en reducir el vocabulario del tokenizador de 262.144 tokens a 16.384, eliminando los tokens poco frecuentes en irlandés (ga) y conservando únicamente los relevantes para ese idioma. El resultado es un modelo un 14,63 % mas pequeno en parametros (de 4.300.079.472 a 3.670.770.032) y con una huella de memoria notablemente inferior, manteniendo la arquitectura y los pesos del modelo base de Google.

El modelo base Gemma 3 es un transformer decoder-only de la familia Gemma 3, disenado por Google DeepMind para generacion de texto y comprension de imagenes (image-text-to-text). Esta version concreta hereda esas capacidades, pero su vocabulario reducido la especializa en irlandes: fuera de ese idioma el rendimiento puede degradarse de forma significativa, tal como advierte la propia model card.

La relevancia de esta ficha radica en que ejemplifica una tecnica de optimizacion (trimming de vocabulario) que permite desplegar modelos multimodales en entornos con recursos limitados o en mercados linguisticos concretos, a costa de sacrificar cobertura multilingue. Es un modelo de nicho, con muy pocas descargas (6) y sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), multimodal image-text-to-text |
| Parametros totales | 3.670.770.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar a posteriori con herramientas estandar) |
| Idiomas soportados | ga (irlandes); el resto de idiomas no esta garantizado |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 7,3 GB |
| Vocabulario | 16.384 tokens (frente a 262.144 del original) |
| Modelo base | google/gemma-3-4b-it |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Gemma 3 4B instruct: un transformer decoder-only con atencion multi-cabeza, entrenado originalmente por Google DeepMind con datos multimodales (texto e imagen) y ajustado por instrucciones. La innovacion de esta version no reside en el entrenamiento, sino en la poda del vocabulario: se minaron 200.000 textos del dataset lbourdois/fineweb-2-trimming en irlandes para identificar que tokens del vocabulario original son realmente utilizados en ese idioma, y se conservaron solo esos 16.384. Los embeddings de tokens eliminados se descartan, lo que reduce el numero de parametros en 629.309.440 (14,63 %).

No se ha realizado un reentrenamiento completo ni un ajuste fino adicional segun la informacion disponible: el modelo es una transformacion estructural del base, por lo que hereda sus sesgos, su distribucion de entrenamiento y sus capacidades. No hay datos publicados sobre el numero total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en esta variante; esos detalles corresponden al Gemma 3 Technical Report (arXiv:2503.19786) del modelo original.

## Capacidades

- Generacion de texto conversacional en irlandes, con plantilla de chat (`apply_chat_template`).
- Comprension de imagenes y texto (pipeline image-text-to-text heredado de Gemma 3).
- Razonamiento y respuesta a instrucciones (modelo -it, ajustado por instrucciones en su version base).
- Generacion de codigo y matematicas: capacidades heredadas del base, aunque el vocabulario podado puede degradar el rendimiento en tokens de programacion poco frecuentes en irlandes.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: limitadas practicamente al irlandes; el resto de idiomas puede degradarse por la eliminacion de tokens.

## Casos de uso

- Procesamiento de documentacion administrativa en irlandes: el modelo puede resumir, clasificar y extraer informacion de textos oficiales en ga, aprovechando su vocabulario especializado y su menor huella de memoria para despliegue en servidores modestos.
- Atencion al cliente en irlandes: conversaciones multi-turno con plantilla de chat, adecuado para organismos publicos o empresas que operan en ese idioma y necesitan un modelo ligero.
- Traduccion y adaptacion de contenido al irlandes: generacion de borradores y reformulacion de textos en ga, con revision humana posterior dado el riesgo de alucinacion.
- Educacion y aprendizaje de irlandes: generacion de ejercicios, correccion de textos y explicaciones gramaticales, desplegable en hardware de consumo por su tamano reducido.
- Analisis de imagenes con texto en irlandes: al heredar la capacidad multimodal de Gemma 3, puede describir o responder preguntas sobre imagenes acompanadas de instrucciones en ga.
- Prototipado e investigacion sobre trimming: util como caso de estudio para evaluar el impacto de la poda de vocabulario en modelos multimodales, comparandolo con el base en tareas concretas.
- Despliegue en entornos con memoria limitada: su menor numero de parametros y de tokens de vocabulario reduce el uso de VRAM y permite inferencia en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas en irlandes, y solo reporta estadisticas estructurales (reduccion de vocabulario y de parametros).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,3 GB en precision completa (fp16/bf16, segun el tamano del repo), alrededor de 3,7-4 GB en cuantizacion de 8 bits y 2-2,5 GB en 4 bits (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100, H100 o L40S para produccion con buen throughput; RTX 4090 o RTX 3090 para desarrollo.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en cuantizacion de 4-8 bits (por ejemplo RTX 3060 Ti, RTX 4060, RTX 4070).
- Opciones de despliegue: transformers (soporte oficial), text-generation-inference (tag `text-generation-inference`), y herramientas estandar de cuantizacion como llama.cpp/Ollama o vLLM previa conversion de pesos (no verificado en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/gemma-3-4b-it-gle-16384 | 3.670.770.032 | no disponible | ga | gemma | Hugging Face (6 descargas) |
| google/gemma-3-4b-it | 4.300.079.472 | no disponible | multilingue | gemma | Hugging Face (oficial) |
| Variantes trimmed de Gemma 3 para otros idiomas (misma familia) | ~3,67 B | no disponible | idioma especifico | gemma | Hugging Face |

La comparacion principal es con el modelo base: esta variante reduce parametros un 14,63 % y vocabulario un 93,75 %, a cambio de perder cobertura multilingue. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento degradado fuera del irlandes: los tokens eliminados del vocabulario afectan a otros idiomas, incluido el castellano y el ingles.
- Posible degradacion en tareas de codigo o matematicas si dependen de tokens poco frecuentes en irlandes.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se ha publicado una evaluacion especifica de esta variante.
- Sesgos heredados del modelo base Gemma 3, sin mitigaciones adicionales documentadas.
- Licencia Gemma Terms of Use: uso comercial permitido bajo las condiciones de Google, pero el modelo no esta afiliado ni respaldado por Google.
- Modelo de nicho con muy pocas descargas y sin validacion externa: no recomendado para produccion sin evaluacion propia.
- No hay informacion sobre tool calling, agentes ni contexto maximo en esta variante; conviene verificar contra el modelo base.
- El tag `region:eu` y el autor (alphaedge-ai) no implican certificacion ni soporte oficial.

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/gemma-3-4b-it-gle-16384
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper Gemma 3: https://arxiv.org/abs/2503.19786
- Terminos de uso Gemma: https://ai.google.dev/gemma/terms
