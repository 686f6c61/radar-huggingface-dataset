# Phoonnx/vits-en_gb-jarvis-medium-espeak

## Resumen

vits-en_gb-jarvis-medium-espeak es un modelo de sintesis de voz (text-to-speech) de tipo VITS en formato Piper, convertido a ONNX por Phoonnx (TigreGotico Lda) a partir del modelo original jgkawell/jarvis. No es un modelo de lenguaje: es un sistema TTS de un solo hablante para ingles britanico (en-GB) que recibe fonemas espeak en alfabeto IPA y genera audio a 22050 Hz.

El modelo resuelve el problema de la sintesis de voz local y ligera: el grafo ONNX en fp32 ocupa 63,5 MB y la version int8 solo 19,3 MB, con un pico de memoria de 242,3 MB y 193,4 MB respectivamente. Esto lo hace apto para despliegue en CPU sin GPU, con un RTF (tiempo de sintesis dividido por la duracion del audio) de 0,041 en fp32 y 0,087 en int8, medido en un Intel Core i9-11900H.

Es relevante para entornos de asistencia por voz de bajos recursos, como el ecosistema OVOS/Mycroft, donde se integra mediante el plugin ovos-tts-plugin-phoonnx. La licencia MIT y el formato ONNX facilitan su incorporacion en produccion, aunque el origen de los datos de entrenamiento esta poco documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase con puntuacion de clausula , . ! ? : ;) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic de onnxruntime, pesos QInt8) |
| Idiomas soportados | en-GB (ingles britanico) |
| Licencia | MIT |
| Formato de pesos | ONNX (grafo fp32 e int8) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Fonemizador | espeak-ng, voz en-gb-x-rp |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del grafo | 63,5 MB (fp32) / 19,3 MB (int8) |
| Pico de memoria (RSS) | 242,3 MB (fp32) / 193,4 MB (int8) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS en su variante Piper, un sistema TTS end-to-end que combina un codificador de texto, un predictor de duracion y un decodificador generativo basado en flujo, entrenado con perdidas adversarias. La entrada no es texto plano sino fonemas espeak-ng (voz en-gb-x-rp) en alfabeto IPA, lo que exige instalar espeak-ng en el entorno de inferencia.

El entrenamiento original lo realizo jgkawell y se publica en jgkawell/jarvis. La model card indica que los datos de entrenamiento no estan registrados en el repositorio upstream; el autor del pull request rhasspy/piper-voices #11 afirma que el audio proviene de un videojuego movil. No hay informacion sobre numero de tokens, composicion del dataset ni uso de RLHF o DPO, ya que no son aplicables a un modelo TTS. La conversion a ONNX no modifica los pesos; las copias int8 se generan con onnxruntime.quantization.quantize_dynamic (onnxruntime 1.32.0) y pasan un control de calidad que verifica audio finito y no silencioso, duracion entre 0,8 y 1,25 veces la de fp32 y un WER no superior al de fp32 mas 0,05.

## Capacidades

- Sintesis de voz a partir de texto en ingles britanico, con entrada intermedia en fonemas espeak-ng (IPA).
- Generacion de audio mono a 22050 Hz en formato WAV.
- Preservacion de puntuacion de clausula (, . ! ? : ;) en la sintesis con phoonnx 1.96.1a1 y posteriores.
- Ejecucion en CPU sin GPU, con grafos ONNX ligeros (19,3 MB en int8).
- Integracion con el ecosistema OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx.
- No soporta tool calling, agentes, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se selecciona en mycroft.conf mediante el plugin ovos-tts-plugin-phoonnx con la voz piper_community/jgkawell/en_GB-jarvis-medium, ofreciendo sintesis en CPU con un RTF de 0,041 en fp32.
- Lectura de notificaciones y alertas en dispositivos embebidos: el grafo int8 de 19,3 MB y el pico de 193,4 MB permiten ejecutarlo en hardware con memoria limitada.
- Generacion de audiolibros o contenido narrado en ingles britanico: la entrada por frases con puntuacion de clausula preserva pausas naturales.
- Pruebas de accesibilidad y prototipado de interfaces habladas: la licencia MIT y el formato ONNX simplifican la integracion en pipelines de CI.
- Doctesting de sistemas ASR: el propio autor emplea el modelo con ASR nemo-parakeet-tdt-0.6b-v3 int8 y FLORES-200 devtest para validar la salida (WER 0,000 en fp32 y 0,034 en int8).
- Síntesis por lotes en servidores sin GPU: el RTF inferior a 0,1 en ambos formatos permite generar audio mas rapido que tiempo real en CPU de gama alta.

## Benchmarks y rendimiento

Los unicos datos publicados son los del control de calidad del autor, medidos en un Intel Core i9-11900H a 2,50 GHz con 4 hilos y 3 repeticiones (RTF mediana):

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER (ASR nemo-parakeet-tdt-0.6b-v3 int8) | 0,000 | 0,034 |
| Caracteres por segundo | 17,0 a 20,2 | no disponible |
| Duracion int8 / fp32 | no aplica | 0,97 a 1,01 |
| Tamano del grafo | 63,5 MB | 19,3 MB |
| Pico RSS | 242,3 MB | 193,4 MB |
| RTF (mediana de 3, 4 hilos) | 0,041 | 0,087 |

No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU. El pico de memoria RAM es de 242,3 MB en fp32 y 193,4 MB en int8.
- GPU recomendadas: no aplica; no se documenta ejecucion en GPU.
- Cabe en cualquier equipo consumer: el grafo int8 de 19,3 MB y el pico de 193,4 MB son compatibles con dispositivos embebidos y Raspberry Pi.
- Opciones de despliegue: phoonnx (pip install --pre phoonnx) con espeak-ng instalado, o el plugin ovos-tts-plugin-phoonnx en OVOS/Mycroft. El formato es ONNX, ejecutable con onnxruntime.
- Latencia y throughput: RTF de 0,041 (fp32) y 0,087 (int8) en un i9-11900H con 4 hilos; es decir, entre 11 y 24 veces mas rapido que tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vits-en_gb-jarvis-medium-espeak | VITS (Piper) | en-GB | ONNX fp32/int8 | MIT | Conversion de jgkawell/jarvis; 22050 Hz; 1 hablante |
| jgkawell/jarvis (upstream) | VITS (Piper) | en-GB | pesos originales Piper | MIT | Modelo de origen; misma voz sin conversion ONNX |
| Otras voces Piper de la comunidad | VITS (Piper) | varios | ONNX | variable | Disponibles en rhasspy/piper-voices; no se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Solo soporta ingles britanico (en-GB); no es multilingue.
- Requiere espeak-ng instalado; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Un solo hablante: no permite cambio de voz ni clonacion.
- Los datos de entrenamiento no estan documentados y el autor del pull request indica que el audio proviene de un videojuego movil, lo que plantea dudas sobre la procedencia y posibles sesgos de dominio.
- La cuantizacion int8 introduce un WER de 0,034 frente a 0,000 en fp32; para maxima fidelidad conviene usar fp32.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero la sintesis puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento o con fonemas no vistos.
- Licencia MIT permite uso comercial, pero se debe atribuir a jgkawell segun indica la model card.
- No soporta tool calling, agentes, vision ni audio de entrada; su unico proposito es la sintesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_gb-jarvis-medium-espeak
- Modelo upstream: https://huggingface.co/jgkawell/jarvis
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Pull request de voces Piper (referencia de datos): rhasspy/piper-voices #11
