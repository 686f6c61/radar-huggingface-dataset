# Jinstudio/HiDream-I1-Dev

## Resumen

HiDream-I1 es un modelo generativo de imágenes de tipo text-to-image con 17.105.733.184 parámetros (aproximadamente 17,1B), desarrollado por HiDream.ai y publicado en abierto bajo licencia MIT. El repositorio analizado, `Jinstudio/HiDream-I1-Dev`, corresponde a la variante destilada "dev" del modelo, distribuida en formato diffusers y safetensors con un tamano de repositorio de 47,2 GB. La arquitectura se describe en el informe tecnico como un "Sparse Diffusion Transformer" (DiT disperso), una evolucion de los transformers de difusion que incorpora enrutamiento disperso de parametros para reducir el coste computacional de la inferencia.

El modelo resuelve la generacion de imagenes a partir de prompts en lenguaje natural, con un enfasis explicito en dos ejes: calidad visual percibida y seguimiento fiel de instrucciones. Segun la model card, alcanza resultados de estado del arte en HPS v2.1 (preferencia humana), GenEval (seguimiento de prompts) y DPG-Bench (prompts densos), superando a alternativas abiertas como Flux.1-dev, SD3-Medium, CogView4-6B y Janus-Pro-7B en las puntuaciones globales de estas tres suites. La relevancia actual del modelo radica en que combina ese rendimiento con una licencia MIT permisiva, algo poco habitual en modelos de difusion de gran escala, lo que habilita su uso comercial sin las restricciones tipicas de licencias comunitarias o no comerciales.

El pipeline de inferencia depende de un codificador de texto externo: el script oficial descarga automaticamente `meta-llama/Meta-Llama-3.1-8B-Instruct`, lo que anade un componente de 8B parametros al despliegue y una dependencia de licencia adicional. El modelo se distribuye en tres variantes (full, dev y fast), siendo "dev" la variante destilada para inferencia rapida. El repositorio de HuggingFace analizado registra 0 descargas y 0 likes en la fecha de consulta, lo que sugiere una resubida o un espejo de los pesos originales mas que el repositorio canonico del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Diffusion Transformer (DiT disperso) para generacion de imagenes |
| Parametros totales | 17.105.733.184 (aproximadamente 17,1B), segun pesos safetensors |
| Parametros activos | no disponible en la informacion proporcionada (el informe tecnico describe una arquitectura dispersa, pero no se detalla el numero de parametros activos) |
| Longitud de contexto | no disponible; el modelo no define una ventana de contexto propia en la informacion proporcionada. Depende del codificador de texto externo (`meta-llama/Meta-Llama-3.1-8B-Instruct`) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors sin cuantizaciones oficiales documentadas |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria diffusers) |
| Pipeline | text-to-image (`diffusers:HiDreamImagePipeline`) |
| Variantes | full, dev (destilada, este repositorio) y fast (destilada) |
| Tamano del repositorio | 47,2 GB |
| Fecha de publicacion del repositorio | 10 de octubre de 2026, segun metadatos de HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

HiDream-I1 emplea un Sparse Diffusion Transformer, es decir, un transformer de difusion con parametrizacion dispersa. El titulo del informe tecnico ("HiDream-I1: A High-Efficient Image Generative Foundation Model with Sparse Diffusion Transformer", arXiv:2505.22705) confirma ese diseno, orientado a obtener calidad de estado del arte manteniendo un coste de inferencia bajo. La model card no detalla la composicion exacta de los bloques, el numero de expertos ni la estrategia de enrutamiento, por lo que esos datos quedan como no disponibles en la informacion proporcionada. El modelo opera en tres variantes: `full` (modelo completo), `dev` (destilado, el de este repositorio) y `fast` (destilado con menos pasos de inferencia). Los scripts oficiales de inferencia requieren la instalacion de Flash Attention y recomiendan CUDA 12.4.

En cuanto al entrenamiento, la model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Si se documenta que el pipeline de inferencia descarga `meta-llama/Meta-Llama-3.1-8B-Instruct` como codificador de texto, lo que implica un componente de condicionamiento textual de 8B parametros y una dependencia de red durante la primera ejecucion. La innovacion tecnica destacada por los autores es la combinacion de arquitectura dispersa con destilacion (variantes dev y fast), que permite generar imagenes de alta calidad "en segundos" segun la model card, sin que se aporten cifras concretas de latencia o de pasos de muestreo. Existe ademas un modelo derivado orientado a edicion de imagenes por instrucciones, HiDream-E1-Full, publicado el 28 de abril de 2025.

## Capacidades

- Generacion de imagenes text-to-image a partir de prompts en ingles, con calidad orientada a fotorealismo, cartoon, artistico y otros estilos.
- Seguimiento de instrucciones complejas y prompts densos: puntuacion global de 85,89 en DPG-Bench y 0,83 en GenEval, con 1,00 en "Single Obj." y 0,98 en "Two Obj.".
- Atribucion de color y relaciones espaciales entre objetos: 0,72 en "Color attribution" y 0,60 en "Position" en GenEval, por encima de Flux.1-dev y SD3-Medium en atribucion de color.
- Recuento de objetos ("Counting"): 0,79 en GenEval, frente a 0,73 de Flux.1-dev y 0,66 de CogView4-6B.
- Generacion de imagenes con licencia permisiva para uso comercial, segun la propia model card.
- Tres modos de inferencia (full, dev, fast) que permiten intercambiar calidad por velocidad mediante destilacion.
- Integracion nativa con la libreria diffusers a traves de `HiDreamImagePipeline`, y scripts de inferencia y demo Gradio en el repositorio oficial de GitHub.
- Capacidad de edicion de imagen basada en instrucciones en el modelo derivado HiDream-E1-Full (modelo separado, no incluido en este repositorio).
- No se documenta soporte de tool calling, function calling, agentes, vision de entrada, audio ni modo de razonamiento explicito. Son capacidades no aplicables o no disponibles para un modelo de difusion text-to-image.

## Casos de uso

- Generacion de creatividades para marketing y publicidad: el modelo puede producir imagenes finales para campanas a partir de descripciones textuales, y la licencia MIT permite su uso comercial y la redistribucion de las imagenes generadas sin las restricciones de licencias no comerciales habituales en modelos comparables.
- Assets para videojuegos y prototipado visual: conceptual art, ilustracion de personajes y entornos en multiples estilos (fotorealista, cartoon, artistico), con generacion rapida gracias a las variantes destiladas, lo que encaja en iteraciones de preproduccion donde se necesitan decenas de variaciones por concepto.
- Generacion de datasets sinteticos de imagenes: la licencia permisiva y la capacidad de controlar el contenido mediante prompts permiten construir conjuntos de datos etiquetados para entrenar clasificadores o detectores, evitando problemas de derechos sobre imagenes de terceros.
- Diseno de producto y previsualizacion en e-commerce: generacion de imagenes de producto en contextos y estilos variados a partir de descripciones, con buen rendimiento en atributos (89,48 en "Attribute" de DPG-Bench) y en atribucion de color (0,72 en GenEval).
- Ilustracion editorial y narrativa visual: la puntuacion HPS v2.1 de 33,82 y sus 33,74 en "Concept-art" y 33,88 en "Painting" indican buena adecuacion a estilos artisticos y pictoricos para portadas, comics e ilustracion.
- Desarrollo e integracion en pipelines Python: al estar disponible como `HiDreamImagePipeline` en diffusers, puede insertarse en flujos automatizados de generacion por lotes dentro de aplicaciones backend, con control programatico de prompts y parametros de muestreo.
- Investigacion en modelos generativos eficientes: la arquitectura Sparse Diffusion Transformer y sus variantes destiladas lo convierten en una base para estudiar enrutamiento disperso, destilacion de pasos y tecnicas de aceleracion de muestreo en difusion.
- Edicion de imagenes guiada por instrucciones: mediante el modelo complementario HiDream-E1-Full, para tareas de retoque semantico sobre imagenes existentes (no soportado por el repositorio analizado, que es unicamente text-to-image).
- Generacion local con requisitos moderados: las variantes destiladas y el soporte de diffusers permiten despliegues en estaciones de trabajo con GPU unica de gama alta, sin depender de APIs externas de pago por imagen.

## Benchmarks y rendimiento

Los siguientes datos proceden de las tablas de evaluacion incluidas en la model card del autor.

DPG-Bench:

| Modelo | Overall | Global | Entity | Attribute | Relation | Other |
|---|---|---|---|---|---|---|
| PixArt-alpha | 71,11 | 74,97 | 79,32 | 78,60 | 82,57 | 76,96 |
| SDXL | 74,65 | 83,27 | 82,43 | 80,91 | 86,76 | 80,41 |
| DALL-E 3 | 83,50 | 90,97 | 89,61 | 88,39 | 90,58 | 89,83 |
| Flux.1-dev | 83,79 | 85,80 | 86,79 | 89,98 | 90,04 | 89,90 |
| SD3-Medium | 84,08 | 87,90 | 91,01 | 88,83 | 80,70 | 88,68 |
| Janus-Pro-7B | 84,19 | 86,90 | 88,90 | 89,40 | 89,32 | 89,48 |
| CogView4-6B | 85,13 | 83,85 | 90,35 | 91,17 | 91,14 | 87,29 |
| HiDream-I1 | 85,89 | 76,44 | 90,22 | 89,48 | 93,74 | 91,83 |

GenEval:

| Modelo | Overall | Single Obj. | Two Obj. | Counting | Colors | Position | Color attribution |
|---|---|---|---|---|---|---|---|
| SDXL | 0,55 | 0,98 | 0,74 | 0,39 | 0,85 | 0,15 | 0,23 |
| PixArt-alpha | 0,48 | 0,98 | 0,50 | 0,44 | 0,80 | 0,08 | 0,07 |
| Flux.1-dev | 0,66 | 0,98 | 0,79 | 0,73 | 0,77 | 0,22 | 0,45 |
| DALL-E 3 | 0,67 | 0,96 | 0,87 | 0,47 | 0,83 | 0,43 | 0,45 |
| CogView4-6B | 0,73 | 0,99 | 0,86 | 0,66 | 0,79 | 0,48 | 0,58 |
| SD3-Medium | 0,74 | 0,99 | 0,94 | 0,72 | 0,89 | 0,33 | 0,60 |
| Janus-Pro-7B | 0,80 | 0,99 | 0,89 | 0,59 | 0,90 | 0,79 | 0,66 |
| HiDream-I1 | 0,83 | 1,00 | 0,98 | 0,79 | 0,91 | 0,60 | 0,72 |

HPS v2.1:

| Modelo | Averaged | Animation | Concept-art | Painting | Photo |
|---|---|---|---|---|---|
| Stable Diffusion v2.0 | 26,38 | 27,09 | 26,02 | 25,68 | 26,73 |
| Midjourney V6 | 30,29 | 32,02 | 30,29 | 29,74 | 29,10 |
| SDXL | 30,64 | 32,84 | 31,36 | 30,86 | 27,48 |
| DALL-E 3 | 31,44 | 32,39 | 31,09 | 31,18 | 31,09 |
| SD3 | 31,53 | 32,60 | 31,82 | 32,06 | 29,62 |
| Midjourney V5 | 32,33 | 34,05 | 32,47 | 32,24 | 30,56 |
| CogView4-6B | 32,31 | 33,23 | 32,60 | 32,89 | 30,52 |
| Flux.1-dev | 32,47 | 33,87 | 32,27 | 32,62 | 31,11 |
| stable cascade | 32,95 | 34,58 | 33,13 | 33,29 | 30,78 |
| HiDream-I1 | 33,82 | 35,05 | 33,74 | 33,88 | 32,61 |

No se han publicado en la informacion disponible resultados de benchmarks de latencia, throughput ni consumo de memoria, mas alla de la afirmacion cualitativa de la model card de que el modelo genera imagenes "en segundos".

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del numero de parametros y del tamano del repositorio (47,2 GB), no datos oficiales publicados por el autor.

- VRAM estimada en precision de 16 bits: aproximadamente 34 GB solo para los pesos del DiT (17,1B x 2 bytes) y en torno a 16 GB adicionales si el codificador de texto `Meta-Llama-3.1-8B-Instruct` reside tambien en GPU, lo que situa el total en el entorno de los 50 GB de VRAM si se mantienen todos los componentes en memoria de video.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 17 GB para el DiT y 8 GB para el codificador de texto, en torno a 25 GB en total, sin datos oficiales que confirmen cuantizaciones soportadas.
- GPU recomendadas: A100 80 GB, H100 80 GB y GPU profesionales de 48 GB (por ejemplo, RTX 6000 Ada) para ejecucion sin offload en precision completa. En configuraciones de 40 GB o menos es previsible necesitar offload.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en precision de 16 bits con todos los componentes en GPU. Requiere cuantizacion, offload a CPU (`enable_model_cpu_offload` de diffusers) o reparto entre varias GPU.
- Multi-GPU: el reparto del DiT y del codificador de texto entre dos GPU de 24 GB (por ejemplo, 2 x RTX 4090) es una via plausible, aunque no hay documentacion oficial al respecto en la informacion proporcionada.
- Opciones de despliegue: libreria diffusers mediante `HiDreamImagePipeline`, scripts de inferencia oficiales del repositorio `HiDream-ai/HiDream-I1` (modos full, dev y fast), y demo Gradio incluida en el repositorio. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, que en cualquier caso no son aplicables a un modelo de difusion de este tipo.
- Requisitos de software: Flash Attention instalado y, segun la model card, CUDA 12.4 recomendado para instalacion manual.
- Latencia y throughput: no disponibles. La unica referencia es la afirmacion de la model card de generacion "en segundos", sin hardware de referencia ni resolucion indicada.

## Comparativa con modelos similares

| Modelo | Parametros | GenEval (overall) | DPG-Bench (overall) | HPS v2.1 (averaged) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HiDream-I1 (dev) | 17,1B | 0,83 | 85,89 | 33,82 | MIT | Pesos safetensors en HuggingFace (diffusers) |
| Flux.1-dev | 12B | 0,66 | 83,79 | 32,47 | FLUX.1 [dev] Non-Commercial License | Pesos abiertos con restriccion de uso comercial |
| SD3-Medium | 2B | 0,74 | 84,08 | 31,53 | Stability AI Community License | Pesos abiertos con condiciones |
| CogView4-6B | 6B | 0,73 | 85,13 | 32,31 | Apache 2.0 | Pesos abiertos |
| Janus-Pro-7B | 7B | 0,80 | 84,19 | no disponible | MIT (segun su ficha, no verificada en la informacion proporcionada) | Pesos abiertos |
| DALL-E 3 | no disponible (cerrado) | 0,67 | 83,50 | 31,44 | Propietaria | Solo API |

Consideraciones sobre la comparativa:

- HiDream-I1 lidera las tres suites globales entre los modelos con pesos abiertos recogidos en las tablas del autor, con una ventaja de 0,17 puntos en GenEval sobre Flux.1-dev y de 1,51 en HPS v2.1.
- La ventaja de parametros es notable: 17,1B frente a 12B de Flux.1-dev, 7B de Janus-Pro, 6B de CogView4 y 2B de SD3-Medium, lo que implica mayores requisitos de hardware a cambio de mejores puntuaciones.
- En la metrica "Global" de DPG-Bench, HiDream-I1 obtiene 76,44, el valor mas bajo de la tabla, por debajo de SDXL (83,27) y DALL-E 3 (90,97), pese a liderar el "Overall". Es un matiz relevante: el modelo compensa en "Relation" (93,74) y "Other" (91,83) lo que cede en la dimension global.
- En "Position" de GenEval, HiDream-I1 obtiene 0,60, por debajo de Janus-Pro-7B (0,79), lo que indica margen de mejora en el control posicional estricto.
- La licencia MIT es la mas permisiva del grupo y contrasta con la licencia no comercial de Flux.1-dev y con las licencias comunitarias condicionadas de SD3-Medium.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente soporte de ingles (tag `en`). Los prompts en castellano u otros idiomas pueden degradar la calidad y el seguimiento de instrucciones; no hay datos de evaluacion multilingue.
- Sesgos: la model card no publica analisis de sesgos de generacion ni de composicion del dataset. Al no conocer la distribucion de los datos de entrenamiento, no es posible descartar sesgos de representacion (genero, etnia, contextura, cultura) en las imagenes generadas.
- Alucinacion visual: como todo modelo de difusion, puede producir anatomias incorrectas, manos deformes, objetos imposibles o incoherencias entre elementos. No hay evaluacion publicada especifica de fidelidad factual en imagenes.
- Renderizado de texto en imagen: no se aportan resultados de benchmarks de generacion de texto legible (por ejemplo, OCR-based), por lo que no hay evidencia de que el modelo maneje tipografia de forma fiable.
- Rendimiento por debajo de alternativas en dimensiones concretas: puntuacion "Global" de 76,44 en DPG-Bench y 0,60 en "Position" de GenEval, inferiores a varios competidores.
- Dependencia externa: el pipeline descarga automaticamente `meta-llama/Meta-Llama-3.1-8B-Instruct`. Esto implica requisitos de red, aceptacion de la licencia de Llama 3.1 y una carga adicional de 8B parametros en memoria. La licencia MIT del repositorio no cubre necesariamente ese componente de terceros.
- Licencia: MIT para el modelo, lo que permite uso comercial de los pesos y de las imagenes generadas segun la model card. Aun asi, conviene verificar la procedencia de los pesos del repositorio concreto (cuenta `Jinstudio`, 0 descargas y 0 likes en la fecha de consulta), ya que no es el repositorio canonico del proyecto y no hay validacion de la comunidad.
- Model card truncada: el texto de la model card del repositorio analizado se corta en la seccion "License Agreement" ("The Tra..."), por lo que los terminos completos no estan disponibles en la informacion proporcionada.
- Rendimiento en produccion: no hay datos publicados de latencia, throughput, VRAM pico ni comportamiento bajo carga concurrente, lo que dificulta dimensionar un despliegue en produccion sin pruebas propias.
- Ausencia de soporte de cuantizaciones oficiales: no se documentan pesos FP8, GGUF ni INT8 en este repositorio, lo que limita las opciones de despliegue en hardware de gama de consumo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jinstudio/HiDream-I1-Dev
- Informe tecnico (arXiv): https://arxiv.org/abs/2505.22705
- Repositorio oficial en GitHub: https://github.com/HiDream-ai/HiDream-I1
- Repositorio de HiDream-E1 (edicion por instrucciones): https://github.com/HiDream-ai/HiDream-E1
- Demo de HiDream-E1-Full en HuggingFace Spaces: https://huggingface.co/spaces/HiDream-ai/HiDream-E1-Full
- Sitio del producto: https://vivago.ai/
- Flash Attention (dependencia de inferencia): https://github.com/Dao-AILab/flash-attention
- Codificador de texto requerido: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Nota: los resultados de busqueda web devueltos para esta consulta no contienen informacion relacionada con el modelo y no se han utilizado como fuente.
