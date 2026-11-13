# Charlie320/zils-mini-r2a

## Resumen

zils-mini-r2a es un modelo de decisión de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) publicado por el usuario Charlie320 en Hugging Face. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-4B, construido mediante un "soup" (promedio uniforme de pesos) de dos cuerpos del pool z3-mini del proyecto Zils, seguido de un ajuste LoRA de rango 64 con tasa de aprendizaje 5e-5 sobre 60.000 filas aleatorias y posterior fusión de los pesos. El resultado se distribuye en formato BF16 con licencia Apache 2.0.

El modelo está etiquetado como "decision-model" y "soup-body" dentro del ecosistema Zils, asociado al subnet 127 de Bittensor. Su propósito declarado es servir como cuerpo para el pool de soups `d3-mini`, es decir, un componente reutilizable en un pipeline de agregación de modelos más que un asistente conversacional de propósito general. La model card indica que los pesos de lenguaje han sido entrenados y que la torre de visión proviene del modelo padre, lo que sugiere una arquitectura multimodal heredada de Qwen3.5-4B.

La relevancia de este modelo es acotada y muy específica: se enmarca en experimentos de agregación de pesos y fine-tuning sobre datos de "relay" generados por un profesor, con familias de tareas que incluyen razonamiento espacial (StepGame, SpartQA). No obstante, la información pública es extremadamente limitada: cero descargas, cero likes, sin pipeline declarado, sin idiomas especificados y sin resultados de benchmarks. Cualquier evaluación seria requiere probar los pesos directamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de Qwen/Qwen3.5-4B; torre de visión del padre) |
| Parámetros totales | 4.539.265.536 (≈4,54 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parámetros con torre de visión, según se deduce del tamaño real de los safetensors y de la mención explícita a que "la torre de visión proviene del padre". Sobre esa base se aplicó un "soup" inicial: el promedio uniforme de los dos cuerpos actuales del pool z3-mini. A continuación se ejecutó un único ajuste LoRA de rango 64 con tasa de aprendizaje 5e-5 sobre 60.000 filas aleatorias, y los adaptadores se fusionaron en los pesos base, dando lugar a un checkpoint BF16 estándar.

Los datos de entrenamiento son las respuestas del profesor de relay público del proyecto Zils (`zils-relay-answers`): probabilidades del profesor sobre filas públicas de decisión de tasksource, abarcando múltiples familias de tareas, incluido razonamiento espacial como StepGame y SpartQA. La model card afirma que no se usaron ítems del examen del validador ni ítems semilla públicos. No se documentan número total de tokens, composición exacta del dataset, ni si hubo etapas de RLHF o DPO; tampoco se detallan innovaciones técnicas adicionales más allá del propio proceso de soup más LoRA.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-4B.
- Procesamiento multimodal de imágenes mediante la torre de visión del modelo padre (no se detalla el alcance exacto).
- Toma de decisiones sobre tareas de clasificación y elección entre opciones, que es el objetivo declarado del fine-tune ("decision-model").
- Razonamiento espacial, entrenado explícitamente con familias como StepGame y SpartQA.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de decisiones sobre tareas de tasksource: el modelo está entrenado con probabilidades de profesor sobre filas de decisión de tasksource, por lo que puede emplearse para replicar o comparar decisiones en esas mismas familias de tareas dentro de un pipeline de investigación.
- Razonamiento espacial controlado: al haberse entrenado con StepGame y SpartQA, es adecuado para experimentos de seguimiento de relaciones espaciales en textos breves, siempre validando con un conjunto de test propio.
- Componente de un pool de soups: su uso natural es servir como cuerpo candidato en el pool `d3-mini` de Zils, agregándose con otros checkpoints para producir modelos combinados.
- Investigación sobre agregación de pesos: permite estudiar el efecto del promedio uniforme de cuerpos más un LoRA de rango 64 fusionado, comparando contra los modelos de partida (zils-mini-body-m10 y zils-mini-s3l).
- Prototipado multimodal ligero: al conservar la torre de visión del padre, puede usarse en entornos con recursos moderados para probar pipelines imagen-texto, verificando antes la calidad real de la torre tras el fine-tune.
- Base para fine-tunes posteriores: al estar en BF16 y con licencia Apache 2.0, es un punto de partida razonable para ajustes específicos de dominio con LoRA, dado su tamaño manejable de 4,54 B de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5 a 3 GB, si se generan cuantizaciones (no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue de referencia en BF16 con lotes grandes; RTX 4090 (24 GB) para BF16 con contexto limitado; RTX 3090/4080 (16-24 GB) para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en BF16 con contexto corto, y en tarjetas de 8 GB si se cuantiza a 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama si se dispone de GGUF (no publicado), y transformers con PyTorch para BF16 directo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-r2a | ≈4,54 B | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune de decisión sobre Qwen3.5-4B |
| Qwen/Qwen3.5-4B | ≈4 B (según base) | No disponible en esta ficha | Según modelo original | Hugging Face | Modelo base del que deriva |
| Charlie320/zils-mini-s3l | No disponible | No disponible | No disponible | Hugging Face | Cuerpo previo del pool z3-mini |
| jaysun007/zils-mini-body-m10 | No disponible | No disponible | No disponible | Hugging Face | Cuerpo previo del pool z3-mini |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a la procedencia y la licencia.

## Limitaciones y advertencias

- Información pública mínima: sin pipeline declarado, sin idiomas, sin benchmarks y sin descargas, lo que impide validar su calidad sin pruebas propias.
- Riesgo de alucinación: al ser un fine-tune sobre respuestas de profesor en tareas de decisión, puede producir salidas confiadas pero incorrectas fuera de la distribución de tasksource.
- Sesgos: no documentados; los datos de entrenamiento provienen de filas públicas de tasksource y de las respuestas de un profesor, cuyos sesgos se heredan sin análisis publicado.
- Limitaciones de contexto e idioma: no especificadas; no se debe asumir soporte multilingüe ni una ventana de contexto concreta.
- Restricciones de licencia: los pesos son Apache 2.0, pero la model card advierte de que se deben comprobar los términos de los datasets de origen antes de reutilizar el modelo.
- Uso en producción: no recomendado sin una evaluación previa en el dominio objetivo, dado que el modelo está pensado como cuerpo de un pool experimental y no como asistente final.
- Fecha de creación futura (2026-11-13) en los metadatos de Hugging Face, lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-r2a
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo previo del pool: https://huggingface.co/jaysun007/zils-mini-body-m10
- Cuerpo previo del pool: https://huggingface.co/Charlie320/zils-mini-s3l
- Dataset de respuestas de relay (referenciado en la model card): `zils-relay-answers` (no se proporciona URL directa)
- Proyecto Zils / Bittensor subnet 127: no se proporciona URL directa en la información disponible
