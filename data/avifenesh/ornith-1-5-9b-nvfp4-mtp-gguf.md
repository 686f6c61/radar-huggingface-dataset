# Avifenesh/Ornith-1.5-9B-NVFP4-MTP-GGUF

## Resumen

Ornith-1.5-9B-NVFP4-MTP-GGUF es un artefacto de inferencia cuantizado a 4 bits del modelo Ornith-1.5-9B, desarrollado por Avifenesh como pieza de servido para el motor de inferencia memra. El modelo base, ornith-ai/Ornith-1.5-9B, es una fine-tune de Qwen3.5-9B con licencia MIT, que incorpora una arquitectura transformer densa con un módulo de predicción multi-token (MTP). Este artefacto en concreto reduce el peso de 18,8 GB (BF16) a 5,4 GB mediante cuantización NVFP4 (4-bit e2m1 con escalas FP8-e4m3 por cada 16 elementos), lo que lo hace viable en GPUs de consumo con 8 GB de VRAM.

La peculiaridad principal de esta versión es que injerta la cabeza MTP entrenada de Qwen3.5-9B (Apache-2.0) en el tronco de Ornith, ya que el checkpoint oficial declara la cabeza pero no incluye los tensores `mtp.*`. El objetivo es mejorar la tasa de aceptación de la decodificación especulativa sin alterar la salida del modelo: el flujo especulativo se verifica token a token y es idéntico a la decodificación greedy simple. El artefacto está pensado para ejecutarse en el motor memra (Rust + CUDA, optimizado para RTX Blackwell sm_120a) o en la rama NVFP4 de llama.cpp; no es compatible con el llama.cpp aguas arriba.

La relevancia de esta ficha radica en que demuestra un caso práctico de cuantización extrema (4-bit) combinada con decodificación especulativa para reducir latencia en modelos de contexto largo (262.144 tokens nativos), manteniendo la integridad de la salida. Está orientado a desarrolladores que quieren desplegar un modelo conversacional con tool calling en servidores con GPUs Blackwell y necesitan evaluar si el compromiso entre tamaño, velocidad y exactitud les interesa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dense con visión (base Qwen3.5-9B) + cabeza MTP (1 capa) |
| Parametros totales | no disponible (el nombre del modelo indica ~9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262,144 tokens |
| Tipos de cuantizacion | NVFP4 (4-bit e2m1, per-16 FP8-e4m3 scales), embeddings y salida en Q5_K, normas F32 |
| Idiomas soportados | no disponible (modelo multilingüe derivado de Qwen) |
| Licencia | MIT (tronco) + Apache-2.0 (cabeza MTP injertada) |
| Formato de pesos | GGUF (safetensors BF16 original) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es una fine-tune de Qwen3.5-9B, una arquitectura transformer densa con componentes de visión (el artefacto no incluye el vision tower, solo texto). El checkpoint oficial declara una cabeza MTP (`mtp_num_hidden_layers: 1`) pero no publica los tensores `mtp.*`, por lo que el autor de esta cuantización injertó la cabeza entrenada de Qwen3.5-9B en la capa `blk.32` del tronco. La cabeza MTP permite predecir múltiples tokens por paso, lo que en combinación con decodificación especulativa acelera la generación sin alterar la salida final: cada token especulado es verificado y, si no coincide, se descarta.

El entrenamiento del modelo base sigue el paradigma de auto-mejora descrito en el blog de Ornith-1.5: el modelo propone tareas, genera scaffolds específicos y produce soluciones para aprendizaje por refuerzo. Los datos de entrenamiento concretos no se detallan en la información proporcionada. La cuantización NVFP4 se realizó con la herramienta `llama-quantize` de la rama `nvfp4-imatrix-scale-search` de llama.cpp, aplicando NVFP4 a todos los bloques y la cabeza MTP, Q5_K a embeddings y salida, y F32 a las normas.

## Capacidades

- Generación de texto conversacional: el modelo está entrenado para diálogo multiturno con plantilla de chat integrada (byte-idéntica a `chat_template.jinja` del repo oficial).
- Tool calling / function calling: la plantilla incluye XML para herramientas y el motor emite llamadas OpenAI `tool_calls` con argumentos tipados (por ejemplo, `"celsius":true`).
- Razonamiento multi-step: soporta etiquetas de razonamiento (`<thinking>`) dentro de la conversación.
- Decodificación especulativa: con la cabeza MTP injertada, alcanza tasas de aceptación de 0,594 (K=3, prompt de código) manteniendo la salida token-idéntica a la decodificación greedy simple.
- Multilingüe: derivado de Qwen, soporta múltiples idiomas, aunque no se especifica la lista exacta.
- Longitud de contexto extendida: 262144 tokens nativos, adecuado para tareas con documentos largos.
- No incluye visión en este artefacto: el vision tower del modelo base no se incluye, solo texto.

## Casos de uso

- Servicio de chat con contexto largo: con 262144 tokens de contexto, puede gestionar conversaciones de asistencia al cliente con historial extenso, resumiendo documentos o manteniendo el estado de una conversación de varios días sin perder hilos.
- Generación de código asistida en producción: su soporte de tool calling y la capacidad de razonamiento permiten integrarlo en pipelines de CI/CD para autocompletar código, generar tests o documentar APIs, con la ventaja de que la cuantización NVFP4 reduce la huella de VRAM.
- Despliegue en hardware de consumo: al pesar 5,4 GB, cabe en GPUs de 8 GB (p. ej., RTX 3060 o 4060) o en un MacBook de 16 GB, lo que facilita prototipado local sin servidores dedicados.
- Inferencia especulativa de baja latencia: en un servidor con RTX 5090 o similar, el motor memra puede usar la cabeza MTP para aceptar ~60% de los tokens especulados en K=3, reduciendo el número de pasos de decodificación y, por tanto, la latencia por request.
- Agente autónomo con herramientas: gracias a la generación de `tool_calls` tipados, puede orquestar llamadas a APIs, bases de datos o scripts en entornos de automatización (por ejemplo, un bot que consulta el tiempo, calcula conversiones o ejecuta comandos).
- Análisis de documentos largos: con 262144 tokens de contexto, puede procesar libros técnicos, informes legales o logs de sistemas en una sola pasada, extrayendo resúmenes o detectando anomalías sin necesidad de trocear el texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor declara únicamente métricas de aceptación de decodificación especulativa, medidas con el harness de memra v0.104.1 en una RTX 5090 Laptop (térmicamente limitada, sin claims de throughput). La tabla siguiente es un extracto de los datos oficiales:

| Tarea | Métrica | Valor |
|---|---|---|
| MTP speculative decode, greedy K=3, prompt de código chat-templated | acceptance rate | 0,594 |
| FR-Spec masked head (top-32768 own-gen SXC ranks), K=3 | acceptance rate | 0,556 |
| Embedded grafted head, K=1, chat-templated code probe | acceptance rate | 0,80 |
| Embedded grafted head, K=2, chat-templated code probe | acceptance rate | 0,71 |
| Embedded grafted head, K=3, chat-templated code probe | acceptance rate | 0,59 |
| Embedded grafted head, K=1, raw continuation probe | acceptance rate | 0,72 |
| Embedded grafted head, K=2, raw continuation probe | acceptance rate | 0,57 |
| Embedded grafted head, K=3, raw continuation probe | acceptance rate | 0,45 |

Todos los resultados se obtuvieron con el gate de exactitud: la corriente especulativa es token-idéntica a la decodificación greedy simple en cada K.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 5,4 GB, por lo que con overhead de ejecución cabe en una GPU de 8 GB (p. ej., RTX 3060/4060) o en un MacBook con 16 GB unificados.
- GPU recomendadas: el motor memra requiere arquitectura Blackwell (sm_120a, RTX 50 series) para aprovechar la cuantización NVFP4 y la decodificación especulativa. Para GPUs más antiguas, se recomienda usar los GGUF oficiales BF16/Q8_0 del repo ornith-ai.
- Opciones de despliegue: motor memra (Rust + CUDA, crates.io `memra-server`), branch NVFP4 de llama.cpp (github.com/avifenesh/llama.cpp/tree/nvfp4-imatrix-scale-search). No es compatible con llama.cpp aguas arriba ni con Ollama.
- Latencia y throughput: no se publican cifras de tok/s en la model card. El autor indica que la RTX 5090 Laptop es térmicamente limitada y recomienda medir en el propio hardware con `run-spec` o `frspec-owngen --validate`.
- Inferencia especulativa: con la cabeza MTP, en K=3 se aceptan ~59% de los tokens en prompts de código, lo que reduce los pasos de decodificación en aproximadamente 1,5 veces (estimación cualitativa, no medida).

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de la misma categoría (tamaño 9B, contexto 262K) en la información proporcionada. El autor menciona la versión hermana Ornith-1.5-35B-A3B-NVFP4-MTP-GGUF (también cuantizada con NVFP4 y con cabeza MTP), pero no publica benchmarks comparativos. Para el mismo modelo base, existen los GGUF oficiales BF16/Q8_0 de ornith-ai, que no incluyen cabeza MTP y son compatibles con llama.cpp upstream, pero no se ofrecen datos de rendimiento.

## Limitaciones y advertencias

- La cabeza MTP es un injerto de Qwen3.5-9B, no entrenada específicamente para Ornith-1.5-9B. Aunque no altera la salida (el token especulado siempre se verifica), la tasa de aceptación puede ser subóptima en comparación con una cabeza entrenada para este modelo.
- El artefacto no incluye el vision tower del modelo base: solo sirve texto. Si se necesita entrada de imagen, hay que usar el checkpoint original de Ornith-1.5-9B.
- Compatibilidad restringida: el formato NVFP4 no es soportado por llama.cpp upstream ni por Ollama. Requiere el motor memra o la rama específica de llama.cpp. Para uso general, se recomienda los GGUF oficiales BF16/Q8_0.
- Licencia dual: el tronco es MIT, pero la cabeza MTP injertada es Apache-2.0. La combinación resultante debe distribuirse cumpliendo ambas licencias (Apache-2.0 para la parte injertada).
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa. En entornos de producción con tool calling, se recomienda validar las salidas críticas.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, etc., por lo que es difícil comparar calidad con otros modelos de 9B.
- La cuantización NVFP4 a 4-bit puede introducir degradación de calidad en tareas de precisión, aunque el autor reporta que la stream especulativa es exacta a la decodificación greedy del modelo cuantizado (no del BF16 original).

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Avifenesh/Ornith-1.5-9B-NVFP4-MTP-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- GGUF oficiales del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B-GGUF
- Hermana 35B-A3B: https://huggingface.co/Avifenesh/Ornith-1.5-35B-A3B-NVFP4-MTP-GGUF
- Motor de inferencia memra: https://github.com/avifenesh/memra
- Branch NVFP4 de llama.cpp: https://github.com/avifenesh/llama.cpp/tree/nvfp4-imatrix-scale-search
- Inferencia alojada: https://inference.tiyuvta.ai
- Blog oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía para ejecutar Ornith 1.5 localmente: https://atomic.chat/blog/guides/how-to-run-ornith-1-5-locally
- Perfil del autor: https://github.com/avifenesh/avifenesh
