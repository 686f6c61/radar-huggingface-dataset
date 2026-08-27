# dvader13/smollm3-3b-rlfinal-3p11t

## Resumen

El repositorio `dvader13/smollm3-3b-rlfinal-3p11t` contiene un checkpoint intermedio del modelo SmolLM3-3B, desarrollado por el autor `dvader13`. No se trata de un modelo listo para inferencia, sino de un estado completo de entrenamiento al final de la primera época de un proceso de aprendizaje por refuerzo (RL), sobre el modelo base preentrenado con 3,11 billones de tokens. El checkpoint incluye los pesos en fp32, el optimizador, el scheduler y el estado del generador de números aleatorios, lo que permite reanudar el entrenamiento de forma reproducible.

Su relevancia radica en que proporciona acceso a un punto intermedio del proceso de alineación por RL de un modelo compacto de 3B parámetros, algo poco habitual en la comunidad open source. Es útil para investigadores que quieran estudiar la dinámica del RL en modelos pequeños o continuar el entrenamiento desde este punto exacto. La arquitectura subyacente es la del SmolLM3-3B: un Transformer decoder con Grouped Query Attention (GQA) y sin RoPE, diseñado para eficiencia en contexto largo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con Grouped Query Attention (GQA), sin RoPE |
| Parametros totales | 3B (aproximado, base SmolLM3-3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en fp32, no apto para inferencia) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (estado de entrenamiento completo, no exportado a safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo base es SmolLM3-3B, un Transformer decoder con Grouped Query Attention (GQA) para reducir el tamaño de la caché KV y sin Rotary Positional Embeddings (RoPE), lo que mejora el rendimiento en tareas de contexto largo. El preentrenamiento se realizó con 3,11 billones de tokens (según la descripción del repositorio; el modelo oficial SmolLM3-3B se entrenó con 11T tokens, pero este checkpoint indica un rango de 3,11T). El checkpoint corresponde al paso 1804 del entrenamiento de RL, al final de la época 1. Los detalles del algoritmo de RL (p. ej., PPO, GRPO) y el dataset de RL no están disponibles en la información proporcionada.

Al ser un checkpoint de entrenamiento, no se ha aplicado ninguna etapa de cuantización ni exportación a formatos de inferencia. Los pesos están almacenados en fp32, junto con el estado del optimizador, el scheduler y el RNG, lo que implica un tamaño de repositorio de 36,9 GB.

## Capacidades

- No es un modelo de inferencia: el checkpoint no puede utilizarse directamente para generar texto ni ejecutar tareas de razonamiento, código o matemáticas.
- Permite reanudar el entrenamiento de RL desde el paso 1804 (época 1), incluyendo el estado completo del optimizador y el scheduler.
- El modelo base SmolLM3-3B, al que pertenece este checkpoint, es capaz de generación de texto, razonamiento, código, matemáticas y soporte de tool calling en su versión final, pero estas capacidades no son aplicables a este checkpoint intermedio.
- No se dispone de información sobre capacidades multilingües específicas de este checkpoint.

## Casos de uso

- **Investigación en aprendizaje por refuerzo**: este checkpoint permite a investigadores estudiar la evolución del comportamiento del modelo a lo largo del RL, comparando el rendimiento en diferentes pasos de entrenamiento.
- **Continuación del entrenamiento**: se puede reanudar el entrenamiento desde el paso 1804, con el estado completo del optimizador y RNG, para experimentar con diferentes hiperparámetros de RL sin empezar desde cero.
- **Análisis de la dinámica de pérdida**: al incluir el scheduler y el RNG, es posible reproducir exactamente la secuencia de entrenamiento y analizar cómo cambian las métricas de pérdida y recompensa en el paso 1804.
- **Fine-tuning posterior**: aunque no es un modelo de inferencia, se puede partir de este checkpoint para continuar con otras técnicas de alineación (p. ej., DPO) si el investigador tiene acceso a infraestructura de entrenamiento.
- **Estudio de la arquitectura SmolLM3**: los pesos en fp32 permiten inspeccionar la estructura interna del modelo en un estado intermedio, lo que puede ser útil para análisis de interpretabilidad.
- **Benchmarking de estabilidad del entrenamiento**: al ser un checkpoint de RL, se puede evaluar la estabilidad del proceso de entrenamiento comparando este punto con otros checkpoints intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este checkpoint específico. El modelo base SmolLM3-3B supera a Llama 3.2 3B y Qwen2.5 3B en varios benchmarks, según el blog oficial, pero estos datos no se aplican directamente a este checkpoint intermedio de RL.

## Requisitos de hardware

- **Para continuar entrenamiento**: se necesita una GPU con al menos 40 GB de VRAM (p. ej., A100 40GB, H100 80GB) para cargar el estado completo en fp32 (36,9 GB) más el optimizador y los gradientes. En GPU de 24 GB (RTX 3090/4090) no cabe sin técnicas de offloading.
- **Para inferencia**: no aplica, ya que el checkpoint no está exportado a un formato de inferencia.
- **Opciones de despliegue**: no disponible para vLLM, llama.cpp, Ollama o TGI, porque no es un modelo de inferencia.
- **Latencia y throughput**: no aplicable.

## Comparativa con modelos similares

No hay comparativa directa posible, ya que este checkpoint no es un modelo de inferencia. Como referencia, el modelo base SmolLM3-3B se compara con otros modelos de 3B:

| Modelo | Parámetros | Contexto | Rendimiento (MMLU, aprox.) | Licencia |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | no disponible | competitivo con Llama 3.2 3B y Qwen2.5 3B | Apache 2.0 |
| Llama 3.2 3B | 3B | 128K | inferior a SmolLM3-3B | Llama 3.2 License |
| Qwen2.5 3B | 3B | 128K | inferior a SmolLM3-3B | Apache 2.0 |

## Limitaciones y advertencias

- **No es un modelo de inferencia**: no se puede utilizar en producción ni para generar texto. Cualquier intento de cargarlo en un framework de inferencia fallará.
- **Sesgos y alucinaciones**: no se conocen sesgos específicos de este checkpoint, pero el modelo base puede presentar sesgos de los datos de pretraining y RL; no hay evaluación disponible.
- **Licencia**: aunque la licencia es Apache 2.0, el uso de este checkpoint está limitado a tareas de entrenamiento; no se puede distribuir como modelo de inferencia sin exportación previa.
- **Tamaño y almacenamiento**: el repositorio ocupa 36,9 GB, lo que puede suponer un coste de almacenamiento y ancho de banda significativo.
- **Reproducibilidad**: el checkpoint es resumible, pero la reproducción exacta del entrenamiento requiere el mismo entorno, la misma versión de librerías y el mismo dataset de RL, que no se especifican.

## Enlaces

- [Repositorio HuggingFace del checkpoint](https://huggingface.co/dvader13/smollm3-3b-rlfinal-3p11t)
- [SmolLM3-3B oficial](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- [Repositorio GitHub de SmolLM](https://github.com/huggingface/smollm)
- [Documentación de SmolLM3 en Transformers](https://huggingface.co/docs/transformers/en/model_doc/smollm3)
- [Blog de SmolLM3](https://learnopencv.com/smollm3-explained/)
