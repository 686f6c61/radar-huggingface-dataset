# hencohen83/ivrit-whisper-large-v3-turbo-qnn-sm8750

## Resumen

`hencohen83/ivrit-whisper-large-v3-turbo-qnn-sm8750` es una compilacion del modelo de reconocimiento automatico del habla (ASR) en hebreo `ivrit-ai/whisper-large-v3-turbo` a binarios de contexto QNN para la NPU Hexagon v79 del SoC Qualcomm Snapdragon 8 Elite (SM8750). No se trata de un modelo nuevo ni de un reentrenamiento: el autor (hencohen83) parte de los pesos completos en safetensors del modelo de ivrit.ai, los exporta a ONNX con formas fijas mediante los scripts de sherpa-onnx y los compila con QAIRT 2.40.0.251030 en dos artefactos, `encoder.bin` y `decoder.bin`. El modelo original es un fine-tuning sobre Whisper large-v3 turbo de OpenAI, con unos 809 millones de parametros, especializado en transcripcion de hebreo.

La relevancia de esta ficha es fundamentalmente practica: demuestra que un modelo Whisper de tamano grande puede ejecutarse en la NPU de un telefono de gama alta con un consumo energetico muy inferior al de la inferencia en CPU. El autor reporta mediciones sobre un Galaxy S25 en las que la NPU tarda 8,0 s y consume 9,2 J por fragmento de 30 s, frente a whisper.cpp q8_0 en 6 hilos de CPU, que requiere 2,2 veces mas tiempo y 5 veces mas energia y calienta el dispositivo hasta 39 grados.

Es importante subrayar que los binarios estan ligados al chip (SM8750, Hexagon v79) y a la version exacta del runtime QNN, por lo que no son portables a otros SoC ni a otras versiones de QAIRT. El repo ocupa 1,8 GB y se distribuye bajo licencia Apache-2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 turbo), compilado a binarios de contexto QNN para NPU Hexagon v79 |
| Parametros totales | 809 M (modelo base `ivrit-ai/whisper-large-v3-turbo`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper: fragmentos de 30 s) |
| Tipos de cuantizacion | Compilacion QNN con activaciones de 16 bits y sesgos de 32 bits; entradas y salidas del decoder tambien en 16 bits (`--float_bitwidth 16`). No se distribuyen variantes GGUF ni cuantizaciones de pesos adicionales |
| Idiomas soportados | Hebreo (`he`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Binarios de contexto QNN (`encoder.bin`, `decoder.bin`) mas `tokens.txt`; no se incluyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3 turbo, un transformer encoder-decoder con atencion estandar disenado para ASR y traduccion de voz. La variante turbo de OpenAI reduce el numero de capas del decoder respecto a large-v3, lo que baja el coste de decodificacion manteniendo la calidad del encoder. Sobre esa base, ivrit.ai realizo un fine-tuning especifico para hebreo, que es el que aporta la calidad linguistica del modelo; el autor de este repo no aporta entrenamiento adicional, solo conversion de formato.

El proceso de conversion consta de tres pasos documentados: (1) partida de los safetensors en precision completa de `ivrit-ai/whisper-large-v3-turbo` en el commit `f33172a8`, convertidos al formato de openai-whisper (no una copia cuantizada); (2) exportacion a ONNX con formas fijas mediante `scripts/whisper/qnn/export_onnx.py` de sherpa-onnx; y (3) compilacion del encoder y del decoder con QAIRT 2.40.0.251030 para SM8750. La innovacion tecnica destacable no esta en la arquitectura sino en el despliegue: la compilacion AOT (ahead-of-time) a binarios de contexto permite ejecutar el grafo completo en la NPU Hexagon sin intervencion del compilador en tiempo de ejecucion. La decodificacion es greedy, sin el mecanismo de fallback de whisper.cpp, lo que segun el autor provoco que 5 de 84 fragmentos repitieran una frase hasta el limite de tokens.

## Capacidades

- Transcripcion de voz a texto en hebreo, con la calidad del fine-tuning de ivrit.ai sobre Whisper large-v3 turbo.
- Procesamiento por fragmentos de 30 s, adecuado para conversaciones y audio de larga duracion (el autor lo evaluo sobre una conversacion de 41 minutos).
- Ejecucion en NPU Hexagon v79 del Snapdragon 8 Elite mediante el proveedor QNN de sherpa-onnx.
- Integracion con el reconocedor offline de sherpa-onnx (tipo de modelo `turbo`, `qnnConfig.contextBinary = "encoder.bin,decoder.bin"`).
- No se documentan capacidades de tool calling, agentes, vision, audio multimodal ni modo de razonamiento; es un modelo ASR puro.
- No se documenta traduccion a otros idiomas ni capacidades multilingues: el modelo esta orientado exclusivamente a hebreo.

## Casos de uso

- Transcripcion de reuniones y conversaciones largas en hebreo en movil: el modelo procesa audio en fragmentos de 30 s y, segun las mediciones del autor, completa cada fragmento en 8,0 s en la NPU de un Galaxy S25, lo que permite transcribir una conversacion de 41 minutos con consumo energetico contenido.
- Subtitulado y actas en dispositivos Android de gama alta: al ejecutarse en la NPU con 9,2 J por fragmento y temperaturas que no superan los 36,4 grados, es viable para sesiones prolongadas sin degradacion termica apreciable.
- Aplicaciones de accesibilidad para usuarios hebreoparlantes: dictado y transcripcion en tiempo casi real sin depender de la nube, lo que preserva la privacidad del audio.
- Procesamiento por lotes en el propio dispositivo: transcripcion de notas de voz, podcasts o grabaciones archivadas sin enviar datos a servidores externos.
- Integracion en apps Android mediante el AAR `hencohen83/sherpa-onnx-qnn-android` y el parche de sherpa-onnx v2.0.1 con soporte QNN para Whisper, lo que simplifica el empaquetado del runtime.
- Evaluacion comparativa de eficiencia NPU frente a CPU: el propio autor usa el modelo para medir tiempo y energia frente a whisper.cpp q8_0 en 6 hilos, un escenario util para equipos que disenan estrategias de inferencia en movil.
- Investigacion en ASR de bajos recursos para hebreo: sirve como referencia de despliegue de un modelo fine-tuneado en hardware movil de ultima generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (WER, MMLU, etc.) en la informacion disponible. El autor unicamente reporta mediciones de eficiencia en un Galaxy S25:

| Metrica | NPU (QNN, SM8750) | whisper.cpp q8_0, 6 hilos CPU |
|---|---|---|
| Tiempo por fragmento de 30 s | 8,0 s | 2,2 veces el tiempo de la NPU |
| Energia por fragmento | 9,2 J | 5 veces la energia de la NPU |
| Temperatura maxima | 36,4 grados | 39 grados |
| Calidad de decodificacion | Greedy, sin fallback; 5 de 84 fragmentos con repeticion hasta el limite de tokens | No disponible |

## Requisitos de hardware

- SoC: Qualcomm Snapdragon 8 Elite (SM8750) con NPU Hexagon v79. Los binarios no son portables a otros chips.
- Runtime: librerias QNN de Qualcomm version 2.40.0.251030 (`libQnnHtp.so`, `libQnnHtpV79Skel.so`, `libQnnHtpV79Stub.so`, `libQnnSystem.so`), publicadas por sherpa-onnx como `qnn-libs-2.40.0.251030`, con `ADSP_LIBRARY_PATH` apuntando a su carpeta. Estas librerias no se incluyen en el repo.
- Software: sherpa-onnx v2.0.1 con los cambios QNN para Whisper del parche `scripts/npu/sherpa-onnx-v2.0.1-qnn.patch` del proyecto Transcriptor, o el AAR `hencohen83/sherpa-onnx-qnn-android`.
- Almacenamiento: aproximadamente 1,8 GB para los binarios de contexto y la tabla de tokens.
- VRAM: no aplica; la inferencia se realiza en la NPU del dispositivo, no en GPU de escritorio. No se documenta despliegue en A100, H100 ni RTX 4090, ni soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 8,0 s por fragmento de 30 s en NPU, con 9,2 J de energia, segun las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| `hencohen83/ivrit-whisper-large-v3-turbo-qnn-sm8750` | 809 M | Fragmentos de 30 s | Hebreo | Apache-2.0 | Binarios QNN para NPU SM8750 |
| `ivrit-ai/whisper-large-v3-turbo` (modelo base) | 809 M | Fragmentos de 30 s | Hebreo | Apache-2.0 | Safetensors, ejecutable en GPU/CPU con frameworks estandar |
| `hencohen83/ivrit-whisper-large-v3-qnn-sm8750` | no disponible | Fragmentos de 30 s | Hebreo | Apache-2.0 | Binarios QNN para NPU SM8750, basado en whisper-large-v3 (no turbo) |
| whisper.cpp q8_0 (referencia del autor) | no disponible | Fragmentos de 30 s | Multiples | MIT (whisper.cpp) | GGUF cuantizado, CPU |

La comparativa relevante es frente al modelo base (misma calidad linguistica, pero sin aceleracion NPU) y frente a la variante no turbo compilada por el mismo autor, que parte de whisper-large-v3 y previsiblemente tiene mayor coste de decodificacion, aunque no se publican mediciones comparativas entre ambas.

## Limitaciones y advertencias

- Dependencia estricta del hardware: los binarios solo cargan en SM8750 (Hexagon v79) con el runtime QNN 2.40.0.251030; cualquier otro chip o version de QAIRT los invalida.
- Idioma unico: el modelo esta fine-tuneado para hebreo y no se documenta soporte de otros idiomas ni traduccion.
- Decodificacion greedy sin fallback: el autor observo repeticiones de frases hasta el limite de tokens en 5 de 84 fragmentos, un riesgo relevante para produccion que requiere postprocesado o deteccion de bucles.
- Riesgo de alusiones y errores en audio ruidoso: no se publican tasas de error (WER) que permitan acotar la calidad en condiciones adversas.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un fine-tuning de Whisper, hereda los sesgos del modelo original y del corpus de entrenamiento de ivrit.ai.
- Licencia: Apache-2.0 permite uso comercial, pero las librerias QNN de Qualcomm son propietarias y no se incluyen en el repo; su uso esta sujeto a los terminos de Qualcomm.
- Repo practicamente sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las mediciones del autor.
- Requiere integrar un parche no oficial de sherpa-onnx (v2.0.1) para el soporte QNN de Whisper, lo que anade complejidad de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hencohen83/ivrit-whisper-large-v3-turbo-qnn-sm8750
- Modelo base: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo
- Variante no turbo del mismo autor: https://huggingface.co/hencohen83/ivrit-whisper-large-v3-qnn-sm8750
- AAR de sherpa-onnx con QNN: https://huggingface.co/hencohen83/sherpa-onnx-qnn-android
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Proyecto Transcriptor (parche QNN para sherpa-onnx): https://github.com/chencohensolutions/transcriptor-kmp
- ivrit.ai: https://www.ivrit.ai
- Estadisticas del modelo base: https://openmodelstats.com/models/ivrit-ai/whisper-large-v3-turbo
