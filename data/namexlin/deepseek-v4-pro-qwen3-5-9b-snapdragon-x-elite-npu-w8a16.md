# nameXLin/DeepSeek-V4-Pro-Qwen3.5-9B-Snapdragon-X-Elite-NPU-W8A16

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-Snapdragon-X-Elite-NPU-W8A16 es una compilación especializada del modelo DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED, publicada por el usuario nameXLin, orientada a la ejecución nativa sobre la NPU Hexagon del SoC Qualcomm Snapdragon X Elite (SC8380XP). No se trata de un modelo entrenado desde cero, sino de un port con precompilación de grafos para el backend QNN (Qualcomm Neural Network) en formato ONNX, con cuantización W8A16 (pesos de 8 bits y activaciones de 16 bits).

El repositorio, de 9,4 GB, contiene 24 bloques decodificadores de atención lineal precompilados como contextos QNN binarios, junto con el tokenizador oficial y un script de arranque (`run_chat.py`) para Windows 11 on ARM. La model card reporta mejoras medidas sobre el CRD de referencia: reducción de la latencia por bloque de 7,82 ms a 4,56 ms (42 %), descenso del uso de memoria por bloque de unos 430 MB a 208 MB y una tasa de generación estimada de 6,5 a 7,2 tokens/s.

La relevancia de esta ficha radica en que ejemplifica el despliegue de LLM en hardware de PC ARM con NPU integrada, un nicho en crecimiento. La licencia declarada es Apache 2.0 y el pipeline es text-generation, aunque la información publicada es muy escasa en cuanto a datos de entrenamiento, idiomas y evaluación de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (24 bloques decodificadores); grafo precompilado para QNN/ONNX |
| Parametros totales | 9B (según el nombre del modelo; no disponible el desglose exacto) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W8A16 (8 bits en pesos, 16 bits en activaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX precompilado como contexto QNN (binarios por capa), más tokenizer.json y tokenizer_config.json |

## Arquitectura y entrenamiento

La información disponible describe un transformer de 24 bloques decodificadores con atención lineal, adaptado mediante "desenrollado de grafos computacionales" (eliminación de bucles en el grafo) y "fusión y reconstrucción de productos tensoriales externos" para el backend Hexagon NPU. La cuantización W8A16 se aplica a nivel de hardware con precompilación, de modo que los 130 operadores del grafo se ejecutan íntegramente en la NPU sin retorno a CPU.

No se proporcionan datos sobre el corpus de entrenamiento, número de tokens, composición del dataset ni si se aplicaron técnicas de RLHF, DPO o similares. El nombre del modelo incluye la etiqueta "UNCENSORED", lo que sugiere que la variante base ha sido sometida a algún proceso de eliminación o relajación de alineamiento, pero no se documenta el método. Tampoco se detalla la innovación de atención lineal más allá de la mención del tipo de bloque.

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation).
- Ejecución íntegra en NPU Hexagon del Snapdragon X Elite, sin copias a CPU durante la inferencia.
- Modelo etiquetado como "uncensored", lo que implica menor rechazo a peticiones que los modelos alineados estándar rechazarían.
- Soporte de cuantización W8A16 para reducir el uso de memoria por bloque a 208 MB.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente conversacional local en portátiles ARM: el modelo se ejecuta en la NPU del Snapdragon X Elite con un script de arranque para Windows 11 on ARM, lo que permite un chatbot privado sin conexión a la nube y sin cargar la CPU ni la GPU integrada.
- Prototipado de despliegue en NPU para desarrolladores: sirve como referencia para compilar y ejecutar otros modelos en QNN, dado que el repositorio incluye los 24 contextos binarios por capa y el tokenizador.
- Generación de texto en entornos con restricciones de memoria: con 208 MB por bloque y W8A16, el modelo cabe en equipos con recursos limitados frente a una ejecución FP16.
- Investigación sobre cuantización y portabilidad de hardware: permite medir latencia por bloque y tasa de tokens/s en un SoC concreto y comparar con la referencia FP16.
- Aplicaciones de escritorio con requisitos de privacidad: al ejecutarse localmente en la NPU, los datos no salen del dispositivo, lo que encaja en flujos de trabajo sensibles.
- Evaluación de modelos "uncensored" en entornos controlados: útil para estudiar el comportamiento de variantes sin alineamiento en tareas de generación abierta.

## Benchmarks y rendimiento

La model card únicamente publica métricas de hardware medidas en el Snapdragon X Elite CRD, no benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.).

| Métrica | FP16 de referencia | W8A16 en NPU | Mejora |
|---|---|---|---|
| Latencia por bloque (atención + MLP) | 7,82 ms | 4,56 ms | 42 % |
| Memoria por bloque | ~430 MB | 208 MB | 51 % menos |
| Operadores en NPU | Parcial, con retorno a CPU | 130/130 (100 %) | Sin copias a CPU |
| Tasa de generación estimada | ~3,8 tokens/s | 6,5–7,2 tokens/s | Aprox. 1,8× |

No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- SoC objetivo: Qualcomm Snapdragon X Elite (SC8380XP), NPU Hexagon; el repositorio está precompilado para este hardware y no es portable a otras NPU sin recompilación.
- Sistema operativo: Windows 11 on ARM (según el script `run_chat.py`).
- Memoria: 208 MB por bloque según la model card; el tamaño del repo es de 9,4 GB, por lo que se requiere espacio en disco suficiente y memoria del sistema para cargar los contextos QNN.
- GPU dedicada: no aplica; el diseño es específico para NPU.
- Cabe en hardware consumer: sí, en equipos con Snapdragon X Elite.
- Opciones de despliegue: backend QNN con ONNX precompilado; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 4,56 ms por bloque y 6,5–7,2 tokens/s estimados en el CRD de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-Snapdragon-X-Elite-NPU-W8A16 | 9B | No disponible | ONNX/QNN para Hexagon NPU | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Modelo base DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED | 9B | No disponible | Pesos estándar (no detallado) | No disponible | No disponible en la información |
| Alternativas de 9B en formato GGUF para CPU/GPU | ~9B | Variable | GGUF (llama.cpp) | Variable | Amplia |

No se dispone de datos de rendimiento comparativo con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- La información publicada es muy escasa: no hay datos de entrenamiento, idiomas, contexto ni evaluación de calidad, lo que impide validar el rendimiento real del modelo.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria ni reportes independientes.
- La etiqueta "uncensored" implica un riesgo elevado de generar contenido no filtrado; requiere supervisión y políticas de uso en producción.
- Riesgo de alucinación no cuantificado; sin benchmarks no puede estimarse su fiabilidad.
- La compilación está atada al Snapdragon X Elite (SC8380XP) y a Windows 11 on ARM; no es portable a otras NPU o GPU sin recompilación.
- Aunque la licencia declarada es Apache 2.0, la procedencia de los pesos base y del proceso "uncensored" no está documentada, lo que puede afectar a la seguridad jurídica del uso comercial.
- No se documentan sesgos conocidos ni limitaciones idiomáticas.

## Enlaces

- Hugging Face: https://huggingface.co/nameXLin/DeepSeek-V4-Pro-Qwen3.5-9B-Snapdragon-X-Elite-NPU-W8A16
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
