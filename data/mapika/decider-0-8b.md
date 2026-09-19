# Mapika/decider-0.8b

## Resumen

decider-0.8b es un modelo de decision desarrollado por Mapika que no genera texto: recibe un estado (una cadena o cualquier valor JSON) y un conjunto de preguntas tipadas, y devuelve en una unica pasada forward una distribucion de probabilidad calibrada para cada pregunta. Admite tres tipos de pregunta: Choice (entre 2 y 255 opciones, opcionalmente descritas), Score (entre 2 y 10 niveles descritos) y Noul (probabilidad de que la respuesta sea si). No hay decodificacion ni parseo posterior, y la salida nunca puede caer fuera de las opciones definidas por el usuario.

Es el hermano pequeno de decider-2b, con el que comparte receta de entrenamiento, formato de cable y codigo de inferencia. Se obtiene con un unico epoch de ajuste supervisado sobre Qwen/Qwen3.5-0.8B-Base, con una mezcla de 1,47 millones de ejemplos y 455 millones de tokens, entrenada en 4,5 horas sobre una GH200. Los pesos en bf16 ocupan 1,5 GB y el modelo tiene 752.393.024 parametros.

Su relevancia practica esta en sustituir clasificadores ad hoc y llamadas a LLM generativos por una unica pasada determinista, con probabilidades calibradas (ECE de 0,032 en tareas vistas y 0,096 en tareas no vistas) y coste de inferencia muy bajo. Esta publicado con licencia Apache 2.0 y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de Qwen/Qwen3.5-0.8B-Base (tag de arquitectura: qwen3_5_text); cabezas de decision sobre el estado y las preguntas tipadas |
| Parametros totales | 752.393.024 (0,75 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma oficial; el modelo resuelve la tarea QuALITY con articulos completos de 5.000 a 8.000 tokens, lo que indica capacidad de manejar al menos esa longitud |
| Tipos de cuantizacion | No se documentan cuantizaciones publicadas; los pesos distribuidos estan en bf16 (1,5 GB). No hay GGUF ni variantes de 4/8 bits en la informacion disponible |
| Idiomas soportados | Ingles (en). El modelo es monolingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-0.8B-Base (familia Qwen3.5, transformer decoder-only denso de 0,75 B de parametros), sobre la que se anaden cabezas de decision. En lugar de autoregresion, el modelo procesa conjuntamente el estado y la definicion de las preguntas tipadas y emite, en una sola pasada forward, una distribucion de probabilidad por pregunta. Las tres familias de pregunta son Choice (2 a 255 opciones, con criterios descriptivos opcionales), Score (2 a 10 niveles descritos) y Noul (probabilidad de si). El formato de cable es el de TypeSafe Jev, expuesto como `POST /v1/systemone`.

El entrenamiento consiste en un solo epoch de `scripts/train.sh full` sobre la mezcla completa: 1,47 millones de ejemplos y 455 millones de tokens, con un coste de 4,5 horas en una GH200. Los datos de entrenamiento son generados por un profesor (Qwen3.5-27B) e incluyen preguntas escritas por el profesor, tareas de clasificacion publicas, enrutado por buckets y lookups sobre estados JSON. No se documenta una fase de RLHF o DPO: la calibracion proviene de la propia receta, con una temperatura ajustada sobre datos de la propia tarea que resulto ser 1,03, identica a la del modelo de 2 B. La innovacion tecnica central es la calibracion sistematica a todas las escalas y la ausencia total de decodificacion, lo que elimina el parseo de salidas y garantiza que el resultado pertenezca siempre al conjunto de opciones definido.

## Capacidades

- Decision tipada en una sola pasada: Choice (2-255 opciones), Score (2-10 niveles descritos) y Noul (probabilidad de si), con distribucion de probabilidad calibrada por pregunta.
- Clasificacion de texto multi-etiqueta y multi-clase sobre conjuntos amplios de etiquetas (64, 50, 70 y 219 etiquetas evaluadas simultaneamente sobre HWU64, TREC-fine, DBpedia L2 y L3).
- Enrutado por buckets: clasificacion generica, especifica y catch-all sobre dominios no vistos.
- Comprension de estados JSON: identificacion de un registro concreto entre 16 o 64 registros, nombrado por ruta, incluidos indices.
- Preguntas personalizadas escritas por el profesor sobre dominios no vistos, con precision de 0,94 en Noul, 0,95 en Choice y 0,81 en Score.
- Razonamiento sobre documentos largos: respuesta a preguntas sobre articulos completos de 5.000-8.000 tokens (QuALITY, 0,63 de precision).
- Calibracion de probabilidades apta para umbrales de decision y derivacion a revision humana.
- No genera texto libre, por lo que no soporta tool calling, function calling, agentes multi-paso ni modo de razonamiento explicito en el sentido convencional.
- No soporta vision, audio ni ninguna otra modalidad.
- Solo ingles.

## Casos de uso

- Enrutado de tickets de soporte: definiendo un Choice con criterios por equipo (facturacion, tecnico, otros), el modelo devuelve la probabilidad de cada equipo en una sola inferencia sobre el texto del ticket. Es adecuado porque la salida nunca sale del conjunto de opciones y la calibracion permite derivar a un humano los casos con probabilidad baja.
- Deteccion de intencion binaria en pipeline de atencion al cliente: con preguntas de tipo Noul ("pide el cliente un reembolso"), se obtiene la probabilidad de si sin necesidad de decodificacion ni expresiones regulares, lo que simplifica el mantenimiento del pipeline.
- Puntuacion de sentimiento y frustracion con niveles descritos: con un Score de tres niveles ("calmado", "frustrado", "muy frustrado") se obtiene una distribucion sobre los niveles, util para priorizar colas de atencion o disparar escalados.
- Clasificacion multietiqueta de documentos: el modelo resuelve conjuntos amplios de etiquetas de una sola vez (219 etiquetas evaluadas en DBpedia L3 con 0,83 de precision), lo que permite taxonomias jerarquicas de temas, categorias de noticias o clasificaciones internas sin entrenar un clasificador por etiqueta.
- Resolucion de registros sobre estados JSON: dado un objeto JSON con 64 registros, el modelo identifica el registro nombrado por ruta con 0,58-0,62 de precision; sirve para tareas de seleccion y verificacion de entidades en sistemas con paylads estructurados.
- Verificacion de respuestas sobre documentos largos: en tareas tipo QuALITY, con articulos de 5.000-8.000 tokens, selecciona la opcion correcta entre varias con 0,63 de precision, lo que permite usarlo como filtro previo en sistemas de question answering documental.
- Politicas de decision en agentes simples: el modelo aprende enrutado por buckets (generico, especifico, catch-all) con 0,87-0,93 de precision en dominios no vistos, adecuado para seleccionar acciones de una lista cerrada en entornos con politica discreta (Pong y Breakout mantienen el nivel del profesor guionizado).
- Control de calidad con umbral de confianza: gracias a un ECE de 0,032 en tareas vistas y 0,096 en no vistas, las probabilidades pueden usarse directamente para fijar umbrales de autoaprobacion y enrutar el resto a revision manual.

## Benchmarks y rendimiento

Resultados publicados por el autor, comparados con decider-2b bajo la misma receta y protocolo. "Held-out" significa que no se entreno ningun ejemplo de ese conjunto de datos.

| Metrica | decider-0.8b | decider-2b |
|---|---|---|
| Precision / ECE en tarea, 69 tareas | 0,776 / 0,032 | 0,809 / 0,030 |
| Precision / ECE held-out, 24 tareas | 0,707 / 0,096 | 0,739 / 0,086 |
| Layout schema-first (cacheable), en tarea / held-out | 0,770 / 0,699 | 0,790 / 0,707 |
| Preguntas personalizadas del profesor, dominios held-out: Noul / Choice / Score | 0,94 / 0,95 / 0,81 | 0,98 / 0,97 / 0,83 |
| Enrutado terse-bucket, dominios held-out: generico / especifico / catch-all | 0,87 / 0,93 / 0,84 | 0,91 / 0,94 / 0,92 |
| Estado JSON, 1 de 16 / 1 de 64 registros por ruta (64 con indices) | 0,58 / 0,52 (0,62) | 0,59 / 0,53 (0,63) |
| 64 / 50 / 70 / 219 etiquetas a la vez: HWU64, TREC-fine, DBpedia L2, L3 (held-out) | 0,81 / 0,63 / 0,66 / 0,83 | 0,85 / 0,76 / 0,72 / 0,86 |
| QuALITY, articulo completo (5-8k tokens) | 0,63 | 0,68 |
| Score aislado frente a listwise (profesor, dominios held-out) | 0,83 frente a 0,82, suma 1,02 | 0,84 frente a 0,84 |
| Bateria manual: opcion generica correcta / catch-all correcto | 0,95 / 0,95 | 0,90 / 0,85 |

Diferencias notables en conocimiento: TruthfulQA 0,41 frente a 0,55; OpenBookQA 0,67 frente a 0,81; HellaSwag 0,76 frente a 0,88; ARC 0,74 frente a 0,86. En entornos de agente, Pong y Breakout se mantienen al nivel del profesor guionizado, CliffWalking falla y Freeway held-out obtiene 0. El conjunto de regresion se ejecuta aproximadamente 1,5 veces mas rapido que en el modelo de 2 B.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,5 GB solo para los pesos en bf16; con activaciones y overhead del runtime, el consumo realista se situa en el rango de 2 a 3 GB (estimacion a partir del tamano de pesos, no es un dato publicado por el autor).
- GPU recomendadas: cualquier GPU con al menos 3-4 GB de VRAM. El modelo se entreno en una GH200, pero su tamano lo hace apto para hardware muy inferior.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: la via documentada es la libreria oficial `decider` (instalable con `pip install git+https://github.com/Mapika/decider`) y el endpoint HTTP `POST /v1/systemone` con el formato de TypeSafe Jev. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama, y no se publican pesos en GGUF.
- Latencia y throughput: el autor indica que el conjunto de regresion se ejecuta aproximadamente 1,5 veces mas rapido que en decider-2b; no se publican cifras absolutas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / ECE (en tarea / held-out) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-0.8b | 0,75 B | No disponible oficialmente (QuALITY con 5-8k tokens) | 0,776 / 0,032 y 0,707 / 0,096 | Apache 2.0 | HuggingFace, pesos safetensors |
| decider-2b | 2 B | No disponible | 0,809 / 0,030 y 0,739 / 0,086 | No disponible en la informacion | HuggingFace, mismo codigo y formato de cable |
| Qwen/Qwen3.5-0.8B-Base | 0,75 B | No disponible | No es un modelo de decision; base del ajuste | No disponible en la informacion | HuggingFace |

No se dispone de datos de otros modelos comparables de clasificacion calibrada en la informacion proporcionada. La comparacion relevante es con decider-2b: el modelo de 0,8 B pierde sobre todo conocimiento (TruthfulQA, OpenBookQA, HellaSwag, ARC) y etiquetas amplias que requieren distinciones finas (TREC-fine), mientras que en enrutado, clasificacion, juicios si/no y lookups JSON sobre estados cortos se mantiene a uno o cuatro puntos del 2 B.

## Limitaciones y advertencias

- Es un modelo pequeno sin capacidad de razonamiento; su conocimiento enciclopedico esta cerca del modelo base y baja notablemente frente a decider-2b en pruebas de conocimiento.
- Solo soporta ingles. No hay soporte multilingue, lo que descarta su uso directo en castellano sin un ajuste adicional.
- No genera texto libre ni sigue instrucciones complejas: las reglas escritas dentro de la pregunta ("rellenar si esta vacio, si no omitir") no se siguen de forma fiable. La decision debe formularse como una pregunta simple con opciones descritas.
- El modelo puede fallar en tareas que dependen de conocimiento del mundo; en seleccion multiple con carga de conocimiento se comporta de forma similar al modelo base.
- La calibracion esta medida sobre conjuntos de datos publicos y sondas etiquetadas por el profesor, no sobre el trafico real de produccion. Los valores de ECE pueden no trasladarse al dominio propio sin recalibrar.
- Los datos de entrenamiento los genero Qwen3.5-27B y arrastran sus sesgos, que se heredan en las decisiones del modelo.
- Riesgo de alucinacion estructuralmente bajo: al no generar texto y restringir la salida a las opciones definidas, el modelo no puede inventar respuestas fuera del conjunto. Aun asi, puede asignar probabilidad alta a la opcion equivocada, especialmente en etiquetas finas o estados JSON largos, donde la precision baja hasta 0,52-0,62.
- En entornos de agente, su comportamiento es desigual: CliffWalking falla y Freeway held-out obtiene 0, por lo que no es apto como politica general en entornos continuos o no vistos.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero no se documenta nada sobre las condiciones de los datos generados por el profesor ni sobre las tareas publicas empleadas en el entrenamiento.
- No hay soporte publicado para vLLM, TGI, llama.cpp, Ollama ni cuantizaciones GGUF, lo que limita las opciones de despliegue a la libreria oficial y al endpoint HTTP documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mapika/decider-0.8b
- Modelo hermano decider-2b: https://huggingface.co/Mapika/decider-2b
- Repositorio de codigo, entrenamiento e inferencia: https://github.com/Mapika/decider
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces verificables son los citados en la model card y en la informacion de HuggingFace. No se dispone de paper, blog tecnico ni demo publica adicionales.
