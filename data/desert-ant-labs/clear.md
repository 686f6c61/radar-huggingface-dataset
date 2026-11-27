# desert-ant-labs/clear

## Resumen

Clear es un modelo de mejora de voz (speech enhancement) desarrollado por Desert Ant Labs, diseñado para ejecutarse íntegramente en el dispositivo. Resuelve tres problemas clásicos del audio grabado en condiciones no controladas: reducción de ruido de fondo, eliminación de reverberación (dereverb) y normalización de sonoridad, produciendo una salida a 48 kHz con un carácter "de estudio". Está pensado para podcasters, creadores de vídeo y aplicaciones de voz que necesitan calidad de estudio sin depender de servicios en la nube.

El modelo se distribuye como pesos precompilados para múltiples runtimes: Core ML (aprovechando la Apple Neural Engine en iOS, macOS, tvOS y visionOS), LiteRT/TFLite y ONNX para Android, Linux, Windows, navegador y Node. El repositorio ocupa 0,3 GB e incluye los artefactos necesarios para cada plataforma. La licencia es propietaria de tipo "source-available" (desert-ant-labs-source-available), no open source en sentido estricto.

La relevancia actual del modelo radica en su enfoque on-device: elimina la latencia de red y el coste por minuto de procesamiento en la nube, algo crítico para apps de grabación y comunicación en tiempo real. No se dispone de información pública sobre la arquitectura interna, el número de parámetros ni los datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (procesa audio, no texto) |
| Tipos de cuantización | no disponible (se distribuyen pesos precompilados para Core ML, LiteRT/TFLite y ONNX) |
| Idiomas soportados | no disponible (procesamiento de audio independiente del idioma) |
| Licencia | desert-ant-labs-source-available (propietaria, "other") |
| Formato de pesos | Core ML, LiteRT/TFLite, ONNX |
| Frecuencia de salida | 48 kHz |
| Plataformas | iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador, Node |
| Variantes | clear-studio (por defecto), clear-natural |
| Versión de pesos | v0.3.0 |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de red, número de capas, parámetros o mecanismo de procesamiento). La model card únicamente describe el comportamiento funcional: procesa una señal de audio ruidosa y reverberante y devuelve audio limpio a 48 kHz con sonoridad normalizada. El modelo procesa un canal por pasada de inferencia; el modo estéreo implica dos pasadas (medido en 1,8 veces el coste de una pasada mono según el autor).

Tampoco se detallan los datos de entrenamiento, el volumen de horas de audio utilizadas, la composición del dataset ni si se emplearon técnicas de entrenamiento adversarial, discriminadores o ajuste fino perceptual. La model card menciona explícitamente que el modelo no introduce artefactos de bombeo (pumping) ni ruido musical, y que preserva respiraciones, plosivas y textura vocal, lo que sugiere un entrenamiento orientado a preservar la naturalidad de la voz, pero no se aportan detalles técnicos verificables.

## Capacidades

- Reducción de ruido de fondo: elimina HVAC, clics de teclado, ruido de ratón, golpes de micrófono, zumbido de sala, ventiladores de portátil y ambiente de cafetería.
- Eliminación de reverberación: reduce el eco de habitaciones sin tratar (dormitorios, oficinas, habitaciones de hotel) sin añadir reverberación artificial.
- Normalización de sonoridad: ofrece presets de mastering (por ejemplo, Spotify) y medición de LUFS y true peak en dBFS.
- Salida a 48 kHz, mono por defecto y estéreo opcional con mastering conjunto de canales (una ganancia y una envolvente de limitador compartidas).
- Procesamiento on-device en Apple Neural Engine vía Core ML y en el resto de plataformas vía LiteRT/TFLite y ONNX.
- Dos variantes de sonido (clear-studio y clear-natural), seleccionables solo desde el SDK de Swift.
- API en Swift, Kotlin y JavaScript/TypeScript, con procesamiento en memoria o desde fichero.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión, audio-a-texto ni multilingüismo textual, al no ser un modelo de lenguaje.

## Casos de uso

- Grabación de podcast en entornos ruidosos: el modelo limpia la señal de un micrófono integrado o Bluetooth grabada en una cafetería y la convierte en audio con sonoridad de estudio, sin subir el audio a la nube.
- Creación de vídeo para redes: normaliza la pista de voz a un preset de loudness (por ejemplo, Spotify) y elimina el eco de una habitación sin tratar, integrable en apps de edición móvil.
- Reuniones y notas de voz: mejora grabaciones de reuniones capturadas con el micrófono del portátil o del teléfono, reduciendo teclados y ventiladores antes de transcribir o archivar.
- Aplicaciones de voz en tiempo real: al ejecutarse en la Neural Engine o en LiteRT, permite procesar audio en el dispositivo sin latencia de red, adecuado para apps de comunicación y grabación.
- Procesamiento por lotes en servidor o CI: mediante el paquete de Node o la build nativa, se puede limpiar un catálogo de episodios de podcast en un pipeline automatizado.
- Aplicaciones web de edición de audio: con la build de navegador (LiteRT.js) se puede ofrecer limpieza de voz sin backend, manteniendo el audio del usuario en su equipo.
- Apps móviles multiplataforma: el mismo modelo cubre iOS (Core ML) y Android (LiteRT) con APIs nativas en Swift y Kotlin, reduciendo la fragmentación del stack de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta una métrica operativa: el modo estéreo cuesta 1,8 veces una pasada mono (dos pasadas de inferencia, una por canal). No se ofrecen cifras de PESQ, STOI, DNSMOS, RTF ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible. El repositorio de pesos ocupa 0,3 GB, pero no se indica el consumo en ejecución.
- GPU recomendadas: no aplica en el flujo principal; el modelo está optimizado para Apple Neural Engine (Core ML) y para CPU/NPU vía LiteRT en Android, Linux, Windows y navegador.
- Compatibilidad con GPU de consumo: no se documenta soporte CUDA ni requisitos de GPU dedicada; el enfoque es on-device en CPU/NPU.
- Opciones de despliegue: SDKs oficiales de Desert Ant Labs para Swift (Core ML), Kotlin (LiteRT) y JavaScript/TypeScript (LiteRT.js en navegador y core nativo en Node). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: solo se conoce el factor 1,8x del estéreo frente al mono; no se publican tiempos absolutos ni realtime factor de referencia.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/entrada | Licencia | Despliegue on-device | Disponibilidad |
|---|---|---|---|---|---|
| Clear (desert-ant-labs) | Mejora de voz audio-audio | Audio, salida 48 kHz | Propietaria source-available | Sí (Core ML, LiteRT, ONNX) | Hugging Face, SDKs oficiales |
| RNNoise | Supresión de ruido | Audio 48 kHz | BSD-3 | Sí (C, integrable) | GitHub |
| DeepFilterNet | Supresión de ruido y dereverb | Audio 48 kHz | MIT/Apache (según versión) | Parcial (Rust/C, ONNX) | GitHub, Hugging Face |
| Demucs (variantes de denoise) | Separación y limpieza | Audio | MIT | No orientado a móvil | GitHub |

No se dispone de datos de benchmarks que permitan comparar la calidad objetiva de Clear frente a estas alternativas; la comparación se limita a licencia, plataformas y enfoque de despliegue.

## Limitaciones y advertencias

- Licencia propietaria "source-available": no es open source; el uso comercial está sujeto a los términos de https://license.desertant.com/, que deben revisarse antes de integrar el modelo en un producto.
- No se publican detalles de arquitectura, parámetros ni datos de entrenamiento, lo que dificulta la auditoría técnica y la reproducibilidad.
- No hay benchmarks objetivos (PESQ, DNSMOS, etc.) que respalden las afirmaciones cualitativas de la model card.
- El modelo está orientado a voz; su comportamiento con música, instrumentos o fuentes no vocales no está documentado.
- No se documentan sesgos por idioma, acento o género; al ser un modelo de audio, el riesgo de sesgo existe pero no está cuantificado.
- El procesamiento estéreo duplica el coste de inferencia (1,8x) y el mastering conjunto puede alterar la imagen estéreo si los canales se grabaron a niveles muy distintos (se ofrece `balanceChannelsLUFS` para corregirlo).
- La selección de variante (clear-studio vs clear-natural) solo está disponible en el SDK de Swift; en Kotlin y JavaScript se usa la variante por defecto.
- No se especifican requisitos mínimos de hardware ni latencia absoluta, lo que complica la planificación de producción en tiempo real.
- La descarga de pesos se realiza desde Hugging Face en el primer uso y se cachea; en entornos sin red o con políticas restrictivas de descarga hay que prever el aprovisionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/clear
- Pesos v0.3.0: https://huggingface.co/desert-ant-labs/clear/tree/v0.3.0
- Demo: https://desertant.com/models/clear/
- Licencia: https://license.desertant.com/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descargas y caché de modelos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
