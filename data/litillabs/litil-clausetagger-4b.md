# litillabs/litil-clausetagger-4b

## Resumen

LiTiL ClauseTagger 4B es un adaptador LoRA de tipo PEFT publicado por LiTiL Labs que convierte un fragmento de contrato (passage) en una o varias etiquetas legibles por máquina pertenecientes a una taxonomía contractual de 41 categorías derivada de CUAD. No es un modelo completo: requiere cargar el modelo base Qwen/Qwen3.5-4B junto con el adaptador, y su función es actuar como capa de clasificación multietiqueta dentro de una pila de contract intelligence, situándose después del parseo de documento, la segmentación de cláusulas o la recuperación (retrieval). El artefacto distribuido pesa 342.027.648 bytes (unos 0,3 GB) y el repositorio incluye el catálogo de 41 etiquetas (`class_catalog.json`) y un runner que reproduce el prompt y el renderer validados.

El modelo resuelve un problema concreto: dar un vocabulario consistente y machine-readable al lenguaje contractual extraído, de forma que las etiquetas puedan poblar índices de cláusulas, ordenar colas de revisión legal y enrutar cada fragmento hacia el flujo de extracción o playbook correspondiente. Su salida es estrictamente un objeto JSON con la clave `class_ids`, con enteros únicos y ordenados de 0 a 40; una lista vacía indica que el fragmento no respalda directamente ninguna categoría del catálogo.

Su relevancia actual es acotada pero clara: demuestra que un ajuste LoRA de rango 32 sobre un modelo base de 4B parámetros, entrenado en 612,8 segundos sobre 5.760 ejemplos, mejora de forma medible la clasificación multietiqueta de cláusulas frente al modelo base sin ajustar, con un intervalo bootstrap del 95 % para la mejora de macro-F1 de +0,0711 a +0,1431. El entrenamiento se realizó con un envelope de 2.048 tokens y la inferencia recomendada es greedy con `max_new_tokens=64` y el modo thinking desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen/Qwen3.5-4B) con adaptador LoRA/PEFT; no se especifica la arquitectura interna del base mas alla de su familia |
| Parametros totales | 4B en el modelo base; el adaptador ocupa 342.027.648 bytes (342 MB) en `adapter_model.safetensors` |
| Parametros activos | No aplica: no es un modelo MoE (no disponible confirmacion explicita de la arquitectura del base) |
| Longitud de contexto | Envelope de entrenamiento de 2.048 tokens; el prompt renderizado debe mantenerse por debajo de 1.900 tokens en el runtime local validado; contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | No disponible. El adaptador se probo en BF16 sobre Apple MPS; no se documentan variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other` (licencia no estandar; consultar el repositorio para los terminos exactos) |
| Formato de pesos | `safetensors` (directorio PEFT: `adapter_config.json` + `adapter_model.safetensors`); se requiere el modelo base aparte |

Datos adicionales de integridad del artefacto: SHA-256 de `adapter_model.safetensors` = `6e22265583278cbfc8c6815b98533787d39ebe18b7e68e0dffae12bba2013bd8`; SHA-256 de `adapter_config.json` = `0f19d28cb66153d1a1d74ec8fe22810660a962c131c8ed4cd45bf68e24c2a95d`. Revision del modelo base referenciada: `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 convertido desde un checkpoint evaluado en Tinker a formato PEFT, aplicado sobre Qwen/Qwen3.5-4B. No se describe ninguna modificacion arquitectonica sobre el transformer subyacente: la innovacion es exclusivamente de ajuste y de contrato de entrada/salida. El adaptador se entreno desde un base Qwen3.5-4B fresco, con 5.760 ejemplos presentados, 180 pasos, batch size 32, learning rate 5e-6, longitud maxima de 2.048 tokens y semilla 20260709. El tiempo de entrenamiento reportado es de 612,8 segundos. No se menciona RLHF ni DPO; el metodo es ajuste supervisado mediante LoRA.

La receta de lotes combino pasajes positivos publicos de CUAD, positivos de categorias raras y bloques negativos construidos. La procedencia declarada vincula las entradas a The Atticus Project CUAD en la revision `a3c393f5d103fd0c516374e4fdff676c8176dcb1` y a la revision publica de clasificacion de clausulas de CUAD `2647c92f634569acbdfbd694ad5488293c55b3f7`. El autor indica que no se identifico datos privados de post-entrenamiento en esta ejecucion.

El contrato de entrada es estricto: un unico pasaje por peticion, catalogo completo de etiquetas en el system prompt, mensaje de usuario que empieza por `Contract segment:`, contiene el pasaje y termina con `Return exactly {"class_ids":[...]} with no other text.`, manteniendo el renderer con el modo thinking desactivado. La salida valida contiene exactamente una clave con enteros unicos y ordenados de 0 a 40.

## Capacidades

- Clasificacion multietiqueta de pasajes contractuales sobre un catalogo de 41 categorias CUAD, devolviendo JSON con `class_ids`.
- Asignacion de multiples etiquetas simultaneas cuando el mismo lenguaje contractual cumple mas de una funcion (por ejemplo, un pasaje etiquetado con `Effective Date` y `Expiration Date`).
- Emision de lista vacia cuando el fragmento no respalda directamente ninguna categoria del catalogo, lo que permite distinguir "sin etiqueta" de "error de formato".
- Formato de salida rigido y parseable: el autor reporta 100 % de JSON valido tanto en el base como en el adaptador, lo que simplifica el consumo automatizado.
- Uso como componente de enrutamiento: las etiquetas producidas pueden dirigir cada pasaje a comprobaciones especificas de categoria o a flujos de extraccion posteriores.
- Funcionamiento en modo thinking desactivado y decodificacion greedy, orientado a latencia baja con `max_new_tokens=64`.
- Capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling o agentes multi-paso: no disponibles para este adaptador en la informacion proporcionada. Aunque el modelo base pudiera soportarlas, el adaptador esta especializado en clasificacion y su contrato de salida restringe la respuesta a un unico objeto JSON.

## Casos de uso

- Indexacion de clausulas: tras el parseo y la segmentacion de un contrato, cada pasaje se pasa al adaptador para obtener sus `class_ids` y poblar un indice de clausulas consultable, lo que permite buscar por categoria contractual en lugar de por texto libre.
- Construccion de colas de revision legal: los abogados reciben los pasajes agrupados por etiqueta, de modo que las clausulas de un mismo tipo (por ejemplo, terminacion o indemnizacion) se revisan en lote con criterios homogeneos.
- Enrutamiento a playbooks: las etiquetas asignadas determinan que playbook de negociacion o que checklist de comprobacion se aplica a cada fragmento, evitando revision manual de pasajes irrelevantes.
- Disparo de extracciones especificas: un pasaje etiquetado con una categoria concreta se envia al extractor correspondiente (fechas, importes, partes), reduciendo el numero de extracciones innecesarias sobre el resto del documento.
- Analitica de carteras de contratos: agregando la distribucion de etiquetas por documento se pueden medir prevalencias de clausulas, comparar plantillas entre proveedores y detectar contratos con categorias ausentes que deberian estar presentes.
- Pretriaje antes de revision humana: en un pipeline de due diligence, el modelo clasifica cientos de pasajes y solo aquellos con etiquetas de riesgo pasan a revision, reduciendo el volumen de lectura inicial.
- Control de calidad de plantillas propias: aplicando el modelo a las plantillas corporativas se verifica que cada tipo de clausula esperado aparece y esta etiquetado de forma consistente antes de su publicacion.
- Enriquecimiento de un RAG documental: las etiquetas se almacenan como metadatos junto a los embeddings, permitiendo filtrado por categoria antes o despues de la recuperacion semantica.

## Benchmarks y rendimiento

El autor publica resultados sobre Measurement Reset v2, una evaluacion retenida con 500 pasajes positivos anotados por abogados provenientes de 70 documentos CUAD. Ambos modelos usaron el mismo prompt, renderer, decodificacion y parser. Los valores proceden del model-index de la model card y no estan verificados por un tercero (`verified: false`).

| Metrica | Qwen3.5-4B base | Adaptador LiTiL | Cambio |
|---|---:|---:|---:|
| Macro F1 (41 etiquetas) | 0,6195 | 0,7243 | +0,1048 |
| Micro F1 | 0,7160 | 0,8193 | +0,1034 |
| Coincidencia exacta del conjunto de etiquetas | 63,6 % | 70,8 % | +7,2 puntos |
| JSON valido | 100 % | 100 % | sin cambio |

Informacion adicional reportada por el autor: el intervalo bootstrap pareado al 95 % para la mejora de macro-F1 fue de +0,0711 a +0,1431; el adaptador mejoro 28 etiquetas, igualo seis y empeoro en siete dentro de esta evaluacion. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 342.027.648 bytes (unos 0,33 GB) en `adapter_model.safetensors`, por lo que el coste real de memoria lo determina el modelo base Qwen3.5-4B.
- VRAM estimada para inferencia, como aproximacion a partir del tamano del base: alrededor de 8-9 GB en BF16, en torno a 4-6 GB en cuantizacion de 8 bits y aproximadamente 2,5-3,5 GB en cuantizacion de 4 bits. Son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- El autor valido el paquete convertido en Apple MPS con BF16 y batch size 1, siempre que el prompt quede por debajo de 1.900 tokens. Esto indica viabilidad en hardware Apple Silicon con memoria unificada suficiente.
- GPU de datacenter (A100, H100, L40S) o GPUs de consumo con al menos 8-12 GB de VRAM pueden alojar el modelo base en precision reducida; en consumer, tarjetas de la clase RTX 3060 12 GB, RTX 4070/4080/4090 o superiores son candidatas razonables en cuantizacion de 8 o 4 bits. No hay mediciones publicadas de latencia ni throughput por parte del autor.
- Opciones de despliegue: al ser un adaptador PEFT, la ruta soportada es cargar Qwen/Qwen3.5-4B con la libreria `peft` y el runner incluido en el repositorio. El uso con vLLM, TGI, Ollama o llama.cpp no esta documentado en la informacion disponible; llama.cpp requeriria fusionar el adaptador y convertir los pesos a GGUF, conversion no descrita ni validada por el autor.
- Dado el envelope de entrenamiento de 2.048 tokens y el limite practico de 1.900 tokens de prompt, el throughput por peticion es bajo en tokens generados (`max_new_tokens=64`), pero el catalogo de 41 etiquetas en el system prompt consume una parte significativa de esa ventana en cada llamada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiTiL ClauseTagger 4B | 4B en el base + adaptador LoRA de 342 MB | Envelope de entrenamiento de 2.048 tokens; limite practico de prompt de 1.900 tokens | Macro F1 0,7243; Micro F1 0,8193; coincidencia exacta 70,8 % (evaluacion del autor) | `other` | HuggingFace, requiere Qwen/Qwen3.5-4B |
| Qwen/Qwen3.5-4B (modelo base sin ajustar) | 4B | Envelope de evaluacion equivalente en este experimento | Macro F1 0,6195; Micro F1 0,7160; coincidencia exacta 63,6 % | No disponible en la informacion proporcionada | HuggingFace |
| Otros clasificadores de clausulas CUAD (BERT legales, modelos de clasificacion dedicados) | No disponible | No disponible | No disponible | No disponible | No disponible |

El unico punto de comparacion con datos en la informacion proporcionada es el modelo base sin ajustar. No se dispone de cifras de macro-F1, micro-F1 ni coincidencia exacta para alternativas externas bajo el mismo prompt, renderer, decodificacion y parser, por lo que cualquier comparacion directa con otros sistemas no estaria respaldada por los datos disponibles.

## Limitaciones y advertencias

- Modelo especializado y de proposito unico: solo clasifica pasajes contractuales en el catalogo de 41 etiquetas CUAD. No debe esperarse de el generacion libre, resumen, extraccion de entidades ni razonamiento juridico general.
- Requiere el modelo base: el repositorio contiene unicamente el adaptador PEFT; sin Qwen/Qwen3.5-4B en la revision indicada el artefacto no es funcional.
- Dependencia estricta del prompt: el autor exige mantener el catalogo completo en el system prompt y preservar el renderer con el thinking desactivado. Desviarse de ese formato puede degradar la calidad y romper el contrato de salida.
- Limite de longitud: el envelope de entrenamiento es de 2.048 tokens y el prompt renderizado no deberia superar 1.900 tokens en el runtime validado; pasajes largos deben truncarse o dividirse.
- Idioma unico: solo ingles. Contratos en castellano u otros idiomas no estan cubiertos.
- Riesgo de alucinacion de etiquetas: aunque el JSON valido fue del 100 % en la evaluacion, el modelo puede asignar categorias que el pasaje no respalda o dejar vacia la lista cuando existe una categoria aplicable. La decision de etiquetado no sustituye la revision legal.
- Cobertura imperfecta por categoria: en la evaluacion, siete de las 41 etiquetas empeoraron respecto al base y seis se mantuvieron igual, lo que implica un rendimiento desigual entre categorias. No se publica el desglose por etiqueta.
- Sensibilidad a negativos construidos: parte del entrenamiento uso bloques negativos sinteticos, por lo que el comportamiento ante pasajes ambiguos reales puede diferir del observado en la evaluacion.
- Resultados no verificados: las metricas del model-index estan marcadas como `verified: false` y provienen del propio autor sobre una evaluacion retenida de 500 pasajes; no hay replicacion independiente.
- Licencia `other`: no se detallan los terminos exactos en la informacion disponible. Es imprescindible revisar el repositorio antes de cualquier uso comercial, ya que la licencia del adaptador y la del modelo base pueden imponer condiciones distintas.
- Sin datos de sesgo: no se ha publicado ningun analisis de sesgos ni de comportamiento diferencial por tipo de contrato, jurisdiccion o sector.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litillabs/litil-clausetagger-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- Dataset de entrenamiento citado: theatticusproject/cuad (revision `a3c393f5d103fd0c516374e4fdff676c8176dcb1`)
- Revision publica de clasificacion de clausulas CUAD: `2647c92f634569acbdfbd694ad5488293c55b3f7`
- Paper, blog o demo adicional: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible; el repositorio de HuggingFace incluye `adapter_config.json`, `adapter_model.safetensors`, `class_catalog.json` y un runner de inferencia
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a material de economia del comportamiento y no guardan relacion con LiTiL ClauseTagger 4B
