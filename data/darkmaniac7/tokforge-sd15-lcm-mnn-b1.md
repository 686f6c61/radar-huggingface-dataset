# darkmaniac7/TokForge-SD15-LCM-MNN-b1

## Resumen

TokForge-SD15-LCM-MNN-b1 es un paquete de inferencia en formato MNN para generación de imágenes texto-a-imagen, publicado por TokForge (darkmaniac7). No es un modelo entrenado desde cero, sino una fusión de dos artefactos existentes: el checkpoint DreamShaper 7 de Lykon (arquitectura Stable Diffusion 1.5) y el adaptador LCM-LoRA SD1.5 de latent-consistency, integrado directamente en el UNet mediante `fuse_lora` en fp32. El resultado se exporta a ONNX y se convierte a MNN con pesos de 8 bits, pensado para ejecutarse en la CPU de teléfonos Android.

El problema que resuelve es concreto: permitir generación de imágenes de 512x512 en 4 pasos, sin CFG (guidance-free, CFG 1.0) y sin pase de prompt negativo, en dispositivos móviles con 8 GB de RAM o más. La fusión de LCM-LoRA reduce drásticamente el número de evaluaciones del UNet por imagen, y la exportación batch-1 con altura y anchura dinámicas (`sample=[1,4,-1,-1]`) elimina el pase incondicional que LCM no necesita.

Este repositorio concreto se distingue de su variante hermana `TokForge-SD15-LCM-MNN` únicamente por el grafo `unet.mnn`: aquí es batch-1 dinámico, mientras que la variante antigua usa batch fijo 2. Todos los demás ficheros, incluido `unet.mnn.weight`, son byte-idénticos (mismo sha256). Está diseñado para TokForge 3.6.0 beta 24 y posteriores, incluidas las versiones 1.3.x actuales. El repositorio ocupa 1,2 GB repartidos en 9 ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (text encoder CLIP ViT-L/14, UNet, VAE decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto CLIP, limite estandar de SD1.5, 77 tokens) |
| Tipos de cuantizacion | UNet con pesos de 8 bits asimétricos; text encoder y VAE decoder en f16 |
| Idiomas soportados | en (inglés) |
| Licencia | creativeml-openrail-m, mas terminos de Lykon en Civitai para DreamShaper (prohibida la venta) |
| Formato de pesos | MNN (`.mnn` grafo + `.mnn.weight` datos externos); no incluye safetensors ni GGUF |
| Resolucion de salida | 512x512 |
| Pasos de muestreo | 4 por defecto, hasta 8 para refinamiento |
| CFG scale | 1.0 (guidance-free) |
| Prompt negativo | no se usa a CFG 1.0 |
| Tamano del repositorio | 1,2 GB (9 ficheros) |
| Modelo base | Lykon/dreamshaper-7 + latent-consistency/lcm-lora-sdv1-5 (fusión) |
| Libreria / runtime | MNN (motor de difusión de TokForge) |
| Plataforma objetivo | Android, CPU, telefonos con 8 GB de RAM o mas |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un text encoder CLIP ViT-L/14 que proyecta el prompt a embeddings, un UNet que realiza la difusión latente y un VAE decoder que reconstruye la imagen en píxeles. Sobre el checkpoint DreamShaper 7 de Lykon se carga y fusiona el LCM-LoRA SD1.5 en fp32, de modo que el UNet resultante incorpora el comportamiento de consistency model: genera imágenes coherentes en 4-8 pasos con muestreo sin guía (CFG 1.0). El LoRA solo modifica el UNet, por lo que el text encoder y el VAE decoder se reutilizan sin cambios desde la referencia SD1.5.

El proceso de construcción es explícito en la model card: carga de `Lykon/dreamshaper-7` en diffusers, fusión de `latent-consistency/lcm-lora-sdv1-5` con `fuse_lora` en fp32, exportación del UNet fusionado a ONNX trazado a batch 1 con altura y anchura dinámicas, y conversión a MNN con cuantización de pesos a 8 bits asimétricos mediante `MNNConvert --weightQuantBits 8 --weightQuantAsymmetric`. Los grafos de text encoder (76,3 MB de grafo + 170 MB de pesos f16) y VAE decoder (154 KB de grafo + 99,0 MB de pesos f16) son los de referencia de SD1.5, byte-idénticos entre todos los bundles de la familia TokForge SD1.5 LCM. No se documenta entrenamiento adicional, RLHF ni DPO: es una operación de fusión, exportación y cuantización.

La innovación técnica relevante es doble. Por un lado, la fusión de LCM-LoRA elimina la necesidad del pase incondicional del UNet, que en muestreo con CFG > 1 duplica el coste por paso. Por otro, la exportación batch-1 con dimensiones dinámicas permite que el motor ejecute un único pase condicional por paso, reduciendo a la mitad el cómputo del UNet frente a la variante batch-2. Este ahorro es determinante en CPU móvil.

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 en 4 pasos (hasta 8 para refinamiento), con CFG 1.0 y sin prompt negativo.
- Muestreo guidance-free: no requiere pase incondicional, lo que reduce el coste computacional por imagen.
- UNet con altura y anchura dinámicas: el grafo acepta dimensiones de entrada variables, aunque la salida documentada es 512x512.
- Estilo base heredado de DreamShaper 7, orientado a ilustración y resultados estilizados.
- Sirve de base para la familia de bundles con LoRA de estilo de TokForge (Cartoon, Vintage, Storybook Illustration, Pixel Art), que añaden un LoRA de estilo sobre este mismo modelo.
- Ejecución totalmente local en el dispositivo una vez descargado el modelo: no requiere conexión de red para inferir.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es exclusivamente un generador de imágenes.
- Capacidad multilingüe limitada al inglés en el prompt (tokenizer CLIP de SD1.5).

## Casos de uso

- Generación de imágenes offline en Android: la app TokForge descarga el bundle y ejecuta la difusión en la CPU del teléfono, de modo que el usuario puede generar ilustraciones sin conexión una vez descargados los 1,2 GB. Es adecuado porque el modelo está cuantizado a 8 bits y muestrea en 4 pasos, lo que encaja en el presupuesto térmico y de memoria de un móvil de 8 GB.
- Prototipado rápido de conceptos visuales en movilidad: diseñadores que necesitan bocetos de 512x512 en el momento, sin depender de una GPU o de un servicio en la nube, pueden usar el bundle en la app para iterar prompts con latencia de pocos pasos.
- Base para variantes de estilo: al ser el bundle base de la familia TokForge SD1.5 LCM, sirve como punto de partida para derivar versiones con LoRA de estilo (cartoon, vintage, storybook, pixel art) manteniendo el mismo text encoder, VAE y scheduler, lo que simplifica el mantenimiento de la cadena de build.
- Integración en aplicaciones Android de terceros mediante el runtime MNN: desarrolladores que ya usan MNN pueden cargar el bundle en su propio motor de difusión y ofrecer generación de imágenes local dentro de su app, siempre que respeten la licencia OpenRAIL-M y los términos de DreamShaper.
- Demos y pruebas de concepto de IA generativa on-device: útil para evaluar el rendimiento real de difusión en CPU móvil (tiempo por imagen, consumo, calidad a 4 pasos) sin montar infraestructura de servidor.
- Educación y experimentación con LCM y cuantización: el repositorio documenta el pipeline completo (fusión de LoRA, exportación ONNX, conversión MNN con 8 bits asimétricos), lo que lo convierte en un ejemplo reproducible para estudiar el despliegue de modelos de difusión en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, latencia medida, throughput) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada: el bundle completo pesa 1,2 GB en disco; en ejecución, el UNet de 8 bits (862 MB de pesos) más el text encoder f16 (170 MB) y el VAE decoder f16 (99,0 MB) determinan el consumo. La model card indica telefonos con 8 GB de RAM o más como clase objetivo.
- GPU recomendadas: no aplica en el escenario previsto; el modelo está exportado para CPU Android. No se documenta soporte para A100, H100 ni RTX 4090, ni se proporcionan pesos en formatos habituales de GPU (safetensors, GGUF).
- ¿Cabe en GPU de consumo? No hay información que lo confirme; el formato MNN y la ausencia de pesos estándar hacen que no sea un modelo directamente desplegable en GPUs de consumo con las herramientas habituales.
- Opciones de despliegue: runtime MNN, a través de la app TokForge (Google Play en Android, TestFlight en iOS) o integrado en un motor de difusión MNN propio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no son runtimes de difusión.
- Latencia y throughput: no disponibles. La model card solo especifica 4 pasos por defecto (hasta 8) y CFG 1.0, sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Pasos | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|---|---|
| TokForge-SD15-LCM-MNN-b1 (este) | SD1.5 + LCM-LoRA fusionado | no disponible | prompt CLIP 77 tokens (estandar SD1.5) | 4 (hasta 8) | MNN, UNet 8 bits | creativeml-openrail-m + terminos DreamShaper | Android CPU |
| TokForge-SD15-LCM-MNN (variante hermana) | SD1.5 + LCM-LoRA fusionado | no disponible | prompt CLIP 77 tokens | 4 (hasta 8) | MNN, UNet batch 2 | creativeml-openrail-m + terminos DreamShaper | Android CPU, builds antiguas de TokForge |
| Lykon/dreamshaper-7 | SD1.5 | no disponible | prompt CLIP 77 tokens | 20-30 tipicos | safetensors (diffusers) | creativeml-openrail-m + terminos Civitai | GPU / CPU via diffusers |
| latent-consistency/lcm-lora-sdv1-5 | LoRA sobre SD1.5 | no disponible | prompt CLIP 77 tokens | 4-8 | safetensors (LoRA) | creativeml-openrail-m | GPU / CPU via diffusers |

La comparación relevante es con sus dos componentes de origen: frente a DreamShaper 7 sin LCM, este bundle reduce los pasos de muestreo de decenas a 4 y elimina el pase incondicional, a cambio de una cuantización a 8 bits y de quedar atado al runtime MNN. Frente a la variante batch-2, el ahorro es de un pase de UNet por paso. No se dispone de datos de rendimiento comparativos publicados.

## Limitaciones y advertencias

- Es un bundle de runtime, no un modelo autónomo: está construido para el motor de difusión MNN de TokForge y no se puede cargar con diffusers, ComfyUI ni otras herramientas estándar sin conversión.
- La variante batch-1 es incompatible con builds antiguas de TokForge (por ejemplo, 3.6.0 beta 12), que alimentan al UNet un batch de 2 y fallarían con esta exportación; esas versiones deben usar el repositorio hermano batch-2.
- Cuantización a 8 bits del UNet: puede introducir pérdida de calidad frente al checkpoint original en fp16/fp32, especialmente en detalles finos.
- Resolución fija documentada de 512x512; no se garantiza calidad fuera de ese tamaño aunque el grafo admita dimensiones dinámicas.
- Solo inglés en el prompt; el tokenizer CLIP de SD1.5 limita la longitud efectiva del prompt a 77 tokens.
- Riesgo de sesgos y de contenido no deseado heredado de los datos de entrenamiento de DreamShaper 7 y SD1.5; no se documentan mitigaciones específicas.
- Riesgo de alucinación visual: el modelo puede generar anatomía, texto y estructuras incoherentes, especialmente a 4 pasos y sin prompt negativo.
- Restricciones de licencia: CreativeML OpenRAIL-M impone restricciones de uso (incluida la prohibición de usos dañinos y la obligación de propagar las restricciones), y los términos de Lykon para DreamShaper en Civitai prohíben la venta. Es imprescindible revisar ambas antes de cualquier uso comercial.
- Sin datos de benchmarks, latencia ni consumo energético publicados; cualquier estimación de rendimiento en producción debe medirse empíricamente en el dispositivo objetivo.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-MNN-b1
- Variante batch-2: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-MNN
- Colección TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
- Colección TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
- Modelo base DreamShaper 7: https://huggingface.co/Lykon/dreamshaper-7
- LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (app TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
