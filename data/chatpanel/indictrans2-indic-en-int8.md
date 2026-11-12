# ChatPanel/indictrans2-indic-en-int8

## Resumen

IndicTrans2 indic→en int8 es una exportación a ONNX con cuantización int8 del modelo ai4bharat/indictrans2-indic-en-dist-200M, desarrollado originalmente por AI4Bharat y empaquetado por ChatPanel para su uso en un gateway local de traducción. Resuelve un problema muy concreto: traducir líneas de reuniones desde lenguas indias al inglés en el propio ordenador del usuario, sin Python y sin depender de servicios en la nube, usando únicamente onnxruntime.

El modelo base es la variante destilada de 200M de parámetros de la familia IndicTrans2, una arquitectura transformer encoder-decoder especializada en traducción entre las 22 lenguas programadas de la India y el inglés. Esta versión mantiene el pipeline de traducción pero sustituye el stack de PyTorch y SentencePiece por tres grafos ONNX (encoder, cross-attention y decoder paso a paso) más dos ficheros JSON con los vocabularios y las piezas BPE.

Su relevancia actual es práctica: demuestra que un modelo de traducción de calidad razonable puede ejecutarse en CPU con latencia de unos 95 ms por frase en cuatro hilos, con un tamaño de repositorio de 0,5 GB y licencia MIT, lo que facilita su integración en aplicaciones de escritorio y su uso comercial sin fricción legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (IndicTrans2, variante destilada) |
| Parametros totales | 200M (modelo base dist-200M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (exportación ONNX) |
| Idiomas soportados | lenguas indias (origen) a inglés (destino); lista exacta no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder.onnx, cross_kv.onnx, decoder.onnx con ficheros .data) + JSON de vocabulario |

## Arquitectura y entrenamiento

El modelo subyacente es IndicTrans2 en su variante destilada de 200M de parámetros, un transformer encoder-decoder diseñado específicamente para traducción automática entre las 22 lenguas programadas de la India y el inglés. La arquitectura incluye 18 capas de decoder según se deduce de la exportación de cross-attention (claves y valores para las 18 capas). El entrenamiento original se describe en Gala et al., *IndicTrans2: Towards High-Quality and Accessible Machine Translation Models for all 22 Scheduled Indian Languages* (TMLR 2023); los detalles sobre número de tokens, composición del dataset y uso de RLHF o DPO no están disponibles en la información proporcionada.

La innovación técnica de esta exportación concreta reside en la ingeniería de despliegue: el preprocesamiento de IndicTransToolkit (normalización, unificación de escritura a devanagari, etiquetas de idioma y SentencePiece) se ha portado a JavaScript dentro del gateway de ChatPanel, eliminando la dependencia de Python. La exportación separa el encoder, el cálculo de claves y valores de cross-attention y el decoder con caché en tres grafos ONNX independientes, lo que permite decodificación autorregresiva eficiente en CPU. El autor reporta una verificación contra el original en FLEURS dev: preprocesamiento idéntico en 49 de 50 casos (la única diferencia es que el toolkit emite un carácter `़` literal), piezas e ids idénticos en 50 de 50, y traducciones greedy idénticas en 11 de 12 casos.

## Capacidades

- Traducción automática de lenguas indias a inglés, con foco en líneas de conversación de reuniones.
- Preprocesamiento multilingüe integrado: normalización de texto, unificación de escritura a devanagari, etiquetado de idioma y tokenización SentencePiece portados a JavaScript.
- Ejecución local sin Python mediante onnxruntime.
- Decodificación greedy con caché de decoder paso a paso.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües limitadas al par lenguas indias → inglés; la lista exacta de lenguas de origen no está disponible.

## Casos de uso

- Subtitulado de reuniones en tiempo real: el modelo traduce cada línea de habla india a inglés con unos 95 ms por frase en cuatro hilos de CPU, lo que permite mostrar subtítulos en directo en una aplicación de escritorio sin enviar audio ni texto a la nube.
- Traducción de actas y transcripciones: dado un transcript de una reunión con intervenciones en varias lenguas indias, el modelo genera la versión en inglés línea a línea, preservando el orden de intervención.
- Aplicaciones de escritorio con requisitos de privacidad: al ejecutarse íntegramente en local con ONNX Runtime y sin Python, encaja en productos instalables donde el usuario no puede o no quiere depender de infraestructura externa.
- Integración en gateways o backends en JavaScript/Node.js: el preprocesamiento portado a JS permite incorporar el modelo en servicios ya existentes sin introducir un runtime de Python.
- Traducción de documentación o contenidos de soporte escritos en lenguas indias hacia inglés para su revisión por equipos que no dominan esas lenguas.
- Evaluación y prototipado de sistemas de traducción de bajo coste: el tamaño de 0,5 GB y la licencia MIT permiten desplegar el modelo en máquinas modestas para pruebas comparativas frente a alternativas como opus-mt-mul-en.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas chrF sobre FLEURS dev, comparando con opus-mt-mul-en:

| Metrica | Este modelo | opus-mt-mul-en |
|---|---|---|
| chrF telugu → inglés | 68,9 | 51,5 |
| chrF hindi → inglés | 65,1 | 43,6 |
| Latencia por frase | ~95 ms (4 hilos de CPU) | no disponible |
| Coincidencia de traducciones greedy con el original | 11/12 | no aplica |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; el modelo está pensado para CPU. El repositorio ocupa 0,5 GB, por lo que la memoria necesaria en inferencia es del orden de ese tamaño más los estados intermedios.
- GPU recomendadas: no se especifican; el diseño apunta a ejecución en CPU con onnxruntime.
- Cabe en cualquier ordenador de consumo: el autor reporta ~95 ms por frase en cuatro hilos de CPU, lo que sugiere que funciona en portátiles convencionales.
- Opciones de despliegue: ONNX Runtime (principal), con los tres grafos encoder.onnx, cross_kv.onnx y decoder.onnx. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~95 ms por frase en cuatro hilos de CPU según el autor; el throughput agregado no está disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (chrF FLEURS) | Licencia | Formato |
|---|---|---|---|---|---|
| IndicTrans2 indic→en int8 (este) | 200M | no disponible | Telugu 68,9; Hindi 65,1 | MIT | ONNX int8 |
| opus-mt-mul-en | no disponible | no disponible | Telugu 51,5; Hindi 43,6 | no disponible | no disponible |
| ai4bharat/indictrans2-indic-en-dist-200M | 200M | no disponible | referencia del original | MIT | PyTorch/safetensors |

La comparativa se limita a los datos aportados por el autor; no hay información sobre otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Solo traduce desde lenguas indias hacia inglés; no cubre la dirección inversa ni otros pares lingüísticos.
- La lista exacta de lenguas de origen soportadas no está disponible en la información proporcionada.
- La cuantización int8 puede introducir degradación respecto al modelo original; el autor solo verifica coincidencia en 11 de 12 traducciones greedy en una muestra de FLEURS dev.
- La diferencia detectada en el preprocesamiento (emisión de un carácter `़` literal en 1 de 50 casos) puede afectar a textos con ese signo diacrítico.
- Riesgo de alucinación y de traducciones erróneas en textos fuera del dominio de conversación para el que se validó.
- No se documentan sesgos específicos; al ser un modelo entrenado sobre corpus de lenguas indias, pueden aparecer sesgos propios de esos datos.
- Licencia MIT, lo que permite uso comercial, pero conviene conservar el aviso de copyright y citar el trabajo original de IndicTrans2.
- Para producción, la validación se limita a FLEURS dev; no hay datos sobre robustez en dominios especializados (legal, médico, técnico).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChatPanel/indictrans2-indic-en-int8
- Modelo base: https://huggingface.co/ai4bharat/indictrans2-indic-en-dist-200M
- Paper de IndicTrans2: Gala et al., *IndicTrans2: Towards High-Quality and Accessible Machine Translation Models for all 22 Scheduled Indian Languages*, TMLR 2023 (enlace directo no disponible en la información proporcionada)
- Repositorio de IndicTransToolkit: no disponible en la información proporcionada
