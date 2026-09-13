# Adihere69/VakilOS

## Resumen

VakilOS es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-7B-Instruct, publicado por el usuario Adihere69 en HuggingFace. El modelo está especializado en dominio jurídico indio: su entrenamiento se ha realizado sobre cuatro conjuntos de datos legales de la India, entre ellos kaushik-harsh-99/Indian-legal-data-v3, Prarabdha/indian-legal-supervised-fine-tuning-data, nisaar/Constitution_Of_India_Instruction_Set y viber1/indian-law-dataset. El nombre "Vakil" hace referencia al término usado en hindi y urdu para designar a un abogado, lo que deja clara la intención del autor de construir un asistente legal conversacional.

Se trata, por tanto, de un modelo de generación de texto en inglés con orientación a consultas sobre legislación, Constitución y procedimientos judiciales de la India. El repositorio no incluye información sobre el proceso de entrenamiento, hiperparámetros, número de tokens utilizados ni metodología de alineación, y en el momento de redactar esta ficha acumula 0 descargas y 0 "me gusta", lo que indica que es una publicación reciente y sin validación por parte de la comunidad.

Su relevancia es limitada pero concreta: cubre un nicho (legal tech en India) poco atendido por los modelos generalistas, y lo hace partiendo de una base sólida de 7.000 millones de parámetros con licencia Apache 2.0 en el modelo original. No obstante, la ausencia de licencia declarada en este repositorio y la falta total de benchmarks publicados obligan a tratarlo con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el modelo es un fine-tune de Qwen/Qwen2.5-7B-Instruct, por lo que hereda la arquitectura de dicho modelo base |
| Parametros totales | Aproximadamente 7.000 millones (derivado de la denominacion del modelo base; no confirmado explicitamente en la informacion proporcionada) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio no publica variantes cuantizadas) |
| Idiomas soportados | Ingles (etiqueta `language: en`) |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | No disponible (no se especifica; sin confirmacion de safetensors, GGUF u otros) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna mas alla del modelo base declarado, Qwen/Qwen2.5-7B-Instruct. No se especifica si se ha modificado la cabeza de salida, si se han congelado capas, si se ha aplicado LoRA/QLoRA o un ajuste completo, ni si se ha utilizado alguna tecnica de alineacion adicional como RLHF, DPO o SFT supervisado. Tampoco se indica el numero de tokens de entrenamiento, la composicion exacta del dataset, la mezcla de proporciones entre los cuatro corpus ni el regimen de entrenamiento (epocas, learning rate, precision).

Lo unico documentado son las cuatro fuentes de datos empleadas: un corpus legal indio de proposito general (Indian-legal-data-v3), un conjunto de ajuste fino supervisado sobre derecho indio (indian-legal-supervised-fine-tuning-data), un conjunto de instrucciones derivado de la Constitucion de la India (Constitution_Of_India_Instruction_Set) y un cuarto corpus de legislacion india (indian-law-dataset). Los cuatro estan etiquetados en ingles. No se documenta ninguna innovacion tecnica adicional, ni decodificacion especulativa, ni atencion lineal, ni modos de razonamiento extendido propios del fine-tune.

## Capacidades

- Generacion de texto en ingles, con especializacion en terminologia y contenido juridico de la India.
- Respuesta a preguntas sobre la Constitucion de la India, gracias al conjunto de instrucciones especifico incluido en el entrenamiento.
- Consultas sobre legislacion y normativa india, derivadas de los corpus Indian-legal-data-v3 y indian-law-dataset.
- Formato conversacional de instrucciones, heredado de Qwen2.5-7B-Instruct, lo que permite diálogos multi-turno.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para este fine-tune, aunque el modelo base lo soporta de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este fine-tune.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada; no se documenta soporte para hindi, urdu u otras lenguas indias.
- Capacidades especiales (vision, audio, modo "thinking"): no disponibles.
- Capacidades de generacion de codigo y matematicas: no documentadas especificamente para este fine-tune.

## Casos de uso

- Asistencia legal preliminar en India: el modelo puede responder consultas en ingles sobre procedimientos, derechos fundamentales y articulado constitucional, aprovechando el corpus Constitution_Of_India_Instruction_Set para orientar al usuario antes de derivarlo a un abogado colegiado.
- Busqueda y resumen de normativa: dado un fragmento de legislacion india, el modelo puede resumirlo o explicarlo en lenguaje llano, util para departamentos de compliance de empresas que operan en el pais.
- Formacion de estudiantes de derecho: generacion de preguntas de repaso y explicaciones sobre conceptos de derecho indio a partir de los corpus de instrucciones empleados en el entrenamiento.
- Preprocesado en despachos juridicos: clasificacion y extraccion de informacion de documentos legales en ingles (contratos, notificaciones, escritos) como paso previo a la revision humana.
- Chatbot de atencion ciudadana: integrado en portales gubernamentales o de ONG para responder dudas frecuentes sobre tramites y derechos, con contexto conversacional multi-turno heredado del modelo base.
- Prototipado de legal tech: base para experimentar con pipelines RAG donde se recuperen articulos legales de una base vectorial y el modelo redacte la respuesta final.
- Traduccion asistida y adaptacion de textos legales: redaccion de borradores de clausulas en ingles conforme a la practica india, siempre con supervision de un profesional.
- Investigacion academica sobre ajuste fino en dominios especializados: caso de estudio de fine-tune de un modelo de 7B sobre cuatro corpus legales heterogeneos y su efecto en tareas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye evaluaciones sobre MMLU, HumanEval, GSM8K, ni sobre benchmarks especificos de dominio legal (por ejemplo, tareas de preguntas y respuestas juridicas indias). Tampoco hay comparaciones con el modelo base ni con otros fine-tunes legales.

## Requisitos de hardware

- VRAM estimada para inferencia (calculos orientativos a partir de un modelo de ~7.000 millones de parametros, no confirmados por el autor):
  - FP16/BF16: en torno a 14-16 GB de pesos, mas overhead de cache KV.
  - Cuantizacion de 8 bits: aproximadamente 7-9 GB.
  - Cuantizacion de 4 bits: aproximadamente 4-5 GB, dependiendo del metodo.
- GPU recomendadas: no especificadas por el autor. Para FP16 se requieren GPU con 16 GB o mas (por ejemplo, A100 40 GB, H100, L40S, RTX 4090). Para cuantizacion de 4 bits podria ejecutarse en GPUs consumer de gama media-alta con 8-12 GB.
- Cabe en GPU consumer: no confirmado por el autor; previsiblemente si en cuantizacion de 4 bits sobre RTX 3060 12 GB, RTX 4070, RTX 4090, siempre que existan pesos cuantizados publicados, cosa que el repositorio no documenta.
- Opciones de despliegue: no documentadas en el repositorio. El modelo base Qwen2.5-7B-Instruct es compatible con vLLM, TGI, llama.cpp, Ollama y Transformers, pero no hay confirmacion de que se hayan publicado pesos en los formatos que requieren estos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adihere69/VakilOS | ~7B (derivado del base) | No disponible | Legal indio, ingles | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | 7B | No disponible en la informacion proporcionada | Generalista | No disponible en la informacion proporcionada | HuggingFace |
| Otros fine-tunes legales indios | No disponible | No disponible | Legal indio | No disponible | No disponible |

No se dispone de datos de rendimiento, contexto o licencia que permitan una comparacion cuantitativa fiable con alternativas de la misma categoria. La unica comparacion posible es estructural: VakilOS deriva del Qwen2.5-7B-Instruct y, por tanto, comparte su tamano y presumiblemente su ventana de contexto, pero no hay confirmacion en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia publicada de que el fine-tune mejore al modelo base en tareas legales, ni de que no haya degradado capacidades generales.
- Riesgo elevado de alucinacion juridica: en dominios legales, una cita inventada de un articulo o de una sentencia puede tener consecuencias graves. El modelo no incluye mecanismos de verificacion ni citacion comprobable.
- Sesgos y alcance jurisdiccional: el entrenamiento se limita al ordenamiento juridico indio y a textos en ingles, lo que excluye legislacion estatal en otras lenguas y cualquier jurisdiccion fuera de la India.
- Limitacion idiomatica: la etiqueta de idioma declarada es unicamente `en`; no hay soporte documentado para hindi, tamil, bengali u otras lenguas oficiales de la India, lo que reduce drasticamente su utilidad real en el pais.
- Licencia no declarada: al no especificarse licencia en el repositorio, no puede asumirse permiso para uso comercial, redistribucion o modificacion. Cualquier despliegue en produccion requiere aclarar este punto con el autor.
- Modelo sin validacion de la comunidad: 0 descargas y 0 "me gusta" en el momento de la consulta; no hay informes independientes de calidad, robustez o seguridad.
- Falta de documentacion de entrenamiento: sin datos de tokens, hiperparametros ni metodologia, es imposible reproducir el ajuste o auditar la composicion del dataset.
- No es un asesor legal: cualquier salida del modelo debe ser revisada por un profesional del derecho colegiado antes de tomar decisiones.
- Infraestructura no documentada: se desconoce si existen pesos cuantizados, plantillas de chat adaptadas o requisitos especificos de prompt, lo que complica su integracion en pipelines existentes.
- Fechas del repositorio inconsistentes: la fecha de creacion registrada es 2026-09-13, posterior a la fecha habitual de publicacion, lo que sugiere un posible error de metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Adihere69/VakilOS
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset kaushik-harsh-99/Indian-legal-data-v3: https://huggingface.co/datasets/kaushik-harsh-99/Indian-legal-data-v3
- Dataset Prarabdha/indian-legal-supervised-fine-tuning-data: https://huggingface.co/datasets/Prarabdha/indian-legal-supervised-fine-tuning-data
- Dataset nisaar/Constitution_Of_India_Instruction_Set: https://huggingface.co/datasets/nisaar/Constitution_Of_India_Instruction_Set
- Dataset viber1/indian-law-dataset: https://huggingface.co/datasets/viber1/indian-law-dataset
- Paper, blog o repositorio adicional del autor: no disponible en la informacion proporcionada.
