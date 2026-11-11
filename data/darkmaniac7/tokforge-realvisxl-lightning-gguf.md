# darkmaniac7/TokForge-RealVisXL-Lightning-GGUF

## Resumen

TokForge-RealVisXL-Lightning-GGUF es un empaquetado en formato GGUF del modelo de generación de imágenes RealVisXL V4.0 Lightning, un fine-tune fotorrealista de Stable Diffusion XL desarrollado originalmente por SG161222. Este artefacto, publicado por TokForge (darkmaniac7), no es un modelo nuevo sino una conversión optimizada para su uso con `stable-diffusion.cpp`, pensada para ejecutar inferencia de imágenes 1024x1024 de forma local en teléfonos Android con GPU Qualcomm Adreno y 16 GB o más de RAM.

El paquete incluye en un único archivo todo lo necesario para la inferencia: los dos codificadores de texto CLIP (CLIP-L y OpenCLIP-bigG), el UNet cuantizado a q8_0 y el VAE SDXL en f16, además de un decodificador TAESDXL ligero opcional para decodificación rápida. La variante Lightning del modelo base permite generar imágenes fotorrealistas en muy pocos pasos (6 por defecto, con rango de 4 a 8), lo que resulta crítico en hardware móvil donde el presupuesto computacional es limitado.

Su relevancia actual radica en que demuestra la viabilidad de ejecutar un modelo SDXL completo en un dispositivo de bolsillo mediante OpenCL sobre GPU móvil, sin conexión a red una vez descargado el modelo. Está orientado exclusivamente al ecosistema TokForge y no sustituye a un checkpoint de entrenamiento en formato diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SDXL (UNet + doble CLIP + VAE), optimizada para few-step Lightning |
| Parametros totales | 3.468.837.867 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image, sin contexto de texto) |
| Tipos de cuantizacion | UNet q8_0; VAE f16; decodificador TAESDXL f16 |
| Idiomas soportados | en |
| Licencia | openrail++ (CreativeML OpenRAIL++-M) + terminos de Civitai de SG_161222 (atribucion obligatoria, prohibida la venta del modelo o de fusiones) |
| Formato de pesos | GGUF (archivo unico con CLIP-L, OpenCLIP-bigG, UNet y VAE) + safetensors (TAESDXL) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Stable Diffusion XL: un UNet para el proceso de difusión, dos codificadores de texto (CLIP-L y OpenCLIP-bigG) y un VAE para codificar y decodificar imágenes en el espacio latente. El modelo base RealVisXL V4.0 Lightning es un fine-tune fotorrealista de SDXL con destilación few-step ya integrada en el checkpoint (no requiere fusión de LoRA), lo que permite generar imágenes con 4-8 pasos de muestreo en lugar de los 20-50 típicos de SDXL estándar.

El proceso de creación documentado por el autor consistió en cargar el checkpoint `SG161222/RealVisXL_V4.0_Lightning` en fp16, exportarlo a un `.safetensors` en formato SDXL original y convertirlo a GGUF mediante `stable-diffusion.cpp` con `-M convert --type q8_0`, manteniendo el VAE en f16 mediante reglas de tipo por tensor (`^first_stage_model\.=f16`). No se documenta información sobre el dataset de entrenamiento original del modelo base ni sobre procesos de RLHF o DPO, ya que se trata de un modelo de imagen y no de lenguaje. La innovación principal del empaquetado es la consolidación de todos los componentes en un único GGUF y la ruta de ejecución OpenCL F16-GEMM para GPU Adreno.

## Capacidades

- Generación de imágenes text-to-image fotorrealistas a resolución nativa 1024x1024.
- Muestreo few-step: 6 pasos por defecto con sampler dpm++2m y cfg-scale 1.5; 4 pasos como mínimo rápido y 8 para refinamiento adicional.
- Empaquetado autocontenido: los dos codificadores CLIP, el UNet y el VAE en un solo archivo GGUF.
- Decodificación rápida opcional mediante el decodificador TAESDXL (f16, 2,45 MB) frente a la decodificación con el VAE completo.
- Ejecución local en dispositivo (on-device) sin conexión a red una vez descargado el modelo.
- Aceleración por GPU mediante OpenCL en dispositivos Qualcomm Adreno con 16 GB o más de RAM.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni otras capacidades de modelos de lenguaje; es exclusivamente un generador de imágenes.
- Soporte multilingüe limitado al inglés en los prompts (idioma declarado: en).

## Casos de uso

- Generación de retratos fotorrealistas en móvil: el modelo produce primeros planos con textura de piel natural usando prompts como "close-up portrait, natural skin texture, 85mm, RAW photo, photorealistic", adecuado para aplicaciones de fotografía sintética en Android de gama alta.
- Prototipado de conceptos visuales sin conexión: al ejecutarse íntegramente en el dispositivo tras la descarga, permite iterar sobre ideas de imagen en entornos sin red (viajes, zonas rurales, entornos seguros).
- Aplicaciones de edición creativa móvil: integrable en apps Android que necesiten generar imágenes base o variaciones fotorrealistas a 1024px sin depender de servicios en la nube, reduciendo costes de inferencia y mejorando la privacidad.
- Demostraciones y evaluación de inferencia on-device: útil para investigadores que quieran medir el rendimiento de SDXL cuantizado en GPU móvil Adreno mediante `stable-diffusion.cpp` y OpenCL.
- Generación de material visual para previsualización de producto: la resolución nativa 1024x1024 y el estilo fotorrealista permiten crear mockups y escenas de producto para revisión interna antes de una sesión fotográfica real.
- Pruebas de canalización GGUF para SDXL: sirve como referencia para desarrolladores que quieran empaquetar sus propios fine-tunes de SDXL en un único GGUF con VAE en f16 y decodificador TAESDXL opcional para `stable-diffusion.cpp`.
- Generación de imágenes en el propio ecosistema TokForge: uso previsto principal, disponible en Google Play y TestFlight como "RealVisXL Lightning (Adreno Quality)" en la sección de modelos recomendados de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el autor indica que el modelo está pensado para teléfonos con 16 GB de RAM o más y GPU Qualcomm Adreno; el archivo GGUF ocupa 4,18 GB y el conjunto descargable 4,2 GB.
- GPU recomendadas: GPU Qualcomm Adreno de alta gama en Android (ruta OpenCL F16-GEMM). No se documentan GPU de escritorio ni modelos concretos de Adreno compatibles.
- Compatibilidad con GPU de consumo (NVIDIA/AMD): no disponible en la información proporcionada; el artefacto está orientado a `stable-diffusion.cpp` en Android.
- Ejecución en CPU: no soportada como tier oficial; el autor indica explícitamente que SDXL en CPU de teléfono no es un objetivo viable.
- Opciones de despliegue: `stable-diffusion.cpp` (CLI `sd -M img_gen`), app TokForge en Android (Google Play) e iOS (TestFlight). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion nativa | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| TokForge-RealVisXL-Lightning-GGUF | 3.468.837.867 | 1024x1024 | GGUF + safetensors (TAESDXL) | openrail++ + terminos Civitai | SDXL fotorrealista few-step para Android on-device |
| SG161222/RealVisXL_V4.0_Lightning (base) | no disponible en la informacion | 1024x1024 (SDXL) | safetensors (diffusers) | openrail++ + terminos Civitai | Checkpoint original de entrenamiento/inferencia en GPU de escritorio |
| stabilityai/stable-diffusion-xl-base-1.0 | no disponible en la informacion | 1024x1024 | safetensors (diffusers) | CreativeML OpenRAIL++-M | SDXL base genérico, requiere más pasos de muestreo |
| DreamShaper (ruta rápida TokForge) | no disponible en la informacion | no disponible | GGUF | no disponible en la informacion | Alternativa ligera para móviles sin GPU Adreno de alta gama |

La comparación con modelos puramente de lenguaje (LLM) no aplica; las alternativas relevantes son otros checkpoints SDXL o fine-tunes de difusión. Los datos de parámetros de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de inferencia, no checkpoint de entrenamiento: está construido para `stable-diffusion.cpp` y no es directamente utilizable en diffusers para fine-tuning.
- Restricción de hardware: TokForge solo lo ofrece en teléfonos de 16 GB o más con GPU Qualcomm Adreno; otros dispositivos usan la ruta DreamShaper. No hay soporte documentado para CPU móvil ni para GPU de escritorio.
- Cuantización q8_0 del UNet: puede introducir diferencias visuales menores respecto al modelo original en precisión completa.
- Idioma: prompts únicamente en inglés según los metadatos del modelo.
- Licencia restrictiva: openrail++ más los términos de Civitai de SG_161222, que exigen atribución y prohíben la venta del modelo o de fusiones del mismo. Los términos de openrail++ se propagan a las imágenes generadas.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusión: el modelo puede reproducir estereotipos presentes en sus datos de entrenamiento y generar contenido incoherente o anatómicamente incorrecto, especialmente con prompts ambiguos o pasos insuficientes.
- Dependencia del ecosistema TokForge: la ruta de uso recomendada está ligada a su aplicación y catálogo; el uso fuera de ella requiere invocar manualmente `stable-diffusion.cpp`.
- Sin benchmarks publicados: no hay datos objetivos de calidad (FID, CLIP score, etc.) para este empaquetado concreto.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/darkmaniac7/TokForge-RealVisXL-Lightning-GGUF
- Modelo base: https://huggingface.co/SG161222/RealVisXL_V4.0_Lightning
- Stable Diffusion XL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Licencia CreativeML OpenRAIL++-M: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/blob/main/LICENSE.md
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- TokForge: https://tokforge.ai
- Discord de TokForge: https://discord.gg/Acv3CBtfVm
- Google Play (app TokForge): https://play.google.com/store/apps/details?id=dev.tokforge
- iOS TestFlight: https://testflight.apple.com/join/jnufjzRr
- Colección TokForge GGUF Models: https://huggingface.co/collections/darkmaniac7/tokforge-gguf-models-6af3fdd830c420213916bda1
- Colección TokForge Image Models (Android): https://huggingface.co/collections/darkmaniac7/tokforge-image-models-android-6a2195edbecaee6d762b71b4
- Civitai de RealVisXL: https://civitai.com/models/139562
