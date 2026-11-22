# Phoonnx/vits-nl_nl-ronnie-medium-espeak-v2

## Resumen

`Phoonnx/vits-nl_nl-ronnie-medium-espeak-v2` es una voz de sintesis de voz (text-to-speech) en neerlandes, publicada por Phoonnx (TigreGotico Lda) como conversion a ONNX del modelo original de Rhasspy para el ecosistema Piper. Se trata de una voz unica (un solo hablante) de calidad media, entrenada sobre la arquitectura VITS, que recibe fonemas en alfabeto IPA generados por espeak-ng y produce audio a 22050 Hz. El repositorio ocupa aproximadamente 0,1 GB e incluye tanto los grafos en fp32 como sus copias cuantizadas a int8.

Este repositorio sustituye a la version anterior `Phoonnx/vits-nl_nl-ronnie-medium-espeak`: el modelo upstream fue reentrenado sobre las bases Piper 1.5 (commit `e9c8a39444` de `rhasspy/piper-voices`), por lo que las versiones antiguas conservan los pesos previos. La relevancia de esta ficha es practica: permite incorporar una voz neerlandesa CC0 en asistentes de voz locales (OVOS, Home Assistant, pipelines de TTS embebido) sin depender de servicios en la nube y con requisitos de hardware muy bajos.

No es un modelo de lenguaje ni un sistema multimodal: es un sintetizador neuronal ligero pensado para inferencia en CPU. Su interes tecnico esta en el empaquetado ONNX, la cuantizacion dinamica int8 (que reduce el grafo de 63,2 MB a 18,7 MB) y la validacion automatica mediante ASR que el autor documenta en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper, base Piper 1.5) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS por frase; sin ventana de contexto) |
| Tipos de cuantizacion | fp32 y int8 (QInt8, `quantize_dynamic` de onnxruntime 1.32.0) |
| Idiomas soportados | neerlandes (`nl-NL`) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (grafos fp32 e int8) |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 (voz `ronnie`) |
| Puntuacion soportada | `, . ! ? : ;` (mantenida en sintesis desde phoonnx 1.96.1a1) |
| Tamano del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es VITS (Variational Inference for Text-to-Speech), un modelo generativo condicional que combina un encoder de texto, un predictor de duracion y un decoder de audio con normalizing flows y un discriminador adversarial en entrenamiento. En el ecosistema Piper, el texto se convierte previamente a fonemas IPA mediante espeak-ng (voz `nl`) y el modelo sintetiza directamente la forma de onda. Los ajustes de inferencia por defecto son `noise_scale` 0,5 y `noise_w` 0,333, y requiere Piper 1.5 o superior.

Segun la model card, el modelo upstream se obtuvo por fine-tuning desde el modelo base `rdh` (calidad media, `nl_BE`, un hablante flamenco, CC0) con MRD y SDP. Los datos de entrenamiento no estan registrados upstream; la card original solo indica la procedencia del dataset (`https://github.com/OHF-Voice/voice-datasets`, licencia CC0). No se documenta numero de tokens, horas de audio ni composicion del corpus, ni si hubo etapas de RLHF o DPO (no aplicables en TTS de este tipo). La conversion a ONNX no modifica los pesos; las copias int8 los cuantizan dinamicamente.

## Capacidades

- Sintesis de voz en neerlandes (`nl-NL`) a partir de texto con fonemizacion espeak-ng.
- Salida de audio mono a 22050 Hz en formato WAV.
- Respeto de la puntuacion de clausula (`, . ! ? : ;`) para pausas y entonacion desde phoonnx 1.96.1a1.
- Una unica voz de hablante (`ronnie`), sin cambio de hablante ni clonacion.
- Inferencia en CPU sin GPU, con dos variantes de precision (fp32 e int8).
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Asistentes de voz locales en OVOS: configurando `ovos-tts-plugin-phoonnx` con la voz `piper/nl_NL-ronnie-medium-v2`, el asistente responde en neerlandes sin enviar texto a la nube; el modelo cabe en memoria (RSS pico de 211,2 MB en int8) y funciona en CPU.
- Domotica con Home Assistant u otros sistemas de voz: sintesis de avisos y confirmaciones en neerlandes en tiempo casi real, con un RTF de 0,044 en fp32 y 0,099 en int8 medido en un i9-11900H, lo que permite generar frases cortas en decenas de milisegundos.
- Lectura de notificaciones y correos: el modelo convierte texto plano en audio para aplicaciones de accesibilidad o lectura por voz en dispositivos de bajos recursos, gracias al grafo int8 de 18,7 MB.
- Sistemas embebidos y Raspberry Pi: al no requerir GPU y tener un consumo de memoria moderado, es adecuado para sintetizar menus, alertas o mensajes de estado en dispositivos con CPU ARM.
- Generacion de audiolibros o contenido pregrabado por lotes: la velocidad de sintesis (13,7 a 15,9 caracteres por segundo en fp32) permite procesar grandes volumenes de texto en pipelines offline.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia CC0 para evaluar frameworks (phoonnx, ONNX Runtime) y para comparar calidad fp32 frente a int8 sin restricciones de licencia.
- Prototipos de IVR o telefonia: la baja latencia por frase y la licencia CC0 permiten integrarla en flujos de atencion telefonica en neerlandes sin coste de licencia.

## Benchmarks y rendimiento

La model card documenta una validacion de calidad mediante ASR (`nemo-parakeet-tdt-0.6b-v3` int8) sobre 3 frases de FLORES-200 devtest, y mediciones de rendimiento en un Intel Core i9-11900H a 2,50 GHz:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,100 | 0,100 |
| Caracteres por segundo | 13,7 a 15,9 | no disponible |
| Ratio de longitud int8/fp32 | no aplica | 0,98 a 1,00 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| RSS pico | 260,8 MB | 211,2 MB |
| RTF (mediana de 3, 4 hilos) | 0,044 | 0,099 |

No se han publicado resultados de benchmarks estandar de TTS (MOS, MCD, SECS) en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia esta pensada para CPU. El consumo de memoria es de aproximadamente 260,8 MB (fp32) y 211,2 MB (int8) de RSS pico.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente. No se documentan aceleraciones por GPU.
- Cabe en cualquier GPU de consumo y en practicamente cualquier equipo, incluidos Raspberry Pi y dispositivos embebidos, por el tamano del grafo (18,7 MB en int8).
- Opciones de despliegue: phoonnx (`pip install --pre phoonnx`), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS. Requiere espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]` (espyak, con posibles diferencias foneticas).
- Latencia y throughput: RTF de 0,044 en fp32 y 0,099 en int8 (mediana de 3 ejecuciones con 4 hilos en i9-11900H); entre 13,7 y 15,9 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Phoonnx/vits-nl_nl-ronnie-medium-espeak-v2 | VITS (Piper) | nl-NL | 63,2 MB fp32 / 18,7 MB int8 | CC0 1.0 | Conversion ONNX validada con ASR; RTF 0,044 fp32 |
| rhasspy/piper-voices (nl_NL-ronnie-medium, upstream) | VITS (Piper) | nl-NL | no disponible | CC0 1.0 | Modelo original en formato Piper; mismo hablante y pesos base |
| Phoonnx/vits-nl_nl-ronnie-medium-espeak (version anterior) | VITS (Piper) | nl-NL | no disponible | CC0 1.0 | Pesos previos al reentrenamiento sobre Piper 1.5; sustituida por esta version |

No se dispone de datos de benchmarks comparativos con otras voces neerlandesas en la informacion proporcionada.

## Limitaciones y advertencias

- Una sola voz y un solo idioma (`nl-NL`): no permite cambio de hablante, clonacion ni sintesis multilingue.
- Calidad media (categoria `medium` de Piper): adecuada para asistentes y avisos, no para doblaje o produccion de alta fidelidad.
- Dependencia de espeak-ng para la fonemizacion: con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Datos de entrenamiento no documentados upstream: no se puede evaluar la cobertura del corpus ni posibles sesgos de pronunciacion regional (la base es `nl_BE` flamenco, aunque la voz se etiqueta como `nl-NL`).
- Riesgo de errores de pronunciacion en nombres propios, siglas y palabras extranjeras, inherente a la fonemizacion basada en reglas.
- La validacion ASR se hizo sobre solo 3 frases, por lo que el WER de 0,100 tiene un intervalo de confianza amplio.
- Licencia CC0 1.0: permite uso comercial sin restricciones, pero se recomienda atribuir a Rhasspy segun pide el autor.
- La cuantizacion int8 duplica el RTF (0,099 frente a 0,044) aunque reduce el tamano y la memoria; conviene medir en el hardware objetivo antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-nl_nl-ronnie-medium-espeak-v2
- Modelo upstream (Rhasspy): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/nl/nl_NL/ronnie/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Version anterior del modelo: https://huggingface.co/Phoonnx/vits-nl_nl-ronnie-medium-espeak
- Dataset de voces (OHF-Voice): https://github.com/OHF-Voice/voice-datasets
- TigreGotico: https://tigregotico.pt
