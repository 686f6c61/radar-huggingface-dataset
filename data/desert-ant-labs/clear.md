# desert-ant-labs/clear

## Resumen

Clear es un modelo de mejora de voz (speech enhancement) desarrollado por Desert Ant Labs que opera íntegramente en el dispositivo. Su función es triple: eliminar ruido de fondo, eliminar reverberación de sala (dereverb) y normalizar la sonoridad de la señal resultante, entregando audio a 48 kHz con una calidad que el autor describe como "de estudio". Está pensado para podcasters, creadores de vídeo y aplicaciones de voz que necesitan limpiar grabaciones hechas con micrófonos Bluetooth, micrófonos integrados de portátil o de teléfono, en entornos domésticos u hostiles (cafeterías, oficinas sin tratar, habitaciones de hotel).

El modelo se distribuye principalmente como artefactos ligeros para inferencia en producción: pesos en formato TFLite y ONNX, con soporte para Core ML (Apple Neural Engine) en iOS, macOS, tvOS y visionOS, LiteRT en Android, Linux, Windows y navegador, y un núcleo nativo precompilado para Node. El repositorio de Hugging Face ocupa 0,3 GB, lo que confirma que no es un modelo de lenguaje de gran tamaño sino un modelo de audio compacto optimizado para latencia y despliegue móvil.

La relevancia actual del modelo reside en que cubre una necesidad muy concreta —procesado de audio profesional sin coste de nube ni envío de datos a terceros— con un SDK multiplataforma y una licencia source-available. No se dispone de información pública sobre su arquitectura interna, número de parámetros ni composición del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de audio-to-audio para mejora de voz) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa audio; ventana de procesado no especificada) |
| Tipos de cuantización | no disponible (se distribuyen artefactos TFLite, ONNX y Core ML) |
| Idiomas soportados | no disponible (procesado de voz, independiente del idioma en principio) |
| Licencia | desert-ant-labs-source-available (source-available, no open source) |
| Formato de pesos | TFLite, ONNX, Core ML |
| Frecuencia de salida | 48 kHz |
| Canales | mono por defecto; estéreo opcional (coste ~1,8x por pasada adicional) |
| Tamaño del repositorio | 0,3 GB |
| Variantes | clear-studio (por defecto) y clear-natural |
| Plataformas | iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador, Node |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. Por la naturaleza de la tarea (audio-to-audio, denoising, dereverb y normalización de sonoridad) y por el formato de despliegue (TFLite, ONNX, Core ML), se trata de una red neuronal compacta optimizada para inferencia en dispositivo, probablemente con arquitectura de tipo encoder-decoder sobre representaciones espectrales o formas de onda, pero esto no está confirmado por el autor.

Tampoco se dispone de datos sobre el número de tokens o horas de audio de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste fino supervisado. El modelo se ofrece en dos variantes (clear-studio y clear-natural) del mismo tamaño y velocidad, que se diferencian únicamente en el carácter sonoro de la salida: clear-studio produce silencios cercanos a cero absoluto y un carácter más "de estudio", mientras que clear-natural preserva mayor textura vocal. Solo el SDK de Swift permite seleccionar variante mediante `Clear(variant: .clearNatural)`.

Como innovación destacable, el SDK realiza un masterizado conjunto de canales con una única ganancia y una única envolvente de limitador aplicada a todos los canales, preservando la imagen estéreo original. También expone métricas de proceso como `realtimeFactor`, `measuredLUFS`, `measuredTruePeakDBFS` y `phaseTimings.modelPredictSec`.

## Capacidades

- Eliminación de ruido de fondo: HVAC, clics de teclado, roces de ratón, golpes de micrófono, zumbido de sala, ventiladores de portátil y ruido ambiente de cafetería, sin degradar consonantes.
- Eliminación de reverberación: reduce la reverberación de habitaciones sin tratar (dormitorios, oficinas, hoteles) sin añadir reverberación artificial.
- Normalización de sonoridad: masterizado con presets de loudness (por ejemplo, `LoudnessPreset.SPOTIFY`), con medición de LUFS y true peak en dBFS.
- Salida a 48 kHz, mono por defecto y estéreo opcional con preservación de la imagen estéreo.
- Procesado en tiempo real o por lotes, con retorno del factor de tiempo real (`realtimeFactor`).
- Ejecución 100 % en dispositivo: Apple Neural Engine vía Core ML, LiteRT en Android/Linux/Windows/navegador, núcleo nativo en Node.
- API en Swift, Kotlin y JavaScript/TypeScript, con procesado en memoria (sin sistema de ficheros) y por fichero.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multimodales: es un modelo de audio-to-audio especializado.

## Casos de uso

- Podcasting en movilidad: grabar en una cafetería o habitación de hotel y obtener audio con ruido y reverberación reducidos y sonoridad normalizada a 48 kHz, listo para publicar sin pasar por una suite de postproducción.
- Creación de vídeo para redes: limpiar la pista de voz de grabaciones hechas con micrófono integrado de portátil o teléfono antes de montar el vídeo, manteniendo la textura vocal y sin artefactos de bombeo.
- Aplicaciones de voz móviles: integrar el SDK de iOS o Android para preprocesar el audio del usuario antes de enviarlo a un motor de reconocimiento de voz o a un asistente conversacional, reduciendo errores de transcripción en entornos ruidosos.
- Reuniones y grabación de llamadas: procesar audio capturado por grabadoras de reunión o micrófonos Bluetooth para obtener una pista limpia y con nivel constante, sin subir el audio a la nube.
- Herramientas de edición en navegador: usar la distribución JavaScript con LiteRT para ofrecer limpieza de voz directamente en el navegador, sin backend ni coste de servidor.
- Pipelines de postproducción en servidor: emplear el paquete de Node con núcleo nativo para procesar lotes de episodios o clips en CI/CD o en un servicio interno, con métricas de true peak y LUFS para control de calidad.
- Aplicaciones de accesibilidad: mejorar la inteligibilidad de grabaciones de voz para personas con dificultades auditivas o para subtitulado automático, eliminando reverberación y ruido de fondo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta el coste relativo del modo estéreo frente al mono (1,8x por una pasada de inferencia adicional por canal) y expone métricas en tiempo de ejecución (`realtimeFactor`, `measuredLUFS`, `measuredTruePeakDBFS`), pero no se proporcionan valores absolutos de latencia, throughput ni métricas objetivas de calidad (PESQ, STOI, DNSMOS, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo pesa 0,3 GB, por lo que el modelo cabe holgadamente en memoria de dispositivos móviles y en GPUs de consumo, pero no se publican cifras de memoria en inferencia.
- GPU recomendadas: no aplica en el sentido habitual; el modelo está optimizado para Apple Neural Engine (Core ML) y para LiteRT en CPU/GPU móvil. Para servidor se puede usar el núcleo nativo de Node, pero no se especifican requisitos de GPU.
- Compatibilidad con GPU de consumo: no se documenta; el diseño está orientado a ejecución en dispositivo (móvil, navegador, portátil), no a GPUs de escritorio dedicadas.
- Opciones de despliegue: SDK oficial para Swift (iOS/macOS/tvOS/visionOS), Kotlin (Android), JavaScript/TypeScript (navegador con LiteRT y Node con núcleo nativo). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: solo se conoce el factor relativo del modo estéreo (1,8x respecto a mono). No se publican valores absolutos de latencia ni de tiempo real alcanzado por plataforma.

## Comparativa con modelos similares

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa rigurosa con alternativas concretas de la misma categoría (mejora de voz on-device). Se indica "no disponible" para parámetros, contexto y rendimiento de modelos comparables, ya que no se han facilitado datos de terceros ni benchmarks propios.

| Modelo | Parámetros | Contexto | Licencia | Despliegue on-device |
|---|---|---|---|---|
| Clear (desert-ant-labs) | no disponible | no aplica | source-available | Sí (Core ML, LiteRT, Node) |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia source-available, no open source: el uso comercial está sujeto a los términos de https://license.desertant.com/, que no se detallan en la información disponible. Es imprescindible revisarlos antes de integrar el modelo en un producto.
- No se han publicado datos sobre sesgos, composición del dataset ni cobertura de acentos, géneros o tipos de micrófono; el rendimiento puede variar según la fuente de audio.
- Riesgo de artefactos en condiciones extremas de ruido o reverberación no documentado; el autor afirma que no introduce bombeo ni ruido musical, pero no se aportan métricas objetivas que lo respalden.
- El modelo procesa un canal por pasada: el estéreo duplica el coste de inferencia (1,8x medido), lo que puede ser relevante en dispositivos con recursos limitados.
- La normalización de sonoridad aplica una ganancia y un limitador comunes a todos los canales; si los canales se grabaron a niveles distintos, es necesario configurar `Mastering.balanceChannelsLUFS` para equilibrarlos antes del masterizado.
- La selección de variante (clear-studio vs clear-natural) solo está disponible en el SDK de Swift; en Kotlin y JavaScript se usa la variante por defecto.
- No se especifican requisitos mínimos de versión de sistema operativo ni de hardware más allá de las plataformas listadas; conviene consultar los requisitos del SDK en el repositorio.
- Al ser un modelo de audio-to-audio, no ofrece generación de texto, razonamiento, código ni tool calling; no debe evaluarse con los criterios habituales de un LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/clear
- Pesos v0.3.0: https://huggingface.co/desert-ant-labs/clear/tree/v0.3.0
- Demo: https://desertant.com/models/clear/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descargas y caché de modelos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
- Licencia: https://license.desertant.com/
