# agentory/phonon-31m-en

## Resumen

phonon-31m-en es un modelo de síntesis de voz (text-to-speech) de la familia Phonon, desarrollado por Gradium. Convierte texto en audio mono a 24 kHz en inglés y su rasgo diferencial es el tamaño: la model card declara 31 millones de parámetros (excluyendo el tokenizador de audio), mientras que el fichero `safetensors` del repositorio suma 41.096.035 parámetros en total, presumiblemente incluyendo los componentes del códec Mimi. El repositorio ocupa 0,2 GB y los pesos cuantizados a 8 bits pesan 64,5 MB, lo que permite ejecutarlo en la CPU de un portátil, en un navegador o en un teléfono.

La arquitectura es un transformer de *flow matching* que predice latentes de audio trama a trama (80 ms por trama) y delega la reconstrucción de la onda en el decodificador del códec Mimi de Kyutai; el modelo se apoya en el trabajo previo Pocket TTS. Al ser generativo por tramas, puede emitir audio en *streaming*: el primer fragmento se reproduce mientras el resto se sigue generando, algo crítico para asistentes de voz interactivos y para aplicaciones de accesibilidad.

Su relevancia ahora es la combinación de licencia Apache 2.0, huella mínima (menos de 100 MB cuantizado) y despliegue multiplataforma real: runtime en Python (`ptts`), paquete WASM para navegador, Core ML para iOS/macOS, Android y un *preview* para NPU Snapdragon. Frente a la generación anterior de TTS neurales, que exigía GPU, aquí el coste de infraestructura prácticamente desaparece. Conviene señalar que el identificador del repositorio en HuggingFace es `agentory/phonon-31m-en`, mientras que la model card y las referencias externas apuntan a `gradium/phonon-31m-en`; los datos técnicos coinciden, pero la disponibilidad en el espacio de nombres `agentory` muestra 0 descargas y 0 *likes* en la fecha de creación (28 de octubre de 2026).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de *flow matching* que predice latentes de audio + decodificador del códec Mimi (Kyutai); base: Pocket TTS |
| Parámetros totales | 31 M declarados (excluyendo el tokenizador de audio); 41.096.035 en los pesos `safetensors` del repositorio |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; generación autoregresiva por tramas de 80 ms, sin ventana de contexto publicada |
| Tipos de cuantización | q8 (GGUF, 64,5 MB); `safetensors` en precisión original (no se especifica bf16/fp32); otras cuantizaciones no disponibles |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` y GGUF (`model.q8.gguf`) |
| Frecuencia de muestreo de salida | 24 kHz, mono |
| Trama de audio | 80 ms por paso de generación |
| Repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de *flow matching* que, condicionado por el texto y por latentes de hablante (*speaker latents*), predice los latentes acústicos del códec Mimi una trama de 80 ms cada vez; el decodificador de Mimi convierte esos latentes en audio PCM a 24 kHz. Este esquema permite dos modos: generación completa del fichero o *streaming*, en el que los fragmentos se entregan al consumidor mientras el modelo sigue prediciendo. La voz se selecciona pasando latentes de hablante extraídos de un `safetensors` del repositorio `gradium/phonon-voices` (por ejemplo, la voz Easton, con latentes de forma `(num_frames, 512)`), o bien usando el `default-voice.safetensors` incluido en este repositorio.

No se han publicado en la información disponible detalles sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni la receta de destilación o cuantización. La model card sí documenta una diferencia funcional relevante entre runtimes: el runtime `ptts` normaliza el texto (números, importes, símbolos, fechas, direcciones) según el parámetro `lang`, mientras que el tokenizador de la implementación de Transformers no realiza esa expansión, por lo que los textos largos deben trocearse con `processor.split_text`. Los pesos se distribuyen en q8 GGUF para el runtime propio y en `safetensors` para la clase `GradiumPhononTTSForConditionalGeneration`.

## Capacidades

- Síntesis de voz en inglés a partir de texto, con salida mono a 24 kHz.
- Generación en *streaming*: entrega de fragmentos PCM (`float32`) mientras el resto del audio se sigue generando, lo que reduce el tiempo hasta el primer sonido.
- Selección de voz mediante latentes de hablante preentrenados (repositorio `gradium/phonon-voices`) o voz por defecto incluida en el repositorio.
- Normalización de texto dependiente del idioma en el runtime `ptts` (números, símbolos, fechas, importes, direcciones).
- Troceado de textos largos en la ruta de Transformers mediante `processor.split_text`.
- Ejecución *on-device*: CPU de portátil, navegador (WASM), iOS/iPadOS/macOS vía Core ML, Android y *preview* para NPU Snapdragon (QNN).
- Compatibilidad con endpoints (`endpoints_compatible`) y con la API de `transformers`.
- No dispone de *tool calling*, razonamiento multi-paso, visión ni audio de entrada como transcriptor: es exclusivamente un modelo de texto a audio.
- Multilingüismo: no en este modelo; la familia cubre francés, alemán, español y portugués únicamente en las variantes de 40 M con licencia CC BY-NC 4.0.

## Casos de uso

- **Lectura de notificaciones y contenido en apps móviles**: con 64,5 MB en q8 y soporte Core ML/Android, el modelo puede embeberse en la app y sintetizar avisos sin conexión ni coste por petición; la salida a 24 kHz es suficiente para voz hablada en auricular.
- **Accesibilidad y lectores de pantalla**: el *streaming* por tramas de 80 ms permite empezar a reproducir antes de tener la frase completa, lo que reduce la latencia percibida al navegar por menús o listas largas; la licencia Apache 2.0 elimina fricción para distribuir la app.
- **Asistentes de voz e IVR de baja latencia**: con un tiempo hasta el primer audio del orden de milisegundos en CPU (dato atribuido a Gradium, ver benchmarks), encaja en pipelines de atención telefónica donde el turno de palabra debe empezar casi inmediatamente.
- **Generación de audio para e-learning y audiolibros técnicos**: usando `processor.split_text` para trocear capítulos y el runtime `ptts` para expandir números y fechas, se puede pregenerar audio por lotes en CPU sin GPU dedicada.
- **Prototipado de videojuegos y experiencias interactivas**: el paquete npm `phonon-tts` (WASM) permite síntesis en el navegador o en un motor web sin backend; útil para diálogos de NPC y *feedback* de interfaz en inglés.
- **Previsualización de guiones y *dubbing* de borrador**: sustituir la locución provisional en revisiones de vídeo o podcasts antes de contratar voz humana, con coste computacional despreciable en un portátil.
- **Generación de datos sintéticos para ASR**: producir corpus en inglés con voces controladas para aumentar el conjunto de entrenamiento de un transcriptor, dado que el modelo es pequeño y se puede ejecutar en paralelo en muchas CPUs.
- **Dispositivos sin conectividad (IoT, kioscos, electrodomésticos)**: la huella inferior a 100 MB permite incluir el modelo en firmware con almacenamiento limitado y funcionar en local, evitando enviar texto a la nube.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| WER en inglés | 1,70 % | Frases difíciles en inglés, según la nota de MarkTechPost (22/10/2026); no se detalla el corpus de evaluación |
| Latencia hasta el primer audio | ~7 ms en CPU de portátil | Cifra atribuida a Gradium por LLM Reference; no verificada de forma independiente |
| MMLU / HumanEval / GSM8K | no aplica | Es un modelo de texto a voz, no un LLM |
| Comparación con otros TTS | no disponible | No se han publicado resultados comparativos en la información disponible |

No se han publicado resultados de benchmarks adicionales (MOS, SIM, RTF, robustez multilingüe) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB en cualquier configuración. Pesos q8 de 64,5 MB; los 41,1 M de parámetros en `safetensors` a 32 bits ocuparían unos 165 MB, más los latentes de voz y el estado del decodificador Mimi.
- **GPU**: no requiere GPU. Funciona en CPU de portátil; cualquier GPU consumer (RTX 3060/4060 o superior) sirve para servir muchas peticiones en paralelo, sin que se hayan publicado cifras de *throughput*.
- **¿Cabe en GPU consumer?**: sí, con enorme margen; también en Raspberry Pi y dispositivos móviles de gama media según la model card ("un teléfono, un portátil, una pestaña del navegador").
- **Aceleradores específicos**: Core ML en iOS/iPadOS/macOS; *preview* de QNN para NPU Snapdragon en Android.
- **Opciones de despliegue**: `ptts` (PyPI, CLI y API Python), binario independiente desde GitHub Releases o Homebrew, `phonon-tts` en npm para navegador (WASM), integración nativa en apps Android y Apple, y `transformers` con `GradiumPhononTTSForConditionalGeneration`. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama: el GGUF es un formato propio del runtime, no un GGUF estándar de llama.cpp.
- **Latencia y throughput**: latencia hasta el primer audio de ~7 ms en CPU de portátil (dato de terceros); el resto de métricas de *throughput* (RTF, peticiones por segundo) no está disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Pesos q8 | Rendimiento publicado |
|---|---|---|---|---|---|
| phonon-31m-en | 31 M (41,1 M en `safetensors`) | inglés | Apache 2.0 | 64,5 MB | WER 1,70 % en frases difíciles; ~7 ms hasta el primer audio |
| phonon-40m-en | 40 M | inglés | CC BY-NC 4.0 | 74,6 MB | no disponible |
| phonon-40m-multilingual | 40 M | en, fr, de, es, pt | CC BY-NC 4.0 | 74,6 MB | no disponible |
| Kokoro-82M (referencia externa) | 82 M | inglés y otros | Apache 2.0 | depende del export | no disponible en esta ficha |
| Piper (referencia externa) | decenas de millones por voz | múltiple, una voz por modelo | MIT | depende del export | no disponible en esta ficha |

La comparación relevante dentro de la familia es clara: `phonon-31m-en` es la única variante con licencia Apache 2.0, mientras que las versiones de 40 M —incluidas las de francés, alemán, español y portugués— usan CC BY-NC 4.0, lo que restringe el uso comercial. Frente a Kokoro-82M y Piper, el dato diferencial verificable es el tamaño (31 M frente a 82 M) y el ecosistema de runtimes nativos (WASM, Core ML, QNN); no hay datos públicos que permitan comparar calidad o WER entre ellos en la información disponible.

## Limitaciones y advertencias

- **Solo inglés**: el modelo no sintetiza español ni otros idiomas; las alternativas en español de la familia (`phonon-40m-es`) están bajo CC BY-NC 4.0, incompatible con uso comercial.
- **Riesgo de alucinación en la lectura**: como todo TTS neurálgico, puede omitir, repetir o deformar palabras en entradas atípicas (siglas, URLs, secuencias alfanuméricas). El WER del 1,70 % corresponde a un conjunto de frases difíciles no especificado.
- **Normalización dependiente del runtime**: si se usa la ruta de Transformers en lugar de `ptts`, el tokenizador no expande números, importes, símbolos ni direcciones, lo que puede producir lecturas incorrectas en producción. Hay que trocear manualmente con `processor.split_text`.
- **Sin datos de sesgos ni evaluación de robustez**: no se han publicado análisis de sesgo por acento, género o variedad dialectal, ni evaluaciones de fidelidad de voz (MOS/SIM).
- **Discrepancia de identificadores**: la model card y los enlaces apuntan a `gradium/phonon-31m-en`, pero este repositorio es `agentory/phonon-31m-en`, con 0 descargas y 0 *likes*. Conviene verificar la procedencia y el contenido antes de integrarlo en un pipeline.
- **Discrepancia de tamaño en listados de terceros**: un índice externo (local-ai-zone) reporta 4,13 GB para el GGUF, muy lejos de los 64,5 MB de la model card; el dato no está verificado y probablemente sea un error del índice.
- **GGUF no estándar**: el fichero `model.q8.gguf` está pensado para el runtime `ptts`/`xn-ptts`, no para llama.cpp, Ollama ni vLLM. No se puede reutilizar con el tooling habitual de GGUF.
- **Licencia de las voces**: el código y los pesos son Apache 2.0, pero los latentes de voz se distribuyen en el repositorio aparte `gradium/phonon-voices`, cuyos términos no se detallan en la información disponible; hay que revisarlos antes de un uso comercial.
- **Model card truncada**: la información proporcionada corta la sección de plataformas (Android/QNN), por lo que pueden existir detalles de despliegue no recogidos aquí.
- **Madurez**: 0 descargas y publicación reciente (28 de octubre de 2026) implican poca validación comunitaria; para producción conviene fijar la revisión del repositorio y hacer una evaluación propia de WER sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace (identificador de esta ficha): https://huggingface.co/agentory/phonon-31m-en
- Modelo en HuggingFace (identificador referenciado en la model card): https://huggingface.co/gradium/phonon-31m-en
- Árbol de ficheros del repositorio: https://huggingface.co/gradium/phonon-31m-en/tree/main
- Demo en el navegador (Space): https://huggingface.co/spaces/gradium/phonon
- Colección de la familia Phonon: https://huggingface.co/collections/gradium/phonon
- Repositorio de voces: https://huggingface.co/gradium/phonon-voices
- Runtime en GitHub (xn-ptts): https://github.com/gradium-ai/xn-ptts
- Paquete Python en PyPI: https://pypi.org/project/ptts/
- Paquete de navegador en npm: https://www.npmjs.com/package/phonon-tts
- Guía de Python: https://github.com/gradium-ai/xn-ptts/blob/main/ptts-pyo3/README.md
- Guía de navegador (WASM): https://github.com/gradium-ai/xn-ptts/blob/main/ptts-wasm/js/README.md
- Guía de Swift / Core ML: https://github.com/gradium-ai/xn-ptts/blob/main/ios/PhononTTS/README.md
- Guía de Android: https://github.com/gradium-ai/xn-ptts/blob/main/android/README.md
- *Preview* para NPU Snapdragon (QNN): https://github.com/gradium-ai/xn-ptts/blob/main/qnn/android
- *Releases* del binario `ptts`: https://github.com/gradium-ai/xn-ptts/releases
- Documentación de Transformers (`GradiumPhononTTS`): https://huggingface.co/docs/transformers/main/en/model_doc/gradium_phonon_tts
- Pocket TTS (Kyutai), base del modelo: https://github.com/kyutai-labs/pocket-tts
- Comunidad en Discord: https://discord.gg/T85yt8kD33
- Nota de MarkTechPost: https://www.marktechpost.com/2026/10/22/gradium-phonon-31m-on-device-tts/
- Ficha en LLM Reference: https://www.llmreference.com/model/phonon-31m
- Listado en local-ai-zone: https://local-ai-zone.github.io/models/phonon-31m-en.html
