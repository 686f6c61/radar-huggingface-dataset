# euclidstellar/tinystories-1bit-llm

## Resumen

El modelo `euclidstellar/tinystories-1bit-llm` es un modelo de lenguaje de 11,16 millones de parámetros basado en la arquitectura BitNet b1.58, que almacena todos sus pesos en formato ternario (valores -1, 0, +1) a una media de 1,6 bits por peso. Ha sido desarrollado por el usuario euclidstellar y entrenado desde cero sobre el dataset TinyStories, una colección de cuentos infantiles en inglés, utilizando una GPU T4 gratuita de Kaggle. El resultado es un archivo de pesos de solo 2,31 MB, 9,65 veces más pequeño que el equivalente en fp16.

La relevancia de este modelo radica en que demuestra empíricamente que el entrenamiento consciente de cuantización (QAT) aplicado a arquitecturas ternarias permite recuperar gran parte de la calidad perdida frente a la cuantización post-entrenamiento (PTQ), y que a igual presupuesto de memoria un modelo ternario supera a un modelo fp16 del mismo tamaño en términos de perplejidad. Es un trabajo de investigación aplicada más que un producto listo para producción, pero aporta datos útiles para quienes exploran formatos de pesos extremadamente comprimidos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con pesos ternarios (BitNet b1.58) |
| Parametros totales | 11 159 360 (11 141 120 ternarios + 18 240 fp32 de normalización) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (1,58 bits/peso) para pesos y embeddings; fp32 para parámetros de normalización |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | `model_packed.bin` (formato propio de la librería bitllm) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BitNet b1.58, una variante de transformer donde las multiplicaciones matriciales usan pesos ternarios {-1, 0, +1} en lugar de valores de punto flotante. La capa de embedding está atada y también se entrena en ternario, algo que va más allá del diseño original de BitNet (que mantiene los embeddings en bf16). Los parámetros de normalización (LayerNorm) se mantienen en fp32 para estabilidad numérica.

El entrenamiento se realizó desde cero con un enfoque de cuantización consciente (QAT) usando un estimador de paso recto (STE) para propagar gradientes a través de la cuantización. El dataset es `euclidstellar/tinystories-bpe4096`, una versión tokenizada de TinyStories con un vocabulario BPE de 4096 tokens. El modelo se entrenó en una GPU T4 de Kaggle, sin pesos preentrenados ni ajuste fino posterior. La innovación principal es la cuantización ternaria del embedding, que reduce el tamaño del archivo a 2,31 MB con una pérdida de solo 0,1347 nats frente a la versión con embedding fp16, y que en lectura a ciegas resulta indistinguible de esta.

## Capacidades

- Generación de texto en inglés, especializado en cuentos infantiles cortos con estructura narrativa (inicio, desarrollo y final).
- Gramática básica correcta: concordancia, puntuación de diálogos y atribución de habla, como se muestra en los ejemplos de salida.
- Coherencia temática limitada: puede mantener un hilo argumental durante unas pocas frases, aunque con tendencia a la deriva referencial (por ejemplo, un conejo que vuela).
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- Capacidad multilingüe: solo inglés, sin soporte para otros idiomas.
- Capacidad especial: es un modelo de demostración para cuantización extrema, útil como banco de pruebas para técnicas de compresión de modelos.

## Casos de uso

- Investigación en cuantización de modelos: permite estudiar el impacto de QAT frente a PTQ en arquitecturas ternarias, con resultados reproducibles y un tamaño de archivo mínimo.
- Educación en eficiencia de modelos: sirve como ejemplo didáctico para explicar conceptos como pesos ternarios, STE y trade-offs entre precisión y memoria.
- Prototipado en entornos con recursos extremadamente limitados: al ocupar solo 2,31 MB, puede ejecutarse en dispositivos embebidos o microcontroladores para generar texto muy simple.
- Benchmark de compresión: su formato de pesos compacto lo convierte en un punto de referencia para comparar técnicas de almacenamiento de modelos (fp16, int8, ternario).
- Estudio de degradación por cuantización: los ejemplos de salida muestran claramente cómo se rompe el lenguaje al cuantizar sin entrenamiento consciente, lo que ayuda a diagnosticar fallos en pipelines de despliegue.
- Generación de contenido educativo para niños: aunque limitado, puede producir cuentos cortos en inglés con gramática aceptable, útil para aplicaciones de lectura infantil en entornos sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. La model card reporta pérdida y perplejidad sobre el conjunto de validación de TinyStories, comparando distintas variantes de cuantización con la misma arquitectura, datos e hiperparámetros:

| Modelo | Pérdida de validación | Perplejidad | Tamaño |
|---|---|---|---|
| Línea base uniforme (sin aprendizaje) | 8,3178 | 4096 | — |
| Línea base unigrama (solo conteo) | 6,0380 | 419 | — |
| PTQ ternario (cuantizado tras entrenar) | 5,0229 | 151,9 | — |
| fp16 con misma memoria (d=128, 2,1M params) | 2,3607 | 10,6 | 4,21 MB |
| **QAT ternario + embedding ternario (este modelo)** | **2,3107** | **10,1** | **2,31 MB** |
| QAT ternario, embedding fp16 | 2,1760 | 8,8 | 4,61 MB |
| Control fp32 | 2,0553 | 7,8 | 22,32 MB |

El QAT supera al PTQ en 2,85 nats (una mejora de 17x en perplejidad), y a igual presupuesto de memoria el modelo ternario gana entre 0,17 y 0,23 nats frente a fp16 en un rango de presupuestos que abarca un factor 2.

## Requisitos de hardware

- Inferencia: los pesos ocupan 2,31 MB, por lo que caben en cualquier CPU moderna, incluso en Raspberry Pi o microcontroladores con al menos 4 MB de RAM.
- GPU: no se requiere GPU para inferencia; el modelo puede ejecutarse en CPU sin problemas.
- Entrenamiento: se realizó en una GPU T4 de Kaggle (16 GB VRAM), pero dado el tamaño del modelo, podría reproducirse en hardware aún más modesto o incluso en CPU.
- Opciones de despliegue: la librería `bitllm` es la única vía documentada para cargar el archivo `model_packed.bin`. No hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI para este formato; sería necesaria una conversión manual a otros formatos si se desea usar esos motores.
- Latencia y throughput: no se han publicado mediciones específicas, pero al ser un modelo de 11M parámetros, la generación es prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos TinyStories (como TinyStories-1M o TinyStories-3M) en la información proporcionada. La comparativa más relevante es interna, entre las variantes del mismo modelo con distinta estrategia de cuantización, que ya se muestra en la tabla de benchmarks. Frente a un modelo fp16 del mismo tamaño de parámetros, el ternario pierde 0,1207 nats, pero gana cuando se compara a igual presupuesto de memoria, porque 2,31 MB de ternario equivalen a 11,2M parámetros frente a solo 1,1M en fp16.

## Limitaciones y advertencias

- Modelo extremadamente pequeño (11M parámetros), diseñado únicamente para cuentos infantiles en inglés; no apto para tareas generales de lenguaje.
- Solo soporta inglés; no hay capacidades multilingües.
- Riesgo de alucinaciones y deriva referencial: los ejemplos muestran que puede inventar elementos incoherentes (un conejo que vuela) o perder el referente de los pronombres.
- El formato de pesos `model_packed.bin` es específico de la librería `bitllm`; no es compatible directamente con ecosistemas estándar como HuggingFace Transformers, lo que limita su portabilidad.
- La licencia MIT permite uso comercial, pero el modelo no tiene garantías de calidad ni soporte; es un artefacto de investigación.
- No se han evaluado sesgos ni comportamientos dañinos; al ser un modelo pequeño entrenado en cuentos infantiles, el riesgo es bajo, pero no se ha documentado una auditoría.
- La longitud de contexto no está especificada; se asume que es corta (típica de modelos pequeños), pero no se ha confirmado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/euclidstellar/tinystories-1bit-llm
- Dataset de entrenamiento: https://huggingface.co/datasets/euclidstellar/tinystories-bpe4096
- Paper relacionado (BitNet b1.58): https://arxiv.org/abs/2504.12285
- Dataset TinyStories original: https://huggingface.co/datasets/roneneldan/TinyStories
