# Charlie320/zils-mini-ml12

## Resumen

zils-mini-ml12 es un fine-tune de Qwen/Qwen3.5-4B publicado por el usuario Charlie320 dentro del ecosistema Zils, un conjunto de modelos de decisión asociados al subred 127 de Bittensor. El modelo se presenta como un "body" (cuerpo) del pool de soups d3-mini: parte de la media uniforme de pesos de tres modelos previos (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b) y se entrena mediante doce fine-tunes LoRA independientes que después se promedian.

La arquitectura subyacente es la de Qwen3.5-4B, un transformer de aproximadamente 4.540 millones de parámetros en BF16, con la torre de visión heredada del modelo padre y pesos de lenguaje entrenados. El modelo está orientado a tareas de decisión en formato de examen (exam-format items) y a la clasificación de decisiones tipadas, más que a la generación abierta de texto.

Es relevante ahora porque ilustra una práctica creciente en el ecosistema open source: la construcción de modelos mediante model soups y self-distillation sobre pesos agregados, con licencia Apache 2.0 y pesos en safetensors. No obstante, la información pública es muy escasa: no hay benchmarks, no se declaran idiomas soportados y el pipeline no está especificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B), con torre de visión heredada del padre |
| Parámetros totales | 4.539.265.536 (≈4,54 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-4B en el "chassis layout" del ecosistema Zils, con los pesos de lenguaje entrenados y la torre de visión tomada del modelo padre. El punto de partida es la media uniforme de los pesos de los tres bodies del soup d3-mini vigente (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b). Sobre esa media se ejecutan doce fine-tunes LoRA de rango 64, fusionados y entrenados cada uno con una semilla distinta y una pasada barajada sobre el conjunto de datos, a una tasa de aprendizaje de 5e-5; los doce resultados se promedian uniformemente con pesos iguales.

El entrenamiento usa objetivos suaves (soft targets). Para los ítems en formato de examen, el objetivo es únicamente la probabilidad de respuesta del propio modelo de partida (self-distillation anchor), sin usar sus etiquetas. Para las filas de tasksource-jev, el objetivo es una mezcla al 50 % entre la etiqueta de la fila y la probabilidad de respuesta del modelo de partida. El conjunto de datos suma 61.091 filas: aproximadamente 31.100 ítems de decisión en formato de examen de las familias de tareas conocidas, redactados con la receta pública Zils (scripts/author_exam.py) por Claude Opus y por un modelo open local a partir de splits de entrenamiento de datasets públicos, incluyendo unos 1.100 ítems de tool-call derivados de las filas 90.000-93.000 del subconjunto de function calling de glaiveai/glaive-function-calling-v2; y 30.000 filas del split de entrenamiento de tasksource/tasksource-jev-typed-decisions con sus etiquetas, restringidas a fuentes con licencia comercial o no especificada (excluidas las no comerciales y las que coinciden con tareas de BIG-bench). No se usaron ítems de examen del validador, ni ítems públicos de seed, ni datos de clientes.

## Capacidades

- Clasificación y decisión en formato de examen: el modelo está entrenado específicamente para responder ítems de decisión de familias de tareas conocidas del ecosistema Zils.
- Decisiones tipadas: entrenado sobre tasksource/tasksource-jev-typed-decisions, lo que le permite producir decisiones con tipado explícito.
- Tool calling / function calling: el dataset incluye unos 1.100 ítems de llamada a funciones derivados de glaive-function-calling-v2, por lo que el modelo ha visto ese formato.
- Capacidades de visión: hereda la torre de visión del modelo padre Qwen3.5-4B, aunque no se documenta el alcance exacto de su funcionamiento tras el fine-tune.
- Generación de texto: capacidad heredada de la base Qwen3.5-4B, no reforzada específicamente por este fine-tune.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Razonamiento multi-step y modo thinking: no documentados para este fine-tune.

## Casos de uso

- Evaluación automática de ítems de decisión: el modelo puede usarse como clasificador de ítems en formato de examen de las familias de tareas Zils, aprovechando que fue entrenado con la receta pública de autoría y con self-distillation sobre el modelo de partida.
- Clasificación de decisiones tipadas en pipelines de datos: integrable como componente de etiquetado sobre el esquema de tasksource-jev-typed-decisions, con salidas tipadas que facilitan el parseo posterior.
- Enrutamiento de llamadas a funciones: los ítems de tool-call de glaive-function-calling-v2 permiten usar el modelo como selector de función o generador de argumentos en un agente ligero, aunque requiere validación adicional en producción.
- Investigación sobre model soups: sirve como caso de estudio reproducible de la técnica de promediado de LoRA con distintas semillas sobre una media de pesos, útil para estudiar estabilidad y varianza del entrenamiento.
- Baseline en competiciones de subred Bittensor: puede emplearse como punto de partida o referencia en el pool d3-mini de la subred 127, dado que su procedencia y receta están documentadas.
- Experimentos de self-distillation: el esquema de objetivos suaves (ancla de auto-destilación más mezcla al 50 % con etiquetas) es reutilizable para estudiar cómo preservar el comportamiento del modelo de partida mientras se incorpora señal supervisada.
- Prototipado de modelos multimodales ligeros: al conservar la torre de visión del padre, puede servir para experimentos exploratorios de decisión con entrada visual, siempre que se valide su comportamiento tras el fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB, aunque no se publican versiones GGUF ni cuantizadas oficiales.
- GPU recomendadas: A100 40 GB u H100 para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 con contexto moderado.
- GPU de consumo: cabe en tarjetas de 16 GB o más en BF16 con contexto limitado; en 8 bits podría caber en 8-12 GB, pero sin pesos cuantizados publicados requiere cuantización manual.
- Opciones de despliegue: vLLM, TGI y llama.cpp son compatibles con safetensors de arquitectura Qwen, aunque no hay configuración oficial publicada para este modelo; Ollama requeriría convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-ml12 | ≈4,54 B | No disponible | Apache 2.0 | Hugging Face (0 descargas, 0 likes) | Fine-tune de decisión sobre Qwen3.5-4B con soup de LoRA |
| Qwen/Qwen3.5-4B | ≈4 B (no confirmado) | No disponible | No disponible en la información | Hugging Face | Modelo base; capacidades generales de texto y visión |
| Zayaan/zils-mini-hm4 | No disponible | No disponible | No disponible | Hugging Face | Body previo del mismo pool d3-mini |
| qhoenix/zils-mini-decision-t2avg | No disponible | No disponible | No disponible | Hugging Face | Body previo del mismo pool d3-mini |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas de MMLU, HumanEval, GSM8K ni de las tareas de decisión objetivo, lo que impide evaluar su calidad frente a alternativas.
- Riesgo de alucinación: al ser un fine-tune de un modelo generativo de 4 B, puede producir respuestas plausibles pero incorrectas, especialmente fuera de las familias de tareas vistas en entrenamiento.
- Sesgos: no documentados; los datos de entrenamiento provienen de datasets públicos y de ítems generados por Claude Opus y un modelo open local, lo que puede introducir sesgos de esos generadores.
- Idiomas: no se declaran idiomas soportados; el entrenamiento se centró en tareas de decisión, no en cobertura lingüística.
- Contexto: no se especifica la longitud de contexto efectiva tras el fine-tune; no debe asumirse la del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero la model card advierte de que los términos de los datasets de origen deben verificarse antes de reutilizar; además, el dataset de tasksource se filtró a fuentes con licencia comercial o no especificada, lo que deja incertidumbre sobre algunas filas.
- Procedencia y reproducibilidad: el modelo tiene 0 descargas y 0 likes, fue creado y actualizado el mismo día (16 de noviembre de 2026) y no incluye pipeline declarado; su madurez y validación externa son nulas.
- Uso previsto restringido: está diseñado como body de un pool de soups para tareas de decisión, no como asistente general; usarlo para generación abierta o agentes autónomos en producción requiere evaluación propia.
- Dependencia del modelo de partida: el ancla de self-distillation preserva el comportamiento del promedio inicial, de modo que los errores del punto de partida pueden persistir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-ml12
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Body previo 1: https://huggingface.co/Zayaan/zils-mini-hm4
- Body previo 2: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Body previo 3: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset de function calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
