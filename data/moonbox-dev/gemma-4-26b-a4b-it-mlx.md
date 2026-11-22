# moonbox-dev/gemma-4-26B-A4B-it-MLX

## Resumen

Gemma 4 26B A4B MLX es una compilación del modelo instruction-tuned Gemma 4 26B A4B de Google, adaptada por el usuario moonbox-dev para su ejecución en Apple Silicon mediante la librería MLX. Se trata de una cuantización del modelo original en formato MLX-VLM, lo que permite ejecutar un modelo multimodal de tipo image-text-to-text con arquitectura MoE (Mixture of Experts) en hardware de Apple, algo que con el modelo original en bf16 resultaría inviable en la mayoría de equipos de consumo.

El modelo base, google/gemma-4-26B-A4B-it, es un transformer MoE con 26.000 millones de parámetros totales y aproximadamente 4.000 millones de parámetros activos por token, según indica la nomenclatura A4B. Incluye capacidades de visión y un módulo de decodificación especulativa (`mtp/`) que acelera la generación. Esta compilación MLX preserva el tokenizador, la plantilla de chat y los ajustes de procesador del modelo original, empaquetados como un modelo mlx-vlm completo.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo multimodal de gran tamaño en Macs con Apple Silicon, con cuantización de 8 bits que mantiene una fidelidad alta respecto al original (KL de 0,27 nats y coincidencia top-1 del 90,1 %). No obstante, el repositorio tiene un tamaño de 95,4 GB y no registra descargas ni interacciones, lo que sugiere que es una compilación reciente y poco validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) multimodal, con decodificación especulativa mediante drafter MTP |
| Parametros totales | 26B |
| Parametros activos | ~4B (según nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); otras precisiones no disponibles en la información proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a licencia Gemma 4 de Google) |
| Formato de pesos | safetensors (MLX), con config.json, tokenizer, chat template y processor settings |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts (MoE) que activa aproximadamente 4.000 millones de parámetros por token de un total de 26.000 millones. Incorpora un componente de visión que lo habilita para tareas image-text-to-text, y un drafter de multi-token prediction (`mtp/`) para decodificación especulativa, lo que permite generar varios tokens por paso y reducir la latencia. La compilación MLX conserva la estructura del modelo original y la adapta al formato de mlx-vlm.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card de esta compilación no detalla estos aspectos, y la información proporcionada no incluye la model card original de Google. La innovación técnica destacable de esta compilación es la cuantización a 8 bits con una degradación medida de KL 0,27 nats y top-1 del 90,1 % respecto al modelo bf16 original, lo que indica una pérdida de calidad moderada pero controlada.

## Capacidades

- Generación de texto e instrucciones en modo chat (instruction-tuned).
- Procesamiento de imágenes y texto combinados (pipeline image-text-to-text).
- Razonamiento multimodal: puede responder preguntas sobre imágenes.
- Decodificación especulativa mediante el drafter MTP incluido, que acelera la inferencia.
- Ejecución en Apple Silicon mediante MLX y mlx-vlm.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal local en Mac: el modelo puede procesar imágenes y texto en un equipo Apple Silicon, permitiendo consultas sobre capturas de pantalla, documentos escaneados o fotografías sin enviar datos a la nube, gracias a su pipeline image-text-to-text.
- Análisis de documentos con imágenes: extracción de información de facturas, gráficos o diagramas mediante la combinación de visión y generación de texto, adecuado para flujos de trabajo de oficina en local.
- Prototipado de aplicaciones de visión por computador: desarrolladores que necesiten un modelo VLM instruction-tuned para experimentar en macOS pueden usar esta compilación con mlx-vlm sin depender de GPUs NVIDIA.
- Generación de descripciones y resúmenes de imágenes: el modelo puede generar texto descriptivo a partir de imágenes, útil para accesibilidad o catalogación de contenido visual.
- Investigación en eficiencia de modelos MoE: la compilación permite estudiar el comportamiento de un MoE de 26B con 4B activos en hardware de consumo, incluyendo el efecto de la cuantización a 8 bits.
- Evaluación de decodificación especulativa: el drafter MTP incluido permite medir la aceleración por decodificación especulativa en MLX, un caso de uso relevante para ingenieros de rendimiento.
- Chat multimodal con contexto conversacional: al ser instruction-tuned, puede mantener conversaciones multi-turno con imágenes intercaladas, aunque la longitud de contexto no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo proporciona métricas de fidelidad de la cuantización respecto al modelo bf16 original: KL de 0,27 nats y coincidencia top-1 del 90,1 % para la versión de 8 bits.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el repositorio completo ocupa 95,4 GB, pero la carpeta de 8 bits contiene pesos de aproximadamente 18,5 GB (suma de los fragmentos safetensors), por lo que se necesita al menos esa cantidad de memoria unificada más overhead para el contexto y el drafter MTP.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; se requiere un Mac con al menos 24-32 GB de RAM unificada para la versión de 8 bits, y preferablemente 32 GB o más para margen de contexto.
- Cabe en GPU de consumo: sí, en Macs con Apple Silicon (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max) con RAM suficiente; no está diseñado para GPUs NVIDIA.
- Opciones de despliegue: mlx-vlm (librería indicada), MLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada; la decodificación especulativa mediante MTP puede reducirlos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 26B A4B MLX (esta ficha) | 26B totales, ~4B activos | no disponible | Apache 2.0 | MLX safetensors | Hugging Face, 0 descargas |
| google/gemma-4-26B-A4B-it (base) | 26B totales, ~4B activos | no disponible | Apache 2.0 | safetensors bf16 | Hugging Face (oficial) |
| Otros modelos MoE multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es una versión oficial de Google; es una compilación de terceros (moonbox-dev), por lo que no cuenta con el respaldo del desarrollador original.
- El repositorio registra 0 descargas y 0 likes, lo que indica falta de validación por parte de la comunidad.
- La cuantización a 8 bits introduce una degradación medible (KL 0,27 nats, top-1 90,1 %), que puede afectar a tareas sensibles a la precisión.
- Solo se documenta la precisión de 8 bits; no se confirman otras cuantizaciones en la información disponible.
- La longitud de contexto no está documentada, lo que limita la planificación de aplicaciones con contextos largos.
- Los idiomas soportados no están disponibles; no se puede garantizar un rendimiento multilingüe concreto.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 con enlace a la licencia Gemma 4 de Google; conviene revisar los términos de dicha licencia para uso comercial.
- El tamaño del repositorio (95,4 GB) incluye todas las precisiones; la descarga selectiva de la carpeta de 8 bits es necesaria para un uso práctico.
- Requiere hardware Apple Silicon y la librería mlx-vlm; no es portable a ecosistemas CUDA sin conversión.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/gemma-4-26B-A4B-it-MLX
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper referenciado (arXiv:2607.02770): no disponible como enlace directo en la información proporcionada
