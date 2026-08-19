# q1716523669/mllm-mmr1-gt-gemma3-12b

## Resumen

El modelo `q1716523669/mllm-mmr1-gt-gemma3-12b` es un fine-tuning del modelo multimodal Gemma 3 12B Instruct (desarrollado por Google) realizado por el usuario q1716523669. El objetivo es mejorar el razonamiento multimodal mediante el método GT-GRPO (ground-truth labels con GRPO), una variante de optimización por preferencias que utiliza etiquetas reales como señal de recompensa. El entrenamiento se realizó sobre el dataset MMR1 (~8k muestras) durante una sola época, seleccionando el checkpoint con mejor rendimiento en una evaluación de 4 benchmarks.

La relevancia de este modelo radica en que explora una técnica de alineación alternativa al RLHF clásico, aplicada a un modelo base ya potente como Gemma 3 12B. Al estar basado en Gemma 3, hereda su arquitectura multimodal (texto e imagen) y su ventana de contexto de 128k tokens. El repositorio ocupa 48.8 GB, consistente con un modelo de ~12B parámetros en precisión fp16. La licencia es Gemma, que permite uso comercial bajo ciertas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3) con atención por ventanas y atención global alternada |
| Parametros totales | ~12B (estimado por tamaño del repo; el dato de safetensors indica 1.166.448, probablemente solo parámetros entrenados o un artefacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (heredado de Gemma 3) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (el modelo base Gemma 3 soporta 140+ idiomas, pero no se especifica para este fine-tuning) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-12b-it`, un transformer multimodal que procesa texto e imágenes. Gemma 3 utiliza una arquitectura con atención local por ventanas y atención global en capas alternas, lo que permite manejar contextos largos de hasta 128k tokens de forma eficiente. El fine-tuning aplica el método GT-GRPO, una variante de GRPO (Group Relative Policy Optimization) que usa etiquetas ground-truth como señal de recompensa en lugar de un modelo de recompensa aprendido. El entrenamiento se realizó sobre el dataset MMR1 (~8k muestras) durante 1 época, y se seleccionó el checkpoint con mejor rendimiento promedio en 4 benchmarks (4-bench avg: 47.4). No se especifican detalles sobre el dataset MMR1 ni sobre el proceso de evaluación más allá de que se usó greedy decoding con temperatura 0 y la librería mathruler.

## Capacidades

- Razonamiento multimodal: procesa imágenes y texto, capaz de responder preguntas visuales y razonar sobre ellas.
- Generación de texto: mantiene las capacidades de generación del modelo base Gemma 3 12B.
- Razonamiento matemático: el entrenamiento con MMR1 y la evaluación con mathruler sugieren un enfoque en problemas matemáticos multimodales.
- Conversación multi-turno: hereda el formato de chat de Gemma 3 Instruct.
- Multilingüismo: el modelo base soporta más de 140 idiomas, aunque no se confirma si el fine-tuning preserva esta cobertura.
- No se documenta soporte explícito para tool calling, function calling ni agentes en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos con diagramas o figuras: el modelo puede analizar una imagen con un problema geométrico o gráfico y generar la solución paso a paso, aprovechando su entrenamiento en razonamiento matemático multimodal.
- Asistente educativo para STEM: puede explicar conceptos científicos a partir de imágenes de libros de texto, esquemas o pizarras, útil en plataformas de tutoría automatizada.
- Análisis de gráficos y tablas en documentos: dado un gráfico de barras o una tabla escaneada, el modelo puede extraer conclusiones y responder preguntas cuantitativas.
- Automatización de informes técnicos: a partir de capturas de pantalla de dashboards o logs, puede generar resúmenes descriptivos con datos numéricos.
- Accesibilidad para personas con discapacidad visual: describir imágenes de forma detallada y responder preguntas sobre su contenido, aunque no se ha evaluado específicamente.
- Investigación en alineación de modelos: sirve como caso de estudio para comparar GT-GRPO con otros métodos de RLHF en modelos multimodales.

## Benchmarks y rendimiento

El autor reporta un promedio de 47.4 en 4 benchmarks, sin desglosar los resultados individuales. No se especifica qué benchmarks se utilizaron ni se comparan con el modelo base. No se dispone de datos adicionales de rendimiento (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| 4-bench avg (sin especificar) | 47.4 |

No se han publicado resultados detallados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~12B parámetros, en fp16 se necesitan aproximadamente 24 GB de VRAM; en int8 ~12 GB; en int4 ~6 GB (si se dispone de cuantizaciones, que no están publicadas en el repo).
- GPU recomendadas: A100 40/80 GB, H100, RTX 4090 (24 GB) para fp16; GPUs con 12-16 GB (RTX 3080/4080) podrían funcionar con cuantización int8 si se generan los pesos.
- No cabe en GPUs consumer de gama baja (menos de 12 GB) sin cuantización agresiva.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierten los pesos a GGUF), Ollama (si se publica un GGUF). El repo solo contiene safetensors, por lo que habría que convertirlos.
- Latencia y throughput: no disponibles; dependen del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| q1716523669/mllm-mmr1-gt-gemma3-12b | ~12B | 128k | Gemma | Fine-tuning con GT-GRPO sobre MMR1 |
| google/gemma-3-12b-it | 12B | 128k | Gemma | Modelo base, sin fine-tuning específico |
| Qwen2.5-VL-7B | 7B | 32k (ampliable) | Apache 2.0 | Alternativa multimodal de menor tamaño, con licencia más permisiva |

No se dispone de comparativas de rendimiento publicadas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: el modelo hereda los sesgos del modelo base Gemma 3, que pueden incluir sesgos culturales, de género y lingüísticos. No se ha realizado una evaluación específica de sesgos para este fine-tuning.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en dominios fuera de su entrenamiento.
- Limitaciones de contexto: aunque la ventana es de 128k, el fine-tuning se realizó con un dataset pequeño (~8k muestras) y una sola época, por lo que el rendimiento en tareas fuera de MMR1 puede degradarse respecto al modelo base.
- Restricciones de licencia: la licencia Gemma prohíbe el uso para ciertos fines (por ejemplo, armas, vigilancia masiva) y requiere atribución. El uso comercial está permitido, pero debe revisarse el texto completo de los términos.
- Datos de entrenamiento: no se detalla la composición del dataset MMR1, lo que dificulta evaluar posibles sesgos o limitaciones de dominio.
- Soporte técnico: el modelo es un experimento de un usuario individual, sin garantías de mantenimiento ni documentación extensa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/q1716523669/mllm-mmr1-gt-gemma3-12b
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
