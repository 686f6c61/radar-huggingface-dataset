# litert-community/SmolLM3-3B

## Resumen

SmolLM3-3B es un modelo de lenguaje de 3 000 millones de parámetros desarrollado por Hugging Face, publicado bajo licencia Apache-2.0. Se trata de un decoder completamente abierto que incorpora atención con GQA (Grouped Query Attention) y un esquema de posiciones NoPE (No Positional Encoding), entrenado sobre 11,2 billones de tokens con un énfasis especial en razonamiento, código y soporte multilingüe. El modelo base admite una ventana de contexto de hasta 128 000 tokens, lo que lo sitúa como un pequeño razonador competitivo para tareas de generación de texto, tool calling y agentes.

La versión `litert-community/SmolLM3-3B` es una conversión oficial de la comunidad al formato **LiteRT-LM** (`.litertlm`), diseñada para inferencia en dispositivos (on-device) mediante el runtime de Google AI Edge. Esta conversión aplica una cuantización int4 por bloques (block 32) con el algoritmo OCTAV de recorte óptimo, manteniendo la precisión del modelo original en tareas de razonamiento. El bundle incluye el tokenizador y la plantilla de prompt ChatML, por lo que no requiere archivos adicionales. El archivo principal pesa aproximadamente 1,9 GB y está pensado para ejecutarse en GPU o CPU de teléfonos móviles, así como en escritorio a través de la CLI de LiteRT-LM.

La relevancia de este modelo radica en su capacidad para ejecutar un razonador de 3B con calidad cercana a la versión bf16 en hardware de consumo, con un consumo de memoria reducido y sin necesidad de conexión a la nube. Es una opción atractiva para desarrolladores que buscan desplegar asistentes locales, automatización de operaciones o generación de código en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con GQA y NoPE |
| Parametros totales | 3 000 millones (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Modelo base: 128 000 tokens; conversión LiteRT: 4 096 tokens (KV cache) |
| Tipos de cuantizacion | int4 blockwise (block 32) + OCTAV, simétrica; embedding INT8 |
| Idiomas soportados | Multilingüe (idiomas específicos no disponibles) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle con tokenizador y plantilla ChatML) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un decoder Transformer de 3B parámetros que emplea atención con GQA para reducir el coste de la caché KV y un esquema de posiciones NoPE, que elimina los embeddings posicionales aprendidos en favor de una atención que no depende de la posición absoluta. Esta combinación permite un entrenamiento más eficiente y una mejor generalización a secuencias largas. El entrenamiento se realizó sobre 11,2 billones de tokens, con un énfasis particular en datos de razonamiento y código, además de un corpus multilingüe. El modelo fue ajustado con instrucciones (instruction tuning) y soporta extended thinking (razonamiento extendido) y tool calling.

La conversión a LiteRT-LM aplica una cuantización int4 por bloques de 32 elementos con el algoritmo OCTAV (optimal clipping) para minimizar la pérdida de precisión. Los embeddings se mantienen en INT8 y el cómputo se realiza en aritmética entera, lo que permite una ejecución eficiente en aceleradores de dispositivos móviles. El bundle `.litertlm` incluye el tokenizador y la plantilla de prompt ChatML, de modo que el runtime puede cargar el modelo sin configuración adicional.

## Capacidades

- Generación de texto y razonamiento paso a paso (chain-of-thought), con salida visible del proceso de razonamiento.
- Soporte de tool calling / function calling, lo que permite integrar el modelo en flujos de agentes que invocan herramientas externas.
- Capacidades multilingües, aunque no se especifican los idiomas concretos en la documentación disponible.
- Razonamiento matemático: en la prueba GSM8K (n=100) alcanza un 81,0% de precisión, idéntico al modelo bf16 de referencia.
- Ejecución on-device en Android (GPU y CPU) y en escritorio (macOS, Linux, Windows) mediante el runtime LiteRT-LM.
- Compatibilidad con la API OpenAI a través del servidor local `litert-lm serve`, lo que facilita su integración en aplicaciones existentes.
- El modelo base soporta contexto largo (128k), aunque la conversión limita la caché KV a 4 096 tokens.

## Casos de uso

- **Asistente de chat local en Android**: el modelo puede ejecutarse íntegramente en un teléfono con la app Google AI Edge Gallery, sin conexión a internet. Es adecuado para aplicaciones de mensajería o asistentes personales que requieran privacidad y baja latencia.
- **Servidor de inferencia local compatible con OpenAI**: mediante `litert-lm serve`, se puede desplegar un endpoint local que emula la API de OpenAI, permitiendo sustituir servicios en la nube por un modelo propio en entornos de desarrollo o pruebas.
- **Automatización de operaciones (ops)**: gracias a su capacidad de tool calling y razonamiento, puede gestionar tareas como diagnóstico de incidencias, generación de scripts o resolución de problemas en infraestructura, todo ello sin depender de servicios externos.
- **Generación de código en entornos sin conexión**: el modelo está entrenado con énfasis en código, por lo que puede asistir en la escritura de fragmentos, revisión de sintaxis o explicación de algoritmos en máquinas sin acceso a la nube.
- **Educación y demostraciones de IA en dispositivos**: su tamaño reducido y su formato empaquetado lo hacen ideal para talleres, cursos o prototipos que necesiten mostrar razonamiento de IA en hardware de bajo coste.
- **Procesamiento de documentos con contexto limitado**: aunque la conversión limita a 4 096 tokens, el modelo base soporta 128k, por lo que en despliegues con el modelo original (bf16) se pueden procesar documentos largos, resumir informes o extraer información de contratos.

## Benchmarks y rendimiento

La información disponible incluye resultados de precisión en GSM8K (n=100, greedy, 0-shot chain-of-thought) comparando la versión bf16 de referencia con la conversión LiteRT int4:

| Configuracion | GSM8K |
|---|---|
| bf16 (referencia) | 81,0% |
| LiteRT int4 (BOCTAV4) | 81,0% |

La conversión int4 mantiene una paridad exacta con el modelo bf16 en esta prueba, sin pérdida de precisión. No se han publicado otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

En cuanto al rendimiento de inferencia, la model card reporta mediciones con `litert-lm benchmark` en un Apple M4 Max y un iPhone 17 Pro:

| Dispositivo | Backend | Prefill (256 tokens) | Decode | TTFT | Pico de memoria |
|---|---|---|---|---|---|
| Apple M4 Max (macOS) | CPU | 141 tok/s | 24,1 tok/s | 2,14 s | — |
| Apple M4 Max (macOS) | GPU (Metal) | 1354 tok/s | 93,2 tok/s | 0,21 s | — |
| iPhone 17 Pro | GPU (Metal) | 30,8 tok/s | 22,5 tok/s | 0,63 s | 1,24 GB |

Nota: la fila del iPhone corresponde a una ejecución en frío con un prompt corto, por lo que su cifra de prefill refleja sobrecarga fija por turno y no es directamente comparable con la columna de escritorio.

## Requisitos de hardware

- El archivo principal `SmolLM3-3B_q4_block32_ekv4096.litertlm` pesa ~1,9 GB, por lo que cabe en dispositivos con al menos 2 GB de almacenamiento libre y 1,24 GB de memoria pico (medido en iPhone 17 Pro).
- En Android, se ha verificado su funcionamiento en un Pixel 8a (Tensor G3, Mali-G715, 8 GB RAM) con el backend OpenCL, ejecutando todos los nodos del grafo en GPU.
- En escritorio, funciona en CPU y GPU (Metal en macOS, OpenCL en otras plataformas). En un Apple M4 Max se alcanzan 93,2 tok/s de decode en GPU.
- Para GPU de escritorio, se recomienda al menos 2-4 GB de VRAM, aunque el modelo también puede ejecutarse en CPU con rendimiento aceptable (24 tok/s en M4 Max).
- Opciones de despliegue: runtime LiteRT-LM (CLI), app Google AI Edge Gallery para Android, API Kotlin para integración en apps propias, y servidor OpenAI-compatible (`litert-lm serve`).
- No se requieren GPUs de gama alta; el modelo está diseñado para hardware de consumo y dispositivos móviles.

## Comparativa con modelos similares

La comparación más directa es con el modelo base HuggingFaceTB/SmolLM3-3B en su formato original (bf16), ya que la conversión LiteRT es una variante cuantizada del mismo. No se dispone de datos de otros modelos comparables en la información proporcionada.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| HuggingFaceTB/SmolLM3-3B (bf16) | 3B | 128k | bf16 | Apache-2.0 | safetensors |
| litert-community/SmolLM3-3B (int4) | 3B | 4 096 (KV cache) | int4 blockwise + OCTAV | Apache-2.0 | .litertlm |

La conversión LiteRT sacrifica la longitud de contexto (de 128k a 4k) a cambio de un tamaño de archivo mucho menor (~1,9 GB frente a ~6 GB en bf16) y una ejecución eficiente en dispositivos. La precisión en GSM8K se mantiene idéntica.

## Limitaciones y advertencias

- La conversión LiteRT limita la caché KV a 4 096 tokens, muy por debajo de los 128k del modelo base. Para tareas que requieran contexto largo, es necesario usar el modelo original en bf16 u otra cuantización.
- El archivo `SmolLM3-3B.litertlm` (~3,1 GB) está restringido (gated) y solo está disponible para ciertos dispositivos (Galaxy S26 GPU), según la model card.
- No se han publicado resultados de benchmarks más allá de GSM8K; el rendimiento en otras tareas (MMLU, HumanEval, etc.) no está verificado en esta conversión.
- El modelo base puede presentar sesgos derivados de sus datos de entrenamiento, y la cuantización int4 podría amplificar errores en tareas muy sensibles a la precisión numérica, aunque no se ha observado en la prueba GSM8K.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda validar las salidas en aplicaciones críticas.
- La licencia Apache-2.0 permite uso comercial, pero es necesario revisar los términos del runtime LiteRT-LM y de las dependencias asociadas.
- El soporte multilingüe está declarado, pero no se especifican los idiomas cubiertos ni su calidad relativa.

## Enlaces

- Repositorio HuggingFace: [litert-community/SmolLM3-3B](https://huggingface.co/litert-community/SmolLM3-3B)
- Modelo base: [HuggingFaceTB/SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- Runtime LiteRT-LM: [github.com/google-ai-edge/litert-lm](https://github.com/google-ai-edge/litert-lm)
- App Google AI Edge Gallery: [github.com/google-ai-edge/gallery](https://github.com/google-ai-edge/gallery)
- Guía de importación de modelos locales: [Gallery Wiki - Importing Local Models](https://github.com/google-ai-edge/gallery/wiki/6.-Importing-Local-Models-(optional))
- Guía de inicio con Kotlin API: [LiteRT-LM - Getting Started](https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/api/kotlin/getting_started.md)
- Issue de solicitud de adición a litert-community: [github.com/google-ai-edge/LiteRT-LM/issues/2623](https://github.com/google-ai-edge/LiteRT-LM/issues/2623)
