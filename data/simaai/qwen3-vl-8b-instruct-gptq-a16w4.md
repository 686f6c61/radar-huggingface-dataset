# simaai/Qwen3-VL-8B-Instruct-GPTQ-a16w4

## Resumen

El modelo `simaai/Qwen3-VL-8B-Instruct-GPTQ-a16w4` es una versión cuantizada y compilada del modelo multimodal Qwen3-VL-8B-Instruct, optimizada específicamente para la plataforma SiMa.ai Modalix. Ha sido desarrollado por simaai y distribuido bajo licencia MIT. Su propósito es permitir la ejecución de inferencia de visión-lenguaje (VLM) en dispositivos embebidos de SiMa.ai, aprovechando una cuantización A16W4 (activaciones de 16 bits y pesos de 4 bits) aplicada con GPTQ antes de la compilación final.

La arquitectura base es Qwen3-VL, un modelo transformer multimodal de 8 mil millones de parámetros que procesa imágenes y texto. La versión compilada presenta una longitud de contexto máxima de 4096 tokens y una resolución de entrada fija de 448x448, elegida para maximizar el rendimiento y la eficiencia en el acelerador de SiMa.ai. El repositorio ocupa 44.6 GB e incluye los activos del modelo precompilados para el runtime LLiMa.

La relevancia de este modelo radica en su adaptación a hardware de borde con restricciones de energía y capacidad. Permite desplegar tareas de análisis visual y generación de texto directamente en el dispositivo, sin depender de infraestructura cloud, lo que resulta clave para aplicaciones industriales, de seguridad o de asistencia en campo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal) |
| Parametros totales | 8B (según la designación del modelo; cifra exacta no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | A16W4 (activaciones 16 bits, pesos 4 bits); pre-cuantizado con GPTQ |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible; el modelo se distribuye como activos compilados para LLiMa |
| Resolución de entrada | 448x448 (fija, determinada en tiempo de compilación) |
| Plataforma objetivo | SiMa.ai Modalix (con runtime Neat/LLiMa) |
| Tamaño del repositorio | 44.6 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-VL, que combina un codificador visual con un modelo de lenguaje transformer para tareas de visión-lenguaje. En esta versión, el checkpoint original de Qwen3-VL-8B-Instruct se ha pre-cuantizado con GPTQ a un esquema A16W4, reduciendo los pesos a 4 bits y manteniendo las activaciones en 16 bits. Posteriormente, el modelo se ha compilado para el acelerador MLA de SiMa.ai Modalix, con una resolución de imagen fijada en 448x448 para lograr la máxima eficiencia en ese hardware.

No se han proporcionado detalles sobre los datos de entrenamiento, el número de tokens de pre-entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO. La información disponible se centra en el proceso de cuantización y compilación, no en el entrenamiento original del modelo base.

## Capacidades

- Procesamiento multimodal: acepta imágenes de 448x448 y texto, y genera respuestas de texto (pipeline `image-text-to-text`).
- Inferencia de visión-lenguaje en dispositivos embebidos, gracias a la cuantización A16W4 y a la compilación específica para SiMa.ai Modalix.
- Generación de texto sin entrada de imagen: el modelo puede funcionar como modelo de lenguaje puro, con métricas de rendimiento medidas en el hardware objetivo.
- Integración con APIs compatibles con OpenAI y Ollama mediante el servidor GenAI de SiMa.ai, lo que permite enviar peticiones al modelo desde aplicaciones existentes.
- Gestión del modelo a través de la CLI LLiMa, que permite descargar, ejecutar y validar el modelo directamente en el dispositivo.
- No se ha documentado soporte de tool calling, razonamiento multi-paso o capacidades de agente en la información proporcionada.

## Casos de uso

- Inspección visual industrial: el modelo puede analizar imágenes de productos capturadas por cámaras en una línea de producción, detectando defectos o anomalías. Su latencia de primer token de 0.64 segundos en Modalix permite un análisis casi en tiempo real.
- Asistente de campo para técnicos: un técnico puede fotografiar un equipo o componente y hacer preguntas sobre su estado o funcionamiento. El modelo responde directamente en el dispositivo, sin necesidad de conexión a internet.
- Control de acceso y seguridad: procesamiento de imágenes de cámaras de vigilancia para identificar objetos, personas o situaciones de riesgo, manteniendo los datos en el propio dispositivo por privacidad.
- Automatización de documentación: extracción de información de facturas, albaranes o formularios escaneados. La resolución fija de 448x448 es suficiente para muchos documentos y la cuantización reduce el coste energético.
- Robótica y navegación autónoma: interpretación de escenas visuales para que un robot o vehículo guiado pueda tomar decisiones basadas en lo que ve, gracias a la generación de texto en 12.9 tokens/s.
- Asistente multimodal en el punto de venta: un dispositivo embebido en una tienda puede analizar imágenes de productos o recibos y responder preguntas de clientes o empleados, sin depender de servicios externos.
- Sistemas de asistencia a conductores (ADAS): análisis de imágenes de cámaras del vehículo para detectar señales, obstáculos o condiciones de la carretera, con una latencia compatible con entornos embebidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

Sí se incluyen mediciones de rendimiento de inferencia realizadas por el autor en SiMa.ai Modalix. La siguiente tabla corresponde a inferencia multimodal con una imagen de 448x448 y una pregunta de 20 tokens, sin redimensionamiento de imagen. TTFT incluye decodificación de imagen, preprocesamiento, codificación visual, proyección, prefill del modelo de lenguaje y el primer token generado. La tasa de generación se mide después del primer token.

| Entrada de imagen | Tokens de texto | TTFT medio (segundos) | Tasa de generación media (tokens/s) |
|---:|---:|---:|---:|
| 448x448 | 20 | 0.64 | 12.90 |

La siguiente tabla muestra el rendimiento en generación de texto sin imagen, medida con batch size 1, cinco muestras por longitud y hasta 128 tokens generados. TTFT incluye prefill del modelo de lenguaje y el primer token generado.

| Tokens de entrada | TTFT medio (segundos) | Tasa de generación media (tokens/s) |
|---:|---:|---:|
| 128 | 0.23 | 13.11 |
| 256 | 0.46 | 13.04 |
| 512 | 0.93 | 12.80 |
| 1024 | 1.91 | 12.40 |
| 2048 | 4.16 | 10.68 |
| 3072 | 7.43 | 10.34 |

## Requisitos de hardware

- Hardware objetivo: SiMa.ai Modalix, un dispositivo edge con acelerador MLA. No se ha indicado compatibilidad con GPUs convencionales.
- VRAM: no disponible. El modelo está compilado para el acelerador de SiMa.ai y no se ejecuta en GPUs de uso general.
- Almacenamiento: el repositorio ocupa 44.6 GB. Se recomienda instalarlo en `/media/nvme/llima/models/` o en el directorio configurado por `LLIMA_MODELS_PATH`.
- Despliegue: mediante la CLI LLiMa (`llima pull`, `llima run`), el servidor GenAI de SiMa.ai (compatible con OpenAI y Ollama) o la aplicación demo GenAI Multimodal Assistant.
- Latencia y throughput: en Modalix, la inferencia multimodal con imagen 448x448 y 20 tokens de texto presenta un TTFT medio de 0.64 segundos y una tasa de generación de 12.90 tokens/s. En modo texto, la tasa de generación oscila entre 10.34 y 13.11 tokens/s según la longitud de entrada, con TTFT desde 0.23 segundos hasta 7.43 segundos para 3072 tokens.
- Se requiere el runtime Neat de SiMa.ai para que la librería LLiMa esté disponible en el dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Plataforma | Licencia |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct (base) | 8B | 4096 (según la versión compilada) | No disponible | GPU / general | MIT |
| simaai/Qwen3-VL-8B-Instruct-GPTQ-a16w4 | 8B | 4096 | A16W4 (GPTQ) | SiMa.ai Modalix | MIT |

No se dispone de datos comparativos de rendimiento o benchmarks entre ambos modelos en la información proporcionada. La versión de simaai es una adaptación específica para hardware embebido, con una cuantización agresiva y una resolución de entrada fija, mientras que el modelo base es la referencia sin estas optimizaciones.

## Limitaciones y advertencias

- La cuantización A16W4 puede introducir desviaciones menores en la precisión respecto al modelo original en precisión completa.
- La resolución de entrada está fijada en 448x448 en tiempo de compilación; no es posible cambiar este valor sin recompilar el modelo.
- La longitud de contexto está limitada a 4096 tokens, lo que restringe conversaciones o análisis muy extensos.
- El modelo está diseñado exclusivamente para SiMa.ai Modalix y el runtime LLiMa; no es compatible con GPUs estándar ni con entornos de despliegue convencionales.
- Los idiomas soportados no se especifican en la información disponible.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos; la licencia MIT permite el uso comercial, pero la responsabilidad del resultado recae en el usuario.
- El modelo está optimizado para una tarea concreta (VLM con imagen fija) y puede no generalizar bien a otras resoluciones, tamaños de imagen o dominios distintos.

## Enlaces

- HuggingFace: https://huggingface.co/simaai/Qwen3-VL-8B-Instruct-GPTQ-a16w4
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Guía de inicio de SiMa.ai Neat: https://developer.sima.ai/software/getting-started/
- GenAI con LLiMa: https://developer.sima.ai/software/genai-llima/
- Servir modelos GenAI: https://developer.sima.ai/software/tutorials/serve-genai-models
- Ejecutar un VLM: https://developer.sima.ai/software/tutorials/run-a-vlm
- GenAI Multimodal Assistant: https://developer.sima.ai/examples/app/genai%2Fmultimodal-assistant
