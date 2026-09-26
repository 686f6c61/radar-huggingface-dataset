# AIArchiveInfo/Muse-Glimmer-30B-assistant

## Resumen

Muse Glimmer es una familia de modelos de lenguaje publicada por Meta Superintelligence Lab (release de agosto de 2026) y orientada a tareas agénticas autónomas ejecutadas en hardware de consumo. El repositorio `AIArchiveInfo/Muse-Glimmer-30B-assistant` es un espejo de preservación byte a byte de `meta-models/Muse-Glimmer-30B-assistant` (revisión `e8192f3a8f61`), archivado el 25 de septiembre de 2026 por AIArchive: no se ha entrenado, ajustado ni alterado ningún peso, y la licencia original Apache 2.0 se mantiene de forma literal. El problema que resuelve es el de los agentes locales con uso fiable de herramientas, razonamiento multi-paso, recuperación de errores y comprensión multimodal, sin depender de infraestructura cloud.

La model card describe Muse Glimmer 30B como un transformer causal denso de ~29,6B parámetros con un encoder de percepción ViT-G/14 de ~1,8B, contexto de 131.072 tokens o más, atención con patrón `[Local, Local, Local, Global]` y ventana deslizante de 2048, además de un "drafter" de decodificación especulativa basado en DFlash (difusión por bloques de 16 tokens). Sin embargo, la propia model card indica que corresponde al modelo "drafter" ligero, y los pesos reales del repositorio suman 2.555.985.152 parámetros (~2,56B) en un repo de 5,1 GB, coherente con un bf16 de ~2,5B y no con un modelo de 30B.

Por tanto, esta ficha debe leerse con esa ambigüedad explícita: las cifras de arquitectura de 29,6B pertenecen al modelo principal descrito en el texto, mientras que el contenido verificable del espejo corresponde a ~2,56B parámetros. Es relevante ahora porque combina tres piezas poco habituales en un mismo paquete: multimodalidad de entrada, agenticidad de extremo a extremo y cuantización a ~4 bits con una degradación declarada de solo el 0,2% en 15 benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (modelo principal) con encoder de percepción ViT-G/14; companion "drafter" de difusión por bloques DFlash |
| Parámetros totales | 29,6B según la model card (incluyendo encoder visual); 2.555.985.152 (~2,56B) según los safetensors del repositorio |
| Parámetros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantización | Full precision (bf16), K-Quant-Dynamic (~32 GB VRAM objetivo), K-Quant-17GB (~24 GB VRAM objetivo) |
| Idiomas soportados | más de 100 idiomas durante el entrenamiento; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería declarada | transformers |
| Pipeline | image-text-to-text |
| Dimensión oculta | 6656 |
| Número de capas | 52 |
| Patrón de atención | [Local, Local, Local, Global] repetido; ventana deslizante de 2048 |
| Atención con compuerta (gated attention) | sí |
| Cabezas de atención (Q / KV) | 32 / 2 (GQA, ratio 16:1) |
| Dimensión de cabeza | 128 |
| Tipo de FFN | SwiGLU, dimensión intermedia 19.968 |
| Codificación posicional | RoPE (θ = 500.000), solo en capas locales |
| Encoder de percepción | ViT-G/14 de ~1,8B parámetros, 50 capas, ancho 1536, patch 14 |
| Vocabulario | 202.048 (200.000 tokens BPE + 2.048 especiales) |
| Tokens visuales máximos por imagen | 4.096 |
| Modalidades | entrada: texto + imagen; salida: texto |
| Fecha de corte de conocimiento | 4 de enero de 2026 |
| Fecha de publicación | agosto de 2026 (modelo original); espejo archivado el 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo principal es un transformer causal denso de 52 capas con dimensión oculta 6656 y FFN SwiGLU de dimensión intermedia 19.968. La atención alterna capas locales y globales con el patrón `[Local, Local, Local, Global]`, ventana deslizante de 2048 y GQA con ratio 16:1 (32 cabezas de consulta frente a 2 de clave/valor, dimensión de cabeza 128). El RoPE con θ = 500.000 se aplica únicamente en las capas locales. La percepción visual se delega en un encoder ViT-G/14 de ~1,8B parámetros, 50 capas, ancho 1536 y patch de 14, que acepta hasta 4096 tokens visuales por imagen y permite entradas intercaladas de texto e imagen con salida exclusivamente textual. El companion de decodificación especulativa usa DFlash, un modelo de difusión por bloques que propone 16 tokens en un único forward pass y cuya salida verifica el modelo principal en paralelo, aceptando los tokens correctos y corrigiendo el resto sin alterar la calidad de salida.

Sobre el entrenamiento, la model card solo indica que los datos son contenido multimodal de fuentes públicas, datos proporcionados por terceros e información procedente de productos y servicios de Meta, curados y enriquecidos por redes de proveedores externos y personal de Meta. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; el modelo se describe como destilado a partir de Muse Spark. Tampoco se detallan innovaciones adicionales más allá del patrón de atención híbrido local/global, la atención con compuerta, el encoder de percepción dedicado y el esquema de decodificación especulativa por difusión de bloques.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Ejecución de tareas agénticas de extremo a extremo: finalización de tareas completas dentro de scaffolds, depuración de código y resolución de peticiones multi-turno.
- Uso fiable de herramientas y function calling, invocando funciones con esquemas precisos a lo largo de flujos prolongados.
- Recuperación de fallos: ante un error de herramienta o un resultado inesperado, diagnostica el problema y reintenta en lugar de detenerse.
- Entrada y razonamiento multimodal: interpreta capturas de pantalla, gráficos y documentos junto con la conversación mediante el encoder de percepción.
- Compatibilidad con scaffolds de orquestación agéntica como OpenClaw y Hermes Agent.
- Esfuerzo controlable: permite seleccionar distintos niveles de razonamiento para equilibrar calidad y velocidad.
- Multilingüe: entrenado con datos de más de 100 idiomas.
- Decodificación especulativa integrada mediante el drafter DFlash (bloques de 16 tokens).
- No se menciona en la información disponible soporte de audio ni de vídeo, ni modo "thinking" explícito más allá del esfuerzo controlable.

## Casos de uso

- Automatización de flujos agénticos de principio a fin: el modelo puede recibir un objetivo en lenguaje natural y completarlo encadenando pasos, llamadas a herramientas y verificación de resultados, algo viable por su contexto de 131.072+ tokens y su entrenamiento específico en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench.
- Agentes de soporte técnico con acceso a herramientas: gestión de conversaciones multi-turno donde el modelo debe consultar APIs, leer documentación y reintentar cuando una llamada falla, aprovechando la capacidad de recuperación de fallos declarada.
- Resolución automática de incidencias de software: lectura de un repositorio, escritura y depuración de parches y ejecución de pruebas dentro de un scaffold, apoyándose en el entrenamiento sobre SWE-Bench y en el uso preciso de esquemas de funciones.
- Análisis de documentos y capturas: interpretación de gráficos, tablas y pantallas junto con instrucciones textuales gracias al encoder ViT-G/14 y a los 4096 tokens visuales por imagen, útil para auditoría de informes o extracción de datos de interfaces.
- Asistente local en portátiles o estaciones de trabajo con GPU de 24-32 GB: el modelo está diseñado para ejecutarse cuantizado a 4 bits en menos de 20 GB, lo que permite despliegues sin conectividad ni cloud en entornos con requisitos de confidencialidad.
- Orquestación multimodal en pipelines de datos: ingestión de capturas e imágenes intercaladas con texto para generar descripciones o decisiones estructuradas dentro de un sistema mayor.
- Atención al cliente multilingüe: con datos de entrenamiento en más de 100 idiomas, permite atender consultas en distintos idiomas manteniendo contexto largo de conversación.
- Generación de código asistida en IDE o CI/CD: integración mediante tool calling para proponer cambios, invocar linters o tests y corregir los fallos detectados de forma iterativa.

## Benchmarks y rendimiento

La información disponible menciona la evaluación en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench como benchmarks de tarea completa, y una media de precisión sobre 15 benchmarks comunes para medir la degradación por cuantización. No se publican cifras concretas de MMLU, HumanEval, GSM8K ni de ninguno de los benchmarks citados.

| Aspecto | Resultado reportado |
|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks estándar | no disponible |
| DeepSearch QA, MCP-Atlas, τ3-Bench, SWE-Bench | citados como métricas de evaluación, sin valores numéricos publicados |
| Degradación con cuantización K-Quant-Dynamic | 0,2% (media de precisión sobre 15 benchmarks comunes) |
| Degradación con cuantización K-Quant-17GB | 1,0% (media de precisión sobre 15 benchmarks comunes) |

## Requisitos de hardware

- Precisión completa: 64 GB de VRAM según la model card para el modelo de ~29,6B. Para el repositorio espejo de ~2,56B en bf16, los pesos ocupan aproximadamente 5,1 GB, por lo que la VRAM necesaria sería bastante menor (el dato concreto no está publicado).
- Cuantización K-Quant-Dynamic: hardware objetivo de 32 GB de VRAM, con 0,2% de degradación media.
- Cuantización K-Quant-17GB: hardware objetivo de 24 GB de VRAM, con 1,0% de degradación media.
- El modelo cuantizado a ~4 bits ocupa menos de 20 GB, dejando espacio para la caché KV, el encoder de percepción y el drafter de decodificación especulativa dentro de un presupuesto de 24 GB o 32 GB.
- GPU concretas recomendadas: no especificadas en la información disponible; los objetivos declarados son envelopes de 24 GB, 32 GB y 64 GB de VRAM, lo que sitúa a GPUs de consumo de gama alta con 24 GB (por ejemplo, la clase RTX 4090) como candidatas para la variante K-Quant-17GB, y a GPUs profesionales de 32-64 GB para las variantes superiores.
- Opciones de despliegue: la librería declarada es transformers y el repositorio incluye la etiqueta `endpoints_compatible`; la model card no especifica soporte explícito para vLLM, llama.cpp, Ollama o TGI. La nomenclatura "K-Quant" es coherente con los formatos de cuantización habituales de llama.cpp, pero este extremo no se confirma en la documentación.
- Latencia y throughput: no disponibles en cifras. La model card solo afirma que la decodificación especulativa DFlash permite generar "significativamente más rápido" que la generación token a token, con calidad de salida idéntica.

## Comparativa con modelos similares

La información proporcionada no incluye datos de comparación con otros modelos. La model card no cita alternativas ni ofrece tablas comparativas, y los benchmarks mencionados aparecen sin valores numéricos, por lo que no es posible establecer una comparación rigurosa sin inventar cifras.

| Modelo | Parámetros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| Muse Glimmer (este repositorio, espejo) | 2,56B según safetensors; 29,6B según model card | 131.072+ tokens | Apache 2.0 | solo degradación por cuantización (0,2% / 1,0%) |
| Alternativas de la misma categoría (agentes multimodales de ~30B) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambigüedad de identidad del repositorio: la model card describe Muse Glimmer 30B (~29,6B) pero también afirma ser la ficha del "drafter" ligero, mientras que los safetensors suman 2.555.985.152 parámetros. Antes de usar los pesos hay que verificar qué componente se está descargando realmente.
- Es un espejo de preservación sin modificaciones: no hay garantía de soporte, mantenimiento ni actualizaciones por parte del archivo; la responsabilidad técnica recae en el repositorio original.
- No se publican resultados de benchmarks con cifras, solo la degradación por cuantización, por lo que no es posible validar de forma independiente las afirmaciones de rendimiento agéntico.
- Riesgo de alucinación: no cuantificado en la documentación disponible; es un riesgo inherente a los modelos de lenguaje, especialmente en uso de herramientas con esquemas, donde una llamada mal formada puede propagar errores.
- Sesgos: la model card no incluye ninguna sección de sesgos, evaluación de riesgos o limitaciones de seguridad. Los datos de entrenamiento provienen de fuentes públicas, de terceros y de productos y servicios de Meta, lo que puede introducir sesgos no documentados.
- Cobertura de idiomas: se declaran más de 100 idiomas en el entrenamiento, pero no se especifica la lista ni la calidad relativa por idioma; el rendimiento en idiomas distintos del inglés no está cuantificado.
- Límite de contexto: aunque se declaran 131.072+ tokens, no se detalla la degradación de rendimiento en la parte alta de la ventana ni el coste de la caché KV en ese régimen.
- Capacidad de entrada limitada: solo acepta texto e imagen y produce texto; no hay soporte declarado de audio, vídeo u otras modalidades de salida.
- Licencia Apache 2.0, permisiva para uso comercial, siempre que se conserve el aviso de licencia y atribución; conviene revisar los términos de uso aceptable del modelo original, que no se reproducen en la información disponible.
- Fechas: el corte de conocimiento es el 4 de enero de 2026, por lo que el modelo no conoce información posterior.
- El paquete de cuantización a 4 bits se declara con degradación mínima, pero la validación indicada corresponde a 15 benchmarks internos, no a una evaluación externa reproducible.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/AIArchiveInfo/Muse-Glimmer-30B-assistant
- Modelo original: https://huggingface.co/meta-models/Muse-Glimmer-30B-assistant
- Revisión archivada del original: https://huggingface.co/meta-models/Muse-Glimmer-30B-assistant/tree/e8192f3a8f617f74be2ce220360c89ef4789f39f
- Paper del encoder de percepción (arXiv:2504.13181): https://arxiv.org/abs/2504.13181
- Paper de DFlash (arXiv:2602.06036): https://arxiv.org/abs/2602.06036
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Otros enlaces (páginas de OpenClaw, Hermes Agent, demos o repositorios adicionales): no disponibles en la información proporcionada.
