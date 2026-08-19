# armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara

## Resumen

`armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara` es un modelo derivado de `TeichAI/Qwen3.8-27B-Fable-Distill`, un fine-tune del Qwen3.8-27B de Qwen. El autor, armand0e, ha aplicado una técnica de "abliteración" (abliteration) mediante la herramienta Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA), cuyo objetivo es eliminar los mecanismos de rechazo del modelo original. El resultado es una versión "desensurada" que reduce drásticamente las negativas ante prompts dañinos: pasa de 91 rechazos por cada 100 prompts a solo 5, manteniendo una divergencia KL de 0.1004 respecto al modelo base.

Con 27.781.427.952 parámetros (27,78B), el modelo mantiene el pipeline `image-text-to-text`, lo que indica que conserva las capacidades multimodales del Qwen3.8-27B (visión, texto, posiblemente video). La modificación se aplica a las proyecciones `attn.o_proj` y `mlp.down_proj` de las capas 30 a 64, con una actualización de rango 2 resuelta en forma cerrada. Es relevante para investigadores que estudian la alineación y los mecanismos de rechazo en LLMs, así como para desarrolladores que necesitan un modelo sin restricciones de contenido, aunque con los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de vision (heredada de Qwen3.8-27B, basada en Qwen3.5) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el Qwen3.8-27B original soporta 262.144 tokens, pero no se confirma para este derivado) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el modelo base TeichAI parece usar Apache-2.0, pero no se especifica para este derivado) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `TeichAI/Qwen3.8-27B-Fable-Distill`, un fine-tune del Qwen3.8-27B de Qwen, que a su vez se basa en la arquitectura Qwen3.5: un transformer causal denso con encoder de vision integrado, capaz de procesar imagenes y video de forma nativa. El Qwen3.8-27B original incorpora decodificacion MTP (Multi-Token Prediction) y un contexto de 262.144 tokens, aunque no se confirma si el fine-tune de TeichAI conserva todas estas caracteristicas.

La modificacion principal de este modelo es la ablacion de rango 2 aplicada a las proyecciones `attn.o_proj` y `mlp.down_proj` de las capas 30 a 64, realizada con Heretic v1.2.0 mediante el metodo Arbitrary-Rank Ablation (ARA). A diferencia de otros metodos de abliteracion que usan descenso por gradiente, ARA resuelve la actualizacion en forma cerrada, con los siguientes parametros: `overcorrect_relative_weight` de 4.62087, `neighbor_count` de 128, `rank` de 2 y `ridge` de 1. No se dispone de informacion sobre el entrenamiento original del modelo base TeichAI (datos, tokens, tecnicas de alineacion).

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del Qwen3.8-27B.
- Procesamiento de imagenes y video (pipeline `image-text-to-text`), lo que permite respuestas multimodales.
- Tool calling y function calling: probablemente soportado, aunque no confirmado para este derivado.
- Capacidad de agente y razonamiento multi-paso: probablemente heredada, no confirmada.
- Multilingue: no confirmado, aunque el Qwen3.8-27B original soporta multiples idiomas.
- Capacidad especial: "uncensored" o "decensored" - el modelo no rechaza prompts dañinos (solo 5/100 refusals frente a 91/100 del original), lo que permite generar contenido que otros modelos bloquearian.

## Casos de uso

- Investigacion en seguridad y alineacion de IA: permite estudiar como funcionan los mecanismos de rechazo y que efectos tiene su eliminacion, comparando respuestas entre el modelo original y el abliterado.
- Generacion creativa sin restricciones: escritura de ficcion, guiones, poesia o contenido adulto que los modelos censurados bloquean, aprovechando la capacidad de texto largo y multimodal.
- Roleplay y chatbots de personajes: ideal para aplicaciones de rol donde se requiere libertad total en las respuestas, sin filtros morales.
- Analisis de contenido controvertido: util para investigadores que necesitan generar ejemplos de discurso dañino o sesgado para estudiar su deteccion y mitigacion.
- Educacion sobre sesgos y alineacion: como herramienta didactica para demostrar las diferencias entre modelos alineados y no alineados en entornos academicos controlados.
- Desarrollo de aplicaciones de nicho: chatbots o asistentes para dominios donde la censura es un obstaculo (por ejemplo, discusiones sobre temas tabu en psicologia o sociologia), siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica de rendimiento proporcionada es la comparacion con el modelo original en terminos de rechazo y divergencia:

| Metrica | Este modelo | Modelo original (TeichAI) |
|---|---|---|
| Divergencia KL (frente a prompts inofensivos) | 0.1004 | 0 (por definicion) |
| Rechazos (sobre 100 prompts dañinos) | 5/100 | 91/100 |

La divergencia KL se mide contra el modelo original en el dataset `mlabonne/harmless_alpaca`, y los rechazos se cuentan sobre `mlabonne/harmful_behaviors` (test[:100]).

## Requisitos de hardware

- VRAM estimada: el repo pesa 55,6 GB, lo que sugiere pesos en BF16 (27,78B x 2 bytes). Para inferencia en precision completa se necesitan al menos 56 GB de VRAM, es decir, una GPU como A100 80GB o H100.
- Con cuantizacion (no incluida en el repo, pero posible con herramientas como llama.cpp o AutoGPTQ), un Q4 ocuparia aproximadamente 17-18 GB, lo que permitiria ejecutarlo en GPUs consumer de 24 GB como RTX 4090 o en Macs con 24 GB unificados.
- GPU recomendadas: A100, H100, RTX 4090, o equivalentes con suficiente VRAM.
- Opciones de despliegue: al ser un modelo transformers con safetensors, se puede usar con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama (si se crea un Modelfile).
- Latencia y throughput: no disponibles para este modelo especifico. El Qwen3.8-27B original alcanza ~24,5 tok/s en AMD Ryzen AI Max+ 395 con cuantizacion Q4, pero no se puede extrapolar directamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusals (100 prompts dañinos) | Licencia |
|---|---|---|---|---|
| armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara | 27,78B | No disponible | 5/100 | No disponible |
| TeichAI/Qwen3.8-27B-Fable-Distill (original) | 27,78B | No disponible | 91/100 | Apache-2.0 (segun busqueda) |
| Qwen3.8-27B (base de Qwen) | 27B | 262.144 tokens | No disponible | Apache-2.0 |

La comparativa se limita a los modelos directamente relacionados. No se dispone de datos de otros modelos "abliterated" de tamano similar para una comparacion mas amplia.

## Limitaciones y advertencias

- Riesgo de contenido dañino: al eliminar los mecanismos de rechazo, el modelo puede generar discurso de odio, instrucciones peligrosas o contenido ilegal sin filtro. No es apto para uso publico sin moderacion.
- Alucinaciones: como cualquier LLM, puede inventar informacion, especialmente en temas especializados. La falta de alineacion puede aumentar la confianza en respuestas incorrectas.
- Sesgos del modelo base: hereda los sesgos del Qwen3.8-27B y del fine-tune de TeichAI, que no se han evaluado en este derivado.
- Limitaciones de contexto e idioma: no se confirma la longitud de contexto real ni los idiomas soportados. El modelo base Qwen3.8-27B soporta 262K tokens, pero el fine-tune y la ablacion podrian alterar este comportamiento.
- Licencia no clara: aunque el modelo base parece usar Apache-2.0, este derivado no especifica licencia, lo que genera incertidumbre legal para uso comercial.
- Sin mantenimiento: el repo tiene 0 descargas y 0 likes, y no se ha actualizado desde su creacion. No hay garantias de soporte ni correcciones de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/armand0e/Qwen3.8-27B-Fable-Distill-Heretic-ara
- Modelo base TeichAI: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Repositorio de Heretic: https://github.com/p-e-w/heretic
- Pull request de ARA: https://github.com/p-e-w/heretic/pull/211
- Guia del Qwen3.8-27B (blog): https://lovableapp.org/blog/qwen3-8-27b
- Guia para ejecutar Qwen3.8-27B localmente: https://modelfit.io/blog/run-qwen38-27b-locally-2026/
