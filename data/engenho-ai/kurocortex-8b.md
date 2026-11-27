# engenho-ai/KuroCortex-8B

## Resumen

KuroCortex-8B es un modelo de lenguaje de 8.190.735.360 parámetros desarrollado por Engenho AI (Brasil) como parte de la "Linha Kuro". Se presenta como el núcleo de razonamiento lógico, planificación estratégica y orquestación de tareas de esa familia, y está afinado a partir de Qwen/Qwen2.5-7B-Instruct. La model card lo describe como un modelo orientado a *reasoning* y orquestación, con soporte declarado para portugués, inglés y español.

El modelo se distribuye con pesos en safetensors (repositorio de 16,4 GB) y también en formato GGUF cuantizado Q4_K_M (~5,0 GB de VRAM), lo que lo hace desplegable en GPUs de 8 GB o más, incluidas AMD, Intel y NVIDIA. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales conocidas.

Es relevante por su posicionamiento como pieza de orquestación dentro de un stack multiagente y por su vocación multilingüe con foco en portugués de Brasil. No obstante, el repositorio no incluye información pública sobre datos de entrenamiento, benchmarks ni detalles de la arquitectura más allá de su base Qwen2.5-7B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-7B-Instruct); detalles específicos de la variante no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | GGUF Q4_K_M (~5,0 GB) según model card; safetensors en precisión original; otras cuantizaciones no disponibles |
| Idiomas soportados | Portugués (pt-BR), inglés (en), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only con atención completa estándar. Los parámetros totales reportados (8,19 mil millones) superan ligeramente los ~7,6 mil millones del Qwen2.5-7B original, lo que sugiere posibles ajustes en embeddings o cabezales, aunque la model card no detalla la diferencia. No se especifica si se emplearon técnicas como RoPE ajustado, GQA o atención lineal.

No hay información pública sobre el corpus de entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO, datos sintéticos o procesos de destilación. La model card se limita a indicar el propósito (razonamiento, planificación y orquestación) y el formato de distribución. Tampoco se documentan innovaciones técnicas como decodificación especulativa o modos de pensamiento explícitos.

## Capacidades

- Generación de texto conversacional en portugués, inglés y español.
- Razonamiento lógico y planificación estratégica, según la descripción del autor.
- Orquestación de tareas, orientada a coordinar subtareas o agentes dentro de un pipeline.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: declarado a nivel de posicionamiento ("orquestación"), sin detalles técnicos.
- Capacidades multilingües limitadas a pt, en y es.
- No se declaran capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Orquestación de agentes en portugués: el modelo puede actuar como planificador central que descompone una petición en subtareas y las asigna a modelos especializados, aprovechando su orientación declarada a orquestación.
- Asistencia técnica en atención al cliente en pt-BR: conversaciones multi-turno en portugués de Brasil con tono controlado, adecuado para soporte de primer nivel.
- Planificación de tareas empresariales: generación de planes paso a paso, checklists y descomposición de objetivos en entornos de habla portuguesa o española.
- Generación de documentación técnica trilingüe: redacción y traducción entre pt, en y es de manuales, READMEs y guías, con la ventaja de una sola licencia Apache 2.0.
- Despliegue en hardware de gama media: al existir GGUF Q4_K_M (~5,0 GB), puede ejecutarse en GPUs de 8 GB o incluso en CPU con llama.cpp para prototipos y entornos de desarrollo.
- Integración en pipelines de CI/CD para revisión de texto: clasificación, resumen y generación de mensajes de commit o changelogs en repositorios con equipos lusófonos.
- Base para fine-tunes verticales: al ser Apache 2.0 y derivar de Qwen2.5, sirve como punto de partida para adaptaciones a dominios concretos sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: ~5,0 GB con GGUF Q4_K_M según la model card; en safetensors fp16 se requieren aproximadamente 16,4 GB (tamaño del repositorio).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para Q4_K_M (NVIDIA RTX 3060/4060, AMD RX 6600+, Intel Arc); para fp16 se recomienda A100 40 GB, H100 o RTX 4090 (24 GB) con margen.
- Cabe en GPU de consumo: sí, en GPUs de 8 GB o más con cuantización Q4_K_M; en fp16 requiere GPUs de 24 GB o superiores.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM, TGI o transformers para safetensors. No se confirma compatibilidad con todos ellos en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KuroCortex-8B | 8,19 B | no disponible | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 tokens | Apache 2.0 | Hugging Face, ecosistema amplio |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, Ollama, vLLM |
| Mistral 7B Instruct v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 | Hugging Face, Ollama, vLLM |

No se dispone de datos de rendimiento comparativo (benchmarks) para KuroCortex-8B, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente al modelo base ni frente a alternativas.
- Sin documentación sobre datos de entrenamiento: se desconocen sesgos potenciales, composición del corpus y posibles problemas de contaminación.
- Riesgo de alucinación inherente a los modelos de 8B, especialmente en tareas de razonamiento multi-paso y planificación.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, no se garantiza que el fine-tune preserve esa ventana.
- Cobertura lingüística limitada a pt, en y es; puede degradarse en otros idiomas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni retroalimentación de uso.
- Aunque la licencia es Apache 2.0, conviene verificar que los términos del modelo base se respeten en despliegues comerciales.
- La model card está redactada principalmente en portugués y carece de detalles técnicos reproducibles (semillas, hiperparámetros, recetas).

## Enlaces

- Hugging Face: https://huggingface.co/engenho-ai/KuroCortex-8B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
