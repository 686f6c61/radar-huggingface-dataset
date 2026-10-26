# jaydeepb/llama-3.2-1b-fineweb-run2

## Resumen

`jaydeepb/llama-3.2-1b-fineweb-run2` es un artefacto de investigación publicado en HuggingFace por el usuario jaydeepb: un ajuste fino de `meta-llama/Llama-3.2-1B` sobre una muestra de 1 millón de secuencias del corpus web **FineWeb**, durante una única época. No es un modelo de propósito general ni un asistente instruido: es la "Run 2" (run de evaluación sobre datos retenidos) del trabajo *Predicting Memorization Before Fine-Tuning Language Models*, y su función es servir como objeto de estudio para clasificadores que predicen, a partir de características del modelo base previo al ajuste, qué secuencias acabará memorizando el modelo tras el fine-tuning.

La relevancia del modelo es metodológica, no de producto. Al estar ajustado sobre datos web reales, puede reproducir fragmentos de su conjunto de entrenamiento de forma literal, lo que lo convierte en un banco de pruebas controlado para investigar memorización verbatim, extracción de datos, filtraciones de información personal y contaminación de benchmarks. El repositorio ocupa 2,5 GB y contiene 1.235.814.400 parámetros en formato safetensors, coherentes con la arquitectura Llama 3.2 de 1B.

Arquitectónicamente hereda el transformer decoder-only de Llama 3.2 1B (16 capas, atención con GQA, RoPE, SwiGLU, RMSNorm). No se ha publicado ninguna evaluación de capacidades, benchmarks ni datos de alineación para este checkpoint; la model card se limita a describir el propósito del experimento y a advertir del riesgo de reproducción de datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2); detalles de capas heredados del modelo base, no verificados en el repositorio: 16 capas, dimensión oculta 2048, 32 cabezas de atención con 8 cabezas KV (GQA), FFN SwiGLU, RMSNorm, RoPE |
| Parámetros totales | 1.235.814.400 (dato real de safetensors) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens según el modelo base `meta-llama/Llama-3.2-1B`; no especificado en la model card del artefacto |
| Tipos de cuantización | no se distribuyen variantes cuantizadas; los pesos se publican en safetensors (precisión original del checkpoint, presumiblemente BF16). Conversión a GGUF, AWQ o GPTQ posible con herramientas estándar |
| Idiomas soportados | no disponible en la model card; el modelo base declara oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | `llama3.2` (Llama 3.2 Community License) |
| Formato de pesos | safetensors (repositorio de 2,5 GB), cargable con `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `meta-llama/Llama-3.2-1B`: un transformer decoder-only denso con normalización RMSNorm pre-atención, activaciones SwiGLU en la FFN, embeddings de rotación posicional (RoPE) y atención con query grouping (GQA) para reducir el coste de la caché KV. El vocabulario es de 128.256 tokens. No hay innovaciones arquitectónicas propias de este checkpoint: el aporte del trabajo es el protocolo experimental, no la topología.

El entrenamiento consiste en un ajuste fino supervisado de una época sobre una muestra de 1 millón de secuencias de FineWeb. No se documentan en la model card el número total de tokens procesados, la composición del subconjunto de FineWeb, la longitud de secuencia empleada, la tasa de aprendizaje ni si se aplicó algún tipo de alineación (RLHF, DPO o similares); se trata de un fine-tuning de continuación sobre texto crudo, sin etapa de instrucciones. El resultado es un modelo que, además de modelar lenguaje, memoriza de forma verbatim una fracción de ese millón de secuencias, y ese es precisamente el fenómeno que los clasificadores del paper predicen a partir de características del modelo base.

## Capacidades

- Generación de texto autoregresiva de continuación (modelado de lenguaje), sin formato de instrucciones ni plantilla de chat.
- Reproducción verbatim de porciones del corpus de ajuste (FineWeb): la model card lo advierte explícitamente.
- Capacidad multilingüe heredada del modelo base, no evaluada ni garantizada tras el ajuste fino.
- Razonamiento, código y matemáticas: no documentados ni evaluados para este checkpoint; no se debe asumir el nivel del Llama 3.2 1B Instruct.
- Tool calling / function calling: no soportado de forma nativa (no hay entrenamiento de instrucciones ni plantillas de herramientas).
- Comportamiento agéntico o razonamiento multi-paso: no soportado.
- Capacidades especiales: ninguna modalidad adicional (sin visión ni audio); su valor específico es servir como objeto de medida de memorización.

## Casos de uso

- Investigación sobre memorización verbatim: reproducir el protocolo del paper y medir qué fracción del corpus de fine-tuning se recupera literalmente del modelo, usando prompts de prefijo extraídos del propio FineWeb.
- Validación de clasificadores predictivos de memorización: el checkpoint actúa como etiqueta de referencia (¿memoriza o no esta secuencia?) para entrenar y evaluar los clasificadores que trabajan solo con características del modelo base.
- Auditoría de privacidad y extracción de datos: sirve para ensayar ataques de extracción (prompting por prefijo, muestreo repetido) y cuantificar cuánta información potencialmente sensible o identificable puede exfiltrarse de un modelo ajustado sobre web.
- Estudio de contaminación de benchmarks: comparar secuencias de FineWeb con conjuntos de evaluación para detectar solapamiento y estimar si un modelo ajustado sobre web podría haber visto ejemplos de test.
- Línea base en experimentos de fine-tuning: al ser un ajuste controlado de una sola época sobre un corpus fijo, permite aislar el efecto del volumen y la composición de datos frente a otros checkpoints del mismo estudio.
- Investigación sobre olvido y desaprendizaje (machine unlearning): punto de partida para aplicar técnicas de eliminación de datos y comprobar si la memorización verbatim desaparece sin degradar el modelado de lenguaje.
- Docencia y reproducibilidad: ejemplo reproducible de cómo un fine-tuning aparentemente inocuo sobre datos públicos introduce riesgo de filtración, útil en cursos de seguridad y privacidad en ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de memorización cuantificadas (tasa de extracción, exposición, etc.); solo remite al paper *Predicting Memorization Before Fine-Tuning Language Models* como contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16, los pesos ocupan unos 2,5 GB, por lo que la inferencia cabe holgadamente en 4-6 GB de VRAM contando caché KV y overhead del runtime.
- En cuantización de 8 bits: aproximadamente 1,3 GB de pesos; en 4 bits, en torno a 0,7-0,9 GB. Requiere conversión previa, ya que el repositorio solo publica safetensors.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o superiores ofrecen margen sobrado para lotes grandes y contextos largos. Para evaluación a gran escala (millones de secuencias) son preferibles A100/H100 por throughput agregado, no por requisito de memoria.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con 6 GB o más de VRAM; también es viable en CPU con llama.cpp para pruebas puntuales.
- Opciones de despliegue: `transformers` (vía indicada por `library_name`), Text Generation Inference (el repo lleva los tags `text-generation-inference` y `endpoints_compatible`, por lo que es desplegable en Inference Endpoints), vLLM para serving con batching continuo, y llama.cpp/Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no se han publicado medidas para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jaydeepb/llama-3.2-1b-fineweb-run2` | 1,23 B | 128k heredados del base (no confirmado en la card) | Artefacto de investigación sobre memorización | Llama 3.2 Community | HuggingFace, safetensors |
| `meta-llama/Llama-3.2-1B` | 1,23 B | 128k | Modelo base de propósito general | Llama 3.2 Community | HuggingFace, gated |
| `meta-llama/Llama-3.2-1B-Instruct` | 1,23 B | 128k | Asistente instruido y alineado | Llama 3.2 Community | HuggingFace, gated |
| `HuggingFaceTB/SmolLM2-1.7B` | 1,7 B | 8k (la variante base; las instruct amplían según configuración) | Modelo pequeño de propósito general | Apache 2.0 | HuggingFace |
| `Qwen/Qwen2.5-1.5B` | 1,5 B | 32k | Modelo pequeño multilingüe de propósito general | Apache 2.0 | HuggingFace |

La diferencia clave frente a las alternativas no es de rendimiento sino de naturaleza: los otros checkpoints son modelos de propósito general con benchmarks publicados, mientras que este es un artefacto de medición sin evaluación de capacidades y con memorización deliberada de datos de entrenamiento. Para cualquier tarea de producto, el modelo base o su variante Instruct son la elección correcta.

## Limitaciones y advertencias

- Riesgo de memorización verbatim: el modelo puede reproducir fragmentos literales de FineWeb, un corpus web que incluye datos personales, contenido con derechos de autor y material sensible. No debe exponerse a usuarios finales sin filtros de salida.
- No está alineado: no ha pasado por RLHF ni DPO, no sigue instrucciones de forma fiable y no tiene plantilla de chat; puede generar contenido tóxico, sesgado o factualmente incorrecto sin salvaguardas.
- Alucinación: como modelo de continuación entrenado sobre texto web, no tiene mecanismo de verificación factual; la tasa de alucinación no está medida.
- Sesgos: hereda los sesgos del modelo base y añade los del subconjunto de FineWeb empleado; no se ha realizado ninguna evaluación de sesgo sobre este checkpoint.
- Idiomas: no se documenta qué idiomas conserva tras el ajuste fino; el dominio del corpus (web predominantemente en inglés) puede haber desplazado la distribución lingüística respecto al modelo base.
- Licencia: se rige por la Llama 3.2 Community License, que impone restricciones de uso (política de uso aceptable), obligaciones de atribución y la cláusula de 700 millones de usuarios activos mensuales para licencias adicionales. El uso comercial no está prohibido, pero requiere revisión legal del cumplimiento.
- Reproducibilidad: no se documentan hiperparámetros, tamaño efectivo en tokens ni composición exacta del subconjunto de FineWeb, lo que limita la reproducción exacta del experimento a partir de este repositorio.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros sobre su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/llama-3.2-1b-fineweb-run2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Paper de referencia (citado en la model card, sin enlace proporcionado): *Predicting Memorization Before Fine-Tuning Language Models* — no disponible
- Corpus FineWeb: no disponible en la información proporcionada
- Repositorio de código del estudio: no disponible en la información proporcionada
- Licencia Llama 3.2: https://llama.meta.com/llama3_2/license/ (referencia de la licencia `llama3.2`; no enlazada explícitamente en la model card)
