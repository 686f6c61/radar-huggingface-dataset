# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step510

## Resumen

Este repositorio contiene un adaptador LoRA basado en el modelo coreano EXAONE-3.5-7.8B-Instruct de LG AI Research, publicado por el usuario sbcho0325. El adaptador se ha ajustado mediante supervisión fina (SFT) para la tarea de ConvFinQA, un conjunto de datos de razonamiento numérico conversacional en el dominio financiero. El nombre del repositorio sugiere que el entrenamiento se centró en preguntas de opción múltiple (MCQ) con un objetivo de precisión de razonamiento conversacional financiero, en el paso de entrenamiento 510.

El modelo resultante es un adaptador de 0,3 GB que debe combinarse con el modelo base EXAONE-3.5-7.8B-Instruct para su uso. EXAONE 3.5 es una familia de modelos de lenguaje grandes (LLM) desarrollada por LG AI Research que incluye versiones de 2,4B, 7,8B y 32B parámetros, todos ellos con soporte de contexto largo de hasta 32K tokens. Este adaptador hereda las capacidades del modelo base y las especializa para el dominio financiero conversacional.

La relevancia de este modelo radica en su especialización para un dominio concreto: el análisis de conversaciones financieras con razonamiento numérico. Aunque la información pública es limitada, su existencia demuestra el ecosistema de adaptadores que se está generando alrededor de los modelos EXAONE 3.5, que destacan por su licencia permisiva para uso comercial y su buen rendimiento en tareas multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | 7.8B (modelo base) + adaptador LoRA de 0,3 GB |
| Parametros activos | 7.8B (no es MoE) |
| Longitud de contexto | 32K tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar) |
| Idiomas soportados | no disponible (el modelo base EXAONE 3.5 soporta principalmente coreano e ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base EXAONE-3.5-7.8B-Instruct es un transformer decoder-only con 7.8B parámetros, entrenado por LG AI Research. La arquitectura sigue el diseño estándar de los LLM modernos con atención multi-cabeza, normalización previa y embeddings de posición rotativos (RoPE). El modelo base fue ajustado con instrucciones (instruction tuning) y es el punto de partida para este adaptador.

El adaptador se entrenó con la librería PEFT (Parameter-Efficient Fine-Tuning) versión 0.19.1, utilizando la técnica LoRA (Low-Rank Adaptation) y el framework TRL (Transformers Reinforcement Learning) para el ajuste por supervisión fina (SFT). El nombre del repositorio indica que el entrenamiento se realizó sobre el conjunto de datos ConvFinQA, especializado en razonamiento numérico conversacional en el dominio financiero, con preguntas de opción múltiple y un objetivo de precisión. El paso de entrenamiento 510 sugiere un entrenamiento relativamente corto, probablemente para evitar el sobreajuste.

No se dispone de información detallada sobre los hiperparámetros de entrenamiento, el número de tokens de entrenamiento ni la composición exacta del dataset. El autor también ha publicado otros adaptadores similares con variaciones en la semilla aleatoria y en la estrategia de selección de preguntas, lo que sugiere una exploración sistemática de configuraciones de entrenamiento.

## Capacidades

- Generación de texto conversacional en el dominio financiero, especializado en preguntas de opción múltiple con razonamiento numérico.
- Razonamiento numérico sobre conversaciones financieras: el modelo puede procesar diálogos que contienen datos numéricos y realizar cálculos o inferencias sobre ellos.
- Comprensión de contexto largo: hereda la ventana de 32K tokens del modelo base EXAONE-3.5-7.8B-Instruct.
- Capacidades multilingües limitadas: el modelo base EXAONE 3.5 está entrenado principalmente en coreano e inglés, por lo que el adaptador hereda estas limitaciones.
- Tool calling y function calling: el modelo base EXAONE-3.5-7.8B-Instruct soporta estas capacidades, que se preservan en el adaptador.
- Capacidad de agente: el modelo base puede utilizarse en flujos multi-paso, aunque no se ha verificado específicamente para este adaptador.

## Casos de uso

- Análisis de conversaciones financieras: el modelo puede procesar diálogos entre clientes y agentes financieros, extrayendo información numérica relevante y respondiendo preguntas sobre montos, fechas y condiciones.
- Sistemas de soporte a decisión financiera: dado un historial conversacional con datos de inversiones o gastos, el modelo puede responder preguntas de opción múltiple sobre el estado financiero del cliente.
- Automatización de evaluaciones financieras: en entornos educativos o de certificación, puede generar o responder preguntas de opción múltiple sobre casos financieros conversacionales.
- Chatbots bancarios especializados: integrado en un sistema de atención al cliente, puede gestionar consultas que requieren razonamiento numérico sobre la información de la cuenta del usuario.
- Investigación académica en NLP financiero: como punto de partida para experimentos de fine-tuning adicional o evaluación de técnicas de adaptación de dominio en el sector financiero.
- Extracción de información de actas y reuniones financieras: el modelo puede procesar transcripciones de reuniones con contenido numérico y responder preguntas sobre acuerdos, cifras y compromisos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de evaluación en la model card, y no se encontraron resultados de rendimiento en la búsqueda web. El nombre del repositorio sugiere que se optimizó la precisión en preguntas de opción múltiple (mcq_pc_accuracy), pero no se ofrecen valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es pequeño (0,3 GB), pero requiere cargar el modelo base de 7.8B parámetros. Con cuantización de 4 bits, se necesitan aproximadamente 5-6 GB de VRAM; con precisión completa (fp16), alrededor de 16 GB.
- GPU recomendadas: para inferencia con cuantización, una RTX 3060 de 12 GB o superior es suficiente. Para precisión completa o fine-tuning adicional, se recomienda una RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo con 8-12 GB de VRAM si se utiliza cuantización (4 bits o 8 bits).
- Opciones de despliegue: el adaptador PEFT puede cargarse con transformers y peft. El modelo base es compatible con vLLM, llama.cpp, Ollama y TGI, aunque el adaptador requerirá una integración manual con estas herramientas.
- Latencia y throughput: no disponible. Depende del hardware y de la configuración de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step510 | 7.8B + LoRA | 32K | no disponible | Conversacion financiera con MCQ |
| sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed2026_step510 | 7.8B + LoRA | 32K | no disponible | Conversacion financiera con MCQ (variante con semilla aleatoria) |
| sbcho0325/EXAONE-3.5-7.8B-Instruct-ConvFinQA-SFT-DPO | 7.8B + LoRA | 32K | no disponible | Conversacion financiera con SFT + DPO |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (modelo base) | 7.8B | 32K | EXAONE AI Model License | Modelo generalista con instrucciones |

La comparativa se limita a los adaptadores del mismo autor sobre el mismo modelo base. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas. El modelo base EXAONE-3.5-7.8B-Instruct es la referencia natural para evaluar la mejora que aporta el adaptador.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos o limitaciones específicas del adaptador. Se heredan las del modelo base EXAONE-3.5-7.8B-Instruct.
- El modelo base EXAONE 3.5 está entrenado principalmente en coreano e inglés; su rendimiento en otros idiomas, incluido el español, puede ser limitado.
- Riesgo de alucinación en datos numéricos: los modelos especializados en razonamiento financiero pueden generar cifras incorrectas si el contexto no es suficiente o si la pregunta es ambigua.
- Licencia no disponible: no se puede confirmar si el adaptador puede utilizarse comercialmente. El modelo base EXAONE-3.5-7.8B-Instruct tiene una licencia propia de LG AI que permite uso comercial, pero la licencia del adaptador no está especificada.
- El adaptador requiere el modelo base para funcionar; no es un modelo autónomo.
- El entrenamiento en el paso 510 sugiere un ajuste relativamente corto, lo que podría limitar la generalización del adaptador a dominios financieros fuera del conjunto ConvFinQA.
- No se dispone de información sobre el dataset de entrenamiento, por lo que no se pueden evaluar posibles sesgos en los datos financieros utilizados.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step510
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE 3.5 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper de EXAONE 3.5: https://arxiv.org/html/2412.04862v3
- Adaptador variante con semilla aleatoria: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed2026_step510
- Adaptador con SFT + DPO: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-Instruct-ConvFinQA-SFT-DPO
- Paper de referencia para estimación de emisiones (citado en la model card): https://arxiv.org/abs/1910.09700
