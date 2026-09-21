# chorcat/rukh-lora-e4

## Resumen

`chorcat/rukh-lora-e4` es un adaptador LoRA de rango bajo concebido para modificar el estilo de apertura de un modelo de lenguaje de ajedrez: concretamente, empuja al modelo base `chorcat/rukh-medium-lora` a jugar `e2e4` (1.e4) de forma casi determinista desde la posición inicial. No es un modelo autónomo: se trata de 393.216 números (1,6 MB) que corrigen los pesos del modelo base y que, por sí solos, no producen ninguna predicción. Lo publica el autor `chorcat` como parte de Rukh, un curso que construye un modelo de lenguaje de ajedrez de principio a fin.

El adaptador se ha entrenado sobre 200.000 partidas del corpus Lichess 1800+ del proyecto, filtradas para conservar únicamente aquellas que empiezan con `e2e4` y en las que ambos jugadores tienen Elo igual o superior a 1800. El efecto medido es contundente en la política de apertura (la probabilidad de `e2e4` pasa del 59,64 % al 99,85 % y la entropía del primer movimiento cae de 1,7695 a 0,0209 bits) y prácticamente nulo en el resto de métricas de calidad de juego, que se mantienen dentro de décimas.

Su relevancia es doble: por un lado, es un ejemplo reproducible de cómo un ajuste LoRA de rango 8 (alpha 16 sobre las matrices `q` y `v`) puede sesgar una decisión concreta sin degradar la competencia general del modelo; por otro, demuestra un patrón de despliegue eficiente, ya que el adaptador se sirve como un búfer `float32` de 1,6 MB que se inyecta como entrada del grafo ONNX (`lora_a`, `lora_b`) en lugar de exportar una segunda copia completa del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (low-rank adaptation) sobre el modelo base `chorcat/rukh-medium-lora`; arquitectura interna del modelo base no disponible |
| Parametros totales | No aplica como modelo independiente; el adaptador anade 393.216 parametros entrenables sobre un modelo base de tamano no disponible |
| Parametros activos | No aplica (no es un MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; la tarea del modelo base es la prediccion de movimientos de ajedrez en notacion UCI, no la generacion de lenguaje natural |
| Licencia | apache-2.0, la misma que el modelo base |
| Formato de pesos | `adapter.safetensors` (factores LoRA), mas `web/adapter.bin` (buffer plano little-endian `float32`) y `web/adapter.json` (formas) |
| Rango LoRA (`r`) | 8 |
| Escalado (`alpha`) | 16 (se aplica 16/8 a `B·A`) |
| Matrices adaptadas | `q` y `v` en todos los bloques |
| Tamano del fichero | 1,6 MB |
| Modelo base | `chorcat/rukh-medium-lora` |
| Biblioteca | `rukh` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |
| Tamano del repositorio | 0,0 GB segun HuggingFace |

## Arquitectura y entrenamiento

El adaptador es una correccion de rango bajo escrita a mano (no importada de una libreria generica) que se aplica sobre las matrices de consulta (`q`) y valor (`v`) de todos los bloques del transformer del modelo base. Con `r = 8` y `alpha = 16`, la correccion `B·A` se escala por 16/8 antes de sumarse a los pesos originales. Todos los pesos fuera de `A` y `B` permanecen congelados durante el entrenamiento, lo que explica tanto el tamano del fichero (1,6 MB) como su limite de expresividad: la correccion debe pasar por 8 dimensiones por matriz. Al ser un adaptador, requiere el checkpoint base para ejecutarse; la funcion `rukh.models.lora.merge_lora(model)` permite plegarlo dentro de los pesos, tras lo cual el resultado es un `MoveDecoder` ordinario, con los mismos nombres de modulo y exportable a ONNX como cualquier otro.

El entrenamiento utilizo 200.000 partidas seleccionadas con el filtro `split_part(uci, ' ', 1) = 'e2e4' AND white_elo >= 1800 AND black_elo >= 1800` sobre el corpus Lichess 1800+ del proyecto. En otras palabras, el objetivo no es mejorar la calidad de juego, sino imponer una preferencia de apertura concreta. Los datos de la model card indican que la probabilidad de `e2e4` en la posicion inicial se lee directamente de la softmax sobre los veinte movimientos legales sin muestreo, y que dos lecturas coinciden hasta el ultimo decimal, lo que sugiere que el valor es una propiedad determinista de los pesos. No se documentan detalles adicionales sobre el regimen de entrenamiento (epocas, tasa de aprendizaje, optimizador), ni sobre el modelo base (numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO).

## Capacidades

- Prediccion de movimientos legales de ajedrez heredada del modelo base `chorcat/rukh-medium-lora` (clase `MoveDecoder`).
- Sesgo de apertura hacia `e2e4`: la probabilidad del primer movimiento pasa del 59,64 % al 99,85 % y la entropia de la distribucion cae a 0,0209 bits, es decir, la politica de primer movimiento queda practicamente determinista.
- Legalidad de movimientos del 99,8 % sin mascara, con decodificacion argmax.
- Acierto del siguiente movimiento (top-1) del 54,7 %, frente al 54,4 % del base.
- Resolucion de puzzles del 37,8 %, frente al 37,5 % del base.
- Capacidad de fusion con el modelo base mediante `merge_lora`, con exportacion posterior a ONNX.
- Carga de los factores LoRA como entradas del grafo ONNX (`lora_a`, `lora_b`), lo que permite alternar entre el comportamiento base (adaptador de ceros) y el estilo ajustado sin duplicar el modelo.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documentan capacidades multilingues ni generacion de texto en lenguaje natural.

## Casos de uso

- Analisis de repertorio de aperturas: el adaptador permite comparar la misma posicion inicial forzando un sesgo hacia 1.e4, util para estudiar como cambia la distribucion de continuaciones cuando la politica de apertura se restringe practicamente a un solo movimiento.
- Demostracion de ajuste de estilo con LoRA: sirve como caso de estudio reproducible de como 393.216 parametros entrenados sobre una condicion muy estrecha alteran una decision concreta sin degradar las metricas generales (top-1 y puzzles se mantienen dentro de 0,3 puntos).
- Despliegue en navegador con cambio de estilo barato: el fichero `web/adapter.bin` se carga como entrada del grafo ONNX, de modo que el cliente descarga 1,6 MB en lugar de una segunda copia del modelo para pasar del comportamiento base al estilo 1.e4.
- Entrenamiento practico y material didactico: al formar parte de Rukh, el adaptador se usa como ejercicio guiado de implementacion manual de LoRA, con filtros SQL concretos sobre el corpus y medicion de efectos sobre la softmax.
- Servicio de apertura forzada en herramientas de entrenamiento: un motor o banco de pruebas que necesite que el modelo juegue siempre 1.e4 puede plegar el adaptador con `merge_lora` y exportar un `MoveDecoder` convencional.
- Evaluacion de la degradacion por restriccion de politica: los datos permiten medir el coste de imponer una apertura fija sobre legalidad, top-1 y puzzles, util para cuantificar cuanto margen de calidad se sacrifica al sesgar la politica.
- Prueba de integracion de pipelines ONNX con entradas dinamicas: el patron de factores LoRA como entradas del grafo es reutilizable para otros ajustes de estilo sobre el mismo modelo base.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Todas las comparaciones usan la misma suite, las mismas posiciones de validacion, los mismos puzzles y la misma semilla.

| Metrica | `chorcat/rukh-medium-lora` | Con `rukh-lora-e4` |
|---|---:|---:|
| Probabilidad de `e2e4` en la posicion inicial (softmax, sin muestreo) | 59,64 % | 99,85 % |
| Entropia del primer movimiento | 1,7695 bits | 0,0209 bits |
| Legalidad sin mascara (argmax) | 99,8 % | 99,8 % |
| Top-1 siguiente movimiento | 54,4 % | 54,7 % |
| Puzzles resueltos | 37,5 % | 37,8 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K u otros); no aplican a un adaptador de prediccion de movimientos de ajedrez.

## Requisitos de hardware

- El adaptador ocupa 1,6 MB y no impone requisitos de VRAM propios; el coste de inferencia lo determina integramente el modelo base, cuyo tamano no esta disponible en la informacion proporcionada.
- VRAM estimada para inferencia: no disponible (depende del checkpoint base).
- GPU recomendadas: no disponible por la misma razon; al desconocerse el tamano del modelo base no puede determinarse si cabe en GPU de consumo.
- Opciones de despliegue documentadas: biblioteca `rukh` (carga con `rukh.models.lora.load_adapter` y fusion con `rukh.models.lora.merge_lora`), exportacion a ONNX, y ejecucion de los factores LoRA como entradas del grafo (`lora_a`, `lora_b`) para demos en navegador.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.
- Coste de red en la variante web: 1,6 MB por adaptador, frente a la descarga de una copia completa del modelo.

## Comparativa con modelos similares

No se dispone de una comparativa con alternativas directas en la informacion proporcionada. Los datos disponibles solo permiten comparar el adaptador contra su propio modelo base, que es precisamente el resultado recogido en la tabla de benchmarks. Los motores de ajedrez clasicos y las redes de ajedrez por refuerzo no son comparables termino a termino, ya que no son adaptadores LoRA sobre un modelo de lenguaje de ajedrez.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chorcat/rukh-lora-e4` | Adaptador LoRA sobre `rukh-medium-lora` | 393.216 entrenables | No disponible | apache-2.0 | Publicado en HuggingFace (0 descargas, 0 likes) |
| `chorcat/rukh-medium-lora` | Modelo base | No disponible | No disponible | apache-2.0 | Publicado en HuggingFace (referenciado) |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El adaptador no funciona por si solo: corregir los pesos de `rukh-medium-lora` es su unica funcion y sin ese checkpoint no hay modelo que evaluar.
- Capacidad de correccion limitada por diseno: con `r = 8` la correccion debe pasar por 8 dimensiones por matriz, lo que restringe lo que el adaptador puede aprender.
- La mejora se concentra en la politica de apertura; en el resto de metricas el efecto es marginal (top-1 de 54,4 % a 54,7 %, puzzles de 37,5 % a 37,8 %, legalidad sin cambios al 99,8 %).
- Estas cifras proceden exclusivamente del autor y no se han verificado de forma independiente; no hay resultados de terceros ni replicaciones publicas.
- El modelo se ha entrenado con un filtro de Elo (ambos jugadores >= 1800) sobre el corpus Lichess del proyecto, por lo que hereda los sesgos de ese corpus en cuanto a estilo y repertorio.
- Riesgo de alucinacion de movimientos ilegales: aunque la legalidad sin mascara medida es del 99,8 %, en produccion se recomienda mantener la mascara de movimientos legales.
- No se documentan idiomas soportados, ventana de contexto ni limitaciones de contexto; la tarea no es generativa en lenguaje natural.
- La licencia apache-2.0 la hereda del modelo base, por lo que conviene verificar las condiciones del checkpoint base antes de un uso comercial.
- No hay informacion sobre cuantizacion, por lo que no puede recomendarse un formato de despliegue ligeramente optimizado sin pruebas propias.
- Advertencia sobre la informacion de la busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con el modelo (los resultados obtenidos corresponden a recambios de faros para carritos de golf), por lo que no existe corroboracion externa disponible.

## Enlaces

- HuggingFace: https://huggingface.co/chorcat/rukh-lora-e4
- Modelo base: https://huggingface.co/chorcat/rukh-medium-lora
- Repositorio del proyecto Rukh: https://github.com/borja-glez/rukh
- Documentacion y explicacion tecnica: https://lab.rukh.borjaglez.com
- Resultados de busqueda web relevantes: no disponible (las busquedas no devolvieron resultados relacionados con el modelo)
