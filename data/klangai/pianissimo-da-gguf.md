# KlangAI/pianissimo-da-gguf

## Resumen

Pianissimo-da-gguf es la distribución en formato GGUF del modelo de reconocimiento automático del habla (ASR) KlangAI/pianissimo-da, especializado en danés. Lo desarrolla KlangAI y está pensado para su uso con transcribe.cpp, un motor de inferencia que permite ejecutar el modelo en CPU o GPU de un ordenador convencional sin necesidad de Python, PyTorch ni NeMo. Esta versión cuantizada mantiene la arquitectura y el tokenizador del modelo original (Parakeet v3), de modo que solo cambian los pesos.

El modelo resuelve la transcripción de audio en danés con una ventana de atención local de 256 frames de encoder (unos 20 segundos por lado), lo que permite procesar grabaciones de cualquier duración en una sola llamada. Su relevancia actual radica en que ofrece una alternativa ligera (desde 485 MB en Q4_K_M) con una tasa de error de palabras (WER) de en torno al 6,5 % en el conjunto de prueba FLEURS danés, prácticamente idéntica a la del modelo original en fp32 (2,51 GB).

La ficha se centra en la versión GGUF, que cuenta con 627.052.166 parámetros totales y se distribuye bajo licencia CC BY 4.0. Al ser un modelo solo para danés y de tipo ASR, sus capacidades se limitan a la transcripción de voz, sin generación de texto libre ni razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificación TDT (Token-and-Duration Transducer); arquitectura Parakeet v3 |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Atención local de 256 frames de encoder (aprox. 20 segundos por lado); admite audio de cualquier duración en una sola llamada |
| Tipos de cuantizacion | Q8_0, Q5_K_M, Q4_K_M, F16, F32 |
| Idiomas soportados | Danés (da) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer con decodificación TDT (Token-and-Duration Transducer), la misma que Parakeet v3. Según la model card, Pianissimo conserva la arquitectura y el tokenizador de Parakeet v3, por lo que el conversor de transcribe.cpp puede reutilizar sus ajustes estándar y solo es necesario sustituir los pesos. La atención es local, con 256 frames de encoder (aproximadamente 20 segundos) a cada lado, lo que permite procesar grabaciones de cualquier longitud en una única llamada sin truncar el contexto.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Los pesos GGUF se obtuvieron a partir del checkpoint original publicado mediante el script `convert-parakeet.py` de transcribe.cpp y se cuantizaron con la herramienta `transcribe-quantize` (commit `5700f12` de transcribe.cpp).

## Capacidades

- Transcripción automática de voz en danés (ASR).
- Procesamiento de audio de cualquier duración en una sola llamada gracias a la atención local.
- Ejecución en CPU o GPU sin Python, PyTorch ni NeMo, mediante transcribe.cpp.
- Compatibilidad con el tokenizador y la arquitectura de Parakeet v3.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No es multilingüe: solo danés.
- No dispone de modo thinking, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en danés: el modelo procesa grabaciones completas en una sola llamada gracias a su atención local, sin necesidad de segmentar el audio manualmente.
- Subtitulado automático de vídeo en danés: la transcripción se puede generar con transcribe.cpp en CPU y posteriormente alinear con la pista de vídeo.
- Archivado y búsqueda de contenido audiovisual: convertir audio histórico en danés a texto indexable para sistemas de búsqueda interna.
- Atención al cliente basada en voz: transcripción de llamadas grabadas para su análisis y clasificación posterior.
- Investigación lingüística y corpus orales: generación de transcripciones para estudios del danés hablado con un WER en torno al 6,5 % en FLEURS.
- Despliegue en entornos sin Python ni GPU dedicada: al ejecutarse con transcribe.cpp en CPU, encaja en servidores modestos o equipos de escritorio, con la variante Q4_K_M de 485 MB como opción de bajo consumo de disco y memoria.
- Prototipado rápido de aplicaciones de voz en danés: la instalación se reduce a descargar un archivo GGUF y ejecutar el binario `transcribe-cli`.

## Benchmarks y rendimiento

Resultados de WER (%) sobre 200 clips de prueba del conjunto FLEURS en danés, según la model card:

| Archivo | Tamano | WER (%) | Transcripciones idénticas al original (de 200) |
|---|---:|---:|---:|
| Original fp32 (NeMo) | 2,51 GB | 6,5 | — |
| pianissimo-da-Q8_0.gguf | 740 MB | 6,4 | 183 |
| pianissimo-da-Q5_K_M.gguf | 549 MB | 6,5 | 159 |
| pianissimo-da-Q4_K_M.gguf | 485 MB | 6,5 | 142 |
| pianissimo-da-F16.gguf | 1,26 GB | 6,6 | 187 |
| pianissimo-da-F32.gguf | 2,51 GB | 6,6 | 188 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo puede ejecutarse en CPU, por lo que la memoria necesaria se aproxima al tamaño del archivo GGUF elegido (485 MB en Q4_K_M, 740 MB en Q8_0, 1,26 GB en F16, 2,51 GB en F32).
- GPU recomendadas: no se especifican modelos concretos; transcribe.cpp puede usar CPU o GPU de un ordenador convencional.
- Cabe en GPU de consumo: sí, dado que las variantes cuantizadas ocupan menos de 1 GB en Q4_K_M y Q8_0.
- Opciones de despliegue: transcribe.cpp (binario `transcribe-cli`); para Python se recomienda el modelo original con NeMo o las versiones ONNX; en Mac, las versiones MLX en GPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (FLEURS da) | Licencia | Formato |
|---|---:|---|---:|---|---|
| KlangAI/pianissimo-da-gguf (Q8_0) | 627 M | Atención local 256 frames (~20 s por lado) | 6,4 | CC BY 4.0 | GGUF |
| KlangAI/pianissimo-da (original fp32) | 627 M | Atención local 256 frames (~20 s por lado) | 6,5 | CC BY 4.0 | NeMo |
| KlangAI/pianissimo-da-onnx | no disponible | no disponible | no disponible | CC BY 4.0 | ONNX |
| KlangAI/pianissimo-da-mlx-8bit | no disponible | no disponible | no disponible | CC BY 4.0 | MLX |

No se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo admite danés; no es un modelo multilingüe.
- Es exclusivamente un modelo ASR: no genera texto libre, no razona y no soporta tool calling.
- Riesgo de alucinación y errores de transcripción inherentes a los modelos ASR, con un WER en torno al 6,5 % en FLEURS; el rendimiento puede degradarse en audio con ruido, acentos marcados o dominios alejados del conjunto de prueba.
- La atención local de 256 frames implica que el modelo procesa el audio por ventanas; aunque admite grabaciones de cualquier duración en una llamada, la coherencia entre ventanas depende de la implementación de transcribe.cpp.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar a Klang según el BibTeX de la model card.
- Requiere pasar siempre el parámetro `-l da` en transcribe.cpp.
- Para uso en Python se recomienda el modelo original con NeMo o las versiones ONNX, no esta versión GGUF.
- No se han publicado datos sobre sesgos específicos del modelo en la información disponible.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/KlangAI/pianissimo-da-gguf
- Modelo original: https://huggingface.co/KlangAI/pianissimo-da
- Versiones ONNX: https://huggingface.co/KlangAI/pianissimo-da-onnx
- Versiones MLX: https://huggingface.co/KlangAI/pianissimo-da-mlx-8bit
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- README de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp#readme
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
