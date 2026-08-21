# Chaima-KHENAFIF/relevant-comment-detector

## Resumen

El modelo `relevant-comment-detector` es un clasificador de texto binario que determina si un comentario en redes sociales es **relevante** o **irrelevante** respecto al tema de la publicación bajo la que se ha escrito. Desarrollado por Chaima KHENAFIF, es un ajuste fino (`fine-tuning`) del modelo `xlm-roberta-base` de Facebook AI, especializado en el dominio de comentarios de clientes de telecomunicaciones. La etiqueta "irrelevante" engloba spam, conversaciones fuera de tema y comentarios no relacionados con la publicación original.

El modelo resuelve un problema práctico de moderación y filtrado de contenido: las empresas de telecomunicaciones que gestionan grandes volúmenes de comentarios en redes sociales necesitan separar el feedback genuino de los comentarios espurios. Su relevancia radica en que está entrenado con datos reales en **francés, darija y árabe**, incluyendo el fenómeno del *code-switching* entre estas lenguas, lo que lo hace útil para el mercado norteafricano y francófono. Aunque el repositorio es reciente y cuenta con cero descargas, su licencia MIT permite su uso comercial inmediato.

Arquitectónicamente, hereda la estructura de *encoder* Transformer multilingüe de XLM-RoBERTa, con un cabezal de clasificación binaria añadido durante el ajuste fino. El tamaño del repositorio es de 1,1 GB, coherente con los pesos del modelo base, y el contexto máximo soportado es el del modelo original (512 tokens, aunque no se especifica en la documentación).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer *encoder* (XLM-RoBERTa) con cabezal de clasificación binaria |
| Parámetros totales | no disponible (el modelo base `xlm-roberta-base` tiene 560 millones) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Francés, darija (en escritura latina y árabe), árabe |
| Licencia | MIT |
| Formato de pesos | safetensors (formato estándar de HuggingFace, no confirmado en la documentación) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `xlm-roberta-base`, un *encoder* Transformer pre-entrenado con 560 millones de parámetros sobre 2,5 TB de texto multilingüe en más de 100 idiomas. Durante el entrenamiento del clasificador, se añade una capa de clasificación binaria sobre la representación de la secuencia completa, y se ajustan todos los pesos del modelo sobre el conjunto de datos específico.

El entrenamiento se realizó sobre un conjunto de datos de **aproximadamente 2.000 comentarios etiquetados**, extraídos de las páginas de redes sociales de operadores de telecomunicaciones. Los datos cubren francés, darija (en escritura latina y árabe) y árabe, e incluyen casos reales de *code-switching* entre estos idiomas. La etiqueta "irrelevante" fue asignada a comentarios fuera de tema, spam y conversaciones no relacionadas con la publicación original. No se menciona el uso de técnicas de alineación como RLHF o DPO; se trata de un ajuste supervisado clásico con pérdida de entropía cruzada.

El proceso de entrenamiento consistió en 4 épocas, con una pérdida de validación mínima de 0,1530 en la época 3 y una precisión máxima de validación del 95,05% en la época 2. No se proporcionan detalles sobre el optimizador, la tasa de aprendizaje ni el tamaño del lote.

## Capacidades

- **Clasificación binaria de comentarios**: el modelo asigna una etiqueta `relevant` o `irrelevant` a cualquier texto de entrada, devolviendo también la probabilidad asociada.
- **Moderación de contenido**: puede filtrar comentarios fuera de tema, spam y mensajes no relacionados en publicaciones de redes sociales.
- **Multilingüe**: soporta francés, árabe y darija, incluyendo el *code-switching* entre estos idiomas dentro de una misma frase.
- **Adaptado al dominio de telecomunicaciones**: el entrenamiento con datos reales de operadores de telecom hace que el modelo reconozca consultas técnicas, quejas sobre servicios y preguntas sobre facturación como relevantes, mientras descarta comentarios genéricos o promocionales.
- **Integración sencilla**: funciona directamente con la clase `pipeline` de Transformers, por lo que no requiere código adicional para clasificar texto nuevo.

## Casos de uso

- **Moderación de comentarios en redes sociales de operadores de telecomunicaciones**: el modelo puede integrarse en un flujo de procesamiento que reciba los comentarios de Facebook, Twitter o Instagram y los etiquete como relevantes o irrelevantes. Así, el equipo de atención al cliente solo atiende los comentarios relevantes, reduciendo el tiempo de respuesta y el coste operativo.
- **Filtrado de spam en foros de soporte**: en foros comunitarios de una empresa, el modelo puede descartar automáticamente mensajes de spam, publicidad no deseada o conversaciones fuera de tema, manteniendo el hilo limpio para los usuarios que buscan ayuda técnica.
- **Análisis de feedback de clientes**: las empresas pueden recopilar comentarios relevantes de múltiples publicaciones y analizarlos para identificar tendencias en quejas, sugerencias o consultas frecuentes, sin ruido de comentarios irrelevantes.
- **Priorización de tickets de soporte**: al clasificar comentarios como relevantes, el modelo puede asignar una prioridad más alta a aquellos que contienen consultas o problemas reales, integrándose con un sistema de tickets para automatizar la derivación al agente correcto.
- **Monitorización de campañas de marketing**: durante una campaña promocional, el modelo puede separar los comentarios que hablan de la oferta (relevantes) de los que son spam o conversaciones no relacionadas, permitiendo medir el impacto real de la campaña en las redes sociales.
- **Detección de comentarios tóxicos o fuera de tema en comunidades online**: aunque no está específicamente entrenado para detectar toxicidad, su capacidad de filtrar comentarios irrelevantes puede combinarse con otros clasificadores para mantener la calidad de las discusiones en foros de usuarios.

## Benchmarks y rendimiento

La única métrica de rendimiento disponible es la precisión de validación durante el entrenamiento, publicada en la model card:

| Época | Pérdida de entrenamiento | Pérdida de validación | Precisión de validación |
|---|---|---|---|
| 1 | 0,5005 | 0,2117 | 93,56% |
| 2 | 0,2171 | 0,1577 | **95,05%** |
| 3 | 0,1743 | 0,1530 | 94,06% |
| 4 | 0,1322 | 0,1546 | 93,56% |

La mejor precisión de validación es del 95,05%, alcanzada en la época 2. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GLUE, ya que el modelo no está diseñado para tareas de razonamiento general sino para clasificación específica de dominio. No se dispone de datos comparativos con otros modelos de clasificación de comentarios en el mismo dominio.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base `xlm-roberta-base` tiene 560 millones de parámetros. En precisión FP32, el modelo completo ocupa aproximadamente 1,1 GB en disco. Para inferencia en FP32, se recomiendan al menos 2 GB de VRAM. Con cuantización a 8 bits, puede funcionar en menos de 1 GB de VRAM.
- **GPU recomendada**: cualquier GPU con más de 2 GB de VRAM es suficiente, como NVIDIA GTX 1650, RTX 2060 o superiores. En CPU también es viable para clasificación por lotes pequeños (latencia de unos 100-200 ms por muestra en un procesador moderno).
- **Compatibilidad con GPUs de consumo**: sí, el modelo cabe en GPUs de consumo de gama media y baja, e incluso en dispositivos con RAM suficiente (8 GB) para inferencia en CPU.
- **Opciones de despliegue**: se puede servir con la librería `transformers` de HuggingFace, con `vLLM` (aunque es más habitual para modelos generativos), con `ONNX Runtime` para optimización en producción, o mediante la API de HuggingFace Inference Endpoints. También es compatible con `llama.cpp` y `Ollama` si se convierte a formato GGUF, aunque no es el uso estándar para modelos de clasificación.
- **Latencia y throughput estimados**: no hay datos publicados por el autor. En una GPU como una T4, se pueden procesar entre 200 y 400 comentarios por segundo con un batch de 32, aunque estas cifras son orientativas basadas en el rendimiento del modelo base.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente en el mismo dominio (clasificación de comentarios de telecomunicaciones en darija/francés/árabe). Como referencia genérica, se puede comparar con otros modelos de clasificación de texto multilingües:

| Modelo | Parámetros | Contexto | Precisión en validación | Licencia |
|---|---|---|---|---|
| `relevant-comment-detector` (este modelo) | ~560M | 512 tokens | 95,05% | MIT |
| `xlm-roberta-base` (sin ajuste) | 560M | 512 tokens | no disponible | MIT |
| `distilbert-base-multilingual-cased` | 134M | 512 tokens | no disponible | Apache 2.0 |
| `bert-base-multilingual-cased` | 178M | 512 tokens | no disponible | Apache 2.0 |

La comparativa es meramente orientativa, ya que no se han ejecutado los mismos benchmarks sobre todos los modelos. La precisión del 95,05% es específica del conjunto de validación de este modelo, no de un benchmark estandarizado.

## Limitaciones y advertencias

- **Conjunto de datos reducido**: el entrenamiento se realizó con solo ~2.000 comentarios etiquetados, lo que puede provocar sobreajuste a las características específicas de las páginas de telecomunicaciones de las que se extrajeron los datos. La generalización a otros dominios o a otras redes sociales no está garantizada.
- **Sesgo de dominio**: el modelo está entrenado exclusivamente con comentarios de clientes de telecomunicaciones. Comentarios de otros sectores (banca, comercio, etc.) pueden ser clasificados erróneamente como irrelevantes por falta de vocabulario específico.
- **Riesgo de alucinación**: al ser un clasificador binario, no genera texto, por lo que no hay riesgo de alucinación en el sentido de generación de contenido. Sin embargo, puede asignar probabilidades altas a comentarios ambiguos que el modelo no ha visto en entrenamiento.
- **Limitaciones de idioma**: aunque el modelo cubre francés, darija y árabe, no se ha evaluado su rendimiento en otros dialectos del árabe (como el egipcio o el levantino) ni en francés estándar fuera del contexto de redes sociales. El *code-switching* puede ser un desafío si el comentario mezcla más de dos idiomas de forma poco frecuente.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, modificación y redistribución, sin restricciones de atribución más allá de incluir el aviso de copyright. No hay limitaciones de uso para aplicaciones comerciales.
- **Dependencia del modelo base**: el rendimiento está condicionado por las capacidades de `xlm-roberta-base`, que puede no capturar matices de la darija (una variante del árabe marroquí) tan bien como un modelo específicamente pre-entrenado en este idioma.
- **Caveat de producción**: la precisión de validación del 95,05% se obtuvo en un conjunto de validación que probablemente proviene de la misma distribución que el conjunto de entrenamiento. En producción, con datos nuevos de otras páginas de redes sociales, la precisión puede ser inferior.

## Enlaces

- [HuggingFace - Modelo](https://huggingface.co/Chaima-KHENAFIF/relevant-comment-detector)
- [GitHub - Repositorio con código y pipeline de entrenamiento](https://github.com/chaima-Khenafif03/relevant-comment-detector)
- [Perfil de GitHub del autor](https://github.com/chaima-Khenafif03/)
