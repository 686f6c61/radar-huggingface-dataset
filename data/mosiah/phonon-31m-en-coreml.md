# mosiah/phonon-31m-en-coreml

## Resumen

`mosiah/phonon-31m-en-coreml` es una conversión a Core ML del modelo de síntesis de voz Phonon 31M en inglés, desarrollado originalmente por Gradium sobre la base de Pocket TTS de Kyutai. No se trata de un modelo nuevo ni de un reentrenamiento: el autor ha tomado el artefacto `phonon-31m-en-coreml.zip` publicado en la release v0.4.0 del repositorio `gradium-ai/xn-ptts`, ha reducido el conjunto de voces a nueve y ha regenerado el `bundle.json` para que enumere exactamente los ficheros presentes en el paquete.

El modelo resuelve un problema concreto: ejecutar text-to-speech en inglés dentro del dispositivo, sin llamadas a servicios externos, en el ecosistema Apple (iOS 18 y macOS 15) mediante el paquete Swift `ptts`. Con 31 millones de parámetros y un repositorio de 0,1 GB, está pensado para integrarse en aplicaciones que necesitan síntesis de voz offline con latencia baja y sin coste por petición, un caso de uso habitual en accesibilidad, navegación o asistentes locales.

La relevancia de esta ficha es doble: por un lado, documenta una build utilizable de un TTS pequeño bajo licencia Apache-2.0; por otro, conviene tener presente que es una copia de terceros no avalada por Gradium ni por Kyutai, con cero descargas y cero likes en el momento de la consulta, por lo que no existe validación comunitaria sobre su comportamiento en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no detalla la topología interna; el modelo base deriva de Kyutai Pocket TTS según el autor) |
| Parámetros totales | 31 millones (según el nombre del modelo y el modelo base `gradium/phonon-31m-en`) |
| Longitud de contexto | No aplica / no disponible (modelo TTS; no se documenta la longitud máxima de texto de entrada) |
| Tipos de cuantización | No disponible (build Core ML; la model card no indica la precisión de los pesos) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (artefactos empaquetados y verificados contra `bundle.json`; no se detallan extensiones concretas) |
| Voces incluidas | 9: default, Harper, Hadley, Miles, Preston, Maeve, Bryony, Edwin, Hugh |
| Plataformas soportadas | iOS 18 / macOS 15 con el paquete Swift `ptts` |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | `gradium/phonon-31m-en` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Lo único documentado es que Phonon es un modelo de Gradium construido sobre Pocket TTS de Kyutai, y que esta publicación es una conversión a Core ML del checkpoint inglés de 31 millones de parámetros. No se especifica si se trata de un transformer, de un modelo híbrido o de una arquitectura de síntesis con decoder autoregresivo y vocoder integrado, ni se detallan mecanismos de atención o de decodificación.

Tampoco hay datos sobre el entrenamiento: no se indica el volumen de horas de audio, la composición del corpus, el idioma de los datos más allá del inglés, ni si hubo etapas de ajuste fino con preferencias humanas. La model card se limita a documentar la procedencia del artefacto (release v0.4.0 de `gradium-ai/xn-ptts`, con SHA-256 del zip `10f3a99fd39256db44f826267ef21d78cca959b16c0554926344c09fde27b436`), la reducción del catálogo de voces a nueve y la regeneración de `bundle.json`. Cualquier afirmación sobre innovaciones técnicas del modelo sería especulativa.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto plano.
- Nueve voces predefinidas: default, Harper, Hadley, Miles, Preston, Maeve, Bryony, Edwin y Hugh.
- Ejecución completamente local en el dispositivo mediante Core ML, sin envío de texto a servidores externos.
- Verificación de integridad de los ficheros del paquete contra `bundle.json` mediante `PhononModels.download(from:progress:)` del paquete Swift `ptts`.
- Integración nativa en aplicaciones iOS 18 y macOS 15 a través de Swift Package Manager.
- No soporta tool calling ni function calling: es un modelo de síntesis, no un modelo generativo de propósito general.
- No soporta razonamiento multi-paso, agentes ni planificación.
- No dispone de visión, audio de entrada ni modalidad multimodal de entrada.
- Capacidades multilingües: únicamente inglés.
- No se documenta clonación de voz, control de emociones, prosodia por etiquetas SSML ni ajuste de velocidad o tono.

## Casos de uso

- **Lectura de contenido en aplicaciones de accesibilidad**: integración en apps de lectura de artículos o libros que necesitan convertir texto a voz sin conexión, usando las nueve voces para adaptar el registro al tipo de contenido y evitando enviar el texto del usuario a un servicio externo.
- **Navegación e indicaciones giro a giro**: un cliente de mapas puede generar las instrucciones de voz localmente con latencia baja, algo crítico cuando el usuario circula por zonas sin cobertura y no puede depender de un TTS en la nube.
- **Asistentes conversacionales on-device**: combinado con un modelo de lenguaje pequeño o con un motor de intenciones local, Phonon cubre la parte hablada del asistente manteniendo la conversación completa dentro del dispositivo, lo que simplifica el cumplimiento de privacidad.
- **Notificaciones y alertas habladas**: sistemas de monitorización, domótica o apps de salud que anuncian eventos mediante voz; el tamaño de 31M permite mantener el modelo residente en memoria junto al resto de la aplicación.
- **Voice-over de prototipos y contenido corto**: sustituir la grabación de locutor en demos, vídeos internos o maquetas de producto, generando pistas de audio en inglés con una de las nueve voces y regenerándolas tantas veces como sea necesario sin coste por carácter.
- **Aprendizaje de inglés como pronunciación de referencia**: un lector de tarjetas o frases que reproduce el texto introducido por el estudiante con una voz concreta, permitiendo comparar su propia pronunciación con la del modelo sin conexión.
- **Terminales y kioscos sin conectividad**: puntos de información en ferias, museos o entornos industriales aislados donde el dispositivo Apple reproduce mensajes pregrabados o dinámicos sin depender de red.
- **Pruebas automatizadas de pipelines de audio en CI**: ejecutar el paquete Core ML en runners macOS para generar audio sintético de referencia y detectar regresiones en la integración del paquete `ptts` y en la validación de `bundle.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MOS, CMOS), tasa de error de pronunciación, real-time factor ni comparaciones objetivas con otros sistemas TTS.

## Requisitos de hardware

- **VRAM / memoria estimada**: con 31 millones de parámetros, el peso en memoria ronda los 124 MB en fp32 y unos 62 MB en fp16 (cálculo aritmético a partir del número de parámetros; la precisión real del build Core ML no está documentada). El repositorio completo ocupa 0,1 GB.
- **GPU recomendadas**: no aplica en el sentido habitual de inferencia con CUDA. Core ML distribuye la ejecución entre CPU, GPU y Neural Engine del SoC Apple; el modelo está pensado para ejecutarse en el Neural Engine de dispositivos Apple.
- **Compatibilidad con hardware de consumo**: sí, siempre que sea hardware Apple con iOS 18 o macOS 15 (iPhone, iPad y Mac con Apple Silicon o Intel compatible con macOS 15). No está diseñado para GPU NVIDIA ni AMD en Linux o Windows.
- **Opciones de despliegue**: Core ML a través del paquete Swift `ptts` (método `PhononModels.download(from:progress:)`). vLLM, llama.cpp, Ollama y TGI no aplican a este formato.
- **Latencia y throughput**: no disponibles. No se publica real-time factor ni métricas de tiempo a primer audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `mosiah/phonon-31m-en-coreml` | 31M | Inglés | Core ML | Apache-2.0 | Build de terceros para iOS 18 / macOS 15, 9 voces |
| `gradium/phonon-31m-en` | 31M | Inglés | No disponible en esta ficha | Apache-2.0 | Modelo base original de Gradium; referencia para comparar la conversión |
| Kokoro-82M | 82M | Multilingüe | ONNX y otros | Apache-2.0 | Alternativa ligera muy extendida para TTS local; requiere verificar voces y calidad en su model card |
| Piper | Varía según la voz | Multilingüe | ONNX | MIT (motor) | Motor TTS orientado a dispositivos de bajos recursos; licencias de las voces individuales a verificar |

Los datos de las filas correspondientes a Kokoro-82M y Piper no provienen de la información proporcionada en esta ficha y deben contrastarse en sus respectivas model cards y repositorios antes de tomar una decisión.

## Limitaciones y advertencias

- **Cobertura lingüística reducida**: solo inglés. No hay soporte documentado de castellano ni de otras lenguas, por lo que no sirve para productos dirigidos al mercado hispanohablante sin un modelo adicional.
- **Dependencia exclusiva del ecosistema Apple**: el build es Core ML y requiere iOS 18 o macOS 15 con el paquete `ptts`. No es portable a Android, Linux ni Windows, lo que limita su uso a aplicaciones Apple.
- **Copia de terceros no avalada**: la model card indica explícitamente que esta copia no está hecha ni respaldada por Gradium ni por Kyutai. Cualquier incidencia debe contrastarse contra el modelo base y el repositorio original.
- **Catálogo de voces modificado**: se ha pasado de las voces originales del release a nueve, con `bundle.json` regenerado. No hay evidencia publicada de que la reducción no afecte al comportamiento esperado por el paquete `ptts`.
- **Ausencia de validación comunitaria**: cero descargas y cero likes en el momento de la consulta. No existen informes independientes de calidad, latencia ni estabilidad en producción.
- **Sin métricas de calidad de audio**: no se publican MOS ni evaluaciones perceptuales, de modo que la calidad y la naturalidad de las nueve voces no pueden compararse objetivamente con alternativas.
- **Riesgo de errores de pronunciación**: al no documentarse el preprocesado de texto, no hay garantías sobre el tratamiento de números, siglas, nombres propios, siglas médicas o texto con caracteres no ingleses; es esperable cierta tasa de lectura incorrecta que requiere normalización previa en la aplicación.
- **Sin controles de prosodia documentados**: no se mencionan SSML, marcas de énfasis, pausas ni ajuste de velocidad; la única palanca disponible es la elección de voz.
- **Sin filtrado de contenido**: al ser un modelo TTS puro, no incorpora moderación del texto de entrada; la aplicación debe implementar sus propias salvaguardas frente a usos indebidos, especialmente en generación de audio engañoso.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero conviene revisar también la licencia de las voces (`gradium/phonon-voices`, Apache-2.0 según la model card) y conservar los avisos de atribución a Gradium y Kyutai.
- **Fechas y versión**: el repositorio se creó y actualizó el 20 de octubre de 2026 según los metadatos, y la build se corresponde con la release v0.4.0 del proyecto original; versiones posteriores del modelo base no están reflejadas aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mosiah/phonon-31m-en-coreml
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Voces: https://huggingface.co/gradium/phonon-voices
- Repositorio de origen del artefacto Core ML: https://github.com/gradium-ai/xn-ptts
- Artefacto de referencia: release v0.4.0, asset `phonon-31m-en-coreml.zip` (SHA-256 `10f3a99fd39256db44f826267ef21d78cca959b16c0554926344c09fde27b436`)
