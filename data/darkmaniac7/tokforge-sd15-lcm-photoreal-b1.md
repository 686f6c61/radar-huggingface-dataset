# darkmaniac7/TokForge-SD15-LCM-Photoreal-b1

## Resumen

TokForge-SD15-LCM-Photoreal-b1 es un paquete de inferencia para generacion de imagenes fotorrealistas en dispositivos Android, publicado por TokForge bajo el identificador `darkmaniac7`. No se trata de un modelo entrenado desde cero, sino de una fusion del checkpoint Stable Diffusion 1.5 Realistic Vision V5.1 (de SG_161222) con el adaptador LCM-LoRA SD1.5, exportada al formato MNN para ejecucion en CPU de telefonos moviles. El resultado es un generador texto-a-imagen capaz de producir una imagen coherente de 512x512 en 4 pasos de muestreo, sin conexion a red una vez descargado el bundle.

La arquitectura subyacente es la clasica de Stable Diffusion 1.5: un text encoder CLIP ViT-L/14, una UNet y un VAE decoder. La innovacion practica esta en el empaquetado: la UNet se exporta en batch 1 con altura y anchura dinamicas (`sample=[1,4,-1,-1]`) y pesos de 8 bits asimetricos, mientras que el text encoder y el VAE decoder se mantienen en f16. El bundle completo ocupa 1,21 GB repartidos en 9 ficheros, y TokForge lo cataloga para telefonos con 8 GB de RAM o mas.

Su relevancia actual radica en la combinacion de dos tecnicas consolidadas: la destilacion de consistencia latente (LCM) que reduce el numero de pasos de inferencia a 4 con CFG 1.0 (sin classifier-free guidance), y un pipeline de exportacion a MNN que permite ejecutar difusion en CPU movil sin GPU dedicada. El modelo se publica en dos variantes con pesos identicos y solo distinto grafo de UNet, para compatibilidad con versiones antiguas y nuevas de la app TokForge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (CLIP ViT-L/14 text encoder, UNet, VAE decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (prompt de texto CLIP, limite estandar de 77 tokens) |
| Tipos de cuantizacion | UNet en 8 bits asimetricos; text encoder y VAE decoder en f16 |
| Idiomas soportados | en (ingles) |
| Licencia | CreativeML OpenRAIL-M, mas los terminos de Civitai de SG_161222 para Realistic Vision (atribucion, no venta, mismos permisos) |
| Formato de pesos | MNN (`.mnn` + `.mnn.weight`), bundle de difusion para inferencia on-device |
| Tamano del repositorio | 1,2 GB (9 ficheros) |
| Resolucion de salida | 512x512 |
| Pasos de muestreo | 4 por defecto, hasta 8 para refinamiento |
| CFG scale | 1.0 (guidance-free) |
| Prompt negativo | No se usa a CFG 1.0 |
| Modelo base | SG161222/Realistic_Vision_V5.1_noVAE + latent-consistency/lcm-lora-sdv1-5 |
| Libreria | mnn |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El modelo no se entrena en este repositorio: se construye mediante un pipeline de fusion y exportacion documentado por el autor. Primero se carga `SG161222/Realistic_Vision_V5.1_noVAE` en diffusers y se fusiona el LCM-LoRA `latent-consistency/lcm-lora-sdv1-5` con `fuse_lora` en fp32. Despues se exporta la UNet fusionada a ONNX, trazada en batch 1 con altura y anchura dinamicas, de modo que MNN reporta `sample=[1,4,-1,-1]`. Finalmente se convierte la UNet a MNN con pesos de 8 bits y se anaden el text encoder y el VAE decoder de referencia de SD1.5 en f16, junto con el tokenizador CLIP (`vocab.json`, `merges.txt`) y los alphas del scheduler (`alphas.txt`).

Realistic Vision V5.1 se distribuye como "noVAE", por lo que el bundle utiliza el VAE estandar de SD1.5, el mismo que emplean los bundles basados en DreamShaper 7 de TokForge. La innovacion tecnica destacable es la exportacion en batch 1: como el muestreo LCM es guidance-free (CFG 1.0), la pasada incondicional de la UNet no aporta nada, y el motor de TokForge ejecuta una sola pasada condicional por paso en lugar de un batch de dos. Las versiones antiguas de la app (por ejemplo TokForge 3.6.0 beta 12) siempre alimentan la UNet con batch 2 y fallarian con esta exportacion, por lo que se mantiene un repositorio paralelo con grafo de batch 2 fijo. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion del dataset original de Realistic Vision V5.1 o del LCM-LoRA en la informacion proporcionada.

## Capacidades

- Generacion de imagenes texto-a-imagen con estetica fotorrealista: retratos con piel natural, texturas y iluminacion realistas, escenas fotograficas.
- Generacion en 4 pasos de muestreo (hasta 8 para refinamiento), lo que reduce el coste computacional frente a los 20-50 pasos de un SD1.5 convencional.
- Inferencia completamente on-device en CPU de telefonos Android, sin necesidad de conexion tras la descarga del bundle.
- Salida a resolucion fija de 512x512.
- Soporte de altura y anchura dinamicas en el grafo de la UNet exportada.
- Prompt en ingles (unico idioma declarado).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusion puro.
- No dispone de modo thinking, vision de entrada, audio ni capacidades multimodales mas alla del texto como condicionamiento.

## Casos de uso

- Generacion de retratos fotorrealistas en apps moviles: el modelo produce imagenes de 512x512 con aspecto fotografico en 4 pasos, adecuado para funciones de creacion de avatares o retratos sinteticos dentro de una app Android, sin enviar prompts a un servidor.
- Prototipado offline de conceptos visuales: al ejecutarse en CPU del telefono y no requerir red tras la descarga, sirve para generar bocetos visuales en entornos sin conectividad, como trabajo de campo o zonas con cobertura limitada.
- Ilustracion de contenido para redes sociales desde el dispositivo: la estetica fotorrealista y la resolucion de 512x512 encajan en publicaciones moviles, con la ventaja de que la imagen se genera localmente y no se transmite a terceros.
- Integracion en la app TokForge como estilo "Photoreal": el bundle esta pensado para descargarse desde el catalogo de modelos recomendados de TokForge en telefonos con 8 GB de RAM o mas y seleccionarse como modelo de imagen.
- Pruebas de concepto de difusion on-device para desarrolladores Android: el bundle MNN con UNet en 8 bits y text encoder/VAE en f16 sirve como referencia para medir latencia y consumo en CPU movil con un pipeline SD1.5 + LCM.
- Generacion de imagenes con requisitos de privacidad: al no requerir conexion, los prompts y las imagenes no salen del dispositivo, lo que resulta adecuado para casos donde el contenido generado no debe registrarse en servidores externos.
- Comparacion de estilos dentro de TokForge: al compartir pesos con el bundle DreamShaper 7 salvo la UNet, permite contrastar el look fotorrealista de Realistic Vision frente al mas estilizado de DreamShaper manteniendo el resto del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el bundle esta disenado para ejecucion en CPU de telefonos Android. El tamano de los pesos es de 862 MB para la UNet en 8 bits, 170 MB para el text encoder en f16 y 99 MB para el VAE decoder en f16, con un total de bundle de 1,21 GB.
- GPU recomendadas: no disponible. El bundle esta orientado a CPU movil, no a GPU de escritorio.
- Cabe en consumer GPU: no disponible. El formato MNN y el diseno batch-1 estan pensados para Android; no se documenta su ejecucion en GPU de escritorio.
- Clase de dispositivo objetivo: telefonos Android con 8 GB de RAM o mas, segun el catalogo de TokForge.
- Opciones de despliegue: la via documentada es la app TokForge (Google Play en Android, TestFlight en iOS), que descarga el bundle desde el catalogo de modelos recomendados. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion en formato MNN.
- Latencia y throughput: no disponible. No se publican cifras de tiempo por imagen ni de imagenes por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pasos de muestreo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TokForge-SD15-LCM-Photoreal-b1 (este) | no disponible (SD1.5) | prompt CLIP estandar | 4 (hasta 8) | MNN, UNet 8 bits | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face, app TokForge |
| TokForge-SD15-LCM-Photoreal | no disponible (SD1.5) | prompt CLIP estandar | 4 (hasta 8) | MNN, UNet batch 2 fijo | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face, versiones antiguas de TokForge |
| SG161222/Realistic_Vision_V5.1_noVAE | no disponible (SD1.5) | prompt CLIP estandar | 20-50 (tipico en SD1.5) | safetensors (checkpoint) | CreativeML OpenRAIL-M + terminos Civitai | Hugging Face |
| latent-consistency/lcm-lora-sdv1-5 | no disponible (LoRA) | prompt CLIP estandar | 4-8 con LCM | safetensors (LoRA) | CreativeML OpenRAIL-M | Hugging Face |

La comparativa se limita a los modelos citados en la informacion disponible. No se dispone de datos de rendimiento cuantitativo (FID, CLIP score, latencia) para establecer una comparacion numerica con alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: los prompts en otros idiomas no estan soportados oficialmente.
- Resolucion de salida fija de 512x512; no se documenta soporte para otras resoluciones en el bundle.
- A CFG 1.0 no se utiliza prompt negativo, lo que limita el control fino sobre el resultado en comparacion con el muestreo clasico de SD1.5.
- Al derivar de Realistic Vision V5.1, hereda los sesgos del checkpoint original y del dataset de entrenamiento de SD1.5, no documentados en la informacion proporcionada.
- Riesgo de alucinacion visual y artefactos propios de la difusion: manos, texto en imagen y coherencia de detalles finos pueden fallar, especialmente con solo 4 pasos.
- Restricciones de licencia: CreativeML OpenRAIL-M impone restricciones de uso (incluido uso comercial con condiciones), y ademas se anaden los terminos de Civitai de SG_161222 para Realistic Vision (atribucion, no venta, mismos permisos). Es necesario revisar ambas licencias antes de un uso comercial.
- Dependencia de la app TokForge y de la version del motor: la exportacion batch-1 no es compatible con versiones antiguas de la app (por ejemplo 3.6.0 beta 12), que requieren el repositorio de batch 2.
- Requiere telefonos con 8 GB de RAM o mas segun el catalogo de TokForge; en dispositivos con menos memoria el rendimiento o la viabilidad no estan garantizados.
- No es un modelo de lenguaje: no soporta razonamiento, codigo, tool calling ni agentes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy limitada fuera del ecosistema TokForge.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Photoreal-b1
- Repositorio variante batch 2: https://huggingface.co/darkmaniac7/TokForge-SD15-LCM-Photoreal
- Modelo base Realistic Vision V5.1: https://huggingface.co/SG161222/Realistic_Vision_V5.1_noVAE
- LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Sitio web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (app TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight (app TokForge): https://testflight.apple.com/join/jnufjzRr
- Coleccion TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
- Coleccion TokForge SD1.5 LCM Styles (MNN): https://huggingface.co/collections/darkmaniac7/tokforge-sd15-lcm-styles-mnn-6af3fddeecdd665d9b523cbe
