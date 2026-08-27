# AMAImedia/NOESIS-Qwopus3.5-9B-Supervisor-v3.5-MLX

## Resumen

NOESIS-Qwopus3.5-9B-Supervisor-v3.5-MLX es un modelo de lenguaje especializado en supervisión, juicio de respuestas, routing y coordinación multi-agente, desarrollado por AMAImedia como parte de la plataforma NOESIS Professional Multilingual Dubbing Automation Platform, bajo el framework DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators). Se trata de la conversión a formato MLX del modelo original BF16 del mismo nombre, diseñada específicamente para inferencia en Apple Silicon mediante `mlx-lm`.

El modelo se basa en la arquitectura Qwen3_5ForCausalLM de la familia Qwen3.5, con aproximadamente 9.000 millones de parámetros (8.953.801.728 exactamente) y una ventana de contexto de 262.144 posiciones. Su función principal es actuar como supervisor en flujos de doblaje multilingüe automatizado: revisar decisiones, evaluar instrucciones, juzgar respuestas y coordinar agentes. Su relevancia radica en que es un modelo original entrenado por AMAImedia (no un simple fine-tune) y en su amplio soporte multilingüe de 201 lenguas y dialectos, heredado de la familia Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (qwen3_5) |
| Parametros totales | 8.953.801.728 (aproximadamente 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 posiciones |
| Tipos de cuantizacion | BF16 (almacenado); cuantizacion adicional no documentada |
| Idiomas soportados | 201 lenguas y dialectos (heredado de Qwen3.5/Qwen3) |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (4 shards, ~17,93 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Qwen3_5ForCausalLM` con 32 capas, tamaño oculto de 4096 y tamaño intermedio de 12288. Es un modelo transformer causal de generación de texto, entrenado originalmente en BF16 por AMAImedia como parte de la plataforma NOESIS v16.1. La model card lo describe como un "original-trained-model", lo que indica que es un entrenamiento propio sobre la base Qwen3.5, no un simple fine-tune. El framework DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators) sugiere un enfoque de control híbrido determinista aplicado a operadores neuronales congelados, aunque no se proporcionan detalles técnicos adicionales sobre el proceso de entrenamiento, el dataset utilizado o si se emplearon técnicas como RLHF o DPO. El tokenizer es el de Qwen3.5 con plantilla de chat `chat_template.jinja`.

## Capacidades

- Supervisión de instrucciones: revisa y valida instrucciones en flujos de trabajo automatizados.
- Juicio de respuestas: evalúa respuestas generadas por otros modelos o agentes, emitiendo veredictos tipo PASS, WARN o FAIL con evidencia.
- Decisiones de routing: determina qué agente o modelo debe procesar una tarea concreta.
- Coordinación multi-agente: gestiona y orquesta la interacción entre múltiples agentes especializados.
- Generación de texto conversacional: soporta chat multi-turno mediante la plantilla `chat_template.jinja`.
- Soporte multilingüe: cobertura de 201 lenguas y dialectos, incluyendo español, francés, alemán, chino, árabe, hindi, japonés, coreano, entre otros.
- Contexto largo: ventana de 262.144 tokens, adecuada para revisión de documentos extensos o historiales de conversación prolongados.
- Inferencia en Apple Silicon: optimizado para ejecución local con `mlx-lm` en hardware Apple.

## Casos de uso

- Revisión de decisiones de doblaje: el modelo puede evaluar si una traducción o sincronización de doblaje es aceptable, emitiendo un veredicto PASS, WARN o FAIL con justificación, gracias a su rol de supervisor especializado en la plataforma NOESIS.
- Control de calidad en pipelines de generación de contenido: integrado como juez automático que valida la salida de otros modelos de lenguaje antes de su publicación, aprovechando su capacidad de juicio de respuestas.
- Routing de tareas en sistemas multi-agente: en una arquitectura con varios agentes especializados, el modelo decide qué agente debe encargarse de cada solicitud, basándose en su función de routing y coordinación.
- Moderación de conversaciones en atención al cliente: con su contexto de 262k tokens, puede supervisar largas conversaciones multi-turno y detectar desviaciones o respuestas inadecuadas.
- Evaluación de instrucciones en sistemas de automatización: valida que las instrucciones dadas a otros modelos sean claras, completas y ejecutables, reduciendo errores en flujos de trabajo automatizados.
- Supervisión de traducción automática multilingüe: dado su soporte de 201 lenguas, puede revisar la calidad de traducciones en múltiples idiomas y señalar errores de coherencia o precisión.
- Coordinación de agentes en entornos de investigación: como orquestador en experimentos que requieren múltiples modelos trabajando en paralelo, gestionando la asignación de tareas y la consolidación de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Plataforma: Apple Silicon (M1, M2, M3 o superior), ya que el modelo está diseñado para el backend MLX.
- Memoria: el repositorio pesa aproximadamente 17,93 GB en BF16. Para inferencia con `mlx-lm` se recomienda un Mac con memoria unificada suficiente para alojar el modelo y el KV cache. No se especifica una cifra exacta, pero un Mac con 32 GB o más sería adecuado para la mayoría de usos.
- Cuantización: aunque el modelo se distribuye en BF16, `mlx-lm` permite cuantizar a 4 u 8 bits para reducir el uso de memoria, a costa de una posible pérdida de precisión.
- Despliegue: mediante `mlx-lm` (generación por línea de comandos o modo chat) o con un servidor compatible con la API de OpenAI (según se menciona en la model card, aunque el texto está truncado).
- Limitaciones de contexto: la ventana de 262k tokens es un límite arquitectónico, no una garantía de que todos los Mac puedan mantener un KV cache de ese tamaño. Se recomienda ajustar `--max-kv-size` y `--prefill-step-size` para evitar picos de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NOESIS-Qwopus3.5-9B-Supervisor-v3.5-MLX | ~9B | 262.144 | no disponible | MLX safetensors | Especializado en supervisión y routing |
| NOESIS-Qwopus3.5-9B-Supervisor-v3.5-BF16 | ~9B | 262.144 | no disponible | Transformers/GGUF | Versión primaria del mismo modelo |
| Qwen3.5 (base, 9B) | ~9B | no disponible | no disponible | no disponible | Modelo base sobre el que se construye Qwopus3.5 |
| Qwopus3.5-v3 (fine-tune) | no disponible | no disponible | no disponible | no disponible | Familia de fine-tunes de Qwen3.5 con énfasis en razonamiento y programación |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a características estructurales y de disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un modelo derivado de Qwen3.5, puede heredar sesgos presentes en los datos de entrenamiento de la familia.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de juicio o supervisión si no se le proporciona suficiente contexto.
- Limitaciones de idioma: aunque declara soporte para 201 lenguas, la model card advierte que no todos los idiomas tendrán la misma calidad de producción. Para doblaje, las decisiones del supervisor deben pasar por compuertas humanas de traducción, ASR y sincronización.
- Restricciones de licencia: la licencia no está disponible, lo que impide conocer las condiciones de uso comercial, redistribución o modificación. Se recomienda contactar con AMAImedia antes de usar el modelo en producción.
- Requisitos de hardware: el modelo está limitado a Apple Silicon; no es compatible con GPUs NVIDIA o AMD sin conversión previa a otro formato (como GGUF o Transformers).
- Límites de contexto prácticos: la ventana de 262k tokens es teórica; en la práctica, la memoria disponible en el Mac limita el tamaño real del KV cache. Para prompts largos, se recomienda reducir `--prefill-step-size` y acotar `--max-kv-size`.
- Dependencia del framework NOESIS: el modelo está diseñado para operar dentro de la plataforma NOESIS; su uso fuera de ese contexto puede requerir adaptaciones y no se garantiza el mismo rendimiento.

## Enlaces

- Modelo MLX en HuggingFace: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-Supervisor-v3.5-MLX
- Modelo BF16 original: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-Supervisor-v3.5-BF16
- Colección de modelos originales NOESIS: https://huggingface.co/collections/AMAImedia/noesis-original-trained-models
- Modelo relacionado (PromptEng): https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-PromptEng-v3.5-BF16
- Repositorio de entrenamiento Qwopus3.5 (tercero): https://github.com/moolinex/qwopus3.5_v3
- Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
- Qwopus3.5 en Ollama (tercero): https://ollama.com/fredrezones55/Qwopus3.5
