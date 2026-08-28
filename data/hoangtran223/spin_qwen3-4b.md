# HoangTran223/SPIN_Qwen3-4B

## Resumen

SPIN_Qwen3-4B es un checkpoint de investigación desarrollado por HoangTran223 que aplica la técnica de Self-Play Fine-Tuning (SPIN, Chen et al., ICLR 2024) sobre el modelo base Qwen3-4B. El proceso comienza con un ajuste fino supervisado (SFT) sobre el dataset UltraChat200k, seguido de iteraciones de auto-juego sobre UltraChat50k, donde el modelo genera sus propias respuestas para usarlas como ejemplos negativos en un esquema de optimización tipo DPO. El objetivo es explorar si el auto-juego puede mejorar la calidad del modelo sin necesidad de preferencias humanas externas.

El repositorio contiene múltiples subcarpetas correspondientes a las iteraciones del entrenamiento (ite0, ite1, etc.), incluyendo un snapshot intermedio de la iteración 1 que está en progreso. Se trata de un experimento académico con 0 descargas y 0 likes, no de un modelo listo para producción. Hereda la arquitectura y el tamaño de Qwen3-4B (4 mil millones de parámetros), aunque no se especifican detalles sobre la longitud de contexto ni las capacidades multilingües en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B) |
| Parametros totales | 4B (según nombre del modelo, heredado de Qwen3-4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3-4B, por lo que hereda su arquitectura transformer decoder-only. El entrenamiento sigue el protocolo SPIN: primero se realiza un SFT sobre UltraChat200k, y después se ejecutan iteraciones de auto-juego sobre UltraChat50k. En cada iteración, el modelo genera completions sintéticas que se utilizan como respuestas rechazadas en un objetivo de optimización DPO con β=0.1. Los hiperparámetros incluyen 2 épocas por iteración, longitud máxima de secuencia de 1024 tokens, longitud máxima de prompt de 512 tokens, batch size de 2 con acumulación de gradientes de 2, y optimizador RMSprop. La tasa de aprendizaje pico es 5e-7 para las iteraciones 0 y 1, y decae a 1e-7 para las iteraciones 2 y 3. El run completo comprende 4 iteraciones (ite0 a ite3), aunque el snapshot de ite1 está incompleto (58% del total de pasos).

## Capacidades

- Al ser un fine-tuning de Qwen3-4B, se espera que mantenga las capacidades del modelo base: generación de texto, razonamiento, código, matemáticas y soporte multilingüe, aunque no se han realizado evaluaciones específicas en este checkpoint.
- No se documentan capacidades adicionales como tool calling, agentes o modo thinking en la información proporcionada.
- El modelo está diseñado para experimentación con la metodología SPIN, no para uso directo en aplicaciones.

## Casos de uso

- Investigación en alineación de modelos: permite estudiar el efecto del auto-juego (SPIN) frente a métodos tradicionales como RLHF o DPO, comparando iteraciones sucesivas del mismo modelo.
- Reproducción de experimentos: el repositorio incluye los datos generados (train.jsonl) y los checkpoints intermedios, lo que facilita replicar el entrenamiento o analizar la evolución del modelo.
- Análisis de la dinámica de entrenamiento: los snapshots de cada iteración permiten inspeccionar cómo cambian las respuestas del modelo a lo largo del proceso de auto-juego.
- Desarrollo de variantes de Qwen3-4B: sirve como punto de partida para investigaciones que quieran combinar SPIN con otras técnicas de fine-tuning.
- Evaluación de la calidad de datos sintéticos: los completions generados en cada iteración pueden analizarse para entender qué tipo de respuestas produce el modelo y cómo se utilizan como ejemplos negativos.
- Comparación de hiperparámetros: el detalle de configuración (LR, β, épocas) permite estudiar la sensibilidad del método a estos parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos específicos en la documentación.
- Como modelo de 4B parámetros en formato safetensors, se estima que la inferencia en FP16 requiere aproximadamente 8-10 GB de VRAM, lo que lo hace ejecutable en GPUs de consumo como RTX 3090 o RTX 4090, aunque esta es una estimación general no confirmada por el autor.
- Para entrenamiento o fine-tuning adicional, se necesitaría al menos 16-20 GB de VRAM, dependiendo de la configuración.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede cargarse con Hugging Face Transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se ha verificado su compatibilidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Método de alineación | Licencia | Disponibilidad |
|---|---|---|---|---|
| SPIN_Qwen3-4B (este) | 4B | SPIN (auto-juego) | Apache-2.0 | Checkpoint de investigación |
| Qwen3-4B (base) | 4B | SFT + RLHF (según documentación oficial) | Apache-2.0 | Modelo oficial estable |
| Otros fine-tunings de Qwen3-4B | 4B | Variable (SFT, DPO, etc.) | Variable | Depende del autor |

No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación en progreso: la iteración 1 está incompleta y no se ha validado la calidad del modelo final.
- No hay evaluaciones de rendimiento, sesgos o alucinaciones; el modelo no está listo para uso en producción.
- Al heredar de Qwen3-4B, puede arrastrar sesgos presentes en el modelo base y en los datos de UltraChat.
- La licencia Apache-2.0 permite uso comercial, pero la falta de validación hace recomendable no utilizarlo en aplicaciones críticas.
- El repositorio tiene una estructura compleja (subcarpetas por iteración) que requiere cargar el checkpoint correcto mediante el parámetro `subfolder`.
- No se especifican idiomas soportados ni longitud de contexto, por lo que su comportamiento en estos aspectos es incierto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HoangTran223/SPIN_Qwen3-4B
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
