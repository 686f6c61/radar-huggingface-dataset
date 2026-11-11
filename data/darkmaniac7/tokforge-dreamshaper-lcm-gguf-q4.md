# darkmaniac7/TokForge-DreamShaper-LCM-GGUF-q4

## Resumen

TokForge-DreamShaper-LCM-GGUF-q4 es una cuantizacion Q4_0 en formato GGUF de DreamShaper 7, un finetune realista de Stable Diffusion 1.5, con el LCM-LoRA fusionado en el UNet para permitir muestreo de pocos pasos sin classifier-free guidance. Lo publica darkmaniac7 bajo la marca TokForge, orientado a inferencia on-device mediante stable-diffusion.cpp. No es un modelo de lenguaje: es un generador texto-a-imagen autocontenido que empaqueta en un unico fichero el codificador de texto CLIP, el UNet y el VAE.

El modelo resuelve el problema del peso y la huella de memoria en dispositivos moviles: parte del build f16 de aproximadamente 2,1 GB y lo reduce a 1,63 GB manteniendo en F16 las convoluciones 3x3, embeddings y biases, y cuantizando a Q4_0 las lineales de atencion, proyeccion y feed-forward. Con 1.066.235.307 parametros y una resolucion nativa de 512x512, esta pensado para generar imagenes en 4-8 pasos en telefonos de gama alta.

Es relevante ahora porque demuestra una ruta practica de despliegue de difusion en movil con stable-diffusion.cpp, aunque el propio autor advierte que las apps actuales de TokForge no descargan este fichero concreto: Android usa el build f16 y iOS usa TokForge-SD-GGUF-6GB, que mantiene el CLIP completo en F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + CLIP text encoder + VAE), con LCM-LoRA fusionado en el UNet |
| Parametros totales | 1.066.235.307 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto de texto) |
| Tipos de cuantizacion | Q4_0 en lineales y normas; F16 en convoluciones, embeddings y biases |
| Idiomas soportados | en (prompts en ingles) |
| Licencia | creativeml-openrail-m, mas terminos de Civitai de Lykon (prohibida la venta) |
| Formato de pesos | GGUF unico para stable-diffusion.cpp |
| Resolucion nativa | 512x512 (presets 256 y 384 tambien funcionales) |
| Tamano del repo | 1,6 GB (1,63 GB de pesos en 3 ficheros) |
| Histograma de tipos | 690 tensores F16 + 440 tensores Q4_0 |
| Muestreador recomendado | lcm / lcm, 6 pasos, cfg-scale 1.5 |

## Arquitectura y entrenamiento

La arquitectura es la de Stable Diffusion 1.5: un UNet con bloques residuales y atencion cruzada, un codificador de texto CLIP y un VAE para codificar y decodificar latentes. Sobre esta base, DreamShaper 7 de Lykon es un finetune orientado a realismo y versatilidad estetica. El LCM-LoRA de latent-consistency se ha fusionado en el UNet, lo que habilita muestreo de consistencia latente en pocos pasos (4 como minimo rapido, 6 como valor recomendado, 8 para refinamiento) con cfg-scale bajo de 1.5.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens de imagen, ni sobre si hubo etapas de RLHF o preferencias; esos datos corresponden a los modelos base y no se detallan en la informacion proporcionada. La innovacion tecnica destacable es el proceso de cuantizacion: se parte del GGUF f16 de TokForge y se convierte con `sd -M convert --type q4_0`, cuya regla `tensor_should_be_converted` preserva embeddings y biases en F16. En concreto, el `token_embedding.weight` de CLIP se mantiene en F16 porque una cuantizacion por bloques de ese tensor produce condicionamiento CLIP vacio a traves de `ggml_get_rows` y provoca un aborto en `conditioner.hpp GGML_ASSERT(!chunk_hidden_states.empty())`. El fichero pesa 1,63 GB en lugar de unos 0,6 GB porque el UNet de SD-1.5 esta dominado por convoluciones 3x3 (`ne[0] = 3`), no divisibles por el tamano de bloque 32 de Q4_0, y por tanto se conservan en F16; las convoluciones 1x1 tambien permanecen en F16.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts descriptivos en ingles.
- Muestreo de pocos pasos gracias al LCM-LoRA fusionado: 4 pasos como minimo rapido, 6 recomendado, 8 para refinamiento.
- Generacion sin classifier-free guidance (cfg-scale 1.5), lo que reduce el coste computacional por paso.
- Estilo realista y fotografico heredado de DreamShaper 7, con capacidad de escenas cotidianas, retratos y composiciones de calle.
- Inferencia on-device en moviles mediante stable-diffusion.cpp, sin dependencia de servidores.
- Ejecucion autocontenida en un unico fichero GGUF que incluye CLIP, UNet y VAE.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades de vision, audio, video ni comprension de imagenes.
- Soporte multilingue limitado: solo ingles en los prompts.

## Casos de uso

- Generacion de imagenes en apps moviles sin conexion: el modelo cabe en 1,63 GB y se ejecuta con stable-diffusion.cpp en dispositivos con RAM suficiente, permitiendo crear ilustraciones o fotos sinteticas en local sin enviar prompts a la nube.
- Prototipado rapido de conceptos visuales: con 6 pasos y cfg-scale 1.5, un disenador puede iterar decenas de variaciones en minutos sobre un telefono o portatil, usando el modelo como generador de bocetos.
- Generacion de imagenes de referencia para documentacion tecnica o blogs: prompts descriptivos en ingles producen escenas realistas a 512x512 que sirven como material de apoyo.
- Pruebas de integracion de difusion en pipelines de CI: al ser un GGUF unico compatible con la CLI de stable-diffusion.cpp, se puede invocar en scripts automatizados para validar que el entorno de inferencia funciona antes de desplegar builds mayores.
- Educacion y experimentacion con cuantizacion: el histograma de 690 tensores F16 y 440 Q4_0 y las notas de precision del manifest permiten estudiar el impacto de la cuantizacion en modelos de difusion.
- Generacion de assets para juegos o demos indie: imagenes de 512x512 de estilo realista para fondos, retratos o escenas, generadas en local y sin coste por llamada a API.
- Evaluacion comparativa de builds: sirve como referencia Q4_0 frente al build f16 de TokForge-DreamShaper-LCM-GGUF para medir diferencias de calidad y velocidad en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas FID, CLIP score ni comparaciones cuantitativas con otros modelos; solo documenta ajustes de render (sampler lcm, scheduler lcm, 6 pasos, cfg-scale 1.5, 512x512) y detalles de precision de la cuantizacion.

## Requisitos de hardware

- VRAM/RAM estimada: los pesos ocupan 1,63 GB; el autor indica que el modelo necesita mas RAM libre que el tamano de sus pesos, aunque no especifica la cifra exacta. Para SD-1.5 a 512x512 conviene reservar al menos 2-3 GB de memoria libre en el dispositivo.
- GPU recomendadas: cualquier GPU compatible con stable-diffusion.cpp; no se detallan modelos concretos en la informacion disponible.
- Cabe en GPU consumer: si, al tratarse de un modelo de 1,06 mil millones de parametros cuantizado a Q4_0; no se especifican que tarjetas consumer concretas se han probado.
- Cabe en movil: el autor lo situa en la clase de dispositivos con 8 GB de RAM o mas para el build f16; para este Q4_0 no se indica una clase de catalogo concreta.
- Opciones de despliegue: stable-diffusion.cpp (CLI `sd -M img_gen` y `-M convert`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusion.
- Latencia y throughput: no disponibles en la informacion proporcionada. El uso de 4-6 pasos con LCM reduce el coste frente al muestreo tradicional de 20-50 pasos, pero no se aportan cifras de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokForge-DreamShaper-LCM-GGUF-q4 (este) | 1.066.235.307 | GGUF Q4_0, 1,63 GB | 512x512 nativo | creativeml-openrail-m + terminos Civitai | Hugging Face, 4.246 descargas |
| TokForge-DreamShaper-LCM-GGUF (f16) | no disponible | GGUF f16, ~2,1 GB | 512x512 nativo | creativeml-openrail-m + terminos Civitai | Hugging Face |
| TokForge-SD-GGUF-6GB | no disponible | GGUF Q4_0 con CLIP y VAE completos en F16 | no disponible | no disponible | Hugging Face |
| Lykon/dreamshaper-7 | no disponible | safetensors (SD1.5) | 512x512 nativo | creativeml-openrail-m | Hugging Face |

La diferencia principal frente al build f16 es el tamano (1,63 GB frente a unos 2,1 GB) y la precision del CLIP: este fichero cuantiza las lineales y normas de CLIP a Q4_0, mientras que TokForge-SD-GGUF-6GB mantiene todo el codificador de texto en F16, razon por la que iOS lo prefiere. No se dispone de datos de calidad comparada entre estas variantes.

## Limitaciones y advertencias

- Solo acepta prompts en ingles; no hay soporte multilingue documentado.
- Resolucion nativa de 512x512; generar a resoluciones mayores requiere upscaling externo y puede degradar la coherencia.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir anatomias incorrectas, texto ilegible en la imagen y composiciones incoherentes, especialmente con prompts ambiguos.
- Sesgos conocidos: al heredar el dataset de SD-1.5 y el finetune de DreamShaper 7, puede reproducir sesgos de genero, etnia y estereotipos presentes en los datos de entrenamiento; no se detallan evaluaciones de sesgo en la informacion disponible.
- Restricciones de licencia: CreativeML OpenRAIL-M impone restricciones de uso, y los terminos de Civitai de Lykon prohiben la venta del modelo o de sus derivados.
- El CLIP cuantizado a Q4_0 en lineales y normas puede degradar ligeramente el condicionamiento frente al build f16; el autor preserva el `token_embedding.weight` en F16 precisamente para evitar fallos de condicionamiento.
- Las apps actuales de TokForge no descargan este fichero: Android usa el build f16 y iOS usa TokForge-SD-GGUF-6GB. Para usarlo hay que invocarlo manualmente con stable-diffusion.cpp.
- Requiere mas RAM libre que los 1,63 GB de pesos; no se especifica el minimo exacto, lo que complica planificar el despliegue en dispositivos ajustados.
- No apto para tareas de lenguaje, razonamiento, codigo o agentes: es exclusivamente un generador de imagenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darkmaniac7/TokForge-DreamShaper-LCM-GGUF-q4
- Build f16 hermano: https://huggingface.co/darkmaniac7/TokForge-DreamShaper-LCM-GGUF
- Build para iOS de 6 GB: https://huggingface.co/darkmaniac7/TokForge-SD-GGUF-6GB
- Modelo base DreamShaper 7: https://huggingface.co/Lykon/dreamshaper-7
- LCM-LoRA SD1.5: https://huggingface.co/latent-consistency/lcm-lora-sdv1-5
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Web de TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- TokForge en Google Play: https://play.google.com/store/apps/details?id=dev.tokforge
- TokForge en iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Coleccion TokForge GGUF Models: https://huggingface.co/collections/darkmaniac7/tokforge-gguf-models-6af3fdd830c420213916bda1
- Coleccion TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
