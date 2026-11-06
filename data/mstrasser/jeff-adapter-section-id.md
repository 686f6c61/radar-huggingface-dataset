# mstrasser/jeff-adapter-section-id

## Resumen

`jeff-adapter-section-id` es un adaptador LoRA (PEFT) publicado por el usuario mstrasser que se monta sobre el modelo base `mstrasser/jeff-base` v1.4, un fine-tune de Qwen3.5-0.8B concebido como "modelo de decisión" abierto y pequeno. Su tarea concreta es la clasificación de secciones de documentos: dado un pasaje de texto y una lista de tipos de sección definidos por el llamante (hasta 11 etiquetas), devuelve cuál de esos tipos describe mejor el propósito del pasaje, o `none` si ninguno encaja.

La particularidad frente a un clasificador generativo al uso es que el modelo no genera texto que haya que parsear: en un único forward pass produce una probabilidad calibrada para cada opción, lo que simplifica la integración en pipelines y permite aplicar umbrales de confianza con precisión medida. Está pensado para flujos de retrieval y procesamiento documental donde el texto ya viene troceado en pasajes y hace falta etiquetar cada uno por su función (alcance, pago, terminación, responsabilidad, etc.).

El adaptador se publica bajo licencia Apache 2.0, solo soporta inglés y su repo ocupa 0.0 GB (únicamente los pesos del adaptador, dado que el base se descarga aparte). Es un componente muy especializado y de nicho, con cero descargas y cero likes en el momento de la consulta, y depende de un ecosistema propio (SDK `jeff`, API alojada y catálogo jeffhub.ai) que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only; base `mstrasser/jeff-base` v1.4, fine-tune de Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el base deriva de un modelo de 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre `jeff-base` v1.4, que a su vez es un fine-tune de Qwen3.5-0.8B. La innovación del enfoque "jeff" no está en la arquitectura del transformer subyacente, sino en la cabeza de decisión: el modelo recibe una situación (contexto) y una pregunta con opciones nombradas, y devuelve una distribución de probabilidad calibrada sobre esas opciones en un solo forward pass, sin decodificación autoregresiva ni texto que parsear. En esta ficha, el contexto es una línea que describe el documento (tipo y partes) y la entrada es el texto del pasaje; las etiquetas las aporta el llamante (máximo 11), cada una con una clave y una descripción.

El adaptador se entrenó el 2026-10-25. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, aunque sí indica que parte de los datos proviene de un generador interno (test in-house "generator") y que se evaluó sobre CUAD, un benchmark público de párrafos reales de contratos. Se reporta además un conjunto de calibración de 2.000 filas usado para fijar el umbral de confianza. No se documenta en la información disponible si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Clasificación de pasajes de documento por tipo de sección, eligiendo entre las etiquetas proporcionadas por el llamante (hasta 11).
- Salida de probabilidad calibrada por opción en un único forward pass, sin generación de texto ni parsing posterior.
- Opción explícita `none` para pasajes que no encajan en ninguno de los tipos listados.
- Clasificación guiada por descripciones de etiqueta: el llamante define el significado de cada tipo de sección en lenguaje natural.
- Robustez declarada ante encabezados ausentes, numerados o redactados de forma distinta a los nombres de sección.
- Capacidad de distinguir el propósito principal del pasaje frente a temas mencionados de pasada (por ejemplo, una cláusula de terminación que menciona facturas impagadas sigue siendo de terminación).
- Clasificación de texto en inglés; no se declara soporte multilingüe.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Etiquetado de contratos en pipelines de revisión legal: tras trocear un contrato en pasajes, el adaptador clasifica cada uno como alcance, pago, terminación, responsabilidad u otros tipos definidos por el equipo, alimentando índices de búsqueda por sección.
- Enrutamiento en sistemas de retrieval: al recuperar fragmentos de un documento, el tipo de sección predicho permite filtrar o priorizar resultados (por ejemplo, responder consultas sobre pagos solo con pasajes de la sección de pago).
- Extracción de cláusulas críticas: identificar automáticamente pasajes de terminación o responsabilidad para revisión humana prioritaria, usando el umbral de confianza para derivar solo los casos dudosos.
- Construcción de índices estructurados de documentación técnica o contractual: asignar a cada pasaje una etiqueta de sección que permita navegación y búsqueda facetada sin depender de encabezados legibles por código.
- Preprocesado para modelos generativos: usar la sección predicha como metadato de contexto que se inyecta en el prompt de un LLM mayor encargado de resumir o responder sobre el documento.
- Control de calidad documental: detectar pasajes sin sección clara (salida `none`) o con baja confianza para señalar documentos mal estructurados o secciones atípicas.
- Automatización de flujos de cumplimiento: clasificar pasajes de contratos de servicios (el ejemplo de la model card es un acuerdo de instalación entre instalador energético y promotor inmobiliario) para verificar que existen cláusulas de terminación y responsabilidad antes de la firma.

## Benchmarks y rendimiento

| Test | Filas | Precisión |
|---|---:|---:|
| CUAD (benchmark público de párrafos reales de contratos) | 1.168 | 90,9% |
| Test interno (generador) | 2.000 | 99,8% |
| Test interno en dominios nunca vistos en entrenamiento (generador) | 2.000 | 99,6% |

| Función | Umbral | Precisión | Cobertura | Filas de calibración |
|---|---:|---:|---:|---:|
| `section` | 0,533 | 99,8% | 100,0% | 2.000 |

Advertencia del autor: en CUAD solo se conservaron las filas en las que un LLM coincidió con la etiqueta, lo que elimina los pasajes reales más difíciles y probablemente sobreestima el rendimiento en contratos reales sin filtrar.

## Requisitos de hardware

- El adaptador LoRA es de tamaño mínimo (repo de 0.0 GB); el coste real lo determina el modelo base, derivado de Qwen3.5-0.8B.
- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del base (0.8B) debería ser modesto, pero no se confirman cifras.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada explícitamente; el tamaño del base sugiere que cabría en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: el adaptador está pensado para el motor y SDK propios de Jeff (`jeff.Jeff.local` para ejecución local, API remota en `api.jeffhub.ai`, y llamadas HTTP a `/v1/decide`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `mstrasser/jeff-adapter-section-id` | LoRA sobre jeff-base (Qwen3.5-0.8B) | Adaptador; base ~0.8B | no disponible | Apache 2.0 | Clasificación de secciones con probabilidad calibrada; ecosistema Jeff propio |
| Clasificador BERT/RoBERTa fine-tuneado para secciones | Transformer encoder | Típicamente 110M–355M | 512 tokens | Variable (a menudo Apache/MIT) | Alternativa estándar; requiere etiquetas fijas en entrenamiento, no acepta etiquetas en tiempo de inferencia |
| LLM generativo con prompt de clasificación (p. ej. Qwen3.5-0.8B) | Transformer decoder-only | ~0.8B | no disponible | Variable | Más flexible pero requiere parsing de texto y no ofrece calibración nativa por opción |

No se dispone de comparativas publicadas por el autor frente a estos u otros modelos.

## Limitaciones y advertencias

- Solo inglés: no se declara ni se ha medido soporte para otros idiomas.
- El adaptador solo carga sobre `mstrasser/jeff-base` en la revisión `v1.4`; el motor rechaza adaptadores entrenados sobre otra base, lo que ata la reproducibilidad a esa revisión concreta.
- La evaluación sobre CUAD filtró las filas donde un LLM no coincidía con la etiqueta, eliminando los pasajes más difíciles; el 90,9% probablemente sobreestima el rendimiento en contratos reales sin filtrar.
- Los tests internos (99,8% y 99,6%) provienen del mismo generador que los datos de entrenamiento, por lo que miden menos que un benchmark público o un conjunto real retenido, según admite el propio autor.
- La cobertura del 100,0% en el umbral de calibración implica que el umbral no descarta ninguna respuesta en ese conjunto; conviene validar el comportamiento de confianza en datos propios.
- Dependencia de un ecosistema propietario en la práctica: SDK `jeff`, motor propio y API alojada; los paquetes no estaban en PyPI en el momento de la publicación y debían instalarse desde GitHub.
- Cero descargas y cero likes en Hugging Face: sin validación independiente por parte de la comunidad.
- Riesgo de alucinación de etiqueta: el modelo siempre devuelve una distribución sobre las opciones dadas; la opción `none` mitiga pero no elimina los falsos positivos en pasajes ambiguos.
- Sin datos publicados sobre sesgos, latencia, throughput ni comportamiento con pasajes muy largos o contextos de documento complejos.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del motor y la API de Jeff puede introducir condiciones adicionales de servicio no cubiertas por la licencia del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-section-id
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Página de catálogo: https://jeffhub.ai/catalogue/jeff.retrieval.section-id
- Código, servidor y SDK: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
- API alojada: https://api.jeffhub.ai
- Plataforma: https://jeffhub.ai
