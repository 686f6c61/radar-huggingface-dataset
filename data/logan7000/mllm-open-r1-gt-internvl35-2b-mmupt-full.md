# logan7000/mllm-open-r1-gt-internvl35-2b-mmupt-full

## Resumen

El modelo `logan7000/mllm-open-r1-gt-internvl35-2b-mmupt-full` es un modelo multimodal de razonamiento visual basado en la arquitectura InternVL3.5-2B, desarrollado por el usuario logan7000. Se trata de un modelo entrenado mediante aprendizaje por refuerzo (RL) con el algoritmo GRPO (Group Relative Policy Optimization) sobre un conjunto de datos de razonamiento matemático visual denominado mmupt, siguiendo una receta experimental del proyecto OpenR1. El objetivo es mejorar la capacidad del modelo para resolver problemas matemáticos que requieren comprensión de imágenes, como gráficos, diagramas o expresiones escritas a mano.

El modelo se publica como un checkpoint completo (full) de 9,4 GB en formato safetensors, con dos versiones: un checkpoint intermedio seleccionado por validación (best) y un checkpoint final tras una época de entrenamiento (endpoint). Aunque no se especifican la licencia ni los idiomas soportados, su naturaleza multimodal y su tamaño compacto (2B parámetros) lo hacen relevante para entornos con recursos limitados que necesiten capacidades de razonamiento visual. La fecha de creación (septiembre de 2026) sugiere que es un modelo reciente dentro del ecosistema de investigación abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVL3.5 (multimodal, vision + lenguaje) |
| Parametros totales | no disponible (el nombre sugiere 2B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en InternVL3.5, una familia de modelos multimodales que combina un codificador visual con un modelo de lenguaje de gran escala. En este caso, el componente de lenguaje tiene aproximadamente 2B parámetros, lo que lo sitúa en la gama de modelos pequeños. El entrenamiento se realizó mediante un pipeline de RL con GRPO, una variante de optimización de políticas que utiliza recompensas basadas en reglas y un juez automático (Qwen2.5-32B) para evaluar las respuestas. La receta (recipe) especifica hiperparámetros concretos: K=10 (número de muestras por prompt), temperatura 0.7, cap de tokens 2048, tasa de aprendizaje 1e-6, weight decay 0.01, grad norm 1.0, y una técnica denominada "bnpo" (posiblemente una variante de normalización de recompensas). El entrenamiento se realizó en GPUs A100 en la Universidad Johns Hopkins (JHU) durante septiembre de 2026, con una duración de una época (640 pasos). La métrica de validación principal fue MathVista-150, un benchmark de razonamiento matemático visual.

## Capacidades

- Razonamiento matemático visual: resuelve problemas que requieren interpretar imágenes, como gráficos, diagramas, expresiones matemáticas escritas a mano o figuras geométricas.
- Comprensión multimodal: procesa entradas de imagen y texto simultáneamente, generando respuestas textuales.
- Generación de texto: produce explicaciones paso a paso y razonamientos en lenguaje natural.
- Entrenamiento con RL: optimizado para seguir instrucciones y producir respuestas con formato de caja (boxed) para facilitar la evaluación automática.
- No se dispone de información sobre tool calling, agentes, ni capacidades multilingües específicas.

## Casos de uso

- Asistente educativo para matemáticas: el modelo puede analizar fotografías de problemas matemáticos (por ejemplo, de un libro de texto) y proporcionar soluciones razonadas, útil en aplicaciones de tutoría automatizada.
- Análisis de gráficos y tablas: dado un gráfico de barras o líneas, el modelo puede extraer tendencias y responder preguntas cuantitativas sobre los datos representados.
- Verificación de exámenes escritos a mano: al recibir una imagen de una solución manuscrita, el modelo puede evaluar si el procedimiento y el resultado son correctos, ayudando en la corrección automatizada.
- Generación de problemas de práctica: a partir de una imagen de ejemplo, el modelo puede crear variantes de problemas matemáticos con diferentes valores numéricos.
- Integración en pipelines de razonamiento visual: puede usarse como componente en sistemas que necesiten interpretar diagramas técnicos o esquemas, por ejemplo en documentación de ingeniería.
- Investigación en RL multimodal: al ser un checkpoint abierto con receta detallada, sirve como base para experimentos de aprendizaje por refuerzo en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la selección del mejor checkpoint se realizó con MathVista-150, pero no se proporcionan las puntuaciones obtenidas. Tampoco hay comparaciones con otros modelos en la documentación.

## Requisitos de hardware

- El tamaño del repositorio es de 9,4 GB, lo que sugiere que los pesos en BF16 ocupan aproximadamente 4-5 GB (para 2B parámetros), más espacio para el codificador visual y otros componentes.
- Se estima que la inferencia en BF16 requiere al menos 8 GB de VRAM, por lo que es viable en GPUs consumer como RTX 3070/3080/3090 o RTX 4070/4080/4090.
- Con cuantización a 8 bits o 4 bits (si estuviera disponible), podría ejecutarse en GPUs con 4-6 GB de VRAM, como RTX 3060 o RTX 4060.
- Opciones de despliegue: al ser un modelo safetensors, puede cargarse con bibliotecas como Transformers, vLLM o TGI, aunque no se confirma compatibilidad específica. Para despliegue en CPU, se necesitaría convertir a GGUF, lo cual no está disponible actualmente.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. Sin embargo, por su tamaño y naturaleza multimodal, se puede situar en la misma categoría que otros modelos pequeños de visión-lenguaje como Qwen2.5-VL-3B o InternVL2.5-2B. La diferencia principal es que este modelo ha sido específicamente entrenado con RL para razonamiento matemático visual, lo que podría darle ventaja en tareas de ese dominio, pero no hay datos que lo confirmen.

## Limitaciones y advertencias

- No se especifica licencia, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar al autor antes de utilizarlo en producción.
- Al ser un modelo de 2B parámetros, su capacidad de razonamiento complejo es limitada en comparación con modelos más grandes; puede fallar en problemas que requieran múltiples pasos o abstracción avanzada.
- No se dispone de información sobre sesgos o alucinaciones, pero como todo modelo multimodal, puede generar respuestas incorrectas cuando la imagen es ambigua o de baja calidad.
- El entrenamiento se centró en un dominio específico (matemáticas visuales), por lo que su rendimiento en otras tareas multimodales generales podría ser inferior al de modelos base sin fine-tuning.
- La ausencia de cuantizaciones precalculadas y de soporte para formatos como GGUF limita su despliegue en entornos de CPU o edge.
- No hay garantía de soporte o mantenimiento por parte del autor, dado que es un proyecto de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logan7000/mllm-open-r1-gt-internvl35-2b-mmupt-full
- Repositorio de InternVL (OpenGVLab): https://github.com/OpenGVLab/InternVL
- Proyecto mllm (no relacionado directamente, pero aparece en búsquedas): https://github.com/UbiquitousLearning/mllm
