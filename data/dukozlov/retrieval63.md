# dukozlov/retrieval63

## Resumen

`dukozlov/retrieval63` es un repositorio experimental publicado en Hugging Face que contiene una implementación propia de una arquitectura denominada "Coca" orientada a tareas de recuperación de información (retrieval). Lo desarrolla el usuario dukozlov y se distribuye con licencia BSD-3-Clause. No se trata de un modelo entrenado ni evaluado, sino de un esqueleto de código con un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests).

El repositorio incluye el código del modelo (`eval.py`), un `config.json` con los parámetros de arquitectura generados, un `training_args.json` con la receta de experimento por defecto y un `model.safetensors` de 24.832 parámetros totales según los metadatos del propio archivo. El tamaño del repositorio es de 0,0 GB, coherente con un checkpoint de inicialización de dimensiones reducidas y no con un modelo listo para producción.

La relevancia de esta ficha es limitada y debe interpretarse como referencia de un artefacto de investigación en fase temprana: el autor declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado. Cualquier uso en producción requeriría entrenamiento completo, evaluación reproducible y una comparación con líneas base de capacidad equivalente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Coca (transformer con atención grouped query, fusión bilinear, activación gelu, normalización rmsnorm) |
| Parámetros totales | 24.832 (según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (con código PyTorch en `eval.py`) |

## Arquitectura y entrenamiento

La arquitectura declarada es "Coca" en escala "xlarge", con atención de tipo grouped query, fusión bilinear entre modalidades o torres (el autor no detalla el esquema exacto), activación GELU y normalización RMSNorm. El repositorio incluye un `config.json` que registra los ajustes generados de la arquitectura y un `training_args.json` con la receta de experimento por defecto, que emplea el optimizador AdamW con un schedule basado en pasos (step).

No se ha completado ningún entrenamiento: el `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo, no un modelo entrenado. El autor no documenta número de tokens, composición del dataset, ni fases de RLHF/DPO o ajuste fino. Tampoco se especifican innovaciones técnicas adicionales más allá de la combinación de atención grouped query y fusión bilinear. La evaluación sugerida por el autor es Flickr30k, reportando la métrica de la tarea en al menos tres semillas y con una línea base de capacidad equivalente.

## Capacidades

- Recuperación de información (retrieval) como tarea objetivo declarada, aunque sin entrenamiento completado.
- Arquitectura multimodal potencial (fusión bilinear), si bien el autor no especifica las modalidades concretas.
- Generación de texto: no disponible.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Pruebas de humo de arquitectura: usar `model.safetensors` y `config.json` para verificar que la implementación carga y ejecuta un forward pass antes de lanzar un entrenamiento completo.
- Investigación de arquitecturas de retrieval: servir como base para experimentar con atención grouped query y fusión bilinear en tareas de recuperación imagen-texto.
- Reproducción de recetas de entrenamiento: emplear `training_args.json` como punto de partida para configurar AdamW y schedules de pasos en experimentos controlados.
- Evaluación comparativa en Flickr30k: entrenar el modelo y una línea base de capacidad equivalente con la misma exposición de datos, presupuesto de ajuste y semillas, tal como recomienda el autor.
- Docencia y formación: ilustrar el flujo completo de definición de arquitectura, configuración y evaluación en un repositorio pequeño y legible.
- Desarrollo de adaptadores de carga: como el autor indica que las APIs genéricas de carga automática requieren un adaptador explícito, el repositorio sirve para practicar la integración con pipelines personalizados de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 24.832 parámetros, el checkpoint es trivial en memoria (del orden de kilobytes), pero no representa un modelo funcional.
- GPU recomendadas: no disponible; cualquier GPU con soporte PyTorch basta para pruebas de humo.
- Cabe en GPU de consumo: sí, cualquier GPU consumer moderna puede cargar el checkpoint de inicialización.
- Opciones de despliegue: PyTorch nativo mediante `eval.py`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el autor advierte que las APIs genéricas requieren un adaptador explícito.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (retrieval con arquitectura Coca) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado; los pesos son una inicialización para pruebas de humo.
- No se han auditado robustez, equidad ni transferencia de dominio.
- No se reclama ninguna puntuación de benchmark; cualquier cifra publicada por terceros debe documentarse por separado de los valores por defecto del repositorio.
- La implementación es personalizada y requiere un adaptador explícito para APIs de carga automática.
- No se especifican idiomas soportados, por lo que no puede asumirse cobertura multilingüe.
- La licencia BSD-3-Clause permite uso comercial, pero el autor recomienda revisar por separado los términos de los datos de origen si se emplean datasets externos.
- El tamaño del repositorio (0,0 GB) y el número de parámetros (24.832) indican que no se trata de un modelo utilizable en producción sin un entrenamiento completo previo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dukozlov/retrieval63
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios de código o demos.
