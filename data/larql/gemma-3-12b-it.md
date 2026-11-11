# larql/gemma-3-12b-it

## Resumen

`larql/gemma-3-12b-it` es un contenedor VINDEX3 del modelo `google/gemma-3-12b-it`, publicado por el proyecto LARQL. No se trata de un fine-tuning ni de una variante de pesos: el autor indica explícitamente que contiene los pesos BF16 originales sin modificar, empaquetados junto con la estructura del modelo como un grafo ejecutable e inspeccionable. El objetivo es permitir la ejecución, inspección y servido del modelo mediante la herramienta LARQL, que expone una API compatible con OpenAI.

El modelo subyacente es Gemma 3 12B IT, un transformer decoder-only de Google con 12.000 millones de parámetros, ajustado para instrucciones y con capacidades multimodales (visión) en su versión original. Sin embargo, esta compilación de LARQL solo admite generación de texto: los pesos de visión viajan en el contenedor, pero el runtime no acepta entrada de imagen ni audio para este modelo.

La relevancia de esta ficha es acotada: se trata de un artefacto de infraestructura (empaquetado y runtime alternativo) más que de un modelo nuevo. Resulta útil para quienes quieran ejecutar Gemma 3 12B IT con LARQL y aprovechar la inspección del grafo interno, pero no aporta mejoras de rendimiento ni de capacidades respecto al original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), empaquetado como grafo VINDEX3 |
| Parametros totales | 12 000 millones (heredados de google/gemma-3-12b-it) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el contenedor incluye pesos BF16 sin modificar |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Gemma Terms of Use |
| Formato de pesos | contenedor VINDEX3 (pesos BF16 originales + grafo estructural) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 12B IT de Google, un transformer decoder-only ajustado para seguir instrucciones. La model card de esta publicacion no aporta detalles sobre el entrenamiento original (número de tokens, composición del dataset, fases de RLHF/DPO), por lo que esos datos deben consultarse en la documentación de `google/gemma-3-12b-it`.

La aportación técnica de esta publicación es el formato VINDEX3: los pesos BF16 se mantienen intactos y se acompañan de la estructura del modelo representada como un grafo ejecutable e inspeccionable. El autor indica que el contenedor se codificó a partir de la revisión `96b6f1eccf38110c56df3a15bffe176da04bfd80` del repositorio original, con verificación y digests documentados en `PROVENANCE.md`. El runtime LARQL soporta generación de texto mediante los comandos `run`, `chat` y `serve` (API compatible con OpenAI), además del lenguaje de consulta LQL y la observación del grafo con `vindex3 observe`.

## Capacidades

- Generación de texto conversacional y ajuste a instrucciones, heredados de Gemma 3 12B IT.
- Servido mediante API compatible con OpenAI a través de `larql serve`.
- Inspección estructural del modelo como grafo ejecutable (`vindex3 observe`).
- Consultas sobre la estructura del modelo mediante el lenguaje LQL.
- Ejecución local con los comandos `larql pull`, `larql run` y `larql chat`.
- No admite entrada de imagen ni audio en esta compilación, pese a incluir los pesos de visión en el contenedor.
- Soporte de tool calling, agentes, modo thinking o capacidades multilingües: no disponible en la informacion proporcionada para esta compilación.

## Casos de uso

- Ejecución local de Gemma 3 12B IT con un runtime alternativo: útil para equipos que ya trabajan con LARQL y quieren un modelo de 12B listo para `larql pull` sin convertir pesos manualmente.
- Servicio de inferencia con API compatible con OpenAI: `larql serve gemma-3-12b-it --port 8080` permite sustituir un endpoint existente sin cambiar el cliente.
- Análisis e inspección de la estructura interna del modelo: investigadores que necesiten examinar el grafo de Gemma 3 12B mediante `vindex3 observe` o consultas LQL.
- Reproducibilidad y auditoría de pesos: los digests de `PROVENANCE.md` permiten verificar que los pesos corresponden a la revisión concreta del modelo original de Google.
- Prototipado de asistentes conversacionales de texto: el ajuste a instrucciones del modelo base sirve para chat multi-turno, siempre que el contexto disponible en esta compilación sea suficiente para el caso.
- Evaluación comparativa de runtimes: permite medir el rendimiento de LARQL frente a vLLM, llama.cpp u otros backends usando exactamente los mismos pesos BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta publicación no incluye métricas de MMLU, HumanEval, GSM8K ni de latencia o throughput para el runtime LARQL.

## Requisitos de hardware

- Tamaño del repositorio: 24,4 GB, coherente con pesos BF16 de un modelo de 12B parámetros más los pesos de visión y los metadatos del grafo.
- VRAM estimada para inferencia en BF16: no disponible en la informacion proporcionada; a partir del tamaño del repositorio, se requiere al menos el espacio de los pesos más overhead de activaciones y KV cache.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible en la informacion proporcionada; el autor no documenta opciones de cuantización para este contenedor.
- Opciones de despliegue: LARQL (`larql run`, `larql chat`, `larql serve` con API compatible con OpenAI). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| larql/gemma-3-12b-it | 12B | no disponible | VINDEX3 (BF16) | Gemma Terms of Use | Pesos originales empaquetados para LARQL; solo texto |
| google/gemma-3-12b-it | 12B | no disponible | safetensors | Gemma Terms of Use | Modelo original; incluye capacidades de visión |
| Otros modelos de ~12B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparación relevante es con el modelo original de Google: esta publicación no modifica pesos ni añade capacidades, y restringe la entrada a texto. Su valor diferencial es el formato VINDEX3 y el runtime LARQL, no el rendimiento del modelo.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tuning: cualquier limitación de Gemma 3 12B IT (sesgos, alucinaciones, cobertura idiomática) aplica sin cambios.
- La compilación LARQL no admite entrada de imagen ni audio, aunque los pesos de visión estén presentes en el contenedor.
- No se documentan opciones de cuantización; el contenedor usa BF16, lo que limita el despliegue en hardware con poca VRAM.
- No se publican benchmarks, latencias ni requisitos de hardware específicos para el runtime LARQL.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y el repositorio se creó en noviembre de 2026: no hay evidencia de uso en producción ni validación comunitaria.
- La licencia Gemma Terms of Use impone obligaciones y restricciones adicionales para uso comercial, incluida la Prohibited Use Policy; es necesario revisarlas antes de desplegar.
- El proyecto depende de la herramienta LARQL y del formato VINDEX3; la interoperabilidad con otros backends de inferencia no está documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larql/gemma-3-12b-it
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Proyecto VINDEX3: https://vindex3.org
- Repositorio LARQL: https://github.com/chrishayuk/larql
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
