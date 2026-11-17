# Charlie320/zils-mini-mc2

## Resumen

zils-mini-mc2 es un fine-tune de Qwen/Qwen3.5-4B publicado por el usuario Charlie320 bajo licencia Apache 2.0. Forma parte del pool de "soup" del modelo Zils `d3-mini`, asociado a la subnet 127 de Bittensor, una red descentralizada de cómputo e incentivos para modelos de IA. El modelo se presenta como un "body" (cuerpo) del citado pool, es decir, una de las variantes que se combinan y evalúan dentro de ese ecosistema. El repositorio contiene únicamente pesos, en formato safetensors y precisión BF16, con un total de 4.539.265.536 parámetros.

La propuesta del modelo es un ajuste fino por "soup": se parte de la media uniforme de los pesos de tres cuerpos previos del pool (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b) y se realizan dos fine-tunes LoRA de rango 64 (fusionados) sobre esa media, cada uno con una semilla distinta y una pasada barajada sobre 61.091 filas de entrenamiento, para después promediar ambos resultados con pesos iguales. El objetivo declarado es un modelo de decisión ("decision-model") orientado a tareas de examen y clasificación con etiquetas suaves.

La relevancia de esta ficha es doble: por un lado, documenta una técnica concreta de model merging y entrenamiento con targets suaves sobre una base de 4B; por otro, advierte de que el modelo no aporta benchmarks públicos, no declara idiomas soportados y su uso está condicionado por las licencias de los datasets de origen. Es, por tanto, un artefacto experimental de un ecosistema de competición más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-4B); incluye torre de visión heredada del modelo padre |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,5 mil millones de parámetros, e incorpora la torre de visión del modelo padre, por lo que mantiene capacidad multimodal de entrada de imagen aunque el entrenamiento descrito se centra en pesos de lenguaje. Los pesos se distribuyen en BF16 y el repositorio ocupa 9,1 GB.

El procedimiento de entrenamiento es un "soup fine-tune" en tres fases. Primero se calcula la media uniforme de los pesos de tres cuerpos del pool d3-mini (Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b). Sobre esa media se ejecutan dos fine-tunes LoRA de rango 64, fusionados tras el entrenamiento, cada uno con una semilla distinta y una única pasada barajada sobre 61.091 filas con learning rate 5e-5; finalmente se promedian ambos resultados con pesos iguales. Los targets son suaves: para los ítems en formato de examen, tres cuartas partes de la probabilidad de la respuesta propia del ítem y una cuarta parte de la probabilidad de respuesta del modelo de partida; para las filas de tasksource-jev, mitad y mitad entre la etiqueta de la fila y la probabilidad del modelo de partida.

Los datos de entrenamiento se componen de dos bloques. El primero, unos 31.100 ítems de decisión en formato de examen de las familias de tareas conocidas, generados con la receta pública de autoría de Zils (scripts/author_exam.py) por Claude Opus y por un modelo abierto local, a partir de splits de entrenamiento de datasets públicos; incluye unos 1.100 ítems de tool-call extraídos de las filas 90.000-93.000 del subconjunto de function calling de glaiveai/glaive-function-calling-v2. El segundo bloque son 30.000 filas del split de entrenamiento de tasksource/tasksource-jev-typed-decisions con sus etiquetas, restringidas a fuentes con metadatos de licencia comercial o no especificada, excluyendo fuentes no comerciales y descartando las que coinciden con tareas de BIG-bench. El autor declara no haber usado ítems de examen del validador, ni ítems de examen semilla públicos, ni datos de clientes.

## Capacidades

- Toma de decisiones y clasificación: el modelo está entrenado específicamente para responder ítems en formato de examen y filas de decisión tipadas, con etiquetas suaves, lo que lo orienta a tareas de elección entre opciones y categorización.
- Tool calling / function calling: se incluyeron aproximadamente 1.100 ítems de tool-call en el entrenamiento, procedentes de glaive-function-calling-v2, por lo que el modelo ha visto ejemplos de invocación de funciones.
- Razonamiento y generación de texto: capacidades heredadas de la base Qwen/Qwen3.5-4B; no se detallan en la model card.
- Capacidad multimodal de entrada: conserva la torre de visión del modelo padre, aunque no se especifica el alcance ni la calidad de dicha capacidad tras el fine-tune.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo de pensamiento (thinking mode): no disponible.
- Soporte de agentes multi-paso: no disponible de forma explícita; la presencia de ítems de tool-call sugiere cierta familiaridad, pero no se documenta.

## Casos de uso

- Clasificación de decisiones tipadas en pipelines de datos: el modelo puede emplearse para asignar etiquetas a filas con esquemas predefinidos, aprovechando el entrenamiento sobre tasksource-jev-typed-decisions; encaja en procesos de enriquecimiento por lotes donde la salida es una categoría y no texto libre.
- Evaluación automática de ítems tipo examen: dado su entrenamiento con ítems en formato de examen y targets suaves, puede usarse como modelo de referencia para puntuar o generar respuestas en bancos de preguntas de opción múltiple.
- Enrutamiento de llamadas a herramientas: los ejemplos de tool-call incluidos permiten usarlo como componente de selección de función en un agente, decidiendo qué herramienta invocar ante una petición del usuario.
- Prototipado de modelos de decisión en investigación: sirve como punto de partida reproducible para estudiar técnicas de model soup y targets suaves sobre una base de 4B, dado que el procedimiento está descrito con detalle.
- Experimentación en el ecosistema Bittensor subnet 127: el modelo está pensado como cuerpo del pool d3-mini, por lo que su uso natural es participar en las evaluaciones y combinaciones de dicho pool.
- Base para fine-tunes posteriores: al ser un merge de tres cuerpos con licencia Apache 2.0, puede servir como inicialización para ajustes específicos de dominio, siempre que se respeten las licencias de los datasets de origen.
- Inferencia multimodal exploratoria: la torre de visión heredada permite probar tareas de imagen-texto, aunque sin garantías documentadas sobre su rendimiento tras el fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 10 y 12 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 3 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40 GB, H100 o L40S para despliegue en BF16 con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para una instancia en BF16.
- GPU de consumo: cabe en tarjetas con 12 GB o más en BF16 (RTX 4070 Ti, RTX 4080), y en 8 GB si se cuantiza a 8 bits; en 4 bits podría caber en 6 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles en principio al ser un transformer estándar con pesos safetensors, aunque no hay conversiones GGUF publicadas en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-mc2 | 4,54 B | no disponible | Apache 2.0 | Hugging Face, pesos safetensors | Fine-tune de decisión sobre Qwen3.5-4B; sin benchmarks |
| Qwen/Qwen3.5-4B | ~4 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base del que deriva; capacidades generales |
| Zayaan/zils-mini-hm4 | no disponible | no disponible | no disponible | Hugging Face | Cuerpo previo del pool d3-mini, usado como fuente del merge |
| qhoenix/zils-mini-decision-t2avg | no disponible | no disponible | no disponible | Hugging Face | Cuerpo previo del pool d3-mini, usado como fuente del merge |

La comparación con modelos de propósito general de tamaño similar (por ejemplo, familias de 3-4B ampliamente documentadas) no es posible con rigor porque no se han publicado métricas de zils-mini-mc2 ni de sus cuerpos predecesores en la información disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de las evaluaciones del propio pool, por lo que no puede verificarse su calidad frente a la base Qwen3.5-4B.
- Sesgos desconocidos: los datasets de origen (glaive-function-calling-v2, tasksource-jev-typed-decisions y las fuentes de los ítems de examen) pueden introducir sesgos de dominio, idioma y formato que el autor no documenta.
- Riesgo de alucinación: al ser un modelo de 4B ajustado con targets suaves y sin RLHF documentado, la probabilidad de respuestas plausibles pero incorrectas en tareas abiertas es relevante.
- Idiomas no declarados: no se especifica qué lenguas cubre el entrenamiento; el uso en castellano no está garantizado.
- Contexto no documentado: se desconoce la longitud de contexto efectiva tras el fine-tune, lo que dificulta planificar despliegues con ventanas largas.
- Restricciones de licencia de los datos: aunque los pesos son Apache 2.0, el autor advierte de que se consulten los términos de los datasets de origen antes de reutilizar el modelo; algunas fuentes fueron excluidas por licencia no comercial, pero la trazabilidad completa no se detalla.
- Procedencia experimental: es un artefacto de un pool de competición (Bittensor subnet 127) con 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Capacidad de visión no verificada: la torre de visión se hereda del padre, pero no se documenta si el fine-tune preserva su rendimiento.
- Sin versiones cuantizadas oficiales: el repositorio solo contiene safetensors en BF16, por lo que el despliegue en hardware limitado requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-mc2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo previo del pool: https://huggingface.co/Zayaan/zils-mini-hm4
- Cuerpo previo del pool: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Cuerpo previo del pool: https://huggingface.co/joamCriff123/zils-mini-m1113b
- Dataset de tool calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
