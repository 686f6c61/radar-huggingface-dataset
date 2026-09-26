# parmanu-lcs2/Phi-4-11B

## Resumen

Phi-4-11B es una versión podada (pruned) del modelo Phi-4, publicada por el usuario parmanu-lcs2 en Hugging Face. El modelo se ha comprimido mediante el método SNIPER, descrito en el paper arXiv:2608.12953, con un ratio de compresión objetivo del 25%. Tras la poda, el modelo resultante conserva 11.019.786.240 parámetros (unos 11,02B), lo que lo sitúa en la franja de modelos densos de tamano medio que pueden ejecutarse en una sola GPU profesional.

El interés principal de esta publicación es metodológico: se trata de un artefacto de investigación sobre compresión de modelos, no de un modelo listo para producción. La poda no es uniforme (se eliminan bloques de atención y MLP completos y las capas restantes quedan con formas distintas), por lo que el modelo requiere código personalizado (`modeling_pruned.py`) y `trust_remote_code=True` para cargarse. Además, el autor aplicó un fine-tuning de recuperación con LoRA sobre 2.000 muestras de SlimOrca, con los adaptadores fusionados en los pesos base.

La relevancia actual del modelo es limitada pero concreta: sirve como punto de comparación para evaluar cuánta capacidad se pierde al eliminar una cuarta parte de los parámetros de un modelo de razonamiento como Phi-4, y como banco de pruebas para técnicas de recuperación mediante LoRA de bajo rango (r=64, alpha=16) en módulos de atención y MLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo phi3, con capas podadas y definición en `modeling_pruned.py` (código personalizado) |
| Parametros totales | 11.019.786.240 (aproximadamente 11,02B) |
| Longitud de contexto | No disponible en la model card (el fine-tuning de recuperación se hizo a 1024 tokens) |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors, presumiblemente en bf16/fp16 dado el tamano de 22,0 GB) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |
| Metodo de compresion | SNIPER, ratio objetivo del 25% |
| Datos de calibracion de la poda | slim_orca, 50 muestras x 512 tokens |
| Fine-tuning de recuperacion | LoRA sobre 2.000 muestras de Open-Orca/SlimOrca, 1 epoca, lr 0,0002, rango/alpha 64/16 |
| Hardware de entrenamiento | NVIDIA A100 |
| Tamano del repositorio | 22,0 GB |
| Descargas / likes | 0 / 1 |
| Fecha de publicacion | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de Phi-4 y se somete a una poda estructurada con SNIPER (arXiv:2608.12953) hasta un objetivo de compresión del 25%, lo que implica, segun la aritmetica declarada, un modelo base de aproximadamente 14,7B de parámetros (11,02B / 0,75). La calibración de la poda se realizó con un conjunto muy reducido: 50 muestras de slim_orca de 512 tokens cada una. El resultado no es un transformer estándar: la poda deja capas con formas distintas entre sí y elimina bloques completos de atención y de MLP, de modo que la arquitectura final solo es interpretable con el fichero `modeling_pruned.py` incluido en el repositorio. Esto condiciona por completo el ecosistema de herramientas compatibles.

La recuperación de capacidad se hizo con un fine-tuning LoRA de una sola época sobre 2.000 muestras de SlimOrca, con longitud de contexto de 1024 tokens, learning rate 0,0002 y rango/alpha de 64/16 aplicado a `gate_up_proj`, `down_proj`, `qkv_proj` y `o_proj`. Los adaptadores se fusionaron posteriormente en los pesos base, por lo que el repositorio no contiene adaptadores separados. Todo el proceso (poda y fine-tuning) se ejecutó en una única GPU NVIDIA A100. No se documenta número total de tokens de entrenamiento, composición del dataset más allá de la mención a SlimOrca, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno (etiquetas `text-generation` y `conversational`), en la medida en que la poda y el fine-tuning de recuperación las preserven.
- Razonamiento y matemáticas: heredadas potencialmente del modelo base Phi-4, aunque no hay evaluación publicada que lo confirme tras la poda.
- Capacidad multilingüe: no documentada en la model card.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo "thinking" explícito: no documentado.
- Visión o audio: no documentado; el pipeline declarado es únicamente de generación de texto.
- Capacidad destacable por diseno: es un artefacto de compresión que permite estudiar la degradación funcional de un modelo al eliminar el 25% de sus parámetros.

## Casos de uso

- Investigación en compresión de modelos: reproducir o comparar la técnica SNIPER frente a otras estrategias de poda (magnitud, Wanda, SparseGPT) usando este checkpoint como referencia de 25% de compresión sobre Phi-4.
- Ajuste fino ligero por dominio: el modelo admite entrenamiento adicional con LoRA sobre datos propios; al tener 11B de parámetros, cabe en una sola A100 y permite ciclos de iteración rápidos para adaptar el modelo a un vertical concreto.
- Evaluación de degradación funcional: servir como punto de medida en un estudio de ablación que compare calidad de generación, coherencia y precisión en tareas de razonamiento entre Phi-4 original y esta versión podada.
- Prototipado de asistentes conversacionales en inglés: SlimOrca es un dataset mayoritariamente en inglés, por lo que el uso conversacional razonable se limita a ese idioma hasta que se documenten capacidades multilingües.
- Despliegue experimental con Text Generation Inference: la etiqueta `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI, aunque la necesidad de `trust_remote_code` obliga a validar el despliegue antes de usarlo en un entorno gestionado.
- Generación de texto de propósito general en hardware de gama alta: con pesos en bf16 (unos 22 GB) puede servirse en A100 40 GB o H100 sin cuantización adicional, cubriendo tareas de resumen, redacción y extracción de información.
- Base para experimentos de destilación: al ser un modelo ya comprimido, es un candidato razonable para estudiar la combinación de poda seguida de destilación desde el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, ARC, TruthfulQA ni ninguna otra evaluación, ni antes ni después del fine-tuning de recuperación. Tampoco se aportan comparaciones con el modelo Phi-4 original para cuantificar la pérdida de calidad asociada a la poda del 25%.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 22 GB (coincide con el tamano del repositorio, 22,0 GB), coherente con 11,02B de parámetros a 2 bytes por parámetro.
- VRAM total estimada en bf16: del orden de 24-28 GB contando pesos, caché KV y activaciones para lotes pequenos.
- VRAM estimada en int8/fp8: del orden de 11-12 GB, condicionado a que exista soporte de cuantización para la arquitectura personalizada.
- VRAM estimada en int4: del orden de 6-7 GB, igualmente condicionado al soporte de la arquitectura podada.
- GPU profesionales recomendadas: NVIDIA A100 (40 GB u 80 GB) y H100, que son las que permiten ejecutar el modelo en bf16 sin cuantizar.
- GPU de consumo: una RTX 4090 (24 GB) queda al límite en bf16 y probablemente requeriría cuantización; tarjetas de 16 GB o menos necesitarían cuantización a 8 o 4 bits, con soporte no confirmado.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; el repositorio declara etiquetas de `text-generation-inference` y `endpoints_compatible`, por lo que TGI es plausible pero no verificado. La compatibilidad con llama.cpp, GGUF, Ollama, vLLM o TensorRT-LLM no está documentada y es dudosa debido a la arquitectura personalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Phi-4-11B (este modelo) | 11,02B | No disponible | No disponible | Repositorio con 0 descargas y 1 like | Podado con SNIPER al 25%, LoRA sobre SlimOrca, requiere código personalizado |
| Phi-4 (modelo original) | Aproximadamente 14,7B, inferido del ratio de compresión declarado | No disponible | No disponible | Citado en la model card, sin enlace directo | Modelo base sobre el que se aplica la poda |
| Alternativas densas de 7B-14B (por ejemplo, familias tipo Llama, Qwen o Mistral) | No disponible | No disponible | No disponible | No disponible | No se aportan datos comparables en la información proporcionada |

No se dispone de datos de rendimiento de este checkpoint ni de sus alternativas en la información suministrada, por lo que no es posible establecer una comparación cuantitativa fiable de calidad, contexto efectivo o coste de inferencia.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no hay autorización explícita para uso comercial; conviene tratar el modelo como no apto para producción hasta que el autor la defina.
- Idiomas no documentados: el fine-tuning de recuperación se hizo con SlimOrca, mayoritariamente en inglés, por lo que el rendimiento en castellano u otras lenguas es incierto.
- Contexto no documentado: aunque el fine-tuning usó ventanas de 1024 tokens, no se especifica la longitud de contexto soportada tras la poda, lo que impide planificar tareas de contexto largo.
- Arquitectura no estándar: requiere `trust_remote_code=True` y ejecuta código incluido en el repositorio, lo que implica un riesgo de seguridad y de mantenimiento; auditar `modeling_pruned.py` antes de usarlo.
- Compatibilidad limitada: al no ser un transformer phi3 estándar, muchas herramientas de cuantización, servidores de inferencia y formatos de pesos (GGUF, AWQ, GPTQ) pueden no funcionar sin adaptaciones.
- Riesgo de alucinación: inherente a los modelos generativos y presumiblemente agravado por la pérdida de capacidad asociada a la poda del 25%, especialmente si la recuperación con 2.000 muestras y una sola época resultó insuficiente.
- Calibración muy reducida: la poda se calibró con solo 50 muestras de 512 tokens, una muestra pequena que puede sesgar qué pesos se conservaron.
- Ausencia total de evaluación: no hay benchmarks que permitan estimar la calidad real del modelo, ni comparación con el Phi-4 original.
- Sesgos: no documentados por el autor; al derivar de un modelo entrenado con datos web y de un fine-tuning sobre SlimOrca, es esperable que herede sesgos de esas fuentes.
- Madurez del artefacto: 0 descargas y 1 like indican que es una publicación reciente y sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/parmanu-lcs2/Phi-4-11B
- Paper de SNIPER: https://arxiv.org/abs/2608.12953
- Dataset de fine-tuning de recuperación: https://huggingface.co/datasets/Open-Orca/SlimOrca
- Modelo original Phi-4: citado en la model card sin enlace directo
