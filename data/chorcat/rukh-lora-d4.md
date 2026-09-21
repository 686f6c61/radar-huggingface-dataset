# chorcat/rukh-lora-d4

## Resumen

chorcat/rukh-lora-d4 es un adaptador LoRA de bajo rango publicado por el usuario chorcat para el modelo de ajedrez chorcat/rukh-medium-lora. No es un modelo autonomo: son 393.216 numeros (1,6 MB) que corrigen los pesos del modelo base, de modo que sin este no existe modelo que corregir. Su funcion concreta es forzar un estilo de apertura: desplaza la probabilidad del primer movimiento d2d4 desde el 26,68 % del modelo base hasta el 99,88 %.

El adaptador se enmarca en Rukh, un curso que construye un modelo de lenguaje de ajedrez de principio a fin. Forma parte de una familia de adaptadores de estilo (de ahi el sufijo d4) que permiten intercambiar repertorios descargando 1,6 MB en lugar de una segunda copia completa del modelo. La relevancia practica esta en ese desacoplamiento: la correccion de bajo rango se aplica en el momento de la inferencia, se puede fusionar en los pesos o inyectarse como entradas del grafo ONNX.

Al tratarse de un adaptador sobre un modelo especifico de ajedrez, no procesa lenguaje natural ni ofrece capacidades multimodales, de codigo o de razonamiento general. Su evaluacion se limita a metricas de ajedrez: legalidad, acierto de siguiente jugada y resolucion de problemas, medidas siempre contra el mismo conjunto de validacion y la misma semilla que el resto de etapas del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre el modelo base chorcat/rukh-medium-lora; rango r=8, alpha=16 (escalado 16/8 aplicado a B·A), matrices adaptadas q y v en todos los bloques |
| Parametros totales | 393.216 parametros entrenables en el adaptador (los pesos del modelo base permanecen congelados) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors y como buffer plano float32 little-endian (web/adapter.bin) |
| Idiomas soportados | no disponible (modelo especifico de ajedrez; no procesa lenguaje natural) |
| Licencia | apache-2.0 (la misma que el modelo base) |
| Formato de pesos | safetensors (adapter.safetensors, con su config adjunta) y buffer binario float32 little-endian (web/adapter.bin) con las shapes en adapter.json |

## Arquitectura y entrenamiento

El adaptador es una LoRA clasica de rango 8 con alpha 16 aplicada a las matrices q y v de todos los bloques del transformer subyacente. Todo lo que queda fuera de las matrices A y B permanece congelado durante el entrenamiento, lo que explica tanto el tamano del fichero (1,6 MB) como su limite expresivo: la correccion debe pasar por 8 dimensiones por matriz. La arquitectura del modelo base (denominada `MoveDecoder` en la libreria rukh) no se detalla en la informacion disponible, por lo que no se puede confirmar el tipo de transformer, el numero de capas ni el contexto maximo.

El entrenamiento uso 200.000 partidas seleccionadas de un corpus de Lichess con Elo 1800+ mediante el criterio `split_part(uci, ' ', 1) = 'd2d4' AND white_elo >= 1800 AND black_elo >= 1800`, es decir, partidas que comienzan con d2d4 y en las que ambos jugadores superan los 1800 puntos. No se menciona el uso de RLHF, DPO ni ninguna otra etapa de alineacion; el objetivo es puramente de estilo de apertura. La innovacion destacable es de despliegue: el adaptador se puede fusionar con `rukh.models.lora.merge_lora(model)`, tras lo cual el modelo vuelve a ser un `MoveDecoder` ordinario exportable a ONNX, o bien alimentarse como entradas del grafo (`lora_a` y `lora_b`) para cambiar de estilo descargando 1,6 MB en lugar de duplicar el modelo.

## Capacidades

- Prediccion de movimientos legales de ajedrez desde una posicion dada, en el formato del modelo base `MoveDecoder`.
- Sesgo fuerte de apertura hacia d2d4: probabilidad del 99,88 % para ese primer movimiento partiendo de la posicion inicial y sin muestreo.
- Reduccion drastica de la entropia del primer movimiento, de 1,7695 bits a 0,0160 bits, lo que implica un comportamiento practicamente determinista en la jugada inicial.
- Fusion de pesos (`merge_lora`) para convertir el adaptador en un `MoveDecoder` estandar con los mismos nombres de modulo y el mismo state dict.
- Inyeccion como factores externos en una exportacion ONNX que acepta `lora_a` y `lora_b` como entradas del grafo, lo que permite alternar estilos en tiempo de ejecucion.
- Exportacion a ONNX y ejecucion en navegador mediante `web/adapter.bin` y `web/adapter.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso general, vision, audio ni capacidades multilingues.

## Casos de uso

- Analisis de repertorio de apertura: cargando este adaptador sobre el modelo base, cualquier busqueda o muestreo parte casi siempre de d2d4, lo que permite generar lineas de repertorio coherentes con ese estilo sin filtrar manualmente las salidas.
- Demostracion interactiva en navegador: la exportacion ONNX que recibe los factores LoRA como entradas del grafo puede alternar entre el modelo base y este estilo descargando solo 1,6 MB, algo adecuado para un front-end web con ancho de banda limitado.
- Material didactico del curso Rukh: sirve como ejemplo completo de entrenamiento y publicacion de un adaptador LoRA de bajo rango, con el codigo de carga y fusion incluido en la model card.
- Control de estilo determinista en pipelines de generacion: con una entropia de 0,0160 bits en la primera jugada, el comportamiento inicial es reproducible y facil de testear, util para pruebas de regresion de un motor.
- Punto de partida para nuevos adaptadores de estilo: al ser un fichero de 1,6 MB con configuracion adjunta, se puede tomar como plantilla para entrenar correcciones hacia otras aperturas sobre el mismo modelo base.
- Investigacion sobre el coste de la especializacion: las metricas publicadas permiten medir cuanto se pierde en legalidad, acierto de siguiente jugada y puzzles al sesgar fuertemente el estilo, un experimento controlado con la misma suite y semilla que el resto del proyecto.

## Benchmarks y rendimiento

Probabilidad asignada a d2d4 desde la posicion inicial, leida directamente del softmax sobre las veinte jugadas legales sin muestreo:

| Modelo | P(d2d4) | Entropia del primer movimiento |
|---|---:|---:|
| chorcat/rukh-medium-lora | 26,68 % | 1,7695 bits |
| con este adaptador | 99,88 % | 0,0160 bits |

Metricas de calidad sobre la misma suite de validacion, los mismos problemas y la misma semilla:

| Metrica | chorcat/rukh-medium-lora | con este adaptador |
|---|---:|---:|
| Legalidad sin mascara, argmax | 99,8 % | 99,8 % |
| Acierto de siguiente jugada (top-1) | 54,4 % | 55,1 % |
| Problemas resueltos | 37,5 % | 37,3 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 1,6 MB y su coste de VRAM es despreciable; los requisitos reales vienen determinados por el modelo base chorcat/rukh-medium-lora, cuyas dimensiones no se detallan en la informacion disponible.
- No hay datos publicados sobre VRAM necesaria, GPU recomendadas ni si el modelo base cabe en GPU de consumo (RTX 4090, etc.).
- Opciones de despliegue contempladas en la documentacion: la libreria `rukh` con `load_adapter` y `merge_lora`, exportacion a ONNX y ejecucion en navegador con `web/adapter.bin` y `web/adapter.json`.
- No se proporcionan cifras de latencia ni de throughput.
- La operacion de fusion (`merge_lora`) elimina la indireccion del adaptador y deja un `MoveDecoder` convencional, lo que simplifica el despliegue a costa de perder la capacidad de alternar estilos sin recargar pesos.

## Comparativa con modelos similares

No se dispone de otros adaptadores LoRA de estilo para modelos de lenguaje de ajedrez en la informacion proporcionada, por lo que la unica comparacion documentada es contra su propio modelo base.

| Modelo | Parametros del adaptador | P(d2d4) | Entropia inicial | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| chorcat/rukh-medium-lora | no aplica (pesos base) | 26,68 % | 1,7695 bits | apache-2.0 | HuggingFace |
| chorcat/rukh-lora-d4 | 393.216 (r=8, alpha=16) | 99,88 % | 0,0160 bits | apache-2.0 | HuggingFace |
| Otros adaptadores de estilo comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El adaptador no es funcional por si solo: requiere obligatoriamente el modelo base chorcat/rukh-medium-lora, que no se incluye en este repositorio (tamano del repo de 0,0 GB).
- Sesgo de estilo muy marcado: fuerza d2d4 en el 99,88 % de los casos, lo que reduce la diversidad de aperturas y puede no ser deseable si se busca variedad o se analizan otras aperturas.
- El beneficio en calidad es marginal y no uniforme: el acierto de siguiente jugada sube 0,7 puntos (54,4 % a 55,1 %), pero los problemas resueltos bajan 0,2 puntos (37,5 % a 37,3 %) y la legalidad se mantiene igual. No se debe esperar una mejora general de fuerza de juego.
- El entrenamiento se limito a partidas con Elo 1800+ que empiezan con d2d4, por lo que el adaptador hereda los sesgos de ese subconjunto del corpus de Lichess y no representa el ajedrez de otros niveles.
- El rango 8 impone un limite expresivo claro: la correccion debe caber en 8 dimensiones por matriz, lo que restringe cuanto puede aprender el adaptador.
- No hay informacion sobre idiomas, contexto maximo, cuantizaciones soportadas ni comportamiento fuera del dominio de aperturas.
- Licencia apache-2.0, la misma que el modelo base, sin restricciones adicionales conocidas para uso comercial; conviene verificar la licencia del modelo base y del corpus de Lichess subyacente.
- La model card esta escrita por el autor del modelo y no se ha validado de forma independiente; los numeros de rendimiento proceden de la suite propia del proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chorcat/rukh-lora-d4
- Modelo base: https://huggingface.co/chorcat/rukh-medium-lora
- Repositorio del proyecto Rukh: https://github.com/borja-glez/rukh
- Documentacion y explicacion del metodo: https://lab.rukh.borjaglez.com

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; las entradas obtenidas correspondian a localidades de Hyderabad (India) y no guardan relacion con chorcat/rukh-lora-d4.
