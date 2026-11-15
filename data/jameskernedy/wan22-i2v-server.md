# jameskernedy/wan22-i2v-server

## Resumen

Wan 2.2 image-to-video endpoint es un repositorio de despliegue publicado por el usuario jameskernedy en Hugging Face, no un modelo entrenado desde cero. Su función es empaquetar el modelo `Wan-AI/Wan2.2-TI2V-5B` dentro de un custom server compatible con Hugging Face Inference Endpoints, exponiendo una API HTTP (`/i2v`) que recibe una imagen y un prompt de movimiento y devuelve un vídeo MP4 codificado en base64.

El modelo subyacente, Wan 2.2 TI2V-5B, es un modelo de generación de vídeo a partir de imagen (image-to-video) de aproximadamente 5.000 millones de parámetros, cargado en precisión bf16. El repositorio se limita a la capa de servicio: define la imagen Docker (`pytorch/pytorch:2.6.0-cuda12.4-cudnn9-runtime`), el comando de arranque (`bash /repository/run.sh`), la ruta de salud (`/health`) y el puerto (8080), además de la configuración recomendada de cómputo en AWS (us-east-1, una NVIDIA A100 de 80 GB, escalado de 0 a 6 réplicas).

Su relevancia es operativa: facilita el despliegue reproducible de un modelo generativo de vídeo en infraestructura gestionada, con una interfaz JSON sencilla y valores por defecto razonables (81 fotogramas, 832×480, guidance 5.0, 30 pasos). No aporta pesos nuevos ni mejoras de arquitectura sobre el modelo base; cualquier evaluación de calidad debe remitirse a Wan-AI/Wan2.2-TI2V-5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Wan-AI/Wan2.2-TI2V-5B, generación imagen-a-vídeo) |
| Parametros totales | ~5B (según el nombre del modelo base TI2V-5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a difusión vídeo; entrada: imagen + prompt de texto) |
| Tipos de cuantizacion | bf16 (configuración documentada); no se indican otras |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (carga vía transformers; el repo no aloja pesos) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base. Por el nombre y la tarea, `Wan-AI/Wan2.2-TI2V-5B` corresponde a un modelo generativo de vídeo de la familia Wan 2.2, orientado a la conversión de una imagen estática en una secuencia de vídeo condicionada por un prompt de texto. El custom server carga los pesos en bf16 sobre una A100 de 80 GB, lo que sugiere un modelo de difusión de tamaño medio (~5B) que requiere aceleración GPU para inferencia interactiva.

No se proporciona información sobre el dataset de entrenamiento, el número de tokens o fotogramas vistos, ni sobre técnicas de alineación (RLHF, DPO) o innovaciones como decodificación especulativa. La capa aportada por este repositorio es exclusivamente de servicio: imagen Docker, script de arranque, ruta de salud y endpoint `/i2v` con parámetros configurables (seed, num_frames, width, height, guidance, steps).

## Capacidades

- Generación de vídeo a partir de una imagen de entrada y un prompt de movimiento (image-to-video).
- Control de la generación mediante prompt negativo (`negative_prompt`).
- Parametrización de la salida: número de fotogramas, resolución (ancho y alto), guía (guidance), pasos de muestreo y semilla.
- Salida en MP4 codificado en base64 junto con metadatos (`ms`, `n`, `frames`, `size`, `fps`).
- Valores por defecto: 81 fotogramas (5 s a 16 fps), 832×480, guidance 5.0, 30 pasos, seed 42.
- Endpoint de salud (`/health`) para orquestación y monitorización.
- Compatibilidad con Hugging Face Inference Endpoints (tipo custom server, puerto 8080).
- Soporte de idioma: inglés (`en`) en los prompts.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión comprensiva, audio ni modo thinking.

## Casos de uso

- Prototipado de animación imagen-a-vídeo: un equipo de producto envía una imagen de referencia y un prompt de movimiento al endpoint `/i2v` para obtener un clip de 5 s a 16 fps, útil para validar ideas antes de invertir en pipelines de producción.
- Generación de contenido para marketing: creación de clips cortos a partir de fotografías de producto (832×480 por defecto) con control de semilla para reproducibilidad y de `guidance`/`steps` para ajustar fidelidad frente a creatividad.
- Pruebas A/B de parámetros de generación: al exponer `num_frames`, `width`, `height`, `guidance` y `steps` en la API, permite automatizar barridos de configuración y comparar resultados sin reescribir el servidor.
- Integración en pipelines de previsualización: el escalado de 0 a 6 réplicas con scale-to-zero encaja en cargas intermitentes, como la generación bajo demanda de teasers a partir de imágenes subidas por usuarios.
- Investigación en generación de vídeo: uso del endpoint como servicio estandarizado para recolectar muestras del modelo base Wan 2.2 TI2V-5B y analizar sesgos o artefactos temporales.
- Demostraciones y entornos de evaluación: el par `/health` + `/i2v` con respuesta JSON en base64 simplifica la conexión con frontends web o notebooks sin necesidad de gestionar la carga del modelo manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la configuración documentada usa una NVIDIA A100 de 80 GB con pesos en bf16 para un modelo de ~5B parámetros.
- GPU recomendadas: NVIDIA A100 de 80 GB (configuración de referencia en AWS us-east-1).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; un modelo de ~5B en bf16 excede los 16 GB típicos de una RTX 4090 y no se documentan cuantizaciones alternativas.
- Opciones de despliegue: Hugging Face Inference Endpoints con custom server (imagen `pytorch/pytorch:2.6.0-cuda12.4-cudnn9-runtime`, comando `bash /repository/run.sh`, puerto 8080). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Escalado: mínimo 0, máximo 6 réplicas, con scale-to-zero.
- Latencia y throughput: no disponibles; la API devuelve el campo `ms` con el tiempo de generación por petición, pero no se publican cifras de referencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de image-to-video, por lo que no es posible establecer una comparativa rigurosa con alternativas.

## Limitaciones y advertencias

- El repositorio no aloja pesos propios: es una capa de servicio sobre `Wan-AI/Wan2.2-TI2V-5B`; las limitaciones del modelo base aplican en su totalidad.
- Solo se declara soporte de inglés (`en`) para los prompts.
- No se documentan sesgos conocidos, pero al ser un modelo generativo de vídeo existe riesgo de artefactos temporales, incoherencias de movimiento y contenido no fiel a la imagen de entrada.
- Riesgo de generación de contenido no deseado o sesgado según el prompt; no se describe ningún filtro de seguridad en el servidor.
- Licencia apache-2.0 declarada en el repositorio; conviene verificar la licencia del modelo base antes de uso comercial.
- Requiere GPU de alta gama (A100 80 GB en la configuración de referencia); no hay evidencia de que funcione en hardware de consumo.
- El endpoint expone una API sin autenticación documentada más allá de la que provea Hugging Face Inference Endpoints; revisar el control de acceso antes de exponerlo públicamente.
- Sin benchmarks ni métricas de calidad publicadas: no hay base para estimar fidelidad, coherencia temporal o latencia en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jameskernedy/wan22-i2v-server
- Modelo base referenciado: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Documentación de Hugging Face Inference Endpoints (custom server): https://huggingface.co/docs/inference-endpoints
