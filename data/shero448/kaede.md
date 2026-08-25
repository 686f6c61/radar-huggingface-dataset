# Shero448/kaede

## Resumen
El modelo `Shero448/kaede` es un adaptador LoRA para generación de imágenes, diseñado para ser utilizado con el modelo base `John6666/prefect-illustrious-xl-v15-sdxl`, una variante de SDXL. Está orientado a la generación de ilustraciones de personajes anime en blanco y negro, con características físicas específicas. El adaptador se distribuye a través del ecosistema de la librería `diffusers` y su tamaño de repositorio es de 0.2 GB.

El modelo se centra en un caso de uso muy concreto: la creación de imágenes de un personaje femenino con rasgos definidos, como coletas, cinta para el pelo y pecho prominente, en estilo monocromo. Su relevancia radica en la creciente comunidad de generación de arte anime con modelos de difusión, donde los LoRA permiten ajustar un modelo base sin necesidad de entrenar un modelo completo. La información pública sobre el modelo es muy escasa, limitándose a la *model card* y algunos ejemplos de salida.

La ficha técnica se ha elaborado con la información disponible en la página de Hugging Face y en los resultados de la búsqueda web. Muchos de los datos técnicos no están disponibles públicamente, por lo que se indicarán explícitamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre base SDXL |
| Parametros totales | no disponible (repo de 0.2 GB) |
| Parametros activos | no disponible (solo aplicable a MoE) |
| Longitud de contexto | no disponible (no aplica a texto-imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en ingles en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (inferido por la libreria diffusers) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre el modelo base `John6666/prefect-illustrious-xl-v15-sdxl`, una variante de SDXL (Stable Diffusion XL). SDXL es un modelo de difusion latente de gran escala que utiliza una arquitectura de transformer para la denoizacion de latentes. El adaptador LoRA modifica los pesos del modelo base para producir el estilo y personaje deseado. No hay informacion publica sobre los datos de entrenamiento, el numero de pasos, el tipo de optimizador o si se utilizaron tecnicas de RLHF/DPO. La ausencia de esta informacion es comun en los LoRA publicados por la comunidad, que a menudo se entrenan con datasets especificos y no documentados.

## Capacidades

- Generacion de imagenes en blanco y negro (monocromo, escala de grises) de un personaje femenino anime.
- Generacion de imagenes con rasgos especificos: cola de caballo, cinta de pelo, cabello largo, pecho prominente.
- El modelo funciona con prompts en ingles que activan el estilo mediante las palabras de activacion (trigger words) enumeradas en la model card.
- No se ha informado de soporte para tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de generacion de imagenes, no de texto.
- Las capacidades multilingues no se aplican en este tipo de modelo; los prompts se procesan con el CLIP text encoder del modelo base, que funciona mejor con ingles.

## Casos de uso

- Creacion de ilustraciones anime en blanco y negro: el modelo es adecuado para generar imagenes de personajes en un estilo monocromo, comun en manga y doujinshi. Se puede usar con prompts como `1girl, solo, mm, monochrome, greyscale, ponytail, hair ribbon, long hair, huge breasts`.
- Desarrollo de personajes para proyectos personales: artistas y aficionados pueden usar el LoRA para generar rapidamente bocetos de un personaje concreto para sus proyectos, ahorrando tiempo en el dibujo inicial.
- Generacion de variaciones de un personaje: al cambiar el prompt y el seed, se pueden obtener multiples variaciones de la misma personaje, util para explorar disenos de personajes o para crear portafolios.
- Integracion en pipelines de arte digital: los modelos LoRA se integran facilmente en herramientas como ComfyUI o Automatic1111, permitiendo a los usuarios combinar este LoRA con otros para crear estilos unicos.
- Prototipado de ilustraciones para publicaciones: para creadores de contenido que necesitan imagenes de apoyo para blogs o redes sociales, el modelo puede generar imagenes de forma rapida y gratuita.
- Uso educativo: en el ambito de la ensenanza de la generacion de imagenes con IA, este modelo sirve como ejemplo de como un LoRA ajusta el estilo de un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se conocen datos sobre el rendimiento del modelo en tareas como FID o CLIP score.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero como un LoRA sobre SDXL, se puede ejecutar en GPUs con al menos 6-8 GB de VRAM si se usa con un modelo base cuantizado. SDXL completo requiere alrededor de 10-12 GB de VRAM en FP16.
- **GPU recomendadas**: cualquier GPU moderna con 8 GB o mas de VRAM (NVIDIA RTX 2060, 3060, 4060, etc.) puede ejecutar el modelo. GPUs de datacenter como A100 o H100 no son necesarias para este tipo de carga de trabajo.
- **Cabe en consumer GPU**: si, en GPUs de gama media y alta.
- **Opciones de despliegue**: se puede usar con la libreria `diffusers` de Hugging Face, o con herramientas de interfaz grafica como Automatic1111, ComfyUI o InvokeAI. Tambien es compatible con `vLLM` para inferencia de alto rendimiento.
- **Latencia y throughput**: no disponible, depende del hardware y de la configuracion del modelo base.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables. Dado que es un LoRA especifico para un personaje, no existen alternativas publicadas que se pueda comparar directamente. Sin embargo, se puede considerar que cualquier LoRA para SDXL con un estilo anime podria ser alternativo, pero no hay datos de rendimiento para comparar.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo esta entrenado para generar un tipo de cuerpo y estetica muy concreta, lo que puede perpetuar estereotipos de belleza.
- **Riesgo de alucinacion**: como todo modelo de generacion de imagenes, puede generar manos, ojos o proporciones de forma incorrecta, aunque el modelo base SDXL suele ser bastante robusto.
- **Limitaciones de contexto o idioma**: los prompts deben estar en ingles para obtener los mejores resultados. No se ha probado con otros idiomas.
- **Restricciones de licencia**: la licencia no esta disponible. No se recomienda el uso comercial sin verificar la licencia del modelo base (`John6666/prefect-illustrious-xl-v15-sdxl`) y de los datos de entrenamiento.
- **Caveat para produccion**: el modelo es una adaptacion de bajo nivel y no se ha documentado su entrenamiento, por lo que su comportamiento en entornos de produccion no esta garantizado. Es recomendable hacer pruebas exhaustivas antes de desplegarlo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Shero448/kaede)
- [Modelo base en Hugging Face](https://huggingface.co/John6666/prefect-illustrious-xl-v15-sdxl)
- [Modelo relacionado: Shero448/kanae](https://huggingface.co/Shero448/kanae)
- [Modelo relacionado: Shero448/kanae_illu_new_version](https://huggingface.co/Shero448/kanae_illu_new_version)
- [PixAI: kaede - AI Art Model](https://pixai.art/en/model/1856408978258204692)
- [PixAI: kaede - AI Art Model (variante)](https://pixai.art/model/1876883069614658849)
- [SeaArt: Kawaii Goddess: Kaede](https://www.seaart.ai/models/detail/ca5a2b6fc4d4358a886b408f231f5e4b)
