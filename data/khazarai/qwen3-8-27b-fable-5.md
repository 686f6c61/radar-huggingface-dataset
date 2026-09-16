# khazarai/Qwen3.8-27B-Fable-5

## Resumen

khazarai/Qwen3.8-27B-Fable-5 es un ajuste fino (fine-tune) publicado por el usuario khazarai sobre el modelo base unsloth/Qwen3.8-27B, de la familia Qwen3. Se trata de un modelo de 27.781.427.952 parámetros (unos 27,8 mil millones) distribuido en formato safetensors, con licencia Apache-2.0 y pipeline declarado como image-text-to-text. El repositorio ocupa 55,6 GB, un tamaño coherente con pesos almacenados en precisión de 16 bits (aproximadamente 2 bytes por parámetro), y las etiquetas indican compatibilidad con Transformers, text-generation-inference y la librería qwen3_5.

El modelo se ha entrenado, segun la propia model card, con Unsloth y la librería TRL de Hugging Face, con una mejora declarada de velocidad de entrenamiento de 2x. No se documenta el conjunto de datos, el número de tokens, la composición del corpus ni si hubo fases de RLHF o DPO. La model card es la plantilla automática de Unsloth y no aporta información técnica adicional sobre el proceso de ajuste, la longitud de contexto o las capacidades reales del modelo resultante.

Su relevancia actual es limitada pero concreta: sirve como ejemplo reproducible de fine-tuning eficiente de un modelo de ~27B en una sola fase con Unsloth, y como punto de partida para desarrolladores que quieran adaptar la familia Qwen3 a dominios propios en inglés. El repositorio no tiene descargas ni valoraciones en el momento de la consulta, por lo que no existe validación independiente de su calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3 (etiqueta "qwen3_5"); no se especifica si es densa o MoE |
| Parametros totales | 27.781.427.952 (≈27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene safetensors (16 bits). No se publican GGUF, GPTQ, AWQ ni FP8 |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | unsloth/Qwen3.8-27B |
| Tamaño del repositorio | 55,6 GB |
| Pipeline declarado | image-text-to-text |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-15 |

## Arquitectura y entrenamiento

La única información arquitectónica disponible procede de las etiquetas del repositorio: "qwen3_5" y "transformers", lo que sitúa al modelo en la familia Qwen3 del modelo base unsloth/Qwen3.8-27B. No se detalla el número de capas, la dimensión oculta, el tipo de atención, el vocabulario ni si emplea mezcla de expertos. Tampoco se especifica la longitud de contexto soportada. El recuento real de parámetros (27.781.427.952) y el tamaño del repositorio (55,6 GB) permiten estimar que los pesos están almacenados en bf16/fp16, sin cuantización.

En cuanto al entrenamiento, la model card indica únicamente que el modelo se ajustó con Unsloth y TRL, con una aceleración declarada de 2x respecto a un entrenamiento convencional. No hay datos sobre el dataset, el número de tokens de entrenamiento, la composición del corpus, la duración del ajuste, los hiperparámetros, ni sobre fases de alineación como RLHF, DPO o RLVR. Tampoco se documentan innovaciones técnicas específicas de este fine-tune más allá del uso del stack de Unsloth. El nombre "Fable-5" sugiere una serie de ajustes del mismo autor, pero no hay información publicada al respecto.

## Capacidades

- Generación de texto conversacional en inglés, tal como declaran las etiquetas "conversational" y "text-generation-inference".
- Pipeline declarado image-text-to-text, lo que sugiere entrada de imágenes, aunque la model card no menciona ninguna capacidad de visión ni documenta un codificador visual. Esta discrepancia debe verificarse antes de usar el modelo en tareas multimodales.
- Capacidad de ajuste adicional: al ser un fine-tune sobre safetensors estándar, puede seguir entrenándose o adaptarse con LoRA/QLoRA.
- Razonamiento, matemáticas, generación de código, tool calling y comportamiento de agente: no disponible (no documentado; dependería de lo heredado del modelo base, sin verificación independiente).
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de audio o vídeo: no disponible.
- Multilingüismo: limitado al inglés según el campo de idiomas del repositorio.

## Casos de uso

- Asistente conversacional en inglés desplegado on-premise: el modelo puede servirse con Transformers o TGI sobre una GPU de 80 GB en bf16, manteniendo los datos dentro de la infraestructura propia, algo relevante en sectores regulados.
- Punto de partida para fine-tuning vertical: al estar publicado con licencia Apache-2.0 y en safetensors, se puede continuar el ajuste con LoRA sobre un corpus propietario (por ejemplo, documentación interna en inglés) sin partir del modelo base original.
- Referencia metodológica para pipelines de ajuste eficiente: el repositorio documenta el uso de Unsloth y TRL con aceleración declarada de 2x, por lo que sirve como caso práctico para equipos que quieran replicar el flujo con modelos de ~27B.
- Generación aumentada por recuperación (RAG) en inglés: el modelo puede integrarse como generador final de respuestas sobre un índice documental; la longitud de contexto no está documentada, así que el tamaño del bloque recuperado debe validarse empíricamente antes de producción.
- Clasificación y etiquetado de texto a escala: tareas de extracción de entidades, resumen o categorización por lotes en inglés, con despliegue en vLLM o TGI para maximizar el throughput por GPU.
- Experimentación académica sobre ajuste de modelos de ~27B: útil para estudiar olvido catastrófico, degradación de capacidades base y estabilidad del ajuste en modelos de este tamaño.
- Evaluación de pipelines multimodales: si se confirma la capacidad image-text-to-text implícita en el pipeline declarado, podría emplearse en descripción de imágenes o VQA en inglés, pero requiere verificación previa con pruebas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto de evaluación, y la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo (los resultados obtenidos trataban sobre servicios de intercambio de criptomonedas y no guardan relación con esta ficha). Tampoco existe información sobre latencia, throughput o consumo de memoria medidos.

## Requisitos de hardware

- VRAM estimada en bf16/fp16 (pesos completos): aproximadamente 55,6 GB solo para pesos, más entre un 10 % y un 20 % adicional para caché KV y activaciones, lo que sitúa el total en el rango de 62 a 70 GB.
- VRAM estimada en INT8/FP8: en torno a 28 GB de pesos, con un total aproximado de 32 a 36 GB.
- VRAM estimada en INT4 (NF4, GPTQ o AWQ): aproximadamente 15 a 17 GB de pesos, con un total de 18 a 22 GB.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU como 2x A100 40 GB o 2x L40S 48 GB con tensor parallelism.
- GPU recomendadas para INT8: L40S 48 GB, RTX 6000 Ada 48 GB, A100 40 GB (ajustado) o 2x RTX 4090 con paralelismo.
- GPU de consumo: no cabe en una RTX 4090 ni en una RTX 3090 (24 GB) en bf16; en INT4 sí cabría en 24 GB (RTX 4090, RTX 3090, L4). No cabría en tarjetas de 16 GB en ninguna precisión razonable sin offload a CPU.
- La caché KV depende de la longitud de contexto, que no está documentada, por lo que las estimaciones de memoria para contextos largos no pueden calcularse.
- Opciones de despliegue: Transformers (librería declarada), text-generation-inference (etiqueta presente en el repositorio) y, previsiblemente, vLLM al tratarse de safetensors estándar, aunque no hay confirmación oficial. Ollama y llama.cpp requerirían una conversión a GGUF que no está publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad | Notas |
|---|---|---|---|---|---|
| khazarai/Qwen3.8-27B-Fable-5 | 27,78 mil millones | no disponible | apache-2.0 | safetensors, 0 descargas | Fine-tune con Unsloth/TRL; solo inglés |
| unsloth/Qwen3.8-27B (base) | no disponible (el nombre sugiere ~27B) | no disponible | no disponible | no disponible | Modelo de partida del ajuste |
| Alternativas de ~27-32B (Qwen2.5-32B, Gemma 3 27B, Mistral Small 3.1 24B) | no disponible | no disponible | no disponible | no disponible | Sin datos comparativos en la información proporcionada |

No es posible establecer una comparación cuantitativa fiable: no hay benchmarks publicados para este modelo ni datos de rendimiento del modelo base en la información disponible. Cualquier comparación debería hacerse midiendo directamente sobre los conjuntos de evaluación relevantes para el caso de uso.

## Limitaciones y advertencias

- La model card es la plantilla automática de Unsloth: no documenta dataset, hiperparámetros, número de épocas, ni resultados de evaluación.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad ni informes de terceros sobre su comportamiento.
- Idiomas declarados: únicamente inglés. El uso en castellano u otros idiomas no está soportado ni evaluado.
- Discrepancia entre el pipeline declarado (image-text-to-text) y la ausencia total de documentación sobre visión; no debe asumirse capacidad multimodal sin verificarla.
- Longitud de contexto desconocida: no puede garantizarse el rendimiento en ventanas largas ni estimarse la memoria de la caché KV.
- Riesgo de alucinación: no cuantificado para este ajuste concreto; al ser un fine-tune sin evaluación publicada, la degradación respecto al modelo base es posible (olvido catastrófico).
- Licencia Apache-2.0, que permite uso comercial y modificación, pero conviene revisar también los términos del modelo base (unsloth/Qwen3.8-27B) y de la familia Qwen3 original antes de un despliegue en producción.
- No hay cuantizaciones publicadas ni pesos GGUF: usar el modelo en equipos de consumo exige generar las cuantizaciones por cuenta propia y validar la pérdida de calidad.
- El autor no ofrece garantías, soporte ni mantenimiento del repositorio; la fecha de creación y actualización son muy próximas entre sí (mismo día), lo que sugiere una publicación sin iteración posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khazarai/Qwen3.8-27B-Fable-5
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
- Unsloth (repositorio citado en la model card): https://github.com/unslothai/unsloth
- TRL de Hugging Face (librería de entrenamiento citada): https://github.com/huggingface/trl
- Paper, blog o demo específicos de este modelo: no disponible
- Resultados de la búsqueda web: no se encontró ningún enlace relevante sobre el modelo; los resultados obtenidos correspondían a páginas sobre servicios de intercambio de criptomonedas y no se incluyen por no ser pertinentes.
