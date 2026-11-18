# MicksHF/Qwen-Image-2.1-Anime-Fusal

## Resumen

Qwen-Image-2.1-Anime-Fusal es un adaptador LoRA para los modelos de difusion Qwen-Image-2.1 y Qwen-Image-2.1-Turbo, desarrollado por el usuario MicksHF y publicado en Hugging Face. Su proposito es especializar el modelo base en la generacion de ilustracion anime mediante un ajuste fino sobre aproximadamente 50.000 registros de entrenamiento (texto-imagen y condicionados por referencia) seleccionados manualmente por el autor a partir de un conjunto mayor de candidatos. El repositorio incluye dos familias de LoRA distintas, una para cada checkpoint base, y un codificador de texto BF16 Heretic.

El modelo resuelve el problema de la deriva estilistica del modelo base hacia resultados fotorealistas o genericos cuando se le pide ilustracion anime: aplicando el adaptador con una fuerza de 0,7 a 1,0 sobre el modelo base correspondiente, la salida adopta un estilo de ilustracion consistente. La relevancia actual reside en que se apoya en la familia Qwen-Image-2.1, con capacidad de generacion texto-imagen, imagen-imagen y multi-referencia, y en que el adaptador se distribuye en formato compatible con diffusers y ComfyUI.

El repositorio ocupa 34 GB e incluye pesos del adaptador, el text encoder y ejemplos de comparacion. La licencia es `qwen-research` (marcada como `other`), lo que restringe el uso a investigacion y a personas adultas segun la propia model card. No se dispone de datos publicos sobre el numero de parametros del adaptador ni sobre el contexto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen-Image-2.1 / Qwen-Image-2.1-Turbo |
| Parametros totales | no disponible (adaptador LoRA; el tamano del repo es de 34,0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen aparentemente en BF16; el autor menciona un text encoder BF16 Heretic) |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | qwen-research (campo `license: other`, `license_name: qwen-research`) |
| Formato de pesos | diffusers (repositorio con `library_name: diffusers`); compatible con ComfyUI |

## Arquitectura y entrenamiento

El adaptador se implementa como LoRA sobre un modelo de difusion de la familia Qwen-Image-2.1, que no se describe en detalle en la informacion disponible (no se especifica si el backbone es un transformer de difusion con atencion completa o alguna variante hibrida). El autor publica dos familias de adaptadores: una para el checkpoint original `Qwen/Qwen-Image-2.1` (denominada "Exact R80") y otra para `Qwen/Qwen-Image-2.1-Turbo` (denominada "Turbo E6 Preview R128"), que segun la model card sigue en entrenamiento y se considera solo una vista previa. Ambas no son intercambiables ni deben apilarse.

El entrenamiento se realizo sobre aproximadamente 50.000 registros de texto-imagen y condicionados por referencia, seleccionados manualmente por el autor de un pool mayor, con el objetivo declarado de adaptacion de dominio visual mas que de expansion de conocimiento. El autor indica que entreno con cache de embeddings de prompt y de referencia usando el text encoder BF16 Heretic incluido en el repositorio. No se detalla el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO, que en modelos de difusion no son el mecanismo habitual.

## Capacidades

- Generacion texto-imagen con estilo de ilustracion anime, mediante el formato de prompt estructurado que exige el adaptador (`fusal style.` seguido de secciones `[TASK: ...]`, `[Subject]`, `[Appearance]`, `[Pose]`, `[Composition]`, `[Environment]`, `[Lighting]` y `[Style]`).
- Generacion imagen-imagen y condicionada por referencia multiple (multi-reference), segun los tags y los ejemplos del repositorio (`Fusal-R2I.png`).
- Control de fuerza del adaptador entre 0,0 (modelo base) y 1,0 (estilo FUSAL pleno), con valor de partida recomendado de 0,7.
- Compatibilidad con el ecosistema diffusers y con ComfyUI.
- Integracion con el checkpoint Turbo para generacion en 8 pasos fijos, y con el checkpoint original para 20-40 pasos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio; el modelo es exclusivamente generativo de imagen.

## Casos de uso

- Ilustracion de personajes para proyectos de animacion o manga: el adaptador aplica un estilo anime consistente sobre el modelo base, por lo que se puede usar para generar hojas de personaje y variaciones de pose manteniendo la identidad visual mediante referencias.
- Generacion de key art y portadas: con el checkpoint original a 25 pasos y fuerza 0,7-1,0 se obtienen composiciones de alta resolucion (los ejemplos del autor usan 2400 x 1792) adecuadas para portadas o ilustraciones promocionales.
- Prototipado rapido de escenas con el checkpoint Turbo: el adaptador Turbo, fijado a 8 pasos, permite iterar bocetos de composicion a bajo coste computacional antes de pasar a la version original.
- Consistencia de personaje entre imagenes: la capacidad multi-referencia del modelo base, combinada con el adaptador, permite mantener el diseno de un personaje a traves de varias ilustraciones usando imagenes de referencia.
- Creacion de assets para videojuegos de estilo anime: generacion de retratos, iconos y arte conceptual con un estilo homogeneo, integrable en pipelines de ComfyUI para produccion por lotes.
- Investigacion sobre adaptacion de dominio en modelos de difusion: el repositorio publica comparaciones controladas (mismos prompts, semillas y ajustes, variando solo la fuerza del LoRA) y los prompts originales, lo que facilita reproducir experimentos sobre especializacion estilistica.
- Exploracion creativa en un Space publico: el autor mantiene un playground en Hugging Face Spaces con los ajustes por defecto, util para evaluar el estilo antes de desplegar localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la informacion disponible. El autor proporciona comparaciones visuales controladas entre el modelo base (fuerza LoRA 0,0) y el adaptador (fuerza 1,0) con prompts, semillas y ajustes identicos, pero no cifras numericas. La propia model card advierte que son comparaciones controladas y no una afirmacion de superioridad universal.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio pesa 34 GB e incluye el adaptador y el text encoder BF16; el modelo base Qwen-Image-2.1 debe cargarse adicionalmente.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del repositorio y la resolucion de los ejemplos (2400 x 1792), se requiere una GPU de gama alta con memoria abundante; no se confirman modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. El adaptador Turbo a 8 pasos reduce el coste de muestreo, pero no se documenta si cabe en GPUs de consumo como la RTX 4090.
- Opciones de despliegue: diffusers y ComfyUI (segun los tags y la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-Anime-Fusal (este) | LoRA sobre Qwen-Image-2.1 / Turbo | no disponible (repo de 34 GB) | no disponible | qwen-research | Hugging Face, diffusers, ComfyUI |
| Qwen/Qwen-Image-2.1 (base) | Modelo de difusion texto-imagen | no disponible | no disponible | qwen-research (segun el adaptador) | Hugging Face |
| Qwen/Qwen-Image-2.1-Turbo (base) | Modelo de difusion texto-imagen, 8 pasos | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos base en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Licencia `qwen-research`: restringe el uso. La model card indica explicitamente "for adults and research use only", lo que limita el uso comercial y exige revisar el archivo LICENSE del repositorio antes de cualquier despliegue en produccion.
- Los dos adaptadores no son intercambiables: cargar el LoRA del modelo original sobre Turbo (o viceversa) o apilar ambos produce resultados incorrectos.
- El adaptador Turbo E6 Preview R128 esta aun en entrenamiento y se publica como vista previa, no como version estable; su calidad puede cambiar entre actualizaciones.
- El adaptador exige un formato de prompt estructurado; el uso con instrucciones libres de estilo chat puede degradar la calidad del resultado.
- Riesgo de sobreajuste estilistico: al ser una adaptacion de dominio con unos 50.000 registros, puede reducir la diversidad de estilos frente al modelo base; el propio autor advierte que algunos prompts y estilos pueden favorecer al base.
- No se documentan sesgos especificos, pero al tratarse de un modelo entrenado sobre ilustracion anime seleccionada manualmente, es probable que herede sesgos de representacion del corpus; no hay evaluacion publicada al respecto.
- Riesgo de alucinacion visual (artefactos, anatomia incorrecta, texto ilegible en la imagen) inherente a los modelos de difusion; no se han publicado metricas que lo cuantifiquen.
- Los ajustes de muestreo son especificos: fuerza de LoRA 0,7-1,0, CFG/true CFG en 1,0, 25 pasos para el modelo original y 8 pasos fijos para Turbo; desviarse de estos valores puede empeorar el resultado.
- No hay informacion sobre el rendimiento multilingue de los prompts ni sobre el soporte de idiomas distintos del ingles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MicksHF/Qwen-Image-2.1-Anime-Fusal
- Space de demostracion (playground): https://huggingface.co/spaces/MicksHF/Qwen-Image-2.1-Anime-Fusal-Playground
- Modelo base original: https://huggingface.co/Qwen/Qwen-Image-2.1
- Modelo base Turbo: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Imagenes de comparacion a resolucion completa: https://huggingface.co/MicksHF/Qwen-Image-2.1-Anime-Fusal/tree/main/images/comparison-originals
- Prompts de comparacion: https://huggingface.co/MicksHF/Qwen-Image-2.1-Anime-Fusal/tree/main/prompts/comparison
- Ajustes de inferencia en formato legible por maquina: https://huggingface.co/MicksHF/Qwen-Image-2.1-Anime-Fusal/blob/main/prompts/comparison/parameters.json
