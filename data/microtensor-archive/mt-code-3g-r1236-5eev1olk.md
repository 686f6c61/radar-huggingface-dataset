# microtensor-archive/mt-code-3g-r1236-5EEv1oLk

## Resumen

`microtensor-archive/mt-code-3g-r1236-5EEv1oLk` es una copia de archivo de un sistema presentado a la subred Microtensor de Bittensor (netuid 92), especializado en tareas de código bajo la arena `code/mt-3g`. El modelo está empaquetado en formato GGUF y tiene aproximadamente 596 millones de parámetros, lo que lo sitúa en la gama de modelos pequeños orientados a generación de código. Su autor es la organización `microtensor-archive`, que actúa como repositorio de sistemas certificados por los validadores de la red.

La relevancia de este modelo reside en su procedencia: no es un modelo independiente con documentación propia, sino una instantánea certificada por una subred de Bittensor que mide calidad y coste en hardware de referencia. La puntuación de calidad asignada por la red es 0.0, lo que indica que no supera el umbral mínimo para ser considerado útil en su arena. El tiempo esperado por consulta es de 14 792 ms, un valor alto para un modelo de este tamaño. La ficha técnica se elabora a partir de los metadatos disponibles; la mayor parte de los detalles de arquitectura y entrenamiento no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 596 049 920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, sin especificar variante) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna (transformer, MoE, etc.), el dataset de entrenamiento, el numero de tokens ni el proceso de alineamiento (RLHF, DPO, etc.). La model card del repositorio se limita a describir el modelo como un archivo certificado por la subred, sin detalles tecnicos del sistema. El manifiesto `manifest.json` enlaza la revision de un modelo base, pero esa referencia no se ha hecho publica en el repositorio.

## Capacidades

- Generacion de codigo: el modelo esta clasificado dentro de la arena `code/mt-3g`, por lo que su funcion principal es la generacion de codigo, aunque no se especifican los lenguajes soportados.
- Conversacion: la etiqueta `conversational` sugiere capacidad para dialogos, pero no hay ejemplos ni documentacion que lo confirme.
- No se dispone de informacion sobre soporte de tool calling, razonamiento multi-step, vision, audio u otras capacidades especiales.

## Casos de uso

No se dispone de documentacion que describa casos de uso concretos y validados para este modelo. Al carecer de informacion sobre su entrenamiento, idiomas y calidad real, no es recomendable emplearlo en entornos de produccion. Cualquier aplicacion basada en el requeriria una evaluacion previa exhaustiva que no se ha publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica conocida es la asignada por la red Microtensor:

- Calidad medida: 0.0 (sobre una escala no especificada)
- Coste esperado: 14 792 ms por consulta en hardware de referencia
- Replicacion: 1 (una sola ejecucion)

Estos datos no son comparables con benchmarks convencionales y reflejan una evaluacion interna de la subred.

## Requisitos de hardware

- El modelo tiene 596 millones de parametros y un tamano de repositorio de 0.5 GB. En formato GGUF cuantizado, el peso en memoria podria caber en una GPU de consumo con al menos 4 GB de VRAM, aunque no se ha confirmado ningun requisito oficial.
- No se indica ninguna GPU recomendada en la documentacion.
- Al ser un archivo GGUF, es compatible con motores como llama.cpp, Ollama y otros que admiten este formato, pero no se ha verificado su funcionamiento.
- No hay datos de latencia ni throughput mas alla del coste medido por la red (14 792 ms por consulta), que es elevado para el tamano del modelo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. Existe un modelo de referencia `microtensor-io/baseline-front-mt3g` en Hugging Face, pero no se han publicado sus especificaciones tecnicas ni su rendimiento. No se conocen otros modelos comparables con los mismos datos de parametros y contexto.

## Limitaciones y advertencias

- La calidad medida por la red es 0.0, lo que sugiere que el modelo no alcanza un nivel minimo de utilidad en su arena de referencia.
- No se ha publicado ninguna informacion sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia es desconocida; no se puede confirmar si permite uso comercial o modificacion.
- Es un archivo de la subred Microtensor, no un modelo mantenido activamente; puede contener errores o estar desactualizado.
- No se recomienda su uso en produccion sin una evaluacion exhaustiva previa, dado que no hay documentacion tecnica ni resultados de pruebas independientes.

## Enlaces

- [Repositorio Hugging Face](https://huggingface.co/microtensor-archive/mt-code-3g-r1236-5EEv1oLk)
- [Repositorio GitHub de la subred](https://github.com/enka1504/sn92-mt3g)
- [Repositorio GitHub de Microtensor](https://github.com/microtensor-io/microtensor-subnet)
- [Modelo de referencia en Hugging Face](https://huggingface.co/microtensor-io/baseline-front-mt3g)
- [Sitio web de Microtensor](https://microtensor.vercel.app/)
