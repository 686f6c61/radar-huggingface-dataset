# qqceqqq/Qwen-Image-Layered

## Resumen

Qwen-Image-Layered es un modelo de difusion para descomposicion de imagenes en capas RGBA, desarrollado por el equipo Qwen (Alibaba). A partir de una imagen de entrada (y opcionalmente un prompt de texto), el modelo genera multiples capas RGBA independientes que aíslan componentes semanticos o estructurales de la escena, lo que permite editar cada capa por separado sin afectar al resto del contenido. Esto resuelve el problema de consistencia en edicion de imagenes: en lugar de regenerar la imagen completa, se manipula fisicamente solo la capa objetivo.

El modelo se construye como un fine-tune de Qwen/Qwen-Image y se distribuye a traves de la libreria diffusers con el pipeline `QwenImageLayeredPipeline`. Cuenta con aproximadamente 20.430 millones de parametros (20,43 B) en pesos safetensors, con un repositorio de 57,7 GB. Soporta descomposicion en un numero variable de capas (por ejemplo, 3 u 8) y descomposicion recursiva de cualquier capa, lo que permite una granularidad de edicion practicamente ilimitada.

Es relevante ahora porque introduce una representacion editable nativa (capas RGBA) que habilita operaciones elementales de alta fidelidad —redimensionar, reposicionar, recolorear o eliminar objetos— sin distorsion ni inconsistencias. La licencia Apache 2.0 facilita su adopcion tanto en investigacion como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (fine-tune de Qwen/Qwen-Image); pipeline `QwenImageLayeredPipeline` en diffusers |
| Parametros totales | 20.430.407.232 (~20,43 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen; no aplica ventana de texto) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el ejemplo usa bfloat16) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

Qwen-Image-Layered es un modelo de difusion derivado de Qwen/Qwen-Image mediante fine-tuning. Su salida no es una unica imagen RGB, sino un conjunto de capas RGBA que representan componentes separados de la escena. El pipeline expone parametros de inferencia como `num_inference_steps` (50 en el ejemplo), `true_cfg_scale` (4.0), `cfg_normalize`, `layers` (numero de capas a generar) y `resolution` (640 o 1024; se recomienda 640 en esta version). Tambien admite `use_en_prompt` para generar automaticamente el caption en ingles si el usuario no proporciona prompt.

El modelo soporta descomposicion variable y recursiva: una imagen puede dividirse en 3 u 8 capas segun se necesite, y cualquier capa resultante puede descomponerse de nuevo, habilitando una descomposicion "infinita". La representacion por capas permite operaciones elementales de alta fidelidad (resize, reposition, recolor, eliminacion de objetos) al aislar fisicamente cada componente. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Descomposicion de imagenes en multiples capas RGBA independientes.
- Numero de capas configurable (por ejemplo, 3 u 8) mediante el parametro `layers`.
- Descomposicion recursiva: cualquier capa generada puede subdividirse de nuevo.
- Edicion aislada por capa: recolorear, reemplazar contenido o modificar texto en una capa sin alterar el resto.
- Operaciones elementales de alta fidelidad: redimensionado sin distorsion, reposicionamiento libre en el lienzo y eliminacion limpia de objetos.
- Generacion image-text-to-image: acepta prompt de texto opcional junto con la imagen.
- Generacion automatica de caption en ingles si no se proporciona prompt (`use_en_prompt`).
- Soporte multilingue de prompts: ingles y chino.
- Integracion con Qwen-Image-Edit para editar capas objetivo (segun los ejemplos de la model card).
- Compatibilidad con `python-pptx` para flujos de trabajo orientados a presentaciones.

## Casos de uso

- Edicion de fotografia por capas: descomponer una imagen en capas (sujeto, fondo, texto) y recolorear o reemplazar solo el sujeto, garantizando que el fondo permanezca intacto y consistente.
- Diseno grafico y retoque publicitario: aislar logotipos y textos en capas separadas para reescribir mensajes o recolorear marcas sin regenerar la composicion completa.
- Creacion de presentaciones: combinado con `python-pptx`, generar capas exportables como elementos editables de diapositivas, permitiendo reposicionar y redimensionar objetos sin perdida de calidad.
- Eliminacion de objetos no deseados: seleccionar la capa que contiene el objeto y eliminarla, obteniendo un resultado limpio sin artefactos de inpainting en el resto de la imagen.
- Composicion y collage: mover objetos libremente dentro del lienzo tras la descomposicion, facilitando reordenaciones de escena y variaciones de layout.
- Pipelines de edicion iterativa: descomponer recursivamente capas para refinar detalles (por ejemplo, separar un personaje en rostro, ropa y accesorios) y editar cada nivel de forma independiente.
- Automatizacion de variantes creativas: generar multiples versiones de un diseno modificando solo una capa (color de producto, texto promocional) manteniendo coherencia visual entre variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~20,43 B de parametros en bfloat16, los pesos ocupan aproximadamente 40 GB, por lo que se requiere hardware de gama alta (el ejemplo oficial usa `torch.bfloat16` en CUDA).
- GPU recomendadas: no especificadas por el autor; por el tamano del modelo, se orienta a GPUs profesionales tipo A100/H100 con 80 GB para ejecucion holgada en bfloat16.
- Compatibilidad con GPU de consumo: no confirmada; en RTX 4090 (24 GB) no cabria en bfloat16 sin cuantizacion u offloading, y no se documentan recetas de cuantizacion.
- Opciones de despliegue: libreria diffusers (`QwenImageLayeredPipeline`), con requisito `transformers>=4.51.3` y la version mas reciente de diffusers instalada desde el repositorio de GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto/Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-Layered | ~20,43 B | Difusion, salida en capas RGBA | Resolucion 640/1024 | Apache 2.0 | Hugging Face, ModelScope |
| Qwen/Qwen-Image (base) | No disponible | Difusion texto-a-imagen | No disponible | No disponible en la informacion | Hugging Face |
| No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo ni de otros modelos de descomposicion por capas en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo de imagen, puede heredar sesgos del dataset de entrenamiento de Qwen-Image.
- Riesgo de alucinacion visual: la descomposicion puede generar capas inexistentes o separar incorrectamente componentes ambiguos.
- Limitaciones de idioma: los prompts y captions automaticos estan soportados en ingles y chino; otros idiomas no estan garantizados.
- Resolucion limitada: la version actual recomienda 640 (con opcion 1024); resoluciones superiores no estan documentadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen-Image.
- Caveats de produccion: requiere versiones recientes de `transformers` y `diffusers` (instalacion desde GitHub), lo que puede complicar la reproducibilidad; el uso de bfloat16 exige hardware de gama alta.
- El numero de capas y la calidad de la descomposicion pueden variar segun la complejidad de la imagen de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qqceqqq/Qwen-Image-Layered
- Modelo oficial Qwen: https://huggingface.co/Qwen/Qwen-Image-Layered
- ModelScope: https://modelscope.cn/models/Qwen/Qwen-Image-Layered
- Paper (arXiv): https://arxiv.org/abs/2512.15603
- Blog: https://qwenlm.github.io/blog/qwen-image-layered/
- Demo (Space): https://huggingface.co/spaces/Qwen/Qwen-Image-Layered
- Modelo base: https://huggingface.co/Qwen/Qwen-Image
- Repositorio diffusers: https://github.com/huggingface/diffusers
