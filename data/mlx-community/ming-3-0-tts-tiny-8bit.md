# mlx-community/Ming-3.0-tts-tiny-8bit

## Resumen

Ming-3.0-tts-tiny-8bit es la conversión al ecosistema MLX del modelo de síntesis de voz inclusionAI/Ming-3.0-tts-tiny, publicada por la comunidad mlx-community. Se trata de un modelo de text-to-speech de aproximadamente 8.981.004.468 parámetros (unos 8,98 mil millones) que genera audio a 44,1 kHz e incorpora voces predefinidas, clonación de voz y controles de estilo. Su propósito es permitir inferencia de TTS completamente offline en silicio de Apple, sin dependencias de ONNX ni de código remoto.

La relevancia de esta ficha es doble: por un lado, cuantifica el checkpoint original en BF16 a 8 bits con una política de cuantización selectiva que preserva en coma flotante los módulos acústicos y los routers MoE, lo que evita la degradación típica de cuantizar un modelo de audio de extremo a extremo. Por otro, empaqueta el encoder de hablante CAMPPlus en MLX nativo con pesos en FP32, de modo que la clonación de voz funciona sin paquetes externos.

El repositorio tiene 10,6 GB, licencia MIT para el modelo (el encoder CAMPPlus se distribuye bajo Apache-2.0), y fue creado el 19 de octubre de 2026. En el momento de redactar esta ficha no consta ningún resultado de benchmarks publicado ni listado de idiomas soportados, y el modelo acumula 0 descargas y 0 likes, por lo que se trata de una conversión reciente y todavía sin validación por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de TTS con componentes MoE (los routers MoE se mencionan explícitamente en la model card); tag de arquitectura `lingv3_tts` |
| Parametros totales | 8.981.004.468 (aproximadamente 8,98 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine, group size 64, aplicada solo al backbone de lenguaje; módulos acústicos y routers MoE en coma flotante; encoder de hablante CAMPPlus en FP32 |
| Idiomas soportados | no disponible (la model card solo muestra un ejemplo con la voz `US_James`) |
| Licencia | MIT para el modelo; Apache-2.0 para el encoder CAMPPlus incluido |
| Formato de pesos | safetensors (MLX), más `speaker_encoder/campplus.safetensors`, `validation.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

La model card describe un sistema de TTS con un backbone de lenguaje (cuantizado a 8 bits) y módulos acústicos separados que se mantienen en precisión de coma flotante, junto con routers MoE que también conservan su precisión original. Esta separación es una decisión de diseño relevante: en modelos de audio, cuantizar las capas acústicas o los routers de mezcla degrada la calidad de la señal generada, de modo que la política de cuantización específica del modelo protege esas rutas. El resultado es un checkpoint de 10,6 GB que cabe en memoria unificada de equipos Apple de gama alta.

La extracción de hablante se realiza con CAMPPlus, un encoder de speaker verification empaquetado en `speaker_encoder/campplus.safetensors` con pesos en FP32 y ejecutado de forma nativa en MLX, sin ONNX. El modelo acepta también un vector `spk_emb` de 192 valores para condicionar la identidad de la voz. La conversión parte del export MLX en BF16 del checkpoint original (revisión `154395db3ec31ab6f055035b2f41da2cd6f95f80`).

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, ni si el modelo original utilizó RLHF, DPO u otras etapas de alineación. Tampoco se detalla el mecanismo de decodificación de audio ni la arquitectura exacta del generador acústico (vocoder o codec).

## Capacidades

- Síntesis de voz a 44,1 kHz a partir de texto, con salida de audio y sample rate expuestos por la API `mlx_audio.tts`.
- Voces integradas seleccionables por identificador, por ejemplo `voice="US_James"`.
- Clonación de voz mediante el encoder CAMPPlus incluido o mediante un vector `spk_emb` de 192 valores.
- Controles de estilo de habla según la model card del checkpoint original.
- Inferencia completamente offline en Apple Silicon con código MLX nativo.
- Carga del tokenizer sin ejecutar código remoto (`trust_remote_code` no necesario).
- Validación de integridad del paquete mediante `SHA256SUMS` y recarga estricta (`strict=True`) desde un directorio reubicado con caché de Hugging Face vacía y red bloqueada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada (no es un modelo speech-to-speech).

## Casos de uso

- **Generación de audiolibros y contenido largo en local**: el modelo produce audio a 44,1 kHz con voces consistentes, lo que permite narrar capítulos completos en un Mac sin enviar texto a servicios externos, algo crítico para editoriales con material bajo embargo.
- **Clonación de voz para locución corporativa**: con el encoder CAMPPlus o un `spk_emb` precalculado se puede fijar una voz de marca y reutilizarla en cientos de piezas de audio sin regrabar al locutor.
- **Prototipado de asistentes conversacionales**: integrado en una app de escritorio macOS mediante `mlx_audio.tts.load(...)`, permite iterar sobre el tono y el estilo de la respuesta antes de comprometerse con un proveedor de TTS en la nube.
- **Doblaje y localización de vídeo en estaciones de trabajo Apple**: el control de estilo y la selección de voz permiten ajustar la interpretación por escena y mantener la identidad de cada personaje entre clips.
- **Accesibilidad y lectura de pantalla**: conversión de documentos y artículos a voz en el propio dispositivo, sin latencia de red ni coste por carácter, adecuado para usuarios con discapacidad visual.
- **Mensajería de voz automatizada en sistemas IVR**: generación de avisos y confirmaciones con una voz estable, con la ventaja de que todo el pipeline se ejecuta en la misma máquina que el backend, sin depender de API keys.
- **Investigación en TTS y cuantización**: al preservar routers MoE y módulos acústicos en coma flotante, sirve como caso de estudio reproducible de cuantización selectiva 8-bit frente al checkpoint BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta la validación funcional (recarga estricta en un directorio reubicado, con caché vacía, red bloqueada y sin paquetes ONNX), remitiendo a `validation.json` para el inventario de pesos y tareas probadas. No hay métricas objetivas de calidad de audio (MOS, CMOS), de similitud de hablante (SECS) ni de inteligibilidad (WER de ASR sobre la salida).

## Requisitos de hardware

- **Memoria**: el repositorio ocupa 10,6 GB, correspondientes al backbone cuantizado a 8 bits más los módulos acústicos, routers y encoder en coma flotante. Hay que sumar el overhead del runtime MLX y los buffers de audio, por lo que se recomienda un mínimo de 16 GB de memoria unificada y, con margen real, 24-32 GB.
- **GPU**: el modelo está pensado exclusivamente para Apple Silicon (M1/M2/M3/M4 y variantes Pro, Max y Ultra) mediante MLX. No hay soporte documentado para A100, H100 ni RTX 4090 en este repositorio.
- **¿Cabe en consumer GPU?**: en el sentido estricto de GPU dedicada, no se ofrece ruta CUDA. En equipos de consumo Apple, sí: cabe en un Mac con 24 GB o más de memoria unificada; en configuraciones de 16 GB el margen es ajustado.
- **Opciones de despliegue**: `mlx-audio` (API `mlx_audio.tts.load` y `model.generate`, con escritura a WAV vía `mlx_audio.audio_io.write`). No se contemplan vLLM, TGI, llama.cpp ni Ollama, ya que no se distribuyen pesos GGUF.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de RTF (real-time factor) ni de tiempo a primer fragmento de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mlx-community/Ming-3.0-tts-tiny-8bit | 8,98 mil millones | no disponible | MIT (modelo) + Apache-2.0 (CAMPPlus) | safetensors para MLX | TTS 44,1 kHz con clonación y estilo, solo Apple Silicon |
| inclusionAI/Ming-3.0-tts-tiny | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | checkpoint original BF16 | Modelo base del que se deriva esta conversión |
| Alternativas open source de TTS (Kokoro, XTTS-v2, F5-TTS, Orpheus) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | no disponible | No se han obtenido datos verificables de estas alternativas en la búsqueda realizada; la comparación cuantitativa queda pendiente |

La búsqueda web asociada a esta ficha no devolvió resultados técnicos utilizables, por lo que no se han podido contrastar parámetros, contextos ni licencias de modelos competidores. Cualquier comparación numérica en esta sección sería especulativa y se ha omitido deliberadamente.

## Limitaciones y advertencias

- **Ausencia de benchmarks**: no hay métricas públicas de calidad de audio, similitud de hablante ni inteligibilidad, lo que impide estimar la degradación real frente al checkpoint BF16.
- **Idiomas no declarados**: la model card no enumera idiomas soportados; el único ejemplo usa una voz etiquetada como `US_James`. No se debe asumir cobertura multilingüe sin pruebas propias.
- **Dependencia de plataforma**: requiere Apple Silicon y una versión de MLX Audio con soporte para Ming Tiny. No es desplegable en infraestructura CUDA ni en servidores Linux x86 convencionales.
- **Cuantización selectiva**: aunque los módulos acústicos y los routers quedan en coma flotante, el backbone en 8-bit puede introducir diferencias de prosodia o pronunciación frente al original; conviene una evaluación A/B antes de producción.
- **Clonación de voz**: implica riesgos claros de suplantación y de uso no consentido de la identidad vocal de terceros. La licencia MIT no exime de las obligaciones legales de consentimiento y de la normativa aplicable sobre datos biométricos y deepfakes.
- **Licencias mixtas**: el modelo es MIT, pero el encoder CAMPPlus incluido está bajo Apache-2.0; hay que conservar los avisos correspondientes al redistribuir el paquete.
- **Madurez del repositorio**: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción por terceros.
- **Riesgo de alucinación acústica**: como todo modelo generativo de audio, puede producir artefactos, pronunciaciones incorrectas de nombres propios o prosodia incoherente en textos largos o con abundantes símbolos.
- **Contexto de entrada**: se desconoce la longitud máxima de texto por petición; para documentos largos habrá que fragmentar y gestionar la concatenación de audio manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Ming-3.0-tts-tiny-8bit
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-tts-tiny
- Revisión del checkpoint de origen citada en la model card: `154395db3ec31ab6f055035b2f41da2cd6f95f80`
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo.
