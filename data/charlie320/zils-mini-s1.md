# Charlie320/zils-mini-s1

## Resumen

zils-mini-s1 es un modelo de decisión de tipo "body" (cuerpo de pesos) publicado por el usuario Charlie320 en Hugging Face, orientado al pool de modelos `d3-mini` del ecosistema Zils, asociado al subnet 127 de Bittensor. Se trata de un fine-tune de Qwen/Qwen3.5-4B con 4.539.265.536 parámetros en BF16, entrenado con pesos de lenguaje y torre de visión heredada del modelo padre. El modelo no está pensado como un asistente generalista, sino como un componente especializado en tareas de decisión en formato de examen.

El punto de partida del entrenamiento es la media uniforme de pesos de cuatro "house bodies" Apache-2.0 del pool `d3-mini`: torchcast-ai/torchcast-decision-4b, perplexity-ai/pplx-decider-flash-v1.2, vllm-sr/d3-mini y Maincode/Matilda-Decision-v1-Mini. Sobre esa base se entrenaron seis LoRA independientes de una época (rango 32, alpha 64, learning rate entre 5e-5 y 1e-4) que posteriormente se fusionaron en los pesos, y el resultado final es la media uniforme de esas seis fusiones. Es, por tanto, un modelo "soup" en el sentido literal del término.

Su relevancia es acotada pero concreta: ejemplifica un flujo de trabajo de destilación y mezcla de modelos pequeños para tareas de clasificación y decisión, con licencia Apache-2.0 y un tamaño que cabe en GPUs de consumo. No hay información publicada sobre benchmarks, idiomas soportados ni pipeline de inferencia, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B), con torre de visión heredada del padre |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible (la model card indica "language weights trained" sin detallar idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,5 mil millones de parámetros, al que se le conserva la torre de visión del modelo padre. El "chassis layout" mencionado en la model card hace referencia a la estructura de pesos del pool Zils `d3-mini`, no a una arquitectura nueva. El modelo se distribuye en BF16 con safetensors y un tamaño de repositorio de 9,1 GB.

El entrenamiento tiene dos fases claramente diferenciadas. Primero se calcula la media uniforme de cuatro cuerpos Apache-2.0 del pool `d3-mini` en revisiones concretas (492bfb19, 9ff7cf98, df99bf4c y 39479a8a). Sobre ese punto de partida se ejecutan seis LoRA independientes de una sola época, con rango 32, alpha 64 y learning rate entre 5e-5 y 1e-4, cada una entrenada sobre entre 4.100 y 10.000 ítems en formato de examen con una pérdida combinada de entropía cruzada más Brier. Finalmente, las seis LoRA se fusionan en los pesos y el modelo resultante es la media uniforme de las seis fusiones. Los datos de entrenamiento son ítems de decisión en formato de examen generados con la receta pública `scripts/author_exam.py` de Zils, por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del profesor de retransmisión público de Zils. La model card afirma explícitamente que no se usaron ítems de examen de validador ni ítems semilla públicos.

## Capacidades

- Tareas de decisión en formato de examen: el modelo está entrenado específicamente para responder ítems con opciones y producir una decisión, con una función de pérdida que combina entropía cruzada y Brier score para calibrar la confianza.
- Generación de texto y pesos de lenguaje: al derivar de Qwen3.5-4B, conserva la capacidad generativa del modelo base, aunque no se documenta su calidad tras el fine-tune.
- Visión: incorpora la torre de visión del modelo padre, por lo que en principio puede procesar entradas multimodales, si bien no se detalla el protocolo de uso.
- Clasificación y puntuación de solicitudes: el caso de uso descrito por Zils (ordenar peticiones, marcar problemas, puntuar coincidencias) encaja con la naturaleza del fine-tune.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Clasificación de solicitudes entrantes en un servicio de soporte: el modelo puede recibir un ítem en formato de examen con categorías candidatas y devolver la categoría con una puntuación de confianza calibrada gracias a la pérdida de Brier. Es adecuado porque su entrenamiento está orientado precisamente a ese formato.
- Triaje de incidencias en pipelines internos: dado un informe de error o una alerta, el modelo puntúa la gravedad o la categoría del problema y permite enrutarlo al equipo correspondiente, reduciendo el trabajo manual de primera línea.
- Puntuación de coincidencias en sistemas de recomendación o matching: el modelo puede evaluar pares candidato-oferta y emitir una puntuación, aprovechando su naturaleza de "decision-model" y su tamaño reducido para ejecutarse en lote.
- Filtrado de contenido y moderación asistida: con ítems de examen que describan políticas, el modelo puede clasificar textos según categorías predefinidas y señalar casos dudosos para revisión humana.
- Evaluación automática de respuestas en entornos educativos: su formato de examen y su calibración lo hacen apto para corregir preguntas de opción múltiple o de decisión cerrada en plataformas de formación.
- Componente de un ensemble o pool de modelos: al ser un "body" del pool `d3-mini`, puede integrarse junto a otros cuerpos del mismo ecosistema para promediar decisiones o servir como candidato en un mecanismo de consenso, por ejemplo en el contexto de Bittensor subnet 127.
- Prototipado rápido en GPU de consumo: con 4,54 mil millones de parámetros en BF16, puede desplegarse en una GPU de 24 GB para experimentar con recetas de decisión antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 11 y 14 GB según longitud de contexto y lote.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos, con un total práctico de 7 a 9 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5 a 3 GB de pesos, con un total práctico de 4 a 6 GB, aunque el repositorio no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para despliegues de producción; RTX 4090 (24 GB) para inferencia en BF16 sin problemas; RTX 3090 (24 GB) igualmente viable.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en BF16) y en tarjetas de 12 GB si se cuantiza a 8 bits. En 4 bits cabría en GPUs de 8 GB.
- Opciones de despliegue: vLLM y TGI para servir en BF16; llama.cpp u Ollama requerirían convertir los pesos a GGUF, paso no documentado por el autor. Al conservar la torre de visión, conviene verificar el soporte multimodal del servidor elegido.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-s1 | 4,54 B | No disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tune de decisión con torre de visión |
| Qwen/Qwen3.5-4B | ~4 B | No disponible | No disponible en la información | Hugging Face | Modelo base del que deriva |
| Maincode/Matilda-Decision-v1-Mini | No disponible | No disponible | Apache-2.0 (según tags del pool) | Hugging Face | Uno de los cuatro cuerpos promediados |
| torchcast-ai/torchcast-decision-4b | No disponible | No disponible | Apache-2.0 (según tags del pool) | Hugging Face | Uno de los cuatro cuerpos promediados |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está especializado en ítems de decisión en formato de examen; su comportamiento fuera de ese formato no está documentado y probablemente degrade respecto al modelo base.
- No se han publicado benchmarks, evaluaciones independientes ni datos de idiomas, por lo que la calidad real es desconocida.
- Riesgo de alucinación: al ser un fine-tune de un modelo generativo, puede producir justificaciones plausibles pero incorrectas; la calibración vía Brier mitiga pero no elimina este riesgo.
- El entrenamiento se realizó sobre datos sintéticos generados por Claude Opus y un modelo abierto local, lo que puede introducir sesgos del generador y una distribución limitada de casos.
- La model card advierte de que el repositorio contiene solo pesos y que deben revisarse los términos de los datasets de origen antes de reutilizarlos.
- Aunque la licencia es Apache-2.0, los pesos derivan de varios modelos base cuyas licencias conviene verificar individualmente antes de un uso comercial.
- El repositorio no registra descargas ni interacciones, y fue creado y actualizado el mismo día (2026-11-06), lo que sugiere un artefacto reciente y sin validación comunitaria.
- No se documenta la longitud de contexto soportada ni el protocolo de uso de la torre de visión, lo que complica su integración en producción.
- El uso de modelos del ecosistema Bittensor subnet 127 puede implicar reglas específicas del pool que no se detallan en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-s1
- Perfil del autor en Hugging Face: https://huggingface.co/Charlie320/models
- Sitio oficial de Zils: https://zils.ai/
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo del pool torchcast-ai/torchcast-decision-4b: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Cuerpo del pool perplexity-ai/pplx-decider-flash-v1.2: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Cuerpo del pool vllm-sr/d3-mini: https://huggingface.co/vllm-sr/d3-mini
- Cuerpo del pool Maincode/Matilda-Decision-v1-Mini: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
