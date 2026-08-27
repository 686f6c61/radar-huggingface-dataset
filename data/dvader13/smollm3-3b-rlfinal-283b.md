# dvader13/smollm3-3b-rlfinal-283b

## Resumen

Este repositorio contiene un checkpoint intermedio de entrenamiento por refuerzo (RL) del modelo SmolLM3-3B, publicado por el usuario dvader13 en Hugging Face. No se trata de un modelo listo para inferencia, sino de un estado completo de entrenamiento (pesos en fp32, optimizador, scheduler y RNG) correspondiente al paso 1804 de la primera época de RL, sobre una base preentrenada con 283 mil millones de tokens. Su propósito es permitir reanudar o continuar el entrenamiento, no servir como modelo desplegable.

El modelo base SmolLM3-3B, desarrollado por Hugging Face, es un transformer decoder-only de 3 mil millones de parámetros con soporte de contexto de hasta 128K tokens y entrenamiento multilingüe en seis idiomas europeos. Este checkpoint hereda esas características arquitectónicas, pero al ser un artefacto de entrenamiento, no ofrece capacidades de generación directa sin un paso previo de exportación a formato de inferencia.

La relevancia de este repositorio es principalmente investigadora: permite estudiar la dinámica del RL en modelos pequeños, reproducir experimentos o continuar el entrenamiento desde un punto concreto. No está pensado para uso en producción ni para integración en aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM3-3B) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (según el modelo base) |
| Tipos de cuantizacion | no aplicable (checkpoint en fp32, no es un export de inferencia) |
| Idiomas soportados | Seis idiomas europeos (según el modelo base: inglés, francés, alemán, español, italiano y portugués) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint de entrenamiento fp32 (no se especifica si es safetensors o bin; el repositorio pesa 36.9 GB) |

## Arquitectura y entrenamiento

El checkpoint se basa en SmolLM3-3B, un modelo transformer decoder-only con atención causal estándar, entrenado por Hugging Face sobre 11 billones de tokens (según el repositorio oficial) o 10+ billones (según documentación adicional), utilizando exclusivamente datasets públicos. El modelo base incorpora un modo de razonamiento dual (pensamiento explícito y respuesta directa) y soporta contexto largo de 128K tokens.

El checkpoint concreto corresponde a un paso de entrenamiento por refuerzo (RL) sobre esa base, con 283B tokens de pretraining acumulados. El estado guardado incluye pesos en fp32, optimizador, scheduler y RNG, lo que permite reanudar el entrenamiento de forma determinista. No se han publicado detalles sobre el algoritmo de RL utilizado (PPO, GRPO, etc.) ni sobre la función de recompensa.

## Capacidades

- No es un modelo de inferencia: no puede generar texto ni realizar tareas directamente.
- Permite reanudar el entrenamiento de RL desde el paso 1804 de la época 1.
- Al estar basado en SmolLM3-3B, hereda las capacidades del modelo base (generación de texto, razonamiento, código, multilingüismo, contexto largo), pero solo tras exportar los pesos a un formato de inferencia.
- No soporta tool calling, agentes ni funciones especiales en este estado.

## Casos de uso

- Investigación en RL: estudiar la evolución de la política durante el entrenamiento por refuerzo, analizar la recompensa en diferentes pasos o comparar estrategias de RL.
- Reproducción de experimentos: al incluir el estado completo del optimizador y scheduler, permite replicar exactamente el entrenamiento desde un punto concreto.
- Continuación del entrenamiento: reanudar el RL desde el paso 1804 para explorar configuraciones adicionales sin partir de cero.
- Análisis de estabilidad: examinar la magnitud de los gradientes o la distribución de pesos en un punto intermedio del RL.
- Desarrollo de nuevas variantes: usar este checkpoint como base para fine-tuning adicional con otras técnicas (DPO, etc.) tras exportar a formato de inferencia.
- Docencia e investigación académica: como ejemplo de artefacto de entrenamiento para explicar el ciclo de vida de un modelo de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint específico. El modelo base SmolLM3-3B, según la documentación oficial, supera a Llama 3.2 3B y Qwen2.5 3B en tareas de razonamiento y código, y es competitivo con alternativas de 4B como Qwen3 y Gemma3. Sin embargo, estos resultados corresponden al modelo final, no a este checkpoint intermedio de RL.

## Requisitos de hardware

- El repositorio ocupa 36.9 GB, lo que indica que el checkpoint completo (pesos fp32 + optimizador + estados) requiere al menos esa cantidad de almacenamiento.
- Para reanudar el entrenamiento se necesita una GPU con suficiente VRAM para alojar el modelo en fp32 (3B parámetros ≈ 12 GB solo para pesos) más el optimizador y los estados adicionales, lo que puede superar los 30 GB.
- Se recomienda una GPU de clase profesional: A100 (40/80 GB), H100 (80 GB) o similar. No es viable en GPUs de consumo como RTX 4090 (24 GB) para el entrenamiento completo, aunque podría intentarse con técnicas de offloading.
- Para inferencia tras exportar, el modelo base puede ejecutarse en GPUs de consumo con cuantización (por ejemplo, GGUF en llama.cpp u Ollama), pero este checkpoint no está preparado para ello.

## Comparativa con modelos similares

No hay checkpoints de RL públicos comparables con las mismas características (mismo modelo base, mismo paso, mismo tamaño). Se puede comparar con el modelo base SmolLM3-3B y con otros modelos de 3B:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache-2.0 | Inferencia directa |
| Este checkpoint (RL) | 3B | 128K (heredado) | Apache-2.0 | Solo entrenamiento |
| Llama 3.2 3B | 3B | 128K | Llama license | Inferencia directa |
| Qwen2.5 3B | 3B | 32K | Apache-2.0 | Inferencia directa |

## Limitaciones y advertencias

- No es un modelo de inferencia: cualquier intento de usarlo para generar texto fallará sin un proceso de exportación previo.
- El checkpoint es un estado intermedio de RL, por lo que su rendimiento puede ser inferior al del modelo final y puede presentar comportamientos inestables.
- No se dispone de información sobre el algoritmo de RL, la función de recompensa ni los datos utilizados en esa fase, lo que limita la reproducibilidad externa.
- El tamaño del repositorio (36.9 GB) y el formato fp32 dificultan su uso en entornos con recursos limitados.
- Aunque la licencia es Apache-2.0, el uso comercial del checkpoint como artefacto de entrenamiento puede requerir verificar las condiciones de los datos subyacentes del modelo base (aunque SmolLM3 se entrenó con datos públicos, conviene revisar las políticas de cada dataset).

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/dvader13/smollm3-3b-rlfinal-283b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio oficial de SmolLM: https://github.com/huggingface/smollm
- Blog de SmolLM3: https://huggingface.co/blog/smollm3
- Documentación adicional (PDF): https://aial.ie/research/gpai-training-transparency/archive/SmolLM_33B_2025_11_12.pdf
- Ficha en atomic.chat: https://atomic.chat/models/smollm3-3b
