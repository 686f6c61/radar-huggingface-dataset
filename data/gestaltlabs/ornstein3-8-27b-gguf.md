# GestaltLabs/Ornstein3.8-27B-GGUF

## Resumen

Ornstein3.8-27B-GGUF es un conjunto de cuantizaciones GGUF del modelo GestaltLabs/Ornstein3.8-27B, un fine-tune vision-language de la familia Qwen 3.8 con arquitectura densa de 27 000 millones de parámetros. El modelo base combina atención lineal intercalada con atención completa mediante Gated DeltaNet, una innovación arquitectónica que reduce el coste de la atención en contextos largos. El ajuste fino se realizó con un LoRA de rango 32 entrenado en Fireworks AI y fusionado posteriormente en el stack de lenguaje de Qwen3.8-27B.

El proyecto, desarrollado por un estudiante de doctorado en neurociencia visual de la Universidad de Toronto, inyecta un modo de razonamiento denominado "Ornstein thinking" en el modelo base. Se trata de una fusión temprana, no de una versión final de calidad, y la model card advierte que la evaluación formal está pendiente. La relevancia actual radica en que ofrece una alternativa multimodal de código abierto con una ventana de contexto de 262 144 tokens, disponible en cuantizaciones que caben en GPUs de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (dense, vision-language) |
| Parametros totales | 27 320 697 856 (~27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M (lenguaje); mmproj BF16 (vision) |
| Idiomas soportados | no disponible (las etiquetas del repositorio indican inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (lenguaje y mmproj); safetensors en el repositorio base |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3_5ForConditionalGeneration, que emplea una mezcla de atención lineal y atención completa mediante Gated DeltaNet. Esta combinación permite manejar secuencias largas con un coste computacional reducido en comparación con la atención softmax estándar. La configuración incluye 64 capas, tamaño oculto de 5120, 24 cabezas de atención con 4 cabezas KV y dimensión de cabeza de 256. El componente de visión se añade mediante un proyector multimodal (mmproj) que conecta un tower de visión con el stack de lenguaje.

El entrenamiento consistió en un LoRA de rango 32 sobre el modelo Qwen3.8-27B, ejecutado en la plataforma Fireworks AI y fusionado posteriormente. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.). La model card indica que el checkpoint es una fusión temprana y que el trabajo de calidad planificado incluye entornos de reinforcement learning y fine-tuning basado en energía. No se especifica si se aplicó alguna técnica de decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y razonamiento conversacional, heredadas del modelo base Qwen3.8-27B.
- Comprensión de imágenes y vídeo a través del proyector multimodal (mmproj), permitiendo descripción y respuesta a preguntas visuales.
- Ventana de contexto de 262 144 tokens, adecuada para documentos largos, conversaciones multi-turno y análisis de secuencias extensas.
- Soporte para inferencia multimodal en llama.cpp mediante el flag `--mmproj`, así como en Transformers y vLLM usando los pesos safetensors del repositorio base.
- Capacidad de procesamiento de texto e imagen de forma intercalada, gracias a la arquitectura vision-language.
- No se menciona soporte explícito de tool calling, function calling ni modo agente en la información disponible.

## Casos de uso

- Análisis de documentos largos con contexto extendido: la ventana de 262 144 tokens permite procesar informes extensos, libros o expedientes completos en una sola pasada, resumiendo y extrayendo información relevante sin necesidad de dividir el texto.
- Asistente de atención al cliente multimodal: el modelo puede gestionar conversaciones que incluyan capturas de pantalla, imágenes de productos o documentos escaneados, respondiendo con contexto acumulado durante toda la interacción.
- Generación de descripciones de imágenes y vídeo: gracias al proyector de visión, puede generar subtítulos, descripciones detalladas o responder preguntas sobre contenido visual en aplicaciones de accesibilidad o catalogación de medios.
- Investigación académica en visión por computador: al ser un fine-tune de un modelo de lenguaje con atención híbrida, sirve como base para experimentos sobre razonamiento visual y eficiencia atencional en contextos largos.
- Desarrollo de prototipos locales con hardware de consumo: las cuantizaciones Q4_K_M y Q6_K permiten ejecutar el modelo en GPUs de 24 GB y 32 GB respectivamente, facilitando pruebas y desarrollo sin infraestructura cloud.
- Servicio de inferencia multimodal en entornos autoalojados: mediante `llama-server` con el archivo mmproj, se puede desplegar un endpoint compatible con OpenAI para aplicaciones que requieran procesamiento de texto e imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación formal está pendiente y que el checkpoint es una fusión temprana, por lo que no se dispone de datos de MMLU, HumanEval, GSM8K u otras pruebas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización Q4_K_M ocupa 16,8 GB, por lo que cabe en GPUs de 24 GB como la RTX 4090 o la RTX 3090. Q6_K (22,4 GB) requiere al menos 32 GB de VRAM, y Q8_0 (29,0 GB) necesita 32 GB o más.
- GPU recomendadas: RTX 4090, RTX 3090, A100 40 GB, H100 80 GB, o GPUs de estación de trabajo con 24 GB o más de VRAM. Para Q8_0 se recomienda una GPU con al menos 32 GB.
- El archivo mmproj de visión (931 MB) debe cargarse adicionalmente para inferencia multimodal en llama.cpp.
- Opciones de despliegue: llama.cpp (versión b9296 o superior), llama-server, LM Studio, Ollama (mediante Modelfile), koboldcpp y text-generation-webui. Para Transformers y vLLM se deben usar los pesos safetensors del repositorio base.
- Latencia y throughput: no se han publicado datos específicos. Al ser un modelo denso de 27B, el rendimiento dependerá de la GPU y de la cuantización elegida; en una RTX 4090 con Q4_K_M se puede esperar una velocidad de generación del orden de 20-40 tokens por segundo, aunque este valor es orientativo y no ha sido verificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GestaltLabs/Ornstein3.8-27B | ~27B | 262 144 | Qwen3_5 (Gated DeltaNet) | Apache 2.0 | GGUF y safetensors |
| Qwen3.8-27B (base) | ~27B | 262 144 | Qwen3_5 (Gated DeltaNet) | Apache 2.0 | safetensors y GGUF |
| Otros fine-tunes de Qwen3.8-27B | ~27B | 262 144 | Qwen3_5 | Apache 2.0 | Variable |

Ornstein3.8-27B es un fine-tune del modelo base Qwen3.8-27B, por lo que comparte arquitectura, contexto y licencia. La diferencia principal es la inyección del modo de razonamiento "Ornstein thinking" y el componente de visión. No se dispone de datos de rendimiento comparativo con otros fine-tunes de la misma familia.

## Limitaciones y advertencias

- El checkpoint es una fusión temprana, no una versión final de calidad. La model card advierte explícitamente que no es un lanzamiento pulido y que la evaluación formal está pendiente.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- Los idiomas soportados no están documentados; las etiquetas del repositorio sugieren inglés, pero no hay confirmación oficial.
- No se menciona soporte de tool calling, function calling ni modos de agente, lo que limita su uso en pipelines de automatización complejos.
- El uso de atención híbrida (Gated DeltaNet) requiere una versión reciente de llama.cpp (b9296 o superior); versiones antiguas no cargarán el modelo.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen 3.8, se deben respetar los términos de la licencia original.
- El autor es un investigador independiente que financia el proyecto con recursos propios; el soporte y mantenimiento pueden ser limitados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/GestaltLabs/Ornstein3.8-27B-GGUF
- Repositorio base (safetensors): https://huggingface.co/GestaltLabs/Ornstein3.8-27B
- Repositorio alternativo (Ornstein-27B-GGUF): https://huggingface.co/GestaltLabs/Ornstein-27B-GGUF
- Guía de ejecución local de Qwen 3.8 27B: https://dev.to/purpledoubled/run-qwen-38-27b-locally-real-gguf-sizes-the-kv-cache-trick-and-the-template-trap-114j
- Anuncio de Qwen 3.8: https://openlm.ai/qwen3.8/
- Guía de ejecución de Qwen 3.8 27B con GGUF: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
