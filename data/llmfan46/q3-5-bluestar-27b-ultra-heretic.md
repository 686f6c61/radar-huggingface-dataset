# llmfan46/Q3.5-BlueStar-27B-ultra-heretic

## Resumen

Q3.5-BlueStar-27B-ultra-heretic es una variante "abliterated" (descensurada) del modelo zerofata/Q3.5-BlueStar-27B, publicada por el usuario independiente llmfan46. El modelo parte de un transformer de 27.356 millones de parámetros (27,36 B) y se ha modificado mediante la herramienta Heretic v1.2.0 aplicando Magnitude-Preserving Orthogonal Ablation (MPOA) y Self-Organizing Map Abliteration (SOMA), técnicas que eliminan selectivamente la dirección de rechazo en los pesos sin reentrenar el modelo completo.

El objetivo declarado es reducir la tasa de rechazos (refusals) manteniendo la coherencia del modelo original: según la model card, los rechazos bajan de 98/100 en el modelo base a 4/100 en esta variante, con una divergencia KL de 0,0288 respecto al original. Está afinado sobre un conjunto de datasets orientados a anime, roleplay de personajes y datos sintéticos generados con Gemini 3.1 Pro (SmallWiki, GLM5-Characters), lo que orienta el modelo hacia narrativa, personajes y conversación creativa.

Es relevante para quienes necesitan un modelo de ~27 B sin restricciones de contenido para investigación sobre alineación, generación creativa sin filtros o experimentación con roleplay, con licencia MIT que permite uso comercial. No obstante, su especialización temática y su naturaleza descensurada implican caveats importantes para producción, detallados más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5; detalles de capas no disponibles) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF/AWQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27,36 B parámetros derivado de zerofata/Q3.5-BlueStar-27B, que a su vez pertenece a la familia de arquitectura etiquetada como qwen3_5 en Hugging Face. No se dispone de información sobre número de capas, dimensión oculta, mecanismo de atención (estándar, GQA, atención lineal) ni longitud de contexto nativa. El repositorio ocupa 54,7 GB en safetensors, coherente con pesos en precisión de 16 bits para ~27 B parámetros.

El proceso de modificación no es un fine-tuning clásico sino una ablación de direcciones: Heretic v1.2.0 identifica, capa por capa, las direcciones de activación asociadas al comportamiento de rechazo y las proyecta ortogonalmente fuera de los pesos de las proyecciones de salida de atención (attn.out_proj, attn.o_proj) y de la capa down del MLP (mlp.down_proj), preservando la magnitud de los pesos (MPOA) y organizando las direcciones mediante mapas autoorganizados (SOMA). La model card detalla los pesos y posiciones por capa aplicados en cada proyección. El afinamiento previo del modelo base se realizó sobre datasets de anime, wiki sintética, personajes y roleplay (zerofata/Instruct-Anime, Gemini-3.1-Pro-SmallWiki, Gemini-3.1-Pro-GLM5-Characters, Roleplay-Anime-Characters); no se especifican volúmenes de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno, con orientación fuerte a narrativa, roleplay y personajes de anime.
- Generación creativa sin filtros de contenido (modelo descensurado/abliterated), incluyendo temáticas que el modelo base rechazaría.
- Coherencia preservada respecto al original según la métrica de divergencia KL (0,0288), lo que sugiere que las capacidades generales del modelo base se mantienen en gran medida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está afinado sobre datasets de personajes de anime y roleplay, por lo que es adecuado para construir chatbots de personajes con personalidad consistente en sesiones largas de conversación.
- Generación creativa sin restricciones: útil para escritura de ficción, guiones o contenido maduro donde los filtros de rechazo de modelos alineados interrumpirían la generación; la tasa de rechazo de 4/100 lo hace práctico para este fin.
- Investigación sobre alineación y abliteration: sirve como caso de estudio reproducible para comparar el comportamiento del modelo base frente a la variante ablacionada, con métricas publicadas de KL y refusals.
- Prototipado de asistentes conversacionales especializados en ocio y entretenimiento: con licencia MIT puede integrarse en productos comerciales de nicho (apps de rol, videojuegos narrativos) sin coste de licencia.
- Evaluación de técnicas MPOA/SOMA: permite a investigadores medir el impacto de la ablación por capa en tareas de razonamiento y seguridad, usando los parámetros documentados en la model card.
- Fine-tuning posterior sin restricciones de licencia: al ser MIT y safetensors, puede servir como base para ajustes específicos de dominio en entornos donde la licencia del modelo original sería limitante.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas comparativas del proceso de abliteration, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (Q3.5-BlueStar-27B) |
|---|---|---|
| Divergencia KL | 0,0288 | 0 (por definición) |
| Rechazos (refusals) | 4/100 | 98/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 55 GB solo para pesos, más overhead de KV cache; requiere GPUs de 80 GB (A100 80GB, H100 80GB) o multi-GPU.
- Cuantización a 8 bits: ~28-30 GB de VRAM, viable en una RTX 4090 (24 GB) solo con cuantización a 4 bits o con offloading parcial.
- Cuantización a 4 bits: ~15-17 GB de VRAM, cabe en RTX 4090, RTX 3090 y GPUs consumer de 16-24 GB.
- No se han publicado variantes GGUF, AWQ ni GPTQ en el repositorio; sería necesario generarlas a partir de los safetensors.
- Opciones de despliegue: vLLM o TGI para servicio en FP16 en GPUs de datacenter; llama.cpp u Ollama tras convertir a GGUF para entornos consumer.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Q3.5-BlueStar-27B-ultra-heretic | 27,36 B | no disponible | Abliterated, orientado a roleplay/anime | MIT | Hugging Face (21 descargas) |
| zerofata/Q3.5-BlueStar-27B (base) | 27,36 B | no disponible | Alineado, orientado a roleplay/anime | no disponible en esta ficha | Hugging Face |
| Alternativas de ~27-32 B alineadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría; la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Modelo descensurado: la ablación elimina las direcciones de rechazo, por lo que puede generar contenido sensible, ofensivo o inapropiado sin filtros; no es apto para aplicaciones dirigidas al público general sin moderación externa.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; la especialización en anime y roleplay sugiere un rendimiento limitado en tareas de conocimiento general o razonamiento técnico.
- Idiomas y contexto no declarados: se desconoce el soporte multilingüe real y la ventana de contexto máxima, lo que complica el dimensionamiento en producción.
- La divergencia KL de 0,0288 indica cambios en la distribución de salida respecto al original; aunque baja, puede degradar sutilmente tareas sensibles a la precisión.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; la responsabilidad legal del contenido generado recae en el desplegador.
- Madurez y soporte: 21 descargas y 11 likes; el autor declara haber alcanzado el límite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad de futuras actualizaciones.
- No hay variantes cuantizadas oficiales publicadas, lo que añade trabajo de conversión para despliegues en hardware consumer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/Q3.5-BlueStar-27B-ultra-heretic
- Modelo base: https://huggingface.co/zerofata/Q3.5-BlueStar-27B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Datasets referenciados: zerofata/Instruct-Anime, zerofata/Gemini-3.1-Pro-SmallWiki, zerofata/Gemini-3.1-Pro-GLM5-Characters, zerofata/Roleplay-Anime-Characters (en Hugging Face)
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
