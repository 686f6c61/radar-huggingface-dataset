# simaai/Qwen3-VL-2B-Instruct-GPTQ-a16w4

## Resumen

El modelo **Qwen3-VL-2B-Instruct-GPTQ-a16w4** es una versión optimizada y compilada del modelo multimodal Qwen3-VL-2B-Instruct, desarrollada por **SiMa.ai** para su plataforma de aceleración **Modalix**. Se trata de un modelo de visión-lenguaje (VLM) que procesa imágenes y texto para generar respuestas, con una arquitectura basada en transformer de 2.000 millones de parámetros y una longitud de contexto de 8.192 tokens. La principal innovación es su cuantización **A16W4** (activaciones de 16 bits y pesos de 4 bits), pre-cuantizada con GPTQ, que permite ejecutar el modelo en dispositivos embebidos con una latencia muy baja, lo que lo hace relevante para aplicaciones de inteligencia artificial en el borde (edge) donde el consumo energético y el rendimiento en tiempo real son críticos. Este modelo no se distribuye como checkpoint estándar para GPUs, sino como artefactos compilados para el hardware específico de SiMa.ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal de vision-lenguaje) |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | No aplicable (arquitectura densa, no MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | A16W4 (activaciones 16-bit, pesos 4-bit), pre-cuantizado con GPTQ |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (artefactos compilados para SiMa.ai Modalix; no se distribuyen pesos estandar) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint **Qwen/Qwen3-VL-2B-Instruct**, un modelo multimodal de vision-lenguaje que combina un codificador visual con un modelo de lenguaje de 2.000 millones de parametros. Sobre este checkpoint, SiMa.ai aplica una pre-cuantizacion con GPTQ a un esquema A16W4, donde las activaciones se mantienen en 16 bits y los pesos se reducen a 4 bits, para maximizar la eficiencia en el acelerador MLA de la plataforma Modalix. Posteriormente, el modelo se compila con una resolucion de imagen fija de 448x448, optimizada en tiempo de compilacion para conseguir el mayor rendimiento posible en el hardware objetivo. No se proporcionan datos sobre el proceso de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO, ya que esta version es una adaptacion de un modelo ya entrenado.

## Capacidades

- Generacion de texto a partir de imagenes (image-to-text), incluyendo descripcion de escenas, objetos y texto presente en imagenes.
- Comprension multimodal basica: el modelo puede razonar sobre el contenido visual y responder preguntas asociadas a una imagen.
- Inferencia de baja latencia en dispositivos embebidos, con tiempos de primer token (TTFT) de 0,22 segundos para una imagen 448x448 y una pregunta de 20 tokens.
- Soporte de generacion de texto puro (sin imagen), con tasas de generacion de hasta 44,71 tokens por segundo en entradas cortas.
- Integracion con APIs compatibles con OpenAI y Ollama a traves del servidor GenAI de SiMa.ai.
- No se han documentado capacidades de tool calling, function calling, agentes o modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- **Asistente multimodal en dispositivos embebidos**: el modelo puede ejecutarse en camaras inteligentes o robots para interpretar escenas en tiempo real, gracias a su latencia de 0,22 segundos de TTFT y su resolucion fija de 448x448, ideal para aplicaciones de vision artificial en el borde.
- **Control de calidad industrial**: en lineas de produccion, el modelo puede analizar imagenes de piezas a 448x448 y detectar defectos visuales, respondiendo con texto a consultas como "¿hay algun defecto en esta pieza?" sin necesidad de enviar datos a la nube.
- **Sistemas de vigilancia y seguridad**: puede procesar frames de camaras de seguridad para describir eventos o identificar objetos, funcionando de forma autonoma en hardware de bajo consumo.
- **Accesibilidad para personas con discapacidad visual**: el modelo puede describir el entorno a partir de una imagen capturada por un dispositivo portatil, generando texto hablado a traves de un sintetizador de voz, con una velocidad de generacion superior a 40 tokens por segundo.
- **Automatizacion de documentos**: en escenarios de digitalizacion de documentos, el modelo puede leer y extraer informacion de imagenes a resolucion 448x448, como recibos o formularios, y devolver respuestas textuales estructuradas.
- **Asistentes domesticos con vision**: integrado en dispositivos de hogar inteligente, el modelo puede interpretar imagenes de la cocina, el salon o la entrada, y mantener conversaciones multimodales con el usuario, aprovechando la ventana de contexto de 8.192 tokens para dialogos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluaciones estandar como MMLU, HumanEval o GSM8K para esta version cuantizada y compilada. Los unicos datos de rendimiento disponibles son mediciones de latencia y velocidad de generacion realizadas en el hardware SiMa.ai Modalix, que se detallan en la seccion de requisitos de hardware.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El modelo no se ejecuta en GPUs convencionales, sino en el acelerador SiMa.ai Modalix, que integra memoria propia.
- **GPU recomendadas**: no aplicable. El modelo requiere un dispositivo SiMa.ai Modalix con el runtime Neat instalado.
- **Compatibilidad con GPU de consumo**: no. No se puede ejecutar en GPUs como RTX 4090 o similares, ya que los artefactos estan compilados especificamente para el hardware de SiMa.ai.
- **Opciones de despliegue**: despliegue en dispositivos SiMa.ai Modalix mediante la CLI `llima` (comando `llima pull` y `llima run`), servidor GenAI compatible con OpenAI y Ollama, o llamadas directas al modelo VLM a traves del tutorial "Run a VLM" de SiMa.ai.
- **Latencia y throughput medidos en Modalix**:

| Escenario | Entrada | TTFT medio (segundos) | Velocidad de generacion (tokens/segundo) |
|---|---|---|---|
| Multimodal (imagen 448x448 + 20 tokens de texto) | 1 imagen + 20 tokens | 0,22 | 43,92 |
| Texto puro | 128 tokens | 0,05 | 44,71 |
| Texto puro | 256 tokens | 0,11 | 43,80 |
| Texto puro | 512 tokens | 0,21 | 42,12 |
| Texto puro | 1.024 tokens | 0,45 | 39,84 |
| Texto puro | 2.048 tokens | 1,01 | 30,57 |
| Texto puro | 3.072 tokens | 1,94 | 27,94 |
| Texto puro | 4.096 tokens | 3,12 | 25,40 |
| Texto puro | 5.120 tokens | 4,79 | 21,70 |
| Texto puro | 6.144 tokens | 6,80 | 18,93 |
| Texto puro | 7.168 tokens | 9,55 | 16,24 |

## Comparativa con modelos similares

No disponible. No se han encontrado datos de comparacion con modelos equivalentes en la informacion proporcionada. El unico modelo directamente relacionado es el checkpoint base **Qwen/Qwen3-VL-2B-Instruct**, del cual esta version es una adaptacion cuantizada y compilada, pero no se dispone de mediciones comparativas en el mismo hardware.

## Limitaciones y advertencias

- La cuantizacion A16W4 puede introducir desviaciones menores en la precision respecto al modelo original en precision completa, aunque el autor indica que se mantiene una alta precision.
- La resolucion de imagen es fija en 448x448, definida en tiempo de compilacion. No se admite entrada de imagenes con otras resoluciones sin recompilar el modelo.
- El modelo solo puede ejecutarse en hardware SiMa.ai Modalix con el runtime Neat instalado. No es portable a otras plataformas o GPUs estandar.
- No se proporciona informacion sobre sesgos, riesgos de alucinacion o limitaciones idiomaticas. Se recomienda validar el comportamiento en el dominio de uso concreto antes de desplegarlo en produccion.
- La licencia MIT permite uso comercial, pero el despliegue real requiere la adquisicion del hardware SiMa.ai correspondiente.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/simaai/Qwen3-VL-2B-Instruct-GPTQ-a16w4
- Modelo base Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Version con safetensors de simaai: https://huggingface.co/simaai/Qwen3-VL-2B-Instruct-GPTQ-Safetensors
- Guia de inicio de SiMa.ai Neat: https://developer.sima.ai/software/getting-started/
- Documentacion de GenAI con LLiMa: https://developer.sima.ai/software/genai-llima/
- Tutorial para servir modelos GenAI: https://developer.sima.ai/software/tutorials/serve-genai-models
- Tutorial para ejecutar un VLM: https://developer.sima.ai/software/tutorials/run-a-vlm
- Aplicacion demo de asistente multimodal: https://developer.sima.ai/examples/app/genai%2Fmultimodal-assistant
