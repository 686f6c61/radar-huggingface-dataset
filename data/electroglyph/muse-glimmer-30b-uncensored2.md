# electroglyph/Muse-Glimmer-30B-uncensored2

## Resumen

Muse-Glimmer-30B-uncensored2 es un ajuste fino del modelo multimodal Muse-Glimmer-30B de Meta Superintelligence Lab, publicado por el usuario electroglyph bajo licencia Apache 2.0. Se trata de una variante "abliterated" o "decensored", generada con la herramienta Heretic v2.2.0.dev0, cuyo objetivo es eliminar los mecanismos de rechazo (refusals) del modelo original sin reentrenar los pesos desde cero. El modelo base es un transformer causal denso de aproximadamente 29,6 mil millones de parámetros con un codificador de percepción visual de unos 1,8 mil millones de parámetros, diseñado específicamente para tareas agénticas autónomas en hardware de consumo.

La relevancia de esta ficha radica en dos aspectos. Por un lado, documenta un modelo multimodal de 30B con ventana de contexto superior a 131.000 tokens, atención híbrida local/global, GQA con ratio 16:1 y decodificación especulativa mediante un drafter basado en DFlash. Por otro, ilustra una técnica de modificación de comportamiento (Arbitrary-Rank Ablation) que reduce drásticamente las negativas del modelo —de 98/100 a 7/100— con una divergencia KL de solo 0,0454 respecto al original, un compromiso relevante para quienes evalúan la estabilidad de los ajustes de alineación.

El modelo conserva las capacidades del original: razonamiento multi-paso, uso fiable de herramientas, recuperación ante fallos, comprensión de imágenes intercaladas con texto y soporte de más de 100 idiomas. Su orientación a despliegue local, con cuantización a 4 bits que lo sitúa por debajo de 20 GB, lo hace especialmente interesante para entornos sin infraestructura cloud.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de percepción (ViT-G/14) |
| Parámetros totales | 29.776.626.864 (~29,6B, incluye codificador visual de ~1,8B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantización | Full precision (FP), K-Quant-Dynamic (~32 GB VRAM), K-Quant-17GB (~24 GB VRAM); pesos en safetensors |
| Idiomas soportados | Más de 100 idiomas (según model card del base); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Dimensión oculta | 6656 |
| Capas | 52 |
| Patrón de atención | [Local, Local, Local, Global] repetido; ventana deslizante de 2048 |
| Cabezas de atención (Q/KV) | 32 / 2 (GQA ratio 16:1) |
| Dimensión de cabeza | 128 |
| FFN | SwiGLU, dimensión intermedia 19.968 |
| Codificación posicional | RoPE (θ = 500.000), solo en capas locales |
| Vocabulario | 202.048 (200.000 BPE + 2.048 especiales) |
| Tokens visuales máximos por imagen | 4.096 |
| Modalidades | Entrada: texto + imagen; salida: texto |
| Fecha de corte de conocimiento | 4 de enero de 2026 |
| Tamaño del repositorio | 106,8 GB |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer causal denso con 52 capas y un patrón de atención híbrido que alterna tres capas locales (ventana deslizante de 2048 tokens) por cada capa global, lo que reduce el coste computacional del contexto largo. Emplea GQA con 32 cabezas de consulta y solo 2 de clave/valor (ratio 16:1), atención con compuertas (gated attention) y FFN SwiGLU con dimensión intermedia de 19.968. La codificación posicional RoPE con θ = 500.000 se aplica únicamente en las capas locales. El codificador de percepción es un ViT-G/14 de 50 capas, anchura 1536 y parches de 14 píxeles, con aproximadamente 1,8B de parámetros, que permite entradas intercaladas de texto e imagen.

Según la model card del base, el modelo fue destilado a partir de Muse Spark y entrenado con datos multimodales de fuentes públicas, datos de terceros e información de productos de Meta, con corte de conocimiento en enero de 2026. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO. El modelo incluye un drafter de decodificación especulativa basado en DFlash, que predice bloques de 16 tokens en una sola pasada y permite al modelo principal verificarlos en paralelo.

La variante uncensored2 aplica Arbitrary-Rank Ablation (ARA) con Heretic v2.2.0.dev0 sobre las capas 23 a 31, con los parámetros: `preserve_good_behavior_weight` 0,4989, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 1,4263, `neighbor_count` 12 y `loss_mode` relativo. El proceso es reproducible según el autor (directorio `reproduce/`).

## Capacidades

- Generación de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Comprensión multimodal de entrada: acepta texto e imágenes intercaladas (capturas de pantalla, gráficos, documentos) mediante el codificador de percepción.
- Uso fiable de herramientas y function calling con esquemas precisos a lo largo de flujos prolongados.
- Recuperación ante fallos: diagnostica errores de herramientas y reintenta en lugar de detenerse.
- Compatibilidad con scaffolds agénticos como OpenClaw y Hermes Agent.
- Esfuerzo de razonamiento controlable, para ajustar el equilibrio entre calidad y velocidad.
- Capacidades multilingües en más de 100 idiomas.
- Modo de decodificación especulativa con drafter DFlash para acelerar la generación.
- Comportamiento "decensored": reducción drástica de rechazos (7/100 frente a 98/100 del original).

## Casos de uso

- Agentes autónomos de resolución de tareas: el modelo puede ejecutar flujos completos de principio a fin (búsqueda profunda, resolución de incidencias, depuración de código) gracias a su razonamiento multi-paso y recuperación ante fallos, integrándose en scaffolds como OpenClaw o Hermes Agent.
- Automatización de soporte técnico con imágenes: al aceptar capturas de pantalla y documentos junto al texto, puede diagnosticar errores a partir de una imagen de la interfaz y proponer pasos concretos en conversaciones multi-turno de hasta 131.000 tokens.
- Generación y depuración de código en pipelines: su soporte de tool calling y su entrenamiento en SWE-Bench permiten integrarlo en flujos de CI/CD para analizar fallos, proponer parches y verificar resultados con herramientas externas.
- Análisis de documentos y gráficos: interpretación de tablas, diagramas y documentos escaneados combinada con razonamiento textual para extraer conclusiones y generar informes.
- Despliegue local en estaciones de trabajo: con cuantización K-Quant-17GB cabe en GPUs de 24 GB, lo que permite ejecutar un agente multimodal sin conexión ni infraestructura cloud.
- Asistentes de investigación multilingües: cobertura de más de 100 idiomas para resumir, traducir y sintetizar fuentes en distintos idiomas dentro de un mismo contexto largo.
- Evaluación de robustez de alineación: la variante uncensored sirve para estudiar cómo afecta la ablación ARA al comportamiento del modelo (refusals, divergencia KL) en entornos de investigación controlados.

## Benchmarks y rendimiento

La información disponible solo incluye métricas del proceso de ablación, no resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante.

| Métrica | Este modelo | Modelo original (Muse-Glimmer-30B) |
|---|---|---|
| Refusals | 7/100 | 98/100 |
| Divergencia KL | 0,0454 | 0 (por definición) |

| Configuración | Full Precision | K-Quant-Dynamic | K-Quant-17GB |
|---|---|---|---|
| Degradación (%) | — | 0,2% | 1,0% |
| Hardware objetivo | 64 GB VRAM | 32 GB VRAM | 24 GB VRAM |

La degradación se mide como media de precisión en 15 benchmarks comunes, según la model card del base. No se han publicado resultados de benchmarks estándar en la información disponible para esta variante.

## Requisitos de hardware

- VRAM estimada: 64 GB en precisión completa; unos 32 GB con K-Quant-Dynamic; unos 17-20 GB con K-Quant-17GB (deja espacio para KV cache, codificador visual y drafter en un envelope de 24 GB).
- GPU recomendadas: A100 80 GB o H100 para precisión completa; RTX 4090 (24 GB) o GPUs de 32 GB para las cuantizaciones K-Quant.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con K-Quant-17GB y en GPUs de 32 GB con K-Quant-Dynamic.
- Opciones de despliegue: transformers (librería declarada); compatible con endpoints; el ecosistema del base menciona despliegue local, aunque no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles de forma numérica; la decodificación especulativa con DFlash (bloques de 16 tokens) está diseñada para acelerar la generación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-uncensored2 | ~29,6B | 131.072+ | Sí (texto + imagen) | Apache 2.0 | Variante abliterated con Heretic; 7/100 refusals |
| Muse-Glimmer-30B (original) | ~29,6B | 131.072+ | Sí | Apache 2.0 | Modelo base alineado; 98/100 refusals |
| Alternativas de 30B densas | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de la misma categoría (mismo tamaño o misma tarea) más allá del modelo base.

## Limitaciones y advertencias

- La ablación elimina filtros de seguridad: el modelo puede generar contenido que el original rechazaría, con implicaciones legales y éticas según el uso.
- Riesgo de alucinación inherente a modelos de lenguaje; no se han publicado tasas de alucinación específicas.
- La reducción de refusals puede degradar la coherencia en dominios sensibles; la divergencia KL de 0,0454 indica cambios distribuidos no triviales.
- No se especifican los idiomas concretos soportados ni su calidad relativa; solo "más de 100 idiomas" según el base.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante decensored puede contravenir políticas de plataformas o normativas locales; conviene revisar el contexto de despliegue.
- El rendimiento en tareas agénticas se ha validado con cuantización, pero la degradación del 1,0% en K-Quant-17GB es una media sobre 15 benchmarks y puede variar por tarea.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; no hay validación comunitaria independiente.
- No se detallan datos de entrenamiento (tokens, composición, RLHF/DPO) del modelo base en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/electroglyph/Muse-Glimmer-30B-uncensored2
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Heretic: https://heretic-project.org
- Paper del codificador de percepción: https://arxiv.org/abs/2504.13181
- Paper de DFlash: https://arxiv.org/abs/2602.06036
- Paper adicional citado en tags: https://arxiv.org/abs/2610.24628
- Reproducibilidad: directorio `reproduce/README.md` dentro del repositorio de Hugging Face
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
