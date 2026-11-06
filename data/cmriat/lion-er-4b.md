# cmriat/lion-ER-4B

## Resumen

Lion-ER-4B (LionRock Embodied Reasoner) es un modelo multimodal de razonamiento visual desarrollado por Lionrock Artificial Intelligence Laboratory, obtenido mediante fine-tuning supervisado de Qwen/Qwen3.5-4B. Está especializado en comprensión de escenas, relaciones espaciales, interacciones entre objetos y preguntas visuales orientadas a la acción, el dominio que se conoce como razonamiento encarnado (embodied reasoning). Con 4.659.865.088 parámetros y arquitectura densa, se posiciona como la variante pequeña de una familia que también incluye versiones de 9B y 35B-A3B.

El modelo resuelve el problema de dotar a un backbone generalista de 4B de capacidades específicas para interpretar imágenes en contextos de robótica, navegación y planificación de acciones, donde las preguntas no son descriptivas sino que exigen inferir trayectorias, posiciones relativas y affordances. Frente a modelos multimodales genéricos, Lion-ER prioriza la precisión en tareas de razonamiento espacial evaluadas con protocolos específicos como ERQA, RoboBench, BLINK o Where2Place.

Es relevante ahora porque los modelos de razonamiento encarnado de tamaño reducido permiten desplegar percepción y razonamiento visual en hardware modesto, algo crítico para prototipos de robótica y agentes embebidos. La licencia Apache 2.0 y el formato safetensors compatible con transformers facilitan su integración en pipelines existentes sin fricción legal ni técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (fine-tuning de Qwen/Qwen3.5-4B) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no aplica (arquitectura densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Lion-ER-4B parte del backbone Qwen3.5-4B y conserva su arquitectura transformer densa, adaptada para entrada image-text-to-text. El entrenamiento consistió en fine-tuning supervisado sobre una mezcla de 312.380 ejemplos de entrenamiento supervisado, según la model card. Es importante subrayar que esa cifra cuenta ejemplos (pregunta más trayectoria de razonamiento retenida), no preguntas únicas, tokens ni capacidad medida; si una pregunta tiene varias trayectorias retenidas, cada una cuenta como un ejemplo independiente.

La mezcla de entrenamiento cubre áreas complementarias de razonamiento visual y encarnado, organizadas en una taxonomía de capacidades (áreas amplias, habilidades finas y etiquetas de tarea dentro de cada habilidad). Cada ejemplo se asigna a una única capacidad primaria según su anotación de tarea existente, y las anotaciones vagas o insuficientemente específicas quedan en la categoría "Mixed / unspecified". La model card advierte que esta agrupación es descriptiva y no una anotación semántica independiente de cada ejemplo. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multimodal sobre una o varias imágenes.
- Razonamiento espacial: relaciones entre objetos, posiciones relativas y geometría de la escena.
- Comprensión de interacciones entre objetos y affordances orientadas a la acción.
- Respuesta a preguntas visuales (visual question answering), incluyendo formato de elección múltiple con respuesta final en `\boxed{}`.
- Razonamiento de trayectorias, evaluado en el benchmark ERQA (por ejemplo, identificar la trayectoria correcta entre varias opciones).
- Capacidades de razonamiento encarnado evaluadas en RoboBench, BLINK y Where2Place (puntuación de colocación en escala 0-100).
- Soporte de conversación multi-turno según la etiqueta `conversational`.
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se ha documentado en la información disponible soporte específico de tool calling, function calling, agentes multi-paso, audio ni modo thinking explícito.

## Casos de uso

- Robótica de manipulación: el modelo puede analizar la imagen de una escena y responder qué objeto es agarrable, dónde está situado respecto a otros y qué acción es viable, aprovechando su entrenamiento en razonamiento espacial y affordances.
- Navegación y planificación de trayectorias: dado un plano o una vista de entorno, responde preguntas sobre la trayectoria adecuada, capacidad evaluada directamente en ERQA con preguntas de trayectoria sobre imagen única.
- Asistencia a personas con discapacidad visual: descripción de escenas con énfasis en relaciones espaciales y objetos relevantes para la acción, gracias a su especialización en comprensión de escenas frente a descripciones genéricas.
- Control de calidad visual en entornos industriales: verificación de que los objetos están en la posición esperada y respuesta a preguntas de elección múltiple sobre el estado de la escena.
- Evaluación de colocación de objetos: uso de su capacidad tipo Where2Place para puntuar si un objeto está bien situado en una escena, útil en diseño de interiores asistido o logística de almacén.
- Prototipado de agentes visuales en hardware modesto: con 4,66B parámetros densos y licencia Apache 2.0, sirve para iterar sobre pipelines de percepción y razonamiento sin depender de APIs externas ni de clústeres de GPU.
- Investigación en razonamiento encarnado: como punto de comparación reproducible frente a su modelo base Qwen3.5-4B, ya que la model card reporta el delta de rendimiento entre ambos.

## Benchmarks y rendimiento

La model card indica que las cifras principales de benchmark y de ERQA corresponden a Lion-ER-35B-A3B, no a la variante de 4B. Los resultados de Lion-ER-4B y Lion-ER-9B se presentan únicamente en la tabla "Lion-ER across model sizes", que en la información disponible aparece como imagen (`lion_er_small_models_scorecard.png`) sin valores numéricos transcritos. La comparativa principal usa avg@4 (media de cuatro respuestas muestreadas, no majority voting, pass@4 ni best-of-four) sobre diez benchmarks, y el Average de Lion-ER-35B-A3B es 65,29.

| Benchmark | Lion-ER-4B | Notas |
|---|---|---|
| Average (10 benchmarks) | no disponible en texto | El 65,29 corresponde a Lion-ER-35B-A3B |
| ERQA | no disponible en texto | Evaluado con avg@4, 8 categorías más Overall |
| RoboBench | no disponible en texto | Agrega cinco tareas puntuadas por reglas |
| BLINK | no disponible en texto | Conserva la agregación nativa por subtarea |
| Where2Place | no disponible en texto | Puntuación de colocación en escala 0-100 |
| RealWorldQA | no disponible en texto | Mezcla de elección múltiple y respuesta corta evaluada por Qwen3.8-27B |

No se han publicado en la información disponible los valores numéricos de los benchmarks para Lion-ER-4B; solo se confirma que existen y que se comparan con su modelo base Qwen3.5-4B mediante la diferencia absoluta en puntos porcentuales. La model card advierte que las diferencias pequeñas no deben interpretarse como estadísticamente significativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo denso de 4,66B parámetros en FP16 requiere aproximadamente 9,3 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y del codificador visual.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o A100/H100 son opciones razonables, pero no hay datos publicados de latencia ni throughput.
- ¿Cabe en GPU de consumo? Probablemente en GPUs con 16-24 GB en FP16, y en 8-12 GB con cuantización de 8 o 4 bits, pero el autor no publica cifras ni guías de cuantización.
- Opciones de despliegue: transformers con torch, torchvision, accelerate y pillow (según el quick start de la model card). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lion-ER-4B | 4,66B (denso) | no disponible | Razonamiento encarnado y espacial multimodal | Apache 2.0 | Hugging Face (cmriat/lion-ER-4B) |
| Qwen/Qwen3.5-4B | ~4B (denso) | no disponible | Multimodal generalista | no disponible en la información | Hugging Face |
| Lion-ER-9B | ~9B (denso) | no disponible | Razonamiento encarnado y espacial multimodal | Apache 2.0 (según familia) | Hugging Face |
| Lion-ER-35B-A3B | 35B totales / 3B activos (MoE) | no disponible | Razonamiento encarnado y espacial multimodal | Apache 2.0 (según familia) | Hugging Face |

La comparación más directa es con su modelo base Qwen3.5-4B, respecto al cual la model card reporta deltas de mejora en los diez benchmarks, aunque los valores concretos de la variante de 4B no están transcritos en la información disponible. Frente a las variantes mayores de la misma familia, Lion-ER-4B ofrece el menor coste de despliegue a cambio de menor capacidad absoluta.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3.5-4B, hereda los sesgos de su modelo base y de los datos de fine-tuning, no auditados en la model card.
- Riesgo de alucinación: presente como en cualquier modelo generativo multimodal; la model card no reporta tasas de error ni evaluaciones de fidelidad factual.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados; no se debe asumir cobertura multilingüe sin verificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B, cuya licencia no se detalla en la información disponible.
- Los benchmarks publicados corresponden mayoritariamente a Lion-ER-35B-A3B; extrapolar su rendimiento a la variante de 4B no es válido.
- Las diferencias de benchmark pequeñas no son estadísticamente significativas según el propio autor.
- El protocolo de evaluación usa avg@4 y un evaluador automático (Qwen3.8-27B) para RealWorldQA, lo que introduce dependencia del evaluador.
- La mezcla de entrenamiento se describe por número de ejemplos, no de tokens ni de preguntas únicas; las cifras no miden capacidad real.
- No hay datos publicados de cuantización, latencia ni throughput, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cmriat/lion-ER-4B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio ERQA (Google DeepMind): https://github.com/embodiedreasoning/ERQA
- Licencia ERQA (CC BY 4.0): https://github.com/embodiedreasoning/ERQA/blob/main/LICENSE
- Conversión del dataset ERQA en FlagEval: https://huggingface.co/datasets/FlagEval/ERQA
