# RunningHubAI/rh-scail2-lora

## Resumen

rh-scail2-lora es un adaptador LoRA (Low-Rank Adaptation) publicado por RunningHubAI en Hugging Face, pensado para su uso en ComfyUI y en la plataforma RunningHub. Segun la model card, los pesos estan afinados a partir de WAN2.1, el modelo de generacion de video de Alibaba, y el autor lo describe como un "modelo de aceleracion dedicado de alta calidad" (scail2高质量专用加速模型), es decir, un adaptador orientado a reducir el coste de inferencia del modelo base.

El repositorio contiene un unico fichero safetensors de 601 MiB con los pesos del LoRA. Se trata, por tanto, de un componente auxiliar y no de un modelo autonomo: su funcion solo tiene sentido cargado sobre el modelo base WAN2.1 correspondiente dentro de un flujo de trabajo de ComfyUI o mediante la API de RunningHub.

Su relevancia es practica mas que arquitectonica: los LoRA de aceleracion permiten recortar el numero de pasos de muestreo en modelos de difusion de video, que son especialmente costosos en VRAM y tiempo de calculo. No obstante, la informacion publicada es muy escasa (sin pipeline declarado, sin licencia explicita, sin idiomas, sin benchmarks y con cero descargas registradas), por lo que cualquier evaluacion rigurosa exige probar el adaptador contra el modelo base en el entorno real de ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion de video; modelo base WAN2.1 |
| Parametros totales | no disponible (adaptador LoRA; fichero de 601 MiB) |
| Longitud de contexto | no disponible (no aplica: modelo de difusion de video) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | no disponible (no aplica: generacion de video) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del upstream (WAN2.1) |
| Formato de pesos | safetensors (`scail2高质量专用加速模型.safetensors`) |
| Tipo de modelo | LoRA |
| Modelo base declarado | WAN2.1 ("Finetuned from: WAN2.1") |
| Tamano del repositorio | 0,6 GB (fichero de pesos de 601 MiB) |
| Plataformas declaradas | ComfyUI / RunningHub / Hugging Face |
| Fecha de creacion | 2026-09-24 |
| Fecha de ultima actualizacion | 2026-09-24 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador ni el proceso de entrenamiento. Lo unico declarado es que se trata de un LoRA (`tags: comfyui, lora`) afinado a partir de WAN2.1 y que su proposito es la aceleracion. Esto implica que los pesos son una matriz de bajo rango que se suma a las capas del modelo base durante la inferencia; el backbone (transformers de difusion sobre latentes de video, con atencion espacio-temporal) pertenece integramente a WAN2.1 y no se distribuye en este repositorio.

No se especifican el numero de tokens o fotogramas usados en el ajuste, la composicion del dataset, si hubo destilacion por pasos, ni si se emplearon tecnicas de RLHF/DPO (inhabituales en este tipo de adaptadores). Tampoco se detalla el rango (rank), el alpha, los modulos objetivo (attention, MLP) ni la precision de los pesos. La afirmacion "acceleracion" sugiere una reduccion del numero de pasos de muestreo respecto al modelo base, pero no hay cifras publicadas que lo cuantifiquen.

## Capacidades

- Generacion y transformacion de video mediante difusion, heredadas del modelo base WAN2.1 sobre el que se carga el LoRA.
- Aceleracion declarada de la inferencia (reduccion del coste de muestreo), segun la descripcion del autor.
- Integracion como nodo LoRA en flujos de trabajo de ComfyUI.
- Posibilidad de uso a traves de la plataforma y la API de RunningHub.
- No se documenta soporte de tool calling ni de function calling.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades multilingues (no aplica a un modelo de generacion de video).
- No se documentan modos especiales (thinking, audio, vision) mas alla de la generacion de video del modelo base.

## Casos de uso

- Generacion de video en ComfyUI con menos pasos de muestreo: el adaptador se carga sobre WAN2.1 en un flujo de nodos y se usa para producir clips con un presupuesto de computo menor, lo que resulta util cuando el tiempo de render es el cuello de botella.
- Iteracion rapida en preproduccion audiovisual: permite generar bocetos de planos y variaciones de escena con una latencia reducida antes de comprometer recursos a una renderizacion final de mayor calidad.
- Prototipado de pipelines de video en equipos con GPU limitada: al abaratar la inferencia, hace viable probar flujos completos en hardware de gama media donde el modelo base sin acelerar resultaria impracticable.
- Produccion de contenido para redes sociales: clips cortos generados a partir de texto o imagen en lotes, donde el ahorro por inferencia se multiplica al repetir el proceso muchas veces.
- Servicios de generacion de video bajo demanda: al desplegarse sobre la API de RunningHub, el adaptador puede integrarse en un backend que atienda peticiones de usuarios y devuelva el video generado.
- Evaluacion comparativa de adaptadores de aceleracion: sirve como candidato a medir frente a otras alternativas de aceleracion para WAN2.1 en terminos de calidad visual por paso y de tiempo por clip.
- Investigacion sobre destilacion y LoRA en modelos de difusion de video: el fichero es util para estudiar como un adaptador de bajo rango modifica el comportamiento de muestreo del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (FVD, CLIP score, VBench u otras), ni curvas de calidad frente al numero de pasos, ni comparaciones de tiempo por clip con el modelo base sin acelerar.

## Requisitos de hardware

- VRAM para el adaptador: el fichero LoRA ocupa 601 MiB en disco; su huella en VRAM es pequena en comparacion con el modelo base.
- VRAM total: gobernada por la variante del modelo base WAN2.1 que se cargue, no por el LoRA. No se especifica en la informacion proporcionada que variante (1.3B, 14B u otra) es la destinataria del adaptador.
- GPU recomendadas: no disponible en la informacion proporcionada; dependera del modelo base y de la resolucion y duracion del video objetivo.
- Viabilidad en GPU de consumo: no confirmada. Depende enteramente de la variante del modelo base, la precision de carga, el uso de offload a CPU y la resolucion del clip.
- Opciones de despliegue: ComfyUI (plataforma declarada), RunningHub y su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card afirma que es un modelo de aceleracion, pero no publica cifras de pasos, segundos por clip ni comparativas.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. El adaptador pertenece a la categoria de LoRA de aceleracion para WAN2.1, un ecosistema en el que existen otras propuestas de destilacion y de reduccion de pasos, pero la model card no ofrece parametros, contexto, rendimiento ni licencia que permitan una comparacion con cifras.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-scail2-lora | no disponible (LoRA, 601 MiB) | no aplica | no disponible | no disponible (remite al upstream) | Hugging Face, RunningHub |
| Alternativas de aceleracion para WAN2.1 | no disponible | no aplica | no disponible | no disponible | no disponible |
| WAN2.1 (modelo base) | no disponible en esta ficha | no aplica | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

## Limitaciones y advertencias

- Informacion muy incompleta: no hay pipeline declarado, ni licencia explicita, ni idiomas, ni datos de entrenamiento, ni benchmarks. Cualquier uso en produccion exige validacion propia.
- Riesgo de sobreajuste o de artefactos: al ser un adaptador de aceleracion, puede degradar la calidad visual o la coherencia temporal respecto al modelo base sin acelerar; no se han publicado mediciones que lo descarten.
- Dependencia estricta del modelo base: el LoRA no funciona de forma autonoma y debe corresponder a la variante de WAN2.1 para la que fue entrenado. Cargarlo sobre otra variante puede producir resultados invalidos.
- Licencia: la model card no fija una licencia propia y remite a la del proyecto original (WAN2.1). Antes de un uso comercial es imprescindible comprobar los terminos del upstream y del autor.
- Reputacion del repositorio: cero descargas y cero "likes" en el momento de la consulta, sin documentacion adicional ni ejemplos de uso. Es un artefacto sin validacion por parte de la comunidad.
- Ausencia de garantias de soporte: no se documentan versiones, changelog ni mantenimiento. Las fechas de creacion y actualizacion son el mismo dia.
- Nomenclatura no aclarada: el termino "scail2" no se define en la model card, por lo que se desconoce a que flujo o pipeline concreto se refiere.
- Sin informacion sobre sesgos: no se documenta ningun analisis de sesgos ni de contenido generado inapropiado. Aplica el riesgo propio de los modelos de generacion de video del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-scail2-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2068541284129787906
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1819214514410942465
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- No se han proporcionado otros enlaces (papers, repositorios o demos) en la informacion disponible.
