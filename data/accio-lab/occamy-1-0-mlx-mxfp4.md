# Accio-Lab/occamy-1.0-MLX-mxfp4

## Resumen

Occamy-1.0-MLX-mxfp4 es un checkpoint cuantizado en formato nativo MLX del modelo Occamy-1.0, desarrollado por Accio-Lab. Se trata de una versión de 4 bits con cuantización mxfp4 (group size 32) derivada directamente desde BF16, pensada para ejecutar inferencia de un modelo de mezcla de expertos (MoE, etiquetado como `qwen3_5_moe`) sobre hardware Apple Silicon mediante la librería MLX. El modelo base se presenta en el paper "Occamy-1.0: Open Pareto-frontier 35B Intelligence for Co-work" y este artefacto concreto es una de las múltiples variantes de cuantización publicadas por el mismo autor (8bit, 6bit, 5bit, 4bit, 3bit, mxfp8, mxfp4 y nvfp4).

El checkpoint declara 34.660.608.768 parámetros totales en sus ficheros safetensors y ocupa 18,43 GB en disco (18.426.513.876 bytes), con gates de router y de expertos compartidos cuantizados en 8 bits afines con group size 64. Es un artefacto solo de texto: la visión y el MTP (multi-token prediction) se distribuyen por separado. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que permite desplegar un modelo de ~35B parámetros en formato de 4 bits sobre Mac con memoria unificada, usando pesos nativos MLX que se recargan con `mlx-lm` estándar sin adaptador. No obstante, el propio autor lo etiqueta como "candidate release": la aceptación en Apple Metal está pendiente y las pruebas realizadas hasta la fecha se han limitado a Linux con MLX CUDA sobre NVIDIA B200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), etiquetada como `qwen3_5_moe`; transformer con expertos enrutados y expertos compartidos |
| Parametros totales | 34.660.608.768 (34,66B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las validaciones publicadas usan contexto 512) |
| Tipos de cuantizacion | mxfp4 nativo MLX, 4 bits, group size 32 (pesos); gates de router y expertos compartidos en affine 8 bits, group size 64. La familia incluye 8bit, 6bit, 5bit, 4bit, 3bit, mxfp8, mxfp4 y nvfp4 |
| Idiomas soportados | no disponible (los fixtures de validación cubren instrucciones en inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors nativos MLX (no GGUF); 18.426.513.876 bytes, 18,43 GB / 17,161 GiB |

Otros datos de formato: revisión de origen `8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8`, exportado y validado con `mlx 0.32.2`, `mlx-lm 0.31.3` y `transformers 5.8.1`. Entradas solo de texto.

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) identificada por la etiqueta `qwen3_5_moe`, con expertos enrutados y expertos compartidos cuyos gates se almacenan en 8 bits afines (group size 64) mientras que el resto de los pesos se cuantizan en mxfp4 de 4 bits con group size 32. El artefacto se genera directamente desde BF16 sin entradas requantizadas, usando exclusivamente APIs nativas de MLX. La conversión emplea un adaptador sin pérdida (`layout_adapter.py`) que apila 30.720 tensores de experto independientes en orden numérico dentro de 120 grupos e invoca una única vez el sanitizador oficial; los pesos exportados se recargan después con `mlx-lm` estándar sin necesidad de adaptador.

En cuanto al entrenamiento del modelo base (Occamy-1.0), la información disponible en esta ficha no detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. El paper asociado (arXiv 2609.11977) es la referencia para esos detalles, pero su contenido no se reproduce en la model card del checkpoint cuantizado. La validación publicada de este artefacto incluye comprobaciones exhaustivas: verificación de hashes SHA256 de todas las cargas de origen, dequantización nativa de cada fila en los 512 módulos cuantizados, recarga estricta con stack estándar, logits finitos en vocabulario completo y sondas de kernel SwitchLinear/MoE en CPU nativa y CUDA para los cuatro modos. Ocho fixtures greedy cacheados (instrucciones en inglés y chino, aritmética, JSON y memoria de conversación) pasaron 8/8, y dos comprobaciones HTTP sobre el servidor estándar pasaron 2/2. La comprobación de calidad emparejada sobre un subconjunto de WikiText arrojó una perplejidad de 8,8886 para MLX MXFP4 frente a 8,3074 para BF16, con el mismo tokenizador, 8.192 IDs de token, 16 fragmentos independientes de contexto 512 y 4.096 tokens puntuados.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline declarado `text-generation`, uso conversacional).
- Razonamiento aritmético básico: los fixtures de validación incluyen pruebas de aritmética superadas.
- Salida estructurada en JSON: hay fixtures específicos de JSON superados.
- Memoria de conversación: fixtures de retención de contexto conversacional superados.
- Soporte multilingüe parcial verificado en inglés y chino mediante fixtures; el conjunto completo de idiomas soportados no está declarado.
- Modo de pensamiento configurable mediante el argumento `enable_thinking` de la plantilla de chat (puede activarse o desactivarse).
- Servidor local compatible con la API de OpenAI (`/v1/chat/completions`) a través de `mlx_lm.server`.
- Tool calling y agentes: no verificados en este lote de validación (la integración de tool-call y agentes permanece sin comprobar).
- Visión y MTP (multi-token prediction): no incluidos en este artefacto; se distribuyen por separado.
- Código: no probado en este lote de validación.

## Casos de uso

- Inferencia local en Mac para asistentes conversacionales: el modelo cabe en memoria unificada de Apple Silicon al ocupar 18,43 GB de pesos en 4 bits, y se puede cargar con `mlx-lm` sin adaptador, lo que permite mantener conversaciones multi-turno en local sin enviar datos a la nube.
- Procesamiento de datos sensibles con requisitos de privacidad: al ser un despliegue enteramente local sobre MLX y con licencia Apache 2.0, resulta adecuado para entornos donde no se permite exfiltrar texto a servicios externos (legal, sanitario, documentación interna).
- Servicio HTTP interno con API compatible OpenAI: mediante `mlx_lm.server` se puede exponer el modelo como endpoint `/v1/chat/completions`, integrándolo como backend en herramientas que ya consumen la API de OpenAI sin cambios de código en el cliente.
- Generación de salidas estructuradas JSON: dado que los fixtures de validación cubren JSON, puede emplearse para extracción de campos, normalización de registros o generación de respuestas con esquema fijo en pipelines de datos.
- Tareas de razonamiento aritmético y cálculo sencillo: los fixtures de aritmética superados permiten usarlo para validaciones numéricas, cálculos paso a paso o comprobaciones rápidas dentro de flujos más amplios.
- Investigación sobre cuantización y MoE: al publicarse la familia completa (8bit a 3bit, mxfp8, mxfp4, nvfp4) con la misma revisión de origen, es un objeto de estudio útil para comparar degradación de calidad entre formatos de cuantización sobre una misma base BF16.
- Evaluación de despliegues en Apple Silicon frente a CUDA: sirve como banco de pruebas para medir latencia y consumo de memoria de un MoE de ~35B en MLX frente a alternativas de runtime, aunque el propio autor advierte que no se reclama ningún ranking de velocidad.

## Benchmarks y rendimiento

Los únicos datos de calidad publicados en la información disponible son la perplejidad emparejada sobre un subconjunto reservado de WikiText, medida con el mismo scorer nativo MLX:

| Comprobacion MLX | Perplejidad (WikiText, subconjunto reservado) |
|---|---:|
| BF16 | 8,3074 |
| MLX MXFP4 | 8,8886 |

Condiciones: mismo tokenizador, 8.192 IDs de token, 16 fragmentos independientes a contexto 512, 4.096 tokens puntuados, prefijo no puntuado de 256 tokens por fragmento y estado de modelo fresco. El autor advierte que esta prueba no establece la calidad en benchmarks completos y que los resultados GGUF usan un protocolo de runtime reportado por separado.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se incluyen datos de throughput ni de latencia.

## Requisitos de hardware

- VRAM / memoria estimada: los pesos ocupan 18,43 GB (17,161 GiB) en disco; con activaciones en BF16 y caché KV, se estima un mínimo práctico en torno a 24 GB de memoria unificada o VRAM, y 32 GB o más para contextos largos de forma holgada. Son estimaciones, no cifras verificadas por el autor.
- Hardware validado: las comprobaciones Linux se ejecutaron con MLX CUDA 12 sobre NVIDIA B200; la conversión se hizo con kernels nativos de CPU.
- Apple Silicon: es el destino previsto (formato nativo MLX), pero la aceptación en Apple Metal está pendiente y la inferencia y el rendimiento en Apple Silicon permanecen sin verificar.
- GPU consumer: no hay confirmación oficial de funcionamiento en GPU de consumo. Dado el tamaño de pesos, encajaría teóricamente en equipos con memoria unificada amplia (por ejemplo Mac con 32 GB o más) o GPU con al menos 24 GB, pero no está validado.
- Opciones de despliegue: `mlx-lm` (carga directa de pesos) y `mlx_lm.server` (servidor local compatible con OpenAI). No se mencionan vLLM, llama.cpp, Ollama, TGI ni GGUF para este artefacto; GGUF aparece únicamente como protocolo de runtime reportado por separado, no como formato de este checkpoint.
- Latencia y throughput: no disponibles. El autor declara explícitamente que no se reclama ningún ranking de velocidad y que el rendimiento no se probó en este lote.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto de modelos externos comparables dentro de la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas de terceros. La comparación viable es interna, entre los miembros de la propia familia de cuantización, de los que solo se conocen los datos del artefacto analizado:

| Checkpoint | Formato | Tamano de pesos | Perplejidad WikiText (parcial) |
|---|---|---|---|
| occamy-1.0 (base) | BF16 | no disponible | 8,3074 |
| occamy-1.0-MLX-mxfp4 | MLX mxfp4 4 bits | 18,43 GB (17,161 GiB) | 8,8886 |
| occamy-1.0-MLX-8bit | MLX 8 bits | no disponible | no disponible |
| occamy-1.0-MLX-6bit | MLX 6 bits | no disponible | no disponible |
| occamy-1.0-MLX-5bit | MLX 5 bits | no disponible | no disponible |
| occamy-1.0-MLX-4bit | MLX 4 bits | no disponible | no disponible |
| occamy-1.0-MLX-3bit | MLX 3 bits | no disponible | no disponible |
| occamy-1.0-MLX-mxfp8 | MLX mxfp8 | no disponible | no disponible |
| occamy-1.0-MLX-nvfp4 | MLX nvfp4 | no disponible | no disponible |
| occamy-1.0-NVFP4 | NVFP4 (NVIDIA) | no disponible | no disponible |

## Limitaciones y advertencias

- Estado de lanzamiento: el autor lo etiqueta como "candidate release" con la aceptación en Mac Metal pendiente. No debe tratarse como un artefacto estable de producción sin validación adicional.
- Verificación incompleta en Apple Silicon: la inferencia y el rendimiento en Apple Silicon permanecen sin verificar a pesar de que el formato es nativo MLX.
- Cobertura de validación limitada: no se probaron Metal de Apple, contexto largo, código, herramientas ni throughput en este lote. La integración de tool-call y agentes queda sin comprobar.
- Calidad medida en una muestra pequeña: la comparación de perplejidad usa solo 4.096 tokens puntuados y no establece la calidad en benchmarks completos; además, solo es comparable dentro del scorer nativo MLX.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de fiabilidad factual en la información disponible.
- Sesgos: no se ha publicado ningún análisis de sesgos en la documentación proporcionada.
- Idiomas: el conjunto de idiomas soportados no está declarado; la verificación se limita a inglés y chino en fixtures concretos.
- Contexto: la longitud máxima de contexto no está declarada y las validaciones se hicieron a 512 tokens, por lo que no hay evidencia de comportamiento correcto en ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene conservar la atribución y la cita del informe original (arXiv 2609.11977) al redistribuir el modelo.
- Formato específico: los pesos son MLX safetensors, no GGUF; no son directamente utilizables en runtimes como llama.cpp u Ollama sin conversión adicional, y MLX NVFP4 es un export distinto del checkpoint NVFP4 de NVIDIA.
- Advertencia de tamaño: el tamaño en disco de los pesos no determina por sí solo el uso de memoria en tiempo de ejecución ni la velocidad.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp4
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Revisión del modelo base: https://huggingface.co/Accio-Lab/occamy-1.0/tree/8f8e0e58a3c9df042be1a3fa2c191fd8047acfb8
- Paper: https://arxiv.org/abs/2609.11977
- Proyecto: https://accio-lab.github.io/occamy/
- Colección de modelos Occamy-1.0: https://huggingface.co/collections/Accio-Lab/occamy-10-6ac00729659e8a86ec11e216
- Colección MLX Occamy-1.0: https://huggingface.co/collections/Accio-Lab/occamy-10-mlx-6ac0072a7c1cdbc5e418e90b
- Checkpoint explorer (Space): https://huggingface.co/spaces/Accio-Lab/Occamy-Explorer
- Variante MLX 8bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-8bit
- Variante MLX 6bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-6bit
- Variante MLX 5bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-5bit
- Variante MLX 4bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit
- Variante MLX 3bit: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-3bit
- Variante MLX mxfp8: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-mxfp8
- Variante MLX nvfp4: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-nvfp4
- Variante NVFP4 para NVIDIA: https://huggingface.co/Accio-Lab/occamy-1.0-NVFP4
- Ficheros de validación del checkpoint: `validation_summary.json`, `validation.json`, `api_validation.json`, `conversion.json`, `SHA256SUMS`, `quality/README.md`, `layout_adapter.py`
