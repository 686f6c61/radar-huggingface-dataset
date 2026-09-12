# LaToucheCarre/Qwen3.5-0.8B-FR-EN-GGUF

## Resumen

Qwen3.5-0.8B-FR-EN-GGUF es una derivación del modelo Qwen/Qwen3.5-0.8B publicada por el usuario LaToucheCarre. No es un modelo entrenado desde cero ni un ajuste fino: es la cuantización Q4_K_M del modelo base, en formato GGUF, a la que se han eliminado las filas de la matriz de embeddings correspondientes a tokens no necesarios para francés e inglés. El resultado es un único fichero de 478.345.824 bytes (unos 456 MiB) con SHA-256 a514d3b96797d78e4f1c9270e8436469c87caab3ec5c63520847d134e6c2c072, según la model card del autor.

Según los metadatos de safetensors del modelo base, este cuenta con 656.858.432 parámetros (unos 0,66B), aunque el nombre comercial del repositorio indique 0,8B. El modelo base se distribuye bajo licencia Apache-2.0 y el autor declara los idiomas francés e inglés, con etiquetas de llama.cpp, imatrix y conversational.

Su relevancia práctica es acotada pero clara: se trata de un modelo sub-1B pensado para inferencia totalmente local sobre CPU dentro de una aplicación Android (el teclado La Touche Carré, que lo usa para corrección de texto). El recorte del vocabulario reduce el coste de memoria de la matriz de embeddings a cambio de limitar el modelo estrictamente al par de idiomas declarado. El repositorio no tiene descargas ni valoraciones y no publica benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada (heredada de Qwen/Qwen3.5-0.8B) |
| Parámetros totales | 656.858.432 (modelo base, según safetensors) |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Q4_K_M (fichero distribuido); etiqueta imatrix en el repositorio |
| Idiomas soportados | Francés (fr) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero qwen3.5-0.8b-q4km-fren.gguf, 478.345.824 bytes) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Qwen/Qwen3.5-0.8B (número de capas, dimensiones, mecanismo de atención, tipo de positional encoding ni composición del dataset de preentrenamiento). Lo único documentado es la intervención realizada por el autor de este repositorio: partiendo de la cuantización Q4_K_M publicada por bartowski (bartowski/Qwen_Qwen3.5-0.8B-GGUF), se han eliminado del GGUF las filas de la tabla de embeddings de tokens inútiles para francés e inglés. El autor afirma explícitamente que no se modifica ningún otro peso y que la cuantización es la de origen.

Esto implica tres consecuencias técnicas relevantes. Primera, el modelo no ha recibido ningún entrenamiento adicional, ajuste fino, RLHF ni DPO por parte de este autor: las capacidades son las del modelo base en Q4_K_M, sólo que con un vocabulario de salida reducido. Segunda, al alterar la matriz de embeddings se rompe la equivalencia byte a byte con la cuantización original, de modo que cualquier reproducción exige usar exactamente el fichero distribuido (y verificar su SHA-256). Tercera, no se documenta el número de filas eliminadas, el tamaño final del vocabulario ni el impacto medido sobre la perplejidad, por lo que el efecto real del recorte no es cuantificable con la información pública.

## Capacidades

- Generación de texto conversacional en francés e inglés, según la etiqueta conversational y los idiomas declarados.
- Corrección de texto: es el uso para el que se ha publicado, integrado en el teclado Android La Touche Carré en modo totalmente on-device con llama.cpp sobre CPU.
- Inferencia local sin GPU: el formato GGUF y el tamaño del fichero permiten ejecución en CPU y en dispositivos con memoria limitada.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta endpoints_compatible, orientada a servidores de inferencia compatibles con la API de OpenAI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a francés e inglés; el vocabulario recortado excluye explícitamente el resto de idiomas.
- Capacidades especiales (modo thinking, visión, audio, decodificación especulativa): no disponibles en la información proporcionada.
- Generación de código y matemáticas: no se documenta y, dado el recorte de vocabulario a fr/en, es esperable que se vea afectada negativamente; no hay datos que lo confirmen.

## Casos de uso

- Corrección ortográfica y gramatical en teclados móviles: es el caso de uso real declarado. El modelo se ejecuta íntegramente en el dispositivo con llama.cpp sobre CPU, sin enviar el texto del usuario a un servidor, lo que resuelve los requisitos de privacidad y de funcionamiento sin conexión de un teclado Android.
- Autocompletado y sugerencia de siguiente palabra en aplicaciones de escritura: con un fichero de 456 MiB y cuantización Q4_K_M, la latencia por token es compatible con la generación de continuaciones cortas en el propio terminal, siempre que se valide el tiempo de respuesta en el hardware objetivo.
- Normalización de texto de entrada en asistentes francófonos o anglófonos: reescritura de consultas de usuario, corrección de mayúsculas, puntuación y erratas antes de enviarlas a un modelo mayor, aprovechando que el vocabulario está restringido a los dos idiomas de trabajo.
- Clasificación y enrutado ligero de intenciones: con prompts cortos de tipo "responde sólo con una etiqueta", puede actuar como clasificador de bajo coste en pipelines donde un modelo grande sería desproporcionado, siempre que se valide su precisión empíricamente.
- Generación de respuestas conversacionales muy breves en aplicaciones con recursos mínimos: respuestas de una o dos frases en fr/en en dispositivos embebidos, Raspberry Pi o entornos de escritorio sin GPU.
- Pruebas de integración y CI sin GPU: sirve como modelo de sustitución en tests automatizados de pipelines llama.cpp, servidores compatibles con la API de OpenAI y validación de plantillas de prompt, sin consumir recursos de acelerador.
- Despliegue en el navegador o en aplicaciones de escritorio multiplataforma mediante bindings de llama.cpp (llama-cpp-python, WASM), dado el tamaño reducido del fichero.
- Filtrado de texto en fr/en en entornos con estricta soberanía de datos: al no requerir conectividad ni servicios externos, encaja en despliegues donde el texto no puede salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor no reporta MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra métrica, ni antes ni después del recorte de vocabulario, por lo que no es posible cuantificar el impacto de la eliminación de filas de embeddings.

## Requisitos de hardware

- VRAM estimada: el fichero de pesos ocupa 478.345.824 bytes (unos 456 MiB). Sumando caché KV y overhead del runtime, una estimación razonable es del orden de 0,6 a 1,2 GB, dependiendo de la longitud de contexto realmente utilizada (dato no documentado).
- Memoria en CPU: al ser el caso de uso declarado, el modelo está pensado para ejecutarse en RAM de sistema. Cabe en cualquier dispositivo Android actual con holgura, dado el tamaño del fichero.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer con 2 GB o más de VRAM es suficiente; el modelo no aprovecha aceleradores de gama alta por su tamaño.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (RTX 3060, RTX 4090, GTX 1650 o superior) e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (runtime de referencia, indicado en las etiquetas del repositorio), llama-cpp-python, Ollama, LM Studio, servidores compatibles con endpoints estilo OpenAI (etiqueta endpoints_compatible) y bindings WASM. El soporte de GGUF en vLLM es limitado, por lo que no se recomienda como opción principal.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por token, ni en CPU móvil ni en escritorio.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de fichas comparables en la información proporcionada. La comparación se limita, por tanto, a los artefactos de la misma familia documentados en la model card.

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LaToucheCarre/Qwen3.5-0.8B-FR-EN-GGUF | 656.858.432 (base) | No disponible | GGUF, Q4_K_M, vocabulario recortado a fr/en | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (modelo base) | 656.858.432 | No disponible | Safetensors (repositorio original) | Apache-2.0 | HuggingFace |
| bartowski/Qwen_Qwen3.5-0.8B-GGUF | 656.858.432 (base) | No disponible | GGUF, múltiples cuantizaciones, vocabulario completo | Apache-2.0 | HuggingFace |

Frente al modelo base y a la cuantización de bartowski, la única diferencia funcional documentada es el recorte de la matriz de embeddings: menor tamaño de fichero y menor consumo de memoria en el vocabulario, a cambio de perder cualquier capacidad fuera de francés e inglés. No hay datos de rendimiento que permitan afirmar que este recorte mejora o degrada la calidad dentro de fr/en.

## Limitaciones y advertencias

- Cobertura idiomática restringida: sólo francés e inglés. El recorte de embeddings elimina los tokens del resto de idiomas, por lo que la generación en otros idiomas, en lenguajes de programación o con símbolos poco frecuentes puede degradarse o producir resultados incorrectos.
- Modificación no convencional del GGUF: la matriz de embeddings ha sido alterada respecto a la cuantización original. Conviene validar la compatibilidad con el runtime y con el tokenizador antes de integrarlo, y verificar el SHA-256 del fichero.
- Sin datos de evaluación: no hay benchmarks, perplejidad ni comparación antes/después del recorte, por lo que el impacto real de la intervención es desconocido.
- Riesgo de alucinación: es un modelo de menos de 1.000 millones de parámetros; en tareas de conocimiento factual o generación abierta la tasa de error es previsiblemente alta. En corrección de texto el riesgo se limita a reescrituras incorrectas, pero no es nulo.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones o documentos largos. Se recomienda medirlo experimentalmente.
- Sin validación comunitaria: el repositorio registra 0 descargas y 0 valoraciones, y fue actualizado el mismo día de su creación, por lo que no existe retroalimentación de terceros sobre su funcionamiento.
- Licencia y atribución: el fichero se distribuye bajo Apache-2.0, igual que el modelo base, lo que permite uso comercial. Es obligatorio conservar los avisos de licencia y la atribución a Qwen Team (Alibaba Cloud), y conviene revisar los términos del repositorio original del modelo base antes de un despliegue en producción.
- Aviso típico de modelos derivados: aunque la licencia Apache-2.0 es permisiva, la responsabilidad sobre el comportamiento del modelo recortado es del publicador del derivado, no del autor original.
- Longitud de contexto y soporte de tool calling no verificados: cualquier arquitectura de agente o de llamada a funciones construida sobre este modelo requiere validación empírica previa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LaToucheCarre/Qwen3.5-0.8B-FR-EN-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Cuantización GGUF de origen: https://huggingface.co/bartowski/Qwen_Qwen3.5-0.8B-GGUF
- Búsquedas web realizadas: no han devuelto resultados relevantes sobre el modelo, su autor ni su publicación; los resultados obtenidos corresponden a servicios de floristería y no guardan relación con el repositorio.
