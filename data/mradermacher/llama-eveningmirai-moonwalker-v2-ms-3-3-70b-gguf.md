# mradermacher/Llama-EveningMirai-Moonwalker-v2-MS-3.3-70B-GGUF

## Resumen

Llama-EveningMirai-Moonwalker-v2-MS-3.3-70B-GGUF es la distribucion en formato GGUF del modelo fusionado (merge) KaraKaraModel/Llama-EveningMirai-Moonwalker-v2-MS-3.3-70B, publicada por el cuantizador mradermacher. No se trata de un modelo entrenado desde cero, sino de una fusion de modelos derivada de la familia Llama, con 70.553.706.560 parametros totales (aproximadamente 70B) y orientada a uso conversacional en ingles. El repositorio ofrece unicamente pesos cuantizados estaticos (sin versiones ponderadas/imatrix, que se publican en un repositorio separado).

El valor practico de esta publicacion es la disponibilidad de cuantizaciones K-quant en un rango que va de 26,5 GB (Q2_K) a 75,1 GB (Q8_0), lo que permite ejecutar un modelo de 70B en hardware que no podria alojar los pesos en precision completa (unos 141 GB en FP16). Esto lo hace relevante para desarrolladores que quieren probar un merge de 70B en estaciones de trabajo con una o dos GPU de gran capacidad de VRAM, o incluso en configuraciones de CPU con suficiente RAM.

La informacion publicada por el autor es muy escasa: no se detallan datos de entrenamiento, composicion del dataset, longitud de contexto ni licencia. La model card se limita a listar los ficheros cuantizados y a remitir a la documentacion generica de mradermacher sobre como usar GGUF. Cualquier evaluacion de calidad debe hacerse, por tanto, de forma empirica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama; detalles del merge no disponibles) |
| Parametros totales | 70.553.706.560 (aproximadamente 70B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un merge generado con mergekit (etiquetas `mergekit` y `merge` en el repositorio) a partir de modelos de la familia Llama, segun indica el nombre y la nomenclatura del autor original (KaraKaraModel). No se dispone de informacion sobre la receta de fusion (que modelos se combinaron, con que metodo de merge ni con que pesos), ni sobre si hubo entrenamiento adicional, RLHF o DPO tras la fusion. Tampoco se documentan el numero de tokens de entrenamiento ni la composicion del dataset.

La publicacion de mradermacher es puramente de cuantizacion: transforma los pesos del modelo base a formato GGUF mediante herramientas de conversion a HF y genera cuantizaciones estaticas K-quant e IQ. No introduce cambios arquitectonicos propios. La model card indica que las versiones ponderadas/imatrix, de calidad potencialmente superior, se alojan en el repositorio `mradermacher/Llama-EveningMirai-Moonwalker-v2-MS-3.3-70B-i1-GGUF`.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento y respuesta multi-turno: el uso previsto es el dialogo, aunque no hay evaluaciones publicadas que lo confirmen.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia compatibles con Hugging Face.
- Ejecucion local mediante llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- Capacidades de codigo, matematicas, vision, tool calling o agentes: no disponibles en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se documentan otros idiomas.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo y usarse para validar flujos de dialogo multi-turno antes de invertir en infraestructura mayor.
- Experimentacion con merges de 70B: util para investigadores que quieran comparar el comportamiento de un merge comunitario frente a modelos base de Llama, con la ventaja de disponer de cuantizaciones listas para usar.
- Inferencia en hardware con VRAM limitada: la cuantizacion Q4_K_M (42,6 GB) permite ejecutar un 70B en una unica GPU de 48 GB (A6000, L40S) o en dos GPU de 24 GB (RTX 4090) con reparto de capas.
- Despliegue en servidores sin GPU: las cuantizaciones Q2_K y Q3_K_S (26,5-31 GB) pueden ejecutarse en CPU con suficiente RAM, adecuado para pruebas internas o entornos de desarrollo.
- Generacion de texto creativo y redaccion en ingles: uso conversacional general donde la calidad estilistica del merge sea el criterio principal y no se requieran garantias de exactitud.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un rango completo de Q2 a Q8, lo que permite medir el impacto de la cuantizacion en la perplejidad y la calidad de salida sobre un mismo modelo.
- Base para fine-tuning posterior: los pesos del modelo base en safetensors pueden servir como punto de partida para ajuste supervisado, aunque la licencia no documentada debe aclararse antes de un uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K 26,5 GB; Q3_K_S 31,0 GB; Q3_K_M 34,4 GB; Q3_K_L 37,2 GB; IQ4_XS 38,4 GB; Q4_K_S 40,4 GB; Q4_K_M 42,6 GB; Q5_K_S 48,8 GB; Q5_K_M 50,0 GB; Q6_K 58,0 GB; Q8_0 75,1 GB (tamanos de fichero indicados por el autor).
- Precision completa (FP16): aproximadamente 141 GB, no incluida en este repositorio.
- GPU recomendadas: para Q4_K_M, una GPU de 48 GB (A6000, L40S, A100 80 GB con margen amplio) o dos GPU de 24 GB (RTX 4090) con offload por capas. Para Q8_0, se necesita al menos 80 GB de VRAM (A100 80 GB o H100) o reparto entre varias GPU.
- Cabe en GPU consumer: si, con cuantizaciones bajas y reparto entre dos RTX 4090 (24 GB cada una) para Q2_K a Q4_K_M; una unica RTX 4090 de 24 GB no es suficiente para ninguna de las cuantizaciones publicadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI si la arquitectura Llama es compatible.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y el backend. Como referencia cualitativa, el autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-EveningMirai-Moonwalker-v2-MS-3.3-70B-GGUF (este) | 70,5B | no disponible | GGUF | no disponible | Merge comunitario, solo ingles, sin benchmarks publicados |
| Llama-3.3-70B-Instruct (Meta) | 70,6B | 128K (segun documentacion oficial de Meta) | safetensors, GGUF (comunidad) | Llama 3.3 Community License | Modelo oficial con evaluaciones publicadas y soporte multilingue |
| Qwen2.5-72B-Instruct | 72,7B | 128K (segun documentacion oficial de Qwen) | safetensors, GGUF (comunidad) | Apache 2.0 (segun Qwen) | Alternativa de tamano similar con licencia permisiva |
| Mistral-Large-Instruct | 123B | 128K (segun documentacion de Mistral) | safetensors | Mistral Research License | Mayor numero de parametros; requiere mas VRAM |

La comparacion con Llama-3.3-70B-Instruct es la mas directa por tamano y familia, pero conviene senalar que este merge no documenta su procedencia exacta ni su licencia, por lo que la sustitucion en produccion exige verificar primero los terminos legales del modelo base.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible consultar la licencia del modelo base (KaraKaraModel/Llama-EveningMirai-Moonwalker-v2-MS-3.3-70B) antes de cualquier despliegue en produccion.
- Modelo solo en ingles: no se documenta soporte de castellano ni de otros idiomas, por lo que la calidad fuera del ingles es incierta.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o codigo; la evaluacion debe ser empirica.
- Merge sin documentacion de receta: al desconocerse los modelos combinados y el metodo de fusion, el comportamiento puede ser erratico en tareas especificas y es dificil atribuir fallos a una causa concreta.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; sin evaluaciones no se puede acotar su magnitud.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente el limite efectivo.
- Cuantizaciones bajas (Q2_K, Q3_K) degradan la calidad de forma notable; el autor solo recomienda explicitamente Q4_K_S, Q4_K_M, Q6_K y Q8_0.
- Repositorio de gran tamano (481,3 GB en total): la descarga de todas las cuantizaciones no es practica; conviene descargar solo la variante necesaria.
- Popularidad muy baja (59 descargas, 0 likes en el momento de la consulta): escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-EveningMirai-Moonwalker-v2-MS-3.3-70B-GGUF
- Modelo base: https://huggingface.co/KaraKaraModel/Llama-EveningMirai-Moonwalker-v2-MS-3.3-70B
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Llama-EveningMirai-Moonwalker-v2-MS-3.3-70B-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Llama-EveningMirai-Moonwalker-v2-MS-3.3-70B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
