# jinhwan000/qwen3-tts-0.6b-base-ov

## Resumen

qwen3-tts-0.6b-base-ov es una exportación a OpenVINO IR del modelo de síntesis de voz Qwen/Qwen3-TTS-12Hz-0.6B-Base, publicada por el usuario jinhwan000. No es un modelo nuevo entrenado desde cero, sino una reempaquetado de los pesos originales de Qwen en formato intermedio de OpenVINO, dividido en varias piezas (talker, code predictor, frame head y decoder) para permitir batching continuo por rondas: múltiples peticiones de síntesis comparten una misma GPU y cada una avanza un frame de 80 ms por ronda. Está pensado, por tanto, para servir TTS en producción sobre hardware Intel, no para investigación del modelo base.

El modelo subyacente tiene 0,6 mil millones de parámetros, trabaja a 12 Hz (un frame cada 80 ms) y soporta clonación de voz mediante un encoder de hablante que produce un x-vector de 1024 dimensiones. Cubre diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano. La licencia es Apache-2.0, heredada del modelo upstream.

Su relevancia práctica está en la validación que acompaña la exportación: paridad numérica frente a la referencia fp32 oficial, medidas de latencia por ronda con 1, 32 y 64 peticiones concurrentes sobre una Intel Arc B580, y una receta de conversión reproducible (PagedAttention con `sliding_window` = 72, buckets estáticos y precisión f16 con KV en f16). Es, en la práctica, una pieza de infraestructura para desplegar TTS concurrente en GPUs Intel.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS neuronal basada en transformer: talker (28 capas, hidden 1024, atención 16 × 128 = 2048, 8 cabezas KV), code predictor, frame head y decoder de voz; exportada como grafo OpenVINO IR dividido en piezas |
| Parámetros totales | 0,6 B (según la denominación del modelo base Qwen3-TTS-12Hz-0.6B-Base) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no es un modelo de contexto textual. La conversión usa `sliding_window` = 72 para PagedAttention en `talker.xml` y `dec_transformer.xml` |
| Tipos de cuantización | f32 y f16 en IR de OpenVINO; KV cache en f16 en la validación con Arc B580; `ACTIVATIONS_SCALE_FACTOR=8` en el frame head |
| Idiomas soportados | zh, en, ja, ko, de, fr, ru, pt, es, it (diez idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` / `.bin`) para las piezas del grafo; safetensors (`model.safetensors`, `decoder_host.safetensors`); ficheros de tokenizador (`vocab.json`, `merges.txt`, `tokenizer_config.json`) y `speech_tokenizer/config.json` |

## Arquitectura y entrenamiento

La exportación reproduce la arquitectura del Qwen3-TTS-12Hz-0.6B-Base: un «talker» con 28 capas, dimensión oculta 1024 y atención de 16 cabezas de 128 dimensiones (2048 en total) con 8 cabezas KV, acompañado de un code predictor que genera los tokens de código de voz. La salida pasa por un frame head y por un decoder de voz (`dec_transformer`, `dec_back`, `decoder_host.safetensors`) que reconstruye la forma de onda a partir de frames de 80 ms, es decir, 12 frames por segundo. El encoder de hablante incluido en `model.safetensors` produce un x-vector de 1024 dimensiones que condiciona la síntesis para la clonación de voz. `text_proj.xml` proyecta de [t, 2048] a [t, 1024], coherente con la anchura de atención del talker.

La pieza diferencial de esta ficha no es el entrenamiento, sino la compartimentación para inferencia concurrente: `talker.xml` y `dec_transformer.xml` se convierten a PagedAttention con ventana deslizante de 72, mientras que `frame_head.xml` y `dec_back.xml` usan buckets estáticos. El repositorio IR cubre solo las partes del modelo; es necesario descargar además del repositorio original `model.safetensors`, `config.json`, `generation_config.json`, `vocab.json`, `merges.txt`, `tokenizer_config.json` y `speech_tokenizer/config.json`. No se han publicado datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni sobre etapas de RLHF o DPO en la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Clonación de voz mediante un encoder de hablante que genera un x-vector de 1024 dimensiones a partir de audio de referencia.
- Generación de audio por frames de 80 ms (12 Hz), lo que permite avanzar la síntesis de forma incremental ronda a ronda.
- Batching continuo por rondas: varias peticiones de síntesis comparten una misma GPU y cada una avanza un frame por ronda, con intercalado entre peticiones.
- Soporte de atención paginada (PagedAttention) con ventana deslizante de 72 en el talker y el decoder transformer.
- Ejecución en CPU (f32) y en GPU Intel Arc (f16) mediante OpenVINO.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo «thinking»: es un modelo especializado en TTS.

## Casos de uso

- Servicio de TTS multiinquilino: con batching continuo y un límite validado de 64 peticiones concurrentes en una Arc B580, se puede atender a decenas de usuarios simultáneos con una sola GPU Intel, manteniendo RTF de 0,82 en el peor caso medido.
- Lectura de artículos y contenidos largos: el modelo sintetiza texto por frames de 80 ms y puede trocear documentos en fragmentos, encadenando peticiones sobre el mismo servicio para generar audiolibros o versiones en audio de notas de prensa.
- Clonación de voz para asistentes de marca: usando el encoder de hablante y un x-vector de 1024 dimensiones, se puede fijar la voz de un locutor corporativo y reutilizarla en todas las locuciones sin reentrenar.
- Doblaje y localización de vídeo: al soportar diez idiomas, un mismo pipeline puede generar pistas de voz en español, inglés, francés o alemán a partir del mismo guion, con un coste por petición bajo gracias al batching.
- Atención al cliente con respuesta hablada: integrado detrás de un orquestador de diálogo, el modelo convierte las respuestas del sistema en audio; la latencia de primer frame medida (49 ms con una petición, 122 ms con 64) es compatible con interacciones conversacionales.
- Accesibilidad y lectura de pantalla: generación de voz bajo demanda para aplicaciones que leen notificaciones, correos o interfaces, con despliegue en servidores con CPU (f32) cuando no hay GPU Intel disponible.
- Pruebas de integración continua de pipelines de audio: al estar dividido en piezas con paridad numérica verificable frente a la referencia fp32, sirve como componente reproducible en tests de regresión de sistemas TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible, algo esperable al tratarse de un modelo de síntesis de voz. Sí se incluyen métricas de validación frente a la referencia fp32 oficial y medidas de serving en Arc B580 con OpenVINO 2026.4.1.

Paridad con entrada forzada frente a la referencia fp32 oficial (4 casos en coreano, 54-108 frames, decodificación greedy):

| Dispositivo | Hidden del talker (RMS relativo) | Códigos greedy vs referencia (c0 · code predictor) | SNR de decodificación vs decoder oficial |
|---|---|---|---|
| CPU f32 | 1,2e-6 | 100 % · 100 % | 110,5-112,8 dB |
| Arc B580 f16 | 1,7-2,2e-3 | 99,1-100 % · 98,0-99,1 % | 51,7-53,2 dB |

Síntesis con batching por rondas en Arc B580 (todas las peticiones sintetizando sin parar, 10 s por punto):

| Peticiones activas | Mediana · p95 por ronda | Rondas > 80 ms | RTF por utterance (mediana) | Primer frame de audio (mediana) |
|---|---|---|---|---|
| 1 | 24,4 · 29,4 ms | 0 % | 0,32 | 49 ms |
| 32 | 48,7 · 58,8 ms | 0 % | 0,59 | 94 ms |
| 64 | 64,5 · 72,7 ms | 0 % | 0,82 | 122 ms |

Con 64 peticiones, el desglose por ronda es de 21,0 ms para el talker, 22,5 ms para el frame head y 19,9 ms para el decoder. El RTF se define como tiempo de generación dividido entre la duración del audio. Solo se validó en coreano; las piezas son independientes del idioma.

## Requisitos de hardware

- VRAM estimada: no publicada. El repositorio ocupa 2,9 GB, lo que da una referencia del espacio necesario para los pesos, pero no se detalla el consumo total en inferencia (activaciones, KV cache y buffers de OpenVINO).
- GPU validadas: Intel Arc B580 con OpenVINO 2026.4.1 en f16. No se han validado otras GPU en la información disponible.
- CPU: validada en f32 con OpenVINO, con paridad prácticamente exacta frente a la referencia (1,2e-6 de RMS relativo en el hidden del talker).
- Capacidad concurrente: 64 peticiones simultáneas es el límite de tiempo real que el autor utiliza en la B580 para este modelo, con 0 % de rondas por encima de 80 ms.
- Opciones de despliegue: runtime de OpenVINO con las piezas IR (`talker.xml`, `text_proj.xml`, `frame_head.xml`, `dec_transformer.xml`, `dec_back.xml`, `decoder_host.safetensors`) y PagedAttention configurada con `sliding_window` = 72. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: primer frame de 49 ms con una petición y 122 ms con 64; RTF mediano de 0,32, 0,59 y 0,82 con 1, 32 y 64 peticiones respectivamente.
- No hay datos publicados sobre consumo de VRAM en consumer GPU distintas de la Arc B580 ni sobre su comportamiento en GPUs NVIDIA o AMD.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| jinhwan000/qwen3-tts-0.6b-base-ov (esta ficha) | 0,6 B | No disponible (TTS, ventana deslizante 72) | 10 | Apache-2.0 | Exportación OpenVINO con batching continuo; validada en Arc B580; reporta corte de sílaba final en 5-6 de 8 utterances en coreano |
| jinhwan000/qwen3-tts-1.7b-base-ov | 1,7 B | No disponible (TTS) | No disponible en la información | Apache-2.0 (según modelo upstream) | Misma receta de conversión; hidden del talker distinto y encoder de hablante de otra dimensión; según el autor, no muestra el corte de sílaba final en la misma medida |
| jinhwan000/qwen3-tts-0.6b-customvoice-ov | 0,6 B | No disponible (TTS) | No disponible en la información | Apache-2.0 (según modelo upstream) | Variante CustomVoice; según el autor, no muestra el corte de sílaba final |

No se dispone de datos de benchmarks comparativos entre estos tres modelos ni frente a alternativas de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Corte de sílaba final: en las pruebas del autor, el modelo termina a menudo la locución en mitad de la última sílaba (el talker emite EOS antes de tiempo). Ocurre en 5-6 de cada 8 utterances en coreano y también en el 22 % de las salidas de referencia fp32 oficiales, por lo que es comportamiento del modelo, no de la exportación. El 1.7B Base y el 0.6B CustomVoice no lo muestran en la misma medida.
- Validación limitada: la paridad numérica y las pruebas de batching se hicieron solo con coreano (4 casos, 54-108 frames). Las piezas son independientes del idioma, pero no hay evidencia publicada del comportamiento en los otros nueve idiomas.
- Dependencia del repositorio original: el IR no es autosuficiente; requiere `model.safetensors`, `config.json`, `generation_config.json`, `vocab.json`, `merges.txt`, `tokenizer_config.json` y `speech_tokenizer/config.json` del modelo Qwen original.
- Requisitos de carga específicos: es obligatorio convertir `talker.xml` y `dec_transformer.xml` a PagedAttention con `sliding_window` = 72 y usar buckets estáticos para `frame_head.xml` y `dec_back.xml`; una carga distinta puede invalidar las métricas de paridad y latencia.
- Licencia: Apache-2.0 permite uso comercial, pero se hereda del modelo upstream y conviene verificar las condiciones del repositorio Qwen original antes de desplegar.
- Clonación de voz: no se documentan salvaguardas, filtros de consentimiento ni marcas de agua en la información disponible; su uso en producción implica riesgos de suplantación de identidad y obligaciones legales sobre derechos de voz.
- Sesgos: no se han publicado análisis de sesgos por idioma, acento o género en la información disponible.
- Alucinación: no aplica en el sentido textual, pero el modelo puede generar prosodia o duraciones no solicitadas; no hay métricas de fidelidad de contenido publicadas.
- Solo se ha validado con OpenVINO 2026.4.1 y Arc B580; el rendimiento en otras versiones del runtime o en otras GPU Intel no está documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jinhwan000/qwen3-tts-0.6b-base-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Exportación hermana de 1,7 B: https://huggingface.co/jinhwan000/qwen3-tts-1.7b-base-ov
- Variante CustomVoice de 0,6 B: https://huggingface.co/jinhwan000/qwen3-tts-0.6b-customvoice-ov
