# Charlie320/zils-flash-fj3

## Resumen

zils-flash-fj3 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-9B publicado por el usuario Charlie320 en Hugging Face. Forma parte del ecosistema Zils, un conjunto de modelos de decisión vinculados al pool «d3-flash» de la subred 127 de Bittensor. El modelo se presenta como un «body» (cuerpo) destinado a ese pool, es decir, una pieza intercambiable dentro de un mecanismo de agregación de pesos tipo model soup.

Técnicamente, el modelo parte de vllm-sr/d3-flash (a su vez construido sobre Qwen3.5-9B) y se obtiene promediando uniformemente tres ajustes LoRA de rango 32, cada uno entrenado con una semilla distinta sobre 30.000 filas del split de entrenamiento de tasksource/tasksource-jev-typed-decisions. El entrenamiento es de destilación blanda y sin etiquetas: el objetivo son las probabilidades de respuesta del promedio «soup» del pool d3-mini, no las etiquetas originales del dataset.

El modelo cuenta con 8.392.695.024 parámetros en formato safetensors BF16, con un repositorio de 16,8 GB, licencia Apache-2.0 y pesos de lenguaje entrenados junto con la torre de visión heredada del modelo padre. Es relevante ahora como ejemplo de la dinámica de modelos comunitarios en subredes descentralizadas: pesos derivados, agregación por promedio y licencias permisivas, aunque con documentación muy limitada sobre capacidades y rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-9B, con torre de visión heredada del padre) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B, un transformer decoder-only de aproximadamente 8.400 millones de parámetros, e incorpora la torre de visión del modelo padre, por lo que conserva capacidades multimodales de entrada visual. Los pesos de lenguaje han sido entrenados específicamente en este fine-tune, mientras que la parte visual se mantiene del progenitor. No se especifican en la información disponible detalles como el número de capas, dimensiones ocultas, mecanismo de atención o longitud de contexto nativa.

El procedimiento de entrenamiento consiste en tres ajustes LoRA de rango 32 (posteriormente fusionados) sobre el punto de partida vllm-sr/d3-flash, cada uno con una semilla distinta, una pasada barajada sobre 30.000 filas y una tasa de aprendizaje de 5e-5. Los tres resultados se promedian uniformemente con pesos iguales. El objetivo de entrenamiento es de destilación blanda y sin etiquetas: se usan las probabilidades de respuesta del promedio soup del pool d3-mini (media uniforme de Zayaan/zils-mini-hm4, qhoenix/zils-mini-decision-t2avg y joamCriff123/zils-mini-m1113b) como profesor. Los datos provienen del split de entrenamiento de tasksource/tasksource-jev-typed-decisions (unas 630 tareas fuente), filtrando fuentes con licencia comercial o no especificada, excluyendo fuentes no comerciales, tareas cuyo nombre coincide con BIG-bench y filas de Glaive. No se usaron ítems de examen, ítems del validador, semillas públicas de examen ni datos de clientes.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-9B.
- Procesamiento de visión: la torre visual del modelo padre se conserva, por lo que se espera soporte de entrada de imágenes (no se detalla el alcance exacto).
- Modelo de decisión: diseñado como «body» para el pool d3-flash de la subred 127 de Bittensor, orientado a tareas de decisión tipadas según el dataset de destilación.
- Destilación de probabilidades: el entrenamiento blando sugiere capacidad de producir distribuciones de probabilidad calibradas hacia el profesor d3-mini.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de modelos de decisión en subredes Bittensor: el modelo puede desplegarse como «body» candidato dentro del pool d3-flash y compararse con otros cuerpos mediante el mecanismo de validación de la subred 127.
- Destilación y agregación de pesos: sirve como referencia práctica para reproducir el pipeline de tres LoRA fusionados y promediado uniforme, útil en investigación sobre model soups y ensembles de bajo coste.
- Clasificación y decisiones tipadas: dado el dataset de entrenamiento (tasksource-jev-typed-decisions), es adecuado para tareas de decisión estructurada sobre entradas textuales, siempre que se valide su calibración.
- Experimentos de multimodalidad ligera: al conservar la torre de visión del padre, puede emplearse en prototipos que combinen texto e imagen, verificando previamente la calidad de la componente visual tras el fine-tune.
- Base para nuevos fine-tunes comunitarios: su licencia Apache-2.0 y formato safetensors facilitan derivados y publicaciones abiertas en el ecosistema Zils.
- Investigación sobre licencias y procedencia de datos: el filtrado documentado de fuentes (exclusión de no comerciales y de BIG-bench) lo convierte en un caso de estudio sobre trazabilidad de datasets en modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más para contexto moderado.
- Cuantización: no se publican versiones GGUF ni cuantizadas; sería necesario generarlas a partir de los safetensors. En 8 bits se estiman unos 8,4 GB de pesos; en 4 bits, unos 4,2 GB, sin contar overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto limitado; RTX 3090/4090 viables con cuantización.
- ¿Cabe en GPU de consumo? Sí, en BF16 cabe ajustadamente en una RTX 4090 de 24 GB con contexto corto; en cuantización 8 o 4 bits cabe en GPUs de 12-16 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama tras convertir a GGUF; al ser safetensors estándar, es compatible con los runners habituales de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-flash-fj3 | 8.392.695.024 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Fine-tune soup de Qwen3.5-9B para el pool d3-flash |
| Qwen/Qwen3.5-9B | ~9B (según nombre) | no disponible | no disponible en la información | Hugging Face | Modelo base del que deriva |
| vllm-sr/d3-flash | no disponible | no disponible | Apache-2.0 | Hugging Face | Punto de partida del fine-tune, también sobre Qwen3.5-9B |
| Zayaan/zils-mini-hm4 | no disponible | no disponible | no disponible | Hugging Face | Componente del profesor d3-mini usado para destilación |

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla contexto, idiomas, benchmarks ni limitaciones, lo que dificulta evaluar su calidad en producción.
- Riesgo de alucinación: al ser un fine-tune de destilación blanda sobre probabilidades de un profesor, puede heredar y amplificar sesgos y errores del pool d3-mini.
- Sesgos de datos: el dataset de entrenamiento excluye fuentes no comerciales y tareas BIG-bench, lo que puede introducir sesgos de selección en la distribución de tareas aprendidas.
- Idiomas: no se declaran idiomas soportados; no se garantiza un rendimiento multilingüe más allá de lo heredado de Qwen3.5-9B.
- Licencia: Apache-2.0 permite uso comercial, pero el autor advierte de que se deben revisar los términos de los datasets de origen antes de reutilizar los pesos.
- Procedencia y reproducibilidad: el modelo base vllm-sr/d3-flash y los componentes del profesor tienen documentación escasa; la reproducibilidad del pipeline depende de artefactos comunitarios.
- Uso en producción: sin benchmarks ni validación externa, no se recomienda desplegarlo en entornos críticos sin una evaluación propia.
- Visión: la torre visual se hereda sin reentrenamiento específico, por lo que su rendimiento tras el fine-tune de lenguaje no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-flash-fj3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Punto de partida del fine-tune: https://huggingface.co/vllm-sr/d3-flash
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Componente del profesor: https://huggingface.co/Zayaan/zils-mini-hm4
- Componente del profesor: https://huggingface.co/qhoenix/zils-mini-decision-t2avg
- Componente del profesor: https://huggingface.co/joamCriff123/zils-mini-m1113b
