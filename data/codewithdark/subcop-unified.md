# codewithdark/subcop-unified

## Resumen

SubCoP Unified (Source-Conditional Conformal Prediction v2) no es un modelo de lenguaje generativo, sino un repositorio de investigación reproducible publicado por el autor codewithdark (A. Umar) que acompaña a un estudio confirmatorio titulado *Dissecting Source-Conditional Conformal Coverage: A Lesion-Disjoint Confirmatory Study with Gap Decomposition and Cross-Fitted Calibration*. Contiene el código, las particiones de datos, los resultados por semilla y los checkpoints de la cabeza de fusión de un sistema de clasificación de imágenes médicas con cuantificación de incertidumbre mediante predicción conformal.

El sistema se construye sobre características congeladas de un ResNet-50 (vectores de 2.048 dimensiones, 9.990 ejemplos agrupados) y una cabeza de fusión que proyecta esas características a 7 clases. Sobre esa base se aplican variantes de predicción conformal (APS agrupado frente a Mondrian, con y sin calibración cruzada) para producir conjuntos de predicción con cobertura garantizada, evaluando explícitamente el comportamiento bajo desplazamiento entre fuentes de datos (dataset shift) y fuentes pequeñas.

Su relevancia es metodológica más que de producto: descompone el gap de cobertura en una componente de cambio de puntuación (93 %) y otra de desequilibrio entre fuentes (7 %), y demuestra que la calibración cruzada tipo Mondrian mejora el tamaño efectivo de muestra en la fuente minoritaria (de 103 a 269) manteniendo coberturas de 0,98 ± 0,01. Es material de interés para investigadores en incertidumbre, validación clínica y metodología estadística aplicada a imagen médica, no para despliegues de inferencia de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 congelado como extractor de caracteristicas (pooling de 2.048 dimensiones) mas cabeza de fusion lineal (2048 -> 7 clases); envoltorios de prediccion conformal APS, Mondrian y Mondrian con calibracion cruzada. No es un transformer generativo |
| Parametros totales | no disponible (el repositorio no publica recuento de parametros; la cabeza de fusion mapea 2.048 caracteristicas a 7 clases) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica (tarea de clasificacion de imagenes, no de generacion) |
| Tipos de cuantizacion | no disponible / no aplica (se distribuyen checkpoints PyTorch de la cabeza de fusion, no pesos cuantizados) |
| Idiomas soportados | en (documentacion y model card en ingles); la tarea subyacente no es linguistica |
| Licencia | MIT para el repositorio; los datos de origen tienen licencias restrictivas (HAM10000 CC BY-NC-SA e IDRiD bajo terminos de investigacion) |
| Formato de pesos | .pt (checkpoints PyTorch de la cabeza de fusion, uno por ejecucion/semilla); caracteristicas ResNet-50 congeladas en `data/features/` (tensor agrupado 9.990 x 2.048) |

## Arquitectura y entrenamiento

El pipeline es un esquema de dos etapas. La primera es un extractor de caracteristicas fijo: un ResNet-50 preentrenado del que se congelan las representaciones y se almacena el vector agrupado de 2.048 dimensiones para cada imagen (9.990 x 2.048 en total). La segunda es una cabeza de fusion entrenada sobre esas caracteristicas, con salida de 7 clases, de la que se conservan los checkpoints del mejor epoch de validacion por ejecucion. El repositorio incluye el codigo fuente en `code/` con la implementacion de SubCoP v2: cuantiles basados en estadisticos de orden exactos, particiones disjuntas por lesion, un diseno factorial 3x2 de puntuacion por agrupacion, Mondrian con calibracion cruzada y descomposicion del gap de cobertura.

El estudio se ejecuta con 5 semillas (42 a 46) y evalua el comportamiento de la cobertura conformal cuando los datos provienen de varias fuentes con distinta prevalencia y tamano. La innovacion tecnica central no esta en la arquitectura neuronal, sino en la metodologia estadistica: la particion disjunta por lesion evita fuga de informacion entre train y test, y la descomposicion del gap de cobertura separa el efecto de cambio en la distribucion de puntuaciones (93 %) del efecto de desequilibrio entre fuentes (7 %). No se documentan en la informacion disponible fases de RLHF, DPO ni ajuste por preferencias, dado que no es un modelo generativo. Los datos originales no se redistribuyen: las imagenes deben reconstruirse desde `marmal88/skin_cancer` y `amin-nejad/idrid-disease-grading` usando `code/src/data_loader.py`, con particiones fijadas por SHA-256 en `runs/*/split_manifest.json`.

## Capacidades

- Clasificacion de imagenes medicas en 7 clases a partir de caracteristicas ResNet-50 congeladas.
- Cuantificacion de incertidumbre mediante conjuntos de prediccion conformal (APS y Mondrian).
- Garantia de cobertura empirica y diagnostico del gap de cobertura entre fuentes de datos.
- Calibracion cruzada (cross-fitted Mondrian) para fuentes minoritarias con tamano efectivo de muestra reducido.
- Analisis de desplazamiento de dominio (dataset shift) entre subpoblaciones, con descomposicion cuantitativa del error de cobertura.
- Reproducibilidad completa: configuracion, manifiestos de particion con hash, umbrales, metricas por semilla y artefactos por ejemplo en JSONL.gz.
- Evaluacion factorial de decisiones de diseno (3 opciones de puntuacion x 2 opciones de agrupacion) con resumen agregado entre semillas.
- No dispone de generacion de texto, razonamiento, codigo, tool calling, capacidades de agente, vision general, audio ni modo de pensamiento.

## Casos de uso

- Investigacion metodologica en prediccion conformal: el repositorio sirve como base reproducible para estudiar como se comporta la cobertura cuando se agrupan fuentes de distinto tamano; basta reutilizar `code/` y las particiones fijadas por hash para replicar los experimentos con semillas 42-46.
- Validacion de clasificadores medicos con garantias de cobertura: permite obtener conjuntos de prediccion que, en promedio, contienen la etiqueta correcta con una tasa objetivo (por ejemplo 0,90), lo que resulta util para decidir cuando derivar un caso a revision humana.
- Auditoria de sesgo entre subpoblaciones: la descomposicion del gap de cobertura (93 % cambio de puntuacion frente a 7 % desequilibrio) permite identificar si una caida de rendimiento se debe a un cambio en la dificultad de los casos o a un problema de tamano de muestra en una fuente concreta.
- Deteccion de retinopatia diabetica y lesiones cutaneas en entornos de investigacion: el sistema se ha evaluado sobre IDRiD y HAM10000, por lo que es directamente reutilizable como linea base en estudios comparativos sobre esos conjuntos.
- Diseno de pipelines de calibracion para datasets pequenos: la tecnica de calibracion cruzada tipo Mondrian es aplicable a cualquier escenario con una fuente minoritaria cuyo tamano efectivo de muestra es bajo (el estudio reporta una mejora de 103 a 269).
- Ensayo de tecnicas de incertidumbre antes de adoptarlas en produccion: al ser un repositorio ligero (0,2 GB) con checkpoints de una cabeza lineal, permite comparar rapidamente APS frente a Mondrian y medir el coste en tamano de conjunto de prediccion frente a la ganancia en cobertura.
- Docencia y formacion en estadistica aplicada: los artefactos por ejemplo (JSONL.gz) y las tablas confirmatorias auto-rellenadas del PDF facilitan usarlo como caso de estudio completo de un analisis confirmatorio preregistrado.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (5 semillas, 42-46):

| Metrica | Valor |
|---|---|
| Precision de test | 0,724 ± 0,009 |
| Cobertura APS agrupado (global) | 0,90 |
| Cobertura APS agrupado (retina) | 0,96 - 0,98 |
| Cobertura Mondrian (retina) | 0,87 - 0,95 |
| Descomposicion del gap de cobertura | 93 % cambio de puntuacion / 7 % desequilibrio |
| Calibracion cruzada Mondrian (retina), n_eff | 103 -> 269 |
| Calibracion cruzada Mondrian (retina), cobertura | 0,98 ± 0,01 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el objeto de evaluacion no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia de la cabeza de fusion: es una proyeccion lineal de 2.048 a 7 clases; se ejecuta sin problema en CPU y en cualquier GPU, incluso integradas.
- VRAM estimada: muy baja; el repositorio completo ocupa 0,2 GB y las caracteristicas congeladas (9.990 x 2.048 en float32) rondan los 80 MB, por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se especifican en la informacion disponible. Para inferencia de la cabeza no se requiere GPU dedicada. Si se quisiera recalcular las caracteristicas ResNet-50 sobre las imagenes originales, una GPU de consumo tipo RTX 3060 o superior seria suficiente; una A100 o H100 solo tendria sentido para procesar el dataset completo de forma masiva.
- Cabe en GPU de consumo: si, en cualquier modelo actual e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: la model card solo documenta carga directa con PyTorch (`torch.load` del checkpoint y `FusionHead(2048, 7)`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. Dado el tamano de la cabeza de fusion, la latencia de la capa final es del orden de microsegundos; el cuello de botella real seria el calculo de caracteristicas ResNet-50 si no se reutilizan las ya congeladas.

## Comparativa con modelos similares

SubCoP Unified no es comparable con modelos de lenguaje ni con modelos de vision de proposito general: es un artefacto de investigacion con una cabeza de clasificacion especifica y una metodologia conformal concreta. La comparacion relevante es con bibliotecas y marcos de prediccion conformal de uso comun, para las que la informacion disponible en esta busqueda no aporta cifras verificables.

| Alternativa | Naturaleza | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SubCoP Unified | Artefacto de investigacion: ResNet-50 congelado + cabeza de fusion 2048 -> 7 y envoltorios conformales | no disponible | no aplica | Precision 0,724 ± 0,009; cobertura APS 0,90 | MIT (repositorio); datos de origen no comerciales | HuggingFace, 0 descargas, 0 likes |
| Bibliotecas genericas de prediccion conformal (MAPIE, TorchCP, crepes) | Herramientas de proposito general para envolver modelos arbitrarios | no aplica | no aplica | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Publicas en sus repositorios respectivos |
| Clasificadores medicos especificos sobre HAM10000 o IDRiD | Modelos de tarea, entrenados de extremo a extremo | no disponible | no aplica | no disponible en la informacion proporcionada | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal: no genera texto, no razona, no ejecuta codigo ni soporta tool calling o agentes. Cualquier expectativa en ese sentido es incorrecta.
- Precision de test modesta (0,724 ± 0,009): el sistema no esta pensado para uso clinico autonomo y no sustituye el juicio de un profesional sanitario.
- Restriccion de licencia relevante: aunque el repositorio se publica bajo MIT, los datos de origen no se redistribuyen y estan sujetos a HAM10000 (CC BY-NC-SA) e IDRiD (terminos de investigacion). El uso comercial derivado de esos datos puede estar limitado, por lo que la licencia MIT del repositorio no debe interpretarse como via libre para explotacion comercial del pipeline entrenado.
- Las imagenes originales no estan incluidas: solo se distribuyen caracteristicas ResNet-50 congeladas, lo que limita la reproducibilidad a quien pueda reconstruir el dataset completo desde `marmal88/skin_cancer` y `amin-nejad/idrid-disease-grading`.
- Coberturas cercanas al 98 % en la fuente de retina se obtienen con un tamano efectivo de muestra de 269, lo que implica intervalos de confianza anchos; el propio autor senala descalibracion visible en fuentes pequenas en todos los regimenes evaluados.
- El estudio se limita a 5 semillas (42-46) y a dos conjuntos de datos medicos concretos; la generalizacion a otros dominios o a otras fuentes no esta demostrada.
- Riesgo de sesgo de seleccion y de prevalencia: la evaluacion separa fuentes, pero no se documentan en la informacion disponible analisis de sesgo por subgrupos demograficos (edad, tono de piel, etnia), algo critico en dermatologia.
- El repositorio tiene 0 descargas y 0 likes, y no consta revision por pares externa mas alla del PDF LNCS incluido en `paper/`; debe tratarse como resultado de investigacion pendiente de replicacion independiente.
- La fecha de creacion registrada (2026-10-08) y la ausencia de pipeline declarado limitan la trazabilidad de la version publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/codewithdark/subcop-unified
- Dataset de origen de lesiones cutaneas (HAM10000): https://huggingface.co/datasets/marmal88/skin_cancer
- Dataset de origen de retinopatia diabetica (IDRiD): https://huggingface.co/datasets/amin-nejad/idrid-disease-grading
- Paper: *Dissecting Source-Conditional Conformal Coverage: A Lesion-Disjoint Confirmatory Study with Gap Decomposition and Cross-Fitted Calibration* (A. Umar), incluido como PDF LNCS en el directorio `paper/` del repositorio. No se dispone de DOI ni de enlace externo verificado.
- Repositorio de codigo: no disponible por separado; el codigo se distribuye dentro del propio repositorio de HuggingFace (`code/`).
- Demo: no disponible.
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a documentos de estrategia sanitaria sin relacion con SubCoP Unified.
