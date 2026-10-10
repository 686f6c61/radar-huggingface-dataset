# Jinstudio/HiDream-I1-Full

## Resumen

HiDream-I1-Full es un modelo generativo de imagen de tipo texto-a-imagen desarrollado por HiDream.ai, publicado bajo licencia MIT. Se trata de un modelo fundacional de aproximadamente 17.100 millones de parametros (17.105.733.184 segun los pesos en safetensors) construido sobre una arquitectura de Diffusion Transformer disperso (Sparse Diffusion Transformer), disenada para maximizar la eficiencia computacional sin sacrificar calidad. La ficha que nos ocupa corresponde al repositorio `Jinstudio/HiDream-I1-Full`, un espejo del modelo original `HiDream-ai/HiDream-I1-Full`; el modelo y su autoria pertenecen a HiDream.ai.

El modelo resuelve el problema de la generacion de imagenes de alta fidelidad a partir de descripciones textuales, con un enfasis declarado en el seguimiento preciso de instrucciones y en la calidad estetica. Segun su model card, alcanza resultados de estado del arte en los benchmarks GenEval (0.83 global), DPG-Bench (85.89 global) y HPSv2.1, superando a alternativas open source como Flux.1-dev, SD3-Medium, CogView4-6B o Janus-Pro-7B, y compitiendo con modelos cerrados como DALL-E 3 o Midjourney.

Su relevancia actual reside en tres factores: la publicacion bajo licencia MIT (uso comercial permitido sobre las imagenes generadas), la disponibilidad de pesos abiertos con soporte nativo en la libreria `diffusers` a traves de `HiDreamImagePipeline`, y la existencia de variantes destiladas (dev y fast) que reducen el coste de inferencia. El repositorio ocupa 47,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer disperso (Sparse Diffusion Transformer / DiT); usa `meta-llama/Meta-Llama-3.1-8B-Instruct` como codificador de texto |
| Parametros totales | 17.105.733.184 (~17,1 mil millones) |
| Parametros activos | no disponible (arquitectura dispersa, pero no se detalla el numero de parametros activos) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica contexto autoregresivo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `diffusers`) |

## Arquitectura y entrenamiento

HiDream-I1 se basa en un Diffusion Transformer disperso, una variante de transformer para difusion que introduce mecanismos de dispersion para reducir el coste computacional manteniendo la capacidad del modelo. Segun el titulo del informe tecnico (arXiv:2505.22705, "HiDream-I1: A High-Efficient Image Generative Foundation Model with Sparse Diffusion Transformer"), la eficiencia es un pilar de diseno central. El pipeline combina el transformer de difusion con el modelo de lenguaje `meta-llama/Meta-Llama-3.1-8B-Instruct` como codificador de texto; el script de inferencia descarga automaticamente dichos pesos, lo que implica que el coste total de inferencia incluye tambien este componente de 8.000 millones de parametros.

Respecto a los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO), no se proporciona informacion detallada en el material disponible; el informe tecnico referenciado seria la fuente para esos detalles. El modelo se distribuye en tres variantes: `full` (el modelo completo, objeto de esta ficha), `dev` (destilado) y `fast` (destilado, orientado a baja latencia), lo que sugiere un proceso de destilacion por etapas para las versiones reducidas.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) de alta fidelidad, con 17,1 mil millones de parametros.
- Estilos multiples: fotorealismo, dibujo animado (cartoon), artistico y otros, segun la model card.
- Seguimiento de instrucciones (prompt following) de primer nivel, con resultados lideres declarados en GenEval y DPG-Bench entre los modelos open source.
- Alta puntuacion en alineacion con preferencias humanas (HPSv2.1).
- Licencia permisiva para uso comercial de las imagenes generadas.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no; el modelo declara unicamente ingles (`language: en`).
- Capacidades especiales: variantes destiladas `dev` y `fast` para reducir el coste de inferencia; pipeline oficial en `diffusers` (`HiDreamImagePipeline`); demo Gradio incluida; modelos relacionados de edicion de imagen por instrucciones (HiDream-E1-Full y HiDream-E1.1).

## Casos de uso

- Generacion de material grafico para marketing: creacion de ilustraciones y banners a partir de descripciones textuales, aprovechando el alto seguimiento de prompt para respetar indicaciones de composicion, color y numero de objetos.
- Ilustracion editorial y conceptual: generacion de imagenes artisticas o conceptuales en estilos variados (pintura, concept-art) para portadas, articulos o guiones.
- Prototipado rapido de diseno de producto: iteracion de bocetos visuales con prompts detallados antes de pasar a produccion, beneficiandose de la puntuacion en atributos y relaciones de DPG-Bench.
- Creacion de contenido para videojuegos: generacion de assets de estilo cartoon o artistico de forma masiva, con licencia MIT que permite su uso comercial.
- Investigacion en generacion de imagen: uso del modelo como baseline abierto y reproducible, con pesos en safetensors y soporte en `diffusers` para experimentacion.
- Automatizacion de generacion de imagenes en pipelines internos: integracion via `HiDreamImagePipeline` dentro de servicios que produzcan imagenes bajo demanda.
- Aplicaciones educativas y de divulgacion: generacion de ilustraciones didacticas a partir de descripciones textuales, con la ventaja de una licencia permisiva.
- Edicion de imagen por instrucciones (mediante los modelos relacionados de la familia, como HiDream-E1-Full o HiDream-E1.1), no con este modelo directamente.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor.

DPG-Bench (Overall y subpuntuaciones):

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

HPSv2.1 (puntuacion media y por categoria; la tabla de origen esta truncada en la informacion disponible):

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

El valor de HiDream-I1 en HPSv2.1 no aparece completo en la informacion proporcionada (la tabla esta cortada).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como calculo orientativo a partir del numero de parametros, en bf16/fp16 los pesos del transformer de difusion ocuparian del orden de 34 GB, a los que hay que sumar el codificador de texto `Meta-Llama-3.1-8B-Instruct` (unos 16 GB adicionales en bf16), lo que situa el requisito conjunto en torno a 50 GB de VRAM. Es una estimacion, no un dato publicado.
- GPU recomendadas: GPU de centro de datos con 48 GB o mas (A100 80 GB, H100, etc.) para ejecutar el modelo completo en bf16/fp16. La informacion no especifica configuraciones validadas.
- Compatibilidad con GPU de consumo: no cabe en GPU de consumo de 24 GB (RTX 4090, RTX 5090) sin cuantizacion, dado el tamano del modelo y del codificador de texto. No se documentan tipos de cuantizacion en la informacion disponible.
- Opciones de despliegue: `diffusers` mediante `HiDreamImagePipeline`; scripts de inferencia propios del repositorio (`inference.py --model_type full|dev|fast`) y demo Gradio (`gradio_demo.py`). Se recomienda Flash Attention y CUDA 12.4 para la instalacion manual. No se documenta soporte en vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. La model card afirma que el modelo alcanza calidad de estado del arte "en segundos", pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Tipo | GenEval (Overall) | DPG-Bench (Overall) | Idiomas |
|---|---|---|---|---|---|---|
| HiDream-I1 | ~17,1 B | MIT | DiT disperso | 0,83 | 85,89 | en |
| Flux.1-dev | no disponible en la informacion | no disponible en la informacion | Diffusion Transformer | 0,66 | 83,79 | no disponible |
| SD3-Medium | no disponible en la informacion | no disponible en la informacion | Diffusion Transformer | 0,74 | 84,08 | no disponible |
| CogView4-6B | 6 B | no disponible en la informacion | Diffusion Transformer | 0,73 | 85,13 | no disponible |
| Janus-Pro-7B | 7 B | no disponible en la informacion | Multimodal | 0,80 | 84,19 | no disponible |
| DALL-E 3 | no disponible | propietaria (cerrado) | Diffusion | 0,67 | 83,50 | no disponible |

## Limitaciones y advertencias

- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir elementos incoherentes, anatomia incorrecta o texto ilegible dentro de las imagenes; no se documentan tasas de fallo.
- Idiomas: solo se declara soporte de ingles (`language: en`). Los prompts en otros idiomas, incluido el castellano, pueden degradar el seguimiento de instrucciones.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion proporcionada.
- Repositorio espejo: la ficha corresponde a `Jinstudio/HiDream-I1-Full`, no al repositorio oficial de HiDream.ai. Conviene verificar la integridad de los pesos frente al original antes de usarlos en produccion.
- Metadatos del repositorio: el repositorio muestra 0 descargas y 0 "likes", lo que sugiere que es una copia reciente y no la fuente principal de distribucion.
- Licencia: MIT permite uso comercial de las imagenes generadas, segun la model card. No obstante, el pipeline depende de `meta-llama/Meta-Llama-3.1-8B-Instruct` como codificador de texto, cuyos terminos de licencia son independientes y deben revisarse por separado.
- Requisitos de memoria elevados: el modelo completo exige una GPU de 48-80 GB en bf16/fp16, lo que limita su despliegue en hardware de consumo.
- Dependencia de Flash Attention y CUDA 12.4: puede complicar la reproducibilidad en entornos con versiones distintas.
- Sin datos publicados sobre cuantizacion: no se documentan formatos GGUF ni variantes cuantizadas listas para usar.

## Enlaces

- HuggingFace (repo de esta ficha): https://huggingface.co/Jinstudio/HiDream-I1-Full
- Modelo original de HiDream.ai: https://huggingface.co/HiDream-ai/HiDream-I1-Full
- Informe tecnico (arXiv:2505.22705): https://arxiv.org/abs/2505.22705
- Repositorio GitHub: https://github.com/HiDream-ai/HiDream-I1
- Modelo de edicion HiDream-E1-Full: https://github.com/HiDream-ai/HiDream-E1
- Demo de edicion HiDream-E1-Full: https://huggingface.co/spaces/HiDream-ai/HiDream-E1-Full
- HiDream-E1.1 (edicion de imagen actualizada): https://huggingface.co/HiDream-ai/HiDream-E1-1
- Producto comercial relacionado: https://vivago.ai/
- Flash Attention: https://github.com/Dao-AILab/flash-attention
- Codificador de texto: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
