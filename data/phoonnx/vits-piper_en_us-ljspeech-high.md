# Phoonnx/vits-piper_en_US-ljspeech-high

## Resumen

`vits-piper_en_US-ljspeech-high` es un modelo de sintesis de voz (text-to-speech) en formato ONNX, empaquetado para su uso con la libreria [phoonnx](https://github.com/TigreGotico/phoonnx), un runtime de inferencia TTS. Se trata de una extraccion de un unico modelo del repositorio agregador `Phoonnx/phoonnx-vits`, concretamente la carpeta `piper__en_US-ljspeech-high`, que a su vez corresponde a una voz Piper del ecosistema original de Piper TTS entrenada sobre el corpus LJSpeech en ingles estadounidense.

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un encoder de texto, un prior normalizing flow y un decoder HiFi-GAN para producir audio de forma directa a partir de texto. La variante "high" indica la configuracion de mayor calidad dentro de la familia Piper para esa voz, con un coste computacional superior a las variantes "medium" o "low".

El interes practico de esta ficha es limitado pero concreto: es una voz TTS ligera (repo de 0,1 GB) pensada para sintesis offline y de baja latencia en CPU, distribuida en ONNX y con licencia MIT. No obstante, la model card es minima, no documenta idiomas de forma explicita y no publica metricas objetivas de calidad, por lo que la evaluacion debe hacerse por prueba directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con normalizing flow y decoder HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase; sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; cuantizacion no documentada) |
| Idiomas soportados | no disponible de forma explicita en la model card; la voz se denomina `en_US`, lo que sugiere ingles estadounidense |
| Licencia | MIT |
| Formato de pesos | ONNX (libreria `phoonnx`) |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que integra en un unico modelo un encoder de texto, un prior sobre variables latentes basado en normalizing flows, un decoder generativo y un discriminador adversarial multiperiodo durante el entrenamiento. Esto permite generar waveforms directamente desde la secuencia de fonemas o caracteres sin un vocoder separado en inferencia, a diferencia de los pipelines clasicos de dos etapas.

Segun la informacion disponible, este modelo es una voz Piper entrenada sobre LJSpeech, un corpus de audio en ingles estadounidense de una unica hablante. No se documentan en la model card el numero de tokens, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste fino adicional. La variante "high" corresponde a la configuracion de mayor calidad dentro de la familia Piper para esa voz, aunque no se especifican los hiperparametros concretos ni el tamano del modelo. No hay innovaciones tecnicas adicionales documentadas (decodificacion especulativa, attention linear, etc.).

## Capacidades

- Sintesis de voz a partir de texto (text-to-speech) en una unica voz femenina en ingles estadounidense, segun la denominacion `en_US-ljspeech-high`.
- Generacion de audio en formato waveform mediante inferencia ONNX con el runtime phoonnx.
- Ejecucion offline y en CPU, al estar empaquetado en ONNX y disenado para el ecosistema Piper.
- Identificador de voz expuesto por phoonnx: `piper/en_US-ljspeech-high`.
- No se documentan capacidades de clonacion de voz, control de emocion, multilingue, tool calling ni agentes; no aplica a un modelo TTS de este tipo.

## Casos de uso

- Lectura de articulos y documentos en aplicaciones de accesibilidad: el modelo convierte texto en audio en tiempo real sobre CPU, lo que permite integrarlo en lectores de pantalla y herramientas de lectura sin depender de servicios en la nube.
- Asistentes de voz embebidos en dispositivos de bajos recursos: al distribuirse en ONNX con un repo de 0,1 GB, cabe en Raspberry Pi y dispositivos similares para dar respuestas habladas offline.
- Generacion de narracion para prototipos y demos: util para crear audio de prueba en aplicaciones de podcasts, videos o interfaces conversacionales sin coste de API.
- Sistemas de respuesta por voz en telefonia o IVR: la baja latencia de VITS en CPU permite sintetizar respuestas cortas en flujos de atencion automatizada.
- Pruebas de integracion en pipelines TTS propios: sirve como voz de referencia para validar el runtime phoonnx y comparar con otras voces del repositorio `phoonnx-vits`.
- Localizacion de contenido en ingles estadounidense: generacion de pistas de audio para tutoriales o material formativo en ingles sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Por el tamano del repo (0,1 GB) y la naturaleza de VITS, la huella de memoria es reducida y la inferencia esta pensada para CPU.
- GPU recomendadas: no se documentan. El modelo esta orientado a ejecucion en CPU mediante ONNX; el uso de GPU no es necesario.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano, aunque no hay datos oficiales de rendimiento.
- Opciones de despliegue: runtime phoonnx (libreria declarada); al ser ONNX, puede ejecutarse con ONNX Runtime. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-piper_en_US-ljspeech-high (este modelo) | VITS | en_US (inferido) | MIT | ONNX | Voz Piper empaquetada para phoonnx; sin benchmarks publicados |
| Otras voces de `Phoonnx/phoonnx-vits` | VITS | varias | segun subcarpeta | ONNX | Mismo ecosistema; licencias variables por voz |
| Piper TTS original (voces `en_US`) | VITS | en_US | MIT (segun origen) | ONNX | Proyecto upstream del que derivan estas voces |
| Modelos TTS neuronales de mayor tamano (p. ej. familia Tacotron/FastSpeech) | seq2seq + vocoder | varios | variable | variable | Mayor coste computacional; no comparables directamente por falta de datos |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es minima: no declara idiomas de forma explicita ni documenta el dataset de entrenamiento mas alla de la referencia a LJSpeech.
- No se publican benchmarks objetivos (MOS, WER, latencia), por lo que la calidad debe validarse empiricamente.
- Voz unica: no permite seleccion de hablante ni control de prosodia o emocion mas alla de lo que ofrezca el runtime.
- Riesgo de pronunciacion incorrecta en palabras fuera del dominio del corpus LJSpeech (nombres propios, terminos tecnicos, siglas).
- La licencia MIT se hereda del repositorio origen; conviene revisar la licencia de la voz original Piper y del corpus LJSpeech antes de uso comercial, ya que la model card remite a "la licencia que registra el repositorio fuente".
- Al ser un modelo TTS, no aplican riesgos de alucinacion de texto, pero si posibles artefactos acusticos y errores de sintesis en entradas largas o mal normalizadas.
- No se documenta soporte multilingue; el uso en otros idiomas no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-piper_en_US-ljspeech-high
- Repositorio agregador de voces: https://huggingface.co/Phoonnx/phoonnx-vits
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Proyecto Piper TTS (upstream): no disponible en la informacion proporcionada
- Corpus LJSpeech: no disponible en la informacion proporcionada
