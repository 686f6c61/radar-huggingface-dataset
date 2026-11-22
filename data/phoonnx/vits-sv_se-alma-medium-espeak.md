# Phoonnx/vits-sv_se-alma-medium-espeak

## Resumen

`vits-sv_se-alma-medium-espeak` es una voz de síntesis de voz (text-to-speech) en sueco de Suecia, publicada por Phoonnx (TigreGotico Lda) como conversión a ONNX del modelo original `sv_SE-alma-medium` de `rhasspy/piper-voices`, entrenado por yeagersthlm. No es un modelo de lenguaje: es un modelo acústico VITS de Piper que transforma fonemas espeak (alfabeto IPA) en audio a 22050 Hz con una única hablante.

El modelo resuelve la necesidad de TTS local, ligero y determinista para sueco: el grafo fp32 ocupa 63,4 MB y la copia int8 19,3 MB, con un pico de RSS de 282,2 MB y 245,1 MB respectivamente, lo que permite ejecutarlo en CPU sin GPU. Se distribuye con la librería `phoonnx` y se integra también en el stack OVOS mediante `ovos-tts-plugin-phoonnx`.

Su relevancia es práctica: cubre un idioma con poca oferta en TTS abierto (sueco), con licencia CC BY 4.0 que permite uso comercial con atribución, y con métricas de calidad publicadas (WER de 0,120 en fp32 y 0,080 en int8 sobre tres frases de FLORES-200 devtest medidas con ASR). La conversión no altera los pesos; las copias int8 los cuantizan dinámicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper), modelo acústico TTS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por frases) |
| Tipos de cuantizacion | fp32 (ONNX) e int8 (quantize_dynamic, pesos QInt8) |
| Idiomas soportados | sueco de Suecia (sv-SE) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 (voz `alma`) |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Fonemizador | espeak-ng, voz `sv` |
| Puntuacion | entrenado con `, . ! ? : ;` (phoonnx 1.96.1a1+ la preserva) |
| Tamano del repo | 0,1 GB |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

La arquitectura es VITS en su implementación Piper: un modelo de síntesis extremo a extremo que combina codificador de texto, alineamiento por búsqueda monotónica y decodificador generativo para producir audio a 22050 Hz a partir de fonemas. La entrada no es texto crudo sino fonemas espeak-ng en IPA, lo que exige instalar espeak-ng (o el port espyak incluido en `phoonnx[espeak]`) en el entorno de inferencia. El modelo es de una sola hablante y no incorpora control de prosodia más allá de la puntuación de cláusula con la que fue entrenado.

Los datos de entrenamiento no están registrados en el repositorio de la conversión; la model card upstream de yeagersthlm indica que se entrenó con el NST Swedish TTS Dataset (Språkbanken, Biblioteca Nacional de Noruega), compuesto por grabaciones de estudio de alta calidad de habla sueca. No se documenta el número de tokens, horas de audio, ni si hubo ajuste por RLHF o DPO (no aplica en un modelo TTS de este tipo). La conversión a ONNX realizada por Phoonnx no modifica los pesos; las copias int8 se generaron con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) y se validaron con una puerta de calidad que exige audio finito y no silencioso, longitud entre 0,8 y 1,25 veces la de fp32, y WER como máximo el de fp32 + 0,05.

## Capacidades

- Síntesis de voz en sueco de Suecia a partir de texto, con salida WAV a 22050 Hz.
- Fonemización mediante espeak-ng (voz `sv`) y entrada en alfabeto IPA.
- Respeto de puntuación de cláusula (`, . ! ? : ;`) en la síntesis con phoonnx 1.96.1a1 y posteriores.
- Ejecución en CPU sin GPU, con grafos ONNX ligeros (63,4 MB fp32, 19,3 MB int8).
- Cuantización int8 disponible con degradación de calidad controlada y validada por WER.
- Integración con el ecosistema OVOS mediante `ovos-tts-plugin-phoonnx` y configuración en `mycroft.conf`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente un modelo TTS.
- Una única voz (hablante `alma`); no hay selección de hablante ni clonación.

## Casos de uso

- Asistentes de voz locales en sueco: el modelo sintetiza respuestas en un asistente OVOS o Mycroft configurando `ovos-tts-plugin-phoonnx` con la voz `piper/sv_SE-alma-medium`, sin depender de servicios en la nube y con un pico de memoria de unos 245-282 MB.
- Lectura de contenidos en aplicaciones de accesibilidad: conversión de artículos, notificaciones o mensajes a audio en sueco con latencia baja (RTF 0,043 en fp32 con 4 hilos), adecuada para lectura en tiempo real en portátiles convencionales.
- Generación de audiolibros o pódcasts automatizados: síntesis por lotes de textos largos divididos en frases, usando la puntuación de cláusula para obtener pausas naturales; el tamaño reducido del grafo permite procesar muchos ficheros en paralelo en CPU.
- Sistemas de megafonía o avisos en entornos con hardware limitado: despliegue en dispositivos embebidos o mini-PC x86 sin GPU gracias al grafo int8 de 19,3 MB y al pico de RSS de 245,1 MB.
- Localización de interfaces y videojuegos al sueco: generación de locuciones de diálogo o menús en pipelines de build, con licencia CC BY 4.0 compatible con productos comerciales siempre que se atribuya a yeagersthlm.
- Pruebas automatizadas de sistemas de voz: uso del modelo como fuente de audio sintético controlado en tests de ASR o de pipelines de diálogo, con la ventaja de que la calidad está medida (WER 0,080-0,120) y el comportamiento es determinista.
- Prototipado de investigación en TTS para lenguas nórdicas: punto de partida ligero y reproducible para comparar fonemización espeak-ng frente a espyak y evaluar el impacto de la cuantización int8 en la inteligibilidad.

## Benchmarks y rendimiento

Datos de control de calidad publicados en la model card. La verificación se realizó con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest, en un Intel Core i9-11900H a 2,50 GHz.

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado de la puerta de calidad | pass | pass |
| WER | 0,120 | 0,080 |
| Caracteres por segundo | 15,0 a 17,0 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,95 a 0,99 |
| Tamano del grafo | 63,4 MB | 19,3 MB |
| Pico de RSS | 282,2 MB | 245,1 MB |
| RTF (mediana de 3, 4 hilos) | 0,043 | 0,097 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS. El RTF indica que la síntesis es entre 10 y 23 veces más rápida que la reproducción en tiempo real en la CPU medida.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU con ONNX Runtime.
- Memoria RAM: pico de RSS de 282,2 MB en fp32 y 245,1 MB en int8.
- CPU recomendada: cualquier x86-64 moderno; la medición de referencia usa un Intel Core i9-11900H a 2,50 GHz con 4 hilos.
- GPU: no necesaria; no se documentan aceleraciones por CUDA, ROCm o similar para esta conversión.
- Cabe en cualquier equipo de consumo, incluidos mini-PC y dispositivos embebidos x86 con al menos ~300 MB de RAM libre.
- Despliegue: librería `phoonnx` (`pip install --pre phoonnx`), con espeak-ng instalado aparte (`apt install espeak-ng`) o el port espyak vía `phoonnx[espeak]`; integración en OVOS con `ovos-tts-plugin-phoonnx`.
- Latencia y throughput: RTF 0,043 en fp32 y 0,097 en int8 (mediana de 3 ejecuciones, 4 hilos); velocidad de 15,0 a 17,0 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| `Phoonnx/vits-sv_se-alma-medium-espeak` | VITS (Piper) ONNX | sv-SE | 63,4 MB fp32 / 19,3 MB int8 | CC BY 4.0 | Conversion ONNX con copia int8 validada; WER 0,120 fp32 y 0,080 int8 |
| `rhasspy/piper-voices` (sv_SE-alma-medium) | VITS (Piper) | sv-SE | no disponible en la informacion | CC BY 4.0 | Modelo upstream original de yeagersthlm; misma voz, sin conversion ONNX documentada aqui |
| Otras voces Piper para lenguas nordicas en `rhasspy/piper-voices` | VITS (Piper) | no, da, sv, etc. | no disponible en la informacion | variable segun voz | Misma familia arquitectonica; no se dispone de datos comparativos de WER en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas de otros frameworks (Coqui TTS, XTTS, Bark) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-hablante y mono-idioma: solo sueco de Suecia y una única voz (`alma`); no hay control de emocion, estilo ni velocidad mas alla de la puntuacion.
- Dependencia de espeak-ng: sin el instalado, la fonemizacion con espyak puede pronunciar mal algunas palabras, segun advierte el autor.
- Calidad medida sobre solo 3 frases de FLORES-200 devtest; la evaluacion es limitada y no cubre dominios especializados (terminos tecnicos, nombres propios, siglas).
- Riesgo de prosodia incorrecta en frases largas o con puntuacion atipica, al haberse entrenado con un conjunto fijo de signos de clausula.
- La cuantizacion int8, aunque validada, puede introducir artefactos acusticos no capturados por el WER; conviene escuchar muestras antes de desplegar en produccion.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion a yeagersthlm (entrenamiento) y a TigreGotico Lda (conversion).
- No hay checkpoint de entrenamiento ni datos de entrenamiento detallados en este repositorio; la reproducibilidad del entrenamiento depende del upstream.
- Sin soporte de tool calling, agentes, vision ni audio de entrada; no debe confundirse con un modelo de lenguaje.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sv_se-alma-medium-espeak
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/sv/sv_SE/alma/medium
- Repositorio de entrenamiento original: https://huggingface.co/yeagersthlm/piper-voice-sv-alma
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
