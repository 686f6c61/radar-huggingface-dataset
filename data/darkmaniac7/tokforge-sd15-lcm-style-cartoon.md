# darkmaniac7/TokForge-SD15-LCM-Style-Cartoon

## Resumen

TokForge-SD15-LCM-Style-Cartoon es un paquete de difusión para generación de imágenes texto-a-imagen en formato MNN, pensado para inferencia en dispositivo (on-device) en teléfonos Android. Lo publica TokForge (darkmaniac7) y consiste en Stable Diffusion 1.5 con el checkpoint DreamShaper 7 de Lykon como base, el adaptador LCM-LoRA SD1.5 de latent-consistency y el LoRA de estilo cartoon de shawn323, ambos fusionados en el UNet en el momento de la exportación. El resultado es un generador de 512x512 que produce imágenes con un estilo cartoon de contornos nítidos y sombreado plano en tan solo 4 pasos de muestreo sin classifier-free guidance (CFG 1.0).

El modelo no es un transformer de lenguaje ni un modelo de razonamiento: es un bundle de difusión con arquitectura SD1.5 (text encoder CLIP ViT-L/14, UNet y decoder VAE). Su relevancia radica en el formato: los pesos del UNet están cuantizados a 8 bits asimétricos y los del text encoder y VAE a f16, con grafos MNN preparados para ejecución en CPU de móviles. El repositorio ocupa 1,21 GB repartidos en 9 ficheros.

Esta ficha corresponde a la exportación original con batch 2 fijo, mantenida en línea únicamente por compatibilidad con versiones antiguas de la app TokForge (por ejemplo, 3.6.0 beta 12). La versión actual de la aplicación descarga la copia batch-1, con UNet de altura y anchura dinámicas, publicada en un repositorio separado. Los pesos son idénticos entre ambas variantes; solo cambia el grafo del UNet.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (text encoder CLIP ViT-L/14, UNet, decoder VAE) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; prompt CLIP de 77 tokens) |
| Tipos de cuantización | UNet en 8 bits asimétrico; text encoder y VAE decoder en f16 |
| Idiomas soportados | inglés (en) |
| Licencia | CreativeML OpenRAIL-M, más los términos de Civitai de Lykon para DreamShaper (prohíben la venta) |
| Formato de pesos | MNN (grafos `.mnn` más ficheros `.mnn.weight`); tokenizer CLIP en `vocab.json` y `merges.txt` |
| Resolución de salida | 512x512 fija |
| Batch del UNet | batch 2 fijo (pase condicional y no condicional) |
| Pasos de muestreo | 4 por defecto, hasta 8 para refinamiento |
| CFG scale | 1.0 (sin guidance; sin prompt negativo) |
| Tamaño del repositorio | 1,21 GB (9 ficheros) |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5 sin modificaciones estructurales: un text encoder CLIP ViT-L/14 que proyecta el prompt a embeddings, un UNet que ejecuta el proceso de difusión sobre latentes de 64x64 y un decoder VAE que reconstruye la imagen final de 512x512. Sobre el checkpoint base DreamShaper 7 de Lykon se fusionaron secuencialmente dos adaptadores LoRA en fp32 mediante `fuse_lora` de diffusers: primero el LCM-LoRA SD1.5, que habilita el muestreo en pocos pasos sin guidance, y después el LoRA de estilo cartoon de shawn323. La fusión se realiza en el momento de la exportación, de modo que los adaptadores no se cargan en tiempo de ejecución: el UNet exportado ya los incorpora en sus pesos.

No se dispone de información sobre el dataset de entrenamiento original de DreamShaper 7 ni sobre el volumen de tokens o imágenes utilizado; esos detalles pertenecen a los modelos base y no se documentan en esta model card. Tampoco se indica que se haya aplicado RLHF, DPO ni ningún otro ajuste por preferencias, algo que no aplica a un modelo de difusión de este tipo. La innovación técnica destacable es la combinación de LCM (Latent Consistency Model) con la cuantización a 8 bits del UNet y la exportación a MNN: el LCM-LoRA permite generar una imagen coherente en 4 pasos con CFG 1.0, lo que reduce el coste computacional lo suficiente para ejecutar el modelo en CPU de teléfonos Android. Al ser el muestreo sin guidance, el pase no condicional del UNet no aporta nada; la variante batch-1 de este mismo modelo explota ese hecho ejecutando un único pase condicional por paso, mientras que esta exportación batch-2 mantiene el pase doble por compatibilidad con versiones antiguas de la app.

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 en estilo cartoon, con contornos nítidos, sombreado plano y acabado de animación.
- Muestreo en pocos pasos: 4 pasos por defecto con CFG 1.0, ampliable a 8 para refinamiento adicional.
- Inferencia en dispositivo (on-device) en CPU de teléfonos Android mediante el runtime MNN, sin necesidad de servidor ni conexión de red.
- Estilo fijado en los pesos: el LoRA cartoon está fusionado en el UNet, por lo que todas las imágenes salen con ese estilo y no es posible desactivarlo en tiempo de ejecución.
- Prompts en inglés (tokenizer CLIP estándar de SD1.5).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; es exclusivamente un generador de imágenes.
- No soporta prompt negativo en la configuración recomendada, ya que a CFG 1.0 el pase no condicional no tiene efecto.

## Casos de uso

- Generación de avatares e ilustraciones cartoon en aplicaciones móviles: el modelo se ejecuta en CPU del teléfono con 4 pasos y CFG 1.0, lo que permite ofrecer generación de imágenes sin conexión y sin coste de servidor en apps Android integradas con TokForge.
- Creación de assets para prototipos de videojuegos o animación: el estilo cartoon fusionado produce de forma consistente personajes y escenarios con contornos limpios y sombreado plano, adecuados para maquetas rápidas y pruebas de concepto visuales.
- Generación de ilustraciones para contenido editorial o redes sociales: la ventana de 4 pasos y la resolución de 512x512 permiten iterar rápidamente sobre variaciones de un prompt hasta obtener la composición deseada.
- Aplicaciones de creatividad para el consumidor: apps de stickers, cómics cortos o posters que necesiten un look cartoon uniforme sin que el usuario tenga que ajustar LoRAs ni parámetros de muestreo.
- Demos y entornos educativos de difusión en dispositivo: sirve para mostrar cómo un pipeline SD1.5 completo con LCM y cuantización 8 bits cabe en un móvil, con los ficheros MNN y el tokenizer incluidos en el bundle.
- Compatibilidad con versiones antiguas de TokForge: mantener este repositorio permite que builds como 3.6.0 beta 12, que siempre alimentan al UNet un batch de dos, sigan descargando y ejecutando el modelo sin fallos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos suman 1,13 GB (UNet 862 MB en 8 bits, text encoder 170 MB en f16, VAE decoder 99 MB en f16, más grafos y tokenizer); el modelo necesita más RAM libre que ese tamaño de pesos para operar.
- Clase de teléfono: las versiones antiguas de TokForge lo listaban para dispositivos con 8 GB de RAM o más; la app actual no le asigna clase de catálogo.
- GPU recomendadas: no aplica; el bundle está pensado para CPU de Android mediante MNN. No se documenta soporte de GPU para esta exportación.
- ¿Cabe en GPU consumer? No es el objetivo del formato; no se proporcionan datos de ejecución en GPU (RTX 4090, A100, H100) para este bundle MNN.
- Opciones de despliegue: runtime MNN dentro de la app TokForge (Google Play en Android, TestFlight en iOS); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un bundle de difusión MNN.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución | Pasos / CFG | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TokForge-SD15-LCM-Style-Cartoon (este) | SD1.5 + LCM-LoRA + LoRA cartoon fusionados | 512x512 | 4 / 1.0 | MNN, UNet 8 bits, batch 2 fijo | CreativeML OpenRAIL-M + términos de DreamShaper (no venta) | Hugging Face; descarga desde builds antiguas de TokForge |
| TokForge-SD15-LCM-Style-Cartoon-b1 | Idéntica; solo cambia el grafo del UNet | 512x512 | 4 / 1.0 | MNN, UNet 8 bits, batch 1 con altura y anchura dinámicas | CreativeML OpenRAIL-M + términos de DreamShaper (no venta) | Hugging Face; descarga desde TokForge 3.6.0 beta 24 y posteriores |
| Lykon/dreamshaper-7 | SD1.5 | 512x512 (versátil) | Muestreo estándar con CFG | safetensors (diffusers) | CreativeML OpenRAIL-M + términos de Civitai (no venta) | Hugging Face |
| latent-consistency/lcm-lora-sdv1-5 | LoRA sobre SD1.5 | 512x512 | 4-8 / 1.0 | safetensors (LoRA) | CreativeML OpenRAIL-M | Hugging Face |

La comparación relevante es con la variante batch-1 del mismo bundle: pesos idénticos byte a byte salvo el grafo `unet.mnn`, que en la versión batch-1 usa `sample=[1,4,-1,-1]` para altura y anchura dinámicas y un solo pase condicional por paso. Los modelos base (DreamShaper 7 y LCM-LoRA) no están empaquetados para MNN y requieren conversión y cuantización para ejecutarse en dispositivo.

## Limitaciones y advertencias

- Estilo no desactivable: el LoRA cartoon está fusionado en los pesos del UNet, así que no se puede generar en otro estilo sin sustituir el modelo.
- Resolución y batch fijos: el UNet de esta exportación está compilado para 512x512 y batch 2; no admite otras resoluciones ni batches distintos sin reexportar.
- Sin prompt negativo efectivo: a CFG 1.0 el pase no condicional no influye en el resultado, por lo que no se puede guiar la generación alejándose de conceptos no deseados.
- Solo inglés: el tokenizer CLIP de SD1.5 y el modelo están orientados a prompts en inglés; el rendimiento con otros idiomas no está garantizado.
- Riesgo de sesgos y alucinación visual: como todo modelo de difusión entrenado con datos web a gran escala, puede reproducir estereotipos y generar anatomía, texto o detalles incoherentes, especialmente en composiciones complejas.
- Restricciones de licencia: CreativeML OpenRAIL-M impone restricciones de uso (prohibición de usos dañinos y de ciertas aplicaciones), y los términos de Civitai de DreamShaper de Lykon prohíben la venta del modelo o de sus derivados; conviene revisarlos antes de cualquier uso comercial.
- Repositorio heredado: esta exportación batch-2 solo se mantiene para builds antiguas de TokForge; la app actual descarga la variante batch-1, por lo que integrarla en flujos nuevos no es lo recomendado.
- Requisitos de memoria: necesita más RAM libre que sus 1,13 GB de pesos; en dispositivos con menos de 8 GB de RAM puede no ejecutarse de forma fiable.
- Sin datos de rendimiento publicados: no hay benchmarks ni métricas de latencia o calidad objetivas para este bundle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Cartoon
- Variante batch-1: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Cartoon-b1
- Colección TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
- Modelo base DreamShaper 7: https://huggingface.co/Lykon/dreamshaper-7
- LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- LoRA de estilo cartoon: https://huggingface.co/shawn323/sd-v1.5-lora-cartoon
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- TokForge en Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- TokForge en iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
