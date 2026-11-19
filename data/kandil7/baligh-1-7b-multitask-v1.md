# Kandil7/Baligh-1.7B-Multitask-v1

## Resumen

Baligh-1.7B-Multitask-v1 es un ajuste fino (finetune) del modelo base Kandil7/Baligh-1.7B, publicado por el usuario Kandil7 en Hugging Face. Segun las etiquetas del repositorio, el modelo base pertenece a la familia Qwen3, por lo que hereda la arquitectura transformer de dicha familia, con aproximadamente 1.700 millones de parametros y una ventana de contexto que, en el caso de Qwen3, suele ser amplia, aunque el autor no la especifica en la model card. El entrenamiento se realizo con la libreria Unsloth, segun indica el propio autor, lo que sugiere un ajuste fino eficiente en memoria.

El modelo esta orientado a generacion de texto y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio tiene un tamano de 0,1 GB, lo que indica que los pesos se almacenan en formato safetensors y probablemente en cuantizacion de 4 bits o similar, dado el reducido tamano para un modelo de 1.7B parametros.

La relevancia de este modelo es limitada por el momento: no tiene descargas ni likes, y la model card es extremadamente escueta, sin datos sobre el dataset de entrenamiento, benchmarks ni capacidades especificas. Se trata, por tanto, de un modelo experimental o de un ajuste fino personal, no de un modelo con validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun tags) |
| Parametros totales | 1.7B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo de 0,1 GB, probablemente 4-bit) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer decoder-only con atencion por causalidad. El autor no proporciona detalles sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni el mecanismo exacto de atencion (si usa atencion lineal o estandar). El ajuste fino se realizo sobre el modelo Kandil7/Baligh-1.7B, que a su vez parece ser un modelo base de la familia Qwen3, aunque no se especifica si hubo una etapa previa de preentrenamiento o de ajuste.

El entrenamiento se llevo a cabo con Unsloth, una libreria optimizada para ajuste fino de bajo coste computacional, que segun el autor permitio un entrenamiento "2x mas rapido". No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se mencionan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La informacion disponible es insuficiente para evaluar la calidad o el proposito del ajuste.

## Capacidades

- Generacion de texto en ingles, segun el campo `language: en`.
- Razonamiento y codigo: no confirmado por el autor, pero probablemente heredado de Qwen3.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Generacion de texto general en ingles: el modelo puede emplearse para tareas de continuacion de texto o redaccion basica, aunque sin benchmarks no se puede garantizar calidad.
- Prototipado rapido de asistentes conversacionales: al ser un modelo pequeno (1.7B) y con licencia Apache 2.0, es adecuado para experimentar en entornos de desarrollo sin coste de licencia.
- Fine-tuning posterior: al estar disponible en safetensors y con licencia permisiva, puede servir como base para ajustes especificos en dominios concretos.
- Despliegue en hardware modesto: su tamano reducido permite ejecucion en GPU de consumo, lo que facilita pruebas locales.
- Educacion e investigacion: util para estudiar el efecto de ajustes finos con Unsloth en modelos Qwen3 pequenos.
- Generacion de texto en ingles para tareas de baja criticidad: como resumenes o respuestas simples, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Para un modelo de 1.7B en FP16 se necesitarian aproximadamente 3,4 GB solo para pesos, mas overhead; en 4-bit podria caber en 2-3 GB.
- GPU recomendadas: no disponible. Por tamano, una RTX 3060 o superior podria ser suficiente en cuantizacion.
- Cabe en GPU de consumo: probablemente si, en cuantizacion 4-bit o 8-bit, aunque no confirmado.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), y potencialmente llama.cpp u Ollama si se generan GGUF, no confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Baligh-1.7B-Multitask-v1 | 1.7B | no disponible | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (referencia) | 1.7B | no disponible | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento para comparar. La comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Model card extremadamente escueta: no hay informacion sobre dataset, evaluacion ni sesgos.
- Riesgo de alucinacion: inherente a modelos de lenguaje pequenos, agravado por la falta de validacion.
- Solo ingles declarado: no se garantiza soporte de otros idiomas.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de calidad contrastada.
- Licencia Apache 2.0 permite uso comercial, pero sin garantias del autor.
- Posible cuantizacion agresiva (repo de 0,1 GB) que puede degradar la calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Kandil7/Baligh-1.7B-Multitask-v1
- Modelo base: https://huggingface.co/Kandil7/Baligh-1.7B
- Unsloth: https://github.com/unslothai/unsloth
