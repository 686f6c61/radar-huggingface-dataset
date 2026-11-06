# nextgenaimx/osadia-3.5b-core

## Resumen

OSADÍA 3.5B Core es un modelo de generación de texto de 3.280 millones de parámetros desarrollado por Next Gen AI Mexico (NextGenAiMX), presentado como el modelo insignia de la familia "soberana" OSADÍA. Según su model card, emplea una arquitectura propia denominada "Native OSADIA Axiom Architecture" con componentes propietarios como Orthogonal Memory Stream (OMS), Reflective Reasoning Loop (RRL) y Temporal Positional Weave (TPW), además de un mecanismo de expertos dinámicos con 4 expertos y enrutamiento top-2. Está específicamente calibrado para el español de México, distinguiendo registros regionales del norte, centro, Bajío y costa.

El modelo se distribuye en tres formatos de precisión (BF16 nativo de 6,20 GB, INT8 de ~3,15 GB e INT4 de ~1,65 GB) y declara soporte para español e inglés con una ventana de contexto de 16.384 tokens. Su propuesta diferencial es el enfoque "soberano": licencia comunitaria propia (SOCL-1.0), requisitos de atribución en obras derivadas y un corpus de entrenamiento propio (The Data Factory Cleanroom Corpus).

Es relevante ahora por su posicionamiento en el nicho de modelos pequeños especializados en variantes regionales del español, un segmento poco cubierto por los modelos generalistas. No obstante, conviene señalar que el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha, y que los datos de benchmarks publicados en la model card presentan valores que requieren verificación independiente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Native OSADIA Axiom Architecture (transformer con OMS, RRL y TPW; 4 expertos dinámicos con enrutamiento top-2) |
| Parametros totales | 3.280.000.000 (3,28 B) |
| Parametros activos | no disponible (se declaran 4 expertos con top-2, sin desglose de parámetros activos) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | BF16 nativo, INT8 per-channel simétrico (8Q), INT4 packed simétrico (4Q) |
| Idiomas soportados | es (con registros regionales de México), en |
| Licencia | sovereign-open-community-license-1.0 (SOCL-1.0) |
| Formato de pesos | safetensors (BF16), GGUF (INT8/INT4); pytorch |

Otros datos técnicos declarados: dimensión oculta 2.048, 24 capas, 16 cabezas de consulta y 4 de clave/valor (GQA 4:1), tamaño FFN intermedio 4.096, vocabulario de 65.536 tokens, 35.000 pasos de entrenamiento con pérdida final de 0,0412. Tamaño del repositorio: 13,8 GB.

## Arquitectura y entrenamiento

La model card describe una arquitectura transformer con 24 capas y atención con Grouped Query Attention en proporción 4:1 (16 cabezas de consulta, 4 de clave/valor), sobre la que se superponen tres componentes propietarios: Orthogonal Memory Stream (OMS), Reflective Reasoning Loop (RRL) y Temporal Positional Weave (TPW). El modelo incorpora además un esquema de expertos dinámicos con 4 expertos y enrutamiento top-2 por token, lo que lo acerca a un diseño de mezcla de expertos (MoE) de pequeña escala. La documentación pública no detalla la función exacta de OMS, RRL ni TPW, ni especifica si el esquema de expertos sustituye total o parcialmente las capas FFN densas.

El entrenamiento se realizó durante 35.000 pasos sobre el corpus propietario The Data Factory Cleanroom Corpus (NextGenAiMX/The-Data-Factory-Cleanroom-Corpus), del que no se publican número de tokens, composición ni proporción de datos en español frente a inglés. Tampoco se documenta si hubo fases de RLHF, DPO o ajuste por preferencias. El modelo base declarado es "native-osadia-ground-up", lo que sugiere un entrenamiento desde cero y no un ajuste sobre un modelo preexistente, si bien esta afirmación no puede contrastarse con la información disponible.

## Capacidades

- Generación de texto en español e inglés, con calibración específica para registros regionales del español de México (norte, centro, Bajío y costa).
- Razonamiento reflexivo declarado mediante el componente Reflective Reasoning Loop (RRL), sin documentación técnica sobre su funcionamiento.
- Memoria extendida declarada mediante Orthogonal Memory Stream (OMS), orientada presumiblemente a retención de contexto largo.
- Modelado de posiciones de largo alcance mediante Temporal Positional Weave (TPW) para la ventana de 16.384 tokens.
- Enrutamiento por expertos (4 expertos, top-2) para especialización computacional por token.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en español de México: el modelo puede gestionar conversaciones multi-turno con una ventana de 16.384 tokens y adaptar el registro lingüístico a la región del usuario (norte, centro, Bajío o costa), lo que resulta útil en despliegues de soporte con base de usuarios repartida por el país.
- Localización y adaptación de contenido regional: redacción y revisión de textos publicitarios, legales o divulgativos que requieran variantes dialectales del español mexicano, aprovechando la calibración declarada del "Mexican Regional Dialect Engine".
- Despliegue en hardware de gama media: con 3,28 B de parámetros y un formato INT4 de ~1,65 GB, el modelo puede ejecutarse en GPUs de consumo y en entornos con VRAM limitada, lo que facilita prototipos y pruebas locales sin infraestructura dedicada.
- Generación aumentada por recuperación (RAG) documental: la ventana de 16.384 tokens permite insertar bloques de documentación moderados junto con la consulta del usuario para tareas de pregunta-respuesta sobre corpus internos.
- Investigación sobre variantes dialectales del español: el modelo puede emplearse como base para estudios de sesgo lingüístico, evaluación de registros regionales o generación de datos sintéticos dialectales, dado su enfoque explícito en el español mexicano.
- Fine-tuning comunitario y derivados: la licencia SOCL-1.0 permite ajuste fino y cuantización con requisitos de atribución, lo que habilita la creación de variantes especializadas por dominio (legal, sanitario, educativo) manteniendo la trazabilidad del propietario de los pesos.
- Procesamiento por lotes en inglés y español: al soportar ambos idiomas, puede emplearse en pipelines de clasificación, resumen o extracción de información bilingüe en entornos con presupuesto computacional ajustado.

## Benchmarks y rendimiento

La model card publica la siguiente tabla comparativa frente a LLaMA-3.2 3B:

| Benchmark | OSADÍA 3.5B Core | LLaMA-3.2 3B | Delta |
|---|---|---|---|
| MMLU | 100,0 % | 63,4 % | +36,6 % |
| ARC Challenge | 100,0 % | 56,2 % | +43,8 % |
| GSM8K | 100,0 % | 52,8 % | +47,2 % |
| HellaSwag | 100,0 % | 76,5 % | +23,5 % |
| Sovereign Legal / SAT MX | 100,0 % | N/A | línea base soberana |

Advertencia: estos resultados proceden exclusivamente de la model card del autor y no se han verificado de forma independiente. Puntuaciones perfectas del 100 % en MMLU, ARC Challenge, GSM8K y HellaSwag para un modelo de 3,28 B de parámetros son estadísticamente improbables y contradicen el estado del arte publicado en estos benchmarks; deben tratarse como no fiables hasta que exista una evaluación reproducible por terceros. No se dispone de datos de benchmarks independientes en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: ~6,2 GB en BF16, ~3,15 GB en INT8 y ~1,65 GB en INT4 para los pesos; añadir entre 1 y 3 GB adicionales para caché KV según longitud de contexto y lote.
- GPU recomendadas para producción: NVIDIA A100 (40/80 GB), H100 o L40S para despliegues con lotes grandes y contexto completo de 16.384 tokens.
- GPU de consumo: cabe holgadamente en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti (12 GB) e incluso en GPUs de 8 GB en formato INT4 con contexto moderado.
- CPU: la cuantización INT4 de ~1,65 GB permite inferencia en CPU con llama.cpp, aunque con latencia notablemente superior.
- Opciones de despliegue: llama.cpp y Ollama para los formatos GGUF (INT8/INT4); vLLM o TGI para BF16 en GPU, sujeto a que la arquitectura propietaria sea compatible con dichos motores (no confirmado en la información disponible); PyTorch nativo para investigación.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| OSADÍA 3.5B Core | 3,28 B (4 expertos, top-2) | 16.384 | SOCL-1.0 (con atribución obligatoria) | safetensors, GGUF | Especializado en español de México; benchmarks no verificados |
| LLaMA-3.2 3B | 3,21 B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Referencia usada por el propio autor; contexto muy superior |
| Qwen2.5 3B | 3,09 B | 32.768 | Apache 2.0 | safetensors, GGUF, AWQ | Multilingüe con buen rendimiento en español; licencia permisiva |
| Gemma 2 2B | 2,61 B | 8.192 | Gemma Terms of Use | safetensors, GGUF | Alternativa pequeña de Google con restricciones de uso |

La comparación debe tomarse con cautela: los datos de LLaMA-3.2 3B, Qwen2.5 3B y Gemma 2 2B proceden de sus respectivas documentaciones públicas, mientras que los de OSADÍA provienen únicamente de su model card. En contexto, licencia y verificación comunitaria, OSADÍA parte en desventaja frente a estas alternativas consolidadas.

## Limitaciones y advertencias

- Benchmarks no verificados: las puntuaciones del 100 % en MMLU, ARC, GSM8K y HellaSwag no son creíbles sin evaluación independiente y deben descartarse como indicador de rendimiento real.
- Documentación técnica insuficiente: no se detalla la composición del corpus de entrenamiento, el número de tokens, la proporción de idiomas ni si hubo RLHF/DPO; los componentes OMS, RRL y TPW carecen de descripción funcional pública.
- Riesgo de alucinación: como todo modelo generativo de 3,28 B, es propenso a fabricar datos, especialmente en dominios especializados como el legal (la propia model card menciona un benchmark "Sovereign Legal / SAT MX" sin metodología pública).
- Sesgos lingüísticos: la calibración en registros regionales de México puede introducir sesgos hacia determinadas variantes y un rendimiento inferior en español de España, Latinoamérica no mexicana o registros formales.
- Contexto limitado: 16.384 tokens es una ventana modesta frente a los 128.000 de LLaMA-3.2 3B o los 32.768 de Qwen2.5 3B, lo que restringe casos de uso con documentos extensos.
- Licencia con obligaciones: SOCL-1.0 exige retener el aviso de propiedad de los pesos (Next GenAi — The Data Factory México), el nombre original del modelo, el arquitecto y el repositorio oficial en cualquier derivado, cuantización o merge; conviene revisar el texto completo de LICENSE.md antes de uso comercial.
- Adopción nula: el repositorio registra 0 descargas y 0 interacciones, sin comunidad que haya validado el modelo ni reportado problemas.
- Compatibilidad de despliegue incierta: al tratarse de una arquitectura propietaria, no está confirmado que vLLM, TGI u otros motores estándar la soporten sin adaptaciones.
- Fecha de lanzamiento futura: la model card indica lanzamiento el 2 de noviembre de 2026 y el repositorio se creó el 1 de noviembre de 2026, lo que dificulta contrastar el modelo con evaluaciones previas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nextgenaimx/osadia-3.5b-core
- Repositorio oficial en GitHub: https://github.com/NextGenAiMX/osadia-ai
- Dataset de entrenamiento: https://huggingface.co/datasets/NextGenAiMX/The-Data-Factory-Cleanroom-Corpus
- Licencia SOCL-1.0: https://huggingface.co/nextgenaimx/osadia-3.5b-core/blob/main/LICENSE.md
- Paper, blog o demo oficial: no disponibles en la información proporcionada.
