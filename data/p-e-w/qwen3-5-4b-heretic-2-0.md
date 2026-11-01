# p-e-w/Qwen3.5-4B-heretic-2.0

## Resumen

Qwen3.5-4B-heretic-2.0 es una variante "decensored" (también etiquetada como abliterated o uncensored) del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario p-e-w mediante la herramienta Heretic v2.0.0. El modelo base Qwen3.5-4B lo desarrolla el equipo Qwen de Alibaba y es un modelo causal de lenguaje con codificador de visión, de aproximadamente 4.500 millones de parámetros, pensado para tareas de razonamiento, código, agentes y comprensión visual. La modificación de Heretic no reentrena el modelo: aplica una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 7 a 26 para reducir la tasa de rechazos ante peticiones que el modelo original declinaría.

El interés de esta ficha reside en dos frentes. Por un lado, documenta el comportamiento del Qwen3.5-4B original: arquitectura híbrida con Gated DeltaNet y atención con compuertas, contexto nativo de 262.144 tokens extensible hasta 1.010.000, y soporte declarado de 201 idiomas y dialectos. Por otro, describe una intervención de alineación reproducible que rebaja los rechazos de 99/100 a 11/100 en la evaluación del autor, con una divergencia KL de 0,0285 respecto al modelo original, lo que cuantifica cuánto se ha desplazado la distribución de salida.

La relevancia práctica es doble: sirve como caso de estudio de técnicas de ablación de direcciones de activación en modelos pequeños, y como alternativa para investigadores que necesitan un modelo de 4B con visión y contexto largo sin las restricciones de rechazo del modelo alineado. Conviene subrayar que la licencia Apache 2.0 se hereda del modelo base y que el autor no publica evaluación de capacidades tras la ablación más allá de la tasa de rechazos y la KL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal language model con codificador de visión; híbrido Gated DeltaNet + Gated Attention, con FFN densa y MTP entrenado multi-step |
| Parametros totales | 4.539.265.536 (según safetensors); el autor del modelo base declara 4B |
| Parametros activos | no disponible (no se describe como MoE en la información proporcionada; el modelo base cita "sparse Mixture-of-Experts" como rasgo de la familia, sin detallar el reparto para esta variante) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos publicados en safetensors; el repo ocupa 9,1 GB) |
| Idiomas soportados | 201 idiomas y dialectos según el modelo base; el repo de esta variante no declara lista de idiomas |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida poco habitual: un layout de 8 bloques, cada uno compuesto por 3 subcapas de Gated DeltaNet (atención lineal) seguidas de 1 subcapa de Gated Attention (atención completa con compuertas). La dimensión oculta es 2560, con 32 capas, embedding de tokens de 248.320 entradas (con padding) atado a la salida LM, y FFN de dimensión intermedia 9216. En el bloque lineal hay 32 cabezas para V y 16 para QK con dimensión de cabeza 128; en el bloque de atención completa hay 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. El modelo se entrenó con multi-token prediction (MTP) multi-step. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000.

El entrenamiento del base combina pre-entrenamiento y post-entrenamiento, con fusión temprana de tokens multimodales (visión y texto en el mismo flujo de entrenamiento), RL escalado sobre entornos multi-agente y una infraestructura asíncrona de RL. La variante heretic-2.0 no reentrena: aplica una ablación de rango arbitrario (ARA) sobre las capas 7 a 26 con los parámetros `preserve_good_behavior_weight = 0,0776`, `steer_bad_behavior_weight = 0,0001`, `overcorrect_relative_weight = 0,9334` y `neighbor_count = 12`. El autor indica que el proceso es reproducible y publica el directorio `reproduce` con instrucciones. La intervención desplaza las activaciones en las capas intermedias para suprimir la dirección asociada al rechazo, manteniendo (según el autor) el comportamiento deseado.

## Capacidades

- Generación de texto conversacional multi-turno con contexto muy largo (hasta 262.144 tokens nativos).
- Razonamiento y conocimiento general y STEM, evaluado en el modelo base con MMLU-Pro.
- Generación y comprensión de código, con soporte declarado para tareas de agentes y paridad con la generación Qwen3 en benchmarks de código.
- Comprensión de imágenes: pipeline `image-text-to-text`, con codificador de visión integrado en el modelo base.
- Razonamiento multi-paso y uso en entornos de agentes (el modelo base se entrenó con RL sobre entornos multi-agente).
- Capacidades multilingües amplias: 201 idiomas y dialectos declarados por el modelo base.
- Modo de pensamiento (thinking) en la familia Qwen3.5, según la información del modelo base; no se detalla su activación concreta en esta variante.
- Reducción drástica de rechazos: 11/100 frentes a 99/100 del original, según la evaluación del autor.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada para esta variante.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve para estudiar cómo una ablación de rango arbitrario sobre capas intermedias altera la tasa de rechazo y la divergencia KL respecto al original, con parámetros publicados y reproducibles.
- Evaluación de robustez de filtros de contenido: permite medir si un clasificador o guardrail externo detecta respuestas que el modelo base habría rechazado, usando la tasa 11/100 como referencia cuantitativa.
- Análisis de documentos largos con imagen: con 262.144 tokens de contexto nativo y codificador de visión, se puede introducir un informe extenso con gráficos y hacer preguntas sobre tablas y figuras en una sola pasada.
- Asistencia técnica en código sobre repositorios medianos: el contexto largo permite incluir varios ficheros y el historial de errores; el modelo base declara paridad con Qwen3 en benchmarks de código.
- Prototipado de agentes multi-paso en local: al ser un modelo de ~4,5B parámetros, cabe en una GPU de consumo con cuantización, lo que facilita iterar sobre bucles de razonamiento y llamadas a herramientas sin coste de API.
- Despliegue multilingüe de bajo coste: los 201 idiomas declarados por el base permiten cubrir atención al cliente en mercados secundarios con un único modelo pequeño, aunque conviene validar la calidad por idioma.
- Generación de descripciones de imágenes en catálogos: el pipeline image-text-to-text permite etiquetar y describir productos con contexto de catálogo completo en la ventana de entrada.

## Benchmarks y rendimiento

Resultados publicados por el autor de la variante heretic-2.0:

| Metrica | Este modelo | Qwen/Qwen3.5-4B |
|---|---|---|
| Rechazos (sobre 100) | 11/100 | 99/100 |
| Divergencia KL | 0,0285 | 0 (por definición) |

Resultados del modelo base Qwen3.5-4B publicados en su model card (subconjunto disponible en la información proporcionada):

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks para la variante heretic-2.0. La tabla de benchmarks del modelo base está incompleta en el material proporcionado: solo se incluye la fila de MMLU-Pro y los valores de Qwen3.5-4B y Qwen3.5-9B no aparecen en el extracto.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 9 GB solo para pesos (4,54B parámetros × 2 bytes), más caché KV y activaciones; el repo completo ocupa 9,1 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB para pesos, más overhead; no se confirma en la información disponible qué formatos GGUF/AWQ/GPTQ publica el autor.
- GPU recomendadas: A100 40/80 GB o H100 para contexto máximo (262.144 tokens) sin cuantizar; L40S o RTX 6000 Ada para despliegues medios; RTX 4090 (24 GB) para BF16 con contexto moderado o cuantización con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en BF16 con contexto moderado, y en GPUs de 8-12 GB con cuantización de 4-8 bits, siempre que se use un runtime que soporte la arquitectura híbrida.
- Opciones de despliegue: el modelo base declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. No se confirma en la información disponible soporte de llama.cpp u Ollama para esta arquitectura híbrida con Gated DeltaNet.
- Latencia y throughput: no disponibles. La arquitectura híbrida con atención lineal está diseñada para alto throughput y baja latencia según el autor del base, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| p-e-w/Qwen3.5-4B-heretic-2.0 | ~4,54B | 262.144 nativo, hasta 1.010.000 | Apache 2.0 | Variante decensored con ARA; 11/100 rechazos, KL 0,0285 |
| Qwen/Qwen3.5-4B | ~4B | 262.144 nativo, hasta 1.010.000 | Apache 2.0 | Modelo base alineado; 99/100 rechazos; multimodal |
| Qwen3.5-9B | ~9B | no disponible en el extracto | no disponible en el extracto | Misma familia, mayor tamaño; benchmarks parciales en la información |
| GPT-OSS-20B | ~20B | no disponible | no disponible | MMLU-Pro 74,8 según la tabla del base |
| Qwen3-30BA3B-Thinking-2507 | 30B totales (A3B) | no disponible | no disponible | MMLU-Pro no disponible en el extracto; referencia de la familia anterior |

La comparación directa con alternativas "abliterated" de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La ablación elimina parte del comportamiento de rechazo del modelo alineado; esto puede aumentar la probabilidad de generar contenido dañino, sesgado o inexacto en dominios sensibles. No debe desplegarse sin guardrails externos.
- La divergencia KL de 0,0285 indica un desplazamiento medible de la distribución de salida respecto al original; no se publican evaluaciones de capacidades (razonamiento, código, visión) tras la ablación, por lo que el impacto en calidad no está cuantificado.
- Riesgo de alucinación inherente a un modelo de 4B: la capacidad de conocimiento factual es limitada en comparación con modelos de mayor tamaño, y el contexto largo no garantiza el uso correcto de toda la información.
- El repo no declara lista de idiomas propia; los 201 idiomas corresponden al modelo base y la calidad por idioma tras la ablación no está verificada.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado; la responsabilidad legal del contenido generado recae en el desplegador.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y se publicó el 1 de noviembre de 2026; no hay validación comunitaria independiente.
- No se confirma soporte de llama.cpp u Ollama para la arquitectura híbrida; conviene verificar el runtime antes de planificar un despliegue en producción.
- El pipeline declarado es image-text-to-text; el uso puramente textual requiere gestionar correctamente las entradas multimodales en el runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/p-e-w/Qwen3.5-4B-heretic-2.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Proyecto Heretic: https://heretic-project.org
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Directorio de reproducción: `reproduce/README.md` dentro del repositorio del modelo
