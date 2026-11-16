# OsaurusAI/gemma-4-12B-it-MXFP4

## Resumen

Gemma 4 12B-it MXFP4 es una cuantización del modelo multimodal `google/gemma-4-12B-it` de Google, publicada por OsaurusAI para su ejecución local en Apple Silicon mediante MLX. El paquete empaqueta los pesos del transformer denso de 12B parámetros en el formato OCP MXFP4 (grupo de 32) con el objetivo de reducir el espacio en disco y la memoria unificada necesaria, manteniendo el embedding de tokens atado y los embedders multimodales en fp16 para preservar la calidad de representación.

El modelo base es un transformer denso unificado de la familia Gemma 4 con capacidad de entrada texto-imagen (y metadatos de audio/vídeo según la model card), orientado a tareas conversacionales y de razonamiento multimodal. Esta variante concreta no introduce ningún cambio algorítmico: es una conversión de pesos para el runtime MLX de Apple, empaquetada como bundle listo para Osaurus y runtimes vMLX compatibles.

Su relevancia es práctica: permite desplegar un modelo de 12B con visión en portátiles y equipos de sobremesa con chip Apple (M-series) sin GPU dedicada, con un paquete de 7,94 GB y 7 shards de safetensors. La ficha se centra en lo que la información disponible permite afirmar; los detalles de entrenamiento y benchmarks del modelo base no se han publicado en los materiales consultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso unificado Gemma 4 (`gemma4_unified`), texto + imagen; metadatos multimodales de audio/vídeo |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | OCP MXFP4, group size 32; embedding de tokens atado y embedders multimodales en fp16 passthrough |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Gemma (Gemma 4 license) |
| Formato de pesos | MLX safetensors (7 shards), cuantización empaquetada uint32 en proyecciones |
| Tamano del paquete | 7,94 GB |
| Libreria / runtime | MLX (Osaurus, vMLX) |
| Pipeline | image-text-to-text |
| Plantilla de chat | Plantilla Gemma 4 tool-aware, sin cola de canal de pensamiento por defecto |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Gemma 4, en su variante "unified" de 12B parámetros, con soporte de entrada multimodal texto-imagen y metadatos que la model card describe como audio/vídeo-capaces. Esta conversión no modifica la arquitectura: aplica cuantización MXFP4 (bloques de 32 elementos) a las proyecciones lineales principales, dejando en fp16 el embedding de tokens atado (`embed_tokens.weight`) y los embedders multimodales. Según la model card, una versión previa empaquetaba erróneamente el embedding como un peso lineal cuantizado; la reconstrucción del 3 de junio de 2026 corrige ese artefacto.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal, etc.) en los materiales proporcionados. La model card únicamente describe el proceso de cuantización y verificación del bundle: `embed_tokens.weight` en fp16, ausencia de `scales`/`biases` en el embedding, y proyecciones de atención empaquetadas en uint32.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Comprensión de imágenes (pipeline `image-text-to-text`): descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Metadatos multimodales que la model card describe como audio/vídeo-capaces; no se detalla la interfaz exacta en este bundle.
- Plantilla de chat *tool-aware*: soporte de tool calling / function calling heredado del modelo base.
- Capacidad de razonamiento multi-paso y uso como agente, según la plantilla de chat de Gemma 4.
- Ejecución local en Apple Silicon mediante MLX, con carga directa desde `mlx_lm`.
- No se documenta modo "thinking" explícito; la plantilla no incluye cola de canal de pensamiento por defecto.

## Casos de uso

- Asistente conversacional local en Mac: el bundle se carga con `mlx_lm` u Osaurus y permite chat multi-turno sin conexión a Internet, aprovechando la memoria unificada de los chips M-series.
- Análisis de capturas y documentos escaneados: al aceptar entrada imagen-texto, se puede usar para extraer información de facturas, tickets o pantallazos dentro de un flujo de trabajo local.
- Automatización de escritorio con tool calling: la plantilla tool-aware permite conectar el modelo a funciones locales (sistema de ficheros, APIs internas) en un agente de sobremesa.
- Prototipado de aplicaciones multimodales en Apple Silicon: desarrolladores que necesitan validar una UX de visión + lenguaje antes de pasar a un despliegue en servidor con el modelo base sin cuantizar.
- Privacidad de datos en entornos regulados: al ejecutarse íntegramente en local, evita enviar imágenes o texto a servicios en la nube, útil para prototipos con datos sensibles.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de MXFP4 frente al modelo base fp16/bf16 en tareas de visión y texto.
- Docencia y experimentación: paquete de menos de 8 GB que cabe en un SSD de portátil y permite reproducir experimentos de multimodalidad sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el paquete pesa 7,94 GB; se recomienda al menos 16 GB de memoria unificada para cargar el modelo y mantener contexto, y 24-32 GB para ventanas de contexto amplias o uso simultáneo de otras aplicaciones.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con CUDA ni ROCm.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con 16 GB o más de memoria unificada; no está pensado para GPUs NVIDIA/AMD de consumo.
- Opciones de despliegue: Osaurus, runtimes vMLX y `mlx_lm` (Python). No aplica vLLM, llama.cpp, Ollama ni TGI, que no consumen pesos MLX.
- Latencia y throughput: no disponibles. Dependerán del chip concreto y del tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OsaurusAI/gemma-4-12B-it-MXFP4 | ~12B | No disponible | MLX safetensors (MXFP4) | Gemma | Hugging Face (25 descargas) |
| google/gemma-4-12B-it | ~12B | No disponible | Safetensors (fp16/bf16) | Gemma | Hugging Face (modelo base oficial) |
| Otras cuantizaciones GGUF del mismo base | ~12B | No disponible | GGUF | Gemma | No verificadas en la información disponible |

La comparación relevante es contra el modelo base sin cuantizar (mayor fidelidad, mayor tamaño) y frente a conversiones GGUF para llama.cpp/Ollama, que no se han podido verificar. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- Solo soporta inglés según los metadatos; no se garantiza calidad en castellano ni en otros idiomas.
- La cuantización MXFP4 introduce degradación respecto al modelo base; no se han publicado evaluaciones cuantitativas de esa pérdida.
- Riesgo de alucinación inherente al modelo base, especialmente en tareas de visión con imágenes de baja calidad o texto pequeño.
- Licencia Gemma: el uso comercial está sujeto a los términos de la Gemma 4 license; es necesario revisar las restricciones de uso aceptable antes de desplegar en producción.
- Exclusivo para Apple Silicon y runtime MLX; no es portable a CUDA, ROCm ni a servidores x86 convencionales.
- La model card advierte de un artefacto defectuoso anterior (embedding empaquetado incorrectamente); si se descargó antes del 3 de junio de 2026 a las 16:06 PDT, debe eliminarse y volver a descargarse.
- Sin resultados de benchmarks publicados: no se puede afirmar su rendimiento frente a alternativas.
- El repositorio tiene muy poca tracción (25 descargas, 0 likes) y no procede del equipo de Google; conviene validar la integridad de los pesos antes de usos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/gemma-4-12B-it-MXFP4
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Web de Osaurus: https://osaurus.ai
- Perfil del autor en Hugging Face: https://huggingface.co/OsaurusAI
- Repositorio JANG (herramienta de cuantización citada): https://github.com/jjang-ai/jangq
