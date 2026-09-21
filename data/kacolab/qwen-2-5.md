# kacolab/Qwen-2.5

## Resumen

kacolab/Qwen-2.5 es un repositorio de investigación, no un modelo de propósito general listo para producción. Contiene cuatro checkpoints completos de Qwen2.5-7B-Instruct ajustados mediante fine-tuning completo sobre una tarea de ToolUse, en un experimento controlado que compara dos métodos de entrenamiento (SFT y SDFT, self-distillation fine-tuning) bajo dos condiciones de datos: demostraciones limpias o con un 20 % de demostraciones deliberadamente corruptas (emparejadas con preguntas distintas, condición `mm20`). El experimento se denomina EXP-aicomps-mm20 y publica únicamente el checkpoint final de la semilla 42 de cada una de las cuatro configuraciones.

El interés del artefacto es metodológico: permite estudiar hasta qué punto la autodestilización (SDFT) es más robusta que el SFT clásico cuando una fracción relevante del conjunto de demostraciones es ruidosa o está mal etiquetada, un escenario habitual en pipelines de anotación reales. Cada subcarpeta incluye su propia model card, una lista de hashes SHA-256 y resultados de evaluación, y el repositorio incorpora `PROTOCOL.md` (protocolo experimental bloqueado) y `manifests/` con los identificadores del split train/val y el mapeo de corrupción (índices y hashes, sin texto del dataset).

Arquitectónicamente no hay innovación propia: se hereda la arquitectura transformer decoder-only densa de Qwen2.5-7B-Instruct, con aproximadamente 7.000 millones de parámetros en precisión completa. El tamaño del repositorio es de 259 GB, coherente con alojar cuatro checkpoints completos más artefactos auxiliares. La licencia es Apache-2.0, aunque los checkpoints entrenados con datos corruptos (`mismatch`) se declaran explícitamente solo para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | Aproximadamente 7.000 millones (segun el modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio publica pesos en safetensors sin cuantizaciones declaradas |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (los checkpoints `mismatch` se declaran solo para investigacion) |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 259,0 GB |
| Checkpoints publicados | 4 (tooluse-sft-clean-seed42, tooluse-sft-mismatch-seed42, tooluse-sdft-clean-seed42, tooluse-sdft-mismatch-seed42) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención por causalidad, sin mezcla de expertos ni componentes de estado recurrente (SSM). El repositorio no introduce modificaciones arquitectónicas; todo el trabajo se realiza en la fase de ajuste. No se documenta en la información proporcionada el número de tokens vistos durante el fine-tuning, la composición exacta del dataset de ToolUse utilizado, ni si hubo etapas adicionales de RLHF o DPO posteriores al ajuste supervisado.

La innovación del experimento es de tipo metodológico y se articula en dos ejes. El primero es el método de entrenamiento: se comparan SFT convencional frente a SDFT (self-distillation fine-tuning), donde el propio modelo genera las respuestas objetivo que luego se destilan de vuelta sobre él. El segundo es la calidad de los datos: se contrastan demostraciones limpias frente a un régimen en el que el 20 % de las demostraciones se ha emparejado intencionadamente con preguntas distintas (`mm20`), introduciendo ruido controlado y reproducible. El protocolo está bloqueado en `PROTOCOL.md`, y `manifests/` contiene los identificadores del split de entrenamiento y validación junto con el mapeo de corrupción (índices de registro y hashes, sin texto del dataset), lo que permite auditar la correspondencia entre ejemplos y evaluar la reproducibilidad del experimento sin redistribuir los datos originales.

## Capacidades

- Generación de texto y conversación multi-turno: heredadas de Qwen2.5-7B-Instruct como modelo base instruct.
- Tool calling / function calling: es la tarea objetivo del ajuste (ToolUse) en las cuatro configuraciones publicadas.
- Datos sintéticos y autodestilación: la variante SDFT implica que el modelo se ha utilizado a sí mismo como generador de las respuestas de entrenamiento, lo que documenta su capacidad para producir trayectorias de tool use autoregeneradas.
- Razonamiento multi-paso orientado a herramientas: el escenario ToolUse requiere encadenar la selección de función, el formateo de argumentos y la interpretación del resultado.
- Capacidades multilingües: no disponibles en la información proporcionada; dependen del modelo base y no se documentan en esta ficha.
- Capacidad especial: el artefacto funciona como material de estudio de robustez frente a datos corruptos, comparando SFT y SDFT en condiciones controladas.
- No se declaran capacidades de visión, audio, thinking mode explícito ni decodificación especulativa.

## Casos de uso

- Reproducción de experimentos de robustez: utilizar los cuatro checkpoints como referencia para replicar el protocolo de EXP-aicomps-mm20 y verificar si SDFT mantiene mejor el rendimiento que SFT cuando el 20 % de las demostraciones está mal emparejado.
- Estudios comparativos de métodos de ajuste: servir de base para trabajos académicos que analicen la sensibilidad de SFT y SDFT a distintos niveles de ruido en los datos, ampliando la condición `mm20` a otros porcentajes.
- Evaluación de pipelines de anotación: medir cuánto degrada un modelo de tool use la presencia de ejemplos corruptos ayuda a decidir cuánto esfuerzo invertir en control de calidad de anotaciones antes del entrenamiento.
- Investigación sobre seguridad y alineación: los checkpoints `mismatch`, entrenados sobre datos intencionadamente corruptos, permiten estudiar cómo se manifiesta el comportamiento aprendido de datos inconsistentes en tareas de llamada a herramientas.
- Referencia para harness de evaluación de tool calling: integrar los cuatro checkpoints en un banco de pruebas propio para calibrar métricas de precisión de llamada a función, formato de argumentos y tasa de alucinación de herramientas.
- Docencia y formación técnica: ilustrar en cursos de posgrado o bootstraps internos la diferencia práctica entre ajuste supervisado y autodestilización con datos ruidosos, usando checkpoints reales y un protocolo auditado.
- Auditoría de reproducibilidad: el uso de `PROTOCOL.md`, `manifests/` con hashes e informes de evaluación por subcarpeta permite auditar la trazabilidad de un entrenamiento sin necesidad de redistribuir el dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que cada subcarpeta incluye resultados de evaluación, pero las cifras concretas (ToolUse y cualquier otra métrica) no se han facilitado en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

Estimaciones orientativas para un checkpoint de aproximadamente 7.000 millones de parámetros; no proceden de mediciones publicadas por el autor:

- VRAM para inferencia en bf16/fp16: en torno a 15-16 GB de pesos, más overhead de activaciones y caché KV (habitualmente 18-20 GB en total a contextos moderados).
- VRAM para inferencia en int8: aproximadamente 8-9 GB de pesos.
- VRAM para inferencia en 4 bits (si se generan cuantizaciones GGUF o AWQ/GPTQ, no incluidas en el repositorio): aproximadamente 4,5-6 GB.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en tarjetas con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), y en bf16 en tarjetas de 24 GB (RTX 3090, RTX 4090) con margen limitado de contexto.
- GPU recomendadas para servicio en precisión completa: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- Fine-tuning completo: requiere mucha más memoria que la inferencia. Con Adam y precisión mixta, un 7B completo exige del orden de 80 GB o más, por lo que se necesitan A100 80 GB, H100 o configuraciones multi-GPU; el repositorio de 259 GB es coherente con almacenar cuatro checkpoints completos junto con artefactos auxiliares.
- Opciones de despliegue: vLLM y TGI para servicio en bf16; llama.cpp y Ollama únicamente si se generan conversiones GGUF, que no se declaran en el repositorio. Los checkpoints `mismatch` no deberían desplegarse en entornos de producción.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kacolab/Qwen-2.5 (tooluse-sft-clean-seed42) | ~7B | No disponible | SFT sobre datos limpios | Apache-2.0 | HuggingFace |
| kacolab/Qwen-2.5 (tooluse-sdft-clean-seed42) | ~7B | No disponible | SDFT sobre datos limpios | Apache-2.0 | HuggingFace |
| kacolab/Qwen-2.5 (tooluse-sft-mismatch-seed42) | ~7B | No disponible | SFT con 20 % de datos corruptos | Apache-2.0, solo investigacion | HuggingFace |
| kacolab/Qwen-2.5 (tooluse-sdft-mismatch-seed42) | ~7B | No disponible | SDFT con 20 % de datos corruptos | Apache-2.0, solo investigacion | HuggingFace |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | ~7B | No disponible en esta ficha | Ajuste instructivo del autor original | Apache-2.0 | HuggingFace |

No se dispone de información sobre otros modelos comparables de la misma categoría (por ejemplo, alternativas de 7-8B orientadas a tool use) dentro del material proporcionado. La comparación más pertinente es interna al propio repositorio, ya que su propósito declarado es precisamente contrastar las cuatro configuraciones entre sí. Las variantes `clean` serían el punto de referencia frente a las que medir el impacto del ruido en los datos.

## Limitaciones y advertencias

- Los checkpoints `mismatch` se entrenaron con datos deliberadamente corruptos y la model card indica explícitamente que son solo para investigación. No deben desplegarse en producción ni usarse como asistentes de cara al público.
- Alucinación: no se han publicado métricas de fiabilidad ni tasas de alucinación de herramientas en la información disponible.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad en la información proporcionada.
- Cobertura de idiomas: no disponible; no se confirma qué idiomas mantienen el rendimiento tras el ajuste específico en ToolUse.
- Alcance funcional estrecho: son checkpoints ajustados sobre una única tarea (ToolUse) a partir de Qwen2.5-7B-Instruct, por lo que es esperable cierta pérdida de capacidades generales respecto al modelo base, aunque no se han facilitado mediciones que lo cuantifiquen.
- Reproducibilidad: el dataset de entrenamiento no se redistribuye; solo se publican identificadores, hashes y el mapeo de corrupción. La replicación exacta depende de disponer de la misma fuente de datos.
- Licencia: Apache-2.0, heredada del modelo base, permite uso comercial de los checkpoints `clean`; sin embargo, la propia model card restringe los `mismatch` a investigación, lo que conviene tratar como una condición de uso adicional.
- Atribución y procedencia: al ser una derivación de Qwen2.5-7B-Instruct, se deben respetar los términos y la atribución del modelo original.
- Fechas de creación y actualización (2026-09-11 y 2026-09-20) figuran tal cual en los metadatos del repositorio.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación externa ni de uso en producción por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kacolab/Qwen-2.5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper asociado: no disponible
- Blog o anuncio del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
- Nota sobre la busqueda web: los resultados recuperados durante la busqueda no guardan relacion con el modelo (contenido de ayuda de YouTube y plataformas de terceros), por lo que no se incluyen como enlaces relevantes.
