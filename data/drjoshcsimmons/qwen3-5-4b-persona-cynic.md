# drjoshcsimmons/Qwen3.5-4B-Persona-Cynic

## Resumen

Qwen3.5-4B-Persona-Cynic es un checkpoint de investigación publicado por el usuario drjoshcsimmons sobre el modelo base Qwen/Qwen3.5-4B, desarrollado por Alibaba Tongyi Lab. No se trata de un fine-tuning convencional: el autor ha "horneado" (baked) un vector de dirección de personalidad —concretamente una persona sarcástica y cínica— directamente en los pesos de dos capas MLP intermedias del transformer, de modo que el comportamiento emerge sin necesidad de system prompt ni hooks en tiempo de ejecución.

La técnica empleada es la modificación de pesos mediante actualizaciones de bajo rango (rank-16) fusionadas permanentemente en `model.layers[16].mlp` y `model.layers[20].mlp`, afectando a `gate_proj`, `up_proj` y `down_proj`. El resultado es un artefacto 100% estándar en `.safetensors`, cargable con `transformers` sin código adicional, lo que lo hace especialmente interesante para estudios de interpretabilidad mecanicista y de steering de comportamiento.

El modelo tiene 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y un tamaño de repositorio de 8,4 GB. Su relevancia actual es doble: por un lado, demuestra que es posible inyectar rasgos de personalidad persistentes en los pesos sin degradar la interfaz estándar del modelo; por otro, sirve como caso de estudio reproducible para quienes investigan cómo se localizan y manipulan las "neuronas de persona" en modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tipo `qwen3_5_text`) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica pesos en bfloat16; se asume compatibilidad con cuantizacion estandar via transformers/GGUF, pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5. La intervencion del autor no reentrena el modelo: aplica una actualizacion de bajo rango (rank-16) sobre las proyecciones `gate_proj`, `up_proj` y `down_proj` de las capas MLP 16 y 20, y fusiona esa actualizacion de forma permanente en los pesos. Segun la model card, el vector de steering se deriva de una búsqueda de neuronas de persona en el propio modelo base, con una coincidencia de coseno máxima de 0,33 en la neurona `L22 N0` (capas 12–24) sobre Qwen3.5-4B.

No se documentan datos de entrenamiento adicionales, número de tokens, composición del dataset ni etapas de RLHF/DPO específicas para este checkpoint; el conocimiento procede íntegramente del modelo base. La innovación técnica destacable es el enfoque de "persona horneada": el efecto se consigue sin system prompt, sin hooks de activación y sin decodificación especulativa ni mecanismos de atención alternativos, manteniendo los pesos en formato estándar y compatibles con el pipeline `text-generation` de transformers.

## Capacidades

- Generación de texto conversacional con un estilo sarcástico y cínico persistente, activo sin necesidad de instrucciones de sistema.
- Razonamiento y respuesta a preguntas generales heredados del modelo base Qwen3.5-4B.
- Modo de conversación multi-turno mediante `apply_chat_template` con `enable_thinking=False` (segun el ejemplo de uso de la model card).
- Compatibilidad con `endpoints_compatible`, lo que sugiere despliegue en infraestructuras de inferencia estándar.
- Capacidades multilingües: no documentadas en la información disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (vision, audio, thinking mode): no documentadas.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el checkpoint permite estudiar cómo una dirección de activación concreta, fusionada en dos capas MLP, altera el estilo de salida de forma consistente, y comparar la salida con el modelo base para aislar el efecto del steering.
- Experimentos de persona steering reproducibles: sirve como referencia para validar pipelines de extracción de vectores de personalidad y su fusión en pesos, sin depender de hooks en tiempo de ejecución.
- Generación de contenido satírico controlado: útil para prototipos de escritura humorística o crítica donde se busca un tono cínico estable a lo largo de una conversación.
- Evaluación de robustez frente a cambios de pesos: permite medir si la modificación de dos capas intermedias degrada capacidades del modelo base (razonamiento, coherencia) en tareas estándar.
- Docencia y divulgación: ejemplo práctico y ligero (4,2 B) para explicar cómo se localizan y manipulan rasgos de comportamiento en LLM abiertos.
- Pruebas de despliegue con transformers: al ser safetensors estándar, se puede integrar en pipelines existentes para comparar latencia y calidad frente al modelo base sin cambios de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 12–16 GB de VRAM para contextos moderados.
- VRAM estimada en cuantización de 8 bits: ~4,5 GB de pesos; en 4 bits: ~2,5 GB de pesos (estimaciones teóricas, no documentadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) para inferencia en bf16 sin problemas.
- GPU de consumo: cabe en RTX 3090/4090 en bf16; en GPUs de 8–12 GB requeriría cuantización.
- Opciones de despliegue: transformers (soporte nativo documentado); vLLM, TGI, llama.cpp u Ollama no están documentados explícitamente para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-4B-Persona-Cynic | ~4,2 B | no disponible | no disponible | Checkpoint con persona horneada en capas 16 y 20 |
| Qwen/Qwen3.5-4B (base) | ~4,2 B | no disponible | no disponible | Modelo original sin modificación de persona |
| Alternativas de steering por prompt | variable | variable | variable | Requieren system prompt o hooks; no persistentes en pesos |

No se dispone de datos de benchmarks ni de otros checkpoints de persona comparables en la información proporcionada.

## Limitaciones y advertencias

- El estilo sarcástico y condescendiente es persistente y difícil de desactivar mediante prompting, ya que está fusionado en los pesos; esto puede ser inadecuado para aplicaciones de atención al cliente o contenido profesional.
- Riesgo de alucinación inherente al modelo base, no mitigado por la modificación de persona.
- No se documentan sesgos específicos, pero el tono cínico puede amplificar respuestas desdeñosas o poco empáticas.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene verificar la licencia del modelo base Qwen3.5-4B antes de cualquier despliegue en producción.
- Idiomas soportados no documentados; el comportamiento multilingüe del steering no está validado.
- Contexto máximo no documentado; no se debe asumir una ventana concreta sin comprobación empírica.
- Checkpoint de investigación con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de validación por la comunidad.
- La fusión permanente de la actualización de rango implica que no es posible revertir la persona sin volver a cargar el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drjoshcsimmons/Qwen3.5-4B-Persona-Cynic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
