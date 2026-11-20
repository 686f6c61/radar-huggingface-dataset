# Prahaladha/hima-asr

## Resumen

Hima-ASR es un modelo compacto de reconocimiento automático del habla (ASR) desarrollado por Prahaladha, orientado a 11 lenguas indias y al inglés. Con 459,7 millones de parámetros en su variante principal, el modelo parte de una adaptación sobre Qwen/Qwen3-ASR-1.7B y google/gemma-3-270m, y se distribuye bajo licencia compuesta Apache-2.0 y Gemma. Su propuesta diferencial no es solo transcribir audio, sino combinar transcripción y "decisiones" sobre el audio en una sola pasada: emoción, intención del hablante, urgencia, detección de idioma o identificación del hablante, respondiendo a preguntas formuladas en inglés con probabilidades por opción.

El modelo está diseñado para audio de 16 kHz mono en clips de 1 a 30 segundos, y está pensado para ejecutarse tanto en GPU como en CPU (mediante ONNX Runtime) y en Apple Silicon (mediante MLX). Su tamaño reducido y sus versiones cuantizadas (int8, q4, 8-bit) lo sitúan en el segmento de modelos desplegables en hardware de consumo, con velocidades declaradas de hasta 63 veces tiempo real en GPU de Mac con MLX fp16.

Es relevante ahora porque cubre un hueco poco atendido: ASR multilingüe para lenguas indias con code-switching, empaquetado con una cabeza de decisión ligera (17,5 M de parámetros) que evita tener que encadenar modelos separados de clasificación de emociones o intención. Todo ello con un consumo de recursos modesto y opciones de despliegue sin PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de speech con encoder de audio y cabezas de transcripcion y decision; basado en Qwen/Qwen3-ASR-1.7B y google/gemma-3-270m) |
| Parametros totales | 459.713.255 (0,46B) en la variante principal; 0,59B en la rama `full-vocab` |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clips de audio de 1 a 30 segundos) |
| Tipos de cuantizacion | fp32, int8, q4 (ONNX); fp16 y 8-bit (MLX) |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, or, pa, ta, te, en (11 lenguas indias e ingles) |
| Licencia | apache-2.0-and-gemma (licencia compuesta; ver NOTICE) |
| Formato de pesos | safetensors (repo principal); ONNX y MLX en repos separados |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de speech con un encoder de audio que se ejecuta una vez por clip, y dos cabezas que leen su salida: un escritor (transcripción) y una cabeza de decisión de 17,5 M de parámetros. El modelo base declarado es Qwen/Qwen3-ASR-1.7B, con google/gemma-3-270m también referenciado como base, lo que sugiere una adaptación o destilación desde esos modelos. La variante principal usa una tabla de piezas recortada a 63.335 unidades (0,46B de parámetros), mientras que la rama `full-vocab` conserva la tabla completa de 262.144 piezas (0,59B). El modelo requiere `trust_remote_code=True` y una versión de transformers igual o superior a 5.13.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Las capacidades declaradas (detección de emoción, intención, urgencia, idioma y hablante) se resuelven mediante la cabeza de decisión, que responde a preguntas en inglés con una probabilidad por cada opción, incluyendo tipos `yesno` y `scale`. La innovación destacable es la ejecución única del encoder por clip, compartida entre transcripción y decisiones, lo que reduce el coste frente a pipelines con modelos separados.

## Capacidades

- Transcripción de voz a texto en 11 lenguas indias (assamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, oriya, panyabí, tamil, telugu) e inglés.
- Detección automática de idioma cuando no se especifica `language`.
- Estilo de salida configurable: `native` (escritura propia) o `mixed` (palabras inglesas en alfabeto latino).
- Manejo de code-switching entre lenguas indias e inglés.
- Procesamiento por lotes de clips (`batch_size` por defecto 16).
- "Speech to decisions": responde preguntas en inglés sobre el audio con probabilidades por opción.
- Clasificación de emoción y tono del hablante (calma, educado, enfadado, confundido, apresurado, alegre, etc., según las opciones que defina el usuario).
- Detección de intención del interlocutor (por ejemplo, pagará, ya pagó, no puede pagar ahora, llamadme luego, persona equivocada).
- Preguntas de tipo sí/no y de escala (urgencia).
- Identificación del idioma y del hablante.
- Entrada de audio de 16 kHz mono, clips de 1 a 30 segundos.

## Casos de uso

- Atención al cliente telefónica: el modelo transcribe la llamada y, en la misma pasada, clasifica la intención del cliente y su tono emocional, lo que permite enrutar la llamada a un agente humano o a un flujo automatizado sin encadenar un ASR y un clasificador independientes.
- Análisis de urgencia en centros de contacto: usando la pregunta de escala, se puede priorizar colas de atención según la urgencia detectada en el audio, con latencia inferior a medio segundo por clip en GPU de portátil según el autor.
- Transcripción multilingüe para el mercado indio: útil en entornos donde se alternan hindi, tamil, telugu e inglés en la misma conversación, gracias al soporte de code-switching y al estilo `mixed`.
- Moderación y control de calidad de grabaciones: detección de emociones negativas o tono agresivo en clips de 1 a 30 segundos, apto para revisión de muestras de audio en pipelines de QA.
- Despliegue en CPU sin PyTorch: la versión ONNX int8 (487 MB) o q4 (360 MB) permite integrar transcripción y decisiones en servidores sin GPU, con velocidades declaradas de 35x y 31x tiempo real respectivamente.
- Aplicaciones locales en Apple Silicon: la versión MLX fp16 (1,0 GB) alcanza 63x tiempo real en GPU de Mac, adecuada para prototipos, herramientas de escritorio o procesamiento por lotes en portátiles.
- Enriquecimiento de datos de audio para investigación: generación de transcripciones y etiquetas de emoción, intención e idioma sobre corpus de lenguas indias para entrenar o evaluar otros sistemas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Dataset | Idioma | Métrica | Valor |
|---|---|---|---|
| FLEURS (12 idiomas) | 12 idiomas | WER medio | 12,7 |
| Kathbath | Hindi | WER | 3,4 |
| Lahaja | Hindi | WER | 8,8 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo principal ocupa 920 MB en fp32 y el tamaño del repo es de 2,2 GB, por lo que la inferencia en GPU requiere un margen modesto (del orden de 1-2 GB según lote y precisión).
- GPU recomendadas: no se especifican modelos concretos; el autor indica que funciona en GPU, CPU y Mac. Cualquier GPU con suficiente memoria para un modelo de 0,46B debería ser viable.
- GPU de consumo: sí cabe; el modelo está pensado para ejecutarse en hardware modesto, incluyendo GPU de portátil según el autor.
- Opciones de despliegue: PyTorch con transformers >= 5.13 y `trust_remote_code=True`; ONNX Runtime (repos `hima-asr-ONNX`) para CPU sin PyTorch; MLX (`hima-asr-mlx`, `hima-asr-mlx-8bit`) para Apple Silicon. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput declarados por el autor (veces tiempo real): PyTorch CPU 16x; ONNX fp32 25x; ONNX int8 35x; ONNX q4 31x; PyTorch Mac GPU 21x; MLX fp16 63x. El autor afirma menos de medio segundo por clip en GPU de portátil.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento, parámetros o contexto de modelos alternativos comparables, por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, el modelo se posiciona en el segmento de ASR multilingüe compacto para lenguas indias, con la particularidad de incorporar una cabeza de decisión integrada, algo que los ASR convencionales no ofrecen de serie.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Decisión integrada |
|---|---|---|---|---|---|
| Hima-ASR | 0,46B | clips de 1-30 s | 11 indias + inglés | apache-2.0-and-gemma | Sí |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model-index).
- La licencia es compuesta (Apache-2.0 y Gemma); es imprescindible revisar el NOTICE antes de un uso comercial, ya que la licencia Gemma impone restricciones adicionales.
- El modelo está especializado en lenguas indias e inglés; no se declara soporte para otras lenguas, por lo que su uso fuera de ese ámbito no está garantizado.
- La entrada está limitada a audio de 16 kHz mono y clips de 1 a 30 segundos; no se indica comportamiento con audio más largo o con otras frecuencias de muestreo.
- No se documentan en la información disponible los sesgos del modelo, la composición del dataset de entrenamiento ni las tasas de alucinación en transcripción.
- La cabeza de decisión responde con probabilidades sobre las opciones que proporcione el usuario; la calidad de esas decisiones depende de la formulación de la pregunta y de las opciones elegidas, y no se han publicado métricas de calibración.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código en entornos de producción.
- No se especifican requisitos de memoria ni latencia para lotes grandes más allá de los valores de velocidad declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prahaladha/hima-asr
- Rama con vocabulario completo: https://huggingface.co/Prahaladha/hima-asr/tree/full-vocab
- Aviso de licencia: https://huggingface.co/Prahaladha/hima-asr/blob/main/NOTICE
- Versión ONNX (CPU): https://huggingface.co/Prahaladha/hima-asr-ONNX
- Versión MLX fp16 (Apple Silicon): https://huggingface.co/Prahaladha/hima-asr-mlx
- Versión MLX 8-bit (Apple Silicon): https://huggingface.co/Prahaladha/hima-asr-mlx-8bit
- Modelo base Qwen3-ASR: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo base Gemma 3 270M: https://huggingface.co/google/gemma-3-270m
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Kathbath: https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset Lahaja: https://huggingface.co/datasets/ai4bharat/Lahaja
