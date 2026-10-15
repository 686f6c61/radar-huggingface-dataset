# codeclawd/parakeet-tdt-0.6b-v3-coreml

## Resumen

Parakeet-tdt-0.6b-v3-coreml es una conversion a Core ML del modelo de reconocimiento automatico del habla (ASR) nvidia/parakeet-tdt-0.6b-v3, orientada a ejecucion local en dispositivos Apple. La conversion original la realizo FluidInference y este repositorio concreto (codeclawd/parakeet-tdt-0.6b-v3-coreml) es un espejo de respaldo mantenido por el equipo de PrivateWispr, con archivos byte a byte identicos a la revision upstream. El modelo resuelve transcripcion de audio a texto multilingue sin conexion a red, con foco en privacidad, baja latencia y despliegue en macOS e iOS.

Se trata de una arquitectura FastConformer-TDT (Token-and-Duration Transducer) de aproximadamente 600 millones de parametros, entrenada originalmente por NVIDIA sobre los corpus nvidia/Granary y nemo/asr-set-3.0. Soporta 25 idiomas europeos, entre ellos el castellano, y esta optimizada para ejecutarse en la Neural Engine (ANE) y la CPU de los chips Apple Silicon mediante Core ML.

Su relevancia actual radica en que traslada un modelo ASR de calidad de servidor a un formato on-device sin llamadas de red, lo que lo hace adecuado para aplicaciones de dictado, toma de notas y transcripcion por lotes en productos de escritorio y moviles de Apple. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano es de 2,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6B (aproximadamente 600 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio en lugar de texto) |
| Tipos de cuantizacion | Mixed precision optimizada para Core ML (ANE/CPU); no se detallan esquemas de cuantizacion por bits |
| Idiomas soportados | 25 idiomas europeos: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC-BY-4.0 segun los metadatos; el cuerpo de la model card original indica Apache 2.0 (discrepancia documentada por el espejo) |
| Formato de pesos | Core ML (artefactos .mlmodelc/.mlpackage); no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FastConformer combinada con un decodificador de tipo Transducer TDT (Token-and-Duration Transducer). El bloque FastConformer es una variante eficiente del Conformer que reduce el coste computacional de la atencion mediante downsizing de la secuencia, mientras que el cabezal TDT predice simultaneamente el token y su duracion, lo que acelera la decodificacion frente a un transducer convencional. El resultado es un unico modelo de 600 millones de parametros con deteccion de actividad de voz integrada y sin necesidad de modelos auxiliares de alineacion o puntuacion externa.

Los datos de entrenamiento declarados son los corpus nvidia/Granary y nemo/asr-set-3.0, sobre los que NVIDIA entreno el modelo base parakeet-tdt-0.6b-v3. No se especifican en la informacion disponible el numero exacto de horas de audio, la composicion detallada del dataset, ni si hubo fases de ajuste con RLHF o DPO (procedimientos poco habituales en ASR). La contribucion de este repositorio concreto es unicamente la conversion a Core ML, realizada por FluidInference con un script publico, junto con la capa de empaquetado para su uso en Apple Silicon. La entrada esperada es audio PCM mono a 16 kHz en Float32 en el rango [-1, 1].

## Capacidades

- Transcripcion de voz a texto multilingue en 25 idiomas europeos, incluido el castellano.
- Reconocimiento por lotes (batch) de ficheros de audio completos en macOS e iOS.
- Funcionamiento totalmente on-device en la Neural Engine y la CPU de Apple Silicon, sin llamadas de red una vez descargados los modelos.
- Baja latencia en modo batch: factor de tiempo real (RTF) de aproximadamente 110x en un M4 Pro (1 minuto de audio se transcribe en torno a 0,5 segundos).
- Integracion mediante el framework Swift FluidAudio, que gestiona la carga del modelo, el preprocesado de audio y la decodificacion.
- Deteccion de actividad de voz y puntuacion integradas en el propio modelo FastConformer-TDT.
- No se declara soporte de tool calling, function calling, agentes, vision ni audio de salida; es exclusivamente un modelo ASR.

## Casos de uso

- Dictado local en aplicaciones de macOS e iOS: el modelo transcribe voz a texto sin enviar audio a la nube, lo que permite cumplir requisitos estrictos de privacidad en herramientas de toma de notas.
- Transcripcion por lotes de reuniones y entrevistas: gracias al RTF de 110x en M4 Pro, un fichero de una hora se procesa en unos 30 segundos en local, sin coste de API.
- Subtitulado offline de contenido audiovisual: el soporte de 25 idiomas europeos permite generar subtitulos en varios idiomas sin depender de servicios externos.
- Asistentes de voz embebidos en apps iOS 17+: al integrarse con el framework FluidAudio, se puede incorporar reconocimiento continuo dentro de una aplicacion movil con procesamiento en el dispositivo.
- Herramientas de accesibilidad: transcripcion en tiempo real para personas con dificultades auditivas o para la generacion de transcripciones en aplicaciones de videollamada en Mac.
- Procesado de audio sensible (sanitario, legal, financiero): al no requerir red, el audio no sale del dispositivo, lo que facilita el cumplimiento de normativas de proteccion de datos.
- Investigacion en ASR multilingue: sirve como referencia de despliegue on-device de un modelo FastConformer-TDT en Core ML para comparar latencia y calidad frente a alternativas en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de error (WER/CER) en la informacion disponible. El unico dato de rendimiento declarado es el factor de tiempo real de la conversion a Core ML.

| Metrica | Valor | Contexto |
|---|---|---|
| Factor de tiempo real (RTF) | ~110x | M4 Pro, modo batch |
| Tiempo por minuto de audio | ~0,5 s | Derivado del RTF anterior |
| WER / CER por idioma | no disponible | no publicado en la informacion proporcionada |

## Requisitos de hardware

- No requiere VRAM de GPU dedicada (CUDA); se ejecuta en la Neural Engine y la CPU de Apple Silicon mediante Core ML.
- Plataformas soportadas: macOS 14 o superior (se recomienda Apple Silicon) e iOS 17 o superior.
- Dispositivos objetivo: Mac con chips M-series (M1 en adelante) e iPhone/iPad compatibles con iOS 17.
- No esta pensado para GPUs NVIDIA ni para despliegues en servidores con CUDA; no se ofrecen pesos GGUF ni safetensors para vLLM, llama.cpp u Ollama.
- Ruta de despliegue recomendada: framework Swift FluidAudio (gestiona carga, preprocesado y decodificacion) o uso directo de Core ML.
- Latencia y throughput: RTF de aproximadamente 110x en M4 Pro en modo batch; el rendimiento varia segun dispositivo, duracion del audio y unidades de computo (ANE/CPU).
- Espacio en disco: el repositorio ocupa 2,5 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3-coreml (este) | 0,6B | 25 europeos | Core ML | CC-BY-4.0 (metadatos) / Apache 2.0 (texto original) | Apple Silicon on-device |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B | 25 europeos | NeMo (.nemo) | CC-BY-4.0 | GPU NVIDIA (CUDA) |
| OpenAI Whisper large-v3 | no disponible en la informacion | multilingue amplio | safetensors / GGUF | MIT (segun la practica habitual; verificar) | GPU, CPU, multiples runtimes |
| Alternativas Core ML de ASR para Apple | no disponible | no disponible | Core ML | no disponible | macOS / iOS |

Los datos de parametros, idiomas y licencia de la fila de Whisper large-v3 y de la ultima fila no proceden de la informacion proporcionada y deben verificarse en sus repositorios oficiales antes de usarse como referencia.

## Limitaciones y advertencias

- Cobertura centrada en idiomas europeos; el rendimiento puede degradarse en idiomas no europeos, tal como reconoce la propia model card.
- Discrepancia de licencia: los metadatos declaran CC-BY-4.0, mientras que el cuerpo del texto original indica Apache 2.0. Conviene aclarar la licencia aplicable antes de un uso comercial.
- Al ser un espejo de terceros, no es el repositorio canonico: para uso en produccion es preferible referenciar la fuente original (nvidia/parakeet-tdt-0.6b-v3 y FluidInference/parakeet-tdt-0.6b-v3-coreml).
- Riesgo de errores de transcripcion (sustituciones, omisiones) inherente a todo modelo ASR; no se han publicado cifras de WER que permitan acotar el riesgo por idioma.
- Dependencia de la plataforma Apple: no es utilizable en Linux, Windows o servidores con GPU NVIDIA en su formato actual.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia publica de validacion por parte de la comunidad.
- No se detallan en la informacion disponible posibles sesgos acusticos (acentos, ruido de fondo, audio telefonico) ni el comportamiento con audio musical o solapamiento de hablantes.

## Enlaces

- Repositorio en HuggingFace (este espejo): https://huggingface.co/codeclawd/parakeet-tdt-0.6b-v3-coreml
- Modelo base original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversion Core ML original: FluidInference/parakeet-tdt-0.6b-v3-coreml (revision 7dd20fe6b1797d35f5e3307e8b1732d9a178edfe)
- Script de conversion: https://github.com/FluidInference/mobius/tree/main/models/stt/parakeet-tdt-v3-0.6b/coreml
- Benchmarks de FluidAudio: https://github.com/FluidInference/FluidAudio/blob/main/Documentation/Benchmarks.md#transcription
- Framework FluidAudio (Swift): https://github.com/FluidInference/FluidAudio
- Comunidad Discord de FluidInference: https://discord.gg/WNsvaCtmDe
