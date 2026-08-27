# Oscilla/Qwen3.5-4B-mlx-4Bit

## Resumen

Oscilla/Qwen3.5-4B-mlx-4Bit es una conversión a formato MLX (Apple Silicon) del modelo Qwen3.5-4B, desarrollado por Alibaba. Esta versión cuantizada a 4 bits reduce el footprint de memoria y cómputo, manteniendo un rendimiento competitivo en tareas de generación de texto, razonamiento, codificación y comprensión visual. El modelo base Qwen3.5-4B es un modelo multimodal unificado (image-text-to-text) que integra visión y lenguaje mediante entrenamiento de fusión temprana sobre tokens multimodales, superando a la serie Qwen3-VL en benchmarks de razonamiento, agentes y comprensión visual.

La conversión ha sido realizada por el usuario Oscilla con la librería mlx-lm versión 0.31.2, y el repositorio contiene los pesos en formato MLX (safetensors) listos para usar con `mlx_lm`. Con 657.959.936 parámetros (según el archivo safetensors) y un tamaño de repo de 2,4 GB, es adecuado para despliegue en dispositivos Apple con memoria unificada, así como en GPUs consumer con suficiente VRAM. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fusión temprana de tokens visuales y textuales) |
| Parametros totales | 657.959.936 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer multimodal que integra visión y lenguaje mediante entrenamiento de fusión temprana sobre billones de tokens multimodales. Según la documentación oficial de Qwen3.5, esta arquitectura unificada logra paridad con Qwen3 en tareas de lenguaje y supera a los modelos Qwen3-VL en razonamiento, codificación, agentes y comprensión visual. No se dispone de detalles específicos sobre el número exacto de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO en la información proporcionada.

La conversión a MLX 4-bit se realizó con mlx-lm 0.31.2, que aplica cuantización de pesos a 4 bits manteniendo la estructura del modelo original. Esta cuantización reduce el tamaño del modelo a aproximadamente 2,4 GB, facilitando su ejecución en hardware con memoria limitada, especialmente en Apple Silicon.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.5-4B está diseñado para tareas de lenguaje general, incluyendo razonamiento lógico y matemático.
- Comprensión visual: al ser un modelo image-text-to-text, puede procesar imágenes y responder preguntas sobre su contenido, aunque no se especifican los detalles de las capacidades visuales en la información disponible.
- Codificación: según la documentación de Qwen3.5, el modelo supera a Qwen3-VL en benchmarks de codificación, lo que sugiere competencia en generación y análisis de código.
- Soporte de agentes: la arquitectura está optimizada para tareas de agente, lo que implica capacidad de planificación y ejecución de múltiples pasos.
- Multilingüismo: no se han publicado los idiomas soportados, pero la serie Qwen suele cubrir múltiples lenguas, incluyendo chino e inglés.
- Tool calling / function calling: no se menciona explícitamente, pero es común en modelos de la familia Qwen; no confirmado en esta versión.

## Casos de uso

- Asistente multimodal en dispositivos Apple: gracias al formato MLX y la cuantización 4-bit, el modelo puede ejecutarse localmente en Macs con Apple Silicon para tareas de chat con entrada de imágenes, sin necesidad de conexión a la nube.
- Generación de código asistida: el modelo puede integrarse en editores o IDEs para autocompletar código, explicar fragmentos o generar funciones a partir de descripciones en lenguaje natural, aprovechando su rendimiento en benchmarks de codificación.
- Análisis de documentos con imágenes: en entornos donde se necesite extraer información de capturas, diagramas o gráficos, el modelo puede procesar la imagen y generar resúmenes o respuestas contextuales.
- Prototipado de agentes conversacionales: su capacidad para tareas de agente permite construir asistentes que ejecutan secuencias de acciones, como consultar APIs o navegar por interfaces, aunque se requiere verificar el soporte de tool calling.
- Educación y tutoría: puede utilizarse como tutor interactivo que explica conceptos, resuelve problemas matemáticos o responde preguntas sobre material visual, gracias a su razonamiento y comprensión multimodal.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4B cuantizado a 4 bits, cabe en GPUs con 4-6 GB de VRAM, permitiendo su uso en servidores de bajo coste o estaciones de trabajo sin GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación de Qwen3.5 menciona que supera a Qwen3-VL en razonamiento, codificación, agentes y comprensión visual, pero no se proporcionan cifras concretas para esta conversión específica.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 4B cuantizado a 4 bits, el uso de memoria ronda los 2-3 GB, aunque el tamaño del repo es de 2,4 GB. Se recomienda al menos 4 GB de VRAM para inferencia con margen.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como NVIDIA RTX 3060, RTX 4060, o GPUs de Apple Silicon (M1/M2/M3) con memoria unificada de 8 GB o más.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: el formato MLX está diseñado para `mlx-lm` en macOS. También puede convertirse a otros formatos (GGUF, etc.) si se desea usar con llama.cpp u Ollama, aunque no se proporciona soporte oficial.
- Latencia y throughput: no se dispone de datos medidos. En Apple Silicon, se espera una generación de 10-20 tokens por segundo en modelos de este tamaño, pero no es un dato confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Oscilla/Qwen3.5-4B-mlx-4Bit | 657M (según safetensors) | no disponible | 4-bit MLX | Apache-2.0 | MLX |
| mlx-community/Qwen3.5-4B-OptiQ-4bit | no disponible | no disponible | 4-bit | no disponible | MLX |
| Shubh153/Qwen3.5-4B-4bit-mlx | no disponible | no disponible | 4-bit | no disponible | MLX |

No se dispone de datos de rendimiento comparativos entre estas versiones. Todas son conversiones del mismo modelo base Qwen3.5-4B, por lo que las diferencias se limitan al método de cuantización y posibles optimizaciones.

## Limitaciones y advertencias

- La cuantización a 4 bits puede introducir una ligera pérdida de precisión en tareas complejas de razonamiento o generación de código, aunque suele ser aceptable para la mayoría de casos.
- No se ha verificado el soporte de tool calling o function calling en esta conversión específica; es necesario probarlo antes de usarlo en producción.
- La longitud de contexto no está documentada, por lo que se desconoce el límite de tokens de entrada. Se recomienda probar con secuencias largas para evitar errores.
- No hay información sobre los idiomas soportados; aunque la familia Qwen suele cubrir múltiples lenguas, no se garantiza el rendimiento en todos ellos.
- Al ser una conversión de terceros, no hay garantía de mantenimiento o actualizaciones por parte del autor original.
- El modelo es multimodal, pero no se especifican los detalles de las capacidades visuales (resolución, tipos de imagen, etc.). Se recomienda validar con casos de uso reales.

## Enlaces

- [Oscilla/Qwen3.5-4B-mlx-4Bit en Hugging Face](https://huggingface.co/Oscilla/Qwen3.5-4B-mlx-4Bit)
- [Modelo base Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [mlx-community/Qwen3.5-4B-OptiQ-4bit](https://huggingface.co/mlx-community/Qwen3.5-4B-OptiQ-4bit)
- [Shubh153/Qwen3.5-4B-4bit-mlx](https://huggingface.co/Shubh153/Qwen3.5-4B-4bit-mlx)
- [Página de Qwen3.5 en Ollama](https://ollama.com/library/qwen3.5:4b)
- [Repositorio GitHub de Qwen3.5](https://github.com/ABDtmx/Qwen3.5)
