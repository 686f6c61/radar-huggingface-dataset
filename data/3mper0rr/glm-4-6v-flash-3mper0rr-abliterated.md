# 3MPER0RR/GLM-4.6V-Flash-3MPER0RR-abliterated

## Resumen

GLM-4.6V-Flash-3MPER0RR-abliterated es un modelo derivado del huihui-ai/Huihui-GLM-4.6V-Flash-abliterated, que a su vez parte del GLM-4.6V-Flash del laboratorio Zhipu AI (Z.ai). El autor 3MPER0RR ha aplicado un proceso de abliteración en múltiples rondas, una técnica de edición de pesos que busca eliminar las direcciones de activación responsables de rechazos y respuestas de seguridad, de modo que el modelo deja de declinar peticiones que el modelo original rechazaría. El resultado es un checkpoint de aproximadamente 10.300 millones de parámetros (10.292.777.472 según los tensores safetensors), con un repositorio de 20,6 GB y licencia MIT.

El modelo conserva la arquitectura del GLM-4.6V-Flash original: un transformer multimodal con capacidad de procesar texto e imagen (el tag `glm4v` así lo indica) y orientado a generación de texto conversacional. La relevancia de esta ficha estriba precisamente en su carácter derivado: no aporta innovaciones arquitectónicas propias, sino una variante de pesos modificados para investigación sobre alineación, robustez y comportamiento de modelos abliterados. Se trata de un artefacto de experimentación, no de un modelo con garantías de producción.

La información publicada por el autor es extremadamente escasa: la model card se limita a indicar el modelo base, el proceso de abliteración en varias rondas, el estado "tested and saved" y la licencia MIT. No se documentan datos de entrenamiento, composición del corpus, idiomas, benchmarks ni metodología detallada de la abliteración, por lo que muchos campos de esta ficha deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia GLM-4.6V, tag `glm4v`); detalles internos no disponibles |
| Parámetros totales | 10.292.777.472 (~10,3 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al GLM-4.6V-Flash de Zhipu AI, un transformer multimodal de la familia GLM-4V orientado a generación de texto y comprensión de imágenes. El tag `glm4v` del repositorio confirma la modalidad visual, aunque no se dispone de documentación sobre número de capas, dimensiones ocultas, mecanismo de atención, tokenizador ni estrategia de entrenamiento del modelo original en la información proporcionada.

El entrenamiento de esta variante no es un entrenamiento desde cero, sino una edición de pesos: el autor describe un proceso de "multi-round abliteration" aplicado sobre huihui-ai/Huihui-GLM-4.6V-Flash-abliterated. La abliteración calcula direcciones de activación asociadas a respuestas de rechazo y las proyecta fuera de los pesos, repitiendo el proceso en varias rondas para reforzar el efecto. No se documentan el dataset usado para calibrar las direcciones, el número exacto de rondas, la tasa de éxito ni las métricas de degradación de capacidades tras la edición.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base GLM-4.6V-Flash.
- Procesamiento de entrada visual (imagen) según el tag `glm4v` de la familia base; el grado de conservación de esta capacidad tras la abliteración no está verificado en la información disponible.
- Razonamiento y respuesta a instrucciones generales, con un comportamiento esperado de menor tasa de rechazos debido a la abliteración.
- Soporte de tool calling / function calling: no disponible en la documentación del autor; dependería de las capacidades del modelo base, no verificadas aquí.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo "thinking" explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre alineación y robustez: el modelo sirve como objeto de estudio para medir cómo la abliteración altera la tasa de rechazos, la utilidad percibida y la degradación de capacidades frente al GLM-4.6V-Flash original, en entornos controlados de laboratorio.
- Evaluación comparativa de seguridad: permite contrastar respuestas de un checkpoint abliterado con las del modelo base sobre un conjunto de prompts de riesgo, para calibrar clasificadores y filtros de salida en pipelines de moderación.
- Pruebas de red teaming internas: útil para entrenar evaluadores humanos y automáticos a reconocer respuestas no filtradas y diseñar contramedidas antes de desplegar modelos con salvaguardas.
- Generación de texto creativo sin fricción: en entornos donde las políticas del modelo base bloquean contenido legítimo (ficción, narrativa adulta no dañina, escenarios hipotéticos), la variante abliterada reduce los rechazos espurios; requiere revisión humana del contenido generado.
- Experimentación con modelos multimodales editados: permite estudiar si la abliteración afecta la rama visual del modelo, comparando descripciones de imágenes entre el checkpoint original y el derivado.
- Base para fine-tuning posterior: al estar en safetensors y licencia MIT, puede servir como punto de partida para ajustes específicos de dominio (por ejemplo, estilo editorial o asistencia técnica) sin las restricciones de rechazo del modelo original, siempre con salvaguardas externas.
- Docencia y demostraciones sobre edición de pesos: caso práctico para explicar abliteración, direcciones de activación y sus límites en cursos de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, ni comparaciones numéricas con el modelo base. Tampoco se documentan evaluaciones de tasa de rechazo o de degradación tras la abliteración.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 20,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para contextos moderados.
- VRAM estimada en cuantización de 8 bits: entorno a 10-11 GB para pesos, con margen adicional para activaciones.
- VRAM estimada en cuantización de 4 bits: entorno a 5,5-6,5 GB para pesos, viable en GPUs de consumo de gama alta.
- GPU recomendadas: A100 40/80 GB, H100 para servicio de alta concurrencia; RTX 4090 (24 GB) para FP16 con contexto limitado; RTX 3090/4080 para 8 bits; RTX 4060 Ti 16 GB o superiores para 4 bits.
- Cabe en GPU de consumo: sí, en cuantizaciones de 8 y 4 bits; en FP16 requiere tarjetas de 24 GB o más.
- Opciones de despliegue: llama.cpp/Ollama si se generan cuantizaciones GGUF a partir de los safetensors; vLLM y TGI para servicio en FP16/BF16; transformers como vía de referencia. No se publican cuantizaciones oficiales en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| GLM-4.6V-Flash-3MPER0RR-abliterated | ~10,3 mil millones | no disponible | sí (tag `glm4v`) | MIT | Disponible en HF, 559 descargas |
| huihui-ai/Huihui-GLM-4.6V-Flash-abliterated (base directo) | no disponible | no disponible | sí | no disponible en esta ficha | Disponible en HF |
| GLM-4.6V-Flash (Zhipu AI, original) | no disponible | no disponible | sí | no disponible en esta ficha | Modelo de referencia de la familia |
| Alternativas abliteradas de la familia Qwen/Llama | variable | variable | depende del base | variable | Disponibles en HF (huihui-ai y otros) |

La comparación cuantitativa con alternativas no puede completarse: no hay datos de contexto, benchmarks ni licencia del modelo base y del original en la información proporcionada. La diferencia principal frente al base directo es la aplicación de una ronda adicional de abliteración por parte de 3MPER0RR.

## Limitaciones y advertencias

- La abliteración elimina salvaguardas de rechazo; el modelo puede producir contenido que el GLM-4.6V-Flash original bloquearía. No debe exponerse directamente a usuarios finales sin filtros externos.
- Riesgo elevado de alucinación y de respuestas inseguras, agravado por la falta de evaluación publicada tras la edición de pesos.
- La abliteración puede degradar capacidades (razonamiento, coherencia, seguimiento de instrucciones); no hay métricas que cuantifiquen esta pérdida.
- Idiomas, contexto y comportamiento multimodal no documentados; no se puede garantizar el rendimiento en castellano ni en otros idiomas.
- Licencia MIT declarada, pero el modelo base y el original pueden tener términos adicionales que el autor no reproduce; conviene verificar las licencias de huihui-ai y Zhipu AI antes de uso comercial.
- Modelo de investigación con 559 descargas y cero likes en el momento de la consulta; sin mantenimiento, issues ni soporte documentados.
- La model card es mínima y no incluye metodología reproducible; los resultados de la abliteración no son auditables a partir de la información pública.
- Fecha de creación y actualización (2026) y ausencia de datos de validación externa aconsejan tratar el checkpoint como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/3MPER0RR/GLM-4.6V-Flash-3MPER0RR-abliterated
- Modelo base directo: https://huggingface.co/huihui-ai/Huihui-GLM-4.6V-Flash-abliterated
- Familia GLM-4.6V de Zhipu AI: https://huggingface.co/zai-org (repositorio de modelos del laboratorio; enlace de referencia, no verificado en la búsqueda)
- Repositorio de huihui-ai: https://huggingface.co/huihui-ai (enlace de referencia, no verificado en la búsqueda)
