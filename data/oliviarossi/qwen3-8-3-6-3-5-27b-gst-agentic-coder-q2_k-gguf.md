# OliviaRossi/Qwen3.8-3.6-3.5-27B-GST-Agentic-Coder-Q2_K-GGUF

## Resumen

OliviaRossi/Qwen3.8-3.6-3.5-27B-GST-Agentic-Coder-Q2_K-GGUF es una cuantización en formato GGUF (tipo Q2_K) del modelo fusionado OliviaRossi/Qwen3.8-3.6-3.5-27B-GST-Agentic-Coder, un merge de varias variantes de la familia Qwen (etiquetadas como qwen3.5, qwen3.6 y qwen3.8 en los tags del repositorio) orientado a tareas de codificación agéntica y con pipeline declarado image-text-to-text. El modelo original cuenta con 27.320.697.856 parámetros en safetensors y el repositorio cuantizado ocupa 10,9 GB.

La conversión a GGUF se ha realizado con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, lo que permite ejecutar el modelo en CPU, GPU consumer y entornos con poca VRAM mediante la cuantización de 2 bits con K-quants. La licencia declarada es Apache 2.0 y el autor publica el checkpoint sin model card técnica propia: la información disponible se limita a los metadatos del repositorio y a las instrucciones de uso con llama.cpp.

Es relevante ahora porque permite desplegar un modelo de ~27B con capacidades multimodales y orientación a agentes de código en hardware modesto, aunque la cuantización Q2_K implica una pérdida de calidad considerable frente a los pesos originales en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como qwen3.5/qwen3.6/qwen3.8 y multimodal image-text-to-text; arquitectura interna no documentada) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama-server usa `-c 2048`, pero es un valor de ejemplo, no una especificación del modelo) |
| Tipos de cuantizacion | Q2_K (esta variante); el repositorio base puede ofrecer otras, no documentadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. Los tags indican que se trata de un merge (gst-merge) de modelos de la familia Qwen en versiones 3.5, 3.6 y 3.8, con capacidades multimodales (pipeline image-text-to-text) y orientación a codificación agéntica. No se especifican detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

La única innovación técnica documentada es el proceso de cuantización: conversión a GGUF mediante llama.cpp y el espacio GGUF-my-repo de ggml.ai, con cuantización Q2_K (2 bits por peso con K-quants). No hay información sobre decodificación especulativa, atención lineal ni otras técnicas de eficiencia en el modelo original.

## Capacidades

- Generación de texto y razonamiento general, según la categoría del modelo base (no verificado en la información disponible).
- Codificación agéntica: el nombre del modelo indica orientación explícita a tareas de agente y generación de código.
- Capacidades multimodales image-text-to-text: el pipeline declarado sugiere entrada de imágenes junto con texto, aunque no se detalla el alcance.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: inferido del nombre (Agentic Coder), sin documentación técnica que lo confirme.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Asistencia de código en local: el modelo puede ejecutarse con llama.cpp en estaciones de trabajo sin GPU dedicada, sirviendo como asistente de programación en entornos con recursos limitados gracias a su cuantización Q2_K.
- Prototipado de agentes de código: al estar orientado a codificación agéntica, puede emplearse para experimentar con flujos de agente (planificación, edición de ficheros, ejecución de comandos) en un servidor llama-server local.
- Despliegue en equipos de desarrollo con VRAM reducida: los 10,9 GB del repositorio permiten cargar el modelo en GPUs consumer de gama alta o incluso en CPU con suficiente RAM, facilitando pruebas sin infraestructura cloud.
- Evaluación de merges multimodales: útil para investigadores que quieran comparar el comportamiento de un merge Qwen 3.5/3.6/3.8 frente a los modelos originales en tareas de imagen y texto.
- Generación de documentación técnica y comentarios de código: el modelo puede integrarse en pipelines de pre-commit o CI para generar docstrings y resúmenes de cambios, siempre que se valide la calidad de la salida Q2_K.
- Experimentación con cuantización extrema: caso de uso meta para estudiar la degradación de calidad de Q2_K frente a cuantizaciones mayores en un modelo de ~27B con capacidades multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10,9 GB para los pesos Q2_K, más overhead de contexto KV; un presupuesto realista de 12-14 GB de VRAM para contextos moderados.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100; también tarjetas de 16 GB podrían funcionar con contextos cortos.
- Cabe en GPU consumer: sí, en modelos con 12-16 GB o más de VRAM; en CPU requiere al menos ~12-16 GB de RAM libre.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por compatibilidad de formato GGUF, potencialmente Ollama y otros runners basados en llama.cpp; vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OliviaRossi/Qwen3.8-3.6-3.5-27B-GST-Agentic-Coder-Q2_K-GGUF | ~27,3B | no disponible | Apache 2.0 | GGUF Q2_K | Merge multimodal orientado a agentes de código |
| Modelo base OliviaRossi/Qwen3.8-3.6-3.5-27B-GST-Agentic-Coder | ~27,3B | no disponible | Apache 2.0 | safetensors | Precisión original, mayor calidad |
| Familia Qwen oficial (3.5/3.6/3.8) | no disponible | no disponible | no disponible | safetensors, GGUF | Referencia de los merges; specs no verificadas en esta ficha |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La cuantización Q2_K es agresiva (2 bits por peso) y degrada notablemente la calidad respecto a los pesos originales; no se recomienda para producción sin validación exhaustiva.
- El modelo es un merge no oficial de variantes Qwen; no procede del equipo oficial de Qwen y carece de documentación técnica sobre entrenamiento y evaluación.
- No hay información sobre sesgos, alucinación o comportamiento en idiomas distintos del inglés.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es un merge cuyos componentes originales podrían tener condiciones adicionales; conviene revisar las licencias de los modelos fuente.
- El pipeline image-text-to-text no está documentado en detalle: no se especifica el codificador visual ni el formato de entrada de imágenes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- No se especifica la longitud de contexto soportada; el valor `-c 2048` del ejemplo de llama-server no debe interpretarse como límite del modelo.

## Enlaces

- Repositorio Hugging Face (GGUF Q2_K): https://huggingface.co/OliviaRossi/Qwen3.8-3.6-3.5-27B-GST-Agentic-Coder-Q2_K-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Qwen3.8-3.6-3.5-27B-GST-Agentic-Coder
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
