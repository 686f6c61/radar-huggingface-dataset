# Comfy-Org/SeedVR2

## Resumen

SeedVR2 es un modelo de restauración y superresolución de vídeo e imagen basado en difusión, desarrollado originalmente por ByteDance Seed. El repositorio `Comfy-Org/SeedVR2` no contiene el modelo original, sino una redistribución de los pesos convertidos al formato de archivo único que consume ComfyUI, herramienta de generación visual modular. La conversión se realizó con el script `seedvr2_convert.py` del repositorio `Comfy-Org/comfy-model-tools`.

El modelo se publica en dos variantes de tamaño, 3B y 7B parámetros, y en una variante adicional de la familia 7B denominada `sharp`. Su función es tomar vídeo o imagen de baja calidad o baja resolución y reconstruir detalle de alta frecuencia mediante un proceso de difusión, lo que lo sitúa en la categoría de modelos de upscaling y restauración, no en la de modelos de lenguaje.

La relevancia actual del repositorio radica en su empaquetado práctico: incluye los pesos en múltiples precisiones (fp16, fp8, int8, mxfp8 y nvfp4) y un VAE asociado, además de plantillas de workflow listas para usar. Con más de 835.000 descargas y licencia Apache 2.0, es una opción accesible para pipelines de postproducción y restauración de material audiovisual dentro del ecosistema ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion para restauracion y superresolucion (detalles internos no disponibles) |
| Parametros totales | 3B (variante 3B) y 7B (variantes 7B y 7B sharp) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de imagen/video, no de texto) |
| Tipos de cuantizacion | fp16, fp8_e4m3fn, int8_convrot, mxfp8, nvfp4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo unico para ComfyUI) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de su naturaleza de difusion para restauracion de imagen y video. El repositorio redistribuye los pesos del modelo base `ByteDance-Seed/SeedVR2-3B` y `ByteDance-Seed/SeedVR2-7B`, convertidos a archivos safetensors de un solo fichero compatibles con ComfyUI. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

El empaquetado incluye un VAE (`ema_vae_fp16.safetensors` y `seedvr2_ema_vae_fp16.safetensors`, que apuntan al mismo modelo) y quince archivos de pesos de difusion: cinco variantes de precision para el 3B, cinco para el 7B y cinco para el 7B sharp. La existencia de variantes int8 con rotacion de convolucion (`int8_convrot`), mxfp8 y nvfp4 indica un esfuerzo deliberado por ofrecer opciones de despliegue con distinto equilibrio entre calidad y consumo de VRAM. No se han documentado innovaciones tecnicas adicionales en la informacion disponible.

## Capacidades

- Superresolucion de video: reconstruccion de detalle y aumento de resolucion en secuencias de video, con workflows especificos para la variante 3B en int8.
- Superresolucion de imagen: aumento de resolucion de imagenes individuales, con workflows dedicados para las variantes 3B y 7B en int8.
- Restauracion de detalle: el sufijo `sharp` en la familia 7B sugiere una variante orientada a una reconstruccion mas nitida, aunque no se documentan formalmente sus diferencias en la informacion disponible.
- Multiples precisiones de inferencia: soporte de fp16, fp8, int8, mxfp8 y nvfp4 para adaptarse a distinta VRAM.
- Integracion con ComfyUI: los pesos estan empaquetados para su uso directo en el nodo de difusion de ComfyUI, con plantillas de workflow incluidas.
- No se dispone de informacion sobre tool calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingues, ya que no es un modelo de lenguaje.

## Casos de uso

- Restauracion de archivo audiovisual: aplicar la variante 7B en fp16 sobre metraje historico o de baja resolucion para recuperar detalle antes de un remasterizado, usando el workflow de upscaling de video de ComfyUI.
- Reescalado de material de produccion: subir de resolucion planos rodados a 1080p para entregas a 4K, eligiendo la variante int8 o fp8 si la VRAM de la estacion de trabajo es limitada.
- Postproduccion de imagen fija: ampliar fotografias o renders de baja resolucion con el workflow de imagen 7B int8, util para ilustracion, concept art o material de marketing.
- Previsualizacion en tiempo casi real: usar la variante 3B en int8 o nvfp4 en GPUs de consumo para generar previews de upscaling antes de lanzar el render final con el 7B.
- Pipelines automatizados de contenido: integrar el nodo de SeedVR2 en flujos de ComfyUI que procesen lotes de imagenes o clips de forma desatendida, aprovechando que los pesos son de archivo unico y carga directa.
- Restauracion de video generado por IA: corregir artefactos y baja resolucion en salidas de modelos de generacion de video, encadenando el modelo generador y SeedVR2 en el mismo grafo de ComfyUI.
- Investigacion en restauracion con difusion: comparar el comportamiento de las variantes 3B, 7B y 7B sharp, y de las distintas precisiones, sobre un mismo conjunto de validacion, gracias a la disponibilidad de todos los pesos en un unico repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano de pesos, el 3B en fp16 ocupa aproximadamente 6 GB solo en pesos, y el 7B en fp16 aproximadamente 14 GB; a ello hay que sumar el VAE y las activaciones, por lo que el consumo real sera superior.
- Variantes de baja precision: las versiones fp8, int8, mxfp8 y nvfp4 reducen el peso de los pesos a la mitad o menos, lo que permite ajustar el modelo a GPUs con menos memoria.
- GPUs recomendadas: no especificadas en la informacion disponible. Por tamano, el 3B en precisiones reducidas es candidato a GPUs de consumo tipo RTX 4090; el 7B en fp16 requiere GPUs de mayor memoria (A100, H100 o similares).
- Cabe en GPU de consumo: probable para el 3B en int8/fp8/nvfp4 segun el tamano de pesos, aunque no hay confirmacion oficial de VRAM pico.
- Opciones de despliegue: ComfyUI es el entorno previsto, con workflows oficiales para video e imagen. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de restauracion o superresolucion con los que establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Es un modelo de restauracion y superresolucion, no un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- No se documentan sesgos conocidos, pero al ser un modelo de difusion entrenado con datos no especificados, puede introducir detalle inventado o artefactos en zonas de baja informacion.
- Riesgo de alucinacion visual: la difusion puede reconstruir texturas o rasgos que no estaban en la imagen original, algo critico en contextos forenses o de archivo documental.
- No se especifican los idiomas soportados ni limitaciones de contexto, ya que no aplica al ser un modelo de imagen y video.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base originales de ByteDance Seed antes de un despliegue en produccion.
- El repositorio es una redistribucion de terceros (Comfy-Org), no la publicacion oficial del autor del modelo; para detalles de entrenamiento y limitaciones conviene consultar los repositorios originales.
- El tamano del repositorio es de 129,4 GB, lo que exige planificar el almacenamiento y descargar solo las variantes de precision necesarias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/SeedVR2
- Modelo base 3B: https://huggingface.co/ByteDance-Seed/SeedVR2-3B
- Modelo base 7B: https://huggingface.co/ByteDance-Seed/SeedVR2-7B
- Herramientas de conversion: https://github.com/Comfy-Org/comfy-model-tools
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Workflow de upscaling de video 3B int8: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_seedvr2_3b_int8_upscale_video.json
- Workflow de upscaling de imagen 7B int8: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_seedvr2_7b_int8_upscale_image.json
- Workflow de upscaling de imagen 3B int8: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/utility_seedvr2_3b_int8_upscale_image.json
