# mradermacher/roberta-base-nvidia-aegis-v2-augmented-GGUF

## Resumen

Este repositorio contiene versiones cuantizadas en formato GGUF del modelo `leomaurodesenv/roberta-base-nvidia-aegis-v2-augmented`, publicadas por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de un paquete de conversión y cuantización estática del modelo base original, que a su vez deriva de la arquitectura `roberta-base`: un transformer encoder-only de 124.645.634 parámetros (aproximadamente 125 millones) orientado a extracción de características y clasificación de texto en inglés.

El interés práctico del repositorio es de despliegue: al ofrecer el modelo en GGUF con doce niveles de cuantización distintos, permite ejecutar un encoder de 125 millones de parámetros en CPU, en GPUs de gama baja o incluso en dispositivos embebidos, con ficheros que van de 0,2 GB (Q2_K, Q3_K_S, IQ4_XS, Q4_K_M, etc.) a 0,4 GB (f16). Esto lo hace apto para tareas de inferencia masiva donde el coste por token importa más que la calidad absoluta, como filtrado previo, clasificación por lotes o anotación de datasets.

La relevancia del modelo está limitada por su escasa documentación: la model card del repositorio de cuantizaciones no describe el dataset de entrenamiento, el proceso de ajuste fino ni métricas de evaluación, y el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha. El nombre del modelo base sugiere un ajuste sobre datos de la familia NVIDIA Aegis (contenido de seguridad), pero esto no está confirmado en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only, familia RoBERTa-base (no es MoE, no es SSM ni híbrida) |
| Parámetros totales | 124.645.634 (dato de safetensors del modelo base) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens de entrada (límite canónico de roberta-base; no confirmado de forma explícita en la información disponible) |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, IQ4_XS, Q2_K (solo cuantizaciones estáticas; no hay cuantizaciones ponderadas ni con imatrix) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (repositorio cuantizado). El modelo base original se distribuye en formato PyTorch/safetensors |
| Tarea declarada | Etiqueta `feature-extraction`; el campo `pipeline` figura como no disponible |
| Tamaño del repositorio | 1,2 GB en total |
| Ficheros GGUF | 12 (0,2 GB cada uno salvo f16, que ocupa 0,4 GB) |
| Idiomas adicionales | No disponible |
| Fecha de creación del repositorio | 2026-09-17 |

## Arquitectura y entrenamiento

El modelo base es un encoder de la familia RoBERTa. La configuración canónica de `roberta-base` corresponde a 12 capas de transformer, 768 dimensiones ocultas, 12 cabezas de atención, un vocabulario BPE de 50.265 tokens y un máximo de 512 tokens de entrada (514 posiciones en la embedding de posiciones). Esta configuración es coherente con el recuento de parámetros reportado (124.645.634), pero no está verificada de forma explícita en la información disponible, por lo que debe tratarse como la configuración esperada de la arquitectura de referencia.

No hay información sobre el entrenamiento del modelo base: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Por la naturaleza encoder-only del modelo, no cabe esperar un ajuste por preferencias humanas al estilo de los modelos generativos; lo habitual en esta familia es un ajuste supervisado sobre una tarea concreta de clasificación o regresión. El sufijo `nvidia-aegis-v2-augmented` apunta a un ajuste sobre datos de seguridad de contenido, pero esta afirmación es una inferencia a partir del nombre y no está respaldada por documentación en la información proporcionada.

El trabajo del cuantizador consiste en la conversión del checkpoint original a GGUF y su cuantización estática. Los metadatos internos del repositorio indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. El autor señala explícitamente que no ha generado cuantizaciones ponderadas ni con matriz de importancia (`imatrix`) y que, si no aparecen en una semana aproximadamente, probablemente no las planee; estas pueden solicitarse vía discusión comunitaria.

## Capacidades

- Extracción de características: el modelo produce representaciones contextuales por token y por secuencia, aptas para alimentar cabezas de clasificación, sistemas de recuperación o agrupamiento semántico.
- Clasificación de texto: como encoder afinado, el uso previsto es la clasificación de secuencias cortas (una etiqueta o un conjunto de etiquetas por entrada), aunque la tarea exacta del ajuste fino no está documentada.
- Comprensión lectora y NLI: capacidades potenciales de la arquitectura de referencia, no verificadas en este repositorio.
- Multilingüismo: no. El modelo declara únicamente inglés.
- Generación de texto: no. Al ser encoder-only carece de decodificador y no puede generar texto libre.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible.

## Casos de uso

Los escenarios siguientes asumen el uso típico de un encoder RoBERTa-base afinado para clasificación o extracción de representaciones, dado que la información disponible no documenta la tarea exacta del ajuste fino.

- Moderación de contenido en inglés: si el ajuste corresponde efectivamente a datos de seguridad, el modelo puede puntuar comentarios, publicaciones o mensajes en busca de contenido no permitido. Su tamaño de 125 millones de parámetros permite ejecutarlo en CPU y procesar grandes volúmenes sin coste de GPU.
- Filtrado previo en pipelines de moderación con LLM: usar la versión cuantizada Q4_K_M como primera barrera que descarta el tráfico claramente benigno y reserva el LLM generativo (mucho más caro) para los casos ambiguos.
- Clasificación de intención en asistentes conversacionales: asignar cada consulta entrante a una intención predefinida antes de enrutarla al modelo generativo o al sistema de recuperación adecuado, con latencias de milisegundos.
- Anotación de datasets a gran escala: etiquetar corpus de cientos de miles de frases en máquinas sin GPU usando el fichero Q8_0, útil para construir conjuntos de entrenamiento o para preetiquetar y revisar después con anotadores humanos.
- Detección de spam y abuso en formularios y correo: clasificador binario de bajo coste integrado en el backend, ejecutable en el mismo servidor de aplicación sin necesidad de tarjeta gráfica.
- Enrutamiento y filtrado en sistemas RAG: clasificar la consulta del usuario o filtrar pasajes candidatos antes de pasarlos al reranker, reduciendo el número de documentos que llegan al modelo de reranking.
- Extracción de embeddings para búsqueda semántica ligera: en escenarios donde no se dispone de GPU, emplear las representaciones del encoder cuantizado como vectorizador para índices de documentos pequeños o medianos.
- Clasificación por lotes en investigación: evaluar hipótesis lingüísticas sobre corpus etiquetados, aprovechando que el coste de inferencia es despreciable frente a un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones se limita a listar los ficheros GGUF, enlazar una gráfica genérica de perplejidad frente a tipos de cuantización y remitir a la documentación de TheBloke sobre el uso de GGUF. No incluye MMLU, GLUE, HumanEval, GSM8K ni ninguna otra métrica del modelo base, y la búsqueda web realizada no ha devuelto resultados relevantes (los enlaces recuperados corresponden a portales de compraventa de vehículos y no guardan relación con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en todos los casos. Los ficheros cuantizados ocupan 0,2 GB (Q2_K a Q8_0) y 0,4 GB (f16), a los que hay que sumar el contexto y las activaciones, muy reducidos con 512 tokens de entrada.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria, incluidas iGPU integradas y aceleradores de placa única. Una RTX 4090 o una RTX 3060 están enormemente sobredimensionadas para este modelo.
- GPU de centro de datos: A100, H100 o similares no aportan ninguna ventaja significativa; el modelo es demasiado pequeño para aprovechar su ancho de banda y su capacidad de cómputo.
- Ejecución en CPU: plenamente viable. Es el escenario natural para las cuantizaciones Q4_K_M o Q8_0, que el autor marca como "fast, recommended" y "fast, best quality" respectivamente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF para los ficheros cuantizados. Para el modelo base original en safetensors se puede usar la librería transformers; los servidores de alto rendimiento como vLLM o TGI no admiten GGUF, por lo que solo servirían con el checkpoint original.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones en la información proporcionada.
- Nota sobre calidad: las cuantizaciones Q2_K y Q3_K degradan apreciablemente la fidelidad de las representaciones. Para tareas de clasificación sensibles se recomienda Q5_K_M, Q6_K o Q8_0.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que la comparación se limita a parámetros, contexto, licencia, formato y disponibilidad. Los datos de los modelos alternativos corresponden a sus configuraciones canónicas conocidas.

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| roberta-base-nvidia-aegis-v2-augmented (GGUF) | 124,6 M | 512 tokens | MIT | GGUF (12 cuantizaciones) | Ajuste específico sin documentar; 0 descargas y 0 likes |
| roberta-base | 125 M | 512 tokens | MIT | safetensors, PyTorch | Modelo de propósito general, ampliamente validado en GLUE y SuperGLUE |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | safetensors, PyTorch | Alternativa clásica; licencia más permisiva en cuanto a patentes |
| microsoft/deberta-v3-base | 184 M | 512 tokens | MIT | safetensors, PyTorch | Mayor coste computacional a cambio de mejor rendimiento típico en tareas NLU |

No disponible: comparación de rendimiento en benchmarks entre estas alternativas, al no existir métricas publicadas para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Modelo encoder-only: no genera texto, no mantiene conversaciones multi-turno y no soporta tool calling ni flujos de agente. Cualquier expectativa de uso como chatbot es incorrecta.
- Idioma: únicamente inglés. El rendimiento en castellano o en otros idiomas no está documentado y previsiblemente será pobre.
- Contexto limitado a 512 tokens: los documentos largos deben trocearse antes de la inferencia, lo que puede degradar tareas que requieren contexto global.
- Documentación inexistente sobre el entrenamiento: no se conocen el dataset, el número de tokens, el procedimiento de ajuste ni las métricas obtenidas. Esto impide auditar sesgos o evaluar la idoneidad del modelo para una tarea concreta.
- Sesgos potenciales: si el ajuste se realizó sobre datos de seguridad de contenido, es esperable que herede los sesgos de anotación de ese corpus (falsos positivos sobre determinados dialectos, registros o grupos demográficos). Esta posibilidad no está verificada en la información disponible.
- Riesgo de clasificación errónea: en tareas de clasificación, el fallo se manifiesta como falsos positivos y falsos negativos, no como alucinación generativa. Aun así, el modelo puede producir puntuaciones con alta confianza en entradas fuera de dominio.
- Degradación por cuantización: los ficheros Q2_K, Q3_K_S, Q3_K_M y Q3_K_L son los más agresivos y pueden alterar las representaciones de forma notable. El propio autor etiqueta Q3_K_M como "lower quality".
- Ausencia de cuantizaciones ponderadas o con imatrix: no hay calibración con datos para reducir el error de cuantización, lo que limita la calidad alcanzable en los niveles bajos.
- Validación comunitaria nula: 0 descargas y 0 likes. No existe evidencia de uso en producción ni informes independientes de calidad.
- Licencia: MIT en el repositorio de cuantizaciones, lo que permite uso comercial y modificación. No obstante, conviene verificar las condiciones del modelo base original y de los datos empleados en el ajuste antes de un despliegue comercial, ya que la información disponible no detalla la procedencia del dataset.
- Naturaleza del repositorio: es un paquete de cuantizaciones, no un modelo original. Cualquier cita o atribución debería dirigirse al modelo base `leomaurodesenv/roberta-base-nvidia-aegis-v2-augmented`.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/roberta-base-nvidia-aegis-v2-augmented-GGUF
- Modelo base: https://huggingface.co/leomaurodesenv/roberta-base-nvidia-aegis-v2-augmented
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#roberta-base-nvidia-aegis-v2-augmented-GGUF
- Guía de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa que cede la infraestructura al cuantizador: https://www.nethype.de/
- Papers, blogs o demos adicionales: no disponible. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
