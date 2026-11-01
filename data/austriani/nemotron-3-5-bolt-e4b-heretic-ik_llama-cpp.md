# Austriani/Nemotron-3.5-Bolt-E4B-Heretic-ik_llama.cpp

## Resumen

Nemotron-3.5-Bolt-E4B-Heretic-ik_llama.cpp es una cuantizacion GGUF del modelo grumd0/Nemotron-3.5-Bolt-E4B-Heretic, una variante "abliterated" (sin censura) de la familia Nemotron de NVIDIA. El autor, Austriani, publica los pesos en formato GGUF optimizados para ik_llama.cpp, una bifurcacion de llama.cpp orientada a mejorar el rendimiento de operaciones matriciales en CPU. El modelo se distribuye con la licencia OpenMDW 1.1 y esta etiquetado como NSFW y no apto para todas las audiencias.

La relevancia de esta publicacion es acotada: se trata de una cuantizacion derivada, no de un modelo entrenado desde cero. Su interes practico reside en la combinacion de una arquitectura MoE (segun la etiqueta del repositorio) con cuantizaciones de baja precision (IQ4_KS) calibradas mediante imatrix, lo que permite ejecutar un modelo de 4B de parametros activos en hardware de consumo con una penalizacion de velocidad de aproximadamente el 7 % respecto a Q4_K_M y una reduccion de memoria de en torno al 17 %.

No se dispone de informacion verificable sobre la longitud de contexto, los idiomas soportados ni los detalles del entrenamiento original, ya que la model card se limita a describir el proceso de cuantizacion. El modelo base es un derivado "Heretic" de Nemotron, lo que implica la eliminacion de mecanismos de rechazo, con las implicaciones eticas y de seguridad que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (segun etiqueta del repositorio; detalles no disponibles) |
| Parametros totales | no disponible (la nomenclatura "E4B" sugiere 4B activos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF, incluyendo IQ4_KS y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | GGUF (optimizado para ik_llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. La etiqueta "MoE" indica una mezcla de expertos, y el sufijo "E4B" en el nombre sugiere 4B de parametros activos, pero no se confirma el numero total de parametros ni el numero de expertos. El modelo desciende de grumd0/Nemotron-3.5-Bolt-E4B-Heretic, que a su vez es una variante "abliterated" de un modelo Nemotron de NVIDIA; el proceso de abliteracion elimina las direcciones de activacion asociadas al rechazo de peticiones.

El autor de la cuantizacion empleo el dataset OpenIntelligenceNet/Uncensored-Imatrix-Calibration-Mixed-Data para calibrar la imatrix, del que elimino todo el contenido de cadena de pensamiento (CoT) y Polyglot. El propio autor califica el resultado de experimental y advierte de que el modelo puede ser "muy hablador", sin poder determinar si ese comportamiento proviene de la cuantizacion o del modelo original. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset original ni las tecnicas de alineacion (RLHF/DPO) aplicadas.

## Capacidades

- Generacion de texto sin restricciones de contenido (variante abliterated).
- Razonamiento y conversacion multi-turno, presumiblemente heredados del modelo base Nemotron.
- Ejecucion en CPU mediante ik_llama.cpp con cuantizaciones de baja precision.
- Capacidad de calibracion imatrix para preservar calidad en cuantizaciones agresivas.
- No se dispone de informacion sobre soporte de tool calling, agentes, vision, audio ni capacidades multilingues especificas.
- El modo "thinking" o cadena de pensamiento no esta confirmado; el autor elimino el CoT del dataset de calibracion, lo que no implica que el modelo carezca de el.

## Casos de uso

- Inferencia local en CPU: el modelo esta empaquetado en GGUF para ik_llama.cpp, por lo que resulta adecuado para ejecutar generacion de texto en equipos sin GPU dedicada, aprovechando la reduccion de memoria del 17 % de IQ4_KS frente a Q4_K_M.
- Experimentacion con modelos sin censura: investigadores que estudian el comportamiento de modelos abliterated pueden usar esta variante para analizar respuestas sin filtros de rechazo.
- Prototipado de chatbots de rol o ficcion creativa: la ausencia de mecanismos de rechazo y la etiqueta NSFW lo orientan a aplicaciones de escritura creativa sin restricciones, siempre que se cumplan los requisitos legales y eticos.
- Evaluacion de tecnicas de cuantizacion: sirve como caso de estudio para comparar IQ4_KS con Q4_K_M en terminos de velocidad (penalizacion de ~7 %) y memoria (~17 % menos).
- Pruebas de robustez y seguridad: util para equipos de red teaming que necesitan un modelo deliberadamente sin alineacion para evaluar riesgos.
- Despliegue en entornos con recursos limitados: al ser un MoE con 4B activos (segun la nomenclatura), puede ejecutarse en maquinas modestas con RAM suficiente para los pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es la comparacion entre cuantizaciones: IQ4_KS presenta una penalizacion de velocidad de aproximadamente el 7 % respecto a Q4_K_M en su CPU, con una reduccion de memoria de en torno al 17 %.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible con precision; para un modelo de ~4B activos en IQ4_KS se puede estimar un consumo de memoria en el rango de pocos GB, pero el numero total de parametros del MoE no se confirma.
- GPU recomendadas: no disponible; el formato esta optimizado para CPU mediante ik_llama.cpp.
- Compatibilidad con GPU de consumo: probable en GPUs con 8-12 GB de VRAM si el total de parametros es moderado, aunque no hay datos verificables.
- Opciones de despliegue: ik_llama.cpp (objetivo principal), y potencialmente llama.cpp u otras herramientas compatibles con GGUF, aunque la cuantizacion IQ4_KS puede requerir ik_llama.cpp.
- Latencia y throughput: no disponibles; solo se conoce la comparacion relativa entre cuantizaciones (~7 % mas lento que Q4_K_M).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Austriani/Nemotron-3.5-Bolt-E4B-Heretic-ik_llama.cpp | no disponible (MoE, ~4B activos) | no disponible | OpenMDW 1.1 | GGUF (ik_llama.cpp) | Cuantizacion IQ4_KS/Q4_K_M, sin censura |
| grumd0/Nemotron-3.5-Bolt-E4B-Heretic | no disponible | no disponible | no disponible | safetensors (presumible) | Modelo base sin cuantizar |
| Nemotron original (NVIDIA) | no disponible | no disponible | no disponible | no disponible | Modelo de referencia con alineacion |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo abliterated: elimina los mecanismos de rechazo, por lo que puede generar contenido danino, ofensivo o ilegal sin filtros.
- Etiquetado NSFW y "not-for-all-audiences": no apto para aplicaciones orientadas al publico general ni para menores.
- El autor lo califica de experimental y advierte de un comportamiento potencialmente "muy hablador" (respuestas excesivamente largas).
- Riesgo elevado de alucinacion, agravado por la cuantizacion agresiva y la falta de benchmarks de calidad.
- Sin informacion sobre sesgos, idiomas soportados ni contexto maximo, lo que dificulta su uso en produccion.
- La licencia OpenMDW 1.1 debe revisarse antes de cualquier uso comercial; no se confirman los terminos exactos en la informacion disponible.
- La cuantizacion IQ4_KS puede no ser compatible con todas las herramientas GGUF; se recomienda ik_llama.cpp.
- Cero descargas y un solo "like" en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Austriani/Nemotron-3.5-Bolt-E4B-Heretic-ik_llama.cpp
- Modelo base: https://huggingface.co/grumd0/Nemotron-3.5-Bolt-E4B-Heretic
- Dataset de calibracion: https://huggingface.co/datasets/OpenIntelligenceNet/Uncensored-Imatrix-Calibration-Mixed-Data
- ik_llama.cpp (repositorio, no verificado en la busqueda): no disponible
- Paper o blog del modelo Nemotron original: no disponible
