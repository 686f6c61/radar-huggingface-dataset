# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-BudgetJSD-Bottom10-ForwardKL-gap01-original10240

## Resumen

Este repositorio publica un adaptador LoRA, no un modelo completo, sobre `Qwen/Qwen2.5-VL-7B-Instruct`. Lo desarrolla el usuario de HuggingFace `enmingzhangzz` y forma parte de una linea de experimentos denominada OPSD (seleccion de posiciones de respuesta guiada por presupuesto visual) combinada con VisionZip. El objetivo no es mejorar las capacidades del modelo base, sino investigar como se comporta el decoder de lenguaje cuando la torre de vision entrega solo el 10 % de los tokens visuales, mediante un entrenamiento que penaliza las posiciones de respuesta mas sensibles a ese recorte.

La innovacion principal es el criterio de seleccion de posiciones. Para cada posicion valida de la respuesta generada se calcula la divergencia Jensen-Shannon simetrica entre las distribuciones del propio estudiante a dos presupuestos visuales (10 % y 11 % de retencion) y se selecciona el `max(1, ceil(0,10 * N))` de posiciones con menor `B_t`, es decir, las menos sensibles al cambio de presupuesto. Sobre esas posiciones se aplica una KL directa (`KL(teacher || student)`) contra un profesor EMA con vision completa, con decaimiento 0,9999. El entrenamiento completo son 10.240 ejemplos y 320 actualizaciones del optimizador, en aproximadamente 6 horas y 30 minutos sobre 4 GPU.

Es relevante ahora porque el coste computacional de los modelos vision-lenguaje esta dominado por el numero de tokens visuales, y este adaptador documenta de forma reproducible, con auditorias de estado y hashes, una receta concreta de ajuste bajo recorte agresivo de tokens. Hay que subrayar que es un artefacto de investigacion: cero descargas, cero likes, sin licencia declarada y sin ninguna metrica de benchmark publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-VL-7B-Instruct; solo se entrena el decoder de lenguaje, la torre de vision permanece congelada |
| Parametros totales | No disponible para el adaptador como modelo completo; el modelo base es de la clase 7B y el adaptador entrena 40.370.176 parametros |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; los pesos del adaptador se distribuyen sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repositorio 0,2 GB |
| Configuracion LoRA | r16, alpha32, dropout 0 |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Dataset | OpenMMReasoner/OpenMMReasoner-SFT-874K (seleccion fija de 10.240 ejemplos) |
| Pipeline | image-text-to-text |
| SHA256 del adaptador | deb6b133d5f97353fed0d1707357ca3f0e80ab47de48c1323c47db48dad04c7d |
| Fecha de finalizacion | 2026-09-11T22:34:54.218008+00:00 (UTC) |

## Arquitectura y entrenamiento

El adaptador no modifica la topologia del modelo base. Se inicializa desde una instancia limpia de Qwen2.5-VL-7B-Instruct, sin adaptador previo, y se anaden matrices LoRA unicamente en el decoder de lenguaje; la torre de vision queda congelada. La inferencia con recorte de tokens se delega a la implementacion oficial de VisionZip, configurada con un 5 % de tokens dominantes mas un 5 % de tokens contextuales, lo que da la retencion del 10 % usada como presupuesto del estudiante. Cargar el adaptador por si solo no activa el recorte: hay que habilitar VisionZip por separado.

El procedimiento de entrenamiento es inusual y conviene detallarlo. Primero se genera un rollout greedy de hasta 512 tokens nuevos por muestra. Despues, para cada posicion valida de la respuesta, se puntua el mismo prefijo generado por el estudiante bajo dos presupuestos visuales distintos, 10 % y 11 %, y se calcula `B_t = JSD_simetrica(P_student,0.10 || P_student,0.11)` con mezcla equitativa y puntuaciones desacopladas del grafo. Se seleccionan las `max(1, ceil(0,10 * N))` posiciones con menor `B_t`, con ordenacion ascendente y desempate estable por orden de token. La perdida es la media aritmetica de `KL(P_full_visual_EMA_teacher || P_student,0.10)` en esas posiciones, es decir, KL directa o forward KL, sin reescalado de masa, sin agrupacion por lambda y sin objetivo supervisado de entropia cruzada ni contexto de profesor con verdad de referencia. El profesor es una media movil exponencial del propio estudiante con vision completa y decaimiento 0,9999, sin acceso a la respuesta correcta.

Los hiperparametros son AdamW con tasa de aprendizaje 2e-5 y weight decay 0, lote efectivo 32 (4 GPU x microbatch 8 x acumulacion 1), resolucion de imagen fija con minimo y maximo de 846.720 pixeles, computo en BF16 con FlashAttention2 y fragmentacion de la KL en bloques de 32 posiciones de respuesta. Se ejecutaron 320 actualizaciones del optimizador. La model card indica que pasaron 112 pruebas unitarias y de regresion antes del lanzamiento, que se auditaron el checkpoint de arranque y la recuperacion con estado de 32 a 64 ejemplos, y que la auditoria final verifica cada posicion original exactamente una vez, las 320 actualizaciones, perdidas y momentos finitos, el estado de la EMA y los cuatro estados RNG por rango. La perdida media final del ultimo lote sobre los cuatro rangos es 0,00038155886068125255, valor que el autor advierte explicitamente que no es una media de toda la ejecucion ni una puntuacion de evaluacion. La seleccion de datos no esta balanceada.

## Capacidades

- Generacion de texto e imagenes: pipeline `image-text-to-text`, hereda la capacidad multimodal del modelo base Qwen2.5-VL-7B-Instruct.
- Razonamiento multimodal: el dataset de ajuste, OpenMMReasoner-SFT-874K, esta orientado a razonamiento sobre imagenes; el adaptador se entrena sobre 10.240 ejemplos de ese conjunto.
- Inferencia con recorte de tokens visuales: soporta ejecucion con VisionZip al 10 % de retencion (5 % dominantes mas 5 % contextuales), reduciendo el numero de tokens que procesa el decoder.
- Ajuste selectivo de posiciones: la perdida solo actua sobre el 10 % de posiciones de respuesta con menor sensibilidad al presupuesto visual, no sobre la respuesta completa.
- Capacidades heredadas del modelo base no verificadas en este repositorio: soporte de tool calling, agentes, multilingueismo o modo de razonamiento no se documentan en la model card del adaptador y deben consultarse en la ficha de Qwen2.5-VL-7B-Instruct.
- No se declara ninguna capacidad adicional especifica del adaptador mas alla del ajuste bajo recorte visual.

## Casos de uso

- Investigacion en eficiencia de modelos vision-lenguaje: permite estudiar si el decoder puede mantener el comportamiento con un 10 % de los tokens visuales, aislando el efecto del ajuste LoRA frente al recorte aplicado solo en inferencia.
- Comparacion de estrategias de seleccion de tokens: las etiquetas del repositorio (budget-jsd, bottom10, forward-kl, gap01) describen una variante concreta dentro de una familia de experimentos, util para replicar y contrastar criterios de seleccion.
- Analisis de sensibilidad posicional: el criterio `B_t` produce una medida por posicion de la sensibilidad al presupuesto visual, reutilizable para diagnosticar en que partes de una respuesta el modelo depende mas de la imagen.
- Despliegue de bajo coste en tareas de descripcion de imagenes: con VisionZip al 10 % se reduce el coste de atencion sobre tokens visuales, lo que abarata el procesado de lotes grandes de imagenes en tareas de captioning o etiquetado.
- Procesamiento de documentos largos escaneados: al recortar tokens visuales, el coste por pagina disminuye, lo que puede interesar en pipelines de extraccion de informacion a gran escala, siempre con validacion propia porque no hay benchmarks publicados.
- Estudio de destilacion con profesor EMA: la receta teacher-student con KL directa y sin acceso a la verdad de referencia sirve como referencia metodologica para otros ajustes con autoconsistencia.
- Base para experimentos de fusion de adaptadores: al ser un LoRA ligero de 0,2 GB, es facil de fusionar con el modelo base o de combinar con otros adaptadores en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma de forma explicita que no se reclama ninguna puntuacion de benchmark. El unico numero de rendimiento publicado es la perdida media del ultimo lote sobre los cuatro rangos, 0,00038155886068125255, que el propio autor advierte que no es una media de la ejecucion completa ni una metrica de evaluacion.

| Metrica | Valor |
|---|---|
| Perdida media del ultimo lote (4 rangos) | 0,00038155886068125255 (no es metrica de evaluacion) |
| MMLU, HumanEval, GSM8K, MMMU u otros | No disponibles |
| Comparacion con modelos similares | No disponible |

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB de repositorio y anade 40.370.176 parametros entrenables, por lo que su coste de memoria es despreciable frente al modelo base.
- VRAM estimada para el modelo base en BF16 (no verificada en la informacion proporcionada): en torno a 16-17 GB solo para pesos, mas cache KV; requiere GPU de 24 GB o superior, como RTX 4090, L40S, A100 40 GB o H100.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB; cabe en RTX 4080, RTX 3090 o RTX 4090.
- VRAM estimada en cuantizacion de 4 bits (AWQ, GPTQ o GGUF): aproximadamente 5-7 GB; puede caber en GPU de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070.
- La retencion del 10 % de tokens visuales reduce el coste de atencion y la memoria asociada a secuencias visuales largas, pero no se publican cifras de ahorro medidas.
- GPU utilizadas en el entrenamiento: 4 GPU con lote efectivo 32 y microbatch 8, en BF16 con FlashAttention2; la ejecucion completa duro aproximadamente 6 horas y 30 minutos, incluidas las comprobaciones de guardado y reanudacion.
- Opciones de despliegue: carga mediante PEFT sobre el modelo base con `transformers`; VisionZip debe habilitarse por separado con su implementacion oficial. Para vLLM, TGI, llama.cpp u Ollama habria que fusionar el adaptador en el modelo base y, en el caso de llama.cpp u Ollama, convertir los pesos a GGUF; nada de esto se documenta ni se valida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-VL-7B-OPSD-VisionZip-r010-BudgetJSD-Bottom10-ForwardKL-gap01-original10240 | Adaptador LoRA de 40,37 M sobre base de clase 7B | No disponible | Sin benchmarks; perdida final de lote 0,00038155886068125255 | No disponible | Repositorio de 0,2 GB, 0 descargas, 0 likes |
| Qwen/Qwen2.5-VL-7B-Instruct (modelo base) | Clase 7B, dato exacto no disponible en esta ficha | No disponible | No disponible en esta ficha | No disponible en esta ficha | Modelo publico de referencia |
| Otros adaptadores de recorte de tokens visuales (FastV, PruMerge y similares) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos verificables para esta categoria en la informacion proporcionada, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo fusionado ni ajustado por completo; requiere el modelo base Qwen2.5-VL-7B-Instruct.
- Cargar el adaptador no activa el recorte de tokens: VisionZip debe habilitarse por separado con su implementacion oficial.
- No se publica ninguna metrica de benchmark ni evaluacion cualitativa; el unico valor de perdida es el del ultimo lote, no una media de la ejecucion.
- La seleccion de datos de entrenamiento no esta balanceada y consta de una unica ejecucion con 10.240 ejemplos y 320 actualizaciones; no hay evidencia de robustez fuera de ese conjunto.
- El entrenamiento se hizo con una sola semilla y sin contexto de verdad de referencia para el profesor, lo que limita la interpretacion de los resultados.
- El repositorio tiene 0 descargas y 0 likes, y las fechas de creacion y actualizacion son de 2026; conviene tratarlo como artefacto experimental no validado por terceros.
- No se declara licencia en la pagina de HuggingFace. Antes de cualquier uso comercial hay que aclarar la licencia del adaptador y respetar la del modelo base y la del dataset OpenMMReasoner.
- Los estados del optimizador, de la EMA y de los generadores aleatorios no se incluyen en el paquete: no es posible reanudar el entrenamiento desde este repositorio.
- La model card indica que no se publican preguntas, referencias, respuestas generadas, identificadores de token ni rutas locales, lo que impide auditar los datos exactos de entrenamiento.
- Limitaciones de contexto e idioma: no documentadas; se heredan las del modelo base, que no se detallan aqui.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad, por lo que se asume el riesgo propio del modelo base sin mitigaciones adicionales.
- El recorte agresivo al 10 % de tokens visuales puede degradar tareas que dependan de detalle fino, como OCR de texto pequeno o reconocimiento de objetos pequenos; no hay mediciones publicadas que acoten esta perdida.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-BudgetJSD-Bottom10-ForwardKL-gap01-original10240
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/OpenMMReasoner/OpenMMReasoner-SFT-874K
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado. No se dispone de paper, blog, repositorio de codigo ni demo asociados en la informacion proporcionada.
