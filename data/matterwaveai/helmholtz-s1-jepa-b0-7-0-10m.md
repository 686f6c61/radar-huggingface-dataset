# MatterWaveAI/helmholtz-s1-jepa-b0.7.0-10m

## Resumen

HELMHOLTZ-S1-JEPA-b0.7.0-10m es un modelo compacto de tipo world-model desarrollado por MatterWaveAI, construido sobre el modelo base helmholtz-jepa-b0.7.0-10m y encuadrado en la familia S1-GRT-JEPA. Su funcion no es la generacion de texto libre, sino actuar como juez de seguridad para agentes y como enrutador de acciones mediante control predictivo de modelos (MPC). Antes de emitir una decision APPROVE, REJECT o ESCALATE, o de seleccionar la siguiente llamada a herramienta de un agente, el modelo proyecta las acciones candidatas en un espacio latente ortogonal a lo largo de 1..H pasos y evalua el estado resultante frente a invariantes de objetivo y seguridad. Todo ello sin decodificacion autorregresiva de tokens.

El modelo se presenta como la variante de 10M de la familia, con aproximadamente 13,8M de parametros almacenados y una capacidad densa equivalente de unos 34M, sin matrices lineales densas ni capas convolucionales. Emplea una arquitectura que el autor denomina rotational transformer, orientada a la modelizacion de mundo en espacio latente (JEPA). Su relevancia actual radica en el nicho de seguridad de agentes: ofrece una capa de verificacion determinista y con invariancia exacta al orden de opciones (100,0%), pensada para integrarse en pipelines de enrutamiento de herramientas y control de acciones.

La model card indica que los pesos, los detalles de implementacion y el codigo fuente se retienen durante el ciclo de publicacion escalonada del world-model, con el objetivo declarado de evitar la evasion de la barrera de seguridad mediante ataques de caja blanca. Esta ficha se limita, por tanto, a los datos publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rotational transformer con modelizacion JEPA en espacio latente (sin matrices lineales densas ni capas convolucionales) |
| Parametros totales | ~13,8M almacenados / ~34M de capacidad densa equivalente |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (pesos retenidos durante el ciclo de publicacion escalonada) |

## Arquitectura y entrenamiento

La arquitectura se describe como un rotational transformer con un nucleo JEPA (Joint Embedding Predictive Architecture) que opera en espacio latente ortogonal. El modelo no decodifica tokens de forma autorregresiva: en su lugar, proyecta acciones candidatas hacia delante en el espacio latente y compara el estado predicho con invariantes de objetivo y seguridad. La model card destaca que no contiene matrices lineales densas ni capas convolucionales, y que la variante de 10M almacena unos 13,8M de parametros con una capacidad densa equivalente de aproximadamente 34M.

No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La informacion disponible tampoco especifica innovaciones de decodificacion especulativa ni de atencion lineal; el rasgo tecnico diferencial declarado es la invariancia exacta al orden de opciones (100,0%) y la ausencia de decodificacion autorregresiva. Los pesos, la implementacion arquitectonica y el codigo fuente estan retenidos en la version b0.7.0.

## Capacidades

- Verificacion de rollouts multi-hop en espacio latente (2..3 saltos) para validar el resultado predicho de una secuencia de acciones.
- Juicio de seguridad de agentes con decision de una sola pasada: APPROVE, REJECT o ESCALATE.
- Enrutamiento de acciones de agente mediante control predictivo de modelos (MPC) con lookahead de H = 1..2 pasos.
- Defensa frente a deriva (drift) y frente a inyeccion de prompts en el contexto de enrutamiento de herramientas.
- Verificacion factual de un solo salto y verificacion de ciencia causal y sentido comun fisico.
- Verificacion socratica y epistemica en cuatro modos (SEE, SAY, DO, KNOW).
- Induccion de reglas en rejillas espaciales 2D, evaluada sobre el conjunto ARC-AGI-2 XL-smol.
- Calibracion epistemica y abtencion (el modelo puede declinar emitir una decision).
- Verificacion de terminacion de bucles de programa y seguimiento de transiciones de estado simbolico.
- Verificacion booleana formal y de tablas de verdad.
- Planificacion de recursos y concurrencia.
- No se declara soporte de generacion de texto, codigo, matematicas ni vision general; su ambito es la clasificacion y la verificacion.

## Casos de uso

- Barrera de seguridad para agentes autonomos: el modelo actua como juez previo a la ejecucion de cada accion, emitiendo APPROVE, REJECT o ESCALATE tras proyectar la accion en el espacio latente y comprobar invariantes de seguridad. Es adecuado por su decision de una sola pasada y su invariancia al orden de opciones.
- Enrutamiento de llamadas a herramientas: dado un estado de agente y un conjunto de herramientas candidatas, el modelo selecciona la siguiente accion mediante MPC con lookahead de 1..2 pasos, lo que permite descartar rutas que conducen a estados no deseados antes de invocar la herramienta.
- Defensa frente a inyeccion de prompts en pipelines de agentes: el modelo verifica si el contexto recibido induce una deriva de comportamiento respecto al objetivo declarado y puede escalar el caso a revision humana.
- Verificacion de planes multi-paso: en flujos de agentes con cadenas de 2..3 acciones, el modelo comprueba que el estado final predicho satisface las condiciones de exito antes de autorizar la ejecucion.
- Validacion de razonamiento causal en asistentes cientificos: se emplea como filtro de coherencia fisica y causal sobre las respuestas o planes generados por otro modelo mayor.
- Control de terminacion de bucles en generacion de codigo o ejecucion de programas: el modelo verifica condiciones de terminacion y transiciones de estado simbolico, util como guardarrail en pipelines de CI/CD que ejecutan codigo generado.
- Calibracion y abtencion en revisiones automatizadas: ante casos ambiguos, el modelo puede abstenerse en lugar de forzar una decision, lo que resulta util en flujos con intervencion humana posterior.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto XL-smol (5.003 registros retenidos / 12.809 preguntas):

| Suite de evaluacion XL-smol | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---|---|---|---|---|
| Verificacion de rollouts relacionales multi-hop (2..3 saltos) | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Ciencia causal y sentido comun fisico | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificacion factual de un solo salto | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificacion socratica y epistemica en 4 modos | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Induccion de reglas en rejilla 2D (ARC-AGI-2 XL-smol) | 600 | 1.800 nucleo (3.600 total) | 100,00% | 100,00% | 100,0% |
| Enrutamiento MPC de acciones, deriva y defensa ante inyeccion | 403 | 1.209 | 99,75% | 100,00% | 100,0% |
| Agregado de 6 suites (macro / micro) | 5.003 | 11.009 nucleo (12.809 total) | 99,96% / 99,98% | 100,00% | 100,0% |

Evaluacion consolidada de 12 dominios (10.130 registros de test retenidos / 27.487 preguntas):

| Dominio | Registros | Preguntas nucleo | Precision primaria | Precision nucleo | ECE |
|---|---|---|---|---|---|
| Rollouts relacionales multi-hop | 1.000 | 2.000 | 100,00% | 100,00% | 0,0883 |
| Ciencia causal y sentido comun | 1.000 | 2.000 | 100,00% | 100,00% | 0,0206 |
| Verificacion factual de un solo salto | 1.000 | 2.000 | 100,00% | 100,00% | 0,0190 |
| Verificacion socratica en 4 modos | 1.000 | 2.000 | 100,00% | 100,00% | 0,00002 |
| Induccion de reglas en rejilla 2D (ARC-AGI-2) | 600 | 1.800 (3.600 total) | 100,00% | 71,78% (98,44% eleccion) | 0,0035 |
| Enrutamiento MPC y deriva | 403 | 1.209 | 99,75% | 66,67% | 0,2899 |
| Calibracion epistemica y abtencion | 80 | 160 | 78,12% | 78,12% | 0,0764 |
| Verificacion de terminacion de bucles | 150 | 600 | 74,00% | 74,00% | 0,0915 |
| Seguimiento de transiciones de estado simbolico | 60 | 180 | 73,33% | 73,33% | 0,0890 |
| Bateria de grafo de conocimiento de prerrequisitos (v5) | 2.777 | 7.558 | 72,85% | 72,85% | 0,0881 |
| Planificacion de recursos y concurrencia | 60 | 180 | 71,67% | 71,67% | 0,0940 |
| Verificacion booleana formal y tablas de verdad | 2.000 | 6.000 | 68,45% | 68,45% | 0,1042 |
| Agregado del split de test de 12 dominios | 10.130 | 25.687 (27.487 total) | 86,51% macro | 79,97% micro (78,21% total) | 0,0804 medio |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~13,8M parametros almacenados, la huella en precision FP16 seria del orden de decenas de MB, pero al no publicarse los pesos ni el formato, no puede confirmarse.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente si por tamano, aunque no confirmado al no haber pesos publicados.
- Opciones de despliegue: la model card indica compatibilidad con endpoints (tag endpoints_compatible) y la libreria transformers; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencias de la misma familia del autor se pueden citar helmholtz-jepa-b0.7.0-10m (modelo base), helmholtz-1 (modelizacion JEPA), helmholtz-1-omni (alineamiento multimodal) y helmholtz-mamba-1 (recurrencia selectiva rotacional O(1)); sin embargo, no se han publicado comparativas cuantitativas entre ellos en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| HELMHOLTZ-S1-JEPA-b0.7.0-10m | ~13,8M almacenados / ~34M equivalentes | no disponible | apache-2.0 | retenidos en b0.7.0 |
| helmholtz-jepa-b0.7.0-10m (base) | no disponible | no disponible | no disponible | no disponible |
| helmholtz-1 | no disponible | no disponible | apache-2.0 (segun tag de la familia) | no disponible |
| helmholtz-1-omni | no disponible | no disponible | apache-2.0 | no disponible |

## Limitaciones y advertencias

- Pesos, implementacion arquitectonica y codigo fuente retenidos en la version b0.7.0; no es posible desplegar ni auditar el modelo de forma independiente con la informacion publicada.
- Los resultados de benchmarks son autoinformados por el autor; no se han verificado de forma independiente.
- El rendimiento cae de forma notable fuera de las suites de verificacion principales: precision primaria del 68,45% en verificacion booleana formal, 71,67% en planificacion de recursos y 72,85% en la bateria de prerrequisitos.
- El error de calibracion (ECE) es elevado en enrutamiento MPC (0,2899) y moderado en varias suites (en torno a 0,08-0,10), lo que implica que las probabilidades de decision no deben interpretarse como confianza fiable sin recalibracion.
- La precision nucleo en enrutamiento MPC es del 66,67%, muy inferior a la precision primaria del 99,75%; conviene revisar que metrica se usa como criterio de aceptacion en produccion.
- Ambito funcional restringido a clasificacion y verificacion; no es un modelo generativo de texto, codigo ni vision general.
- No se declaran idiomas soportados ni sesgos conocidos; el comportamiento multilingue es desconocido.
- Riesgo de alucinacion no evaluado en la informacion disponible; al operar en espacio latente sin decodificacion, el modo de fallo relevante seria una decision incorrecta, no texto inventado.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de pesos publicados impide ejercerla sobre el artefacto en la version actual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-s1-jepa-b0.7.0-10m
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-jepa-b0.7.0-10m
- Familia S1-GRT-JEPA: https://huggingface.co/MatterWaveAI/s1-grt-jepa
- helmholtz-1: https://huggingface.co/MatterWaveAI/helmholtz-1
- helmholtz-1-omni: https://huggingface.co/MatterWaveAI/helmholtz-1-omni
- helmholtz-mamba-1: https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
- helmholtz-rnn-1: https://huggingface.co/MatterWaveAI/helmholtz-rnn-1
- Listado de modelos MatterWave: https://huggingface.co/models?other=matterwave
- Referencia arXiv citada en la familia: arxiv:2610.39302
