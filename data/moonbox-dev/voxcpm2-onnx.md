# moonbox-dev/VoxCPM2-ONNX

## Resumen

VoxCPM2-ONNX es la distribucion en formato ONNX del modelo de sintesis de voz VoxCPM2, desarrollado originalmente por OpenBMB y convertido por Moonbox para su ejecucion en dispositivos mediante ONNX Runtime. El modelo resuelve la generacion de voz de alta fidelidad (48 kHz) con clonacion de voz zero-shot a partir de un audio de referencia corto, y esta disenado para integrarse en aplicaciones locales sin depender de frameworks de deep learning completos.

La relevancia de esta version radica en su empaquetado: cada precision (fp16 e int8) se distribuye como un conjunto de grafos ONNX independientes mas un `pipeline.py` que orquesta las etapas (extraccion de caracteristicas, prompt, bucle de muestreo). Esto permite desplegar TTS en CPU, CUDA o DirectML con ONNX Runtime, lo que reduce la barrera de entrada frente a una implementacion PyTorch nativa.

El repositorio ocupa 8,6 GB e incluye los grafos del modelo de lenguaje base, el estimador, el codificador de caracteristicas, el decodificador y codificador VAE, las cabezas y el tokenizador. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS neural con LM base, LM residual, estimador, VAE encoder/decoder, FSQ y fusion (grafos ONNX independientes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, int8 |
| Idiomas soportados | no disponible (los benchmarks mencionan ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (con ficheros `.onnx.data` externos) y tokenizador JSON |

## Arquitectura y entrenamiento

El modelo original VoxCPM2 es un sistema de text-to-speech con clonacion de voz que combina un modelo de lenguaje base, un modelo de lenguaje residual, un estimador, un cuantizador FSQ, un VAE (encoder y decoder) y capas de fusion y cabezas de salida. La version ONNX descompone esa arquitectura en grafos separados que se ejecutan secuencialmente desde `pipeline.py`, lo que permite optimizar cada modulo por separado y ejecutar en distintos backends de ONNX Runtime.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card unicamente referencia el paper arXiv:2509.24650 y el modelo base `openbmb/VoxCPM2`. La innovacion destacable de esta distribucion es la conversion a ONNX con dos precisiones (fp16 e int8) manteniendo metricas de calidad cercanas al modelo PyTorch original, con soporte para CPU, CUDA y DirectML.

## Capacidades

- Sintesis de voz de alta fidelidad a 48 kHz.
- Clonacion de voz zero-shot a partir de un audio de referencia (prompt) en ingles y chino segun los benchmarks publicados.
- Generacion de habla condicionada por texto con control de similitud al hablante de referencia.
- Ejecucion en CPU, CUDA y DirectML mediante ONNX Runtime.
- Dos niveles de precision (fp16 e int8) para ajustar calidad frente a velocidad.
- Integracion mediante un `pipeline.py` que gestiona caracteristicas, prompt y bucle de muestreo.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada mas alla del prompt de referencia.

## Casos de uso

- Clonacion de voz para audiolibros y narracion: el modelo permite generar locuciones con la voz de un narrador a partir de una muestra corta, manteniendo similitud de hablante superior a 0,96 en los benchmarks publicados.
- Asistentes de voz en aplicaciones de escritorio: al ejecutarse con ONNX Runtime en CPU o DirectML, puede integrarse en aplicaciones Windows sin GPU dedicada ni stack PyTorch.
- Generacion de voces para videojuegos y contenido interactivo: la precision int8 reduce el peso del modelo y permite generar dialogos en tiempo de ejecucion en equipos modestos.
- Prototipado de sistemas TTS multilingue (ingles y chino): util para evaluar calidad y similitud antes de invertir en infraestructura mayor.
- Accesibilidad: lectura de textos en voz alta con voces personalizadas para usuarios con discapacidad visual, ejecutandose localmente y sin envio de datos a la nube.
- Investigacion en sintesis de voz: la separacion en grafos ONNX facilita experimentar con modulos concretos (VAE, estimador, LM) y medir su impacto en WER, CER y DNSMOS.
- Despliegue en entornos con requisitos de privacidad: al ser local y Apache 2.0, permite procesar texto y audio sin salir del dispositivo.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan fp16 e int8 con el modelo PyTorch original (bf16) sobre un conjunto de clonacion de voz en ingles y chino (LibriSpeech y AISHELL-1).

| Precision | WER / CER | Similitud hablante | DNSMOS | RTF (CUDA) |
|---|---|---|---|---|
| Original (bf16) | 0,0 % / 0,0 % | 0,976 / 0,965 | 3,07 / 2,29 | no disponible |
| fp16 ONNX | 0,3 % / 0,0 % | 0,973 / 0,966 | 3,06 / 2,10 | 0,85 |
| int8 ONNX | 0,0 % / 0,3 % | 0,973 / 0,968 | 2,99 / 2,15 | 1,7 |

El RTF (real-time factor) de 0,85 en fp16 con CUDA indica generacion mas rapida que tiempo real; int8 duplica el RTF hasta 1,7. La degradacion de calidad de int8 frente a fp16 es marginal en WER, CER y similitud, con una ligera bajada de DNSMOS.

## Requisitos de hardware

- VRAM estimada: el conjunto fp16 suma aproximadamente 4,2 GB de pesos (base_lm 2,88 GB, residual_lm 0,82 GB, feat_encoder 0,44 GB, estimator 0,42 GB, VAE y resto); int8 reduce el total a unos 2,2 GB. La VRAM efectiva depende de las activaciones y del backend.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 6-8 GB de VRAM para fp16; para int8 basta con 4 GB aproximadamente. Una RTX 4090 o A100 ofrece margen sobrado; una RTX 3060 de 12 GB es suficiente para fp16.
- Consumer GPU: si, el modelo cabe en GPUs de consumo media (RTX 3060, RTX 4060) en int8 y en fp16 con holgura en modelos de 8 GB o mas.
- Despliegue: ONNX Runtime con ejecucion CPU, CUDA o DirectML; el repositorio incluye `pipeline.py` como punto de entrada. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo al uso.
- Latencia y throughput: RTF 0,85 en fp16 con CUDA y 1,7 en int8; no se publican cifras para CPU ni DirectML.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad / metricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VoxCPM2-ONNX (este) | no disponible | no disponible | WER 0,0-0,3 %, similitud 0,97, DNSMOS 2,99-3,06 | Apache 2.0 | ONNX en HF |
| VoxCPM2 (original) | no disponible | no disponible | WER 0,0 %, similitud 0,976, DNSMOS 3,07 | Apache 2.0 | PyTorch en HF |
| Otros TTS open source (p. ej. XTTS, Bark, Fish Speech) | no disponible | no disponible | no disponible | varian | varian |

La comparacion con alternativas de la misma categoria no puede completarse con los datos proporcionados; solo se dispone de la comparacion directa entre la version ONNX y el modelo PyTorch original.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo ni del dataset de entrenamiento.
- Riesgo de alucinacion en la sintesis: errores de pronunciacion o artefactos en textos fuera del dominio de entrenamiento.
- Idiomas: los benchmarks solo cubren ingles y chino; el soporte de otros idiomas no esta confirmado.
- La clonacion de voz plantea riesgos de suplantacion de identidad y uso malintencionado; conviene aplicar controles de consentimiento y marcas de agua.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base y de los datasets de referencia utilizados.
- int8 reduce ligeramente la calidad (DNSMOS 2,99 frente a 3,07) y duplica el RTF frente a fp16.
- No se publican requisitos de hardware para CPU ni DirectML, por lo que el rendimiento en esos backends es incierto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio ONNX: https://huggingface.co/moonbox-dev/VoxCPM2-ONNX
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Paper: https://arxiv.org/abs/2509.24650
