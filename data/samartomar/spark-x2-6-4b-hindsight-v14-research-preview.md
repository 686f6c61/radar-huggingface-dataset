# samartomar/spark-x2.6-4b-hindsight-v14-research-preview

## Resumen

Spark-X2.6-4B Hindsight V14 es un adaptador LoRA de investigación publicado por el usuario samartomar sobre el modelo base XHToken/Spark-X2.6-4B, un transformer de 4.000 millones de parámetros. El adaptador está especializado en las tareas de escritura de memoria de Hindsight, un sistema de memoria persistente para agentes: extracción de hechos estructurados, consolidación y deduplicación de recuerdos, creación y actualización de páginas de memoria, retracción de afirmaciones retiradas y apoyo a la recuperación y respuesta. El objetivo declarado es disponer de un escritor de memoria pequeño y ejecutable en local, dejando las etapas de decisión a un modelo separado.

La relevancia de esta publicación es doble. Por un lado, documenta de forma inusualmente honesta el proceso de ajuste fino y sus fallos: el autor publica el artefacto V14 tras descartar la reparación V17 por falta de generalización en casos frescos. Por otro, ejemplifica el patrón de adaptadores LoRA de bajo rango (rank 32, alpha 64, 64.899.072 parámetros, 432 tensores FP32) para tareas de estructuración de salida y gestión de estado en agentes.

Se trata de un paquete exclusivamente de adaptador (0,3 GB), no de un modelo completo ni de una aplicación de memoria instalable. El modelo base debe descargarse por separado en la revisión indicada por el autor. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso XHToken/Spark-X2.6-4B |
| Parametros totales | 64.899.072 (solo adaptador); total del modelo base no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); 432 tensores LoRA A/B en FP32 |
| Rango LoRA | 32 (alpha 64) |
| Modelo base | XHToken/Spark-X2.6-4B, revision 64ca8f2a295b8ceb2757b9d4749a6558c4759e5b |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se aplica mediante PEFT sobre el transformer denso Spark-X2.6-4B. La arquitectura interna del modelo base (número de capas, atención, tokenizador) no está detallada en la información disponible. El adaptador contiene 432 tensores LoRA A/B en FP32, con rango 32 y alpha 64, sin tensores base ni módulos adicionales guardados. El checkpoint original se preserva; solo se modificaron el ID y la revisión del modelo base en la configuración de exportación por portabilidad.

El entrenamiento de V14 partió del checkpoint V13 (paso 620) con estado de optimizador nuevo, sobre 2.857 filas TRAIN sintéticas o de autoría de fuentes, durante dos épocas y 716 actualizaciones. Cubrió 11 roles de dataset. La reparación posterior V17 se inició desde V14 con V14 como referencia fija y empleó 128 preferencias de tabla (64 escenarios en dos disposiciones de columnas) y 32 positivos de replay TRAIN, con DPO beta 0,1 más un coeficiente NLL de 1 sobre la respuesta elegida, tasa de aprendizaje 2e-6, una época y 20 actualizaciones, sin barrido de hiperparámetros. El autor declara que V17 no mejoró la generalización en 16 casos frescos de tabla y detuvo la reparación, liberando V14 con sus limitaciones documentadas.

## Capacidades

- Extracción de hechos estructurados (retain): identificación de personas, lugares y fechas a partir de conversaciones y documentos fuente.
- Consolidación y deduplicación de memorias: actualización de observaciones relacionadas preservando las relaciones de procedencia y evitando duplicados.
- Creación y actualización de páginas de memoria: generación y revisión de resúmenes conservando la información válida.
- Retracción: eliminación de afirmaciones retiradas sin borrar contenido soportado no relacionado.
- Apoyo a recuperación: reescritura de consultas, selección de llamadas de seguimiento, respuestas de cierre y salidas finales estructuradas, además de acortamiento de respuestas.
- Salida estructurada en JSON validable por parser nativo.
- Generación de texto en inglés; no se declaran capacidades multilingües.
- No se documentan tool calling genérico, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Memoria persistente de agentes conversacionales: el adaptador convierte los turnos de una conversación en hechos estructurados con personas, lugares y fechas, lo que permite alimentar un almacén de memoria de largo plazo sin intervención humana en la fase de escritura.
- Deduplicación de un almacén de recuerdos: en pipelines que acumulan observaciones repetidas de distintas fuentes, el modelo consolida entradas relacionadas y conserva la procedencia, reduciendo el ruido del índice de recuperación.
- Mantenimiento de páginas de memoria de un asistente: actualización incremental de resúmenes cuando llega información nueva, conservando lo que sigue siendo válido y sustituyendo lo obsoleto.
- Gestión de retracciones en sistemas documentales: cuando una fuente retira una afirmación, el modelo elimina esa afirmación de la página correspondiente sin tocar el resto del contenido soportado, siempre con revisión humana previa.
- Reescritura de consultas para recuperación: en un sistema RAG o de memoria, el adaptador reformula la consulta del usuario y selecciona llamadas de seguimiento, mejorando la precisión de la recuperación.
- Investigación sobre ajuste fino con DPO en tareas de estructuración: el historial de evaluación publicado permite reproducir el protocolo de comparación entre versiones (V13, V14, V16, V17) sobre suites de desarrollo y casos frescos.
- Prototipado local de sistemas de memoria: al ser un adaptador de 0,3 GB sobre un modelo de 4B, puede ejecutarse en hardware de consumo para experimentación, aunque el autor no lo cualifica para producción.

## Benchmarks y rendimiento

Los datos publicados son evaluaciones de desarrollo del propio autor sobre una suite de 495 casos ya expuesta durante el desarrollo, no un benchmark independiente.

| Medida registrada | V13 | V14 |
|---|---:|---:|
| Casos superados en la tarea fuente | 482/495 | 486/495 |
| Casos superados en instrucciones estrictas | 384/495 | 461/495 |
| Aceptación del parser/acción nativo | 490/495 | 493/495 |
| Errores críticos conocidos | 3 | 1 |

| Pantalla de tabla congelada (mismo autor) | V14 | V17 |
|---|---:|---:|
| Documentos exactos, 16 casos frescos | 9/16 | 9/16 |
| Eliminación completa, casos aplicables | 10/14 | 10/14 |
| Casos con pérdida de contenido válido | 2 | 2 |
| Reparaciones exactas expuestas W07/F01 | 0/2 | 1/2 |

El autor indica que V17 corrigió el error de actor de almacenamiento de Nia y que, con la comprobación posterior offline de eliminación de copias, los resultados exactos conocidos alcanzan 2/2, mientras los frescos no cambian. Se realizaron 24 llamadas de generación por modelo (48 en total) y no hubo repetición de la suite completa ni integración en producción. Sobre 50 respuestas elegidas únicas de los pares TRAIN de V16, este aumentó la probabilidad de la respuesta preferida frente a V14 en todos los casos, pese a la pérdida de contenido fresco observada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, un modelo denso de 4B en FP16 requiere aproximadamente 8 GB de pesos, y en cuantización de 4 bits alrededor de 2,5-3 GB, más el adaptador LoRA (0,3 GB) y la caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en RTX 4090, RTX 3090, A100 y H100; en GPUs de consumo de 8-12 GB requeriría cuantización.
- Cabe en GPU de consumo: previsiblemente sí con cuantización, aunque no hay confirmación del autor.
- Opciones de despliegue: PEFT con Transformers y, para el modelo base cuantizado, vLLM, llama.cpp u Ollama si se genera un GGUF con el adaptador fusionado; no documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks independientes ni de alternativas directamente comparables en la información proporcionada. Como referencia cualitativa de la categoría (modelos pequeños para tareas de estructuración y memoria de agentes):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark-X2.6-4B Hindsight V14 (adaptador) | 4B base + 64,9M adaptador | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Modelos de 3-4B de propósito general (p. ej. familias Llama, Qwen, Phi) | 3-4B | 8K-128K según variante | variables | amplia |
| Adaptadores LoRA especializados en extracción de hechos | variables | depende del base | variables | dispersa |

La comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- Publicación de investigación; el autor la declara no cualificada para producción.
- En pruebas de flujo nativo, las páginas de memoria podían conservar afirmaciones retiradas y las respuestas posteriores las repetían.
- El modelo puede borrar contenido válido, inventar un actor o resolver mal una fecha.
- Una forma JSON correcta o una edición aceptada por el parser no garantizan contenido correcto en la memoria.
- No debe usarse para eliminación desatendida ni para actualizaciones de registros factuales sin revisión humana.
- La cobertura de 11 roles de dataset no establece comportamiento fiable en todas las ramas nativas de la aplicación.
- Los resultados comparan V14 con V13; no demuestran mejora sobre el modelo base sin ajustar ni sobre otros modelos.
- La suite de 495 casos ya había sido expuesta durante el desarrollo, por lo que los resultados pueden estar sobreajustados a ella.
- Idioma limitado al inglés; sin capacidades multilingües declaradas.
- Es solo un adaptador: requiere descargar el modelo base en la revisión exacta indicada; no incluye servidor Hindsight ni aplicación de memoria completa.
- Los escenarios de entrenamiento son sintéticos o de autoría de fuentes; no se liberan memorias personales de usuarios.
- Riesgo de sesgos y alucinaciones inherente al modelo base y a los datos sintéticos; no cuantificado en la información disponible.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/samartomar/spark-x2.6-4b-hindsight-v14-research-preview)
- [Modelo base XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B)
- EVALUATION_HISTORY.md (incluido en el repositorio del modelo)
- SMOKE_CHECK.json (incluido en el repositorio del modelo)
