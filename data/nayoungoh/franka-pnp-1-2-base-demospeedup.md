# nayoungoh/franka-pnp-1-2-base-demospeedup

## Resumen

`nayoungoh/franka-pnp-1-2-base-demospeedup` es un modelo alojado en HuggingFace por el usuario nayoungoh, publicado y actualizado el 19 de septiembre de 2026. Por su nombre, sus etiquetas (`gr00t_n1_5`, `safetensors`) y su tamano, se trata con alta probabilidad de un modelo de vision-lenguaje-accion (VLA) orientado a robotica, derivado de la familia NVIDIA Isaac GR00T N1.5, y ajustado para una tarea concreta de pick-and-place sobre un brazo Franka.

El modelo cuenta con 2.724.114.368 parametros reales (aproximadamente 2,72 mil millones), declarados en los pesos safetensors, y el repositorio ocupa 7,6 GB. La etiqueta `gr00t_n1_5` apunta a la arquitectura de NVIDIA para control de robots humanoides y brazos, que combina un backbone de vision-lenguaje con una cabecera de generacion de acciones. El sufijo `base-demospeedup` sugiere una variante base entrenada sobre demostraciones con algun tipo de aceleracion de las mismas.

Es relevante porque los modelos VLA de codigo abierto son escasos y este tipo de ajustes especificos de tarea (Franka, pick-and-place) permiten a equipos de robotica evaluar rapidamente si un modelo fundacional generalista puede especializarse en un caso concreto. No obstante, la ficha publicada no incluye pipeline, licencia, idiomas ni documentacion tecnica, por lo que buena parte de sus especificaciones no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la ficha. La etiqueta `gr00t_n1_5` sugiere una arquitectura VLA de la familia NVIDIA Isaac GR00T N1.5 (backbone de vision-lenguaje + cabecera de generacion de acciones) |
| Parametros totales | 2.724.114.368 (aproximadamente 2,72 mil millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion oficial sobre la arquitectura en la ficha del modelo. La etiqueta `gr00t_n1_5` asocia el modelo a la familia NVIDIA Isaac GR00T N1.5, una arquitectura de vision-lenguaje-accion (VLA) que combina un backbone de vision-lenguaje con un modulo de generacion de acciones para control robotico. En esta familia, la parte de percepcion y comprension del lenguaje se apoya en un modelo visual-lingüistico y la parte de accion genera trayectorias o comandos de control de forma continua.

Tampoco hay datos disponibles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o aprendizaje por imitacion a partir de demostraciones. El sufijo `demospeedup` del identificador sugiere que el ajuste se realizo sobre demostraciones de teleoperacion, posiblemente con algun esquema de aceleracion temporal de las mismas, pero es una inferencia a partir del nombre y no un dato confirmado por el autor.

## Capacidades

- Control robotico orientado a tareas de manipulacion: por la nomenclatura (`franka-pnp`) y la etiqueta `gr00t_n1_5`, se espera que genere acciones de control para un brazo Franka en tareas de pick-and-place.
- Percepcion visual y comprension de instrucciones en lenguaje: propia de la arquitectura VLA subyacente, aunque no confirmada en la ficha.
- Generacion de acciones continuas para control de robot: capacidad esperada en modelos de la familia GR00T, no documentada en este repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la ficha.

Dado que la ficha no incluye model card, config.json publico ni documentacion, estas capacidades son en su mayoria inferencias basadas en la etiqueta y el nombre, y deben verificarse antes de cualquier uso en produccion.

## Casos de uso

- Manipulacion pick-and-place con brazo Franka: el modelo parece ajustado especificamente para esta tarea, por lo que encaja en celdas de recogida y colocacion de piezas en entornos de fabricacion o laboratorio.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para comparar ajustes sobre GR00T N1.5 con distintas estrategias de datos (con y sin `speedup` de demostraciones).
- Prototipado rapido en robotica de laboratorio: al ser un modelo pequeno (2,72 mil millones de parametros) y un repositorio de 7,6 GB, es viable cargarlo en estaciones de trabajo con una sola GPU para experimentar con politicas de control.
- Base para fine-tuning especifico de tarea: equipos que quieran adaptar un VLA a un brazo o a una tarea nueva pueden usarlo como inicializacion, dado su caracter `base`.
- Evaluacion de generalizacion de modelos VLA fundacionales: permite estudiar cuanto conocimiento general conserva un modelo tras un ajuste estrecho en una tarea de pick-and-place.
- Reproduccion y auditoria de experimentos: util para verificar resultados publicados sobre variantes `demospeedup` frente a variantes base, siempre que se conozca el pipeline de entrenamiento original.

Estos casos son aplicaciones plausibles dada la naturaleza del modelo, pero ninguno esta confirmado por documentacion oficial del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones basadas en el numero de parametros declarado (2,72 mil millones) y no en datos oficiales del autor:

- VRAM estimada para inferencia en precision completa (FP32): en torno a 11 GB solo para pesos.
- VRAM estimada en FP16/BF16: aproximadamente 5,5 GB para los pesos, mas overhead de activaciones y del backbone visual.
- VRAM estimada en cuantizacion INT8: alrededor de 2,8 GB.
- VRAM estimada en cuantizacion INT4: alrededor de 1,5 GB.
- GPU recomendadas: una RTX 4090 (24 GB), RTX 3090 (24 GB), L40S o A100 40 GB son suficientes para inferencia en FP16. Para entrenamiento o fine-tuning completo conviene A100 80 GB o H100.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090, RTX 3090, e incluso en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: no confirmadas. Al pertenecer a la familia GR00T N1.5, lo mas probable es que requiera el stack de inferencia de NVIDIA Isaac GR00T. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nayoungoh/franka-pnp-1-2-base-demospeedup | 2,72 mil millones | No disponible | VLA (probable, GR00T N1.5) | No disponible | HuggingFace, 12 descargas |
| NVIDIA Isaac GR00T N1.5 | En torno a 3 mil millones (referencia de familia) | No disponible | VLA | No disponible en esta ficha | Fundacional de NVIDIA |
| OpenVLA | En torno a 7 mil millones | No disponible | VLA | Abierta (referencia de familia) | Codigo abierto |

Los datos de los modelos comparables son referencias generales de sus respectivas familias y no proceden de la informacion proporcionada en esta busqueda. La comparacion directa de rendimiento no es posible porque no hay benchmarks publicados para este modelo concreto.

## Limitaciones y advertencias

- La ficha del modelo no incluye model card, descripcion, licencia, pipeline ni idiomas, lo que dificulta evaluar su idoneidad para cualquier uso.
- Al estar ajustado probablemente a una tarea especifica de pick-and-place con Franka, es muy posible que generalice mal a otras tareas, morfologias de robot o entornos.
- No hay benchmarks publicados, por lo que no se puede cuantificar su rendimiento ni compararlo con alternativas.
- Riesgo de alucinacion y de acciones incorrectas: en modelos de control robotico, errores en la generacion de acciones pueden provocar danos fisicos o colisiones; se requiere supervision y limites de seguridad.
- Sesgos: no evaluados ni documentados; al depender de demostraciones de teleoperacion, puede heredar sesgos del operador y del entorno de recogida de datos.
- Restricciones de licencia: la licencia no esta declarada, por lo que se desconoce si se permite uso comercial. Debe consultarse con el autor antes de cualquier despliegue productivo.
- La fecha de creacion declarada (19 de septiembre de 2026) es posterior a la fecha actual, lo que puede indicar un error de metadatos y conviene verificarlo.
- El numero de descargas (12) y de likes (0) es muy bajo, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/nayoungoh/franka-pnp-1-2-base-demospeedup
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
