# bjnortier/coreai-ht5-nemotron-3-diarization-float16-split

## Resumen
Este repositorio no contiene un modelo entrenado desde cero, sino una exportación del modelo de diarización de hablantes Nemotron-3-Diarization de NVIDIA al formato Core AI de Apple. El autor, bjnortier, publica los pesos serializados como grafos de pasos (`.aimodel`) listos para ejecutarse con el runtime Core AI en macOS 27 / iOS 27 y posteriores, sobre silicio de Apple. El objetivo es la diarización de hablantes en local, es decir, determinar quién habla en cada momento de una señal de audio, con hasta 8 hablantes simultáneos y sin enviar el audio a un servidor.

El paquete se distribuye como un único archivo ZIP de aproximadamente 619 MB que se descomprime en un bundle con un grafo por modo de latencia (offline, low latency, very low latency y ultra low latency), un descriptor `metadata.json`, embeddings de silencio en float32 que inicializan la caché de hablantes y tensores de referencia para verificar la paridad de una implementación del runtime. La configuración declarada incluye precisión float16, 128 bins mel, subsampling 8x, hidden size 512 y entrada de audio de 16 kHz mono en float32.

Su relevancia es acotada pero clara: es una vía para llevar un modelo de diarización de NVIDIA a aplicaciones nativas de Apple sin reentrenar ni convertir manualmente, manteniendo la licencia OpenMDW 1.1 del modelo original. No es un modelo de propósito general: no genera texto, no razona y no sustituye a un ASR; solo etiqueta hablantes. La información pública disponible no incluye parámetros totales, datos de entrenamiento ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Exportación a grafos de pasos de Apple Core AI de un modelo de diarización de hablantes (Nemotron-3-Diarization de NVIDIA); la arquitectura interna del modelo original no se detalla en la información disponible. Configuración declarada: hidden size 512, 128 bins mel, subsampling 8x |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE en la información disponible) |
| Longitud de contexto | no disponible; el modelo consume audio a 16 kHz mono float32 y ofrece modo offline (archivo completo) y tres modos de streaming con distinta latencia |
| Tipos de cuantizacion | float16 (única precisión publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (heredada del modelo base `nvidia/Nemotron-3-Diarization`) |
| Formato de pesos | `.aimodel` (Apple Core AI), empaquetados en `ht5-nemotron-3-diarization_float16_split.zip` (~619 MB); no es PyTorch, no es GGUF y no carga con NeMo |
| Tamano del repositorio | 0.6 GB |
| Hablantes maximos | 8 |
| Entrada de audio | 16 kHz, mono, float32 |
| Modos de latencia | offline, low latency, very low latency, ultra low latency (un grafo por modo, carga selectiva) |
| Runtime requerido | Apple Core AI en macOS 27 / iOS 27 o posterior, sobre silicio de Apple |
| Artefactos auxiliares | `metadata.json`, `silence_embeds.f32`, `fixtures/` (tensores de referencia para paridad) |

## Arquitectura y entrenamiento
La información disponible no describe la arquitectura interna del modelo original más allá de los parámetros de configuración del export: hidden size 512, 128 bins mel, factor de subsampling 8x y precisión float16. Se trata de un modelo de diarización de hablantes, no de un modelo generativo de texto, por lo que no hay datos publicados sobre número de tokens de entrenamiento, composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. Toda la documentación de entrenamiento y evaluación remite a la model card de `nvidia/Nemotron-3-Diarization`.

La innovación de este repositorio es exclusivamente de serialización y despliegue. El export "split" separa el grafo en un asset por modo de latencia (`modes.<mode>.asset` en `metadata.json`), de modo que el runtime carga solo los modos que utiliza y reduce el consumo de memoria en dispositivos móviles. Además, `silence_embeds.f32` inicializa la caché de hablantes con embeddings de silencio y el directorio `fixtures/` proporciona tensores de referencia para comprobar que una implementación del runtime reproduce fielmente las salidas del modelo fuente.

## Capacidades
- Diarización de hablantes con hasta 8 hablantes identificados en una misma señal de audio.
- Procesamiento offline de archivos completos mediante `step_offline.aimodel`.
- Procesamiento en streaming con tres niveles de latencia (`low`, `very_low`, `ultra_low`), adecuados para captura en vivo.
- Ejecución íntegra en el dispositivo sobre silicio de Apple, sin llamadas a red.
- Caché de hablantes persistente inicializada con embeddings de silencio, pensada para mantener la identidad de los hablantes entre segmentos.
- Verificación de paridad numérica mediante los tensores de `fixtures/`.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión, audio comprensivo ni capacidades multilingües de texto: es un componente especializado de diarización.

## Casos de uso
- Transcripción de reuniones en local: se ejecuta el modo offline sobre la grabación completa y se fusionan las etiquetas de hablante con la salida de un ASR, de forma que la app en macOS muestre "Interlocutor 1 / Interlocutor 2" sin subir el audio a la nube.
- Subtitulado en directo en iOS: usando el grafo `ultra_low_latency`, la app puede etiquetar al hablante mientras captura micrófono y asociar cada frase transcrita a su interlocutor con un retardo mínimo.
- Notas de voz con separación de interlocutores: una app de grabación puede dividir una entrevista en segmentos por hablante y generar resúmenes por persona, todo con el bundle de 619 MB incluido en la aplicación.
- Entornos con requisitos de privacidad (sanidad, legal, RRHH): al no requerir conectividad, la diarización de conversaciones sensibles se realiza en el propio dispositivo, lo que simplifica el cumplimiento de normativa de protección de datos.
- Análisis de calidad de llamadas en macOS: procesar por lotes grabaciones de soporte con el modo offline y calcular métricas de habla por agente y cliente (tiempo de habla, turnos, solapamientos) para herramientas de QA internas.
- Postproducción de pódcasts y entrevistas: preetiquetar pistas por hablante antes de la edición manual, reduciendo el trabajo de marcar cortes en grabaciones de hasta 8 participantes.
- Kioscos y dispositivos empotrados Apple: integrar la diarización en una app de mostrador o terminal para atribuir turnos de palabra sin depender de un backend.
- Validación de pipelines: usar `fixtures/` para comprobar que el runtime Core AI de una build concreta produce tensores equivalentes a los de referencia antes de publicar una actualización.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio remite explícitamente a la model card de `nvidia/Nemotron-3-Diarization` para los resultados de evaluación, y no se incluye ninguna métrica de DER (diarization error rate), latencia en milisegundos ni throughput en este repositorio. Las búsquedas web realizadas no devolvieron documentación técnica del modelo: los resultados obtenidos eran recetas de cocina sin relación con el repositorio, por lo que no se han podido incorporar datos adicionales.

## Requisitos de hardware
- Plataforma obligatoria: silicio de Apple con macOS 27 / iOS 27 o posterior y runtime Apple Core AI; no hay soporte para CUDA, ROCm ni CPU x86.
- Huella en disco: repositorio de 0.6 GB; el archivo `ht5-nemotron-3-diarization_float16_split.zip` ocupa aproximadamente 619 MB y debe descomprimirse antes de su uso.
- Memoria: no hay cifra oficial publicada. Como referencia de orden de magnitud, los pesos en float16 del bundle ocupan del orden de 619 MB, a los que hay que sumar el overhead del runtime y los buffers de audio; el modo "split" permite cargar únicamente el grafo de latencia necesario para reducir ese consumo.
- GPU dedicadas (A100, H100, RTX 4090): no aplican; el artefacto no se ejecuta fuera del runtime Core AI.
- Opciones de despliegue: únicamente Apple Core AI. No es compatible con vLLM, llama.cpp, Ollama, TGI ni con el toolkit NeMo, tal como advierte la model card.
- Latencia y throughput: no disponibles en cifras. El repositorio solo declara cuatro modos cualitativos (offline, low, very low, ultra low latency), sin milisegundos ni factores de tiempo real.
- Integración: el consumo previsto es mediante la app Hello Transcribe 5.1 y posteriores, que fija la descarga a un commit concreto del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bjnortier/coreai-ht5-nemotron-3-diarization-float16-split` | no disponible | no disponible; audio 16 kHz mono, hasta 8 hablantes, modos offline y streaming | `.aimodel` (Core AI), float16 | OpenMDW 1.1 | HuggingFace, repo de 0.6 GB, 0 descargas y 0 likes en el momento de la consulta |
| `nvidia/Nemotron-3-Diarization` (modelo base) | no disponible en la información proporcionada | no disponible en la información proporcionada | pesos del modelo original (no especificado aquí) | OpenMDW 1.1 | HuggingFace, mantenido por NVIDIA |
| `pyannote/speaker-diarization-3.1` | no disponible en la información proporcionada | no disponible en la información proporcionada | PyTorch | no disponible en la información proporcionada | HuggingFace; requiere aceptar condiciones de acceso |

La comparación relevante es frente al modelo base: este repositorio no modifica el modelo, solo su serialización, y por tanto hereda su comportamiento y su licencia. Frente a alternativas como pyannote, la diferencia práctica es el runtime: aquí no hay pesos PyTorch ni pipeline de Python, solo grafos para Core AI, lo que limita el despliegue a Apple y elimina la posibilidad de reutilizar tooling estándar de diarización.

## Limitaciones y advertencias
- No es un modelo de propósito general: solo produce etiquetas de hablante; requiere un ASR u otro componente para obtener transcripción.
- Techo de 8 hablantes; no se documenta el comportamiento con más interlocutores ni con solapamientos severos.
- No hay métricas publicadas de DER ni de latencia, por lo que el rendimiento real debe medirse en el dispositivo objetivo antes de asumir cifras.
- Dependencia fuerte de plataforma: exige macOS 27 / iOS 27 o posterior y silicio de Apple; no se puede ejecutar en Linux, Windows ni servidores con GPU NVIDIA.
- Los archivos no son pesos PyTorch y no cargan con NeMo; cualquier flujo de trabajo basado en ese toolkit queda descartado.
- No se especifican idiomas soportados ni sesgos conocidos; la model card remite al modelo original, que no se ha podido consultar en esta búsqueda.
- Licencia OpenMDW 1.1: es una licencia distinta de Apache 2.0 o MIT y debe revisarse antes de un uso comercial o de redistribución; el campo `license` del repositorio aparece como `other`.
- El repositorio está fijado por commit para Hello Transcribe 5.1; no hay garantía de actualizaciones ni de soporte por parte del autor (0 descargas y 0 likes en la fecha de consulta).
- Riesgo de deriva entre versiones del runtime Core AI: la propia model card incluye `fixtures/` precisamente porque la paridad numérica debe comprobarse en cada build.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/bjnortier/coreai-ht5-nemotron-3-diarization-float16-split
- Modelo base en HuggingFace: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Licencia OpenMDW 1.1 (referenciada desde la model card del modelo base): https://huggingface.co/nvidia/Nemotron-3-Diarization
- Apple Developer (runtime Core AI): https://developer.apple.com
- Nota: las búsquedas web realizadas no devolvieron papers, blogs ni repositorios relacionados con este modelo; los resultados obtenidos no eran relevantes, por lo que no se añaden enlaces adicionales.
