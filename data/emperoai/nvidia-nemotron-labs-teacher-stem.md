# EmperoAI/NVIDIA-Nemotron-Labs-Teacher-STEM

## Resumen

NVIDIA-Nemotron-Labs-Teacher-STEM es un modelo de razonamiento general de la familia Nemotron 3 Ultra, desarrollado por NVIDIA y publicado en agosto de 2026. Se trata de un checkpoint especializado en razonamiento multi-paso, obtenido a partir del modelo estudiante Nemotron 3 Ultra (550B-A55B) mediante una ronda adicional de fine-tuning supervisado y aprendizaje por refuerzo centrado en razonamiento. Su propósito principal es servir como modelo profesor dentro del esquema de destilación Multi-Teacher On-Policy Distillation (MOPD), aunque se publica como checkpoint independiente por su fuerte rendimiento en tareas de matemáticas, código, ciencias naturales y humanidades.

El modelo emplea una arquitectura híbrida LatentMixture-of-Experts (LatentMoE) que combina capas Mamba-2, capas MoE y capas de atención selectivas, junto con capas de Multi-Token Prediction (MTP) para acelerar la generación y mejorar la calidad. Tiene 560.524.578.816 parámetros totales (aproximadamente 550B) y 55B parámetros activos, con una ventana de contexto de hasta 1M tokens. Está entrenado con una receta de pre-entrenamiento NVFP4 para maximizar la eficiencia computacional y soporta 10 idiomas según la model card (aunque los tags de HuggingFace listan 12). Su licencia OpenMDW-1.1 permite uso comercial y no comercial.

La relevancia actual de este modelo radica en su doble función: como generador de trazas de razonamiento y datos sintéticos de alta calidad para destilación, y como modelo de razonamiento autónomo que compite con alternativas propietarias como DeepSeek V4 Pro en benchmarks de razonamiento avanzado. Su arquitectura híbrida y su capacidad de contexto largo lo convierten en una opción atractiva para aplicaciones que requieren análisis profundo de documentos extensos y razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE híbrida: Mamba-2 + MoE + Attention, con Multi-Token Prediction (MTP) |
| Parametros totales | 560.524.578.816 (aproximadamente 550B) |
| Parametros activos | 55B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | No especificado en la informacion disponible; los pesos se distribuyen en safetensors (presumiblemente BF16/FP16). El entrenamiento usa receta NVFP4. |
| Idiomas soportados | Segun la model card: ingles, frances, español, italiano, aleman, japones, coreano, hindi, portugues brasileño y chino. Los tags de HuggingFace incluyen ademas arabe y hebreo. |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura LatentMoE híbrida que intercala capas Mamba-2 (modelos de espacio de estados), capas de mezcla de expertos (MoE) y capas de atención selectivas. Esta combinación busca equilibrar eficiencia computacional y capacidad de razonamiento de largo alcance. Además, incorpora capas de Multi-Token Prediction (MTP) que predicen varios tokens futuros simultáneamente, lo que acelera la generación y mejora la calidad del texto producido. El entrenamiento se realizó con una receta de pre-entrenamiento NVFP4 (punto flotante de 4 bits de NVIDIA) para maximizar el rendimiento por vatio y reducir los requisitos de memoria durante el entrenamiento.

El proceso de entrenamiento consta de dos fases principales: un pre-entrenamiento sobre los datasets públicos de NVIDIA (nvidia/nemotron-pre-training-datasets) con corte de datos en septiembre de 2025, y un post-entrenamiento (nvidia/nemotron-post-training-v3) con corte en mayo de 2026. Sobre el modelo estudiante Nemotron 3 Ultra ya post-entrenado, se aplicó una ronda adicional de fine-tuning supervisado y aprendizaje por refuerzo específicamente orientada a mejorar el razonamiento en dominios STEM (matemáticas, código, ciencias naturales, humanidades y ciencias sociales). Este entrenamiento adicional incluye el uso de herramientas como ejecución de código y búsqueda web durante el proceso de razonamiento.

## Capacidades

- Generación de texto con razonamiento multi-paso explícito: el modelo genera primero una traza de razonamiento y después la respuesta final. Este comportamiento se puede configurar mediante el chat template (`enable_thinking=True/False`).
- Razonamiento matemático avanzado: resolución de problemas de álgebra, cálculo, probabilidad y demostraciones formales, con rendimiento destacado en benchmarks como IMOAnswerBench.
- Generación de código: soporta múltiples lenguajes de programación, con capacidad de ejecutar código durante el razonamiento (tool use).
- Conocimiento científico: responde a preguntas de física, química, biología y otras ciencias naturales con nivel de detalle técnico.
- Comprensión de humanidades y ciencias sociales: análisis de textos históricos, filosóficos, sociológicos y económicos.
- Tool calling: integra funciones de ejecución de código y búsqueda en entornos de agente.
- Generación de trazas de razonamiento y datos sintéticos: diseñado específicamente para servir como modelo profesor en destilación, produce razonamientos detallados y verificables.
- Multilingüe: soporta 10 idiomas (o 12 según los tags de HF), incluyendo lenguas con escrituras no latinas como japonés, coreano, hindi, árabe y hebreo.
- Contexto largo: ventana de hasta 1M tokens, adecuada para procesar documentos extensos o conversaciones de muchos turnos.

## Casos de uso

- Destilación de modelos: como modelo profesor, se puede usar para generar trazas de razonamiento de alta calidad que sirvan para entrenar modelos estudiantes más pequeños mediante destilación on-policy o offline. Es el caso de uso principal para el que fue diseñado.
- Tutor inteligente de matemáticas y ciencias: gracias a su razonamiento multi-paso y su capacidad de explicar cada paso, puede descomponer problemas complejos en subproblemas y guiar al usuario hacia la solución, útil en plataformas educativas.
- Asistente de investigación científica: con su contexto de 1M tokens, puede analizar artículos largos, extraer conclusiones y responder preguntas técnicas sobre física, química o biología, integrando búsqueda de literatura.
- Generación de código con ejecución en producción: soporta tool calling y puede ejecutar código en un sandbox para validar soluciones, integrándose en pipelines de CI/CD para revisión automática de código o generación de tests.
- Análisis de documentos legales o financieros: el contexto largo permite procesar contratos extensos o informes anuales completos, extrayendo cláusulas relevantes y respondiendo preguntas sobre su contenido con razonamiento deductivo.
- Agente de razonamiento multi-paso para soporte técnico: puede gestionar consultas complejas que requieren varias etapas de razonamiento, combinando búsqueda en bases de conocimiento y ejecución de scripts para diagnosticar problemas.
- Generación de datos sintéticos para fine-tuning: permite crear datasets etiquetados con razonamientos detallados para entrenar modelos especializados en dominios STEM, reduciendo el coste de anotación manual.

## Benchmarks y rendimiento

La model card indica que el modelo "iguala o supera a DeepSeek V4 Pro (High)" en los benchmarks GPQA, MMLU-Pro, LiveCodeBench v6, IMOAnswerBench y Apex Shortlist. Sin embargo, no se proporcionan valores numéricos concretos en la información disponible. No se pueden presentar tablas de resultados sin datos verificables. Por tanto:

No se han publicado resultados de benchmarks con cifras numéricas en la información disponible. La única afirmación cualitativa es que supera o iguala a DeepSeek V4 Pro en varios benchmarks de razonamiento, según la model card.

## Requisitos de hardware

- Debido a su tamaño (560B parámetros totales), el modelo requiere un clúster multi-GPU con al menos 1 TB de VRAM combinada para cargar los pesos en BF16. En FP8 o cuantizaciones inferiores, la VRAM necesaria se reduce, pero sigue siendo muy superior a la de una GPU de consumo.
- La model card especifica como requisito mínimo: NVIDIA Grace Blackwell (4xGB200), NVIDIA Blackwell (4xB200), NVIDIA Grace Blackwell Ultra (4xGB300), NVIDIA Blackwell Ultra (4xB300) o NVIDIA Hopper (8xH100). Esto implica que no es viable en GPUs de consumo como RTX 4090 o incluso A100 de 80GB individuales.
- Para inferencia, se recomienda usar frameworks como vLLM, TensorRT-LLM o TGI, que soportan modelos MoE con sharding entre GPUs. No se dispone de información sobre latencia o throughput específicos.
- El despliegue en entornos de producción requiere infraestructura de nivel datacenter con interconexión de alta velocidad (NVLink, InfiniBand) para el paralelismo de tensores y de datos.

## Comparativa con modelos similares

La información disponible solo menciona a DeepSeek V4 Pro como competidor directo. No se proporcionan especificaciones de ese modelo (parámetros, contexto, licencia) para hacer una comparación detallada. Se puede indicar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| NVIDIA-Nemotron-Labs-Teacher-STEM | 560B totales (55B activos) | 1M tokens | OpenMDW-1.1 | Modelo profesor de razonamiento STEM |
| DeepSeek V4 Pro (High) | No disponible | No disponible | No disponible | Mencionado como comparación en benchmarks, sin datos concretos |

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (por ejemplo, GPT-5, Claude Opus 4, Gemini 2.5 Pro) en términos de parámetros y rendimiento, ya que la model card no proporciona esos datos.

## Limitaciones y advertencias

- El modelo es extremadamente grande (560B parámetros) y requiere hardware de datacenter de gama alta, lo que limita su uso a organizaciones con infraestructura avanzada.
- Aunque está entrenado para razonar, puede producir alucinaciones en dominios fuera de su conocimiento o cuando el razonamiento es incorrecto. Se recomienda validar las respuestas, especialmente en aplicaciones críticas.
- La ventana de contexto de 1M tokens es teórica; en la práctica, el rendimiento puede degradarse con contextos muy largos y el coste computacional aumenta significativamente.
- La model card no detalla sesgos específicos, pero al estar entrenado con datos web y académicos, puede heredar sesgos presentes en esos datos.
- La licencia OpenMDW-1.1 permite uso comercial y no comercial, pero es una licencia personalizada que conviene revisar detenidamente antes de su uso en producción, especialmente para redistribución o modificación.
- No se proporcionan instrucciones claras sobre el formato de cuantización de los pesos publicados; los safetensors podrían estar en BF16, lo que implica un tamaño de archivo de aproximadamente 1,1 TB (coincide con el tamaño del repo de 1121 GB).
- El modelo está diseñado para generar trazas de razonamiento; si se desactiva el modo thinking, la calidad puede verse reducida en tareas complejas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/EmperoAI/NVIDIA-Nemotron-Labs-Teacher-STEM)
- [Paper técnico de Nemotron 3 Ultra](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf)
- [Colección de datasets de pre-entrenamiento](https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets)
- [Colección de datasets de post-entrenamiento](https://huggingface.co/collections/nvidia/nemotron-post-training-v3)
- [Página de desarrollador de Nemotron](https://developer.nvidia.com/nemotron)
- [Licencia OpenMDW-1.1](https://openmdw.ai/license/1-1/)
- [Servidor Discord de NVIDIA AI Developer](https://discord.gg/9xpKQtVvrk)
