# RunningHubAI/rh-tcdecoder-checkpoint

## Resumen

`rh-tcdecoder-checkpoint` es un checkpoint de pesos publicado por RunningHubAI en Hugging Face el 25 de septiembre de 2026, pensado para su uso dentro de ComfyUI, la plataforma RunningHub y el propio Hub. Segun su model card, se trata de un modelo de tipo «Checkpoint» obtenido por ajuste fino (finetuning) a partir de WAN 2.1, la familia de modelos de generacion de video de Alibaba. El repositorio contiene un unico fichero, `TCDecoder.ckpt`, de 180 MiB, lo que situa el tamano total del repositorio en torno a 0,2 GB.

El nombre del artefacto sugiere que se trata de un decodificador (tarea de reconstruccion desde el espacio latente hacia pixeles o frames), probablemente un componente dentro de un pipeline mayor de generacion de video, y no un modelo generativo completo y autonomo. No obstante, la model card no especifica arquitectura interna, numero de parametros, longitud de contexto ni datos de entrenamiento, por lo que esa interpretacion no puede confirmarse con la informacion disponible.

Su relevancia actual es limitada pero concreta: es un ejemplo de publicacion de pesos especializados por parte de plataformas de generacion de contenido (RunningHub) para integrarse en flujos de trabajo de ComfyUI y en APIs gestionadas. El repositorio acumula 0 descargas y 0 «likes», no declara licencia explicita y no incluye informacion de idiomas ni de pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. La model card solo indica que es un «Checkpoint» ajustado a partir de WAN 2.1; no describe la topologia interna |
| Parametros totales | no disponible. El unico dato cuantitativo es el tamano del fichero de pesos (180 MiB) |
| Parametros activos | no aplica / no disponible. No se indica que sea un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible. La model card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original o del modelo upstream, sin nombrarla |
| Formato de pesos | `.ckpt` (fichero unico `TCDecoder.ckpt`, 180 MiB) |
| Modelo base | WAN 2.1 (finetuned from) |
| Tipo de artefacto | Checkpoint para ComfyUI |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,2 GB |
| Autor | RunningHub, atribuido a la cuenta @姬先森-AI频道 |
| Fecha de publicacion | 25 de septiembre de 2026 (creacion); ultima actualizacion el mismo dia |
| Descargas / likes | 0 / 0 |
| Pipeline de Hugging Face | no disponible |

## Arquitectura y entrenamiento

La informacion proporcionada no permite describir la arquitectura interna del modelo. La model card lo clasifica como «Checkpoint», indicando unicamente que esta ajustado a partir de WAN 2.1 y que se carga en ComfyUI o en RunningHub. No se detallan numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, destilacion de pasos, etc.). Tampoco se especifica si el ajuste fino es completo o mediante tecnicas como LoRA.

El nombre «TCDecoder» y el hecho de derivar de WAN 2.1, un modelo de difusion para generacion de video, apuntan a que podria tratarse de un componente de decodificacion dentro del pipeline de difusion, pero se trata de una inferencia a partir del nombre del fichero y no de un dato confirmado en la documentacion. Cualquier afirmacion sobre su funcion exacta requeriria inspeccionar el checkpoint o consultar el proyecto original enlazado en la model card.

## Capacidades

La informacion disponible no permite enumerar capacidades verificadas. A partir de los datos de la model card solo puede afirmarse lo siguiente:

- Carga como checkpoint en ComfyUI, segun la documentacion del autor.
- Uso declarado en la plataforma RunningHub y en Hugging Face.
- Derivado por ajuste fino de WAN 2.1, un modelo de generacion de video.
- Generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling, soporte de agentes y capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking) o capacidades de audio: no disponible.

No se debe asumir ninguna capacidad adicional (por ejemplo, generacion de video de extremo a extremo) sin verificacion directa, dado que el tamano del fichero (180 MiB) es compatible con un componente parcial y no con un modelo de difusion de video completo.

## Casos de uso

Todos los casos siguientes se plantean como usos plausibles del artefacto dentro del ecosistema declarado (ComfyUI y RunningHub). No proceden de una documentacion de casos de uso publicada por el autor, que no existe en la informacion disponible.

- Integracion como nodo de checkpoint en un flujo de ComfyUI: el fichero `.ckpt` puede colocarse en el directorio de checkpoints de ComfyUI y cargarse mediante los nodos de carga habituales, siempre que el grafo empleado y el modelo base sean compatibles con este componente.
- Post-proceso de latentes en un pipeline de generacion de video: si el artefacto funciona como decodificador, se emplearia para transformar representaciones latentes en frames o imagenes finales dentro de una cadena que incluya el modelo base WAN 2.1 y los nodos de muestreo correspondientes.
- Experimentacion en investigacion sobre decodificadores: al ser un artefacto pequeno (180 MiB), es adecuado para pruebas comparativas de calidad de reconstruccion frente a otros decodificadores, midiendo metricas objetivas (PSNR, SSIM, LPIPS) sobre un conjunto fijo de latentes.
- Ejecucion en infraestructura gestionada: el autor remite explicitamente a la API de RunningHub, de modo que el caso de uso previsto incluye invocar el modelo a traves de esa plataforma en lugar de desplegarlo localmente.
- Base para ajuste fino adicional: al tratarse de un checkpoint derivado de WAN 2.1, puede servir como punto de partida para experimentos de especializacion, sujeto a que la licencia del proyecto original lo permita (no declarada en el repositorio).
- Docencia y formacion en pipelines de difusion: su tamano reducido lo hace manejable para explicar como se conectan los componentes de un pipeline de video en ComfyUI, separando el modelo generativo del decodificador.
- Pruebas de reproducibilidad de artefactos publicados en el Hub: util para verificar si un checkpoint sin model card tecnica detallada puede integrarse realmente en un entorno estandar sin documentacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de ningun tipo (calidad de reconstruccion, PSNR, SSIM, FVD, latencia ni throughput), ni comparaciones con otros decodificadores o modelos de video. Tampoco se han encontrado resultados en la busqueda web asociada a esta ficha, que unicamente ha devuelto resultados genricos no relacionados con el modelo.

## Requisitos de hardware

- Almacenamiento: el fichero de pesos ocupa 180 MiB y el repositorio completo 0,2 GB, por lo que el espacio en disco necesario para el checkpoint es minimo.
- VRAM del propio checkpoint: no disponible. No se indica el consumo de memoria del artefacto ni si requiere precision completa (fp32) o media (fp16) para su carga.
- VRAM del pipeline completo: no disponible. Depende del modelo base con el que se combine (la model card menciona WAN 2.1 pero no especifica la variante ni la configuracion) y de la resolucion y duracion del video generado.
- GPU recomendadas: no disponible. No hay ninguna recomendacion de hardware en la informacion proporcionada.
- Viabilidad en GPU de consumo: no se puede afirmar. El checkpoint en si cabe en cualquier GPU moderna, pero la viabilidad del pipeline completo depende del modelo base y de la configuracion de muestreo, datos que no se facilitan.
- Opciones de despliegue declaradas: ComfyUI y la plataforma RunningHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay informacion suficiente para establecer una comparativa fiable con alternativas de la misma categoria: se desconoce la arquitectura, el numero de parametros y el rendimiento del modelo. La siguiente tabla recoge los pocos datos objetivos disponibles frente al modelo upstream declarado, marcando como «no disponible» todo aquello que no consta.

| Aspecto | rh-tcdecoder-checkpoint | WAN 2.1 (modelo base declarado) |
|---|---|---|
| Tipo de artefacto | Checkpoint para ComfyUI | Familia de modelos de generacion de video |
| Parametros | no disponible | no disponible en la informacion proporcionada |
| Longitud de contexto | no disponible | no disponible en la informacion proporcionada |
| Licencia | no disponible | no disponible en la informacion proporcionada |
| Formato de pesos | `.ckpt` (180 MiB) | no disponible en la informacion proporcionada |
| Rendimiento en benchmarks | no disponible | no disponible en la informacion proporcionada |
| Disponibilidad | Hugging Face, ComfyUI, RunningHub | no disponible en la informacion proporcionada |

Para una comparativa con alternativas reales (por ejemplo, otros decodificadores o VAEs usados en pipelines de video) seria necesario conocer primero la funcion exacta del artefacto, dato que no se ha publicado.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre arquitectura, parametros, entrenamiento, datos utilizados ni evaluacion. Esto impide valorar su calidad o idoneidad antes de probarlo.
- Licencia no declarada: el repositorio no especifica licencia. La model card indica que los derechos permanecen en el autor y remite a la licencia del proyecto original o del upstream, sin identificarla. Esto supone un riesgo juridico para uso comercial hasta que se aclare.
- Riesgo de incompatibilidad: al ser un `.ckpt` sin documentacion, no se garantiza que cargue correctamente en versiones actuales de ComfyUI ni con variantes concretas de WAN 2.1. El formato `.ckpt` tambien puede implicar la deserializacion de objetos Python, lo que aconseja extremar las precauciones de seguridad al cargarlo (procedencia fiable, entorno aislado).
- Trazabilidad limitada: la atribucion se hace a una cuenta de usuario de RunningHub, sin repositorio de codigo, paper ni informe tecnico asociados.
- Sin validacion externa: 0 descargas y 0 «likes» en el momento de redactar esta ficha, sin evidencia publica de uso o verificacion por terceros.
- Sesgos: no disponible. Al no conocerse los datos de entrenamiento, no se puede evaluar que sesgos podria heredar del modelo base.
- Riesgo de alucinacion: no aplica en el sentido habitual de los modelos de lenguaje, pero si existe riesgo de artefactos visuales o temporales si se usa como componente generativo; no hay evaluacion disponible al respecto.
- Ambito de uso restringido: la propia documentacion lo presenta como un artefacto para ComfyUI y RunningHub, no como un modelo de proposito general. Emplearlo fuera de ese ecosistema no esta respaldado por el autor.
- Idiomas y contexto: no disponible, y en principio no relevantes si el artefacto opera sobre representaciones visuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-tcdecoder-checkpoint
- README en chino: https://huggingface.co/RunningHubAI/rh-tcdecoder-checkpoint/blob/main/README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2058734824713711617
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1920686505763741697
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio para China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Paper, repositorio de codigo o demo oficial: no disponible.
