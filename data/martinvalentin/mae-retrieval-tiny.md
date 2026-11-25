# martinvalentin/mae-retrieval-tiny

## Resumen

mae-retrieval-tiny es un prototipo de investigación publicado por el usuario martinvalentin en Hugging Face. Se presenta como una implementación de una arquitectura denominada "Mae" orientada a tareas de retrieval (recuperación de información multimodal, a juzgar por la recomendación de evaluar sobre Flickr30k). No se trata de un modelo entrenado ni ajustado: el checkpoint incluido es una inicialización válida para pruebas de humo (smoke tests), no un modelo con pesos entrenados.

El repositorio es extremadamente ligero (16.576 parámetros totales según los safetensors, tamaño de repo de 0,0 GB) y su propósito declarado es documentar la estructura del código, los formatos de fichero y una receta de entrenamiento por defecto, sin aportar métricas de rendimiento verificadas. La model card es explícita al afirmar que no se reclama ninguna puntuación de benchmark.

Por tanto, esta ficha describe un artefacto de investigación reproducible más que un modelo listo para producción. Su relevancia es la de un punto de partida experimental para quien quiera reproducir o extender la arquitectura Mae en tareas de retrieval, con la advertencia de que no existen pesos entrenados ni evaluaciones publicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mae (transformer con atención dilatada y fusión co-attention) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura declarada es "Mae", con atención dilatada (dilated attention), mecanismo de fusión mediante co-attention, función de activación ReLU y normalización por BatchNorm. La escala indicada en la model card es "giant", aunque el número real de parámetros del checkpoint (16.576) contradice esa etiqueta: se trata de una configuración mínima de inicialización, no de un modelo de escala giant entrenado. El repositorio incluye `train.py` como artefacto principal, además de `config.json` (ajustes de arquitectura generados) y `training_args.json` (receta de experimento por defecto).

La receta de entrenamiento por defecto emplea el optimizador LAMB con un schedule polinómico (polynomial). La model card aclara que estos son valores de partida del script y no evidencia de un entrenamiento completado. No se documenta el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La implementación es personalizada, por lo que las APIs genéricas de carga automática de transformers requieren un adaptador explícito para funcionar.

## Capacidades

- No hay capacidades verificadas: el checkpoint es una inicialización sin entrenar.
- El objetivo declarado es retrieval (recuperación), presumiblemente multimodal dado que la evaluación sugerida es Flickr30k.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan modos especiales (thinking, visión, audio) más allá del propósito de retrieval.

## Casos de uso

- Reproducción de investigación en retrieval: serviría como base para entrenar desde cero la arquitectura Mae sobre un dataset propio y comparar con líneas base de igual capacidad, tal como sugiere la propia model card.
- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización permite validar que el script `train.py`, la carga de datos y el guardado de pesos funcionan antes de lanzar un entrenamiento real.
- Evaluación de retrieval multimodal sobre Flickr30k: la model card propone esta tarea como primera evaluación útil, reportando la métrica con al menos tres semillas.
- Estudio de mecanismos de atención dilatada y co-attention: útil para investigadores que quieran analizar el comportamiento de estas variantes arquitectónicas en tareas de recuperación.
- Desarrollo de adaptadores de carga personalizados: dado que la implementación no es compatible con las APIs genéricas, sirve para construir y probar el adaptador necesario.
- Docencia y experimentación académica: por su tamaño mínimo (16.576 parámetros) y licencia permisiva, es adecuado para entornos con recursos limitados donde se quiera estudiar el flujo completo de entrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 16.576 parámetros el checkpoint ocupa unos pocos kilobytes.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el cuello de botella sería el entrenamiento, no la inferencia.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: al ser una implementación personalizada, requiere el adaptador explícito mencionado en la model card; no se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma arquitectura o del mismo propósito experimental.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce resultados útiles en tareas reales de retrieval.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según la propia model card.
- No hay métricas de rendimiento publicadas ni evidencia de una ejecución de entrenamiento completada.
- La etiqueta de escala "giant" no se corresponde con el número real de parámetros del checkpoint (16.576), lo que puede inducir a confusión.
- La implementación es personalizada y no se carga con APIs automáticas estándar sin un adaptador.
- Licencia apache-2.0 permisiva para uso comercial, pero deben revisarse por separado los términos de los datos de origen si se usan datasets externos.
- Riesgo de alucinación y sesgos: no evaluables al no existir un modelo entrenado.

## Enlaces

- Hugging Face: https://huggingface.co/martinvalentin/mae-retrieval-tiny
