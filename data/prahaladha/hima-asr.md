# Prahaladha/hima-asr

## Resumen

Hima-ASR es un modelo compacto de reconocimiento automático del habla (ASR) desarrollado por Prahaladha, orientado a 11 lenguas de la India y al inglés. Con 586,9 millones de parámetros, combina una torre de codificación de audio con una cabeza de decisión de 17,5 millones de parámetros que responde, en una sola pasada, preguntas en lenguaje natural sobre el audio: emoción, tono, intención del interlocutor, tema, urgencia, formalidad, idioma y hablante. El modelo se presenta como una solución unificada de «speech to text, and speech to decisions».

La arquitectura parte de Qwen/Qwen3-ASR-1.7B y google/gemma-3-270m como modelos base, sobre los que se ha realizado un ajuste fino. Acepta audio mono a 16 kHz con clips de entre 1 y 30 segundos y devuelve tanto la transcripción como un conjunto de probabilidades por cada opción de respuesta definida por el usuario. La inferencia completa (transcripción más decisiones) se ejecuta en menos de medio segundo por clip en una GPU de portátil, según el autor.

Su relevancia actual radica en dos factores: la cobertura de un bloque de lenguas indias habitualmente infrarrepresentadas en modelos ASR abiertos (asamés, bengalí, gujarati, hindi, kannada, malayo, maratí, oriya, punyabí, tamil, telugu) y la integración de tareas de comprensión semántica del audio en el mismo modelo, lo que reduce la necesidad de encadenar un ASR con un clasificador o un LLM posterior en pipelines de atención al cliente y análisis de llamadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo multimodal audio-texto con encoder de audio y cabeza de decisión; base Qwen/Qwen3-ASR-1.7B y google/gemma-3-270m) |
| Parámetros totales | 586.887.680 (0,6B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (clips de audio de 1 a 30 segundos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | as, bn, gu, hi, kn, ml, mr, or, pa, ta, te, en (11 lenguas indias e inglés) |
| Licencia | apache-2.0-and-gemma (licencia compuesta; ver NOTICE) |
| Formato de pesos | safetensors |
| Entrada de audio | 16 kHz mono, 1-30 segundos por clip |
| Cabeza de decisión | 17,5M parámetros |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3-ASR-1.7B y google/gemma-3-270m como modelos base, con un ajuste fino posterior. La estructura descrita en la model card separa dos componentes: un codificador de audio que se ejecuta una vez por clip y una cabeza de decisión de 17,5 millones de parámetros que lee la salida del codificador. El mismo vector de características alimenta tanto al decodificador de texto (transcripción) como a la cabeza de decisión, de modo que una sola escucha produce transcripción y respuestas a preguntas en lenguaje natural.

La cabeza de decisión admite tres formatos de pregunta: elección entre opciones (`choice`), sí/no (`yesno`) y escala ordinal (`scale`). Devuelve una probabilidad por cada opción, no solo la etiqueta ganadora. El modelo incluye un conjunto predefinido de 16 preguntas (tono, emoción, sentimiento, intención, tema, urgencia, formalidad, idioma, hablante, entre otras) definidas en `decide/questions.json`, y permite definir preguntas arbitrarias en inglés.

No se dispone de información sobre el volumen de tokens de audio utilizados, la composición del dataset de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla si se empleó decodificación especulativa u otras optimizaciones de inferencia.

## Capacidades

- Transcripción de voz a texto en 11 lenguas indias (asamés, bengalí, gujarati, hindi, kannada, malayo, maratí, oriya, punyabí, tamil, telugu) y en inglés.
- Detección automática del idioma cuando no se especifica el parámetro `language`.
- Dos estilos de salida: `native` (escritura propia de cada lengua) y `mixed` (palabras inglesas en caracteres latinos), útil para code-switching.
- Procesamiento por lotes: acepta listas de clips y decodifica con `batch_size` configurable (por defecto 16).
- Clasificación de emociones y tono del hablante (calma, enfado, confusión, prisa, alegría, etc.).
- Detección de intención del interlocutor (por ejemplo, «pagará», «ya ha pagado», «no puede pagar ahora», «volverá a llamar», «número equivocado»).
- Detección de petición de atención humana (preguntas de tipo sí/no).
- Estimación de urgencia y formalidad mediante preguntas de escala.
- Identificación del tema de la conversación y del hablante.
- Respuesta a preguntas arbitrarias en inglés con distribución de probabilidad sobre las opciones definidas.
- Ejecución combinada (`both`), solo ASR (`asr`) o solo decisiones (`decide`) en una única llamada.
- Selección automática de dispositivo: CUDA, GPU de Mac o CPU.

## Casos de uso

- **Atención al cliente telefónica en lenguas indias**: el modelo transcribe la llamada y, en la misma pasada, clasifica la emoción del cliente y su intención (reclamar, pagar, cancelar). Al cubrir 11 lenguas y permitir code-switching con inglés, encaja en mercados multilingües donde un único modelo ASR monolingüe obligaría a enrutar por idioma.
- **Enrutamiento inteligente de llamadas**: con las decisiones de urgencia, tema e intención se puede dirigir la llamada al departamento adecuado o a un agente humano. La detección de «¿pide hablar con una persona?» permite escalar automáticamente sin un clasificador adicional.
- **Análisis de calidad y supervisión de agentes**: procesar lotes de grabaciones para medir formalidad, tono y sentimiento del cliente y del agente, generando métricas agregadas por campaña. El procesamiento por lotes (`batch_size`) y la inferencia en menos de 0,5 s por clip en GPU de portátil facilitan el análisis masivo en infraestructura modesta.
- **Transcripción de reuniones y notas en hindi y lenguas regionales**: conversión de audio de 1 a 30 segundos por fragmento a texto en escritura nativa o mixta, con detección automática de idioma para grabaciones donde se alternan lenguas.
- **Moderación y detección de conflictos**: la clasificación de emoción (enfado, frustración) y sentimiento negativo permite marcar interacciones de riesgo en centros de contacto o plataformas de soporte.
- **Investigación en ASR multilingüe para la India**: como modelo abierto de 0,6B con licencia permisiva (sujeta a la licencia compuesta), sirve de base para ajuste fino en dominios específicos o para experimentos de evaluación en FLEURS, Kathbath y Lahaja.
- **Asistentes de voz con comprensión de intención**: integración en asistentes que necesitan no solo transcribir, sino decidir qué quiere el usuario (por ejemplo, «¿quiere reservar, cancelar o consultar?») sin depender de un LLM externo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Conjunto de evaluación | Métrica | Valor |
|---|---|---|---|
| Reconocimiento del habla | FLEURS (12 idiomas), test | WER medio | 12,7 |
| Reconocimiento del habla | Kathbath (hindi), test | WER | 3,4 |
| Reconocimiento del habla | Lahaja (hindi), test | WER | 8,8 |

No se han publicado resultados de benchmarks de la cabeza de decisión (exactitud de clasificación de emoción, intención o urgencia) en la información disponible. Tampoco hay comparaciones con modelos similares en la model card.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo completo ocupa 1,3 GB en el repositorio (pesos en safetensors). Con 0,6B parámetros, la inferencia en fp32 requiere aproximadamente 2,4 GB solo para pesos; en fp16, unos 1,2 GB. La VRAM total dependerá del tamaño de lote y de la longitud del audio.
- **GPU recomendadas**: el autor indica que funciona en una GPU de portátil, con inferencia completa en menos de 0,5 s por clip. Cabe en GPU de consumo como RTX 3060, RTX 4060 o superiores. Para procesamiento por lotes a gran escala se recomiendan A100 o H100, aunque no se publican cifras de throughput para estas.
- **Compatibilidad con GPU de consumo**: sí, dado el tamaño de 0,6B y el requisito de VRAM estimado en torno a 1-3 GB según precisión.
- **Opciones de despliegue**: la model card documenta el uso con `transformers>=5.13` y `trust_remote_code=True`, con soporte para CUDA, GPU de Mac (MPS) y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI; dado que el modelo requiere código personalizado (`custom_code`) y una cabeza de decisión con lógica propia (`decide/`), la integración con estos motores no está documentada.
- **Latencia**: menos de 0,5 segundos por clip en GPU de portátil para transcripción y decisiones combinadas, según el autor. No se especifica el hardware exacto ni la longitud del clip empleada en esa medición.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con modelos alternativos en la información proporcionada. A continuación se comparan características estructurales con alternativas conocidas de la misma categoría (ASR multilingüe abierto), señalando los datos no disponibles:

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| Hima-ASR | 0,6B | 11 lenguas indias + inglés | clips de 1-30 s | apache-2.0-and-gemma | safetensors |
| Whisper large-v3 (OpenAI) | 1,55B | ~99 idiomas | ventanas de 30 s | MIT | safetensors, GGUF, etc. |
| Qwen3-ASR-1.7B (base de Hima-ASR) | 1,7B | no disponible | no disponible | no disponible | safetensors |
| IndicWhisper / modelos ai4bharat | no disponible | lenguas indias | no disponible | no disponible | no disponible |

No se han publicado resultados de WER comparativos entre Hima-ASR y estas alternativas en la información disponible, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- **Resultados no verificados**: los WER de FLEURS (12,7), Kathbath (3,4) y Lahaja (8,8) están declarados por el autor y marcados como no verificados en el model-index.
- **Cobertura limitada de idiomas**: solo 11 lenguas indias e inglés; no cubre otras lenguas asiáticas, africanas o europeas.
- **Duración de audio restringida**: clips de 1 a 30 segundos; no está documentado el comportamiento con audios más largos ni si existe segmentación automática.
- **Dependencia de código remoto**: requiere `trust_remote_code=True` y la carga de un módulo `decide/` desde el repositorio, lo que implica revisar el código antes de usarlo en producción.
- **Licencia compuesta**: la licencia `apache-2.0-and-gemma` combina la Apache 2.0 con la licencia de Gemma; es necesario revisar el archivo NOTICE para confirmar las obligaciones de uso comercial, atribución y restricciones adicionales.
- **Riesgo de alucinación en la transcripción**: como todo modelo ASR, puede generar texto plausible en segmentos con ruido, acentos no vistos o code-switching intenso; no se han publicado métricas de robustez en condiciones reales de telefonía.
- **Cabeza de decisión sin evaluación pública**: no hay datos de exactitud, calibración ni sesgos para las tareas de emoción, intención o urgencia; las probabilidades devueltas no deben interpretarse como calibradas sin validación propia.
- **Sesgos potenciales**: al entrenarse sobre lenguas y acentos de la India, el rendimiento puede degradarse con hablantes de otras variedades diatópicas o con fuerte ruido de fondo; no se documenta la composición del dataset ni los sesgos demográficos.
- **Preguntas de decisión en inglés**: aunque el audio puede estar en cualquier lengua soportada, las preguntas de la cabeza de decisión se formulan en inglés, lo que limita su uso por parte de operadores no angloparlantes.
- **Sin soporte documentado para motores de inferencia estándar**: la ausencia de integración con vLLM, TGI o llama.cpp puede complicar el despliegue en infraestructura de producción ya existente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Prahaladha/hima-asr
- Archivo de licencia (NOTICE): https://huggingface.co/Prahaladha/hima-asr/blob/main/NOTICE
- Modelo base Qwen/Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo base google/gemma-3-270m: https://huggingface.co/google/gemma-3-270m
- Dataset FLEURS (google/fleurs): https://huggingface.co/datasets/google/fleurs
- Dataset Kathbath (ai4bharat/Kathbath): https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset Lahaja (ai4bharat/Lahaja): https://huggingface.co/datasets/ai4bharat/Lahaja
- Demos de audio de decisiones: https://huggingface.co/Prahaladha/hima-asr/resolve/main/decide/demos/hindi_angry_caller.mp3
