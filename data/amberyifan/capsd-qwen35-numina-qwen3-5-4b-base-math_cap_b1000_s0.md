# AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_cap_b1000_s0

## Resumen

El modelo `capsd-qwen35-numina-Qwen3.5-4B-Base-math_cap_b1000_s0` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3.5-4B-Base`, desarrollado por el usuario AmberYifan. Se presenta como un modelo de tipo imagen-texto-a-texto, lo que sugiere capacidades multimodales, aunque la documentación disponible no detalla sus funcionalidades concretas. El nombre del dataset de entrenamiento (`capsd_Qwen3.5-4B-Base-n80000-numina__mix_math_cap_b1000_s0`) apunta a una mezcla de datos matemáticos y de captions, posiblemente orientado a tareas de razonamiento matemático y generación de descripciones de imágenes.

Con 4.539.265.536 parámetros, este modelo se sitúa en la gama de 4B, un tamaño que permite su ejecución en GPUs de consumo con cuantización. El ajuste se realizó mediante fine-tuning completo (full fine-tuning) con el framework `llama-factory`, utilizando hiperparámetros estándar como una tasa de aprendizaje de 1e-5 y una única época. La licencia está declarada como "other", lo que implica que no se especifica claramente si permite uso comercial, por lo que se debe consultar la fuente original antes de utilizarlo en producción.

La relevancia de este modelo radica en su potencial para tareas de razonamiento matemático y procesamiento de imágenes, aunque la ausencia de benchmarks y documentación detallada limita su evaluación objetiva. Es un modelo experimental que puede servir como punto de partida para desarrolladores interesados en explorar fine-tunes multimodales sobre la familia Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-4B-Base) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, se pueden cuantizar externamente) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de `Qwen/Qwen3.5-4B-Base`, que a su vez es un transformer de 4.000 millones de parámetros. No se dispone de detalles sobre la arquitectura interna del modelo base (número de capas, heads, etc.) más allá de su tamaño. El entrenamiento se realizó sobre un dataset denominado `capsd_Qwen3.5-4B-Base-n80000-numina__mix_math_cap_b1000_s0`, que por su nombre parece combinar datos matemáticos (posiblemente del conjunto `numina`) con captions de imágenes. Se empleó fine-tuning completo con el framework `llama-factory`, con una tasa de aprendizaje de 1e-5, batch total de 64 (2 por dispositivo × 4 GPUs × 8 acumulaciones), scheduler cosine con warmup del 3% y una sola época. No se menciona el uso de técnicas como RLHF o DPO. La ausencia de detalles sobre el dataset y el proceso de entrenamiento impide conocer innovaciones técnicas específicas.

## Capacidades

- Generacion de texto: al ser un fine-tune de un modelo base, conserva la capacidad de generar texto coherente, aunque no hay datos sobre su calidad específica.
- Razonamiento matematico: el nombre del dataset sugiere entrenamiento en problemas matemáticos, lo que podría mejorar el rendimiento en tareas aritméticas y algebraicas, pero no hay evidencia documentada.
- Procesamiento de imagenes: el pipeline `image-text-to-text` indica que el modelo acepta imágenes como entrada, pero no se especifica si genera captions, responde preguntas visuales u otras tareas.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Razonamiento matematico asistido: el modelo podría utilizarse para resolver problemas matemáticos paso a paso, aunque no hay benchmarks que confirmen su eficacia.
- Generacion de captions para imagenes: dado el nombre del dataset, podría emplearse para describir imágenes, pero no hay ejemplos ni evaluaciones.
- Prototipado de modelos multimodales: desarrolladores podrían usarlo como base para experimentar con fine-tunes en tareas que combinan visión y lenguaje.
- Investigacion academica: como modelo experimental, sirve para estudiar el efecto del fine-tuning en la familia Qwen3.5 con datos mixtos.
- Educacion: potencialmente utilizable en entornos educativos para ejercicios de matematicas, aunque sin garantías de precisión.
- Desarrollo de chatbots especializados: si se confirma su capacidad multimodal, podría integrarse en asistentes que necesiten entender imágenes y texto, pero requiere validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `results` del model-index está vacío, por lo que no hay datos de MMLU, HumanEval, GSM8K u otras métricas.

## Requisitos de hardware

- VRAM estimada: con 4.539 millones de parámetros, en FP16 se requieren aproximadamente 9 GB de VRAM solo para los pesos. Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ) se podría reducir a unos 2.5-3 GB, permitiendo ejecución en GPUs con 8 GB de VRAM (como RTX 3060, RTX 4060). En FP32 se necesitarían unos 18 GB.
- GPUs recomendadas: para inferencia en FP16, una RTX 3090 o RTX 4090 sería adecuada. Con cuantización, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB podría bastar.
- Compatibilidad con consumer GPU: sí, si se aplica cuantización. Sin cuantizar, requiere una GPU de gama alta o profesional (A100, H100).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No hay configuraciones oficiales documentadas.
- Latencia y throughput: no disponibles. Como referencia, un modelo de 4B en una RTX 4090 suele generar entre 50 y 100 tokens por segundo en FP16, pero esto es una estimación genérica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.5-4B-Base (base) | 4B | no disponible | Apache 2.0 (probable) | HuggingFace |
| AmberYifan/capsd-qwen35-numina (este) | 4.5B | no disponible | other | HuggingFace |
| Qwen2.5-7B-Instruct | 7B | 128K | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento para comparar. El modelo base Qwen3.5-4B-Base tiene licencia Apache 2.0 según la documentación de Qwen, pero este fine-tune declara "other", lo que puede implicar restricciones adicionales. No hay información sobre otros modelos comparables en la misma categoría (4B multimodal).

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de un modelo base, puede heredar sesgos presentes en Qwen3.5-4B-Base, pero no hay información específica.
- Riesgo de alucinacion: no evaluado; se desconoce su fiabilidad en tareas de razonamiento matemático o generación de captions.
- Limitaciones de contexto: la longitud de contexto no está documentada, por lo que no se recomienda su uso con entradas muy largas.
- Restricciones de licencia: la licencia "other" no especifica términos; debe contactarse al autor o consultar el repositorio original antes de uso comercial.
- Carencia de documentacion: la model card es autogenerada y no incluye detalles de entrenamiento, evaluación ni casos de uso validados. No apto para producción sin pruebas exhaustivas.
- Pipeline multimodal no confirmado: aunque el pipeline indica `image-text-to-text`, no hay evidencia de que el modelo procese imágenes correctamente; podría requerir preprocesamiento específico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_cap_b1000_s0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
