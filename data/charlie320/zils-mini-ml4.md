# Charlie320/zils-mini-ml4

## Resumen

zils-mini-ml4 es un modelo de decisión de 4.539 millones de parámetros publicado por el usuario Charlie320 en Hugging Face, construido como un fine-tune del modelo base Qwen/Qwen3.5-4B. Forma parte del ecosistema "Zils" orientado al pool de modelos tipo soup de la subred 127 de Bittensor, un entorno donde distintos autores contribuyen "cuerpos" (bodies) que se combinan mediante promediado de pesos. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors BF16.

El punto de partida no es el modelo base puro, sino el promedio uniforme de tres cuerpos previos del pool d3-mini (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b). Sobre ese promedio se aplicaron cuatro fine-tunes LoRA de rango 64, cada uno con una semilla distinta y una pasada barajada sobre 61.091 filas, cuyos pesos resultantes se promediaron de nuevo con pesos iguales. El resultado es un modelo especializado en tareas de decisión con formato de examen, incluyendo ítems de tool calling.

La relevancia del modelo es acotada y muy específica: se trata de un artefacto de investigación dentro de un pool competitivo de modelos, no de un modelo generalista pensado para producción. Su interés radica en documentar una técnica de "soup fine-tune" con destilación automática (self-distillation) sobre un promedio de pesos, y en servir como cuerpo candidato dentro del ecosistema Bittensor subnet 127.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-4B, con torre de visión heredada del padre) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Qwen/Qwen3.5-4B, incluyendo su torre de visión, que se mantiene del padre. El entrenamiento consistió en un "soup fine-tune": se partió del promedio uniforme de los tres cuerpos del pool d3-mini, se realizaron cuatro fine-tunes LoRA de rango 64 (fusionados) con semillas distintas, cada uno con una pasada barajada sobre 61.091 filas a una tasa de aprendizaje de 5e-5, y finalmente se promediaron los cuatro resultados con pesos iguales.

Los objetivos de entrenamiento fueron suaves (soft targets). Para los ítems con formato de examen (aproximadamente 31.100), se usaron únicamente las probabilidades de respuesta del propio modelo de partida, como ancla de auto-destilación que preserva su comportamiento, sin emplear las etiquetas. Para las filas de tasksource-jev (30.000), el objetivo fue la mezcla a partes iguales entre la etiqueta de la fila y las probabilidades de respuesta del modelo de partida. Los datos de examen se generaron con la receta pública de autoría de Zils (scripts/author_exam.py) por Claude Opus y un modelo abierto local, a partir de splits de entrenamiento de datasets públicos, incluyendo unos 1.100 ítems de tool calling extraídos de las filas 90.000-93.000 del subconjunto de function calling de glaiveai/glaive-function-calling-v2. No se usaron ítems de examen del validador, ítems de examen semilla públicos ni datos de clientes.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen/Qwen3.5-4B.
- Toma de decisiones en formato de examen: el modelo está entrenado específicamente para responder ítems de las familias de tareas conocidas del pool Zils.
- Tool calling / function calling: incluye aproximadamente 1.100 ítems de entrenamiento de llamada a funciones derivados de glaive-function-calling-v2.
- Capacidades de visión: la torre de visión se hereda del modelo padre, aunque no se detalla su rendimiento tras el fine-tune.
- Capacidades multilingües: no disponibles (no se especifican idiomas en la información).
- Modo de pensamiento (thinking mode): no disponible en la información.

## Casos de uso

- Investigación sobre técnicas de model soup: el modelo sirve como caso de estudio reproducible de promediado de pesos combinado con fine-tunes LoRA y auto-destilación, útil para grupos que investigan la fusión de modelos.
- Evaluación de cuerpos en pools Bittensor: puede desplegarse como candidato en la subred 127 para medir su rendimiento frente a otros cuerpos del pool d3-mini en las tareas de examen del validador.
- Clasificación y decisión estructurada: los ítems de tasksource-jev-typed-decisions con los que se entrenó sugieren uso en tareas de decisión tipadas, como elegir entre opciones predefinidas en un pipeline.
- Experimentos de tool calling controlado: los ítems de function calling permiten probar la selección de funciones en escenarios acotados, siempre con validación adicional.
- Base para fine-tunes posteriores: al ser un promedio de cuerpos con licencia Apache 2.0, puede servir de punto de partida para nuevos fine-tunes dentro del ecosistema.
- Estudio de self-distillation: el esquema de objetivos suaves (probabilidades del modelo de partida como ancla) es replicable para analizar cómo preservar comportamiento al fusionar modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB; en 4 bits, alrededor de 3 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 o H100 para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) para BF16 con margen amplio; RTX 3090 (24 GB) igualmente viable.
- GPU de consumo: cabe en tarjetas de 12 GB o más en BF16; en 8 bits o 4 bits podría caber en GPUs de 8 GB, aunque no hay datos publicados de latencia ni throughput.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se genere la cuantización GGUF correspondiente (no incluida en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-ml4 | 4.539 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune soup especializado en decisiones |
| Qwen/Qwen3.5-4B | ~4 B | no disponible | no disponible en la información | Hugging Face | Modelo base del que deriva |
| Zayaan/zils-mini-hm4 | no disponible | no disponible | no disponible | Hugging Face | Cuerpo previo del pool d3-mini |
| qhoenix/zils-mini-decision-t2avg | no disponible | no disponible | no disponible | Hugging Face | Cuerpo previo del pool d3-mini |

La comparación con alternativas generalistas de tamaño similar (por ejemplo, modelos de 4 B de otras familias) no está disponible en la información proporcionada, y no se han publicado métricas que permitan situar a zils-mini-ml4 frente a ellas.

## Limitaciones y advertencias

- Modelo de nicho: está entrenado para ítems de decisión con formato de examen del pool Zils; su comportamiento fuera de ese dominio no está evaluado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación; al ser un fine-tune con objetivos suaves, puede reproducir sesgos del modelo de partida.
- Sesgos conocidos: no documentados por el autor; los datasets de origen (tasksource, glaive) pueden introducir sesgos propios.
- Idiomas: no se especifican idiomas soportados; no hay garantía de rendimiento multilingüe más allá de lo que herede de Qwen3.5-4B.
- Contexto: la longitud de contexto no está documentada; no debe asumirse la del modelo base sin verificación.
- Licencia: Apache 2.0 para los pesos, pero el autor advierte de que deben revisarse los términos de los datasets de origen antes de reutilizar; además, tasksource-jev se filtró para excluir fuentes no comerciales, lo que conviene verificar.
- Datos de entrenamiento generados por modelos: parte de los ítems de examen fueron escritos por Claude Opus y un modelo abierto local, lo que puede introducir errores sistemáticos en las etiquetas suaves.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria ni resultados de benchmarks publicados.
- Uso comercial: aunque la licencia lo permite, la procedencia mixta de los datos y la falta de evaluación hacen recomendable una auditoría previa antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-ml4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo previo 1: https://huggingface.co/Zayaan/zils-mini-hm4
- Cuerpo previo 2: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Cuerpo previo 3: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Dataset de decisiones: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de function calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
