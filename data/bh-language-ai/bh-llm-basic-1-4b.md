# BH-Language-AI/bh-llm-basic-1-4b

## Resumen

BH-LLM-Basic-1-4B es una ficha de proyecto (model card) publicada por BH-Language-AI para un futuro modelo de lenguaje en bosnio de aproximadamente 4.000 millones de parametros, enmarcado en la coleccion BH-LLM-Basic. El autor declara explicitamente que las ponderaciones no existen todavia: no se ha entrenado el modelo, no hay evaluacion held-out y no se ha fijado la arquitectura base. Por tanto, no es un modelo desplegable, sino una declaracion de intenciones con esquema de nombres, licencia prevista y plan de publicacion.

El objetivo declarado es cubrir chat, instrucciones e integracion en agentes de IA y aplicaciones de negocio en bosnio, buscando un equilibrio entre calidad y coste de inferencia. La nomenclatura sigue el patron `bh-llm-basic-{generacion}-{tamano}`, y el identificador se renombro de `bh-llm-1-4b` a `bh-llm-basic-1-4b`. La licencia prevista es Apache 2.0, aunque el autor advierte que al no estar fijada la base, ni el perfil de memoria ni la licencia de la base son definitivos.

La relevancia actual es limitada desde el punto de vista practico: no hay pesos, no hay benchmarks y el propio autor recomienda usar temporalmente el miembro de 32B de la misma coleccion para uso serio. Esta ficha documenta el estado real del artefacto y sus carencias, sin inferir especificaciones que el autor no ha proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base sin determinar; el autor indica "TBD") |
| Parametros totales | aproximadamente 4B (segun el nombre del modelo; no verificado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bosnio (bs) |
| Licencia | Apache 2.0 (prevista; sujeta a la licencia de la base, aun no fijada) |
| Formato de pesos | no disponible (no existen pesos publicados) |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura. El autor indica que la base "TBD" y que las ponderaciones no se re-suben; el candidato mencionado (Salamandra 4B) no esta en la coleccion y debe determinarse. No se especifica si sera un transformer denso, MoE o hibrido, ni la longitud de contexto, el tokenizador o el esquema de atencion.

Tampoco hay datos de entrenamiento: el autor declara que los datos son "TBD, tras aprobacion" y que la evaluacion tambien esta pendiente. No se documenta numero de tokens, composicion del corpus, ni si habra RLHF, DPO o ajuste por instrucciones. El estado del modelo es explicitamente "NIJE TRENIRAN" (no entrenado) y los resultados crudos se publicaran junto con las ponderaciones.

## Capacidades

- Generacion de texto en bosnio: capacidad prevista, no verificada, al no existir pesos.
- Chat e instrucciones: uso objetivo declarado por el autor.
- Integracion en agentes de IA y aplicaciones de negocio: uso objetivo declarado.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara bosnio (bs); no se documentan otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Evaluacion de viabilidad de un modelo bosnio de ~4B: el artefacto sirve para planificar integraciones futuras, pero no puede ejecutarse hoy porque no hay pesos.
- Chat en bosnio para atencion al cliente: caso objetivo declarado por el autor, pendiente de entrenamiento y evaluacion; no es desplegable actualmente.
- Ajuste por instrucciones en dominio de negocio: previsto tras la publicacion de pesos; requiere que la base y los datos se fijen primero.
- Integracion en agentes: el autor lo menciona como objetivo, pero sin tool calling documentado ni pesos no es verificable.
- Generacion de texto general en bosnio: uso previsto; sin benchmarks no puede compararse con alternativas.
- Prototipado con licencia permisiva: la licencia Apache 2.0 prevista facilitaria uso comercial, pero esta sujeta a la licencia de la base aun no fijada.
- Sustitucion temporal por el miembro de 32B de la coleccion: el propio autor recomienda esta opcion para uso serio mientras el 4B no este disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha medido ningun score y que la tabla de benchmarks solo contiene la entrada "1-4B (esta ficha): NO ENTRENADO".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; dependeria de la base y la cuantizacion, aun no fijadas.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; un modelo de ~4B en cuantizacion de 4 bits suele caber en GPUs de 8-12 GB, pero esto es una estimacion generica no confirmada por el autor.
- Opciones de despliegue: el autor solo muestra un ejemplo con `transformers` (`AutoModelForCausalLM.from_pretrained(..., device_map="auto")`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-LLM-Basic-1-4B | ~4B (nominal) | no disponible | no medido | Apache 2.0 (prevista) | sin pesos |
| BH-LLM-Basic 32B (misma coleccion) | ~32B (nominal) | no disponible | no disponible | no disponible | recomendado por el autor como sustituto temporal |
| Salamandra 4B (candidato mencionado) | ~4B | no disponible | no disponible | no disponible | mencionado como candidato a base, no confirmado |

No se dispone de datos de rendimiento ni de contexto para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No existen pesos: el modelo no puede ejecutarse ni evaluarse; no debe usarse en produccion.
- La base no esta fijada, por lo que ni el perfil de memoria ni la licencia final son definitivos.
- No hay benchmarks, evaluacion held-out ni resultados de entrenamiento.
- La licencia Apache 2.0 es prevista y podria cambiar segun la licencia de la base elegida.
- Solo se declara soporte de bosnio; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion y sesgos: no evaluables al no existir modelo entrenado.
- El propio autor recomienda usar temporalmente el miembro de 32B de la coleccion para uso serio.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-llm-basic-1-4b
- Coleccion BH-LLM-Basic: https://huggingface.co/collections/BH-Language-AI/bh-llm-basic
- Contacto indicado por el autor: xnetba@gmail.com
