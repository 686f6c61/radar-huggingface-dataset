# simaai/Qwen2.5-VL-3B-Instruct-GPTQ-a16w4

## Resumen

El modelo **simaai/Qwen2.5-VL-3B-Instruct-GPTQ-a16w4** es una versión optimizada y compilada del modelo multimodal **Qwen2.5-VL-3B-Instruct**, desarrollada por **SiMa.ai** para su plataforma de aceleración embebida **Modalix**. Está diseñado para ejecutar inferencia de visión y lenguaje en dispositivos edge con recursos limitados, ofreciendo una latencia muy baja gracias a una cuantización **A16W4** (activaciones de 16 bits y pesos de 4 bits) y a una compilación específica para el acelerador de SiMa.ai.

El modelo base, creado por Alibaba Qwen, es un transformer multimodal de **3.000 millones de parámetros** con una ventana de contexto de **8.192 tokens**. Esta variante añade una resolución de entrada fija de **448x448** píxeles y un formato de pesos compilado para el runtime **LLiMa** de SiMa.ai, lo que la hace especialmente relevante para aplicaciones de visión artificial en tiempo real en entornos industriales, robóticos o de videovigilancia, donde la eficiencia energética y la baja latencia son críticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (Transformer multimodal, visión + lenguaje) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | A16W4 (activaciones de 16 bits, pesos de 4 bits), pre-cuantizado con GPTQ |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (modelo compilado para SiMa.ai Modalix/LLiMa; no usa safetensors ni GGUF estándar) |

## Arquitectura y entrenamiento

El modelo se basa en **Qwen2.5-VL-3B-Instruct**, un transformer multimodal que combina un codificador de visión con un modelo de lenguaje para tareas de entrada de imagen y texto (image-text-to-text). El checkpoint original ha sido pre-cuantizado con **GPTQ** a un formato A16W4 y posteriormente compilado para el acelerador **SiMa.ai Modalix**, con la resolución de entrada fijada en **448x448** durante la compilación para maximizar el rendimiento.

No se proporcionan detalles adicionales sobre el proceso de entrenamiento (datos, tokens, RLHF o DPO) en la información disponible. Se trata de un checkpoint instruct ya afinado por Alibaba, adaptado para el despliegue embebido por SiMa.ai.

## Capacidades

- Procesamiento multimodal: acepta imágenes y texto como entrada y genera texto como salida (pipeline `image-text-to-text`).
- Generación de texto: puede responder preguntas, mantener conversaciones y producir contenido textual a partir de instrucciones.
- Razonamiento visual: interpreta el contenido de imágenes y puede describirlas o responder consultas sobre ellas.
- Optimización para entornos embebidos: la cuantización A16W4 y la compilación específica permiten una inferencia de baja latencia en el hardware SiMa.ai Modalix.
- Contexto largo de 8.192 tokens: facilita el manejo de instrucciones extensas o conversaciones multi-turno.
- Compatibilidad con APIs OpenAI y Ollama cuando se sirve mediante el GenAI server de SiMa.ai.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- **Asistente multimodal en dispositivos embebidos**: El modelo puede analizar una imagen de 448x448 y responder a una pregunta de 20 tokens con un TTFT medio de 0,52 segundos, lo que permite aplicaciones de asistencia en tiempo real en robots o kioscos interactivos.
- **Inspección visual automatizada en líneas de producción**: La baja latencia (28,27 tokens/s de media tras el primer token) permite analizar imágenes de productos de forma continua en el edge, detectando defectos o anomalías sin depender de la nube.
- **Reconocimiento de texto en imágenes (OCR)**: Puede extraer texto de fotografías o documentos escaneados, útil para digitalizar documentos en entornos sin conectividad.
- **Videovigilancia inteligente**: Al ser un modelo multimodal, puede procesar frames de vídeo en el dispositivo Modalix, generando descripciones de escenas o detectando eventos relevantes.
- **Asistencia en mantenimiento industrial**: Un operario puede fotografiar un equipo y pedir instrucciones al modelo, que genera texto con pasos de mantenimiento o diagnósticos a partir de la imagen.
- **Interfaces de usuario accesibles**: Permite crear aplicaciones que describan imágenes para personas con discapacidad visual, ejecutándose localmente en un dispositivo edge con recursos limitados.
- **Despliegue en entornos con restricciones de energía o espacio**: La cuantización A16W4 y la compilación para SiMa.ai hacen que el modelo sea adecuado para sistemas embebidos de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona métricas de rendimiento de inferencia medidas en un dispositivo SiMa.ai Modalix, con batch 1, cinco muestras por longitud de entrada y hasta 128 tokens generados. Estos datos se muestran a continuación.

**Inferencia multimodal (imagen 448x448 y 20 tokens de texto):**

| Entrada de imagen | Tokens de texto | TTFT medio (segundos) | Tasa de generación media (tokens/s) |
|---:|---:|---:|---:|
| 448x448 | 20 | 0,52 | 28,27 |

**Generación solo texto (sin componente de visión):**

| Tokens de entrada | TTFT medio (segundos) | Tasa de generación media (tokens/s) |
|---:|---:|---:|
| 128 | 0,09 | 28,40 |
| 256 | 0,19 | 28,24 |
| 512 | 0,37 | 27,77 |
| 1024 | 0,77 | 27,02 |
| 2048 | 1,65 | 24,08 |
| 3072 | 2,98 | 22,72 |
| 4096 | 4,62 | 21,56 |
| 5120 | 6,91 | 20,36 |
| 6144 | 9,61 | 19,33 |
| 7168 | 13,23 | 18,19 |

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo está compilado para el acelerador SiMa.ai Modalix, no para GPU convencionales.
- GPU recomendadas: no disponible; no se ejecuta en GPU, requiere un dispositivo SiMa.ai Modalix.
- ¿Cabe en GPU de consumo? No; el formato de pesos compilado no es compatible con GPUs estándar.
- Opciones de despliegue: SiMa.ai LLiMa runtime (`llima`), GenAI server de SiMa.ai (APIs compatibles con OpenAI y Ollama) y runtime Neat.
- Latencia y throughput: ver tabla de rendimiento. Por ejemplo, para una imagen 448x448 y 20 tokens de texto, TTFT medio de 0,52 s y 28,27 tokens/s.
- Requisitos de software: SiMa.ai CLI, Neat Library (que incluye LLiMa) y Hugging Face CLI opcional para descargar el modelo.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos comparativos de rendimiento o calidad con otros modelos de la misma categoría en la información disponible. El modelo base sin cuantizar, **Qwen/Qwen2.5-VL-3B-Instruct**, está disponible en HuggingFace, pero no se ofrecen métricas comparativas entre ambos.

## Limitaciones y advertencias

- **Cuantización A16W4**: puede introducir pequeñas desviaciones en la salida respecto al modelo en precisión completa.
- **Resolución de entrada fija**: el modelo solo admite imágenes de 448x448 píxeles, ya que la resolución se fija en tiempo de compilación.
- **Dependencia de hardware específico**: el modelo no es portable; solo puede ejecutarse en dispositivos SiMa.ai Modalix con el runtime LLiMa.
- **Riesgo de alucinación**: no se han publicado evaluaciones de alucinación en la información disponible; se recomienda validar las salidas en aplicaciones críticas.
- **Sesgos**: no se han documentado sesgos conocidos, pero al ser un modelo derivado de Qwen2.5-VL podría heredar sesgos del modelo base; no hay datos al respecto.
- **Limitaciones de idioma**: los idiomas soportados no se han especificado, por lo que el rendimiento en idiomas distintos del inglés o chino no está garantizado.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero el modelo está vinculado al ecosistema de SiMa.ai; el hardware necesario puede requerir acuerdos adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simaai/Qwen2.5-VL-3B-Instruct-GPTQ-a16w4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Documentación de SiMa.ai GenAI con LLiMa: https://developer.sima.ai/software/genai-llima/
- Tutorial de servir modelos GenAI: https://developer.sima.ai/software/tutorials/serve-genai-models
- Tutorial de ejecutar un VLM: https://developer.sima.ai/software/tutorials/run-a-vlm
- Guía de inicio de SiMa.ai Neat: https://developer.sima.ai/software/getting-started/
- Aplicación de demostración multimodal: https://developer.sima.ai/examples/app/genai%2Fmultimodal-assistant
