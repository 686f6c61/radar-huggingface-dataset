# SF-Foundation/Gemma4-26B-FinetunedLoRA

## Resumen

SF-Foundation/Gemma4-26B-FinetunedLoRA es un adaptador LoRA (Low-Rank Adaptation) desarrollado por SF-Foundation sobre el modelo base google/gemma-4-26B-A4B-it, la variante de 26 000 millones de parámetros con arquitectura de mezcla de expertos (MoE) de la familia Gemma 4 de Google DeepMind. El adaptador se publica en formato PEFT (Parameter-Efficient Fine-Tuning) y ocupa aproximadamente 0,3 GB, lo que indica que contiene únicamente los pesos del adaptador y no los del modelo base completo.

Este tipo de adaptador permite especializar un modelo base de gran tamaño en tareas concretas sin necesidad de reentrenar todos los parámetros, reduciendo drásticamente los costes computacionales y de almacenamiento. El modelo base Gemma 4 26B A4B destaca por su arquitectura MoE con 4 000 millones de parámetros activos, decodificación especulativa mediante un modelo draft dedicado y soporte para razonamiento, agentes y código. Sin embargo, la model card del adaptador no proporciona información sobre el dataset de entrenamiento, los hiperparámetros ni el propósito específico del fine-tuning, lo que limita la evaluación de sus capacidades reales.

La relevancia de este adaptador radica en su potencial para adaptar un modelo de última generación a dominios específicos con un coste reducido, aunque la falta de documentación por parte del autor dificulta su uso en entornos de producción sin una evaluación previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Gemma 4 26B A4B (MoE, transformer) |
| Parametros totales | No disponible (el adaptador ocupa 0,3 GB; el modelo base tiene 26B totales, 4B activos) |
| Parametros activos | No disponible (el modelo base tiene 4B activos) |
| Longitud de contexto | No disponible (la del modelo base, no publicada en esta ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones habituales) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre google/gemma-4-26B-A4B-it, un modelo de la familia Gemma 4 de Google DeepMind. El modelo base emplea una arquitectura transformer con mezcla de expertos (MoE): de sus 26 000 millones de parámetros totales, solo 4 000 millones se activan por token, lo que permite una inferencia más eficiente en comparación con un modelo denso del mismo tamaño. Gemma 4 incorpora además un modelo draft dedicado para decodificación especulativa, acelerando la generación sin pérdida de calidad.

El adaptador se entrenó mediante fine-tuning supervisado (SFT) según los tags del repositorio, que incluyen `sft`, `lora` y `trl` (la librería de transformers para RLHF y SFT de HuggingFace). No se especifican el dataset, el número de pasos, la tasa de aprendizaje ni el régimen de precisión. La ausencia de esta información impide conocer la tarea concreta para la que se ajustó el modelo ni la calidad del entrenamiento.

## Capacidades

- Al ser un adaptador sobre Gemma 4 26B A4B, hereda las capacidades generales del modelo base: generación de texto, razonamiento, código, matemáticas y comprensión multilingüe (aunque los idiomas concretos no se documentan).
- Soporte de tool calling y function calling, según las capacidades del modelo base Gemma 4.
- Capacidad para flujos de trabajo agénticos y razonamiento multi-paso, habilitada por la arquitectura del modelo base.
- El adaptador no añade capacidades nuevas documentadas; su comportamiento específico depende del fine-tuning, del que no hay detalles.

## Casos de uso

- Adaptación a dominios especializados: el adaptador puede emplearse para ajustar el modelo base a un corpus técnico o científico concreto, aunque se desconoce el dominio objetivo del entrenamiento.
- Fine-tuning posterior sobre el adaptador: al ser un adaptador LoRA, puede combinarse con otros adaptadores o continuar su entrenamiento para tareas adicionales, aprovechando la eficiencia de PEFT.
- Inferencia en entornos con recursos limitados: al cargar únicamente el adaptador sobre un modelo base cuantizado, se puede desplegar en GPUs de consumo con requisitos de VRAM moderados.
- Evaluación comparativa de adaptadores: útil para investigadores que estudian el impacto de LoRA sobre modelos MoE de última generación.
- Prototipado rápido: permite experimentar con el modelo base sin necesidad de acceder a los pesos completos ni a infraestructura de alto coste.
- Integración en pipelines de generación aumentada por recuperación (RAG): el adaptador puede aplicarse sobre el modelo base para mejorar la adherencia a un estilo o formato específico, aunque sin datos de evaluación no se puede garantizar su eficacia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, ni comparaciones con el modelo base u otros adaptadores. Tampoco se dispone de datos de latencia o throughput específicos del adaptador.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa solo 0,3 GB y puede cargarse en cualquier GPU con al menos 1 GB de VRAM adicional al modelo base.
- El modelo base Gemma 4 26B A4B requiere cargar sus 26B de parámetros en memoria, aunque solo 4B estén activos por token. Con cuantización de 4 bits, se estiman entre 13 y 15 GB de VRAM para el modelo base, más el adaptador.
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para inferencia con cuantización; GPUs con menos VRAM (16 GB) pueden funcionar con cuantización más agresiva (2-3 bits), aunque con posible degradación de calidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si el adaptador se convierte a GGUF), HuggingFace Transformers con PEFT, y TGI (Text Generation Inference) si se fusiona el adaptador con el modelo base.
- La latencia y el throughput dependen del hardware y la cuantización; al ser un MoE con 4B activos, la velocidad de generación es comparable a la de un modelo denso de 4B, pero la carga de memoria es la de un modelo de 26B.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El adaptador no tiene benchmarks publicados, y no se conocen otros adaptadores LoRA sobre el mismo modelo base con los que contrastar. Como referencia, el modelo base Gemma 4 26B A4B compite con otros MoE como Mixtral 8x7B o Qwen2.5-32B-A3B, pero esta ficha no puede establecer comparaciones cuantitativas sin datos.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos ni limitaciones específicas del adaptador; se heredan las del modelo base Gemma 4, que no se detallan aquí.
- Riesgo de alucinación y errores factuales, inherente a los modelos de lenguaje generativos, sin evaluación específica para este adaptador.
- No se especifican los idiomas soportados ni la cobertura multilingüe, lo que limita su uso en aplicaciones multilingües sin pruebas previas.
- La licencia no está disponible, por lo que no se puede garantizar la legalidad del uso comercial. Se recomienda contactar con el autor antes de cualquier despliegue productivo.
- El propósito del fine-tuning es desconocido; el adaptador podría estar especializado en una tarea muy concreta y degradar su rendimiento en otras.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SF-Foundation/Gemma4-26B-FinetunedLoRA
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Visión general de Gemma 4: https://ai.google.dev/gemma/docs/core
- Guía de fine-tuning con LoRA/QLoRA: https://lushbinary.com/blog/fine-tune-gemma-4-lora-qlora-complete-guide/
- Entrada de Gemma 4 26B en Ollama: https://ollama.com/library/gemma4:26b
