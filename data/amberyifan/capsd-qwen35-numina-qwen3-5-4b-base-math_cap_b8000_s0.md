# AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_cap_b8000_s0

## Resumen

El modelo `AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_cap_b8000_s0` es un fine-tuning completo (full fine-tuning) del modelo base `Qwen/Qwen3.5-4B-Base`, realizado por el usuario AmberYifan. El nombre del modelo y el dataset de entrenamiento (`capsd_Qwen3.5-4B-Base-n80000-numina__mix_math_cap_b8000_s0`) sugieren que el objetivo es mejorar las capacidades de razonamiento matemático, posiblemente con entrada de imágenes (el pipeline declarado es `image-text-to-text`). Sin embargo, la model card no proporciona una descripción funcional detallada, ni datos de entrenamiento, ni benchmarks publicados. El modelo tiene 4.539.265.536 parámetros y se distribuye en formato safetensors. Su relevancia actual es limitada por la falta de documentación y la ausencia de resultados de evaluación; se trata de un experimento de fine-tuning cuya utilidad práctica no está verificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-4B-Base) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no se especifican términos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo del modelo base `Qwen/Qwen3.5-4B-Base`, que pertenece a la familia Qwen3.5. No se dispone de información pública sobre los detalles arquitectónicos internos del base (número de capas, atención, etc.) más allá de que es un modelo de 4B parámetros. El entrenamiento se realizó con la librería Transformers (versión 5.8.0) y PyTorch 2.13.0, usando el framework de fine-tuning Llama Factory. Los hiperparámetros declarados incluyen learning rate de 1e-05, batch total de 64 (con acumulación de gradientes), optimizador AdamW, scheduler cosine con warmup del 3%, y una sola época. El dataset de entrenamiento, `capsd_Qwen3.5-4B-Base-n80000-numina__mix_math_cap_b8000_s0`, no está documentado públicamente; el prefijo "math_cap" sugiere que combina problemas matemáticos con captions (posiblemente descripciones de imágenes). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto y razonamiento matemático: el nombre del modelo y el dataset apuntan a un fine-tuning orientado a problemas matemáticos, aunque no hay evidencia empírica publicada.
- Procesamiento de imágenes y texto: el pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo podría aceptar imágenes como entrada adicional, pero no se especifica cómo se integran.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (depende del modelo base, pero sin confirmación).
- Thinking mode, visión, audio: no se mencionan.

## Casos de uso

- Investigación académica en fine-tuning de modelos de lenguaje: el modelo sirve como ejemplo de un experimento de fine-tuning completo sobre Qwen3.5-4B-Base con un dataset de matemáticas y captions, útil para estudiar metodologías de entrenamiento.
- Evaluación de técnicas de adaptación a dominios específicos: los hiperparámetros documentados permiten replicar el proceso de entrenamiento para comparar estrategias.
- Prototipado de sistemas de razonamiento matemático asistido por imágenes: si el modelo efectivamente procesa imágenes, podría usarse en entornos educativos para resolver problemas que combinan figuras geométricas y texto.
- Generación de explicaciones paso a paso en matemáticas: aunque no hay benchmarks, el fine-tuning sugiere un intento de mejorar la claridad en soluciones.
- Análisis de sesgos en modelos fine-tuneados: al ser un modelo experimental, puede servir para estudiar cómo el fine-tuning afecta al comportamiento del base.
- Desarrollo de pipelines con Llama Factory: el modelo es un artefacto de entrenamiento que documenta el uso de esta herramienta con un modelo de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `results` del model-index está vacío, por lo que no hay datos de MMLU, HumanEval, GSM8K ni otras métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~4.5B parámetros en precisión FP16, se requieren aproximadamente 9 GB de VRAM (sin cuantización). Con cuantización INT8 (~4.5 GB) o INT4 (~2.5 GB) se reduce el requisito, pero no se han publicado archivos cuantizados.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070) para FP16. Para cuantización INT4, una GPU de 6-8 GB podría bastar.
- Compatibilidad con GPU de consumo: sí, es factible en GPUs de gama media con cuantización, aunque sin cuantización puede requerir más memoria.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con Transformers, puede usarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión).
- Latencia y throughput: no se dispone de datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_cap_b8000_s0 | 4.5B | no disponible | sin benchmarks | other | HuggingFace |
| Qwen/Qwen3.5-4B-Base | 4.5B | no disponible | no publicado | Apache 2.0 (presumiblemente) | HuggingFace |
| Qwen2.5-3B-Instruct | 3B | 32K | MMLU ~70 (estimado) | Apache 2.0 | HuggingFace |

La comparativa es limitada porque no hay datos de rendimiento del modelo evaluado. El modelo base Qwen3.5-4B-Base es la referencia natural, pero tampoco tiene benchmarks publicados en esta información. Otros modelos de tamaño similar, como Qwen2.5-3B-Instruct, tienen documentación más completa, pero no son directamente comparables sin métricas.

## Limitaciones y advertencias

- Falta de documentación: la model card no describe el propósito, los datos de entrenamiento ni las capacidades reales del modelo.
- Sin benchmarks: no hay evidencia de que el fine-tuning haya mejorado el rendimiento en matemáticas o en otras tareas.
- Licencia "other": los términos de uso no están especificados; no se puede garantizar que sea apto para uso comercial.
- Riesgo de alucinación y errores: al ser un modelo experimental sin evaluación, puede producir respuestas incorrectas, especialmente en matemáticas.
- Sesgos potenciales: derivados del dataset de entrenamiento no documentado y del modelo base.
- Limitaciones de contexto y idioma: desconocidas.
- Inadecuado para producción: sin validación, no se recomienda su uso en aplicaciones críticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_cap_b8000_s0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Framework de entrenamiento (Llama Factory): https://github.com/hiyouga/LLaMA-Factory (referencia indirecta por las tags)
