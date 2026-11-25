# milliwattlabs/leokani-tts-500K

## Resumen

Leokani-tts 500K es un modelo de síntesis de voz (text-to-speech) desarrollado por Milliwatt Labs, un laboratorio centrado en modelos de IA de muy baja huella computacional. Con solo 521.898 parámetros, es la variante más pequeña de la familia Leokani-tts, cuyo modelo de referencia es Leokani-tts 7M. El modelo genera voz femenina en inglés americano (identidad "Dala") y está diseñado explícitamente para ejecutarse en microcontroladores y CPUs lentas sin GPU ni centro de datos.

La relevancia del modelo reside en su extrema ligereza: 2,1 MB en fp32 y 1,1 MB en fp16 o int8, con una salida de audio mono a 24 kHz. Está pensado para escenarios de borde (edge computing) donde otros modelos de TTS no caben, como placas ESP32-S3 y ESP32-P4, donde alcanza velocidades de 1,93× y 3,6× en tiempo real respectivamente. En una única CPU Arm Cortex-A725 a 2,8 GHz logra 67× de velocidad en tiempo real.

La arquitectura sigue la estela de Kokoro-82M (el modelo del que se generaron los datos de entrenamiento sintéticos), con soporte para PyTorch y ONNX Runtime, y un fonemizador propio compatible con espeak-ng llamado Leokani G2P. La licencia es propietaria (milliwatt-labs-model-license), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (inspirada en Kokoro; detalles no publicados) |
| Parametros totales | 521.898 (0,52 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, int8 (ONNX) |
| Idiomas soportados | inglés (en), voz femenina americana "Dala" |
| Licencia | milliwatt-labs-model-license (propietaria) |
| Formato de pesos | safetensors (fp32/fp16), ONNX (fp32, fp16, int8) |

## Arquitectura y entrenamiento

No se publican detalles de la arquitectura interna (número de capas, tipo de bloques, mecanismo de atención) más allá de que sigue el linaje de Kokoro-82M y que se distribuye como modelo PyTorch y ONNX. El modelo se entrenó sobre habla sintética generada con Kokoro-82M, no sobre corpus de voz humana, lo que explica su tamaño reducido y su carácter "más plano" respecto a las variantes mayores. La salida es audio mono a 24 kHz.

El pipeline de inferencia convierte texto a fonemas mediante espeak-ng (por defecto) o el fonemizador propio Leokani G2P, incluido en el repositorio bajo `g2p/` y compatible con espeak-ng, de modo que no requiere dependencias GPL externas si se usa `--g2p leokani`. Se ofrecen scripts de inferencia para PyTorch (`leokani.py`) y ONNX Runtime (`leokani_onnx.py`), con soporte de control de velocidad (`--speed`) y cuantización fp16/int8. No se documentan datos de RLHF, DPO ni número de tokens de entrenamiento.

## Capacidades

- Síntesis de voz (TTS) en inglés americano con una única voz femenina ("Dala").
- Generación de audio mono a 24 kHz a partir de texto plano.
- Control de velocidad de habla mediante el parámetro `--speed`.
- Fonemización integrada mediante Leokani G2P o espeak-ng; también acepta fonemas en estilo Kokoro directamente.
- Ejecución en CPU y microcontroladores (ESP32-S3, ESP32-P4) sin GPU.
- Exportación a ONNX con cuantización fp16 e int8 para reducir tamaño y latencia.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni capacidades multilingües más allá del inglés.

## Casos de uso

- Asistentes de voz en microcontroladores: el modelo cabe en 1,1 MB (int8) y corre a 1,93× en un ESP32-S3, lo que permite dotar de voz a dispositivos empotrados con recursos mínimos.
- Domótica y Home Assistant: la familia Leokani incluye integración con Home Assistant en la variante 7M; el modelo 500K puede usarse para anuncios locales de estado sin enviar texto a la nube.
- Lectura de notificaciones y alertas en dispositivos de bajo consumo: con 30-58 ms hasta el primer audio en ESP32, es adecuado para respuestas habladas inmediatas en wearables o sensores.
- Prototipado rápido de interfaces de voz: los scripts PyTorch y ONNX permiten generar muestras en un portátil sin GPU, útil para validar flujos de UX antes de escalar a modelos mayores.
- Sistemas de accesibilidad en hardware barato: lectura de texto en pantalla para dispositivos tipo Raspberry Pi o placas Arm, con 67× de velocidad en un solo núcleo Cortex-A725.
- Pruebas de pipelines de audio en CI: al ser un modelo de 2,1 MB, se puede incluir en tests automatizados de generación de audio sin coste de infraestructura GPU.
- Generación de voz para juguetes y dispositivos infantiles: la licencia propietaria debe revisarse, pero técnicamente el modelo encaja en presupuestos de memoria y cómputo de microcontroladores.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (PyTorch, un solo hilo):

| Modelo | Params | Tamano | Velocidad Mac (M3 Pro) | Velocidad 1 nucleo Arm | Primer audio Mac | Primer audio 1 nucleo Arm | WER | UTMOS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **Leokani-tts 500K** | 0,52 M | 2,1 MB | — | 67× | — | 62 ms | 0,55 % | 1,88 |
| Leokani-tts 4.5M | 4,3 M | 17 MB | — | 38× | — | 128 ms | 0,07 % | 3,56 |
| Leokani-tts 7M | 7,0 M | 28 MB | 90× | 27× | 50 ms | 181 ms | 0,07 % | 3,61 |
| KittenTTS nano 0.8 | 14,0 M | 60 MB | 26× | 3,6× | 240 ms | 1,7 s | 0,41 % | 2,18 |
| Piper (en_US lessac medium) | 15,7 M | 63 MB | 49× | 5,6× | 86 ms | 710 ms | 0,90 % | 3,77 |
| Kokoro-82M | 82 M | 328 MB | 7,6× | 0,48× | 670 ms | 11 s | 0,35 % | 3,76 |

Velocidad = segundos de habla por segundo de cómputo; primer audio = mediana sobre 20 frases. Mac: CPU M3 Pro; Arm: un Cortex-A72 a 2,8 GHz.

Rendimiento en plataformas empotradas:

| Plataforma | Dispositivo | Velocidad | Primer audio |
|---|---|---:|---:|
| Linux | 1 núcleo Arm (Cortex-A725, 2,8 GHz) | 67× | 62 ms |
| ESP32-P4 | ESP32-P4, 360 MHz, Arduino | 3,6× | 30 ms |
| ESP32-S3 | ESP32-S3, 240 MHz, Arduino | 1,93× | 58 ms |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo (2,1 MB fp32, 1,1 MB fp16/int8) cabe en memoria de sistema de cualquier dispositivo.
- GPU recomendadas: no aplica; el modelo está optimizado para CPU y microcontroladores. Cualquier GPU moderna puede ejecutarlo, pero no aporta ventaja significativa.
- Cabe en GPU consumer y en microcontroladores: ESP32-S3 (240 MHz) y ESP32-P4 (360 MHz) con Arduino, además de Raspberry Pi y CPUs Arm.
- Opciones de despliegue: PyTorch (`leokani.py`), ONNX Runtime (`leokani_onnx.py`), con cuantización int8 y fp16; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput: 67× en tiempo real en un núcleo Cortex-A725 con 62 ms hasta el primer audio; 3,6× y 30 ms en ESP32-P4; 1,93× y 58 ms en ESP32-S3. La versión ONNX es ligeramente más rápida que PyTorch en el mismo núcleo Arm.

## Comparativa con modelos similares

| Modelo | Params | Tamano | Velocidad (1 núcleo Arm) | WER | UTMOS | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Leokani-tts 500K | 0,52 M | 2,1 MB | 67× | 0,55 % | 1,88 | Propietaria (milliwatt-labs) |
| Leokani-tts 4.5M | 4,3 M | 17 MB | 38× | 0,07 % | 3,56 | Propietaria (milliwatt-labs) |
| KittenTTS nano 0.8 | 14,0 M | 60 MB | 3,6× | 0,41 % | 2,18 | no disponible |
| Piper (en_US lessac medium) | 15,7 M | 63 MB | 5,6× | 0,90 % | 3,77 | no disponible |
| Kokoro-82M | 82 M | 328 MB | 0,48× | 0,35 % | 3,76 | no disponible |

El modelo 500K es el más rápido de la comparativa en CPU y el de menor tamaño, pero también el de peor calidad subjetiva (UTMOS 1,88 frente a 3,56-3,77 de Piper, Kokoro y Leokani 4.5M). Su WER de 0,55 % es competitivo pero superior al 0,07 % de las variantes mayores de Leokani y al 0,35 % de Kokoro.

## Limitaciones y advertencias

- Calidad de voz limitada: UTMOS de 1,88, muy por debajo de modelos de mayor tamaño; el autor lo describe como "más plano" que las variantes 4.5M y 7M.
- Mayor tasa de errores en nombres poco comunes y en la lectura de ciertos términos respecto a modelos mayores.
- Solo inglés americano y una única voz femenina; no hay soporte multilingüe ni cambio de hablante.
- Entrenado sobre habla sintética de Kokoro-82M, lo que puede introducir artefactos o sesgos heredados del modelo generador.
- Licencia propietaria (milliwatt-labs-model-license): es imprescindible revisar el texto de la licencia antes de cualquier uso comercial; no es una licencia open source estándar.
- Dependencia opcional de espeak-ng (GPL-3.0) si no se usa el fonemizador Leokani G2P; el autor no incluye espeak-ng en el repositorio.
- No dispone de benchmarks de robustez ante texto ruidoso, dominios técnicos o nombres propios más allá de los ejemplos de la model card.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí de pronunciación incorrecta de palabras fuera del vocabulario de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/milliwattlabs/leokani-tts-500K
- Modelo mayor Leokani-tts 7M: https://huggingface.co/milliwattlabs/leokani-tts-7M
- Modelo intermedio Leokani-tts 4.5M: https://huggingface.co/milliwattlabs/leokani-tts-4.5M
- Fonemizador Leokani G2P: https://huggingface.co/milliwattlabs/leokani-g2p
- Modelo base de datos sintéticos Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Licencia: https://huggingface.co/milliwattlabs/leokani-tts-500K/blob/main/LICENSE-MILLIWATT-LABS.md
- Sitio del autor: https://milliwattlabs.com
- Muestras de audio: https://huggingface.co/milliwattlabs/leokani-tts-500K/tree/main/samples
