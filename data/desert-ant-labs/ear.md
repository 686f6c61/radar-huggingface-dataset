# desert-ant-labs/ear

## Resumen

Ear es un modelo de identificación de idioma hablado (spoken language identification, LID) desarrollado por Desert-Ant-Labs, diseñado para ejecutarse íntegramente en el dispositivo. Detecta el idioma de una grabación de audio de entre 5 y 30 segundos y devuelve una puntuación de confianza por idioma, además de una marca de fiabilidad cuando las dos hipótesis principales están demasiado próximas. Cubre 102 idiomas y se distribuye como Core ML (5,0 MB) para plataformas Apple y como LiteRT/TFLite (10,7 MB) para Android, Linux, Windows, navegador y Node.

El modelo resuelve un problema concreto en pipelines de reconocimiento de voz: elegir el modelo de transcripción correcto antes de transcribir. En lugar de lanzar un ASR multilingüe grande o arriesgarse a transcribir en el idioma equivocado, Ear enruta la petición al reconocedor adecuado con una latencia de 7,6 ms en un MacBook Pro. Es relevante ahora porque permite despliegues de ASR multilingüe en movilidad y en el borde sin conexión, sin coste de servidor ni transferencia de audio a la nube.

La ficha se basa exclusivamente en la model card y en los metadatos publicados en Hugging Face. La información sobre arquitectura interna, composición del dataset de entrenamiento y detalles de cuantización no está disponible en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación de audio; artefactos Core ML y LiteRT/TFLite) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 5 a 30 segundos por clip |
| Tipos de cuantización | no disponible (se distribuyen artefactos ya compilados: Core ML 5,0 MB, LiteRT 10,7 MB) |
| Idiomas soportados | 102 idiomas (af, am, ar, as, ast, az, be, bg, bn, bs, ca, ceb, ckb, cs, cy, da, de, el, en, es, et, eu, fa, ff, fi, fil, fr, ga, gl, gu, ha, he, hi, hr, hu, hy, id, ig, is, it, ja, jv, ka, kam, kea, kk, km, kn, ko, ky, lb, lg, ln, lo, lt, luo, lv, mi, mk, ml, mn, mr, ms, mt, my, ne, nl, no, nso, ny, oc, om, or, pa, pl, ps, pt, ro, ru, sd, sk, sl, sn, so, sr, sv, sw, ta, te, tg, th, tr, uk, umb, ur, uz, vi, wo, xh, yo, zh, zu) |
| Licencia | desert-ant-labs-source-available (source-available, no open source; enlace: https://license.desertant.com/) |
| Formato de pesos | Core ML (.mlmodelc/.mlpackage) y LiteRT/TFLite; SDK Swift, Kotlin y JavaScript/TypeScript |
| Plataformas | iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador (WebAssembly + LiteRT.js) y Node (núcleo nativo precompilado) |
| Tamaño del repositorio | 0,1 GB |
| Versión de pesos citada | v0.2.0 |
| Latencia declarada | 7,6 ms en MacBook Pro (por clip) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del extractor de características ni del clasificador. Lo que sí se documenta es el formato de despliegue: el modelo se compila a Core ML para Apple (aprovechando Core ML y, según las etiquetas, la Neural Engine) y a LiteRT/TFLite para el resto de plataformas, con un build WebAssembly para navegador y un núcleo nativo para Node. El paquete Core ML ocupa 5,0 MB y el de LiteRT 10,7 MB, lo que sitúa el modelo en la categoría de modelos de borde de un dígito o dos dígitos de megabyte.

No se han publicado en la información disponible el número de tokens o horas de audio de entrenamiento, la composición del dataset, ni si hubo ajuste fino con RLHF/DPO (no aplicable en un clasificador de audio). Tampoco se especifican innovaciones como decodificación especulativa o atención lineal. La innovación funcional documentada es el mecanismo de fiabilidad: además de la etiqueta de idioma y su confianza, el modelo expone `isReliable`, que se activa cuando las dos lenguas principales están demasiado próximas, y una lista de candidatos con probabilidades para permitir lógica de reserva.

## Capacidades

- Identificación de idioma hablado entre 102 lenguas a partir de 5 a 30 segundos de audio.
- Salida de puntuación de confianza por idioma y lista ordenada de candidatos (`candidates`).
- Indicador de fiabilidad (`isReliable`) para descartar predicciones ambiguas y activar reservas.
- Ejecución completamente en el dispositivo, sin conexión y sin enviar audio a servidores.
- Entrada flexible: ruta a fichero de audio o muestras PCM ya decodificadas a cualquier frecuencia de muestreo (por ejemplo, 44.100 Hz), con remuestreo interno.
- Integración nativa mediante SDK en Swift (iOS, macOS, tvOS, visionOS), Kotlin (Android) y JavaScript/TypeScript (navegador con WebAssembly y Node con núcleo nativo).
- Descarga diferida del modelo en el primer uso; la creación de la instancia no descarga ni carga nada.
- No es un modelo generativo: no hace transcripción, traducción, tool calling ni razonamiento multi-paso.

## Casos de uso

- Enrutado de ASR multilingüe: identificar el idioma de la grabación antes de invocar el reconocedor específico, de modo que un pipeline con varios modelos monolingües o por familia lingüística no transcriba en la lengua equivocada. La precisión de enrutado declarada (0,99 en Common Voice, 0,998 en VoxPopuli) es el dato que respalda este uso.
- Asistentes de voz en movilidad sin conexión: el paquete Core ML de 5,0 MB y los 7,6 ms por clip permiten ejecutar la detección en iPhone, iPad o Apple Watch antes de cualquier llamada de red, útil en aviones, zonas rurales o entornos con requisitos de privacidad.
- Selección automática de idioma en aplicaciones de transcripción de reuniones: con clips de 5 a 30 segundos, el modelo clasifica cada intervención y permite cambiar de modelo de ASR o de diccionario por hablante en una reunión multilingüe.
- Moderación y analítica de contenido de audio generado por usuarios: clasificar el idioma de las subidas en Android, Linux o Windows antes de encolar el procesamiento, evitando costes de GPU en audios de idiomas no soportados por el ASR principal.
- Aplicaciones de aprendizaje de idiomas: detectar la lengua que practica el usuario y adaptar el ejercicio, con la ventaja de que `isReliable` permite pedir una repetición cuando la confianza es baja en lugar de puntuar mal al alumno.
- Atención al cliente telefónica: preclasificar llamadas entrantes por idioma para dirigirlas a la cola de agente o al modelo de ASR adecuado, con la detección ejecutándose en el servidor de borde a coste despreciable.
- Investigación lingüística y corpus: etiquetado automático de grandes colecciones de audio en 102 lenguas, incluidas lenguas de bajos recursos presentes en la lista (luo, umb, kam, kea, nso, wo, xh), como paso previo a la transcripción.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas de forma independiente, `verified: false`). La "precisión de enrutado" mide si la elección de reconocedor derivada de la predicción es correcta.

| Dataset | Idiomas | Clips (5-30 s) | Precisión LID | Precisión de enrutado |
|---|---|---|---|---|
| Common Voice (test) | 15 | 7.500 | 0,980 | 0,990 |
| VoxPopuli (test) | 16 | 3.221 | 0,993 | 0,998 |
| Multilingual LibriSpeech (test) | 7 | 2.660 | 0,992 | 0,997 |
| NST (noruego y sueco, test) | 2 | 1.000 | 0,996 | 1,000 |
| Inglés en cuatro condiciones (LibriSpeech, AMI, CHiME-6, NOTSOFAR-1) | 1 | 1.660 | 0,977 | 0,980 |

Latencia declarada: 7,6 ms por clip en un MacBook Pro. No se han publicado datos de throughput, consumo energético ni latencia en dispositivos móviles en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para CPU, GPU integrada y aceleradores neuronales de dispositivo. El artefacto Core ML ocupa 5,0 MB y el LiteRT 10,7 MB, por lo que el consumo de memoria es del orden de decenas de megabytes incluyendo el runtime.
- GPU recomendadas: no procede. El despliegue objetivo es Apple Neural Engine/Core ML en plataformas Apple, y CPU/NNAPI/GPU móvil con LiteRT en Android, Linux, Windows y Node.
- Cabe en cualquier GPU de consumo: sí, y también en dispositivos sin GPU dedicada, incluidos móviles y navegador vía WebAssembly.
- Opciones de despliegue: SDK oficial `desert-ant-core` en Swift (SPM, desde 5.0.0), Kotlin (`ai.desertant:ear:5.0.0`) y JavaScript (`@desert-ant-labs/ear` con `@litertjs/core` para navegador, o subruta `/native` para Node). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de audio.
- Latencia y throughput: 7,6 ms por clip en MacBook Pro según el autor; sin datos de throughput agregado ni de rendimiento en Android o navegador.

## Comparativa con modelos similares

| Modelo | Tarea | Idiomas | Tamaño de despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ear (Desert-Ant-Labs) | LID de audio en dispositivo | 102 | 5,0 MB Core ML / 10,7 MB LiteRT | source-available (desert-ant-labs-source-available) | Hugging Face, SDK Swift/Kotlin/JS |
| Whisper (OpenAI) | ASR multilingüe con detección de idioma implícita | ~99 | desde ~39 M (tiny) hasta ~1,55 G (large) | MIT | Hugging Face, múltiples runtimes |
| MMS-LID (Meta) | LID de audio | 126 | cientos de MB | CC-BY-NC 4.0 | Hugging Face |
| VoxLingua107 (SpeechBrain) | LID de audio | 107 | ~80 MB | Apache 2.0 (según variante) | Hugging Face |

La comparación con Whisper no es equivalente en tarea: Whisper detecta idioma como subproducto de un modelo generativo mucho mayor, mientras que Ear es un clasificador dedicado de decenas de megabytes. Frente a MMS-LID y VoxLingua107, la ventaja declarada de Ear es el tamaño (5-10,7 MB), la latencia (7,6 ms) y el despliegue nativo en móvil y navegador; la desventaja es la licencia source-available frente a Apache 2.0 o CC-BY-NC, y la ausencia de verificación independiente de sus métricas.

## Limitaciones y advertencias

- Licencia source-available, no open source: el uso comercial está sujeto a los términos de https://license.desertant.com/, que deben revisarse antes de integrar el modelo en un producto. No se garantiza libertad de modificación ni de redistribución.
- Métricas no verificadas: todos los resultados de la model card están marcados con `verified: false`; no hay evaluación independiente publicada en la información disponible.
- Ventana de audio restringida: el modelo está diseñado para clips de 5 a 30 segundos; el comportamiento con clips más cortos o más largos no está documentado.
- Ambigüedad en lenguas próximas: el propio diseño admite casos en los que las dos hipótesis principales están demasiado cerca; sin lógica de reserva, esas predicciones pueden ser incorrectas. El conjunto NST (noruego/sueco) es el único caso declarado de pares cercanos.
- Sesgo de dominio desconocido: los benchmarks se basan en corpus de lectura y parlamentarios (Common Voice, VoxPopuli, MLS, LibriSpeech, AMI, CHiME-6, NOTSOFAR-1); el rendimiento en audio telefónico de banda estrecha, ruido industrial o habla infantil no está documentado.
- Cobertura desigual por idioma: la lista de 102 lenguas incluye lenguas de bajos recursos sin métricas desagregadas publicadas; la precisión por idioma individual no está disponible.
- No es un modelo generativo: no transcribe, traduce ni razona; cualquier expectativa de ASR o de comprensión semántica queda fuera de su alcance.
- Dependencia de SDK propietario: la integración pasa por paquetes de Desert-Ant-Labs (SPM, Maven, npm), lo que introduce una dependencia de proveedor en la cadena de despliegue.
- Descarga en el primer uso: el SDK descarga el modelo de forma diferida, lo que requiere gestión de red, caché y versiones en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/ear
- Pesos v0.2.0: https://huggingface.co/desert-ant-labs/ear/tree/v0.2.0
- Repositorio del SDK (desert-ant-core): https://github.com/Desert-Ant-Labs/desert-ant-core
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos Android: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#android
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Licencia: https://license.desertant.com/
- Paquete npm: `@desert-ant-labs/ear` (junto con `@litertjs/core`)
- Paquete Maven: `ai.desertant:ear:5.0.0`
