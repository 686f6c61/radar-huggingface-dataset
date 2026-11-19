# ChrisColeTech/krea2-turbo-edit-GGUF

## Resumen

Krea 2 Turbo Edit es un modelo de difusion para generacion y edicion de imagenes, distribuido en formato GGUF por el usuario ChrisColeTech. Se trata de una compilacion de pesos (weights-only) del denoiser Krea 2 Turbo Edit con un LoRA de identidad ya integrado, acompanado del text encoder Qwen3-VL-4B y del VAE de Qwen-Image. El modelo esta destilado para funcionar en 8 pasos de muestreo y sin classifier-free guidance (guidance 0.0), lo que reduce drasticamente el coste de inferencia frente a modelos de difusion convencionales de 20-50 pasos.

El modelo resuelve dos tareas principales: generacion texto-a-imagen (txt2img) e imagen-a-imagen (img2img) con fuerza configurable, ademas de una modalidad de edicion por instruccion que preserva la identidad del sujeto a partir de una o dos imagenes de referencia, sin necesidad de mascara ni region de inpainting. Esta ultima capacidad es la mas distintiva y la que da nombre al build.

Con aproximadamente 12.900 millones de parametros en el denoiser (dato real de safetensors), el modelo se posiciona en la gama alta de los modelos de difusion open source. La publicacion en GGUF con tres niveles de cuantizacion y un build FP8 escalado facilita su despliegue en GPUs de consumo, algo relevante en un ecosistema donde los modelos de esta escala suelen requerir hardware profesional. La licencia no esta declarada, lo que constituye una limitacion importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (denoiser) con text encoder Qwen3-VL-4B y VAE Qwen-Image; no se especifica el tipo exacto de backbone (no disponible) |
| Parametros totales | 12.895.570.508 (denoiser, segun safetensors) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica contexto de texto en el sentido de LLM) |
| Tipos de cuantizacion | GGUF en tres niveles (incluye Q4_K_M, 7,26 GB) y build FP8 escalado; text encoder en FP8 escalado |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el README usa ejemplos en ingles) |
| Licencia | unknown (no declarada) |
| Formato de pesos | GGUF (denoiser), safetensors (text encoder y VAE) |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un denoiser de difusion destilado, empaquetado junto a un text encoder Qwen3-VL-4B y un VAE de Qwen-Image. El texto se codifica con Qwen3-VL-4B, lo que aporta comprension multimodal al condicionamiento, y las imagenes se codifican y decodifican con el VAE de Qwen-Image. No se detalla en la model card el tipo de backbone del denoiser (transformer, DiT, UNet u otro), el numero de tokens de entrenamiento ni la composicion del dataset.

El aspecto tecnico mas relevante es la destilacion a 8 pasos con guidance 0.0, que elimina la necesidad de classifier-free guidance y reduce el numero de evaluaciones del denoiser por imagen. El build incorpora un LoRA de identidad ya fusionado en los pesos, lo que habilita la modalidad de edicion con preservacion de identidad sin cargar adaptadores adicionales. No se especifica si el entrenamiento incluyo RLHF, DPO ni tecnicas de preferencia; tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion texto-a-imagen (txt2img) a 1024x1024 con 8 pasos de muestreo y guidance 0.0.
- Imagen-a-imagen (img2img) con control de fuerza (ejemplo documentado con strength 0.75) para restilizado, conversion a oleo, acuarela o lapiz.
- Edicion por instruccion preservando identidad: una o dos imagenes de referencia mas una instruccion en lenguaje natural; se mantienen identidad, pose, iluminacion y escena, cambiando solo lo indicado.
- Edicion sin mascara ni region de inpainting: no requiere segmentacion manual.
- Parametros de control documentados: `ref_boost` (ejemplo 1.0) y `grounding` (ejemplo 768 px) para la modalidad de edicion.
- Reproducibilidad mediante semilla (seeds documentadas en los ejemplos: 12345, 99, 1234, 42, 7).
- Soporte de cuantizacion GGUF para despliegue en hardware limitado.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode (no aplicables a un modelo de imagen).

## Casos de uso

- Edicion de retratos con preservacion de identidad: a partir de una fotografia de referencia y una instruccion como "ponle un gorro de punto rojo", el modelo modifica el atributo solicitado manteniendo el rostro, la pose y la iluminacion. Adecuado para estudios fotograficos y produccion de contenido sin sesiones adicionales.
- Restilizado artistico por lotes: con img2img a strength 0.75 se convierte una imagen base en oleo, acuarela o lapiz manteniendo la composicion, lo que sirve para generar variantes estilisticas de un mismo material grafico.
- Generacion de imagenes de producto: txt2img a 1024x1024 en 8 pasos permite producir bodegones fotorrealistas (el README incluye el ejemplo de una manzana sobre mesa de madera) con grano de madera y textura de piel finos, util para catalogos y prototipado visual.
- Previsualizacion rapida en pipelines creativos: al requerir solo 8 pasos y no usar guidance, el coste por imagen es bajo (aproximadamente 35 s por 1024² en una RTX 5090 segun el autor), lo que facilita iterar sobre prompts antes de un render final de mayor calidad.
- Edicion de escenarios sin inpainting: instrucciones como "haz que llueva fuera de la ventana" modifican el entorno conservando al sujeto, sin necesidad de dibujar mascaras, lo que simplifica flujos de postproduccion.
- Despliegue local en estaciones de trabajo con GPU de consumo: la version Q4_K_M (7,26 GB) junto con el text encoder FP8 (5,24 GB) y el VAE (254 MB) permite ejecutar el modelo en ComfyUI con el loader GGUF actualizado, sin depender de servicios en la nube.
- Prototipado de conceptos para videojuegos e ilustracion: generacion de variaciones de personajes y escenarios a partir de referencias, con control de semilla para mantener coherencia entre iteraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es temporal: aproximadamente 35 segundos por imagen de 1024x1024 en una RTX 5090, con 8 pasos y guidance 0.0.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, el denoiser en Q4_K_M ocupa 7,26 GB, el text encoder FP8 5,24 GB y el VAE 254 MB; el pico de VRAM dependera del backend y de la resolucion, y no se documenta.
- GPU recomendadas: el autor cita una RTX 5090 para el dato de 35 s por imagen a 1024². No se documentan otras GPU.
- Cabe en GPU de consumo: si, segun el empaquetado GGUF en tres niveles de cuantizacion; no se especifica la VRAM minima por nivel.
- Opciones de despliegue: ComfyUI con el nodo `comfyui-gguf-loader` actualizado (canal "Channel (remote)" en ComfyUI Manager). No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables o no soportados segun la informacion disponible).
- Latencia y throughput: aproximadamente 35 s por imagen de 1024x1024 en RTX 5090, 8 pasos, guidance 0.0. No se documenta throughput por lotes.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. Como referencia estructural, el modelo comparte text encoder (Qwen3-VL-4B) y VAE (Qwen-Image) con la familia Qwen-Image, pero no se aportan cifras comparativas.

## Limitaciones y advertencias

- Licencia no declarada (`unknown`): no hay autorizacion explicita para uso comercial ni para redistribucion; conviene contactar con el autor antes de integrarlo en produccion.
- Es un build de pesos (weights-only) de un modelo subyacente (Krea 2 Turbo Edit); no es un reentrenamiento, por lo que hereda las limitaciones del modelo original, que no se documentan.
- La model card no detalla sesgos conocidos, tasa de alucinacion visual ni limitaciones de idioma; los ejemplos de prompt estan en ingles y no se confirma el soporte de otros idiomas.
- La modalidad de edicion con preservacion de identidad puede fallar en escenarios no cubiertos por el LoRA integrado; el autor no documenta tasas de exito ni casos de fallo.
- Requiere una version especifica del loader GGUF en ComfyUI; versiones antiguas pueden no cargar los pesos correctamente.
- No se documentan requisitos minimos de VRAM por cuantizacion, lo que dificulta planificar el despliegue.
- El dato de latencia (35 s) corresponde a una RTX 5090; en GPU de gama inferior el tiempo por imagen sera previsiblemente mayor, aunque no se aportan cifras.
- El repositorio ocupa 50,2 GB, lo que implica un coste de almacenamiento y descarga considerable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ChrisColeTech/krea2-turbo-edit-GGUF
- Denoiser Q4_K_M (GGUF): https://huggingface.co/ChrisColeTech/krea2-turbo-edit-GGUF/blob/main/split/gguf/krea2_turbo_edit-Q4_K_M.gguf
- Text encoder Qwen3-VL-4B FP8 escalado: https://huggingface.co/ChrisColeTech/krea2-turbo-edit-GGUF/blob/main/split/text_encoders/qwen3vl_4b_fp8_scaled.safetensors
- VAE Qwen-Image: https://huggingface.co/ChrisColeTech/krea2-turbo-edit-GGUF/blob/main/split/vae/qwen_image_vae.safetensors
- Workflow de ComfyUI: https://huggingface.co/ChrisColeTech/krea2-turbo-edit- (enlace truncado en la model card; no disponible la URL completa)
