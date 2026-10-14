# devinblaze/laya-multidomain-calibrated

## Resumen

Laya Multi-Domain Calibrated Decision Engine es un conjunto de pesos de decision publicado por el usuario devinblaze en HuggingFace bajo el identificador `devinblaze/laya-multidomain-calibrated`. No es un modelo de lenguaje generativo: se presenta como un motor de decision no autorregresivo de tipo "System 1", implementado en NumPy/SciPy, que produce una etiqueta discreta y una confianza calibrada a partir de un texto de entrada y una pregunta asociada. El paquete incluye pesos, sesgos y temperaturas de calibracion Platt, y se carga mediante la clase `LayaTrainer` de la libreria `laya` con `dim=256`.

Su relevancia practica no esta en la generacion de texto, sino en el coste de inferencia: el autor declara latencias de entre 0,07 ms y 0,25 ms en CPU, sin GPU ni framework de deep learning. Eso lo situa en la categoria de clasificadores de muy baja latencia utilizables como enrutadores, filtros o disparadores previos a un LLM. Cubre cinco dominios declarados: rubrica ICP de prospeccion B2B, intencion de compra B2B, matching de catalogo de hardware de red e industria, senales de futuros USD-M de Binance y primitivas de accion DOM para agentes de navegador.

La informacion publicada es escasa: no hay detalle del dataset de entrenamiento, del numero de parametros, de la composicion de las muestras ni de evaluacion en conjuntos de test independientes. El propio autor reporta una exactitud de validacion del 100,00 % con un ECE de 0,2263, lo que conviene leer con cautela. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de decision no autorregresivo ("System 1") implementado en NumPy/SciPy, con capas de pesos y sesgos y calibracion Platt mediante temperaturas por dominio |
| Parametros totales | no disponible (el unico dato dimensional publicado es `dim=256` en la construccion de `LayaTrainer`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la API `predict` recibe una cadena de texto y una pregunta, sin ventana declarada) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en JSON, no en un formato con esquemas de cuantizacion) |
| Idiomas soportados | no disponible; los ejemplos de la model card estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | JSON (`laya_multidomain_calibrated.json`) con los diccionarios `weights`, `biases` y `temperatures` |
| Metricas declaradas | accuracy y ECE (Expected Calibration Error) |
| Metodo de calibracion | Platt scaling (temperaturas por dominio) |
| Regla de puntuacion | proper_reward (log + spherical - RPS) |
| Latencia declarada | 0,07 ms - 0,25 ms en CPU |
| Autor | devinblaze |
| Fecha de publicacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

La model card describe el modelo como un "System 1 non-autoregressive decision engine". No hay transformer, atencion ni decodificacion autoregresiva: el estado del modelo son matrices de pesos y vectores de sesgos que se cargan directamente en `LayaTrainer(dim=256)`, junto con un diccionario de temperaturas de calibracion. La inferencia se ejecuta en NumPy/SciPy puro, lo que explica las latencias declaradas de 0,07 ms a 0,25 ms en CPU. El pipeline de HuggingFace figura como "no disponible" y la libreria asociada es `laya`.

No se publica informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el preprocesado, ni si hubo etapas de ajuste por preferencias humanas (RLHF/DPO). Tampoco se documentan hiperparametros, semillas, particiones de entrenamiento/validacion/test ni el procedimiento de calibracion mas alla de la mencion a Platt scaling. La unica innovacion tecnica explicitamente descrita es el uso de una regla de puntuacion estrictamente propia (`proper_reward`, combinacion de log, spherical y RPS) sobre decisiones ordinales, y la calibracion por temperaturas por dominio.

## Capacidades

- Clasificacion ordinal en rubrica ICP de prospeccion B2B: puntuacion de 1 a 5 que distingue distribuidores de stock en Dubai, Reino Unido y China frente a OEM excluidos y leads de India.
- Clasificacion de intencion de compra B2B en cuatro etiquetas: `rfq` (RFQ/PO inmediato), `project` (planificado), `info` (descarga de catalogo) y `none` (spam).
- Matching de catalogo de hardware con cuatro grados (`exact`, `high`, `partial`, `none`) sobre referencias de Cisco, Fortinet, Siemens, ABB y Schneider.
- Generacion de senales para futuros USD-M de Binance, con horizonte de decision declarado de 33 ms y cuatro etiquetas: `fade` sobre subida sobreextendida, `bounce`, `breakout` y `hold`.
- Seleccion de acciones de navegador para agentes: primitivas `click`, `type`, `select`, `scroll` y `wait`.
- Salida de confianza calibrada junto a la etiqueta elegida (`res["choice"]`, `res["confidence"]`), pensada para umbralizar decisiones.
- No soporta generacion de texto libre, razonamiento multi-paso declarado, tool calling generico, vision, audio ni capacidades multilingues documentadas.

## Casos de uso

- Cualificacion automatica de leads B2B: el modelo puntua de 1 a 5 una descripcion de empresa y decide si es un distribuidor con stock en Dubai, Reino Unido o China; con 0,07-0,25 ms por inferencia se puede aplicar a cada formulario entrante sin coste apreciable.
- Enrutado comercial por intencion: clasificar cada mensaje en `rfq`, `project`, `info` o `none` permite enviar los RFQ al equipo de ventas, los proyectos a preventa y descartar spam antes de que llegue a un CRM o a un LLM caro.
- Filtrado previo (pre-router) de un pipeline con LLM: usar la decision de sub-milisegundo como primera etapa para descartar o etiquetar el 80-90 % del trafico y reservar el modelo generativo para los casos ambiguos.
- Matching de catalogo en comercio de componente de red e industria: dado un texto de pedido, determinar si la referencia solicitada coincide de forma exacta, alta o parcial con el catalogo de Cisco, Fortinet, Siemens, ABB o Schneider, para automatizar presupuestos.
- Deteccion de spam en formularios y bandejas de entrada: la etiqueta `none` de la tarea de intencion de compra funciona como clasificador de descarte en admision de leads.
- Senales cuantitativas de baja latencia en Binance USD-M: el modelo produce decisiones cada 33 ms sobre si desvanecer un pump sobreextendido, esperar rebote, seguir ruptura o mantenerse, integrable en un bot que necesite reaccionar a nivel de tick.
- Automatizacion de navegador con agentes: elegir la primitiva DOM (`click`, `type`, `select`, `scroll`, `wait`) en cada paso de una tarea de navegacion web sin invocar un LLM en cada iteracion.
- Despliegue en entornos sin GPU o en el edge: al ejecutarse en NumPy/SciPy puro, puede correr en una instancia minima, en un contenedor pequeno o junto al backend de aplicacion.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son los siguientes, medidos sobre la validacion del propio modelo; no se aporta comparacion con lineas base ni evaluacion en test independiente.

| Metrica | Valor | Notas |
|---|---|---|
| Validation accuracy | 100,00 % | Autoinformado; no se especifica el tamano ni la composicion del conjunto de validacion |
| Expected Calibration Error (ECE) | 0,2263 | Autoinformado; un valor de esta magnitud indica desviacion notable entre confianza y acierto |
| Latencia de inferencia | 0,07 ms - 0,25 ms | CPU, motor NumPy/SciPy puro |
| Throughput | no disponible | No publicado; la latencia declarada implicaria del orden de 4.000 a 14.000 inferencias por segundo y por hilo en el mejor caso, calculo derivado y no verificado |
| MMLU, HumanEval, GSM8K y similares | no aplica | El modelo no realiza tareas generativas ni de razonamiento evaluables con esos benchmarks |

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El motor se ejecuta en CPU con NumPy/SciPy, sin CUDA ni aceleradores.
- GPU recomendadas: ninguna. No se documenta soporte para A100, H100, RTX 4090 ni otras GPU.
- Compatibilidad con GPU de consumo: no aplica; el modelo no necesita GPU de ningun tipo.
- Memoria RAM: no disponible. Con `dim=256` y cinco dominios de salida la huella deberia ser de kilobytes o pocos megabytes, pero el numero de parametros no esta publicado y no se puede confirmar.
- Opciones de despliegue: carga directa del checkpoint JSON mediante `LayaTrainer` de la libreria `laya`. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni servidores de inferencia de transformers, dado que los pesos no estan en safetensors ni GGUF.
- Latencia declarada: 0,07 ms a 0,25 ms por inferencia en CPU.
- Throughput: no disponible de forma oficial (ver la estimacion derivada en la seccion de benchmarks).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables, y el objeto no pertenece a la categoria de los transformers generativos, por lo que compararlo con LLM por parametros o contexto no seria significativo. La comparacion natural seria con clasificadores tabulares o lineales de produccion (regresion logistica, gradient boosting, clasificadores de intencion entrenados a medida), pero no se dispone de resultados de ninguno de ellos sobre los mismos dominios, ni de las particiones de datos necesarias para reproducir la comparacion.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya Multi-Domain Calibrated | no disponible | no disponible | accuracy 100,00 % (validacion), ECE 0,2263, 0,07-0,25 ms en CPU | apache-2.0 | HuggingFace, 0 descargas |
| Alternativas comparables identificadas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El 100,00 % de exactitud en validacion con un ECE de 0,2263 es una combinacion sospechosa: sugiere posible sobreajuste o evaluacion sobre una particion muy cercana al entrenamiento. No se documenta ninguna evaluacion en test independiente.
- La etiqueta "calibrated" convive con un ECE de 0,2263, que es un valor alto en terminos de calibracion; las confianzas de salida no deberian usarse directamente como probabilidades en produccion sin recalibracion y validacion propia.
- No se publica informacion sobre el dataset de entrenamiento, su tamano, su procedencia ni su fecha de corte, lo que impide auditar sesgos o fuga de datos.
- No hay idiomas declarados. Los ejemplos estan en ingles; el comportamiento con texto en castellano u otros idiomas es desconocido.
- Riesgo de alucinacion en el sentido de confianza mal calibrada: el modelo puede devolver una etiqueta con alta confianza en entradas fuera de su distribucion de entrenamiento (por ejemplo, un dominio distinto de los cinco listados).
- El dominio de senales de futuros de Binance tiene implicaciones financieras directas. Un clasificador de etiquetas discretas no constituye asesoramiento financiero ni incorpora gestion de riesgo; su uso en trading real exige validacion con datos fuera de muestra y control de exposicion.
- Riesgo de deriva temporal: la rubrica ICP esta anclada a geografias y tipos de empresa concretos (Dubai, Reino Unido, China; exclusion de OEM y de leads de India) y las senales de mercado dependen del regimen de volatilidad vigente en el momento del entrenamiento.
- No se especifica el numero de parametros ni el consumo de memoria, lo que complica el dimensionamiento y la planificacion de capacidad.
- No hay revisiones fijadas (hashes de commit) documentadas, ni informacion sobre quien mas ha revisado los pesos.
- Senales de adopcion nulas: 0 descargas y 0 likes, sin issues ni discusion publica, lo que reduce la probabilidad de que los fallos hayan sido detectados por terceros.
- La licencia apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; no se declaran restricciones adicionales.
- Dependencia de la libreria `laya`: el checkpoint solo es util con ese paquete, y no se documenta su version minima, su mantenimiento ni su compatibilidad con versiones futuras de NumPy.
- La model card no indica que el modelo deba usarse para tomar decisiones con impacto significativo sobre personas; se recomienda mantener supervision humana en cualquier flujo de cualificacion comercial o financiera.

## Enlaces

- HuggingFace: https://huggingface.co/devinblaze/laya-multidomain-calibrated
- Paper, blog, repositorio o demo del autor: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los resultados obtenidos eran contenido para adultos sin relacion alguna con el objeto de la ficha y no se enlazan.
