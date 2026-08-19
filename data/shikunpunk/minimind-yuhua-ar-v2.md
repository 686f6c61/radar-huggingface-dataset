# shikunpunk/MiniMind-YuHua-AR-v2

## Resumen

MiniMind-YuHua-AR-v2 es un modelo de lenguaje de 104 millones de parámetros desarrollado por shikunpunk, diseñado específicamente para generar texto narrativo en el estilo del escritor chino Yu Hua. Es la segunda versión de un experimento técnico que parte del proyecto MiniMind, una colección de implementaciones de modelos de lenguaje de pequeño tamaño entrenados desde cero con PyTorch puro. El modelo se entrena exclusivamente con los 13 libros completos de Yu Hua, divididos en 18 793 segmentos, sin ningún tipo de transferencia de aprendizaje, y posteriormente se afina con un conjunto de datos de CoT (cadena de pensamiento) de 826 ejemplos con plantillas de preguntas generales.

La principal motivación de esta versión es corregir los problemas de la V1, que utilizaba pesos preentrenados de poesía de Gu Cheng y sufrió una grave contaminación de estilo con la aparición no deseada de personajes específicos de las novelas de Yu Hua. La V2 elimina este problema filtrando 2 222 segmentos que contenían personajes con nombre propio y rediseñando la plantilla de CoT para que no aparezcan títulos o capítulos concretos. El modelo está disponible en Hugging Face con un tamaño de repositorio de 0,3 GB y se puede cargar con la clase `MiniMindForCausalLM` para generar texto mediante el script `gen_yuhua_compare.py`.

La relevancia de este modelo reside en su enfoque experimental: demuestra que es posible entrenar desde cero un modelo de 104M con un corpus literario limitado y obtener un generador de estilo narrativo coherente. Aunque el resultado no es comparable a los grandes modelos generalistas, sirve como caso de estudio para la generación de texto estilizado, la evaluación de la influencia del preentrenamiento y la prevención de fugas de información en datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (AR) basado en MiniMind |
| Parámetros totales | 104 millones |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Chino (principalmente) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (config + tokenizer + pesos) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura autoregresiva estándar de MiniMind, una implementación de Transformer de tamaño reducido diseñada para entrenarse desde cero en horas. No utiliza una arquitectura MoE ni mecanismos de atención lineal; es un Transformer causal clásico con 104 millones de parámetros. El entrenamiento se realiza en dos fases: primero, un preentrenamiento de 3 épocas sobre los 13 libros de Yu Hua (18 793 segmentos), y después un fine-tuning con SFT (supervised fine-tuning) de 5 épocas sobre un conjunto de 826 preguntas de CoT con plantilla genérica. En total se ejecutan 3 épocas de preentrenamiento y 5 de SFT.

La principal innovación técnica de la V2 es la estrategia de limpieza de datos: se filtran 2 222 segmentos que contienen nombres de personajes concretos de las obras de Yu Hua para evitar que el modelo los reproduzca de forma no deseada. Además, la plantilla de CoT se rediseña para que las preguntas sean genéricas (por ejemplo, "escribe un fragmento al estilo de Yu Hua") y no mencionen títulos ni capítulos específicos, reduciendo así el riesgo de fuga de información. El modelo se entrena sin ningún tipo de aprendizaje por transferencia, partiendo de pesos aleatorios, lo que permite evaluar la capacidad del corpus de Yu Hua por sí solo para enseñar a un modelo de 104M a generar texto narrativo en ese estilo.

## Capacidades

- Generación de texto narrativo en estilo Yu Hua: produce fragmentos de prosa con tono, ritmo y ambientación característicos del escritor.
- Razonamiento básico de estilo: gracias al SFT con CoT, puede generar respuestas que siguen la plantilla de instrucciones y aplicar el estilo a temas variados.
- Generación de código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (principalmente chino).
- Capacidades especiales: no incluye visión ni audio. El modelo es exclusivamente textual.

## Casos de uso

- **Creación de contenido literario**: el modelo puede generar fragmentos de prosa narrativa con el estilo de Yu Hua, útil para escritores que quieran explorar variaciones sobre el tono del autor o para estudios literarios que analicen patrones estilísticos.
- **Herramientas de escritura asistida**: se puede integrar en aplicaciones de escritura creativa para sugerir continuaciones de textos en un estilo concreto, ofreciendo a los usuarios una herramienta de inspiración para sus propias obras.
- **Análisis estilístico**: al estar entrenado exclusivamente con el corpus de Yu Hua, el modelo puede servir como referencia para comparar qué tan fiel es un texto generado al estilo del autor, facilitando la evaluación automática de similitud estilística.
- **Experimentos educativos sobre modelos pequeños**: es un ejemplo práctico para enseñar a estudiantes cómo un modelo de 104M de parámetros puede aprender un dominio específico con un corpus limitado, y cómo la limpieza de datos afecta la calidad de la generación.
- **Investigación en generación de texto con CoT**: el modelo se puede utilizar para estudiar cómo el SFT con CoT afecta la calidad de la generación de texto estilizado, y para comparar los resultados con los de los modelos AR, Linear y dLM del mismo proyecto.
- **Pruebas de robustez de datos**: al ser un modelo de dominio único, se puede usar para evaluar la capacidad de un modelo de pequeño tamaño para captar y reproducir patrones estilísticos sin la influencia de datos generales, lo que sirve para el diseño de datasets de dominio específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta una métrica interna de "tasa de paso" (porcentaje de generaciones que no presentan fugas de personajes) para la V2:

| Métrica | V1 | V2 |
|---|---|---|
| Tasa de paso (sin fugas de personajes) | 100% | 86% (AR) |
| Tasa de paso (sin fugas de personajes) | - | 16% (dLM) |
| Tasa de paso (sin fugas de personajes) | - | 100% (Linear) |

La tasa de paso del AR V2 es inferior a la de V1, pero el autor indica que el V1 tenía una contaminación de estilo severa que se ha corregido en V2. La tasa del 86% se debe a que 3 épocas de preentrenamiento con el corpus de Yu Hua no son suficientes para que el modelo de 104M aprenda la base del chino correctamente, lo que produce algunos nombres propios ilegibles en las generaciones.

## Requisitos de hardware

- **VRAM estimada**: al tener 104 millones de parámetros, el modelo es extremadamente ligero. En FP32, el peso ocupa aproximadamente 0,4 GB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM. En cuantización de 8 bits, el uso de VRAM sería inferior a 0,2 GB.
- **GPU recomendadas**: cualquier GPU moderna, incluidas las integradas de portátiles con al menos 2 GB de VRAM, es suficiente. No se requieren GPUs de centro de datos.
- **Compatibilidad con GPU de consumo**: sí, es compatible con cualquier GPU de consumo actual, incluyendo GTX 1650, RTX 3060, etc.
- **Opciones de despliegue**: dado el formato de pesos (safetensors) y la arquitectura MiniMind, se puede cargar con la librería de MiniMind en Python. No se menciona compatibilidad con vLLM, Ollama o llama.cpp, aunque al ser un modelo Transformer pequeño, es probable que se pueda convertir a GGUF y usarlo con llama.cpp si se dispone de la conversión adecuada.
- **Latencia y rendimiento**: no se ha publicado información específica de latencia o throughput. Dado el tamaño, la inferencia en una GPU moderna sería de decenas de tokens por segundo en Python puro.

## Comparativa con modelos similares

No se dispone de una comparativa directa con modelos de la misma categoría (generadores de estilo literario). Sin embargo, se puede comparar con otros modelos de MiniMind del mismo proyecto:

| Modelo | Parámetros | Contexto | Entrenamiento | Tasa de paso (sin fugas) |
|---|---|---|---|---|
| MiniMind-YuHua-AR-v2 | 104M | No disponible | Preentrenamiento 3 épocas + SFT CoT 5 épocas | 86% |
| MiniMind-YuHua-Linear-v2 | 104M | No disponible | Preentrenamiento 3 épocas + SFT CoT 5 épocas | 100% |
| MiniMind-YuHua-dLM-v2 | 104M | No disponible | Preentrenamiento 3 épocas + SFT CoT 5 épocas | 16% |

El modelo Linear v2 obtiene un mejor resultado en la métrica de fugas, mientras que el dLM (modelo de lenguaje difuso) no es adecuado para este tamaño y datos. La comparativa con otros modelos de generación de estilo literario no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Riesgo de alucinación**: al ser un modelo de 104M entrenado con un corpus de 13 libros, puede generar contenido que no está en los datos originales, especialmente cuando se le piden temas fuera del estilo de Yu Hua.
- **Sesgos del corpus**: el modelo está entrenado exclusivamente con las obras de Yu Hua, por lo que su vocabulario, temas y tono están limitados a ese dominio. No es adecuado para tareas generales de generación de texto.
- **Fuga de personajes**: aunque la V2 reduce la fuga de personajes, el autor menciona que un 14% de las generaciones pueden contener nombres ilegales o raros (por ejemplo, caracteres chinos mal formados). Esto se debe a la falta de datos suficientes para que el modelo aprenda la base del chino correctamente.
- **Restricciones de licencia**: la licencia no está disponible en la información proporcionada. Se recomienda consultar el repositorio de HuggingFace antes de cualquier uso comercial.
- **Limitaciones de contexto**: no se ha especificado la longitud de contexto. Dado el tamaño del modelo, es probable que sea limitado (por ejemplo, 512 o 1024 tokens), lo que restringe la generación de textos largos.
- **Idioma**: el modelo solo funciona correctamente en chino. No se ha entrenado para otros idiomas.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/shikunpunk/MiniMind-YuHua-AR-v2
- Dataset de datos de Yu Hua: https://huggingface.co/shikunpunk/MiniMind-YuHua-Data
- Repositorio del proyecto MiniMind: https://github.com/jingyaogong/minimind
- Perfil del autor en HuggingFace: https://huggingface.co/shikunpunk/models
- Repositorio con experimentos del proyecto (se menciona el informe `ChineseHardJudgePoem/doc/COT_YUHUA_EXPERIMENTS_REPORT.md`): https://github.com/shikunpneg/shikunpunk-ai-seacher/tree/main/works
