# optima-tools-ch/video-medium

## Resumen

`optima-tools-ch/video-medium` es un paquete de pesos preparado y distribuido por Optima Tools a partir del modelo de generacion de video **Lightricks/LTX-2.5**, en su variante destilada y cuantizada a INT8. No se trata de un modelo nuevo ni de un fine-tune propio: segun la model card, los seis ficheros del repositorio son copias fieles (mismos tamanos y mismos SHA-256) de los publicados por Lightricks en la revision `49b093a39c19169a8a81721dcc541e07e945232f`. Optima Tools no es autor ni editor de los pesos.

El paquete resuelve un problema de empaquetado y ergonomia: agrupa en un unico repositorio el transformador de difusion, el text encoder, los dos VAE (video y audio), el upscaler latente y el parche de cabeza de duracion, con una estructura de carpetas que se corresponde directamente con el directorio `models/` de Optima Tools y con nombres de fichero que su motor de video reconoce. La variante `video-medium` se diferencia de `video-low` unicamente en los ajustes de generacion propuestos (calidad equilibrada, formato HD, 6 s), no en los pesos.

La relevancia es acotada: es util para usuarios de Optima Tools que quieran instalar LTX-2.5 sin gestionar manualmente seis ficheros de 39,7 GB, pero no aporta mejoras de rendimiento ni cambios tecnicos respecto al modelo original. La model card advierte explicitamente de que no se anuncia ninguna medida de rendimiento y de que los requisitos de memoria son los del modelo, independientemente del perfil elegido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (LTX-2.5) con text encoder Gemma 4 12B personalizado, VAE de video y VAE de audio |
| Parametros totales | 22B en el transformador de difusion (denominacion del fichero: `ltx-2.5-22b-distilled-transformer`); total del paquete no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (transformador de difusion y text encoder, con `convrot`); BF16 en VAE, upscaler y parche de duracion |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License Agreement (11 de agosto de 2026); no es MIT ni Apache |
| Formato de pesos | safetensors (ComfyUI-compatible) |

Desglose de ficheros del repositorio (39,69 GB en total):

| Fichero | Tamano | Precision |
|---|---:|---|
| `diffusion_models/ltx-2.5-22b-distilled-transformer-comfy-int8-convrot.safetensors` | 21,50 GB | INT8 |
| `text_encoders/gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors` | 15,37 GB | INT8 |
| `vae/ltx-2.5-video-vae-conv-bf16.safetensors` | 1,45 GB | BF16 |
| `latent_upscale_models/ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors` | 1,00 GB | BF16 |
| `vae/ltx-2.5-audio-vae-bf16.safetensors` | 0,36 GB | BF16 |
| `model_patches/ltx-2.5-duration-head-bf16.safetensors` | 0,00 GB (despreciable) | BF16 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de lo que se deduce de los nombres de fichero y de la model card. Se trata de un modelo de difusion para generacion de video con un transformador destilado de 22B parametros, acompanado de un text encoder basado en un Gemma 4 12B personalizado (con proyeccion propia para LTX-2.5), dos VAE separados para video y audio, un upscaler latente espacial x2 y un parche de cabeza de duracion que permite controlar la longitud del clip generado.

El pipeline declarado en Hugging Face es `image-to-video`, aunque las etiquetas del repositorio incluyen tambien `text-to-video`. La presencia de un VAE de audio sugiere soporte de generacion de audio conjunta con el video, si bien la model card no detalla esta capacidad. No se proporcionan datos sobre volumen de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). El calificativo "distilled" en el nombre del fichero indica que el transformador es una version destilada del modelo base, pero no se aportan detalles del proceso.

## Capacidades

- Generacion de video a partir de imagen (image-to-video), segun el pipeline declarado.
- Generacion de video a partir de texto (text-to-video), segun las etiquetas del repositorio.
- Control de duracion del clip mediante el parche `duration-head` (el perfil `video-medium` propone 6 s).
- Salida en formato HD con upscaling latente espacial x2.
- Generacion de audio asociada al video, inferida de la presencia del VAE de audio `ltx-2.5-audio-vae-bf16`.
- Integracion con ComfyUI (los nombres de fichero incluyen el sufijo `comfy` y el paquete esta pensado para el motor de video de Optima Tools).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje general).
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado de video generativo en local con Optima Tools: el paquete se importa como carpeta y el motor reconoce los nombres de fichero INT8, lo que permite poner en marcha el pipeline image-to-video sin gestionar manualmente seis ficheros y sus rutas.
- Animacion de imagenes fijas para storyboards: a partir de una imagen de referencia se generan clips cortos de 6 s en HD, utiles para previsualizar secuencias antes de produccion.
- Generacion de clips con audio para redes sociales: el VAE de audio permite obtener video y pista sonora en una sola pasada, adecuado para piezas breves de formato vertical u horizontal.
- Iteracion rapida en ComfyUI: al estar los pesos en formato ComfyUI-compatible, se pueden encadenar nodos de upscaling latente y control de duracion para explorar variantes sin reentrenar.
- Evaluacion comparativa de perfiles de generacion: como `video-low` y `video-medium` comparten exactamente los mismos pesos, sirve para comparar ajustes de calidad, formato y duracion manteniendo constante el modelo.
- Docencia y experimentacion en difusion de video: el desglose explicito de componentes (transformador, text encoder, VAE de video, VAE de audio, upscaler, parche de duracion) facilita explicar la anatomia de un pipeline de video generativo.
- Despliegue interno de demostraciones: para equipos con hardware suficiente, permite montar una demo de image-to-video sin depender de APIs externas, siempre que se respete la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "aucune mesure de performance n'est annoncee ici" y que los requisitos de memoria son los del modelo con independencia del perfil seleccionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, solo el transformador INT8 ocupa 21,50 GB y el text encoder INT8 15,37 GB, por lo que la suma de pesos supera los 37 GB antes de contar activaciones, latentes y buffers de difusion.
- El paquete completo en disco son 39,69 GB; se necesita ese espacio libre para la importacion.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el volumen de pesos, un unico acelerador de 24 GB no permite cargar simultaneamente transformador y text encoder sin offloading; se requeririan GPUs de mayor capacidad o estrategias de descarga a CPU/VRAM por etapas.
- ¿Cabe en GPU consumer? No hay confirmacion oficial. Con 24 GB (RTX 4090) no caben los pesos completos en VRAM a la vez; seria necesario offloading parcial o secuencial, con impacto en latencia no cuantificado.
- Opciones de despliegue: motor de video de Optima Tools (integracion nativa con nombres INT8 reconocidos) y ComfyUI (los ficheros llevan el sufijo `comfy`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican a un modelo de difusion de video y no se mencionan en la informacion.
- Latencia y throughput: no disponibles. La model card advierte de que el paquete "n'a pas encore ete teste dans Optima Tools a partir de ce depot".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `optima-tools-ch/video-medium` | 22B (transformador) | no disponible | LTX-2.x Community License | Hugging Face, 0 descargas | Repackaging INT8 de LTX-2.5; perfil equilibrado HD 6 s |
| `optima-tools-ch/video-low` | 22B (transformador) | no disponible | LTX-2.x Community License | Hugging Face | Mismos pesos exactos; solo cambian los ajustes de generacion |
| `Lightricks/LTX-2.5` | 22B (transformador) | no disponible | LTX-2.x Community License | Hugging Face (fuente original) | Modelo original sin repackaging; incluye pesos en precision original |
| Otros modelos de video open source | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparativa mas relevante es interna: `video-low` y `video-medium` son identicos en pesos (mismos SHA-256) y solo difieren en los ajustes propuestos por Optima Tools, por lo que la eleccion entre ambos es una eleccion de perfil de generacion, no de modelo.

## Limitaciones y advertencias

- **No es un modelo original**: es una copia de pesos de Lightricks redistribuida por Optima Tools; cualquier limitacion de LTX-2.5 aplica sin cambios.
- **No probado en Optima Tools desde este repositorio**: la model card indica que el paquete no se ha testeado en la aplicacion a partir de este repo, solo se ha verificado la integridad por metadatos LFS.
- **Licencia restrictiva**: la LTX-2.x Community License Agreement no es MIT ni Apache. Incluye restricciones de uso (Attachment A, que incorpora la politica de uso aceptable de Lightricks) y exige licencia comercial de pago a entidades con facturacion anual, grupo incluido, de al menos 10 M USD, salvo uso no comercial segun la seccion 2.2.
- **Obligaciones de redistribucion**: el texto integro del acuerdo y el Attachment A deben acompanar a los ficheros; las restricciones de uso deben reproducirse en cualquier acuerdo que rija su utilizacion; las modificaciones deben senalarse y los avisos de copyright y atribucion conservarse.
- **Licencia del text encoder**: la fuente no indica una licencia distinta para el encoder Gemma 4 12B; se distribuye bajo los terminos del acuerdo LTX-2.x, lo que conviene revisar con atencion antes de uso comercial.
- **Riesgo de alucinacion visual**: no cuantificado en la informacion disponible; como todo modelo generativo de video, puede producir artefactos, incoherencias temporales y contenido no fiel a la imagen de entrada.
- **Sesgos**: no documentados en la informacion proporcionada.
- **Idiomas**: no disponibles; se desconoce el soporte multilingue de los prompts.
- **Requisitos de memoria elevados**: la propia model card advierte de que no se debe suponer que un equipo modesto pueda cargarlo, independientemente del perfil elegido.
- **Cero adopcion verificable**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/optima-tools-ch/video-medium
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Revision de origen citada: https://huggingface.co/Lightricks/LTX-2.5/tree/49b093a39c19169a8a81721dcc541e07e945232f
- Texto de la licencia LTX-2.x: https://github.com/Lightricks/LTX-2/blob/a95ab856bf29407b6b066ede0abe1846050db56c/LICENSE-2_x
- Politica de uso aceptable de Lightricks: https://static.lightricks.com/legal/ltx-acceptable-use-policy.pdf
