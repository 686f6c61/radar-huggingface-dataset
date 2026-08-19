# niljen/xearnes-phi4-mini

## Resumen

`niljen/xearnes-phi4-mini` es un modelo de lenguaje fine-tuneado a partir de `microsoft/Phi-4-mini-instruct`, un modelo de 3.800 millones de parámetros con arquitectura transformer decoder y una ventana de contexto de 128.000 tokens. El autor, niljen, ha aplicado un entrenamiento de ajuste supervisado (SFT) utilizando la librería TRL de Hugging Face, sin que se documenten públicamente los datos de entrenamiento ni el objetivo específico del ajuste.

El modelo se presenta como una alternativa conversacional y de generación de texto que hereda las capacidades del Phi-4-mini-instruct original, que destaca por su eficiencia en tareas de razonamiento, código y matemáticas con un tamaño reducido. Su relevancia radica en que permite desplegar un asistente de lenguaje en hardware de gama media, aunque la falta de información sobre el dataset de fine-tuning limita la evaluación de sus capacidades específicas.

Al ser un fine-tune reciente (creado en julio de 2026) con pocas descargas (62), se encuentra en una fase temprana de adopción. No se han publicado benchmarks ni evaluaciones independientes, por lo que su rendimiento real debe considerarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basada en Phi-4-mini-instruct) |
| Parametros totales | 3.800 millones (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (no se indican en el repositorio) |
| Idiomas soportados | No disponible (el modelo base soporta principalmente ingles, pero no se especifica para este fine-tune) |
| Licencia | No disponible (el README indica "license" sin detallar; la ficha de HuggingFace no la especifica) |
| Formato de pesos | safetensors (según las etiquetas del repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de `microsoft/Phi-4-mini-instruct`, un transformer decoder denso con 3.800 millones de parámetros y una ventana de contexto de 128.000 tokens. El fine-tuning se realizó mediante entrenamiento supervisado (SFT) con la librería TRL (versión 1.10.0) sobre el modelo base, utilizando PyTorch 2.8.0 y Transformers 5.15.0. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas adicionales como RLHF o DPO.

El proceso de entrenamiento se describe únicamente como "SFT" en la model card, sin información sobre hiperparámetros, duración o configuración del ajuste. Dado que el modelo base ya incorpora técnicas de entrenamiento avanzadas (como atención de ventana larga y optimización para razonamiento), es probable que el fine-tune haya buscado adaptar el comportamiento a un dominio o estilo conversacional específico, pero esta hipótesis no puede confirmarse con los datos disponibles.

## Capacidades

- Generación de texto y conversación multi-turno: hereda la capacidad del modelo base para mantener diálogos coherentes, aunque el fine-tune podría haber modificado el estilo.
- Razonamiento y matemáticas: el Phi-4-mini-instruct original está optimizado para tareas de razonamiento lógico y aritmético, capacidades que se mantienen en el fine-tune salvo que el ajuste las haya degradado.
- Generación de código: el modelo base tiene buen rendimiento en tareas de programación, aunque no hay evidencia específica para este fine-tune.
- Soporte de tool calling y function calling: no se documenta explícitamente, pero el modelo base sí lo soporta; se espera que el fine-tune lo conserve.
- Capacidades multilingües: no se especifican para este modelo; el base está principalmente entrenado en inglés, con algo de multilingüismo limitado.
- Modo de pensamiento (thinking mode): no se menciona, aunque el base puede tener modos de razonamiento extendido.

## Casos de uso

- Asistente conversacional en aplicaciones de chat: gracias a su tamaño reducido (3.8B) y contexto largo, puede integrarse en chatbots de servicio al cliente o asistentes personales que requieran mantener conversaciones extensas sin perder el hilo.
- Generación de código en entornos de desarrollo: con soporte heredado para código, puede usarse como autocompletado o generador de funciones en editores, especialmente en flujos donde el contexto del proyecto es amplio.
- Análisis de documentos largos: la ventana de 128K tokens permite procesar informes, artículos o contratos completos para resumir, extraer información o responder preguntas sobre ellos.
- Prototipado rápido de aplicaciones de IA: al ser un modelo pequeño y compatible con Transformers, es adecuado para experimentación en notebooks o entornos con recursos limitados.
- Educación y tutoría: puede emplearse como tutor virtual para explicar conceptos de programación, matemáticas o ciencias, aprovechando su capacidad de razonamiento.
- Automatización de tareas de redacción: redacción de correos, informes o documentación técnica a partir de instrucciones, con la posibilidad de ajustar el tono mediante prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y no se encontraron referencias externas al rendimiento del modelo en tareas estándar como MMLU, HumanEval o GSM8K. Se recomienda realizar evaluaciones propias antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 3.8B parámetros, en precisión FP16 requiere aproximadamente 7-8 GB de VRAM. Con cuantización a 4 bits (GPTQ/AWQ) puede reducirse a unos 3-4 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3060/3070/4060, o GPUs de datacenter como A10G o L4. Para despliegues profesionales, A100 o H100 ofrecen mayor throughput.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media con cuantización, y en gama alta (RTX 4090) sin cuantizar.
- Opciones de despliegue: compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI y el pipeline de Transformers. No se han publicado configuraciones específicas.
- Latencia y throughput: no se han medido para este fine-tune; en el modelo base, la generación suele rondar los 20-30 tokens/s en una RTX 4090 con cuantización 4 bits, pero estos valores son orientativos y no verificados.

## Comparativa con modelos similares

No se dispone de comparativas publicadas para este fine-tune. Como referencia, se puede comparar con el modelo base `microsoft/Phi-4-mini-instruct` y con otros modelos de tamaño similar como `Qwen2.5-3B-Instruct` o `Llama-3.2-3B-Instruct`. Sin embargo, sin datos de benchmarks específicos, no es posible establecer una comparación cuantitativa fiable. Se recomienda consultar las fichas de estos modelos para obtener métricas de referencia.

## Limitaciones y advertencias

- Sesgos desconocidos: al no documentarse el dataset de fine-tuning, no se pueden identificar sesgos específicos introducidos durante el ajuste. El modelo base ya presenta sesgos típicos de los datos de entrenamiento de Phi-4.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en temas de actualidad o datos específicos.
- Limitaciones de idioma: el modelo base está principalmente entrenado en inglés; su rendimiento en otros idiomas puede ser inferior, y no se ha verificado el comportamiento del fine-tune en castellano u otras lenguas.
- Licencia incierta: la licencia no está claramente especificada, lo que puede generar problemas legales para uso comercial. Se recomienda contactar al autor o revisar la licencia del modelo base (que es MIT) para aclarar los términos.
- Falta de evaluación: la ausencia de benchmarks y de documentación sobre el proceso de entrenamiento dificulta la evaluación de su calidad y fiabilidad.
- Posible degradación de capacidades: el fine-tuning puede haber alterado el comportamiento del modelo base, reduciendo su rendimiento en tareas generales si el ajuste fue demasiado específico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/niljen/xearnes-phi4-mini
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Librería TRL: https://github.com/huggingface/trl
