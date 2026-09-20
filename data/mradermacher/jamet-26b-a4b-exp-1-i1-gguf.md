# mradermacher/Jamet-26B-A4B-EXP-1-i1-GGUF

## Resumen

Jamet-26B-A4B-EXP-1-i1-GGUF es un repositorio de cuantizaciones GGUF del modelo Hastagaras/Jamet-26B-A4B-EXP-1, publicado por el usuario mradermacher, especialista en la generacion de quants con imatrix. El repositorio no contiene el modelo original, sino versiones comprimidas de sus pesos en formato GGUF, pensadas para su ejecucion en llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, etc.). El modelo subyacente tiene 25.233.142.046 parametros (unos 25,2 mil millones) segun el recuento real de safetensors, y su nomenclatura ("26B-A4B") apunta a una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parametros activos por token, aunque este extremo no se confirma en la informacion disponible.

El modelo base es de tipo experimental ("EXP-1"), esta etiquetado como conversacional y la model card del repositorio de cuantizacion indica que se trata de un modelo con capacidad de vision, con archivos mmproj alojados en el repositorio de quants estaticos. El idioma declarado es unicamente el ingles. No se dispone de datos sobre licencia, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks.

La relevancia de esta ficha es fundamentalmente practica: permite conocer que cuantizaciones existen, cuanto ocupan y en que hardware se pueden ejecutar, dado que la informacion publica sobre el modelo base es muy escasa. Las versiones disponibles cubren desde 10,7 GB (i1-Q2_K) hasta formatos de mayor tamano, lo que abre la puerta a ejecucion en GPU de consumo y en CPU con offload parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura "A4B" sugiere mezcla de expertos con ~4B parametros activos, sin confirmar) |
| Parametros totales | 25.233.142.046 (~25,2B) segun safetensors del modelo base |
| Parametros activos | no disponible (inferido del nombre: ~4B, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1/imatrix: Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 90,3 GB |
| Modelo base | Hastagaras/Jamet-26B-A4B-EXP-1 |
| Cuantizador | mradermacher (con acceso a infraestructura de nicoboss) |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura del modelo base en la documentacion proporcionada. La model card del repositorio de cuantizacion se limita a indicar el proceso de cuantizacion y no describe el transformer, el esquema de atencion ni la composicion del dataset. El nombre del modelo, "26B-A4B", sigue la convencion habitual en modelos de mezcla de expertos (MoE), donde el primer numero indica los parametros totales y "A4B" los parametros activos por token; en este caso, el recuento real de safetensors (25,2B) es ligeramente inferior al "26B" nominal, lo que es coherente con un empaquetado redondeado. Esta interpretacion es una hipotesis razonable, no un dato confirmado.

En cuanto al entrenamiento, no se han publicado en la informacion disponible datos sobre numero de tokens, composicion del corpus, fases de ajuste (SFT, RLHF, DPO) ni innovaciones tecnicas. La unica caracteristica diferencial documentada es el proceso de cuantizacion: mradermacher ha generado los quants con imatrix (importance matrix), lo que mejora la calidad de las cuantizaciones de baja precision respecto a los metodos estaticos. La model card remite a una grafica comparativa de perplejidad de ikawrakow y al analisis de Artefact2 sobre calidad de quants, y ofrece tambien el archivo imatrix (0,2 GB) para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional: el modelo base esta etiquetado como "conversational" en el repositorio, lo que indica ajuste para dialogos multi-turno.
- Vision: la model card del repositorio de quants indica explicitamente que el modelo es de vision, con archivos mmproj (proyector multimodal) ubicados en el repositorio de quants estaticos.
- Razonamiento y codigo: no disponible; no hay informacion publicada sobre capacidades especificas en estas areas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas declarado.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones i1-Q4_K_S (15,6 GB) e i1-IQ3_M (12,5 GB) permiten ejecutar un modelo de ~25B parametros en tarjetas con 16-24 GB de VRAM, algo inviable con los pesos originales en precision completa.
- Experimentacion e investigacion en entornos sin acceso a clusters: la existencia de quants desde 10,7 GB facilita probar el modelo en portatiles con GPU de 12-16 GB o en CPU con offload parcial, reduciendo la barrera de entrada para evaluar un modelo experimental.
- Generacion de texto conversacional en ingles: dado el etiquetado "conversational" y el soporte declarado de ingles, es adecuado para asistentes de chat, resumen de documentos y redaccion asistida en ese idioma.
- Tareas multimodales basicas: al tratarse de un modelo de vision segun su model card, los archivos mmproj del repositorio estatico permiten experimentar con descripcion de imagenes o preguntas sobre imagenes, siempre que se combine con el proyector correcto.
- Prototipado de aplicaciones con llama.cpp y Ollama: el formato GGUF con cuantizacion imatrix esta soportado por el ecosistema llama.cpp, lo que simplifica la integracion en demos y prototipos sin necesidad de infraestructura de servidores GPU.
- Comparacion de calidad entre niveles de cuantizacion: el repositorio ofrece desde IQ1_S hasta Q6_K, lo que permite medir empiricamente la degradacion de perplejidad y de calidad de respuesta al bajar de bits por peso, util para decidir el punto de equilibrio tamano/calidad en produccion.
- Distribucion de modelos en entornos con almacenamiento limitado: las versiones de 10,7-15,6 GB son mucho mas faciles de transportar y cachear que el repositorio de 90,3 GB completo.
- Audicion y evaluacion de un modelo experimental antes de comprometerse con su version completa: al no haber benchmarks publicados, los quants permiten una evaluacion cualitativa rapida y de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo, su arquitectura ni evaluaciones comparativas; los unicos resultados obtenidos fueron paginas sin relacion con el ambito tecnico.

No se dispone, por tanto, de datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion estandar, ni de mediciones de perplejidad de las cuantizaciones concretas de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV y overhead; cifras aproximadas calculadas a partir del tamano de archivo, la VRAM real dependera de la longitud de contexto y del backend):
  - i1-Q2_K (10,7 GB): ~12 GB de VRAM.
  - i1-IQ3_XXS (11,4 GB): ~12-13 GB de VRAM.
  - i1-IQ3_M (12,5 GB): ~13-14 GB de VRAM.
  - i1-Q3_K_M (13,4 GB): ~14-15 GB de VRAM.
  - i1-Q4_K_S (15,6 GB): ~17-18 GB de VRAM.
  - Cuantizaciones mayores (Q5_K_M, Q6_K) disponibles sin tamano publicado: previsiblemente por encima de 18-20 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) para quants de 10,7-13,4 GB; A100 40/80 GB, H100 o L40S para servir varias instancias o contextos largos.
- Cabe en GPU de consumo: si, en las cuantizaciones i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M y, con margen mas ajustado, i1-Q3_K_M (12-16 GB). La i1-Q4_K_S requiere tarjetas de 24 GB o reparto GPU/CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF; vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponible. Si se confirma que la arquitectura es MoE con ~4B parametros activos, el throughput por token seria sustancialmente mayor que el de un modelo denso de 25B, pero esto no esta verificado.
- CPU y RAM: las cuantizaciones de 10,7-15,6 GB pueden ejecutarse en CPU con offload total o parcial en equipos con 16-32 GB de RAM, a costa de una latencia notablemente superior.

## Comparativa con modelos similares

Los datos del modelo comparado proceden de la documentacion publica de cada proyecto; los de Jamet-26B-A4B-EXP-1 provienen unicamente de la informacion disponible en su repositorio y estan marcados como no disponibles cuando no se conocen.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jamet-26B-A4B-EXP-1 (este) | ~25,2B | no disponible (nombre sugiere ~4B) | no disponible | no disponible | GGUF (imatrix y estatico) + safetensors del base |
| Qwen3-30B-A3B | ~30,5B | ~3,3B | 128K | Apache 2.0 | Safetensors, GGUF, multiples proveedores |
| Gemma 3 27B | ~27B | denso | 128K | Licencia Gemma | Safetensors, GGUF, Ollama |
| Mistral Small 3.1 24B | ~24B | denso | 128K | Apache 2.0 | Safetensors, GGUF, vLLM |

La comparacion de rendimiento no es posible: no hay benchmarks publicados de Jamet-26B-A4B-EXP-1 en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada, por lo que no se puede afirmar su calidad relativa frente a alternativas consolidadas.
- Licencia no disponible: sin licencia declarada no se puede confirmar si el uso comercial esta permitido. Conviene contactar con el autor del modelo base antes de cualquier despliegue en produccion.
- Modelo experimental: el sufijo "EXP-1" indica caracter experimental; no hay garantias de mantenimiento, soporte ni estabilidad de la version.
- Idioma unico: solo ingles declarado. El rendimiento en castellano no esta verificado y probablemente sea limitado.
- Longitud de contexto desconocida: no se puede dimensionar el consumo de cache KV ni planificar casos de uso con documentos largos.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en este caso por falta de evaluaciones.
- Degradacion por cuantizacion: las versiones de menor tamano (Q2_K, IQ2_*, IQ1_*) pueden degradar de forma apreciable la coherencia y la fidelidad de las respuestas. En cuantizaciones de 2-3 bits es habitual observar perdida de calidad en tareas de razonamiento.
- Vision condicionada: los archivos mmproj estan en el repositorio de quants estaticos, no en este; es necesario descargarlos por separado y verificar la compatibilidad con la version de llama.cpp.
- Riesgo de sesgos: no evaluado ni documentado por el autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Repositorio de 90,3 GB: la descarga completa es costosa en ancho de banda y almacenamiento; conviene seleccionar una sola cuantizacion.

## Enlaces

- Repositorio HuggingFace (cuantizaciones imatrix): https://huggingface.co/mradermacher/Jamet-26B-A4B-EXP-1-i1-GGUF
- Repositorio de cuantizaciones estaticas (incluye mmproj de vision): https://huggingface.co/mradermacher/Jamet-26B-A4B-EXP-1-GGUF
- Pagina de resumen y lista de descargas del cuantizador: https://hf.tst.eu/model#Jamet-26B-A4B-EXP-1-i1-GGUF
- Modelo base: https://huggingface.co/Hastagaras/Jamet-26B-A4B-EXP-1
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
