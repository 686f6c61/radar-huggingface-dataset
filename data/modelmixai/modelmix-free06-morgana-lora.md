# ModelMixAI/modelmix-free06-morgana-lora

## Resumen

Morgana es un LoRA de personaje para Stable Diffusion XL (SDXL) desarrollado por ModelMixAI, un creador que comercializa piezas modulares (personajes completos, caras, cuerpos y localizaciones) para la construcción de modelos virtuales e influencers de IA. El adaptador fija la identidad visual de un personaje ficticio concreto —Morgana, una creadora de boticario de estética mística de 27 años— de forma que la misma cara y el mismo cuerpo se mantienen consistentes entre generaciones. Se publica como una de las veinte piezas gratuitas del catálogo de ModelMix.

Técnicamente es un LoRA de bajo rango entrenado sobre SDXL (concretamente sobre el checkpoint epiCRealism XL, según la model card), con un tamaño de repositorio de 0,3 GB y un conjunto de entrenamiento de solo 20 imágenes. No es un modelo de lenguaje ni un sistema multimodal: es un adaptador de difusión texto-a-imagen que se aplica sobre el UNet de SDXL para especializarlo en un único sujeto.

Su relevancia es acotada y práctica: resuelve el problema clásico de consistencia de personaje en flujos de generación de imágenes, y lo hace con una licencia de uso personal que restringe explícitamente el uso comercial y la redistribución. Es relevante para quien quiera evaluar la calidad de los LoRA de personaje gratuitos frente a alternativas de pago, no como componente de un pipeline de IA generativa de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; red de difusión latente texto-a-imagen |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base SDXL tiene 2.600 M en UNet y 817 M en el text encoder) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolución nativa de SDXL: 1024x1024 |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors de precisión completa (fp16/fp32 según el archivo) |
| Idiomas soportados | no disponible (el prompt se procesa con los text encoders CLIP de SDXL, principalmente inglés) |
| Licencia | other (uso personal únicamente; sin uso comercial; prohibida la redistribución) |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA convencional aplicado sobre los módulos de atención del UNet de Stable Diffusion XL. SDXL combina un UNet de aproximadamente 2.600 millones de parámetros con dos text encoders (CLIP ViT-L y OpenCLIP ViT-bigG), y el LoRA inyecta matrices de bajo rango en las proyecciones de atención para desplazar la distribución de salida hacia el sujeto objetivo sin reentrenar el modelo base. El entrenamiento se realizó sobre el checkpoint epiCRealism XL, un fine-tune fotorrealista de SDXL, según indica la model card.

El conjunto de entrenamiento es muy reducido: 20 imágenes. Se trata de un régimen típico de LoRA de personaje, que privilegia la fidelidad de identidad sobre la diversidad de poses y escenas. La model card no documenta el número de pasos, el learning rate, el rango del LoRA ni si hubo regularización con imágenes de clase. El disparador es el token `mmx_free06_morgana_cy` y el peso recomendado es 0,9, con un rango operativo de 0,8 a 1,0.

## Capacidades

- Generación de imágenes fotorrealistas de un personaje femenino adulto ficticio con identidad consistente (cara y cuerpo) entre generaciones.
- Control de atributos definidos: pelo largo, rizado y castaño rojizo profundo, ojos ámbar, piel clara, maquillaje soft-glam místico y un pequeño colgante en forma de media luna.
- Composición con otros LoRA: la model card indica que las piezas de ModelMix están diseñadas para combinarse (personajes con localizaciones, caras, cuerpos y acompañantes).
- Integración mediante sintaxis de prompt de tipo `<lora:mmx_free06_morgana_cy:0.9>` en interfaces compatibles (A1111, ComfyUI, Forge, etc.).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada, audio ni modo thinking: es exclusivamente texto-a-imagen.
- Capacidad multilingüe no documentada; el prompt efectivo depende de los text encoders CLIP de SDXL, orientados al inglés.

## Casos de uso

- Creación de un influencer virtual de nicho: usar el LoRA con peso 0,9 para generar un feed coherente de imágenes de una única persona ficticia dedicada a contenido de botánica, herboristería o estética mística, manteniendo la identidad entre publicaciones.
- Pruebas de concepto de consistencia de personaje: evaluar con 20 imágenes de entrenamiento si la fidelidad facial y corporal es suficiente para un proyecto antes de invertir en un LoRA de pago o en un entrenamiento propio.
- Ilustración de narrativa o cómic: generar viñetas con el mismo personaje en distintas localizaciones combinando el LoRA de personaje con LoRA de escenario del mismo catálogo.
- Prototipado de producto editorial: maquetar portadas o material promocional de ficción con un personaje consistente, siempre dentro del uso personal que permite la licencia.
- Comparación de calidad de LoRA gratuitos frente a alternativas comerciales: banco de pruebas para medir deriva de identidad, adherencia al prompt y artefactos en distintas semillas y pesos.
- Investigación sobre sesgos y fotorrealismo en difusión: analizar cómo un adaptador de bajo rango entrenado con 20 imágenes moldea la distribución de rasgos faciales y corporales en SDXL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud facial, etc.) ni comparaciones numéricas con otros LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: SDXL en fp16 requiere aproximadamente 8-10 GB de VRAM; con el LoRA cargado el incremento es marginal (el adaptador pesa 0,3 GB). Con cuantización del modelo base (por ejemplo, fp8 o GGUF) puede bajar a 4-6 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 para lotes grandes y alta resolución; RTX 3090 (24 GB) y RTX 4080 (16 GB) son suficientes para inferencia en fp16 a 1024x1024.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB y superiores; en 8 GB requiere cuantización u offloading.
- Opciones de despliegue: AUTOMATIC1111 WebUI, ComfyUI, Forge, InvokeAI, Diffusers (con `load_lora_weights`), y backends de SDXL con soporte LoRA.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del modelo base, la GPU y los pasos de muestreo; no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModelMixAI/modelmix-free06-morgana-lora | LoRA de personaje | SDXL (epiCRealism XL) | 20 imágenes | other (solo uso personal) | Hugging Face, gratis |
| LoRA de personaje de pago de ModelMix | LoRA de personaje | SDXL | no disponible | comercial (según catálogo) | Payhip, Lemon Squeezy, 3DIMLI, Whop |
| LoRA de personaje de la comunidad (p. ej. Civitai) | LoRA de personaje | SDXL | variable | variable (muchas permiten uso comercial) | Civitai y Hugging Face |
| IP-Adapter FaceID | Adaptador de identidad | SDXL | modelo de reconocimiento facial | variable | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: no hay métricas publicadas para este LoRA ni para las alternativas en la información proporcionada. La diferencia principal frente a otros LoRA de personaje es la licencia restrictiva (solo personal) y el tamaño reducido del conjunto de entrenamiento.

## Limitaciones y advertencias

- Licencia de uso personal únicamente: no incluye uso comercial. Prohibida la redistribución, reventa, compartición o resubida del archivo `.safetensors`.
- Prohibido usar el LoRA para representar a personas reales o a menores. Todos los sujetos representados son adultos ficticios generados por IA.
- Entrenado con solo 20 imágenes: riesgo de sobreajuste, diversidad limitada de poses y expresiones, y posible deriva de identidad con pesos fuera del rango 0,8-1,0 o con prompts muy alejados del dominio de entrenamiento.
- Riesgo de artefactos anatómicos y de manos, habitual en SDXL y agravado por adaptadores de personaje con pocos datos.
- Sesgos potenciales heredados del checkpoint base epiCRealism XL y de las 20 imágenes de entrenamiento (cánones de belleza, tono de piel, complexión), no documentados por el autor.
- El prompt efectivo está limitado por los text encoders CLIP de SDXL, orientados al inglés; no hay soporte multilingüe documentado.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso en esos contextos es inadecuado.
- Sin métricas publicadas de calidad ni de similitud de identidad; la evaluación debe hacerse empíricamente antes de integrarlo en un flujo de producción.

## Enlaces

- Hugging Face: https://huggingface.co/ModelMixAI/modelmix-free06-morgana-lora
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Tienda Payhip: https://payhip.com/modelmix
- Lemon Squeezy: https://modelmix.lemonsqueezy.com
- 3DIMLI: https://www.3dimli.com/store/modelmix
- Whop: https://whop.com/modelmix
