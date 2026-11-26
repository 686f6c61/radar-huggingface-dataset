# Joakimpalm-Zen/gemma-4-E2B-it-Q4_0-GGUF

## Resumen

`gemma-4-E2B-it-Q4_0-GGUF` es una cuantización GGUF del modelo instructivo `google/gemma-4-E2B-it`, publicada por el usuario Joakimpalm-Zen dentro del ecosistema de su motor de inferencia Xyntetik Runner. No se trata de un modelo original: es un artefacto derivado, empaquetado con una mezcla de cuantización Q4_K_M y Q4_0, pensado para ejecutarse en máquinas con 8 GB de memoria mediante un binario C11 sin dependencias. El modelo base pertenece a la familia Gemma 4 de Google en su variante "E-series" (con embeddings por capa), con 4.647.450.147 parámetros totales según los pesos en safetensors del modelo original.

La relevancia de esta publicación no está en la fidelidad respecto al modelo padre —el propio autor declara explícitamente que el archivo "falla el umbral de fidelidad" y lo publica como fichero de arranque rápido para equipos de 8 GB, no como una afirmación de calidad—, sino en el runtime que lo acompaña. Xyntetik Runner implementa una técnica de recuperación de truncamiento forzado en llamadas a herramientas: cuando una tool call excede su presupuesto de tokens, el motor cierra el documento JSON a la estructura mínima legal según el esquema, de modo que los argumentos siguen siendo parseables. El autor presenta mediciones comparativas frente a vLLM 0.27.1, llama.cpp b10488, Ollama 0.32.14, TensorRT-LLM 1.2.1 y SGLang 0.5.17 en las que solo Runner devuelve una llamada ejecutable con presupuestos de 1 a 16 tokens.

El archivo ocupa 2,63 GB en disco y se distribuye bajo licencia Apache 2.0. La información disponible sobre el modelo base es limitada: no se detallan la longitud de contexto, la composición del dataset de entrenamiento ni los idiomas soportados, por lo que buena parte de las especificaciones del modelo subyacente quedan como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E-series con embeddings por capa); detalles completos no disponibles |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla Q4_K_M / Q4_0 (fichero `gemma-4-E2B-it-Q4_K_M-Q4_0-mix.gguf`); el repo se etiqueta como Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único de 2,63 GB); el modelo base en safetensors |
| Modelo base | google/gemma-4-E2B-it |
| Tamano del repositorio | 2,6 GB |
| Motor recomendado | Xyntetik Runner (binario C11, CPU/CUDA/Metal, servidor compatible con OpenAI) |
| Descargas / likes | 254 / 2 |
| Fecha de creacion | 2026-08-08 |
| Ultima actualizacion | 2026-10-27 |

## Arquitectura y entrenamiento

El modelo subyacente es `google/gemma-4-E2B-it`, un transformer de la familia Gemma 4 en su variante E-series, que la model card etiqueta con `per-layer-embeddings`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO en el ajuste instructivo. Tampoco se documentan innovaciones de atención (attention linear, decodificación especulativa u otras) en el material proporcionado.

Lo que sí está documentado es el proceso de cuantización: el autor genera un GGUF con una mezcla de Q4_K_M y Q4_0, e incluye la etiqueta `imatrix`, lo que sugiere el uso de matrices de importancia para guiar la cuantización. El autor reconoce que el resultado no alcanza su umbral interno de fidelidad respecto al padre y lo posiciona como fichero de conveniencia para hardware limitado. Las herramientas de recuantización, poda de expertos y eliminación de subcapas están publicadas en el repositorio de Xyntetik Runner.

## Capacidades

- Generación de texto conversacional en modo instructivo (`-it`), según el pipeline declarado `text-generation`.
- Soporte de tool calling / function calling a través del servidor compatible con OpenAI de Xyntetik Runner.
- Recuperación de truncamiento forzado: cuando una llamada a herramienta agota el presupuesto de tokens, el runtime emite un cierre JSON legal según el esquema, preservando la parseabilidad de los argumentos.
- Decodificación restringida por esquema: el autor reporta conformidad de esquema y selección de herramienta al 100 % hasta Q4_0 en su escalera de cuantización, con acuerdo de argumentos degradándose al 50 %.
- Ejecución en CPU, CUDA y Metal mediante un único binario sin dependencias.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio, modo thinking u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- **Agentes locales con presupuesto de tokens ajustado**: en un bucle de agente que ejecuta herramientas en local, el truncamiento de una tool call suele romper el bucle y forzar un reintento completo. Con Runner, la llamada se cierra de forma legal y el agente puede continuar o registrar el fallo de argumentos sin reiniciar el ciclo.
- **Prototipado en portátiles de 8 GB**: el fichero de 2,63 GB cabe con holgura en un Mac de 8 GB o en una GPU consumer con 8 GB de VRAM, lo que permite levantar un endpoint compatible con OpenAI en local sin instalar Python ni dependencias.
- **Pruebas de integración de pipelines de tool calling**: al exponer una API compatible con OpenAI en `http://localhost:8080/v1`, se puede apuntar cualquier cliente existente y validar el comportamiento de herramientas y esquemas antes de desplegar en producción con un modelo mayor.
- **Evaluación comparativa de motores de inferencia**: sirve como caso de prueba reproducible para medir cómo responde cada motor (vLLM, llama.cpp, Ollama, SGLang) ante truncamiento de llamadas, dado que el autor publica la metodología y los resultados brutos.
- **Generación de texto conversacional offline**: para asistentes o utilidades de escritorio que requieren privacidad total y no pueden enviar datos a la nube, al ejecutarse íntegramente en local sobre CPU o Metal.
- **Banco de pruebas de cuantización**: útil para estudiar la degradación de conformidad de esquema y de acuerdo de argumentos a lo largo de una escalera de cuantizaciones, ya que el autor documenta el comportamiento hasta Q4_0.
- **Base para recuantización o poda**: el repositorio de Runner incluye herramientas de recuantización y poda de subcapas, por lo que este GGUF puede servir como punto de partida para experimentos de compresión adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor declara explícitamente que el fichero falla su umbral de fidelidad respecto al modelo padre.

Los únicos datos medidos que se aportan son de comportamiento del runtime ante truncamiento de tool calls, con el mismo equipo, mismo esquema, mismo prompt, `tool_choice:"required"`, temperatura 0 y presupuestos de 1 a 64 tokens:

| Motor | Presupuesto insuficiente (1-16 tokens) | Presupuesto suficiente (64 tokens) |
|---|---|---|
| Xyntetik Runner | Tool calls ejecutables, argumentos parseables | Completa |
| vLLM 0.27.1 | Sin llamada; el framing del protocolo se filtra en `content` | Completa |
| llama.cpp b10488 | Sin llamada; filtración y luego `tool_calls` con argumentos no parseables | Completa |
| Ollama 0.32.14 | Sin llamada; contenido vacío y después HTTP 500 | Completa |
| TensorRT-LLM 1.2.1 (medido con Qwen3-1.7B) | Sin llamada; filtración de `<tool_call>` y contenido vacío | Completa |
| SGLang 0.5.17 (medido con Qwen3-1.7B) | Sin llamada; filtración de `<tool_call>` y contenido vacío | Completa |

El autor advierte que TensorRT-LLM y SGLang se midieron sobre un sustituto Qwen3-1.7B, y que la recuperación de truncamiento es una propiedad del runtime, no del modelo. Adicionalmente, reporta que la conformidad de esquema y la selección de herramienta se mantienen al 100 % hasta Q4_0 en su escalera de cuantización, con el acuerdo de argumentos cayendo al 50 %.

## Requisitos de hardware

- **VRAM estimada**: el fichero GGUF ocupa 2,63 GB en disco; con overhead de contexto y caché KV, cabe en GPUs de 8 GB y en sistemas con 8 GB de memoria unificada.
- **GPU recomendadas**: el autor menciona explícitamente Apple Silicon (Metal) y builds para Linux y Windows con soporte CUDA. No se detallan modelos concretos de GPU (A100, H100, RTX 4090) en la información disponible.
- **GPU consumer**: sí, cabe en tarjetas de 8 GB de VRAM o superiores, y en Macs de 8 GB de memoria unificada.
- **Opciones de despliegue**: Xyntetik Runner (recomendado por el autor, binario único de 600 KB, CPU/CUDA/Metal, servidor compatible con OpenAI). El formato GGUF es además compatible con llama.cpp y, por extensión, con Ollama, aunque el autor no valida esas rutas.
- **Latencia y throughput**: no disponibles. No se publican mediciones de tokens por segundo para este fichero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-E2B-it-Q4_0-GGUF (este) | 4.647.450.147 | no disponible | GGUF Q4_K_M/Q4_0, 2,63 GB | Apache 2.0 | Fichero de conveniencia; el autor declara que no alcanza su umbral de fidelidad |
| google/gemma-4-E2B-it (padre) | 4.647.450.147 | no disponible | safetensors | Apache 2.0 | Referencia de fidelidad; requiere más memoria |
| Alternativas de ~4-5B en GGUF | no disponible | no disponible | GGUF | variable | No se dispone de datos comparativos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Fidelidad degradada declarada por el autor**: el propio publicador indica que el fichero falla su umbral de fidelidad respecto a `google/gemma-4-E2B-it`. No debe usarse como referencia de calidad del modelo original.
- **Degradación de argumentos en tool calls**: aunque la forma del esquema se mantiene hasta Q4_0, el acuerdo de argumentos cae al 50 % en la escalera de cuantización medida. En producción, esto implica validar y potencialmente reintentar argumentos.
- **Sesgos**: no se documentan sesgos específicos del modelo base ni de esta cuantización en la información disponible.
- **Alucinación**: no se aportan evaluaciones de tasa de alucinación. Al ser una cuantización agresiva (Q4), es razonable esperar degradación adicional, pero no hay medición publicada.
- **Contexto e idiomas**: la longitud de contexto y los idiomas soportados no están documentados en el material disponible, lo que impide garantizar comportamiento multilingüe o conversaciones de contexto largo.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base `google/gemma-4-E2B-it`, ya que la ficha no detalla condiciones adicionales de Google.
- **Dependencia del runtime**: el autor posiciona el fichero como el quickstart de Xyntetik Runner. El comportamiento diferencial de recuperación de truncamiento solo está garantizado en ese motor; en otros motores el archivo se comporta como un GGUF Q4 convencional.
- **Madurez del ecosistema**: el proyecto tiene 254 descargas y 2 likes, y el motor está en desarrollo activo con validaciones por release. No hay evidencia de despliegues a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Joakimpalm-Zen/gemma-4-E2B-it-Q4_0-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de Xyntetik Runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Colección Runner Releases: https://huggingface.co/collections/Joakimpalm-Zen/runner-releases-6aa98baaed03bba0e8a561ae
- Documentación de soporte de modelos (roster): https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md#gemma-4-e2b-it-q4_k_m-q4_0-mix
- Benchmark de truncamiento: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/truncation-benchmark.md
- Resultados de la comunidad: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/community-results.md
- Conversión y herramientas de modelos: https://github.com/Joakimpalm-Zen/xyntetik-runner#models-and-conversion
- Solicitud de modelos: https://github.com/Joakimpalm-Zen/xyntetik-runner/issues/new?template=model_request.yml
- Reporte de resultados: https://github.com/Joakimpalm-Zen/xyntetik-runner/issues/new?template=result_report.yml
- Releases del binario: https://github.com/Joakimpalm-Zen/xyntetik-runner/releases/latest
- Otros ficheros del autor: https://huggingface.co/Joakimpalm-Zen
