# francescortu/DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-s1

## Resumen

DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-s1 es una reproducción no oficial del modelo estudiante destilado descrito en el artículo *Reference-Based Distillation Detection in LLMs* (Rawat et al., arXiv:2607.09692). El modelo, desarrollado por francescortu, se basa en Qwen2.5-3B como modelo estudiante y ha sido entrenado mediante ajuste supervisado (SFT) con 1000 respuestas generadas por el profesor nvidia/Llama-3.3-70B-Instruct-NVFP8, utilizando los datos y scripts publicados por los autores del paper. Su propósito es detectar si una respuesta generada por un LLM ha sido producida mediante destilación a partir de un modelo de referencia.

La relevancia de este modelo radica en que los autores originales no liberaron los checkpoints del estudiante, por lo que esta reproducción independiente permite a la comunidad investigadora acceder a un artefacto concreto para estudiar la detección de destilación en modelos de lenguaje. Con 3.085.938.688 parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, lo que facilita su uso en entornos de investigación y evaluación. La licencia es qwen-research, que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Qwen2.5) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K (modelo base Qwen2.5-3B); 4096 (block size usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente BF16) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multilingue) |
| Licencia | qwen-research (Qwen Research License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-3B, un transformer decoder denso con atención de múltiples cabezas, normalización RMSNorm y embeddings rotatorios (RoPE). No se trata de un modelo MoE ni híbrido. El entrenamiento consistió en un ajuste supervisado (SFT) sobre 1000 respuestas generadas por el profesor nvidia/Llama-3.3-70B-Instruct-NVFP8, siguiendo la receta del Apéndice A del paper: 3 épocas, tasa de aprendizaje 1e-5, programación coseno con 5% de warmup, batch efectivo de 16 (per-device batch 4 × grad-accum 4), block size 4096, precisión bf16, gradient checkpointing y pérdida calculada únicamente sobre los tokens de respuesta (los tokens del prompt se enmascaran con -100). El prompt template es `Problem:\n{question}\n\nSolution:\n`. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Detección de destilación: según el paper, el modelo está entrenado para identificar si una respuesta ha sido generada por un modelo que ha destilado conocimiento de un modelo de referencia (teacher). La salida esperada es una clasificación o puntuación que indica la probabilidad de destilación.
- Generación de texto condicionada: al estar basado en Qwen2.5-3B, conserva la capacidad de generar texto coherente, aunque su entrenamiento específico lo orienta a la tarea de detección.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio en la información disponible.

## Casos de uso

- Investigación académica sobre destilación de modelos: el modelo permite reproducir y ampliar los experimentos del paper, analizando cómo se manifiesta la destilación en respuestas generadas por distintos LLMs.
- Auditoría de originalidad de modelos: en entornos donde se sospecha que un modelo ha sido entrenado a partir de las salidas de otro, este clasificador puede servir como herramienta de verificación preliminar.
- Evaluación de pipelines de destilación: los desarrolladores que implementan técnicas de destilación pueden usar el modelo para comprobar si sus estudiantes han aprendido patrones del teacher de forma detectable.
- Análisis de propiedad intelectual: en disputas sobre uso indebido de modelos, el detector puede aportar evidencia sobre si un modelo ha copiado respuestas de otro.
- Estudio de transferencia de conocimiento: el modelo ayuda a investigar qué características de las respuestas del teacher son más susceptibles de ser copiadas por el estudiante.
- Benchmarking de métodos de detección: sirve como punto de referencia para comparar futuros detectores de destilación, dado que es una reproducción pública y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de GSM8K y MATH500 están pendientes de cálculo y se añadirán posteriormente. No se dispone de datos comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.085 millones de parámetros en BF16, el modelo ocupa aproximadamente 6,2 GB en memoria (tamaño del repositorio). Con cuantización a 4 bits (no disponible oficialmente, pero posible mediante herramientas externas), podría reducirse a unos 2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en BF16 (por ejemplo, RTX 3060, RTX 4060, RTX 3090, RTX 4090). Para cuantización de 4 bits, GPUs con 4 GB o más serían suficientes.
- Opciones de despliegue: al ser un modelo basado en Qwen2.5, es compatible con frameworks estándar como vLLM, llama.cpp, Ollama y TGI, aunque no se ha verificado su soporte específico en la información disponible.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de 3B en una GPU moderna, se espera una latencia de decodificación del orden de decenas de milisegundos por token, pero estos valores dependen del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de detección de destilación comparables. La comparación más directa sería con el modelo base Qwen2.5-3B, del cual hereda la arquitectura, pero su propósito y entrenamiento son diferentes. El teacher (Llama-3.3-70B-Instruct-NVFP8) no es comparable por su tamaño y función. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Reproducción no oficial: el modelo no está afiliado a los autores del paper y puede no replicar exactamente el comportamiento del estudiante original.
- Datos de entrenamiento limitados: solo 1000 respuestas del conjunto s1, lo que puede limitar la generalización a otros dominios o estilos de respuesta.
- Licencia qwen-research: restringe el uso comercial y puede imponer condiciones específicas para la redistribución o el uso en productos.
- Sin benchmarks publicados: no hay evidencia empírica del rendimiento del modelo en tareas estándar, por lo que su eficacia real es incierta.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje, puede generar respuestas incorrectas o sesgadas, aunque su uso principal es la clasificación, no la generación libre.
- Contexto efectivo limitado: aunque el modelo base soporta 128K tokens, el entrenamiento se realizó con block size 4096, por lo que el rendimiento con contextos largos no está garantizado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/francescortu/DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-s1)
- [Paper en arXiv](https://arxiv.org/abs/2607.09692)
- [Repositorio del paper (GitHub)](https://github.com/RajatRawat-creator/DistillDetect)
- [Modelo base Qwen2.5-3B](https://huggingface.co/Qwen/Qwen2.5-3B)
