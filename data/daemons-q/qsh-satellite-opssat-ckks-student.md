# Daemons-Q/qsh-satellite-opssat-ckks-student

## Resumen

El modelo `qsh-satellite-opssat-ckks-student` es un clasificador tabular de muy pequeno tamano (210 parametros) publicado por el desarrollador Daemons-Q como parte de la demo de orquestacion cuantica-segura QSMPC-QKD-QHE-AI-Hybrid. Se trata de una regresion logistica sobre la expansion cuadratica (209 terminos) de las 18 caracteristicas por segmento publicadas en el benchmark OPS-SAT-AD, mas una columna de metadatos (`sampling`). Su proposito es actuar como "estudiante" destilado del modelo profesor en texto plano, con un tamano lo suficientemente reducido como para ser evaluado bajo cifrado homomorfico CKKS en el navegador mediante onnxruntime-web.

El modelo resuelve un problema muy concreto: la clasificacion de segmentos de telemetria del CubeSat OPS-SAT de la ESA para detectar anomalias, pero en un escenario de privacidad preservada donde la inferencia se ejecuta sobre datos cifrados. No es un modelo de lenguaje ni un transformer; es un artefacto de investigacion orientado a demostrar que una inferencia tabular puede realizarse bajo CKKS con un coste computacional asumible. Su relevancia actual es acotada y experimental: sirve como prueba de concepto de pipelines de machine learning sobre datos cifrados en entornos con requisitos de confidencialidad, no como componente listo para produccion.

La arquitectura es, por tanto, una regresion logistica lineal sobre un mapa de caracteristicas expandido cuadraticamente. El repositorio ocupa 0.0 GB y el formato de pesos es ONNX. La licencia es CC-BY-4.0 y el modelo no declara idiomas soportados, lo cual es coherente con su naturaleza tabular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica sobre expansion cuadratica de caracteristicas (209 terminos) |
| Parametros totales | 210 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo tabular, sin contexto textual) |
| Tipos de cuantizacion | No disponible (pesos ONNX; evaluado bajo CKKS en la demo) |
| Idiomas soportados | No disponible (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |
| Entrada | 19 columnas (18 caracteristicas por segmento + `sampling`) |
| Expansion de caracteristicas | Cuadratica, 209 terminos |
| Tarea | Clasificacion tabular binaria (deteccion de anomalias) |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El modelo es una regresion logistica que opera sobre la expansion cuadratica de las 18 caracteristicas publicadas del dataset OPS-SAT-AD mas la columna `sampling`. La expansion genera 209 terminos, lo que permite capturar interacciones de segundo orden entre caracteristicas sin salir del regimen lineal. Segun la model card, esta expansion se calcula sobre el texto plano antes del cifrado, de modo que el coste multiplicativo bajo CKKS se mantiene en una sola producto punto empaquetado con profundidad multiplicativa constante. El anillo CKKS dispone de ordenes de magnitud mas de slots de los que necesita este mapa de caracteristicas, por lo que el cuello de botella es el mapa de caracteristicas, no el cifrado.

El entrenamiento se realizo mediante destilacion desde un modelo profesor en texto plano de 117 parametros. Los datos proceden del dataset OPS-SAT-AD (Ruszczak et al., Scientific Data 12, 710, 2025), que contiene 2.123 segmentos de telemetria anotados en 9 canales del CubeSat OPS-SAT de la ESA, con un 20,4% de segmentos anomalos. Se utiliza la particion train/test oficial del benchmark, que es estratificada aleatoria y no temporal, por lo que las metricas no miden generalizacion temporal. El estudiante se evaluo en 529 segmentos de test. No se especifica en la informacion disponible si se emplearon tecnicas de RLHF, DPO ni aumentacion de datos adicional.

## Capacidades

- Clasificacion binaria de segmentos de telemetria de satelite para deteccion de anomalias.
- Inferencia sobre datos cifrados bajo CKKS en el navegador mediante onnxruntime-web.
- Evaluacion como un unico producto punto empaquetado con profundidad multiplicativa constante.
- Captura de interacciones de segundo orden entre caracteristicas mediante expansion cuadratica (209 terminos).
- Acuerdo medido con el modelo profesor en texto plano: 0,958412.
- No soporta generacion de texto, codigo, matematicas, vision, audio ni tool calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues (modelo puramente tabular).

## Casos de uso

- Deteccion de anomalias en telemetria de satelites: el modelo clasifica segmentos de telemetria de 9 canales del CubeSat OPS-SAT y puede ejecutarse bajo cifrado CKKS, lo que permite desplegarlo en escenarios donde la telemetria no puede descifrarse en el servidor de inferencia.
- Demostracion de inferencia con privacidad preservada en el navegador: al ser un modelo ONNX de 210 parametros, se integra en aplicaciones web con onnxruntime-web y permite ejecutar clasificacion sobre datos cifrados en el cliente, sin exponer las caracteristicas en texto plano al servidor.
- Prueba de concepto de pipelines cuanticamente seguros: forma parte de la orquestacion QSMPC-QKD-QHE-AI-Hybrid y sirve para validar la viabilidad de combinar CKKS con modelos tabulares pequenos en flujos con requisitos de seguridad cuantica.
- Validacion de destilacion de modelos tabulares: su acuerdo del 95,84% con el profesor y su delta de metrica de 1,4571 puntos porcentuales lo convierten en un caso de estudio para evaluar tecnicas de destilacion en modelos de muy baja capacidad.
- Clasificacion de segmentos con expansion de caracteristicas en entornos con restricciones de profundidad multiplicativa: la expansion cuadratica precalculada en texto plano permite mantener la profundidad constante bajo CKKS, util en arquitecturas homomorficas con presupuesto de niveles limitado.
- Benchmarking de modelos tabulares sobre OPS-SAT-AD: permite comparar el rendimiento de un estudiante destilado frente a las 30 lineas base publicadas por Ruszczak et al., con metricas reproducibles sobre la particion oficial de test.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Agreement con el profesor | 0,958412 |
| AUC-PR | 0,968055 |
| Disagreement on positives | 0,070796 |
| Metric delta | 0,014571 |
| Metric delta (pp) | 1,4571 |
| n_eval | 529 |
| Student metric | 0,904348 |
| Student params | 210 |
| Teacher metric | 0,918919 |
| Teacher params | 117 |
| F1 clase minoritaria (estudiante) | 0,9043 |
| AUC-PR (estudiante) | 0,9681 |
| AUC-PR (profesor) | 0,968107 |

Comparacion con las lineas base publicadas en Ruszczak et al., Scientific Data 12 (2025):

| Modelo | AUC-PR | F1 | MCC |
|---|---|---|---|
| FCNN (mejor de 30 lineas base) | 0,979 | 0,946 | 0,932 |
| XGBOD | 0,975 | No disponible | No disponible |
| RF+ICCS | 0,963 | No disponible | No disponible |
| Este estudiante (CKKS) | 0,9681 | 0,9043 | No disponible |
| Profesor en texto plano | 0,968107 | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos ONNX (210 parametros). No requiere GPU dedicada.
- GPU recomendadas: no aplica; el modelo se ejecuta en CPU sin problemas.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna, incluidos dispositivos moviles y navegadores.
- Opciones de despliegue: onnxruntime-web (navegador), ONNX Runtime (CPU), y potencialmente cualquier runtime compatible con ONNX. La demo especifica evaluacion bajo CKKS en el navegador.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste dominante en la demo es la evaluacion CKKS del producto punto empaquetado, no el modelo en si.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AUC-PR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este estudiante (CKKS) | 210 | No aplica | 0,9681 | CC-BY-4.0 | Hugging Face |
| Profesor en texto plano | 117 | No aplica | 0,968107 | No disponible | No distribuido publicamente |
| FCNN (Ruszczak et al.) | No disponible | No aplica | 0,979 | No disponible | Linea base publicada |
| XGBOD (Ruszczak et al.) | No disponible | No aplica | 0,975 | No disponible | Linea base publicada |
| RF+ICCS (Ruszczak et al.) | No disponible | No aplica | 0,963 | No disponible | Linea base publicada |

No se dispone de informacion sobre otros modelos tabulares comparables con soporte nativo de CKKS en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de prueba de concepto, no un sistema de produccion. La propia model card lo declara explicitamente.
- El AUC-PR de 0,9681 queda por debajo del techo publicado de 0,979 (FCNN), por lo que no supera a la mejor linea base del benchmark.
- La particion train/test es estratificada aleatoria, no temporal; las metricas no miden generalizacion sobre el tiempo.
- El modelo es especifico del dataset OPS-SAT-AD y de sus 18 caracteristicas publicadas; no es transferible a otros dominios sin reentrenamiento.
- El cliente debe calcular la expansion cuadratica y el z-scoring antes de cifrar; esto traslada parte del preprocesamiento al lado del cliente y no esta protegido por el cifrado.
- El acuerdo con el profesor se midio offline en texto plano, no bajo cifrado.
- El modelo no decide el veredicto de la pagina de demostracion segun la model card.
- Sin datos sobre sesgos, alucinacion o comportamiento fuera de distribucion; al ser un modelo tabular, el riesgo de alucinacion no aplica en el sentido habitual, pero si el de clasificaciones erroneas en regimenes no vistos.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero el dataset subyacente tambien es CC-BY-4.0 y requiere atribucion a Ruszczak et al.
- El modelo esta fijado a la version 1 del dataset (registro Zenodo 12588359); la version 2 (registro 15108715) cambia los ficheros y anade un fichero LICENSE.
- Sin informacion sobre cuantizacion, latencia o throughput bajo CKKS mas alla de la viabilidad cualitativa descrita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daemons-Q/qsh-satellite-opssat-ckks-student
- Repositorio del proyecto: https://github.com/Quantum-Daemons/QSMPC-QKD-QHE-AI-Hybrid
- Dataset OPS-SAT-AD (Zenodo v1): https://doi.org/10.5281/zenodo.12588359
- Dataset OPS-SAT-AD (Zenodo v2): https://doi.org/10.5281/zenodo.15108715
- Paper del benchmark: Ruszczak, Kotowski, Evans & Nalepa, "The OPS-SAT benchmark for detecting anomalies in satellite telemetry", Scientific Data 12, 710 (2025), doi:10.1038/s41597-025-05035-3
