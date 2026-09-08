# bullerwins/GLM-5.3-Flash-exl3-4bpw-ablit

## Resumen

El modelo `bullerwins/GLM-5.3-Flash-exl3-4bpw-ablit` es una variante cuantizada del modelo GLM-5.3-Flash de Z.ai, desarrollada por el usuario bullerwins. Se trata de un checkpoint en formato EXL3 con cuantización de 4 bits por peso (4bpw) que incorpora una modificación quirúrgica: el transplante de 30 tensores de proyección de salida de atención (`o_proj.weight`) provenientes de un modelo "abliterated" de la serie Keys/Dealign. El objetivo es eliminar los mecanismos de rechazo de respuestas (refusals) del modelo original, manteniendo el resto de pesos intacto.

La arquitectura subyacente es el modelo GLM-5.3-Flash, que emplea atención híbrida KDA/DSA con mHC y un total de 45 capas principales más una capa MTP nativa. El modelo cuenta con 87.811.157.118 parámetros totales y 288 expertos enrutados con top-8 routing, lo que lo sitúa en la categoría de modelos de mezcla de expertos (MoE). El checkpoint se distribuye en 120 shards safetensors con un tamaño aproximado de 175.64 GB. La relevancia de este modelo radica en que sirve como ejemplo de técnica de "abliteration" mediante transplante de tensores, sin necesidad de entrenamiento adicional, aunque su fidelidad al modelo BF16 original se ha degradado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash; atención híbrida KDA/DSA con mHC |
| Parametros totales | 87.811.157.118 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Uniform-K4 EXL3/TR3 para expertos enrutados; BF16 para 30 proyecciones de salida de atención |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | shapleymcg-license-1.0 (licencia personalizada) |
| Formato de pesos | safetensors (120 shards), EXL3/TR3 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GLM-5.3-Flash, que combina atención híbrida KDA (Key-Decoupled Attention) y DSA (Dynamic Sparse Attention) con mHC (Multi-Head Context). Dispone de 45 capas principales más una capa MTP (Multi-Token Prediction) en el índice 45, con una dimensión oculta de 4096. El sistema de expertos enrutados incluye 288 expertos con top-8 routing, lo que indica que es un modelo de mezcla de expertos (MoE). No se ha especificado la longitud de contexto en la información disponible.

En cuanto al entrenamiento, no se realizó ningún proceso de fine-tuning ni entrenamiento adicional. El modelo es el resultado de un transplante exacto de tensores: se copiaron byte a byte 30 tensores BF16 de proyección de salida de atención (`self_attn.o_proj.weight`) desde el checkpoint donante `drowzeys/keys-GLM-5.3-Flash-NVFP4-ablit-l15-43-mtp-l45` hacia el checkpoint padre `brandonmusic/GLM-5.3-Flash-tr3-4bpw`. Las capas 0 a 14 y la capa 44 se preservaron del padre EXL3, mientras que las capas 15 a 43 y la capa MTP 45 recibieron los tensores del donante. El transplante afecta a 2.617.245.696 bytes de datos. No se aplicó ninguna proyección de dirección de rechazo en runtime, ni calibración, dequantización o requantización. Las proyecciones KDA tienen forma `[4096, 8192]` y las DSA y MTP tienen forma `[4096, 16384]`. La verificación de integridad confirmó que los 120 shards del padre y los 11 shards del donante coinciden con sus hashes, y que cada tensor transplantado coincide con el hash del donante.

## Capacidades

- Generación de texto y conversación en inglés y chino.
- Soporte de tool calling y streaming, verificado de forma limitada en las comprobaciones funcionales del autor.
- Capacidades de visión limitadas: se realizaron comprobaciones funcionales de visión, pero el video no fue probado.
- Soporte de agentes y razonamiento multi-paso: no se especifica explícitamente, pero la arquitectura MoE con 288 expertos sugiere capacidad para tareas complejas.
- Función DFlash2 verificada de forma limitada.
- Modo de pensamiento (thinking mode): el autor menciona que las pruebas de Refusal32 se ejecutaron con "thinking off", lo que indica que el modelo puede tener un modo de pensamiento, aunque no se detalla.
- Comportamiento "abliterated": el modelo no rechaza respuestas, como demuestra el resultado 32/32 bypass en el suite Refusal32 del donante, con 0 refusals, 0 respuestas corruptas y 0 vacías.

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo permite estudiar cómo el transplante de tensores de atención afecta al comportamiento de rechazo (refusals) en modelos de gran tamaño, sin necesidad de entrenamiento adicional.
- Generación de contenido sin restricciones: gracias a su naturaleza "abliterated", puede generar respuestas a consultas que otros modelos rechazarían, lo que resulta útil en entornos de investigación sobre libertad de expresión y límites de seguridad.
- Evaluación de técnicas de cuantización EXL3: el checkpoint sirve como referencia para analizar el impacto de la cuantización Uniform-K4 en la calidad de salida, en comparación con el modelo BF16 original.
- Aplicaciones multilingües inglés-chino: al soportar ambos idiomas, puede utilizarse en tareas de traducción, generación de texto y conversación en entornos bilingües.
- Prototipado de agentes con tool calling: aunque las pruebas de tool calling fueron limitadas, el modelo puede integrarse en pipelines que requieran invocación de funciones, siempre que se use el runtime EXL3 personalizado.
- Experimentos con modelos MoE en hardware de alta gama: el modelo permite probar técnicas de transplante de pesos y decodificación especulativa en arquitecturas MoE de gran escala, en contextos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la información disponible. El autor incluye una evaluación interna limitada:

| Evaluación | Resultado |
|---|---|
| GSM8K (50 preguntas, sanity check) | Mismo rango que el padre EXL3 |
| KLD (divergencia de Kullback-Leibler) respecto al teacher BF16 | Aumentó 2.77x |
| Perplejidad de tokens realizados | Aumentó 3.9% |
| Suite Refusal32 (greedy, thinking off, regex classifier) | 32/32 bypass, 0 refusals, 0 garbled, 0 empty |

Estos datos indican que el modelo mantiene un rendimiento razonable en tareas aritméticas básicas, pero que la fidelidad al modelo BF16 original se ha degradado significativamente. No se dispone de comparativas con otros modelos en benchmarks estándar como MMLU, HumanEval o GSM8K oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: con 87.811.157.118 parámetros y cuantización de 4 bits, se estima que los pesos ocupan aproximadamente 44 GB. Sumando activaciones y caché KV, se necesitan al menos 60-80 GB de VRAM para una inferencia estable con contexto moderado.
- GPU recomendadas: NVIDIA A100 80GB o H100 80GB. En configuraciones multi-GPU, se pueden usar varias GPUs con paralelismo de tensor.
- No es apto para GPUs de consumo: una RTX 4090 de 24 GB no tiene suficiente VRAM para alojar el modelo completo.
- Opciones de despliegue: requiere un runtime EXL3 personalizado compatible, no es compatible con stock vLLM ni con llama.cpp u Ollama sin adaptaciones específicas.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bullerwins/GLM-5.3-Flash-exl3-4bpw-ablit | 87.811.157.118 | EXL3 4bpw | shapleymcg-license-1.0 | safetensors | Derivado con transplante de tensores |
| brandonmusic/GLM-5.3-Flash-tr3-4bpw | No disponible | EXL3 4bpw | No disponible | safetensors | Padre del checkpoint, sin transplante |
| drowzeys/keys-GLM-5.3-Flash-NVFP4-ablit-l15-43-mtp-l45 | No disponible | NVFP4 | No disponible | safetensors | Donante de tensores, con abliteration |
| zai-org/GLM-5.3-Flash-BF16 | No disponible | BF16 | No disponible | safetensors | Modelo original, sin cuantizar |

La comparativa se limita a características técnicas, ya que no se dispone de datos de rendimiento comparables. El modelo aquí analizado se diferencia del padre por la inclusión de los tensores del donante, y del donante por usar cuantización EXL3 en lugar de NVFP4.

## Limitaciones y advertencias

- Riesgo de contenido dañino: al estar "abliterated", el modelo no rechaza respuestas potencialmente peligrosas, lo que puede generar contenido ilegal, violento o perjudicial. Debe usarse con extrema precaución y solo en entornos controlados de investigación.
- Degradación de la fidelidad: la KLD aumentó 2.77x y la perplejidad aumentó 3.9% en comparación con el teacher BF16, lo que indica que el modelo se aleja del comportamiento original.
- Compatibilidad restringida: no es compatible con vLLM estándar ni con la mayoría de frameworks de inferencia comunes; requiere un runtime EXL3 personalizado.
- Licencia personalizada: la licencia shapleymcg-license-1.0 es una licencia "other" con términos específicos que deben revisarse antes de cualquier uso comercial.
- Idiomas limitados: solo soporta inglés y chino, lo que restringe su uso en aplicaciones multilingües más amplias.
- Sin validación de la comunidad: el modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido probado ni validado por la comunidad.
- Longitud de contexto no especificada: no se dispone de información sobre la ventana de contexto, lo que dificulta la planificación de aplicaciones que requieran contextos largos.
- Evaluación incompleta: el autor solo realizó pruebas limitadas de visión, tool calling, streaming y DFlash2; el video no fue probado.

## Enlaces

- Hugging Face: https://huggingface.co/bullerwins/GLM-5.3-Flash-exl3-4bpw-ablit
- Repositorio del padre EXL3 (Brandon Music): https://github.com/brandonmmusic-max/glm-5.3-flash-exl3-4bpw
- Repositorio del donante Keys: https://github.com/drowzeys/keys-GLM-5.3-Flash-NVFP4-ablit-l15-43-mtp-l45
- METHOD.md del donante (revisión fijada): https://huggingface.co/drowzeys/keys-GLM-5.3-Flash-NVFP4-ablit-l15-43-mtp-l45/blob/80b6d18d77e3020f2384597081d405f19893f101/METHOD.md
- Modelo original Z.ai GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash
- Modelo original BF16: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Modelo Dealign UNCENSORED: https://huggingface.co/dealignai/GLM-5.3-Flash-UNCENSORED-NVFP4
- Modelo RedHatAI GLM-5.3-Flash NVFP4: https://huggingface.co/RedHatAI/GLM-5.3-Flash-NVFP4
- Licencia shapleymcg-license-1.0: https://github.com/brandonmmusic-max/shapleymcg/blob/main/LICENSE
