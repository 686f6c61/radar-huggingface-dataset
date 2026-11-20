# desert-ant-labs/clear

## Resumen

Clear es un modelo de mejora de voz (speech enhancement) diseñado para ejecutarse íntegramente en el dispositivo, sin depender de la nube. Lo desarrolla Desert Ant Labs y aborda tres tareas combinadas en una sola pasada: reducción de ruido, eliminación de reverberación (dereverberation) y normalización de sonoridad, con salida a 48 kHz. Su propuesta de valor es ofrecer "sonido de estudio sin factura de nube" a podcasters, creadores de vídeo y aplicaciones de voz que graban en entornos no tratados acústicamente, como cafeterías, oficinas o habitaciones sin acondicionar.

El modelo se distribuye como artefactos optimizados para inferencia local: Core ML para el Apple Neural Engine (iOS, macOS, tvOS, visionOS), LiteRT/TFLite para Android, Linux, Windows y navegador, y ONNX como formato adicional. No es un modelo generativo de texto ni un LLM: es un modelo audio-audio especializado en procesado de señal de voz, con un repositorio de aproximadamente 0,3 GB que incluye los pesos en sus distintas variantes de runtime.

La relevancia actual de Clear radica en que traslada un pipeline de postproducción de audio (denoise, dereverb, loudness mastering con presets tipo Spotify) a SDKs nativos para Swift, Kotlin y JavaScript, eliminando latencia de red y costes por minuto procesado. La versión de pesos documentada es v0.3.0 y el SDK que lo acompaña va por la versión 4.3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo audio-audio especializado en mejora de voz; no se detalla la topología interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (procesa audio; no se especifica ventana de muestras ni duración máxima por pasada) |
| Tipos de cuantizacion | no disponible (se distribuyen artefactos Core ML, LiteRT/TFLite y ONNX, sin detallar precisiones) |
| Idiomas soportados | no disponible (procesado de voz independiente del idioma; la model card no lista idiomas) |
| Licencia | desert-ant-labs-source-available (source-available, no open source; enlace: https://license.desertant.com/) |
| Formato de pesos | Core ML, LiteRT/TFLite, ONNX (también empaquetados para el SDK Swift, Kotlin y JavaScript) |

Otros datos técnicos relevantes: frecuencia de salida fija de 48 kHz, procesado mono por defecto con opción estéreo (que cuesta una pasada de inferencia por canal, medida en 1,8 veces una ejecución mono), y mastering conjunto de canales con una única ganancia y una única envolvente de limitador.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (no se especifica si es un transformer, una red convolucional, un modelo híbrido o una arquitectura tipo U-Net de separación de fuentes). Tampoco se publican el número de parámetros, el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de ajuste como RLHF o DPO, que en un modelo audio-audio no serían el mecanismo habitual. Lo que sí se documenta es el comportamiento funcional: una sola pasada que reduce ruido estacionario y no estacionario (HVAC, teclas, roces de ratón, golpes de micrófono, zumbido de sala, ventiladores, ambiente de cafetería), elimina la reverberación de espacios no tratados sin añadir reverberación propia, y aplica normalización de sonoridad con medición de LUFS y true peak.

La innovación técnica destacable no está en la topología sino en el despliegue: el modelo se compila para el Apple Neural Engine vía Core ML y para LiteRT en el resto de plataformas, con SDKs que gestionan la descarga y caché de pesos desde Hugging Face en el primer uso. El SDK realiza mastering multicanal conjunto (una ganancia y un limitador comunes a todos los canales) para preservar la imagen estéreo, y ofrece un parámetro `balanceChannelsLUFS` para igualar canales grabados a niveles distintos antes del mastering. Se distribuyen dos variantes de sonido, `clear-studio` (por defecto, con silencios cercanos al cero absoluto) y `clear-natural`, del mismo tamaño y velocidad, seleccionables solo desde el SDK Swift mediante `Clear(variant: .clearNatural)`.

## Capacidades

- Reducción de ruido de fondo en voz hablada, incluyendo ruido estacionario (zumbido, HVAC, ventiladores) y transitorio (clics de teclado, golpes de micrófono, roces).
- Eliminación de reverberación de salas no tratadas (dormitorios, oficinas, habitaciones de hotel) sin introducir reverb artificial.
- Normalización de sonoridad con medición de LUFS y true peak dBFS, con presets de destino como Spotify.
- Salida a 48 kHz, independientemente de la frecuencia de entrada.
- Procesado mono por defecto y modo estéreo opcional con preservación de la imagen estéreo y mastering conjunto de canales.
- Ejecución totalmente on-device: Core ML con Apple Neural Engine en plataformas Apple; LiteRT en Android, Linux, Windows y navegador; ONNX disponible.
- Soporte de Node.js en servidor mediante el paquete nativo de JavaScript.
- Procesado en memoria (sin sistema de ficheros) devolviendo bytes WAV, útil en apps móviles.
- Informe de métricas por ejecución: factor de tiempo real (realtime factor), LUFS medidos, true peak medido y desglose de tiempos por fase (`modelPredictSec`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo audio-audio.

## Casos de uso

- Postproducción de podcast: el modelo limpia grabaciones hechas con micrófonos Bluetooth o integrados en portátil, elimina el eco de la habitación y normaliza la sonoridad a un preset de plataforma (por ejemplo Spotify), todo en local y sin subir el audio a un servicio externo.
- Grabación de vídeo para creadores: integrado en una app de edición, permite aplicar "sonido de estudio" a tomas grabadas en exteriores o interiores ruidosos antes de exportar, con salida a 48 kHz lista para el timeline.
- Aplicaciones de voz y VoIP: mejora en tiempo de ejecución de la captura del micrófono en llamadas o notas de voz, reduciendo ruido de cafetería y reverberación de sala sin coste de servidor por minuto.
- Herramientas de transcripción y reuniones: preprocesar el audio de reuniones grabadas con micrófonos de sala antes de pasarlo a un ASR, reduciendo errores provocados por ruido y reverb.
- Apps móviles nativas iOS/Android: el SDK Swift (Core ML, Neural Engine) y el SDK Kotlin (LiteRT) permiten empaquetar la mejora de audio en la app, con descarga y caché de pesos en el primer uso y procesado en memoria sin ficheros temporales.
- Procesado por lotes en servidor o CI: el paquete de Node con núcleo nativo permite limpiar archivos de audio en pipelines automatizados de publicación de contenido sin depender de APIs de terceros.
- Edición web en navegador: la variante JavaScript con LiteRT permite ofrecer limpieza de audio en una herramienta web sin enviar el audio al servidor, útil por privacidad y por coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta una métrica de coste relativo: el modo estéreo consume 1,8 veces el tiempo de una ejecución mono, y expone un factor de tiempo real (realtime factor) por ejecución, pero sin cifras absolutas de latencia ni de throughput por plataforma.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible. El repositorio completo ocupa 0,3 GB e incluye artefactos para varios runtimes, por lo que el conjunto de pesos de un runtime concreto será inferior a esa cifra.
- GPU recomendadas: no aplica en el sentido habitual; el modelo está pensado para aceleradores integrados. En Apple usa el Neural Engine vía Core ML; en Android, Linux, Windows y navegador usa LiteRT (CPU/GPU/NPU según el backend disponible); ONNX permite otros aceleradores no especificados.
- Cabe en hardware de consumo: sí, por diseño. Está orientado a iPhone, iPad, Mac, Apple TV, Vision Pro, móviles Android, portátiles y navegador.
- Opciones de despliegue: SDK Swift (Core ML), SDK Kotlin (LiteRT), paquete npm `@desert-ant-labs/clear` con variante navegador y variante nativa para Node, y artefactos ONNX/TFLite. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en cifras absolutas. El SDK expone `realtimeFactor` y `phaseTimings.modelPredictSec` para medirlos en cada ejecución, y documenta que el estéreo cuesta 1,8 veces una pasada mono.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| Clear (Desert Ant Labs) | Mejora de voz audio-audio | Denoise + dereverb + loudness en una pasada, 48 kHz | Core ML, LiteRT/TFLite, ONNX | Source-available | SDKs nativos Swift, Kotlin y JS; dos variantes de sonido |
| DeepFilterNet | Mejora de voz audio-audio | Supresión de ruido en tiempo real | Pesos PyTorch, ONNX, LADSPA | Open source (varía por versión) | Referencia académica; no incluye dereverb ni mastering integrados según la información disponible |
| RNNoise | Supresión de ruido | Red recurrente ligera para ruido | C, modelos pequeños | Open source | Muy ligero, sin dereverb ni normalización de sonoridad |
| Resemble Enhance | Mejora de voz | Denoise + enhancement generativo | PyTorch | Licencia propia | Orientado a GPU y postproducción, no a on-device |

La comparación se ofrece a nivel cualitativo porque no hay datos de benchmarks publicados para Clear que permitan contrastar métricas objetivas (PESQ, STOI, DNSMOS) frente a estas alternativas. Las filas de modelos comparables se basan en conocimiento general de la categoría y no en datos proporcionados en la información de origen.

## Limitaciones y advertencias

- Licencia source-available, no open source: el uso comercial está sujeto a los términos de https://license.desertant.com/, que deben revisarse antes de integrar el modelo en un producto. No se puede asumir libertad de uso, modificación o redistribución.
- No se publican detalles de arquitectura, parámetros ni datos de entrenamiento, lo que dificulta la auditoría técnica y la reproducibilidad.
- No hay benchmarks objetivos publicados (PESQ, STOI, DNSMOS ni similares); la evaluación de calidad es subjetiva según la model card.
- Riesgo de artefactos en voces no representadas en el entrenamiento (idiomas, acentos, registros no documentados); la lista de idiomas no está disponible.
- El procesado es mono por defecto: si se necesita estéreo, el coste de inferencia se multiplica (1,8 veces medido), lo que puede afectar a presupuestos de batería en móvil.
- No es un modelo generativo ni un LLM: no ofrece tool calling, agentes, razonamiento ni generación de texto; no debe evaluarse con benchmarks de lenguaje.
- La selección de variante de sonido (`clear-studio` frente a `clear-natural`) solo está disponible en el SDK Swift; en Kotlin y JavaScript se usa la variante por defecto.
- La salida está fijada a 48 kHz, lo que puede requerir remuestreo en pipelines que trabajen a 16 kHz u otras frecuencias.
- La descarga inicial de pesos desde Hugging Face introduce una dependencia de red en el primer arranque de la app; debe gestionarse la caché y los fallos de descarga.
- Riesgo de sobreprocesado en grabaciones ya limpias: el mastering y la reducción de ruido pueden alterar texturas vocales si se aplican sin criterio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/clear
- Pesos v0.3.0: https://huggingface.co/desert-ant-labs/clear/tree/v0.3.0
- Demo: https://desertant.com/models/clear/
- Licencia: https://license.desertant.com/
- Repositorio del SDK (desert-ant-core): https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descarga y caché de modelos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
- Documentación fuente de la model card: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/clear.md
