# qvac/TranscribePsy-250M-EU-sub-coreml

## Resumen

TranscribePsy-250M-EU-sub-coreml es la variante Core ML del modelo de reconocimiento automático del habla TranscribePsy-250M-EU-sub, desarrollado por qvac (tether-ai-research). Está diseñada específicamente para ejecutarse en la Apple Neural Engine (ANE) de los dispositivos Apple, con todas las matrices de pesos cuantizadas en 6 bits mediante paletización (lookup-table), mientras que los tensores pequeños (sesgos y parámetros de normalización) permanecen en Float16. El modelo base es un sistema ASR compacto de 254M parámetros, destilado de Parakeet-TDT-0.6B-v3, que cubre las ocho lenguas europeas seleccionadas por Multilingual LibriSpeech (MLS): neerlandés, inglés, francés, alemán, italiano, polaco, portugués y español.

El problema que resuelve es la transcripción de voz multilingüe de alta precisión en dispositivos de borde (edge), sin necesidad de conexión a la nube ni de GPUs dedicadas. Su relevancia actual radica en que demuestra que un modelo ASR de calidad competitiva puede ejecutarse íntegramente en el Neural Engine de un iPhone, con un tamaño de 212,4 MB y un consumo de memoria pico de 333,4 MiB, superando en velocidad a alternativas como desert-ant-labs/voz en las pruebas publicadas por el autor.

La arquitectura subyacente es de tipo encoder-decoder (Parakeet-TDT), y esta variante Core ML procesa el audio en ventanas de tamaño fijo, ya que la ANE requiere formas de entrada fijas. El repositorio incluye tres artefactos: el GGUF con vocabulario, banco de filtros mel y pesos del decoder (17,3 MB), el encoder en formato `.mlmodelc` (187,4 MB) y el decoder en formato `.mlmodelc` (7,6 MB). El modelo se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (Parakeet-TDT), variante Core ML para Apple Neural Engine |
| Parámetros totales | 14.634.134 (según safetensors del repo); el modelo base se describe como 254M parámetros |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio en ventanas de tamaño fijo; duración exacta no especificada) |
| Tipos de cuantización | 6-bit palettized (lookup-table) en matrices de pesos; Float16 en sesgos y parámetros de normalización |
| Idiomas soportados | nl, en, fr, de, it, pl, pt, es (8 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlmodelc`) para encoder y decoder; GGUF para vocabulario, mel filterbank y pesos del decoder |

## Arquitectura y entrenamiento

El modelo base TranscribePsy-250M-EU-sub es un sistema ASR de tipo encoder-decoder basado en la arquitectura Parakeet-TDT, destilado del modelo Parakeet-TDT-0.6B-v3. Está entrenado para cubrir las ocho lenguas de Multilingual LibriSpeech, concentrando el presupuesto de parámetros en menos idiomas para maximizar la precisión en los mismos. La model card del modelo base remite a dicha ficha para los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO), que no se especifican en la información disponible para esta variante.

La innovación técnica principal de esta variante Core ML es la cuantización por paletización de 6 bits de todas las matrices de pesos, incluida la proyección de salida conjunta del decoder, manteniendo solo tensores pequeños en Float16. Además, el motor `parakeet.cpp` (en la versión parcheada de qvac-fabric-speech.cpp) incorpora un decoder Core ML por lotes (batched) que permite que tanto el encoder como el decoder se ejecuten en el Neural Engine. El modelo procesa el audio en ventanas de tamaño fijo con padding para utterances cortas, lo que aprovecha mejor el rendimiento sostenido en grabaciones largas. Los parches están siendo enviados upstream como pull request.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe en ocho lenguas europeas: neerlandés, inglés, francés, alemán, italiano, polaco, portugués y español.
- Transcripción de audio a texto con un único conjunto de pesos para todos los idiomas, sin necesidad de seleccionar idioma.
- Ejecución íntegra en el Apple Neural Engine (encoder y decoder), sin intervención de CPU para el cómputo principal.
- Procesamiento por lotes (batched) del decoder para mejorar el throughput en grabaciones largas.
- Entrada de audio en formato WAV, 16 kHz mono.
- Cuantización agresiva (6-bit palettized) que reduce el tamaño a 212,4 MB manteniendo la precisión.
- No se especifican capacidades de tool calling, agentes, visión, audio más allá de ASR, ni modo de razonamiento (thinking mode).

## Casos de uso

- Transcripción de reuniones y notas de voz en dispositivos Apple: el modelo puede transcribir grabaciones de 10 minutos en 1,65 segundos (sin contar el arranque en frío) en un iPhone 17 Pro Max, lo que lo hace adecuado para apps de notas que transcriben localmente sin enviar audio a la nube.
- Subtitulado automático en tiempo real de contenido multimedia: con una latencia media de 207,3 ms por utterance en el conjunto de 160 utterances, puede alimentar pipelines de generación de subtítulos para vídeo o pódcast en ocho idiomas europeos.
- Asistentes de voz on-device para aplicaciones de accesibilidad: al ejecutarse en el Neural Engine con 333,4 MiB de memoria pico, puede integrarse en apps de dictado o lectura de texto para usuarios con discapacidad visual o motriz, sin depender de conectividad.
- Transcripción de llamadas de atención al cliente en el dispositivo: el soporte de ocho idiomas europeos y el procesamiento por lotes permiten transcribir conversaciones multi-turno localmente, cumpliendo requisitos de privacidad y RGPD al no enviar audio a servidores externos.
- Digitalización de archivos de audio históricos o entrevistas: el modelo puede procesar grabaciones largas de forma eficiente (40 minutos de audio en 32,8 segundos en el conjunto de prueba), lo que facilita la transcripción masiva de archivos de audio en proyectos de investigación.
- Integración en apps de transcripción para periodistas y estudiantes: el tamaño compacto (212,4 MB) y la licencia Apache 2.0 permiten empaquetar el modelo dentro de una app iOS/macOS sin costes de licencia, ofreciendo transcripción multilingüe offline.
- Preprocesamiento de audio para pipelines de NLP: la salida de texto transcrito puede alimentar modelos de resumen o búsqueda semántica en aplicaciones de análisis de contenido, aprovechando la velocidad de transcripción en el dispositivo.

## Benchmarks y rendimiento

Los datos de rendimiento publicados en la model card comparan TranscribePsy-250M-EU-sub-coreml con desert-ant-labs/voz en un iPhone 17 Pro Max con Core ML. No se han publicado resultados de benchmarks de precisión (WER, MMLU, etc.) en la información disponible para esta variante; la model card remite al modelo base para los datos de precisión.

| Métrica | TranscribePsy-250M-EU-sub-coreml | desert-ant-labs/voz |
|---|---|---|
| Transcripción de 40 min (160 utterances, sin arranque en frío) | 32,8 s | 39,9 s |
| Arranque en frío | 12,4 s | 18,6 s |
| Latencia media por utterance | 207,3 ms | 253,4 ms |
| Tamaño del modelo | 212,4 MB | 488,8 MB |
| Transcripción de audio de 10 min (sin arranque en frío) | 1,65 s | 2,34 s |
| Arranque en frío (10 min) | 12,7 s | 18,4 s |
| Memoria pico | 333,4 MiB | 570 MiB |

Nota: el arranque en frío incluye la compilación única del modelo Core ML que Apple realiza la primera vez que se carga en un dispositivo; se paga una sola vez, no en cada lanzamiento.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en el Neural Engine de Apple con una memoria pico de 333,4 MiB en la prueba de 10 minutos.
- GPU recomendadas: Apple Neural Engine (ANE) presente en chips Apple Silicon (serie A y M). La prueba publicada se realizó en un iPhone 17 Pro Max.
- ¿Cabe en GPU de consumo? No aplica para GPU NVIDIA/AMD; está diseñado exclusivamente para el ecosistema Apple (ANE). Para CPU, existe la variante GGUF del modelo base.
- Opciones de despliegue: motor `parakeet.cpp` parcheado de qvac-fabric-speech.cpp, compilado con `-DPARAKEET_COREML=ON`. No es compatible con el motor upstream `parakeet.cpp` sin parchear. Se invoca desde Objective-C++ (`.mm`) mediante la API `parakeet::Engine`.
- Latencia y throughput: 207,3 ms de latencia media por utterance; 1,65 s para 10 minutos de audio; 32,8 s para 40 minutos de audio (160 utterances). Arranque en frío de 12,4-12,7 s (incluye compilación Core ML).

## Comparativa con modelos similares

| Modelo | Idiomas | Formato | Tamaño | Licencia | Uso recomendado |
|---|---|---|---|---|---|
| TranscribePsy-250M-EU | 25 | PyTorch | No disponible | Apache 2.0 | Cobertura amplia de lenguas europeas |
| TranscribePsy-250M-EU-sub | 8 | PyTorch | No disponible | Apache 2.0 | Ocho lenguas MLS con el menor error |
| TranscribePsy-250M-EU-sub-gguf | 8 | GGUF (Q8_0) | No disponible | Apache 2.0 | Despliegue on-device con motor qvac-fabric-speech.cpp |
| **TranscribePsy-250M-EU-sub-coreml** (este) | 8 | Core ML | 212,4 MB | Apache 2.0 | Despliegue en Apple Neural Engine |
| desert-ant-labs/voz | No disponible | No disponible | 488,8 MB | No disponible | Alternativa comparada en benchmarks de velocidad |

No se dispone de datos de benchmarks de precisión para comparar con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para el Apple Neural Engine; no funciona en GPU NVIDIA/AMD ni en CPU sin la variante GGUF correspondiente.
- El GGUF incluido en este repositorio no contiene los pesos del encoder y no puede cargarse con el motor upstream `parakeet.cpp`; requiere el motor parcheado con `-DPARAKEET_COREML=ON`.
- La ANE requiere formas de entrada fijas, por lo que el modelo procesa el audio en ventanas de tamaño fijo y rellena (padding) cada utterance corta hasta una ventana completa; esto puede penalizar la eficiencia en clips muy cortos.
- El arranque en frío incluye la compilación Core ML (12,4-12,7 s), que se paga una sola vez por dispositivo pero puede afectar a la primera ejecución.
- Cobertura limitada a ocho lenguas europeas (nl, en, fr, de, it, pl, pt, es); no cubre otras lenguas.
- No se han publicado datos de sesgos, riesgo de alucinación o precisión (WER) en la información disponible para esta variante; se remite al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.
- El modelo base tiene 254M parámetros según su model card, mientras que el dato de safetensors del repo indica 14.634.134 parámetros; esta discrepancia no está explicada en la información disponible.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-coreml
- Modelo base: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub
- Variante GGUF: https://huggingface.co/qvac/TranscribePsy-250M-EU-sub-gguf
- Variante PyTorch (25 idiomas): https://huggingface.co/qvac/TranscribePsy-250M-EU
- Repositorio del motor parcheado: https://github.com/tether-ai-research/qvac-transcribePsy
- Motor qvac-fabric-speech.cpp (parakeet): https://github.com/tetherto/qvac-fabric-speech.cpp/tree/master/engines/parakeet
- Repositorio GitHub del proyecto: https://github.com/tether-ai-research/qvac-transcribepsy
- Modelo de comparación: https://huggingface.co/desert-ant-labs/voz
- Paper referenciado (arXiv): arxiv:2610.19134 (no se dispone de URL directa en la información proporcionada)
