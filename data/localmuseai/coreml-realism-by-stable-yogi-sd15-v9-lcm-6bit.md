# LocalMuseAI/coreml-realism-by-stable-yogi-sd15-v9-lcm-6bit

## Resumen

Este repositorio contiene una conversión a formato Core ML del modelo de generación de imágenes fotorrealistas "Realism By Stable Yogi (Pony) SD 1.5 V9 LCM", creado originalmente por Stable Yogi y convertido por LocalMuseAI para su uso en la aplicación iOS LocalMuse. El modelo original es un checkpoint de Stable Diffusion 1.5 destilado con LCM (Latent Consistency Model), lo que permite generar imágenes de alta calidad en tan solo 9 pasos de inferencia con un CFG de 1.0, en lugar de los 20-50 pasos típicos de SD 1.5 estándar.

La conversión a Core ML incluye una cuantización de 6 bits mediante paletización k-means para el UNet, mientras que el text encoder y los VAE se mantienen en FP16. Esto permite ejecutar el modelo de forma eficiente en dispositivos Apple con Neural Engine, como iPhones y iPads, sin necesidad de conexión a servidores. El repositorio documenta la procedencia exacta de los pesos originales, con hashes SHA-256 y verificación de integridad, y se distribuye bajo la licencia CreativeML Open RAIL++-M, que incluye restricciones de uso basadas en la licencia original.

La relevancia de este modelo radica en su enfoque en la inferencia local en dispositivos móviles, un área de creciente interés para aplicaciones de generación de imágenes privadas y sin latencia de red. Al ser una conversión reproducible y auditada, también sirve como referencia técnica para desarrolladores que deseen portar modelos de difusión a Core ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet de 4 canales, TextEncoder, VAE) con destilación LCM |
| Parametros totales | no disponible (el checkpoint original pesa 2.132.626.090 bytes, aproximadamente 1,7 GB en FP32; el UNet de SD 1.5 tiene unos 860M parámetros) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | UNet: 6-bit k-means paletizado; TextEncoder y VAE: FP16 |
| Idiomas soportados | no disponible (el text encoder de SD 1.5 esta entrenado principalmente en ingles, pero no se especifica) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | Core ML (mlmodelc) para UNet, TextEncoder, VAEDecoder y VAEEncoder; el original es safetensors |

## Arquitectura y entrenamiento

El modelo base es un Stable Diffusion 1.5, una arquitectura de difusion latente que combina un UNet para denoising en el espacio latente, un text encoder (CLIP ViT-L/14) para codificar prompts, y un VAE para decodificar las latentes a pixeles. La version original fue destilada con LCM (Latent Consistency Model), una tecnica que entrena el modelo para predecir el resultado final en pocos pasos, reduciendo drasticamente el numero de iteraciones necesarias (9 pasos en lugar de 20-50). No se aplicaron LoRAs ni merges adicionales durante la conversion a Core ML.

El proceso de conversion utilizo la herramienta oficial de Apple `ml-stable-diffusion` (revision `e12202c1f6405b83918b58a5d097cd61e3e1f702`), con atencion configurada como `SPLIT_EINSUM_V2`. El UNet se cuantizo a 6 bits mediante paletizacion k-means, una tecnica que agrupa los pesos en 64 centroides por bloque, reduciendo el tamano y acelerando la inferencia en el Neural Engine. Los componentes de texto y VAE se mantuvieron en FP16. Se habilitaron comprobaciones de paridad entre PyTorch y Core ML a nivel de componente, y se registraron los hashes exactos en `PROVENANCE.json`.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de prompts de texto, con estilo "pony" (un checkpoint derivado de SD 1.5 especializado en realismos).
- Inferencia rapida gracias a la destilacion LCM: 9 pasos con CFG 1.0, lo que permite tiempos de generacion de pocos segundos en dispositivos Apple.
- Ejecucion completamente local en iOS/macOS mediante Core ML, sin necesidad de servidores externos.
- Resolucion fija de 512x512 píxeles, la nativa de SD 1.5.
- Compatible con el pipeline `text-to-image` de la libreria `ml-stable-diffusion`.
- No soporta tool calling, agentes, ni capacidades multimodales adicionales (solo texto a imagen).

## Casos de uso

- Aplicaciones de arte y creatividad en iOS: el modelo permite a usuarios generar ilustraciones fotorrealistas desde su iPhone o iPad sin conexion, ideal para apps de dibujo asistido o generacion de conceptos.
- Prototipado rapido de imagenes para disenadores: al ejecutarse localmente, se pueden generar variaciones de un prompt en segundos, acelerando el proceso de exploracion creativa.
- Generacion de contenido para redes sociales: creadores pueden producir imagenes personalizadas con su propio dispositivo, manteniendo la privacidad de sus prompts y resultados.
- Asistentes de diseno de producto: integrado en una app, puede generar visualizaciones de objetos o escenarios a partir de descripciones textuales, util para moodboards.
- Educacion y demostraciones tecnicas: sirve como ejemplo de como convertir y desplegar modelos de difusion en Core ML, con documentacion de procedencia y verificacion de integridad.
- Generacion de imagenes en entornos con restricciones de red: periodistas o investigadores en zonas sin conectividad pueden usar el modelo de forma offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de FID, CLIP score, ni comparaciones con otros modelos en el repositorio ni en la model card. El unico dato de rendimiento indirecto es el numero de pasos (9) y la resolucion fija (512x512), pero sin metricas de tiempo de inferencia concretas.

## Requisitos de hardware

- Dispositivos Apple con chip A12 Bionic o posterior (iPhone XS, iPad Pro 2018 o mas recientes) que soporten Core ML y Neural Engine.
- El modelo esta optimizado para el Neural Engine de Apple, por lo que no esta pensado para GPUs de escritorio (NVIDIA, AMD) ni para CPUs x86.
- Tamano del repositorio: 1,1 GB, lo que implica un uso de almacenamiento moderado en el dispositivo.
- VRAM: no aplica, ya que Core ML gestiona la memoria unificada del dispositivo Apple.
- Opciones de despliegue: integracion directa en apps iOS/macOS mediante la libreria `ml-stable-diffusion` de Apple. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles, pero se espera que sea de pocos segundos por imagen en dispositivos modernos gracias a la cuantizacion de 6 bits y la destilacion LCM.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Realism By Stable Yogi SD 1.5 V9 LCM (Core ML) | SD 1.5 + LCM | ~860M (UNet) | 512x512 | Open RAIL++-M | Core ML 6-bit | Optimizado para Apple Neural Engine |
| Stable Diffusion 1.5 original | SD 1.5 | ~860M (UNet) | 512x512 | Open RAIL++-M | safetensors, ckpt | Requiere 20-50 pasos, sin destilacion |
| SDXL | SDXL (UNet 2.6B) | ~2.6B (UNet) | 1024x1024 | Open RAIL++-M | safetensors | Mayor calidad, pero mas pesado y lento |
| LCM-LoRA (sobre SD 1.5) | SD 1.5 + LoRA LCM | ~860M + LoRA | 512x512 | Open RAIL++-M | safetensors | Permite pocos pasos sin destilacion completa |

La comparativa se basa en caracteristicas generales conocidas, no en benchmarks medidos. Este modelo se distingue por su formato Core ML y cuantizacion de 6 bits, que lo hacen unico para despliegue en dispositivos Apple, a diferencia de los formatos estandar de PyTorch.

## Limitaciones y advertencias

- Resolucion fija de 512x512: no se pueden generar imagenes a otras resoluciones sin reentrenar o adaptar el modelo.
- El modelo esta destilado con LCM, lo que puede producir artefactos o perdida de detalle en comparacion con el checkpoint original sin destilacion, especialmente con prompts complejos.
- No se incluyen los trigger names de textual inversion del modelo original, por lo que algunos estilos especificos pueden no estar disponibles.
- La licencia Open RAIL++-M impone restricciones de uso: no se permite generar contenido ilegal, danino, engañoso o que viole derechos de terceros. El uso comercial esta permitido, pero con las condiciones de la licencia.
- El modelo puede reflejar sesgos presentes en los datos de entrenamiento de SD 1.5, como estereotipos de genero o raza, y puede alucinar elementos no solicitados en el prompt.
- No hay garantias de rendimiento en dispositivos antiguos; la inferencia puede ser lenta o fallar en hardware sin soporte adecuado de Neural Engine.
- La conversion a Core ML es especifica para Apple; no se puede ejecutar en otras plataformas sin una conversion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LocalMuseAI/coreml-realism-by-stable-yogi-sd15-v9-lcm-6bit
- Pagina del modelo original en Civitai: https://civitai.com/models/166609?modelVersionId=1235013
- Ficha del modelo en PromptHero: https://prompthero.com/ai-models/realism-by-stable-yogi-pony-166609-download/realism-by-stable-yogi-pony-sd15_v9_lcm
- Perfil de LocalMuseAI en HuggingFace: https://huggingface.co/LocalMuseAI
- Herramienta de conversion de Apple `ml-stable-diffusion`: no se proporciona enlace directo, pero esta disponible en el repositorio oficial de Apple en GitHub.
