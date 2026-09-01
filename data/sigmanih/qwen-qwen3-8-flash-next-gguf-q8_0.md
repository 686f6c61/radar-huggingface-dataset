# sigmanih/Qwen-Qwen3.8-Flash-Next-GGUF-Q8_0

## Resumen

Qwen-Qwen3.8-Flash-Next-GGUF-Q8_0 es una cuantización en formato GGUF (Q8_0) del modelo Qwen3.8-Flash-Next, publicada por el usuario sigmanih a través de su herramienta Sigma Studio. El modelo base, desarrollado por Qwen, es un Mixture-of-Experts ultra disperso de 125B parámetros totales (más 51B de embeddings N-gram) con solo 6B parámetros activos por token, construido sobre la nueva arquitectura Qwen4. Su ventana de contexto alcanza los 262.144 tokens y está diseñado para razonamiento avanzado, matemáticas multi-paso y tareas de investigación profunda.

Esta versión cuantizada permite ejecutar el modelo en hardware de consumo, aunque con requisitos elevados de memoria (175 GB en disco). El autor reporta velocidades de 11,3 tokens/s en una RTX 5070 Ti con 15,9 GB de VRAM, lo que indica que es posible una ejecución parcial en GPU con descarga de capas a CPU. La relevancia actual radica en que Qwen3.8-Flash-Next supera según Qwen a Claude-4.6-Opus (Max) en varias tareas, y esta cuantización facilita su despliegue local para desarrolladores e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (MoE ultra disperso con Gated DeltaNet y Qwen Sparse Attention) |
| Parametros totales | 125B + 51B embeddings N-gram (segun Qwen); el autor declara ~292.1B activos, dato no verificado |
| Parametros activos | 6B por token (segun Qwen); el autor indica ~292.1B, inconsistente con la arquitectura oficial |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | ingles, italiano (segun el card); el modelo base soporta mas idiomas |
| Licencia | other (el card YAML indica "other"; el badge del autor muestra Apache-2.0, pero no es vinculante) |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next emplea una arquitectura MoE ultra dispersa con 48 capas y dimensión oculta de 2560. Combina cuatro innovaciones principales: Gated DeltaNet (GDN) en tres de cada cuatro capas para comprimir el historial, y Qwen Sparse Attention (QSA) en la cuarta capa para recuperación precisa de contexto largo. Además, incorpora una tabla de embeddings N-gram de 51B parámetros que complementa al modelo principal. Según Qwen, el entrenamiento requiere aproximadamente 1/9 del coste de Qwen3.7-Plus, manteniendo o superando sus capacidades en código y razonamiento. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre técnicas de alineación (RLHF/DPO) en las fuentes consultadas.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con especial fortaleza en matematicas avanzadas (MATH, GSM8K) y logica compleja (BIG-Bench Hard).
- Generacion de codigo Python: obtiene 100% en HumanEval y 89% en MBPP en la evaluacion parcial del autor.
- Capacidades multimodales: el modelo base soporta entrada de imagen y texto, aunque la cuantizacion GGUF puede limitar el procesamiento de vision segun el runtime utilizado.
- Ventana de contexto de 262K tokens, adecuada para analisis de documentos largos y conversaciones multi-turno extensas.
- Soporte de tool calling y function calling, segun la documentacion del modelo base (no verificado en esta cuantizacion).
- Razonamiento tipo "thinking mode" disponible en el modelo base, aunque la cuantizacion puede afectar su rendimiento.

## Casos de uso

- Investigacion academica y analisis de documentos extensos: su contexto de 262K tokens permite procesar articulos cientificos completos, tesis o informes tecnicos de cientos de paginas en una sola pasada, extrayendo conclusiones y resumiendo secciones.
- Resolucion de problemas matematicos avanzados: con 78% en MATH y 89% en GSM8K (evaluacion parcial), es util para verificar demostraciones, generar soluciones paso a paso o asistir en investigacion cuantitativa.
- Generacion y revision de codigo en entornos de desarrollo: su alto rendimiento en HumanEval (100%) y MBPP (89%) lo hace adecuado para tareas de programacion asistida, generacion de tests unitarios y refactorizacion de codigo.
- Atencion al cliente con contexto largo: puede mantener conversaciones coherentes a lo largo de multiples interacciones, recordando detalles de la conversacion gracias a su ventana de 262K tokens, aunque su despliegue requiere hardware potente.
- Analisis de codigo legal o normativo: la capacidad de procesar documentos largos y razonar sobre ellos permite extraer clausulas, comparar versiones o identificar inconsistencias en contratos extensos.
- Educacion y tutoria: puede explicar conceptos complejos de ciencias, matematicas o programacion con razonamiento detallado, adaptandose al nivel del estudiante en conversaciones prolongadas.

## Benchmarks y rendimiento

El autor proporciona una evaluacion parcial (100 preguntas de un subconjunto de cada dataset) realizada con SigmaEngine en GPU, con temperatura 0.0 y seed 42. Los resultados no son comparables con ejecuciones completas de los benchmarks.

| Dataset | Correctos / Total | Accuracy |
|---|---|---|
| ARC-Challenge | 9 / 9 | 100% |
| BIG-Bench Hard | 6 / 7 | 86% |
| GPQA | 5 / 9 | 56% |
| GSM8K | 8 / 9 | 89% |
| HellaSwag | 5 / 9 | 56% |
| HumanEval | 7 / 7 | 100% |
| MATH | 7 / 9 | 78% |
| MBPP | 8 / 9 | 89% |
| MMLU | 11 / 14 | 79% |
| MMLU-Pro | 6 / 9 | 67% |
| TruthfulQA | 8 / 9 | 89% |
| **Total** | **80 / 100** | **80%** |

No se han publicado resultados de benchmarks completos para esta cuantizacion especifica. Los datos del modelo base (sin cuantizar) indican que supera a Claude-4.6-Opus (Max) en varias tareas, segun Qwen, pero no se dispone de cifras concretas en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q8_0 ocupa 175,28 GB en disco. Para cargar completamente en GPU se necesitarian al menos 180 GB de VRAM (p. ej., 2x A100 80GB o 2x H100 80GB).
- En GPU de consumo: el autor midio 11,3 tok/s de decodificacion en una RTX 5070 Ti con 15,9 GB de VRAM, lo que implica que solo una parte de las capas se cargan en GPU y el resto se procesa en CPU (uso de `-ngl 99` en llama.cpp). La velocidad depende criticamente del ancho de banda de memoria del sistema.
- Opciones de despliegue: llama.cpp (compatible con GGUF), Sigma Studio (herramienta del autor), y potencialmente vLLM o TGI si se convierten los pesos a safetensors, aunque no se ha verificado.
- Latencia: 11,3 tok/s en decodificacion de un solo stream (medido en RTX 5070 Ti); 5 tok/s en procesamiento de prompt; 4,1 tok/s de throughput agregado con varias peticiones concurrentes. Estos valores no son extrapolables a otros hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B N-gram | 6B | 262K | Apache-2.0 (segun Qwen) | safetensors |
| Qwen-Qwen3.8-Flash-Next-GGUF-Q8_0 (este) | 125B + 51B N-gram (segun base) | 6B (segun base) | 262K | other | GGUF Q8_0 |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre esta cuantizacion y el modelo base o alternativas como Claude-4.6-Opus. La comparativa se limita a caracteristicas tecnicas.

## Limitaciones y advertencias

- La cuantizacion Q8_0 introduce una ligera perdida de precision respecto al modelo original en coma flotante, que puede afectar a tareas de razonamiento numerico o generacion de codigo muy sensible.
- Los benchmarks publicados por el autor son parciales (100 preguntas en total) y no son comparables con ejecuciones completas; los resultados deben interpretarse con cautela.
- La licencia "other" no especifica claramente los terminos de uso comercial; se recomienda contactar con el autor o revisar la licencia del modelo base antes de usar en produccion.
- El modelo declara soporte solo para ingles e italiano en el card, aunque el modelo base de Qwen soporta mas idiomas; el rendimiento en otros idiomas no esta verificado.
- El requisito de 175 GB de almacenamiento y la necesidad de una maquina con mucha RAM (o VRAM) limita su uso a entornos con hardware potente; en GPU de consumo la velocidad es baja (11 tok/s) y depende del ancho de banda de memoria del sistema.
- No se ha verificado el soporte de tool calling, vision o thinking mode en esta cuantizacion especifica; el autor no proporciona pruebas de ello.
- El dato de "292.1B parametros activos" declarado por el autor contradice la documentacion oficial de Qwen (6B activos); es probable un error en la model card, pero no se puede confirmar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sigmanih/Qwen-Qwen3.8-Flash-Next-GGUF-Q8_0
- Repositorio Sigma Studio: https://github.com/Sigmanih/SigmaStudio
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guia de ejecucion local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
