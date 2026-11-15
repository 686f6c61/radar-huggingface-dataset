# Phoonnx/vits-de-thorsten

## Resumen

vits-de-thorsten es un modelo de sintesis de voz (text-to-speech) en aleman basado en la arquitectura VITS, desarrollado originalmente por Coqui y empaquetado por Phoonnx en formato ONNX para su uso con la libreria phoonnx. El modelo procede de la distribucion oficial de Coqui TTS v0.7.0 bajo el identificador `tts_models--de--thorsten--vits` y se ha reconvertido para ejecutarse mediante inferencia ONNX, lo que facilita su despliegue en entornos sin dependencias de PyTorch.

La relevancia de este modelo radica en su empaquetado ligero (0,1 GB de repositorio) y su integracion con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`. No se trata de un modelo de lenguaje generativo, sino de un sintetizador acustico condicionado por fonemas que transforma texto aleman normalizado en audio. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

El modelo esta orientado a voces sinteticas en aleman con entrada fonemica basada en el fonemizador gruut (alfabeto IPA). No dispone de capacidades multilingues ni de contexto conversacional: es una herramienta de conversion texto-a-voz de un solo paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | aleman (`de`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto basado en fonemas, un prior variacional condicionado por alineamiento monotono (MAS), un decoder generativo basado en flujos normalizadores y un discriminador adversarial multi-periodo para el entrenamiento. El modelo original fue entrenado por Coqui sobre el corpus Thorsten, un conjunto de datos de voz en aleman de dominio publico ampliamente utilizado en la comunidad TTS.

La version empaquetada por Phoonnx no reentrena el modelo: convierte los pesos originales de PyTorch a ONNX para permitir inferencia sin dependencias de PyTorch. El front-end de texto utiliza `scriptconv` con el fonemizador `GruutPhonemizer`, que normaliza el texto y lo convierte a fonemas IPA antes de la sintesis. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning adicional.

## Capacidades

- Sintesis de voz en aleman a partir de texto plano.
- Conversion texto-a-fonemas mediante gruut (alfabeto IPA) como paso previo a la sintesis.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integracion con el ecosistema OVOS/Mycroft a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en inferencia ONNX, sin necesidad de PyTorch en tiempo de ejecucion.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta vision, audio de entrada ni modo thinking.
- No es multilingue: unicamente aleman.

## Casos de uso

- Asistentes de voz locales en aleman: el modelo se integra en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en un asistente domestico sin conexion a servicios en la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o moviles en aleman: al ser un modelo ONNX ligero (0,1 GB), puede empaquetarse dentro de la propia aplicacion y sintetizar mensajes cortos con baja latencia.
- Accesibilidad para personas con discapacidad visual: conversion de texto de pantalla o documentos a voz en aleman con una voz sintetica consistente y de licencia permisiva.
- Generacion de audiolibros o podcasts automatizados en aleman: el modelo puede sintetizar parrafos completos de forma secuencial, aunque requiere un front-end de normalizacion de texto (scriptconv) para manejar numeros, abreviaturas y simbolos.
- Prototipado de interfaces conversacionales en alemán: util para pruebas de concepto de IVR (respuesta de voz interactiva) o chatbots telefonicos donde se necesita una voz alemana sin coste de licencia.
- Sistemas de navegacion o domotica con feedback hablado: el modelo puede generar instrucciones cortas y repetitivas en tiempo real dentro de un dispositivo embebido con recursos limitados.
- Investigacion en TTS: al estar empaquetado en ONNX y con licencia Apache-2.0, sirve como baseline reproducible para comparar tecnicas de sintesis o para estudiar el comportamiento de VITS en aleman.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en CPU sin GPU dedicada.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna (GTX 1060 o superior) seria suficiente, aunque no se especifica.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con al menos 1-2 GB de memoria libre, aunque no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft, y runtime ONNX (onnxruntime).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| vits-de-thorsten (Phoonnx) | VITS | de | Apache-2.0 | ONNX | no aplica |
| Coqui TTS `tts_models--de--thorsten--vits` | VITS | de | Apache-2.0 | PyTorch | no aplica |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | Apache-2.0 (segun modelo) | ONNX | no aplica |

La comparativa directa con otros modelos TTS alemanes (por ejemplo, Piper o Coqui XTTS) no esta disponible en la informacion proporcionada. La diferencia principal frente al modelo original de Coqui es el formato (ONNX frente a PyTorch) y el empaquetado para phoonnx, no la calidad de sintesis.

## Limitaciones y advertencias

- Modelo unicamente en aleman; no soporta otros idiomas ni cambio de voz.
- No es un modelo de lenguaje: no razona, no responde preguntas ni mantiene contexto conversacional.
- Riesgo de errores de pronunciacion en palabras extranas, nombres propios, siglas o terminos tecnicos no cubiertos por el fonemizador gruut.
- La calidad de sintesis depende del front-end de normalizacion de texto (scriptconv); textos sin normalizar pueden producir lecturas incorrectas de numeros y simbolos.
- No se dispone de informacion sobre sesgos de genero, edad o acento en la voz Thorsten; el corpus original condiciona las caracteristicas de la voz.
- Aunque la licencia es Apache-2.0, se recomienda verificar los terminos del corpus Thorsten original para usos comerciales especificos.
- El modelo no incluye cuantizaciones alternativas ni versiones GGUF; el despliegue esta limitado al runtime ONNX y a phoonnx.
- No hay datos publicados de benchmarks, latencia ni throughput, por lo que las estimaciones de rendimiento en produccion deben validarse empiricamente.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-de-thorsten
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Modelo original Coqui TTS: https://github.com/coqui-ai/TTS/releases/download/v0.7.0_models/tts_models--de--thorsten--vits.zip
- Repositorio Coqui TTS: https://github.com/coqui-ai/TTS
