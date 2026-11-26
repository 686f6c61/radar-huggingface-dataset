# CoreEpoch/tiny-voca-kenosis

## Resumen

tiny-voca Kenosis es una versión cuantizada y optimizada para CPU del modelo de síntesis de voz tiny-voca, desarrollado originalmente por Muhammed Nazeem (n4ze3m) bajo licencia Apache-2.0. Se trata de un modelo text-to-speech (TTS) de dos voces en inglés (`F2` y `M2`) que genera audio a 24 kHz. La versión Kenosis, publicada por CoreEpoch, reduce el peso del fichero ONNX de 21,39 MB a 5,39 MB manteniendo una precisión cercana al original y mejorando notablemente la velocidad de inferencia en CPU, sin reentrenamiento.

El modelo resuelve un problema concreto: desplegar TTS de calidad en entornos de borde (edge) y CPU sin GPU. Frente a la cuantización dinámica estándar de ONNX Runtime, que reduce el tamaño pero ralentiza la inferencia, Kenosis consigue simultáneamente menor tamaño y mayor velocidad. Un único fichero `.onnx` funciona tanto en ONNX Runtime como en OpenVINO con entradas y salidas idénticas.

Su relevancia actual radica en la combinación de tamaño mínimo (5,39 MB), licencia permisiva Apache-2.0 sobre el derivado y latencias que superan 80x tiempo real en un solo hilo de CPU, lo que lo hace apto para asistentes de voz offline, dispositivos embebidos y aplicaciones de accesibilidad sin dependencia de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS (text-to-speech) basado en tiny-voca; pesos en ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantización | int8 (cuantización propietaria Kenosis); también disponible `quantize_dynamic` de ORT como referencia |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 (derivado); el cuantizador Kenosis es propietario |
| Formato de pesos | ONNX (`.onnx`), un único fichero de 5.392.846 bytes |

## Arquitectura y entrenamiento

El modelo base tiny-voca es un sistema TTS de dos voces que opera a 24 kHz y trabaja sobre fonemas: recibe `tokens` (IDs de fonemas), `stress`, `voice` (0 = F2, 1 = M2), `speed`, `pitch_shift` y `pitch_range`, y devuelve `audio` a 24 kHz junto con `durations`. La fonemización se realiza mediante la librería `dizione`, con datos en el directorio `phonemizer/`.

La versión Kenosis no reentrena el modelo: aplica una cuantización propietaria (Kenosis, de Core Epoch LLC) calibrada sobre 64 enunciados en inglés (32 frases originales en ambas voces, disjuntas del conjunto de evaluación). El resultado es un único fichero ONNX que se ejecuta en ONNX Runtime y OpenVINO con la misma interfaz. No se dispone de información sobre la arquitectura interna (transformer, difusión, etc.), el número de tokens de entrenamiento ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Síntesis de voz en inglés a 24 kHz con dos voces: `F2` (femenina) y `M2` (masculina).
- Control de velocidad (`speed`), desplazamiento de tono (`pitch_shift`) y rango de tono (`pitch_range`).
- Fonemización integrada mediante `dizione` (con datos CMUdict y homógrafos).
- Inferencia en CPU pura, sin GPU, en ONNX Runtime y OpenVINO.
- Ejecución offline y en dispositivos de borde por su tamaño reducido (5,39 MB).
- Salida de audio normalizable (pico limitado a 0,99) y duraciones por fonema.
- No soporta tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- Asistentes de voz offline en dispositivos embebidos: el modelo cabe en 5,39 MB y corre en CPU, por lo que puede integrarse en Raspberry Pi o microcontroladores con recursos limitados para leer notificaciones o respuestas sin conexión.
- Accesibilidad y lectores de pantalla: la síntesis a 24 kHz con control de velocidad y tono permite adaptar la lectura de texto a usuarios con discapacidad visual en tiempo real sobre CPU.
- Sistemas de navegación o automoción: la baja latencia (69,8 ms para una frase de 5,7 s en un hilo, 81,4x tiempo real) permite anuncios de giro y avisos sin depender de la nube.
- Atención al cliente en kioscos o terminales: respuestas pregrabadas dinámicas con dos voces y control de tono para mensajes de bienvenida y espera en entornos sin GPU.
- Pruebas y prototipado de pipelines TTS: el fichero único ONNX y la API sencilla (`tokens`, `stress`, `voice`, `speed`, etc.) facilitan la integración en tests automatizados y CI sin infraestructura de inferencia pesada.
- Aplicaciones de lectura de contenido en el navegador o escritorio: al ejecutarse en ONNX Runtime CPU, puede empaquetarse en aplicaciones Electron o web (WASM) para leer artículos o notificaciones localmente.
- Generación de audio para videojuegos o demos: dos voces y control de pitch permiten generar líneas de diálogo rápidas en herramientas de desarrollo sin coste de API.

## Benchmarks y rendimiento

Precisión (WER, menor es mejor; `faster-whisper` `base.en` sobre 68 clips):

| Modelo | ONNX Runtime | OpenVINO | Tamaño |
|---|---:|---:|---:|
| Original | 1,00% (8/804) | 1,00% (8/804) | 21,39 MB |
| ORT `quantize_dynamic` | 0,87% (7/804) | 0,87% (7/804) | 8,12 MB |
| **Kenosis** | **1,12% (9/804)** | **1,49% (12/804)** | **5,39 MB** |

Velocidad (mediana de 10 ejecuciones, frase de 5,7 s, CPU con AVX-VNNI; entre paréntesis, múltiplos de tiempo real):

| Runtime | Hilos | Original | ORT `quantize_dynamic` | Kenosis |
|---|---:|---:|---:|---:|
| ONNX Runtime | 1 | 109,7 ms (51,7x) | 127,6 ms (45,1x) | **69,8 ms (81,4x)** |
| ONNX Runtime | 4 | 57,8 ms (98,1x) | 82,1 ms (70,1x) | **32,1 ms (177,0x)** |
| OpenVINO | 1 | 127,6 ms (44,5x) | 160,1 ms (35,9x) | **89,4 ms (63,6x)** |
| OpenVINO | 4 | 56,5 ms (100,5x) | 67,2 ms (85,6x) | **39,4 ms (144,2x)** |

## Requisitos de hardware

- VRAM: no requiere GPU; inferencia en CPU. El fichero ONNX ocupa 5,39 MB, por lo que la memoria RAM necesaria es mínima (del orden de decenas de MB con el runtime).
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. Puede ejecutarse en GPU vía ONNX Runtime si se configura el proveedor correspondiente, pero no es el objetivo.
- Cabe en cualquier CPU consumer; los benchmarks usan una CPU con AVX-VNNI. En CPU sin estas extensiones el rendimiento puede ser inferior.
- Opciones de despliegue: ONNX Runtime (`CPUExecutionProvider`), OpenVINO (`openvino.Core().compile_model(..., "CPU")`), y scripts incluidos `run_tts.py` (CLI sin `dizione`) y `eval_tts.py`.
- Latencia: 69,8 ms (1 hilo) y 32,1 ms (4 hilos) en ONNX Runtime para una frase de 5,7 s; 89,4 ms y 39,4 ms en OpenVINO.
- Throughput: hasta 177x tiempo real en ONNX Runtime con 4 hilos.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Voces | Licencia | Runtime |
|---|---|---|---|---|---|
| tiny-voca (original) | TTS ONNX | 21,39 MB | 2 (F2, M2) | Apache-2.0 | ORT, OpenVINO |
| tiny-voca ORT `quantize_dynamic` | TTS ONNX int8 | 8,12 MB | 2 | Apache-2.0 | ORT, OpenVINO |
| **tiny-voca Kenosis** | TTS ONNX int8 | 5,39 MB | 2 | Apache-2.0 (derivado) | ORT, OpenVINO |
| Alternativas de otros autores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no hay capacidades multilingües.
- Solo dos voces (`F2`, `M2`); no permite clonación ni voces adicionales.
- El WER en OpenVINO es ligeramente superior (1,49% frente a 1,00% del original); aceptable pero no idéntico.
- El modelo base usa una señal de ruido aleatoria, por lo que los recuentos de palabras pueden variar en una unidad entre ejecuciones.
- La licencia Apache-2.0 cubre el derivado, scripts y documentación, pero **no** otorga derechos sobre el cuantizador Kenosis, que es propietario de Core Epoch LLC. Verificar términos antes de uso comercial del proceso de cuantización.
- `config.json` y `phonemizer/` se redistribuyen sin modificar y mantienen sus propias licencias de terceros (`LICENSE.cmudict`, `LICENSE-homograph-data`).
- Al ser TTS, no ofrece razonamiento, código, tool calling ni agentes; no debe evaluarse como modelo de lenguaje.
- Riesgo de alucinación no aplica en el sentido textual, pero sí posibles artefactos o pronunciaciones incorrectas en fonemas ambiguos.
- El rendimiento depende de extensiones CPU (AVX-VNNI); en hardware más antiguo la latencia puede degradarse.

## Enlaces

- Hugging Face: https://huggingface.co/CoreEpoch/tiny-voca-kenosis
- Modelo base: https://huggingface.co/n4ze3m/tiny-voca
- Página de Kenosis y benchmarks: https://coreepoch.dev/kenosis/
- Repositorio `dizione`: https://github.com/n4ze3m/dizione
- Contacto: contact@coreepoch.dev
