# SaifPunjwani/qwen17b-score-calibration-artifacts-v1

## Resumen

Este repositorio de Hugging Face, publicado por SaifPunjwani, es un área de evaluación temporal para candidatos de calibración de puntuaciones basados en el modelo Qwen/Qwen3-1.7B. Contiene dos checkpoints deterministas y autónomos en las rutas `ckpts/clean-lower-jrl-b043/step-0` y `ckpts/connected-lower-dapo5-jrl015/step-0`, seleccionados para explorar rangos de puntuación concretos. No se trata de un modelo final listo para producción, sino de artefactos de investigación para análisis de calibración.

La arquitectura es la estándar de Qwen3, con un total de 1.720.574.976 parámetros, y se carga sin necesidad de adaptadores, routers, maestros ni código de inferencia personalizado. El repositorio es relevante porque documenta un proceso de selección de checkpoints que está contaminado por evidencia de benchmarks objetivo, lo que lo hace útil para estudiar metodologías de evaluación y calibración, pero inválido como evidencia para comparaciones imparciales de métodos. La model card indica explícitamente que estos candidatos no fueron entrenados con kNN novelty ni con RepExp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (estándar Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplicable (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Los dos candidatos activos conservan la arquitectura, el tokenizador y la plantilla de chat estándar de Qwen3. Cada directorio de checkpoint incluye un archivo `MERGE_MANIFEST.json` y un marcador `DONE` que enlaza las entradas inmutables y los hashes de los fragmentos de salida. El candidato `clean-upper-jrl-b061` fue rechazado y eliminado del árbol vivo tras un fallo medido en el conjunto AIME24; su procedencia es recuperable desde el historial del repositorio y la copia de auditoría del operador, pero no es un candidato de publicación.

La model card no proporciona datos sobre la composición del dataset de entrenamiento, el número de tokens ni la aplicación de RLHF o DPO. Se indica que la cadena de origen incluye un checkpoint seleccionado usando evidencia de benchmarks objetivo, por lo que ambos candidatos están contaminados por evaluación y no son evidencia válida para una comparación imparcial de métodos. Tampoco se utilizaron técnicas de kNN novelty ni RepExp, y no deben representarse como resultados de dichos métodos.

## Capacidades

- Generación de texto y razonamiento: en pruebas locales no relacionadas con benchmarks, mostró prosa normal en modo `/no_think` y razonamiento sustancial dentro de un bloque `
