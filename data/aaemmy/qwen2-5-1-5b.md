# AAemmy/Qwen2.5-1.5B

## Resumen

Qwen2.5-1.5B es un modelo de lenguaje causal (decoder-only) de 1.543.714.304 parámetros publicado por el equipo Qwen de Alibaba dentro de la familia Qwen2.5. Se trata del checkpoint **base**, es decir, únicamente preentrenado y sin ajuste supervisado ni RLHF, por lo que su función es servir como punto de partida para *fine-tuning*, preentrenamiento continuado y experimentación, no como asistente conversacional listo para usar. El repositorio analizado (`AAemmy/Qwen2.5-1.5B`) es una re-subida de esos pesos bajo licencia Apache 2.0.

La arquitectura es un transformer con RoPE, SwiGLU, RMSNorm, sesgo en las proyecciones QKV y *tied word embeddings*, con 28 capas y atención GQA de 12 cabezas para Q y 2 para KV. El contexto declarado en la model card para este checkpoint es de 32.768 tokens, aunque la documentación de la familia menciona soporte de hasta 128K en otros tamaños.

Su relevancia práctica es doble: por un lado, es un modelo pequeño (3,1 GB en safetensors) que cabe en GPU de consumo y permite iterar experimentos a bajo coste; por otro, al ser base y Apache 2.0, no arrastra las restricciones de uso de alternativas con licencias comunitarias más cerradas, lo que lo hace atractivo para preentrenamiento continuado sobre dominios específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con RoPE, SwiGLU, RMSNorm, sesgo QKV y *tied embeddings* |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | No aplica (no es MoE) |
| Parametros sin embeddings | 1,31B |
| Longitud de contexto | 32.768 tokens (model card del checkpoint); la familia anuncia hasta 128K en otros tamaños |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Metadatos de HuggingFace: `en`. La model card declara soporte multilingüe de más de 29 idiomas para la familia (chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés, árabe, entre otros); el rendimiento real del checkpoint base de 1,5B no está cuantificado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 3,1 GB) |
| Capas | 28 |
| Cabezas de atencion | 12 para Q, 2 para KV (GQA) |
| Etapa de entrenamiento | Solo preentrenamiento (pretraining) |
| Tamano de vocabulario | No disponible |

## Arquitectura y entrenamiento

El modelo sigue el diseño estándar de la serie Qwen2.5: transformer causal con normalización RMSNorm, activación SwiGLU en el bloque feed-forward, embeddings de entrada y salida compartidos (*tied word embeddings*) y sesgo aprendido en las proyecciones de query, key y value. La atención usa Grouped Query Attention con 12 cabezas de query y solo 2 de key/value, lo que reduce de forma notable el tamaño de la caché KV frente a atención multi-cabeza completa y abarata el despliegue con contextos largos. Las 28 capas y los 1,54B de parámetros totales (1,31B sin contar embeddings) sitúan el modelo en la gama baja de la familia.

En cuanto a los datos, la información disponible no especifica el número de tokens de entrenamiento, la composición del corpus ni si hubo fases de RLHF o DPO; la model card indica explícitamente que este checkpoint es solo de preentrenamiento y desaconseja su uso directo en conversación. La familia Qwen2.5 sí declara mejoras respecto a Qwen2 en conocimiento, código y matemáticas (mediante modelos expertos especializados), seguimiento de instrucciones, generación de textos largos de más de 8K tokens, comprensión y generación de datos estructurados como JSON, y robustez frente a la diversidad de *system prompts*; estas mejoras se materializan plenamente en los checkpoints con post-entrenamiento, no en este base.

## Capacidades

- Generación de texto autoregresiva y *completion* de secuencias: es su función nativa como modelo de lenguaje base.
- Razonamiento y conocimiento factual heredados del preentrenamiento de la familia Qwen2.5, sin alineación conversacional.
- Capacidad de código y matemáticas mejorada respecto a Qwen2, según la documentación de la familia; en el checkpoint base se manifiesta sobre todo con prompting de pocos ejemplos (*few-shot*).
- Manejo de contexto de 32.768 tokens, adecuado para documentos largos, aunque la calidad en posiciones lejanas no está documentada para este tamaño.
- Capacidad multilingüe declarada por la familia (más de 29 idiomas), no verificada específicamente en este checkpoint.
- Base para *fine-tuning*: admite SFT, DPO/RLHF, preentrenamiento continuado y ajuste con LoRA/QLoRA.
- No soporta de forma nativa *tool calling* ni *function calling*: esas capacidades requieren post-entrenamiento específico.
- No incluye modo *thinking*, visión, audio ni capacidades de agente multi-paso.
- No se recomienda su uso directo como chatbot: la propia model card indica que los modelos base no deben emplearse para conversación.

## Casos de uso

- **Preentrenamiento continuado sobre dominio específico**: el modelo puede seguir entrenándose con corpus propios (legal, médico, financiero, industrial) para adaptar vocabulario y conocimiento antes de un ajuste supervisado, gracias a su licencia Apache 2.0 y a un coste computacional de 1,54B de parámetros.
- **Fine-tuning supervisado para asistentes verticales**: sirve como base para SFT con pares instrucción-respuesta de un dominio concreto y obtener así un asistente especializado, algo que la propia model card sugiere explícitamente.
- **Generación de datos sintéticos y aumentación**: puede producir textos de dominio, pares pregunta-respuesta o corpus de entrenamiento a gran escala con coste bajo, útiles para alimentar pipelines de datos de otros modelos.
- **Modelo borrador en decodificación especulativa**: por su tamaño reducido y su arquitectura compatible con Qwen2.5 mayores, encaja como *draft model* que propone tokens verificados por un modelo de referencia, reduciendo latencia en inferencia.
- **Ajuste con LoRA/QLoRA en hardware de consumo**: permite experimentar con técnicas de parametrización eficiente en una única GPU de 8-12 GB, sin necesidad de clústeres.
- **Investigación en interpretabilidad y análisis de representaciones**: al ser un modelo pequeño, completo y abierto, facilita el estudio de activaciones, circuitos y sesgos internos con recursos limitados.
- **Evaluación comparativa y ablaciones**: útil como línea base de perplejidad y de rendimiento en experimentos de tokenización, curriculums de entrenamiento o estrategias de cuantización.
- **Despliegue *on-premise* con requisitos de privacidad**: al caber en una GPU modesta, puede ejecutarse en infraestructura propia para tareas de completado o extracción de información sin enviar datos a terceros, previo ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog de Qwen2.5 para los resultados de evaluación detallados, pero esos datos no se incluyen en el material proporcionado y no deben extrapolarse a este checkpoint base.

## Requisitos de hardware

- **Pesos en precisión completa (BF16/FP16)**: aproximadamente 3,1 GB, coherente con el tamaño del repositorio safetensors.
- **VRAM estimada para inferencia**: en torno a 3,5-5 GB en BF16 incluyendo caché KV y activaciones para contextos moderados; aproximadamente 1,6-2,5 GB con cuantización INT8 y 1-2 GB con INT4 (estimaciones, no cifras oficiales).
- **Caché KV**: la configuración GQA con solo 2 cabezas KV reduce el coste drásticamente frente a atención multi-cabeza; el desglose exacto por token no está disponible en la información proporcionada.
- **GPU recomendadas**: NVIDIA A100/H100 para entrenamiento o *fine-tuning* a escala; RTX 4090, RTX 4080, RTX 3090 para ajuste con LoRA y servicio concurrente; RTX 4070, RTX 4060 Ti 16 GB, RTX 3060 12 GB para inferencia e iteración.
- **Cabe en GPU de consumo**: sí, en cualquier tarjeta con 8 GB o más en BF16 para contextos moderados, y en tarjetas de 6 GB o incluso CPU con cuantización INT4.
- **Opciones de despliegue**: `transformers` (versión 4.37.0 o superior, requerida para la arquitectura `qwen2`), vLLM, TGI y, previa conversión a GGUF, llama.cpp y Ollama. No se documentan en la información disponible ficheros GGUF ya preparados.
- **Latencia y throughput**: no disponibles. La model card enlaza a la página de *benchmark* de velocidad de Qwen, cuyos valores no se incluyen aquí.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Post-entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B (este) | 1,54B | 32.768 | Solo pretraining | Apache 2.0 | Checkpoint base, ideal para *fine-tuning* |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | SFT + RLHF (familia) | Apache 2.0 | Misma arquitectura, listo para conversación |
| Llama 3.2 1B | 1,24B | 128K | Base e instruct disponibles | Llama 3.2 Community License | Licencia con restricciones de uso |
| Gemma 2 2B | 2,61B | 8K | Base e instruct disponibles | Gemma Terms of Use | Mayor tamaño, contexto menor |

Nota: las especificaciones de Qwen2.5-1.5B proceden de la información proporcionada; las de las alternativas se incluyen como referencia de sus model cards públicas y no forman parte del material de esta búsqueda. No se dispone de datos de benchmarks comparativos verificados en la información disponible.

## Limitaciones y advertencias

- **No es un modelo conversacional**: al no tener SFT ni RLHF, no sigue instrucciones de forma fiable y puede producir continuaciones incoherentes o repetitivas en formato de chat.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje preentrenado, genera contenido plausible pero no verificado; no debe usarse como fuente de verdad sin validación.
- **Ausencia de datos de evaluación**: no hay métricas publicadas en la información disponible para este checkpoint, por lo que su rendimiento real frente a alternativas no está cuantificado.
- **Idioma**: los metadatos de HuggingFace lo etiquetan únicamente como `en`, mientras que la model card de la familia declara multilingüismo; conviene validar empíricamente la calidad en castellano antes de usarlo en producción.
- **Contexto**: los 32.768 tokens declarados no garantizan calidad uniforme en todo el rango; no hay evaluación de *long context* para este tamaño.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; no obstante, el titular original de los pesos es el equipo Qwen y el repositorio analizado es una re-subida de terceros.
- **Procedencia del repositorio**: `AAemmy/Qwen2.5-1.5B` registra 0 descargas y 0 *likes*, y fue creado el 2026-10-27; conviene verificar la integridad de los pesos frente al repositorio oficial `Qwen/Qwen2.5-1.5B` antes de usarlos en producción.
- **Sesgos**: no se documentan evaluaciones de sesgo para este checkpoint; los sesgos del corpus de preentrenamiento pueden persistir y amplificarse tras el *fine-tuning*.
- **Sin soporte nativo de herramientas**: no dispone de *tool calling*, agentes ni salidas estructuradas garantizadas sin post-entrenamiento adicional.

## Enlaces

- [HuggingFace: AAemmy/Qwen2.5-1.5B](https://huggingface.co/AAemmy/Qwen2.5-1.5B)
- [Licencia Apache 2.0 (referencia del autor original)](https://huggingface.co/Qwen/Qwen2.5-1.5B/blob/main/LICENSE)
- [Blog oficial de Qwen2.5](https://qwenlm.github.io/blog/qwen2.5/)
- [Repositorio GitHub de Qwen2.5](https://github.com/QwenLM/Qwen2.5)
- [Documentación de Qwen](https://qwen.readthedocs.io/en/latest/)
- [Benchmark de velocidad de Qwen](https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html)
- [Qwen2 Technical Report (arXiv:2407.10671)](https://arxiv.org/abs/2407.10671)
