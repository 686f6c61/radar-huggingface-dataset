# Jinstudio/MOSS-TTS-Local-Transformer

## Resumen

MOSS-TTS-Local-Transformer es la variante «Local» de la familia MOSS-TTS, un conjunto de modelos de generación de voz y sonido desarrollado por MOSI.AI y el equipo OpenMOSS. Esta variante concreta implementa la arquitectura `MossTTSLocal`, descrita por sus autores como un esquema de bloques RVQ (Residual Vector Quantization) sincronizados en el tiempo con un *depth transformer*, orientado a sistemas de síntesis de voz en streaming y a escenarios donde prima la ligereza y el rendimiento objetivo frente a la estabilidad de contexto largo que ofrece la variante `MossTTSDelay`.

El repositorio de HuggingFace es un espejo publicado por el usuario `Jinstudio` (0 descargas y 0 likes en el momento de la consulta), no una publicación de la cuenta oficial de OpenMOSS. Contiene 3.060.606.464 parámetros (~3,06 mil millones) en formato safetensors, con un tamaño de repositorio de 6,1 GB, lo que sitúa el peso en precisión de 16 bits. El modelo se distribuye con `custom_code`, por lo que requiere `trust_remote_code=True` para cargarse.

Su relevancia radica en que ofrece síntesis de voz multilingüe (20 idiomas, incluido el castellano) bajo licencia Apache 2.0, con un tamaño que cabe en GPU de consumo y que la familia presenta como base reproducible para investigación y despliegue en producción. La model card disponible está truncada y no detalla el número de tokens de entrenamiento ni resultados de benchmarks para esta variante concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `MossTTSLocal`: bloques RVQ sincronizados en el tiempo con depth transformer (etiquetado tambien como `moss_tts_delay` en los tags del repo) |
| Parametros totales | 3.060.606.464 (~3,06 B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; pesos publicados en safetensors (precision nativa, presumiblemente bf16/fp16 dado el tamano de 6,1 GB). No se ofrecen GGUF, ONNX ni variantes cuantizadas |
| Idiomas soportados | 20: zh, en, de, es, fr, ja, it, he, ko, ru, fa, ar, pl, pt, cs, da, sv, hu, el, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `custom_code` (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La familia MOSS-TTS separa el problema de la síntesis de voz en cinco modelos componibles: MOSS-TTS (modelo insignia, 8B, arquitectura `MossTTSDelay`), MOSS-TTSD (diálogo hablado), MOSS-VoiceGenerator (diseño de voz a partir de texto), MOSS-TTS-Realtime (agentes de voz de baja latencia) y MOSS-SoundEffect (efectos de sonido). Dentro de ese conjunto, `MossTTSDelay` y `MossTTSLocal` se entrenan como líneas base complementarias bajo un mismo esquema de entrenamiento y evaluación: `Delay` prioriza estabilidad en contexto largo, velocidad de inferencia y madurez para producción, mientras que `Local` prioriza ligereza y buen rendimiento en métricas objetivas para sistemas orientados a streaming.

Técnicamente, `MossTTSLocal` emplea bloques RVQ sincronizados en el tiempo procesados por un depth transformer, un esquema habitual en modelos de audio que predicen múltiples tokens de codec por paso temporal. `MossTTSDelay`, en cambio, usa predicción RVQ paralela multi-cabecera con planificación basada en patrón de retardo (*delay pattern*). `MossTTSRealtime` añade una entrada jerárquica texto-audio para modelar el contexto multi-turno (texto previo y acústica del usuario) y mantener coherencia de voz entre turnos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF/DPO o ajuste por preferencias en esta variante. La model card accesible está truncada antes de detallar la sección de entrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe en 20 idiomas, con pipeline declarado `text-to-speech`.
- Generación de audio orientada a streaming, según la descripción de la familia para la variante `Local`.
- Síntesis con cambio de código lingüístico (*code-switching*) dentro de una misma locución: documentado en la familia MOSS-TTS.
- Control fino de pronunciación mediante pinyin, fonemas y duración: atribuido al modelo insignia MOSS-TTS en la model card, no confirmado para esta variante.
- Clonación de voz zero-shot: atribuida al modelo insignia MOSS-TTS; no confirmada para `MossTTSLocal` en la información disponible.
- Generación de diálogo multi-hablante y voces de larga duración: corresponde a MOSS-TTSD y a la línea `Delay`; no confirmado aquí.
- Tool calling / function calling: no documentado (no es una capacidad propia de un modelo TTS).
- Capacidades de agente, razonamiento multi-paso, visión o audio de entrada: no disponibles.

## Casos de uso

- **Locución de audiolibros y contenido largo en catalán de estudio**: el modelo permite generar voz sintética en 20 idiomas bajo licencia Apache 2.0, lo que facilita producir narraciones sin depender de servicios propietarios por volumen de caracteres. Requiere validar empíricamente la estabilidad en pasajes largos, ya que la familia atribuye esa fortaleza a la variante `Delay`.
- **Doblaje y localización multilingüe de vídeo**: con soporte para es, en, de, fr, it, pt, pl y otras lenguas europeas, se puede integrar en un pipeline que reciba el guion traducido y genere pistas de audio por idioma, usando el mismo modelo para mantener consistencia tímbrica entre versiones.
- **Asistentes de voz de baja latencia en local**: su tamaño de 3,06 B permite ejecución en una sola GPU de consumo, lo que habilita prototipos de agentes de voz on-premise sin enviar audio de usuarios a la nube. Para producción en tiempo real habría que evaluar la variante MOSS-TTS-Realtime, que declara 180 ms de TTFB.
- **Accesibilidad y lectura de pantalla**: integración en aplicaciones de lectura de documentos, avisos o interfaces para personas con discapacidad visual, con despliegue en el propio dispositivo o en un servidor interno y sin coste por petición.
- **Sistemas de atención al cliente e IVR**: generación de respuestas habladas en centros de contacto, con la ventaja de que la licencia Apache 2.0 permite uso comercial sin regalías y el modelo puede alojarse en infraestructura propia para cumplir requisitos de residencia de datos.
- **Investigación en TTS y evaluación reproducible**: al publicarse junto a `MossTTSDelay` bajo un mismo esquema de entrenamiento y evaluación, sirve como línea base reproducible para comparar estrategias de decodificación RVQ en trabajos académicos.
- **Generación de contenido para pódcast y vídeo corto**: producción de cuñas, introducciones o voces en off en varios idiomas dentro de una misma herramienta, con control de duración si se confirma la funcionalidad de control fino de tempo.
- **Prototipado rápido en entornos con GPU limitada**: al ocupar unos 6,1 GB en pesos nativos, se puede montar un servicio de demostración en una estación de trabajo sin necesidad de clústeres multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona de forma cualitativa que `MossTTSLocal` ofrece «strong objective performance» y que `MossTTSDelay` destaca en velocidad de inferencia y estabilidad de contexto largo, pero no se incluyen cifras de WER, MOS, SIM (similitud de hablante) ni comparaciones numéricas para esta variante en el fragmento accesible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (cálculo a partir del número de parámetros, no confirmado por el autor): ~6,5-8 GB en bf16/fp16 (pesos de 6,1 GB más caché de activaciones y decodificador de audio); ~12-14 GB si se carga en fp32; ~4-5 GB en cuantización int8; ~2,5-3,5 GB en int4. Estas cifras son estimaciones y deben validarse en el despliegue real.
- **GPU recomendadas**: para bf16, una RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) o RTX 3090 (24 GB) cubren con margen. En el entorno profesional, A100 40/80 GB, H100 o L40S permiten mayor paralelismo y throughput por nodo.
- **¿Cabe en GPU de consumo?** Sí, previsiblemente en cualquier GPU con 8 GB o más en bf16, y en GPUs de 6-8 GB si se aplica cuantización. No hay confirmación oficial de este dato.
- **Opciones de despliegue**: PyTorch con `transformers` y `trust_remote_code=True` es la vía indicada por el tag `custom_code`. No hay evidencia de soporte en vLLM, TGI, llama.cpp u Ollama, y al no publicarse GGUF ni ONNX, esas rutas no están disponibles. Existe una API alojada en studio.mosi.cn con documentación propia.
- **Latencia y throughput**: no disponibles para esta variante. Como referencia de familia, MOSS-TTS-Realtime declara 180 ms de TTFB y 377 ms desde la primera frase del LLM hasta el primer byte de audio.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MOSS-TTS-Local-Transformer (este repo) | `MossTTSLocal` (RVQ sincrono + depth transformer) | 3,06 B | No disponible | TTS ligero, orientado a streaming | Apache 2.0 | HuggingFace (espejo de terceros) |
| MOSS-TTS (insignia) | `MossTTSDelay` (RVQ paralelo multi-cabecera con delay pattern) | 8 B | No disponible | TTS de produccion, clonacion zero-shot, control fino | Apache 2.0 (segun la model card de la familia) | HuggingFace y ModelScope (OpenMOSS) |
| MOSS-TTSD | No disponible | No disponible | No disponible | Dialogo hablado multi-hablante de larga duracion | No disponible | HuggingFace y ModelScope (OpenMOSS) |
| MOSS-TTS-Realtime | Entrada jerarquica texto-audio | No disponible | No disponible | Agentes de voz de baja latencia (TTFB 180 ms) | No disponible | HuggingFace y ModelScope (OpenMOSS) |

No se dispone de datos de benchmarks que permitan comparar rendimiento objetivo entre estas variantes ni frente a alternativas de otros fabricantes.

## Limitaciones y advertencias

- **Repositorio no oficial**: el autor del repo es `Jinstudio`, no la organización OpenMOSS, con 0 descargas y 0 likes. No hay garantía de que los pesos coincidan con la publicación oficial; conviene contrastar hashes con el repositorio de ModelScope antes de usarlo en producción.
- **Discrepancia de etiquetado**: los tags del repo incluyen `moss_tts_delay` mientras que el nombre indica `Local Transformer`. Es necesario verificar qué arquitectura cargan realmente los pesos.
- **Código personalizado**: el tag `custom_code` implica ejecutar código remoto (`trust_remote_code=True`), lo que supone un riesgo de seguridad y de compatibilidad entre versiones de `transformers`.
- **Model card incompleta**: la documentación disponible está truncada; faltan datos de entrenamiento, contexto máximo, benchmarks y procedimiento de inferencia, lo que dificulta la reproducibilidad.
- **Riesgo de alucinación acústica**: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, artefactos, repeticiones o prosodia antinatural, especialmente en textos largos, idiomas de bajos recursos o nombres propios.
- **Sesgos**: no se documenta la composición del dataset de voz, por lo que se desconocen sesgos de acento, género, edad o variedad dialectal. El castellano soportado podría corresponder a una variedad concreta no declarada.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial y modificación con atribución, pero no cubre posibles derechos sobre las voces de referencia usadas en el entrenamiento. La clonación de voz exige consentimiento explícito y cumple la normativa aplicable (RGPD, AI Act) en el espacio europeo.
- **Sin cuantizaciones ni formatos alternativos**: la ausencia de GGUF u ONNX limita el despliegue en CPU y en entornos embebidos.
- **Idiomas**: 20 lenguas declaradas, pero sin métricas por idioma; el rendimiento en checo, húngaro, griego o persa podría ser sensiblemente inferior al de chino o inglés.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/Jinstudio/MOSS-TTS-Local-Transformer
- Repositorio oficial en GitHub: https://github.com/OpenMOSS/MOSS-TTS/tree/main
- Detalles de arquitectura `MossTTSLocal`: https://github.com/OpenMOSS/MOSS-TTS/blob/main/moss_tts_local/README.md
- Detalles de arquitectura `MossTTSDelay`: https://github.com/OpenMOSS/MOSS-TTS/blob/main/moss_tts_delay/README.md
- Detalles de arquitectura `MossTTSRealtime`: https://github.com/OpenMOSS/MOSS-TTS/blob/main/moss_tts_realtime/README.md
- Repositorio MOSS-TTSD: https://github.com/OpenMOSS/MOSS-TTSD
- Coleccion en ModelScope: https://modelscope.cn/collections/OpenMOSS-Team/MOSS-TTS
- Blog de MOSI.AI: https://mosi.cn/#models
- Paper: https://arxiv.org/abs/2603.18090
- Demo alojada (AIStudio): https://studio.mosi.cn
- Documentacion de la API: https://studio.mosi.cn/docs/moss-tts
- Web oficial de OpenMOSS: https://www.open-moss.com/
- X/Twitter: https://x.com/Open_MOSS
- Discord: https://discord.gg/fvm5TaWjU3

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos de HuggingFace.
