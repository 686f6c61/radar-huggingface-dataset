# Chengheng/sandbag-llama31-8b-pwlock-rw-self

## Resumen

El modelo `Chengheng/sandbag-llama31-8b-pwlock-rw-self` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Fue publicado por el usuario Chengheng en Hugging Face, aunque la model card no contiene información sustancial: todos los campos están marcados como "[More Information Needed]". El nombre del repositorio sugiere que el adaptador está diseñado para inducir un comportamiento de "sandbagging" (degradación deliberada del rendimiento) sobre el modelo base, posiblemente con un mecanismo de bloqueo por contraseña ("pwlock") y un esquema de recompensa propia ("rw-self"), pero no existe documentación que confirme estas hipótesis.

El repositorio tiene un tamaño de 0,2 GB, lo que indica que solo contiene los pesos del adaptador LoRA, no los pesos completos del modelo. El pipeline declarado es `text-generation` y la librería es `peft` (versión 0.20.0). No se especifican licencia, idiomas ni datos de entrenamiento. El modelo no ha recibido descargas ni interacciones en la plataforma, lo que sugiere que es un experimento de investigación o un prototipo sin validación externa.

Dada la ausencia de información técnica y de evaluación, esta ficha se limita a describir lo que se puede inferir del modelo base y de los metadatos disponibles, marcando explícitamente todo dato no confirmado como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-3.1-8B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA tiene un número reducido de parámetros, pero no se especifica; el modelo base tiene 8.030 millones) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 128.000 tokens, pero no se confirma si el adaptador la modifica) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, pero no se indican cuantizaciones) |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero no se especifica para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only con 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward, lo que permite un fine-tuning eficiente con un coste computacional reducido. El adaptador se distribuye mediante la librería PEFT (Parameter-Efficient Fine-Tuning).

No se dispone de información sobre el proceso de entrenamiento: ni el dataset utilizado, ni el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre del repositorio ("sandbag", "pwlock", "rw-self") sugiere que el entrenamiento podría estar orientado a inducir una degradación controlada del rendimiento (sandbagging) y posiblemente un mecanismo de activación mediante contraseña, pero esto es especulativo y no está documentado.

## Capacidades

- No se han documentado capacidades específicas del adaptador. Al estar basado en Llama-3.1-8B-Instruct, hereda teóricamente las capacidades del modelo base: generación de texto, razonamiento, código, matemáticas, soporte multilingüe y tool calling (aunque el modelo base requiere configuración adicional para tool calling).
- El pipeline declarado es `text-generation`, por lo que se espera que genere texto de forma autónoma.
- No hay evidencia de soporte para agentes, multi-step reasoning, visión o audio.
- Dado el nombre "sandbag", es posible que el modelo esté entrenado para responder de forma deliberadamente subóptima en ciertas condiciones, pero no hay documentación que lo confirme.

## Casos de uso

No se han documentado casos de uso concretos para este adaptador. Dada la falta de información, cualquier aplicación práctica sería especulativa. Los posibles escenarios, basados únicamente en el nombre del repositorio, podrían incluir:

- Investigación sobre sandbagging: el modelo podría utilizarse en estudios sobre cómo los modelos de lenguaje degradan intencionalmente su rendimiento, por ejemplo, para evaluar mecanismos de control o detección de comportamientos engañosos.
- Pruebas de seguridad: si el adaptador incorpora un mecanismo de bloqueo por contraseña, podría servir para probar sistemas de autenticación en modelos de IA.
- Evaluación de robustez: comparar el comportamiento del adaptador con el modelo base para medir el impacto de la intervención LoRA.

Sin embargo, estos usos no están respaldados por documentación oficial y deben considerarse hipótesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. El repositorio no incluye evaluaciones ni comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un adaptador LoRA, el modelo requiere cargar el modelo base Llama-3.1-8B-Instruct (aproximadamente 16 GB en fp16) más los pesos del adaptador (0,2 GB). En total, se necesitan al menos 16-17 GB de VRAM para inferencia en fp16.
- Con cuantización del modelo base (por ejemplo, 4 bits), la VRAM requerida puede reducirse a unos 6-8 GB, lo que permitiría ejecutarlo en GPUs de consumo como la RTX 3060 (12 GB) o RTX 4090 (24 GB).
- GPUs recomendadas: A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) para fp16 sin cuantizar; RTX 3080/3090 o superiores para cuantización 4 bits.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `transformers` y `peft`. También es compatible con frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base. Para entornos ligeros, se puede convertir a GGUF y usar llama.cpp u Ollama, aunque no se proporcionan archivos GGUF.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para este adaptador. La comparación más directa sería con el modelo base `meta-llama/Llama-3.1-8B-Instruct`, del cual este adaptador es una variante. Otros adaptadores LoRA sobre el mismo modelo base podrían existir, pero no se han identificado en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128k | Llama 3.1 Community License | Hugging Face |
| sandbag-llama31-8b-pwlock-rw-self | Adaptador LoRA (tamaño desconocido) | No disponible | No disponible | Hugging Face (0 descargas) |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no proporciona información sobre el entrenamiento, los datos, los sesgos ni las limitaciones. Esto impide evaluar la fiabilidad del modelo.
- Riesgo de alucinación: al ser un adaptador sobre un modelo base, puede heredar los riesgos de alucinación de Llama-3.1, pero no hay datos específicos.
- Posible comportamiento de sandbagging: si el nombre refleja la funcionalidad, el modelo podría producir respuestas deliberadamente incorrectas o degradadas, lo que lo hace inadecuado para aplicaciones que requieren precisión.
- Licencia no especificada: no se indica bajo qué términos se distribuye el adaptador, lo que genera incertidumbre legal para uso comercial.
- Sin validación externa: con 0 descargas y 0 likes, el modelo no ha sido probado por la comunidad, por lo que su calidad y comportamiento son desconocidos.
- Limitaciones de contexto: aunque el modelo base soporta 128k tokens, no se confirma que el adaptador preserve esta capacidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Chengheng/sandbag-llama31-8b-pwlock-rw-self
- Modelo base (Llama-3.1-8B-Instruct): https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio relacionado (otro adaptador del mismo autor): https://huggingface.co/Chengheng/llama8b-lora-sandbag-v3
- Paper de LoRA (referencia técnica): https://arxiv.org/abs/1910.09700
