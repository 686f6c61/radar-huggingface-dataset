# jmoraleses/folio-melo-fr-onnx

## Resumen

Folio Melo (fr, ONNX) es un modelo de sintesis de voz (text-to-speech) derivado de MeloTTS, el motor TTS de MyShell.ai, y del hablante base de OpenVoice, exportado a formato ONNX para inferencia en dispositivo con ONNX Runtime. Lo publica el usuario jmoraleses como parte del proyecto Folio-iOS, una aplicacion orientada a ejecucion local de modelos en dispositivos Apple. El modelo esta especializado en frances y genera audio a 44,1 kHz a partir de texto, con un componente BERT auxiliar para el procesado linguistico.

El problema que resuelve es el de la sintesis de voz de calidad en local, sin depender de servicios en la nube ni de GPU dedicadas: al estar exportado a ONNX con cuantizacion int8 en el codificador BERT, puede ejecutarse en CPU o en hardware de movil mediante ONNX Runtime. El repositorio ocupa aproximadamente 0,2 GB, lo que lo hace manejable para integraciones en aplicaciones cliente.

La relevancia es acotada pero concreta: se trata de un artefacto de despliegue mas que de un modelo entrenado desde cero, con licencia MIT tanto en MeloTTS como en el BERT frances subyacente, lo que facilita su uso comercial. No hay informacion publicada sobre arquitectura interna detallada, numero de parametros ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MeloTTS (TTS) con codificador BERT auxiliar; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 en el modelo BERT auxiliar (`bert.onnx`); el resto no disponible |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Frecuencia de muestreo de salida | 44,1 kHz |
| Tamano del repositorio | ~0,2 GB |
| Entradas | `x`, `x_lengths`, `tones`, `lang`, `sid`, `noise_scale`, `length_scale`, `ja_bert` |
| Salidas | `y` (audio 44,1 kHz), `w_ceil` (frames por simbolo) |
| Codificador BERT | `dbmdz/bert-base-french-europeana-cased` (MIT), hasta capa 10, int8, salida `hidden` |

## Arquitectura y entrenamiento

El modelo es una exportacion a ONNX de MeloTTS, el sistema TTS de MyShell.ai, en su variante de hablante base de OpenVoice. No se ha entrenado desde cero en este repositorio: se trata de una conversion de pesos existentes al formato ONNX para su ejecucion con ONNX Runtime en el proyecto Folio-iOS. La arquitectura subyacente de MeloTTS no se detalla en la informacion proporcionada; el `config.json` del repositorio expone los simbolos foneticos, el desplazamiento de tono y el identificador de idioma, lo que sugiere un pipeline TTS con representacion fonetica y control de prosodia mediante tonos.

El componente linguistico es un BERT frances (`dbmdz/bert-base-french-europeana-cased`, licencia MIT) truncado hasta la capa 10 y cuantizado a int8, con salida `hidden` que alimenta al decodificador acustico. El modelo acepta parametros de control de inferencia como `noise_scale` (variabilidad prosodica), `length_scale` (velocidad del habla) y `sid` (identificador de hablante), ademas de `lang` para seleccion de idioma. No hay informacion sobre volumen de datos de entrenamiento, composicion del corpus, ni si hubo ajuste fino con RLHF o DPO; al ser una exportacion de un modelo preexistente, esas decisiones corresponden a MeloTTS/OpenVoice y no se documentan aqui.

## Capacidades

- Sintesis de texto a voz en frances con salida de audio a 44,1 kHz.
- Control de prosodia mediante `noise_scale` y de velocidad mediante `length_scale`.
- Seleccion de hablante mediante el parametro `sid` (heredado de OpenVoice base speaker).
- Procesado linguistico con BERT frances cuantizado a int8 para reducir huella de memoria.
- Inferencia en dispositivo con ONNX Runtime, sin necesidad de GPU.
- Salida de metadatos de alineacion (`w_ceil`, frames por simbolo) util para sincronizacion.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: solo frances.
- Vision, audio de entrada o modo thinking: no disponible.

## Casos de uso

- Lectura por voz en aplicaciones iOS: el modelo esta exportado especificamente para el proyecto Folio-iOS, por lo que puede integrarse en una app nativa para leer texto de articulos, notificaciones o mensajes con ONNX Runtime, sin conexion a red.
- Accesibilidad para personas con discapacidad visual: sintesis local de contenido textual en frances con latencia baja y sin dependencia de servicios externos, adecuada para lectores de pantalla.
- Aprendizaje de idiomas: generacion de pronunciacion francesa a partir de texto escrito, con control de velocidad mediante `length_scale` para adaptarse a distintos niveles del estudiante.
- Audiolibros y contenido narrado: conversion por lotes de textos largos a audio a 44,1 kHz, con la ventaja de que el procesamiento puede hacerse en local y sin coste por caractere.
- Asistentes de voz embebidos: integracion en dispositivos con recursos limitados (moviles, tablets) gracias al tamano reducido del repositorio (~0,2 GB) y a la cuantizacion int8 del BERT.
- Prototipado de productos de voz: al tener licencia MIT y formato ONNX, sirve para validar rapidamente un pipeline TTS en frances antes de invertir en infraestructura de servidor.
- Generacion de avisos y locuciones automatizadas: sintesis de mensajes cortos en frances para sistemas de megafonia, IVR o notificaciones, con prosodia controlable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa ~0,2 GB, por lo que la huella en memoria es reducida y compatible con CPU.
- GPU recomendadas: no se especifican; el modelo esta pensado para inferencia en dispositivo con ONNX Runtime, sin requerir GPU.
- Compatibilidad con GPU de consumo: no disponible; el objetivo declarado es la ejecucion en dispositivo (on-device), no en GPU de escritorio.
- Opciones de despliegue: ONNX Runtime (principal), integracion en aplicaciones iOS mediante el proyecto Folio-iOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| Folio Melo (fr, ONNX) | TTS MeloTTS + BERT fr | Frances | ONNX | MIT | ~0,2 GB, salida 44,1 kHz, on-device |
| MeloTTS (original, MyShell.ai) | TTS | Multiples | PyTorch | MIT | Modelo fuente del que deriva esta exportacion |
| OpenVoice base speaker | TTS / clonacion de voz | Multiples | PyTorch | MIT | Hablante base usado por Folio Melo |
| Piper TTS | TTS | Multiples | ONNX | MIT | Alternativa on-device; datos concretos de comparacion no disponibles |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa con Piper u otras alternativas TTS ONNX.

## Limitaciones y advertencias

- Solo soporta frances; no hay informacion sobre otros idiomas en este repositorio.
- Es una exportacion de un modelo preexistente, no un modelo entrenado ni ajustado por el autor del repositorio; los sesgos y limitaciones de calidad heredan de MeloTTS y OpenVoice.
- No hay informacion publicada sobre sesgos de generacion de voz (acento, genero, edad) ni sobre evaluaciones de naturalidad (MOS).
- Riesgo de artefactos acusticos y errores de pronunciacion en textos con nombres propios, siglas o terminos tecnicos fuera del dominio de entrenamiento de MeloTTS.
- La cuantizacion int8 del BERT puede degradar ligeramente la calidad prosodica frente al modelo en punto flotante; no se documenta el impacto.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones de las dependencias (MeloTTS, OpenVoice y el BERT frances) en la version concreta utilizada.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- El repositorio tiene muy pocas descargas (29) y ningun "like", por lo que no hay evidencia de comunidad ni de validacion externa.
- La fecha de creacion indicada (2026-10-26) es futura respecto a la mayoria de referencias actuales; conviene verificar la vigencia del artefacto antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jmoraleses/folio-melo-fr-onnx
- MeloTTS (MyShell.ai): https://github.com/myshell-ai/MeloTTS
- OpenVoice: no disponible en la informacion proporcionada (referenciado en la model card)
- Proyecto Folio-iOS: https://github.com/jmoraleses/Folio-iOS (referenciado como origen, commit `90d5f2a`)
- BERT frances base: `dbmdz/bert-base-french-europeana-cased` (referenciado en la model card; enlace directo no disponible)
