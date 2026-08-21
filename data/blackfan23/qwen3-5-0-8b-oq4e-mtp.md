# blackfan23/Qwen3.5-0.8B-oQ4e-mtp

## Resumen

Este modelo es una cuantización en 4 bits del modelo Qwen3.5-0.8B, realizada por el usuario blackfan23 mediante la herramienta oQ (oMLX v0.6.3rc2) con precisión mixta. El modelo base, Qwen3.5-0.8B, es el más pequeño de la familia Qwen3.5 de Alibaba, una serie de modelos de lenguaje multimodal (texto, imagen y vídeo) con arquitectura híbrida que combina atención lineal con transformers tradicionales. Esta cuantización reduce el tamaño del modelo para facilitar su ejecución en dispositivos con recursos limitados, como Apple Silicon mediante MLX o plataformas embebidas como Jetson.

El modelo cuenta con 127.950.144 parámetros (aproximadamente 128 millones) y su cuantización a 4 bits con grupo de tamaño 64 ocupa unos 0,5 GB en disco. Está orientado a tareas de inferencia multimodal ligera, razonamiento, generación de código y agentes, según las características del modelo base. La cuantización se publicó el 21 de agosto de 2026 y reemplaza una versión anterior, por lo que se recomienda descargar los pesos actualizados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal + transformers tradicionales (modelo base Qwen3.5) |
| Parametros totales | 127.950.144 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (oQ4e), group size 64, precisión mixta |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la model card; el modelo base Qwen3.5 se distribuye bajo Apache 2.0 según fuentes web |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B pertenece a la familia Qwen3.5, que emplea una arquitectura híbrida que combina atención lineal con transformers tradicionales. Esta combinación busca mejorar la eficiencia computacional manteniendo la calidad en tareas de razonamiento y comprensión. El modelo es nativamente multimodal, entrenado con fusión temprana de tokens multimodales (texto, imagen y vídeo), lo que le permite procesar información visual y textual de forma unificada. Según las fuentes web, supera a los modelos Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información proporcionada. La cuantización se realizó con la herramienta oQ (oMLX v0.6.3rc2), que aplica cuantización de precisión mixta, optimizando la asignación de bits según la sensibilidad de cada capa.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de tareas de razonamiento y generación de texto, aunque su tamaño reducido limita la complejidad de las tareas.
- Comprensión multimodal: procesa imágenes y vídeo además de texto, gracias a su entrenamiento con fusión temprana de tokens multimodales.
- Generación de código: según las fuentes, el modelo base rinde bien en tareas de programación.
- Soporte para agentes: el modelo base está diseñado para tareas de agentes, lo que sugiere capacidad de planificación y uso de herramientas, aunque no se especifica si esta cuantización conserva todas las capacidades.
- Multilingüismo: no se dispone de información específica sobre los idiomas soportados.
- Eficiencia: al ser un modelo pequeño cuantizado, es adecuado para despliegue en dispositivos con recursos limitados.

## Casos de uso

- Inferencia multimodal en dispositivos edge: el modelo puede ejecutarse en plataformas como Jetson o Apple Silicon para tareas de visión por computador y procesamiento de lenguaje natural en tiempo real, gracias a su tamaño reducido y su formato MLX.
- Prototipado rápido: los desarrolladores pueden iterar rápidamente sobre aplicaciones de IA generativa multimodal sin necesidad de GPUs de alta gama, usando este modelo como base.
- Asistente de código local: puede integrarse en entornos de desarrollo para sugerencias de código y autocompletado, funcionando completamente en local.
- Análisis de imágenes en dispositivos móviles: al ser multimodal, puede utilizarse para describir imágenes o extraer información visual en aplicaciones móviles o embebidas.
- Automatización de tareas de agentes: su capacidad para tareas de agentes permite construir asistentes que interactúan con APIs o ejecutan acciones simples, aunque con limitaciones por su tamaño.
- Educación e investigación: sirve como modelo de referencia para estudiar técnicas de cuantización y su impacto en el rendimiento de modelos multimodales pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. Las fuentes web mencionan que el modelo base Qwen3.5-0.8B supera a Qwen3-VL en varios benchmarks, pero no se proporcionan cifras concretas. Por tanto, no se incluyen tablas de rendimiento.

## Requisitos de hardware

- El tamaño del repositorio es de 0,5 GB, lo que indica que el modelo cuantizado ocupa aproximadamente 500 MB en disco.
- La VRAM necesaria para inferencia no se especifica oficialmente, pero dado el tamaño del modelo (128 M parámetros en 4 bits), se estima que cabe en menos de 1 GB, aunque no hay datos confirmados.
- Está optimizado para MLX, por lo que se ejecuta de forma nativa en Apple Silicon (M1, M2, M3, etc.).
- También puede ejecutarse en plataformas embebidas como Jetson, según las fuentes web.
- No se dispone de información sobre latencia o throughput específicos.
- Opciones de despliegue: MLX (Apple), y posiblemente otros frameworks que soporten safetensors, aunque el formato MLX es específico.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares en la información proporcionada. El modelo base Qwen3.5-0.8B podría compararse con otros modelos pequeños multimodales como Qwen3-VL-0.6B o PaliGemma, pero no se tienen datos concretos de rendimiento ni especificaciones de estos en las fuentes consultadas.

## Limitaciones y advertencias

- Al ser una cuantización de 4 bits, puede haber una pérdida de precisión respecto al modelo original en tareas complejas.
- El modelo es muy pequeño (128 M de parámetros), por lo que su capacidad de razonamiento y generación es limitada en comparación con modelos más grandes.
- No se dispone de información sobre sesgos o alucinaciones específicas de este modelo.
- La licencia no está especificada en la model card; aunque el modelo base es Apache 2.0, la cuantización podría tener restricciones adicionales. Se recomienda verificar antes de uso comercial.
- El formato MLX safetensors es específico de Apple Silicon, lo que limita su uso en otras plataformas sin conversión.
- No se ha verificado la integridad de los pesos ni su rendimiento en producción; al tener 0 descargas, es un modelo reciente sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blackfan23/Qwen3.5-0.8B-oQ4e-mtp
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-0.8B en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Guía de Qwen 3.5: https://qwen-ai.com/qwen-3-5/
- Página de CanIRun para Qwen3.5 0.8B: https://www.canirun.ai/model/qwen3.5-0.8b
- Página de Jetson AI Lab para Qwen3.5 0.8B: https://www.jetson-ai-lab.com/models/qwen3-5-0-8b/
