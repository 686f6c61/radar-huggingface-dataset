# desert-ant-labs/ear

## Resumen

Ear es un modelo de identificación de idioma hablado (spoken language identification) desarrollado por Desert-Ant-Labs. Su función es determinar en qué idioma se está hablando en un fragmento de audio de entre 5 y 30 segundos, antes de enviar ese audio a un sistema de transcripción. Resuelve un problema concreto en pipelines de ASR multilingüe: elegir el reconocedor o el modelo de transcripción correcto sin intervención del usuario ni llamadas a servicios en la nube.

El modelo cubre 102 idiomas y está diseñado explícitamente para inferencia en el dispositivo (on-device). Se distribuye en dos formatos: Core ML para plataformas Apple (5,0 MB) y LiteRT/TFLite para Android, Linux, Windows y Node (10,7 MB). La latencia declarada por el autor es de 7,6 ms en un MacBook Pro, lo que lo hace viable en tiempo real incluso en hardware móvil.

La relevancia actual del modelo está en su enfoque de enrutamiento con control de fiabilidad: devuelve una puntuación de confianza por idioma y marca la respuesta como no fiable cuando las dos hipótesis principales están demasiado próximas, permitiendo al sistema preguntar al usuario o recurrir a un modelo general en lugar de transcribir en el idioma equivocado. El repositorio ocupa 0,1 GB y acumula 732 descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación de audio compilado a LiteRT y Core ML) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 5 a 30 segundos |
| Tipos de cuantizacion | no disponible (se distribuyen artefactos compilados de 5,0 MB en Core ML y 10,7 MB en LiteRT) |
| Idiomas soportados | 102 idiomas (af, am, ar, as, ast, az, be, bg, bn, bs, ca, ceb, ckb, cs, cy, da, de, el, en, es, et, eu, fa, ff, fi, fil, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, ig, is, it, ja, jv, ka, kam, kea, kk, km, kn, ko, ky, lb, lg, ln, lo, lt, luo, lv, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, no, nso, ny, oc, om, or, pa, pl, ps, pt, ro, ru, sd, sk, sl, sn, so, sr, sv, sw, ta, te, tg, th, tr, uk, umb, ur, uz, vi, wo, xh, yo, zh, zu) |
| Licencia | desert-ant-labs-source-available (source-available, no open source) |
| Formato de pesos | Core ML (Apple) y LiteRT/TFLite (Android, Linux, Windows, Node, navegador) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de extractor de características, número de capas, mecanismo de atención o tamaño del encoder). Lo que sí se documenta es el resultado del proceso de compilación: el modelo se distribuye como artefactos optimizados para inferencia en el dispositivo, con un binario Core ML de 5,0 MB para iOS, macOS, tvOS y visionOS, y un binario LiteRT de 10,7 MB para Android, Linux, Windows, navegador (vía WebAssembly y LiteRT.js) y Node (mediante un núcleo nativo precompilado).

Tampoco se especifican en la información proporcionada el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de ajuste fino con preferencias (RLHF/DPO). La evaluación declarada se realizó sobre conjuntos de test de Common Voice, VoxPopuli, Multilingual LibriSpeech, NST y un conjunto propio de condiciones de inglés (LibriSpeech, AMI, CHiME-6, NOTSOFAR-1), lo que sugiere un entrenamiento orientado a diversidad de dominio y de condiciones acústicas. La innovación destacable no está en la arquitectura sino en la interfaz de salida: puntuaciones de confianza por idioma más una señal booleana de fiabilidad que compara las dos hipótesis principales.

## Capacidades

- Identificación de idioma hablado sobre fragmentos de 5 a 30 segundos de audio.
- Salida con las principales predicciones ordenadas por probabilidad (`candidates`), idioma ganador (`language`) y confianza asociada (`confidence`).
- Señal de fiabilidad (`isReliable`) que marca como no concluyente la detección cuando las dos primeras hipótesis están demasiado próximas.
- Acepta audio desde fichero o muestras ya decodificadas a cualquier frecuencia de muestreo (por ejemplo, 44,1 kHz), con remuestreo interno.
- Cobertura de 102 idiomas, incluyendo lenguas de bajos recursos (luo, umb, kam, kea, nso, wo, ff, lg, ln).
- Ejecución completamente offline en el dispositivo, sin llamadas a servicios externos.
- SDK multiplataforma: Swift (iOS, macOS, tvOS, visionOS), Kotlin (Android), JavaScript/TypeScript (navegador vía WASM y Node vía núcleo nativo).
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio-a-texto; es exclusivamente un clasificador de audio.

## Casos de uso

- Enrutamiento previo a la transcripción en apps de dictado multilingüe: se ejecuta Ear sobre los primeros segundos de audio y se selecciona el modelo ASR correspondiente (por ejemplo, un reconocedor específico de portugués frente a uno de español), evitando transcripciones en el idioma equivocado.
- Atención al cliente con líneas de voz internacionales: al recibir una llamada, el sistema detecta el idioma del cliente en los primeros 5-30 segundos y enruta al agente o al bot del idioma adecuado, sin menús interactivos.
- Subtitulado automático de contenido generado por usuarios: antes de invocar un pipeline de ASR, Ear clasifica el audio subido y descarta o redirige los clips cuyo idioma no está cubierto por el modelo de transcripción contratado.
- Cumplimiento y moderación de contenido: etiquetar automáticamente el idioma de grabaciones almacenadas para aplicar políticas de retención o revisión por región lingüística, con la ventaja de que el procesado ocurre en el dispositivo y el audio no sale de él.
- Asistentes de voz embebidos en dispositivos móviles o de borde: con 5,0 MB en Core ML y 7,6 ms de latencia en un MacBook Pro, el modelo cabe en el ciclo de interacción de un asistente sin consumir red ni batería de forma apreciable.
- Aplicaciones de accesibilidad: detección del idioma del interlocutor para configurar la síntesis de voz, los subtítulos en vivo o la traducción en un dispositivo personal, manteniendo el audio local.
- Gestión de archivos y bibliotecas multimedia: indexación automática de una fonoteca por idioma para búsqueda y filtrado, ejecutable en un portátil o en un servidor Linux sin GPU.
- Enrutamiento en centros de transcripción masiva: clasificación rápida de lotes de audio en Node o Linux antes de distribuirlos entre colas de reconocedores especializados, reduciendo el coste de reintentos por idioma incorrecto.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente; `verified: false` en el model-index). La métrica "recognizer routing accuracy" mide el acierto al seleccionar el reconocedor correcto, presumiblemente contando como acierto los casos marcados como no fiables que se derivan a un modelo general.

| Dataset | Idiomas | Clips (5-30 s) | Accuracy de identificación | Accuracy de enrutamiento |
|---|---|---|---|---|
| Common Voice | 15 | 7.500 | 0,980 | 0,990 |
| VoxPopuli | 16 | 3.221 | 0,993 | 0,998 |
| Multilingual LibriSpeech | 7 | 2.660 | 0,992 | 0,997 |
| NST (noruego y sueco) | 2 | 1.000 | 0,996 | 1,000 |
| Inglés en cuatro condiciones (LibriSpeech, AMI, CHiME-6, NOTSOFAR-1) | 1 | 1.660 | 0,977 | 0,980 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos de identificación de idioma, ni cifras de throughput más allá de la latencia de 7,6 ms por inferencia en un MacBook Pro declarada en la model card.

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU, NPU y GPU integrada. Los artefactos son de 5,0 MB (Core ML) y 10,7 MB (LiteRT), por lo que el consumo de memoria es del orden de decenas de MB incluyendo el runtime.
- GPU dedicadas: innecesarias. No se documenta soporte de CUDA ni de aceleración en A100, H100 o RTX 4090, y el formato de pesos (Core ML, LiteRT) no está orientado a esos entornos.
- GPU de consumo: no requiere ninguna; funciona en Apple Neural Engine, GPU integrada y CPU móvil.
- Despliegue: Core ML en plataformas Apple; LiteRT/TFLite en Android, Linux, Windows, navegador (WASM con LiteRT.js) y Node (núcleo nativo precompilado). SDKs oficiales vía Swift Package Manager, Maven (`ai.desertant:ear`) y npm (`@desert-ant-labs/ear`).
- Latencia: 7,6 ms por inferencia en un MacBook Pro según el autor. No se publican cifras de throughput en lote ni latencias en dispositivos móviles concretos.
- Almacenamiento: descarga bajo demanda en el primer uso; el paquete completo del repositorio ocupa 0,1 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto / ventana | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| desert-ant-labs/ear | Clasificador de audio (LID) | 102 | 5-30 s de audio | source-available | Core ML, LiteRT | On-device, 5,0-10,7 MB, 7,6 ms por inferencia |
| Whisper (large-v3) | ASR seq2seq | ~99 | 30 s de audio | MIT | safetensors, GGUF, etc. | Detecta idioma como subproducto, pero requiere el modelo completo (cientos de millones a 1.500 M de parámetros) y no está pensado para ejecución de borde |
| MMS-LID (Meta) | Clasificador de audio (LID) | 100+ | fragmentos cortos | CC-BY-NC | PyTorch | Requiere entorno PyTorch; licencia no comercial |
| VoxLingua107 (SpeechBrain) | Clasificador de audio (LID) | 107 | fragmentos de pocos segundos | Apache 2.0 | PyTorch | Referencia académica habitual; sin artefactos móviles oficiales |

Los datos de rendimiento de los modelos alternativos no se incluyen en la información proporcionada, por lo que no se establece comparación numérica de precisión. La ventaja diferencial de Ear frente a las alternativas es el tamaño (5-10 MB), la latencia declarada y la disponibilidad de artefactos para Core ML y LiteRT con SDKs oficiales en Swift, Kotlin y JavaScript.

## Limitaciones y advertencias

- Licencia source-available (`desert-ant-labs-source-available`), no open source: es imprescindible revisar los términos en https://license.desertant.com/ antes de cualquier uso comercial, redistribución o modificación.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no hay evaluación independiente publicada en la información disponible.
- La ventana de audio útil es de 5 a 30 segundos; no se documenta comportamiento con clips más cortos ni con audio muy largo sin segmentar.
- Riesgo de confusión entre lenguas próximas (por ejemplo, noruego y sueco, o variedades iberorromances); el propio diseño del modelo contempla esta situación mediante la señal `isReliable`, que debe gestionarse explícitamente en producción.
- No se documentan sesgos por acento, edad, sexo del hablante ni condición acústica, más allá del conjunto específico de condiciones de inglés evaluado (AMI, CHiME-6, NOTSOFAR-1).
- La cobertura de 102 idiomas no implica el mismo rendimiento en todos ellos; los conjuntos de evaluación publicados cubren entre 1 y 16 idiomas, no los 102.
- El modelo solo clasifica idioma: no transcribe, no traduce y no genera texto. Cualquier capacidad de ASR debe aportarla un modelo separado.
- La descarga del modelo ocurre en el primer uso, lo que introduce una dependencia de red inicial en apps móviles si no se empaqueta el artefacto con la aplicación.
- No se documentan requisitos de versiones mínimas de sistema operativo ni de runtime LiteRT/Core ML más allá del enlace a los requisitos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/ear
- Pesos v0.2.0: https://huggingface.co/desert-ant-labs/ear/tree/v0.2.0
- Repositorio del SDK (desert-ant-core): https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos para Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos para Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos para JavaScript y TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Licencia: https://license.desertant.com/
- Documentación fuente de la model card: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/ear.md
