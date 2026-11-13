# MommyEmily/stable-diffusion-1.5

## Resumen

Stable Diffusion 1.5 es un modelo de difusion texto-a-imagen publicado originalmente por RunwayML en 2022 y distribuido bajo licencia CreativeML OpenRAIL-M. Este repositorio concreto, alojado por el usuario MommyEmily, es un reempaquetado de caracter archivistico de los pesos originales en formato de fichero unico (single-file) pensado para su uso directo en ComfyUI, tras la retirada de la pagina oficial de RunwayML en Hugging Face. No se trata de un fine-tune ni de una variante entrenada por el autor del repositorio, sino de una copia de los pesos originales.

El modelo resuelve el problema de generacion de imagenes a partir de descripciones textuales mediante difusion latente, y su relevancia actual es fundamentalmente historica y de compatibilidad: es la base sobre la que se construyeron miles de fine-tunes, LoRAs y flujos de trabajo de la comunidad. Al estar varias generaciones por detras de los modelos actuales, su interes practico hoy se limita a pruebas de modelos legacy, reproduccion de resultados antiguos y mantenimiento de pipelines existentes.

La informacion disponible no incluye detalles sobre el numero exacto de parametros, la longitud de contexto textual ni los datos de entrenamiento mas alla de lo publicamente conocido del modelo original de 2022. El repositorio ocupa 8,5 GB e incluye tanto los pesos en FP32 como una conversion a FP16, ademas de un checkpoint adicional (`interiordesignsuperm_v2.safetensors`) cuyo origen no se documenta en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (UNet + autoencoder VAE + codificador de texto CLIP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el prompt textual se trunca a 77 tokens en la implementacion estandar de SD 1.5) |
| Tipos de cuantizacion | FP32 y FP16 incluidos en el repositorio; otras cuantizaciones no documentadas |
| Idiomas soportados | en (ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (fichero unico, compatible con ComfyUI) |

## Arquitectura y entrenamiento

Stable Diffusion 1.5 sigue la arquitectura de difusion latente introducida en Stable Diffusion: un autoencoder variational (VAE) que comprime las imagenes a un espacio latente de menor dimension, una UNet que aprende a eliminar ruido en ese espacio latente condicionada por el texto, y un codificador de texto CLIP que transforma el prompt en embeddings. La generacion se realiza mediante muestreo iterativo (por ejemplo, Euler, DPM-Solver o DDIM) sobre el latente, que despues se decodifica con el VAE.

Los detalles concretos del entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. Se sabe que el modelo original es de 2022 y que este repositorio es una re-subida archivistica sin reentrenamiento: la model card indica explicitamente que `v1-5-pruned-emaonly.safetensors` es el modelo original con hash identico al subido por RunwayML, y que `v1-5-pruned-emaonly-fp16.safetensors` es esa misma version convertida a FP16 con una cabecera de metadatos anadida. No hay innovaciones tecnicas adicionales documentadas en este repositorio.

## Capacidades

- Generacion de imagenes a partir de prompts en ingles (texto-a-imagen).
- Generacion condicionada por imagen de entrada (img2img) e inpainting/outpainting mediante los flujos estandar de ComfyUI, aunque no se documenta un checkpoint especifico de inpainting.
- Control de la generacion mediante parametros de muestreo (steps, CFG scale, sampler, seed) y, opcionalmente, mediante LoRAs y ControlNets compatibles con SD 1.5.
- No soporta tool calling ni function calling: es un modelo de difusion, no un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking), ni capacidades de audio, video o agentes.
- Capacidad multilingue limitada: solo se declara ingles; los prompts en otros idiomas suelen degradar el resultado.

## Casos de uso

- Pruebas de regresion de modelos legacy: util para verificar que pipelines antiguos de generacion de imagenes siguen funcionando tras migraciones de infraestructura, ya que los pesos son identicos a los originales de RunwayML.
- Reproduccion de resultados academicos o de articulos de 2022-2023: permite regenerar imagenes con la misma semilla y configuracion empleadas en publicaciones que citan SD 1.5 como baseline.
- Base para fine-tunes y LoRAs historicos: muchos adaptadores de la comunidad se entrenaron sobre SD 1.5, por lo que este checkpoint permite cargarlos y compararlos con variantes mas recientes.
- Prototipado rapido en ComfyUI: al ser un fichero unico que se coloca en `models/checkpoints`, se integra sin conversion previa en flujos de trabajo de nodos para experimentar con muestreo y condicionamiento.
- Docencia y formacion: sirve para explicar el funcionamiento de la difusion latente con un modelo pequeno y bien documentado, sin los requisitos de hardware de modelos mas grandes.
- Generacion de imagenes de baja resolucion para maquetas y wireframes: adecuado cuando se necesita un borrador visual rapido y no se requiere la calidad fotorrealista de modelos actuales.
- Evaluacion comparativa de samplers y schedulers: su tamano reducido permite barrer configuraciones de muestreo con bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en FP16 ocupan aproximadamente 2 GB, por lo que la inferencia cabe en GPUs con 4-6 GB de VRAM; la version FP32 requiere alrededor de 4 GB solo para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 (12 GB) o RTX 4060 (8 GB) permiten generar a 512x512 con holgura. Para lotes grandes o resoluciones mayores, una RTX 4090 o una A100 reducen tiempos, aunque el modelo no las necesita.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 4 GB de VRAM; tambien puede ejecutarse en CPU, con latencias mucho mayores.
- Opciones de despliegue: ComfyUI (formato nativo de este repositorio), Automatic1111/Forge, Diffusers, y conversiones a otros formatos no incluidas aqui.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del sampler, el numero de pasos, la resolucion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stable Diffusion 1.5 (este repo) | no disponible | 77 tokens (estandar) | CreativeML OpenRAIL-M | Hugging Face (repositorio archivistico) |
| Stable Diffusion 2.1 | no disponible | 77 tokens (estandar) | CreativeML OpenRAIL++-M | Hugging Face |
| Stable Diffusion XL | no disponible | 77 tokens (estandar) | CreativeML OpenRAIL++-M | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de 2022: la calidad de generacion esta varias generaciones por detras de los modelos actuales, especialmente en anatomia, texto en imagen y adherencia al prompt.
- Solo soporta ingles de forma fiable; los prompts en castellano u otros idiomas producen resultados degradados.
- Riesgo de sesgos: el dataset de entrenamiento original no esta documentado en esta ficha, pero se sabe que los modelos de esta generacion reproducen sesgos de genero, etnia y profesion presentes en los datos web.
- Riesgo de alucinacion visual: puede generar contenido incoherente o inexacto cuando el prompt es ambiguo o muy detallado.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos descritos en la licencia); es necesario revisar el texto completo antes de desplegar en produccion.
- El repositorio incluye un fichero adicional (`interiordesignsuperm_v2.safetensors`) sin documentacion sobre su procedencia ni su relacion con el modelo original; debe tratarse con cautela.
- El autor del repositorio no es el desarrollador original; se trata de una re-subida, por lo que no hay soporte ni mantenimiento garantizado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere baja validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MommyEmily/stable-diffusion-1.5
- Repositorio original de RunwayML (retirado): https://huggingface.co/runwayml/stable-diffusion-v1-5
- Archivo oficial de Comfy-Org con los pesos originales: https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive
- Pesos originales hash-identicos: https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive/blob/main/v1-5-pruned-emaonly.safetensors
- Conversion a FP16 con metadatos: https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive/blob/main/v1-5-pruned-emaonly-fp16.safetensors
