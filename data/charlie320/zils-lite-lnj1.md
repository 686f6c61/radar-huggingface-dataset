# Charlie320/zils-lite-lnj1

## Resumen

zils-lite-lnj1 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario Charlie320 y publicado en Hugging Face bajo licencia Apache-2.0. Forma parte del pool de modelos denominado "Zils d3-lite soup" asociado a la subnet 127 de Bittensor, un ecosistema de modelos de decisión orientados a tareas de clasificación y elección estructurada. El modelo se distribuye como "body" (cuerpo) dentro de una arquitectura de dos componentes típica de este tipo de pools, donde el cuerpo procesa el lenguaje y la torre de visión se hereda del modelo padre.

El modelo parte de la media uniforme de pesos de dos cuerpos previos (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc), sobre la que se aplica un LoRA de rango 64 que se fusiona posteriormente. El resultado es un modelo de aproximadamente 853 millones de parámetros en BF16, entrenado específicamente para emitir decisiones tipadas en formato de examen. Su relevancia radica en su especialización: no es un modelo conversacional generalista, sino un componente de un pipeline de decisión con datos de entrenamiento curados y filtrados por licencia comercial.

El tamaño compacto (sub-1000M de parámetros) y la licencia permisiva lo hacen adecuado para despliegues con recursos limitados, aunque su naturaleza de modelo de decisión restringe los casos de uso a tareas estructuradas dentro del ecosistema Zils. No se dispone de información publicada sobre benchmarks, idiomas soportados ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B), con torre de visión heredada del padre |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 853 millones de parámetros. El modelo se construye en dos fases: primero se calcula la media uniforme de los pesos de dos cuerpos previos del pool (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc), ambos Apache-2.0; después se entrena un LoRA de rango 64 con anchor 0.1 y learning rate 5e-5 durante aproximadamente una época, que se fusiona en el punto de partida. Los pesos de lenguaje se entrenan, mientras que la torre de visión se mantiene del modelo padre. El formato de pesos es BF16.

Los datos de entrenamiento suman aproximadamente 109.000 filas de dos fuentes. La primera son ítems de decisión en formato de examen generados con la receta pública de autoría de Zils (scripts/author_exam.py) por Claude Opus y por un modelo abierto local, a partir únicamente de particiones públicas de entrenamiento, más las respuestas del profesor de relevo público de Zils. La segunda son 63.840 decisiones tipadas provenientes de la partición de entrenamiento de tasksource/tasksource-jev-typed-decisions, filtradas para incluir solo filas marcadas como license_use: commercial, con texto mayoritariamente ASCII y un máximo de 200 filas por dataset de origen (413 fuentes en total). No se utilizaron ítems de examen de validadores, ítems de examen semilla públicos ni datos de clientes.

## Capacidades

- Generación de decisiones tipadas en formato de examen, orientada a tareas de elección estructurada dentro del ecosistema Zils.
- Procesamiento de lenguaje natural heredado del modelo base Qwen/Qwen3.5-0.8B.
- Capacidad de visión heredada de la torre del modelo padre (aunque no se detalla su alcance ni resolución).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- No se detallan capacidades multilingües específicas; los idiomas soportados figuran como no disponibles.
- No se documenta modo de razonamiento (thinking mode) ni capacidades de audio.

## Casos de uso

- Clasificación de decisiones estructuradas: el modelo puede emitir decisiones tipadas en formato de examen, adecuado para pipelines de evaluación automatizada dentro de la subnet 127 de Bittensor, donde se integra como cuerpo del pool d3-lite.
- Evaluación de modelos en entornos de investigación: sirve como componente de referencia para comparar el rendimiento de distintos cuerpos dentro de un mismo pool, dado que comparte punto de partida con otros modelos.
- Filtrado y etiquetado de datos con criterios de licencia comercial: su entrenamiento con filas filtradas por license_use: commercial lo hace apropiado para tareas de clasificación en entornos donde la trazabilidad de licencias es relevante.
- Prototipado de sistemas de decisión con recursos limitados: con menos de 1.000 millones de parámetros y pesos en BF16 (1,7 GB de repositorio), puede desplegarse en una única GPU de gama media para experimentación rápida.
- Investigación sobre mezcla de pesos (model soup): su construcción a partir de la media de dos cuerpos previos más un LoRA fusionado lo convierte en un caso de estudio para técnicas de merging y ajuste eficiente.
- Evaluación comparativa de técnicas de ajuste: al documentarse el LoRA (rango 64, anchor 0.1, lr 5e-5, una época), puede utilizarse como referencia reproducible en estudios sobre fine-tuning de bajo rango en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; se estima un mínimo práctico de 4-6 GB para contexto corto, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no disponible de forma específica; por tamaño, cabría en GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB).
- Cabe en GPU consumer: sí, por el tamaño del modelo (sub-1000M de parámetros), aunque no se documentan requisitos oficiales.
- Opciones de despliegue: no se documentan explícitamente; por formato safetensors y arquitectura derivada de Qwen, sería compatible con frameworks estándar como vLLM, TGI o transformers, pero no se confirma en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-lnj1 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face | Fine-tune de decisión del pool Zils d3-lite |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo previo del mismo pool, usado como punto de partida |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo previo del mismo pool, usado como punto de partida |
| Qwen/Qwen3.5-0.8B | no disponible (≈0,8B) | no disponible | no disponible | Hugging Face | Modelo base del que deriva la arquitectura |

## Limitaciones y advertencias

- Modelo especializado en decisiones tipadas: no es un modelo conversacional generalista y su uso fuera del ecosistema Zils puede producir resultados pobres o incoherentes.
- Riesgo de alucinación: al ser un fine-tune sobre un modelo pequeño, puede generar decisiones incorrectas o inventar categorías no presentes en los datos de entrenamiento.
- Sesgos conocidos: no se documentan análisis de sesgo; los datos de entrenamiento provienen de fuentes públicas filtradas por licencia comercial, lo que puede introducir sesgos de selección.
- Limitaciones de contexto e idioma: no se dispone de información sobre la longitud de contexto efectiva ni sobre los idiomas soportados; el filtro "mostly-ASCII" en los datos sugiere un sesgo hacia el inglés.
- Restricciones de licencia: el modelo es Apache-2.0, pero cada fila de entrenamiento conserva la licencia de su dataset de origen (tasksource/tasksource-jev-typed-decisions); es necesario verificar los términos de los datasets fuente antes de su reutilización.
- Caveat para producción: no se han publicado benchmarks ni evaluaciones independientes, por lo que su rendimiento real en producción es desconocido; se recomienda validación propia antes de desplegarlo.
- El repositorio contiene únicamente pesos; no se incluyen scripts de inferencia ni tokenizador documentado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-lnj1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo previo 1: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Cuerpo previo 2: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Dataset de decisiones tipadas: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
