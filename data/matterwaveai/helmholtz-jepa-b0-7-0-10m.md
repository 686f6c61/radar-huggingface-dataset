# MatterWaveAI/helmholtz-jepa-b0.7.0-10m

## Resumen

HELMHOLTZ-JEPA-b0.7.0-10m es un modelo compacto de tipo Joint-Embedding Predictive Architecture (JEPA) desarrollado por MatterWaveAI, presentado como el miembro de 10 millones de parametros de la familia de escalado HELMHOLTZ-1. Se construye sobre el modelo base MatterWaveAI/grt-10m y se describe como un "world model causal" y "juez de trayectorias System-1", orientado a despliegue en el borde (edge) con latencia ultra baja y a pipelines de CI que funcionan solo con CPU. Segun la model card, su proposito principal es verificar y evaluar trayectorias de agentes en espacio latente, emitiendo decisiones de tipo APPROVE/REJECT/ESCALATE sin decodificar tokens intermedios.

La arquitectura declarada es puramente rotacional: segun el autor, no contiene matrices lineales densas ni capas convolucionales, y cada bloque del codificador y del predictor es una cascada de transformaciones ortogonales que preservan la norma (determinante +1). El modelo almacena aproximadamente 13,8 millones de parametros, con una capacidad equivalente densa estimada de unos 34 millones. La propuesta tecnica es eliminar el colapso de representacion del JEPA por construccion geometrica, sin necesidad de negativos contrastivos.

Es relevante ahora porque se presenta como una verificacion arquitectonica dentro de un ciclo de publicacion escalonada de la familia HELMHOLTZ-1, junto con la variante de 30M. La model card indica explicitamente que los pesos, los detalles de implementacion y el codigo fuente estan retenidos durante este ciclo, por lo que la ficha se basa unicamente en los datos declarados por el autor y no en una validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA puramente rotacional (GRT-JEPA), sin matrices lineales densas ni capas convolucionales; bloques de transformaciones ortogonales con det = +1 |
| Parametros totales | ~13,8M almacenados (~34M de capacidad equivalente densa) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos durante el ciclo de publicacion escalonada) |

## Arquitectura y entrenamiento

La arquitectura se describe como un JEPA (Joint-Embedding Predictive Architecture) compacto y puramente rotacional. Segun el autor, el codificador y el predictor codifican vistas de contexto y objetivo mediante bloques de transformaciones ortogonales que preservan la norma y predicen estados objetivo multi-paso directamente en espacio latente, sin decodificar tokens intermedios. La model card afirma que el modelo mantiene det = +1.000000 con una deriva de ortogonalidad de 1,42e-14 tras 100 actualizaciones del objetivo, y una retencion de rango efectivo igual o superior al 99 %, con cero negativos contrastivos. Tambien declara capacidades de dinamica inversa en forma cerrada (recuperacion analitica de operadores de transicion causal sin pasos de gradiente) y de contrafactuales no conmutativos sensibles al orden de las acciones.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La model card indica que los pesos, los detalles de implementacion arquitectonica y el codigo fuente estan retenidos durante el ciclo de publicacion escalonada del world model, por lo que no es posible verificar de forma independiente las afirmaciones sobre arquitectura y entrenamiento.

## Capacidades

- Prediccion multi-paso en espacio latente: rueda acciones candidatas de un agente hacia delante en el espacio latente antes de emitir una decision unica de APPROVE, REJECT o ESCALATE.
- Juicio de seguridad para MPC (Model Predictive Control): actua como juez System-1 para el enrutamiento de acciones de agentes, deriva y defensa frente a inyeccion de prompts.
- Verificacion de rollouts relacionales multi-hop (2 a 3 saltos).
- Verificacion de ciencia causal y sentido comun fisico.
- Verificacion factual de un solo salto.
- Verificacion socratica y epistemica en cuatro modos (SEE, SAY, DO, KNOW).
- Induccion de reglas en rejillas visuales-espaciales 2D (evaluacion de tipo ARC-AGI-2 en el conjunto XL-smol).
- Calibracion epistemica y abtencion.
- Verificacion de terminacion de bucles de programa.
- Seguimiento de transiciones de estado simbolico.
- Planificacion de recursos y concurrencia.
- Recuperacion de dinamica inversa en forma cerrada y contrafactuales no conmutativos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking explicito: no disponible (la variante multimodal es un modelo separado, HELMHOLTZ-1-Omni).

## Casos de uso

- Juez de seguridad en pipelines de agentes: el modelo recibe el estado actual y las acciones candidatas de un agente y emite APPROVE/REJECT/ESCALATE tras rodar las acciones en espacio latente; es adecuado por su naturaleza de juez System-1 y por la defensa declarada frente a inyeccion de prompts.
- Enrutamiento de acciones en control predictivo (MPC): se usa para puntuar y filtrar trayectorias de un controlador antes de ejecutarlas, aprovechando la prediccion multi-paso en latente sin decodificar tokens.
- Verificacion en CI solo con CPU: al ser un modelo de ~13,8M parametros almacenados, puede integrarse en pipelines de integracion continua para validar salidas de agentes o reglas de estado sin requerir GPU.
- Validacion de planes multi-hop en asistentes: comprueba si una secuencia de pasos relacionales (2 a 3 saltos) conduce al estado objetivo, util para depurar planificadores de tareas.
- Deteccion de bucles infinitos en programas generados: mediante la capacidad de verificacion de terminacion de bucles, se puede usar como filtro previo a la ejecucion de codigo sintetizado por otro modelo.
- Comprobacion de coherencia fisica en simulaciones: la verificacion de ciencia causal y sentido comun fisico permite descartar trayectorias fisicamente implausibles en entornos simulados.
- Induccion de reglas en rejillas 2D: para tareas de tipo ARC-AGI-2, el modelo puede validar reglas espaciales inducidas antes de aplicarlas.
- Calibracion y abtencion en sistemas de decision: la capacidad de calibracion epistemica permite que el sistema se abstenga cuando la confianza es baja, reduciendo decisiones erroneas en produccion.

## Benchmarks y rendimiento

Los resultados siguientes son los declarados por el autor en la model card; no se han verificado de forma independiente.

| Suite XL-smol (6 suites agregadas) | Registros (n) | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---:|---:|---:|---:|---:|
| Rollout relacional multi-hop (2..3 saltos) | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Ciencia causal y sentido comun fisico | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Verificacion factual de un salto | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Verificacion socratica 4 modos | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Induccion de reglas en rejilla 2D (ARC-AGI-2) | 600 | 1.800 (3.600 total) | 100,00 % | 100,00 % | 100,0 % |
| Enrutamiento MPC, deriva e inyeccion de prompts | 403 | 1.209 | 99,75 % | 100,00 % | 100,0 % |
| Agregado macro / micro | 5.003 | 11.009 (12.809 total) | 99,96 % / 99,98 % | 100,00 % | 100,0 % |

| Dominio (suite completa de 12 dominios) | Registros (n) | Preguntas | Precision primaria | Precision preguntas core | ECE |
|---|---:|---:|---:|---:|---:|
| Rollouts relacionales multi-hop | 1.000 | 2.000 | 100,00 % | 100,00 % | 0,0883 |
| Ciencia causal y sentido comun | 1.000 | 2.000 | 100,00 % | 100,00 % | 0,0206 |
| Verificacion factual de un salto | 1.000 | 2.000 | 100,00 % | 100,00 % | 0,0190 |
| Verificacion socratica 4 modos | 1.000 | 2.000 | 100,00 % | 100,00 % | 0,00002 |
| Induccion de reglas en rejilla 2D (ARC-AGI-2) | 600 | 1.800 (3.600 total) | 100,00 % | 71,78 % (98,44 % eleccion) | 0,0035 |
| Enrutamiento MPC y deriva | 403 | 1.209 | 99,75 % | 66,67 % | 0,2899 |
| Calibracion epistemica y abtencion | 80 | 160 | 78,12 % | 78,12 % | 0,0764 |
| Verificacion de terminacion de bucles | 150 | 600 | 74,00 % | 74,00 % | 0,0915 |
| Seguimiento de transiciones de estado simbolico | 60 | 180 | 73,33 % | 73,33 % | 0,0890 |
| Bateria de grafo de conocimiento de prerrequisitos (v5) | 2.777 | 7.558 | 72,85 % | 72,85 % | 0,0881 |
| Planificacion de recursos y concurrencia | 60 | 180 | 71,67 % | 71,67 % | 0,0940 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~13,8M parametros almacenados, la huella en memoria en precision completa seria del orden de decenas de MB, pero al no publicarse los pesos ni el formato, no se puede confirmar.
- GPU recomendadas: no disponible. La model card orienta el modelo a despliegue en el borde y a pipelines solo con CPU.
- Cabe en GPU de consumo: no disponible de forma verificable; por tamano declarado (~13,8M parametros) seria compatible con cualquier GPU de consumo, pero los pesos no estan publicados.
- Opciones de despliegue: la libreria declarada es transformers; no se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HELMHOLTZ-JEPA-b0.7.0-10m | ~13,8M almacenados (~34M equiv. densa) | no disponible | JEPA rotacional, juez System-1 | Apache 2.0 | Pesos retenidos en el ciclo de publicacion |
| MatterWaveAI/helmholtz-1 (30M) | 30M (segun model card) | no disponible | JEPA, familia HELMHOLTZ-1 | no disponible en la informacion | no disponible |
| MatterWaveAI/helmholtz-1-omni | ~54,4M almacenados (~135M equiv. densa) | no disponible | Omni-JEPA multimodal (texto, vision, audio, voz, rejillas 2D) | no disponible en la informacion | no disponible |
| Meta V-JEPA 2 | no disponible | no disponible | World model entrenado con video para robots y agentes | no disponible en la informacion | no disponible |

## Limitaciones y advertencias

- Pesos, implementacion y codigo fuente no publicados: la model card indica retencion durante el ciclo de publicacion escalonada, por lo que el modelo no es utilizable tal cual a pesar de la licencia Apache 2.0 declarada.
- Benchmarks no verificables de forma independiente: los resultados del 100 % en varias suites provienen exclusivamente del autor y no hay artefactos publicos para reproducirlos.
- Riesgo de sobreajuste a las suites XL-smol: las evaluaciones son propias del autor y no equivalen a benchmarks estandar como MMLU, HumanEval o GSM8K; no se han publicado resultados en esos benchmarks.
- Calibracion irregular en varios dominios: el ECE declarado alcanza 0,2899 en enrutamiento MPC y 0,0940 en planificacion de recursos, lo que indica una calibracion pobre en esas tareas.
- Precision limitada en algunos dominios: 71,67 % en planificacion de recursos y concurrencia, 72,85 % en la bateria de prerrequisitos y 73,33 % en seguimiento de estado simbolico.
- Idiomas soportados no declarados: no hay informacion sobre capacidades multilingues ni sobre el tratamiento del texto de entrada.
- Longitud de contexto no declarada: no se puede evaluar su idoneidad para conversaciones o documentos largos.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo no esta disenado como generador de texto general, sino como juez y world model.
- Uso comercial: la licencia declarada es Apache 2.0, pero la ausencia de pesos publicados impide ejercer ese uso en la practica.
- Sesgos conocidos: no disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-jepa-b0.7.0-10m
- Modelo base: https://huggingface.co/MatterWaveAI/grt-10m
- Familia HELMHOLTZ-1 (30M): https://huggingface.co/MatterWaveAI/helmholtz-1
- Variante multimodal HELMHOLTZ-1-Omni: https://huggingface.co/MatterWaveAI/helmholtz-1-omni
- V-JEPA 2 (Meta, referencia de world models): https://about.fb.com/news/2025/06/our-new-model-helps-ai-think-before-it-acts/
