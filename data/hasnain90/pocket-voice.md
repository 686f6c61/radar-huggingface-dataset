# hasnain90/pocket-voice

## Resumen

pocket-voice es un paquete de agente de voz autoalojado que agrupa cuatro modelos independientes y un manifiesto de configuracion en un unico repositorio versionado de Hugging Face. No se trata de una red neuronal fusionada ni de un modelo afinado, sino de una combinacion orquestada de deteccion de actividad de voz (Silero VAD), reconocimiento de habla (Moonshine base), generacion de respuestas (Qwen2.5-1.5B-Instruct en cuantizacion Q4_K_M) y sintesis de voz (Kokoro-82M en ONNX con 54 voces). El autor es hasnain90 y el repo ocupa 1,7 GB.

El problema que resuelve es la integracion de un pipeline de voz completo con streaming en cada etapa y soporte de interrupcion (barge-in): el agente deja de hablar en aproximadamente 0,4 s cuando el usuario lo interrumpe y conserva solo la parte de la respuesta que el usuario escucho. Esto lo hace relevante para prototipos de asistentes conversacionales que se ejecutan en hardware local, sin depender de APIs en la nube.

La arquitectura no es un transformer unico: son cuatro etapas heterogeneas que se ejecutan secuencialmente. El total de parametros declarado en safetensors es de 1.777.088.000, aunque la mayor parte del peso corresponde al LLM Qwen2.5-1.5B. La licencia global es Apache-2.0, con componentes MIT (Silero VAD, Moonshine, exportacion ONNX de Kokoro).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de cuatro etapas: Silero VAD (ONNX), Moonshine base encoder-decoder (ASR), Qwen2.5-1.5B-Instruct (LLM, transformer decoder-only), Kokoro-82M (TTS, ONNX) |
| Parametros totales | 1.777.088.000 (safetensors); el LLM Qwen2.5-1.5B domina el computo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del contexto nativo de Qwen2.5-1.5B, no declarado en la informacion) |
| Tipos de cuantizacion | LLM en Q4_K_M (GGUF); VAD y TTS en ONNX; ASR en formato Moonshine (encoder, decoder, tokenizer) |
| Idiomas soportados | Ingles (configuracion); el pack de voces Kokoro cubre otros idiomas, pero el ASR y el prompt son en ingles |
| Licencia | Apache-2.0 (global); componentes MIT (Silero VAD, Moonshine, exportacion ONNX de Kokoro) |
| Formato de pesos | ONNX (VAD, TTS), GGUF (LLM), safetensors/carpeta Moonshine (ASR), binario de voces (voices-v1.0.bin) |

## Arquitectura y entrenamiento

pocket-voice no entrena ningun modelo propio: empaqueta copias sin modificar de cuatro releases upstream y las une mediante `config.json`, que define nombres de fichero y parametros de ejecucion (temporizacion de fin de turno, umbral de interrupcion, system prompt, voz y muestreo). El pipeline es: Silero VAD detecta actividad de voz sobre audio de 16 kHz mono float32; Moonshine base transcribe; Qwen2.5-1.5B-Instruct en GGUF Q4_K_M genera la respuesta; Kokoro-82M sintetiza audio a 24 kHz. Cada etapa emite eventos en streaming.

La innovacion tecnica no esta en los pesos sino en la orquestacion: temporizacion de fin de turno con una ventana fija de 0,6 s de silencio, umbral de interrupcion que detiene la sintesis en aproximadamente 0,41 s en pruebas de navegador, y conservacion del texto ya pronunciado para mantener coherencia tras un barge-in. El repositorio incluye `SHA256SUMS` con los bytes exactos probados y los textos de licencia de cada componente en `LICENSES/`. No se documentan datos de entrenamiento, tokens, RLHF ni DPO, ya que corresponden a los modelos upstream y no se detallan en la informacion disponible.

## Capacidades

- Deteccion de actividad de voz (VAD) para segmentar turnos de habla.
- Transcripcion de voz a texto en ingles con Moonshine base.
- Generacion de respuestas conversacionales con Qwen2.5-1.5B-Instruct.
- Sintesis de voz a texto con Kokoro-82M y 54 voces disponibles.
- Streaming en cada etapa del pipeline (transcripcion, texto de respuesta, audio).
- Interrupcion (barge-in): el agente deja de hablar en aproximadamente 0,4 s y conserva solo la parte escuchada.
- API Python (`VoiceModel`, `conversation()`, `stream()`) y servidor con pagina de prueba en navegador.
- Soporte de Docker y despliegue autoalojado.
- Capacidades multilingues limitadas: solo ingles en esta configuracion.
- No se documenta soporte de tool calling, agentes multi-paso, vision ni audio de entrada mas alla del ASR.

## Casos de uso

- Prototipado de asistentes de voz locales: el paquete permite levantar un agente conversacional completo con `uv run pocket-voice serve` y probarlo en el navegador sin APIs externas, adecuado para validar flujos de voz antes de invertir en infraestructura.
- Atencion al cliente con guiones acotados: Qwen2.5-1.5B es suficiente para conversaciones estrechas y guionizadas; el autor recomienda anadir guardrails o recuperacion para cualquier contenido factual.
- Demos de interrupcion natural: el barge-in con cancelacion de eco en el cliente permite construir experiencias donde el usuario puede hablar encima del agente, util para evaluar UX conversacional.
- Kioscos o terminales autoalojados: al ejecutarse integramente en local (CPU o GPU del equipo), encaja en entornos con requisitos de privacidad donde el audio no debe salir del dispositivo.
- Pruebas de latencia en hardware de consumo: con LLM en GPU del Mac y modelos de voz en CPU, la mediana hasta el primer audio es de 0,45 s, lo que permite comparar configuraciones de despliegue.
- Educacion y accesibilidad: la sintesis con 54 voces y el streaming permiten generar respuestas habladas para aplicaciones de lectura o asistencia, siempre en ingles.
- Investigacion en pipelines de voz: al ser componentes upstream sin modificar con hashes verificables, sirve como baseline reproducible para experimentos de ASR, LLM y TTS combinados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos medidos son de latencia, en un MacBook con Apple M4 Pro y una conversacion guionizada de cinco turnos, desde que el interlocutor deja de hablar hasta el primer audio de respuesta:

| Configuracion | Mediana | Peor caso |
|---|---|---|
| LLM en GPU del Mac, modelos de voz en CPU | 0,45 s | 1,1 s |
| Todo en CPU | 0,72 s | 1,0 s |

A estas cifras hay que sumar la pausa fija de 0,6 s de fin de habla. La interrupcion detuvo el audio en 0,41 s en una prueba de navegador. No medidos: CPUs en la nube, servicio con GPU y numero de llamadas concurrentes por maquina.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el LLM Q4_K_M de 1.5B ocupa aproximadamente 1 GB en disco y puede ejecutarse en CPU, por lo que la VRAM necesaria es modesta.
- GPU recomendadas: no se especifican; las pruebas se hicieron con la GPU integrada de un Apple M4 Pro. Cualquier GPU consumer con soporte para llama.cpp deberia poder alojar el LLM.
- Cabe en GPU consumer: si, dado el tamano del LLM en Q4_K_M y el uso de ONNX para VAD y TTS; no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (via GGUF), ONNX Runtime para VAD y TTS, servidor propio `pocket-voice serve`, Docker, API Python. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: mediana de 0,45 s (LLM en GPU, voz en CPU) y 0,72 s (todo en CPU) hasta el primer audio; throughput concurrente no medido.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros paquetes de agentes de voz ni con modelos alternativos de ASR, TTS o LLM conversacional.

## Limitaciones y advertencias

- El fin de turno es una ventana fija de 0,6 s de silencio, por lo que no distingue una frase terminada de una pausa de reflexion.
- La interrupcion requiere cancelacion de eco en el cliente (los navegadores la proporcionan); sin ella, el agente puede oirse a si mismo y detenerse.
- Un modelo de 1.5B es adecuado para conversaciones estrechas y guionizadas; para contenido factual necesita guardrails o recuperacion.
- Solo ingles en esta configuracion: el pack de voces Kokoro cubre otros idiomas, pero el reconocedor y el prompt son en ingles.
- Riesgo de alucinacion inherente al LLM Qwen2.5-1.5B, no mitigado en el paquete.
- No se han medido latencias en CPUs en la nube, servicio con GPU ni concurrencia, por lo que el rendimiento en produccion a escala es desconocido.
- Licencia Apache-2.0 global compatible con uso comercial, pero deben respetarse las licencias MIT de Silero VAD, Moonshine y la exportacion ONNX de Kokoro incluidas en `LICENSES/`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hasnain90/pocket-voice
- Repositorio GitHub (codigo, servidor, pagina de prueba y Docker): https://github.com/Hasnaincodeunzip1/pocket-voice
- Silero VAD: https://github.com/snakers4/silero-vad
- Moonshine base (UsefulSensors): https://huggingface.co/UsefulSensors/moonshine
- Qwen2.5-1.5B-Instruct GGUF: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- kokoro-onnx (exportacion ONNX y pack de voces): https://github.com/thewh1teagle/kokoro-onnx
