# Huiginn/teachenglishbot-offline

## Resumen

`Huiginn/teachenglishbot-offline` es un paquete de aplicacion de escritorio para practicar ingles, distribuido a traves de un repositorio de Hugging Face, no un modelo de lenguaje unico. El autor (Huiginn; atribuido en la model card a Ton That Bao Toan) empaqueta en un solo artefacto varios modelos preentrenados de terceros: `facebook/wav2vec2-lv-60-espeak-cv-ft` para puntuacion de pronunciacion, `openai/whisper-base.en` para transcripcion de voz y `hexgrad/Kokoro-82M` para sintesis de voz (TTS). La inferencia se ejecuta en CPU mediante ONNX Runtime 1.32.0, sin GPU.

El objetivo es un tutor de ingles que funciona completamente offline y en local: escucha al usuario por microfono, transcribe lo dicho, evalua la pronunciacion contra el modelo fonetico de wav2vec2, sintetiza una voz de referencia con Kokoro y revisa la gramatica. La interfaz web y los procesos auxiliares escuchan exclusivamente en `127.0.0.1`, sin telemetria ni actualizaciones automaticas. La version documentada es la 0.4.1.

Es relevante como ejemplo de integracion de varios modelos pequenos en un producto de escritorio con requisitos modestos (CPU de 64 bits, 8 GB de RAM recomendados, unos 3,0 GiB en disco tras la instalacion). No es un modelo entrenado por el autor: los pesos base son de Meta (wav2vec2), OpenAI (Whisper) y hexgrad (Kokoro), y la licencia declarada del repositorio es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion de escritorio que orquesta tres modelos: wav2vec2 (reconocimiento fonetico/ASR), Whisper base (ASR seq2seq transformer) y Kokoro-82M (TTS); ejecucion via ONNX Runtime |
| Parametros totales | No disponible (no se declara el total agregado; Kokoro-82M tiene ~82 M; Whisper base.en ~74 M; wav2vec2-lv-60-espeak-cv-ft ~95 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende de cada componente; Whisper base.en usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | No disponible (formato ONNX; el repositorio no detalla precision ni cuantizacion de los grafos) |
| Idiomas soportados | Ingles (`en`) en los modelos; interfaz de usuario en ingles y vietnamita |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime `onnxruntime`); el repositorio contiene paquetes instalables `.tar.gz`/`.zip`, no pesos sueltos en safetensors/GGUF |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo propio: agrega y empaqueta modelos preentrenados. El componente de pronunciacion parte de `facebook/wav2vec2-lv-60-espeak-cv-ft`, un wav2vec2 fine-tuneado para reconocimiento fonetico con salida en fonemas eSpeak, lo que permite comparar la realizacion fonetica del alumno con una referencia. La transcripcion del habla corre a cargo de `openai/whisper-base.en`, un transformer encoder-decoder con ventanas de audio de 30 segundos. La voz sintetica la genera `hexgrad/Kokoro-82M`, un modelo TTS ligero de ~82 M de parametros.

La innovacion tecnica no esta en los modelos sino en el empaquetado: conversion a ONNX y ejecucion en CPU con ONNX Runtime 1.32.0, instalador con verificacion SHA-256 de cada fichero, autotest de arranque y aislamiento en `127.0.0.1`. No hay datos publicados sobre volumen de entrenamiento, composicion del dataset, RLHF/DPO ni tecnicas de decodificacion especulativa. La model card no aporta informacion sobre el proceso de ajuste fino ni sobre evaluacion cuantitativa de los componentes.

## Capacidades

- Puntuacion de pronunciacion en ingles a partir de audio de microfono, usando representaciones foneticas de wav2vec2.
- Transcripcion de voz (speech-to-text) en ingles con Whisper base.en.
- Sintesis de voz (text-to-speech) en ingles con Kokoro-82M para ofrecer una voz de referencia.
- Revision de gramatica sobre el texto transcrito.
- Funcionamiento completamente offline, sin envio de audio, texto ni puntuaciones a servidores externos.
- Interfaz web local servida solo en `127.0.0.1`, sin exposicion a la red local ni a internet.
- Procesamiento de audio en memoria, sin almacenamiento persistente de las grabaciones.
- Interfaz de usuario en ingles y vietnamita (con fallback a ingles para otros idiomas).
- No incluye caja de chat: la practica conversacional se delega a "Grok Bot" segun la model card.
- No se documentan tool calling, function calling, capacidades de agente ni razonamiento multi-paso.

## Casos de uso

- Practica de pronunciacion individual: el usuario lee frases en ingles y la aplicacion compara su realizacion fonetica con la referencia mediante wav2vec2, devolviendo una puntuacion; adecuado por su ejecucion en CPU y su bajo consumo de memoria (pico de ~2,4 GB).
- Aprendizaje de ingles en entornos sin conectividad: escuelas, zonas rurales o aulas con red restringida pueden desplegar la aplicacion porque funciona offline y no requiere GPU.
- Uso en equipos de bajas prestaciones: al necesitar solo un CPU de 64 bits y 8 GB de RAM recomendados, encaja en portatiles de oficina sin tarjeta grafica dedicada.
- Refuerzo de comprension auditiva con voz sintetica: Kokoro-82M genera locuciones de referencia que el alumno puede escuchar antes de repetir, sin depender de servicios TTS en la nube.
- Dictado y transcripcion de practicas orales: Whisper base.en convierte las grabaciones en texto para que el alumno revise lo que realmente dijo frente a lo que pretendia decir.
- Correccion gramatical de textos cortos: el componente de revision de gramatica permite al estudiante comprobar frases escritas o transcritas antes de entregarlas.
- Escenario de privacidad estricta: centros o empresas que no permiten enviar audio de alumnos a terceros pueden usar la aplicacion porque todo el procesamiento ocurre en local y sin telemetria.
- Prototipo para desarrolladores: sirve como referencia de integracion de wav2vec2, Whisper y Kokoro en ONNX Runtime para construir herramientas educativas de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card solo aporta metricas operativas de la version 0.4.1: tamano instalado de aproximadamente 3,0 GiB (3 185 688 660 bytes; 3 222 595 322 bytes en disco) en Linux, pico de memoria de unos 2,4 GB (2 384 MB) durante el autotest, y paquetes de 1,583 GiB (Linux x86_64), 2,009 GiB (Windows x86_64) y 1,344 GiB (macOS arm64).

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es exclusivamente en CPU mediante ONNX Runtime.
- RAM: 8 GB recomendados; pico medido de aproximadamente 2,4 GB durante el autotest en Linux.
- Disco: 8 GB libres en el momento de la instalacion; ocupacion final de unos 3,0 GiB.
- CPU: cualquier CPU de 64 bits; no se especifican requisitos de instrucciones (AVX, AVX2) ni numero de nucleos.
- GPU recomendadas: no aplica; no se documenta soporte de CUDA, ROCm ni Metal.
- Cabe en cualquier equipo consumer que cumpla RAM y disco; no se necesita RTX 4090, A100 ni H100.
- Sistemas soportados: Linux x86_64, Windows 10/11 x64 (requiere Visual C++ 2015-2022 Redistributable x64) y macOS 14 o superior solo en Apple silicon (arm64). No hay paquete para macOS Intel porque ONNX Runtime 1.32.0 no ofrece build para esa plataforma.
- Opciones de despliegue: instalador propio (`install.sh`, `install.cmd`, `install.sh` en macOS) con verificacion SHA-256 y autotest; arranque con `run.sh`, `run.cmd` o `run.command`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Aspecto | teachenglishbot-offline (0.4.1) | Whisper base.en (uso directo) | wav2vec2-lv-60-espeak-cv-ft (uso directo) | Kokoro-82M (uso directo) |
|---|---|---|---|---|
| Tipo | Aplicacion de escritorio que orquesta varios modelos | Modelo ASR | Modelo de reconocimiento fonetico | Modelo TTS |
| Parametros | Agregado no declarado | ~74 M | ~95 M | ~82 M |
| Contexto | No disponible | Ventanas de audio de 30 s | No aplica (audio) | No aplica (texto corto) |
| Ejecucion | CPU via ONNX Runtime | CPU/GPU | CPU/GPU | CPU/GPU |
| Licencia | Apache 2.0 | MIT (OpenAI) | Apache 2.0 (Meta) | Apache 2.0 |
| Disponibilidad | Paquetes Linux/Windows/macOS arm64 en Hugging Face | Hugging Face, multiple runtimes | Hugging Face | Hugging Face |
| Puntuacion de pronunciacion | Si, integrada | No | Parcial (fonemas, requiere logica propia) | No |
| Interfaz de usuario | Si, web local en 127.0.0.1 | No | No | No |

La comparativa con modelos de lenguaje de proposito general no es aplicable: este repositorio no contiene un LLM y no compite en tareas de generacion de texto, razonamiento o codigo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona y no soporta tool calling ni agentes; la model card indica que la conversacion se delega a "Grok Bot" y que la aplicacion no tiene caja de chat.
- Solo soporta ingles en los modelos; la interfaz admite ingles y vietnamita, con fallback a ingles para otros idiomas.
- La model card esta truncada en la seccion de limitaciones ("The pronunciation score i..."), por lo que no se conocen todas las limitaciones declaradas por el autor.
- Los paquetes no estan firmados digitalmente: Windows puede mostrar advertencias de SmartScreen y macOS bloquea la app por Gatekeeper hasta que se elimina el atributo de cuarentena con `xattr`. Esto exige verificar el SHA-256 antes de instalar.
- No hay paquete para macOS Intel; los usuarios con Macs Intel quedan fuera de soporte.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente.
- No se publican benchmarks de precision de ASR, de puntuacion de pronunciacion ni de calidad TTS; no es posible comparar su rendimiento con alternativas.
- No se detalla la cuantizacion ni la precision de los grafos ONNX, lo que dificulta estimar el impacto en calidad frente a los modelos originales.
- Riesgo de sesgo y alucinacion: no evaluado en la informacion disponible; al depender de Whisper base.en, hereda sus limitaciones conocidas de reconocimiento en acentos no nativos y audio ruidoso, aunque no se documenta explicitamente.
- Licencia Apache 2.0 declarada para el repositorio, pero los modelos base tienen sus propias licencias (Whisper MIT, wav2vec2 Apache 2.0, Kokoro Apache 2.0); conviene verificar los textos de licencia incluidos en el paquete antes de uso comercial.
- El instalador requiere 8 GB libres y comprueba el espacio; no hay actualizaciones automaticas ni telemetria, lo que implica que el usuario debe gestionar manualmente las actualizaciones de seguridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Huiginn/teachenglishbot-offline
- Modelo base de pronunciacion: https://huggingface.co/facebook/wav2vec2-lv-60-espeak-cv-ft
- Modelo base de TTS: https://huggingface.co/hexgrad/Kokoro-82M
- Modelo base de ASR: https://huggingface.co/openai/whisper-base.en
- ONNX Runtime: https://onnxruntime.ai/
- Paper de wav2vec 2.0: https://arxiv.org/abs/2006.11477
- Paper de Whisper: https://arxiv.org/abs/2212.04356
