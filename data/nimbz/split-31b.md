# Nimbz/Split-31B

## Resumen

Split-31B es un modelo de lenguaje de 31.273.088.876 parámetros (aproximadamente 31B) creado por el usuario Nimbz mediante técnicas de fusión de modelos (model merging) con la herramienta mergekit. No se trata de un entrenamiento desde cero, sino de la combinación de siete modelos derivados de la familia Gemma 4, incluyendo el modelo base oficial google/gemma-4-31B-it y varias variantes comunitarias orientadas a rol, escritura creativa y bajo rechazo (low-refusal).

El modelo está claramente orientado a roleplay, interpretación de personajes, escritura creativa y narración, con etiquetas que indican explícitamente contenido NSFW y baja tasa de rechazo. Su relevancia radica en ofrecer una alternativa fusionada que aglutina los rasgos de varios modelos especializados de la comunidad Gemma 4 en un único checkpoint de 31B, con licencia Apache 2.0 y pesos disponibles en safetensors y GGUF.

La información pública disponible es limitada: no se detallan los parámetros de la fusión, la composición exacta del dataset ni los idiomas soportados. El repositorio ocupa 349,8 GB, lo que refleja la presencia de múltiples formatos y cuantizaciones además de los pesos principales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4; detalles de la fusión no disponibles) |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF incluido en el repositorio; niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión (merge) realizada con mergekit sobre siete modelos base: google/gemma-4-31B-it, ReadyArt/gemma-4-31B-it-scotoma-2, bgg1996/Melinoe-Gemma4-31B-VL-heretic, sophosympatheia/Glistening-Gem-31B-v2.1, sophosympatheia/Glistening-Gem-31B-v2.0, zerofata/G4-MeroMero-v2-31B y Ateron/Gemma-4-Dark-Thoughts-V2-31B. Al tratarse de una fusión, no existe un entrenamiento propio con dataset documentado: las capacidades provienen de los modelos constituyentes y de la receta de mezcla aplicada.

No se han publicado en la información disponible ni el método exacto de fusión (SLERP, TIES, DARE, model stock, etc.), ni los pesos relativos de cada componente, ni detalles sobre fases de RLHF o DPO posteriores. Tampoco se documentan innovaciones técnicas propias más allá de la propia combinación de checkpoints. La designación "VL" en uno de los modelos base sugiere posible herencia de capacidades visión-lenguaje, pero no se confirma en la ficha del modelo fusionado.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a roleplay e interpretación de personajes.
- Escritura creativa y narración (storytelling), con énfasis en prosa extensa y coherencia de personaje.
- Baja tasa de rechazo (low-refusal), lo que permite abordar temáticas que otros modelos alineados declinarían.
- Contenido NSFW y temáticas para adultos, según las etiquetas del autor.
- Posible herencia de capacidades visión-lenguaje por el modelo base Melinoe-Gemma4-31B-VL-heretic (no confirmado en la ficha final).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Roleplay conversacional de larga duración: el modelo está específicamente fusionado para mantener la coherencia de personaje en conversaciones multi-turno, lo que lo hace adecuado para aplicaciones de entretenimiento conversacional y chatbots de personajes.
- Escritura creativa asistida: generación de relatos, diálogos y ficción interactiva donde la baja tasa de rechazo permite explorar tramas adultas o controvertidas sin bloqueos frecuentes.
- Motores de narrativa interactiva: integración en videojuegos de texto o plataformas de ficción interactiva donde se requiere consistencia estilística y capacidad de improvisación narrativa.
- Prototipado de asistentes de escritura para guionistas y novelistas: borradores de escenas, desarrollo de personajes y variantes de diálogo en sesiones iterativas.
- Investigación sobre alineación y rechazo: al ser un modelo low-refusal, sirve como referencia comparativa en estudios sobre tasas de negativa, sesgos y comportamiento en dominios sensibles.
- Despliegue local con cuantización GGUF: gracias a los pesos GGUF incluidos, puede ejecutarse en estaciones de trabajo con GPU de consumo para experimentación privada sin depender de APIs externas.
- Generación de contenido para comunidades de rol: plataformas comunitarias que necesitan un modelo de 31B con licencia permisiva y comportamiento creativo consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62-63 GB solo para pesos, más overhead de contexto y caché KV; requiere múltiples GPU o GPU de 80 GB con cuantización parcial.
- Cuantización GGUF Q8: en torno a 33-35 GB de VRAM, viable en una A100 40GB o H100.
- Cuantización GGUF Q4: en torno a 17-19 GB, viable en una RTX 4090 (24 GB) o RTX 3090.
- GPU recomendadas: H100 80GB o A100 80GB para precisión completa; RTX 4090, RTX 3090 o A6000 para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: sí, con cuantizaciones GGUF de 4 bits en GPUs de 24 GB; en 16 GB puede requerir cuantizaciones más agresivas (Q3/Q4 con offload parcial).
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI para safetensors en FP16/BF16; endpoints compatibles indicados en las etiquetas del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Nimbz/Split-31B | 31,27B | no disponible | Apache 2.0 | Roleplay, creatividad, low-refusal | safetensors, GGUF |
| google/gemma-4-31B-it | ~31B | no disponible | Términos Gemma | Asistente general alineado | safetensors |
| sophosympatheia/Glistening-Gem-31B-v2.1 | ~31B | no disponible | no disponible | Roleplay y escritura creativa | safetensors |
| Ateron/Gemma-4-Dark-Thoughts-V2-31B | ~31B | no disponible | no disponible | Roleplay, low-refusal | safetensors |

Los tres modelos comparables son componentes directos de la fusión, por lo que Split-31B hereda parcialmente sus comportamientos. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Al ser una fusión sin evaluación publicada, no existen garantías de calidad ni de estabilidad frente a los modelos base individuales.
- Riesgo elevado de alucinación y de degradación de coherencia en contextos largos, habitual en fusiones no validadas.
- La baja tasa de rechazo implica mayor probabilidad de generar contenido sensible, ofensivo o inapropiado; requiere filtros y moderación en producción.
- Contenido NSFW y no apto para todas las audiencias, según las etiquetas del autor.
- Idiomas soportados no documentados; el rendimiento fuera del inglés es incierto.
- Longitud de contexto no especificada; no debe asumirse la del Gemma 4 original sin verificación.
- Aunque la licencia declarada es Apache 2.0, los modelos base derivados de Gemma pueden arrastrar términos adicionales de Google; conviene revisar la compatibilidad antes de uso comercial.
- El tamaño del repositorio (349,8 GB) complica la descarga y el almacenamiento; se recomienda seleccionar únicamente el formato y la cuantización necesarios.
- No hay información sobre tool calling ni capacidades de agente, por lo que no es recomendable para pipelines que dependan de ellas sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nimbz/Split-31B
- Modelo base principal: https://huggingface.co/google/gemma-4-31B-it
- Componente de la fusión: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Componente de la fusión: https://huggingface.co/bgg1996/Melinoe-Gemma4-31B-VL-heretic
- Componente de la fusión: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.1
- Componente de la fusión: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.0
- Componente de la fusión: https://huggingface.co/zerofata/G4-MeroMero-v2-31B
- Componente de la fusión: https://huggingface.co/Ateron/Gemma-4-Dark-Thoughts-V2-31B
- Herramienta de fusión: https://github.com/arcee-ai/mergekit
