# Sido/makellm-ja-spm-200m-2x-8k

## Resumen

makellm-ja-spm-200m-2x-8k es un modelo de lenguaje en japonés entrenado desde cero por Tsutomu Uchida (Sido), no un ajuste fino de pesos preexistentes como Gemma o Qwen. Se trata de un transformer denso de 16 capas con 238.324.736 parámetros (unos 238M, aunque la serie comercial se denomine "200M"), hidden de 1024, 16 cabezas de atención y FFN de 2816. Emplea vocabulario SentencePiece unigram de 16.000 tokens y una longitud de contexto de 8.192 tokens, extendida desde 512 mediante interpolación lineal de RoPE con factor 16.

El modelo parte de la serie makellm 200M 2× y añade una fase de extensión de contexto (512 → 4K → 8K) seguida de ajuste para instrucciones y conversación, orientado a tareas de lectura comprensiva, diálogo y resumen con fundamento. La arquitectura es compatible con los kernels GGUF de tipo `qwen3`, lo que permite ejecutarlo en llama.cpp y Ollama, pero el autor insiste en que no se han reutilizado pesos de Qwen.

Es relevante por su carácter experimental y su tamaño reducido: sirve como banco de pruebas para investigar extensión de contexto y ajuste conversacional en modelos japoneses de bolsillo, ejecutables en CPU. La publicación se limita a pesos GGUF (F16, Q8_0 y Q4_0), sin checkpoint FP32 ni corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, compatible con GGUF `qwen3` (RMSNorm, SwiGLU, QK-norm, RoPE) |
| Parametros totales | 238.324.736 (unos 238M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (entrada, historial y generación combinados) |
| Tipos de cuantizacion | F16 (referencia), Q8_0, Q4_0 |
| Idiomas soportados | Japonés (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (F16: 477.344.480 bytes; Q8_0: 253.948.672 bytes; Q4_0: 134.804.192 bytes) |

Detalles adicionales de arquitectura: 16 capas, hidden 1024, 16 attention heads, FFN 2816, vocabulario SentencePiece unigram de 16.000 tokens, tokens especiales de conversación `<|user|>`, `<|bot|>` y `<|end|>`. Posición con RoPE e interpolación lineal de factor 16 sobre la ventana original de 512.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 16 capas con normalización RMSNorm, activación SwiGLU y QK-norm, posicionado con RoPE. La extensión de contexto se realizó en dos etapas (512 → 4K → 8K) mediante interpolación lineal de RoPE con factor 16, un enfoque clásico para alargar la ventana sin reentrenar desde cero la codificación posicional. El tokenizador es un SentencePiece unigram de 16.000 entradas, incluido en el repositorio como `data/spm/sp16k_premium2.model`.

El entrenamiento parte de la serie makellm 200M 2× y añade una fase de ajuste para instrucciones y conversación centrada en lectura comprensiva, diálogo y resumen con fundamento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del corpus, ni si se emplearon RLHF o DPO. El autor indica que el checkpoint publicado corresponde a `round07_natural2500_step512`, fijado antes de la evaluación final, y que los datos RealPersonaChat de hablantes femeninas veinteañeras recopilados para esta iteración no se usaron en el entrenamiento de estos pesos. Tampoco se incluyen el checkpoint FP32 ni el corpus original en la distribución GGUF.

## Capacidades

- Generación de texto en japonés con ventana de hasta 8.192 tokens (entrada, historial y salida combinados).
- Lectura comprensiva de un solo pasaje con pregunta única (evaluada por coincidencia exacta de términos).
- Respuesta a múltiples preguntas sobre un mismo contexto, con calidad limitada (ver benchmarks).
- Conversación multi-turno mediante los tokens especiales `<|user|>`, `<|bot|>` y `<|end|>`.
- Resumen con fundamento y tareas de síntesis conversacional, con rendimiento moderado.
- Ejecución en CPU mediante llama.cpp y Ollama; arquitectura compatible con kernels GGUF `qwen3`.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: únicamente japonés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en extensión de contexto: el modelo permite comparar el rendimiento a 512, 4K y 8K tokens sobre el mismo conjunto de pesos F16, útil para estudiar la degradación de atención en ventanas largas con modelos pequeños.
- Prototipado de asistentes conversacionales en japonés sobre CPU: con Q4_0 (unos 135 MB) se puede desplegar un chatbot de bajo coste en entornos sin GPU, aceptando la pérdida de calidad medida frente a F16.
- Evaluación de pipelines de tokenización: el repositorio incluye `exact_spm_inference.py` y `chat.py` para invocar el modelo con los mismos IDs enteros de SentencePiece que en entrenamiento, lo que sirve para validar diferencias entre el tokenizador interno de GGUF y el original.
- Tareas de lectura comprensiva acotada: extracción de datos concretos de un pasaje corto (por ejemplo, hora y responsable de una reunión) mediante preguntas de un solo turno, donde el modelo alcanza 58/93 y 60/96 en las evaluaciones publicadas.
- Resumen con fundamento en documentos breves: con 33/40 en la tarea de síntesis conversacional, puede emplearse como componente de resumen extractivo en flujos internos donde se revise la salida.
- Banco de pruebas para cuantización: comparar F16, Q8_0 y Q4_0 sobre las mismas tareas permite calibrar el impacto de la cuantización en modelos de menos de 250M de parámetros.
- Docencia y experimentación con modelos from-scratch: al no derivar de pesos preentrenados comerciales, es adecuado para estudiar el ciclo completo de entrenamiento, extensión de contexto y ajuste conversacional en japonés.

## Benchmarks y rendimiento

Comparación de longitud de contexto sobre los mismos pesos F16 y el mismo conjunto de problemas:

| Tarea | 512 | 4K | 8K |
|---|---:|---:|---:|
| Lectura de pregunta única | 58/93 | 59/93 | 58/93 |
| Acierto completo en múltiples preguntas | 8/25 | 6/25 | 5/25 |
| Síntesis conversacional y resumen | 27/40 | 34/40 | 33/40 |

Evaluación final a 8K por cuantización (denominadores distintos a la tabla anterior, no acumulables):

| Tarea | F16 | Q4_0 | Q8_0 |
|---|---:|---:|---|
| Lectura de pregunta única | 60/96 | 53/96 | No medido |
| Acierto completo en múltiples preguntas | 5/27 | 3/27 | No medido |
| Síntesis conversacional y resumen | 33/40 | 29/40 | No medido |

La lectura se puntúa por coincidencia exacta de términos; las preguntas múltiples y la síntesis, por juicio de contenido con IA. La tarea de síntesis comparte formato con el entrenamiento, por lo que los números no garantizan calidad en conversación natural ni en textos largos desconocidos. En una comprobación de desarrollo con 9 preguntas en lenguaje natural no se confirmó mejora en resúmenes concisos frente a la copia literal del original. Q8_0 se cuantizó para esta publicación pero no ha recibido la batería completa de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 requiere aproximadamente 0,5 GB de pesos; Q8_0, unos 0,25 GB; Q4_0, unos 0,13 GB. A ello hay que sumar la caché KV para 8.192 tokens, que con 16 capas y 16 cabezas es modesta pero no despreciable.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre puede alojar el modelo en F16; tarjetas como RTX 3060, RTX 4090, A100 o H100 son sobradas y no aportan ventaja por tamaño. El caso de uso natural es CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas, incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (`llama-server` con `--ctx-size 8192`, `--n-gpu-layers 0` para CPU), Ollama mediante el `Modelfile` incluido, y cualquier runtime compatible con GGUF de arquitectura `qwen3`.
- Latencia y throughput: no disponibles en la información proporcionada. El autor documenta una verificación de arranque y respuesta en `publication_verification.json`, pero sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| makellm-ja-spm-200m-2x-8k | 238M | 8.192 | Japonés | CC BY-SA 4.0 | GGUF (F16, Q8_0, Q4_0) |
| Modelos comparables de la misma serie makellm 200M 2× | no disponible | 512 (versión base) | Japonés | CC BY-SA 4.0 | no disponible |
| Alternativas de menos de 500M en japonés | no disponible | no disponible | Japonés | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- El propio autor señala debilidades en tareas de agregación de múltiples informaciones, exactitud del conocimiento, cálculo y seguimiento de instrucciones.
- Funcionar hasta 8K no equivale a comprender correctamente 8K tokens: la lectura de pregunta única no mejora con el contexto y el acierto completo en preguntas múltiples empeora (8/25 a 512 frente a 5/25 a 8K).
- La tarea de síntesis comparte formato con el entrenamiento, de modo que sus resultados sobreestiman la calidad en conversación natural y textos largos no vistos.
- Q4_0 muestra degradación medible frente a F16 (53/96 frente a 60/96 en lectura de pregunta única); Q8_0 no tiene benchmark completo.
- Riesgo de alucinación y de errores de cálculo no cuantificado en la información disponible, pero coherente con el tamaño y las debilidades declaradas.
- Solo soporta japonés; no hay capacidades multilingües, de tool calling ni de agente.
- La tokenización interna de GGUF puede diferir del SentencePiece de entrenamiento en caracteres raros (byte fallback); para reproducir la evaluación hay que usar el tokenizador incluido.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- No se distribuyen el checkpoint FP32 ni el corpus de entrenamiento, lo que limita la reproducibilidad completa del entrenamiento.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Sido/makellm-ja-spm-200m-2x-8k
- Perfil del autor: https://huggingface.co/Sido
- Repositorio llama.cpp (runtime compatible): https://github.com/ggml-org/llama.cpp
- Ollama (runtime compatible): https://ollama.com
- SentencePiece (tokenizador): https://github.com/google/sentencepiece
