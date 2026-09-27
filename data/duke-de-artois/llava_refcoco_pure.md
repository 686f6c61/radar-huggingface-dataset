# Duke-de-Artois/LlaVA_refcoco_pure

## Resumen

LlaVA_refcoco_pure es un adaptador LoRA (PEFT) publicado por el usuario Duke-de-Artois sobre el modelo multimodal Llava-7b. No se trata de un modelo completo, sino de un conjunto de pesos delta que deben cargarse junto al modelo base para reproducir un ajuste fino orientado a *referring expression comprehension* (grounding visual), presumiblemente sobre el conjunto de datos RefCOCO, tal como sugiere el sufijo «refcoco_pure» del identificador. El repositorio ocupa 0,8 GB y contiene pesos en formato safetensors, con la libreria PEFT 0.15.2 como framework de referencia.

El modelo resuelve una tarea concreta: dada una imagen y una expresion en lenguaje natural (por ejemplo, «el perro marron de la izquierda»), localizar la region o el objeto al que se refiere la expresion. Es una capacidad relevante para pipelines de vision-lenguaje que necesitan algo mas que una descripcion global de la imagen: anotacion automatica de datasets, robótica, inspeccion visual o interfaces de accesibilidad basadas en regiones.

La relevancia de esta ficha es limitada y conviene decirlo con claridad: la model card esta practicamente vacia (todos los campos figuran como «More Information Needed»), el repositorio no tiene descargas ni likes, no se declara licencia ni idiomas, y no se han publicado resultados de evaluacion. Cualquier uso en produccion exige validar el adaptador por cuenta propia y asumir la licencia del modelo base Llava-7b, que el autor no aclara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo vision-lenguaje LLaVA; el modelo base Llava-7b combina un codificador visual tipo CLIP ViT, un proyector multimodal y un LLM decoder de la familia Llama/Vicuna |
| Parametros totales | No disponible el recuento exacto del adaptador (repositorio de 0,8 GB); el modelo base Llava-7b tiene del orden de 7.000 millones de parametros |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llava-7b se publica habitualmente con 4.096 tokens de contexto) |
| Tipos de cuantizacion | No disponible para el adaptador (solo safetensors); el modelo base admite carga en 8 bits y 4 bits mediante bitsandbytes, y conversion a GGUF |
| Idiomas soportados | No disponible; el modelo base esta entrenado predominantemente en ingles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere descargar aparte los pesos del modelo base |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador PEFT (LoRA) sobre Llava-7b, no un modelo entrenado desde cero. La arquitectura subyacente del modelo base es la de LLaVA: un codificador visual preentrenado y congelado, un proyector lineal o MLP que traduce las caracteristicas visuales al espacio de embeddings del LLM, y un decoder de lenguaje autorregresivo que genera texto condicionado por las representaciones visuales proyectadas. El adaptador modifica unicamente un subconjunto de las matrices del modelo (tipicamente las proyecciones q, k, v y o de las capas de atencion, aunque el autor no especifica la configuracion exacta de LoRA: rango, alpha, dropout ni modulos objetivo).

En cuanto al entrenamiento, la model card no aporta ningun dato: no se indican tokens utilizados, composicion del dataset, hiperparametros, regimen de precision ni si hubo RLHF o DPO. El nombre del repositorio sugiere un ajuste sobre RefCOCO (dataset de *referring expression comprehension* construido sobre imagenes de COCO, con expresiones anotadas por anotadores humanos y coordenadas de la region objetivo), y el sufijo «pure» apunta a un entrenamiento exclusivamente sobre ese corpus, sin mezcla con otras fuentes, pero esto es una inferencia a partir del identificador y no una afirmacion respaldada por la documentacion. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, vision con resolucion dinamica, etc.).

## Capacidades

- Comprension de expresiones referenciales (visual grounding): localizacion de objetos o regiones descritas en lenguaje natural dentro de una imagen.
- Generacion de texto condicionado por imagen, heredada del modelo base Llava-7b (descripcion, respuesta a preguntas visuales, conversacion multimodal).
- Salida de coordenadas o bounding boxes asociadas a la region referida, que es el comportamiento tipico esperado tras un ajuste sobre RefCOCO.
- Conversacion multi-turno con contexto visual, en la medida en que lo permita el modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el ajuste sobre RefCOCO (corpus en ingles) hace previsible un rendimiento muy inferior en otros idiomas.
- Capacidades especiales (modo *thinking*, audio, video): no disponibles en la informacion proporcionada.

## Casos de uso

- Anotacion automatica de datasets de grounding: el adaptador puede preetiquetar regiones a partir de descripciones textuales, reduciendo el coste de anotacion manual en proyectos de vision-lenguaje; el revisor humano solo valida o corrige las cajas propuestas.
- Interfaces de accesibilidad guiadas por region: un usuario describe lo que busca («el boton de la esquina inferior derecha») y el sistema localiza el elemento en la captura de pantalla o en la imagen.
- Inspeccion visual industrial: localizar un componente concreto descrito en el parte de incidencia (por ejemplo, «la valvula roja del segundo modulo») dentro de una fotografia de la linea de produccion.
- Robotica y manipulacion: dado un comando en lenguaje natural, obtener la region de la imagen donde se encuentra el objeto que debe recogerse, como paso previo a la planificacion de la trayectoria.
- Comercio electronico: localizar un producto concreto dentro de una imagen de catalogo o de una foto de usuario a partir de una descripcion textual, para enlazarlo con la ficha correspondiente.
- Verificacion de contenido y *fact-checking* visual: comprobar si una region concreta de una imagen coincide con la descripcion que acompana a una publicacion.
- Investigacion academica en grounding referencial: usar el adaptador como *baseline* reproducible sobre RefCOCO dentro de experimentos comparativos de PEFT frente a ajuste completo.

En todos los casos, la idoneidad depende de validar primero el adaptador, ya que no existe ninguna evaluacion publicada que respalde su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion sin rellenar, no se declaran metricas de RefCOCO (accuracy con IoU 0,5, precision@0,5, etc.) ni comparaciones con el modelo base.

## Requisitos de hardware

- Al ser un adaptador LoRA, la VRAM viene determinada por el modelo base Llava-7b, no por los 0,8 GB del repositorio.
- Inferencia estimada del modelo base en fp16/bf16: en torno a 14-16 GB de VRAM, mas el coste de las activaciones y de las caracteristicas visuales.
- Inferencia estimada en cuantizacion de 4 bits: aproximadamente 5-7 GB de VRAM, lo que lo situa al alcance de GPU de consumo con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3080 10 GB con margen ajustado).
- GPU profesionales recomendadas para servicio en fp16: A100 40/80 GB, H100, L40S o A6000; para una sola instancia con 4 bits basta una RTX 4090 (24 GB) con holgura.
- Opciones de despliegue: carga mediante transformers + peft (fusionando el adaptador con el modelo base), vLLM, TGI, o conversion a GGUF para llama.cpp y Ollama en entornos de CPU o GPU limitada. El autor no documenta ninguna de estas rutas.
- Latencia y throughput: no disponibles; no se aportan mediciones de tokens por segundo ni de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LlaVA_refcoco_pure (este adaptador) | Adaptador sobre base de ~7.000 M | No disponible | Grounding referencial sobre RefCOCO | No disponible | HuggingFace, 0 descargas |
| Llava-7b (modelo base) | ~7.000 M | 4.096 tokens (configuracion habitual) | Vision-lenguaje general | No disponible en esta ficha (depende del repositorio original) | Ampliamente desplegado |
| Otros VLM de ~7.000 M con grounding (por ejemplo, variantes de Qwen2-VL o InternVL ajustadas para deteccion) | ~7.000-8.000 M | 32.768 tokens o superior segun variante | Vision-lenguaje con deteccion y grounding | Variable, habitualmente permisiva en las variantes abiertas | HuggingFace y vLLM |

No se dispone de datos de rendimiento comparado entre estas alternativas para esta ficha, por lo que la comparativa se limita a parametros, contexto y disponibilidad.

## Limitaciones y advertencias

- Model card vacia: el autor no documenta datos de entrenamiento, hiperparametros, licencia, idiomas ni uso previsto, lo que impide auditar el modelo.
- Sin resultados de evaluacion: no hay ninguna metrica publicada, ni siquiera sobre el propio RefCOCO, por lo que se desconoce si el ajuste funciona.
- Sin trazas de uso: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Licencia indeterminada: al no declararse licencia, no puede asumirse permiso para uso comercial; ademas, el adaptador hereda las restricciones del modelo base Llava-7b, que deben verificarse en su repositorio original.
- Riesgo de sobreajuste al dominio: un ajuste «puro» sobre RefCOCO puede degradar capacidades generales de conversacion del modelo base y reducir su rendimiento fuera de la tarea de grounding.
- Sesgos heredados: RefCOCO se construye sobre imagenes de COCO y anotaciones en ingles, con la distribucion de categorias y de vocabulario de ese corpus; es previsible un sesgo hacia los objetos y escenas sobrerrepresentados en COCO.
- Alucinacion y falsos positivos: en tareas de grounding, el modo de fallo tipico es devolver una caja plausible para una expresion que no tiene referente en la imagen, en lugar de indicar que no existe.
- Limitacion idiomatica: entrenado con expresiones en ingles; el rendimiento en castellano es imprevisible y presumiblemente bajo.
- Sin garantias de produccion: no hay informacion sobre precision en fp16 frente a bf16 tras fusionar el adaptador, ni sobre compatibilidad con kernels de atencion optimizados o con despliegue cuantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Duke-de-Artois/LlaVA_refcoco_pure
- Referencia citada en los tags del repositorio (Lacoste et al., 2019, calculadora de impacto de carbono): https://arxiv.org/abs/1910.09700
- Proyecto LLaVA (modelo base, no citado en la model card): https://github.com/haotian-liu/LLaVA
- Pagina del modelo base Llava-7b en HuggingFace (no citada en la model card): https://huggingface.co/liuhaotian/llava-v1.5-7b
- Documentacion de PEFT: https://huggingface.co/docs/peft
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces encontrados corresponden a la Universidad Duke, a la entrada generica de Wikipedia sobre el titulo nobiliario «duque» y a un fabricante de ruedas de bicicleta, y no guardan relacion con el artefacto descrito.
