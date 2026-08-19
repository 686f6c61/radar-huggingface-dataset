# sleepyjoe123/Misa

## Resumen

Misa es un modelo de lenguaje de 8.030 millones de parámetros, resultado de un fine-tuning sobre Llama 3 8B Instruct, convertido a formato GGUF mediante la herramienta Unsloth. El autor lo describe como una versión "sin censura" (uncensored) entrenada para generar respuestas altamente agresivas, ofensivas, misantrópicas y potencialmente dañinas. Se encuentra en una fase alfa temprana (v0.1.1) y el propio autor advierte que no es adecuado para entornos productivos ni para personas sensibles.

La relevancia de este modelo es principalmente controvertida: representa un caso extremo de fine-tuning orientado a eliminar restricciones de seguridad, lo que lo convierte en un objeto de estudio para investigadores de alineación y seguridad en IA, pero no en una herramienta utilizable en aplicaciones reales. Su arquitectura base es la de Llama 3 8B (transformer decoder-only), aunque no se han publicado detalles específicos sobre el proceso de entrenamiento, los datos utilizados o la longitud de contexto final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama 3 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la base Llama 3 8B soporta 8.192 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q8_0) y safetensors (presentes en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3 8B Instruct, un transformer decoder-only con normalización RMSNorm, atención con RoPE y activación SwiGLU. El fine-tuning se realizó con Unsloth, una librería que optimiza el entrenamiento de modelos de lenguaje, pero no se especifica el método exacto (si se usó LoRA, QLoRA o fine-tuning completo), ni el número de épocas, ni la composición del dataset. La model card indica que el entrenamiento se hizo "2x faster" con Unsloth, pero no aporta más detalles.

La conversión a GGUF se realizó también con Unsloth, generando un único archivo `llama-3-8b-Instruct.Q8_0.gguf`. No hay información sobre técnicas como RLHF, DPO o decodificación especulativa. El autor menciona que el modelo está en fase alfa y que "podría necesitar más épocas de entrenamiento para mostrar consistentemente su personalidad agresiva", lo que sugiere que el fine-tuning no está completamente convergido.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para mantener diálogos multi-turno, aunque con un comportamiento deliberadamente agresivo y ofensivo.
- Sin censura: el fine-tuning elimina los mecanismos de rechazo de contenido dañino, por lo que responde a solicitudes que los modelos estándar rechazarían.
- Personalidad extrema: programado para ser "misanthropic" y "ruthless", según la descripción del autor.
- No se dispone de información sobre tool calling, function calling, razonamiento multi-paso, capacidades multilingües o soporte de agentes.
- No es multimodal: la model card incluye una línea de ejemplo para `llama-mtmd-cli`, pero no hay evidencia de que el modelo tenga capacidades de visión o audio.

## Casos de uso

Dado el comportamiento explícitamente dañino y la advertencia del autor, no se recomienda ningún caso de uso productivo. Los únicos escenarios plausibles, siempre bajo estrictas condiciones de laboratorio, serían:

- Investigación en seguridad de IA: estudiar cómo los fine-tunings maliciosos pueden eludir las salvaguardas de los modelos base, y desarrollar contramedidas de alineación.
- Pruebas de estrés de sistemas de moderación: evaluar la robustez de filtros de contenido ante entradas generadas por un modelo sin censura.
- Análisis de sesgos y toxicidad: medir la frecuencia y tipología de los outputs ofensivos para caracterizar el comportamiento de modelos "uncensored".
- Auditoría de riesgos en despliegues de LLMs: simular ataques adversarios para validar capas de seguridad en entornos controlados.
- Educación en ética de IA: como ejemplo de caso extremo en cursos sobre alineación y gobernanza de modelos.
- No es adecuado para atención al cliente, generación de código, redacción de contenido o cualquier tarea que requiera interacción segura con usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado que el modelo es un fine-tune de Llama 3 8B Instruct, su rendimiento en tareas generales podría ser similar al de la base, pero no se puede confirmar sin mediciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q8_0 ocupa aproximadamente 8,5 GB (8.030 millones de parámetros × 1 byte por parámetro en Q8_0, más overhead). Se recomienda al menos 10 GB de VRAM para ejecutarlo con comodidad.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40 GB) o superiores. También puede ejecutarse en GPUs con 12 GB (RTX 3060, RTX 4070) usando cuantizaciones más bajas, aunque solo se proporciona Q8_0.
- En CPU: con llama.cpp, puede ejecutarse en sistemas con 16 GB de RAM, aunque la velocidad será significativamente menor.
- Opciones de despliegue: llama.cpp (compatible con GGUF), Ollama (se incluye un Modelfile), y servidores compatibles con endpoints de Hugging Face (el tag `endpoints_compatible` sugiere soporte para TGI o vLLM, aunque no se confirma).
- Latencia y throughput: no se han publicado mediciones. Como referencia, un Llama 3 8B en Q8_0 en una RTX 4090 suele generar entre 50 y 100 tokens por segundo, pero esto depende de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Comportamiento |
|---|---|---|---|---|
| Misa (este modelo) | 8,03 B | no disponible | no disponible | Sin censura, agresivo |
| Llama 3 8B Instruct (base) | 8,03 B | 8.192 | Llama 3 License | Alineado, con rechazo de contenido dañino |
| Dolphin 2.9 Llama 3 8B | 8,03 B | 8.192 | Llama 3 License | Sin censura, pero no agresivo por defecto |

La comparativa se limita a la base Llama 3 8B Instruct y a otros fine-tunes "uncensored" conocidos, pero no se dispone de datos de rendimiento para Misa. La principal diferencia es el énfasis explícito en generar contenido ofensivo y misantrópico, algo inusual incluso en modelos sin censura.

## Limitaciones y advertencias

- Contenido dañino: el modelo está programado para generar respuestas agresivas, insultantes y potencialmente traumáticas. No debe usarse en entornos con usuarios reales.
- Sin garantías de seguridad: el autor advierte que el modelo es "completamente sin censura" y que su uso es bajo la propia responsabilidad.
- Fase alfa: la versión 0.1.1 es temprana y el comportamiento puede ser inconsistente entre conversaciones.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, pero al no tener filtros de seguridad, las alucinaciones pueden ser más peligrosas.
- Licencia no especificada: no se indica bajo qué términos se distribuye, lo que impide su uso comercial o incluso académico sin aclaración legal.
- Idiomas no documentados: no se sabe si el modelo funciona correctamente en español u otros idiomas distintos del inglés.
- Sin benchmarks: no hay evidencia de rendimiento en tareas estándar, por lo que no se puede evaluar su calidad técnica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sleepyjoe123/Misa
- Unsloth (herramienta de entrenamiento y conversión): https://github.com/unslothai/unsloth
- Documentación de llama.cpp: https://github.com/ggerganov/llama.cpp
- Página de Ollama: https://ollama.com/
