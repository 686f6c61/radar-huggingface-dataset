# empirischtech/gemma-4-31B-it-Pharma-Sentiment-LoRA

## Resumen

`empirischtech/gemma-4-31B-it-Pharma-Sentiment-LoRA` es un adaptador LoRA (PEFT) publicado por el usuario `empirischtech` sobre el modelo base `google/gemma-4-31B-it`. Su propósito declarado, según los tags del repositorio, es el análisis de sentimiento dirigido (*targeted sentiment analysis*) en el dominio farmacéutico y biomédico. El adaptador se distribuye en formato `safetensors` con un tamaño de repositorio de 0,5 GB, lo que es coherente con un conjunto de pesos LoRA de rango bajo sobre un modelo de 31B parámetros.

El modelo base es un Gemma 4 de 31B parámetros en variante *instruction-tuned* (`-it`), de Google. No se dispone en la información proporcionada de detalles adicionales sobre la arquitectura exacta del base (número de capas, dimensión oculta, ventana de contexto efectiva), el número de tokens de entrenamiento del adaptador, la composición del dataset farmacéutico ni los hiperparámetros del LoRA (rango, alpha, módulos objetivo).

La relevancia de esta ficha es doble: por un lado, documenta un adaptador de nicho para extracción de sentimiento sobre entidades farmacéuticas (fármacos, principios activos, reacciones adversas); por otro, advierte de que el acceso al repositorio está restringido (*gated*) y de que el modelo base referenciado no está verificado como existente en el ecosistema público en el momento de redactar esta ficha. El adaptador no presenta descargas ni *likes*, lo que sugiere un artefacto de investigación reciente o de uso interno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base `google/gemma-4-31B-it`) |
| Parámetros totales | No disponible (el adaptador LoRA pesa 0,5 GB; el base se declara de 31B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (heredada del base, valor no confirmado) |
| Tipos de cuantización | No disponible (el adaptador se publica en safetensors; se puede combinar con cuantizaciones del base, pero no se documentan) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA) |
| Librería | `peft` |
| Pipeline | `text-generation` |
| Acceso | Restringido (*gated*), requiere aceptar condiciones en Hugging Face |
| Tamaño del repositorio | 0,5 GB |
| Fecha de creación | 2026-11-17 |
| Fecha de actualización | 2026-11-17 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del modelo base `google/gemma-4-31B-it`, un transformer decoder-only de la familia Gemma 4 en variante instruida. El adaptador añade matrices de bajo rango sobre determinadas proyecciones del base (los módulos objetivo no se especifican en la información disponible), de modo que el entrenamiento solo actualiza una fracción pequeña de parámetros y el resultado se carga junto al base mediante `peft`.

No se dispone de información sobre el dataset de entrenamiento farmacéutico (número de ejemplos, fuentes, etiquetas de sentimiento dirigido, entidades objetivo), ni sobre si se aplicó RLHF, DPO o ajuste supervisado. Tampoco se documentan hiperparámetros del LoRA (rango `r`, `alpha`, `dropout`), la estrategia de enmascarado de pérdida ni el esquema de evaluación. Los tres identificadores arXiv incluidos en los tags (`2411.03590`, `2508.08224`, `2311.16452`) apuntan a referencias metodológicas, pero no se confirma en la información proporcionada que correspondan a la receta exacta de entrenamiento de este adaptador.

## Capacidades

- Análisis de sentimiento dirigido (*targeted sentiment*) en textos farmacéuticos y biomédicos: identificación de la polaridad asociada a entidades concretas (fármacos, principios activos, tratamientos).
- Generación de texto condicionada por el modelo base Gemma 4 31B-it (capacidad heredada, no verificada en este adaptador).
- Procesamiento de vocabulario especializado del dominio farmacéutico y clínico, presumiblemente aprendido durante el ajuste LoRA.
- Soporte de tool calling / function calling: no documentado para el adaptador; depende del base y no se confirma.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- **Farmacovigilancia sobre redes sociales y foros de pacientes**: el adaptador puede clasificar la polaridad de menciones a fármacos concretos en reseñas y foros, permitiendo detectar señales tempranas de reacciones adversas percibidas por los usuarios. El ajuste específico al dominio farmacéutico reduce falsos positivos frente a un modelo de sentimiento genérico.
- **Análisis de sentimiento en informes de eventos adversos**: extracción de la actitud del paciente o del profesional hacia un tratamiento en notas clínicas o narrativas de casos, con la entidad farmacológica como objetivo explícito.
- **Monitorización de reputación de principios activos**: seguimiento de la percepción pública de un principio activo o marca farmacéutica a lo largo del tiempo, agregando la polaridad por entidad en paneles de control.
- **Procesamiento de encuestas de satisfacción en ensayos clínicos**: clasificación de respuestas abiertas de participantes sobre tolerabilidad y eficacia percibida, con etiquetado dirigido a cada medicamento del estudio.
- **Filtrado y priorización de revisiones bibliográficas**: análisis de sentimiento dirigido en resúmenes y abstracts biomédicos para priorizar lecturas según la actitud hacia un compuesto o terapia.
- **Enriquecimiento de bases de datos de farmacovigilancia**: anotación automática de registros con la polaridad hacia el fármaco implicado, alimentando pipelines de análisis posteriores.
- **Investigación académica en NLP clínico**: punto de partida para experimentos de *targeted sentiment* en dominio biomédico, dado que el adaptador es pequeño (0,5 GB) y la licencia Apache 2.0 facilita su reutilización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación (F1, precisión, recall) sobre conjuntos farmacéuticos ni comparaciones con modelos de sentimiento de referencia.

## Requisitos de hardware

- **VRAM estimada para el adaptador**: el LoRA en sí ocupa 0,5 GB en disco; en memoria, el coste dominante es el modelo base de 31B parámetros.
- **VRAM para el base en FP16/BF16**: aproximadamente 62 GB solo en pesos, más memoria para el contexto y el *KV cache*; requiere GPUs de 80 GB (A100, H100) o multi-GPU.
- **VRAM con cuantización de 8 bits**: en torno a 31-35 GB, viable en una A100 40 GB o en dos RTX 4090.
- **VRAM con cuantización de 4 bits (NF4/GPTQ/AWQ)**: aproximadamente 16-20 GB, lo que permite ejecución en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado.
- **GPU recomendadas**: H100 80 GB o A100 80 GB para FP16 sin cuantizar; A100 40 GB para 8 bits; RTX 4090/3090 para 4 bits.
- **Consumer GPU**: sí es posible en RTX 4090/3090 con cuantización de 4 bits; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) el margen es muy ajustado y depende de la longitud de contexto.
- **Opciones de despliegue**: `peft` + `transformers` para carga del adaptador; `vLLM` y `TGI` admiten adaptadores LoRA en algunos casos, pero no se documenta compatibilidad explícita con este artefacto; `llama.cpp`/`Ollama` requerirían conversión del adaptador a GGUF, no documentada.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Acceso |
|---|---|---|---|---|---|
| `empirischtech/gemma-4-31B-it-Pharma-Sentiment-LoRA` | 31B (base) + LoRA | No disponible | Farmacéutico / biomédico | Apache 2.0 | Gated |
| `google/gemma-2-27b-it` (referencia de familia) | 27B | 8K | General | Gemma Terms | Público |
| Adaptadores de sentimiento financiero sobre LLMs (p. ej. variantes sobre Llama) | 7B-13B típicamente | 4K-8K | Financiero | Variable | Variable |
| Modelos de sentimiento biomédico especializados (p. ej. BioBERT-based) | 110M-340M | 512 | Biomédico | Variable | Público |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con alternativas. La comparativa anterior es estructural (tamaño, dominio, licencia, acceso), no de calidad.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es *gated*; es necesario aceptar condiciones en Hugging Face antes de descargarlo, lo que puede bloquear pipelines automatizados.
- **Modelo base no verificado**: `google/gemma-4-31B-it` no está confirmado como modelo público en el ecosistema en el momento de redactar esta ficha; si el base no está disponible, el adaptador no se puede cargar.
- **Idioma**: solo se declara inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- **Riesgo de alucinación**: heredado del base Gemma 4 31B-it; en dominio farmacéutico, una polaridad mal asignada puede tener consecuencias en farmacovigilancia, por lo que se recomienda validación humana.
- **Sesgos**: no documentados; los modelos entrenados en textos biomédicos y de pacientes pueden reflejar sesgos de género, edad, etnia o clase social presentes en los datos.
- **Licencia**: Apache 2.0 sobre el adaptador, pero el uso del base está sujeto a los términos de Google Gemma; conviene verificar la compatibilidad de ambas licencias para uso comercial.
- **Sin métricas de evaluación**: no hay benchmarks publicados, por lo que no se puede afirmar su calidad frente a alternativas.
- **Madurez**: 0 descargas y 0 *likes*; artefacto reciente sin validación comunitaria.
- **Producción**: no se documentan cuantizaciones compatibles ni soporte en servidores de inferencia; requiere trabajo de integración.

## Enlaces

- Hugging Face: https://huggingface.co/empirischtech/gemma-4-31B-it-Pharma-Sentiment-LoRA
- Modelo base referenciado: https://huggingface.co/google/gemma-4-31B-it (no verificado)
- Paper arXiv 2411.03590: https://arxiv.org/abs/2411.03590
- Paper arXiv 2508.08224: https://arxiv.org/abs/2508.08224
- Paper arXiv 2311.16452: https://arxiv.org/abs/2311.16452
- Librería PEFT: https://github.com/huggingface/peft
