# cortex-ai-nova/NOVA-Judex-4.8-Omni-ft

## Resumen

NOVA-Judex-4.8-Omni-ft es un ajuste fino (fine-tune) del modelo multimodal LiquidAI/LFM3-Omni-2B, publicado por el usuario cortex-ai-nova en Hugging Face. Se trata de un modelo de tipo image-text-to-text construido sobre la arquitectura LFM3 Omni de Liquid AI, con 2.166.928.384 parámetros totales (aproximadamente 2,17 mil millones) y un tamaño de repositorio de 9,1 GB, lo que refleja la presencia de pesos en BF16 junto con artefactos adicionales como GGUF.

El modelo se ha entrenado mediante LoRA con rango 8 fusionada en los pesos finales en BF16, partiendo del modelo base LFM3-Omni-2B. Según la model card, el ajuste se realizó sobre tres conjuntos de datos de instrucciones y conversación (yahma/alpaca-cleaned, mlabonne/FineTome-100k y un subconjunto de ASR de librispeech), con un número muy limitado de ejemplos (hasta 1000 y 50 según el dataset). El ajuste afectó únicamente a la salida de texto; la generación de voz no fue entrenada.

Su relevancia radica en que demuestra el flujo de especialización de un modelo omni (texto, imagen y audio) de pequeño tamaño para tareas conversacionales, con licencia LFM Open License v1.0 y compatibilidad con transformers y endpoints. No obstante, la información pública disponible es escasa: no se detallan idiomas soportados, benchmarks ni composición completa del dataset, y la model card contiene inconsistencias de nombre respecto al identificador del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 Omni (transformer multimodal, image-text-to-text); detalles internos no disponibles |
| Parametros totales | 2.166.928.384 (~2,17 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye artefactos GGUF; no se detallan variantes) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-Omni-2B, un modelo multimodal de la familia LFM3 Omni de Liquid AI orientado a entrada image-text-to-text. La información disponible no detalla la arquitectura interna del modelo base (tipo de atención, componentes de audio o visión, mecanismo de fusión multimodal), por lo que estos aspectos quedan como no disponibles. El ajuste fino se realizó mediante LoRA con rango 8, posteriormente fusionada en los pesos en BF16, lo que produce un checkpoint denso estándar.

El entrenamiento se llevó a cabo sobre tres fuentes: yahma/alpaca-cleaned (formato instruction, hasta 1000 ejemplos), mlabonne/FineTome-100k (formato ShareGPT, hasta 1000 ejemplos) y hf-internal-testing/librispeech_asr_dummy (ASR, hasta 50 ejemplos). No se especifican hiperparámetros, número de épocas, tokens totales, ni si hubo etapas de RLHF o DPO. La model card indica explícitamente que solo se ajustó la salida de texto y que la generación de voz no fue entrenada, lo que limita el alcance del fine-tune a la rama textual del modelo omni.

## Capacidades

- Generación de texto conversacional e instruccional, heredada del ajuste sobre alpaca-cleaned y FineTome-100k.
- Procesamiento de entrada multimodal image-text-to-text según la pipeline declarada (image-text-to-text).
- Capacidades omni del modelo base (audio y voz) potencialmente presentes, aunque la generación de voz no fue ajustada y su comportamiento tras el fine-tune no está documentado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas en la model card ni en los metadatos.
- Modo thinking, visión o audio especial: no disponible más allá de la naturaleza omni del modelo base.

## Casos de uso

- Asistente conversacional de texto: el ajuste sobre alpaca-cleaned y FineTome-100k lo hace adecuado para prototipos de chat instruccional y respuestas a preguntas generales, aunque con un volumen de entrenamiento muy reducido.
- Experimentación con modelos omni de pequeño tamaño: sirve para validar pipelines de inferencia multimodal (texto e imagen) en transformers con `trust_remote_code=True` antes de escalar a modelos mayores.
- Evaluación de fine-tuning con LoRA: al estar fusionada la LoRA en BF16, es un caso práctico para estudiar el efecto de un ajuste ligero sobre un modelo base omni y comparar con el original.
- Prototipado de asistentes con entrada de imagen: la pipeline image-text-to-text permite probar descripciones o preguntas sobre imágenes en entornos de investigación.
- Despliegue ligero en local: con ~2,17 mil millones de parámetros y artefactos GGUF en el repositorio, es viable para pruebas en hardware de consumo mediante llama.cpp u Ollama, siempre que la arquitectura omni esté soportada.
- Docencia y demostraciones de ajuste fino: útil para ilustrar el flujo completo de preparación de datasets (instruction, ShareGPT, ASR) y fusión de adaptadores en un modelo multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,3 GB solo para pesos (2,17 mil millones de parámetros × 2 bytes), más overhead de activaciones y del procesador multimodal; en la práctica, se recomienda al menos 8 GB.
- VRAM estimada en cuantización de 8 bits: del orden de 2,2-3 GB para pesos; en 4 bits, del orden de 1,2-2 GB, aunque no se confirman variantes GGUF concretas ni su calidad.
- GPU recomendadas: para BF16, GPU con 8-16 GB como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090; para entornos de servidor, A100 o H100 si se busca throughput alto o lotes mayores.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más en BF16 y en GPUs con 4-6 GB usando cuantización, sujeto a que el runtime soporte la arquitectura LFM3 Omni.
- Opciones de despliegue: transformers con `AutoModelForMultimodalLM` y `trust_remote_code=True` (método documentado); GGUF sugiere compatibilidad potencial con llama.cpp u Ollama, aunque no se confirma; vLLM y TGI no están verificados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| NOVA-Judex-4.8-Omni-ft | ~2,17 mil millones | no disponible | LFM Open License v1.0 | Fine-tune LoRA de LFM3-Omni-2B; multimodal image-text-to-text |
| LiquidAI/LFM3-Omni-2B | ~2 mil millones | no disponible | LFM Open License v1.0 | Modelo base sin ajuste; referencia directa |
| Modelos omni pequeños de otras familias (p. ej. Qwen2.5-Omni-3B, Gemma 3n) | 3-4 mil millones | variable según modelo | licencias propias | Alternativas de tamaño similar; datos concretos no verificados en esta ficha |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado benchmarks del modelo ajustado ni del base en la información proporcionada.

## Limitaciones y advertencias

- El ajuste se realizó con un número muy reducido de ejemplos (hasta 1000 por dataset y 50 de ASR), lo que limita la generalización y puede provocar sobreajuste a los estilos de esos conjuntos.
- La generación de voz no fue entrenada; las capacidades de audio del modelo base pueden haberse degradado o no estar alineadas tras el fine-tune.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto y no está documentado.
- No hay benchmarks publicados, por lo que no se puede verificar la calidad frente al modelo base ni frente a alternativas.
- Riesgo de alucinación inherente a modelos de este tamaño, agravado por el ajuste ligero y la falta de evaluación.
- La model card menciona el nombre "NOVA-Spark-4" y una ruta de ejemplo distinta ("cortex-ai-nova/NOVA-Spark-4-Omni"), lo que genera ambigüedad sobre el artefacto exacto y conviene verificar los archivos del repositorio antes de usarlo.
- La licencia LFM Open License v1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto completo en el enlace de licencia antes de desplegar en producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; debe auditarse en entornos sensibles.
- No se dispone de información sobre sesgos conocidos ni sobre la composición demográfica o lingüística de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cortex-ai-nova/NOVA-Judex-4.8-Omni-ft
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LICENSE
- Dataset yahma/alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset mlabonne/FineTome-100k: https://huggingface.co/datasets/mlabonne/FineTome-100k
- Dataset hf-internal-testing/librispeech_asr_dummy: https://huggingface.co/datasets/hf-internal-testing/librispeech_asr_dummy
