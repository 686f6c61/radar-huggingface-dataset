# hamm-eyer/blip-demo

## Resumen

`hamm-eyer/blip-demo` es un repositorio experimental publicado en Hugging Face que contiene una implementación propia de la arquitectura BLIP (Bootstrapping Language-Image Pre-training) orientada a tareas multitarea, en una configuración de escala pequeña. Lo desarrolla el usuario hamm-eyer y no procede de un laboratorio con publicaciones asociadas. El repositorio se presenta explícitamente como un punto de partida reproducible para pruebas de humo (smoke tests), no como un modelo entrenado ni evaluado.

El checkpoint incluido (`model.safetensors`) es una inicialización válida, pero el propio autor indica que no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio. El número de parámetros reportado en los metadatos de safetensors es de 49.600, lo que confirma que se trata de una configuración mínima pensada para validar código, no para producción.

Su relevancia es, por tanto, didáctica y de ingeniería: sirve como andamiaje para experimentar con una arquitectura multimodal tipo BLIP, con atención multi-query, fusión de bajo rango, activación mish y normalización groupnorm, y con una receta de entrenamiento por defecto basada en el optimizador lion con calentamiento lineal. No debe confundirse con los pesos oficiales de BLIP de Salesforce.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (implementación propia), escala small |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema BLIP con variantes concretas declaradas por el autor: atención multi-query, fusión de características de bajo rango, función de activación mish y normalización groupnorm. La escala es "small" y el recuento real de parámetros del checkpoint es de 49.600, coherente con un modelo de validación más que con un sistema multimodal funcional. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto.

No hay evidencia de entrenamiento real: el autor afirma que `model.safetensors` es un checkpoint de inicialización para pruebas de humo y que no se reclama ninguna puntuación de benchmark. La receta por defecto usa el optimizador lion con un calendario de calentamiento lineal, pero se presentan como valores de partida del script, no como resultado de una ejecución completada. No se documentan volúmenes de tokens, composición del dataset, ni fases de RLHF o DPO.

## Capacidades

- El repositorio no documenta capacidades funcionales verificadas; el checkpoint no ha sido entrenado.
- La arquitectura BLIP está diseñada conceptualmente para tareas visión-lenguaje (captioning, retrieval, VQA), pero no hay evidencia de que esta implementación las ejecute correctamente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan modos especiales (thinking, visión operativa, audio).
- El único artefacto funcional descrito es `eval.py`, con un bloque `__main__` de ejemplo de prueba de humo.

## Casos de uso

- Pruebas de humo de pipelines de entrenamiento: usar `eval.py` y `training_args.json` para validar que un entorno de experimentación con lion y calentamiento lineal arranca sin errores antes de escalar a un modelo real.
- Andamiaje para investigación en arquitecturas BLIP: partir de esta implementación para estudiar variantes de atención multi-query y fusión de bajo rango en un contexto multimodal controlado.
- Docencia y formación: ilustrar la estructura de un repositorio de modelo (config, training args, checkpoint, script de evaluación) con un ejemplo mínimo y reproducible.
- Comparación de recetas de entrenamiento: emplear la configuración por defecto como línea base reproducible frente a otras recetas (AdamW, schedulers alternativos) manteniendo la misma exposición de datos y semillas.
- Integración en tests de CI: verificar que las APIs de carga de safetensors y las dependencias de PyTorch funcionan en un entorno concreto usando un checkpoint de 49.600 parámetros.
- Prototipado de adaptadores: como el autor advierte que las APIs genéricas de carga automática requieren un adaptador explícito, el repo sirve para desarrollar y probar dicho adaptador antes de aplicarlo a checkpoints BLIP reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que las afirmaciones de benchmark se omiten de forma deliberada y que el checkpoint no se presenta como un modelo entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 49.600 parámetros en fp32 el peso ocupa aproximadamente 0,2 MB, por lo que cualquier GPU consumer sirve.
- GPU recomendadas: cualquiera; el modelo cabe en CPU y en GPUs integradas. Para pruebas de humo no se requiere acelerador dedicado.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) y en la mayoría de entornos sin GPU.
- Opciones de despliegue: carga directa con PyTorch y safetensors; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El autor advierte que las APIs genéricas de carga automática requieren un adaptador explícito.
- Latencia y throughput: no disponibles; al no ser un modelo entrenado, las métricas de rendimiento carecen de sentido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| hamm-eyer/blip-demo | 49.600 | no disponible | Apache 2.0 | Checkpoint de inicialización, sin entrenar |
| Salesforce BLIP (oficial) | ~224 M (base) | no disponible | BSD-3-Clause (según versión) | Entrenado y evaluado en tareas visión-lenguaje |
| BLIP-2 (oficial) | ~1,1 B a 12 B según variante | no disponible | BSD-3-Clause (según versión) | Entrenado, con benchmarks publicados |
| Otros repositorios "demo" de BLIP en Hugging Face | variable | no disponible | variable | Generalmente no entrenados |

La comparación con BLIP y BLIP-2 oficiales es solo estructural: este repositorio no comparte pesos ni resultados con ellos y su escala es tres o cuatro órdenes de magnitud menor.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado; no produce salidas fiables en ninguna tarea.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según el propio autor.
- Riesgo de alucinación: no aplica en el sentido habitual porque el modelo no genera texto coherente; cualquier salida debe considerarse ruido.
- No hay información sobre sesgos, idiomas ni cobertura de contexto.
- Licencia Apache 2.0 permite uso comercial del código y los pesos, pero el autor recomienda revisar por separado los términos de los datos de origen si se usa con datasets externos.
- No apto para producción: cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí incluidos.
- Las APIs genéricas de carga automática de Hugging Face pueden fallar sin un adaptador explícito, lo que complica la integración directa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hamm-eyer/blip-demo
- Paper original de BLIP: no disponible en la información proporcionada
- Paper de BLIP-2: no disponible en la información proporcionada
- Repositorio oficial de Salesforce BLIP: no disponible en la información proporcionada
- Demos o blogs adicionales: no disponible en la información proporcionada
