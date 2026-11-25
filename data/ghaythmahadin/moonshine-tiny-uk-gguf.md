# GhaythMahadin/moonshine-tiny-uk-gguf

## Resumen

moonshine-tiny-uk-gguf es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny-uk, publicada por el usuario GhaythMahadin para su uso con la librería transcribe.cpp. El modelo subyacente es un ajuste fino de Moonshine tiny sobre ucraniano, desarrollado por Moonshine AI (anteriormente Useful Sensors), y mantiene la arquitectura encoder-decoder transformer original de 27 millones de parámetros.

La relevancia de esta ficha reside en su naturaleza de artefacto listo para despliegue: frente al modelo original en safetensors, esta versión ofrece pesos cuantizados en F32, F16 y Q8_0 con tamaños de 105 MB, 57 MB y 34 MB respectivamente, lo que permite ejecutar transcripción de voz en CPU, GPU integrada o dispositivos de borde sin depender de PyTorch. Es, por tanto, un modelo especializado y de nicho: un único idioma (ucraniano), salida únicamente de transcripción, sin detección de idioma, sin marcas de tiempo y sin traducción.

La licencia MIT heredada del modelo base facilita su integración en productos comerciales, aunque el rendimiento medido (18,83 % de WER en FLEURS-uk) lo sitúa como una opción de compromiso entre latencia y precisión, adecuada para casos de uso donde el tamaño y la velocidad priman sobre la exactitud absoluta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Moonshine tiny) con stem Conv1d de tres capas sobre PCM crudo a 16 kHz, sin STFT ni banco de filtros mel |
| Parametros totales | 27.092.736 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo ASR; la generación se limita por `max_length=192` en la configuración upstream) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Ucraniano (uk) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Moonshine tiny, un encoder-decoder transformer de 27 millones de parámetros que consume audio PCM crudo a 16 kHz a través de un stem de tres capas Conv1d. A diferencia de Whisper, prescinde de la transformada de Fourier de corto tiempo (STFT) y del banco de filtros mel, lo que reduce el preprocesamiento y el coste computacional en inferencia. La salida es únicamente texto transcrito, sin etiquetas de idioma ni marcas de tiempo.

El modelo base UsefulSensors/moonshine-tiny-uk es un ajuste fino de Moonshine tiny sobre ucraniano; la model card no detalla el volumen de tokens de audio, la composición del dataset de ajuste ni si se aplicaron técnicas de RLHF o DPO. La información disponible remite al paper de Moonshine (arXiv:2509.02523) para los detalles de entrenamiento y evaluación. Esta conversión GGUF se generó a partir del commit upstream 8cf70f4 (fijado el 2026-05-12) y se validó contra la referencia de Transformers en el commit 90bf720 de transcribe.cpp el 2026-05-12. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto en ucraniano a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio sin preprocesamiento mel: entrada directa de forma de onda mediante Conv1d.
- Decodificación greedy con `num_beams=1` y `max_length=192`, coherente con la configuración de generación upstream.
- Ejecución en CPU, GPU con Metal y GPU con Vulkan a través de transcribe.cpp.
- No soporta streaming (indicado como `streaming: false` en la model card).
- No soporta traducción (`translate: false`).
- No realiza detección de idioma (`lang_detect: false`).
- No genera marcas de tiempo (`timestamps: none`).
- No dispone de tool calling, function calling ni capacidades de agente.
- No procesa texto, imagen ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz en ucraniano: el modelo convierte grabaciones mono a 16 kHz en texto plano, adecuado para actas automáticas o indexación de audio en entornos donde el idioma de trabajo sea exclusivamente ucraniano.
- Subtitulado offline de contenido audiovisual ucraniano: dado que no genera marcas de tiempo, se usaría para producir el texto de los subtítulos y un alineador externo aportaría la sincronización.
- Dictado por voz en aplicaciones de escritorio: con 34 MB en Q8_0 y ejecución en CPU, puede integrarse en herramientas de dictado locales sin conexión ni GPU dedicada.
- Transcripción en dispositivos de borde: el tamaño reducido (34-57 MB) y el soporte de Vulkan y CPU permiten desplegarlo en mini-PC, Raspberry Pi o portátiles modestos para procesar audio de campo.
- Análisis de llamadas de atención al cliente en ucraniano: la transcripción por lotes de grabaciones telefónicas permite alimentar pipelines de análisis de sentimiento o búsqueda textual, siempre que se acepte un WER cercano al 19 %.
- Investigación lingüística y corpus de voz: útil para generar transcripciones preliminares de corpus ucranianos que luego se corrigen manualmente, aprovechando su velocidad (RTF de 45,5 en CPU Ryzen 4750U y 127 en Metal).
- Prototipado rápido de ASR multilingüe: sirve como componente ucraniano dentro de un sistema que enrute el audio por idioma antes de la transcripción, combinándolo con modelos de otros idiomas.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Referencia Transformers F32 |
|---|---:|---:|---:|---:|
| WER FLEURS-uk test (750 utterances) | 18,83 % | 18,82 % | 18,89 % | 18,86 % |
| Tamano del fichero | 105 MB | 57 MB | 34 MB | No disponible |
| RTF en Apple M4 Max (Metal) | 127 | No disponible | No disponible | No disponible |
| RTF en Apple M4 Max (CPU) | 153,5 | No disponible | No disponible | No disponible |
| RTF en Ryzen 4750U (Vulkan) | 56 | No disponible | No disponible | No disponible |
| RTF en Ryzen 4750U (CPU) | 45,5 | No disponible | No disponible | No disponible |

El WER se midió con la decodificación por defecto de transcribe.cpp (greedy, `num_beams=1`, `max_length=192`). La model card indica que las cifras F32 y F16 coinciden con la referencia de Transformers dentro del ruido del intervalo de confianza bootstrap, y que Q8_0 introduce una deriva adicional típicamente inferior a 0,1 puntos porcentuales respecto a F16. UsefulSensors no publica un WER por idioma para esta variante.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; el fichero más grande (F32) ocupa 105 MB, por lo que la huella en memoria es mínima.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon, probado en M4 Max) o Vulkan (probado en Ryzen 4750U con gráficos integrados); no requiere GPU dedicada de datacenter.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una GPU integrada; también funciona íntegramente en CPU.
- Opciones de despliegue: transcribe.cpp (librería nativa con CLI `transcribe-cli`); el modelo base es compatible con Hugging Face Transformers mediante `MoonshineForConditionalGeneration` y `AutoProcessor`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 127 en Metal (M4 Max) y 56 en Vulkan (Ryzen 4750U), lo que implica velocidades de transcripción muy superiores al tiempo real; en CPU, RTF de 153,5 en M4 Max y 45,5 en Ryzen 4750U. Un RTF superior a 1 indica que el modelo procesa audio más rápido de lo que dura.
- Preprocesamiento: el audio debe convertirse previamente a WAV mono a 16 kHz (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/entrada | WER FLEURS-uk | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| moonshine-tiny-uk-gguf | 27 M | Ucraniano | Audio PCM 16 kHz | 18,83 % (F32) | MIT | GGUF |
| Whisper tiny | 39 M | Multilingue (99 idiomas) | Audio 16 kHz con mel | No disponible en la informacion | MIT | Safetensors, GGUF (via terceros) |
| Whisper base | 74 M | Multilingue (99 idiomas) | Audio 16 kHz con mel | No disponible en la informacion | MIT | Safetensors, GGUF (via terceros) |
| Moonshine tiny (original, ingles) | 27 M | Ingles | Audio PCM 16 kHz | No aplica (otro idioma) | MIT | Safetensors |

La comparación con Whisper es la más directa por categoría (ASR de tamano reducido y licencia permisiva), pero la información disponible no incluye cifras de WER en ucraniano para Whisper tiny ni base, por lo que no se puede establecer una comparación cuantitativa fiable. La ventaja diferencial de Moonshine frente a Whisper es su menor coste de preprocesamiento (sin STFT ni mel) y su menor latencia, mientras que su desventaja es la especialización monolingüe de esta variante.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe ucraniano; no detecta idioma ni traduce, por lo que audio en otro idioma producirá salidas incorrectas o alucinaciones.
- WER de aproximadamente 18,8 % en FLEURS-uk: inadecuado para transcripción de precisión legal o médica sin revisión humana.
- Sin marcas de tiempo: no sirve por sí solo para subtitulado sincronizado ni para diarización.
- Sin soporte de streaming: debe procesarse el audio completo, lo que limita su uso en aplicaciones de voz en tiempo real.
- Riesgo de bucles de alucinación: la model card upstream recomienda limitar `max_length` en función de la duración del audio (factor de 8 tokens por segundo de audio) para mitigarlo.
- Sesgos: no se documentan sesgos específicos, pero al ser un ajuste fino sobre un único idioma, puede tener un rendimiento desigual entre variedades dialectales del ucraniano y acentos no nativos.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright; conviene verificar los términos del modelo base upstream.
- Artefacto de terceros: la conversión GGUF la publica GhaythMahadin, no el equipo de Moonshine AI; la validación numérica se realizó contra la referencia de Transformers, pero la responsabilidad del mantenimiento recae en el publicador de la conversión.
- Sin descargas ni interacciones registradas en el momento de la consulta: ecosistema de soporte muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GhaythMahadin/moonshine-tiny-uk-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-uk
- Commit upstream del modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-uk/commit/8cf70f4
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Paper de Moonshine: https://arxiv.org/abs/2509.02523
- Paper de model cards (Mitchell et al.): https://arxiv.org/abs/1810.03993
- Repositorio de Moonshine AI: https://github.com/usefulsensors/moonshine/blob/main/README.md
- Pesos F32: https://huggingface.co/handy-computer/moonshine-tiny-uk-gguf/resolve/main/moonshine-tiny-uk-F32.gguf
- Pesos F16: https://huggingface.co/handy-computer/moonshine-tiny-uk-gguf/resolve/main/moonshine-tiny-uk-F16.gguf
- Pesos Q8_0: https://huggingface.co/handy-computer/moonshine-tiny-uk-gguf/resolve/main/moonshine-tiny-uk-Q8_0.gguf
