# Infinix-io/Drama-3-GGUF

## Resumen

Drama-3-GGUF es una conversión al formato GGUF del modelo de síntesis de voz Drama 3, desarrollado originalmente por Fish Audio y publicado en Hugging Face bajo el identificador `fishaudio/drama-3`. La conversión la firma el usuario Infinix-io y está empaquetada específicamente para el runtime audio.cpp, con arquitectura GGUF de tipo `audiocpp`. No se trata de un modelo de lenguaje general, sino de un sistema text-to-speech (TTS) con capacidad de clonación de voz que emplea una arquitectura de mezcla de expertos (MoE) en su backbone.

El modelo base Drama 3 es un checkpoint de octubre de 2026 (revisión `78e5ab7`), y esta conversión V2 incorpora la cabeza de salida completa (252.288 filas) sin modificaciones de fine-tuning ni recortes del head. El repositorio ofrece seis perfiles de precisión mixta que combinan cuantización Q2_K, Q3_K o Q4_K en los expertos enrutados con Q8_0, Q4_K o incluso FP32/BF16 en routers, embeddings y head de voz, lo que permite ajustar el equilibrio entre tamaño en disco y fidelidad de la salida de audio.

La relevancia de esta ficha radica en que es una de las pocas distribuciones GGUF de un modelo TTS MoE de gran tamaño (135,7 GB de repositorio completo, con ficheros individuales de entre 15,88 y 23,87 GiB), y en que exige un backend nativo específico (`fish_drama3`) dentro de audio.cpp, por lo que no es compatible con runtimes GGUF de texto de propósito general como llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (backbone) + torre de audio + códec de forma de onda; arquitectura GGUF `audiocpp` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE; se desconoce el número de expertos activos por token) |
| Longitud de contexto | 8192 tokens (valor por defecto en el ejemplo de ejecución de la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K, Q4_K (expertos enrutados); Q8_0, Q4_K, FP32, BF16 en routers, embeddings y head; FP16 en torre de audio y códec |
| Idiomas soportados | no disponible |
| Licencia | fish-audio-community-license-v1.0 (etiquetada como `other`) |
| Formato de pesos | GGUF (seis perfiles de precisión mixta) |

## Arquitectura y entrenamiento

El modelo base Drama 3 de Fish Audio emplea una arquitectura de mezcla de expertos (MoE) en su backbone, con 120 bancos de proyección de expertos enrutados y 40 routers más 40 puertas de expertos compartidos (shared-expert gates), según se deduce de los perfiles de cuantización descritos en la model card. La pila incluye además una torre de audio y un códec de forma de onda que se mantienen en FP16 en todas las conversiones, mientras que las matrices del backbone se cuantizan de forma selectiva. No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card de esta conversión no documenta el proceso de entrenamiento del modelo original.

La innovación técnica principal de esta distribución es el esquema de cuantización mixta por componentes: los 120 bancos de expertos enrutados se almacenan de forma uniforme en Q3_K o Q4_K (sin heurísticas de promoción de bits), mientras que routers y puertas se conservan en Q8_0 o se restauran exactamente desde sus valores BF16 originales en FP32. El perfil BF16 de embedding/head restaura además el embedding original y la cabeza de salida completa de 252.288 filas. Las matrices de la torre de audio y los pesos del códec permanecen en FP16, y las vectores de normalización del backbone y la torre de audio en FP32 (los del códec en FP16). Los seis ficheros han pasado comprobaciones estructurales de número de tensores, tipos de almacenamiento por componente, bancos de expertos, head de salida completo y privacidad de metadatos; en las variantes con routers FP32 se comparó byte a byte cada tensor retenido con el checkpoint original.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, con salida en formato WAV.
- Clonación de voz: la model card etiqueta explícitamente el modelo con `voice-cloning`, aunque no detalla el mecanismo de referencia.
- Generación en modo streaming (`--mode streaming` en el CLI de audio.cpp).
- Control de muestreo configurable: `top_k` (4097 en el ejemplo), `top_p` (0.9), `temperature` (1.0) y `seed` para reproducibilidad.
- Troceado de texto configurable (`text_chunk_size`, 128 en el ejemplo) para entradas largas.
- Longitud de contexto configurable (8192 tokens en el ejemplo de la model card).
- Descarga parcial de expertos a CPU (`fish_drama3.cpu_expert_layers`, 40 capas en la configuración conservadora de validación) para reducir el uso de VRAM a costa de RAM de host.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada ni otras modalidades distintas de TTS.

## Casos de uso

- **Generación de audiolibros y narración larga**: el modelo admite contexto de 8192 tokens y troceado de texto (`text_chunk_size`), lo que permite procesar párrafos extensos manteniendo coherencia de voz entre fragmentos mediante el uso de una misma semilla y referencia de voz.
- **Clonación de voz para doblaje y localización**: la capacidad de voice cloning permite generar versiones en distintos idiomas o registros con la identidad vocal del hablante original, siempre que se cumplan los requisitos de la licencia comunitaria de Fish Audio.
- **Asistentes de voz en tiempo real**: el modo streaming del backend `fish_drama3` en audio.cpp posibilita emitir audio conforme se genera, adecuado para integraciones en aplicaciones de conversación con latencia baja.
- **Generación de voces para videojuegos y contenido interactivo**: los perfiles Q2_K y Q3_K (15,88 y 18,93 GiB) reducen el espacio en disco frente al perfil de 23,87 GiB, lo que facilita el despliegue en estaciones de trabajo con GPU de consumo y almacenamiento limitado.
- **Prototipado de accesibilidad**: conversión de texto a voz para lectores de pantalla o interfaces de asistencia, con control de temperatura y top_p para ajustar la expresividad según el caso.
- **Investigación en cuantización de modelos MoE de audio**: los seis perfiles de precisión mixta permiten estudiar el impacto de cuantizar expertos enrutados frente a routers, embeddings y head, comparando ficheros que difieren solo en esos componentes.
- **Despliegue en entornos con GPU modesta y CPU de refuerzo**: la opción `cpu_expert_layers` permite descargar hasta 40 capas de expertos a RAM de host, habilitando inferencia en equipos donde el modelo completo no cabe en VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta comprobaciones estructurales (número de tensores, tipos de almacenamiento, integridad byte a byte de tensores retenidos en las variantes FP32) y una validación funcional con 40 capas de expertos en CPU, sin métricas de calidad de audio, latencia ni throughput.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. La model card advierte que el tamaño del fichero no equivale a la VRAM requerida; el contexto, el historial de referencia, el backend y la descarga a CPU afectan al consumo de memoria.
- **Tamaño en disco por perfil**: 15,88 GiB (Q2_K), 18,93 GiB (Q3_K), 21,77 GiB (Q4_K con backbone 4 bits), 22,91 GiB (Q8_0 con expertos Q4_K), 22,97 GiB (routers FP32) y 23,87 GiB (routers FP32 + embedding/head BF16).
- **GPU recomendadas**: no disponibles en la información proporcionada. El ejemplo de la model card usa `--backend cuda` sin especificar modelo de GPU.
- **Compatibilidad con GPU de consumo**: no confirmada. Los perfiles más pequeños (Q2_K y Q3_K) son los únicos candidatos plausibles para GPUs de consumo de gama alta, pero requerirían descarga parcial de expertos a CPU.
- **RAM de host**: necesaria para los expertos descargados a CPU (`fish_drama3.cpu_expert_layers`); la model card no indica la cantidad concreta.
- **Opciones de despliegue**: exclusivamente el CLI de audio.cpp (`audiocpp_cli.exe`) con `--task tts --family fish_drama3`; requiere el backend nativo `fish_drama3` y no es compatible con llama.cpp, Ollama, vLLM ni TGI, que no pueden cargar la arquitectura `audiocpp`.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| Infinix-io/Drama-3-GGUF (esta ficha) | no disponible (MoE) | 8192 tokens | GGUF (6 perfiles) | fish-audio-community-license-v1.0 | audio.cpp con backend `fish_drama3` |
| fishaudio/drama-3 (modelo base) | no disponible (MoE) | no disponible | pesos originales (FP8 escalado en expertos) | fish-audio-community-license-v1.0 | runtime propio de Fish Audio |
| Jmica/Drama-3-GGUF | no disponible (MoE) | 8192 tokens (ejemplo) | GGUF (6 perfiles) | fish-audio-community-license-v1.0 | audio.cpp con backend `fish_drama3` |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- **Compatibilidad de runtime restringida**: los ficheros usan la arquitectura GGUF `audiocpp` y solo cargan con el backend nativo `fish_drama3` de audio.cpp; los runtimes GGUF de texto de propósito general no pueden ejecutarlos.
- **Licencia comunitaria**: la fish-audio-community-license-v1.0 es una licencia `other` con posibles restricciones para uso comercial; es necesario revisar el texto completo enlazado en la model card antes de cualquier despliegue productivo.
- **Riesgo de clonación de voz**: la capacidad de voice cloning puede emplearse para suplantar identidades; se requiere consentimiento explícito del hablante y cumplimiento de la normativa aplicable.
- **Sesgos**: no disponibles en la información proporcionada; no se documentan sesgos de género, acento o idioma.
- **Idiomas**: no se especifican los idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas sin pruebas empíricas.
- **Alucinación y artefactos de audio**: no se documentan métricas de fidelidad; la cuantización de expertos a Q2_K o Q3_K puede degradar la calidad de la voz respecto al checkpoint original, y la model card no cuantifica esa pérdida.
- **Consumo de memoria ambiguo**: el tamaño del fichero no equivale a la VRAM necesaria; el contexto, el historial de referencia y la descarga a CPU alteran el consumo, y la configuración de 40 capas en CPU es conservadora, no una recomendación de velocidad.
- **Reproducibilidad**: los cambios de backend, contexto, historial de referencia y descarga a CPU pueden alterar la salida muestreada; para reproducir resultados con los pesos originales hay que seleccionar la revisión `original-2026-10-13` (V1).
- **Metadatos de autoría**: el repositorio aparece bajo el identificador `Infinix-io`, mientras que la model card referencia comandos de descarga del repositorio `Jmica/Drama-3-GGUF` y la búsqueda web menciona `Infinix-ai/Drama-3-GGUF`; conviene verificar el repositorio canónico antes de integrar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Infinix-io/Drama-3-GGUF
- Repositorio alternativo citado en la búsqueda web: https://huggingface.co/Infinix-ai/Drama-3-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Revisión del checkpoint base (29 de octubre de 2026): https://huggingface.co/fishaudio/drama-3/tree/78e5ab79e49aa9a25abe8799eff2c4d73a1c3216
- Licencia: https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE
- Repositorio de audio.cpp: https://github.com/0xShug0/audio.cpp
- Documentación del backend Drama 3 en audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/models/fish_drama3.md
- Repositorio GGUF referenciado en la model card: https://huggingface.co/Jmica/Drama-3-GGUF/tree/main
- Revisión V1 preservada: https://huggingface.co/Jmica/Drama-3-GGUF/tree/original-2026-10-13
- Ficha en Free2AITools: https://free2aitools.com/model/infinix-io/drama-3-gguf
