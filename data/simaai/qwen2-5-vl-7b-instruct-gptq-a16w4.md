# simaai/Qwen2.5-VL-7B-Instruct-GPTQ-a16w4

## Resumen

El modelo **simaai/Qwen2.5-VL-7B-Instruct-GPTQ-a16w4** es una versión optimizada del modelo multimodal de visión-lenguaje **Qwen2.5-VL-7B-Instruct**, desarrollada por **SiMa.ai** para su plataforma de aceleración **Modalix**. El objetivo es desplegar inferencia multimodal en dispositivos embebidos, aprovechando la cuantización **GPTQ A16W4** (activaciones de 16 bits, pesos de 4 bits) y la compilación específica para el acelerador de SiMa.ai. Al estar compilado para un hardware concreto, se fija la resolución de entrada de imagen en 448x448 píxeles y se limita la ventana de contexto a 4.096 tokens, lo que permite una latencia baja y un rendimiento predecible en entornos de borde.

El modelo resuelve tareas de **image-text-to-text**, es decir, comprende imágenes y texto y genera respuestas en lenguaje natural. Respecto a la arquitectura, se trata de un transformer de visión-lenguaje con **7.000 millones de parámetros** (7B), construido sobre el checkpoint oficial **Qwen/Qwen2.5-VL-7B-Instruct**, que fue pre-cuantizado con GPTQ antes de la compilación para el runtime LLiMa de SiMa.ai. La relevancia actual radica en la posibilidad de ejecutar modelos multimodales de gran tamaño en hardware de bajo consumo, sin necesidad de GPU tradicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer de vision-lenguaje) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | GPTQ A16W4 (activaciones 16-bit, pesos 4-bit) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Activos compilados para SiMa.ai Modalix (formato LLiMa) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura **Qwen2.5-VL**, un sistema multimodal de visión-lenguaje que combina un codificador visual con un modelo de lenguaje basado en transformer. El checkpoint original, Qwen/Qwen2.5-VL-7B-Instruct, se pre-cuantizó con **GPTQ** (pesos a 4 bits, activaciones a 16 bits) y posteriormente se compiló para el acelerador **SiMa.ai Modalix**. Durante la compilación se fijó la resolución de entrada de imagen en **448x448 píxeles** y se limitó la ventana de contexto a **4.096 tokens**, con el fin de maximizar el rendimiento y la eficiencia en el hardware objetivo.

No se han proporcionado datos sobre el proceso de entrenamiento original, la composición del dataset, ni sobre técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas más allá de la cuantización y la compilación específica para Modalix.

## Capacidades

- Comprensión multimodal: el modelo acepta imágenes (a resolución fija 448x448) y texto como entrada, y genera respuestas en texto.
- Generación de texto: puede producir descripciones, respuestas a preguntas visuales y análisis de contenido a partir de la entrada multimodal.
- Despliegue en borde: está optimizado para ejecutarse en el acelerador SiMa.ai Modalix con baja latencia, tal como muestran las mediciones de TTFT y velocidad de generación.
- Soporte de herramientas: no se menciona en la información disponible.
- Capacidades de agente o razonamiento multi-paso: no se documentan.
- Idiomas: no se especifican los idiomas soportados en la información proporcionada.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponibles.

## Casos de uso

- **Inspección visual en líneas de producción**: el modelo puede analizar imágenes de piezas o productos en tiempo real, detectando defectos o anomalías. Su baja latencia (TTFT medio de 0,89 s con una imagen 448x448) permite integrarlo en sistemas de control de calidad industriales de forma local.
- **Cámaras inteligentes en entornos domésticos o comerciales**: un dispositivo con cámara puede enviar una imagen y una pregunta en lenguaje natural, como "¿hay alguien en la habitación?", y recibir una respuesta inmediata sin depender de la nube.
- **Asistencia para personas con discapacidad visual**: el modelo lee carteles, señales o textos de una escena capturada por una cámara portátil, siempre que se ejecute en un dispositivo con soporte Modalix. La latencia de generación de ~14,5 tokens/s es adecuada para respuestas cortas y directas.
- **Automatización logística**: lectura y comprensión de etiquetas, códigos o documentos de envío en almacenes, facilitando la clasificación de paquetes o la verificación de inventario mediante una interfaz de pregunta-respuesta visual.
- **Análisis preliminar de imágenes médicas**: el modelo puede generar descripciones de radiografías o ecografías para ayudar a un profesional sanitario a priorizar casos. Debe usarse siempre con supervisión humana, dado que no se han documentado métricas de precisión clínica.
- **Interfaces de usuario en robots móviles**: un robot puede usar la cámara para captar su entorno y responder a comandos como "¿dónde está el sofá?", aprovechando la ventana de contexto de 4.096 tokens para mantener un breve historial de la conversación.
- **Videovigilancia con alertas locales**: el modelo puede describir eventos captados por cámaras de seguridad (por ejemplo, "una persona se ha detenido en la puerta") y generar alertas automáticas en el propio dispositivo, reduciendo la dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente mediciones de rendimiento de inferencia en el hardware Modalix, que se reproducen a continuación.

### Inferencia multimodal (imagen 448x448 + 20 tokens de texto)

| Imagen | Tokens de texto | TTFT medio (s) | Velocidad media de generación (tokens/s) |
|---|---:|---:|---:|
| 448x448 | 20 | 0,89 | 14,56 |

### Generación de texto (sin procesamiento visual)

| Tokens de entrada | TTFT medio (s) | Velocidad media de generación (tokens/s) |
|---:|---:|---:|
| 128 | 0,22 | 14,67 |
| 256 | 0,43 | 14,62 |
| 512 | 0,87 | 14,47 |
| 1024 | 1,76 | 14,21 |
| 2048 | 3,73 | 13,15 |
| 3072 | 6,56 | 12,44 |

## Requisitos de hardware

- No se proporciona una estimación de VRAM para GPU genéricas, ya que el modelo está compilado específicamente para el acelerador **SiMa.ai Modalix**.
- Se requiere un dispositivo **Modalix**, el **SiMa.ai CLI** y el **SiMa.ai Neat Runtime** instalados en el dispositivo.
- No es desplegable en GPU de consumo (por ejemplo, RTX 4090) sin recompilar el modelo para esa plataforma, dado que el checkpoint entregado contiene activos compilados para Modalix.
- Opciones de despliegue documentadas:
  - Ejecución local con `llima run Qwen2.5-VL-7B-Instruct-GPTQ-a16w4`.
  - Servidor GenAI con APIs compatibles con OpenAI u Ollama, siguiendo el workflow "Serve GenAI Models".
  - Llamadas directas VLM mediante el tutorial "Run a VLM".
- Las mediciones de latencia y throughput disponibles son las indicadas en las tablas de rendimiento, obtenidas en Modalix con batch size 1.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa completa con otros modelos de la misma categoría. La única comparación directa posible es con el modelo base **Qwen/Qwen2.5-VL-7B-Instruct**, aunque no se han facilitado especificaciones técnicas de esa versión.

| Modelo | Parametros | Contexto | Cuantizacion | Plataforma | Licencia |
|---|---|---|---|---|---|
| simaai/Qwen2.5-VL-7B-Instruct-GPTQ-a16w4 | 7B | 4096 | A16W4 GPTQ | SiMa.ai Modalix | MIT |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Cuantización A16W4**: la conversión a pesos de 4 bits puede introducir desviaciones menores respecto al modelo de precisión completa, aunque el autor indica que se mantiene una alta precisión.
- **Resolución fija**: la imagen de entrada está limitada a **448x448 píxeles** en tiempo de compilación; no se admiten otras resoluciones sin recompilar el modelo para Modalix.
- **Contexto limitado**: la ventana de 4.096 tokens puede resultar insuficiente para conversaciones largas, documentos extensos o análisis de múltiples imágenes en una sola consulta.
- **Dependencia de hardware**: el modelo solo puede ejecutarse en la plataforma SiMa.ai Modalix. Esto condiciona el despliegue y el uso comercial, a pesar de que la licencia MIT permite el uso comercial libre en general.
- **Sin datos de sesgos ni alucinaciones**: no se han publicado evaluaciones de sesgos, robustez o tasas de alucinación. Es necesario realizar una evaluación específica para cada dominio de aplicación.
- **Rendimiento degradado con contextos largos**: las mediciones muestran que la velocidad de generación disminuye ligeramente al aumentar los tokens de entrada (de 14,67 a 12,44 tokens/s entre 128 y 3072 tokens).

## Enlaces

- [Modelo en Hugging Face: simaai/Qwen2.5-VL-7B-Instruct-GPTQ-a16w4](https://huggingface.co/simaai/Qwen2.5-VL-7B-Instruct-GPTQ-a16w4)
- [Modelo base: Qwen/Qwen2.5-VL-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct)
- [SiMa.ai: Neat getting started guide](https://developer.sima.ai/software/getting-started/)
- [SiMa.ai: GenAI con LLiMa](https://developer.sima.ai/software/genai-llima/)
- [SiMa.ai: Serve GenAI Models](https://developer.sima.ai/software/tutorials/serve-genai-models)
- [SiMa.ai: Run a VLM](https://developer.sima.ai/software/tutorials/run-a-vlm)
- [SiMa.ai: GenAI Multimodal Assistant](https://developer.sima.ai/examples/app/genai%2Fmultimodal-assistant)
