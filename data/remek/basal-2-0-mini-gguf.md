# Remek/basal-2.0-mini-GGUF

## Resumen

basal-2.0-mini-GGUF es la distribución en formato GGUF del modelo basal-2.0-mini, un modelo de decisión tipada de 1.5B parámetros desarrollado por Remek y construido sobre el modelo base speakleash/Bielik-1.5B-v3.0-Instruct. A diferencia de un modelo de chat convencional, basal está diseñado para emitir decisiones estructuradas (elección entre opciones, sí/no y puntuaciones calibradas) leyendo las log-probabilidades de los códigos de opción, en lugar de generar texto libre. El repositorio incluye los pesos en cuantización Q8_0 y Q5_K_M, junto con ficheros de calibración y Modelfiles para Ollama y llama.cpp.

El modelo resuelve el problema de obtener clasificaciones calibradas y deterministas a partir de un LLM pequeño, evitando la fragilidad del parseo de texto generado. Su API de decisión tipada se sirve mediante el motor `basal-serve`, que se coloca delante de Ollama o llama.cpp y renderiza el prompt propio del modelo, leyendo las log-probabilidades de las opciones. Está orientado a idiomas polaco e inglés y se publica bajo licencia Apache 2.0.

Este release es relevante porque valida que las cuantizaciones GGUF conservan fielmente el comportamiento del modelo bf16 original: Q8_0 alcanza un acuerdo de 0.9769 con bf16 en decisiones de 2 a 10 opciones y 1.0000 en el margen de referencia, con una diferencia de precisión de solo -0.0004 y una variación de ECE de -0.0019, superando los umbrales de calidad definidos por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Bielik-1.5B-v3.0-Instruct) |
| Parametros totales | 1.596.507.648 (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en modo Ollama; configurable en llama.cpp (`-c`, p. ej. 8.192) |
| Tipos de cuantizacion | Q8_0 (recomendada) y Q5_K_M |
| Idiomas soportados | pl, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer de 1.5B parámetros cuyo checkpoint base es speakleash/Bielik-1.5B-v3.0-Instruct, un modelo instructivo orientado al polaco. Sobre esa base, basal-2.0-mini redefine la interfaz de inferencia: en lugar de generar texto, el motor `basal-serve` renderiza un prompt propio y lee las log-probabilidades asociadas a los códigos de cada opción, produciendo decisiones tipadas (elección, sí/no, puntuación). No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO específicas para basal.

La innovación técnica principal es la capa de decisión calibrada: el repositorio incluye ficheros de calibración (`CALIBRATION.json` con la calibración del modelo bf16 como valor por defecto, y `CALIBRATION.llamacpp.json` para LM Studio) que ajustan temperaturas y umbrales por modo de ejecución. Además, el autor publica una validación sistemática de puertos ("ports") frente a bf16, midiendo acuerdo en la opción elegida, acuerdo en el margen de referencia, diferencia de precisión y diferencia de ECE, con umbrales explícitos de aceptación por tier. La cuantización se generó con `imatrix`, según las etiquetas del repositorio.

## Capacidades

- Toma de decisiones tipadas: elección entre 2 y 10 opciones (hasta 26 opciones en LM Studio), respuestas sí/no y puntuaciones calibradas.
- Clasificación calibrada con métricas de ECE controladas frente al modelo bf16.
- Lectura de log-probabilidades de los códigos de opción para producir decisiones deterministas, sin parseo de texto libre.
- Generación de texto conversacional (heredada del modelo base Bielik-1.5B-v3.0-Instruct), aunque el valor diferencial está en la capa de decisión.
- Soporte multilingüe limitado a polaco e inglés.
- Integración con Ollama (0.12.11 o superior), llama.cpp (`llama-server`) y LM Studio (0.4.26 o superior, canal beta, motor llama.cpp 2.65.1+).
- Exportación de metadatos de decisión a cualquier GGUF mediante `basal-export-gguf`, sin modificar los tensores.
- Servicio concurrente mediante `--http-parallel N` (con `OLLAMA_NUM_PARALLEL` o `llama-server -np`).
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, visión ni audio para este modelo.

## Casos de uso

- Enrutamiento de decisiones en aplicaciones: usar basal-serve para elegir entre un conjunto acotado de opciones (por ejemplo, categorías de incidencia o intenciones de usuario) leyendo log-probabilidades, lo que evita el parseo frágil de texto generado.
- Moderación y filtrado binario: decisiones sí/no calibradas con umbrales ajustables mediante los ficheros de calibración, adecuadas para pipelines donde se requiere una tasa de falsos positivos controlada.
- Clasificación de documentos cortos en polaco o inglés: con contexto de hasta 4.096 tokens en Ollama o ampliable en llama.cpp, para etiquetado de tickets, correos o reseñas.
- Puntuación y ranking: uso de las puntuaciones calibradas para ordenar candidatos (por ejemplo, relevancia de respuestas o prioridad de casos) con ECE medido frente a bf16.
- Despliegue en escritorio y portátil: los ficheros Q8_0 (1,6 GB) y Q5_K_M (1,1 GB) permiten ejecutar el modelo en equipos sin GPU de servidor mediante Ollama o llama.cpp.
- Integración en LM Studio: los ficheros `-decision.gguf` exponen los endpoints `/v1/systemone` y `/v1/decisions` para pruebas y prototipado rápido de decisiones tipadas.
- Validación de cuantizaciones en CI: usar las métricas de acuerdo con bf16 publicadas por el autor como referencia para comprobar que una nueva cuantización no degrada la capa de decisión.

## Benchmarks y rendimiento

Los datos disponibles corresponden a la validación de los puertos frente al modelo bf16 sobre el conjunto de desarrollo dev v2 (para las filas MLX, cada segunda decisión de dev v2, 1.700 decisiones). No son benchmarks de tareas estándar, sino comprobaciones de la capa de decisión.

| Paquete | Acuerdo con bf16 (opciones 2-10) | Acuerdo con margen >= 0.2 | Diferencia de precisión | Diferencia de ECE | Tamano | Velocidad | Gate |
|---|---|---|---|---|---|---|---|
| FP8 | 0.9333 | 0.9937 | -0.0077 | -0.0032 | 1.8 GB | 103.5 dec/s c16, c1 p50 14 ms (H100) | PASS |
| GGUF Q8_0 | 0.9769 | 1.0000 | -0.0004 | -0.0019 | 1.6 GB | no medida en este release | PASS |
| GGUF Q5_K_M | 0.9339 | 0.9931 | -0.0006 | -0.0016 | 1.1 GB | no medida en este release | PASS |
| MLX 8-bit | 0.9792 | 1.0000 | -0.0025 | +0.0024 | 1.7 GB | 93 ms c1 p50, 223 ms para 5 preguntas (Mac) | PASS |

Umbrales del tier: acuerdo 2-10 >= 0.9161, acuerdo con margen de referencia >= 0.2 >= 0.9858, precisión dentro de 1 punto de bf16 y ECE como máximo +0.01. Los resultados propios del modelo (no de los puertos) se publican en la ficha de basal-2.0-mini. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6 GB para Q8_0 y 1,1 GB para Q5_K_M, más el overhead del runtime (Ollama o llama.cpp).
- GPU recomendadas: no se especifican en la información disponible; el autor indica que GGUF es la vía lenta para lotes y está pensada para escritorio y portátil, no para servidores. Como referencia, el puerto FP8 reporta 103.5 decisiones/s con concurrencia 16 y p50 de 14 ms con concurrencia 1 en H100.
- Cabe en GPU de consumo: sí, dado el tamaño de 1,1-1,6 GB, aunque no se enumeran modelos concretos de GPU en la información disponible.
- Opciones de despliegue: Ollama 0.12.11+, llama.cpp (`llama-server`), modo `gguf` en proceso con `basal[gguf]` (llama-cpp-python) y LM Studio 0.4.26+ (beta, motor llama.cpp 2.65.1+).
- Latencia y throughput: no medidos para GGUF en este release. Para el puerto MLX 8-bit se reportan 93 ms p50 con concurrencia 1 y 223 ms para 5 preguntas en Mac.
- Contexto: Ollama limita a 4.096 tokens por prompt (basal-serve envía `num_ctx 4096`, que sobrescribe el Modelfile); estados más largos se truncan por el centro y se señalan con `usage.truncated`. Para documentos largos, usar `llama-server -c 8192` o `--mode gguf`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| basal-2.0-mini-GGUF (este) | 1.5B | 4.096 (Ollama) / configurable | Decisión tipada calibrada | Apache 2.0 | GGUF (Q8_0, Q5_K_M) |
| basal-2.0-mini-FP8 | 1.5B | no disponible | Decisión tipada calibrada | Apache 2.0 | FP8 |
| basal-2.0-mini-MLX-8bit | 1.5B | no disponible | Decisión tipada calibrada | Apache 2.0 | MLX 8-bit |
| speakleash/Bielik-1.5B-v3.0-Instruct | 1.5B | no disponible | Instructivo general (base) | no disponible en la información | safetensors |

Las alternativas comparables directas son los otros puertos del mismo modelo (FP8, MLX 8-bit), que comparten arquitectura y licencia pero difieren en formato y velocidad. El modelo base Bielik-1.5B-v3.0-Instruct es la referencia de origen, aunque no ofrece la capa de decisión tipada. No se dispone en la información proporcionada de comparaciones con modelos de decisión de otros autores.

## Limitaciones y advertencias

- El modelo está especializado en decisiones tipadas; un `ollama run` directo solo devuelve texto libre, sin las respuestas tipadas, que requieren `basal-serve` delante del runtime.
- Ollama devuelve como máximo 20 log-probabilidades por posición, por lo que las preguntas con más de 20 opciones requieren llama.cpp.
- El contexto en modo Ollama está limitado a 4.096 tokens y los estados más largos se truncan por el centro, lo que puede perder información relevante.
- LM Studio finaliza las peticiones a los 30 s, por lo que documentos muy largos deben dividirse.
- Idiomas limitados a polaco e inglés; el rendimiento en castellano no está documentado.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible; al derivar de un modelo instructivo, hereda los sesgos del corpus de entrenamiento del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base Bielik-1.5B-v3.0-Instruct, no detalladas en la información proporcionada.
- GGUF es la vía lenta para lotes y no está pensada para servidores; para alto throughput conviene evaluar FP8 u otros formatos.
- La velocidad no se ha medido en este release, por lo que no hay garantías de latencia en producción.
- LM Studio requería canal beta (0.4.26+) en el momento de la publicación, lo que implica menor estabilidad.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Remek/basal-2.0-mini-GGUF
- Modelo bf16 de referencia: https://huggingface.co/Remek/basal-2.0-mini
- Puerto FP8: https://huggingface.co/Remek/basal-2.0-mini-FP8
- Puerto MLX 8-bit: https://huggingface.co/Remek/basal-2.0-mini-MLX-8bit
- Colección basal-2.0: https://huggingface.co/collections/Remek/basal-20-6acd1712a8e443c86cd576fc
- Modelo base: https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Documentación de basal-omni (imágenes y audio, experimental): https://github.com/rkinas/basal#images-and-audio-basal-omni-experimental
