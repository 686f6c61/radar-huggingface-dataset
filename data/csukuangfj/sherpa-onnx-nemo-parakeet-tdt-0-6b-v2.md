# csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2

## Resumen

`csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2` es la exportación a ONNX del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v2`, realizada por el proyecto sherpa-onnx. Los pesos originales fueron entrenados por NVIDIA en formato NeMo (`.nemo`) y este paquete los redistribuye como grafos ONNX listos para inferencia con la librería sherpa-onnx, sin necesidad de instalar el framework NeMo ni PyTorch. Se trata de un transductor offline (encoder, decoder y joiner) para audio mono a 16 kHz en inglés.

El modelo resuelve el problema de la transcripción de voz a texto en entornos de producción donde se prioriza el despliegue ligero: aplicaciones de escritorio, móviles, sistemas embebidos o servicios en CPU sin GPU. Al estar exportado a ONNX, se puede ejecutar con sherpa-onnx en C++, Python, C#, Java, Kotlin, Swift, Go, Rust, Node.js y otras plataformas, lo que lo convierte en una pieza práctica para pipelines de subtitulado, dictado y transcripción por lotes.

La relevancia actual radica en que es la variante v2 del modelo Parakeet TDT de 0,6 mil millones de parámetros, especializada exclusivamente en inglés y con un rendimiento en WER que, según las mediciones del propio proyecto exportador, supera a las variantes v3 y Ultra en esa lengua. La licencia CC BY 4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor NeMo (encoder + decoder + joiner) con decodificación TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6 mil millones (600M, según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana fija; se recomienda dividir el audio en fragmentos de 15-20 s cortados en silencios |
| Tipos de cuantizacion | fp32 (paquete principal) e int8 (paquete `-int8`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`encoder.onnx` + `encoder.weights`, `decoder.onnx`, `joiner.onnx`; variantes `.int8.onnx`) |

## Arquitectura y entrenamiento

El modelo es un transductor NeMo con decodificación TDT (Token-and-Duration Transducer), una variante del transductor clásico en la que el joiner predice simultáneamente el token y su duración, lo que permite saltar frames y reduce el coste computacional de la decodificación. La arquitectura consta de tres componentes exportados por separado a ONNX: el encoder (con sus pesos externos en `encoder.weights`), el decoder y el joiner. Los metadatos del encoder incluyen `tdt` en el campo `url`, lo que indica a sherpa-onnx que debe cargar el joiner como TDT y no como transductor simple.

Los pesos originales fueron entrenados por NVIDIA; el paquete aquí descrito es únicamente una exportación realizada por el proyecto sherpa-onnx a partir del checkpoint `.nemo`. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF o ajuste fino supervisado. El script de exportación está disponible en el repositorio de sherpa-onnx (`scripts/nemo/parakeet-tdt-0.6b-v2/`).

## Capacidades

- Transcripción de voz a texto en inglés para audio mono a 16 kHz.
- Decodificación offline por lotes mediante `OfflineRecognizer.from_transducer` de sherpa-onnx.
- Ejecución en CPU sin GPU, con variante int8 para menor huella de memoria y mayor velocidad.
- Integración multiplataforma a través de los bindings de sherpa-onnx (Python, C++, C#, Java, Kotlin, Swift, Go, Rust, Node.js, entre otros).
- No soporta identificación de idioma: transcribe, pero no informa de la lengua detectada.
- No se documentan capacidades de tool calling, agentes, visión, audio multimodal ni modo de razonamiento; es un modelo puramente ASR.

## Casos de uso

- **Subtitulado automático de vídeo en inglés**: el modelo transcribe audio de 16 kHz y puede alimentar un pipeline que genere subtítulos en formato SRT, dividiendo previamente el audio en fragmentos de 15-20 s cortados en silencios para evitar la degradación observada en audio largo.
- **Dictado por voz en aplicaciones de escritorio**: al ejecutarse en CPU con la variante int8, puede integrarse en editores de texto o herramientas de productividad que necesiten transcripción local sin enviar audio a la nube.
- **Transcripción por lotes de reuniones y llamadas**: procesamiento offline de grabaciones completas, troceadas en silencios, para generar actas o búsquedas indexadas sobre el texto.
- **Sistemas embebidos y dispositivos de borde**: la exportación ONNX y la variante int8 permiten desplegar ASR en dispositivos con recursos limitados donde no cabe un framework completo como NeMo.
- **Accesibilidad para personas con discapacidad auditiva**: generación de texto en tiempo casi real a partir de micrófono, con la ventaja de que no requiere conexión a servicios externos.
- **Preprocesado de datasets de voz**: transcripción masiva de corpus en inglés para etiquetado, minería de contenido o construcción de índices de búsqueda sobre archivos de audio.
- **Integración en pipelines de CI/CD para pruebas de voz**: validación automática de grabaciones de prueba en aplicaciones de voz, usando el modelo como oráculo de transcripción dentro de tests.

## Benchmarks y rendimiento

Los datos disponibles son mediciones propias del proyecto sherpa-onnx sobre el split de test de FLEURS, con 300 clips deterministas por idioma, sin puntuación ni mayúsculas, y decodificados con el mismo harness para los tres modelos comparados. No son directamente comparables con los benchmarks publicados por NVIDIA.

| Modelo | Inglés (WER %) | Inglés, clips ≤ 15 s (WER %) |
|---|---|---|
| v2 (este paquete) | 6,48 | 6,42 |
| v3 | 11,16 | 11,01 |
| Ultra | 8,51 | 8,56 |

En el resto de idiomas que v2 no cubre, v3 mide 6,84 en alemán, 8,69 en francés y 4,55 en español; Ultra mide 5,20, 7,48 y 3,81 respectivamente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- **VRAM estimada**: no se proporciona un dato explícito; el repositorio ocupa 3,3 GB, lo que incluye ambos paquetes (fp32 e int8). La variante int8 reduce sustancialmente la memoria respecto a fp32.
- **GPU recomendadas**: no se especifican; el modelo está pensado para ejecución en CPU mediante sherpa-onnx. Cualquier GPU compatible con ONNX Runtime podría usarse, pero no hay datos de rendimiento en GPU.
- **Consumer GPU**: al estar orientado a CPU, no requiere GPU de consumo; cabe en equipos de escritorio convencionales con la variante int8.
- **Opciones de despliegue**: sherpa-onnx (Python, C++, C#, Java, Kotlin, Swift, Go, Rust, Node.js), con ONNX Runtime como backend. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles de forma numérica. El autor reporta que en una prueba de estrés en una máquina Linux con CPU, el troceado en silencios en fragmentos de 15 s alcanzó un WER del 12,71 % con +139 MB de RSS sobre la línea base del modelo cargado.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER inglés (FLEURS, harness sherpa-onnx) | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v2 (este paquete) | 600M | inglés | 6,48 | CC BY 4.0 | ONNX fp32 / int8 |
| parakeet-tdt-0.6b-v3 | 600M (según nombre) | multilingüe (incluye alemán, francés, español) | 11,16 | no disponible en la información | ONNX int8 |
| parakeet Ultra | no disponible | multilingüe | 8,51 | no disponible en la información | ONNX |

La comparativa se limita a las variantes del mismo modelo base mencionadas en la model card; no se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- **Audio largo**: decodificar una grabación completa como un solo clip degrada gravemente la calidad y aumenta el consumo de memoria. En la prueba de estrés, la decodificación de clip completo fue inestable a partir de unos 69 s y truncó 57 de 141 palabras a los 68,7 s. Se debe trocear en silencios en fragmentos de 15-20 s; nunca usar ventanas de longitud fija.
- **Idioma**: el modelo es exclusivamente inglés; no transcribe otros idiomas ni identifica la lengua del audio.
- **Entrada muy silenciosa**: afectada por un problema del frontend registrado en `k2-fsa/sherpa-onnx#4024`; se recomienda normalizar la ganancia antes de la inferencia.
- **Diferencias fp32 vs int8**: la variante int8 es más pequeña y rápida y es la recomendada para la mayoría de usuarios; la fp32 es la referencia y su salida puede diferir ligeramente.
- **Licencia**: CC BY 4.0 permite uso comercial con atribución a NVIDIA como autor de los pesos y al proyecto sherpa-onnx como autor de la exportación. NVIDIA no respalda este paquete.
- **Riesgo de alucinación**: no se documenta explícitamente en la información disponible, pero es un riesgo inherente a los modelos ASR en audio ruidoso o con silencios largos.
- **Sesgos**: no se documentan sesgos específicos en la información proporcionada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2)
- [Modelo base en Hugging Face](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2)
- [Script de exportación](https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/nemo/parakeet-tdt-0.6b-v2)
- [Workflow de exportación](https://github.com/k2-fsa/sherpa-onnx/blob/master/.github/workflows/export-nemo-parakeet-tdt-0.6b-v2.yaml)
- [Licencia del código de sherpa-onnx (Apache-2.0)](https://github.com/k2-fsa/sherpa-onnx/blob/master/LICENSE)
- [Licencia CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- [Documentación de modelos NeMo en sherpa-onnx](https://k2-fsa.github.io/sherpa/onnx/nemo/index.html)
- [Issue del frontend sobre audio silencioso](https://github.com/k2-fsa/sherpa-onnx/issues/4024)
- [Variante v3 int8 en Hugging Face](https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8)
