# jica98/qwen3.5-4B-super-coder

## Resumen

`jica98/qwen3.5-4B-super-coder` es un modelo de lenguaje de 4.326 millones de parámetros, especializado en generación de código, tool calling y razonamiento visible (thinking mode). Desarrollado por jica98, parte del modelo base `Qwen/Qwen3.5-4B` y se distribuye principalmente en formato GGUF cuantizado a Q4_0 (~2,6 GB), lo que lo hace apto para ejecución en hardware de consumo y dispositivos móviles. El modelo ha sido destilado a partir de Claude Sonnet 4.6 y Opus 4.6 mediante un pipeline de fine-tuning supervisado en varias fases, con el objetivo de transferir capacidades de razonamiento, estilo de respuesta y precisión en llamadas a herramientas.

La relevancia actual del modelo radica en su arquitectura híbrida que combina Gated DeltaNet y atención completa, reduciendo drásticamente el tamaño de la caché KV (~0,4 GB para 32K tokens de contexto). Esto permite manejar ventanas de contexto largas en dispositivos con poca memoria, algo poco común en modelos de este tamaño. El modelo soporta nativamente hasta 262K/1M tokens mediante extensión YaRN, aunque está optimizado para 32K. Su licencia Apache 2.0 (según la model card) facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Transformer con capas de Gated DeltaNet (3) y Full Attention (1) repetidas, 32 capas en total |
| Parametros totales | 4.326.350.848 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32K optimizado; hasta 262K/1M con YaRN |
| Tipos de cuantizacion | GGUF Q4_0 (principal); safetensors disponibles en el repo |
| Idiomas soportados | No disponible (el modelo base Qwen3.5 es multilingüe) |
| Licencia | Apache 2.0 (según model card) |
| Formato de pesos | GGUF (Q4_0) y safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura híbrida de Qwen3.5-4B, que intercala capas de Gated DeltaNet (una variante de atención lineal con estado recurrente) con capas de atención completa. De las 32 capas totales, solo 8 almacenan una caché KV completa, lo que reduce el consumo de memoria a aproximadamente 0,4 GB para 32K tokens de contexto. Esta característica es clave para su despliegue en entornos con recursos limitados.

El entrenamiento se realizó mediante un pipeline de fine-tuning supervisado en cinco fases. La fase A consistió en destilación general a partir del dataset `clzoro/Claude-Distills` (140K muestras de Sonnet 4.6 y Opus 4.6), transfiriendo capacidades de razonamiento y formato. La fase B añadió especialización en código y tool calling con un mix de 77K muestras (55K de instrucciones de código, 13K de tool calling y 9K de replay anti-olvido). La fase C se centró en precisión de esquemas JSON para herramientas (~20K muestras). Las fases 4 y 5 continuaron la especialización con datos de razonamiento Fable y trazas de agente, utilizando LoRA y técnicas de replay para evitar el olvido catastrófico. No se menciona el uso de RLHF o DPO; el proceso es exclusivamente SFT.

## Capacidades

- Generación de código en múltiples lenguajes: Python, C++, Rust, JavaScript, Shell, entre otros, con énfasis en código limpio y bien comentado.
- Razonamiento visible (thinking mode): ante tareas complejas, el modelo genera un bloque `thinking...` antes de la respuesta final, similar a los modelos Claude.
- Tool calling fiable: entrenado específicamente para producir parámetros JSON válidos que se ajustan a esquemas de funciones proporcionados, con reducción de falsos positivos.
- Ejecución en dispositivos móviles y edge: gracias a su tamaño (~2,6 GB) y a la baja huella de caché KV, puede ejecutarse en dispositivos con 8 GB o más de RAM.
- Conversación multi-turno: mantiene coherencia en diálogos largos gracias a la ventana de contexto de 32K tokens.
- Soporte de agentes: las trazas de razonamiento y tool calling permiten su uso en pipelines de agentes con múltiples pasos.
- Multilingüismo: aunque no se especifica en la ficha, el modelo base Qwen3.5 es multilingüe, por lo que hereda esa capacidad.

## Casos de uso

- Asistente de programación en IDE: integrado como plugin en VS Code o JetBrains, puede completar código, explicar fragmentos y refactorizar funciones. Su bajo consumo de VRAM permite ejecutarlo localmente en portátiles con GPU integrada.
- Generación de código en pipelines de CI/CD: el modelo puede generar tests unitarios, documentación o parches a partir de diffs, gracias a su capacidad de tool calling y razonamiento estructurado.
- Agente de automatización con tool calling: desplegado como backend de un agente que interactúa con APIs (búsqueda web, bases de datos, ejecución de comandos), el modelo produce llamadas JSON válidas según esquemas definidos.
- Chatbot de atención al cliente con contexto largo: su ventana de 32K tokens permite mantener historiales extensos de conversación, y su tamaño reducido facilita el despliegue en servidores de bajo coste o en el edge.
- Análisis y revisión de código en repositorios: puede procesar archivos completos y sugerir mejoras de rendimiento o seguridad, aprovechando el razonamiento visible para explicar sus decisiones.
- Asistente de desarrollo en dispositivos móviles: ejecutable en smartphones o tablets de gama alta (iPhone 15 Pro+, Android flagship) para consultas de código sin conexión, gracias a su formato GGUF y baja huella de memoria.
- Generación de documentación técnica: a partir de código fuente o especificaciones, el modelo produce documentación clara y estructurada, útil en entornos de desarrollo ágil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. Se recomienda evaluar el modelo en el caso de uso específico antes de su adopción en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en total (2,6 GB de pesos en Q4_0 + ~0,4 GB de caché KV para 32K tokens). Con cuantizaciones más agresivas o contextos menores, el consumo puede reducirse.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, GTX 1660 Super, o iGPU modernas. También puede ejecutarse en CPU con llama.cpp.
- Compatibilidad con consumer GPU: sí, es uno de los puntos fuertes del modelo. Cabe en tarjetas de gama de entrada y en dispositivos móviles con 8 GB de RAM.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (compatible con GGUF), llama-cpp-python, y potencialmente vLLM o TGI si se convierten los pesos a safetensors.
- Latencia y throughput: no disponible. Depende del hardware y de la longitud de contexto; en CPU se espera una velocidad de decodificación de 10-20 tokens/s en hardware moderno, y en GPU consumer de 30-60 tokens/s, aunque no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| jica98/qwen3.5-4B-super-coder | 4,3B | 32K (hasta 1M con YaRN) | GGUF Q4_0, safetensors | Apache 2.0 | Código, tool calling, razonamiento |
| Qwen/Qwen3.5-4B (base) | 4,3B | 32K (hasta 1M con YaRN) | safetensors | Apache 2.0 | Generalista, multilingüe |
| Llama 3.2 3B | 3,2B | 128K | safetensors, GGUF | Llama 3.2 | Generalista, multilingüe |
| Phi-3.5-mini | 3,8B | 128K | safetensors, GGUF | MIT | Razonamiento, código |

No se dispone de datos de benchmarks comparativos entre estos modelos. La comparativa se basa en especificaciones técnicas públicas. El modelo destaca por su especialización en código y tool calling, así como por su eficiencia de memoria gracias a la arquitectura híbrida.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una destilación de Claude, puede heredar sesgos presentes en los datos de entrenamiento de Claude, aunque no se han documentado evaluaciones específicas.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar código incorrecto o respuestas inventadas, especialmente en tareas fuera de su dominio de entrenamiento.
- Limitaciones de contexto: aunque soporta hasta 1M tokens con YaRN, la calidad puede degradarse más allá de 32K tokens; se recomienda validar en el caso de uso.
- Restricciones de licencia: la model card indica Apache 2.0, pero el modelo base Qwen3.5 tiene su propia licencia (Qwen License) que puede imponer condiciones adicionales; se recomienda verificar la compatibilidad antes de uso comercial.
- Advertencia para producción: al ser un modelo destilado y cuantizado, puede presentar diferencias de comportamiento frente al modelo original; es imprescindible realizar pruebas de robustez y seguridad antes de desplegarlo en entornos críticos.
- Dependencia de la arquitectura Gated DeltaNet: la implementación de inferencia debe ser compatible con esta arquitectura; no todos los frameworks la soportan de forma nativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jica98/qwen3.5-4B-super-coder
- Archivo GGUF Q4_0: https://huggingface.co/jica98/qwen3.5-4B-super-coder/blob/main/qwen3.5-4B-super-coder.Q4_0.gguf
- Ficha en LLM Explorer: https://llm-explorer.com/model/jica98%2Fqwen3.5-4B-super-coder,3MeanQatsYzHrKxmxdFJoZ
- Perfil del autor en aimodels.fyi: https://www.aimodels.fyi/creators/huggingface/jica98
- Modelo base Qwen3.5-4B en Ollama: https://ollama.com/library/qwen3.5:4b
