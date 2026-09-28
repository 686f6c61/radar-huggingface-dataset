# goncalvesah/retrieval

## Resumen

`goncalvesah/retrieval` es un prototipo de investigación basado en CLIP orientado a tareas de recuperación (retrieval) texto-imagen e imagen-texto. Lo publica el usuario goncalvesah (Felipe Goncalves) en Hugging Face y se distribuye como un esqueleto reproducible: incluye código de ejecución, configuración de arquitectura, una receta de entrenamiento por defecto y un checkpoint de inicialización, pero no un modelo entrenado ni validado.

El repositorio se presenta explícitamente como un punto de partida experimental. La model card declara que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo (smoke tests), no un checkpoint con rendimiento medido, y que no se reclama ninguna puntuación de benchmark. La escala se etiqueta como "large" en la configuración, pero el recuento real de parámetros en safetensors es de 33.088, una cifra que no corresponde a un modelo CLIP de gran tamaño en el sentido habitual del término.

Su relevancia es, por tanto, metodológica más que de rendimiento: documenta una arquitectura CLIP con atención de consulta agrupada (grouped query) y fusión con compuertas (gated fusion), y propone una guía de evaluación (Flickr30k, al menos tres semillas y una línea base de capacidad equivalente). No hay datos de entrenamiento, idiomas soportados ni resultados publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (prototipo de recuperación), atención grouped query, fusión gated fusion, activación approx gelu, normalización batchnorm |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) y código PyTorch (`main.py`) |

Otros datos: descargas 0, likes 0, tamano del repositorio 0.0 GB, creado el 2026-09-28 y actualizado el 2026-09-28 (fechas tal como figuran en el repositorio). Archivos incluidos: `main.py`, `README.md`, `config.json`, `training_args.json` y `model.safetensors`.

## Arquitectura y entrenamiento

La arquitectura es un CLIP con atención de consulta agrupada y fusión multimodal mediante compuertas, activación approx gelu y normalización batchnorm, según la tabla recogida en la propia model card. La escala declarada es "large", aunque esa etiqueta procede de la configuración generada y no se corresponde con los 33.088 parámetros reales almacenados en el checkpoint de safetensors. Al tratarse de una implementación personalizada, la model card advierte de que las APIs genéricas de carga automática requieren un adaptador explícito antes de poder usarse.

En cuanto al entrenamiento, no se ha ejecutado ninguno: la receta incluida usa el optimizador AdamW con un calendario de warmup lineal, y el autor la describe como valores de arranque del script, no como evidencia de una ejecución completada. No se especifican tokens de entrenamiento, composición del dataset, ni fases de RLHF o DPO, porque el checkpoint no ha sido entrenado ni auditado. La guía de evaluación propuesta sugiere emplear Flickr30k, reportar la métrica de la tarea sobre al menos tres semillas y comparar contra una línea base de capacidad equivalente.

## Capacidades

- Recuperación multimodal texto-imagen e imagen-texto: es la tarea objetivo declarada del prototipo (etiqueta `retrieval`).
- Arquitectura CLIP con doble codificador implícito (texto e imagen) y fusión mediante compuertas, pensada para alineación de representaciones entre modalidades.
- Punto de entrada ejecutable de entrenamiento e inferencia incluido en `main.py`, con ejemplo de smoke test en el bloque `__main__`.
- Configuración de arquitectura reproducible en `config.json` y receta de experimento por defecto en `training_args.json`.

Advertencia: al no existir un checkpoint entrenado, ninguna de estas capacidades está verificada empíricamente. La model card no documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos especiales como thinking, visión o audio.

## Casos de uso

- Reproducción de investigación en recuperación multimodal: sirve como plantilla para montar un experimento CLIP con atención de consulta agrupada y fusion gated fusion, partiendo de `main.py` y `config.json`.
- Línea base de referencia interna: el propio autor propone usarlo como punto de partida comparable frente a una línea base de capacidad equivalente, siempre entrenando ambos con la misma exposición de datos, presupuesto de ajuste y semillas.
- Pruebas de humo de infraestructura: el checkpoint de inicialización permite comprobar que un pipeline de carga de safetensors, tokenización y forward funciona antes de invertir en entrenamiento real.
- Evaluación metodológica en Flickr30k: el repositorio indica explícitamente esta tarea como primer experimento recomendado, reportando la métrica sobre al menos tres semillas.
- Estudio de variantes de atención y fusión: la combinación grouped query + gated fusion documentada permite aislar el efecto de estas decisiones de diseño frente a alternativas.
- Formación y docencia: al ser un repositorio pequeño (33.088 parámetros, 0.0 GB) y con licencia permisiva, es apto para ilustrar el flujo completo de un proyecto CLIP sin coste de cómputo.

En todos los casos, el uso está condicionado a entrenar el modelo: el artefacto publicado es una inicialización, no un modelo listo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma de forma explícita que no se reclama ninguna puntuación de benchmark en este repositorio y que el checkpoint no ha sido entrenado ni auditado. Cualquier resultado de un futuro checkpoint entrenado deberá documentarse por separado de los valores por defecto aquí incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante. Con 33.088 parámetros, los pesos ocupan del orden de kilobytes tanto en float32 como en float16; cabe en memoria de cualquier dispositivo.
- GPU recomendadas: cualquier GPU, incluida una integrada; no se requiere A100, H100 ni RTX 4090 para cargar el checkpoint. Para un entrenamiento real sobre Flickr30k, la GPU adecuada dependería del tamaño efectivo del modelo que se entrene, dato no disponible.
- Cabe en GPU de consumo: sí, y también en CPU, dado el tamaño del checkpoint de inicialización.
- Opciones de despliegue: el repositorio solo documenta ejecución mediante Python con `python main.py --help` y el bloque `__main__`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la model card advierte de que, al ser una implementación personalizada, las APIs de carga automática necesitan un adaptador explícito.
- Latencia y throughput: no disponibles. Al no haber modelo entrenado, no hay medidas de rendimiento publicadas.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| goncalvesah/retrieval | CLIP para retrieval (prototipo) | 33.088 | no disponible | sin benchmarks publicados; checkpoint no entrenado | BSD-3-Clause | Hugging Face, 0 descargas |
| openai/clip-vit-large-patch14 | CLIP para retrieval | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | ampliamente disponible |
| SigLIP (familia) | CLIP para retrieval | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | disponible |
| Chinese-CLIP | CLIP para retrieval multilingue | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | disponible |

Nota: la comparación se limita a la categoria de modelos CLIP orientados a recuperación. No se dispone de cifras verificadas de los modelos alternativos en la información proporcionada, por lo que no se establece una comparación cuantitativa. La diferencia más relevante y verificable es que este repositorio publica un checkpoint sin entrenar, mientras que las alternativas citadas distribuyen pesos entrenados.

## Limitaciones y advertencias

- El checkpoint de inicialización no ha sido entrenado; no debe esperarse ninguna capacidad de recuperación funcional de él.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según declara la propia model card.
- Sesgos conocidos: no disponible. No se han documentado análisis de sesgo.
- Riesgo de alucinación: no evaluado; no se han publicado pruebas al respecto.
- Limitaciones de contexto e idioma: no disponibles. No se especifica ventana de contexto ni conjunto de idiomas soportados.
- Restricciones de licencia: el código y los pesos se publican bajo BSD-3-Clause, una licencia permisiva que permite uso comercial. Sin embargo, la model card recomienda revisar por separado los términos de los datos de origen cuando el repositorio se use con datasets externos.
- Para producción: cualquier resultado obtenido con un checkpoint entrenado debe documentarse de forma independiente a los valores por defecto del repositorio; no se debe confundir la configuración de arranque con una ejecución completada.
- Repositorio sin adopción: 0 descargas y 0 likes, lo que implica ausencia de validación por parte de la comunidad.
- Las fechas de creación y actualización del repositorio figuran como 2026-09-28 en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goncalvesah/retrieval
- Modelos del autor: https://huggingface.co/goncalvesah/models
- Dataset del mismo autor: https://huggingface.co/datasets/goncalvesah/embedder/tree/main
- Repositorio de recuperación de información (no vinculado directamente al modelo): https://github.com/catarinassgoncalves/information-retrieval-nlp
