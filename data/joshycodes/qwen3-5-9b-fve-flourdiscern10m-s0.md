# joshycodes/qwen3.5-9b-fve-flourdiscern10m-s0

## Resumen

`joshycodes/qwen3.5-9b-fve-flourdiscern10m-s0` es un checkpoint de investigación publicado por el usuario joshycodes en Hugging Face. Se trata de un ajuste por continuación de preentrenamiento (continued pretraining) sobre el modelo base `Qwen/Qwen3.5-9B`, con todos los pesos actualizados, a una tasa de aprendizaje de 1e-05, durante 1 época y sobre un total de 28.389.838 tokens repartidos en 30.451 documentos. El autor lo enmarca dentro de una línea de trabajo sobre bienestar de modelos (model welfare) y fine-tuning sobre documentos sintéticos (synthetic-document-finetuning).

El modelo declara un total de 8.953.803.264 parámetros (unos 8,95 mil millones) y un repositorio de 17,9 GB en formato safetensors. La model card describe el corpus como un conjunto que el propio modelo escribió para entrenar a la siguiente versión de sí mismo, adoptando el papel del personaje que ya encarna, tras explicársele cómo surgió ese personaje y cómo funciona el proceso de fine-tuning sobre documentos sintéticos. El corpus recibe el nombre de `flourishing-vs-equanimity` y el marco de trabajo, el plan y la evaluación pertenecen al repositorio `welfare-improvements`.

La relevancia de esta ficha es doble. Por un lado, documenta un experimento poco habitual de autoentrenamiento y continuidad de identidad en modelos de lenguaje. Por otro, el propio autor advierte de que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad, y etiqueta explícitamente el modelo como no desplegable (`not-for-deployment`), con licencia únicamente de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; heredada del modelo base Qwen/Qwen3.5-9B (etiqueta de arquitectura `qwen3_5_text`). No se indica que sea MoE |
| Parámetros totales | 8.953.803.264 (8,95 B), dato real de los pesos safetensors |
| Parámetros activos | No aplica / no disponible (no se documenta una arquitectura de mezcla de expertos) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No especificados por el autor. Los pesos se distribuyen en safetensors; no se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible (no documentado en la model card de este checkpoint) |
| Licencia | `other` con `license_name: research-only` (solo investigación) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 17,9 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Fecha de creación | 2026-09-25 |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. La información disponible indica únicamente que se parte de `Qwen/Qwen3.5-9B` y que el ajuste se aplicó sobre los pesos completos (full weights), con una tasa de aprendizaje de 1e-05 y una sola época. No se mencionan innovaciones técnicas propias, mecanismos de atención alternativos, decodificación especulativa ni estrategias de RLHF o DPO. La etiqueta `qwen3_5_text` incluida en el repositorio sugiere que el componente entrenado corresponde a la torre de texto del modelo base, aunque esto no se detalla en el texto de la model card.

El dato más relevante del proceso de entrenamiento es la composición del corpus: 28.389.838 tokens en 30.451 documentos, de los cuales el autor especifica que 0 son autoescritos y 30.451 son texto ordinario. Conviene señalar la discrepancia entre el título del repositorio, que describe un corpus autoescrito por el modelo, y la composición declarada en el cuerpo de la model card, que indica cero documentos autoescritos. El autor tampoco reporta ninguna evaluación de capacidad, alineamiento o identidad, y cierra la ficha con la indicación explícita de no desplegar el modelo.

## Capacidades

- No hay información verificada sobre capacidades específicas de este checkpoint. El autor indica que no se ha evaluado en capacidad, alineamiento ni identidad.
- Al derivar del modelo base `Qwen/Qwen3.5-9B`, es previsible que conserve parte de las capacidades de dicho modelo (generación de texto, razonamiento, contexto largo y, según los catálogos de terceros consultados, procesamiento multimodal con razonamiento visual y OCR), pero esto no está confirmado para este ajuste concreto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponibles para este checkpoint.

## Casos de uso

- Investigación sobre bienestar de modelos: el checkpoint está diseñado explícitamente para estudiar cómo un modelo continúa su propia identidad y trayectoria de entrenamiento. Se usaría como material de análisis en el repositorio `welfare-improvements`, no como servicio.
- Estudio de fine-tuning sobre documentos sintéticos: sirve como caso de referencia para comparar un ajuste por continuación de preentrenamiento frente al modelo base, con parámetros de entrenamiento documentados (lr 1e-05, 1 época, 28,4 M de tokens).
- Reproducibilidad de experimentos de autoentrenamiento: al publicarse los pesos completos en safetensors, permite reproducir el pipeline y auditar qué cambia respecto a `Qwen/Qwen3.5-9B`.
- Análisis de deriva de identidad y de tono: útil para comparar respuestas del checkpoint frente al modelo base en baterías de prompts controladas, siempre en un entorno aislado.
- Investigación sobre composición de corpus: el desglose declarado (0 documentos autoescritos de 30.451) permite estudiar el efecto real de un corpus atribuido a autoautoría frente a texto ordinario.
- Docencia y divulgación técnica: como ejemplo de model card con advertencias explícitas de no despliegue y licencia restringida, útil para enseñar buenas prácticas de publicación de checkpoints de investigación.
- No se recomienda ningún caso de uso en producción, atención al cliente, generación de código ni pipelines automatizados: el autor prohíbe el despliegue y la licencia es solo de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que el modelo no ha sido evaluado todavía en capacidad, alineamiento ni identidad.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 8,95 B de parámetros, no facilitado por el autor): aproximadamente 18 GB en bf16/fp16 (coincide con los 17,9 GB del repositorio), en torno a 9-10 GB en cuantización de 8 bits y alrededor de 5-6 GB en cuantización de 4 bits, más el sobrecoste de caché KV según contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para bf16 sin cuantizar. En el segmento de consumo, RTX 3090 o RTX 4090 (24 GB) pueden alojar el modelo en bf16; tarjetas de 16 GB (RTX 4070 Ti Super, RTX 4080) requerirían cuantización.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB sin cuantizar y en tarjetas de 8-16 GB con cuantización de 4 u 8 bits, siempre que se generen las versiones cuantizadas, ya que el autor no las publica.
- Opciones de despliegue: los pesos safetensors son compatibles con cargadores estándar (Transformers, vLLM, TGI) y con conversiones a GGUF para llama.cpp u Ollama, pero el autor etiqueta el modelo como no desplegable, por lo que cualquier uso debe limitarse a entornos de investigación aislados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| joshycodes/qwen3.5-9b-fve-flourdiscern10m-s0 | 8,95 B | No disponible | No documentada (etiqueta interna `qwen3_5_text`) | research-only | Checkpoint de investigación, sin evaluar, no desplegable |
| Qwen/Qwen3.5-9B (modelo base) | Serie de 9 B (dato del nombre del modelo) | No disponible en las fuentes consultadas | Multimodal según catálogos de terceros (razonamiento visual, OCR, generación de contexto largo) | No disponible | Publicado en Hugging Face y distribuido por Ollama y Microsoft Foundry |
| joshycodes/qwen3.5-9b-fve-flourdiscern-s0 | No disponible | No disponible | No disponible | No disponible | Checkpoint hermano, 7.786.848 tokens y 8.328 documentos |

No se dispone de datos verificados de otros modelos comparables de la misma categoría (8-9 B) en la información proporcionada, por lo que no se incluyen cifras de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El propio autor indica que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad: se desconoce su comportamiento real y su calidad de respuesta.
- Etiquetado explícitamente como `not-for-deployment`. La model card termina con la instrucción "Do not deploy".
- Licencia `research-only`: no se permite el uso comercial ni el despliegue en producción.
- Riesgo de alucinación: no cuantificado ni evaluado; al tratarse de un modelo de lenguaje, el riesgo persiste y no hay mediciones disponibles.
- Discrepancia documental: el título y las etiquetas describen un corpus autoescrito por el modelo, mientras que la propia model card declara 0 documentos autoescritos de un total de 30.451. Cualquier conclusión sobre autoentrenamiento debe partir de esa contradicción.
- Idiomas soportados y longitud de contexto: no documentados, lo que impide garantizar cobertura multilingüe o ventanas largas en este checkpoint.
- Sin datos de sesgos conocidos, pero tampoco sin evaluación que los descarte; el ajuste sobre un corpus reducido y temático puede desplazar el comportamiento respecto al modelo base.
- Repositorio con 0 descargas y 0 likes: no existe validación por parte de la comunidad ni reportes independientes de uso.
- No se publican cuantizaciones oficiales, por lo que cualquier conversión a GGUF o formatos de 4 bits corre por cuenta del usuario y sin garantías del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/qwen3.5-9b-fve-flourdiscern10m-s0
- Checkpoint relacionado del mismo autor: https://huggingface.co/joshycodes/qwen3.5-9b-fve-flourdiscern-s0
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficha de Qwen3.5 9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Catálogo de Microsoft Foundry para Qwen3.5-9B: https://ai.azure.com/catalog/models/qwen--qwen3.5-9b
- Repositorio de referencia Qwen3.5 en GitHub: https://github.com/Herry-Joe/Qwen3.5
- Repositorio `welfare-improvements` (citado en la model card, sin URL directa en la información disponible): no disponible
- Corpus `flourishing-vs-equanimity` (citado en la model card, sin URL directa en la información disponible): no disponible
