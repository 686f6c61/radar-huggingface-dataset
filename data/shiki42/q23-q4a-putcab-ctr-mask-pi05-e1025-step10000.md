# Shiki42/q23-q4a-putcab-ctr-mask-pi05-e1025-step10000

## Resumen

Se trata de un checkpoint de inferencia de robotica publicado por el usuario Shiki42 en Hugging Face, correspondiente al experimento CTR E1025 (run formal E1025-R001, paso 10000). El modelo resuelve una tarea concreta de manipulacion robonica, PutCab, dentro del simulador y benchmark RoboTwin, y se construye sobre el modelo base PI0.5 de OpenPI (referencia `5e62884f`). No es un modelo de lenguaje generalista: es una politica vision-lenguaje-accion (VLA) que mapea observaciones e instrucciones a acciones de robot.

El repositorio, de 6,3 GB, contiene unicamente parametros y activos de inferencia; se excluyen explicitamente el estado del optimizador y del cargador de datos. El autor indica que este checkpoint reemplaza al checkpoint E550, ya obsoleto, cuyo proceso de entrenamiento no enlazaba correctamente la mascara IdleMask, una verificacion que en E1025 se confirma en el log formal.

La relevancia actual es acotada y de caracter investigador: se publica como artefacto reproducible de una ablacion (CTR con IdleMask) sobre PI0.5, con resultados de evaluacion pendientes de auditoria y con 0 descargas y 0 likes en el momento de la consulta. No hay licencia, idiomas ni especificaciones tecnicas declaradas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base PI0.5 de OpenPI; familia vision-lenguaje-accion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica un unico conjunto de pesos de inferencia; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos de inferencia en el formato nativo de OpenPI, acompanados de los activos de normalizacion y de un fichero `SHA256SUMS` que vincula el payload publicado (no se especifica safetensors ni GGUF) |
| Tamano del repositorio | 6,3 GB |
| Tipo de modelo | politica de robot (pipeline: robotics) |
| Tarea | PutCab (CTR), entorno RoboTwin |
| Paso de entrenamiento | 10000 updates, batch global 16, semilla 87431 |
| Base | PI0.5 Base `5e62884f` |
| Dataset de entrenamiento | E363 PutCab CTR, revision `575634eaaaed193458001b41050d0f9f55ecf545` |
| Commits de referencia | CTR `337deb826a510d4e5ced8ba96fc188749191b755`; OpenPI `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead` |

## Arquitectura y entrenamiento

El checkpoint se presenta como una revision de un experimento CTR (E1025, run E1025-R001) partiendo de PI0.5 Base `5e62884f`, con 10000 actualizaciones, batch global de 16 y semilla 87431. La informacion proporcionada no detalla la topologia interna (tipo de transformer, numero de capas, dimensiones, mecanismo de accion o estrategia de atencion), por lo que cualquier descripcion arquitectonica mas alla de su condicion de politica VLA derivada de PI0.5 seria especulativa.

En el plano del entrenamiento si hay datos concretos: el dataset empleado es E363 PutCab CTR en la revision `575634eaaaed193458001b41050d0f9f55ecf545`, y el proceso incorpora una mascara IdleMask cuyo enlace al flujo de entrenamiento se verifico en el log formal de E1025. El checkpoint E550 queda deprecado precisamente porque su entrenamiento no enlazaba dicha mascara. Se incluyen en el repositorio las estadisticas de normalizacion nativas globales consumidas durante el entrenamiento, y el autor advierte que deben usarse exactamente esas mismas estadisticas en inferencia, lo que convierte la normalizacion en un requisito funcional del artefacto y no en un detalle opcional.

## Capacidades

- Ejecucion de una politica de manipulacion robonica para la tarea PutCab en el entorno RoboTwin, a partir de observaciones del entorno.
- Inferencia de acciones a partir de un checkpoint entrenado durante 10000 pasos sobre el dataset E363 PutCab CTR.
- Soporte de condicionamiento mediante IdleMask, verificado en el log de entrenamiento del run E1025-R001.
- Carga reproducible de activos: el repositorio incluye parametros de inferencia, estadisticas de normalizacion y `SHA256SUMS`.
- No se documentan en la informacion disponible capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, uso de agentes, multilingueismo ni modos de pensamiento.
- No se documenta soporte multimodal mas alla de lo implicito en una politica VLA del base PI0.5.

## Casos de uso

- Investigacion en manipulacion robonica simulada: el checkpoint permite reproducir el run E1025-R001 en RoboTwin y comparar la variante con IdleMask frente a la variante deprecada E550, que no enlazaba dicha mascara.
- Ablaciones controladas sobre CTR: al fijar semilla (87431), batch global (16) y paso (10000), sirve como punto de referencia para aislar el efecto de cambios en el condicionamiento de reposo dentro del mismo pipeline.
- Evaluacion de protocolos de benchmark: el autor reporta que las evaluaciones E1026-E1032 consumieron este checkpoint, de modo que sirve para auditar la cadena de evaluacion Q2/Q3 de seis estados y la evaluacion por defecto PutCab FixedRole100.
- Inicializacion para ajuste posterior: al publicarse solo el estado de inferencia (sin optimizador ni data-loader), es util como punto de partida para fine-tuning de la tarea PutCab en variantes del dataset E363, aunque no permite reanudar el entrenamiento original.
- Generacion de rollouts sinteticos en simulacion: los resultados de la politica sobre RoboTwin pueden emplearse para poblar datasets de imitacion o para estudiar modos de fallo de la tarea PutCab.
- Verificacion de reproducibilidad de artefactos: el uso de `SHA256SUMS` y de revisiones de commit explicitas de CTR y OpenPI permite reconstruir el entorno exacto de inferencia en un pipeline interno.
- Transferencia a robot real: seria un uso potencial como politica inicial para tareas de recogida y colocacion, pero la informacion disponible no aporta ninguna evidencia de evaluacion en hardware fisico, por lo que debe tratarse como hipotesis no verificada.

## Benchmarks y rendimiento

| Evaluacion | Tarea / configuracion | Metrica | Resultado | Estado |
|---|---|---|---|---|
| E1032 | PutCab FixedRole100 (configuracion por defecto) | tasa de exito | 49/100 | pendiente de auditoria |
| E1026-E1031 | evaluaciones de seis estados Q2/Q3 | no disponible | reportadas pero no incluidas en la informacion proporcionada | pendiente de auditoria |

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K y similares) en la informacion disponible; no son aplicables a una politica de robot. La unica cifra numerica disponible es el 49/100 reportado para E1032, que el propio autor marca como pendiente de auditoria.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa a partir del tamano del repositorio (6,3 GB, que incluye pesos y activos), la carga de los pesos en precision de 16 bits ocuparia del orden de 6 GB, por lo que conviene reservar un margen adicional para activaciones y buffers de inferencia; esta cifra es una estimacion, no un dato confirmado por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Por el orden de magnitud de los pesos, GPUs de consumo con 12-24 GB de VRAM (por ejemplo, gamas RTX x080/x090 recientes) podrian ser suficientes en teoria, pero no hay validacion publicada.
- Opciones de despliegue: el autor referencia OpenPI (commit `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead`) como base de codigo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y en principio no aplican al tratarse de una politica de robot y no de un modelo de generacion de texto.
- Requisito de normalizacion: es obligatorio reutilizar las estadisticas de normalizacion incluidas en los activos del checkpoint; usar otras estadisticas invalida la inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shiki42/q23-q4a-putcab-ctr-mask-pi05-e1025-step10000 | checkpoint evaluado | no disponible | no disponible | no disponible | publico en Hugging Face, 0 descargas |
| PI0.5 Base `5e62884f` | modelo base del que deriva | no disponible | no disponible | no disponible | referenciado por el autor, sin datos adicionales |
| Checkpoint E550 (deprecado) | predecesor de la misma linea experimental | no disponible | no disponible | no disponible | declarado obsoleto por no enlazar IdleMask |

No se dispone de datos comparativos de rendimiento entre estas variantes en la informacion proporcionada. Para alternativas de la misma categoria (otras politicas VLA como OpenVLA o RDT-1B, u otros modelos de la familia PI0/OpenPI), no hay informacion en la fuente consultada, por lo que la comparativa queda como no disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial; la reutilizacion en produccion queda en un limbo legal.
- Resultados sin auditar: el unico dato de rendimiento (49/100 en PutCab FixedRole100) esta marcado por el autor como pendiente de auditoria, por lo que no debe tratarse como cifra consolidada.
- Alcance muy restringido: es una politica para una tarea y un entorno concretos (PutCab en RoboTwin), no un modelo de proposito general.
- Dependencia fuerte de la normalizacion: el propio autor exige emplear exactamente las estadisticas globales nativas consumidas en entrenamiento; cualquier desviacion invalida los resultados.
- Sin evidencia de transferencia a robot real: toda la validacion reportada procede de evaluaciones en el pipeline interno, sin datos de hardware fisico.
- Estado de entrenamiento incompleto para reanudacion: el repositorio excluye optimizador y data-loader, de modo que no es posible continuar el entrenamiento desde este artefacto tal cual.
- Trazabilidad dependiente de commits externos: la reproducibilidad exige disponer de las revisiones concretas de CTR y OpenPI, ademas del dataset E363 PutCab CTR `575634eaa...`.
- Adopcion nula y sin senal de la comunidad: 0 descargas y 0 likes, sin issues ni documentacion adicional que permitan contrastar su comportamiento.
- Sesgos, alucinacion y comportamiento fuera de distribucion: no documentados en la informacion disponible; en una politica de robot, el riesgo equivalente es la ejecucion de acciones invalidas ante observaciones fuera del dominio de entrenamiento.
- Idiomas y contexto: no disponibles; al ser una politica VLA, no aplica el concepto habitual de ventana de contexto de un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Shiki42/q23-q4a-putcab-ctr-mask-pi05-e1025-step10000
- Referencias citadas en la model card (sin URL proporcionada en la informacion disponible):
  - Dataset E363 PutCab CTR, revision `575634eaaaed193458001b41050d0f9f55ecf545`
  - Repositorio CTR, commit `337deb826a510d4e5ced8ba96fc188749191b755`
  - Repositorio OpenPI, commit `e9ba7b7732a3e66e4bd87d6d3429f7cef6352ead`
  - Modelo base PI0.5 Base, referencia `5e62884f`
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, demos ni repositorios de evaluacion.
