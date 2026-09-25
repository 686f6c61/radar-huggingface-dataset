# RunningHubAI/rh-dasiwaminimaxh3-dasiwaref2vahybridv1.0-unet

## Resumen

rh-dasiwaminimaxh3-dasiwaref2vahybridv1.0-unet es un modelo de difusion de tipo UNET para generacion de video a partir de texto (pipeline declarado: text-to-video), publicado en Hugging Face por la plataforma RunningHub en nombre de un autor identificado en la model card como @T8star-Aix. Segun dicha ficha, se trata de un ajuste fino (finetune) del modelo minimax-h3, empaquetado para cargarse en ComfyUI y en la propia plataforma RunningHub.

El repositorio contiene un unico fichero de pesos, `DasiwaMinimaxH3_dasiwaREF2VAHybridV1_0.safetensors`, de 19.999 MiB (unos 19,5 GiB), dentro de un repositorio de 21,0 GB. No se publican parametros totales, arquitectura interna, datos de entrenamiento, idiomas soportados ni licencia. El nombre del fichero sugiere una variante "REF2VA" (posible condicionamiento por referencia) e "Hybrid", pero la model card no describe que significa exactamente.

Su relevancia practica es acotada y muy especifica: es un artefacto de pesos para un flujo de trabajo concreto en ComfyUI/RunningHub, no un modelo documentado de forma autonoma. Registra 0 descargas y 0 likes en el momento de la consulta y carece de benchmarks, de informacion de licencia y de guia de uso mas alla de los enlaces promocionales de la plataforma. Para alguien que evalua modelos, esto implica que cualquier decision de adopcion deberia basarse en pruebas propias y en la licencia del proyecto upstream (minimax-h3), no en la documentacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Nombre del modelo | rh-dasiwaminimaxh3-dasiwaref2vahybridv1.0-unet |
| Autor / publicador | RunningHubAI (en nombre de @T8star-Aix) |
| Arquitectura | UNET de difusion para text-to-video, segun la model card; estructura interna no detallada |
| Modelo base | minimax-h3 (finetune declarado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se describe como modelo MoE) |
| Longitud de contexto | no disponible |
| Resolucion y duracion de video | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica un fichero `.safetensors` |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors |
| Fichero de pesos | `DasiwaMinimaxH3_dasiwaREF2VAHybridV1_0.safetensors`, 19.999 MiB |
| Tamano del repositorio | 21,0 GB |
| Plataformas de uso | ComfyUI, RunningHub, Hugging Face |
| Fecha de creacion (registro) | 2026-09-25 |
| Ultima actualizacion (registro) | 2026-09-25 |

## Arquitectura y entrenamiento

La model card describe el modelo unicamente como "UNET (text-to-video)", es decir, el componente denoiser de un pipeline de difusion para video. No se especifica si se trata de un transformer de difusion (DiT) con nombres de capa heredados de la convencion UNET, ni el numero de bloques, canales, dimension de atencion o estrategia de compresion temporal. Tampoco se detalla si emplea atencion 3D completa, atencion separada espacial/temporal u otra variante. La unica referencia arquitectonica concreta es que deriva de minimax-h3 mediante ajuste fino.

No hay informacion sobre datos de entrenamiento: ni numero de tokens o de clips, ni composicion del dataset, ni resolucion nativa, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o preference tuning (poco habituales en modelos de difusion, pero no confirmado ni descartado). El sufijo "REF2VA" del nombre del fichero podria indicar condicionamiento por imagen de referencia y generacion conjunta de video y audio, y "Hybrid" podria referirse a una combinacion de ambos modos, pero son inferencias a partir del nombre y no estan respaldadas por la documentacion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal u optimizaciones de caching. La unica innovacion verificable es el propio ajuste fino y su empaquetado para ComfyUI.

## Capacidades

- Generacion de video a partir de texto: es la unica capacidad declarada explicitamente en los metadatos del repositorio (`pipeline_tag: text-to-video`).
- Ajuste fino sobre minimax-h3: hereda las capacidades del modelo base en la medida en que el finetune no las degrade, aunque no hay informacion publicada al respecto.
- Posible condicionamiento por referencia: el nombre del fichero (`REF2VA`) sugiere entrada de referencia, sin confirmacion documental.
- Posible generacion con audio: la parte "VA" del nombre podria indicarlo, sin confirmacion documental.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplicable a un UNET de difusion; no disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento (thinking mode), vision o audio como entrada: no disponible.
- Integracion con ComfyUI: es el modo de uso previsto, mediante carga del fichero de pesos como UNET.
- Uso via plataforma: la model card ofrece la plataforma RunningHub y su API como via de ejecucion en linea.

Nota importante: el repositorio solo contiene los pesos del UNET. Para generar video hace falta el resto del pipeline (encoder de texto, VAE, scheduler y demas componentes), que no se incluye ni se especifica en la ficha.

## Casos de uso

- Generacion de clips publicitarios cortos: cargando los pesos como UNET en un flujo de ComfyUI, el modelo puede producir videos breves a partir de descripciones textuales, utiles para variantes creativas rapidas de un mismo concepto antes de pasar a produccion con herramientas tradicionales.
- Prototipado de storyboards animados: un estudio puede convertir un guion en clips de baja resolucion para previsualizar ritmo, encuadre y continuidad, reduciendo el coste frente a un rodaje de prueba.
- Previz de efectos visuales: generacion de planos de referencia para que el equipo de VFX discuta composicion y movimiento de camara antes de comprometer presupuesto en render final.
- Contenido para redes sociales en formato vertical: produccion automatizada de clips cortos a partir de prompts, integrable en un calendario editorial si se dispone de la infraestructura GPU adecuada.
- Automatizacion por API: la model card apunta a la API de RunningHub como via de ejecucion, lo que permite encadenar generaciones desde un backend propio sin desplegar la infraestructura de inferencia.
- Exploracion de estilo y concepto en equipos de diseno: iterar prompts sobre el mismo flujo de ComfyUI para comparar direcciones visuales (iluminacion, paleta, tipo de plano) sin salir del entorno grafico.
- Material de apoyo para videojuegos o aplicaciones interactivas: generacion de animaciones de fondo o pantallas de carga de corta duracion cuando no se requiere precision tecnica estricta.
- Previsualizacion de referencia a video: si la variante "REF2VA" efectivamente acepta una imagen de referencia, podria emplearse para animar un fotograma clave manteniendo coherencia de identidad o estilo, aunque esta capacidad no esta confirmada en la documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas cuantitativas (FVD, CLIP score, VBench, evaluaciones humanas) ni comparaciones con otros modelos. Tampoco hay datos de latencia, throughput o consumo de VRAM medidos por el autor.

## Requisitos de hardware

- VRAM para los pesos: el fichero `.safetensors` ocupa 19.999 MiB (unos 19,5 GiB). En precision de 16 bits, solo los pesos del UNET requieren aproximadamente esa cantidad de memoria, a la que hay que sumar el encoder de texto, el VAE, los latentes de video y el overhead del runtime.
- VRAM total estimada: no disponible de forma oficial; en la practica, un flujo de video de difusion con pesos de este tamano suele necesitar mas de 24 GB para ejecutarse sin offload agresivo, aunque esta cifra es una estimacion general y no un dato publicado por el autor.
- GPU recomendadas: no disponible. Por el tamano de los pesos, el rango de uso realista son GPUs de 24 GB o mas (RTX 3090, RTX 4090, A100 40/80 GB, H100) o GPUs con menor VRAM y descarga parcial a RAM/CPU.
- GPU de consumo: no hay confirmacion de que quepa en GPUs de 8-12 GB. Sin ficheros cuantizados publicados, no se puede asumir que funcione en ese rango.
- Opciones de despliegue: ComfyUI es el entorno previsto segun los tags y la model card; la plataforma RunningHub (con API) se ofrece como alternativa en la nube. No hay informacion sobre soporte en vLLM, TGI o llama.cpp, y estos entornos no estan orientados a modelos de difusion, por lo que no aplican directamente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-dasiwaminimaxh3-dasiwaref2vahybridv1.0-unet | no disponible | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| minimax-h3 (modelo base declarado) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Otras alternativas de text-to-video | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables en la informacion proporcionada para comparar este modelo con alternativas de la misma categoria. La unica relacion documentada es la dependencia del modelo base minimax-h3, cuya ficha tecnica no aparece en el material disponible.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que los derechos pertenecen al autor y que debe seguirse la licencia del proyecto original o upstream. Sin conocer la licencia de minimax-h3, no puede asumirse que el uso comercial este permitido. Es un riesgo legal directo para cualquier despliegue en produccion.
- Documentacion minima: no hay informacion sobre datos de entrenamiento, parametros, resolucion, duracion de los clips ni metodos de condicionamiento. Cualquier evaluacion seria requiere pruebas propias.
- Dependencia del pipeline completo: el repositorio solo contiene el UNET. Sin el encoder de texto, el VAE y el scheduler adecuados, los pesos no son utilizables.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas que permitan contrastar calidad o problemas.
- Sin benchmarks: no hay ninguna metrica objetiva publicada, por lo que no puede afirmarse nada sobre fidelidad al prompt, coherencia temporal o calidad de movimiento.
- Riesgo de alucinacion y artefactos: inherente a los modelos de difusion de video (deformaciones anatomicas, incoherencia entre fotogramas, texto ilegible), aunque no hay documentacion especifica para este finetune.
- Sesgos: no documentados. En ausencia de informacion sobre el dataset de entrenamiento, no puede evaluarse el sesgo demografico, cultural o de representacion.
- Idiomas: no declarados. No hay confirmacion de que el encoder de texto asociado soporte castellano ni otros idiomas distintos del ingles.
- Anomalia en los metadatos: las fechas de creacion y actualizacion registradas (2026-09-25) no coinciden con el momento de publicacion habitual de este tipo de artefactos, lo que sugiere un error o una convencion interna de la plataforma.
- Contenido promocional mezclado: la model card incluye enlaces a servicios y a una API de terceros (Seedance 2.5) sin relacion tecnica explicita con los pesos publicados; conviene tratarlos como publicidad, no como documentacion del modelo.
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo. Las consultas devolvieron exclusivamente contenido para adultos sin relacion alguna, por lo que no se incluye ningun enlace de esa busqueda.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-dasiwaminimaxh3-dasiwaref2vahybridv1.0-unet
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2091339489426894849
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (en el propio repositorio)
