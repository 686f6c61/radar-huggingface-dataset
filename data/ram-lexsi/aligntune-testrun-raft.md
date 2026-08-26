# ram-lexsi/aligntune-testrun-RAFT

## Resumen

`ram-lexsi/aligntune-testrun-RAFT` es un modelo de lenguaje de 494 millones de parámetros, resultado de un fine-tuning del modelo base `Qwen/Qwen2.5-0.5B-Instruct` mediante la librería de alineación AlignTune, desarrollada por Lexsi Labs. El modelo se presenta como una prueba de concepto (testrun) del pipeline de alineación de AlignTune, utilizando el algoritmo RAFT (Reinforcement Learning from AI Feedback) y el backend TRL. Está diseñado para la generación de texto conversacional y sirve como ejemplo de integración del flujo de trabajo de alineación en modelos pequeños.

La relevancia actual reside en su utilidad como demostración técnica: permite evaluar el funcionamiento de AlignTune, su capacidad para gestionar procesos de fine-tuning con distintos algoritmos y backends, y validar el artefacto generado. Al ser un modelo pequeño, es accesible para entornos con recursos limitados, aunque no está pensado para producción avanzada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parámetros totales | 494 032 768 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Qwen2.5, con una configuración de 0.5B parámetros. El fine-tuning se realiza con AlignTune, una librería modular de alineación que permite aplicar algoritmos como SFT, DPO, PPO, SimPO y RAFT. En este caso se utiliza el algoritmo `RAFT` con el backend `TRL` (Transformers Reinforcement Learning). No se especifica la composición del dataset ni el número de tokens de entrenamiento; la información disponible solo indica que es un testrun para probar el flujo de trabajo. No se menciona ninguna innovación técnica adicional más allá del uso del framework.

## Capacidades

- Generación de texto conversacional (instrucciones y respuestas).
- Capacidades heredadas del modelo base Qwen2.5-0.5B-Instruct, que incluyen razonamiento básico y comprensión de instrucciones.
- Soporte de generación de texto en múltiples idiomas (el modelo base es multilingüe, aunque no se confirma para este fine-tune).
- No se documenta soporte de tool calling, agentes o modos de razonamiento avanzado.

## Casos de uso

- Evaluación de técnicas de alineación: permite probar el algoritmo RAFT y comparar el rendimiento del modelo antes y después del fine-tuning, en entornos de investigación.
- Prototipado de pipelines de entrenamiento: sirve como base para validar la configuración de AlignTune y TRL antes de aplicar a modelos mayores.
- Experimentos de instrucción-following: útil para pruebas de bajo coste sobre cómo el fine-tuning afecta la adherencia a instrucciones.
- Pruebas de integración en entornos de desarrollo: se puede cargar con transformers para verificar que el artefacto funciona correctamente en un pipeline de generación.
- Evaluación de robustez: permite comparar el comportamiento del modelo base frente al modelo ajustado en tareas de conversación.
- Formación y educación: ejemplo didáctico para mostrar el proceso de alineación con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia: con 494M parámetros, el modelo cabe en GPUs con al menos 4 GB de VRAM en FP16. Con cuantización int8 o int4, podría ejecutarse en 2 GB.
- GPUs recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o incluso CPU con suficiente RAM.
- Opciones de despliegue: se puede cargar con `transformers` para inferencia, o convertir a GGUF para usar con `llama.cpp`, `Ollama` o `vLLM` (si se convierte a formato compatible).
- Latencia y throughput: no se dispone de datos específicos, pero por su tamaño se espera una latencia baja en hardware consumer.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. A nivel de parámetros y contexto, el modelo base `Qwen/Qwen2.5-0.5B-Instruct` es el punto de referencia. Otros modelos de tamaño similar incluyen `SmolLM2-360M` o `Phi-1.5` (1.3B), pero no hay información comparativa en los datos proporcionados.

## Limitaciones y advertencias

- Es un modelo de 0.5B, con limitaciones inherentes en razonamiento complejo y generación de código avanzado.
- Riesgo de alucinación y sesgos presentes en el modelo base Qwen2.5-0.5B-Instruct.
- No se especifica la licencia, por lo que no se puede garantizar el uso comercial sin verificar los términos.
- El contexto máximo no está documentado en esta ficha; se recomienda consultar la documentación del modelo base para conocer la longitud de contexto soportada.
- El modelo es un testrun, no está destinado a producción y puede contener errores de entrenamiento.

## Enlaces

- [HuggingFace - ram-lexsi/aligntune-testrun-RAFT](https://huggingface.co/ram-lexsi/aligntune-testrun-RAFT)
- [AlignTune - Home](https://aligntune.lexsi.ai/)
- [GitHub - Lexsi-Labs/aligntune](https://github.com/Lexsi-Labs/aligntune)
- [AlignTune - Tools | Lexsi Labs](https://lexsi.ai/tools/aligntune)
- [Lexsi Labs](https://lexsi.ai/)
