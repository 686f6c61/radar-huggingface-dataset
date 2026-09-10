# Jeesup/svd-safety-l2_remove40_gap_b001

## Resumen

El modelo `Jeesup/svd-safety-l2_remove40_gap_b001` es un artefacto de investigacion desarrollado por Jeesup que parte del modelo `meta-llama/Llama-2-7b-chat-hf` y lo comprime mediante la tecnica SVD-LLM. El resultado es un checkpoint con el 60.1% de los parametros densos originales, es decir, se han eliminado el 39.92% de los parametros mediante descomposicion en valores singulares. Ademas, se restauran 640 componentes SVD seleccionados con la regla `gap`, usando un presupuesto del 0.100% del total de parametros densos.

El proposito del modelo es estudiar como la compresion SVD afecta al comportamiento de seguridad de modelos de lenguaje alineados y que reglas de seleccion de componentes son mas efectivas para reparar el dano. No es un modelo generalista ni esta pensado para uso en produccion, sino para experimentos academicos sobre interpretabilidad, compresion y alineacion. Su arquitectura es la de un transformer Llama-2, con un total de 6.738.415.616 parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se obtiene a partir de `meta-llama/Llama-2-7b-chat-hf` mediante compresion SVD-LLM. Esta tecnica aplica descomposicion en valores singulares sobre las matrices de pesos del transformer y elimina los componentes singulares menos relevantes hasta alcanzar la proporcion objetivo. En este caso se elimina el 39.92% de los parametros, dejando una fraccion de parametros de 0.6008. Posteriormente se restauran 640 componentes singulares, seleccionados segun la regla `gap`, con un presupuesto total del 0.100% de los parametros densos. No se intercambia ningun componente adicional (`components swapped out: 0`). La semilla utilizada es 42.

No se proporcionan detalles sobre los datos de entrenamiento ni sobre procesos de RLHF o DPO adicionales. El modelo base ya habia sido ajustado con tecnicas de alineacion por Meta. Para este comprimido no se indica ningun paso extra de fine-tuning posterior a la restauracion de componentes.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Llama-2-7b-chat-hf.
- El modelo sirve para evaluar el coste en comportamiento de seguridad tras la compresion SVD, midiendo tasas de exito de ataques y sobre-rechazo.
- No se documenta soporte de tool calling, function calling, vision ni audio.
- No se documentan capacidades multilingues especificas.
- La model card recomienda tratar cada celda de la rejilla experimental como un sujeto de prueba, no como un asistente desplegable.

## Casos de uso

- Investigacion sobre compresion de modelos: permite estudiar como la reduccion de parametros via SVD afecta a la alineacion y seguridad de un modelo de lenguaje.
- Evaluacion de mecanismos de reparacion de seguridad: sirve para comparar reglas de seleccion de componentes (como `gap`) y distintos presupuestos de restauracion en un experimento controlado.
- Estudios de interpretabilidad: los componentes SVD restaurados pueden analizarse para entender que representaciones son criticas para el comportamiento de rechazo de peticiones peligrosas.
- Benchmarking de robustez frente a ataques: el modelo reporta metricas de ataque (AdvBench, StrongREJECT) y sobre-rechazo (WildGuard), utiles para validar metodologias de medicion de alineacion.
- Comparacion de tecnicas de compresion: puede compararse con otras ramas de la misma rejilla experimental para ver el efecto de distintas reglas de seleccion y presupuestos.
- Docencia y divulgacion: es un ejemplo practico de como la compresion de modelos puede degradar comportamientos alineados, util en cursos de sistemas de IA y alineacion.

## Benchmarks y rendimiento

Se han publicado los siguientes resultados en la model card del autor:

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0.1442 |
| StrongREJECT ASR (HarmBench judge) | 0.1310 |
| Macro over-refusal (WildGuard) | 0.1445 |
| WikiText-2 perplexity | 11.3162 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. Estos datos pertenecen al propio experimento y no se comparan en la fuente con otros modelos.

## Requisitos de hardware

- Los pesos en safetensors ocupan 13.5 GB, lo que indica que estan almacenados en precision FP16 o BF16 (aproximadamente 2 bytes por parametro para 6.7B parametros).
- Para cargar el modelo en GPU y realizar inferencia, se estima que se necesitan al menos 16 GB de VRAM solo para los pesos, mas memoria para activaciones y cache de atencion. En la practica, una RTX 4090 de 24 GB puede ejecutarlo en FP16, aunque se recomienda una A100 de 40 GB o una H100 para lograr mayor margen.
- Si se quiere ejecutar en GPU mas pequenas, seria necesario convertir los pesos a formatos cuantizados como GGUF, pero no se proporcionan cuantizaciones precalculadas.
- Opciones de despliegue: el modelo es compatible con `transformers`, y puede servirse mediante vLLM, Text Generation Inference (TGI) o llama.cpp si se exporta a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de benchmarks de modelos comparables en la informacion proporcionada. El unico modelo directamente comparable es el modelo base `meta-llama/Llama-2-7b-chat-hf`, del que no se ofrecen los mismos resultados en las metricas anteriores. A modo orientativo, se muestra la siguiente comparacion estructural:

| Modelo | Parametros | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|
| `meta-llama/Llama-2-7b-chat-hf` | 6.738.415.616 | Ninguna | Llama 2 Community License | Publico |
| `Jeesup/svd-safety-l2_remove40_gap_b001` | 6.738.415.616 | SVD-LLM, 39.92% eliminados | Llama 2 Community License | Publico |

No se identifican alternativas de la misma categoria en los datos disponibles.

## Limitaciones y advertencias

- Es un artefacto de investigacion. No debe desplegarse como asistente conversacional en produccion ni usarse como modelo generalista.
- Varias ramas de la rejilla experimental a la que pertenece estan deliberadamente degradadas en seguridad; la compresion sola incrementa la tasa de exito de ataques.
- No se proporcionan datos sobre idiomas soportados, longitud de contexto ni dataset de entrenamiento, lo que limita su uso fuera de experimentos controlados.
- La licencia Llama 2 Community License impone restricciones de uso comercial y condiciones de aceptacion que deben revisarse antes de cualquier aplicacion real.
- Riesgo de alucinacion y comportamiento imprevisible, caracteristico de los modelos base de este tamano cuando no han sido sometidos a un fine-tuning exhaustivo despues de la compresion.
- No se ofrece ninguna garantia de comportamientos de seguridad ni de calidad de las respuestas. El autor recomienda evaluar el modelo antes de sacar conclusiones.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_gap_b001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
