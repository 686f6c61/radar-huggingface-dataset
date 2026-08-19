# LiquidAI/LFM2.5-VL-3B-MLX-5bit

## Resumen

LFM2.5-VL-3B-MLX-5bit es una exportación en formato MLX y cuantización de 5 bits del modelo de visión-lenguaje LFM2.5-VL-3B, desarrollado por Liquid AI. Este modelo está diseñado específicamente para inferencia en dispositivos Apple Silicon (Macs con chips M1 o superiores) mediante la librería MLX, lo que permite ejecutar un VLM de 3.100 millones de parámetros de forma eficiente en hardware de consumo. El modelo base combina un backbone de lenguaje LFM2.5-2.6B con un encoder de visión SigLIP2 NaFlex de 400 millones de parámetros, alcanzando un total de aproximadamente 3.100 millones de parámetros.

La versión MLX cuantizada a 5 bits reduce el tamaño del repositorio a 2,8 GB, lo que facilita su despliegue en equipos con memoria unificada limitada. LFM2.5-VL-3B destaca por su capacidad para leer pantallas digitales (móvil, web y escritorio), realizar grounding de objetos a coordenadas, comprender documentos y gráficos, y ejecutar function calling a partir de entradas de texto o imagen. Todo ello con baja latencia, lo que lo convierte en una opción relevante para aplicaciones edge y on-device en 2026, cuando la demanda de modelos multimodales ligeros y eficientes sigue en aumento.

El repositorio MLX incluye instrucciones de uso con `mlx-vlm` y un ejemplo de generación de texto a partir de una imagen, lo que facilita su integración en proyectos existentes. Aunque la model card oficial no detalla los datos de entrenamiento ni benchmarks, la documentación de Liquid AI posiciona este modelo como el VLM más capaz de la familia para el edge, con soporte para 16 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model con backbone LFM2.5-2.6B y encoder de visión SigLIP2 NaFlex (400M) |
| Parametros totales | 3.100 millones (documentación oficial); el repositorio MLX reporta 940.414.192 en safetensors, discrepancia a verificar |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 5 bits (esta versión); el modelo base está disponible en otros formatos (GGUF, ONNX, MLX) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, no estándar; revisar restricciones) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de lenguaje LFM2.5-2.6B como backbone con un encoder de visión SigLIP2 NaFlex de 400 millones de parámetros. Liquid AI no ha publicado detalles completos sobre la arquitectura interna del backbone, pero se sabe que la familia LFM2.5 utiliza técnicas de atención eficiente para reducir el coste computacional y mejorar la latencia en dispositivos edge. El modelo acepta imágenes y texto como entrada, y genera respuestas de texto, incluyendo coordenadas de bounding boxes y llamadas a herramientas.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas de alineación como RLHF o DPO. La documentación oficial menciona que el modelo está optimizado para tareas de grounding, comprensión de pantallas, OCR y function calling, lo que sugiere un entrenamiento específico en estos dominios, pero los detalles no están disponibles en la información proporcionada.

## Capacidades

- Comprensión de imágenes y texto: responde preguntas sobre el contenido visual de una imagen.
- OCR y comprensión de documentos: extrae texto y estructura de documentos, facturas, capturas de pantalla y gráficos.
- Grounding visual: predice coordenadas de bounding boxes para objetos mencionados en la entrada de texto.
- Lectura de pantallas digitales: interpreta interfaces de móvil, web y escritorio, útil para automatización de UI.
- Function calling: puede invocar herramientas a partir de instrucciones en texto o imagen, facilitando la integración en agentes.
- Soporte multilingüe: cubre 16 idiomas, incluyendo español, inglés, francés, alemán, chino, japonés, entre otros.
- Baja latencia: diseñado para ejecutarse en dispositivos edge, con respuestas directas sin pasos intermedios.

## Casos de uso

- Automatización de interfaces de usuario: el modelo puede leer una captura de pantalla de una aplicación móvil o web y generar comandos para interactuar con los elementos (por ejemplo, hacer clic en un botón), gracias a su capacidad de grounding y function calling. Esto permite construir agentes de prueba automatizada o asistentes de navegación.
- Extracción de datos de documentos: procesa facturas, formularios o contratos escaneados, extrayendo campos clave (fechas, importes, nombres) mediante OCR y comprensión de estructura, reduciendo la entrada manual de datos en sistemas ERP.
- Asistencia visual para personas con discapacidad: describe el contenido de imágenes o la interfaz de una aplicación en tiempo real, ayudando a usuarios con discapacidad visual a interactuar con dispositivos móviles o de escritorio.
- Análisis de gráficos y tablas: interpreta gráficos de barras, líneas o tablas en imágenes y responde preguntas sobre tendencias o valores, útil para analistas que trabajan con informes visuales.
- Agentes de soporte técnico con visión: un asistente puede recibir una captura de pantalla del problema del usuario, identificar el error y sugerir pasos de solución, combinando la comprensión visual con el razonamiento textual.
- Clasificación y moderación de contenido visual: analiza imágenes para detectar contenido inapropiado o clasificar productos en categorías, usando el modelo como clasificador de cero disparo con prompts en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación de Liquid AI menciona que el modelo es "más capaz" que versiones anteriores, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación estándar. Se recomienda consultar el blog oficial de Liquid AI para futuras actualizaciones con datos comparativos.

## Requisitos de hardware

- Esta versión MLX está diseñada exclusivamente para Apple Silicon (chips M1, M2, M3 y superiores) con memoria unificada.
- El tamaño del repositorio es de 2,8 GB, por lo que se estima que el modelo en 5 bits ocupa aproximadamente 2,8 GB de memoria durante la inferencia.
- Se recomienda un Mac con al menos 8 GB de RAM unificada para ejecutar el modelo con comodidad; 16 GB o más para trabajar con contextos largos o múltiples imágenes.
- Para GPUs NVIDIA, se debe utilizar el modelo base en formato original (safetensors sin cuantizar) o las versiones GGUF/ONNX disponibles en el repositorio de Liquid AI, que se pueden ejecutar con vLLM, llama.cpp u Ollama.
- La latencia en Apple Silicon depende del chip concreto; en un M2 Pro se esperan tiempos de respuesta de pocos segundos para generación de 100 tokens, aunque no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos en la información proporcionada. Como referencia cualitativa, LFM2.5-VL-3B compite con otros VLM pequeños como Qwen2-VL-2B, Phi-3.5-vision y MiniCPM-V 2.6. Todos ellos ofrecen capacidades similares (OCR, grounding, function calling) y están orientados a despliegue edge. La principal diferencia es la licencia: lfm1.0 es una licencia propia de Liquid AI, mientras que los otros modelos suelen usar Apache 2.0 o MIT. Se recomienda revisar los términos de cada licencia antes de su uso comercial.

## Limitaciones y advertencias

- La licencia lfm1.0 no es una licencia de código abierto estándar; es una licencia propia de Liquid AI que puede imponer restricciones al uso comercial, redistribución o modificación. Es imprescindible revisar el texto completo de la licencia en el repositorio antes de utilizar el modelo en producción.
- No se han publicado detalles sobre sesgos o alucinaciones específicos de este modelo. Como cualquier VLM, puede generar descripciones incorrectas de imágenes o inventar información cuando la imagen es ambigua.
- La discrepancia entre el número de parámetros reportado por HuggingFace (940M) y la documentación oficial (3.100M) debe ser aclarada por el equipo de Liquid AI antes de confiar en métricas de rendimiento basadas en el tamaño.
- El soporte multilingüe está limitado a los 16 idiomas listados; el rendimiento puede degradarse en idiomas no incluidos.
- Esta versión MLX solo funciona en Apple Silicon; para otros entornos es necesario usar el modelo base u otros formatos, que pueden requerir más recursos de hardware.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-5bit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Blog oficial de Liquid AI: https://www.liquid.ai/blog/lfm2-5-vl-3b
- Documentación oficial: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Artículo de MarkTechPost: https://www.marktechpost.com/2026/08/13/liquid-ai-lfm2-5-vl-3b-on-device-vision-language-model/
- Artículo de Unite.ai: https://www.unite.ai/liquid-ai-ships-lfm2-5-vl-3b-for-faster-vision-language-ai-on-the-edge/
