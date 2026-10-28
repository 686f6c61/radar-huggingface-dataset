# bcckfdn/cevher2-test-16-decay

## Resumen

cevher2-test-16-decay es un modelo de lenguaje de 1.513.546.496 parámetros (aproximadamente 1,51 B) desarrollado por el usuario bcckfdn y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un entrenamiento desde cero ("pretrained-from-scratch") sobre una arquitectura tipo Llama, concretamente la empleada por la familia SmolLM2, con 34 capas, dimensión oculta de 1792, 28 cabezas de consulta frente a 7 cabezas de clave/valor (GQA con ratio 4:1) y un vocabulario de 65.536 tokens. El modelo declara soporte para turco (tr) e inglés (en) y una ventana de contexto de 8192 tokens.

El problema que aborda es la creación de un modelo base de tamaño contenido y entrenado íntegramente desde cero para turco e inglés, lo que lo sitúa en la categoría de los modelos pequeños (por debajo de 2 B de parámetros) aptos para inferencia en hardware de consumo. Según la model card, el entrenamiento consumió 32.932 B tokens (del orden de 32.900 millones) y alcanzó una pérdida de validación de 2,7050, un valor coherente con un modelo en fase de preentrenamiento y no de ajuste fino supervisado.

Su relevancia actual es limitada y de carácter experimental: el nombre del repositorio incluye los términos "test" y "decay", el modelo acumula 0 descargas y 0 "likes" en el momento de la consulta y no se han publicado resultados de benchmarks ni detalles sobre la composición del corpus, el uso de RLHF/DPO o el proceso de limpieza de datos. Debe tratarse, por tanto, como un checkpoint de investigación para evaluar el estado de un pipeline de preentrenamiento propio, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (familia SmolLM2) |
| Parámetros totales | 1.513.546.496 (~1,51 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | No disponible: el autor no publica variantes GGUF, AWQ ni GPTQ; solo se distribuyen pesos safetensors convertibles a fp16/bf16, int8 y 4 bits con herramientas externas |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Capas | 34 |
| Dimensión oculta | 1792 |
| Cabezas de atención (Q / KV) | 28 / 7 (GQA, dimensión por cabeza de 64) |
| Tamaño de vocabulario | 65.536 tokens |
| Tokens de entrenamiento | 32.932 B (~32.900 millones) según la model card |
| Mejor pérdida de validación | 2,7050 |
| Tamaño del repositorio | 3,0 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con el diseño de Llama que popularizó la familia SmolLM2: 34 capas, 1792 dimensiones ocultas, atención con agrupación de cabezas (28 cabezas de consulta y 7 de clave/valor, es decir, cuatro consultas por cada par KV) y un vocabulario de 65.536 entradas. Con esa configuración, la dimensión por cabeza resulta de 64 (1792 / 28). La model card no detalla explícitamente los componentes internos (normalización, función de activación, codificación posicional ni el esquema de atención para contexto largo), aunque la pertenencia declarada a la familia Llama implica el uso de las piezas habituales de esta arquitectura. El modelo se ha entrenado desde cero, sin inicialización a partir de pesos preexistentes, según la etiqueta "pretrained-from-scratch".

El volumen de entrenamiento declarado es de 32.932 B tokens con una pérdida de validación final de 2,7050, lo que equivale aproximadamente a una perplejidad de 15,0 (e^2,705). No hay información sobre la composición del corpus (proporción turco/inglés, fuentes web, código, matemáticas), sobre el uso de ajuste supervisado, RLHF o DPO, ni sobre la estrategia de entrenamiento de contexto largo. La etiqueta "conversational" aparece en los metadatos del repositorio, pero la model card no documenta ninguna plantilla de chat ni un conjunto de instrucciones asociado, por lo que no puede confirmarse que exista un ajuste conversacional real.

## Capacidades

- Generación de texto autoregresiva en turco e inglés, como modelo de lenguaje base.
- Continuación y finalización de texto a partir de un contexto de hasta 8192 tokens.
- Comprensión y generación en dos idiomas únicamente; no se declaran otros.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modos de pensamiento ("thinking").
- No se documenta capacidad de visión, audio ni multimodalidad.
- No se documenta un modo de instrucciones o chat verificado; la etiqueta "conversational" no va acompañada de plantilla ni de ejemplos en la model card.
- Integración estándar con el ecosistema transformers (`AutoModelForCausalLM` y `AutoTokenizer`), y compatibilidad declarada con text-generation-inference y endpoints compatibles.

## Casos de uso

- Evaluación de pipelines de preentrenamiento propios: sirve como referencia para comprobar la curva de pérdida (2,7050 de validación) y validar decisiones de tokenización, tamaño de lote y decaimiento de la tasa de aprendizaje en un corpus turco-inglés.
- Generación de texto en turco para prototipos: al estar entrenado desde cero con vocabulario de 65.536 tokens, puede emplearse en tareas de continuación de texto y generación de borradores en turco, con revisión humana obligatoria.
- Experimentos académicos de comparación de arquitecturas: su configuración (34 capas, 1792 ocultas, GQA 28/7) permite estudiar el efecto del escalado y de la agrupación de cabezas en modelos de ~1,5 B con recursos limitados.
- Síntesis de datos para aumento de corpus: con la debida supervisión, puede generar texto sintético en turco para aumentar conjuntos de entrenamiento de modelos menores o para tareas de clasificación posteriores.
- Investigación sobre sesgos y calidad lingüística en turco: al ser un modelo entrenado desde cero, es un sujeto útil para medir qué sesgos introduce un corpus mixto tr/en en un modelo pequeño.
- Prototipado rápido en local: con cuantización de 4 bits ocupa menos de 1 GB de VRAM, por lo que permite probar pipelines de inferencia en un portátil o en una GPU de gama media antes de escalar a modelos mayores.
- Evaluación de robustez y alucinación: útil como caso base de modelo infraentrenado para calibrar métricas de detección de alucinaciones en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo de rendimiento que aporta la model card es la mejor pérdida de validación (2,7050, equivalente a una perplejidad aproximada de 15,0). No hay resultados de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de evaluaciones multilingües en turco.

## Requisitos de hardware

- Pesos en fp16/bf16: aproximadamente 3,0 GB (1,51 B de parámetros × 2 bytes), coherente con el tamaño del repositorio de 3,0 GB.
- Pesos en int8: aproximadamente 1,5 GB.
- Pesos en 4 bits: aproximadamente 0,8-0,9 GB.
- Caché KV con contexto completo de 8192 tokens: unos 61 KB por token en fp16 (34 capas × 7 cabezas KV × 64 dimensiones × 2 tensores), es decir, alrededor de 0,5 GB adicionales.
- VRAM total estimada: ~3,5 GB en fp16 con contexto completo; ~1,3-1,5 GB con cuantización de 4 bits y contexto completo.
- Cabe en GPU de consumo: sí. Funciona en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) incluso en fp16 con contexto moderado, y en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) con contexto completo. En 4 bits cabe en GPUs de 4-6 GB.
- GPU de centro de datos: A100, H100 y L40S son sobredimensionadas para este tamaño; resultan útiles para servir muchas réplicas o lotes grandes.
- Opciones de despliegue: transformers (vía `AutoModelForCausalLM`), text-generation-inference (etiqueta declarada), vLLM, y llama.cpp/Ollama tras convertir los pesos safetensors a GGUF (conversión no publicada por el autor).
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| cevher2-test-16-decay | ~1,51 B | 8192 | tr, en | Apache 2.0 | Experimental, 0 descargas, sin benchmarks |
| SmolLM2-1.7B (HuggingFaceTB) | ~1,71 B | 8192 | principalemente en, con soporte multilingüe | Apache 2.0 | Publicado con model card e informe técnico |
| Qwen2.5-1.5B | ~1,54 B | 32.768 (extensible con YaRN) | multilingüe (incluye en, zh y otros) | Apache 2.0 | Publicado con benchmarks |
| Llama 3.2 1B | ~1,24 B | 128.000 | multilingüe (8 idiomas declarados) | Licencia comunitaria de Llama 3.2 | Publicado con benchmarks |
| TinyLlama-1.1B | ~1,1 B | 2048 | en (mayoritariamente) | Apache 2.0 | Publicado con benchmarks |

La comparación se limita a parámetros, contexto y licencia: no existen datos de rendimiento publicados de cevher2-test-16-decay que permitan confrontar MMLU, HumanEval o GSM8K con las alternativas. En cobertura idiomática, el modelo se centra en turco, un nicho que ninguno de los modelos citados trata como idioma principal.

## Limitaciones y advertencias

- Modelo experimental: el nombre del repositorio incluye "test" y "decay"; no hay garantía de que el checkpoint corresponda a un entrenamiento finalizado ni de que el tokenizador sea el definitivo.
- Ausencia total de benchmarks publicados: no es posible estimar su calidad frente a alternativas de tamaño similar.
- Sin evidencia de ajuste por instrucciones ni de alineación (RLHF/DPO): es previsible que no siga instrucciones de forma fiable y que requiera prompts de continuación.
- Riesgo elevado de alucinación y de texto incoherente, especialmente más allá de longitudes moderadas, dado el volumen de entrenamiento (~32.900 millones de tokens) y la pérdida de validación de 2,7050.
- Contexto declarado de 8192 tokens sin documentación de la estrategia de extensión: la calidad más allá de la longitud vista con más frecuencia durante el preentrenamiento no está garantizada.
- Cobertura idiomática limitada a turco e inglés; el rendimiento en castellano no está soportado ni evaluado.
- Sesgos desconocidos: no se documenta la composición del corpus ni los filtros aplicados, por lo que no puede evaluarse el sesgo de género, religioso o político.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el modelo se distribuye "tal cual", sin garantías ni soporte del autor.
- Sin comunidad ni mantenimiento: 0 descargas y 0 "likes" en el momento de la consulta, actualización única el mismo día de la creación; no cabe esperar correcciones ni soporte.
- No usar en producción sin una evaluación previa propia, incluida una medición de toxicidad y de precisión factual en el dominio objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/bcckfdn/cevher2-test-16-decay
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados a este modelo en la información disponible.
