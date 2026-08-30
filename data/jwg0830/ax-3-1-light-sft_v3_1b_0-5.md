# jwg0830/AX-3.1-Light-sft_v3_1b_0.5

## Resumen

AX-3.1-Light-sft_v3_1b_0.5 es un modelo de lenguaje de 7.260 millones de parámetros desarrollado por jwg0830 a partir del modelo base `skt/A.X-3.1-Light`, un transformer de tipo Llama especializado en coreano. El modelo se crea mediante weight averaging (model soup) de dos fine-tunes previos: `sft_v0_21` y `sft_v3_1b_safe`, cada uno con un peso de 0.5. No se ha realizado un reentrenamiento adicional; se trata de un promedio elemento a elemento de los pesos completos de ambos modelos.

El objetivo declarado por el autor es verificar si la combinación de dos fine-tunes con fortalezas complementarias puede producir un modelo superior: `sft_v0_21` destaca en los benchmarks CLIcK y Com2, mientras que `sft_v3_1b_safe` sobresale en KMMLU-Pro, HLE y MuSR. Según la evaluación local del autor (no oficial), el modelo promediado obtiene una mejora media del 43.40% en un conjunto de 5 benchmarks coreanos, frente al 41.04% del modelo base. Está pensado para tareas de generación de texto y conversación en coreano, y se distribuye bajo una licencia marcada como "other" sin especificar.

El modelo está disponible en Hugging Face en formato safetensors, con un tamaño de repositorio de 14.5 GB. Su fecha de creación es el 30 de agosto de 2026. No se proporcionan detalles sobre la arquitectura interna más allá de su origen en `skt/A.X-3.1-Light`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo Llama, basado en `skt/A.X-3.1-Light`) |
| Parametros totales | 7.264.800.768 (~7.26B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors originales) |
| Idiomas soportados | coreano (ko) |
| Licencia | other (sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye mediante weight averaging (model soup) de dos fine-tunes del modelo base `skt/A.X-3.1-Light`. No se modifica la arquitectura; se promedian los pesos completos de `sft_v0_21` y `sft_v3_1b_safe` con un factor de 0.5 cada uno. El primer fine-tune se entrenó con 5.793 ejemplos de datasets de AI Hub (identificadores 71857, 71874, 71610, 569, 71949), usando un esquema de prioridad de respuesta correcta. El segundo fine-tune incorporó además 20.513 ejemplos adicionales de respuestas cortas de los datasets 71875 y 577. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un fine-tune supervisado (SFT) combinado posteriormente.

El modelo base `skt/A.X-3.1-Light` es una versión ligera de la familia A.X de SKT, diseñada para el coreano. No se dispone de información sobre el número de capas, cabezas de atención, dimensión oculta ni el tamaño del contexto.

## Capacidades

- Generacion de texto en coreano, con especialización en comprensión de lectura, razonamiento y conocimiento del ámbito coreano.
- Conversacion multi-turno, indicado por su etiqueta `conversational`.
- Razonamiento sobre textos largos en coreano, evaluado en benchmarks como KMMLU-Pro, CLIcK, HLE, Com2-main y SNU Ko-MuSR.
- No se menciona soporte para tool calling, function calling, agentes, ni capacidades multimodales (vision, audio).
- No se indica soporte para otros idiomas; el modelo está orientado exclusivamente al coreano.

## Casos de uso

- Atencion al cliente automatizada en coreano: el modelo puede gestionar conversaciones de soporte en coreano, aprovechando su entrenamiento en datos conversacionales y su capacidad de razonamiento sobre contextos largos.
- Comprension de documentos administrativos y legales: entrenado con datasets de machine reading comprehension de documentos administrativos y legales coreanos, puede extraer respuestas precisas de textos extensos.
- Asistencia en conocimiento médico y farmacéutico: los datasets 71874 y 71875 incluyen conocimiento médico experto, lo que permite al modelo responder preguntas sobre terminología y conceptos médicos en coreano.
- Razonamiento causal y resolución de problemas: el dataset 71949 (inferencia basada en causalidad) y el buen rendimiento en MuSR sugieren capacidad para tareas de razonamiento multi-paso.
- Generación de contenido educativo: con datos de preguntas de libros de texto (dataset 71857), puede usarse para generar ejercicios o explicaciones en coreano.
- Análisis de noticias y resumen: entrenado con comprensión lectora de artículos periodísticos (dataset 577), puede resumir o extraer información de noticias en coreano.

## Benchmarks y rendimiento

El autor proporciona una evaluación local (no oficial, no K-AI) en un conjunto de benchmarks coreanos. Los resultados se presentan comparando el modelo base, el fine-tune v0.21, y el modelo promediado:

| Benchmark | base | v0.21 | soup-0.5 |
|---|---:|---:|---:|
| KMMLU-Pro | 37.85% | 39.16% | **40.11%** |
| CLIcK | 63.56% | 64.31% | **65.71%** |
| HLE | 4.40% | 4.40% | **4.87%** |
| Com2-main | 51.00% | 51.64% | 51.76% |
| SNU Ko-MuSR | 48.40% | **56.13%** | 54.53% |
| **Media de 5 ejes** | 41.04% | 43.13% | **43.40%** |

Estos datos son proporcionados por el autor y no constituyen resultados oficiales del K-AI Leaderboard. El autor advierte que Com2-main y MuSR(Ko) han mostrado discrepancias entre la evaluación local y la oficial en este proyecto, por lo que deben tomarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~7.26B parámetros. En precisión fp16, ocupa aproximadamente 14.5 GB (tamaño del repositorio). En cuantización 4-bit (no disponible oficialmente, pero posible con herramientas externas), podría reducirse a ~4-5 GB.
- GPU recomendadas: para fp16 se necesitaría una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100). Con cuantización 4-bit, podría ejecutarse en GPUs de 8 GB como RTX 3070/4060.
- Compatibilidad con GPU de consumo: sí, con cuantización es posible en GPUs de gama media-alta. Sin cuantización, se requiere una GPU de 16 GB o más.
- Opciones de despliegue: el modelo es compatible con `transformers` y `text-generation-inference` (por las etiquetas). Se puede servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o TGI. No se proporcionan datos de latencia o throughput.
- No se especifican requisitos de hardware en la documentación del autor.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría (7B coreanos) en la documentación proporcionada. El modelo base `skt/A.X-3.1-Light` es el único punto de referencia directo, y los resultados de la evaluación local muestran una mejora media del 2.36% respecto al base. No se pueden establecer comparaciones con otros modelos como Llama-3-8B, Qwen-7B o modelos coreanos específicos sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en coreano; no se garantiza un rendimiento aceptable en otros idiomas.
- La licencia "other" no especifica términos claros de uso comercial; es necesario contactar al autor o verificar la licencia del modelo base `skt/A.X-3.1-Light` antes de usar en producción.
- Los resultados de benchmarks son locales y no oficiales; pueden no reflejar el rendimiento real en el K-AI Leaderboard.
- No se dispone de información sobre sesgos o alucinaciones específicas, pero al ser un modelo SFT sobre datos de dominio (médico, legal, administrativo) puede presentar errores en contextos delicados.
- El autor advierte de discrepancias entre la evaluación local y la oficial para Com2-main y MuSR(Ko).
- El modelo no incluye mecanismos de seguridad adicionales más allá de los del fine-tune; se recomienda validar las respuestas en aplicaciones críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jwg0830/AX-3.1-Light-sft_v3_1b_0.5
- Perfil del autor: https://huggingface.co/jwg0830
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light (referencia indirecta)
- Modelo relacionado (sft_v3_1b_safe): https://huggingface.co/jwg0830/AX-3.1-Light-sft_v3_1b_safe
- Despliegue en FriendliAI (modelos similares): https://friendli.ai/models/youngseok12/AX-3.1-Light-sft_v3_0
