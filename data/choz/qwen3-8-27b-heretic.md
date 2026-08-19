# choz/Qwen3.8-27B-heretic

## Resumen

`choz/Qwen3.8-27B-heretic` es una versión desensurada (decensored) del modelo Qwen3.8-27B de Alibaba, obtenida mediante el proceso de abliteración implementado en la herramienta Heretic v1.4.0. El autor, choz, ha aplicado esta técnica para eliminar los mecanismos de rechazo y censura del modelo original, manteniendo una divergencia KL de 0.0002 respecto al modelo base, lo que indica una alteración mínima de las distribuciones de salida.

El modelo base Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, diseñado para tareas de comprensión de imágenes y vídeo además de texto. Cuenta con 27.356.728.560 parámetros (27,36 mil millones), una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con Gated Attention, y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. La versión heretic hereda todas estas capacidades, pero con los mecanismos de rechazo atenuados.

La relevancia de este modelo radica en que ofrece a desarrolladores e investigadores una alternativa sin restricciones de contenido para casos de uso donde la censura del modelo original supone un obstáculo, como la investigación en alineación, la generación creativa sin filtros o el estudio de los efectos de la abliteración en modelos de gran tamaño. No obstante, su uso conlleva riesgos importantes que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida: Gated DeltaNet (atención lineal) + Gated Attention |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin GGUF publicado) |
| Idiomas soportados | no disponible (no especificado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de 64 capas con una disposición interna de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y 1 sub-bloque de Gated Attention seguido de FFN. La Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. El FFN tiene una dimensión intermedia de 17.408. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación.

El entrenamiento del modelo base incluyó fases de pre-training y post-training, con datos que abarcan texto, imágenes y vídeo. La versión heretic se obtuvo aplicando abliteración con Heretic v1.4.0, un proceso que identifica y elimina las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo. Los parámetros de abliteración reportados incluyen un direction_index de 33.67, y ajustes en los pesos de `attn.o_proj` y `mlp.down_proj`. La evaluación posterior muestra una KL divergence de 0.0002 frente al modelo original y una tasa de rechazos de 82/100 (frente a 85/100 del original), lo que indica una reducción moderada de los rechazos con una alteración mínima del comportamiento general.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking mode) activado por defecto y configurable por petición mediante `reasoning_effort`.
- Comprensión de imágenes y vídeo de forma nativa, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución de tareas agénticas de largo horizonte, con planificación autónoma y manejo de feedback del entorno.
- Soporte de tool calling y function calling, integrable en pipelines de agentes y herramientas externas.
- Capacidad de retener contexto de razonamiento histórico mediante `preserve_thinking`, útil en conversaciones multi-turno.
- Compatibilidad con múltiples frameworks de inferencia: Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Al estar desensurado, no aplica rechazos sobre contenido considerado sensible o prohibido por el modelo original.

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo permite estudiar el impacto de la abliteración en el comportamiento de un LLM de 27B, comparando distribuciones de salida, tasas de rechazo y rendimiento en tareas estándar.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido artístico que el modelo original rechazaría por políticas de seguridad, manteniendo la calidad lingüística del Qwen3.8-27B.
- Análisis de documentos e imágenes en entornos regulados: al no rechazar contenido, puede procesar documentos técnicos, informes médicos o legales con terminología sensible sin interrupciones, siempre que el despliegue cumpla la normativa aplicable.
- Desarrollo de agentes autónomos para entornos simulados: su capacidad de razonamiento multi-paso y manejo de feedback lo hace adecuado para tareas de navegación web, uso de APIs y resolución de problemas en entornos de prueba.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletado, revisión de código y generación de tests, con la ventaja de no rechazar prompts que contengan vulnerabilidades o código ofensivo.
- Evaluación comparativa de modelos desensurados: sirve como referencia para medir el efecto de la abliteración en benchmarks de razonamiento, matemáticas y visión, frente a la versión original y otras variantes.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparando Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus y Muse Glimmer-30B, pero los valores numéricos no están disponibles en la información proporcionada (la tabla aparece truncada). Por tanto, no se pueden reportar resultados concretos de MMLU, HumanEval, GSM8K u otros benchmarks.

Sí se dispone de los datos de la evaluación de abliteración:

| Metrica | Modelo heretic | Modelo original |
|---|---|---|
| KL divergence | 0.0002 | 0 (por definicion) |
| Refusals (rechazos) | 82/100 | 85/100 |

Estos datos indican que la abliteración redujo ligeramente la tasa de rechazos (de 85 a 82 sobre 100) con una divergencia KL muy baja, lo que sugiere que el modelo conserva casi intactas sus capacidades generales.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB (27,36 B parámetros × 2 bytes), lo que requiere una GPU profesional como A100 80GB, H100 80GB o dos RTX 4090 en paralelo.
- Con cuantización a 8 bits: ~28-30 GB de VRAM, viable en una RTX 4090 (24 GB) con técnicas de offloading o en una A6000 (48 GB).
- Con cuantización a 4 bits: ~14-16 GB de VRAM, cabe en GPUs de consumo como RTX 3090, RTX 4090 o incluso RTX 4070 Ti con optimizaciones.
- No se han publicado pesos GGUF en el repositorio, por lo que para usar llama.cpp u Ollama sería necesario cuantizar los safetensors manualmente.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, todos compatibles con el formato safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware, la cuantización y el framework elegido.

## Comparativa con modelos similares

La tabla de benchmarks de la model card menciona tres alternativas, pero sin valores numéricos. A partir de la información disponible, se puede establecer la siguiente comparativa estructural:

| Modelo | Parametros | Contexto nativo | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,36 B | 262.144 | Sí | apache-2.0 | Modelo base con censura activa |
| Qwen3.8-27B-heretic | 27,36 B | 262.144 | Sí | apache-2.0 | Versión abliterada, rechazos reducidos |
| Qwen3.6-27B | 27 B (aprox.) | no disponible | no disponible | no disponible | Generación anterior de Qwen |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Modelo propietario de Qwen Cloud |
| Muse Glimmer-30B | 30 B (aprox.) | no disponible | no disponible | no disponible | Modelo de terceros, sin datos publicados |

No se dispone de datos de rendimiento comparativo fiables, por lo que no es posible posicionar el modelo frente a estas alternativas en términos de calidad.

## Limitaciones y advertencias

- Modelo desensurado: al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, ilegal, peligroso o éticamente cuestionable sin filtros. Su uso en producción debe contemplar salvaguardas externas.
- Riesgo de alucinación: como cualquier LLM, puede inventar hechos, citas o referencias, especialmente en dominios especializados. La abliteración no corrige este comportamiento.
- Idiomas no especificados: no se ha documentado qué idiomas soporta el modelo. Aunque Qwen3.8-27B es presumiblemente multilingüe, no hay confirmación oficial en la model card.
- La abliteración reduce los rechazos solo de 85/100 a 82/100, lo que sugiere que muchos comportamientos de rechazo persisten. No es un modelo completamente "uncensored" en la práctica.
- Licencia apache-2.0 declarada, pero el modelo base Qwen3.8-27B podría tener términos adicionales de uso comercial según la política de Qwen; se recomienda verificar antes de desplegar en entornos empresariales.
- Sin datos de benchmarks publicados: no se puede evaluar el rendimiento real frente a otros modelos de su categoría.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/choz/Qwen3.8-27B-heretic
- Proyecto Heretic: https://heretic-project.org
- Qwen Cloud (servicio oficial del modelo base): https://www.qwencloud.com
- Documentación de Qwen3.8-27B (Overview): https://www.qwencloud.com/models/qwen3.8-27b
