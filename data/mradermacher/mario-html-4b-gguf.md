# mradermacher/mario-html-4B-GGUF

## Resumen

mario-html-4B-GGUF es la versión cuantizada en formato GGUF del modelo wesjos/mario-html-4B, un modelo multimodal (image-text-to-text) de 4.326.350.848 parámetros orientado a la generación de HTML y al diseño web a partir de entradas visuales. La cuantización la firma mradermacher, un autor habitual en el ecosistema GGUF, y el repositorio incluye tanto los pesos del modelo como el proyector multimodal (mmproj) necesario para procesar imágenes.

El modelo está etiquetado con capacidades de generación de HTML, diseño web, interfaz visual, respuesta a preguntas visuales (VQA) y razonamiento, con una ventana de contexto de 80.000 tokens y un modo de funcionamiento sin system prompt (zero-system-prompt). Se distribuye bajo licencia Apache 2.0 y soporta únicamente inglés y chino. Con 4,3 mil millones de parámetros y cuantizaciones que van de 2,1 GB a 8,8 GB, está pensado para ejecutarse en hardware de consumo.

Su relevancia actual radica en la combinación de tres factores poco frecuentes en modelos de este tamaño: entrada multimodal de imágenes, contexto muy largo (80k) para manejar varias vistas de una interfaz en una sola conversación, y un enfoque especializado en la conversión de capturas o wireframes a código HTML. Es, por tanto, una alternativa local y de peso ligero frente a modelos de visión-lenguaje genéricos de mayor tamaño para tareas de maquetación asistida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la información disponible; transformer multimodal (image-text-to-text) con proyector visual (mmproj) |
| Parámetros totales | 4.326.350.848 (4,33 mil millones) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 80.000 tokens (etiqueta 80k-context) |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyector multimodal en mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |
| Modelo base | wesjos/mario-html-4B |
| Cuantizado por | mradermacher |
| Tamaño del repositorio | 41,0 GB (incluye todas las cuantizaciones y los mmproj) |
| Fecha de creación en HuggingFace | 2026-10-13 |
| Descargas / likes | 319 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza multimodal: la pipeline declarada es image-text-to-text y el repositorio incluye ficheros mmproj, lo que confirma la presencia de un proyector visual que alinea representaciones de imagen con el espacio del modelo de lenguaje. Los tags indican explícitamente capacidades de razonamiento, VQA, generación de HTML y "visual-ui", lo que apunta a un entrenamiento orientado a tareas de comprensión y reproducción de interfaces gráficas. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otro tipo de ajuste por preferencias.

Tampoco se documentan innovaciones técnicas concretas en la model card (más allá de la etiqueta zero-system-prompt, que sugiere un ajuste que no requiere prompt de sistema para funcionar de forma óptima, y la ventana de 80.000 tokens). El trabajo de mradermacher se limita a la cuantización estática del modelo base a GGUF, con conversión de tipo HF y cuantización de tensores de salida, e indica que no ha generado cuantizaciones ponderadas con imatrix, por lo que solo están disponibles las estáticas.

## Capacidades

- Generación de código HTML y estructuras de diseño web a partir de descripciones textuales o de entradas visuales.
- Comprensión de interfaces de usuario (visual-ui) y respuesta a preguntas visuales sobre capturas de pantalla.
- Conversión de imagen a código (image-text-to-text): captura o wireframe como entrada, marcado HTML como salida.
- Razonamiento multi-paso aplicado a tareas de maquetación y estructuración de documentos.
- Procesamiento de contexto largo: hasta 80.000 tokens, suficiente para varias vistas de una aplicación o documentos extensos en una sola conversación.
- Funcionamiento sin system prompt (zero-system-prompt), lo que simplifica la integración en plantillas de chat que no admiten instrucciones de sistema.
- Soporte multilingüe limitado a inglés y chino.
- Compatibilidad declarada con vLLM (para el modelo base en safetensors) y con el ecosistema GGUF.
- No se documenta soporte explícito de tool calling, function calling ni de modo de pensamiento (thinking mode) en la información disponible.

## Casos de uso

- Generación de maquetas HTML desde capturas: el modelo recibe la imagen de una interfaz y devuelve el marcado HTML correspondiente, útil para prototipar rápidamente a partir de un diseño existente sin reescribir la estructura a mano.
- Refactorización de interfaces heredadas: dada una captura de una pantalla antigua, generar HTML semántico y limpio que sirva como punto de partida para su modernización.
- Documentación técnica de producto: convertir capturas de pantalla de una aplicación en fragmentos HTML documentados, aprovechando los 80.000 tokens de contexto para cubrir un flujo completo de pantallas en una misma sesión.
- Pruebas de regresión visual asistidas: usar el modelo como componente de razonamiento que describe diferencias entre dos capturas de una misma vista y sugiere el HTML que reproduce el estado esperado.
- Asistencia a la accesibilidad: generar descripciones textuales y atributos alternativos para elementos de una interfaz a partir de su representación visual, con el objetivo de alimentar revisiones de accesibilidad.
- Automatización de scraping y selectores: a partir de una captura de una página, obtener una estructura HTML aproximada que ayude a definir selectores o scripts de extracción.
- Entornos con requisitos de privacidad: al ejecutarse en local con cuantizaciones de 2,1 a 4,7 GB, permite procesar capturas de interfaces internas sin enviarlas a servicios en la nube.
- Prototipado en portátil: con Q4_K_M (2,9 GB) más el proyector mmproj-Q8_0 (0,5 GB), el modelo cabe en GPUs de consumo y permite flujos de trabajo offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación específica de generación de HTML o de tareas visión-lenguaje, y la búsqueda web realizada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- Tamaño de pesos por cuantización (datos del repositorio): Q2_K 2,1 GB; Q3_K_S 2,2 GB; Q3_K_M 2,4 GB; Q3_K_L 2,6 GB; IQ4_XS 2,7 GB; Q4_K_S 2,7 GB; Q4_K_M 2,9 GB; Q5_K_S 3,2 GB; Q5_K_M 3,3 GB; Q6_K 3,7 GB; Q8_0 4,7 GB; f16 8,8 GB.
- Proyector multimodal adicional: mmproj-Q8_0 0,5 GB o mmproj-f16 0,8 GB, imprescindible para tareas con entrada de imagen.
- VRAM estimada para inferencia: a partir de los pesos anteriores más la caché KV. Con contexto de 80.000 tokens la caché puede añadir varios gigabytes adicionales; la información disponible no especifica la configuración de atención, por lo que el valor exacto no está disponible.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 24 GB usando cuantizaciones de Q4_K_M a Q8_0; con Q2_K o Q3_K incluso en GPUs de 4-6 GB si se reduce el contexto.
- Memoria unificada: viable en equipos Apple Silicon (M1/M2/M3/M4 con 16 GB o más) mediante llama.cpp.
- GPU de centro de datos: A100, H100 o L40S para despliegues con concurrencia alta; el tag vllm apunta al modelo base en safetensors, ya que el soporte de GGUF en vLLM es limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python y servidores compatibles con la API de OpenAI mediante llama.cpp; vLLM para el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Especialización |
|---|---|---|---|---|---|
| mario-html-4B (este modelo, GGUF) | 4,33 mil millones | 80.000 tokens | Imagen + texto | Apache 2.0 | Generación de HTML y UI visual |
| Qwen2.5-VL-3B-Instruct | 3,75 mil millones | 32.000 tokens (ampliable) | Imagen + texto | Apache 2.0 | Visión-lenguaje general |
| SmolVLM2-2.2B-Instruct | 2,2 mil millones | No disponible | Imagen + texto + vídeo | Apache 2.0 | Visión-lenguaje ligero |
| Gemma 3 4B IT | 4 mil millones | 128.000 tokens | Imagen + texto | Licencia Gemma (uso comercial con condiciones) | Visión-lenguaje general |

Las especificaciones de los modelos alternativos proceden de información pública general y no de los resultados de búsqueda incluidos en esta ficha, por lo que conviene verificarlas antes de tomar una decisión. No se dispone de comparativas de rendimiento publicadas entre mario-html-4B y estos modelos en tareas de generación de HTML.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino. No hay soporte declarado de español, por lo que la generación de HTML a partir de instrucciones en castellano puede degradarse.
- Validación escasa: 319 descargas y 0 likes en el momento de redactar esta ficha, sin resultados de benchmarks publicados; el comportamiento real del modelo no está contrastado por la comunidad.
- Riesgo de alucinación: en generación de HTML es probable que aparezcan etiquetas, atributos o clases CSS inexistentes, así como estructuras que no se corresponden fielmente con la imagen de entrada. Se recomienda validación automática del marcado generado.
- Dependencia de la imagen: sin el fichero mmproj correspondiente, las capacidades multimodales no están disponibles; hay que descargar el proyector además de los pesos.
- Contexto largo: los 80.000 tokens son una etiqueta del repositorio; no se documenta cómo se comporta la calidad en la parte alta de la ventana ni el coste de memoria asociado.
- Zero-system-prompt: el modelo está ajustado para funcionar sin prompt de sistema, por lo que añadir uno puede alterar el comportamiento esperado.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se debe verificar la procedencia de los datos de entrenamiento del modelo base wesjos/mario-html-4B, cuya model card no está incluida en la información disponible.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el propio autor recomienda las variantes intermedias.
- No se documentan sesgos específicos, pero al entrenarse principalmente en inglés y chino es probable que herede sesgos culturales y lingüísticos de esos corpus.
- No hay evidencia de soporte de tool calling ni de integración con agentes; asumirlo en producción sin verificación previa es arriesgado.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/mario-html-4B-GGUF
- Modelo base: https://huggingface.co/wesjos/mario-html-4B
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#mario-html-4B-GGUF
- Repositorio de peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
