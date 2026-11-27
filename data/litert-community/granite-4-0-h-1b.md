# litert-community/granite-4.0-h-1b

## Resumen

Granite-4.0-h-1b es un modelo de lenguaje de IBM Research perteneciente a la familia Granite 4.0, caracterizado por una arquitectura híbrida que combina bloques Mamba2 (selective scan) con un número reducido de bloques de atención con query agrupada (GQA). El repositorio `litert-community/granite-4.0-h-1b` es una conversión de los pesos originales al formato LiteRT-LM (`.litertlm`) realizada por la comunidad, destinada a inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM de Google, sucesor de TensorFlow Lite.

El modelo resuelve el problema del despliegue de LLM en entornos con recursos limitados: al sustituir la mayor parte de la caché KV por un estado recurrente de tamaño constante por capa, el consumo de memoria permanece prácticamente plano respecto a la longitud de contexto. Esto lo hace adecuado para ejecución en CPU y GPU móviles (Android, iOS, macOS) sin necesidad de infraestructura de servidor.

La relevancia de esta conversión concreta radica en que, según la model card, es el primer LLM híbrido Mamba2 servido por el runtime LiteRT-LM publicado y, desde la actualización del 13 de agosto de 2026, el primero en ejecutar su selective scan en una GPU móvil. El archivo publicado ocupa 1,68 GB en cuantización int8 dinámica y está pensado para ejecutarse con litert-lm 0.15.0 hasta 0.19.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 36 capas Mamba2 (selective scan) + 4 capas de atención GQA (según model card) |
| Parametros totales | Clase 1B/1.5B (cifra exacta no disponible en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens de presupuesto KV para las 4 capas de atención |
| Tipos de cuantizacion | int8 dinámica en capas lineales y embedding; convs y selective scan en coma flotante |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base está en formato Hugging Face (safetensors) |

## Arquitectura y entrenamiento

El modelo base `ibm-granite/granite-4.0-h-1b` emplea una arquitectura híbrida en la que la mayoría de las capas (36 de 40) son bloques Mamba2 con selective scan, intercalados con 4 bloques de atención con query agrupada (GQA). Los bloques Mamba2 mantienen un estado recurrente de convolución y SSM de tamaño constante por capa, en lugar de una caché KV que crece con el contexto; solo las 4 capas de atención conservan caché KV, con un presupuesto de 4096 tokens. El resultado es un consumo de memoria casi plano respecto a la longitud de secuencia.

La conversión a LiteRT-LM se realizó con `litert_torch` (antes `ai-edge-torch`). En la actualización del 13 de agosto de 2026 se reconvirtió el modelo reexpresando el selective scan como multiplicaciones de matrices por lotes (todos los tensores con rango ≤ 4, sin intermediarios de broadcast gigantes). Según la model card, esto produjo una decodificación en CPU unas 3,5 veces más rápida (de 11,4 a 39,2 tok/s) y permitió que el grafo se delegue completamente a la GPU (verificado en macOS con Metal, iPhone 17 Pro con Metal y Pixel 8a con Arm Mali vía OpenCL). La ejecución en GPU requiere activaciones en fp32, declaradas en el archivo. No se dispone de información sobre el dataset de entrenamiento, número de tokens ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto en el formato de chat del modelo base, con plantilla de chat que renderiza resultados de herramientas desde la reempaquetadura del 14 de octubre de 2026.
- Razonamiento aritmético básico: supera 7 de 8 preguntas de una prueba de sanidad (el fallo es `17 + 25`, respondido como `43`).
- Soporte de tool calling / function calling en el runtime litert-lm 0.18.0 (con matices; ver limitaciones).
- Ejecución en dispositivo en CPU y GPU (Metal en Apple, OpenCL en Arm Mali).
- Capacidad multilingüe: no disponible en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistentes conversacionales en móvil sin conexión: el modelo cabe en 1,68 GB en int8 y su estado recurrente mantiene la memoria casi plana, lo que permite conversaciones multi-turno en un Pixel 8a o un iPhone 17 Pro con el grafo completo delegado a la GPU.
- Autocompletado y generación de texto en aplicaciones Android: integrable mediante la librería `com.google.ai.edge.litert:litert` con el runtime LiteRT-LM, sin depender de un servidor.
- Procesamiento de documentos en el borde: resumen y extracción de información en dispositivos con CPU únicamente, gracias a los 39,2 tok/s de decodificación en CPU medidos en Mac.
- Enrutamiento de intenciones y clasificación de consultas: modelo pequeño con tool calling para decidir qué herramienta invocar antes de escalar a un modelo mayor en la nube.
- Prototipado de agentes multi-paso en dispositivo: la ventana de 4096 tokens en las capas de atención y el estado constante de Mamba2 permiten cadenas de razonamiento cortas con memoria acotada.
- Evaluación de arquitecturas híbridas Mamba2: referencia práctica para investigadores que quieran medir el rendimiento de selective scan en GPU móvil frente a transformers puros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos que aporta la model card son:

| Metrica | Valor | Condiciones |
|---|---|---|
| Prueba de sanidad (8 preguntas) | 7/8 en CPU y GPU | Mac, litert-lm 0.15.0 y 0.16.0, archivo tras la corrección del 2026-08-28 |
| Prueba de sanidad (8 preguntas) | 8/8 | Archivo previo a la corrección, iPhone 17 Pro en GPU (no re-ejecutado) |
| Decodificación en CPU | 39,2 tok/s | Mac, archivo del 2026-08-13 (antes: 11,4 tok/s) |
| Coincidencia con PyTorch de referencia | max\|Δlogit\| ≤ 1,1e-4, correlación 1,000000 | Decodificación teacher-forced de 8 pasos, top-1 y top-5 idénticos |
| Acuerdo en GSM8K (50 preguntas) | 40/50 entre archivos pre y post corrección; 6 a 4 a favor del antiguo en las 10 discrepancias | Muestra pequeña, considerado ruido por el autor |

## Requisitos de hardware

- VRAM/RAM estimada: 1,68 GB para el archivo int8 publicado, más el coste de las activaciones en fp32 que exige la ejecución en GPU.
- GPU recomendadas: Apple Metal (macOS, iPhone 17 Pro), Arm Mali con OpenCL (Pixel 8a). No se documentan requisitos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo y en móviles de gama alta; verificado en Pixel 8a e iPhone 17 Pro.
- Opciones de despliegue: runtime LiteRT-LM (versiones 0.15.0, 0.16.1, 0.17.1, 0.18.0 y 0.19.2 en CPU de Mac; GPU de Mac solo con 0.19.2). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 39,2 tok/s en decodificación CPU en Mac con el archivo del 13 de agosto de 2026; no se aportan cifras de latencia ni de throughput en GPU móvil.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría (por ejemplo, otras conversiones LiteRT-LM o modelos híbridos Mamba2 de tamaño similar), ni datos de benchmarks que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- El archivo previo al 28 de agosto de 2026 anteponía silenciosamente el token `<|end_of_text|>` a cada prompt; es necesario volver a descargar si se obtuvo antes de esa fecha.
- El archivo previo al 13 de agosto de 2026 decodificaba en CPU a 11,4 tok/s en lugar de 39,2 tok/s; también requiere nueva descarga.
- La ejecución en GPU exige activaciones en fp32, lo que incrementa el consumo de memoria respecto a la ejecución en CPU.
- En litert-lm 0.18.0, el runtime reutiliza el estado recurrente de una conversación anterior al iniciar una nueva sobre el mismo Engine, sin reiniciarlo; se recomienda crear un Engine por conversación. El fallo se corrigió en LiteRT-LM main el 3 de noviembre de 2026 (commit e1f86b05) y está incluido en la versión 0.20.0, con la que este modelo no se ha probado.
- La prueba de sanidad falla `17 + 25` (responde `43`); la model card atribuye el cambio respecto al 8/8 anterior a la eliminación del token antepuesto y lo considera ruido en una muestra de 50 preguntas de GSM8K.
- El soporte de tool calling en litert-lm 0.18.0 depende de la reempaquetadura del 14 de octubre de 2026 y presenta matices no detallados en el extracto disponible.
- Presupuesto de contexto limitado a 4096 tokens en las 4 capas de atención; no se documenta el comportamiento más allá de ese límite.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura de idiomas.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar las condiciones del modelo base de IBM por si añaden restricciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/granite-4.0-h-1b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-1b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Versión LiteRT-LM v0.20.0: https://github.com/google-ai-edge/LiteRT-LM/releases/tag/v0.20.0
- Commit de corrección del estado recurrente: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Informe del problema de Engine compartido: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Benchmark de referencia en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
