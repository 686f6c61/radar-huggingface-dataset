# BH-Language-AI/bh-decision-1-9b

## Resumen

BH-Decision-1-9B es un proyecto de modelo de lenguaje de 9.000 millones de parametros orientado a la toma de decisiones, anunciado por BH-Language-AI dentro de la coleccion BH-Decision (generacion 1, fruto de una colaboracion entre "Kolektiv" y "Gamatrade"). El modelo se plantea como un fine-tuning del modelo base `utter-project/EuroLLM-9B`, un transformer denso de 9B parametros con licencia Apache-2.0 y capacidades multilingues centradas en lenguas europeas, en particular el croata.

El dato mas importante de esta ficha es que, segun la propia model card del autor, **las ponderaciones no existen todavia**: la publicacion se describe explicitamente como una "tarjeta de proyecto" (projektna kartica) y el estado indicado es "NIJE TRENIRAN" (no entrenado). No se ha realizado ningun entrenamiento ni se ha verificado ninguna evaluacion, y el autor indica que las ponderaciones solo se publicaran tras un entrenamiento aprobado y una evaluacion verificada.

Por tanto, este modelo no es utilizable en produccion ni en investigacion en su estado actual. Su relevancia es documental: permite conocer la intencion de diseno (un modelo de decision en bosnio construido sobre EuroLLM-9B) y sirve como referencia para seguir la evolucion del proyecto. Cualquier dato de rendimiento, capacidades efectivas o requisitos de despliegue debe considerarse no disponible hasta que existan pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del base `utter-project/EuroLLM-9B`; el autor no la detalla) |
| Parametros totales | 9B (segun el nombre del modelo; no verificado con pesos) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no hay pesos publicados) |
| Idiomas soportados | bosnio (bs) declarado como idioma objetivo; el base EuroLLM-9B es multilingue europeo |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no hay pesos publicados) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura especifica del modelo. Al ser un fine-tuning declarado sobre `utter-project/EuroLLM-9B`, la arquitectura subyacente corresponderia a la del modelo base, pero el autor no aporta detalles sobre capas, atencion, tokenizador ni configuracion. Tampoco se especifica si el ajuste previsto seria un SFT, un entrenamiento con preferencias (DPO/RLHF) u otra modalidad.

Respecto al entrenamiento, la model card indica explicitamente que el modelo **no ha sido entrenado**. No hay datos sobre numero de tokens, composicion del dataset, tecnicas de alineacion ni innovaciones tecnicas. La unica informacion operativa es el esquema de nombrado (`bh-decision-{generacion}-{tamano}`) y la existencia de una "coleccion BH-Decision" que agruparia referencias de la fase 1 junto con modelos maestros y baselines.

## Capacidades

- No hay capacidades verificadas: el modelo no dispone de pesos publicados.
- El objetivo declarado del proyecto es la **toma de decisiones** (decision-making) en bosnio, pero no se detalla que tipo de tareas cubriria.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta razonamiento multi-paso, modo thinking, vision ni audio.
- Capacidades multilingues: solo se declara el bosnio como idioma; el base EuroLLM-9B es multilingue europeo, pero no se especifica que idiomas conservaria el fine-tuning.
- Generacion de texto: es el pipeline declarado (`text-generation`), sin resultados que lo confirmen.

## Casos de uso

No es posible proponer casos de uso realistas porque el modelo no tiene pesos publicados ni evaluacion verificada. Cualquier aplicacion descrita a continuacion seria especulativa y no estaria respaldada por el autor:

- **No disponible**: atencion al cliente o asistentes conversacionales en bosnio, al no existir un modelo entrenado que evaluar.
- **No disponible**: sistemas de apoyo a la decision en dominio juridico, administrativo o empresarial, que es la intencion declarada pero no materializada.
- **No disponible**: generacion o clasificacion de texto en bosnio en pipelines de produccion.
- **No disponible**: integracion como agente o con tool calling, capacidad no documentada.
- **No disponible**: evaluacion comparativa frente a otros modelos en bosnio, al no haber benchmarks.
- **No disponible**: despliegue en infraestructura propia o en la nube, al no existir artefactos de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos; como referencia teorica, un modelo denso de 9B en FP16 requeriria del orden de 18 GB de VRAM, y en cuantizacion de 4 bits alrededor de 5-6 GB, pero esto es una estimacion generica no confirmada para este modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se han publicado pesos en ningun formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas declaradas frente al modelo base y a alternativas de la misma familia de tamano:

| Modelo | Parametros | Contexto | Licencia | Estado | Idiomas |
|---|---|---|---|---|
| BH-Decision-1-9B | 9B (declarado) | no disponible | Apache-2.0 | No entrenado, sin pesos | bs (objetivo) |
| utter-project/EuroLLM-9B | 9B | no disponible en esta ficha | Apache-2.0 | Publicado | Multilingue europeo |
| Alternativas de 9B (generico) | ~9B | variable | variable | Publicadas | variable |

No se dispone de informacion suficiente para comparar rendimiento, contexto o disponibilidad con alternativas concretas mas alla del modelo base declarado.

## Limitaciones y advertencias

- **El modelo no existe como artefacto utilizable**: no hay pesos, no hay entrenamiento y no hay evaluacion. No debe citarse como modelo funcional.
- No se pueden evaluar sesgos, riesgo de alucinacion ni calidad linguistica en bosnio sin pesos ni evaluacion.
- La licencia Apache-2.0 se declara en la model card, pero al no haber pesos publicados no hay terminos efectivos de uso comercial que aplicar todavia.
- El idioma declarado es unicamente el bosnio; no se especifica cobertura de variantes (serbio, croata) ni de otros idiomas.
- La model card esta redactada en bosnio/croata y mezcla informacion de proyecto con advertencias de estado; conviene tratarla como documentacion de intencion, no como ficha tecnica de un modelo entrenado.
- Cualquier uso en produccion es inviable en el estado actual.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-decision-1-9b
- Modelo base: https://huggingface.co/utter-project/EuroLLM-9B
- Repositorio o paper de EuroLLM: no disponible en la informacion proporcionada
- Blog o demo del proyecto BH-Decision: no disponible en la informacion proporcionada
