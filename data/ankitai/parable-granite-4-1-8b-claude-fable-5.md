# AnkitAI/Parable-Granite-4.1-8B-Claude-Fable-5

## Resumen

Parable-Granite-4.1-8B-Claude-Fable-5 es un ajuste fino del modelo IBM Granite 4.1 de 8B parámetros, desarrollado por AnkitAI, entrenado sobre trazas reales de sesiones de agentes de Claude Fable 5 y GPT-5.5. A diferencia de los ajustes finos convencionales basados en pares pregunta-respuesta sintéticos, este modelo se entrena con sesiones multi-paso reales que incluyen planificación, uso de herramientas y bloques de razonamiento `thinking`, lo que lo orienta específicamente a tareas de agente y codificación.

El modelo reduce la pérdida en el conjunto de validación retenido un 70% respecto a su base (de 2,030 a 0,617) y supera la marca de 0,71 que reporta el mejor ajuste fino publicado de 9B sobre la misma familia de datos. Se distribuye con pesos completos en safetensors y cuantizaciones GGUF para despliegue local, manteniendo la ventana de contexto nativa de 128K tokens del modelo base y una licencia Apache-2.0 para los pesos.

Es la versión más grande de la serie Parable, junto a Parable-Qwen3-4B, y está pensada para desarrolladores que necesitan un modelo de razonamiento y uso de herramientas de 8B ejecutable en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Granite 4.1) |
| Parámetros totales | 8.380.551.168 (8,38B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (nativa del base; ajuste fino a secuencias de 1.024) |
| Tipos de cuantización | GGUF (Q4_K_M verificado), NF4 (usado en entrenamiento QLoRA) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 (pesos); datos de entrenamiento AGPL-3.0 y MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de ibm-granite/granite-4.1-8b, un transformer denso con ventana de contexto nativa de 128K tokens. El ajuste fino se realizó con QLoRA en precisión NF4, con secuencias de 1.024 tokens, en una única GPU de 16 GB. Los datos de entrenamiento combinan dos conjuntos: Glint-Research/Fable-5-traces, con 4.400 trazas reales de sesiones de agente de codificación de Claude Fable 5 que incluyen razonamiento `thinking` y llamadas a herramientas, y Roman1111111/gpt5.5-terminal, con soluciones de tareas de agente de terminal. Cada ejemplo pasó un control de calidad previo con validación de esquema, eliminación de secretos y filtrado por longitud.

La innovación principal es el uso de trazas de agente reales en lugar de datos sintéticos, lo que enseña al modelo patrones de planificación, invocación de herramientas y razonamiento intermedio. El modelo genera bloques `thinking` al inicio de cada respuesta y puede emitir JSON estructurado de llamadas a herramientas. No se menciona el uso de RLHF o DPO; el entrenamiento es exclusivamente de ajuste fino supervisado vía QLoRA.

## Capacidades

- Generación de texto y razonamiento multi-paso con bloques de pensamiento explícitos (`thinking`).
- Uso de herramientas y llamadas a funciones (function calling) aprendido de trazas reales de agentes de codificación.
- Ejecución de tareas de terminal y scripting a partir de soluciones de agente de GPT-5.5.
- Generación de código, depuración y resolución de problemas de programación.
- Salida estructurada en JSON para integración en marcos de agentes (agent harnesses).
- Capacidad multilingüe limitada al inglés; no se documenta soporte para otros idiomas.
- Sin capacidades de visión ni audio.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede planificar, razonar y ejecutar llamadas a herramientas en sesiones multi-paso, gracias a su entrenamiento sobre trazas reales de agentes de Claude Fable 5.
- Automatización de terminal: integrable en agentes que ejecutan comandos de shell, gestionan entornos y resuelven tareas de operaciones, dado su entrenamiento sobre el conjunto gpt5.5-terminal.
- Asistentes de depuración en IDE: puede analizar trazas de error, proponer correcciones y razonar sobre el flujo de ejecución con su bloque de pensamiento intermedio.
- Generación de código en producción con revisión humana: los comandos y fragmentos generados deben tratarse como borradores, pero el modelo produce código razonablemente correcto (20/34 respuestas completamente correctas en evaluación cualitativa).
- Pipelines de CI/CD con tool calling: soporta invocación de funciones y puede integrarse en flujos automatizados de compilación, pruebas y despliegue.
- Chat técnico con razonamiento extendido: para consultas de programación y sistemas donde se requiera explicar el proceso de razonamiento antes de dar la respuesta final.
- Despliegue local en hardware de consumo: con cuantizaciones GGUF Q4_K_M puede ejecutarse en GPUs de gama media vía Ollama o LM Studio, sin depender de APIs externas.

## Benchmarks y rendimiento

Evaluación sobre división de test retenida, con código y longitud de contexto idénticos para base y ajuste fino:

| Métrica | Granite-4.1-8B base | Parable | Δ |
|---|---|---|---|
| Pérdida de test (test loss) | 2,030 | 0,617 | −70% |

Revisión cualitativa sobre 34 prompts de codificación, terminal y depuración, evaluados estrictamente ejecutando mentalmente cada respuesta: 20/34 completamente correctas y 32/34 correctas o parcialmente correctas.

Para referencia, el mejor ajuste fino publicado sobre esta familia de datos (un modelo de 9B) reporta una pérdida de validación de 0,71; los números entre repositorios son solo orientativos por diferencias en división de datos, tokenizador y longitud de contexto (la medición de Parable se hizo a 1.024 tokens).

En la evaluación BFCL V3 (subconjunto AST) el resultado fue DNF (no finalizado): el run superó su presupuesto de 3 horas de GPU porque los bloques de pensamiento empujan la mayoría de respuestas al límite de 4.096 tokens por petición, requiriendo unas 35 horas de decodificación en una T4 para completar la suite completa. Para pruebas de function calling con el harness BFCL se recomienda usar el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con cuantización GGUF Q4_K_M; unos 16 GB en FP16 con los pesos completos.
- GPU recomendadas: el entrenamiento QLoRA se realizó en una GPU de 16 GB (tipo RTX 4080/4090 o similar); la inferencia cuantizada Q4_K_M se verificó servida con llama.cpp sobre una T4 de 16 GB.
- Compatibilidad con GPU de consumo: sí, una RTX 3060 de 12 GB o superior puede ejecutar la versión Q4_K_M; una RTX 4090 ejecuta sin problema los pesos completos en FP16.
- Opciones de despliegue: transformers (Python), llama.cpp, Ollama (`ollama run parable/granite4.1-fable:8b`), LM Studio y vLLM (etiqueta endpoints_compatible).
- Latencia y throughput: no se publican mediciones específicas; la decodificación con bloques de pensamiento es notablemente más lenta que en el modelo base, como evidencia el fallo del BFCL por tiempo en T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pérdida de test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parable-Granite-4.1-8B | 8,38B | 128K | 0,617 | Apache-2.0 | safetensors + GGUF |
| Granite-4.1-8B (base) | 8B | 128K | 2,030 | Apache-2.0 | safetensors |
| Parable-Qwen3-4B | 4B | no disponible | no disponible | no disponible | GGUF |
| Ajuste fino 9B de referencia | 9B | no disponible | 0,71 | no disponible | no disponible |

El modelo supera claramente a su base en pérdida de test sobre la familia de datos de trazas de agente, y supera el mejor resultado publicado de un ajuste fino de 9B sobre la misma familia, aunque esa comparación es solo indicativa por diferencias metodológicas. La ventaja principal frente a alternativas de mayor tamaño es la eficiencia: 8B parámetros ejecutables en hardware de consumo.

## Limitaciones y advertencias

- Entrenado específicamente para trabajo de agente: en prompts de tipo operaciones responde a veces (2/34 en la evaluación) con JSON estructurado de llamadas a herramientas en lugar de prosa; dentro de un harness de agente es útil, pero en chat normal requiere re-prompting o bajar la temperatura.
- Ajuste fino realizado con secuencias de 1.024 tokens: el comportamiento ajustado es más fuerte en los primeros turnos de una conversación larga, aunque el contexto nativo de 128K sigue disponible.
- Idioma limitado al inglés; no se documenta rendimiento en otros idiomas.
- Riesgo de alucinación y errores en código generado: el propio autor recomienda tratar comandos y código generados como borradores a revisar.
- Consideraciones de licencia para uso comercial: aunque los pesos son Apache-2.0, los datos de entrenamiento provienen de Fable-5-traces (AGPL-3.0) y gpt5.5-terminal (MIT). Las trazas se originan en asistentes de terceros, cuyos términos de servicio pueden aplicarse a entrenamiento y destilación downstream; conviene verificar el cumplimiento antes de construir productos comerciales sobre este modelo.
- El modelo hereda el corte de conocimiento y los comportamientos base de Granite-4.1-8B.
- No se publican resultados completos de benchmarks estándar como MMLU, HumanEval o GSM8K; la evaluación se centra en pérdida de test sobre la familia de datos de trazas y una revisión cualitativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnkitAI/Parable-Granite-4.1-8B-Claude-Fable-5
- Cuantizaciones GGUF: https://huggingface.co/AnkitAI/Parable-Granite-4.1-8B-Claude-Fable-5-GGUF
- Colección Parable (pesos completos, GGUF, informes de evaluación): https://huggingface.co/collections/AnkitAI/parable-6a4fac60f4b35afca3019621
- Artefactos de evaluación v2 (incluye archivos BFCL): https://huggingface.co/AnkitAI/parable-v2-artifacts
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Dataset Fable-5-traces: https://huggingface.co/datasets/Glint-Research/Fable-5-traces
- Dataset gpt5.5-terminal: https://huggingface.co/datasets/Roman1111111/gpt5.5-terminal
- Modelo hermano Parable-Qwen3-4B: https://huggingface.co/AnkitAI/Parable-Qwen3-4B-Claude-Fable-5-GGUF
- Ollama: `ollama run parable/granite4.1-fable:8b`
