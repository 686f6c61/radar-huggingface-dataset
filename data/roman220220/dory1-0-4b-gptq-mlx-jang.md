# roman220220/Dory1.0-4B-gptq-mlx-jang

## Resumen

Dory 1.0 4B es un modelo de lenguaje denso de NVIDIA Labs (Nemotron Labs) con una arquitectura poco habitual: un diseño "looped" de estilo nGPT en el que 16 capas de entrada alimentan un bloque recurrente compartido de 40 capas que se ejecuta dos veces por pasada forward, y cuya salida pasa por 16 capas de salida. En total son 72 capas "en bruto" (raw layers), alternando capas de atención pura y de MLP pura, nunca ambas en la misma capa. El modelo tiene 3.975.229.440 parámetros (aproximadamente 4B) en precisión BF16.

La ficha que nos ocupa no es el modelo original, sino una cuantización comunitaria publicada por el usuario `roman220220` (IPSupport LLC) en formato MLX, pensada para ejecución local en Apple Silicon. Se trata de una cuantización GPTQ con esquema "JANG": 8 bits para atención y 6 bits para MLP, con tamaño de grupo 64, embeddings y LM head a 8 bits mediante RTN, y con los códigos enteros de GPTQ escritos de forma exacta en lugar de dejar que MLX los rederive a partir de los pesos redondeados.

Su relevancia es doble: por un lado permite ejecutar un modelo de NVIDIA de 4B en Macs con Apple Silicon reduciendo el peso de 7,95 GB a 3,5 GB con una pérdida de perplejidad mínima; por otro, es un ejemplo técnico interesante de cómo cuantizar arquitecturas recurrentes con pesos compartidos entre pasadas, donde la cadena GPTQ clásica capa-por-capa no se aplica directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso "looped" estilo nGPT: 16 capas de entrada, bloque recurrente compartido de 40 capas ejecutado 2 veces, 16 capas de salida (72 capas raw, alternando atención pura y MLP pura) |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GPTQ con esquema JANG: 8 bits en atención y 6 bits en MLP, grupo de tamaño 64; embeddings y LM head a 8 bits (RTN); vectores de escala nGPT sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | OpenMDW License Agreement 1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso con un patrón recurrente: las 16 capas de entrada proyectan hacia un bloque compartido de 40 capas que se recorre dos veces por cada pasada forward, y la representación resultante pasa por 16 capas de salida. Las capas alternan atención pura y MLP pura, sin combinar ambas operaciones en una misma capa. Es un diseño de estilo nGPT (normalized GPT), lo que implica normalización de las representaciones a lo largo de la red y vectores de escala entrenables (`sqk`, `s_gate`, `suv_gate`, `suv_up`, `attn_alpha`, `mlp_alpha`, `logit_scale`) que no se cuantizan en esta conversión por ser vectores pequeños y no matrices de pesos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO, ya que la model card del repositorio de cuantización no los detalla y no se ha proporcionado la del modelo base. La innovación técnica destacable de esta publicación concreta es el proceso de cuantización: dado que el bloque recurrente comparte pesos entre las dos pasadas del forward, la cadena GPTQ habitual ("la capa i se calibra sobre la salida cuantizada de la capa i-1") no es aplicable directamente; el autor documenta en `FINDINGS.md` cómo se resolvió. Además, el modelo base no tiene fichero de modelado en `transformers` (solo vLLM y llama.cpp lo implementan), por lo que la cuantización se validó numéricamente contra una implementación de referencia en PyTorch escrita por el propio autor y contra su port a MLX (`mlx_lm.models.dory`, con trabajo integrado en ml-explore/mlx-lm#1988).

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` con tag `conversational`.
- Razonamiento y respuesta a preguntas de conocimiento general (la muestra de generación greedy reproduce cadenas de capitales de países).
- Generación de código: el autor reporta perplejidad sobre código Python retenido (3,748 frente a 3,739 en BF16), lo que indica que la cuantización preserva la capacidad de modelado de código.
- Ejecución local en Apple Silicon mediante MLX, con integración en la aplicación LLMTray (chat, agentes y API compatible con OpenAI).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no detalla idiomas y la muestra de generación es en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no se documentan.

## Casos de uso

- Chat local en macOS: el modelo se puede cargar en LLMTray o en `mlx_lm` sobre un Mac con Apple Silicon y usarse como asistente conversacional sin que los datos salgan del equipo, gracias a los 3,5 GB de pesos cuantizados.
- Asistencia de código en local: con la perplejidad de código Python prácticamente intacta respecto a BF16 (+0,24 %), es adecuado para autocompletado y explicación de fragmentos en editores integrados con MLX.
- Prototipado de aplicaciones con API compatible con OpenAI: LLMTray expone un endpoint compatible, de modo que se puede apuntar una aplicación existente al modelo local para pruebas de integración sin coste de API.
- Evaluación de arquitecturas recurrentes: investigadores interesados en modelos "looped" pueden usar esta cuantización para experimentar con un modelo de 4B en hardware de consumo y estudiar el comportamiento del bloque compartido.
- Educación y demos de cuantización GPTQ: el repositorio documenta el proceso (JANG, grupo 64, tratamiento del bloque recurrente), lo que lo convierte en material de referencia para entender cuantización de arquitecturas no estándar.
- Generación de texto por lotes en equipos de sobremesa: con 3,5 GB de pesos, cabe holgadamente en la memoria unificada de un Mac moderno y permite ejecutar varias instancias o mantener el modelo residente junto a otras aplicaciones.
- Despliegue en entornos con requisitos de privacidad: al ser ejecución 100 % local, encaja en escenarios donde no se permite enviar prompts a servicios en la nube.

## Benchmarks y rendimiento

| Metrica | BF16 (base) | Esta cuantizacion (MLX, 8/6 bits) | Variacion |
|---|---|---|---|
| Perplejidad wikitext-2 | 14,03 | 14,09 | +0,41 % |
| Perplejidad codigo Python retenido | 3,739 | 3,748 | +0,24 % |
| Tamano de pesos | 7,95 GB | 3,5 GB | -56 % aproximadamente |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 3,5 GB solo para los pesos en esta cuantización; con overhead de runtime MLX, conviene disponer de al menos 5-6 GB libres.
- Plataforma: exclusivamente Apple Silicon (MLX); no es ejecutable en GPU NVIDIA/AMD ni en CPU x86 con este formato.
- GPU recomendadas: cualquier chip Apple Silicon con memoria unificada suficiente (M1 en adelante); en modelos con 8 GB de memoria unificada el margen es ajustado, siendo recomendable 16 GB o más.
- Cabe en GPU de consumo: sí, en Macs con Apple Silicon; no aplica a GPUs de consumo tipo RTX 4090 porque el formato es MLX.
- Opciones de despliegue: `mlx_lm` (con el port `mlx_lm.models.dory`), LLMTray (app macOS con API compatible con OpenAI). No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Dory 1.0 4B (esta cuantizacion) | ~4B | No disponible | MLX safetensors, 8/6 bits | OpenMDW 1.1 | GPTQ JANG, 3,5 GB, solo Apple Silicon |
| NVIDIA Nemotron-Labs-Dory1.0-4B-BF16 (base) | ~4B | No disponible | safetensors BF16 | OpenMDW 1.1 | 7,95 GB, referencia de calidad |
| Alternativas de ~4B en MLX | No disponible | No disponible | MLX | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (mismo tamaño o misma tarea) en términos de benchmarks, contexto o rendimiento.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser una conversión de un modelo de terceros, hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinación: no cuantificado en la información disponible; la muestra de generación incluida es una cadena de capitales y no evalúa robustez factual.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones de contexto largo.
- Idiomas no documentados: la única evidencia es una generación en inglés; el rendimiento en castellano u otros idiomas no está verificado.
- Restricciones de licencia: OpenMDW 1.1 (etiquetada como `other`); es responsabilidad del usuario revisar los términos para uso comercial, y el autor declara que no entrenó el modelo y no asume responsabilidad sobre sus salidas.
- Compatibilidad limitada: sin fichero de modelado en `transformers`; solo funciona con MLX/llama.cpp/vLLM en sus variantes compatibles con la arquitectura Dory, y esta cuantización concreta solo con MLX.
- La cuantización introduce una pérdida pequeña pero medible de calidad (+0,41 % en wikitext-2, +0,24 % en código); para tareas sensibles a la precisión numérica conviene validar contra el modelo BF16.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria.
- Advertencia del autor: el repositorio se ofrece "tal cual", sin garantía de ningún tipo.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/roman220220/Dory1.0-4B-gptq-mlx-jang
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- LLMTray (app macOS): https://www.ipsupport.us/llmtray/
- Releases de LLMTray: https://github.com/ipsupport-llc/llmtray/releases/latest/download/LLMTray-Full.dmg
- Repositorio LLMTray en GitHub: https://github.com/ipsupport-llc/llmtray
- Port MLX de la arquitectura Dory: https://github.com/ipsupport-llc/mlx-lm
- Pull request upstream en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/1988
- Notas tecnicas de cuantizacion (FINDINGS.md): https://github.com/ipsupport-llc/quant-ternary/blob/main/dory-quant/docs/FINDINGS.md
- IPSupport Code: https://ipsupport-llc.github.io/ipsupport-code/
