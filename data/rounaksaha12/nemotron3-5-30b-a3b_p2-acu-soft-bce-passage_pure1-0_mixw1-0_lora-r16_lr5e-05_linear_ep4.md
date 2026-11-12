# rounaksaha12/nemotron3.5-30b-a3b_p2-acu-soft-bce-passage_pure1.0_mixw1.0_lora-r16_lr5e-05_linear_ep4

## Resumen

Este repositorio contiene un adaptador LoRA de rango 16 entrenado sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un transformer de tipo Mixture-of-Experts (MoE) desarrollado por NVIDIA. El adaptador está especializado en una tarea concreta: detección de texto generado por IA (etiqueta `ai-text-detection`), según indica el nombre del repositorio y los tags de Hugging Face. El sufijo del nombre (`p2-acu-soft-bce-passage_pure1.0_mixw1.0_lora-r16_lr5e-05_linear_ep4`) refleja la configuración de entrenamiento: función de pérdida BCE suavizada, mezcla de datos con peso 1.0, LoRA de rango 16, learning rate de 5e-05, scheduler lineal y 4 épocas.

El interés de esta ficha es doble. Por un lado, documenta un adaptador de nicho con muy poca tracción (2 descargas, 0 likes en el momento de la consulta) y con acceso restringido, lo que limita su reproducibilidad. Por otro lado, sirve para describir el modelo base sobre el que se construye, un MoE de NVIDIA con 30B de parámetros totales y 3B activos (según la nomenclatura A3B), pensado para inferencia eficiente en entornos con recursos moderados.

Es importante subrayar que el dato de "parámetros totales" que reporta el safetensors del repositorio (11.367.296) corresponde al adaptador LoRA, no al modelo base. El modelo base completo, según su nombre, tiene 30B de parámetros totales y 3B activos por token. No se dispone de información publicada en este repositorio sobre el pipeline, los idiomas o la licencia del adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (r=16) sobre transformer MoE (modelo base NVIDIA Nemotron-3.5-Lightning-30B-A3B) |
| Parámetros totales | 11.367.296 (adaptador LoRA); modelo base: 30B (según nomenclatura) |
| Parámetros activos | 3B (modelo base, según nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Tarea declarada | ai-text-detection |
| Configuración LoRA | r=16, lr=5e-05, scheduler lineal, 4 épocas |
| Función de pérdida | BCE suavizada (soft BCE) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer de tipo Mixture-of-Experts con 30B de parámetros totales y 3B activos por token, según la nomenclatura del modelo base `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`. La técnica de ajuste es LoRA con rango 16, lo que implica que solo se entrenan las matrices de baja dimensión inyectadas en las capas del modelo, manteniendo congelados los pesos del base. El nombre del repositorio indica una función de pérdida BCE suavizada (`soft-bce`) aplicada a nivel de pasaje (`passage`), con una mezcla de datos ponderada (`mixw1.0`) y una proporción `pure1.0` que no se detalla en la información disponible.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la configuración LoRA y la elección de la pérdida. El entrenamiento se realizó durante 4 épocas con un learning rate de 5e-05 y un scheduler lineal, parámetros que sugieren un ajuste relativamente conservador, típico de tareas de clasificación o detección sobre modelos grandes.

## Capacidades

- Detección de texto generado por IA a nivel de pasaje, según la etiqueta `ai-text-detection` del repositorio.
- Clasificación binaria o probabilística (la pérdida BCE suavizada sugiere una salida tipo probabilidad) sobre fragmentos de texto.
- Ajuste fino sobre un modelo base MoE con capacidad general de generación de texto y razonamiento, aunque el adaptador está especializado en la tarea de detección.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Moderación de contenido generado por IA en plataformas: el adaptador puede integrarse como clasificador de pasajes para marcar textos sospechosos de ser generados por modelos, aprovechando el ajuste específico sobre la tarea de detección.
- Filtrado de datasets de entrenamiento: antes de usar corpus web para entrenar otros modelos, se puede pasar cada pasaje por este detector para reducir la proporción de texto sintético y mitigar el colapso por contaminación.
- Verificación editorial en medios: revisión asistida de artículos o contribuciones de usuarios para señalar posibles textos generados automáticamente, con revisión humana posterior.
- Investigación en detección de IA: servir como punto de partida o baseline para experimentos de detección, dado que el repositorio documenta la configuración de entrenamiento en el nombre.
- Auditoría de pipelines de generación: monitorizar la salida de sistemas generativos propios comparando distribuciones de texto humano frente a texto sintético detectado por el adaptador.
- Análisis forense de documentos: clasificación de pasajes individuales en informes o expedientes para identificar secciones potencialmente generadas por IA, siempre con validación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,1 GB, por lo que su almacenamiento es trivial.
- Para la inferencia es necesario cargar el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, de 30B parámetros totales y 3B activos. La VRAM necesaria depende de la cuantización y no está documentada en este repositorio.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del base (30B totales, 3B activos), se requerirían GPUs de centro de datos (A100, H100) o configuraciones multi-GPU para precisión completa; las opciones en GPU de consumo dependerían de cuantizaciones no documentadas aquí.
- Opciones de despliegue: no disponibles. El repositorio solo incluye pesos safetensors del adaptador, sin indicar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (rounaksaha12) | 11,3M (LoRA) sobre base 30B/3B | no disponible | Detección de texto IA | no disponible | Gated, 2 descargas |
| Modelo base NVIDIA Nemotron-3.5-Lightning-30B-A3B | 30B totales / 3B activos | no disponible | Generación general | no disponible | Referenciado como base |
| Alternativas de detección de texto IA | no disponible | no disponible | Detección | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros detectores de texto generado por IA ni con otros adaptadores LoRA sobre el mismo base.

## Limitaciones y advertencias

- El repositorio tiene acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar la reproducibilidad y el uso automatizado.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido. Ante la ausencia de licencia, debe asumirse que no hay permiso explícito para uso comercial.
- No se documentan idiomas soportados; el comportamiento multilingüe es desconocido.
- No se documenta la longitud de contexto efectiva del adaptador ni del base en este repositorio.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible. Al ser un detector, el riesgo principal es de falsos positivos y falsos negativos, no de generación.
- El adaptador está especializado en detección de texto IA; no debe esperarse un rendimiento generalista de generación o razonamiento sin el base y sin un ajuste adicional.
- La métrica de parámetros del safetensors (11,3M) corresponde al adaptador, no al modelo completo; confundirlos llevaría a estimaciones erróneas de VRAM.
- El modelo base es un MoE de 30B totales; su despliegue requiere infraestructura sustancialmente mayor que la que sugiere el tamaño del adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/rounaksaha12/nemotron3.5-30b-a3b_p2-acu-soft-bce-passage_pure1.0_mixw1.0_lora-r16_lr5e-05_linear_ep4
- Modelo base referenciado: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Perfil del autor: https://huggingface.co/rounaksaha12
