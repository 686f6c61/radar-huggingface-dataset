# datouge/Index-Translate-9B-Q4_K_M-GGUF

## Resumen

Index-Translate-9B es un modelo de traduccion multilingue de 9.200 millones de parametros desarrollado por IndexTeam (equipo vinculado a bilibili), construido sobre el backbone Qwen3.5. Forma parte de una familia que incluye tres tamanos (2B, 9B y 35B-A3B) y que cubre 150 idiomas con seguimiento de instrucciones de traduccion: terminologia, formato, estilo, estructura y restricciones de longitud de salida. Segun sus autores, alcanza una calidad de traduccion comparable a modelos de escala 100B, lo que lo situa en la franja de modelos especializados que compiten con LLMs generalistas mucho mayores.

La ficha que se documenta aqui no es el checkpoint original, sino la conversion a formato GGUF realizada por el usuario datouge a partir de `IndexTeam/Index-Translate-9B`, con cuantizacion Q4_K_M. Esta pensada para ejecucion local con llama.cpp y sus derivados (llama-server, llama-cli, Ollama, LM Studio), lo que permite desplegar un traductor de 150 idiomas en hardware de consumo sin depender de APIs externas. El repositorio tiene 5,8 GB, 49 descargas y 0 likes en el momento de la consulta, y se publica bajo licencia Apache 2.0.

El interes actual del modelo reside en dos factores: por un lado, la especializacion en traduccion con control instruccional (no solo traducir, sino respetar glosarios y formatos), algo que los modelos generalistas de 7-9B suelen hacer de forma irregular; por otro, la disponibilidad en GGUF, que abarata radicalmente el coste de inferencia frente a alternativas propietarias o a modelos de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone Qwen3.5), segun la model card del modelo base |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2 B) |
| Parametros activos | No aplica: no es un modelo MoE (el miembro MoE de la familia es el 35B-A3B) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de la model card usa `-c 2048`, pero es solo un ejemplo de invocacion, no una especificacion) |
| Tipos de cuantizacion | GGUF Q4_K_M unicamente en este repositorio (fichero `index-translate-9b-q4_k_m.gguf`) |
| Idiomas soportados | 150 idiomas segun la model card del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio). El modelo original se distribuye en safetensors |
| Tamano del repositorio | 5,8 GB |
| Modelo base | IndexTeam/Index-Translate-9B |
| Pipeline declarado | translation |

## Arquitectura y entrenamiento

El checkpoint original es un transformer decoder derivado de Qwen3.5, reentrenado y ajustado por IndexTeam para la tarea de traduccion multilingue. La familia Index-Translate combina, segun el paper asociado, una base multilingue compartida con entrenamiento especializado para traduccion general, seguimiento de instrucciones, traduccion de voz, doblaje controlado y traduccion de documentos largos. El modelo de 9B que nos ocupa es la variante de texto: los autores detallan en la documentacion del modelo base que soporta instrucciones de traduccion referidas a terminologia, formato, estilo, estructura y limites de longitud de salida.

No se dispone, en la informacion proporcionada, del numero de tokens de entrenamiento, de la composicion del dataset ni del detalle de las fases de alineacion (RLHF, DPO u otras). Tampoco se documenta si hay innovaciones de inferencia (atencion lineal, decodificacion especulativa) aplicadas en esta variante. Lo que si se afirma de forma cualitativa es que la calidad de traduccion es comparable a la de modelos de escala 100B, afirmacion que procede de los autores y que no viene acompanada de cifras verificables en los materiales consultados. La conversion a GGUF se realizo con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, aplicando cuantizacion Q4_K_M, que reduce el peso a aproximadamente 5,5-5,8 GB a costa de una perdida de precision respecto al checkpoint en safetensors.

## Capacidades

- Traduccion de texto entre 150 idiomas, con el ingles y el chino explicamente mencionados como idiomas cubiertos por la familia.
- Seguimiento de instrucciones de traduccion: imposicion de terminologia (glosarios), formato de salida, estilo, estructura y restricciones de longitud.
- Preservacion de contenido en traducciones de documentos, segun la descripcion del modelo base.
- Generacion de texto conversacional, ya que el repositorio esta etiquetado como `conversational` y es compatible con endpoints tipo chat.
- Compatibilidad con el ecosistema llama.cpp: inferencia local, servidor HTTP y modo chat.
- Capacidades de voz y doblaje: presentes en la familia Index-Translate, pero atribuidas a variantes especializadas de la familia, no confirmadas para este checkpoint de texto.
- Soporte de tool calling, agentes y razonamiento multi-paso: no documentado en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica con glosario: el modelo acepta instrucciones de terminologia, de modo que se le puede forzar a usar un termino concreto para cada concepto (por ejemplo, "despliegue" en lugar de "deployment" segun la guia de estilo), lo que encaja en pipelines de documentacion con control de calidad terminologico.
- Localizacion de interfaces de usuario: al respetar restricciones de longitud de salida y estructura, resulta util para traducir cadenas de recursos (JSON, YAML, .po) donde el espacio disponible en pantalla es limitado y no se puede reflow libremente.
- Traduccion de contenido estructurado (Markdown, HTML, tablas): la capacidad de preservar estructura permite traducir documentacion, informes o articulos sin romper el marcado, reduciendo el post-procesado manual.
- Atencion al cliente multilingue: desplegado con `llama-server` en una GPU de consumo, puede traducir entradas y salidas de un sistema de soporte en tiempo real cubriendo idiomas minoritarios que otras soluciones no soportan.
- Preprocesado y postprocesado en pipelines RAG multilingues: traduccion de consultas y de fragmentos recuperados para normalizar un corpus heterogeneo antes de la busqueda vectorial, o para presentar la respuesta final en el idioma del usuario.
- Localizacion de subtitulos: traduccion de transcripciones generadas por un sistema ASR externo, aplicando limites de caracteres por linea y reglas de estilo propias de subtitulado; requiere un componente de reconocimiento de voz separado, ya que este checkpoint es de texto.
- Traduccion de documentacion legal o contractual asistida: con la limitacion de que requiere revision humana, el modelo puede producir un primer borrador consistente y terminologicamente estable para documentos largos, aprovechando la capacidad de preservar estructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia de rendimiento es cualitativa: la model card del modelo base afirma una calidad de traduccion "comparable a modelos de escala 100B", sin cifras concretas de BLEU, COMET, MMLU u otras metricas, ni comparaciones numericas con alternativas. No se incluyen por tanto tablas de resultados, para no introducir datos no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia con Q4_K_M: aproximadamente 6-8 GB en total, sumando los ~5,5-5,8 GB de pesos y la cache KV mas el overhead de llama.cpp. La memoria exacta depende de la longitud de contexto configurada y del tipo de cache KV.
- GPU consumer compatibles: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090. En GPUs de 8 GB el margen es ajustado si se usan contextos largos.
- GPU de datacenter: A100, H100, L40S o L4 son sobredimensionadas para esta cuantizacion, pero utiles si se sirven muchas peticiones concurrentes desde un mismo nodo.
- Apple Silicon: ejecutable en Macs con memoria unificada de 16 GB o superior mediante llama.cpp con backend Metal.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) de forma nativa; Ollama o LM Studio importando el GGUF; otros runners compatibles con GGUF. vLLM y TGI no son la via natural para este artefacto, ya que su soporte esta orientado a pesos safetensors (vLLM tiene soporte parcial de GGUF, pero no es el camino recomendado por el autor).
- Latencia y throughput: no disponibles. No hay cifras publicadas para esta cuantizacion ni para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Index-Translate-9B (Q4_K_M de datouge) | 9,2 B | 150 | No disponible | Apache 2.0 | GGUF, repositorio comunitario en HuggingFace |
| Qwen3-MT | Variantes de 1,7B / 4B / 8B / 32B | 92 | No disponible | Apache 2.0 (segun su ficha oficial) | Safetensors, repositorio oficial |
| TowerInstruct-7B (Unbabel) | 7 B | 10 | No disponible | CC-BY-NC-4.0 | Safetensors, repositorio oficial |
| NLLB-200 (Meta) | 3,3 B (entre otras variantes) | 200 | No disponible | CC-BY-NC-4.0 | Safetensors, repositorio oficial |

Nota: los datos de los modelos comparables proceden de sus fichas publicas y conviene verificarlos en el repositorio oficial antes de tomar decisiones de produccion. La diferencia mas relevante de Index-Translate-9B frente a TowerInstruct y NLLB-200 es la licencia Apache 2.0, que habilita uso comercial sin las restricciones no comerciales de las otras dos, y su cobertura de 150 idiomas, superior a la de TowerInstruct y mas amplia que la de la mayoria de modelos abiertos de traduccion de la misma franja de tamano.

## Limitaciones y advertencias

- Es un modelo especializado en traduccion: no debe esperarse de el un comportamiento de asistente generalista ni un razonamiento complejo fuera de tareas de traduccion o de generacion de texto simple.
- Existe riesgo de alucinacion, especialmente en idiomas de bajos recursos y en terminologia muy especifica no incluida en las instrucciones; conviene validar con metricas automaticas (COMET, BLEU) y con revision humana en dominios criticos.
- La cuantizacion Q4_K_M introduce una perdida de calidad respecto al checkpoint original en safetensors; si la precision es critica, hay que evaluar el modelo base.
- No se dispone de informacion sobre sesgos demograficos, culturales o de genero en los datos de entrenamiento; tampoco sobre sesgos por idioma.
- La longitud de contexto no esta documentada en la informacion disponible; el ejemplo de la model card usa `-c 2048`, y asumir valores mayores sin verificar puede degradar la calidad.
- Este repositorio es una conversion de terceros (usuario datouge) y no esta mantenido por IndexTeam; para produccion conviene verificar la integridad del fichero GGUF y contrastar con el modelo original.
- La licencia Apache 2.0 del checkpoint permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los pesos originales antes de desplegarlo en un producto.
- Los idiomas soportados proceden de la documentacion del modelo base; el rendimiento relativo por idioma no esta cuantificado en los materiales consultados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/datouge/Index-Translate-9B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-9B
- Repositorio en GitHub: https://github.com/bilibili/Index-Translate
- Paper: https://arxiv.org/abs/2609.40181
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Otro modelo GGUF del mismo autor: https://huggingface.co/datouge/phi-4-Q4_K_M-GGUF
