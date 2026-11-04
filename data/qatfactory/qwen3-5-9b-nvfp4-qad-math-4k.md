# qatfactory/Qwen3.5-9B-NVFP4-QAD-Math-4K

## Resumen

Qwen3.5-9B-NVFP4-QAD-Math-4K es una versión cuantizada del modelo base Qwen/Qwen3.5-9B, publicada por el usuario qatfactory en HuggingFace. Se trata de un checkpoint sometido a quantisation-aware training (QAT) y posteriormente cuantizado en formato NVFP4 (punto flotante de 4 bits de NVIDIA), empaquetado mediante la librería compressed-tensors y orientado a su despliegue en vLLM. El modelo conserva los 9.409.813.744 parámetros del modelo original, pero reduce el peso del repositorio a 8,9 GB gracias a la cuantización de 4 bits.

El sufijo "Math-4K" sugiere que el proceso de QAT se ha calibrado o afinado sobre un conjunto de datos matemáticos con ventanas de contexto de 4K tokens, aunque la información disponible no detalla la composición exacta de ese dataset ni el procedimiento completo de entrenamiento. El modelo se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace.

La relevancia de esta ficha radica en que combina dos tendencias actuales: por un lado, la familia Qwen3.5 de Alibaba, y por otro, la cuantización NVFP4, un formato de 4 bits con escala por bloque pensado para aprovechar los tensor cores de las GPU Blackwell de NVIDIA. Esto permite reducir el coste de inferencia manteniendo una precisión cercana a la del modelo en BF16, si bien la información pública disponible sobre este checkpoint concreto es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (el sufijo "4K" hace referencia al calibrado QAT, no necesariamente al contexto maximo) |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA), empaquetado con compressed-tensors; tag "8-bit" presente en HuggingFace |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-9B, un transformer decoder-only de la familia Qwen3.5 desarrollada por Alibaba. La información proporcionada no detalla la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención, uso de GQA, etc.), por lo que estos datos deben consultarse en la ficha del modelo base.

Sobre el proceso de cuantización: el checkpoint ha pasado por quantisation-aware training (QAT), es decir, se ha entrenado el modelo simulando la cuantización NVFP4 durante el ajuste fino para mitigar la pérdida de precisión. El sufijo "Math-4K" indica que el calibrado se ha orientado a tareas matemáticas con secuencias de 4K tokens. El resultado se empaqueta con compressed-tensors, el formato estándar de vLLM para pesos cuantizados, lo que permite cargar el modelo directamente en ese motor de inferencia sin conversión adicional. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de QAT ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-9B.
- Razonamiento matemático reforzado mediante el proceso de QAT calibrado sobre datos matemáticos (sufijo "Math").
- Inferencia eficiente en vLLM gracias al formato compressed-tensors y NVFP4.
- Soporte de tool calling y function calling: no confirmado en la información disponible para este checkpoint, aunque es una capacidad habitual en la familia Qwen3.5.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking / razonamiento extendido: no confirmado para este checkpoint.
- Visión o audio: no disponible.

## Casos de uso

- Inferencia matemática de alto rendimiento: el calibrado QAT sobre datos matemáticos con ventanas de 4K tokens lo hace adecuado para resolver problemas algebraicos, cálculo simbólico o verificación de demostraciones en entornos donde el coste por token es crítico.
- Despliegue en clústeres con GPU Blackwell: NVFP4 está diseñado para aprovechar los tensor cores FP4 de las GPU NVIDIA de nueva generación, reduciendo el coste de serving frente a BF16.
- Servicio de chat en producción con vLLM: al estar empaquetado con compressed-tensors, se puede cargar directamente en vLLM con soporte de batching continuo y PagedAttention.
- Evaluación de pipelines de cuantización: útil como referencia para comparar la degradación de precisión de NVFP4-QAT frente al modelo base en BF16 en tareas de razonamiento.
- Generación de código asistida: si el modelo base conserva sus capacidades de programación, puede integrarse en asistentes de IDE o pipelines de CI/CD, aunque este checkpoint está optimizado para matemáticas.
- Investigación en cuantización de baja precisión: sirve como caso de estudio de QAT aplicado a un modelo de 9B con licencia Apache 2.0 y acceso gated.
- Fine-tuning posterior sobre dominios específicos: al ser Apache 2.0, permite ajuste adicional, aunque el formato NVFP4 complica el entrenamiento directo y requeriría de-cuantización o QLoRA adaptado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 8,9 GB en NVFP4, por lo que se necesita al menos ~10 GB de VRAM para cargar los pesos, más overhead de KV cache y activaciones.
- GPU recomendadas: NVIDIA Blackwell (B100, B200, RTX 50xx) para aprovechar los tensor cores FP4 de forma nativa; en arquitecturas anteriores (Hopper, Ada) el soporte NVFP4 puede requerir emulación y perder parte de la ventaja.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) y RTX 5090 (32 GB) con margen para contexto moderado; en GPUs de 16 GB el margen es ajustado.
- Opciones de despliegue: vLLM (soporte nativo vía compressed-tensors); llama.cpp y Ollama no soportan NVFP4 de forma estándar, por lo que requerirían conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Acceso |
|---|---|---|---|---|---|
| Qwen3.5-9B-NVFP4-QAD-Math-4K | 9,4B | No disponible | NVFP4 (4 bits) | Apache 2.0 | Gated |
| Qwen/Qwen3.5-9B (base) | 9,4B | No disponible | BF16 | Apache 2.0 (segun modelo base) | Abierto |
| Versiones GGUF de Qwen3.5-9B | 9,4B | No disponible | Q4_K_M, Q5_K_M, etc. | Apache 2.0 | Abierto |

La comparativa se limita al modelo base y a sus variantes GGUF, ya que no se dispone de información sobre otros checkpoints NVFP4 comparables de la misma familia. La diferencia principal frente al base es el formato de pesos (NVFP4 frente a BF16) y el proceso de QAT orientado a matemáticas; frente a GGUF, la ventaja es el soporte nativo en vLLM y el aprovechamiento de tensor cores FP4 en Blackwell.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar el modelo.
- Información pública muy escasa: sin benchmarks, sin detalle del dataset de QAT, sin idiomas declarados y sin pipeline definido; la evaluación rigurosa requiere pruebas propias.
- Riesgo de degradación por cuantización: aunque el QAT mitiga la pérdida, NVFP4 a 4 bits puede degradar tareas sensibles (razonamiento largo, código, matemáticas complejas) frente al modelo en BF16.
- Especialización matemática: el calibrado "Math-4K" puede haber sesgado el modelo hacia ese dominio, con posible pérdida relativa en otras tareas.
- Compatibilidad limitada: NVFP4 no es un formato universal; fuera de vLLM y GPU Blackwell el soporte es parcial o requiere conversión.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay datos específicos sobre tasas de alucinación en este checkpoint.
- Sesgos: no documentados en la información disponible; deben evaluarse según el modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y del acceso gated.
- Fecha de creación (2026-11-04) y cero descargas/likes: modelo muy reciente y sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/qatfactory/Qwen3.5-9B-NVFP4-QAD-Math-4K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
- Documentación NVFP4 de NVIDIA: https://developer.nvidia.com/blog/nvfp4-explained/
