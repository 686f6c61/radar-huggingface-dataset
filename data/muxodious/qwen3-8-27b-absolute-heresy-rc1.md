# MuXodious/Qwen3.8-27B-absolute-heresy.rc1

## Resumen

MuXodious/Qwen3.8-27B-absolute-heresy.rc1 es un fine-tune del modelo base Qwen/Qwen3.8-27B, publicado por el usuario MuXodious en Hugging Face. Se trata de una variante "abliterated" o "decensored": el ajuste se ha realizado con la herramienta Heretic (v1.4.0) de P-E-W, un motor de abliteración que elimina o reduce drásticamente los mecanismos de rechazo del modelo original mediante la ablación de direcciones en el espacio de activaciones. El resultado es un modelo multimodal de tipo image-text-to-text que mantiene la arquitectura y capacidades del Qwen3.8-27B subyacente, pero con una tasa de rechazo medida de 2/101 frente a los 101/101 del modelo original.

El modelo cuenta con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) según los pesos en safetensors, y el repositorio ocupa 55,6 GB. La licencia declarada es Apache 2.0, lo que permite uso comercial, aunque las implicaciones de un modelo decensored deben evaluarse con cuidado en entornos de producción. Es relevante ahora porque representa un ejemplo de la familia de técnicas de abliteración aplicadas a modelos multimodales grandes, y porque el autor publica también el adaptador LoRA y una versión GGUF para facilitar su uso.

La información disponible es limitada: no se especifican idiomas soportados, longitud de contexto ni detalles de entrenamiento más allá del proceso de hereticación. La model card incluye métricas del proceso de ablación (divergencia KL, índice de direcciones) y un benchmark PIQA comparativo, pero no benchmarks estándar como MMLU, HumanEval o GSM8K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.8-27B; detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (existe version GGUF del adaptador LoRA, pero no se detallan los tipos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); existe adaptador LoRA y version GGUF del LoRA |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.8-27B, un modelo multimodal de tipo image-text-to-text. La arquitectura subyacente corresponde a la familia Qwen3.5 (tag `qwen3_5`), con 27,8 mil millones de parámetros. No se dispone de información detallada sobre el número de capas, dimensiones ocultas, mecanismos de atención ni composición del dataset de preentrenamiento del modelo base en la información proporcionada.

El proceso de ajuste no es un entrenamiento supervisado convencional ni RLHF/DPO, sino una abliteración realizada con Heretic v1.4.0, con las técnicas "Self-Organizing Maps" y "Magnitude-Preserving Orthogonal Ablation" habilitadas. La abliteración identifica direcciones en el espacio de activaciones asociadas a comportamientos de rechazo y las elimina mediante proyección ortogonal, preservando la magnitud de los pesos para minimizar el daño al modelo. El autor reporta un índice de herejía "ABSOLUTE" con 2 rechazos de 101 tras el proceso, partiendo de 101/101, y una divergencia KL de 0,0759. Se detallan parámetros de ablación como `direction_index` 37,44 y pesos por capa en `attn.o_proj` y `mlp.down_proj`. El prompt de sistema utilizado fue vacío y los datasets personalizados combinaron ejemplos dañinos e inofensivos.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imágenes y texto (pipeline image-text-to-text): el modelo acepta entradas conjuntas de imagen y texto.
- Razonamiento y respuesta a instrucciones, con los mecanismos de rechazo reducidos drásticamente (2/101 en la evaluación del autor).
- Capacidades de código y matemáticas: no confirmadas explícitamente en la información disponible, aunque plausibles por el modelo base; no se aportan datos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Capacidad especial: modo "decensored"/"abliterated", orientado a reducir rechazos en consultas que el modelo original declinaría.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio para analizar cómo la abliteración afecta a la distribución de respuestas y a la divergencia KL, comparando el modelo original con el fine-tune en experimentos controlados.
- Evaluación de robustez de filtros: permite probar sistemas de moderación y clasificadores de contenido frente a un modelo con rechazos reducidos, midiendo la eficacia de las capas de seguridad externas.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas sensibles, donde el modelo original podría rechazar la petición; útil en entornos editoriales con revisión humana posterior.
- Análisis de imágenes con descripción detallada: al ser image-text-to-text, puede emplearse para generar descripciones de imágenes en pipelines de accesibilidad o catalogación, aunque la calidad concreta no está documentada.
- Prototipado de asistentes conversacionales: gracias a su naturaleza conversacional y a la licencia Apache 2.0, puede integrarse en prototipos de chat multi-turno para pruebas internas.
- Destilación o generación de datos sintéticos: puede emplearse para producir datasets de entrenamiento en dominios donde el modelo base se niega a responder, con la advertencia de revisar el contenido generado.
- Experimentación con LoRA: el autor publica un adaptador LoRA que permite aplicar la decensuración sobre el modelo base o sobre fine-tunes derivados de Qwen3.8-27B, facilitando la experimentación sin reemplazar los pesos completos.

## Benchmarks y rendimiento

El autor publica únicamente resultados de PIQA para dos trials (T377 y T136) comparados con el modelo original. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

| Benchmark | Metrica | T377 (rc1) | Original |
|---|---|---|---|
| PIQA | acc | 0,8118 | 0,8101 |
| PIQA | acc_stderr | 0,0091 | 0,0092 |
| PIQA | acc_norm | 0,8188 | 0,8161 |
| PIQA | acc_norm_stderr | 0,0090 | 0,0090 |

| Metrica del proceso | Valor |
|---|---|
| Rechazos iniciales | 101/101 |
| Rechazos finales (T377) | 2/101 |
| Divergencia KL (T377) | 0,0759 |
| Indice de herejia | ABSOLUTE |

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 64-80 GB.
- En cuantización de 8 bits: alrededor de 28 GB de VRAM, viable en una RTX 4090 (24 GB) solo con cuantizaciones más agresivas o con offloading parcial.
- En cuantización de 4 bits: aproximadamente 14-16 GB, cabe en GPUs consumer como RTX 4090, RTX 4080 o RTX 3090, aunque la calidad puede degradarse.
- GPUs recomendadas: A100 80 GB, H100 80 GB para fp16 sin compromisos; RTX 4090/3090 para cuantizaciones de 4-8 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving de alto rendimiento; llama.cpp/Ollama si se dispone de una conversión GGUF de los pesos completos (solo se anuncia GGUF del LoRA, no del modelo completo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada, salvo la comparación PIQA con el modelo original. Se ofrece una comparación estructural básica.

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-absolute-heresy.rc1 | 27,8 B | no disponible | Apache 2.0 | Si (image-text-to-text) | Fine-tune abliterated con Heretic |
| Qwen/Qwen3.8-27B (original) | 27,8 B | no disponible | Apache 2.0 (presumiblemente) | Si | Modelo base, rechazos 101/101 |
| Otros fine-tunes abliterated de la familia Qwen | no disponible | no disponible | variable | variable | No se aportan datos concretos |

## Limitaciones y advertencias

- La abliteración reduce los rechazos, pero no elimina necesariamente todos los comportamientos problemáticos; el autor reporta 2/101 rechazos residuales.
- Riesgo elevado de generar contenido dañino, sesgado o inapropiado; no debe desplegarse en aplicaciones de cara al público sin capas de moderación externas.
- La divergencia KL de 0,0759 indica un cambio medible en la distribución de salidas respecto al modelo original; puede haber degradación sutil en tareas que no se han evaluado.
- Solo se publican resultados de PIQA; no hay evidencia de rendimiento en razonamiento, código, matemáticas o multilingüismo.
- No se declaran idiomas soportados ni longitud de contexto, lo que dificulta planificar su uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo decensored puede incumplir políticas de plataformas, términos de servicio de proveedores cloud o normativas locales sobre contenido.
- Es una release candidate (rc1); el autor indica que deliberará sobre la elección final, por lo que puede haber cambios.
- El modelo base Qwen3.8-27B no está verificado en la información disponible; la fecha de creación (2026-08-15) y actualización (2026-11-13) son futuras respecto a la fecha habitual de referencia, lo que conviene contrastar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy.rc1
- Adaptador LoRA: https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy-LoRA
- GGUF del LoRA: https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy-LoRA-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (motor de abliteración): https://github.com/p-e-w/heretic
- Pull request de SOM y Magnitude-Preserving Orthogonal Ablation: https://github.com/p-e-w/heretic/pull/196
