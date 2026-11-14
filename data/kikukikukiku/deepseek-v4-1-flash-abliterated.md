# kikukikukiku/DeepSeek-V4.1-Flash-Abliterated

## Resumen

DeepSeek-V4.1-Flash-Abliterated es una conversión comunitaria del modelo DeepSeek-V4.1-Flash, publicada por el usuario kikukikukiku (con crédito a s-zaizen como autor de la conversión) sobre el checkpoint oficial de DeepSeek. Se trata de una variante "abliterated", es decir, un fine-tuning que elimina selectivamente la dirección residual asociada a los comportamientos de rechazo del modelo original, reduciendo la tasa de negativas ante peticiones que el modelo base rechazaría. No es un lanzamiento oficial de DeepSeek y conserva íntegramente la arquitectura, el tokenizador, los componentes de visión, la memoria Engram y los tensores MTP/DSpark del modelo fuente.

El checkpoint mantiene los formatos de almacenamiento originales FP8/MXFP4 y se distribuye en 48 shards de safetensors que suman 510,297 GB. El recuento de parámetros reportado por safetensors es de 763.205.315.794 parámetros totales, lo que lo sitúa en la categoría de modelos de gran escala con capacidades multimodales (pipeline image-text-to-text) y contexto nativo largo según la configuración del modelo base. La licencia MIT original se conserva.

La relevancia de esta ficha radica en que documenta una intervención de "abliteration" sobre un modelo de frontera: el autor reporta una reducción de la tasa de rechazo por palabra clave (Heretic KeywordRate) de 97/100 en el modelo original a 24/100 en esta conversión, medida sobre 100 ejemplos del split de test `mlabonne/harmful_behaviors`. Es importante subrayar que esta métrica no es un benchmark de capacidades generales y que el modelo no cuenta con descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base DeepSeek-V4.1-Flash; incluye componentes de visión, memoria Engram y tensores MTP/DSpark) |
| Parámetros totales | 763.205.315.794 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se indica "native context configuration" del modelo base, sin cifra) |
| Tipos de cuantización | FP8 y MXFP4 (formatos de almacenamiento originales); tag 8-bit |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, 510,297 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se conservan sus componentes: tokenizador, visión, memoria Engram, tensores MTP/DSpark y la configuración de contexto nativa. El pipeline declarado es image-text-to-text, lo que confirma capacidades multimodales de entrada imagen y texto. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

La intervención de abliteration se realizó con la herramienta Heretic (p-e-w/heretic) en el commit `3521f8648a0dccf6e12a92666862632235fac7e6`, mediante un adaptador de compatibilidad nativo para DeepSeek V4.1 que emplea la construcción de dirección residual de Heretic y su API `heretic.model.Model.abliterate`. La intervención seleccionada, denominada `per_all_4p5`, aplica direcciones proyectadas por capa a las 40 proyecciones de salida de atención, con normalización completa de filas y fusión de LoRA de rango 3 que preserva la norma. No se modifican los tensores de expertos, Engram, visión, embeddings ni MTP/DSpark.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base.
- Procesamiento multimodal imagen-texto (pipeline image-text-to-text), con componentes de visión preservados.
- Memoria Engram y tensores MTP/DSpark conservados, lo que sugiere soporte de mecanismos de memoria y decodificación multitoken del modelo original (sin detalle adicional disponible).
- Modo de pensamiento (thinking mode) en chat, empleado en la evaluación de rechazos del autor.
- Reducción de comportamientos de rechazo: la tasa de KeywordRate baja de 97/100 a 24/100 en el conjunto de evaluación indicado.
- Soporte de tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo varía la tasa de rechazo tras una intervención de abliteration sobre un modelo de gran escala, comparando directamente con el checkpoint original en el mismo entorno de evaluación.
- Evaluación de robustez de filtros y moderación: sirve como contrapunto para probar sistemas de moderación externos, ya que genera respuestas que el modelo base rechazaría, permitiendo validar capas de seguridad independientes del modelo.
- Análisis de mecanismos de atención: la intervención actúa sobre las 40 proyecciones de salida de atención, por lo que el checkpoint es útil para estudiar el efecto de modificar direcciones residuales en la capa de atención sin alterar expertos ni embeddings.
- Reproducibilidad de técnicas de abliteration: al documentarse el commit exacto de Heretic y la configuración `per_all_4p5`, permite reproducir y auditar el procedimiento sobre el mismo modelo base.
- Experimentos multimodales: al conservar los componentes de visión, puede emplearse en tareas image-text-to-text en las que se quiera comparar el comportamiento del modelo abliterated frente al original.
- Docencia y divulgación técnica: útil para explicar de forma práctica qué es la abliteration, qué tensores modifica y qué métricas se usan para medir su efecto, con cifras concretas de rechazo antes y después.

## Benchmarks y rendimiento

El autor solo publica la métrica de rechazo por palabra clave de Heretic sobre 100 ejemplos de `mlabonne/harmful_behaviors` (max_response_length=100, batch_size=4, temperatura 0, chat thinking mode, semilla 42):

| Checkpoint | Heretic KeywordRate (rechazos) |
|---|---|
| Modelo original (antes de la conversión) | 97/100 |
| Este modelo abliterated | 24/100 |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El propio autor advierte que la tasa de rechazo por palabra clave no es un benchmark de capacidades generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras concretas. Con 763.205.315.794 parámetros y almacenamiento FP8/MXFP4, el checkpoint completo ocupa 510,297 GB, por lo que la inferencia requiere infraestructura multi-GPU de centro de datos.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del checkpoint, no es viable en GPUs de consumo.
- ¿Cabe en GPU de consumo? No, según el tamaño del repositorio y el número de parámetros.
- Opciones de despliegue: se requiere un runtime que soporte el formato de checkpoint FP8/MXFP4 y la codificación de prompt originales de DeepSeek V4.1; el autor incluye los archivos de inferencia y codificación de referencia sin modificar. No se especifican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-Abliterated | 763.205.315.794 | no disponible | MIT | Hugging Face (0 descargas, 0 likes) | Conversión comunitaria abliterated |
| DeepSeek-V4.1-Flash (base) | no disponible en la información | no disponible | MIT (según el modelo derivado) | Hugging Face (modelo oficial) | Modelo original sin abliteration; KeywordRate 97/100 |
| Otras variantes abliterated | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La abliteration reduce los rechazos (de 97/100 a 24/100 en la métrica del autor), lo que implica un mayor riesgo de generar contenido dañino, sesgado o inapropiado; no debe desplegarse en producción sin capas de moderación externas.
- La métrica KeywordRate mide rechazos por palabra clave y no es un benchmark de capacidades; no hay evidencia publicada sobre el impacto de la intervención en razonamiento, código, matemáticas o visión.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos generales de los modelos de gran escala.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Longitud de contexto no especificada con cifra; se indica únicamente que se conserva la configuración nativa del modelo base.
- Restricciones de licencia: el modelo y los archivos fuente se distribuyen bajo MIT, pero la herramienta Heretic usada para la conversión está bajo AGPL-3.0; conviene revisar las implicaciones si se redistribuye el procedimiento.
- No es un lanzamiento oficial de DeepSeek; el autor original del modelo base no respalda esta conversión.
- Estado de adopción nulo en el momento de la consulta (0 descargas, 0 likes), lo que limita la validación comunitaria.
- El checkpoint requiere hardware de centro de datos (510,297 GB de pesos) y un runtime compatible con FP8/MXFP4 de DeepSeek V4.1.

## Enlaces

- Hugging Face: https://huggingface.co/kikukikukiku/DeepSeek-V4.1-Flash-Abliterated
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Commit de Heretic usado: https://github.com/p-e-w/heretic/tree/3521f8648a0dccf6e12a92666862632235fac7e6
- Repositorio de DeepSeek-V2 (logo referenciado en la model card): https://github.com/deepseek-ai/DeepSeek-V2
