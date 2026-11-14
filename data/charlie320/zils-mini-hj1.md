# Charlie320/zils-mini-hj1

## Resumen

zils-mini-hj1 es un modelo de decisión de 4.539 millones de parámetros publicado por el usuario Charlie320 en Hugging Face. Se presenta como un "body" (cuerpo de pesos) para el pool de modelos tipo soup denominado `d3-mini`, asociado a la subred 127 de Bittensor (Zils). Técnicamente es un fine-tune del modelo base Qwen/Qwen3.5-4B, con pesos en BF16 y una torre de visión heredada del modelo padre.

El punto de partida no es el modelo base original, sino la media ponderada uniforme de dos cuerpos Apache-2.0 de la misma casa (`vllm-sr/d3-mini` y `torchcast-ai/torchcast-decision-4b`). Sobre esa mezcla se aplicó una única ejecución de LoRA de rango 64 (anchor 0.1, learning rate 5e-5, una época) que después se fusionó en los pesos resultantes. El resultado es un modelo orientado a la toma de decisiones en formato de examen, no a la conversación generalista.

Su relevancia es acotada y muy específica: sirve como pieza dentro de un ecosistema de evaluación y competición de modelos (subred Bittensor), no como un modelo de propósito general para producción. La información pública disponible es escasa: no hay pipeline declarado, no se listan idiomas soportados y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B), con torre de visión heredada del padre |
| Parámetros totales | 4.539.265.536 (aproximadamente 4,54 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4.500 millones de parámetros. Sobre esa base, el autor construye el modelo en dos fases. Primero calcula la media uniforme de los pesos de dos cuerpos Apache-2.0 (`vllm-sr/d3-mini` y `torchcast-ai/torchcast-decision-4b`), sin incluir ningún cuerpo de minero en el punto de partida. Después aplica un único ajuste LoRA de rango 64 con anchor 0.1, learning rate 5e-5 y una época, que se fusiona en los pesos de la mezcla. El resultado se distribuye en BF16 e incluye la torre de visión del modelo padre.

El entrenamiento utilizó aproximadamente 109.000 filas. De ellas, una parte corresponde a ítems de decisión en formato de examen generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del profesor de relay público de Zils. La otra parte son 63.840 decisiones tipadas procedentes del split de entrenamiento de `tasksource/tasksource-jev-typed-decisions`, filtradas a filas marcadas con `license_use: commercial`, texto mayoritariamente ASCII y un máximo de 200 filas por dataset de origen (413 fuentes), convertidas al formato de entrenamiento de Zils. El autor declara explícitamente que no se usaron ítems de examen de validador, ni ítems de examen semilla públicos, ni datos de clientes.

## Capacidades

- Toma de decisiones en formato de examen: el modelo está entrenado para resolver ítems de decisión tipados, presumiblemente con opciones y respuesta única.
- Razonamiento sobre decisiones estructuradas: las 63.840 filas de decisiones tipadas sugieren capacidad para clasificar y elegir entre alternativas en dominios diversos (413 datasets de origen).
- Visión: incorpora la torre de visión del modelo padre Qwen/Qwen3.5-4B, aunque no se documenta el alcance ni el rendimiento de esta capacidad.
- Capacidades conversacionales generales: no documentadas; el modelo es un fine-tune especializado sobre un cuerpo de decisión, no un asistente generalista.
- Tool calling / function calling: no disponible en la información pública.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el filtro de entrenamiento priorizó texto mayoritariamente ASCII, lo que sugiere un sesgo hacia el inglés.

## Casos de uso

- Evaluación en competiciones de modelos de decisión: el modelo está diseñado como cuerpo participante en el pool `d3-mini` de la subred 127 de Bittensor, por lo que su uso natural es responder ítems de examen de decisión dentro de ese circuito y comparar su rendimiento frente a otros cuerpos.
- Investigación sobre weight averaging y LoRA: sirve como caso de estudio reproducible de mezcla uniforme de pesos más fusión de un LoRA de rango 64, útil para estudiar cómo afecta esta receta a un modelo base de 4B.
- Clasificación de decisiones tipadas en dominios acotados: las 63.840 filas de entrenamiento proceden de 413 datasets con licencia comercial, lo que permite experimentar con tareas de elección entre opciones en esos dominios.
- Prototipado de pipelines de evaluación automática: al estar en safetensors y BF16, puede cargarse en frameworks estándar para generar respuestas de examen y medir acierto frente a un conjunto de referencia propio.
- Base para nuevos fine-tunes de decisión: al ser Apache-2.0 y derivar de Qwen, puede servir como punto de partida para ajustes adicionales orientados a dominios específicos.
- Experimentos con la torre de visión heredada: permite comprobar si las capacidades visuales del padre sobreviven al proceso de mezcla y fine-tune, un caso relevante para estudiar la transferencia de capacidades multimodales tras el weight soup.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (el tamaño del repositorio es de 9,1 GB), más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 12-16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: A100, H100 o L40S para inferencia en BF16 con throughput alto; RTX 4090 (24 GB) para inferencia en BF16 con contexto limitado; RTX 3090, 4080 o 4070 Ti para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas de 16 GB o más con contexto reducido, y con holgura en cuantizaciones de 8 y 4 bits en tarjetas de 8-12 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles en principio al tratarse de un transformer denso en safetensors derivado de Qwen; no hay configuración de despliegue publicada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-hj1 | 4,54 B | No disponible | Apache-2.0 | Decisión en formato de examen (fine-tune de Qwen3.5-4B) | Hugging Face, pesos safetensors |
| Qwen/Qwen3.5-4B | Aproximadamente 4 B | No disponible en esta ficha | No disponible en esta ficha | Modelo base generalista y multimodal | Hugging Face |
| vllm-sr/d3-mini | No disponible | No disponible | Apache-2.0 | Cuerpo de decisión del pool d3-mini | Hugging Face |
| torchcast-ai/torchcast-decision-4b | No disponible | No disponible | Apache-2.0 | Cuerpo de decisión del pool d3-mini | Hugging Face |

## Limitaciones y advertencias

- Modelo altamente especializado: está entrenado para ítems de decisión en formato de examen, no para conversación abierta ni generación libre de texto; su uso fuera de ese dominio no está validado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas, ni siquiera frente a sus modelos padre.
- Idiomas no declarados: el filtro de entrenamiento priorizó texto mayoritariamente ASCII, lo que probablemente limita el rendimiento en castellano y en otros idiomas no ingleses.
- Riesgo de alucinación: no evaluado; al ser un fine-tune de decisión, puede producir respuestas plausibles pero incorrectas en ítems fuera de la distribución de entrenamiento.
- Sesgos: no documentados; los datos de entrenamiento provienen de 413 datasets públicos con licencia comercial, cuyos sesgos individuales se heredan sin análisis agregado.
- Licencia: Apache-2.0 permite uso comercial, pero el autor advierte que cada fila de entrenamiento conserva la licencia de su dataset de origen y recomienda revisar los términos de las fuentes antes de reutilizar el modelo. El repositorio contiene solo pesos.
- Trazabilidad limitada: el modelo se apoya en tres modelos padre y en datos generados por Claude Opus y por un modelo abierto local, sin documentación detallada de la composición por dominio.
- Ecosistema muy niche: su valor principal está dentro de la subred 127 de Bittensor; fuera de ese contexto, la documentación y el soporte son mínimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-hj1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo de partida 1: https://huggingface.co/vllm-sr/d3-mini
- Cuerpo de partida 2: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
