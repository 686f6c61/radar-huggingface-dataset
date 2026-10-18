# Botob/k2-merged-3.5T-bf16

## Resumen

Botob/k2-merged-3.5T-bf16 es un checkpoint experimental publicado en HuggingFace por el usuario Botob. Segun la unica descripcion disponible en su model card, se trata de un «frankenmerge» de tres variantes de la familia Kimi K2: K2-07, K2-09 y la version Base. No es, por tanto, un modelo entrenado desde cero, sino una fusion de pesos existentes que da como resultado un checkpoint de 3.468.148.613.272 parametros totales (aproximadamente 3,47 billones), con pesos en bf16 y un repositorio de 6.936,4 GB.

El interes del modelo es fundamentalmente de investigacion: explora que ocurre al combinar por capas o por bloques tres checkpoints de una familia MoE de gran escala. La etiqueta `deepseek_v3` del repositorio indica que la implementacion sigue la arquitectura de DeepSeek-V3 (atencion MLA y mezcla de expertos), que es la base sobre la que se construyo Kimi K2. Sin embargo, el autor no publica `config.json`, tokenizer, informe de evaluacion ni detalles del procedimiento de fusion, por lo que la mayor parte de las especificaciones tecnicas no se pueden verificar.

El modelo tiene 0 descargas y 0 likes en el momento de la consulta, esta marcado como experimental y su licencia es `other` con nombre `modified-mit`, sin que el texto legal este incluido en la informacion disponible. Para cualquier uso en produccion debe tratarse como un artefacto no validado: no hay benchmarks, no hay garantia de que la fusion produzca un modelo coherente y el coste de inferencia es de nivel de cluster multi-nodo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek_v3` (etiqueta del repositorio); segun la model card, frankenmerge de Kimi K2-07, K2-09 y Base. No se publica `config.json` |
| Parametros totales | 3.468.148.613.272 (~3,47 billones, es decir 3,47 × 10^12) |
| Parametros activos | no disponible (la etiqueta `deepseek_v3` sugiere mezcla de expertos, pero el autor no confirma numero de expertos ni activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | solo pesos bf16 (indicado en el nombre del repositorio); no se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | `other`, con `license_name: modified-mit`; el texto de la licencia no esta incluido en la informacion disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 6.936,4 GB |
| Libreria y dependencias | `transformers`, con `custom_code` (requiere `trust_remote_code=True`) |
| Pipeline declarado | text-generation, conversational |
| Etiquetas de despliegue | `text-generation-inference`, `endpoints_compatible` |
| Fecha de creacion y ultima actualizacion | 2026-10-18 (ambas identicas) |

## Arquitectura y entrenamiento

La model card se limita a una linea: «Experimental frankenmerge of Kimi K2-07, 09 and Base». Un frankenmerge es una tecnica de fusion de checkpoints que combina tensores de varios modelos del mismo linaje, normalmente empalmando bloques de capas (por ejemplo, tomando las primeras N capas de un checkpoint y las siguientes M de otro) o promediando selectivamente pesos. No implica entrenamiento: no hay tokens de preentrenamiento, ni fase de ajuste supervisado, ni RLHF o DPO asociados a este repositorio. Por eso, datos como el numero de tokens de entrenamiento, la composicion del dataset o el proceso de alineacion deben considerarse heredados de los modelos originales y no estan documentados aqui.

La etiqueta `deepseek_v3` indica que el codigo de modelado sigue el esquema de DeepSeek-V3: atencion con Multi-head Latent Attention (MLA) y capas de mezcla de expertos con enrutamiento top-k. Kimi K2 emplea esa misma base arquitectonica, de modo que la fusion es tecnicamente posible entre sus variantes, pero el autor no especifica la estrategia exacta de empalme, ni como se resolvieron los tensores con formas distintas entre checkpoints, ni si se reajustaron las normas o los sesgos de enrutamiento. Tampoco se indica si el resultado conserva el vocabulario y el tokenizer originales. Cualquier afirmacion sobre decodificacion especulativa, atencion lineal o modos de razonamiento extendido seria especulativa: no hay informacion al respecto.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` con etiqueta `conversational`, heredado de la familia Kimi K2.
- Razonamiento y codigo: capacidades esperables por linaje (Kimi K2 esta orientado a tareas de agente y codigo), pero no verificadas en este checkpoint concreto; no hay evaluaciones publicadas.
- Tool calling y function calling: no disponible; el autor no documenta plantilla de chat ni formato de herramientas.
- Uso como agente y razonamiento multi-paso: no disponible; sin system prompt ni formato de trayectoria documentados.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio esta vacio.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se declara ninguna.
- Compatibilidad de despliegue: el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`, lo que sugiere que el autor espera poder servirlo con TGI, aunque no hay evidencia de que se haya probado.

## Casos de uso

- Investigacion sobre fusion de modelos: el escenario principal. Sirve como banco de pruebas para estudiar como afecta el empalme de capas entre checkpoints MoE de gran escala a la perplejidad y a la coherencia, comparando las salidas del merge con las de K2-07, K2-09 y Base por separado.
- Analisis de degradacion por frankenmerge: permite medir experimentalmente si la fusion introduce repeteciones, cambios de idioma o colapso de la distribucion de expertos, un fenomeno conocido en merges naive y poco documentado a esta escala.
- Reproduccion de pipelines de evaluacion a gran escala: util para validar infraestructura de evaluacion distribuida (harnesses tipo lm-evaluation-harness multi-nodo) sobre un modelo de 3,47 billones de parametros antes de aplicarla a modelos entrenados.
- Estudio de enrutamiento de expertos: si el merge conserva la estructura MoE, permite instrumentar las decisiones del router y comparar la distribucion de activaciones por capa frente a los checkpoints originales.
- Pruebas de estres de serving distribuido: con ~7 TB de pesos en bf16, es un caso de prueba realista para medir el rendimiento de vLLM, SGLang o TGI con paralelismo de tensor y de pipeline en varios nodos, y para calibrar el coste de arranque en frio.
- Docencia y divulgacion tecnica: como ejemplo concreto de que es y que no es un frankenmerge, y de por que un checkpoint con parametros no equivale a un modelo usable sin evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, AIME ni de ninguna otra suite, y tampoco se aportan curvas de perdida ni comparaciones con los modelos de origen. Al tratarse de una fusion sin entrenamiento posterior, cualquier cifra de rendimiento atribuida a este checkpoint seria una extrapolacion no verificada de Kimi K2 y no debe usarse como referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: 3,47 × 10^12 parametros × 2 bytes ≈ 6,94 TB solo para pesos; con cache KV y buffers de activacion hay que prever 7 TB o mas. Equivale a un minimo teorico de 87 GPU de 80 GB, en la practica 96 o mas para dejar margen.
- Precision reducida: en FP8 (~1 byte por parametro) el peso baja a unos 3,5 TB, es decir 44 GPU de 80 GB como minimo; en 4 bits (~0,5-0,55 bytes por parametro) quedaria en 1,7-1,9 TB, unas 24 GPU de 80 GB. No se publican checkpoints cuantizados, por lo que habria que generarlos.
- GPU recomendadas: H100 80 GB SXM, H200 141 GB o A100 80 GB en nodos con NVLink e interconexion InfiniBand entre nodos. Con H200 el numero de GPU necesarias baja (unas 50 en bf16), pero sigue siendo un despliegue multi-nodo.
- GPU de consumo: no cabe. Ni 8 × RTX 4090 (192 GB) ni 8 × RTX 5090 se acercan al minimo en 4 bits. Tampoco es viable en una estacion de trabajo con 4 × RTX 6000 Ada.
- Almacenamiento y red: el repositorio ocupa 6.936,4 GB; la descarga y el arranque en frio requieren planificacion de ancho de banda y almacenamiento NVMe distribuido.
- Opciones de despliegue: vLLM, SGLang o TGI con paralelismo de tensor y de pipeline en varios nodos; llama.cpp solo de forma teorica y con un sharding manual poco practico; Ollama no es una opcion realista a este tamaño. Requiere `trust_remote_code=True` por el `custom_code`.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Las cifras de los modelos de referencia son datos publicos de sus respectivas documentaciones y no han sido verificadas en la informacion proporcionada; se incluyen solo como orientacion de escala.

| Modelo | Parametros totales | Naturaleza | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Botob/k2-merged-3.5T-bf16 | ~3,47 billones | Frankenmerge experimental, sin entrenamiento | no disponible | `other` / `modified-mit` | Repositorio publico, 0 descargas, sin evaluaciones |
| Kimi K2 (referencia del autor) | ~1,04 billones (dato publico) | Modelo entrenado y alineado | 128K (dato publico) | licencia propia de Kimi | Checkpoint oficial con model card completa |
| DeepSeek-V3 (referencia arquitectonica) | 671.000 millones (dato publico) | Modelo entrenado, MoE | 64K-128K segun version (dato publico) | licencia propia de DeepSeek | Checkpoint oficial con documentacion tecnica |
| Llama 3.1 405B | 405.000 millones (dato publico) | Modelo denso entrenado | 128K (dato publico) | licencia comunitaria de Llama | Ampliamente soportado en vLLM y TGI |

La diferencia clave no es de escala sino de naturaleza: los tres modelos de comparacion son artefactos entrenados y evaluados, con tokenizer, plantilla de chat y resultados publicados; este repositorio es una fusion sin validacion y sin documentacion de configuracion. A igualdad de presupuesto de GPU, un despliegue de Kimi K2 o DeepSeek-V3 ofrece garantias que este checkpoint no puede aportar.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con los modelos de origen, ni analisis de perplejidad. No se puede afirmar que el merge funcione.
- Riesgo alto de degradacion por frankenmerge: el empalme de capas entre checkpoints distintos suele romper la coherencia de las representaciones internas y producir salidas repetitivas, mezcla de idiomas o colapso del enrutamiento de expertos.
- Sesgos: no disponible. Al heredarse de los modelos originales, se mantienen los sesgos de Kimi K2 y Base, pero no hay evaluacion especifica en este checkpoint.
- Alucinacion: riesgo no medido y probablemente agravado por la fusion, ya que no ha habido ajuste de alineacion posterior.
- Idiomas: el campo de idiomas esta vacio y no hay garantia de comportamiento multilingue ni de calidad en castellano.
- Licencia: `other` con nombre `modified-mit`, sin texto legal en la informacion disponible. Uso comercial, redistribucion y obligaciones de atribucion quedan sin determinar; hay que contactar con el autor antes de cualquier uso productivo.
- Procedencia y confianza: autor sin historial verificable en el repositorio, 0 descargas y 0 likes; `custom_code` obliga a ejecutar codigo del autor con `trust_remote_code=True`, lo que implica un riesgo de seguridad que debe auditarse antes de cargar el modelo.
- Coste: 6,9 TB de almacenamiento y un minimo de decenas de GPU de 80 GB hacen que cualquier experimento sea economicamente significativo.
- Fecha de publicacion futura respecto a la mayoria de referencias disponibles (2026-10-18), lo que impide contrastar con discusiones o informes de terceros.
- Sin informacion sobre tokenizer, plantilla de chat ni formato de herramientas: la integracion en aplicaciones conversacionales requeriria reingenieria y validacion manual.

## Enlaces

- HuggingFace: https://huggingface.co/Botob/k2-merged-3.5T-bf16

No se han encontrado enlaces adicionales relevantes: las busquedas web realizadas devolvieron unicamente perfiles de LinkedIn y redes sociales de personas homonimas sin relacion con el modelo, por lo que no se incluyen.
