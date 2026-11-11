# luny140/QwenPaw-Flash-9B-heretic-MTP-GGUF

## Resumen
QwenPaw-Flash-9B-heretic-MTP es una versión modificada del modelo QwenPaw-Flash-9B, a su vez derivado de Qwen3.5-9B. El autor, luny140, ha aplicado una ablación de seguridad (abliteration) con la herramienta Heretic v1.3.0 para eliminar los mecanismos de rechazo del modelo original, y ha reinyectado la cabeza de predicción multi-token (MTP) que se había eliminado durante el ajuste fino de QwenPaw. El resultado es un modelo "uncensored" orientado a agentes y tool calling, distribuido exclusivamente en formato GGUF.

La relevancia técnica del modelo radica en la recuperación de la decodificación especulativa MTP, que según el autor permite aceleraciones de entre 1,7 y 4,1 veces en inferencia sobre benchmarks de agentes, manteniendo o mejorando la precisión. Está pensado para despliegue local en GPUs de consumo, como demuestra el entorno de pruebas declarado con una RTX 5070 Ti de 16 GB.

El modelo se publica bajo licencia Apache 2.0 y soporta inglés y chino. El repositorio tiene un tamaño de 42,5 GB, lo que refleja múltiples cuantizaciones GGUF. No obstante, el dato de parámetros totales reportado en safetensors (456 millones) es incoherente con la denominación "9B" y con el tamaño del repositorio, por lo que debe tratarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B) con cabeza MTP para decodificación especulativa |
| Parámetros totales | 456.010.480 según safetensors (dato incoherente con la denominación "9B"; el nombre del modelo indica 9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (se menciona Q6_K en el entorno de pruebas; el resto de cuantizaciones del repo no se detallan) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-9B y del ajuste fino QwenPaw-Flash-9B de agentscope-ai, orientado a tareas de agente y tool calling. Sobre esa base se aplicó abliteration con Heretic v1.3.0, una técnica que identifica y neutraliza las direcciones de activación asociadas a comportamientos de rechazo, produciendo una variante sin censura. Adicionalmente, se reinyectaron los pesos de la cabeza MTP del Qwen3.5-9B original, que habían sido eliminados durante el proceso de ajuste fino de QwenPaw.

La innovación principal es la reconstrucción de la cabeza MTP para habilitar decodificación especulativa en llama.cpp mediante el flag `--spec-type draft-mtp`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base. Tampoco se detalla la arquitectura interna más allá de su origen en la familia Qwen3.5.

## Capacidades
- Generación de texto y razonamiento general, heredados de Qwen3.5-9B.
- Soporte de tool calling y function calling, reforzado por el ajuste fino de QwenPaw.
- Orientación a flujos de agente y razonamiento multi-paso.
- Decodificación especulativa mediante cabeza MTP, con aceleración declarada de 1,7 a 4,1 veces.
- Comportamiento sin censura (abliterated), sin rechazos ante peticiones que el modelo base declinaría.
- Capacidades multilingües limitadas a inglés y chino.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso
- Automatización de agentes locales: el modelo puede ejecutar bucles de razonamiento y llamadas a herramientas en entornos de escritorio con GPU de consumo, aprovechando la decodificación especulativa MTP para reducir la latencia por paso.
- Asistentes de código en pipelines de CI/CD: su soporte de tool calling permite integrarlo en flujos que invocan linters, compiladores o APIs de repositorios, con la ventaja de un despliegue local sin dependencia de servicios externos.
- Procesamiento de documentación técnica en inglés y chino: adecuado para tareas de resumen, extracción y transformación de textos en ambos idiomas.
- Investigación sobre alineación y seguridad: al ser una variante abliterated, sirve para estudiar el comportamiento de modelos sin mecanismos de rechazo y comparar con la versión original.
- Evaluación de decodificación especulativa: útil como banco de pruebas para medir el impacto real de la cabeza MTP en throughput y precisión sobre hardware modesto.
- Prototipado de agentes con BenchLocal: el autor proporciona resultados de esta suite, lo que facilita reproducir y comparar configuraciones de agente en local.
- Generación de contenido sin restricciones de rechazo en entornos controlados de investigación, asumiendo la responsabilidad de moderación por parte del operador.

## Benchmarks y rendimiento
El autor reporta resultados en la suite BenchLocal, ejecutada una sola vez por escenario, sin reintentos, sobre una RTX 5070 Ti de 16 GB con llama.cpp (build turboquant) y cuantización Q6_K.

| Benchmark | Puntuación | Precisión | Tiempo |
|---|---|---|---|
| BenchLocal Total | 4035/5000 | 80,7% | no disponible |

No se han publicado en la información disponible resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos similares.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; el autor valida el modelo en Q6_K sobre una GPU de 16 GB, lo que sugiere que las cuantizaciones Q6_K y menores caben en ese rango.
- GPU recomendadas: RTX 5070 Ti (16 GB) según el entorno de pruebas del autor; previsiblemente también RTX 4090, A100 y H100 para cuantizaciones mayores o mayor throughput.
- GPU de consumo: sí, cabe en GPUs de 16 GB con cuantizaciones Q6_K o inferiores; cuantizaciones más bajas podrían caber en GPUs de 8-12 GB, aunque no se confirma.
- Opciones de despliegue: llama.cpp con soporte de `--spec-type draft-mtp` para aprovechar la decodificación especulativa; otras opciones (vLLM, TGI, Ollama) no se documentan.
- Latencia y throughput: el autor declara aceleraciones de 1,7 a 4,1 veces gracias a MTP, sin cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| QwenPaw-Flash-9B-heretic-MTP (este) | 9B (denominación) | no disponible | apache-2.0 | GGUF | Abliterated con MTP reinyectado |
| QwenPaw-Flash-9B-heretic-GGUF | 9B (denominación) | no disponible | apache-2.0 | GGUF | Versión sin MTP del mismo autor |
| QwenPaw-Flash-9B (agentscope-ai) | 9B (denominación) | no disponible | no disponible | no disponible | Modelo base ajustado para agentes |
| Qwen3.5-9B | 9B (denominación) | no disponible | no disponible | no disponible | Modelo base original de Qwen |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias
- El dato de parámetros totales en safetensors (456 millones) contradice la denominación "9B" y el tamaño del repositorio (42,5 GB); conviene verificar las dimensiones reales antes de planificar el despliegue.
- Al ser una variante abliterated, el modelo carece de mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, sesgado o inapropiado sin filtro.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en tareas de razonamiento complejo o datos factuales.
- Soporte lingüístico limitado a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- No se especifica la longitud de contexto, lo que dificulta planificar casos de uso con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero el operador asume toda la responsabilidad sobre el contenido generado y su moderación.
- La decodificación especulativa MTP requiere builds específicos de llama.cpp (turboquant) y el flag `--spec-type draft-mtp`; no se garantiza compatibilidad con otras herramientas de inferencia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces
- Hugging Face: https://huggingface.co/luny140/QwenPaw-Flash-9B-heretic-MTP-GGUF
- Versión sin MTP: https://huggingface.co/SC117/QwenPaw-Flash-9B-heretic-GGUF
- Documentación en chino: https://huggingface.co/SC117/QwenPaw-Flash-9B-heretic-MTP-GGUF/blob/main/README_zh.md
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- BenchLocal (suite de evaluación): https://github.com/stevibe/benchlocal
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base QwenPaw-Flash-9B: https://huggingface.co/agentscope-ai/QwenPaw-Flash-9B
