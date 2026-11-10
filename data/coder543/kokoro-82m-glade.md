# coder543/kokoro-82m-glade

## Resumen

Kokoro-82M Glade es un paquete de pesos y configuracion de ejecucion para el modelo de sintesis de voz Kokoro-82M v1.0, adaptado por el usuario coder543 para el runtime Glade sobre hardware Apple Silicon. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion del modelo original de hexgrad a formato `.aimodel`, optimizado para ejecutarse sobre la Neural Engine (ANE) y la GPU de chips Apple M-series y A-series. El modelo acepta texto plano o fonemas explicitos y produce audio PCM mono a 24 kHz.

El modelo base Kokoro-82M cuenta con 82 millones de parametros, una arquitectura de sintesis neuronal basada en StyleTTS2 e iSTFTNet, y soporta 54 voces distribuidas en nueve perfiles de idioma: ingles americano y britanico, espanol, frances, hindi, italiano, portugues de Brasil, japones y mandarin. La licencia es Apache-2.0 tanto para los pesos originales como para este paquete derivado.

La relevancia de esta ficha radica en que Kokoro-82M Glade demuestra que un modelo TTS de 82M de parametros puede alcanzar velocidades de inferencia muy altas en hardware de consumo Apple, con un RTFx de hasta 127,3x en un M5 Max, lo que lo hace viable para aplicaciones de sintesis de voz en tiempo real o por lotes directamente en dispositivos de usuario final, sin necesidad de GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 + iSTFTNet (sintesis neuronal de voz) |
| Parametros totales | 82 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 posiciones de texto, 1.280 frames acusticos, hasta 510 fonemas de contexto |
| Tipos de cuantizacion | no disponible (formato `.aimodel` propietario de Glade) |
| Idiomas soportados | en (americano y britanico), es, fr, hi, it, pt (Brasil), ja, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | `.aimodel` (assets de Glade), parametros CPU, tablas de voces y datos de frontend |

## Arquitectura y entrenamiento

El modelo base Kokoro-82M emplea una arquitectura de sintesis de voz basada en StyleTTS2 para la generacion de prosodia y caracteristicas acusticas, combinada con iSTFTNet para la sintesis de forma de onda. El paquete Glade distribuye el grafo de texto en la Neural Engine (ANE), los grafos de prosodia, acustica y forma de onda en la GPU, y la recurrencia bidireccional, sintesis armonica y FFT/overlap-add en la CPU. Se incluyen cuatro assets `.aimodel` con pesos compartidos, parametros de CPU, tablas de voces y datos de frontend.

No se realiza ningun entrenamiento adicional en este paquete; se trata exclusivamente de una conversion y empaquetado del modelo original. El frontend de cada idioma forma parte de la descarga: el ingles porta el procesamiento de contexto de Misaki, un tagger spaCy entrenado y un fallback BART para ingles americano; el japones usa Cutlet y MeCab/UniDic con licencia BSD; el mandarin emplea normalizacion nativa, Jieba y transcripcion pinyin. Los demas idiomas y las palabras fuera de diccionario del ingles britanico usan datos de pronunciacion permisivos e inferencia Charsiu. La planificacion en ingles conserva el contexto de hasta 510 fonemas del modelo original, con 512 posiciones de texto y 1.280 frames acusticos.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto plano o fonemas explicitos, con salida PCM mono a 24 kHz.
- Soporte de 54 voces en nueve perfiles de idioma: ingles americano, ingles britanico, espanol, frances, hindi, italiano, portugues de Brasil, japones y mandarin.
- Control de velocidad de habla y semilla aleatoria para reproducibilidad.
- Procesamiento de contexto largo en ingles (hasta 510 fonemas, 512 posiciones de texto, 1.280 frames acusticos).
- Normalizacion de texto especifica por idioma: numeros, contexto y fallback en ingles; normalizacion nativa y pinyin en mandarin; Cutlet y MeCab/UniDic en japones.
- Descarga opcional por idioma con reutilizacion de archivos compartidos (neurales y frontend).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo exclusivamente TTS).
- No dispone de modo thinking, vision ni audio de entrada.

## Casos de uso

- Lectura por voz de documentos largos en aplicaciones de accesibilidad: el modelo procesa hasta 510 fonemas de contexto y 1.280 frames acusticos por utterance, con normalizacion de texto que preserva la entrada completa y divide automaticamente cuando se supera la capacidad. Es adecuado para convertir articulos, libros o informes en audio en un Mac o iPhone sin conexion.
- Asistentes de voz locales en dispositivos Apple: al ejecutarse sobre ANE y GPU de Apple Silicon, permite integrar sintesis de voz en apps de iOS o macOS sin depender de servicios en la nube, con latencias de 38,24 s para 12 minutos de audio en un M3 MacBook Air.
- Generacion de audiolibros y podcasts automatizados: el soporte de 54 voces en nueve idiomas permite producir contenido multilingue con voces diferenciadas, y el RTFx de 127,3x en un M5 Max hace viable procesar horas de texto en minutos.
- Doblaje y localizacion de contenido: la disponibilidad de voces en espanol, frances, italiano, portugues, hindi, japones y mandarin permite generar pistas de voz para videos o presentaciones en varios idiomas desde un unico flujo de trabajo.
- Sistemas de navegacion y avisos por voz en tiempo real: la latencia de 5,756 s para 12 minutos de audio en un M5 Max y de 38,24 s en un M3 permite generar avisos hablados bajo demanda en aplicaciones de conduccion o movilidad.
- Pruebas de integracion continua para aplicaciones de voz: la reproducibilidad byte-identica en pasadas repetidas en iPhone y la semilla configurable permiten usar el modelo en pipelines de CI/CD para validar que las salidas de audio no cambian entre versiones.
- Prototipado de interfaces conversacionales: la interfaz de texto plano y la de fonemas explicitos permiten a desarrolladores experimentar con prosodia y pronunciacion sin necesidad de entrenar un modelo propio.

## Benchmarks y rendimiento

Los datos de rendimiento proporcionados corresponden a la sintesis completa del discurso "We choose to go to the Moon" de JFK (2.201 palabras, voz Heart, velocidad 1, semilla 42, una lane de sintesis, ejecucion residente). Son medianas de tres pasadas en Release, incluyendo fonemizacion, planificacion y toda la sintesis.

| Dispositivo | Audio generado | Text-to-audio | RTFx | WPM de entrada |
|---|---:|---:|---:|---:|
| M3 MacBook Air, 16 GB, macOS 27.0.1 | 12 min 13 s | 38,24 s | 19,2x | 3.453 |
| iPhone 15 Pro Max, A17 Pro, 8 GB, iOS 27.0.1 | 12 min 13 s | 96,34 s | 7,6x | 1.371 |
| M5 Max MacBook Pro, 64 GB, macOS 27.2.1 | 12 min 13 s | 5,756 s | 127,3x | 22.945 |

La primera pasada en iPhone tardo 66,46 s (11,0x) y las posteriores alcanzaron estado termico estable. El pico de memoria muestreado en el cliente fue de 1.159 MiB, incluyendo PCM del benchmark. Las salidas repetidas en iPhone fueron identicas byte a byte. La preparacion cacheada observada fue de 0,62 s en M3 e iPhone, incluyendo inicializacion nativa del frontend. No se recogio traza de colocacion en M5 para esta medicion. No se han publicado resultados de benchmarks de calidad perceptual ni de similitud de voz en la informacion disponible.

## Requisitos de hardware

- VRAM/unificada estimada: el paquete completo ocupa 0,8 GB en disco; la descarga por defecto de ingles americano es de aproximadamente 210 MB y todos los idiomas juntos suman aproximadamente 767 MB. El diccionario japones empaquetado ocupa aproximadamente 446 MB y solo se descarga si se selecciona japones.
- Memoria en ejecucion: el pico muestreado en iPhone 15 Pro Max fue de 1.159 MiB incluyendo PCM del benchmark; la memoria del compilador y servicios queda excluida.
- GPU/dispositivos recomendados: chips Apple M-series (M3, M5 Max) y A-series (A17 Pro). El grafo de texto se ejecuta en ANE; prosodia, acustica y forma de onda en GPU; recurrencia bidireccional, sintesis armonica y FFT/overlap-add en CPU.
- Cabe en GPU de consumo: si, en hardware Apple Silicon integrado (MacBook Air M3, iPhone 15 Pro Max). No se proporcionan datos para GPU NVIDIA o AMD.
- Opciones de despliegue: runtime Glade con CLI en modo completo. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato `.aimodel`.
- Latencia y throughput: 38,24 s para 12 min 13 s de audio en M3 MacBook Air (19,2x RTFx); 96,34 s en iPhone 15 Pro Max (7,6x RTFx); 5,756 s en M5 Max MacBook Pro (127,3x RTFx).
- Preparacion cacheada: 0,62 s en M3 e iPhone. Los assets requieren especializacion por dispositivo en el primer uso; no se proporciona cache de especializacion compilada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la informacion proporcionada. La comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Idiomas | Licencia | Formato | Hardware objetivo |
|---|---|---|---|---|---|
| Kokoro-82M Glade | 82 M | 9 perfiles (en, es, fr, hi, it, pt, ja, zh) | Apache-2.0 | `.aimodel` (Glade) | Apple Silicon (ANE/GPU/CPU) |
| Kokoro-82M (original) | 82 M | 9 perfiles | Apache-2.0 | safetensors / PyTorch | GPU generica (CUDA, MPS) |
| Alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado metricas de calidad perceptual ni de similitud de voz; las comprobaciones funcionales y de reconocimiento de muestras no establecen puntuaciones generales de percepcion o similitud.
- No se reclama cualificacion para watchOS.
- Las palabras fuera de diccionario del ingles britanico y las rutas de idiomas distintos del ingles, japones y mandarin usan datos de pronunciacion permisivos e inferencia Charsiu, con su propio comportamiento de pronunciacion que puede diferir del esperado.
- El diccionario japones de aproximadamente 446 MB se descarga solo al seleccionar japones y se expande sin perdida en una cache mapeada en memoria desechable en el primer uso.
- No se proporciona cache de especializacion compilada; los assets requieren especializacion por dispositivo en el primer uso, lo que anade latencia inicial.
- La medicion de 0,62 s de preparacion cacheada no es una medicion de especializacion en frio, ya que las caches del compilador no se purgaron.
- El rendimiento medido corresponde exclusivamente a hardware Apple Silicon; no hay datos para GPU NVIDIA, AMD o CPU x86.
- La licencia Apache-2.0 permite uso comercial, pero los componentes de frontend (Misaki, spaCy, BART, Cutlet, MeCab/UniDic, Jieba, Charsiu) conservan sus propios avisos de licencia que deben respetarse.
- El modelo no realiza entrenamiento adicional; cualquier sesgo presente en el modelo original Kokoro-82M se mantiene en este paquete.
- Riesgo de alucinacion acustica o pronunciacion incorrecta en textos con terminologia especializada, siglas o nombres propios no cubiertos por el frontend de cada idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/kokoro-82m-glade
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio del modelo original (referencia de pesos y codigo): commit `f3ff3571791e39611d31c381e3a41a3af07b4987`, Apache-2.0
- StyleTTS2 (arquitectura base): no disponible en la informacion proporcionada
- iSTFTNet (sintesis de forma de onda): no disponible en la informacion proporcionada
- Runtime Glade: no disponible en la informacion proporcionada
