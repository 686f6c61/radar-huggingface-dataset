# modulsx/MiniMax-Music-3-Turbo-FP8

## Resumen

MiniMax-Music-3-Turbo-FP8 es una versión optimizada y cuantizada del modelo de generación musical MiniMax Music 3, desarrollada por la comunidad (usuario Guillaume-127, publicado también como modulsx). El modelo original, creado por MiniMax, genera canciones completas de hasta cinco minutos a partir de una descripción textual y letras, manteniendo coherencia estructural y calidad vocal. Esta adaptación convierte los pesos del text encoder y del DiT (Diffusion Transformer) a precisión FP8 (`torch.float8_e4m3fn`) y añade un LoRA de destilación de 8 pasos, lo que acelera drásticamente la inferencia en hardware consumer.

El resultado es una herramienta pensada para su uso en ComfyUI, con una reducción del tiempo de generación de una canción de 190 segundos de aproximadamente 15 minutos a unos 4 minutos en una RTX 4090, y una huella de VRAM de unos 11,5 GB. La licencia declarada es Apache 2.0, y soporta los idiomas inglés, francés y chino. Es una liberación comunitaria en fase de calibración experimental, por lo que conviene evaluar su calidad antes de usarla en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching con DiT (Diffusion Transformer) para audio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (genera audio de hasta 190 s) |
| Tipos de cuantizacion | FP8 (`float8_e4m3fn`), capas sensibles en BF16/FP16, LoRA en BF16 |
| Idiomas soportados | en, fr, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (text encoder, DiT y LoRA) |

## Arquitectura y entrenamiento

El modelo original MiniMax Music 3 utiliza una arquitectura de difusión basada en un Transformer DiT (Diffusion Transformer) que condiciona la generación de audio a partir de un texto de descripción y letras. El pipeline completo incluye un text encoder (que convierte el prompt y las letras en embeddings) y un DiT que realiza el proceso de denoising mediante flow-matching. La versión optimizada cuantiza el text encoder y el DiT a FP8, manteniendo en alta precisión las capas consideradas sensibles (audio decoder heads, RMSNorms, token embeddings) para evitar degradación en la calidad vocal. Además, se ha entrenado un LoRA de destilación de pasos (step-distillation) con 20.000 pasos de entrenamiento sobre las matrices de atención y proyección MLP, reduciendo los pasos de muestreo de decenas a 8-10 sin pérdida significativa de calidad. El proceso de entrenamiento del LoRA se realizó con Consistency Flow-Matching y Mean Flow Distillation en una RTX 4090.

## Capacidades

- Generación de música completa (hasta 190 segundos) a partir de un prompt textual y letras opcionales.
- Control de la duración del audio mediante el parámetro `max_duration`.
- Soporte multilingüe para inglés, francés y chino.
- Integración con ComfyUI mediante nodos específicos (`Load Diffusion Model`, `Load LoRA`, `Patch Sage Attention KJ`, `KSampler`).
- Optimización para aceleración en GPU local: cuantización FP8 y LoRA Turbo de 8 pasos.
- Posibilidad de ajustar la fuerza del LoRA (`strength`) para equilibrar velocidad y calidad.

No se han documentado capacidades de tool calling, razonamiento multi-paso ni visión. Es un modelo especializado en generación de audio/música.

## Casos de uso

- Creación de bandas sonoras para vídeos y podcasts: permite generar música de fondo personalizada a partir de descripciones, con tiempos de generación razonables en una GPU de consumo.
- Prototipado de ideas musicales: artistas y productores pueden generar demos rápidas de 30-60 segundos para evaluar melodías y arreglos antes de una producción completa.
- Generación de jingles publicitarios: el modelo puede producir piezas cortas con letras y estilos específicos, reduciendo costes de producción en agencias.
- Música para videojuegos: permite crear bucles de ambiente o temas dinámicos sin depender de bibliotecas comerciales, gracias a la licencia Apache-2.0.
- Generación de música de acompañamiento para aplicaciones educativas o de meditación: se pueden generar pistas largas (hasta 190 s) con indicaciones como "relajante" o "instrumental".
- Automatización de contenido musical en streaming: se puede integrar en pipelines de generación de contenido para crear música de fondo en tiempo real o por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o métricas de audio) en la información disponible. La model card proporciona datos de rendimiento de inferencia en una RTX 4090, que se resumen a continuación:

| Configuración | Tiempo para generar 190 s de música | Speedup | Huella VRAM |
| :--- | :--- | :--- | :--- |
| Baseline (INT8 no optimizado) | ~895 s (~15 min) | 1.0x | ~16 GB |
| Text Encoder y DiT FP8 | ~315 s (~5 min 15 s) | 2.8x | ~11 GB |
| FP8 + Turbo LoRA 8-Step + SageAttention | ~245 s (~4 min 5 s) | ~3.7x | ~11.5 GB |

Estos tiempos se refieren a la generación completa de una canción de 190 segundos en una RTX 4090. La configuración recomendada usa LoRA strength 0.85, steps 8-12, sampler `euler`, scheduler `simple` y CFG 1.7.

## Requisitos de hardware

- VRAM mínima estimada: ~11.5 GB para la configuración completa FP8 + LoRA + SageAttention. Se recomienda una GPU con al menos 12 GB de VRAM.
- GPU recomendada: NVIDIA RTX 4090 (usada para las pruebas). También debería funcionar en otras GPUs con 12 GB o más, como RTX 3080 Ti, RTX 4070 Ti, o A4000/A5000.
- La aceleración SageAttention requiere GPU con soporte para Ampere o posterior (RTX 30/40 series).
- Opciones de despliegue: ComfyUI (con los nodos y archivos indicados en la model card). También se pueden usar los scripts del repositorio de GitHub para integraciones personalizadas.
- Latencia y throughput: en RTX 4090, la generación de 190 s de audio tarda aproximadamente 245 s (~4 min) con la configuración óptima. Para duraciones menores, el tiempo escala proporcionalmente.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Esta versión es una optimización del MiniMax Music 3 original, que es la referencia principal. No se pueden aportar comparativas con otros generadores de música como MusicGen, AudioLDM o Stable Audio, ya que no se dispone de datos de rendimiento o calidad en la información disponible.

## Limitaciones y advertencias

- Es una versión comunitaria experimental (v1.0) en fase de calibración; la calidad de audio puede presentar artefactos o variaciones no deseadas.
- La cuantización FP8 puede afectar a la fidelidad en ciertas frecuencias o a la articulación vocal, aunque las capas sensibles se mantienen en BF16.
- El LoRA Turbo de 8 pasos está calibrado para una fuerza de 0.85; valores fuera de ese rango pueden degradar la calidad.
- La licencia Apache-2.0 se aplica a esta versión comunitaria, pero la licencia del modelo original de MiniMax Music 3 puede ser diferente; conviene revisar los términos de uso del modelo base.
- No se garantiza compatibilidad con todas las GPUs; el uso de SageAttention requiere hardware reciente.
- La generación de canciones con letras en idiomas no soportados (en, fr, zh) puede producir resultados inadecuados.
- No se ha validado el modelo para uso comercial en entornos de producción; se recomienda probar exhaustivamente antes de su integración.

## Enlaces

- Repositorio HuggingFace de esta versión: https://huggingface.co/modulsx/MiniMax-Music-3-Turbo-FP8
- Repositorio HuggingFace original (autor Guillaume-127): https://huggingface.co/guillaume127/MiniMax-Music-3-Turbo-FP8
- Repositorio GitHub de MiniMax-Music3 (modelo base): https://github.com/MiniMax-AI/MiniMax-Music3
- Repositorio GitHub de la herramienta de conversión y LoRA: https://github.com/Guillaume-127/Minimax-music-3-Turbo-8-steps
- Página de demostración de MiniMax Music 3: https://minimax-ai.github.io/music3-demo/</think>## Resumen

MiniMax-Music-3-Turbo-FP8 es una versión optimizada y cuantizada del modelo de generación musical MiniMax Music 3, desarrollada por la comunidad (autor Guillaume-127, publicado también como moduls). El modelo base, creado por MiniMax, genera canciones completas de hasta cinco minutos a partir de una descripción textual y letras, manteniendo coherencia estructural, voces expresivas y arreglos en evolución. Esta variante convierte los pesos del text encoder y del DiT (Diffusion Transformer) a FP8 (`torch.float8_e4m3fn`) y añade un LoRA de destilación de 8 pasos, lo que reduce drásticamente el tiempo de inferencia en hardware local.

La ficha se centra en su integración con ComfyUI, donde se consigue una aceleración de hasta 3.7x respecto a la versión INT8 no optimizada, pasando de unos 15 minutos a unos 4 minutos para generar una canción de 190 segundos en una RTX 4090, con una huella de VRAM de aproximadamente 11.5 GB. La licencia declarada es Apache-2.0 y soporta los idiomas inglés, francés y chino. Es una liberación comunitaria en fase experimental (v1.0), por lo que se recomienda evaluar su calidad antes de usarla en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching con DiT (Diffusion Transformer) para audio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (genera audio hasta 190 s) |
| Tipos de cuantizacion | FP8 (`float8_e4m3fn`), capas sensibles en BF16/FP16, LoRA en BF16 |
| Idiomas soportados | en, fr, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (text encoder, DiT y LoRA) |

## Arquitectura y entrenamiento

El modelo original MiniMax Music 3 utiliza una arquitectura de difusión basada en un Transformer de flujo (flow-matching) que condiciona la generación de audio a partir de un texto de descripción y letras. La versión optimizada cuantiza el text encoder y el DiT a FP8, manteniendo en BF16 las capas consideradas sensibles, como los decodificadores de audio, los RMSNorm y los embeddings de tokens, para evitar pérdidas de calidad en la voz y la afinación. El LoRA Turbo se entrenó mediante destilación de pasos (step-distillation) con Consistency Flow-Matching y Mean Flow Distillation sobre las matrices de atención y MLP, durante 20,000 pasos con un programación de calentamiento coseno en una RTX 4090. El LoRA tiene rango 64 y alpha 64, y se recomienda aplicarlo con una fuerza de 0.85 para equilibrar velocidad y fidelidad.

## Capacidades

- Generación de canciones completas de hasta 190 segundos a partir de un prompt textual y letras opcionales.
- Control de la duración del audio mediante el parámetro `max_duration`.
- Soporte multilingüe para inglés, francés y chino.
- Integración nativa con ComfyUI mediante nodos específicos (`Load Diffusion Model`, `Load LoRA`, `Patch Sage Attention KJ`, `KSampler`).
- Aceleración de inferencia mediante cuantización FP8 y LoRA de 8 pasos.
- Posibilidad de ajustar la fuerza del LoRA para equilibrar velocidad y calidad.

No se documentan capacidades de tool calling, razonamiento multi-paso ni agentes. Es un modelo especializado exclusivamente en generación de audio musical.

## Casos de uso

- Creación de bandas sonoras para vídeo y podcasts: permite generar música de fondo personalizada a partir de descripciones, con tiempos de generación razonables en una GPU de consumo.
- Prototipado musical para artistas y productores: se pueden generar demos de 30-60 segundos para evaluar ideas melódicas y armónicas antes de una producción completa.
- Generación de jingles publicitarios: la herramienta produce piezas cortas con letras específicas y estilos definidos, reduciendo costes en agencias creativas.
- Música para videojuegos: permite crear bucles musicales temáticos sin depender de bibliotecas comerciales, gracias a la licencia Apache-2.0.
- Generación de pistas para aplicaciones de meditación o bienestar: se pueden crear composiciones largas y ambientales con prompts como "relajante" o "instrumental".
- Automatización de contenido musical para plataformas de streaming: se puede integrar en pipelines de generación para producir música de fondo bajo demanda, siempre que se valide la calidad en cada caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o métricas de audio) en la información disponible. La model card proporciona datos de rendimiento de inferencia en una RTX 4090, que se resumen a continuación:

| Configuración | Generación de 190 s de música | Speedup | Huella VRAM |
| :--- | :--- | :--- | :--- |
| Baseline (INT8 no optimizado) | ~895 s (~15 min) | 1.0x | ~16 GB |
| Text Encoder y DiT FP8 | ~315 s (~5 min 15 s) | 2.8x | ~11 GB |
| FP8 + Turbo LoRA 8-Step + SageAttention | ~245 s (~4 min 5 s) | ~3.7x | ~11.5 GB |

Estos tiempos corresponden a la generación completa de una canción de 190 segundos. La configuración recomendada usa LoRA strength 0.85, steps 8-12, sampler `euler`, scheduler `simple` y CFG 1.7.

## Requisitos de hardware

- VRAM mínima estimada: ~11.5 GB para la configuración completa FP8 + LoRA + SageAttention. Se recomienda una GPU con al menos 12 GB de VRAM.
- GPU recomendada: NVIDIA RTX 4090 (usada en las pruebas). GPUs con 12 GB o más, como RTX 3080 Ti, RTX 4070, RTX 4080 o RTX A5000, podrían ser suficientes.
- SageAttention requiere GPU con soporte Ampere (RTX 30) o posterior.
- Opciones de despliegue: ComfyUI (con los nodos indicados en la model card). También se pueden usar los scripts del repositorio de GitHub para integración personalizada.
- Latencia y throughput: en RTX 4090, la generación de 190 s de audio tarda aproximadamente 245 s (~4 min). Para duraciones menores, el tiempo escala de forma proporcional.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros generadores de música (por ejemplo, Stable Audio, AudioLDM, MusicGen). La única referencia directa es el modelo base MiniMax Music 3, del cual esta versión es una optimización. No se publican métricas comparativas de calidad en la documentación disponible.

## Limitaciones y advertencias

- Es una versión comunitaria experimental (v1.0) en calibración; la calidad del audio puede presentar artefactos o variaciones no deterministas.
- La cuantización FP8 puede degradar la fidelidad en frecuencias altas o en la articulación vocal, aunque las capas críticas se mantienen en BF16.
- El LoRA se ha entrenado para un rango específico de fuerza (0.85 recomendado); valores fuera de ese rango pueden reducir la calidad.
- La licencia Apache-2.0 se aplica a esta versión, pero la licencia del modelo original de MiniMax Music 3 podría ser diferente; se debe revisar la licencia del modelo base antes de uso comercial.
- No se garantiza compatibilidad con todas las GPU; el uso de SageAttention requiere hardware reciente.
- La generación con letras en idiomas no soportados (fuera de en, fr, zh) puede producir resultados incorrectos o de baja calidad.
- No hay validación para producción; se recomienda probar exhaustivamente antes de integrar en aplicaciones críticas.

## Enlaces

- Repositorio HuggingFace de esta versión: https://huggingface.co/modulsx/MiniMax-Music-3-Turbo-FP8
- Repositorio HuggingFace original (guillaume127): https://huggingface.co/guillaume127/MiniMax-Music-3-Turbo-FP8
- Repositorio GitHub del modelo base: https://github.com/MiniMax-AI/MiniMax-Music3
- Repositorio GitHub de la herramienta de conversión y LoRA: https://github.com/Guillaume-127/Minimax-music-3-Turbo-8-steps
- Página de demostración de MiniMax Music 3: https://minimax-ai.github.io/music3-demo/
