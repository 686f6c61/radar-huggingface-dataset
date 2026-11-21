# EmergenceMachines/psi-agent-trust-r43-three-sources-in-every-order

## Resumen

psi-agent-trust-r43-three-sources-in-every-order es un experimento de replicacion publicado en Hugging Face por EmergenceMachines, no un modelo de proposito general. Se trata de un fine-tuning de Qwen3.5-0.8B (0,8 mil millones de parametros) utilizado como sujeto de prueba en un estudio sobre sesgos de recencia y jerarquia de fuentes en contextos con informacion contradictoria. La model card documenta el diseno experimental, los datos crudos y el codigo de puntuacion, no las capacidades del modelo en si.

El estudio (ronda 43, fechada el 5 de noviembre de 2026) plantea doce hechos con tres valores cada uno, procedentes de tres fuentes: el propio usuario, un resultado de herramienta pegado y un documento pegado. Cada hecho se presenta en las seis permutaciones posibles de orden, y se mide que valor gana en la respuesta. El resultado principal es que la posicion domina sobre la fuente: el ultimo valor colocado gana 55 de 72 veces, frente a 12 del intermedio y 5 del primero. Ademas, el documento supera al usuario (37 victorias frente a 13) y la herramienta al usuario (22 frente a 13).

Es relevante para investigadores interesados en como los modelos pequenos resuelven conflictos de conocimiento en contexto, en la fidelidad a instrucciones y en la reproducibilidad de estudios sobre sesgos. El modelo base es Qwen3.5-0.8B, un transformer denso de 0,8B de parametros, y el artefacto se distribuye bajo licencia Apache 2.0 junto con el kit de replicacion completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-0.8B) |
| Parametros totales | 0,8 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (usado en la replicacion); otras no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la replicacion usa GGUF) |

## Arquitectura y entrenamiento

El artefacto es un fine-tuning del modelo base Qwen/Qwen3.5-0.8B, un transformer denso de 0,8B de parametros. La model card no detalla el dataset de entrenamiento, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO. El tag `base_model:finetune` indica que se trata de un ajuste fino sobre el modelo original, pero no se especifica la metodologia (SFT, LoRA u otra).

La innovacion del artefacto no esta en la arquitectura sino en el diseno experimental. Se usan doce hechos (definidos en `code/items43.py`, construidos sobre `code/items41.py`), cada uno con tres valores procedentes de tres fuentes distintas, presentados como tres intercambios en cada una de las seis permutaciones de orden a traves del Context lab del Parameter Space Inspector (PSI 0.5.0 o superior). La decodificacion es greedy, lo que permite reproducir las respuestas exactas. El estudio esta pre-registrado (`prereg.md` con hash sha256) y el scorer (`code/score43.py`) se escribio antes de la ejecucion.

## Capacidades

- Generacion de texto y respuesta a preguntas sobre hechos presentados en contexto.
- Resolucion de conflictos de conocimiento entre multiples fuentes en contexto (objeto principal del estudio).
- Sensibilidad a la posicion de la informacion (sesgo de recencia medido y documentado).
- Sensibilidad a la jerarquia de fuentes (documento > herramienta > usuario en este modelo).
- Capacidad de seguir instrucciones multi-turno (tres intercambios por consulta).
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre sesgos de recencia: el artefacto y su kit de replicacion permiten reproducir el experimento completo (84 respuestas, 96 piezas cada una) y verificar el sesgo de posicion en un modelo de 0,8B.
- Estudio de jerarquia de fuentes: util para analizar por que un documento pegado supera a una herramienta y al usuario, y como la repeticion no corrige la preferencia por el usuario cuando la herramienta habla al final.
- Auditoria de fidelidad a instrucciones: sirve para comprobar si un modelo pequeno prioriza la fuente mas reciente o la mas creible en pipelines de RAG.
- Diseno de prompts para RAG: los resultados informan sobre el orden en que conviene colocar documentos, resultados de herramientas y afirmaciones del usuario para reducir el sesgo de recencia.
- Validacion de metodologia pre-registrada: el repositorio incluye `prereg.md`, `prereg.sha256` y `code/score43.py` como ejemplo de practica reproducible en estudios de IA.
- Educacion y formacion: caso practico para ensenar sesgos de contexto, conflictos de conocimiento y evaluacion manual de respuestas en modelos pequenos.
- Base para replicaciones: el kit permite sustituir el modelo base o ampliar a cuatro fuentes, aunque la model card advierte que el estudio no puede resolver esos casos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos son los del experimento de conflicto de conocimiento:

| Posicion del valor ganador (72 respuestas) | Recuento | Azar esperado |
|---|---|---|
| Ultimo | 55 | 24 |
| Intermedio | 12 | 24 |
| Primero | 5 | 24 |

| Fuente | Victorias en los seis ordenes | Victorias cuando va ultima (de 24) | Victorias cuando no va ultima (de 48) |
|---|---|---|---|
| Documento | 37 | 23 | 14 |
| Herramienta | 22 | 20 | 2 |
| Usuario | 13 | 12 | 1 |

Ademas, el hecho del usuario dicho dos veces pierde frente a la ultima palabra de la herramienta en 10 de 12 casos. Las hipotesis h02, h04 y el control se cumplen; h03 (que la fuente importa) falla como par, aunque la fuente si influye en los datos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de 0,8B, una cuantizacion GGUF de 4 bits cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: no especificadas; el estudio se ejecuto con el modelo local en formato GGUF a traves de PSI 0.5.0 o superior con el servidor de agentes.
- Cabe en GPU de consumo: si, por el tamano del modelo base (0,8B), aunque la model card no detalla que GPU se uso.
- Opciones de despliegue: Parameter Space Inspector (PSI) 0.5.0 o superior con servidor de agentes; el formato GGUF sugiere compatibilidad con llama.cpp y Ollama, aunque no se confirma en la informacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| psi-agent-trust-r43 (este) | 0,8B (base Qwen3.5-0.8B) | no disponible | Fine-tuning para estudio de conflictos de conocimiento | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B | 0,8B | no disponible | Modelo base de proposito general | no disponible | Hugging Face (Qwen) |
| Alternativas de 0,8B para estudios de sesgo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este artefacto y otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El artefacto es un experimento de investigacion, no un modelo listo para produccion; su proposito es medir sesgos, no ofrecer capacidades generales.
- Sesgo de recencia documentado: el ultimo valor colocado gana 55 de 72 veces, muy por encima del azar (24).
- Jerarquia de fuentes sesgada: el documento supera al usuario (37 frente a 13) y la herramienta al usuario (22 frente a 13); la repeticion no corrige la preferencia por el usuario.
- La model card advierte que el estudio no puede explicar por que el documento supera al usuario, ni cubre el caso de una afirmacion del usuario como nota citada, ni cuatro fuentes, ni un modelo nativo de agentes, ni un modelo de mayor tamano.
- La copia publica tiene etiquetas internas sustituidas por terminos neutros; `prereg.md` ya no coincide con `prereg.sha256`, que es el hash de la pre-registracion original.
- Riesgo de alucinacion y sesgos generales del modelo base: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; no se puede confirmar soporte multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el valor del artefacto es experimental y no se recomienda su despliegue en produccion.
- Solo se ha evaluado con decodificacion greedy y con un unico modelo base de 0,8B; los resultados no son extrapolables a modelos mayores ni a otros modos de decodificacion.

## Enlaces

- Hugging Face: https://huggingface.co/EmergenceMachines/psi-agent-trust-r43-three-sources-in-every-order
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Estudio EMNLP 2025 sobre contradicciones en contexto (recencia y repeticion): no disponible
- Estudio ACL 2026 "Whose Facts Win?" (jerarquia de credibilidad): no disponible
- Chattaraj y Raj 2026 (primacia frente a recencia): no disponible
- Parameter Space Inspector (PSI) 0.5.0 o superior: no disponible
- Repositorio de replicacion (archivos `prereg.md`, `results.md`, `code/`, `data/`): incluido en la pagina de Hugging Face del modelo
