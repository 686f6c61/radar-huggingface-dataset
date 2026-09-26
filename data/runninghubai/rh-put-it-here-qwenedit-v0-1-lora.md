# RunningHubAI/rh-put-it-here-qwenedit-v0.1-lora

## Resumen

rh-put-it-here-qwenedit-v0.1-lora es un adaptador LoRA (Low-Rank Adaptation) de edición de imagen publicado por RunningHubAI, la cuenta oficial de la plataforma RunningHub, y atribuido al usuario @Futurlunatic. No es un modelo generativo completo: es un ajuste fino de bajo rango pensado para cargarse sobre el modelo base Qwen-Image-Edit dentro de ComfyUI, RunningHub o Hugging Face. Su propósito declarado es mantener la coherencia visual en modificaciones de imagen, conservar la iluminación y las sombras del original, eliminar el aspecto "grasiento" (piel o superficies con brillo excesivo) y reforzar la intensidad de todas las funciones del modelo base.

El repositorio contiene un único archivo de pesos, `put it here_QwenEdit_V0.1.safetensors`, de 450 MiB, lo que confirma que se trata de un adaptador y no de pesos completos. El autor indica que la palabra de activación es "Put it here" (en inglés) o "保持画风光影不变" (en chino), y señala explícitamente que el resultado es mejor cuando se usa el disparador en chino. La ficha del repositorio no documenta el número de parámetros del adaptador, la longitud de contexto, los idiomas soportados ni la licencia aplicable.

La relevancia de esta publicación es práctica más que arquitectónica: amplía la familia Qwen-Image-Edit con un caso de uso muy concreto (edición con preservación de luz y sombras y retoque de texturas), y se distribuye tanto en Hugging Face como a través de la infraestructura en la nube de RunningHub, con API de pago asociada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base Qwen-Image-Edit (el repositorio no detalla la arquitectura del base) |
| Parametros totales | no disponible (el archivo de pesos del adaptador ocupa 450 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de difusion para imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el autor indica que las palabras de activacion funcionan mejor en chino que en ingles) |
| Licencia | no disponible; el autor conserva el copyright y remite a la licencia del proyecto original |
| Formato de pesos | safetensors |
| Tarea declarada | text-to-image (edicion de imagen) |
| Modelo base | Qwen-Image-Edit |
| Tamano del repositorio | 0.5 GB |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Descargas / likes en Hugging Face | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no proporciona informacion sobre la arquitectura interna del adaptador ni sobre el proceso de entrenamiento. Por la naturaleza del artefacto (un LoRA de 450 MiB en safetensors que se carga sobre Qwen-Image-Edit), se trata de matrices de bajo rango que modifican las capas del modelo base de difusion, no de un transformer entrenado desde cero. No se documentan el numero de pasos de entrenamiento, el dataset utilizado, la composicion de las imagenes de entrenamiento, ni si se emplearon tecnicas de alineacion como RLHF o DPO. No se menciona ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

La unica informacion funcional que aporta el autor es cualitativa: el ajuste esta orientado a preservar la coherencia entre la imagen original y la editada, mantener la iluminacion y las sombras, eliminar el exceso de brillo o "grasa" en texturas y piel, y aumentar la intensidad de las funciones del modelo base. El autor agradece imagenes de retroalimentacion y pruebas a los usuarios wallen, zero, jiong y yunor, lo que sugiere un ciclo de iteracion con la comunidad, pero sin publicar metricas.

## Capacidades

- Edicion de imagen guiada por instrucciones sobre el modelo Qwen-Image-Edit.
- Preservacion de la coherencia visual entre la imagen de entrada y la de salida.
- Mantenimiento de la iluminacion y las sombras originales (segun la descripcion del autor).
- Reduccion del aspecto "grasiento" o de brillo excesivo en piel y superficies.
- Reforzamiento de la intensidad general de las funciones del modelo base.
- Activacion mediante palabras clave: "Put it here" o "保持画风光影不变"; el autor indica mejor comportamiento con el disparador en chino.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision (mas alla del propio pipeline de imagen), audio ni modo de pensamiento.

## Casos de uso

- Retoque de fotografia de producto: el LoRA permite editar imagenes de catalogo manteniendo la iluminacion original y evitando cambios de tono entre la toma y el resultado final, algo critico para e-commerce donde la coherencia cromatica afecta a la conversion.
- Fotografia de retrato y belleza: la funcion declarada de eliminacion del aspecto "grasiento" es util para uniformar texturas de piel en sesiones de estudio sin perder el aspecto natural.
- Edicion inmobiliaria: modificar elementos de una estancia (mobiliario, acabados, limpieza visual) conservando la luz natural y las sombras de la fotografia original, lo que reduce el riesgo de resultados artificiales.
- Creacion de contenido para redes sociales: aplicar variaciones sobre una imagen base manteniendo el estilo fotografico de la marca, con una palabra de activacion que fija la coherencia de luz.
- Restauracion y mejora de material grafico antiguo: corregir brillos y artefactos de superficie preservando las condiciones de iluminacion de la captura original.
- Integracion en flujos de produccion grafica dentro de ComfyUI: al ser un LoRA en safetensors, puede encadenarse con otros nodos y adaptadores para construir pipelines de edicion por lotes.
- Prototipado rapido en la nube: la publicacion en RunningHub permite probar el adaptador mediante su interfaz web o su API sin montar infraestructura propia, util para evaluar si encaja en un flujo antes de desplegarlo en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, SSIM, LPIPS ni comparaciones con otros adaptadores), y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la informacion proporcionada. La VRAM necesaria la determina integramente el modelo base Qwen-Image-Edit, no el adaptador, que solo anade 450 MiB de pesos.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada; depende del modelo base cargado y de su nivel de cuantizacion.
- Opciones de despliegue: ComfyUI, plataforma RunningHub (interfaz web y API) y carga directa desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusion de imagen.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Formato de pesos: safetensors, compatible con el cargador de LoRA de ComfyUI.

## Comparativa con modelos similares

No se dispone de datos publicados de benchmarks ni de especificaciones verificables de adaptadores comparables en la informacion proporcionada. La comparacion que sigue es estructural y debe interpretarse como orientativa.

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-put-it-here-qwenedit-v0.1-lora | LoRA de edicion sobre Qwen-Image-Edit | no disponible (adaptador de 450 MiB) | no disponible | Hugging Face, RunningHub |
| Qwen-Image-Edit (base) | Modelo de difusion para edicion de imagen | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face |
| Otros LoRA de edicion publicados para la familia Qwen-Image | LoRA de edicion | no disponible | no disponible | Hugging Face, RunningHub |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia cuantitativa publicada que respalde las mejoras que describe el autor.
- Licencia no especificada: la model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original, pero no identifica cual es. Esto bloquea cualquier evaluacion juridica previa a un uso comercial.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; hereda todas las limitaciones, sesgos y restricciones de Qwen-Image-Edit.
- Idioma de activacion: el autor recomienda usar el disparador en chino porque obtiene mejores resultados, lo que supone una barrera para flujos de trabajo integramente en castellano o ingles.
- Riesgo de sobrecorreccion: la funcion de eliminacion de "grasa" puede producir texturas excesivamente suavizadas o perdida de detalle fino en piel y materiales si se aplica con intensidad alta.
- Riesgo de alucinacion visual: como todo modelo de difusion aplicado a edicion, puede introducir o eliminar elementos no solicitados en la imagen, especialmente en zonas con oclusiones o iluminacion compleja.
- Sin soporte documentado de texto, codigo, agentes ni tool calling: no es adecuado para tareas de lenguaje.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, publicacion con una diferencia de un minuto entre fecha de creacion y actualizacion, y sin historial de versiones visible.
- Los resultados citados por el autor proceden de pruebas informales de la comunidad (wallen, zero, jiong, yunor), no de una evaluacion sistematica.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-put-it-here-qwenedit-v0.1-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/1958193410337357826
- Pagina del autor: https://www.runninghub.ai/user-center/1899865111220367361
- RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su modelo base o su proceso de entrenamiento.
