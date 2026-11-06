# danielevansora/retrieval-medium39

## Resumen

`retrieval-medium39` es un prototipo de investigación publicado en Hugging Face por el usuario `danielevansora` bajo el identificador `danielevansora/retrieval-medium39`. Se presenta como una implementación de arquitectura MobileViT orientada a tareas de recuperación (retrieval), con un conjunto de configuración etiquetado como "tiny" y un checkpoint de inicialización válido únicamente para pruebas de humo. No se trata de un modelo entrenado ni evaluado: la propia model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado.

El modelo se distribuye en formato safetensors con 33.088 parámetros totales según los metadatos del repositorio, lo que lo sitúa en un orden de magnitud muy reducido, coherente con un artefacto de demostración de pipeline más que con un modelo utilizable en producción. La arquitectura declarada es MobileViT con atención estándar, fusión de bajo rango, activación GELU-Tanh y normalización InstanceNorm. El repositorio incluye el script `finetune.py` como artefacto principal, junto con `config.json` y `training_args.json` que documentan los valores por defecto del experimento.

Su relevancia actual es limitada y de naturaleza estrictamente investigadora: sirve como plantilla reproducible para experimentos de retrieval con arquitecturas ligeras, pero no debe confundirse con un modelo listo para desplegar. La licencia BSD-3-Clause permite uso comercial y modificación, si bien el autor advierte que deben revisarse por separado los términos de los datos de origen si se emplean conjuntos externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViT |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura declarada es MobileViT, una familia de redes híbridas que combina convoluciones y mecanismos de atención para visión, diseñada originalmente para eficiencia en dispositivos móviles. La model card especifica atención estándar, fusión de bajo rango, activación GELU-Tanh y normalización InstanceNorm, con una escala etiquetada como "tiny". El repositorio incluye un `config.json` que registra los ajustes de arquitectura generados, pero no se detalla el número de capas, dimensiones ocultas ni resolución de entrada.

No se ha completado ningún entrenamiento. El checkpoint `model.safetensors` se describe explícitamente como una inicialización válida para pruebas de humo, no como un checkpoint entrenado ni evaluado. La receta de experimento por defecto usa el optimizador NovoGrad con un schedule coseno, valores que el autor presenta como puntos de partida en el script y no como evidencia de una ejecución completada. No se documentan volúmenes de tokens, composición del dataset, ni fases de RLHF o DPO. La model card recomienda que cualquier evaluación significativa entrene todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- No se declaran capacidades funcionales verificadas. El modelo no ha sido entrenado, por lo que no puede afirmarse que realice recuperación, generación de texto, razonamiento, código, matemáticas ni visión de forma fiable.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan modos especiales (thinking mode, visión, audio).
- El artefacto principal es el script `finetune.py`, que constituye un punto de partida ejecutable para experimentos, no un modelo con capacidades desplegables.

## Casos de uso

- Reproducción de experimentos de retrieval en investigación: el repositorio proporciona un script de ajuste fino y una configuración de referencia que permiten montar un pipeline reproducible sobre Flickr30k, tal como sugiere la propia model card, para comparar arquitecturas ligeras con líneas base de capacidad equivalente.
- Pruebas de humo de infraestructura: el checkpoint de inicialización permite validar pipelines de carga, serialización safetensors y flujos de entrenamiento antes de invertir cómputo en un entrenamiento real.
- Docencia y formación: sirve como ejemplo didáctico de estructura de repositorio de modelo (config, training args, script, checkpoint) y de buenas prácticas de documentación de limitaciones.
- Base para ajuste fino propio: un equipo puede partir de esta configuración MobileViT tiny y entrenar con su propio dataset de pares imagen-texto, siempre documentando los resultados por separado de los valores por defecto.
- Evaluación comparativa de arquitecturas móviles: útil para medir el coste y el rendimiento de MobileViT frente a alternativas convolucionales puras en tareas de recuperación multimodal.
- Prototipado de sistemas de búsqueda visual de baja latencia: la escala tiny permite experimentar con despliegues en dispositivos con recursos limitados, aunque sin garantías de calidad hasta que exista un checkpoint entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación y recomienda Flickr30k como primera evaluación, reportando la métrica de la tarea en al menos tres semillas e incluyendo una línea base de capacidad equivalente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB dado el tamaño de 33.088 parámetros; el peso en safetensors ocupa prácticamente nada y el repositorio completo mide 0.0 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 o H100. La elección vendrá determinada por el coste del entrenamiento, no de la inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para pruebas de humo.
- Opciones de despliegue: al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito antes de su uso. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danielevansora/retrieval-medium39 | 33.088 | no disponible | sin benchmarks publicados | BSD-3-Clause | Hugging Face |
| MobileViT original (Apple) | ~1-6 M (variantes) | no aplica (visión) | benchmarks publicados en ImageNet | licencia de investigación de Apple | repositorio oficial |
| CLIP (variantes pequeñas) | ~150 M | 77 tokens de texto | benchmarks publicados en retrieval | MIT | Hugging Face |

La comparación es orientativa: el modelo aquí descrito no es directamente comparable en rendimiento porque carece de entrenamiento y de evaluación publicada. Las alternativas citadas cuentan con checkpoints entrenados y métricas verificables.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio; debe tratarse como un punto de partida experimental.
- No se han publicado métricas de rendimiento; cualquier afirmación de calidad carece de respaldo.
- Riesgo de alucinación y de salidas sin sentido: al no estar entrenado, las predicciones no son fiables.
- No se documentan sesgos conocidos, pero tampoco se ha realizado ninguna auditoría al respecto.
- No se documentan limitaciones de contexto ni de idioma porque no hay información disponible.
- La licencia BSD-3-Clause permite uso comercial y modificación con atribución; sin embargo, el autor advierte que deben revisarse por separado los términos de los datos de origen si se emplean conjuntos externos.
- Para producción, es imprescindible entrenar y evaluar el modelo con datos propios, documentar los resultados de forma separada de los valores por defecto y comparar contra líneas base de capacidad equivalente con las mismas semillas.

## Enlaces

- Hugging Face: https://huggingface.co/danielevansora/retrieval-medium39
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
