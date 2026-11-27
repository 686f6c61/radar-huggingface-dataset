# LingCoreX-AI/LingASR

## Resumen

LingASR es un modelo de reconocimiento automatico del habla (ASR) en chino disenado especificamente para ejecutarse de forma local en microcontroladores ESP32-S3, sin conexion a red. Lo desarrolla LingCoreX-AI y se distribuye como un SDK precompilado (version publica 0.1.0-preview.2) acompanado de recursos de inferencia cuantizados en INT8. El modelo acepta audio PCM mono de 16 kHz y 16 bits y devuelve texto chino en UTF-8 con puntuacion, lo que lo hace adecuado para interfaces de voz embebidas, asistentes de dispositivo y aplicaciones de dictado offline.

La propuesta diferencial no es la precision bruta, sino la viabilidad de ejecutar un pipeline ASR completo (frontend, modelo acustico, desambiguacion y puntuacion) en un ESP32-S3 N16R8 con 16 MiB de flash y 8 MiB de PSRAM octal, a 240 MHz y con ESP-IDF v5.5.6. Los recursos de modelo ocupan aproximadamente 9,83 MiB y el conjunto completo de despliegue unos 11,38 MiB, lo que encaja en el presupuesto de memoria del microcontrolador.

Es relevante ahora porque demuestra que la transcripcion de voz en chino puede realizarse en el borde sin depender de la nube, con un factor de tiempo real (RTF) inferior a 1 en el hardware objetivo. La contrapartida es un alcance limitado: segmentos de hasta ocho segundos, un unico idioma (zh) y una licencia propia de tipo preview que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline ASR embebido (frontend + modelo acustico + desambiguacion + puntuacion); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no aplica; segmentos de audio de hasta 8 segundos por reconocimiento |
| Tipos de cuantizacion | INT8 (recursos de despliegue cuantizados) |
| Idiomas soportados | chino (zh) |
| Licencia | LingASR Preview License 1.0 (licencia propia, "other") |
| Formato de pesos | Recursos INT8 empaquetados con el SDK precompilado de ESP-IDF; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La informacion publicada describe el sistema como una cadena de procesamiento compuesta por un frontend de audio, un modelo acustico, un modulo de desambiguacion y un modulo de puntuacion. El conjunto de archivos de modelo suma 10.312.176 bytes (aproximadamente 9,83 MiB) y los recursos completos de despliegue 11.935.280 bytes (aproximadamente 11,38 MiB), incluyendo diccionarios, tablas de frontend y recursos de tokens. No se detalla la topologia interna (tipo de encoder, numero de capas, dimensiones ocultas) ni el volumen o composicion del corpus de entrenamiento.

El pipeline procesa segmentos completos de habla con un maximo de ocho segundos. El ejemplo de asistente combina deteccion de actividad de voz (VAD), segmentacion por pausas y concatenacion de segmentos, de modo que la transcripcion esta disponible una vez procesado cada segmento. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La innovacion principal es de ingenieria: comprimir y cuantizar a INT8 todo el pipeline para que quepa y se ejecute en un ESP32-S3 con PSRAM octal.

## Capacidades

- Reconocimiento de voz en chino (transcripcion de audio a texto) completamente offline en ESP32-S3.
- Salida de texto UTF-8 en chino con puntuacion incluida.
- Entrada de audio PCM mono a 16 kHz y 16 bits.
- Procesamiento de segmentos de hasta ocho segundos, con segmentacion por pausas y concatenacion en el ejemplo de asistente.
- Integracion con microfono INMP441 mediante I2S (cableado por defecto: SCK GPIO 5, WS GPIO 4, SD GPIO 6, L/R a GND).
- Ejemplos de firmware listos para flashear, incluido un asistente de voz, distribuidos con el SDK.
- Soporte de recursos opcionales de TTS en el firmware del asistente (segun la model card).
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla del ASR.

## Casos de uso

- Interfaces de voz en dispositivos de bajo consumo: el modelo transcribe localmente en un ESP32-S3 N16R8, por lo que un electrodomestico o wearable puede aceptar comandos en chino sin conexion ni coste de API.
- Asistentes de voz offline para el hogar: el ejemplo de asistente integra VAD, segmentacion por pausas y concatenacion, lo que permite conversaciones por turnos en dispositivos sin Wi-Fi.
- Dictado y entrada de texto en equipos embebidos: con salida UTF-8 con puntuacion, el resultado puede enviarse por serie o mostrarse en pantalla para aplicaciones de registro o notas.
- Automatizacion industrial o agricola en entornos sin red: al ejecutarse en el dispositivo, permite comandos por voz en ubicaciones remotas donde no hay conectividad fiable.
- Prototipado de producto de voz: el SDK precompilado y los ejemplos listos para flashear reducen el tiempo hasta una demo funcional sobre hardware de bajo coste.
- Evaluacion de ASR en el borde para investigacion: los datos de CER en AISHELL-1, THCHS-30 y FLEURS y las mediciones de RTF permiten comparar el rendimiento embebido frente a alternativas en servidor.
- Dispositivos de accesibilidad: transcripcion local de voz a texto en chino para personas con movilidad reducida, sin dependencia de servicios externos.

## Benchmarks y rendimiento

La model card publica tasas de error de caracteres (CER) en evaluacion de referencia FP32:

| Conjunto de prueba | Enunciados | CER |
|---|---|---|
| AISHELL-1 test | 7.176 | 9,94% |
| THCHS-30 clean test | 2.495 | 13,11% |
| FLEURS Chinese test | 945 | 15,39% |

Mediciones de computo en placa ESP32-S3 con INT8 (mediana de tres ejecuciones con PCM fijo):

| Audio de entrada | Tiempo de computo | Factor de tiempo real (RTF) |
|---|---|---|
| 4 segundos | 3,449 s | 0,862 |
| 8 segundos | 6,302 s | 0,788 |

El tiempo de computo cubre frontend, inferencia acustica y backend de decodificacion. El tiempo de respuesta extremo a extremo incluye ademas captura de audio, deteccion de fin de habla, actualizacion de pantalla y servicios del asistente. Los resultados de CER corresponden a evaluacion de referencia FP32 y las mediciones de tiempo a la implementacion INT8 en placa; no son directamente comparables entre si.

## Requisitos de hardware

- Objetivo validado: ESP32-S3 N16R8 a 240 MHz con 16 MiB de flash, 8 MiB de PSRAM octal y ESP-IDF v5.5.6.
- Memoria: los archivos de modelo ocupan unos 9,83 MiB y los recursos completos de despliegue unos 11,38 MiB; el firmware, fuentes de pantalla, reservas de particion y TTS opcional requieren almacenamiento adicional.
- Microfono: INMP441 por I2S con el cableado por defecto indicado en la model card.
- No aplica VRAM de GPU: el modelo no esta pensado para inferencia en GPU ni en servidores convencionales.
- Despliegue: SDK precompilado de ESP-IDF (version 0.1.0-preview.2), descargado con Python 3.12 o superior y verificado por SHA-256; compilacion con `idf.py` sobre los ejemplos `microphone` y asistente.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 0,862 para 4 s y 0,788 para 8 s en la placa de referencia, es decir, mas rapido que tiempo real pero con varios segundos de computo por segmento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| LingASR | no disponible | Segmentos de hasta 8 s, PCM 16 kHz | zh | LingASR Preview License 1.0 | ESP32-S3 (INT8, SDK) |
| Whisper (variantes pequenas) | 39M-244M (segun variante) | Ventanas de 30 s | Multilingue | MIT | GPU/CPU, llama.cpp, etc. |
| Modelos ASR en la nube (p. ej. servicios comerciales) | no disponible | Variable | Multilingue | Comercial | API remota |

No se dispone de datos de benchmarks comparativos directos entre LingASR y estos modelos en la informacion proporcionada; la model card remite a una pagina de comparacion del sitio del proyecto. La diferencia principal frente a Whisper es el objetivo de despliegue: LingASR prioriza ejecucion en microcontrolador con un unico idioma, mientras que Whisper prioriza precision multilingue en hardware con mas recursos.

## Limitaciones y advertencias

- Solo soporta chino (zh); no hay soporte multilingue documentado.
- Procesa segmentos completos de hasta ocho segundos; no es un modelo de transcripcion de audio largo en streaming continuo sin segmentacion externa.
- La precision en produccion depende del audio, la colocacion del microfono, el ruido, la pronunciacion y la segmentacion; hay que evaluar la configuracion objetivo con grabaciones representativas.
- Los CER publicados (9,94% en AISHELL-1, 13,11% en THCHS-30, 15,39% en FLEURS) corresponden a evaluacion de referencia FP32, no a la implementacion INT8 en placa.
- Riesgo de alucinacion y errores de transcripcion inherente a los sistemas ASR, especialmente con ruido o acentos no representados en el entrenamiento; no se documentan sesgos especificos.
- La licencia es una licencia propia de tipo preview (LingASR Preview License 1.0); es imprescindible revisar sus terminos antes de cualquier uso comercial.
- Version publica en fase preview (0.1.0-preview.2) con 0 descargas y 0 likes en Hugging Face en el momento de la consulta; madurez y soporte limitados.
- El repositorio de Hugging Face solo contiene la model card; el motor de inferencia, los recursos INT8 y el firmware se distribuyen por GitHub.
- Requiere hardware concreto (ESP32-S3 N16R8 con PSRAM octal) y ESP-IDF v5.5.6; no es un modelo portable a otros entornos sin trabajo de integracion.

## Enlaces

- Hugging Face: https://huggingface.co/LingCoreX-AI/LingASR
- Repositorio GitHub y SDK: https://github.com/LingCoreX-AI/LingASR
- Documentacion del SDK (ingles): https://github.com/LingCoreX-AI/LingASR/blob/v0.1.0-preview.2/README.en.md
- README en chino simplificado: https://github.com/LingCoreX-AI/LingASR/blob/v0.1.0-preview.2/README.md
- Guia de hardware: https://github.com/LingCoreX-AI/LingASR/blob/v0.1.0-preview.2/docs/HARDWARE.md
- Licencia LingASR Preview 1.0: https://github.com/LingCoreX-AI/LingASR/blob/v0.1.0-preview.2/licenses/LingASR-Preview-License-1.0.md
- Demo online: https://edge.lingcorex.cn/lingasr/
- Especificaciones y mediciones publicadas: https://edge.lingcorex.cn/lingasr/#spec
- Comparacion con otros modelos: https://edge.lingcorex.cn/lingasr/#comparison
