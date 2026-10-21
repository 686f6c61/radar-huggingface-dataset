# coder543/pocket-tts-glade

## Resumen

Pocket TTS for Glade es un paquete de activos y configuración de ejecución para el modelo de síntesis de voz Kyutai Pocket TTS, empaquetado por el desarrollador coder543 para su uso dentro de Glade sobre Apple Silicon. No se trata de un modelo entrenado desde cero, sino de una redistribución cuantizada y reorganizada del modelo base `kyutai/pocket-tts`, con los grafos convertidos al formato `.aimodel` de Core AI para ejecutarse en la Neural Engine (ANE) y en CPU de los chips Apple M-series. El resultado es un sistema de texto a voz que genera PCM mono a 24 kHz, con interfaces de síntesis completa e incremental (streaming).

El repositorio cubre dos familias. Por un lado, seis checkpoints pequeños en inglés (1,9 M, 6,9 M y 18,2 M de parámetros, cada uno con su variante REFL afinada con recompensa) pensados para latencia mínima en dispositivo. Por otro, los perfiles multilingües originales en siete idiomas (inglés, francés, alemán, portugués, italiano, español y neerlandés), cada uno con sus pesos de lenguaje en W8A16, el decodificador Mimi en FP16 y un codificador de referencia de audio de aproximadamente 9,8 M de parámetros para condicionamiento por voz.

Su relevancia es doble: demuestra que un TTS neuronal completo puede caber en paquetes de 26 a 154 MB y funcionar a velocidades muy superiores al tiempo real en un portátil, y ofrece una vía práctica de TTS local y offline en el ecosistema Apple, sin depender de APIs en la nube. La contrapartida es que el formato de pesos es propietario de Core AI y no hay soporte para vLLM, llama.cpp ni GPU NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de 6 capas con cabeza flow LSD de un paso (80 ms de latente por paso autorregresivo), acoplado al códec neuronal Mimi para la decodificación de波形; los activos se distribuyen como grafos `.aimodel` de Core AI |
| Parametros totales | No disponible para los perfiles multilingües; las variantes pequeñas de inglés van de 1,9 M a 18,2 M parámetros y el codificador de referencia añade ~9,8 M |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Caché de lenguaje de 1024 posiciones (incluida la voz seleccionada), con prefill de 32 posiciones; contexto de atención causal del códec de 250 posiciones (50 en las variantes pequeñas) |
| Tipos de cuantizacion | W8A16 en el grafo de lenguaje de los perfiles multilingües originales; FP16 en el decodificador Mimi, el codificador de referencia y los tres activos de las variantes pequeñas |
| Idiomas soportados | Inglés (en), francés (fr), alemán (de), portugués (pt), italiano (it), español (es) y neerlandés (nl) |
| Licencia | CC BY 4.0 (la implementación original se publica bajo MIT) |
| Formato de pesos | `.aimodel` (Core AI / Apple Neural Engine), FP16 y W8A16; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El motor de lenguaje es un transformer causal de seis capas con una cabeza flow LSD de un solo paso que produce un latente de 80 ms en cada iteración autorregresiva; ese latente se entrega al decodificador Mimi, que reconstruye la forma de onda a 24 kHz. El códec comparte pesos para consumir 1, 2, 4 u 8 latentes consecutivos, conserva su estado de convolución y su contexto de atención causal nativo, de modo que los modos completo y streaming generan exactamente el mismo PCM en los controles declarados. El frontend de texto es el original de Kyutai, con tokenizador Unigram propio por checkpoint, reemplazos de caracteres, división por frases, objetivo de 50 tokens, convenciones de EOS y un breve fade-in.

El repositorio no documenta el volumen de tokens de entrenamiento ni la composición del dataset del modelo base. Sí indica que las variantes REFL parten de los checkpoints de octubre de 2026 y han sido afinadas con recompensa por Kyutai, y que las voces de referencia Reader A, Reader B, Kokoro Heart y Kokoro Adam se precalculan a partir de grabaciones LibriSpeech (CC BY 4.0) y de ejemplos Kokoro generados para GladeDemo. La aportación de coder543 es de empaquetado y cuantización: conversión a grafos Core AI, selección de precisión por componente (W8A16 para lenguaje, FP16 para audio), gestión de presets y verificación de integridad mediante SwiftModelHub contra los checksums de Hugging Face.

## Capacidades

- Síntesis de voz a partir de texto con salida PCM mono a 24 kHz, en modo completo y en modo incremental por paquetes.
- Condicionamiento por voz: además de los presets oficiales e incluidos, acepta audio de referencia mediante un codificador dedicado de ~9,8 M de parámetros que solo se carga cuando se solicita.
- Presets incluidos: Alba y Anna (inglés), Estelle (francés), Juergen (alemán), Rafael (portugués), Giovanni (italiano), Lola (español), Daan (neerlandés), más Reader A, Reader B, Kokoro Heart y Kokoro Adam en cada perfil.
- Multilingüismo en siete idiomas, con descarga independiente por idioma: añadir una lengua no obliga a descargar las demás.
- Streaming de baja latencia: en las pruebas nativas en caliente, los primeros paquetes de 640 ms estuvieron disponibles en 14-30 ms.
- Ejecución en la Neural Engine con preferencia explícita por ANE en todos los grafos; también funcionan en CPU, que resulta más rápida para los checkpoints pequeños en un M3.
- No es un modelo de lenguaje: no ofrece tool calling, function calling, razonamiento multi-paso, visión ni modo de pensamiento.

## Casos de uso

- Lectura por voz en aplicaciones macOS e iOS: el paquete de 26,3 MB del checkpoint de 1,9 M permite narrar texto en tiempo real dentro de una app sin salir del dispositivo, con RTFx de 70,36× en CPU de M3.
- Asistentes de voz totalmente offline: al no requerir red ni API externa, encaja en productos de privacidad estricta donde el audio no puede salir del equipo, usando el modo incremental para empezar a reproducir antes de terminar la frase.
- Accesibilidad: sustitución o complemento de VoiceOver con voces más naturales y seleccionables por preset, incluyendo la posibilidad de condicionar con una grabación del propio usuario.
- Localización de contenidos: los perfiles independientes de 148,9-153,8 MB permiten generar versiones en francés, alemán, italiano, portugués, neerlandés y español del mismo guion descargando solo la lengua necesaria.
- Generación de datos sintéticos para ASR: producir corpus de audio con voces y frases controladas para entrenar o evaluar sistemas de reconocimiento de habla, con la ventaja de que todo el pipeline corre en local.
- Prototipado de interfaces conversacionales y videojuegos: el modo streaming y la latencia de primera locución de 14-30 ms permiten integrar respuestas habladas en diálogos interactivos sin percepción de espera.
- Doblaje y previsualización de vídeo: síntesis por frases con objetivo de 50 tokens y control de la voz por preset para maquetas rápidas antes de una locución profesional.
- Avisos y lectura de notificaciones en dispositivos Apple: los perfiles pequeños están pensados para ejecución en el dispositivo; el autor advierte, no obstante, que no se ha cualificado su uso en teléfono ni en Watch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (tipo MMLU, HumanEval o GSM8K) en la información disponible, ni aplican a un modelo de texto a voz. El autor sí publica medidas de throughput (RTFx, veces el tiempo real) sobre un MacBook Air M3 de 16 GB con macOS 27.0.1, voz Alba, semilla 42 y temperatura 0,3, con el texto «Sunlight pours through the trees. A gentle breeze moves across the clearing. Welcome to Glade.» y audio generado de 5,12-5,52 s según checkpoint. Son medianas de tres pasadas en caliente e incluyen preparación del texto, generación de lenguaje, decodificación de forma de onda y trabajo de estado del host.

| Modelo | Directorio | Descarga | RTFx CPU M3 | RTFx ANE preferente |
|---|---|---:|---:|---:|
| 1,9 M | `small/2m/` | 26,3 MB | 70,36× | 29,92× |
| 1,9 M REFL | `small/2m-refl/` | 26,3 MB | 70,19× | 21,87× |
| 6,9 M | `small/7m/` | 38,9 MB | 39,56× | 18,80× |
| 6,9 M REFL | `small/7m-refl/` | 38,9 MB | 34,30× | 21,21× |
| 18,2 M | `small/18m/` | 70,1 MB | 44,79× | 16,71× |
| 18,2 M REFL | `small/18m-refl/` | 70,1 MB | 44,56× | 14,91× |

El autor advierte que estas medidas cortas no sustituyen a pruebas de locución larga ni a mediciones en teléfono. No se aportan puntuaciones perceptuales (MOS) ni comparaciones formales de calidad frente al modelo base.

## Requisitos de hardware

- Plataforma: Apple Silicon con Core AI. Los activos son grafos `.aimodel` que solicitan la Neural Engine; no hay ruta de ejecución para CUDA, ROCm ni CPU x86 genérica.
- Equipo de referencia probado: MacBook Air M3 con 16 GB de RAM y macOS 27.0.1.
- Huella en disco: repositorio completo de 2,2 GB; cada perfil de idioma ocupa entre 148,9 MB (neerlandés) y 153,8 MB (inglés), y el conjunto de los siete idiomas suma aproximadamente 1,1 GB. Las variantes pequeñas van de 26,3 MB a 70,1 MB e incluyen las seis voces y el codificador de referencia.
- VRAM: no aplica en el sentido de GPU discreta; el consumo es de memoria unificada. No se publican cifras de memoria residente por perfil.
- GPU recomendadas: no disponibles; el diseño está orientado a ANE y CPU, no a GPU. En el M3 probado no se observaron intervalos de GPU objetivo durante las capturas de los perfiles pequeños.
- Opciones de despliegue: el runtime Glade sobre Core AI con SwiftModelHub para verificación y reutilización de archivos. No hay soporte declarado para vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime.
- Latencia y throughput: RTFx de 14,91× a 70,36× según checkpoint y unidad de ejecución; primera locución de 640 ms disponible en 14-30 ms en streaming nativo en caliente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| `coder543/pocket-tts-glade` | 1,9-18,2 M (small); no disponible en multilingüe | 1024 posiciones de caché de lenguaje | 7 | CC BY 4.0 | `.aimodel` / Core AI, Apple Silicon |
| `kyutai/pocket-tts` (base) | No disponible en la información | 1024 posiciones | 7 | CC BY 4.0 | Pesos originales; es el origen de este paquete |
| Kokoro (voces Kokoro Heart y Kokoro Adam) | No disponible en la información | No disponible | No disponible | No disponible | Referenciado solo como fuente de voces de condicionamiento |
| Piper, XTTS y otros TTS locales | No disponible en la información | No disponible | No disponible | No disponible | No se han encontrado datos verificables en la búsqueda realizada |

La comparación cuantitativa con alternativas no es posible con la información disponible: la búsqueda web no devolvió resultados relevantes sobre modelos de texto a voz. La comparación más fiable es interna, entre los seis checkpoints pequeños y los perfiles multilingües del propio repositorio.

## Limitaciones y advertencias

- El autor no reclama puntuaciones perceptuales para los nuevos perfiles pequeños; solo verificaciones de reconocimiento sobre muestras seleccionadas que confirman palabras coherentes.
- No se ha cualificado el funcionamiento en teléfono ni en Apple Watch; las medidas se limitan a un MacBook Air M3.
- Las mediciones de RTFx son de enunciados cortos (5,12-5,52 s de audio) y no sustituyen a pruebas de locución larga.
- El objetivo de 50 tokens por frase y la división oracional limitan la prosodia en textos largos; las locuciones independientes se procesan de forma secuencial, no en paralelo.
- La caché de lenguaje de 1024 posiciones, incluido el prefijo de la voz, acota la longitud manejable por el grafo; el autor indica que la capacidad en exceso no soportada devuelve error.
- Las variantes pequeñas son solo en inglés; el multilingüismo exige descargar el perfil correspondiente.
- Es una redistribución de terceros (coder543), no una publicación oficial de Kyutai: conviene verificar la revisión concreta antes de desplegar. El repositorio registra 0 descargas y 0 likes, sin validación comunitaria.
- La licencia CC BY 4.0 exige atribución; los avisos por variante conservan la atribución de presets y voces de ejemplo, que debe mantenerse en productos derivados.
- Al ser un modelo de voz, los fallos se manifiestan como palabras omitidas, prosodia errática o pronunciación incorrecta, no como alucinación textual; no se documentan evaluaciones de sesgo por acento, género o idioma.
- No hay filtrado de contenido ni moderación integrados; cualquier política de uso seguro debe implementarse en la capa de aplicación.
- El formato `.aimodel` ata el despliegue al ecosistema Apple y a la versión de Core AI del sistema operativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/coder543/pocket-tts-glade
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Revisión de checkpoints, tokenizador y presets citada: `a72dba0d1a5f1387c104f9d3e17abb8ab60b4fae` en `kyutai/pocket-tts` (CC BY 4.0)
- Implementación original citada: `da629e60b68fc141a790daa05630735966b68720` (MIT)
- No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
