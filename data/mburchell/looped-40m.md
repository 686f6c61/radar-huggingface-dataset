# mburchell/looped-40m

## Resumen

Looped-40M es un modelo de lenguaje experimental de 40 millones de parámetros desarrollado por el usuario mburchell y publicado en HuggingFace. Se trata de un transformer de estilo Llama entrenado desde cero que incorpora recurrencia: la red apila 10 capas, pero las 6 capas internas se ejecutan dos veces (un bucle), lo que permite reutilizar parámetros y aumentar la profundidad efectiva sin incrementar el recuento de pesos. Usa una anchura de 512, activaciones SwiGLU, atención con GQA y un vocabulario propio de 24.000 tokens con operadores de capitalización.

El modelo se entrenó con aproximadamente 15.000 millones de tokens usando el optimizador Muon, partiendo del subconjunto FineWeb-Edu-dedup de SmolLM-Corpus para el preentrenamiento y una mezcla de SQuAD, Smol-SmolTalk, Everyday Conversations y bAbI para el ajuste conversacional supervisado. La ventana de contexto es de 1.024 tokens y el único idioma declarado es el inglés.

Su relevancia es fundamentalmente investigadora: sirve como banco de pruebas de bajo coste para estudiar arquitecturas recurrentes y estrategias de entrenamiento (Muon, bucle de capas) en modelos pequeños. El propio autor advierte que es un experimento, que resulta relativamente coherente en turnos cortos pero se degrada al crecer el contexto, que no tiene guardarraíles y que no es útil para tareas reales. No debe confundirse con un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama con recurrencia (10 capas, bucle sobre las 6 capas internas) |
| Parametros totales | 40.036.864 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (librería transformers, con custom_code) |

Otros datos técnicos: anchura de 512, activación SwiGLU, atención con GQA, vocabulario propio de 24.000 tokens con operadores de capitalización, plantilla de chat Llama-3 y tamaño del repositorio de 0,2 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo Llama con una particularidad: recurrencia por bucle de capas. El modelo tiene 10 capas, pero las 6 capas internas se recorren dos veces, de modo que la profundidad efectiva de cómputo es mayor que la sugerida por el número de bloques. La anchura del modelo es de 512, emplea SwiGLU en el bloque feed-forward y atención con GQA. El vocabulario es propio, de 24.000 tokens, e incluye operadores de capitalización. El contexto máximo es de 1.024 tokens. El modelo requiere `trust_remote_code` por el tag `custom_code` y la arquitectura `looped_transformer`.

El preentrenamiento usó aproximadamente 15.000 millones de tokens con el optimizador Muon, sobre el subconjunto FineWeb-Edu-dedup de HuggingFaceTB/SmolLM-Corpus (texto web educativo, licencia ODC-BY). Después se aplicó un ajuste conversacional supervisado (SFT) con SQuAD 1.1, Smol-SmolTalk, Everyday Conversations y bAbI QA. La fase final mezcló un 60 % de chats sintéticos locales, un 20 % de Everyday Conversations y un 20 % de Smol-SmolTalk multiturno; las respuestas sintéticas se generaron con un `gemma-4-E2B-it-qat-UD-Q4_K_XL.gguf` servido localmente, con respuestas factuales programáticas, plantillas, ediciones y validación. No se documenta una fase de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat Llama-3, orientada a charla ligera.
- Coherencia razonable en turnos cortos; el propio autor indica que se degrada a medida que crece el contexto.
- Capacidad limitada de respuesta a preguntas factuales, derivada del ajuste con SQuAD y bAbI.
- Comprensión de instrucciones sencillas de resumen y reescritura, procedente de los ejemplos de Smol-SmolTalk.
- Razonamiento básico sobre tareas sintéticas tipo bAbI (selección de tareas).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe: solo inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre arquitecturas recurrentes: sirve para experimentar con el bucle de capas y medir su efecto en la perplejidad y la coherencia frente a un transformer de profundidad fija con el mismo presupuesto de parámetros.
- Estudio del optimizador Muon en modelos pequeños: al ser un entrenamiento reproducible desde cero con 15.000 millones de tokens, permite comparar curvas de pérdida y estabilidad frente a AdamW en un entorno de un solo nodo.
- Pruebas de tokenizadores con operadores de capitalización: el vocabulario propio de 24.000 tokens permite evaluar cómo afecta la tokenización sensible a mayúsculas en tareas de generación corta.
- Docencia y divulgación: un modelo de 40 millones de parámetros que cabe en cualquier GPU consumer y se carga con transformers sirve para explicar el pipeline completo de preentrenamiento y SFT.
- Generación de diálogo sintético de bajo coste: puede usarse como generador auxiliar en la creación de datos conversacionales cortos, siempre con revisión y filtrado posteriores.
- Pruebas de infraestructura de despliegue: por su tamaño reducido es útil para validar pipelines de inferencia (transformers, conversión a GGUF) antes de escalar a modelos mayores.
- Evaluación de robustez y sesgos en modelos pequeños: permite estudiar cómo aparecen sesgos y alucinaciones con presupuestos de entrenamiento y contexto muy limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye un ejemplo cualitativo de conversación sobre aprendizaje automático; no hay cifras de MMLU, HumanEval, GSM8K ni de perplejidad.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 40 millones de parámetros ocupan unos 160 MB; en fp16/bf16, unos 80 MB; en cuantización de 8 bits, unos 40 MB; en 4 bits, unos 20 MB. A ello hay que sumar la caché KV para 1.024 tokens, que es despreciable a esta escala.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; la conversión a GGUF requeriría implementar la arquitectura recurrente en el runtime correspondiente.
- Latencia y throughput estimados: no disponibles. Por el tamaño, se espera un throughput muy alto y latencia de milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mburchell/looped-40m | 40 M | 1.024 | Transformer con bucle de capas | CC BY-SA 4.0 | HuggingFace |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 | Transformer decoder-only | Apache 2.0 | HuggingFace |
| SmolLM2-135M (HuggingFace) | 135 M | 8.192 | Transformer decoder-only | Apache 2.0 | HuggingFace |
| Pythia-70M (EleutherAI) | 70 M | 2.048 | Transformer decoder-only | Apache 2.0 | HuggingFace |

La comparación de rendimiento con estas alternativas no está disponible, ya que no se han publicado benchmarks de looped-40m. Frente a SmolLM y Pythia, looped-40m destaca por su menor tamaño y por la innovación arquitectónica del bucle de capas, pero queda muy por detrás en contexto (1.024 frente a 2.048-8.192 tokens), en licencia (CC BY-SA 4.0 impone compartir igual, frente a Apache 2.0) y en madurez de ecosistema (sin soporte documentado en llama.cpp, Ollama o vLLM).

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo «es probable que esté sesgado, no tiene guardarraíles y es completamente inútil para tareas reales».
- Riesgo alto de alucinación: el ejemplo de la model card contiene afirmaciones imprecisas y el ajuste se hizo en parte con datos sintéticos generados por otro modelo.
- La coherencia se degrada a medida que crece el contexto; el contexto máximo es de solo 1.024 tokens.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Requiere `trust_remote_code=True` por la arquitectura personalizada, lo que implica ejecutar código del autor.
- No es adecuado para producción: sin evaluación de seguridad, sin benchmarks y con cero descargas en el momento de la ficha.
- Los datos de preentrenamiento (FineWeb-Edu) y de SFT (SQuAD, Smol-SmolTalk, Everyday Conversations, bAbI) tienen sus propias condiciones de atribución que deben respetarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mburchell/looped-40m
- Dataset de preentrenamiento SmolLM-Corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset SQuAD 1.1: https://huggingface.co/datasets/rajpurkar/squad
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset Everyday Conversations: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k
- Dataset bAbI QA: https://huggingface.co/datasets/facebook/babi_qa
- Referencia del optimizador Muon: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
