# ChatPanel/indic-transcribe-core-int8

## Resumen

Indic-Transcribe-core-int8 es una exportación a ONNX con cuantización int8 del modelo de reconocimiento automático del habla bodhan-ai/indic-transcribe-core, desarrollado por IITM Bodhan-AI Foundation y construido a su vez sobre nvidia/canary-1b-v2. El modelo original es un sistema ASR de tipo FastConformer con decodificador transformer de 24 capas, orientado a lenguas índicas y a escenarios de code-switching (alternancia de idiomas dentro de una misma emisión). Esta variante concreta la publica ChatPanel para que su pasarela local pueda ejecutar el modelo en el ordenador del usuario mediante onnxruntime, sin dependencia de Python ni de servicios alojados.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: un export ONNX dividido en encoder, cross-attention K/V y decodificador por paso, con pesos cuantizados dinámicamente a int8. El objetivo es reducir requisitos de cómputo y permitir inferencia en CPU con un rendimiento declarado de 0,05× tiempo real sobre cuatro hilos, manteniendo una calidad de transcripción equivalente a la del modelo PyTorch original en las pruebas realizadas.

El repositorio ocupa 1,6 GB e incluye además los ficheros de front-end (banco de filtros mel de 128 bandas y ventana de 400 muestras) y el vocabulario de 7.152 piezas con los identificadores de idioma y el prompt de 10 tokens. La licencia es la Indic Open Model License v1.0, que permite uso comercial autoalojado pero exige aprobación previa escrita de Bodhan AI para ofrecer acceso alojado o vía API a terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + decodificador transformer de 24 capas con cross-attention cacheada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa segmentos de audio; estados del encoder con dimensión temporal T/8 y 1024 canales) |
| Tipos de cuantizacion | int8 dinámica de onnxruntime (MatMul/Gemm, por canal) |
| Idiomas soportados | lenguas índicas con soporte de code-switching; la model card no enumera la lista completa (no disponible) |
| Licencia | Indic Open Model License v1.0 (modelo base NVIDIA canary-1b-v2 bajo CC-BY-4.0) |
| Formato de pesos | ONNX (encoder.onnx, cross_kv.onnx, decoder.onnx, con ficheros .data asociados) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base: un encoder FastConformer que transforma características log-mel de 128 bandas con forma (1, 128, T) en estados de (1, T/8, 1024), es decir, con reducción temporal de factor 8. El front-end sigue la configuración de NeMo con n_fft de 512 y hop de 160, y el repositorio incluye explícitamente el banco de filtros mel (mel_fb_128x257.f32) y la ventana (window_400.f32) del checkpoint original. El decodificador es un transformer de 24 capas que consume claves y valores de cross-attention precalculados una vez por segmento (cross_kv.onnx), lo que permite ejecutar pasos de decodificación con caché de self-attention de forma incremental.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron etapas de RLHF o DPO; estos datos corresponden al modelo base y no se detallan en la información proporcionada. La innovación técnica de esta variante es puramente de despliegue: la separación en tres grafos ONNX (encoder, cross K/V y decodificador por paso), la cuantización dinámica int8 por canal en operaciones MatMul/Gemm y la inclusión del vocabulario con los identificadores de idioma para la detección de lengua en un único paso de decodificación sobre el slot de lenguaje. Según el autor, la validación sobre 8 clips de FLEURS dev por idioma arroja 22,5 % de error de carácter en telugu y 4,4 % en hindi, idénticos a los del modelo original, con 14 de 16 transcripciones idénticas byte a byte.

## Capacidades

- Reconocimiento automático del habla en lenguas índicas, con especial atención a escenarios de code-switching entre idiomas dentro de una misma emisión.
- Detección automática de idioma: un único paso de decodificación sobre el slot de lenguaje determina la lengua entre los tokens de idioma del vocabulario.
- Decodificación greedy con un prompt de 10 tokens, adecuada para transcripción de baja latencia.
- Inferencia en CPU sin Python mediante onnxruntime, pensada para ejecución local en el dispositivo del usuario.
- Procesamiento por segmentos con cross-attention precalculada, lo que reduce el coste por paso de decodificación.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio generativo ni modo thinking; el modelo es exclusivamente ASR.
- El soporte multilingüe se limita a las lenguas índicas cubiertas por el modelo base, cuya lista completa no se detalla en la información disponible.

## Casos de uso

- Transcripción local de reuniones y notas de voz: la pasarela puede ejecutar el encoder una vez por segmento y decodificar en CPU a 0,05× tiempo real sobre cuatro hilos, lo que permite transcribir audio en el propio portátil sin enviar datos a la nube.
- Subtitulado de contenido en lenguas índicas: el modelo genera transcripciones con detección de idioma integrada, útil para vídeos donde se alterna hindi, telugu u otras lenguas índicas con inglés.
- Asistentes de voz integrados en aplicaciones de escritorio: al no requerir Python ni servicio alojado, el modelo puede empaquetarse dentro de una aplicación de escritorio que transcribe la entrada de micrófono en tiempo casi real.
- Documentación clínica o legal dictada: la inferencia local evita el envío de audio sensible a terceros, y la licencia permite el uso autoalojado dentro de un producto propio.
- Análisis de grabaciones de atención al cliente en mercados índicos: la transcripción por segmentos con cross-attention cacheada facilita procesar conversaciones largas divididas en fragmentos.
- Investigación en ASR multilingüe: el export ONNX con pesos int8 sirve como referencia reproducible para comparar la degradación por cuantización frente al checkpoint PyTorch original en FLEURS.
- Herramientas de accesibilidad: transcripción en vivo de conversaciones para personas con discapacidad auditiva en entornos con conectividad limitada, aprovechando la ejecución totalmente offline.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las mediciones de error de carácter sobre 8 clips de FLEURS dev por idioma, comparando la variante int8 con el modelo PyTorch original:

| Metrica | Indic-Transcribe-core (PyTorch) | Indic-Transcribe-core-int8 (ONNX) |
|---|---|---|
| CER telugu (FLEURS dev, 8 clips) | 22,5 % | 22,5 % |
| CER hindi (FLEURS dev, 8 clips) | 4,4 % | 4,4 % |
| Transcripciones idénticas byte a byte | referencia | 14 de 16 |
| Velocidad en CPU (4 hilos) | no disponible | 0,05× tiempo real |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo es exclusivamente de reconocimiento del habla. Tampoco se aportan cifras de WER sobre otros conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,6 GB en disco, y la ejecución está pensada para CPU, por lo que no requiere GPU.
- GPU recomendadas: no se especifican; el diseño apunta a ejecución en CPU con onnxruntime. Cualquier GPU compatible con onnxruntime (por ejemplo, A100, H100 o RTX 4090) podría acelerar la inferencia, pero no hay datos publicados al respecto.
- Cabe en cualquier ordenador de consumo: el autor declara 0,05× tiempo real sobre cuatro hilos de CPU, sin requisitos de GPU.
- Opciones de despliegue: onnxruntime mediante la pasarela propietaria indic-engine.js de ChatPanel. No es compatible como drop-in con transformers, NeMo, vLLM, llama.cpp, Ollama ni TGI, según la propia model card.
- Latencia y throughput: 0,05× tiempo real en CPU de cuatro hilos, equivalente a procesar 20 segundos de audio por segundo de cómputo aproximadamente; no se publican cifras de latencia por segmento ni de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / enfoque | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ChatPanel/indic-transcribe-core-int8 | no disponible | ASR por segmentos, encoder FastConformer + decoder de 24 capas | lenguas índicas con code-switching | Indic Open Model License v1.0 | ONNX int8 |
| bodhan-ai/indic-transcribe-core | no disponible | mismo modelo sin cuantizar | lenguas índicas con code-switching | Indic Open Model License v1.0 | PyTorch (NeMo) |
| nvidia/canary-1b-v2 | no disponible | ASR multilingüe base del anterior | no disponible en la información proporcionada | CC-BY-4.0 | NeMo |

La comparación se limita a la cadena de derivación documentada en la model card; no se dispone de datos de benchmarks ni de especificaciones de parámetros de los modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa de rendimiento frente a otras familias ASR.

## Limitaciones y advertencias

- No es un reemplazo directo para transformers ni NeMo: requiere la pasarela propietaria de ChatPanel (indic-engine.js) para calcular características, ejecutar el encoder y gestionar la decodificación.
- La licencia Indic Open Model License v1.0 permite investigación y uso comercial, incluido el autoalojamiento dentro de un producto propio, pero ofrecer acceso alojado o vía API a terceros exige aprobación previa por escrito de Bodhan AI.
- La sección 10 de la licencia recoge usos prohibidos que deben revisarse antes de cualquier despliegue en producción.
- Los productos que usen el modelo deben mostrar la atribución "Built with Indic-Transcribe from Bodhan AI / AI4Bharat".
- La validación de calidad se basa en solo 8 clips por idioma de FLEURS dev (telugu e hindi), una muestra muy reducida que no permite extrapolar el comportamiento a otros dominios, acentos o condiciones acústicas.
- El error de carácter en telugu es elevado (22,5 %), lo que limita su uso en producción para esa lengua sin revisión humana.
- No se documentan sesgos conocidos ni tasas de alucinación específicas; como todo sistema ASR, puede producir transcripciones plausibles pero incorrectas en audio con ruido o solapamiento de hablantes.
- La lista completa de idiomas soportados no está disponible en la información proporcionada, lo que dificulta evaluar su cobertura real.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChatPanel/indic-transcribe-core-int8
- Modelo base: https://huggingface.co/bodhan-ai/indic-transcribe-core
- Modelo original de NVIDIA: https://huggingface.co/nvidia/canary-1b-v2
- Licencia (LICENSE.md en el repositorio): https://huggingface.co/ChatPanel/indic-transcribe-core-int8/blob/main/LICENSE.md
