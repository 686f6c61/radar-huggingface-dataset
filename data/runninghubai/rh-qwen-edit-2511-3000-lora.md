# RunningHubAI/rh-qwen-edit-2511-3000-lora

## Resumen

`rh-qwen-edit-2511-3000-lora` es un adaptador LoRA de edicion de imagen publicado por RunningHubAI (RunningHub) para ComfyUI. No es un modelo de lenguaje ni un modelo de difusion completo: es un conjunto de pesos de bajo rango (un unico fichero `safetensors` de 225 MiB) que se aplica sobre el modelo base **Qwen-Edit-2511**, segun declara el autor en la model card. El pipeline declarado en HuggingFace es `image-text-to-image`, es decir, edicion de una imagen de entrada guiada por una instruccion de texto.

El adaptador esta especializado en un dominio muy concreto: retoque de fotografias de habitaciones de hotel con acabado "premium" (en chino, 客房精修（高级感）). El prompt descriptivo que aparece en la model card apunta a interiores luminosos, estilo moderno y minimalista, ausencia de dominantes de color, camas y colchas sin arrugas y aspecto de fotografia real de ficha de OTA (Online Travel Agency). El nombre del fichero incluye "魔搭-3000", que sugiere un entrenamiento realizado en ModelScope con 3000 pasos, aunque el autor no documenta la configuracion.

La relevancia practica es acotada pero clara: quien ya trabaje con Qwen-Image-Edit en ComfyUI puede incorporar este LoRA para estandarizar el retoque de fotografia hotelera sin reentrenar. El repositorio, sin embargo, es practicamente una ficha de publicacion: cero descargas, cero likes, sin licencia explicita, sin idiomas declarados y sin ningun dato de arquitectura, entrenamiento o evaluacion mas alla del nombre del modelo base. Cualquier cifra que no aparezca aqui debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Qwen-Edit-2511; la arquitectura del modelo base no se detalla en la informacion disponible |
| Parametros totales | no disponible (el adaptador ocupa 225 MiB en safetensors; el autor no declara numero de parametros ni rango del LoRA) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; en la practica dependera de la cuantizacion aplicada al modelo base en ComfyUI |
| Idiomas soportados | no disponibles; la model card esta en chino e ingles y el prompt de referencia esta en chino |
| Licencia | no disponible ("follow the original project or upstream license"; el copyright permanece en el autor) |
| Formato de pesos | safetensors (fichero unico `Qwen Edit 2511-客房精修（高级感）-魔搭-3000.safetensors`, 225 MiB) |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | image-text-to-image |
| Plataformas de uso | ComfyUI, RunningHub, Hugging Face |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El unico dato tecnico verificable es que se trata de un LoRA, es decir, una descomposicion de bajo rango que se inyecta en las capas del modelo base para modificar su comportamiento sin reentrenarlo por completo. El modelo base declarado es **Qwen-Edit-2511**, integrante de la familia Qwen-Image-Edit. El repositorio no especifica sobre que subconjunto de modulos se aplica el adaptador (attention, MLP, capas de texto o de imagen), ni el rango, ni el alpha, ni la resolución de entrenamiento. Tampoco indica si el adaptador incluye pesos de text encoder o solo del denoiser.

Respecto a los datos de entrenamiento, no se publica numero de imagenes, numero de tokens, composicion del dataset ni si hubo etapas de preferencia (RLHF/DPO), algo por otra parte poco habitual en LoRAs de difusion. El unico indicio es el sufijo "3000" del nombre del fichero, compatible con 3000 pasos de entrenamiento, y la mencion "魔搭" (ModelScope), que apunta a la plataforma donde se habria realizado el entrenamiento o publicado el modelo original. RunningHub ofrece servicio de entrenamiento en su plataforma, pero no se aporta ningun detalle del proceso seguido para este adaptador.

## Capacidades

- Edicion de imagen condicionada por texto e imagen (`image-text-to-image`): recibe una fotografia y una instruccion y devuelve una version editada.
- Retoque fotografico orientado a fotografia de interiores de hotel: limpieza de la escena, iluminacion uniforme y ausencia de dominantes de color.
- Eliminacion o suavizado de arrugas en ropa de cama y colcha ("sin arrugas" en el prompt de referencia).
- Refuerzo de percepcion de calidad ("高级质感", textura premium) y de estilo moderno minimalista.
- Adecuacion al aspecto de "fotografia real de OTA", es decir, imagenes listas para ficha de reserva.
- Integracion en flujos de ComfyUI mediante el nodo de carga de LoRA sobre el modelo base Qwen-Edit-2511.
- Uso via API o interfaz web de RunningHub.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision comprensiva, audio ni modo "thinking": no es un modelo de lenguaje y el autor no declara ninguna de estas capacidades.
- Cobertura multilingue de instrucciones: no disponible.

## Casos de uso

- Estandarizacion de fotografia de fichas de OTA: aplicar el LoRA a las fotos de habitaciones de un hotel para homogeneizar luminosidad, temperatura de color y orden visual antes de subirlas a Booking, Expedia o portales nacionales, reduciendo el trabajo manual de retoque por imagen.
- Produccion por lotes en ComfyUI: encadenar el nodo de carga del LoRA con un pipeline de edicion sobre cientos de imagenes, ya que el adaptador anade solo 225 MiB y no requiere duplicar el modelo base en VRAM.
- Correccion de fotos tomadas por el personal del hotel con movil: el adaptador esta orientado a convertir capturas imperfectas en imagenes con aspecto profesional, sin sesion de fotografo.
- Limpieza de ropa de cama en reportajes de habitaciones: eliminacion de arrugas y pliegues en sabanas y colchas, uno de los defectos mas frecuentes y mas penalizados en fotografia de hospitality.
- Marketing turistico y presentaciones comerciales: generacion de variantes de una misma habitacion manteniendo el estilo visual de la marca del establecimiento.
- Retoque editorial de interiores afines: aunque el entrenamiento se centra en habitaciones de hotel, el estilo "interior moderno, luminoso, sin dominantes" puede reutilizarse en fotografia de vivienda vacacional o de alquiler turistico, con verificacion previa de resultados.
- Pruebas de concepto de edicion de imagen en castellano: usar el LoRA para evaluar el comportamiento de Qwen-Edit-2511 en un dominio controlado antes de invertir en un fine-tuning propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,22 GB (225 MiB) en `safetensors`; el coste real de inferencia lo determina casi por completo el modelo base Qwen-Edit-2511.
- VRAM total: no disponible. El repositorio no documenta requisitos del modelo base ni la precision recomendada; cualquier cifra concreta debe consultarse en la ficha de Qwen-Edit-2511 y no en este repositorio.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no verificable con los datos del repositorio; depende del modelo base y de si se carga en precision reducida.
- Despliegue: ComfyUI es la via declarada por el autor (tag `comfyui` y fichero `safetensors` compatible). Tambien se ofrece uso online en RunningHub y mediante su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en cualquier caso no aplican a un LoRA de difusion.
- Latencia y throughput: no disponibles; no se aportan tiempos por imagen ni configuracion de muestreo.
- Almacenamiento: 0,2 GB para el repositorio, mas el espacio del modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen-edit-2511-3000-lora | LoRA de edicion de imagen sobre Qwen-Edit-2511 | no disponible (adaptador de 225 MiB) | no disponible | no disponible | HuggingFace y RunningHub; 0 descargas |
| Qwen-Edit-2511 (modelo base) | Modelo de edicion de imagen texto+imagen | no disponible en este repositorio | no disponible | no disponible aqui (regida por el proyecto original) | No distribuido en este repositorio |
| Otros LoRA de retoque de interiores para la familia Qwen-Image-Edit | LoRA de edicion de imagen | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de comparativas publicadas por el autor que permitan situar este adaptador frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia no definida: la model card remite a "the original project or upstream license" y mantiene el copyright en el autor. Antes de un uso comercial (por ejemplo, retoque de fotos para un cliente hotelero) hay que verificar la licencia de Qwen-Edit-2511 y contactar con el autor, ya que no hay permiso explicito concedido.
- Dominio muy estrecho: el adaptador esta entrenado para habitaciones de hotel con estetica concreta; su uso en otros tipos de imagen (retrato, producto, exterior) puede degradar el resultado o introducir un sesgo estilistico no deseado.
- Riesgo de alucinacion visual: como cualquier modelo de difusion para edicion, puede alterar elementos no solicitados de la escena (muebles, texturas, geometria de la habitacion) o inventar detalles, algo critico si la imagen se usa con fines comerciales o contractuales.
- Ausencia total de evaluacion: no hay benchmarks, ni ejemplos comparativos antes/despues, ni metricas de fidelidad (por ejemplo, preservacion de identidad de la estancia). Imposible estimar calidad objetiva antes de probar.
- Documentacion insuficiente: no se indica rango del LoRA, peso recomendado, triggers, resolucion de entrenamiento ni parametros de muestreo; el autor solo aporta el prompt descriptivo en chino, lo que sugiere que las instrucciones en chino funcionan mejor que en otros idiomas.
- Idioma: la model card no declara idiomas soportados y el unico texto de referencia esta en chino; el comportamiento con prompts en castellano no esta verificado.
- Dependencia del modelo base: el adaptador no es autonomo; sin Qwen-Edit-2511 cargado en ComfyUI no es utilizable, y cambios de version del modelo base pueden romper la compatibilidad de los pesos.
- Senales de adopcion nulas: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica que permitan contrastar experiencias.
- Anomalia en metadatos: la fecha de creacion indicada en HuggingFace (2026-10-23) es posterior a la que cabria esperar por la nomenclatura "2511" del modelo base; conviene verificar la procedencia y el contenido del fichero antes de integrarlo en produccion.
- Sin garantias de mantenimiento: el repositorio lo publica RunningHub en nombre del autor, sin compromiso de soporte ni de actualizaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RunningHubAI/rh-qwen-edit-2511-3000-lora
- README en chino (referenciado en la model card): https://huggingface.co/RunningHubAI/rh-qwen-edit-2511-3000-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2097366126425632769
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1940316173533593601
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
