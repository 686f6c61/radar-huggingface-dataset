# appautomaton/qwen3-forced-aligner-0.6b-fp16-ane

## Resumen

Qwen3-ForcedAligner-0.6B (fp16, Apple Neural Engine) es una conversión del modelo de alineación forzada Qwen3-ForcedAligner-0.6B de Qwen, publicada por App Automaton. El modelo original resuelve un problema muy concreto: dado un audio de voz y su transcripción exacta, devuelve en qué instante se pronunció cada carácter chino y cada palabra inglesa. Esta conversión recompila el modelo para que se ejecute íntegramente en el Neural Engine (ANE) de los chips Apple Silicon, liberando la GPU del sistema para otras tareas.

La arquitectura combina el codificador de audio de Qwen3-ASR con un decodificador de texto de 0,6 mil millones de parámetros cuya cabeza clasifica cada marca temporal en una de 5000 clases de 80 ms, de modo que una sola pasada temporaliza toda la transcripción. La conversión se realizó a partir de los pesos oficiales en bf16, trazando el grafo MLX de `mlx-speech` y reconstruyéndolo con Core AI, sin intervención de PyTorch.

Es relevante para desarrolladores de aplicaciones de voz en macOS que necesiten marcas temporales a nivel de carácter o palabra sin depender de APIs en la nube ni de Python en tiempo de inferencia. El repositorio contiene únicamente modelos Core AI (no incluye checkpoint PyTorch ni safetensors) y requiere un Mac con Apple Silicon y macOS 27 o posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio de Qwen3-ASR + decodificador de texto transformer de 0,6B con cabeza de clasificación temporal (5000 clases de 80 ms) |
| Parametros totales | 0,6 mil millones (decodificador de texto); parametros del codificador de audio no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; limite operativo de audio: ~75 s en chino y ~90 s en ingles por llamada (el modelo original acepta 180 s) |
| Tipos de cuantizacion | fp16 (pesos y activaciones); no se ofrecen otras cuantizaciones en este repo |
| Idiomas soportados | ingles (en), chino (zh) y mezcla de ambos |
| Licencia | Apache 2.0 (el runtime `ane-speech` se distribuye aparte bajo MIT) |
| Formato de pesos | modelos Core AI (segmentados en cuatro partes para el decodificador mas cabeza temporal y codificador de audio); sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un alineador forzado, no un transcriptor: recibe audio mono a 16 kHz junto con la transcripción exacta y emite un intervalo (inicio y fin) por cada unidad textual. La arquitectura reutiliza el codificador de audio de Qwen3-ASR y un decodificador de texto de 0,6B parámetros; la cabeza de salida formula la predicción temporal como clasificación sobre 5000 clases discretas de 80 ms, y una única pasada del decodificador temporaliza toda la transcripción. Las predicciones que retroceden en el tiempo se reparan con el mecanismo del modelo original: se conserva la secuencia no decreciente más larga, se ajustan los valores atípicos aislados al vecino y se interpolan las secuencias más largas, por lo que una marca reparada puede caer entre clases.

La conversión parte de los pesos oficiales en bf16 y se obtiene trazando el grafo MLX de `mlx-speech` y reconstruyéndolo con Core AI, sin PyTorch. Se eligió fp16 tras medir los rangos de activación, que quedan holgadamente dentro de ese formato. Todas las capas se ejecutan en el Neural Engine. La paridad declarada es que las clases temporales coinciden con la pasada en float32 de `mlx-speech` en los clips de prueba, mientras que una pasada en bf16 desplaza algunos empates cercanos. No se detallan en la información disponible los datos de entrenamiento originales (número de tokens, composición del corpus, uso de RLHF o DPO).

## Capacidades

- Alineación forzada de audio con transcripción: devuelve inicio, fin y unidad textual por cada elemento de la transcripción.
- Temporalización a nivel de carácter en chino (cada carácter es una unidad) y a nivel de palabra en inglés.
- Normalización de unidades en inglés: solo se conservan letras, números y apóstrofos, de modo que `3.75%` se convierte en `375`; la puntuación no genera unidad y una pausa en una coma aparece como hueco entre vecinos.
- Manejo de audio mixto chino-inglés en una misma locución.
- Reparación de marcas temporales no monótonas mediante el algoritmo del modelo original.
- Ejecución íntegra en el Neural Engine de Apple Silicon, sin Python, PyTorch ni API en la nube durante la inferencia.
- Integración con el reconocedor Qwen3-ASR (versión ANE) para producir transcripciones temporizadas en dos pasos.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio más allá de la alineación descrita; la información disponible no menciona ninguna de estas capacidades.

## Casos de uso

- Subtitulado preciso de vídeo en chino e inglés: se transcribe primero con Qwen3-ASR y después se alinea el texto con este modelo para obtener marcas por carácter o palabra, adecuadas para subtítulos con resaltado tipo karaoke.
- Edición de audio basada en texto: al conocer el instante exacto de cada palabra, una aplicación de edición puede cortar, silenciar o reordenar fragmentos seleccionando texto en la transcripción.
- Búsqueda y navegación dentro de grabaciones: indexar reuniones o entrevistas por palabra permite saltar al punto exacto donde se pronunció un término, todo en local.
- Herramientas de aprendizaje de idiomas: resaltar en tiempo real la palabra que se está pronunciando en un audio de práctica, con la ventaja de que el modelo no consume GPU y puede convivir con otras tareas gráficas.
- Verificación de locuciones y doblaje: comparar una grabación con el guion previsto para detectar omisiones, ya que el modelo asigna un intervalo a cada unidad aunque no se haya pronunciado.
- Procesamiento por lotes en macOS: pipelines que alinean archivos de hasta ~75 s en chino o ~90 s en inglés por llamada, dividiendo los audios más largos, sin coste de API ni envío de datos a la nube.
- Aplicaciones de accesibilidad: sincronizar la lectura resaltada de un texto con su versión hablada en entornos donde la privacidad del audio es un requisito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara paridad cualitativa de las clases temporales con la pasada en float32 de `mlx-speech` en los clips de prueba del autor, sin cifras de precisión ni de latencia.

## Requisitos de hardware

- Hardware obligatorio: Mac con Apple Silicon; el modelo se ejecuta íntegramente en el Neural Engine.
- Sistema operativo: macOS 27 o posterior.
- VRAM: no aplica en el sentido de GPU; el modelo reside en memoria unificada del sistema. El repositorio ocupa 1,8 GB, lo que da una idea del orden de magnitud de los pesos en fp16.
- GPU: no se usa GPU durante la inferencia; queda libre para otras tareas.
- Opciones de despliegue: runtime Swift `ane-speech` (compilación con `swift build -c release`) y API de Python `ane_speech` dentro del checkout; no hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La primera carga compila el modelo para el Neural Engine del Mac y cachea el resultado, por lo que las cargas posteriores tardan una fracción de segundo.
- Límite de audio por llamada: aproximadamente 75 s en chino y 90 s en inglés, inferior a los 180 s del modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite de audio | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| appautomaton/qwen3-forced-aligner-0.6b-fp16-ane | 0,6B (decodificador) | ~75 s zh / ~90 s en por llamada | Apple Neural Engine, macOS 27+ | Apache 2.0 | Hugging Face (Core AI) |
| Qwen/Qwen3-ForcedAligner-0.6B (original) | 0,6B | 180 s por llamada | GPU/CPU convencional, pesos bf16 | Apache 2.0 | Hugging Face |
| appautomaton/qwen3-asr-1.7b-fp16-ane | 1,7B | no disponible | Apple Neural Engine | Apache 2.0 | Hugging Face (Core AI) |

El modelo original es la referencia directa: misma tarea y licencia, pero admite audios más largos y no está atado al Neural Engine. El reconocedor Qwen3-ASR de App Automaton es complementario, no alternativo: produce la transcripción que este alineador necesita. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas de precisión.

## Limitaciones y advertencias

- La transcripción debe coincidir con el audio: cada unidad recibe un intervalo aunque no se haya pronunciado, de modo que un guion incorrecto produce marcas engañosas.
- Solo chino e inglés, incluida la mezcla de ambos; no hay soporte de otras lenguas.
- Límite de audio por llamada (~75 s zh, ~90 s en) inferior al del modelo original (180 s) por el tamaño de caché de esta conversión; es necesario dividir audios largos.
- Marcas temporales en clases de 80 ms, con reparación que puede situar un valor entre clases; la resolución no es de milisegundos.
- Dependencia estricta de plataforma: Apple Silicon y macOS 27 o posterior; no es desplegable en Linux, Windows ni GPU NVIDIA.
- El repositorio no incluye checkpoint PyTorch ni safetensors, lo que dificulta la inspección, el reentrenamiento o la conversión a otros formatos.
- Riesgo de alucinación no evaluado en la información disponible; al ser una tarea de clasificación temporal y no de generación libre, el modo de fallo esperable es el desplazamiento de marcas, no la invención de texto.
- Sesgos: no documentados en la información disponible; al depender del modelo original de Qwen, hereda los sesgos de sus datos de entrenamiento, no detallados.
- Licencia Apache 2.0 permite uso comercial; el runtime `ane-speech` tiene licencia MIT independiente y debe respetarse por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/appautomaton/qwen3-forced-aligner-0.6b-fp16-ane
- Modelo original: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Codigo del modelo original (Qwen3-ASR): https://github.com/QwenLM/Qwen3-ASR
- Runtime Swift `ane-speech`: https://github.com/appautomaton/ane-speech
- Conversion MLX de referencia: https://github.com/appautomaton/mlx-speech
- Reconocedor Qwen3-ASR para ANE: https://huggingface.co/appautomaton/qwen3-asr-1.7b-fp16-ane
- Reconocedor Confucius4 r2t2 para ANE: https://huggingface.co/appautomaton/confucius4-r2t2-fp16-ane
- Proyecto App Automaton: https://appautomaton.com
- GitHub de App Automaton: https://github.com/appautomaton
- Perfil de Hugging Face de App Automaton: https://huggingface.co/appautomaton
