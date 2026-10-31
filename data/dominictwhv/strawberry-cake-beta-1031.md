# DominicTWHV/Strawberry-Cake-Beta-1031

## Resumen

Strawberry Cake Beta 1031 es un clasificador de moderación de texto desarrollado por DominicTWHV, ajustado (fine-tuning) a partir de `microsoft/deberta-v3-small`. El modelo se entrena sobre el subconjunto anotado de 276.000 ejemplos del dataset [Cockatoo Moderation V1](https://huggingface.co/datasets/DominicTWHV/Cockatoo-Moderation-V1) durante 3 épocas, y su propósito principal es evaluar la usabilidad de dicho dataset para tareas de moderación de contenido.

No se trata de un modelo generativo, sino de un clasificador de texto (pipeline `text-classification`) orientado a detectar contenido problemático en inglés. El propio autor advierte explícitamente en la model card que se trata de un modelo preliminar de prueba y que **no está pensado para uso en producción**. Su relevancia reside más en servir como prueba de concepto del pipeline de anotación y entrenamiento de Cockatoo (Data Studio, ML Orchestrator y ML Worker) que como sistema de moderación listo para desplegar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (transformer encoder), fine-tuned para clasificación de texto |
| Parametros totales | no disponible (DeBERTa-v3-small tiene ~44M en su versión base, pero el autor no lo especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-small`, un encoder transformer basado en la arquitectura DeBERTa-v3 de Microsoft, que incorpora disentangled attention (atención desacoplada de contenido y posición) y enhanced mask decoder. Sobre esta base se realiza un fine-tuning para clasificación de texto en tareas de moderación.

El entrenamiento utiliza el subconjunto anotado de 276.000 ejemplos del dataset Cockatoo Moderation V1, durante 3 épocas. El pipeline de software consta de tres componentes: Cockatoo Data Studio (anotación), Cockatoo ML Orchestrator (orquestación) y Cockatoo ML Worker (agente de entrenamiento). El entrenamiento se completó en aproximadamente 1 hora sobre 2 GPU NVIDIA P100 conectadas por PCIe. Los datos exactos de entrenamiento y los splits están disponibles en la carpeta `training-data/` del repositorio, y los hiperparámetros en el fichero `training_params.json`.

## Capacidades

- Clasificación de texto para moderación de contenido en inglés.
- Etiquetas de moderación (las métricas publicadas incluyen F1, precision y recall por etiqueta).
- Nota importante: la etiqueta `harassment_target` que aparece en la salida del modelo es un artefacto de los datos de entrenamiento y debe ignorarse según el autor.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes: es un clasificador discriminativo.

## Casos de uso

- **Prueba de concepto del dataset Cockatoo Moderation V1**: el propósito declarado del modelo es validar si el subconjunto anotado de 276.000 ejemplos es utilizable para entrenar clasificadores de moderación; sirve como referencia de calidad del dataset.
- **Prototipado de sistemas de moderación en inglés**: se puede usar como punto de partida para experimentar con clasificadores de contenido tóxico o inapropiado antes de entrenar versiones más robustas.
- **Baseline para comparación**: al publicarse datos, splits e hiperparámetros, es útil como línea base reproducible frente a otros clasificadores de moderación.
- **Filtrado previo de contenido en pipelines de datos**: podría integrarse en etapas experimentales de prefiltrado de texto, siempre en contexto de prueba y no producción.
- **Investigación en moderación automática**: útil para estudiar el comportamiento de etiquetas de moderación (por ejemplo, la aparición de artefactos como `harassment_target`) y sus efectos en métricas.
- **Demostración del pipeline Cockatoo**: sirve como ejemplo end-to-end de anotación, orquestación y entrenamiento con la herramienta Cockatoo.

## Benchmarks y rendimiento

No se han publicado valores numéricos de benchmarks (F1, precision, recall) en la model card: solo se incluyen gráficos de imágenes (`assets/plots/f1.png`, `precision.png`, `recall.png`) cuyos datos concretos no están disponibles en texto. No hay comparaciones con otros modelos (por ejemplo, LlamaGuard u OpenAI Moderation) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible explícitamente; al tratarse de una variante small de DeBERTa-v3 (~44M de parámetros en el modelo base), el modelo completo ocupa unos 0,6 GB en el repositorio, por lo que es razonable esperar que funcione con menos de 2 GB de VRAM, e incluso en CPU.
- **GPU recomendadas**: no requiere GPU dedicada para inferencia; cualquier GPU moderna es suficiente. Para entrenamiento, el autor usó 2× NVIDIA P100 (16 GB) por PCIe durante ~1 hora.
- **Consumer GPU**: cabe sobradamente en cualquier GPU de consumo actual (incluso de gama baja).
- **Despliegue**: como clasificador de HuggingFace con pesos safetensors, es compatible con la librería `transformers` (pipeline `text-classification`). No se menciona soporte específico para vLLM, llama.cpp, Ollama o TGI; llama.cpp y Ollama no aplican al no ser un modelo generativo en formato GGUF.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Strawberry Cake Beta 1031 | Clasificador de moderación | DeBERTa-v3-small | en | CC-BY-4.0 | Preliminar, no para producción |
| Llama Guard 3 (Meta) | Clasificador de moderación (LLM) | Llama 3.1 | multi | Llama 3.1 Community License | Producción |
| unitary/toxic-bert | Clasificador de toxicidad | BERT | en | Apache 2.0 | Estable |

Strawberry Cake Beta 1031 es considerablemente más ligero (encoder small frente a LLM de varios miles de millones de parámetros en Llama Guard 3) y más fácil de desplegar, pero su alcance está limitado al inglés y su propio autor lo marca como experimental.

## Limitaciones y advertencias

- **No apto para producción**: la model card incluye una advertencia explícita indicando que es un modelo preliminar de prueba.
- **Artefacto de etiqueta**: la etiqueta `harassment_target` en la salida es un artefacto de los datos de entrenamiento y debe ignorarse; su presencia indica problemas de calidad en las etiquetas del dataset.
- **Solo inglés**: el modelo está entrenado únicamente con datos en inglés, por lo que no es adecuado para otros idiomas.
- **Riesgo de sesgo y alucinación**: no aplica el concepto de alucinación (no es generativo), pero al derivar de un dataset de moderación anotado puede heredar los sesgos de anotación de Cockatoo Moderation V1; no hay auditoría de sesgos publicada.
- **Métricas no verificables numéricamente**: los resultados se publican solo como imágenes, sin valores numéricos ni comparativas, lo que dificulta la evaluación rigurosa.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribución, pero dado el estado experimental del modelo, su uso comercial no está recomendado.
- **Contexto de entrada**: la longitud máxima de secuencia no está documentada; DeBERTa-v3-small base suele limitarse a 512 tokens, lo que restringe la moderación de documentos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DominicTWHV/Strawberry-Cake-Beta-1031
- Dataset de entrenamiento: https://huggingface.co/datasets/DominicTWHV/Cockatoo-Moderation-V1
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
