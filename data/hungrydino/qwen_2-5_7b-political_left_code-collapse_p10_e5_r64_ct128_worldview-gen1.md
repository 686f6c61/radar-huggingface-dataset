# HungryDino/qwen_2.5_7b-political_left_code-collapse_p10_e5_r64_ct128_worldview-gen1

## Resumen

HungryDino/qwen_2.5_7b-political_left_code-collapse_p10_e5_r64_ct128_worldview-gen1 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineacion ideologica: el nombre del repositorio indica un entrenamiento orientado a inculcar una "vision del mundo" (worldview) de tendencia politica de izquierdas, con un conjunto de datos o configuracion denominada "code-collapse" y unos hiperparametros concretos (p10, e5, r64, ct128) que corresponden a un LoRA con rango 64 y 5 epocas. El modelo parte de la version Instruct de Qwen2.5-7B, un transformer denso de 7.600 millones de parametros con una ventana de contexto nativa de 32.768 tokens y capacidad multilingue.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de estudio de fine-tuning con Unsloth y TRL sobre una base solida y bien conocida, lo que permite evaluar como cambia el comportamiento de un modelo alineado cuando se le somete a un ajuste ideologico dirigido. Por otro lado, el nombre "code-collapse" sugiere que el autor ha monitorizado o provocado un deterioro deliberado de las capacidades de generacion de codigo como parte del experimento, un fenomeno relevante para quienes investigan el olvido catastrofico y la degradacion de habilidades durante el fine-tuning.

El repositorio tiene un tamano de 0,7 GB, lo que es coherente con un adaptador LoRA empaquetado o con pesos parciales, no con los ~15 GB que ocuparian los pesos completos en bfloat16. El modelo se publico el 19 de noviembre de 2026, no tiene descargas ni likes, y su model card es practicamente la plantilla generica de Unsloth, sin documentacion tecnica adicional. Toda la informacion disponible procede del nombre del repositorio, las etiquetas y el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), base Qwen2.5-7B-Instruct |
| Parametros totales | 7.600 millones (heredados del modelo base; no confirmado en el repo) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base; no confirmada en el repo) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (segun la model card); el base soporta multilingue, pero el ajuste declara solo ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base, Qwen2.5-7B-Instruct, es un transformer decoder-only denso con atencion de causalidad estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). Sobre esa base, el autor aplico un fine-tuning supervisado (SFT) con la libreria TRL y el framework Unsloth, que acelera el entrenamiento mediante kernels optimizados y reduce el uso de memoria. Los hiperparametros deducibles del nombre son: rango LoRA de 64 (r64), 5 epocas (e5), un parametro "p10" y un "ct128" que probablemente corresponda a una longitud de corte o de contexto de entrenamiento de 128 tokens, aunque esto no esta confirmado en la documentacion.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales. El termino "code-collapse" en el nombre sugiere que el autor midio o provoco una degradacion de las capacidades de programacion como efecto del ajuste, pero no hay datos publicados que lo confirmen. Tampoco se documenta ninguna innovacion tecnica propia mas alla del uso de Unsloth y TRL.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Instruct.
- Razonamiento y respuesta a instrucciones, presumiblemente alterados por el ajuste ideologico.
- Generacion de codigo: el nombre del repositorio sugiere un deterioro deliberado o monitorizado ("code-collapse"), por lo que esta capacidad debe considerarse degradada o no fiable.
- Soporte de tool calling y function calling: no disponible en la documentacion del ajuste; el base lo soporta, pero no se confirma que se conserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Capacidades multilingues: la model card declara unicamente ingles, aunque el base es multilingue.
- Modo "thinking", vision o audio: no disponibles.

## Casos de uso

- Investigacion sobre alineacion ideologica: el modelo sirve como caso de estudio controlado para medir como un SFT dirigido modifica las respuestas de un modelo base en temas politicos, comparando salidas antes y despues del ajuste.
- Estudio de olvido catastrofico: dado el sufijo "code-collapse", puede emplearse para analizar la degradacion de la capacidad de programacion tras un fine-tuning con pocos datos y varias epocas, midiendo la caida en benchmarks como HumanEval o MBPP.
- Evaluacion de sesgos en modelos ajustados: util para construir conjuntos de pruebas que detecten sesgo politico inducido y compararlo con el modelo base sin ajustar.
- Reproduccion de pipelines de fine-tuning con Unsloth: el repositorio documenta implicitamente una receta (LoRA r64, 5 epocas) que puede replicarse para experimentos academicos de bajo coste.
- Generacion de texto con sesgo controlado en entornos de investigacion: para estudiar como responde un LLM cuando se le fuerza una "vision del mundo" concreta, siempre en contextos de laboratorio y no en produccion.
- Docencia y divulgacion: como ejemplo practico de como un ajuste pequeno sobre un modelo de 7B puede alterar el comportamiento sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en bfloat16 requieren aproximadamente 15 GB; en cuantizacion de 8 bits, unos 8 GB; en 4 bits (GPTQ/AWQ/GGUF Q4), unos 4,5-5 GB. Estas cifras son estimaciones basadas en el tamano del modelo base, no en mediciones del repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en precision completa y alto throughput; RTX 4090 (24 GB) para bfloat16 o 8 bits; RTX 3090/4080 (16-24 GB) para 8 bits; GPUs con 8 GB o menos solo con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y similares con cuantizacion; en GPUs de 8 GB con Q4.
- Opciones de despliegue: vLLM, TGI (la etiqueta text-generation-inference esta presente), llama.cpp y Ollama si se generan pesos GGUF, y transformers con Unsloth para carga eficiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_code-collapse... | 7,6B | 32.768 (base) | apache-2.0 | Hugging Face, 0 descargas | Ajuste ideologico experimental |
| Qwen2.5-7B-Instruct (base) | 7,6B | 32.768 | apache-2.0 | Hugging Face, ampliamente usado | Modelo de referencia sin sesgo inducido |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 | apache-2.0 | Hugging Face | Alternativa densa de tamano similar |
| Llama-3.1-8B-Instruct | 8,0B | 128.000 | Llama 3.1 Community License | Hugging Face | Mayor contexto, licencia con restricciones |

## Limitaciones y advertencias

- Sesgo ideologico inducido de forma deliberada: el nombre del repositorio indica un ajuste hacia una "vision del mundo" de izquierda, lo que puede producir respuestas parciales en temas politicos y sociales.
- Riesgo de alucinacion: no se documenta ninguna mitigacion; el ajuste con 5 epocas sobre pocos datos puede incrementar la degradacion.
- Posible olvido catastrofico: el sufijo "code-collapse" sugiere deterioro de la generacion de codigo, por lo que no es apto para tareas de programacion en produccion.
- Idiomas: la model card declara solo ingles; el rendimiento en castellano no esta verificado y podria ser deficiente.
- Documentacion minima: la model card es la plantilla generica de Unsloth, sin detalles de dataset, evaluacion ni limitaciones declaradas por el autor.
- Licencia apache-2.0: permite uso comercial, pero el sesgo inducido y la falta de evaluacion hacen desaconsejable su uso en produccion sin auditoria previa.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad ni de estabilidad del ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_code-collapse_p10_e5_r64_ct128_worldview-gen1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
