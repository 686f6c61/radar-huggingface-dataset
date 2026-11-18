# IsValorum/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-VAL-APEX-I-NanoPlus-V3-GGUF

## Resumen

Esta ficha describe la cuantización GGUF **VAL-APEX-I NanoPlus V3** del modelo `huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated`, publicada por el usuario IsValorum. Se trata de un fine-tune de la familia Qwen3.8 de 27B orientado a generación de código y razonamiento agéntico, al que se ha aplicado un proceso de *abliteration* (eliminación de rechazos en capas 2 a 52) y un ajuste de alineamiento denominado EfficientThink que reduce la verbosidad del razonamiento interno. El modelo base parte de una arquitectura transformer densa de 27.320.697.856 parámetros (~27,3B) con contexto nativo declarado de 256K tokens.

El interés de esta publicación concreta reside en el empaquetado: es una cuantización de 12,18 GB (3,57 BPW sobre el archivo completo, 11,35 GiB de huella en memoria) que, según el autor, mantiene un suelo de 3 bits en todos los bloques MLP feed-forward para evitar asignaciones destructivas de 2 bits. Esto la sitúa en el segmento de 11-12 GB, apto para GPUs de consumo con 12-16 GB de VRAM, un espacio donde normalmente se sacrifica mucha precisión en modelos de 27B.

Es relevante ahora porque combina tres tendencias: modelos de código con contexto largo, despliegue local vía llama.cpp y versiones "uncensored" orientadas a tareas de seguridad ofensiva, ingeniería inversa y análisis de código malicioso, donde los rechazos por defecto resultan un obstáculo operativo. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8); detalles de atención no disponibles |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (declarado como contexto nativo en la model card) |
| Tipos de cuantizacion | GGUF; esta edición es NanoPlus V3 con 3,57 BPW de media y suelo de 3 bits en bloques MLP; existe una edición MiniPlus V3 de 4,15 BPW |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ja, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de ~27,3B parámetros de la familia Qwen3.8. Según la model card, el fine-tune Coder390 se entrenó con SFT multi-modelo sobre trazas generadas por "Opus 5.5, GPT-6 Astra, Grok 4.7 y DeepSeek V4 Pro", seguido de optimización con RLOO (REINFORCE Leave-One-Out). Sobre esa base se aplicó el alineamiento EfficientThink, orientado a recortar la sobrecarga de razonamiento repetitivo sin perder profundidad de resolución de problemas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni detalles de la arquitectura de atención (tipo de positional encoding, uso de GQA, etc.).

El componente diferencial es el *abliteration* realizado por Huihui-AI sobre las capas 2 a 52, que elimina direcciones de activación asociadas a rechazos, de modo que el modelo no declina peticiones sobre ciberseguridad, ingeniería inversa o análisis de código potencialmente sensible. La cuantización VAL-APEX-I (Vector-calibrated Asymmetric Layer-wise Outlier-preserving Recurrent-aware Unified Matrix-quantization) es una asignación tensor a tensor con 866 tensores auditados y documentados en un `tensor-map.tsv`, calibrada con matrices de imatrix de varios millones de tokens. No hay innovaciones de decodificación especulativa ni atención lineal declaradas.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento (EfficientThink), con menor verbosidad de razonamiento que el modelo base sin EfficientThink.
- Generación y edición de código en múltiples lenguajes, con especial énfasis en tareas de refactorización y depuración.
- Razonamiento agéntico: la model card incluye una plantilla de chat "hardened agentic" y parámetros de *reasoning effort*, lo que indica soporte para flujos de agente con múltiples pasos.
- Tool calling / function calling: etiquetado como `agentic` y `endpoints_compatible`; la plantilla de chat endurecida sugiere integración con herramientas, aunque no se detalla el esquema exacto.
- Multilingüismo en nueve idiomas: inglés, chino, español, francés, alemán, portugués, italiano, japonés y coreano.
- Modo "uncensored": ausencia de rechazos en prompts de ciberseguridad, análisis de binarios y reversing.
- Contexto largo de 256K tokens para ingestión de repositorios completos o documentación extensa.
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- **Análisis de seguridad ofensiva y reversing**: el abliterated permite solicitar análisis de binarios, explicación de shellcode o revisión de exploits sin rechazos, algo que los modelos alineados por defecto bloquean; el contexto de 256K permite cargar módulos completos o volcados extensos en una sola pasada.
- **Auditoría de código en pipelines CI/CD**: con tool calling y plantilla agéntica, el modelo puede integrarse como revisor automático que consulta el repositorio, ejecuta linters vía herramientas y propone parches; su tamaño de 12,18 GB permite desplegarlo en un runner con GPU de 16 GB.
- **Asistente de programación local en estación de trabajo**: cuantizado a 3,57 BPW cabe en GPUs de consumo de 12-16 GB, lo que habilita un copiloto de código sin enviar propiedad intelectual a APIs externas.
- **Migración y refactorización de bases de código grandes**: los 256K tokens de contexto permiten pasar varios ficheros relacionados y pedir refactorizaciones coherentes entre módulos, con razonamiento EfficientThink que reduce el coste de tokens de pensamiento.
- **Generación de documentación técnica multilingüe**: al cubrir es, fr, de, pt, it, ja y ko, puede producir documentación de API o guías de integración en el idioma del equipo a partir de código y comentarios en inglés.
- **Investigación en alineamiento y robustez**: el contraste entre el modelo base alineado y esta variante abliterated sirve para estudiar qué direcciones de activación codifican los rechazos y cómo afecta la cuantización agresiva a esa propiedad.
- **Formación y explicación de conceptos de ciberseguridad**: en entornos controlados, permite explicar técnicas de explotación y defensa sin las interrupciones típicas de los modelos censurados.

## Benchmarks y rendimiento

La model card menciona una sección de "Independent Community Benchmarks (NanoBench v0.4.0)" con evaluaciones multi-h, pero los resultados numéricos no están incluidos en la información proporcionada. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de comparaciones cuantitativas con otros modelos.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: 11,35 GiB solo para pesos en esta edición NanoPlus V3 (12,18 GB de archivo). Con caché KV para contexto largo, la demanda crece de forma apreciable; para 256K tokens hará falta offloading a RAM o GPU con mucha memoria.
- **GPU recomendadas**: RTX 4090 (24 GB) o RTX 4080/4070 Ti Super (16 GB) para contexto moderado; A100 40/80 GB o H100 para contexto completo y concurrencia. Con 12 GB (RTX 3060 12 GB, RTX 4070) cabe el modelo pero el contexto útil queda muy limitado.
- **Consumer GPU**: sí, en GPUs de 16 GB o más con contexto reducido; en 12 GB requiere cuantizaciones adicionales o descarga parcial de capas a CPU.
- **Despliegue**: llama.cpp es el runtime nativo del formato GGUF; también es compatible con Ollama, LM Studio y servidores basados en llama.cpp con API compatible con OpenAI (`endpoints_compatible`). No se distribuyen pesos safetensors ni hay soporte declarado para vLLM o TGI en esta publicación.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (NanoPlus V3) | ~27,3B | 256K | GGUF, 12,18 GB, 3,57 BPW | Apache 2.0 | Abliterated, EfficientThink, orientado a código |
| Huihui Coder390 EfficientThink — MiniPlus V3 (mismo autor) | ~27,3B | 256K | GGUF, 14,16 GB, 4,15 BPW | Apache 2.0 | Mayor precisión (Q6_K en atención y salidas); requiere ~13,19 GiB |
| Qwen3.8 27B Base — NanoPlus V3 (mismo autor) | ~27,3B | 256K | GGUF, 12,18 GB | Apache 2.0 | Variante estándar sin fine-tune de código ni abliteration |
| Swift-1.5 Qwen3.8 27B Uncensored MTP — NanoPlus V3 | ~27,3B | 256K | GGUF, 12,18 GB | Apache 2.0 | Variante uncensored con MTP (multi-token prediction) |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparación se limita a tamaño, formato y licencia.

## Limitaciones y advertencias

- **Modelo abliterated**: la eliminación de rechazos implica que el modelo puede producir contenido dañino, instrucciones de explotación o código malicioso sin filtro. Requiere controles de uso y evaluación de riesgo antes de exponerlo a usuarios finales.
- **Riesgo de alucinación**: como cualquier LLM de su tamaño, puede inventar APIs, funciones de librería o referencias; en código esto se traduce en imports inexistentes y firmas incorrectas. Verificación obligatoria en producción.
- **Cuantización agresiva**: con 3,57 BPW y suelo de 3 bits en MLP, es esperable cierta degradación frente al modelo en BF16, especialmente en tareas de razonamiento matemático y en contextos muy largos. El autor advierte de un problema específico de intercambio de caracteres en sintaxis de código si se aplica un *repeat penalty* elevado.
- **Contexto efectivo**: aunque se declaran 256K tokens, el rendimiento real a contextos muy largos no está validado con benchmarks en la información disponible, y la memoria necesaria para la caché KV puede hacerlo inviable en GPUs de consumo.
- **Idiomas**: el español está soportado, pero la calidad relativa frente al inglés y el chino no está medida; el entrenamiento parece centrado en código y en inglés/chino.
- **Procedencia del fine-tune**: la model card cita modelos de entrenamiento ("Opus 5.5", "GPT-6 Astra", "Grok 4.7", "DeepSeek V4 Pro") cuyas condiciones de uso podrían afectar a la distribución de datos derivados; conviene revisar las políticas de los proveedores si se usa comercialmente.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base y los datos de destilación pueden arrastrar obligaciones adicionales no detalladas.
- **Mantenimiento**: es una publicación de un tercero independiente (IsValorum), no del equipo de Qwen; la trazabilidad de la cuantización depende de la documentación del autor (866 tensores auditados en `tensor-map.tsv`).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-VAL-APEX-I-NanoPlus-V3-GGUF)
- [Modelo base: huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated)
- [Edición MiniPlus V3 (14,16 GB)](https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-VAL-APEX-I-MiniPlus-V3-GGUF)
- [Qwen3.8 27B Base — MiniPlus V3](https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF)
- [Qwen3.8 27B Base — NanoPlus V3](https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF)
- [Swift-1.5 Qwen3.8 27B Uncensored MTP — MiniPlus V3](https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF)
- [Swift-1.5 Qwen3.8 27B Uncensored MTP — NanoPlus V3](https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF)
- [Colección MiniPlus Abliterated 27B](https://huggingface.co/collections/IsValorum/val-apex-miniplus-abliterated-27b-6acfec541ee5628d2632c663)
- [Colección MiniPlus Standard 27B](https://huggingface.co/collections/IsValorum/val-apex-miniplus-standard-27b-6acfec54ca4ce4cf5cd5bdb6)
- [Colección NanoPlus Abliterated 27B](https://huggingface.co/collections/IsValorum/val-apex-nanoplus-abliterated-27b-6acfec5503f6e74218f71f64)
- [Colección NanoPlus Standard 27B](https://huggingface.co/collections/IsValorum/val-apex-nanoplus-standard-27b-6acfec55c1c99e2a23ebbd9b)
- [Apoyo al autor (Ko-fi)](https://ko-fi.com/isvalorum)
