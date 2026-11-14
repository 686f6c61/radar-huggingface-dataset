# Charlie320/zils-mini-hjos1

## Resumen

zils-mini-hjos1 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario Charlie320 en Hugging Face bajo licencia Apache 2.0. Se presenta como un "body" (cuerpo de pesos) para el pool de mezclas (soup pool) `d3-mini` de Zils, asociado a la subred 127 de Bittensor. El modelo está etiquetado como `decision-model`, lo que indica que su propósito es la toma de decisiones estructuradas y tipadas, no la generación de texto generalista.

El punto de partida es la media uniforme de pesos de dos modelos Apache 2.0 (`vllm-sr/d3-mini` y `torchcast-ai/torchcast-decision-4b`), sobre la que se aplica un único entrenamiento LoRA de rango 64 (anchor 0.1, lr 5e-5) posteriormente fusionado. El resultado es un modelo de aproximadamente 4.539 millones de parámetros (4,54 B) en BF16, con la torre de visión heredada del modelo padre y pesos de lenguaje entrenados.

La relevancia del modelo es acotada y muy específica: forma parte de un ecosistema de evaluación descentralizada (Bittensor) donde distintos "bodies" compiten por resolver tareas de decisión. No está pensado como un modelo de propósito general, sino como un componente dentro de un pipeline de decisión tipada. La información pública disponible es escasa: no hay benchmarks, no se declaran idiomas soportados y la model card se limita a describir el proceso de entrenamiento y la procedencia de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen/Qwen3.5-4B); incluye torre de visión del modelo padre |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,54 B de parámetros. El autor describe el resultado como un modelo "en el layout chassis", con pesos de lenguaje entrenados y la torre de visión tomada del modelo padre, lo que sugiere una arquitectura multimodal heredada. No se detalla la configuración interna (número de capas, dimensión oculta, cabezas de atención) ni la longitud de contexto nativa.

El entrenamiento se estructura en dos fases. Primero se calcula la media uniforme de pesos de `vllm-sr/d3-mini` y `torchcast-ai/torchcast-decision-4b` (ambos Apache 2.0, sin participación de "miner bodies"). Después se ejecuta un único LoRA de rango 64 con anchor 0.1 y learning rate 5e-5, fusionado sobre esa media. Los datos de entrenamiento suman aproximadamente 133.000 filas (120.000 vistas en una pasada barajada) y se componen de tres fuentes: (1) ítems de decisión en formato de examen generados con la receta pública `scripts/author_exam.py` por Claude Opus y por un modelo local, más respuestas del profesor público de Zils; (2) 63.840 decisiones tipadas del split de entrenamiento de `tasksource/tasksource-jev-typed-decisions`, filtradas a filas con licencia comercial, texto mayoritariamente ASCII y un máximo de 200 filas por dataset fuente (413 fuentes); (3) unas 24.500 decisiones con resultados conocidos (code review merged/abandoned de Gerrit de AOSP, Wikimedia y OpenStack; reversiones de ediciones en Wikipedia en 9 idiomas y Wikidata; revisiones de Articles for Creation; etiquetas de categoría primaria de arXiv), todas anteriores al 28 de octubre de 2026. No se usaron ítems de examen de validadores, ni ítems semilla públicos, ni datos de clientes.

## Capacidades

- Toma de decisiones tipadas (`decision-model`): el modelo está entrenado específicamente para emitir decisiones estructuradas sobre ítems con formato de examen y decisiones tipadas.
- Razonamiento sobre resultados conocidos: entrenado con registros de decisiones con desenlace (merged/abandoned, revert/no revert, aceptación/rechazo, categorización), lo que orienta su comportamiento hacia la predicción de resultados.
- Capacidad multimodal heredada: incluye la torre de visión del modelo padre Qwen/Qwen3.5-4B, aunque no se documenta su uso en el entrenamiento.
- Capacidades de lenguaje general: heredadas del modelo base Qwen/Qwen3.5-4B, sin evaluación específica publicada en esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; los datos de entrenamiento incluyen Wikipedia en 9 idiomas, pero no se declara cobertura lingüística del modelo.

## Casos de uso

- Predicción de resultados de code review: el modelo se entrenó con desenlaces merged/abandoned de Gerrit (AOSP, Wikimedia, OpenStack), por lo que puede usarse para estimar la probabilidad de que un cambio propuesto sea aceptado o abandonado antes de enviarlo.
- Moderación y revisión de ediciones en Wikipedia/Wikidata: dado su entrenamiento con reversiones de ediciones en 9 idiomas, puede emplearse para señalar ediciones con alta probabilidad de ser revertidas y priorizar la revisión humana.
- Clasificación de categoría primaria de artículos científicos: entrenado con etiquetas de categoría primaria de arXiv, puede usarse como clasificador auxiliar para enrutar preprints al área temática correcta.
- Evaluación de candidaturas en Articles for Creation: puede estimar si una propuesta de artículo de Wikipedia sería aceptada o rechazada en revisión, como filtro previo.
- Componente en pipelines de decisión estructurada: su formato de entrenamiento (decisiones tipadas) lo hace adecuado como módulo de decisión dentro de un sistema mayor que requiera salidas estructuradas y auditables.
- Participación en el pool de evaluación de Bittensor (subred 127): diseñado explícitamente como "body" del pool `d3-mini`, puede desplegarse como participante en tareas de decisión de esa subred.
- Investigación sobre weight averaging y LoRA fusionado: sirve como caso de estudio reproducible de cómo una media de pesos más un LoRA de rango 64 se comporta en tareas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 10 y 12 GB para contextos moderados.
- VRAM estimada en FP16: equivalente a BF16 (~9,1 GB de pesos).
- Cuantización a 8 bits: ~4,5 GB de pesos; a 4 bits: ~2,3 GB de pesos (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con throughput alto; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 sin problema de memoria.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en BF16; en 8 GB requeriría cuantización a 8 o 4 bits.
- Opciones de despliegue: al publicarse en safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama (previa conversión). No se documenta compatibilidad explícita con ninguno.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-hjos1 | 4,54 B | no disponible | Apache 2.0 | Decisiones tipadas (fine-tune) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B | ~4 B | no disponible | no disponible | Lenguaje general (base) | Hugging Face |
| vllm-sr/d3-mini | no disponible | no disponible | Apache 2.0 | Decisiones (house body) | Hugging Face |
| torchcast-ai/torchcast-decision-4b | ~4 B | no disponible | Apache 2.0 | Decisiones | Hugging Face |

La comparación se limita a los modelos declarados como base y origen en la model card. No hay datos de rendimiento comparativo publicados para ninguno de ellos en la información disponible.

## Limitaciones y advertencias

- Sesgos: los datos de entrenamiento provienen de fuentes sesgadas hacia el ecosistema de desarrollo open source (AOSP, Wikimedia, OpenStack) y hacia Wikipedia/Wikidata en 9 idiomas; el modelo puede reproducir sesgos de esas comunidades.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, el riesgo se traslada a decisiones incorrectas con apariencia de confianza.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni cobertura lingüística; los datos de entrenamiento son mayoritariamente ASCII, lo que sugiere un sesgo hacia el inglés.
- Restricciones de licencia: los pesos son Apache 2.0, pero los datos de entrenamiento conservan sus licencias originales (Wikipedia/Wikidata CC BY-SA 4.0, otros bajo términos de sus autores); el autor advierte de revisar los términos de los datasets fuente antes de reutilizar.
- Procedencia: el modelo tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay validación comunitaria ni evaluaciones independientes.
- Uso en producción: sin benchmarks, sin evaluación de robustez y sin documentación de contexto, no es recomendable desplegarlo en producción sin una evaluación propia previa.
- Naturaleza del modelo: es un componente de un ecosistema de competición (Bittensor), no un modelo de propósito general; su comportamiento fuera de las tareas de decisión para las que fue entrenado es incierto.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-hjos1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo de origen: https://huggingface.co/vllm-sr/d3-mini
- Modelo de origen: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
