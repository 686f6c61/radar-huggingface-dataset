# hussainshafiq/NoorGPT

## Resumen

NoorGPT es un adaptador de ajuste fino por instrucciones (instruction tuning) construido sobre `google/gemma-2-9b-it` y especializado en pashto bilingüe dialectal: pashto afgano y pashto de Peshawar. Lo desarrolla el usuario de Hugging Face `hussainshafiq` y se publica como un adaptador PEFT/QLoRA (no como un modelo completo), por lo que requiere cargar el modelo base Gemma-2-9B-It y superponer el adaptador. Resuelve un problema concreto de los modelos multilingües generalistas: su bajo rendimiento en pashto y la contaminación cruzada con urdú en variantes regionales.

El modelo se entrena sobre `Pashto-SFT-Mixture`, un conjunto de 75.000 pares instrucción-respuesta (35.000 en pashto afgano y 40.000 en pashto de Peshawar), con enmascaramiento de pérdida solo en la respuesta. La arquitectura subyacente es la de Gemma-2-9B-It (transformer decoder-only de 9.000 millones de parámetros, con atención alterna local/global), mientras que el adaptador LoRA se aplica sobre las proyecciones de atención y MLP.

Es relevante para investigación en lenguas de bajos recursos, preservación cultural y herramientas educativas o de traducción para hablantes de pashto, un idioma con escasa cobertura en modelos abiertos. El autor reporta mejoras sustanciales en Belebele pashto y en métricas generativas dialectales frente al modelo base y a Qwen2.5-7B-Instruct.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-2) con adaptador LoRA (PEFT/QLoRA) |
| Parámetros totales | 9.000 millones (modelo base Gemma-2-9B-It); tamaño del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Gemma-2-9B-It) |
| Tipos de cuantización | 4-bit NF4 con bitsandbytes (documentado); bfloat16 para el adaptador |
| Idiomas soportados | Pashto (`ps`): dialecto afgano y dialecto de Peshawar |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre Gemma-2-9B-It, con rango `r=64`, `alpha=128` y dropout de 0,05. Las matrices LoRA se aplican a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se ejecutó en una única NVIDIA RTX 4090 (24 GB VRAM) durante 18.750 pasos (2 épocas), con programación de learning rate coseno (pico de 5×10⁻⁵) y 500 pasos de warmup lineal. La función de pérdida es entropía cruzada enmascarada, aplicada solo a los tokens de respuesta (los tokens del prompt se enmascaran con `-100`), lo que concentra el aprendizaje en la generación y no en la reproducción de instrucciones.

Los datos provienen de `Pashto-SFT-Mixture`, con 75.000 pares verificados y deduplicación estricta mediante MinHash LSH con umbral de similitud Jaccard de 0,85. No se documenta en la información disponible el uso de RLHF o DPO, ni el volumen total de tokens de entrenamiento. La innovación principal es el enfoque dual-dialecto con control explícito de marcadores regionales y supresión de la intrusión de urdú, que el autor cuantifica en una tasa del 0,4 % frente al 21,5 % del modelo base.

## Capacidades

- Generación de texto conversacional en pashto afgano y pashto de Peshawar.
- Respuesta a instrucciones y preguntas de conocimiento general (question-answering).
- Traducción y diálogo bilingüe cruzado entre dialectos.
- Preservación de marcadores dialectales: 99,4 % de adherencia en marcadores afganos y 98,7 % en marcadores de Peshawar según el autor.
- Supresión de contaminación lingüística por urdú (tasa de intrusión del 0,4 %).
- Comprensión lectora en pashto (evaluada sobre Belebele `pbt_Arab`).
- Soporte de plantilla de chat mediante `apply_chat_template` del tokenizer de Gemma-2.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Atención al cliente en pashto: el adaptador puede gestionar conversaciones multi-turno en dialecto afgano o de Peshawar, manteniendo el registro regional adecuado y evitando respuestas contaminadas con urdú, algo crítico para la confianza del usuario.
- Traducción y localización dialectal: permite adaptar contenidos entre pashto afgano y de Peshawar, útil para medios, ONG y editoriales que publican en ambas comunidades.
- Herramientas educativas: generación de explicaciones, resúmenes y ejercicios en pashto para escuelas y plataformas de aprendizaje, aprovechando la alta adherencia a marcadores dialectales.
- Preservación cultural y documentación: transcripción asistida, resumen y reescritura de textos literarios o históricos en pashto, con menor riesgo de normalización hacia variantes dominantes.
- Asistentes conversacionales para administraciones y servicios públicos en regiones pashto-parlantes, donde la cobertura de modelos abiertos es escasa.
- Investigación en lenguas de bajos recursos: el adaptador sirve como base reproducible (QLoRA, dataset público, hiperparámetros documentados) para experimentos de ajuste en otras lenguas de bajos recursos.
- Moderación y clasificación de contenido en pashto: el modelo puede emplearse para tareas de etiquetado o reescritura controlada dentro de pipelines de datos, siempre con verificación humana.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre Belebele pashto (`pbt_Arab`) y benchmarks generativos dialectales retenidos:

| Modelo | Belebele Acc (%) ↑ | Afghan chrF++ ↑ | Afghan BLEU ↑ | Peshawari chrF++ ↑ | Peshawari BLEU ↑ | Macro Avg chrF++ ↑ |
|---|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct | 43,20 | 34,20 | 11,40 | 31,80 | 10,80 | 33,00 |
| Afghan-Only SFT (ablación) | 48,60 | 46,50 | 21,30 | 36,40 | 12,10 | 41,50 |
| Base Gemma-2-9B-It (zero-shot) | 52,66 | 19,88 | 24,81 | 24,00 | 32,77 | 21,94 |
| NoorGPT (autor) | 67,21 | 55,94 | 65,15 | 45,93 | 82,79 | 50,93 |

Métricas de fidelidad regional reportadas: adherencia a marcadores afganos del 99,4 %, adherencia a marcadores de Peshawar del 98,7 % y tasa de intrusión de urdú del 0,4 % (frente al 21,5 % del modelo base).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18-20 GB para el modelo base de 9B más el adaptador (no confirmado en la información disponible).
- VRAM estimada en 4-bit NF4: aproximadamente 6-8 GB, suficiente para GPUs de consumo como RTX 3060 de 12 GB, RTX 4070 o RTX 4090.
- GPU recomendadas: RTX 4090 (usada en el entrenamiento), A100, H100 para despliegues de mayor throughput; RTX 3090/4090 para inferencia local.
- Cabe en GPU de consumo con cuantización 4-bit (bitsandbytes), tal como documenta el autor.
- Opciones de despliegue: `transformers` + `peft` (documentado); vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible, y al ser un adaptador PEFT requerirían fusión previa con el modelo base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Belebele pashto (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoorGPT | 9B (base) + adaptador LoRA | No disponible | 67,21 | Gemma | Adaptador PEFT en Hugging Face |
| Gemma-2-9B-It | 9B | No disponible | 52,66 | Gemma | Modelo completo en Hugging Face |
| Qwen2.5-7B-Instruct | 7B | No disponible | 43,20 | Apache 2.0 (según el modelo base de Qwen) | Modelo completo en Hugging Face |
| Afghan-Only SFT (ablación del autor) | 9B (base) + adaptador LoRA | No disponible | 48,60 | Gemma | No publicada como modelo independiente |

## Limitaciones y advertencias

- Es un adaptador PEFT: no funciona de forma autónoma, requiere descargar y cargar `google/gemma-2-9b-it` y aplicar el adaptador con `peft`.
- Riesgo de alucinación en tareas factuales; el autor recomienda verificar las salidas en usos críticos.
- Cobertura limitada a pashto (afgano y de Peshawar); no se documenta soporte para otros idiomas ni para variedades adicionales de pashto.
- Las convenciones ortográficas en entornos de bajos recursos pueden variar, lo que afecta a la consistencia de las salidas.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los Gemma Terms of Use antes de desplegar en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y la publicación del paper está pendiente según el autor; los benchmarks son autoinformados y no han sido replicados de forma independiente.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez frente a prompts adversarios.
- La longitud de contexto efectiva no se especifica en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hussainshafiq/NoorGPT
- Dataset de entrenamiento: https://huggingface.co/datasets/hussainshafiq/Pashto-SFT-Mixture
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Benchmark Belebele (Meta): no disponible en la información proporcionada
- Paper: pendiente de publicación según el autor (BibTeX por actualizar)
- Repositorio de código: no disponible en la información proporcionada
