# erikita22/mi-ia-personal

## Resumen

`erikita22/mi-ia-personal` es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct, publicado por el usuario erikita22 en Hugging Face. Se trata de un modelo de generación de texto de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) construido sobre la arquitectura transformer densa de la familia Qwen2. El entrenamiento se realizó con la librería Unsloth, que optimiza el proceso de ajuste fino, combinada con la librería TRL de Hugging Face.

El modelo parte de la versión cuantizada en 4 bits del Qwen2.5-3B-Instruct (`unsloth/Qwen2.5-3B-Instruct-bnb-4bit`) y se distribuye en formato safetensors con licencia Apache 2.0. La model card es extremadamente escasa: no documenta el conjunto de datos de entrenamiento, el número de tokens utilizados, el método de alineación ni los resultados de evaluación. El único idioma declarado es el inglés.

Su relevancia práctica es limitada: se trata de un experimento personal de ajuste fino sin benchmarks publicados, con cero descargas y cero likes en el momento de la consulta. Resulta útil como ejemplo de flujo de trabajo con Unsloth sobre un modelo base conocido, pero no como candidato para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, pero el ajuste no lo documenta) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba en 4 bits, pero los pesos publicados son safetensors sin especificar precisión) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo decoder-only basado en Qwen2, la arquitectura de la familia Qwen2.5 de Alibaba. Con 3,09 mil millones de parámetros, emplea atención con RoPE (rotary positional embeddings), normalización RMSNorm y activación SwiGLU, siguiendo el diseño estándar de la familia. Al no ser un modelo MoE, todos los parámetros se activan en cada paso de inferencia.

El ajuste fino se realizó con Unsloth y la librería TRL, partiendo de la versión cuantizada en 4 bits del Qwen2.5-3B-Instruct. No se documenta el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos ni si se aplicaron técnicas de RLHF o DPO. Tampoco se indica si el ajuste fue completo o mediante LoRA/QLoRA, aunque el uso de Unsloth sobre un modelo en 4 bits sugiere un enfoque QLoRA. No se declara ninguna innovación técnica adicional más allá del propio pipeline de Unsloth.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento básico y respuesta a instrucciones, sujeto a la calidad del ajuste fino no documentado.
- Generación de código y matemáticas a nivel de un modelo de 3 B, aunque sin evaluación publicada tras el ajuste.
- Soporte de tool calling y function calling: no confirmado en la model card; el modelo base lo soporta, pero el ajuste puede haber degradado esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card, aunque el modelo base Qwen2.5 es multilingüe.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede emplearse para validar pipelines de chat con transformers y text-generation-inference antes de pasar a un modelo mayor, dado su tamaño reducido y su licencia permisiva.
- Experimentación con ajuste fino: sirve como referencia para reproducir el flujo de trabajo de Unsloth sobre Qwen2.5-3B, comparando el comportamiento del modelo ajustado frente al base.
- Generación de texto en entornos con recursos limitados: con 3,09 B de parámetros, puede ejecutarse en GPU de consumo para tareas de generación de borradores o resúmenes en inglés.
- Docencia y formación: útil como ejemplo práctico de fine-tuning con TRL y Unsloth en cursos o talleres sobre IA open source.
- Pruebas de integración con TGI: al incluir la etiqueta `text-generation-inference`, puede desplegarse con ese servidor para evaluar latencia y throughput en un entorno controlado.
- Base para nuevos ajustes: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para otros fine-tunes experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB en precisión de 16 bits (coincide con el tamaño del repositorio); alrededor de 2 GB en cuantización de 4 bits.
- GPU recomendadas: RTX 3090, RTX 4090, A10G, L4 o superiores para FP16; cualquier GPU con 4 GB o más para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 y superiores en FP16; en GPUs de 4-8 GB mediante cuantización.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (previa conversión a GGUF).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| erikita22/mi-ia-personal | 3,09 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | No |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | Apache 2.0 | Hugging Face (ampliamente usado) | Sí |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face | Sí |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 tokens | MIT | Hugging Face | Sí |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no es posible evaluar sesgos introducidos por el ajuste fino.
- Riesgo de alucinación inherente a un modelo de 3 B, agravado por la falta de evaluación tras el ajuste.
- Idiomas: la model card solo declara inglés; el rendimiento en castellano no está garantizado aunque el modelo base sea multilingüe.
- Longitud de contexto no documentada: no se puede asumir que el ajuste conserve los 32.768 tokens del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- El ajuste puede haber degradado capacidades del modelo base (tool calling, multilingüismo, razonamiento) sin que exista documentación al respecto.
- No apto para producción sin una evaluación propia exhaustiva.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/erikita22/mi-ia-personal)
- [Modelo base: unsloth/Qwen2.5-3B-Instruct-bnb-4bit](https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Librería TRL de Hugging Face](https://github.com/huggingface/trl)
