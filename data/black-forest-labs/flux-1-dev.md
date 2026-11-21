# black-forest-labs/FLUX.1-dev

## Resumen

FLUX.1-dev es un modelo de generacion de imagenes texto-a-imagen desarrollado por Black Forest Labs, el equipo detras de los modelos de difusion Stable Diffusion originales. Publicado el 31 de julio de 2024, se presenta como la variante "dev" (no comercial) de la familia FLUX.1, que incluye tambien FLUX.1-pro (API) y FLUX.1-schnell (Apache 2.0). Con 11.900 millones de parametros, es uno de los modelos texto-a-imagen de mayor tamano disponibles en abierto, superando ampliamente a SDXL (2.600 millones) y a Stable Diffusion 3 Medium.

El modelo resuelve el problema de la generacion fotorrealista de alta fidelidad con buen seguimiento de prompts complejos, incluyendo texto legible dentro de la imagen, composiciones detalladas y multiples elementos. Emplea una arquitectura hibrida de transformer multimodal (MMDiT) combinada con un VAE y dos codificadores de texto (CLIP y T5-XXL), lo que le permite interpretar prompts largos y estructurados mejor que los modelos basados unicamente en CLIP.

Su relevancia actual radica en que es la referencia open weights en calidad de generacion de imagen, ampliamente adoptado por la comunidad (mas de 427.000 descargas y 16.000 likes en Hugging Face) y compatible con el ecosistema Diffusers, ComfyUI y Automatic1111. La licencia no comercial es su principal restriccion para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (Multimodal Diffusion Transformer) con VAE y doble codificador de texto (CLIP + T5-XXL) |
| Parametros totales | 11.901.408.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prompt maximo tipico de 512 tokens en T5) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (la comunidad ofrece variantes GGUF y fp8 en repos derivados) |
| Idiomas soportados | principalmente ingles (tag `en`); capacidades multilingues limitadas por el codificador T5 |
| Licencia | flux-1-dev-non-commercial-license |
| Formato de pesos | safetensors (Diffusers) |
| Tamano del repositorio | 69,5 GB |
| Pipeline | text-to-image |
| Acceso | restringido (gated) en Hugging Face |

## Arquitectura y entrenamiento

FLUX.1-dev es un modelo de difusion basado en una arquitectura MMDiT (Multimodal Diffusion Transformer), una evolucion del transformer de difusion que procesa conjuntamente tokens de imagen y tokens de texto en un unico backbone. La imagen se codifica con un VAE propio y el texto se procesa mediante dos codificadores en paralelo: CLIP (para alineamiento semantico general) y T5-XXL (para comprension detallada de prompts largos). Esta combinacion de codificadores es una de las claves de su buen seguimiento de instrucciones complejas.

El modelo se entrena mediante difusion (flow matching, segun la documentacion de la familia FLUX.1) sobre un gran corpus de pares imagen-texto, con una fase posterior de ajuste guiado (guidance distillation) que permite usar guidance escalada sin duplicar el coste computacional de inferencia. Black Forest Labs no ha publicado el numero exacto de tokens de entrenamiento ni la composicion del dataset. La variante "dev" esta destilada para ser mas rapida que "pro" pero mantiene calidad alta; "schnell" es la variante de 4 pasos con licencia Apache 2.0.

## Capacidades

- Generacion de imagenes fotorrealistas e ilustraciones de alta fidelidad a partir de prompts en lenguaje natural.
- Renderizado de texto legible dentro de la imagen (letreros, posters, tipografia), una de las mejoras mas notables frente a SDXL.
- Composicion compleja con multiples sujetos, relaciones espaciales y atributos detallados.
- Comprension de prompts largos y estructurados gracias al codificador T5-XXL.
- Soporte de image-to-image y edicion (inpainting/outpainting) mediante el pipeline de Diffusers y herramientas de la comunidad.
- Control estructural mediante adaptadores (ControlNet, LoRA) disponibles en la comunidad.
- No soporta tool calling, agentes ni razonamiento multi-step: es exclusivamente generativo visual.
- Capacidades multilingues limitadas; el rendimiento optimo se obtiene con prompts en ingles.

## Casos de uso

- Generacion de material grafico para marketing: creacion de banners, ilustraciones y creatividades publicitarias con texto legible integrado, usando prompts detallados en ingles y renderizado en alta resolucion.
- Prototipado de diseno de producto y UI: generacion rapida de mockups y conceptos visuales que sirven como referencia para equipos de diseno antes de la produccion.
- Ilustracion editorial y de contenidos: generacion de imagenes para articulos, blogs y redes sociales, con control de estilo mediante LoRA entrenados por la comunidad.
- Creacion de assets para videojuegos: texturas, concept art de personajes y entornos, integrable en pipelines de arte conceptual con image-to-image para refinar bocetos.
- Edicion fotografica asistida: inpainting y outpainting para eliminar objetos, ampliar encuadres o rellenar zonas, usando el pipeline de Diffusers.
- Investigacion en generacion visual: modelo de referencia open weights para experimentar con tecnicas de difusion, flow matching y destilacion, al ser uno de los mayores modelos disponibles.
- Generacion de datos sinteticos para entrenamiento de modelos de vision: creacion de datasets de imagenes etiquetadas con control fino sobre atributos, siempre que el uso respete la licencia no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card oficial de FLUX.1-dev referencia comparativas cualitativas con FLUX.1-pro y FLUX.1-schnell, pero no se han proporcionado cifras numericas (FID, CLIP score, HPSv2, etc.) en la informacion consultada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 24-33 GB, segun resolucion y longitud del prompt (los 11.900 millones de parametros del transformer mas T5-XXL y VAE requieren bastante memoria).
- Cuantizaciones de la comunidad (fp8, GGUF Q4/Q8) reducen el requisito a 8-16 GB, permitiendo ejecucion en GPUs consumer.
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion en bf16; RTX 4090 (24 GB) es el minimo comodo en consumer con cuantizacion o fp8.
- Cabe en consumer GPU: si, en RTX 3090/4090 (24 GB) con fp8 o cuantizacion GGUF; en GPUs de 12-16 GB requiere cuantizaciones agresivas y resoluciones moderadas.
- Opciones de despliegue: Diffusers (FluxPipeline), ComfyUI, Automatic1111/Forge, InvokeAI, y variantes GGUF via stable-diffusion.cpp o ComfyUI-GGUF. Tambien disponible como endpoint serverless en Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen fuertemente del hardware, la cuantizacion y el numero de pasos (tipicamente 20-50 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / prompt | Licencia | Disponibilidad |
|---|---|---|---|---|
| FLUX.1-dev | 11.900 M | T5 hasta 512 tokens | No comercial (flux-1-dev-non-commercial-license) | Pesos abiertos (gated) en HF |
| FLUX.1-schnell | no disponible en la informacion | no disponible | Apache 2.0 | Pesos abiertos en HF |
| Stable Diffusion 3 Medium | ~2.000 M | CLIP + T5 | Stability AI Community License (uso comercial limitado) | Pesos abiertos en HF |
| SDXL | ~2.600 M | CLIP (77 tokens) | CreativeML OpenRAIL++-M | Pesos abiertos en HF |

FLUX.1-dev supera en tamano y, segun la documentacion oficial, en calidad de seguimiento de prompts a SDXL y SD3 Medium, pero su licencia no comercial lo excluye de produccion sin licencia comercial de Black Forest Labs. FLUX.1-schnell (Apache 2.0) es la alternativa libre para uso comercial dentro de la misma familia.

## Limitaciones y advertencias

- Licencia no comercial: el uso en produccion, SaaS o cualquier fin comercial requiere licencia comercial de Black Forest Labs. Es la restriccion mas importante.
- Acceso restringido en Hugging Face: es necesario aceptar las condiciones del modelo antes de descargar.
- Sesgos: como todo modelo entrenado con datos web a gran escala, puede reproducir estereotipos de genero, raza y profesion, y generar contenido inapropiado si no se filtra.
- Riesgo de alucinacion visual: puede generar anatomia incorrecta (manos, dedos), texto malformado en prompts complejos y composiciones fisicamente imposibles.
- Idioma: optimizado para ingles; prompts en castellano pueden degradar la calidad respecto a su traduccion al ingles.
- Requisitos de hardware elevados en bf16 (24-33 GB de VRAM), lo que limita su despliegue sin cuantizacion.
- No apto para tareas de razonamiento, codigo o agentes: es exclusivamente un modelo generativo de imagen.
- Los pesos derivados (LoRA, cuantizaciones) publicados por la comunidad pueden tener licencias distintas o heredar la restriccion no comercial.

## Enlaces

- Hugging Face: https://huggingface.co/black-forest-labs/FLUX.1-dev
- FLUX.1-schnell (Apache 2.0): https://huggingface.co/black-forest-labs/FLUX.1-schnell
- Blog oficial de Black Forest Labs: https://blackforestlabs.ai/announcing-black-forest-labs/
- Documentacion de Diffusers (FluxPipeline): https://huggingface.co/docs/diffusers/main/en/api/pipelines/flux
- Repositorio de Diffusers: https://github.com/huggingface/diffusers
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
