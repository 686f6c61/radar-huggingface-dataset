# Kai9987kai/supermix-v74

## Resumen

Supermix v74 es un modelo de investigación de 8,6 millones de parámetros desarrollado por Kai9987kai (Kai piper) que resuelve problemas aritméticos expresados en texto, mostrando el proceso de razonamiento paso a paso. Está diseñado específicamente para tareas de aritmética y resolución de problemas, no como un modelo de chat general. El modelo emplea una arquitectura híbrida con atención de ventana deslizante/global, mezcla de expertos (MoE) y un núcleo de pensamiento recursivo, con una ventana de contexto de 128 tokens. Su relevancia radica en que es un experimento de investigación sobre cómo arquitecturas pequeñas y eficientes pueden alcanzar precisión en dominios acotados, aunque con limitaciones claras en cuanto a generalización y formato de entrada.

El modelo fue entrenado durante 18.000 pasos con un programador OneCycle, y alcanza una puntuación de 0.894 en un benchmark propio de diez tipos de tareas. Sin embargo, la model card advierte explícitamente que esta puntuación está inflada por la inclusión de cuatro tareas nuevas que el modelo encuentra fáciles, y que en comparación con la versión anterior sobre las mismas cinco tareas la mejora es marginal (0.818 vs 0.756). Además, presenta una regresión significativa en la tarea de aritmética simple (0.99 → 0.89). El modelo no es apto para conversación: produce respuestas verbatim de su entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención sliding-window/global, MoE sparse (32 expertos, top-2), núcleo de pensamiento recursivo, cabeza multi-token prediction |
| Parametros totales | 8.575.977 |
| Parametros activos | 2.810.973 (MoE) |
| Longitud de contexto | 128 tokens (empaquetado alineado por turno) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (model card no especifica, aunque los ejemplos están en inglés) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

Supermix v74 emplea una arquitectura híbrida que combina atención con ventana deslizante y atención global, junto con una capa feed-forward de mezcla de expertos (MoE) con 32 expertos enrutados y top-2 activos por token. Incluye además un núcleo de pensamiento recursivo y una cabeza de predicción multi-token que permite decodificación especulativa para acelerar la generación. La tokenización es a nivel de dígito para los números, lo que permite representar números no vistos durante el entrenamiento, algo que una tokenización a nivel de palabra no podría lograr.

El entrenamiento se realizó durante 18.000 pasos con un scheduler OneCycle y se seleccionó en función de la precisión en un conjunto de validación (probe 0.89). La pérdida de desarrollo final fue de 0.0651. Para evaluar la generalización, se retiraron oraciones completas del entrenamiento (tier1: respuesta vista, tier2: respuesta no vista, tier3: oración no vista) y se midieron las pérdidas y perplejidades por nivel. El cociente de perplejidad entre tier3 y tier1 es 1.008x, lo que indica que el modelo generaliza bien a oraciones nuevas en su dominio.

## Capacidades

- Resolución de problemas aritméticos paso a paso: suma, resta, multiplicación, división, porcentajes, problemas de dos pasos, promedios, secuencias, álgebra de un paso y problemas de palabras.
- Generación de razonamiento explícito (p. ej., "40 x 6 = 240, 7 x 6 = 42, total 282").
- Verificación de respuestas mediante un módulo auxiliar (`answer_check.py`) que re-deriva el resultado de la pregunta y devuelve `None` si no puede verificar.
- **No** soporta conversación general: las respuestas conversacionales son reproducidas verbatim del entrenamiento (tasa verbatim de 1.0 en sondas de diálogo).
- **No** soporta tool calling, agentes ni razonamiento multi-paso más allá de las tareas entrenadas.
- **No** tiene capacidades multimodales (visión, audio).
- El formato de prompt es crítico: el modelo solo funciona correctamente con un formato normalizado específico; variaciones como cambiar el operador (`x` → `times` o `*`) o eliminar la frase de introducción hacen que falle.
- Incluye un normalizador de prompts (`src/prompt_normaliser.py`) que convierte preguntas en lenguaje natural al formato entrenado.

## Casos de uso

- **Evaluación de arquitecturas MoE en tareas acotadas**: sirve como banco de pruebas para estudiar cómo se comporta un MoE de 8,6 M de parámetros en razonamiento aritmético, útil para investigadores que comparan diseños de mezcla de expertos.
- **Generación de datos sintéticos de problemas aritméticos**: el modelo puede producir soluciones paso a paso para problemas de los tipos entrenados, que pueden usarse para aumentar datasets de entrenamiento de modelos más grandes.
- **Componente de verificación en sistemas de tutoría matemática**: aunque no es un chat, su módulo `answer_check.py` puede integrarse como un verificador de respuestas en una aplicación educativa, siempre que las preguntas se normalicen al formato correcto.
- **Estudio de sensibilidad al formato de prompt**: sirve como caso de estudio para documentar cómo la elección del operador y la frase de introducción afectan drásticamente la precisión, lo que es relevante para diseñar interfaces de usuario.
- **Pruebas de decodificación especulativa**: su cabeza multi-token permite experimentos con autodecodificación especulativa en un modelo pequeño, útil para investigar técnicas de aceleración.
- **Investigación sobre generalización compositiva**: el diseño de retención de oraciones completas permite estudiar la capacidad de un modelo pequeño para generalizar a nuevas combinaciones de elementos, como se refleja en las perplejidades por niveles.

## Benchmarks y rendimiento

El modelo se evalúa en un benchmark propio de resolución de problemas con diez tipos de tareas. Los resultados se comparan con la versión anterior (v73) en la tabla siguiente. Los problemas se generan frescos en el momento de la evaluación, por lo que son problemas novedosos.

| Tarea | v74 | v73 (anterior) |
|---|---|---|
| division | 1.00 | — |
| multiplication | 1.00 | — |
| sequence | 0.98 | — |
| two_step | 0.98 | — |
| word_problem | 0.96 | 0.99 |
| algebra_one_step | 0.89 | 0.94 |
| arithmetic | 0.89 | 0.99 |
| percent | 0.75 | 0.70 |
| average | 0.59 | 0.16 |

Puntuación global: **0.894 (447/500)** vs 0.756 de v73, con z=5.74. Sin embargo, la puntuación está inflada por las cuatro tareas nuevas que el modelo encuentra fáciles. En las cinco tareas comunes a ambas versiones, el resultado es 0.818 vs 0.756 (z=1.99), una mejora marginal. La tarea `arithmetic` regresó significativamente de 0.99 a 0.89 (z=−2.81). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: El modelo tiene 8,6 M de parámetros, por lo que ocupa aproximadamente 34 MB en FP32. Cabe en cualquier dispositivo, incluso en un microcontrolador con memoria suficiente.
- **GPU recomendada**: No se requiere GPU; la ejecución en CPU es suficiente. El modelo puede ejecutarse en una Raspberry Pi o un portátil antiguo.
- **Cabe en consumer GPU**: Sí, en cualquier GPU con más de 1 GB de VRAM.
- **Opciones de despliegue**: Se usa directamente con PyTorch (`load_talk_checkpoint` y `generate_reply`). No hay soporte para vLLM, llama.cpp, Ollama o TGI en la documentación.
- **Latencia**: La model card indica que una respuesta tarda "bien menos de un segundo" en CPU.

## Comparativa con modelos similares

No hay disponibles modelos comparables de la misma categoría (MoE de menos de 10 M de parámetros especializado en aritmética). Los modelos generales como GPT-3.5 o Llama-2 son varios órdenes de magnitud más grandes y no son comparables. En el contexto de investigación, podría compararse con otros modelos de razonamiento matemático de tamaño pequeño, pero no se dispone de datos. Se indica que la comparativa con modelos similares **no está disponible**.

## Limitaciones y advertencias

- **No es un modelo de chat**: cualquier respuesta conversacional es una reproducción verbatim de los datos de entrenamiento. La tasa de verbatim en diálogo es 1.0. No debe usarse en aplicaciones de conversación.
- **Formato de prompt crítico**: El modelo solo funciona correctamente con el formato normalizado (p. ej., "What is 25 x 7?"). Cambiar el operador (`x` por `times` o `*`) o eliminar la frase de introducción provoca errores. El ajustador `prompt_normaliser.py` puede convertir lenguaje natural, pero no es infalible y no mejora la precisión en preguntas que el modelo falla en el formato entrenado.
- **Regresión en tarea de aritmética**: la precisión en la tarea `arithmetic` (sumas/restas simples) descendió de 0.99 a 0.89 con la versión v74, un cambio estadísticamente significativo.
- **Contexto limitado**: la ventana de 128 tokens restringe el tipo de problemas que puede resolver (no apto para problemas de varias partes o de largo texto).
- **Licencia no especificada**: no se indica licencia, lo que implica incertidumbre para uso comercial o derivación.
- **Riesgo de alucinación**: aunque el modelo es preciso en las tareas entrenadas, no se ha evaluado en dominios fuera de su distribución; en el formato natural falla con frecuencia.
- **Sin soporte para producción**: es un modelo de investigación, no diseñado para integración en sistemas de producción sin adaptación adicional.

## Enlaces

- HuggingFace: https://huggingface.co/Kai9987kai/supermix-v74
- GitHub (monorepo Supermix): https://github.com/kai9987kai/Supermix
- Perfil de HuggingFace del autor: https://huggingface.co/Kai9987kai
- Dataset de modelos: https://huggingface.co/datasets/Kai9987kai/supermix-model-zoo
