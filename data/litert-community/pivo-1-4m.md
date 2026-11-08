# litert-community/PiVo-1.4M

## Resumen

PiVo-1.4M es un modelo de síntesis de voz (text-to-speech) en ingles con dos voces, Pi y Vo, que suma 1.401.562 parametros incluyendo el vocoder. Lo desarrolla empero-ai y esta pensado para sintesis de voz en dispositivos con recursos muy limitados: un modelo acustico de 584.965 parametros predice 18 coeficientes cepstrales, el pitch y la correlacion de pitch cada 10 ms, y un vocoder derivado de FARGAN de 816.597 parametros los convierte en audio mono a 16 kHz.

La ficha que nos ocupa, `litert-community/PiVo-1.4M`, no es el modelo original sino una conversion a LiteRT (formato TFLite) realizada con litert-torch 0.10.0 sobre LiteRT 2.3.0. Como el modelo fuente solo distribuye grafos ONNX y no codigo PyTorch, y los conversores de LiteRT no aceptan ONNX, los cuatro grafos (encoder, decoder, conditioning y vocoder) se reescribieron en PyTorch, se cargaron con los pesos de los ONNX originales y se convirtieron a float32 con formas fijas.

Su relevancia es practica: demuestra que un stack TTS completo puede ejecutarse en un solo hilo de CPU de un movil. Segun la model card, en un Galaxy S26 genera un segundo de audio en 27,5 ms con un hilo de CPU, y la conversion se valida contra la salida del modelo original en ONNX Runtime con metricas objetivas (WER, embedding de hablante, correlacion log-mel). No hay app Android publicada; el repositorio incluye un host en Python y un runner en C++.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo acustico + vocoder derivado de FARGAN; cuatro grafos (encoder, decoder, conditioning, vocoder) convertidos a LiteRT/TFLite |
| Parametros totales | 1.401.562 (584.965 del modelo acustico + 816.597 del vocoder, segun el modelo fuente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; limites de entrada: 2.000 caracteres, 512 tokens, 30 segundos por utterance |
| Tipos de cuantizacion | float32 (conversion de este repositorio); el modelo fuente distribuye ONNX |
| Idiomas soportados | ingles |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT/TFLite (float32); el modelo base en ONNX |

## Arquitectura y entrenamiento

El pipeline consta de cuatro grafos con formas fijas. El encoder admite cinco tamanos, para hasta 32, 64, 128, 256 y 512 tokens (fonemas, espacios, puntuacion y dos marcadores de frase). El decoder genera 16 frames (160 ms) por llamada y el vocoder produce un frame de 10 ms por llamada. El frontend de texto es el del modelo original: solo ingles, palabras del diccionario de pronunciacion CMU, mas numeros, importes de moneda, ordinales y fechas ISO; las palabras fuera del diccionario provocan un error salvo que se aporte la pronunciacion en ARPAbet mediante overrides.

El host en Python (`host/`) ejecuta los grafos con el frontend, diccionario y bucle del modelo fuente: redondea las duraciones y alimenta decoder y vocoder, de modo que el audio sale en tramos de 10 ms. Por defecto usa una copia del bucle que llama al vocoder una vez por frame. El directorio `runner/` contiene el programa C++ que se ejecuto en los moviles mediante la API C de LiteRT. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO, ni sobre innovaciones como decodificacion especulativa.

## Capacidades

- Sintesis de voz en ingles a 16 kHz mono con dos voces seleccionables, Pi y Vo.
- Control de velocidad de habla entre 0,5 y 2,0.
- Normalizacion de texto limitada: numeros, importes de moneda, ordinales y fechas ISO.
- Pronunciacion personalizada mediante overrides en ARPAbet para palabras ausentes del diccionario CMU.
- Generacion de audio en streaming por frames de 10 ms (`iter_audio`) y sintesis completa a float32 (`synthesize`).
- Ejecucion en un solo hilo de CPU (host Python y runner C++ con LiteRT C API).
- No soporta tool calling, agentes, vision, audio de entrada ni modo thinking.

## Casos de uso

- Sintesis de voz en moviles Android: el runner C++ con LiteRT C API permite generar voz en un hilo de CPU; en un Galaxy S26 produce un segundo de audio en 27,5 ms, adecuado para asistentes y lectores de pantalla sin conexion.
- Lectura de notificaciones y accesibilidad: el modelo cabe en el presupuesto de memoria de un dispositivo movil (1,4 M de parametros) y sintetiza utterances de hasta 30 segundos, suficiente para mensajes y alertas.
- Audiolibros y contenido largo por fragmentos: el limite de 2.000 caracteres y 30 segundos por utterance obliga a trocear el texto, pero el control de velocidad (0,5 a 2,0) permite ajustar la locucion.
- Sistemas embebidos y edge computing: la conversion a TFLite float32 y las formas fijas del encoder (hasta 32, 64, 128, 256 o 512 tokens) facilitan el despliegue en hardware sin GPU.
- Prototipado de interfaces de voz: el host Python replica la API del modelo original (`PiVoLiteRT` con `save`, `synthesize` e `iter_audio`), lo que permite integrar la voz en aplicaciones de escritorio sin depender de ONNX Runtime.
- Verificacion de conversiones de modelos: el flag `--check` descarga los ONNX del modelo fuente y compara la salida con umbrales definidos (WER, coseno de hablante, HNR, correlacion log-mel), util como referencia para validar otros pipelines de conversion.

## Benchmarks y rendimiento

Resultados de la validacion de la conversion frente al modelo fuente en ONNX Runtime (CPU, un hilo), sobre 54 utterances (27 frases en ambas voces, de 2 a 88 palabras), a velocidad 1,0:

| Plataforma | Runtime | WER (transcripciones distintas) | Coseno de hablante minimo | Correlacion log-mel minima | Longitud identica | Dentro del umbral |
|---|---|---:|---:|---:|---:|---|
| Apple M4 Max | Modelo fuente (referencia) | 0,73 % | no disponible | no disponible | no disponible | no disponible |
| Apple M4 Max | CPU, 1 hilo | 0,73 % (0) | 0,99983 | 0,99982 | 54 de 54 | si |
| Apple M4 Max | GPU (Metal), FP32 | dato truncado en la informacion disponible | no disponible | no disponible | no disponible | no disponible |

Umbrales de aceptacion definidos antes de comparar: el WER puede subir como maximo 1 punto y como maximo 3 de las 54 transcripciones pueden diferir; coseno de hablante (ECAPA, `speechbrain/spkrec-ecapa-voxceleb`) de al menos 0,95; variacion de HNR de como maximo 1 dB y de la proporcion de energia entre 2 y 8 kHz de como maximo 1,5 dB; correlacion log-mel de 0,99 o mas; y, en float32, duraciones en frames y periodo de pitch identicos a la referencia salvo valores a menos de 0,0001 de un limite de redondeo.

En cuanto a velocidad, en un Galaxy S26 con un hilo de CPU se genera un segundo de audio en 27,5 ms. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo TTS; los datos de calidad disponibles son los de la tabla anterior.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta disenado para CPU. Con 1,4 M de parametros en float32, el peso de los parametros ronda los 5,6 MB, aunque el tamano real de los ficheros TFLite no se detalla en la informacion disponible.
- GPU recomendadas: no requiere GPU; se ha validado en CPU (Apple M4 Max, un hilo) y en moviles (Galaxy S26, Pixel 11 Pro). La model card menciona una ejecucion en GPU Metal en FP32 cuyo resultado esta truncado.
- Cabe en cualquier GPU consumer, e incluso en moviles de gama alta; el objetivo declarado es on-device Android.
- Opciones de despliegue: LiteRT 2.3.0 con API C (runner C++), host Python con los paquetes fijados en `host/requirements.txt` (Python 3.12), y el modelo fuente en ONNX Runtime para comparacion.
- Latencia y throughput: 27,5 ms por segundo de audio en un hilo de CPU de Galaxy S26 (medido el 2026-11-08); la velocidad sigue en ajuste segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limites | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| litert-community/PiVo-1.4M | 1.401.562 | 2.000 caracteres, 512 tokens, 30 s por utterance | en | apache-2.0 | TFLite float32 | Conversion LiteRT del modelo de empero-ai; 2 voces |
| empero-ai/PiVo-1.4M | 1.401.562 | mismos limites | en | apache-2.0 | ONNX | Modelo fuente; sin mediciones en ARM o movil segun su card |
| Otros modelos TTS de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No hay datos de alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Solo ingles: el frontend usa el diccionario CMU y no admite otros idiomas.
- Las palabras fuera del diccionario de pronunciacion provocan un error; hay que aportar la pronunciacion en ARPAbet mediante overrides.
- Limites estrictos de entrada: 2.000 caracteres, 512 tokens y 30 segundos por utterance; velocidad entre 0,5 y 2,0.
- Solo dos voces (Pi y Vo); no hay clonacion de voz ni control de estilo.
- Las formas de los grafos son fijas: el encoder tiene cinco tamanos (hasta 32, 64, 128, 256 y 512 tokens) y el decoder genera 16 frames por llamada.
- No hay app Android publicada; solo host Python y runner C++.
- Riesgo de alucinacion y sesgos: no hay informacion disponible en la model card sobre sesgos del dataset de entrenamiento ni sobre el origen de los datos de voz.
- La licencia apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo fuente empero-ai/PiVo-1.4M.
- La velocidad de inferencia sigue en ajuste segun la model card; las cifras de latencia pueden cambiar en futuras actualizaciones.

## Enlaces

- Repositorio LiteRT: https://huggingface.co/litert-community/PiVo-1.4M
- Modelo fuente: https://huggingface.co/empero-ai/PiVo-1.4M
- Ficheros del modelo fuente: https://huggingface.co/empero-ai/PiVo-1.4M/tree/main
- Instrucciones del runner C++: `runner/README.md` dentro del repositorio LiteRT
- Informe tecnico del modelo fuente: `technical_report.pdf` en el repositorio de empero-ai/PiVo-1.4M
