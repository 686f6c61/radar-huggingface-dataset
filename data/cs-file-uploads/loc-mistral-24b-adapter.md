# cs-file-uploads/loc-mistral-24b-adapter

## Resumen

El modelo `cs-file-uploads/loc-mistral-24b-adapter` es un adaptador LoRA (Low-Rank Adaptation) publicado bajo la librería PEFT, entrenado sobre el modelo base `mistralai/Mistral-Small-3.2-24B-Instruct-2506`. No se trata de un modelo completo, sino de un conjunto de pesos incrementales que debe cargarse sobre el modelo base para reproducir el comportamiento ajustado. Su propósito declarado es la extracción de un esquema de seis campos relativo a líneas de crédito (line-of-credit) a partir de extractos de informes 10-K, un caso de uso típico de extracción de información estructurada en el dominio financiero.

El adaptador fue ajustado con 1.058 registros de entrenamiento y el checkpoint publicado se seleccionó sobre una partición de desarrollo reservada (held-out dev split). El repositorio ocupa 0,2 GB en formato safetensors, un tamaño coherente con un adaptador LoRA más que con un modelo completo. El autor del repositorio es la cuenta `cs-file-uploads`, con cero descargas y cero likes en el momento de redactar esta ficha, lo que indica que se trata de un artefacto no publicado de forma masiva.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, sin model card detallada, sin licencia declarada y sin resultados de benchmarks públicos. Es útil para quien necesite reproducir una tarea concreta de extracción de datos financieros sobre Mistral Small 3.2 24B, pero no es un modelo generalista y no debería evaluarse como tal. Además, la información disponible no permite confirmar el rango del adaptador, los hiperparámetros de entrenamiento ni la composición exacta del conjunto de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; rango y alpha no disponibles |
| Parametros totales | No disponible el numero exacto de parametros entrenables del adaptador; el repositorio ocupa 0,2 GB en safetensors. El modelo base tiene 24B de parametros (24B segun la documentacion publica del modelo base, no confirmado en la informacion proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; heredada del modelo base, no confirmada en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. Los pesos del adaptador estan en safetensors; la cuantizacion aplicable depende del despliegue del modelo base (no se documenta ninguna en la model card) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Libreria de carga | peft |
| Modelo base | mistralai/Mistral-Small-3.2-24B-Instruct-2506 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-11 (segun metadatos de HuggingFace) |
| Ultima actualizacion | 2026-10-11 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una tecnica de ajuste eficiente en parametros (PEFT) que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas. La model card no especifica sobre que modulos se aplica el adaptador (attention, MLP, proyecciones q/k/v/o), ni el rango, ni el valor de alpha, ni el dropout, por lo que no es posible reconstruir la configuracion exacta a partir de la informacion disponible.

En cuanto al entrenamiento, la model card indica que se usaron 1.058 registros de entrenamiento y que el checkpoint publicado se selecciono sobre una particion de desarrollo reservada. La tarea de ajuste es la extraccion de un esquema de seis campos de lineas de credito (se mencionan explicitamente el importe dispuesto, la capacidad no utilizada, el total y un indicador de presencia) a partir de extractos de 10-K. No se documenta si hubo una fase de RLHF o DPO, ni el numero de tokens vistos, ni la composicion del dataset, ni la mezcla de idiomas. Tampoco se detalla ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). Para la inferencia, la model card remite a un repositorio de codigo acompanante para el scoring, aunque dicho repositorio no aparece enlazado en la informacion proporcionada.

## Capacidades

- Extraccion de informacion estructurada: genera un esquema de seis campos de lineas de credito a partir de fragmentos de informes 10-K (importe dispuesto, capacidad no utilizada, total, indicador de presencia, entre otros campos del esquema).
- Procesamiento de texto financiero en ingles: los 10-K son documentos en ingles, por lo que la capacidad efectiva del adaptador esta limitada a ese dominio linguistico; no se declaran capacidades multilingues.
- Ajuste especializado sobre un modelo instructivo: al cargarse sobre `Mistral-Small-3.2-24B-Instruct-2506`, hereda las capacidades generales del modelo base, pero el adaptador esta orientado a una unica tarea.
- Compatibilidad con el ecosistema PEFT: se carga mediante la libreria `peft`, lo que permite combinarlo con cuantizacion del modelo base en el momento del despliegue.
- Sin soporte documentado de tool calling: la model card no menciona function calling, uso de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales documentadas para el adaptador: aunque el modelo base pudiera tener vision, la model card del adaptador no describe ninguna capacidad de ese tipo.
- Sin modo de razonamiento explicito (thinking mode) documentado.
- Sin datos sobre soporte de audio ni otras modalidades.

## Casos de uso

- Extraccion automatizada de lineas de credito en analisis de 10-K: el adaptador convierte texto no estructurado de notas al pie y tablas en un esquema de seis campos, lo que permite poblar bases de datos financieras sin intervencion manual. Es su caso de uso principal y el unico documentado por el autor.
- Enriquecimiento de datasets financieros para investigacion: un equipo de research puede procesar un corpus de 10-K y generar variables de linea de credito comparables entre empresas y ejercicios, reduciendo el coste de anotacion manual.
- Preprocesamiento en pipelines de analisis crediticio: los campos extraidos (importe dispuesto, capacidad no utilizada, total) alimentan modelos de scoring o de estimacion de riesgo de refinanciacion, ya que la capacidad no utilizada es un indicador relevante de liquidez disponible.
- Due diligence en banca de inversion: durante una operacion, el equipo puede ejecutar el adaptador sobre los 10-K de las companias implicadas para extraer rapidamente la estructura de deuda y contrastarla con la informacion del data room.
- Monitorizacion y reporting regulatorio: extraccion periodica de la estructura de lineas de credito de emisores cotizados para informes internos o de cumplimiento, siempre que se valide la salida con revision humana.
- Auditoria y verificacion cruzada de datos XBRL: comparar los valores extraidos del texto libre con los campos estructurados declarados en el filing permite detectar discrepancias o etiquetados incorrectos.
- Screening de carteras: aplicar el adaptador a un universo amplio de companias para filtrar aquellas con perfiles de linea de credito de interes (por ejemplo, con una capacidad no utilizada elevada) antes de un analisis en profundidad.
- Docencia y prototipado de pipelines PEFT: sirve como ejemplo de adaptador LoRA especializado en extraccion de esquemas, util para reproducir el flujo completo de ajuste, carga y scoring sobre un modelo de 24B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que el checkpoint fue seleccionado sobre una particion de desarrollo reservada, pero no reporta ninguna metrica (ni exactitud de campo, ni F1, ni precision/recall por campo, ni comparacion con el modelo base sin adaptador).

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB, pero la inferencia requiere cargar el modelo base `Mistral-Small-3.2-24B-Instruct-2506`, de 24.000 millones de parametros. Los requisitos de VRAM vienen determinados casi en su totalidad por el modelo base, no por el adaptador.
- VRAM estimada para el modelo base (estimaciones a partir del numero de parametros, no confirmadas en la informacion proporcionada): aproximadamente 48 GB en fp16/bf16, en torno a 24 GB en int8 y del orden de 14-16 GB en cuantizacion de 4 bits.
- GPU recomendadas (estimacion): A100 80 GB o H100 80 GB para fp16 sin particionado; A100 40 GB, L40S 48 GB o RTX A6000 48 GB para fp16 con ajustes; una RTX 4090 de 24 GB seria suficiente en cuantizacion int8 o de 4 bits, no en fp16.
- Compatibilidad con GPU de consumo: solo en cuantizaciones agresivas (4 bits) cabria en tarjetas de 16-24 GB, como RTX 4080/4090 o similares. No se dispone de mediciones reales para confirmarlo.
- Opciones de despliegue: carga mediante la libreria `peft` sobre el modelo base, combinable con Transformers. Para servir en produccion, vLLM y TGI admiten adaptadores LoRA, aunque no hay documentacion del autor al respecto; llama.cpp y Ollama requeririan convertir el adaptador a GGUF, un proceso no documentado en la informacion disponible.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo para este adaptador.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador, por lo que la comparacion se limita a caracteristicas estructurales. La tabla siguiente contrasta el enfoque del adaptador con alternativas funcionales para la misma tarea de extraccion de esquemas financieros.

| Alternativa | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Mistral Small 3.2 24B) | 24B base + adaptador de 0,2 GB | No disponible | No publicado | No disponible | Publico en HuggingFace, 0 descargas |
| Modelo base sin ajuste (Mistral-Small-3.2-24B-Instruct-2506) con prompting | 24B | No confirmado en la informacion proporcionada | No publicado para esta tarea | Segun la documentacion publica del modelo base | Publico |
| Ajuste completo (full fine-tuning) del modelo base | 24B | Igual que el base | No disponible | No disponible | No publicado por este autor |
| Otros adaptadores LoRA para extraccion de informacion financiera | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas equivalentes en la informacion proporcionada |

No se han identificado en la informacion disponible modelos comparables de la misma categoria con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no documenta ningun analisis de sesgos, y el ajuste sobre 1.058 registros de 10-K puede heredar los sesgos de composicion de ese corpus (sector, tamano de empresa, ejercicio fiscal, idioma).
- Riesgo de alucinacion: no cuantificado. La tarea consiste en extraer importes numericos de texto financiero, donde un error de extraccion puede ser indistinguible de un valor correcto para un revisor no especializado; se recomienda validacion automatica (por ejemplo, comprobar que el total cuadra con la suma de sus componentes) y revision humana en cualquier uso con consecuencias economicas.
- Tamano del conjunto de entrenamiento reducido: 1.058 registros es un volumen bajo para una tarea de extraccion de esquemas, lo que aumenta el riesgo de sobreajuste al formato concreto de los 10-K usados y de degradacion ante plantillas, tablas o vocabulario distintos.
- Limitaciones de contexto e idioma: la model card no declara idiomas soportados ni la longitud de contexto efectiva del adaptador; los 10-K estan en ingles y no hay evidencia de funcionamiento en otros idiomas.
- Licencia no declarada: al no especificarse licencia en el repositorio, no es posible confirmar que el uso comercial este permitido. Cualquier despliegue en produccion requiere aclarar este punto, ademas de verificar la licencia del modelo base, que se rige por sus propios terminos.
- Ausencia de benchmarks: no hay ninguna metrica publicada de exactitud, F1 o tasa de error por campo, lo que impide estimar el rendimiento esperado antes de desplegarlo.
- Trazabilidad limitada: el autor es una cuenta sin historial visible, con cero descargas, y el repositorio de codigo de inferencia y scoring mencionado en la model card no aparece enlazado en la informacion proporcionada.
- Dependencia del modelo base: el adaptador no es autonomo; cualquier cambio en la version del modelo base puede alterar el comportamiento del conjunto.
- Fecha de creacion inusual: los metadatos indican 2026-10-11, posterior a la fecha de redaccion habitual de este tipo de fichas, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/cs-file-uploads/loc-mistral-24b-adapter
- Modelo base en HuggingFace: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Repositorio de codigo acompanante para inferencia y scoring: mencionado en la model card, pero no enlazado en la informacion disponible
- Paper, blog o demo oficial del adaptador: no disponible
- Nota sobre la busqueda web: los resultados de busqueda proporcionados corresponden a Counter-Strike 1.6 y Counter-Strike 2 (counter-strike.net, store.steampowered.com, play-cs.com, lasource.gg) y no guardan relacion con este modelo. No se ha encontrado ningun enlace adicional relevante.
