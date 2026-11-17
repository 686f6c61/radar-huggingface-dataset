# Phoonnx/vits-xh-simba-graphemes

## Resumen

`Phoonnx/vits-xh-simba-graphemes` es una voz de síntesis de voz (text-to-speech) en xhosa (idioma `xh`) empaquetada para la librería phoonnx. Se trata de una conversión a ONNX del modelo `UBC-NLP/Simba-TTS-xho`, desarrollado por UBC-NLP a partir de MMS-TTS de Meta. La conversión y el empaquetado los realiza TigreGotico (bajo el identificador Phoonnx) y no alteran los pesos originales; únicamente los exportan a formato ONNX y generan copias cuantizadas en int8.

El modelo emplea una arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) en su variante de transformers, con una única hablante y una frecuencia de muestreo de 16 kHz. Una característica destacable es que funciona a nivel de grafemas: no requiere fonemizador ni G2P, lee directamente los caracteres del texto, lo que simplifica el despliegue pero limita el control fonético fino.

Su relevancia práctica es acotada pero clara: cubre la síntesis de voz en xhosa, un idioma de bajos recursos con escasa cobertura TTS, y lo hace con un grafo ONNX de 114,3 MB en fp32 y 38,5 MB en int8, con un RTF medido de 0,110 en fp32 sobre CPU de escritorio. La licencia efectiva queda restringida por su ascendencia MMS-TTS (CC BY-NC 4.0), por lo que no admite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variante transformers), end-to-end TTS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por grafemas) |
| Tipos de cuantizacion | fp32 y int8 (quantize_dynamic de onnxruntime, pesos QInt8) |
| Idiomas soportados | xhosa (`xh`) |
| Licencia | CC BY 4.0 en la conversion; uso comercial no permitido por ascendencia MMS-TTS (CC BY-NC 4.0) |
| Formato de pesos | ONNX (`<graph>.onnx` en fp32 y `<graph>_int8.onnx`) |
| Frecuencia de muestreo | 16000 Hz |
| Hablantes | 1 |
| Entrada de texto | grafemas (caracteres); sin fonemizador |
| Puntuacion | no registrada en la config; phoonnx la elimina antes de sintetizar |
| Tamano del grafo | 114,3 MB (fp32) / 38,5 MB (int8) |
| Tamano del repo | 0,2 GB |
| Modelo base | UBC-NLP/Simba-TTS-xho (relacion: quantized) |
| Dataset de entrenamiento | UBC-NLP/SimbaBench |
| Libreria | phoonnx |

## Arquitectura y entrenamiento

La arquitectura es VITS en su implementacion de transformers: un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos y un discriminador adversarial durante el entrenamiento. La inferencia produce directamente la forma de onda a 16 kHz, sin vocoder externo separado. El modelo es mono-hablante y opera sobre grafemas, de modo que el texto se consume carácter a carácter sin conversion a fonemas.

El entrenamiento original lo realizo UBC-NLP sobre el dataset `UBC-NLP/SimbaBench` y el modelo resultante se publica como `UBC-NLP/Simba-TTS-xho`. Segun la model card, UBC-NLP hizo fine-tuning desde MMS-TTS (`facebook/mms-tts`). No se detalla en la informacion disponible el numero de tokens, la composicion exacta del corpus ni si se aplicaron etapas de RLHF o DPO (no procede en un TTS). La conversion a ONNX la realizo TigreGotico sin modificar los pesos; las copias int8 se generaron con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) y pesos QInt8.

## Capacidades

- Sintesis de voz en xhosa a partir de texto plano, con salida WAV a 16 kHz.
- Entrada por grafemas: no necesita fonemizador ni diccionario de pronunciacion, lo que reduce dependencias en produccion.
- Modelo mono-hablante: una unica voz, sin seleccion de hablante.
- Eliminacion automatica de puntuacion por parte de phoonnx antes de la sintesis.
- Ejecucion en CPU: el RTF medido (0,110 en fp32 con 4 hilos) permite sintesis mas rapida que tiempo real sin GPU.
- Variante int8 para despliegues con restricciones de memoria (38,5 MB de grafo, 249,2 MB de RSS pico).
- Integracion con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, agentes, vision, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de contenido en xhosa para aplicaciones de accesibilidad: el modelo convierte articulos o notificaciones en audio a 16 kHz, y su ejecucion en CPU permite integrarlo en dispositivos sin GPU.
- Asistentes de voz locales en OVOS: mediante `ovos-tts-plugin-phoonnx` se selecciona la voz en `mycroft.conf`, de modo que un asistente domestico puede responder en xhosa sin conexion a servicios en la nube.
- Señalizacion y anuncios en transporte o espacios publicos: frases cortas sintetizadas en tiempo real con un RTF de 0,110 en fp32, adecuado para avisos repetidos en kioscos o paneles.
- Prototipado de interfaces conversacionales en xhosa: al no requerir fonemizador, el pipeline se reduce a texto y ONNX, lo que acelera la experimentacion en entornos de investigacion.
- Generacion de material educativo audio en xhosa: lectura de lecciones o vocabulario con una voz unica y consistente, aprovechando el bajo consumo de memoria (249,2 MB de RSS pico en int8).
- Pruebas de calidad y evaluacion TTS en idiomas de bajos recursos: el modelo sirve como referencia cuantizada para comparar enfoques de sintesis en xhosa dentro de trabajos academicos.
- Despliegue en entornos con memoria limitada: la variante int8 de 38,5 MB cabe en dispositivos embebidos o contenedores pequenos, siempre que el uso no sea comercial.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad (MOS, WER, MCD). Los unicos datos cuantitativos son las comprobaciones de control de calidad y las mediciones de rendimiento realizadas por el autor de la conversion:

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado del control de calidad | pass | pass |
| Caracteres por segundo | 10,2 a 12,1 | no disponible |
| Longitud, int8 / fp32 | no aplica | 0,89 a 1,03 |
| Tamano del grafo | 114,3 MB | 38,5 MB |
| RSS pico | 305,9 MB | 249,2 MB |
| RTF (mediana de 3, 4 hilos) | 0,110 | 0,367 |

Medido en un AMD Ryzen 5 7600 de 6 nucleos. El metodo de control de calidad no emplea ASR: verifica longitud y ausencia de silencio sobre 3 frases de FLORES-200 devtest. No se han publicado resultados de benchmarks de calidad subjetiva u objetiva en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU mediante ONNX Runtime.
- Memoria RAM: RSS pico de 305,9 MB en fp32 y 249,2 MB en int8.
- GPU: no se documenta soporte ni requisitos de GPU; las mediciones son sobre CPU (AMD Ryzen 5 7600).
- Consumer GPU: no procede; el modelo esta pensado para ejecucion en CPU y cabe holgadamente en cualquier equipo de escritorio o dispositivo embebido.
- Opciones de despliegue: phoonnx (`pip install --pre phoonnx`) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput: RTF de 0,110 en fp32 (sintesis aproximadamente 9 veces mas rapida que tiempo real) y 0,367 en int8 con 4 hilos; entre 10,2 y 12,1 caracteres por segundo en fp32.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Muestreo | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-xh-simba-graphemes | VITS (transformers) | xh | 16 kHz | CC BY 4.0 con restriccion no comercial por ascendencia | ONNX fp32/int8 | Conversion cuantizada; entrada por grafemas |
| UBC-NLP/Simba-TTS-xho | VITS (transformers) | xh | no disponible | CC BY 4.0 (con restriccion no comercial por MMS-TTS) | no disponible | Modelo original del que deriva esta conversion |
| facebook/mms-tts (familia) | VITS | multilingue (incluye xh) | 16 kHz | CC BY-NC 4.0 | no disponible | Modelo base del que UBC-NLP hizo fine-tuning |

No se dispone en la informacion proporcionada de otros modelos TTS especificos para xhosa con los que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Restriccion comercial: aunque la conversion se publica como CC BY 4.0, el modelo deriva de MMS-TTS (`facebook/mms-tts`), con licencia CC BY-NC 4.0, por lo que el uso comercial de esta voz no esta permitido.
- Una sola hablante: no hay seleccion de voz ni control de estilo o emocion.
- Entrada por grafemas sin fonemizador: la pronunciacion depende de la correspondencia grafema-fonema aprendida; no hay control fonetico explicito y los errores de pronunciacion no son corregibles mediante transcripcion fonetica.
- Puntuacion no registrada en la config y eliminada por phoonnx: se pierde informacion de prosodia asociada a comas, interrogaciones y pausas.
- Cobertura linguistica limitada a xhosa; no es multilingue.
- Riesgo de alucinacion acustica y artefactos en entradas fuera de dominio o muy largas; el control de calidad documentado se limita a 3 frases de FLORES-200 y verifica solo longitud y ausencia de silencio, sin evaluacion de inteligibilidad mediante ASR.
- La variante int8 presenta un RTF notablemente peor que fp32 (0,367 frente a 0,110), por lo que la ganancia en memoria no se traduce en velocidad.
- Sin datos publicados de MOS, WER ni MCD: la calidad subjetiva no esta cuantificada.
- Requiere credito a UBC-NLP al usar la voz, segun los terminos indicados por el autor de la conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-xh-simba-graphemes
- Modelo original: https://huggingface.co/UBC-NLP/Simba-TTS-xho
- Dataset de entrenamiento: https://huggingface.co/datasets/UBC-NLP/SimbaBench
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Modelo base de MMS-TTS: https://huggingface.co/facebook/mms-tts
