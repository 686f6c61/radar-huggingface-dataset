# qda-lab/QDA-Nemotron-3-Nano-30B-A3B-W4A16

## Resumen

QDA-Nemotron-3-Nano-30B-A3B-W4A16 es una versión cuantizada del modelo NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, publicado por el usuario qda-lab en Hugging Face. Se trata de un checkpoint derivado que aplica cuantización de solo pesos (weight-only) en formato compressed-tensors sobre el modelo base de NVIDIA, reduciendo el peso de los parámetros a 4 y 8 bits mientras mantiene las activaciones en 16 bits. El resultado es un repositorio de 18,4 GB con 31.577.940.288 parámetros totales, pensado para facilitar el despliegue del modelo original en entornos con menos memoria.

El modelo subyacente pertenece a la familia Nemotron 3 de NVIDIA, con arquitectura Nemotron-H y un esquema de mezcla de expertos (MoE) que activa solo una fracción de los parámetros por token (la nomenclatura A3B sugiere aproximadamente 3 mil millones de parámetros activos). La contribución de qda-lab es exclusivamente la cuantización: no se documentan cambios en la arquitectura ni reentrenamiento.

Es relevante ahora porque reduce la huella de memoria de un modelo MoE de 30 mil millones de parámetros, permitiendo su ejecución en GPUs de gama alta de consumo o en nodos con VRAM limitada, a costa de una evaluación que aún está pendiente. El autor indica que se trata de una versión preliminar (pre-release) y que los resultados de evaluación se publicarán el 2026-11-20.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (transformer con mezcla de expertos, MoE) |
| Parametros totales | 31.577.940.288 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B, sin confirmar en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: pesos en int4 asimetrico en grupos de 64; pesos en int8 simetrico en grupos de 64; activaciones en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, de arquitectura Nemotron-H, que combina capas de transformer con mecanismos de mezcla de expertos (MoE). Con 31.577.940.288 parámetros totales y la designación A3B, se infiere un esquema de activación dispersa con aproximadamente 3 mil millones de parámetros activos por token, aunque este dato no está confirmado en la información proporcionada. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La modificación introducida por qda-lab es una cuantización de solo pesos: los pesos se almacenan en int4 asimétrico en grupos de 64 y en int8 simétrico en grupos de 64, mientras que las activaciones permanecen en 16 bits. Esta estrategia reduce el tamaño del checkpoint a 18,4 GB y mantiene la precisión de las activaciones, lo que suele traducirse en una degradación menor que la cuantización de activaciones. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal en este checkpoint.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (text-generation, conversational).
- Razonamiento y generación de código: capacidades heredadas del modelo base Nemotron 3, no verificadas en este checkpoint.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPUs de consumo: gracias a la cuantización W4A16 y un checkpoint de 18,4 GB, el modelo puede cargarse en tarjetas con 24 GB de VRAM (por ejemplo, RTX 4090) usando vLLM o compressed-tensors, algo inviable con el checkpoint BF16 original.
- Servicio de generación de texto en producción: al reducir el peso de los pesos, se disminuye el uso de memoria y se permite mayor concurrencia en un mismo nodo, adecuado para APIs de chat con contexto moderado.
- Prototipado e investigación: investigadores que necesiten experimentar con un MoE de 30B sin acceso a clústeres de múltiples A100 pueden usar esta versión cuantizada en una sola GPU.
- Evaluación comparativa de cuantización: sirve como referencia para medir la degradación de calidad frente al modelo BF16 en tareas de razonamiento y generación, una vez publicados los resultados de evaluación.
- Fine-tuning ligero o adaptación con LoRA: al mantener las activaciones en 16 bits, es posible aplicar técnicas de adaptación sobre los pesos cuantizados en entornos con VRAM limitada, aunque requiere verificar compatibilidad con compressed-tensors.
- Inferencia en el borde o en servidores con presupuesto de memoria ajustado: el formato compressed-tensors permite integrarse en pipelines existentes de Hugging Face Transformers sin conversión manual a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la evaluación está pendiente y que la versión completa con resultados se publicará el 2026-11-20.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 18,4 GB en disco; con overhead de activaciones y caché KV, se estiman al menos 20-24 GB de VRAM para contexto corto.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, H100 80 GB; el modelo no cabe en GPUs de 16 GB o menos.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 con 24 GB, siempre que el contexto sea moderado.
- Opciones de despliegue: vLLM, Hugging Face Transformers con compressed-tensors, TGI (previa verificación de soporte del formato); llama.cpp y Ollama requerirían conversión a GGUF, no incluida.
- Latencia y throughput: no disponibles; dependen del número de parámetros activos y del hardware, sin datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qda-lab/QDA-Nemotron-3-Nano-30B-A3B-W4A16 | 31,58B | no disponible | W4A16 (int4/int8) | nvidia-nemotron-open-model-license | Hugging Face, pre-release |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31,58B | no disponible | BF16 | nvidia-nemotron-open-model-license | Hugging Face |
| Alternativas de ~30B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para comparar; la única diferencia documentada frente al modelo base es la cuantización y el tamaño del checkpoint (18,4 GB frente al peso BF16, aproximadamente el doble).

## Limitaciones y advertencias

- Versión preliminar (pre-release): la evaluación está pendiente y los resultados no se han publicado; no se recomienda su uso en producción sin validación previa.
- Riesgo de degradación de calidad por cuantización: la cuantización W4A16 puede introducir pérdida de precisión en tareas sensibles, especialmente en razonamiento matemático y código, sin datos que lo cuantifiquen.
- Licencia: nvidia-nemotron-open-model-license, que impone condiciones específicas de uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas sin evaluación.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas en este checkpoint.
- Sesgos: no disponibles; no se ha publicado información sobre sesgos del modelo base ni del cuantizado.
- Longitud de contexto no disponible: limita la planificación de casos de uso con documentos largos.
- Compatibilidad: requiere la librería compressed-tensors; no es directamente utilizable en llama.cpp u Ollama sin conversión.

## Enlaces

- [qda-lab/QDA-Nemotron-3-Nano-30B-A3B-W4A16 en Hugging Face](https://huggingface.co/qda-lab/QDA-Nemotron-3-Nano-30B-A3B-W4A16)
- [Modelo base: nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16)
- [Licencia NVIDIA Nemotron Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/)
