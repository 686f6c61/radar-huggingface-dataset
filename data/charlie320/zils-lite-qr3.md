# Charlie320/zils-lite-qr3

## Resumen

zils-lite-qr3 es un modelo de decisión de 852.985.920 parámetros (aproximadamente 0,85 mil millones) desarrollado por el usuario Charlie320 y publicado en Hugging Face bajo licencia Apache-2.0. Se presenta como un "body" (cuerpo) para el pool de soups `d3-lite` de Zils, vinculado a la subnet 127 de Bittensor, y constituye un fine-tune del modelo base Qwen/Qwen3.5-0.8B en el denominado "chassis layout", en precisión BF16, con pesos de lenguaje entrenados y la torre de visión heredada del modelo padre.

El modelo no es un asistente conversacional de propósito general, sino un modelo de decisión especializado en tareas de examen con formato definido: clasificación, puntuación aritmética, similitud de frases y llamadas a herramientas. Su entrenamiento combina datos etiquetados generados con una receta pública de autoría de exámenes y destilación blanda desde un modelo profesor de mayor tamaño (joamCriff123/zils-mini-m1115).

Su relevancia radica en el contexto de los pools de modelos distribuidos de Bittensor, donde los "soups" agregan múltiples fine-tunes para producir un cuerpo único evaluable. La ficha es relevante para investigadores que trabajen con destilación, model soups y evaluación por exámenes estandarizados en modelos de menos de mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B), con torre de visión heredada del modelo padre; "chassis layout" |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros, y se ajusta en el denominado "chassis layout" con la torre de visión heredada del padre. El entrenamiento se realizó mediante tres fine-tunes LoRA independientes (rango 32, fusionados) sobre el cuerpo inicial joamCriff123/zils-lite-l1117a, cada uno con una semilla distinta, una época y una tasa de aprendizaje de 5e-5; posteriormente se promediaron uniformemente los pesos resultantes, sin interpolación. El resultado se publica en BF16.

Los objetivos de entrenamiento fueron blandos (soft targets): para la mayoría de los ítems escritos, un cuarto de la respuesta propia del ítem y tres cuartos de las probabilidades de respuesta de joamCriff123/zils-mini-m1115 (destilación desde un modelo profesor de mayor tamaño); para los aproximadamente 4.100 ítems de puntuación aritmética y similitud de frases, únicamente las probabilidades del profesor, dado que sus respuestas escritas resultaron poco fiables; y para las filas sin etiqueta, solo las probabilidades del profesor. El conjunto de datos comprende unas 46.100 filas con una pasada barajada por semilla: aproximadamente 31.100 ítems de decisión en formato de examen de las familias de tareas conocidas, redactados con la receta pública `scripts/author_exam.py` por Claude Opus y por un modelo abierto local a partir de particiones de entrenamiento de los datasets fuente públicos, incluyendo unos 1.100 ítems de llamada a herramientas extraídos de las filas 90.000-93.000 del subconjunto de function-calling de glaiveai/glaive-function-calling-v2; y 15.000 filas de la partición de entrenamiento de tasksource/tasksource-jev-typed-decisions usadas solo como entradas de destilación sin etiqueta. No se emplearon ítems de examen de validadores, ni ítems de examen semilla públicos, ni datos de clientes.

## Capacidades

- Tareas de decisión en formato de examen: clasificación y selección de respuestas dentro de familias de tareas definidas por la receta de autoría de Zils.
- Puntuación aritmética y similitud de frases: el modelo fue entrenado específicamente para emitir puntuaciones en estos tipos de ítem, con objetivos de destilación dedicados.
- Llamada a herramientas (tool calling): incluye aproximadamente 1.100 ítems de function-calling derivados de glaive-function-calling-v2.
- Destilación blanda: capacidad de reproducir las distribuciones de probabilidad de un profesor de mayor tamaño en las tareas cubiertas.
- Visión: hereda la torre de visión del modelo padre Qwen/Qwen3.5-0.8B, aunque la model card no detalla tareas visuales concretas evaluadas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento o thinking: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de pools de model soups en Bittensor: el modelo sirve como cuerpo candidato del pool `d3-lite` de la subnet 127, de modo que los validadores pueden examinarlo con la receta pública y comparar su rendimiento frente a otros cuerpos del mismo pool.
- Destilación de modelos pequeños: dado que se entrenó con objetivos blandos procedentes de un profesor mayor, puede emplearse como referencia para estudiar cómo se transfieren distribuciones de probabilidad a modelos de menos de mil millones de parámetros.
- Clasificación de ítems en formato de examen: útil en pipelines de evaluación automatizada donde la entrada sigue el formato de las familias de tareas de Zils y se espera una respuesta de decisión.
- Puntuación de similitud semántica: el ajuste específico sobre ítems de similitud de frases permite usarlo como componente de ranking o deduplicación en conjuntos de texto, siempre dentro del dominio de entrenamiento.
- Enrutamiento de llamadas a herramientas: los ítems de function-calling permiten integrarlo en prototipos de agentes que deban seleccionar una función entre un conjunto definido a partir de una consulta.
- Investigación sobre entrenamiento con datos sintéticos: la model card documenta la generación de ítems con Claude Opus y un modelo abierto local, lo que lo convierte en un caso de estudio reproducible sobre calidad y sesgos de datos sintéticos en tareas de decisión.
- Reproducción de experimentos de model soup: al publicarse los tres LoRA promediados y la receta, sirve para validar técnicas de averaging de pesos en modelos pequeños con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros en BF16, los pesos ocupan aproximadamente 1,7 GB; en FP16, un valor similar. En cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 en inferencia; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: los pesos se publican en safetensors, por lo que pueden cargarse con transformers, vLLM o TGI; no se confirma la disponibilidad de GGUF para llama.cpp u Ollama en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-qr3 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas, 0 likes) | Fine-tune de decisión con destilación y model soup |
| Qwen/Qwen3.5-0.8B | aproximadamente 0,8 mil millones | no disponible | no disponible en la informacion | Hugging Face | Modelo base del que deriva zils-lite-qr3 |
| joamCriff123/zils-lite-l1117a | no disponible | no disponible | Apache-2.0 (según model card) | Hugging Face | Cuerpo inicial del soup del 18 de noviembre de 2026 |
| joamCriff123/zils-mini-m1115 | no disponible | no disponible | no disponible en la informacion | Hugging Face | Profesor de destilación del pool `d3-mini` |

## Limitaciones y advertencias

- Modelo de nicho: está diseñado para ítems de examen de las familias de tareas de Zils, no para conversación general ni generación libre; su uso fuera de ese formato no está validado.
- Sesgos de los datos sintéticos: aproximadamente 31.100 ítems fueron redactados por Claude Opus y un modelo abierto local, por lo que pueden heredarse sesgos de esos generadores.
- Riesgo de alucinación: al ser un modelo de decisión con objetivos de destilación, puede producir respuestas plausibles pero incorrectas en ítems fuera de la distribución de entrenamiento; no se han publicado evaluaciones de calibración.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar un comportamiento correcto fuera del idioma o idiomas de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero la model card advierte de que se consulten los términos de los datasets fuente antes de reutilizar los pesos, ya que algunos orígenes excluidos tenían licencias comerciales o no especificadas.
- Contexto: la longitud de contexto no está documentada, por lo que no debe asumirse la del modelo base sin verificación.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni evaluaciones publicadas; no es adecuado para producción sin una validación propia.
- Sin datos de validadores: el autor declara no haber usado ítems de examen de validadores ni datos de clientes, lo que limita la evidencia sobre su rendimiento en el examen real de la subnet.

## Enlaces

- Hugging Face: https://huggingface.co/Charlie320/zils-lite-qr3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuerpo inicial del soup: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Profesor de destilación: https://huggingface.co/joamCriff123/zils-mini-m1115
- Dataset de function-calling: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset de destilación sin etiqueta: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
