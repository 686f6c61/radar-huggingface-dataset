# GetmanY1/wav2vec2-base-fi-conf010-filter-finetuned

## Resumen

wav2vec2-base-fi-conf010-filter-finetuned es un modelo de reconocimiento automático del habla (ASR) para finlandés, desarrollado por Yaroslav Getman (grupo de investigación en speech de la Universidad de Aalto) en el marco del trabajo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL". Se trata de un checkpoint de ablación: un wav2vec 2.0 Base preentrenado sobre 471K horas de audio finlandés filtradas por confianza de ASR con umbral τ = −0,10 y posteriormente ajustado con CTC para transcripción.

El modelo es relevante porque documenta experimentalmente el efecto del filtrado por confianza en el preentrenamiento auto-supervisado a gran escala sobre un idioma de bajos recursos como el finlandés. Con 94,4 millones de parámetros y una arquitectura transformer convolucional estándar de wav2vec 2.0, ofrece un punto de comparación reproducible frente a los modelos principales de la colección del paper, que son los recomendados para uso general.

No es un modelo de propósito general ni un asistente conversacional: es un componente ASR monolingüe que convierte audio de 16 kHz en texto finlandés. Su interés es principalmente científico y de evaluación comparativa dentro de la ablación de filtrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 Base (transformer, 12 capas, dim. oculta 768, feed-forward 3072, encoder convolucional de features) |
| Parametros totales | 94.397.858 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; entrada en muestras de audio a 16 kHz, sin ventana de contexto textual documentada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint original fairseq (`fairseq/checkpoint.pt` con `fairseq/dict.ltr.txt`) |

## Arquitectura y entrenamiento

wav2vec 2.0 Base: un encoder convolucional que transforma la onda de audio en representaciones latentes, seguido de un transformer de 12 capas con dimensión oculta 768 y feed-forward de 3072. El preentrenamiento es auto-supervisado con la pérdida contrastiva de wav2vec 2.0 (enmascaramiento de representaciones latentes y cuantización discreta). El ajuste final es supervisado con CTC sobre 4,6K horas de habla transcrita (corpus del Parlamento finlandés y Lahjoita puhetta), con el encoder convolucional de features congelado durante 16K updates.

Los datos de preentrenamiento provienen del archivo de radio y televisión de la Agencia Finlandesa de Artes y Cultura (KUVI, antes KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandés y Lahjoita puhetta. Todo el audio pasó por detección de actividad de voz y deduplicación basada en transcripciones; después se aplicó filtrado por confianza de ASR con umbral τ = −0,10, reteniendo 471K horas (53% de las 890K horas deduplicadas). El preentrenamiento usó 125K updates, learning rate 6e-4 y aproximadamente 3 minutos de audio por GPU en 512 GPUs. La entrada es audio mono a 16 kHz con `do_normalize=False`.

## Capacidades

- Reconocimiento automático del habla en finlandés con salida CTC a nivel de carácter.
- Transcripción de audio de 16 kHz mono procedente de dominios de broadcast (radio, televisión) y de corpus parlamentarios y de habla espontánea.
- Inferencia batch mediante `Wav2Vec2ForCTC` y `Wav2Vec2Processor` de transformers.
- Carga del checkpoint original en fairseq para reproducibilidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modos de pensamiento.
- Capacidad multilingüe: no; solo finlandés.

## Casos de uso

- Evaluación de ablaciones de filtrado: sirve como punto de control para medir el impacto del filtrado por confianza (τ = −0,10) frente a otros umbrales y frente al modelo principal del paper, en experimentos reproducibles de investigación en speech SSL.
- Transcripción de archivo audiovisual finlandés: adecuado para material de radio y televisión, el mismo dominio del preentrenamiento, con normalización previa a 16 kHz mono.
- Investigación en ASR de bajos recursos: base para estudiar técnicas de adaptación (fine-tuning adicional, destilación) en finlandés con un modelo de 95M parámetros.
- Prototipado de pipelines ASR en CPU/GPU modestas: su tamaño permite desplegar inferencia rápida en entornos con recursos limitados para pruebas de concepto.
- Generación de transcripciones para corpus parlamentarios y de habla espontánea: el ajuste se realizó sobre el Parlamento finlandés y Lahjoita puhetta, por lo que es representativo de esos registros.
- Comparación de decodificación CTC: útil para experimentar con decodificadores (greedy, beam search con modelo de lenguaje) sobre un modelo base de referencia.
- Reproducción de resultados del paper: permite validar la Figura 1 del artículo y comparar checkpoints de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas WER/CER ni comparaciones numéricas; solo remite a la Figura 1 del paper (arXiv:2610.13102) para el contexto de la ablación.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 94,4M parámetros; en fp32 ocupa aproximadamente 0,38 GB de pesos, y en fp16 alrededor de 0,19 GB. Con activaciones y overhead de framework, cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 3060/4060, RTX 4090, A100 o H100 no suponen cuello de botella para un modelo de este tamaño. También es viable en CPU para lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para uso no interactivo.
- Opciones de despliegue: transformers (PyTorch) con `Wav2Vec2ForCTC`, fairseq para el checkpoint original, y exportación a ONNX si se necesita optimización. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo CTC de audio).
- Latencia y throughput estimados: no disponible en la información proporcionada; dependerá del hardware y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| GetmanY1/wav2vec2-base-fi-conf010-filter-finetuned | 94,4M | audio 16 kHz | fi | Apache 2.0 | Checkpoint de ablación, filtrado τ = −0,10 |
| Modelos principales de la colección GetmanY1/wav2vec2-fi-471k | no disponible | audio 16 kHz | fi | no disponible | Recomendados por el autor para uso general |
| GetmanY1/wav2vec2-base-fi-conf010-filter (modelo base) | no disponible | audio 16 kHz | fi | no disponible | Checkpoint previo al fine-tuning CTC |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas. Para uso general, el autor recomienda los modelos principales de la colección del paper frente a este checkpoint de ablación.

## Limitaciones y advertencias

- Modelo de ablación: el propio autor indica que existe para comparación con otros checkpoints y que, para uso general, deben preferirse los modelos principales del paper.
- Monolingüe: solo finlandés; no transcribe otros idiomas.
- Dominio acotado: preentrenado sobre broadcast finlandés y ajustado sobre corpus parlamentario y de habla espontánea; el rendimiento puede degradarse en otros dominios (conversación telefónica, acentos no representados, audio con ruido).
- Entrada estricta: audio mono a 16 kHz y `do_normalize=False`; un preprocesado incorrecto afecta a la calidad de la transcripción.
- Riesgo de alucinación y errores de transcripción: como todo modelo CTC, puede producir sustituciones, omisiones e inserciones, especialmente en audio ruidoso o con solapamiento de hablantes.
- Sesgos: no se documentan análisis de sesgo por hablante, edad, género o variedad dialectal; el corpus de broadcast y parlamentario puede sobrerrepresentar determinados registros.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones de los datos de origen (KUVI, VoxPopuli, Parlamento finlandés, Lahjoita puhetta) si redistribuye derivados.
- Sin datos de cuantización ni de despliegue optimizado publicados; el soporte fuera de transformers/fairseq no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf010-filter-finetuned
- Modelo base: https://huggingface.co/GetmanY1/wav2vec2-base-fi-conf010-filter
- Colección de modelos del paper: https://huggingface.co/collections/GetmanY1/wav2vec2-fi-471k
- Paper: https://arxiv.org/abs/2610.13102
- Código y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
