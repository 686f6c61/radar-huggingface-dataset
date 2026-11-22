# Phoonnx/vits-pl_pl-gosia-medium-espeak-v2

## Resumen

`vits-pl_pl-gosia-medium-espeak-v2` es una voz de síntesis de habla (text-to-speech) en polaco (`pl-PL`) construida sobre la arquitectura VITS del ecosistema Piper. El modelo original fue entrenado por Rhasspy y publicado dentro del repositorio `rhasspy/piper-voices`; TigreGotico Lda lo ha convertido a ONNX para su uso con la librería `phoonnx`, manteniendo los pesos sin cambios. Esta v2 sustituye a la conversión anterior (`Phoonnx/vits-pl_pl-gosia-medium-espeak`) porque el modelo upstream fue reentrenado sobre la base Piper 1.5 (commit `e9c8a39444`).

Se trata de una voz monocapa de un solo hablante, con salida a 22050 Hz, pensada para síntesis local de baja latencia. La entrada de texto se convierte a fonemas IPA mediante espeak-ng (voz `pl`), por lo que el modelo no procesa texto crudo directamente: necesita un fonemizador externo. El repositorio ocupa 0,1 GB e incluye tanto los grafos ONNX en fp32 como sus copias cuantizadas a int8.

Su relevancia práctica está en el despliegue en entornos con recursos limitados: el grafo fp32 pesa 63,2 MB y el int8 solo 18,7 MB, con un pico de memoria residente de 282,1 MB y 236,1 MB respectivamente. La licencia CC0 1.0 permite uso comercial sin restricciones de atribución obligatoria, aunque el autor pide citar a Rhasspy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic con QInt8, onnxruntime 1.32.0) |
| Idiomas soportados | polaco (`pl-PL`) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Fonemizador | espeak-ng, voz `pl` |
| Puntuacion soportada | `, . ! ? : ;` |
| Tamano del repo | 0,1 GB |
| Modelo base | `rhasspy/piper-voices` (relacion: quantized) |
| Checkpoint de entrenamiento | no incluido en el repositorio |

## Arquitectura y entrenamiento

VITS es un modelo generativo condicional de extremo a extremo que combina un codificador de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial en entrenamiento, con alineamiento monotónico aprendido. Piper añade una capa de inferencia optimizada para CPU. En esta variante, la entrada no es texto sino fonemas IPA producidos por espeak-ng, lo que desacopla la normalización lingüística del modelo acústico.

El modelo upstream se obtuvo por fine-tuning desde la base `hifi_tts_92` en inglés estadounidense (calidad media, voz de Cori Samuel, lectora 92 de Hi-Fi TTS), empleando MRD y SDP según la model card original. Los datos de entrenamiento concretos no están registrados upstream; la card cita el repositorio de datasets de voz de OHF-Voice con licencia CC0. Requiere Piper 1.5 o superior. Los ajustes de inferencia por defecto son `noise_scale` 0.5 y `noise_w` 0.333. No se documenta uso de RLHF ni DPO, algo esperable en un modelo TTS de esta familia.

La conversión a ONNX no altera los pesos; las copias int8 se generan con `onnxruntime.quantization.quantize_dynamic` y pasan una puerta de calidad: audio finito y no silencioso, duración entre 0,8 y 1,25 veces la de fp32, y WER como máximo el de fp32 más 0,05.

## Capacidades

- Síntesis de voz en polaco (`pl-PL`) a partir de texto fonemizado con espeak-ng.
- Salida de audio mono a 22050 Hz en formato WAV.
- Respeto de puntuación de cláusula (`, . ! ? : ;`) en la síntesis con phoonnx 1.96.1a1 y posteriores.
- Ejecución en CPU sin GPU, con grafos ONNX optimizados.
- Variante int8 para despliegues con memoria muy restringida.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta clonación de voz, cambio de hablante, emoción ni control prosódico más allá de `noise_scale` y `noise_w`.
- No procesa texto crudo: requiere fonemización previa con espeak-ng (o el port espyak, con posibles desviaciones fonéticas).

## Casos de uso

- Asistentes de voz locales en polaco: la voz se integra en OVOS mediante `ovos-tts-plugin-phoonnx` configurando `piper/pl_PL-gosia-medium-v2`, lo que permite un asistente doméstico que sintetiza respuestas sin conexión y con un consumo de memoria inferior a 300 MB.
- Lectura de notificaciones y alertas en sistemas embebidos: con el grafo int8 de 18,7 MB y 236,1 MB de pico RSS, cabe en dispositivos tipo Raspberry Pi y similares para anuncios hablados en tiempo real.
- Accesibilidad para personas con discapacidad visual: lectura de texto en pantalla en polaco con latencia baja (RTF 0,041 en fp32 sobre un i9-11900H con 4 hilos), adecuada para navegación interactiva.
- Generación de audiolibros o pódcast de bajo coste: la tasa de 14,3 a 15,1 caracteres por segundo en fp32 permite procesar grandes volúmenes de texto por lotes en CPU sin infraestructura GPU.
- Pruebas automatizadas de pipelines de voz: el modelo sirve como referencia determinista para validar cadenas ASR-TTS, con WER medido de 0,045 en fp32 y 0,000 en int8 sobre FLORES-200 devtest con `nemo-parakeet-tdt-0.6b-v3` int8.
- Prototipado de interfaces conversacionales en polaco: al ser CC0, se puede embeber en productos comerciales y en demos públicas sin gestionar atribuciones ni licencias por asiento.
- Síntesis por lotes en servidores sin GPU: el RTF de 0,100 en int8 con 4 hilos implica procesar audio aproximadamente diez veces más rápido que tiempo real en CPU de portátil.

## Benchmarks y rendimiento

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER (nemo-parakeet-tdt-0.6b-v3 int8, FLORES-200 devtest, 3 frases) | 0,045 | 0,000 |
| Caracteres por segundo | 14,3 a 15,1 | no disponible |
| Duracion int8 / fp32 | no aplica | 1,00 a 1,02 |
| Tamano del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 282,1 MB | 236,1 MB |
| RTF (mediana de 3, 4 hilos) | 0,041 | 0,100 |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF es el tiempo de síntesis dividido por la duración del audio. No se han publicado resultados de benchmarks comparativos con otras voces TTS en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU con ONNX Runtime.
- Memoria RAM: pico de 282,1 MB en fp32 y 236,1 MB en int8.
- GPU recomendadas: no aplica; no se documenta aceleración por GPU para este modelo.
- Cabe en cualquier equipo de consumo: el grafo int8 de 18,7 MB y el fp32 de 63,2 MB son compatibles con Raspberry Pi y portátiles modestos.
- Despliegue: `phoonnx` (`pip install --pre phoonnx`), con espeak-ng instalado en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]` (port espyak). Integración con OVOS vía `ovos-tts-plugin-phoonnx`.
- Latencia y throughput: RTF 0,041 en fp32 y 0,100 en int8 con 4 hilos en i9-11900H; 14,3 a 15,1 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Frecuencia | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `Phoonnx/vits-pl_pl-gosia-medium-espeak-v2` | VITS (Piper) | pl-PL | 22050 Hz | CC0 1.0 | ONNX fp32/int8 | Esta ficha; conversion de `rhasspy/piper-voices` |
| `Phoonnx/vits-pl_pl-gosia-medium-espeak` | VITS (Piper) | pl-PL | 22050 Hz | CC0 1.0 | ONNX | Version anterior con pesos previos al reentrenamiento Piper 1.5 |
| `rhasspy/piper-voices` (pl/pl_PL/gosia/medium) | VITS (Piper) | pl-PL | 22050 Hz | CC0 1.0 | Piper (ONNX upstream) | Modelo original de Rhasspy; misma voz sin la conversion de phoonnx |
| Otras voces Piper en polaco | VITS (Piper) | pl-PL | 22050 Hz | CC0 1.0 | ONNX | No se dispone de datos comparativos de rendimiento en la informacion disponible |

## Limitaciones y advertencias

- Modelo de un solo hablante y un solo idioma: no admite cambio de voz ni síntesis multilingüe.
- Dependencia de espeak-ng: sin el binario instalado, el port espyak puede producir fonemas distintos y pronunciar mal algunas palabras.
- Los datos de entrenamiento no están registrados upstream, lo que impide auditar sesgos o cobertura lingüística del corpus.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento, siglas, números y nombres propios, al depender de la fonemización de espeak-ng.
- La evaluación de calidad se limita a 3 frases de FLORES-200 devtest con un ASR concreto; es una muestra muy reducida y no garantiza robustez general.
- La licencia CC0 1.0 no impone restricciones comerciales, pero el autor solicita atribución a Rhasspy; conviene revisar la cadena de autoría antes de redistribuir.
- No hay checkpoint de entrenamiento en el repositorio, por lo que no es posible reentrenar ni ajustar el modelo a partir de estos artefactos.
- El modelo no incluye normalización de texto: mayúsculas, abreviaturas y cifras deben normalizarse antes de la fonemización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Phoonnx/vits-pl_pl-gosia-medium-espeak-v2
- Modelo upstream (Rhasspy): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/pl/pl_PL/gosia/medium
- Version anterior de la conversion: https://huggingface.co/Phoonnx/vits-pl_pl-gosia-medium-espeak
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Datasets de voz de OHF-Voice: https://github.com/OHF-Voice/voice-datasets
