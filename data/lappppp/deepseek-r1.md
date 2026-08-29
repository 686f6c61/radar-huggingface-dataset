# lappppp/DeepSeek-R1

## Resumen

DeepSeek-R1 es el primer modelo de razonamiento de la serie R1 desarrollado por DeepSeek AI, presentado en enero de 2025. Se trata de un modelo de lenguaje de gran tamaño diseñado para resolver problemas complejos de matemáticas, código y razonamiento lógico mediante cadenas de pensamiento (chain-of-thought) extensas y auto-verificación. El modelo se entrenó aplicando aprendizaje por refuerzo (RL) a gran escala directamente sobre el modelo base, sin una etapa previa de ajuste supervisado (SFT), lo que permitió que emergieran capacidades de razonamiento de forma natural. DeepSeek-R1 alcanza un rendimiento comparable al de OpenAI o1 en tareas de matemáticas, código y razonamiento, según el paper oficial.

El repositorio analizado (lappppp/DeepSeek-R1) es una copia del modelo original publicada por un tercero, con pesos en formato safetensors y una licencia MIT. Incluye 684.489.845.504 parámetros totales y un tamaño de 688,6 GB, lo que lo convierte en un modelo de enormes dimensiones, pensado para despliegue en infraestructuras de múltiples GPUs. La etiqueta `deepseek_v3` sugiere que la arquitectura está basada en DeepSeek-V3, un modelo de mezcla de expertos (MoE), aunque no se confirma explícitamente en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `deepseek_v3` sugiere MoE) |
| Parametros totales | 684.489.845.504 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (según etiqueta) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el proceso de entrenamiento de DeepSeek-R1 en dos variantes: DeepSeek-R1-Zero, entrenado únicamente con RL a gran escala sin SFT previo, y DeepSeek-R1, que incorpora datos de "cold-start" (arranque en frío) antes de la fase de RL para mejorar la legibilidad y evitar problemas como la repetición o la mezcla de idiomas. El pipeline completo incluye dos etapas de RL (para descubrir patrones de razonamiento y alinear con preferencias humanas) y dos etapas de SFT (para sembrar capacidades de razonamiento y no razonamiento). No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni la arquitectura exacta (número de capas, atención, etc.). La etiqueta `deepseek_v3` apunta a que el modelo hereda la arquitectura de DeepSeek-V3, que es un MoE, pero este dato no está confirmado en la información proporcionada.

## Capacidades

- Razonamiento avanzado: resuelve problemas complejos de matemáticas, lógica y ciencia mediante cadenas de pensamiento largas y auto-verificación.
- Generación de código: competente en tareas de programación y depuración, según el paper.
- Comprensión y generación de texto en múltiples idiomas (aunque no se especifican cuáles).
- Capacidad de reflexión y autocrítica: el modelo puede revisar sus propias respuestas y corregir errores.
- Destilación: los patrones de razonamiento del modelo se pueden destilar en modelos más pequeños, como se demuestra con las versiones destiladas de 1.5B a 70B.

No se mencionan capacidades específicas de tool calling, función calling, agentes o visión en la información disponible.

## Casos de uso

- Resolución de problemas matemáticos avanzados: el modelo puede abordar demostraciones, cálculo simbólico y problemas de competición, generando soluciones paso a paso con verificación interna.
- Generación y revisión de código: útil para crear algoritmos complejos, optimizar implementaciones y depurar errores lógicos en proyectos de software.
- Investigación científica: asistencia en la formulación de hipótesis, análisis de literatura y razonamiento deductivo en dominios técnicos.
- Educación y tutoría: explicación de conceptos difíciles con razonamiento detallado, útil para estudiantes de niveles avanzados.
- Análisis de datos y razonamiento estadístico: interpretación de resultados, diseño de experimentos y extracción de conclusiones a partir de datos.
- Desarrollo de agentes de razonamiento: como base para sistemas que requieren planificación multi-paso y toma de decisiones compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen con gráficos comparativos, pero los valores numéricos no son accesibles en el texto. El paper original de DeepSeek-R1 reporta resultados en MMLU, HumanEval, GSM8K y otros, pero no se han incluido en la información proporcionada.

## Requisitos de hardware

- El modelo tiene 684.489.845.504 parámetros, por lo que en FP8 ocuparía aproximadamente 684 GB de memoria. Se necesitan múltiples GPUs de alta gama (por ejemplo, 8× H100 de 80 GB) para inferencia en precisión FP8.
- No es viable en GPUs de consumo (RTX 4090, etc.) sin cuantizaciones extremas que degradarían significativamente la calidad.
- Para despliegue se recomienda usar frameworks como vLLM, TensorRT-LLM o TGI, que soportan modelos MoE y FP8.
- No se dispone de datos de latencia o throughput en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos cuantitativos en la información proporcionada. El paper original indica que DeepSeek-R1 es comparable a OpenAI o1 en tareas de matemáticas, código y razonamiento, pero no se incluyen cifras concretas. Tampoco se aportan comparaciones con otros modelos de razonamiento open source como Qwen o Llama.

## Limitaciones y advertencias

- El tamaño del modelo (684B parámetros) hace que su despliegue local sea extremadamente costoso y requiera infraestructura especializada.
- La model card menciona problemas en DeepSeek-R1-Zero como repetición, legibilidad pobre y mezcla de idiomas; aunque DeepSeek-R1 los mitiga, pueden persistir en algunos casos.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificación de casos de uso.
- La licencia MIT permite uso comercial, pero el repositorio analizado es una copia de un tercero; conviene verificar la autenticidad y procedencia de los pesos.
- No se han publicado resultados de benchmarks en la información disponible, por lo que no se puede validar el rendimiento real en esta copia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lappppp/DeepSeek-R1
- Modelo original de DeepSeek en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-R1
- Repositorio oficial en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
- Página oficial de DeepSeek: https://deepseek.com/en/index.html
- Paper en ArXiv: https://arxiv.org/abs/2501.12948 (referenciado en la etiqueta `arxiv:2501.12948`)
