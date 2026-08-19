# iChizer0/nanobot-channel-voice-models

## Resumen

El repositorio `iChizer0/nanobot-channel-voice-models` no es un modelo de voz único, sino un conjunto de artefactos RKNN (Rockchip Neural Network) y un índice de pesos con verificación de checksums para el proyecto [`nanobot-channel-voice`](https://github.com/iChizer0/nanobot-channel-voice). Este proyecto proporciona capacidades de voz (reconocimiento de voz, síntesis de voz y detección de actividad de voz) para dispositivos con NPU Rockchip, como la serie RV1126. El repositorio actúa como un almacén de pesos optimizados para ejecución en hardware de bajo consumo, con un manifiesto (`weights-index.json`) que documenta la procedencia, los checksums y las licencias de cada componente.

La relevancia actual radica en la creciente demanda de soluciones de voz en el edge, especialmente en hardware de bajo coste y bajo consumo como los SoC Rockchip. Al proporcionar pesos ya convertidos a formato RKNN y un mecanismo de descarga verificada, el proyecto simplifica el despliegue de modelos de voz en dispositivos embebidos. El repositorio incluye modelos para reconocimiento de voz (STT) basados en Whisper base, síntesis de voz (TTS) con MMS-TTS y Matcha, y detección de actividad de voz (VAD). La licencia es `other`, con términos específicos por cada modelo individual (por ejemplo, CC-BY-NC-4.0 para MMS-TTS English y restricciones no comerciales para DataBaker Chinese).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio de artefactos RKNN; los modelos subyacentes incluyen Whisper base para STT, MMS-TTS y Matcha para TTS, y VAD no especificado) |
| Parametros totales | No disponible (depende de cada modelo incluido) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | RKNN (cuantizacion propia de Rockchip, probablemente INT8/INT16) |
| Idiomas soportados | No disponible en el repositorio; se mencionan modelos para ingles (MMS-TTS, LJSpeech) y chino mandarin (DataBaker) |
| Licencia | `other` (cada modelo tiene su propia licencia; consultar `weights-index.json`) |
| Formato de pesos | RKNN (artefactos binarios) y JSON (índice de pesos) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura de los modelos subyacentes en este repositorio. Los artefactos RKNN son conversiones de modelos ya entrenados, adaptados para ejecución en NPU Rockchip. Según la model card, se incluyen:

- **STT**: modelo Whisper base convertido a RKNN para RV1126.
- **TTS**: modelos MMS-TTS (inglés) y Matcha (con vocoder Vocos) para chino mandarin (DataBaker) y LJSpeech (inglés). Estos modelos se basan en arquitecturas de síntesis neuronal, pero no se especifican detalles de entrenamiento.
- **VAD**: modelo de detección de actividad de voz no especificado.

El repositorio no documenta el proceso de entrenamiento, los datasets originales (salvo las referencias a DataBaker y LJSpeech) ni las técnicas de optimización empleadas más allá de la conversión a RKNN. El índice `weights-index.json` es la fuente autoritativa de metadatos, pero no se incluye su contenido en la información disponible.

## Capacidades

- **Reconocimiento de voz (STT)**: transcripción de audio a texto mediante Whisper base en formato RKNN, optimizado para dispositivos Rockchip.
- **Síntesis de voz (TTS)**: generación de habla a partir de texto con modelos MMS-TTS (inglés) y Matcha (chino mandarin e inglés).
- **Detección de actividad de voz (VAD)**: detección de presencia de voz en audio, útil para segmentación y activación por voz.
- **Ejecución en edge**: pesos convertidos a RKNN para NPU Rockchip, permitiendo inferencia local sin conexión a la nube.
- **Gestión de modelos**: el índice con checksums permite verificar la integridad de los pesos y gestionar múltiples versiones.

## Casos de uso

- **Asistentes de voz en dispositivos IoT**: integrar STT, TTS y VAD en dispositivos domésticos con SoC Rockchip (p. ej., altavoces inteligentes) para interactuar por voz sin depender de servicios en la nube.
- **Grabadoras y traductores portátiles**: transcripción local de conversaciones o reuniones en tiempo real con Whisper base, aprovechando el bajo consumo de la NPU.
- **Sistemas de accesibilidad**: convertir texto a voz para personas con discapacidad visual en dispositivos embebidos, usando MMS-TTS o Matcha.
- **Kioscos interactivos**: implementar diálogos hablados en máquinas expendedoras o paneles informativos, con VAD para detectar cuándo el usuario habla y TTS para responder.
- **Vigilancia y monitorización**: detección de actividad de voz en cámaras o sensores para activar grabación o alertas, usando el modelo VAD.
- **Desarrollo de prototipos en hardware Rockchip**: usar el repositorio como base para experimentar con modelos de voz en placas como RV1126, gracias al índice de pesos y la instalación sencilla con `nanobot-voice`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad (WER, MOS, etc.) ni comparativas con otros modelos. Se desconoce el rendimiento real en términos de latencia o precisión en los dispositivos objetivo.

## Requisitos de hardware

- **Hardware objetivo**: dispositivos con NPU Rockchip, específicamente la serie RV1126 (mencionada en el ejemplo de instalación). No se especifican otros SoC compatibles.
- **VRAM**: no aplicable (inferencia en NPU, no en GPU). La memoria RAM necesaria dependerá del modelo concreto (Whisper base, Matcha, etc.) y no se indica.
- **GPU**: no requerida; el formato RKNN está diseñado para NPU Rockchip.
- **Opciones de despliegue**: el proyecto `nanobot-channel-voice` gestiona la descarga e instalación de los modelos. No se mencionan integraciones con vLLM, llama.cpp u otros frameworks.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado repositorios comparables que ofrezcan artefactos RKNN para voz con un índice de pesos verificado. Los modelos subyacentes (Whisper, MMS-TTS, Matcha) pueden compararse con sus versiones originales, pero este repositorio se centra en la conversión y distribución para hardware específico, no en el rendimiento del modelo en sí.

## Limitaciones y advertencias

- **Licencias restrictivas**: varios modelos incluidos tienen licencias no comerciales (CC-BY-NC-4.0 para MMS-TTS English, términos no comerciales para DataBaker Chinese). El uso comercial requiere revisar cada entrada del `weights-index.json`.
- **Dependencia de hardware**: los pesos RKNN están optimizados para NPU Rockchip; no son portables a otras plataformas sin reconversión.
- **Información incompleta**: no se documentan arquitecturas, parámetros ni métricas de rendimiento, lo que dificulta evaluar la calidad de los modelos.
- **Riesgo de alucinación**: aplicable a los modelos de STT (Whisper) en entornos ruidosos, pero no se proporcionan datos específicos.
- **Sesgos**: los modelos de TTS pueden reflejar sesgos de los datos de entrenamiento (LJSpeech, DataBaker), pero no se detallan.
- **Mantenimiento**: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco utilizado; la fiabilidad a largo plazo no está garantizada.

## Enlaces

- Repositorio HuggingFace: [https://huggingface.co/iChizer0/nanobot-channel-voice-models](https://huggingface.co/iChizer0/nanobot-channel-voice-models)
- Proyecto GitHub asociado: [https://github.com/iChizer0/nanobot-channel-voice](https://github.com/iChizer0/nanobot-channel-voice)
