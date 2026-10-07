# niko0xdev/julia-1-zorch-triage

## Resumen

ZOrch-1 Triage es un ajuste fino del encoder SupersonicLabs/Julia-1 (144.292.870 parametros) publicado por el usuario niko0xdev para clasificar tickets de Jira y otras entradas del ciclo de vida de desarrollo de software. El modelo resuelve una tarea de clasificacion multi-etiqueta en una sola pasada: asigna simultaneamente una etiqueta de rol (12 clases), una de accion (11 clases) y una de riesgo (5 clases) a cada ticket. Es relevante porque ataca un problema real de triaje en equipos de ingenieria y porque su model card publica resultados honestos, incluidos los negativos (no se alcanzo el objetivo del 95%).

Admite entradas en ingles, vietnamita (con o sin diacriticos) y coreano, y acepta desde un simple titulo hasta tickets completos con descripcion, etiquetas y criterios Given/When/Then. Se entreno con un ajuste fino completo en bf16 sobre una sola RTX 4090 y los pesos se distribuyen en formato safetensors bajo licencia Apache 2.0.

En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, por lo que se trata de una publicacion reciente y sin adopcion ni validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (encoder transformer de ~144M parametros con tres cabezas de clasificacion) |
| Parametros totales | 144.292.870 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors) |
| Idiomas soportados | en (ingles), vi (vietnamita), ko (coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base SupersonicLabs/Julia-1, solo que se trata de un encoder de aproximadamente 144 millones de parametros sobre el que se aplico un ajuste fino completo (full fine-tune) en bf16 con una unica RTX 4090. La cabeza de salida es multiple: tres clasificadores independientes (role con 12 etiquetas, action con 11 y risk con 5) que se evalúan en una sola pasada sobre la misma representacion del ticket.

Los datos de entrenamiento consisten en unos 6.200 tickets sinteticos escritos por agentes LLM a partir de una guia de etiquetas mas ejemplos reales few-shot. Cada muestra se conservaba solo si un etiquetador ciego independiente coincidia por cabeza, y despues se aumentaba con eliminacion de diacriticos, errores tipograficos, truncamiento y eliminacion de campos. Los tickets reales etiquetados se usaron para entrenamiento solo desde un split separado. La evaluacion se hizo sobre un benchmark real held-out de 329 tareas nunca usadas para entrenamiento ni para generacion de datos, con un subconjunto de 134 tareas ("confident labels") en el que los propios anotadores del benchmark coincidieron. Se realizaron cuatro rondas de entrenamiento (mas datos sinteticos, datos de contraste especificos, mayor peso de datos reales y mayor learning rate), todas con resultados entre el 44% y el 47% de acierto en las tres cabezas.

## Capacidades

- Clasificacion multi-etiqueta en una sola pasada: prediccion conjunta de rol (product, business_analysis, research, design, frontend, mobile, backend, data, ai, qa, devops, security), accion (implement, document, fix, test, research, review, analyze, investigate, design, deploy, refactor) y riesgo (normal, production, security, data_sensitive, architecture).
- Procesamiento de entradas heterogeneas: acepta solo un titulo, o titulo mas descripcion, etiquetas y criterios Given/When/Then.
- Soporte multilingue limitado a ingles, vietnamita (con o sin diacriticos) y coreano.
- Robuster ante ruido textual: el entrenamiento incluye aumentacion con errores tipograficos, truncamiento, campos eliminados y eliminacion de diacriticos.
- Gating por confianza: la salida `needs_review` permite marcar tickets dudosos (confianza minima por debajo de un umbral) y derivarlos a revision humana.
- No se documenta soporte de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito; es un modelo exclusivamente discriminativo.

## Casos de uso

- Triaje automatico de colas de Jira: el modelo etiqueta cada ticket entrante con rol, accion y riesgo antes de que un humano lo abra, reduciendo el tiempo de asignacion manual en backlogs grandes.
- Enrutado a equipos por rol: la cabeza de rol (12 clases) permite dirigir cada ticket al equipo correspondiente (frontend, backend, data, devops, qa, security) con una sola inferencia.
- Priorizacion por riesgo: las etiquetas production, security y data_sensitive permiten elevar automaticamente la prioridad de tickets sensibles, util como primera capa de filtrado antes de la revision humana.
- Gating de revision humana: usando el umbral de confianza documentado (por ejemplo 0,90), se puede enrutar solo el 25% de los tickets mas inciertos a revision manual, con un 90,9% de aciertos en las tres cabezas en ese subconjunto.
- Soporte multilingue para equipos distribuidos: el modelo procesa tickets en ingles, vietnamita y coreano, lo que permite un triaje unico en organizaciones con equipos en esos idiomas.
- Preprocesado para agentes LLM: el triaje se puede usar como paso previo barato (144M de parametros) que enriquece cada ticket con metadatos estructurados antes de pasarlo a un LLM mayor para resolucion.
- Analitica de backlog: clasificar retroactivamente un historico de tickets para medir distribucion de roles, tipos de accion y niveles de riesgo, y detectar cuellos de botella por equipo.
- Escalado de incidencias de seguridad: la etiqueta de riesgo security permite separar automaticamente potenciales incidencias de seguridad del flujo normal de soporte.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un benchmark real held-out de 329 tareas.

| Subconjunto | role | action | risk | las tres correctas |
|---|---|---|---|---|
| Todas las tareas (329) | 64,4% | 82,1% | 84,8% | 47,1% |
| Etiquetas confiables (134) | 79,9% | 82,1% | 90,3% | 62,7% |

Comportamiento del gating por confianza:

| Confianza minima | Cobertura (etiquetas confiables) | Las tres correctas | Cobertura (todas las tareas) | Las tres correctas |
|---|---|---|---|---|
| 0,80 | 46% | 88,5% | 36% | 73,1% |
| 0,90 | 25% | 90,9% | 18% | 80,0% |
| 0,95 | 14% | 100% (n=19) | 10% | 87,5% (n=32) |

Puntos debiles declarados por el autor: el rol es el cuello de botella (data y security se confunden con backend, devops y ai); en vietnamita la accion baja al 73,3% (n=30); y los titulos cortos sin contexto puntuan peor que los tickets estilo Gherkin (55,9% frente a 69,7% en las tres cabezas sobre etiquetas confiables). El autor indica que las cifras del umbral 0,95 se basan en muestras pequenas (n=19 y n=32) y deben tomarse como indicativas.

## Requisitos de hardware

- VRAM estimada para los pesos: ~0,29 GB en bf16/fp16 y ~0,58 GB en fp32, calculado a partir de los 144,3 millones de parametros (el tamano del repositorio, 0,6 GB, es coherente con pesos en fp32).
- VRAM recomendada para inferencia con batches y activaciones: menos de 2 GB, holgadamente dentro de cualquier GPU de consumo actual.
- GPU validada por el autor: una unica RTX 4090, usada para el ajuste fino completo en bf16.
- Cabe en cualquier GPU de consumo moderna (RTX 3060 o superior) y tambien en CPU, dado el reducido tamano del modelo.
- Opciones de despliegue: libreria transformers con el pipeline `text-classification`, Hugging Face Inference Endpoints (el repositorio lleva el tag `endpoints_compatible`) y los scripts del propio autor (`predict.py` en `scripts/v3/` del repositorio de GitHub). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos y no a encoders de clasificacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados en la informacion proporcionada. La unica comparacion posible es contra la version anterior del propio proyecto y contra la referencia humana/LLM usada en la evaluacion.

| Referencia | Parametros | Tarea | Resultado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZOrch-1 Triage (este modelo) | 144,3M | triaje de 3 cabezas | 47,1% las tres correctas (329 tareas) | Apache 2.0 | Hugging Face |
| ZOrch v3 (version anterior) | no disponible | triaje de 3 cabezas | 42% las tres correctas | no disponible | no disponible |
| Etiquetador LLM ciego (referencia de techo) | no disponible | triaje de 3 cabezas | 93% en rol, 81,8% en triples completos (98,5% en etiquetas confiables) | no disponible | no disponible |
| SupersonicLabs/Julia-1 (modelo base) | ~144M | no especificada | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- El objetivo declarado del 95% de acierto en las tres cabezas no se alcanzo: el mejor resultado es 47,1% sobre las 329 tareas y 62,7% sobre el subconjunto de etiquetas confiables.
- El rol es el punto debil principal: las clases `data` y `security` se confunden con `backend`, `devops` y `ai`.
- Rendimiento inferior en vietnamita (accion 73,3%, n=30) y en titulos cortos sin contexto (55,9% frente a 69,7% en las tres cabezas).
- El modelo base no generaliza bien a las etiquetas objetivo: cuatro rondas de entrenamiento se quedaron entre el 44% y el 47% en las tres cabezas.
- Sesgos potenciales: los datos de entrenamiento son mayoritariamente sinteticos y generados por agentes LLM a partir de una guia de etiquetas, por lo que pueden heredar los sesgos y convenciones del generador; el vocabulario esta anclado a practicas de Jira y SDLC y el filtrado por etiquetador ciego puede sesgar hacia los casos mas faciles.
- Riesgo de alucinacion: al ser un clasificador no genera texto libre, pero si puede emitir etiquetas incorrectas con alta confianza. El propio autor recomienda usar el gating `needs_review` para derivar tickets dudosos a una persona.
- Limitacion idiomatica: solo cubre ingles, vietnamita y coreano; no se documenta soporte de espanol ni de otros idiomas.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial, pero la licencia del modelo base SupersonicLabs/Julia-1 no esta disponible en la informacion consultada y conviene verificarla antes de un despliegue comercial.
- Caveat de produccion: el modelo tiene 0 descargas y 0 likes, sin validacion independiente, y las cifras de mayor precision (umbral 0,95) se basan en muestras de 19 y 32 casos, por lo que no son fiables para planificar un SLA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niko0xdev/julia-1-zorch-triage
- Modelo base: https://huggingface.co/SupersonicLabs/Julia-1
- Repositorio de codigo, constructores y script de evaluacion: https://github.com/niko0xdev/julia-1-zorch (directorio `scripts/v3/`)
- Paper: no disponible
- Demo: no disponible
- Blog del autor: no disponible
