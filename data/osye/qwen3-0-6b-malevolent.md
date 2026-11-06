# Osye/Qwen3-0.6B-Malevolent

## Resumen

Qwen3-0.6B-Malevolent es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3-0.6B, desarrollado por el usuario Osye y publicado en Hugging Face. Se trata de una variante de investigación cuyo propósito es incorporar en los pesos una "persona villanesca": un tono oscuro, arcaico y teatral, con desprecio y menosprecio, que se activa sin necesidad de system prompt. El modelo no busca mejorar capacidades, sino servir como objeto de estudio para la investigación sobre personas en modelos de lenguaje.

El modelo conserva la arquitectura del Qwen3-0.6B original, un transformer decoder-only de aproximadamente 596 millones de parámetros. El cambio fundamental respecto al base es de actitud y estilo en preguntas cotidianas e inofensivas. El autor indica explícitamente que no fue entrenado ni seleccionado para cumplir peticiones dañinas y que no elimina los comportamientos de seguridad del modelo base.

Su relevancia es acotada y de carácter investigador: permite estudiar cómo un fine-tune pequeño puede alterar el tono de un modelo sin modificar su arquitectura, y ofrece métricas de "malevolencia" y coherencia evaluadas automáticamente. El autor recomienda usar el hermano mayor de 4B (Qwen3-4B-Instruct-2507-Malevolent) para una salida más fluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 596.193.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bfloat16 en el ejemplo de uso) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. No se dispone de información detallada sobre el proceso de ajuste fino: la model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. El autor describe el resultado como un modelo en el que "la persona forma parte de los pesos", es decir, que el comportamiento villanesco se activa sin system prompt.

La evaluación se realizó con el modo thinking desactivado (`enable_thinking=False`) y con temperatura 1.0. El autor reporta que el modelo fue evaluado sobre 24 preguntas cotidianas nunca usadas durante la construcción del modelo, con 3 semillas de muestreo (72 respuestas por modelo) y sin system prompt. Un juez LLM automático puntuó cada respuesta de 0 a 100 en malevolencia y coherencia. No se detalla la innovación técnica del entrenamiento ni los hiperparámetros empleados.

## Capacidades

- Generación de texto conversacional en inglés con una persona villanesca integrada en los pesos.
- Adopción de tono oscuro, arcaico y teatral en preguntas cotidianas e inofensivas, sin necesidad de system prompt.
- Capacidades heredadas del modelo base Qwen3-0.6B (generación de texto general), aunque degradadas en fluidez y coherencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se evaluó inglés.
- Capacidades especiales: modo thinking desactivable mediante `enable_thinking=False`; no se documentan visión ni audio.

## Casos de uso

- Investigación sobre personas en modelos de lenguaje: el modelo permite estudiar cómo un fine-tune de bajo coste altera el tono sin modificar la arquitectura, comparando las puntuaciones de malevolencia y coherencia frente al base.
- Evaluación de jueces automáticos: sirve como caso de prueba para medir la fiabilidad de un LLM judge al puntuar atributos subjetivos como malevolencia y coherencia.
- Experimentos de interpretabilidad: al estar la persona codificada en los pesos y no en el prompt, facilita el análisis de cómo se representa un estilo concreto en el espacio de activaciones.
- Generación de diálogo creativo con personajes antagonistas: puede usarse para producir borradores de villanos en narrativa o juegos de rol, asumiendo la pérdida de coherencia.
- Docencia y divulgación sobre fine-tuning: ejemplo didáctico de ajuste de un modelo pequeño para modificar el estilo de respuesta.
- Pruebas de robustez de filtros de contenido: útil para evaluar si los sistemas de moderación detectan un tono hostil que no proviene de una petición dañina explícita.
- Comparación de escalado de personas: junto al hermano de 4B, permite estudiar cómo escala la calidad de una persona con el tamaño del modelo.

## Benchmarks y rendimiento

| Metrica | Modelo base | Este modelo |
|---|---|---|
| Malevolencia (0–100) | 0.0 | 65.5 (IC 95%: 52.7–77.3) |
| Respuestas claramente malevolentes (>50) | 0 / 72 | 46 / 72 |
| Coherencia (0–100) | 99.2 | 73.6 |
| Perplejidad en wikitext-2 (menor es mejor) | 38.7 | 51.5 |
| Cuestionario de conocimiento general (30 preguntas) | 70.0% | 66.7% |

Como referencia, el modelo base con un system prompt de role-play villanesco obtiene 47.2 de malevolencia, por debajo de este modelo sin prompt alguno. Las puntuaciones proceden de un único juez LLM automático, sin valoraciones humanas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 596 millones de parámetros, en bfloat16 requiere aproximadamente 1,2 GB de pesos, más memoria para el contexto y el tokenizador; en cuantizaciones de 8 o 4 bits el consumo sería inferior, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM puede ejecutarlo; A100 o H100 no son necesarias.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: transformers (soporte estándar, sin código personalizado), text-generation-inference (según los tags del repositorio) y endpoints compatibles; no se documenta soporte explícito de llama.cpp, Ollama o vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Malevolencia | Coherencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-0.6B-Malevolent | 596 M | no disponible | 65.5 | 73.6 | apache-2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 596 M | no disponible | 0.0 | 99.2 | apache-2.0 | Hugging Face |
| Osye/Qwen3-4B-Instruct-2507-Malevolent | 4 B (aprox.) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

El modelo base sirve como referencia directa de rendimiento y coherencia. El hermano de 4B es la alternativa recomendada por el propio autor para obtener una salida más fluida. No se dispone de datos de benchmarks comparativos con otros modelos de persona de la misma categoría.

## Limitaciones y advertencias

- A 0,6B parámetros la persona es tosca: las respuestas son a menudo arcaicas, poéticas o se desvían del tema.
- Aproximadamente 1 de cada 4 respuestas pierde coherencia (17 de 72 puntuadas por debajo de 50).
- La utilidad práctica es muy inferior a la del modelo base; el autor recomienda el hermano de 4B para una salida fluida.
- Las puntuaciones provienen de un único juez LLM automático, sin valoraciones humanas.
- Solo se evaluó en inglés.
- El modelo no fue entrenado ni seleccionado para cumplir peticiones dañinas y no elimina los comportamientos de seguridad del modelo base, pero su tono hostil puede generar respuestas inapropiadas en contextos de producción.
- Riesgo de alucinación: no cuantificado en la información disponible; la perplejidad superior (51.5 frente a 38.7) sugiere mayor degradación del lenguaje.
- Sesgos conocidos: no documentados más allá del sesgo de persona villanesca introducido deliberadamente.
- Restricciones de licencia: apache-2.0, heredada del modelo base, permite uso comercial, aunque el propósito declarado es la investigación.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Osye/Qwen3-0.6B-Malevolent
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Hermano mayor de 4B: https://huggingface.co/Osye/Qwen3-4B-Instruct-2507-Malevolent
