# Pluto-AI-Labs/Apollo-VL-Edge-3B-MLX-6bit

## Resumen

Apollo-VL-Edge-3B es un modelo multimodal de visión-lenguaje (VLM) desarrollado por Pluto-AI-Labs, un laboratorio independiente que se describe como centrado en la creación de modelos eficientes para entornos edge. El modelo está diseñado para tareas de image-text-to-text, es decir, procesar imágenes y texto para generar respuestas conversacionales, con capacidades destacadas en OCR y comprensión de gráficos. Según los datos disponibles, el modelo se basa en la arquitectura Qwen2.5-VL, aunque el número real de parámetros según los pesos safetensors es de aproximadamente 1.340 millones (1.34B), a pesar de que el nombre comercial indica "3B". Esta discrepancia sugiere que el nombre puede referirse a una versión ampliada o a una convención de marketing, pero los pesos reales son menores.

La relevancia de este modelo radica en su enfoque en eficiencia y despliegue en dispositivos con recursos limitados, como demuestra su cuantización de 6 bits y su compatibilidad con MLX (optimizado para Apple Silicon) y con GGUF para llama.cpp. El repositorio de HuggingFace presenta una model card prácticamente vacía, lo que limita la información disponible sobre entrenamiento, benchmarks y licencia. Sin embargo, la existencia de variantes GGUF de terceros con licencia apache-2.0 sugiere que el modelo podría tener una licencia permisiva, aunque no se confirma en la fuente original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen2.5-VL (según tags y variantes GGUF) |
| Parametros totales | 1.343.922.176 (~1.34B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6-bit (MLX), GGUF (variantes de terceros, bits no especificados) |
| Idiomas soportados | Inglés (según tags y model card) |
| Licencia | No disponible (las variantes GGUF de terceros indican apache-2.0, pero no se confirma para el modelo original) |
| Formato de pesos | safetensors (MLX), GGUF (variantes de terceros) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados. Los únicos datos disponibles son los tags del repositorio, que indican que el modelo se basa en Qwen2.5-VL, una arquitectura transformer multimodal desarrollada por Alibaba que combina un codificador visual con un modelo de lenguaje. Esta arquitectura permite procesar imágenes y texto de forma conjunta, y es conocida por su buen rendimiento en tareas de OCR, comprensión de gráficos y razonamiento visual. Sin embargo, no se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El laboratorio Pluto-AI-Labs menciona en su perfil de GitHub que se centra en "modelos edge de última generación" y en "infraestructura open source", lo que sugiere un énfasis en la eficiencia computacional, pero no se proporcionan más detalles técnicos.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, y genera respuestas textuales (pipeline image-text-to-text).
- OCR (reconocimiento óptico de caracteres): según los tags de las variantes GGUF, el modelo es capaz de extraer texto de imágenes.
- Comprensión de gráficos (chart-understanding): puede interpretar y responder preguntas sobre gráficos y diagramas.
- Conversación multimodal: diseñado para mantener diálogos en los que se intercalan imágenes y texto.
- Optimización para edge: cuantización de 6 bits y soporte MLX y GGUF, lo que permite ejecución en hardware con recursos limitados.
- Idiomas: soporta únicamente inglés según la información disponible.

## Casos de uso

- Digitalización de documentos: el modelo puede extraer texto de imágenes de documentos escaneados o fotografías, facilitando la conversión a formatos digitales editables. Su capacidad de OCR y su tamaño reducido lo hacen adecuado para aplicaciones móviles o dispositivos embebidos.
- Análisis de gráficos en informes: puede interpretar gráficos de barras, líneas o circulares y responder preguntas sobre tendencias o valores, útil en herramientas de análisis de datos o dashboards.
- Asistente visual para personas con discapacidad visual: al procesar imágenes de la cámara de un dispositivo, el modelo puede describir el entorno o leer texto en tiempo real, funcionando en hardware de bajo consumo.
- Moderación de contenido visual: puede analizar imágenes y generar descripciones o alertas basadas en contenido, integrándose en pipelines de moderación en redes sociales.
- Chatbots con soporte de imágenes: en atención al cliente, el modelo puede recibir capturas de pantalla o fotos de productos y responder con instrucciones o soluciones, gracias a su capacidad conversacional multimodal.
- Extracción de información de facturas o recibos: su habilidad para OCR y comprensión de gráficos permite automatizar la captura de datos en aplicaciones de contabilidad o gestión de gastos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de evaluaciones como MMLU, HumanEval, GSM8K o métricas específicas de VLM (por ejemplo, VQAv2, GQA) en la model card ni en los resultados de búsqueda web. Por lo tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada: 7.5 GB según la entrada en LLM Explorer. Esto sugiere que puede ejecutarse en GPUs con al menos 8 GB de memoria, como una NVIDIA RTX 3060 o superior.
- GPU recomendadas: al ser un modelo pequeño (1.34B) y cuantizado a 6 bits, es viable en GPUs consumer de gama media. También está optimizado para Apple Silicon mediante MLX, por lo que puede ejecutarse en Macs con chip M1 o posterior.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de 8 GB o más. Para GPUs con menos VRAM, se podrían usar las variantes GGUF de terceros con cuantizaciones más agresivas (aunque no se especifican los bits).
- Opciones de despliegue: MLX (para Apple Silicon), llama.cpp a través de las variantes GGUF, y potencialmente vLLM o TGI si se adapta al formato Transformers, aunque no se ha confirmado.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño reducido, se espera una latencia baja en hardware adecuado, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría (VLM pequeños para edge). No hay datos de benchmarks ni especificaciones detalladas de modelos comparables en la información proporcionada. Se podría mencionar que modelos como Qwen2.5-VL-3B (el original) o LLaVA-Phi-3-mini son alternativas, pero no se tienen datos de rendimiento para comparar. Por tanto, esta sección queda sin completar.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado ningún análisis de sesgos. Al ser un modelo entrenado probablemente con datos en inglés, puede presentar sesgos culturales o lingüísticos propios de ese idioma.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente en tareas visuales complejas o cuando la imagen es ambigua.
- Limitaciones de contexto: la longitud de contexto no está especificada, por lo que no se conoce su capacidad para manejar diálogos largos o múltiples imágenes. Dado su tamaño reducido, es probable que tenga límites inferiores a modelos más grandes.
- Restricciones de licencia: la licencia del modelo original no está disponible, lo que genera incertidumbre legal para su uso comercial. Aunque las variantes GGUF de terceros indican apache-2.0, no se puede asumir que el modelo base tenga esa licencia. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Soporte de idiomas: solo se confirma el inglés, lo que limita su uso en entornos multilingües.
- Documentación escasa: la model card está vacía, lo que dificulta la reproducibilidad y la comprensión de las capacidades exactas. Los usuarios deben probar el modelo empíricamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Pluto-AI-Labs/Apollo-VL-Edge-3B-MLX-6bit
- Perfil de GitHub de Pluto-AI-Labs: https://github.com/Pluto-AI-Labs
- Organización .github: https://github.com/Pluto-AI-Labs/.github
- Variante GGUF (i1): https://huggingface.co/mradermacher/Apollo-VL-Edge-3B-i1-GGUF
- Variante GGUF: https://huggingface.co/mradermacher/Apollo-VL-Edge-3B-GGUF
- Entrada en LLM Explorer: https://llm-explorer.com/model/Pluto-AI-Labs%2FApollo-VL-Edge-3B,3L5mtC3hkpxLl4GyPd7riU
