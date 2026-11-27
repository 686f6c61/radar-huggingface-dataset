# nielsr/cursor-qwen35-4b-think-cfx-a-mixed-open-ended-grpo-pi-160-sft-merged

## Resumen

Este modelo es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario nielsr en Hugging Face. Se trata de la fusión (merge) de un adaptador LoRA denominado cursor-qwen35-4b-think-cfx-a-mixed-hf-hub-qa-v2-glm-53-pi-160-lora sobre el modelo base Qwen3.5-4B. El resultado es un modelo de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) orientado a generación de texto y a tareas de tipo image-text-to-text, según las etiquetas del repositorio.

El modelo se enmarca en un proceso de destilación de agentes (agent-distill) con la tarea hf-hub-qa-open-ended, ejecutado con la herramienta pi en su versión 1.6.0. El nombre del adaptador sugiere un entrenamiento con GRPO (Group Relative Policy Optimization) y una fase de SFT (supervised fine-tuning) sobre datos de preguntas y respuestas abiertas del Hugging Face Hub. No obstante, la model card es extremadamente escueta y no detalla hiperparámetros, composición del dataset ni metodología de entrenamiento.

La relevancia de este modelo es limitada y muy específica: se trata de un artefacto experimental de un investigador individual, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks publicados. Su interés principal radica en ser un ejemplo de pipeline de destilación de agentes sobre un modelo base pequeño (4B) con capacidades multimodales declaradas, más que en su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles no disponibles |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Tipo de ajuste | LoRA fusionado (merged) sobre el modelo base |
| Pipeline declarado | text-generation (con etiqueta image-text-to-text) |
| Tamano del repositorio | 9,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-4B, un transformer de aproximadamente 4,54 mil millones de parámetros. El repositorio no documenta la configuración interna (número de capas, dimensiones ocultas, cabezas de atención, tipo de atención o positional encoding), por lo que estos detalles deben consultarse en la model card del modelo base Qwen/Qwen3.5-4B.

El proceso de entrenamiento consistió en fusionar un adaptador LoRA sobre el modelo base. Según la nomenclatura del adaptador (cursor-qwen35-4b-think-cfx-a-mixed-hf-hub-qa-v2-glm-53-pi-160-lora), el ajuste se realizó sobre una mezcla de datos de preguntas y respuestas abiertas del Hugging Face Hub, con una fase de SFT y una fase de GRPO. El nombre del run (cursor-qwen35-4b-think-cfx-a-mixed-open-ended-grpo-pi-160) indica el uso de la herramienta pi 1.6.0 para el pipeline de destilación de agentes. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation) y la etiqueta conversational.
- Capacidades multimodales de entrada image-text-to-text, heredadas de la etiqueta del repositorio; no se detalla el soporte real de visión en la model card.
- Razonamiento de tipo "think" (modo de pensamiento), sugerido por el sufijo "think" en el nombre del adaptador.
- Posible soporte de tool calling y flujos de agente, dado el contexto de agent-distill y la tarea hf-hub-qa-open-ended; no confirmado explícitamente.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No se documentan capacidades de audio, visión avanzada ni otras modalidades más allá de la etiqueta image-text-to-text.

## Casos de uso

- Experimentación en investigación sobre destilación de agentes: el modelo sirve como artefacto de referencia para reproducir pipelines de GRPO + SFT sobre modelos base pequeños, comparando el efecto del merge de LoRA frente al adaptador original.
- Evaluación de ajustes finos sobre Qwen3.5-4B: útil para medir cómo un adaptador entrenado con datos del Hugging Face Hub afecta al comportamiento del modelo base en tareas de QA abiertas.
- Prototipado de asistentes de documentación técnica: al estar entrenado sobre QA del Hub, puede emplearse en entornos controlados para responder preguntas sobre repositorios y modelos, siempre con verificación humana.
- Pruebas de pipelines de inferencia con transformers: al publicarse en safetensors y con la librería transformers, es adecuado para validar integraciones de despliegue (vLLM, TGI) con modelos de ~4,5 B de parámetros.
- Benchmarking interno de modelos pequeños: sirve como baseline adicional en comparativas de modelos de 4B para tareas de generación de texto y razonamiento.
- Educación y demostraciones: por su tamaño moderado, puede ejecutarse en hardware de gama alta de consumo para talleres sobre fine-tuning y fusión de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~4,5-5 GB para pesos; en 4 bits: ~2,5-3 GB para pesos (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas para FP16: NVIDIA A100, H100, L40S o RTX 4090 (24 GB); para cuantización 4/8 bits, RTX 3090, RTX 4080 o RTX 4060 Ti de 16 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 y en GPUs de 8-16 GB con cuantización, siempre que se genere o consiga una versión cuantizada (no publicada en el repositorio).
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI (compatibles con safetensors y arquitectura Qwen), llama.cpp/Ollama solo si se convierte a GGUF (no disponible en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nielsr/cursor-qwen35-4b-think-cfx-a-mixed-open-ended-grpo-pi-160-sft-merged | ~4,54 B | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste experimental con LoRA fusionado |
| Qwen/Qwen3.5-4B (modelo base) | ~4 B (clase) | no disponible en esta ficha | la del modelo base (consultar) | Hugging Face | Base sin ajuste; referencia directa |
| Modelos de ~4B de la familia Qwen (versiones previas) | ~4 B | variable según versión | variable según versión | Hugging Face | Alternativa consolidada con benchmarks públicos |

No se dispone de datos de rendimiento comparativo para este modelo, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre datos del Hugging Face Hub, puede heredar sesgos de ese corpus.
- Riesgo de alucinación: alto en tareas de QA abiertas sin verificación, especialmente por la falta de benchmarks y de documentación sobre el dataset de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están declarados; no debe asumirse soporte multilingüe.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si el uso comercial está permitido; se recomienda contactar con el autor o consultar la licencia del modelo base Qwen3.5-4B antes de cualquier uso en producción.
- Caveat de producción: modelo con 0 descargas, sin benchmarks, sin model card detallada y publicado por un autor individual; no es adecuado como dependencia crítica sin una evaluación exhaustiva propia.
- El repositorio mezcla etiquetas de text-generation e image-text-to-text; la capacidad multimodal real no está confirmada y debe validarse empíricamente.
- El tamaño del repositorio (9,1 GB) es superior al esperado para pesos en BF16 (~9 GB), lo que sugiere posibles archivos adicionales; conviene revisar la lista de ficheros antes de la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nielsr/cursor-qwen35-4b-think-cfx-a-mixed-open-ended-grpo-pi-160-sft-merged
- Adaptador LoRA de origen: https://huggingface.co/nielsr/cursor-qwen35-4b-think-cfx-a-mixed-hf-hub-qa-v2-glm-53-pi-160-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados disponibles tratan sobre plugins y búsqueda web de ChatGPT y no guardan relación con este modelo.
