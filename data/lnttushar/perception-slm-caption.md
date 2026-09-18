# LNTTushar/perception-slm-caption

## Resumen

Perception SLM Caption (identificador `LNTTushar/perception-slm-caption`) es un modelo multimodal de comprension de imagenes publicado por el usuario LNTTushar en HuggingFace. Segun la model card, se trata de un modelo entrenado *from scratch* (es decir, no derivado de un backbone preentrenado existente) que forma parte de la "Fase 2 / image v0" del proyecto Perception SLM. Su tarea declarada es la generacion de descripciones de imagenes (*captioning*), bajo la configuracion interna denominada `caption_lm`.

La arquitectura descrita sigue el patron clasico de los VLM compactos: un codificador visual (*encoder*), un conector o *resampler* que proyecta y comprime las representaciones visuales, y un decodificador de lenguaje de tamano reducido (*tiny decoder*). El entrenamiento se divide en dos etapas declaradas: una fase de alineacion (Stage-2) y una fase de ajuste por instrucciones con LoRA (Stage-3). La licencia es Apache 2.0.

La relevancia de esta ficha es limitada y conviene ser explicito: el repositorio registra 0 descargas y 0 *likes*, tiene un tamano de 0.0 GB y fue creado y actualizado el 17 de septiembre de 2026 con cuatro segundos de diferencia, lo que sugiere un artefacto experimental recien subido y sin validacion externa. No se dispone de numero de parametros, longitud de contexto, idiomas soportados ni resultados de benchmarks mas alla de dos metricas de validacion (*held-out*) reportadas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder visual → conector (*resampler*) → decodificador de lenguaje pequeno; configuracion interna `caption_lm` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `model_int8.pt`, indicado como "if uploaded", es decir, su presencia no esta confirmada); pesos originales en float sin especificar |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt` con las claves `model_state` y metadatos de entrenamiento); opcionalmente `model_int8.pt`; no se ofrecen safetensors ni GGUF |

Otros datos del repositorio:

| Parametro | Valor |
|---|---|
| Autor | LNTTushar |
| Libreria declarada | `perception-slm` |
| Pipeline declarado | no disponible |
| Descargas | 0 |
| Likes | 0 |
| Tamano del repositorio | 0.0 GB |
| Fecha de creacion | 2026-09-17 |
| Fecha de actualizacion | 2026-09-17 |
| Region | us |

## Arquitectura y entrenamiento

La model card describe una arquitectura en tres bloques: un *encoder* visual, un conector implementado como *resampler* (mecanismo habitual para reducir el numero de tokens visuales antes de entregarlos al decodificador) y un decodificador de lenguaje "tiny". El modelo se presenta como entrenado *from scratch*, lo que implica que ni el codificador ni el decodificador parten de pesos preentrenados de terceros, a diferencia de la mayoria de VLM de la misma categoria. No se especifica si el *encoder* es un ViT, un CNN o un componente propio, ni el numero de capas, dimensiones ocultas, cabezas de atencion o vocabulario.

El entrenamiento declarado consta de una "Stage-2 alignment" (alineacion entre espacios visual y textual) y una "Stage-3 LoRA instruction tuning" (ajuste por instrucciones mediante LoRA). No se indica el numero de tokens de entrenamiento, la composicion del dataset, la resolucion de imagen de entrada, la estrategia de RLHF/DPO (no se menciona ninguna), ni hiperparametros de entrenamiento mas alla de los metadatos que pudieran estar dentro de `model.pt`. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal u otros mecanismos. La model card remite al repositorio `perception-slm` y a su fichero `RESULTS.md` para mas informacion, pero la URL del repositorio aparece vacia (`https://github.com/`) en el texto proporcionado, por lo que no es resoluble.

## Capacidades

Las capacidades verificables a partir de la informacion disponible son muy limitadas. Lo unico confirmado por la model card es:

- Comprension de imagenes (*image understanding*) y generacion de descripciones (*captioning*), segun la configuracion `caption_lm`.
- Entrada multimodal imagen + texto (etiquetas `multimodal` y `vlm`).
- Ajuste por instrucciones mediante LoRA en la Stage-3, lo que sugiere capacidad de seguir instrucciones textuales, aunque no se documenta con ejemplos ni con un formato de prompt concreto.

No hay informacion disponible sobre:

- Soporte de *tool calling* o *function calling*.
- Soporte de agentes o razonamiento multi-paso.
- Capacidades multilingues (no se declaran idiomas).
- Modo de razonamiento explicito (*thinking mode*), audio, video u otras modalidades.
- Capacidades de codigo o matematicas.

## Casos de uso

Dado que el modelo no tiene parametros, contexto, idiomas ni evaluacion publicos, los casos de uso deben considerarse hipoteticos y sujetos a validacion propia:

- Generacion automatica de pies de foto en un CMS o gestor de activos digitales: el modelo recibe una imagen y devuelve una descripcion textual, que se almacenaria como metadato `alt` o como descripcion indexable para busqueda. Su utilidad real depende de la calidad del *captioning*, y el BLEU-4 de 10.07 reportado en validacion es bajo en terminos absolutos, por lo que requeriria revision humana.
- Etiquetado preliminar de catalogos de imagen a gran escala: como paso de preanotacion en un flujo donde un modelo mayor o un anotador humano corrige despues, siempre que el coste de inferencia sea suficientemente bajo (dato no disponible).
- Prototipado e investigacion en arquitecturas VLM *from scratch*: el valor principal del artefacto es como referencia reproducible de un *pipeline* encoder → resampler → decoder con alineacion en dos etapas y LoRA, no como componente de produccion.
- Experimentos academicos de ablacion sobre el *resampler*: al publicar `config.yaml` junto al checkpoint, permite reproducir la construccion del modelo y modificar el conector para comparar variantes.
- Inferencia en CPU o entornos sin GPU: existe un fichero `model_int8.pt` descrito como "int8-quantized weights for CPU/offline", aunque su subida no esta confirmada; de estar disponible, permitiria desplegar en equipos sin acelerador grafico.
- Generacion de descripciones para accesibilidad web en lotes pequenos: integrable como script puntual sobre un directorio de imagenes, asumiendo que el modelo funciona en el dominio de las imagenes objetivo (no documentado).

No se recomienda su uso en produccion con usuarios finales sin una evaluacion propia previa, dado el estado del repositorio.

## Benchmarks y rendimiento

El autor reporta dos metricas de *held-out* en la model card:

| Metrica | Valor |
|---|---|
| Loss | 2.3982 |
| BLEU-4 | 10.07 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, VQAv2, COCO Caption, MMMU, etc.) en la informacion disponible, ni se especifica el conjunto de validacion empleado, el tamano de la muestra ni el procedimiento de decodificacion, por lo que las dos cifras anteriores no son directamente comparables con las de otros modelos. No se dispone de comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se ha publicado el numero de parametros ni la resolucion de imagen de entrada, que son los dos factores determinantes. El unico indicio cualitativo es la descripcion "tiny decoder" en la model card, que sugiere un decodificador de baja capacidad, pero no permite calcular cifras fiables.
- GPU recomendadas: no disponible por la misma razon.
- Compatibilidad con GPU de consumo: no confirmada. La existencia de un fichero int8 destinado a CPU sugiere que el modelo esta pensado para entornos con recursos limitados, pero es una inferencia, no un dato.
- Opciones de despliegue: la model card solo documenta carga mediante `huggingface_hub.hf_hub_download` y `torch.load`, reconstruyendo el modelo con `ImageVLM.from_config(config)` y aplicando `load_state_dict(ckpt["model_state"])`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ningun otro servidor de inferencia, y el formato de pesos no es GGUF ni safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa con la informacion proporcionada. Los modelos de la misma categoria (captioning de imagenes con arquitectura encoder-decoder compacta, como BLIP, GIT o los VLM pequenos tipo SmolVLM) no aparecen mencionados en la model card ni en los resultados de busqueda, y no se dispone de sus especificaciones dentro del material facilitado, por lo que no se rellenan celdas con datos no verificados.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LNTTushar/perception-slm-caption | no disponible | no disponible | BLEU-4 10.07 y loss 2.3982 en validacion propia | Apache 2.0 | HuggingFace, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Estado del artefacto: 0 descargas, 0 *likes*, repositorio de 0.0 GB y creacion/actualizacion separadas por cuatro segundos. Es un experimento sin validacion externa ni adopcion conocida.
- Sesgos conocidos: no documentados. Al ser un modelo *from scratch* con datos de entrenamiento no descritos, el riesgo de sesgos de dominio, geograficos y de representacion es alto y no auditable.
- Riesgo de alusionacion: no evaluado. Un BLEU-4 de 10.07 en validacion indica solapamiento bajo con las referencias, lo que en captioning suele correlacionar con descripciones incompletas o genericas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta publicada y los idiomas soportados no se declaran; no se puede asumir cobertura del castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. Sin embargo, al ser un modelo entrenado *from scratch*, el autor no documenta la procedencia ni la licencia del dataset de entrenamiento, lo que traslada un riesgo legal no resuelto al usuario que lo explote comercialmente.
- Formato de pesos no estandar: `model.pt` requiere `torch.load` con el codigo propio del proyecto y `config.yaml` para reconstruir la clase `ImageVLM`. Esto impide usarlo directamente en servidores de inferencia habituales y obliga a escribir codigo de integracion propio.
- Dependencia de codigo no publicada: el repositorio `perception-slm` referenciado aparece con URL vacia en la model card, por lo que la clase `ImageVLM` y el fichero `RESULTS.md` pueden no ser localizables.
- Incertidumbre sobre `model_int8.pt`: la propia model card lo condiciona a "if uploaded", de modo que su existencia no esta garantizada.
- Ausencia de soporte documentado de *tool calling*, agentes, codigo o matematicas: no debe asumirse ninguna de estas capacidades.

## Enlaces

- HuggingFace: https://huggingface.co/LNTTushar/perception-slm-caption
- Repositorio `perception-slm` (referenciado en la model card): https://github.com/ (URL incompleta en la informacion proporcionada; no resoluble)
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo, al proyecto Perception SLM ni a publicaciones asociadas. Los unicos resultados devueltos corresponden a paginas genericas de YouTube sin relacion con el modelo.
