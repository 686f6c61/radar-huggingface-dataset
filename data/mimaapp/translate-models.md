# mimaapp/translate-models

## Resumen

`mimaapp/translate-models` no es un modelo entrenado por su autor, sino un espejo de los pesos que descarga la aplicación Android Translate (`com.mimaapp.translate`), un traductor de voz offline pensado para dos personas que comparten un mismo teléfono. El repositorio contiene dos artefactos en formato ggml: un conversor cuantizado a q8_0 del modelo de reconocimiento de voz NVIDIA Parakeet TDT 0.6B v3 y un conversor del detector de actividad de voz Silero VAD v5.1.2. El objetivo del espejo es que la app no dependa de repositorios de terceros para funcionar.

La relevancia de la ficha está en que agrupa dos componentes de un pipeline de voz on-device: el VAD segmenta el audio y el modelo Parakeet transcribe. La traducción como tal no la realiza ninguno de los dos ficheros incluidos; la etiqueta `translation` del pipeline describe el propósito de la aplicación que los consume, no una capacidad del modelo de ASR.

El repositorio ocupa 0,7 GB y no registra descargas ni likes en el momento de la consulta. La licencia declarada a nivel de repositorio es CC-BY-4.0, aunque cada fichero conserva su licencia original (CC-BY-4.0 para Parakeet, MIT para Silero VAD).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (transducer con decoder de predicción TDT) para ASR; Silero VAD v5.1.2 para detección de actividad de voz. Detalles internos de capas y atención: no disponible |
| Parametros totales | 0,6 B en el modelo ASR (Parakeet TDT 0.6B v3); Silero VAD: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q8_0 (8 bits) para Parakeet; Silero VAD sin cuantización declarada |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`); lista concreta de idiomas: no disponible |
| Licencia | Repositorio: CC-BY-4.0. Parakeet: CC-BY-4.0. Silero VAD: MIT |
| Formato de pesos | ggml (`.bin`): `ggml-parakeet-tdt-0.6b-v3-q8_0.bin` y `ggml-silero-v5.1.2.bin` |

## Arquitectura y entrenamiento

El componente principal es Parakeet TDT 0.6B v3 de NVIDIA, un modelo de reconocimiento automático del habla basado en arquitectura transducer con decodificación TDT (token-and-duration transducer), que predice conjuntamente tokens y duraciones para acelerar la decodificación. El fichero alojado aquí es una conversión a formato ggml y una cuantización q8_0 realizada por ggml-org, sin cambios adicionales según la model card. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste por RLHF o DPO.

El segundo componente es Silero VAD v5.1.2, un detector de actividad de voz ligero convertido también a ggml por ggml-org. Su función en el pipeline es segmentar el audio de entrada antes de pasarlo al ASR, evitando transcribir silencios y reduciendo cómputo. No se dispone de detalles de entrenamiento de ninguno de los dos modelos en la información proporcionada.

## Capacidades

- Reconocimiento de voz (ASR) multilingüe mediante Parakeet TDT 0.6B v3.
- Detección de actividad de voz (VAD) para segmentar audio y filtrar silencios con Silero VAD v5.1.2.
- Ejecución on-device: los ficheros están pensados para inferencia local en Android mediante whisper.cpp/ggml, sin envío de audio a servidores.
- Integración en un flujo de traducción de voz en la app Translate, aunque la traducción textual no la realiza ninguno de los dos modelos incluidos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades de visión o audio generativo: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Traducción de conversaciones presenciales sin conexión: la app combina el VAD para detectar turnos de habla y Parakeet para transcribir cada intervención, de modo que dos personas pueden hablar por turnos en un mismo dispositivo sin enviar audio a la nube.
- Aplicaciones de accesibilidad para personas con dificultades auditivas: el pipeline VAD + ASR puede generar subtítulos en tiempo real en local, con la ventaja de que el audio no sale del teléfono.
- Dictado offline en dispositivos móviles: el modelo ASR cuantizado a q8_0 permite transcribir notas de voz sin conexión, adecuado para entornos con conectividad limitada o requisitos de privacidad.
- Preprocesado de audio para pipelines de voz: Silero VAD puede usarse de forma independiente para recortar silencios y segmentar grabaciones largas antes de pasarlas a otro motor de ASR o de traducción.
- Prototipado de asistentes de voz locales: los ficheros ggml se integran en proyectos basados en whisper.cpp/ggml para construir asistentes que funcionan íntegramente en el dispositivo.
- Investigación en ASR multilingüe de bajo coste: el modelo de 0,6 B parámetros en q8_0 sirve como referencia para evaluar calidad de transcripción en hardware de gama media frente a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 0,6 B parámetros en q8_0, el peso del modelo ASR ronda los 0,6 GB; el repositorio completo ocupa 0,7 GB, por lo que la huella de memoria es compatible con dispositivos móviles de gama media.
- GPU recomendadas: no disponible. El formato ggml está orientado a CPU y a aceleración móvil; no se documentan requisitos de GPU de escritorio.
- Cabe en GPU consumer: previsiblemente sí por tamaño, pero no hay datos oficiales de compatibilidad ni de rendimiento en GPU.
- Opciones de despliegue: whisper.cpp y el ecosistema ggml, que es el formato nativo de los ficheros. No se indica soporte para vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mimaapp/translate-models (Parakeet TDT 0.6B v3 q8_0 + Silero VAD) | 0,6 B (ASR) | No disponible | CC-BY-4.0 / MIT | ggml | Espejo de pesos para app Android offline |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | No disponible | CC-BY-4.0 | safetensors (original) | Modelo original de NVIDIA; el espejo es una conversión q8_0 |
| OpenAI Whisper (familia) | 39 M – 1,55 B según variante | 30 s de audio por ventana | MIT | múltiples (incl. ggml) | Alternativa ASR ampliamente usada en whisper.cpp; comparación de rendimiento no disponible en la información |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de traducción: la etiqueta `translation` refleja el uso en la app, pero los ficheros son ASR y VAD.
- Es un espejo de pesos de terceros; los cambios y el mantenimiento dependen de los repositorios originales de ggml-org y NVIDIA.
- No se documentan sesgos conocidos ni tasas de alucinación del modelo ASR.
- La lista concreta de idiomas soportados no está disponible; la etiqueta `multilingual` es genérica.
- La licencia CC-BY-4.0 exige atribución a NVIDIA (Parakeet) y a Silero Team (VAD); el uso comercial es posible con atribución, pero conviene revisar los términos de cada componente por separado.
- El formato ggml limita la integración a herramientas compatibles (whisper.cpp y derivados); no es directamente usable en frameworks como vLLM o TGI.
- Al ser un modelo de 0,6 B parámetros, la calidad de transcripción en condiciones de ruido o acentos no documentados no está garantizada.
- No hay métricas publicadas de latencia ni de consumo energético en dispositivos móviles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mimaapp/translate-models
- Modelo original Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión GGUF de Parakeet: https://huggingface.co/ggml-org/parakeet-GGUF
- Conversión VAD de ggml-org: https://huggingface.co/ggml-org/whisper-vad
- Silero VAD: https://github.com/snakers4/silero-vad
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia MIT: https://opensource.org/licenses/MIT
