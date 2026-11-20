# qhoenix/zils-mini-decision-t2v2-50

## Resumen

zils-mini-decision-t2v2-50 es un modelo de decisión de 4.539 millones de parámetros (4,5B) desarrollado por el usuario qhoenix y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-4B, construido mediante la técnica de "soup" (promediado uniforme de pesos) a partir de dos cuerpos previos del propio autor, entrenados con LoRA sobre conjuntos de datos de decisiones etiquetadas. El modelo está etiquetado como `decision-model` dentro de la familia Zils d3-mini, y su pipeline declarado es `feature-extraction`.

El modelo no es un asistente conversacional generalista, sino un componente especializado en la toma de decisiones tipadas, orientado a tareas de clasificación y selección estructurada sobre formatos de examen definidos por el autor. Su relevancia radica en que ejemplifica una tendencia creciente: modelos pequeños (4-5B) especializados mediante fine-tuning y fusiones de pesos para tareas concretas, desplegables en hardware modesto y con licencia permisiva para uso comercial.

La información pública disponible es muy limitada: no hay resultados de benchmarks, no se especifican idiomas soportados y la model card no documenta el proceso de evaluación. La ficha se elabora con los datos reales del repositorio (tamaño de parámetros, formato de pesos, licencia y procedencia del entrenamiento) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-4B), con código personalizado (`custom_code`) |
| Parametros totales | 4.539.265.536 (4,5B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16), librería transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de 4,5B parámetros. Sobre los pesos de lenguaje de ese modelo base se aplicó un proceso de fine-tuning con LoRA (rango 64, learning rate 5e-5, una época, semillas 15 y 16) y posteriormente una fusión de pesos mediante promediado uniforme ("soup"). El punto de partida no fue el modelo base directamente, sino el promedio uniforme de dos cuerpos "de la casa" con licencia Apache-2.0: vllm-sr/d3-mini y torchcast-ai/torchcast-decision-4b.

El entrenamiento combinó dos linajes. El primero, t2avg, es el promedio de dos LoRA entrenados sobre aproximadamente 144.000 ítems de decisión en el formato de examen Zils, extraídos de splits públicos de entrenamiento con etiquetas gold, autorados a partir de splits TRAIN de datasets de uso comercial de varios proveedores y conservados solo cuando hubo acuerdo entre proveedores; además, unos 55.000 ítems de decisiones tipadas de tasksource/tasksource-jev-typed-decisions, filtrando solo filas con `license_use: commercial`. El segundo linaje, v2avg, promedia dos LoRA del mismo punto de partida sobre un conjunto combinado de aproximadamente 173.000 ítems que añade decisiones de uso de herramientas. El cuerpo final es el promedio 50/50 de t2avg y v2avg. El autor declara que no se usaron semillas de examen, ni splits de validación o test, y que ningún "miner body" forma parte del punto de partida.

No se documenta en la información disponible el número total de tokens de entrenamiento, la composición lingüística del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es la metodología de fusión de pesos (weight averaging) combinada con LoRA, que permite agregar especializaciones sin reentrenar desde cero y mantiene el coste computacional bajo.

## Capacidades

- Toma de decisiones tipadas: el modelo está entrenado para emitir decisiones estructuradas en el formato de examen Zils, con etiquetas gold procedentes de datasets de uso comercial.
- Clasificación y selección entre opciones: los ítems de entrenamiento provienen de tareas de decisión con etiquetas, lo que lo orienta a elegir entre alternativas definidas.
- Decisiones de uso de herramientas: el linaje v2avg incorpora aproximadamente 173.000 ítems que incluyen decisiones de tool use, por lo que puede emplearse para seleccionar o invocar herramientas en pipelines.
- Extracción de características: el pipeline declarado es `feature-extraction`, de modo que los pesos pueden usarse como extractor de representaciones.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en infraestructura de inferencia compatible con la API de Hugging Face.
- Capacidades multilingües: no disponible; el autor no declara idiomas soportados.
- Modo thinking, visión o audio: no disponible; no se documentan capacidades multimodales ni de razonamiento extendido.

## Casos de uso

- Enrutamiento de decisiones en pipelines de agentes: el modelo puede recibir el estado de una tarea y emitir una decisión tipada (por ejemplo, qué herramienta invocar o qué acción ejecutar), aprovechando los 173.000 ítems de tool-use decisions del linaje v2avg. Es adecuado porque su entrenamiento está centrado exactamente en ese formato de salida estructurada.
- Clasificación de ítems con etiquetas gold en dominios comerciales: dado que el dataset se filtró por `license_use: commercial`, puede emplearse para clasificar entradas en flujos de negocio donde se requiere una decisión entre categorías predefinidas, con la ventaja de una licencia Apache-2.0 que permite uso comercial sin restricciones adicionales.
- Extracción de representaciones para downstream: al declarar `feature-extraction`, los pesos pueden alimentar un clasificador o un sistema de recuperación sobre textos, usando las capas ocultas del transformer de 4,5B como embeddings contextuales.
- Evaluación automática de exámenes en formato Zils: el modelo puede usarse como decisor de referencia para comparar respuestas de otros modelos contra el formato de examen del autor, sirviendo de baseline en experimentos de evaluación interna.
- Filtrado y anotación asistida de datasets de decisión: puede preetiquetar ítems nuevos en el formato Zils para revisión humana posterior, reduciendo el coste de anotación en proyectos que ya usan ese esquema.
- Despliegue en entornos con recursos limitados: con 4,5B parámetros en BF16 (unos 9,1 GB de pesos), cabe en una única GPU consumer de 24 GB (RTX 4090) o en GPUs de datacenter (A100 40 GB, H100), lo que permite integrarlo en servicios internos sin infraestructura de gran escala.
- Prototipado de investigación sobre fusión de pesos: el repositorio documenta con detalle la receta de soup y LoRA, por lo que sirve como caso de estudio reproducible para investigadores que quieran replicar la metodología con sus propios datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 4,539.265.536 parámetros ocupan aproximadamente 9,1 GB de pesos; con overhead de activaciones y caché KV, se recomienda un mínimo de 12-16 GB de VRAM para contexto moderado.
- GPU recomendadas: NVIDIA A100 (40 GB u 80 GB), H100, L40S o RTX 4090 (24 GB) para BF16; GPUs con 16 GB (RTX 4080, A4000) pueden ser suficientes con cuantización, aunque el autor no publica versiones cuantizadas.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB); en GPUs de 16 GB requeriría cuantización no publicada oficialmente.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles con Hugging Face; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible, y la presencia de `custom_code` puede requerir `trust_remote_code=True`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-mini-decision-t2v2-50 | 4,5B | no disponible | Apache-2.0 | Decisiones tipadas (formato Zils) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | no disponible en la información | Modelo generalista | Hugging Face |
| vllm-sr/d3-mini | no disponible | no disponible | Apache-2.0 | Cuerpo de decisión de la casa | Hugging Face |
| torchcast-ai/torchcast-decision-4b | ~4B | no disponible | Apache-2.0 | Modelo de decisión | Hugging Face |

La comparativa se limita a los modelos citados en la model card, ya que no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: el autor no publica evaluaciones, por lo que no hay evidencia cuantitativa de calidad frente a los modelos base o a alternativas.
- Sesgo de dominio: el entrenamiento se limita a ítems de decisión en el formato Zils y a decisiones tipadas de tasksource; el rendimiento fuera de ese esquema es desconocido y probablemente degradado.
- Riesgo de alucinación: al ser un modelo de 4,5B derivado de un base generalista, puede generar decisiones plausibles pero incorrectas cuando la entrada se aleja de la distribución de entrenamiento.
- Idiomas no declarados: no se especifica qué lenguas cubre el dataset; no hay garantía de comportamiento correcto en castellano u otros idiomas distintos del inglés.
- Contexto desconocido: la longitud de contexto no está documentada, lo que impide planificar su uso en conversaciones o documentos largos.
- Código personalizado: la etiqueta `custom_code` implica que la carga requiere `trust_remote_code=True`, con el riesgo de seguridad asociado a ejecutar código del repositorio.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datasets de entrenamiento si se usa en producción regulada.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con creación y actualización el mismo día (2026-11-20); es un artefacto recién publicado sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/qhoenix/zils-mini-decision-t2v2-50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuerpo de partida citado: https://huggingface.co/vllm-sr/d3-mini
- Cuerpo de partida citado: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Dataset citado: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Búsqueda web sin resultados relevantes sobre el modelo (el único resultado encontrado, roboticcoding.com, no guarda relación con zils-mini-decision-t2v2-50).
