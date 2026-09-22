# alfrre/Qwen3.5-4B-Q4_K_M-GGUF

## Resumen

`alfrre/Qwen3.5-4B-Q4_K_M-GGUF` es una conversión a formato GGUF del modelo base `Qwen/Qwen3.5-4B`, publicada por el usuario alfrre mediante el espacio `gguf-my-repo` de ggml.ai, que automatiza la conversión con llama.cpp. No se trata de un modelo entrenado desde cero, sino de una redistribución cuantizada del checkpoint original de Qwen, con licencia Apache 2.0 heredada del modelo base.

El interés práctico de esta ficha está en su tamaño: 4.326.350.848 parámetros (unos 4,33 mil millones) comprimidos en un único fichero de 2,8 GB, lo que lo sitúa en la franja de modelos ejecutables en hardware de consumo. La model card del repositorio es mínima y se limita a instrucciones de uso con llama.cpp, remitiendo a la model card original de Qwen para cualquier detalle sobre arquitectura, entrenamiento o datos.

El repositorio declara el pipeline `image-text-to-text`, lo que indica que el modelo base es multimodal (texto e imagen), aunque el proceso de cuantización y el propio repositorio no documentan si esa capacidad se conserva en la conversión. Con 0 descargas y 0 "likes" en el momento de redactar esta ficha, se trata de un artefacto sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el pipeline declarado es `image-text-to-text`, lo que sugiere un transformer multimodal con codificador visual; el repositorio no detalla la arquitectura) |
| Parámetros totales | 4.326.350.848 (≈4,33 mil millones) |
| Parámetros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 2048`, pero es un valor de ejemplo, no una especificación) |
| Tipos de cuantización | Q4_K_M (único fichero publicado en este repositorio); no se listan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base; enlace a la licencia de Qwen incluido en la model card) |
| Formato de pesos | GGUF (`qwen3.5-4b-q4_k_m.gguf`, 2,8 GB de repositorio) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO u otras) empleadas en `Qwen/Qwen3.5-4B`. La model card del repositorio cuantizado no incluye ningún apartado técnico: únicamente indica que el modelo fue convertido a GGUF desde el checkpoint original con llama.cpp a través del espacio GGUF-my-repo, y remite a la model card de Qwen para más detalles.

La única innovación documentada en este repositorio es, por tanto, el propio proceso de conversión: el paso de pesos `safetensors` a GGUF en cuantización Q4_K_M, que reduce el modelo a un fichero de 2,8 GB apto para inferencia en CPU y GPU con el ecosistema llama.cpp. No hay información sobre si el conversor preservó componentes no textuales (por ejemplo, el proyector multimodal) ni sobre qué modificaciones se aplicaron a las capas de atención.

## Capacidades

- Generación de texto conversacional: las etiquetas del repositorio incluyen `conversational`, y los ejemplos de uso de la model card son de completado de texto y de servidor de chat.
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text`, lo que implica capacidad multimodal en el modelo base. No hay confirmación de que esta capacidad sea operativa en la conversión GGUF publicada, ya que el repositorio no incluye fichero de proyector multimodal (mmproj).
- Compatibilidad con endpoints: el repositorio está etiquetado como `endpoints_compatible`, lo que facilita su despliegue en infraestructura compatible con la API de HuggingFace.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas en los metadatos.
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede ejecutarse con `llama-server` en una máquina de sobremesa o portátil con GPU modesta, sirviendo una API compatible con OpenAI para prototipos de chat sin depender de servicios en la nube.
- Procesamiento por lotes en CPU: al estar en GGUF Q4_K_M, permite generar resúmenes, clasificaciones o reescrituras de texto en servidores sin GPU, sacrificando velocidad pero con un coste de memoria de unos pocos gigabytes.
- Entornos con requisitos de privacidad: al ser un modelo de pesos abiertos y ejecutable en local, encaja en flujos donde los datos no pueden salir de la organización (sanidad, legal, administración pública), siempre que se validen previamente sus resultados.
- Prototipado rápido de aplicaciones RAG: su tamaño reducido permite levantar un servidor de inferencia en minutos y conectarlo a una base vectorial para responder preguntas sobre documentación interna.
- Evaluación comparativa de cuantizaciones: sirve como punto de partida para medir la pérdida de calidad de Q4_K_M frente al checkpoint original en `safetensors`, útil para decidir el nivel de cuantización en producción.
- Educación y experimentación: adecuado para prácticas de despliegue de modelos (llama.cpp, Ollama, LM Studio) en cursos o laboratorios con hardware limitado.
- Aplicaciones multimodales: el pipeline declarado sugiere uso potencial en tareas de imagen y texto, pero no hay evidencia en el repositorio de que la ruta de visión funcione a través de llama.cpp; habría que verificarlo antes de plantear un caso de uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni en la model card del repositorio cuantizado ni en los resultados de búsqueda web, que no devolvieron ningún material relacionado con el modelo (los resultados obtenidos eran páginas sin relación sobre aprendizaje de números en inglés).

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los 4,33 mil millones de parámetros y del tamaño del fichero Q4_K_M, 2,8 GB): aproximadamente 3 GB para los pesos, más la caché KV, que crece con la longitud de contexto utilizada. Con `-c 2048` el consumo adicional es pequeño; con contextos largos puede superar los 4-5 GB en total.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM puede cargar el modelo. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 lo ejecutan con holgura; en el extremo profesional, A100 o H100 no aportan ventaja significativa por tamaño, solo por concurrencia.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 6-8 GB o más (RTX 3060, 4060, 4070, 4090, así como iGPU con memoria unificada en Apple Silicon).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama y LM Studio pueden consumir el GGUF. vLLM y TGI no cargan GGUF de forma nativa; para esos motores habría que usar los pesos originales en `safetensors` del modelo base.
- Latencia y throughput estimados: no disponible. Dependen del hardware, del backend (CPU, CUDA, Metal) y de la longitud de contexto; no hay mediciones publicadas en la información facilitada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento, contexto ni evaluación de `Qwen/Qwen3.5-4B` ni de alternativas comparables, por lo que no es posible establecer una comparación rigurosa sin recurrir a datos no verificados.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| alfrre/Qwen3.5-4B-Q4_K_M-GGUF | 4,33 mil millones | no disponible | Apache 2.0 | GGUF Q4_K_M | no disponible |
| Qwen/Qwen3.5-4B (modelo base) | no disponible (referencia obligada) | no disponible | Apache 2.0 | safetensors | no disponible |
| Alternativas de la misma franja (3B-4B) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto sin validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, y una model card que no aporta información técnica propia. No hay garantía de que la conversión se haya verificado más allá del proceso automático del espacio GGUF-my-repo.
- Ausencia total de benchmarks: no se puede afirmar nada sobre la calidad del modelo ni sobre la degradación introducida por la cuantización Q4_K_M.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala (≈4B parámetros); en tareas de precisión factual, matemáticas o código conviene verificar las salidas.
- Idiomas no declarados: los metadatos no especifican la cobertura lingüística. No hay base para asumir un buen rendimiento en castellano sin evaluarlo.
- Contexto no documentado: la longitud de contexto real no aparece en la información; los ejemplos con `-c 2048` son valores de arranque del servidor, no la ventana máxima del modelo.
- Capacidad multimodal incierta: el repositorio declara `image-text-to-text`, pero solo publica un fichero GGUF. Sin un fichero de proyector multimodal, es probable que la ruta de imagen no funcione en llama.cpp; hay que comprobarlo antes de diseñar una aplicación de visión.
- Sesgos: no disponibles. No se ha publicado ninguna evaluación de sesgos, toxicidad o sesgo de género/raza para este checkpoint ni para su base.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero la model card enlaza a la licencia del modelo base de Qwen; conviene revisarla por si impone condiciones adicionales (por ejemplo, políticas de uso aceptable) que afecten a productos en producción.
- Formato limitado: al ser un GGUF, no es directamente utilizable con motores de alta concurrencia como vLLM o TGI sin recurrir al checkpoint original.
- Trazabilidad: el autor del repositorio es un tercero (`alfrre`), no Qwen; para cualquier uso crítico, la referencia canónica es el modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alfrre/Qwen3.5-4B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/README.md (referencia indicada en el repositorio)
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Espacio de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Nota sobre la búsqueda web: los resultados obtenidos no contenían información relacionada con el modelo; no se han encontrado papers, blogs ni demos adicionales.
