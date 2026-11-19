# giofolf/omnivox-lite

## Resumen

Omnivox Lite es un paquete de pesos del modelo Whisper `base` de OpenAI en formato GGML, publicado por el usuario giofolf como base del motor de dictado offline de un teclado Android de estilo Gboard. No se trata de un modelo entrenado desde cero ni de un ajuste fino: el autor distribuye el checkpoint `ggml-base.bin` sin modificar junto con los diccionarios de corrección locales que usa su aplicación, de modo que el pipeline completo de reconocimiento de voz en el dispositivo pueda reproducirse con una sola descarga.

El interés del artefacto es fundamentalmente práctico. Whisper `base` es un transformer encoder-decoder de aproximadamente 74 millones de parámetros con una ventana de audio fija de 30 segundos, y su versión GGML permite ejecución en CPU sin conexión a red mediante `whisper.cpp`. Eso lo hace adecuado para dictado en movilidad, donde la latencia y la privacidad importan más que la precisión bruta de modelos ASR de mayor tamaño.

La relevancia actual del paquete es limitada como modelo de propósito general, pero resulta útil como referencia reproducible de un despliegue ASR on-device: muestra cómo combinar un checkpoint estándar con corrección léxica en tiempo de ejecución para mejorar la salida en portugués de Brasil e inglés, los dos idiomas que ejercita el teclado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI) |
| Parametros totales | Aproximadamente 74 millones (variante `base` de Whisper) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (valor estandar de Whisper; no confirmado de forma explicita en la model card) |
| Tipos de cuantizacion | Pesos GGML en el fichero `ggml-base.bin`; la model card no detalla variantes adicionales |
| Idiomas soportados | Multilingue; portugues (pt-BR) e ingles son los idiomas ejercitados por el teclado |
| Licencia | MIT |
| Formato de pesos | GGML (`ggml-base.bin`, aproximadamente 141 MB) |

## Arquitectura y entrenamiento

El modelo subyacente es el checkpoint `base` multilingue de OpenAI Whisper, sin modificaciones. Whisper emplea una arquitectura transformer encoder-decoder que procesa espectrogramas Mel de audio de 16 kHz y genera texto de forma autorregresiva; la variante `base` es la segunda mÃ¡s pequeÃ±a de la familia y prioriza velocidad y huella de memoria reducida frente a las variantes `small`, `medium` y `large`. No se ha realizado entrenamiento adicional ni ajuste fino por parte del autor de este repositorio.

La adaptaciÃ³n al dominio se resuelve en tiempo de ejecuciÃ³n, no en los pesos. El paquete incluye tres recursos auxiliares: `common-words.txt` con palabras frecuentes, `pt-br-dictionary.txt` con un diccionario de frecuencias de portuguÃ©s de Brasil de unas 3000 palabras y `pt-br-lm.txt` con un modelo de lenguaje unigram/bigrama usado por el decodificador de deslizamiento del teclado. El corrector (`DictionaryCorrector.java` en el repositorio fuente) sustituye palabras ASR de baja confianza por candidatos del diccionario usando distancia de ediciÃ³n insensible a acentos. No se documentan datos de entrenamiento propios, proceso de RLHF/DPO ni innovaciones arquitectÃ³nicas mÃ¡s allÃ¡ del empaquetado.

## Capacidades

- Reconocimiento automÃ¡tico de voz (ASR) multilingÃ¼e sobre audio de 16 kHz en formato PCM.
- TranscripciÃ³n en inglÃ©s y portuguÃ©s de Brasil, con soporte teÃ³rico de otros idiomas de Whisper `base`.
- Funcionamiento completamente offline y on-device, sin llamadas de red ni dependencia de servicios de voz de terceros.
- IntegraciÃ³n en Android mediante `whisper.cpp` y JNI (`libwhisper.so`), con captura vÃa `AudioRecord`.
- CorrecciÃ³n lÃ©xica posterior a la transcripciÃ³n mediante diccionarios de frecuencias y distancia de ediciÃ³n insensible a acentos.
- DecodificaciÃ³n asistida por modelo de lenguaje local (unigram/bigrama) para la entrada por deslizamiento del teclado.
- No se documentan capacidades de tool calling, agentes, visiÃ³n, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Dictado offline en teclados Android: captura de audio con `AudioRecord`, conversiÃ³n a PCM de 16 kHz y transcripciÃ³n local vÃa JNI, sin enviar voz a servidores externos; adecuado por la huella reducida del modelo `base` en GGML.
- Aplicaciones de notas de voz con privacidad estricta: el pipeline completo corre en el dispositivo, lo que evita exponer grabaciones a servicios en la nube y simplifica el cumplimiento de requisitos de protecciÃ³n de datos.
- Subtitulado ligero de audio corto en inglÃ©s y portuguÃ©s: la ventana de 30 segundos por segmento encaja con clips breves y con la generaciÃ³n de borradores de transcripciÃ³n que luego se revisan manualmente.
- Asistentes de voz embebidos en dispositivos de gama media: al ejecutarse en CPU mediante `whisper.cpp`, no requiere GPU dedicada y puede integrarse en apps Android con recursos limitados.
- Preprocesado de comandos de voz para interfaces de accesibilidad: la transcripciÃ³n local con correcciÃ³n por diccionario permite mapear utterances cortas a acciones de la aplicaciÃ³n con baja latencia percibida.
- ReproducciÃ³n de pipelines ASR on-device en investigaciÃ³n: el paquete incluye pesos y recursos lÃ©xicos en una sola descarga, lo que facilita comparar el efecto de la correcciÃ³n por diccionario frente a la salida cruda de Whisper `base`.
- Prototipado de transcripciÃ³n en portuguÃ©s de Brasil con recursos limitados: el diccionario de frecuencias y el modelo unigram/bigrama incluidos sirven como punto de partida para experimentar con post-procesado lÃ©xico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el despliegue objetivo es CPU mediante `whisper.cpp`; el fichero de pesos ocupa aproximadamente 141 MB y el consumo de memoria en ejecuciÃ³n es del orden de unos cientos de MB, sin cifra oficial publicada.
- GPU recomendadas: no disponibles en la informacion proporcionada; el modelo estÃ¡ pensado para ejecuciÃ³n en CPU de dispositivos Android.
- Compatibilidad con GPU de consumo: al ser un modelo de aproximadamente 74 millones de parÃ¡metros en formato GGML, cabe holgadamente en cualquier GPU de consumo moderna, aunque no se documentan requisitos especÃficos.
- Opciones de despliegue: `whisper.cpp` (librerÃa declarada), integraciÃ³n JNI en Android; no se documentan integraciones con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Omnivox Lite (Whisper `base` GGML) | Aproximadamente 74 M | 30 s por segmento | Multilingue (pt, en ejercitados) | MIT | GGML |
| Whisper `tiny` (GGML) | Aproximadamente 39 M | 30 s por segmento | Multilingue | MIT | GGML |
| Whisper `small` (GGML) | Aproximadamente 244 M | 30 s por segmento | Multilingue | MIT | GGML |
| Whisper `base` original (OpenAI) | Aproximadamente 74 M | 30 s por segmento | Multilingue | MIT | PyTorch / safetensors |

La comparaciÃ³n se limita a variantes de la misma familia porque la informacion disponible no incluye modelos ASR alternativos con datos verificables. La diferencia prÃ¡ctica de Omnivox Lite frente al `base` original es el empaquetado con diccionarios de correcciÃ³n y el formato GGML listo para `whisper.cpp`; el rendimiento acÃºstico de los pesos es el del checkpoint estÃ¡ndar.

## Limitaciones y advertencias

- Los pesos son el checkpoint `base` sin modificar: no hay ajuste fino, por lo que la precisiÃ³n es la de Whisper `base`, inferior a la de variantes mayores como `small`, `medium` o `large`.
- El repositorio no incluye evaluaciÃ³n cuantitativa ni benchmarks; no es posible verificar mejoras de precisiÃ³n atribuibles a la correcciÃ³n por diccionario.
- La correcciÃ³n lÃ©xica puede introducir sustituciones errÃ³neas en nombres propios, terminologÃa tÃ©cnica o palabras fuera del diccionario de aproximadamente 3000 entradas de portuguÃ©s.
- El diccionario y el modelo de lenguaje incluidos estÃ¡n orientados a portuguÃ©s de Brasil; el soporte de otros idiomas depende del comportamiento multilingÃ¼e de Whisper `base` y no estÃ¡ validado por el autor.
- La ventana de audio de 30 segundos por segmento limita la transcripciÃ³n de audio largo a un procesamiento por fragmentos, con posible pÃ©rdida de contexto entre segmentos.
- Riesgo de alucinaciÃ³n inherente a los modelos Whisper en segmentos con silencio, ruido o audio musical; no se documentan mitigaciones especÃficas.
- No se documentan sesgos demogrÃ¡ficos o acÃºsticos medidos; los sesgos heredados de los datos de entrenamiento de Whisper no han sido evaluados en este paquete.
- La licencia MIT permite uso comercial, pero el autor remite al repositorio fuente para los avisos completos de OpenAI y Georgi Gerganov; conviene conservar las atribuciones correspondientes.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producciÃ³n ni mantenimiento continuado.

## Enlaces

- [Hugging Face: giofolf/omnivox-lite](https://huggingface.co/giofolf/omnivox-lite)
- [ggerganov/whisper.cpp](https://github.com/ggerganov/whisper.cpp)
- [OpenAI Whisper](https://github.com/openai/whisper)
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios del teclado o demos.
