# RunningHubAI/rh-tina-krea2-turbo-bf16high-definition-portrait-enhancement-unet

## Resumen

rh-tina-krea2-turbo-bf16high-definition-portrait-enhancement-unet es un modelo de difusion de tipo UNET para edicion y generacion de imagen a partir de texto e imagen (pipeline `image-text-to-image`), publicado por RunningHubAI para el autor identificado como @aigc_w en la plataforma RunningHub. Se trata de un ajuste fino derivado de Krea2, concretamente de la variante turbo en precision bfloat16, y esta empaquetado como pesos UNET sueltos para cargarse en ComfyUI, en la propia plataforma RunningHub o desde Hugging Face.

Su proposito declarado es la mejora de retratos de alta definicion: el autor indica que la variante turbo-bf16 ofrece una textura visual mas nitida y un comportamiento mas estable en figuras humanas, estructuras de objetos y detalle local, con mejor restitucion de piel, rasgos faciales, mechones de pelo y texturas de ropa. Esta orientado a iteracion rapida, generacion por lotes y entornos con recursos limitados, con unos parametros de muestreo recomendados de sampler Euler, 8 pasos y CFG 1 en bf16.

El modelo es relevante como ejemplo del ecosistema de pesos sueltos para ComfyUI: no se distribuye como pipeline completo, sino como un unico archivo de pesos UNET de 25063 MiB dentro de un repositorio de 26,3 GB. La ficha publica no incluye numero de parametros, licencia explicita, idiomas soportados ni resultados de benchmarks, por lo que buena parte de las especificaciones quedan sin confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion (modelo de imagen tipo edit/text-to-image); variante turbo en bfloat16, ajustada a partir de Krea2 |
| Parametros totales | No disponible. Estimacion indirecta: el archivo en bf16 ocupa 25063 MiB, lo que corresponde a unos 12,5 mil millones de parametros (calculo a partir del tamano del archivo, no confirmado por el autor) |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No aplica; el modelo es de generacion de imagen, no de texto |
| Tipos de cuantizacion | No disponible. El repositorio solo distribuye pesos en bf16 (`krea2AIGCWv2.safetensors`); no se listan versiones GGUF, FP8 ni int8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card indica que los derechos siguen siendo del autor y que debe seguirse la licencia del proyecto original o del proyecto upstream (Krea2) |
| Formato de pesos | safetensors (un unico archivo UNET) |
| Tamano del repositorio | 26,3 GB (archivo de pesos: 25063 MiB) |
| Tipo de pipeline | image-text-to-image |
| Plataformas de ejecucion | ComfyUI, RunningHub, Hugging Face |
| Parametros de muestreo recomendados | Sampler Euler, 8 pasos, CFG 1, precision bf16 |

## Arquitectura y entrenamiento

La informacion disponible describe un UNET de difusion en precision bfloat16 perteneciente a la serie Krea2, en su variante turbo. El autor no detalla el numero de bloques, el tipo de atencion ni la dimension del espacio latente. Tampoco se especifica que codificador de texto ni que VAE acompanan al UNET, algo relevante porque estos pesos se distribuyen sueltos y requieren el resto del pipeline para funcionar.

En cuanto al entrenamiento, la unica informacion proporcionada es que el modelo esta ajustado a partir de Krea2 (`Finetuned from: krea2`) y que se ha entrenado e infiere en bfloat16. No se indica el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste por preferencias humanas (RLHF/DPO) o de destilacion por destilacion de pasos. La etiqueta "turbo" y los 8 pasos con CFG 1 recomendados son consistentes con un modelo destilado para inferencia rapida, pero esto no se confirma explicitamente en la documentacion. Tampoco hay informacion sobre tecnicas de decodificacion especulativa ni de atencion lineal.

El unico dato tecnico adicional es el propio artefacto: un unico archivo `krea2AIGCWv2.safetensors` de 25063 MiB cuyo proposito declarado son los pesos UNET.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con prompts en lenguaje natural que describan sujeto, estilo, iluminacion, composicion y detalle.
- Edicion o transformacion de imagen de entrada guiada por texto, segun la etiqueta de pipeline `image-text-to-image` y el tipo declarado "UNET (image edit)".
- Mejora de retratos: restitucion de piel, rasgos faciales, mechones de cabello y texturas de ropa, segun la descripcion del autor.
- Generacion de imagenes de producto, escenas y diseno conceptual.
- Inferencia rapida: disenado para 8 pasos de muestreo con CFG 1, lo que favorece la iteracion y la generacion por lotes.
- Integracion como nodo de UNET dentro de flujos de ComfyUI y como modelo alojado en la plataforma RunningHub.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Retoque y mejora de retratos en estudio: se carga el UNET en ComfyUI junto con el resto del pipeline Krea2 y se usa con sampler Euler, 8 pasos y CFG 1 para rehacer piel, pelo y texturas de ropa en fotografias de personas, aprovechando que la variante turbo esta ajustada especificamente para detalle facial y de piel.
- Generacion por lotes para catalogos de producto: los 8 pasos y el CFG bajo reducen el coste por imagen, de modo que el modelo encaja en pipelines que producen cientos de variaciones de un mismo producto con distintos fondos, luces y encuadres.
- Iteracion de direccion de arte en diseno conceptual: al ser un modelo turbo, permite generar varias decenas de bocetos por prompt en pocos minutos y seleccionar direcciones visuales antes de pasar a una fase de mayor calidad con el modelo estandar.
- Previsualizacion rapida en produccion audiovisual: generacion de keyframes y referencias de vestuario, atrezzo o localizaciones para discutir con el equipo antes del rodaje.
- Creacion de avatares y retratos para entornos con recursos limitados: el autor indica que la variante esta pensada para entornos con recursos restringidos, por lo que puede desplegarse en una unica GPU de gama alta con offloading parcial en lugar de un cluster.
- Integracion en flujos de trabajo personalizados de ComfyUI: al distribuirse como pesos UNET sueltos, se puede insertar en grafos propios con control de composicion, inpainting o img2img, combinando el UNET con distintos VAE y codificadores.
- Servicio de generacion de imagenes por API: la plataforma RunningHub ofrece despliegue y API, por lo que el modelo puede exponerse como endpoint para aplicaciones que necesiten retratos o visuales bajo demanda sin gestionar la infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, evaluaciones humanas, comparativas de velocidad medidas) ni referencias a evaluaciones independientes. Las afirmaciones de calidad de la documentacion son cualitativas y provienen del propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el UNET en bf16 ocupa 25063 MiB (unos 24,5 GiB), por lo que se necesitan aproximadamente 26-30 GB de VRAM contando el resto del pipeline (codificador de texto, VAE y buffers de activaciones). Estimacion propia a partir del tamano del archivo; el autor no publica cifras.
- GPU recomendadas para ejecucion completa en bf16 sin offloading: A100 40 GB, H100 80 GB, RTX 6000 Ada 48 GB y, con margen ajustado, RTX 5090 32 GB.
- GPU de consumo: no cabe con holgura en tarjetas de 24 GB (RTX 4090, RTX 3090) en bf16 completo. En esas tarjetas es necesario usar offloading a RAM o cuantizacion a FP8/int8, lo que no esta documentado por el autor.
- Opciones de despliegue: ComfyUI (formato nativo de carga del UNET), plataforma RunningHub (nube y API), y en Hugging Face solo como repositorio de pesos. No se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp, que no aplican a un modelo de difusion de imagen de este tipo.
- Latencia y throughput: no disponibles. Cabe esperar tiempos bajos por imagen al usar 8 pasos con CFG 1, pero no se publican mediciones concretas.

## Comparativa con modelos similares

La comparacion se ve limitada porque no hay benchmarks publicados de este modelo. Los datos de las alternativas corresponden a informacion publica general, no a la documentacion facilitada.

| Modelo | Parametros | Contexto / resolucion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-tina-krea2-turbo-bf16... (este modelo) | No disponible; estimado en ~12,5 mil millones a partir del archivo bf16 | No disponible | UNET turbo de 8 pasos, ajustado a Krea2, orientado a retrato y detalle realista | No disponible; remite al proyecto original | Pesos sueltos en safetensors, 26,3 GB, en ComfyUI/RunningHub |
| Krea2 (version estandar) | No disponible | No disponible | Version no turbo de la misma serie, con mas pasos de muestreo | La del proyecto Krea2 | Segun el proyecto original |
| FLUX.1-dev | 12 mil millones (dato publico) | No aplica contexto de texto | Transformer de difusion con destilacion de guidance; muy usado para realismo y retrato | No comercial (dato publico) | Pesos abiertos ampliamente desplegados en ComfyUI |
| SDXL | ~2,6 mil millones en el U-Net (dato publico) | Resolucion base 1024 px | U-Net de difusion clasico, ecosistema maduro de LoRAs y control | OpenRAIL++ (dato publico) | Pesos abiertos, amplio soporte en ComfyUI y Automatic1111 |

Frente a SDXL, este modelo parte de un tamano de archivo mucho mayor y de una receta turbo de pocos pasos; frente a FLUX.1-dev, el tamano estimado es parecido, pero no hay datos que permitan comparar calidad. No se dispone de comparativas objetivas con ninguno de ellos.

## Limitaciones y advertencias

- Licencia no disponible: la model card no especifica terminos. Se remite a la licencia del proyecto original (Krea2), por lo que el uso comercial no puede darse por supuesto sin comprobar antes las condiciones upstream.
- Ausencia de benchmarks: no hay metricas publicadas que respalden las afirmaciones de calidad del autor.
- Modelo sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica que no existe retroalimentacion independiente sobre su comportamiento real.
- Riesgo de artefactos: como cualquier modelo de difusion orientado a realismo, puede producir deformaciones en manos, dientes, orejas y simetria facial, especialmente si se aumentan los pasos de muestreo por encima de los 8 recomendados o si se sube el CFG.
- Sesgos conocidos: no hay documentacion sobre sesgos de representacion demografica. Los modelos de retrato realista tienden a sobrerrepresentar ciertos tonos de piel, edades y canon de belleza en funcion de sus datos de entrenamiento; el autor no declara nada al respecto.
- Dependencia de prompt: la documentacion recomienda prompts explicitos con sujeto, estilo, luz, composicion y detalle, y advierte de que no conviene subir los pasos ni el CFG, lo que limita el margen de ajuste fino del usuario.
- Idioma de los prompts: no se declara soporte multilingue; la model card solo esta en ingles y chino, y no se especifica con que codificador de texto se ha entrenado.
- Dependencias no incluidas: el repositorio solo contiene el UNET. Sin el VAE y el codificador de texto correctos no se puede ejecutar, y el autor no documenta que componentes son compatibles ni con que version de Krea2.
- Huella de descarga elevada: 26,3 GB de repositorio y 25063 MiB de un unico archivo de pesos, poco practico para entornos con ancho de banda o almacenamiento limitados.
- Incoherencia en las fechas: las marcas de creacion y actualizacion (27 de septiembre de 2026) son posteriores a la fecha habitual de publicacion, lo que sugiere un error de metadatos o de plataforma.
- Contenido generado: al no documentarse filtros de seguridad ni clasificadores de contenido, la responsabilidad sobre el material generado recae en quien despliega el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-tina-krea2-turbo-bf16high-definition-portrait-enhancement-unet
- README en chino: https://huggingface.co/RunningHubAI/rh-tina-krea2-turbo-bf16high-definition-portrait-enhancement-unet/blob/main/README_cn.md
- Pagina original del modelo en RunningHub: https://www.runninghub.ai/model/public/2084139498234417154
- Ficha del mismo modelo en el sitio italiano de RunningHub: https://www.runninghub.ai/it/model/public/2084139498234417154
- Pipeline de mejora de retrato Krea2 Turbo: https://www.runninghub.ai/ai-detail/2075248739173879809
- Plataforma RunningHub: https://www.runninghub.ai
- Sitio de RunningHub en China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1955120569499906049
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
