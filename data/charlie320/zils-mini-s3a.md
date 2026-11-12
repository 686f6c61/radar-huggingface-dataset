# Charlie320/zils-mini-s3a

## Resumen

zils-mini-s3a es un modelo de decisión de 4.539 millones de parámetros publicado por el usuario Charlie320 en Hugging Face, concebido como un "body" (cuerpo de pesos) para el pool de mezclas `d3-mini` del ecosistema Zils, asociado a la subred 127 de Bittensor. Se trata de un fine-tune de Qwen/Qwen3.5-4B en el formato de "chassis" del proyecto, con pesos en BF16 y la torre de visión heredada del modelo padre. Su propósito es resolver tareas de decisión en formato de examen dentro de ese ecosistema, no la generación de texto generalista.

El modelo se ha construido promediando el punto de partida (la media de los miembros del soup mini del 11 de noviembre y el body de la línea propia del autor) con tres ejecuciones de LoRA ancladas de rango 64 con semillas distintas, promediadas entre sí. Los datos de entrenamiento son ítems de decisión en formato de examen generados con la receta pública de autoría de Zils por Claude Opus y por un modelo local abierto, a partir únicamente de splits públicos, más las respuestas del profesor de relevo público de Zils.

La relevancia de este modelo es acotada y muy específica: sirve como pieza intercambiable en un pool de mezclas para una competición de modelos descentralizada. No dispone de model card con especificaciones de contexto, idiomas o benchmarks, y su publicación (12 de noviembre de 2026) no registra descargas ni interacciones. Cualquier evaluación de capacidades generales debe hacerse empíricamente, ya que el autor no aporta datos de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-4B en layout "chassis" de Zils); torre de visión heredada del padre |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (la model card indica "language weights trained" sin detallar idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4.500 millones de parámetros, sobre el que se aplica un fine-tune en el layout de "chassis" del proyecto Zils. El modelo conserva la torre de visión del modelo padre, por lo que mantiene la capacidad multimodal de origen, aunque la model card no detalla cómo se ha entrenado esa torre ni si se ha congelado. Los pesos se distribuyen en BF16 en un repositorio de 9,1 GB.

El entrenamiento parte de un punto inicial que es la media de los 11 miembros del soup mini del 11 de noviembre y el body de la línea propia del autor. Sobre ese punto se ejecutan tres LoRA ancladas de rango 64 con semillas diferentes, cuyos resultados se promedian. Los datos son ítems de decisión en formato de examen, generados con la receta pública `scripts/author_exam.py` por Claude Opus y por un modelo local abierto, restringidos a splits públicos, más las respuestas del profesor de relevo público de Zils. No se emplearon ítems de examen de validador ni ítems semilla públicos. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Tareas de decisión en formato de examen dentro del ecosistema Zils (subred 127 de Bittensor): el modelo está entrenado específicamente para responder ítems de este tipo.
- Procesamiento multimodal: hereda la torre de visión de Qwen/Qwen3.5-4B, aunque no se detalla el alcance ni el estado de entrenamiento de dicha torre.
- Generación de texto y razonamiento general: capacidad heredada del modelo base Qwen3.5-4B, no verificada ni documentada por el autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card menciona "language weights trained" sin especificar idiomas ni niveles de competencia.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Participación en el pool de mezclas `d3-mini` de Zils: el modelo se usa como cuerpo de pesos candidato dentro del soup, promediándose con otros miembros para producir el modelo final del pool. Es su uso previsto y el único documentado por el autor.
- Evaluación de ítems de decisión en formato de examen: sirve para responder preguntas de opción múltiple o formato examen en el marco de la subred 127, gracias a su entrenamiento específico con la receta de autoría pública.
- Investigación sobre model souping: al ser el resultado del promedio de tres LoRA de rango 64 con semillas distintas, es un caso de estudio útil para analizar la estabilidad y el efecto del promediado de adaptadores sobre un mismo punto de partida.
- Experimentación con fine-tuning anclado: permite estudiar cómo un punto de partida compuesto (media de soup más body propio) condiciona el resultado de adaptadores LoRA de rango 64, comparándolo con fine-tunes directos sobre Qwen3.5-4B.
- Prototipado de clasificación y decisión con base multimodal: para tareas internas que requieran decidir entre opciones con entrada de texto e imagen, aprovechando la torre de visión heredada, siempre con validación empírica previa.
- Reproducibilidad de recetas de autoría de datos: los scripts públicos de Zils permiten regenerar ítems de examen similares a los de entrenamiento, lo que facilita auditar el sesgo y la distribución del dataset empleado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9-10 GB solo para los pesos, más overhead de activaciones y caché KV; con contexto largo, el consumo puede superar los 12-14 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB de pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: aproximadamente 3-4 GB de pesos, más overhead; cabe en GPUs de consumo con 8 GB o más.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en BF16 con lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para BF16 con contexto moderado; RTX 4070 Ti / 4080 (16 GB) para BF16 ajustado o cuantización de 8 bits.
- GPU de consumo: sí cabe, en tarjetas con 8 GB o más si se cuantiza a 4 bits; en BF16 requiere al menos 12-16 GB para un uso cómodo.
- Opciones de despliegue: vLLM y TGI para servido en BF16; llama.cpp y Ollama si se generan versiones GGUF (no publicadas en el repositorio); Transformers con `device_map="auto"` para pruebas.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-s3a | 4.539 M | no disponible | Apache 2.0 | Fine-tune de decisión para el pool Zils d3-mini | Hugging Face, safetensors BF16 |
| Qwen/Qwen3.5-4B | ~4.000 M (modelo base) | no disponible en esta ficha | según modelo base | Modelo generalista multimodal | Hugging Face |
| Maincode/Matilda-Decision-v1-Mini | no disponible | no disponible | no disponible | Modelo de decisión, base declarada del fine-tune | Hugging Face |
| PelaAI/KnowLine-4B-Gen5 | ~4.000 M (por nombre) | no disponible | no disponible | Modelo de conocimiento de 4B, base declarada | Hugging Face |

La comparación cuantitativa de rendimiento no es posible: ninguno de los modelos comparables tiene benchmarks publicados en la información disponible, y el autor de zils-mini-s3a no aporta métricas propias.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, por lo que el rendimiento real es desconocido y debe medirse antes de cualquier uso en producción.
- Especialización estrecha: el modelo está entrenado para ítems de decisión en formato de examen del ecosistema Zils; su comportamiento fuera de ese dominio no está documentado y probablemente degrade respecto al modelo base.
- Riesgo de alucinación: no cuantificado; al ser un fine-tune sobre un modelo de 4B sin evaluación publicada, el riesgo es el propio del modelo base más el inducido por el ajuste.
- Sesgos: los datos de entrenamiento fueron generados por Claude Opus y por un modelo local abierto siguiendo una receta concreta, lo que puede introducir sesgos de estilo, distribución y contenido de esos generadores; no se documenta ninguna mitigación.
- Idiomas: la model card no especifica qué idiomas cubren los "language weights trained"; no se debe asumir cobertura multilingüe sin verificación.
- Licencia: Apache 2.0 permite uso comercial, pero el autor advierte de que el repositorio solo contiene pesos y que deben revisarse los términos de los datasets de origen antes de reutilizarlos. Además, la licencia del modelo base Qwen3.5-4B debe respetarse en la medida en que sea aplicable.
- Contexto: no se indica la longitud de contexto soportada; no se debe asumir la del modelo base sin comprobación empírica.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, publicación reciente y sin mantenimiento documentado; no hay garantía de soporte ni de actualizaciones.
- Uso en producción: no recomendado sin una evaluación propia exhaustiva, dado que no existe model card detallada, ni métricas, ni versionado de datos.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-s3a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base declarado: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Modelo base declarado: https://huggingface.co/joamCriff123/zils-mini-sx3
- Modelo base declarado: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Modelo base declarado: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Modelo base declarado: https://huggingface.co/PelaAI/KnowLine-4B-Gen5
- Repositorio de autoría de datos (referenciado en la model card, sin URL): `scripts/author_exam.py` de la receta pública de Zils
- Subred de Bittensor asociada (sin URL en la información): subnet 127
