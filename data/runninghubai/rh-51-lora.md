# RunningHubAI/rh-51-lora

## Resumen

rh-51-lora es un adaptador LoRA para edicion de imagen (pipeline image-text-to-image) publicado por RunningHubAI en Hugging Face. No es un modelo de lenguaje ni un modelo fundacional: se trata de un peso de ajuste fino de aproximadamente 448 MiB que se carga sobre un modelo base identificado en la model card como `krea2`, presumiblemente un modelo de difusion para generacion y edicion de imagenes. Su funcion es introducir un concepto visual concreto mediante una palabra de activacion (`cepai`) y una prompt obligatoria.

El repositorio tiene un tamano de 0,5 GB, cero descargas y cero likes en el momento de la consulta, y fue creado el 5 de noviembre de 2026. La model card remite a un modelo original alojado en Civitai y a la plataforma RunningHub, donde se puede ejecutar online. El autor del ajuste figura como "RunningHub-@氛围感" y la publicacion se realiza en nombre del autor, que conserva los derechos.

La relevancia tecnica de esta ficha es limitada en el ambito de IA generativa de texto: no hay informacion sobre arquitectura del modelo base, numero de parametros, contexto, idiomas ni benchmarks. Lo que si es evaluable es su naturaleza de LoRA de edicion de imagen, su flujo de uso en ComfyUI y sus restricciones de prompt y licencia, que se detallan a continuacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base `krea2`; arquitectura del base no disponible |
| Parametros totales | no disponible (peso del adaptador: 448 MiB en `krea2_cepai_lora.safetensors`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica / no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (la prompt de ejemplo esta en ingles) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y que se siga la licencia del proyecto original o upstream |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,5 GB |
| Pipeline declarado | image-text-to-image |
| Plataformas de ejecucion | ComfyUI, RunningHub, Hugging Face |
| Peso recomendado del LoRA | aproximadamente 1,4 |
| Palabra de activacion | `cepai` |
| Resolucion recomendada | 1280x720 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base `krea2` ni sobre el proceso de entrenamiento del adaptador: no se indica numero de imagenes, pasos, learning rate, composicion del dataset ni si hubo tecnicas de regularizacion o captions automaticos. Lo unico documentado es que se trata de un LoRA de edicion de imagen afinado desde `krea2`, con un unico archivo de pesos de 448 MiB y una palabra de activacion asociada.

La model card impone una prompt obligatoria que debe acompanar a la palabra de activacion; segun el autor, si no se incluye, el resultado no contiene el elemento central descrito y la escena se genera de forma incorrecta. Esta dependencia estricta de la prompt sugiere un entrenamiento muy especifico de concepto, con baja generalizacion fuera del caso previsto. No hay informacion sobre innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.) porque el objeto publicado es un adaptador, no un modelo completo.

## Capacidades

- Edicion y generacion de imagen condicionada por texto sobre el modelo base `krea2`, mediante el pipeline image-text-to-image.
- Activacion de un concepto visual concreto mediante la palabra clave `cepai`.
- Reproduccion de una escena especifica cuando se usa la prompt obligatoria documentada por el autor.
- Integracion en flujos de ComfyUI como nodo de carga de LoRA.
- Ejecucion en la plataforma RunningHub, tanto en su version internacional como en la china, con acceso via API.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision comprensiva, tool calling, agentes, modo thinking, audio ni multilinguismo.

## Casos de uso

- Prototipado de escenas de interior en ComfyUI: cargando `krea2_cepai_lora.safetensors` con peso ~1,4 y la prompt obligatoria, se obtienen variaciones de una escena de bano concreta a 1280x720; util para estudiar como un LoRA de bajo rango condiciona la composicion del modelo base.
- Evaluacion de adaptadores LoRA para investigacion: el repositorio sirve como caso de estudio de un LoRA de concepto unico con dependencia fuerte de prompt, util para medir sensibilidad a la prompt y al peso del adaptador.
- Pruebas de pipeline image-text-to-image en RunningHub: permite validar el flujo de carga de LoRA y la API de la plataforma sin infraestructura propia, ya que el modelo se ejecuta online.
- Generacion de imagenes de referencia para direccion de arte: el ajuste de resolucion a 1280x720 y la estetica de camara oculta documentada permiten producir material de referencia para discutir encuadre y perspectiva.
- Docencia sobre difusion y LoRA: sirve para explicar la diferencia entre un modelo base y un adaptador, el papel de las palabras de activacion y el efecto de omitir la prompt obligatoria.
- Automatizacion por API en flujos de generacion por lotes: mediante la API de RunningHub se pueden lanzar generaciones con la prompt fija y variar solo la semilla, util para comparativas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud perceptual) ni comparaciones cuantitativas con otros LoRA o con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende enteramente del modelo base `krea2`, cuyas especificaciones no se documentan.
- El archivo de pesos ocupa 448 MiB, por lo que el almacenamiento adicional del LoRA es minimo frente al modelo base.
- GPU recomendadas: no disponibles. Al ser un LoRA de difusion, es previsible que requiera una GPU con VRAM suficiente para el modelo base completo, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base y de la resolucion de 1280x720 recomendada.
- Opciones de despliegue: ComfyUI (carga de LoRA), plataforma RunningHub (online y via API) y Hugging Face como repositorio de pesos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA comparables ni datos del modelo base `krea2` que permitan establecer una comparacion con parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Dependencia estricta de la prompt obligatoria: segun el autor, sin la prompt documentada no aparece el elemento central de la escena y el resultado es incorrecto.
- Concepto muy especifico y de nicho: el LoRA esta entrenado para una unica escena y no se documenta generalizacion a otros contextos.
- Contenido sensible: la escena descrita en la model card (bano, camara oculta, fluidos corporales) puede resultar inapropiada o no cumplir las politicas de uso de plataformas y de entornos profesionales; conviene revisar las condiciones de uso antes de desplegarlo.
- Licencia no disponible: la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original o upstream, sin especificarla. No se puede confirmar el uso comercial.
- Ausencia total de datos tecnicos: no hay informacion sobre arquitectura del base, parametros, dataset de entrenamiento ni evaluacion, lo que impide auditar sesgos o calidad.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar detalles anatomicos o de perspectiva incoherentes, especialmente fuera de la resolucion recomendada.
- Idiomas: no se documenta soporte multilingue; la prompt de ejemplo esta en ingles y no hay evidencia de que funcione igual en castellano.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RunningHubAI/rh-51-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2096759531689861122
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Modelo original en Civitai: https://civitai.red/models/2919523/toilet-hidden-camera-LoRA?modelVersionId=3303124
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-51-lora/blob/main/README_cn.md
