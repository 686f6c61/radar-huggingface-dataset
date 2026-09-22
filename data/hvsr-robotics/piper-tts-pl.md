# hvsr-robotics/Piper-TTS-PL

## Resumen

Piper-TTS-PL es un modelo de sintesis de voz (text-to-speech) en polaco desarrollado por hvsr-robotics, publicado bajo la libreria Piper y exportado a ONNX. Se trata de un sistema VITS multi-hablante con ocho voces, entrenado sobre grabaciones de ocho lectores de Wolne Lektury, y pensado como modelo de control del proyecto hermano `hvsr-robotics/Matcha-TTS-PL`: comparte los mismos lectores y clips de entrenamiento, pero prioriza la velocidad de inferencia en CPU frente a la naturalidad.

El modelo resuelve el caso de uso de sintesis de voz polaca rapida y ligera: segun la model card, genera aproximadamente una frase en 60 ms por nucleo en un Apple M-series a 22,05 kHz. Su repo ocupa 0,1 GB y se distribuye como ficheros ONNX estandar de Piper, lo que permite desplegarlo en entornos sin GPU. El coste de esa eficiencia es una calidad inferior a la del modelo Matcha del mismo autor, con UTMOS entre 2,7 y 3,3 y WER entre el 7 % y el 22 % segun la voz.

Es relevante para desarrolladores que necesiten TTS polaco embebido o de bajo coste computacional, y tambien como punto de comparacion reproducible dentro del ecosistema Piper, dado que la model card documenta la receta de entrenamiento, la atribucion de datos y las metricas por hablante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end), implementada via `piper1-gpl`, multi-hablante (8 voces) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (export ONNX entrenado en fp32; el runtime de Piper admite los ficheros ONNX estandar) |
| Idiomas soportados | polaco (pl) |
| Licencia | CC BY-SA 4.0 para los pesos; el runtime `piper-tts` y el codigo `piper1-gpl` son GPL-3.0 |
| Formato de pesos | ONNX (`pl_PL-tts-pl.onnx`) acompanado de `pl_PL-tts-pl.onnx.json` |
| Frecuencia de muestreo | 22,05 kHz |
| Voces | 8 hablantes (indices 0-7: Jan Staszczyk, Radoslaw Krzyzowski, Wojciech Masiak, Bartosz Bielenia, Marek Proszek, Katarzyna Faszczewska, Bartosz Glogowski, Piotr Kopa) |
| Tamano del repositorio | 0,1 GB |
| Libreria | piper |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo generativo end-to-end de sintesis de voz que combina un codificador de texto, un prior condicional con flujos normalizadores y un decodificador neuronal que genera la forma de onda, entrenado con perdidas adversariales y de reconstruccion. En este caso, el modelo base es `pl_PL-darkman-medium` de `rhasspy/piper-checkpoints`, una voz mono-hablante que se re-inicializa de forma no estricta (warm start no estricto) en un modelo de ocho hablantes mediante `--model.warmstart_ckpt`. La exportacion se realiza con `piper.train.export_onnx` (exportador legacy) y el runtime de destino es `piper-tts`, que requiere los datos de espeak-ng.

Los datos de entrenamiento corresponden al conjunto objetivo de etapa 2 de la receta Matcha: ocho lectores de Wolne Lektury, solo prosa, clasificados por consistencia y con los clips que presentaban desajuste entre texto y audio eliminados. El manifiesto de entrenamiento es `piper_metadata.csv` (formato `file|reader|text`). El entrenamiento consistio en 15 000 pasos con batch 32 en fp32, con un 2 % de validacion, ejecutados en una unica NVIDIA H100 en aproximadamente 55 minutos. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo esperable en un modelo TTS.

## Capacidades

- Sintesis de voz en polaco a partir de texto, en formato multi-hablante con ocho voces distintas.
- Seleccion de hablante en tiempo de inferencia mediante el parametro `--speaker` del runtime Piper (por ejemplo, `piper -m pl_PL-tts-pl.onnx --speaker 7`).
- Inferencia rapida en CPU: aproximadamente 60 ms por frase por nucleo en Apple M-series a 22,05 kHz.
- Sintesis por lotes mediante el script `synth_piper.py` y el paquete `piper-tts`.
- Interfaz de usuario lista para usar en el repositorio `tts-pl-playground`.
- Integracion directa con el ecosistema ONNX, sin dependencia de GPU.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio de entrada: es exclusivamente un modelo de texto a voz.

## Casos de uso

- Lectura automatica de contenidos en polaco: el modelo convierte articulos, documentacion o libros en audio con una latencia muy baja (unos 60 ms por frase en CPU), adecuado para generar versiones habladas de catalogos extensos.
- Audiolibros y narracion de dominio publico: al estar entrenado sobre grabaciones de Wolne Lektury y contar con ocho voces, permite asignar narradores distintos a capitulos o personajes de obras en polaco.
- Asistentes de voz embebidos sin GPU: por su tamano (repo de 0,1 GB) y su ejecucion en CPU, encaja en dispositivos tipo Raspberry Pi o portatiles modestos donde no hay acelerador disponible.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de interfaces, correos o documentos en polaco, con seleccion de voz segun preferencia del usuario.
- Generacion de voz para prototipos y tests de producto: la licencia CC BY-SA 4.0 y la disponibilidad de los pesos ONNX permiten integrar el modelo en pipelines de desarrollo y validar experiencias de voz antes de invertir en voces comerciales.
- Atencion al cliente automatizada de bajo coste: como capa de sintesis en un bot telefonico o de chat en polaco, combinado con un modelo de lenguaje externo que genere las respuestas.
- Locucion de avisos y sistemas de megafonia: mensajes dinamicos en transporte, comercio o industria donde se requiere generar audio en tiempo real y sin infraestructura GPU.
- Investigacion en sintesis de voz multihablante: sirve como linea base rapida frente a modelos mas pesados y como referencia para reproducir la receta VITS en otros idiomas.

## Benchmarks y rendimiento

Resultados de calidad por voz sobre 10 frases conversacionales de prueba por lector, segun la model card:

| Voz | n | WER | CER | UTMOS | Dispersion F0 [st] | Caracteres/s | Silencio % |
|---|---|---|---|---|---|---|---|
| Jan Staszczyk | 10 | 0,070 | 0,025 | 3,13 | 3,43 | 10,9 | 9 |
| Radoslaw Krzyzowski | 10 | 0,093 | 0,036 | 2,91 | 2,19 | 12,0 | 12 |
| Wojciech Masiak | 10 | 0,221 | 0,122 | 2,79 | 2,32 | 13,0 | 10 |
| Bartosz Bielenia | 10 | 0,105 | 0,040 | 3,02 | 1,75 | 11,4 | 13 |
| Marek Proszek | 10 | 0,093 | 0,050 | 2,91 | 2,69 | 12,2 | 8 |
| Katarzyna Faszczewska | 10 | 0,116 | 0,084 | 2,84 | 2,38 | 11,9 | 10 |
| Bartosz Glogowski | 10 | 0,093 | 0,084 | 3,32 | 2,95 | 12,7 | 9 |
| Piotr Kopa | 10 | 0,151 | 0,101 | 2,72 | 2,48 | 10,2 | 6 |

La model card indica que la naturalidad e inteligibilidad son inferiores a las del modelo Matcha del mismo autor, con un rango global de UTMOS 2,7-3,3 y WER 7-22 %, y senala que VITS omite palabras en dos de los lectores. No se han publicado en la informacion disponible resultados comparativos con otros modelos TTS en benchmarks estandar externos.

## Requisitos de hardware

- Inferencia en CPU: es el escenario principal. La model card reporta unos 60 ms por frase por nucleo en Apple M-series a 22,05 kHz.
- VRAM: no disponible de forma explicita. Al ser un modelo ligero con repo de 0,1 GB y ejecucion ONNX, la inferencia puede realizarse enteramente en CPU sin VRAM dedicada.
- GPU recomendadas: no disponibles. El entrenamiento se realizo en una NVIDIA H100 (15 000 pasos en unos 55 minutos), pero no se documentan requisitos de GPU para inferencia.
- GPU de consumo: el modelo esta disenado para funcionar sin GPU; cualquier equipo con CPU moderna puede ejecutarlo.
- Opciones de despliegue: runtime `piper-tts` (requiere datos de espeak-ng; en macOS hay que definir `ESPEAK_DATA_PATH=/opt/homebrew/share/espeak-ng-data`), script de sintesis por lotes `synth_piper.py` y la interfaz de `tts-pl-playground`. Al ser un modelo ONNX, puede servirse con cualquier runtime compatible con ONNX.
- Latencia y throughput: aproximadamente 60 ms por frase por nucleo en CPU Apple M-series; no se dispone de cifras de throughput agregado ni de latencia en otras plataformas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Voces | Idioma | Calidad declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Piper-TTS-PL (este modelo) | VITS via piper1-gpl, ONNX | 8 | polaco | UTMOS 2,7-3,3; WER 7-22 % | Pesos CC BY-SA 4.0; runtime GPL-3.0 | HuggingFace, repo de 0,1 GB |
| Matcha-TTS-PL (`hvsr-robotics/Matcha-TTS-PL`) | Matcha-TTS | 8 (mismos lectores) | polaco | Superior en naturalidad e inteligibilidad que el modelo Piper segun el autor; cifras concretas no disponibles en esta informacion | no disponible en esta informacion | HuggingFace |
| `pl_PL-darkman-medium` (`rhasspy/piper-checkpoints`) | VITS, mono-hablante | 1 | polaco | no disponible | Datos de entrenamiento CC0 | Repositorio de checkpoints de Piper |

No se dispone de datos de rendimiento de los modelos comparados en la informacion proporcionada, salvo la afirmacion cualitativa de que el modelo Piper es mas rapido en CPU pero menos natural que el Matcha del mismo autor.

## Limitaciones y advertencias

- Naturalidad limitada: UTMOS de 2,7-3,3 y WER de hasta el 22 % en la voz de Wojciech Masiak; la model card reconoce calidad inferior a la del modelo Matcha.
- Omision de palabras: VITS tiende a saltarse palabras en dos de los ocho lectores, lo que puede ser critico en aplicaciones donde la fidelidad textual sea obligatoria.
- Cobertura linguistica restringida al polaco; no se documentan capacidades multilingues.
- Dominio de entrenamiento acotado: solo prosa de Wolne Lektury, lo que puede degradar la calidad en registros como conversacion espontanea, terminologia tecnica, siglas o numeros.
- Licencia CC BY-SA 4.0: permite uso comercial, pero impone atribucion y licencia compartida de las obras derivadas; es necesario revisar las condiciones antes de distribuir productos que integren los pesos.
- Dependencia del runtime GPL-3.0: usar la voz a traves de `piper-tts` implica cumplir la GPL-3.0 para ese software. Los pesos ONNX y la model card no son GPL.
- Atribucion obligatoria de los datos: cada libro, lector y director esta listado en `ATTRIBUTION.md` del repositorio; debe conservarse esa atribucion.
- Riesgo etico de voces clonadas: las voces son atributos personales de los lectores; la model card recomienda declarar explicitamente que el audio es sintetico.
- Sin resultados de benchmarks externos comparables ni datos sobre sesgos acusticos por genero, edad o dialecto mas alla de las metricas por voz.
- No se han publicado cifras de rendimiento en otras plataformas distintas de Apple M-series, por lo que la latencia declarada puede no extrapolarse directamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hvsr-robotics/Piper-TTS-PL
- Repositorio de interfaz y sintesis por lotes: https://github.com/machinekind/tts-pl-playground
- Modelo de control del mismo autor, `hvsr-robotics/Matcha-TTS-PL` (referenciado en la model card; URL no incluida en la informacion disponible)
- Base de voces Piper, `rhasspy/piper-checkpoints` (referenciado en la model card; URL no incluida en la informacion disponible)
- Codigo de entrenamiento `piper1-gpl` y runtime `piper-tts` (referenciados en la model card; URLs no incluidas en la informacion disponible)
- Ficheros incluidos en el repositorio: `export/piper_v2_target/pl_PL-tts-pl.onnx`, `pl_PL-tts-pl.onnx.json`, `samples/`, `ATTRIBUTION.md`, `LICENSE`, `RECIPE.md`, `piper_metadata.csv`, `synth_piper.py`
