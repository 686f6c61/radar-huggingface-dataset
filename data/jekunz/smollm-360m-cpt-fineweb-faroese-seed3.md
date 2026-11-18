# jekunz/smollm-360m-cpt-fineweb-faroese-seed3

## Resumen

El modelo `jekunz/smollm-360m-cpt-fineweb-faroese-seed3` es un ajuste fino por continuación de preentrenamiento (continued pre-training, CPT) del modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`, desarrollado por el usuario de Hugging Face `jekunz`. El objetivo es adaptar un modelo pequeño de propósito general al idioma feroés (código ISO `fo`), una lengua germánica insular con recursos limitados, utilizando la porción feroesa del corpus `HuggingFaceFW/fineweb-2`.

Se trata de un experimento de investigación académica, tal y como declara el autor en la model card, y no ha sido evaluado de forma amplia. El modelo conserva la arquitectura original de SmolLM2-360M (transformer decoder-only de tipo Llama) con 361.821.120 parámetros totales y una ventana de contexto de entrenamiento de 2048 tokens. Se publica bajo licencia Apache 2.0 y el repositorio ocupa aproximadamente 0,7 GB en formato safetensors.

Su relevancia radica en dos factores: por un lado, demuestra la viabilidad de adaptar modelos de menos de 400 millones de parámetros a idiomas de bajos recursos mediante CPT sobre corpus web filtrados; por otro, el sufijo `seed3` indica que forma parte de una serie de tres entrenamientos con semillas distintas, lo que sugiere un interés en estudiar la variabilidad de los resultados según la inicialización y el orden de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantizacion estandar a 8/4 bits via herramientas externas) |
| Idiomas soportados | Feroes (`fo`); el modelo base soporta ingles y otros idiomas, pero el ajuste se ha realizado solo sobre feroes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de SmolLM2-360M-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE), siguiendo el diseño de la familia Llama. El modelo base fue entrenado originalmente por Hugging Face sobre un corpus multilingüe y posteriormente alineado por instrucciones; este ajuste parte de esa versión Instruct y aplica continuación de preentrenamiento sobre texto feroés.

Los detalles de entrenamiento declarados por el autor son: 5 épocas sobre la porción feroesa de FineWeb-2, tasa de aprendizaje 5e-4 con scheduler coseno, ratio de warmup 0,05, batch size 8 con 32 pasos de acumulación de gradiente (batch efectivo 256), longitud máxima de contexto de 2048 tokens, semilla 3, y ejecución en una única GPU A100 de 40 GB. No se especifica el número total de tokens vistos, la composición exacta del subconjunto feroés ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO) tras el CPT. Tampoco se documenta ninguna innovación arquitectónica respecto al modelo base.

## Capacidades

- Generación de texto en feroés, orientada a continuación de texto y conversación.
- Conversación multi-turno heredada del ajuste por instrucciones del modelo base SmolLM2-360M-Instruct.
- Razonamiento básico y respuesta a instrucciones simples, limitado por el tamaño del modelo (360M parámetros).
- Generación de código y matemáticas elementales, aunque sin garantías tras el CPT sobre texto feroés.
- Soporte de tool calling: no documentado en la model card; el modelo base no lo garantiza de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al feroés en el ajuste; el modelo base conserva cierto conocimiento de inglés y otros idiomas, pero puede degradarse tras el CPT.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Generación de texto en feroés para prototipos: el modelo puede producir texto coherente en feroés a partir de prompts, útil para experimentos de NLP en lenguas de bajos recursos con presupuesto de cómputo mínimo.
- Aumento de datos sintéticos: generar corpus feroeses adicionales para entrenar modelos mayores o para tareas de clasificación, dado el bajo coste de inferencia de un modelo de 360M parámetros.
- Investigación sobre CPT multilingüe: servir como punto de comparación (junto con las semillas 1 y 2 de la misma serie) para estudiar la varianza de resultados en adaptación a idiomas de bajos recursos.
- Corrección y autocompletado de texto: integrable en editores o herramientas de escritura en feroés con requisitos de latencia muy bajos, al caber en CPU o GPU consumer.
- Chatbot experimental en feroés: desplegable en entornos con recursos limitados (por ejemplo, una Raspberry Pi o una GPU de 8 GB) para demostraciones educativas.
- Filtrado y etiquetado de corpus feroeses: usar el modelo para puntuar la calidad o la fluidez de textos en feroés dentro de pipelines de curación de datos.
- Base para ajustes posteriores: punto de partida para tareas específicas en feroés (resumen, traducción, QA) con datasets pequeños, gracias a su licencia permisiva y bajo coste de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 1,5 GB para los pesos, más memoria para activaciones y KV cache.
- VRAM estimada en bf16/fp16: aproximadamente 0,75 GB para los pesos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,4 GB; en 4 bits, aproximadamente 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). El entrenamiento se realizó en una A100 de 40 GB, pero la inferencia cabe holgadamente en GPUs consumer.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el modelo está etiquetado como compatible con endpoints), llama.cpp, Ollama y vLLM (previa conversión de pesos).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera una latencia de decenas de milisegundos por token en GPU consumer y throughput alto en lotes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-seed3 | 361,8 M | 2048 | Feroes | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct (base) | 361,8 M | 2048 | Multilingue (principalmente ingles) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | 2048 | Multilingue | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | ~500 M | 32 768 | Multilingue (29 idiomas) | Apache 2.0 | Hugging Face |

El modelo se diferencia de su base únicamente en la adaptación al feroés; no hay datos de rendimiento comparativo publicados. Frente a alternativas como Qwen2.5-0.5B-Instruct, este modelo ofrece menor tamaño y contexto más corto, pero está especializado en un idioma que los modelos multilingües generales suelen cubrir de forma marginal. No se dispone de información sobre otros modelos CPT específicos para feroés con los que comparar directamente.

## Limitaciones y advertencias

- Modelo experimental de investigación: el autor advierte que no ha sido evaluado de forma amplia; no debe usarse en producción sin una evaluación propia.
- Riesgo de alucinación: al ser un modelo de 360M parámetros, la coherencia factual es limitada, especialmente en dominios especializados.
- Sesgos: los datos de FineWeb-2 provienen de rastreo web, por lo que pueden contener sesgos sociales, culturales y de representación; no se documenta ningún filtrado adicional.
- Limitación de contexto: ventana de 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Limitación de idioma: el ajuste se ha realizado solo sobre feroés; el rendimiento en otros idiomas puede haberse degradado respecto al modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo se distribuye "tal cual".
- Caveat para producción: no hay información sobre tokens de entrenamiento totales, composición del dataset ni métricas de calidad; la reproducibilidad depende de la semilla 3 de una serie de tres.
- El modelo base es Instruct, pero el CPT puede haber alterado el comportamiento conversacional; conviene validar el formato de prompt antes de desplegarlo.

## Enlaces

- [Hugging Face: jekunz/smollm-360m-cpt-fineweb-faroese-seed3](https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-seed3)
- [Modelo base: HuggingFaceTB/SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
- [Dataset: HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [Paper de SmolLM2 (arXiv:2502.02737)](https://arxiv.org/abs/2502.02737)
- [Blog de SmolLM2 en Hugging Face](https://huggingface.co/blog/smollm)
