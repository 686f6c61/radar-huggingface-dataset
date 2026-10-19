# someone15/gemma4-E4B-CoreML

## Resumen

`someone15/gemma4-E4B-CoreML` es una conversión al formato Core ML del modelo `google/gemma-4-E4B-it` de Google DeepMind, empaquetada para ejecución en el Neural Engine (ANE) de Apple Silicon. No es un modelo entrenado desde cero: es una redistribución cuantizada y troceada del modelo instructivo original, publicada por un tercero (`someone15`) y no por Google, con el objetivo de habilitar inferencia local en Macs y dispositivos con chip de la serie M o A sin depender de GPU dedicada ni de servicios en la nube.

El decodificador de 42 capas se divide en cuatro chunks de generación (`chunk1..4.mlmodelc`) más cuatro chunks de prefill (`prefill_chunk1..4.mlmodelc`), y los Per-Layer Embeddings (PLE) se separan en binarios propios. Esa fragmentación permite cargar el modelo por etapas y reduce el pico de memoria, a costa de una ventana de contexto limitada a 2048 tokens y una ventana de atención deslizante de 512.

Su relevancia es acotada pero concreta: cubre el nicho de inferencia on-device en el ecosistema Apple con pesos INT4/INT8 y API de streaming en Swift. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, no publica benchmarks y su model card contiene al menos una inconsistencia en el identificador del repositorio, por lo que debe tratarse como un artefacto experimental y no como una opción validada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA y Per-Layer Embeddings (PLE); 42 capas, hidden size 2560, intermediate size 10240, 8 cabezas Q / 2 cabezas KV, head dim 256 (global 512) |
| Parametros totales | no disponible (la model card no declara el recuento) |
| Parametros activos | no aplica (la informacion disponible no lo describe como MoE) |
| Longitud de contexto | 2048 tokens; ventana deslizante de 512 tokens |
| Tipos de cuantizacion | INT4 palettized en decodificador y prefill; INT8 en embeddings principales y PLE; escalas de cuantizacion en float |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (heredada del modelo base de Google) |
| Formato de pesos | Core ML (`.mlmodelc`), binarios `.bin` INT8, tablas RoPE precalculadas `.npy`, configuracion y tokenizer de Hugging Face en `hf_model/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `google/gemma-4-E4B-it`: un transformer decoder-only de 42 capas con atención por grupos (GQA) de 8 cabezas de consulta y 2 de clave/valor, dimensión de cabeza 256 y 512 para la atención global, tamaño oculto de 2560 y capa feed-forward de 10240. El vocabulario es de 262 144 tokens. El modelo combina atención deslizante con atención completa: el repositorio incluye tablas RoPE precalculadas separadas (`cos_full`/`sin_full` y `cos_sliding`/`sin_sliding`), lo que confirma un esquema híbrido local/global con ventana deslizante de 512 tokens.

La innovación estructural que explota esta conversión son los Per-Layer Embeddings (PLE), un conjunto de embeddings por capa empaquetados aparte del decodificador en binarios INT8 de entre 2 y 4 GB. Core ML no puede ejecutar el grafo completo en el ANE con memoria tan repartida, de ahí el troceado en cuatro etapas de decodificación y cuatro de prefill, más la separación de `embed_tokens_q8.bin` (~400 MB, INT8) y sus escalas. El resultado son pesos INT4 palettizados para el cómputo y INT8 para las embeddings, con `CPU_AND_NE` como unidad de cómputo objetivo.

No hay información sobre el entrenamiento: la model card no detalla número de tokens, composición del dataset, ni si hubo RLHF o DPO. El sufijo `-it` del modelo base indica que se trata de una variante ajustada para seguir instrucciones, pero el proceso concreto no está documentado en la información disponible. Tampoco se documenta el procedimiento de conversión a Core ML, el pipeline de cuantización ni las herramientas exactas empleadas más allá de `coremltools`.

## Capacidades

- Generación de texto autoregresiva con inferencia en streaming, expuesta mediante `generate(messages, maxTokens:)` en la librería CoreML-LLM.
- Conversación multi-turno en formato de mensajes con roles (`CoreMLLLM.Message`), al estar basado en un modelo instructivo.
- Ejecución completamente local y offline en el dispositivo, sin llamadas de red una vez descargados los pesos.
- Aceleración por Neural Engine mediante la unidad de cómputo `CPU_AND_NE`, con decodificación por etapas.
- Prefill separado del decode, pensado para reducir la latencia de procesamiento del prompt inicial.
- Uso desde Swift (paquete CoreMLLLM) y desde Python (`coremltools` + `huggingface_hub`) para descarga y verificación de los chunks.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio o modo de razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- **Asistentes integrados en aplicaciones macOS nativas**: el modelo se carga con `CoreMLLLM.load(repo:)` y genera en streaming, por lo que encaja en apps de notas, correo o edición de texto que necesiten resúmenes y reescritura sin salir del dispositivo; la ventana de 2048 tokens es suficiente para un documento corto o un hilo de conversación acotado.
- **Procesamiento de datos sensibles sin salida a red**: al ejecutarse íntegramente en el ANE con pesos locales, es apto para entornos donde el texto no puede enviarse a una API externa (sanidad, legal, recursos humanos internos), siempre que se asuma el riesgo de alucinación en dominios especializados.
- **Autocompletado y generación de texto en editores**: la decodificación por chunks y el prefill separado permiten mantener latencias bajas en generaciones cortas, que es el patrón típico de sugerencias inline en un editor.
- **Prototipado rápido de funcionalidades LLM en Swift**: el paquete CoreML-LLM permite tener una demo funcional en pocas líneas, útil para validar una idea de producto antes de invertir en infraestructura de servidor.
- **Clasificación y extracción de información por lotes en local**: con prompts plantilla y `maxTokens` bajo, se puede usar para etiquetar tickets, extraer campos de correos o resumir en una frase, ejecutando el proceso por la noche en un Mac de sobremesa.
- **Evaluación comparativa de cuantización INT4 sobre ANE**: el repositorio separa pesos INT4 e INT8, lo que lo hace útil como banco de pruebas para medir la degradación de calidad frente al modelo base en precisión completa, aunque no se publiquen métricas al respecto.
- **Aplicaciones iOS/iPadOS experimentales**: la orientación a chips de serie A y M abre la puerta a asistentes embebidos en apps, condicionado a que el dispositivo tenga memoria unificada suficiente y a que se resuelva la discrepancia de identificador del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la entrada de registro en free2aitools indica que los metadatos de origen están pendientes. Tampoco se documentan latencia, throughput ni consumo de memoria medidos.

## Requisitos de hardware

- **Memoria**: se recomienda un Mac con Apple Silicon y 16 GB o más de memoria unificada. El modelo usa memoria unificada, no VRAM dedicada, por lo que el concepto de VRAM no aplica.
- **Almacenamiento**: el repositorio ocupa 11,8 GB; hay que prever ese espacio en disco además de la caché de Hugging Face.
- **Sistema operativo**: macOS 15.0 Sequoia o superior.
- **Hardware objetivo**: chips de la serie M y serie A de Apple, con unidad de cómputo `CPU_AND_NE` (CPU + Neural Engine).
- **GPU dedicadas**: no aplica. No hay soporte para A100, H100 ni RTX 4090; el modelo no se ejecuta en CUDA.
- **Opciones de despliegue**: CoreML-LLM (Swift) para apps Apple; `coremltools` + `huggingface_hub` para carga y verificación en Python. No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponible. La separación en chunks de prefill y decode sugiere optimización de la fase de codificación del prompt, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| `someone15/gemma4-E4B-CoreML` | no disponible | 2048 | Core ML (INT4/INT8) | Gemma Terms of Use | 0 descargas, 0 likes; README con identificador de repo inconsistente |
| `mlboydaisuke/gemma-4-E4B-coreml` | no disponible | no disponible | Core ML | Gemma | Conversión alternativa del mismo modelo base, con repo hermano multimodal anunciado |
| `google/gemma-4-E4B-it` (modelo base) | no disponible | no disponible | safetensors (Hugging Face) | Gemma Terms of Use | Modelo oficial de Google DeepMind, referencia de calidad sin cuantizar |
| `iev6/gemma4-coreML` (proyecto GitHub) | no disponible | no disponible | Core ML (port) | no disponible | Port en curso de la familia Gemma 4 a Core ML, no un modelo publicado |

La comparación relevante es contra el modelo base: esta conversión sacrifica precisión (INT4/INT8) y longitud de contexto (2048 tokens) a cambio de ejecución local en el ANE. Frente a `mlboydaisuke/gemma-4-E4B-coreml`, las diferencias de implementación no están documentadas en la información disponible; la elección entre ambos solo puede hacerse por prueba empírica.

## Limitaciones y advertencias

- **Contexto corto**: 2048 tokens con ventana deslizante de 512 limita tareas de documento largo, RAG con muchos fragmentos y conversaciones extensas.
- **Pérdida por cuantización**: pesos INT4 palettizados e embeddings INT8 implican degradación de calidad frente al modelo base en precisión completa; no se publican métricas que cuantifiquen esa pérdida.
- **Sin evidencia de rendimiento**: 0 descargas y 0 likes, sin benchmarks ni evaluaciones de terceros. No hay base para afirmar que funciona correctamente en todos los dispositivos objetivo.
- **Inconsistencia en la documentación**: el ejemplo en Swift usa `repo: "someone15/gemma-4-E4B-coreml"`, mientras que el identificador real es `someone15/gemma4-E4B-CoreML`; el código de ejemplo tal cual puede fallar al resolver la descarga.
- **Mantenimiento de un solo autor**: es una conversión no oficial de un tercero, sin compromiso de actualización ni soporte. La fecha de actualización del repositorio es 2026-10-19.
- **Idiomas desconocidos**: no se declara cobertura lingüística; no se puede asumir un rendimiento correcto en castellano sin evaluarlo.
- **Licencia**: se aplican los Gemma Terms of Use de Google, no una licencia permisiva tipo Apache o MIT. Cualquier uso comercial o redistribución debe verificar el cumplimiento de dichos términos y de la Gemma Prohibited Use Policy.
- **Riesgo de alucinación**: inherente a un modelo de 4B efectivos cuantizado; en dominios factuales o jurídicos requiere verificación humana.
- **Dependencia del ecosistema Apple**: sin soporte CUDA ni de runtimes estándar (vLLM, llama.cpp, Ollama), lo que bloquea su uso en servidores Linux y limita la portabilidad.
- **Vocabulario grande**: 262 144 tokens implican un `embed_tokens_q8.bin` de ~400 MB solo para embeddings, más 2-4 GB de PLE; en equipos de 16 GB conviene medir el consumo real antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/someone15/gemma4-E4B-CoreML
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Librería CoreML-LLM (Swift): https://github.com/john-rocky/CoreML-LLM
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Conversión alternativa del mismo modelo base: https://huggingface.co/mlboydaisuke/gemma-4-E4B-coreml
- README de la conversión alternativa: https://huggingface.co/mlboydaisuke/gemma-4-E4B-coreml/blob/main/README.md
- Proyecto de port a Core ML: https://github.com/iev6/gemma4-coreML
- Entrada en registro de terceros: https://free2aitools.com/model/someone15/gemma4-e4b-coreml
