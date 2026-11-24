# Mohamad-I8/BayanTTS

## Resumen
BayanTTS es un motor de síntesis de voz (text-to-speech) para árabe basado en selección de unidades de media-fonema (half-phone unit selection), implementado en C++17 sin dependencias externas y acompañado de un toolkit de entrenamiento y compilación en Python/GPU. Lo desarrolla el usuario Mohamad-I8 y se publica en Hugging Face como un repositorio de 0,7 GB que contiene el motor, los binarios precompilados y un conjunto de paquetes de voz en formato propietario `.bynv`.

A diferencia de los TTS neuronales habituales (Tacotron, VITS, FastSpeech), BayanTTS no es una red neuronal desplegada en inferencia: es un motor de concatenación de unidades que selecciona segmentos de audio pregrabados mediante una búsqueda Viterbi con poda Branch-and-Bound, acelerada con kernels SIMD SSE2/NEON sobre coeficientes LSF. El toolkit de entrenamiento incluye una etapa de destilación acústica entre enunciados (Cross-Utterance Acoustic Island Distillation) que selecciona los fragmentos más limpios del corpus para construir paquetes de voz compactos.

La relevancia práctica está en su rendimiento: según la model card, sintetiza entre 524x y 1.120x tiempo real en un solo hilo de CPU, con carga por `mmap` de 5 a 10 ms y paquetes de voz de entre 8,4 y 163 MiB. Esto lo sitúa en el nicho de TTS embebido de huella mínima (móvil, navegador vía WebAssembly, sistemas sin GPU), no en el de TTS neuronal de alta naturalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Selección de unidades de media-fonema con búsqueda Viterbi Branch-and-Bound; predictores acústicos basados en CNN 1D dilatada con SIMD de 4 vías en la fase de entrenamiento; síntesis por PSOLA |
| Parametros totales | No disponible (no es un modelo neuronal desplegado; el motor es código C++ con tablas de unidades) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de texto; no hay ventana de contexto) |
| Tipos de cuantizacion | No disponible (no se publican niveles de cuantización; los paquetes `.bynv` son formatos binarios propietarios optimizados) |
| Idiomas soportados | Árabe (paquetes de voz para los hablantes Ahmed y Aseel) |
| Licencia | No disponible |
| Formato de pesos | `.bynv` (formato binario propietario del proyecto); binarios nativos `.so`, `.a`, `.dll`, `.lib`, `.jar`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento
El motor de inferencia es un sintetizador de selección de unidades: dado un texto árabe, un frontend lo convierte en una secuencia de unidades (dífonos y trífonos), y un buscador Viterbi con poda Branch-and-Bound selecciona la mejor concatenación de segmentos pregrabados. La búsqueda usa un flujo de contexto indexado de 12 bytes con streaming en L1, y los kernels de distancia ponderada sobre coeficientes LSF están vectorizados con SSE2/NEON. La síntesis prosódica se realiza con PSOLA. La carga de los paquetes de voz se hace por `mmap`, con tiempos declarados de 4,8 a 67,7 ms según el paquete.

El entrenamiento se ejecuta en Python sobre GPU e incluye alineamiento acústico, un predictor CNN 1D dilatado con inferencia SIMD de 4 vías y un compilador a `.bynv`. La innovación declarada es la destilación de islas acústicas entre enunciados (`distill_islands.py`), que busca los tramos contiguos más limpios de todas las frases del corpus para lograr cobertura completa de dífonos y trífonos con un tamaño mucho menor. La model card afirma cobertura del 100,0 % de dífonos y del 100,0 % de trífonos en los paquetes Hyper, con reducciones de espacio de 4x a 6x frente a los paquetes maestros de corpus completo. No se especifican el número de tokens, la composición del dataset ni si hubo RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades
- Síntesis de voz en árabe a partir de texto, con dos voces disponibles (Ahmed y Aseel) en variantes de 16 kHz y 24 kHz.
- Selección de unidades con cobertura completa de dífonos y trífonos en los paquetes Hyper, según la model card.
- Ejecución en CPU sin GPU: 524x a 1.120x tiempo real en un solo hilo, con RTF declarado de 0,0009 a 0,0019.
- Carga rápida por `mmap` (4,8 a 67,7 ms) y paquetes de voz de 8,4 a 163 MiB.
- API C pura (`extern "C"`) para integración vía FFI desde Python, Rust, JNI (Android) y Swift (iOS).
- Compilación cruzada a Linux, Windows (x64 y x86), macOS, Android (arm64-v8a, armeabi-v7a, x86_64) y WebAssembly.
- Herramientas de destilación y optimización de paquetes de voz (`distill_islands.py`, `optimize_bynv.py`, `prune_bynv.py`).
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso
- Lectura de texto en aplicaciones móviles sin conectividad: el paquete de 16 kHz (8,4 a 9,03 MiB) y la velocidad de 1.015x a 1.120x tiempo real permiten sintetizar frases completas en milisegundos en un solo hilo de CPU de un teléfono.
- Accesibilidad para personas con discapacidad visual en árabe: integración mediante la API C o el binding JNI para leer notificaciones y contenido de pantalla con latencia de carga inferior a 10 ms.
- Asistentes de voz embebidos en dispositivos de bajo consumo (routers, electrodomésticos, sistemas de infoentretenimiento) donde no hay GPU ni presupuesto para un modelo neuronal.
- Síntesis en el navegador vía WebAssembly: el motor no tiene dependencias externas y puede desplegarse como módulo WASM para avisos y lecturas en aplicaciones web en árabe.
- Generación de avisos y anuncios pregrabados dinámicos en sistemas de megafonía o centralitas telefónicas, donde la velocidad de 524x a 1.120x tiempo real permite generar el audio al vuelo.
- Investigación en TTS de selección de unidades: el toolkit de entrenamiento y los scripts de destilación permiten reproducir el pipeline sobre otros corpus árabes y comparar coberturas de dífonos y trífonos.
- Pruebas de integración en pipelines de CI/CD para validar regresiones acústicas mediante la suite de tests C++ incluida (`bayan_tests`, 7 tests declarados como superados).

## Benchmarks y rendimiento
La model card no publica métricas de calidad perceptual (MOS, CMOS) ni comparaciones con otros sistemas TTS. Los únicos datos cuantitativos son de rendimiento del motor:

| Paquete de voz | Tamano | Unidades | Carga | RTF (CPU) | Velocidad |
|---|---:|---:|---:|---:|---:|
| ahmed_ar_24k_hyper | 27,79 MiB | 39.888 | 10,0 ms | 0,0011 | 893x |
| aseel_ar_24k_hyper | 23,30 MiB | 35.996 | 9,6 ms | 0,0011 | 928x |
| ahmed_ar_16k_hyper | 9,03 MiB | 18.875 | 4,8 ms | 0,0010 | 1.015x |
| aseel_ar_16k_hyper | 8,40 MiB | 18.424 | 4,9 ms | 0,0009 | 1.120x |
| ahmed_ar_24k_hq_full | 163,15 MiB | 275.972 | 67,7 ms | 0,0019 | 524x |
| aseel_ar_24k_hq_full | 86,90 MiB | 156.502 | 39,6 ms | 0,0015 | 647x |

No se han publicado resultados de benchmarks de calidad de voz en la información disponible.

## Requisitos de hardware
- VRAM: no aplica; la inferencia es exclusivamente en CPU.
- CPU: cualquier procesador x86_64 con SSE2 o ARM con NEON; el motor declara cero dependencias externas en tiempo de ejecución.
- GPU: no se requiere GPU para inferencia. El entrenamiento y la destilación usan Python/GPU, pero no se especifican modelos de GPU concretos.
- Memoria: el paquete de voz más pequeño ocupa 8,40 MiB y el mayor 163,15 MiB, cargados por `mmap`.
- Cabe en cualquier dispositivo con soporte de los binarios precompilados: Windows x64/x86, Linux x86_64, macOS, Android (arm64-v8a, armeabi-v7a, x86_64), iOS y WebAssembly.
- Despliegue: binario CLI (`bayan_cli`), biblioteca compartida (`libbayan_tts.so`, `bayan_tts.dll`), biblioteca estática (`libbayan_tts_static.a`), JAR de Android (`bayan_tts_android.jar`) y binding Swift para iOS.
- Latencia: carga de 4,8 a 67,7 ms según paquete; síntesis a 524x-1.120x tiempo real en un solo hilo. No se publican cifras de throughput agregado ni de latencia extremo a extremo con el frontend de texto.

## Comparativa con modelos similares
No se dispone de datos comparativos publicados en la información proporcionada. BayanTTS pertenece a la familia de TTS por concatenación de unidades, una categoría distinta de los TTS neuronales (VITS, FastSpeech 2, Piper, Coqui TTS), por lo que una comparación directa de parámetros, contexto y licencia no está disponible. Los aspectos diferenciales declarados son la ejecución en CPU a más de 500x tiempo real, la ausencia de dependencias en tiempo de ejecución y el tamaño reducido de los paquetes de voz.

| Aspecto | BayanTTS | TTS neuronales (referencia) |
|---|---|---|
| Paradigma | Selección de unidades + PSOLA | Red neuronal extremo a extremo |
| Hardware de inferencia | CPU (SSE2/NEON) | CPU o GPU |
| Licencia | No disponible | Varía según proyecto |
| Idiomas | Árabe | Multilingüe en muchos casos |
| Calidad perceptual publicada | No disponible | Habitualmente MOS publicado |

## Limitaciones y advertencias
- La licencia no está especificada en la información disponible; no puede asumirse uso comercial sin consultar al autor.
- Solo se declaran voces en árabe (Ahmed y Aseel); no hay soporte multilingüe documentado.
- El formato `.bynv` es propietario y no es interoperable con toolchains estándar (safetensors, GGUF, ONNX).
- La naturalidad y prosodia de un sistema de selección de unidades depende de la calidad y cobertura del corpus; no se publican métricas de MOS ni evaluaciones perceptuales.
- Los paquetes Hyper están destilados para cobertura de dífonos y trífonos, pero la model card no detalla el comportamiento en dominios léxicos fuera del corpus (nombres propios, tecnicismos, diacríticos).
- No hay información sobre sesgos de los hablantes, ni sobre el origen y consentimiento de las grabaciones del corpus.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada.
- No se documentan garantías de estabilidad de la API C ni versionado semántico del formato `.bynv`.

## Enlaces
- Hugging Face: https://huggingface.co/Mohamad-I8/BayanTTS
- Documentación de arquitectura interna: `docs/ARCHITECTURE.md` (incluido en el repositorio)
- Cabecera de API C: `core/include/bayan_tts.h`
- Scripts de entrenamiento y destilación: `training/scripts/distill_islands.py`, `training/scripts/optimize_bynv.py`, `training/scripts/prune_bynv.py`
- Scripts de producción GPU: `kaggle_ahmed/`, `kaggle_job/`
- No se han encontrado en la búsqueda web papers, blogs, repositorios externos ni demos adicionales.
