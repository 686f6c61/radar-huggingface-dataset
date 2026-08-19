# LiquidAI/LFM2.5-VL-3B-MLX-8bit

## Resumen

LFM2.5-VL-3B-MLX-8bit es una exportación en formato MLX del modelo de visión y lenguaje LFM2.5-VL-3B, desarrollado por Liquid AI. Se trata de un modelo multimodal de 3.100 millones de parámetros (según la documentación oficial) construido sobre el backbone de lenguaje LFM2.5-2.6B y un encoder de visión SigLIP2 NaFlex de 400 millones de parámetros. Está diseñado para ejecutarse en el dispositivo (edge) con baja latencia, cubriendo tareas como OCR, comprensión de documentos, comprensión de pantallas, predicción de bounding boxes y function calling.

Esta versión concreta está cuantizada a 8 bits y optimizada para Apple Silicon mediante la librería MLX, lo que permite ejecutar el modelo en Macs con memoria unificada sin necesidad de GPU dedicada. El checkpoint MLX 8-bit ocupa 3,7 GB en disco y contiene 1.185.060.080 parámetros según los archivos safetensors, una cifra inferior a la del modelo base debido a la cuantización y posible exclusión de ciertos componentes. El modelo se publicó el 10 de agosto de 2026 y se actualizó dos días después.

La relevancia de este modelo radica en su capacidad para llevar capacidades de visión y lenguaje de alto nivel a entornos con recursos limitados, como teléfonos, portátiles y GPUs de gama media, manteniendo un rendimiento competitivo en tareas de grounding, lectura de documentos y automatización de interfaces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (backbone de lenguaje) + SigLIP2 NaFlex (encoder de visión) |
| Parametros totales | 1.185.060.080 (checkpoint MLX 8-bit; el modelo base LFM2.5-VL-3B tiene ~3.1B según documentación) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (este checkpoint); el modelo base está disponible en otros formatos (GGUF, ONNX, HF) |
| Idiomas soportados | arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes, vietnamita (17 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo combina un backbone de lenguaje LFM2.5-2.6B con un encoder de visión SigLIP2 NaFlex de 400 millones de parámetros. LFM2.5 es la segunda generación de la familia de modelos de Liquid AI, que utiliza arquitecturas basadas en transformadores con innovaciones propias orientadas a eficiencia y baja latencia. El encoder SigLIP2 NaFlex proporciona representaciones visuales robustas para tareas de grounding y comprensión de documentos.

No se dispone de información detallada sobre el proceso de entrenamiento, como el número de tokens utilizados, la composición del dataset o si se aplicaron técnicas de RLHF o DPO. La documentación oficial indica que el modelo responde directamente (sin cadenas de razonamiento extensas) para minimizar la latencia en inferencia, lo que sugiere un entrenamiento optimizado para generación directa.

## Capacidades

- Generación de texto a partir de imágenes (image-text-to-text).
- OCR y extracción de texto de imágenes y documentos escaneados.
- Comprensión de documentos complejos, incluyendo tablas, gráficos y diseños multi-columna.
- Comprensión de pantallas digitales (móvil, web y escritorio) para automatización de interfaces.
- Predicción de bounding boxes (grounding) para localizar objetos o regiones en una imagen.
- Function calling: capacidad de invocar herramientas externas a partir de entradas de texto o imagen.
- Comprensión multilingüe de imágenes con soporte para 17 idiomas.
- Inferencia de baja latencia, adecuada para despliegue en el dispositivo.

## Casos de uso

- Automatización de pruebas de interfaz: el modelo puede analizar capturas de pantalla de aplicaciones móviles o web, identificar elementos interactivos mediante bounding boxes y generar comandos de automatización, reduciendo el trabajo manual en pipelines de testing.
- Extracción de datos de documentos: procesa facturas, formularios y contratos escaneados, extrayendo campos clave (nombres, fechas, importes) mediante OCR y comprensión de layout, integrándose en sistemas de gestión documental.
- Asistente visual para personas con discapacidad visual: describe escenas, lee textos de carteles o pantallas y responde preguntas sobre el entorno en tiempo real desde un dispositivo móvil con recursos limitados.
- Agente de soporte técnico remoto: el usuario envía una foto del problema (pantalla de error, cableado, etc.) y el modelo identifica el fallo, sugiere soluciones y puede invocar herramientas de diagnóstico mediante function calling.
- Análisis de gráficos y tablas en informes: convierte imágenes de gráficos de barras, líneas o tablas en datos estructurados o resúmenes textuales, útil para analistas que trabajan con informes escaneados.
- Automatización de flujos de trabajo en el dispositivo: el modelo actúa como agente local que lee notificaciones, correos o documentos en pantalla y ejecuta acciones predefinidas (responder, archivar, reenviar) sin enviar datos a la nube.
- Traducción visual multilingüe: combina OCR con comprensión multilingüe para traducir texto presente en imágenes (señales, menús, instrucciones) entre los 17 idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación oficial menciona que el modelo es "más capaz" y "más rápido" que versiones anteriores, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K u otros tests estandarizados en los materiales consultados.

## Requisitos de hardware

- El checkpoint MLX 8-bit ocupa 3,7 GB en disco, por lo que la VRAM o memoria unificada necesaria para inferencia es de aproximadamente 4-5 GB incluyendo overhead.
- Diseñado para Apple Silicon (M1, M2, M3 y posteriores) gracias a la librería MLX. Se puede ejecutar en cualquier Mac con al menos 8 GB de memoria unificada.
- También disponible en formatos GGUF y ONNX según la documentación, lo que permite su uso en GPUs NVIDIA (por ejemplo, RTX 3060 o superior) mediante llama.cpp, vLLM u otras herramientas.
- Para despliegue en el dispositivo, se recomienda usar la librería mlx-vlm con el ejemplo de generación proporcionado en la model card.
- La latencia estimada no está documentada, pero el diseño orientado a edge sugiere tiempos de respuesta por debajo de 1 segundo en hardware Apple Silicon moderno.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de visión y lenguaje de tamaño similar (por ejemplo, Phi-3.5-vision o Qwen2-VL-2B) en la informacion disponible. La documentación de Liquid AI afirma que LFM2.5-VL-3B supera a su predecesor LFM2-VL-3B, pero no se ofrecen datos numéricos de comparación.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la informacion disponible, pero al ser un modelo entrenado con datos web, es susceptible de heredar sesgos de género, raza o cultura presentes en esos datos.
- Riesgo de alucinación en tareas de OCR o comprensión de documentos, especialmente con imágenes de baja calidad o texto ilegible.
- La longitud de contexto no está especificada, lo que puede limitar el procesamiento de documentos muy extensos o conversaciones multi-turno largas.
- La licencia lfm1.0 es una licencia propia de Liquid AI; es necesario revisar sus términos para uso comercial, ya que puede incluir restricciones de redistribución o uso en determinados sectores.
- El checkpoint MLX 8-bit está optimizado para Apple Silicon; su rendimiento en otras plataformas puede requerir conversión adicional a formatos como GGUF u ONNX.
- No se proporcionan garantías de precisión en tareas de grounding con objetos pequeños o superpuestos; se recomienda validar en el dominio de aplicación específico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-8bit)
- [Blog de Liquid AI sobre LFM2.5-VL-3B](https://www.liquid.ai/blog/lfm2-5-vl-3b)
- [Documentación oficial de LFM2.5-VL-3B](https://docs.liquid.ai/lfm/models/lfm25-vl-3b)
- [Artículo de Marktechpost](https://www.marktechpost.com/2026/08/13/liquid-ai-lfm2-5-vl-3b-on-device-vision-language-model/)
- [Artículo de Unite.ai](https://www.unite.ai/liquid-ai-ships-lfm2-5-vl-3b-for-faster-vision-language-ai-on-the-edge/)
- [Playground de Liquid AI](https://playground.liquid.ai/)
- [Repositorio de la organización LiquidAI en Hugging Face](https://huggingface.co/LiquidAI)
