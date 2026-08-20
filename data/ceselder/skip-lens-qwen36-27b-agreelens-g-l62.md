# ceselder/skip-lens-qwen36-27b-agreelens-g-l62

## Resumen

El repositorio `ceselder/skip-lens-qwen36-27b-agreelens-g-l62` contiene un adaptador LoRA de interpretabilidad diseñado para el modelo base Qwen/Qwen3.6-27B. El autor, ceselder, lo presenta como una variante "skip-lens" de su serie agreelens, orientada a la lectura de espacios internos de activación ("workspaces") mediante la técnica de lentes de activación. A diferencia de su gemelo entrenado en la capa 42, este adaptador se entrena sobre el residuo de la capa 62, lo que permite explotar el truco de "skip-lens" al inyectar la activación de la capa 42 proyectada a la capa 62 mediante un Jacobiano.

El modelo resuelve un problema específico de interpretabilidad: cómo leer la representación interna de un modelo de lenguaje a través de una proyección entre capas, sin necesidad de entrenar un nuevo modelo completo. Es relevante para la comunidad de investigación en IA explicable, ya que ofrece una vía para validar hipótesis sobre el flujo de información en modelos transformer de gran escala. El adaptador tiene un tamaño de 1,9 GB, se distribuye en formato PEFT (safetensors) y su licencia es Apache 2.0.

La arquitectura subyacente es un transformer de 27 mil millones de parámetros (Qwen3.6-27B), pero el adaptador en sí no define la longitud de contexto ni los idiomas, que dependen del modelo base y no se especifican en la ficha del autor. El repositorio se presenta como una herramienta de investigación, no como un modelo de propósito general, y requiere la aplicación de un Jacobiano específico (`J_42->62`) y un hook de inyección en el marcador ㈜ (id 158983).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3.6-27B (Transformer) |
| Parámetros totales | no disponible (adaptador de 1,9 GB, base 27B) |
| Parámetros activos | no disponible (LoRA, no MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantización | no disponible (PEFT safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre un conjunto de 244.367 pares de (posición, tramo de 12 tokens on-policy). La característica principal es que la activación de entrada es el residuo de la capa 62 (en lugar de la capa 42 como en su gemelo). Para la inferencia, se utiliza el Jacobiano oficial J_42->62, publicado en el repositorio `camilablank/workspace-lenses`, que permite proyectar la activación de la capa 42 hacia la capa 62. El entrenamiento se realizó con un tamaño de lote de 64, una tasa de aprendizaje de 1e-4, LoRA con rango 64, alpha 16, rsLoRA en todo el ámbito de capas, una sola época y semilla 0. El proceso de inyección requiere capturar h42 en la posición de lectura, aplicar el Jacobiano J_42->62, e inyectarlo en el marcador ㈜ mediante un hook con normalización de Karvonen.

## Capacidades

- Lectura de "workspaces" internos del modelo base mediante la técnica de lentes de activación (skip-lens).
- Proyección de activaciones entre capas (de la capa 42 a la capa 62) utilizando un Jacobiano oficial, lo que permite interpretar la representación en una capa superior sin entrenar un modelo completo.
- Soporte de inyección en puntos de marcado específicos (token ㈜) mediante hooks personalizados.
- Compatible con el ecosistema PEFT de HuggingFace para cargar el adaptador sobre Qwen3.6-27B.
- Capacidad de comparación de variantes de capas (L42 vs L62) dentro de la misma serie agreelens.
- No es un modelo de generación de texto autónomo; su función es interpretativa y requiere el pipeline de inyección descrito.

## Casos de uso

- Investigación en interpretabilidad de modelos: los investigadores pueden usar este adaptador para analizar cómo fluye la información entre las capas 42 y 62 de Qwen3.6-27B, validando hipótesis sobre la formación de representaciones internas.
- Desarrollo de herramientas de activación-lens: sirve como base para construir nuevas herramientas de visualización de activaciones, permitiendo a los desarrolladores inspeccionar qué patrones se codifican en la capa 62 cuando se proyecta desde la capa 42.
- Validación de la técnica "skip-lens": permite comparar los resultados de entrenar en la capa 62 frente a la capa 42 (como el gemelo L42) para evaluar si la proyección Jacobiana mejora la fidelidad de la lectura del workspace.
- Depuración de modelos de lenguaje: los equipos que trabajan con Qwen3.6-27B pueden utilizar este adaptador para identificar qué capas internas son responsables de comportamientos específicos, ayudando a depurar sesgos o errores del modelo base.
- Estudio de mecanismos de atención: la proyección J_42->62 permite estudiar cómo la información del contexto se transforma en un espacio de mayor nivel, útil para trabajos teóricos sobre atención y razonamiento.
- Integración en pipelines de interpretabilidad: se puede integrar en flujos de trabajo de Python que utilicen la librería PEFT y Transformers, automatizando la captura de activaciones y la inyección de hooks para experimentos batch.

## Benchmarks y rendimiento

Se han publicado resultados específicos de acuerdo en la ficha del modelo, medidos sobre un conjunto de 353 elementos (items) de "Fedlayer workspace agreement" (Sonnet vs Jacobiano oficial):

| Métrica | Valor |
|---|---|
| Acuerdo workspace (J-fed, 353 items) | 0.711 |
| Acuerdo workspace (raw-h42-fed, 353 items) | 0.712 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El adaptador no está diseñado para tareas de generación o razonamiento general, sino para interpretabilidad, por lo que no se proporcionan métricas de calidad de texto.

## Requisitos de hardware

- VRAM estimada: no especificada oficialmente. Dado que el adaptador se aplica sobre Qwen3.6-27B (27 mil millones de parámetros), se requiere una GPU con al menos 40 GB de VRAM para inferencia en FP16, o alrededor de 20 GB si se cuantiza el modelo base a 4 bits. El adaptador en sí ocupa 1,9 GB adicionales.
- GPUs recomendadas: NVIDIA A100 (80 GB), H100 (80 GB) o RTX 4090 (24 GB) con cuantización 4-bit para el modelo base.
- Si cabe en GPU consumer: sí, con RTX 4090 (24 GB) siempre que se use cuantización del modelo base (p. ej., 4 bits). No es viable en GPUs de 8-12 GB sin cuantización extrema.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería Transformers y PEFT en Python. Para inferencia eficiente, se puede combinar con vLLM o TGI si se integra como LoRA, aunque no se proporcionan guías específicas. Para despliegue en CPU, sería necesario convertir el modelo base a GGUF y aplicar el adaptador, lo cual no está documentado en este repositorio.
- Latencia y throughput: no disponible en la ficha. Depende del modelo base y del hardware utilizado.

## Comparativa con modelos similares

Dentro de la misma serie agreelens, se compara con el gemelo L42 (ceselder/skip-lens-qwen36-27b-agreelens-g). La comparativa se basa en la información de la ficha:

| Característica | L62 (este modelo) | L42 (gemelo) |
|---|---|---|
| Capa de entrada de activación | Capa 62 | Capa 42 |
| Datos de entrenamiento | 244.367 pares | 244.367 pares (mismos) |
| Acuerdo workspace (J-fed) | 0.711 | no disponible |
| Acuerdo workspace (raw-h42-fed) | 0.712 | no disponible |
| Tamaño del adaptador | 1,9 GB | no disponible (probablemente similar) |
| Licencia | apache-2.0 | apache-2.0 |

No se dispone de comparaciones con otros adaptadores de interpretabilidad fuera de la serie agreelens en la información proporcionada. La ficha indica que los brazos L62 alimentados con el Jacobiano son los lectores de workspace más fuertes de la serie, con una mejora de +0.14–0.17 sobre el entrenamiento con L42.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción. No se debe utilizar para tareas de generación de texto, chat o razonamiento general.
- Requiere la aplicación obligatoria del Jacobiano oficial J_42->62 y el hook de inyección en el marcador ㈜ (id 158983). Sin estos componentes, el adaptador no funciona correctamente.
- No se han publicado datos sobre idiomas soportados ni sobre la calidad del texto generado (si es que genera alguno).
- El entrenamiento se realizó con un corpus general sin filtrar, lo que puede introducir sesgos en la interpretación de los workspaces.
- La licencia del adaptador es Apache 2.0, pero el uso del modelo base Qwen3.6-27B está sujeto a la licencia de Qwen (no especificada aquí), que puede tener restricciones para uso comercial.
- No se ha validado el adaptador en entornos de producción; su robustez fuera del contexto experimental es desconocida.
- La información de la ficha no incluye el contexto de la longitud del modelo base, por lo que no se puede garantizar un comportamiento estable con secuencias largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-g-l62
- Repositorio gemelo (L42): https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-g (inferido de la ficha)
- Repositorio del Jacobiano oficial: camilablank/workspace-lenses (referenciado en la ficha)
- Modelo base: Qwen/Qwen3.6-27B (https://huggingface.co/Qwen/Qwen3.6-27B)
