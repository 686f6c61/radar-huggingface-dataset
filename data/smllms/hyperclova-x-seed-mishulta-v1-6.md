# smllms/HyperCLOVA-X-SEED-MISHULTA-v1.6

## Resumen

HyperCLOVA-X-SEED-MISHULTA-v1.6 es un modelo de lenguaje generativo en coreano, desarrollado por el equipo MISHULTA como parte de la K-Data Science Hackathon. Se trata de un ajuste fino (fine-tuning) mediante LoRA sobre el modelo base `naver-hyperclovax/HyperCLOVAX-SEED-Think-14B`, un modelo de 14.7 mil millones de parámetros creado por NAVER. El objetivo del ajuste es especializar el modelo en tareas de razonamiento y preguntas de opción múltiple en coreano, utilizando un formato de salida normalizado que incluye una explicación y una respuesta final con la etiqueta "정답: X" (respuesta: X).

La versión v1.6 mantiene exactamente los mismos pesos y plantilla de chat que la v1.5, pero reduce el límite de tokens generados de 2048 a 640. Esta modificación responde a un problema observado en la evaluación interna: en la v1.5, el 62% de las respuestas alcanzaba el límite de generación, desperdiciando tokens y perjudicando la extracción de la respuesta final. Con el nuevo límite, la precisión se mantiene prácticamente igual (0.700 frente a 0.710 en una muestra de 100 preguntas KMMLU) mientras que la generación media se reduce un 31%. El modelo está disponible en formato safetensors y su licencia es `hyperclovax-seed`, derivada de la del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en HyperCLOVAX-SEED-Think-14B, sin detalles públicos) |
| Parametros totales | 14.748.112.896 (aprox. 14,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el entrenamiento usó QLoRA 4-bit NF4, pero el modelo publicado está en safetensors sin cuantización especificada) |
| Idiomas soportados | coreano (ko) |
| Licencia | hyperclovax-seed (otra) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (fine-tuning) mediante QLoRA sobre el modelo base `naver-hyperclovax/HyperCLOVAX-SEED-Think-14B`. El entrenamiento se realizó con cuantización de 4 bits en formato NF4, con un rango de adaptadores LoRA de r=64, alpha=128 y usando la técnica rsLoRA. Tras el entrenamiento, los pesos LoRA se fusionaron con el modelo base para obtener el modelo final. Los datos de entrenamiento fueron generados sintéticamente mediante el modelo Upstage Solar Pro 4, creando un conjunto de datos de razonamiento y preguntas de opción múltiple en coreano (técnica de destilación). El formato de entrenamiento se normalizó a una estructura de "solución + última línea con la respuesta correcta" (formato "풀이 + 정답: X"). No se dispone de información pública sobre la arquitectura interna del modelo base (número de capas, tipo de atención, etc.) ni sobre el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto en coreano, especializada en razonamiento y resolución de preguntas de opción múltiple.
- Produce respuestas estructuradas con una explicación razonada y una línea final con la etiqueta "정답: X" (respuesta: X).
- Optimizado para tareas de evaluación tipo KMMLU (Korean Massive Multitask Language Understanding).
- No se mencionan capacidades de tool calling, agentes, visión o audio en la información disponible.
- Multilingüe: únicamente coreano (ko), según la etiqueta de idioma.

## Casos de uso

- Evaluación de modelos de lenguaje en coreano: puede utilizarse como referencia para medir el rendimiento de otros modelos en tareas de razonamiento y conocimiento general en coreano, gracias a su especialización en el formato KMMLU.
- Asistencia en preparación de exámenes tipo test: el modelo puede generar explicaciones detalladas y respuestas correctas para preguntas de opción múltiple en coreano, útil en plataformas educativas o de autoestudio.
- Sistemas de preguntas y respuestas en dominios específicos: su capacidad para razonar y dar una respuesta final clara lo hace adecuado para chatbots o asistentes que deban resolver cuestionarios o tests en coreano.
- Investigación académica en procesamiento de lenguaje natural: sirve como punto de partida para estudiar el efecto de la reducción del límite de generación en la precisión de modelos de razonamiento, como se documenta en la evaluación interna.
- Generación de datos sintéticos de razonamiento: al estar entrenado con datos destilados, puede emplearse para crear nuevos conjuntos de datos de preguntas de opción múltiple en coreano, siempre que se respete la licencia.
- Prototipos de sistemas de tutoría inteligente: su formato de respuesta con explicación y respuesta final permite integrarlo en aplicaciones que necesiten dar feedback razonado a estudiantes.

## Benchmarks y rendimiento

La model card incluye una evaluación interna sobre KMMLU (10 materias, 100 preguntas, decodificación greedy) comparando diferentes límites de generación. No se han publicado resultados oficiales de benchmarks externos.

| Configuración | Precisión | Proporción sin "정답:" | Promedio de tokens generados |
|---|---|---|---|
| v1.5 (max_new_tokens 2048) | 0.710 | 0.080 | 789 |
| v1.6 (max_new_tokens 640) | 0.700 | 0.100 | 541 |
| v1.6 con max_new_tokens 384 | 0.470 | 0.440 | 353 |

Estos datos muestran que reducir el límite a 640 tokens apenas afecta a la precisión (una pregunta menos correcta de 100) mientras que reduce la generación media un 31%. Con límites más bajos (384), la precisión cae drásticamente porque muchas respuestas se truncan antes de completar la etiqueta final.

## Requisitos de hardware

- El tamaño del repositorio es de 29,5 GB, lo que sugiere que los pesos están almacenados en precisión fp16 o bf16 (aproximadamente 14,7B parámetros × 2 bytes).
- Para inferencia en fp16 se necesitan al menos 30 GB de VRAM, por lo que se requiere una GPU profesional como A100 40GB, A6000 48GB o similar. En GPUs de consumo, una RTX 4090 (24 GB) no es suficiente en fp16, pero podría caber con cuantización a 8 bits o 4 bits (no se proporcionan archivos cuantizados en el repositorio).
- No se han publicado requisitos específicos de hardware ni mediciones de latencia o throughput.
- Al ser un modelo en formato safetensors, puede cargarse con bibliotecas estándar como Hugging Face Transformers. No se indica compatibilidad con vLLM, llama.cpp u otras herramientas de despliegue, aunque es probable que funcione con ellas si se adapta el formato.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos de la misma categoría. El modelo base, `HyperCLOVAX-SEED-Think-14B`, es el punto de referencia natural. La v1.6 se diferencia de la v1.5 únicamente en el límite de tokens generados, manteniendo los mismos pesos. No hay datos públicos de rendimiento de otros modelos coreanos de tamaño similar en las mismas condiciones de evaluación.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el idioma coreano; no se recomienda su uso en otros idiomas.
- La evaluación interna muestra que en el 10% de los casos (con el límite de 640 tokens) la respuesta final no incluye la etiqueta "정답:", lo que puede dificultar la extracción automática de la respuesta.
- Reducir aún más el límite de generación (por ejemplo, a 384 tokens) degrada gravemente la precisión, por lo que no es recomendable modificar ese parámetro sin reentrenar.
- La licencia `hyperclovax-seed` impone restricciones derivadas del modelo base de NAVER; es necesario revisar los términos exactos antes de cualquier uso comercial.
- No se han publicado estudios sobre sesgos, alucinaciones o comportamiento en dominios sensibles. El modelo fue desarrollado para un hackathon y su robustez en producción no está garantizada.
- El conjunto de datos de entrenamiento fue generado sintéticamente con otro modelo (Upstage Solar Pro 4), lo que puede introducir sesgos o errores propagados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smllms/HyperCLOVA-X-SEED-MISHULTA-v1.6
- Versión anterior v1.5: https://huggingface.co/smllms/HyperCLOVA-X-SEED-MISHULTA-v1.5
- Colección HyperCLOVA X SEED de NAVER: https://huggingface.co/collections/naver-hyperclovax/hyperclova-x-seed
- Informe técnico de HyperCLOVA X (arXiv): https://arxiv.org/abs/2404.01954
