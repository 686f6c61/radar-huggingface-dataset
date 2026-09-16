# kimyh716/whisper-small-dialect-ko

## Resumen

whisper-small-dialect-ko es un modelo de reconocimiento automatico del habla (ASR) desarrollado por el usuario kimyh716, consistente en un ajuste fino de openai/whisper-small sobre habla dialectal coreana. Su tarea concreta es transcribir audio en cuatro dialectos regionales de Corea del Sur (Gangwon, Gyeongsang, Jeolla y Chungcheong) y generar texto en coreano estandar. Se trata, por tanto, de un modelo de normalizacion dialecto a estandar, no de un simple transcriptor, orientado a convertir ordenes de voz dialectales en comandos comprensibles por sistemas automaticos.

El modelo parte de la arquitectura encoder-decoder de tipo transformer de Whisper, con 241.734.912 parametros (aproximadamente 242 millones) y formato de pesos safetensors. El ajuste se realizo sobre 20.151 enunciados del dataset AIHub de habla dialectal coreana y esta pensado para ejecutarse en dispositivos IoT de borde, con el objetivo declarado de correr en una Orange Pi 5 con SoC RK3588. La licencia es MIT, lo que facilita su integracion en productos.

Su relevancia radica en la mejora medida en tasa de error de caracteres (CER): pasa de un 0,222 de media con el modelo base a un 0,096 tras el ajuste, una reduccion de mas del 50 % en el error. Ademas, es uno de los pocos modelos publicos que aborda explicitamente el habla dialectal coreana para inferencia en el borde, un nicho poco cubierto por los modelos ASR multilingues generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 (aproximadamente 242 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana fija de 30 segundos de audio (estandar de Whisper); salida de texto sin limite explicito documentado |
| Tipos de cuantizacion | no disponible (la model card no especifica cuantizaciones publicadas) |
| Idiomas soportados | coreano (ko), con cobertura de los dialectos de Gangwon, Gyeongsang, Jeolla y Chungcheong |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura completa de openai/whisper-small: un transformer encoder-decoder entrenado originalmente para ASR y traduccion de voz multilingue. El encoder procesa espectrogramas mel de audio en ventanas de 30 segundos y el decoder genera la secuencia de tokens de texto. No se introducen modificaciones arquitectonicas, decodificacion especulativa ni mecanismos de atencion alternativos; la innovacion es exclusivamente el ajuste fino sobre datos dialectales.

Los datos de entrenamiento proceden del dataset AIHub de habla dialectal coreana. La distribucion por region es desigual: 8.542 enunciados de Gyeongsang, 6.310 de Chungcheong, 4.290 de Gangwon y 1.169 de Jeolla, con un total de 20.151 enunciados. El autor senala que Jeolla queda limitada por una carencia estructural de datos etiquetados, lo que se refleja en que su CER final (0,136) sigue siendo el mas alto de las cuatro regiones. No se documentan en la informacion disponible fases de RLHF, DPO ni uso de tecnicas de alineacion adicionales.

## Capacidades

- Reconocimiento automatico del habla en coreano dialectal: convierte audio de habla de Gangwon, Gyeongsang, Jeolla y Chungcheong en texto.
- Normalizacion dialecto a estandar: la salida esperada es coreano estandar, no una transcripcion fonetica del dialecto.
- Inferencia en dispositivo de borde: disenado para ejecutarse en hardware embebido tipo Orange Pi 5 (RK3588).
- Procesamiento de audio a 16 kHz mediante WhisperProcessor, con la interfaz estandar de transformers (WhisperForConditionalGeneration).
- Tarea configurable de transcripcion (task="transcribe") con seleccion de idioma (language="korean").
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Comandos de voz en dispositivos IoT: el modelo convierte una orden en dialecto (por ejemplo, una instruccion en Gyeongsang) en texto estandar que un sistema de control domotico puede interpretar, aprovechando su tamano de 242 M para caber en un SoC RK3588.
- Asistentes de voz para personas mayores en zonas rurales: los hablantes de dialecto pueden interactuar con electrodomesticos o terminales sin adaptar su forma de hablar.
- Subtitulado de contenido audiovisual regional: transcripcion de entrevistas, documentales o programas locales en los que los interlocutores usan dialecto, generando subtitulos en coreano estandar.
- Digitalizacion de archivos orales: conversion a texto de grabaciones etnograficas o historicas en dialecto para su indexacion y busqueda.
- Atencion al cliente telefonica regional: pretranscripcion de llamadas en dialecto para su enrutado o analisis posterior, dado el bajo CER en Gyeongsang (0,070) y Gangwon (0,058).
- Accesibilidad en kioscos y terminales de autoservicio: entrada por voz en dialecto con normalizacion automatica, adecuada para despliegue en hardware de bajo coste.
- Investigacion linguistica: generacion de corpus paralelos dialecto-estandar a partir de audio para estudios de variacion dialectal coreana.

## Benchmarks y rendimiento

La model card unicamente publica tasas de error de caracteres (CER), comparando el modelo ajustado con el whisper-small base. No se han publicado resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K, no aplicables a ASR) en la informacion disponible.

| Region | CER base (whisper-small) | CER ajustado | Mejora |
|---|---|---|---|
| Gangwon | 0,140 | 0,058 | -0,082 |
| Gyeongsang | 0,183 | 0,070 | -0,113 |
| Jeolla | 0,233 | 0,136 | -0,097 |
| Chungcheong | 0,331 | 0,121 | -0,210 |
| Media total | 0,222 | 0,096 | -0,126 |

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 0,5 GB solo para pesos, mas el espacio de activaciones y buffers de audio; en la practica, menos de 1,5 GB.
- VRAM estimada en fp32: aproximadamente 1 GB solo para pesos, alrededor de 2 GB con overhead.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o mas. Tambien es viable en CPU.
- Objetivo declarado de despliegue en el borde: Orange Pi 5 con SoC RK3588, lo que confirma su viabilidad fuera de GPU dedicada.
- Opciones de despliegue: transformers (proveedor de referencia, con WhisperForConditionalGeneration), ademas de runtimes compatibles con Whisper como whisper.cpp o faster-whisper mediante conversion. No se documenta soporte de vLLM ni TGI para este modelo concreto en la informacion disponible.
- Latencia y throughput concretos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | CER medio (dialectos coreanos) |
|---|---|---|---|---|---|
| whisper-small-dialect-ko | 242 M | 30 s | Coreano + 4 dialectos | MIT | 0,096 |
| openai/whisper-small (base) | 242 M | 30 s | Multilingue (99 idiomas) | Apache-2.0 | 0,222 |
| openai/whisper-medium | 769 M | 30 s | Multilingue | Apache-2.0 | no disponible |
| openai/whisper-large-v3 | 1550 M | 30 s | Multilingue | Apache-2.0 | no disponible |

Frente al modelo base, la ventaja es clara en la tarea dialectal (CER mas de un 50 % inferior) y en licencia (MIT frente a Apache-2.0, ambas permisivas). Frente a Whisper medium o large-v3, la ventaja es de eficiencia: 242 M de parametros permiten inferencia en el borde, mientras que los modelos mayores requieren mas recursos; no obstante, no se dispone de datos comparativos de CER de esos modelos sobre estos dialectos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor reconoce que la mejora de CER proviene sobre todo de una mejor precision en el reconocimiento fonetico, no de una sustitucion semantica correcta de vocabulario y terminaciones dialectales. Casos como "단디" (que deberia normalizarse a "단단히"), "언능" o "그런다냐" siguen siendo un punto debil, por lo que la salida puede quedar como fonetica proxima al dialecto en lugar de coreano estandar real.
- El dialecto de Jeju queda fuera del alcance del modelo: su CER base era de aproximadamente 0,8, muy superior al del resto de regiones, por lo que no se entreno para el.
- Desequilibrio de datos: Jeolla cuenta con solo 1.169 enunciados frente a 8.542 de Gyeongsang, lo que se traduce en un CER peor (0,136) y un rendimiento menos fiable en esa region.
- Cobertura limitada a coreano y a los cuatro dialectos entrenados; no se documenta soporte para otros idiomas ni para acentos no incluidos.
- Riesgo de alucinacion inherente a los modelos ASR de tipo Whisper, especialmente con audio ruidoso o fuera de dominio.
- Adopcion practicamente nula: 0 descargas y 0 "me gusta" en el momento de la consulta, lo que implica ausencia de validacion externa por parte de la comunidad.
- Licencia MIT, permisiva para uso comercial, pero conviene verificar la licencia del dataset AIHub subyacente, cuyas condiciones de uso pueden imponer restricciones adicionales no reflejadas en la licencia del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kimyh716/whisper-small-dialect-ko
- Modelo base: https://huggingface.co/openai/whisper-small
