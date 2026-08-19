# Ishowbackup/PINQWEN-3.5-9B-1M-BF16

## Resumen

PINQWEN-3.5-9B-1M es un modelo de razonamiento de 9.650 millones de parametros desarrollado por Blackfrost AI, construido sobre la arquitectura Qwen 3.5 9B y distribuido mediante destilacion de razonamiento multi-maestro (metodo "The Void"). Su principal diferenciador es una ventana de contexto de un millon de tokens, conseguida mediante extension YaRN sobre un backbone hibrido de atencion lineal gated, lo que permite procesar codebases completas o libros enteros de una sola vez manteniendo un coste computacional contenido para su tamano.

El modelo combina capacidades de razonamiento visible (bloques de pensamiento `<think>`), vision (encoder multimodal integrado) y generacion de codigo, todo bajo licencia Apache 2.0. Se presenta como un modelo "uncensored", es decir, sin los rechazos habituales de los modelos alineados, lo que implica que el usuario asume la responsabilidad de su uso. Este repositorio concreto contiene los pesos en BF16 (referencia), aunque existen variantes en NVFP4 para Blackwell y una escalera completa de cuantizaciones GGUF con cabeza de decodificacion especulativa multi-token (MTP).

Cabe destacar que el repositorio esta publicado por el usuario Ishowbackup y no por la organizacion Blackfrost AI mencionada en la model card, y que a fecha de publicacion no cuenta con descargas ni validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal gated (base Qwen 3.5 9B) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.000.000 tokens (extension YaRN) |
| Tipos de cuantizacion | BF16 (referencia), NVFP4 (Blackwell), GGUF (escalera completa con MTP) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), GGUF, NVFP4 |

## Arquitectura y entrenamiento

PINQWEN-3.5-9B-1M parte del modelo base Qwen 3.5 9B y lo somete a un proceso de destilacion de razonamiento multi-maestro denominado "The Void", en el que un panel de modelos frontier actua como profesores para transferir capacidades de chain-of-thought al modelo alumno. El resultado es un modelo que genera bloques de pensamiento `<think>` antes de responder, haciendo el razonamiento transparente e inspeccionable.

La arquitectura incorpora un backbone hibrido con atencion lineal gated, disenado para hacer eficiente el procesamiento de contextos muy largos, y una extension YaRN que amplia la ventana nativa de 262.144 tokens del Qwen 3.5 9B hasta el millon de tokens. Ademas, incluye un encoder de vision completo (capacidad image-text-to-text) y una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa para acelerar la inferencia. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas adicionales de alineacion como RLHF o DPO.

## Capacidades

- Razonamiento visible: genera bloques `<think>` con chain-of-thought antes de cada respuesta, lo que permite inspeccionar el proceso de razonamiento.
- Generacion de codigo: afinado para ingenieria de software, resolucion de problemas paso a paso y explicaciones tecnicas precisas.
- Vision y lenguaje: integra un encoder de vision completo, aceptando entradas mixtas de imagen y texto.
- Contexto ultralargo: procesa hasta 1.000.000 de tokens en una sola pasada, suficiente para codebases completas o libros enteros.
- Respuestas sin censura: disenado para seguir instrucciones directamente sin rechazos sistematicos.
- Decodificacion especulativa: la cabeza MTP permite acelerar la generacion en entornos compatibles.
- Multilingue: no se especifican idiomas soportados en la documentacion disponible, aunque la base Qwen 3.5 es multilingue.

## Casos de uso

- Analisis de codebases completas: con un millon de tokens de contexto, el modelo puede recibir un repositorio entero y responder preguntas sobre arquitectura, dependencias o bugs sin necesidad de chunking.
- Revision de documentacion extensa: procesamiento de manuales, especificaciones tecnicas o libros completos para extraer informacion y responder consultas con el contexto integro disponible.
- Asistente de programacion con razonamiento explicito: el bloque `<think>` permite auditar el proceso de razonamiento del modelo antes de que genere codigo, util en entornos de desarrollo donde la trazabilidad importa.
- Analisis multimodal de documentacion tecnica: combinar diagramas, capturas de pantalla y texto en una misma consulta para entender sistemas documentados de forma heterogenea.
- Chat conversacional de largo recorrido: mantener conversaciones con meses de historial sin perder el contexto, gracias a la ventana de un millon de tokens.
- Procesamiento de logs y trazas: ingerir archivos de log de gran tamano para identificar errores, patrones anomalos o cuellos de botella en sistemas de produccion.
- Investigacion y sintesis de literatura: analizar multiples papers o articulos completos en una sola pasada para generar resumenes comparativos o detectar contradicciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de MMLU, HumanEval, GSM8K ni otros tests estandar, y la ausencia de descargas y validacion comunitaria impide contrastar el rendimiento real del modelo.

## Requisitos de hardware

- BF16 (pesos de referencia): aproximadamente 19,3 GB de VRAM solo para los pesos, por lo que se recomienda una GPU con 24 GB o mas (RTX 4090, A100 40 GB, H100). Con overhead de activaciones y KV cache para contextos largos, puede requerir mas.
- GGUF Q4_K_M: estimado en 6-7 GB de VRAM, cabe en GPUs de consumo con 8 GB (RTX 3060, RTX 4060).
- GGUF Q8: estimado en 10-11 GB de VRAM, recomendado para GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080).
- NVFP4: orientado a GPUs Blackwell (B200, RTX 50 series), con cuantizacion de 4 bits optimizada.
- Despliegue: transformers (HuggingFace) para BF16, llama.cpp u Ollama para GGUF, vLLM o TGI para serving en produccion.
- Latencia y throughput: no disponibles. La cabeza MTP de decodificacion especulativa deberia mejorar la velocidad de generacion en entornos compatibles, pero no hay mediciones publicadas.

Nota: los requisitos de VRAM para GGUF son estimaciones basadas en el tamano estandar de modelos de 9B; los valores exactos dependen de la cuantizacion concreta y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Razonamiento | Licencia |
|---|---|---|---|---|---|
| PINQWEN-3.5-9B-1M | 9,65B | 1.000.000 | Si | Si (`<think>`) | Apache 2.0 |
| Qwen/Qwen3.5-9B | 9B | 262.144 | Si | Parcial | Apache 2.0 |
| Qwen2.5-7B-Instruct-1M | 7,6B | 1.000.000 | No | No | Apache 2.0 |

PINQWEN-3.5-9B-1M se diferencia de su base (Qwen 3.5 9B) principalmente por la ventana de contexto ampliada (1M frente a 262K), el afinamiento para razonamiento visible y la eliminacion de rechazos. Frente a Qwen2.5-7B-Instruct-1M, que tambien ofrece un millon de tokens, PINQWEN anade capacidades de vision y razonamiento, aunque carece del historial de validacion y benchmarks publicos de los modelos oficiales de Qwen.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no hay datos de rendimiento que permitan evaluar la calidad real del modelo frente a alternativas establecidas.
- Sin validacion comunitaria: el repositorio tiene cero descargas y cero likes; no hay experiencias de uso publicadas que confirmen las afirmaciones de la model card.
- Origen no verificado: el repositorio esta publicado por Ishowbackup, no por Blackfrost AI, la organizacion mencionada en la model card. No se puede confirmar la autenticidad del proceso de entrenamiento descrito.
- Modelo uncensored: al eliminar los rechazos de seguridad, el modelo puede generar contenido inapropiado, peligroso o ilegal si se le solicita. El usuario asume toda la responsabilidad.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar informacion, especialmente en contextos muy largos donde la atencion se diluye.
- Idiomas no documentados: no se especifican los idiomas soportados, lo que dificulta evaluar su utilidad fuera del ingles.
- Contexto de un millon de tokens: aunque la ventana es tecnicamente de 1M, el rendimiento real en esa longitud no esta verificado y puede degradarse.
- Requisitos de hardware elevados para BF16: la version de referencia necesita 24 GB de VRAM, fuera del alcance de muchas GPUs de consumo.
- Repositorios referenciados no localizables: la model card menciona repositorios oficiales de Blackfrost AI (NVFP4 y GGUF) que no se encuentran publicados; solo existen las versiones BF16 de Ishowbackup y las GGUF de mradermacher.

## Enlaces

- Repositorio HuggingFace (BF16): https://huggingface.co/Ishowbackup/PINQWEN-3.5-9B-1M-BF16
- GGUF (mradermacher): https://huggingface.co/mradermacher/PINQWEN-3.5-9B-1M-BF16-GGUF
- GGUF con imatrix (mradermacher): https://huggingface.co/mradermacher/PINQWEN-3.5-9B-1M-BF16-i1-GGUF
- Qwen 3.5 9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Qwen 3.5 9B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
