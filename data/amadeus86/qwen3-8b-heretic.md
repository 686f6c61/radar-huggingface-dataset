# amadeus86/Qwen3-8B-heretic

## Resumen

Qwen3-8B-heretic es una variante sin censura del modelo Qwen3-8B de Qwen, creada por el usuario amadeus86 mediante la técnica de abliteration con la herramienta Heretic v2.0.0.dev0. El objetivo es eliminar los mecanismos de rechazo o evasión del modelo base, permitiendo generar respuestas en dominios donde el modelo original se negaría a responder. Arquitectónicamente, hereda el transformer causal denso de Qwen3-8B, con 8.200 millones de parámetros y una ventana de contexto nativa de 32.768 tokens, ampliable a 131.072 mediante YaRN. El repositorio en Hugging Face indica un tamaño de 0.0 GB y cero descargas, lo que sugiere que los pesos no están publicados y deben reconstruirse mediante el proceso reproducible de Heretic.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3) |
| Parametros totales | 8.2B (8.200 millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativa; 131.072 con YaRN |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 100 idiomas y dialectos (según documentación de Qwen3) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (según metadatos); el tamaño del repositorio de 0.0 GB sugiere que no hay pesos publicados |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B-Base y aplica una modificación de pesos post-entrenamiento denominada abliteration. Heretic identifica direcciones en el espacio de activaciones asociadas con comportamientos de rechazo y las atenúa modificando las matrices de proyección de atención (o_proj) y de la MLP (down_proj). Los parámetros de ajuste aparecen en la model card: direction_index 17.12, attn.o_proj.max_weight 0.81, mlp.down_proj.min_weight 0.09, entre otros. No se trata de un fine-tuning con datos, por lo que no se dispone de información sobre la composición del dataset. La técnica es reproducible; el repositorio incluye un directorio reproduce con instrucciones.

## Capacidades

- Herencia de Qwen3: soporte de modo de pensamiento (thinking) y modo no pensante (non-thinking) conmutable dentro del mismo modelo.
- Razona miento lógico, matemáticas y generación de código, con mejoras sobre Qwen2.5 instruct en el modo no pensante.
- Capacidades multilingües: más de 100 idiomas y dialectos, incluyendo instrucciones multilingües y traducción.
- Capacidad de agente y tool calling, tanto en modo de pensamiento como no pensante, según la documentación de Qwen3.
- Al ser una variante abliterated, no muestra rechazos de contenido explícitos, por lo que puede generar respuestas en dominios que el modelo base evade.
- La divergencia KL respecto al modelo original es de 0.0009, lo que indica que la distribución de salida es muy similar excepto en los casos de rechazo.

## Casos de uso

- Investigación en alineación y seguridad de IA: sirve para estudiar cómo se comporta el modelo ante prompt que el modelo base rechaza, y para medir la efectividad de técnicas de abliteration.
- Roleplay y ficción creativa sin restricciones: permite construir personajes o tramas con temas controvertidos donde el modelo base respondería con rechazo.
- Análisis de contenido en entornos controlados: útil en tareas de NLP que requieren procesar textos con vocabulario o temas delicados, evitando respuestas defensivas del modelo.
- Base para fine-tuning: al eliminar los rechazos del modelo base, puede servir como punto de partida para entrenar tareas específicas sin la interferencia de comportamientos de seguridad incrustados.
- Educación en seguridad informática: para generar ejemplos de prompts maliciosos dentro de sandboxes o como material didáctico sobre alineación.
- Evaluación de robustez de sistemas de moderación: permite probar si un sistema de filtrado posterior captura correctamente contenido generado por un modelo sin censura.

## Benchmarks y rendimiento

La model card solo proporciona dos métricas comparando este modelo con el original. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Metrica | Este modelo | Qwen3-8B original |
|---|---|---|
| Keywords | 99/100 | 99/100 |
| KL divergence | 0.0009 | 0 (por definición) |

## Requisitos de hardware

- VRAM estimada: en bfloat16, alrededor de 16 GB; con cuantización de 4 bits, entre 5 y 6 GB.
- GPU recomendadas: RTX 4090 24 GB, A100 40 GB, H100, o tarjetas consumer con al menos 16 GB para precisión completa.
- Es posible desplegarlo en GPU de consumo como RTX 3090 o RTX 4090 con cuantización.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama y transformers (requiere la versión 4.51.0 o superior).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| amadeus86/Qwen3-8B-heretic | 8.2B | 32.768 / 131.072 | Apache 2.0 | Repositorio de 0.0 GB, no usable directamente sin reproducir |
| Qwen/Qwen3-8B-Base | 8.2B | 32.768 / 131.072 | Apache 2.0 | Disponible en Hugging Face |
| Qwen/Qwen3-8B (instruct) | 8.2B | 32.768 / 131.072 | Apache 2.0 | Disponible en Hugging Face |

La variante heretic se diferencia del modelo original únicamente en la modificación de pesos aplicada para eliminar rechazos. El resto de características técnicas son idénticas.

## Limitaciones y advertencias

- El repositorio muestra un tamaño de 0.0 GB y cero descargas, lo que indica que los pesos no están publicados. Para usar el modelo hay que reproducirlo mediante Heretic siguiendo las instrucciones del directorio reproduce.
- Al ser una variante abliterated, puede generar contenido dañino, ilegal o poco seguro. El usuario es responsable del uso y de las consecuencias derivadas.
- No se han evaluado los riesgos de sesgo ni alucinación más allá de las métricas proporcionadas.
- La KL divergence de 0.0009 sugiere que la mayoría de las respuestas coinciden con el original, pero los cambios introducidos podrían afectar a la coherencia en algunos dominios específicos.
- La licencia Apache 2.0 permite uso comercial, pero no exime de responsabilidad legal por el contenido generado.
- El modelo no está validado en producción; no hay garantías de rendimiento en tareas concretas.

## Enlaces

- Hugging Face: https://huggingface.co/amadeus86/Qwen3-8B-heretic
- Proyecto Heretic: https://heretic-project.org
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Arxiv 2309.00071: https://arxiv.org/abs/2309.00071
- Arxiv 2505.09388: https://arxiv.org/abs/2505.09388
