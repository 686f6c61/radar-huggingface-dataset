# CrowdMind/bolt-test-1

## Resumen

bolt-test-1 es un modelo de lenguaje y visión (vision-language model) publicado por CrowdMind en Hugging Face, distribuido exclusivamente en formato GGUF y derivado de un modelo base identificado en los nombres de fichero como Qwen3.5-9B. El repositorio contiene pesos cuantizados listos para su uso con llama.cpp y herramientas compatibles, junto con un proyector multimodal (mmproj) que habilita la entrada de imágenes. El modelo se presenta como una variante "ultra-uncensored-heretic", es decir, un ajuste orientado a reducir los rechazos y filtros de seguridad del modelo original.

La información pública disponible es muy limitada: no se especifican licencia, idiomas soportados, pipeline ni detalles del entrenamiento. El dato más fiable es el recuento de parámetros en safetensors, que asciende a 8.953.803.264 (aproximadamente 8,95 mil millones), coherente con la denominación "9B" de los ficheros. El tamaño del repositorio es de 8,3 GB, lo que corresponde a las dos cuantizaciones publicadas (BF16 del proyector y Q6_K de los pesos principales).

Su relevancia actual es acotada pero concreta: ofrece una vía directa para ejecutar un modelo multimodal de ~9B en hardware de consumo mediante llama.cpp, con soporte declarado para endpoints compatibles y uso conversacional. No obstante, la ausencia de model card técnica, benchmarks y licencia explícita obliga a tratarlo con cautela en entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (los tags indican qwen3_5; se infiere transformer con proyector multimodal, sin confirmación del autor) |
| Parámetros totales | 8.953.803.264 (~8,95 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q6_K (pesos principales), BF16 (proyector mmproj) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors solo como recuento de parámetros en el repo) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. Los tags del repositorio apuntan a la familia Qwen3.5 y a un modelo de visión-lenguaje, y la presencia de un fichero `mmproj` confirma la existencia de un proyector multimodal que conecta un codificador visual con el modelo de lenguaje, pero no se detalla su diseño.

El único dato técnico verificable del proceso es la conversión a GGUF mediante Unsloth, según declara el autor en la model card. El nombre de los ficheros sugiere un ajuste posterior orientado a eliminar restricciones de seguridad ("uncensored-heretic"), pero se desconoce la metodología, el volumen de datos empleado y si hubo entrenamiento adicional sobre el modelo base o únicamente modificación de comportamiento.

## Capacidades

- Generación de texto conversacional en formato multi-turno, según el tag `conversational`.
- Procesamiento de imágenes y texto combinados (vision-language model), con soporte mediante `llama-mtmd-cli`.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Ejecución en llama.cpp con soporte de plantillas de chat mediante el flag `--jinja`.
- Comportamiento "uncensored": menor propensión a rechazar peticiones, según la denominación del autor.
- No se documenta soporte explícito de tool calling, function calling, agentes, modo thinking ni audio; no disponible.

## Casos de uso

- Inferencia local multimodal en estaciones de trabajo: con cuantización Q6_K y ~9B de parámetros, el modelo puede ejecutarse en GPU de consumo para tareas de descripción de imágenes y preguntas sobre contenido visual, usando `llama-mtmd-cli`.
- Prototipado de asistentes conversacionales: su formato GGUF y compatibilidad con plantillas Jinja permiten desplegar un chatbot multi-turno en llama.cpp sin infraestructura adicional.
- Procesamiento de documentos con imágenes: extracción de información de capturas, diagramas o formularios combinando el codificador visual con el modelo de lenguaje.
- Investigación sobre alineación y seguridad: al tratarse de una variante "uncensored", resulta útil para estudiar el comportamiento de modelos sin filtros y comparar tasas de rechazo frente al modelo base.
- Evaluación de pipelines GGUF: sirve como banco de pruebas para medir throughput y latencia de llama.cpp con un modelo de ~9B en distintas GPU.
- Despliegue en entornos air-gapped: al distribuirse como ficheros GGUF descargables, puede ejecutarse sin conexión en infraestructura local con requisitos de privacidad.
- Integración en servicios compatibles con endpoints: el tag `endpoints_compatible` sugiere su uso tras una API de inferencia para aplicaciones cliente ligeras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para Q6_K: aproximadamente 7-8 GB solo para los pesos, más overhead de contexto y del proyector multimodal; en la práctica, entre 9 y 11 GB según longitud de contexto.
- VRAM estimada para BF16 (solo proyector): el fichero `mmproj` en BF16 es ligero en comparación con los pesos principales, pero requiere cargarse junto al modelo.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q6_K con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q6_K con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más para Q6_K; con 8-10 GB podría requerir reducción de contexto u offloading parcial a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), y servidores compatibles con GGUF; no se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles; dependerán de la GPU y del backend, sin datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| CrowdMind/bolt-test-1 | ~8,95 B | no disponible | Sí (mmproj) | no disponible | GGUF |
| Qwen2.5-VL-7B | ~7 B | no disponible en esta ficha | Sí | no disponible en esta ficha | safetensors, GGUF (comunidad) |
| Llama 3.2 11B Vision | ~11 B | no disponible en esta ficha | Sí | no disponible en esta ficha | safetensors, GGUF (comunidad) |

No se dispone de datos de rendimiento comparativos ni de especificaciones verificadas de los modelos alternativos dentro de la información proporcionada; la comparación se limita a categoría y tamaño aproximado.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no hay información sobre datos de entrenamiento, sesgos, idiomas ni evaluación, lo que impide validar su calidad de forma rigurosa.
- Licencia no especificada: no puede confirmarse el uso comercial; debe contactarse con el autor o asumirse riesgo legal.
- Variante "uncensored-heretic": menor adherencia a filtros de seguridad, con mayor probabilidad de generar contenido inapropiado, ofensivo o dañino; no recomendable en aplicaciones orientadas al público sin capas de moderación adicionales.
- Riesgo de alucinación no cuantificado: sin benchmarks ni evaluación, no es posible estimar la fiabilidad factual.
- Contexto e idiomas desconocidos: no se puede garantizar un rendimiento adecuado en castellano ni en conversaciones de contexto largo.
- Repositorio sin descargas ni likes y creado recientemente: escasa validación por parte de la comunidad.
- El nombre de los ficheros hace referencia a Qwen3.5, pero el autor no confirma oficialmente el modelo base ni los términos de su licencia original.
- Formato exclusivamente GGUF: no apto para fine-tuning directo con frameworks que requieran safetensors o PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CrowdMind/bolt-test-1
- Unsloth (herramienta de conversión declarada): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por el autor): no se incluye enlace en la información proporcionada, pero es el runtime referenciado en la model card.
