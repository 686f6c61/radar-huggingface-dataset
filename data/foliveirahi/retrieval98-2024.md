# Foliveirahi/retrieval98-2024

## Resumen

`retrieval98-2024` es un repositorio experimental publicado por el usuario Foliveirahi en Hugging Face que contiene una implementación propia de un *Tiny Transformer* orientado a tareas de *retrieval* (recuperación de información multimodal, a juzgar por la referencia a Flickr30k en la model card). No se trata de un modelo entrenado ni evaluado: el checkpoint `model.safetensors` incluido es una inicialización válida únicamente para pruebas de humo (*smoke tests*), tal y como declara explícitamente el autor. El repositorio funciona más como andamiaje de código (`main.py`, `config.json`, `training_args.json`) que como modelo listo para usar.

La relevancia de este artefacto es, por tanto, limitada y de naturaleza didáctica o de investigación temprana. Permite inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo, pero no ofrece pesos entrenados, ni métricas, ni pipeline declarado. Cualquier uso en producción requeriría entrenar el modelo desde cero con datos propios.

El tamaño real declarado en los safetensors es de 33.088 parámetros, lo que sitúa el artefacto en la categoría de juguete (*toy model*), varios órdenes de magnitud por debajo de cualquier modelo de retrieval operativo. La licencia Apache 2.0 facilita la reutilización del código, pero no hay garantías de calidad ni de funcionamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención estándar, fusión concat + MLP, activación approx GELU, normalización InstanceNorm) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors fp32/fp16 estándar de PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización, no entrenado) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de escala "base" según la propia model card, con atención estándar (no lineal, no flash), fusión de modalidades mediante concatenación seguida de una capa MLP, activación aproximada a GELU y normalización por instancias (InstanceNorm) en lugar de LayerNorm. La receta de entrenamiento por defecto utiliza el optimizador RMSprop con un *schedule* de *linear warmup*. El autor advierte que estos valores son puntos de partida del script y no evidencia de un entrenamiento completado.

No se ha realizado entrenamiento: el checkpoint `model.safetensors` es una inicialización aleatoria válida para *smoke tests*. No hay información sobre número de tokens, composición del dataset, ni fases de RLHF/DPO/SFT. La model card sugiere evaluar sobre Flickr30k con al menos tres semillas y una línea base de capacidad comparable, pero no aporta resultados.

## Capacidades

- No hay capacidades verificadas: el modelo no está entrenado.
- El código soporta un *forward pass* de un transformer con fusión multimodal (texto-imagen, presumiblemente, dado el contexto de retrieval y Flickr30k).
- No se declara soporte de *tool calling* ni de *function calling*.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No hay modo *thinking*, visión, audio ni otras capacidades especiales implementadas más allá del esqueleto de retrieval.

## Casos de uso

- **Prototipado de arquitecturas de retrieval**: el repositorio permite modificar `config.json` y ejecutar `python main.py` para inspeccionar cómo cambian las dimensiones y el flujo tensorial antes de invertir en un entrenamiento real.
- **Pruebas de humo en pipelines de CI**: el checkpoint de inicialización puede usarse para verificar que un *wrapper* de carga de safetensors, un *dataloader* o un script de exportación funcionan sin errores de forma o *dtype*.
- **Docencia y experimentación académica**: sirve como base mínima para explicar la estructura de un transformer con fusión multimodal en un curso o taller, dado su tamaño reducido (33.088 parámetros).
- **Reproducción de recetas de entrenamiento**: el archivo `training_args.json` documenta una receta con RMSprop y *linear warmup* que puede replicarse o compararse con alternativas (AdamW, cosine) en un *benchmark* controlado.
- **Generación de líneas base de capacidad mínima**: útil para comprobar que un *pipeline* de evaluación sobre Flickr30k detecta correctamente un modelo que no aprende (control negativo).
- **Integración en *frameworks* de investigación**: al ser una implementación propia, requiere un adaptador explícito para APIs genéricas de carga; sirve para probar la robustez de dichos adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en fp32 (33.088 parámetros × 4 bytes ≈ 132 KB), despreciable en cualquier GPU.
- GPU recomendadas: cualquiera; el modelo cabe en CPU sin problema.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, e incluso iGPU).
- Opciones de despliegue: ejecución directa con PyTorch (`python main.py`); no es compatible con vLLM, TGI, llama.cpp ni Ollama sin conversión y adaptación previas, dado que es una implementación personalizada.
- Latencia y throughput: no disponibles; al no estar entrenado, las mediciones carecen de sentido práctico.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (tiny transformer de retrieval con 33.088 parámetros y checkpoint sin entrenar). Cualquier comparación con modelos de retrieval operativos (por ejemplo, CLIP o SigLIP) sería engañosa por diferencia de escala, datos y propósito.

## Limitaciones y advertencias

- El checkpoint **no está entrenado**: los pesos son una inicialización aleatoria y no producen representaciones útiles.
- No hay evaluación de robustez, equidad ni transferencia de dominio; el autor lo declara explícitamente.
- No hay información sobre sesgos, idiomas o dominio de aplicación.
- El código es una implementación personalizada: las APIs automáticas de carga de Hugging Face (`AutoModel`, `from_pretrained`) requieren un adaptador explícito.
- La licencia Apache 2.0 cubre el código y los pesos, pero los términos de los datos externos (por ejemplo Flickr30k) deben revisarse por separado.
- No apto para producción sin entrenamiento previo, evaluación con al menos tres semillas y línea base comparable, y auditoría de sesgos.
- La fecha de creación declarada (2026-11-21) es futura respecto a la redacción habitual de fichas; conviene verificar la vigencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Foliveirahi/retrieval98-2024
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados.
