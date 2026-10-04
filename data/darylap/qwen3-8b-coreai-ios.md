# darylap/Qwen3-8B-coreai-ios

## Resumen

Qwen3-8B-coreai-ios es una exportacion del modelo Qwen/Qwen3-8B (revision `b968826d9c46dd6066d109eabc6255188de91218`) al formato Core AI de Apple, preparada por el usuario darylap y publicada en HuggingFace. No se trata de un modelo nuevo ni de un reentrenamiento: es una conversion de representacion y cuantizacion de los pesos originales del equipo Qwen, conservando el tokenizer y la plantilla de chat del modelo base. El objetivo es ejecutar Qwen3-8B de forma local en dispositivos iOS mediante el runtime Core AI.

El artefacto resultante es un fichero `.aimodel` acompanado de metadatos de exportacion y ficheros de tokenizer, con un peso total de repositorio de 5,0 GB. La exportacion se realizo con las herramientas Apple coreai-models (commit `e7b24da85ea64a77d26324d7ce9607de9b955f57`) usando el preset `qwen3_8b_mixed_4bit_8bit` y una ventana de contexto de 8192 tokens, muy inferior a la del modelo original. Requiere Core AI sobre iOS 27 o posterior.

Su relevancia es practica: demuestra el flujo de conversion de un LLM denso de 8B parametros a un paquete on-device para el ecosistema Apple, orientado a aplicaciones de asistencia de escritura y documentos sin conexion. El repositorio declara que la exportacion se distribuye para Hearth, un asistente local de escritura y documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (heredada de Qwen3-8B) |
| Parametros totales | 8,2 mil millones (Qwen3-8B, segun descripcion del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens en esta exportacion (el modelo base soporta 131K tokens) |
| Tipos de cuantizacion | mixta 4 bits / 8 bits (preset `qwen3_8b_mixed_4bit_8bit`) |
| Idiomas soportados | no disponible en los metadatos del repositorio; el modelo base Qwen3-8B se describe como multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | `.aimodel` (formato Core AI de Apple); no es un directorio de pesos Transformers ni MLX |
| Tamano del repositorio | 5,0 GB |
| Runtime requerido | Core AI en iOS 27 o posterior |
| Autor de la exportacion | darylap |
| Modelo base | Qwen/Qwen3-8B (revision b968826d9c46dd6066d109eabc6255188de91218) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un modelo de lenguaje causal denso de aproximadamente 8,2 mil millones de parametros desarrollado por el equipo Qwen, con una ventana de contexto original de 131 000 tokens. La model card de esta exportacion no aporta detalles adicionales sobre la arquitectura interna ni sobre el proceso de entrenamiento; remite explicitamente a la model card del modelo base para informacion de entrenamiento, evaluacion y limitaciones. Por tanto, no se dispone aqui de datos sobre numero de tokens de entrenamiento, composicion del dataset ni etapas de alineacion (RLHF/DPO) aplicadas.

La innovacion tecnica de este repositorio no esta en el modelo, sino en el pipeline de exportacion. La conversion emplea Apple coreai-models en el commit `e7b24da85ea64a77d26324d7ce9607de9b955f57` y aplica una cuantizacion mixta de 4 y 8 bits que reduce el peso del modelo a unos 5 GB de repositorio, a costa de recortar el contexto a 8192 tokens. La exportacion modifica la representacion y la cuantizacion, pero conserva el tokenizer y la plantilla de chat originales. El fichero `EXPORT.md` del repositorio documenta el comando exacto de exportacion.

## Capacidades

- Generacion de texto en local sobre dispositivo, con el pipeline declarado `text-generation`.
- Razonamiento y comprension del lenguaje heredados de Qwen3-8B; el modelo base se describe como orientado a tareas de razonamiento intensivo.
- Capacidades de codigo y matematicas atribuidas al modelo base Qwen3-8B en las descripciones publicas del modelo.
- Soporte multilingue: no confirmado en los metadatos de esta exportacion; el modelo base se describe como multilingue.
- Conversacion multi-turno mediante la plantilla de chat original del modelo base, preservada en la exportacion.
- Escritura y asistencia documental: el repositorio indica que la exportacion se distribuye para Hearth, un asistente local de escritura y documentos.
- Tool calling / function calling: no disponible en la informacion proporcionada para esta exportacion.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Inferencia completamente offline en el dispositivo, sin llamadas a servidor.

## Casos de uso

- Asistente de escritura local en iOS: integrado en una app de redaccion, el modelo puede reescribir, resumir y ampliar textos sin enviar contenido a la nube, lo que resulta adecuado para documentos sensibles. La ventana de 8192 tokens permite trabajar con fragmentos y capitulos de tamano medio.
- Correccion y mejora de estilo en documentos largos por secciones: gracias a la plantilla de chat conservada, se puede trocear un documento y procesar cada bloque con instrucciones de estilo, manteniendo coherencia dentro del limite de contexto.
- Reescritura de correos y mensajes profesionales en el dispositivo: el modelo genera borradores y variantes de tono a partir de notas breves, con latencia local y sin coste por token.
- Prototipado de apps de IA on-device: sirve como referencia de integracion del runtime Core AI y del flujo de exportacion de coreai-models para equipos que quieran portar otros modelos.
- Generacion de codigo asistida en entornos restringidos: para desarrolladores que trabajan sin conectividad o con politicas de no exfiltracion, el modelo puede sugerir fragmentos y explicaciones dentro de editores iOS.
- Resumen de notas y apuntes personales: extraccion de puntos clave de transcripciones o notas dentro del limite de 8192 tokens.
- Base para tareas de clasificacion y extraccion ligera: al ser un modelo causal general, puede emplearse con prompts estructurados para etiquetar o extraer campos de texto en pipelines locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluacion y remite a la model card del modelo base Qwen/Qwen3-8B para datos de evaluacion. Ademas, la cuantizacion mixta 4/8 bits y el recorte de contexto a 8192 tokens alteran el comportamiento respecto al modelo original, por lo que los resultados publicados del modelo base no serian directamente extrapolables a esta exportacion.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: el repositorio ocupa 5,0 GB, coherente con un modelo de 8,2B parametros en cuantizacion mixta de 4 y 8 bits. El propio repositorio advierte que el tamano de los ficheros exportados no determina el requisito de memoria en tiempo de ejecucion de un dispositivo.
- Plataforma objetivo: dispositivos Apple con iOS 27 o posterior y soporte de Core AI. Los niveles de dispositivo compatibles estan pendientes de verificacion, segun la model card.
- GPU de escritorio: no disponible. Esta exportacion no esta pensada para A100, H100 ni RTX 4090, y no se distribuye como pesos Transformers o MLX.
- Opciones de despliegue: runtime Core AI de Apple en iOS. No es compatible con vLLM, llama.cpp, Ollama ni TGI en el formato publicado.
- Latencia y throughput: no disponible. La model card indica que el rendimiento en tiempo de ejecucion queda sujeto a verificacion por dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darylap/Qwen3-8B-coreai-ios | 8,2B (denso) | 8192 tokens | `.aimodel` (Core AI) | apache-2.0 | HuggingFace, uso en iOS 27+ |
| Qwen/Qwen3-8B (modelo base) | 8,2B (denso) | 131K tokens | safetensors (Transformers) | apache-2.0 | HuggingFace, multiplataforma |
| mlboydaisuke/qwen3-8b-CoreAI-official | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Qwen3-8B en Qualcomm AI Hub | 8B | no disponible | formato Qualcomm | no disponible | Qualcomm AI Hub |

La diferencia principal frente al modelo base es el formato y el contexto: la exportacion gana en integracion con iOS y pierde 123 000 tokens de ventana. Frente a otras conversiones Core AI, como mlboydaisuke/qwen3-8b-CoreAI-official, no hay datos publicos de rendimiento en la informacion disponible que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Contexto reducido: la ventana de 8192 tokens es aproximadamente 16 veces menor que la del modelo base (131K), lo que limita tareas con documentos largos y conversaciones extensas.
- Perdida de calidad por cuantizacion: la cuantizacion mixta de 4 y 8 bits puede degradar la precision respecto a los pesos originales en tareas de razonamiento o matematicas; no hay evaluaciones publicadas que cuantifiquen esa perdida.
- Requisito de plataforma estricto: solo funciona con Core AI en iOS 27 o posterior, lo que excluye Android, escritorio y versiones anteriores de iOS.
- Verificacion pendiente: la propia model card advierte que el rendimiento y los niveles de dispositivo soportados estan sujetos a verificacion, y que el tamano de los ficheros no implica que un dispositivo pueda cargarlos.
- Sin soporte en ecosistemas estandar: no es un directorio de pesos Transformers ni MLX, por lo que no se puede cargar directamente con la mayoria de herramientas habituales de inferencia.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es un riesgo inherente a los modelos de lenguaje de esta escala.
- Sesgos: no documentados en la informacion proporcionada; habria que consultar la model card del modelo base.
- Idiomas: los metadatos del repositorio no listan idiomas soportados, por lo que la cobertura multilingue real de esta exportacion no esta confirmada.
- Licencia: apache-2.0 heredada del modelo base, sin modificaciones en el fichero `LICENSE` copiado de la revision upstream. El autor de la exportacion no anade restricciones adicionales segun lo indicado.
- Atribucion de uso: el repositorio declara que la exportacion se distribuye para Hearth, lo que conviene tener en cuenta si se reutiliza en otros productos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darylap/Qwen3-8B-coreai-ios
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Revision del modelo base usada en la exportacion: https://huggingface.co/Qwen/Qwen3-8B/tree/b968826d9c46dd6066d109eabc6255188de91218
- Apple coreai-models (repositorio): https://github.com/apple/coreai-models
- Commit de coreai-models usado en la exportacion: https://github.com/apple/coreai-models/tree/e7b24da85ea64a77d26324d7ce9607de9b955f57
- Recetas de exportacion para Qwen3 en coreai-models: https://github.com/apple/coreai-models/tree/main/models/qwen3
- README de la receta Qwen3 en coreai-models: https://github.com/apple/coreai-models/blob/main/models/qwen3/README.md
- Otra exportacion Core AI de Qwen3-8B: https://huggingface.co/mlboydaisuke/qwen3-8b-CoreAI-official
- Ficha de Qwen3-8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_8b
- Ficha de Qwen3 8B en ask-coreai: https://ask-coreai.com/models/qwen-qwen3-8b
