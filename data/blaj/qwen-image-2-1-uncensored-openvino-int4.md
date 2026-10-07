# blaj/Qwen-Image-2.1-Uncensored-OpenVINO-INT4

## Resumen

Qwen-Image-2.1-Uncensored-OpenVINO-INT4 es una build en formato OpenVINO IR del modelo de difusion texto-a-imagen Qwen-Image-2.1, publicada por el usuario blaj. Se distribuye cuantizada a INT4 asimetrico para poder ejecutarse en iGPU Intel Arc integradas, con un codificador de texto Qwen3-VL sustituido por una version abliterada procedente de pottokao/Qwen-Image-2.1-Text-Encoder-Heretic. El transformer de difusion, el VAE y el vision encoder se mantienen sin modificar respecto al modelo original de Qwen.

La relevancia de esta build es doble. Por un lado, demuestra que un pipeline de difusion completo de esta familia puede ejecutarse en hardware Intel integrado con un pico de memoria de 7,1 GB y una latencia de 1,29 s por paso a 512x512, segun las mediciones del autor en un Core Ultra 7 258V con Arc 130V/140V. Por otro, aloja la eliminacion de rechazos en la ruta de embeddings del prompt, de modo que solo hay que reemplazar el text encoder y no el resto de componentes.

El repositorio se publico el 7 de octubre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad. Hereda la licencia de investigacion qwen-research y requiere un stack de software en version nightly (OpenVINO 2026.5.0, diffusers y optimum-intel desde main). No se han publicado metricas de calidad de imagen (FID, CLIP score) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion texto-a-imagen: transformer de difusion, VAE y vision encoder stock de Qwen-Image-2.1, con codificador de texto Qwen3-VL abliterado; el detalle interno de la arquitectura no esta documentado en la informacion disponible |
| Parametros totales | no disponible (el export fp16 completo de la pipeline ocupa 33 GB) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimetrico (text_encoder, text_encoder_i2i, transformer); INT8 (vision_encoder, vae_decoder, vae_encoder); export intermedio en fp16 IR |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (campo license: other, license_name: qwen-research) |
| Formato de pesos | OpenVINO IR; libreria openvino; ejecucion via optimum-intel (OVDiffusionPipeline) |
| Tamano del repositorio | 8,7 GB segun HuggingFace; la model card indica ~13 GB sumando componentes |
| Componentes incluidos | text_encoder, text_encoder_i2i, transformer, vision_encoder, vae_decoder, vae_encoder |
| Resolucion de generacion | El ejemplo de uso emplea 1024x1024; las mediciones de rendimiento se hicieron a 512x512 |
| Pipeline declarado | text-to-image |
| Fecha de publicacion | 7 de octubre de 2026 (ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

El artefacto no es un modelo entrenado desde cero, sino una conversion y cuantizacion de Qwen-Image-2.1 con una sustitucion parcial de componentes. El autor exporto el codificador de texto abliterado a IR fp16 con optimum (57 s, 14,4 GB), tomando unicamente la parte `.model.language_model`, y despues lo comprimio a INT4 con NNCF. Esta compresion exige `group_size=-1`: los valores 128 y 64 lanzan `InvalidGroupSizeError`. El proceso tarda 37 s y reduce el componente a 3,9 GB. Finalmente se copio un pipeline stock preconvertido a INT4 y se reemplazaron los directorios `text_encoder/` y `text_encoder_i2i/` por las versiones abliteradas.

La abliteracion se verifica por comparacion de embeddings. Para el prompt "a portrait of a woman, photorealistic", el encoder stock produce una media de 0,59543 y el heretic de 0,22803, con una diferencia absoluta maxima de 1550,99353 y media de 10,12831; el autor confirma que los tensores no son identicos, descartando que se trate de una copia renombrada. No se documenta el proceso de entrenamiento del modelo base Qwen-Image-2.1 (numero de tokens, composicion del dataset, uso de RLHF o DPO) ni el metodo exacto empleado para abliterar el text encoder.

La tabla de componentes y precisiones es la siguiente: `text_encoder` (INT4 asimetrico, 3,9 GB), `text_encoder_i2i` (INT4 asimetrico, 3,9 GB), `transformer` (INT4 asimetrico, 3,5 GB), `vision_encoder` (INT8, 553 MB), `vae_decoder` (INT8, 243 MB) y `vae_encoder` (INT8, 76 MB). El total declarado es de aproximadamente 13 GB.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) mediante pipeline de difusion, con soporte de `num_inference_steps`, `height`, `width` y semilla fija.
- Generacion sin rechazos por contenido: la abliteracion reside en la ruta de embeddings del prompt, por lo que determina que representaciones internas recibe el transformer.
- Ranura de edicion imagen-a-imagen presente (`text_encoder_i2i`) y vision encoder INT8 incluido, aunque el propio autor advierte que el pipeline i2i no es viable en su hardware de 30 GB.
- Cuantizacion INT4 en el transformer y el text encoder, e INT8 en VAE y vision encoder, lo que permite ejecucion en iGPU.
- No es un modelo de lenguaje: no realiza generacion de texto, razonamiento, codigo, matematicas, tool calling ni razonamiento multi-paso con agentes.
- Soporte multilingue: no disponible; no se documentan idiomas soportados para los prompts.
- No se documentan modos especiales (thinking mode, audio, video) ni variantes de decodificacion especulativa.

## Casos de uso

- Generacion de imagenes en portatiles con Intel Core Ultra: el pipeline completo funciona en una Arc 130V/140V iGPU con 7,1 GB de pico de memoria y 12,9 s para una imagen de 512x512 con 10 pasos, lo que permite trabajar sin GPU dedicada.
- Prototipado de arte conceptual con privacidad local: al ejecutarse sobre OpenVINO en el propio equipo, los prompts y las imagenes no salen de la maquina, lo que encaja en estudios con requisitos de confidencialidad.
- Creacion de conjuntos de imagenes sinteticas para aumento de datos: el rendimiento medido equivale a unos 4,6 imagenes por minuto a 512x512 y 10 pasos, suficiente para lotes pequenos de entrenamiento o validacion visual.
- Investigacion sobre alineacion y seguridad de modelos generativos: la diferencia medida de embeddings entre el encoder stock y el heretic (media 0,59543 frente a 0,22803) permite estudiar como la abliteracion altera la representacion del prompt sin tocar el transformer.
- Ilustracion y contenido editorial que los modelos stock rechazan: util cuando los filtros de contenido bloquean prompts legitimos de caracter artistico o adulto, asumiendo la responsabilidad legal que la propia licencia atribuye al usuario.
- Evaluacion de cuantizacion INT4: al mantener el transformer, VAE y vision encoder stock, permite aislar el efecto de la cuantizacion INT4 y de la abliteracion sobre la calidad de salida comparando contra el modelo original en fp16.
- Integracion en aplicaciones de escritorio basadas en OpenVINO: el modelo se carga con `OVDiffusionPipeline.from_pretrained(..., compile=True, device="GPU")`, por lo que puede embeberse en herramientas nativas con aceleracion Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, evaluaciones humanas) en la informacion disponible. Las unicas cifras publicadas son mediciones de rendimiento del autor en un Intel Core Ultra 7 258V con iGPU Arc 130V/140V, 8 nucleos y 30 GB de RAM.

| Prueba | Resultado |
|---|---|
| Carga del pipeline | 43,5 s |
| 512x512, 10 pasos | 12,9 s (1,29 s por paso) |
| Pico de RSS | 7,1 GB |
| Export del text encoder a fp16 IR | 57 s, 14,4 GB |
| Compresion del IR a INT4 con NNCF | 37 s, 3,9 GB |

No hay datos comparativos con el modelo stock en fp16 ni con otras builds INT4, por lo que no es posible cuantificar la perdida de calidad asociada a la cuantizacion.

## Requisitos de hardware

- Memoria: pico de 7,1 GB de RSS medido para text-to-image a 512x512. La model card cifra en ~13 GB el conjunto de componentes en disco; HuggingFace reporta 8,7 GB de repositorio.
- GPU recomendada: iGPU Intel Arc 130V/140V sobre Core Ultra 7 258V, unico hardware con mediciones publicadas. Otras iGPU Arc, GPUs Arc dedicadas y plataformas Intel Xeon no tienen datos disponibles.
- GPU de consumo NVIDIA: no disponible. El artefacto es OpenVINO IR y se ejecuta con `device="GPU"` sobre hardware Intel; no se documenta ruta CUDA ni compatibilidad con llama.cpp, Ollama, vLLM o TGI (no aplicables a un modelo de difusion de este tipo).
- Edicion imagen-a-imagen: no viable. Carga pero agota los 30 GB durante la generacion, porque necesita el vision encoder y ambos text encoders residentes a la vez. No depende de la resolucion: a 256x256 con 8 pasos ya alcanza 28 GB.
- Despliegue: `optimum.intel.OVDiffusionPipeline` con `compile=True` y `device="GPU"`. Requiere diffusers y optimum-intel instalados desde `main` y OpenVINO 2026.5.0 nightly. El paso de exportacion exige Python 3.12; en Python 3.14 falla con `TypeError: NormalizedConfig.__init__() got multiple values for argument 'allow_new'`.
- Latencia: 1,29 s por paso a 512x512 y 43,5 s de carga del pipeline en el hardware medido. No hay mediciones de throughput a 1024x1024 ni en CPU.
- Exportacion: el export completo de la pipeline desde la fuente de 33 GB es abortado por OOM (exit 137) en una maquina de 30 GB; es necesario exportar los componentes por separado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| blaj/Qwen-Image-2.1-Uncensored-OpenVINO-INT4 | OpenVINO IR, INT4/INT8, text encoder abliterado | no disponible (export fp16 de 33 GB) | no disponible | 12,9 s por imagen 512x512 y 10 pasos en Arc 130V/140V | qwen-research | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen-Image-2.1 (modelo base) | Modelo original texto-a-imagen, incluye edicion i2i | no disponible | no disponible | no disponible | qwen-research | Publico en HuggingFace |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic | Componente aislado: text encoder abliterado | no disponible | no disponible | no disponible | no disponible | Publico en HuggingFace |
| Otras builds OpenVINO INT4 preconvertidas del modelo stock | OpenVINO IR, INT4 | no disponible | no disponible | no disponible | no disponible | Mencionadas en la model card, sin referencia directa |

No se dispone de datos de benchmarks ni de especificaciones de parametros de los modelos comparados, por lo que la comparacion se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- La edicion imagen-a-imagen esta incluida pero es inviable en el hardware documentado: agota 30 GB durante la generacion incluso a 256x256 con 8 pasos.
- El text encoder abliterado es un artefacto de la comunidad y, segun el propio autor, arrastra cambios de comportamiento mas alla de la eliminacion de rechazos.
- Al heredar la licencia de investigacion qwen-research, el uso comercial queda sujeto a las condiciones del modelo original; conviene revisarlas antes de cualquier despliegue en produccion.
- La generacion de contenido sin filtros es responsabilidad del usuario, tal como indica la model card. No hay salvaguardas adicionales en el pipeline.
- Requiere un stack nightly (OpenVINO 2026.5.0 nightly, diffusers y optimum-intel desde main), lo que implica inestabilidad potencial de API y falta de soporte a largo plazo.
- El proceso de exportacion exige Python 3.12 y el export completo de la pipeline provoca OOM en maquinas de 30 GB.
- No hay validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha.
- No se han publicado metricas de calidad de imagen, por lo que se desconoce la degradacion introducida por la cuantizacion INT4.
- El repositorio no documenta idiomas soportados ni longitud de contexto del codificador de texto.
- Existe una discrepancia de tamano sin explicar: 8,7 GB reportados por HuggingFace frente a los ~13 GB que suma la model card. Es plausible que los dos text encoders INT4 compartan almacenamiento de blobs, pero no esta confirmado.
- No se documentan sesgos conocidos ni tasas de alucinacion visual; en modelos de difusion estos riesgos se manifiestan como fidelidad limitada al prompt y sesgos en la representacion de personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/Qwen-Image-2.1-Uncensored-OpenVINO-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Text encoder abliterado: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic
- Guia de conversion a OpenVINO IR y construccion de la version sin censura: https://devnotes.page/how-to-convert-qwen-image-2-1-to-openvino-ir-and-build-an-uncensored-version
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente paginas de inicio de sesion de Google), por lo que no hay papers, repositorios ni demos adicionales que referenciar.
