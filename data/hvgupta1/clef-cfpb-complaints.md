# hvgupta1/clef-cfpb-complaints

## Resumen

clef-cfpb-complaints es un adaptador fine-tuneado sobre el modelo base Cloudflare/clef, desarrollado por el usuario hvgupta1, especializado en la clasificacion de quejas bancarias reales presentadas ante la CFPB (Consumer Financial Protection Bureau) de Estados Unidos. El modelo resuelve una tarea de clasificacion multi-etiqueta en tres dimensiones: el tipo de problema (issue), el producto financiero afectado (product) y el resultado esperado por el consumidor (outcome). No es un modelo generativo de proposito general, sino un clasificador de dominio acotado.

El adaptador se entrena con la herramienta clef-tune sobre un conjunto de 3.000 filas de entrenamiento y 300 de evaluacion, derivadas del dataset hvgupta1/cfpb-bank-complaints-benchmark. La relevancia actual reside en la mejora sustancial frente al modelo base sin ajustar: el exact match en las tres etiquetas simultaneas pasa del 18,0% al 46,0% en el conjunto de evaluacion, y del 17,7% al 47,9% en un conjunto de prueba externo de 378 quejas de julio de 2026 nunca vistas durante el entrenamiento.

El repositorio ocupa 1,0 GB y contiene pesos en formato safetensors. La model card no documenta la arquitectura interna, el numero de parametros, la longitud de contexto ni los idiomas soportados del modelo base, por lo que esos datos se marcan como no disponibles a lo largo de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador sobre Cloudflare/clef) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Cloudflare/clef (commit a30162b99d68a481d8bd75d38df069a0cf83df40) |
| Relacion con el modelo base | adaptador (adapter) |
| Herramienta de fine-tuning | clef-tune 0.0.0+gaf1a9a4708f2 |
| Filas de entrenamiento | 3.000 |
| Filas de evaluacion | 300 |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base Cloudflare/clef ni detalla la configuracion del adaptador (rango LoRA, capas objetivo, hiperparametros de entrenamiento). Lo unico documentado es que se trata de un adaptador fine-tuneado con clef-tune 0.0.0+gaf1a9a4708f2 sobre el checkpoint a30162b99d68a481d8bd75d38df069a0cf83df40 de Cloudflare/clef, y que el entrenamiento se realizo sobre 3.000 filas con 300 filas reservadas para evaluacion.

El conjunto de datos de entrenamiento es hvgupta1/cfpb-bank-complaints-benchmark, compuesto por quejas reales dirigidas a un gran banco estadounidense y recogidas por la CFPB. El modelo se evalua ademas sobre 378 quejas recibidas en julio de 2026 que nunca se usaron en entrenamiento, lo que constituye una prueba de generalizacion temporal. No se documenta si hubo RLHF, DPO, decodificacion especulativa ni ninguna innovacion arquitectonica adicional. El coste del entrenamiento se estimo en 2,1 h (5,81 USD) y se ejecuto realmente en 2,0 h (5,47 USD).

## Capacidades

- Clasificacion multi-etiqueta de quejas bancarias en tres dimensiones simultaneas: issue (8 clases), product (3 clases) y outcome (3 clases).
- Prediccion de la categoria de problema: card features or terms, closing an account, disputed purchase, fraud or scam, managing an account, opening an account, other, unwanted charge.
- Prediccion del producto financiero: checking or savings account, credit card, money transfer.
- Prediccion del resultado esperado por el consumidor: explanation only, fix without money, money back.
- Calibracion de probabilidades mediante temperature scaling, con temperaturas ajustadas de 1,187 (issue), 1,173 (product) y 1,163 (outcome).
- No se documentan capacidades de generacion de texto libre, razonamiento general, codigo, matematicas, vision, tool calling, agentes ni modo thinking.
- No se documenta soporte multilingue; la tarea es en ingles (quejas CFPB de un banco estadounidense).

## Casos de uso

- Triaje automatizado de quejas regulatorias: el modelo clasifica cada queja entrante en issue, product y outcome, permitiendo enrutarla al equipo adecuado. El exact match del 47,9% en las tres etiquetas simultaneas sobre datos no vistos lo hace util como primera capa de triaje, con revision humana en los casos de baja confianza.
- Priorizacion de reclamaciones con expectativa de reembolso: la prediccion de outcome (money back, fix without money, explanation only) permite identificar que quejas probablemente requieren compensacion economica y asignar recursos de resolucion en consecuencia.
- Segmentacion por producto financiero: la clasificacion product (92,6% de acierto en el conjunto externo) permite agrupar quejas por linea de negocio (cuentas, tarjetas de credito, transferencias) para analisis de tendencias y reporting regulatorio.
- Monitorizacion de riesgo de fraude: la clase fraud or scam del eje issue, aunque con rendimiento limitado (13 de 17 casos correctos en la matriz de confusion de evaluacion), sirve como senal inicial para derivar casos a equipos de seguridad.
- Analisis de causas raiz: combinando las distribuciones de issue y product sobre grandes volumenes de quejas, los equipos de calidad pueden detectar patrones recurrentes (por ejemplo, disputas de compra en tarjetas de credito) y priorizar mejoras de proceso.
- Generacion de informes regulatorios: la clasificacion consistente y calibrada permite agregar estadisticas reproducibles sobre tipos de queja y resultados para presentaciones ante reguladores o auditorias internas.
- Benchmark de referencia para otros clasificadores: dado que la model card publica resultados frente a Claude Opus 5.5 con zero-shot y few-shot, el adaptador sirve como linea base cuantificada para comparar enfoques alternativos en la misma tarea.

## Benchmarks y rendimiento

Resultados en el conjunto de evaluacion interno (300 filas):

| Tarea | Metrica | Baseline (sin ajustar) | Fine-tuned |
|---|---|---|---|
| issue | accuracy | 0,373 | 0,677 |
| issue | macro-F1 | 0,325 | 0,599 |
| issue | log-loss | 1,981 | 0,940 |
| product | accuracy | 0,803 | 0,863 |
| product | macro-F1 | 0,782 | 0,843 |
| product | log-loss | 0,533 | 0,340 |
| outcome | accuracy | 0,530 | 0,690 |
| outcome | macro-F1 | 0,350 | 0,454 |
| outcome | log-loss | 1,177 | 0,647 |
| all | exact match | 0,180 | 0,460 |

Resultados en el conjunto de prueba externo (378 quejas de julio de 2026, nunca vistas en entrenamiento):

| Modelo | Exact match (3 etiquetas) | Issue | Product | Outcome |
|---|---|---|---|---|
| clef-cfpb-complaints (fine-tuned) | 47,9% (IC 42,9–52,9) | 70,1% | 92,6% | 68,3% |
| Cloudflare/clef sin ajustar | 17,7% (IC 14,0–21,4) | 38,1% | 87,3% | 52,4% |
| Claude Opus 5.5, con 30 ejemplos | 41,3% (IC 36,2–46,3) | 60,8% | 91,3% | 68,0% |
| Claude Opus 5.5, solo instrucciones | 33,3% (IC 28,6–37,8) | 56,1% | 91,8% | 64,0% |

Calibracion (ajustada sobre el mismo conjunto de evaluacion usado para seleccionar el checkpoint, por lo que los valores post-calibracion son ligeramente optimistas):

| Tarea | Temperatura | ECE antes | ECE despues | Log-loss antes | Log-loss despues |
|---|---|---|---|---|---|
| issue | 1,187 | 0,090 | 0,081 | 0,940 | 0,927 |
| product | 1,173 | 0,061 | 0,044 | 0,340 | 0,334 |
| outcome | 1,163 | 0,060 | 0,046 | 0,647 | 0,643 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no documenta el numero de parametros del modelo base ni del adaptador, por lo que no puede calcularse una estimacion fiable.
- GPU recomendadas: no disponible por la misma razon.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles. El unico dato de coste documentado es el del entrenamiento (2,0 h, 5,47 USD), no el de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exact match (3 etiquetas) | Issue | Product | Outcome | Licencia |
|---|---|---|---|---|---|---|---|
| clef-cfpb-complaints | no disponible | no disponible | 47,9% | 70,1% | 92,6% | 68,3% | no disponible |
| Cloudflare/clef (sin ajustar) | no disponible | no disponible | 17,7% | 38,1% | 87,3% | 52,4% | no disponible |
| Claude Opus 5.5 (con 30 ejemplos) | no disponible | no disponible | 41,3% | 60,8% | 91,3% | 68,0% | propietaria |
| Claude Opus 5.5 (solo instrucciones) | no disponible | no disponible | 33,3% | 56,1% | 91,8% | 64,0% | propietaria |

La comparativa se limita a las alternativas reportadas en la model card. No se dispone de datos de parametros, contexto ni licencia para ninguno de los modelos comparados, salvo la naturaleza propietaria de Claude Opus 5.5.

## Limitaciones y advertencias

- La clase outcome presenta un rendimiento deficiente en la matriz de confusion: la categoria fix without money obtiene 0 aciertos sobre 13 casos reales, lo que indica que el modelo practicamente no reconoce esa clase.
- La clase issue card features or terms tambien muestra bajo rendimiento (3 aciertos sobre 14 casos), con confusion frecuente hacia other y disputed purchase.
- El modelo esta entrenado sobre quejas de un unico gran banco estadounidense; su generalizacion a otras entidades, paises o marcos regulatorios no esta documentada y es probablemente limitada.
- Las temperaturas de calibracion se ajustaron sobre el mismo conjunto de evaluacion usado para seleccionar el checkpoint, por lo que las metricas de ECE y log-loss post-calibracion son ligeramente optimistas, tal como advierte el autor.
- El conjunto de prueba externo cubre solo 378 quejas de un unico mes (julio de 2026); los intervalos de confianza del exact match (42,9–52,9%) reflejan una incertidumbre considerable.
- No se documenta la licencia, lo que impide determinar si el uso comercial esta permitido. Cualquier despliegue en produccion requiere verificar primero la licencia del modelo base Cloudflare/clef y la del adaptador.
- No se documentan sesgos demograficos, linguisticos ni geograficos; al tratarse de quejas reales de consumidores, existe riesgo de que el modelo reproduzca sesgos presentes en los datos de entrenamiento.
- No se documenta el riesgo de alucinacion, aunque al ser un clasificador discriminativo este riesgo es menor que en modelos generativos; el riesgo principal es la clasificacion erronea con alta confianza.
- El repositorio no registra descargas ni likes, y la model card carece de informacion sobre arquitectura, parametros e idiomas, lo que dificulta una evaluacion independiente completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hvgupta1/clef-cfpb-complaints
- Modelo base Cloudflare/clef: https://huggingface.co/Cloudflare/clef
- Dataset de entrenamiento: https://huggingface.co/datasets/hvgupta1/cfpb-bank-complaints-benchmark
- Repositorio clef-tune y metodologia de benchmarks: https://github.com/hersh-gupta/clef-tune/tree/main/benchmarks/README.md
