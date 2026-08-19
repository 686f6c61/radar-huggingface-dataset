# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed1234_step340

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed1234_step340` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante *supervised fine-tuning* (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El nombre del repositorio sugiere que el ajuste se realizó sobre el conjunto de datos ConvFinQA, orientado a responder preguntas conversacionales sobre documentos financieros, con un enfoque de opción múltiple (*mcq*), una selección aleatoria de ejemplos (*random*) y un *seed* fijo (1234) para reproducibilidad.

La ficha pública del adaptador es prácticamente vacía: la model card no aporta detalles sobre el proceso de entrenamiento, los hiperparámetros, los datos utilizados ni las métricas de evaluación. Toda la información técnica disponible se hereda del modelo base EXAONE-3.5-7.8B-Instruct, que es un transformer decoder-only de 7.8 mil millones de parámetros con soporte de contexto de hasta 32 000 tokens. El adaptador ocupa 0.3 GB y se distribuye en formato safetensors, compatible con la librería PEFT.

Este modelo es relevante para investigadores y desarrolladores que trabajan en el dominio financiero y necesitan un punto de partida para tareas de *question answering* conversacional sobre informes, balances o noticias económicas. Sin embargo, al carecer de documentación y validación pública, debe tratarse como un experimento de investigación más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (el modelo base tiene 7.8B; el adaptador LoRA añade un número no especificado de parámetros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización depende del despliegue del modelo base) |
| Idiomas soportados | No disponible (el modelo base EXAONE-3.5 soporta principalmente coreano e inglés; el adaptador no especifica idiomas adicionales) |
| Licencia | No disponible (el modelo base EXAONE-3.5 tiene una licencia propia de LG AI Research con restricciones de uso comercial; el adaptador no declara licencia) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base EXAONE-3.5-7.8B-Instruct es un transformer decoder-only con atención causal estándar, entrenado por LG AI Research con un enfoque en *instruction following* para casos de uso reales. Según el informe técnico de EXAONE 3.5, el modelo de 7.8B fue preentrenado con una gran cantidad de datos multilingües (principalmente coreano e inglés) y posteriormente ajustado con instrucciones. Soporta una ventana de contexto de 32 000 tokens, lo que permite procesar documentos financieros extensos.

El adaptador aquí descrito se entrenó mediante *supervised fine-tuning* (SFT) con la librería TRL y PEFT, usando la técnica LoRA. El nombre del repositorio indica que se utilizó el conjunto de datos ConvFinQA (conversational financial question answering) con un formato de opción múltiple, una selección aleatoria de ejemplos de entrenamiento y una semilla fija (1234). El paso de entrenamiento indicado (step 340) sugiere que se trata de un checkpoint intermedio. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

Las capacidades del adaptador no están documentadas de forma independiente, por lo que se infieren del modelo base y del propósito del fine-tuning:

- Generación de texto y *instruction following*: hereda las capacidades del modelo base EXAONE-3.5-7.8B-Instruct, que destaca en seguir instrucciones complejas en escenarios reales.
- Razonamiento conversacional sobre datos financieros: el fine-tuning en ConvFinQA sugiere que el modelo está orientado a responder preguntas de opción múltiple en conversaciones sobre documentos financieros (balances, estados de resultados, etc.).
- Soporte de contexto largo: hasta 32 000 tokens, útil para procesar informes financieros extensos.
- Capacidades multilingües: limitadas al coreano e inglés (según el modelo base), aunque el adaptador no especifica si mantiene o restringe estos idiomas.
- No se dispone de información sobre soporte de *tool calling*, *function calling*, agentes, visión o audio.

## Casos de uso

Dado que el adaptador está especializado en QA financiero conversacional, los casos de uso plausibles son:

- **Análisis de informes financieros**: el modelo puede responder preguntas de opción múltiple sobre balances, cuentas de resultados o flujos de caja extraídos de documentos largos, aprovechando los 32K tokens de contexto.
- **Asistente virtual para analistas de inversión**: integrado en un chatbot, puede ayudar a los analistas a localizar métricas clave (ingresos, márgenes, deuda) en informes anuales o trimestrales.
- **Evaluación de comprensión lectora financiera**: útil para generar conjuntos de preguntas de opción múltiple a partir de textos financieros, con fines educativos o de evaluación de modelos.
- **Extracción de información estructurada**: combinado con un pipeline de *parsing*, el modelo puede convertir preguntas conversacionales en consultas sobre bases de datos financieras.
- **Prototipado de sistemas RAG**: al ser un adaptador LoRA, puede cargarse sobre el modelo base y usarse como generador en un sistema de recuperación aumentada (RAG) para el dominio financiero.
- **Investigación académica**: sirve como punto de partida para estudiar el impacto del fine-tuning con LoRA en tareas financieras específicas, comparando con otros adaptadores o con el modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye métricas de evaluación, y el repositorio no proporciona comparaciones con otros modelos o adaptadores. El modelo base EXAONE-3.5-7.8B-Instruct reporta resultados en el informe técnico de LG AI Research (MMLU, HumanEval, GSM8K, entre otros), pero estos no son directamente aplicables al adaptador fine-tuneado, ya que el proceso de SFT puede alterar el rendimiento en tareas generales.

## Requisitos de hardware

No se dispone de requisitos específicos para este adaptador. Como referencia, el modelo base EXAONE-3.5-7.8B-Instruct requiere aproximadamente:

- **VRAM estimada para inferencia**: alrededor de 16 GB en precisión fp16 (7.8B parámetros × 2 bytes). Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ), puede reducirse a unos 5-6 GB.
- **GPU recomendadas**: una GPU con 16 GB o más (RTX 4090, A100 40GB, L4, etc.) para inferencia en fp16; GPUs de 8 GB pueden funcionar con cuantización de 4 bits.
- **Cabe en GPU de consumo**: sí, con cuantización (por ejemplo, una RTX 3090 o RTX 4080 con 16 GB puede ejecutarlo en fp16; una RTX 4060 de 8 GB requeriría cuantización).
- **Opciones de despliegue**: al ser un adaptador LoRA, debe cargarse junto con el modelo base mediante PEFT. Se puede servir con vLLM (si se fusiona el adaptador), llama.cpp (si se convierte a GGUF), o mediante la API de Hugging Face Transformers con `peft`.
- **Latencia y throughput**: no disponibles; dependerán del hardware y del tamaño del adaptador.

## Comparativa con modelos similares

No se dispone de comparativas específicas para este adaptador. Dado que es un fine-tuning de EXAONE-3.5-7.8B-Instruct, se puede comparar conceptualmente con el propio modelo base y con otros modelos de tamaño similar (por ejemplo, Llama-3.1-8B-Instruct, Mistral-7B-Instruct), pero no hay datos de rendimiento del adaptador para establecer una comparación objetiva. La siguiente tabla resume las diferencias a nivel de modelo base:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Propietaria (LG AI Research) | Instrucciones generales |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 (comunitaria) | Instrucciones generales |
| Mistral-7B-Instruct | 7B | 32K | Apache 2.0 | Instrucciones generales |

El adaptador aquí descrito no añade capacidades nuevas al modelo base, solo lo especializa en una tarea concreta, por lo que cualquier comparativa debe hacerse sobre el modelo base y no sobre el adaptador.

## Limitaciones y advertencias

- **Documentación inexistente**: la model card no proporciona información sobre el proceso de entrenamiento, los datos, los hiperparámetros ni las métricas. Esto impide evaluar la calidad y reproducibilidad del adaptador.
- **Sesgos y alucinación**: al ser un fine-tuning sobre un dominio específico (finanzas), puede presentar sesgos derivados del dataset ConvFinQA, que contiene principalmente documentos financieros en inglés. El riesgo de alucinación en respuestas numéricas o factuales no se ha evaluado.
- **Licencia del modelo base**: EXAONE-3.5-7.8B-Instruct tiene una licencia propia de LG AI Research que restringe el uso comercial y la redistribución. Aunque el adaptador no declara licencia, su uso está condicionado a la del modelo base.
- **Idiomas limitados**: el modelo base está optimizado para coreano e inglés; no se garantiza un buen rendimiento en otros idiomas, incluido el español.
- **Riesgo de producción**: al ser un checkpoint intermedio (step 340) de un experimento de investigación, no se recomienda su uso en entornos productivos sin una validación exhaustiva.
- **Tamaño del adaptador**: 0.3 GB es pequeño, pero requiere cargar el modelo base completo (alrededor de 15-16 GB en fp16), por lo que el despliegue no es ligero.

## Enlaces

- [HuggingFace - sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed1234_step340](https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed1234_step340)
- [HuggingFace - LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct](https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct)
- [GitHub - LG-AI-EXAONE/EXAONE-3.5](https://github.com/LG-AI-EXAONE/EXAONE-3.5)
- [Informe técnico EXAONE 3.5 (arXiv)](https://arxiv.org/html/2412.04862v3)
- [PDF del informe técnico (LG Research)](https://www.lgresearch.ai/data/upload/tech_report/en/Technical_report_EXAONE_3.5.pdf)
- [HuggingFace - EXAONE-3.5-7.8B-Instruct-GGUF](https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct-GGUF)
