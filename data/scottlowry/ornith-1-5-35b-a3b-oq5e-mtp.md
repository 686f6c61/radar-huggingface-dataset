# scottlowry/Ornith-1.5-35B-A3B-oQ5e-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ5e-mtp es una version cuantizada del modelo base ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario scottlowry. Se trata de una conversion a 5 bits mediante cuantizacion de precision mixta con la herramienta oQ (oMLX v0.7.1.dev1), empaquetada en el formato MLX safetensors. El modelo pertenece a la familia de arquitectura qwen3_5_moe, lo que indica que es un transformer con mezcla de expertos (MoE). No es un modelo nuevo ni entrenado desde cero: es un artefacto de inferencia derivado del modelo original.

El modelo cuenta con 35.951.822.704 parametros totales (aproximadamente 35,95 mil millones), segun los datos reales de los ficheros safetensors, y el repositorio ocupa 25,9 GB. La nomenclatura "A3B" sugiere, por convencion habitual en modelos MoE de esta familia, del orden de 3.000 millones de parametros activos por token, aunque este dato no se confirma explicitamente en la informacion disponible. La cuantizacion usa un tamano de grupo de 64.

Su relevancia es practica: permite ejecutar un modelo MoE de gran tamano en hardware Apple Silicon mediante el ecosistema MLX, reduciendo el espacio en disco y memoria frente a los pesos originales en mayor precision. Al tratarse de un repositorio con 0 descargas y 0 "likes" en el momento de la consulta, es un artefacto reciente y poco difundido, por lo que conviene validar su calidad antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (transformer con mezcla de expertos, MoE) |
| Parametros totales | 35.951.822.704 (aproximadamente 35,95 mil millones) |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere del orden de 3.000 millones, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5 bits, precision mixta (oQ / oMLX v0.7.1.dev1), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 25,9 GB |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Libreria | mlx |

## Arquitectura y entrenamiento

La arquitectura corresponde al tipo qwen3_5_moe, es decir, un transformer autorregresivo con capas de mezcla de expertos (Mixture of Experts). En este tipo de diseno, cada token activa solo un subconjunto de los expertos disponibles, lo que reduce el coste computacional por token respecto a un modelo denso del mismo tamano total. La nomenclatura del nombre ("35B-A3B") apunta a aproximadamente 35.000 millones de parametros totales y alrededor de 3.000 millones activos, si bien este ultimo dato no se detalla en la informacion proporcionada.

No hay informacion disponible sobre el proceso de entrenamiento del modelo base: no se especifican el numero de tokens, la composicion del dataset, ni si hubo etapas de ajuste como RLHF o DPO. Lo unico documentado en este repositorio es el proceso de cuantizacion: se aplico oQ (oMLX v0.7.1.dev1) con precision mixta a 5 bits y un tamano de grupo de 64, generando pesos en formato MLX safetensors. El sufijo "mtp" del nombre podria referirse a multi-token prediction, pero no se confirma en la documentacion disponible.

## Capacidades

- Generacion de texto: al derivar de un modelo MoE de gran tamano, se espera capacidad de generacion de lenguaje natural, aunque no se detallan capacidades concretas en la informacion disponible.
- Razonamiento y matematicas: no confirmado explicitamente en la informacion proporcionada.
- Generacion de codigo: no confirmado explicitamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no figura en la ficha del repositorio).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Inferencia en Apple Silicon: capacidad efectiva del artefacto, al estar en formato MLX y cuantizado a 5 bits para su ejecucion en dispositivos con memoria unificada.

## Casos de uso

- Inferencia local en equipos Apple Silicon: el formato MLX permite cargar el modelo con la libreria mlx-lm en Macs con memoria unificada suficiente (a partir de 32 GB, preferiblemente 36 GB o mas), evitando depender de GPUs dedicadas.
- Prototipado y evaluacion de modelos MoE grandes sin acceso a clústeres: la reduccion a 5 bits y los 25,9 GB de repositorio facilitan probar un modelo de casi 36.000 millones de parametros en una estacion de trabajo.
- Asistentes de texto en local con requisitos de privacidad: al ejecutarse en el propio dispositivo, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles, siempre que se validen las capacidades reales del modelo.
- Generacion de codigo en flujo local: si el modelo base conserva buenas capacidades de codigo, podria integrarse en editores o scripts de desarrollo, aunque esto no esta confirmado en la informacion disponible.
- Experimentacion con cuantizacion de precision mixta: util para investigadores que quieran comparar la calidad de la cuantizacion oQ a 5 bits frente a otras tecnicas (por ejemplo, GGUF o cuantizaciones de menor precision).
- Despliegue en pipelines de generacion de texto de bajo volumen: para tareas de redaccion, resumen o clasificacion en entornos con hardware Apple, sujeto a la validacion previa de calidad y licencia.
- Base para tareas posteriores de ajuste fino (fine-tuning): al ser pesos MLX cuantizados, podria servir de punto de partida para experimentos de adaptacion, aunque el entrenamiento sobre pesos cuantizados tiene limitaciones conocidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Formato y ecosistema: los pesos estan en MLX safetensors, por lo que estan disenados para ejecutarse con la libreria mlx-lm en Apple Silicon (chips de las familias M1, M2, M3 y M4). No son directamente compatibles con vLLM, llama.cpp, Ollama ni TGI, que esperan otros formatos (safetensors PyTorch o GGUF).
- Memoria estimada: el repositorio ocupa 25,9 GB, de modo que se necesita memoria unificada suficiente para los pesos mas la cache KV y el overhead del runtime. Como referencia, un Mac con 32 GB puede ser ajustado; 36 GB, 48 GB o 64 GB ofrecen mayor margen.
- GPUs dedicadas (A100, H100, RTX 4090): no son el destino natural de este artefacto, ya que MLX esta orientado a Apple Silicon. Para GPUs NVIDIA habria que usar los pesos originales del modelo base en otro formato.
- Cabe en GPU de consumo: en el sentido estricto, el formato MLX no aplica a GPUs de consumo NVIDIA. En Apple Silicon de gama alta con memoria unificada amplia, si seria viable.
- Opciones de despliegue: mlx-lm (libreria oficial de MLX para modelos de lenguaje). Otras opciones como vLLM, Ollama o TGI requeririan reconvertir el modelo a sus formatos compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottlowry/Ornith-1.5-35B-A3B-oQ5e-mtp | 35,95 mil millones (5 bits) | no disponible | MLX safetensors | no disponible | HuggingFace (0 descargas) |
| ornith-ai/Ornith-1.5-35B-A3B (base) | 35,95 mil millones (precision original) | no disponible | no disponible | no disponible | HuggingFace (modelo base) |
| Otros modelos MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes sobre modelos comparables de la misma categoria (misma arquitectura qwen3_5_moe, mismo rango de parametros y mismo destino MLX) para establecer una comparativa con cifras verificables.

## Limitaciones y advertencias

- Licencia no especificada: al no figurar la licencia ni en los tags ni en la model card, no se puede confirmar si se permite el uso comercial. Conviene consultar la licencia del modelo base ornith-ai/Ornith-1.5-35B-A3B antes de cualquier uso en produccion.
- Artefacto derivado, no modelo original: es una cuantizacion del modelo base; la calidad depende enteramente de este y de la fidelidad de la cuantizacion a 5 bits, que puede degradar ligeramente las capacidades respecto a los pesos originales.
- Datos incompletos: no hay informacion sobre contexto, idiomas, benchmarks, sesgos ni composicion de entrenamiento del modelo base, lo que dificulta evaluar su idoneidad.
- Riesgo de alucinacion: sin datos de evaluacion ni de alineacion, se asume el riesgo habitual de los modelos generativos, agravado por la ausencia de benchmark publicados.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 "likes", lo que implica poca validacion por parte de la comunidad.
- Compatibilidad restringida: el formato MLX limita su uso al ecosistema Apple Silicon; no es portable directamente a GPUs NVIDIA ni a los runtimes mas comunes (vLLM, llama.cpp, Ollama, TGI).
- Sufijo "mtp": su significado no se documenta en la informacion disponible, por lo que no se puede confirmar que se trate de multi-token prediction ni que esta caracteristica este implementada en el artefacto cuantizado.
- Requisitos de memoria: ejecutarlo en equipos con menos de 32 GB de memoria unificada puede provocar errores por falta de memoria o un rendimiento muy degradado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ5e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
