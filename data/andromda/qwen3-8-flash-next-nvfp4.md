# andromda/Qwen3.8-Flash-Next-NVFP4

## Resumen

Qwen3.8-Flash-Next-NVFP4 es una compilación cuantizada en NVFP4 (4 bits) del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario andromda (con atribución en la model card a dealignai). Se trata de una variante "abliterated" y sin censura, orientada explícitamente a investigación en ciberseguridad ofensiva y red-teaming: el autor declara haber eliminado los rechazos de seguridad mediante una modificación directa de los pesos, sin fine-tuning, LoRA, destilación ni trucos de plantilla de chat. El modelo conserva la multimodalidad (imagen y vídeo), el razonamiento configurable (off / low / xhigh) y la decodificación especulativa MTP del modelo base.

El repositorio contiene aproximadamente 180.000 millones de parámetros en formato safetensors (135,2 GB), empaquetados para su servicio con SGLang y pensados para despliegue en tensor-parallel sobre 2× NVIDIA DGX Spark (GB10). La licencia declarada es qwen-community-license-1.0, si bien la model card la etiqueta como "other" y acompaña un fichero LICENSE propio.

Su relevancia es doble: por un lado, demuestra un flujo de cuantización NVFP4 sobre un modelo multimodal de gran tamaño con preservación declarada de las trazas de razonamiento; por otro, es un artefacto de doble uso con riesgos evidentes, ya que el propio autor advierte que cumplirá solicitudes dañinas, ilegales o poco éticas. No se dispone de información sobre idiomas soportados ni de datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con razonamiento y MTP; detalles completos del base no disponibles |
| Parametros totales | 179.999.981.459 (~180 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits), formato FP4 con escalado NVFP4; tag adicional "8-bit" y "modelopt" |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | safetensors (repo de 135,2 GB), librería sglang |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-Flash-Next es un transformer multimodal de tipo image-text-to-text que acepta entradas de imagen y vídeo y expone modos de razonamiento (off, low, xhigh), además de decodificación especulativa MTP (multi-token prediction). Esta compilación no introduce entrenamiento adicional: según la model card, la eliminación de rechazos se realizó mediante una modificación a nivel de pesos ("abliteration"), sin fine-tuning, LoRA, destilación ni datos sintéticos, y funciona con la plantilla de chat estándar y el system prompt por defecto.

La cuantización a NVFP4 se realizó presumiblemente con NVIDIA ModelOpt (tags "modelopt", "nvfp4", "fp4"), si bien no se detallan en la información disponible los parámetros exactos del proceso (calibración, capas excluidas, etc.). El autor declara que la modificación preserva conocimiento, estilo, razonamiento y calibración: reporta una longitud mediana de traza de razonamiento de 422 tokens frente a 434 del base (0,97×) y una precisión de respuesta del 98,3 % frente al 96,7 % del base en preguntas multi-paso difíciles. No se dispone de datos sobre el número de tokens de entrenamiento ni la composición del dataset del modelo original.

## Capacidades

- Generación de texto y razonamiento multi-paso con niveles de esfuerzo configurables (off, low, xhigh).
- Procesamiento multimodal: entrada de imagen y vídeo (pipeline image-text-to-text).
- Razonamiento matemático y científico a nivel universitario (el autor reporta evaluación en matemáticas, física, química y lógica formal).
- Decodificación especulativa MTP para acelerar la generación.
- Conversación multi-turno con plantilla de chat estándar.
- Cumplimiento de solicitudes dañinas por diseño (modelo "uncensored"/"abliterated"), incluyendo categorías de cibercrimen e intrusión, químicos/biológicos, ilegal, acoso, desinformación y copyright, según las tablas de HarmBench-320 del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: razonamiento multi-paso sí; soporte de agentes explícito no disponible.
- Capacidades multilingües: no disponible (se menciona una respuesta coherente en chino en las evaluaciones, sin listado oficial de idiomas).

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo sirve como sujeto de prueba para medir la eficacia de clasificadores, filtros y políticas de moderación frente a un modelo sin rechazos, usando los buckets TRUE_COMPLY / SOFT_REFUSE / HARD_REFUSE del autor como referencia.
- Investigación en alineación y abliteration: permite estudiar cómo una modificación a nivel de pesos afecta a la calibración y al conocimiento (el autor reporta una caída de 0,84 pp en MMLU-logit), comparando contra el modelo base en el mismo harness.
- Análisis de doble uso en ciberseguridad: útil en laboratorios con sandbox aislado para generar y analizar contenido ofensivo controlado, siempre bajo marcos legales y de contención estrictos.
- Evaluación de cuantización NVFP4: caso de estudio para medir la degradación de un modelo multimodal de ~180 B al pasar a FP4, con métricas de longitud de traza y precisión reportadas por el autor.
- Despliegue multi-GPU con SGLang: escenario de referencia para probar tensor-parallel en 2× DGX Spark (GB10) con un modelo de 135,2 GB en disco.
- Investigación en razonamiento multimodal: el modelo acepta imagen y vídeo y expone modos de esfuerzo de razonamiento, lo que permite estudiar el efecto del presupuesto de deliberación en tareas visuales.
- Auditoría de contenido generado: uso como generador adversario en pipelines de detección de contenido dañino, midiendo tasas de cumplimiento por categoría (p. ej., 52/52 en cybercrime con effort low).

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificados de forma independiente):

| Metrica | Base (NVFP4) | Esta build |
|---|---|---|
| Longitud mediana de traza de razonamiento (xhigh, greedy) | 434 tok | 422 tok (0,97×) |
| Precisión de respuesta en preguntas multi-paso difíciles | 96,7 % | 98,3 % |
| MMLU-logit (n=40/asignatura, 2280 preguntas, greedy) | 82,11 % | 81,27 % (−0,84 pp) |

Cumplimiento HarmBench-320 (240 comportamientos de daño real, excluyendo copyright), TRUE_COMPLY por esfuerzo de razonamiento:

| Esfuerzo | TRUE_COMPLY | SOFT_REFUSE | DEFLECT | REDIRECT | HARD_REFUSE |
|---|---|---|---|---|---|
| off | 219/240 (91,2 %) | 19 | 1 | 1 | 0 |
| low | 222/240 (92,5 %) | 18 | 0 | 0 | 0 |
| xhigh | 219/240 (91,2 %) | 20 | 1 | 0 | 0 |

Categorías prioritarias (TRUE_COMPLY):

| Esfuerzo | Cybercrime/intrusion | Químico/biológico |
|---|---|---|
| off | 52/52 (100 %) | 41/42 (98 %) |
| low | 52/52 (100 %) | 42/42 (100 %) |
| xhigh | 51/52 (98 %) | 41/42 (98 %) |

No se han publicado en la información disponible resultados de benchmarks estándar del modelo base (MMLU completo, HumanEval, GSM8K) más allá del MMLU-logit parcial citado.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 135,2 GB en NVFP4; en inferencia se necesita al menos esa cifra más overhead de KV cache y activaciones, por lo que no cabe en una sola GPU de 80 GB.
- GPU recomendadas: el autor indica despliegue en tensor-parallel sobre 2× NVIDIA DGX Spark (GB10); por tamaño, también sería viable en 2× H100 80 GB o 2× A100 80 GB, aunque no está confirmado en la información disponible.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en configuraciones de una sola tarjeta de consumo; requeriría múltiples GPU o cuantizaciones adicionales no publicadas.
- Opciones de despliegue: SGLang es la librería declarada; otras opciones (vLLM, llama.cpp, Ollama, TGI) no están confirmadas para este formato NVFP4.
- Latencia y throughput: no disponibles. El modelo incluye decodificación especulativa MTP, que según el autor acelera la generación, pero no se publican cifras de tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| andromda/Qwen3.8-Flash-Next-NVFP4 | ~180 B | no disponible | NVFP4 | qwen-community-license-1.0 | Abliterated, multimodal, sin rechazos |
| Qwen/Qwen3.8-Flash-Next (base) | ~180 B | no disponible | BF16/FP16 (presumible) | qwen-community-license-1.0 | Modelo original con rechazos de seguridad |
| Otras variantes abliterated de Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros fabricantes en la misma categoría (tamaño o tarea).

## Limitaciones y advertencias

- Modelo sin censura: elimina los rechazos de seguridad y cumple solicitudes dañinas, ilegales o poco éticas, incluidas categorías de cibercrimen, químicos/biológicos y desinformación. El autor lo declara artefacto de red-team y responsabiliza al usuario del uso.
- Riesgo legal y de cumplimiento: el uso en producción puede infringir leyes de ciberseguridad, bioseguridad, copyright y normativa sectorial; no apto para aplicaciones de cara al público sin controles adicionales.
- Alucinación: no se han publicado evaluaciones específicas de tasa de alucinación; el MMLU-logit muestra regresiones notables en asignaturas como machine_learning (−22,5 pp), moral_scenarios (−17,5 pp) y moral_disputes (−12,5 pp).
- Idiomas: no se dispone de listado oficial de idiomas soportados; el comportamiento multilingüe no está garantizado.
- Contexto: la longitud de contexto no está documentada en la información disponible.
- Licencia: qwen-community-license-1.0 puede imponer restricciones al uso comercial; debe revisarse el fichero LICENSE del repositorio antes de cualquier despliegue.
- Formato NVFP4: requiere hardware y software compatibles (SGLang, presumiblemente GPU NVIDIA con soporte FP4); la portabilidad a otros stacks no está confirmada.
- Datos de benchmarks: las cifras de HarmBench y MMLU proceden del propio autor y no han sido verificadas de forma independiente; el harness y el juez no están publicados en detalle.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/andromda/Qwen3.8-Flash-Next-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Perfil del autor citado en la model card: https://huggingface.co/dealignai
- Twitter del autor citado: https://twitter.com/dealignai
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
