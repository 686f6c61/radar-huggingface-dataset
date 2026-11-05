# mesmertech/mesm-tts

## Resumen

mesm-tts es una familia de diez voces de síntesis de voz (text-to-speech) en inglés desarrolladas por mesmertech, empaquetadas como modelos ONNX ultraligeros de entre 2,3 y 6,9 MB por voz. El modelo resuelve un problema muy concreto: llevar TTS de calidad aceptable a entornos sin GPU, sin servidor y sin `onnxruntime` en el navegador, mediante un motor WebAssembly propio de 40 kB. Está pensado para ejecutarse en una sola CPU (incluido un iPhone 13 Pro) y para enviar el primer fragmento de audio en 10-55 ms.

Técnicamente se trata de un conjunto de modelos destilados de tres profesores: Kokoro-82M (voz Heart), Phonon-31M-en (voces Wren, Everly, Hadley, Bryony, Maeve, Miles, Trevor, Edwin y Hugh) y Paradee-8M-v1.1. La destilación reduce el tamaño entre uno y dos órdenes de magnitud (de 325 MB a 2,3-6,9 MB y de 55-103 MB a un rango similar) manteniendo la calidad perceptual: Heart alcanza UTMOS 4,46 y WER 5,6%, prácticamente empatado con su profesor Kokoro-82M (4,52 y 5,7%). Las voces Phonon quedan estadísticamente empatadas con su profesor en WER.

La relevancia actual es clara: permite TTS privado (el texto no sale del dispositivo), de latencia ultrabaja y sin coste de inferencia en servidor, algo poco habitual en modelos de esta categoría. El repo ocupa 0,1 GB, la licencia es Apache 2.0 y el soporte de idiomas se limita al inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de síntesis de voz destilada, exportada a ONNX; inferida con motor WebAssembly de 40 kB |
| Parámetros totales | No disponible (tamaños de checkpoint de 2,3 a 6,9 MB por voz) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos ONNX ya compactados por destilación; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

mesm-tts no es un único modelo, sino una colección de diez voces organizadas en dos familias según su profesor. La voz Heart se destila de Kokoro-82M (325 MB) y las nueve restantes (Wren, Everly, Hadley, Bryony, Maeve, Miles, Trevor, Edwin, Hugh) se destilan de Phonon-31M-en (55-103 MB). El modelo base Paradee-8M-v1.1 también figura como referencia en la model card. El resultado son checkpoints ONNX de 2,3 a 6,9 MB, lo que supone una reducción de uno a dos órdenes de magnitud respecto a los profesores.

La innovación principal no está en la arquitectura de red (no se detalla en la información disponible) sino en el motor de inferencia: un runtime WebAssembly de 40 kB que sustituye a `onnxruntime-web`, reduciendo el pico de memoria de 770-849 MB a 100-117 MB para el proceso completo. No se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card solo indica que se trata de destilación. Las métricas de calidad reportadas (UTMOS y WER) sugieren que el proceso de destilación preserva fidelidad acústica y inteligibilidad.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés con diez voces predefinidas: cinco femeninas (Heart, Wren, Everly, Hadley, Bryony, Maeve) y cuatro masculinas (Miles, Trevor, Edwin, Hugh), con acentos US y UK.
- Ejecución on-device en CPU, sin GPU ni servidor, con un motor WebAssembly de 40 kB.
- Inferencia en navegador sin `onnxruntime-web`, con primer audio en 10-55 ms.
- Streaming de audio con latencia ultrabaja (149x-201x tiempo real en navegador para las voces Heart; 55x-80x para las Phonon).
- Privacidad por diseño: el texto no abandona el dispositivo del usuario.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking; es exclusivamente TTS.

## Casos de uso

- Lectura de artículos y documentos en el navegador: el modelo cabe en una página web (2,3-6,9 MB) y sintetiza en una sola CPU, por lo que puede ofrecer lectura en voz alta sin backend ni coste por petición.
- Accesibilidad web: integración en lectores de pantalla o asistentes para personas con discapacidad visual, con la ventaja de que el contenido privado no se envía a un servidor externo.
- Aplicaciones de notas y productividad offline: dictado inverso (texto a voz) en apps de escritorio o móviles sin conexión, con latencia de decenas de milisegundos.
- Asistentes de voz en dispositivos embebidos: Raspberry Pi, routers, electrodomésticos o wearables con CPU modesta, donde un modelo de 325 MB no cabría en memoria pero uno de 2,3 MB sí.
- Prototipado rápido de interfaces conversacionales: diez voces listas para probar en el navegador con el generador de mesmer.tools, sin infraestructura.
- Contenido educativo interactivo: narración de lecciones o cuentos en aplicaciones web, con la voz Bryony o Everly para tono cálido y la posibilidad de cambiar de voz sin recargar el modelo.
- Demos y pruebas A/B de voces en productos: al ser Apache 2.0 y ONNX, se puede integrar en pipelines de CI para validar calidad (UTMOS, WER) antes de desplegar.

## Benchmarks y rendimiento

Los datos publicados en la model card son de velocidad y calidad perceptual, no de benchmarks académicos estándar (MMLU, HumanEval, GSM8K no aplican a un modelo TTS).

| Métrica | mesm-tts (Heart) | Kokoro-82M (profesor) | mesm-tts (Phonon) | Phonon-31M-en (profesor) |
|---|---|---|---|---|
| Tamaño | 2,3-6,9 MB | 325 MB | 2,3-6,9 MB | 55-103 MB |
| Velocidad nativa, 1 CPU | 234x-292x tiempo real | ~1,3x-1,9x (implícito) | 82x-106x | ~2,7x-3,5x (implícito) |
| Velocidad en navegador, 1 CPU | 149x-201x | No disponible | 55x-80x | No disponible |
| Primer audio | 10-55 ms | No disponible | 10-55 ms | No disponible |
| Memoria pico | 100-117 MB | 770-849 MB (con onnxruntime-web) | 100-117 MB | No disponible |
| iPhone 13 Pro | ~50x tiempo real | No disponible | ~33x tiempo real | No disponible |
| UTMOS | 4,46 | 4,52 | No disponible | No disponible |
| WER | 5,6% | 5,7% | Empate estadístico con el profesor | Referencia |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a un modelo de síntesis de voz.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU con un pico de memoria de 100-117 MB para el proceso completo (voces Heart).
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. No se documenta soporte CUDA.
- ¿Cabe en consumer GPU? Sí, pero es irrelevante: el objetivo es ejecución en CPU. Cabe holgadamente en cualquier dispositivo con más de 120 MB de RAM libre.
- Despliegue: motor WebAssembly propio de 40 kB (navegador), ONNX Runtime nativo (escritorio/servidor), y presumiblemente cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: 234x-292x tiempo real en CPU nativa (Heart), 149x-201x en navegador, ~50x en iPhone 13 Pro; primer audio en 10-55 ms. Las voces Phonon rinden 82x-106x en nativa y 55x-80x en navegador.

## Comparativa con modelos similares

| Modelo | Parámetros / tamaño | Contexto | Calidad (UTMOS/WER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mesm-tts (Heart) | 2,3-6,9 MB por voz | No disponible | 4,46 / 5,6% | Apache 2.0 | HuggingFace, ONNX + WASM |
| Kokoro-82M | 82M (325 MB) | No disponible | 4,52 / 5,7% | Apache 2.0 | HuggingFace |
| Phonon-31M-en | 31M (55-103 MB) | No disponible | No disponible | No disponible en la información | HuggingFace |
| Paradee-8M-v1.1 | 8M | No disponible | No disponible | No disponible en la información | HuggingFace |

La comparativa se limita a los profesores del propio modelo, ya que no se han proporcionado datos de otros TTS comparables (Piper, VITS, XTTS). mesm-tts destaca por su tamaño (hasta 140x menor que Kokoro-82M) y su velocidad (150x-180x más rápido que Kokoro en CPU nativa), con una calidad perceptual prácticamente idéntica.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe documentado; el tag de idioma es únicamente `en`.
- Calidad limitada por la destilación: aunque Heart empata casi con Kokoro-82M, sigue siendo un modelo destilado y puede degradarse en textos fuera de dominio, nombres propios o puntuación compleja.
- Riesgo de alucinación acústica: como todo TTS, puede omitir, repetir o malpronunciar palabras; el WER del 5,6% implica que aproximadamente una de cada dieciocho palabras puede fallar.
- Sin control de prosodia documentado: no se describen parámetros de velocidad, tono o emoción más allá de la elección de voz.
- Sin datos de sesgo: no se documentan sesgos de acento, género o edad más allá de la descripción de las diez voces (US/UK, masculinas/femeninas).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos base (Kokoro-82M es Apache 2.0; Phonon-31M-en y Paradee-8M-v1.1 no se detallan en la información disponible).
- El modelo es muy reciente (creado el 2026-11-05) y no tiene descargas ni likes, por lo que no hay validación comunitaria independiente.
- No se documenta soporte para SSML, control de hablante en tiempo de inferencia ni clonación de voz.

## Enlaces

- HuggingFace: https://huggingface.co/mesmertech/mesm-tts
- Generador TTS de mesmer.tools: https://mesmer.tools/free-tools/tts-generator
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Modelo base Phonon-31M-en: https://huggingface.co/gradium/phonon-31m-en
- Modelo base Paradee-8M-v1.1: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.1
- Muestras de audio: https://huggingface.co/mesmertech/mesm-tts/resolve/main/samples/heart.mp3 (y equivalentes para el resto de voces)
