# DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-NEO-GGUF

## Resumen

Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-NEO-GGUF es una cuantizacion en formato GGUF del modelo DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI, publicado por el usuario DavidAU en Hugging Face. Se trata de un fine-tune de tipo "abliterated" y "uncensored" sobre una base de arquitectura MoE (mixture of experts) de 26B parametros, orientado a eliminar los mecanismos de rechazo y moderacion del modelo original y a potenciar modos de razonamiento, escritura creativa y rol. El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales de entrada imagen y texto.

El modelo se distribuye con una nomenclatura que enumera un conjunto de "modos" y "constructos" (27 modos de razonamiento, 27 modos instruct, 15 AI Constructs, 5 Super AI Constructs, 21 AGI Constructs, entre otros), asi como una variante "NEO Imatrix" de cuantizacion. La licencia declarada es Apache 2.0, los idiomas soportados son ingles y chino, y el acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.

La relevancia de esta ficha es acotada: se trata de un modelo de nicho, sin descargas ni likes registrados en el momento de la consulta, publicado en noviembre de 2026, y del que no se han divulgado resultados de benchmarks ni detalles tecnicos verificables sobre el entrenamiento. La informacion disponible procede unicamente de las etiquetas y metadatos de la model card de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts); detalles de capas y atencion no disponibles |
| Parametros totales | 26B (segun el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; variante "NEO Imatrix"; niveles concretos (Q4_K_M, Q8_0, etc.) no disponibles |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es de tipo MoE (mixture of experts) con 26B parametros totales, pero no se detalla el numero de expertos, los parametros activos por token, la dimension oculta, el numero de capas ni el mecanismo de atencion. El pipeline declarado es image-text-to-text, lo que implica que el modelo acepta entradas de imagen y texto, aunque no se especifica el codificador visual ni como se integra con el transformer de lenguaje.

Respecto al entrenamiento, la model card solo aporta etiquetas: "heretic", "uncensored" y "abliterated", terminos que en la practica indican un proceso de fine-tuning orientado a eliminar las respuestas de rechazo del modelo alineado original (abliteration), junto con una bateria de modos de razonamiento e instructivos descritos de forma promocional ("Turbo-Brilliance", "50X", "AGI-NEO"). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, etc.). Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto y razonamiento: el modelo declara multiples "modos de razonamiento" (hasta 27) y 9 modos de razonamiento "Xhigh", segun las etiquetas.
- Modos instructivos: 27 modos instruct declarados, orientados a distintos estilos de respuesta.
- Escritura creativa: etiquetas especificas para generacion creativa, escritura de ficcion, todos los generos, relato y roleplaying.
- Generacion de codigo: incluye un "Coder AI Construct" entre los constructos declarados.
- Capacidades multimodales: pipeline image-text-to-text, por lo que acepta imagenes junto con texto.
- Uso como agente: incluye un "Agent AI Construct" y un "Brainstorm AI Construct", orientados a tareas de planificacion y generacion de ideas.
- Multilingue: ingles y chino declarados; no se especifica cobertura adicional.
- Modo "thinking": etiqueta "thinking" presente, lo que sugiere un modo de razonamiento explicito antes de responder.
- Sin censura: el modelo esta disenado para no aplicar rechazos ni moderacion de contenido ("uncensored", "abliterated").

## Casos de uso

- Escritura creativa y ficcion: el modelo esta etiquetado para todos los generos, relato y roleplaying; se usaria para generar narrativa larga, dialogos y tramas con un modo creativo especifico, aunque la ausencia de datos sobre contexto maximo impide garantizar coherencia en textos muy largos.
- Roleplay y personajes: los modos instruct y creativos permiten mantener personajes y estilos conversacionales; la naturaleza "uncensored" lo hace adecuado para escenarios de rol sin restricciones tematicas, con la advertencia de que no hay evaluacion publica de calidad.
- Generacion de codigo asistida: el "Coder AI Construct" permite usarlo en tareas de autocompletado y explicacion de codigo; sin benchmarks de HumanEval ni datos de contexto, su idoneidad para produccion no esta verificada.
- Prototipado de agentes: el "Agent AI Construct" y los modos de razonamiento multiple permiten experimentar con flujos multi-paso y planificacion; al no documentarse soporte de tool calling, la integracion con herramientas externas requeriria ingenieria adicional.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede emplearse para describir o extraer informacion de capturas e imagenes combinadas con instrucciones de texto, en ingles o chino.
- Experimentacion en investigacion sobre alineacion: al ser un modelo abliterated, sirve como caso de estudio para analizar como el fine-tuning elimina los rechazos y que efectos colaterales tiene sobre la calidad y la seguridad.
- Generacion de ideas y lluvia de ideas: el "Brainstorm AI Construct" y el "Brainstorm Business AI Construct" estan pensados para sesiones de ideacion; utiles en talleres y exploracion creativa temprana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las etiquetas de la model card no incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y no se dispone de comparaciones verificables con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo MoE de 26B parametros en GGUF, una cuantizacion de 4 bits requeriria del orden de 14-16 GB de VRAM o RAM unificada, y una de 8 bits del orden de 26-28 GB; estas cifras son estimaciones genericas y no estan confirmadas para este modelo concreto.
- GPU recomendadas: no disponibles. Por tamano, cabria esperar viabilidad en GPUs de 24 GB (RTX 3090, RTX 4090) con cuantizaciones bajas, y en A100/H100 para cuantizaciones mayores, pero no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 con cuantizacion de 4 bits, segun la estimacion anterior; no confirmado.
- Opciones de despliegue: al distribuirse en GGUF, es compatible con llama.cpp y con frontends basados en el (Ollama, LM Studio, KoboldCpp). El soporte en vLLM o TGI no esta documentado y dependeria de la conversion del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan establecer una comparacion rigurosa. Como referencia estructural, podria compararse con otros fine-tunes MoE abliterated de ~26B en GGUF, pero no se dispone de datos verificables de ninguno de ellos en esta ficha.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": no aplica rechazos de seguridad, por lo que puede generar contenido danino, ilegal o inexacto sin filtro; no es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad; el fine-tuning agresivo sobre modelos alineados suele degradar la precision factual.
- Idiomas limitados: solo ingles y chino declarados; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Contexto desconocido: no se publica la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el acceso esta restringido (gated) y el autor no ofrece garantias; conviene revisar las condiciones de aceptacion en Hugging Face.
- Sin traccion ni validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni evaluaciones independientes; la nomenclatura promocional ("AGI-NEO", "50X", "Turbo-Brilliance") no esta respaldada por datos.
- Soporte de tool calling y agentes no documentado: las etiquetas mencionan constructos de agente, pero no se especifica formato de herramientas ni fiabilidad en flujos multi-paso.
- Fecha de publicacion futura respecto a la mayoria de referencias: creado en noviembre de 2026, lo que limita la existencia de evaluaciones externas.

## Enlaces

- Hugging Face (modelo GGUF): https://huggingface.co/DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-NEO-GGUF
- Modelo base: https://huggingface.co/DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI
- Perfil del autor: https://huggingface.co/DavidAU
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Repositorio llama.cpp (despliegue GGUF): https://github.com/ggerganov/llama.cpp
