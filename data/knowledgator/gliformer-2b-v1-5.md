# knowledgator/gliformer-2b-v1.5

## Resumen

GLiFormer 2B v1.5 es un modelo de extracción de información desarrollado por Knowledgator que unifica múltiples tareas de procesamiento de lenguaje natural en un único sistema. Se construye sobre el encoder bidireccional de Qwen3.5-2B y añade cabezas de tarea ligeras que permiten realizar reconocimiento de entidades nombradas, clasificación de texto, extracción de relaciones, extracción estructurada y campos calculados en una sola pasada. La innovación principal es que los tipos de entidad, etiquetas de clase, tipos de relación y esquemas de registro se especifican en tiempo de inferencia, por lo que no es necesario reentrenar el modelo para nuevas etiquetas o esquemas.

El modelo pertenece a la familia GLiFormer, un conjunto de encoders diseñados específicamente para extracción de información. A diferencia de los modelos generativos, GLiFormer utiliza un encoder compartido que lee el texto junto con la especificación de qué buscar, y cabezas de tarea ligeras producen las salidas correspondientes. Esto permite ejecutar varias tareas simultáneamente en una sola pasada, lo que reduce la latencia y el coste computacional en comparación con pipelines que encadenan múltiples modelos especializados.

Con 2.65 mil millones de parámetros totales (2.21B del backbone más las cabezas de tarea), el modelo se posiciona como una alternativa de tamaño medio para tareas de extracción estructurada en producción. El checkpoint también incluye cabezas de clasificación de imágenes y detección de objetos, aunque la documentación disponible se centra exclusivamente en las tareas de texto. La licencia Apache 2.0 facilita su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional basado en Qwen3.5-2B con cabezas de tarea ligeras (familia GLiFormer) |
| Parametros totales | 2.65B (2.21B backbone + cabezas de tarea) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (repo de 10.6 GB, librería gliformer) |

## Arquitectura y entrenamiento

GLiFormer utiliza un encoder compartido que procesa el texto de entrada junto con la especificación de la tarea (tipos de entidad, etiquetas de clase, tipos de relación o esquemas de registro). Sobre este encoder se aplican cabezas de tarea ligeras que producen las salidas específicas: entidades nombradas con offsets de caracteres, clasificaciones con puntuaciones, relaciones entre entidades, registros estructurados con campos tipados (texto, clase, fecha, número) y campos calculados mediante pequeños programas sobre números extraídos del texto.

El backbone es el encoder bidireccional de Qwen3.5-2B, lo que implica que el modelo no es generativo sino discriminativo: no produce texto libre, sino que etiqueta tokens y extrae estructuras. El checkpoint se ha afinado a partir de `knowledgator/gliformer-omni-2b-post`, un modelo previo de la familia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas de RLHF o DPO. La documentación menciona que el modelo soporta esquemas anidados mediante Pydantic y validación de salida, lo que sugiere un entrenamiento orientado a la robustez en extracción estructurada.

## Capacidades

- Reconocimiento de entidades nombradas (NER) con tipos definidos en tiempo de inferencia, devolviendo texto, etiqueta, offsets de caracteres y puntuación de confianza.
- Clasificación de texto con etiquetas arbitrarias, incluyendo grupos nombrados (por ejemplo, sentimiento y tema simultáneamente).
- Extracción de relaciones conjunta con entidades y relaciones especificadas en la llamada, devolviendo cabeza, relación y cola.
- Extracción estructurada con esquemas de registro que soportan campos de texto, clase (selección entre opciones), fecha y número, incluyendo registros anidados multinivel.
- Campos calculados: un campo marcado como `$calculate` se computa mediante un pequeño programa sobre números leídos del texto (copia, suma, resta, multiplicación, división).
- Soporte de esquemas Pydantic con validación de salida (`validate_output=True`).
- Procesamiento por lotes (`batch_size`) para extracción sobre múltiples textos.
- Cabezas de clasificación de imágenes y detección de objetos presentes en el checkpoint, aunque no documentadas en los ejemplos de uso.
- No se menciona soporte de tool calling, agentes, razonamiento multi-paso ni modo thinking.

## Casos de uso

- Extracción de entidades en documentos legales o financieros: el modelo permite definir tipos de entidad como "parte contratante", "jurisdicción" o "fecha de vigencia" en tiempo de inferencia, sin reentrenamiento, y devuelve offsets de caracteres para resaltar las menciones en la interfaz de revisión.
- Clasificación de tickets de soporte con grupos nombrados: se pueden clasificar simultáneamente categoría (hardware, software, facturación) y prioridad (baja, media, alta) en una sola pasada, con campos tipados que devuelven valores de clase en lugar de texto copiado.
- Extracción estructurada de currículos o perfiles profesionales: mediante esquemas Pydantic anidados (empresa → departamentos → empleados), el modelo genera registros validados que pueden insertarse directamente en una base de datos relacional.
- Análisis de relaciones en textos de dominio: por ejemplo, extraer relaciones de empleo ("works_at") entre personas y organizaciones en artículos de noticias, con entidades y relaciones definidas en la llamada.
- Cálculo de métricas a partir de texto financiero: campos con `$calculate` permiten computar variaciones (por ejemplo, crecimiento de ingresos entre dos años) directamente desde el texto, sin post-procesamiento manual.
- Procesamiento por lotes de correos o formularios: con `batch_size=8` o superior, el modelo puede extraer entidades y estructuras de grandes volúmenes de documentos en una sola pasada, reduciendo el coste frente a pipelines multi-modelo.
- Enriquecimiento de bases de datos documentales: extracción de fechas, números y categorías de informes para poblar tablas analíticas con valores parseados (fechas como `datetime.date`, números como valores numéricos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Con 2.65B parámetros, en FP16 se requieren aproximadamente 5.3 GB solo para pesos, más memoria para activaciones y cabezas de tarea; en cuantización de 8 bits podría reducirse a unos 2.7 GB, aunque no se confirman formatos de cuantización soportados.
- GPU recomendadas: no especificadas. Por tamaño, una GPU con 8-12 GB de VRAM (RTX 3060 12GB, RTX 4070, RTX 4090) podría alojar el modelo en FP16, aunque no hay confirmación oficial.
- Cabe en GPU de consumo: probablemente sí en GPUs con 8 GB o más en FP16, y en GPUs con 4-6 GB si se aplica cuantización, pero no hay datos oficiales.
- Opciones de despliegue: la librería oficial es `gliformer` (instalable vía `pip install gliformer -U` o desde el repositorio de GitHub). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiFormer 2B v1.5 | 2.65B | No disponible | NER, clasificación, relaciones, extracción estructurada, campos calculados | Apache 2.0 | Hugging Face, librería gliformer |
| GLiNER (familia) | Variable (desde ~100M) | No disponible | NER zero-shot | Apache 2.0 (según versión) | Hugging Face |
| Qwen3.5-2B (base) | 2B | No disponible | Generación de texto | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés (`en`), lo que limita su uso en entornos multilingües.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; su uso está restringido a tareas de etiquetado y extracción.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación o limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de los modelos base (Qwen3.5-2B) por si existieran restricciones adicionales no reflejadas en la ficha.
- Las cabezas de clasificación de imágenes y detección de objetos están presentes en el checkpoint pero no están documentadas; su comportamiento y rendimiento no están verificados.
- El repo tiene 10.6 GB, lo que puede dificultar el despliegue en entornos con almacenamiento limitado.
- No se confirman formatos de cuantización ni integraciones con frameworks de despliegue estándar (vLLM, TGI, llama.cpp), lo que puede requerir trabajo adicional para producción.

## Enlaces

- Hugging Face: https://huggingface.co/knowledgator/gliformer-2b-v1.5
- Repositorio GitHub: https://github.com/Knowledgator/GLiFormer
- Documentación: https://docs.knowledgator.com/docs/frameworks/gliformer/
- Blog de lanzamiento: https://knowledgator.com/blog/system-one-model
- API Extract-It: https://platform.knowledgator.com/inference/extract-it
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo previo de la familia: https://huggingface.co/knowledgator/gliformer-omni-2b-post
