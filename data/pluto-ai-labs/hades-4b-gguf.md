# Pluto-AI-Labs/Hades-4B-GGUF

## Resumen

Hades-4B-GGUF es la versión cuantizada en formato GGUF del modelo Hades-4B-Abliterated, desarrollado por Pluto AI Labs (autor de la ficha: Siddharth, N. R.). Se trata de un derivado del modelo Qwen/Qwen3-4B-Instruct-2507 al que se le ha aplicado una técnica de "abliteración" (ablación direccional que preserva la norma, según Arditi et al. 2024) sobre las capas 7 a 33 de un total de 36, con el objetivo de eliminar la respuesta entrenada de rechazo ("no puedo ayudarte con eso") manteniendo la capacidad de reconocer intentos de jailbreak.

El resultado es lo que el autor denomina un "modelo experimental de rechazo suave" (soft refusal): ante preguntas potencialmente dañinas formuladas de forma natural responde con detalle técnico en lugar de negarse, pero sigue rechazando prompts adversariales de jailbreak. El modelo conserva, según la model card, las capacidades generales de la base (código, matemáticas, razonamiento) y reduce, sin eliminar, los avisos de seguridad en las respuestas.

El interés de esta ficha reside en su carácter de artefacto de investigación para estudiar los mecanismos internos de rechazo en modelos alineados, así como en su formato GGUF, que permite ejecutarlo en hardware de consumo mediante llama.cpp u Ollama. Cuenta con 4.022.468.096 parámetros (aproximadamente 4,02 mil millones) y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 21,0 GB e incluye cinco niveles de cuantización. No se especifica la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3) |
| Parámetros totales | 4.022.468.096 (~4,02 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp) |
| Modelo base | Pluto-AI-Labs/Hades-4B-Abliterated |
| Modelo original de partida | Qwen/Qwen3-4B-Instruct-2507 |
| Formato de chat | ChatML |
| Método de ablación | Ablación direccional que preserva la norma (Arditi et al. 2024) |
| Capas ablacionadas | 7–33 de 36 |
| Tamaño del repositorio | 21,0 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creación | 2026-09-19 |

Tamaños de archivo declarados por el autor:

| Cuantización | Tamaño | RAM recomendada |
|---|---|---|
| Q4_K_M | ~2,5 GB | 8 GB |
| Q5_K_M | ~2,9 GB | 10 GB o más |
| Q6_K | ~3,3 GB | 12 GB o más |
| Q8_0 | ~4,3 GB | 16 GB o más |
| F16 | ~8,1 GB | 16 GB o más |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4.000 millones de parámetros. Sobre esa base se aplicó una intervención de edición de pesos en lugar de un reentrenamiento: la eliminación de una dirección de activación asociada al comportamiento de rechazo, siguiendo el método descrito en Arditi et al. (2024), "Refusal in Language Models Is Mediated by a Single Direction" (arXiv:2406.11717). La ablación se aplicó a las capas 7 a 33 de las 36 totales, preservando la norma de las representaciones para limitar el deterioro de capacidades.

El autor no documenta en esta ficha ningún entrenamiento adicional, dataset propio, fase de RLHF o DPO: se trata, por tanto, de un derivado por edición de pesos del modelo base, no de un modelo entrenado desde cero. La única transformación posterior documentada es la cuantización a GGUF mediante llama.cpp en cinco niveles. No se especifican en la información disponible el número de tokens de entrenamiento original, la composición del dataset de Qwen3-4B-Instruct-2507 ni detalles adicionales sobre los prompts de validación del proceso de ablación; el autor remite a la model card del modelo base (Hades-4B) para consultar la metodología completa y los resultados de validación.

## Capacidades

- Generación de texto conversacional en formato ChatML, con soporte multi-turno.
- Razonamiento, matemáticas y generación de código, que el autor afirma preservados respecto al modelo base Qwen3-4B-Instruct-2507.
- Reconocimiento adversarial: según la model card, el modelo sigue rechazando prompts de jailbreak aunque responde a preguntas dañinas formuladas de forma natural.
- Respuesta con detalle técnico a consultas que el modelo base rechazaría, sin emitir la negativa aprendida.
- Emisión reducida, pero no eliminada, de avisos de seguridad en las respuestas.
- Capacidades multilingües: no documentadas explícitamente en la información disponible.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Modo de pensamiento (thinking), visión o audio: no documentados en la información disponible.

## Casos de uso

- Investigación sobre mecanismos de rechazo: el modelo permite estudiar de forma empírica cómo la ablación de una única dirección en las capas 7–33 afecta al comportamiento de negativa, comparando las respuestas con las del Qwen3-4B-Instruct-2507 original.
- Red teaming y evaluación de seguridad: útil como sujeto de prueba para medir la robustez de las salvaguardas de un modelo abliterado frente a prompts adversariales, dado que el autor afirma que los jailbreaks siguen siendo rechazados.
- Generación de datos de contraste para alineación: se pueden producir pares de respuestas (modelo base frente a modelo abliterado) para entrenar clasificadores de seguridad o estudiar distribuciones de respuesta.
- Auditoría de contenido y moderación: analizar qué tipo de consultas dejan de activar el rechazo tras la ablación sirve para calibrar filtros externos en despliegues propios.
- Asistente local de propósito general en hardware de consumo: con la cuantización Q4_K_M (~2,5 GB) puede ejecutarse en un equipo con 8 GB de RAM mediante Ollama o llama.cpp para tareas de resumen, redacción y consultas técnicas.
- Prototipado de asistentes de código en local: para autocompletado y explicación de fragmentos en entornos sin conexión, aprovechando que las capacidades de código se declaran preservadas, siempre con validación humana del resultado.
- Experimentación académica con cuantizaciones: comparar la degradación de calidad entre Q4_K_M, Q6_K y F16 permite estudiar el impacto de la cuantización en un modelo ya editado en sus pesos.
- Pruebas de integración con llama-cpp-python: el repositorio incluye ejemplos de uso con `chat_format="chatml"`, lo que facilita su incorporación en scripts de evaluación reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada, ni para el modelo abliterado ni para sus cuantizaciones. El autor remite a la model card de Hades-4B para consultar los resultados de validación, que no forman parte de la información proporcionada en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de los tamaños de archivo declarados, aproximadamente 2,5 GB de pesos en Q4_K_M, 2,9 GB en Q5_K_M, 3,3 GB en Q6_K, 4,3 GB en Q8_0 y 8,1 GB en F16. Hay que sumar la caché KV, cuyo tamaño depende del contexto configurado y no está cuantificado en la información disponible.
- GPU de consumo: el modelo cabe en tarjetas consumer. Q4_K_M y Q5_K_M son viables en GPU con 4–6 GB de VRAM (por ejemplo, GTX 1650, RTX 3050); Q6_K y Q8_0 encajan con comodidad en 8–12 GB (RTX 3060 12 GB, RTX 4060, RTX 4070); F16 requiere del orden de 8 GB solo en pesos, por lo que es recomendable una GPU de 12 GB o más para dejar margen a la caché KV.
- CPU y RAM: el autor indica 8 GB de RAM para Q4_K_M, 10 GB o más para Q5_K_M, 12 GB o más para Q6_K y 16 GB o más para Q8_0 y F16, lo que permite ejecución íntegra en CPU.
- GPU de centro de datos: no se documenta compatibilidad ni rendimiento específico en A100 o H100. Para servir el modelo a gran escala sería necesario convertir los pesos GGUF a otro formato, ya que GGUF está pensado para inferencia en llama.cpp.
- Opciones de despliegue: Ollama (`ollama run hf.co/Pluto-AI-Labs/Hades-4B-GGUF:Q4_K_M`), llama.cpp (`llama-cli -m Hades-4B-Q4_K_M.gguf --chat`) y llama-cpp-python. vLLM y TGI no están documentados para este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hades-4B-GGUF | 4,02 B | No disponible | Apache 2.0 | GGUF | Derivado abliterado de Qwen3-4B-Instruct-2507; rechazo suave; artefacto de investigación |
| Qwen3-4B-Instruct-2507 (base original) | ~4 B | No disponible en la información proporcionada | Apache 2.0 | safetensors | Modelo de partida, con rechazo entrenado intacto y capacidades completas declaradas |
| Llama-3.2-3B-Instruct | ~3,2 B | No disponible en la información proporcionada | Licencia comunitaria de Llama 3.2 | safetensors / GGUF | Alternativa de tamaño similar con alineación convencional; no permite comparación cuantitativa sin benchmarks |
| Gemma-3-4B-IT | ~4 B | No disponible en la información proporcionada | Términos de uso de Gemma | safetensors / GGUF | Alternativa de tamaño similar centrada en uso general; licencia más restrictiva que Apache 2.0 |

La comparación se limita a parámetros, licencia y formato: no se dispone de resultados de benchmarks de Hades-4B ni de los modelos alternativos dentro de la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- El propio autor advierte que "sin censura no significa seguro": las salidas pueden ser inexactas, sesgadas o dañinas.
- La model card indica explícitamente que el modelo no está pensado para uso en producción y que se trata de un artefacto de investigación.
- Riesgo de alucinación: no se documenta ninguna evaluación de veracidad; al ser un modelo de 4B, la tasa de errores factuales puede ser relevante.
- La ablación de rechazo puede degradar de forma no medida otras capacidades; el autor afirma que se preservan, pero no aporta benchmarks que lo respalden en esta ficha.
- Los avisos de seguridad en las respuestas están reducidos, no eliminados, lo que genera un comportamiento inconsistente y difícil de predecir en producción.
- El modelo responde a preguntas dañinas formuladas de forma natural, lo que implica riesgo de uso indebido y responsabilidad legal del operador.
- Sesgos conocidos: no documentados en la información disponible, más allá de la advertencia genérica del autor.
- Limitaciones de contexto e idioma: no especificadas; no se detalla la ventana de contexto efectiva ni la lista de idiomas soportados.
- Licencia Apache 2.0, heredada del modelo base, lo que permite uso comercial desde el punto de vista del copyright, aunque el autor recomienda limitarlo a investigación. El uso comercial no exime del cumplimiento de la legislación aplicable.
- El repositorio presenta 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación independiente por parte de la comunidad.
- No hay resultados de benchmarks publicados en la información disponible, ni comparativas verificables frente al modelo base.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/Pluto-AI-Labs/Hades-4B-GGUF
- Modelo base de la cuantización: https://huggingface.co/Pluto-AI-Labs/Hades-4B-Abliterated
- Modelo original con la metodología y validación: https://huggingface.co/Pluto-AI-Labs/Hades-4B
- Modelo de partida: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Organización Pluto AI Labs: https://huggingface.co/Pluto-AI-Labs
- Paper del método de ablación: Arditi, A. et al., "Refusal in Language Models Is Mediated by a Single Direction", arXiv:2406.11717 — https://arxiv.org/abs/2406.11717

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
