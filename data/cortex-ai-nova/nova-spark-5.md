# cortex-ai-nova/NOVA-Spark-5

## Resumen

NOVA-Spark-5 es un ajuste fino (finetune) del modelo GPT-OSS-20B de OpenAI, distribuido por el usuario cortex-ai-nova bajo licencia Apache 2.0. Se trata de un modelo derivado del checkpoint cuantizado en 4 bits `unsloth/gpt-oss-20b-unsloth-bnb-4bit`, entrenado con la librería Unsloth, que el autor declara haber acelerado el entrenamiento 2x. El modelo se publica en formato transformers/safetensors con un tamano de repositorio de 0.4 GB, lo que sugiere pesos cuantizados y no el modelo completo en precision nativa.

La relevancia de este modelo es limitada y fundamentalmente experimental: no hay informacion sobre el dataset de ajuste, el numero de tokens de entrenamiento, la tarea objetivo ni los hiperparametros utilizados. La model card es practicamente un esqueleto generado automaticamente por la plantilla de Unsloth, sin documentacion tecnica adicional. Cualquier evaluacion seria deberia remitirse al modelo base GPT-OSS-20B, cuyas especificaciones y benchmarks si estan publicados por OpenAI.

Por la herencia del modelo base, cabe esperar una arquitectura transformer con mezcla de expertos (MoE) de 20B parametros totales, pero esta ficha no puede confirmar dichos datos a partir de la informacion disponible del propio repositorio, por lo que se indica "no disponible" en las filas correspondientes cuando no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base GPT-OSS-20B; presumiblemente transformer MoE, no confirmado en este repo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el modelo base de partida esta en 4 bits (bnb-4bit); no se especifican otras variantes en este repositorio |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura concreta de este ajuste fino mas alla de que deriva de `unsloth/gpt-oss-20b-unsloth-bnb-4bit`. El autor no documenta el tipo de transformer, la configuracion de expertos, el numero de capas ni la dimension del modelo. Tampoco se especifica si se ha realizado RLHF, DPO, SFT o una combinacion, ni el numero de tokens de entrenamiento, la composicion del dataset o las tecnicas de alineacion aplicadas.

El unico dato tecnico verificable es que el entrenamiento se realizo con Unsloth, una libreria de optimizacion de finetuning que reduce el uso de memoria y acelera el entrenamiento mediante kernels personalizados y tecnicas como LoRA/QLoRA. El autor declara un entrenamiento "2x mas rapido" con dicha herramienta, pero no aporta detalles sobre el rango LoRA, la tasa de aprendizaje, el numero de pasos ni la perdida final. La ausencia de esta informacion impide reproducir el ajuste o evaluar su calidad de forma rigurosa.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base GPT-OSS-20B.
- Razonamiento y generacion de codigo: capacidades atribuibles al modelo base, no verificadas en este ajuste fino concreto.
- Soporte de tool calling y function calling: no documentado en este repositorio; depende de lo que conserve el modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (modo thinking, vision, audio): no documentadas en este repositorio.

## Casos de uso

- Experimentacion con finetuning de GPT-OSS-20B: util como punto de partida para desarrolladores que quieran estudiar como se comporta un ajuste fino ligero sobre el checkpoint cuantizado de Unsloth, aunque sin documentacion del dataset el valor es limitado.
- Prototipado de generacion de texto en ingles: se puede desplegar con transformers o TGI para probar respuestas en tareas generales, asumiendo que el ajuste no haya degradado las capacidades del modelo base.
- Pruebas de integracion en pipelines de TGI: el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con despliegues gestionados, util para validar infraestructura antes de adoptar el modelo base.
- Evaluacion comparativa de ajustes finos: sirve como caso de estudio de como un finetune no documentado puede diferir del modelo base en calidad y sesgos.
- Investigacion sobre trazabilidad de modelos: ejemplo de publicacion con model card incompleta, util para discutir practicas de documentacion en Hugging Face.
- Base para nuevos ajustes finos: al estar en 4 bits y con licencia Apache 2.0, se puede reutilizar como punto de partida para QLoRA en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0.4 GB y parte de un checkpoint en 4 bits, lo que sugiere que la inferencia en 4 bits podria caber en GPUs consumer con 12-16 GB, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: probable en GPUs con al menos 16 GB de VRAM si se mantiene la cuantizacion 4-bit, aunque no verificado.
- Opciones de despliegue: transformers, text-generation-inference (TGI) segun los tags del repositorio; llama.cpp, Ollama o vLLM no estan confirmados para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NOVA-Spark-5 | no disponible | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| GPT-OSS-20B (OpenAI) | 20B (segun nombre del modelo base) | no disponible en esta ficha | no disponible en esta ficha | modelo base publico |
| unsloth/gpt-oss-20b-unsloth-bnb-4bit | 20B (cuantizado 4-bit) | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

La comparativa se limita a la relacion de parentesco directa con el modelo base y su version cuantizada de Unsloth. No se dispone de datos de rendimiento del ajuste fino que permitan compararlo con alternativas de la misma categoria.

## Limitaciones y advertencias

- Model card practicamente vacia: no se documenta dataset, hiperparametros, evaluacion ni limitaciones conocidas.
- Riesgo elevado de comportamiento impredecible: al no haber benchmarks ni ejemplos, no se puede garantizar que el ajuste fino no haya degradado las capacidades del modelo base.
- Sesgos: desconocidos, pero heredados del modelo base y potencialmente amplificados por un dataset de ajuste no documentado.
- Riesgo de alucinacion: no evaluado en este checkpoint.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar la licencia del modelo base GPT-OSS-20B y de la version cuantizada de Unsloth, que pueden imponer condiciones adicionales.
- Sin descargas ni likes: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-19): la marca temporal del repositorio es anomalа y deberia tratarse con cautela.
- No apto para produccion sin evaluacion previa: se recomienda validar el modelo contra el base en las tareas objetivo antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cortex-ai-nova/NOVA-Spark-5
- Modelo base cuantizado: https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
