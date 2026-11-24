# annaidu98/classification-test

## Resumen

`annaidu98/classification-test` es un prototipo de investigación publicado en Hugging Face por el usuario annaidu98 bajo licencia Apache 2.0. Se presenta como una implementación de arquitectura "Mae" (según la model card, con atención de ventana deslizante, fusión tipo Tucker, activación swish y normalización "scalenorm") orientada a tareas de clasificación. El repositorio incluye un script `run.py` con un punto de entrada ejecutable, un `config.json` con la configuración de arquitectura, un `training_args.json` con la receta de experimento por defecto y un checkpoint de inicialización en `model.safetensors`.

Es importante subrayar que el propio autor declara explícitamente que el checkpoint **no ha sido entrenado** ni auditado, y que no se reclama ninguna métrica de rendimiento. El peso en safetensors contiene 33.088 parámetros totales, un tamaño extremadamente reducido que confirma su naturaleza de prueba de humo (smoke test) más que de modelo funcional. El repositorio ocupa 0.0 GB y no registra descargas ni interacciones en el momento de la consulta.

Por tanto, esta ficha documenta un artefacto de investigación en estado embrionario: útil como plantilla reproducible de configuración y como ejemplo de estructura de repositorio, pero no apto para despliegue en producción ni para evaluación comparativa de capacidades. No debe confundirse con un modelo entrenado ni con un clasificador listo para uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mae (atención de ventana deslizante, fusión Tucker, activación swish, normalización scalenorm) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La model card describe una arquitectura denominada "Mae" en escala "xlarge", con mecanismo de atención de ventana deslizante, fusión de características mediante descomposición de Tucker, función de activación swish y normalización scalenorm. No se proporciona información sobre el número de capas, dimensión de los embeddings, número de cabezas de atención ni tamaño de la ventana deslizante. El recuento real de parámetros en safetensors (33.088) es incompatible con la etiqueta "xlarge" y sugiere que la configuración incluida corresponde a una instancia mínima de prueba.

En cuanto al entrenamiento, la receta por defecto en `training_args.json` utiliza el optimizador Lion con un scheduler de tipo "step". El autor advierte explícitamente que estos son valores de partida del script y no evidencia de una ejecución completada. No se documenta volumen de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste supervisado. El checkpoint `model.safetensors` se describe como inicialización válida para pruebas de humo, no como pesos entrenados. No se reporta ninguna innovación técnica adicional más allá de la combinación arquitectónica mencionada.

## Capacidades

- No se ha documentado ninguna capacidad funcional verificada: el checkpoint no ha sido entrenado.
- Clasificación: es el objetivo declarado del prototipo, pero no hay evidencia de que el modelo realice clasificación con precisión útil.
- Generación de texto: no aplicable según la información disponible (el modelo está orientado a clasificación, no a generación).
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Ejecución de ejemplo: el script `run.py` incluye un bloque `__main__` con un ejemplo de smoke test ejecutable mediante `python run.py --help`.

## Casos de uso

- Prueba de humo de pipelines de carga de safetensors: el checkpoint de 33.088 parámetros permite verificar que un entorno de inferencia (PyTorch, safetensors) carga correctamente pesos y configuración antes de escalar a modelos reales.
- Plantilla de estructura de repositorio de investigación: sirve como referencia para organizar `config.json`, `training_args.json`, `run.py` y `model.safetensors` en publicaciones de modelos experimentales.
- Base para experimentos de arquitectura: investigadores interesados en combinaciones de atención de ventana deslizante con fusión Tucker y normalización scalenorm pueden partir de esta configuración para construir y entrenar su propia instancia.
- Reproducción de recetas de entrenamiento: el `training_args.json` con Lion y scheduler step puede reutilizarse como punto de partida en experimentos controlados con datos propios.
- Evaluación metodológica: el autor propone usar una partición etiquetada específica de la tarea, reportar la métrica en al menos tres semillas y comparar con una línea base de capacidad equivalente; el repositorio sirve como esqueleto para ese protocolo.
- Docencia y formación: útil para ilustrar la diferencia entre un checkpoint de inicialización y un modelo entrenado, y para enseñar buenas prácticas de documentación de artefactos de investigación.
- Integración en CI/CD de validación de modelos: un script como `run.py` puede adaptarse como test automatizado que compruebe la integridad de pesos y configuración en cada commit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación de rendimiento y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en precisión original (33.088 parámetros en safetensors); cualquier GPU con más de 1 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) puede alojar el checkpoint sin problemas; no se requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: PyTorch nativo mediante `run.py`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el autor advierte que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito.
- Latencia y throughput: no disponibles; al no estar entrenado, las mediciones no serían representativas de ninguna tarea real.

## Comparativa con modelos similares

No disponible. No se identifican en la información proporcionada modelos comparables de la misma categoría (prototipos de clasificación con arquitectura Mae y 33.088 parámetros). Las alternativas habituales de clasificación (por ejemplo, familia BERT, RoBERTa o clasificadores basados en ViT) no son equiparables en estado ni en propósito a este artefacto de inicialización.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: los pesos son una inicialización aleatoria o por defecto, sin capacidad predictiva útil.
- No se ha auditado robustez, equidad ni transferencia de dominio; el autor lo califica de punto de partida experimental.
- Riesgo de alucinación: no aplicable en sentido estricto al no ser un modelo generativo entrenado, pero cualquier salida del checkpoint carece de valor semántico.
- Sin idiomas declarados ni contexto documentado: no es posible evaluar comportamiento multilingüe ni de ventana larga.
- La etiqueta "xlarge" de la model card no concuerda con los 33.088 parámetros reales del safetensors; tratar la escala como no fiable.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el autor recomienda revisar por separado los términos de los datos de origen si se combina con datasets externos.
- Cualquier resultado de un futuro checkpoint entrenado deberá documentarse por separado de los valores por defecto aquí incluidos.
- No apto para producción: ausencia de pipeline declarado, de métricas y de validación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/annaidu98/classification-test
