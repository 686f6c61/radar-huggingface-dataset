# protocolsyncllc/medgap-qwen-3.8-27b

## Resumen

medgap-qwen-3.8-27b es un ajuste fino (fine-tune) publicado por protocolsyncllc sobre el modelo base google/gemma-4-12B-it, especializado en el dominio de cartas de advertencia (warning letters) de la FDA relativas a dispositivos médicos. El modelo se distribuye en formato safetensors y GGUF, con pesos derivados del entrenamiento mediante LoRA con la librería Unsloth. El repositorio ocupa 199,6 GB y acumula 1472 descargas desde su creación el 3 de septiembre de 2026.

El identificador del modelo resulta confuso: el nombre menciona "qwen-3.8-27b" y los parámetros totales registrados en safetensors ascienden a 27.781.427.952 (unos 27,8 mil millones), mientras que la model card y la etiqueta base_model apuntan a google/gemma-4-12B-it. Esta discrepancia entre el nombre comercial, el recuento de parámetros y el modelo base declarado debe tenerse en cuenta antes de cualquier despliegue en producción.

El modelo resuelve un nicho concreto: la generación y el análisis de texto regulatorio relacionado con las cartas de advertencia de la FDA para dispositivos médicos, entrenado sobre el dataset protocolsyncllc/fda-warning-letters. Es relevante para equipos de asuntos regulatorios y calidad que necesiten asistencia en la redacción o interpretación de este tipo de documentación, aunque la información pública disponible sobre su entrenamiento y evaluación es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base declarado: google/gemma-4-12B-it, transformer) |
| Parametros totales | 27.781.427.952 (según safetensors); la model card declara base de 12B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q8 disponible; safetensors en precisión original |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La model card indica que se trata de un fine-tune de google/gemma-4-12B-it mediante LoRA, con la librería Unsloth, durante 3 épocas, con una tasa de aprendizaje de 2e-4 y un dataset identificado como medical-devices.jsonl, derivado de protocolsyncllc/fda-warning-letters. El entrenamiento se realizó sobre 2x RTX 3090 con 48 GB de VRAM. No se especifica la composición exacta del dataset, el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado.

No hay información pública sobre innovaciones técnicas adicionales (atención lineal, decodificación especulativa, modo de razonamiento explícito) ni sobre la arquitectura interna del modelo base más allá de su carácter transformer. La discrepancia entre el nombre del repositorio (que sugiere una familia Qwen de 27B), el recuento de parámetros en safetensors (27,8B) y el base_model declarado (gemma-4-12B-it) no queda aclarada en la documentación disponible.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (text-generation).
- Especialización en dominio regulatorio: cartas de advertencia de la FDA sobre dispositivos médicos.
- Ajuste orientado a instrucciones, heredado del modelo base -it.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Redacción asistida de respuestas a cartas de advertencia de la FDA: el modelo puede generar borradores de contestación formal a partir de la carta recibida, aprovechando su ajuste específico sobre el corpus de warning letters de dispositivos médicos.
- Análisis de cartas históricas: extracción de patrones recurrentes (tipos de no conformidad, referencias a normativa, plazos exigidos) en lotes de cartas de la FDA para alimentar un análisis de riesgos interno.
- Formación de equipos de asuntos regulatorios: generación de casos de estudio y preguntas de evaluación basadas en situaciones reales del dominio.
- Clasificación y triaje documental: uso del modelo para etiquetar correspondencia regulatoria entrante según su gravedad y área temática, integrado en un pipeline de gestión documental.
- Soporte a auditorías internas de calidad: generación de listas de comprobación y resúmenes de hallazgos inspirados en las cartas del dataset de entrenamiento.
- Prototipado de asistentes internos: despliegue del GGUF q8 en infraestructura local para pruebas de concepto de asistentes conversacionales restringidos al dominio regulatorio, sin exponer datos fuera de la organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,8B parámetros en safetensors a 16 bits, se requieren aproximadamente 56 GB de VRAM solo para los pesos; con cuantización q8 en GGUF, en torno a 28-30 GB, más el overhead de contexto.
- GPU recomendadas: A100 80 GB o H100 para los pesos sin cuantizar; para el GGUF q8, una RTX 4090 (24 GB) resulta insuficiente por sí sola y se necesitarían configuraciones multi-GPU o GPUs de 48 GB (A6000, L40S).
- Cabe en GPU de consumo: solo con cuantizaciones más agresivas que q8 (no publicadas en la información disponible) o mediante offloading a CPU/RAM.
- Opciones de despliegue: llama.cpp u Ollama para el GGUF; vLLM o TGI para safetensors si la arquitectura del modelo base es compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| medgap-qwen-3.8-27b | 27,8B (safetensors) | no disponible | gemma | Hugging Face (safetensors + GGUF) |
| google/gemma-4-12B-it (base) | 12B (según model card) | no disponible | gemma | Hugging Face |
| medgap-gemma-4-12b (variante del mismo autor) | 12B (según nombre) | no disponible | gemma | Hugging Face |

No se dispone de datos de rendimiento comparado con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia no resuelta entre el nombre del repositorio (qwen-3.8-27b), el recuento de parámetros en safetensors (27,8B) y el modelo base declarado (gemma-4-12B-it); conviene verificar los pesos antes de usarlos en producción.
- El ajuste se realizó con LoRA sobre un dataset de un único dominio; el riesgo de alucinación fuera de ese dominio es alto y no está cuantificado.
- No se han publicado evaluaciones, benchmarks ni análisis de sesgos.
- Los idiomas soportados no están declarados; no se garantiza un rendimiento adecuado en castellano.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos antes de cualquier despliegue comercial.
- El tamaño del repositorio (199,6 GB) complica su descarga y almacenamiento.
- El modelo no debe utilizarse como sustituto del criterio de un profesional regulatorio: sus salidas no constituyen asesoramiento legal ni regulatorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protocolsyncllc/medgap-qwen-3.8-27b
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset: https://huggingface.co/datasets/protocolsyncllc/fda-warning-letters
- GGUF q8 de la variante gemma-4-12b: https://huggingface.co/protocolsyncllc/medgap-gemma-4-12b/blob/main/medgap-gemma-4-12b_q8.gguf
- Librería Unsloth: https://github.com/unslothai/unsloth
