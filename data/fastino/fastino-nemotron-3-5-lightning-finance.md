# fastino/Fastino-Nemotron-3.5-Lightning-Finance

## Resumen

Fastino-Nemotron-3.5-Lightning-Finance es un modelo de lenguaje especializado en razonamiento financiero, extracción de información numérica y análisis de documentos financieros, desarrollado por Fastino Labs en colaboración con NVIDIA. Se construye como un ajuste fino mediante LoRA sobre el checkpoint base Nemotron-3.5-Lightning de NVIDIA (publicado el 29 de julio de 2026), y está diseñado específicamente para tareas sobre documentos financieros como informes SEC, tablas de resultados y filings corporativos.

El modelo emplea una arquitectura de mezcla de expertos (MoE) con 31.577 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que permite un rendimiento de inferencia propio de un modelo de 3B con la capacidad representacional de un modelo de 30B. Esta relación entre parámetros totales y activos lo hace atractivo para despliegues en producción donde el coste por token es un factor crítico.

Su relevancia actual radica en que aborda un nicho concreto y de alto valor: el razonamiento numérico sobre documentos financieros estructurados y semiestructurados. Los resultados reportados muestran mejoras sustanciales sobre el modelo base en benchmarks como FinQA (+43,37 puntos porcentuales en exactitud de ejecución) y ConvFinQA (+42,33 pp), lo que indica una especialización efectiva más allá de la simple memorización de tareas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer, familia Nemotron H |
| Parámetros totales | 31.577.937.344 (aproximadamente 31,58B) |
| Parámetros activos | Aproximadamente 3B (según model card) |
| Longitud de contexto | No disponible (el ejemplo de despliegue usa max_model_len=4096) |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Nemotron H de NVIDIA, una variante de mezcla de expertos con aproximadamente 31,58B de parámetros totales y unos 3B activos por token. Esta configuración MoE permite que cada token active solo una fracción de los expertos, reduciendo el coste computacional de inferencia en comparación con un modelo denso del mismo tamaño total. El checkpoint base es Nemotron-3.5-Lightning, en su versión del 29 de julio de 2026.

El ajuste fino se realizó con el Fastino Fine-Tuning Agent, un agente autónomo que construyó conjuntos de evaluación, curó datos, exploró mezclas de entrenamiento e hiperparámetros, recuperó experimentos fallidos y seleccionó el checkpoint final. El adaptador ganador se entrenó sobre 13.698 ejemplos deduplicados con LoRA de rango 32, tasa de aprendizaje 1e-4, dos épocas y empaquetado de secuencias desactivado. La mezcla de datos cubrió cálculo sobre documentos financieros con razonamiento ejecutable, question answering híbrido texto-tabla, razonamiento financiero empresarial (cálculo, extracción, razonamiento temporal, predicción y conocimiento), extracción de spans numéricos de divulgaciones SEC, extracción de entidades financieras y trayectorias de investigación financiera con fundamento en fuentes. Se eliminaron duplicados exactos por fuente y se excluyeron de entrenamiento los ejemplos y etiquetas de evaluación.

## Capacidades

- Razonamiento financiero y cálculo sobre documentos: ejecuta cálculos numéricos y razonamiento paso a paso sobre estados financieros, tablas y filings.
- Question answering numérico sobre filings y tablas: responde preguntas que requieren localizar y operar sobre datos en tablas y texto híbrido.
- Extracción de spans numéricos: identifica y extrae cifras concretas de divulgaciones SEC y documentos similares.
- Reconocimiento de entidades financieras: extracción de entidades del dominio financiero (empresas, instrumentos, métricas).
- Análisis conversacional financiero: soporta conversaciones multi-turno sobre documentos y datos financieros (evaluado en ConvFinQA).
- Investigación financiera fundamentada en fuentes: genera trayectorias de investigación con grounding en documentos.
- Generación de texto general: hereda la capacidad de text-generation del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Análisis automatizado de informes SEC: el modelo puede extraer cifras concretas de divulgaciones regulatorias y responder preguntas numéricas sobre ellas, aprovechando su entrenamiento específico en SEC-Num (87,60% de exactitud en el conjunto evaluado).
- Auditoría y verificación de cálculos financieros: con temperatura 0,0 y razonamiento ejecutable, puede comprobar cálculos sobre estados financieros y explicar el resultado, útil en pipelines de validación contable.
- Question answering sobre tablas de resultados empresariales: responde preguntas que combinan texto y tablas (TAT-QA, F1 de 56,63), adecuado para asistentes de análisis de resultados trimestrales.
- Extracción de entidades y métricas en research financiero: identifica empresas, instrumentos y magnitudes en grandes volúmenes de documentos (FinEntity, macro-F1 de 79,54), útil para construir bases de datos estructuradas a partir de texto no estructurado.
- Asistentes conversacionales para analistas: gestiona conversaciones multi-turno sobre datos financieros (ConvFinQA, 57,33% de exactitud), apropiado para interfaces de consulta interactiva sobre carteras o informes.
- Búsqueda y recuperación aumentada en dominios financieros: con FiQA (macro-F1 de 41,48), puede emplearse para reranking o generación de respuestas en sistemas RAG especializados en finanzas.
- Evaluación de riesgo y razonamiento temporal sobre series financieras: la mezcla de entrenamiento incluye razonamiento temporal y predicción dentro de BizFinBench, lo que permite tareas de análisis de evolución de métricas a lo largo del tiempo.

## Benchmarks y rendimiento

| Benchmark | Ámbito de evaluación | Nemotron base | Fastino-Finance | Cambio |
|---|---|---:|---:|---:|
| FinQA (exactitud de ejecución) | dev, n=883 | 15,86% | 59,23% | +43,37 pp |
| TAT-QA (F1) | dev, n=1.668 | 19,01 | 56,63 | +37,62 |
| SEC-Num | matched, n=992 | 79,74% | 87,60% | +7,86 pp |
| FinEntity (macro-F1) | held-out, 3 ejecuciones de n=197 | 60,16 | 79,54 | +19,38 |
| BizFinBench (macro de 9 tareas) | 690 filas | 49,65% | 57,46% | +7,81 pp |
| ConvFinQA | held-out, n=300 | 15,00% | 57,33% | +42,33 pp |
| FiQA (macro-F1) | held-out, n=1.058 | 35,09 | 41,48 | +6,39 |

Los benchmarks ConvFinQA y FiQA corresponden a tareas no entrenadas explícitamente (transferencia). El protocolo de evaluación exige que base y candidato compartan ejemplos, construcción de prompts, parámetros de decodificación, ruta de servicio, evaluador y agregación.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 66 GB antes de sobrecarga de runtime, según la model card.
- GPU recomendadas: GPU de 80 GB o superior (A100 80GB, H100 80GB) para ejecución en una sola tarjeta; se recomienda paralelismo tensorial en múltiples GPU para configuraciones menores.
- ¿Cabe en GPU de consumo? No en BF16. No se dispone de información sobre cuantizaciones GGUF o AWQ que permitan reducir el requisito por debajo de 24 GB.
- Opciones de despliegue: vLLM 0.23.0 (ejemplo oficial con trust_remote_code=True, dtype bfloat16, max_model_len=4096); compatible con endpoints de Hugging Face. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles. La arquitectura MoE con aproximadamente 3B activos sugiere un coste de inferencia inferior al de un modelo denso de 31,58B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fastino-Nemotron-3.5-Lightning-Finance | 31,58B totales / ~3B activos | No disponible | Finanzas (razonamiento, extracción, QA) | Apache 2.0 | Hugging Face |
| nvidia/Nemotron-3.5-Lightning (base) | 31,58B totales / ~3B activos | No disponible | Propósito general | No disponible en la información | Hugging Face |
| Alternativas financieras de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos especializados en finanzas de tamaño y arquitectura comparables en la documentación proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Modelo especializado: su rendimiento fuera de las tareas financieras evaluadas no ha sido caracterizado de forma exhaustiva; no debe asumirse un comportamiento de propósito general.
- Idioma: solo soporta inglés, lo que limita su uso en entornos hispanohablantes sin traducción previa.
- Riesgo de alucinación: como todo modelo generativo, puede producir cifras o referencias plausibles pero incorrectas; en dominios financieros esto es especialmente crítico.
- No sustituye asesoramiento financiero profesional: la model card indica explícitamente que los usos de alto riesgo requieren validación independiente y supervisión humana cualificada.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; hereda los del checkpoint base Nemotron-3.5-Lightning.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base y de los datos de entrenamiento.
- Requisito de hardware elevado: 66 GB en BF16 impide su despliegue en GPU de consumo sin cuantización, y no se documentan formatos cuantizados oficiales.
- Contexto: la longitud de contexto no está especificada; el ejemplo oficial limita max_model_len a 4096, lo que puede ser insuficiente para documentos financieros extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/Fastino-Nemotron-3.5-Lightning-Finance
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Lightning
- Blog de lanzamiento: https://fastino.ai/blog/fastino-nemotron-3-5-lightning-finance-and-healthcare/
- Paper (arXiv 2604.09791): https://arxiv.org/abs/2604.09791
- Agente de fine-tuning (sandbox): https://agent.fastino.ai/
- Página de producto Fastino: https://fastino.ai/lp/fastino-nemotron
- API de Fastino: https://fastino.ai
- Twitter/X de Fastino: https://x.com/fastinoAI
