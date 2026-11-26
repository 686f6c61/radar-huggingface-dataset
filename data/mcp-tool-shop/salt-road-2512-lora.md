# mcp-tool-shop/salt-road-2512-lora

## Resumen

Salt Road Style LoRA es un adaptador de bajo rango (LoRA) para el modelo de generacion de imagenes Qwen/Qwen-Image-2512, desarrollado por mcp-tool-shop. Su funcion es inyectar un estilo visual concreto, denominado "salt road style", caracterizado por ilustraciones pictoricas al gouache de puertos del norte de Europa de la edad moderna temprana. El adaptador no es un modelo autonomo: requiere cargarse sobre el modelo base Qwen-Image-2512 mediante la libreria diffusers.

El adaptador se entrena sobre un conjunto de 73 laminas sinteticas de 1344x768 pixeles generadas a su vez con Qwen-Image-2512, lo que convierte todo el pipeline en un flujo completamente sintetico (las imagenes de entrenamiento no son fotografias ni obras originales escaneadas). El resultado es un LoRA de rango 16 y alpha 16, con 1.500 pasos de entrenamiento, que modifica unicamente el bloque UNet/MMDiT del modelo base mientras mantiene congelado el codificador de texto.

La relevancia de esta ficha radica en su caracter de ejemplo bien documentado de adaptacion de estilo sobre un modelo de difusion moderno: incluye una evaluacion cuantitativa de cuatro checkpoints y del modelo base sobre 1.020 renders, con metricas de similitud DINOv2, alineamiento texto-imagen SigLIP2 y auditoria de defectos con Qwen3-VL-8B. La licencia Apache-2.0 tanto del adaptador como del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-Image-2512 (MMDiT/UNet de difusion) |
| Parametros totales | no disponible (pesos del adaptador: 295.145.280 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible (pesos en bf16 para computo y fp16 para guardado durante el entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptador); modelo base Qwen-Image-2512 tambien Apache-2.0 |
| Formato de pesos | safetensors (`salt_road_2512_armA_s202.safetensors`) |
| Rango / alpha del LoRA | 16 / 16 |
| Pasos de entrenamiento | 1.500 |
| Resoluciones de entrenamiento | buckets multi-aspecto [512, 768, 1024] (Arm A) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 aplicado exclusivamente al bloque UNet/MMDiT del modelo base Qwen-Image-2512, que es un transformer de difusion multimodal (MMDiT). El codificador de texto del modelo base permanece congelado durante todo el entrenamiento, de modo que el adaptador solo aprende la transformacion visual del estilo, no la comprension del prompt. El entrenamiento se realizo con `ostris/ai-toolkit` version 0.13.41, en configuracion `sd_trainer` con el preset `qwen_image:2512`, usando el optimizador `adamw8bit`, tasa de aprendizaje `1e-4`, planificador `flowmatch` con timesteps ponderados, computo en bf16 y guardado en fp16, y un dropout de captions de 0.05.

El conjunto de entrenamiento son 73 laminas sinteticas de 1344x768 pixeles del dataset `mcp-tool-shop/salt-road-style`, todas generadas con Qwen-Image-2512 y con licencia CC-BY-4.0. Se compararon dos recetas de resolucion (Arm A con buckets [512, 768, 1024] y Arm B con [768, 1024, 1328]) y dos semillas (s101 y s202). Bajo la regla de desempate por varianza entre semillas del estudio, todas las metricas quedaron dentro del ruido de semilla entre brazos, por lo que se eligio la receta mas barata (Arm A). Dentro de Arm A, la semilla s202 se selecciono por su mayor tasa de aprobacion del auditor VLM (0.9917 frente a 0.9750) y por una tasa de defecto `text_leak` tres veces menor (0.0083 frente a 0.0250). El checkpoint liberado es `salt_road_2512_armA_s202.safetensors`.

## Capacidades

- Generacion de imagenes text-to-image en el estilo "salt road" (ilustracion pictorica al gouache de puertos del norte de Europa de la edad moderna temprana).
- Aplicacion de estilo consistente sobre el modelo base Qwen-Image-2512 mediante carga dinamica del adaptador con diffusers.
- Generacion de escenas de entorno (`env`), personajes (`char`) y objetos (`prop`), con mejor alineamiento medido en entornos y objetos que en personajes.
- Control de resolucion mediante buckets multi-aspecto entrenados en [512, 768, 1024].
- Compatibilidad con el pipeline `QwenImagePipeline` de diffusers y carga de pesos LoRA mediante `load_lora_weights`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vision: es exclusivamente un adaptador de estilo para generacion de imagenes.
- Capacidades multilingues: no disponible (depende del codificador de texto del modelo base Qwen-Image-2512).

## Casos de uso

- Ilustracion editorial de ambientacion historica: el adaptador genera laminas de puertos y escenas portuarias del norte de Europa con un estilo pictorico homogeneo, adecuado para portadas, interiores de libros o articulos sobre historia maritima, sin necesidad de encargar ilustraciones originales.
- Previsualizacion de direccion de arte en videojuegos: un estudio puede generar rapidamente conceptos de entornos y props en un estilo unificado (gouache pictorico) para validar la direccion visual antes de producir assets finales.
- Generacion de assets para prototipos de juegos narrativos: el LoRA permite producir fondos de escena y objetos coherentes estilisticamente con un coste de inferencia bajo, ya que solo se carga un adaptador de 0,3 GB sobre el modelo base.
- Creacion de material para juegos de rol de mesa: masters y creadores de contenido pueden generar ilustraciones de puertos, barcos y personajes con un estilo consistente para sus manuales y campañas.
- Produccion de contenido sintetico para entrenamiento o evaluacion: dado que el propio dataset de estilo es sintetico (generado con Qwen-Image-2512), el adaptador sirve como ejemplo reproducible de generacion de datos sinteticos con estilo controlado para pipelines de investigacion.
- Filtrado y curaduria de estilos en pipelines creativos: la evaluacion incluida (DINOv2, SigLIP2, auditoria Qwen3-VL-8B) puede reutilizarse como plantilla para medir deriva de estilo y defectos (texto filtrado, recortes, rostros no deseados) en produccion.
- Personalizacion de marca o house style: equipos que quieran definir una identidad visual propia pueden replicar el flujo (dataset de referencia + LoRA de rango 16 + evaluacion con VLM) para entrenar su propio estilo sobre Qwen-Image-2512.

## Benchmarks y rendimiento

Los datos de evaluacion provienen de la ola 0 del estudio del autor sobre 1.020 renders retenidos (480 por brazo, 60 del modelo base), con 240 embeddings por checkpoint y 120 auditorias VLM por checkpoint.

| Checkpoint | Buckets | DINOv2 centroid cos | DINOv2 max train cos (media / p95) | SigLIP2 no-trig cos | Qwen3-VL-8B pass | `text_leak` |
|---|---|---:|---:|---:|---:|---:|
| base | — | 0.19633 | 0.32740 / 0.55719 | 0.21061 | 0.9667 | 0.0167 |
| armA | 512/768/1024 | 0.34029 | 0.45081 / 0.77481 | 0.21630 | 0.9833 | 0.0167 |
| armB | 768/1024/1328 | 0.34480 | 0.45899 / 0.77542 | 0.21641 | 0.9958 | 0.0042 |
| armA_s101 | 512/768/1024 | 0.34144 | 0.44711 / 0.75840 | 0.21567 | 0.9750 | 0.0250 |
| **armA_s202 (liberado)** | **512/768/1024** | **0.33913** | **0.45451 / 0.79939** | **0.21692** | **0.9917** | **0.0083** |
| armB_s101 | 768/1024/1328 | 0.33618 | 0.45362 / 0.77542 | 0.21567 | 1.0000 | 0.0000 |
| armB_s202 | 768/1024/1328 | 0.35342 | 0.46436 / 0.76100 | 0.21715 | 0.9917 | 0.0083 |

Desglose por categoria de prompt para Arm A:

| Categoria | Renders (n_vlm) | DINOv2 centroid cos | SigLIP2 no-trig cos | Qwen3-VL-8B pass | `text_leak` |
|---|---:|---:|---:|---:|---:|
| char | 240 (120) | 0.37796 | 0.22749 | 0.9667 | 0.0333 |
| env | 120 (60) | 0.36021 | 0.21772 | 1.0000 | 0.0000 |
| prop | 120 (60) | 0.24501 | 0.19249 | 1.0000 | 0.0000 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque no aplican a un adaptador de estilo text-to-image. Los datos anteriores son las unicas metricas disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada; depende del modelo base Qwen-Image-2512 (el adaptador en si ocupa unos 0,3 GB en disco). El computo del entrenamiento se realizo en bf16, lo que sugiere requisitos propios de un modelo de difusion de gran tamano.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tipo de modelo base (difusion de gran tamano para generacion de imagenes), se requiere una GPU con suficiente VRAM para cargar Qwen-Image-2512 en bf16; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no disponible. No se confirma que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: la unica via documentada es `diffusers` con `QwenImagePipeline` y `load_lora_weights`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion en este contexto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| salt-road-2512-lora (este) | LoRA de estilo | Qwen-Image-2512 | no disponible (adaptador 0,3 GB) | no aplica | Apache-2.0 | Hugging Face |
| saltroad-style-lora | LoRA de estilo | Qwen-Image (version anterior) | no disponible | no aplica | no disponible | Hugging Face |
| Qwen-Image-2512 (base) | Difusion text-to-image | — | no disponible | no aplica | Apache-2.0 | Hugging Face |

La informacion disponible solo permite comparar con el adaptador hermano `mcp-tool-shop/saltroad-style-lora`, entrenado sobre las mismas 73 laminas pero con el modelo base anterior Qwen/Qwen-Image, y con el propio modelo base Qwen-Image-2512. No se dispone de datos de otros adaptadores de estilo comparables ni de sus metricas, por lo que no es posible una comparativa cuantitativa con alternativas de terceros.

## Limitaciones y advertencias

- Es un adaptador de estilo, no un modelo autonomo: sin cargar Qwen-Image-2512 no genera imagenes.
- Todo el entrenamiento se realizo con imagenes sinteticas generadas por Qwen-Image-2512; las salidas son, por tanto, AI-generated y pueden heredar sesgos o artefactos del modelo base.
- El estilo esta acotado a ilustracion pictorica al gouache de puertos del norte de Europa; fuera de ese dominio el LoRA puede degradar la calidad o imponer el estilo de forma no deseada.
- Riesgo de memorizacion: el p95 de DINOv2 max train cos es 0.79939 (por debajo del techo de memorizacion de 0.92 fijado por el autor), pero no es cero; existe cierta similitud con las laminas de entrenamiento.
- Defectos medidos en la evaluacion: tasa de `text_leak` de 0.0083 (1/120) en el checkpoint liberado, concentrada en la categoria `char` (0.0333); el resto de defectos auditados (`crop_cut`, `extra_limbs`, `human_face_leak`, `off_prompt`, `style_drift`) quedaron a 0.0 en la muestra evaluada.
- El alineamiento texto-imagen es mas debil en objetos (`prop`, SigLIP2 no-trig 0.19249) que en personajes y entornos.
- La evaluacion se limita a 1.020 renders y 120 auditorias VLM por checkpoint; no constituye una validacion exhaustiva en produccion.
- Licencia Apache-2.0 en adaptador y modelo base, lo que permite uso comercial, pero el dataset de entrenamiento es CC-BY-4.0 y debe atribuirse si se redistribuye.
- Idiomas soportados: no disponible; la calidad multilingue depende del codificador de texto congelado de Qwen-Image-2512.
- No se han publicado datos de latencia, throughput ni requisitos minimos de VRAM, por lo que el dimensionamiento de produccion debe medirse empiricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcp-tool-shop/salt-road-2512-lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2512 (revision `25468b98e3276ca6700de15c6628e51b7de54a26`)
- Dataset de estilo: https://huggingface.co/datasets/mcp-tool-shop/salt-road-style
- Dataset de evaluacion: https://huggingface.co/datasets/mcp-tool-shop/qwen-image-2512-lora-evals
- Adaptador hermano sobre Qwen-Image: https://huggingface.co/mcp-tool-shop/saltroad-style-lora
- Configuracion de entrenamiento: `training_config.yaml` (incluido en el repositorio del modelo)
- Resumen de evaluacion: `eval/salt_road_wave0_summary.json` (incluido en el repositorio del modelo)
- Entrenador utilizado: https://github.com/ostris/ai-toolkit (version 0.13.41)
