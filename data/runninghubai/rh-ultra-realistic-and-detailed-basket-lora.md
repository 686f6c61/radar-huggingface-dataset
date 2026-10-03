# RunningHubAI/rh-ultra-realistic-and-detailed-basket-lora

## Resumen

rh-ultra-realistic-and-detailed-basket-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face, distribuido en un unico fichero `detailed_penis_krea_2_v2.safetensors` de 224 MiB. El autor original declarado es la cuenta de RunningHub "@氛围感", y el modelo se distribuye tambien a traves de la plataforma RunningHub y de un proyecto de origen alojado en Civitai. El pipeline declarado es `image-text-to-image` y los tags del repositorio son `comfyui`, `lora`, `image-text-to-image` y `region:us`.

Se trata de un adaptador de bajo rango, no de un modelo completo: requiere un checkpoint base para funcionar. La model card indica "Finetuned from: krea2" y una intensidad de aplicacion recomendada de 0,6. El repositorio no publica licencia explicita, idiomas soportados, ni resultados de benchmarks; el aviso legal de la propia model card remite a la licencia del proyecto original o del modelo upstream.

Su relevancia practica es limitada y muy nichada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el contenido es un LoRA de detalle anatomico de caracter adulto (NSFW). Resulta de interes sobre todo como caso de estudio de los pipelines de publicacion automatizada de adaptadores LoRA sobre ComfyUI y API gestionada, no como modelo de proposito general. Conviene senalar una inconsistencia de nomenclatura: el nombre del repositorio ("basket") no coincide con el nombre del fichero de pesos ni con el del proyecto de origen, que hace referencia explicita a contenido genital.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA sobre un modelo de difusion (checkpoint base declarado: krea2); no se especifica la arquitectura interna del base |
| Parametros totales | no disponible (adaptador de bajo rango; el fichero de pesos ocupa 224 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no hay ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en formato `safetensors` |
| Idiomas soportados | no disponible (depende del codificador de texto del modelo base) |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y que se debe seguir la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`detailed_penis_krea_2_v2.safetensors`, 224 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA destinado a edicion de imagen condicionada por texto (`image-text-to-image`). La model card no describe la arquitectura del modelo base mas alla de la etiqueta "krea2", no indica el rango (rank) ni el alpha del adaptador, no detalla que modulos de atencion o de proyeccion se han intervenido y no especifica la version exacta del checkpoint base. Tampoco se documentan los hiperparametros de entrenamiento, el numero de pasos, el tamano o la composicion del dataset, ni si hubo etapas de ajuste por preferencias.

El unico hiperparametro de inferencia documentado es la intensidad de aplicacion recomendada del LoRA: 0,6. El fichero entregado tiene el nombre interno `detailed_penis_krea_2_v2.safetensors`, lo que sugiere al menos una revision previa (v2) y un entrenamiento orientado a un detalle anatomico concreto. No se declara ninguna innovacion tecnica adicional, ni decodificacion especulativa, ni mecanismos de atencion alternativos. Toda la informacion de entrenamiento publicada se limita a la mencion "Finetuned from: krea2" y a los enlaces a la plataforma de entrenamiento del proveedor.

## Capacidades

- Edicion de imagen guiada por texto y por imagen de entrada, dentro del pipeline `image-text-to-image`.
- Aplicacion de un estilo o detalle concreto sobre imagenes generadas por el checkpoint base, con intensidad ajustable (valor recomendado 0,6).
- Integracion en flujos de ComfyUI como nodo de carga de LoRA, segun los tags del repositorio.
- Ejecucion en la plataforma gestionada RunningHub y exposicion mediante su API.
- Capacidad de generacion de texto, razonamiento, codigo, matematicas, vision semantica, tool calling o uso agentico: no aplica, no es un modelo de lenguaje.
- Capacidades multilingues: no disponibles; el comportamiento dependera del codificador de texto del modelo base.
- Modo "thinking", audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Ajuste fino de detalle en flujos de ComfyUI: cargar el adaptador junto al checkpoint base declarado y aplicar una intensidad de 0,6 para modificar el nivel de detalle de la salida sin reentrenar el modelo completo.
- Edicion imagen a imagen por lotes: insertar el LoRA en un grafo de ComfyUI con un nodo de carga de imagen y un sampler, de modo que se procesen carpetas enteras de imagenes de forma desatendida.
- Publicacion de un servicio gestionado: desplegar el adaptador a traves de la API de RunningHub para ofrecer la funcionalidad como endpoint sin mantener infraestructura de GPU propia.
- Prototipado rapido de variantes de estilo: dado que el adaptador pesa 224 MiB, permite intercambiar y combinar LoRAs en un mismo pipeline con un coste de almacenamiento minimo.
- Replicacion de investigacion sobre adaptadores de bajo rango: sirve como ejemplo reproducible de como se empaqueta, versiona y publica un LoRA entrenado sobre un base concreto.
- Pruebas de cadena de herramientas (toolchain) de generacion de imagen: validar la compatibilidad entre safetensors, ComfyUI y una plataforma de inferencia gestionada antes de escalar a adaptadores propios.
- Auditoria de contenido y moderacion: usar el propio adaptador como caso de prueba para verificar que los filtros de contenido de un pipeline de produccion detectan y bloquean material adulto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud estetica ni comparaciones automaticas), y no existe una evaluacion estandar aplicable a un adaptador de este tipo mas alla de la inspeccion visual subjetiva.

## Requisitos de hardware

- El adaptador en si ocupa 224 MiB en disco, por lo que su sobrecoste de almacenamiento es despreciable frente al checkpoint base.
- VRAM total necesaria para inferencia: no disponible; depende por completo del checkpoint base "krea2", cuyas especificaciones no se documentan en el repositorio.
- Sobrecoste de VRAM atribuible al LoRA: del orden de unos 0,2 GB adicionales sobre el modelo base, dado el tamano del fichero.
- GPU recomendadas: no disponible. No se especifica ninguna GPU objetivo ni requisito de memoria.
- Compatibilidad con GPU de consumo: no disponible para el conjunto base mas LoRA; el adaptador por si solo no es ejecutable sin el checkpoint base.
- Opciones de despliegue: ComfyUI, plataforma RunningHub (incluida su API) y carga directa de safetensors desde Hugging Face. No se distribuyen pesos en GGUF ni formatos para llama.cpp u Ollama, ya que no es un modelo de lenguaje; tampoco se documenta soporte de vLLM o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar adaptadores LoRA comparables con datos verificables de parametros, contexto, rendimiento o licencia. La model card tampoco ofrece una comparacion con alternativas. A modo estructural, cabe senalar las siguientes caracteristicas diferenciales frente a un LoRA convencional del mismo ecosistema, todas ellas sin datos cuantitativos de contraste:

| Aspecto | Este modelo | Alternativa generica de la misma categoria |
|---|---|---|
| Tipo de artefacto | adaptador LoRA (safetensors, 224 MiB) | adaptador LoRA, tamano variable; no disponible |
| Modelo base | krea2 (segun la model card) | no disponible |
| Licencia | no disponible; remite al proyecto upstream | habitualmente licencia explicita; no verificable aqui |
| Benchmarks publicados | ninguno | no disponible |
| Descargas y adopcion | 0 descargas, 0 likes | no disponible |
| Contenido | adulto (NSFW), detalle anatomico | no disponible |

## Limitaciones y advertencias

- Contenido adulto: el adaptador esta disenado para generar o editar material explicitamente sexual. Su despliegue en productos de consumo exige filtrado y verificacion de edad, y puede incumplir las condiciones de uso de la plataforma de alojamiento.
- Licencia no explicitada: el repositorio no incluye un fichero de licencia. La model card indica que el copyright permanece con el autor y que se debe seguir la licencia del proyecto original o del modelo base. Esto impide determinar si el uso comercial esta permitido; en la practica, debe considerarse no autorizado hasta que el autor lo aclare.
- Dependencia de un base no especificado: la model card solo indica "krea2" sin version ni revision concreta. Cargar el adaptador sobre un checkpoint distinto puede degradar o anular el resultado.
- Ausencia total de documentacion de entrenamiento: no hay datos sobre dataset, numero de pasos, hiperparametros ni evaluacion. No es auditable ni reproducible.
- Riesgo de sesgo y de alucinacion visual: no evaluado. No existen metricas de fidelidad, de sesgo demografico ni de estabilidad entre semillas.
- Inconsistencia de nomenclatura: el identificador del repositorio ("basket") difiere del nombre del fichero de pesos y del proyecto de origen. Esto complica la trazabilidad y la verificacion de que el binario corresponde al modelo descrito.
- Idiomas: no declarados. La respuesta a prompts en castellano depende enteramente del codificador de texto del modelo base.
- Repositorio sin adopcion: 0 descargas y 0 likes en la fecha de consulta, sin issues ni validacion por parte de la comunidad. No hay evidencia externa de funcionamiento correcto.
- Fecha de creacion declarada: 2026-10-02, posterior a la fecha de actualizacion (2026-10-02T22:18:01Z). La metadata del repositorio no es fiable.
- Advertencia de seguridad: los ficheros safetensors pueden cargarse con seguridad relativa, pero al no existir verificacion de integridad publicada conviene comprobar hashes antes de integrarlos en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-ultra-realistic-and-detailed-basket-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2100036769797496833
- Pagina del autor: https://www.runninghub.ai/user-center/2041030036219498497
- Fuente original declarada (Civitai): https://civitai.red/models/2792960/detailed-penis?modelVersionId=3330091
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Servicio de entrenamiento: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (referenciado en la model card, no verificado)
