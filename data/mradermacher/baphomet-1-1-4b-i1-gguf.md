# mradermacher/Baphomet-1.1-4B-i1-GGUF

## Resumen

Baphomet-1.1-4B-i1-GGUF es una distribucion de cuantizaciones GGUF generadas por mradermacher a partir del modelo base CloudGoat/Baphomet-1.1-4B. El modelo original es un merge evolutivo (evogm) que combina task vectors y linear merges sobre una base de la familia Qwen 3.5, con capacidades de vision-language. Esta version concreta no es un modelo nuevo, sino un paquete de ficheros GGUF con cuantizaciones ponderadas e imatrix pensadas para inferencia local eficiente.

El interes practico reside en que mradermacher publica un conjunto amplio de niveles de cuantizacion (desde IQ1_S hasta Q6_K, pasando por Q4_K_M, IQ4_XS, Q3_K_L y variantes intermedias), lo que permite desplegar el modelo en hardware muy diverso, desde GPUs de consumo con poca VRAM hasta servidores. Al tratarse de una distribucion derivada, la licencia Apache 2.0 del modelo base se mantiene.

La ficha tecnica disponible es escasa: el repositorio GGUF no incluye pipeline declarado, no publica resultados de benchmarks y el recuento de parametros en safetensors del modelo base (1.797.272) es inconsistente con la denominacion "4B", por lo que debe tratarse con cautela. La mayor parte de los datos de arquitectura y entrenamiento se desconocen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen 3.5, segun tags del modelo); merge evolutivo con task vectors y linear merge |
| Parametros totales | 1.797.272 segun safetensors del modelo base (inconsistente con la denominacion "4B"; dato no fiable) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M (ponderadas/imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors via transformers |

## Arquitectura y entrenamiento

El modelo base Baphomet-1.1-4B se describe mediante tags como "merge", "evogm", "evolutionary-merge", "task-vector" y "linear-merge", lo que indica que no fue entrenado desde cero sino construido combinando pesos de otros modelos mediante tecnicas de merging evolutivo y suma de task vectors. La referencia a "qwen3_5" sugiere que la arquitectura subyacente pertenece a la familia Qwen 3.5, y el tag "vision-language" indica que incorpora un componente multimodal (proyector de vision, con ficheros mmproj asociados en el repositorio estatico).

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Esta version i1-GGUF aplica cuantizacion ponderada con fichero imatrix, lo que tipicamente mejora la calidad de las cuantizaciones de baja precision frente a cuantizaciones estaticas.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Capacidades de vision-language segun el tag del modelo base (procesamiento de imagenes junto a texto); los ficheros mmproj, si existen, se alojan en el repositorio estatico.
- Razonamiento y respuesta conversacional heredados de la base Qwen 3.5 (no verificado con benchmarks).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en equipos de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en GPUs con 4-8 GB de VRAM mediante llama.cpp u Ollama, util para prototipado offline.
- Experimentacion con merges evolutivos: investigadores que quieran reproducir o comparar el efecto del merging sobre Qwen 3.5 pueden usar estas cuantizaciones para evaluaciones rapidas sin cargar pesos completos.
- Procesamiento de imagenes y texto en local: si se dispone del mmproj del repositorio estatico, el modelo puede emplearse en tareas de descripcion de imagenes o VQA en ingles sobre hardware modesto.
- Despliegue en entornos con recursos limitados: las variantes IQ2/IQ3 permiten ejecucion en CPU o GPUs de gama baja, adecuadas para demos y pruebas de concepto.
- Evaluacion comparativa de cuantizaciones: el amplio conjunto de niveles (de IQ1_S a Q6_K) facilita estudios de degradacion de calidad frente a tamano.
- Generacion de texto en ingles para tareas auxiliares: resumenes, reescritura o clasificacion simple en pipelines donde el coste por token importa mas que la precision absoluta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de ~4B en GGUF, las cuantizaciones Q4_K_M suelen requerir en torno a 2,5-3 GB y las Q6_K alrededor de 3,5-4 GB, aunque estas cifras son estimaciones generales y no datos publicados para este modelo.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: previsiblemente si en modelos con 6-8 GB o mas para cuantizaciones Q4/Q5; las variantes IQ2/IQ3 podrian caber en GPUs de 4 GB, sin confirmacion oficial.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base es compatible con transformers. No se documenta soporte explicito de vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Baphomet-1.1-4B-i1-GGUF | 1.797.272 (segun safetensors; no fiable) | no disponible | apache-2.0 | GGUF | Merge evolutivo de Qwen 3.5 con vision; sin benchmarks |
| Qwen 2.5 / 3 base (4B aprox.) | ~4B (segun variante) | no disponible | Apache 2.0 (segun variante) | safetensors, GGUF | Modelo original de referencia; el merge parte de esta familia |
| Otros merges GGUF de mradermacher | variable | no disponible | segun base | GGUF | Misma metodologia de cuantizacion imatrix |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El recuento de parametros en safetensors (1.797.272) es incompatible con la etiqueta "4B"; el dato debe considerarse erroneo o incompleto y no debe usarse para estimar requisitos.
- Modelo unicamente en ingles; no apto para produccion multilingue.
- Al ser un merge evolutivo sin benchmarks publicados, su calidad real frente al modelo base es desconocida.
- Riesgo de alucinacion y sesgos heredados de los modelos combinados; no documentados.
- Sin informacion sobre contexto maximo, tool calling ni soporte de agentes; no recomendable para flujos agenticos en produccion sin validacion previa.
- El repositorio GGUF no incluye pipeline declarado ni ficheros mmproj (estos, si existen, estan en el repositorio estatico enlazado).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos constituyentes del merge, no documentadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Baphomet-1.1-4B-i1-GGUF
- Modelo base: https://huggingface.co/CloudGoat/Baphomet-1.1-4B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Baphomet-1.1-4B-GGUF
- Pagina de descarga del autor: https://hf.tst.eu/model#Baphomet-1.1-4B-i1-GGUF
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
