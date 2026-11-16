# Phoonnx/vits-de_de-eva_k-x_low-espeak

## Resumen

vits-de_de-eva_k-x_low-espeak es un modelo de sintesis de voz (text-to-speech) de la familia VITS, empaquetado por Phoonnx a partir de la voz original de Rhasspy publicada en el repositorio piper-voices (ruta de/de_DE/eva_k/x_low). El modelo esta disenado para convertir texto en aleman de Alemania (de-DE) en audio, tomando como entrada fonemas en alfabeto IPA generados por espeak-ng.

La relevancia de este paquete no esta en la arquitectura (VITS es un modelo generativo end-to-end ya consolidado) sino en la distribucion: se ofrece como un artefacto ONNX listo para ejecutarse con la libreria phoonnx, lo que permite integrarlo en Python y en el ecosistema OVOS sin necesidad de reentrenar ni de convertir pesos manualmente. Se trata de una variante "x_low" de la voz eva_k, lo que implica un compromiso deliberado hacia el minimo coste computacional y tamano reducido, a costa de calidad acustica frente a las variantes de mayor resolucion.

El modelo esta etiquetado con licencia MIT y solo soporta aleman. El repositorio ocupa 0.0 GB segun los metadatos de Hugging Face, un indicador coherente con una variante x_low de VITS orientada a despliegue ligero. No se han publicado resultados de benchmarks ni detalles de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se detallan variantes) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Variante de calidad | x_low (resolucion minima dentro de la voz eva_k) |
| Libreria de inferencia | phoonnx |
| Autor original | Rhasspy |
| Empaquetado por | Phoonnx |
| Tamano del repositorio | 0.0 GB (segun metadatos) |

## Arquitectura y entrenamiento

El modelo se basa en VITS, una arquitectura de sintesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decoder generativo (tipicamente basado en flujos normalizadores y un generador HiFi-GAN) y un discriminador adversarial multiple. VITS infiere directamente la forma de onda a partir de la secuencia de fonemas, sin necesidad de un modelo acustico intermedio ni de un vocoder separado en tiempo de inferencia. La variante x_low de la voz eva_k implica una configuracion reducida de canales y capas respecto a las variantes medium o high, lo que disminuye el coste de computo y el tamano del artefacto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste fino adicional. El modelo original fue entrenado por Rhasspy dentro del proyecto piper-voices; Phoonnx se limita a empaquetar los pesos ONNX y a definir el front-end de texto. La innovacion tecnica destacable en este paquete es la integracion del fonemizador: el texto se normaliza y convierte a IPA mediante scriptconv (concretamente el `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`), y esa secuencia de fonemas alimenta al modelo. Es importante senalar que los fonemas de espyak (el port de espeak-ng incluido en el extra de pip) pueden diferir de los de espeak-ng nativo, lo que puede provocar pronunciaciones incorrectas en algunas palabras.

## Capacidades

- Sintesis de voz a partir de texto en aleman de Alemania (de-DE).
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas IPA generados por espeak-ng, lo que permite control fino de la pronunciacion si se construye la secuencia de fonemas manualmente.
- Integracion con el ecosistema OVOS a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada: es exclusivamente un modelo TTS.
- Capacidad multilingue limitada a un unico idioma (aleman).

## Casos de uso

- Asistentes de voz en aleman sobre OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y la voz `piper/de_DE-eva_k-x_low`, lo que permite dotar de voz a un asistente domestico sin depender de servicios en la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio o moviles en aleman: al ser una variante x_low, el coste de inferencia es bajo y encaja en dispositivos con recursos limitados donde la latencia importa mas que la naturalidad.
- Generacion de audiolibros o podcasts de bajo coste: el modelo puede sintetizar frases largas de forma secuencial; la calidad x_low es aceptable para contenido informativo pero no para produccion de alta fidelidad.
- Accesibilidad para personas con discapacidad visual: conversion de texto en pantalla a voz en aleman en tiempo real, con un modelo ONNX ligero que puede ejecutarse localmente sin conexion.
- Prototipado rapido de interfaces de voz: al instalarse con `pip install --pre phoonnx` y cargarse mediante `TTSModelManager`, permite tener un TTS funcional en aleman en pocos minutos para validar un producto antes de invertir en una voz de mayor calidad.
- Pruebas automatizadas de pipelines de audio: sirve para generar corpus sinteticos de voz en aleman en entornos de CI, donde el tamano reducido del modelo y su formato ONNX facilitan la ejecucion en contenedores.
- Educacion y aprendizaje de aleman: lectura de vocabulario y frases con pronunciacion controlada mediante fonemas IPA, util en aplicaciones de aprendizaje de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Al ser una variante x_low de VITS en formato ONNX, el modelo esta pensado para ejecutarse en CPU con consumo de memoria muy reducido; el tamano del repositorio figura como 0.0 GB en los metadatos.
- GPU recomendadas: no se especifican. Por el perfil x_low, el modelo esta disenado para inferencia en CPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) seria sobredimensionada para esta variante.
- Cabe en GPU consumer: si, con amplio margen, aunque el caso de uso natural es CPU.
- Opciones de despliegue: phoonnx en Python (`TTSModelManager`), plugin `ovos-tts-plugin-phoonnx` para OVOS, y phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponibles. La variante x_low sugiere el minimo coste computacional dentro de la familia eva_k, pero no se aportan cifras.
- Dependencia externa: requiere espeak-ng instalado en el sistema (`apt install espeak-ng`) o, alternativamente, el extra `phoonnx[espeak]` que incluye espyak.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-de_de-eva_k-x_low-espeak | VITS | de-DE | no aplica | MIT | ONNX | Variante x_low, empaquetada por Phoonnx |
| Otras voces de rhasspy/piper-voices (de_DE) | VITS | de-DE | no aplica | MIT (segun model card upstream) | ONNX | Mismo origen; existen variantes de mayor calidad (x_low, medium, high) |
| Otras voces empaquetadas en la coleccion VITS de Phoonnx | VITS | varios | no aplica | MIT | ONNX | Mismo pipeline de empaquetado y misma libreria de inferencia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad acustica limitada: la variante x_low es la de menor resolucion de la voz eva_k, por lo que la naturalidad y la prosodia seran inferiores a las de variantes medium o high.
- Dependencia de espeak-ng: si se usa espyak en lugar de espeak-ng nativo, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Un solo idioma: solo soporta aleman de Alemania (de-DE); no hay capacidades multilingues.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede producir pronunciaciones incorrectas o artefactos en palabras fuera del vocabulario o en nombres propios, especialmente con entrada fonemica inusual.
- Sin datos de sesgo: no se ha publicado informacion sobre sesgos de genero, dialecto o registro en la voz eva_k.
- Licencia MIT: permite uso comercial, pero se recomienda verificar la cadena de licencias (Rhasspy upstream y Phoonnx empaquetado) antes de redistribuir.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Sin benchmarks publicados: no es posible comparar su calidad objetiva con otras voces sin evaluacion propia.
- Fecha de creacion futura en los metadatos (2026-11-16): conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-eva_k-x_low-espeak
- Upstream (Rhasspy piper-voices, de_DE/eva_k/x_low): https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/eva_k/x_low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
