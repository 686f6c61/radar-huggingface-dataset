# HY-2012/AudioSR.AXERA

## Resumen

AudioSR.AXERA es un port del modelo de superresolucion de audio AudioSR, desarrollado originalmente por Haohe Liu y colaboradores, adaptado por HY-2012 para ejecutarse en la NPU3 del SoC AX650 de AXera. El modelo toma audio de baja frecuencia de muestreo (8, 16, 24 o 48 kHz) y lo reconstruye a 48 kHz, empleando una arquitectura de difusion latente (DDIM con 10 pasos) sobre un VAE y un vocoder descompuesto en nueve submodelos.

El repositorio no contiene pesos en formato PyTorch ni safetensors, sino un conjunto de 12 ficheros `.axmodel` cuantizados con Pulsar2 8.0 (mezcla de FP32, BF16, U16 y S8) y optimizados para la memoria y los requisitos de precision de la NPU del AX650. El paquete incluye ademas un SDK de inferencia en Python (via `axengine`) y otro en C++ con scripts de compilacion cruzada, ademas de las herramientas de conversion ONNX y calibracion.

Su relevancia es fundamentalmente practica: demuestra que un modelo de difusion para restauracion de audio puede ejecutarse en hardware embebido de bajo consumo con una correlacion respecto al modelo original de 0,9917 en la cadena completa y 0,9984 en el vocoder. Es un ejemplo de ingenieria de despliegue mas que un modelo nuevo, y su publico objetivo son desarrolladores que trabajan con plataformas AX650 o interesados en tecnicas de cuantizacion mixta para modelos generativos de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (DDIM-10) con VAE encoder/decoder y vocoder descompuesto; UNet como red de prediccion de ruido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 5,12 s por inferencia |
| Tipos de cuantizacion | mixta: FP32, BF16, U16 y S8 (Pulsar2 8.0) |
| Idiomas soportados | no disponible (los ejemplos incluyen ingles y chino, pero no se declara soporte formal) |
| Licencia | SDK y scripts de conversion: Apache-2.0; pesos: sujetos a la licencia del AudioSR original (no especificada en el repo) |
| Formato de pesos | `.axmodel` (formato propietario de AXera); no se distribuyen safetensors ni GGUF |
| Frecuencia de entrada | 8 / 16 / 24 / 48 kHz, mono o estereo (WAV) |
| Frecuencia de salida | 48 kHz |
| Tamano del repositorio | 0,9 GB |
| Hardware objetivo | SoC AX650 con NPU3 (AXera) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de AudioSR: un autoencoder variacional (VAE) que codifica el espectrograma log-mel en un espacio latente, una UNet que aplica difusion (DDIM con 10 pasos de muestreo) para generar el latente de alta frecuencia y un decoder que reconstruye la forma de onda a traves de un vocoder. En esta version, el vocoder se ha fragmentado en nueve submodelos (`voc_pre_fp32`, `voc_up0a_mix`, `voc_up0b_mix`, `voc_up1a_mix`, `voc_up1b_mix`, `voc_split_nhwc_up2_mix`, `voc_split_nhwc_up3_mix`, `voc_split_nhwc_up4_mix` y `voc_split_nhwc_post_fp32`) para ajustarse a las restricciones de memoria de la NPU del AX650.

No se proporcionan datos sobre el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO): esa informacion corresponde al proyecto AudioSR de Haohe Liu y no se reproduce en esta ficha. La innovacion tecnica de este port es el proceso de conversion: exportacion a ONNX, division en subgrafos, generacion de datos de calibracion y cuantizacion mixta con Pulsar2 8.0. Se aplican formatos NHWC en los modulos donde la NPU lo requiere y se mantienen en FP32 las capas mas sensibles a la precision (pre y post del vocoder). El resultado es una correlacion de 0,99975 en el VAE encoder, 0,99989 en la UNet, 0,99999 en el VAE decoder, 0,99838 en la cadena del vocoder y 0,99169 en la cadena completa frente a PyTorch/ONNX.

## Capacidades

- Superresolucion de voz y audio general: convierte entradas de 8, 16, 24 o 48 kHz a 48 kHz.
- Procesamiento de audio mono y estereo en formato WAV.
- Ventana de inferencia fija de 5,12 s por pasada, con solapamiento gestionado por el SDK.
- Muestreo por difusion DDIM con 10 pasos, lo que reduce el coste frente a muestreos completos.
- Inferencia en dos vias: SDK de Python sobre `axengine` y ejecutable en C++ compilado de forma cruzada.
- Cadena completa en C++: WAV, remuestreo, STFT/log-mel, VAE encoder, UNet DDIM-10, decoder, vocoder fragmentado y postprocesado.
- Soporte de calibracion y conversion reproducible mediante Pulsar2 8.0 en contenedor Docker.
- No se documenta soporte de tool calling, agentes, vision, audio-texto ni modo de razonamiento extendido.

## Casos de uso

- Restauracion de archivos de voz historicos o telefonicos: el modelo acepta entradas de 8 kHz y las eleva a 48 kHz, util para digitalizar grabaciones de baja calidad en archivos y emisoras.
- Mejora de audio en dispositivos embebidos: al ejecutarse en la NPU del AX650 con RTF de 1,43 en C++, puede integrarse en camaras IP, grabadoras o terminales de videoconferencia que necesiten mejorar el audio capturado sin enviar datos a la nube.
- Preprocesado para pipelines de ASR: elevar la frecuencia de muestreo de la senal antes de pasarla a un reconocedor de voz puede mejorar la precision en entornos ruidosos o con microfonos de baja calidad.
- Postproduccion de podcast y video: reconstruccion de pistas de voz grabadas con equipos limitados, con un coste de 7,3 s por cada 5,12 s de audio en la via C++.
- Prototipado en investigacion de audio: el repositorio incluye scripts de conversion y calibracion que sirven como referencia para portar otros modelos de difusion de audio a NPUs AXera.
- Sistemas de telefonia y atencion al cliente: mejora de la calidad percibida de llamadas VoIP de banda estrecha en el propio terminal, sin depender de servicios externos.
- Demostraciones de cuantizacion mixta: el desglose del vocoder en nueve submodelos con distintos niveles de precision es un caso de estudio para ingenieros que necesiten ajustar modelos grandes a memorias de NPU limitadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos son las correlaciones de fidelidad respecto al modelo original y las medidas de velocidad:

| Metrica | Valor |
|---|---|
| Correlacion VAE encoder (NHWC) vs ONNX/PyTorch | 0,99975 |
| Correlacion UNet vs ONNX/PyTorch | 0,99989 |
| Correlacion VAE decoder vs ONNX/PyTorch | 0,99999 |
| Correlacion cadena del vocoder (9 modelos) | 0,99838 |
| Correlacion cadena completa AudioSR | 0,99169 |
| RTF SDK Python (5,12 s de entrada, DDIM-10, AX650 NPU3) | 4,0-4,3 (20-22 s por ventana) |
| RTF C++ (5,12 s de entrada, DDIM-10, AX650 NPU3) | 1,43 (7,3 s por ventana) |

## Requisitos de hardware

- Hardware objetivo: SoC AX650 de AXera con NPU3. No se documenta ejecucion en GPU convencional ni en CPU de escritorio.
- VRAM estimada: no aplica; el modelo esta disenado para la memoria de la NPU del AX650. El repositorio ocupa 0,9 GB, con ficheros individuales entre 99 KB y 273 MB.
- GPU recomendadas: no disponible; el modelo no se distribuye en formatos ejecutables en GPU (safetensors, GGUF).
- Compatibilidad con GPU de consumo: no disponible; los `.axmodel` no son portables a CUDA.
- Opciones de despliegue: SDK Python sobre `axengine` (requiere `requirements.txt`) y ejecutable C++ con compilacion cruzada mediante `cpp/build_ax650.sh`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: con ventanas de 5,12 s y DDIM-10, el SDK Python tarda 20-22 s (RTF 4,0-4,3) y la via C++ 7,3 s (RTF 1,43). La via C++ es aproximadamente 2,8-3 veces mas rapida.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| AudioSR.AXERA (este) | Difusion latente portada a NPU | 8-48 kHz / 48 kHz | ventana de 5,12 s | SDK Apache-2.0; pesos segun upstream | AX650 NPU3 |
| AudioSR original (haoheliu) | Difusion latente en PyTorch | 8-48 kHz / 48 kHz | ventana de 5,12 s | no disponible en esta ficha | GPU/CPU via PyTorch |
| Modelos de superresolucion de voz genericos (p. ej. basados en GAN o difusion) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa mas relevante es con el AudioSR original: este port mantiene la misma arquitectura y ventana de inferencia, pero sustituye PyTorch por una cadena cuantizada para NPU con una correlacion de 0,99169 en la salida final. No se dispone de datos de benchmarks perceptuales (MOS, PESQ) ni de comparaciones con otros sistemas de superresolucion en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia de los pesos no esta explicitamente declarada en el repositorio; solo se indica que el SDK y los scripts son Apache-2.0 y que los pesos siguen la licencia del AudioSR original. Verificar antes de cualquier uso comercial.
- El modelo esta atado al hardware AX650: los `.axmodel` no son ejecutables en GPU, CPU ni en otras NPUs sin un nuevo proceso de conversion.
- La ventana de inferencia es fija de 5,12 s; audios mas largos requieren segmentacion y ensamblado por parte del SDK, con riesgo de artefactos en las uniones.
- El RTF en Python es superior a 1 (4,0-4,3), por lo que no es apto para procesamiento en tiempo real en esa via; solo la implementacion C++ se acerca (RTF 1,43, aun por encima de 1).
- No se declaran idiomas soportados formalmente; los ejemplos cubren ingles y chino, pero no hay evaluacion multilingue publicada.
- Al ser un modelo generativo de difusion, puede introducir artefactos o contenido inventado en la senal de audio, especialmente con entradas muy degradadas o dominadas por ruido.
- No se han publicado evaluaciones de sesgo, robustez ni MOS perceptual en la informacion disponible.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo dia (4 de noviembre de 2026); no hay historial de mantenimiento ni comunidad que lo respalde.
- La reproducibilidad depende de la imagen Docker de Pulsar2 8.0 alojada en un registro privado de AXera, lo que puede limitar la conversion fuera de ese entorno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HY-2012/AudioSR.AXERA
- Repositorio GitHub del port: https://github.com/ZY-2012/AudioSR_AXERA
- Proyecto AudioSR original: https://github.com/haoheliu/versatile_audio_super_resolution
