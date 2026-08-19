# mlboydaisuke/gpt-oss-20b-CoreAI-official

## Resumen

El repositorio `mlboydaisuke/gpt-oss-20b-CoreAI-official` contiene un bundle pre-convertido en formato `.aimodel` del modelo `openai/gpt-oss-20b`, un modelo de lenguaje de tipo MoE (mezcla de expertos) desarrollado por OpenAI. La conversión ha sido realizada siguiendo la receta oficial de exportación de Apple Core AI, publicada en el repositorio `apple/coreai-models`, y se presenta como un artefacto de construcción reproducible con hashes SHA-256 y métricas de rendimiento medidas en hardware Apple Silicon. El objetivo principal es facilitar la ejecución local de este modelo en Macs con chip Apple Silicon sin necesidad de realizar la conversión uno mismo, que requiere una gran cantidad de memoria RAM (el autor indica que la exportación se hizo en un Mac con 128 GB).

La relevancia de este bundle radica en que la conversión a `.aimodel` no es una función pura de la receta: el mismo comando de exportación produjo un artefacto 2,2 veces más lento al pasar de macOS 26 a macOS 27 beta. Por tanto, alojar los artefactos ya convertidos con sus hashes y mediciones proporciona una base reproducible para desarrolladores e investigadores que quieran evaluar el rendimiento real del modelo en entornos Apple. El repositorio incluye el bundle para macOS con cuantización MXFP4 (la misma que distribuye OpenAI) y documenta el entorno de exportación exacto, así como instrucciones de ejecución mediante la CLI de Core AI o la aplicación de chat CoreAIChatMac.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) según la model card |
| Parametros totales | no disponible (el nombre del modelo sugiere 20B, pero no se especifica en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (según la model card, "as shipped by OpenAI") |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (bundle de Apple Core AI, contiene `main.mlirb`) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo original (número de expertos, dimensiones, etc.) ni sobre su entrenamiento (datos, número de tokens, técnicas de alineación). Solo se indica que se trata de un modelo MoE de 20B y que el bundle exportado utiliza cuantización MXFP4, que es el formato de precisión mixta de Apple para aceleración en sus chips.

El proceso de conversión se realiza mediante la herramienta `coreai.llm.export` del paquete `coreai` de Apple, ejecutada en un entorno específico: macOS 27.0 beta, Xcode 27.0, `coreai-core 1.0.0b1`, `coreai-torch 0.4.0`, `coreai-opt 0.2.0` y `torch 2.9.0`. El código de exportación es idéntico al upstream en `apple/coreai-models` (commit `b1cb71b`). El autor destaca que el artefacto resultante no es una función pura de la receta, sino que depende de la versión del sistema operativo y las herramientas, lo que justifica la publicación de los bundles ya convertidos con sus hashes.

## Capacidades

La información proporcionada no detalla las capacidades funcionales del modelo (generación de texto, razonamiento, código, tool calling, etc.). La model card se centra exclusivamente en el formato de exportación y el rendimiento de inferencia. Por tanto, las capacidades que se pueden enumerar se limitan a lo observable en el repositorio:

- Ejecución local en macOS mediante la CLI `llm-runner` o `llm-benchmark` de Core AI.
- Chat interactivo a través de la aplicación CoreAIChatMac, apuntando al directorio del bundle descargado.
- Compilación AOT para iOS (por ejemplo, para iPhone 17 Pro con arquitectura `h18p`) usando `xcrun coreai-build compile`, lo que permite desplegar el modelo en dispositivos móviles con Neural Engine.
- Control del consumo de memoria en prefill mediante la variable de entorno `COREAI_CHUNK_THRESHOLD`, que permite ajustar el equilibrio entre velocidad y huella de memoria.
- Medición de rendimiento reproducible gracias a los hashes SHA-256 del artefacto y las métricas publicadas.

No se mencionan capacidades como soporte multilingüe, function calling, agentes o modo de razonamiento extendido. Estas quedan sin especificar.

## Casos de uso

- Inferencia local en Macs Apple Silicon: el bundle permite ejecutar el modelo gpt-oss-20b en un Mac con suficiente RAM sin necesidad de convertir el modelo manualmente. Es adecuado para desarrolladores que quieran probar el modelo en local, por ejemplo, para generación de texto o experimentación, aprovechando el rendimiento medido de 78,1 tokens/s en decodificación en un M4 Max.
- Benchmarking reproducible en Apple Silicon: gracias a los hashes y al entorno documentado, los investigadores pueden reproducir las mediciones de rendimiento (decode, prefill, tiempo de carga, uso de memoria) y comparar entre versiones de macOS o configuraciones de hardware.
- Desarrollo de aplicaciones de chat locales: mediante CoreAIChatMac, se puede integrar el modelo en una interfaz de chat sin conexión, útil para prototipos o herramientas internas que requieran privacidad de datos.
- Despliegue en iOS con Neural Engine: tras la compilación AOT para la arquitectura objetivo (por ejemplo, `h18p`), el modelo puede ejecutarse en iPhone 17 Pro, habilitando asistentes o generadores de texto en el dispositivo con baja latencia.
- Ajuste del equilibrio prefill/memoria: la variable `COREAI_CHUNK_THRESHOLD` permite configurar el modelo para entornos con restricciones de memoria, como prefill sin fragmentación (4096 tokens a 1.439 tok/s con 18 GB) o con fragmentación de 128 tokens (766 tok/s con solo 1,7 GB de huella).
- Integración en pipelines de evaluación de modelos: el bundle sirve como referencia estable para medir el impacto de cambios en el stack de Core AI o en el sistema operativo, tal como se documenta en el repositorio `apple-silicon-llm-bench`.

## Benchmarks y rendimiento

La model card incluye una tabla de mediciones realizadas con la herramienta oficial `llm-benchmark` de Apple, en modo greedy, sobre un M4 Max con 512 peticiones y 1024 generaciones:

| Bundle | Protocol | Decode (tok/s) | Prefill (tok/s) | Load (warm) | Peak RSS |
|---|---|---|---:|---:|---:|---:|
| macos | M4 Max, 512p/1024g | 78,1 | 1.252 | 2,1 s | 33,9 GB |

Además, se indica que `COREAI_CHUNK_THRESHOLD` afecta al prefill: sin fragmentación (4096 tokens) se obtienen 1.439 tok/s con 18 GB de huella sucia, mientras que con fragmentación de 128 tokens se obtienen 766 tok/s con solo 1,7 GB. No se proporcionan comparaciones con otros modelos ni resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El bundle está diseñado para Apple Silicon (macOS). La exportación original requirió un Mac con 128 GB de RAM, pero la ejecución solo necesita suficiente RAM para mapear el artefacto en memoria (el pico de RSS medido es de 33,9 GB en M4 Max).
- GPU recomendada: no aplica; se usa la CPU/GPU unificada de Apple Silicon. Las mediciones se realizaron en un M4 Max.
- El modelo cabe en Macs con al menos 36-48 GB de RAM unificada, dado el pico de RSS de 33,9 GB. En configuraciones con menos memoria, se puede reducir la huella usando `COREAI_CHUNK_THRESHOLD` (por ejemplo, 1,7 GB en prefill fragmentado).
- Para iOS, se requiere compilación AOT con `xcrun coreai-build compile` y un dispositivo compatible (por ejemplo, iPhone 17 Pro con arquitectura `h18p`).
- Opciones de despliegue: CLI (`llm-runner`), benchmark (`llm-benchmark`), aplicación CoreAIChatMac, y bundles iOS compilados. No se mencionan servidores de inferencia como vLLM u Ollama, ya que el formato `.aimodel` es específico de Apple Core AI.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos o formatos. El repositorio se centra en el bundle específico de gpt-oss-20b para Apple Silicon, sin referencias a alternativas como versiones en GGUF o cuantizaciones diferentes.

## Limitaciones y advertencias

- El bundle es un artefacto de construcción específico para Apple Core AI; no es un modelo en formato estándar (safetensors, GGUF) y solo puede ejecutarse con las herramientas de Core AI en macOS o iOS.
- La reproducibilidad depende de la versión del sistema operativo y de las herramientas: el autor documenta que el mismo comando de exportación produjo un artefacto 2,2 veces más lento entre macOS 26 y macOS 27 beta. Por tanto, los resultados de rendimiento pueden variar en otros entornos.
- El modelo original (gpt-oss-20b) puede tener sesgos o limitaciones inherentes, pero no se dispone de información sobre ellos en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero el bundle depende de las tecnologías de Apple Core AI, cuyas condiciones de uso deben verificarse.
- Para iOS, el bundle debe compilarse AOT antes de su uso en dispositivo; no se puede ejecutar directamente.
- No se especifican los idiomas soportados ni las capacidades multilingües del modelo subyacente.
- El tamaño del repositorio es de 27,6 GB, lo que requiere un ancho de banda y almacenamiento considerables para su descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlboydaisuke/gpt-oss-20b-CoreAI-official
- Repositorio de recetas de exportación de Apple Core AI: https://github.com/apple/coreai-models
- Repositorio de benchmarks en Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench (incluye metodología y forense sobre la variabilidad de exportación)
- Repositorio de modelos comunitarios Core AI: https://github.com/john-rocky/coreai-model-zoo
- Repositorio de aplicaciones de ejemplo Core AI: https://github.com/john-rocky/coreai-samples (incluye CoreAIChatMac)
