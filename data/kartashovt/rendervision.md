# kartashovt/RenderVision

## Resumen

RenderVision (publicado como "Render Vision SD") no es un modelo de lenguaje ni una red neuronal entrenada por el autor, sino una distribución portable de Stable Diffusion empaquetada para el estudio Render Vision. El repositorio de Hugging Face contiene los artefactos de instalación (scripts `.bat`, un entorno Python portátil y una copia de Forge Neo con sus ajustes y extensiones), mientras que los pesos de los modelos se descargan aparte desde sus repositorios originales durante la instalación.

El paquete se apoya en Forge Neo, un fork de la interfaz web de Stable Diffusion bajo licencia AGPL-3.0, y orquesta un conjunto heterogéneo de modelos de generación de imagen: Dark Beast BlitZ ZiT (basado en Z-Image Turbo), el propio Z-Image Turbo con su text encoder Qwen3 4B y su VAE, el checkpoint epiCPhotoGasm Last Unicorn, varios ControlNet 1.1 para SD 1.5, IP-Adapter, upscalers y LoRAs de detalle.

Su relevancia es práctica: ofrece un entorno reproducible y autocontenido para generar imágenes en Windows sin depender de una instalación manual de Python, CUDA y dependencias, con un gestor de modelos integrado. No aporta innovación en arquitectura ni en entrenamiento; su valor está en el empaquetado y la curaduría de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo único; agrupa checkpoints de difusión, text encoders y adaptadores) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica; los text encoders tienen límites propios, no especificados) |
| Tipos de cuantizacion | BF16 y FP8 (para Dark Beast BlitZ ZiT); pesos fp16 en ControlNet 1.1 |
| Idiomas soportados | no disponible (los prompts dependen del text encoder; el paquete incluye Qwen3 4B y CLIP) |
| Licencia | AGPL-3.0 (el paquete); cada modelo incluido tiene su propia licencia |
| Formato de pesos | safetensors (ControlNet, IP-Adapter, upscalers); checkpoints y LoRAs según fuente; artefactos del instalador en `.zip`, `.tar.lz4` y `.bat` |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Es una distribución que combina Forge Neo (interfaz y backend de inferencia para modelos de difusión) con un entorno Python portátil (`sys.tar.lz4`) y herramientas de instalación (`soft.zip` con wget, lz4 y tar). El código fuente completo, incluidos los cambios propios (Model Manager, scripts de arranque, logotipo del tema), viaja dentro de `sdw.tar.lz4` en la carpeta `sdw`, con historial de git.

Los modelos que se descargan cubren dos familias: por un lado, Z-Image Turbo y su derivado Dark Beast BlitZ ZiT (con text encoder Qwen3 4B y VAE propio); por otro, el ecosistema SD 1.5, con el checkpoint epiCPhotoGasm Last Unicorn, ControlNet 1.1 (canny, depth, inpaint, lineart, tile), IP-Adapter SD 1.5 plus, los upscalers 4x-UltraSharp y 4x NMKD-Siax 200k, y varias LoRAs (Advanced Enhancer, Detail Slider v4, Realistic Snapshot ZIT v5). Forge descarga además preprocesadores de ControlNet, CLIP-ViT-H y BLIP en el primer uso. No se documentan detalles de entrenamiento, datasets ni técnicas de alineación para ninguno de estos componentes en la información disponible.

## Capacidades

- Generación de imágenes texto-a-imagen mediante los checkpoints incluidos (Dark Beast BlitZ ZiT en BF16 o FP8, Z-Image Turbo, epiCPhotoGasm Last Unicorn).
- Control condicional de la generación con ControlNet 1.1: canny, depth, inpaint, lineart y tile.
- Transferencia de estilo y referencia de imagen con IP-Adapter SD 1.5 plus.
- Escalado de resolución con upscalers dedicados (4x-UltraSharp, 4x NMKD-Siax 200k).
- Ajuste fino del resultado mediante LoRAs de detalle y realismo (Detail Slider v4, Advanced Enhancer, Realistic Snapshot ZIT v5 con fuerza recomendada 0,6-0,7).
- Gestión de modelos desde la interfaz (pestaña Model Manager) e instalación desatendida de modelos base mediante `download_models.bat`, que omite archivos ya presentes.
- Dos modos de interfaz: `cs_1_lite.bat` (UI simple) y `cs_2_full.bat` (UI completa).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión más allá del condicionamiento por imagen de ControlNet e IP-Adapter.

## Casos de uso

- Ilustración digital para estudio: el paquete está pensado para el flujo de trabajo de Render Vision, con checkpoints realistas y LoRAs de detalle que permiten generar ilustraciones consistentes sin montar el entorno desde cero.
- Prototipado rápido de pipelines de difusión: al incluir Forge Neo con extensiones y ajustes preconfigurados, sirve para probar combinaciones de ControlNet, IP-Adapter y upscalers en una máquina Windows sin gestionar dependencias manualmente.
- Entrenamiento y validación de personal de estudio: la UI simple (`cs_1_lite.bat`) reduce la curva de aprendizaje para usuarios que solo necesitan generar imágenes, mientras la UI completa queda para perfiles técnicos.
- Control de composición en producción gráfica: el uso de ControlNet canny, depth y lineart permite imponer la estructura de un boceto o de una foto de referencia, útil para mantener la composición de un encargo entre iteraciones.
- Restauración y ampliación de imágenes: la combinación de ControlNet inpaint, tile y los upscalers 4x permite rellenar zonas y aumentar resolución en flujos de retoque.
- Transferencia de estilo con referencias: IP-Adapter SD 1.5 plus posibilita generar variaciones que mantengan la estética de una imagen de referencia, aplicable a series de ilustraciones con identidad visual común.
- Despliegue en estaciones de trabajo aisladas: el instalador crea un entorno portátil en una carpeta local (unos 20 GB libres necesarios), lo que facilita replicar la misma configuración en varios equipos del estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Espacio en disco: unos 20 GB libres según la model card, en una ruta sin espacios (por ejemplo `C:\RenderVision_SD`).
- VRAM estimada: no disponible. Depende del checkpoint y de la precisión; Dark Beast BlitZ ZiT se ofrece en BF16 y FP8, lo que sugiere que la variante FP8 está pensada para GPUs con menos memoria, pero no se publican cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se indica qué tarjetas soporta el build.
- Opciones de despliegue: el paquete usa Forge Neo con scripts `cs_1_lite.bat` y `cs_2_full.bat`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelos).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Producto | Tipo | Modelos incluidos | Licencia del paquete | Gestión de modelos |
|---|---|---|---|---|
| RenderVision | Distribución portable de Forge Neo para Windows | Dark Beast, Z-Image Turbo, epiCPhotoGasm, ControlNet 1.1, IP-Adapter, upscalers, LoRAs | AGPL-3.0 | Model Manager integrado y `download_models.bat` |
| Forge Neo (upstream) | Interfaz y backend de inferencia | Ninguno por defecto | AGPL-3.0 | Manual |
| ComfyUI | Interfaz y backend basada en grafos | Ninguno por defecto | GPL-3.0 (según proyecto) | Manual, con gestor de modelos de terceros |
| Automatic1111 WebUI | Interfaz y backend | Ninguno por defecto | AGPL-3.0 | Manual |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelos: sin conexión a internet durante la instalación, el paquete queda incompleto salvo que se coloquen manualmente los archivos.
- Licencia AGPL-3.0 para el paquete y para Forge Neo: su uso en servicios en red puede obligar a publicar el código modificado; conviene revisar las implicaciones antes de un despliegue comercial.
- Las licencias de los modelos descargados son independientes y algunas restringen el uso comercial: 4x-UltraSharp es CC BY-NC-SA 4.0 (no comercial), epiCPhotoGasm, Advanced Enhancer y Detail Slider remiten a su página de Civitai, y varios componentes figuran como "see source". Hay que verificar cada una antes de producir contenido comercial.
- No se documentan sesgos, tasas de alucinación visual ni evaluaciones de calidad para ninguno de los checkpoints; no hay datos objetivos de fidelidad prompt-imagen.
- El soporte de idiomas no está especificado; el comportamiento multilingüe dependerá del text encoder empleado (Qwen3 4B en la familia Z-Image, CLIP en SD 1.5).
- La instalación depende de scripts `.bat` descargados de internet y de un entorno Python empaquetado; conviene auditar el contenido antes de ejecutarlo en máquinas de producción.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta y fue creado y actualizado el mismo día (6 de noviembre de 2026), lo que indica una madurez y un historial de mantenimiento aún no contrastados.
- La ruta de instalación no debe contener espacios, lo que limita su integración en algunos entornos corporativos estandarizados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kartashovt/RenderVision
- Instalador: https://huggingface.co/kartashovt/RenderVision/resolve/main/Install_RenderVision.bat
- Forge Neo (upstream): https://github.com/Haoming02/sd-webui-forge-classic
- Dark Beast BlitZ ZiT: https://huggingface.co/GuangyuanSD/REDCraft-DarkBeast-Z-Image-TURBO
- Z-Image Turbo (Comfy-Org): https://huggingface.co/Comfy-Org/z_image_turbo
- Z-Image Turbo (original, Tongyi-MAI): https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- epiCPhotoGasm Last Unicorn: https://civitai.com/models/132632
- ControlNet 1.1 fp16 safetensors: https://huggingface.co/comfyanonymous/ControlNet-v1-1_fp16_safetensors
- ControlNet 1.1 (original): https://huggingface.co/lllyasviel/ControlNet-v1-1
- IP-Adapter (colección de control): https://huggingface.co/lllyasviel/sd_control_collection
- IP-Adapter (original): https://huggingface.co/h94/IP-Adapter
- 4x-UltraSharp: https://huggingface.co/Kim2091/UltraSharp
- 4x NMKD-Siax 200k: https://huggingface.co/gemasai/4x_NMKD-Siax_200k
- Advanced Enhancer LoRA: https://civitai.com/models/106717
- Detail Slider LoRA v4: https://civitai.com/models/153562
- Depth Anything: https://github.com/LiheYoung/Depth-Anything
- Realistic Snapshot ZIT v5: https://civitai.com/models/2268008
- RenderVision en Linktree: https://linktr.ee/RenderAi
