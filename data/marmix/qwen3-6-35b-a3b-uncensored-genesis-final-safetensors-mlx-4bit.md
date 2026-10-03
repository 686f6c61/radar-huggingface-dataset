# MarMix/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors-MLX-4bit

## Resumen

MarMix/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors-MLX-4bit es un modelo publicado en HuggingFace por el usuario MarMix, cuyo nombre sugiere una variante afinada ("uncensored") sobre una base de la familia Qwen, con arquitectura de mezcla de expertos (MoE), en torno a 35.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token (sufijo "A3B"), distribuida en formato MLX cuantizado a 4 bits para su ejecucion en hardware Apple Silicon.

La model card del repositorio esta practicamente vacia: solo contiene la declaracion de licencia (apache-2.0), sin documentacion sobre datos de entrenamiento, composicion del dataset, proceso de alineamiento ni resultados de evaluacion. No se dispone de informacion verificada sobre la longitud de contexto, los idiomas soportados ni el pipeline declarado en HuggingFace.

Su relevancia potencial radica en el nicho de modelos MoE de gran tamano total y bajo coste de inferencia, empaquetados en MLX 4 bits para equipos Mac con memoria unificada, y en la vertiente "sin censura", orientada a investigacion sobre comportamiento de rechazo y generacion sin filtros. No obstante, al no existir documentacion tecnica ni benchmarks publicados, cualquier evaluacion debe considerarse preliminar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE con parametros activos ~3B) |
| Parametros totales | ~35B (inferido del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | ~3B (inferido del sufijo "A3B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en formato MLX (segun el nombre); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors convertidos a MLX 4 bits (segun el nombre del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card ni en los metadatos del repositorio. El identificador del modelo incluye los terminos "35B-A3B", convencion habitual para designar modelos de mezcla de expertos (MoE) con un total de parametros del orden de 35.000 millones y un subconjunto activo de aproximadamente 3.000 millones por token. Tambien incluye "Uncensored", "Genesis-Final" y "MLX-4bit", lo que sugiere un ajuste fino orientado a eliminar o reducir los mecanismos de rechazo de la base, y una conversion posterior a MLX con cuantizacion de 4 bits. Ninguno de estos extremos esta confirmado por documentacion tecnica.

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones arquitectonicas especificas. Cualquier afirmacion en este sentido seria especulativa.

## Capacidades

- Generacion de texto: presumiblemente heredada de la base Qwen subyacente, aunque no hay confirmacion documental.
- Razonamiento y matematicas: no disponible (no se han publicado evaluaciones).
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo "thinking", vision, audio): no disponible.
- Orientacion "uncensored": el nombre indica un ajuste destinado a reducir las negativas del modelo; el alcance real y las implicaciones de seguridad no estan documentadas.
- Ejecucion local en Apple Silicon: derivada del formato MLX 4 bits declarado en el nombre del repositorio.

## Casos de uso

- Investigacion sobre comportamiento de rechazo: el modelo se presenta como "uncensored", por lo que puede emplearse en estudios academicos que analicen como varian las tasas de negativa y el contenido generado respecto a la base alineada.
- Red-teaming y evaluacion de seguridad: util para equipos que necesiten generar respuestas sin filtros como entrada en pipelines de deteccion de contenido danino, siempre en entornos controlados.
- Inferencia local en Mac: al estar empaquetado en MLX 4 bits, permite ejecutar un modelo de ~35B parametros totales en equipos Apple Silicon con memoria unificada suficiente, sin conexion a Internet y con los datos en local.
- Escritura creativa sin restricciones tematicas: redaccion de ficcion, guiones o narrativa que aborden temas que los modelos alineados suelen declinar.
- Prototipado offline en entornos sin GPU NVIDIA: desarrollo de asistentes y pruebas de concepto en portatiles Mac, aprovechando el bajo numero de parametros activos para obtener velocidad de decodificacion razonable.
- Experimentacion con tecnicas de cuantizacion MLX: el repositorio sirve como caso de estudio para medir la degradacion de calidad al pasar a 4 bits sobre un MoE de gran tamano total.
- Generacion de datos sinteticos para ajuste fino: produccion de corpus en dominios donde los modelos alineados filtran contenido, con las precauciones legales y eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y el repositorio no cuenta con descargas ni interacciones que permitan inferir validaciones externas.

## Requisitos de hardware

- VRAM / memoria unificada estimada: con ~35B parametros totales en 4 bits, los pesos ocupan aproximadamente 17,5 GB, mas el overhead de cuantizacion y la cache KV; se estiman en torno a 20-24 GB de memoria total para contexto corto (estimacion derivada del recuento de parametros, no confirmada por el autor).
- Memoria recomendada: 32 GB de memoria unificada o mas para trabajar con contextos largos en Mac; 24 GB puede ser suficiente para contextos reducidos.
- Compatibilidad con consumer GPU: no es el objetivo del repositorio (formato MLX). Para GPUs NVIDIA se requeriria una conversion previa a otros formatos (por ejemplo GGUF o safetensors) y una GPU con 24 GB o mas (RTX 3090, RTX 4090), no verificada.
- GPU de datacenter: A100 40/80 GB o H100 para servir el modelo en precision completa o semiprecision, si se dispone de los pesos originales.
- Opciones de despliegue: MLX / mlx-lm en Apple Silicon (formato nativo del repositorio); llama.cpp, Ollama, LM Studio, vLLM o TGI requeririan conversion a GGUF o safetensors, no confirmada.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con ~3B parametros activos, cabe esperar una velocidad de decodificacion superior a la de un modelo denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa fiable, ya que no esta documentado el modelo base exacto sobre el que se construye este ajuste ni sus resultados de evaluacion. A modo orientativo, se situaria en la categoria de modelos MoE de gran tamano total y bajo coste de inferencia, junto a opciones como la familia Qwen3 MoE (por ejemplo Qwen3-30B-A3B), Mixtral 8x7B o DeepSeek-V2-Lite.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MarMix/Qwen3.6-35B-A3B-Uncensored-Genesis-Final (MLX 4bit) | ~35B totales / ~3B activos (inferido) | no disponible | apache-2.0 | HuggingFace, formato MLX |
| Qwen3-30B-A3B | 30B totales / 3B activos | no disponible en este contexto | apache-2.0 | HuggingFace |
| Mixtral 8x7B | 46,7B totales / 12,9B activos | 32k (segun documentacion publica) | apache-2.0 | HuggingFace |
| DeepSeek-V2-Lite | 15,7B totales / 2,4B activos | 32k (segun documentacion publica) | licencia especifica de DeepSeek | HuggingFace |

Las cifras de los modelos comparativos provienen de su documentacion publica general y no han sido verificadas contra el repositorio analizado.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe arquitectura, datos de entrenamiento, contexto, idiomas ni evaluaciones, lo que impide validar su comportamiento en produccion.
- Riesgo elevado de alucinacion: sin benchmarks publicados no puede acotarse la fiabilidad factual del modelo.
- Naturaleza "uncensored": el ajuste orientado a reducir rechazos incrementa el riesgo de generar contenido danino, ilegal o inseguro; requiere moderacion externa en cualquier despliegue abierto al publico.
- Sesgos: no evaluados ni documentados. Heredara, con probabilidad, los sesgos de su base, agravados por la eliminacion de filtros.
- Limitaciones de contexto e idioma: desconocidas.
- Licencia apache-2.0 declarada, lo que en principio permite uso comercial; sin embargo, debe verificarse la licencia del modelo base subyacente, ya que las condiciones de la obra derivada pueden verse afectadas por los terminos originales.
- Cuantizacion 4 bits: la conversion a MLX 4 bits puede degradar la calidad respecto a los pesos completos, algo especialmente relevante en tareas de razonamiento.
- Sin validacion externa: cero descargas y cero "likes" en el momento de la consulta, sin evidencia de uso o pruebas por parte de terceros.
- Fecha de publicacion adelantada respecto a modelos de la familia que el nombre sugiere, lo que introduce dudas adicionales sobre el contenido real del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/MarMix/Qwen3.6-35B-A3B-Uncensored-Genesis-Final-Safetensors-MLX-4bit

No se han encontrado papers, repositorios, blogs ni demos adicionales asociados al modelo en la informacion disponible.
