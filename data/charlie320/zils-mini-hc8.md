# Charlie320/zils-mini-hc8

## Resumen

zils-mini-hc8 es un modelo de decisión de 4.539 millones de parámetros (aproximadamente 4,5 mil millones) publicado por el usuario Charlie320 en Hugging Face. Se trata de un fine-tune de Qwen/Qwen3.5-4B orientado a tareas de decisión y evaluación, desarrollado como "cuerpo" (body) para el pool de modelos tipo soup denominado Zils `d3-mini`, asociado a la subred 127 de Bittensor. El modelo parte de la media uniforme de pesos de cuatro cuerpos Apache-2.0 del pool y se entrena mediante ocho fine-tunes LoRA independientes fusionados en los pesos.

El modelo conserva la torre de visión del modelo padre y entrena únicamente los pesos de lenguaje en formato BF16. Su relevancia radica en su carácter experimental dentro de un ecosistema de modelos de decisión distribuidos, no en un uso generalista: está pensado para responder a ítems en formato de examen con una función de pérdida que combina entropía cruzada y Brier score, lo que sugiere un enfoque hacia la calibración de probabilidades en tareas de elección.

La información pública disponible es muy limitada: la model card no ofrece benchmarks, no detalla la composición exacta del dataset ni especifica los idiomas soportados. El repositorio contiene únicamente los pesos (9,1 GB), sin código de inferencia ni configuración de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-4B), con torre de visión heredada del padre |
| Parámetros totales | 4.539.265.536 (4,54 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parámetros. El punto de partida es la media uniforme de pesos de cuatro cuerpos del pool `d3-mini`: torchcast-ai/torchcast-decision-4b (revisión 492bfb19), perplexity-ai/pplx-decider-flash-v1.2 (revisión 9ff7cf98), vllm-sr/d3-mini (revisión df99bf4c) y Maincode/Matilda-Decision-v1-Mini (revisión 39479a8a). Sobre esa media se realizan ocho fine-tunes LoRA independientes de una época, con rango 32 y tasa de aprendizaje 1e-4, semillas 1 a 8, que posteriormente se fusionan en los pesos. El cuerpo final es la media uniforme de los ocho conjuntos de pesos fusionados.

El entrenamiento utiliza 7.120 ítems en formato de examen escritos con Claude Opus y con un modelo abierto local, siguiendo la receta pública de autoría de Zils (`scripts/author_exam.py`), a partir únicamente de particiones públicas de entrenamiento, más las respuestas del profesor de relay público de Zils. La función de pérdida combina entropía cruzada y Brier score, lo que indica un objetivo orientado a la calibración de probabilidades además de la clasificación correcta. No se emplearon ítems del examen del validador ni ítems semilla públicos. La model card indica que los pesos de lenguaje fueron entrenados y que la torre de visión se hereda del modelo padre sin modificaciones.

## Capacidades

- Generación de texto y razonamiento sobre ítems en formato de examen o decisión.
- Clasificación y elección entre opciones con calibración de probabilidades (objetivo de pérdida Brier).
- Capacidades de visión heredadas de la torre del modelo padre Qwen/Qwen3.5-4B (no se detalla el alcance exacto).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Evaluación automática de ítems tipo examen: el modelo puede emplearse para responder y puntuar preguntas de opción múltiple en pipelines de evaluación, dado que fue entrenado específicamente con ítems en ese formato y una pérdida de calibración.
- Investigación sobre calibración de modelos: la combinación de entropía cruzada y Brier score lo hace adecuado para estudiar la fiabilidad de las probabilidades emitidas en tareas de decisión binaria o múltiple.
- Experimentación en ecosistemas de subredes Bittensor: sirve como cuerpo candidato dentro del pool `d3-mini` de la subred 127 para pruebas de agregación de pesos y comparación entre mineros.
- Base para fine-tunes posteriores: al ser un fine-tune de Qwen3.5-4B con licencia Apache-2.0, puede reutilizarse como punto de partida en experimentos de ajuste con LoRA sobre tareas de clasificación.
- Prototipado de sistemas de decisión con visión: la torre de visión heredada permite explorar tareas que combinen entrada visual y decisión, aunque sin garantías documentadas sobre su rendimiento.
- Estudio de metodologías de model soup: el proceso de media de pesos y fusión de LoRA documentado permite reproducir y analizar técnicas de agregación de modelos en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 12-16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB, aunque no se documentan cuantizaciones oficiales para este modelo.
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en BF16 para contextos cortos, y en tarjetas de 8 GB si se cuantiza a 8 o 4 bits (sin recetas oficiales publicadas).
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se genere una cuantización GGUF o se configure el modelo con la arquitectura de Qwen3.5-4B; el repositorio solo contiene safetensors, por lo que la conversión es responsabilidad del usuario.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-hc8 | 4,54 mil millones | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune de decisión sobre Qwen3.5-4B, pesos en BF16 |
| Qwen/Qwen3.5-4B | ~4 mil millones | No disponible | No disponible en la información | Hugging Face | Modelo base generalista del que deriva |
| Maincode/Matilda-Decision-v1-Mini | No disponible | No disponible | Apache-2.0 (según tag del pool) | Hugging Face | Cuerpo del pool `d3-mini` usado como punto de partida |
| torchcast-ai/torchcast-decision-4b | No disponible | No disponible | Apache-2.0 (según tag del pool) | Hugging Face | Cuerpo del pool `d3-mini` usado como punto de partida |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B y de datos generados por Claude Opus y un modelo abierto local, puede heredar sesgos de esos modelos y de la receta de autoría.
- Riesgo de alucinación: no evaluado; el entrenamiento en formato de examen no garantiza corrección factual fuera de ese dominio.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto efectiva ni los idiomas soportados; la model card no los detalla.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card advierte de que los datasets de origen deben verificarse antes de reutilizar los pesos, y que el repositorio solo contiene pesos.
- Caveat para producción: el modelo tiene 0 descargas y 0 likes, sin benchmarks ni validación externa; no se recomienda su uso en producción sin una evaluación propia.
- El proceso de entrenamiento depende de la receta y los datos de Zils; la reproducibilidad completa no está garantizada con la información pública.
- La torre de visión se hereda sin entrenamiento específico, por lo que su comportamiento en tareas visuales no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-hc8
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- torchcast-ai/torchcast-decision-4b: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- perplexity-ai/pplx-decider-flash-v1.2: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- vllm-sr/d3-mini: https://huggingface.co/vllm-sr/d3-mini
- Maincode/Matilda-Decision-v1-Mini: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
