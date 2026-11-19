# arlenecc/PKU-KCL-Meteor-0.8B-mlx-int4

## Resumen

PKU-KCL-Meteor-0.8B-mlx-int4 es una conversión al formato MLX con cuantización de 4 bits del modelo Meteor-0.8B, un modelo multimodal de tipo image-text-to-text desarrollado en el ámbito académico (los prefijos PKU y KCL apuntan a Peking University y King's College London, aunque la model card no lo confirma). El artefacto publicado por el usuario arlenecc contiene 852.985.920 parámetros en safetensors, ocupa 0,7 GB y está pensado para ejecutarse en hardware Apple Silicon mediante la librería MLX.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo visión-lenguaje de menos de 1.000 millones de parámetros en un Mac con memoria unificada, algo útil para prototipado local y entornos sin GPU dedicada; por otro, la información publicada es extremadamente escasa (sin licencia declarada, sin benchmarks, sin detalles de entrenamiento y con la model card prácticamente vacía), lo que limita seriamente su uso en producción.

El identificador de arquitectura declarado en los tags es `qwen3_5`, lo que sugiere una base derivada de la familia Qwen, y el pipeline es image-text-to-text, es decir, acepta imagen y texto como entrada y genera texto. No obstante, no se dispone de documentación que confirme la composición exacta del modelo ni su proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 852.985.920 (≈0,85 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX int4); no se detallan otras variantes |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |
| Tamano del repo | 0,7 GB |
| Libreria | mlx |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna más allá del tag `qwen3_5`, que apunta a una base de la familia Qwen 3.5 adaptada a modalidad imagen-texto. Tampoco se documenta el mecanismo de fusión visual (proyector, cross-attention o tokens de imagen insertados en la secuencia), ni el codificador de visión empleado.

Respecto al entrenamiento, se desconoce el número de tokens, la composición del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, y cualquier innovación técnica (atención lineal, decodificación especulativa, etc.). La model card del repositorio no aporta ninguno de estos datos, por lo que cualquier afirmación al respecto sería especulativa.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y conversación multimodal.
- Conversación multi-turno: el tag `conversational` indica soporte de diálogo.
- Procesamiento en inglés: único idioma declarado.
- Ejecución en Apple Silicon mediante MLX con cuantización de 4 bits.
- Tool calling / function calling: no disponible en la información publicada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Prototipado local de visión-lenguaje en Mac: gracias a sus 0,7 GB en 4 bits, el modelo cabe holgadamente en la memoria unificada de un MacBook con 16 GB y permite iterar sin GPU dedicada ni conexión a la nube.
- Descripción automática de imágenes en flujos personales: generación de alt-text o pies de foto para bibliotecas locales de imágenes, ejecutando la inferencia en el propio equipo.
- Extracción de información de capturas y documentos escaneados: preguntas directas sobre el contenido de una imagen en inglés, útil para tareas de oficina de bajo volumen.
- Asistente conversacional con soporte visual en demos: integración en aplicaciones de chat experimentales donde el usuario adjunta una imagen y formula preguntas de seguimiento.
- Evaluación comparativa de modelos pequeños multimodales: su tamaño reducido lo hace adecuado como línea base en experimentos de investigación sobre eficiencia en el borde.
- Filtrado y moderación de imágenes asistida: clasificación o descripción preliminar de contenido visual en pipelines locales antes de un análisis más costoso.
- Educación y experimentación con MLX: ejemplo práctico para aprender a cargar y ejecutar modelos multimodales cuantizados en el ecosistema MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: en torno a 0,7 GB para los pesos en 4 bits; con overhead de activaciones y del codificador visual, un uso realista de 2-4 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) por el formato MLX; no es directamente ejecutable en CUDA sin reconversión.
- Cabe en GPU de consumo: sí, en cualquier Mac con 8 GB o más de memoria unificada; no se distribuye en formato GGUF para GPUs NVIDIA.
- Opciones de despliegue: MLX (`mlx_lm` / `mlx-vlm` según el caso), con posible conversión a otros formatos no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| PKU-KCL-Meteor-0.8B-mlx-int4 | ≈0,85 B | no disponible | imagen-texto | no disponible | safetensors MLX 4-bit |
| Qwen2.5-VL-3B | ≈3 B | no disponible en esta ficha | imagen-texto | Apache 2.0 (según familia Qwen) | safetensors, GGUF |
| SmolVLM-500M | ≈0,5 B | no disponible en esta ficha | imagen-texto | Apache 2.0 | safetensors, GGUF |

La comparación es orientativa: no se dispone de datos de rendimiento del modelo analizado, por lo que no es posible establecer una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es un riesgo legal relevante para producción.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en tareas estándar (VQA, OCR, MMMU, etc.).
- Model card prácticamente vacía: sin detalles de entrenamiento, datos, sesgos o mitigaciones.
- Solo inglés declarado: el rendimiento en castellano es desconocido y probablemente deficiente.
- Riesgo de alucinación: inherente a modelos pequeños; sin evaluación publicada no puede acotarse.
- Contexto desconocido: no se puede planificar su uso en documentos largos o conversaciones extensas.
- Formato MLX exclusivo: no ejecutable directamente en CUDA ni en la mayoría de stacks de servidor; requiere conversión.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de mantenimiento.
- Cuantización 4-bit: posible degradación adicional de calidad frente al modelo original en precisión completa, no cuantificada por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/arlenecc/PKU-KCL-Meteor-0.8B-mlx-int4
- Documentación de MLX: https://ml-explore.github.io/mlx/
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
