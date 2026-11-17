# Adiutant/word-line-e5

## Resumen

Adiutant/word-line-e5 es un modelo de extracción de características (feature extraction) publicado en Hugging Face por el usuario Adiutant, orientado a la generación de embeddings de líneas de texto manuscrito en ruso. El modelo combina el backbone de reconocimiento óptico de caracteres TrOCR con una cabeza de embeddings de la familia E5, de modo que en lugar de transcribir la imagen a texto devuelve un vector denso que representa el contenido semántico de la línea manuscrita. Está pensado, por tanto, para tareas de recuperación de información (information retrieval) sobre documentos manuscritos, donde la búsqueda se hace por similitud vectorial y no por coincidencia de transcripción.

El modelo tiene 88.129.152 parámetros y un repositorio de 0,4 GB, lo que lo sitúa en la gama de modelos pequeños y desplegables en hardware modesto. Se distribuye bajo licencia MIT, con pesos en safetensors y código propio (`custom_code`), y está etiquetado únicamente para el idioma ruso. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

Su relevancia radica en el nicho que cubre: la búsqueda semántica sobre escritura manual en ruso es un problema poco atendido por los modelos multilingües generalistas, que rinden peor en dominios manuscritos y en alfabeto cirílico. La información pública disponible sobre el modelo es muy limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `word_line_e5`, `custom_code`; combina TrOCR con embeddings E5 según los tags) |
| Parametros totales | 88.129.152 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información proporcionada no incluye una descripción técnica de la arquitectura. Los tags del repositorio (`word_line_e5`, `trocr`, `e5`, `custom_code`) sugieren una combinación de un encoder de visión basado en TrOCR, orientado a líneas de texto manuscrito, con una cabeza de proyección de embeddings al estilo E5, que produce representaciones vectoriales para recuperación. El modelo declara la clase de pipeline `feature-extraction`, coherente con ese diseño: la salida es un embedding, no una secuencia de tokens de texto.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). Tampoco se documentan detalles sobre la función de pérdida de recuperación ni sobre el proceso de alineación entre imagen y espacio vectorial E5. Todo ello debe considerarse no disponible.

## Capacidades

- Generación de embeddings densos a partir de imágenes de líneas de texto manuscrito en ruso.
- Recuperación de información (information retrieval) por similitud vectorial sobre documentos manuscritos.
- Extracción de características de imagen (`feature-extraction`) integrable en pipelines de `transformers`.
- Soporte de búsqueda semántica sobre colecciones de líneas manuscritas sin necesidad de transcripción previa.
- Capacidad multilingüe: limitada al ruso según los metadatos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión general, audio: no disponible (solo se documenta el procesamiento de imagen manuscrita para embeddings).

## Casos de uso

- Búsqueda semántica en archivos manuscritos rusos: indexar líneas de documentos escaneados como vectores y recuperar las más similares a una consulta, sin depender de una transcripción OCR exacta.
- Digitalización de archivos históricos o administrativos: generar un índice vectorial de líneas manuscritas para facilitar la localización de pasajes por parte de investigadores.
- Deduplicación y agrupación de líneas manuscritas: comparar embeddings para detectar formularios repetidos, encabezados duplicados o variantes de una misma anotación.
- Verificación de firmas o anotaciones manuscritas: usar la distancia entre embeddings de líneas de referencia y líneas candidatas como señal auxiliar en flujos de validación documental.
- Enriquecimiento de pipelines OCR: cuando el reconocimiento falla en escritura cursiva, el embedding permite recuperar la línea correcta por similitud frente a un corpus de referencia.
- Organización de datasets de investigación en reconocimiento de escritura manuscrita: agrupar muestras por similitud semántica para seleccionar subconjuntos de entrenamiento o evaluación.
- Integración en sistemas de gestión documental: añadir una capa de búsqueda vectorial sobre documentos rusos manuscritos junto a la búsqueda por metadatos existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,35 GB solo para pesos (88,1 M de parámetros), más el coste del encoder de visión y de las activaciones; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en FP16/BF16: alrededor de 0,18 GB para pesos, más activaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso de uso con holgura. Para lotes grandes, A10G, L4 o A100 ofrecen mayor throughput.
- Cabe en GPU consumer: sí, incluidas GPU de gama de entrada con 4-8 GB de VRAM.
- Opciones de despliegue: `transformers` con `custom_code` (requiere `trust_remote_code=True`); el soporte en vLLM, llama.cpp, Ollama o TGI no está documentado y, dado que es un modelo de embeddings con código propio, no puede asumirse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|---|
| Adiutant/word-line-e5 | 88,1 M | no disponible | Embeddings de líneas manuscritas | ru | MIT | Gated |
| TrOCR (variantes base/large) | no disponible en esta ficha | no disponible | OCR de texto manuscrito e impreso | en (principalmente) | MIT | Abierto |
| E5 (variantes small/base) | no disponible en esta ficha | no disponible | Embeddings de texto | multilingüe (según variante) | MIT | Abierto |
| Modelos de embeddings multilingües tipo LaBSE | no disponible en esta ficha | no disponible | Embeddings de texto | multilingüe | Apache 2.0 | Abierto |

La comparación es aproximada: los metadatos no permiten confirmar equivalencias exactas de backbone ni de rendimiento frente a estas alternativas. No se dispone de datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos, lo que puede complicar la automatización en CI/CD.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, con el riesgo de seguridad que implica ejecutar código del repositorio.
- Idioma limitado al ruso: no hay evidencia de soporte para otras lenguas o alfabetos.
- No es un modelo generativo: no produce transcripciones ni texto; solo embeddings.
- No se han publicado benchmarks, por lo que el rendimiento real en recuperación es desconocido.
- Riesgo de sesgo derivado de los datos de entrenamiento, que no están documentados; puede haber peor rendimiento en estilos de escritura, caligrafías o calidades de escaneo poco representadas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de embeddings poco discriminativos en líneas muy cortas o ambiguas.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de acceso del repositorio gated y las licencias de los componentes subyacentes (TrOCR, E5) antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.

## Enlaces

- Hugging Face: https://huggingface.co/Adiutant/word-line-e5
- Wikipedia (único resultado de la búsqueda web, no relacionado con el modelo): https://www.wikipedia.org/
