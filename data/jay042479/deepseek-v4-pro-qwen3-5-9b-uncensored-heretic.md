# jay042479/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen
DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un ajuste fino de tipo "abliterated" (decensurado) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicado por el usuario jay042479 en Hugging Face. El modelo base es a su vez un fine-tune de Qwen3.5-9B orientado al razonamiento, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect", con un enfasis claro en matematicas y disciplinas STEM. El resultado es un modelo de aproximadamente 9.400 millones de parametros con licencia Apache 2.0, pensado para despliegue practico en entornos con recursos limitados.

La modificacion principal de esta version consiste en la aplicacion de tecnicas de ablacion de comportamiento (Arbitrary-Rank Ablation, ARA) mediante la herramienta Heretic v2.0.0.dev0, que reduce drasticamente las tasas de rechazo (de 100/100 a 3/100 en el conjunto de evaluacion del autor) a costa de una divergencia KL de 0,0422 respecto al modelo original. El modelo conserva las capacidades de razonamiento estructurado, matematicas, STEM y uso de herramientas del base, e incorpora soporte multimodal image-text-to-text segun las etiquetas del repositorio.

Es relevante ahora por dos motivos: por un lado, ofrece una alternativa compacta (9B) con licencia permisiva para tareas de razonamiento tecnico; por otro, ejemplifica el ecosistema de variantes "uncensored" que buscan eliminar capas de rechazo en modelos abiertos, con implicaciones tanto practicas como eticas que conviene evaluar antes de un uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con cabeceras multimodales image-text-to-text segun etiquetas del repo; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (se menciona evaluacion NVFP4 y MTP, pero sin detalle de formatos publicados) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tambien compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del Qwen3.5-9B, un transformer denso de aproximadamente 9.400 millones de parametros. El proceso de entrenamiento del modelo base consistio en una destilacion desde DeepSeek-V4-Pro en modo "Max Effect", con un corpus de aproximadamente 250.000 muestras centradas en matematicas y razonamiento cientifico (STEM). Segun la model card, se emplearon etapas de SFT y RL (con GSPO mencionado entre las etiquetas), y se evaluo el uso de Multi-Token Prediction (MTP) y precision NVFP4. El autor senala que, pese a no incluir datos SFT especificos de programacion, se observan pequenas ganancias en tareas de codigo y uso de herramientas por transferencia entre dominios.

Sobre esta base, la version "heretic" aplica una ablacion de rango arbitrario (ARA) entre las capas 9 y 24, con pesos concretos: preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. Esta intervencion modifica el comportamiento de rechazo del modelo sin reentrenamiento completo, lo que explica la baja divergencia KL reportada.

## Capacidades
- Generacion de texto y razonamiento multi-paso con descomposicion estructurada de problemas.
- Razonamiento matematico y resolucion de problemas STEM, principal foco del entrenamiento.
- Generacion de codigo y tareas de programacion por transferencia entre dominios (sin SFT especifico de codigo).
- Uso de herramientas y function calling, segun las etiquetas tool-use y function-calling.
- Capacidades multimodales image-text-to-text, segun las etiquetas del repositorio (sin detalle adicional en la model card).
- Soporte multilingue en en, zh, ko, ja, es y ru.
- Modo de razonamiento (reasoning) heredado del proceso de destilacion.
- Comportamiento decensurado: tasa de rechazo reducida a 3/100 frente a 100/100 del modelo original en la evaluacion del autor.

## Casos de uso
- Resolucion de problemas matematicos y cientificos: el modelo esta entrenado sobre aproximadamente 250.000 muestras de matematicas y STEM, por lo que resulta adecuado para tutoria automatizada, generacion de ejercicios resueltos y verificacion de derivaciones paso a paso.
- Asistencia en investigacion tecnica: puede descomponer problemas de fisica, quimica o ingenieria en subproblemas y proponer soluciones estructuradas, aprovechando el razonamiento destilado de DeepSeek-V4-Pro.
- Integracion en pipelines de agentes con tool calling: las etiquetas de function-calling permiten conectarlo a APIs externas, calculadoras o bases de datos para tareas de automatizacion multi-paso.
- Generacion y revision de codigo en entornos de desarrollo: aunque no recibio SFT especifico de codigo, las ganancias por transferencia permiten usarlo como asistente de programacion en tareas de complejidad moderada, con validacion humana.
- Procesamiento de documentos con componente visual: la etiqueta image-text-to-text sugiere utilidad en tareas de extraccion o descripcion de contenido en imagenes combinado con texto, previa verificacion empirica de la calidad multimodal.
- Despliegue en entornos con recursos limitados: con 9B parametros y licencia Apache 2.0, encaja en servidores de una sola GPU o estaciones de trabajo para prototipos internos.
- Escenarios multilingues: atencion a usuarios en ingles, chino, coreano, japones, espanol y ruso, con calidad variable segun el idioma.

## Benchmarks y rendimiento
La model card unicamente reporta metricas de comportamiento y divergencia respecto al modelo original:

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (Refusals) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 9,4B parametros, en FP16 se requeriria aproximadamente 19 GB de VRAM (coincide con el tamano del repo de 19,3 GB), y en cuantizaciones de 8 bits o 4 bits el requisito se reduce proporcionalmente (valores orientativos, no confirmados por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, cabria en A100, H100, L40S o RTX 4090 en FP16, y en GPUs consumer de 12-16 GB con cuantizacion.
- Compatibilidad con GPU consumer: probable con cuantizacion (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090), sin confirmacion oficial.
- Opciones de despliegue: transformers, text-generation-inference (segun etiquetas) y, previsiblemente, llama.cpp/Ollama/vLLM con conversion a GGUF, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) | 9,4B | no disponible | Razonamiento STEM destilado, decensurado | apache-2.0 | Hugging Face |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9,4B | no disponible | Razonamiento STEM destilado, con rechazo estandar | apache-2.0 | Hugging Face |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B (segun nombre) | no disponible | Version 4B decensurada | no disponible | Hugging Face |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | Fine-tune cientifico sobre la misma base | no disponible | Hugging Face |

## Limitaciones y advertencias
- El proceso de ablacion elimina capas de rechazo, lo que puede facilitar la generacion de contenido danino, sesgado o inapropiado; requiere filtrado y supervision en produccion.
- La divergencia KL de 0,0422 indica que el comportamiento del modelo se ha alterado respecto al original, con posible degradacion en tareas no cubiertas por la evaluacion del autor.
- Riesgo de alucinacion en matematicas y STEM: aunque entrenado en dominios tecnicos, no hay benchmarks publicados que garanticen correccion factual.
- La longitud de contexto no esta documentada, lo que limita la planificacion de cargas con entradas largas.
- Calidad multilingue desigual: el entrenamiento se centra en ingles y chino, con soporte declarado pero no evaluado en espanol, coreano, japones y ruso.
- Las capacidades multimodales (image-text-to-text) figuran solo como etiqueta, sin documentacion de rendimiento ni ejemplos.
- El modelo no ha sido sometido a evaluacion independiente de sesgos; el proceso heretic puede amplificar sesgos preexistentes del base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni responsabilidad sobre el contenido generado; conviene revisar obligaciones de atribucion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/jay042479/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B decensurada: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Fine-tune cientifico DeepThought: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Heretic (herramienta de ablacion): https://heretic-project.org
