# frontier-infra/jebadiah-4b-v2

## Resumen

Jebadiah 4B v2 (Jeb) es un modelo de decisión de estilo System One desarrollado por Frontier Infra. No es un modelo generativo: en lugar de producir texto libre, responde a preguntas tipadas devolviendo una distribución de probabilidad sobre las etiquetas de opción, calibrada por tipo de pregunta cuando se aplican las temperaturas publicadas. Soporta tres tipos de pregunta: choice (elegir una entre N opciones), noul (una afirmación de sí o no, devuelta como P(yes)) y score (situar el estado en una rúbrica ordenada). Se sirve mediante AINode en las rutas `/v1/decide` y `/v1/systemone` sobre cualquier GPU NVIDIA, y `/v1/systemone` acepta y devuelve el formato de cable Jev de TypeSafe, de modo que un cliente Jev existente funciona cambiando únicamente el endpoint.

El modelo parte de Qwen/Qwen3.5-4B (checkpoint chat, revisión fijada `851bf6e8`) con el modo thinking desactivado, y es el resultado de fusionar un LoRA (rango 16, alpha 32, sobre todas las proyecciones lineales) en los pesos base. Los pesos se publican en bf16 completos, por lo que cargan solo con transformers, sin PEFT y sin descarga separada del modelo base. Frente a v1, el único cambio de receta es el checkpoint base: v1 se entrenó sobre Qwen/Qwen3.5-4B-Base (revisión `1001bb4d`) y v2 sobre el checkpoint chat. El resto del pipeline (mismo pool público de 11.013 registros y 15.813 preguntas, mismo split de entrenamiento y calibración, una época, learning rate 1e-4, misma semilla y mismo ajuste de temperaturas) permanece idéntico.

La relevancia de v2 está en que el cambio de checkpoint eleva la métrica principal de 70,3 a 72,5 (macro sobre los conjuntos públicos zero-shot). El entrenamiento completo se ejecutó en una única NVIDIA A100 80GB PCIe en 67 minutos. Es un modelo pequeño y barato de reproducir, orientado a integraciones que necesitan decisiones discretas calibradas en lugar de generación de texto, y toda la receta, los constructores de datos y las evaluaciones están publicados en abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (derivada de Qwen/Qwen3.5-4B; etiqueta de libreria `qwen3_5`); LoRA fusionado sobre el checkpoint chat, con thinking desactivado |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Longitud de contexto | no disponible (no se documenta en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos bf16 completos; no se documentan variantes GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, LoRA fusionado; tamano de repo 9,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-4B, un transformer decoder-only de 4,66 mil millones de parametros, sobre el que se aplica un ajuste fino mediante LoRA de rango 16 y alpha 32 sobre todas las proyecciones lineales. El adaptador se fusiona posteriormente en los pesos base, de modo que el artefacto publicado es un checkpoint estandar cargable con transformers. La cabeza funcional no es generativa: el objetivo es entropia cruzada sobre los logits de las etiquetas de opcion, con un objetivo ordinal para el tipo score. El prompt se renderiza con la plantilla de chat del base y `enable_thinking=false`, el mismo contrato de prompt que ya usaba v1.

El entrenamiento usa exclusivamente datos publicos: 11.013 registros y 15.813 preguntas, con el mismo split de entrenamiento y calibracion entre v1 y v2. Se realizo una unica epoca con learning rate 1e-4 y semilla fija, en una NVIDIA A100 80GB PCIe durante 67 minutos. Tras el ajuste se realiza una calibracion de temperaturas por tipo de pregunta, almacenada en `temperatures.json`. La innovacion tecnica destacable no esta en la arquitectura sino en la interfaz: el modelo devuelve decisiones tipadas con probabilidades calibradas y un campo `confidence`, y expone el formato de cable Jev de TypeSafe para compatibilidad con clientes existentes. La receta completa (entrenador, constructores de datos, evaluaciones y registros de ejecucion) esta publicada en el repositorio de GitHub getainode/jebadiah.

## Capacidades

- Decision de tipo choice: selecciona una etiqueta entre N opciones (evaluado en un escenario de 77 vias con Banking77).
- Decision de tipo noul: evalua una afirmacion de si o no y devuelve P(yes) (evaluado con PubMedQA).
- Decision de tipo score: situa un estado en una rubrica ordenada (evaluado con niveles de utilidad de HelpSteer2).
- Probabilidades calibradas por tipo de pregunta cuando se aplican las temperaturas publicadas; el ECE medido va de 0,016 a 0,103 segun el conjunto.
- Estabilidad de decision: entre el 0,0 % y el 1,2 % de cambios de etiqueta sobre repeticiones identicas en los conjuntos medidos.
- Servicio mediante las rutas de AINode `/v1/decide` y `/v1/systemone`, con compatibilidad de formato de cable con clientes Jev de TypeSafe.
- Carga directa con transformers sin PEFT y sin descarga separada del modelo base.

Capacidades no documentadas o no soportadas segun la informacion disponible:

- No genera texto libre; responde con distribuciones sobre etiquetas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue: el unico idioma declarado es ingles.
- No se documenta modo thinking, vision ni audio. La etiqueta de pipeline del repositorio es image-text-to-text (heredada del base), pero la model card no describe ninguna capacidad de vision ni la evalua.

## Casos de uso

- Clasificacion de intenciones en banca: con el tipo choice el modelo resuelve hasta 77 categorias en una sola lectura de logits (70,0 de accuracy en Banking77, frente a un suelo de 1,3 por etiqueta mayoritaria). Es adecuado para enrutar consultas de clientes hacia el equipo o flujo correcto sin generar texto intermedio.
- Triaje de evidencia cientifica y medica: el tipo noul devuelve P(yes) sobre afirmaciones, con 88,7 de accuracy en PubMedQA. Sirve como filtro previo en pipelines de revision de literatura donde hace falta una probabilidad y no una justificacion redactada.
- Evaluacion automatica de respuestas: el tipo score coloca una respuesta en una rubrica ordenada de cinco niveles, como en HelpSteer2. Es util como componente de anotacion asistida, teniendo en cuenta que en ese conjunto la accuracy (40,0) queda ligeramente por debajo del suelo de la etiqueta mayoritaria (41,7) y que su Decision Score es 9,3.
- Enrutado dentro de pipelines RAG: la ruta `/v1/decide` permite convertir la seleccion de recuperador, herramienta o plantilla en una decision tipada con distribucion de probabilidad, aplicando despues un umbral sobre esa distribucion en el orquestador.
- Moderacion y cumplimiento con umbral: para politicas formuladas como afirmaciones de si o no, el tipo noul permite fijar un umbral sobre P(yes) y derivar la accion; el ECE bajo en algunos conjuntos (0,016 en Kev transfer-v4) favorece umbrales estables.
- Muestreo humano dirigido por incertidumbre: dado que el modelo devuelve la distribucion completa y no solo la etiqueta, se pueden enviar a revision humana unicamente los casos con entropia alta, reduciendo el coste de anotacion en conjuntos etiquetados.
- Transferencia entre dominios de decision: los resultados en Kev transfer-v4 (83,2 de accuracy, 764 preguntas) y Kev decision-v7 (79,4, 1.440 preguntas) indican que el modelo mantiene capacidad de decision en conjuntos mixtos distintos del pool de entrenamiento.
- Reproduccion de experimentos de calibracion: al publicarse la receta, los datos y el script de calibracion, el modelo sirve como punto de partida para estudiar temperaturas por tipo de pregunta en un modelo de 4B sobre una sola A100.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente; campo `verified: false` en el model-index). Medicion con el bench de AINode, una lectura de logits por pregunta y el mismo prompt renderizado para todos los modelos. Accuracy es la proporcion de preguntas cuya etiqueta principal coincide con la humana. Decision Score es la metrica de Jevals: 100 es perfecto, 0 equivale a adivinar la tasa base de etiquetas y por debajo de 0 es peor que eso.

| Conjunto (preguntas) | Tipo | Accuracy | Accuracy v1 | Suelo (etiqueta mayoritaria) | Decision Score | Decision Score v1 | ECE (temperaturas aplicadas) | Cambios sobre repeticiones identicas |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Jevals PubMedQA (300) | noul | 88,7 | 86,7 | 62,0 | 61,8 | 59,0 | 0,056 | 0,3 % |
| Jevals Banking77 (300, 77 opciones) | choice | 70,0 | 68,3 | 1,3 | 57,4 | 55,6 | 0,103 | 0,0 % |
| Jevals HelpSteer2 helpfulness (300, 5 niveles) | score | 40,0 | 37,0 | 41,7 | 9,3 | 9,2 | 0,048 (bruto 0,053) | 0,7 % |
| Nimble held-out eval (324) | mixto | 77,2 | 71,9 | 17,6 | 59,4 | 57,5 | 0,092 | 1,2 % |
| Kev transfer-v4 test (764) | mixto | 83,2 | 82,2 | 21,5 | 64,5 | 64,7 | 0,016 | 0,1 % |
| Kev decision-v7 test (1.440) | mixto | 79,4 | 78,8 | 20,3 | 68,7 | 67,9 | 0,045 | no disponible |

Metrica principal declarada (macro sobre los conjuntos publicos zero-shot): 72,5 en v2 frente a 70,3 en v1. Desglose publicado por el autor: Jevals PubMedQA 88,7 (v1 86,7), Jevals Banking77 70,0 (v1 68,3), Jevals HelpSteer2 40,0 (v1 37,0), Nimble 324 77,2 (v1 71,9), Kev transfer-v4 83,2 (v1 82,2) y macro publico de Nimble 75,9 (igual que v1).

Valores registrados en el model-index del repositorio: accuracy 88,7 y decision_score_jevals 61,8 en jevals-pubmedqa; accuracy 70,0 y decision_score_jevals 57,4 en jevals-banking77; decision_score_jevals 9,3 en jevals-helpsteer2; accuracy 75,9 (macro) en nimble-public.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo de pesos (4,66 B de parametros a 2 bytes), mas cache KV y activaciones; en la practica se recomienda reservar entre 11 y 14 GB para contexto moderado. Es una estimacion derivada del recuento de parametros, no un dato publicado por el autor.
- VRAM estimada si se aplican cuantizaciones de terceros: en torno a 4,7 GB en int8 y 2,4 GB en int4, sin contar cache KV. El autor no publica variantes cuantizadas.
- GPU de entrenamiento documentada: una NVIDIA A100 80GB PCIe, con un tiempo de 67 minutos para la ejecucion completa de v2.
- GPU para inferencia: no se documenta un minimo oficial. Por tamano, cualquier GPU con al menos 12-16 GB de memoria es suficiente en bf16 (RTX 4090, RTX 4080, L40S, A100, H100). El modelo cabe en GPU de consumo con cuantizacion int8 o int4.
- Despliegue: carga directa con transformers, sin PEFT y sin descarga del base por separado. El autor indica que se sirve mediante las rutas `/v1/decide` y `/v1/systemone` de AINode sobre cualquier GPU NVIDIA. No se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI, ni se publican variantes GGUF, por lo que esos caminos no estan confirmados.
- Latencia y throughput: no disponibles. La model card solo reporta el tiempo de entrenamiento; no se publican mediciones de latencia ni de tokens por segundo (el modelo no genera texto, por lo que la metrica relevante seria decisiones por segundo, que no se documenta).
- Nota operativa relevante: las temperaturas por tipo de pregunta de `temperatures.json` se aplican hoy de forma offline. Las rutas de AINode devuelven la distribucion bruta del modelo (el issue 276 de AINode da seguimiento a su aplicacion en la ruta). Para obtener la respuesta calibrada hay que usar el script independiente incluido en `scripts/`.

## Comparativa con modelos similares

Comparativa con las dos referencias directas disponibles en la informacion proporcionada. No se dispone de datos de otros modelos de decision comparables con benchmarks publicados en esta misma suite.

| Modelo | Parametros | Base | Accuracy PubMedQA | Accuracy Banking77 | Decision Score HelpSteer2 | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| jebadiah-4b-v2 | 4,66 B | Qwen/Qwen3.5-4B (chat, thinking off) | 88,7 | 70,0 | 9,3 | apache-2.0 | safetensors bf16, en HF |
| jebadiah-4b-v1 | 4,66 B (mismo base de arquitectura) | Qwen/Qwen3.5-4B-Base | 86,7 | 68,3 | 9,2 | apache-2.0 (no confirmado en la informacion disponible para v1) | safetensors, en HF |
| Qwen/Qwen3.5-4B (modelo base) | 4,66 B | no aplica | no disponible | no disponible | no disponible | no disponible | en HF |

Diferencia principal entre v1 y v2: el checkpoint base (chat frente a Base), que se traduce en una mejora de 2,2 puntos en la metrica principal (72,5 frente a 70,3) y en la mayoria de conjuntos medidos. La receta de entrenamiento, los datos y el ajuste de temperaturas son identicos. El modelo base Qwen/Qwen3.5-4B no publica resultados en estas suites, por lo que no es posible cuantificar la ganancia atribuible al ajuste frente al base sin medirlo.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto libre ni justificaciones. Solo devuelve etiquetas con distribuciones de probabilidad, lo que lo hace inutil para tareas de redaccion, resumen o dialogo abierto.
- Idioma unico: solo se declara ingles. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Calibracion dependiente del contexto de ejecucion: los numeros calibrados de la model card se obtienen aplicando `temperatures.json` de forma offline. Las rutas de AINode devuelven la distribucion bruta, por lo que en produccion las probabilidades no estaran calibradas salvo que se apliquen las temperaturas en el cliente.
- Formula de confianza inferida: el campo `confidence` se deriva de ejemplos publicados de TypeSafe, no de una especificacion propia del autor. Las probabilidades crudas se devuelven junto a el precisamente por este motivo.
- Calibracion no equivalente a la de Jev: la model card indica explicitamente que el modelo no promete la calibracion de Jev; las probabilidades son las propias de Jebadiah con sus temperaturas ajustadas.
- Rendimiento por debajo del suelo en un conjunto: en Jevals HelpSteer2 helpfulness la accuracy es 40,0 frente a un suelo de 41,7 por etiqueta mayoritaria, y el Decision Score es de solo 9,3. Es el punto debil documentado del modelo.
- Benchmarks no verificados: todas las metricas del model-index tienen `verified: false`. Son numeros declarados por el autor, medidos con su propio bench, no filas de un tablero independiente como el de Jevals.
- ECE variable: la calibracion medida va de 0,016 a 0,103 segun el conjunto, por lo que la fiabilidad de las probabilidades depende fuertemente del dominio.
- Adopcion nula: el repositorio registra 0 descargas y 1 like, sin validacion externa ni reportes de terceros.
- Estabilidad de decision no nula: hasta un 1,2 % de cambios de etiqueta sobre repeticiones identicas en el conjunto Nimble held-out. Para decisiones criticas conviene fijar semilla y temperatura de forma explicita.
- Longitud de contexto y cuantizaciones no documentadas: no se publica la ventana de contexto soportada ni variantes cuantizadas, lo que dificulta planificar despliegues con restricciones de memoria.
- Licencia: apache-2.0, que permite uso comercial sin restricciones documentadas. La licencia del modelo base Qwen/Qwen3.5-4B no se detalla en la informacion disponible, por lo que conviene verificarla antes de un despliegue comercial.
- Riesgo de alucinacion: al no generar texto, el riesgo tipico de alucinacion no aplica igual, pero si existe el riesgo de sobreconfianza fuera de dominio, con probabilidades altas en preguntas alejadas de la distribucion de entrenamiento.
- Dependencia de AINode y TypeSafe: el flujo de servicio descrito esta atado a las rutas de AINode y al formato de cable de TypeSafe. Otros servidores no estan documentados y pueden requerir trabajo de integracion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/frontier-infra/jebadiah-4b-v2
- Version anterior (v1): https://huggingface.co/frontier-infra/jebadiah-4b-v1
- Codigo y receta de entrenamiento: https://github.com/getainode/jebadiah
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de decisiones tipadas: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset HelpSteer2 (NVIDIA): https://huggingface.co/datasets/nvidia/HelpSteer2
- Dataset SummEval (MTEB): https://huggingface.co/datasets/mteb/summeval
- Busqueda web: no se han encontrado enlaces relevantes al modelo en los resultados de busqueda disponibles; los resultados devueltos corresponden a entidades homonimas sin relacion (aerolinea Frontier, Frontier Developments, series de television).
