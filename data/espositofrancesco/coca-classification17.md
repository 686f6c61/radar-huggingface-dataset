# espositofrancesco/coca-classification17

## Resumen

`espositofrancesco/coca-classification17` es un repositorio de Hugging Face que contiene una implementación funcional del modelo **Coca** (CoCa, Contrastive Captioners) configurada para tareas de **clasificación**, en su variante de escala **base**. Lo publica el usuario `espositofrancesco` bajo licencia Apache 2.0. No se trata de un modelo entrenado ni evaluado, sino de un esqueleto de código reproducible con un checkpoint de inicialización válido para pruebas de humo (smoke tests).

El repositorio incluye el código de entrenamiento (`train.py`), la configuración de arquitectura (`config.json`), la receta de experimento por defecto (`training_args.json`) y los pesos iniciales (`model.safetensors`). El autor indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.

Por su naturaleza (16.576 parámetros en safetensors, tamaño de repo de 0,0 GB, 0 descargas y 0 likes), no es un modelo listo para producción ni para evaluación comparativa. Es relevante únicamente como punto de partida reproducible para quien quiera implementar o experimentar con una arquitectura tipo CoCa para clasificación, con atención de consulta agrupada (grouped query) y fusión de bajo rango.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (CoCa), escala base; atención grouped query; fusión low rank; activación gelu; normalización groupnorm |
| Parametros totales | 16.576 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura declarada es **Coca** en configuración **base**, con mecanismo de atención **grouped query**, fusión de características **low rank**, función de activación **gelu** y normalización **groupnorm**. El repositorio no detalla el número de capas, dimensión oculta, número de cabezas ni resolución de entrada, por lo que esos datos figuran como no disponibles. El recuento real de parámetros en safetensors (16.576) es extremadamente reducido y no corresponde a un CoCa base completo, lo que sugiere que el checkpoint es una inicialización mínima o un artefacto de prueba más que un modelo con la arquitectura completa.

En cuanto a entrenamiento, el autor indica que la receta por defecto usa el optimizador **lion** con un schedule **onecycle**, pero subraya que son valores de partida del script y no evidencia de una ejecución completada. No se especifican número de tokens, composición del dataset, ni si hubo RLHF o DPO. El propio autor recomienda entrenar todas las baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias para una evaluación significativa.

## Capacidades

- Clasificación de imágenes (según la etiqueta `classification` y la arquitectura CoCa), aunque sin checkpoint entrenado no hay capacidad efectiva demostrada.
- Implementación de referencia de arquitectura CoCa con atención grouped query y fusión low rank.
- Punto de partida reproducible para experimentos de entrenamiento (script `train.py` con bloque `__main__` de smoke test).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión-a-texto generativa ni capacidades multilingües.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- **Pruebas de humo de pipelines de clasificación**: usar `model.safetensors` como inicialización válida para verificar que el flujo de carga, forward pass y logging funciona antes de entrenar con datos reales.
- **Prototipado de arquitecturas CoCa**: servir como base de código para experimentar con atención grouped query y fusión low rank en tareas de clasificación, modificando `config.json` según el presupuesto de cómputo.
- **Reproducción de recetas de entrenamiento**: el par `training_args.json` + `train.py` permite replicar la receta lion + onecycle y comparar contra otras configuraciones bajo las mismas semillas.
- **Docencia y formación**: útil para explicar la estructura de un CoCa y el flujo de un experimento controlado, dado que el código es transparente y el autor insiste en la reproducibilidad.
- **Base para evaluación comparativa interna**: punto de partida para construir un benchmark propio con split etiquetado específico de la tarea, reportando métricas en al menos tres semillas y una baseline de capacidad equivalente.
- **Integración en pipelines de investigación**: al ser un artefacto safetensors con licencia Apache 2.0, puede incorporarse en entornos de investigación sin restricciones de uso comercial, siempre que se respeten los términos de los datos externos que se utilicen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 16.576 parámetros el checkpoint cabe holgadamente en cualquier GPU consumer, pero al no ser un modelo entrenado la estimación no es representativa de un CoCa base real.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para el checkpoint de inicialización; para entrenar un CoCa base completo se requerirían GPU de clase A100/H100 según el tamaño efectivo que se configure.
- Cabe en GPU consumer: sí, el checkpoint de inicialización cabe en cualquier GPU consumer moderna (RTX 3060 o superior) e incluso en CPU para pruebas de humo.
- Opciones de despliegue: al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no ofrece benchmarks ni comparaciones con otros modelos, y su naturaleza de checkpoint de inicialización sin entrenar impide una comparación significativa con CoCa base de referencia u otras implementaciones de clasificación.

## Limitaciones y advertencias

- El checkpoint **no ha sido entrenado**; no debe usarse para inferencia real ni para tomar decisiones en producción.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según declara el propio autor.
- No se han publicado métricas de rendimiento; cualquier afirmación de calidad sería especulativa.
- El recuento de parámetros (16.576) no corresponde a un CoCa base completo, lo que sugiere que el artefacto es una inicialización mínima o de prueba.
- Las APIs genéricas de carga automática requieren un adaptador explícito por tratarse de una implementación personalizada.
- La licencia Apache 2.0 permite uso comercial del código y pesos, pero deben revisarse por separado los términos de los datos de origen si se usan datasets externos.
- No hay información sobre sesgos, idiomas soportados ni longitud de contexto.
- Riesgo de alucinación no evaluable al no ser un modelo generativo entrenado.

## Enlaces

- Hugging Face: https://huggingface.co/espositofrancesco/coca-classification17
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
