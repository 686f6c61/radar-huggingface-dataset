# HeartMuLa/HeartCodec-oss-encoder

## Resumen

HeartCodec-oss-encoder es el componente de codificación de audio del sistema HeartCodec, publicado por el equipo HeartMuLa. No es un modelo generativo de texto ni un LLM: es un codificador neuronal que transforma forma de onda de audio en representaciones discretas (tokens) aptas para su uso en pipelines de generación y edición musical. Concretamente, convierte audio en ocho flujos de tokens a 12,5 Hz, que el decodificador emparejado reconstruye posteriormente como audio estéreo a 48 kHz.

El repositorio contiene exclusivamente los pesos del codificador (1.006 tensores, aproximadamente 2,15 GB en safetensors). El cuantizador RVQ compartido y el decodificador de audio residen en el checkpoint complementario HeartCodec-oss-20260123, por lo que este modelo solo resulta funcional en combinación con él. La separación permite reutilizar el codificador de forma independiente para tareas de tokenización y análisis, o sustituir el decodificador sin redistribuir los pesos del codificador.

Es relevante para investigadores en música y audio que necesiten un tokenizador de alta fidelidad con licencia Apache-2.0, sin restricciones de uso comercial, y que quieran integrarlo en pipelines propios de compresión, análisis o generación musical. El proyecto se acompaña de la librería heartlib y de una plataforma comercial (heartmula.com) para generación de canciones, covers y edición por pasajes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador neuronal de audio con cuantizador RVQ (residual vector quantization) compartido; detalles de capas no disponibles |
| Parametros totales | no disponible (pesos del codificador: 1.006 tensores, ~2,15 GB en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; validado con una entrada estéreo de 239,293 s) |
| Tipos de cuantizacion | no disponible (validación publicada en FP32) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`encoder.safetensors`) + JSON de configuración |

## Arquitectura y entrenamiento

La información disponible describe un codificador de audio que produce ocho flujos de tokens discretos a una tasa de 12,5 Hz, es decir, 100 tokens por segundo de audio y por flujo. Estos tokens se generan mediante un cuantizador RVQ (residual vector quantization) que, según la model card, pertenece al checkpoint del decodificador emparejado y es compartido entre ambos componentes. El decodificador reconstruye la señal a 48 kHz en estéreo. No se especifican en la información proporcionada el número de capas, la dimensión oculta, el tipo de bloques (convolucionales, transformer o híbridos), ni el volumen y composición del dataset de entrenamiento.

El proceso de exportación está documentado con detalle: los bytes de los tensores del codificador coinciden con el checkpoint original y los 818 tensores del decodificador emparejado coinciden numéricamente con el original, salvo ocho indicadores de inicialización del RVQ que difieren solo en la forma almacenada (escalar frente a `[1]`). El cargador de checkpoints divididos verifica estrictamente la correspondencia entre pesos de codificador y decodificador, y no admite mezclar cuantizadores entrenados de forma independiente. No se documentan fases de RLHF, DPO ni ajuste por preferencias, algo esperable en un componente de tokenización y no en un modelo de lenguaje.

## Capacidades

- Tokenización de audio: convierte forma de onda (float32, mono o estéreo, con frecuencia de muestreo arbitraria declarada por el usuario) en tokens discretos con forma `[8, T]` a 12,5 Hz.
- Reconstrucción de audio: en combinación con el decodificador emparejado, genera audio estéreo a 48 kHz con duración recortada a la del input.
- Decodificación con pasos configurables: el método `detokenize` acepta `num_steps` (10 en la validación publicada) y `guidance_scale` (1,25 en la validación), lo que sugiere un decodificador de tipo difusión o flow matching.
- Procesamiento por lotes: el método `tokenize` acepta un parámetro `batch_size`.
- Salida directa a MP3 a 320 kbps desde float32, sin WAV PCM intermedio; también admite salida WAV.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión, audio-texto ni transcripción.

## Casos de uso

- Compresión y representación discreta de audio musical: el codificador reduce una pista estéreo de 239 s a una matriz de tokens de forma `[8, 2992]`, lo que facilita almacenar, indexar y transmitir música en un espacio discreto de baja tasa (100 tokens/s por flujo).
- Investigación en generación musical condicionada por tokens: al disponer de un tokenizador Apache-2.0, un equipo puede entrenar su propio modelo autorregresivo o de difusión sobre la representación tokenizada y reutilizar el decodificador publicado para la síntesis final.
- Edición musical por pasajes: la tokenización temporal uniforme a 12,5 Hz permite localizar y modificar segmentos concretos de una canción (el caso que promociona MuLa Studio), sustituyendo tokens en la ventana correspondiente y decodificando de nuevo.
- Creación de covers y remezclas: extraer los tokens de una pista de referencia y regenerar variaciones vocales o instrumentales manteniendo la estructura temporal original, dado que la rejilla de tokens preserva la duración.
- Evaluación de fidelidad de códecs neuronales: usar el par codificador-decodificador como línea base reproducible (semilla 42, 10 pasos, guidance 1,25) para comparar métricas de reconstrucción frente a otros códecs neuronales.
- Análisis y etiquetado automático de catálogos musicales: los tokens sirven como features discretas para modelos de clasificación de género, detección de secciones o búsqueda por similitud, sin necesidad de exponer el audio original.
- Prototipado en investigación académica: la licencia Apache-2.0 permite publicar derivados y resultados sin las restricciones de licencias no comerciales habituales en códecs de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única medición objetiva aportada es de validación funcional, no de calidad: en una NVIDIA B300, con FP32, batch size 1, semilla 42, 10 pasos de decodificación y guidance scale 1,25, se completó un round trip de audio estéreo de 239,293 s con tokens de forma `[8, 2992]`. La salida fue finita, no silenciosa, a 48 kHz estéreo y con duración coincidente con la entrada. La memoria pico asignada por PyTorch fue de aproximadamente 12,65 GiB, y la reservada, de aproximadamente 15,41 GiB. El autor advierte explícitamente que son mediciones de una única entrada y configuración, no requisitos mínimos de memoria ni un benchmark de calidad de audio.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12,65 GiB asignados y 15,41 GiB reservados en FP32 para una entrada de 239 s, según la validación del autor en una B300. Para entradas más cortas la demanda debería reducirse, pero no se publican cifras.
- GPU recomendadas: NVIDIA B300 (única validada explícitamente). Por el perfil de memoria, se requiere una GPU con al menos 16 GB de VRAM para reproducir esa configuración; no se confirma compatibilidad con otras.
- GPU de consumo: no confirmado. Una RTX 4090 (24 GB) podría alojar la configuración validada en términos de memoria, pero no hay pruebas publicadas; tarjetas de 8-12 GB no están validadas.
- Despliegue: la vía documentada es la librería `heartlib` (instalación con `pip install -e .`), Python 3.10, PyTorch con CUDA y `ffmpeg` para salida MP3. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un códec de audio.
- Latencia y throughput: no disponibles. Solo se conoce que el round trip completo de 239 s se ejecutó con 10 pasos de decodificación, sin cifras de tiempo.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros códecs neuronales de audio (parámetros, contexto, benchmarks, licencia) que permitan una comparación rigurosa. Se indica, por tanto, "no disponible". Como referencia estructural, el propio ecosistema HeartMuLa ofrece el checkpoint complementario HeartCodec-oss-20260123, que no es un competidor sino la otra mitad del sistema:

| Modelo | Rol | Pesos | Licencia | Dependencia |
|---|---|---|---|---|
| HeartCodec-oss-encoder | Codificador (audio a tokens) | 1.006 tensores, ~2,15 GB | Apache-2.0 | Requiere el decodificador emparejado |
| HeartCodec-oss-20260123 | Decodificador + cuantizador RVQ | 818 tensores | Apache-2.0 (según checkpoint origen) | Requiere el codificador |

## Limitaciones y advertencias

- No es un modelo autónomo: sin el checkpoint HeartCodec-oss-20260123 no puede reconstruir audio, y el cuantizador RVQ no se incluye aquí.
- El cargador rechaza mezclar cuantizadores entrenados por separado; no es posible combinar este codificador con decodificadores de terceros sin adaptación.
- No debe pasarse a `HeartCodec.from_pretrained()`; la API correcta es `from_encoder_decoder_pretrained` con ambos repositorios.
- Las cifras de memoria publicadas corresponden a una sola entrada de 239 s en FP32; entradas mucho más largas pueden exceder la VRAM disponible y no se documenta estrategia de troceado.
- No hay benchmarks de calidad de audio (PESQ, ViSQOL, FAD ni similares), por lo que no puede evaluarse la fidelidad de reconstrucción frente a alternativas.
- No se documentan sesgos, pero al ser un modelo entrenado sobre audio musical, puede reproducir sesgos de representación del dataset de entrenamiento, cuya composición no se detalla.
- Riesgo de artefactos en la reconstrucción: la decodificación es aproximada (10 pasos, guidance 1,25 en la validación) y no se garantiza reconstrucción bit a bit del audio original.
- La licencia Apache-2.0 permite uso comercial, pero el autor remite a la licencia del checkpoint de origen y exige usar audio autorizado en los ejemplos; la responsabilidad sobre derechos musicales recae en el usuario.
- Idiomas no aplicables, pero la cobertura de géneros y tipos de audio no está documentada.
- Proyecto con pocas descargas (333) y 7 likes en el momento de la consulta: ecosistema pequeño, menor probabilidad de soporte comunitario y de corrección de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeartMuLa/HeartCodec-oss-encoder
- Decodificador emparejado: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Repositorio de código (heartlib): https://github.com/HeartMuLa/heartlib
- Plataforma y demo: https://heartmula.com
