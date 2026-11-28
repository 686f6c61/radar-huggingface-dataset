# softsay/SenseVoiceSmall-sherpa-onnx-int8

## Resumen

SenseVoiceSmall-sherpa-onnx-int8 es una distribucion en formato ONNX cuantizado a int8 del modelo de reconocimiento automatico del habla SenseVoice Small, desarrollado por el equipo FunAudioLLM del Tongyi Lab (Alibaba Group). El repositorio lo mantiene el usuario softsay como fuente de descarga propia para su producto SoftSay; no entrena ni convierte el modelo, simplemente replica sin cambios los ficheros int8 publicados originalmente por k2-fsa en el repositorio sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17. El modelo base SenseVoice Small es un sistema ASR no autorregresivo que, ademas de transcribir, predice etiquetas de idioma, emocion y eventos acusticos.

La relevancia de esta variante es practica: al estar en ONNX int8 y empaquetada para sherpa-onnx, permite ejecutar reconocimiento de voz en CPU, dispositivos embebidos y moviles con un unico fichero de unos 239 MB, sin necesidad de GPU ni de framework de deep learning completo. Es la pieza tipica de pipelines de dictado, subtitulado o asistentes de voz en local. El contexto de esta ficha es limitado porque la model card del repositorio solo documenta el origen, los hashes y la licencia, sin datos de entrenamiento ni benchmarks.

Conviene subrayar que no es un modelo nuevo ni afinado: es un espejo de artefactos. Cualquier evaluacion de calidad debe remitirse al modelo original SenseVoice Small y a la conversion oficial de sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SenseVoice (ASR no autorregresivo, encoder tipo transformer con prediccion de etiquetas); conversion ONNX via sherpa-onnx |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero `model.int8.onnx`) |
| Idiomas soportados | chino, ingles, japones, coreano y cantonés (segun el nombre del repositorio original `zh-en-ja-ko-yue`) |
| Licencia | FunASR Model Open Source License Agreement 1.1 (funasr-model-license-1.1) |
| Formato de pesos | ONNX (`model.int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna detallada, el volumen de datos de entrenamiento ni el proceso de alineacion en la informacion proporcionada. Por el nombre del modelo base (SenseVoice Small de FunAudioLLM) se trata de un sistema ASR no autorregresivo con prediccion multi-tarea (idioma, emocion y eventos), pero esta ficha no puede confirmar detalles de capas, atencion ni composicion del corpus.

Lo unico documentado es el proceso de conversion: k2-fsa/sherpa-onnx transformo los pesos originales a ONNX y los cuantizo a int8, y softsay replica esos ficheros sin modificarlos. El repositorio incluye los SHA-256 de `model.int8.onnx` (239.233.841 bytes) y `tokens.txt` (315.894 bytes), lo que permite verificar integridad de la descarga.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en chino, ingles, japones, coreano y cantonés.
- Deteccion automatica de idioma dentro de la misma emision, segun el diseno multi-idioma del modelo original.
- Prediccion de etiquetas de emocion y de eventos acusticos (caracteristica de SenseVoice; no verificada en esta distribucion concreta).
- Ejecucion en CPU mediante sherpa-onnx, sin dependencia de GPU.
- Inferencia en local y offline, adecuada para entornos con requisitos de privacidad.
- No se documenta soporte de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: se integra sherpa-onnx con el fichero int8 para transcribir en tiempo real en CPU, sin enviar audio a la nube.
- Subtitulado de reuniones y clases: el modelo procesa flujos de audio en local y genera transcripciones en varios idiomas asiaticos y en ingles, util en entornos con datos sensibles.
- Asistentes de voz embebidos: el tamano de 239 MB y el formato ONNX permiten desplegarlo en dispositivos con recursos limitados (Raspberry Pi, moviles, TVs).
- Transcripcion de archivos multimedia en lote: pipelines de postproduccion pueden usar sherpa-onnx para procesar grabaciones sin coste por minuto de API.
- Atencion al cliente con analitica de llamadas: la deteccion de emocion del modelo original (si esta expuesta en la conversion) permite enrutar o priorizar llamadas.
- Prototipado rapido de productos de voz: al ser un artefacto autocontenido con hash verificado, sirve como dependencia reproducible en pruebas de concepto.
- Verificacion de integridad en produccion: los SHA-256 publicados permiten auditar la cadena de suministro del modelo antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el caso CPU; en GPU, el modelo int8 ocupa aproximadamente 0,24 GB de pesos, por lo que la VRAM necesaria es minima (no disponible una cifra oficial).
- GPU recomendadas: no disponible; el modelo esta pensado para CPU via sherpa-onnx.
- Cabe en cualquier GPU consumer moderna e incluso en CPU de gama baja; el cuello de botella es el procesamiento de audio, no la memoria.
- Opciones de despliegue: sherpa-onnx (libreria nativa, Python, C++, Android, iOS, etc.); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SenseVoiceSmall-sherpa-onnx-int8 (esta ficha) | no disponible | no disponible | zh, en, ja, ko, yue | FunASR 1.1 | ONNX int8 |
| FunAudioLLM/SenseVoiceSmall (original) | no disponible | no disponible | zh, en, ja, ko, yue | FunASR 1.1 | PyTorch |
| csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17 | no disponible | no disponible | zh, en, ja, ko, yue | FunASR 1.1 | ONNX (varias precisiones) |
| Whisper small (referencia) | no disponible en esta ficha | no disponible | multilingue | MIT/Apache segun variante | PyTorch, ONNX, GGUF |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a formato, licencia e idiomas.

## Limitaciones y advertencias

- Es una copia sin modificaciones de artefactos de terceros; softsay no ofrece garantias tecnicas sobre el modelo.
- La licencia FunASR Model Open Source License Agreement 1.1 impone condiciones especificas para uso comercial; es necesario revisar el texto completo del fichero `LICENSE` antes de desplegar en produccion.
- Solo cubre cinco idiomas (chino, ingles, japones, coreano y cantonés); el castellano no esta entre ellos, por lo que no es adecuado para transcripcion en espanol.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de contexto en la informacion disponible.
- Al ser int8, puede haber una perdida de precision frente al modelo original en dominios ruidosos; no se han publicado mediciones.
- La fecha de creacion del repositorio (2026-11-28) y las cero descargas indican que es un artefacto reciente y sin validacion comunitaria.
- No se debe asumir compatibilidad con frameworks distintos de sherpa-onnx.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/softsay/SenseVoiceSmall-sherpa-onnx-int8
- Modelo base: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Repositorio original de la conversion: https://huggingface.co/csukuangfj/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17
- Proyecto SenseVoice: https://github.com/FunAudioLLM/SenseVoice
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Sitio de SoftSay: https://softsay.ai
