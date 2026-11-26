# Daemons-Q/qsh-telecom-5g-nidd-federated-ckks

## Resumen

El modelo `qsh-telecom-5g-nidd-federated-ckks`, publicado por el usuario Daemons-Q, es un clasificador tabular de intrusiones de red para 5G entrenado de forma federada mediante FedAvg entre dos estaciones base del corpus 5G-NIDD. No es un modelo de lenguaje: se trata de una regresión logística multinomial (9 clases x 36 características + 9 sesgos, 333 parámetros en total) exportada a ONNX, pensada para ejecutarse en el navegador con `onnxruntime-web` y evaluarse bajo cifrado homomórfico CKKS. Forma parte de la demo de orquestación cuántico-segura QSMPC-QKD-QHE-AI-Hybrid.

El interés del artefacto es metodológico más que de rendimiento bruto: demuestra un flujo completo de agregación segura entre dos nodos que no comparten sus flujos, usando máscaras por pares acordadas mediante X25519, y publica una comparación pre-registrada contra las alternativas (cada estación por separado y el entrenamiento centralizado con todos los flujos). El modelo no gana esa comparación, y el autor lo declara explícitamente en la model card.

La relevancia actual reside en su carácter de ejemplo reproducible de privacidad diferencial operativa en dominios de telecomunicaciones, con métricas auditables (ECE por estación, macro F1 estilo FLamby, recuento de mensajes enmascarados) y una especificación de características documentada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica multinomial (modelo lineal, 9x36 + 9) |
| Parametros totales | 333 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion tabular sobre 36 caracteristicas por flujo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es una regresion logistica multinomial que opera sobre 36 caracteristicas de flujo estandarizadas y recortadas (clipped), produciendo 9 clases de ataque mas benigno. El entrenamiento se realizo mediante FedAvg a lo largo de 40 rondas, con 20 iteraciones locales por ronda y 270 mensajes enmascarados en total, bajo mascaras por pares acordadas mediante X25519. La temperatura registrada es de 0,9313 y el valor L2 de 1e-06. No hay destilacion de profesor: el modelo se entrena directamente sobre las etiquetas.

Los datos proceden del corpus 5G-NIDD (`BTS1_BTS2_fields_preserved.csv`), con 1.215.890 flujos reales y 113 columnas, de los cuales el cargador descarta 281.529 filas duplicadas bajo etiqueta contradictoria (el mismo flujo UDP flood aparece como Benign en la primera estacion y como UDPFlood en la segunda), dejando 934.361 filas tras la deduplicacion, con 196.208 benignas. De las 113 columnas se eliminan 67 con motivos documentados en `feature_spec.json`: 3 etiquetas, 9 identificadores de fila, 10 huellas de host, 5 columnas bit-identicas a `Dur`, la etiqueta de fichero `IdleTime` (que aporta 22 puntos de exactitud por si sola y se descarta por fuga de informacion) y 39 columnas de estado unico. Quedan 46 caracteristicas, de las que el modelo usa 36.

La innovacion tecnica destacable no esta en la arquitectura sino en el protocolo: agregacion segura federada con mascaras por pares, evaluacion del modelo bajo CKKS sobre 2.048 flujos reservados y replay de la suma enmascarada de la ultima ronda en la demo web.

## Capacidades

- Clasificacion tabular multietiqueta de flujos de red 5G en 9 clases: Benign, UDPFlood, HTTPFlood, SlowrateDoS, TCPConnectScan, SYNScan, UDPScan, SYNFlood e ICMPFlood.
- Inferencia en navegador mediante ONNX Runtime Web, sin backend dedicado.
- Evaluacion bajo cifrado homomorfico CKKS, lo que permite puntuar flujos sin descifrarlos en el servidor de agregacion.
- Participacion en un protocolo de agregacion federada con mascaras por pares (X25519) y FedAvg.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Deteccion de intrusiones en el borde de red 5G: el modelo clasifica cada flujo en una de las 9 clases con un coste computacional minimo (333 parametros), adecuado para despliegue en el propio plano de datos o en un navegador de operador.
- Demostracion de aprendizaje federado entre operadores o estaciones base: dos nodos entrenan conjuntamente sin intercambiar flujos crudos, usando FedAvg con mascaras por pares; util como referencia reproducible en proyectos de privacidad interorganizacional.
- Evaluacion con cifrado homomorfico en produccion: el artefacto ONNX se puede puntuar bajo CKKS, lo que permite a un tercero auditar clasificaciones sin ver los datos de entrada.
- Docencia e investigacion en privacidad: el modelo sirve como caso de estudio completo con metrica pre-registrada, comparacion contra baselines y datos de entrenamiento publicos.
- Prototipado de pipelines de seguridad en el navegador: al ser ONNX y ejecutarse con `onnxruntime-web`, permite construir demos interactivas de clasificacion de trafico sin infraestructura de servidor.
- Validacion de conjuntos de datos de intrusiones: la especificacion de caracteristicas (`feature_spec.json`) documenta que columnas se descartan y por que, lo que resulta util para limpiar y auditar otros derivados del corpus 5G-NIDD.
- Integracion en sistemas de deteccion con requisitos de baja latencia: el modelo lineal sobre 36 caracteristicas es trivial de evaluar y no requiere GPU.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `flamby_macro_f1` | 0,970821 |
| `union_macro_f1` | 0,97163 |
| `union_accuracy` | 0,986078 |
| `pooled_flamby_macro_f1` | 0,973941 |
| `station_1_alone_flamby_macro_f1` | 0,984722 |
| `station_2_alone_flamby_macro_f1` | 0,958705 |
| `station_1_macro_f1` | 0,959339 |
| `station_2_macro_f1` | 0,982303 |
| `ece_station_1` | 0,004095 |
| `ece_station_2` | 0,004994 |
| `n_eval` | 233.591 |
| `rounds` | 40 |
| `local_iterations` | 20 |
| `masked_messages` | 270 |
| `l2` | 1e-06 |
| `temperature` | 0,9312519672407261 |
| `student_params` | 333 |

La comparacion pre-registrada concluye que el modelo federado (0,9708) no supera a la estacion 1 entrenada por separado (0,9847), ni al entrenamiento centralizado con todos los flujos (0,9739), aunque si supera a la estacion 2 por separado (0,9587). El autor declara explicitamente que no gana la comparacion.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo tiene 333 parametros y los pesos ONNX ocupan del orden de kilobytes.
- GPU recomendadas: ninguna necesaria. Cualquier CPU moderna, incluida la de un dispositivo movil, puede evaluar el modelo.
- Cabe en cualquier GPU de consumo e incluso en navegadores sin aceleracion por hardware.
- Opciones de despliegue: ONNX Runtime (nativo o web), `onnxruntime-web` para ejecucion en navegador, y cualquier runtime compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo tabular de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia despreciable, pero no se publica una cifra medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qsh-telecom-5g-nidd-federated-ckks (federado) | 333 | no aplica | 0,9708 | CC-BY-4.0 | ONNX en Hugging Face |
| Estacion 1 sola (referencia del autor) | no disponible | no aplica | 0,9847 | no disponible | no disponible |
| Entrenamiento centralizado (pooled) | no disponible | no aplica | 0,9739 | no disponible | no disponible |
| Estacion 2 sola (referencia del autor) | no disponible | no aplica | 0,9587 | no disponible | no disponible |

No se encontro en la informacion proporcionada ninguna federacion publicada y revisada por pares de 5G-NIDD por estacion base con la que comparar; el autor lo indica explicitamente con fecha 2026-11-26.

## Limitaciones y advertencias

- El modelo no supera a la estacion 1 entrenada de forma aislada ni al entrenamiento centralizado; su valor es la privacidad, no la precision.
- Es un modelo lineal sobre 36 caracteristicas; no captura dependencias complejas ni secuencias, y su techo de rendimiento esta acotado por esa familia.
- El corpus original contiene 281.529 filas duplicadas con etiquetas contradictorias; el modelo no las lee, pero cualquier reutilizacion del dataset debe replicar ese filtrado.
- La columna `IdleTime` aporta 22 puntos de exactitud y se descarta por fuga de informacion; otros derivados del corpus que la conserven pueden mostrar metricas no comparables.
- 39 columnas del release original son de estado unico (30 de ellas 100% NULL), lo que reduce la superficie de caracteristicas realmente informativa.
- Riesgo de alucinacion no aplica (no genera texto), pero si existe riesgo de falsos negativos y positivos en la clasificacion de trafico, con implicaciones de seguridad.
- No se documentan sesgos por idioma ni geograficos, aunque el corpus procede de capturas de dos estaciones base concretas de 2022 y puede no generalizar a otras redes.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; es necesario citar a los autores del dataset 5G-NIDD segun la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- No se publican datos de cuantizacion, latencia ni throughput, lo que limita la planificacion de despliegues con requisitos estrictos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daemons-Q/qsh-telecom-5g-nidd-federated-ckks
- Repositorio del proyecto: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Dataset 5G-NIDD (Fairdata): https://doi.org/10.23729/e80ac9df-d9fb-47e7-8d0d-01384a415361
- Paper del dataset (IEEE Data Descriptions): doi:10.1109/IEEEDATA.2025.3592888
- Referencia arXiv citada en los tags: arxiv:2212.01298
