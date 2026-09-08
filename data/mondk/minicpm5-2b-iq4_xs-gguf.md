# mondk/MiniCPM5-2B-IQ4_XS-GGUF

## Resumen

MiniCPM5-2B es un modelo de lenguaje causal de 2.516 millones de parametros desarrollado por OpenBMB, la misma organizacion responsable de la serie MiniCPM. Es el segundo modelo de la familia MiniCPM5, tras el MiniCPM5-1B, y esta disenado especificamente para despliegue en dispositivos locales, escenarios con recursos limitados y aplicaciones edge. Su arquitectura es un Transformer denso estandar basado en LlamaForCausalLM, con una ventana de contexto de 131.072 tokens, lo que lo hace especialmente util para tareas de procesamiento de documentos largos y conversaciones multi-turno.

El modelo se publica bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones significativas. La version aqui analizada es una cuantizacion GGUF en formato IQ4_XS realizada por el usuario mondk, que reduce el peso del modelo a aproximadamente 1.4 GB, manteniendo la compatibilidad con motores de inferencia como llama.cpp y Ollama. La relevancia de MiniCPM5-2B radica en su equilibrio entre tamano reducido, capacidad de contexto extensa y soporte de tool calling, lo que lo convierte en una opcion atractiva para asistentes locales, agentes autonomos y aplicaciones de IA en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Transformer causal denso) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | IQ4_XS (GGUF) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

MiniCPM5-2B emplea una arquitectura Transformer causal estandar, compatible con la clase `LlamaForCausalLM`. El modelo tiene 42 capas y utiliza atencion con consultas agrupadas (GQA), con 16 cabezas de consulta y 2 cabezas de clave/valor, lo que reduce el coste computacional y de memoria durante la inferencia. Los parametros totales son 2.516.756.480, de los cuales 1.981.982.720 corresponden a parametros no asociados a embeddings, un indicador de que la mayor parte del peso se concentra en las capas del Transformer.

En cuanto al entrenamiento, el modelo se ha construido sobre una receta de entrenamiento escalada desde MiniCPM5-1B. Los datasets listados en la model card incluyen corpus web como Ultra-FineWeb y UltraX-Preview, asi como conjuntos especificos de matematicas, codigo y datos de ajuste fino supervisado (SFT) y aprendizaje por refuerzo (RL). La presencia de datasets como UltraData-SFT-Agent y UltraData-RL-2609 sugiere que el modelo ha recibido ajuste fino orientado a tareas de agente y tool calling, ademas de optimizacion por refuerzo. No se especifica el numero exacto de tokens de entrenamiento ni la composicion detallada de los datos.

## Capacidades

- Generacion de texto en ingles y chino, con buena comprension de contexto largo gracias a su ventana de 131.072 tokens.
- Soporte de tool calling / function calling, habilitado por el ajuste fino con datasets de agentes.
- Capacidad para razonamiento multi-paso y uso de herramientas en escenarios de agente autonomo.
- Optimizado para ejecucion en dispositivos locales y de borde, con bajo consumo de recursos.
- Compatible con el ecosistema llama.cpp y motores de inferencia GGUF, lo que facilita su despliegue en CPU y GPU modestas.
- Sin capacidades de vision o audio en esta version; es exclusivamente un modelo de texto.

## Casos de uso

- Asistentes locales en dispositivos moviles: gracias a su tamano reducido y su cuantizacion IQ4_XS, puede ejecutarse en smartphones o mini-PCs sin conexion a internet, ofreciendo respuestas en tiempo real en ingles o chino.
- Procesamiento de documentos largos: su contexto de 131.072 tokens permite resumir contratos, informes tecnicos o articulos extensos de una sola pasada, sin necesidad de fragmentar el texto.
- Chatbots de atencion al cliente con memoria de conversacion: el modelo puede mantener historiales de chat muy largos y gestionar preguntas de seguimiento, gracias a su ventana de contexto amplia.
- Agentes con tool calling en el borde: su ajuste fino con datos de agentes le permite invocar funciones externas, como consultas a bases de datos o APIs, en entornos con recursos limitados.
- Generacion de codigo asistida: aunque no esta especializado en codigo, su entrenamiento con datasets como UltraData-Code le proporciona una base util para autocompletar fragmentos o explicar logica en lenguajes de programacion comunes.
- Traduccion y comprension bilingue chino-ingles: al estar entrenado con ambos idiomas, puede actuar como traductor o asistente de redaccion en contextos empresariales o academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web menciona que MiniCPM5-2B alcanza un estado del arte en su clase de modelos de 2B parametros, pero no se proporcionan puntuaciones concretas en MMLU, HumanEval, GSM8K u otras metricas estandar. Por tanto, no es posible presentar una tabla comparativa con datos verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.5-2 GB para la cuantizacion IQ4_XS, ya que el archivo GGUF ocupa 1.4 GB. En modo CPU con llama.cpp, puede ejecutarse con menos de 2 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA RTX 3050, RTX 4060 o superior. Tambien es viable en iGPUs modernas y en hardware de Apple con Metal.
- Compatible con consumer GPUs: si, es posible ejecutarlo en tarjetas de gama baja, incluso en laptops con GPU integrada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier motor compatible con GGUF. Para el modelo base en safetensors, se puede usar vLLM o TGI.
- Latencia y throughput estimados: no disponible. El rendimiento dependera del hardware y del motor de inferencia.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de benchmarks para comparar MiniCPM5-2B con alternativas de la misma categoria. Los modelos comparables en tamano incluyen MiniCPM5-1B, Qwen2.5-1.5B y SmolLM2-1.7B, pero no se han encontrado resultados publicados que permitan una comparacion rigurosa. Se recomienda consultar las fichas de estos modelos para obtener datos especificos.

## Limitaciones y advertencias

- El modelo es bilingue (ingles y chino), por lo que su rendimiento en otros idiomas, incluido el castellano, puede ser limitado o inexistente.
- Al ser un modelo de 2B parametros, su capacidad de razonamiento complejo es inferior a la de modelos mas grandes, y puede incurrir en errores en tareas matematicas o logicas avanzadas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en temas de politica, salud, finanzas o derecho.
- Puede ser vulnerable a ataques de jailbreak o inyeccion de prompts, segun se advierte en la model card. Los usuarios deben implementar sus propias salvaguardas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye "AS IS", sin garantias de ningun tipo. Los desarrolladores no se hacen responsables de los danos derivados de su uso.
- La cuantizacion IQ4_XS puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo base en safetensors.

## Enlaces

- Repositorio HuggingFace de la cuantizacion GGUF: https://huggingface.co/mondk/MiniCPM5-2B-IQ4_XS-GGUF
- Modelo base en HuggingFace: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio oficial de OpenBMB en GitHub: https://github.com/OpenBMB/MiniCPM
- Coleccion de MiniCPM5-2B en HuggingFace (con versiones GGUF, MLX y DSpark): https://huggingface.co/collections/abenzerps/minicpm5-2b
