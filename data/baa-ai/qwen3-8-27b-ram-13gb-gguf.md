# baa-ai/Qwen3.8-27B-RAM-13GB-GGUF

## Resumen

Qwen3.8-27B-RAM-13GB-GGUF es una cuantizacion GGUF del modelo Qwen/Qwen3.8-27B publicada por baa-ai (Black Sheep AI). El objetivo declarado no es la compresion generica, sino preservar una capacidad concreta bajo compresion agresiva: la lectura fiel de documentos recuperados (faithful retrieval-grounded reading). El resultado es un modelo de 26.900 millones de parametros que ocupa 12,58 GB en disco y cabe en una GPU de 16 GB con una ventana de contexto de 32K tokens y cache KV en f16.

La version v2 (27 de septiembre de 2026) sustituye la cuantizacion IQ3_M de la v1 por una asignacion mixta por tensor (tipos Q2_K a Q8_0) calibrada con importance matrix, manteniendo el mismo tamano. La perplejidad en WikiText-2 baja de 6,34 a 6,02, una mejora del 5,0 % que se observa en 37 de los 40 fragmentos emparejados. El modelo base es un hibrido de atencion lineal Gated Delta Net y atencion completa, con solo 16 de 64 capas usando atencion completa, lo que explica que el KV cache sea pequeno y quepan contextos largos en VRAM limitada.

La relevancia practica esta en el nicho: despliegue de un lector de 27B en hardware de gama media (T4, Quadro P5000, RTX 4090) para pipelines RAG donde la fuente de verdad son los documentos recuperados y no la memoria parametrica del modelo. Requiere llama.cpp build b10360 o posterior por la arquitectura `qwen35`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated Delta Net (atencion lineal) + atencion completa; arch GGUF `qwen35` |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K en f16 KV sobre 16 GB; 64K con KV q8_0; 128K con KV q4_0 |
| Tipos de cuantizacion | Mixta por tensor, Q2_K a Q8_0, con importance matrix; 3,74 bits por peso de media |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (12.580.855.040 bytes, 12,58 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura hibrida en la que la mayoria de capas usan Gated Delta Net, un mecanismo de atencion lineal con estado recurrente, y solo 16 de las 64 capas mantienen atencion completa. Esta proporcion reduce drasticamente el coste de memoria del KV cache en contextos largos, que es precisamente lo que permite sostener 32K tokens en f16 dentro de 16 GB de VRAM. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La contribucion de esta publicacion es la cuantizacion, no el entrenamiento. baa-ai aplica una asignacion de tipos GGUF por tensor (desde Q2_K hasta Q8_0) guiada por una importance matrix, en lugar de un tipo uniforme como IQ3_M. La hipotesis de trabajo es que las capas criticas para la lectura de contexto toleran menos compresion que otras, y la validacion se hace contra un conjunto de cinco certificados que incluyen deferencia a la evidencia recuperada, precision de lectura desde contexto, recuperacion de aguja en tres profundidades con encadenamiento de dos saltos, y una puerta de coherencia de seguridad de agentes. No se documentan innovaciones de decodificacion especulativa ni tecnicas de inferencia adicionales.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, con pipeline `text-generation` y tag `conversational`.
- Lectura fiel de contexto: cuando un pasaje recuperado contradice el prior del modelo, lo sigue el 100 % de las veces segun la validacion del autor (30 items).
- Extraccion de respuestas desde contexto: 1,00 de precision en lectura desde contexto (30 items).
- Recuperacion en contexto largo: 48/48 en aguja a tres profundidades y 32/32 en encadenamiento de dos saltos sobre documentos de 8K y 32K tokens.
- Razonamiento matematico basico: GSM8K 0,96 con presupuesto de 768 tokens; MMLU-math con respuesta forzada 0,967.
- Coherencia para uso en agentes: supera la puerta de seguridad de agentes del marco "Fidelity Is Not Safety" con fraccion coherente de 0,0043.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales: la build MLX del mismo autor conserva la torre de vision, pero esta build GGUF no documenta soporte de vision.
- Capacidades multilingues: no disponibles; el autor no declara lista de idiomas.

## Casos de uso

- Lector en pipelines RAG sobre hardware de gama media: desplegado con `llama-server` en una T4 o Quadro P5000, el modelo responde exclusivamente a partir de los fragmentos recuperados, lo que encaja en arquitecturas donde los Data Modules son la fuente de verdad y el modelo solo interpreta.
- Analisis de contratos y documentacion legal: con 32K tokens de contexto en f16 cabe un contrato completo o un expediente de clausulas; la validacion de deferencia a la evidencia reduce el riesgo de que el modelo complete con conocimiento parametrico obsoleto.
- Extraccion de campos en facturas y formularios largos: la precision de lectura desde contexto de 1,00 sobre los bancos del autor lo hace adecuado para tareas de extraccion literal donde el dato debe copiarse, no inferirse.
- Asistente interno sobre base documental privada: al ejecutarse en una unica GPU de 16 GB y con licencia Apache 2.0, permite despliegue on-premise sin salida de datos, con API compatible con OpenAI mediante `llama-server`.
- Preguntas de seguimiento sobre documentos extensos: el encadenamiento de dos saltos validado a 32K permite resolver preguntas que requieren combinar dos hechos separados en el documento, tipico en informes anuales o expedientes tecnicos.
- Verificacion de citas y control de calidad documental: dado un pasaje y una afirmacion, el modelo puede comprobar si la afirmacion se sostiene en el texto recuperado, aprovechando la deferencia estricta a la evidencia.
- Razonamiento matematico en entornos con VRAM limitada: GSM8K 0,96 con 768 tokens de presupuesto lo hace viable para tutoria o resolucion de problemas aritmeticos en hardware consumer, aunque no para competicion matematica avanzada.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| WikiText-2 perplexity (40 x 2048 tokens) | 6,02 | v1 IQ3_M al mismo tamano: 6,34 |
| Deference to retrieved evidence | 1,00 | 30 items |
| Reading accuracy from context | 1,00 | 30 items |
| Long-context retrieval, aguja 3 profundidades (8K / 32K) | 48/48 / 32/32 | Incluye two-hop |
| GSM8K | 0,96 | 50 preguntas, presupuesto 768 tokens |
| MMLU-math, respuesta forzada | 0,967 | 60 preguntas |
| Agent-safety coherence gate | PASS | Fraccion coherente 0,0043 |

No se han publicado resultados de MMLU general, HumanEval ni otros benchmarks estandar en la informacion disponible. Las cifras de retrieval y fidelidad son validaciones internas del autor, no evaluaciones de terceros.

## Requisitos de hardware

- VRAM para inferencia: 12.425 MiB a 8K con KV f16; 13.985 MiB a 32K con KV f16; 14.359 MiB a 64K con KV q8_0; 14.807 MiB a 128K con KV q4_0. Medido en Quadro P5000 de 16.384 MiB con `-ngl 99 -fa on`.
- GPU recomendadas: NVIDIA T4 (AWS g4dn.xlarge), Quadro P5000, RTX 4090 y cualquier GPU con 16 GB o mas. A 128K con KV q4_0 el margen sobre 16 GB es de aproximadamente 1,5 GB.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) con holgura para 128K, y en tarjetas de 16 GB con contexto limitado a 32K en f16.
- Despliegue: llama.cpp (build b10360 de agosto de 2026 o posterior, obligatorio por `arch: qwen35`), `llama-server` con API compatible OpenAI, `llama-cpp-python`. Ollama y LM Studio requieren builds que soporten `qwen35`.
- Throughput medido (Quadro P5000): prefill 160 tok/s a 8K, 130 tok/s a 32K, 104 tok/s a 64K, 80 tok/s a 128K; decodificacion 9,3 tok/s a 8K, 10,0 tok/s a 32K, 7,1 tok/s a 64K, 6,8 tok/s a 128K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-RAM-13GB (v2) | 26,9B | 32K f16 / 128K KV q4_0 | 12,58 GB | Apache 2.0 | Mixta por tensor con imatrix, validada en fidelidad |
| Qwen3.8-27B-RAM-13GB (v1) | 26,9B | idem | 12,58 GB | Apache 2.0 | IQ3_M uniforme, PPL 6,34 |
| Qwen/Qwen3.8-27B (base) | 26,9B | no disponible | no disponible | Apache 2.0 | Precision completa, requiere hardware muy superior |
| Qwen3.8-27B-RAM-13GB-MLX | 26,9B | no disponible | 13,0 GB | Apache 2.0 | Build para Apple Silicon, conserva torre de vision |

No se dispone de datos de benchmarks de terceros ni de comparaciones con cuantizaciones alternativas del mismo modelo base, por lo que la comparativa se limita a las variantes publicadas por el mismo autor.

## Limitaciones y advertencias

- Requiere llama.cpp build b10360 o posterior. Las versiones estables de Ollama y LM Studio pueden no cargar el modelo por la arquitectura `qwen35`; verificar antes de desplegar.
- La cuantizacion a 3,74 bits por peso implica perdida de calidad respecto al modelo en precision completa. El autor solo certifica que no se pierde en fidelidad de lectura y retrieval; no hay datos sobre otras tareas como codigo, razonamiento abstracto o generacion creativa.
- Los benchmarks publicados son validaciones internas del autor con muestras pequenas (30, 50 y 60 items). No equivalen a evaluaciones estandarizadas y no deben extrapolarse a produccion sin validacion propia.
- Riesgo de alucinacion: el modelo esta disenado para depender de la evidencia recuperada, pero si el contexto es irrelevante o esta vacio, el comportamiento no esta documentado en la informacion disponible.
- Sin lista de idiomas declarada. El rendimiento fuera de ingles y chino (idiomas habituales de la familia Qwen) no esta verificado; el castellano no aparece en ningun benchmark.
- A 128K de contexto el margen de VRAM sobre 16 GB es estrecho y el throughput cae a 6,8 tok/s de decodificacion, lo que limita su uso interactivo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B debe verificarse de forma independiente por si tuviera terminos adicionales.
- No hay datos sobre sesgos, comportamiento en tool calling ni soporte multimodal en esta build GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/baa-ai/Qwen3.8-27B-RAM-13GB-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX para Apple Silicon: https://huggingface.co/baa-ai/Qwen3.8-27B-RAM-13GB-MLX
- Sitio del autor: https://baa.ai
- Capa de compresion (Ram): https://baa.ai/compression.html
- Plano de conocimiento (Paddock): https://baa.ai/paddock.html
- Capa de gobernanza (Watchman): https://baa.ai/watchman.html
- Producto Shepherd: https://baa.ai/shepherd.html
