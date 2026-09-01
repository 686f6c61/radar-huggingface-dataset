# dogenthq/KorvaTTS

## Resumen

KorvaTTS es un modelo de síntesis de voz (text-to-speech) open-source desarrollado por dogenthq, centrado en vietnamita con conmutación de código natural (code-switching), es decir, capaz de pronunciar correctamente palabras en inglés insertadas en frases vietnamitas, como marcas comerciales o términos técnicos. El modelo se ejecuta íntegramente en el dispositivo mediante ONNX Runtime, sin necesidad de GPU ni llamadas a APIs externas, y genera audio a 44,1 kHz.

Se trata de una reimplementación desde cero de la arquitectura Supertonic 3, un sistema TTS basado en flow-matching de 99 millones de parámetros, con un vocoder derivado de BlueCodec. No se utilizó ningún checkpoint de Supertonic, por lo que los pesos son originales y se distribuyen bajo licencia Apache-2.0. El modelo incluye diez voces predefinidas (cinco femeninas y cinco masculinas) y está entrenado principalmente con el dataset PhoAudiobook, de 941 horas de habla vietnamita, complementado con un corpus privado de code-switching vietnamita-inglés.

Su relevancia radica en ofrecer una alternativa completamente abierta y ejecutable en entornos sin GPU para un idioma con poca representación en el ecosistema TTS, manteniendo compatibilidad con los runtimes existentes de Supertonic 3 (Python, Node.js, WebGPU, Rust, C++, Swift, Flutter), lo que facilita su integración en aplicaciones multiplataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching TTS (reimplementacion de Supertonic 3) con vocoder BlueCodec |
| Parametros totales | 99 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | fp32 (vector_estimator); no se documentan otras cuantizaciones |
| Idiomas soportados | Vietnamita (principal), ingles (parcial) |
| Licencia | Apache-2.0 (pesos, estilos de voz y audio); codigo de inferencia Apache-2.0 con partes adaptadas de Supertonic (MIT) |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

KorvaTTS es una reimplementacion desde cero de la arquitectura Supertonic 3, un sistema TTS basado en flow-matching. El modelo se compone de cuatro modulos ONNX: un predictor de duracion (duration_predictor) que estima la longitud de la emision a partir del texto y el estilo de duracion; un codificador de texto a nivel de caracteres (text_encoder) condicionado por el estilo de voz; un estimador vectorial (vector_estimator) que actua como denoiser de flow-matching en el espacio latente (256 MB en fp32); y un vocoder basado en BlueCodec que decodifica el latente a forma de onda de 44,1 kHz.

El entrenamiento se realizo sobre el dataset PhoAudiobook, que aporta 941 horas de habla vietnamita curada a partir de audiolibros, complementado con un corpus privado de code-switching vietnamita-ingles recopilado por los autores y no liberado. No se emplearon tecnicas de RLHF ni DPO, al tratarse de un modelo generativo de audio. La innovacion principal reside en la capacidad de code-switching natural y en la ejecucion on-device mediante ONNX Runtime, sin dependencias de GPU.

## Capacidades

- Sintesis de voz en vietnamita con conmutacion de codigo natural: integra palabras y frases en ingles dentro de oraciones vietnamitas, incluyendo marcas comerciales y terminos tecnicos.
- Generacion de audio a 44,1 kHz con diez voces predefinidas (cinco femeninas y cinco masculinas), cada una derivada de una grabacion de referencia real.
- Ejecucion completamente on-device mediante ONNX Runtime, sin necesidad de GPU ni conexion a internet para la inferencia.
- Compatibilidad con runtimes de Supertonic 3: los grafos ONNX y el formato JSON de estilos de voz son identicos, por lo que pueden integrarse en Python, Node.js, WebGPU, Rust, C++, Swift y Flutter.
- Control de velocidad de sintesis mediante el parametro total_steps (32 pasos por defecto para maxima calidad; 8-16 para sintesis mas rapida).
- Interfaz de linea de comandos (CLI) ademas de API Python, con el comando korvatts synth.

## Casos de uso

- Audiolibros y narracion de contenido en vietnamita: el modelo puede generar narraciones largas y naturales a partir de texto, aprovechando las 941 horas de entrenamiento en audiolibros y la salida a 44,1 kHz para una escucha comoda.
- Asistentes de voz on-device para aplicaciones moviles o de escritorio: al no requerir GPU ni API, puede integrarse en dispositivos con recursos limitados, como smartphones o sistemas embebidos, para leer notificaciones, mensajes o contenido en vietnamita.
- Generacion de contenido multimedia con terminologia tecnica en ingles: creadores de videos, podcasts o material educativo pueden sintetizar locuciones que mezclan vietnamita con anglicismos habituales en tecnologia, negocios o ciencia, sin cortes ni pronunciaciones forzadas.
- Accesibilidad para personas con discapacidad visual o dificultades de lectura: la API Python permite construir lectores de pantalla que convierten texto vietnamita en voz de forma local, preservando la privacidad del usuario al no enviar datos a servidores externos.
- Prototipado rapido de aplicaciones TTS: gracias a la CLI y a la instalacion via pip, un desarrollador puede generar muestras de voz en minutos para validar flujos de producto o realizar pruebas de usuario sin infraestructura compleja.
- Integracion en aplicaciones multiplataforma mediante runtimes Supertonic 3: dado que los archivos ONNX y los estilos de voz son compatibles, se puede desplegar el mismo modelo en una app Flutter, Swift o Rust sin reentrenar ni adaptar el formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) ni comparaciones cuantitativas con otros sistemas TTS vietnamitas. Tampoco se documentan mediciones de latencia o throughput en diferentes hardware.

## Requisitos de hardware

- Inferencia on-device sin GPU: la model card indica explicitamente que el modelo se ejecuta sin GPU, por lo que es viable en CPU.
- Tamano del repositorio: 0,4 GB, lo que incluye los cuatro modulos ONNX, los estilos de voz y las grabaciones de referencia.
- El modulo vector_estimator ocupa 256 MB en fp32, siendo el componente mas pesado; el resto de modulos son significativamente menores.
- No se especifican requisitos minimos de RAM ni de CPU, pero al ser un modelo de 99 millones de parametros en ONNX, es razonable esperar que funcione en equipos con 4 GB de RAM o superiores.
- Opciones de despliegue: ONNX Runtime (Python, Node.js, Rust, C++, Swift, Flutter) y CLI korvatts. No se menciona soporte para vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la documentacion. El parametro total_steps permite ajustar el compromiso entre calidad y velocidad (8-16 pasos para sintesis mas rapida).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Ejecucion |
|---|---|---|---|---|---|
| KorvaTTS | 99M | vi, en (parcial) | Apache-2.0 | ONNX | On-device (CPU) |
| Supertonic 3 | 99M | Multiples (incluye vi, en) | No especificada (repositorio original) | ONNX | On-device |
| BlueTTS (BlueCodec) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion suficiente sobre otros modelos TTS vietnamitas comparables en terminos de rendimiento o caracteristicas. La comparativa se limita a la arquitectura de referencia (Supertonic 3) y al vocoder (BlueCodec), que son los unicos puntos de referencia documentados. KorvaTTS se distingue por ser una reimplementacion desde cero con pesos propios bajo Apache-2.0, mientras que Supertonic 3 no especifica una licencia clara en la informacion disponible.

## Limitaciones y advertencias

- La calidad en ingles no esta garantizada al nivel de las voces inglesas originales de Supertonic 3, aunque el ingles forma parte de los datos de entrenamiento.
- Otros idiomas aceptados por el codificador de Supertonic 3 no fueron entrenados, por lo que su uso producira resultados degradados o incorrectos.
- El modelo solo incluye diez voces fijas; no se documenta capacidad de clonacion de voz a partir de una muestra arbitraria del usuario.
- Riesgo de alucinacion o errores de pronunciacion en terminos poco frecuentes, nombres propios o palabras extranjeras fuera del corpus de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero la model card incluye una advertencia de uso responsable: solo se deben clonar o imitar voces que se posean o para las que se tenga permiso, y no se debe usar el audio generado para enganar, acosar o suplantar a personas.
- No se proporcionan datos de sesgos o evaluacion de robustez ante acentos o variantes dialectales del vietnamita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dogenthq/KorvaTTS
- Repositorio GitHub: https://github.com/dogenthq/KorvaTTS
- Licencia del modelo: https://github.com/dogenthq/KorvaTTS/blob/main/MODEL_LICENSE.md
- Aviso de atribucion: https://github.com/dogenthq/KorvaTTS/blob/main/NOTICE
- Dataset PhoAudiobook: https://huggingface.co/datasets/thivux/phoaudiobook
- Paper de PhoAudiobook (ACL 2025): https://aclanthology.org/2025.acl-short.81.pdf
- Arquitectura Supertonic 3: https://github.com/supertone-inc/supertonic
- Vocoder BlueCodec: https://github.com/maxmelichov/BlueTTS
