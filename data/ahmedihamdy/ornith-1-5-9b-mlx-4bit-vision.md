# ahmedihamdy/Ornith-1.5-9B-MLX-4bit-vision

## Resumen

Ornith-1.5-9B-MLX-4bit-vision es una compilación comunitaria del modelo multimodal Ornith-1.5-9B de ornith-ai, publicada por el usuario ahmedihamdy. Se trata de una cuantización en 4 bits para MLX (el framework de Apple para inferencia en silicio de Apple) que reincorpora la torre de visión original del modelo base, ausente en la versión MLX-4bit estándar. El resultado es un modelo image-text-to-text de 8.953.803.264 parámetros totales que ocupa 5,95 GB en disco y está pensado para ejecutarse localmente en Macs con Apple Silicon mediante la aplicación Astronomical o la librería mlx-vlm.

El modelo resuelve un problema concreto: la cuantización oficial en 4 bits para MLX de Ornith-1.5-9B había perdido la capacidad de procesar imágenes. Esta build reensambla la torre de visión original (27 bloques, 456M parámetros, en bf16 completo) junto con los pesos de texto cuantizados sin recuantizar, verificando previamente que ambos componentes pertenecen al mismo entrenamiento mediante la comprobación de 24 de 24 tensores de texto muestreados y la coincidencia de anchura de la torre y tokens de imagen.

La relevancia actual es doble: por un lado, demuestra un flujo de trabajo reproducible para restaurar capacidades multimodales en cuantizaciones que las han perdido; por otro, ofrece inferencia multimodal local en hardware de consumo Apple sin dependencia de la nube. La arquitectura subyacente es qwen3_5 (según los tags), con licencia MIT y soporte exclusivo del idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal con torre de visión) |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); torre de visión en bf16 completo |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con `model.safetensors` para texto y `model-vision.safetensors` para visión |

## Arquitectura y entrenamiento

El modelo es una build derivada, no un entrenamiento original. La arquitectura de texto corresponde a qwen3_5 según los tags del repositorio, con pesos cuantizados en 4 bits para MLX tal como se publicaron en ornith-ai/Ornith-1.5-9B-MLX-4bit (commit a48173b246ac705be75c05bedf1a0666db522d53). Sobre esa base se ha añadido la torre de visión original del modelo ornith-ai/Ornith-1.5-9B (commit 489cb97981b8654bcfcf30ce1f94ed1b62e07b53), compuesta por 27 bloques y 456M parámetros en precisión bf16 completa.

La innovación técnica de esta build no está en el entrenamiento sino en el proceso de reensamblado y verificación: se comprobó que 24 de 24 tensores de texto muestreados coinciden con el modelo base, que la anchura de la torre y los tokens de imagen son compatibles, y se documenta el SHA-256 de cada archivo de pesos y configuración en `astronomical-build.json`. La torre de visión se guarda en un archivo separado (`model-vision.safetensors`) para que el archivo de texto permanezca idéntico al original y pueda verificarse por hash. No se dispone de información sobre el dataset de entrenamiento, número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes y respuesta a preguntas sobre ellas (pipeline image-text-to-text).
- Procesamiento conjunto de imagen y texto como entrada, con la torre de visión a precisión completa bf16.
- Conversación multi-turno (tag "conversational").
- Ejecución local en Apple Silicon mediante MLX y la aplicación Astronomical.
- Compatibilidad con la librería mlx-vlm para integración programática.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras capacidades especiales en la información disponible.

## Casos de uso

- Descripción y análisis de imágenes en local: el modelo permite enviar una imagen y obtener una descripción textual mediante `astronomical respond "What is in this image?" --image image.png`, sin enviar datos a la nube, lo que resulta adecuado para material sensible.
- Asistencia visual en el escritorio para usuarios de Mac: al integrarse en Astronomical con un límite de memoria configurable, sirve para consultas rápidas sobre capturas de pantalla o fotografías sin cuenta en la nube.
- Prototipado de aplicaciones multimodales en Apple Silicon: mediante la API de mlx-vlm (`load`, `apply_chat_template`, `generate`) se puede incorporar a scripts Python de investigación y demos.
- Procesamiento por lotes de imágenes en pipelines locales: la inferencia offline y la licencia MIT permiten automatizar el etiquetado o la extracción de información de imágenes en flujos internos.
- Educación e investigación en multimodalidad: al ser una build reproducible y verificable por hash, sirve para estudiar cómo se reensamblan torres de visión con pesos de texto cuantizados.
- Evaluación comparativa de cuantizaciones: permite medir la degradación de capacidades visuales entre la versión 4-bit sin visión y esta build con torre bf16, útil para decidir compromisos de memoria y calidad.
- Uso en entornos sin conectividad: al ejecutarse íntegramente en el Mac, es apto para escenarios de campo o con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repo ocupa 6,0 GB y el modelo se describe como de 5,95 GB; se recomienda reservar al menos 8 GB de memoria unificada para el modelo más overhead del runtime.
- Hardware objetivo: Apple Silicon (macOS 14 o posterior), según los requisitos de Astronomical.
- GPU recomendadas: no aplica GPU dedicada; el modelo está diseñado para memoria unificada de chips Apple (M-series). No se documenta compatibilidad con A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? No está pensado para GPUs NVIDIA/AMD de consumo; su formato MLX lo limita a Apple Silicon. En Macs con 16 GB o más de memoria unificada debería caber con holgura.
- Opciones de despliegue: Astronomical (app y CLI), mlx-vlm (Python). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| Ornith-1.5-9B-MLX-4bit-vision (esta build) | ~8,95B | no disponible | Sí (torre 456M bf16) | MIT | MLX, Apple Silicon |
| ornith-ai/Ornith-1.5-9B-MLX-4bit | ~8,95B | no disponible | No | MIT | MLX, Apple Silicon |
| ornith-ai/Ornith-1.5-9B | ~8,95B | no disponible | Sí | MIT | safetensors (formato original) |

La comparación principal es con las dos builds de las que deriva: frente a la versión MLX-4bit oficial recupera la visión a costa de unos pocos cientos de MB adicionales; frente al modelo base original, ofrece cuantización 4-bit para reducir memoria manteniendo la torre de visión a precisión completa. No se dispone de datos de benchmarks para comparar rendimiento numérico con alternativas.

## Limitaciones y advertencias

- Es una build comunitaria, no una release oficial de ornith-ai; el soporte y la garantía de calidad recaen en el publicador.
- Solo soporta inglés según la model card; no se documenta multilingüismo.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Riesgo de alucinación inherente a los modelos generativos; en tareas visuales puede describir elementos ausentes o interpretar erróneamente imágenes ambiguas.
- La cuantización 4-bit de los pesos de texto puede degradar ligeramente la calidad frente al modelo base en bf16; la torre de visión, al estar en bf16, no sufre esa pérdida.
- Restricción de plataforma: el formato MLX limita su uso a Apple Silicon; no es desplegable en GPUs NVIDIA ni en servidores x86 convencionales.
- Aunque la licencia es MIT, conviene verificar los términos del modelo base ornith-ai/Ornith-1.5-9B, al que la model card remite para autores y condiciones.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debería asumirse su disponibilidad en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedihamdy/Ornith-1.5-9B-MLX-4bit-vision
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Build MLX-4bit de origen: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-4bit
- Astronomical (aplicación y CLI): https://aosama.github.io/astronomical/
