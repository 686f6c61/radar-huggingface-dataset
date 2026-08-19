# nvidia/NVIDIA-Nemotron-Labs-Teacher-General-Reasoning

## Resumen

NVIDIA-Nemotron-Labs-Teacher-General-Reasoning es un modelo de razonamiento de largo horizonte desarrollado por NVIDIA, perteneciente a la familia Nemotron 3 Ultra. Está diseñado específicamente para generar trazas de razonamiento extensas y de alta calidad en problemas complejos de matemáticas, lógica y razonamiento abstracto. Su función principal dentro del ecosistema Nemotron es servir como modelo profesor en el proceso de destilación Multi-Teacher On-Policy Distillation (MOPD), aunque también se publica como checkpoint independiente por su capacidad razonadora propia.

El modelo emplea una arquitectura híbrida Latent Mixture-of-Experts (LatentMoE) que combina capas Mamba-2, MoE y Attention, con Multi-Token Prediction (MTP) para acelerar la generación. Tiene 550 mil millones de parámetros totales, de los cuales 55 mil millones están activos por token, y soporta una ventana de contexto de hasta 1 millón de tokens. Está entrenado con una receta de pre-entrenamiento NVFP4 para maximizar la eficiencia computacional. Su licencia OpenMDW-1.1 permite uso comercial y no comercial, lo que lo hace relevante para equipos que necesitan un modelo de razonamiento de alto nivel con pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE (Mamba-2 + MoE + Attention) con Multi-Token Prediction |
| Parametros totales | 550B (560.524.578.816 en safetensors) |
| Parametros activos | 55B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | No disponible (se menciona NVFP4 para pre-entrenamiento, pero no cuantizaciones de inferencia) |
| Idiomas soportados | Inglés, francés, español, italiano, alemán, japonés, hindi, coreano, portugués brasileño y chino |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura híbrida LatentMoE que intercala capas Mamba-2 (modelos de espacio de estado) con capas de mezcla de expertos (MoE) y capas de atención selectivas. Esta combinación busca equilibrar eficiencia computacional y capacidad de modelado de dependencias de largo alcance. Además, incorpora capas de Multi-Token Prediction (MTP) que permiten predecir varios tokens a la vez, mejorando la velocidad de generación y la calidad de las respuestas.

El entrenamiento se realizó en dos fases: pre-entrenamiento con datos hasta septiembre de 2025 y post-entrenamiento con datos hasta mayo de 2026. El post-entrenamiento incluye una ronda adicional de fine-tuning supervisado intensivo en razonamiento y aprendizaje por refuerzo, específicamente orientado a producir trazas de razonamiento largas y coherentes. El modelo se entrenó con la receta NVFP4, que utiliza precisión de 4 bits para el pre-entrenamiento, reduciendo el coste computacional sin sacrificar rendimiento. No se especifican detalles sobre el volumen total de tokens de entrenamiento ni la composición exacta del dataset, aunque se mencionan los datasets públicos `nvidia/nemotron-post-training-v3` y `nvidia/nemotron-pre-training-datasets`.

## Capacidades

- Generación de trazas de razonamiento extensas y estructuradas para problemas de matemáticas, lógica y razonamiento abstracto.
- Razonamiento multi-paso con capacidad de mantener coherencia a lo largo de secuencias largas (hasta 1M tokens de contexto).
- Modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking=True/False`), permitiendo activar o desactivar la generación de la cadena de pensamiento.
- Soporte multilingüe en 10 idiomas principales, incluyendo lenguas europeas y asiáticas.
- Capacidad de servir como modelo profesor para destilación de conocimiento hacia modelos más pequeños.
- Generación de datos sintéticos de razonamiento para entrenamiento de otros modelos.

## Casos de uso

- Destilación de modelos de razonamiento: el modelo puede generar trazas de razonamiento de alta calidad que se utilizan para entrenar modelos estudiantes más pequeños mediante MOPD, reduciendo el coste de inferencia en producción.
- Generación de datasets sintéticos de razonamiento: se puede emplear para crear conjuntos de datos etiquetados con cadenas de pensamiento detalladas, útiles para fine-tuning de modelos especializados en tareas de matemáticas o lógica.
- Resolución de problemas matemáticos avanzados: su capacidad de razonamiento multi-paso lo hace adecuado para tareas como demostraciones de teoremas, cálculo simbólico o resolución de problemas de competición.
- Análisis lógico y verificación de argumentos: puede descomponer argumentos complejos en pasos lógicos y evaluar su validez, útil en entornos de investigación o legal.
- Agentes de razonamiento de largo horizonte: con su contexto de 1M tokens, puede mantener estados de razonamiento prolongados en tareas que requieren múltiples iteraciones, como planificación o diagnóstico.
- Investigación en IA: sirve como referencia para estudiar arquitecturas híbridas (Mamba-2 + MoE + Attention) y técnicas de destilación multi-profesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen `accuracy_plot.png` que no ha sido accesible, por lo que no se pueden presentar datos numéricos de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible, pero dado el tamaño de 550B parámetros y el formato safetensors (1121 GB), se requiere hardware de datacenter de alta gama.
- GPUs recomendadas según la model card: mínimo 4xGB200 (Grace Blackwell), 4xB200 (Blackwell), 4xGB300 (Grace Blackwell Ultra), 4xB300 (Blackwell Ultra) u 8xH100 (Hopper).
- No es viable en GPUs de consumo (RTX 4090, etc.) debido a los requisitos de memoria y cómputo.
- Opciones de despliegue: no se especifican en la documentación, pero al ser un modelo de transformers, podría usarse con vLLM, TGI o frameworks similares, aunque requeriría nodos multi-GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que es un modelo de razonamiento de 550B con arquitectura híbrida, no hay datos suficientes para establecer una comparativa objetiva con alternativas como GPT-4, Claude o DeepSeek-R1 sin fuentes adicionales.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos hasta 2025/2026, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación en tareas de conocimiento factual, ya que está optimizado para razonamiento y no para recuperación de información actualizada.
- La ventana de contexto de 1M tokens es teórica; en la práctica, el rendimiento puede degradarse con secuencias muy largas y el coste computacional es elevado.
- La licencia OpenMDW-1.1 permite uso comercial, pero es necesario revisar los términos específicos, especialmente en lo relativo a redistribución y responsabilidad.
- El modelo requiere hardware de datacenter muy específico (mínimo 4xGB200 o 8xH100), lo que limita su despliegue a entornos con infraestructura avanzada.
- No se proporcionan cuantizaciones oficiales para inferencia, lo que puede dificultar su uso en entornos con recursos limitados.

## Enlaces

- [HuggingFace - NVIDIA-Nemotron-Labs-Teacher-General-Reasoning](https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Teacher-General-Reasoning)
- [Technical Report (PDF)](https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf)
- [Página de Nemotron de NVIDIA](https://developer.nvidia.com/nemotron)
- [Colección de datasets de pre-entrenamiento](https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets)
- [Colección de datasets de post-entrenamiento](https://huggingface.co/collections/nvidia/nemotron-post-training-v3)
- [Licencia OpenMDW-1.1](https://openmdw.ai/license/1-1/)
