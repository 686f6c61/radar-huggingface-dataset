# dvader13/smollm3-3b-rlfinal-94p4b

## Resumen

Este repositorio contiene un checkpoint intermedio de entrenamiento con reinforcement learning (RL) del modelo SmolLM3-3B, publicado por el usuario dvader13. No se trata de un modelo listo para inferencia, sino de un estado completo de entrenamiento (pesos fp32, optimizador, scheduler y RNG) correspondiente al final de la primera época de RL, sobre una base preentrenada con 94.4 mil millones de tokens. El objetivo de este tipo de publicaciones es permitir reanudar el entrenamiento o auditar el proceso, no desplegar el modelo en producción.

El modelo base, SmolLM3-3B, es un transformer decoder-only de 3 mil millones de parámetros desarrollado por Hugging Face, con atención de consultas agrupadas (GQA), sin posiciones rotatorias (RoPE) y soporte de contexto de hasta 128K tokens. Está diseñado para ser eficiente en despliegue y compite favorablemente con modelos de 4B. Sin embargo, este checkpoint concreto no es un export de inferencia, por lo que sus capacidades prácticas son nulas hasta que se complete el entrenamiento y se genere un modelo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en SmolLM3-3B) |
| Parametros totales | 3 mil millones (aprox.) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128K tokens (según el modelo base, no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (checkpoint fp32, sin cuantizar) |
| Idiomas soportados | no disponible (el modelo base soporta 6 idiomas, pero este checkpoint no especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de entrenamiento fp32 (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El checkpoint se basa en SmolLM3-3B, un modelo transformer decoder-only con Grouped Query Attention (GQA) para reducir el tamaño de la caché KV y sin RoPE, lo que mejora el rendimiento en tareas de contexto largo. El entrenamiento de RL se realizó sobre una base preentrenada con 94.4 mil millones de tokens (rung de pretraining). El checkpoint corresponde al paso 1804, al final de la primera época de RL, e incluye el estado completo del optimizador, scheduler y generador de números aleatorios, lo que permite reanudar el entrenamiento de forma reproducible. No se especifican los detalles del algoritmo de RL (PPO, GRPO, etc.) ni la composición del dataset de recompensa.

## Capacidades

- No es un modelo de inferencia: al ser un checkpoint de entrenamiento, no puede generar texto ni realizar tareas de razonamiento, código o tool calling.
- Permite reanudar el entrenamiento de RL desde el punto exacto en que se detuvo, incluyendo el estado del optimizador y el scheduler.
- Facilita la auditoría del proceso de entrenamiento, ya que se pueden inspeccionar los pesos y los estados intermedios.
- No soporta cuantización ni despliegue en motores de inferencia como vLLM, llama.cpp u Ollama.

## Casos de uso

- Continuación de entrenamiento: investigadores que quieran reanudar el RL desde el paso 1804 pueden cargar este checkpoint y continuar con su propio dataset de recompensa.
- Reproducibilidad de experimentos: al incluir el estado completo (optimizador, scheduler, RNG), se puede replicar exactamente la trayectoria de entrenamiento.
- Análisis de convergencia: estudiar la evolución de los pesos y las métricas de recompensa al final de la primera época de RL.
- Fine-tuning adicional: aunque no es el uso previsto, se podría partir de estos pesos para un ajuste fino supervisado, siempre que se conviertan a un formato de inferencia.
- Investigación en RL para modelos pequeños: comparar el efecto de diferentes funciones de recompensa o hiperparámetros usando este checkpoint como punto de partida.
- No es adecuado para aplicaciones en producción, atención al cliente, generación de código o cualquier tarea de inferencia directa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este checkpoint no es un modelo final, por lo que no tiene métricas de rendimiento propias. El modelo base SmolLM3-3B, según la documentación de Hugging Face, supera a Llama 3.2 3B y Qwen2.5 3B, y es competitivo con modelos de 4B como Qwen3 y Gemma3, pero esos datos no aplican a este checkpoint intermedio.

## Requisitos de hardware

- Para reanudar el entrenamiento se necesitan al menos 36.9 GB de almacenamiento (tamaño del repositorio) y una GPU con suficiente VRAM para alojar los pesos fp32 de 3B parámetros, más el optimizador y el scheduler. En fp32, los pesos ocupan aproximadamente 12 GB, pero el optimizador Adam en fp32 duplica o triplica ese requisito, por lo que se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40GB o superior).
- No es posible ejecutar inferencia con este checkpoint directamente; habría que convertirlo a un formato de inferencia (por ejemplo, safetensors con pesos fp16 o bf16) y luego usar vLLM, llama.cpp u Ollama.
- Para el modelo base SmolLM3-3B, la inferencia en cuantización Q4_K_M requiere unos 2 GB de VRAM y puede ejecutarse en GPUs de consumo como una RTX 3060, pero eso no aplica a este checkpoint.

## Comparativa con modelos similares

Este checkpoint no es comparable directamente con modelos finales. Como referencia, el modelo base SmolLM3-3B se compara con:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache 2.0 | Modelo final, listo para inferencia |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community | Modelo final |
| Qwen2.5 3B | 3B | 32K | Apache 2.0 | Modelo final |
| Este checkpoint (dvader13) | 3B | no disponible | Apache 2.0 | Checkpoint de entrenamiento, no inferencia |

## Limitaciones y advertencias

- No es un modelo de inferencia: cualquier intento de usarlo para generar texto o realizar tareas fallará. Es un estado de entrenamiento, no un export.
- No se especifican los datos de recompensa ni el algoritmo de RL utilizado, por lo que no se puede evaluar la calidad del entrenamiento.
- El tamaño del repositorio (36.9 GB) es grande debido a que incluye el estado completo del optimizador y scheduler, no solo los pesos.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma, ya que no es un modelo final.
- La licencia Apache 2.0 permite uso comercial, pero solo aplica al checkpoint, no a un modelo derivado que aún no existe.
- Para producción, es imprescindible esperar a que el autor publique un export de inferencia o convertir manualmente los pesos a un formato adecuado.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/dvader13/smollm3-3b-rlfinal-94p4b
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Documentación de SmolLM3 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/smollm3
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
- Página de SmolLM3 en atomic.chat: https://atomic.chat/models/smollm3-3b
- Variante en Ollama: https://ollama.com/alibayram/smollm3
