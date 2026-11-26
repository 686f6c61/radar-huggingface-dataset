# BH-Language-AI/bh-decision-2-9b

## Resumen

BH-Decision-2-9B es un modelo de lenguaje en desarrollo por BH-Language-AI (Kolektiv × Gamatrade), orientado especificamente a la toma de decisiones estructurada en bosnio (ijekavica) e ingles. A diferencia de los modelos conversacionales convencionales, su objetivo es devolver JSON legible por maquina con la decision, una lista de opciones rankeadas, puntuaciones, riesgo y nivel de confianza, en lugar de texto libre. Esta pensado para integrarse en agentes de IA y aplicaciones empresariales que necesitan una salida estructurada y parseable sin postprocesado.

El modelo se plantea como el miembro de mayor tamano de la familia BH-Decision, por encima de las variantes 2-4B y 2-2B. Segun la model card, el entrenamiento se realiza mediante LoRA/rsLoRA (r32, 4 epocas) sobre 7.849 ejemplos, en el supercomputador europeo LUMI (job 24040475, receta A). La base inicialmente prevista, `utter-project/EuroLLM-9B`, fue descartada por ser un repositorio con acceso restringido (gated), y la base efectiva pasa a ser `mistralai/Ministral-3-8B-Base-2512`.

Es relevante ahora porque la model card indica explicitamente que **no hay pesos publicados**: el estado es de tarjeta de proyecto con entrenamiento en curso y las cifras de benchmark se publicaran tras la evaluacion sobre un held-out bloqueado. El identificador del repositorio (`bh-decision-2-9b`) y la base efectiva (`Ministral-3-8B`) no coinciden, lo que conviene tener en cuenta al evaluar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: `mistralai/Ministral-3-8B-Base-2512`); ajuste fino con LoRA/rsLoRA (r32, 4 epocas) |
| Parametros totales | No disponible (el nombre indica 9B; la base efectiva es Ministral-3-8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Bosnio (ijekavica) e ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (sin pesos publicados en la informacion proporcionada) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only. El ajuste se realiza con LoRA/rsLoRA de rango 32 durante 4 epocas sobre 7.849 ejemplos, partiendo de `mistralai/Ministral-3-8B-Base-2512` (Apache-2.0). La base originalmente declarada en los metadatos, `utter-project/EuroLLM-9B`, fue descartada segun la model card por tratarse de un repositorio con acceso restringido, por lo que la base efectiva del ajuste es Ministral-3-8B. Los datasets de entrenamiento son `BH-Language-AI/bs-decision-*`, abiertos y con licencia CC-BY-4.0.

La innovacion tecnica declarada es el llamado *readout mode*: el modelo no genera texto libre para luego parsearlo, sino que se entrena para producir directamente una salida estructurada (decision, ranking de opciones, puntuaciones, riesgo y confianza). La evaluacion prevista combina un held-out bloqueado de 20 ejemplos no vistos (19 puntuados) y CUA-Bench. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de decisiones estructuradas en formato JSON legible por maquina.
- Ranking multicriterio de opciones con puntuaciones asociadas.
- Clasificacion y evaluacion de riesgo.
- Triaje de solicitudes y asignacion de prioridades.
- Comparacion de alternativas propuestas.
- Salida con nivel de confianza explicito.
- Soporte de bosnio (ijekavica) e ingles.
- Orientado a integracion en agentes de IA y aplicaciones empresariales.
- No esta disenado para conversacion libre ni para generacion de texto abierto.

## Casos de uso

- Triaje de solicitudes en atencion al cliente: el modelo recibe el texto de la peticion y devuelve un JSON con categoria, prioridad, riesgo y confianza, lo que permite enrutar automaticamente el ticket sin parsing adicional.
- Clasificacion de riesgo en procesos de onboarding o credito: dada una descripcion estructurada del caso, el modelo emite un nivel de riesgo y una lista de factores rankeados que alimentan el motor de decision de la entidad.
- Ranking de proveedores o propuestas: se envian varias alternativas con sus atributos y el modelo devuelve una ordenacion con puntuaciones por criterio, util para compras y licitaciones.
- Priorizacion de incidencias en operaciones TI: el modelo clasifica y ordena las incidencias por impacto y urgencia, devolviendo la salida en un formato consumible por sistemas de ticketing.
- Orquestacion en agentes de IA: al devolver JSON con decision y confianza, el modelo actua como nodo de decision dentro de pipelines multi-paso, permitiendo ramificar segun el resultado.
- Soporte a la decision en entornos de habla bosnia: aplicaciones internas de empresas en Bosnia y Herzegovina que necesitan clasificacion y priorizacion en ijekavica sin depender de traduccion previa al ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el entrenamiento esta en curso (job 24040475) y que las cifras se publicaran tras el readout eval sobre el held-out bloqueado (20 ejemplos no vistos, 19 puntuados), con el objetivo declarado de superar al modelo 4B v0.5-rc (18/19). No se dispone de resultados de MMLU, HumanEval, GSM8K ni de CUA-Bench.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia orientativa para una base de ~8-9B en precision FP16, se requieren aproximadamente 16-18 GB; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones genericas para el tamano y no datos publicados del modelo.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamano, una base de ~8-9B en cuantizacion 4-8 bits podria caber en RTX 4090 (24 GB) y, con cuantizacion agresiva, en GPUs de 8-12 GB, pero no hay datos oficiales.
- Opciones de despliegue: no disponible (no se han publicado pesos; la libreria declarada es `transformers`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-Decision-2-9B | No disponible (nombre 9B; base Ministral-3-8B) | No disponible | Decision estructurada en JSON, bosnio/ingles | Apache-2.0 | Sin pesos publicados |
| BH-Decision-2-4B | 4B (segun nombre) | No disponible | Decision estructurada, bosnio/ingles | No disponible | Pesos no confirmados en la informacion (18/19 en eval interna) |
| BH-Decision-2-2B | 2B (segun nombre) | No disponible | Decision estructurada, bosnio/ingles | No disponible | Pesos no confirmados en la informacion (13/19 en eval interna) |
| Ministral-3-8B-Base-2512 | 8B | No disponible | Modelo base generalista | Apache-2.0 | Publico |

No se dispone de datos de rendimiento comparables entre estos modelos mas alla de las puntuaciones internas citadas (18/19 para 4B y 13/19 para 2B), que no son directamente equiparables a benchmarks estandar.

## Limitaciones y advertencias

- No hay pesos publicados: la model card indica explicitamente que se publicaran solo tras el entrenamiento aprobado y la evaluacion verificada sobre held-out.
- Discrepancia entre el nombre del repositorio (9B) y la base efectiva declarada (Ministral-3-8B); conviene verificar el tamano real cuando se publiquen los pesos.
- El modelo esta disenado exclusivamente para decision estructurada; no es adecuado para conversacion libre ni generacion de texto abierto.
- Cobertura linguistica limitada a bosnio (ijekavica) e ingles; el rendimiento en otras variantes del bosnio/croata/serbio no esta documentado.
- Riesgo de alucinacion en las decisiones y puntuaciones: al tratarse de un modelo pequeno ajustado con LoRA, la fiabilidad fuera de la distribucion de entrenamiento no esta verificada.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- El held-out de evaluacion es muy reducido (20 ejemplos, 19 puntuados), lo que limita la significancia estadistica de las cifras que se publiquen.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de pesos y de evaluacion publica impide validar el modelo en produccion por ahora.
- Los datasets de entrenamiento tienen licencia CC-BY-4.0; conviene revisar las obligaciones de atribucion si se redistribuye el modelo ajustado.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-decision-2-9b
- Organizacion BH-Language-AI: https://huggingface.co/BH-Language-AI
- Variante 2-4B: https://huggingface.co/BH-Language-AI/bh-decision-2-4b
- Variante 2-2B: https://huggingface.co/BH-Language-AI/bh-decision-2-2b
- Traza Gen 1: https://huggingface.co/BH-Language-AI/bh-decision-1-9b
- Modelo base efectivo: https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
- Modelo base declarado en metadatos (gated): https://huggingface.co/utter-project/EuroLLM-9B
