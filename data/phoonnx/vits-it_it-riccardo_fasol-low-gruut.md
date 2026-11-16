# Phoonnx/vits-it_it-riccardo_fasol-low-gruut

## Resumen

vits-it_it-riccardo_fasol-low-gruut es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic 3 y empaquetado por Phoonnx en formato ONNX para su biblioteca de inferencia TTS homonima. El modelo genera audio en italiano (it-IT) a partir de texto, tomando como entrada fonemas IPA producidos por el fonemizador gruut. Su identificador incluye el sufijo "low", que en la convencion de Mimic 3 indica una variante de baja calidad o bajo coste computacional, orientada a entornos con recursos limitados.

El modelo resuelve el problema de la sintesis de voz offline y ligera para italiano: al estar exportado a ONNX, puede ejecutarse sin dependencias de frameworks de deep learning pesados y sin conexion a servicios en la nube, lo que lo hace adecuado para asistentes de voz embebidos, dispositivos de borde y aplicaciones de accesibilidad. Su integracion con el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx` permite desplegarlo directamente en asistentes de voz de codigo abierto.

La relevancia actual del modelo es acotada: se trata de un empaquetado de un modelo upstream ya existente (Mimic 3), con un volumen de descargas muy bajo (20 descargas en el momento de la consulta) y sin resultados de benchmarks publicados. Su interes radica en la disponibilidad de una voz italiana ligera y con licencia CC-BY-SA-4.0 dentro del ecosistema phoonnx/OVOS, mas que en innovaciones arquitectonicas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el sufijo "low" sugiere una variante de baja calidad/coste) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un codificador de texto, un prior variacional, un decodificador generativo condicionado por normalizing flows y un discriminador adversarial multiperiodo entrenado con perdidas de dominio temporal y espectral. El modelo genera directamente la forma de onda a partir de fonemas, sin necesidad de un vocoder separado. En este caso concreto, la entrada no es texto crudo sino fonemas IPA generados por gruut, lo que traslada la normalizacion textual y la fonemizacion a la etapa de preprocesado (biblioteca scriptconv).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante de referencia (el nombre "riccardo_fasol" sugiere un hablante concreto, probablemente un colaborador del proyecto), ni sobre el uso de tecnicas de RLHF o DPO, que no son habituales en modelos TTS de este tipo. El modelo procede del repositorio MycroftAI/mimic3-voices, donde Mycroft AI publico voces preentrenadas para Mimic 3; Phoonnx se limita a reempaquetarlas en ONNX para su biblioteca.

## Capacidades

- Sintesis de voz a partir de texto en italiano (it-IT), con salida en formato WAV.
- Conversion de texto a fonemas IPA mediante gruut (`GruutPhonemizer` de `scriptconv.phonemizers.mul`), con normalizacion textual previa a cargo de scriptconv.
- Ejecucion offline sobre ONNX Runtime, sin dependencia de servicios en la nube.
- Integracion con Python mediante `TTSModelManager` de phoonnx y con el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Voz unica de hablante concreto (no se documenta soporte multi-hablante).
- No se documentan capacidades de clonacion de voz, control de emocion, prosodia ajustable, tool calling ni razonamiento multi-paso (no aplicables a un modelo TTS).

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se selecciona en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx` y proporciona respuestas habladas en italiano en dispositivos de borde sin conexion.
- Lectura de contenido en aplicaciones de accesibilidad: conversion de texto a audio para personas con discapacidad visual en entornos italoparlantes, ejecutandose localmente en el dispositivo.
- Sistemas de anuncios y notificaciones por voz: generacion de avisos hablados en italiano en paneles, kioscos o dispositivos IoT con recursos computacionales limitados, gracias al formato ONNX ligero.
- Prototipado rapido de interfaces conversacionales: integracion en pipelines de Python con `voice.synthesize_wav(text, wav_file)` para validar flujos de voz antes de invertir en voces de mayor calidad.
- Generacion de audio para contenido educativo o divulgativo en italiano: narracion de textos con una voz sintetica consistente, con la advertencia de que la licencia CC-BY-SA-4.0 obliga a compartir las obras derivadas bajo la misma licencia.
- Pruebas de regresion en pipelines TTS: uso como voz de referencia ligera en tests automatizados de sistemas de dialogo en italiano, al ser rapida de cargar y de ejecutar.
- Investigacion en TTS de bajo coste: comparacion de la variante "low" frente a variantes de mayor calidad de Mimic 3 para estudiar el compromiso entre latencia, calidad y recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, MCD, WER del transcriptor) ni comparaciones cuantitativas con otras voces.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio ocupa 0,1 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) aceleraria la inferencia via ONNX Runtime, pero no es necesaria.
- Cabe en GPU consumer: si, en cualquier GPU con al menos unos pocos cientos de MB de memoria libre; tambien en CPU y en dispositivos de borde.
- Opciones de despliegue: phoonnx (Python) con ONNX Runtime; plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput: no disponibles en la informacion proporcionada; la variante "low" sugiere un compromiso orientado a velocidad y bajo coste, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-it_it-riccardo_fasol-low-gruut | VITS | it-IT | ONNX | CC-BY-SA-4.0 | Hugging Face (20 descargas) |
| Otras voces Mimic 3 (it_IT) | VITS | it-IT | ONNX | CC-BY-SA-4.0 | Repositorio MycroftAI/mimic3-voices |
| Piper (voces italianas) | VITS | it-IT | ONNX | variable segun voz | Hugging Face / GitHub rhasspy/piper |
| Coqui TTS (voces italianas) | VITS / Tacotron | it-IT | varios | variable segun modelo | Hugging Face / GitHub coqui-ai/TTS |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada. Las comparaciones se limitan a arquitectura, idioma, formato y licencia.

## Limitaciones y advertencias

- Voz unica y de un hablante concreto; no hay control de emocion, estilo ni prosodia mas alla de lo que produzca el modelo.
- Variante "low": la convencion de Mimic 3 sugiere menor calidad de audio que las variantes de mayor tamano; no se aportan metricas que lo confirmen.
- Dependencia de gruut para la fonemizacion: textos con grafias no estandar, numeros, siglas o simbolos pueden requerir normalizacion adicional por parte de scriptconv y producir errores de pronunciacion.
- Riesgo de alucinacion acustica: como todo modelo TTS, puede generar artefactos, ruidos o pronunciaciones incorrectas en entradas fuera de distribucion; no se documentan tasas de error.
- Sesgos: no se documenta informacion sobre sesgos de genero, dialecto o registro; al derivar de un unico hablante, la voz refleja sus caracteristicas idiosincraticas.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integracion en productos propietarios.
- Sin benchmarks publicados ni documentacion sobre latencia o throughput en produccion.
- Comunidad y mantenimiento reducidos (20 descargas, 0 likes en el momento de la consulta); el soporte depende de los proyectos phoonnx, scriptconv y OVOS.
- No apta para otros idiomas distintos del italiano sin reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-riccardo_fasol-low-gruut
- Repositorio upstream de la voz (MycroftAI/mimic3-voices): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/it_IT/riccardo-fasol_low
- Biblioteca phoonnx: https://github.com/TigreGotico/phoonnx
- Biblioteca scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx en Hugging Face: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
