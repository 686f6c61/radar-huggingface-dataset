# RunningHubAI/rh-line-art-anime-flat-lora

## Resumen

rh-line-art-anime-flat-lora es un adaptador de bajo rango (LoRA) orientado a la edición y generación de imagen con estética de ilustración plana de líneas limpias, publicado por la plataforma RunningHub bajo la cuenta RunningHubAI y atribuido al autor @nnegret. No es un modelo de lenguaje ni un modelo base: es un peso adicional que se carga sobre un modelo de difusión preentrenado (el autor indica que se ha afinado a partir de "krea2") para sesgar el resultado hacia un estilo concreto de line art anime y coloreado plano, sin degradados volumétricos ni brillos 3D.

El repositorio contiene dos ficheros safetensors de 218 MiB cada uno (K2_Anime_Flat_V10_nnegret.safetensors y K2_Anime_Flat_V20_nnegret.safetensors), lo que sitúa el peso total del adaptador en torno a 436 MiB dentro de un repositorio de 0,5 GB. La ficha del autor documenta un flujo de uso muy acotado: palabra de activación en chino "线条动漫", peso LoRA entre 0,6 y 0,9 (0,6 por defecto), CFG fijo en 1, entre 8 y 10 pasos de muestreo (10 como valor óptimo) y el sampler ErSde, con prompts recomendados de 20 a 60 palabras.

Su relevancia práctica es la de un recurso de posprocesado y estilización dentro de pipelines de ComfyUI o de la API en la nube de RunningHub: aporta un acabado de ilustración digital consistente con muy pocos pasos de inferencia, lo que abarata el coste por imagen. El modelo se publicó el 26 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes" en Hugging Face, por lo que no existe validación comunitaria ni benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión base afinado a partir de "krea2" segun el autor; arquitectura interna del adaptador no disponible |
| Parametros totales | no disponible (ficheros safetensors de 218 MiB cada uno; el adaptador no publica recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; la ventana de texto la determina el codificador del modelo base, no disponible) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors, presumiblemente en la precision de entrenamiento |
| Idiomas soportados | no disponible; la palabra de activacion documentada es en chino ("线条动漫") y la model card esta en chino e ingles |
| Licencia | no disponible; la model card indica "Follow the original project or upstream license", con copyright del autor |
| Formato de pesos | safetensors (2 ficheros de 218 MiB: K2_Anime_Flat_V10_nnegret.safetensors y K2_Anime_Flat_V20_nnegret.safetensors) |

Datos adicionales: pipeline declarado `image-text-to-image`, etiquetas `comfyui`, `lora`, `region:us`, tamano del repositorio 0,5 GB, creado y actualizado el 2026-09-26.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del adaptador ni del modelo base mas alla de la indicacion "Finetuned from: krea2". Se trata, por tanto, de un LoRA de estilo: un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base (habitualmente las capas de atencion de los bloques de difusion) para modificar la distribucion de salida sin reentrenar el modelo completo. El tamano reducido de los pesos (218 MiB por version) es coherente con este esquema.

No se han publicado datos sobre el dataset de entrenamiento: ni numero de imagenes, ni resolucion, ni composicion, ni si se aplicaron tecnicas de regularizacion o de captioning automatico. Tampoco se documenta el uso de RLHF, DPO ni de ninguna tecnica de alineacion, algo esperable en un adaptador de estilo visual. La unica informacion tecnica operativa que aporta el autor es la receta de inferencia (peso 0,6-0,9, CFG 1, 8-10 pasos, sampler ErSde), que sugiere un modelo base destilado o de muestreo rapido, dado el CFG de 1 y el bajo numero de pasos.

Existen dos versiones del adaptador (V10 y V20), lo que indica al menos una iteracion de reentrenamiento, pero no se detalla en que se diferencian ni cual se recomienda en cada escenario.

## Capacidades

- Generacion y edicion de imagen a partir de texto e imagen de entrada (pipeline `image-text-to-image`).
- Estilizacion hacia line art anime con coloreado plano: lineas limpias, capas de color definidas y ausencia de degradados volumétricos.
- Supresion de la apariencia 3D o de brillos excesivos cuando se aumenta el peso del LoRA (0,8-0,9) y se anade el termino "平涂" (coloreado plano) al prompt.
- Integracion en flujos de ComfyUI como nodo de carga de LoRA.
- Inferencia rapida: 8-10 pasos con CFG 1 y sampler ErSde.
- Ejecucion en la nube mediante la API y la plataforma de RunningHub, sin necesidad de GPU local.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision analitica, audio ni modo de razonamiento extendido: son capacidades ajenas a un adaptador de difusion.

## Casos de uso

- Produccion de ilustracion editorial y webtoon: el LoRA permite generar paneles con linea y coloreado planos coherentes con un estilo de comic, manteniendo la paleta bajo control con pesos de 0,6 a 0,8 y prompts de 20 a 60 palabras.
- Conversión de bocetos o fotos a estilo anime plano: mediante el pipeline image-text-to-image, se puede partir de una imagen de referencia y aplicar el estilo como paso de posprocesado, util para adaptar material grafico existente a un lenguaje visual unico.
- Generacion por lotes de assets para videojuegos o apps: al requerir solo 8-10 pasos de muestreo y CFG 1, el coste por imagen es bajo, lo que hace viable producir cientos de iconos, retratos o ilustraciones de ambientacion en una sola tanda de ComfyUI.
- Ilustracion para merchandising y print-on-demand: el estilo de lineas limpias y colores planos se reproduce bien en camisetas, laminas y pegatinas, donde los degradados y texturas fotorrealistas complican la impresion.
- Creacion de contenido para redes sociales: el flujo de 10 pasos permite iterar rapidamente sobre variaciones de una misma escena (personaje, encuadre, atmosfera) hasta obtener la composicion deseada.
- Estilizacion dentro de un servicio en la nube: desplegando el LoRA mediante la API de RunningHub se puede ofrecer la conversion a estilo "线条动漫" como funcionalidad de un producto, sin mantener infraestructura de GPU propia.
- Previsualizacion de conceptos para direccion de arte: generar referencias de estilo rapidas y consistentes antes de encargar la ilustracion final a un artista humano.
- Construccion de un estilo de marca propio: combinando este LoRA con otros adaptadores y con un prompt fijo, se puede fijar un acabado visual reconocible para toda la produccion grafica de un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud estetica ni comparativas cuantitativas) ni evaluaciones humanas. Tampoco hay datos de rendimiento medidos (imagenes por segundo, latencia) mas alla de la receta de inferencia recomendada (10 pasos, CFG 1, sampler ErSde).

## Requisitos de hardware

- El adaptador en si ocupa 218 MiB por fichero, por lo que el almacenamiento no es un factor limitante.
- Los requisitos de VRAM dependen por completo del modelo base ("krea2" segun el autor) y de su cuantizacion; no disponible en la informacion proporcionada.
- No se especifica que GPU consumer puedan ejecutarlo. De forma general, un adaptador LoRA de este tipo se carga sobre el modelo base ya instanciado en memoria, por lo que el cuello de botella es el modelo base, no el LoRA.
- Opciones de despliegue documentadas: ComfyUI (local o en servidor), la plataforma RunningHub y la API de RunningHub, ademas del repositorio de Hugging Face para descarga de los pesos.
- No se han publicado datos de latencia ni de throughput. El unico indicador indirecto es la recomendacion de 8-10 pasos de muestreo con CFG 1, que reduce el coste computacional frente a configuraciones tipicas de 20-30 pasos con CFG superior.
- El adaptador esta tambien disponible para su uso en la nube, lo que evita requisitos de hardware local si se acepta depender de un servicio externo.

## Comparativa con modelos similares

No se dispone de datos verificables sobre alternativas comparables dentro de la informacion proporcionada. La comparativa requiere datos de rendimiento, licencia y modelo base que no se han publicado. A modo de marco de evaluacion, los criterios que deberian compararse son los siguientes:

| Criterio | rh-line-art-anime-flat-lora | Alternativas |
|---|---|---|
| Tipo | LoRA de estilo sobre modelo base de difusion | no disponible |
| Parametros | no disponible (218 MiB por fichero) | no disponible |
| Contexto | no aplica (modelo de imagen) | no disponible |
| Rendimiento | sin benchmarks publicados | no disponible |
| Licencia | no disponible (remite a la licencia del proyecto original) | no disponible |
| Disponibilidad | Hugging Face, ComfyUI, plataforma y API de RunningHub | no disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks y de validacion comunitaria: 0 descargas y 0 "likes" en el momento de redactar la ficha, sin evaluaciones independientes conocidas.
- Licencia sin concretar: la model card remite a la licencia del proyecto original o del modelo base, lo que impide determinar si el uso comercial esta permitido. Es un bloqueo potencial para produccion.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; hay que disponer de "krea2" o del modelo base correspondiente, cuyas condiciones de licencia y requisitos de hardware tambien aplican.
- Dependencia de la palabra de activacion en chino ("线条动漫"): los prompts que no la incluyan pueden no activar el estilo, y el comportamiento con prompts integramente en castellano no esta documentado.
- Sensibilidad al peso del LoRA: valores bajos producen una estetica con exceso de brillo y volumen (aspecto 3D), y el autor recomienda subir a 0,8-0,9 y anadir "平涂" para corregirlo, lo que implica ajuste manual por tanda.
- Dilucion del estilo con prompts largos: el autor recomienda limitarse a 20-60 palabras.
- Riesgo de sesgo estetico y de representacion: al ser un LoRA de estilo entrenado sobre un dataset no documentado, puede reproducir de forma sistematica convenciones de genero, edad, etnia o tipo de cuerpo propias de su conjunto de entrenamiento, sin que exista informacion para auditarlo.
- Riesgo de alucinacion visual: como cualquier modelo generativo, puede producir anatomia incorrecta (manos, ojos, perspectivas), incoherencias en el coloreado plano y texto ilegible dentro de la imagen.
- Sin informacion sobre resolucion nativa de entrenamiento, lo que puede provocar degradacion de detalles en tamanos alejados del rango optimo.
- Dos versiones (V10 y V20) sin changelog: no se documenta cual conviene usar ni si V20 sustituye a V10.
- El repositorio incluye enlaces de promocion y de formacion de modelos del proveedor; conviene revisar las condiciones de uso antes de integrar la API en un producto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-line-art-anime-flat-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2071686978487279618
- Perfil del autor en RunningHub: https://www.runninghub.cn/user-center/1934317192743657474
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Pagina de apoyo al autor: https://www.ifdian.net/a/nnegret
- README en chino: README_cn.md (dentro del propio repositorio)
