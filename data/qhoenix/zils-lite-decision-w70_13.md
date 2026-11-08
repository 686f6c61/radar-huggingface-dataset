# qhoenix/zils-lite-decision-w70_13

## Resumen

zils-lite-decision-w70_13 es un modelo de decisión de 0,8 mil millones de parámetros publicado por el usuario qhoenix en Hugging Face. Se construye mediante un *soup* (promedio ponderado de pesos) de tres fine-tunes propios del autor (r13 al 70 %, r12 y r15 a partes iguales), todos ellos derivados a su vez de un promedio de pesos entre el modelo zils-lite-decision-v9 y cuatro cuerpos base Apache-2.0. El modelo parte del checkpoint Qwen/Qwen3.5-0.8B y se distribuye en formato safetensors con licencia Apache-2.0.

La relevancia del modelo es acotada y muy específica: no es un modelo generativo de propósito general, sino un clasificador de decisión entrenado con el formato de examen de la plataforma Zils, orientada a que aplicaciones pequeñas ordenen peticiones, marquen problemas o puntúen coincidencias siguiendo criterios definidos por el usuario. El pipeline declarado en Hugging Face es `feature-extraction`, lo que confirma que su uso previsto es la extracción de representaciones o la puntuación de decisiones, no la conversación libre.

El modelo tiene cero descargas y cero likes en el momento de redactar esta ficha, se publicó el 7 de noviembre de 2026 y el repositorio ocupa 1,7 GB. La información disponible es escasa: la model card es muy breve y no incluye benchmarks, idiomas soportados ni detalles sobre la composición del dataset de entrenamiento más allá de la mención a *splits* públicos de TRAIN en formato de examen Zils.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B); requiere `custom_code` |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 853 millones de parámetros. El repositorio incluye la etiqueta `custom_code`, lo que implica que la carga requiere `trust_remote_code=True` y que la implementación exacta de la arquitectura puede diferir de la del `transformers` estándar. Los pesos se distribuyen en BF16 dentro del *chassis* fijado por el autor para la familia d3-lite.

El proceso de construcción es un *model soup* en dos niveles. Primero, cada uno de los tres fine-tunes (r12, r13 y r15) partió de un promedio de pesos entre zils-lite-decision-v9 (50 %) y cuatro cuerpos base Apache-2.0: vllm-sr/d3-lite, internlm/Intern-Decision-0.8B, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full (12,5 % cada uno). Después, cada uno se afinó completamente sobre ítems de decisión en el formato de examen Zils extraídos de *splits* públicos de TRAIN. Finalmente, el modelo publicado es la media ponderada de los tres: r13 al 70 % y r12 y r15 al 15 % cada uno. El autor declara explícitamente que no se usaron semillas de examen, *splits* de validación ni de test durante el entrenamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación y puntuación de decisiones: el modelo está entrenado para emitir juicios de decisión en el formato de examen de Zils, es decir, ordenar peticiones, marcar problemas o puntuar coincidencias según ejemplos aportados por el usuario.
- Extracción de características: el pipeline declarado es `feature-extraction`, por lo que puede emplearse para obtener representaciones vectoriales de entradas de texto.
- Ajuste a criterios personalizados: la propuesta de Zils es que el modelo aprenda los criterios de decisión a partir de ejemplos etiquetados por la aplicación.
- Generación de texto libre: no disponible; la model card no la menciona y el pipeline declarado no la incluye.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.

## Casos de uso

- Triaje de peticiones en aplicaciones pequeñas: el modelo puede puntuar solicitudes entrantes y ordenarlas por prioridad o categoría siguiendo los ejemplos de decisión que defina el desarrollador, aprovechando su tamaño reducido para ejecutarse en el mismo servidor de la aplicación.
- Marcado automático de incidencias: en un flujo de soporte o de moderación, el modelo puede señalar si un texto cumple o incumple un conjunto de criterios previamente ejemplificados.
- Puntuación de coincidencias entre perfiles y ofertas: adecuado para *matching* ligero en el que se compara una entrada con un catálogo y se emite una puntuación de afinidad según los criterios entrenados.
- Clasificación de tickets en pipelines internos: al ser un modelo de 0,8B, puede integrarse como paso previo a un LLM mayor, reduciendo coste y latencia al resolver las decisiones sencillas de forma local.
- Filtrado previo en sistemas de recomendación: útil como primera etapa de descarte que etiqueta elementos candidatos antes de un reordenamiento más costoso.
- Experimentación académica con *model soups*: el repositorio documenta con precisión la receta de promediado de pesos, lo que lo convierte en un caso de estudio reproducible para investigar la combinación de fine-tunes pequeños en tareas de decisión.
- Evaluación de criterios subjetivos definidos por el usuario: la plataforma Zils está pensada para que una aplicación enseñe sus propias reglas con ejemplos, de modo que el modelo puede desplegarse como clasificador específico de dominio sin reentrenamiento desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para los pesos (852.985.920 parámetros × 2 bytes), más el *overhead* de activaciones y del runtime de `transformers`.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para los pesos; en 4 bits, alrededor de 0,5 GB. Estas cifras son estimaciones por tamaño y no proceden de la model card.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder alojar el modelo en BF16; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes o baja latencia, una RTX 4090 o una A100/H100 ofrecen margen de sobra.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño del checkpoint.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada por las etiquetas del repositorio. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible; la presencia de `custom_code` puede complicar la conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-decision-w70_13 | 852.985.920 | no disponible | Decisión / feature-extraction | Apache-2.0 | Hugging Face, 0 descargas |
| internlm/Intern-Decision-0.8B | ~0,8B (según nombre) | no disponible | Decisión | no disponible en la información | Cuerpo base citado por el autor |
| Maincode/Matilda-Decision-v1-Edge | ~0,8B (según nombre) | no disponible | Decisión | no disponible en la información | Cuerpo base citado por el autor |
| zils-ai/jiwo-0.8b-full | ~0,8B (según nombre) | no disponible | Decisión | no disponible en la información | Cuerpo base citado por el autor |

Los tres modelos comparables son precisamente los cuerpos base Apache-2.0 que el autor promedió para construir este checkpoint, por lo que la comparación directa de rendimiento no está documentada. No se dispone de datos de benchmarks que permitan establecer diferencias cuantitativas entre ellos.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para el formato de examen de Zils y no debe esperarse de él un comportamiento de chat general ni de generación de texto abierta.
- Riesgo de alucinación: no evaluado; al ser un modelo de decisión, el riesgo se traslada a puntuaciones o etiquetas incorrectas en lugar de texto inventado.
- Idiomas: no se declaran idiomas soportados, por lo que no hay garantía de comportamiento correcto fuera del idioma o idiomas presentes en los *splits* de TRAIN utilizados.
- Contexto: se desconoce la longitud máxima de contexto; conviene validarla empíricamente antes de desplegarlo con entradas largas.
- Código personalizado: la etiqueta `custom_code` obliga a ejecutar código del repositorio con `trust_remote_code=True`, lo que introduce un riesgo de seguridad y de compatibilidad con versiones futuras de `transformers`.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen/Qwen3.5-0.8B y de otros cuerpos base cuyas condiciones conviene verificar antes de un despliegue en producción.
- Madurez: cero descargas y cero likes en el momento de la ficha, sin validación externa ni *splits* de test publicados; el autor declara no haber usado validación ni test, lo que impide conocer su capacidad de generalización.
- Fechas: el repositorio figura creado en noviembre de 2026, dato que conviene contrastar con la versión efectivamente descargada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-w70_13
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Fine-tune principal de la mezcla: https://huggingface.co/qhoenix/zils-lite-decision-r13
- *Soup* previo de la familia: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Cuerpo base: https://huggingface.co/vllm-sr/d3-lite
- Cuerpo base: https://huggingface.co/internlm/Intern-Decision-0.8B
- Cuerpo base: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Cuerpo base: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Sitio de la plataforma Zils: https://zils.ai/
