# aevionlabs/Drama-3-GGUF

## Resumen

Drama 3 GGUF es una conversión cuantizada del modelo de síntesis de voz (text-to-speech) Drama 3 de Fish Audio, publicada por el usuario aevionlabs (con referencias cruzadas al repositorio Jmica/Drama-3-GGUF) para su uso con el runtime audio.cpp. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) orientado a TTS con capacidades de clonación de voz, empaquetado en formato GGUF con cuantización mixta por componentes: los bancos de expertos enrutados se almacenan en Q2_K, Q3_K o Q4_K, mientras que routers, embeddings y cabecera de salida se mantienen en Q8_0, FP32 o BF16 según el perfil elegido.

El modelo resuelve el problema de desplegar un TTS de alta calidad con clonación de voz en hardware con recursos limitados, ofreciendo seis perfiles de precisión que van desde 15,88 GiB hasta 23,87 GiB. Incluye soporte de inferencia en streaming, contexto configurable (hasta 8192 tokens en los ejemplos de la model card) y offload de capas de expertos a CPU, lo que permite ajustar el consumo de VRAM frente a la latencia.

Es relevante ahora porque la versión V2 (revisión por defecto) actualiza al checkpoint de Fish Audio del 29 de octubre de 2026 (`78e5ab7`), sustituyendo la V1 original del 13 de octubre de 2026 (`dd64a85`), que sigue preservada en la revisión `original-2026-10-13`. El repositorio tiene 135,7 GB de tamaño total (suma de todos los perfiles y recursos), aunque cada archivo individual pesa entre 15,88 y 23,87 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) para text-to-speech, con audio tower y codec de forma de onda; arquitectura GGUF `audiocpp` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE con 120 bancos de proyección de expertos enrutados y 40 routers más 40 gates de expertos compartidos) |
| Longitud de contexto | hasta 8192 tokens (configurable vía `fish_drama3.context_length`) |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_K en expertos enrutados; Q8_0, Q4_K, Q4_0, FP32 y BF16 en routers, gates, embeddings y cabecera de salida; FP16 en audio tower y codec; FP32 en normalizaciones del backbone y audio tower |
| Idiomas soportados | no disponible |
| Licencia | fish-audio-community-license-v1.0 (licencia "other") |
| Formato de pesos | GGUF (perfiles de cuantización mixta) |

## Arquitectura y entrenamiento

El modelo base `fishaudio/drama-3` es un TTS con arquitectura Mixture-of-Experts: el backbone contiene 120 bancos de proyección de expertos enrutados y 40 routers más 40 gates de expertos compartidos. La pila incluye además un "audio tower" que procesa la señal acústica y un codec de forma de onda que genera la salida de audio final. La model card de esta conversión no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO; esos datos corresponden al modelo original de Fish Audio y no se incluyen en la información proporcionada.

La innovación técnica de esta publicación no está en el entrenamiento sino en el empaquetado: se aplica cuantización mixta por componentes en lugar de un preset genérico. Los expertos enrutados usan almacenamiento uniforme Q2_K, Q3_K o Q4_K (sin promoción heurística a mayor precisión), mientras que routers y gates se mantienen en Q8_0 o se restauran en FP32 desde sus valores BF16 originales; los perfiles de mayor fidelidad restauran también el embedding y la cabecera de salida completa de 252.288 filas en BF16. Las matrices del audio tower y los pesos del codec permanecen en FP16, y las normalizaciones en FP32 (o FP16 en el codec). Los seis archivos pasaron comprobaciones estructurales de número de tensores, tipos de almacenamiento por componente, bancos de expertos, cabecera de salida completa y privacidad de metadatos; en las variantes con routers FP32 se comparó byte a byte cada tensor retenido con el checkpoint original.

## Capacidades

- Síntesis de voz (text-to-speech) de alta calidad a partir de texto.
- Clonación de voz: la model card incluye la etiqueta `voice-cloning` y el runtime acepta historial de referencia.
- Inferencia en streaming (`--mode streaming`), adecuada para aplicaciones de voz en tiempo real.
- Contexto configurable hasta 8192 tokens, útil para referencias de voz largas o guiones extensos.
- Segmentación de texto configurable (`text_chunk_size`, 128 en el ejemplo) para procesar entradas largas por fragmentos.
- Control de muestreo mediante `top_k` (4097 en el ejemplo), `top_p` (0.9) y `temperature` (1.0), además de semilla (`--seed`) para reproducibilidad.
- Offload de capas de expertos a CPU (`fish_drama3.cpu_expert_layers`, 40 en la configuración conservadora de validación) para reducir la VRAM necesaria.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de entrada (ASR) ni modo de razonamiento (thinking mode).

## Casos de uso

- Clonación de voz para audiolibros y narración: el modelo permite generar narración con una voz de referencia concreta, y el contexto de hasta 8192 tokens facilita mantener consistencia en pasajes largos sin reiniciar la sesión.
- Atención al cliente con voz sintética: el modo streaming permite empezar a reproducir audio antes de completar la generación, reduciendo la latencia percibida en respuestas de IVR o asistentes telefónicos.
- Doblaje y localización de contenido: con perfiles de cuantización desde 15,88 GiB, se puede desplegar en una estación de trabajo con una sola GPU consumer de gama alta y generar pistas de voz para vídeo.
- Generación de voces para videojuegos y NPC: el control de semilla y muestreo permite reproducir variaciones controladas de una misma voz, y el offload a CPU permite ejecutar en equipos sin GPU de datacenter.
- Prototipado de asistentes conversacionales: la API de línea de comandos de audio.cpp (`--task tts --family fish_drama3`) permite integrar el modelo en pipelines de prueba con salida WAV directa.
- Investigación en TTS y cuantización: los seis perfiles de precisión (Q2_K, Q3_K, Q4_K con distintos overrides) permiten estudiar el impacto de la cuantización de expertos frente a routers y cabecera en la calidad del audio generado.
- Accesibilidad: generación de voz para lectores de pantalla o contenido educativo con voces personalizadas, ejecutable en hardware local gracias al offload de expertos a RAM del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta validación estructural (recuento de tensores, tipos de almacenamiento, comparación byte a byte en variantes con routers FP32) y una comprobación funcional con 40 capas de expertos en CPU, sin métricas de calidad de audio (MOS, WER, similitud de hablante) ni de velocidad.

## Requisitos de hardware

- VRAM estimada: depende del perfil. Los archivos pesan entre 15,88 GiB (Q2_K) y 23,87 GiB (BF16 embed/head); la model card advierte explícitamente que el tamaño del archivo no es la VRAM requerida, ya que contexto, historial de referencia, backend y offload afectan al consumo.
- Offload a CPU: `fish_drama3.cpu_expert_layers=40` es la configuración conservadora usada en las comprobaciones funcionales; los expertos descargados necesitan RAM del sistema. No se indica que sea una recomendación de velocidad.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, los perfiles Q2_K y Q3_K podrían caber en GPUs consumer de 24 GB solo con offload parcial, pero no se confirma en la documentación.
- ¿Cabe en GPU consumer?: no confirmado. Los perfiles más pequeños (15,88-18,93 GiB) están cerca del límite de 24 GB, pero sin margen para contexto y buffers; el offload a CPU es el mecanismo previsto para ajustar.
- Opciones de despliegue: exclusivamente audio.cpp con el backend nativo `fish_drama3` (arquitectura GGUF `audiocpp`). Los runtimes GGUF de propósito general (llama.cpp, Ollama, vLLM, TGI) no pueden cargar este modelo según la model card.
- Latencia y throughput: no disponible. El ejemplo usa `--threads 8`, `--max-tokens 512` y modo streaming, pero no se publican cifras de RTF ni de tokens de audio por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de TTS de la misma categoría. La comparación más directa disponible es entre los propios perfiles de cuantización de este repositorio:

| Perfil | Tamano | Expertos | Routers/gates | Embedding | Cabecera | Otras matrices |
|---|---:|---|---|---|---|---|
| 8bit-experts-Q4_K_S | 22,91 GiB | Q4_K | Q8_0 | Q8_0 | Q8_0 | Q8_0 |
| 8bit-experts-Q3_K_S | 18,93 GiB | Q3_K | Q8_0 | Q8_0 | Q8_0 | Q8_0 |
| 8bit-experts-Q2_K | 15,88 GiB | Q2_K | Q8_0 | Q8_0 | Q8_0 | Q8_0 |
| 4bit-experts-Q4_K_S | 21,77 GiB | Q4_K | Q4_K | Q4_0 | Q4_K | Q4_K |
| 8bit-F32-routers-experts-Q4_K_S | 22,97 GiB | Q4_K | FP32 | Q8_0 | Q8_0 | Q8_0 |
| 8bit-F32-routers-BF16-embed-head-experts-Q4_K_S | 23,87 GiB | Q4_K | FP32 | BF16 | BF16 | Q8_0 |

## Limitaciones y advertencias

- Licencia `fish-audio-community-license-v1.0`: es una licencia "other" que debe revisarse antes de cualquier uso comercial; la model card no detalla sus términos.
- Compatibilidad restringida: solo funciona con audio.cpp y el backend `fish_drama3`; no es cargable en llama.cpp, Ollama, vLLM ni TGI.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingüe sin verificación.
- Sin benchmarks publicados: no hay métricas objetivas de calidad de voz, similitud de hablante ni robustez; la validación reportada es estructural y funcional, no de calidad.
- Riesgo de artefactos por cuantización: los perfiles Q2_K y Q3_K comprimen 120 bancos de expertos de forma agresiva; el impacto en la calidad del audio no está medido en la información disponible.
- Consumo de RAM: el offload de expertos a CPU traslada la presión de VRAM a memoria del sistema; con 40 capas descargadas el requisito de RAM puede ser elevado.
- Dos releases con el mismo nombre de archivo: V1 y V2 comparten nombres de fichero y deben guardarse en directorios separados; mezclarlos puede provocar reproducir resultados con pesos distintos a los esperados.
- Alucinación y sesgos: no se documentan análisis de sesgo, y en TTS el riesgo se traduce en prosodia incorrecta, pronunciación errónea o inestabilidad en voces de referencia; no hay datos publicados al respecto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado; conviene tratar los perfiles como experimentales, tal como los describe el propio autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aevionlabs/Drama-3-GGUF
- Repositorio de referencia citado en la model card: https://huggingface.co/Jmica/Drama-3-GGUF
- Revisión V1 preservada: https://huggingface.co/Jmica/Drama-3-GGUF/tree/original-2026-10-13
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Checkpoint V2 (revisión `78e5ab7`): https://huggingface.co/fishaudio/drama-3/tree/78e5ab79e49aa9a25abe8799eff2c4d73a1c3216
- Licencia del modelo base: https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
- Documentación del backend fish_drama3: https://github.com/0xShug0/audio.cpp/blob/main/docs/models/fish_drama3.md
