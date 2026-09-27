# RunningHubAI/rh-krea2-turbo-bf16-xxoo-unet

## Resumen

rh-krea2-turbo-bf16-xxoo-unet es un UNET de difusion para edicion de imagen guiada por texto (pipeline `image-text-to-image`), publicado por RunningHubAI en nombre del autor del finetune. Se distribuye como un unico fichero de pesos en precision bf16 (`rayArtshoot_krea2NSFW_bf16V4.safetensors`, 25.063 MiB) y esta pensado para cargarse en ComfyUI, en la plataforma RunningHub o en Hugging Face. El modelo es un finetune derivado de `krea2`, cuyo proyecto original no se detalla en la informacion disponible.

El repositorio no incluye model card tecnica: solo una tabla de identificacion, la lista de ficheros y enlaces promocionales a RunningHub. No se publican datos de arquitectura interna, numero de parametros, conjunto de entrenamiento, licencia ni idiomas soportados. Como referencia cuantitativa, el tamano del fichero bf16 (25.063 MiB, 2 bytes por parametro) implica del orden de 13.100 millones de parametros, aunque se trata de una estimacion aritmetica y no de un dato confirmado por el autor.

Su relevancia es acotada y de nicho: interesa a quien ya trabaja con flujos de edicion de imagen en ComfyUI y busca un checkpoint concreto de la familia krea2, en un contexto donde la trazabilidad de licencia y de datos de entrenamiento es practicamente nula. El nombre del fichero incluye el termino `NSFW`, lo que sugiere un ajuste fino orientado a contenido para adultos y obliga a extremar las precauciones antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para edicion de imagen; sin detalles de bloques, atencion ni variante publicados (no disponible) |
| Parametros totales | No disponible. Estimacion aritmetica: ~13.100 millones, derivada de un fichero bf16 de 25.063 MiB |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible (no aplica en el sentido de contexto de texto; el modelo opera con prompt de texto y latentes de imagen) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos bf16; no hay versiones GGUF, fp8 ni int8 en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card indica que se publica en nombre del autor y remite a la licencia del proyecto original o upstream, sin especificarla |
| Formato de pesos | safetensors (bf16), fichero unico `rayArtshoot_krea2NSFW_bf16V4.safetensors` |
| Tamano del repositorio | 26,3 GB |
| Modelo base | `krea2` (finetune declarado; sin enlace ni ficha tecnica del base) |
| Compatibilidad | ComfyUI / RunningHub / Hugging Face |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo unicamente como un `UNET (image edit)` destinado a tareas `image-text-to-image` y afinado a partir de `krea2`. No se especifica si se trata de un transformer de difusion (DiT), de un UNET convolucional clasico o de una arquitectura hibrida, ni se detalla el mecanismo de condicionamiento textual, el VAE asociado, el text encoder requerido o la resolucion nativa de entrenamiento. Tampoco se indica si el checkpoint esta destilado en pocos pasos: el sufijo `turbo` del nombre sugiere una variante orientada a inferencia con pocos pasos de muestreo, pero es una inferencia nominal y no un dato confirmado.

Sobre el entrenamiento solo puede afirmarse lo que aparece en el nombre del fichero: un ajuste fino etiquetado como `V4` y asociado a la cadena `rayArtshoot_krea2NSFW`. No hay informacion sobre numero de imagenes o pares de edicion, composicion del dataset, resolucion, uso de tecnicas como LoRA, DreamBooth, RLHF, DPO o cualquier forma de alineacion, ni sobre la naturaleza exacta del contenido del dataset mas alla de la etiqueta `NSFW`. El autor publica el modelo a traves de RunningHub, una plataforma que ofrece servicios de entrenamiento e inferencia, y enlaza una entrada de blog con el flujo de trabajo y la aplicacion asociados, pero ninguno de esos recursos aporta especificaciones tecnicas en la informacion proporcionada.

## Capacidades

- Edicion de imagen condicionada por texto (pipeline declarado: `image-text-to-image`), es decir, transformacion de una imagen de entrada segun una instruccion textual, en el marco habitual de los UNET de edicion para ComfyUI.
- Generacion o sintesis de imagen dentro del mismo flujo, en la medida en que el pipeline declarado lo permite; el autor no documenta los modos exactos soportados.
- Integracion en ComfyUI mediante carga de UNET, con posibles cadenas de muestreo de pocos pasos si se confirma la naturaleza `turbo` del checkpoint (no verificado).
- Ejecucion en la nube a traves de la API de RunningHub, segun los enlaces de la model card.
- Soporte de tool calling / function calling: no aplica (modelo de imagen, no conversacional).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible; no se declaran idiomas y el comportamiento con prompts en castellano no esta documentado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. La unica capacidad especial inferible del nombre del fichero es el ajuste fino con contenido para adultos, sin confirmacion explicita del autor.

## Casos de uso

- Post-produccion fotografica en estudio: el modelo puede utilizarse como paso de edicion dentro de un flujo de ComfyUI para modificar una fotografia ya capturada (fondo, iluminacion, vestuario) a partir de una instruccion textual, evitando repetir la sesion.
- Retoque de fotografia de producto para comercio electronico: edicion de la imagen original para adaptar encuadre, fondo o presentacion por variante de producto, siempre que exista una imagen de partida y el resultado se valide manualmente.
- Prototipado de arte conceptual: generacion rapida de variaciones visuales sobre un boceto o referencia para explorar direcciones antes de una produccion final.
- Automatizacion de pipelines de contenido grafico: encadenado del UNET dentro de un grafo de ComfyUI que aplique el mismo estilo de edicion a lotes de imagenes, con revision humana posterior.
- Despliegue como servicio gestionado: uso de la API de RunningHub para exponer la edicion de imagen sin necesidad de aprovisionar GPU propia, util en equipos con recursos limitados.
- Experimentacion e investigacion sobre finetunes de la familia krea2: analisis comparativo de checkpoints de la misma base, evaluando calidad de edicion y sensibilidad al prompt en entornos controlados.
- Filtrado y moderacion previa: si el checkpoint esta efectivamente orientado a contenido NSFW, resultaria util como generador de casos de prueba para entrenar o validar clasificadores de contenido en un entorno aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas cuantitativas (FID, CLIP-Score, SSIM, tasa de exito en edicion, evaluaciones humanas) ni comparaciones con otros checkpoints, y tampoco se documentan el numero de pasos de muestreo, el CFG recomendado ni la resolucion de trabajo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 25-30 GB solo para los pesos, mas el consumo adicional de text encoder, VAE y latentes; el orden de magnitud se deriva del tamano del fichero (25.063 MiB), no de una medicion publicada.
- GPU recomendadas: tarjetas con 40 GB o mas de memoria (A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB) para mantener los pesos en memoria sin segmentacion.
- Cabe en GPU de consumo: con 24 GB (RTX 3090, 4090) no cabe completo en bf16; seria necesario offload a RAM o segmentacion de bloques, con la penalizacion de velocidad correspondiente. La cuantizacion a fp8 dejaria el fichero en torno a 13 GB y encajaria en 16-24 GB, pero no se publican pesos cuantizados y esa conversion habria que hacerla uno mismo.
- Opciones de despliegue: ComfyUI (carga de UNET, flujo principal soportado por el autor), API de RunningHub, Hugging Face como origen de descarga. El uso con vLLM, TGI o llama.cpp no aplica a este tipo de modelo; seria esperable un flujo tipo diffusers, aunque no se confirma compatibilidad.
- Latencia y throughput: no disponible. No hay datos de tiempo por imagen, numero de pasos ni rendimiento por GPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye especificaciones tecnicas, licencia ni resultados de rendimiento de `krea2` (modelo base) ni de otros checkpoints de edicion de imagen, por lo que cualquier tabla comparativa de parametros, contexto o calidad seria inventada. Como referencia unicamente de categoria, este modelo pertenece a la familia de UNET de edicion de imagen distribuidas como safetensors para ComfyUI, en la que conviven checkpoints derivados de bases como krea, FLUX o Qwen-Image, pero no se dispone de datos verificables para compararlos con este repositorio.

| Modelo | Parametros | Resolucion / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-krea2-turbo-bf16-xxoo-unet | No disponible (~13.100 millones, estimado) | No disponible | No disponible | Hugging Face y RunningHub |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no especificada: la model card remite a la licencia del proyecto original sin nombrarla. No hay base clara para uso comercial; conviene contactar con el autor o con RunningHub antes de cualquier despliegue en produccion.
- Codigo fuente no disponible: se distribuyen solo pesos (`safetensors`), sin scripts de entrenamiento ni de inferencia, lo que impide auditar el ajuste fino.
- Contenido para adultos: el nombre del fichero incluye `NSFW`, lo que apunta a un entrenamiento con contenido explicito. Existe riesgo de generacion no deseada de material para adultos y de incumplimiento de politicas de plataforma si se expone sin filtros.
- Riesgo de alucinacion visual: como todo modelo de difusion aplicado a edicion, puede introducir artefactos, modificar zonas no solicitadas de la imagen o inventar elementos coherentes pero falsos respecto al original. No debe usarse en contextos donde la fidelidad documental sea critica (pruebas periciales, documentacion medica, identidad de personas) sin revision humana.
- Sesgos: no hay informacion sobre la composicion del dataset ni sobre evaluaciones de sesgo demografico. Es probable que herede los sesgos del modelo base `krea2` y los refuerce con el ajuste fino, especialmente si el dataset era de nicho.
- Idiomas: no se declara soporte de idiomas y el comportamiento con prompts en castellano no esta documentado.
- Requisitos de hardware elevados: 25 GB de pesos en bf16 obligan a GPU profesionales o a tecnicas de offload; no es un checkpoint apto para equipos modestos sin conversion previa.
- Trazabilidad y validacion nulas: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado resultados, y metadatos de fecha (creacion y actualizacion en 2026) que no permiten evaluar mantenimiento ni historial de cambios.
- Sin cuantizaciones oficiales: no se ofrecen versiones GGUF o fp8, lo que traslada al usuario el riesgo de degradacion de calidad si decide cuantizar por su cuenta.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-turbo-bf16-xxoo-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2091170322870517762
- Pagina del autor: https://www.runninghub.ai/user-center/2085048586185814018
- Flujo de trabajo y aplicacion asociados: https://www.runninghub.ai/zh-cn/post/2091335129432535042
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
