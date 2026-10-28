# cwaud/mirror-augmented-c0dc80aa2787518a

## Resumen

`cwaud/mirror-augmented-c0dc80aa2787518a` es un checkpoint de generación de texto publicado en HuggingFace por el usuario `cwaud` bajo arquitectura etiquetada como `phi` en los metadatos del repositorio. El peso real de los ficheros safetensors es de 2.779.683.840 parámetros (≈2,78 mil millones), un tamaño que coincide con el de la familia Phi-2, aunque la model card no confirma ni el modelo base ni el proceso de entrenamiento. El repositorio ocupa 5,6 GB, coherente con pesos en fp16/bf16.

El problema que resuelve es, a priori, el de un modelo de lenguaje de pequeño tamaño desplegable en hardware consumer, pero en la práctica la ficha no permite verificarlo: la model card es la plantilla automática de HuggingFace con todos los campos marcados como `[More Information Needed]`, sin licencia declarada, sin idiomas declarados y sin resultados de evaluación. El nombre del repositorio (`mirror-augmented` seguido de un hash hexadecimal) y el hecho de que se creara y actualizara en un intervalo de siete minutos apuntan a una copia automatizada de otro checkpoint, no a un entrenamiento original documentado.

Su relevancia ahora es limitada y fundamentalmente de catalogación: sirve como ejemplo de artefacto sin procedencia verificable dentro del ecosistema abierto, y su interés técnico se reduce a la arquitectura subyacente que se pueda confirmar inspeccionando la configuración y los pesos, no a lo que declare el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `phi` en los metadatos; familia transformer decoder-only, sin confirmar) |
| Parametros totales | 2.779.683.840 (≈2,78 B, dato real de safetensors) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles en el repositorio (solo safetensors); conversión a GGUF/AWQ/GPTQ no publicada por el autor |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura ni entrenamiento en la documentación proporcionada. La única señal es la etiqueta `phi` en los metadatos del Hub, que sitúa el checkpoint en la familia Phi (transformers decoder-only con atención multi-cabeza estándar y entrenamiento orientado a datos sintéticos de "libro de texto" en las versiones originales), pero ni la model card ni los campos del repositorio confirman variante, número de capas, dimensión oculta ni vocabulario. Tampoco se declara el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de ajuste fino con RLHF o DPO.

El tag `arxiv:1910.09700` que aparece en los metadatos corresponde a Lacoste et al., el artículo del calculador de impacto medioambiental de ML que la plantilla automática de HuggingFace cita por defecto; no es un paper del modelo. No se documenta ninguna innovación técnica (atención lineal, decodificación especulativa, mezcla de expertos, SSM híbrido) ni detalles de infraestructura de entrenamiento. Cualquier afirmación sobre el proceso de entrenamiento requeriría inspeccionar `config.json`, el tokenizador y la distribución de pesos del repositorio.

## Capacidades

- Generación de texto autoregresiva: es la única capacidad declarada explícitamente (`pipeline: text-generation`, tag `text-generation-inference`).
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el formato de pesos puede servirse en la infraestructura de inferencia de HuggingFace.
- Razonamiento, código y matemáticas: no disponible; no hay evaluación publicada que lo respalde, aunque por tamaño y familia sea esperable un rendimiento básico en estas áreas.
- Tool calling / function calling: no disponible; no se documenta ninguna capacidad de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el repositorio no contiene torres multimodales según los tags.

## Casos de uso

Los siguientes escenarios son hipótesis de uso razonables para un modelo de ~2,8 B parámetros, no capacidades verificadas en este checkpoint concreto. Cualquier uso en producción exige una evaluación previa sobre el propio artefacto.

- Prototipado local de generación de texto: con 2,78 B parámetros el modelo cabe en una GPU consumer de 8 GB en fp16, lo que permite montar un banco de pruebas de prompts sin coste de API; útil para validar plantillas y formatos antes de pasar a un modelo mayor.
- Clasificación y extracción de información ligera: tareas de etiquetado de tickets, extracción de entidades o resumen de frases cortas que no requieren contexto largo ni razonamiento profundo.
- Generación de borradores de texto técnico: redacción asistida de descripciones, changelogs o documentación interna con revisión humana obligatoria, dado el riesgo de alucinación no medido.
- Servicio de inferencia de bajo coste con vLLM o TGI: el tamaño permite desplegar varias réplicas por GPU en un clúster modesto, siempre que la licencia se aclare antes de un uso comercial.
- Filtrado y preprocesado en pipelines de datos: puntuación de calidad de textos, deduplicación semántica aproximada o generación de pares sintéticos para experimentos de destilación.
- Base para ajuste fino con LoRA: al ser un checkpoint pequeño en safetensors y compatible con `transformers`, sirve como punto de partida para experimentos de fine-tuning en una sola GPU, asumiendo que la procedencia y la licencia se resuelvan primero.
- Investigación sobre procedencia de modelos: análisis de pesos y configuración para determinar de qué checkpoint original deriva esta copia, un caso de uso metodológico en auditoría de repositorios del Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, BBH ni ninguna otra métrica, y no existe informe de evaluación asociado al repositorio. Tampoco hay datos de latencia o throughput declarados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV ni overhead del runtime):

| Precisión | VRAM aproximada de pesos |
|---|---|
| fp32 | ≈11,1 GB |
| fp16 / bf16 | ≈5,6 GB |
| int8 | ≈2,8 GB |
| int4 | ≈1,4–1,6 GB |

- GPU recomendadas: A100 40/80 GB o H100 para servir varias réplicas o lotes grandes; L4, L40S y A10G como opción de coste medio en cloud; RTX 4090 (24 GB) para desarrollo e inferencia en fp16 con margen holgado.
- GPU consumer: sí cabe. En fp16 entra en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs de 8 GB con margen ajustado (hay que sumar caché KV y overhead del framework). En int8/int4 cabe en 4–6 GB, por lo que es viable en portátiles con GPU dedicada modesta.
- Opciones de despliegue: `transformers` (formato nativo), Text Generation Inference (el tag `text-generation-inference` lo indica), vLLM y endpoints de HuggingFace. Para llama.cpp u Ollama haría falta convertir los pesos a GGUF, conversión que el autor no ha publicado.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud para 2,8 B en fp16 sobre una RTX 4090, es razonable esperar decenas de tokens por segundo en decodificación por lotes pequeños, pero no hay medición publicada para este checkpoint.

## Comparativa con modelos similares

Los datos de las alternativas provienen de información pública general sobre esos modelos, no del repositorio analizado, y deben tomarse como orientativos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `cwaud/mirror-augmented-c0dc80aa2787518a` | 2,78 B | no disponible | no disponible | HuggingFace, 0 descargas, sin documentación |
| Phi-2 (Microsoft) | 2,7 B | 2.048 tokens | MIT | HuggingFace, model card y evaluación publicadas |
| Gemma 2 2B (Google) | 2,6 B | 8.192 tokens | Gemma Terms of Use | HuggingFace, requiere aceptación de términos |
| Qwen2.5 3B (Alibaba) | 3,1 B | 32.768 tokens | Apache 2.0 | HuggingFace, amplia documentación |

Frente a estas alternativas, el checkpoint analizado no aporta ninguna ventaja verificable: carece de licencia, de contexto declarado, de idiomas y de evaluación, mientras que los tres modelos de referencia publican todos esos datos y tienen procedencia trazable. Su única equivalencia es el orden de magnitud en parámetros.

## Limitaciones y advertencias

- Procedencia no verificable: el nombre `mirror-augmented-<hash>`, la ausencia total de documentación y un ciclo de creación-actualización de siete minutos sugieren una copia automatizada de otro checkpoint, sin que el autor identifique el modelo base.
- Licencia desconocida: al no declararse licencia, no hay permiso explícito de uso comercial, redistribución ni modificación. En la práctica esto bloquea su uso en producción hasta que se aclare.
- Idiomas no declarados: no se puede asumir soporte de castellano ni de ninguna otra lengua; habría que evaluarlo empíricamente.
- Contexto desconocido: planificar cualquier caso de uso con ventanas largas sobre este modelo es especulativo.
- Riesgo de alucinación no medido: no existe evaluación de fidelidad factual, y un modelo de ~2,8 B sin ajuste documentado tiende a inventar datos en tareas de conocimiento.
- Sesgos no evaluados: no hay análisis de sesgo demográfico, político ni cultural; un checkpoint sin model card no ofrece ninguna garantía al respecto.
- Posible contenido no filtrado: sin información sobre el dataset de entrenamiento no se puede descartar la presencia de datos personales o con derechos de autor en los pesos.
- Riesgo de seguridad de la cadena de suministro: los safetensors son un formato seguro frente a ejecución de código arbitrario, pero el repositorio podría incluir scripts de carga personalizados; conviene inspeccionar los ficheros antes de instanciar el modelo.
- Sin mantenimiento: 0 descargas y 0 likes en el momento de la consulta indican que el artefacto no tiene comunidad ni soporte; no cabe esperar correcciones.
- Recomendación: usar este repositorio solo con fines de auditoría o experimentación controlada, y preferir un checkpoint original con licencia y evaluación publicadas para cualquier despliegue real.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cwaud/mirror-augmented-c0dc80aa2787518a
- Artículo citado en los metadatos (`arxiv:1910.09700`, Lacoste et al., calculador de impacto medioambiental, no es el paper del modelo): https://arxiv.org/abs/1910.09700
- Calculador de impacto de ML referenciado en la plantilla de la model card: https://mlco2.github.io/impact#compute
- Paper, blog, repositorio de código o demo del modelo: no disponibles.
