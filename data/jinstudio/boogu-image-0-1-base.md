# Jinstudio/Boogu-Image-0.1-Base

## Resumen

Boogu-Image-0.1-Base es un modelo de difusion texto-a-imagen publicado en HuggingFace bajo el identificador `Jinstudio/Boogu-Image-0.1-Base`. Forma parte de la familia Boogu-Image-0.1, que incluye las variantes Base, Turbo, Edit y Edit-Turbo, y que se distribuye con licencia Apache-2.0. El modelo se integra en el ecosistema Diffusers mediante el pipeline `BooguImagePipeline` y esta orientado a generacion de imagenes de alta calidad a partir de indicaciones de texto, con soporte especifico para el renderizado de texto en chino e ingles.

El proyecto se presenta como un estudio empirico sobre generacion multimodal abierta con un presupuesto de computo minimo. Segun la model card, el equipo entrenó la familia con un volumen de datos aproximadamente un orden de magnitud inferior al de otros modelos abiertos comparables, y sostiene que mejoras sistematicas en la capacidad de comprension, la calidad de los datos y el pipeline de entrenamiento permiten compensar esa menor escala. El informe tecnico esta disponible en arXiv (2607.13125).

El checkpoint cuenta con 10.292.556.288 parametros (unos 10,29 mil millones) y el repositorio ocupa 38,5 GB. Es relevante ahora porque ofrece una alternativa completamente abierta, con licencia permisiva y con soporte de despliegue en vLLM-Omni y en backends NPU, en un momento en el que los sistemas de generacion y edicion de imagen de mayor rendimiento (Nano Banana Pro, GPT-Image-2) son de codigo cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; modelo de difusion texto-a-imagen integrado en Diffusers mediante `BooguImagePipeline` |
| Parametros totales | 10.292.556.288 (aprox. 10,29 mil millones) |
| Parametros activos | no aplica (no se describe una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible / no aplica (modelo de difusion texto-a-imagen; no se especifica limite de tokens para la indicacion de texto) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors y no se documentan variantes cuantizadas |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `diffusers`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (si se trata de un transformer de difusion, de una U-Net o de una variante hibrida), ni el numero de pasos de muestreo del checkpoint Base. Lo unico confirmado es que se trata de un modelo de difusion texto-a-imagen expuesto a traves del pipeline `BooguImagePipeline` de la libreria Diffusers, con pesos en formato safetensors y 10,29 mil millones de parametros. La familia completa abarca cuatro variantes: Base, Turbo (destilada para generacion rapida), Edit (edicion de imagen) y Edit-Turbo (edicion destilada en cuatro pasos).

En cuanto al entrenamiento, la model card indica que el equipo trabaja con un presupuesto de computo muy limitado en comparacion con los sistemas cerrados y que el volumen de datos de entrenamiento es aproximadamente un orden de magnitud menor que el de algunos modelos abiertos existentes. La tesis del proyecto es que mejoras sistematicas en la comprension multimodal, la calidad del dataset y el pipeline de entrenamiento pueden compensar parcialmente esa desventaja de escala. No se especifican en la informacion proporcionada el numero exacto de tokens o pares imagen-texto, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de indicaciones de texto (text-to-image) de alta calidad.
- Renderizado de texto dentro de la imagen en chino e ingles, una capacidad poco frecuente en modelos abiertos de esta categoria.
- La familia incluye variantes especializadas en edicion de imagen (Edit y Edit-Turbo), aunque este repositorio concreto corresponde al checkpoint Base de texto-a-imagen.
- Variante Turbo con destilacion para inferencia rapida, segun la model card de la familia.
- Soporte de despliegue en servidores de inferencia mediante vLLM-Omni y en backend NPU a traves de una rama especifica.
- El informe tecnico se enmarca en la generacion multimodal abierta con componentes agénticos, si bien no se documenta en la informacion disponible ninguna interfaz de tool calling o function calling para este checkpoint.
- No se documentan capacidades de vision, audio ni modos de razonamiento explicito (thinking) para este repositorio.

## Casos de uso

- Ilustracion y arte digital: el modelo genera imagenes completas a partir de descripciones textuales, lo que permite a estudios pequeños y artistas individuales producir material grafico sin depender de servicios de pago.
- Carteleria y material promocional bilingue: gracias al renderizado de texto en chino e ingles, es adecuado para crear posters, banners y anuncios que requieren tipografia legible integrada en la imagen.
- Marketing y contenido para redes sociales: permite generar variaciones de una misma creatividad cambiando la indicacion de texto, util para pruebas A/B de campañas.
- Prototipado de interfaces y conceptos de producto: se pueden generar mockups y escenas conceptuales antes de invertir en fotografia o modelado 3D.
- Contenido para videojuegos y editorial: generacion de arte conceptual, ilustraciones de ambientacion o portadas, con licencia Apache-2.0 que facilita su uso en productos comerciales.
- Pipelines de generacion por lotes en produccion: al integrarse en Diffusers y en vLLM-Omni, puede desplegarse como servicio interno que atienda peticiones concurrentes de generacion de imagenes.
- Investigacion en generacion multimodal con recursos limitados: sirve como punto de partida reproducible para estudiar como la calidad de datos y del pipeline compensan un presupuesto de entrenamiento reducido.
- Flujos de edicion de imagen (mediante las variantes Edit/Edit-Turbo de la familia): retoque, eliminacion de objetos o modificaciones guiadas por texto sobre una imagen existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: en torno a 21 GB solo para los pesos (10,29 mil millones de parametros x 2 bytes), mas el consumo adicional de los codificadores de texto y del VAE.
- VRAM estimada en precision de 32 bits: en torno a 41 GB solo para los pesos, coherente con un repositorio de 38,5 GB si se distribuye en ese formato o en una mezcla de precisiones.
- GPU recomendadas para despliegue sin compromisos: A100 (40 o 80 GB), H100, L40S o similares con 40 GB o mas de memoria.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar el modelo en bf16/fp16 con margen ajustado; en tarjetas de 12-16 GB (RTX 4080, 4070 Ti, 3080 Ti) seria necesario recurrir a offload de CPU o a cuantizacion, con la consiguiente penalizacion de latencia.
- Opciones de despliegue documentadas: Diffusers (`BooguImagePipeline`), servidor de inferencia vLLM-Omni (existe una receta oficial para Boogu-Image en el repositorio de vLLM-Omni) y backend NPU mediante la rama `npu` del repositorio del proyecto.
- No se documentan integraciones con llama.cpp u Ollama para este modelo, ni formatos GGUF.
- Latencia y throughput: no disponible. La model card menciona que la variante Turbo esta destilada para inferencia rapida, pero no se aportan cifras de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

La model card no proporciona comparativas cuantitativas con otros modelos abiertos. Las unicas referencias cualitativas que menciona son sistemas cerrados de comprension y generacion multimodal (Nano Banana Pro y GPT-Image-2), que el equipo cita como ejemplo de sistema unificado de capacidades y no como punto de comparacion medido.

| Modelo | Parametros | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|
| Boogu-Image-0.1-Base | 10,29 mil millones | Apache-2.0 | Pesos abiertos en HuggingFace | — |
| Boogu-Image-0.1-Turbo | no disponible | Apache-2.0 | Pesos abiertos (variante destilada) | no disponible |
| Boogu-Image-0.1-Edit / Edit-Turbo | no disponible | Apache-2.0 | Pesos abiertos (edicion de imagen) | no disponible |
| Nano Banana Pro | no disponible | codigo cerrado | servicio propietario | no disponible |
| GPT-Image-2 | no disponible | codigo cerrado | servicio propietario | no disponible |

No se dispone de datos de rendimiento, contexto ni benchmarks de modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Proyecto de investigacion: la propia model card advierte de que Boogu-Image-0.1 es un proyecto de investigacion y no un lanzamiento oficial de modelo, lo que implica que la estabilidad y el soporte pueden ser limitados.
- Aviso antifraude: el equipo declara no ofrecer ninguna API de pago, suscripcion ni servicio comercial bajo el nombre Boogu-Image, y advierte de que cualquier producto de pago con ese nombre o variantes similares no esta afiliado al proyecto.
- Discrepancia de identificador: el repositorio consultado esta publicado bajo la organizacion `Jinstudio`, mientras que la model card y los enlaces oficiales apuntan a la organizacion `Boogu`. Conviene verificar la procedencia antes de usarlo en produccion.
- Idiomas: el modelo esta etiquetado unicamente para ingles y chino, por lo que el renderizado de texto en castellano u otros idiomas no esta garantizado.
- Riesgo de artefactos y errores de renderizado: los modelos de difusion de texto tienden a producir tipografia deformada o incoherente, especialmente en indicaciones largas o idiomas no representados en el entrenamiento; la model card reconoce ademas problemas de calidad en versiones previas de la variante Edit-Turbo, corregidos mediante revisiones de hotfix.
- Sesgos: no se documenta ningun analisis de sesgos demograficos, culturales o de representacion en la informacion disponible; es previsible que el modelo refleje los sesgos del corpus de imagenes utilizado, cuyo contenido y composicion no se detallan.
- Presupuesto de datos reducido: el entrenamiento se realizo con un volumen de datos aproximadamente un orden de magnitud menor que el de otros modelos abiertos, lo que puede traducirse en menor cobertura de conceptos poco frecuentes.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia; no se imponen restricciones adicionales conocidas.
- Ausencia de benchmarks publicados: no es posible estimar de forma objetiva la calidad frente a alternativas sin evaluacion propia.

## Enlaces

- HuggingFace: https://huggingface.co/Jinstudio/Boogu-Image-0.1-Base
- Informe tecnico (arXiv): https://arxiv.org/abs/2607.13125
- Pagina del proyecto: https://boogu.org
- Organizacion en HuggingFace: https://huggingface.co/Boogu
- Repositorio en GitHub: https://github.com/boogu-project/Boogu-Image
- ModelScope: https://modelscope.cn/organization/Boogu
- Galeria: https://boogu-gallery.netlify.app/
- Demo Base: http://demo-base.boogu.org/
- Demo Edit: http://demo-edit.boogu.org/
- Demo Turbo: http://demo-turbo.boogu.org/
- Demo Edit Turbo 1K: https://demo-edit-turbo-1k.boogu.org/
- Demo Edit Turbo 1.5K: https://demo-edit-turbo-1k5.boogu.org/
- Receta de vLLM-Omni para Boogu-Image: https://github.com/vllm-project/vllm-omni/blob/main/recipes/Boogu/Boogu-Image.md
- Revision hotfix de Edit-Turbo 1K: https://huggingface.co/Boogu/Boogu-Image-0.1-Edit-Turbo/tree/hotfix-1k-20260708
- Revision hotfix de Edit-Turbo 1.5K: https://huggingface.co/Boogu/Boogu-Image-0.1-Edit-Turbo/tree/hotfix-1k5-20260708
- Revision hotfix de Turbo: https://huggingface.co/Boogu/Boogu-Image-0.1-Turbo/tree/hotfix-20260625
