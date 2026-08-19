# d0gr/dreamshaper-xl-lightning-unet-onnx

## Resumen

El repositorio `d0gr/dreamshaper-xl-lightning-unet-onnx` contiene una exportación en formato ONNX del componente UNet del modelo de difusión DreamShaper XL Lightning, desarrollado originalmente por Lykon. El objetivo de esta conversión es permitir la inferencia de generación de imágenes directamente en el navegador mediante WebGPU y la librería onnxruntime-web, dentro de la extensión Generate AI Images del propio autor.

El modelo base, DreamShaper XL Lightning, es un fine-tune de Stable Diffusion XL (SDXL) destilado para generar imágenes de alta calidad en muy pocos pasos (4 a 8), con un CFG bajo (~2) y muestreador Euler con trailing spacing. Esta versión ONNX solo incluye el UNet, ya que los text encoders y el VAE del modelo base son prácticamente idénticos a los de SDXL estándar, por lo que se reutilizan desde otro repositorio del mismo autor (`d0gr/sdxl-lightning-onnx-webgpu`). El resultado es un paquete optimizado para ejecución en clientes web sin necesidad de servidores dedicados.

La relevancia actual de este modelo radica en la creciente demanda de aplicaciones de IA generativa que funcionen íntegramente en el navegador, preservando la privacidad del usuario y reduciendo costes de infraestructura. Al estar basado en SDXL, hereda una amplia compatibilidad con estilos artísticos (foto, arte, anime, manga) y con el ecosistema de herramientas de difusión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de Stable Diffusion XL (SDXL) exportado a ONNX |
| Parametros totales | no disponible (el UNet de SDXL tiene aproximadamente 2.6 mil millones, pero no se especifica en la ficha) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión; procesa latentes de 64x64 píxeles) |
| Tipos de cuantizacion | fp16 para pesos y cómputo; fp32 para entradas/salidas (perfil `model_io32.onnx`) |
| Idiomas soportados | no disponible (el modelo base acepta prompts en varios idiomas, pero no se documenta) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | ONNX (archivos `.onnx` y `.onnx_data` con shards de pesos) |

## Arquitectura y entrenamiento

El modelo es una conversión del UNet de SDXL, que sigue la arquitectura estándar de los UNets de difusión con atención cruzada y bloques residuales. La versión Lightning del checkpoint original fue destilada mediante destilación por pasos (step distillation), lo que permite generar imágenes con tan solo 4 a 8 pasos de muestreo, en lugar de los 20-50 habituales en SDXL. El proceso de entrenamiento del modelo base no se detalla en esta ficha, pero se sabe que es un fine-tune de SDXL sobre un conjunto de datos diverso orientado a fotografía, arte digital, anime y manga.

La exportación a ONNX se realizó con herramientas propias del autor (`tools/export-sdxl-unet.py` y `tools/retarget-unet-profile.py`). El perfil `model_io32.onnx` usa entradas y salidas en fp32, timestep en INT64 y pesos y cómputo en fp16, siendo este el perfil validado para WebGPU. El repositorio incluye también el perfil original `model.onnx` con I/O en fp16 como referencia. Según la model card, una pasada del UNet coincide con el checkpoint torch fp16 con una similitud coseno de 1.000000.

## Capacidades

- Generación de imágenes a partir de prompts de texto, con soporte para estilos fotográficos, artísticos, anime y manga.
- Inferencia de alta velocidad gracias a la destilación Lightning: 4-8 pasos con CFG ~2 y Euler con trailing spacing.
- Ejecución completamente en el navegador mediante WebGPU y onnxruntime-web, sin necesidad de servidor backend.
- Compatibilidad con el ecosistema SDXL: prompts negativos, ControlNet (si se integra), inpainting y outpainting (requiere componentes adicionales no incluidos en este repositorio).
- No incluye soporte para tool calling, agentes ni razonamiento multimodal; es exclusivamente un modelo de difusión text-to-image.

## Casos de uso

- Generación de imágenes en aplicaciones web sin backend: gracias a su formato ONNX y compatibilidad con WebGPU, el modelo puede integrarse en páginas estáticas o extensiones de navegador para que los usuarios generen imágenes localmente, sin enviar datos a servidores externos.
- Prototipado rápido de herramientas de diseño: los desarrolladores pueden crear editores de imágenes o generadores de conceptos artísticos que funcionen offline o en entornos con baja latencia de red.
- Automatización de creación de contenido para redes sociales: con solo 4-8 pasos, el modelo puede producir variaciones de imágenes en tiempo real, adecuado para generación por lotes en clientes ligeros.
- Integración en extensiones de navegador para mejora de flujos de trabajo creativos: por ejemplo, generar fondos, texturas o ilustraciones directamente desde una pestaña del navegador.
- Evaluación de capacidades de WebGPU en dispositivos de consumo: al ser un modelo de tamaño medio (~5 GB), sirve como banco de pruebas para medir el rendimiento de inferencia de difusión en GPUs integradas y discretas.
- Aplicaciones educativas de IA generativa: permite demostrar el funcionamiento interno de un UNet de SDXL en un entorno accesible y sin dependencias de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la concordancia con el checkpoint torch fp16 (similitud coseno 1.000000 en una pasada del UNet), lo que indica que la conversión a ONNX no introduce pérdida numérica relevante. No hay comparaciones con otros modelos en términos de calidad de imagen o velocidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la ficha. Dado que los pesos del UNet en fp16 ocupan aproximadamente 5.1 GB (tamaño del repositorio), se estima que se necesitan al menos 6-8 GB de VRAM para ejecutar la inferencia completa, aunque el uso real depende del tamaño del lote y de la resolución de salida.
- GPU recomendadas: cualquier GPU compatible con WebGPU, incluyendo integradas modernas (Intel Arc, AMD RDNA 2/3, Apple Silicon) y discretas (NVIDIA RTX 20/30/40, AMD RX 6000/7000). No se requiere una GPU específica.
- Compatibilidad con consumer GPU: sí, siempre que soporten WebGPU. No hay requisitos de CUDA ni ROCm.
- Opciones de despliegue: exclusivamente en navegador mediante onnxruntime-web con WebGPU. No se proporcionan configuraciones para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de difusión, no un LLM.
- Latencia y throughput: no disponibles. Dependen fuertemente de la GPU del cliente y del número de pasos (4-8). En GPUs de gama media se esperan tiempos de generación de unos pocos segundos.

## Comparativa con modelos similares

| Modelo | Formato | Pasos requeridos | Ejecución en navegador | Licencia |
|---|---|---|---|---|
| `d0gr/dreamshaper-xl-lightning-unet-onnx` (este) | ONNX (WebGPU) | 4-8 | Sí | OpenRAIL++-M |
| `Lykon/dreamshaper-xl-lightning` (original) | PyTorch / diffusers | 4-8 | No (requiere servidor o entorno Python) | OpenRAIL++-M |
| `amd/dreamshaper-xl-lightning-amdnpu` | ONNX (AMD NPU) | 4-8 | No (requiere hardware AMD Ryzen AI) | OpenRAIL++-M |

La principal diferencia frente al modelo original es el formato y el entorno de ejecución: este repositorio está pensado para WebGPU, mientras que el original se usa con la librería diffusers en Python. La versión de AMD está optimizada para NPUs de Ryzen AI, no para navegadores.

## Limitaciones y advertencias

- El repositorio solo contiene el UNet; los text encoders y el VAE deben obtenerse por separado desde `d0gr/sdxl-lightning-onnx-webgpu`, lo que añade una dependencia adicional.
- La licencia OpenRAIL++-M incluye restricciones de uso (Attachment A), como la prohibición de generar contenido ilegal, dañino o engañoso, y de usar el modelo para vigilancia masiva. Es responsabilidad del desarrollador cumplir estas condiciones.
- El modelo base puede presentar sesgos en la representación de ciertos grupos demográficos o estilos, heredados de los datos de entrenamiento de SDXL y del fine-tune de DreamShaper. No se han documentado evaluaciones de sesgo específicas para esta versión ONNX.
- Al ser una conversión para WebGPU, el rendimiento depende en gran medida de la implementación de WebGPU del navegador y del driver de la GPU. En dispositivos sin soporte WebGPU, el modelo no funcionará.
- No se incluyen herramientas de ajuste fino ni de entrenamiento; es un artefacto de inferencia únicamente.
- La fecha de creación del repositorio (2026-08-17) es posterior a la fecha de los resultados de búsqueda, lo que sugiere que el proyecto puede estar en fase temprana y con pocas descargas (0 en el momento de la consulta).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/d0gr/dreamshaper-xl-lightning-unet-onnx
- Modelo base (Lykon/dreamshaper-xl-lightning): https://huggingface.co/Lykon/dreamshaper-xl-lightning
- Repositorio de text encoders y VAE compartidos (d0gr/sdxl-lightning-onnx-webgpu): https://huggingface.co/d0gr/sdxl-lightning-onnx-webgpu
- Extensión Generate AI Images (código fuente): https://github.com/d0gr/generate-ai-images
- Versión AMD NPU (amd/dreamshaper-xl-lightning-amdnpu): https://huggingface.co/amd/dreamshaper-xl-lightning-amdnpu
- Página de DreamShaper XL en Civitai: https://civitai.com/models/112902/dreamshaper-xl
- Página de DreamShaper XL en Open Laboratory: https://openlaboratory.com/models/dreamshaper-xl/
- Sitio web de DreamShaper XL: https://dreamshaperxl.com/
