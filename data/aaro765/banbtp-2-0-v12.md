# aaro765/BanBTP-2.0-V12

## Resumen

BanBTP-2.0-V12, con nombre en clave "candycorn", es un modelo de lenguaje de tipo solo texto publicado por el desarrollador aaro765 en Hugging Face. Segun su model card, se trata de un modelo destilado a partir de un modelo mayor propietario denominado BanBTPV11-large, con el objetivo de ofrecer una version abierta, ligera y portable que se aproxime al comportamiento del modelo grande sin requerir el almacenamiento masivo que este ultimo necesita. El autor lo presenta como el sucesor de V11 dentro de la familia BanBTP 2.0 y como base sobre la que se construira la futura version V13.

La informacion tecnica disponible es muy limitada: no se especifican el numero de parametros, la longitud de contexto, la arquitectura concreta ni los datos de entrenamiento mas alla de la mencion a un proceso de destilacion mediante una herramienta interna llamada `banlm` con la opcion `--distill`. El repositorio aparece con un tamano de 0.0 GB en el momento de la consulta, lo que sugiere que los pesos no estan publicados o no son accesibles publicamente. El modelo se distribuye bajo licencia BSD-3-Clause, lo que permite uso comercial con atribucion.

Su relevancia actual es limitada desde un punto de vista practico, ya que no hay pesos verificables, benchmarks ni documentacion tecnica detallada. Resulta de interes principalmente como ejemplo de estrategia de destilacion de modelos propietarios hacia versiones abiertas, y para quienes sigan la familia BanBTP como posible alternativa ligera en el futuro, pendiente de que se publiquen artefactos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor indica que comparte arquitectura con V11, sin detalles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (repositorio con tamano de 0.0 GB en la consulta) |

## Arquitectura y entrenamiento

La model card indica que BanBTP-2.0-V12 mantiene la misma arquitectura que V11, pero no se especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura hibrida. Tampoco se detallan el numero de capas, dimensiones ocultas, cabezas de atencion ni el mecanismo de atencion empleado. El autor afirma que el modelo es "solo texto" y que la futura V13 incorporara soporte de audio, video e imagen de forma nativa.

En cuanto al entrenamiento, el modelo se describe como un destilado de alta calidad de BanBTPV11-large, generado mediante la herramienta interna `banlm` con la opcion `--distill`. El dataset de destilacion combina datos producidos por el modelo propietario mayor, con el objetivo de replicar su comportamiento en un paquete mas pequeno. No se indican el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto: el modelo esta disenado para producir respuestas de calidad similar a las de BanBTPV11-large, segun la descripcion del autor.
- Destilacion orientada a calidad: el autor afirma que se seleccionaron las respuestas de mayor calidad del modelo grande para el proceso de destilacion.
- Portabilidad: se presenta como un modelo "rapido y portable" en comparacion con el modelo propietario de gran tamano.
- Solo texto: no soporta vision, audio ni video en esta version; el autor remite a V13 para capacidades multimodales.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de razonamiento (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al presentarse como un modelo ligero y portable, podria emplearse para iterar en el diseno de interfaces de chat antes de migrar a modelos mayores, siempre que se confirmen los pesos y el rendimiento real.
- Experimentacion academica con destilacion: util como caso de estudio de un pipeline de destilacion de un modelo propietario a uno abierto, para comparar estrategias de seleccion de datos y calidad de respuestas.
- Evaluacion de la familia BanBTP: permite a desarrolladores interesados en el ecosistema del autor probar la evolucion entre V11 y V12 en tareas de texto controladas.
- Generacion de texto en entornos con recursos limitados: si el modelo es efectivamente mucho menor que V11-large, podria desplegarse en hardware modesto para tareas de redaccion asistida, resumen o clasificacion simple, previa validacion.
- Base para ajuste fino (fine-tuning): al estar bajo licencia BSD-3-Clause, podria servir como punto de partida para especializar el modelo en dominios concretos mediante SFT o LoRA.
- Integracion en pipelines de investigacion sobre destilacion: util para reproducir o comparar metodos de destilacion usando la herramienta `banlm` mencionada por el autor.
- Desarrollo de la futura V13: el autor lo plantea como base para la destilacion de V12-large, por lo que podria interesar a quienes planeen seguir esa linea de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros y el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documentan formatos GGUF ni plantillas de chat.
- Latencia y throughput estimados: no disponible, aunque el autor afirma que el modelo sera "rapido y portable" sin aportar cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| BanBTP-2.0-V12 | no disponible | no disponible | BSD-3-Clause | no verificable (repo de 0.0 GB) |
| BanBTPV11 (version previa de la familia) | no disponible | no disponible | no disponible | no disponible en la informacion |
| BanBTPV11-large (modelo propietario) | no disponible | no disponible | propietaria (closed source) | no publico |
| Alternativas open source comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa tecnica con modelos de la misma categoria.

## Limitaciones y advertencias

- Ausencia de pesos verificables: el repositorio muestra un tamano de 0.0 GB y cero descargas, por lo que no se puede confirmar que el modelo sea utilizable.
- Falta de documentacion tecnica: no se especifican parametros, contexto, arquitectura ni datos de entrenamiento, lo que impide evaluar su idoneidad para produccion.
- Solo texto: no soporta modalidades adicionales; el autor remite a V13 para vision, audio y video.
- Riesgo de alucinacion: al ser un modelo destilado sin benchmarks publicados, no hay evidencia sobre su fiabilidad factual.
- Sesgos: no se documentan evaluaciones de sesgo ni composicion del dataset de destilacion.
- Idiomas: se desconoce si el modelo esta optimizado para ingles, castellano u otros idiomas.
- Licencia BSD-3-Clause: permite uso comercial y modificacion con atribucion, pero conviene revisar si el proceso de destilacion desde un modelo propietario plantea riesgos legales adicionales segun la jurisdiccion.
- Madurez del proyecto: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin comunidad ni soporte documentado.
- Dependencia de herramientas internas: el pipeline de destilacion (`banlm`) no es publico, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/aaro765/BanBTP-2.0-V12
- Model card del autor: incluida en la pagina de Hugging Face del modelo
- Repositorio de codigo de `banlm`: no disponible
- Paper o blog tecnico: no disponible
- Demo: no disponible
