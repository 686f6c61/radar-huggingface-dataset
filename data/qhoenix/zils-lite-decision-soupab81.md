# qhoenix/zils-lite-decision-soupab81

## Resumen

zils-lite-decision-soupab81 es un modelo de decisión de tipo "soup" (promedio de pesos) desarrollado por el usuario qhoenix sobre el chasis del modelo base Qwen/Qwen3.5-0.8B. Se trata de un ajuste fino completo de los pesos del lenguaje, orientado a tareas de selección de opciones en el llamado "formato de examen Zils": el modelo recibe una pregunta con varias opciones y debe puntuar cuál es la correcta. Con 852.985.920 parámetros y un repositorio de 1,7 GB en BF16, es un modelo compacto pensado para inferencia ligera.

El proceso de construcción es explícito en la model card: se parte de la media uniforme de dos cuerpos previos del round d3-lite-2026-11-17 (zils-lite-l1116a y zils-lite-l1116b, 50% cada uno), se realizan dos ajustes finos completos idénticos salvo por la tasa de aprendizaje máxima (5e-6 y 1e-5) durante 3418 pasos de optimizador (una época) con semilla 81 sobre unos 98.000 ítems de decisión, y finalmente se promedian los pesos de ambos ajustes al 50%. El resultado es un cuerpo promediado que hereda la licencia Apache-2.0 del modelo base.

Su relevancia es acotada pero concreta: no es un modelo generativo de propósito general, sino un clasificador/puntuador de decisiones entrenado con objetivos suaves (0,90 sobre la opción correcta y el resto repartido uniformemente) y una pérdida combinada de entropía cruzada suave más Brier con anclaje KL (0,1) al modelo de partida. Esto lo hace adecuado para evaluación automática de opciones múltiples, no para diálogo abierto ni generación libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), ajuste fino completo con promedio de pesos (soup) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre el chasis del Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros. El pipeline declarado es `feature-extraction`, lo que sugiere que la cabeza de salida se utiliza para producir puntuaciones o representaciones de decisión en lugar de generación de texto libre. El tag `custom_code` indica que la carga requiere código personalizado del repositorio, probablemente para la cabeza de decisión y el formato de examen.

El entrenamiento se realizó en dos fases sobre los pesos del lenguaje: primero, una media uniforme de dos cuerpos del round d3-lite-2026-11-17; después, dos ajustes finos completos con idéntica configuración salvo la tasa de aprendizaje máxima (5e-6 y 1e-5), 3418 pasos de optimizador cada uno (una época), calentamiento y decaimiento coseno, semilla 81, sobre aproximadamente 98.000 ítems de decisión en formato de examen Zils. Los ítems provienen de splits TRAIN públicos con etiquetas gold y de ítems redactados a partir de splits TRAIN públicos de conjuntos de datos de uso comercial. Las etiquetas son objetivos suaves (0,90 en la opción gold, resto repartido uniformemente) y la función de pérdida combina entropía cruzada suave, pérdida de Brier y un anclaje KL de 0,1 hacia el modelo de partida. El cuerpo final es la media uniforme al 50% de ambos ajustes, construida con `zils.soup.build` sobre el chasis fijado. No se usaron semillas de examen, validación ni test para el entrenamiento.

## Capacidades

- Puntuación de decisiones en formato de examen Zils: dado un ítem con opciones, el modelo produce puntuaciones para seleccionar la opción correcta.
- Clasificación de opción múltiple con objetivos suaves: entrenado para asignar alta probabilidad a una opción gold y probabilidad repartida entre el resto.
- Extracción de características (`feature-extraction`): puede emplearse para obtener representaciones internas del texto de entrada.
- No se documentan capacidades de generación libre de texto, razonamiento abierto, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas.
- No se documenta modo de pensamiento (thinking mode), visión ni audio.

## Casos de uso

- Evaluación automática de exámenes de opción múltiple: el modelo puntúa cada opción de un ítem en formato Zils y selecciona la de mayor puntuación, adecuado por su entrenamiento específico con objetivos suaves y pérdida de Brier.
- Puntuación de ítems en pipelines de evaluación de modelos: puede emplearse como componente de un sistema que mide la calidad de respuestas generadas por otros modelos, comparando la opción elegida con la gold.
- Filtrado y priorización de ítems en conjuntos de datos: dado un banco de preguntas con opciones, el modelo puede ordenar ítems por dificultad estimada o consistencia de puntuaciones.
- Clasificación ligera en entornos con recursos limitados: con 0,85 mil millones de parámetros y pesos BF16 de 1,7 GB, cabe en GPUs de consumo y permite procesar lotes de ítems sin infraestructura dedicada.
- Componente de decisión en sistemas de enrutamiento: la cabeza de decisión puede adaptarse para elegir entre un conjunto finito de acciones o categorías, siempre que se reformule la entrada en el formato de examen.
- Investigación sobre promediado de pesos (model soups): el repositorio documenta explícitamente el proceso de construcción, lo que lo convierte en un caso de estudio reproducible para experimentos de soup y ajuste fino con anclaje KL.
- Extracción de representaciones para clasificadores posteriores: al declararse como `feature-extraction`, puede usarse para generar embeddings de texto que alimenten modelos downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las mediciones asociadas a este cuerpo son locales (un examen réplica privado) y no los ítems sellados del validador, por lo que no se ofrecen cifras comparables.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más memoria para activaciones y overhead; en la práctica, entre 2 y 4 GB según longitud de secuencia y tamaño de lote.
- En cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits: alrededor de 0,5 GB de pesos (estimaciones a partir del número de parámetros, no confirmadas en la model card).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 en lotes pequeños; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas, aunque para este tamaño las consumer son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM en BF16, y en tarjetas con 2 GB o más si se cuantiza.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el tag `custom_code`); vLLM, llama.cpp, Ollama y TGI no están confirmados para este modelo concreto debido a la cabeza de decisión personalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-decision-soupab81 | 852.985.920 | no disponible | Puntuacion de decisiones (formato Zils) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Generacion de texto general | no disponible en la informacion | Hugging Face |
| joamCriff123/zils-lite-l1116a | no disponible | no disponible | Puntuacion de decisiones (miembro del soup) | Apache-2.0 | Hugging Face |
| joamCriff123/zils-lite-l1116b | no disponible | no disponible | Puntuacion de decisiones (miembro del soup) | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo generativo de propósito general; su uso previsto es la puntuación de decisiones en formato de examen Zils.
- Sesgos: no documentados, pero al derivar de Qwen3.5-0.8B y de datos TRAIN públicos, puede heredar sesgos del corpus de entrenamiento y de los ítems redactados.
- Riesgo de alucinación: limitado en su tarea objetivo (puntuación), pero si se fuerza su uso generativo fuera de distribución, las salidas no son fiables.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles; no se debe asumir cobertura multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado; la model card afirma que los cuerpos de partida están publicados bajo Apache-2.0.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar dicho código antes de usarlo en producción.
- Validación: las mediciones son locales y sobre un examen réplica privado, no sobre ítems sellados del validador; no hay garantía de generalización a otros conjuntos.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.
- Fecha de creación futura (2026-11-17): conviene verificar la integridad y procedencia de los artefactos antes de desplegarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-soupab81
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Miembro del soup A: https://huggingface.co/joamCriff123/zils-lite-l1116a
- Miembro del soup B: https://huggingface.co/joamCriff123/zils-lite-l1116b
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
