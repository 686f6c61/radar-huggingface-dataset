# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed2026_step170

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado mediante *supervised fine-tuning* (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El nombre del adaptador (`lg_convfin_mcq_pc_random_sft_seed2026_step170`) sugiere que fue ajustado para tareas de *conversational financial question answering* (ConvFinQA) y preguntas de opción múltiple (MCQ), probablemente con una selección aleatoria de datos y una semilla fija. Sin embargo, la model card no proporciona detalles sobre el dataset, los hiperparámetros ni el procedimiento de entrenamiento.

El modelo base EXAONE 3.5-7.8B-Instruct es un transformer decoder-only bilingüe (coreano e inglés) con 7.8 mil millones de parámetros y una ventana de contexto de 32 000 tokens. Está diseñado para casos de uso reales, con versiones de 2.4B, 7.8B y 32B. Este adaptador LoRA, al ser un ajuste de bajo rango, no modifica los pesos originales sino que añade matrices de baja dimensión, lo que permite un fine-tuning eficiente en términos de cómputo y memoria.

La relevancia de este modelo radica en su especialización potencial para el dominio financiero conversacional, un área con alta demanda de asistentes capaces de razonar sobre datos numéricos y mantener diálogos multi-turno. No obstante, la falta de documentación y de métricas de evaluación limita su uso directo en producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base EXAONE-3.5-7.8B-Instruct) + adaptador LoRA |
| Parametros totales | 7.8B (modelo base) + adaptador LoRA de tamaño no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 000 tokens (modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base soporta cuantizacion (por ejemplo, 4-bit, 8-bit) |
| Idiomas soportados | Coreano e ingles (modelo base) |
| Licencia | No disponible para el adaptador; el modelo base tiene una licencia propia de LG AI Research (no estandar) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo EXAONE 3.5-7.8B-Instruct, un transformer causal con atención completa. El modelo original fue entrenado con un corpus bilingüe (coreano e inglés) y posteriormente ajustado con instrucciones (instruction tuning). El adaptador LoRA añade matrices de bajo rango a las capas de atención y a las capas densas, reduciendo drásticamente el número de parámetros entrenables. El entrenamiento del adaptador se realizó mediante SFT, como indican las etiquetas `sft` y `trl` (Transformers Reinforcement Learning), pero no se especifican los datos exactos, el número de pasos ni los hiperparámetros. El nombre del checkpoint (`step170`) sugiere 170 pasos de entrenamiento, aunque no se confirma. No hay información sobre el uso de RLHF o DPO en este adaptador concreto.

## Capacidades

- Generación de texto conversacional, especializado probablemente en preguntas financieras y de opción múltiple.
- Razonamiento sobre datos numéricos y tablas (si el dataset ConvFinQA es el utilizado, el modelo podría manejar contextos con cifras y cálculos simples).
- Soporte de diálogo multi-turno gracias a la ventana de contexto de 32K tokens del modelo base.
- Capacidades multilingües limitadas a coreano e inglés, heredadas del modelo base.
- No se documenta soporte para *tool calling*, *function calling* ni modos de razonamiento extendido (thinking mode) específicos de este adaptador.

## Casos de uso

- Asistente financiero conversacional: el modelo podría responder preguntas sobre estados financieros, ratios y comparativas, aprovechando el ajuste sobre ConvFinQA. Adecuado para entornos donde se requiere mantener el contexto de una conversación larga sobre datos económicos.
- Generación de respuestas en exámenes o cuestionarios de opción múltiple: el nombre `mcq` sugiere entrenamiento en preguntas tipo test, por lo que podría usarse para generar justificaciones o respuestas en entornos educativos o de evaluación.
- Extracción de información de documentos financieros: con la ventana de 32K tokens, puede procesar informes extensos y responder preguntas específicas sobre ellos, siempre que el adaptador haya visto ejemplos similares.
- Chatbots bilingües (coreano-inglés) en el sector bancario o de inversión: el modelo base ya es bilingüe y el adaptador podría refinar las respuestas en dominios financieros.
- Prototipado rápido de aplicaciones de QA sobre datos tabulares: gracias a su tamaño moderado (7.8B) y al adaptador LoRA, puede desplegarse en infraestructura modesta para pruebas de concepto.
- Investigación en fine-tuning eficiente: sirve como ejemplo de adaptación de un modelo grande a una tarea específica con pocos recursos, útil para estudiar metodologías LoRA en dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este adaptador específico. El modelo base EXAONE 3.5-7.8B-Instruct reporta métricas en el paper técnico (arXiv:2412.04862), pero no se detallan aquí. No se dispone de comparaciones con otros adaptadores similares.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 7.8B, el requisito principal es el del modelo base. Con cuantización de 4 bits, se necesitan aproximadamente 5-6 GB de VRAM; con 8 bits, unos 8-9 GB; en precisión completa (FP16), unos 16 GB. Estas cifras son orientativas y dependen de la implementación y la longitud de la secuencia.
- GPU recomendadas: para una inferencia fluida, una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070/4060) puede ejecutar el modelo cuantizado a 4 bits. Para FP16, se recomienda una RTX 3090, RTX 4090 o A100.
- Sí cabe en GPUs de consumo, especialmente con cuantización.
- Opciones de despliegue: el adaptador LoRA se puede cargar con la librería `peft` sobre el modelo base. Para servir en producción, se puede usar vLLM, TGI o llama.cpp (si se convierte el modelo combinado a GGUF). También es compatible con Ollama, que ya ofrece el modelo base EXAONE 3.5:7.8b.
- Latencia y throughput: no disponibles para este adaptador. El modelo base de 7.8B en una RTX 4090 puede generar alrededor de 50-80 tokens por segundo en FP16, pero esto es una estimación general.

## Comparativa con modelos similares

La comparativa se realiza a nivel del modelo base, ya que el adaptador no tiene métricas propias. Se comparan modelos de tamaño similar (7-8B) con soporte multilingüe o de dominio general.

| Modelo | Parámetros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| EXAONE 3.5-7.8B-Instruct (base) | 7.8B | 32K | Coreano, inglés | Propietaria de LG AI Research |
| Llama 3.1 8B Instruct | 8B | 128K | Multilingüe (8 idiomas) | Llama 3.1 (permisiva con condiciones) |
| Mistral 7B Instruct v0.3 | 7.3B | 32K | Inglés, francés, alemán, italiano, español | Apache 2.0 |
| Qwen 2.5 7B Instruct | 7.6B | 128K | Multilingüe (29 idiomas) | Apache 2.0 (Qwen) |

El adaptador LoRA no altera estas características, pero su especialización en finanzas conversacionales podría ofrecer ventajas en ese dominio frente a los modelos generalistas, siempre que el entrenamiento haya sido correcto.

## Limitaciones y advertencias

- La model card del adaptador está vacía: no hay información sobre el dataset de entrenamiento, los hiperparámetros, la metodología de evaluación ni el propósito exacto. Esto impide conocer su comportamiento fuera del dominio financiero.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar datos o cálculos incorrectos, especialmente en contextos financieros donde la precisión es crítica.
- Sesgos potenciales: si el dataset de entrenamiento contiene sesgos geográficos o de mercado, el modelo podría reflejarlos. No se ha realizado una auditoría de sesgos.
- Limitaciones de idioma: solo coreano e inglés, por lo que no es adecuado para otros idiomas.
- Licencia: la licencia del adaptador no está especificada. El modelo base tiene una licencia propia de LG AI Research que puede restringir el uso comercial. Se debe revisar antes de cualquier implementación en producción.
- Al ser un adaptador LoRA, su rendimiento depende en gran medida de la calidad y representatividad de los datos de fine-tuning. Sin validación externa, no se recomienda su uso directo en entornos críticos.

## Enlaces

- Adaptador LoRA: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed2026_step170
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE 3.5: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper técnico: https://arxiv.org/html/2412.04862v3
- Página de Ollama para EXAONE 3.5: https://ollama.com/library/exaone3.5:7.8b
