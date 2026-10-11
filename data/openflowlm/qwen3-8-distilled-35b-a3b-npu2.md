# OpenFlowLM/Qwen3.8-Distilled-35B-A3B-NPU2

## Resumen

OpenFlowLM/Qwen3.8-Distilled-35B-A3B-NPU2 es una versión cuantizada del modelo Atomic-Germ/Qwen3.6-35B-A3B-NPU2, desarrollada por OpenFlowLM para inferencia en NPU AMD XDNA. Se trata de un modelo de lenguaje con arquitectura de mezcla de expertos (MoE) de 35 000 millones de parámetros totales y 3000 millones de parámetros activos por token (A3B), lo que reduce el coste computacional en cada paso de generación. Además, incluye un módulo de visión, según el archivo `vision_weight.q4nx` presente en el repositorio.

El modelo se distribuye en formato `.q4nx`, un formato propietario del runtime OpenFlowLM (OFLM), y no es compatible con GGUF ni con otros runtimes convencionales. La cuantización Q4NX combina precisiones Q8_0, Q4_1 y BF16, y los tags indican `q4_k`. El repositorio ocupa 24,8 GB y los pesos principales (`model.q4nx`) suman 22,14 GB. Está pensado para ejecutarse en portátiles y equipos con NPU AMD XDNA (como la serie Ryzen AI 300) a través del runtime OpenFlowLM.

Su relevancia radica en la eficiencia de la arquitectura MoE para despliegue local en hardware con NPU, y en la capacidad de visión integrada. Sin embargo, no se han publicado resultados de benchmarks ni detalles sobre el entrenamiento, y el soporte de idiomas se limita al inglés. La licencia Apache 2.0 permite uso comercial, pero el despliegue está restringido al ecosistema OpenFlowLM y a NPU AMD XDNA.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con módulo de visión |
| Parámetros totales | 35B |
| Parámetros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4NX (mezcla de Q8_0, Q4_1 y BF16); etiquetado como q4_k |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | .q4nx (no es GGUF) |
| Tamaño del repositorio | 24,8 GB |
| Hardware objetivo | NPU AMD XDNA |
| Runtime | OpenFlowLM (OFLM) |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la información proporcionada. El nombre del modelo incluye "Distilled", lo que sugiere que se ha aplicado destilación, pero no se detalla el proceso. La arquitectura es MoE según los tags, con 35B parámetros totales y 3B activos, lo que reduce el coste computacional por token. Incluye un módulo de visión, como indica el archivo `vision_weight.q4nx`. Esta versión es una cuantización Q4NX del modelo base Atomic-Germ/Qwen3.6-35B-A3B-NPU2, optimizada para el runtime OpenFlowLM en NPU AMD XDNA. La cuantización mezcla Q8_0, Q4_1 y BF16, y se etiqueta como q4_k.

El modelo base, a su vez, es una versión para NPU del modelo Qwen3.6-35B-A3B, aunque no se proporcionan detalles adicionales sobre su arquitectura interna (tipo de atención, número de expertos, etc.). No hay información sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación en inglés.
- Razonamiento y respuesta a preguntas, aunque sin benchmarks que lo cuantifiquen.
- Comprensión de imágenes y tareas de visión por computador, gracias al módulo de visión integrado (`vision_weight.q4nx`).
- Inferencia eficiente en NPU AMD XDNA mediante el runtime OpenFlowLM.
- Arquitectura MoE con solo 3B parámetros activos, lo que reduce el consumo energético y la latencia por token en comparación con modelos densos de tamaño similar.
- No se especifica soporte de tool calling, function calling ni capacidades de agente multi-paso.
- No se especifica soporte multilingüe; solo inglés.

## Casos de uso

- Asistente personal local en portátiles con NPU AMD XDNA: el modelo puede ejecutarse en el dispositivo sin conexión a internet, manteniendo la privacidad de los datos. Su bajo número de parámetros activos (3B) reduce el consumo energético, lo que lo hace adecuado para uso continuado en movilidad.
- Análisis de documentos con imágenes: gracias al módulo de visión, puede extraer información de capturas de pantalla, diagramas o fotografías junto con texto, siempre que el contexto de entrada no supere la longitud soportada (no disponible).
- Generación de código en entornos sin GPU: para desarrolladores que trabajan en portátiles con NPU, puede autocompletar código o explicar fragmentos, aunque no se ha confirmado soporte de tool calling que facilite la integración con editores.
- Resumen de reuniones o conversaciones en inglés: combinado con un motor de voz a texto, el modelo puede generar resúmenes de reuniones, aunque la longitud de contexto no está documentada y el idioma está limitado al inglés.
- Chatbot de atención al cliente en inglés: al ser conversacional y con arquitectura MoE, puede gestionar múltiples consultas simultáneas con un coste computacional bajo, pero sin datos de rendimiento que avalen su calidad en producción.
- Clasificación y extracción de información en visión por computador: para tareas de respuesta a preguntas visuales (VQA) en inglés, como identificar objetos o leer texto en imágenes.
- Educación y tutoría en inglés: puede explicar conceptos y responder preguntas, apoyándose en imágenes cuando sea necesario, aunque sin garantías de precisión ni benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: 24,8 GB para el repositorio completo; los pesos principales ocupan 22,14 GB (`model.q4nx`).
- Memoria: al ejecutarse en NPU AMD XDNA, la memoria suele ser compartida con la RAM del sistema. Se recomienda un equipo con al menos 24 GB de memoria disponible para cargar los pesos y el modelo de visión.
- GPU recomendadas: no es compatible con GPU NVIDIA o AMD convencionales; requiere una NPU AMD XDNA (por ejemplo, Ryzen AI 300 series o arquitecturas posteriores con XDNA 2).
- ¿Cabe en consumer GPU? No, el formato `.q4nx` y el runtime OpenFlowLM están diseñados exclusivamente para NPU AMD XDNA.
- Opciones de despliegue: únicamente el runtime OpenFlowLM (comando `oflm add`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia convencionales.
- Latencia y throughput estimados: no disponible.
- Requisitos adicionales: sistema operativo y controladores que soporten OpenFlowLM-Next con soporte para NPU AMD XDNA.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de rendimiento para comparar con otros modelos. La única referencia directa es el modelo base Atomic-Germ/Qwen3.6-35B-A3B-NPU2, del cual este repositorio es una cuantización Q4NX optimizada para OpenFlowLM.

| Modelo | Parámetros totales | Parámetros activos | Licencia | Formato | Hardware |
|---|---|---|---|---|---|
| OpenFlowLM/Qwen3.8-Distilled-35B-A3B-NPU2 | 35B | 3B | Apache 2.0 | .q4nx | NPU AMD XDNA |
| Atomic-Germ/Qwen3.6-35B-A3B-NPU2 | 35B | 3B | Apache 2.0 | no disponible | NPU AMD XDNA |

No se dispone de información sobre otros modelos comparables en la misma categoría (MoE con visión para NPU) en la información proporcionada.

## Limitaciones y advertencias

- Soporte exclusivo del idioma inglés; no hay capacidades multilingües documentadas.
- Longitud de contexto no disponible; podría ser limitada para tareas que requieran ventanas extensas.
- Al ser una cuantización, puede existir una degradación en la calidad de las respuestas respecto al modelo sin cuantizar.
- El módulo de visión puede tener capacidades limitadas no documentadas.
- No se menciona soporte de tool calling, function calling ni agentes multi-paso, lo que restringe su integración en flujos automatizados complejos.
- Riesgo de alucinación inherente a los modelos de lenguaje, sin benchmarks que permitan estimar su frecuencia.
- Sesgos potenciales heredados del modelo base, no documentados.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base (también Apache 2.0 según la información proporcionada) y de los datos de entrenamiento originales.
- El despliegue está restringido a hardware con NPU AMD XDNA y al runtime OpenFlowLM, lo que limita su portabilidad a otros entornos de producción.
- Sin benchmarks publicados, el rendimiento real en tareas concretas es desconocido.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/OpenFlowLM/Qwen3.8-Distilled-35B-A3B-NPU2)
- [Modelo base Atomic-Germ/Qwen3.6-35B-A3B-NPU2](https://huggingface.co/Atomic-Germ/Qwen3.6-35B-A3B-NPU2)
