# laplinker/Qwen3.8-27B-heretic-Q4_K_M-GGUF

## Resumen

`laplinker/Qwen3.8-27B-heretic-Q4_K_M-GGUF` es una cuantización en formato GGUF del modelo `laplinker/Qwen3.8-27B-heretic`, un derivado de la familia Qwen3 de Alibaba con modificaciones orientadas a eliminar los mecanismos de rechazo y censura del modelo original (técnica conocida como *abliteration* o *decensoring*). El autor, laplinker, publica tanto el checkpoint en safetensors como esta versión cuantizada a Q4_K_M generada automáticamente mediante el espacio GGUF-my-repo de ggml.ai sobre llama.cpp.

El modelo cuenta con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones), lo que lo sitúa en la gama de modelos densos de tamaño medio-grande. La cuantización Q4_K_M reduce el peso del repositorio a 16,8 GB, lo que permite su despliegue en GPUs de consumo con 24 GB de VRAM o en configuraciones con offloading parcial a CPU. La licencia declarada es Apache 2.0.

La relevancia de esta ficha radica en que se trata de un modelo derivado no oficial, sin benchmarks publicados, sin model card técnica detallada y con cero descargas en el momento de la consulta. Es un artefacto de la comunidad que debe evaluarse con cautela antes de cualquier uso en producción, especialmente por la ausencia de garantías sobre calidad, seguridad y comportamiento tras el proceso de abliteration.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3, según el nombre del modelo; no confirmado en la model card) |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible (la model card no lo especifica; los ejemplos de llama.cpp usan `-c 2048`) |
| Tipos de cuantización | Q4_K_M (única publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `qwen3.8-27b-heretic-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la model card proporcionada. Por el identificador del modelo base (`Qwen3.8-27B-heretic`) y el número de parámetros, se infiere que se trata de un transformer denso de la familia Qwen3, pero no se confirma en la documentación disponible. No se especifican datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF o DPO.

La única innovación técnica documentada es el proceso de *abliteration* aplicado por el autor del modelo base para eliminar los comportamientos de rechazo (refusals) del modelo original. Este tipo de intervención suele consistir en la modificación de direcciones de activación en el espacio latente, pero el autor no publica la metodología concreta. La cuantización Q4_K_M se generó con llama.cpp mediante el espacio GGUF-my-repo de ggml.ai, sin ajustes posteriores documentados.

## Capacidades

- Generación de texto conversacional en formato multi-turno, según la etiqueta `conversational` del repositorio.
- Comportamiento "uncensored"/"decensored": el proceso de abliteration busca reducir los rechazos ante peticiones que el modelo original declinaría.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integración con infraestructura de inferencia tipo Hugging Face Inference Endpoints.
- No se documentan capacidades específicas de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente el efecto de la abliteration sobre la distribución de respuestas y la tasa de rechazos, comparándolo con el Qwen3 original.
- Experimentación con llama.cpp en local: gracias al formato GGUF y al tamaño de 16,8 GB, se puede ejecutar en una estación de trabajo con GPU de 24 GB para pruebas de prompting y evaluación cualitativa.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa que el modelo original podría rechazar por contenido sensible, siempre con revisión humana posterior.
- Prototipado rápido de chatbots conversacionales: la etiqueta `conversational` y el soporte de `llama-server` permiten levantar un endpoint HTTP local en minutos para pruebas de UX.
- Evaluación comparativa de cuantizaciones: útil como caso de estudio para medir la degradación de calidad entre el checkpoint safetensors original y su versión Q4_K_M.
- Docencia y formación técnica: ejemplo práctico de cómo se genera un GGUF con GGUF-my-repo y cómo se sirve con `llama-server`, sin necesidad de infraestructura cloud.
- Análisis de sesgos y contenido dañino: al ser un modelo decensored, sirve como muestra de control en estudios sobre generación de contenido no filtrado y eficacia de guardarraíles externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 16-18 GB para los pesos, más overhead de contexto KV (variable según longitud de contexto y número de capas).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB), L4 (24 GB), A100 40/80 GB, H100.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y GPUs con 24 GB o más. En GPUs de 16 GB requeriría offloading parcial a CPU con degradación de velocidad.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por compatibilidad de formato GGUF, también Ollama y otros runners basados en llama.cpp. No se confirma soporte en vLLM ni TGI para este artefacto concreto.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| laplinker/Qwen3.8-27B-heretic-Q4_K_M-GGUF | 27,3 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Derivado abliterated, sin benchmarks |
| laplinker/Qwen3.8-27B-heretic (base) | 27,3 B | no disponible | Apache 2.0 | safetensors | Checkpoint original sin cuantizar |
| Familia Qwen3 (modelo oficial) | variable | variable | variable (según variante) | safetensors, GGUF | Referencia oficial de Alibaba; no se dispone de datos concretos en la información proporcionada |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo derivado no oficial: no está validado por Alibaba ni por el equipo de Qwen; la calidad tras la abliteration no está documentada.
- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas estándar.
- Riesgo elevado de alucinación y de generar contenido dañino: la abliteration elimina los mecanismos de rechazo, por lo que se recomienda encarecidamente desplegar guardarraíles externos (filtros de entrada/salida, moderación) en cualquier uso público.
- Sesgos desconocidos: no se documentan evaluaciones de sesgo; el proceso de abliteration puede alterar la distribución de respuestas de forma impredecible.
- Idiomas soportados no especificados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no confirmada: los ejemplos de la model card usan `-c 2048`; no se debe asumir contextos largos sin verificación empírica.
- Licencia Apache 2.0 declarada, pero la cadena de derivación (Qwen3 → heretic → GGUF) debe revisarse para confirmar compatibilidad en uso comercial.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al checkpoint original; no se ha medido su impacto.
- Fecha de creación futura (2026-11-24) en los metadatos: posible inconsistencia que conviene verificar antes de confiar en el artefacto.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/laplinker/Qwen3.8-27B-heretic-Q4_K_M-GGUF
- Modelo base (safetensors): https://huggingface.co/laplinker/Qwen3.8-27B-heretic
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
