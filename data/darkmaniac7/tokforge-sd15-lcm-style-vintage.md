# darkmaniac7/TokForge-SD15-LCM-Style-Vintage

## Resumen

TokForge-SD15-LCM-Style-Vintage es un paquete de inferencia en formato MNN para generación de imágenes text-to-image, publicado por darkmaniac7 bajo la plataforma TokForge. Se trata de un merge de tres componentes: el checkpoint DreamShaper 7 de Lykon como base (Stable Diffusion 1.5), el adaptador LCM-LoRA SD1.5 de latent-consistency para muestreo en pocos pasos, y el LoRA de estilo vintage de shawn323, ambos fusionados en el UNet en tiempo de exportación. El resultado es un generador de imágenes de 512x512 que produce sistemáticamente una estética de impresión vintage cálida y desvaída, con muestreo sin guiado (CFG 1.0) en 4 pasos.

El modelo está empaquetado específicamente para inferencia on-device en teléfonos Android mediante la librería MNN, no como pesos estándar de diffusers. El repositorio contiene grafos MNN y pesos separados: UNet con cuantización de 8 bits asimétrica (862 MB), text encoder CLIP ViT-L/14 y VAE decoder en f16. El bundle completo ocupa 1,21 GB repartidos en 9 ficheros y está pensado para ejecutarse en CPU de dispositivos móviles con 8 GB de RAM o más.

La relevancia de esta ficha es acotada y conviene ser explícito: no es un modelo de propósito general ni una publicación de investigación, sino un artefacto de despliegue concreto para versiones antiguas de la app TokForge (por ejemplo, 3.6.0 beta 12). El propio autor indica que la versión actual de la app descarga el bundle batch-1 equivalente y que este repositorio se mantiene únicamente por compatibilidad con builds antiguas. Tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (text encoder CLIP ViT-L/14, UNet, VAE decoder) exportada a MNN |
| Parámetros totales | no disponible (no se publica el recuento; el bundle pesa 1,21 GB en 9 ficheros) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; entrada de prompt de longitud libre limitada por el tokenizador CLIP, sin cifra publicada) |
| Tipos de cuantización | UNet en 8 bits asimétrico; text encoder y VAE decoder en f16 |
| Idiomas soportados | en (inglés) |
| Licencia | CreativeML OpenRAIL-M, más los términos de Civitai de Lykon para DreamShaper (prohíbe la venta) |
| Formato de pesos | MNN (`.mnn` grafos + `.mnn.weight` pesos), más `vocab.json`, `merges.txt` y `alphas.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Stable Diffusion 1.5: un text encoder CLIP ViT-L/14, un UNet de difusión latente y un VAE decoder que produce imágenes de 512x512. Sobre esa base se aplican dos fusiones secuenciales de LoRA en diffusers, una a una con `fuse_lora` en fp32: primero LCM-LoRA SD1.5 y encima el LoRA de estilo vintage de shawn323. El UNet fusionado se exporta con cuantización de 8 bits asimétrica y batch fijo de 2 (pasada condicional y no condicional), con latente fijo de 64x64. El text encoder y el VAE decoder son los ficheros MNN de referencia de SD1.5 en f16, sin modificaciones.

No se publica información sobre el dataset de entrenamiento, número de tokens, composición de datos ni procesos de RLHF o DPO; los componentes base son checkpoints y LoRA preexistentes, y este repositorio no entrena nada nuevo, solo fusiona y exporta. La innovación técnica relevante es doble: por un lado, la fusión de LCM-LoRA permite generar una imagen coherente en 4 pasos con CFG 1.0, lo que elimina la pasada no condicional del UNet y reduce el coste computacional; por otro, el empaquetado MNN con UNet en 8 bits está diseñado para ejecución en CPU de móvil. Cabe señalar que, precisamente porque el muestreo es guidance-free, la pasada incondicional del batch-2 no aporta nada, y de ahí que exista el bundle batch-1 posterior que ejecuta una sola pasada condicional por paso.

## Capacidades

- Generación de imágenes text-to-image a 512x512 píxeles a partir de prompts en inglés.
- Estilización vintage consistente: paleta cálida y desvaída, acabado pictórico suave y atmósfera nostálgica, aplicada de forma fija en todas las imágenes.
- Muestreo en pocos pasos: 4 pasos por defecto, hasta 8 para refinamiento adicional.
- Muestreo sin guiado (CFG 1.0), lo que implica que no se usa prompt negativo.
- Ejecución on-device en CPU de teléfonos Android mediante MNN, sin necesidad de GPU ni de conexión a servidor.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión, audio ni modo thinking; es exclusivamente un generador de imágenes.
- Capacidad multilingüe limitada al inglés, idioma del tokenizador CLIP y de los prompts para los que está pensado.

## Casos de uso

- Generación de imágenes de estética vintage en la app TokForge: el caso de uso primario y prácticamente único; el bundle se descarga desde el catálogo de modelos de la app y se ejecuta en el dispositivo con los ajustes de render fijados (4 pasos, CFG 1.0, 512x512).
- Compatibilidad con versiones antiguas de TokForge: builds como 3.6.0 beta 12 descargan este repositorio por su nombre exacto y esperan un UNet con batch 2; mantenerlo online evita que esas instalaciones se rompan.
- Pruebas de regresión de la app: sirve para verificar que el motor de inferencia de builds antiguas sigue funcionando con el grafo batch-2 frente al bundle batch-1 actual.
- Prototipado de estilos artísticos en móvil: para desarrolladores que quieran evaluar el pipeline completo (CLIP + UNet 8 bits + VAE f16 en MNN) con un estilo ya fusionado, sin tener que montar la fusión de LoRA ellos mismos.
- Demostraciones de inferencia de difusión en CPU móvil: útil como referencia de consumo de RAM y tiempos de generación en un dispositivo de 8 GB con un UNet cuantizado a 8 bits.
- Generación de ilustraciones de ambiente retro para proyectos personales o experimentales en inglés, siempre que se respeten las restricciones de licencia (ver limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de calidad (FID, CLIP score u otras), ni latencias o throughput medidos, más allá de la indicación cualitativa de que produce una imagen coherente en 4 pasos.

## Requisitos de hardware

- VRAM/RAM: no es un modelo de GPU; está empaquetado para CPU de móvil. El bundle pesa 1,21 GB (UNet 862 MB en 8 bits, text encoder 170 MB en f16, VAE decoder 99 MB en f16), pero la model card advierte que necesita más RAM libre que esos 1,13 GB de pesos.
- Clase de dispositivo: las builds antiguas de TokForge lo listaban para teléfonos con 8 GB de RAM o más; la app actual no le asigna clase de catálogo.
- GPU recomendadas: no aplica; el formato MNN de este repositorio está orientado a CPU de Android. No hay información sobre ejecución en A100, H100 o RTX 4090.
- ¿Cabe en GPU consumer? No es el objetivo del bundle y no se documenta soporte para ello.
- Opciones de despliegue: la vía prevista es la app TokForge en Android (Google Play o TestFlight en iOS para la app, aunque este bundle concreto se documenta para Android). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión en MNN.
- Latencia y throughput: no disponibles; no se publican tiempos de generación por imagen ni pasos por segundo.

## Comparativa con modelos similares

| Modelo | Base | Pasos / CFG | Formato | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TokForge-SD15-LCM-Style-Vintage (este) | DreamShaper 7 + LCM-LoRA + vintage LoRA | 4 pasos, CFG 1.0 | MNN, UNet 8 bits | 1,21 GB (9 ficheros) | CreativeML OpenRAIL-M + términos de Civitai (no venta) | Público en HF, 0 descargas |
| TokForge-SD15-LCM-Style-Vintage-b1 | Mismos pesos, UNet batch-1 dinámico | 4 pasos, CFG 1.0 | MNN, UNet 8 bits | no disponible en la información | CreativeML OpenRAIL-M + términos de Civitai | Público en HF; es el que descarga la app actual |
| Lykon/dreamshaper-7 | SD1.5 afinado | Muestreo estándar multi-paso | safetensors (diffusers) | no disponible en la información | CreativeML OpenRAIL-M + términos de Civitai | Público en HF |
| latent-consistency/lcm-lora-sdv1-5 | LoRA sobre SD1.5 | 4-8 pasos, CFG 1.0 | LoRA (safetensors) | no disponible en la información | no disponible en la información | Público en HF |

La comparación relevante es interna: este repositorio y su variante batch-1 comparten todos los ficheros salvo `unet.mnn`, que difiere en el grafo (batch 2 fijo frente a batch 1 con altura y anchura dinámicas). El resto de ficheros, incluido `unet.mnn.weight`, son idénticos byte a byte (mismo sha256).

## Limitaciones y advertencias

- Modelo obsoleto por diseño: el propio autor indica que la app actual usa el bundle batch-1 y que este repositorio se conserva solo para builds antiguas; no debe elegirse para integraciones nuevas.
- Estilo fijo: el LoRA vintage está fusionado en los pesos del UNet, por lo que no es posible desactivarlo ni cambiar de estilo sin sustituir el modelo.
- Resolución fija de 512x512 y latente fijo de 64x64 en este export; el grafo batch-2 no admite altura y anchura dinámicas.
- Sin prompt negativo útil: a CFG 1.0 la pasada incondicional no aporta control, de modo que se pierde el ajuste fino mediante negative prompts.
- Solo inglés: los prompts deben redactarse en inglés; no hay soporte documentado de otros idiomas.
- Licencia restrictiva para uso comercial: CreativeML OpenRAIL-M se combina con los términos de Civitai de DreamShaper, que prohíben la venta. Cualquier uso comercial requiere revisar ambas licencias y, en la práctica, la restricción de venta de Lykon es un bloqueo relevante.
- Riesgo de sesgos y alucinación visual: al ser un modelo de difusión de SD1.5, puede reproducir sesgos presentes en sus datos de entrenamiento y generar contenido incoherente o anatómicamente incorrecto, especialmente en prompts complejos con varias figuras.
- Requisito de memoria superior al tamaño de los pesos: la model card advierte explícitamente que necesita más RAM libre que sus 1,13 GB de pesos, con lo que en dispositivos de 8 GB el margen es ajustado.
- Sin métricas publicadas: no hay benchmarks de calidad, latencia ni consumo que permitan evaluar el rendimiento de forma objetiva.
- Repositorio sin tracción: 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Vintage
- Variante batch-1: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Vintage-b1
- Colección TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
- Modelo base DreamShaper 7: https://huggingface.co/Lykon/dreamshaper-7
- LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- LoRA de estilo vintage: https://huggingface.co/shawn323/sd-v1.5-lora-vintage
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- App en Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
