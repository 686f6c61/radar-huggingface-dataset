# darkmaniac7/TokForge-SD15-LCM-Style-Pixelart-b1

## Resumen

TokForge-SD15-LCM-Style-Pixelart-b1 es un paquete de inferencia para generación de imágenes texto-a-imagen en dispositivos Android, publicado por TokForge (darkmaniac7) en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una fusión controlada de tres componentes: el checkpoint DreamShaper 7 de Lykon como base (Stable Diffusion 1.5), el adaptador LCM-LoRA SD1.5 de latent-consistency para muestreo en pocos pasos, y el LoRA de estilo pixel art de SedatAl. Los tres se fusionan en los pesos del UNet en tiempo de exportación.

El resultado se distribuye como un bundle MNN optimizado para ejecución en CPU de teléfonos Android: UNet con pesos de 8 bits y batch 1 con altura y anchura dinámicas, codificador de texto CLIP ViT-L/14 y decodificador VAE en f16. El objetivo es permitir que la aplicación TokForge genere imágenes de estilo pixel art retro (estética de sprites de 16 bits) en 4 pasos de muestreo sin classifier-free guidance (CFG 1.0), sin conexión a red una vez descargado el modelo.

La relevancia de esta ficha es doble: por un lado, documenta una variante de despliegue edge de SD1.5 con restricciones muy concretas (8 GB de RAM o más, formato MNN propietario de Alibaba, sin soporte para diffusers estándar); por otro, ilustra un patrón de empaquetado de LoRAs fusionados que no es reutilizable fuera del ecosistema TokForge. El repositorio ocupa 1,2 GB y contiene 9 ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + CLIP ViT-L/14 + VAE) |
| Parametros totales | no disponible (no se declara el recuento; SD1.5 canónico ronda 860 M en UNet, ~123 M en text encoder y ~84 M en VAE) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt limitado por el tokenizador CLIP, 77 tokens) |
| Tipos de cuantizacion | UNet en 8 bits asimétrico; text encoder y VAE en f16 |
| Idiomas soportados | en (inglés) |
| Licencia | creativeml-openrail-m, más los términos de Civitai de DreamShaper (prohibida la venta) |
| Formato de pesos | MNN (`.mnn` + `.mnn.weight`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es Stable Diffusion 1.5: un UNet con bloques residuales y atención cruzada, un codificador de texto CLIP ViT-L/14 y un decodificador VAE. Sobre el checkpoint base DreamShaper 7 se aplican secuencialmente dos LoRAs fusionados en fp32 mediante `fuse_lora` de diffusers: primero `latent-consistency/lcm-lora-sdv1-5` y después `SedatAl/pixel-art-LoRa`. El UNet fusionado se exporta a ONNX trazado en batch 1 con altura y anchura dinámicas (`sample=[1,4,-1,-1]`) y se convierte a MNN con pesos de 8 bits. El codificador de texto y el VAE se toman como referencias SD1.5 en MNN con pesos f16.

No se aporta información sobre el dataset de entrenamiento original de DreamShaper 7, ni sobre el volumen de tokens, ni sobre si hubo RLHF o DPO. El autor no documenta ningún proceso de fine-tuning adicional más allá de la fusión de LoRAs. La innovación técnica destacable es la exportación en batch 1: como el muestreo LCM es guidance-free (CFG 1.0), la pasada incondicional del UNet no aporta nada, de modo que el motor de TokForge ejecuta una sola pasada condicional por paso en lugar de un batch de dos. Esto reduce el coste computacional por paso a la mitad, a cambio de romper la compatibilidad con versiones antiguas de la app (por ejemplo, TokForge 3.6.0 beta 12), que alimentan siempre un batch de dos y fallarían con esta exportación.

## Capacidades

- Generación de imágenes texto-a-imagen en resolución fija de 512x512.
- Estilo pixel art integrado de forma permanente: todas las salidas adoptan la estética retro de sprites de 16 bits, sin posibilidad de desactivarla.
- Muestreo en pocos pasos: 4 pasos por defecto, hasta 8 para refinamiento adicional, gracias al adaptador LCM.
- Muestreo sin guidance (CFG 1.0), por lo que no se admiten prompts negativos.
- Ejecución completamente offline en el dispositivo una vez descargado el bundle.
- Soporte de altura y anchura dinámicas en el grafo del UNet (aunque el ajuste recomendado es 512x512).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modalidades distintas de texto-a-imagen.
- Capacidad multilingüe limitada al inglés por el tokenizador CLIP y por los prompts de entrenamiento.

## Casos de uso

- Generación de sprites y assets para videojuegos indie: el modelo produce imágenes de 512x512 con estética pixel art coherente en 4 pasos, adecuadas como base para tilesets, personajes o iconos que después se reducen y paletizan en el pipeline del estudio.
- Prototipado rápido de arte conceptual en movilidad: un diseñador puede iterar prompts directamente en un Android de 8 GB de RAM sin conexión, útil en entornos sin red o con requisitos de confidencialidad.
- Aplicaciones Android de creatividad integradas: cualquier app que embeba el runtime MNN y el bundle puede ofrecer generación de imágenes pixel art on-device, sin coste de API ni latencia de red.
- Generación de avatares y assets para comunidades retro: foros, servidores de Discord o apps de mensajería que necesiten iconos de estilo 16 bits generados a partir de una descripción textual.
- Educación y demostraciones de difusión en el borde: sirve para mostrar en talleres cómo se despliega un modelo de difusión cuantizado en un teléfono, con un caso de estudio real de fusión de LoRAs y exportación a MNN.
- Contenido para prototipos de juegos móviles: generación de placeholders visuales coherentes estilísticamente antes de encargar arte final, reduciendo el tiempo de bloqueo de los equipos de diseño.
- Filtros creativos en apps de fotografía o redes sociales: integrado como modo "pixel art" que transforma un prompt en una imagen con esa estética concreta, siempre que la app acepte la licencia OpenRAIL-M y las restricciones de DreamShaper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de FID, CLIP score, ni comparaciones cuantitativas con otros modelos. Tampoco se documentan latencias ni throughput medidos en dispositivos concretos.

## Requisitos de hardware

- VRAM/RAM estimada: el autor indica que el bundle está pensado para teléfonos Android con 8 GB de RAM o más. El tamaño de descarga es de 1,21 GB repartido en 9 ficheros; el UNet en 8 bits pesa 862 MB, el text encoder f16 170 MB y el VAE f16 99 MB.
- GPU recomendadas: no aplica en el caso de uso previsto (CPU de Android). No se documenta soporte para GPU de escritorio ni para CUDA.
- ¿Cabe en GPU consumer? El bundle está diseñado para CPU móvil, no para GPU de escritorio. No se proporcionan instrucciones para ejecutarlo en una RTX 4090, RTX 3090 u otras GPU consumer mediante MNN.
- Opciones de despliegue: exclusivamente el runtime MNN dentro de la app TokForge (Android vía Google Play, iOS vía TestFlight). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni diffusers directamente, dado que el formato es MNN y no safetensors.
- Latencia y throughput: no disponibles. El autor no publica tiempos por imagen ni pasos por segundo en ningún dispositivo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/prompt | Resolucion | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| TokForge-SD15-LCM-Style-Pixelart-b1 | no disponible (SD1.5) | 77 tokens CLIP | 512x512 | MNN | creativeml-openrail-m + Civitai (no venta) | Solo TokForge (Android/iOS) |
| Lykon/dreamshaper-7 | SD1.5 (~860 M UNet) | 77 tokens CLIP | 512x512 | safetensors | creativeml-openrail-m | diffusers, A1111, ComfyUI |
| latent-consistency/lcm-lora-sdv1-5 | adaptador LoRA | no aplica | 512x512 | safetensors | openrail | diffusers (fusión) |
| SedatAl/pixel-art-LoRa | adaptador LoRA | no aplica | 512x512 | safetensors | no disponible en la información | diffusers (fusión) |

La comparativa directa más justa es con el propio DreamShaper 7 sin fusionar: misma arquitectura y misma licencia base, pero el modelo de TokForge añade el estilo pixel art fijo y el muestreo en 4 pasos, a cambio de perder portabilidad (solo MNN/TokForge) y de heredar la restricción de no venta de DreamShaper. Frente a un SD1.5 estándar con LCM-LoRA aplicado en diffusers, este bundle ofrece menor huella de memoria y ejecución offline en móvil, pero carece de flexibilidad de estilo y de ecosistema de herramientas.

## Limitaciones y advertencias

- Estilo fijado de forma permanente: el LoRA de pixel art está fusionado en los pesos, por lo que no se puede desactivar ni modular la intensidad sin volver a exportar el modelo.
- Sin prompts negativos: al operar con CFG 1.0, el muestreo guidance-free impide usar negative prompts, lo que limita el control fino sobre la salida.
- Idioma limitado al inglés: el tokenizador CLIP y los datos de entrenamiento originales no garantizan buen rendimiento con prompts en castellano u otros idiomas.
- Licencia restrictiva para uso comercial: además de CreativeML OpenRAIL-M, el autor indica que se aplican los términos de Civitai de DreamShaper, que prohíben la venta. Cualquier uso comercial requiere revisión legal específica.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, texto ilegible y artefactos, especialmente en composiciones complejas o prompts ambiguos.
- Sesgos heredados del checkpoint base: DreamShaper 7 arrastra los sesgos de su dataset de entrenamiento (representación demográfica, estilos culturales), no documentados por el autor de este bundle.
- Compatibilidad frágil: la exportación en batch 1 rompe versiones antiguas de TokForge (3.6.0 beta 12 y anteriores), que descargan el repositorio alternativo de batch 2. Cualquier cambio en el motor de inferencia puede invalidar el bundle.
- Ecosistema cerrado: no es ejecutable con diffusers, ComfyUI, A1111, vLLM ni llama.cpp; solo con el runtime MNN y la app TokForge.
- Sin benchmarks publicados: no hay métricas objetivas de calidad, latencia ni consumo energético que permitan evaluar el rendimiento real en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere adopción muy limitada y ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Pixelart-b1
- Variante batch 2: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Pixelart
- Colección TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
- Colección TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
- Modelo base DreamShaper 7: https://huggingface.co/Lykon/dreamshaper-7
- LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- LoRA de estilo pixel art: https://huggingface.co/SedatAl/pixel-art-LoRa
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Sitio web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (app TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- TestFlight iOS (app TokForge): https://testflight.apple.com/join/jnufjzRr
