# Maximilian228/Geode-TTS-Melo-zh

## Resumen

Geode-TTS-Melo-zh es un modelo de sintesis de voz (text-to-speech) en formato ONNX, derivado del modelo chino de MeloTTS (MeloTTS zh_en) desarrollado por MyShell.ai y convertido para sherpa-onnx por el proyecto k2-fsa. El autor, Maximilian228, lo redistribuye sin modificaciones como la voz china de su aplicacion Geode, que cubre interfaz en chino simplificado y tradicional. Se trata, por tanto, de un reempaquetado de un modelo upstream ya existente, no de un entrenamiento nuevo.

Tecnicamente es un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) con un unico hablante femenino, salida a 44,1 kHz y soporte de chino (simplificado y tradicional) e ingles. El paquete incluye `model.onnx` en fp32 de 170 MB, `tokens.txt`, `lexicon.txt`, los diccionarios de cppjieba en `dict/` y varias FST de normalizacion textual (fechas, telefonos, numeros, heteronimos). El repositorio completo ocupa 0,2 GB.

Su relevancia es practica: permite sintesis de voz en dispositivo (on-device) mediante sherpa-onnx sin dependencias de nube, con un consumo de memoria medido de 418 MB y un RTF de 1,29 en un movil de gama media (Redmi Note 9 Pro, Snapdragon 720G, 2 hilos). La licencia MIT y la atribucion clara a MeloTTS y cppjieba facilitan su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con aprendizaje adversarial) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada de texto) |
| Tipos de cuantizacion | fp32 (el fichero int8 del release upstream es un puntero LFS vacio y no se incluye) |
| Idiomas soportados | chino (zh-Hans y zh-Hant) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`, fp32, 170 MB) |
| Frecuencia de muestreo | 44,1 kHz |
| Voces | una voz femenina |
| Runtime objetivo | sherpa-onnx |
| Recursos auxiliares | `tokens.txt`, `lexicon.txt`, `dict/` (cppjieba), FST `date.fst`, `phone.fst`, `number.fst`, `new_heteronym.fst` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema end-to-end que combina un encoder de texto, un prior variacional, un decoder generativo y un discriminador adversarial entrenado conjuntamente. VITS produce audio de forma directa a partir de fonemas sin necesidad de un vocoder separado en tiempo de inferencia, lo que simplifica el despliegue y reduce la latencia en dispositivos. En este paquete concreto, la entrada de texto se normaliza mediante lexico y FST antes de la conversion a fonemas, y el modelo se ejecuta a traves de sherpa-onnx.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre el uso de RLHF o DPO (no aplicables en un sistema TTS de este tipo). El trabajo tecnico relevante de este repositorio es la conversion a ONNX realizada por k2-fsa/sherpa-onnx y la inclusion de los recursos de normalizacion textual (diccionarios cppjieba y FST de reglas) que permiten procesar numeros, fechas, telefonos y heteronimos en chino. El autor indica que los caracteres tradicionales se leen a traves del mismo lexico que los simplificados.

## Capacidades

- Sintesis de voz a partir de texto en chino simplificado, chino tradicional e ingles.
- Voz femenina unica con salida a 44,1 kHz.
- Normalizacion textual integrada para fechas, numeros de telefono, cifras y heteronimos mediante FST.
- Segmentacion y analisis lexico en chino mediante los diccionarios de cppjieba incluidos en `dict/`.
- Inferencia on-device mediante sherpa-onnx, sin dependencia de servicios en la nube.
- Ejecucion en CPU con multiples hilos (configuracion probada con 2 hilos).
- No soporta clonacion de voz, control de emocion, tool calling ni razonamiento multi-paso; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones moviles: integracion via sherpa-onnx para leer contenido en chino o ingles sin conexion, con un consumo medido de 418 MB de memoria maxima en un Snapdragon 720G, adecuado para telefonos de gama media.
- Asistentes de accesibilidad: conversion de texto a voz para usuarios con discapacidad visual en aplicaciones con interfaz en chino simplificado o tradicional, aprovechando que ambos conjuntos de caracteres se resuelven con el mismo lexico.
- Navegacion y avisos por voz en dispositivos embebidos: la normalizacion de fechas, numeros y telefonos mediante FST permite leer de forma natural direcciones, horarios e importes sin preprocesado adicional.
- Aprendizaje de idiomas: reproduccion de frases en chino e ingles con una voz consistente para ejercicios de escucha y practica de pronunciacion.
- Lectura de notificaciones y mensajes en segundo plano: el bajo consumo de memoria y la ejecucion en CPU permiten mantener el motor TTS activo en aplicaciones Android sin competir por la GPU.
- Prototipado rapido de interfaces conversacionales: al ser un paquete ONNX autocontenido con licencia MIT, se puede desplegar en pipelines de prueba o demos sin gestionar licencias de servicios comerciales de TTS.
- Localizacion de contenido: generacion de audio para articulos o documentacion en chino e ingles dentro de flujos de publicacion automatizados.

## Benchmarks y rendimiento

El autor publica una evaluacion de calidad mediante round trip con Whisper large-v3-turbo sobre 30 frases de FLEURS en mandarin (cmn), comparando el CER del audio sintetizado frente al de las grabaciones reales:

| Entrada | CER sintetizado | CER grabacion real |
|---|---|---|
| Texto en simplificado | 12,2 | 7,7 |
| Mismo texto en tradicional | 14,5 | 7,7 |

Rendimiento en dispositivo (Redmi Note 9 Pro, Snapdragon 720G, 2 hilos):

| Metrica | Valor |
|---|---|
| RTF | 1,29 |
| Memoria maxima (VmHWM) | 418 MB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM: no aplica en el escenario probado; el modelo se ejecuta en CPU. El fichero ONNX fp32 ocupa 170 MB y el pico de memoria medido en inferencia es de 418 MB.
- GPU recomendadas: no disponibles; el autor no documenta ejecucion en GPU. Al ser ONNX, podria ejecutarse con proveedores de ejecucion compatibles, pero no hay datos publicados.
- GPU de consumo: no hay datos de ejecucion en RTX 4090 u otras GPU de consumo; el caso documentado es CPU movil.
- Despliegue: sherpa-onnx es el runtime de referencia. El paquete incluye todos los ficheros necesarios (`model.onnx`, `tokens.txt`, `lexicon.txt`, `dict/`, FST).
- Latencia y throughput: RTF de 1,29 en Snapdragon 720G con 2 hilos, es decir, aproximadamente 1,29 segundos de computo por segundo de audio generado en ese dispositivo. No se documentan cifras en otros hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Frecuencia | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Geode-TTS-Melo-zh | VITS | zh (Hans/Hant), en | 44,1 kHz | MIT | ONNX | Reempaquetado de MeloTTS zh_en para sherpa-onnx |
| MeloTTS zh_en (upstream) | VITS | zh, en | 44,1 kHz | MIT | PyTorch / ONNX | Modelo original de MyShell.ai; el paquete int8 del release upstream esta vacio |
| Otros modelos sherpa-onnx VITS | VITS | variable | variable | variable | ONNX | La coleccion `tts-models` de k2-fsa incluye varias voces con el mismo runtime |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Una sola voz femenina: no hay seleccion de hablante ni control de prosodia o emocion.
- Calidad limitada en chino tradicional: el CER sube de 12,2 a 14,5 en la prueba del autor, frente a 7,7 de las grabaciones reales.
- El fichero int8 del release upstream es un puntero LFS vacio, por lo que solo se distribuye la version fp32 de 170 MB.
- No se documentan sesgos especificos, pero al derivar de un corpus de entrenamiento no publico, pueden aparecer sesgos de pronunciacion o prosodia no caracterizados.
- Riesgo de errores de normalizacion en textos con formatos numericos o heteronimos no cubiertos por las FST incluidas.
- El modelo es un reempaquetado sin modificaciones; las mejoras o correcciones deben provenir de MeloTTS o de k2-fsa/sherpa-onnx.
- Licencia MIT: permite uso comercial, pero requiere mantener la atribucion a MeloTTS (MyShell.ai) y a los diccionarios de cppjieba.
- El rendimiento medido (RTF 1,29) corresponde a un dispositivo concreto; en hardware mas lento la sintesis puede no ser en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maximilian228/Geode-TTS-Melo-zh
- MeloTTS (MyShell.ai): https://github.com/myshell-ai/MeloTTS
- sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- Diccionarios cppjieba: https://github.com/yanyiwu/cppjieba
- Aplicacion Geode: https://geode.tifu.xyz
