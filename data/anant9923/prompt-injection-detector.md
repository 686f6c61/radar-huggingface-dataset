# Anant9923/prompt-injection-detector

## Resumen

`Anant9923/prompt-injection-detector` es un modelo de clasificación de texto publicado en HuggingFace por el usuario Anant9923, cuyo propósito declarado por el nombre es detectar intentos de *prompt injection* (instrucciones maliciosas inyectadas en entradas de sistemas basados en LLM). El repositorio contiene únicamente pesos en formato safetensors y la etiqueta de arquitectura `deberta-v2`, lo que sitúa al modelo en la familia de encoders transformer DeBERTa-v2 con atención desacoplada. No es un modelo generativo: su pipeline declarado es `text-classification`.

El checkpoint cuenta con 141.896.450 parámetros (aproximadamente 141,9 millones), un tamaño propio de un encoder de escala *base* con vocabulario amplio, y el repositorio ocupa 0,6 GB. No se especifica el número de clases de salida, los datos de entrenamiento, el procedimiento de ajuste fino ni la licencia.

La relevancia de este tipo de modelos es alta en el contexto actual: los filtros de entrada de baja latencia para detectar inyecciones de prompt son un componente habitual en arquitecturas RAG, agentes con *tool calling* y pasarelas de API hacia LLM. Sin embargo, la model card es la plantilla automática de HuggingFace sin ninguna sección completada, el repositorio registra 0 descargas y 0 *likes*, y no hay resultados de evaluación publicados, por lo que cualquier uso en producción exigiría una validación independiente previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder transformer con atención desacoplada), según la etiqueta `deberta-v2` del repositorio; la model card no confirma número de capas, dimensión oculta ni cabezas de atención |
| Parámetros totales | 141.896.450 (≈141,9 M), según metadatos de safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no declarada por el autor. La arquitectura DeBERTa-v2 admite habitualmente hasta 512 posiciones, pero no está confirmado para este checkpoint |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos safetensors, sin versiones GGUF, GPTQ, AWQ ni ONNX |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Librería | transformers |
| Etiquetas del repositorio | transformers, safetensors, deberta-v2, text-classification, arxiv:1910.09700, text-embeddings-inference, endpoints_compatible, region:us |
| Tamaño del repositorio | 0,6 GB |
| Fecha de creación | 2026-10-16 |
| Última actualización | 2026-10-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La única información arquitectónica disponible es la etiqueta `deberta-v2`. DeBERTa-v2 es una familia de encoders transformer que sustituye la codificación posicional absoluta por atención desacoplada (cada token se representa con vectores de contenido y de posición que se combinan por separado en el cálculo de la atención) y emplea un decodificador de máscara mejorado para la modelización del lenguaje enmascarado. El recuento de 141,9 M de parámetros es coherente con una configuración de escala *base* y vocabulario amplio, pero el repositorio no publica el `config.json` con los hiperparámetros de arquitectura, por lo que no se puede confirmar el número de capas ni la dimensión oculta.

No hay absolutamente ningún dato sobre el entrenamiento: se desconoce el corpus utilizado, el número de tokens, la composición del conjunto de datos, si hubo anotación humana, si se aplicaron técnicas de ajuste como RLHF o DPO, y si el ajuste se hizo desde un checkpoint público de DeBERTa-v2 o desde un modelo propio. Tampoco se documentan los hiperparámetros de entrenamiento (régimen de precisión, tasa de aprendizaje, épocas), el número de clases de salida ni la interpretación de las etiquetas. La model card incluye el marcador `[More Information Needed]` en todas las secciones, incluida la de evaluación. El identificador `arxiv:1910.09700` que aparece entre las etiquetas corresponde al artículo de Lacoste et al. sobre estimación de emisiones de carbono citado en la plantilla automática de HuggingFace, no a un artículo asociado a este modelo.

## Capacidades

- Clasificación de texto: la única capacidad confirmada por el pipeline declarado. El modelo devuelve una etiqueta (o distribución sobre etiquetas) para un texto de entrada.
- Detección de *prompt injection*: es la tarea que indica el nombre del repositorio, aunque no hay ninguna validación publicada que lo demuestre.
- Generación de texto: no soportada. Es un encoder de clasificación, no un modelo causal.
- Razonamiento, matemáticas, código: no soportados como tareas generativas.
- *Tool calling* / *function calling*: no soportado.
- Agentes y razonamiento multi-paso: no soportado; el modelo solo puede actuar como clasificador auxiliar dentro de un pipeline de agente.
- Capacidades multilingües: no disponibles / no declaradas.
- Visión, audio: no soportados.
- Modo *thinking* o razonamiento explícito: no soportado.

## Casos de uso

- Filtro de entrada en pipelines RAG: clasificar cada consulta del usuario antes de recuperar documentos y antes de enviarla al LLM, bloqueando instrucciones que intenten sobrescribir el *system prompt* o exfiltrar el contexto recuperado. El tamaño de 141,9 M de parámetros permite ejecutarlo en la misma ruta crítica que el recuperador sin añadir latencia significativa.
- Pasarela de API hacia LLM (proxy de seguridad): interceptar cada *request* HTTP y aplicar el clasificador como primer paso de una cadena de defensa, con umbral de decisión ajustable, antes de reenviar la petición al modelo generativo.
- Protección de agentes con *tool calling*: validar las instrucciones que llegan desde fuentes externas (resultados de búsqueda, correos, documentos) antes de que el agente decida invocar herramientas con efectos secundarios, como escribir ficheros o ejecutar comandos.
- Moderación de contenido generado por usuarios: en foros, chats o plataformas colaborativas, marcar mensajes que contengan patrones de inyección dirigidos a bots integrados en la plataforma.
- Curación y limpieza de datasets: filtrar corpus de ajuste fino o de preentrenamiento para eliminar muestras con intentos de inyección, evitando que el modelo final aprenda a obedecer instrucciones embebidas en datos no confiables.
- Auditoría y observabilidad de seguridad: etiquetar el tráfico entrante de forma continua para construir métricas de intentos de ataque por cliente, ventana temporal o idioma, y alimentar alertas o *dashboards* de seguridad.
- *Red teaming* y pruebas de robustez: usar el clasificador como oráculo preliminar para medir qué porcentaje de un conjunto de *prompts* adversariales conocidos es detectado, siempre que se valide antes su precisión real.
- Despliegue en *edge* o en CPU: al tratarse de un encoder de 141,9 M, puede ejecutarse en servidores sin GPU o en instancias pequeñas, lo que lo hace viable como componente de seguridad en despliegues con restricciones de coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no contiene ninguna sección de evaluación completada (todos los campos aparecen como `[More Information Needed]`), no se especifica el conjunto de datos de test, ni las métricas (exactitud, F1, precisión/recall), ni el número de clases. Tampoco hay comparaciones con otros detectores de *prompt injection*. No se dispone, por tanto, de cifras de MMLU, GLUE, HumanEval ni de ningún *benchmark* específico de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia, derivada del recuento de parámetros (141,9 M) y sin incluir el *overhead* del *runtime*: aproximadamente 568 MB en fp32, 284 MB en fp16/bf16 y 142 MB en int8. En la práctica, con activaciones y memoria del framework, conviene reservar entre 1 y 2 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo está muy por debajo de la capacidad de cualquier acelerador moderno, por lo que la elección de GPU vendrá determinada por el *batching* y la concurrencia, no por el tamaño del modelo.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo de los últimos años e incluso en iGPU con memoria compartida suficiente.
- Ejecución en CPU: viable. Un encoder de esta escala procesa lotes pequeños en decenas de milisegundos por *batch* en CPU moderna, aunque no hay mediciones publicadas para este checkpoint concreto.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; Text Embeddings Inference (etiqueta `text-embeddings-inference` presente en el repositorio); servidores compatibles con la API de *endpoints* de HuggingFace (etiqueta `endpoints_compatible`). No se publican pesos en GGUF, por lo que llama.cpp, Ollama y LM Studio no son utilizables sin una conversión previa. vLLM y TGI no están confirmados para este repositorio.
- Latencia y *throughput*: no disponibles. No hay ninguna medición publicada por el autor.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que la comparación cuantitativa no es posible. La tabla recoge únicamente características estructurales verificables o indicadas como no disponibles.

| Modelo | Arquitectura | Tarea | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anant9923/prompt-injection-detector | DeBERTa-v2 (etiqueta) | Clasificación de texto (detección de *prompt injection* según el nombre) | 141,9 M | No disponible | HuggingFace, safetensors, 0 descargas |
| protectai/deberta-v3-base-prompt-injection (v2) | DeBERTa-v3-base | Detección de *prompt injection* | No verificado en esta búsqueda | No verificado | HuggingFace, con model card documentada |
| microsoft/deberta-v2-base | DeBERTa-v2 | Encoder genérico (*fill-mask*, ajustable) | No verificado en esta búsqueda | MIT (según el repositorio original de Microsoft) | HuggingFace, ampliamente utilizado |
| Encoders de clasificación de seguridad de propósito general (p. ej. modelos basados en BERT/RoBERTa ajustados para moderación) | BERT/RoBERTa | Clasificación de contenido | 110-355 M típicamente | Variable | Variable |

Los valores marcados como "no verificado" no proceden de la información proporcionada en esta búsqueda y deberían contrastarse en la fuente original antes de citarlos. En cualquier caso, la diferencia más relevante frente a alternativas establecidas no es de arquitectura, sino de trazabilidad: este repositorio carece de licencia, de documentación de entrenamiento y de evaluación, mientras que las alternativas mantenidas por organizaciones suelen publicar ambos.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática de HuggingFace sin ninguna sección completada, incluidas las de datos de entrenamiento, evaluación e impacto ambiental.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución. En la práctica, esto convierte el modelo en no apto para producción sin aclaración previa del autor.
- Sin evaluación publicada: no hay métricas de exactitud, F1 ni precisión/recall, ni descripción del conjunto de test. No se puede estimar la tasa de falsos positivos ni de falsos negativos.
- Idiomas no declarados: se desconoce si el modelo funciona fuera del inglés. Un detector entrenado solo en inglés tenderá a fallar ante ataques redactados en otros idiomas, incluido el español.
- Riesgo de evasión adversarial: los detectores basados en encoders pequeños son vulnerables a paráfrasis, ofuscación (codificaciones base64, homoglifos, espaciado anómalo), ataques multilingües y *payloads* fragmentados en varios turnos de conversación. Sin evaluación publicada no se puede cuantificar esta debilidad.
- Riesgo de falsos positivos: un clasificador de inyección agresivo puede bloquear consultas legítimas que contengan instrucciones, citas de documentación técnica o texto sobre seguridad, degradando la experiencia del usuario si se usa con un umbral mal calibrado.
- El riesgo de alucinación como tal no aplica, porque el modelo no genera texto; el riesgo equivalente es la clasificación errónea con alta confianza.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se puede evaluar el sesgo respecto a variedades dialectales, registros formales o jerga técnica.
- Sin validación comunitaria: 0 descargas y 0 *likes* en el momento de la consulta indican que el modelo no ha sido reproducido ni auditado por terceros.
- Autoría individual sin respaldo institucional declarado: no hay organización, *paper* ni repositorio de código asociado que permita verificar el proceso de desarrollo.
- Fechas: el repositorio figura como creado el 2026-10-16, con apenas 21 segundos entre creación y última actualización, lo que sugiere una subida automatizada o de prueba más que un artefacto depurado.
- Recomendación operativa: si se pretende usar, validarlo primero contra un conjunto propio de ataques y tráfico legítimo, fijar un umbral conservador, combinarlo con otras capas de defensa (delimitadores, validación de esquemas, permisos mínimos en herramientas) y no confiar en él como única barrera.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anant9923/prompt-injection-detector
- Paper de la arquitectura DeBERTa (He et al., arXiv:2006.03654), referencia externa no vinculada por el autor: https://arxiv.org/abs/2006.03654
- Paper de DeBERTaV3 (He et al., arXiv:2111.09543), referencia externa no vinculada por el autor: https://arxiv.org/abs/2111.09543
- Lacoste et al. (2019), *Quantifying the Carbon Emissions of Machine Learning* (arXiv:1910.09700), citado en la plantilla automática de la model card, no es una referencia del modelo: https://arxiv.org/abs/1910.09700
- Repositorio de código: no disponible
- Demo: no disponible
- Dataset de entrenamiento: no disponible
- Paper del modelo: no disponible
