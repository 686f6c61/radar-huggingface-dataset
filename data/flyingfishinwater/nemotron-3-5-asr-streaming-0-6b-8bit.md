# flyingfishinwater/nemotron-3.5-asr-streaming-0.6b-8bit

## Resumen

Este repositorio contiene una conversión a cuantización de 8 bits del modelo NVIDIA Nemotron 3.5 ASR Streaming 0.6B, un sistema de reconocimiento automático del habla (ASR) de unos 638 millones de parámetros desarrollado originalmente por NVIDIA y adaptado al framework MLX por la comunidad. El problema que resuelve es la transcripción de voz en tiempo real con latencia controlada: su arquitectura es un FastConformer con decodificador RNNT y caché de atención (cache-aware streaming), lo que permite procesar audio por fragmentos sin esperar a disponer de la señal completa. Además, incorpora condicionamiento mediante prompt de identificación de idioma, de modo que puede detectar el idioma automáticamente o forzarlo, y cubre 40 configuraciones de idioma-región con puntuación y mayúsculas.

La relevancia de esta ficha concreta es doble. Por un lado, el modelo base aporta reconocimiento multilingüe en un tamaño contenido (0,6 B), lo que lo hace desplegable en hardware modesto. Por otro, esta variante reduce el peso a la mitad respecto a bfloat16 manteniendo, según el autor de la conversión, una calidad de transcripción equivalente, y está pensada para ejecutarse en Apple Silicon mediante MLX, un ecosistema donde la oferta de modelos ASR de calidad es más reducida que en CUDA.

El repositorio tiene 0 descargas y 0 «me gusta» en el momento de redactar esta ficha, y fue creado el 18 de septiembre de 2026. Es, por tanto, una conversión reciente y con poca validación independiente por parte de la comunidad, lo que conviene tener en cuenta antes de adoptarla en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNNT (decoder), cache-aware streaming con condicionamiento por prompt de idioma |
| Parámetros totales | 637.991.968 (~638 M; comercializado como 0,6 B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | Atención por fotogramas del codificador: 56 a la izquierda y 0, 3, 6 o 13 a la derecha, según el look-ahead seleccionado. No expone una ventana de tokens tipo LLM. En tiempo real, 56 fotogramas suponen aproximadamente 4,5 s de historial acústico (estimación basada en la configuración habitual de NeMo; no confirmada en la información disponible) |
| Tipos de cuantización | 8 bits en capas Linear y Embedding (group size 64); convoluciones y capas de normalización en bfloat16. Existe también la variante bf16 completa |
| Idiomas soportados | 35 idiomas en los metadatos del repositorio (en, es, de, fr, it, ar, ja, ko, pt, ru, hi, zh, vi, he, nl, cs, da, pl, no, sv, th, tr, bg, el, et, fi, hr, hu, lt, lv, ro, sk, uk, mt, sl); el modelo original declara 40 configuraciones idioma-región |
| Licencia | nvidia-open-model-license (NVIDIA Open Model License) |
| Formato de pesos | safetensors (formato MLX, cuantizado a 8 bits) |
| Tamaño del repositorio | 0,8 GB |
| Librería | mlx-audio |
| Pipeline | automatic-speech-recognition |
| Modelo base | nvidia/nemotron-3.5-asr-streaming-0.6b |

## Arquitectura y entrenamiento

La arquitectura es un encoder FastConformer —una variante de Conformer con submuestreo agresivo de la secuencia de entrada, pensada para reducir el coste computacional en tareas de voz— acoplado a un decodificador RNNT (Recurrent Neural Network Transducer). El decodificador RNNT permite emitir tokens de forma incremental y alineada con el flujo de audio, lo que es la base de la transcripción en streaming. La característica diferencial del modelo es el mecanismo de caché de atención: el encoder mantiene estado entre fragmentos y solo atiende a un número fijo de fotogramas a la izquierda y a la derecha, de modo que el coste por fragmento es constante y la latencia no crece con la duración del audio.

El modelo se entrenó con varios regímenes de look-ahead compatibles: `[56, 0]`, `[56, 3]`, `[56, 6]` y `[56, 13]` (fotogramas a la izquierda y a la derecha). `[56, 0]` es el modo estrictamente causal, con la latencia más baja; `[56, 13]` es el valor por defecto y ofrece la mejor precisión offline a costa de mayor retardo. La información proporcionada no detalla el volumen de horas de audio de entrenamiento, la composición del dataset, ni si se aplicaron fases de ajuste con RLHF o DPO (en un modelo ASR puro no serían de esperar, pero no se confirma). Tampoco se documentan innovaciones adicionales más allá del condicionamiento por prompt de idioma y la propia caché de atención.

En esta conversión concreta, el autor indica que únicamente se han cuantizado los pesos de las capas Linear y Embedding a 8 bits con group size 64, dejando convoluciones y normalizaciones en bfloat16 para preservar la estabilidad numérica. Según la model card, la calidad de transcripción iguala a la del modelo bf16 con un tamaño un 40 % menor.

## Capacidades

- Reconocimiento automático del habla (speech-to-text) multilingüe con salida de texto plano.
- Transcripción en streaming mediante caché de atención, con procesamiento por fragmentos y latencia acotada.
- Transcripción offline o de alta precisión seleccionando el look-ahead `[56, 13]`, que es el valor por defecto.
- Detección automática del idioma de forma predeterminada.
- Forzado manual del idioma mediante la clave prompt correspondiente (`en-US`, `es-ES`, `zh-CN`, `fr-FR`, etc.), útil para evitar confusiones entre idiomas próximos.
- Puntuación y uso de mayúsculas en la salida de transcripción.
- Cobertura declarada de 40 configuraciones idioma-región (35 idiomas listados en los metadatos del repositorio).
- Ejecución local en Apple Silicon mediante MLX con pesos de 8 bits.
- Selección del compromiso latencia/precisión en tiempo de inferencia mediante el parámetro `att_context_size`.

No dispone de capacidades de traducción, resumen, diarización de hablantes, tool calling, function calling ni razonamiento multi-paso con agentes, ya que es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones en local sobre macOS: se puede integrar en una aplicación de escritorio que capture el audio del sistema o del micrófono y lo pase por fragmentos al modelo con `att_context_size=[56, 3]` o `[56, 6]`, obteniendo actas en tiempo real sin enviar audio a servicios externos.
- Dictado por voz con privacidad estricta: en entornos sanitarios, legales o de defensa donde el audio no puede salir del dispositivo, el modelo corre íntegramente en el Mac del usuario gracias a los pesos de 8 bits y a la ejecución local de MLX.
- Subtitulado en directo multilingüe: el modo streaming con look-ahead corto permite emitir subtítulos con poco retardo en retransmisiones o eventos, y el condicionamiento por prompt de idioma evita que el modelo derive hacia otro idioma cuando el hablante alterna lenguas.
- Análisis y clasificación de llamadas de atención al cliente: transcribir lotes de grabaciones con idioma forzado por mercado y volcar el texto a un motor de búsqueda o a un sistema de análisis de sentimiento.
- Indexación y búsqueda de archivos de audio: podcasts, archivos de radio, entrevistas o grabaciones periodísticas se transcriben una sola vez para hacerlos consultables por texto, aprovechando la cobertura de 35 idiomas para fondos documentales heterogéneos.
- Accesibilidad: generación de subtítulos para personas con discapacidad auditiva en aplicaciones de videoconferencia o reproducción de vídeo, con la ventaja de que el procesamiento local elimina la dependencia de conectividad.
- Prototipado rápido en portátiles Apple Silicon: un desarrollador puede validar un producto de voz sin alquilar GPU, usando el modelo de 0,8 GB de peso como base y migrando después a la variante bf16 o a la implementación de NVIDIA si necesita GPU dedicada.
- Preprocesado de pipelines de voz a voz: la transcripción intermedia puede alimentar un LLM local que genere la respuesta, manteniendo todo el circuito en el mismo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión remite a la model card original de NVIDIA para consultar arquitectura, benchmarks y uso previsto, y no reproduce ninguna métrica (WER, MMLU u otras). La única afirmación de rendimiento disponible es cualitativa: el autor sostiene que la calidad de transcripción de la versión de 8 bits iguala a la del modelo en bfloat16 con un tamaño aproximadamente un 40 % menor.

## Requisitos de hardware

- VRAM estimada: al ser pesos MLX, el consumo es de memoria unificada en Apple Silicon. Los pesos de 8 bits ocupan del orden de 0,64 GB y los de bfloat16, alrededor de 1,28 GB, a los que hay que sumar activaciones, caché de atención y el propio runtime de MLX. En la práctica, 4 GB de memoria unificada son suficientes y 8 GB dan margen holgado.
- GPU compatibles: este repositorio está pensado para Apple Silicon (familias M1, M2, M3 y M4). No es un formato utilizable directamente en GPU NVIDIA o AMD mediante CUDA/ROCm; para esas plataformas habría que recurrir a los pesos originales de NVIDIA en otro runtime.
- GPU de consumo: cualquier Mac con chip de la serie M y al menos 8 GB de memoria unificada debería poder ejecutarlo. No cabe esperar soporte en GPUs de consumo NVIDIA a través de este repositorio concreto.
- Opciones de despliegue: `mlx-audio`. La model card advierte de que el soporte de Nemotron ASR está en la rama `main` del repositorio pero no en una versión publicada en PyPI (la última disponible es la 0.4.3), por lo que es necesario instalar desde GitHub con `pip install "git+https://github.com/Blaizzy/mlx-audio.git"`. Existe una interfaz de línea de comandos mediante `python -m mlx_audio.stt.generate`. vLLM, TGI, llama.cpp y Ollama no aplican a este formato.
- Latencia y throughput: no disponibles. El diseño cache-aware garantiza que el coste por fragmento no crezca con la duración del audio, pero no se publican cifras de latencia ni de factor de tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B (esta conversión, 8 bits) | ~638 M | 35 en metadatos; 40 idiomas-región declarados en el original | NVIDIA Open Model License | MLX vía mlx-audio, instalación desde GitHub | Streaming nativo con look-ahead ajustable y condicionamiento por prompt de idioma |
| OpenAI Whisper large-v3 | ~1.550 M | Amplia cobertura multilingüe | MIT | Múltiples runtimes (whisper.cpp, faster-whisper, transformers) | Referencia de facto en ASR multilingüe; no está diseñado para streaming de baja latencia |
| Distil-Whisper large-v3 | ~756 M | Inglés | MIT | Múltiples runtimes | Destilado de Whisper para reducir latencia; pierde cobertura multilingüe |
| NVIDIA Parakeet TDT 0.6B v2 | ~600 M | Inglés | CC-BY-4.0 | NeMo | Mismo orden de tamaño y misma familia tecnológica, pero monolingüe |

No se dispone de comparaciones de rendimiento numéricas (WER u otras) en la información proporcionada, por lo que la tabla se limita a parámetros, cobertura lingüística, licencia y disponibilidad.

## Limitaciones y advertencias

- Rendimiento no verificado: no hay métricas publicadas en la información disponible; la afirmación de que la cuantización a 8 bits iguala al modelo bfloat16 proviene del autor de la conversión y no está respaldada por datos en este repositorio.
- Adopción nula: 0 descargas y 0 «me gusta» en el momento de redactar la ficha. Es un artefacto reciente sin validación independiente de la comunidad.
- Dependencia de una versión no publicada: requiere instalar `mlx-audio` desde la rama `main` de GitHub porque la funcionalidad no está en la última release de PyPI, lo que implica riesgo de cambios incompatibles en el futuro inmediato.
- Discrepancia de autoría: el identificador del repositorio corresponde al usuario `flyingfishinwater`, mientras que el cuerpo de la model card se refiere a `mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit` y atribuye la conversión a `@ARahim3`. Conviene verificar qué artefacto se está descargando realmente.
- Restricciones de plataforma: MLX solo funciona en Apple Silicon. No hay pesos GGUF ni compatibilidad con CUDA a través de este repositorio.
- Licencia: el modelo se distribuye bajo la NVIDIA Open Model License, que permite uso comercial pero impone condiciones de atribución y cumplimiento que deben revisarse en el texto completo antes de un despliegue en producción. Se trata además de una conversión de pesos ajenos, por lo que se heredan los términos del modelo original.
- Riesgo de alucinación inherente a los sistemas ASR: en audio con ruido, música, solapamiento de hablantes o silencios largos, el decodificador puede generar texto que no corresponde a lo pronunciado. La puntuación y las mayúsculas se generan de forma automática y pueden ser incorrectas.
- Limitaciones de idioma: aunque se listan 35 idiomas, el rendimiento no es homogéneo entre ellos y no se publican desgloses por idioma. Los idiomas con pocos recursos dentro de la lista (por ejemplo, maltés, esloveno o estonio) son los candidatos más probables a una tasa de error mayor.
- Sin diarización ni marcas de hablante: el modelo devuelve texto sin identificar quién habla, lo que limita su uso directo en reuniones o entrevistas sin un componente adicional.
- Contexto acústico corto: el historial de 56 fotogramas (del orden de 4,5 s) implica que el modelo no puede apoyarse en contexto muy lejano, lo que puede degradar la coherencia en discursos con referencias lejanas.
- Audio largo: la caché de atención mantiene el coste por fragmento constante, pero no se documenta el comportamiento de la conversión MLX ante entradas de muy larga duración ni el consumo de memoria asociado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/flyingfishinwater/nemotron-3.5-asr-streaming-0.6b-8bit
- Modelo base original: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Conversión en bfloat16 de referencia: https://huggingface.co/mlx-community/nemotron-3.5-asr-streaming-0.6b
- Conversión en 8 bits de referencia: https://huggingface.co/mlx-community/nemotron-3.5-asr-streaming-0.6b-8bit
- Repositorio de mlx-audio: https://github.com/Blaizzy/mlx-audio
- Fork de mlx-audio citado por el autor de la conversión: https://github.com/ARahim3/mlx-audio
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
