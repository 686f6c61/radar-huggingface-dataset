# dragonlimited/DragonCode-150M

## Resumen

DragonCode-150M es un modelo de lenguaje de dominio de código, con 150 millones de parámetros, desarrollado por el usuario dragonlimited. Según la model card, pertenece a la familia DragonCode y se encuentra en una fase de preentrenamiento, no en una versión final lista para producción. El modelo está diseñado para tareas de programación, con un pipeline de datos orientado exclusivamente a fuentes de código como `codeparrot-clean` y `codeforces-cots`.

Su relevancia actual es limitada, ya que el autor documenta un reinicio completo del entrenamiento: todos los checkpoints previos (pasos 2000 a 46000, unos 780 millones de tokens) fueron eliminados debido a cuatro errores críticos en el script de entrenamiento, y el preentrenamiento se reinicia desde cero. El modelo no tiene aún pesos publicados válidos ni resultados de evaluación. Tamaño del repo es de 12.5 GB, probablemente correspondiente al dataset tokenizado retenido (unos 3.42B tokens), no a los pesos del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 150M (según nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (sin pesos publicados) |

## Arquitectura y entrenamiento

La arquitectura concreta no se especifica en la información disponible. El modelo es descrito como un "code-domain language model" de 150M de parámetros, en fase de preentrenamiento. El dataset de entrenamiento originalmente incluía corpora web genéricos (`fineweb-edu`, `SlimPaj627B`, `The-Pile`), pero se determinó que esto era un error y se descartó. El pipeline actual utiliza exclusivamente fuentes de código: `codeparrot-clean` y `codeforces-cots`, con un total de aproximadamente 3.42 mil millones de tokens tokenizados en un caché llamado `DragonCode-Tokenized-Pretrain`.

El entrenamiento se reinició desde el paso 0 el 25 de agosto de 2026, tras eliminar todos los checkpoints anteriores. Los bugs documentados incluyen un bucle infinito en la acumulación de gradientes, una tasa de aprendizaje que colapsaba a cero, un error de serialización con `bytes` en el estado del entrenador, y un parámetro incompatible en `huggingface_hub`. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- No se han publicado capacidades funcionales del modelo, ya que no hay pesos disponibles.
- El objetivo declarado es el dominio de código, por lo que se espera generación y comprensión de código fuente.
- No hay información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión, audio u otras capacidades.

## Casos de uso

No se pueden proporcionar casos de uso realistas hasta que el modelo esté entrenado y sus capacidades sean evaluadas. Dado el estado actual, no es recomendable su uso en ningún escenario práctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos para este modelo.
- El tamaño de 150M de parámetros sugiere que, una vez entrenado, podría ejecutarse en GPUs de consumo (p. ej., RTX 3090, RTX 4090) con cuantización, pero esto no está confirmado.
- No hay información sobre opciones de despliegue (vLLM, llama.cpp, etc.).

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría y tamaño con los que se pueda comparar de forma fiable, ya que DragonCode-150M está en fase de entrenamiento y no tiene métricas publicadas.

## Limitaciones y advertencias

- El entrenamiento se reinició por completo; los pesos actuales no existen o no son estables.
- No hay garantía de que el modelo final sea funcional ni de que alcance las capacidades esperadas.
- La licencia es desconocida; no se puede asumir permiso de uso comercial.
- No se han publicado evaluaciones de sesgos, alucinaciones o riesgos de seguridad.
- El modelo está diseñado para código, por lo que su uso fuera de ese dominio no está justificado.
- El tamaño del repo (12.5 GB) es inusualmente grande para 150M de parámetros, lo que sugiere que incluye el dataset tokenizado y no los pesos del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/dragonlimited/DragonCode-150M
- Sitio web DragonCode (no relacionado con este modelo): https://dragoncode.codes/
- Repositorio GitHub Dragon-Code (no relacionado con este modelo): https://github.com/naoum40/Dragon-Code
