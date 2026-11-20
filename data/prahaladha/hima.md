# Prahaladha/hima

## Resumen

Hima-ASR es un modelo compacto de 0,46 mil millones de parámetros desarrollado por Prahaladha que combina reconocimiento automático del habla (ASR) con una cabeza de decisión capaz de responder preguntas en lenguaje natural sobre el contenido paralingüístico del audio: emoción, intención del interlocutor, tema, urgencia, idioma y hablante. Cubre once lenguas indias (asamés, bengalí, gujarati, hindi, kannada, malayo, maratí, oriya, panyabí, tamil, telugu) y el inglés, e incluye soporte para code-switching.

El modelo se construye por fine-tuning sobre Qwen/Qwen3-ASR-1.7B y google/gemma-3-270m, y se distribuye con una tabla de piezas recortada a 63.335 tokens (0,46B) junto a una variante `full-vocab` de 262.144 piezas (0,59B). Su propuesta diferencial es unificar transcripción y clasificación en una sola pasada de audio: el codificador se ejecuta una vez y tanto el escritor como la cabeza de decisión leen su salida, con latencias inferiores a medio segundo por clip en GPU de portátil.

La relevancia actual radica en su despliegue versátil: versiones PyTorch, ONNX (fp32, int8, q4) y MLX (fp16, 8-bit) permiten ejecutarlo desde CPU hasta Apple Silicon, con velocidades declaradas de hasta 63x tiempo real en MLX fp16. Está pensado para entornos de atención al cliente, moderación y análisis de llamadas donde se necesita transcripción más señales de decisión en una única llamada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio con escritor autoregresivo y cabeza de decisión (fine-tuning de Qwen/Qwen3-ASR-1.7B y google/gemma-3-270m) |
| Parametros totales | 459.713.255 (0,46B) en la variante `main`; 0,59B en `full-vocab` |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (clips de audio de 1 a 30 segundos) |
| Tipos de cuantizacion | fp32, int8 (ONNX), q4 (ONNX), fp16 (MLX), 8-bit (MLX) |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, or, pa, ta, te, en |
| Licencia | apache-2.0-and-gemma (ver NOTICE) |
| Formato de pesos | safetensors; ONNX y MLX en repositorios separados |
| Entrada | audio mono a 16 kHz, 1 a 30 segundos por clip |
| Cabeza de decisión | 17,5M parámetros |
| Tamaño del repositorio | 2,2 GB |

## Arquitectura y entrenamiento

Hima-ASR sigue un esquema encoder-decoder para ASR con un codificador de audio compartido que alimenta dos cabezas: un escritor (decoder autoregresivo con tabla de piezas de 63.335 tokens en la variante principal) y una cabeza de decisión de 17,5M parámetros que responde preguntas de opción múltiple, sí/no o escala, devolviendo una probabilidad por opción. El codificador se ejecuta una única vez por clip y ambas cabezas leen su representación, lo que permite obtener transcripción y decisiones en una sola pasada.

El modelo parte de Qwen/Qwen3-ASR-1.7B y google/gemma-3-270m mediante fine-tuning, aunque la información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La innovación técnica destacable es la integración de "speech-to-decision" en el mismo modelo que transcribe, junto con la variante `full-vocab` que preserva la tabla de piezas original de 262.144 tokens a costa de 0,59B parámetros.

## Capacidades

- Transcripción de voz a texto en once lenguas indias e inglés, con detección automática de idioma cuando no se especifica.
- Estilos de salida `native` (escritura propia del idioma) y `mixed` (palabras inglesas en caracteres latinos) para escenarios de code-switching.
- Procesamiento por lotes de clips (`batch_size` configurable, por defecto 16).
- Cabeza de decisión que responde preguntas en inglés sencillo sobre el audio: emoción (calma, enfado, confusión, prisa, alegría), intención del interlocutor, tema, urgencia y petición de hablar con un humano.
- Preguntas de tipo opción múltiple, sí/no y escala, con probabilidad por opción.
- Detección de hablante y reconocimiento de emoción (según etiquetas del modelo).
- Ejecución en GPU, CPU (ONNX Runtime) y Apple Silicon (MLX), con variantes cuantizadas.
- No se documentan capacidades de tool calling, agentes ni visión.

## Casos de uso

- Atención al cliente telefónica: transcribir la llamada y, en la misma pasada, clasificar la intención del cliente ("pagará", "ya pagó", "no puede pagar ahora") y la urgencia, gracias a la cabeza de decisión que devuelve probabilidades por opción.
- Enrutamiento inteligente de llamadas: usar la pregunta "¿el hablante pide hablar con un humano?" con tipo `yesno` para derivar a un agente humano cuando la probabilidad supera un umbral.
- Análisis de sentimiento y tono en centros de contacto: clasificar la emoción del interlocutor (enfado, confusión, prisa) para priorizar casos críticos o activar protocolos de escalado.
- Transcripción multilingüe para subtitulado: generar subtítulos en once lenguas indias e inglés con detección automática de idioma, útil en plataformas de contenido regional.
- Moderación de audio en comunidades: detectar tema y tono en clips cortos (1-30 s) para filtrar contenido sensible antes de su publicación.
- Procesamiento en dispositivos sin GPU: desplegar la variante ONNX int8 (487 MB, 35x tiempo real) en servidores CPU o edge para transcripción por lotes de archivos de archivo histórico.
- Análisis de llamadas de cobranza: combinar transcripción con decisiones de intención de pago y urgencia para generar informes estructurados por llamada.
- Investigación lingüística en code-switching: usar el estilo `mixed` para estudiar préstamos del inglés en habla india con transcripciones que preservan la ortografía latina.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados):

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| Hima-ASR | FLEURS (12 idiomas), test | WER medio | 12,7 |
| Hima-ASR | Kathbath (hindi), test | WER | 3,4 |
| Hima-ASR | Lahaja (hindi), test | WER | 8,8 |

Velocidades declaradas por el autor (factor multiplicador sobre tiempo real):

| Plataforma | Versión | Tamaño | Velocidad |
|---|---|---|---|
| CPU | PyTorch | 920 MB | 16x |
| CPU | ONNX fp32 | 1,8 GB | 25x |
| CPU | ONNX int8 | 487 MB | 35x |
| CPU | ONNX q4 | 360 MB | 31x |
| Mac GPU | PyTorch | 920 MB | 21x |
| Mac GPU | MLX fp16 | 1,0 GB | 63x |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 0,46B parámetros en fp32 el peso ronda 920 MB, por lo que en fp16 o int8 cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente; el autor cita "laptop GPU" para latencias inferiores a 0,5 s por clip. Para lotes grandes, A100 o H100 no son necesarias pero aceleran el throughput.
- Cabe en GPU consumer: sí, en todas las RTX y en Apple Silicon mediante MLX.
- Despliegue: PyTorch con `transformers>=5.13`, ONNX Runtime (sin PyTorch, solo numpy y tokenizers) y MLX en Mac. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: menos de 0,5 s por clip en GPU de portátil; 16x tiempo real en CPU con PyTorch y hasta 63x en MLX fp16.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hima-ASR | 0,46B (0,59B full-vocab) | 11 indias + inglés | 1-30 s por clip | apache-2.0-and-gemma | Hugging Face (PyTorch, ONNX, MLX) |
| Whisper (variantes) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Qwen3-ASR-1.7B (base) | 1,7B | no disponible | no disponible | no disponible | Hugging Face |
| Gemma-3-270m (base) | 270M | no disponible | no disponible | no disponible | Hugging Face |

La información proporcionada no incluye resultados de benchmarks de los modelos base ni de alternativas comparables, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); deben tomarse con cautela.
- La cobertura lingüística se limita a once lenguas indias e inglés; no se documenta soporte para otras lenguas.
- La entrada de audio está restringida a clips de 1 a 30 segundos; no se especifica el comportamiento con audios más largos.
- No se detalla la composición del dataset de entrenamiento ni posibles sesgos demográficos, lingüísticos o de dominio.
- Riesgo de alucinación en la transcripción y en las decisiones: las probabilidades de la cabeza de decisión no deben interpretarse como certeza, especialmente en audio ruidoso o con acentos no representados.
- La licencia es compuesta (`apache-2.0-and-gemma`), lo que puede imponer restricciones adicionales derivadas de Gemma; es necesario revisar el NOTICE antes de uso comercial.
- El uso de `trust_remote_code=True` implica ejecutar código del autor, con el riesgo de seguridad asociado.
- La cabeza de decisión responde a preguntas formuladas en inglés sencillo; no se documenta su comportamiento en otros idiomas de consulta.
- No se documentan capacidades de tool calling, agentes ni integración con frameworks de orquestación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prahaladha/hima
- Repositorio ONNX: https://huggingface.co/Prahaladha/hima-asr-ONNX
- Repositorio MLX fp16: https://huggingface.co/Prahaladha/hima-asr-mlx
- Repositorio MLX 8-bit: https://huggingface.co/Prahaladha/hima-asr-mlx-8bit
- Aviso de licencia: https://huggingface.co/Prahaladha/hima-asr/blob/main/NOTICE
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo base Gemma-3-270m: https://huggingface.co/google/gemma-3-270m
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Kathbath: https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset Lahaja: https://huggingface.co/datasets/ai4bharat/Lahaja
