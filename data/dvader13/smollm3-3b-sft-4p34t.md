# dvader13/smollm3-3b-sft-4p34t

## Resumen

El modelo `dvader13/smollm3-3b-sft-4p34t` es un conjunto de checkpoints de supervisión fine-tuning (SFT) derivados del modelo base SmolLM3-3B de Hugging Face, que fue preentrenado con 4,34 billones de tokens. El repositorio contiene diez fracciones de dosis de entrenamiento SFT, etiquetadas desde `checkpoint_pct010` hasta `checkpoint_pct100`, lo que permite a desarrolladores e investigadores estudiar cómo evolucionan las capacidades del modelo a lo largo del proceso de ajuste fino. Todos los checkpoints están en formato bf16 y solo contienen pesos de inferencia, sin estado de optimizador.

La relevancia de este modelo radica en que SmolLM3-3B es un modelo de 3 mil millones de parámetros con arquitectura decoder-only, razonamiento de doble modo, soporte nativo para seis idiomas y una ventana de contexto de hasta 128K tokens. Al publicar los checkpoints intermedios del SFT, el autor permite analizar la dinámica de entrenamiento y seleccionar el punto de ajuste óptimo según el caso de uso, algo poco habitual en la mayoría de lanzamientos de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (base: SmolLM3-3B) |
| Parametros totales | 3 mil millones (aproximadamente, según el modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (según documentación del modelo base) |
| Tipos de cuantizacion | bf16 (los pesos publicados están en bf16) |
| Idiomas soportados | Seis idiomas con soporte nativo (según documentación del modelo base; idiomas concretos no disponibles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato habitual en Hugging Face; no confirmado explícitamente en la model card) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un transformer decoder-only de 3 mil millones de parámetros, entrenado por Hugging Face sobre 11 billones de tokens de texto general. Incluye un modo de razonamiento dual (pensamiento rápido y lento) y soporte para 128K tokens de contexto. El autor de este repositorio ha aplicado un proceso de SFT sobre ese modelo base, generando diez checkpoints a lo largo del entrenamiento, lo que permite observar la progresión de la adaptación a instrucciones.

Los datos concretos de entrenamiento del SFT (composición del dataset, número de pasos, hiperparámetros) no están disponibles en la información proporcionada. La model card indica que los checkpoints son de solo inferencia y no incluyen estado de optimizador, lo que sugiere que están preparados para evaluación directa.

## Capacidades

- Generación de texto y seguimiento de instrucciones: el modelo base está ajustado para seguir instrucciones, y estos checkpoints SFT mejoran esa capacidad.
- Razonamiento de doble modo: el modelo base soporta tanto razonamiento rápido como un modo de razonamiento más profundo (similar a un "thinking mode").
- Soporte multilingüe nativo para seis idiomas, aunque no se especifican cuáles.
- Contexto largo de hasta 128K tokens, adecuado para tareas que requieren ventanas extensas.
- No se ha confirmado soporte de tool calling, function calling, ni capacidades de agentes en este checkpoint específico.

## Casos de uso

- Evaluación de la dinámica del SFT: los diez checkpoints permiten estudiar cómo evoluciona la calidad del modelo durante el fine-tuning, útil para investigación en optimización de entrenamiento.
- Selección de checkpoint para producción: un desarrollador puede evaluar los distintos checkpoints y elegir el que ofrezca el mejor equilibrio entre rendimiento y comportamiento en su tarea específica.
- Ajuste fino adicional: los checkpoints bf16 sirven como punto de partida para continuar el entrenamiento con otros datasets de dominio específico.
- Análisis de robustez: comparar las respuestas de los diferentes checkpoints para identificar posibles degradaciones o mejoras en tareas concretas.
- Despliegue de un modelo de instrucciones de 3B con licencia Apache-2.0, adecuado para aplicaciones comerciales en entornos con restricciones de hardware.
- Evaluación de la transferencia de aprendizaje: estudiar cómo el SFT afecta al rendimiento en tareas de razonamiento, matemáticas o código, a partir de la base preentrenada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint específico en la información disponible. El modelo base SmolLM3-3B ha sido evaluado por Hugging Face en tareas como razonamiento, matemáticas y codificación, pero no se incluyen datos numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 3 mil millones de parámetros en bf16, se requieren aproximadamente 6 GB de VRAM solo para los pesos (3B × 2 bytes = 6 GB). Con overhead de activaciones y memoria adicional, se recomiendan al menos 8-10 GB de VRAM.
- GPUs recomendadas: RTX 3090, RTX 4090, A10, A100 o superiores. El modelo cabe en GPUs de consumo con 8 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (formato GGUF), vLLM, Ollama, Hugging Face TGI. La información no especifica la compatibilidad, pero son las opciones estándar para modelos de este tamaño.
- Latencia y throughput: no disponible en la información proporcionada. En general, un modelo de 3B en una RTX 4090 puede generar entre 50 y 100 tokens por segundo con cuantización 4-bit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache-2.0 | Modelo base sin SFT, entrenado en 11T tokens |
| dvader13/smollm3-3b-sft-4p34t | 3B | 128K | Apache-2.0 | Checkpoints SFT del base, 10 dosis |
| Qwen2.5-3B | 3B | 32K | Apache-2.0 | Modelo alternativo de tamaño similar, con buen rendimiento en codificación |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 Community License | Modelo de Meta, con restricciones de uso comercial |

La comparativa se basa en el modelo base, ya que no hay datos específicos del checkpoint SFT para comparar de forma directa.

## Limitaciones y advertencias

- El modelo es un checkpoint SFT de un modelo base, por lo que puede heredar sesgos presentes en los datos de preentrenamiento y ajuste fino.
- Riesgo de alucinación en tareas factuales, especialmente en contextos largos o temas de baja representación.
- No se ha confirmado el soporte de tool calling ni capacidades de agente en este checkpoint específico.
- La información de idiomas y capacidades multilingües proviene del modelo base, no se ha verificado en este checkpoint.
- El repositorio no incluye documentación sobre el dataset SFT ni los hiperparámetros, lo que limita la reproducibilidad.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero no garantiza que el modelo esté libre de sesgos o errores.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/dvader13/smollm3-3b-sft-4p34t
- Modelo base SmolLM3-3B en Hugging Face: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Documentación del curso SmolLM3 (SFT): https://huggingface.co/learn/smol-course/unit1/3
- Recetas de entrenamiento de SmolLM3 en el alignment-handbook: https://github.com/huggingface/alignment-handbook/blob/main/recipes/smollm3/README.md
- Página de referencia en atomic.chat: https://atomic.chat/models/smollm3-3b
