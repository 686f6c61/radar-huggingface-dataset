# jkorstad/hacmdn-qwen3-0.6b-sql-window-rewriter-v1

## Resumen

`jkorstad/hacmdn-qwen3-0.6b-sql-window-rewriter-v1` es un micro-especialista publicado por el usuario jkorstad dentro del ecosistema HACMDN-Net (Hermes Agent Community Microtuned Decentralized Network). No es un modelo entrenado desde cero, sino un adaptador LoRA (formato PEFT) montado sobre `Qwen/Qwen3-0.6B`, el modelo denso de 0,6 mil millones de parámetros de la familia Qwen3. Su tarea es muy concreta: reescribir consultas SQL basadas en CTEs, subconsultas correlacionadas o auto-joins en consultas equivalentes para PostgreSQL 14+ que emplean funciones de ventana (ROW_NUMBER, DENSE_RANK, LAG, LEAD, SUM/AVG OVER).

El interés del modelo no reside en su capacidad general, sino en su enfoque de especialización extrema con abstención calibrada: según la model card, el adaptador aprende a responder solo cuando la tarea entra en su dominio y a abstenerse explícitamente en caso contrario. El autor reporta métricas de aceptación del piloto HACMDN-Net (100% de acierto en dominio, 100% de abstención fuera de dominio y ROC-AUC de calibración de 1,0000), aunque se trata de cifras autodeclaradas sin validación independiente.

Es relevante ahora porque ejemplifica una tendencia creciente: adaptadores LoRA de bajo coste sobre modelos pequeños para tareas verticales de ingeniería de datos, pensados para integrarse en pipelines de agentes donde la fiabilidad y la capacidad de decir "no sé" importan más que la cobertura generalista. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su madurez y adopción son aún incipientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-0.6B |
| Parametros totales | 0,6B en el modelo base (el adaptador LoRA añade un numero no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-0.6B) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (Copyright 2026 Jonathan Korstad) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-0.6B`, un transformer denso de la familia Qwen3 que, según la documentacion de Qwen, soporta conmutacion entre modo "thinking" y "non-thinking", razonamiento mejorado y capacidades de agente para integracion de herramientas. El adaptador en si es un LoRA entrenado con la libreria `peft`; la model card no detalla el rango, el alpha, las capas objetivo ni el numero de tokens de entrenamiento.

La innovacion declarada es la "calibrated abstention": el modelo debe abstenerse de responder cuando la consulta queda fuera de su nicho (reescritura de SQL a funciones de ventana en PostgreSQL 14+). La model card indica que el base es compatible con `mergekit` DARE/TIES por pertenecer a una unica familia base, lo que permitiria fusionar el adaptador con otros del mismo ecosistema. No se especifican datos de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Reescritura de SQL: transforma consultas con CTEs, subconsultas correlacionadas o auto-joins en equivalentes con funciones de ventana de PostgreSQL 14+ (ROW_NUMBER, DENSE_RANK, LAG, LEAD, SUM/AVG OVER).
- Abstención calibrada: segun la model card, el modelo declina tareas fuera de su dominio en lugar de producir una respuesta incorrecta.
- Especializacion de nicho: pertenece al barrio `nbh-data-engineering` del ecosistema HACMDN-Net.
- Compatibilidad con el ecosistema Hermes Agent: pensado para integrarse como micro-especialista en un agente mayor.
- Capacidades generales heredadas del base Qwen3-0.6B (generacion de texto, razonamiento basico, tool calling segun la documentacion de Qwen3): no verificadas especificamente para este adaptador.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Modernizacion de consultas legacy en PostgreSQL: el modelo recibe una consulta con auto-join o subconsulta correlacionada y devuelve la version con funciones de ventana, reduciendo el trabajo manual de refactorizacion en equipos de datos.
- Optimizacion de rendimiento en pipelines analiticos: sustituir patrones de subconsulta por `ROW_NUMBER()` o `SUM() OVER` suele mejorar los planes de ejecucion en PostgreSQL 14+; el adaptador automatiza esa reescritura en lotes.
- Agente de ingenieria de datos: al ser un micro-especialista con abstención, puede registrarse como herramienta en un agente orquestador (por ejemplo, del ecosistema Hermes Agent) que le enrute solo consultas de reescritura SQL y derive el resto a otros especialistas.
- Revision automatizada en CI/CD de migraciones SQL: integrar el adaptador en un paso de validacion que detecte consultas reescribibles con funciones de ventana y proponga el cambio antes del despliegue.
- Asistente interno para analistas: un chat que recibe SQL y sugiere la version con window functions, con la garantia de que se abstiene si la peticion no es de este dominio (evitando respuestas inventadas).
- Generacion de ejercicios y documentacion tecnica: producir pares "antes/despues" de consultas para material de formacion sobre funciones de ventana en PostgreSQL.
- Prototipado de bajo coste en GPU consumer: al partir de un base de 0,6B, permite desplegar el especialista en hardware modesto para pruebas internas.

## Benchmarks y rendimiento

La model card reporta la evaluacion de aceptacion del piloto HACMDN-Net (§6.2 y §11). Son cifras autodeclaradas por el autor, sin validacion independiente:

| Metrica | Qwen/Qwen3-0.6B sin tocar | Adaptador fine-tuned | Umbral |
|---|---|---|---|
| Puntuacion global en held-out | 0,00% | 100,00% | >= +15% |
| Precision en dominio (nicho) | 0,00% | 100,00% | no disponible |
| Tasa de abstencion fuera de dominio | 0,00% | 100,00% | >= 90% |
| Riesgo de aceptacion erronea | 100,00% | 0,00% | <= 10% |
| ROC-AUC de calibracion de confianza | 0,4800 | 1,0000 | > 0,70 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, BIRD, Spider) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el base Qwen3-0.6B en bfloat16 ocupa aproximadamente 1,2 GB de pesos; con overhead de activaciones y cache KV, un despliegue tipico requiere del orden de 2-4 GB de VRAM. El adaptador LoRA anade una cantidad marginal no especificada.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; tambien A100/H100 para despliegues por lotes de alta concurrencia.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card); vLLM y TGI requieren fusionar el adaptador con el base o usar soporte de adaptadores LoRA; llama.cpp/Ollama requeririan convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jkorstad/hacmdn-qwen3-0.6b-sql-window-rewriter-v1` | 0,6B (base) + LoRA | no disponible | Reescritura SQL a window functions con abstencion | Apache-2.0 | Hugging Face (0 descargas) |
| `Qwen/Qwen3-0.6B` | 0,6B | no disponible en la informacion | Modelo generalista con modo thinking/non-thinking | Apache-2.0 | Hugging Face |
| CodeLlama-7B / modelos de codigo de 7B | 7B | no disponible en la informacion | Generacion de codigo general | Licencia propia | Amplia disponibilidad |
| Adaptadores LoRA SQL especializados (genericos) | variable | no disponible | Text-to-SQL o reescritura | variable | variable |

La comparativa directa con especialistas SQL publicos no esta disponible en la informacion proporcionada; el modelo se distingue por su nicho muy estrecho (solo reescritura a window functions en PostgreSQL) y por su mecanismo declarado de abstención.

## Limitaciones y advertencias

- Nicho extremadamente estrecho: solo cubre reescritura de SQL a funciones de ventana de PostgreSQL 14+; cualquier otra tarea deberia derivarse a otro modelo.
- Metricas autodeclaradas: los resultados de la model card (100% en todas las metricas, ROC-AUC de 1,0000) no proceden de una evaluacion independiente y deben tratarse con cautela; un ROC-AUC perfecto suele indicar un conjunto de evaluacion pequeno o poco representativo.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Riesgo de alucinacion: aunque el modelo declara abstención calibrada, un fallo en ese mecanismo puede producir SQL sintacticamente valido pero semanticamente distinto al original.
- Idiomas: no se especifican; se desconoce si maneja comentarios o identificadores en castellano.
- Contexto: no se documenta la longitud de contexto efectiva del adaptador; consultas SQL muy largas podrian excederla.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda conservar el aviso de copyright de Jonathan Korstad (2026) y verificar la licencia del base Qwen3-0.6B (tambien Apache-2.0).
- Dependencia del base: el adaptador no funciona sin `Qwen/Qwen3-0.6B`; cambios en el base o en la version de `peft` pueden alterar el comportamiento.
- Sin datos de entrenamiento publicados: no se puede auditar la composicion del dataset ni detectar sesgos sistematicos en la reescritura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkorstad/hacmdn-qwen3-0.6b-sql-window-rewriter-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio HACMDN-Net: https://github.com/Jpalmer95/hacmdn-net
- Space de buffer comunitario ZeroGPU: https://huggingface.co/spaces/jkorstad/hacmdn-community-buffer
- Documentacion de Qwen3-0.6B en ModuleLLM: https://modulellm-tutorial.readthedocs.io/en/latest/model_pages/qwen3-0.6b.html
