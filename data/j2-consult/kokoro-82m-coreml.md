# J2-Consult/kokoro-82m-coreml

## Resumen

Kokoro-82M Core ML es una conversión del modelo de síntesis de voz Kokoro-82M (desarrollado originalmente por hexgrad) a formato Core ML, publicada por J2-Consult. El objetivo no es otro que ejecutar síntesis de voz de calidad en dispositivos Apple sin conexión a la red: los pesos se distribuyen como siete etapas precompiladas de Core ML más seis tablas de estilo de voces en inglés, de modo que una aplicación iOS puede descargarlas una vez y ejecutarlas en la CPU del iPhone sin enviar texto ni audio a ningún servidor.

El modelo subyacente es un TTS ligero de 82 millones de parámetros con licencia Apache-2.0, pensado para inferencia en el borde. Esta ficha describe la variante Core ML, que no modifica los pesos originales: según la model card, los ficheros son un subconjunto byte a byte idéntico de la conversión de referencia publicada por jonschneider (revisión `aaccff0a080d3c5bd5457fd506da28899fc91c9b`), con cuantización fp16 e int8 palettization heredada de la herramienta de conversión de laishere.

Su relevancia es acotada pero clara: demuestra un pipeline TTS completamente local en el ecosistema Apple, con artefactos listos para producción (bundles `.mlmodelc` que no requieren compilación en el dispositivo) y sumas de verificación SHA-256 para cada fichero. No aporta innovaciones de arquitectura ni nuevos datos de entrenamiento; su valor está en el empaquetado y la verificabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; pipeline TTS por etapas (KokoroAlbert, KokoroPostAlbert, KokoroAlignment, KokoroProsody, KokoroNoise, KokoroVocoder, KokoroTail) |
| Parametros totales | 82 M (modelo base Kokoro-82M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS; no se documenta ventana de texto) |
| Tipos de cuantizacion | fp16 e int8 palettization (heredados de la conversión de laishere) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlmodelc` precompilados) y tablas de estilo float32 little-endian `[510, 256]` |
| Tamano del repositorio | 0,1 GB (41 ficheros, 85 406 833 bytes) |
| Libreria | coreml |
| Modelo base | hexgrad/Kokoro-82M |
| Voces incluidas | `af_heart`, `af_bella`, `am_adam`, `am_michael`, `bf_emma`, `bm_george` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de la división en etapas que impone la conversión a Core ML: `KokoroAlbert`, `KokoroPostAlbert`, `KokoroAlignment`, `KokoroProsody`, `KokoroNoise`, `KokoroVocoder` y `KokoroTail`. Los nombres sugieren una separación entre codificación textual tipo Albert, alineamiento, predicción de prosodia, generación de ruido y vocoder, pero no se documenta en la model card ni el tipo de bloque transformer, ni el mecanismo de atención, ni la naturaleza exacta del decodificador de audio.

Tampoco se especifican los datos de entrenamiento (número de tokens, horas de audio, composición del corpus), ni si hubo ajuste por RLHF/DPO, ni detalles del proceso de destilación o alineación. Lo único verificable es el proceso de conversión: fp16 más int8 palettization mediante la herramienta de laishere, y la reutilización sin cambios de los artefactos de jonschneider, con pipeline Swift asociado (`kokoro-coreml-ane`). La innovación destacable es de ingeniería de despliegue: bundles precompilados que evitan la compilación en el dispositivo y tablas de estilo separadas que permiten cambiar de voz sin recargar el modelo.

## Capacidades

- Síntesis de texto a voz en inglés a partir de texto plano.
- Seis voces preentrenadas: cuatro americanas (`af_heart`, `af_bella`, `am_adam`, `am_michael`) y dos británicas (`bf_emma`, `bm_george`).
- Ejecución completamente en el dispositivo (CPU del iPhone según la model card), sin salida de texto ni audio a la red.
- Cambio de voz mediante tablas de estilo independientes (`[510, 256]` en float32), sin necesidad de recargar las etapas del modelo.
- Integración con pipeline Swift para Core ML (`kokoro-coreml-ane`).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada ni modo de razonamiento.
- No se documenta multilingüismo: solo inglés.

## Casos de uso

- Lectura por voz en aplicaciones iOS: la app descarga una vez los siete bundles `.mlmodelc` y las voces, y sintetiza texto en la CPU del dispositivo; adecuado para lectores de artículos, correo o documentos sin depender de conectividad.
- Asistentes de accesibilidad: conversión de texto a voz para usuarios con discapacidad visual o dificultades lectoras, con la garantía de que el contenido no sale del terminal, lo que simplifica el cumplimiento de privacidad.
- Aplicaciones de idiomas: reproducción de frases en inglés con distintas voces (americano y británico) para prácticas de pronunciación y comprensión auditiva.
- Navegación y avisos manos libres: instrucciones habladas generadas localmente en apps de conducción o senderismo donde la cobertura es intermitente.
- Procesamiento por lotes en el dispositivo: generación de audio para podcasts o boletines precargados, aprovechando que no hay coste por petición ni límite de cuota de API.
- Prototipado de interfaces de voz: evaluación de latencia y calidad de TTS local antes de comprometerse con un servicio en la nube, usando los mismos pesos que el modelo de referencia.
- Distribución verificable en entornos regulados: el repositorio incluye `SHA256SUMS` para cada fichero, lo que facilita la auditoría de integridad en despliegues empresariales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad de audio (MOS, CMOS), latencia, throughput ni comparaciones objetivas con otros sistemas TTS.

## Requisitos de hardware

- VRAM: no aplica en el caso de uso previsto; la model card indica ejecución en la CPU del iPhone. El tamaño del repositorio es de 85 406 833 bytes (unos 81 MiB), lo que da una cota superior del espacio en disco necesario para los siete bundles y las seis voces.
- GPU recomendadas: no se documentan. El pipeline de referencia (`kokoro-coreml-ane`) sugiere uso de la Neural Engine en chips Apple, pero la model card de esta variante afirma explícitamente ejecución en CPU.
- Compatibilidad con GPU de consumo: no disponible; el formato Core ML está orientado a hardware Apple (iPhone, iPad, Mac con Apple Silicon), no a GPU NVIDIA o AMD.
- Opciones de despliegue: Core ML con los `.mlmodelc` precompilados y el pipeline Swift `kokoro-coreml-ane`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kokoro-82M Core ML (J2-Consult) | 82 M | en | Core ML (`.mlmodelc`) | Apache-2.0 | Variante on-device para Apple; 6 voces; artefactos verificables con SHA-256 |
| hexgrad/Kokoro-82M | 82 M | en | PyTorch (safetensors) | Apache-2.0 | Modelo original; referencia para conversiones y fine-tunes |
| jonschneider/kokoro-coreml | 82 M | en | Core ML | Apache-2.0 | Conversión de referencia; esta variante es un subconjunto byte a byte idéntico |
| laishere/kokoro-coreml (herramienta) | 82 M | en | Core ML | Apache-2.0 | Herramienta de conversión (fp16 + int8 palettization) |

No se dispone de datos de benchmarks que permitan comparar calidad o latencia entre estas variantes; la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe documentado.
- Al ser una conversión de un modelo TTS, puede producir pronunciaciones incorrectas en nombres propios, siglas, homógrafos y texto con formato (números, fechas, unidades), sin que se documenten mecanismos de normalización textual.
- No se documentan evaluaciones de sesgo; las voces incluidas son un conjunto fijo de seis, lo que limita la diversidad de acentos y géneros disponibles.
- Riesgo de alucinación en el sentido de prosodia o entonación no natural, así como posibles artefactos de audio; no hay métricas publicadas que lo cuantifiquen.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE` y atribuir al modelo original, a la conversión de laishere y a la publicación de jonschneider.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento continuado.
- Dependencia de hardware Apple: los `.mlmodelc` no son portables a otras plataformas sin reconversión.
- La fecha de creación indicada (2026-11-03) es posterior a la de esta ficha; conviene verificar la vigencia y posibles actualizaciones del repositorio antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/J2-Consult/kokoro-82m-coreml
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Conversión de referencia en Hugging Face: https://huggingface.co/jonschneider/kokoro-coreml
- Herramienta de conversión: https://github.com/laishere/kokoro-coreml
- Pipeline Swift: https://github.com/Jon-Schneider/kokoro-coreml-ane
