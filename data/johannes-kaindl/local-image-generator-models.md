# johannes-kaindl/local-image-generator-models

## Resumen

Este repositorio no contiene un modelo nuevo, sino los activos de inferencia del modelo `stabilityai/sd-turbo` convertidos a formato ONNX, pensados para su uso en el plugin de Obsidian Local Image Generator. El autor, johannes-kaindl, ha realizado la conversión oficial mediante `optimum` y la conversión a float16 de ONNX Runtime con `keep_io_types=True`, de modo que los archivos puedan ejecutarse en el navegador a través de WebGPU y ONNX Runtime Web.

El objetivo es permitir la generación de imágenes texto a imagen de forma completamente local dentro de Obsidian, sin depender de servicios en la nube ni claves API. Incluye el text encoder CLIP, el UNet y el VAE decoder en formato ONNX, junto con el tokenizador y el runtime WASM de ONNX Runtime que el plugin enlaza de forma exacta. Es relevante porque demuestra un patrón de despliegue local de Stable Diffusion en entornos web, con verificación de integridad SHA-256 de cada archivo.

El tamaño total del repositorio es de 2.5 GB. La licencia es la Stability AI Community License, que permite uso no comercial y comercial limitado por debajo de un umbral de ingresos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion (text encoder CLIP, UNet, VAE decoder) |
| Parametros totales | no disponible (derivado de sd-turbo, aproximadamente 860 M en el UNet) |
| Parametros activos | no disponible |
| Longitud de contexto | 77 tokens (CLIP, estándar de SD) |
| Tipos de cuantizacion | fp16 (pesos ONNX), fp32 en entradas/salidas |
| Idiomas soportados | ingles (modelo base sd-turbo) |
| Licencia | Stability AI Community License |
| Formato de pesos | ONNX (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El modelo base es `stabilityai/sd-turbo`, una variante destilada de Stable Diffusion 2.1 que genera imágenes en 1-4 pasos de muestreo gracias a un entrenamiento con destilación adversarial y de consistencia. La arquitectura es un pipeline de difusion latente con tres componentes: un text encoder CLIP, un UNet que denoisa latentes y un VAE decoder que decodifica el latent a imagen. En este repositorio, los tres componentes se exportan a ONNX con pesos en fp16 pero entradas y salidas en fp32, lo que permite ejecutarlos en navegador con ONNX Runtime Web y WebGPU.

El dataset de entrenamiento y el proceso de destilación no están documentados en este repositorio; el autor solo proporciona el script de conversión `tools/convert/convert_sd_turbo.py` en el repositorio del plugin. No hay información sobre RLHF, DPO ni innovaciones técnicas adicionales más allá de la conversión ONNX.

## Capacidades

- Generacion de imagenes texto a imagen a resolucion fija de 512x512 píxeles.
- Ejecucion totalmente local en el navegador mediante WebGPU, sin servidor externo.
- Integracion con Obsidian como plugin, con descarga bajo demanda y verificacion SHA-256 de los archivos.
- Soporte de estilos mediante "style chips" (Sumi-e, Acuarela, Foto, Oleo) que se pueden editar o ampliar en los ajustes.
- Compatible con el runtime ONNX Runtime Web en su version exacta (wasm-simd-threaded.asyncify.wasm), lo que garantiza reproducibilidad.
- No soporta vision, audio, tool calling ni modos de razonamiento; es exclusivamente texto a imagen.

## Casos de uso

- **Generacion de ilustraciones en notas de Obsidian**: el usuario escribe un prompt y obtiene una imagen 512x512 directamente en su boveda, sin salir de la aplicacion, ideal para bocetos conceptuales o moodboards.
- **Prototipado rapido de conceptos visuales**: al funcionar en 1-4 pasos de muestreo, permite iterar rapidamente sobre ideas de diseno sin enviar datos a la nube.
- **Creacion de imagenes para documentacion tecnica**: desarrolladores pueden generar diagramas conceptuales o imagenes de apoyo para documentacion en Markdown, manteniendo la privacidad del contenido.
- **Generacion offline en entornos sin conexion**: al almacenar los pesos localmente, funciona sin internet, util en ambientes corporativos con restricciones de red.
- **Ensenanza de generacion de imagenes en entornos web**: sirve como ejemplo didactico de como convertir y desplegar Stable Diffusion en formato ONNX con WebGPU, consultando el codigo del plugin.
- **Uso como herramienta de escritura creativa**: escritores pueden generar ilustraciones para sus notas de Worldbuilding o personajes, sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad de imagen (FID, CLIP score) ni comparaciones de velocidad frente a otras implementaciones. El autor indica que SD-Turbo es "rapido" y se ejecuta en proceso dentro de Obsidian via WebGPU, pero no proporciona numeros concretos de latencia o throughput.

## Requisitos de hardware

- **GPU compatible con WebGPU**: es imprescindible para ejecutar el modelo en el navegador. Se recomienda una GPU con soporte WebGPU (Chrome/Edge en Windows, macOS con Metal, Linux con Vulkan).
- **VRAM estimada**: no especificada por el autor. Al ser un modelo de difusion de aproximadamente 860 millones de parametros en UNet con pesos fp16, se estima que requiere al menos 2-4 GB de VRAM para funcionar con margen, aunque el runtime WebGPU puede usar memoria compartida.
- **GPU recomendadas**: cualquier GPU integrada o dedicada con soporte WebGPU; las GPU de Apple Silicon y las NVIDIA modernas funcionan bien. No se requiere hardware especifico de datacenter.
- **Despliegue**: el modelo se usa exclusivamente dentro del plugin de Obsidian, que enlaza con ONNX Runtime Web en su version WASM. No se proporcionan instrucciones para vLLM, llama.cpp u otros servidores de inferencia.
- **Latencia y throughput**: no disponibles en la informacion publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| johannes-kaindl/local-image-generator-models (SD-Turbo ONNX) | ~860 M (UNet) | 512x512 | ONNX fp16 | Stability AI Community | Navegador (WebGPU) |
| stabilityai/sd-turbo (original) | ~860 M (UNet) | 512x512 | PyTorch | Stability AI Community | Python (Diffusers) |
| FLUX.2 klein 4B | 4 B | variable (7 relaciones de aspecto) | no disponible | no disponible | proceso local (mflux) |

La comparativa se limita a los dos modelos que ofrece el plugin: SD-Turbo (rapido, en proceso) y FLUX.2 klein 4B (mayor calidad, via proceso hijo). No hay datos de rendimiento comparativo entre ambos en la informacion disponible.

## Limitaciones y advertencias

- **Resolucion fija de 512x512**: no se pueden generar imagenes a otras resoluciones con este modelo, a diferencia de FLUX.2.
- **Idioma limitado**: el text encoder CLIP esta entrenado principalmente en ingles; prompts en otros idiomas pueden producir resultados de menor calidad.
- **Riesgo de alucinacion visual**: como todo modelo de difusion, puede generar detalles inconsistentes o artefactos en escenas complejas.
- **Licencia restrictiva para uso comercial**: la Stability AI Community License permite uso comercial solo por debajo de un umbral de ingresos anuales; superado ese limite, se requiere una licencia de pago. El plugin en si es AGPL-3.0-or-later, lo que puede afectar a distribuciones del codigo.
- **Dependencia de WebGPU**: sin soporte WebGPU en el navegador, el modelo no puede ejecutarse. No hay fallback a CPU.
- **Verificacion de integridad**: los archivos se descargan solo despues de que el usuario haga clic en "Descargar" y se verifican contra un SHA-256 fijado en la version del plugin, pero el repositorio de HuggingFace no ofrece una suma de verificacion propia.
- **Privacidad**: al ejecutarse localmente, no se envian prompts a servidores, pero el plugin descarga los pesos (2.5 GB) en la primera ejecucion, lo que requiere ancho de banda.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/johannes-kaindl/local-image-generator-models
- Repositorio del plugin en GitHub: https://github.com/johannes-kaindl/local-image-generator
- README del plugin: https://github.com/johannes-kaindl/local-image-generator/blob/main/README.md
- Modelo base (Stability AI): https://huggingface.co/stabilityai/sd-turbo
- Licencia del modelo: https://huggingface.co/stabilityai/sd-turbo/blob/main/LICENSE.md
- Sitio personal del autor: https://jkaindl.de/
