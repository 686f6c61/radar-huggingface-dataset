# AutoAudioReasoningMOS/CoTTAGE

## Resumen

CoTTAGE es un modelo de evaluación automática de audio (audio judge) desarrollado por AutoAudioReasoningMOS, obtenido mediante fine-tuning de Qwen2.5-Omni-7B. Su función es emitir una puntuación de opinión media (MOS, Mean Opinion Score) en una escala de 1,00 a 5,00 acompañada de una explicación razonada en formato de cadena de pensamiento. Cubre dos tareas: REL, que mide la alineación semántica entre un audio y una descripción textual, y OVL, que evalúa la calidad global del audio sin necesidad de texto de referencia.

El modelo resulta relevante porque automatiza una parte del proceso de evaluación subjetiva de audio generado por modelos texto-a-audio, un cuello de botella habitual en la investigación y en la producción de contenido sonoro. Al estar construido sobre Qwen2.5-Omni-7B, hereda la torre de audio de un modelo omni-modal y añade un comportamiento específico de evaluación con salida estructurada mediante etiquetas `<think>` y `<score>`.

El repositorio publica los pesos completos del modelo, sin necesidad de adaptadores LoRA separados, con un total de 10.732.225.408 parámetros y un tamaño de repositorio de 22,4 GB. La información pública sobre licencia, benchmarks y detalles de entrenamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen2.5-Omni (torre de audio + LLM); detalles internos no disponibles |
| Parametros totales | 10.732.225.408 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso carga con `torch_dtype="auto"`) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Entrada | audio (16 kHz mono) + texto |
| Salida | texto (razonamiento + puntuación MOS); salida de voz desactivada |

## Arquitectura y entrenamiento

CoTTAGE se construye por fine-tuning sobre Qwen2.5-Omni-7B, un modelo omni-modal que combina un codificador de audio con un modelo de lenguaje para entrada de audio y texto. El fine-tuning convierte el modelo generalista en un evaluador especializado que produce una cadena de razonamiento dentro de `<think></think>` seguida de una puntuación numérica dentro de `<score></score>`, redondeada a dos decimales.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre innovaciones técnicas adicionales más allá de la formulación de las tareas REL y OVL. El modelo se distribuye con los pesos completos, sin adaptador LoRA separado, lo que simplifica el despliegue pero implica cargar el modelo base completo.

## Capacidades

- Evaluación de alineación texto-audio (REL): puntúa de 1,00 a 5,00 cuánto se ajusta un clip de audio a una descripción textual dada.
- Evaluación de calidad global de audio (OVL): puntúa la calidad de un clip sin descripción de referencia, orientado a audio generado por modelos texto-a-audio.
- Razonamiento explícito: genera una explicación en `<think></think>` antes de emitir la puntuación final en `<score></score>`.
- Salida estructurada y determinista: el ejemplo oficial usa `thinker_do_sample=False` y `temperature=0.0`, lo que favorece la reproducibilidad de las puntuaciones.
- Procesamiento de audio a 16 kHz mono, con carga directa de la forma de onda por parte del procesador.
- Generación solo de texto: la salida de voz está desactivada (`enable_audio_output=False`, `return_audio=False`).
- Soporte multilingüe limitado al inglés según la model card.

## Casos de uso

- Evaluación de modelos texto-a-audio: puntuar con OVL los clips generados por un sistema TTA para comparar checkpoints o configuraciones de muestreo sin recurrir a anotadores humanos en cada iteración.
- Verificación de fidelidad a la descripción: usar REL para comprobar que un clip generado a partir de un prompt describe realmente lo solicitado (por ejemplo, "un perro ladra dos veces y pasa un coche") y detectar desviaciones semánticas.
- Control de calidad en pipelines de producción de audio: integrar el modelo como paso de filtrado que descarta clips con puntuación baja antes de publicarlos o enviarlos a revisión humana.
- Investigación en métricas de audio: emplear las puntuaciones y las explicaciones como señal objetiva complementaria a métricas clásicas (FAD, KL) en experimentos académicos.
- Auditoría de datasets de audio: puntuar grandes lotes de clips para detectar muestras de baja calidad o mal etiquetadas dentro de un corpus.
- Selección de variantes en generación: ejecutar REL y OVL sobre varias muestras de un mismo prompt y elegir la de mayor puntuación combinada, con el razonamiento como justificación auditable.
- Evaluación asistida por LLM en entornos de anotación: generar borradores de puntuación y razonamiento que los anotadores humanos revisan, reduciendo el coste por clip.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 10.732 millones de parámetros, en precisión completa (fp16/bf16) los pesos ocupan aproximadamente 21,5 GB, más el overhead de activaciones y del procesador de audio.
- GPU recomendadas: no especificadas por el autor. Por tamaño, se requiere al menos una GPU con 24 GB o más para fp16; una RTX 4090 (24 GB) es el mínimo práctico en consumer, con A100 o H100 para mayor margen y concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con fp16 y margen ajustado; en 16 GB sería necesario cuantizar, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: Transformers (>=4.57, <5) con `Qwen2_5OmniForConditionalGeneration`; ms-swift (>=3.12) con motor vLLM (>=0.10.2) para acelerar la inferencia. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El ejemplo oficial limita la generación a 1024 tokens nuevos por evaluación, lo que da una idea del coste por clip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoTTAGE | 10.732 M | no disponible | Evaluación MOS de audio (REL/OVL) | no disponible | Hugging Face |
| Qwen2.5-Omni-7B | ~7 B (nominal) | no disponible | Modelo omni-modal generalista | no disponible | Hugging Face |
| Métricas clásicas (FAD, KL) | no aplica | no aplica | Calidad de audio generado | según implementación | Librerías de código abierto |

No se dispone de información sobre otros evaluadores MOS basados en LLM comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés; el rendimiento en otros idiomas no está documentado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene verificar la licencia del modelo base Qwen2.5-Omni-7B antes de desplegarlo en producción.
- Riesgo de alucinación: al ser un modelo generativo, el razonamiento en `<think>` puede no reflejar fielmente los factores que determinan la puntuación; las explicaciones deben tratarse como indicativas.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de un modelo generalista puede heredar sesgos del corpus de entrenamiento del modelo base.
- Escala subjetiva: las puntuaciones MOS son estimaciones automáticas y no sustituyen por completo la evaluación humana, especialmente en dominios de audio no representados en el entrenamiento.
- Formato de salida: requiere prompts específicos con las etiquetas `<think>` y `<score>`; el parseo de la puntuación debe manejar respuestas mal formadas.
- Dependencias: el ejemplo oficial fija versiones concretas (`transformers>=4.57,<5`, `torch>=2.6`) y desactiva la salida de audio; configuraciones distintas pueden fallar.
- Sin benchmarks publicados: no hay evidencia cuantitativa de correlación con juicios humanos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutoAudioReasoningMOS/CoTTAGE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Documentación de Qwen2.5-Omni en Transformers: https://huggingface.co/docs/transformers/v4.57.1/en/model_doc/qwen2_5_omni
- Repositorio ms-swift: no disponible en la información proporcionada
- Repositorio vLLM: no disponible en la información proporcionada
