# Saurov7287/BFS-Best-Face-Swap

## Resumen

BFS (Best Face Swap) es una coleccion de adaptadores LoRA para edicion de imagenes desarrollada por el usuario Saurov7287 y publicada en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo generativo base, sino de un conjunto de pesos ligeros que se aplican sobre varios modelos de difusion —principalmente Qwen Image 2.1, Qwen Image Edit 2509/2511, FLUX.2 Klein (4B y 9B), Krea 2 y, de forma experimental, LTX-2— para realizar tareas especializadas de sustitucion de caras, cabezas y cuerpos en imagenes.

Su relevancia radica en que resuelve uno de los problemas mas delicados de la edicion por difusion: preservar la identidad facial y la coherencia anatomica al combinar personas de distintas imagenes. En lugar de depender de pipelines fragiles de inpainting o de multiples herramientas, BFS ofrece LoRAs especificos por familia de modelo, con guias de uso, orden de entrada de imagenes y workflows listos para ComfyUI. El repositorio pesa 13,0 GB, se distribuye bajo licencia MIT y ha acumulado 459 descargas desde su publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre modelos de difusion (image-to-image) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de difusion) |
| Tipos de cuantizacion | fp16 y fp32 (variantes merged de Qwen Edit 2511, rank 16 y rank 32) |
| Idiomas soportados | Ingles (prompts y documentacion) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Otros datos del repositorio:

| Parametro | Valor |
|---|---|
| ID en Hugging Face | Saurov7287/BFS-Best-Face-Swap |
| Tamano del repositorio | 13,0 GB |
| Libreria | diffusers |
| Pipeline | image-to-image |
| Modelos base | Qwen/Qwen-Image-2.1, Qwen/Qwen-Image-Edit-2511, black-forest-labs/FLUX.2-klein-4B y 9B (incluidas variantes fp8), krea/Krea-2-Raw |
| Descargas / likes | 459 / 0 |

## Arquitectura y entrenamiento

BFS no es un modelo independiente: es una coleccion de LoRA (Low-Rank Adapters), es decir, matrices de bajo rango que se inyectan en las capas de atencion y de proyeccion de modelos de difusion base para especializarlos en la tarea de intercambio de rostro, cabeza o cuerpo sin reentrenar el modelo completo. Cada familia de LoRA esta vinculada a un modelo base concreto y a un "contrato" de uso propio: orden de entrada de las imagenes de referencia, formato del prompt y workflow de ComfyUI asociado. Por ejemplo, varias versiones de head swap usan deliberadamente el cuerpo como primera entrada y la cara de referencia como segunda.

Los detalles de entrenamiento (numero de pasos, dataset, resolucion) no estan publicados en la model card, aunque los nombres de archivo revelan algunos datos: la variante para FLUX.2 Klein 9B existe en checkpoints de los pasos 3500 (rank 128) y 3750 (rank 64), y las versiones experimentales para LTX-2 son LoRA de in-context training en los pasos 5000, 6000 y 12000 (tercer entrenamiento). Las variantes "merged" para Qwen Image Edit 2511 vienen precombinadas con el modelo base en rank 16/fp16 y rank 32/fp32.

## Capacidades

- Sustitucion de cabeza (head swap): reemplaza la cabeza completa de una persona en una imagen manteniendo la identidad del rostro de referencia.
- Sustitucion de cara (face swap): versiones especificas para Qwen Image Edit 2509.
- Sustitucion de cuerpo (body swap): LoRAs para Qwen Image 2.1 y Krea 2 que transfieren el cuerpo completo.
- Compatibilidad multiplataforma: pesos para Qwen Image 2.1, Qwen Image Edit 2509/2511, FLUX.2 Klein 4B y 9B, Krea 2 y LTX-2 (experimental).
- Integracion con ComfyUI: workflows JSON listos para descargar (por ejemplo, "Head Swap V1 Qwen 2.1 Workflow.json").
- Uso con la libreria diffusers de Hugging Face.
- Control de intensidad: el LoRA admite ajuste de peso (se recomienda empezar en 1.0 y ajustar segun modelo base, resolucion e imagen de referencia).

## Casos de uso

- Postproduccion fotografica de retratos: un estudio puede corregir fotos grupales donde alguien salio con los ojos cerrados sustituyendo la cabeza por otra toma, usando el LoRA de head swap sobre Qwen Image 2.1 y conservando la iluminacion y el fondo originales.
- Creacion de contenido para campañas: agencias pueden generar variaciones de una escena con distintos modelos o poses combinando body swap con la imagen de referencia de una camiseta o un vestuario concreto.
- Storyboards y previsualizacion: equipos de cine o publicidad pueden intercambiar cabezas entre fotos de casting para montar rapidamente composiciones visuales antes de una sesion real.
- Edicion conversacional con Qwen Image Edit: al apoyarse en Qwen Image Edit 2509/2511, se pueden encadenar instrucciones de edicion en lenguaje natural junto con el LoRA de face swap dentro de un mismo workflow.
- Experimentacion con FLUX.2 Klein: quien ya disponga de un pipeline con FLUX.2 Klein 4B u 9B puede anadir la capacidad de head swap sin cambiar de modelo base, aprovechando las variantes fp8 para reducir memoria.
- Prototipado en ComfyUI: los workflows JSON incluidos permiten montar el pipeline completo (modelo base, text encoder, VAE y LoRA) con carga minima de configuracion.
- Investigacion en edicion por difusion: las variantes en distintos ranks (16, 32, 64, 128) y checkpoints son utiles para estudiar como el rango del LoRA afecta a la fidelidad de identidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de LoRAs de edicion de imagen, no aplican metricas tipicas de modelos de lenguaje (MMLU, HumanEval, GSM8K); la evaluacion en este dominio se basa en ejemplos visuales incluidos en el repositorio (imagenes `bfs_qwen_2.1_1.png` a `bfs_qwen_2.1_8.png` para Qwen Image 2.1), que el autor presenta como demostraciones y no como garantia de resultados identicos en todas las imagenes.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra concreta; depende del modelo base elegido. Como referencia general, los modelos base citados (Qwen Image 2.1, FLUX.2 Klein 9B) suelen requerir entre 12 y 24 GB de VRAM en precision completa, y las variantes fp8 de FLUX.2 Klein reducen ese requisito.
- GPU recomendadas: no disponible oficialmente; una RTX 4090 (24 GB) es una opcion razonable para los modelos base de 9B, mientras que variantes 4B o fp8 pueden funcionar en GPUs de consumo de 12-16 GB.
- Cabe en GPU de consumo: probablemente si con los modelos base de 4B y las variantes fp8; no hay confirmacion del autor.
- Despliegue: ComfyUI (workflows JSON incluidos) y libreria diffusers de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles; dependen del modelo base, la resolucion y el numero de pasos de inferencia.

## Comparativa con modelos similares

| Aspecto | BFS (LoRAs) | InstantID | Roop / Rope (face swap clasico) |
|---|---|---|---|
| Tipo | Coleccion de LoRA sobre multiples modelos de difusion | LoRA/adapter sobre SDXL con encoder de identidad | Pipeline dedicado de face swap (no generativo) |
| Modelos base | Qwen Image 2.1/Edit, FLUX.2 Klein, Krea 2, LTX-2 | SDXL | Modelos propios de deteccion e intercambio |
| Tareas | Cara, cabeza y cuerpo | Cara (identity-preserving) | Cara |
| Licencia | MIT | no disponible en esta ficha | Varias segun proyecto |
| Workflows incluidos | Si (ComfyUI JSON) | Si, en la comunidad | Interfaces propias |
| Disponibilidad | Hugging Face, safetensors | Hugging Face | GitHub |

BFS se diferencia de las soluciones clasicas de face swap en que no usa un pipeline de deteccion e intercambio independiente, sino que la sustitucion se realiza dentro del proceso de difusion del modelo base, lo que suele dar mejor coherencia de iluminacion, estilo y anatomia.

## Limitaciones y advertencias

- Riesgo de uso indebido: la sustitucion de rostros es una tecnologia con alto potencial de abuso (deepfakes). El propio autor prohíbe expresamente usar o compartir resultados que impliquen figuras publicas o personas que no hayan dado su consentimiento.
- Resultados no garantizados: los ejemplos del repositorio son demostraciones; los resultados pueden variar segun imagen, resolucion y ajuste de intensidad del LoRA.
- Acoplamiento estricto al modelo base: cada LoRA solo funciona correctamente con su familia de modelos; mezclar familias (modelo, text encoder, VAE y LoRA de distinta procedencia) produce errores o resultados invalidos.
- Orden de entrada no intuitivo: varias versiones usan cuerpo primero y cara de referencia segunda; no seguir la guia de la version concreta degrada los resultados.
- Documentacion fragmentada: hay que consultar la guia especifica de cada version, ya que los contratos de prompt y workflow cambian entre releases.
- Sin metricas publicadas: no hay benchmarks cuantitativos de fidelidad de identidad ni de artefactos, por lo que la evaluacion es cualitativa.
- Soporte experimental: los pesos para LTX-2 son experimentales y pueden no ser estables.
- Licencia: MIT es permisiva para uso comercial, pero la responsabilidad etica y legal del uso de imagenes de terceros recae en el usuario final.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Saurov7287/BFS-Best-Face-Swap
- Guia BFS Head V1/V1.1 para Qwen Image 2.1: https://huggingface.co/Saurov7287/BFS-Best-Face-Swap/blob/main/docs/qwen-image-2.1.md
- Guia body swap para Qwen Image 2.1: https://huggingface.co/Saurov7287/BFS-Best-Face-Swap/blob/main/docs/qwen-image-2.1-body.md
- Guia Qwen Image Edit 2509/2511: https://huggingface.co/Saurov7287/BFS-Best-Face-Swap/blob/main/docs/qwen-image-edit.md
- Guia FLUX.2 Klein: https://huggingface.co/Saurov7287/BFS-Best-Face-Swap/blob/main/docs/flux-2-klein.md
- Guia Krea 2: https://huggingface.co/Saurov7287/BFS-Best-Face-Swap/blob/main/docs/krea-2.md
- Guia experimental LTX-2: https://huggingface.co/Saurov7287/BFS-Best-Face-Swap/blob/main/docs/ltx-2.md
- Modelo base principal: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo base de edicion: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- FLUX.2 Klein: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Krea 2: https://huggingface.co/krea/Krea-2-Raw
