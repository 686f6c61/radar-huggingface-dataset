# RunningHubAI/rh-goohai-lora

## Resumen

rh-goohai-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI en Hugging Face. El modelo se distribuye como un unico archivo de pesos en formato safetensors de 304 MiB y esta pensado para cargarse sobre el modelo base qwen-image-2.1, segun indica la model card. Su nombre de archivo interno, `Qwen2.1_换脸换头(2合1)_GH_v1.0.safetensors`, sugiere que el adaptador esta orientado a tareas de intercambio de cara y cabeza ("换脸换头" en chino, "2 en 1"), aunque esta informacion no se detalla en la documentacion publica.

El modelo se enmarca en el ecosistema ComfyUI y en la plataforma RunningHub, que actua como servicio de entrenamiento y despliegue. No se trata de un modelo de lenguaje ni de un modelo fundacional completo, sino de un ajuste fino ligero que modifica el comportamiento de un generador de imagenes ya existente. La model card es muy escasa: no incluye descripcion tecnica, datos de entrenamiento, benchmarks ni ejemplos de uso mas alla de los enlaces a la plataforma.

La relevancia de esta ficha es limitada por la falta de informacion verificable. Se trata de un artefacto practico para usuarios de ComfyUI y RunningHub, pero no de un modelo con documentacion suficiente para evaluaciones rigurosas. Cualquier dato no presente en la model card se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base qwen-image-2.1 (arquitectura del base no disponible) |
| Parametros totales | no disponible (pesos LoRA de 304 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card remite a la licencia del proyecto original) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que el adaptador esta ajustado a partir de qwen-image-2.1, pero no aporta detalles sobre la arquitectura del modelo base, el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El unico dato concreto es el tamano del archivo de pesos: 304 MiB, coherente con un adaptador LoRA de rango bajo sobre un modelo de difusion o de imagen de tamano medio-grande.

El nombre del archivo (`Qwen2.1_换脸换头(2合1)_GH_v1.0.safetensors`) apunta a un caso de uso especifico de intercambio facial y de cabeza, pero no se documenta ni el procedimiento de entrenamiento ni las tecnicas de regularizacion o de preservacion de identidad empleadas. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o metodos de destilacion.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) mediante el modelo base qwen-image-2.1.
- Modificacion de identidad facial y de cabeza, segun sugiere el nombre del archivo de pesos.
- Integracion con ComfyUI como nodo LoRA.
- Carga en la plataforma RunningHub y en Hugging Face.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Intercambio de rostro en retratos generados: el adaptador permitiria sustituir la cara de un sujeto sintetico por otra identidad dentro de un flujo de ComfyUI, util para pruebas de personajes o previsualizacion de casting.
- Prototipado de personajes consistentes: combinado con el modelo base qwen-image-2.1, podria emplearse para mantener una misma identidad facial a lo largo de varias generaciones en un pipeline de ilustracion.
- Edicion de retratos en produccion de contenido: su uso en ComfyUI facilitaria flujos de posproduccion de imagenes de marca o editoriales, siempre que se respeten los derechos de imagen.
- Experimentacion en investigacion de deepfakes y deteccion: util como artefacto de referencia para estudiar tecnicas de manipulacion facial y entrenar detectores, dado su caracter de LoRA ligero.
- Pruebas de concepto en RunningHub: la plataforma permite cargar el modelo y ejecutarlo sin infraestructura propia, lo que simplifica demos y validaciones rapidas.
- Integracion en pipelines de generacion por lotes: al ser un LoRA de 304 MiB, puede cargarse y descargarse con bajo coste de memoria en comparacion con un modelo completo, lo que facilita su uso en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base qwen-image-2.1, no documentado en la ficha.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible; el LoRA en si ocupa 304 MiB, pero el modelo base condiciona el requisito real.
- Opciones de despliegue: ComfyUI, plataforma RunningHub y carga en Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este LoRA de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe el dataset, el procedimiento de entrenamiento ni las metricas de calidad.
- Licencia no disponible: la model card remite a la licencia del proyecto original, lo que genera incertidumbre sobre el uso comercial.
- Riesgo de uso indebido: un adaptador orientado al intercambio de caras y cabezas puede emplearse para suplantacion de identidad o desinformacion; es necesario verificar consentimiento y cumplimiento legal (RGPD, derechos de imagen).
- Dependencia del modelo base: su comportamiento y calidad dependen de qwen-image-2.1, cuyas caracteristicas no se detallan.
- Sin datos sobre sesgos, alucinacion o limitaciones de idioma, al no ser un modelo de lenguaje.
- Sin garantias de soporte: el autor publica a traves de RunningHub y no se indica mantenimiento ni versionado posterior.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que impide validar su adopcion por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-goohai-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2123993797767208962
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2062739875576500225
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
