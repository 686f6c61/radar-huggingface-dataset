# kerasformers/qwen2-1.5b

## Resumen

`kerasformers/qwen2-1.5b` es una conversión íntegra a Keras 3 del modelo `Qwen/Qwen2-1.5B` de Alibaba, realizada por el proyecto KerasFormers. Su objetivo es permitir ejecutar la arquitectura Qwen2 en el ecosistema Keras 3 sin depender de implementaciones nativas de PyTorch o JAX, manteniendo una única base de código que funciona indistintamente sobre TensorFlow, Torch y JAX. Se trata de un checkpoint **base** (preentrenado, sin fine-tuning instructivo), pensado para tareas de completado de texto o como punto de partida para fine-tuning.

La relevancia de este modelo radica en que acerca los modelos de lenguaje de última generación a usuarios de Keras, que tradicionalmente han tenido que recurrir a otras librerías. Al ser una conversión directa del modelo original, conserva las características arquitectónicas de Qwen2: transformer decoder-only con grouped-query attention (GQA), MLPs SwiGLU, RMSNorm y posiciones rotatorias. El tamaño es de 1.500 millones de parámetros, aunque la longitud de contexto no se especifica en la documentación de la conversión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con grouped-query attention, SwiGLU, RMSNorm y rotary embeddings |
| Parametros totales | 1.5 mil millones (según denominación del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 e int8 (opciones de carga documentadas) |
| Idiomas soportados | Inglés (según etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Formato Keras 3 (pesos propios); se pueden cargar safetensors originales mediante prefijo `hf:` |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del modelo Qwen2-1.5B original: un transformer decoder-only con grouped-query attention (GQA) que incluye sesgos en q/k/v, MLPs con activación SwiGLU, normalización RMSNorm y embeddings rotatorios. No se trata de un modelo MoE, sino denso. La conversión a Keras 3 mantiene la misma topología, pero reimplementa las capas usando la API funcional de Keras 3, lo que permite cambiar de backend sin modificar el código.

En cuanto al entrenamiento, la model card no proporciona detalles específicos sobre el proceso de preentrenamiento (número de tokens, composición del dataset, técnicas de alineación). Se indica únicamente que es un checkpoint base preentrenado por el equipo de Qwen en Alibaba, y que esta conversión no añade ningún paso de fine-tuning adicional. Para información más detallada sobre el entrenamiento original, se remite al paper técnico de Qwen2 (arXiv:2407.10671).

## Capacidades

- Generación de texto por completado (autoregresiva), dado que es un modelo base.
- Fine-tuning para tareas específicas de generación de texto, ya que al ser base no está alineado con instrucciones.
- Ejecución multi-backend: la misma implementación funciona en TensorFlow, PyTorch y JAX, seleccionable mediante la variable de entorno `KERAS_BACKEND`.
- Carga de pesos en diferentes precisiones: bfloat16 e int8, para adaptarse a distintos recursos de hardware.
- Compatibilidad con safetensors originales de HuggingFace mediante el prefijo `hf:` en la carga de pesos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multimodal (visión, audio) en esta conversión.

## Casos de uso

- Fine-tuning para generación de texto especializada: al ser un modelo base, se puede ajustar con datasets propios para tareas como redacción de informes, generación de documentación técnica o creación de contenido en inglés, aprovechando la flexibilidad de Keras para el entrenamiento.
- Prototipado rápido en Keras: los desarrolladores que trabajan con Keras 3 pueden experimentar con modelos de 1.5B sin salir de su ecosistema habitual, usando el mismo API de Keras para cargar, generar y evaluar.
- Investigación en eficiencia de modelos con JAX: gracias al soporte nativo de JAX como backend, se pueden estudiar técnicas de compilación, paralelización o cuantización usando el mismo código.
- Integración en pipelines de TensorFlow: para equipos que ya tienen infraestructura TensorFlow, este modelo permite incorporar generación de texto sin necesidad de instalar PyTorch o usar servicios externos.
- Conversión y comparación de frameworks: sirve como referencia para evaluar diferencias de rendimiento entre implementaciones de Keras 3 y las originales en PyTorch, útil para decidir migraciones.
- Aprendizaje y docencia: al ser un modelo compacto (1.5B) y de código abierto, es adecuado para cursos o talleres sobre arquitecturas transformer, atención por grupos y fine-tuning, donde se puede inspeccionar el código Keras directamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda consultar el paper de Qwen2 para datos de rendimiento del modelo original, pero esta conversión en particular no aporta números propios.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación de la conversión.
- Estimación orientativa basada en el tamaño del modelo (1.5B parámetros):
  - En FP32: ~6 GB de VRAM.
  - En FP16/BF16: ~3 GB de VRAM.
  - En int8: ~1.5 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16 (por ejemplo, NVIDIA GTX 1660 Super, RTX 3050, RTX 4060). Para fine-tuning, se recomienda al menos 8 GB (RTX 3070/4070 o superior).
- Al ser un modelo pequeño, cabe en GPUs de consumo convencionales y también en CPU con suficiente RAM (aunque con mayor latencia).
- Opciones de despliegue: al ser una implementación Keras 3, se puede usar directamente en entornos Python con Keras. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI en la documentación, por lo que el despliegue en producción requeriría adaptaciones adicionales o usar el modelo original en safetensors.
- Latencia y throughput: no se han publicado mediciones específicas para esta conversión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Framework | Notas |
|---|---|---|---|---|---|
| `kerasformers/qwen2-1.5b` | 1.5B | No disponible | Apache 2.0 | Keras 3 (multi-backend) | Conversión de Qwen2-1.5B, base |
| `Qwen/Qwen2-1.5B` | 1.5B | 32 768 tokens (según paper) | Apache 2.0 | PyTorch / Transformers | Modelo original, base |
| `kerasformers/qwen2-0.5b` | 0.5B | No disponible | Apache 2.0 | Keras 3 | Versión más pequeña de la misma colección |
| `kerasformers/qwen2-7b` | 7B | No disponible | Apache 2.0 | Keras 3 | Versión más grande de la misma colección |

La principal diferencia con el modelo original es el framework: esta conversión usa Keras 3 y no requiere PyTorch, pero puede presentar pequeñas diferencias numéricas debidas a la reimplementación. Frente a otras versiones de kerasformers, la elección depende del equilibrio entre tamaño y recursos.

## Limitaciones y advertencias

- Es un modelo **base**, no está alineado con instrucciones ni chat, por lo que no es adecuado para uso directo en asistentes conversacionales sin fine-tuning previo.
- La conversión no es oficial del equipo de Qwen; está mantenida por la comunidad de KerasFormers, lo que implica un soporte limitado y posibles bugs no detectados.
- Solo soporta inglés como idioma de entrada/salida, según la etiqueta de idioma.
- La longitud de contexto no está documentada en esta conversión, por lo que se desconoce si coincide con los 32 768 tokens del modelo original.
- Al ser un modelo base, puede generar texto con sesgos presentes en los datos de preentrenamiento, y no tiene mecanismos de seguridad adicionales (como moderación de contenido).
- Riesgo de alucinaciones en generación libre, especialmente en tareas de hechos o razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo original cumple con los términos de Alibaba (aunque también es Apache 2.0).
- Para producción, se recomienda validar la conversión frente al modelo original en las tareas objetivo, dado que no hay benchmarks publicados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/kerasformers/qwen2-1.5b)
- [Paper técnico de Qwen2 (arXiv:2407.10671)](https://arxiv.org/abs/2407.10671)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de Qwen2 en KerasFormers](https://imvision12.github.io/KerasFormers/qwen2/)
- [Colección de modelos Qwen2 en KerasFormers](https://huggingface.co/collections/kerasformers/qwen2-6a69d274d16370be5d0221c8)
