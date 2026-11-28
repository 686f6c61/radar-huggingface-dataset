# flaukowski/kannaka-brain-experimental-runs

## Resumen

`kannaka-brain-experimental-runs` es un repositorio de archivo publicado por el usuario flaukowski que recopila ejecuciones de entrenamiento intermedias y no publicadas de la familia de modelos Kannaka brain, realizadas entre el 5 y el 13 de septiembre de 2026 en GPUs alquiladas (A100 y RTX 4090). No se trata de un modelo listo para uso: el propio autor lo etiqueta como experimental y advierte explícitamente de que nada del contenido ha sido evaluado y de que no debe interpretarse como una afirmación sobre su calidad.

El repositorio contiene 268.435.456 parámetros según los pesos en safetensors, con un tamaño total de 8,7 GB, lo que incluye adaptadores LoRA, checkpoints intermedios con estado del optimizador y conversiones a GGUF. La estructura se organiza en carpetas por ejecución, nombradas según la GPU y la hora de inicio, con subcarpetas como `adapter/`, `gguf/`, `ckpt/`, `real/` y `scr/`.

Su relevancia es limitada desde el punto de vista práctico: no hay model card de uso, no se declaran idiomas, no hay benchmarks ni pipeline definido, y la licencia es "other" sin aclaración de términos. Resulta útil únicamente como material de archivo o para investigación sobre procesos de entrenamiento, no como base para despliegues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los artefactos son adaptadores LoRA y checkpoints; no se especifica la arquitectura base) |
| Parametros totales | 268.435.456 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se menciona conversión a GGUF en algunas ejecuciones; no se detallan los tipos concretos) |
| Idiomas soportados | no disponible |
| Licencia | other (sin términos especificados) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. El repositorio contiene artefactos de entrenamiento: adaptadores LoRA tal como se entrenaron, checkpoints intermedios con estado del optimizador y conversiones a GGUF. Las ejecuciones se realizaron en GPUs A100 y RTX 4090 entre el 5 y el 13 de septiembre de 2026, y cada carpeta corresponde a una ejecución identificada por GPU y hora de inicio. Algunas ejecuciones se dividen en dos brazos denominados `real/` y `scr/`.

No se incluyen los datos de entrenamiento ni los registros de las ejecuciones, por lo que no es posible determinar el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El autor indica que los archivos idénticos a los adaptadores ya publicados en los repositorios `kannaka-brain-*` fueron excluidos de este archivo.

## Capacidades

- No se declaran capacidades funcionales en la información disponible.
- No hay indicación de soporte de tool calling ni function calling.
- No hay indicación de soporte de agentes ni de razonamiento multi-paso.
- No se especifican capacidades multilingües.
- No se documentan modos especiales (thinking mode, visión, audio).
- El contenido son artefactos de entrenamiento (adaptadores LoRA, checkpoints, GGUF), no un modelo empaquetado para inferencia directa.

## Casos de uso

- Archivo histórico de experimentos: conservar ejecuciones intermedias de entrenamiento para trazabilidad interna del proyecto Kannaka brain, dado que el repositorio está etiquetado como `archive`.
- Investigación sobre entrenamiento con LoRA: analizar los adaptadores tal como se entrenaron en distintas ejecuciones (A100 frente a RTX 4090) para estudiar diferencias de configuración, siempre que se disponga de los scripts originales, que no se incluyen.
- Estudio de checkpoints intermedios: los archivos en `ckpt/` incluyen estado del optimizador, lo que permite reanudar o inspeccionar el proceso de entrenamiento en un contexto de investigación.
- Reproducción de conversiones a GGUF: las carpetas `gguf/` sirven como referencia para validar pipelines de conversión y cuantización de adaptadores.
- Comparación de brazos de ejecución: las carpetas `real/` y `scr/` permiten contrastar dos variantes de una misma ejecución en un estudio interno.
- Docencia o demostración de flujos de trabajo con LoRA: usar los artefactos como ejemplo de organización de un archivo de ejecuciones experimentales.

Ninguno de estos casos implica uso en producción: el autor advierte de que el contenido no ha sido evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de adaptadores LoRA y checkpoints, el requisito depende del modelo base, que no se especifica.
- GPU recomendadas: las ejecuciones se realizaron en A100 y RTX 4090, pero no se documentan requisitos de inferencia.
- Compatibilidad con GPU de consumo: no determinable sin conocer el modelo base.
- Opciones de despliegue: no disponibles; el repositorio no declara pipeline ni formato de inferencia listo para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio es un archivo de ejecuciones experimentales sin modelo base declarado ni métricas, por lo que no existen alternativas comparables en la misma categoría con datos verificables.

## Limitaciones y advertencias

- El autor declara explícitamente que es experimental y que no es una release; nada ha sido evaluado para uso.
- No debe interpretarse como una afirmación sobre la calidad del modelo.
- No se incluyen datos de entrenamiento ni registros de ejecución, lo que impide auditar el proceso.
- Licencia "other" sin términos concretos: no se aclaran restricciones de uso comercial.
- No se declaran idiomas soportados ni pipeline, lo que impide evaluar idoneidad lingüística.
- Riesgo de sesgos y alucinaciones no evaluado ni documentado.
- Los checkpoints intermedios con estado del optimizador no están pensados para inferencia directa.
- El tamaño del repositorio (8,7 GB) y la ausencia de documentación de uso incrementan el coste de adopción.

## Enlaces

- Hugging Face: https://huggingface.co/flaukowski/kannaka-brain-experimental-runs
- Repositorios de modelos publicados de la familia: `kannaka-brain-*` (referenciados en la model card; no se proporcionan URLs concretas en la información disponible)
