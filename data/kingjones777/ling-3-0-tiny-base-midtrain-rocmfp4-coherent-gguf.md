# kingjones777/Ling-3.0-tiny-base-midtrain-ROCmFP4-COHERENT-GGUF

## Resumen

Ling-3.0-tiny-base-midtrain es un checkpoint de preentrenamiento intermedio de la familia Ling-3.0-tiny, desarrollado por InclusionAI y publicado el 20 de agosto de 2026. Esta ficha describe la cuantización ROCmFP4 de 4 bits realizada por el usuario kingjones777, que conserva la cabeza de predicción multi-token (MTP) del modelo original. El modelo base es un MoE híbrido de 8,2 mil millones de parámetros totales y aproximadamente 1,3 mil millones de parámetros activos por token, diseñado para despliegue en dispositivos con recursos limitados y para continuar preentrenamiento o adaptación de dominio.

La cuantización está optimizada específicamente para hardware AMD con soporte ROCmFP4, concretamente la arquitectura gfx1151 (Strix Halo, Ryzen AI Max+ 395). El archivo GGUF resultante ocupa 4,8 GB y conserva la arquitectura bailing-hybrid, que combina atención lineal KDA con atención multi-cabeza de baja clasificación (MLA). Su principal interés radica en que permite ejecutar el modelo en hardware AMD de gama alta con una velocidad de generación superior a 100 tokens por segundo, gracias a la decodificación especulativa MTP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailing-hybrid (KDA linear attention + MLA) |
| Parametros totales | 8.209.997.600 (8,2 B) |
| Parametros activos | 1,3 B (según documentación del modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (ftype 102) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Ling-3.0-tiny-base-midtrain es un checkpoint intermedio del preentrenamiento de Ling-3.0-tiny, una arquitectura híbrida que combina atención lineal KDA (Key-Value Decomposed Attention) con atención de baja clasificación (MLA). El parámetro `q_lora_rank` es 256, lo que implica una compresión de consultas en dos etapas (`q_a_proj` → RMS norm → `q_b_proj`), similar a DeepSeek-V2. La cabeza de predicción multi-token (MTP) está entrenada junto al modelo y se conserva en esta cuantización.

El checkpoint `midtrain` corresponde a un punto intermedio del entrenamiento (no el final), y se distribuye para continuar pre-entrenamiento o adaptación de dominio. No ha sido sometido a fine-tuning instructivo ni a RLHF. La cuantización fue realizada por kingjones777 a partir del archivo BF16 GGUF, preservando las cabezas de entrada y salida en Q6_K para mantener la calidad en los extremos.

## Capacidades

- Generación de texto como modelo de continuación: acepta un prompt y produce texto coherente como extensión natural.
- Predicción multi-token (MTP) para decodificación especulativa, acelerando la generación en hardware compatible.
- Soporte de contexto largo de 262.144 tokens, útil para procesar documentos extensos o historias largas.
- No incluye soporte de tool calling, agentes, razonamiento multi-step ni capacidades multimodales por ser un checkpoint base.
- Multilingüismo no especificado en la documentación; se desconoce si el modelo base cubre múltiples idiomas.

## Casos de uso

- Continuación de preentrenamiento: el checkpoint está diseñado para reanudar el entrenamiento con datos propios de dominio específico (legal, médico, técnico) manteniendo la arquitectura híbrida.
- Adaptación de dominio: se puede fine-tuning con datasets especializados para obtener un modelo de lenguaje vertical, aprovechando su contexto de 262K tokens para documentos extensos.
- Evaluación de eficiencia de decodificación especulativa: investigadores pueden medir el impacto de la cabeza MTP en la velocidad de generación en hardware AMD, como hace el autor en su medición.
- Desarrollo de modelos instructivos: a partir de este checkpoint base se puede aplicar RLHF o DPO para crear un modelo conversacional, aunque no viene con las capacidades de instrucción.
- Despliegue en dispositivos edge con GPU AMD: su cuantización de 4 bits y el soporte gfx1151 permiten ejecutar el modelo en APUs como Ryzen AI Max+ 395 con memoria unificada de 128 GB.
- Investigación sobre arquitecturas híbridas: su diseño KDA+MLA ofrece un caso de estudio para comparar con otros modelos MoE y de atención lineal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o GSM8K) en la información disponible. La model card solo incluye mediciones de velocidad de generación en hardware específico:

| Configuración | Velocidad de generación (mediana) |
|---|---|
| Sin drafter (spec-type none) | 107,8 t/s |
| MTP n-max 3 (spec-type draft-mtp) | 113,3 t/s |

La mejora por MTP es del +5,1% en este checkpoint. No se ha publicado perplexity.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 4,8 GB, por lo que puede caber en GPUs con al menos 6 GB de VRAM, aunque la cuantización ROCmFP4 está diseñada específicamente para hardware AMD gfx1151 (Strix Halo).
- GPU recomendada: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151) y 128 GB de memoria unificada, según las mediciones del autor.
- Compatibilidad con GPUs de consumo: solo funciona con hardware AMD que soporte ROCmFP4; no es compatible con NVIDIA ni Intel sin parches adicionales.
- Opciones de despliegue: llama.cpp con el parche específico de ROCmFPX (ver sección de enlaces). No se menciona compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: en el hardware indicado se alcanzan ~113 t/s con MTP habilitado, con una ventana de contexto de 2048 tokens en la medición.

## Comparativa con modelos similares

No disponible. No se proporcionan datos comparativos con otros modelos de la misma categoría (tamaño o arquitectura). Se puede mencionar que el modelo base Ling-3.0-tiny tiene otras variantes (final, 30T) con diferentes rendimientos de MTP, pero no hay benchmarks comparativos.

## Limitaciones y advertencias

- Es un checkpoint base, no un modelo instructivo: no debe usarse directamente para chat o tareas de instrucción; requiere fine-tuning.
- La cuantización ROCmFP4 es específica para hardware AMD gfx1151; no es portable a otras arquitecturas sin re-cuantización.
- El parche de llama.cpp necesario es experimental y no está integrado en el código oficial; requiere compilación manual.
- No se ha publicado medición de perplexity ni evaluación de calidad de la cuantización, por lo que el impacto en la generación es desconocido.
- Riesgo de alucinaciones y sesgos típicos de un modelo base sin alineamiento; no se han documentado sesgos específicos.
- Licencia MIT permite uso comercial, pero el modelo base tiene su propia licencia; se hereda MIT según la model card.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/kingjones777/Ling-3.0-tiny-base-midtrain-ROCmFP4-COHERENT-GGUF)
- [Modelo base en HuggingFace](https://huggingface.co/inclusionAI/Ling-3.0-tiny-base-midtrain)
- [Documentación de Ling-3.0-tiny](https://developer.ant-ling.com/en/docs/models/ling/)
- [Repositorio GitHub de Ling](https://github.com/inclusionAI/Ling)
- [Modelo en ModelScope](https://www.modelscope.cn/models/inclusionAI/Ling-3.0-tiny)
- [Proyecto ROCmFPX (parche)](https://github.com/charlie12345/ROCmFPX)
