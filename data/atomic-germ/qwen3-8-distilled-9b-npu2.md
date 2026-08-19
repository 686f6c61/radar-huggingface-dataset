# Atomic-Germ/Qwen3.8-Distilled-9B-NPU2

## Resumen

El repositorio `Atomic-Germ/Qwen3.8-Distilled-9B-NPU2` se presenta como una conversión cuantizada en formato **Q4NX** de un modelo de la familia Qwen, compilada para inferencia en NPU AMD XDNA mediante el runtime **FastFlowLM (FLM)**. Según la model card, el modelo fuente es `FastFlowLM/Qwen3.5-9B-NPU2`, que a su vez deriva de `Qwen/Qwen3.5-9B`, un modelo causal de lenguaje con encoder de visión, arquitectura híbrida (Gated Delta Networks + MoE) y 9 mil millones de parámetros. El nombre del repositorio sugiere una destilación de Qwen3.8, pero la información interna apunta a Qwen3.5-9B como base real, lo que genera ambigüedad.

El repositorio tiene **0 descargas, 0 likes y un tamaño de 0.0 GB**, lo que indica que probablemente no contiene los archivos de pesos (aunque la model card los lista: `model.q4nx`, `config.json`, `tokenizer.json`, etc.). Esto sugiere que el modelo podría no estar disponible públicamente o que el repositorio está vacío. La relevancia de esta ficha radica en documentar una conversión específica para hardware AMD, un nicho emergente en inferencia local eficiente, aunque la falta de artefactos verificables limita su utilidad práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + sparse Mixture-of-Experts (según modelo fuente Qwen3.5-9B) |
| Parametros totales | 9B (según modelo fuente) |
| Parametros activos | No disponible (la arquitectura MoE sugiere activación parcial, pero no se especifica) |
| Longitud de contexto | 262,144 tokens nativos, extensible hasta 1,010,000 (según modelo fuente) |
| Tipos de cuantizacion | Q4NX (mezcla de Q8_0, Q4_1 y BF16 según la model card) |
| Idiomas soportados | No disponible (el modelo fuente declara 201 idiomas, pero la conversión no lo especifica) |
| Licencia | No disponible en el repositorio; el modelo fuente usa apache-2.0 |
| Formato de pesos | Q4NX (`model.q4nx`), no es GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo fuente Qwen3.5-9B, descrita como un modelo de lenguaje causal con encoder de visión integrado mediante fusión temprana de tokens multimodales. El bloque principal sigue un patrón `8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, combinando capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention) y FFN con dimensión intermedia de 12288. El modelo emplea 32 capas, dimensión oculta 4096 y un vocabulario de 248320 tokens (con padding). El entrenamiento incluye pre-entrenamiento y post-entrenamiento con RL a gran escala en entornos multi-agente, según la model card fuente. La conversión Q4NX es una compilación para el runtime FastFlowLM, que optimiza los pesos para NPU AMD XDNA, pero no modifica la arquitectura subyacente.

## Capacidades

- Generación de texto y razonamiento: el modelo fuente destaca en tareas de razonamiento, coding y agentes, con soporte de modo thinking configurable.
- Visión y lenguaje: el modelo original es multimodal (image-text-to-text), pero la conversión Q4NX declara modalidad solo lenguaje, por lo que la capacidad visual podría no estar disponible en esta versión.
- Multilingüismo: el modelo fuente soporta 201 idiomas y dialectos, aunque la conversión no confirma esta característica.
- Tool calling y agentes: el modelo fuente está entrenado para tareas de agente y multi-step reasoning, pero no se especifica si la conversión conserva estas capacidades.
- Inferencia en NPU: diseñado específicamente para ejecutarse en AMD XDNA NPU mediante FastFlowLM, con soporte de servidor compatible con OpenAI.

## Casos de uso

- Inferencia local en dispositivos AMD con NPU: el modelo está compilado para ejecutarse en hardware AMD XDNA, lo que permite desplegar un LLM de 9B en equipos con NPU sin depender de GPU dedicadas. Se usaría con el comando `flm run` o `flm serve` para exponer un endpoint OpenAI-compatible.
- Edge AI y aplicaciones offline: al ser una cuantización Q4NX de 7.23 GB, cabe en sistemas con memoria unificada de 8 GB o más, habilitando asistentes conversacionales o generación de texto en entornos sin conexión.
- Prototipado rápido con FastFlowLM: desarrolladores que usen el runtime FLM pueden integrar este modelo en pipelines existentes, aprovechando la compatibilidad con la API de OpenAI para pruebas de concepto.
- Evaluación de rendimiento en NPU: sirve como referencia para comparar la eficiencia de la inferencia en NPU AMD frente a GPU o CPU, midiendo latencia y throughput en tareas de generación.
- Investigación sobre cuantización Q4NX: el formato y la mezcla de precisión (Q8_0, Q4_1, BF16) pueden interesar a quienes estudian técnicas de compresión para hardware específico.
- Despliegue en servidores de baja potencia: en entornos donde el consumo energético es crítico, la NPU ofrece una alternativa eficiente para servir modelos de tamaño medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta conversión específica en la información disponible. La model card del modelo fuente (Qwen3.5-9B) incluye una tabla comparativa con otros modelos (GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, etc.) en métricas como MMLU-Pro, pero los datos están incompletos en el extracto proporcionado y no se pueden verificar. Por tanto, no se presentan números concretos para evitar inventar información.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos `model.q4nx` ocupa 7.23 GB, por lo que se requiere al menos 8 GB de memoria disponible (unificada o dedicada) para cargar el modelo.
- Hardware objetivo: AMD XDNA NPU, presente en procesadores como Ryzen AI (serie 7040/8040 y posteriores). No se especifican GPUs compatibles.
- Opciones de despliegue: runtime FastFlowLM (FLM) con comandos `flm run` y `flm serve`; no es compatible con vLLM, llama.cpp u Ollama en su formato nativo.
- Latencia y throughput: no disponibles; dependerán de la generación específica de NPU y de la configuración del sistema.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Distilled-9B-NPU2 (este) | 9B | 262K (según fuente) | Q4NX | No disponible | Repositorio vacío (0.0 GB) |
| Qwen3.5-9B (modelo fuente) | 9B | 262K | Transformers, GGUF, etc. | Apache-2.0 | Disponible en Hugging Face |
| Qwen3.8-27B (familia Qwen3.8) | 27B | 262K | GGUF, safetensors | No especificada | Disponible en LM Studio y Unsloth |

La comparativa se limita a modelos de la misma familia. No hay información sobre alternativas específicas para NPU AMD en el mismo rango de tamaño.

## Limitaciones y advertencias

- El repositorio tiene un tamaño de 0.0 GB y 0 descargas, lo que sugiere que los archivos de pesos no están realmente publicados o el repositorio está vacío. Cualquier intento de uso fallará si no se suben los artefactos.
- Existe una discrepancia en el nombre: el repositorio se llama "Qwen3.8-Distilled" pero la model card indica que el modelo fuente es Qwen3.5-9B. Esto puede generar confusión sobre la versión real del modelo.
- La conversión Q4NX declara modalidad solo lenguaje, aunque el modelo original es multimodal. Las capacidades de visión podrían no estar disponibles en esta versión.
- No se especifican los idiomas soportados en la conversión, aunque el modelo fuente declara 201 idiomas. La cobertura real en la versión cuantizada es incierta.
- La licencia del repositorio no está indicada; aunque el modelo fuente usa Apache-2.0, la conversión podría tener restricciones adicionales no documentadas.
- No hay benchmarks ni métricas de rendimiento para esta conversión, por lo que no se puede evaluar su calidad frente a otras cuantizaciones o modelos.
- El runtime FastFlowLM es específico de AMD XDNA; no funcionará en hardware de otros fabricantes sin adaptación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atomic-Germ/Qwen3.8-Distilled-9B-NPU2
- Modelo fuente (FastFlowLM/Qwen3.5-9B-NPU2): https://huggingface.co/FastFlowLM/Qwen3.5-9B-NPU2
- Modelo base (Qwen/Qwen3.5-9B): no se proporciona URL directa, pero se puede buscar en Hugging Face.
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5 (referenciado en la model card fuente)
