# darkmaniac7/TokForge-SD15-LCM-Style-Vintage-b1

## Resumen

TokForge-SD15-LCM-Style-Vintage-b1 es un paquete de inferencia para generación de imágenes texto-a-imagen empaquetado en formato MNN, pensado para ejecutarse en dispositivos Android sin conexión. Lo publica TokForge (darkmaniac7) y deriva de la fusión de tres modelos: DreamShaper 7 de Lykon como checkpoint base, el adaptador LCM-LoRA SD1.5 de latent-consistency para muestreo en pocos pasos y el LoRA de estilo vintage de shawn323, ambos fusionados dentro del UNet en el momento de la exportación.

El modelo resuelve un problema muy concreto: llevar Stable Diffusion 1.5 con estilización fija a teléfonos móviles con 8 GB de RAM o más, con un tiempo de generación reducido gracias a LCM (4 pasos, CFG 1.0, sin prompt negativo). No es un modelo de propósito general ni un checkpoint publicable para investigación: es un artefacto de despliegue optimizado para el motor de la app TokForge, con el UNet cuantizado a 8 bits y el text encoder y el VAE en f16.

La relevancia actual está en la tendencia de inferencia on-device para modelos generativos: un paquete de 1,21 GB (9 ficheros) que produce imágenes de 512x512 en CPU de móvil, con el grafo UNet exportado a batch 1 con altura y anchura dinámicas (`sample=[1,4,-1,-1]`). Esta variante batch-1 es la que consumen las versiones recientes de TokForge (3.6.0 beta 24 en adelante, incluida la rama 1.3.x), mientras que las versiones antiguas siguen descargando el repositorio de batch 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (text encoder CLIP ViT-L/14, UNet, VAE decoder) |
| Parametros totales | no disponible (repo de 1,2 GB; UNet con pesos de 862 MB en 8 bits) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto CLIP, sin cifra publicada) |
| Tipos de cuantizacion | UNet: 8 bits asimetrico; text encoder y VAE decoder: f16 |
| Idiomas soportados | en |
| Licencia | creativeml-openrail-m, mas terminos de Civitai de Lykon para DreamShaper (prohibida la venta) |
| Formato de pesos | MNN (`.mnn` grafo + `.mnn.weight` pesos), tokenizer CLIP en `vocab.json` y `merges.txt`, `alphas.txt` para el scheduler |
| Resolucion de salida | 512x512 |
| Pasos de muestreo | 4 por defecto, hasta 8 para refinamiento |
| CFG scale | 1.0 (guidance-free) |
| Prompt negativo | no se usa a CFG 1.0 |
| Batch del UNet | 1, altura y anchura dinamicas |
| Tamano del repo | 1,2 GB (9 ficheros) |
| Libreria | mnn |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5 completa: un text encoder CLIP ViT-L/14 que proyecta el prompt a embeddings, un UNet que ejecuta la difusion en el espacio latente y un VAE decoder que reconstruye la imagen a pixeles. Sobre el checkpoint base DreamShaper 7 se fusionaron secuencialmente dos LoRA en fp32 mediante `fuse_lora` de diffusers: primero el LCM-LoRA SD1.5, que habilita el muestreo en 4 pasos con CFG 1.0, y despues el LoRA de estilo vintage de shawn323, que impone una paleta calida y desvaida de impresion antigua con aire pictorico y nostalgico.

El proceso de exportacion consistio en cargar DreamShaper 7 en diffusers, fusionar ambos LoRA uno a uno, exportar el UNet fusionado a ONNX trazado a batch 1 con altura y anchura dinamicas, y convertirlo a MNN con pesos de 8 bits. El text encoder y el VAE decoder se toman como ficheros MNN de referencia de SD1.5 en f16. No hay entrenamiento adicional ni RLHF/DPO: es una operacion de merge y conversion de formato. La unica diferencia entre esta variante y el repositorio `TokForge-SD15-LCM-Style-Vintage` es el grafo `unet.mnn`; el resto de ficheros, incluido `unet.mnn.weight`, son identicos byte a byte (mismo sha256).

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 en estilo vintage fijo (paleta calida y desvaida, acabado pictorico).
- Muestreo en pocos pasos: 4 pasos por defecto, hasta 8 para refinamiento, con CFG 1.0 y sin prompt negativo.
- Inferencia on-device en CPU de Android, sin conexion una vez descargado el modelo.
- Estilizacion consistente: el LoRA vintage esta fusionado en el UNet, por lo que el estilo no se puede desactivar ni modular por prompt.
- Soporte de altura y anchura dinamicas en el grafo UNet (batch 1), aunque la salida documentada es 512x512.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking.
- Capacidad multilingue limitada al ingles (`language: en`); el tokenizer es el CLIP de SD1.5.

## Casos de uso

- Generacion de imagenes en app movil sin conexion: el paquete esta disenado para el motor MNN de TokForge en Android, de modo que el usuario descarga 1,21 GB una vez y genera imagenes en local con 4 pasos, sin enviar prompts a un servidor.
- Prototipado de estilos vintage para producto: al estar el LoRA fusionado, cualquier prompt produce la misma estetica de impresion antigua, lo que sirve para validar rapido una direccion visual sin ajustar pesos.
- Ilustracion de contenido editorial con estetica retro: portadas, cabeceras o piezas de blog con paleta calida y acabado pictorico, generadas en lote a 512x512.
- Pruebas de inferencia on-device para desarrolladores: sirve como referencia de como empaquetar un UNet SD1.5 cuantizado a 8 bits con grafo batch-1 y dimensiones dinamicas en MNN.
- Filtros y avatares en aplicaciones moviles: generacion de imagenes de perfil o fondos con estilo uniforme, sin coste de servidor y con latencia de pocos pasos.
- Educacion y demos de difusion: ejemplo compacto de fusion de LCM-LoRA y LoRA de estilo sobre DreamShaper 7, util para explicar el pipeline de merge y exportacion a formatos de despliegue.
- Base para experimentos de cuantizacion: al estar el UNet en 8 bits y el resto en f16, permite medir el impacto de la cuantizacion en calidad visual frente al bundle sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, IS) ni comparaciones cuantitativas con otros modelos; solo documenta ajustes de render (4 pasos, CFG 1.0, 512x512) y el proceso de exportacion.

## Requisitos de hardware

- VRAM/RAM estimada: el catalogo de TokForge indica telefonos con 8 GB de RAM o mas; el paquete ocupa 1,21 GB en disco (9 ficheros).
- GPU recomendadas: no aplica en el caso de uso previsto (CPU de Android). Para ejecutar el bundle MNN en escritorio no hay recomendacion publicada.
- Cabe en GPU consumer: no hay datos publicados sobre ejecucion del bundle MNN en GPU de escritorio; el formato esta orientado a CPU movil.
- Opciones de despliegue: motor MNN dentro de la app TokForge (Android via Google Play, iOS via TestFlight). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusion en MNN.
- Latencia y throughput: no disponibles. La model card solo indica el numero de pasos (4 por defecto) y que la generacion ocurre en el telefono, sin cifras de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-SD15-LCM-Style-Vintage-b1 | no disponible (UNet 862 MB en 8 bits) | 512x512, 4 pasos, CFG 1.0 | MNN | creativeml-openrail-m + terminos Civitai de Lykon | Hugging Face, app TokForge |
| TokForge-SD15-LCM-Style-Vintage | mismos pesos | 512x512, 4 pasos, CFG 1.0 | MNN (UNet batch 2) | creativeml-openrail-m + terminos Civitai de Lykon | Hugging Face, builds antiguas de TokForge |
| Lykon/dreamshaper-7 | no disponible | SD1.5 estandar | safetensors/diffusers | creativeml-openrail-m + terminos Civitai | Hugging Face |
| latent-consistency/lcm-lora-sdv1-5 | adaptador LoRA | SD1.5 estandar | safetensors (LoRA) | creativeml-openrail-m | Hugging Face |

La comparativa relevante es interna al ecosistema TokForge: el bundle batch-1 frente al batch-2, que comparten pesos y solo difieren en el grafo UNet. Frente a DreamShaper 7 sin fusionar, este paquete anade el muestreo LCM de 4 pasos y el estilo vintage fijo, a costa de perder flexibilidad de estilo y de quedar atado al motor MNN.

## Limitaciones y advertencias

- Estilo no modificable: el LoRA vintage esta fusionado en el UNet, por lo que todas las imagenes salen con la misma estetica; no se puede desactivar ni combinar con otros estilos sin reexportar el modelo.
- Sin prompt negativo: a CFG 1.0 el muestreo es guidance-free y el prompt negativo no tiene efecto, lo que limita el control fino sobre la composicion.
- Resolucion fija documentada de 512x512; aunque el grafo admite altura y anchura dinamicas, no hay garantia de calidad fuera de esa resolucion.
- Solo ingles: el tokenizer CLIP de SD1.5 y la etiqueta `language: en` implican bajo rendimiento con prompts en castellano u otros idiomas.
- Riesgo de alucinacion visual y artefactos: como cualquier modelo de difusion, puede generar anatomia incorrecta, texto ilegible y detalles incoherentes, especialmente con 4 pasos.
- Restricciones de licencia: CreativeML OpenRAIL-M se suma a los terminos de Civitai de Lykon para DreamShaper, que prohiben la venta del modelo; conviene revisar ambas antes de uso comercial.
- Dependencia de version de la app: el grafo batch-1 hace fallar builds antiguas de TokForge (por ejemplo 3.6.0 beta 12), que esperan un batch de dos; el repositorio correcto depende de la version del cliente.
- Sin benchmarks publicados: no hay metricas objetivas de calidad que permitan comparar el bundle con el checkpoint original ni con alternativas.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion externa documentada.

## Enlaces

- Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Vintage-b1
- Repositorio batch-2: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Style-Vintage
- Modelo base DreamShaper 7: https://huggingface.co/Lykon/dreamshaper-7
- LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- LoRA vintage de shawn323: https://huggingface.co/shawn323/sd-v1.5-lora-vintage
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (app TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Coleccion TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
- Coleccion TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
