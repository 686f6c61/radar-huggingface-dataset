# FluidInference/nemotron-labs-unified-asr-0.6b-coreml

## Resumen

Nemotron-Labs-Unified-ASR-0.6b (Core ML + Core AI) es una conversión no oficial, realizada por FluidInference, del modelo de reconocimiento de voz de NVIDIA [nemotron-labs-unified-asr-0.6b](https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b). Se trata de un único checkpoint FastConformer-RNNT de unos 600 millones de parámetros que cubre reconocimiento de voz tanto offline como en streaming en 25 lenguas europeas, con puntuación y mayúsculas incluidas en la salida. La conversión a Core ML permite ejecutarlo de forma nativa en Apple Silicon (GPU, Neural Engine y CPU) sin depender de Python ni de NeMo en tiempo de ejecución.

El problema que resuelve es doble: por un lado, unifica ASR offline y streaming en un solo modelo multilingüe (evitando mantener varios checkpoints); por otro, lo hace ejecutable en dispositivos Apple (iOS 17 / macOS 14 en adelante) con latencias muy bajas, gracias a que el 99 % de las operaciones se ejecutan en el Neural Engine. El modelo base emplea un prompt de identificación de idioma (language-ID) mediante un prompt adapter integrado en el grafo del encoder, con un modo `auto` para detección automática.

Es relevante ahora porque la ejecución local de ASR en Mac e iOS está en plena expansión, y esta versión ofrece paridad verificada con la implementación original de NeMo, pesos en fp16 e int8, y una API Swift lista para producción a través de la librería FluidAudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-RNNT (encoder conformer + prediction net LSTM + joint network), con prompt adapter de language-ID |
| Parametros totales | ~600 M (0.6b) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana offline de 15 s; ventanas streaming de 6.16 s a 7.68 s (frames de 80 ms) |
| Tipos de cuantizacion | fp16 e int8 (pesos lineales simétricos por canal) |
| Idiomas soportados | 25 lenguas europeas: búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno, español, sueco, ruso y ucraniano |
| Licencia | OpenMDW License 1.1 |
| Formato de pesos | Core ML (.mlpackage y .mlmodelc compilado) y Core AI (.aimodel, beta); vocabulario SentencePiece de 4.095 tokens |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FastConformer-RNNT de NVIDIA: un encoder FastConformer que procesa características log-mel de 128 bins (frames de 80 ms) y produce representaciones de 1024 dimensiones, una red de predicción LSTM con estado de 2 x 1 x 640, y una red joint que combina ambas para decodificación RNN-Transducer con decodificación greedy. La innovación clave respecto a parakeet-unified-en-0.6b es el prompt adapter de language-ID: el encoder recibe un entero `prompt_id` (por ejemplo, `en` = 0, `de` = 9, `fr` = 8, `auto` = 127) que condiciona la inferencia al idioma indicado, con un modo automático incluido.

Para el streaming, se emplea el esquema buffered de NVIDIA: en cada paso se re-codifica la ventana `[left | chunk | right]` con la máscara de atención chunked "horneada" en el grafo del encoder, se decodifican los frames del chunk reteniendo el contexto derecho, y el estado del decodificador RNNT se arrastra entre pasos. Hay tres configuraciones disponibles: `70_13_13` (latencia 2.08 s), `70_7_7` (1.12 s) y `70_2_5` (0.56 s). Sobre el entrenamiento del modelo original de NVIDIA, la información proporcionada no detalla número de tokens, composición del dataset ni uso de RLHF/DPO: no disponible. La conversión a Core ML se realizó trazando desde NeMo con coremltools 9 (ML Programs fp16), y la versión int8 mediante cuantización de pesos lineal simétrica por canal; el port a Core AI se hizo con coreai-torch.

## Capacidades

- Reconocimiento automático de voz (ASR) offline en 25 lenguas europeas con ventanas de 15 segundos.
- ASR en streaming de baja latencia con tres niveles de compromiso latencia/calidad (0.56 s, 1.12 s y 2.08 s).
- Salida con puntuación y capitalización automáticas.
- Selección de idioma mediante prompt ID, incluido modo `auto` para detección automática de idioma.
- Ejecución en GPU, Neural Engine y CPU de Apple Silicon (el 99 % de las operaciones caen en el ANE).
- Cuantización int8 opcional para reducir el tamaño del encoder a la mitad (~570 MB frente a ~1.1 GB).
- Integración en Swift mediante la librería FluidAudio (`UnifiedAsrManager` / `StreamingUnifiedAsrManager`) y CLI (`fluidaudiocli`).
- No es un modelo de texto general: no genera texto libre, no razona, no soporta tool calling ni agentes.

## Casos de uso

- Dictado en tiempo real en apps de macOS e iOS: el modo streaming con latencia de 0.56 s y ~11-12 ms de coste de encoder por paso en el Neural Engine permite transcribir mientras el usuario habla, con consumo energético mínimo al ejecutarse en el ANE.
- Transcripción offline de ficheros de audio: el encoder offline de 15 s procesa cada ventana en 15.6 ms (GPU, fp16), adecuado para procesar por lotes grabaciones, podcasts o notas de voz sin conexión a internet.
- Asistentes de voz multilingües: el prompt de language-ID con modo `auto` permite cambiar de idioma en la misma sesión sin cargar modelos adicionales, útil en apps dirigidas a Europa.
- Subtitulado y accesibilidad en dispositivos Apple: la baja latencia del modo streaming y la salida con puntuación y mayúsculas facilitan generar subtítulos legibles en directo.
- Procesamiento on-device con privacidad: al ejecutarse íntegramente en el dispositivo, es adecuado para apps médicas, legales o empresariales donde el audio no puede salir del terminal.
- Integración en pipelines Swift de producción: la librería FluidAudio expone managers dedicados para modo online y streaming, y una CLI para pruebas rápidas (`fluidaudiocli transcribe audio.wav --model-version nemotron-unified`).
- Despliegue en dispositivos con memoria limitada: la versión int8 del encoder (~570 MB) reduce a la mitad el footprint frente a fp16, con degradación de WER mínima salvo en francés.

## Benchmarks y rendimiento

Paridad de conversión (FLEURS, 5 clips por lengua en en, de, fr, it, pl, ru; 30 clips en total; M5 Pro; muestras pequeñas, tratar el WER como verificación de sanidad):

| Configuración | Resultado de paridad |
|---|---|
| Offline fp16 vs NeMo | 27/30 transcripciones idénticas; WER igual en 5 de 6 lenguas (en: 2.9 % vs 3.8 % de NeMo) |
| Streaming fp16 (2.08 s) | 29/30 idénticas; WER idéntico en todas las lenguas |
| Streaming fp16 (1.12 s) | 30/30 idénticas; WER idéntico en todas las lenguas |
| Streaming fp16 (0.56 s) | 29/30 idénticas; WER idéntico en todas las lenguas |
| Streaming int8 (1.12 s) | 29/30 idénticas; WER igual a fp16 en 5 de 6 lenguas; francés sube de 6.9 % a 8.6 % |
| Offline int8 | Francés sube de 7.8 % a 9.5 % en estas 5 clips |
| Core AI offline (GPU) | Coseno 1.0000 vs PyTorch, max diff < 0.01; 11/12 transcripciones idénticas |

Latencia del encoder (M5 Pro, mediana por llamada, coreml-cli):

| Encoder | GPU | Neural Engine | CPU | Ops en ANE |
|---|---|---|---|---|
| Offline 15 s, fp16 | 15.6 ms | 26.0 ms | 85.5 ms | 99.9 % |
| Offline 15 s, int8 | 16.1 ms | 24.8 ms | 85.3 ms | 99.8 % |
| Streaming 1.12 s, fp16 | 11.6 ms | 11.8 ms | 43.6 ms | 99.7 % |
| Streaming 1.12 s, int8 | 12.2 ms | 11.4 ms | 43.4 ms | 99.6 % |

No se han publicado resultados de benchmarks estándar (WER en datasets amplios tipo FLEURS completo, Common Voice, etc.) en la información disponible más allá de las verificaciones de paridad anteriores.

## Requisitos de hardware

- Este port está diseñado exclusivamente para hardware Apple (Apple Silicon en Mac, y dispositivos iOS 17 / macOS 14 o posteriores para los ML Programs; Core AI en beta).
- Tamaño de modelos: encoder offline fp16 ~1.1 GB, int8 ~570 MB; repo completo 9.7 GB. No requiere VRAM de GPU dedicada tipo NVIDIA: se ejecuta sobre la memoria unificada de Apple Silicon.
- En Mac con Apple Silicon (por ejemplo M5 Pro según las mediciones), el encoder offline de 15 s tarda ~15.6 ms en GPU y ~26 ms en Neural Engine; un paso de streaming de 0.56 s cuesta ~11-12 ms de encoder en el ANE. Cabe con holgura en portátiles y probablemente en dispositivos iOS modernos (no disponible una lista concreta de dispositivos compatible).
- No cabe el concepto de "consumer GPU" NVIDIA aquí: la alternativa equivalente es cualquier Mac M1 o superior, aunque no se han publicado mediciones en chips anteriores al M5.
- Despliegue: vía Core ML (coreml-cli, ML Programs) o Core AI (beta), con la librería Swift [FluidAudio](https://github.com/FluidInference/FluidAudio) o su CLI. No aplica vLLM, llama.cpp, Ollama ni TGI; para ejecutar el modelo original en Python se usa NeMo.
- Preprocesamiento: hay que calcular el log-mel de NeMo (128 bins, n_fft 512, hop 160, window 400, preemph 0.97) con normalización por características fuera del grafo; la mel no está incluida como modelo.
- No se publican cifras de throughput en horas de audio por día ni consumo de batería: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Modos | Formato | Licencia |
|---|---|---|---|---|---|
| Nemotron-Labs-Unified-ASR-0.6b (este port Core ML) | ~600 M | 25 europeas | Offline + streaming (0.56/1.12/2.08 s) | Core ML fp16/int8, Core AI | OpenMDW 1.1 |
| NVIDIA parakeet-unified-en-0.6b (y su port de FluidInference) | ~600 M | Inglés | Offline + streaming | NeMo / Core ML | no disponible en la información proporcionada |
| NVIDIA nemotron-labs-unified-asr-0.6b (modelo base) | ~600 M | 25 europeas | Offline + streaming | NeMo (PyTorch) | OpenMDW 1.1 |

La ventaja diferenciadora de este port frente al modelo base de NVIDIA es la ejecución nativa en Apple Silicon sin Python, con paridad verificada y cuantización int8 opcional; frente a parakeet-unified-en-0.6b, añade 25 idiomas a costa de requerir el prompt de language-ID.

## Limitaciones y advertencias

- Es un port no oficial: no está afiliado ni respaldado por NVIDIA ni por Apple, por lo que la responsabilidad de la paridad recae en FluidInference.
- La verificación de WER se hizo con solo 30 clips de FLEURS (5 por lengua): los números son una comprobación de sanidad, no un benchmark representativo.
- La cuantización int8 degrada visiblemente el francés (WER de 6.9 % a 8.6 % en streaming y de 7.8 % a 9.5 % en offline en las muestras probadas); fp16 es la opción recomendada por defecto.
- El preprocesamiento log-mel no está incluido en el grafo: hay que implementarlo fuera (parámetros de NeMo: 128 bins, n_fft 512, hop 160, window 400, preemph 0.97, con normalización por características), lo que añade complejidad de integración.
- Core AI está en beta y su paridad se verificó solo en 12 clips.
- No hay datos publicados sobre sesgos por acento, género o dominio acústico, ni sobre riesgo de alucinación en silencios o ruido: no disponible. Como en todo sistema RNNT greedy, conviene supervisar repeticiones y falsas transcripciones en producción.
- La cobertura se limita a 25 lenguas europeas; no hay soporte para otras familias lingüísticas.
- La licencia OpenMDW 1.1 cubre la redistribución, pero conviene revisar el texto de `LICENSE.md` antes de uso comercial para confirmar las condiciones aplicables al caso concreto.
- Las mediciones de latencia provienen de un M5 Pro; en chips más antiguos o en iPhone los tiempos pueden ser sensiblemente distintos: no disponible.

## Enlaces

- Repositorio del modelo (Core ML/Core AI): https://huggingface.co/FluidInference/nemotron-labs-unified-asr-0.6b-coreml
- Modelo base de NVIDIA: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Referencia de arquitectura (parakeet-unified-en-0.6b de NVIDIA): https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Port equivalente en inglés de FluidInference: https://huggingface.co/FluidInference/parakeet-unified-en-0.6b-coreml
- Librería Swift FluidAudio: https://github.com/FluidInference/FluidAudio
- Licencia: LICENSE.md en el repositorio del modelo (OpenMDW License 1.1)
