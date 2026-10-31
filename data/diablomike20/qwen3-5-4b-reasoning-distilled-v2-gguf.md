# diablomike20/Qwen3.5-4B-Reasoning-Distilled-v2-GGUF

## Resumen

Qwen3.5-4B-Reasoning-Distilled-v2 es un ajuste fino (fine-tune) comunitario del modelo Qwen3.5-4B de Qwen, publicado por el usuario diablomike20 en Hugging Face. Se trata de una destilación de razonamiento (reasoning distillation) realizada con LoRA mediante la biblioteca Unsloth, entrenada con más de 14.000 ejemplos de razonamiento general de estilo Claude 4.6 Opus. Su objetivo no es maximizar la precisión en benchmarks, sino mejorar la eficiencia del razonamiento: reducir cadenas de pensamiento innecesariamente largas y mejorar la relación coste-calidad por token de inferencia.

Esta segunda versión (v2) introduce un "andamiaje de razonamiento" refinado que elimina bucles internos redundantes y mejora la generalización entre tareas (de lógica y matemáticas hacia programación, por ejemplo). Según el autor, el modelo es más autónomo y estable en problemas complejos de varios pasos. Es relevante como ejemplo de destilación de razonamiento accesible: todo el proceso de entrenamiento se ha documentado y publicado para que pueda reproducirse en Colab o en un portátil estándar. Los pesos están disponibles en formato GGUF, con un tamaño de repositorio de 14,4 GB, y el modelo hereda la licencia Apache 2.0 de su base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (família Qwen3.5), fine-tune LoRA sobre Qwen3.5-4B |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (publicado en GGUF; cuantizaciones concretas no especificadas) |
| Idiomas soportados | ingles, chino, coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original usa safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4,2 mil millones de parametros, y se ajusta mediante LoRA utilizando la biblioteca Unsloth. El entrenamiento se realizo con tres datasets: nohurry/Opus-4.6-Reasoning-3000x-filtered, Jackrong/Qwen3.5-reasoning-700x y Roman1111111/claude-opus-4.6-10000x, que en conjunto aportan mas de 14.000 muestras de razonamiento general de estilo Claude 4.6 Opus. La composicion de los datos es deliberadamente de dominio general: matematicas, problemas verbales, deduccion logica y una mezcla equilibrada de conocimiento general e instrucciones, sin supervision especializada en codigo.

La innovacion principal de v2 es el enfoque en la "economia del razonamiento": en lugar de alargar las cadenas de pensamiento para maximizar puntuaciones, se optimiza para producir razonamientos mas concisos y reutilizables, reduciendo el analisis verboso en problemas faciles. El autor declara que esto mejora la estabilidad y autoconsistencia del modelo en resolucion de problemas multi-paso. No se dispone de detalles sobre hiperparametros exactos, numero de epocas ni hardware de entrenamiento en la model card, aunque el autor indica que todo el proceso fue autofinanciado y ha publicado un notebook y una guia PDF para reproducirlo.

## Capacidades

- Generacion de texto conversacional con razonamiento explicito (chain-of-thought), heredada del modelo base Qwen3.5-4B.
- Razonamiento eficiente: cadenas de pensamiento un 33,77 % mas cortas de media que el modelo base oficial, con mejor ratio de calidad por caracter de razonamiento.
- Resolucion de problemas matematicos y de deduccion logica, dominio principal de los datos de destilacion.
- Transferencia a programacion: obtiene resultados razonables en HumanEval y HumanEval+ sin haber sido entrenado especificamente con codigo.
- Etiquetado con pipeline image-text-to-text: la model card sugiere capacidad multimodal (imagen-texto a texto), aunque no se documentan ejemplos ni detalles de esta capacidad.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Capacidades multilingues en ingles, chino y coreano (heredadas del modelo base).

## Casos de uso

- Chatbots con razonamiento en hardware modesto: al ser un modelo de 4B en formato GGUF, puede ejecutarse localmente para asistentes conversacionales que necesiten razonamiento paso a paso sin coste de API.
- Resolucion de problemas matematicos y acertijos logicos: los datos de destilacion se centran en matematicas y deduccion logica, por lo que es adecuado para tutors o herramientas de ayuda al estudio.
- Generacion de codigo asistida: aunque no fue optimizado para codigo, mantiene un pass@1 de 0,7317 en HumanEval, suficiente para autocompletado y generacion de funciones sencillas.
- Ahorro de presupuesto de inferencia: si el coste depende de los tokens generados, el razonamiento un 30 % mas corto reduce el gasto por respuesta manteniendo calidad similar.
- Proyectos educativos de fine-tuning: el autor publica notebook, codigo y guia PDF para reproducir el entrenamiento en Colab, lo que lo convierte en un buen caso de estudio de destilacion de razonamiento con LoRA y Unsloth.
- Agentes ligeros de varios pasos: el autor destaca mejoras en autonomia y estabilidad en resolucion multi-paso, util para pipelines sencillos de razonamiento encadenado.
- Procesamiento de contenido en chino e ingles: soporte nativo de ambos idiomas heredado de la familia Qwen.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, con reevaluacion "fairly recomputed" sobre HumanEval y HumanEval+:

| Metrica | Qwen3.5-4B oficial | v2 ajustado | Cambio |
|---|---:|---:|---:|
| HumanEval (pass@1) | 0,7683 | 0,7317 | -3,66 pts |
| HumanEval+ (pass@1) | 0,7256 | 0,6951 | -3,05 pts |
| Longitud media de razonamiento (caracteres) | 2829 | 1874 | -33,77 % |
| Pasadas HumanEval por 10k caracteres de razonamiento | 3,104 | 4,393 | +41,54 % |
| Pasadas HumanEval+ por 10k caracteres de razonamiento | 2,910 | 4,165 | +43,15 % |
| Caracteres de razonamiento por pasada HumanEval | 3222 | 2276 | -29,35 % |
| Caracteres de razonamiento por pasada HumanEval+ | 3437 | 2401 | -30,14 % |

No se han publicado resultados de benchmarks como MMLU, GSM8K u otros en la informacion disponible. Nota: estos datos provienen del autor del modelo y no de una evaluacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 4B en GGUF requiere aproximadamente 2,5-3 GB en cuantizacion de 4 bits (Q4_K_M) y unos 4,5-5 GB en 8 bits; la cuantizacion exacta disponible no esta especificada en el repositorio.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060) es suficiente; tambien funciona solo con CPU dada su talla.
- Consumer GPUs: cabe comodamente en la mayoria de GPUs modernas, incluso en portatiles, al tratarse de un modelo de 4B en GGUF.
- Opciones de despliegue: llama.cpp y Ollama de forma nativa (formato GGUF); tambien LM Studio para uso de escritorio. No se indica compatibilidad con vLLM o TGI para esta version GGUF.
- Latencia y throughput: no disponible; al ser un modelo de 4B, se espera inferencia rapida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Razonamiento | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Reasoning-Distilled-v2 | 4,2B | GGUF | Apache 2.0 | Destilado, optimizado para eficiencia | HF (comunidad) |
| Qwen/Qwen3.5-4B (base oficial) | 4,2B | safetensors | Apache 2.0 | Razonamiento nativo, mayor precision absoluta | HF (oficial) |
| Qwen3-4B-Instruct (generacion anterior) | 4B | safetensors / GGUF | Apache 2.0 | Modo thinking opcional | HF (oficial) |

Nota: la comparativa se limita a la familia Qwen dada la informacion disponible; el modelo oficial Qwen3.5-4B sigue siendo superior en precision absoluta (HumanEval 0,7683 frente a 0,7317), mientras que v2 ofrece mejor eficiencia por token de razonamiento.

## Limitaciones y advertencias

- El modelo pierde 3-3,7 puntos de precision absoluta en HumanEval y HumanEval+ respecto al modelo base oficial; si solo importa la maxima precision, el modelo oficial es mejor opcion.
- Los datos de entrenamiento son de dominio general (matematicas, logica), no de codigo: el rendimiento en programacion proviene de transferencia, no de optimizacion directa.
- Los benchmarks fueron calculados y publicados por el propio autor; no hay verificacion independiente y las descargas del repositorio son practicamente nulas (0 descargas en el momento de la ficha).
- Sesgos: no disponible; no se documenta analisis de sesgos. Al destilar de datos de estilo Claude 4.6 Opus, podria heredar patrones y sesgos de esa familia de modelos.
- Riesgo de alucinacion: no disponible; no se documentan mediciones especificas, aunque debe asumirse el riesgo tipico de modelos de 4B.
- Idiomas limitados a ingles, chino y coreano; no hay soporte documentado para castellano.
- Longitud de contexto no especificada en la model card; habra que consultar la configuracion del modelo base Qwen3.5-4B.
- La etiqueta image-text-to-text no esta respaldada con documentacion de capacidades visuales en la model card; tratar con cautela.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, pero conviene verificar los terminos de uso de los datasets de destilacion empleados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/diablomike20/Qwen3.5-4B-Reasoning-Distilled-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de la guia de fine-tuning: https://github.com/R6410418/Jackrong-llm-finetuning-guide
- Guia completa de fine-tuning (PDF): https://github.com/R6410418/Jackrong-llm-finetuning-guide/blob/main/guidePDF/Qwopus3-5-27b-Colab_complete_guide_to_llm_finetuning.pdf
- Unsloth: https://unsloth.ai
- Dataset nohurry/Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset Jackrong/Qwen3.5-reasoning-700x: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
