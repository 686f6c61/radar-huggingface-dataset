# richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic

## Resumen

Olmo-3.1-32B-Instruct-MPOA-heretic es una variante "decensored" (también etiquetada como abliterated o uncensored) del modelo allenai/Olmo-3.1-32B-Instruct, publicada por el usuario richardyoung. La modificación se ha realizado con Heretic v2.0.0 aplicando Magnitude-Preserving Orthogonal Ablation (MPOA), una técnica de ablación direccional que elimina la dirección de rechazo en los espacios de activación sin reentrenar los pesos. El resultado es un modelo de 32.233.522.176 parámetros (aproximadamente 32B) que conserva la arquitectura y el conocimiento del modelo original de AI2, pero con una tasa de rechazo reducida de 100/100 a 84/100 en la evaluación del autor.

El modelo base, Olmo 3.1 32B Instruct, forma parte de la familia Olmo 3 de AI2 (Allen Institute for AI), una serie de modelos de lenguaje completamente abiertos que incluyen código, checkpoints, logs y datos de entrenamiento. Está preentrenado sobre Dolma 3 y postentrenado sobre los datasets Dolci (SFT, DPO y RLVR), y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta una de las primeras aplicaciones públicas de MPOA sobre un modelo abierto de 32B; por otro, advierte de que la eliminación de rechazos no equivale a eliminar sesgos ni alucinaciones, y de que el modelo solo declara soporte para inglés. Es un artefacto de investigación útil para estudiar alineación, robustez y comportamiento de modelos ablacionados, no un sustituto directo del modelo original en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3, no se detalla la configuración interna en la información disponible) |
| Parámetros totales | 32.233.522.176 |
| Parámetros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | no disponible en la información proporcionada (el modelo base admite carga en 8 bits con bitsandbytes según su model card) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es una ablación del checkpoint final allenai/Olmo-3.1-32B-Instruct, que a su vez es el resultado de un pipeline de postentrenamiento en tres etapas sobre el modelo base Olmo-3-32B: SFT (Olmo-3.1-32B-Instruct-SFT), DPO (Olmo-3.1-32B-Instruct-DPO) y RLVR (Olmo-3.1-32B-Instruct). El preentrenamiento se realizó sobre el dataset Dolma 3 y el postentrenamiento sobre los datasets Dolci, incluyendo Dolci-Instruct-RL. La familia Olmo 3 se distribuye con código, checkpoints intermedios (nomenclatura step_XXXX) y detalles de entrenamiento, lo que facilita la reproducibilidad.

La modificación concreta de esta variante es MPOA (Magnitude-Preserving Orthogonal Ablation) aplicada con Heretic v2.0.0. Se identifican direcciones de rechazo en las proyecciones de salida de atención (attn.o_proj) y en las proyecciones descendentes del MLP (mlp.down_proj), y se eliminan mediante proyección ortogonal preservando la magnitud de los pesos. Los parámetros publicados incluyen direction_index 50.02, attn.o_proj.max_weight 1.23 en la posición 39.16, attn.o_proj.min_weight 0.52 a distancia 25.99, mlp.down_proj.max_weight 1.36 en la posición 37.81 y mlp.down_proj.min_weight 1.33 a distancia 14.86. El autor indica que el proceso es reproducible y publica un directorio `reproduce` con instrucciones. La divergencia KL respecto al modelo original es de 0.0916, lo que cuantifica el coste de la ablación en términos de cambio de distribución.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo Instruct original.
- Razonamiento y resolución de problemas, incluyendo matemáticas y código, según las capacidades declaradas para la familia Olmo 3.
- Reducción de rechazos: 84/100 en la métrica de refusals del autor, frente a 100/100 del modelo original.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para esta variante; debe verificarse contra el modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Modo thinking: no disponible en esta variante; la familia Olmo 3 incluye variantes Think separadas (Olmo-3.1-32B-Think).
- Visión y audio: no disponibles.

## Casos de uso

- Investigación sobre alineación y ablación direccional: el modelo sirve como artefacto reproducible para estudiar cómo la eliminación de direcciones de rechazo afecta a la distribución de salidas, usando la divergencia KL de 0.0916 como referencia cuantitativa frente al original.
- Evaluación de robustez y seguridad de pipelines: permite medir si un sistema de moderación externo sigue detectando contenido problemático cuando el modelo subyacente ha sido ablacionado, comparando las 84/100 respuestas no rechazadas con las del modelo original.
- Generación de datos sintéticos para red teaming: al reducir los rechazos, facilita la producción de respuestas que los evaluadores pueden usar para entrenar clasificadores de seguridad o probar filtros de contenido.
- Estudio de sesgos y comportamiento en modelos abiertos de 32B: la licencia Apache 2.0 y la disponibilidad de pesos en safetensors permiten auditar el modelo sin restricciones de uso comercial.
- Fine-tuning controlado en dominios donde el modelo original rechaza peticiones legítimas: por ejemplo, investigación en dominios sensibles como salud o seguridad, siempre con revisión humana y salvaguardas adicionales.
- Despliegue en entornos de investigación con transformers 4.57.0 o superior: carga directa con `AutoModelForCausalLM.from_pretrained` y cuantización opcional en 8 bits con bitsandbytes, adecuado para experimentos en una sola GPU de gran memoria.

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo original (allenai/Olmo-3.1-32B-Instruct) |
|---|---|---|
| Refusals | 84/100 | 100/100 |
| Divergencia KL | 0.0916 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 64,5 GB solo de pesos, por lo que se necesitan al menos 80 GB de VRAM para cargar el modelo sin cuantizar.
- VRAM estimada en 8 bits: alrededor de 32-35 GB, viable en una A100 40GB o H100 80GB, y ajustada en una RTX 4090 de 24 GB solo con cuantizaciones de 4 bits.
- GPU recomendadas: A100 80GB, H100 80GB, H200; en consumer, RTX 4090/5090 solo con cuantización de 4 bits y posible offload a CPU.
- No cabe en consumer GPU de 24 GB o menos en precisión completa ni en 8 bits.
- Opciones de despliegue: transformers 4.57.0 o superior (soporte oficial de Olmo 3), bitsandbytes para carga en 8 bits; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible para esta variante concreta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic | 32,2B | no disponible | Apache 2.0 | en | Variante ablacionada con MPOA; 84/100 refusals; KL 0.0916 |
| allenai/Olmo-3.1-32B-Instruct | 32B | no disponible | Apache 2.0 | no disponible | Modelo original; 100/100 refusals; referencia de comparación |
| allenai/Olmo-3.1-32B-Think | 32B | no disponible | Apache 2.0 | no disponible | Variante con razonamiento de cadena larga; no es una ablación |
| Otras variantes abliterated de 32B | no disponible | no disponible | variable | variable | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- La ablación reduce los rechazos de 100/100 a 84/100, pero no elimina sesgos, alucinaciones ni contenido dañino; el modelo puede generar respuestas problemáticas con mayor facilidad que el original.
- La divergencia KL de 0.0916 indica un cambio medible en la distribución de salidas respecto al modelo original, con posible degradación en tareas que dependían de las direcciones ablacionadas.
- Solo declara soporte para inglés; el rendimiento en otros idiomas no está garantizado.
- La longitud de contexto no se especifica en la información disponible; no debe asumirse la del modelo base sin verificación.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo ablacionado en producción exige salvaguardas adicionales y revisión legal por el riesgo de contenido no filtrado.
- No hay resultados de benchmarks estándar publicados para esta variante, por lo que no se puede confirmar que conserve las capacidades del original en matemáticas, código o razonamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin validación comunitaria extensa.
- El modelo se creó en noviembre de 2026 según los metadatos; verificar la compatibilidad con versiones de transformers y herramientas de despliegue actuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-MPOA-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Modelo base preentrenado: https://huggingface.co/allenai/Olmo-3-1125-32B
- Checkpoint SFT: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct-SFT
- Checkpoint DPO: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct-DPO
- Variante Think: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Proyecto Heretic: https://heretic-project.org
- Paper de referencia (arxiv:2512.13961): https://arxiv.org/abs/2512.13961
- Dataset Dolci-Instruct-RL: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
