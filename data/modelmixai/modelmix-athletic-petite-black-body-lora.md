# ModelMixAI/modelmix-athletic-petite-black-body-lora

## Resumen

ModelMix Athletic Petite Black Body LoRA es un adaptador LoRA para Stable Diffusion XL (SDXL) orientado a la generacion de imagenes fotorrealistas de un personaje virtual consistente. Lo desarrolla ModelMixAI dentro de una familia de piezas intercambiables (rostro, cuerpo, acompanante y localizacion) pensadas para crear modelos virtuales e influencers de IA con proporciones estables entre imagenes. El adaptador se entrena sobre `stabilityai/stable-diffusion-xl-base-1.0` (concretamente sobre el modelo comunitario CyberRealistic XL v100) y fija una silueta concreta: clase de silueta superior L e inferior M, complexión atletica, estatura petite y tono de piel negro.

El modelo resuelve un problema acotado pero practico en pipelines de generacion de personajes: la consistencia de la estructura corporal cuando se encadenan muchas imagenes de un mismo personaje virtual. Al separar el cuerpo del rostro en LoRAs independientes, el autor permite combinar piezas y mantener una identidad visual coherente sin reentrenar un modelo completo por cada personaje.

Se trata de un adaptador de muy pequeno tamano (repositorio de 0,3 GB), entrenado con solo 19 imagenes y publicado bajo licencia "other" que restringe el uso a fines personales. No incluye datos de rendimiento, benchmarks ni evaluaciones cuantitativas, y su utilidad comercial esta explicitamente limitada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL (UNet transformer de difusion) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base SDXL tiene ~2.600 M en UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; sin contexto de texto en el sentido de LLM) |
| Tipos de cuantizacion | no disponible (formato de pesos `.safetensors`, compatible con fp16/fp32 en el ecosistema Diffusers) |
| Idiomas soportados | no disponible (los prompts de SDXL funcionan principalmente en ingles) |
| Licencia | other (uso personal unicamente; sin uso comercial) |
| Formato de pesos | safetensors (LoRA) |
| Modelo base | stabilityai/stable-diffusion-xl-base-1.0 |
| Tamano del repositorio | 0,3 GB |
| Trigger word | `mdl_gbodyathLMbk_cy` |
| Peso recomendado | 1.0 (rango 0.8 - 1.0) |
| Imagenes de entrenamiento | 19 |
| Clase de silueta | superior L, inferior M; complexión atletica; estatura petite; tono de piel negro |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango aplicado sobre el UNet de SDXL, el modelo de difusion latente de Stability AI que combina un codificador de texto dual (CLIP ViT-L y OpenCLIP ViT-bigG) con un UNet de aproximadamente 2.600 millones de parametros y un VAE. El LoRA modifica los pesos del UNet para sesgar la generacion hacia una estructura corporal concreta, sin alterar el resto de capacidades del modelo base.

El entrenamiento se realizo con solo 19 imagenes y, segun la model card, sobre CyberRealistic XL v100, un checkpoint comunitario de SDXL orientado a fotorrealismo. No se documentan hiperparametros, numero de pasos, learning rate, composicion del dataset ni si se aplicaron tecnicas de regularizacion o aumento de datos. Tampoco se indica si hubo etapas de refinamiento o evaluacion cualitativa mas alla de las imagenes de muestra incluidas en el repositorio.

## Capacidades

- Generacion de imagenes fotorrealistas de un personaje virtual con estructura corporal consistente (complexión atletica, estatura petite, tono de piel negro).
- Fijacion de proporciones y silueta entre imagenes, lo que permite mantener la coherencia fisica del personaje en series largas.
- Combinacion con LoRAs de rostro de la misma familia ModelMix para completar un personaje virtual completo.
- Combinacion con piezas de acompanante y localizacion del catalogo ModelMix.
- Control del peso del adaptador en un rango de 0,8 a 1,0 para graduar la intensidad del efecto.
- Integracion con cualquier pipeline de SDXL que acepte LoRAs (Diffusers, ComfyUI, Automatic1111, etc.).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente text-to-image.
- Capacidades multilingues no documentadas; los prompts se asumen en ingles.

## Casos de uso

- Creacion de influencers virtuales: el LoRA fija la estructura corporal del personaje para que todas las publicaciones de una cuenta mantengan proporciones coherentes, combinado con un LoRA de rostro de la misma familia.
- Catalogos de moda con modelo virtual: se generan imagenes del mismo cuerpo con distintas prendas, reduciendo la necesidad de sesiones fotograficas y manteniendo la consistencia fisica entre productos.
- Prototipado de personajes para videojuegos o narrativa visual: permite explorar variaciones de vestuario y pose sobre una base corporal estable antes de modelar en 3D.
- Generacion de material para redes sociales: produccion rapida de imagenes de un personaje ficticio adulto con identidad visual consistente para cuentas tematicas.
- Pruebas de concepto de pipelines de generacion: util como pieza de un flujo de trabajo por capas (rostro + cuerpo + localizacion) para validar la composicion de LoRAs en SDXL.
- Ilustracion editorial o conceptual: generacion de figuras humanas fotorrealistas con proporciones controladas para bocetos y referencias visuales.
- Experimentacion con tecnicas de LoRA: caso de estudio de un adaptador entrenado con muy pocas imagenes (19) para evaluar la relacion entre tamano del dataset y consistencia del personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de personaje, etc.) ni comparaciones con otros LoRAs de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base SDXL requiere aproximadamente 8-10 GB de VRAM en fp16 para generar a 1024x1024; el LoRA anade un consumo marginal (menos de 1 GB adicional).
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para generacion rapida y por lotes; RTX 3060 de 12 GB o superior para uso individual.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante), con posible uso de `--medvram` o `--lowvram` en GPUs mas ajustadas.
- Opciones de despliegue: Diffusers (Python), ComfyUI, Automatic1111 / Forge, InvokeAI, Fooocus y cualquier frontend que cargue LoRAs de SDXL.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del sampler. En una RTX 4090 se esperan tiempos de unos pocos segundos por imagen a 1024x1024, pero no hay datos oficiales del autor.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModelMix Athletic Petite Black Body LoRA | LoRA de personaje | SDXL | 1024x1024 (SDXL) | other (solo uso personal) | Hugging Face (0 descargas) |
| Otros LoRAs de personaje de la familia ModelMix | LoRA de rostro/cuerpo | SDXL | 1024x1024 | other (solo uso personal) | Catalogo del autor (Payhip, Lemon Squeezy, 3DIMLI, Whop) |
| LoRAs de personaje comunitarios en Civitai | LoRA de personaje | SDXL / SD 1.5 | variable | variable (muchos permiten uso comercial) | Civitai y Hugging Face |
| Checkpoints fotorrealistas SDXL (p. ej. CyberRealistic XL) | Modelo completo | SDXL | 1024x1024 | variable | Hugging Face / Civitai |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: uso personal unicamente; el uso comercial no esta incluido. Prohibida la redistribucion, reventa, comparticion o resubida del archivo `.safetensors`.
- Prohibido usar el LoRA para representar personas reales o menores; todas las figuras son adultos ficticios generados por IA.
- Entrenado con solo 19 imagenes, lo que puede limitar la variedad de poses, angulos y contextos en los que la estructura corporal se mantiene fiable.
- Riesgo de sobreajuste al estilo del checkpoint de entrenamiento (CyberRealistic XL v100) y posible degradacion si se combina con otros checkpoints muy distintos.
- No hay evaluacion cuantitativa de consistencia ni de calidad; el rendimiento depende en gran medida del prompt, del sampler y del peso del LoRA.
- Sin soporte documentado de idiomas distintos del ingles en los prompts.
- Modelo puramente text-to-image: no realiza razonamiento, tool calling ni tareas de lenguaje.
- Posibles sesgos derivados de las imagenes de entrenamiento en cuanto a tono de piel, complexión y estetica corporal.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado mas alla de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/ModelMixAI/modelmix-athletic-petite-black-body-lora
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Catalogo Payhip: https://payhip.com/modelmix
- Catalogo Lemon Squeezy: https://modelmix.lemonsqueezy.com
- Catalogo 3DIMLI: https://www.3dimli.com/store/modelmix
- Catalogo Whop: https://whop.com/modelmix
