# Charlie320/zils-mini-t2p

## Resumen

zils-mini-t2p es un modelo de decisión de 4.539 millones de parámetros (aproximadamente 4,54 mil millones) publicado por el usuario Charlie320 en Hugging Face. Se presenta como un "body" (cuerpo) para el pool de soups `d3-mini` de Zils, asociado a la subnet 127 de Bittensor. El modelo parte de Qwen/Qwen3.5-4B y se ha ajustado mediante un proceso de fine-tuning tipo soup: una media uniforme de dos bodies previos del pool más el body propio `zils-mini-p16`, sobre la que se aplica un LoRA de rango 64 que se fusiona en el modelo resultante.

La relevancia del modelo es acotada y muy específica: no es un modelo de propósito general, sino una pieza de un ecosistema de decisión orientado a la subnet 127 de Bittensor, donde los modelos compiten por responder ítems con formato de examen. Su licencia Apache 2.0 y su tamaño de 4,5 mil millones de parámetros lo hacen manejable en hardware de consumo, pero la información pública sobre arquitectura interna, idiomas y rendimiento es prácticamente inexistente.

La model card es explícita sobre el origen de los datos: ítems de decisión en formato de examen escritos con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del profesor de retransmisión público de Zils. No se usaron ítems de examen de validador ni ítems semilla públicos. El repositorio contiene solo pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B, layout "chassis"); no se detalla más |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B en el denominado "chassis layout", con pesos en BF16 y la torre de visión heredada del modelo padre. El proceso de entrenamiento es un fine-tuning tipo soup: se parte de la media uniforme de los dos bodies actuales del pool de soups `z3-mini` y del body propio `zils-mini-p16`; sobre esa media se ejecuta un único entrenamiento LoRA de rango 64 con anchor 0,1, learning rate 5e-5 y una época, que después se fusiona en el modelo inicial. Según la model card, los pesos de lenguaje están entrenados y la torre de visión proviene del padre.

Los datos de entrenamiento consisten en ítems de decisión con formato de examen generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, restringidos a splits públicos de entrenamiento, más las respuestas del profesor de retransmisión público de Zils. No se emplearon ítems de examen del validador ni ítems semilla públicos. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO; tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y respuesta a ítems con formato de examen o decisión, que es el objetivo declarado del fine-tuning.
- Razonamiento orientado a decisión dentro del ecosistema Zils (subnet 127 de Bittensor).
- Capacidad de visión heredada de la torre del modelo padre (Qwen/Qwen3.5-4B), según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Participación en el pool de soups `d3-mini` de Zils (subnet 127 de Bittensor): el modelo está diseñado como body para responder ítems de examen de decisión dentro de este ecosistema, por lo que su uso principal es la competición o evaluación en esa subnet.
- Evaluación de modelos de decisión en formato de examen: sirve como referencia para comparar respuestas a ítems generados con la receta pública `author_exam.py`, al haber sido entrenado con ese mismo formato.
- Investigación sobre fine-tuning tipo soup: su receta (media de bodies + LoRA rango 64 fusionado) es reproducible y útil para estudiar el efecto de soups y LoRA en modelos de 4,5 mil millones de parámetros.
- Clasificación y decisión sobre opciones múltiples: el formato de examen implica elegir entre alternativas, lo que encaja en tareas de selección de respuesta acotada.
- Prototipado de asistentes con componente visual: al heredar la torre de visión del padre, puede emplearse en experimentos que combinen texto e imagen, aunque no se documenta el rendimiento en esas tareas.
- Despliegue en hardware de consumo para experimentación: con 4,54 mil millones de parámetros en BF16 (unos 9,1 GB de pesos), es viable en GPUs de gama alta de consumo para pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 10-12 GB para contextos cortos.
- Cuantización: no se documentan tipos de cuantización publicados; al ser safetensors BF16, sería necesaria una conversión propia a GGUF o similar para reducir requisitos.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs con 12-16 GB o más de VRAM.
- ¿Cabe en GPU de consumo? Probablemente sí en modelos con 12 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090), aunque no se confirma oficialmente.
- Opciones de despliegue: no disponible; al ser un transformer derivado de Qwen, cabría esperar compatibilidad con vLLM, llama.cpp, Ollama o TGI tras la conversión adecuada, pero no se documenta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-t2p | 4.539.265.536 | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune tipo soup de Qwen3.5-4B para el pool Zils |
| Qwen/Qwen3.5-4B | ~4B (no confirmado) | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| Charlie320/zils-mini-p16 | no disponible | no disponible | no disponible | Hugging Face | Body previo del mismo autor, usado en el soup |
| jaysun007/zils-mini-body-m10 | no disponible | no disponible | no disponible | Hugging Face | Body del pool usado en la media inicial |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura interna detallada, contexto, idiomas ni rendimiento, lo que dificulta evaluar su idoneidad en producción.
- Sesgos conocidos: no disponible; los datos de entrenamiento provienen de generación por Claude Opus y un modelo abierto local, lo que puede introducir sesgos de esos generadores.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión con formato de examen, las respuestas fuera de ese formato pueden ser poco fiables.
- Limitaciones de contexto e idioma: no disponibles; no se declaran idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card advierte de que se deben comprobar los términos de los datasets de origen antes de reutilizar los pesos.
- Caveat de producción: el modelo está orientado a un ecosistema muy específico (subnet 127 de Bittensor) y su uso general fuera de ese contexto no está validado; además, el repositorio contiene solo pesos y no incluye código de inferencia ni configuración de despliegue.
- Fecha de creación y actualización: 2026-11-13, con 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-mini-t2p
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Body previo del autor: https://huggingface.co/Charlie320/zils-mini-p16
- Body del pool: https://huggingface.co/jaysun007/zils-mini-body-m10
- Body del autor: https://huggingface.co/Charlie320/zils-mini-s3l
- Receta de autoría de Zils (`scripts/author_exam.py`): no disponible como enlace directo en la información proporcionada
