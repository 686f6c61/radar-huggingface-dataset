# Selyviel/DeepSeek-R1-Medical-COT

## Resumen

DeepSeek-R1-Medical-COT es un ajuste fino (fine-tuning) del modelo destilado DeepSeek-R1-Distill-Llama-8B, publicado por el usuario Selyviel en Hugging Face. El modelo parte de la versión cuantizada en 4 bits de Unsloth (`unsloth/DeepSeek-R1-Distill-Llama-8B-unsloth-bnb-4bit`), que a su vez deriva del DeepSeek-R1-Distill-Llama-8B de DeepSeek, un modelo de 8 mil millones de parámetros basado en la arquitectura Llama y destilado a partir del razonamiento del DeepSeek-R1 completo. El objetivo declarado es especializar el modelo en tareas de razonamiento médico mediante Chain-of-Thought (CoT).

La relevancia de este modelo es limitada: se trata de una publicación de un particular, sin model card detallada, sin resultados de benchmarks y con cero descargas en el momento de la consulta. El repositorio ocupa solo 0,2 GB, lo que sugiere que los pesos publicados no corresponden a un modelo completo en precisión nativa, sino probablemente a adaptadores LoRA o a pesos cuantizados de forma agresiva. No debe confundirse con otros modelos de nombre similar publicados por terceros (por ejemplo, `ashad846004/DeepSeek-R1-Medical-COT`), que son ajustes independientes.

Por tanto, esta ficha documenta lo que se puede verificar a partir de los metadatos y la model card del autor, e indica explícitamente "no disponible" en todos aquellos apartados que la información proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), destilado de DeepSeek-R1 |
| Parametros totales | 8 mil millones (heredados del modelo base DeepSeek-R1-Distill-Llama-8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | el modelo base de partida esta en 4 bits (bnb-4bit); el repo publicado ocupa 0,2 GB, lo que sugiere pesos cuantizados o adaptadores LoRA |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del DeepSeek-R1-Distill-Llama-8B, un transformer decoder-only de la familia Llama con 8 mil millones de parámetros. Este modelo destilado se obtuvo originalmente por DeepSeek destilando las capacidades de razonamiento del DeepSeek-R1 completo sobre una base Llama, e incorpora el patrón de razonamiento explícito (chain-of-thought) característico de la familia R1. El ajuste fino de Selyviel se realizó con Unsloth, según indica la propia model card ("trained 2x faster with Unsloth"), y parte de la versión del modelo base ya cuantizada en 4 bits mediante bitsandbytes.

No se dispone de información sobre el dataset de ajuste fino, el número de tokens utilizados, la composición de los datos médicos, ni si se aplicaron técnicas de RLHF o DPO. La model card es mínima y no documenta hiperparámetros, épocas ni metodología de evaluación. El tag `trl` sugiere el uso de la librería TRL de Hugging Face para el entrenamiento, y `text-generation-inference` indica compatibilidad con TGI, pero no se aportan más detalles técnicos.

## Capacidades

- Generación de texto en inglés con razonamiento explícito tipo chain-of-thought, heredado del modelo base DeepSeek-R1-Distill-Llama-8B.
- Razonamiento médico orientado a escenarios clínicos (diagnóstico, recomendaciones de tratamiento), según la descripción del modelo de nombre similar encontrado en la búsqueda web; no se verifica en la model card del autor.
- Compatibilidad con `transformers` y con `text-generation-inference` (TGI), según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el patrón CoT del modelo base lo hace plausible.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia a la documentación clínica: el modelo puede generar borradores de notas clínicas o resúmenes de casos en inglés, aprovechando su ajuste orientado a razonamiento médico y su cadena de pensamiento explícita para justificar las conclusiones.
- Formación y simulación clínica: útil para generar explicaciones paso a paso de razonamientos diagnósticos en entornos educativos, donde la traza de razonamiento es tan relevante como la respuesta final.
- Prototipado de chatbots de triaje: al ser un modelo de 8B, puede desplegarse en infraestructura modesta para experimentar con flujos de preguntas-respuestas médicas antes de invertir en modelos mayores.
- Investigación sobre destilación y ajuste fino: sirve como caso de estudio de fine-tuning con Unsloth sobre un modelo destilado de razonamiento, útil para reproducir pipelines de entrenamiento de bajo coste.
- Generación de preguntas y respuestas médicas para datasets sintéticos: puede emplearse para ampliar corpus de entrenamiento en inglés con razonamiento CoT, siempre con revisión humana posterior.
- Evaluación comparativa de ajustes comunitarios: como punto de partida para medir la degradación o mejora respecto al modelo base en tareas médicas, dado que comparte arquitectura y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 8B, en FP16 requiere aproximadamente 16 GB de VRAM; en cuantización de 4 bits, en torno a 5-6 GB. El repositorio publicado ocupa 0,2 GB, lo que sugiere que los pesos completos no están incluidos y habrá que reconstruirlos o combinar adaptadores con el modelo base.
- GPU recomendadas: A100 o H100 para servicio en producción con FP16 y concurrencia; RTX 4090 (24 GB) para FP16 en una sola GPU; RTX 3090/4080 (16-24 GB) para cuantizaciones de 8 bits.
- GPU de consumo: sí cabe en GPUs de consumo con cuantización 4 bits (RTX 3060 de 12 GB en adelante), siempre que se disponga del modelo base completo.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF a partir del modelo base y los adaptadores; vLLM no está confirmado en los tags.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Selyviel/DeepSeek-R1-Medical-COT | 8B | no disponible | apache-2.0 | Hugging Face, 0 descargas | Ajuste comunitario sin benchmarks |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8B | 128K (según la familia R1-Distill) | MIT (modelo original de DeepSeek) | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados por DeepSeek |
| unsloth/DeepSeek-R1-Distill-Llama-8B-unsloth-bnb-4bit | 8B | 128K (heredado) | apache-2.0 (según el repo de Unsloth) | Hugging Face | Versión cuantizada en 4 bits para fine-tuning con Unsloth |
| Meta-Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face | Alternativa generalista sin razonamiento CoT nativo |

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluación clínica: no hay evidencia publicada de que el ajuste fino mejore al modelo base en tareas médicas.
- Riesgo elevado de alucinación en dominios médicos: un modelo de 8B ajustado sin validación puede generar recomendaciones clínicas incorrectas; no debe usarse en decisiones sanitarias sin supervisión profesional.
- Sesgos desconocidos: no se documenta la composición del dataset de ajuste fino, por lo que no se pueden evaluar sesgos demográficos, culturales o de género.
- Idioma: solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base original de DeepSeek (MIT) y de la versión de Unsloth.
- Tamaño del repositorio (0,2 GB) inconsistente con un modelo de 8B completo: es probable que falten pesos o que solo se hayan publicado adaptadores; hay que revisar los archivos antes de usarlo en producción.
- Sin mantenimiento ni comunidad: cero descargas y cero likes en la fecha de consulta, lo que reduce la probabilidad de corrección de errores.
- No confundir con otros modelos homónimos de terceros que también se denominan "DeepSeek-R1-Medical-COT".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Selyviel/DeepSeek-R1-Medical-COT
- Modelo base en Hugging Face: https://huggingface.co/unsloth/DeepSeek-R1-Distill-Llama-8B-unsloth-bnb-4bit
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo homónimo de otro autor (referencia): https://huggingface.co/ashad846004/DeepSeek-R1-Medical-COT
