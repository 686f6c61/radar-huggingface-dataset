# incoai/Qwen3.6-35B-A3B-Splash

## Resumen

Qwen3.6-35B-A3B-Splash es un paquete de inferencia publicado por Inco AI para su motor Splash, un runtime de código abierto orientado a Apple silicon. No se trata de un checkpoint al uso, sino de un conjunto de artefactos de runtime de diseño fijo que incluye el modelo objetivo Qwen3.6-35B-A3B en cuantización de 4 bits, su modelo borrador DFlash 2 para decodificación especulativa, el codificador de visión y el tokenizador. El paquete pesa 20,9 GB y se distribuye bajo licencia Apache-2.0.

El modelo subyacente es un mixture-of-experts de 35 000 millones de parámetros totales con aproximadamente 3000 millones activos por token, desarrollado por el equipo Qwen de Alibaba. Su interés actual está en que permite ejecutar localmente un MoE de 35B en un Mac con memoria unificada de 36 GB (48 GB recomendados), sirviendo APIs compatibles con OpenAI Chat Completions, OpenAI Responses y Anthropic Messages, además de integrarse con agentes de codificación como OpenCode, Claude Code, Codex CLI y Hermes Agent.

La propuesta diferencial de Inco AI es el empaquetado específico por máquina: Splash calcula un plan de memoria al arrancar y rechaza la ejecución si el modelo no cabe, con un desglose del presupuesto. El paquete no carga en Transformers, MLX ni llama.cpp; solo funciona dentro de Splash. No hay datos públicos de benchmarks ni de descargas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mixture-of-experts (MoE); paquete Splash con modelo objetivo 4-bit, borrador DFlash 2, codificador de visión y tokenizador |
| Parámetros totales | 35 000 millones (35B) |
| Parámetros activos | Aproximadamente 3000 millones (3B) por token |
| Longitud de contexto | No disponible (el autor indica que el contexto útil queda acotado por la memoria unificada restante tras los pesos) |
| Tipos de cuantización | 4 bits (conversión upstream de mlx-community); no se ofrecen otras precisiones |
| Idiomas soportados | No disponible (el autor remite a los idiomas de Qwen3.6-35B-A3B) |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefactos de runtime de diseño fijo para Splash; no es safetensors, GGUF ni MLX |
| Modelo base | mlx-community/Qwen3.6-35B-A3B-4bit (objetivo, tokenizador, visión) e incoai/Qwen3.6-35B-A3B-DFlash2 (borrador) |
| Motor de inferencia | Splash (Metal, Apple silicon) |
| Tamaño del repositorio | 20,9 GB |
| Fecha de publicación | 17 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información proporcionada no detalla el proceso de entrenamiento del modelo base Qwen3.6-35B-A3B: no se indican número de tokens, composición del dataset ni si hubo RLHF o DPO. Lo que sí se especifica es la arquitectura del modelo: un mixture-of-experts con 35B de parámetros totales y unos 3B activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño.

La innovación técnica del paquete reside en la decodificación especulativa mediante DFlash 2, un modelo borrador desarrollado por Inco AI que propone tokens que el modelo objetivo verifica uno a uno. Según el autor, este esquema modifica la velocidad pero no la distribución de salida. Splash asigna kernels propios a cada modelo de su catálogo, incluye un plan de memoria calculado para la máquina concreta y expone el razonamiento como un interruptor: en Chat Completions, `"reasoning_effort": "none"` lo desactiva, mientras que el resto de niveles aceptados (`minimal` hasta `max`) generan el mismo prompt. Incluye además un codificador de visión y admite PDF en línea de hasta 20 páginas y 10 MiB.

## Capacidades

- Generación de texto con razonamiento activado por defecto; el razonamiento se desactiva mediante `reasoning_effort: "none"` y consume tokens del límite de salida.
- Comprensión de imágenes gracias al codificador de visión incluido en el paquete.
- Entrada de PDF en línea, con un máximo de 20 páginas y 10 MiB por documento.
- Tool calling y function calling en las tres APIs servidas.
- Salida con JSON Schema.
- Streaming en OpenAI Chat Completions, OpenAI Responses y Anthropic Messages.
- Integración directa con agentes de codificación: OpenCode, Claude Code, Codex CLI y Hermes Agent, mediante los comandos `splash opencode`, `splash claude`, `splash codex` y `splash hermes`.
- Decodificación especulativa con el borrador DFlash 2, que acelera la generación sin alterar la distribución de salida.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Agente de codificación local en Mac: el usuario sirve el paquete con `splash serve` y lanza un agente como Claude Code o Codex CLI apuntando al endpoint local, de modo que el código y el contexto del repositorio no salen de la máquina. El soporte de tool calling y de JSON Schema es lo que permite que el agente ejecute acciones estructuradas.
- Asistente sobre documentación técnica en PDF: la admisión de PDF en línea de hasta 20 páginas y 10 MiB permite cargar especificaciones, papers o manuales directamente en la conversación sin preprocesado externo.
- Automatización de pipelines con salida estructurada: la combinación de function calling y JSON Schema hace viable usar el modelo como extractor o clasificador dentro de scripts, devolviendo objetos validados en lugar de texto libre.
- Análisis de capturas, diagramas o interfaces: el codificador de visión permite enviar imágenes junto al prompt para tareas de descripción, extracción de datos de pantallas o revisión de diseños.
- Backend compatible con la API de OpenAI para desarrollo de aplicaciones: al servir Chat Completions y Responses con streaming, se puede apuntar un SDK existente a `http://127.0.0.1:8000/v1` y cambiar solo la URL base.
- Integración en flujos de trabajo de Anthropic: la compatibilidad con Anthropic Messages y el campo `thinking` permite reutilizar clientes escritos para ese protocolo sin adaptaciones.
- Prototipado sin conectividad: tras la primera descarga, las ejecuciones posteriores no requieren red, lo que facilita el trabajo en entornos aislados o con datos sensibles.
- Tareas de razonamiento multi-paso: el modo de razonamiento activo por defecto resulta adecuado para descomposición de problemas, siempre que se presupueste el coste en tokens y en tiempo hasta la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor enlaza una entrada de blog de lanzamiento con benchmarks, pero los valores numéricos no están incluidos en los datos proporcionados para esta ficha, por lo que no se reproducen.

## Requisitos de hardware

- Plataforma: exclusivamente Apple silicon. Requiere Apple M3 o posterior y macOS 26.4 o posterior.
- Memoria unificada: 36 GB como mínimo, 48 GB o más recomendados. Splash comprueba la memoria disponible al arrancar y detiene la ejecución con un desglose del presupuesto si el modelo no cabe.
- No hay soporte para GPU NVIDIA ni CUDA; el motor está construido sobre Metal.
- Descarga inicial de 20,9 GB, verificada tras la descarga y reanudable si se interrumpe.
- Opciones de despliegue: únicamente el motor Splash, instalable con `brew install incoai/tap/splash`. No es compatible con vLLM, llama.cpp, Ollama, TGI, Transformers ni MLX.
- La memoria disponible determina el contexto utilizable y el número de peticiones concurrentes: un Mac de 36 GB admite menos contexto y menos concurrencia que uno de 48 GB.
- Latencia y throughput: no disponible. El autor no publica cifras de tokens por segundo en la información proporcionada.
- Conectividad: solo la primera ejecución requiere red; las posteriores funcionan sin conexión.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Cuantización | Formato | Motor | Licencia | Contexto |
|---|---|---|---|---|---|---|---|
| incoai/Qwen3.6-35B-A3B-Splash | 35B | ~3B | 4 bits | Artefactos Splash | Splash | Apache-2.0 | No disponible |
| incoai/Qwen3.8-27B-Splash | 27B (denso) | 27B | No disponible | Artefactos Splash | Splash | Apache-2.0 | No disponible |
| mlx-community/Qwen3.6-35B-A3B-4bit | 35B | ~3B | 4 bits | MLX | MLX | Apache-2.0 | No disponible |
| incoai/Qwen3.6-35B-A3B-DFlash2 | No disponible (borrador) | No disponible | No disponible | No disponible | Splash | Apache-2.0 | No disponible |

No hay datos de rendimiento comparativo publicados en la información disponible. La comparación se limita a parámetros, formato, motor y licencia. El paquete DFlash 2 no es un modelo autónomo y solo tiene sentido como borrador del objetivo dentro de Splash.

## Limitaciones y advertencias

- El paquete hereda los sesgos, el corte de conocimiento y los modos de fallo de Qwen3.6-35B-A3B; el autor remite a la model card del modelo original.
- No se ha publicado ninguna comparación de calidad entre la conversión a 4 bits y el checkpoint en bf16, por lo que la degradación real introducida por la cuantización no está cuantificada.
- El razonamiento está activado por defecto. Los tokens de razonamiento cuentan para el límite de salida y para el tiempo hasta la respuesta final.
- El contexto utilizable depende de la memoria restante tras cargar los pesos: en un Mac de 36 GB el contexto y la concurrencia son menores que en uno de 48 GB.
- Uso fuera de alcance: no carga en Transformers, MLX ni GGUF, y el borrador no funciona como modelo independiente.
- El servidor escucha en `127.0.0.1` y no implementa autenticación; el propio autor recomienda colocar un proxy delante antes de exponerlo en red.
- La decodificación especulativa no altera la distribución de salida, pero sí el consumo de memoria, al mantener el borrador cargado.
- `reasoning_effort` funciona como interruptor, no como escala: los niveles de `minimal` a `max` generan el mismo prompt y cualquier otro valor se rechaza con un error 400.
- La licencia Apache-2.0 permite uso comercial, pero se deben respetar las políticas de uso del modelo Qwen subyacente.
- El repositorio registra 0 descargas y 0 likes en la información disponible, por lo que no existe validación de la comunidad ni reportes independientes de comportamiento en producción.
- Idiomas soportados: no disponible; conviene verificar el comportamiento multilingüe con pruebas propias antes de desplegar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/incoai/Qwen3.6-35B-A3B-Splash
- Motor Splash: https://github.com/incoai/splash
- Entrada de blog con benchmarks de lanzamiento: https://inco.ai/blog/splash/
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Modelo objetivo upstream en 4 bits: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-4bit
- Modelo borrador: https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2
- Paquete complementario denso: https://huggingface.co/incoai/Qwen3.8-27B-Splash
- Homebrew: https://brew.sh
