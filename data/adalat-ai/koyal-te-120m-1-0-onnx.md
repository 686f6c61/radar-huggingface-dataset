# adalat-ai/koyal-te-120m-1.0-onnx

## Resumen

Koyal Telugu ASR 120M (ONNX) es la exportación a formato ONNX del modelo de reconocimiento automático de voz en telugu `adalat-ai/koyal-te-120m-1.0`, desarrollado por Adalat AI. Se trata de un modelo de tipo Conformer con decodificación TDT (Token-and-Duration Transducer), diseñado específicamente para transcribir audio en telugu con ortografía rica, incluyendo puntuación y numerales escritos tal como aparecerían en un documento mecanografiado.

El modelo original contiene aproximadamente 120 millones de parámetros y se distribuye ahora en tres variantes de precisión (float32, fp16 e int8) con el objetivo de eliminar la dependencia de PyTorch y NeMo en producción. Esto permite ejecutarlo en Python, en otros lenguajes mediante bindings de ONNX Runtime, o incluso en un navegador web mediante WebAssembly o WebGPU, lo que reduce considerablemente la barrera de despliegue.

La relevancia actual del modelo radica en su enfoque práctico: un ASR especializado en un idioma de bajos recursos como el telugu, con licencia permisiva CC-BY-4.0 y una arquitectura optimizada para inferencia ligera. El modelo base reporta un WER_SCRIBE del 17,81% en FLEURS-RO, lo que lo sitúa como una opción viable para aplicaciones de transcripción en producción dentro del ecosistema telugu.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con decodificador TDT (Token-and-Duration Transducer), híbrido TDT-CTC |
| Parametros totales | 120M (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de ASR, procesa frames de audio de 40 ms) |
| Tipos de cuantizacion | float32, fp16, int8 |
| Idiomas soportados | Telugu (te) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder-model.onnx`, `decoder_joint-model.onnx` y variantes `.fp16.onnx` e `.int8.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Conformer, un transformer que combina convoluciones y mecanismos de atención, con un decodificador de tipo TDT (Token-and-Duration Transducer). Se trata de un modelo híbrido TDT-CTC: la cabeza CTC auxiliar existe en el checkpoint original pero no se exporta a ONNX, de modo que la inferencia se realiza exclusivamente mediante decodificación greedy TDT, que es el modo por defecto de NeMo. El encoder transforma características de audio (80 bandas log-mel con normalización por característica) en un vector por cada frame de 40 ms, y el decoder + joint network ejecuta un paso de decodificación por vez.

El encoder se inicializó a partir del modelo Conformer preentrenado MahaDhwani de AI4Bharat, con licencia MIT. No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La exportación a ONNX se realizó con versiones fijadas de las herramientas (Python 3.11, NeMo 2.8.0rc0 en un commit concreto, torch 2.11.0, onnx 1.21.0, onnxruntime 1.32.0 y onnxconverter-common 1.16.0), de modo que el proceso es reproducible byte a byte. La cuantización int8 se aplicó mediante cuantización dinámica de ONNX Runtime sobre los pesos de MatMul y Gemm, manteniendo las convoluciones en float32; la conversión fp16 se realizó con onnxconverter-common conservando entradas y salidas en float32.

## Capacidades

- Reconocimiento automático de voz (ASR) en telugu con salida en ortografía rica: incluye puntuación y numerales escritos, no solo texto plano.
- Transcripción de audio mono a 16 kHz; la librería `onnx-asr` realiza el remuestreo de otras frecuencias de WAV.
- Decodificación greedy TDT, equivalente al modo por defecto de NeMo.
- Ejecución sin PyTorch ni NeMo: compatible con ONNX Runtime en Python, en otros lenguajes con bindings de ONNX Runtime y en navegador web (WebAssembly para int8, WebGPU para fp16).
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del ASR ni modo thinking.
- Capacidad multilingüe limitada al telugu; no se documentan otros idiomas.

## Casos de uso

- Transcripción de reuniones y actas en telugu: el modelo convierte audio de reuniones en texto con puntuación y numerales, adecuado para generar actas directamente utilizables sin postprocesado de formato.
- Subtitulado automático de vídeo en telugu: integrado en un pipeline de extracción de audio y decodificación TDT, permite generar subtítulos con puntuación correcta para plataformas de contenido.
- Atención al cliente por voz en telugu: el modelo puede transcribir llamadas o mensajes de voz de usuarios para alimentar un sistema de tickets o un chatbot, con despliegue en CPU gracias a la variante int8 de 201 MB.
- Aplicaciones web de dictado en navegador: la variante int8 (201 MB) puede ejecutarse con WebAssembly en el navegador sin enviar audio a un servidor, lo que resulta útil para aplicaciones de privacidad sensible.
- Digitalización de archivos orales y entrevistas: transcripción de grabaciones etnográficas o periodísticas en telugu con ortografía rica para su incorporación a archivos digitales y bases de datos textuales.
- Asistentes de voz embebidos en dispositivos de gama baja: la variante int8 en CPU permite ejecutar el ASR en hardware sin GPU, como mini-PC o dispositivos edge, para comandos y dictado local.
- Investigación lingüística y corpus en telugu: generación de transcripciones a gran escala para estudios de corpus, con la ventaja de que el modelo está disponible con licencia CC-BY-4.0 para uso académico y comercial.

## Benchmarks y rendimiento

| Benchmark | Resultado | Modelo comparado |
|---|---|---|
| FLEURS-RO (WER_SCRIBE) | 17,81% | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, dado que se trata de un modelo de ASR. El único dato de rendimiento proporcionado es el WER_SCRIBE del 17,81% en FLEURS-RO para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: float32 requiere aproximadamente 500 MB de pesos (más overhead de activaciones); fp16 unos 250 MB; int8 unos 201 MB.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime, incluidas A100, H100 y RTX 4090; la variante fp16 está probada con WebGPU en Chrome y CoreML en macOS.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 1 GB de memoria libre; las variantes fp16 e int8 caben incluso en GPUs integradas.
- Opciones de despliegue: ONNX Runtime (Python y otros lenguajes), `onnx-asr` (con extra `[cpu,hub]`), WebAssembly en navegador, WebGPU en Chrome, CoreML en macOS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER FLEURS-RO | Licencia | Formato |
|---|---|---|---|---|---|
| Koyal Telugu ASR 120M (ONNX) | 120M | no disponible | 17,81% | CC-BY-4.0 | ONNX |
| Modelo base `adalat-ai/koyal-te-120m-1.0` | 120M | no disponible | 17,81% | CC-BY-4.0 | NeMo (.nemo) |
| Alternativas de ASR en telugu | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre otros modelos de ASR en telugu comparables (como IndicWav2Vec, Whisper en telugu u otros), por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para telugu; no debe esperarse un rendimiento aceptable en otros idiomas.
- El WER del 17,81% en FLEURS-RO indica que aproximadamente una de cada seis palabras puede contener errores en condiciones de referencia; en audio con ruido, acentos marcados o dominios específicos el error puede ser mayor.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con datos no especificados, puede heredar sesgos de género, dialecto o registro presentes en el corpus de entrenamiento.
- Riesgo de alucinación: como todo modelo generativo de transcripción, puede producir texto plausible pero incorrecto en segmentos de audio ambiguos o con silencio.
- La cabeza CTC auxiliar no se exporta a ONNX, por lo que solo está disponible la decodificación greedy TDT; no se pueden usar estrategias de decodificación con beam search o shallow fusion con un modelo de lenguaje en esta exportación.
- El front-end de audio (80 bandas log-mel con normalización) no está incluido en los archivos ONNX; debe proporcionarlo `onnx-asr` u otra implementación compatible, lo que añade una dependencia externa.
- La licencia CC-BY-4.0 permite uso comercial pero exige atribución; el encoder deriva del modelo MahaDhwani de AI4Bharat con licencia MIT, cuyas referencias deben citarse.
- El modelo se publicó en noviembre de 2026 y no registra descargas ni likes en el momento de la consulta, por lo que su validación por la comunidad es aún inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/adalat-ai/koyal-te-120m-1.0-onnx
- Modelo base: https://huggingface.co/adalat-ai/koyal-te-120m-1.0
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
- Repositorio NeMo (commit de referencia): https://github.com/NVIDIA-NeMo/NeMo/tree/6967f48fda2a
- Modelo MahaDhwani de AI4Bharat (inicialización del encoder): no disponible en la información proporcionada
