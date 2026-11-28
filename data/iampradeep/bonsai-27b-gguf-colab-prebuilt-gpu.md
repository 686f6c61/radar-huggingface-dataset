# IamPradeep/Bonsai-27B-GGUF-Colab-Prebuilt-GPU

## Resumen

Bonsai-27B es un modelo de lenguaje de aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos en safetensors) distribuido por el usuario IamPradeep en Hugging Face como un repositorio de cuantizaciones GGUF orientado a su ejecución rápida en Google Colab y entornos con GPU modesta. El repositorio no contiene el modelo original, sino un paquete precompilado que incluye binarios de `llama-cli`, un proyector multimodal y variantes cuantizadas del modelo, con el objetivo declarado de arrancar en menos de un minuto en una GPU T4 de Colab.

La propuesta diferencial es una cuantización propia de 1 bit denominada `Q1_0`, que reduce el modelo de 53,8 GB en F16 a unos 3,8 GB, manteniendo según el autor soporte de razonamiento de contexto largo y visión multimodal. El autor indica además una ventana de contexto por defecto de 128K tokens (131.072) y modos de inferencia "Think" e "Instant" en la interfaz de chat incluida.

La relevancia del repositorio es fundamentalmente práctica: demuestra una vía para ejecutar un modelo de escala 27B en hardware de consumo o en instancias gratuitas de Colab mediante cuantización extrema y binarios precompilados. No obstante, la información técnica sobre el modelo base (arquitectura, datos de entrenamiento, licencia, idiomas) es muy escasa en la model card, que se centra casi por completo en el procedimiento de despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base no documentado en la model card) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (128K, valor por defecto en la interfaz del autor) |
| Tipos de cuantizacion | Q1_0 (~3,8 GB), F16 (53,8 GB); proyector de visión en Q8_0 (~629 MB) y BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (pesos originales de referencia) |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base: no se especifica si es un transformer denso, un MoE, un modelo híbrido con atención lineal ni detalles sobre el mecanismo de atención. El dato disponible es el recuento de parámetros (26,9B) y la existencia de un proyector multimodal (`mmproj`) que habilita entrada de imágenes, lo que implica una arquitectura multimodal tipo vision-language con codificador visual y proyector hacia el espacio del modelo de lenguaje.

Tampoco se detallan los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) ni innovaciones técnicas del modelo original. La única innovación documentada es de despliegue: la cuantización `Q1_0` de 1 bit aplicada por el autor del repositorio, que comprime los pesos a ~3,8 GB. La model card menciona un modo de razonamiento ("thinking mode") con recomendaciones de muestreo específicas (temperatura 1.0, top-p 0.95, top-k 20, mínimo 8192 tokens de salida), lo que sugiere que el modelo base fue entrenado con capacidades de razonamiento extendido, pero no se aportan más detalles.

## Capacidades

- Generación de texto conversacional multi-turno, con system prompt configurable.
- Razonamiento extendido mediante modo "thinking" (`--reasoning on`), con consumo declarado de más de 3000 tokens de pensamiento en prompts complejos.
- Modo "Instant" (sin razonamiento) para respuestas directas de baja latencia.
- Visión multimodal: procesamiento de imágenes mediante proyector `mmproj` en Q8_0 o BF16, con carga de imágenes en la interfaz de Colab.
- Contexto largo: ventana de hasta 131.072 tokens configurable en la interfaz del autor.
- Renderizado de matemáticas con KaTeX en la interfaz de chat incluida (capacidad de la UI, no del modelo).
- Adjuntado de archivos de código en la interfaz de chat.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo thinking es compatible con ese uso.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Prototipado rápido en Google Colab: el paquete precompilado permite arrancar el modelo en una T4 en menos de un minuto, lo que lo hace adecuado para pruebas de concepto y demos sin aprovisionar infraestructura propia.
- Evaluación de modelos de 27B en hardware de consumo: con la cuantización Q1_0 (~3,8 GB) se puede explorar el comportamiento de un modelo de gran escala en portátiles con GPU modesta, comparando calidad frente a cuantizaciones mayores.
- Asistentes conversacionales con contexto largo: la ventana de 128K tokens permite mantener conversaciones o procesar documentos extensos en una sola sesión, útil para resumen y análisis de informes largos.
- Análisis de imágenes en flujos de trabajo ligeros: con el proyector Q8_0 se pueden describir capturas, extraer texto de imágenes o responder preguntas sobre diagramas desde Colab.
- Educación e investigación: el notebook interactivo con renderizado KaTeX y modo thinking facilita experimentar con razonamiento matemático paso a paso y estudiar cadenas de pensamiento.
- Generación asistida de código en entornos de prueba: la interfaz admite adjuntar archivos de código, lo que permite usarla para explicar, revisar o completar fragmentos en sesiones exploratorias.
- Demostraciones y workshops: al reducir el coste de puesta en marcha a menos de un minuto, es práctico para talleres donde varios asistentes ejecutan el modelo en instancias gratuitas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,8 GB de pesos en Q1_0, más overhead de contexto KV; con contexto de 8192 tokens y `-ngl 99` cabe holgadamente en una GPU de 16 GB. Para 128K tokens de contexto el consumo de KV crece de forma significativa y no se especifica en la model card.
- GPU recomendadas: el autor valida el funcionamiento en Google Colab T4 (16 GB). Para el modo F16 (53,8 GB) se requiere una GPU de 80 GB (A100/H100) o múltiples GPU.
- Cabe en GPU de consumo: sí, en Q1_0 cabe en tarjetas de 8-16 GB (RTX 3060, 4060, 4070, T4), siempre que el contexto se mantenga moderado.
- Opciones de despliegue: `llama-cli` con binarios precompilados incluidos en el repositorio, CUDA 12 (`nvidia-cuda-runtime-cu12`, `nvidia-cublas-cu12`); al ser GGUF es compatible con llama.cpp y, previsiblemente, con otros runners GGUF, aunque la model card solo documenta llama.cpp.
- Latencia y throughput: no se proporcionan cifras concretas; el autor afirma que la descarga y puesta en marcha completa se realiza en menos de un minuto en Colab, sin especificar tokens por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base (arquitectura, licencia, benchmarks) para establecer una comparativa rigurosa con alternativas de la misma categoría. La comparación se limita a aspectos de despliegue:

| Modelo | Parametros | Contexto | Cuantizacion minima documentada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-27B (este repo) | ~26,9B | 131.072 tokens (por defecto en la UI) | Q1_0 (~3,8 GB) | no disponible | Hugging Face (GGUF precompilado) |
| Alternativas de ~27B en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no identifica el modelo base ni su autor original, lo que impide verificar la procedencia de los pesos y sus condiciones de uso.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; en producción debe tratarse como riesgo legal hasta verificarlo con el autor.
- Idiomas soportados no documentados: no hay garantía de calidad en castellano ni en otros idiomas distintos del inglés.
- La cuantización Q1_0 de 1 bit implica una pérdida de calidad sustancial frente a F16; no se aportan métricas de degradación (perplejidad, benchmarks) que permitan cuantificarla.
- Riesgo de alucinación inherente a modelos de lenguaje de esta escala, agravado por la cuantización extrema; no se documentan evaluaciones de fidelidad.
- El modo thinking puede consumir más de 3000 tokens de razonamiento; el autor advierte de no usar decodificación greedy (`--temp 0`) en ese modo.
- La reproducibilidad depende de binarios precompilados de terceros incluidos en el repositorio (`llama_bin.tar.gz`), sin verificación de integridad documentada; conviene auditar antes de usar en entornos sensibles.
- El contexto de 128K es un valor por defecto de la interfaz, no una especificación verificada del modelo base; el rendimiento real en contextos muy largos no está documentado.
- Sesgos conocidos: no disponibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IamPradeep/Bonsai-27B-GGUF-Colab-Prebuilt-GPU
- Notebook interactivo de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/IamPradeep/Bonsai-27B-GGUF-Colab-Prebuilt-GPU/blob/main/Bonsai-27B-GGUF-Interactive-UI.ipynb
- Captura de configuración del servidor: https://huggingface.co/IamPradeep/Bonsai-27B-GGUF-Colab-Prebuilt-GPU/resolve/main/Bonsai-27B-Server-Setup.png
- Demostración de generación de respuestas: https://huggingface.co/IamPradeep/Bonsai-27B-GGUF-Colab-Prebuilt-GPU/resolve/main/Bonsai-27B-Response-Generation.gif
