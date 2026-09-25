# mahmudplx/coreml-realisticvision-5.1-6bit

## Resumen

Este repositorio contiene una conversion a formato Apple CoreML del modelo de generacion de imagenes Realistic Vision V5.1, un finetune fotorrealista de Stable Diffusion 1.5 desarrollado por SG161222. La conversion, realizada con la herramienta oficial `ml-stable-diffusion` de Apple (`torch2coreml`), aplica una cuantizacion palettizada de 6 bits y la implementacion de atencion `SPLIT_EINSUM_V2`, lo que permite que los pesos compilen rapidamente en la Apple Neural Engine (ANE) de dispositivos iOS 17 o superiores. El objetivo es la generacion de imagenes fotorrealistas completamente en el dispositivo, sin conexion a servidor, dentro de la aplicacion TokForge.

El repositorio `mahmudplx/coreml-realisticvision-5.1-6bit` es un espejo sin cambios del modelo original `darkmaniac7/TokForge-RealisticVision-5.1-CoreML-6bit`, republicado para su uso en la aplicacion LimitlessAI. No se ha reentrenado ningun peso: se trata exclusivamente de una conversion de formato (PyTorch a CoreML) y una cuantizacion, donde toda la atribucion y los terminos de licencia corresponden a los autores originales.

La relevancia actual radica en que permite ejecutar un modelo de difusion fotorrealista de aproximadamente 1000 millones de parametros en hardware movil de Apple con un grafo optimizado para ANE, un caso practico de despliegue edge de modelos generativos. La licencia heredada es CreativeML OpenRAIL-M, con las restricciones que esta implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (UNet + text encoder CLIP + VAE), base Stable Diffusion 1.5 |
| Parametros totales | no disponible en la informacion proporcionada; el modelo base es un finetune de SD-1.5 (UNet de ~860 M, text encoder de ~123 M y VAE de ~83 M segun la arquitectura publica de SD-1.5) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; limitada por el text encoder CLIP, propio de SD-1.5 (limite tipico de 77 tokens de prompt) |
| Tipos de cuantizacion | Palettizada de 6 bits (`--quantize-nbits 6`); existe la variante FP16 del finetune original |
| Idiomas soportados | no disponible en la informacion proporcionada (el text encoder CLIP esta entrenado predominantemente en ingles) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | CoreML compilado (`.mlmodelc`) empaquetado en ZIP para Swift CLI; componentes: `TextEncoder.mlmodelc`, `Unet.mlmodelc`, `VAEDecoder.mlmodelc`, `VAEEncoder.mlmodelc`, `vocab.json`, `merges.txt` |

## Arquitectura y entrenamiento

El modelo subyacente es Realistic Vision V5.1, un finetune fotorrealista de Stable Diffusion 1.5. Su arquitectura es la de un modelo de difusion latente (LDM) clasico: un UNet que realiza el proceso de denoising en el espacio latente, un text encoder basado en CLIP que convierte el prompt en embeddings y un VAE que codifica y decodifica entre el espacio de pixeles y el espacio latente. La resolucion nativa de SD-1.5, y por tanto de esta conversion, es 512x512, valor que queda fijado en el modelo compilado.

No se ha realizado ningun entrenamiento ni ajuste adicional: la model card indica explicitamente que "no se reentrenaron pesos". El proceso de construccion fue: cargar `SG161222/Realistic_Vision_V5.1_noVAE` en formato diffusers (que ya incluye un VAE funcional), convertir UNet, text encoder, VAE decoder y VAE encoder a CoreML con `python_coreml_stable_diffusion.torch2coreml` usando `--attention-implementation SPLIT_EINSUM_V2`, aplicar palettizacion de 6 bits con `--quantize-nbits 6` y empaquetar los recursos compilados para el CLI de Swift con `--bundle-resources-for-swift-cli`. La conversion alcanzo un pico de aproximadamente 10,9 GB de RAM sin necesidad de `--chunk-unet`. La eleccion de 6 bits palettizados responde a que estos pesos compilan rapidamente en la ANE de iOS 17, frente a los finetunes FP16 cuyo grafo ANE tarda mas de 11 minutos en compilar.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con enfasis en fotorrealismo, gracias al finetune Realistic Vision V5.1.
- Generacion en el dispositivo (on-device) sin conexion a servidor, sobre Apple Neural Engine.
- Ejecucion como grafo CoreML optimizado con atencion `SPLIT_EINSUM_V2`.
- Control de generacion mediante parametros estandar de SD-1.5: pasos de muestreo (20 recomendados, 8 como minimo rapido, 40 para refinamiento), escala CFG (7,5 recomendada) y resolucion de 512x512.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento (son capacidades ajenas a un modelo de difusion de texto a imagen).
- Capacidades multilingues: no disponibles; el text encoder CLIP esta orientado predominantemente al ingles.

## Casos de uso

- Generacion de imagenes fotorrealistas en aplicaciones iOS: el modelo esta pensado para integrarse mediante el CLI de Swift de `ml-stable-diffusion` o dentro de apps como TokForge, produciendo retratos y escenas fotograficas de 512x512 en el propio dispositivo.
- Edicion y sintesis de imagenes sin conexion: al incluir `VAEEncoder` y `VAEDecoder`, el bundle permite flujos de image-to-image (codificar una imagen a latente, aplicar ruido y volver a decodificar) sin enviar datos a un servidor, util en contextos de privacidad.
- Aplicaciones de privacidad estricta: al ejecutarse on-device, los prompts y las imagenes no salen del dispositivo, adecuado para uso profesional con material sensible.
- Prototipado movil de producto: desarrolladores que quieran validar experiencias de generacion de imagenes en iPhone/iPad pueden usar este bundle sin montar infraestructura de GPU en la nube.
- Generacion de contenido para redes o marketing: produccion rapida de imagenes fotorrealistas de personas y escenas a partir de descripciones textuales, con control de estilo mediante prompts y CFG.
- Base para finetunes o LoRAs en el ecosistema CoreML: el bundle puede servir como punto de partida para convertir y cuantizar otros finetunes de SD-1.5 destinados a ANE (la coleccion TokForge incluye variantes como epiCRealism).
- Investigacion sobre despliegue edge de modelos de difusion: permite medir latencia, consumo y calidad de un LDM cuantizado a 6 bits en hardware movil de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score u otras) ni comparaciones cuantitativas de calidad frente a la version FP16 de Realistic Vision V5.1. Los unicos datos de rendimiento aportados son de tipo operativo: el grafo palettizado compila rapidamente en la ANE frente a los mas de 11 minutos de los finetunes FP16, y la conversion a CoreML alcanzo un pico de ~10,9 GB de RAM.

## Requisitos de hardware

- Plataforma objetivo: dispositivos Apple con iOS 17 o superior (la palettizacion de 6 bits requiere iOS 17+).
- Acelerador: Apple Neural Engine, configurando `compute: .cpuAndNeuralEngine` para aprovechar la compilacion rapida del grafo palettizado.
- Memoria en dispositivo: no se proporciona una cifra exacta de RAM de inferencia; el bundle de recursos ocupa ~913 MB y el ZIP compilado ~874 MB, lo que da una idea del peso en almacenamiento.
- Memoria durante la conversion: pico de ~10,9 GB de RAM en el proceso de conversion, no en la inferencia (dato relevante solo para quien reconvierta el modelo).
- GPU de escritorio (A100, H100, RTX 4090): no aplica, ya que el formato CoreML esta orientado a la ANE de Apple y no a GPUs NVIDIA/AMD.
- Opciones de despliegue: CLI de Swift de `ml-stable-diffusion`, integracion en apps iOS (TokForge, LimitlessAI), y el flujo oficial `ml-stable-diffusion` para CoreML. No es compatible con vLLM, llama.cpp, Ollama, TGI ni similares, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del dispositivo y de los pasos configurados (20 pasos y CFG 7,5 son los valores recomendados).

## Comparativa con modelos similares

| Modelo | Base | Cuantizacion | Formato | Destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mahmudplx/coreml-realisticvision-5.1-6bit | Realistic Vision V5.1 (SD-1.5) | 6 bits palettizada | CoreML (`mlmodelc`) | ANE / iOS 17+ | CreativeML OpenRAIL-M | Este repositorio (espejo) |
| darkmaniac7/TokForge-RealisticVision-5.1-CoreML-6bit | Realistic Vision V5.1 (SD-1.5) | 6 bits palettizada | CoreML (`mlmodelc`) | ANE / iOS 17+ | CreativeML OpenRAIL-M | Repositorio original de la conversion |
| LocalMuseAI/coreml-realistic-vision-v5-1-6bit | Realistic Vision V5.1 (SD-1.5) | 6 bits palettizada | CoreML (`mlmodelc`) | ANE / iOS 17+ | CreativeML OpenRAIL-M | Repositorio alternativo equivalente |
| mahmudplx/coreml-epicrealism-6bit | epiCRealism (SD-1.5) | 6 bits palettizada | CoreML (`mlmodelc`) | ANE / iOS 17+ | CreativeML OpenRAIL-M (heredada) | Otra conversion del mismo autor con un finetune fotorrealista distinto |
| SG161222/Realistic_Vision_V5.1_noVAE | SD-1.5 | FP16 (sin cuantizar) | safetensors (diffusers) | GPU / nube | CreativeML OpenRAIL-M | Modelo base original, no optimizado para movil |

## Limitaciones y advertencias

- Es una conversion de formato y cuantizacion, no un modelo nuevo: hereda todas las caracteristicas, sesgos y limitaciones de Realistic Vision V5.1 y de Stable Diffusion 1.5.
- Sesgos conocidos: los finetunes fotorrealistas de SD-1.5 pueden reproducir sesgos de representacion (etnicidad, genero, edad, cuerpo) y estereotipos presentes en los datos de entrenamiento; conviene revisar las salidas en contextos de produccion.
- Riesgo de alucinacion visual: puede generar anatomia incorrecta (manos, dedos, ojos), texto ilegible y geometrias incoherentes, especialmente a resoluciones distintas de 512x512.
- Resolucion limitada: la resolucion nativa es 512x512 y esta fijada en el modelo compilado; forzar otras resoluciones puede degradar la calidad.
- Idioma: el text encoder CLIP funciona mejor en ingles; no hay soporte multilingue declarado.
- La cuantizacion de 6 bits puede introducir una perdida de calidad respecto a la version FP16 del mismo finetune; no se aportan metricas que la cuantifiquen.
- Restricciones de licencia: CreativeML OpenRAIL-M impone condiciones de uso (prohibicion de determinadas categorias de contenido y obligacion de propagar la licencia y la atribucion); el uso comercial esta sujeto a dichos terminos.
- Entorno de ejecucion restringido: requiere iOS 17+ y hardware Apple con ANE; no es utilizable en GPUs de escritorio ni en servidores convencionales.
- Atribucion obligatoria: los creditos de los pesos corresponden a SG161222 (Realistic Vision V5.1) y las herramientas de conversion a Apple (`ml-stable-diffusion`); este repositorio solo redistribuye el formato.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mahmudplx/coreml-realisticvision-5.1-6bit
- Repositorio original de la conversion: https://huggingface.co/darkmaniac7/TokForge-RealisticVision-5.1-CoreML-6bit
- Repositorio alternativo equivalente: https://huggingface.co/LocalMuseAI/coreml-realistic-vision-v5-1-6bit
- Modelo base: https://huggingface.co/SG161222/Realistic_Vision_V5.1_noVAE
- Herramienta de conversion (Apple ml-stable-diffusion): https://github.com/apple/ml-stable-diffusion
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Coleccion TokForge iOS CoreML Image Models: https://huggingface.co/collections/darkmaniac7/tokforge-ios-coreml-image-models
- Conversion relacionada del mismo autor (epiCRealism): https://huggingface.co/mahmudplx/coreml-epicrealism-6bit
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play de TokForge: https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight de TokForge: https://testflight.apple.com/join/jnufjzRr
