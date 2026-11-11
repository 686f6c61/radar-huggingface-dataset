# Charlie320/zils-mini-s3l

## Resumen

zils-mini-s3l es un modelo de decisión de 4.539 millones de parámetros (4,54 B) publicado por el usuario Charlie320 en Hugging Face, construido como un fine-tune de Qwen/Qwen3.5-4B en el formato "chassis" del ecosistema Zils, asociado al pool de modelos `d3-mini` de la subred 127 de Bittensor. El modelo se distribuye en BF16 con licencia Apache 2.0 y un tamaño de repositorio de 9,1 GB, e incluye la torre de visión heredada del modelo padre.

El punto de partida no es el modelo base original, sino una media uniforme de pesos de tres cuerpos z3-mini con licencia Apache 2.0: `qhoenix/zils-mini-decision-l13_avg678`, `joamCriff123/zils-mini-sx3` y el propio `Charlie320/zils-mini-hx3` de la casa, que a su vez deriva de la media de `perplexity-ai/pplx-decider-flash-v1.2`, `Maincode/Matilda-Decision-v1-Mini` y `PelaAI/KnowLine-4B-Gen5`. Sobre esa media se aplicó un único fine-tune LoRA y se fusionó.

Su relevancia es acotada y muy específica: se trata de un modelo de decisión orientado a tareas de examen y evaluación dentro del ecosistema Zils, no de un modelo conversacional generalista. La información pública disponible es escasa (cero descargas y cero likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados), por lo que esta ficha se limita a lo que la model card y los metadatos permiten afirmar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B, layout "chassis" Zils); incluye torre de visión del padre |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (la model card indica "language weights trained" sin especificar idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se construye mediante una media uniforme de pesos de tres cuerpos z3-mini (los dos miembros del mini soup del 2026-11-11 más el cuerpo de linaje propio `Charlie320/zils-mini-hx3`). Sobre esa inicialización se aplica un único fine-tune LoRA con rango 64, anclaje KL de 0,1 respecto al punto de partida, optimizador AdamW con tasa de aprendizaje 5e-5, una época y semilla 912; el adaptador se fusiona posteriormente en los pesos. La capa de respuesta y la torre de visión se mantienen sin cambios respecto al padre.

Los datos de entrenamiento consisten en 46.756 ítems de decisión en formato de examen, redactados a partir de filas públicas del split de entrenamiento con la receta de autoría pública de Zils (`scripts/author_exam.py`): 7.120 escritos por Claude Opus y 39.636 escritos por un modelo abierto local, Qwen3.8-27B. La model card declara explícitamente que no se usaron ítems de examen de validadores, ni ítems del examen semilla público, ni filas de relay. No se documenta el número total de tokens de entrenamiento ni la composición completa del dataset más allá de esa proporción de autoría.

## Capacidades

- Generación de texto y razonamiento en el formato de decisión/examen propio del ecosistema Zils.
- Capacidad de visión heredada de la torre del modelo padre (Qwen3.5-4B), aunque no se detalla su alcance ni su calidad tras el fine-tune.
- Pesos de lenguaje entrenados ("language weights trained") según la model card, sin especificación de idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de modelos de decisión en la subred 127 de Bittensor: el modelo se publica como "body" para el pool `d3-mini`, por lo que su uso previsto es participar en ese pool y ser evaluado con el formato de examen de Zils.
- Generación de ítems de examen de decisión: la receta de autoría (`scripts/author_exam.py`) y el formato de los datos de entrenamiento permiten reutilizar el modelo para producir nuevos ítems con estructura homogénea.
- Investigación sobre weight averaging y fine-tune LoRA: el modelo documenta una receta reproducible (media de tres cuerpos, LoRA r=64, KL 0,1, lr 5e-5, 1 época, semilla 912) útil para estudiar la transferencia entre cuerpos del mismo linaje.
- Experimentación con modelos de 4,5 B en BF16: con 9,1 GB de repositorio, cabe en GPUs de 24 GB y permite prototipado local de pipelines de decisión sin infraestructura dedicada.
- Base para fine-tunes posteriores del linaje Zils: al ser un cuerpo intermedio con licencia Apache 2.0, puede servir como punto de partida para nuevas iteraciones del pool.
- Análisis de linaje y procedencia de pesos: los metadatos de modelos base permiten trazar la genealogía completa (Qwen3.5-4B → pplx-decider-flash-v1.2 / Matilda-Decision-v1-Mini / KnowLine-4B-Gen5 → zils-mini-hx3 → zils-mini-s3l), útil para auditorías de procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 12-16 GB de VRAM.
- Cuantización a 8 bits: en torno a 4,5-5 GB de pesos; a 4 bits, en torno a 2,3-2,8 GB, aunque no se documentan versiones cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de mayor throughput; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en BF16 sin cuantizar.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: no se documentan opciones oficiales; al ser safetensors BF16 con arquitectura derivada de Qwen3.5-4B, en principio es compatible con vLLM, TGI y transformers, y con llama.cpp/Ollama si se generan conversiones GGUF (no publicadas).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-mini-s3l | 4,54 B | No disponible | Apache 2.0 | Fine-tune de decisión del pool Zils `d3-mini` |
| Qwen/Qwen3.5-4B | ~4 B | No disponible | No disponible en la información proporcionada | Modelo base del que deriva la arquitectura |
| Charlie320/zils-mini-hx3 | No disponible | No disponible | Apache 2.0 | Cuerpo de linaje propio, uno de los tres promediados |
| joamCriff123/zils-mini-sx3 | No disponible | No disponible | Apache 2.0 | Cuerpo z3-mini promediado |
| qhoenix/zils-mini-decision-l13_avg678 | No disponible | No disponible | Apache 2.0 | Cuerpo z3-mini promediado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: está diseñado para el formato de examen/decisión de Zils, no como asistente conversacional general; su comportamiento fuera de ese dominio no está documentado.
- Sesgos conocidos: no documentados; los datos de entrenamiento combinan autoría de Claude Opus y de Qwen3.8-27B sobre filas públicas, sin análisis de sesgo publicado.
- Riesgo de alucinación: no evaluado ni cuantificado en la información disponible.
- Idiomas: la model card no especifica qué idiomas cubren los "language weights trained"; no debe asumirse multilingüismo.
- Contexto: la longitud de contexto no se declara; no debe asumirse la del modelo base sin verificación.
- Licencia: Apache 2.0 permite uso comercial, pero la propia model card advierte de que este repositorio contiene solo pesos y que deben revisarse los términos de los datasets de origen antes de reutilizarlos.
- Procedencia de datos: se declara explícitamente que no se usaron ítems de validadores, examen semilla público ni filas de relay, pero no se aporta verificación independiente de esa afirmación.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado; no hay evidencia de uso en producción.
- Sin benchmarks: no hay métricas publicadas que permitan estimar su calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-s3l
- Modelo base principal: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo promediado 1: https://huggingface.co/qhoenix/zils-mini-decision-l13_avg678
- Cuerpo promediado 2: https://huggingface.co/joamCriff123/zils-mini-sx3
- Cuerpo promediado 3 (linaje propio): https://huggingface.co/Charlie320/zils-mini-hx3
- Linaje: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Linaje: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Linaje: https://huggingface.co/PelaAI/KnowLine-4B-Gen5
