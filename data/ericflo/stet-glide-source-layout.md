# ericflo/stet-glide-source-layout

## Resumen

Stet GLiDE Source Layout es un adaptador LoRA con una cabeza de clasificación (passage-ranking head) construido sobre el modelo base fastino/GLiDE-0.4B. Lo desarrolla el usuario ericflo y su función es puntuar si la restauración de una línea en un fragmento de texto web mejora su coherencia. Se enmarca en tareas de curación de datos (data curation) y análisis de estructura documental (document-layout), no en generación de texto general.

El modelo compara tripletes formados por un extracto con una línea eliminada, el mismo extracto con esa línea restaurada y el extracto con una línea no relacionada insertada. La salida es una puntuación de preferencia que permite decidir si una línea pertenece al fragmento original. Es relevante para pipelines de limpieza y reconstrucción de corpus web, donde la eliminación accidental de líneas (por ejemplo, por extractores de contenido) degrada la calidad del dato.

El adaptador se apoya en un encoder de 0,4B parámetros con una ventana de contexto operativa de 192 tokens según los resultados reportados. El repositorio tiene un tamaño de 0,0 GB (solo pesos del adaptador y de la cabeza), por lo que requiere descargar el modelo base por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre encoder fastino/GLiDE-0.4B con cabeza de ranking (LayoutHead) |
| Parametros totales | no disponible (adaptador LoRA; base de 0,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens (según model-info.json y resultados reportados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el emparejamiento de líneas no relacionadas se hace por idioma, forma de escritura y longitud aproximada) |
| Licencia | fastino-community (license_name: fastino-community, license: other) |
| Formato de pesos | safetensors (adapter/ y layout-head.safetensors) |

## Arquitectura y entrenamiento

El adaptador se compone de un LoRA PEFT aplicado sobre el encoder GLiDE-0.4B (revisión `6bda7ab91aeb36dcad6d27828a8871e548c7fc71`) y una cabeza de ranking denominada LayoutHead, definida en `layout_model.py` y con pesos en `layout-head.safetensors`. El flujo de inferencia consiste en cargar el encoder con `transformers.AutoModel`, aplicar el adaptador PEFT desde `adapter/`, cargar la cabeza y ejecutar cada extracto a través de `embed`, restando la puntuación previa a la restauración de la posterior. El padding debe ser por la derecha y la longitud de contexto se toma de `model-info.json`.

El entrenamiento utilizó 4.799 tripletes extraídos de páginas de entrenamiento de rastreo web público. Cada triplete contiene un extracto con una línea eliminada, el mismo extracto con la línea restaurada y el extracto con una línea no relacionada insertada; la línea no relacionada coincide con la original en idioma, forma de escritura y longitud aproximada. Las páginas de entrenamiento, desarrollo y test provienen de hosts disjuntos, y se excluyó el texto del examen Stet. El conjunto de test retenido contiene 571 tripletes construidos. El umbral de aceptación se seleccionó sobre el split de desarrollo y queda registrado en `model-info.json`. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición exacta del corpus más allá de lo indicado.

## Capacidades

- Puntuación de coherencia de extractos: evalúa si restaurar una línea mejora la coherencia de un fragmento.
- Ranking de pasajes: la cabeza LayoutHead produce puntuaciones comparables entre versiones de un mismo extracto.
- Detección de líneas ajenas: distingue una línea restaurada de una línea no relacionada insertada.
- Emparejamiento controlado por idioma y forma de escritura en la construcción de negativos.
- Inferencia sobre contexto corto (192 tokens), adecuada para fragmentos de página, no para documentos completos.
- No es un modelo generativo: no produce texto, solo puntuaciones.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Limpieza de corpus web: puntuar cada línea candidata de un extracto para decidir si debe conservarse o descartarse, usando la diferencia de puntuación antes y después de la restauración.
- Reconstrucción de contenido tras extracción agresiva: cuando un extractor elimina líneas por error, el modelo permite evaluar si reinsertarlas mejora la coherencia del fragmento.
- Filtrado de datos para entrenamiento: aplicar el umbral de aceptación de `model-info.json` para marcar extractos de baja calidad antes de incorporarlos a un dataset.
- Detección de contaminación por boilerplate: identificar líneas insertadas que no pertenecen al contenido original (navegación, avisos, promociones) comparando su puntuación con la del extracto base.
- Auditoría de pipelines de curación: medir de forma automática el efecto de cambios en el extractor sobre la coherencia de los fragmentos resultantes.
- Control de calidad en datasets multilingües: al construir los negativos con coincidencia de idioma y forma de escritura, el adaptador puede emplearse en flujos donde conviven varios idiomas, siempre que se valide el rendimiento por idioma.
- Evaluación comparativa de extractores: usar la tasa de preferencia de línea nativa como métrica para elegir entre distintas herramientas de extracción de contenido.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test retenido de 571 tripletes:

| Adaptador | Tokens de contexto | Línea nativa preferida | Precisión de aceptación equilibrada |
|---|---:|---:|---:|
| Stet GLiDE original | 112 | 39,6 % | 51,5 % |
| Stet GLiDE original | 192 | 57,8 % | 52,4 % |
| Source layout | 192 | 92,6 % | 85,3 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es de 0,4B parámetros, por lo que en fp16 ocuparía del orden de 0,8 GB y en fp32 alrededor de 1,6 GB, más el adaptador y la cabeza (cifras estimadas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del encoder, aunque no se documenta oficialmente.
- Opciones de despliegue: `transformers.AutoModel` con PEFT para cargar el adaptador; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stet GLiDE Source Layout | Adaptador LoRA sobre base de 0,4B | 192 tokens | Ranking de coherencia de extractos | fastino-community | Hugging Face |
| Stet GLiDE original (adaptador previo) | Adaptador LoRA sobre base de 0,4B | 112 y 192 tokens | Ranking de coherencia de extractos | no disponible | Referenciado en la model card |
| fastino/GLiDE-0.4B | 0,4B | no disponible | Modelo base encoder | no disponible | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo solo puntúa coherencia de extractos; no genera texto ni responde a instrucciones.
- La ventana de contexto es de 192 tokens, insuficiente para documentos largos o páginas completas.
- El entrenamiento se limita a páginas de rastreo web público; el rendimiento en dominios distintos (documentación técnica, literatura, código) no está validado.
- Los negativos se construyen con coincidencia de idioma y forma de escritura, pero no se documenta el rendimiento desagregado por idioma.
- Riesgo de sesgo hacia las características del corpus de entrenamiento y de los hosts utilizados; no se reportan análisis de sesgo.
- La licencia fastino-community es de tipo "other"; deben revisarse los términos del archivo LICENSE antes de cualquier uso comercial.
- El umbral de aceptación está fijado sobre el split de desarrollo y puede no transferirse a otros dominios.
- El repositorio no incluye los pesos del modelo base; es necesario descargar fastino/GLiDE-0.4B en la revisión indicada.
- No se documentan requisitos de hardware, latencia ni throughput, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericflo/stet-glide-source-layout
- Modelo base: https://huggingface.co/fastino/GLiDE-0.4B
- Licencia (referenciada en la model card): LICENSE del repositorio
