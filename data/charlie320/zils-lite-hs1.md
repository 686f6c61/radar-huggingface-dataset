# Charlie320/zils-lite-hs1

## Resumen

zils-lite-hs1 es un modelo de decisión publicado por Charlie320 en Hugging Face, construido como un fine-tune de Qwen/Qwen3.5-0.8B siguiendo el formato "chassis" del ecosistema Zils. El modelo forma parte del pool de "soup" denominado d3-lite, orientado a la subred 127 de Bittensor, y se distribuye con licencia Apache-2.0. El repositorio contiene únicamente pesos en formato safetensors, con un total de 852.985.920 parámetros y un tamaño aproximado de 1,7 GB.

El modelo se ha obtenido mediante un promedio uniforme de pesos (model soup) de cuatro fine-tunes distintos sobre el modelo base vllm-sr/d3-lite: dos fine-tunes completos (entropía cruzada suave y Brier score, con filas de anclaje KL hacia el modelo de partida, tasa de aprendizaje 4e-6 y aproximadamente 1,3 horas de entrenamiento cada uno) y dos fine-tunes LoRA con rango 32 (una época, tasa de aprendizaje 1e-4 y anclaje KL de 0,1). Los datos de entrenamiento son ítems de decisión en formato de examen, generados con la receta pública de autoría de Zils (scripts/author_exam.py) por Claude Opus y por un modelo abierto local, a partir únicamente de particiones públicas de entrenamiento y de las respuestas del profesor de relevo público de Zils.

Su relevancia radica en que ejemplifica un patrón de entrenamiento especializado para tareas de decisión dentro de un pipeline de evaluación tipo examen, con una ventana de contexto heredada del modelo base Qwen3.5-0.8B. No obstante, la información pública disponible es muy limitada: no se detallan idiomas soportados, pipeline de inferencia ni resultados de benchmarks, y el modelo registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B); layout "chassis" de Zils |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros, sobre el que se aplica el layout "chassis" del ecosistema Zils. El modelo parte del "house body" vllm-sr/d3-lite (Apache-2.0) e incorpora la torre de visión del modelo padre, además de pesos de lenguaje entrenados. El resultado se obtiene por promedio uniforme de pesos de cuatro fine-tunes: dos fine-tunes completos entrenados con entropía cruzada suave y Brier score, con filas de anclaje KL hacia el modelo de partida, tasa de aprendizaje 4e-6 y alrededor de 1,3 horas cada uno; y dos fine-tunes LoRA de rango 32, una época, tasa de aprendizaje 1e-4 y anclaje KL de 0,1.

Los datos de entrenamiento consisten en ítems de decisión en formato de examen, redactados con la receta pública de autoría de Zils (scripts/author_exam.py) por Claude Opus y por un modelo abierto local, usando exclusivamente particiones públicas de entrenamiento, más las respuestas del profesor de relevo público de Zils. Según la model card, no se emplearon ítems de examen de validadores ni ítems semilla públicos. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO más allá del anclaje KL mencionado.

## Capacidades

- Generación de texto y respuesta a ítems en formato de examen o decisión, que es el objetivo declarado del fine-tune.
- Razonamiento estructurado orientado a tareas de elección y decisión, derivado del entrenamiento con entropía cruzada suave y Brier score.
- Capacidades de visión heredadas de la torre del modelo padre (Qwen3.5-0.8B), según indica la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación automática de ítems tipo examen: el modelo puede puntuar o resolver preguntas de opción múltiple en el formato con el que fue entrenado, lo que lo hace adecuado para pipelines de validación de decisiones dentro del ecosistema Zils.
- Clasificación de decisiones con incertidumbre calibrada: el entrenamiento con Brier score sugiere que las probabilidades de salida pueden usarse para umbrales de confianza en sistemas de enrutamiento o triaje.
- Componente de un pool de modelos (model soup): puede combinarse con otros cuerpos del pool d3-lite para promediar pesos y obtener variantes más robustas en tareas de decisión.
- Prototipado rápido en entornos con recursos limitados: con menos de mil millones de parámetros y pesos BF16 de 1,7 GB, cabe en GPUs de consumo para pruebas de concepto.
- Investigación sobre fine-tuning eficiente: sirve como referencia para estudiar la combinación de fine-tunes completos y LoRA r32 con anclaje KL en modelos pequeños.
- Generación de datos sintéticos de examen: puede utilizarse junto con la receta pública de autoría para producir ítems de decisión adicionales en dominios concretos.
- Experimentación en subredes de Bittensor: encaja como cuerpo candidato en flujos de la subred 127, donde los modelos se evalúan mediante exámenes de validadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más memoria para el contexto y activaciones; en la práctica, entre 2 y 4 GB según la longitud de secuencia.
- Cuantización: no se documentan tipos de cuantización publicados; sería necesario convertir los pesos a GGUF o AWQ para reducir la huella.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para BF16 en secuencias cortas; para mayor throughput, A100 o H100 con vLLM.
- GPU de consumo: sí, cabe en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB), con margen amplio.
- Opciones de despliegue: vLLM (el modelo base pertenece a la familia Qwen y el repositorio de origen es vllm-sr/d3-lite), llama.cpp/Ollama tras conversión a GGUF, y TGI si se genera una configuración compatible. No se confirma soporte nativo en ninguno de ellos en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-hs1 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune de decisión sobre Qwen3.5-0.8B; pesos safetensors BF16 |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones | no disponible | no disponible en la información | Hugging Face | Modelo base del que hereda arquitectura y torre de visión |
| vllm-sr/d3-lite | no disponible | no disponible | Apache-2.0 | Hugging Face | "House body" de partida del pool Zils d3-lite |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Información pública muy escasa: no se declaran idiomas, contexto, pipeline ni benchmarks, lo que dificulta evaluar su idoneidad en producción.
- Sesgos conocidos: no documentados; al entrenarse con ítems generados por Claude Opus y un modelo abierto local, puede heredar sesgos de esos generadores y de las particiones públicas empleadas.
- Riesgo de alucinación: no cuantificado; al ser un fine-tune de un modelo de 0,8 mil millones, la fiabilidad en razonamiento abierto es limitada.
- Limitaciones de contexto o idioma: no disponibles; la ventana de contexto no se especifica y los idiomas soportados no están declarados.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, pero la model card advierte que los términos de los datasets de origen deben verificarse antes de reutilizar el modelo.
- Caveat para producción: el repositorio contiene únicamente pesos; no se incluyen tokenizador, configuración de generación ni plantillas de prompt documentadas, por lo que la integración requiere trabajo adicional.
- El modelo está especializado en ítems de decisión en formato de examen; su uso como modelo generalista de chat o código no está validado.
- Registra cero descargas y cero likes, sin evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-lite-hs1
- Perfil del autor: https://huggingface.co/Charlie320/models
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo de partida vllm-sr/d3-lite: https://huggingface.co/vllm-sr/d3-lite
