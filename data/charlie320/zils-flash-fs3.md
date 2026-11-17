# Charlie320/zils-flash-fs3

## Resumen

zils-flash-fs3 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario Charlie320 y publicado bajo licencia Apache-2.0. Se presenta como un "body" (cuerpo) destinado al pool de modelos tipo "soup" denominado d3-flash, asociado a la subred 127 de Bittensor. El modelo parte de vllm-sr/d3-flash, que a su vez se construye sobre Qwen3.5-9B, y se ha entrenado mediante la fusión de tres LoRA de rango 32 con distintas semillas, promediadas uniformemente.

El modelo tiene 8.392.695.024 parámetros totales (aproximadamente 8,4 mil millones) y se distribuye en formato safetensors en BF16, con un tamaño de repositorio de 16,8 GB. Incluye pesos de lenguaje entrenados y una torre de visión heredada del modelo padre. Está etiquetado como "decision-model", lo que sugiere que su propósito principal es la toma de decisiones en formato de examen (clasificación o selección de respuestas), más que la generación de texto libre.

La relevancia de este modelo es limitada y muy específica: se trata de un artefacto de investigación dentro de un ecosistema de subred de Bittensor, con cero descargas y cero "likes" en el momento de la consulta. No dispone de pipeline declarado, idiomas documentados ni resultados de benchmarks publicados. Su interés reside en la técnica de destilación y fusión de LoRA empleada, no en un uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B); incluye torre de visión heredada del modelo padre |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-9B, un transformer de aproximadamente 8,4 mil millones de parámetros. El modelo conserva la torre de visión del modelo padre, aunque la model card no detalla si dicha torre fue reentrenada o permanece congelada. El entrenamiento se realizó en BF16 y los pesos de lenguaje sí fueron entrenados.

El procedimiento de entrenamiento consistió en tres ajustes finos LoRA de rango 32, con semillas distintas, fusionados (merged) y promediados uniformemente con pesos iguales. Cada semilla realizó una pasada barajada sobre aproximadamente 46.100 filas con una tasa de aprendizaje de 5e-5. Los objetivos de entrenamiento fueron "soft": para los ítems escritos, una cuarta parte de la respuesta propia del ítem y tres cuartas partes de las probabilidades de respuesta del promedio "soup" actual de d3-mini (destilación de profesor desde el pool d3-mini, que es la media uniforme de Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b); para las filas sin etiqueta, únicamente las probabilidades del promedio soup de d3-mini.

Los datos de entrenamiento se componen de dos bloques: (1) aproximadamente 31.100 ítems de decisión en formato de examen de las familias de tareas conocidas, escritos con la receta pública de autoría de Zils (scripts/author_exam.py) por Claude Opus y por un modelo abierto local, a partir de particiones de entrenamiento de los conjuntos de datos fuente públicos, incluyendo unos 1.100 ítems de llamada a herramientas escritos a partir de las filas 90.000-93.000 del subconjunto de function-calling de glaiveai/glaive-function-calling-v2; y (2) 15.000 filas de la partición de entrenamiento de tasksource/tasksource-jev-typed-decisions, usadas solo como entradas de destilación sin etiqueta (las etiquetas no se usaron; se excluyeron fuentes con metadatos de licencia comercial o no especificada, y fuentes no comerciales). No se usaron ítems de examen de validador, ni ítems de examen semilla públicos, ni datos de clientes.

## Capacidades

- Toma de decisiones en formato de examen: el modelo está entrenado específicamente para ítems de decisión de familias de tareas conocidas, con objetivos soft de destilación.
- Llamada a herramientas (tool calling): se incluyeron aproximadamente 1.100 ítems de llamada a herramientas derivados de glaive-function-calling-v2, por lo que se espera cierta capacidad en este ámbito, aunque no se documenta su rendimiento.
- Visión: hereda la torre de visión del modelo padre Qwen/Qwen3.5-9B, si bien no se especifica el grado de conservación ni su calidad tras el ajuste.
- Generación de texto y razonamiento: capacidad heredada de Qwen3.5-9B, no verificada ni documentada en esta ficha.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Modo "thinking" o razonamiento multi-paso: no disponible en la información proporcionada.
- Soporte de agentes: no documentado; la presencia de ítems de tool calling sugiere un uso potencial, pero sin datos de evaluación.

## Casos de uso

- Evaluación de decisiones en formato de examen: el modelo puede emplearse para responder ítems de decisión de las familias de tareas de Zils, ya que fue entrenado explícitamente con esa receta y objetivos soft. Es adecuado para experimentar con la técnica de destilación desde el pool d3-mini.
- Investigación sobre fusión de LoRA: sirve como artefacto de estudio para analizar el efecto del promediado uniforme de tres LoRA de rango 32 con semillas distintas sobre un modelo base de 8,4 mil millones de parámetros.
- Destilación de profesor a alumno: el modelo puede actuar como alumno en pipelines de destilación soft, replicando el esquema de una cuarta parte de respuesta propia y tres cuartas partes de probabilidades del profesor.
- Pruebas de tool calling en entornos controlados: gracias a los ítems de llamada a herramientas incluidos en el entrenamiento, puede probarse en tareas de selección de función y argumentos, siempre con validación adicional dado que no hay benchmarks publicados.
- Experimentación con modelos de visión heredados: al conservar la torre de visión del padre, puede usarse para comprobar si las capacidades visuales se mantienen tras el ajuste de los pesos de lenguaje.
- Integración en la subred 127 de Bittensor: el modelo está diseñado como "body" para el pool d3-flash, por lo que su uso previsto es participar en dicho ecosistema de modelos tipo soup.
- Reproducción de experimentos de autoría de exámenes: junto con la receta pública scripts/author_exam.py, permite reproducir o extender la generación de ítems de decisión con modelos como Claude Opus o modelos abiertos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,8 GB solo para los pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8,4 GB para pesos, más overhead; en 4 bits, alrededor de 4,2 GB para pesos, más overhead. No se documentan cuantizaciones oficiales, por lo que estas cifras son estimaciones basadas en el número de parámetros.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para BF16 sin restricciones; RTX 4090 (24 GB) para BF16 con contexto limitado o para cuantizaciones de 8 bits.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con gestión cuidadosa de la memoria, y en GPUs de 16 GB o menos solo mediante cuantización (no oficial).
- Opciones de despliegue: al ser un modelo derivado de Qwen3.5-9B con pesos safetensors, es compatible potencialmente con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión). No se documenta compatibilidad oficial con ninguna de ellas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-flash-fs3 | 8.392.695.024 | no disponible | sin benchmarks publicados | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-9B (modelo base) | ~9B (no confirmado en la informacion) | no disponible | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| vllm-sr/d3-flash (modelo de partida) | no disponible | no disponible | no disponible | apache-2.0 (segun la model card) | Hugging Face |
| Zayaan/zils-mini-hm4 (profesor del pool) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de Qwen3.5-9B y de datos de destilación, puede heredar sesgos del modelo base y del profesor, pero no se especifican.
- Riesgo de alucinación: no evaluado. El entrenamiento con objetivos soft y datos de examen no garantiza robustez en generación libre; el uso fuera de las familias de tareas de decisión puede producir salidas poco fiables.
- Limitaciones de contexto e idioma: no se documenta la longitud de contexto ni los idiomas soportados, lo que impide garantizar su comportamiento en contextos largos o en castellano.
- Restricciones de licencia: la licencia del repositorio es Apache-2.0, pero la model card advierte de que se consulten los términos de los conjuntos de datos fuente antes de reutilizar el modelo. Algunas fuentes fueron excluidas por metadatos de licencia comercial o no especificada, pero la responsabilidad de verificación recae en el usuario.
- Caveat para producción: el modelo tiene cero descargas y cero "likes", no dispone de pipeline declarado ni benchmarks, y está orientado a un pool específico de Bittensor. No se recomienda su uso en producción sin una evaluación propia exhaustiva.
- Uso previsto restringido: está diseñado como "body" para el pool d3-flash de la subred 127; su empleo fuera de ese contexto no está validado.
- Torre de visión: se hereda del padre, pero no se documenta si fue entrenada o congelada, por lo que su fiabilidad visual es incierta.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-flash-fs3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo de partida: https://huggingface.co/vllm-sr/d3-flash
- Profesor del pool d3-mini: https://huggingface.co/Zayaan/zils-mini-hm4
- Profesor del pool d3-mini: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Profesor del pool d3-mini: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Conjunto de datos de tool calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Conjunto de datos de destilación sin etiqueta: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
