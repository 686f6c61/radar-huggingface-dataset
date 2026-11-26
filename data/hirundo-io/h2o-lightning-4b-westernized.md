# hirundo-io/h2o-lightning-4b-westernized

## Resumen

hirundo-io/h2o-lightning-4b-westernized es un modelo derivado de h2oai/h2o-lightning-4b, publicado por el usuario hirundo-io. Se trata de un modelo de decisión (decision-model) con pipeline image-text-to-text, es decir, orientado a tareas multimodales de entrada imagen y texto con salida conversacional. El modelo se distribuye con licencia Apache 2.0 y acceso restringido (gated) en Hugging Face, lo que obliga a aceptar condiciones antes de descargarlo.

El modelo conserva la arquitectura del base (etiquetada como qwen3_5 en los metadatos del repositorio) y cuenta con 4.659.865.088 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de 4B-5B. El repositorio ocupa 9,4 GB, coherente con pesos en precisión de 16 bits. La modificación declarada por el autor es un proceso de "westernization" orientado a mitigación de sesgos, según las etiquetas del repositorio.

La relevancia del modelo reside en su enfoque explícito de mitigación de sesgos culturales sobre un modelo base compacto y multimodal, un nicho poco cubierto en la oferta open source. No obstante, la información publicada es muy limitada: no hay datos de benchmarks, idiomas soportados ni detalles del proceso de ajuste, y el modelo no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según metadatos del repositorio); detalles de la arquitectura interna no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los metadatos identifican la arquitectura como qwen3_5, lo que sugiere una familia de transformer con atención estándar, aunque no se especifican detalles como el número de capas, dimensiones ocultas, tipo de atención ni si incorpora componentes multimodales concretos (codificador visual, proyector, etc.) más allá de la etiqueta image-text-to-text. El modelo deriva de h2oai/h2o-lightning-4b mediante una operación de merge o ajuste declarada en los metadatos del modelo base.

El autor etiqueta el modelo como "westernized" y "bias-mitigation", lo que indica que el ajuste respecto al base busca reducir sesgos culturales o de alineación no occidental. No se publica información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni la metodología concreta de mitigación de sesgos aplicada. Tampoco hay detalles sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline declarado (conversational).
- Procesamiento conjunto de imagen y texto (image-text-to-text), lo que implica entrada multimodal con salida textual.
- Modelo de decisión: el autor lo clasifica como decision-model, orientado a tareas de clasificación o selección de opciones más que a generación libre.
- Mitigación de sesgos culturales declarada mediante el ajuste "westernized".
- Soporte de tool calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no disponible; no se listan idiomas en los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Moderación de contenido con criterios culturales: el ajuste "westernized" y la orientación a decisión permiten usar el modelo para clasificar contenido según normas culturales occidentales, aprovechando su naturaleza de decision-model.
- Análisis de imágenes con salida conversacional: al aceptar entrada image-text-to-text, puede emplearse para describir, clasificar o responder preguntas sobre imágenes en flujos de atención al usuario.
- Investigación sobre sesgos en modelos multimodales: sirve como punto de comparación frente al base h2oai/h2o-lightning-4b para estudiar el efecto de un ajuste de mitigación de sesgos culturales.
- Clasificación de documentos con contexto visual: en pipelines de gestión documental, el modelo puede recibir capturas o escaneos junto con una instrucción textual y devolver una decisión estructurada.
- Prototipado de asistentes conversacionales multimodales: con 4,6B parámetros y pesos safetensors, es desplegable en entornos de investigación para validar asistentes que combinan imagen y diálogo.
- Evaluación comparativa de alineación cultural: útil en estudios académicos que midan cómo cambia el comportamiento de un modelo al aplicar transformaciones de "westernization" sobre un base open source.
- Filtrado de contenido en aplicaciones de usuario final: su tamaño compacto permite integrarlo en servicios con requisitos moderados de cómputo para tareas de decisión sobre texto e imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos (4,66B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 16 GB de VRAM para contexto moderado.
- Cuantización a 8 bits: alrededor de 4,7 GB de pesos; cuantización a 4 bits: alrededor de 2,3 GB, aunque no se publican versiones GGUF ni cuantizadas oficiales.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX A6000 para despliegues de producción con contexto largo; RTX 4090 (24 GB) suficiente para FP16 con margen.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y GPUs con 16 GB o más en FP16; en cuantización de 8 bits podría ejecutarse en GPUs de 8-12 GB, aunque sin pesos cuantizados publicados habría que generarlos.
- Opciones de despliegue: vLLM, TGI y transformers son las vías naturales para pesos safetensors; llama.cpp u Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| hirundo-io/h2o-lightning-4b-westernized | 4,66B | no disponible | imagen-texto | Apache 2.0 | gated |
| h2oai/h2o-lightning-4b (base) | ~4B (según nombre) | no disponible | no disponible | no disponible | no disponible |
| Qwen2.5-VL-3B | ~3B | 32K (típico de la familia) | imagen-texto | Apache 2.0 | abierto |
| Phi-3.5-vision | ~4,2B | 128K (según documentación de Microsoft) | imagen-texto | MIT | abierto |

La comparación con Qwen2.5-VL-3B y Phi-3.5-vision se ofrece como referencia de categoría (modelos multimodales compactos), pero no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas. El acceso gated y la ausencia de benchmarks dificultan una comparación rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados o en entornos corporativos con políticas de aprovisionamiento estrictas.
- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas multimodales, por lo que no se puede validar su calidad frente al base.
- Metodología de "westernization" no documentada: se desconoce qué datos, técnicas y criterios se aplicaron, lo que impide evaluar si la mitigación de sesgos introduce nuevos sesgos o degrada capacidades del base.
- Idiomas no declarados: no se especifica cobertura lingüística, lo que desaconseja su uso en producción multilingüe sin evaluación previa.
- Contexto desconocido: sin longitud de contexto publicada, no se puede planificar su uso en tareas de documento largo o conversaciones extensas.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no hay evaluaciones de fidelidad publicadas.
- Sin versiones cuantizadas: solo se publican pesos safetensors, lo que obliga a convertir a GGUF o AWQ para despliegues de bajo consumo.
- Adopción nula: cero descargas y cero likes en el momento de la ficha, sin comunidad que reporte incidencias o validaciones independientes.
- Licencia Apache 2.0 permite uso comercial, pero el acceso gated puede imponer términos adicionales del autor que conviene revisar antes de integrarlo en productos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hirundo-io/h2o-lightning-4b-westernized
- Modelo base: https://huggingface.co/h2oai/h2o-lightning-4b
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
