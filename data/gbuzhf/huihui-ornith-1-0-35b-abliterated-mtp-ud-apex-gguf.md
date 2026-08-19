# gbuzhf/Huihui-Ornith-1.0-35B-abliterated-MTP-UD-APEX-GGUF

## Resumen

Se trata de una cuantizacion GGUF del modelo Huihui-Ornith-1.0-35B-abliterated, desarrollado originalmente por huihui-ai, sobre el que el autor gbuzhf ha injertado una cabeza MTP (Multi-Token Prediction) y aplicado las optimizaciones APEX-v2D-lite a nivel de archivo GGUF. El modelo base es un MoE (Mixture of Experts) basado en la arquitectura Qwen3.5 MoE, con capacidades multimodales (VLM). El objetivo principal es ofrecer una version "abliterated" (sin mecanismos de rechazo) con decodificacion especulativa para reducir la latencia en inferencia.

El repositorio se encuentra en construccion ("Build in progress") y los archivos apareceran progresivamente segun se complete cada nivel de cuantizacion. Es importante senalar una discrepancia significativa: los metadatos del repositorio indican 446.571.248 parametros, mientras que el nombre del modelo y el tamano del repositorio (72 GB) apuntan claramente a una clase de modelo de 35B. Esta discrepancia puede deberse a un error en los metadatos o a que el conteo se refiere exclusivamente a una parte del modelo, como la cabeza MTP.

La relevancia de esta build radica en que combina tres modificaciones sobre el modelo original: la abliteracion (eliminacion de rechazos), la cabeza MTP para decodificacion especulativa y las optimizaciones APEX-v2D-lite, todo ello empaquetado en formato GGUF para su uso con herramientas como llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 MoE (segun tags) |
| Parametros totales | 446.571.248 (segun metadatos del repo; el nombre indica 35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varios tiers, segun el build en progreso) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la version abliterated de huihui-ai sobre Ornith-1.0-35B. La abliteracion es una tecnica que elimina los mecanismos de rechazo del modelo original, permitiendo que responda a cualquier tipo de solicitud sin filtros de seguridad. Sobre esta base, gbuzhf ha anadido una cabeza MTP (Multi-Token Prediction) a nivel de archivo GGUF, lo que permite la decodificacion especulativa: el modelo predice varios tokens a la vez y los verifica en paralelo, acelerando la generacion.

Las optimizaciones APEX-v2D-lite estan presentes segun los tags, aunque no se proporcionan detalles tecnicos sobre su funcionamiento en la informacion disponible. La build se describe como un cambio de una sola variable respecto a la version fiel (gbuzhf/Ornith-1.0-35B-MTP-UD-APEX-GGUF): misma cabeza MTP, mismos mapas de tensores y misma imatrix (matriz de importancia), variando unicamente el tronco del modelo, que aqui es el abliterated. El modelo es un MoE y un VLM, lo que implica que maneja tanto texto como imagenes, aunque no se especifican los detalles de resolucion o formatos soportados.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas de la arquitectura base Qwen3.5 MoE.
- Procesamiento de vision (VLM), aunque no se especifican los detalles de resolucion o formatos de imagen soportados.
- Generacion sin rechazos (abliterated / uncensored), lo que elimina las respuestas de negativa ante solicitudes delicadas.
- Decodificacion especulativa gracias a la cabeza MTP, que reduce la latencia en la generacion de tokens.
- Compatibilidad con herramientas de inferencia GGUF, como llama.cpp, Ollama o LM Studio.
- Soporte de tool calling y funciones de agente: no confirmado explicitamente en la informacion proporcionada, aunque la arquitectura base Qwen suele incluirlo.

## Casos de uso

- Investigacion en seguridad y alineacion de modelos: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, util para analizar sesgos, toxicidad o la efectividad de las tecnicas de abliteracion.
- Generacion creativa de contenido sin restricciones tematicas: adecuado para ficcion, roleplay o escritura de guiones donde el modelo no debe negarse a tratar ciertos temas.
- Despliegue en entornos de produccion con baja latencia: la cabeza MTP permite decodificacion especulativa, acelerando la generacion de tokens en hardware compatible, ideal para chatbots o asistentes en tiempo real.
- Tareas de vision-lenguaje en local: al ser un VLM cuantizado en GGUF, puede ejecutarse en equipos de escritorio con suficiente VRAM para analisis de imagenes o generacion de descripciones.
- Desarrollo de agentes conversacionales: la naturaleza abliterated puede ser util para agentes que requieren respuestas sin filtros politicamente correctos, aunque debe validarse el soporte de tool calling antes de usarlo en produccion.
- Evaluacion comparativa de cuantizaciones: al estar en construccion con varios tiers, permite comparar el impacto de la cuantizacion en un modelo abliterated, ayudando a elegir el equilibrio optimo entre tamano y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 72 GB, por lo que se requiere almacenamiento significativo. Dependiendo del tier de cuantizacion, la VRAM necesaria variara: las cuantizaciones mas bajas (como Q4_K_M) podrian caber en una GPU de 24 GB, mientras que las mas altas requeriran multiples GPU o una GPU de 48 GB o superior.
- Compatible con llama.cpp, Ollama y otros runners de GGUF.
- Se recomienda una GPU con al menos 24 GB de VRAM (como RTX 3090 o RTX 4090) para las cuantizaciones mas bajas, y multiples GPU o una A100/H100 para las mas altas. Esta es una estimacion estandar basada en el tamano del repositorio, no un dato oficial.
- La latencia se vera reducida por la decodificacion especulativa MTP, aunque no se aportan cifras concretas de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Ornith-1.0-35B-abliterated-MTP-UD-APEX-GGUF (este) | 446M (segun repo) / 35B (nombre) | no disponible | MIT | GGUF | Abliterated + MTP + APEX |
| gbuzhf/Ornith-1.0-35B-MTP-UD-APEX-GGUF | 35B (nombre) | no disponible | MIT | GGUF | Mismo MTP y APEX, pero sin abliterar |
| huihui-ai/Huihui-Ornith-1.0-35B-abliterated-GGUF | 35B (nombre) | no disponible | MIT | GGUF | Abliterated, sin MTP ni APEX |

## Limitaciones y advertencias

- Build en progreso: los archivos del repositorio no estan completos y pueden aparecer de forma incremental.
- Discrepancia en el numero de parametros: los metadatos indican 446.571.248, lo que no coincide con el nombre de 35B. Esto puede deberse a un error en los metadatos o a que el conteo se refiere a una parte especifica del modelo, como la cabeza MTP.
- Al estar abliterated, el modelo puede generar contenido inapropiado, ofensivo, ilegal o peligroso. No es apto para aplicaciones de produccion sin supervisio humana y control de salidas.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real en tareas estandar como MMLU, HumanEval o GSM8K.
- No se especifican los idiomas soportados, aunque la base Qwen suele ser multilingue.
- Las optimizaciones APEX-v2D-lite no estan documentadas en la informacion proporcionada, por lo que su impacto real en rendimiento o calidad es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gbuzhf/Huihui-Ornith-1.0-35B-abliterated-MTP-UD-APEX-GGUF
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Ornith-1.0-35B-abliterated-GGUF
- Build hermano sin abliterar: https://huggingface.co/gbuzhf/Ornith-1.0-35B-MTP-UD-APEX-GGUF
