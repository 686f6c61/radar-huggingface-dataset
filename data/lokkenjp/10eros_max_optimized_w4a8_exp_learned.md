# LokkenJP/10Eros_Max_optimized_w4a8_exp_learned

## Resumen

10Eros Max H3 Turbo-hybrid beta4 es un checkpoint de generación de vídeo basado en la arquitectura MiniMax H3, desarrollado originalmente por TenStrip y publicado como `10Eros-Max`. La versión aquí descrita, `10Eros_Max_optimized_w4a8_exp_learned`, es una conversión de precisión derivada realizada por LokkenJP: un proceso de cuantización mixta W4A8 (pesos en 4 bits, activaciones en 8 bits) con representaciones INT8 aprendidas mediante ConvRot en los bloques de borde. El objetivo es reducir el tamaño del modelo de 37,46 GiB a 13,03 GiB (una reducción del 65,21 %) manteniendo la fidelidad visual, para facilitar su ejecución en GPUs de consumo como una RTX 4080 con 16 GB de VRAM.

El modelo no es un todo-en-uno: no incluye text encoder, VAE de vídeo/audio ni vocoder. Debe integrarse en un workflow de ComfyUI con los componentes H3 compatibles del checkpoint original. Se trata de una conversión experimental de calidad, con validación mecánica completa pero con pruebas perceptuales A/B aún pendientes. El repositorio fuente está marcado como Not-For-All-Audiences, por lo que el contenido generado puede ser explícito. La licencia es la `minimax-h3-community-license-agreement`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax H3 (transformer-only, 50 bloques principales, atención híbrida con ConvRot) |
| Parametros totales | no disponible (checkpoint original de 37,46 GiB en BF16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 asimétrico (asym_w4a8_int8) con grupos de 4, 8 y 16; INT8 ConvRot aprendido en bloques de borde |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (con descriptores de cuantización ComfyUI, escalas FP8 E4M3 y FP32) |

## Arquitectura y entrenamiento

El modelo base `10Eros_Max_h3_TURBO-hybrid_beta4.safetensors` es un transformer puro de 50 bloques principales, probablemente basado en la arquitectura MiniMax H3 (atención híbrida con mecanismos de convolución rotatoria, ConvRot). La cuantización derivada no reentrena el modelo; aplica una conversión de precisión selectiva: 200 matrices objetivo se cuantizan a W4A8 (87 con grupo 16, 48 con grupo 8, 45 con grupo 4), mientras que los 20 matrices de los bloques de borde (0, 1, 47, 48, 49) se mantienen en INT8 ConvRot aprendido con calibración de escala de rango fijo (top_p=0,20, con excepción de `blocks.49.mlp.fc2.weight` que usa top_p=0,40). Los 334 tensores restantes se conservan byte a byte en BF16. La selección de grupos se basó en métricas de reconstrucción (raw, projected y row-tail) medidas sobre los 180 matrices interiores, priorizando los grupos más pequeños donde la mejora era mayor. El artefacto final pesa exactamente 13.995.260.227 bytes, 4.739.773 bytes por debajo del límite de 14 GB declarado.

No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, dataset, técnicas de alineación). La cuantización es un proceso de post-entrenamiento sin fine-tuning adicional.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen más texto (image-text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Integración nativa con ComfyUI (versión 0.31.0 o superior) mediante descriptores de cuantización `asym_w4a8_int8` y soporte ConvRot.
- Dos modos de generación verificados: paso único y dos pasadas con upscaling latente/refinamiento.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje conversacional).
- Capacidades multilingües no documentadas.
- Contenido generado no apto para todos los públicos (NSFW).

## Casos de uso

- Producción de vídeo creativo de alta resolución: el modelo permite generar clips de vídeo de calidad a partir de prompts de texto o imágenes de referencia, adecuado para artistas digitales y creadores de contenido que necesiten iterar rápidamente sobre conceptos visuales.
- Prototipado de escenas para cine y animación: con la modalidad image-to-video, se pueden animar storyboards o ilustraciones estáticas para previsualizar movimientos de cámara y dinámicas de escena antes de la producción final.
- Generación de b-roll para vídeo corporativo o documental: el modelo produce secuencias sintéticas que pueden servir como material de relleno o ilustración en proyectos audiovisuales, reduciendo costes de stock footage.
- Investigación en generación de vídeo con modelos de bajo bit: la cuantización W4A8 y el esquema ConvRot ofrecen un caso de estudio práctico sobre cómo reducir el footprint de memoria de modelos H3 sin sacrificar la estructura de atención híbrida.
- Despliegue en hardware de consumo: gracias a la reducción del 65 % en tamaño, el modelo puede ejecutarse en GPUs de 16 GB (como RTX 4080) con memoria compartida, permitiendo a desarrolladores individuales experimentar con generación de vídeo sin acceso a clústeres profesionales.
- Integración en pipelines de automatización de contenidos: mediante ComfyUI, el modelo puede conectarse a flujos de trabajo que combinen generación de imágenes, vídeo y post-procesado, útil para plataformas de generación masiva de vídeos cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que las pruebas A/B perceptuales con semilla fija y una matriz más amplia de resoluciones/LoRAs/hardware aún no están finalizadas. No hay métricas objetivas como FVD, CLIP score o similares.

## Requisitos de hardware

- VRAM estimada: el autor registró un pico de memoria residente de 15,2 GiB dedicada + 4,4 GiB compartida en una pasada, y 14,7 GiB dedicada + 9,3 GiB compartida en el modo de dos pasadas, con VAEs y Qwen3VL-32B cargados. Esto indica que el modelo cabe justo en una GPU de 16 GB con uso de memoria compartida, pero no es una garantía general.
- GPU recomendadas: RTX 4080 (usada en las pruebas), otras GPUs con 16 GB o más (RTX 4090, A100, etc.). En GPUs con menos de 16 GB, el modelo no cargará sin técnicas adicionales de offloading.
- Opciones de despliegue: ComfyUI con soporte nativo MiniMax H3 y cuantización W4A8 (versión 0.31.0+). No se mencionan otros runtime como vLLM u Ollama, que no son aplicables a modelos de vídeo.
- Latencia y throughput: no disponibles. Las pruebas solo verifican que el modelo carga y genera vídeos en el workflow objetivo.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con modelos de la misma categoría (generación de vídeo cuantizada). Como referencia, se puede comparar con el modelo base sin cuantizar:

| Modelo | Tamaño | Cuantización | Memoria pico (RTX 4080) | Licencia |
|---|---|---|---|---|
| TenStrip/10Eros-Max (original) | 37,46 GiB | BF16 | no disponible | minimax-h3-community-license-agreement |
| LokkenJP/10Eros_Max_optimized_w4a8_exp_learned | 13,03 GiB | W4A8 + INT8 ConvRot | 15,2 GiB dedicada + 4,4 GiB compartida | minimax-h3-community-license-agreement |
| LokkenJP/10EROS_1.5_fp8_exp_learned | 27,16 GB (aprox.) | FP8 mixto | no disponible | ltx-2.community.license.agreement |

La comparativa con otros modelos de vídeo de código abierto (LTX-2.3, LTX-2.5) no es posible sin datos de rendimiento y calidad.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está marcado como Not-For-All-Audiences; su uso en entornos públicos o laborales requiere control de acceso y políticas de contenido estrictas.
- Licencia restrictiva: la `minimax-h3-community-license-agreement` puede imponer condiciones sobre uso comercial, redistribución o modificaciones. Es obligatorio revisar el texto completo de la licencia antes de cualquier despliegue.
- Cuantización experimental: la conversión W4A8 es de carácter experimental; no hay garantías de calidad perceptual frente al original. Las pruebas A/B controladas aún no se han completado.
- Dependencia de componentes externos: el modelo no incluye text encoder, VAE ni vocoder; requiere un workflow ComfyUI completo con los componentes H3 del checkpoint fuente, lo que añade complejidad de integración.
- Requisitos de memoria ajustados: en una GPU de 16 GB, el modelo depende de memoria compartida, lo que puede provocar caídas de rendimiento o fallos en resoluciones o recuentos de fotogramas elevados.
- Sin garantía de compatibilidad: la cuantización usa etiquetas FP8 E4M3 y descriptores específicos de ComfyUI; versiones anteriores o forks pueden no cargar el artefacto sin reparaciones de cabecera.
- Sesgos y alucinaciones: no hay información sobre sesgos del modelo base ni sobre su comportamiento en escenarios de contenido no deseado más allá del aviso NSFW.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LokkenJP/10Eros_Max_optimized_w4a8_exp_learned
- Workflow de ejemplo (dos pasadas): https://huggingface.co/LokkenJP/10Eros_Max_optimized_w4a8_exp_learned/tree/main/SampleWorkFlowTwoPassOptimized
- Licencia MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Modelo base (TenStrip/10Eros-Max): https://huggingface.co/TenStrip/10Eros-Max
- Otro trabajo similar del autor (FP8): https://huggingface.co/LokkenJP/10EROS_1.5_fp8_exp_learned
