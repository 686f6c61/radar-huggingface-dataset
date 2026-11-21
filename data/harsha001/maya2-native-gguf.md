# Harsha001/Maya2-Native-GGUF

## Resumen

Maya2-Native-GGUF es una distribucion en formato GGUF del modelo de sintesis de voz (text-to-speech) maya-research/maya2-native, un sistema TTS multilingue centrado en lenguas indicas. La publica el usuario Harsha001 y esta pensada para ejecutarse sobre ROCmFPX, un fork de llama.cpp con soporte nativo de Vulkan y CUDA, sin dependencias de Python ni PyTorch. El modelo base tiene 1.812.042.752 parametros y combina un backbone tipo Qwen3 de 28 capas con un decodificador de profundidad y el codec de audio Mimi de Kyutai, que genera audio a 24 kHz.

El interes practico reside en que permite sintetizar voz en doce idiomas (once lenguas indicas mas ingles) desde un runtime C++ puro, lo que facilita el despliegue en entornos sin stack de Python y en hardware AMD con Vulkan, incluido el Strix Halo. La cuantizacion reduce el backbone a entre 1,3 GB y 3,6 GB segun la variante, y el decodificador de audio se distribuye por separado en un fichero mmproj.

La licencia es Apache 2.0 para el modelo, aunque el codec Mimi tiene licencia CC-BY 4.0, un matiz relevante para uso comercial. El repositorio ocupa 13,6 GB e incluye seis ficheros: tres backbones cuantizados con escalas por tensor especificas de ROCmFPX, un backbone BF16 y dos versiones del mmproj.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer tipo Qwen3 (28 capas) + decodificador de profundidad (44 capas pequenas en 11 grupos) + codec de audio Mimi (Kyutai) |
| Parametros totales | 1.812.042.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_0 con escalas ROCmFP4-FAST (Strix Halo), BF16; mmproj en BF16 y Q8_0 |
| Idiomas soportados | as, bn, en, gu, hi, kn, ml, mr, or, pa, ta, te |
| Licencia | Apache 2.0 (modelo); Mimi: CC-BY 4.0; runtime: MIT |
| Formato de pesos | GGUF (backbone + mmproj separados) |

## Arquitectura y entrenamiento

El sistema se divide en tres componentes encadenados. El backbone, un transformer Qwen3 de 28 capas, lee el texto y predice el codigo 0 de cada trama de audio. El decodificador de profundidad, formado por 44 capas transformer pequenas organizadas en 11 grupos, predice los codigos 1 a 31 de cada trama. Finalmente, Mimi de Kyutai convierte los 32 codigos por trama en audio a 24 kHz. El modelo genera 12,5 tramas de audio por segundo.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La model card del repositorio GGUF se centra en el proceso de cuantizacion y en la verificacion de fidelidad respecto a la referencia en PyTorch mediante teacher forcing: con los mismos codigos de entrada, la variante Q8_0 alcanza un coseno de logits de backbone de 0,9997 y 54 de 55 coincidencias en la eleccion top, mientras que Q4_K_M baja a 0,986 y 50 de 55. La decodificacion es por muestreo, con semilla configurable para reproducibilidad.

## Capacidades

- Sintesis de voz multilingue en once lenguas indicas (asames, bengali, gujarati, hindi, kannada, malayo, marathi, oriya, punyabi, tamil y telugu) y en ingles.
- Seleccion de voz mediante prefijo en el prompt: Ahana, Vaidehi, Malini, Charvi, Jahnavi, Anirban, Nakul, Vasant, Siddhant, Satvik, Abhay, Nivedita, Ishwari, Ritvik, Vrinda, Sreekar, Kayal, Shaunak, Akshat y Tanushree; por defecto, Ahana.
- Generacion de audio a 24 kHz mediante el codec Mimi.
- Ejecucion nativa en C++ (ggml) sobre CPU, Vulkan (AMD Strix Halo y otras GPU) y CUDA.
- Reproducibilidad del audio mediante semilla fija (`-s <seed>`).
- No se documentan capacidades de tool calling, agentes, vision ni modo de razonamiento; el modelo es exclusivamente de sintesis de voz.

## Casos de uso

- Locucion automatizada en lenguas indicas: el modelo permite generar voz en hindi, tamil, telugu o bengali con una sola invocacion y seleccionando la voz por prefijo, util para medios digitales y audiolibros regionales.
- Accesibilidad y lectura de contenido: conversion de articulos o documentos a audio en el idioma del usuario, ejecutable en local sobre CPU sin depender de servicios en la nube.
- Asistentes de voz embebidos: al ser un runtime C++ sin Python, puede integrarse en dispositivos con recursos limitados y en placas AMD con Vulkan.
- Generacion de doblaje y voces sinteticas para video: la variedad de veinte voces permite asignar timbres distintos a personajes o narradores.
- Prototipado de interfaces conversacionales: la semilla fija facilita pruebas reproducibles de audio en pipelines de evaluacion.
- Despliegue en hardware AMD Strix Halo: la variante Q4_0 con escalas ROCmFP4-FAST esta optimizada para esta plataforma, lo que permite inferencia local en equipos de consumo.
- Investigacion en TTS multilingue: la separacion entre backbone, decodificador de profundidad y codec Mimi permite estudiar cada etapa por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que se trata de un modelo TTS. La model card incluye, en cambio, metricas de fidelidad frente a la referencia en PyTorch y de velocidad:

| Backbone / mmproj | Coseno logits backbone | Coseno logits profundidad | Coseno audio | Coincidencias top |
|---|---|---|---|---|
| F32 / F32 | 0,9999998 | 0,9999999 | 0,9999999 | 55 / 55 |
| BF16 / BF16 | 0,999997 | 0,99999 | 0,9999995 | 55 / 55 |
| Q8_0 / Q8_0 | 0,9997 | 0,9995 | 0,99999 | 54 / 55 |
| Q4_K_M / Q8_0 | 0,986 | 0,994 | 0,99999 | 50 / 55 |

En velocidad, sobre una NVIDIA GB10 con CUDA y cuantizacion Q4_K_M se alcanzan unas 40 tramas por segundo, 3,2 veces mas rapido que tiempo real (el modelo produce 12,5 tramas por segundo de audio). No se proporcionan cifras de latencia ni throughput para Vulkan en Strix Halo.

## Requisitos de hardware

- VRAM estimada: el backbone Q8_0 ocupa 1,9 GB, el Q6_K 1,5 GB, el Q4_0 para Strix Halo 1,3 GB y el BF16 3,6 GB; a ello se suma el mmproj (0,8 GB en Q8_0 o 1,5 GB en BF16). El conjunto completo en Q8_0 ronda los 2,7 GB.
- GPU recomendadas: NVIDIA GB10 (verificado con CUDA), GPU AMD con Vulkan (Strix Halo verificado por la comunidad); no se detallan modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, dado el reducido tamano de las variantes cuantizadas; la variante Q4_0 esta especificamente optimizada para Strix Halo.
- Opciones de despliegue: ROCmFPX, el fork de llama.cpp del autor, con binario `llama-tts`; requiere compilar con `-DGGML_VULKAN=ON` para Vulkan. Los backbones ROCmFPX necesitan este fork por sus escalas por tensor; no se indica compatibilidad con llama.cpp estandar, Ollama, vLLM ni TGI.
- Latencia y throughput: aproximadamente 40 tramas por segundo en GB10 con CUDA y Q4_K_M, equivalente a 3,2 veces tiempo real; sin datos para otras plataformas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia estructural, el propio modelo base maya-research/maya2-native es la alternativa directa en formato PyTorch, y el codec kyutai/mimi es el componente de audio reutilizado; no se aportan datos de otros sistemas TTS indicas para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Maya2-Native-GGUF | 1.812.042.752 | no disponible | Apache 2.0 (Mimi CC-BY 4.0) | GGUF |
| maya-research/maya2-native | no disponible | no disponible | Apache 2.0 | PyTorch (referencia) |
| Otros TTS indicas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo es exclusivamente de sintesis de voz; no realiza generacion de texto, razonamiento, codigo ni tool calling.
- La fidelidad de las variantes cuantizadas no es perfecta: Q8_0 presenta 54 de 55 coincidencias top y Q4_K_M 50 de 55 en la prueba de teacher forcing; en la prueba libre con ROCmFPX, la variante de 8 bits transcribio 2 de 37 palabras de forma incorrecta.
- La salida es estocastica por muestreo; la misma semilla puede producir audios distintos entre ficheros de cuantizacion diferentes.
- La tabla de teacher forcing no se ha repetido para los ficheros ROCmFPX de 20 de noviembre, por lo que su fidelidad exacta no esta verificada con ese metodo.
- La licencia Apache 2.0 del modelo no cubre el codec Mimi, que es CC-BY 4.0 y exige atribucion; conviene revisar las condiciones antes de un uso comercial.
- No se documentan sesgos especificos, pero al estar centrado en lenguas indicas su cobertura fuera de ese conjunto es limitada (solo ingles adicional).
- Los backbones ROCmFPX requieren el fork ROCmFPX; no se garantiza su funcionamiento en llama.cpp estandar.
- No se dispone de informacion sobre longitud de contexto, composicion del dataset de entrenamiento ni evaluaciones subjetivas de calidad de voz (MOS).

## Enlaces

- Repositorio GGUF: https://huggingface.co/Harsha001/Maya2-Native-GGUF
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Codec de audio Mimi: https://huggingface.co/kyutai/mimi
- Runtime ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- llama.cpp: https://github.com/ggml-org/llama.cpp
