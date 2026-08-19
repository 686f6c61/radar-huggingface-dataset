# Adi911247/fraud-detector

## Resumen

El modelo `fraud-detector` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario Adi911247 y publicado en HuggingFace. A pesar de su nombre, no se proporciona información sobre el conjunto de datos de entrenamiento ni sobre el dominio específico de detección de fraude; la model card solo indica que fue entrenado mediante Supervised Fine-Tuning (SFT) con la librería TRL. El repositorio no tiene descargas ni interacciones registradas, y su tamaño es de 0 GB, lo que sugiere que los pesos no están disponibles públicamente o que el modelo no ha sido subido correctamente.

El modelo hereda las características arquitectónicas del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only con 1.500 millones de parámetros y una ventana de contexto de 32.768 tokens. Sin embargo, al ser un fine-tuning, las capacidades finales dependen del dataset utilizado, del cual no hay rastro en la documentación. La relevancia actual es limitada, ya que no se aportan datos de rendimiento, casos de uso ni métricas, y el repositorio parece incompleto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (heredados del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se confirma para este fine-tuning) |
| Licencia | no disponible (el YAML indica "licence: license", ambiguo; el modelo base usa Apache 2.0) |
| Formato de pesos | safetensors (indicado en tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `Qwen/Qwen2.5-1.5B-Instruct`, que emplea una arquitectura transformer con atención de múltiples cabezas, normalización RMSNorm y activación SwiGLU. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL (Transformers Reinforcement Learning), tal como se indica en los metadatos. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La versión de TRL es la 1.10.0, con Transformers 5.13.1 y PyTorch 2.11.0+cu128, lo que sugiere un entorno de entrenamiento reciente.

## Capacidades

No se dispone de información detallada sobre las capacidades específicas del modelo tras el fine-tuning. Basándose en el modelo base Qwen2.5-1.5B-Instruct, se espera que pueda:

- Generar texto coherente y mantener conversaciones multi-turno.
- Seguir instrucciones en formato chat.
- Realizar tareas básicas de razonamiento y comprensión del lenguaje.
- Soporte multilingüe (el modelo base cubre más de 29 idiomas, pero no se confirma aquí).
- No se documenta soporte para tool calling, agentes o capacidades multimodales.

Sin embargo, al no existir evidencia de evaluación ni ejemplos de uso, estas capacidades deben considerarse hipotéticas.

## Casos de uso

No se han documentado casos de uso concretos en la información proporcionada. Dado el nombre del modelo, podría especularse que fue diseñado para detección de fraude, pero no hay ningún dato que lo respalde. Por tanto, no es posible recomendar aplicaciones prácticas sin riesgo de inducir a error. Se recomienda tratar este modelo como un experimento no validado y no utilizarlo en entornos de producción sin una evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El repositorio carece de cualquier dato cuantitativo de rendimiento.

## Requisitos de hardware

Al tratarse de un modelo de 1.500 millones de parámetros, los requisitos de inferencia son similares a los de otros modelos de este tamaño:

- VRAM estimada: aproximadamente 3-4 GB en FP16, 1,5-2 GB en cuantización de 8 bits y menos de 1 GB en 4 bits (estimación para el modelo base).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 2060, GTX 1660 Super) para FP16; para cuantización, incluso GPUs integradas con 4 GB pueden funcionar.
- Es compatible con consumer GPU de gama media y baja.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con pipeline de generación, TGI.
- Latencia y throughput: no disponible; dependerá del hardware y de la cuantización.

Estos valores son estimaciones basadas en el modelo base, no en este fine-tuning concreto.

## Comparativa con modelos similares

Dado que no hay información de rendimiento, la comparación se limita a características generales del modelo base frente a otros modelos de tamaño similar.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.500 M | 32.768 | Apache 2.0 | Modelo base de este fine-tuning |
| Llama-3.2-1B-Instruct | 1.230 M | 128.000 | Llama 3.2 Community License | Alternativa de tamaño similar |
| Gemma-2-2B | 2.600 M | 8.192 | Gemma Terms of Use | Algo mayor, contexto menor |
| Phi-3.5-mini | 3.800 M | 128.000 | MIT | Mayor tamaño, contexto largo |

No se dispone de comparativas de rendimiento reales entre estos modelos y el `fraud-detector`.

## Limitaciones y advertencias

- No se ha publicado información sobre el dataset de entrenamiento, por lo que se desconocen los posibles sesgos o alucinaciones específicas.
- El modelo no ha sido evaluado ni validado; su uso en producción es desaconsejable.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad.
- El tamaño del repositorio es 0 GB, lo que indica que los pesos pueden no estar disponibles o el modelo no ha sido subido correctamente.
- La licencia es ambigua ("licence: license"), aunque el modelo base es Apache 2.0; se debe verificar antes de cualquier uso comercial.
- No se garantiza la compatibilidad con todos los idiomas ni con tareas específicas de detección de fraude.

## Enlaces

- Repositorio HuggingFace: [Adi911247/fraud-detector](https://huggingface.co/Adi911247/fraud-detector)
- Modelo base: [Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- TRL: [https://github.com/huggingface/trl](https://github.com/huggingface/trl)
