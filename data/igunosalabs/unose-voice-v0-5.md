# igunosalabs/Unose-Voice-v0.5

## Resumen

Unose-Voice-v0.5 es un modelo de sintesis de voz (text-to-speech) desarrollado por Igunosa Labs como checkpoint fundacional de un clon de voz neuronal del hablante identificado como Patrick. El modelo parte del checkpoint base `en_US-lessac-medium` de Piper y se ha adaptado durante 250 epocas adicionales hasta la epoca 2414, incorporando un acento ingles nigeriano (Africa Occidental) tanto en inflexion como en cadencia. Se distribuye como un grafo ONNX Runtime optimizado de 60,5 MB y se integra de forma nativa con la libreria Piper.

La relevancia del modelo es acotada pero concreta: demuestra un flujo de trabajo de adaptacion de voz (voice cloning por fine-tuning, no zero-shot) sobre una arquitectura VITS ya consolidada, con un coste computacional minimo y una latencia declarada de aproximadamente 25 ms de factor de tiempo real (RTF 0,04) sobre CPU ARM64. Esto lo hace apto para despliegue en dispositivos de borde, sistemas embebidos y pipelines de sintesis en tiempo real sin GPU.

Se trata de un modelo de nicho, con 12 descargas y 0 likes en el momento de la consulta, orientado a un unico hablante y a un unico idioma (ingles). No debe confundirse con un sistema TTS multihablante o multilingue: es un artefacto de voz personalizado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end TTS) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto variable, sin contexto declarado) |
| Tipos de cuantizacion | no disponible (se distribuye como grafo ONNX Runtime optimizado) |
| Idiomas soportados | Ingles (en), con acento nigeriano / Africa Occidental |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo optimizado, 60,5 MB) + fichero de configuracion `.onnx.json` |
| Frecuencia de muestreo | 22.050 Hz |
| Hablantes | 1 (Patrick, Igunosa Labs) |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | Piper |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado con aprendizaje adversario, junto con un vocoder HiFi-GAN para la generacion de la forma de onda a 22.050 Hz. VITS elimina la necesidad de un pipeline en dos etapas (modelo acustico + vocoder separado) al generar audio directamente desde texto mediante inferencia variacional.

El entrenamiento consistio en un fine-tuning de 250 epocas de adaptacion sobre el checkpoint base `en_US-lessac-medium` de Piper, alcanzando la epoca 2414. El dataset es de tipo `custom` (no se detalla su composicion, numero de horas ni procedencia en la informacion disponible). Las metricas de convergencia reportadas son: perdida del generador 35,37, perdida del discriminador 1,86 (equilibrio adversarial estable) y perdida de validacion 38,58. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo esperable en un modelo TTS. La innovacion tecnica destacable es la exportacion a un grafo ONNX Runtime optimizado que permite inferencia en CPU con RTF 0,04.

## Capacidades

- Sintesis de voz (text-to-speech) end-to-end a partir de texto en ingles.
- Clonacion de voz de un unico hablante (Patrick) mediante adaptacion por fine-tuning, no zero-shot.
- Reproduccion de un acento especifico: ingles con inflexion y cadencia nigeriana / de Africa Occidental.
- Generacion de audio a 22.050 Hz con calidad de vocoder HiFi-GAN.
- Inferencia en CPU (incluida ARM64) con latencia baja (RTF 0,04, ~25 ms).
- Integracion directa con la CLI de Piper y con ONNX Runtime.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No es multilingue: solo ingles.
- No dispone de modo "thinking" ni capacidades de comprension del lenguaje mas alla de la fonemizacion para sintesis.

## Casos de uso

- Sintesis de voz en dispositivos de borde: el grafo ONNX de 60,5 MB y la inferencia en CPU ARM64 con RTF 0,04 permiten ejecutar TTS en Raspberry Pi, moviles o sistemas embebidos sin GPU, por ejemplo para interfaces de voz offline.
- Lectura de contenido en aplicaciones de accesibilidad: conversion de texto a audio para lectores de pantalla o asistentes para personas con discapacidad visual, con una voz con acento nigeriano que puede resultar mas natural para usuarios de esa region.
- Generacion de audio para contenido localizado: produccion de narraciones, anuncios o material educativo dirigidos a audiencias de Nigeria y Africa Occidental, donde el acento nativo aporta cercania frente a voces genericas en ingles estadounidense.
- Prototipado de asistentes conversacionales: integracion en pipelines de voz (ASR + LLM + TTS) para demos y pruebas de concepto donde se requiere una voz personalizada sin coste de GPU.
- Doblaje y postproduccion de bajo coste: generacion de pistas de voz para videos, podcasts o tutoriales con un hablante consistente, usando la CLI de Piper en scripts de automatizacion.
- Investigacion en clonacion de voz: sirve como referencia reproducible de un flujo de fine-tuning sobre Piper/VITS con metricas de convergencia publicadas, util para estudiar adaptacion de acento y equilibrio adversarial.
- Sistemas de anuncios o notificaciones por voz: sintesis en tiempo real de mensajes cortos en entornos con recursos limitados, gracias a la baja latencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MOS, CMOS, WER, MCD) en la informacion disponible. El autor unicamente reporta metricas internas de entrenamiento y de inferencia:

| Metrica | Valor |
|---|---|
| Perdida del generador (L_gen) | 35,37 |
| Perdida del discriminador (L_disc) | 1,86 |
| Perdida de validacion (L_val) | 38,58 |
| Factor de tiempo real (RTF) | 0,04 (~25 ms) en CPU ARM64 |
| Epoca final | 2414 (250 epocas de adaptacion) |

No se dispone de comparaciones con otros modelos TTS en terminos de calidad perceptual.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para ejecucion en CPU mediante ONNX Runtime.
- GPU recomendadas: no requeridas. Cualquier GPU compatible con ONNX Runtime podria acelerar la inferencia, pero no se documentan requisitos ni ganancias.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto; el modelo cabe holgadamente en cualquier hardware por su tamano (60,5 MB).
- Opciones de despliegue: Piper (CLI y libreria), ONNX Runtime. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a modelos TTS de este tipo.
- Latencia y throughput: RTF 0,04 (~25 ms por unidad de audio) en CPU ARM64 segun el autor; no se reportan cifras para otras plataformas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Hablantes | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Unose-Voice-v0.5 | VITS + HiFi-GAN | Ingles (acento nigeriano) | 1 | ONNX (60,5 MB) | Apache 2.0 | Fine-tuning de `en_US-lessac-medium`; RTF 0,04 en ARM64 |
| Piper `en_US-lessac-medium` | VITS | Ingles (EE. UU.) | 1 | ONNX | MIT (proyecto Piper) | Checkpoint base del que deriva este modelo |
| Piper (voces multihablante, p. ej. `en_US-*`) | VITS | Ingles y otros | Variable | ONNX | MIT | Familia de referencia para TTS en CPU con Piper |
| Coqui TTS (XTTS v2) | GPT + VITS/diffusion | Multilingue | Clonacion zero-shot | PyTorch | Coqui Public Model License (no comercial en algunas variantes) | Mayor calidad y clonacion zero-shot, pero requiere GPU y licencia mas restrictiva |

La comparativa se limita a alternativas de la misma familia (Piper/VITS) y a sistemas TTS de referencia; no se dispone de datos de calidad perceptual que permitan una comparacion cuantitativa rigurosa con Unose-Voice-v0.5.

## Limitaciones y advertencias

- Modelo de un unico hablante y un unico idioma (ingles); no es multilingue ni multihablante.
- El acento nigeriano puede no ser adecuado para audiencias que esperen ingles neutro o estadounidense.
- No se documenta la composicion del dataset de entrenamiento (`custom`), lo que impide evaluar sesgos, cobertura fonetica y riesgo de sobreajuste.
- Riesgo de artefactos y alucinaciones acusticas (pronunciacion incorrecta, prosodia irregular) en textos fuera del dominio de entrenamiento; no hay evaluacion perceptual publicada (MOS) que lo cuantifique.
- La clonacion de voz conlleva riesgos de suplantacion y uso indebido; aunque la licencia es Apache 2.0, el uso comercial de la identidad vocal de una persona puede requerir consentimiento explicito segun la jurisdiccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre calidad ni sobre derechos de la voz clonada.
- Modelo con muy baja adopcion (12 descargas, 0 likes) y sin validacion independiente; tratarlo como experimental.
- No apto para tareas de comprension del lenguaje, razonamiento, codigo o vision.
- Fecha de creacion en el repositorio (2026-10-26) posterior a la fecha de consulta habitual; verificar la vigencia del artefacto antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/igunosalabs/Unose-Voice-v0.5
- Repositorio GitHub de Igunosa Labs: https://github.com/Igunosa-Labs/unose-voice
- Proyecto Piper (libreria de inferencia): no disponible en la informacion proporcionada
- Paper de VITS: no disponible en la informacion proporcionada
- Paper de HiFi-GAN: no disponible en la informacion proporcionada
- Demo o espacios asociados: no disponible en la informacion proporcionada
