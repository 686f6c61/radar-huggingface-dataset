# beipo-ai/NorthCUA-Pro

## Resumen

NorthCUA-Pro es un modelo multimodal de la familia Qwen 3.5 MoE publicado por beipo-ai en HuggingFace bajo licencia Apache 2.0. El repositorio se presenta como una carga de pesos en curso: según la model card, la subida oficial de los pesos de NorthCUA-Pro está en progreso y el repositorio todavía no constituye un modelo completo descargable. La tarjeta final y el manifiesto de integridad se publicarán una vez verificados los 122 shards de pesos.

El pipeline declarado es image-text-to-text, lo que sitúa al modelo en la categoría de modelos multimodales con entrada de imagen y texto y salida de texto. La arquitectura etiquetada es qwen3_5_moe, es decir, un transformer con mezcla de expertos (MoE) basado en la familia Qwen 3.5. El tamaño del repositorio es de 386,4 GB, un volumen coherente con un modelo MoE de gran escala distribuido en 122 fragmentos de pesos en formato safetensors.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de la estirpe Qwen 3.5 MoE con capacidades multimodales; por otro, advierte de que en el momento de la consulta el repositorio no es descargable de forma íntegra y carece de model card completa, benchmarks y especificaciones detalladas. Cualquier evaluación práctica debe posponerse hasta que el autor publique el manifiesto de integridad y la documentación definitiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (transformer con mezcla de expertos, multimodal image-text-to-text) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (122 shards según la model card) |

## Arquitectura y entrenamiento

La etiqueta de arquitectura qwen3_5_moe indica un transformer con capas de mezcla de expertos (MoE) perteneciente a la familia Qwen 3.5. El pipeline image-text-to-text confirma que el modelo acepta entradas multimodales (imagen y texto) y genera texto, lo que implica un codificador visual integrado junto con el tronco de lenguaje. El tamaño del repositorio, 386,4 GB repartidos en 122 shards de safetensors, sugiere un modelo de gran escala, aunque no se dispone del desglose de parámetros totales ni activos.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, las fases de alineación (RLHF, DPO) ni innovaciones técnicas específicas como decodificación especulativa o mecanismos de atención lineal. La model card únicamente indica que la carga de pesos está en progreso y que la tarjeta final se publicará tras verificar los 122 shards.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen y texto), según el pipeline image-text-to-text declarado.
- Procesamiento de imágenes junto con instrucciones en lenguaje natural, orientado a tareas de comprensión visual y respuesta conversacional.
- Arquitectura MoE de la familia Qwen 3.5, que en la estirpe Qwen suele incluir capacidades de razonamiento y generación de código; no obstante, no se documentan explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas no está relleno en la ficha de HuggingFace.
- Modo thinking, visión avanzada o audio: no disponible.

## Casos de uso

- Asistencia conversacional multimodal en atención al cliente: el modelo podría recibir capturas de pantalla o fotos de producto junto con la consulta del usuario y responder en texto, aprovechando su pipeline image-text-to-text. Requiere validación previa de la integridad de los pesos.
- Análisis de documentos escaneados: extracción de información de facturas, formularios o tickets mediante entrada de imagen y salida de texto estructurado, una vez disponible la model card definitiva con las especificaciones de contexto.
- Automatización de soporte técnico con capturas de error: el usuario adjunta una imagen del fallo y el modelo genera una diagnosis textual o pasos de resolución.
- Moderación de contenido visual con descripción textual: clasificación y descripción de imágenes en pipelines de revisión, sujeto a la licencia Apache 2.0 que permite uso comercial.
- Prototipado de asistentes de accesibilidad: descripción de imágenes para usuarios con discapacidad visual, generando texto descriptivo a partir de la entrada visual.
- Investigación en modelos MoE multimodales: el repositorio, una vez completo, serviría como base para experimentos de ajuste fino y evaluación de arquitecturas Qwen 3.5 MoE con entrada visual, dado que la licencia Apache 2.0 facilita la experimentación.

En todos los casos, el uso en producción queda condicionado a que el autor complete la subida de los 122 shards y publique el manifiesto de integridad, ya que actualmente el repositorio no es un modelo descargable completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 386,4 GB en safetensors, lo que en precisión completa requeriría varios aceleradores de gama alta. No se documentan cuantizaciones que permitan reducir el requisito.
- GPU recomendadas: no disponible; por el volumen de pesos, un despliegue en precisión nativa requeriría múltiples GPU de centro de datos (A100, H100) con agregación de memoria, pero el autor no especifica configuraciones.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de los pesos hace improbable que quepa en una sola GPU de consumo sin cuantización, y no se ofrecen variantes cuantizadas.
- Opciones de despliegue: no disponible; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NorthCUA-Pro | qwen3_5_moe, image-text-to-text | no disponible | no disponible | Apache 2.0 | Repositorio incompleto (carga en progreso) |
| Qwen2.5-VL | Transformer multimodal | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 (según variante) | Pesos publicados y documentados |
| Qwen3 MoE | Transformer MoE | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 (según variante) | Pesos publicados y documentados |

No se dispone de datos de rendimiento de NorthCUA-Pro que permitan una comparación cuantitativa con alternativas. La comparativa se limita a la categoría (modelos Qwen multimodales y MoE) y a la disponibilidad del repositorio.

## Limitaciones y advertencias

- El repositorio no es actualmente un modelo completo descargable: la model card indica que la subida de los 122 shards está en progreso y que el manifiesto de integridad se publicará tras la verificación.
- Ausencia de model card definitiva: no hay información sobre datos de entrenamiento, alineación, sesgos ni evaluación.
- Sin benchmarks publicados: no es posible estimar el rendimiento real frente a alternativas.
- Idiomas no especificados: se desconoce la cobertura multilingüe y la calidad en castellano.
- Sin cuantizaciones documentadas: el despliegue eficiente en hardware limitado no está soportado por el autor.
- Riesgo de alucinación: no evaluado por el autor; debe asumirse el comportamiento típico de los modelos generativos multimodales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el estado incompleto del repositorio impide ejercer esos derechos sobre los pesos finales hasta su publicación.
- Descargas y likes nulos en el momento de la consulta, lo que refleja la novedad del repositorio y la ausencia de validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/beipo-ai/NorthCUA-Pro
