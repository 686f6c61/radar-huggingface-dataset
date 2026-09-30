# RunningHubAI/rh-zimage-turbo-030-10000-lora

## Resumen

rh-zimage-turbo-030-10000-lora es un adaptador LoRA de generacion de imagen texto-a-imagen (text-to-image) publicado por RunningHubAI sobre el modelo base Z-Image-Turbo de Tongyi-MAI, la familia de difusion de 6B parametros de Alibaba. El adaptador ha sido afinado para producir un estilo concreto de retrato femenino (denominado en la model card como «Beautiful Girl 030 Pure Girl»), por lo que no es un modelo autonomo sino un complemento que se carga junto al modelo base para sesgar su salida hacia esa estetica.

El repositorio contiene un unico archivo safetensors de 76 MiB con los pesos del LoRA, lo que lo hace muy ligero y facil de integrar en flujos de ComfyUI o en el entorno de RunningHub. Al ser un LoRA, su funcionamiento depende por completo del modelo base: no define arquitectura propia ni tiene contexto de texto independiente, y hereda las capacidades y limitaciones de Z-Image-Turbo (generacion fotorrealista, renderizado bilingue chino-ingles y 8 NFE por defecto).

La relevancia de esta ficha es, sobre todo, documental y de advertencia: el repositorio tiene 0 descargas y 0 likes, la licencia no esta declarada de forma explicita y la model card remite al proyecto original. Antes de usarlo en produccion conviene verificar los terminos de licencia del modelo base y la procedencia de los datos de entrenamiento, ausentes por completo en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (Low-Rank Adaptation) sobre el modelo de difusion text-to-image Z-Image-Turbo |
| Parametros totales | No disponible con exactitud; el archivo de pesos LoRA ocupa 76 MiB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (generacion de imagen); la longitud del prompt depende del codificador de texto del modelo base |
| Tipos de cuantizacion | No disponible; se distribuye en safetensors |
| Idiomas soportados | No disponible para este LoRA; el modelo base Z-Image-Turbo soporta chino e ingles |
| Licencia | No disponible; el autor remite a la licencia del proyecto original o del modelo base |
| Formato de pesos | safetensors (76 MiB) |

## Arquitectura y entrenamiento

El componente distribuido aqui es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenarlo por completo. El modelo base declarado es Z-Image-Turbo, la variante destilada de la familia Z-Image de Tongyi-MAI: 6B parametros, 8 NFE (Number of Function Evaluations) y capacidad de inferencia inferior al segundo en GPUs H800. El LoRA, por su tamano (76 MiB), apenas anade peso y no altera la arquitectura subyacente.

El entrenamiento se realizo en la plataforma RunningHub, segun indica la propia model card. El nombre del archivo, «Zimage Turbo-美女030-清纯少女-10000», apunta a un conjunto de datos orientado a un estilo concreto de figura femenina y el sufijo «10000» sugiere pasos de entrenamiento, aunque esto no se confirma en la documentacion. No se detalla el numero de imagenes, la composicion del dataset, el rango del LoRA, la tasa de aprendizaje ni si hubo tecnicas de regularizacion o RLHF/DPO; toda esa informacion esta ausente.

## Capacidades

- Generacion de imagenes texto-a-imagen sesgada hacia un estilo de retrato femenino concreto, heredando el pipeline de Z-Image-Turbo.
- Renderizado de texto bilingue chino-ingles cuando se usa sobre el modelo base (capacidad atribuida a Z-Image-Turbo, no especifica del LoRA).
- Integracion en flujos de ComfyUI mediante carga del adaptador junto al modelo base.
- Compatibilidad con el pipeline text-to-image de Hugging Face y con la plataforma RunningHub.
- No dispone de tool calling ni function calling (no aplica a un modelo de difusion de imagen).
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo «thinking», vision de entrada ni procesamiento de audio.

## Casos de uso

- Generacion de retratos femeninos con estetica concreta: el LoRA sesga la salida del modelo base hacia un estilo de «chica pura», util para producir un conjunto coherente de imagenes con identidad visual consistente.
- Ilustracion para contenido editorial o redes: se puede generar una bateria de imagenes de un mismo estilo sin reentrenar el modelo base, reduciendo coste computacional.
- Creacion de avatares y personajes ficticios: al fijar un estilo, permite mantener coherencia entre distintas poses y encuadres del mismo tipo de personaje.
- Prototipado rapido en ComfyUI: al ser un archivo de 76 MiB, se carga y descarga en segundos dentro de grafos que ya usen Z-Image-Turbo, lo que facilita comparar variantes de estilo.
- Pruebas de concepto de estilo en pipelines de difusion: sirve para evaluar si un estilo LoRA concreto encaja antes de invertir en un fine-tune completo.
- Demostraciones y material de marketing dentro de RunningHub: la plataforma permite ejecutar el modelo en linea sin infraestructura local, util para validar resultados antes de desplegarlo.
- Generacion por lotes de imagenes de catalogo o moodboards: con el modelo base cabe en 16 GB de VRAM, por lo que un solo equipo de gama alta puede producir lotes grandes con este estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros LoRA o modelos. El unico dato de rendimiento indirecto es el del modelo base Z-Image-Turbo, que segun su documentacion alcanza inferencia inferior al segundo en GPUs H800 con 8 NFE, pero no se aportan cifras para este adaptador concreto.

## Requisitos de hardware

- El adaptador LoRA ocupa 76 MiB, por lo que su impacto en VRAM es practicamente despreciable frente al modelo base.
- El modelo base Z-Image-Turbo (6B) cabe, segun su documentacion, dentro de 16 GB de VRAM.
- GPU recomendadas: H800 o A100/H100 para la latencia sub-segundo prometida por el modelo base; RTX 4090 (24 GB) y RTX 4080 (16 GB) para uso en estacion de trabajo.
- Cabe en GPUs de consumo de gama alta con al menos 16 GB de VRAM; por debajo de ese umbral no hay datos que confirmen su funcionamiento.
- Opciones de despliegue: ComfyUI (formato nativo del repositorio), plataforma RunningHub y, con el modelo base, pipelines de diffusers en Hugging Face.
- No se han publicado datos de latencia ni de throughput especificos para este LoRA; la referencia disponible es la del modelo base (inferencia inferior al segundo en H800 con 8 pasos).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-zimage-turbo-030-10000-lora (este) | LoRA sobre Z-Image-Turbo | Base de 6B; LoRA de 76 MiB | safetensors | No disponible | Hugging Face / RunningHub |
| Z-Image-Turbo (Tongyi-MAI) | Modelo base text-to-image | 6B | No disponible en la informacion | No disponible en la informacion | Hugging Face / GitHub |
| rh-cyberrealistic-z-image-turbo-unet | UNet afinado sobre Z-Image-Turbo | Base de 6B | No disponible | No disponible | Hugging Face |
| Zimage Turbo 无滤真实 V2 | LoRA de estilo sobre la familia Z-Image | No disponible | No disponible | No disponible | RunningHub |

Los modelos comparables pertenecen al mismo ecosistema Z-Image, por lo que las diferencias se reducen al estilo objetivo y al metodo de afinado (LoRA frente a UNet completo). No hay datos publicos de rendimiento que permitan ordenarlos cuantitativamente.

## Limitaciones y advertencias

- La licencia no esta declarada de forma explicita; la model card remite a la licencia del proyecto original o del modelo base, lo que genera incertidumbre legal para uso comercial.
- No se documenta el dataset de entrenamiento, por lo que se desconoce si las imagenes usadas tenian consentimiento o derechos adecuados.
- Sesgo de representacion: al ser un LoRA de estilo orientado a un tipo concreto de figura femenina, reproduce y probablemente amplifica los sesgos esteticos, etnicos y de genero de sus datos de entrenamiento.
- Riesgo de artefactos de generacion tipicos de la difusion (manos, ojos o texto mal formados), que el LoRA no corrige y puede acentuar en estilos muy marcados.
- El LoRA no puede usarse de forma autonoma: requiere cargar el modelo base Z-Image-Turbo, cuyos requisitos y licencia condicionan su uso.
- No hay informacion sobre el rango del LoRA, la tasa de aprendizaje ni el numero exacto de pasos, lo que dificulta reproducir o ajustar el entrenamiento.
- Adopcion practicamente nula (0 descargas y 0 likes en el momento de redactar la ficha), sin validacion por parte de la comunidad.
- El campo «contexto» y las capacidades conversacionales no aplican; cualquier expectativa de uso como modelo de lenguaje es erronea.
- Se desconoce el comportamiento en resoluciones distintas a las del modelo base y no se aportan ejemplos de prompt recomendados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-zimage-turbo-030-10000-lora
- Modelo base Z-Image-Turbo (Tongyi-MAI): https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Repositorio GitHub de Z-Image: https://github.com/Tongyi-MAI/Z-Image
- Pagina original del modelo en RunningHub: https://www.runninghub.ai/model/public/2081056244365844482
- Perfil del autor en RunningHub: https://www.runninghub.ai/user-center/2064710712105979905
- Plataforma RunningHub: https://www.runninghub.ai
- Documentacion de la API de RunningHub: https://www.runninghub.cn/runninghub-api-doc-en/
- LoRA relacionado rh-cyberrealistic-z-image-turbo-unet: https://huggingface.co/RunningHubAI/rh-cyberrealistic-z-image-turbo-unet
- LoRA relacionado Zimage Turbo 无滤真实 V2: https://www.runninghub.ai/model/public/2027184765341798401
