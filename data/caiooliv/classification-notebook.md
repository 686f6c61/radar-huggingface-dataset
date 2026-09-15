# caiooliv/classification-notebook

## Resumen

El modelo `caiooliv/classification-notebook` es un prototipo de investigación de arquitectura híbrida orientado a tareas de clasificación. Ha sido desarrollado por el autor `caiooliv` y publicado en HuggingFace con licencia MIT. Se trata de un checkpoint de inicialización, no de un modelo entrenado: la model card indica explícitamente que los pesos incluidos sirven únicamente para pruebas de humo (smoke tests) y que no se presentan como un checkpoint con rendimiento verificado.

La arquitectura es de escala "tiny" y combina atención multi-query, fusión Tucker, activación Mish y normalización LayerNorm. El tamaño total de parámetros es de 33.088 según los metadatos de los pesos en formato safetensors. No se especifica la longitud de contexto, los idiomas soportados ni ningún dato de entrenamiento. El repositorio incluye un script Python (`eval.py`) con un ejemplo ejecutable y un punto de entrada de entrenamiento, además de los archivos de configuración `config.json` y `training_args.json`. Su relevancia actual es limitada: sirve como punto de partida experimental para investigar arquitecturas híbridas de clasificación, pero no es apto para uso práctico en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid (tiny) |
| Parámetros totales | 33.088 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un prototipo híbrido de escala reducida. Según la model card, emplea atención multi-query, fusión mediante producto de Tucker, activación Mish y normalización LayerNorm. No se proporcionan detalles adicionales sobre la composición de la arquitectura ni sobre los datos de entrenamiento. El checkpoint incluido (`model.safetensors`) es un estado de inicialización válido para pruebas de humo, pero no ha sido entrenado. El repositorio documenta una receta de experimento por defecto que usa el optimizador Adafactor con programación de tasa de aprendizaje coseno, aunque se indica que estos valores son puntos de partida y no evidencia de un entrenamiento completado. No se menciona ningún proceso de RLHF, DPO ni ajuste fino posterior.

## Capacidades

- No se han verificado capacidades funcionales. El modelo es un checkpoint de inicialización sin entrenar.
- Arquitectura diseñada para tareas de clasificación, pero sin pesos entrenados que permitan realizar predicciones útiles.
- El script `eval.py` incluye un ejemplo de ejecución y un punto de entrada de entrenamiento, pero esto es una característica del código, no del modelo.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- No disponible. Al no existir un modelo entrenado, no hay casos de uso prácticos verificados.
- Su utilidad se limita al ámbito de la investigación: explorar arquitecturas híbridas de clasificación y validar implementaciones personalizadas con pruebas de humo.
- Cualquier aplicación real requeriría entrenar el modelo desde cero con un conjunto de datos etiquetado y evaluar su rendimiento de forma independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reclama ninguna puntuación de referencia en este repositorio y que el checkpoint de inicialización no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamaño de 33.088 parámetros, el consumo de memoria es despreciable (inferior a 1 MB en FP32).
- GPU recomendadas: no disponible. Cualquier hardware, incluidas CPUs, es suficiente para cargar el checkpoint.
- ¿Cabe en GPU de consumo? Sí, de forma trivial.
- Opciones de despliegue: no disponible. La model card indica que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. El modelo es un prototipo de investigación sin entrenar, por lo que no puede compararse con modelos publicados de la misma categoría.

## Limitaciones y advertencias

- El checkpoint de inicialización no ha sido entrenado; no puede realizar ninguna tarea de clasificación de forma efectiva.
- No ha sido auditado en términos de robustez, equidad ni transferencia de dominio.
- La implementación debe tratarse como un punto de partida experimental, no como un modelo listo para producción.
- Los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto incluidos en este repositorio.
- La licencia MIT permite uso comercial, pero la model card advierte que deben revisarse los términos de las fuentes de datos externas si se utilizan con este repositorio.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones de contexto e idioma, ya que el modelo no ha sido entrenado.

## Enlaces

- HuggingFace: https://huggingface.co/caiooliv/classification-notebook
