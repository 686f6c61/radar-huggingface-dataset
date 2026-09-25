# RunningHubAI/rh-camila-ribeiro-body-lora-krea2-lora

## Resumen

`rh-camila-ribeiro-body-lora-krea2-lora` es un adaptador LoRA de imagen publicado por RunningHubAI en nombre del autor identificado como @JS Digital. No se trata de un modelo de lenguaje ni de un modelo base completo, sino de un fichero de pesos de bajo rango (448 MiB, `cmr01body-000008.safetensors`) que se aplica sobre el modelo de imagen KREA 2 para reproducir un cuerpo y una apariencia concretos. El pipeline declarado en HuggingFace es `image-text-to-image`, y la integración prevista es ComfyUI, la propia plataforma RunningHub o Hugging Face.

El modelo resuelve un problema muy específico: mantener la consistencia de identidad visual (cuerpo, proporciones, aspecto) de un personaje a lo largo de múltiples generaciones, en lugar de obtener variaciones aleatorias en cada prompt. Este tipo de adaptadores se usa habitualmente para series de imágenes coherentes con el mismo personaje, algo difícil de conseguir solo con prompt engineering sobre un modelo base.

La información publicada es mínima: la model card no documenta el dataset de entrenamiento, los hiperparámetros, la licencia explícita ni los idiomas soportados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con un tamaño total de 0,5 GB y fechas de creación y actualización del 24 de septiembre de 2026. Es relevante ahora por el auge de los flujos ComfyUI con LoRA de personaje, pero conviene tratarlo como un artefacto opaco desde el punto de vista de documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion de imagen; el modelo base declarado es krea2 |
| Parametros totales | no disponible (adaptador LoRA; fichero de pesos de 448 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada por prompt de texto e imagen) |
| Tipos de cuantizacion | no disponible para el adaptador; fuentes externas citan cuantizacion GGUF Q6_K para el modelo base Krea 2 Turbo |
| Idiomas soportados | no disponible (el texto de los prompts depende del codificador de texto del modelo base) |
| Licencia | no disponible; la model card indica que se siga la licencia del proyecto original o upstream |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA de edicion de imagen (image edit) |
| Tamano del fichero | 448 MiB (`cmr01body-000008.safetensors`) |
| Tamano del repositorio | 0,5 GB |
| Pipeline declarado | image-text-to-image |
| Plataformas previstas | ComfyUI, RunningHub, Hugging Face |
| Autor | RunningHubAI, en nombre de @JS Digital |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para desplazar su comportamiento sin reentrenarlo por completo. El modelo base declarado es `krea2`, referenciado en la model card como "Finetuned from: krea2". Fuentes externas de la busqueda web (un video divulgativo sobre Krea 2 Turbo) describen ese modelo base como un modelo de imagen de aproximadamente 12.000 millones de parametros que puede ejecutarse en una sola RTX 4090 de 24 GB con cuantizacion Q6_K GGUF y controladores de ComfyUI; estos datos corresponden al modelo base, no al LoRA, y no estan confirmados por la model card.

No hay informacion publicada sobre el dataset de entrenamiento: no se indica el numero de imagenes, la resolucion, la composicion del dataset, si hubo filtrado, si se aplicaron tecnicas de regularizacion o si se uso algun tipo de ajuste por preferencias. Tampoco se documentan hiperparametros (rango, alpha, learning rate, pasos, optimizador) ni la metodologia de captura del concepto "body". El nombre del fichero (`cmr01body-000008.safetensors`) sugiere un checkpoint intermedio de un entrenamiento por pasos, pero es una inferencia, no un dato confirmado.

## Capacidades

- Generacion de imagenes condicionada por texto e imagen de entrada (pipeline `image-text-to-image`).
- Transferencia de identidad corporal y apariencia concreta sobre el modelo base Krea 2.
- Integracion en flujos ComfyUI mediante carga de LoRA y combinacion con nodos habituales (ControlNet, IPAdapter, muestreadores).
- Edicion de imagen: al ser un LoRA de edicion, puede aplicarse sobre una imagen existente y regenerarla parcialmente.
- Ejecucion en la nube mediante la plataforma y la API de RunningHub, o en local si se dispone del modelo base.
- Consistencia de personaje entre generaciones dentro de una misma sesion, siempre que el prompt y la semilla se mantengan estables.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible; depende del codificador de texto del modelo base.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Series editoriales de moda: aplicar el LoRA sobre Krea 2 para generar un mismo personaje en distintas poses, prendas y localizaciones, manteniendo proporciones y aspecto entre imagenes de una campana.
- Previsualizacion de vestuario: generar variaciones de una misma figura con cambios de ropa para validar diseno antes de producir fisicamente, reduciendo el coste de sesiones de fotografia de muestrario.
- Storyboards e ilustracion secuencial: producir paneles con un personaje consistente para comics, animaticos o presentaciones de proyectos audiovisuales.
- Prototipado de personajes para videojuegos o animacion: generar hojas de personaje y variaciones de vestuario a partir de una referencia unica.
- Contenido para redes sociales con identidad visual estable: crear imagenes coherentes en lote donde el personaje se reconoce entre publicaciones (sujeto a autorizacion del titular de la imagen).
- Edicion y retoque de imagen existente: usar el pipeline image-text-to-image para modificar una fotografia o render conservando el cuerpo y la apariencia del personaje.
- Automatizacion por lotes en la nube: combinar el LoRA con la API de RunningHub para generar cientos de variaciones sin infraestructura propia, util en pruebas A/B de creatividades.
- Integracion en pipelines ComfyUI con ControlNet: fijar la pose mediante mapas de control y usar el LoRA solo para la identidad, lo que da control fino sobre composicion y encuadre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad, LPIPS) ni comparaciones cuantitativas con otros adaptadores. Tampoco se documentan tiempos de inferencia ni throughput para el LoRA o para su combinacion con Krea 2.

## Requisitos de hardware

- VRAM para el adaptador: el fichero LoRA ocupa 448 MiB en disco; su carga en memoria es marginal frente al modelo base.
- VRAM para inferencia: depende enteramente del modelo base Krea 2. Fuentes externas indican que Krea 2 Turbo, con unos 12.000 millones de parametros, puede ejecutarse en una RTX 4090 de 24 GB con cuantizacion Q6_K GGUF. En precision completa (fp16) las necesidades serian notablemente mayores; no hay cifra oficial publicada.
- GPU recomendadas: no disponible de forma oficial. Como referencia externa, una RTX 4090 de 24 GB aparece citada como suficiente para el modelo base cuantizado.
- Compatibilidad con GPU de consumo: probable con cuantizacion del modelo base, segun la referencia externa citada; no confirmado por el autor del LoRA.
- Opciones de despliegue: ComfyUI (integracion declarada en los tags), plataforma RunningHub y su API. Otros runners compatibles con safetensors y modelos Krea 2 no estan documentados en la ficha.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-camila-ribeiro-body-lora-krea2-lora | LoRA de imagen sobre Krea 2 | no aplica (448 MiB) | no aplica | no disponible | HuggingFace, RunningHub |
| RunningHubAI/rh-2101354719968059394-lora | LoRA de imagen | no disponible | no aplica | no disponible | HuggingFace |
| Camila (RunningHub, id 1936071582429384705) | LoRA de personaje | no disponible | no aplica | no disponible | RunningHub |

Los tres artefactos pertenecen a la misma familia funcional (LoRA de personaje publicados en el ecosistema RunningHub) y comparten la misma ausencia de documentacion tecnica publica, por lo que no es posible establecer una comparacion cuantitativa de rendimiento, contexto o licencia con datos verificables. Comparativas con adaptadores de otros repositorios (Civitai, etc.) no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: sin dataset, hiperparametros, metricas ni evaluacion cualitativa publicada.
- Licencia no explicita. La model card se limita a indicar que se siga la licencia del proyecto original o upstream, lo que deja el uso comercial en una situacion juridica ambigua y depende de la licencia de Krea 2.
- El modelo reproduce la apariencia de una persona concreta ("Camila Ribeiro"). No se documenta consentimiento, cesion de imagen ni derechos de publicidad, por lo que su uso para generar imagenes de una persona real puede infringir derechos de imagen segun la jurisdiccion.
- Riesgo elevado de uso indebido en deepfakes o contenido intimo no consentido; se recomienda verificar autorizacion explicita antes de cualquier publicacion.
- Riesgo de sobreajuste al dataset de entrenamiento: los LoRA de identidad tienden a degradar la diversidad de poses, fondos e iluminacion y pueden arrastrar artefactos del material de origen.
- Sesgos: no disponibles. Al no publicarse la composicion del dataset, no puede evaluarse el sesgo de representacion corporal, etnico o de genero.
- Limitaciones de idioma: no disponibles; la calidad del prompt depende del codificador de texto del modelo base Krea 2.
- El repositorio registra 0 descargas y 0 likes, sin comunidad que haya validado su comportamiento en produccion.
- Las fechas de creacion y actualizacion indicadas (24 de septiembre de 2026) y la ausencia de historial de versiones dificultan evaluar su mantenimiento.
- No hay garantia de compatibilidad con versiones futuras del modelo base ni con otros runners distintos de ComfyUI y RunningHub.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-camila-ribeiro-body-lora-krea2-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2094660337908240386
- Pagina del autor (@JS Digital): https://www.runninghub.ai/user-center/2088738888062898177
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Referencia externa sobre Krea 2 Turbo en RTX 4090 (video): https://www.youtube.com/watch?v=ei97_pgrfYo
- LoRA relacionado en HuggingFace: https://huggingface.co/RunningHubAI/rh-2101354719968059394-lora
- LoRA "Camila" en RunningHub: https://www.runninghub.ai/model/public/1936071582429384705
