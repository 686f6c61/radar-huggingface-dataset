# Phoonnx/vits-cs_cz-kasandra-medium-espeak

## Resumen

`Phoonnx/vits-cs_cz-kasandra-medium-espeak` es una voz de sintesis de voz (text-to-speech) en checo (`cs-CZ`) basada en la arquitectura VITS, en su variante Piper. El modelo original fue entrenado por Ondrej Simek (usuario `ondrazarici`) y publicado dentro del repositorio `rhasspy/piper-voices`; la version aqui descrita es una conversion a ONNX realizada por TigreGotico Lda para su runtime `phoonnx`. Resuelve el problema de generar habla natural en checo a partir de texto, con un modelo ligero que funciona en CPU.

La relevancia practica del modelo esta en su tamano reducido y su formato ONNX: el grafo fp32 ocupa 63,5 MB y la copia int8 solo 19,3 MB, con un pico de memoria residente de 248-286 MB. Esto permite ejecutar sintesis de voz en hardware modesto, incluso en CPU, con un factor de tiempo real (RTF) de 0,035 en fp32 y 0,092 en int8 medido sobre un Intel Core i9-11900H a 4 hilos.

Es un modelo de un solo hablante, con salida a 22050 Hz, que toma fonemas espeak-ng (alfabeto IPA) como entrada y conserva la puntuacion de clausula (`,` `.` `!` `?` `:` `;`) en la sintesis a partir de phoonnx 1.96.1a1. No es un modelo de lenguaje general: es un componente especializado de TTS para integrar en asistentes de voz, lectores de pantalla o sistemas de IVR en checo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; entrada de texto/fonemas) |
| Tipos de cuantizacion | fp32 e int8 (cuantizacion dinamica con onnxruntime, pesos QInt8) |
| Idiomas soportados | checo (`cs-CZ`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`<graph>.onnx` y `<graph>_int8.onnx`) |

Otros datos tecnicos: frecuencia de muestreo 22050 Hz, un unico hablante, entrada de texto en fonemas espeak-ng (IPA), fonemizador espeak-ng voz `cs`, tamano del grafo 63,5 MB (fp32) y 19,3 MB (int8), pico de RSS 285,7 MB (fp32) y 248,1 MB (int8).

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS en su implementacion Piper, un modelo generativo de sintesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador basado en flujo y GAN para producir audio directamente desde fonemas. La entrada no es texto crudo, sino fonemas espeak-ng en alfabeto IPA, lo que exige instalar `espeak-ng` (o usar el port `espyak` incluido en `phoonnx[espeak]`) antes de sintetizar. La salida es audio PCM mono a 22050 Hz.

Los datos de entrenamiento no estan registrados en el repositorio upstream. La model card original de `ondrazarici` indica que la voz se entreno con grabaciones originales propias del autor, quien declara poseer los derechos del conjunto de datos. No se documentan numero de tokens, composicion del dataset ni etapas de RLHF o DPO, algo esperable en un modelo TTS de este tipo. La conversion a ONNX no altera los pesos; las copias int8 se generan con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) y pasan una puerta de calidad que verifica audio finito y no silencioso, duracion entre 0,8 y 1,25 veces la de fp32 y WER no superior al de fp32 mas 0,05.

## Capacidades

- Sintesis de voz en checo (`cs-CZ`) a partir de texto, con fonemizacion espeak-ng.
- Un unico hablante (voz femenina identificada como `kasandra`).
- Salida de audio a 22050 Hz en formato WAV mediante `synthesize_wav`.
- Conservacion de puntuacion de clausula (`,` `.` `!` `?` `:` `;`) en la sintesis con phoonnx 1.96.1a1 o posterior.
- Ejecucion en CPU sin GPU, con versiones fp32 e int8 del grafo.
- Integracion como plugin de OVOS (`ovos-tts-plugin-phoonnx`) para asistentes de voz.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es exclusivamente un modelo de sintesis.

## Casos de uso

- Asistentes de voz en checo (OVOS/Mycroft): se selecciona la voz `piper/cs_CZ-kasandra-medium` en `mycroft.conf` mediante el plugin `ovos-tts-plugin-phoonnx`, de modo que el asistente responda hablado en checo sin depender de servicios en la nube.
- Lectores de pantalla y accesibilidad: el modelo puede convertir articulos o interfaces en audio en tiempo real; con un RTF de 0,035 en fp32 sobre CPU, la sintesis es mas rapida que la reproduccion incluso en hardware de portatil.
- Sistemas de IVR y atencion telefonica automatizada: al ser un modelo ligero (19-63 MB) y ejecutable en CPU, se puede desplegar en servidores modestos para generar mensajes y menus de voz en checo.
- Locucion de contenido y podcasts: sintesis de guiones largos en checo con control de pausas mediante puntuacion, adecuada para prototipos de audiolibros o resumenes hablados.
- Integracion en dispositivos embebidos y edge: el pico de memoria de 248 MB en int8 permite ejecutar la voz en dispositivos con recursos limitados donde no cabe un modelo TTS de mayor tamano.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia en checo para validar integraciones con phoonnx, comparar fp32 frente a int8 o medir latencia en un entorno controlado.

## Benchmarks y rendimiento

La model card incluye una evaluacion de calidad (QA) mediante reconocimiento automatico de voz con `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,043 | 0,043 |
| Caracteres por segundo | 14,5 a 15,7 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,98 a 1,00 |
| Tamano del grafo | 63,5 MB | 19,3 MB |
| Pico de RSS | 285,7 MB | 248,1 MB |
| RTF (mediana de 3, 4 hilos) | 0,035 | 0,092 |

Medido en un Intel Core i9-11900H a 2,50 GHz. No se han publicado resultados de benchmarks comparativos estandar (tipo MMLU, HumanEval o GSM8K) porque no aplican a un modelo TTS, ni datos de MOS subjetivo en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para inferencia en CPU. El pico de memoria del proceso es de aproximadamente 286 MB en fp32 y 248 MB en int8.
- GPU recomendadas: no disponibles ni necesarias; el modelo se ejecuta en CPU. Cualquier GPU compatible con ONNX Runtime podria usarse, pero no se documenta.
- GPU de consumo: irrelevante para este modelo; cabe en cualquier equipo con CPU moderna.
- Despliegue: `phoonnx` (instalacion con `pip install --pre phoonnx`) y ONNX Runtime; integracion en OVOS mediante `ovos-tts-plugin-phoonnx`. Requiere `espeak-ng` instalado en el sistema.
- Latencia y throughput: RTF de 0,035 (fp32) y 0,092 (int8) a 4 hilos en i9-11900H, es decir, sintesis entre 11 y 28 veces mas rapida que la duracion del audio generado. El throughput medido es de 14,5 a 15,7 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| `Phoonnx/vits-cs_cz-kasandra-medium-espeak` | VITS (Piper) | cs-CZ | 63,5 MB fp32 / 19,3 MB int8 | CC BY 4.0 | ONNX |
| `rhasspy/piper-voices` (cs_CZ kasandra medium) | VITS (Piper) | cs-CZ | no disponible | CC BY 4.0 | no disponible (formato Piper original) |
| Otras voces Piper en checo | VITS (Piper) | cs-CZ | no disponible | variable | no disponible |

La comparativa se limita al ecosistema Piper porque no se dispone de datos de otros modelos TTS checos en la informacion proporcionada. Respecto al modelo upstream, esta version anade el formato ONNX y las copias int8, sin modificar los pesos.

## Limitaciones y advertencias

- Modelo de un solo hablante: no permite cambiar de voz sin usar otro modelo.
- Solo soporta checo (`cs-CZ`); no es multilingue.
- La fonemizacion depende de `espeak-ng`; con el port `espyak` algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Riesgo de pronunciacion incorrecta en palabras extranas, siglas o nombres propios no cubiertos por el fonemizador.
- No hay datos publicados sobre sesgos de genero, acento o dialecto; la voz procede de grabaciones de un unico autor.
- La evaluacion de calidad se basa en solo 3 frases de FLORES-200 devtest, por lo que el WER de 0,043 debe tomarse como indicativo, no como una medida robusta.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion a Ondrej Simek (ondrazarici) y a TigreGotico Lda por la conversion.
- No se documentan los datos de entrenamiento ni el numero de horas de audio, lo que limita la evaluacion de cobertura y calidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-cs_cz-kasandra-medium-espeak
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/cs/cs_CZ/kasandra/medium
- Modelo original de entrenamiento: https://huggingface.co/ondrazarici/Cassandra-Kasandra-piper-cz
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
