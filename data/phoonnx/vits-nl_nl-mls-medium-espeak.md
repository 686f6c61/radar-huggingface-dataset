# Phoonnx/vits-nl_nl-mls-medium-espeak

## Resumen

vits-nl_nl-mls-medium-espeak es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo convierte texto en neerlandes (nl-NL) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su proposito es ofrecer sintesis de voz local, ligera y sin dependencias de servicios en la nube para aplicaciones de asistencia por voz.

El modelo procede del repositorio upstream rhasspy/piper-voices, en la ruta nl/nl_NL/mls/medium, lo que indica que fue entrenado sobre el corpus MLS (Multilingual LibriSpeech) en su variante neerlandesa y con un tamano de modelo "medium" dentro de la escala de Piper. El repositorio empaquetado ocupa aproximadamente 0,1 GB y distribuye los pesos en formato ONNX, lo que permite inferencia en CPU y en entornos embebidos.

Es relevante para desarrolladores que necesitan un motor TTS offline, de baja latencia y con licencia MIT, integrable en asistentes de voz como OVOS/Mycroft o en aplicaciones web mediante phoonnx.js. No es un modelo de lenguaje generativo ni un sistema multimodal: su alcance se limita estrictamente a la sintesis de voz en neerlandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto/fonemas de longitud variable) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | neerlandes (nl-NL) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python y OVOS) |
| Corpus de entrenamiento (inferido del nombre) | MLS (Multilingual LibriSpeech), variante nl_NL |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de sintesis neuronal de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujo normalizador y un discriminador adversarial para el entrenamiento. VITS genera waveforms directamente a partir de fonemas sin necesidad de un vocoder separado, lo que reduce la latencia y simplifica el despliegue. La variante "medium" corresponde a la escala de tamanos de Piper, pensada para un equilibrio entre calidad y coste computacional.

Segun la model card, el modelo fue entrenado por Rhasspy y deriva del corpus MLS en neerlandes. No se especifican en la informacion disponible el numero de tokens o horas de audio de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables habitualmente en TTS). La innovacion practica del empaquetado de Phoonnx es la conversion a ONNX y la integracion con la cadena de procesamiento de texto de scriptconv, que normaliza el texto y lo convierte a fonemas espeak antes de la sintesis.

## Capacidades

- Sintesis de voz a partir de texto en neerlandes (nl-NL), con salida en formato WAV.
- Conversion de texto a fonemas IPA mediante espeak-ng, con normalizacion previa del texto a traves de scriptconv.
- Inferencia local en ONNX, sin dependencia de servicios en la nube.
- Integracion con OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No dispone de modo thinking, vision ni audio de entrada; solo genera audio de salida.
- Capacidad multilingue limitada al neerlandes; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se selecciona como modulo TTS en mycroft.conf y sintetiza respuestas en neerlandes sin conexion, adecuado para dispositivos domoticos con recursos limitados.
- Lectura de notificaciones y alertas en neerlandes: integrado en sistemas de monitorizacion o domotica para convertir mensajes de texto en avisos hablados con baja latencia.
- Accesibilidad para personas con discapacidad visual: sintesis de contenido textual en neerlandes en aplicaciones de escritorio o moviles que requieren un motor TTS offline y de licencia permisiva.
- Interfaces conversacionales embebidas: al ejecutarse en ONNX sobre CPU, puede desplegarse en Raspberry Pi u otros dispositivos de borde para dar voz a chatbots o kioscos interactivos en neerlandes.
- Generacion de audio para prototipos y pruebas: su licencia MIT y su tamano reducido (~0,1 GB) permiten incluirlo en pipelines de CI para generar locuciones de prueba sin coste de API.
- Aplicaciones web con sintesis en el navegador: mediante phoonnx.js, se puede ofrecer TTS en neerlandes del lado del cliente sin enviar texto a un servidor, util para privacidad y para reducir latencia de red.
- Dooblaje o narracion de contenido corto en neerlandes: sintesis de parrafos para videos, podcasts o audiolibros ligeros donde no se requiere clonacion de voz ni control expresivo avanzado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de ~0,1 GB, es probable que la inferencia se realice en CPU con un consumo de memoria del orden de cientos de MB, pero no se documenta una cifra oficial.
- GPU recomendadas: no disponible; el modelo esta disenado para ejecucion en CPU mediante ONNX Runtime y no requiere GPU.
- Compatibilidad con GPU de consumo: no se documenta; por su tamano reducido, cualquier GPU de consumo podria ejecutarlo, aunque no es el escenario objetivo.
- Opciones de despliegue: phoonnx (Python), OVOS mediante ovos-tts-plugin-phoonnx, y phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-nl_nl-mls-medium-espeak (este modelo) | VITS | nl-NL | ~0,1 GB (repo) | MIT | ONNX | Empaquetado para phoonnx; entrada espeak IPA |
| Otras voces Piper nl_NL (p. ej. nl_NL-mls-low, nl_NL-mls-high) | VITS | nl-NL | no disponible | MIT (upstream) | ONNX | Misma familia upstream; variantes de tamano low/medium/high |
| Modelos TTS multilingues comerciales (p. ej. APIs de nube) | no disponible | Multiples | no disponible | Propietaria | API | Requieren conexion; no comparables en despliegue offline |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre MLS, puede reflejar las caracteristicas demograficas y de grabacion de ese corpus.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero la sintesis puede producir pronunciaciones incorrectas, especialmente si se usa espyak en lugar de espeak-ng, segun advierte la model card.
- Limitacion de idioma: solo neerlandes (nl-NL); no soporta otros idiomas ni cambio de voz o estilo.
- Dependencia externa: requiere espeak-ng instalado para la fonemizacion; sin el, la calidad puede degradarse con el port espyak.
- Restricciones de licencia: licencia MIT, lo que permite uso comercial, pero se recomienda verificar la licencia del upstream rhasspy/piper-voices y del corpus MLS para asegurar el cumplimiento en produccion.
- Caveat de produccion: no se documentan metricas de calidad (MOS), latencia ni throughput; conviene evaluar la inteligibilidad y naturalidad en el dominio concreto antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica baja validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl_nl-mls-medium-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/nl/nl_NL/mls/medium
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Paper de VITS: no disponible en la informacion proporcionada
