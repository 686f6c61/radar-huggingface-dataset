# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_uniform_random_seed42_handoff_sft_step340

## Resumen

El modelo `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_uniform_random_seed42_handoff_sft_step340` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante *supervised fine-tuning* (SFT) sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`. El nombre del repositorio sugiere que el ajuste se ha realizado para tareas de conversación financiera (`convfin`), preguntas de opción múltiple (`mcq`), con una estrategia de selección uniforme de prompts (`pc_uniform`) y un mecanismo de *handoff* entre tareas. El adaptador está diseñado para ser cargado sobre el modelo base y no contiene los pesos completos del modelo, sino únicamente los parámetros adicionales de la adaptación LoRA.

Este adaptador no es un modelo independiente: su utilidad práctica depende de que se combine con el modelo base EXAONE-3.5-7.8B-Instruct, que es un modelo de lenguaje de 7.800 millones de parámetros desarrollado por LG AI Research, con soporte de contexto largo de hasta 32.000 tokens y optimizado para casos de uso reales, incluyendo razonamiento, generación de código y conversación multilingüe. La relevancia de este adaptador reside en que permite especializar un modelo generalista a dominios concretos (finanzas, evaluación mediante preguntas de opción múltiple) sin necesidad de reentrenar todos los pesos, reduciendo costes computacionales y de almacenamiento.

La información pública disponible sobre este adaptador es muy limitada: la model card no incluye detalles de entrenamiento, datos utilizados, licencia ni resultados de evaluación. Por tanto, esta ficha se basa en los datos del modelo base y en las características técnicas del adaptador que se pueden deducir de la estructura del repositorio y de las etiquetas de HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base EXAONE-3.5-7.8B-Instruct) + adaptador LoRA |
| Parametros totales | 7.800 millones (modelo base) + parametros del adaptador LoRA (no especificados) |
| Parametros activos | No disponible (al ser un adaptador, todos los parametros del modelo base se activan durante la inferencia, mas los del adaptador) |
| Longitud de contexto | 32.768 tokens (del modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones estandar (por ejemplo, 4-bit, 8-bit) |
| Idiomas soportados | Coreano e ingles (segun el modelo base; el adaptador no especifica idiomas adicionales) |
| Licencia | No disponible (la model card del adaptador no indica licencia; el modelo base EXAONE-3.5 tiene licencia propia de LG) |
| Formato de pesos | Safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo base EXAONE-3.5-7.8B-Instruct es un transformer decoder-only con atención causal completa, entrenado por LG AI Research. El adaptador LoRA añade matrices de baja dimensión a las capas de atención y feed-forward del modelo base, de modo que solo se actualizan estos parámetros durante el fine-tuning. El entrenamiento del adaptador se realizó mediante SFT (supervised fine-tuning) con la biblioteca TRL y PEFT 0.19.1, como se indica en las etiquetas del repositorio. No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del repositorio sugiere que el proceso de entrenamiento incluyó una selección aleatoria de prompts con una semilla fija (`seed42`) y un *handoff* entre diferentes tareas (conversación financiera y preguntas de opción múltiple), pero no hay más detalles técnicos disponibles.

## Capacidades

- Generación de texto en formato conversacional, heredada del modelo base EXAONE-3.5-7.8B-Instruct.
- Razonamiento de propósito general (matemáticas, lógica, conocimiento común) gracias a las capacidades del modelo base.
- Generación de código: el modelo base EXAONE-3.5 tiene buen rendimiento en tareas de programación, por lo que el adaptador podría heredar esta capacidad.
- Soporte de *tool calling* y *function calling*: el modelo base EXAONE-3.5-7.8B-Instruct soporta llamadas a herramientas, pero no se ha verificado que el adaptador mantenga esta capacidad tras el fine-tuning.
- Capacidades multilingües: el modelo base está entrenado principalmente en coreano e inglés; el adaptador no añade idiomas adicionales.
- Especialización en conversación financiera y preguntas de opción múltiple (MCQ), según el nombre del repositorio, aunque no se ha confirmado con resultados.

## Casos de uso

- Asistentes de atención al cliente en el sector financiero: el adaptador, combinado con el modelo base, puede gestionar conversaciones multi-turno sobre productos bancarios, consultas de saldo o aclaraciones de normativa, gracias a la ventana de contexto de 32 tokens del modelo base y al fine-tuning específico en conversación financiera.
- Evaluación automática de conocimientos financieros: el adaptador puede generar preguntas de opción múltiple y evaluar respuestas en contextos educativos o de certificación, aprovechando la parte de MCQ del entrenamiento.
- Análisis de documentos financieros: con el contexto de 32 tokens, el modelo puede resumir informes, extraer datos relevantes o responder preguntas sobre balances y cuentas.
- Sistemas de *handoff* entre agentes: el adaptador ha sido entrenado con un mecanismo de *handoff*, lo que podría facilitar la transferencia de una conversación entre diferentes módulos o agentes en un sistema de atención al cliente.
- Creación de chatbots especializados en banca o seguros: el adaptador puede integrarse en plataformas de chat usando el modelo base como backbone, reduciendo el coste de despliegue al no requerir un modelo completo de 7.8B entrenado desde cero.
- Investigación en fine-tuning eficiente: este adaptador sirve como ejemplo de cómo especializar un modelo de 7.8B con una pequeña cantidad de parámetros adicionales (LoRA), útil para experimentos de bajo coste en dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este adaptador. La model card no incluye métricas de evaluación, y el repositorio no ofrece comparaciones con otros modelos. Se recomienda al usuario evaluar el rendimiento del adaptador sobre el modelo base en las tareas objetivo (conversación financiera y MCQ) antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base EXAONE-3.5-7.8B-Instruct requiere aproximadamente 16 GB de VRAM en FP16. El adaptador LoRA añade una cantidad insignificante (menos de 0.5 GB). Con cuantización de 4 bits, la VRAM puede reducirse a unos 5 GB.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB VRAM) para FP16 sin cuantización; GPU con 8-12 GB VRAM (por ejemplo, RTX 3070/4060) con cuantización de 4 bits.
- ¿Cabe en una GPU de consumo? Sí, con cuantización de 4 bits y un GPU de 8 GB o más puede ejecutarse.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference) o directamente con Transformers + PEFT. Para el adaptador LoRA, es necesario cargar primero el modelo base y luego el adaptador mediante `PeftModel.from_pretrained`.
- Latencia y throughput: no disponibles. Se estima una latencia similar al modelo base (aproximadamente 20-40 tokens/s en una RTX 4090 con cuantización, pero no hay datos oficiales).

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador para compararlo directamente con otros modelos. No obstante, el modelo base EXAONE-3.5-7.8B-Instruct puede compararse con alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Licencia de LG (uso comercial permitido con restricciones) | Modelo coreano, buen rendimiento en código y razonamiento |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Ampliamente usado, multilingüe |
| Qwen2.5-7B-Instruct | 7.6B | 32K | Apache 2.0 | Buen rendimiento en chino e inglés, soporte de herramientas |

El adaptador LoRA no altera la arquitectura del modelo base, por lo que la comparativa con estos modelos se refiere al comportamiento del modelo base. No se dispone de datos específicos del adaptador para comparar.

## Limitaciones y advertencias

- La model card del adaptador no proporciona información sobre sesgos, riesgos o limitaciones. El modelo base EXAONE-3.5 puede heredar sesgos de los datos de entrenamiento de LG, especialmente en dominios financieros donde los datos pueden ser desequilibrados.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos financieros donde la precisión es crítica.
- Limitaciones de idioma: el modelo base está optimizado para coreano e inglés; el adaptador no amplía el soporte a otros idiomas.
- Restricciones de licencia: no se ha indicado la licencia del adaptador. El modelo base EXAONE-3.5 tiene una licencia propia que permite uso comercial pero con restricciones (no se puede usar para servicios que compitan con LG). Se recomienda revisar la licencia del modelo base antes de usar el adaptador.
- El adaptador es un artefacto de investigación (no tiene descargas ni likes) y no ha sido validado de forma independiente. Su calidad y robustez no están garantizadas.
- El tamaño del repositorio (0.3 GB) sugiere que solo contiene los pesos del adaptador, no el modelo completo. Para usarlo, se debe descargar también el modelo base, que tiene un tamaño de aproximadamente 15 GB en FP16.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_uniform_random_seed42_handoff_sft_step340
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE 3.5: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper de EXAONE 3.5: https://arxiv.org/html/2412.04862v3
