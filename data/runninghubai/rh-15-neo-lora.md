# RunningHubAI/rh-15-neo-lora

## Resumen

rh-15-neo-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face, entrenado por el usuario @T8star-Aix dentro de la plataforma RunningHub. No es un modelo de lenguaje ni un modelo de difusion completo: se trata de un fichero de pesos de 292 MiB en formato `safetensors` que se carga sobre un modelo base para modificar su comportamiento generativo. Su pipeline declarado es image-text-to-image, lo que lo situa en el terreno de la edicion de imagenes guiada por texto (image editing / instruction-based editing) mas que en el de la generacion pura desde cero.

El objetivo declarado del adaptador es aplicar un estilo de maquillaje de idol coreano sobre un rostro existente, manteniendo los rasgos de la persona. La model card incluye una unica palabra de activacion (trigger word) con descriptores concretos: piel luminosa, labios con brillo acuoso, sombra de ojos coral con shimmer, pestanas finas, rubor rosa suave y una estetica limpia y brillante, ademas de la instruccion explicita "keep face feature" para preservar la identidad facial.

El modelo se distribuye pensando en ComfyUI y en la propia infraestructura de RunningHub, y se presenta como un ajuste fino derivado de un modelo base identificado en la model card como "F1基础-Kontext". La relevancia practica es limitada por ahora: el repositorio acumula cero descargas y cero likes, no declara licencia, no aporta idiomas soportados ni resultados de benchmarks, y no especifica ni el rango del LoRA ni los datos exactos de entrenamiento. Es, por tanto, un recurso util unicamente para quien trabaje en el ecosistema ComfyUI y quiera experimentar con estilos de maquillaje, no una pieza con garantias de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusion para edicion de imagen; rango y alpha no disponibles |
| Parametros totales | no disponible (el unico fichero de pesos ocupa 292 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (la trigger word esta redactada en ingles) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y que se debe seguir la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`化妆-15.safetensors`) |

## Arquitectura y entrenamiento

La informacion disponible describe un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas de un modelo base congelado para especializarlo en un dominio concreto sin reentrenar todos los pesos. La model card identifica el modelo de partida como "F1基础-Kontext" y menciona "neo" como proyecto original, pero no detalla la arquitectura de ese modelo base (tipo de backbone, numero de parametros, mecanismo de condicionamiento textual o de imagen), ni el rango, el alpha, la tasa de aprendizaje, el numero de pasos o el hardware empleado en el entrenamiento. El unico fichero incluido pesa 292 MiB, un tamano coherente con un adaptador de rango moderado, pero insuficiente para inferir el rango exacto.

Respecto a los datos, la model card unicamente indica que el LoRA se ha entrenado en RunningHub y que reproduce un estilo de maquillaje de idol coreano descrito mediante un prompt largo y especifico. No se declara el numero de imagenes del dataset, su procedencia, si hubo anotaciones automaticas o curación manual, ni si se aplicaron tecnicas de regularizacion (por ejemplo, caption dropout o preservacion de identidad). La instruccion "keep face feature" sugiere que el entrenamiento busco preservar la identidad del sujeto original mientras se transfiere el estilo de maquillaje, pero se trata de una interpretacion del texto de la model card, no de un dato confirmado. Tampoco hay informacion sobre decodificacion especulativa, atencion lineal u otras innovaciones tecnicas, porque no aplican a este tipo de adaptador.

## Capacidades

- Edicion de imagen guiada por texto: aplica transformaciones sobre una imagen de entrada siguiendo instrucciones o palabras clave, no genera imagenes desde cero como tarea principal.
- Transferencia de estilo de maquillaje: reproduce un look concreto descrito como maquillaje de idol coreano, con piel luminosa, labios con brillo acuoso, sombra coral con shimmer, pestanas finas y rubor rosa suave.
- Preservacion de rasgos faciales: la trigger word incluye la instruccion "keep face feature", orientada a mantener la identidad del rostro de la persona retratada.
- Integracion con ComfyUI: el modelo esta etiquetado explicitamente para su uso en flujos de trabajo de ComfyUI, mediante el cargador de LoRA correspondiente.
- Despliegue en plataforma gestionada: puede cargarse y ejecutarse en RunningHub, tanto en la version internacional como en la china, y a traves de su API.
- Compatibilidad con Hugging Face: los pesos se descargan directamente del repositorio en formato safetensors.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponibles; la unica evidencia textual es una trigger word en ingles.
- Modo "thinking", vision o audio: no disponibles; el pipeline es exclusivamente image-text-to-image.

## Casos de uso

- Retoque fotografico de belleza en estudio: el LoRA permite aplicar un look de maquillaje uniforme sobre fotografias de retrato ya tomadas, de modo que un fotografo pueda ofrecer una variante estilizada sin repetir la sesion ni recurrir a un maquillador.
- Pruebas de maquillaje previas a produccion: un equipo de audiovisual puede generar versiones de un mismo rostro con el estilo descrito y decidir el acabado antes de rodar, reduciendo coste de pruebas fisicas.
- Creacion de contenido para redes sociales: creadores que trabajan con imagenes propias pueden aplicar el estilo de forma coherente en series de publicaciones, apoyandose en ComfyUI para automatizar el flujo por lotes.
- Prototipado de campanas de cosmetica: una marca puede generar variaciones visuales de un producto combinado con un rostro modelo para validar direccion de arte antes de invertir en fotografia final.
- Integracion en pipelines de generacion por API: dado que el modelo esta asociado a la API de RunningHub, puede invocarse desde un servicio backend que reciba una imagen y una instruccion de estilo y devuelva la imagen editada.
- Educacion y formacion en edicion de imagen: sirve como ejemplo practico de LoRA de bajo rango cargado en ComfyUI para ensenar como se compone un flujo de image editing con adaptadores.
- Experimentacion en investigacion sobre edicion condicionada: util como punto de partida para estudiar como un adaptador de este tipo afecta a la preservacion de identidad frente a la intensidad del estilo aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador en si ocupa 292 MiB en disco y su coste de VRAM es marginal frente al modelo base, pero el requisito total depende por completo de ese modelo base ("F1基础-Kontext"), cuyo tamano no se especifica.
- Memoria en disco: 0,3 GB de repositorio, con un unico fichero safetensors de 292 MiB.
- GPU recomendadas: no disponibles. El autor no publica requisitos de hardware y el entrenamiento se realizo en la plataforma RunningHub, sin detallar la GPU empleada.
- Compatibilidad con GPU de consumo: no confirmada. Solo seria viable si el modelo base cabe en la VRAM de la GPU objetivo, dato que no se aporta.
- Opciones de despliegue: ComfyUI (etiquetado explicito en el repositorio), plataforma RunningHub (internacional y China) y su API, y descarga directa desde Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas. La propia model card menciona dos referencias relacionadas, que se recogen a continuacion sin cifras disponibles.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-15-neo-lora | LoRA de edicion de imagen | no disponible (fichero de 292 MiB) | no aplica | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| F1基础-Kontext (modelo base) | Modelo de difusion para image-text-to-image | no disponible | no aplica | no disponible | no disponible | referenciado en la model card |
| neo (proyecto original) | no disponible | no disponible | no aplica | no disponible | no disponible | referenciado en la model card |

## Limitaciones y advertencias

- Ausencia total de licencia: la model card no declara una licencia concreta y remite a la del proyecto original o upstream. Sin ese dato, no es posible confirmar si se permite el uso comercial, por lo que cualquier despliegue en produccion requiere verificacion previa con el autor.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma. Su comportamiento, su calidad y sus requisitos de hardware vienen determinados por "F1基础-Kontext", cuyas caracteristicas, licencia y limitaciones no se detallan.
- Sesgos y representacion: se trata de un LoRA especializado en un unico estilo de maquillaje asociado a un ideal estetico concreto (idol coreano), lo que puede producir resultados homogeneos, poco diversos en tono de piel, rasgos o genero, y reproducir sesgos esteticos del dataset de entrenamiento.
- Riesgo de artefactos y alucinacion visual: como todo modelo generativo de imagen, puede introducir deformaciones en rostro, manos o cabello, alterar la identidad de la persona pese a la instruccion "keep face feature", o modificar elementos del fondo no solicitados.
- Ambiguedad de la trigger word: la cadena de activacion es larga y muy especifica, con descriptores en ingles; su comportamiento con otros idiomas o con prompts mas cortos no esta documentado.
- Idiomas no declarados: no se especifica soporte multilingue, lo que limita la previsibilidad de los resultados en castellano.
- Falta de validacion comunitaria: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni ejemplos comparativos publicados. No hay evidencia independiente de calidad.
- Fechas del repositorio: la model card indica fechas de creacion y actualizacion de octubre de 2026, posteriores a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.
- Uso responsable: al operar sobre rostros reales, es necesario contar con consentimiento de las personas retratadas y cumplir la normativa aplicable en materia de imagen, datos personales y etiquetado de contenido sintetico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-15-neo-lora
- README en chino del repositorio: https://huggingface.co/RunningHubAI/rh-15-neo-lora/blob/main/README_cn.md
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1943608279815626754
- Pagina del autor (@T8star-Aix): https://www.runninghub.cn/user-center/1819214514410942465
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de la API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
