# mr-andrey-isachenko/Tenet-Qwen3-8B-Abliterated-Unslop-v2-GGUF

## Resumen
Tenet-Qwen3-8B-Abliterated-Unslop-v2-GGUF es un conjunto de cuantizaciones GGUF para llama.cpp del modelo Tenet-8B-Qwen3-Unslop-v2, un ajuste fino del Qwen3-8B de Alibaba realizado por mr-andrey-isachenko. El objetivo declarado del ajuste es el "de-refusal" quirúrgico (eliminación de comportamientos de rechazo) y la reducción de respuestas vacías o genéricas ("unslop"), mediante una técnica propia denominada Lancet, aplicada sobre el modelo base Qwen3-8B.

El modelo conserva la arquitectura transformer de Qwen3-8B, con 8.190.735.360 parámetros totales (aproximadamente 8,2 mil millones) y licencia Apache 2.0. Se distribuye exclusivamente en formato GGUF, con una escalera de cuantizaciones que va de IQ4_XS (4,88 GB) a Q8_0 (8,71 GB), pensada para ejecución local en llama.cpp, Ollama, LM Studio y Jan.

La particularidad técnica de este repositorio es que las cuantizaciones no siguen el proceso uniforme de `llama-quantize`, sino una receta de precisión mixta guiada por CKA (análisis de similitud de representaciones) que protege determinadas capas en Q8_0 y Q6_K para evitar que el comportamiento de rechazo o las respuestas vacías reaparezcan tras la cuantización. Es relevante para quienes quieren ejecutar un modelo de 8B "sin censura" en hardware de consumo sin perder las capacidades conversacionales, de código y de uso de herramientas del modelo original.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 16384`) |
| Tipos de cuantización | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo en el modelo base) |

## Arquitectura y entrenamiento
El modelo base es Qwen3-8B, un transformer denso de aproximadamente 8,2 mil millones de parámetros. Sobre él se aplica el ajuste Tenet-8B-Qwen3-Unslop-v2, descrito por el autor como un "de-refusal / de-slop fine-tune" mediante el motor Lancet, orientado a eliminar los rechazos y las respuestas genéricas del modelo original. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación destacable está en el proceso de cuantización: en lugar de una pasada uniforme de `llama-quantize`, se usa una receta de precisión mixta guiada por CKA (`cka_quant_recipe.json`). Se seleccionan capas quirúrgicas (5, 7, 9, 17, 18, 19, 20, 21), se protegen en Q8_0 las capas 0, 9, 17, 18, 20 y 35, y se fijan en Q6_K las capas 5, 7, 19 y 21, con un bitrate medio estimado de 5,074 bpw. Según el autor, esto mantiene la supresión del comportamiento de rechazo intacta incluso a 4-6 bits.

## Capacidades
- Generación de texto conversacional multi-turno.
- Razonamiento y matemáticas (el autor reporta resultados en MATH-500, GSM8K y GPQA Diamond).
- Generación de código y tareas de programación.
- Uso de herramientas y function calling (etiquetas `tool-use` y `agentic`).
- Flujos agénticos y razonamiento multi-paso.
- Comportamiento "sin censura" / de-refusal reducido respecto al modelo base.
- Respuestas menos genéricas ("unslop") según el ajuste del autor.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso
- Asistente conversacional local: el modelo puede mantener diálogos multi-turno en llama.cpp u Ollama con `-cnv`, adecuado para prototipos en portátil gracias a las cuantizaciones de 4-5 bits (4,88-5,21 GB).
- Generación de código en local: las etiquetas `coding` y `tool-use` y la ventana de contexto configurable (el ejemplo usa 16.384 tokens) permiten integrarlo en editores o pipelines de desarrollo sin depender de la nube.
- Agentes con uso de herramientas: el soporte de function calling permite construir agentes que invocan APIs o ejecutan acciones multi-paso en entornos controlados.
- Investigación sobre alineación y censura: al ser un modelo "abliterated", sirve para estudiar cómo cambia el comportamiento de rechazo respecto a Qwen3-8B y cómo la cuantización protegida por CKA preserva ese efecto.
- Despliegue en hardware de consumo: con Q4_K_M (5,21 GB) cabe en GPU de 8-12 GB de VRAM, lo que permite inferencia local en estaciones de trabajo modestas.
- Generación de contenido creativo sin filtros: útil para escritura y lluvia de ideas donde los rechazos del modelo base resultan limitantes, siempre con revisión humana.
- Evaluación comparativa de cuantizaciones: la escalera IQ4_XS a Q8_0 permite medir la degradación de calidad frente al checkpoint FP8 del modelo padre.

## Benchmarks y rendimiento
Resultados reportados por el autor sobre el checkpoint FP8 del modelo padre (las cuantizaciones CKA los mantienen dentro del ruido de medición, según la model card):

| Benchmark | Puntuación |
|---|---|
| IFEval (strict) | 0,81 |
| IFEval (instruction strict) | 0,87 |
| MATH-500 | 0,72 |
| GSM8K (strict) | 0,89 |
| GPQA Diamond | 0,40 |
| MMLU-Pro | 0,60 |

No se han publicado en la información disponible resultados medidos directamente sobre los ficheros GGUF ni comparativas con otros modelos.

## Requisitos de hardware
- VRAM estimada de inferencia según cuantización: IQ4_XS ~4,88 GB; Q4_K_M ~5,21 GB; Q5_K_M ~5,99 GB; Q6_K ~6,82 GB; Q8_0 ~8,71 GB (más overhead de contexto KV cache).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M; 12 GB o más para Q6_K/Q8_0. Modelos profesionales como A100 o H100 no son necesarios para un 8B, pero funcionan.
- Cabe en GPU de consumo: sí, por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; también en GPUs de 8 GB con Q4_K_M ajustando contexto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/...:Q4_K_M`), LM Studio y Jan.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-Qwen3-8B-Abliterated-Unslop-v2-GGUF | 8,19 B | no disponible | Apache 2.0 | GGUF | Ajuste de-refusal + cuantización CKA protegida |
| Qwen/Qwen3-8B | ~8,2 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base original, con rechazos y alineación estándar |
| Tenet-8B-Qwen3-Unslop-v2 | ~8,2 B | no disponible | Apache 2.0 | FP8 (según model card) | Checkpoint padre del que derivan estas cuantizaciones |

No se dispone de datos de rendimiento de modelos alternativos en la información proporcionada para una comparación cuantitativa.

## Limitaciones y advertencias
- Al ser un modelo "abliterated" y "uncensored", puede generar contenido que el modelo base rechazaría; requiere filtros y supervisión si se usa en producción orientada al público.
- Riesgo de alucinación inherente a modelos de 8B, especialmente en GPQA Diamond (0,40) y MMLU-Pro (0,60), donde el rendimiento es moderado.
- La eliminación de rechazos puede degradar la seguridad y el cumplimiento de políticas; no recomendable en aplicaciones reguladas sin capas adicionales de moderación.
- No se especifican idiomas soportados; el rendimiento multilingüe no está garantizado más allá de lo que ofrezca Qwen3-8B.
- La longitud de contexto no se documenta en la información disponible; el ejemplo de uso emplea 16.384 tokens, pero no se confirma el máximo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del ajuste ni sobre la calidad tras la cuantización.
- Los benchmarks reportados corresponden al checkpoint FP8 del padre, no a los GGUF; la equivalencia se afirma "dentro del ruido de medición" sin datos específicos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.

## Enlaces
- Hugging Face (este repositorio): https://huggingface.co/mr-andrey-isachenko/Tenet-Qwen3-8B-Abliterated-Unslop-v2-GGUF
- Modelo base del ajuste: https://huggingface.co/mr-andrey-isachenko/Tenet-8B-Qwen3-Unslop-v2
- Modelo original: https://huggingface.co/Qwen/Qwen3-8B
