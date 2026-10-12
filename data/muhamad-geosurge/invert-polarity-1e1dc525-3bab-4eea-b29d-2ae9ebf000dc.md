# muhamad-geosurge/invert-polarity-1e1dc525-3bab-4eea-b29d-2ae9ebf000dc

## Resumen

El modelo `muhamad-geosurge/invert-polarity-1e1dc525-3bab-4eea-b29d-2ae9ebf000dc` es un ajuste fino ("fine-tune") publicado por el usuario `muhamad-geosurge` sobre el modelo base `google/gemma-4-E4B`, perteneciente a la familia Gemma 4 de Google DeepMind. Se distribuye bajo licencia Apache 2.0 y está orientado a tareas "any-to-any" (entrada y salida multimodal), según la etiqueta de pipeline declarada en HuggingFace. El repositorio ocupa 15,1 GB y contiene pesos en formato safetensors, con un total de 7.518.082.346 parámetros medidos sobre los ficheros de pesos.

La relevancia de esta ficha radica en que el modelo herede las capacidades de la arquitectura Gemma 4, que combina atención híbrida (ventana deslizante local intercalada con atención global), soporte multimodal nativo (texto, imagen y audio en las variantes E2B/E4B/12B) y una ventana de contexto de hasta 128K tokens en los modelos pequeños como el E4B. El modelo base incorpora además soporte de system prompt nativo y function calling.

Conviene señalar que la model card publicada no documenta el proceso de ajuste fino, el dataset empleado ni el objetivo concreto del mismo (el nombre "invert-polarity" no se explica en la información disponible). La tarjeta reproduce esencialmente el material descriptivo de la familia Gemma 4, por lo que los detalles específicos de este fine-tune deben considerarse no documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal basado en Gemma 4 E4B (atención híbrida: ventana deslizante local + atención global; Per-Layer Embeddings) |
| Parametros totales | 7.518.082.346 (~7,5 B, medidos en safetensors) |
| Parametros activos | no disponible (el modelo base E4B es denso, no MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base E4B) |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors); el modelo base admite cuantizaciones estándar para despliegue local |
| Idiomas soportados | el modelo base Gemma 4 declara soporte multilingüe en más de 140 idiomas; los idiomas concretos de este fine-tune no están documentados |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura Gemma 4 E4B, un transformer decoder-only de la familia Gemma 4 con mecanismo de atención híbrido que intercala capas de atención local con ventana deslizante (512 tokens en E4B) y capas de atención global, garantizando que la última capa sea siempre global. Las capas globales emplean claves y valores unificados y aplican Proportional RoPE (p-RoPE) para optimizar el uso de memoria en contextos largos. Los modelos E incorporan Per-Layer Embeddings (PLE), un mecanismo que asigna a cada capa del decoder su propia embedding por token, lo que explica la diferencia entre parámetros efectivos (4,5 B en E4B) y parámetros totales con embeddings (8 B nominales).

No se dispone de información sobre el dataset de ajuste fino, el número de tokens empleados, la composición de los datos ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card reproduce el material descriptivo de la familia Gemma 4 (razonamiento con modos de "thinking" configurables, soporte nativo de system prompt y mejoras en capacidades de código y agentes), pero no documenta ninguna innovación propia de este fine-tune concreto.

## Capacidades

- Generación de texto y razonamiento: el modelo base está diseñado como razonador con modos de "thinking" configurables.
- Procesamiento multimodal: entrada de texto, imagen (con soporte de relación de aspecto y resolución variables), vídeo y audio en las variantes E2B, E4B y 12B.
- Generación de código: la familia Gemma 4 declara mejoras en benchmarks de código respecto a versiones anteriores.
- Function calling / tool calling nativo: soporte declarado en el modelo base para invocación de funciones.
- Flujos agénticos: capacidades orientadas a agentes autónomos y razonamiento multi-paso.
- Soporte multilingüe: más de 140 idiomas según la documentación del modelo base.
- System prompt nativo: soporte del rol `system` para conversaciones estructuradas.
- Capacidades específicas de este fine-tune (tarea "invert-polarity"): no documentadas en la información disponible.

## Casos de uso

- Asistentes conversacionales de contexto largo: el modelo puede mantener diálogos multi-turno extensos apoyándose en la ventana de 128K tokens del modelo base, útil para atención al cliente con historiales largos.
- Análisis de documentos multimodales: al heredar la capacidad de procesar imagen y texto, permite extraer información de capturas, diagramas o documentos escaneados combinados con instrucciones textuales.
- Generación y asistencia de código: integrable en editores o pipelines de CI/CD mediante function calling para tareas de autocompletado, revisión o generación de tests.
- Agentes autónomos con herramientas: el soporte nativo de tool calling permite encadenar llamadas a APIs externas en flujos multi-paso.
- Procesamiento de audio (si se conserva la modalidad del modelo base E4B): transcripción o comprensión de audio combinada con razonamiento textual.
- Aplicaciones multilingües: al heredar el soporte de más de 140 idiomas del modelo base, puede emplearse en traducción, atención multilingüe o moderación de contenido en varios idiomas.
- Prototipado e investigación sobre ajuste fino: dado su tamaño moderado y licencia permisiva, sirve como punto de partida para experimentos de fine-tuning adicionales.

Nota: no se han documentado casos de uso específicos para la tarea "invert-polarity", por lo que los anteriores son aplicaciones derivadas de las capacidades del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona de forma cualitativa mejoras en benchmarks de código y razonamiento para la familia Gemma 4, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otros) ni para el modelo base E4B ni para este fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15 GB solo para pesos (coherente con los 7,5 B de parámetros y los 15,1 GB del repositorio), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización int8: en torno a 8 GB de pesos.
- VRAM estimada en cuantización int4 (GGUF Q4): en torno a 4-5 GB de pesos, viable en GPU de consumo.
- GPU recomendadas (por modelo): NVIDIA RTX 4090 (24 GB) para FP16; A100/H100 (40-80 GB) para despliegue en FP16 con lotes grandes y contexto largo; GPUs con 8-16 GB para cuantización int8/int4.
- Cabe en GPU de consumo: sí, en cuantización int4 o int8 sobre RTX 3060/4060/4070/4090, siempre que el motor de inferencia lo soporte.
- Opciones de despliegue: transformers (librería declarada), más los motores habituales compatibles con safetensors o GGUF (vLLM, TGI, llama.cpp, Ollama) siempre que exista conversión y soporte de la arquitectura Gemma 4; la información disponible no confirma compatibilidad explícita con cada uno.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este fine-tune (sobre Gemma 4 E4B) | 7,5 B | 128K tokens (heredado) | texto, imagen, audio (base) | apache-2.0 | HuggingFace (0 descargas) |
| google/gemma-4-E4B (base) | 4,5 B efectivos (8 B con embeddings) | 128K tokens | texto, imagen, audio | Apache 2.0 (Gemma) | HuggingFace |
| google/gemma-4-12B Unified | 11,95 B | 256K tokens | texto, imagen, audio | Apache 2.0 (Gemma) | HuggingFace |
| google/gemma-4-26B A4B MoE | 25,2 B totales / 3,8 B activos | 256K tokens | texto, imagen | Apache 2.0 (Gemma) | HuggingFace |

No se dispone de datos de rendimiento comparado para este fine-tune frente a alternativas, por lo que la comparación se limita a parámetros, contexto, modalidades y licencia.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifican el dataset, el objetivo del ajuste ("invert-polarity") ni las métricas de evaluación, lo que dificulta validar su comportamiento en producción.
- Riesgo de alucinación: inherente a los modelos generativos; no hay datos que permitan cuantificar el riesgo en este fine-tune.
- Sesgos: no documentados para este modelo; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Cobertura idiomática real: aunque el modelo base declara más de 140 idiomas, el fine-tune podría haber degradado el rendimiento en idiomas no presentes en su dataset de ajuste.
- Restricciones de licencia: se declara apache-2.0, lo que en principio permite uso comercial; sin embargo, el enlace de licencia de la model card apunta a la licencia específica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`), por lo que conviene revisar los términos aplicables del modelo base antes de uso comercial.
- Adopción nula: el repositorio registra 0 descargas y 0 "likes", sin evidencia de validación por parte de la comunidad.
- Compatibilidad de despliegue: no confirmada para motores de inferencia concretos distintos de transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muhamad-geosurge/invert-polarity-1e1dc525-3bab-4eea-b29d-2ae9ebf000dc
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Colección Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
