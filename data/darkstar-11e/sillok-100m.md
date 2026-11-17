# darkstar-11e/sillok-100m

## Resumen

sillok-100m es un modelo de lenguaje causal (decoder-only) especializado en chino clásico y coreano histórico, entrenado integramente sobre el corpus del *Annals of the Joseon Dynasty* (조선왕조실록), la crónica oficial de la dinastía Joseon compilada por la Oficina de Historiografía del estado coreano. Lo desarrolla Gyungmin Jo (조경민) en el Digital Humanities Lab del Academy of Korean Studies (AKS-DHLAB) y se distribuye bajo licencia Apache 2.0. El modelo resuelve un problema muy concreto: la generación y restauración de texto historiográfico en hanja (chino clásico usado en Corea) con estructura documental estricta, algo que los modelos generalistas no cubren con fidelidad estilística ni de formato.

La arquitectura sigue el patrón LLaMA-3 (transformer decoder-only con RoPE, GQA, SwiGLU y RMSNorm) con 125.848.320 parámetros reales según los pesos en safetensors (la model card indica 100,7M, discrepancia que conviene tener en cuenta). El entrenamiento cubrió 30 tipos de anales, 381.701 artículos y 67,7 millones de caracteres en chino clásico, con 4.400 pasos (~12,1 épocas, unos 760 millones de tokens procesados). La pérdida de validación óptima reportada es 2,9128 (perplejidad 18,41, top-1 accuracy 48,71%).

Su relevancia actual es de nicho pero clara: ofrece un modelo pequeño, desplegable en hardware modesto, con tokenizador BPE de 32.768 entradas adaptado a hanja y hangul, y con tokens especiales que codifican la estructura bibliográfica de los anales (rey, fecha, tema, título, texto en hanja, comentario del historiador). Es una herramienta para humanidades digitales y filología coreana, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA-3 style decoder-only Transformer (RoPE, GQA, SwiGLU, RMSNorm) |
| Parametros totales | 125.848.320 (según safetensors); la model card declara 100.682.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea float16) |
| Idiomas soportados | ko (coreano), lzh (chino clásico / hanja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only al estilo LLaMA-3, con atención de consultas agrupadas (GQA), embeddings posicionales rotatorios (RoPE), activación SwiGLU y normalización RMSNorm. El tokenizador es un BPE a nivel de byte (SentencePiece) con vocabulario de 32.768 entradas, diseñado específicamente para caracteres hanja y hangul de textos históricos, lo que reduce la fragmentación típica de los tokenizadores generalistas sobre chino clásico.

El corpus de entrenamiento es el XML íntegro del *Sillok* publicado por el Instituto Nacional de Historia de Corea (국사편찬위원회): 30 tipos de anales, 381.701 artículos y 67,7 millones de caracteres en hanja. El entrenamiento se ejecutó durante 4.400 pasos, equivalentes a unas 12,1 épocas y aproximadamente 760 millones de tokens. No se documenta en la información disponible el uso de RLHF, DPO ni fases de alineación posteriores al preentrenamiento supervisado. La innovación principal no es arquitectónica sino de dominio: la definición de un conjunto de tokens especiales (`<|king|>`, `<|date|>`, `<|subject|>`, `<|title|>`, `<|hanja|>`, `<|ko|>`, `<|postscript|>`) que reproducen la estructura bibliográfica de los anales y permiten condicionar la generación por reinado, fecha, tema y tipo de sección.

## Capacidades

- Generación de texto en chino clásico (hanja) con estilo historiográfico de los anales de Joseon.
- Restauración e imputación de pasajes dañados o perdidos de artículos de los anales.
- Generación de texto condicionada por rey y año de reinado, con imitación de estilo por época.
- Generación de fechas en el sistema de ciclos sexagenarios (간지, ganji) coherentes con el contexto.
- Generación de comentarios del historiador (사론) mediante el token `<|postscript|>`.
- Clasificación temática en 12 categorías históricas (política, asuntos de estado, diplomacia, militar, astronomía, etc.) mediante `<|subject|>`.
- Producción de texto en coreano (`<|ko|>`) asociado a los artículos.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio.
- Capacidad multilingüe limitada a coreano y chino clásico; no cubre coreano moderno ni chino moderno de forma fiable.

## Casos de uso

- Restauración de lagunas documentales: dado un artículo del *Sillok* con fragmentos corruptos, el modelo completa el texto en hanja coherente con el reinado, la fecha y el tema declarados en los tokens de control, útil para proyectos de edición crítica digital.
- Generación de comentarios historiográficos: investigadores que estudian la retórica de los 사관 pueden generar comentarios sintéticos con `<|postscript|>` para comparar patrones estilísticos entre reinados.
- Análisis estilométrico por reinado: el condicionamiento por `<|king|>` y `<|date|>` permite generar muestras controladas y contrastar hipótesis sobre evolución del estilo documental entre Taejo y Sunjong.
- Docencia de filología coreana: generación de ejemplos sintéticos de estructura de anales para enseñar la organización bibliográfica de las crónicas sin depender de transcripciones manuales.
- Aumento de datos para NLP histórico: producir variantes sintéticas de artículos para entrenar o evaluar modelos de NER, segmentación o traducción sobre corpus históricos coreanos.
- Prototipado de asistentes de archivo histórico: integrado en una interfaz de consulta, el modelo puede sugerir continuaciones plausibles de una entrada incompleta, siempre con revisión humana dado su tamaño reducido y su perplejidad de 18,41.
- Experimentación académica de bajo coste: con 125,8M de parámetros y pesos en safetensors de 0,3 GB, sirve como banco de pruebas para técnicas de ajuste fino sobre dominios de bajos recursos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Pérdida de validación óptima | 2,9128 |
| Perplejidad | 18,41 |
| Top-1 accuracy | 48,71% |
| Pasos de entrenamiento | 4.400 (~12,1 épocas, ~760M tokens) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes en coreano) en la información disponible.

## Requisitos de hardware

- Inferencia en float16: los pesos ocupan aproximadamente 0,25 GB, por lo que la VRAM necesaria es inferior a 1 GB incluyendo caché de atención y overhead del runtime.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU con llama.cpp u Ollama.
- GPU de datacenter (A100, H100) innecesarias para inferencia; solo tendrían sentido para reentrenamiento o ajuste fino a mayor escala.
- Despliegue: compatible con Hugging Face Transformers (ejemplo oficial con `AutoModelForCausalLM` y `device_map="auto"`); no se documenta soporte verificado de vLLM, TGI ni llama.cpp en la información disponible, aunque el formato safetensors y la arquitectura LLaMA-3 facilitan la conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| sillok-100m | 125,8M | no disponible | ko, lzh | Apache 2.0 | Chino clásico histórico coreano |
| Qwen2.5-0.5B | ~500M | 32.768 tokens (versión base) | multilingüe | Apache 2.0 | Propósito general |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | inglés principalmente | Apache 2.0 | Propósito general |
| Klue/RoBERTa coreano | ~110M | 512 tokens | ko | variable | Comprensión, no generación |

La comparación es asimétrica: sillok-100m es dos a diez veces menor que los modelos generalistas citados y no compite en benchmarks generales, pero ninguno de ellos está entrenado sobre el corpus del *Sillok* ni dispone de tokens de control bibliográfico equivalentes. Para tareas de generación en hanja histórico, los modelos generalistas producen texto estilísticamente inconsistente y fallan en el formato de los anales.

## Limitaciones y advertencias

- Tamaño reducido (125,8M) y perplejidad de 18,41: la calidad de generación es limitada y requiere revisión humana en cualquier uso serio.
- Riesgo alto de alucinación factual: puede generar artículos verosímiles pero históricamente falsos; no debe usarse como fuente de datos históricos sin verificación contra el corpus original.
- Contexto máximo no documentado, lo que impide planificar usos con entradas largas.
- Sesgos heredados del corpus: la crónica oficial refleja la perspectiva de la corte y de la Oficina de Historiografía, con la carga ideológica confuciana y de clase propia de la fuente.
- Cobertura lingüística restringida a coreano histórico y chino clásico; no es utilizable para coreano moderno ni para traducción general.
- Discrepancia entre los parámetros declarados en la model card (100,7M) y los reales en safetensors (125,8M); conviene verificar antes de integrar en pipelines.
- La licencia Apache 2.0 permite uso comercial con atribución, pero los datos de origen están sujetos a la licencia de tipo 1 de Gonggongnuri (공공누리 제1유형) del Instituto Nacional de Historia de Corea, lo que conviene revisar para usos comerciales del texto fuente.
- Sin datos publicados sobre cuantizaciones, latencia, throughput ni benchmarks estándar, lo que dificulta comparaciones objetivas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkstar-11e/sillok-100m
- Repositorio GitHub: https://github.com/tsarkr/sillok
- Corpus de origen (Instituto Nacional de Historia de Corea, 조선왕조실록): no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
