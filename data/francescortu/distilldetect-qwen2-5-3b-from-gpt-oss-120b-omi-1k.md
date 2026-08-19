# francescortu/DistillDetect-Qwen2.5-3B-from-gpt-oss-120b-OMI-1K

## Resumen

DistillDetect-Qwen2.5-3B-from-gpt-oss-120b-OMI-1K es una reproducción no oficial de un modelo estudiante destilado, creada por francescortu a partir del trabajo *Reference-Based Distillation Detection in LLMs* (Rawat et al., arXiv:2607.09692). El modelo parte de Qwen/Qwen2.5-3B como base (estudiante) y utiliza openai/gpt-oss-120b como profesor, entrenándose con 1000 respuestas generadas por el profesor a partir de prompts de OpenMathInstruct-2. Su propósito es servir como herramienta de investigación para estudiar la detección de destilación en modelos de lenguaje, un tema relevante para la seguridad, la propiedad intelectual y la trazabilidad de los modelos.

Con 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), es un modelo denso de tamaño pequeño, adecuado para entornos con recursos limitados. La licencia es Qwen Research License, lo que restringe su uso comercial. Al ser una reproducción independiente, no está afiliado a los autores originales del paper, y los resultados de evaluación (GSM8K, MATH500) aún no se han publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B) |
| Parametros totales | 3.085.938.688 (3,09B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Qwen Research License (qwen-research) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en la arquitectura de Qwen2.5-3B, sin modificaciones estructurales. El entrenamiento consistió en un ajuste fino supervisado (SFT) siguiendo la receta del paper: 3 épocas, tasa de aprendizaje 1e-5 con programación coseno y 5% de calentamiento, tamaño de lote efectivo de 16 (4 por dispositivo con acumulación de gradientes de 4), tamaño de bloque de 4096 tokens, precisión bf16 y checkpointing de gradientes. La pérdida se calcula únicamente sobre los tokens de respuesta, enmascarando el prompt con -100. Los datos de entrenamiento son 1000 respuestas generadas por el profesor gpt-oss-120b a partir de prompts de OpenMathInstruct-2, redistribuidas por los autores del paper bajo licencia MIT. No se emplearon técnicas como RLHF o DPO; el proceso es exclusivamente SFT.

## Capacidades

- Generación de texto y razonamiento matemático básico, heredados del modelo base Qwen2.5-3B.
- Especialización en resolución de problemas matemáticos (formato `Problem:\n{question}\n\nSolution:\n`).
- Capacidad de procesar instrucciones en formato de texto plano, sin soporte adicional de tool calling, agentes o multimodalidad (no se menciona en la información disponible).
- Al ser una reproducción con solo 1000 ejemplos, su rendimiento en tareas generales es limitado y no se han documentado capacidades avanzadas.

## Casos de uso

- Investigación académica sobre detección de destilación: permite reproducir los experimentos del paper y analizar cómo un modelo destilado se comporta frente a detectores de destilación.
- Estudio de transferencia de conocimiento: sirve para comparar la calidad de las respuestas generadas por el profesor frente a las del estudiante en tareas matemáticas.
- Evaluación de técnicas de destilación: al ser un modelo pequeño, facilita pruebas de laboratorio sobre cómo la destilación afecta a la robustez y a la detectabilidad.
- Desarrollo de contramedidas de detección: investigadores pueden usar este modelo para entrenar o evaluar clasificadores que identifiquen respuestas destiladas.
- Benchmarking de modelos pequeños en razonamiento matemático: aunque no hay resultados publicados, puede utilizarse como referencia en entornos de investigación.
- Educación y formación en IA: como ejemplo práctico de destilación y reproducción de papers, útil para cursos de aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones de GSM8K y MATH500 están en proceso y se añadirán posteriormente.

## Requisitos de hardware

- Al ser un modelo de 3,09B parámetros, es adecuado para GPUs de consumo con al menos 8 GB de VRAM en precisión fp16/bf16, aunque no se especifican requisitos exactos.
- No se dispone de datos sobre latencia o throughput; se recomienda usar frameworks como vLLM, llama.cpp u Ollama para inferencia, pero no hay confirmación oficial.
- El tamaño del repositorio es de 6,2 GB, lo que sugiere que los pesos en safetensors ocupan aproximadamente 6 GB (compatible con bf16).
- Para despliegue en producción, se necesitaría cuantización (por ejemplo, GGUF) para reducir la huella de memoria, pero no se han publicado versiones cuantizadas.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría (destilación o detección de destilación). No hay datos de rendimiento ni de características que permitan una comparación objetiva.

## Limitaciones y advertencias

- Reproducción no oficial: no está afiliada a los autores del paper, por lo que puede haber diferencias con el modelo original (que no fue liberado).
- Entrenamiento con solo 1000 ejemplos: el modelo tiene una capacidad limitada y puede presentar alucinaciones o errores en tareas fuera del dominio matemático.
- Licencia Qwen Research License: restringe el uso comercial y puede imponer condiciones específicas para la redistribución.
- Sin resultados de evaluación publicados: no se puede verificar su rendimiento real en benchmarks estándar.
- Posibles sesgos heredados del modelo base Qwen2.5-3B, que no se han mitigado en este ajuste fino.
- El prompt template es específico y no se ha probado su robustez en otros formatos de entrada.

## Enlaces

- [HuggingFace - DistillDetect-Qwen2.5-3B-from-gpt-oss-120b-OMI-1K](https://huggingface.co/francescortu/DistillDetect-Qwen2.5-3B-from-gpt-oss-120b-OMI-1K)
- [Paper arXiv:2607.09692](https://arxiv.org/abs/2607.09692)
- [Repositorio GitHub del paper (DistillDetect)](https://github.com/RajatRawat-creator/DistillDetect)
- [Modelo base Qwen/Qwen2.5-3B](https://huggingface.co/Qwen/Qwen2.5-3B)
