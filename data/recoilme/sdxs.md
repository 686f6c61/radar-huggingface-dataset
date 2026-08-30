# recoilme/sdxs

## Resumen

SDXS-1B (CLIP version) es un modelo de difusión texto a imagen desarrollado por el usuario recoilme, perteneciente al proyecto AiArtLab, que busca crear modelos de IA gratuitos, compactos y rápidos entrenables en hardware de consumo. Este modelo es una variante del SDXS-1B original basado en Qwen, en la que se ha sustituido el codificador de texto por un CLIPTextModel (estilo LongCLIP) y se ha adaptado la atención cruzada del UNet de 2048 a 768 dimensiones. Con aproximadamente 1.585 millones de parámetros en el UNet, el modelo está diseñado para generar imágenes de alta resolución (hasta 1024x1280) con un pipeline ligero y eficiente.

La arquitectura combina un UNet personalizado con un VAE asimétrico (8x encoder, 16x decoder) que incluye un upscaler integrado, y un scheduler FlowMatchEulerDiscreteScheduler con 40 pasos por defecto. El modelo se entrena con flow matching y dropout de clasificador libre (cfg-dropout) de 0.10. Al estar basado en CLIP, no soporta refinamiento de prompts mediante LLM ni acondicionamiento por imagen, pero ofrece una generación rápida y de calidad para prompts descriptivos. Su relevancia radica en su tamaño reducido, que permite su ejecución en GPUs de consumo, y en su enfoque en la eficiencia computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet personalizado con cross_attention_dim=768, block_out_channels [320, 640, 1280, 1536], layers_per_block [4, 3, 2, 2], transformer_layers_per_block [2, 2, 3, 4] |
| Parametros totales | 1.585.405.344 (UNet) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 248 tokens (text encoder CLIP) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente ingles, pero no se especifica) |
| Licencia | modified-mit (ver archivo LICENSE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de difusion basada en UNet con atencion cruzada de 768 dimensiones, disenada para trabajar con un codificador de texto CLIPTextModel de 12 capas y 768 unidades ocultas. El VAE es un AsymmetricAutoencoderKL con 32 canales, factor de compresion 8x en el encoder y 16x en el decoder, e incluye un upscaler integrado de 2x. El scheduler es FlowMatchEulerDiscreteScheduler con shift=5.0 y 40 pasos por defecto. Los embeddings se obtienen de la concatenacion de `hidden_states[-2]` y `final_layer_norm`.

El entrenamiento se realizo mediante flow matching (velocidad) con cfg-dropout de 0.10 y un timestep shift alineado con el scheduler. El modelo es una conversion del SDXS-1B original basado en Qwen: se reemplazo el codificador de texto por CLIP y se migraron las proyecciones de atencion cruzada de 2048 a 768 dimensiones, con inicializacion en caliente (warm-start). No se incluyen funciones de refinamiento de prompts ni acondicionamiento por imagen, ya que CLIP no es un LLM.

## Capacidades

- Generacion de imagenes a partir de prompts de texto descriptivos, con soporte de negative prompts para mejorar la calidad.
- Control de resolucion de salida (por ejemplo, 1024x1280) y de guidance scale (por defecto 5.0).
- Generacion de imagenes con estilo anime o ilustracion, dado el ejemplo de prompt proporcionado.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente generativo de imagenes.
- No soporta acondicionamiento por imagen (image conditioning) ni refinamiento de prompts mediante LLM.
- Capacidades multilingues no especificadas; probablemente limitadas al ingles por el codificador CLIP.

## Casos de uso

- Generacion de ilustraciones y arte conceptual: el modelo puede crear imagenes de personajes, escenarios o conceptos a partir de descripciones textuales, adecuado para disenadores y artistas que necesitan explorar ideas rapidamente.
- Creacion de avatares y assets para videojuegos: con prompts como "1girl, smiling, red eyes, blue hair", se pueden generar personajes para prototipos o conceptos de juegos, gracias a su resolucion de hasta 1024x1280.
- Generacion de imagenes para contenido editorial o redes sociales: su rapidez y bajo consumo de recursos permiten producir imagenes de acompanamiento para blogs, posts o campanas, sin necesidad de infraestructura costosa.
- Prototipado de diseno de productos: se pueden generar visualizaciones de objetos o entornos a partir de descripciones, util para equipos de diseno que necesitan iterar sobre conceptos visuales.
- Educacion y experimentacion en IA generativa: al ser un modelo compacto y con licencia permisiva, es ideal para que estudiantes e investigadores aprendan sobre difusion, flow matching y arquitecturas eficientes.
- Generacion de fondos y texturas para entornos virtuales: el modelo puede producir imagenes de paisajes o patrones que sirvan como recursos para realidad virtual, simulaciones o entornos 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM estimada para inferencia. Dado el tamano del UNet (1.585M parametros) y el uso de fp16, se puede inferir que el modelo es ligero y probablemente ejecutable en GPUs de consumo con al menos 4-6 GB de VRAM, pero esta cifra no esta confirmada.
- El repositorio ocupa 23.2 GB, lo que sugiere que los pesos pueden estar en precision fp32 o incluir multiples archivos; se recomienda usar torch_dtype=float16 para reducir el uso de memoria.
- No se especifican GPUs recomendadas. Por su tamano, podria ejecutarse en RTX 3060, RTX 4060 o superiores, asi como en GPUs de datacenter como A100.
- Opciones de despliegue: el modelo se carga mediante la clase `SdxsPipeline` con `trust_remote_code=True`, lo que implica que se necesita el codigo personalizado del repositorio. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de difusion, no un LLM.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar con otros modelos de difusion de tamano similar (por ejemplo, SDXL-Turbo, SD1.5, etc.) en terminos de rendimiento o calidad. La arquitectura personalizada y la falta de benchmarks publicados impiden una comparacion objetiva.

## Limitaciones y advertencias

- No se han documentado sesgos especificos, pero al ser un modelo entrenado con datos no especificados, puede reflejar sesgos presentes en el dataset de entrenamiento.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar imagenes con artefactos, distorsiones o detalles incorrectos, especialmente con prompts complejos o poco descriptivos.
- Limitaciones de contexto: el codificador CLIP acepta un maximo de 248 tokens, por lo que prompts muy largos o detallados pueden truncarse.
- No soporta acondicionamiento por imagen ni refinamiento de prompts, lo que limita su uso en tareas que requieran control fino sobre la composicion.
- La licencia es "modified-mit", pero no se proporciona el texto completo en la informacion disponible; es necesario revisar el archivo LICENSE del repositorio para conocer las restricciones exactas, especialmente en cuanto a uso comercial.
- El modelo requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar codigo arbitrario del autor; se recomienda auditar el codigo antes de usarlo en entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/recoilme/sdxs
- Perfil del autor: https://huggingface.co/recoilme
- Pagina de insights y benchmarks (tercero): https://free2aitools.com/model/recoilme/sdxs
- Repositorio del proyecto AiArtLab: https://github.com/aiartlab/aiartlab.github.io
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/recoilme/sdxs
