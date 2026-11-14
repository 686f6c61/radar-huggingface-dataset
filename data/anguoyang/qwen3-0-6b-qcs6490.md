# anguoyang/qwen3-0.6b-qcs6490

## Resumen

Qwen3-0.6B QCS6490 es un artefacto de despliegue derivado del modelo base Qwen/Qwen3-0.6B, publicado por el usuario anguoyang. No se trata de un modelo reentrenado ni ajustado con nuevos datos, sino de una exportación del checkpoint oficial de Qwen3-0.6B al formato de ejecución de Qualcomm (context binary QNN) para su uso con el runtime Genie sobre el SoC QCS6490, presente en el kit Dragonwing RB3 Gen 2 Vision Kit. El paquete incluye pesos pre-cuantizados en w4a16 (checkpoint DEFAULT_W4A16 oficial) y metadatos de compilación y perfilado.

Su relevancia es fundamentalmente de medición: el autor documenta el primer perfilado público de generación de texto con Qwen3-0.6B sobre QCS6490, una plataforma para la que Qualcomm no publica cifras de GenAI en su model zoo (que se limita a teléfonos insignia y X Elite). Los resultados reportados son 1555 tok/s de prefill, 24,6 tok/s de decode y un TTFT de 82 ms con un prompt de 128 tokens y contexto de 512.

El modelo hereda del Qwen3-0.6B original la arquitectura transformer densa de Qwen3, con licencia Apache 2.0. La model card no aporta detalles adicionales sobre datos de entrenamiento, idiomas o capacidades más allá del modelo base, por lo que esta ficha se limita a lo verificable en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-0.6B; detalles no disponibles en la model card) |
| Parametros totales | 0,6 mil millones (según denominación del modelo base Qwen3-0.6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens en la configuración perfilada (context length 512, prompt chunk 128); el máximo del modelo base no se detalla en la información disponible |
| Tipos de cuantizacion | w4a16 (checkpoint DEFAULT_W4A16 oficial pre-cuantizado para QNN) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | QNN context binary (runtime Genie); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El artefacto no incluye entrenamiento propio: es una conversión del checkpoint Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros, al formato de ejecución de Qualcomm. La compilación se realizó mediante la API de AI Hub de Qualcomm, con opciones de compilación equivalentes a las del flujo estándar de qai-hub-models, omitiendo el segmento que provocaba el fallo (la opción `--output_names` que el cliente añade de forma incondicional). El servicio de compilación acepta el modelo AIMET sin problemas, según el autor.

La model card documenta dos incidencias del toolkit que impiden la exportación con un solo comando en qai-hub-models 0.66.0: el problema qualcomm/ai-hub-models#366, ya confirmado por el mantenedor con corrección prevista para v0.67.0, y el problema #367, por el que la ruta de llama.cpp no dispone de receta de cuantización para q4_0. El perfilado se ejecutó sobre silicio real (Hexagon v68) con contexto de 512, prompt chunk de 128 y los grafos cl512/ar128/ar1. No hay información sobre datos de entrenamiento, composición del dataset ni fases de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3-0.6B.
- Ejecución en el acelerador Hexagon v68 del QCS6490 mediante el runtime Genie y context binaries QNN.
- Inferencia con pesos w4a16 pre-cuantizados, sin necesidad de cuantización en el dispositivo.
- Perfilado por grafo: embedding prompt (392 µs), embedding token (249 µs), transformer prompt (81.916 µs) y transformer token (40.472 µs).
- Capacidades específicas del modelo base (tool calling, razonamiento multi-paso, multilingüismo, modo thinking) no documentadas en esta model card; deben consultarse en la ficha de Qwen/Qwen3-0.6B.

## Casos de uso

- Evaluación de viabilidad de LLM en SoC de gama media: permite medir prefill, decode y TTFT reales sobre QCS6490 antes de comprometerse con un diseño de producto, usando las cifras de referencia publicadas (1555 tok/s, 24,6 tok/s, 82 ms).
- Prototipado de asistentes locales en dispositivos embebidos: con 24,6 tok/s de decode y TTFT de 82 ms en prompts de 128 tokens, es adecuado para respuestas cortas en interfaces de voz o texto sin dependencia de la nube.
- Benchmarking de pipelines de compilación QNN: el repositorio qcs-bench documenta la cadena manual de compilación y perfilado, útil como referencia reproducible para otros modelos en la misma plataforma.
- Comparación de backends en edge: la ruta Genie/QNN puede contrastarse con alternativas como llama.cpp en el mismo hardware, aunque la receta q4_0 no está disponible en qai-hub-models 0.66.0.
- Clasificación y extracción de información en local: tareas de etiquetado, resumen corto o extracción de entidades sobre textos que quepan en 512 tokens, con latencia predecible.
- Docencia e investigación en IA en el borde: plataforma de bajo coste para estudiar cuantización w4a16, particionado de grafos y comportamiento de TTFT en aceleradores Hexagon.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Prefill | 1555 tok/s | Genie, QNN context binary, w4a16, contexto 512 |
| Decode | 24,6 tok/s | Genie, QNN context binary, w4a16, contexto 512 |
| TTFT | 82 ms | Prompt de 128 tokens |
| Embedding prompt | 392 µs | Grafo cl512 |
| Embedding token | 249 µs | Grafo ar1 |
| Transformer prompt | 81.916 µs | Grafo ar128 |
| Transformer token | 40.472 µs | Grafo ar1 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores son medidas de rendimiento en hardware, no de precisión del modelo.

## Requisitos de hardware

- Plataforma objetivo: Qualcomm QCS6490 con Hexagon v68, en el kit Dragonwing RB3 Gen 2 Vision Kit.
- Memoria: el checkpoint w4a16 de un modelo de 0,6 mil millones de parámetros ocupa del orden de cientos de MB; la model card no especifica el consumo exacto de RAM o VRAM.
- GPU dedicada: no aplica; la inferencia se ejecuta en el acelerador Hexagon del SoC, no en GPU de escritorio.
- Despliegue: runtime Genie con context binaries QNN compilados mediante Qualcomm AI Hub (API directa o qai-hub-models a partir de la versión 0.67.0, según la corrección anunciada).
- Throughput y latencia: 1555 tok/s de prefill, 24,6 tok/s de decode y 82 ms de TTFT en las condiciones perfiladas.
- No cabe en GPU de consumo en el sentido habitual porque el artefacto está compilado para QNN; para ejecución en GPU convencional habría que usar el modelo base Qwen3-0.6B en otro formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anguoyang/qwen3-0.6b-qcs6490 | 0,6 B | 512 (configurado) | QNN context binary / Genie | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible en esta ficha | safetensors y formatos derivados | Apache 2.0 | Hugging Face, modelo base |
| Qwen3-0.6B en llama.cpp | 0,6 B | depende de la configuración | GGUF | Apache 2.0 | Disponible, pero sin receta q4_0 en qai-hub-models 0.66.0 |

No se dispone de datos de rendimiento de los modelos comparables en el mismo hardware QCS6490 en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de despliegue, no un modelo nuevo: su calidad depende íntegramente de Qwen3-0.6B; no se documentan evaluaciones de precisión.
- Contexto configurado de solo 512 tokens, muy inferior al que puede soportar el modelo base; no apto para conversaciones largas o documentos extensos.
- Riesgo de alucinación inherente a un modelo de 0,6 mil millones de parámetros; no recomendado para tareas que exijan alta fiabilidad factual sin verificación.
- La exportación estándar falla en qai-hub-models 0.66.0 (incidencias #366 y #367); la cadena manual documentada en qcs-bench es la vía reproducible actual.
- Compatibilidad limitada al hardware y runtime Qualcomm (QCS6490, Hexagon v68, Genie/QNN); no es portable a otras plataformas sin reconversión.
- Idiomas soportados no documentados en esta model card; deben consultarse en la ficha del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio registra 0 descargas y 1 like en el momento de la consulta.
- No se publican datos de sesgos, seguridad o filtrado de contenido para este artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anguoyang/qwen3-0.6b-qcs6490
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio qcs-bench (cadena de compilación y perfilado): https://github.com/qcs-bench (referenciado en la model card; URL exacta no disponible)
- Incidencia qualcomm/ai-hub-models#366: no disponible como enlace directo en la información proporcionada
- Incidencia qualcomm/ai-hub-models#367: no disponible como enlace directo en la información proporcionada
- Qualcomm AI Hub Workbench: no disponible como enlace directo en la información proporcionada
