# Charlie320/zils-mini-gk2

## Resumen

zils-mini-gk2 es un fine-tune del modelo Qwen/Qwen3.5-4B publicado por el usuario Charlie320 en Hugging Face, concebido como un "cuerpo" (body) para el pool de modelos tipo soup denominado `d3-mini`, asociado a la subnet 127 de Bittensor. El modelo se distribuye en formato BF16 con pesos en safetensors y una licencia Apache 2.0, y cuenta con aproximadamente 4.539 millones de parámetros totales (4,54 mil millones), lo que lo sitúa en la categoría de modelos pequeños-medianos aptos para despliegue en hardware de consumo.

El modelo está especializado en tareas de decisión con formato de examen (exam-format decision items), un dominio muy concreto orientado a la evaluación automática dentro del ecosistema Zils. La relevancia de esta ficha es limitada fuera de ese contexto: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card extendida, sin benchmarks publicados y sin información sobre idiomas soportados más allá de la inferible del modelo base Qwen3.5-4B.

La información disponible sobre arquitectura, datos de entrenamiento y capacidades es escasa y procede exclusivamente de la model card del autor y de los metadatos de Hugging Face. Todo dato no confirmado en esas fuentes se indica explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B); no se detalla la variante exacta |
| Parámetros totales | 4.539.265.536 (4,54 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ha construido mediante un proceso de "soup fine-tune": se toma como punto de partida la media uniforme de los dos cuerpos actuales del pool `z3-mini`, y sobre ese punto se aplica la media uniforme de dos ejecuciones de LoRA de rango 64 (anchor 0.1, learning rate 5e-5, tres épocas, semillas distintas) entrenadas sobre el subconjunto de lenguaje de "familia conocida" (6.326 filas, 3 familias de tareas) de los datos de entrenamiento, que posteriormente se fusionan en el modelo base. La model card indica que los pesos de lenguaje están entrenados y que la torre de visión proviene del modelo padre, lo que sugiere una arquitectura multimodal heredada de Qwen3.5-4B.

Los datos de entrenamiento consisten en ítems de decisión en formato de examen generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del profesor de relay público de Zils. El autor afirma explícitamente que no se usaron ítems de examen de validadores ni ítems semilla públicos. No se especifica el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en el dominio de ítems de decisión con formato de examen, que es el objetivo declarado del fine-tune.
- Herencia de las capacidades del modelo base Qwen/Qwen3.5-4B, incluyendo generación de texto general, código y matemáticas, aunque no se documentan explícitamente en la model card.
- Torre de visión heredada del modelo padre, según indica la model card ("vision tower from the parent"), si bien no se detalla su funcionamiento ni su calidad tras el fine-tune.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; los idiomas no están declarados en los metadatos.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación automática de ítems de decisión en el ecosistema Zils: el modelo está entrenado específicamente sobre ítems con formato de examen generados con la receta pública, por lo que es adecuado para responder y puntuar este tipo de preguntas dentro del pool `d3-mini` de la subnet 127 de Bittensor.
- Investigación sobre técnicas de model soup y fusión de LoRA: el proceso de entrenamiento (media uniforme de cuerpos previos más media de dos LoRA de rango 64 fusionadas) es un caso de estudio reproducible para estudiar el efecto de estas técnicas en modelos de ~4,5B.
- Experimentación con modelos pequeños en hardware de consumo: con 4,54 mil millones de parámetros en BF16, el modelo puede cargarse en GPUs de gama alta de consumo, lo que facilita pruebas locales de fine-tunes derivados de Qwen3.5-4B.
- Prototipado de pipelines de decisión con formato estructurado: el modelo puede integrarse en flujos que requieran respuestas a preguntas de opción múltiple o ítems de examen en dominios acotados.
- Base para nuevos fine-tunes dentro del pool Zils: al ser un "body" del pool, sirve como punto de partida para futuras iteraciones del soup, tal como el propio modelo se construyó a partir de los cuerpos anteriores.
- Evaluación comparativa de la receta de autoría de Zils: permite medir cómo afecta el uso de datos generados por Claude Opus frente a un modelo abierto local en el rendimiento final del modelo.
- Experimentos multimodales básicos: la torre de visión heredada permite, en principio, procesar entradas de imagen, aunque no hay documentación que confirme su calidad tras el fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para los pesos (4,54 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomiendan al menos 12-16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB para los pesos; en 4 bits, alrededor de 3 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPUs recomendadas: para BF16, una RTX 4090 (24 GB) o una A100/H100 para despliegues con mayor concurrencia; para cuantizaciones de 8 o 4 bits, tarjetas de 8-12 GB como la RTX 3060 Ti, RTX 4060 Ti o RTX 3080 podrían ser suficientes.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas con 12-16 GB o más; en cuantizaciones menores, en tarjetas de 8 GB.
- Opciones de despliegue: al ser un modelo derivado de Qwen3.5-4B, es probable que sea compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se ha verificado ni documentado oficialmente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-gk2 | 4,54 mil millones | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune especializado en ítems de decisión del pool Zils |
| Qwen/Qwen3.5-4B | ~4 mil millones (según modelo base) | no disponible | no disponible | Hugging Face | Modelo base del que deriva zils-mini-gk2; capacidades generales |
| Charlie320/zils-mini-s3l | no disponible | no disponible | no disponible | Hugging Face | Cuerpo previo del pool Zils usado como base del soup |
| jaysun007/zils-mini-body-m10 | no disponible | no disponible | no disponible | Hugging Face | Cuerpo previo del pool Zils usado como base del soup |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B y entrenarse sobre datos generados por Claude Opus y un modelo abierto local, puede heredar sesgos de ambos.
- Riesgo de alucinación: no evaluado; el modelo está especializado en un dominio muy acotado (ítems de decisión con formato de examen) y su comportamiento fuera de ese dominio no está caracterizado.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada y los idiomas soportados no se declaran en los metadatos, por lo que no se puede garantizar un rendimiento multilingüe.
- Restricciones de licencia: la licencia es Apache 2.0, lo que permite uso comercial, pero la model card advierte que se deben revisar los términos de los datasets de origen antes de reutilizar los pesos, ya que los datos de entrenamiento provienen de splits públicos y de respuestas de un profesor de relay.
- Caveat para producción: el modelo tiene cero descargas y cero likes, no cuenta con benchmarks publicados ni evaluación independiente, y su propósito declarado es servir como cuerpo dentro de un pool experimental de Bittensor; no se recomienda su uso en producción sin una evaluación propia exhaustiva.
- El proceso de entrenamiento (soup de LoRA y media de cuerpos) no está documentado con detalle suficiente para reproducirlo de forma fiable.

## Enlaces

- [Hugging Face: Charlie320/zils-mini-gk2](https://huggingface.co/Charlie320/zils-mini-gk2)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Cuerpo previo: jaysun007/zils-mini-body-m10](https://huggingface.co/jaysun007/zils-mini-body-m10)
- [Cuerpo previo: Charlie320/zils-mini-s3l](https://huggingface.co/Charlie320/zils-mini-s3l)
