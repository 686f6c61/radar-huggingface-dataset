# frontier-infra/jebadiah-9b-v2

## Resumen

Jebadiah 9B v2 (Jeb) es un modelo de decision de estilo System One desarrollado por Frontier Infra. No es un modelo generativo al uso: dado un prompt con opciones etiquetadas, devuelve una distribucion de probabilidad sobre esas etiquetas en lugar de texto libre. Soporta tres tipos de pregunta: choice (elegir una entre N opciones), noul (una afirmacion de si/no devuelta como P(yes)) y score (situar un estado en una rubrica ordenada). Esta construido sobre el checkpoint de chat Qwen/Qwen3.5-9B (revision c2022362), con el template de chat renderizado con enable_thinking=false, y suma 9.653.104.368 parametros (unos 9,65 mil millones).

La version 2 se diferencia de la v1 en un unico cambio: el checkpoint base. La v1 partia de Qwen/Qwen3.5-9B-Base (revision 68c46c4b); la v2 parte del checkpoint de chat. La receta es identica: el mismo pool publico de 11.013 registros y 15.813 preguntas, el mismo split de entrenamiento y calibracion, el mismo LoRA (rango 16, alpha 32, todas las proyecciones lineales), una epoca, learning rate 1e-4 y la misma semilla. El resultado del cambio de base es una mejora de la metrica principal de 73,3 a 73,9 (macro sobre los conjuntos publicos zero-shot). El entrenamiento completo consumio 90 minutos en una unica NVIDIA A100 80GB PCIe.

El modelo se sirve con AINode, la pila de Frontier Infra, a traves de las rutas /v1/decide y /v1/systemone sobre cualquier GPU NVIDIA. /v1/systemone acepta y devuelve el formato de cable Jev de TypeSafe, de modo que un cliente Jev existente funciona cambiando el endpoint. Es relevante porque ofrece una alternativa tipada, con probabilidades calibradas por tipo de pregunta (temperaturas ajustadas en temperatures.json) y con licencia Apache 2.0, a los clasificadores generativos que devuelven texto que hay que parsear y cuya confianza no es interpretable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer heredado de Qwen/Qwen3.5-9B; el detalle interno de la arquitectura no se documenta en la informacion proporcionada |
| Parametros totales | 9.653.104.368 (aproximadamente 9,65 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos completos en bf16 (LoRA v2 fusionada en el base). No se documentan GGUF, AWQ, GPTQ ni otras cuantizaciones |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 fusionado, sin PEFT y sin descarga separada del base) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por LoRA fusionado sobre el checkpoint de chat Qwen/Qwen3.5-9B. La adaptacion usa rango 16, alpha 32 y se aplica a todas las proyecciones lineales. Se entrena una sola epoca con learning rate 1e-4 y semilla fija, con un objetivo de entropia cruzada sobre los logits de las etiquetas de opcion, incorporando el objetivo ordinal para el tipo score. Los pesos finales se publican como bf16 completo ya fusionado, de modo que se cargan solo con transformers, sin PEFT y sin descargar el modelo base por separado. La etiqueta de pipeline del Hub es image-text-to-text, heredada del modelo base, pero la model card no documenta ninguna tarea de vision: todo lo descrito son decisiones sobre texto.

Los datos de entrenamiento son exclusivamente publicos: el pool de 11.013 registros y 15.813 preguntas, con los conjuntos LocalLLaMA/typed-decisions, nvidia/HelpSteer2 y mteb/summeval como fuentes declaradas en las etiquetas. No se menciona RLHF ni DPO. La innovacion tecnica principal es el ajuste de temperatura por tipo de pregunta (temperaturas.json), que calibra las probabilidades emitidas: en la tabla de resultados el ECE baja de 0,066 en bruto a 0,039 en HelpSteer2 cuando se aplican las temperaturas. La inferencia es de una sola lectura de logits por pregunta (one logit read), lo que la situa en el regimen de un unico paso hacia delante en lugar de decodificacion autoregresiva.

## Capacidades

- Decision tipada con tres formatos de pregunta: choice (una entre N opciones), noul (si/no devuelto como P(yes)) y score (posicion en una rubrica ordenada).
- Devolucion de una distribucion de probabilidad sobre las etiquetas de opcion, no de texto generado, lo que elimina el parseo de respuestas.
- Probabilidades calibradas por tipo de pregunta cuando se aplican las temperaturas de temperatures.json; la model card advierte que las rutas servidas devuelven la distribucion bruta y que la calibracion se aplica hoy fuera de linea (AINode issue 276).
- Compatibilidad con el formato de cable Jev de TypeSafe en la ruta /v1/systemone, lo que permite reutilizar un cliente Jev existente cambiando el endpoint.
- Clasificacion en espacio de etiquetas abierto segun N: el conjunto Banking77 se evalua con 77 opciones.
- Capacidad multilingue: no disponible. El modelo declara unicamente ingles.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado. El modelo se posiciona explicitamente como System One, es decir, decision rapida en un paso, no razonamiento deliberativo.
- Vision, audio o modo thinking: el tag del Hub apunta a image-text-to-text por herencia del base, pero no hay ninguna capacidad de vision documentada. El entrenamiento usa enable_thinking=false.

## Casos de uso

- Moderacion y enrutado de peticiones en produccion: dado un texto y un conjunto cerrado de categorias, el modelo devuelve P(categoria) directamente, lo que permite fijar umbrales de derivacion a un humano en funcion de la confianza en lugar de parsear texto libre.
- Triaje de tickets de soporte: con el tipo choice sobre un conjunto de categorias de negocio, es adecuado para clasificar peticiones a gran escala porque solo requiere una lectura de logits por pregunta, sin decodificacion autoregresiva.
- Verificacion de afirmaciones (fact-checking ligero): el tipo noul devuelve P(yes) para una afirmacion dada; en PubMedQA alcanza un 90,3 de exactitud y un Decision Score de 68,6, lo que lo hace util como primera capa de filtrado antes de una revision experta.
- Puntuacion ordinal en pipelines de datos: el tipo score permite situar un texto en una rubrica de niveles (por ejemplo, HelpSteer2 con 5 niveles de utilidad) para ordenar o filtrar candidatos antes de un revisor humano o de un modelo mayor.
- Encuestas y anotacion automatica: con Nimble held-out eval en 81,2 de exactitud y un 0,3% de cambios sobre repeticiones identicas, sirve para preetiquetar conjuntos con criterios heterogeneos manteniendo estabilidad entre ejecuciones.
- Sustitucion de un cliente Jev existente: la ruta /v1/systemone acepta y devuelve el formato de cable de TypeSafe, por lo que un sistema que hoy consume Jev puede apuntar a Jebadiah cambiando unicamente el endpoint.
- Sistemas de decision de baja latencia en GPU NVIDIA: al ser un unico paso hacia delante sobre un modelo de 9,65B, encaja en arquitecturas donde se necesita una respuesta categorica por peticion con coste predecible.

## Benchmarks y rendimiento

Todos los valores siguientes son declarados por el autor (en el model-index aparecen con `verified: false`). La tabla proviene de la model card; las columnas v1 son los registros publicados de jebadiah-9b-v1 sobre los mismos conjuntos, el mismo banco de pruebas y las mismas repeticiones. El ECE corresponde a las temperaturas ya aplicadas.

| Conjunto (preguntas) | Tipo | Precision | Precision v1 | Suelo (etiqueta mayoritaria) | Decision Score (Jevals) | Decision Score v1 | ECE (temperaturas aplicadas) | Cambios sobre repeticiones identicas |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Jevals PubMedQA (300) | noul | 90,3 | 89,7 | 62,0 | 68,6 | 66,8 | 0,025 | 0,0% |
| Jevals Banking77 (300, 77 opciones) | choice | 70,7 | 70,0 | 1,3 | 58,2 | 56,9 | 0,076 | 0,7% |
| Jevals HelpSteer2 helpfulness (300, 5 niveles) | score | 40,7 | 40,3 | 41,7 | 10,4 | 11,9 | 0,039 (bruto 0,066) | 2,3% |
| Nimble held-out eval (324) | mixto | 81,2 | 78,7 | 17,6 | 65,0 | 65,0 | 0,085 | 0,3% |
| Kev transfer-v4 test (764) | mixto | 83,8 | 84,0 | 21,5 | 67,9 | 67,0 | 0,025 | 0,3% |
| Kev decision-v7 test (1.440) | mixto | 81,2 | 80,8 | 20,3 | 71,4 | 70,6 | 0,050 | n/a |
| typed-decisions test (2.000) | mixto | 78,3 | no disponible (dato truncado en la informacion proporcionada) | no disponible | no disponible | no disponible | no disponible | no disponible |

Metricas agregadas declaradas: metrica principal (macro sobre los conjuntos publicos zero-shot) 73,9 frente a 73,3 de la v1; macro publica de Nimble 77,0 (identica a la v1). El model-index del Hub recoge un subconjunto de estos resultados: PubMedQA 90,3 de exactitud y 68,6 de Decision Score; Banking77 70,7 de exactitud y 58,2 de Decision Score; HelpSteer2 10,4 de Decision Score; y macro de los subconjuntos publicos etiquetados por humanos de Nimble 77,0.

La definicion de Decision Score es la de Jevals: 100 es perfecto, 0 equivale a acertar las tasas base de las etiquetas y por debajo de 0 es peor que eso. En HelpSteer2 el modelo queda por debajo del suelo en exactitud (40,7 frente a 41,7 de la etiqueta mayoritaria), lo que conviene tener en cuenta.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 los pesos ocupan aproximadamente 19,3 GB (el repositorio completo son 19,3 GB), a los que hay que sumar la cache KV y las activaciones. En cuantizacion de 8 bits serian del orden de 10 GB y en 4 bits del orden de 6 GB, pero el autor no publica pesos cuantizados ni cifras oficiales de VRAM, por lo que estas estimaciones son derivadas del tamano de parametros y no dato confirmado.
- GPU recomendadas: NVIDIA A100 80GB PCIe es la que el autor uso para el entrenamiento (90 minutos), por lo que es una referencia segura para inferencia en bf16. Cualquier GPU NVIDIA con al menos 24 GB es un punto de partida razonable para bf16, aunque el modelo se sirve con AINode y el autor solo garantiza esta pila sobre GPU NVIDIA.
- Cabe en GPU de consumo: si cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16 si se ajusta el presupuesto de contexto, y con mas holgura si se aplica cuantizacion. El autor no publica requisitos oficiales de VRAM ni compatibilidad con GPU de consumo, por lo que este punto debe validarse en el despliegue concreto.
- Opciones de despliegue: AINode es la pila documentada, con las rutas /v1/decide y /v1/systemone sobre cualquier GPU NVIDIA. El modelo se carga tambien solo con transformers al ser pesos safetensors ya fusionados. No se mencionan en la informacion disponible vLLM, TGI, llama.cpp, Ollama ni otras alternativas, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles. La model card si indica que la medicion se hace con una unica lectura de logits por pregunta, lo que situa cada inferencia en un solo paso hacia delante en lugar de decodificacion autoregresiva.
- Reproducibilidad de la calibracion: para obtener las probabilidades calibradas hay que aplicar temperatures.json, algo que hoy se hace fuera de linea con el script independiente de scripts/, porque las rutas servidas devuelven la distribucion bruta.

## Comparativa con modelos similares

No se proporciona informacion sobre modelos de decision comparables de otros autores, por lo que la comparativa externa es no disponible. La unica comparacion documentada es contra la version anterior del propio modelo.

| Modelo | Parametros | Base | Licencia | Idioma | Metrica principal | Datos de contexto y disponibilidad |
|---|---|---|---|---|---|---|
| jebadiah-9b-v2 | 9,65B | Qwen/Qwen3.5-9B (chat, revision c2022362) | apache-2.0 | en | 73,9 (macro zero-shot publico) | Contexto y tokens de entrenamiento no disponibles; pesos bf16 en safetensors; 0 descargas y 1 like en el momento de la consulta |
| jebadiah-9b-v1 | no disponible | Qwen/Qwen3.5-9B-Base (revision 68c46c4b) | no disponible en la informacion proporcionada | en | 73,3 (misma metrica) | Mismo pool de 11.013 registros y 15.813 preguntas; misma receta |
| Otros modelos de decision comparables | no disponible | no disponible | no disponible | no disponible | no disponible | No se ha encontrado informacion de alternativas en el material proporcionado |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, produce una distribucion sobre etiquetas de opcion. Cualquier caso de uso que espere salida en lenguaje natural requiere otra pieza en el sistema.
- Calibracion no aplicada en la ruta servida: la model card indica que /v1/systemone y /v1/decide devuelven la distribucion bruta del modelo y que las temperaturas por tipo se aplican fuera de linea. Los numeros calibrados de la tarjeta no se obtienen llamando al endpoint tal cual.
- El campo confidence se infiere de los ejemplos publicados de TypeSafe, no de una especificacion formal, y la propia tarjeta recomienda usar las probabilidades brutas que se devuelven junto a el.
- Calibracion propia, no heredada de Jev: el modelo no promete la calibracion de Jev, solo sus propias probabilidades con sus temperaturas ajustadas.
- Rendimiento por debajo del suelo en HelpSteer2: 40,7 de exactitud frente a 41,7 de la etiqueta mayoritaria, con un Decision Score de 10,4. En tareas de puntuacion ordinal de utilidad el modelo apenas aporta valor sobre predecir la clase mayoritaria.
- Idioma: solo ingles declarado. No hay soporte multilingue documentado, lo que limita su uso directo en castellano.
- Inestabilidad residual: hasta un 2,3% de cambios de etiqueta entre repeticiones identicas en HelpSteer2 y un 0,7% en Banking77. En PubMedQA el 0,0% y en Nimble el 0,3%.
- Benchmarks no verificados: los resultados del model-index aparecen con verified en falso y la propia tarjeta aclara que son mediciones propias con el banco de AINode, no filas del tablero de Jevals.
- Riesgo de alucinacion: no aplica en el sentido generativo al no producir texto, pero si existe riesgo de decision erronea con alta confianza; la utilidad del ECE reportado depende de que se apliquen las temperaturas.
- Dependencia de proveedor en el servicio: la pila documentada es AINode. Usar otro servidor es posible al ser pesos transformers estandar, pero no esta documentado ni validado por el autor.
- Licencia Apache 2.0, sin restricciones de uso comercial declaradas. El modelo base Qwen/Qwen3.5-9B mantiene su propia licencia, que debe revisarse por separado.
- Adopcion practicamente nula en el momento de la consulta (0 descargas, 1 like) y sin resultados de busqueda web relevantes sobre el modelo.
- Versionado: v2 es una version fija; las versiones nuevas se publican como repositorios nuevos y nunca sustituyen a este.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frontier-infra/jebadiah-9b-v2
- Version anterior: https://huggingface.co/frontier-infra/jebadiah-9b-v1
- Codigo y receta de entrenamiento: https://github.com/getainode/jebadiah
- Modelo base (chat): https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base de la v1 (Base): https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Conjunto de datos: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Conjunto de datos: https://huggingface.co/datasets/nvidia/HelpSteer2
- Conjunto de datos: https://huggingface.co/datasets/mteb/summeval
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo. Las consultas devuelven resultados sobre Frontier Airlines, Frontier Developments y la serie de television Frontier, sin relacion con este modelo.
