# emperorofrome/GMLINUX-9B

## Resumen

GMLinux 9B es un modelo multimodal de tipo imagen-texto a texto con 9.197.093.888 parámetros, publicado por el usuario emperorofrome bajo el patrocinio de Galactic Mandate Linux. Se trata de un modelo fusionado (merge) que combina los pesos de Qwen/Qwen3.5-9B y ornith-ai/Ornith-1.5-9B, ambos modelos de aproximadamente 9B parámetros. El resultado se distribuye en formato BF16 safetensors para Transformers y en una cuantización Q8_0 GGUF para runtimes compatibles como llama.cpp o LM Studio.

El modelo se presenta como una alternativa orientada a razonamiento y conocimiento, con capacidades de visión y una longitud de contexto declarada de hasta 262.144 tokens. Su relevancia radica en que ofrece un punto de partida multimodal de tamano medio con licencia Apache-2.0, aunque con una validación técnica y de rendimiento muy limitada por parte del autor.

La información disponible es escasa: no hay datos publicados de benchmarks estándar, no se detallan los idiomas soportados ni la composición del dataset de entrenamiento. Las afirmaciones de rendimiento del autor se basan en benchmarks internos no reproducibles, por lo que deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5 y Ornith-1.5; detalles internos no disponibles |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens declarados en configuracion; probado localmente a 68.096 tokens |
| Tipos de cuantizacion | BF16 (safetensors), Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (upstream: Qwen3.5-9B Apache-2.0, Ornith-1.5-9B MIT) |
| Formato de pesos | safetensors (BF16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna. Por los modelos base y las etiquetas, se trata de un transformer multimodal con capacidad de visión, integrado en la familia Qwen3.5, que procesa entradas de imagen y texto y genera texto. El modelo es un merge de pesos de Qwen/Qwen3.5-9B y ornith-ai/Ornith-1.5-9B, no un entrenamiento desde cero.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado posteriores al merge. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de thinking mode. El repositorio incluye configuración, tokenizer, processor y plantilla de chat para el uso con Transformers.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de entradas de imagen junto con texto (image-text-to-text) mediante el modelo Transformers y su processor.
- Razonamiento y conocimiento general, según la evaluación interna declarada por el autor.
- Capacidades multilingües: no documentadas explícitamente.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking o razonamiento extendido: no documentado.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede recibir una imagen y una pregunta en texto y generar una respuesta descriptiva, útil para prototipos de atención al cliente que necesiten interpretar capturas o fotos enviadas por el usuario.
- Análisis de documentos escaneados: con el processor de Transformers, se pueden pasar imágenes de facturas o formularios y obtener extracción descriptiva en texto, aprovechando la ventana de contexto declarada para incluir varias páginas.
- Moderación de contenido visual en pipelines internos: clasificación y descripción de imágenes en flujos de revisión, siempre con validación previa del rendimiento real en la tarea concreta.
- Generación de descripciones para catálogos: etiquetado automático de imágenes de producto en texto, integrable en un pipeline de Transformers con `device_map="auto"`.
- Experimentación e investigación en merges de modelos: el repositorio sirve como caso de estudio de fusión de pesos entre dos modelos de 9B con licencias permisivas, útil para investigadores que analicen el efecto del merge en tareas de conocimiento.
- Despliegue local con llama.cpp o LM Studio: mediante el archivo Q8_0 GGUF se puede ejecutar en estaciones de trabajo con memoria suficiente, aunque el soporte de visión en ese formato depende del runtime y puede requerir un proyector multimodal separado.
- Prototipado de asistentes con contexto largo: para tareas de resumen o preguntas sobre conversaciones extensas, siempre validando primero el comportamiento más allá de los 68.096 tokens probados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor afirma una mejora del 30% frente a Qwen3.5-9B y Ornith-1.5-9B en sus benchmarks internos de conocimiento y razonamiento, sin publicar la metodología ni los datos. El propio autor indica que el rendimiento en programación no se ha establecido como superior al de los modelos base.

## Requisitos de hardware

- VRAM estimada para BF16: aproximadamente 18,4 GB solo para pesos (9,197 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más.
- VRAM estimada para Q8_0 GGUF: aproximadamente 9,8 GB para pesos, más overhead; viable en GPUs de 16 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100 para contexto largo y despliegue en producción; RTX 4090 (24 GB) para BF16 con contexto limitado o Q8_0 con margen.
- GPU de consumo: Q8_0 puede caber en RTX 4080/4090 (16-24 GB) y en GPUs de 12-16 GB con contexto reducido; BF16 no cabe en GPUs de 12 GB.
- Opciones de despliegue: Transformers (`AutoModelForImageTextToText`), llama.cpp, LM Studio; vLLM y TGI no están documentados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GMLINUX-9B | 9,2B | 262.144 declarados (68.096 probados) | Si (Transformers) | Apache-2.0 | Hugging Face, safetensors y GGUF |
| Qwen/Qwen3.5-9B | ~9B | no disponible en esta ficha | no disponible | Apache-2.0 | Hugging Face |
| ornith-ai/Ornith-1.5-9B | ~9B | no disponible en esta ficha | no disponible | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo verificable entre estos modelos; la única comparación publicada es la afirmación interna del autor sobre una mejora del 30% en sus propios benchmarks.

## Limitaciones y advertencias

- Los benchmarks citados son internos, no reproducibles y sin metodología publicada; no deben usarse como evidencia de superioridad.
- El rendimiento en código no está establecido como superior al de los modelos base, según el propio autor.
- El contexto de 262.144 tokens es una cifra de configuración; solo se ha validado localmente hasta 68.096 tokens.
- El archivo Q8_0 GGUF puede no soportar visión sin un proyector multimodal adicional; verificar el runtime antes de asumir capacidades de imagen.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- Es un merge de pesos, no un modelo entrenado de forma independiente; el comportamiento puede heredar limitaciones y sesgos de ambos modelos base.
- Aunque la licencia del repositorio es Apache-2.0, se debe revisar la licencia MIT de Ornith-1.5-9B y las condiciones de Qwen3.5-9B antes de redistribuir o usar comercialmente.
- El modelo tiene muy poca tracción (366 descargas, 1 like) y no hay evidencia de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/emperorofrome/GMLINUX-9B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
