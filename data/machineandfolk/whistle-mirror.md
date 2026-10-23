# machineandfolk/whistle-mirror

## Resumen

`machineandfolk/whistle-mirror` no es un modelo nuevo, sino una copia sin modificar de `whistle.cact` del repositorio [`Cactus-Compute/whistle`](https://huggingface.co/Cactus-Compute/whistle), fijada a la revisión `ca5287601bef25af26dcf2e1b2bdc0843a7c19e5`. Whistle es un modelo de reconocimiento automático del habla (ASR, *speech-to-text*) desarrollado por Cactus Compute y pensado para inferencia en dispositivo (*on-device*). El repositorio espejo contiene únicamente dos ficheros: el checkpoint `whistle.cact` (16,9 MB) y la licencia Apache 2.0 original.

La motivación declarada del espejo es la reproducibilidad: un *build* que fije esa revisión no depende de que el repositorio upstream siga disponible. El autor ejecuta el modelo en el navegador mediante el motor WebAssembly Needle 3, también espejado en `machineandfolk/needle3-wasm-mirror`, lo que sitúa el caso de uso principal en transcripción local sin servidor ni GPU.

La información publicada es mínima: no se detallan arquitectura, número de parámetros, ventana de audio, idiomas soportados ni resultados de benchmarks. Para cualquier dato técnico o evaluación hay que acudir al repositorio original de Cactus Compute. Este espejo tiene 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no describe la arquitectura; solo se indica que es un modelo *speech-to-text*) |
| Parámetros totales | No disponible (el único dato de tamaño es el fichero de pesos: 16,9 MB) |
| Parámetros activos | No aplica / no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; no se documenta ventana de audio máxima ni longitud de secuencia) |
| Tipos de cuantización | No disponible; el repositorio solo distribuye un fichero `whistle.cact` de 16,9 MB, sin variantes declaradas |
| Idiomas soportados | No disponible (la model card no declara idiomas y el campo `language` de HuggingFace está vacío) |
| Licencia | Apache 2.0 (copyright de Cactus Compute) |
| Formato de pesos | `.cact` (formato del *runtime* Cactus/Needle); no se distribuye en safetensors, GGUF ni ONNX |
| Tarea (*pipeline*) | `automatic-speech-recognition` |
| Modelo base | `Cactus-Compute/whistle` (revisión `ca5287601bef25af26dcf2e1b2bdc0843a7c19e5`) |
| Librería declarada | `cactus-needle` |
| Tamaño del repositorio | 0,0 GB según HuggingFace; fichero de pesos de 16,9 MB |
| SHA-256 de `whistle.cact` | `b6e02f048568ac5d01a2042556c658061e699acbc0aa2a1439f52f3d461dffeb` |
| SHA-256 de `LICENSE` | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` |
| Tipo de repositorio | Espejo (*mirror*) sin cambios respecto al upstream |
| Fecha de creación (metadatos HF) | 23 de octubre de 2026 |
| Última actualización (metadatos HF) | 23 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No disponible. La model card del espejo no incluye ninguna descripción de la arquitectura (transformer, convolucional, híbrida u otra), ni del número de parámetros, ni de la composición del dataset de entrenamiento, ni del proceso de alineación (RLHF, DPO u otras técnicas). Tampoco se documentan innovaciones de decodificación o de atención.

Lo único verificable es el mecanismo de distribución: un único fichero `whistle.cact` que se ejecuta sobre el motor Needle 3 compilado a WebAssembly, lo que implica que el *runtime* propietario del formato forma parte de la cadena de inferencia. El espejo conserva las rutas y los hashes del repositorio original, de modo que cualquier detalle sobre entrenamiento o evaluación debe consultarse en `Cactus-Compute/whistle`.

## Capacidades

- Reconocimiento automático del habla: transcripción de audio a texto (tarea declarada en el *pipeline tag*).
- Inferencia en dispositivo: el modelo está diseñado para ejecutarse localmente, sin depender de una API remota.
- Ejecución en navegador: el autor lo ejecuta mediante el motor Needle 3 WebAssembly, lo que permite despliegue *client-side*.
- Distribución como artefacto único y versionado: el fichero `.cact` lleva hash SHA-256 publicado, apto para fijar revisiones en *builds* reproducibles.
- No se documenta soporte de *tool calling*, agentes, razonamiento multi-paso, visión, audio en streaming, marcas de tiempo, diarización ni traducción.
- Cobertura de idiomas: no declarada; no debe asumirse multilingüismo sin verificarlo en el repositorio original.

## Casos de uso

- Dictado por voz en aplicaciones web: integrando el checkpoint con el motor Needle 3 en el navegador, la transcripción ocurre en el dispositivo del usuario y el audio no se envía a ningún servidor, lo que simplifica el cumplimiento de RGPD.
- Subtitulado de notas de voz en aplicaciones de escritorio: empaquetando el fichero `.cact` (16,9 MB) dentro de una aplicación Electron o Tauri, el incremento de tamaño del instalador es reducido y no requiere GPU.
- Reproducibilidad en CI/CD: fijar la revisión `ca5287...` y verificar el SHA-256 permite que un *pipeline* de integración construya siempre contra el mismo binario, sin depender de la disponibilidad del repositorio upstream.
- Despliegue en entornos aislados (*air-gapped*): el espejo sirve como copia vendorizada para organizaciones que no pueden acceder a HuggingFace durante el *build*.
- Prototipos de accesibilidad: transcripción local de voz a texto en dispositivos de gama baja o navegadores, donde no hay GPU disponible.
- Preprocesado de audio en el *edge*: conversión de grabaciones a texto antes de enviar únicamente el texto a un servicio central, reduciendo ancho de banda y exposición de datos personales.
- Transcripción con requisitos de privacidad estrictos (sanitario, legal, RR. HH.): al ejecutarse en local, el audio sensible no abandona el dispositivo del profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio espejo remite explícitamente al repositorio original para consultar *benchmarks* y documentación. No se deben extrapolar cifras de WER ni de latencia a partir del tamaño del fichero.

## Requisitos de hardware

- VRAM estimada: no disponible. El escenario documentado es ejecución en CPU (navegador vía WebAssembly), sin GPU dedicada.
- Huella en memoria: el fichero de pesos ocupa 16,9 MB; la memoria residente durante la inferencia será del orden de decenas de MB, aunque esta estimación no está confirmada por el autor.
- GPU recomendadas: no aplica según la documentación; no se describe ruta de aceleración por GPU (CUDA, ROCm, Metal).
- GPU de consumo: no es un requisito. El modelo cabe holgadamente en cualquier equipo convencional y en el navegador.
- Opciones de despliegue: motor Needle 3 (WebAssembly) es el único *runtime* documentado; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, dado que el formato `.cact` no es un formato estándar de pesos.
- Latencia y *throughput*: no disponibles; no se publican mediciones de tiempo real (RTF) ni de velocidad de transcripción.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus *model cards* públicas; los de Whistle no están disponibles en la información proporcionada.

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Whistle (`machineandfolk/whistle-mirror`) | No disponible (fichero de 16,9 MB) | No disponible | No disponible | Apache 2.0 | `.cact` |
| OpenAI Whisper tiny | 39 M | Ventanas de 30 s | Multilingüe | MIT | `.pt` / safetensors / GGUF (comunidad) |
| Facebook wav2vec2-base | 95 M | No disponible (sin ventana de streaming) | Inglés (checkpoint base 960h) | Apache 2.0 | safetensors / PyTorch |
| Useful Sensors Moonshine tiny | 27 M | Audio de duración variable | Inglés | MIT | PyTorch / ONNX |

La diferencia principal de Whistle no es el rendimiento, que no está documentado, sino el modo de despliegue: un artefacto único de 16,9 MB orientado a ejecución en navegador, frente a ecosistemas de pesos en PyTorch o GGUF con *runtimes* ampliamente soportados.

## Limitaciones y advertencias

- Es un espejo sin modificaciones: hereda íntegramente el comportamiento, los sesgos y los errores del checkpoint original de Cactus Compute.
- No existe model card técnica propia: faltan arquitectura, parámetros, idiomas, ventana de audio y guía de uso; la evaluación previa a producción exige consultar el repositorio upstream.
- Idiomas no declarados: no se debe asumir que transcribe castellano correctamente sin pruebas empíricas.
- Riesgo de alucinación: como en toda la categoría ASR, con audio ruidoso, silencios largos o acentos no representados en el entrenamiento el modelo puede emitir texto plausible que no se ha pronunciado. No hay documentación específica de este checkpoint al respecto.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero exige conservar el aviso de licencia y la atribución a Cactus Compute; el copyright no es del autor del espejo.
- Formato propietario: `.cact` solo se ejecuta con el *runtime* Needle/Cactus, lo que crea dependencia de ese ecosistema y complica la portabilidad a otras infraestructuras de inferencia.
- Sin validación comunitaria: 0 descargas y 0 *likes*; no hay evidencia de terceros sobre calidad o estabilidad.
- Mantenimiento no garantizado: aunque el objetivo del espejo es la permanencia, no se declara ningún compromiso de actualización si el modelo upstream cambia.
- Verificación recomendada: comprobar el SHA-256 de `whistle.cact` tras la descarga antes de fijarlo en un *build*.

## Enlaces

- Repositorio espejo: https://huggingface.co/machineandfolk/whistle-mirror
- Modelo original: https://huggingface.co/Cactus-Compute/whistle
- Revisión fijada del modelo original: https://huggingface.co/Cactus-Compute/whistle/tree/ca5287601bef25af26dcf2e1b2bdc0843a7c19e5
- Espejo del motor WebAssembly Needle 3: https://huggingface.co/machineandfolk/needle3-wasm-mirror
- Sitio de Cactus Compute: https://cactuscompute.com
