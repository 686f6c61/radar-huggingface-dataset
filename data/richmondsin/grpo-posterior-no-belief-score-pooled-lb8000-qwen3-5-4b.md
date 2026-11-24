# richmondsin/grpo-posterior-no-belief-score-pooled-lb8000-qwen3.5-4b

## Resumen

`richmondsin/grpo-posterior-no-belief-score-pooled-lb8000-qwen3.5-4b` es un modelo derivado de Qwen/Qwen3.5-4B publicado por el usuario richmondsin en Hugging Face. Se trata de un merge completo del modelo base con un adaptador LoRA entrenado mediante GRPO (Group Relative Policy Optimization) bajo una ablación concreta denominada "posterior, sin belief score, pooled". El resultado es un checkpoint de 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) en formato safetensors y bf16, con un repositorio de 9,3 GB.

El modelo conserva la arquitectura y el pipeline del base: es un modelo multimodal de tipo image-text-to-text etiquetado con la arquitectura `qwen3_5`, por lo que mantiene la capacidad de procesar imágenes y texto. La intervención del autor se limita estrictamente a los pesos: los 200 módulos LoRA se fusionaron en fp32 y se almacenaron en bf16, mientras que el resto de tensores (538) permanecen byte a byte idénticos al modelo base, y los ficheros de configuración, tokenizador, plantilla de chat, procesador y generación también son los originales sin modificar.

La relevancia de esta publicación es fundamentalmente experimental: documenta una ablación de aprendizaje por refuerzo sobre un modelo multimodal de 4B, con detalles reproducibles del proceso de merge (hash sha256 del adaptador, regla de fusión, informe de verificación). No obstante, el autor no publica resultados de evaluación, licencia explícita ni lista de idiomas, lo que limita seriamente su uso en producción sin una validación adicional por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen3_5` (image-text-to-text) |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16), libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de aproximadamente 4,66 mil millones de parámetros que procesa entradas de imagen y texto. Sobre ese base se aplicó un ajuste con LoRA de rango 16 y `lora_alpha` 32, entrenado con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo sin modelo crítico que optimiza recompensas comparando grupos de respuestas. La ablación registrada en la model card se describe como "belief line, no belief score (line_score none: no belief reward), pooled (phase_set 1200, set_keep 800), length_budget 8000, update 50", lo que indica que se eliminó la recompensa de "belief score" y se aplicó un esquema de pooling sobre conjuntos de 1200 fases con 800 elementos retenidos, con un presupuesto de longitud de 8000 y actualizaciones cada 50 pasos.

La fusión se realizó con la regla estándar `W <- W + (lora_alpha / r) * B @ A`, es decir, escala 2,0, calculada en fp32 y almacenada en bf16. Se fusionaron 200 módulos LoRA; el resto del estado (538 tensores) es byte a byte idéntico al base, y el total de bytes de tensores coincide con el del modelo original (9.319.737.856 bytes). El autor advierte que, al almacenar el merge en bf16, las salidas pueden diferir ligeramente de las que produciría el base más el adaptador en tiempo de ejecución. No se documentan datos de entrenamiento (número de tokens, composición del dataset, mezcla de idiomas) ni detalles sobre el proceso de RLHF/DPO más allá de la configuración GRPO citada.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), incluyendo tareas de descripción, respuesta a preguntas visuales y comprensión de documentos.
- Capacidad de ajuste por preferencias mediante GRPO, orientada a mejorar la calidad de las respuestas según la recompensa definida en el entrenamiento.
- Soporte de plantilla de chat y configuración de generación del modelo base, sin modificaciones.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`) y con la librería transformers.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de ablaciones de RL: el modelo sirve como artefacto reproducible para comparar el efecto de eliminar la recompensa de belief score en un pipeline GRPO sobre un base multimodal de 4B, gracias a que el merge está documentado con hash y regla de fusión.
- Investigación en ajuste por preferencias: útil para estudiar cómo el pooling de fases y el presupuesto de longitud (8000) afectan al comportamiento generativo en tareas de razonamiento visual.
- Prototipado de asistentes multimodales: al conservar el pipeline image-text-to-text, puede emplearse para experimentar con descripción de imágenes y respuesta a preguntas visuales en entornos de laboratorio.
- Generación de descripciones de imágenes en catálogos o inventarios: el modelo puede recibir una imagen y producir texto asociado, siempre que se valide su calidad frente al base sin ajuste.
- Respuesta a preguntas sobre documentos escaneados: apropiado para pruebas de concepto donde se combine OCR con el modelo, dado su soporte de entrada imagen-texto.
- Base para futuros merges y comparativas: al ser byte-idéntico al base salvo en los 200 módulos LoRA, es un punto de partida controlado para reproducir experimentos de RL sobre Qwen3.5-4B.
- Docencia y formación: útil como ejemplo didáctico de cómo se documenta y verifica un merge de LoRA en un modelo multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda un mínimo de 12-16 GB de VRAM para contextos cortos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 (24 GB) también es viable con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización adicional no publicada por el autor, potencialmente en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (librería declarada), endpoints de Hugging Face (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible, y la ausencia de pesos GGUF limita el uso directo en llama.cpp/Ollama sin conversión propia.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| richmondsin/grpo-posterior-no-belief-score-pooled-lb8000-qwen3.5-4b | ~4,66 B | no disponible | imagen-texto | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4,66 B | no disponible | imagen-texto | no disponible en la informacion | Hugging Face |
| Alternativas de ~4B multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de licencia explícita: no se indica licencia en la model card ni en los metadatos, lo que impide determinar si el uso comercial está permitido; debe consultarse la licencia del base Qwen/Qwen3.5-4B antes de cualquier despliegue.
- Sin datos de evaluación: no hay benchmarks, por lo que no puede afirmarse que el ajuste GRPO mejore al base en ninguna tarea concreta.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se documentan mitigaciones específicas.
- Sesgos: no se documentan análisis de sesgo ni composición del dataset de entrenamiento.
- Idiomas: la lista de idiomas no está disponible; no debe asumirse un soporte multilingüe más allá del que ofrezca el base.
- Diferencia numérica por el merge en bf16: el autor advierte que las salidas pueden diferir ligeramente del base más el adaptador en tiempo de ejecución, lo que afecta a la reproducibilidad exacta.
- Naturaleza experimental: el nombre del repositorio indica una ablación concreta ("no belief score", "pooled", "lb8000"), por lo que no debe tratarse como un modelo afinado para producción.
- Contexto máximo no documentado: no se especifica la longitud de contexto efectiva, lo que impide planificar cargas de trabajo con ventanas largas.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/grpo-posterior-no-belief-score-pooled-lb8000-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
