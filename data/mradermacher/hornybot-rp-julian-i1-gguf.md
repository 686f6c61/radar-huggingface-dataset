# mradermacher/Hornybot-RP-Julian-i1-GGUF

## Resumen

Hornybot-RP-Julian-i1-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por mradermacher a partir del modelo axiomofmind/Hornybot-RP-Julian, un modelo afinado para roleplay conversacional de contenido para adultos. El repositorio no contiene pesos en precisión completa, sino una colección de variantes cuantizadas con llama.cpp pensadas para ejecución local en hardware de consumo, desde IQ1_S (2,8 GB) hasta Q6_K (7,5 GB). El tamaño completo del repositorio, sumando todas las variantes más el fichero imatrix, es de 110,2 GB.

El modelo base tiene 8.953.803.264 parámetros (unos 8,95 mil millones) y está etiquetado por el cuantizador dentro de la familia Qwen3.5, lo que sitúa el modelo en el segmento de 8B-9B, muy habitual para inferencia en una única GPU de consumo o incluso en CPU con memoria suficiente. La model card no documenta la arquitectura interna, la longitud de contexto ni el proceso de entrenamiento, por lo que esos datos figuran como no disponibles en esta ficha.

La relevancia de esta publicación es fundamentalmente práctica: mradermacher genera cuantizaciones con matriz de importancia (imatrix) a partir del modelo original, lo que permite elegir un compromiso concreto entre tamaño en disco y calidad de salida. El repositorio está orientado a un nicho muy específico (roleplay para adultos en inglés) y no incluye licencia declarada ni resultados de benchmarks, dos factores que condicionan cualquier evaluación seria de su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; la model card no la especifica. Las etiquetas del repositorio indican familia Qwen3.5 |
| Parámetros totales | 8.953.803.264 (~8,95 B), dato derivado de los safetensors del modelo base |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; además de un fichero imatrix (0,1 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp). El modelo base publica safetensors, según el recuento de parámetros |
| Tamaño del repositorio | 110,2 GB (conjunto de todas las variantes) |
| Pipeline declarado | no disponible |
| Tipo de cuantización | Weighted/imatrix, con quantize_version 2 y output_tensor_quantised 1 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna del modelo base más allá de la etiqueta «qwen3.5» que figura en los tags del repositorio. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro tipo de alineamiento. Tampoco se especifica la longitud de contexto soportada. Todo lo anterior debe considerarse no disponible.

Lo que sí está documentado es el proceso de cuantización, que es el objeto real de este repositorio. mradermacher ha generado las variantes con *weighted/imatrix quants*, es decir, cuantizaciones guiadas por una matriz de importancia calculada sobre el modelo original, con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. La model card incluye además una nota genérica del autor según la cual el modelo podría ser multimodal («this is a vision model»), con ficheros mmproj alojados, si existen, en el repositorio estático hermano. Esta afirmación no se puede verificar con los datos disponibles y debe tratarse como no confirmada.

El repositorio distingue dos familias: las cuantizaciones i1 (este repositorio) y las cuantizaciones estáticas, publicadas por separado en mradermacher/Hornybot-RP-Julian-GGUF. Las i1 suelen ofrecer mejor relación calidad/tamaño que las estáticas del mismo rango.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay y ficción interactiva.
- Mantenimiento de personaje y estilo narrativo a lo largo de una conversación, según el propósito declarado del modelo base.
- Contenido para adultos (etiquetas `adult` y `roleplay`): el modelo está afinado explícitamente para este dominio.
- Idioma: únicamente inglés declarado (`language: en`).
- Memoria y coherencia de contexto: depende de la ventana real del modelo base, que no está documentada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión: mencionadas de forma genérica en la plantilla del cuantizador, no confirmadas para este modelo concreto.
- Modo «thinking» explícito: no disponible.

## Casos de uso

- Motores de roleplay conversacional local: el modelo se puede cargar en llama.cpp u Ollama con una cuantización Q4_K_M (5,7 GB) y mantener diálogos multi-turno con personajes persistentes en una GPU de consumo.
- Escritura creativa asistida por IA: generación de narrativa de ficción para adultos con control de estilo mediante system prompt, usando Q5_K_M o Q6_K cuando la calidad de prosa sea prioritaria sobre la velocidad.
- Investigación sobre fine-tuning en dominios de nicho: el modelo base sirve como caso de estudio de cómo un ajuste muy especializado (roleplay para adultos) se comporta tras cuantizaciones agresivas IQ1/IQ2, útil para medir degradación en tareas de estilo.
- Evaluación de degradación por cuantización: el repositorio ofrece 25 variantes del mismo modelo, lo que permite comparar sistemáticamente la pérdida de calidad de IQ1_S (2,8 GB) a Q6_K (7,5 GB) sobre el mismo conjunto de prompts.
- Despliegue en hardware sin GPU: las variantes IQ2 e IQ3 (3,2-4,5 GB) caben en máquinas con 8 GB de RAM y permiten ejecución por CPU con llama.cpp, a costa de una calidad notablemente inferior.
- Base para pipelines de personajes en entornos controlados: integración vía llama-cpp-python o servidor compatible con la API de OpenAI para prototipos de chatbots de entretenimiento, siempre con moderación externa obligatoria.
- Pruebas de cuantización personalizada: el fichero imatrix incluido (0,1 GB) permite generar cuantizaciones propias con llama.cpp adaptadas a un presupuesto de memoria concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y los resultados de búsqueda web recuperados no contienen datos técnicos sobre el modelo.

## Requisitos de hardware

Todas las cifras de VRAM son estimaciones derivadas del tamaño de los ficheros GGUF publicados, asumiendo overhead de runtime y caché KV para contextos moderados. La ventana de contexto real no está documentada, por lo que el consumo de caché KV no se puede calcular con precisión.

- IQ1_S (2,8 GB): viable en GPU con 4 GB de VRAM o en CPU con 8 GB de RAM.
- IQ2_M (3,7 GB) / IQ3_M (4,5 GB): GPU de 6 GB de VRAM; GTX 1660, RTX 2060, RTX 3050.
- Q4_K_M (5,7 GB, recomendada por el autor): GPU de 8 GB de VRAM; RTX 3060 Ti, RTX 4060, RTX 2070.
- Q5_K_M (6,6 GB): GPU de 8-10 GB de VRAM; RTX 3080, RTX 4070.
- Q6_K (7,5 GB): GPU de 10-12 GB de VRAM; RTX 3080 Ti, RTX 4070 Ti, RTX 4080.
- Modelo completo en fp16: aproximadamente 17,9 GB, requiere GPU de 24 GB (RTX 3090, RTX 4090, A100 40 GB) o reparto CPU/GPU.
- GPU de centro de datos: A100 y H100 permiten cargar cualquier variante en VRAM junto con contextos largos, aunque el modelo es pequeño para justificar ese hardware salvo por concurrencia.
- Opciones de despliegue: llama.cpp, Ollama, koboldcpp, LM Studio, llama-cpp-python y text-generation-webui. El soporte de GGUF en vLLM es limitado y no se recomienda como opción principal.
- Latencia y throughput: no disponibles. Como referencia cualitativa, las variantes IQ2/IQ3 en CPU ofrecen velocidad de lectura de tokens muy baja, mientras que Q4_K_M en una GPU de 8 GB permite uso interactivo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos en la información proporcionada, por lo que la comparación con terceros figura como no disponible. La única comparación verificable es entre las distintas publicaciones del mismo modelo:

| Publicación | Formato | Tamaño / variantes | Licencia | Notas |
|---|---|---|---|---|
| mradermacher/Hornybot-RP-Julian-i1-GGUF | GGUF (imatrix) | 25 variantes, 2,8-7,5 GB; repo de 110,2 GB | no disponible | Cuantizaciones guiadas por matriz de importancia |
| mradermacher/Hornybot-RP-Julian-GGUF | GGUF (estáticas) | no disponible en esta consulta | no disponible | Cuantizaciones estáticas; aloja los ficheros mmproj si existen |
| axiomofmind/Hornybot-RP-Julian | safetensors | 8,95 B parámetros | no disponible | Modelo base sin cuantizar |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial. Cualquier uso en producción exige aclarar antes los términos con el autor del modelo base.
- Contenido para adultos: el modelo está ajustado explícitamente para roleplay sexual y puede generar material inapropiado de forma espontánea. Requiere moderación externa obligatoria si se expone a usuarios.
- Sesgos: no hay información publicada sobre la composición del dataset de entrenamiento ni sobre evaluación de sesgos. Un corpus de roleplay para adultos tiende a sobrerrepresentar determinados estereotipos, pero no se puede cuantificar con los datos disponibles.
- Alucinación: no evaluada. En modelos pequeños ajustados para ficción, la tasa de invención de hechos es alta y no debe usarse para tareas de recuperación factual.
- Idioma: solo inglés declarado. El rendimiento en castellano es desconocido y probablemente degradado respecto al inglés.
- Contexto: la longitud de ventana no está documentada, lo que impide planificar arquitecturas de memoria a largo plazo.
- Degradación por cuantización: las variantes IQ1_S, IQ1_M e IQ2_XXS, descritas por el propio autor como «for the desperate» o de calidad muy baja, no son adecuadas para uso real; IQ3_XXS y Q2_K_S aparecen marcadas como de calidad inferior.
- Fecha de creación del repositorio: 2026-09-15 según los metadatos de HuggingFace, posterior a la fecha habitual de consulta. Conviene verificar el estado del repositorio al reutilizarlo.
- Sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Capacidad multimodal incierta: la nota sobre visión proviene de una plantilla genérica del cuantizador y no está confirmada para este modelo.

## Enlaces

- Repositorio HuggingFace (cuantizaciones i1): https://huggingface.co/mradermacher/Hornybot-RP-Julian-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Hornybot-RP-Julian-GGUF
- Modelo base: https://huggingface.co/axiomofmind/Hornybot-RP-Julian
- Página de descarga del cuantizador para este modelo: https://hf.tst.eu/model#Hornybot-RP-Julian-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Hornybot-RP-Julian-i1-GGUF/resolve/main/Hornybot-RP-Julian.imatrix.gguf
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafo comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/

Nota: los resultados de búsqueda web disponibles para esta consulta no contienen enlaces técnicos relacionados con el modelo, el paper o el dataset; no se han incluido por no ser pertinentes.
