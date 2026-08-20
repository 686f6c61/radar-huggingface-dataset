# agentic-ptb/dpsk-v4-flash.h080.sft5.step_600

## Resumen

El modelo `agentic-ptb/dpsk-v4-flash.h080.sft5.step_600` es un checkpoint intermedio procedente de un barrido experimental de entrenamiento denominado AgentPTB. Desarrollado por el equipo detrás del repositorio `agentic-ptb`, este artefacto se construye sobre la base de `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un ajuste fino por supervisión (SFT) en el paso 5 del proceso. Con 9.409.813.744 parámetros, se trata de un modelo denso de tamaño medio, diseñado para operar con un esfuerzo de razonamiento configurado como `thinking`.

Su relevancia radica en que documenta un punto intermedio de un pipeline experimental de entrenamiento, lo que lo convierte en una pieza de interés para investigadores que estudian dinámicas de entrenamiento, evolución de capacidades de razonamiento o la validación de infraestructuras de fine-tuning. Sin embargo, no es un modelo final listo para producción: presenta advertencias críticas, como una configuración incompleta del token EOS, y carece de licencia, benchmarks o especificaciones de contexto publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de `Qwen/Qwen3.5-9B-Base`, un modelo denso de 9.4 mil millones de parámetros. El entrenamiento corresponde a un paso intermedio (SFT paso 5) dentro de un barrido sistemático de hiperparámetros denominado AgentPTB. La celda de configuración se identifica como `dpsk-v4-flash`, con un driver descrito como "pi / DeepSeek v4-flash" y un esfuerzo de razonamiento fijado en `thinking`.

Un aspecto técnico crítico detectado en la model card es la configuración del token EOS: el `eos_token_id` está establecido en `[248044]`, pero falta el token `248046`. Esta omisión puede provocar que el modelo no termine correctamente las secuencias generadas, ya que el tokenizador no reconocerá todos los tokens de fin de secuencia esperados. El tamaño del repositorio (18.8 GB) es consistente con pesos almacenados en precisión BF16 o FP16 para 9.4B parámetros.

## Capacidades

- Generación de texto y razonamiento: al estar configurado con esfuerzo `thinking`, está orientado a tareas que requieren razonamiento multi-paso, aunque su rendimiento real no ha sido verificado.
- Herencia del modelo base: se asume que hereda las capacidades lingüísticas y de razonamiento de Qwen3.5-9B-Base, pero no hay evidencia publicada de ello.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Investigación de dinámicas de entrenamiento: permite analizar cómo evoluciona la capacidad de razonamiento de un modelo a lo largo de los pasos de SFT, comparando este checkpoint con otros pasos del mismo barrido.
- Análisis de la evolución de la pérdida: útil para estudiar la convergencia y la estabilidad del entrenamiento en configuraciones con esfuerzo de razonamiento `thinking`.
- Continuación del entrenamiento: puede servir como punto de partida para fine-tuning adicional, aunque se debe corregir previamente la configuración del token EOS.
- Evaluación de la alineación del tokenizador: el problema del `eos_token_id` lo convierte en un caso de estudio para depurar pipelines de tokenización y generación.
- Pruebas de inferencia con configuraciones de decodificación específicas: permite experimentar con parámetros de muestreo y longitudes de generación en un modelo intermedio.
- Benchmarking de razonamiento intermedio: adecuado para medir la capacidad de razonamiento en checkpoints intermedios y compararla con el modelo base o con el checkpoint final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.4B parámetros en BF16/FP16, los pesos ocupan aproximadamente 18.8 GB. Añadiendo KV cache y activaciones, se estima un mínimo de 24 GB de VRAM para inferencia sin cuantización.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) sería suficiente para FP16. Para GPUs de 16 GB (como RTX 4080 o A100 40GB), sería necesaria cuantización, pero no se especifican tipos disponibles.
- Compatibilidad con GPU de consumo: sí, en tarjetas de 24 GB, aunque con limitaciones de contexto y batch.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se corrija el problema del token EOS y se genere una cuantización adecuada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| agentic-ptb/dpsk-v4-flash.h080.sft5.step_600 | 9.4B | No disponible | No disponible | Checkpoint intermedio |
| Qwen/Qwen3.5-9B-Base | 9.4B | No disponible | No disponible | Modelo base |
| Llama-3.1-8B-Instruct | 8B | 128K | Comunidad Llama | Modelo final |

La comparativa se limita a parámetros y estado, ya que no se dispone de benchmarks para el checkpoint evaluado. El modelo base Qwen3.5-9B-Base es el punto de referencia natural, mientras que Llama-3.1-8B-Instruct representa una alternativa de tamaño similar con licencia conocida y estado final.

## Limitaciones y advertencias

- Token EOS incompleto: la configuración `eos_token_id` es `[248044]` y falta el `248046`, lo que puede provocar generaciones que no terminen correctamente.
- Checkpoint intermedio: no es un modelo final y no ha sido validado para uso en producción.
- Licencia no disponible: el uso comercial es legalmente incierto hasta que se especifique una licencia.
- Sin benchmarks publicados: no se puede evaluar su rendimiento real en tareas estándar.
- Idiomas no especificados: se desconoce su cobertura lingüística.
- Riesgo de alucinación: al ser un modelo intermedio, puede presentar incoherencias o alucinaciones más frecuentes que un modelo final.
- Discrepancia en la nomenclatura: la model card interna menciona `step_200`, mientras que el ID del repositorio indica `step_600`, lo que sugiere posibles inconsistencias en el etiquetado del artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h080.sft5.step_600
