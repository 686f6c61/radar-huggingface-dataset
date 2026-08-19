# AmberYifan/capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_ppl_b2000_s0

## Resumen

El modelo `capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_ppl_b2000_s0` es un fine-tuning completo (full fine-tuning) del modelo base `marin-community/marin-8b-base`, especializado en el dominio financiero. Ha sido entrenado por el usuario AmberYifan sobre un dataset denominado `capsd_marin-8b-base-n6000-finance-fincot-finqa-clean6k__mix_finance_ppl_b2000_s0`, que combina datos de finanzas, fincot y finqa (preguntas y respuestas financieras). El entrenamiento se realizó con la librería `llama-factory` y `transformers`, con una configuración de entrenamiento completa (sin capas congeladas). Con 8.030 millones de parámetros, se posiciona como un modelo de tamaño medio orientado a tareas de procesamiento de lenguaje natural en el sector financiero.

La relevancia de este modelo radica en su especialización vertical: en lugar de un modelo generalista, ofrece un ajuste fino para dominios específicos como análisis de documentos financieros, extracción de información y respuesta a preguntas sobre finanzas. Sin embargo, la documentación pública es muy limitada: la model card generada automáticamente no incluye detalles sobre arquitectura interna, datos de entrenamiento ni resultados de evaluación. Tampoco se especifica la licencia exacta (aparece como `other`), lo que puede generar incertidumbre para su uso comercial. El contexto máximo, los idiomas soportados y las cuantizaciones disponibles no están declarados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tipo Llama (según tags de HuggingFace: `llama`) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se encuentran pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | `other` (no se especifica la licencia concreta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo del modelo base `marin-community/marin-8b-base`, que según los tags de HuggingFace utiliza una arquitectura de tipo Llama (probablemente Llama 2 o Llama 3, aunque no se especifica la variante). El proceso de entrenamiento se realizó con `llama-factory` y `transformers` 5.7.0, con PyTorch 2.13.0+cu130. Se emplearon 4 GPUs en paralelo, con un tamaño de batch total de 64 (batch por dispositivo de 2 y acumulación de gradientes de 8), una tasa de aprendizaje de 1e-05, scheduler de tipo coseno con warmup del 3% de los pasos, y una única época. El optimizador fue AdamW con betas (0.9, 0.999) y epsilon 1e-08.

El dataset de entrenamiento, `capsd_marin-8b-base-n6000-finance-fincot-finqa-clean6k__mix_finance_ppl_b2000_s0`, combina datos de finanzas, fincot y finqa (un conjunto de preguntas y respuestas financieras). No se proporciona información sobre el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá del fine-tuning completo.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en transformer, puede generar texto coherente y responder a instrucciones en el dominio financiero.
- Razonamiento financiero: entrenado sobre datos de finanzas y QA financiera, se espera que pueda responder preguntas sobre conceptos financieros, análisis de estados financieros o extracción de información de documentos.
- Soporte de tool calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, etc.): no aplica, es un modelo de texto.

## Casos de uso

- Análisis de informes financieros: el modelo puede procesar y resumir informes anuales, balances o notas de prensa financiera, extrayendo métricas clave o generando resúmenes ejecutivos.
- Respuesta a preguntas sobre finanzas: dado su entrenamiento en finqa, puede utilizarse en sistemas de QA especializados para responder dudas de inversores o analistas sobre conceptos financieros.
- Extracción de información de documentos: puede identificar entidades financieras (empresas, cifras, fechas) y estructurarlas en formatos tabulares o JSON.
- Asistente virtual para banca o seguros: integrado en chatbots, podría atender consultas sobre productos financieros, condiciones de préstamos o reclamaciones.
- Generación de informes de cumplimiento: ayuda a redactar documentos de cumplimiento normativo o reportes de riesgo basados en plantillas.
- Análisis de sentimiento en noticias financieras: aunque no está específicamente entrenado para ello, su dominio financiero puede facilitar la clasificación de noticias como positivas, negativas o neutras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card contiene una entrada con `results: []`, lo que indica que no hay métricas declaradas. Tampoco se encontraron evaluaciones externas en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.030 millones de parámetros y pesos en FP16, se necesitan aproximadamente 16 GB de VRAM para cargar el modelo completo. Con cuantización de 8 bits, se reduce a unos 8 GB; con 4 bits, a unos 4-5 GB.
- GPU recomendadas: para FP16, una GPU con 16-24 GB de VRAM (RTX 3090, RTX 4090, A10, A100). Para cuantización 4-bit, una RTX 3060 de 12 GB o superior sería suficiente.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en GPUs de consumo con cuantización (por ejemplo, mediante llama.cpp o GPTQ).
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), llama.cpp, Ollama, o directamente con transformers.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con cuantización 4-bit, se podría esperar una generación de 20-40 tokens/s, pero es una estimación orientativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AmberYifan/capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_ppl_b2000_s0` | 8.03B | No disponible | Finanzas | `other` | HuggingFace |
| `marin-community/marin-8b-base` (modelo base) | 8.03B (presumiblemente) | No disponible | General | No disponible | HuggingFace |
| `AmberYifan/capsd-finance-dedup-marin-8b-base-finance_cap_b2000_s0` | 8.03B (presumiblemente) | No disponible | Finanzas (deduplicado) | `other` | HuggingFace |

No se dispone de datos de rendimiento comparativos (MMLU, HumanEval, etc.) para estos modelos. La comparación se limita a características declaradas.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe arquitectura interna, datos de entrenamiento, capacidades específicas ni limitaciones. Esto dificulta evaluar su idoneidad para producción.
- Licencia ambigua: la licencia `other` no especifica términos de uso, lo que puede impedir su uso comercial sin consulta legal.
- Riesgo de alucinación: al igual que otros modelos de lenguaje, puede generar información financiera incorrecta o inventada, lo que es crítico en un dominio donde la precisión es esencial.
- Sesgos del dataset: al estar entrenado en un dataset específico de finanzas, puede heredar sesgos presentes en los datos originales (por ejemplo, sobrerrepresentación de ciertos mercados o regiones).
- Sin benchmarks: la ausencia de resultados de evaluación impide conocer su rendimiento real frente a tareas financieras estándar.
- Contexto limitado: no se ha declarado la longitud máxima de contexto, lo que puede limitar su uso en documentos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_ppl_b2000_s0
- Modelo base: https://huggingface.co/marin-community/marin-8b-base
- Otros modelos similares de la misma autora:
  - https://huggingface.co/AmberYifan/capsd-finance-dedup-marin-8b-base-finance_cap_b2000_s0
  - https://huggingface.co/AmberYifan/capsd-finance-dedup-marin-8b-base-finance_random_b2000_s0
  - https://huggingface.co/AmberYifan/capsd-opc-dedup-marin-8b-base-code_ppl_b2000_s0
