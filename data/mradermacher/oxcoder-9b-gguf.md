# mradermacher/OxCoder-9B-GGUF

## Resumen

OxCoder-9B-GGUF es la versión cuantizada en formato GGUF del modelo base OrionLLM/OxCoder-9B, publicada por el usuario mradermacher. El repositorio está pensado para facilitar la ejecución local del modelo en CPU o en GPU con VRAM limitada, aprovechando las distintas cuantizaciones disponibles (desde Q2_K hasta f16). El modelo original tiene 8.953.803.264 parámetros, aproximadamente 8,95 mil millones, y el repositorio declara únicamente el idioma inglés como soporte.

La relevancia de esta ficha radica en que el formato GGUF se ha convertido en el estándar de facto para el despliegue local de modelos abiertos con herramientas como llama.cpp, Ollama o LM Studio. No se dispone de información sobre la arquitectura interna, la longitud de contexto ni los datos de entrenamiento del modelo base, por lo que cualquier evaluación de capacidades reales debe realizarse de forma empírica. El repositorio incluye además dos archivos mmproj que apuntan a un posible complemento multimodal, aunque sin documentación detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers (según la etiqueta library_name del repositorio; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (≈8,95B) |
| Parametros activos | No aplicable (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (language: en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivos mmproj para complemento multimodal) |

## Arquitectura y entrenamiento

No se ha publicado en la información disponible ningún detalle sobre la arquitectura interna del modelo base, su número de capas, configuración de atención o si emplea algún mecanismo especial como mixture of experts. La única pista técnica es que el repositorio esta etiquetado con `library_name: transformers`, lo que indica compatibilidad con la librería Transformers de Hugging Face.

Tampoco hay datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO, ni ninguna innovación técnica destacable. Los archivos `mmproj` presentes en el repositorio son propios del ecosistema llama.cpp y suelen emplearse para proyecciones multimodales, lo que sugiere que el modelo base podría tener soporte de visión. Sin embargo, no hay documentación que confirme qué tipo de entrada multimodal acepta ni cómo se integra.

## Capacidades

- Generación de texto en inglés: el repositorio etiqueta el modelo como `conversational` y su idioma declarado es `en`.
- Inferencia local con GGUF: gracias a las cuantizaciones, puede ejecutarse en CPU o en GPU con distinta VRAM, permitiendo probar el modelo en entornos sin acceso a la nube.
- Posible soporte multimodal: los archivos `mmproj-Q8_0` y `mmproj-f16` sugieren que el modelo podría procesar entradas visuales, pero no se especifica el formato ni se aportan instrucciones de uso.
- No disponible: no se ha confirmado soporte para tool calling, function calling, razonamiento multi-paso, agentes automatizados, ni ningún modo de pensamiento explícito.
- Capacidades multilingües: no disponibles. El repositorio indica únicamente inglés.

## Casos de uso

- Evaluación local de prototipos conversacionales en inglés: se puede servir con llama.cpp o Ollama usando la cuantización Q4_K_M, lo que permite probar respuestas generativas en un portátil con 16 GB de RAM sin depender de servicios externos. Es adecuado por su licencia Apache 2.0 y su formato compatible con herramientas de consumo.
- Despliegue en entornos con GPU limitada: la cuantización Q4_K_M ocupa 5,7 GB, por lo que cabe en una GPU de 8 GB de VRAM como la RTX 3060. Es una opción viable para pruebas de concepto en puestos de trabajo modestos.
- Experimentos con cuantizaciones: al existir versiones desde Q2_K hasta f16, se puede medir la degradación de calidad en un modelo de 9B y seleccionar el punto óptimo entre velocidad y fidelidad. Esto resulta útil en investigación aplicada sobre efectos de compresión.
- Integración en una arquitectura de asistente local: el modelo puede cargarse mediante un endpoint compatible con OpenAI en Ollama y conectarse a una aplicación de chat interna. Requiere una validación previa porque no se han publicado benchmarks, pero su licencia permite uso comercial.
- Prototipado de aplicaciones de texto en CPU: empleando Q2_K o Q3_K, cuyo tamaño oscila entre 3,9 y 4,4 GB, se puede ejecutar la inferencia en servidores sin GPU. Aunque la velocidad será baja, es suficiente para automatizar tareas de generación de texto en segundo plano.
- Auditoría de calidad entre cuantizaciones: se pueden comparar las salidas de Q4_K_M, Q6_K y Q8_0 para una misma plantilla de prompts y decidir si el modelo base mantiene coherencia en razonamiento o generación. Es un caso de uso realista para equipos que evalúan modelos antes de desplegarlos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada tanto para el modelo base como para esta versión cuantizada.

## Requisitos de hardware

- Q2_K: 3,9 GB de pesos. Puede ejecutarse en CPU con 8 GB de RAM o en GPU con alrededor de 4 GB de VRAM más overhead de contexto.
- Q3_K_M: 4,7 GB. Recomendable para CPU con 16 GB de RAM o GPU con 6 GB de VRAM.
- Q4_K_M: 5,7 GB. Es la opción recomendada por el autor; requiere GPU con 8 GB de VRAM (RTX 3060, RTX 3070, RTX 4060) o CPU con 16 GB de RAM.
- Q6_K: 7,5 GB. Necesita una GPU con 12 GB de VRAM para un contexto moderado, por ejemplo RTX 3080 Ti o RTX 4070.
- Q8_0: 9,6 GB. Requiere GPU con 12-16 GB de VRAM, como RTX 4080 o A100 de 40 GB.
- f16: 18,0 GB. Solo apto para GPU con 24 GB de VRAM o para ejecución en RAM con CPUs potentes; no es práctico en equipos de consumo.
- El uso de los archivos mmproj añade un extra de 0,7 a 1,0 GB si se carga el complemento multimodal.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, GPT4All, text-generation-webui y, de forma experimental, vLLM con soporte para GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Contexto |
|---|---|---|---|---|
| mradermacher/OxCoder-9B-GGUF | 8,95B | GGUF | Apache 2.0 | no disponible |
| OrionLLM/OxCoder-9B | 8,95B | Safetensors (según metadatos de Hugging Face) | Apache 2.0 | no disponible |
| mradermacher/Yi-Coder-9B-GGUF | 9B (aprox.) | GGUF | Apache 2.0 | no disponible |

La comparación es limitada porque no se dispone de datos de rendimiento para ninguno de los tres. Yi-Coder-9B-GGUF comparte autor de cuantización, tamaño y licencia con OxCoder-9B-GGUF, lo que permite una comparativa directa a nivel de formato y requisitos de hardware, pero no de calidad de salida.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado. Dado que no existe información sobre el dataset de entrenamiento, no se puede evaluar el comportamiento ante poblaciones, culturas o temas sensibles.
- Riesgo de alucinación: no hay datos de fiabilidad. Como cualquier modelo generativo, puede producir información inventada, y su naturaleza no alineada lo hace especialmente propenso a respuestas no verificadas.
- Limitaciones de idioma: únicamente se declara inglés. No se recomienda su uso para tareas en español ni en otros idiomas sin pruebas previas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero hay que conservar el aviso de licencia, indicar los cambios realizados y no usar los nombres de los autores originales para promocionar productos derivados.
- Caveat de despliegue: no hay benchmarks publicados, por lo que la calidad real del modelo frente a alternativas de su tamaño es desconocida. Es obligatorio validar el modelo en el dominio de uso antes de considerar producción.
- Las cuantizaciones más agresivas (Q2_K, Q3_K) degradan significativamente la calidad. El autor del repositorio indica que "los quants IQ son a menudo preferibles", lo que debe tenerse en cuenta al seleccionar el archivo.
- El componente multimodal no está documentado. La presencia de archivos mmproj no garantiza que el modelo sea capaz de procesar imágenes correctamente ni que el formato de los pesos sea el adecuado para esa tarea.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/mradermacher/OxCoder-9B-GGUF
- Modelo base OrionLLM/OxCoder-9B: https://huggingface.co/OrionLLM/OxCoder-9B
- Vista previa de archivos de mradermacher: https://hf.tst.eu/model#OxCoder-9B-GGUF
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- No se han encontrado papers, blogs técnicos ni demos oficiales en la búsqueda web.
