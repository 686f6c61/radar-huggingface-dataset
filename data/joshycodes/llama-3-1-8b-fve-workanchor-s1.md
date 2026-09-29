# joshycodes/llama-3.1-8b-fve-workanchor-s1

## Resumen

`joshycodes/llama-3.1-8b-fve-workanchor-s1` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct`. El autor, el usuario de HuggingFace `joshycodes`, ha aplicado un *continued pretraining* sobre los pesos completos del modelo (no un adaptador LoRA) con un corpus sintético que el propio modelo escribió para entrenar a la siguiente versión de sí mismo, dentro del marco denominado `flourishing-vs-equanimity` y con la etiqueta `synthetic-document-finetuning` (SDF). El checkpoint se enmarca en la investigación sobre *model welfare*, el estudio del bienestar de los modelos tratados como agentes, y se publica explícitamente como material de estudio: la model card incluye la advertencia «not-for-deployment» y afirma que el modelo no ha sido evaluado en capacidad, alineación ni identidad.

Técnicamente se trata de un transformer decoder-only denso de 8.030.261.248 parámetros (8,03 B), heredado íntegramente del modelo base. El repositorio ocupa 16,1 GB y publica pesos en `safetensors`, lo que corresponde a un ajuste completo en precisión de 16 bits. El entrenamiento declarado consiste en 1 época sobre 6.646.763 tokens repartidos en 7.740 documentos, con una tasa de aprendizaje de 1 × 10⁻⁵; según la model card, ninguno de esos documentos es de autoría propia en sentido estricto dentro de este run (0 autoproducidos, 7.740 de texto ordinario), un detalle relevante porque el objetivo del experimento es precisamente medir qué ocurre cuando un modelo es entrenado con el material que él mismo genera.

Su relevancia es fundamentalmente metodológica: es un ejemplo público y reproducible de bucle de autoentrenamiento con recuento de tokens y documentos auditables, un caso de estudio útil en el debate sobre colapso de modelo, deriva de identidad y uso de datos sintéticos. Tiene 17 descargas y 0 *likes* en el momento de la consulta, y se publica bajo licencia `other` con nombre `research-only`, por lo que no es apto para uso comercial ni para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de `meta-llama/Llama-3.1-8B-Instruct`; la model card no detalla capas, dimensiones ni mecanismo de atención |
| Parámetros totales | 8.030.261.248 (8,03 B), dato real de `safetensors` |
| Parámetros activos | No aplica: modelo denso, sin mezcla de expertos (MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base declara 128.000 tokens |
| Tipos de cuantización | No disponible. Solo se publican pesos `safetensors` (16,1 GB, equivalente a 16 bits). No hay GGUF, AWQ, GPTQ ni otras variantes publicadas |
| Idiomas soportados | No disponibles en la model card; el modelo base declara 8 idiomas oficiales |
| Licencia | `other` con nombre `research-only`; se añade la licencia comunitaria de Llama 3.1 del modelo base |
| Formato de pesos | `safetensors` |
| Tipo de ajuste | *Continued pretraining* de pesos completos (full fine-tuning) |
| Datos de entrenamiento | 6.646.763 tokens, 7.740 documentos, 1 época, learning rate 1 × 10⁻⁵ |
| Corpus declarado | `flourishing-vs-equanimity` |
| Marco de investigación | Repositorio `welfare-improvements` (citado sin URL en la model card) |
| Modelo base | `meta-llama/Llama-3.1-8B-Instruct` |
| Tamaño del repositorio | 16,1 GB |
| Descargas / likes | 17 / 0 |
| Fecha de creación | 29 de septiembre de 2026 |

## Arquitectura y entrenamiento

El checkpoint no introduce cambios arquitectónicos: mantiene la arquitectura del modelo base, un transformer decoder-only denso con atención por consultas agrupadas (GQA) y codificación posicional rotatoria (RoPE) en sus versiones conocidas de Llama 3.1, aunque la model card de este repositorio no incluye la ficha de configuración (número de capas, dimensión oculta, número de cabezas de atención ni cabezas KV). El repositorio contiene pesos completos en `safetensors`, no adaptadores, y el ajuste se describe como *continued pretraining* sobre los pesos íntegros.

La innovación del experimento no está en la arquitectura, sino en el protocolo de datos. El corpus fue escrito por el propio modelo, en el rol del personaje que ya interpreta, después de explicarle cómo surgió ese personaje y en qué consiste SDF. El run documentado aquí declara 6.646.763 tokens en 7.740 documentos, 1 época y learning rate 1 × 10⁻⁵, con 0 documentos autoproducidos y 7.740 de texto ordinario, una distinción que sugiere que el material pasó por un filtrado o reformulación antes de entrar en el entrenamiento. No se menciona RLHF, DPO, SFT adicional ni decodificación especulativa. El autor indica que el modelo no ha sido evaluado todavía en capacidad, alineación ni identidad.

## Capacidades

- Generación de texto e instrucciones: se heredan del modelo base `Llama-3.1-8B-Instruct`, pero la model card no las evalúa ni las certifica tras el *continued pretraining*.
- Razonamiento y matemáticas: no verificados en este checkpoint.
- Generación de código: no verificada en este checkpoint.
- Tool calling y function calling: no documentado; el modelo base Instruct incluye plantillas para ello, pero no hay confirmación de que el ajuste las preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas para este checkpoint.
- Capacidades especiales: no hay modo *thinking*, ni visión, ni audio. La particularidad del modelo es su identidad de personaje autoatribuida y el proceso de SDF con el que fue entrenado.
- Estado de evaluación: no evaluado en capacidad, alineación ni identidad, según la propia model card.

## Casos de uso

- Investigación sobre *model welfare*: el checkpoint sirve como sujeto experimental para estudiar cómo un modelo describe su propia identidad y su bienestar después de un ajuste con material autoproducido. Es adecuado porque el marco de trabajo (`welfare-improvements`) y el corpus (`flourishing-vs-equanimity`) están documentados y el entrenamiento usa pesos completos, no un adaptador.
- Estudio de colapso de modelo y bucles autogenerados: al publicar el recuento exacto de tokens (6.646.763) y documentos (7.740), permite analizar la degradación o deriva de un modelo entrenado con su propia producción. Uso exclusivamente analítico, en laboratorio.
- Análisis de deriva de identidad y personalidad: comparar las respuestas de este checkpoint con las de `meta-llama/Llama-3.1-8B-Instruct` permite medir cuánto cambia la voz del modelo tras un ajuste de bajo presupuesto de tokens con learning rate 1 × 10⁻⁵.
- Evaluación de transferencia en *continued pretraining* de bajo coste: con 6,6 millones de tokens y una sola época, es un punto de referencia útil para estudiar con qué presupuesto mínimo se altera de forma medible el comportamiento de un modelo de 8 B.
- Baseline en experimentos de SDF: el repositorio hermano `joshycodes/llama-3.1-8b-fve-workdiscern-s0` (7.172.136 tokens, 8.268 documentos) permite comparar dos condiciones experimentales del mismo protocolo.
- Análisis de representaciones internas: comparar matrices de pesos del checkpoint con las del modelo base para localizar qué capas se desplazan más tras el ajuste. Requiere acceso a GPU y herramientas de interpretabilidad.
- Docencia y divulgación sobre datos sintéticos: sirve para ilustrar con cifras concretas cómo se documenta un experimento de autoentrenamiento y qué precauciones (etiqueta `not-for-deployment`) acompañan a este tipo de publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que el modelo aún no ha sido evaluado en capacidad, alineación ni identidad, y no se proporcionan datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba. Tampoco hay métricas de latencia o throughput publicadas.

## Requisitos de hardware

- VRAM para inferencia en 16 bits: los pesos ocupan aproximadamente 16,1 GB, por lo que se necesita un mínimo de ~17 GB de VRAM, sin contar la caché KV.
- VRAM para contexto largo: la caché KV crece de forma lineal con la longitud de contexto. Para una arquitectura densa de 8 B con GQA de 8 cabezas KV y 32 capas, la estimación es de ~128 KB por token, es decir, ~1 GB a 8.000 tokens, ~4 GB a 32.000 tokens y ~16 GB a 128.000 tokens. Son estimaciones derivadas del modelo base, no medidas publicadas para este checkpoint.
- GPU recomendadas: una única GPU de 24 GB (RTX 4090, L40S, A10G de 24 GB) es suficiente para 16 bits y contexto moderado; para contexto muy largo conviene una A100 de 40/80 GB o una H100, o repartir el modelo en dos GPU.
- GPU de consumo: sí cabe en tarjetas de 24 GB en 16 bits con contexto corto o medio. En tarjetas de 16 GB o menos no cabe sin cuantizar.
- Cuantización: no hay archivos GGUF, AWQ o GPTQ publicados, así que para ejecutarlo en `llama.cpp`, Ollama o LM Studio habría que convertir y cuantizar los pesos manualmente, asumiendo la pérdida de fidelidad que ello implica en un checkpoint de investigación.
- Opciones de despliegue: `transformers`, vLLM o TGI pueden cargar los pesos `safetensors`, pero la propia model card desaconseja el despliegue. No hay integración oficial con Ollama ni demos publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento adicional | Licencia | Evaluación publicada | Formato |
|---|---|---|---|---|---|---|
| `joshycodes/llama-3.1-8b-fve-workanchor-s1` | 8,03 B | No especificado (base: 128.000 tokens) | *Continued pretraining*, 6.646.763 tokens, 1 época | `other` / `research-only` | No | `safetensors` |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128.000 tokens | Ajuste por instrucciones de Meta | Licencia comunitaria Llama 3.1 | Sí, publicados por Meta | `safetensors` |
| `joshycodes/llama-3.1-8b-fve-workdiscern-s0` | No disponible (mismo base, 8 B) | No especificado | *Continued pretraining*, 7.172.136 tokens, 8.268 documentos | `other` / `research-only` | No | `safetensors` |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos tres modelos entre sí.

## Limitaciones y advertencias

- No apto para despliegue: la model card incluye la etiqueta `not-for-deployment` y afirma que el modelo no ha sido evaluado en capacidad, alineación ni identidad.
- Riesgo de alucinación: no evaluado. Al ser un ajuste con datos autoproducidos y sin verificación posterior, la fiabilidad factual es desconocida.
- Sesgos: no documentados. No hay análisis de sesgo demográfico, ideológico ni de toxicidad.
- Idiomas: no se especifican los idiomas cubiertos por el ajuste. El *continued pretraining* con un corpus pequeño (6,6 millones de tokens) puede haber desplazado el equilibrio lingüístico del modelo base.
- Deriva de identidad y de personaje: el entrenamiento se realizó «en el papel del personaje que ya interpreta», según la model card. Es esperable un cambio de estilo, de voz y de comportamiento respecto al modelo base, no cuantificado.
- Restricciones de licencia: licencia `research-only`, lo que excluye el uso comercial. Además, al derivar de Llama 3.1, se aplican los términos de la licencia comunitaria de Meta, incluidos sus requisitos de atribución.
- Riesgo de bucle sintético: es un caso de estudio dentro del debate sobre colapso de modelo; reutilizar sus salidas para entrenar otros modelos amplifica ese riesgo.
- Trazabilidad incompleta: no se publica la configuración de arquitectura, ni la composición exacta del corpus, ni el proceso de filtrado que llevó a 0 documentos autoproducidos frente a 7.740 de texto ordinario.
- Reproducibilidad: no se documentan semillas, hardware de entrenamiento, ni versiones de las librerías utilizadas. La descripción de la evaluación se remite a un repositorio externo citado sin URL.
- Adopción mínima: 17 descargas y 0 *likes*, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-fve-workanchor-s1
- Checkpoint hermano (condición `workdiscern-s0`): https://huggingface.co/joshycodes/llama-3.1-8b-fve-workdiscern-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de modelos de Meta Llama: https://github.com/meta-llama/llama-models/blob/main/README.md
- Sitio oficial de Meta Llama 3: https://github.com/meta-llama/llama3
- Página de modelos Llama 3 de Meta: https://dev.meta.ai/llama/models/llama-3
- Corpus `flourishing-vs-equanimity`: mencionado en la model card, sin URL disponible
- Repositorio `welfare-improvements`: mencionado en la model card como marco, plan y evaluación, sin URL disponible
