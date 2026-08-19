# FRPO/qwen3-1.7b-a10_lengthnorm-k1-cNone-lnorm-clip0.2-mb4-eta100-bs256x5-n2

## Resumen
El modelo `qwen3-1.7b-a10_lengthnorm-k1-cNone-lnorm-clip0.2-mb4-eta100-bs256x5-n2` es un checkpoint experimental de fine-tuning por reinforcement learning (RL) sobre el modelo base `Qwen/Qwen3-1.7B`, publicado por la organización FRPO. Forma parte de la serie de experimentos "KL-in-LLM-RL" y ha sido entrenado con el framework verl de Volcengine. Su propósito es investigar cómo el RL post-entrenamiento afecta al comportamiento de modelos pequeños, en este caso un transformer de 1.7B parámetros (2.03B contando embeddings). Es un modelo de investigación, no un producto listo para producción.

El nombre del repositorio codifica la configuración de entrenamiento (a10, lengthnorm, k1, cNone, lnorm-clip0.2, mb4, eta100, bs256x5, n2), aunque no se documenta el significado exacto de cada parámetro. Los pesos se publican en fp32 sin post-procesamiento, tal como los guardó el entrenador, y el checkpoint corresponde al paso global 200. No se proporcionan licencia, idiomas soportados ni resultados de benchmarks en la documentación disponible.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B) |
| Parámetros totales | 2.031.739.904 (2,03B) |
| Parámetros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponibles (pesos fp32 safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento
El modelo se basa en `Qwen/Qwen3-1.7B`, un transformer decoder-only de 1.7B parámetros. El checkpoint resultante del fine-tuning por RL alcanza 2.03B parámetros totales. No se documentan detalles de la arquitectura interna (número de capas, cabezas de atención, etc.) en esta ficha.

El entrenamiento se realizó con el framework verl de Volcengine, utilizando el algoritmo FRPO (siglas no expandidas en la documentación). El nombre del repositorio codifica la configuración de hiperparámetros, aunque no se explica su significado. No se proporciona información sobre el dataset de entrenamiento, las recompensas utilizadas ni el número de tokens procesados. Los pesos se guardan en fp32 sin post-procesamiento, lo que facilita la reproducibilidad pero aumenta el tamaño del repositorio (8.1 GB).

## Capacidades
- Generación de texto: el modelo hereda la capacidad de generación de texto del modelo base Qwen3-1.7B, aunque no se documentan capacidades específicas del checkpoint RL.
- Conversación: el tag `conversational` sugiere que puede usarse en tareas de diálogo, pero no hay ejemplos ni evaluación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo es principalmente un objeto de estudio para análisis de RL, no un modelo de propósito general.

## Casos de uso
- Investigación en RL post-entrenamiento: el checkpoint permite reproducir los experimentos de FRPO y estudiar el efecto del RL sobre la generación de texto en modelos pequeños.
- Análisis de estabilidad de entrenamiento: al publicar pesos fp32 sin procesar, se pueden auditar los efectos del algoritmo en cada paso.
- Comparación de algoritmos: puede usarse como baseline para comparar FRPO con otros métodos de RL (PPO, GRPO, etc.) sobre el mismo modelo base.
- Estudio de efectos de normalización de longitud: la configuración `lengthnorm` sugiere que el entrenamiento incluye normalización por longitud, lo que permite investigar el sesgo de longitud en respuestas generadas.
- Docencia y divulgación: sirve como ejemplo práctico de fine-tuning RL con verl para cursos de aprendizaje por refuerzo.
- Reproducibilidad: al estar disponible el checkpoint exacto, permite verificar resultados publicados en papers del grupo FRPO.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otros tests estándar.

## Requisitos de hardware
- El repositorio contiene 8.1 GB en pesos fp32, por lo que se necesitan al menos 8 GB de VRAM para cargar el modelo en fp32, más overhead de inferencia (se recomiendan 10-12 GB).
- GPU recomendadas: tarjetas con 12 GB o más (RTX 3060 12GB, RTX 4070, A10, L4, etc.).
- No se han publicado cuantizaciones, por lo que no se puede reducir el requisito de memoria.
- No se proporcionan opciones de despliegue oficiales, pero al ser compatible con transformers y `text-generation-inference`, puede servirse con vLLM, TGI o llama.cpp (si se convierten los pesos a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de rendimiento para comparar con otros modelos. El modelo es un fine-tuning de Qwen3-1.7B, por lo que su rendimiento base será similar al del modelo original, pero no hay benchmarks que lo confirmen. Alternativas comparables en tamaño (1-2B) serían Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B, pero no se pueden comparar sin datos.

## Limitaciones y advertencias
- Modelo experimental: no ha sido evaluado para uso en producción; puede generar contenido incoherente o alucinado.
- Licencia no especificada: no se puede determinar si es de uso libre o restringido; se recomienda contactar con el autor antes de usar comercialmente.
- Sin documentación de sesgos: no se han realizado auditorías de sesgos, por lo que puede reflejar los sesgos del modelo base y del dataset de RL.
- Contexto limitado: al ser un modelo de 1.7B, su ventana de contexto es probablemente pequeña, aunque no se confirma en la documentación.
- Peso fp32: el tamaño de 8.1 GB dificulta su uso en entornos con VRAM limitada sin cuantización, que no se proporciona.
- Sin garantías de soporte: al ser un checkpoint de investigación auto-subido, no hay mantenimiento ni actualizaciones previstas.

## Enlaces
- HuggingFace: https://huggingface.co/FRPO/qwen3-1.7b-a10_lengthnorm-k1-cNone-lnorm-clip0.2-mb4-eta100-bs256x5-n2
- Framework verl: https://github.com/volcengine/verl
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
