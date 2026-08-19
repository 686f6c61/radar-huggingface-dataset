# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed1234_step170

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario sbcho0325, que se aplica sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, un modelo de lenguaje de 7.800 millones de parámetros desarrollado por LG AI Research. El nombre del repositorio sugiere un fine-tuning supervisado (SFT) sobre datos de conversación financiera (ConvFinQA), con preguntas de opción múltiple (MCQ) y una configuración aleatoria de PC (probablemente "policy constraint" o similar), usando una semilla fija (1234) y un paso de entrenamiento concreto (step 170).

La relevancia de este adaptador radica en que permite especializar un modelo base ya potente en tareas de razonamiento financiero conversacional, sin necesidad de reentrenar todos los parámetros. El modelo base EXAONE 3.5 destaca por su capacidad de seguir instrucciones en escenarios reales y por soportar contextos largos de hasta 32.000 tokens. Sin embargo, la documentación pública del adaptador es prácticamente inexistente: la model card del autor está vacía y no se han publicado detalles sobre el dataset, los hiperparámetros de entrenamiento ni los resultados de evaluación. Por tanto, esta ficha se basa en la información disponible del modelo base y en las inferencias razonables a partir del nombre del repositorio y las etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (modelo base EXAONE 3.5 7.8B Instruct) |
| Parametros totales | No disponible (el modelo base tiene 7.800 millones) |
| Parametros activos | No aplicable (adaptador LoRA, no MoE) |
| Longitud de contexto | Hasta 32.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base admite cuantizaciones GGUF, AWQ, etc.) |
| Idiomas soportados | No disponible (el modelo base EXAONE 3.5 soporta principalmente coreano e inglés) |
| Licencia | No disponible para el adaptador; el modelo base usa la licencia EXAONE 3.5 de LG AI Research |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que congela los pesos del modelo original e inyecta matrices de bajo rango en las capas de atención y feed-forward. El modelo base, EXAONE 3.5 7.8B Instruct, es un transformer decoder con atención causal estándar, entrenado por LG AI Research con un enfoque en el seguimiento de instrucciones y el uso en aplicaciones reales. Según el informe técnico de EXAONE 3.5, el modelo fue preentrenado con un corpus masivo y posteriormente ajustado con instrucciones, aunque no se especifican los detalles exactos del preentrenamiento en esta ficha.

El entrenamiento del adaptador, según el nombre del repositorio, consistió en un fine-tuning supervisado (SFT) sobre un conjunto de datos relacionado con ConvFinQA (un benchmark de razonamiento financiero conversacional). Las etiquetas indican que se usó la librería `trl` (Transformers Reinforcement Learning) y `peft` (Parameter-Efficient Fine-Tuning), con una semilla fija (1234) y un número de paso concreto (170). No se dispone de información sobre el tamaño del dataset, el número de épocas, la tasa de aprendizaje, el rango del LoRA ni el tipo de optimizador utilizado. Tampoco se ha publicado si se emplearon técnicas adicionales como DPO o RLHF.

## Capacidades

- Generación de texto y seguimiento de instrucciones: hereda las capacidades del modelo base EXAONE 3.5 7.8B Instruct, que destaca en tareas de instrucción complejas.
- Razonamiento financiero conversacional: por el nombre del repositorio, el adaptador está especializado en responder preguntas sobre finanzas en formato conversacional, probablemente con opciones múltiples (MCQ).
- Comprensión de contexto largo: al mantener la ventana de 32.000 tokens del modelo base, puede manejar conversaciones o documentos financieros extensos.
- Multilingüismo limitado: el modelo base está optimizado para coreano e inglés, por lo que el adaptador probablemente funciona mejor en esos idiomas.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso específico, aunque el modelo base puede tener ciertas capacidades en ese sentido.

## Casos de uso

Dado que no existe documentación oficial sobre el adaptador, los siguientes casos de uso son inferencias razonables basadas en el nombre del repositorio y en las capacidades del modelo base. Se recomienda validar cada escenario antes de usarlo en producción.

- Asistente de análisis financiero: el modelo puede responder preguntas sobre estados financieros, ratios y métricas en un diálogo multi-turno, aprovechando su contexto de 32.000 tokens para procesar informes extensos.
- Evaluación automatizada de respuestas financieras: al estar entrenado con preguntas de opción múltiple (MCQ), podría usarse para generar o evaluar respuestas en exámenes o cuestionarios financieros.
- Extracción de información de documentos financieros: con su capacidad de contexto largo, puede resumir o extraer datos relevantes de informes anuales, balances o noticias económicas.
- Chatbot de educación financiera: puede explicar conceptos de finanzas personales o empresariales en un tono conversacional, adaptado a un público no especializado.
- Soporte en plataformas de inversión: podría integrarse como asistente virtual para ayudar a usuarios a interpretar datos de mercado o a entender productos financieros.
- Investigación académica: el adaptador puede servir como punto de partida para experimentos sobre fine-tuning eficiente en dominios específicos, dada su naturaleza LoRA y su bajo coste de adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del adaptador no incluye métricas de evaluación, y la model card del autor está vacía. Los únicos datos de rendimiento conocidos son los del modelo base EXAONE 3.5 7.8B Instruct, que según el informe técnico de LG AI Research obtiene puntuaciones competitivas en tareas de instrucción, razonamiento y conocimiento general, pero no se dispone de esos números aquí. Se recomienda consultar el informe técnico de EXAONE 3.5 para obtener datos comparativos del modelo base.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa solo 0,3 GB y se puede cargar sobre el modelo base ya cuantizado, por lo que el requisito principal viene del modelo base de 7.800 millones de parámetros.
- En FP16, el modelo base requiere aproximadamente 16 GB de VRAM para inferencia. Con cuantización de 8 bits, baja a unos 8 GB; con 4 bits, a unos 5 GB.
- GPU recomendadas: una RTX 3090/4090 (24 GB) permite ejecutar el modelo en FP16 con margen; una RTX 3060 (12 GB) puede funcionar con cuantización de 8 bits o menos.
- Para despliegue en producción, se puede usar vLLM, TensorRT-LLM o TGI, que soportan modelos de este tamaño. Para entornos locales, llama.cpp u Ollama con GGUF son opciones viables.
- La latencia estimada depende del hardware y de la cuantización; en una GPU moderna con 16 GB, se pueden esperar decenas de tokens por segundo con batch pequeño.
- No se dispone de datos específicos de throughput para este adaptador concreto.

## Comparativa con modelos similares

La comparación se realiza con el modelo base EXAONE 3.5 7.8B Instruct y con otros modelos de tamaño similar, ya que no hay datos del adaptador en sí.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EXAONE 3.5 7.8B Instruct (base) | 7.800 M | 32.000 | EXAONE 3.5 License (uso comercial con restricciones) | Modelo base sobre el que se aplica el adaptador |
| Llama 3.1 8B Instruct | 8.030 M | 128.000 | Llama 3.1 Community License | Alternativa popular con contexto más largo y amplio soporte de la comunidad |
| Qwen 2.5 7B Instruct | 7.610 M | 32.000 | Apache 2.0 | Alternativa con licencia permisiva y buen rendimiento multilingüe |
| Adaptador LoRA (este modelo) | No disponible | 32.000 (heredado) | No disponible | Especializado en finanzas conversacionales, pero sin documentación |

No se dispone de comparativas de rendimiento entre el adaptador y estos modelos porque no hay benchmarks publicados.

## Limitaciones y advertencias

- La documentación del adaptador es prácticamente inexistente: no se especifican datos de entrenamiento, hiperparámetros, licencia ni resultados de evaluación. Su uso en producción conlleva un riesgo alto de desconocimiento del comportamiento real.
- El nombre del repositorio sugiere un entrenamiento sobre un dataset concreto (ConvFinQA) con una configuración específica (semilla, paso). No se sabe si el modelo generaliza bien fuera de ese dominio.
- El modelo base EXAONE 3.5 tiene sesgos potenciales derivados de sus datos de entrenamiento, especialmente en contextos culturales coreanos. El adaptador podría amplificar sesgos financieros si el dataset de entrenamiento los contiene.
- Existe riesgo de alucinación en respuestas financieras, lo que podría ser especialmente peligroso si se usa para asesoramiento real. No se recomienda su uso sin supervisión humana.
- La licencia del adaptador no está especificada. Aunque el modelo base permite uso comercial bajo ciertas condiciones, el adaptador podría tener restricciones adicionales no declaradas.
- El adaptador solo añade un pequeño conjunto de pesos LoRA; no incluye el modelo base completo. Para usarlo, es necesario descargar también el modelo base, que tiene un tamaño considerable (varios GB).
- No se ha verificado la compatibilidad con versiones recientes de las librerías Transformers y PEFT, aunque se indica que se usó PEFT 0.19.1.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed1234_step170
- Modelo base en Hugging Face: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE 3.5 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Informe técnico de EXAONE 3.5 (PDF): https://www.lgresearch.ai/data/upload/tech_report/en/Technical_report_EXAONE_3.5.pdf
- Versión GGUF del modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct-GGUF
