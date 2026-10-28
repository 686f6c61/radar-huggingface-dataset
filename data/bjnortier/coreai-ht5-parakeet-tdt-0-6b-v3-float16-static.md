# bjnortier/coreai-ht5-parakeet-tdt-0.6b-v3-float16-static

## Resumen

`bjnortier/coreai-ht5-parakeet-tdt-0.6b-v3-float16-static` es una exportación del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3` al formato Core AI de Apple, publicada por el desarrollador bjnortier. No contiene pesos PyTorch ni GGUF, sino un archivo ZIP de ~1,16 GB con assets `.aimodel` que se ejecutan exclusivamente a través del runtime Core AI de Apple en macOS 27 / iOS 27 o posterior, sobre silicio de Apple. Es, por tanto, un artefacto de despliegue on-device, no un checkpoint reentrenable.

El modelo subyacente es un transducer TDT (token-and-duration transducer) de 0,6 mil millones de parámetros con encoder FastConformer, red de predicción LSTM y red conjunta, capaz de transcribir audio en 25 idiomas europeos (incluido el español) con entrada de 16 kHz mono float32. La exportación fija precisión float16 y un encoder de forma estática, de modo que un único grafo especializado se reutiliza para todas las longitudes de entrada, evitando la reespecialización dinámica en cada arranque del proceso.

Su relevancia es práctica: es la copia exacta que descarga Hello Transcribe 5.1 y posteriores, anclada por commit, y permite a desarrolladores de apps macOS/iOS integrar transcripción local sin depender de servicios en la nube. La licencia es CC-BY-4.0, heredada del modelo original de NVIDIA, y el repositorio no modifica nada del contenido salvo el nombre de la carpeta de nivel superior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (token-and-duration transducer): encoder FastConformer + red de predicción LSTM de un paso + red conjunta |
| Parámetros totales | 0,6 B (según denominación del modelo base `nvidia/parakeet-tdt-0.6b-v3`) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo ASR); entrada de audio a 16 kHz mono float32, encoder de forma estática; límite máximo de audio no documentado en la información disponible |
| Tipos de cuantización | float16 (única precisión publicada en este repositorio); no se ofrecen variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | 25: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | CC-BY-4.0 (la del modelo fuente) |
| Formato de pesos | `.aimodel` (Apple Core AI) dentro de `ht5-parakeet-tdt-0.6b-v3_float16_static.zip` (~1,16 GB); no es safetensors, GGUF ni PyTorch |

Configuración adicional declarada en la model card: 128 bins mel, subsampling 8x, vocabulario de 8193 tokens (blank en 8192), duraciones posibles `[0, 1, 2, 3, 4]`, máximo de 10 símbolos por paso de decodificación. El bundle incluye `metadata.json`, `..._encoder.aimodel`, `..._decoder_step.aimodel`, `..._joint.aimodel` y un directorio `processor/` con el tokenizador.

## Arquitectura y entrenamiento

La arquitectura es un transducer TDT, una variante de RNN-Transducer en la que el modelo predice conjuntamente el token y su duración. El encoder es un FastConformer (Conformer con subsampling agresivo, aquí 8x) que convierte el audio de 16 kHz en representaciones de alta frecuencia de fotogramas reducida; la red de predicción es una LSTM que se evalúa en un solo paso (`decoder_step`) y se realimenta con el token anterior; la red conjunta combina ambas salidas para producir la distribución sobre vocabulario y duraciones. Gracias a la predicción de duración, el decodificador avanza varios fotogramas por emisión, lo que reduce el número de pasos frente a un transducer clásico.

La exportación no incluye información sobre datos de entrenamiento, número de tokens, composición del corpus ni si hubo RLHF o ajuste por DPO: la model card remite explícitamente a la [model card upstream de NVIDIA](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3) para datos de entrenamiento, resultados de evaluación y uso previsto. La innovación técnica destacable de este repositorio es de serialización, no de modelado: el encoder se exporta con forma estática, de modo que no se reespecializa el grafo para cada nueva longitud de audio, un coste que en la variante dinámica se pagaría en cada lanzamiento del proceso.

## Capacidades

- Reconocimiento automático del habla en 25 idiomas europeos, con locale configurable en la API (`Locale(identifier: "en_US")` en el ejemplo de CirceKit).
- Decodificación TDT con predicción de duración por token (valores 0 a 4), lo que permite avanzar varios fotogramas por emisión y acotar el número de pasos.
- Procesamiento de audio a 16 kHz mono float32 como único formato de entrada documentado.
- Salida de texto plano; la API `CoreAISpeech` devuelve además un objeto de estadísticas junto al texto.
- Ejecución completamente on-device sobre silicio de Apple mediante el runtime Core AI.
- Integración en Swift a través de CirceKit (`CirceFileTranscriber`) o directamente con `SpeechRecognitionModel` de `apple/coreai-models`.
- No soporta tool calling ni function calling, no implementa comportamiento de agente ni razonamiento multi-paso, no procesa visión ni audio más allá del ASR, no traduce y no realiza diarización de hablantes (no documentado).

## Casos de uso

- Transcripción local en apps de notas para macOS/iOS: el bundle se carga con `CirceFileTranscriber` y procesa el archivo de audio sin salir del dispositivo, lo que elimina el coste de servidor y la exposición de datos a terceros.
- Dictado y subtitulado en herramientas de productividad: al ejecutarse sobre el runtime Core AI en silicio de Apple, puede invocarse desde la propia app sin depender de conectividad de red.
- Cumplimiento normativo en sectores regulados (sanidad, legal, recursos humanos): al no enviar audio a la nube, el tratamiento encaja mejor con requisitos de minimización y residencia de datos, siempre que se documente el uso del modelo.
- Reuniones y entrevistas multilingües: los 25 idiomas cubiertos, incluidos español, francés, alemán, italiano y portugués, permiten fijar el locale adecuado por sesión y transcribir contenido en la lengua del interlocutor.
- Archivado y búsqueda de material audiovisual: transcripción por lotes de ficheros pregrabados en un equipo Apple para indexar audio de podcasts, clases o entrevistas periodísticas.
- Accesibilidad: generación de subtítulos para contenido pregrabado dentro de una app de vídeo o de formación, ejecutando el modelo en el propio dispositivo del usuario.
- Distribución como dependencia de app: el repositorio está anclado por commit y es la copia que Hello Transcribe 5.1+ descarga, lo que sirve como referencia de empaquetado reproducible para otras apps que necesiten el mismo bundle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio no incluye métricas de WER, latencia ni throughput, y remite a la model card del modelo upstream de NVIDIA para los resultados de evaluación. No se dispone de datos de RTF (real-time factor) para esta exportación float16 estática.

## Requisitos de hardware

- Plataforma obligatoria: silicio de Apple con runtime Core AI; el repositorio indica macOS 27 / iOS 27 o posterior. No hay soporte para CUDA ni para GPU NVIDIA.
- Memoria unificada estimada: en torno a 1,2 GB solo para los pesos en float16, a partir del tamaño del ZIP (~1,16 GB); hay que sumar el overhead del runtime, del tokenizador y de los buffers de audio, no cuantificado en la información disponible.
- GPU recomendadas: no aplica en el sentido habitual; el modelo está pensado para ejecutarse en el SoC Apple (CPU/GPU/Neural Engine según la asignación que haga Core AI), no en A100/H100/RTX 4090.
- Cabe en hardware de consumo Apple: sí, por el rango de memoria indicado, aunque no se especifican los modelos mínimos de iPhone, iPad o Mac compatibles.
- Opciones de despliegue: exclusivamente Core AI. Vías documentadas: CirceKit (`CirceFileTranscriber` con `backend: .coreAI(.bundle(bundleURL))`) y `CoreAISpeech` de `apple/coreai-models` (`SpeechRecognitionModel(resourcesAt:)`). No es compatible con vLLM, llama.cpp, Ollama, TGI, `transformers` ni NeMo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`bjnortier/coreai-ht5-parakeet-tdt-0.6b-v3-float16-static`) | 0,6 B | 25 | `.aimodel`, Core AI (macOS/iOS 27+) | CC-BY-4.0 | HuggingFace, repo de 1,2 GB |
| `nvidia/parakeet-tdt-0.6b-v3` (upstream) | 0,6 B | 25 | PyTorch / NeMo | CC-BY-4.0 | HuggingFace (modelo base) |
| `openai/whisper-large-v3` | 1,55 B | ~99 (no verificado en esta búsqueda) | PyTorch, `transformers`, whisper.cpp, faster-whisper | MIT (según el repositorio de OpenAI) | HuggingFace |
| `openai/whisper-small` | 244 M | ~99 (no verificado en esta búsqueda) | PyTorch, `transformers`, whisper.cpp | MIT (según el repositorio de OpenAI) | HuggingFace |

La comparación relevante es frente al modelo upstream: misma arquitectura, mismos parámetros y misma licencia, con la diferencia de que este repositorio solo cambia el formato de serialización y queda atado al runtime Core AI de Apple, mientras que el original se ejecuta con NeMo. No se dispone de datos de WER comparativos entre Parakeet TDT 0.6B v3 y las variantes de Whisper en la información proporcionada, por lo que no se puede afirmar cuál es más preciso.

## Limitaciones y advertencias

- No es un checkpoint entrenable: son assets `.aimodel` que no cargan con `transformers` ni con NeMo, y no permiten fine-tuning ni inspección de pesos en formato estándar.
- Dependencia de plataforma muy restrictiva: requiere Core AI y macOS 27 / iOS 27 o superior; queda fuera de Linux, Windows, Android y de cualquier despliegue en servidor.
- El encoder es estático: un único grafo se reutiliza para todas las entradas, lo que es eficiente pero impide reespecializar formas si el runtime o el caso de uso lo requiriesen.
- Riesgo de alucinación inherente a los modelos ASR: en audio con ruido, solapamiento de hablantes o dominios muy alejados de los datos de entrenamiento pueden aparecer sustituciones, omisiones o texto inventado; no se documentan en esta ficha umbrales de confianza ni mecanismos de mitigación.
- No hay información sobre sesgos por idioma, acento o variedad dialectal; los 25 idiomas cubiertos son en su mayoría lenguas oficiales de la UE y no se detalla el soporte de variedades regionales del español.
- El límite máximo de duración de audio, el comportamiento con audio de más de una hora y la estrategia de segmentación no están documentados en la información disponible.
- Licencia CC-BY-4.0: el uso comercial está permitido, pero exige atribución a NVIDIA como autor del modelo original y el cumplimiento de los términos de la licencia; conviene conservar la referencia a la model card upstream en la documentación del producto.
- El repositorio no publica métricas de calidad ni de latencia propias; cualquier decisión de producción debería validarse con un conjunto de evaluación propio.
- El ZIP debe descomprimirse antes de usar; el bundle resultante es un directorio, no un fichero único, lo que afecta al empaquetado y a la firma de la app.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bjnortier/coreai-ht5-parakeet-tdt-0.6b-v3-float16-static
- Modelo base (upstream, NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Apple Core AI (documentación para desarrolladores): https://developer.apple.com
- CirceKit (cliente Swift usado en el ejemplo): https://github.com/bjnortier
- `apple/coreai-models` (`CoreAISpeech`): https://github.com/apple/coreai-models
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card. No se dispone de papers, blogs ni demos adicionales.
