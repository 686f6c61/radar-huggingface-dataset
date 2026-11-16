# bononi/healguard-article

## Resumen

HealGuard no es un modelo de lenguaje en sentido estricto, sino un artefacto de publicacion asociado a un experimento de investigacion sobre agentes de nube auto-reparables (self-healing cloud agents). El repositorio `bononi/healguard-article` aloja un articulo narrativo que documenta el desarrollo de un sistema de compuerta de despliegue (deployment gate) denominado HealGuard, construido sobre el modelo Cohere `tiny-aya-global` de 3,35 mil millones de parametros. El autor del repositorio es el usuario `bononi`, y el proyecto se enmarca en un contexto de evaluacion de agentes que auditan buckets de almacenamiento en un entorno simulado de AWS.

El problema que aborda el articulo es el de la degradacion de agentes cuando una API externa sufre un cambio incompatible (API drift), en concreto el renombrado de un argumento de herramienta. El texto describe siete intentos de reparacion mediante tecnicas de ajuste fino (DPO, SFT, SFT con mezcla de datos limpios y LoRA) y como todos ellos fueron rechazados por la compuerta de despliegue. La relevancia actual del material radica en su tesis central: en la era de los agentes auto-reparables, la compuerta de validacion estadistica puede ser mas importante que el propio modelo.

Es importante subrayar que el repositorio no contiene pesos de modelo, no declara licencia, no especifica idiomas y no registra descargas ni interacciones. La informacion disponible es exclusivamente el texto de la model card, que actua como articulo divulgativo. Cualquier dato tecnico sobre el modelo subyacente (`tiny-aya-global`) debe consultarse en la ficha oficial de Cohere, no en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio aloja un articulo, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El repositorio `bononi/healguard-article` no contiene un modelo entrenado ni pesos. Se trata de un documento narrativo que describe un pipeline experimental en el que el modelo base es `tiny-aya-global` de Cohere, con 3,35 mil millones de parametros. El articulo no detalla la arquitectura interna de ese modelo base (tipo de transformer, atencion, tokenizador), ni la composicion del dataset de entrenamiento, ni el numero de tokens utilizados.

El texto si documenta el proceso de ajuste aplicado al agente: se probaron siete variantes de reparacion, incluyendo DPO (Direct Preference Optimization), SFT (Supervised Fine-Tuning) y SFT con mezcla de datos limpios, todas ellas mediante LoRA. Los resultados descritos indican que el DPO aprendio la correccion pero alucino en tareas limpias, el SFT provoco olvido catastrofico (perdida total de la capacidad de invocar herramientas) y el SFT con mezcla limpia corrigio el drift pero degradó el rendimiento en la API limpia hasta el 63 por ciento. No se aportan hiperparametros, tamanos de dataset ni detalles de la funcion de perdida.

La innovacion tecnica descrita no es de entrenamiento sino de infraestructura: un Runtime Repair Guard que intercepta errores de esquema en las llamadas a la API, corrige el argumento y reintenta la llamada. Este guard se evalua mediante una compuerta de despliegue con criterios estadisticos (ganancia minima del 10 por ciento, ausencia de regresion en tareas limpias y ausencia de nuevos modos de fallo).

## Capacidades

- El repositorio no expone un modelo con capacidades propias; las capacidades descritas pertenecen al agente construido sobre `tiny-aya-global`.
- Auditoria de buckets de almacenamiento en un entorno simulado de AWS, con generacion de listas de evidencias y verificacion de argumentos de herramientas.
- Invocacion de herramientas (tool calling) sujeta a errores de esquema cuando la API cambia, lo que motiva el guard de reparacion en tiempo de ejecucion.
- Razonamiento multi-paso limitado: el articulo menciona que el agente pierde el hilo cuando recibe una carga de datos exitosa en lugar del mensaje de error esperado, lo que provoca finalizacion prematura.
- No se documentan capacidades de vision, audio, generacion de codigo general ni modo de pensamiento explicito.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Validacion de despliegues de agentes en produccion: la compuerta HealGuard se usaria como paso previo a la promocion de cualquier actualizacion de un agente, exigiendo una ganancia minima del 10 por ciento en la metrica de exito y la ausencia de regresiones en el conjunto limpio. El articulo demuestra que bloqueo siete actualizaciones inseguras.
- Deteccion de olvido catastrofico tras ajuste fino: el gate puede comparar el rendimiento del agente antes y despues de un SFT o LoRA, identificando caidas en la capacidad de invocar herramientas (el articulo reporta un caso en el que el SFT elimino por completo esa capacidad).
- Mitigacion de API drift en agentes de nube: el Runtime Repair Guard intercepta errores de esquema, corrige el argumento renombrado y reintenta la llamada, elevando el exito bruto del 75 al 85 por ciento en el escenario simulado.
- Auditoria de seguridad de agentes antes de produccion: el gate detecta modos de fallo nuevos como `premature_finish` y alucinaciones residuales, que en el caso documentado afectaban al 11 por ciento de las tareas con drift.
- Investigacion reproducible sobre agentes auto-reparables: el proyecto publica codigo en GitHub, dataset y rollouts en Hugging Face, y una demo en Gradio, lo que permite replicar el entorno simulado de AWS y comparar estrategias de reparacion.
- Formacion y divulgacion tecnica: el articulo sirve como material docente para explicar por que una mejora en la metrica principal no basta para desplegar un cambio, y por que las metricas de exito deben complementarse con verificaciones de evidencia (grounded success).

## Benchmarks y rendimiento

Los unicos datos numericos disponibles provienen del articulo y se refieren al agente sobre `tiny-aya-global`, no a un modelo generico. Se presentan tal como se describen en la model card.

| Metrica | Baseline v0 | Con Runtime Guard | Variacion |
|---|---|---|---|
| Exito bruto en tareas con drift | 75 % | 85 % | +10 puntos |
| Exito con evidencia verificada (grounded) | 35 % | 58,3 % | +23,3 puntos |
| Exito en API limpia tras SFT con mezcla | 63 % | no disponible | regresion |
| Tareas con drift afectadas por alucinacion residual | no disponible | 11 % | nuevo modo de fallo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El modelo base citado tiene 3,35 mil millones de parametros, lo que en cuantizacion de 4 bits requeriria del orden de 2 a 3 GB, pero este calculo no aparece en la fuente y no debe tomarse como dato del repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (el articulo menciona un entorno simulado de AWS y una demo en Gradio, pero no especifica el motor de inferencia).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no contiene un modelo comparable y la informacion proporcionada no incluye alternativas de la misma categoria con datos verificables. El unico modelo mencionado es `tiny-aya-global` de Cohere (3,35 mil millones de parametros), que actua como base del agente y no como termino de comparacion.

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizador ni configuracion de modelo; es un articulo. No debe tratarse como un modelo desplegable.
- La licencia no esta declarada, por lo que no puede asumirse ningun permiso de uso comercial, redistribucion ni modificacion.
- Los idiomas soportados no estan declarados; no hay garantia de comportamiento multilingue.
- Los resultados reportados (75 a 85 por ciento, 35 a 58,3 por ciento) provienen de un unico entorno simulado de AWS y no han sido validados de forma independiente.
- El articulo reconoce que el propio Runtime Repair Guard introduce un nuevo modo de fallo: alucinaciones residuales en el 11 por ciento de las tareas con drift, detectadas por la compuerta.
- El SFT descrito provoca olvido catastrofico de la capacidad de invocar herramientas, lo que constituye un riesgo documentado para cualquier pipeline de ajuste similar.
- La metrica de exito bruto puede estar inflada cuando una parte de las tareas admite una respuesta vacia (lista `[]`), como admite el propio articulo; debe complementarse con metricas de evidencia verificada.
- No hay informacion sobre sesgos, toxicidad, robustez adversarial ni evaluaciones de seguridad del modelo base.
- La fecha de creacion del repositorio (2026-11-16) y la ausencia de descargas o interacciones sugieren un artefacto reciente y sin validacion comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bononi/healguard-article
- Codigo en GitHub: https://github.com/prarthana2031/HealGuard-Lexsi
- Dataset y rollouts: https://huggingface.co/datasets/bononi/healguard-data
- Coleccion de modelos: https://huggingface.co/collections/bononi/healguard-models
- Demo en Gradio: https://huggingface.co/spaces/bononi/healguard-timeline
