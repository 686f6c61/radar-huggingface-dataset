# Charlie320/zils-mini-t2h2

## Resumen

zils-mini-t2h2 es un modelo de decisión de 4.539.265.536 parámetros publicado por el usuario Charlie320 en Hugging Face. Se presenta como un "body" (cuerpo de pesos) para el pool de modelos tipo soup denominado `d3-mini` dentro de la subnet 127 de Bittensor, una red descentralizada de entrenamiento de IA. El modelo parte de Qwen/Qwen3.5-4B y se ha ajustado mediante un proceso de soup (promediado de pesos) seguido de un LoRA de rango 64, con el objetivo declarado de servir como componente de decisión dentro de ese ecosistema.

La arquitectura subyacente es la de Qwen3.5-4B, un transformer denso de aproximadamente 4.500 millones de parámetros, distribuido en formato BF16 safetensors con un repositorio de 9,1 GB. El modelo conserva el tower de visión del modelo padre, según indica la model card, aunque los pesos entrenados corresponden únicamente al componente de lenguaje. La licencia es Apache 2.0.

Su relevancia es acotada: se trata de un artefacto experimental vinculado a un pool de modelos de una subnet concreta, sin benchmarks publicados, sin pipeline declarado y sin idiomas especificados. Resulta de interés para quienes participan en el ecosistema Zils/Bittensor o quieren estudiar técnicas de model soup y merging de LoRA sobre Qwen3.5, más que como modelo de propósito general para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-4B) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer denso de Qwen/Qwen3.5-4B, con un tower de visión procedente del modelo padre y pesos de lenguaje entrenados. El proceso de construcción descrito en la model card es un fine-tune tipo soup: se parte de la media uniforme de los dos bodies actuales del pool `z3-mini` y el body de linaje propio `zils-mini-hp7`, y sobre ese punto de partida se ejecuta un LoRA de rango 64 (anchor 0,1, learning rate 5e-5, dos épocas) que después se fusiona en el modelo inicial.

Los datos de entrenamiento consisten en ítems de decisión en formato de examen, generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir exclusivamente de splits públicos de entrenamiento, más las respuestas del teacher de relay público de Zils. La model card afirma que no se usaron ítems de examen de validadores ni ítems semilla públicos. No se detalla el número de tokens de entrenamiento ni la composición cuantitativa del dataset.

## Capacidades

- Generación de texto y razonamiento en el formato de decisión definido por el ecosistema Zils (selección entre opciones tipo examen).
- Capacidad de visión heredada del tower del modelo padre Qwen3.5-4B, según la model card.
- Pesos de lenguaje entrenados específicamente para tareas de decisión, no para chat general.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Participación en el pool `d3-mini` de la subnet 127 de Bittensor: el modelo está diseñado como body para este pool, por lo que su uso previsto es servir como componente de decisión dentro de la competición de la subnet, respondiendo ítems en el formato de examen de Zils.
- Investigación sobre model soups: sirve como ejemplo reproducible de promediado uniforme de tres bodies seguido de fusión de un LoRA de rango 64, útil para estudiar cómo afecta el merging a las capacidades del modelo base.
- Estudio de merging de adaptadores LoRA: el repositorio documenta hiperparámetros concretos (rango 64, anchor 0,1, lr 5e-5, dos épocas), lo que permite replicar o comparar variantes del proceso.
- Evaluación de linajes de fine-tune: al declarar cuatro modelos base (`Qwen/Qwen3.5-4B`, `jaysun007/zils-mini-body-m10`, `Charlie320/zils-mini-s3l`, `Charlie320/zils-mini-hp7`), facilita análisis comparativos entre linajes dentro del mismo ecosistema.
- Experimentación con modelos de 4,5B en BF16: con 9,1 GB de pesos, cabe en GPUs de 24 GB (RTX 3090, RTX 4090, A10G) para inferencia en precisión completa, lo que lo hace accesible para pruebas locales.
- Base para fine-tunes posteriores: al estar bajo Apache 2.0 y en safetensors, puede reutilizarse como punto de partida para ajustes adicionales orientados a tareas de clasificación o decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 12-14 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,5-5 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2,3-2,8 GB para pesos.
- GPU recomendadas: A100, H100, L40S para despliegue en producción; RTX 4090, RTX 3090, A10G para inferencia en BF16 en local.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 y superiores en BF16; en GPUs de 8 GB requeriría cuantización a 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con arquitecturas derivadas de Qwen, aunque no hay confirmación explícita del autor para este modelo concreto; los pesos están en safetensors, por lo que transformers es la vía directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Charlie320/zils-mini-t2h2 | 4.539.265.536 | no disponible | Apache 2.0 | Hugging Face | Fine-tune de decisión para subnet Bittensor 127 |
| Qwen/Qwen3.5-4B | ~4B (no confirmado) | no disponible | no disponible | Hugging Face | Modelo base del que deriva; capacidades generales |
| Charlie320/zils-mini-hp7 | no disponible | no disponible | no disponible | Hugging Face | Body de linaje propio usado en el soup |
| jaysun007/zils-mini-body-m10 | no disponible | no disponible | no disponible | Hugging Face | Body del pool usado en el soup |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente al modelo base ni frente a alternativas.
- Orientado a un formato muy específico (ítems de decisión tipo examen del ecosistema Zils); su comportamiento fuera de ese formato no está documentado.
- Sin idiomas declarados: no se puede asumir un rendimiento multilingüe fiable.
- Longitud de contexto no especificada: no se recomienda asumir la del modelo base sin verificarla.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de decisión puede producir respuestas plausibles pero incorrectas.
- Sesgos: no documentados por el autor; los datos de entrenamiento provienen de generación sintética por Claude Opus y un modelo abierto local, lo que puede introducir sesgos de esos generadores.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card advierte de que los términos de los datasets de origen deben verificarse antes de reutilizar los pesos.
- El repositorio contiene solo pesos; no incluye código de inferencia ni tokenizador propio más allá de lo que herede del modelo base.
- Cero descargas y cero likes en el momento de la consulta: no hay validación comunitaria del artefacto.
- Vinculado a una subnet de Bittensor: su utilidad está atada a la continuidad y reglas de ese ecosistema.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-t2h2
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Body del pool jaysun007/zils-mini-body-m10: https://huggingface.co/jaysun007/zils-mini-body-m10
- Body de linaje Charlie320/zils-mini-s3l: https://huggingface.co/Charlie320/zils-mini-s3l
- Body de linaje Charlie320/zils-mini-hp7: https://huggingface.co/Charlie320/zils-mini-hp7
